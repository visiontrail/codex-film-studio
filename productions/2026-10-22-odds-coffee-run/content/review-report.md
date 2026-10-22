# The House Gets Coffee — review record

## Version identity

The current Pocket v2 edition is `media/the-house-gets-coffee.mp4`, byte-identical to `media/the-house-gets-coffee-pocket-v2.mp4`. Its SHA-256 is `b4abc9d01eddee6623b550b7d1f46638a2013dc3d4c151e62fcd603c1fcd92a7` (140,628,477 bytes). It contains 7,889 frames at 24 fps, lasts 328.708333 seconds, and uses 51 English dialogue takes across 95 shots. This revision changes spectacles and hands; audio and timeline are unchanged from Pocket v1. The following inspection evidence applies to v2 unless identified otherwise.

The first Pocket edition remains at `media/the-house-gets-coffee-pocket-v1.mp4`, SHA-256 `853bccefed4951091a4cf4043d12f5a0a71300b455cd06419fbbce35bbf6a061`, with its own 247-page review and 19 native-size samples retained.

## Inspection actually performed

| Evidence | Coverage | What it establishes |
| --- | --- | --- |
| Supplied reference | All 1,380 frames, 29 consecutive 320×180 thumbnail atlases; eight additional 1920×1080 images | Observed shot, drawing and motion grammar at the stated inspection scales |
| Pocket v2 export | All 7,889 frames, 247 paired pages; each final thumbnail 240×135 | Every-frame continuity and shot-role comparison, with no omitted frame interval |
| Native-size Pocket v2 samples | Frames 17, 190, 290, 435, 466, 1000, 1380, 2250, 2850, 3360, 3500, 4210, 4560, 4980, 5260, 5530, 6410, 6610, 7480, 7840 | Twenty decoded 1920×1080 images inspected for faces, transitions, odds, portraits, flags, brands and ending |
| Independent speech recognition | All 51 selected takes; raw/edited evidence retained, corrections explicitly selected | Word-level comparison and timing evidence; not subjective listening |
| Signal measurements | 51 selected WAVs have zero clipped samples; final mix −14.35 LUFS, −1.37 dBTP, 6.90 LU loudness range | Measured level and clipping checks |
| Full decode | H.264 1920×1080, 24 fps, yuv420p, limited-range BT.709; AAC 48 kHz stereo; complete audio/video decode passed | Technical readability and expected stream properties |
| Browser playback | The v2 file reached its natural end; recorded played range 0–328.708333 seconds, unmuted, readyState 4, 1920×1080, error null | Working browser playback through the end; not a claim of human auditory review |

The paired mapping uses corresponding shot roles and normalized progress. A newly drawn betting machine has no identical object in Coffee Run; its comparison is with the reference's object-insert grammar. No pixel-similarity statistic is used as a style score.

## Voice decisions

The local Pocket service supplies Marius for Bo and Javert for Qin. A reference-WAV upload failed with HTTP 500; built-in voices succeeded without changing the deployed service. Original provider responses and normalized WAVs are retained. Silence processing only removes bounded near-silent intervals below −56.5 dBFS; spoken samples are not accelerated or pitch-shifted.

Seven lines were repaired after independent ASR exposed missing or ambiguous words. The exact selection and every WAV/ASR hash are in `accepted-takes.json`. For L026, the raw take correctly transcribed “An upset”; the silence-edited take's independent ASR returned “And upset.” The mapped raw alignment was accepted only after verifying the edit preserved all spoken PCM. Both transcriptions and the mapping remain available locally. This does not certify pronunciation by human listening.

## Visual findings and revisions

The current drawings use the reference's dark irregular outlines, flat fills, pastel environments, oversized heads, half-lidded inventor, anxious assistant, green portal, reaction cuts, pixel world tags and outlined rounded captions. The extended factual script adds object inserts and evidence cards. The comparison still shows differences in character silhouettes and acting detail; no claim of “100% identical” is made.

The v1 native-size pass found two actionable style differences: Bo's spectacles were too elongated and lacked pale inner rims; hands read as simple circles. Revision 14 corrects those features. Every frame of the revised export and 20 native-size samples have now been inspected. Earlier revisions and rejected experiments remain documented in `reference-analysis.md` and the ignored inspection ledger.

Remaining observations: faces are more oval and front-facing than the reference, poses are less varied, and the end-card portal is narrower. At frame 2850 a passing horse overlaps the secondary DEDUCTION label (V15, minor); the spoken explanation and dialogue caption remain clear. These findings remain open. The Pocket voice replacement and complete export are delivered; the original request for effectively identical visual style is not marked achieved.

## Local evidence

- `review/frame-inspection-pocket-v2.json`: all 247 reviewed pages, all 20 native-size samples, findings and exact v2 hash.
- `review/comparison-pocket-v2/frame-pairs.csv`: every v2 frame mapped to a reference role/frame.
- `review/native-pocket-v2/index.json`: the 20 decoded native-size samples and v2 hash.
- `review/delivery.json`: v2 full decode, stream metadata and loudness measurements.
- `review/browser-pocket-v2-playback.json`: v2 browser played range and naturally ended state.
- `review/browser-pocket-v2.png`: updated review interface displaying the promoted v2 file.
- `review/pocket-v1/`: retained v1 review, delivery and playback records.
- `review/accepted-pocket-voice-signals.json`: selected-WAV signal measurements.

All media and detailed evidence stay in this independent production folder. No application Task was created, no public upload was made, and FFmpeg operations wait for other FFmpeg processes through the shared gate.
