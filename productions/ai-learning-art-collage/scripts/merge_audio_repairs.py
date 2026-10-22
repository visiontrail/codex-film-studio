#!/usr/bin/env python3
"""Validate isolated speech repairs, then merge only with explicit --apply.

The main TTS output lock and all 46 completed rows are mandatory. Original
provider files and audio remain in place. A journal permits safe recovery if
execution stops between the two atomic JSON replacements. No synthesis or
FFmpeg is invoked.
"""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import wave

ROOT = Path(__file__).resolve().parents[1]
TARGET_IDS = {"11", "15", "18", "26", "31", "33", "40"}
EXPECTED_IDS = {f"{i:02d}" for i in range(1, 47)}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def read(path):
    return json.loads(path.read_text())


def inside(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError("Evidence path escapes production root")
    return path


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    with temporary.open("wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, path)


def unique_rows(rows, label):
    if not isinstance(rows, list):
        raise ValueError(f"{label} must be an array")
    result = {str(row["id"]): row for row in rows}
    if len(result) != len(rows):
        raise ValueError(f"{label} contains duplicate IDs")
    return result


def validate_main_manifest(canonical, manifest, root):
    """A standard-library source/hash guard that timeline code can also call."""
    source = unique_rows(canonical, "Canonical narration")
    audio = unique_rows(manifest, "Main manifest")
    if set(source) != EXPECTED_IDS or set(audio) != EXPECTED_IDS:
        raise ValueError("Main canonical and manifest must contain exactly all 46 IDs")
    for key, line in source.items():
        row = audio[key]
        if row["text"] != line["text"] or sha(line["text"].encode()) != row["source_sha256"]:
            raise ValueError(f"{key}: canonical text/source hash differs from main manifest")
        if sha(inside(root, row["path"]).read_bytes()) != row["audio_sha256"]:
            raise ValueError(f"{key}: main audio hash changed")
    return source, audio


def pcm(path):
    with wave.open(str(path), "rb") as stream:
        identity = (stream.getframerate(), stream.getnchannels(), stream.getsampwidth(), stream.getnframes())
        data = stream.readframes(stream.getnframes())
    if identity[:3] != (24000, 1, 2) or len(data) != identity[3] * 2:
        raise ValueError("Repair is not complete 24 kHz mono PCM16")
    return identity, data


def verify_repair(root, candidate):
    import subtitles

    key = candidate["id"]
    source = unique_rows(read(inside(root, candidate["source"])), "Repair source")[key]
    row = unique_rows(read(inside(root, candidate["manifest"])), "Repair manifest")[key]
    original = unique_rows(read(inside(root, candidate["original_manifest"])), "Original manifest")[key]
    original_source = unique_rows(read(inside(root, candidate["original_source"])), "Original source")[key]
    if row["text"] != source["text"] or sha(row["text"].encode()) != row["source_sha256"]:
        raise ValueError(f"{key}: repair source identity differs")
    synthesis_text = row.get("synthesis_text", row["text"])
    synthesis_sha = sha(synthesis_text.encode())
    adoption_runs = None
    if synthesis_text != row["text"]:
        from transcript_adoption import validate_adoption
        _, adoption_runs = validate_adoption(row, root)
    elif row.get("canonical_transcript_adoption"):
        raise ValueError(f"{key}: unexpected transcript adoption metadata")
    if len(row["text"]) > 245 or row.get("synthesis_sha256", synthesis_sha) != synthesis_sha:
        raise ValueError(f"{key}: repair does not satisfy exact single-part source policy")
    if original["text"] != original_source["text"] or sha(original["text"].encode()) != original["source_sha256"]:
        raise ValueError(f"{key}: preserved original source identity differs")
    for field in ("voice", "voice_fingerprint", "deployment_fingerprint", "speed"):
        if row[field] != original[field]:
            raise ValueError(f"{key}: repair voice identity changed ({field})")
    if row["speed"] != 1.0 or len(row["parts"]) != 1 or row["parts"][0]["attempt"] != 1:
        raise ValueError(f"{key}: natural speed/single provider attempt requirement failed")
    wav = inside(root, row["path"])
    if sha(wav.read_bytes()) != row["audio_sha256"]:
        raise ValueError(f"{key}: repair WAV changed")
    part = row["parts"][0]
    part_path = inside(root, str(wav.parent.relative_to(root) / part["path"]))
    checkpoint = read(part_path.with_suffix(".json"))
    job = checkpoint.get("terminal_job", {})
    if (checkpoint.get("source_sha256") != synthesis_sha or job.get("status") != "completed"
            or job.get("id") != part["job_id"] or job.get("request", {}).get("text") != synthesis_text
            or checkpoint.get("payload") != job.get("request") or part["text"] != synthesis_text
            or job.get("request", {}).get("speed") != 1.0 or job.get("request", {}).get("voice") != row["voice"]
            or job.get("text_sha256") != synthesis_sha
            or job.get("fingerprint") != row["deployment_fingerprint"]
            or job.get("voice_fingerprint") != row["voice_fingerprint"]
            or job.get("audio_sha256") != part["audio_sha256"]
            or sha(part_path.read_bytes()) != part["audio_sha256"]):
        raise ValueError(f"{key}: completed provider identity differs")
    identity, data = pcm(wav)
    if pcm(part_path) != (identity, data) or abs(identity[3] / identity[0] - row["duration"]) > 1e-9:
        raise ValueError(f"{key}: assembled WAV is not the unchanged provider PCM")
    filename = f"{key}-{row['audio_sha256'][:16]}-{row['source_sha256'][:12]}.json"
    accepted_path = inside(root, candidate["accepted_directory"]) / filename
    accepted = read(accepted_path)
    if (accepted.get("status") != "accepted_text_and_alignment" or accepted.get("id") != key
            or accepted.get("source") != row["text"] or accepted.get("source_sha256") != row["source_sha256"]
            or accepted.get("audio_sha256") != row["audio_sha256"]):
        raise ValueError(f"{key}: no accepted repair bound to exact source/audio hashes")
    if adoption_runs is not None:
        if (accepted.get("canonical_transcript_adoption") != row["canonical_transcript_adoption"]
                or accepted.get("synthesis_sha256") != synthesis_sha
                or not any(accepted.get("selected_words") == run["words_in_original_clock"] for run in adoption_runs)):
            raise ValueError(f"{key}: adopted source lost its original synthesis/ASR identity")
    evidence = accepted.get("evidence_files", [])
    if not evidence:
        raise ValueError(f"{key}: accepted repair lacks independent evidence")
    models = set()
    for item in evidence:
        path = inside(root, item["path"])
        if sha(path.read_bytes()) != item["sha256"]:
            raise ValueError(f"{key}: independent ASR evidence changed")
        report = read(path)
        if report.get("audio_sha256") != row["audio_sha256"] or report.get("source_sha256") != synthesis_sha:
            raise ValueError(f"{key}: ASR evidence belongs to another source/audio")
        runs = list(report.get("reviews", []))
        if "words" in report and "model_repo" in report:
            runs.append({"model": report["model_repo"], "words_in_original_clock": report["words"]})
        elif "words_in_original_clock" in report and "model" in report:
            runs.append(report)
        for run in runs:
            try:
                subtitles.validate_word_times(run["words_in_original_clock"], row["duration"])
                subtitles.source_alignment(row["text"], run["words_in_original_clock"])
            except ValueError:
                continue
            models.add(run["model"].removeprefix("mlx-community/"))
    if not {"whisper-large-v3-turbo-q4", "whisper-medium-mlx"} <= models:
        raise ValueError(f"{key}: complete source is not corroborated by turbo and medium")
    subtitles.validate_word_times(accepted["selected_words"], row["duration"])
    subtitles.source_alignment(row["text"], accepted["selected_words"])
    return source, row, original_source, original, accepted_path


def transact(root, directory, replacements, copies, apply):
    """Journal two JSON replacements and immutable verification-record copies."""
    journal_path = directory / "journal.json"
    if journal_path.exists():
        journal = read(journal_path)
    else:
        journal = {"status": "prepared", "files": [], "copies": copies}
        for name, data in replacements.items():
            path = inside(root, name)
            before = path.read_bytes()
            journal["files"].append({"target": name, "before_sha256": sha(before), "after_sha256": sha(data),
                "before": f"before-{path.name}", "after": f"after-{path.name}"})
        if not apply:
            return {"status": "ready_dry_run", "targets": list(replacements), "accepted_records": len(copies)}
        directory.mkdir(parents=True, exist_ok=True)
        for item in journal["files"]:
            for name, data in [(item["before"], inside(root, item["target"]).read_bytes()),
                               (item["after"], replacements[item["target"]])]:
                path = directory / name
                if path.exists() and path.read_bytes() != data:
                    raise ValueError("Unjournaled transaction snapshot differs; refusing overwrite")
                if not path.exists():
                    atomic_write(path, data)
        atomic_write(journal_path, encoded(journal))
    if {item["target"] for item in journal["files"]} != {"content/narration.json", "media/audio/manifest.json"} or len(journal["files"]) != 2:
        raise ValueError("Transaction journal has unexpected replacement targets")
    for item in journal["files"]:
        if sha((directory / item["before"]).read_bytes()) != item["before_sha256"]:
            raise ValueError("Original transaction snapshot changed")
        if sha((directory / item["after"]).read_bytes()) != item["after_sha256"]:
            raise ValueError("Prepared transaction contents changed")
        actual = sha(inside(root, item["target"]).read_bytes())
        if actual not in {item["before_sha256"], item["after_sha256"]}:
            raise ValueError("Production changed outside the prepared transaction; refusing overwrite")
    for item in journal["copies"]:
        src, dest = inside(root, item["source"]), inside(root, item["target"])
        if sha(src.read_bytes()) != item["sha256"] or (dest.exists() and sha(dest.read_bytes()) != item["sha256"]):
            raise ValueError("An accepted verification record changed; refusing replacement")
    complete = all(sha(inside(root, x["target"]).read_bytes()) == x["after_sha256"] for x in journal["files"])
    complete = complete and all(inside(root, x["target"]).exists() for x in journal["copies"])
    if not apply:
        return {"status": "already_applied" if complete else "recovery_ready_dry_run"}
    for item in journal["copies"]:
        dest = inside(root, item["target"])
        if not dest.exists():
            atomic_write(dest, inside(root, item["source"]).read_bytes())
    for item in journal["files"]:
        dest = inside(root, item["target"])
        if sha(dest.read_bytes()) != item["after_sha256"]:
            atomic_write(dest, (directory / item["after"]).read_bytes())
    journal["status"] = "complete"
    atomic_write(journal_path, encoded(journal))
    return {"status": "already_applied" if complete else "merged", "journal": str(journal_path)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--candidates", default="review/audio-repairs-v1/merge-candidates.json")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    lock_path = root / "media/audio/.speech.lock"
    with lock_path.open("a+b") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise ValueError("Main speech client still owns its output lock; merge is refused") from None
        candidates = read(inside(root, args.candidates))
        by_id = unique_rows(candidates, "Repair candidates")
        if set(by_id) != TARGET_IDS:
            raise ValueError("Candidate list must contain exactly the seven authorized IDs")
        repairs = {key: verify_repair(root, by_id[key]) for key in sorted(by_id)}
        directory = root / "review/audio-repairs-v1/merge-transaction"
        if (directory / "journal.json").exists():
            result = transact(root, directory, {}, [], args.apply)
        else:
            source_path, manifest_path = root / "content/narration.json", root / "media/audio/manifest.json"
            canonical, manifest = read(source_path), read(manifest_path)
            source, audio = validate_main_manifest(canonical, manifest, root)
            copies = []
            for key, (new_source, new_audio, old_source, old_audio, accepted) in repairs.items():
                if source[key]["text"] != old_source["text"] or audio[key] != old_audio:
                    raise ValueError(f"{key}: original source/audio changed before this merge")
                source[key] = {**source[key], "text": new_source["text"]}
                audio[key] = new_audio
                copies.append({"source": str(accepted.relative_to(root)),
                    "target": str(Path("review/asr/batch") / accepted.name), "sha256": sha(accepted.read_bytes())})
            after_source = [source[str(row["id"])] for row in canonical]
            after_audio = [audio[str(row["id"])] for row in manifest]
            validate_main_manifest(after_source, after_audio, root)
            result = transact(root, directory, {"content/narration.json": encoded(after_source),
                "media/audio/manifest.json": encoded(after_audio)}, copies, args.apply)
        if args.apply:
            validate_main_manifest(read(root / "content/narration.json"), read(root / "media/audio/manifest.json"), root)
        print(json.dumps({**result, "repair_ids": sorted(TARGET_IDS), "provider_requests": 0,
                          "ffmpeg_subprocesses": 0, "listening_established": False}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError) as error:
        raise SystemExit(str(error)) from None
