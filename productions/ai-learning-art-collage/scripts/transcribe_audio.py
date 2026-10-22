#!/usr/bin/env python3
"""Independent local ASR for completed narration WAVs; no FFmpeg or source prompt.

Uses an installed MLX Whisper runtime and an already-cached model by default.
Reads PCM with wave, resamples with scipy and sends only audio to Whisper.
ASR differences require review; matching words do not establish listening quality.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import math
import os
from pathlib import Path
import re
import time
import wave

ROOT = Path(__file__).resolve().parents[1]
MODEL_REPO = "mlx-community/whisper-large-v3-turbo-q4"
NORMALIZATION_VERSION = 1


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temporary.replace(path)


def model_directory(explicit=None):
    if explicit:
        path = explicit.expanduser().resolve()
        if not path.is_dir():
            raise RuntimeError("Selected local Whisper model directory does not exist")
        return path
    base = Path(os.environ.get("HF_HOME", str(Path.home() / ".cache/huggingface"))) / "hub"
    repository = base / ("models--" + MODEL_REPO.replace("/", "--"))
    ref = repository / "refs/main"
    if ref.exists():
        path = repository / "snapshots" / ref.read_text().strip()
        if path.is_dir():
            return path
    candidates = sorted((repository / "snapshots").glob("*"))
    if len(candidates) == 1 and candidates[0].is_dir():
        return candidates[0]
    raise RuntimeError("No unambiguous local Whisper turbo q4 snapshot; provide --model-dir")


def read_audio(path):
    import numpy as np
    from scipy.signal import resample_poly

    with wave.open(str(path), "rb") as stream:
        rate = stream.getframerate()
        channels = stream.getnchannels()
        width = stream.getsampwidth()
        frames = stream.getnframes()
        raw = stream.readframes(frames)
    if width != 2 or not channels or len(raw) != frames * channels * width:
        raise RuntimeError("ASR input must be complete PCM16 WAV")
    data = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)
    if rate != 16000:
        divisor = math.gcd(rate, 16000)
        data = resample_poly(data, 16000 // divisor, rate // divisor).astype(np.float32)
    return data, {"input_rate": rate, "input_channels": channels, "input_frames": frames,
                  "input_duration": frames / rate, "asr_rate": 16000,
                  "asr_samples": len(data), "reader": "wave + scipy.resample_poly", "ffmpeg_used": False}


def number_words(number):
    ones = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
    tens = "zero ten twenty thirty forty fifty sixty seventy eighty ninety".split()
    if number < 20:
        return ones[number]
    if number < 100:
        return tens[number // 10] + (" " + ones[number % 10] if number % 10 else "")
    if number < 1000:
        return ones[number // 100] + " hundred" + (" " + number_words(number % 100) if number % 100 else "")
    if number < 1000000:
        return number_words(number // 1000) + " thousand" + (" " + number_words(number % 1000) if number % 1000 else "")
    return str(number)


def tokens(text):
    """Declared orthographic equivalences only; no semantic/fuzzy acceptance."""
    text = text.lower().replace("’", "'").replace("%", " percent ")
    text = re.sub(r"\bchat\s*g\.?\s*p\.?\s*t\.?\b", "chat g p t", text)
    text = re.sub(r"\bg\.?\s*p\.?\s*t\.?\b", "g p t", text)
    text = re.sub(r"\ba\.?\s*i\.?\b", "a i", text)
    text = re.sub(r"(?<=\d),(?=\d{3}\b)", "", text)
    text = re.sub(r"\b\d+\b", lambda match: number_words(int(match.group())), text)
    text = text.replace("'", "")
    text = re.sub(r"\bpractise\b", "practice", text)
    return re.findall(r"[a-z]+|\d+", text)


def compare(expected, heard):
    source, actual = tokens(expected), tokens(heard)
    differences = [{"kind": kind, "expected": source[start:end], "heard": actual[a:b],
                    "source_token_range": [start, end], "heard_token_range": [a, b]}
                   for kind, start, end, a, b in difflib.SequenceMatcher(
                       None, source, actual, autojunk=False).get_opcodes() if kind != "equal"]
    # Levenshtein distance, rather than a difflib ratio, supplies word-error rate.
    prior = list(range(len(actual) + 1))
    for index, word in enumerate(source, 1):
        current = [index]
        for j, candidate in enumerate(actual, 1):
            current.append(min(current[-1] + 1, prior[j] + 1, prior[j - 1] + (word != candidate)))
        prior = current
    return {"normalized_source": source, "normalized_transcript": actual,
            "normalization_version": NORMALIZATION_VERSION,
            "word_edits": prior[-1], "source_words": len(source),
            "word_error_rate": prior[-1] / max(1, len(source)),
            "differences": differences, "exact_normalized_match": not differences}


def input_rows(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    rows = data.get("lines", data.get("narration")) if isinstance(data, dict) else data
    if not isinstance(rows, list):
        raise RuntimeError("Narration input must contain an array")
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "content/narration.json")
    parser.add_argument("--manifest", type=Path, default=ROOT / "media/audio/manifest.json")
    parser.add_argument("--output", type=Path, default=ROOT / "review/asr")
    parser.add_argument("--model-dir", type=Path)
    parser.add_argument("--only", help="Comma-separated narration IDs")
    parser.add_argument("--watch", action="store_true", help="Process completed lines as the voice client writes them")
    parser.add_argument("--poll", type=float, default=15)
    parser.add_argument("--check", action="store_true", help="Report installed runtime and local model only")
    args = parser.parse_args()
    import mlx_whisper
    import numpy
    import scipy

    model = model_directory(args.model_dir)
    if args.check:
        print(json.dumps({"model": str(model), "model_repo": MODEL_REPO,
                          "mlx_whisper_installed": True, "numpy": numpy.__version__,
                          "scipy": scipy.__version__, "ffmpeg_required": False}, indent=2))
        return 0
    if args.poll < 1:
        parser.error("--poll must be at least one second")
    sources = input_rows(args.input)
    source_by_id = {str(row["id"]): row for row in sources}
    if len(source_by_id) != len(sources):
        raise RuntimeError("Duplicate narration IDs")
    selected = set(args.only.split(",")) if args.only else set(source_by_id)
    if not selected <= set(source_by_id):
        raise RuntimeError("Unknown --only ID")
    args.output.mkdir(parents=True, exist_ok=True)
    prior_count = -1
    while True:
        manifest = json.loads(args.manifest.read_text()) if args.manifest.exists() else []
        results = []
        for row in manifest:
            line_id = str(row["id"])
            if line_id not in selected:
                continue
            expected = " ".join(source_by_id[line_id]["text"].split())
            source_hash = sha(expected.encode())
            if row.get("source_sha256") != source_hash or row["text"] != expected:
                raise RuntimeError(f"{line_id}: narration changed beside accepted audio manifest")
            wav = ROOT / row["path"]
            audio_hash = sha(wav.read_bytes())
            if audio_hash != row.get("audio_sha256"):
                raise RuntimeError(f"{line_id}: current audio differs from manifest hash")
            cache = args.output / f"{line_id}-{audio_hash[:16]}-{source_hash[:12]}.json"
            if cache.exists():
                result = json.loads(cache.read_text())
                if result.get("audio_sha256") != audio_hash or result.get("model_snapshot") != model.name:
                    raise RuntimeError(f"{line_id}: cached ASR identity differs; retain it and select a new output")
            else:
                data, decode = read_audio(wav)
                start = time.monotonic()
                heard = mlx_whisper.transcribe(
                    data, path_or_hf_repo=str(model), language="en", word_timestamps=True,
                    initial_prompt=None, condition_on_previous_text=False, temperature=0,
                    verbose=False,
                )
                result = {"id": line_id, "expected": expected, "transcript": heard["text"].strip(),
                          "audio_sha256": audio_hash, "source_sha256": source_hash,
                          "model_repo": MODEL_REPO, "model_snapshot": model.name,
                          "model_path": str(model), "prompt_used": False,
                          "conditioning_on_previous_text": False, "decode": decode,
                          "elapsed_seconds": round(time.monotonic() - start, 3),
                          "words": [word for segment in heard.get("segments", []) for word in segment.get("words", [])],
                          "segments": heard.get("segments", []),
                          "listening": "Not established by transcription",
                          "subjective_voice_quality": "Not established by transcription"}
                result["comparison"] = compare(expected, result["transcript"])
                result["synthesis_comparison"] = compare(row.get("synthesis_text", expected), result["transcript"])
                result["status"] = "matched_words_only" if result["comparison"]["exact_normalized_match"] else "needs_review"
                write_json(cache, result)
                print(json.dumps({"id": line_id, "transcript": result["transcript"],
                                  "status": result["status"],
                                  "differences": result["comparison"]["differences"]}, ensure_ascii=False), flush=True)
            results.append(result)
        reviewed = {result["id"] for result in results}
        flagged = [result["id"] for result in results if result["status"] == "needs_review"]
        write_json(args.output / "review.json", results)
        write_json(args.output / "coverage.json", {
            "expected_ids": sorted(selected), "transcribed_ids": sorted(reviewed),
            "pending_ids": sorted(selected - reviewed), "needs_review_ids": flagged,
            "all_requested_transcribed": reviewed == selected,
            "review_scope": "Independent unprompted ASR; no listening claim", "ffmpeg_used": False,
        })
        if len(reviewed) != prior_count:
            print(f"ASR {len(reviewed)}/{len(selected)} complete; {len(flagged)} lines need comparison review", flush=True)
            prior_count = len(reviewed)
        if not args.watch or reviewed == selected:
            return 2 if flagged else (0 if reviewed == selected else 3)
        time.sleep(args.poll)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error)) from None
