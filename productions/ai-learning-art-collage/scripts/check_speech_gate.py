#!/usr/bin/env python3
"""Check all 46 canonical lines, WAVs and subtitle word timings without a timeline.

--with-repairs checks the proposed merge in memory. No narration, manifest,
WAV, ASR or timeline is changed. This does not generate a timed final SRT or
establish listening quality.
"""
import argparse
import hashlib
import json
from pathlib import Path
import wave

import merge_audio_repairs as merge
import subtitles

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def check(root, with_repairs):
    source_path, manifest_path = root / "content/narration.json", root / "media/audio/manifest.json"
    original_source, original_manifest = source_path.read_bytes(), manifest_path.read_bytes()
    canonical, rows = json.loads(original_source), json.loads(original_manifest)
    source, audio = merge.validate_main_manifest(canonical, rows, root)
    directories = {key: root / "review/asr" for key in source}
    candidates = json.loads((root / "review/audio-repairs-v1/merge-candidates.json").read_text())
    if set(merge.unique_rows(candidates, "Candidate list")) != merge.TARGET_IDS:
        raise ValueError("Candidate set is incomplete")
    for candidate in candidates:
        key = candidate["id"]
        new_source, new_audio, old_source, old_audio, _ = merge.verify_repair(root, candidate)
        if with_repairs:
            if source[key]["text"] != old_source["text"] or audio[key] != old_audio:
                raise ValueError(f"{key}: original source/audio changed before the proposed merge")
            source[key] = {**source[key], "text": new_source["text"]}
            audio[key] = new_audio
            directories[key] = (root / candidate["accepted_directory"]).parent
        elif source[key]["text"] != new_source["text"] or audio[key] != new_audio:
            raise ValueError(f"{key}: actual production has not adopted the validated candidate")
    effective_source = [source[str(row["id"])] for row in canonical]
    effective_manifest = [audio[str(row["id"])] for row in rows]
    merge.validate_main_manifest(effective_source, effective_manifest, root)
    results, errors, total_seconds, total_frames = [], [], 0.0, 0
    for key in sorted(source):
        row = audio[key]
        try:
            with wave.open(str(root / row["path"]), "rb") as stream:
                rate, channels, width, frames = stream.getframerate(), stream.getnchannels(), stream.getsampwidth(), stream.getnframes()
                raw = stream.readframes(frames)
            if (rate, channels, width) != (24000, 1, 2) or len(raw) != frames * channels * width:
                raise ValueError("Incomplete or unexpected narration PCM")
            duration = frames / rate
            if abs(duration - row["duration"]) > 1 / rate or frames != row["frames"]:
                raise ValueError("WAV duration/frame count differs from manifest")
            words, method = subtitles.asr_words(row, directories[key])
            subtitles.validate_word_times(words, duration)
            equivalences = []
            aligned = subtitles.source_alignment(row["text"], words, equivalences)
            blocks = subtitles.groups(aligned, key)
            if " ".join(word["text"] for block in blocks for word in block) != row["text"]:
                raise ValueError("Subtitle grouping changes canonical source")
            total_seconds += duration
            total_frames += frames
            results.append({"id": key, "status": "accepted_text_and_alignment", "source_sha256": row["source_sha256"],
                "synthesis_sha256": row.get("synthesis_sha256"), "audio_sha256": row["audio_sha256"],
                "duration_seconds": duration, "subtitle_blocks": len(blocks), "method": method,
                "spelling_equivalences": equivalences})
        except (ValueError, KeyError, OSError, wave.Error) as error:
            errors.append({"id": key, "error": str(error)})
    if source_path.read_bytes() != original_source or manifest_path.read_bytes() != original_manifest:
        raise ValueError("Main source/manifest changed during the read-only gate")
    return {"status": "pass" if not errors and len(results) == 46 else "fail",
        "mode": "proposed_merge_in_memory" if with_repairs else "actual_merged_production",
        "canonical_file_sha256": sha(original_source), "manifest_file_sha256": sha(original_manifest),
        "proposed_canonical_sha256": sha(merge.encoded(effective_source)) if with_repairs else None,
        "proposed_manifest_sha256": sha(merge.encoded(effective_manifest)) if with_repairs else None,
        "accepted_count": len(results), "expected_count": 46, "results": results, "errors": errors,
        "total_narration_seconds": total_seconds, "total_narration_pcm_frames_24000hz": total_frames,
        "canonical_word_count": sum(len(row["text"].split()) for row in effective_source),
        "subtitle_gate_scope": "Per-segment canonical text, unchanged ASR word timing and grouping; final timeline cue overlap/readability remains to be checked after timing is built.",
        "final_timed_srt_generated": False, "listening_established": False, "new_provider_requests": 0,
        "new_asr_decodes": 0, "ffmpeg_subprocesses": 0, "main_files_modified": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--with-repairs", action="store_true")
    parser.add_argument("--output", type=Path, default=ROOT / "review/audio-final-gate.json")
    args = parser.parse_args()
    try:
        report = check(ROOT, args.with_repairs)
    except (ValueError, KeyError, OSError, wave.Error) as error:
        report = {"status": "fail", "error": str(error), "main_files_modified": False,
                  "new_provider_requests": 0, "new_asr_decodes": 0, "ffmpeg_subprocesses": 0}
    merge.atomic_write(args.output.resolve(), merge.encoded(report))
    print(json.dumps({key: value for key, value in report.items() if key not in {"results"}}, indent=2))
    return 0 if report["status"] == "pass" else 2


if __name__ == "__main__":
    raise SystemExit(main())
