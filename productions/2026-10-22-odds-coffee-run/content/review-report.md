# The House Gets Coffee — review record

## Version identity

The completed Pocket v9 edition is `media/the-house-gets-coffee.mp4`, byte-identical to `media/the-house-gets-coffee-pocket-v9.mp4`. SHA-256: `c19a012b992322aa691962fad0055a36327a8413ae41010fb61c156c99eed45c` (145,183,813 bytes). It contains 7,889 frames at 24 fps, lasts 328.708333 seconds, and uses 51 English dialogue takes across 95 shots. Revision 19 repairs shrinking-character outlines and the money/pool inserts. All 15,404 encoded AAC packets and their timestamps match v8 exactly; the earlier v8 audit establishes identity with v5. Evidence below applies to v9 unless stated otherwise.

Earlier v1, v2, v4 and v5 have complete review records. V3 was rejected after paired pages 0–11 and 23 native samples. V6 was rejected after pages 0–11 (frames 0–383): the opening portal covered Qin. V7 was rejected after pages 0–23 (frames 0–767): the portal jumped position at departure. Generated pages beyond those ranges are not claimed as reviewed. Their source and evidence archives remain available.

## Inspection actually performed

| Evidence | Coverage | What it establishes |
| --- | --- | --- |
| Supplied reference | All 1,380 frames in 29 consecutive 320×180 thumbnail atlases; eight additional native images | Observed drawing, staging and motion at these scales |
| Pocket v9 | All 7,889 frames in 247 paired pages, each film thumbnail 240×135: 35 changed pages newly viewed (1,120 frames), 212 pages byte-identical to previously viewed v8 pages (6,769 frames) | Every-frame continuity and shot-role comparison without omitted intervals; exact JPEG hashes establish carry-forward, not an approximate similarity test |
| Native v9 samples | 36 decoded 1920×1080 images: 11 new/changed images viewed, 25 byte-identical to previously reviewed samples; the Turkey sample was additionally reopened | Faces, portal handoff, odds, portraits, flags, brands and ending at original resolution |
| Independent ASR | All 51 selected takes, retained raw/edited evidence and explicit corrections | Word comparison and timing; not subjective listening |
| Signal measurements | Zero clipped samples in selected WAVs; mix −14.35 LUFS, −1.37 dBTP, 6.90 LU loudness range | Measured levels and clipping |
| Full decode | H.264 1920×1080, 24 fps, yuv420p, limited BT.709; AAC 48 kHz stereo; full audio/video decode passed | Technical readability and stream properties |
| Browser playback | Natural end at 328.708333 seconds; played 0–328.708333, unmuted, readyState 4, error null | Playback through the end; not subjective audio review |
| Historical deterministic render | Eight revision-16 frames matched between arbitrary seeks and fresh processes | Historical evidence, not a new revision-19 test |

Native frames: 17, 190, 290, 359, 419, 424, 434, 439, 440, 444, 447, 466, 1000, 1380, 1435, 2250, 2367, 2380, 2711, 2746, 2850, 2922, 3360, 3500, 4210, 4560, 4980, 5260, 5530, 5665, 6410, 6610, 6900, 7480, 7673, 7840.

Pairs use corresponding shot roles and normalized progress. New betting props have no identical objects in Coffee Run. No pixel statistic is used as a style score. Every-frame thumbnail inspection is distinct from native-resolution inspection of every frame.

## Voice decisions

The local Pocket service supplies Marius for Bo and Javert for Qin. Reference-WAV upload failed with HTTP 500; built-in voices succeeded without changing the deployed service. Original responses and normalized WAVs remain. Silence processing removes bounded near-silent intervals below −56.5 dBFS; spoken samples are not accelerated or pitch-shifted.

Seven lines were repaired after independent ASR exposed missing or ambiguous words. Exact selections and WAV/ASR hashes are in `accepted-takes.json`. For L026, raw ASR returned “An upset” and edited ASR returned “And upset.” The mapped raw alignment was accepted after verifying that editing preserved every spoken PCM sample. Both transcriptions and the mapping remain. This does not certify pronunciation by human listening.

## Visual findings

Revision 18 widens the returning home pair, lowers and resizes the blackboard, separates the plant from Bo's helmet and brings shelves into frame. Qin leans while his feet remain level, with a tucked resting hand. Bo's panic mouth becomes a shallow dark opening with a small tongue. Parlay scenery uses curved teal hills and a perspective floor. Arrival arms settle at different times.

V8 fixes both rejected portal versions. The opening portal stays to Qin's right; its camera, position and radius persist into departure. The same portal expands into the transition. This was checked throughout paired pages and at native frames 419, 424, 434, 439, 440, 444 and 447.

Two earlier diagnoses needed correction. V5's home pair was too close together relative to reference frame 1180, rather than too far apart. A panic mouth crossing the chin and a cup cropped by the close-up also occur in the reference. The oversized circular mouth and different composition were the material differences. Historical v5 observations remain archived; this report supersedes those interpretations.

Revision 19 reduces outline weight only for the very small portal poses, preserving separated contours as the actors shrink. The cash readouts now occupy a flat placard and the retained ten-dollar label clears the captions. The pool insert is framed around its explanatory prop. Consecutive changed pages and original-resolution samples confirm these repairs. A bill partially overlaps a coin during the money action, and horses pass behind the pool; their visible labels remain readable and the layering is intentional.

The final film consistently uses the reference's purple-black irregular ink, flat fills and hard shadow shapes, limited palettes per world, large heads and white eye masses, restrained deadpan/anxious acting, held poses on twos, smooth camera/portal movement, hard reaction cuts, outlined captions and pixel world labels. New betting props and documentary inserts use that same drawing language. Public portraits, flags and brands remain visibly represented; exact portrait likeness remains a qualitative judgment.

The user's clarification makes style the comparison target for the new topic. Specific head positions, cup scale, gestures, composition and factual-card duration therefore do not need to reproduce Coffee Run's story coordinates. Their execution was reviewed for readability, continuity and consistency. This supersedes the earlier interpretation that those differences alone kept the style requirement open; the actual drawing and placement defects identified in v8 were repaired.

Under `style-acceptance.md`, the assistant's qualitative style review passes, with moderate confidence. No further material defect was found at the documented review scales. This is an assistant review decision, not a claim that the user has accepted the film, a numerical “100% identical” finding, or native-resolution inspection of every frame.

## Country-selection audit

Turkey comes from lines 16–18 of the supplied sports-betting transcript, not from the referenced sample-video search chat. That input incorrectly describes 371 referees as suspected of manipulating matches. The [TFF statement of 27 October 2025](https://www.tff.org/default.aspx?ftxtID=48811&pageID=285), reopened during this audit, instead reports 571 active referees, 371 with betting accounts and 152 with football-betting records. Film lines L027–L028 distinguish accounts, bets and fixing; those figures do not establish that 371 referees fixed matches.

The `turkey` scene identifier belongs to this film's story. The reusable studio guidance contains no fixed-country requirement. The brief, source ledger and style contract now explicitly require countries and examples to follow each new topic and its evidence. This verified case remains in this film; its numbers must not be reassigned to another country's flag. Confidence in this provenance finding is high.

## Local evidence

- `review/frame-inspection-pocket-v9.json`: all 247 pages and 36 native samples, with new observations and exact carry-forward provenance.
- `review/pocket-v9-page-identity.json`: individual page hashes distinguishing 35 changed pages from 212 byte-identical pages.
- `review/comparison-pocket-v9/frame-pairs.csv`: every film frame mapped to a reference role/frame.
- `review/native-pocket-v9/index.json`: sample identities, frame numbers and review basis.
- `review/delivery.json`: full decode, stream metadata and loudness.
- `review/browser-pocket-v9-playback.json` and `review/browser-pocket-v9.png`: natural end and current review interface.
- `review/pocket-v9-audio-identity.json`: encoded AAC identity against v8; the retained v8 audit links to v5.
- `review/revision-19.json`: current repairs, source hashes and review decision.
- `review/pocket-v1/` through `review/pocket-v9/`: source/evidence archives; v3, v6 and v7 remain rejected.
- `review/final-acceptance.json`: assistant delivery decision and source commit; separate from user acceptance.
- `review/accepted-pocket-voice-signals.json`: selected-WAV measurements.

Media and detailed evidence remain in this independent folder. No application Task or public upload was created. All FFmpeg operations use the shared gate.
