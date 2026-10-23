# Long edition delivery review

The completed film is **10 minutes 25.5 seconds**, 1920 × 1080 at 24 fps,
with 15,012 frames, 65 shots, seven chapters, 64 Chatterbox recordings and
197 English subtitle cues. The H.264/AAC MP4 is 201,664,950 bytes.

Final SHA-256:
`9a871b69d28e11b4810f0848209d2212f32009eef070fab01cf3dc54184604c5`

## What was examined

Every reference frame and every final frame was decoded and indexed.
All 15,012 consecutive chapter frames were actually opened in paired
reference/new atlases: 315 sheets across seven chapters. Each pair uses
240 × 135 source tiles, displayed at approximately 200 × 112 in the tool.
This is continuous thumbnail inspection, **not native-resolution inspection
of every frame**. All 960 reference frames had been inspected in the short
edition; that reference inventory is shared here.

All 65 representative shot compositions were also opened on 960 × 540
boards. Selected algebra states, reopened example, purchasing problem,
writing, code and learning-log details were inspected at native resolution.
The final file has 15,012 exact decoded RGB matches at 640 × 360 against the
reviewed chapter files. This binds the chapter review to the delivered cut.
The uninterrupted final comparison atlas contains 313 sheets; its generation
alone is not counted as an additional visual inspection.

| Chapter | Start | Frames | Opened paired sheets |
|---|---:|---:|---:|
| The finished page | 0:00 | 1,512 | 32 |
| What the studies measured | 1:03 | 2,352 | 49 |
| Why easy can feel like learned | 2:41 | 2,040 | 43 |
| A lesson Ada can own | 4:06 | 3,480 | 73 |
| Transfer and a later return | 6:31 | 2,100 | 44 |
| Beyond mathematics | 7:58.5 | 2,340 | 49 |
| Your next session | 9:36 | 1,188 | 25 |

Observed defects were repaired before final review: unit labels, the starting
state of division, a misplaced reading highlight, missing arrow glyphs,
off-center paper entry and a crowded learning-log row. The affected chapter
was rendered and reviewed again. No unintended blank frame or persistent
primary-label collision was observed in the final reviewed atlases.

The comparison preserves a specific visual vocabulary: cream paper, muted
blue/olive/ochre/brick colors, printed ink contours and registration, slab
display lettering, limited character poses, rays, wipes and iris transitions.
The new illustrations and teaching narrative differ from Meet Pip. Artistic
equivalence has no verified numerical score; this review does not certify
“100% identical” style or effect.

## Speech, sound and captions

Every recording is bound to its exact source text and audio hash. Unprompted
Whisper transcription was compared with the source after documented
normalization of punctuation, contractions and numbers. Four recordings
(13, 16, 23, 46) needed the retained independent medium-model transcript;
the same WAV hashes and normalized source text match. Confirmed speech
errors were regenerated and checked again. The SRT/VTT contains the complete
source narration, in order, with non-overlapping cues within the film.

The final soundtrack measures **−14.04 LUFS integrated, −1.01 dBTP**,
with a 4.80 LU loudness range. It contains the voice, original synthesized
music and scene effects. The voice retains its natural speed. Audio and
video both run 625.5 seconds. Full media decoding passed without errors.

Subjective listening was **not completed because audio input was unavailable**.
ASR agreement and signal measurements do not establish vocal naturalness,
pronunciation quality or the perceptual quality of the mix.

## Content and playback

The research sources and claim limits are retained in
[content/sources.json](content/sources.json). The Turkish study's 48% and
17% figures are relative changes. The physics result concerns immediate
post-test performance in its specific setting. Ada and the practice routine
are instructional examples. They are not an additional reported experiment.

The algebra model was checked across 291 intermediate states: both sides
remain equal during subtraction and division. The purchase example solves
`2x + 3 = 15` as `x = 6`, then checks the result in the original equation.
The empty-list code error and explicit guard were checked separately.

The final MP4 was loaded in the Codex in-app browser. Playback advanced
from the beginning, midpoint seeking worked, chapter six started at 478.5 s
and advanced, and the ending reached 625.5 s with `ended = true` and no
player error. English WebVTT loaded and its display toggle was enabled.
The frame comparison accepted frame 7440, advanced to 7441 and loaded both
indexed images. These are observed playback/seek checks, not a claim of
continuous attention through a ten-minute screening.

## Retained evidence and reproducibility

- [Release hashes](release.json)
- [Manual inspection log](review/inspection-log.json)
- [Final review and chapter pixel identity](review/visual-review.json)
- [Media delivery checks](review/delivery/delivery-check.json)
- [Browser playback](review/browser-playback.json)
- [Comparison screenshot](review/comparison-browser.png)
- [Every-frame comparison measurements](review/comparison/frames.csv)

Run `scripts/seal_review.py` to verify recorded chapter coverage and final
decoded pixel identity, then `scripts/audit_release.py` to check the retained
delivery, speech, subtitle, browser and hash evidence. These scripts do not
perform a new visual or listening review. Media and operational records are
retained locally and ignored by Git; source and this release manifest are
committed. The original short remains available and unchanged as a media file.
