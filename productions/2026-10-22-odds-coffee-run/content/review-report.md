# The House Gets Coffee — review record

## Version identity

The current Pocket v4 edition is `media/the-house-gets-coffee.mp4`, byte-identical to `media/the-house-gets-coffee-pocket-v4.mp4`. Its SHA-256 is `17c96c492af3f07d5424e33583560ea9162c7cfb6568f488b9244dde239fdcbe` (142,287,789 bytes). It contains 7,889 frames at 24 fps, lasts 328.708333 seconds, and uses 51 English dialogue takes across 95 shots. Revisions 15–16 refine faces, poses, arm connections, the pool label and ending. Audio and timeline are unchanged; encoded AAC packets and timestamps match v2 exactly. The following evidence applies to v4 unless stated otherwise.

Earlier Pocket v1 and v2 exports remain with complete review records. V3 is retained as rejected: only paired pages 0–11 and 23 native-size images were visually inspected before its panic-expression and brow problems prompted v4. Generated v3 pages beyond page 11 are not claimed as reviewed.

## Inspection actually performed

| Evidence | Coverage | What it establishes |
| --- | --- | --- |
| Supplied reference | All 1,380 frames, 29 consecutive 320×180 thumbnail atlases; eight additional 1920×1080 images | Observed shot, drawing and motion grammar at these inspection scales |
| Pocket v4 export | All 7,889 frames, 247 paired pages; each final thumbnail 240×135 | Every-frame continuity and shot-role comparison, with no omitted frame interval |
| Native-size Pocket v4 samples | Frames 17, 190, 231, 290, 435, 466, 1000, 1380, 2250, 2367, 2380, 2711, 2850, 3360, 3500, 4210, 4560, 4980, 5260, 5530, 5665, 6410, 6610, 6900, 7480, 7840 | Twenty-six decoded 1920×1080 images inspected for faces, transitions, odds, portraits, flags, brands and ending |
| Independent speech recognition | All 51 selected takes; raw/edited evidence retained, corrections explicitly selected | Word-level comparison and timing evidence; not subjective listening |
| Signal measurements | 51 selected WAVs have zero clipped samples; final mix −14.35 LUFS, −1.37 dBTP, 6.90 LU loudness range | Measured level and clipping checks |
| Full decode | H.264 1920×1080, 24 fps, yuv420p, limited-range BT.709; AAC 48 kHz stereo; complete audio/video decode passed | Technical readability and expected stream properties |
| Browser playback | V4 reached its natural end; played range 0–328.708333 seconds, unmuted, readyState 4, 1920×1080, error null | Working playback through the end; not a claim of human auditory review |
| Deterministic rendering | Eight selected revision-16 frames matched byte-for-byte between arbitrary seeks and fresh render processes | No previous-frame dependency at the tested positions |

The paired mapping uses corresponding shot roles and normalized progress. A newly drawn betting machine has no identical object in Coffee Run; its comparison is with the reference's object-insert grammar. No pixel-similarity statistic is used as a style score. Every-frame thumbnail inspection is distinct from native-resolution inspection of every frame.

## Voice decisions

The local Pocket service supplies Marius for Bo and Javert for Qin. A reference-WAV upload failed with HTTP 500; built-in voices succeeded without changing the deployed service. Original provider responses and normalized WAVs are retained. Silence processing removes only bounded near-silent intervals below −56.5 dBFS; spoken samples are not accelerated or pitch-shifted.

Seven lines were repaired after independent ASR exposed missing or ambiguous words. The exact selection and every WAV/ASR hash are in `accepted-takes.json`. For L026, the raw take transcribed “An upset”; the silence-edited take's independent ASR returned “And upset.” The mapped raw alignment was accepted only after verifying that the edit preserved all spoken PCM. Both transcriptions and the mapping remain available locally. This does not certify pronunciation by human listening.

## Visual findings and revisions

The film uses dark irregular outlines, flat fills, pastel environments, oversized heads, a half-lidded inventor, anxious assistant, green portals, reaction cuts, pixel world tags and outlined rounded captions. The extended factual script adds explanatory object inserts and evidence cards.

V4 resolves the inspected v2 label obstruction and v3 expression defects. DEDUCTION sits above the horse orbit with a leader to the outlet and appears only in the pool insert. Bo's panic brows rise inward, and his hand moves behind his head continuously. Sleeves, arms, hands and phone remain connected. Qin's head is narrower and tilted, with a lower brow and clipped face shading. Gestures settle between phrases. A cleared canvas and overscanned ending remove prior-frame edge residue; the end portal is broader. All corresponding final-frame intervals were reviewed, with the critical details additionally checked at native resolution.

Remaining differences are visible: the cast is taller and slimmer, gestures and facial acting are less exaggerated, two-shots have less foreground overlap, and factual cards hold longer than the reference's prop-driven jokes. The home plant aligns behind Bo's helmet, flattening that silhouette. The end portal is brighter and the two-line title/credits are denser. The redrawn portraits retain identifying features and labels; their resemblance remains a qualitative judgment. No numerical or perceptual “100% identical” finding is made.

The Pocket voice replacement and complete revised export are ready to review. The original requirement for effectively identical visual style remains open.

## Local evidence

- `review/frame-inspection-pocket-v4.json`: all 247 reviewed pages, all 26 native-size samples, observations and exact v4 hash.
- `review/comparison-pocket-v4/frame-pairs.csv`: every v4 frame mapped to a reference role/frame.
- `review/native-pocket-v4/index.json`: decoded native-size samples and v4 hash.
- `review/delivery.json`: current full decode, stream metadata and loudness measurements.
- `review/browser-pocket-v4-playback.json`: played range and naturally ended state.
- `review/browser-pocket-v4.png`: updated review interface displaying v4.
- `review/pocket-v4-audio-identity.json`: encoded AAC packet and timestamp identity against v2.
- `review/revision-16-seek-check.json`: deterministic-render comparison at eight frames.
- `review/pocket-v1/`, `review/pocket-v2/`, `review/pocket-v3/`, `review/pocket-v4/`: version-specific source/evidence archives; v3 remains rejected.
- `review/accepted-pocket-voice-signals.json`: selected-WAV signal measurements.

All media and detailed evidence stay in this independent production folder. No application Task was created, no public upload was made, and FFmpeg operations wait for other FFmpeg processes through the shared gate.
