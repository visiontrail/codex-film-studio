#!/usr/bin/env python3
"""Source-faithful SRT using independently transcribed word timings.

Incomplete or unresolved speech cannot produce an accepted final subtitle file.
Preview subsets are explicitly marked in the accompanying coverage report.
"""
import argparse
import difflib
import hashlib
import json
import math
from pathlib import Path
import re
import textwrap

from soundtrack import ROOT, digest, selected_timeline, write_json
from transcribe_audio import tokens


def exact_homophone_words(row, directory):
    """One explicitly adjudicated phoneme-equivalent phrase, never a global rule."""
    source_hash = "fa17474d4fdb79f61cc1919f63b4a300ce79886cf50128d14bc63f3b578409f9"
    audio_hash = "112f2f448c38b48b294a69cb25d5a5ad8fa5f74ae0fc469a6a17031d951100df"
    if str(row["id"]) != "04" or row["source_sha256"] != source_hash or row["audio_sha256"] != audio_hash:
        return None
    candidate = directory / "homophone-review.json"
    if not candidate.exists():
        return None
    report = json.loads(candidate.read_text())
    if (report.get("id") != "04" or report.get("source") != row["text"]
            or report.get("source_sha256") != source_hash or report.get("audio_sha256") != audio_hash
            or hashlib.sha256(row["text"].encode()).hexdigest() != source_hash):
        raise ValueError("Homophone adjudication identity mismatch")
    decision = report.get("adjudication", {})
    if decision.get("status") != "phoneme_equivalent_word_boundary" or decision.get("accept_for_canonical_subtitles") is not True:
        raise ValueError("Homophone caption decision is not accepted")
    original_path = directory / "review-04.json"
    if digest(original_path) != report["original_asr_report_sha256"]:
        raise ValueError("Original homophone evidence changed")
    original = json.loads(original_path.read_text())
    if original["audio_sha256"] != audio_hash or original["source_sha256"] != source_hash:
        raise ValueError("Original ASR evidence identity mismatch")
    review = original["reviews"][0]
    words = [dict(word) for word in review["words_in_original_clock"]]
    if [tokens(word["word"]) for word in words[:7]] != [[t] for t in "that pauses the subject of this film".split()]:
        raise ValueError("Homophone evidence is not the exact approved phrase")
    shared_interval = words[1]
    words[1:2] = [{**shared_interval, "word": " pause"}, {**shared_interval, "word": " is"}]
    # Check the entire line after this one substitution; other differences still fail.
    if word_units(words)[0] != tokens(row["text"]):
        raise ValueError("Additional word mismatch outside the approved homophone phrase")
    return words, {"file": str(candidate.resolve()), "selection": "Exact hash-bound phoneme-equivalence adjudication",
                   "model": review["model"], "padding_seconds": review["padding_seconds"],
                   "canonical_phrase": "pause is", "asr_phrase": "pauses",
                   "word_timing_note": "pause and is share the original single-token interval; internal word boundary is not measured",
                   "listening_established": False}


def asr_words(row, directory):
    exact = exact_homophone_words(row, directory)
    if exact is not None:
        return exact
    # Explicit adjudication of the original segment 09; raw ASR files stay intact.
    approved = directory / "alignment-review-09.json"
    if (str(row["id"]) == "09" and row["source_sha256"] == "3d0625191f1a061fa3691944b294dbcd8c2fff3b292f3c0b87f7edbae911abfc"
            and row["audio_sha256"] == "34482c12455976744e25d9e96ae188095df336ad79dddb62b0912eb47136412b" and approved.exists()):
        decision = json.loads(approved.read_text())
        if (decision.get("source") != row["text"] or decision.get("audio_sha256") != row["audio_sha256"]
                or decision.get("source_sha256") != row["source_sha256"] or decision.get("accepted_for_subtitles") is not True
                or decision.get("status") != "approved_cross_model_token_corroboration"):
            raise ValueError("Segment 09 alignment decision identity mismatch")
        for evidence in decision["evidence_files"]:
            if digest(ROOT / evidence["path"]) != evidence["sha256"]:
                raise ValueError("Segment 09 alignment evidence changed")
        report = json.loads((directory / decision["primary_report"]).read_text())
        review = report["reviews"][decision["primary_run_index"]]
        if not review["comparison"]["exact_normalized_match"]:
            raise ValueError("Approved segment 09 decode no longer matches")
        return review["words_in_original_clock"], {"file": str(approved.resolve()),
            "selection": "Explicit hash-bound token corroboration decision", "model": review["model"],
            "padding_seconds": review["padding_seconds"], "listening_established": False}
    batch_path = directory / "batch" / f"{row['id']}-{row['audio_sha256'][:16]}-{row['source_sha256'][:12]}.json"
    if batch_path.exists():
        batch = json.loads(batch_path.read_text())
        if (batch.get("status") == "accepted_text_and_alignment" and batch.get("id") == str(row["id"]) and batch.get("source") == row["text"]
                and batch.get("source_sha256") == row["source_sha256"] and batch.get("audio_sha256") == row["audio_sha256"]):
            if row.get("canonical_transcript_adoption"):
                from transcript_adoption import validate_adoption
                _, adoption_runs = validate_adoption(row, ROOT)
                if (batch.get("canonical_transcript_adoption") != row["canonical_transcript_adoption"]
                        or batch.get("synthesis_sha256") != row["synthesis_sha256"]
                        or not any(batch["selected_words"] == run["words_in_original_clock"] for run in adoption_runs)):
                    raise ValueError("Adopted caption identity or original word timestamps changed")
            if not batch.get("evidence_files"):
                raise ValueError("Batch alignment has no source evidence")
            for evidence in batch["evidence_files"]:
                if digest(ROOT / evidence["path"]) != evidence["sha256"]:
                    raise ValueError("Batch alignment evidence changed")
            method = {"file": str(batch_path.resolve()),
                "selection": batch["acceptance_basis"], "model": batch["selected_model"],
                "padding_seconds": batch.get("selected_padding_seconds", 0), "listening_established": False}
            if row.get("canonical_transcript_adoption"):
                method["canonical_transcript_adoption"] = row["canonical_transcript_adoption"]
                method["synthesis_sha256"] = row["synthesis_sha256"]
            return batch["selected_words"], method
    for name in [f"onset-review-{row['id']}.json", f"review-{row['id']}.json"]:
        candidate = directory / name
        if not candidate.exists():
            continue
        report = json.loads(candidate.read_text())
        if report.get("audio_sha256") == row["audio_sha256"] and report.get("source") == row["text"]:
            matched = [review for review in report.get("reviews", []) if review["comparison"]["exact_normalized_match"]]
            # One convenient matching decode cannot overrule a conflicting model.
            if len({review["model"] for review in matched}) >= 2:
                review = matched[0]
                return review["words_in_original_clock"], {"file": str(candidate.resolve()),
                    "selection": "Independent recheck with full-source agreement across two models",
                    "model": review["model"], "padding_seconds": review["padding_seconds"]}
    candidates = list(directory.glob(f"{row['id']}-{row['audio_sha256'][:16]}-*.json"))
    if len(candidates) != 1:
        raise ValueError(f"No unique source-bound ASR for {row['id']}")
    report = json.loads(candidates[0].read_text())
    if report["audio_sha256"] != row["audio_sha256"] or report["source_sha256"] != row["source_sha256"]:
        raise ValueError("ASR source identity mismatch")
    return report["words"], {"file": str(candidates[0].resolve()), "selection": "Original independent ASR",
                            "model": report["model_repo"]}


def validate_word_times(words, duration):
    previous_start = -1.0
    for word in words:
        start, end = word.get("start"), word.get("end")
        if not isinstance(start, (int, float)) or not isinstance(end, (int, float)):
            raise ValueError("ASR word timestamps must be numeric")
        if not math.isfinite(start) or not math.isfinite(end) or not 0 <= start <= end <= duration + .08:
            raise ValueError("ASR word timestamps exceed the source audio")
        if start < previous_start - .02:
            raise ValueError("ASR word timestamps run backwards")
        previous_start = start


def word_units(words, with_origins=False):
    units, refs, origins = [], [], []
    index = 0
    while index < len(words):
        word = words[index]
        text = word["word"].strip()
        end = word["end"]
        # One declared compound-spelling equivalence; no omitted words waived.
        if tokens(text) == ["chat"] and index + 1 < len(words) and tokens(words[index + 1]["word"]) == ["bot"]:
            text, end = "chatbot", words[index + 1]["end"]
            index += 1
        for unit in tokens(text):
            units.append(unit)
            refs.append((word["start"], end))
            origins.append(text)
        index += 1
    return (units, refs, origins) if with_origins else (units, refs)


def decimal_spelling_words(words, equivalences_out=None):
    """Expand numeric decimal glyphs locally; do not waive an absent decimal point.

    Whisper may emit 4.5 as one word or as adjacent 4 and .5 tokens. The
    fractional digits retain their exact value, including trailing zeroes.
    Source files and first-pass ASR remain unchanged.
    """
    result = []
    for index, word in enumerate(words):
        raw = word["word"].strip()
        whole = re.fullmatch(r"(\d+)\.(\d+)[.,:;!?]?", raw)
        fraction = re.fullmatch(r"\.(\d+)[.,:;!?]?", raw)
        previous = words[index - 1]["word"].strip() if index else ""
        if whole:
            spoken = tokens(whole[1]) + ["point"] + [tokens(digit)[0] for digit in whole[2]]
            numeric_glyphs = whole[1] + "." + whole[2]
        elif fraction and re.fullmatch(r"\d+", previous):
            spoken = ["point"] + [tokens(digit)[0] for digit in fraction[1]]
            numeric_glyphs = previous + "." + fraction[1]
        else:
            result.append(word)
            continue
        result.append({**word, "word": " " + " ".join(spoken)})
        if equivalences_out is not None:
            equivalences_out.append({"asr_numeric_glyphs": numeric_glyphs,
                "raw_asr_word": raw, "expanded_word_units": spoken,
                "reason": "Explicit decimal glyph; fractional digits preserved exactly",
                "shared_time_interval": [word["start"], word["end"]],
                "timing_note": "Expanded units share the original ASR token interval; internal boundaries are not measured"})
    return result


def algebraic_spelling_words(words, equivalences_out=None):
    """Expand explicit coefficient/subtraction glyphs, preserving sign and value."""
    result = []
    for word in words:
        raw = word["word"].strip()
        match = re.fullmatch(r"(\d+)x[.,:;!?]?", raw)
        subtraction = re.fullmatch(r"[-\u2212](\d+)[.,:;!?]?", raw)
        if match:
            spoken = tokens(match[1]) + ["x"]
            glyphs = match[1] + "x"
            reason = "Explicit integer coefficient beside x; coefficient value retained exactly"
        elif subtraction:
            spoken = ["minus"] + tokens(subtraction[1])
            glyphs = "-" + subtraction[1]
            reason = "Explicit subtraction sign before an integer; sign and integer value retained exactly"
        else:
            result.append(word)
            continue
        result.append({**word, "word": " " + " ".join(spoken)})
        if equivalences_out is not None:
            equivalences_out.append({"asr_numeric_glyphs": glyphs,
                "raw_asr_word": raw, "expanded_word_units": spoken,
                "reason": reason,
                "shared_time_interval": [word["start"], word["end"]],
                "timing_note": "Expanded units share the original ASR token interval; internal boundaries are not measured"})
    return result


def year_spelling_words(words, source_units, equivalences_out=None):
    """The explicit year glyph 2026 may follow the source's twenty-twenty-six reading."""
    reading = ["twenty", "twenty", "six"]
    if not any(source_units[i:i + 3] == reading for i in range(len(source_units) - 2)):
        return words
    result = []
    for word in words:
        raw = word["word"].strip()
        if not re.fullmatch(r"2026[.,:;!?]?", raw):
            result.append(word)
            continue
        result.append({**word, "word": " twenty twenty six"})
        if equivalences_out is not None:
            equivalences_out.append({"asr_numeric_glyphs": "2026", "raw_asr_word": raw,
                "expanded_word_units": reading,
                "reason": "Explicit 2026 year glyph with the exact source year reading; numeric value unchanged",
                "shared_time_interval": [word["start"], word["end"]],
                "timing_note": "Expanded units share the original ASR token interval; internal boundaries are not measured"})
    return result


def grouped_integer_words(words, equivalences_out=None):
    """Rejoin ASR subwords of explicit thousands groups, such as 6 + ,000."""
    result, index = [], 0
    while index < len(words):
        first = words[index]
        raw = first["word"].strip()
        group = [first]
        if re.fullmatch(r"\d{1,3}", raw):
            while index + len(group) < len(words):
                following = words[index + len(group)]
                if not re.fullmatch(r",\d{3}[.:;!?]?", following["word"].strip()):
                    break
                group.append(following)
                if following["word"].strip()[-1] in ".:;!?":
                    break
        if len(group) == 1:
            result.append(first)
        else:
            glyphs = "".join(item["word"].strip() for item in group)
            result.append({**first, "word": " " + glyphs, "end": group[-1]["end"]})
            if equivalences_out is not None:
                equivalences_out.append({"asr_numeric_glyphs": glyphs,
                    "raw_asr_subwords": [item["word"] for item in group],
                    "reason": "Explicit comma-grouped integer split across ASR subwords; every digit retained",
                    "shared_time_interval": [first["start"], group[-1]["end"]],
                    "timing_note": "Expanded units share the combined original subword interval; internal word boundaries are not measured"})
        index += len(group)
    return result


def source_alignment(source, heard_words, equivalences_out=None):
    display = source.split()
    source_units, owners = [], []
    for index, word in enumerate(display):
        for unit in tokens(word):
            source_units.append(unit)
            owners.append(index)
    heard_units, heard_times, origins = word_units(
        decimal_spelling_words(algebraic_spelling_words(
            year_spelling_words(grouped_integer_words(heard_words, equivalences_out), source_units, equivalences_out),
            equivalences_out), equivalences_out),
        with_origins=True)
    # Only these two declared compound spellings may be joined, and only
    # when the canonical source contains that exact compound. No phoneme or
    # word may be added, removed or replaced by this orthographic rule.
    for canonical, separated in (("preregistered", ["pre", "registered"]),
                                 ("preprint", ["pre", "print"])):
        if canonical not in source_units:
            continue
        index = 0
        while index + 1 < len(heard_units):
            if heard_units[index:index + 2] == separated:
                span = (heard_times[index][0], heard_times[index + 1][1])
                raw = origins[index:index + 2]
                heard_units[index:index + 2] = [canonical]
                heard_times[index:index + 2] = [span]
                origins[index:index + 2] = [" ".join(raw)]
                if equivalences_out is not None:
                    equivalences_out.append({"kind": "declared_compound_spelling",
                        "asr_units": separated, "canonical_word": canonical,
                        "raw_asr_origins": raw, "shared_time_interval": list(span),
                        "reason": "Explicit compound hyphen/spacing equivalence; all word units retained"})
            index += 1
    # ASR digits encode cardinal magnitude, not whether the speaker said a/one.
    # Only numeric glyphs 100 or 1,000 may align to canonical a hundred/thousand.
    for kind, a, b, c, d in difflib.SequenceMatcher(None, source_units, heard_units, autojunk=False).get_opcodes():
        if (kind == "replace" and source_units[a:b] == ["a"] and heard_units[c:d] == ["one"]
                and b < len(source_units) and d < len(heard_units)
                and source_units[b] == heard_units[d] and source_units[b] in {"hundred", "thousand"}):
            raw_number = origins[c].strip().rstrip(".,:;!?")
            expected_digits = "100" if source_units[b] == "hundred" else "1000"
            if re.fullmatch(r"[0-9,]+", raw_number) and raw_number.replace(",", "") == expected_digits:
                heard_units[c] = "a"
                if equivalences_out is not None:
                    equivalences_out.append({"asr_numeric_glyphs": raw_number,
                        "canonical_words": "a " + source_units[b], "reason": "ASR cardinal-number spelling; source wording retained",
                        "shared_time_interval": list(heard_times[c])})
    opcodes = difflib.SequenceMatcher(None, source_units, heard_units, autojunk=False).get_opcodes()
    differences = [{"kind": kind, "expected": source_units[a:b], "heard": heard_units[c:d]}
                   for kind, a, b, c, d in opcodes if kind != "equal"]
    if differences:
        raise ValueError("Unresolved words cannot be silently aligned: " + json.dumps(differences))
    times = [[] for _ in display]
    for index, owner in enumerate(owners):
        times[owner].append(heard_times[index])
    aligned = []
    for index, word in enumerate(display):
        if times[index]:
            start = min(t[0] for t in times[index])
            end = max(t[1] for t in times[index])
        else:
            start = end = aligned[-1]["end"] if aligned else 0
        aligned.append({"text": word, "start": start, "end": end})
    return aligned


LOCAL_GROUPING_RULES = {
    "15": {
        "source_sha256": "120824e09afe75817327ae7a35693882e53a82f5d17fd8f70c1a9d52055098ed",
        "reason": "Keep improved learning together and remove a one-word final cue.",
        "blocks": [
            "There are three different findings: loss, no clear difference, and gain.",
            "The tutoring group had no statistically clear exam gain over",
            "the control group. That does not establish equality,",
            "or prove that the tutor improved learning.",
        ],
    },
    "16": {
        "source_sha256": "4f0f4e320c2a519c982c9dacfe5aeea6dd9d666a704dbcee9cb5d271103618a9",
        "reason": "Break at the semicolon and retain every possible cause in one cue.",
        "blocks": [
            "Chat logs showed more requests for complete solutions with the unrestricted",
            "tool, and more help seeking and attempted answers with the tutor.",
            "Those patterns help interpret the result;",
            "they do not isolate every possible cause.",
        ],
    },
    "19": {
        "source_sha256": "8677bf7624a23f98c75c5a300a124a469ea898df9591e89aa6dec5b7e07fa787",
        "reason": "Keep both spoken decimal numbers inside complete comparison phrases.",
        "blocks": [
            "The tutor used a planned sequence, expert prepared content, questions,",
            "feedback, and self pacing.",
            "The median post-test score was four point five,",
            "compared with three point five in the classroom condition.",
            "Teaching design changed the result.",
        ],
    },
    "22": {
        "source_sha256": "f9f0a5506b34aa2f712eed1b572f86e36d6c56a32e1ec5802b7816d73034b71f",
        "reason": "Keep researchers' quality checks together and separate the next sentence.",
        "blocks": [
            "Thirty two percent of the initially generated help",
            "failed the researchers’ quality checks.",
            "A confident explanation can still contain incorrect reasoning.",
            "A useful tutor needs both a sensible teaching approach and content that",
            "can survive checking.",
        ],
    },
}


def groups(words, shot_id=None):
    rule = LOCAL_GROUPING_RULES.get(str(shot_id))
    if rule is not None:
        source = " ".join(word["text"] for word in words)
        if (hashlib.sha256(source.encode()).hexdigest() != rule["source_sha256"]
                or " ".join(rule["blocks"]) != source):
            raise ValueError(f"{shot_id}: local subtitle grouping source identity changed")
        result, cursor = [], 0
        for text in rule["blocks"]:
            count = len(text.split())
            block = words[cursor:cursor + count]
            if " ".join(word["text"] for word in block) != text:
                raise ValueError(f"{shot_id}: local subtitle grouping changes source words")
            if len(textwrap.wrap(text, width=42, break_long_words=False, break_on_hyphens=False)) > 2:
                raise ValueError(f"{shot_id}: local subtitle grouping exceeds two lines")
            result.append(block)
            cursor += count
        if cursor != len(words):
            raise ValueError(f"{shot_id}: local subtitle grouping omits source words")
        return result
    result, current = [], []
    for word in words:
        candidate = " ".join([item["text"] for item in current] + [word["text"]])
        wrapped = textwrap.wrap(candidate, width=42, break_long_words=False, break_on_hyphens=False)
        if current and (len(current) >= 12 or len(candidate) > 78 or len(wrapped) > 2):
            result.append(current)
            current = []
        current.append(word)
        if len(current) >= 3 and re.search(r"[.!?][\"']?$", word["text"]):
            result.append(current)
            current = []
    if current:
        result.append(current)
    return result


def stamp(seconds):
    ms = max(0, round(seconds * 1000))
    hours, ms = divmod(ms, 3600000)
    minutes, ms = divmod(ms, 60000)
    secs, ms = divmod(ms, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timeline", type=Path, default=ROOT / "media/timeline.json")
    parser.add_argument("--manifest", type=Path, default=ROOT / "media/audio/manifest.json")
    parser.add_argument("--asr-dir", type=Path, default=ROOT / "review/asr")
    parser.add_argument("--preview-shots", type=int)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "media")
    args = parser.parse_args()
    timeline, shots, end_frame = selected_timeline(args.timeline, args.preview_shots)
    rows = json.loads(args.manifest.read_text())
    manifest = {str(row["id"]): row for row in rows}
    if len(manifest) != len(rows):
        raise ValueError("Duplicate audio manifest IDs")
    cues, evidence = [], []
    for shot in shots:
        row = manifest.get(str(shot["id"]))
        if not row or not shot.get("audio"):
            raise ValueError(f"No completed audio for {shot['id']}")
        if (row["text"] != shot["text"] or shot["audio"] != row["path"]
                or digest(ROOT / row["path"]) != row["audio_sha256"]
                or hashlib.sha256(row["text"].encode()).hexdigest() != row["source_sha256"]):
            raise ValueError("Caption source/audio identity changed")
        if abs(row["duration"] - shot["voice_duration"]) > 1e-7:
            raise ValueError("Caption timing uses an estimated or stale speech duration")
        heard, method = asr_words(row, args.asr_dir)
        validate_word_times(heard, row["duration"])
        spelling_equivalences = []
        aligned = source_alignment(row["text"], heard, spelling_equivalences)
        if spelling_equivalences:
            method["numerical_spelling_equivalences"] = [item for item in spelling_equivalences if "asr_numeric_glyphs" in item]
            method["orthographic_spelling_equivalences"] = [item for item in spelling_equivalences if item.get("kind") == "declared_compound_spelling"]
        blocks = groups(aligned, shot["id"])
        if str(shot["id"]) in LOCAL_GROUPING_RULES:
            rule = LOCAL_GROUPING_RULES[str(shot["id"])]
            method["local_grouping_rule"] = {"source_sha256": rule["source_sha256"],
                "reason": rule["reason"], "word_timestamps_changed": False}
        offset = shot["voice_start"] / timeline["fps"]
        for index, block in enumerate(blocks):
            text = " ".join(word["text"] for word in block)
            start = max(shot["start"] / timeline["fps"], offset + block[0]["start"] - .08)
            end = max(offset + block[-1]["end"] + .25, start + 1.2, start + len(text) / 22)
            if index < len(blocks) - 1:
                end = min(end, offset + blocks[index + 1][0]["start"] - .11)
            end = min(max(end, start + .1), shot["end"] / timeline["fps"] - .08)
            if round(end * 1000) <= round(start * 1000):
                raise ValueError("Caption has zero or negative duration after SRT millisecond rounding")
            display = "\n".join(textwrap.wrap(text, width=42, break_long_words=False, break_on_hyphens=False))
            if len(display.splitlines()) > 2:
                raise ValueError("Caption exceeds two readable lines")
            cues.append({"id": len(cues) + 1, "shot": shot["id"], "start": start, "end": end,
                         "text": text, "display": display})
        if " ".join(cue["text"] for cue in cues if cue["shot"] == shot["id"]) != row["text"]:
            raise ValueError("Caption grouping altered canonical source")
        evidence.append({"id": shot["id"], "audio_sha256": row["audio_sha256"], "source_sha256": row["source_sha256"], **method})
    if any(cue["start"] < prior["end"] - .002 for prior, cue in zip(cues, cues[1:])):
        raise ValueError("Subtitle cues overlap")
    if digest(args.timeline) != timeline["_source_sha256"]:
        raise ValueError("Timeline changed during subtitle alignment")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    srt = "\n\n".join(f"{cue['id']}\n{stamp(cue['start'])} --> {stamp(cue['end'])}\n{cue['display']}" for cue in cues) + "\n"
    temporary = args.output_dir / "captions.srt.tmp"
    temporary.write_text(srt)
    temporary.replace(args.output_dir / "captions.srt")
    write_json(args.output_dir / "subtitle-report.json", {"preview": bool(args.preview_shots),
               "selected_shots": [shot["id"] for shot in shots], "full_film": not bool(args.preview_shots),
               "timeline_sha256": timeline["_source_sha256"], "duration_frames": end_frame,
               "method": "Canonical source wording and independent ASR timestamps; exact hash-bound phoneme adjudication or explicit canonical-transcript editorial adoption only when declared in sources; no missing-word waiver",
               "orthographic_equivalence": "Declared numeric spelling, chat bot/chatbot, and source-conditioned preregistered/pre-registered or preprint/pre-print spelling", "sources": evidence,
               "cues": cues, "maximum_characters_per_second": max(len(cue["text"]) / (cue["end"] - cue["start"]) for cue in cues),
               "minimum_cue_seconds": min(cue["end"] - cue["start"] for cue in cues),
               "readability_flags": [{"cue": cue["id"], "characters_per_second": len(cue["text"]) / (cue["end"] - cue["start"])}
                                     for cue in cues if len(cue["text"]) / (cue["end"] - cue["start"]) > 26],
               "ffmpeg_used": False})
    print(f"{'PREVIEW' if args.preview_shots else 'FINAL'} SRT: {len(cues)} cues, {len(shots)} real voice segments")


if __name__ == "__main__":
    main()
