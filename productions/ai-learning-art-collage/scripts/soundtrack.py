#!/usr/bin/env python3
"""Original restrained plucked score and paper/wood foley on the film frame clock.

All sound is synthesized here from oscillators and seeded noise; no sample pack.
Preview: python scripts/soundtrack.py --preview-shots 3 --output-dir review/audio-preview
Final: python scripts/soundtrack.py (requires a non-draft complete timeline)
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[1]
SAMPLE_RATE = 48000


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")
    temporary.replace(path)


def selected_timeline(path, preview_shots=None):
    raw = path.read_bytes()
    timeline = json.loads(raw)
    timeline["_source_sha256"] = hashlib.sha256(raw).hexdigest()
    fps = timeline.get("fps")
    if isinstance(fps, bool) or not isinstance(fps, (int, float)) or not math.isfinite(fps) or fps <= 0:
        raise ValueError("Timeline fps must be finite and positive")
    all_shots = timeline.get("shots", [])
    if preview_shots is not None and not 1 <= preview_shots <= len(all_shots):
        raise ValueError("Preview count must select existing shots")
    shots = all_shots[:preview_shots] if preview_shots else all_shots
    if not shots:
        raise ValueError("No selected shots")
    if not preview_shots and timeline.get("draft") is not False:
        raise ValueError("Draft timing cannot produce a final soundtrack; use --preview-shots")
    if len({str(shot["id"]) for shot in all_shots}) != len(all_shots):
        raise ValueError("Duplicate timeline shot IDs")
    if timeline.get("duration_frames") != all_shots[-1]["end"]:
        raise ValueError("Declared timeline duration differs from the final shot")
    if not preview_shots:
        canonical = json.loads((ROOT / "content/narration.json").read_text())
        if [str(row["id"]) for row in canonical] != [str(shot["id"]) for shot in shots]:
            raise ValueError("Final timeline does not cover the complete canonical narration in order")
    previous = 0
    for shot in shots:
        if not all(type(shot[field]) is int for field in ("start", "end", "voice_start", "voice_end")):
            raise ValueError("Timeline boundaries must be integer frames")
        if shot["start"] != previous or not shot["start"] <= shot["voice_start"] < shot["voice_end"] <= shot["end"]:
            raise ValueError("Timeline is not contiguous or voice bounds are invalid")
        duration = shot.get("voice_duration")
        if not isinstance(duration, (int, float)) or not math.isfinite(duration) or duration <= 0:
            raise ValueError("Voice duration must be finite and positive")
        if not preview_shots and not shot.get("audio"):
            raise ValueError("Final timing requires real audio for every shot")
        previous = shot["end"]
    for event in timeline.get("events", []):
        if type(event.get("frame")) is not int or not 0 <= event["frame"] < timeline["duration_frames"]:
            raise ValueError("Timeline event is outside integer-frame bounds")
    return timeline, shots, shots[-1]["end"]


def frame_sample(frame, fps):
    return round(frame * SAMPLE_RATE / fps)


def write_wav(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not np.isfinite(data).all() or np.max(np.abs(data), initial=0) >= 1:
        raise ValueError("Refusing nonfinite or clipped PCM")
    pcm = np.round(data * 32767).astype("<i2")
    temporary = path.with_suffix(".tmp.wav")
    with wave.open(str(temporary), "wb") as stream:
        stream.setnchannels(1 if pcm.ndim == 1 else pcm.shape[1])
        stream.setsampwidth(2)
        stream.setframerate(SAMPLE_RATE)
        stream.writeframes(pcm.tobytes())
    temporary.replace(path)


def metrics(data):
    peak = float(np.max(np.abs(data), initial=0))
    rms = float(np.sqrt(np.mean(data.astype(np.float64) ** 2)))
    return {"sample_peak": peak, "sample_peak_dbfs": 20 * math.log10(max(peak, 1e-12)),
            "rms": rms, "rms_dbfs": 20 * math.log10(max(rms, 1e-12)),
            "samples_at_or_above_full_scale": int(np.count_nonzero(np.abs(data) >= 1)),
            "finite": bool(np.isfinite(data).all()), "lufs": "not measured"}


def add(stereo, sound, at, amplitude=1, pan=0):
    start = round(at * SAMPLE_RATE)
    if start >= len(stereo):
        return
    if start < 0:
        sound, start = sound[-start:], 0
    count = min(len(sound), len(stereo) - start)
    if count <= 0:
        return
    angle = (max(-1, min(1, pan)) + 1) * math.pi / 4
    stereo[start:start + count, 0] += sound[:count] * (amplitude * math.cos(angle))
    stereo[start:start + count, 1] += sound[:count] * (amplitude * math.sin(angle))


def pluck(midi, duration=1.8, soft=1.0):
    t = np.arange(round(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    frequency = 440 * 2 ** ((midi - 69) / 12)
    attack = 1 - np.exp(-t / 0.005)
    tone = np.zeros_like(t)
    for harmonic, gain, decay in [(1, 1, 1.25), (2, .24, .55), (3, .08, .27), (4, .035, .14)]:
        tone += gain * np.sin(2 * np.pi * frequency * harmonic * t) * np.exp(-t / (decay * soft))
    tone *= attack
    tone[-min(len(tone), 1200):] *= np.linspace(1, 0, min(len(tone), 1200))
    return tone


def felt_chord(notes, duration=4):
    t = np.arange(round(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    signal = np.zeros_like(t)
    envelope = (1 - np.exp(-t / .045)) * np.exp(-t / 1.8)
    for midi in notes:
        f = 440 * 2 ** ((midi - 69) / 12)
        signal += (np.sin(2 * np.pi * f * t) + .09 * np.sin(2 * np.pi * f * 2 * t)) / len(notes)
    signal *= envelope
    signal[-2400:] *= np.linspace(1, 0, 2400)
    return signal


def paper(duration, rng, direction="slide"):
    count = round(duration * SAMPLE_RATE)
    noise = rng.standard_normal(count).astype(np.float32)
    bands = sosfilt(butter(2, [650, 6500], btype="bandpass", fs=SAMPLE_RATE, output="sos"), noise).astype(np.float32)
    t = np.linspace(0, 1, count)
    envelope = np.sin(np.pi * t) ** (1.8 if direction == "slide" else 4)
    envelope *= .6 + .4 * np.sin(t * 21 + rng.random() * 6) ** 2
    return bands * envelope * .34


def knock(rng, hard=False):
    t = np.arange(round(.16 * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    tone = np.sin(2 * np.pi * (190 if hard else 310) * t) * np.exp(-t / .035)
    tone += .18 * rng.standard_normal(len(t)) * np.exp(-t / .006)
    tone *= np.minimum(1, t / .001)
    return tone.astype(np.float32)


def compose_score(duration):
    score = np.zeros((round(duration * SAMPLE_RATE), 2), dtype=np.float32)
    bpm, beat = 86, 60 / 86
    # Cmaj7 / Am7 / Fmaj7 / Gsus2; a quiet four-note motif varies over 16 bars.
    harmony = [([48, 55, 59, 64], 36), ([45, 52, 55, 60], 33),
               ([41, 48, 52, 57], 29), ([43, 50, 55, 57], 31)]
    melodies = [[64, 67, 69, 67], [64, 60, 62, 64], [65, 69, 67, 64], [62, 67, 64, 62]]
    events = []
    for bar in range(math.ceil(duration / (4 * beat))):
        at = bar * 4 * beat
        chord, bass = harmony[(bar // 2) % len(harmony)]
        # Musical breathing every eighth bar leaves space for the voice.
        intensity = .62 if bar % 8 in (6, 7) else 1
        add(score, felt_chord(chord), at, .065 * intensity, -.22)
        if bar % 2 == 0:
            add(score, pluck(bass, 2.4, 1.6), at + .04, .085 * intensity, 0)
        melody = melodies[(bar // 4) % 4]
        pattern = [(0.5, melody[bar % 4]), (2.0, melody[(bar + 1) % 4])]
        if bar % 4 == 2:
            pattern.append((3.25, melody[(bar + 3) % 4]))
        if bar % 8 == 7:
            pattern = []
        for slot, note in pattern:
            add(score, pluck(note + (12 if bar % 16 == 12 else 0), 1.6), at + slot * beat,
                .068 * intensity, .25 if slot < 2 else -.3)
        events.append({"bar": bar, "seconds": round(at, 6), "chord_midi": chord, "bass_midi": bass})
    rms = float(np.sqrt(np.mean(score ** 2)))
    if rms:
        score *= 10 ** (-27 / 20) / rms
    fade = min(len(score) // 2, round(1.25 * SAMPLE_RATE))
    score[:fade] *= np.linspace(0, 1, fade)[:, None]
    score[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return score, {"tempo_bpm": bpm, "meter": "4/4", "composition": "Original deterministic oscillator composition",
                   "instrumentation": "Muted plucked tones, felt-like chord partials and soft bass",
                   "sample_libraries": [], "musical_events": events}


def compose_foley(timeline, shots, end_frame):
    fps = timeline["fps"]
    foley = np.zeros((frame_sample(end_frame, fps), 2), dtype=np.float32)
    rng = np.random.default_rng(43218)
    cues, last = [], -1000.0
    shot_ids = {str(shot["id"]) for shot in shots}
    events = sorted(timeline.get("events", []), key=lambda item: item["frame"])
    for event in events:
        if event["frame"] >= end_frame or event["id"].split("-")[0] not in shot_ids:
            continue
        action = event.get("action", "")
        at = event["frame"] / fps
        kind = event.get("kind")
        # Sound cues are explicit and follow implemented movement, not plan prose.
        if kind is not None and kind not in {"wood", "fold", "slide", "pencil"}:
            raise ValueError(f"Unknown foley kind: {kind}")
        if kind is None or at - last < 3.2:
            continue
        if kind == "wood":
            signal, amplitude = knock(rng, "stamp" in action), .055
        elif kind == "fold":
            signal, amplitude = paper(.25, rng, "fold"), .12
        elif kind == "pencil":
            signal, amplitude = paper(.16, rng), .045
        else:
            signal, amplitude = paper(.42, rng), .09
        add(foley, signal, at, amplitude, float(rng.uniform(-.25, .25)))
        cues.append({"timeline_event": event["id"], "frame": event["frame"], "seconds": at,
                     "kind": kind, "action": event["action"]})
        last = at
    return foley, cues


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timeline", type=Path, default=ROOT / "media/timeline.json")
    parser.add_argument("--preview-shots", type=int)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "media")
    args = parser.parse_args()
    timeline, shots, end_frame = selected_timeline(args.timeline, args.preview_shots)
    duration = end_frame / timeline["fps"]
    score, composition = compose_score(duration)
    foley, cues = compose_foley(timeline, shots, end_frame)
    if digest(args.timeline) != timeline["_source_sha256"]:
        raise ValueError("Timeline changed during composition; regenerate from its current version")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    write_wav(args.output_dir / "score.wav", score)
    write_wav(args.output_dir / "foley.wav", foley)
    report = {"preview": bool(args.preview_shots), "selected_shots": [s["id"] for s in shots],
              "timeline_sha256": timeline["_source_sha256"], "duration_frames": end_frame,
              "fps": timeline["fps"], "duration_seconds": duration, "sample_rate": SAMPLE_RATE,
              "composition": composition, "foley_cues": cues,
              "score": metrics(score), "foley": metrics(foley),
              "score_sha256": digest(args.output_dir / "score.wav"),
              "foley_sha256": digest(args.output_dir / "foley.wav"), "ffmpeg_used": False,
              "listening_review": "pending"}
    write_json(args.output_dir / "soundtrack-report.json", report)
    print(f"{'PREVIEW' if args.preview_shots else 'FINAL'} score/foley: {duration:.3f}s, {len(cues)} selected action cues")


if __name__ == "__main__":
    main()
