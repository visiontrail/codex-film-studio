# Delivery review — 22 October 2026

**Delivered:** `media/Does-AI-Help-You-Learn-Midcentury.mp4`, 198 seconds,
1920×1080, 24 fps, 4,752 frames, 75,820,924 bytes. SHA-256:
`f6fabd0b6d3f09328ae75582d70e163ff2c9e82aebba161128533c0d1fc0ea47`.

Technical delivery confidence: **high**. The warm print palette, type, broken
outlines, registration, limited character animation and iris vocabulary are
visually close to the reference. Confidence in that qualitative style judgment:
**high**. Literal 100% perceptual equivalence is **not established**. Different
characters, compositions, narration, score and the longer explanatory rhythm
remain visible or audible differences. No numerical metric is presented as
an artistic similarity percentage.

## Every-frame evidence

The 40-second reference contains 960 frames. All 20 consecutive reference
atlases (000–019) were opened and examined, covering frames 0–959. Reference
frames 70, 211 and 455 were additionally inspected at full size for line,
texture, type and hand construction.

All 99 paired final atlases (000–098) were opened and examined, covering
frames 0–4,751. Each paired tile places the reference on the left and the new
film on the right. Source tiles are 240×135; the viewer resized some full
atlases. This is complete sequential **overview-resolution** inspection, not
independent 1080p scrutiny of every frame. Individual indexed JPEGs are 640×360;
the MP4 and selected rendered stills preserve full resolution.

The pairing uses semantic shot function and normalized phase. It contains
4,752 rows and touches 940 distinct reference frames; the separate reference
review covers all 960. It is not a time-aligned pixel comparison of identical
content. RGB means, ink/light fractions, edge energy and motion are descriptive
measurements only.

The last repair raised the algebra pointer 110 px because its fingertip
obscured part of “11” at full resolution. After re-encoding, the 640×360
decoded RGB hashes changed only on frames **2,622–2,749** (128 frames).
Atlases **054–057**, covering 2,592–2,783, were reopened after the repair.
The full-size corrected frame 2,660 was also opened: “11” is unobstructed,
and the fingertip remains directly above its card. The remaining decoded
frame hashes match the version already reviewed. Final atlases 084–098 were
examined after the final encode.

Earlier visual revisions corrected elbow direction, writing-nib contact,
overlapping inset/computer text, excessive grain, stamp shape, light font
weights and character proportions. Original and intermediate renders remain
under ignored `media/` and `review/`; the previous complete MP4 is retained
in `media/revisions/before-pointer-clearance.mp4`.

Evidence: [visual review record](review/visual-review.json),
[paired frame measurements](review/comparison/frames.csv),
[comparison method](review/comparison/summary.json),
[final frame inventory](review/final/summary.json),
[corrected full-size frame](review/algebra-fixed.png).

## Technical checks

| Check | Result |
|---|---|
| Complete video/audio decode | Passed without decoder errors |
| Encoded and decoded picture count | 4,752 |
| Timeline, frame rate and duration | Agree: 24 fps, 198.000 s |
| Maximum timestamp cadence error | 0.000000334 s |
| Picture format | H.264 High, yuv420p, BT.709 matrix, 1920×1080 |
| Sound | AAC stereo, 48 kHz, approximately 194 kbit/s |
| Measured integrated loudness | −14.08 LUFS |
| Measured true peak | −1.08 dBTP after AAC encoding |
| Loudness range | 6.00 LU |
| Subtitles | 62 English cues, embedded mov_text plus SRT/VTT |

Two-pass normalization targets −14 LUFS and −1.2 dBTP; the table reports
the measured encoded result, not the target. Full delivery evidence is
[delivery-check.json](review/delivery/delivery-check.json).

## Speech and listening boundary

All 22 selected Chatterbox WAVs are bound to their exact source text and
SHA-256. Unprompted Whisper transcription found no unresolved normalized
text differences. The first line 13 and line 22 recordings were rejected and
regenerated; line 22 had added words. Line 08 has a primary-ASR “in/and”
disagreement resolved by independent Whisper Medium on the same retained WAV.
Number and currency normalization is documented in `scripts/transcribe.py`.

Speech speed is 1.0; no narration time compression was applied. The score
ducks beneath speech. Waveform, duration, transcription and loudness checks
passed. **Subjective listening was not completed:** the available model input
could not consume the returned audio. Neither ASR nor successful playback is
described as a listening review. Voice naturalness and the subjective music/VO
balance therefore retain an explicit review limit.

## Browser verification

The local player was reloaded after the final mux. The middle seek showed
99.00 / 198.00 seconds playing and subsequently reached 198.00 paused. A new
play advanced from 0.00 to 89.15 seconds, then was paused at 181.54 seconds.
This verifies playback advancement and reaching the end, not uninterrupted
human audiovisual viewing.

The frame input selected 2,660 / 110.833 seconds and reference frame 500.
“Next frame” advanced to 2,661 / 110.875 seconds; “Previous frame” returned
to 2,660. Both images loaded, including the corrected pointer.

![Verified comparison page](review/comparison-browser.png)

## Scope and preservation

No FrontierTechSN project Task was created. No reference rendering engine or
build workflow was imported. Only the expressly permitted Chatterbox service
and exact-source recordings were reused. No public individual appears; the
Turkish flag and recognizable OpenAI mark are rendered in the visual style.
Sources and licenses are listed in [CREDITS.md](CREDITS.md).

Every production FFmpeg invocation uses `scripts/bin/ffmpeg`, which waits for
already-running FFmpeg processes and never kills another task's work. The
guard cannot prevent an unrelated process from starting after its check.
Only this production's source files are included in its Git commit; generated
media, provider job records, credentials and unrelated work are excluded.
