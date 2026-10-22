#!/usr/bin/env python3
"""Place original Chatterbox PCM on frame timing and duck an original music bed."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import wave

import numpy as np
from scipy.signal import resample_poly

from soundtrack import ROOT, SAMPLE_RATE, digest, frame_sample, metrics, selected_timeline, write_json, write_wav


def read_wav(path):
    with wave.open(str(path), "rb") as stream:
        rate, channels, width = stream.getframerate(), stream.getnchannels(), stream.getsampwidth()
        frames = stream.getnframes()
        raw = stream.readframes(frames)
    if width != 2 or not channels or not frames or len(raw) != frames * channels * width:
        raise ValueError("Complete nonempty PCM16 input required")
    data = np.frombuffer(raw, "<i2").astype(np.float32).reshape(-1, channels) / 32768
    if rate != SAMPLE_RATE:
        divisor = math.gcd(rate, SAMPLE_RATE)
        data = resample_poly(data, SAMPLE_RATE // divisor, rate // divisor, axis=0).astype(np.float32)
    return data


def duck_envelope(length, intervals):
    envelope = np.ones(length, dtype=np.float32)
    for start, end in intervals:
        lead, release = round(.20 * SAMPLE_RATE), round(.42 * SAMPLE_RATE)
        a, b = max(0, start - lead), min(length, end + release)
        envelope[start:end] = np.minimum(envelope[start:end], .20)
        if start > a:
            envelope[a:start] = np.minimum(envelope[a:start], np.linspace(1, .20, start - a))
        if b > end:
            envelope[end:b] = np.minimum(envelope[end:b], np.linspace(.20, 1, b - end))
    return envelope


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timeline", type=Path, default=ROOT / "media/timeline.json")
    parser.add_argument("--manifest", type=Path, default=ROOT / "media/audio/manifest.json")
    parser.add_argument("--preview-shots", type=int)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "media")
    args = parser.parse_args()
    timeline, shots, end_frame = selected_timeline(args.timeline, args.preview_shots)
    fps = timeline["fps"]
    rows = json.loads(args.manifest.read_text())
    manifest = {str(row["id"]): row for row in rows}
    if len(manifest) != len(rows):
        raise ValueError("Duplicate audio manifest IDs")
    stem_report = json.loads((args.output_dir / "soundtrack-report.json").read_text())
    if stem_report["timeline_sha256"] != timeline["_source_sha256"] or stem_report["duration_frames"] != end_frame:
        raise ValueError("Soundtrack timing is stale; regenerate score and foley for this timeline")
    length = frame_sample(end_frame, fps)
    voice = np.zeros((length, 2), dtype=np.float32)
    placements, intervals = [], []
    for shot in shots:
        row = manifest.get(str(shot["id"]))
        if not row or not shot.get("audio"):
            raise ValueError(f"Missing real audio for shot {shot['id']}")
        path = ROOT / shot["audio"]
        if path != ROOT / row["path"] or digest(path) != row["audio_sha256"]:
            raise ValueError("Timeline voice source differs from current manifest")
        if shot["text"] != row["text"] or hashlib.sha256(row["text"].encode()).hexdigest() != row["source_sha256"]:
            raise ValueError("Timeline narration text differs from current manifest")
        data = read_wav(path)
        if data.shape[1] != 1:
            raise ValueError("Original narration must be mono")
        start = frame_sample(shot["voice_start"], fps)
        end = start + len(data)
        if abs(len(data) / SAMPLE_RATE - shot["voice_duration"]) > 1 / SAMPLE_RATE + 1e-9 or end > frame_sample(shot["voice_end"], fps):
            raise ValueError("Real narration no longer fits the supplied frame timeline")
        rms = float(np.sqrt(np.mean(data ** 2)))
        peak = float(np.max(np.abs(data)))
        if rms < 1e-7 or not np.isfinite(data).all():
            raise ValueError("Narration is silent or nonfinite")
        gain = min(10 ** (-20 / 20) / max(rms, 1e-10), .76 / max(peak, 1e-10), 1.8)
        voice[start:end] += data * gain
        intervals.append((start, end))
        placements.append({"id": shot["id"], "start_frame": shot["voice_start"], "start_sample": start,
                           "end_sample": end, "natural_speed": 1.0, "gain_db": 20 * math.log10(gain),
                           "source_sha256": row["audio_sha256"], "source_path": shot["audio"]})
    score, foley = (read_wav(args.output_dir / name) for name in ("score.wav", "foley.wav"))
    if score.shape != voice.shape or foley.shape != voice.shape:
        raise ValueError("Stem length/channels do not match frame timing")
    if digest(args.output_dir / "score.wav") != stem_report["score_sha256"] or digest(args.output_dir / "foley.wav") != stem_report["foley_sha256"]:
        raise ValueError("Soundtrack stem checksum changed")
    duck = duck_envelope(length, intervals)
    bed = score * duck[:, None]
    mix = voice + bed + foley
    peak = float(np.max(np.abs(mix)))
    master_gain = min(1.0, .89 / max(peak, 1e-10))
    mix *= master_gain
    if digest(args.timeline) != timeline["_source_sha256"]:
        raise ValueError("Timeline changed during mixing; regenerate from its current version")
    write_wav(args.output_dir / "mix.wav", mix)
    active_voice_square = sum(float(np.sum(voice[a:b].astype(np.float64) ** 2)) for a, b in intervals)
    active_bed_square = sum(float(np.sum(bed[a:b].astype(np.float64) ** 2)) for a, b in intervals)
    report = {"preview": bool(args.preview_shots), "selected_shots": [shot["id"] for shot in shots],
              "timeline_sha256": timeline["_source_sha256"], "duration_frames": end_frame, "fps": fps,
              "duration_seconds": end_frame / fps, "sample_rate": SAMPLE_RATE,
              "channels": 2, "placements": placements, "voice": metrics(voice),
              "music_after_duck": metrics(bed), "foley": metrics(foley), "mix": metrics(mix),
              "music_below_voice_during_speech_db": 10 * math.log10(max(active_voice_square, 1e-16) / max(active_bed_square, 1e-16)),
              "master_gain_db": 20 * math.log10(master_gain), "music_duck_db": 20 * math.log10(.20),
              "mix_sha256": digest(args.output_dir / "mix.wav"), "ffmpeg_used": False,
              "listening_review": "pending", "true_peak_and_lufs": "not measured; report contains sample peak and RMS only"}
    write_json(args.output_dir / "mix-report.json", report)
    print(json.dumps({"preview": report["preview"], "duration": report["duration_seconds"],
                      "sample_peak_dbfs": report["mix"]["sample_peak_dbfs"],
                      "music_below_voice_db": report["music_below_voice_during_speech_db"]}, indent=2))


if __name__ == "__main__":
    main()
