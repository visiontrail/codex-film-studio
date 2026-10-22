#!/usr/bin/env python3
"""One authorized editorial adoption for the unchanged segment 33v2 WAV.

Canonical narration and the original provider request retain separate identities.
This is not a general ASR mismatch waiver or a spelling normalization.
"""
import hashlib
import json
from pathlib import Path

ORIGINAL_SHA = "4f8ca8b6516426029b028c101f58cd59b735d29eccd56638d71e5ddc5361715c"
CANONICAL_SHA = "a3701ae6d4d2ef04818dae01cf4917695f79bd16782d13b232927a0dd8513cb6"
AUDIO_SHA = "084ccc1deac6ab93824725b371c3ad65f2c4c1f6a41e1ab500551fde62e1b993"
DECISION = "review/audio-repair33-adopted/canonical-transcript-adoption.json"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def checked_file(root, item):
    path = (root / item["path"]).resolve()
    if not path.is_relative_to(root.resolve()) or sha(path.read_bytes()) != item["sha256"]:
        raise ValueError("Transcript adoption evidence changed or escaped the production")
    return json.loads(path.read_text())


def validate_adoption(row, root):
    """Return the exact decision and four unmodified, canonically matching runs."""
    import subtitles

    root = Path(root).resolve()
    reference = row.get("canonical_transcript_adoption", {})
    if (str(row["id"]) != "33" or reference.get("path") != DECISION
            or row["source_sha256"] != CANONICAL_SHA or row["audio_sha256"] != AUDIO_SHA
            or row.get("synthesis_sha256") != ORIGINAL_SHA
            or sha(row["text"].encode()) != CANONICAL_SHA
            or sha(row.get("synthesis_text", "").encode()) != ORIGINAL_SHA):
        raise ValueError("Transcript adoption is not the exact authorized segment 33")
    old, new = row["synthesis_text"], row["text"]
    if old.count("the test included") != 1 or old.replace("the test included", "the tests included") != new:
        raise ValueError("Transcript adoption changes more than the authorized singular/plural wording")
    decision = checked_file(root, reference)
    if (decision.get("status") != "authorized_editorial_adoption" or decision.get("id") != "33"
            or decision.get("original_text") != old or decision.get("canonical_text") != new
            or decision.get("original_source_sha256") != ORIGINAL_SHA
            or decision.get("canonical_source_sha256") != CANONICAL_SHA
            or decision.get("audio_sha256") != AUDIO_SHA
            or decision.get("authorization", {}).get("scope") != "Only segment 33v2: the test included -> the tests included"
            or decision.get("listening_established") is not False):
        raise ValueError("Transcript adoption decision is not the bounded authorized edit")
    original_rows = checked_file(root, decision["original_manifest"])
    if len(original_rows) != 1:
        raise ValueError("Original isolated 33v2 manifest changed")
    original = original_rows[0]
    expected = {**original, "text": new, "source_sha256": CANONICAL_SHA,
                "canonical_transcript_adoption": reference}
    if row != expected:
        raise ValueError("Adopted manifest changed fields outside canonical text/source identity")
    if original["source_sha256"] != ORIGINAL_SHA or original["text"] != old:
        raise ValueError("Original synthesis source identity changed")
    for item in decision["retained_evidence"]:
        checked_file(root, item)
    runs = []
    for item in decision["raw_asr_evidence"]:
        report = checked_file(root, item)
        if report.get("source_sha256") != ORIGINAL_SHA or report.get("audio_sha256") != AUDIO_SHA:
            raise ValueError("Raw adoption ASR is not bound to the original synthesis request/WAV")
        if "model_repo" in report:
            runs.append({"model": report["model_repo"], "padding_seconds": 0,
                         "transcript": report["transcript"], "words_in_original_clock": report["words"]})
        elif "reviews" in report:
            runs.extend(report["reviews"])
        else:
            runs.append(report)
    expected_runs = {("whisper-large-v3-turbo-q4", 0), ("whisper-large-v3-turbo-q4", .5),
                     ("whisper-medium-mlx", 0), ("whisper-medium-mlx", .5)}
    actual_runs = {(r["model"].removeprefix("mlx-community/"), r["padding_seconds"]) for r in runs}
    if len(runs) != 4 or actual_runs != expected_runs:
        raise ValueError("Adoption requires the four preserved independent decodes")
    for run in runs:
        subtitles.validate_word_times(run["words_in_original_clock"], row["duration"])
        subtitles.source_alignment(new, run["words_in_original_clock"])
    return decision, runs
