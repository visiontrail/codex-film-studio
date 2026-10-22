#!/usr/bin/env python3
"""Recheck a suspicious first word on unchanged PCM with local, unprompted ASR."""
import argparse
import importlib.util
import json
import re
import time
import wave
from pathlib import Path

import mlx_whisper
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("independent_asr", Path(__file__).with_name("transcribe_audio.py"))
asr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(asr)


def load_pcm(path):
    with wave.open(str(path), "rb") as stream:
        if (stream.getnchannels(), stream.getsampwidth()) != (1, 2):
            raise RuntimeError("Expected original mono PCM16")
        rate = stream.getframerate()
        pcm = stream.readframes(stream.getnframes())
    return np.frombuffer(pcm, dtype="<i2"), rate, pcm


def cached_model(name):
    base = Path.home() / ".cache/huggingface/hub" / ("models--mlx-community--" + name)
    snapshots = [path for path in (base / "snapshots").glob("*") if (path / "weights.npz").is_file()]
    if len(snapshots) != 1:
        raise RuntimeError(f"Cached model {name} is unavailable or ambiguous; no download attempted")
    return snapshots[0]


def comparison(source, text):
    normalized = re.sub(r"\bchat\s+bot\b", "chatbot", text, flags=re.I)
    result = asr.compare(source, normalized)
    result["orthographic_equivalences"] = [{"from": "chat bot", "to": "chatbot",
                                            "reason": "Compound word spacing only; same spoken words"}] if normalized != text else []
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--id", default="01")
    parser.add_argument("--padding", type=float, default=0.5)
    args = parser.parse_args()
    manifest = json.loads((ROOT / "media/audio/manifest.json").read_text())
    row = next(item for item in manifest if item["id"] == args.id)
    wav = ROOT / row["path"]
    original_hash = asr.sha(wav.read_bytes())
    if original_hash != row["audio_sha256"]:
        raise RuntimeError("WAV differs from manifest")
    raw, rate, raw_bytes = load_pcm(wav)
    audio, decode = asr.read_audio(wav)
    pad = np.zeros(round(args.padding * 16000), dtype=np.float32)
    padded = np.concatenate((pad, audio))
    part = ROOT / "media/audio" / row["parts"][0]["path"]
    part_raw, part_rate, part_bytes = load_pcm(part)
    exact_provider_onset = rate == part_rate and raw_bytes.startswith(part_bytes)
    levels = []
    for start_ms in range(0, 500, 10):
        chunk = raw[round(start_ms * rate / 1000):round((start_ms + 10) * rate / 1000)].astype(np.float64) / 32768
        levels.append({"start_ms": start_ms, "end_ms": start_ms + 10,
                       "rms": float(np.sqrt(np.mean(chunk ** 2))), "peak": float(np.max(np.abs(chunk)))})
    nonzero = np.flatnonzero(raw)
    over_threshold = np.flatnonzero(np.abs(raw.astype(np.int32)) >= 100)
    acoustic = {
        "first_sample_pcm16": int(raw[0]), "first_24_samples_pcm16": [int(x) for x in raw[:24]],
        "leading_exact_zero_samples": int(nonzero[0]) if len(nonzero) else len(raw),
        "first_sample_above_100_pcm16_ms": float(over_threshold[0] * 1000 / rate) if len(over_threshold) else None,
        "first_500ms_full_scale_clipped_samples": int(np.count_nonzero(np.abs(raw[:round(0.5 * rate)].astype(np.int32)) >= 32767)),
        "first_500ms_envelope_10ms": levels,
        "assembled_onset_matches_original_provider_pcm": exact_provider_onset,
        "interpretation_limit": "Waveform onset can reveal abrupt boundaries or saturation, but cannot alone establish whether the word It is present.",
    }
    original_caches = list((ROOT / "review/asr").glob(f"{args.id}-{original_hash[:16]}-*.json"))
    prior = json.loads(original_caches[0].read_text()) if len(original_caches) == 1 else None
    report = {"id": args.id, "source": row["text"], "audio_path": row["path"],
              "audio_sha256": original_hash, "padding_seconds": args.padding,
              "original_wav_modified": False, "provider_regeneration": False,
              "acoustic_onset": acoustic, "original_asr": prior,
              "audio_reader": decode, "reviews": [], "listening": "Not established by ASR"}
    if prior:
        report["original_asr_spacing_normalized_comparison"] = comparison(row["text"], prior["transcript"])
    output = ROOT / "review/asr" / f"onset-review-{args.id}.json"
    runs = [("whisper-large-v3-turbo-q4", padded, args.padding),
            ("whisper-medium-mlx", audio, 0.0),
            ("whisper-medium-mlx", padded, args.padding)]
    for name, waveform, offset in runs:
        model = cached_model(name)
        started = time.monotonic()
        heard = mlx_whisper.transcribe(waveform, path_or_hf_repo=str(model), language="en",
                                       word_timestamps=True, initial_prompt=None,
                                       condition_on_previous_text=False, temperature=0, verbose=False)
        words = [word for segment in heard.get("segments", []) for word in segment.get("words", [])]
        review = {"model": name, "snapshot": model.name, "padding_seconds": offset,
                  "transcript": heard["text"].strip(), "words_in_padded_clock": words,
                  "words_in_original_clock": [{**word, "start": max(0, word["start"] - offset),
                                                "end": max(0, word["end"] - offset)} for word in words],
                  "elapsed_seconds": round(time.monotonic() - started, 3),
                  "prompt_used": False, "comparison": comparison(row["text"], heard["text"])}
        report["reviews"].append(review)
        asr.write_json(output, report)
        print(json.dumps({"model": name, "padding_seconds": offset, "transcript": review["transcript"],
                          "differences": review["comparison"]["differences"]}), flush=True)
    if asr.sha(wav.read_bytes()) != original_hash:
        raise RuntimeError("Original WAV changed during review")
    results = [review["comparison"]["exact_normalized_match"] for review in report["reviews"]]
    report["assessment"] = {
        "padded_turbo_matches_full_source": results[0],
        "medium_original_matches_full_source": results[1],
        "medium_padded_matches_full_source": results[2],
        "missing_first_word_automatically_exempted": False,
        "disposition": "full-source ASR corroboration available; requires parent decision" if sum(results) >= 2 else "onset remains unresolved; requires parent decision",
        "provider_wav_preserved": True,
    }
    if all(results):
        report["assessment"]["conclusion"] = "First-word omission in the original turbo transcript was not reproduced by padded turbo or either medium run. This supports ASR onset sensitivity rather than a missing provider word."
        report["assessment"]["recommendation"] = "Retain original provider WAV; do not spend a regeneration attempt on this ASR-only discrepancy. Subjective listening remains separate."
    asr.write_json(output, report)
    print(str(output), flush=True)


if __name__ == "__main__":
    main()
