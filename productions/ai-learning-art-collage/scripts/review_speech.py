#!/usr/bin/env python3
"""Independent, unprompted local-model corroboration of unchanged speech PCM."""
import argparse
import json
import time
from pathlib import Path

import mlx_whisper
import numpy as np

from review_onset import cached_model, load_pcm
from transcribe_audio import ROOT, compare, read_audio, sha, write_json


def envelope(pcm, rate, start, end, window=.01):
    result = []
    for at in np.arange(start, min(end, len(pcm) / rate), window):
        values = pcm[round(at * rate):round((at + window) * rate)].astype(np.float64) / 32768
        if len(values):
            result.append({"start_seconds": round(float(at), 6),
                           "rms": float(np.sqrt(np.mean(values ** 2))),
                           "peak": float(np.max(np.abs(values)))})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--id", default="04")
    parser.add_argument("--padding", type=float, default=.5)
    parser.add_argument("--manifest", type=Path, default=ROOT / "media/audio/manifest.json",
                        help="Completed narration manifest; supports isolated repair audio")
    parser.add_argument("--model", action="append", help="Already-cached MLX model name; may repeat")
    parser.add_argument("--output", type=Path, help="Separate evidence file for an additional local-model check")
    args = parser.parse_args()
    if not 0 <= args.padding <= 2:
        parser.error("Padding must be between zero and two seconds")
    args.manifest = args.manifest.resolve()
    rows = json.loads(args.manifest.read_text())
    row = next(item for item in rows if str(item["id"]) == args.id)
    path = ROOT / row["path"]
    audio_hash = sha(path.read_bytes())
    source_hash = sha(row["text"].encode())
    if audio_hash != row["audio_sha256"] or source_hash != row["source_sha256"]:
        raise RuntimeError("Manifest identity changed")
    pcm, rate, raw_bytes = load_pcm(path)
    audio, decode = read_audio(path)
    padding = np.zeros(round(args.padding * 16000), dtype=np.float32)
    padded = np.concatenate((padding, audio, padding))
    first_part = path.parent / row["parts"][0]["path"]
    _, part_rate, part_bytes = load_pcm(first_part)
    over = np.flatnonzero(np.abs(pcm.astype(np.int32)) >= 100)
    report = {"schema_version": 1, "id": args.id, "source": row["text"],
              "source_sha256": source_hash, "audio_sha256": audio_hash,
              "audio_path": row["path"], "original_wav_modified": False,
              "provider_regeneration": False, "audio_reader": decode,
              "prompt_used": False, "conditioning_on_previous_text": False,
              "padding_method": "0.5 seconds before and after, in ASR numpy memory only" if args.padding == .5 else "Symmetric padding in ASR numpy memory only",
              "acoustic_evidence": {
                  "assembled_onset_matches_provider_pcm": rate == part_rate and raw_bytes.startswith(part_bytes),
                  "first_sample_pcm16": int(pcm[0]), "last_sample_pcm16": int(pcm[-1]),
                  "first_sample_above_100_pcm16_seconds": float(over[0] / rate) if len(over) else None,
                  "last_sample_above_100_pcm16_seconds": float(over[-1] / rate) if len(over) else None,
                  "full_scale_clipped_samples": int(np.count_nonzero(np.abs(pcm.astype(np.int32)) >= 32767)),
                  "first_1_5_seconds_envelope": envelope(pcm, rate, 0, 1.5),
                  "interpretation_limit": "An intact provider onset and nonsaturated waveform do not establish lexical word boundaries. No grammatical or semantic similarity is accepted as a word-match exemption."},
              "reviews": [], "listening": "Not established by these ASR runs"}
    out = args.output or ROOT / "review/asr" / f"review-{args.id}.json"
    for model_name in args.model or ["whisper-large-v3-turbo-q4", "whisper-medium-mlx"]:
        model = cached_model(model_name)
        for waveform, offset in [(audio, 0.0), (padded, args.padding)]:
            started = time.monotonic()
            heard = mlx_whisper.transcribe(waveform, path_or_hf_repo=str(model), language="en",
                                          word_timestamps=True, initial_prompt=None,
                                          condition_on_previous_text=False, temperature=0, verbose=False)
            words = [word for segment in heard.get("segments", []) for word in segment.get("words", [])]
            review = {"model": model_name, "snapshot": model.name, "padding_seconds": offset,
                      "trailing_padding_seconds": offset, "transcript": heard["text"].strip(),
                      "elapsed_seconds": round(time.monotonic() - started, 3),
                      "words_in_original_clock": [{**word, "start": max(0, min(len(audio) / 16000, word["start"] - offset)),
                                                    "end": max(0, min(len(audio) / 16000, word["end"] - offset))} for word in words],
                      "comparison": compare(row["text"], heard["text"]), "prompt_used": False}
            report["reviews"].append(review)
            write_json(out, report)
            print(json.dumps({"model": model_name, "padding": offset, "transcript": review["transcript"],
                              "differences": review["comparison"]["differences"]}), flush=True)
    if sha(path.read_bytes()) != audio_hash:
        raise RuntimeError("Original audio changed during review")
    exact = [r for r in report["reviews"] if r["comparison"]["exact_normalized_match"]]
    models = sorted({r["model"] for r in exact})
    report["assessment"] = {"exact_full_source_runs": len(exact), "exact_full_source_models": models,
                            "grammar_similarity_waived": False, "missing_words_waived": False,
                            "requires_parent_decision": True,
                            "status": "corroborated_across_two_models" if len(models) == 2 else "unresolved",
                            "interpretation": "Unprompted agreement is corroboration, not a substitute for listening. If models disagree, retain the discrepancy rather than silently normalizing pause is to pauses."}
    write_json(out, report)
    print(str(out), flush=True)


if __name__ == "__main__":
    main()
