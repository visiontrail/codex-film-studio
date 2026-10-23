# The House Gets Coffee — review record

## Version identity

The current Pocket v8 review edition is `media/the-house-gets-coffee.mp4`, byte-identical to `media/the-house-gets-coffee-pocket-v8.mp4`. SHA-256: `5f49feb8a901d1f0126b4ed46d87be16447ef8c3c2fdfa32c5a3f033ea091984` (144,972,201 bytes). It contains 7,889 frames at 24 fps, lasts 328.708333 seconds, and uses 51 English dialogue takes across 95 shots. Revision 18 changes staging, drawing and portal continuity. All 15,404 encoded AAC packets and their timestamps match v5 exactly. Evidence below applies to v8 unless stated otherwise.

Earlier v1, v2, v4 and v5 have complete review records. V3 was rejected after paired pages 0–11 and 23 native samples. V6 was rejected after pages 0–11 (frames 0–383): the opening portal covered Qin. V7 was rejected after pages 0–23 (frames 0–767): the portal jumped position at departure. Generated pages beyond those ranges are not claimed as reviewed. Their source and evidence archives remain available.

## Inspection actually performed

| Evidence | Coverage | What it establishes |
| --- | --- | --- |
| Supplied reference | All 1,380 frames in 29 consecutive 320×180 thumbnail atlases; eight additional native images | Observed drawing, staging and motion at these scales |
| Pocket v8 | All 7,889 frames in 247 paired pages, each film thumbnail 240×135 | Every-frame continuity and shot-role comparison without omitted intervals |
| Native v8 samples | 33 decoded 1920×1080 images; frame numbers below | Faces, portal handoff, odds, portraits, flags, brands and ending at original resolution |
| Independent ASR | All 51 selected takes, retained raw/edited evidence and explicit corrections | Word comparison and timing; not subjective listening |
| Signal measurements | Zero clipped samples in selected WAVs; mix −14.35 LUFS, −1.37 dBTP, 6.90 LU loudness range | Measured levels and clipping |
| Full decode | H.264 1920×1080, 24 fps, yuv420p, limited BT.709; AAC 48 kHz stereo; full audio/video decode passed | Technical readability and stream properties |
| Browser playback | Natural end at 328.708333 seconds; played 0–328.708333, unmuted, readyState 4, error null | Playback through the end; not subjective audio review |
| Historical deterministic render | Eight revision-16 frames matched between arbitrary seeks and fresh processes | Historical evidence, not a new revision-18 test |

Native frames: 17, 190, 290, 359, 419, 424, 434, 439, 440, 444, 447, 466, 1000, 1380, 2250, 2367, 2380, 2711, 2850, 3360, 3500, 4210, 4560, 4980, 5260, 5530, 5665, 6410, 6610, 6900, 7480, 7673, 7840.

Pairs use corresponding shot roles and normalized progress. New betting props have no identical objects in Coffee Run. No pixel statistic is used as a style score. Every-frame thumbnail inspection is distinct from native-resolution inspection of every frame.

## Voice decisions

The local Pocket service supplies Marius for Bo and Javert for Qin. Reference-WAV upload failed with HTTP 500; built-in voices succeeded without changing the deployed service. Original responses and normalized WAVs remain. Silence processing removes bounded near-silent intervals below −56.5 dBFS; spoken samples are not accelerated or pitch-shifted.

Seven lines were repaired after independent ASR exposed missing or ambiguous words. Exact selections and WAV/ASR hashes are in `accepted-takes.json`. For L026, raw ASR returned “An upset” and edited ASR returned “And upset.” The mapped raw alignment was accepted after verifying that editing preserved every spoken PCM sample. Both transcriptions and the mapping remain. This does not certify pronunciation by human listening.

## Visual findings

Revision 18 widens the returning home pair, lowers and resizes the blackboard, separates the plant from Bo's helmet and brings shelves into frame. Qin leans while his feet remain level, with a tucked resting hand. Bo's panic mouth becomes a shallow dark opening with a small tongue. Parlay scenery uses curved teal hills and a perspective floor. Arrival arms settle at different times.

V8 fixes both rejected portal versions. The opening portal stays to Qin's right; its camera, position and radius persist into departure. The same portal expands into the transition. This was checked throughout paired pages and at native frames 419, 424, 434, 439, 440, 444 and 447.

Two earlier diagnoses needed correction. V5's home pair was too close together relative to reference frame 1180, rather than too far apart. A panic mouth crossing the chin and a cup cropped by the close-up also occur in the reference. The oversized circular mouth and different composition were the material differences. Historical v5 observations remain archived; this report supersedes those interpretations.

Visible differences remain:

- Constant screen-width strokes become too dense on actors shrinking into the portal, especially frame 439.
- Close-ups remain centered and isolated, with smaller/lower heads and less foreground interaction than the reference.
- Gestures and facial acting are restrained. Factual cards hold longer than the reference's prop jokes.
- Secondary placement needs work: a cash label touches the skyline, the pool insert has excessive space above it, and a pointing hand briefly overlaps Qin's cup.
- The coffee reveal uses a smaller object; the title and prop motion differ. Portraits carry identifying features and labels, but likeness is a qualitative judgment.

The Pocket voice replacement and complete v8 export are ready to review. The original requirement for effectively identical style remains open. No numerical or perceptual “100% identical” finding is made.

## Local evidence

- `review/frame-inspection-pocket-v8.json`: all 247 reviewed pages and 33 native samples, with observations tied to the exact export.
- `review/comparison-pocket-v8/frame-pairs.csv`: every film frame mapped to a reference role/frame.
- `review/native-pocket-v8/index.json`: sample identities and frame numbers.
- `review/delivery.json`: full decode, stream metadata and loudness.
- `review/browser-pocket-v8-playback.json` and `review/browser-pocket-v8.png`: natural end and current review interface.
- `review/pocket-v8-audio-identity.json`: encoded AAC identity against v5.
- `review/revision-18.json`: source checks, rejected versions, repairs and current source hashes.
- `review/pocket-v1/` through `review/pocket-v8/`: source/evidence archives; v3, v6 and v7 remain rejected.
- `review/accepted-pocket-voice-signals.json`: selected-WAV measurements.

Media and detailed evidence remain in this independent folder. No application Task or public upload was created. All FFmpeg operations use the shared gate.
