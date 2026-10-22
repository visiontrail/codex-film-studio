"""Build one integer-frame clock for picture, narration, captions and foley."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import wave

ROOT = Path(__file__).resolve().parents[1]
FPS = 25
CHAPTER_STARTS = {"04", "10", "18", "23", "28", "34", "36", "45"}


def unique_rows(rows, name):
    indexed = {str(row["id"]): row for row in rows}
    if len(indexed) != len(rows):
        raise ValueError(f"Duplicate IDs in {name}")
    return indexed


def verified_duration(source, audio):
    """Verify identity and the PCM clock, without treating this as listening."""
    source_hash = hashlib.sha256(source["text"].encode()).hexdigest()
    if audio["text"] != source["text"] or audio["source_sha256"] != source_hash:
        raise ValueError(f"Narration source mismatch for {source['id']}")
    path = ROOT / audio["path"]
    if hashlib.sha256(path.read_bytes()).hexdigest() != audio["audio_sha256"]:
        raise ValueError(f"Audio digest mismatch for {source['id']}")
    with wave.open(str(path), "rb") as wav:
        duration = wav.getnframes() / wav.getframerate()
        if wav.getnframes() != audio["frames"] or wav.getframerate() != audio["sample_rate"]:
            raise ValueError(f"PCM metadata mismatch for {source['id']}")
    if not math.isclose(duration, audio["duration"], abs_tol=1e-6):
        raise ValueError(f"Audio duration mismatch for {source['id']}")
    return duration


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--draft", action="store_true")
    args = parser.parse_args()
    lines = json.loads((ROOT / "content/narration.json").read_text())
    by_source = unique_rows(lines, "narration")
    plans = json.loads((ROOT / "content/shot-plan.json").read_text())
    if isinstance(plans, dict):
        plans = plans.get("shots", plans.get("scenes", []))
    by_plan = unique_rows(plans, "shot plan")
    if set(by_plan) != set(by_source):
        raise ValueError("Shot-plan IDs do not match narration")
    manifest_path = ROOT / "media/audio/manifest.json"
    audio = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
    if isinstance(audio, dict):
        audio = audio.get("lines", [])
    by_audio = unique_rows(audio, "audio manifest")
    if set(by_audio) - set(by_source):
        raise ValueError("Audio manifest contains unknown IDs")
    cues = json.loads((ROOT / "content/audio-cues.json").read_text())["cues"]
    at, shots, events = 0, [], []
    for index, row in enumerate(lines):
        voice = by_audio.get(row["id"])
        if voice:
            duration = verified_duration(row, voice)
        elif args.draft:
            duration = len(row["text"].split()) / 3.15
        else:
            raise ValueError(f"Missing speech for {row['id']}")
        lead = (13 if row["id"] in CHAPTER_STARTS else 7) if index else 35
        tail = 30 if index == len(lines) - 1 else 8
        speech_frames = math.ceil(duration * FPS)
        count = lead + speech_frames + tail
        shot = {
            **by_plan[row["id"]], **row, "index": index,
            "start": at, "end": at + count,
            "voice_start": at + lead, "voice_end": at + lead + speech_frames,
            "voice_duration": duration, "audio": voice["path"] if voice else None,
            "source_sha256": voice["source_sha256"] if voice else None,
            "audio_sha256": voice["audio_sha256"] if voice else None,
        }
        shots.append(shot)
        for cue_index, cue in enumerate(cues):
            if cue["shot"] != row["id"]:
                continue
            relative = (cue["fraction"] * count if "fraction" in cue else
                        cue.get("seconds", cue.get("voice_fraction", 0) * duration
                                + cue.get("offset_seconds", 0)) * FPS)
            events.append({"id": f"{row['id']}-sound-{cue_index}",
                           "frame": at + round(relative),
                           "kind": cue["kind"], "action": cue["action"]})
        at += count
    output = {
        "title": "Does AI Help You Learn—or Just Finish?", "fps": FPS,
        "width": 1920, "height": 1080, "duration_frames": at,
        "duration_seconds": at / FPS, "draft": args.draft,
        "shots": shots, "events": events,
    }
    (ROOT / "media/timeline.json").write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n")
    print(f"{len(shots)} shots, {at/FPS:.2f}s, {at} frames, draft={args.draft}")


if __name__ == "__main__":
    main()
