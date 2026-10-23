# The House Gets Coffee — review record

## Version identity

The current Pocket v5 edition is `media/the-house-gets-coffee.mp4`, byte-identical to `media/the-house-gets-coffee-pocket-v5.mp4`. Its SHA-256 is `50ff52b26dac859c22533424a1de05e834a48b3ada3a9a85c745b2d559a0f2b6` (144,474,039 bytes). It contains 7,889 frames at 24 fps, lasts 328.708333 seconds, and uses 51 English dialogue takes across 95 shots. Revision 17 adjusts head/body proportions, clothing, cup position, close-up framing and arrival poses. Audio and timeline are unchanged; all 15,404 encoded AAC packets and their timestamps match v4 exactly. The following evidence applies to v5 unless stated otherwise.

Earlier Pocket v1, v2 and v4 exports remain with complete review records. V3 is retained as rejected: only paired pages 0–11 and 23 native-size images were visually inspected before its panic-expression and brow problems prompted v4. Generated v3 pages beyond page 11 are not claimed as reviewed.

## Inspection actually performed

| Evidence | Coverage | What it establishes |
| --- | --- | --- |
| Supplied reference | All 1,380 frames, 29 consecutive 320×180 thumbnail atlases; eight additional 1920×1080 images | Observed shot, drawing and motion grammar at these inspection scales |
| Pocket v5 export | All 7,889 frames, 247 paired pages; each final thumbnail 240×135 | Every-frame continuity and shot-role comparison, with no omitted frame interval |
| Native-size Pocket v5 samples | Frames 17, 190, 290, 435, 452, 466, 1000, 1380, 2250, 2367, 2380, 2711, 2850, 3360, 3500, 4210, 4560, 4980, 5260, 5530, 5665, 6410, 6610, 6900, 7480, 7673, 7840 | Twenty-seven decoded 1920×1080 images inspected for faces, transitions, odds, portraits, flags, brands and ending |
| Independent speech recognition | All 51 selected takes; raw/edited evidence retained, corrections explicitly selected | Word-level comparison and timing evidence; not subjective listening |
| Signal measurements | 51 selected WAVs have zero clipped samples; final mix −14.35 LUFS, −1.37 dBTP, 6.90 LU loudness range | Measured level and clipping checks |
| Full decode | H.264 1920×1080, 24 fps, yuv420p, limited-range BT.709; AAC 48 kHz stereo; complete audio/video decode passed | Technical readability and expected stream properties |
| Browser playback | V5 reached its natural end; played range 0–328.708333 seconds, unmuted, readyState 4, 1920×1080, error null | Working playback through the end; not a claim of human auditory review |
| Earlier deterministic-render check | Eight selected revision-16 frames matched byte-for-byte between arbitrary seeks and fresh render processes | Historical check retained; this is not a new revision-17 test |

The paired mapping uses corresponding shot roles and normalized progress. A newly drawn betting machine has no identical object in Coffee Run; its comparison is with the reference's object-insert grammar. No pixel-similarity statistic is used as a style score. Every-frame thumbnail inspection is distinct from native-resolution inspection of every frame.

## Voice decisions

The local Pocket service supplies Marius for Bo and Javert for Qin. A reference-WAV upload failed with HTTP 500; built-in voices succeeded without changing the deployed service. Original provider responses and normalized WAVs are retained. Silence processing removes only bounded near-silent intervals below −56.5 dBFS; spoken samples are not accelerated or pitch-shifted.

Seven lines were repaired after independent ASR exposed missing or ambiguous words. The exact selection and every WAV/ASR hash are in `accepted-takes.json`. For L026, the raw take transcribed “An upset”; the silence-edited take's independent ASR returned “And upset.” The mapped raw alignment was accepted only after verifying that the edit preserved all spoken PCM. Both transcriptions and the mapping remain available locally. This does not certify pronunciation by human listening.

## Visual findings and revisions

The film uses dark irregular outlines, flat fills, pastel environments, oversized heads, a half-lidded inventor, anxious assistant, green portals, reaction cuts, pixel world tags and outlined rounded captions. The extended factual script adds explanatory object inserts and evidence cards.

V5 retains the prior label and expression repairs, then adjusts proportions against native reference images. Both heads are larger relative to the body. Bo's vest is narrower and shorter, with a three-pen pocket and striped hem. Qin's robe is narrower, its belt higher, and the cup sits at chest height. Close-ups are reframed around the larger heads. Raised arrival arms settle continuously; sleeves, hands, cup and phone remain connected. Bo retains raised inner panic brows and now has two sweat drops. All corresponding final-frame intervals were reviewed, with critical details additionally checked at native resolution.

Remaining differences are visible: gestures and facial acting are less exaggerated, two-shots have less foreground overlap, and factual cards hold longer than the reference's prop-driven jokes. Qin's cup is cropped at the bottom of the close-up at frame 190; Bo's large open mouth partly overlaps the chin/shirt boundary at frame 2380. Mouth shapes still need refinement. The home plant aligns behind Bo's helmet, flattening that silhouette. The end portal is brighter and the two-line title/credits are denser. The redrawn portraits retain identifying features and labels; their resemblance remains a qualitative judgment. No numerical or perceptual “100% identical” finding is made.

The Pocket voice replacement and complete revised export are ready to review. The original requirement for effectively identical visual style remains open.

## Local evidence

- `review/frame-inspection-pocket-v5.json`: all 247 reviewed pages, all 27 native-size samples, observations and exact v5 hash.
- `review/comparison-pocket-v5/frame-pairs.csv`: every v5 frame mapped to a reference role/frame.
- `review/native-pocket-v5/index.json`: decoded native-size samples and v5 hash.
- `review/delivery.json`: current full decode, stream metadata and loudness measurements.
- `review/browser-pocket-v5-playback.json`: played range and naturally ended state.
- `review/browser-pocket-v5.png`: updated review interface displaying v5.
- `review/pocket-v5-audio-identity.json`: encoded AAC packet and timestamp identity against v4.
- `review/revision-16-seek-check.json`: deterministic-render comparison at eight frames.
- `review/pocket-v1/`, `review/pocket-v2/`, `review/pocket-v3/`, `review/pocket-v4/`, `review/pocket-v5/`: version-specific source/evidence archives; v3 remains rejected.
- `review/accepted-pocket-voice-signals.json`: selected-WAV signal measurements.

All media and detailed evidence stay in this independent production folder. No application Task was created, no public upload was made, and FFmpeg operations wait for other FFmpeg processes through the shared gate.
