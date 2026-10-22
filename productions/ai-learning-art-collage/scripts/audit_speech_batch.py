#!/usr/bin/env python3
"""Incremental local ASR review; never submits, replaces or cancels provider jobs.

Run once after more narration is ready. Successful SHA-bound reviews are reused.
The existing watcher owns first-pass ASR. Only mismatches receive at most three
additional local decodes: padded turbo and original/padded medium. Raw evidence
is retained separately from acceptance. Text/alignment review is not listening.
"""
import argparse
import datetime
import json
from pathlib import Path
import time

import numpy as np

import subtitles
from transcribe_audio import ROOT, compare, read_audio, sha, write_json


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def evidence(path):
    path = Path(path).resolve()
    return {"path": str(path.relative_to(ROOT.resolve())), "sha256": sha(path.read_bytes())}


def evidence_valid(items):
    return bool(items) and all((ROOT / item["path"]).is_file()
                               and sha((ROOT / item["path"]).read_bytes()) == item["sha256"] for item in items)


def evidence_for_method(initial_path, method):
    paths = [initial_path, Path(method["file"])]
    document = json.loads(paths[-1].read_text())
    for item in document.get("evidence_files", []):
        paths.append(ROOT / item["path"])
    if document.get("original_asr_report"):
        paths.append(Path(method["file"]).parent / document["original_asr_report"])
    return list({str(path.resolve()): evidence(path) for path in paths}.values())


def normalized_model(name):
    return name.removeprefix("mlx-community/")


def review_words(review):
    return review.get("words_in_original_clock", review.get("words", []))


def full_alignment(row, words):
    equivalences = []
    subtitles.validate_word_times(words, row["duration"])
    subtitles.source_alignment(row["text"], words, equivalences)
    return equivalences


def accepted_record(row, initial_path, words, method, files, created_at=None):
    equivalences = full_alignment(row, words)
    return {"schema_version": 1, "created_at": created_at or now(), "reviewed_at": now(),
            "id": str(row["id"]), "source": row["text"], "source_sha256": row["source_sha256"],
            "audio_sha256": row["audio_sha256"], "audio_path": row["path"],
            "status": "accepted_text_and_alignment", "acceptance_basis": method["selection"],
            "selected_model": method["model"], "selected_padding_seconds": method.get("padding_seconds", 0),
            "selected_words": words, "spelling_equivalences": equivalences,
            "numerical_spelling_equivalences": [item for item in equivalences if "asr_numeric_glyphs" in item],
            "orthographic_spelling_equivalences": [item for item in equivalences if item.get("kind") == "declared_compound_spelling"],
            "initial_asr_report": str(initial_path.relative_to(ROOT)), "evidence_files": files,
            "orthographic_policy": "Case/punctuation, declared numeric spelling, chat bot/chatbot, and source-conditioned pre-registered/preregistered or pre-print/preprint spelling only; explicit hash-bound adjudications are recorded separately.",
            "listening_established": False, "subjective_voice_quality_accepted": False,
            "provider_requests": 0, "original_audio_modified": False}


def process(row, directory, allow_new):
    directory = Path(directory).resolve()
    line_id = str(row["id"])
    audio_path = ROOT / row["path"]
    if sha(audio_path.read_bytes()) != row["audio_sha256"] or sha(row["text"].encode()) != row["source_sha256"]:
        raise ValueError("Audio or source SHA does not match manifest")
    stem = f"{line_id}-{row['audio_sha256'][:16]}-{row['source_sha256'][:12]}"
    record_path = directory / "batch" / (stem + ".json")
    prior = json.loads(record_path.read_text()) if record_path.exists() else None
    if row.get("canonical_transcript_adoption"):
        from transcript_adoption import validate_adoption
        _, adoption_runs = validate_adoption(row, ROOT)
        if (not prior or prior.get("canonical_transcript_adoption") != row["canonical_transcript_adoption"]
                or prior.get("synthesis_sha256") != row["synthesis_sha256"]
                or not any(prior.get("selected_words") == run["words_in_original_clock"] for run in adoption_runs)):
            raise ValueError("Adopted audio must retain its exact canonical/synthesis decision and raw ASR timestamps")
    if (prior and prior.get("status") == "accepted_text_and_alignment" and prior.get("source") == row["text"]
            and prior.get("source_sha256") == row["source_sha256"] and prior.get("audio_sha256") == row["audio_sha256"]
            and evidence_valid(prior.get("evidence_files", []))):
        full_alignment(row, prior["selected_words"])
        return {"id": line_id, "status": prior["status"], "cached": True, "new_local_decodes": 0,
                "record": str(record_path.relative_to(ROOT)), "acceptance_basis": prior["acceptance_basis"]}
    initial_path = directory / (stem + ".json")
    if not initial_path.exists():
        return {"id": line_id, "status": "awaiting_initial_asr", "new_local_decodes": 0}
    initial = json.loads(initial_path.read_text())
    if initial.get("audio_sha256") != row["audio_sha256"] or initial.get("source_sha256") != row["source_sha256"]:
        raise ValueError("First-pass ASR identity mismatch")
    try:
        words, method = subtitles.asr_words(row, directory)
        full_alignment(row, words)
    except (ValueError, KeyError):
        pass
    else:
        record = accepted_record(row, initial_path, words, method, evidence_for_method(initial_path, method))
        write_json(record_path, record)
        return {"id": line_id, "status": record["status"], "cached": False, "new_local_decodes": 0,
                "record": str(record_path.relative_to(ROOT)), "acceptance_basis": record["acceptance_basis"]}

    # The original report is immutable. Supplementary evidence lives under a new hash-bound filename.
    supplementary_path = directory / "batch" / (stem + ".supplementary.json")
    supplementary = json.loads(supplementary_path.read_text()) if supplementary_path.exists() else {
        "id": line_id, "source": row["text"], "source_sha256": row["source_sha256"],
        "audio_sha256": row["audio_sha256"], "initial_evidence": evidence(initial_path),
        "reviews": [], "prompt_used": False, "provider_requests": 0, "listening_established": False}
    if (supplementary["source_sha256"] != row["source_sha256"] or supplementary["audio_sha256"] != row["audio_sha256"]
            or supplementary["initial_evidence"] != evidence(initial_path)):
        raise ValueError("Supplementary review identity changed; original evidence retained")
    files = [evidence(initial_path)]
    runs = [{"model": normalized_model(initial["model_repo"]), "padding_seconds": 0,
             "transcript": initial["transcript"], "words_in_original_clock": initial["words"],
             "comparison": initial["comparison"]}]
    for path in sorted(directory.glob(f"review-{line_id}*.json")) + sorted(directory.glob(f"onset-review-{line_id}.json")):
        data = json.loads(path.read_text())
        if data.get("audio_sha256") == row["audio_sha256"] and data.get("source") == row["text"]:
            runs.extend(data.get("reviews", []))
            files.append(evidence(path))
    runs.extend(supplementary["reviews"])
    completed = {(normalized_model(run["model"]), run["padding_seconds"]) for run in runs}
    targets = [("whisper-large-v3-turbo-q4", .5), ("whisper-medium-mlx", 0), ("whisper-medium-mlx", .5)]
    new_decodes = 0
    waveform = None
    for name, padding in targets:
        if (name, padding) in completed or not allow_new:
            continue
        # Model lookup requires an existing local weights.npz; no model download or provider request.
        import mlx_whisper
        from review_onset import cached_model

        model = cached_model(name)
        if waveform is None:
            waveform, decode = read_audio(audio_path)
            supplementary["audio_reader"] = decode
        zeros = np.zeros(round(padding * 16000), dtype=np.float32)
        candidate = np.concatenate((zeros, waveform, zeros)) if padding else waveform
        started = time.monotonic()
        result = mlx_whisper.transcribe(candidate, path_or_hf_repo=str(model), language="en",
                                        word_timestamps=True, initial_prompt=None,
                                        condition_on_previous_text=False, temperature=0, verbose=False)
        padded_words = [word for segment in result.get("segments", []) for word in segment.get("words", [])]
        run = {"model": name, "snapshot": model.name, "padding_seconds": padding,
               "trailing_padding_seconds": padding, "transcript": result["text"].strip(),
               "words_in_padded_clock": padded_words,
               "words_in_original_clock": [{**word, "start": max(0, word["start"] - padding),
                                             "end": max(0, word["end"] - padding)} for word in padded_words],
               "comparison": compare(row["text"], result["text"]), "prompt_used": False,
               "conditioning_on_previous_text": False, "elapsed_seconds": round(time.monotonic() - started, 3)}
        supplementary["reviews"].append(run)
        runs.append(run)
        write_json(supplementary_path, supplementary)
        new_decodes += 1
        print(json.dumps({"id": line_id, "model": name, "padding_seconds": padding,
                          "differences": run["comparison"]["differences"]}), flush=True)
    if supplementary_path.exists():
        files.append(evidence(supplementary_path))
    matching = []
    for run in runs:
        try:
            full_alignment(row, review_words(run))
        except ValueError:
            continue
        matching.append(run)
    models = {normalized_model(run["model"]) for run in matching}
    if len(models) >= 2:
        selected = next((run for run in matching if "turbo" in run["model"] and run["padding_seconds"] == .5), matching[0])
        method = {"selection": "Complete canonical-word alignment corroborated across two local model families",
                  "model": selected["model"], "padding_seconds": selected["padding_seconds"]}
        record = accepted_record(row, initial_path, review_words(selected), method, files)
        record["matching_model_families"] = sorted(models)
    else:
        record = {"schema_version": 1, "reviewed_at": now(), "id": line_id, "source": row["text"],
                  "source_sha256": row["source_sha256"], "audio_sha256": row["audio_sha256"],
                  "status": "needs_review", "evidence_files": files,
                  "original_differences": initial["comparison"]["differences"],
                  "remaining_review_candidates": [{"model": run["model"], "padding_seconds": run["padding_seconds"],
                                                   "differences": run["comparison"]["differences"]} for run in runs],
                  "interpretation": "Unresolved ASR variants are review candidates, not confirmed provider errors. No source word is silently waived.",
                  "listening_established": False, "provider_requests": 0, "original_audio_modified": False}
    if sha(audio_path.read_bytes()) != row["audio_sha256"]:
        raise ValueError("Original audio changed during local review")
    write_json(record_path, record)
    return {"id": line_id, "status": record["status"], "cached": False, "new_local_decodes": new_decodes,
            "record": str(record_path.relative_to(ROOT)),
            "remaining_review_candidates": record.get("remaining_review_candidates", [])}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=ROOT / "media/audio/manifest.json")
    parser.add_argument("--asr-dir", type=Path, default=ROOT / "review/asr")
    parser.add_argument("--only", help="Comma-separated narration IDs")
    parser.add_argument("--no-new-asr", action="store_true", help="Reuse evidence only; never perform a new local decode")
    args = parser.parse_args()
    args.manifest = args.manifest.resolve()
    args.asr_dir = args.asr_dir.resolve()
    rows = json.loads(args.manifest.read_text())
    canonical = {str(row["id"]): row for row in json.loads((ROOT / "content/narration.json").read_text())}
    selected = set(args.only.split(",")) if args.only else set(canonical)
    if not selected <= set(canonical) or len({str(row["id"]) for row in rows}) != len(rows):
        raise ValueError("Unknown selection or duplicate audio manifest IDs")
    results = []
    for row in rows:
        line_id = str(row["id"])
        if line_id not in selected:
            continue
        try:
            if row["text"] != canonical[line_id]["text"]:
                raise ValueError("Canonical source changed")
            result = process(row, args.asr_dir, not args.no_new_asr)
        except (ValueError, RuntimeError, OSError) as exc:
            result = {"id": line_id, "status": "review_error", "error": str(exc)}
        results.append(result)
        print(json.dumps({k: v for k, v in result.items() if k != "remaining_review_candidates"}), flush=True)
    summary = {"recorded_at": now(), "requested_ids": sorted(selected), "results": results,
               "not_yet_generated_ids": sorted(selected - {str(row["id"]) for row in rows}),
               "accepted_ids": [r["id"] for r in results if r["status"] == "accepted_text_and_alignment"],
               "needs_review_ids": [r["id"] for r in results if r["status"] == "needs_review"],
               "error_ids": [r["id"] for r in results if r["status"] == "review_error"],
               "new_local_decodes": sum(r.get("new_local_decodes", 0) for r in results),
               "scope": "One bounded incremental run. Text/alignment evidence only; no listening or subjective audio-quality claim.",
               "provider_requests": 0, "ffmpeg_subprocesses": 0, "watcher_restarted": False}
    write_json(args.asr_dir / "batch-summary.json", summary)
    return 2 if summary["needs_review_ids"] or summary["error_ids"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
