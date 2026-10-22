#!/usr/bin/env python3
"""Measure completed PCM activity and provisional inter-shot pauses without FFmpeg."""
import json
import math
from pathlib import Path

import numpy as np

from review_onset import load_pcm
from transcribe_audio import ROOT, sha, write_json


def boundaries(pcm, rate, threshold_dbfs):
    window = round(rate * .01)
    values = pcm.astype(np.float64) / 32768
    levels = np.array([np.sqrt(np.mean(values[a:a + window] ** 2))
                       for a in range(0, len(values), window)])
    active = np.flatnonzero(levels >= 10 ** (threshold_dbfs / 20))
    if not len(active):
        return None
    first, last = active[0] * window / rate, min(len(values), (active[-1] + 1) * window) / rate
    return {"threshold_dbfs": threshold_dbfs, "first_active_seconds": first,
            "last_active_end_seconds": last, "leading_inactive_seconds": first,
            "trailing_inactive_seconds": len(values) / rate - last}


def main():
    timeline_path = ROOT / "media/timeline.json"
    timeline_bytes = timeline_path.read_bytes()
    timeline = json.loads(timeline_bytes)
    rows = json.loads((ROOT / "media/audio/manifest.json").read_text())
    canonical = json.loads((ROOT / "content/narration.json").read_text())
    manifest = {str(row["id"]): row for row in rows}
    shots = {str(shot["id"]): shot for shot in timeline["shots"]}
    analyses = {}
    for source in canonical:
        line_id = str(source["id"])
        if line_id not in manifest:
            continue
        row = manifest[line_id]
        path = ROOT / row["path"]
        if sha(path.read_bytes()) != row["audio_sha256"] or row["text"] != source["text"]:
            raise ValueError("Audio/source identity changed")
        pcm, rate, _ = load_pcm(path)
        reports = list((ROOT / "review/asr").glob(f"{line_id}-{row['audio_sha256'][:16]}-*.json"))
        asr = json.loads(reports[0].read_text()) if len(reports) == 1 else None
        words = asr.get("words", []) if asr else []
        analyses[line_id] = {"id": line_id, "audio_sha256": row["audio_sha256"],
                             "duration_seconds": len(pcm) / rate,
                             "activity": [boundaries(pcm, rate, level) for level in [-45, -40, -35]],
                             "asr_first_word_start": words[0]["start"] if words else None,
                             "asr_last_word_end": words[-1]["end"] if words else None,
                             "asr_word_match": asr["comparison"]["exact_normalized_match"] if asr else None}
    fps = timeline["fps"]
    pairs = []
    for first, second in zip(canonical, canonical[1:]):
        a, b = str(first["id"]), str(second["id"])
        if a not in analyses or b not in analyses:
            continue
        left, right = analyses[a], analyses[b]
        sa, sb = shots[a], shots[b]
        direct_gap = sb["voice_start"] / fps - sa["voice_start"] / fps - left["duration_seconds"]
        tail_frames, lead_frames = sa["end"] - sa["voice_end"], sb["voice_start"] - sb["start"]
        rounding_tail = math.ceil(left["duration_seconds"] * fps) / fps - left["duration_seconds"]
        retimed_gap = (tail_frames + lead_frames) / fps + rounding_tail
        activity_gaps = []
        for previous, following in zip(left["activity"], right["activity"]):
            if previous is not None and following is not None:
                activity_gaps.append({"threshold_dbfs": previous["threshold_dbfs"],
                                      "seconds_if_retimed_with_current_padding_policy": retimed_gap + previous["trailing_inactive_seconds"] + following["leading_inactive_seconds"]})
        pairs.append({"from": a, "to": b,
                      "current_timeline_audio_duration_matches_both": all(abs(s["voice_duration"] - v["duration_seconds"]) <= 1e-7 for s, v in [(sa, left), (sb, right)]),
                      "current_timeline_pcm_end_to_next_pcm_start_seconds": direct_gap,
                      "padding_policy_tail_frames": tail_frames, "padding_policy_next_lead_frames": lead_frames,
                      "pcm_gap_if_retimed_with_current_padding_policy_seconds": retimed_gap,
                      "activity_gaps": activity_gaps,
                      "asr_word_gap_if_retimed_seconds": retimed_gap + left["duration_seconds"] - left["asr_last_word_end"] + right["asr_first_word_start"] if left["asr_last_word_end"] is not None and right["asr_first_word_start"] is not None else None})
    report = {"schema_version": 1, "timeline_sha256": sha(timeline_bytes), "timeline_draft": timeline.get("draft"),
              "completed_ids": list(analyses), "fps": fps, "segments": list(analyses.values()), "adjacent_pairs": pairs,
              "method": "Original PCM16 wave reading; 10 ms RMS windows at three explicit thresholds. Boundaries indicate signal activity, not phoneme recognition. ASR timings are reported separately, including unresolved transcripts.",
              "timing_limit": "Current timeline may contain estimates. Retimed gaps are predictions using real completed WAV lengths and the current frame-padding policy, not claims that a final mix exists.",
              "original_wavs_modified": False, "provider_jobs_submitted": False, "ffmpeg_used": False,
              "listening_established": False}
    output = ROOT / "review/audio-pauses.json"
    write_json(output, report)
    print(json.dumps({"output": str(output), "completed": list(analyses), "pairs": pairs}, indent=2))


if __name__ == "__main__":
    main()
