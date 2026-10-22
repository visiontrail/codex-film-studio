# The House Gets Coffee — review record

## Version identity

The complete first Pocket edition is retained at `media/the-house-gets-coffee-pocket-v1.mp4`. Its SHA-256 is `853bccefed4951091a4cf4043d12f5a0a71300b455cd06419fbbce35bbf6a061`. It contains 7,889 frames at 24 fps, lasts 328.708333 seconds, and uses 51 English dialogue takes across 95 shots. A further picture revision is being rendered; it must receive its own review before replacing this evidence.

## Inspection actually performed

| Evidence | Coverage | What it establishes |
| --- | --- | --- |
| Supplied reference | All 1,380 frames, 29 consecutive 320×180 thumbnail atlases; eight additional 1920×1080 images | Observed shot, drawing and motion grammar at the stated inspection scales |
| First Pocket export | All 7,889 frames, 247 paired pages; each final thumbnail 240×135 | Every-frame continuity and shot-role comparison, with no omitted frame interval |
| Native-size Pocket samples | Frames 17, 190, 290, 435, 466, 1000, 1380, 2250, 2850, 3360, 4210, 4560, 4980, 5260, 5530, 6410, 6610, 7480, 7840 | Detailed inspection of faces, transitions, odds, portraits, flags, brands and ending |
| Independent speech recognition | All 51 selected takes; raw/edited evidence retained, corrections explicitly selected | Word-level comparison and timing evidence; not subjective listening |
| Signal measurements | 51 selected WAVs have zero clipped samples; final mix −14.35 LUFS, −1.37 dBTP, 6.90 LU loudness range | Measured level and clipping checks |
| Full decode | H.264 1920×1080, 24 fps, yuv420p, limited-range BT.709; AAC 48 kHz stereo; complete audio/video decode passed | Technical readability and expected stream properties |
| Browser playback | Playback began at zero and was later observed naturally ended at 328.708333 seconds, unmuted, readyState 4, 1920×1080, error null | Working browser playback through the end; not a claim of human auditory review |

The paired mapping uses corresponding shot roles and normalized progress. A newly drawn betting machine has no identical object in Coffee Run; its comparison is with the reference's object-insert grammar. No pixel-similarity statistic is used as a style score.

## Voice decisions

The local Pocket service supplies Marius for Bo and Javert for Qin. A reference-WAV upload failed with HTTP 500; built-in voices succeeded without changing the deployed service. Original provider responses and normalized WAVs are retained. Silence processing only removes bounded near-silent intervals below −56.5 dBFS; spoken samples are not accelerated or pitch-shifted.

Seven lines were repaired after independent ASR exposed missing or ambiguous words. The exact selection and every WAV/ASR hash are in `accepted-takes.json`. For L026, the raw take correctly transcribed “An upset”; the silence-edited take's independent ASR returned “And upset.” The mapped raw alignment was accepted only after verifying the edit preserved all spoken PCM. Both transcriptions and the mapping remain available locally. This does not certify pronunciation by human listening.

## Visual findings and revisions

The current drawings use the reference's dark irregular outlines, flat fills, pastel environments, oversized heads, half-lidded inventor, anxious assistant, green portal, reaction cuts, pixel world tags and outlined rounded captions. The extended factual script adds object inserts and evidence cards. The comparison still shows differences in character silhouettes and acting detail; no claim of “100% identical” is made.

The native-size pass found two actionable style differences: Bo's spectacles were too elongated and lacked pale inner rims; hands read as simple circles. Revision 14 corrects those features. Its final-frame review is pending. Earlier revisions and rejected experiments remain documented in `reference-analysis.md` and the ignored inspection ledger.

## Local evidence

- `review/pocket-v1/frame-inspection-pocket.json`: page-by-page observations tied to the first Pocket export hash.
- `review/comparison-pocket/frame-pairs.csv`: every final frame mapped to a reference role/frame.
- `review/native-pocket/index.json`: the 19 decoded native-size samples.
- `review/pocket-v1/delivery.json`: full decode, stream metadata and loudness measurements.
- `review/pocket-v1/browser-pocket-ended.json`: recorded browser playback state.
- `review/browser-pocket.png`: current paired-review interface screenshot.
- `review/accepted-pocket-voice-signals.json`: selected-WAV signal measurements.

All media and detailed evidence stay in this independent production folder. No application Task was created, no public upload was made, and FFmpeg operations wait for other FFmpeg processes through the shared gate.
