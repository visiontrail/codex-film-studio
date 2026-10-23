# Crayon-book reference inspection

Reference: LemoLab, The Moon Can't Sleep, 52.000 s, 1920×1080, 24 fps.
Source: https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/crayon-book.mp4
SHA256: c9240e146b34b9c4955972c0cadea7601dce2252b5124b337d4553f9e37745e2

## Coverage

All 1,248 decoded frames have a CSV record, image hash, motion/colour/material
metrics and an indexed 320×180 atlas tile. All 35 atlases (0000–0034) were
visually inspected in this chat. This is exhaustive thumbnail review, not
manual full-resolution inspection of every frame. Full-resolution seconds
5, 23, 33 and 48 were additionally inspected. Reference audio listening has
not yet been established. Metrics use 480×270 decodes and do not certify style.

## Observations from the encoded frames

- Frames 0–71: paper first; house lines, moon contour, facial marks, tree and
  baseline arrive in sequence. The marks develop along paths instead of fading.
- Frames 72–143: diagonal fill builds in patches; wax visibly overshoots the
  contour. Roof and lawn have more missing wax than the yellow face.
- Frames 144–239: camera push removes title from view. Discrete eye/face poses
  convey failure; paper grain and geometry move together.
- Frames 240–359: three sheep pass across the face; large round eyes follow
  them. Counting numerals stay on the page. Their small scale is balanced by
  the large facial disc. Subtitles are dark handwriting on torn bare-paper strips.
- Frames 360–467: camera travels down to the house, deliberately crops moon.
- Frames 468–611: child exits window; ladder draws ahead; climb alternates
  a few leg/arm poses, no smooth rubbery tween. Foreground limbs occlude walls.
- Frames 612–683: pull wider; title remains out of view. Material reveal prepared.
- Frames 684–863: ultramarine wash traverses alternating horizontal bands.
  White-wax stars are exposed behind its moving edge. Band overlaps, pigment
  pooling, bristle streaks and pits remain visible; no dissolve.
- Frames 864–1007: eyelids lower, cap draws, patchwork quilt scribbles upward.
  The foreground stays legible against wash. Some background wax darkens.
- Frames 1008–1079: camera returns to child, who changes to a sleeping pose.
- Frames 1080–1151: pull out through page border into open book on textured
  wooden table; crayons become visible. The book's gutter has a soft crease.
- Frames 1152–1187: paper bends across the spine. A moving shadow and curved
  edge sell a physical page, not a flat wipe.
- Frames 1188–1247: camera glides into end page; held printed words, quiet finish.

## Material constraints

Warm ivory nominal #f4efe3, indigo/plum contour, approximately twelve colours.
At the first encoded frame, whole-frame RGB mean is 212.20/207.56/195.03,
showing that vignette and tooth shading are substantial. Mean is a calibration
observation, not a target to force on every scene.

The full-size roof has irregular multi-pixel paper holes and slanted gaps;
plain smooth fills plus screen-fixed noise would fail. Paper has directional
emboss, fine grain and longer fibres. Foreground contour 4–7 screen pixels in
close view; pressure varies. Colouring must remain visible as separate passes.

Animation: drawings updated on twos at 24 fps; camera and brush can change each
frame. Calm boils during quiet holds. Speech text uses Patrick Hand; titles
use Gaegu. Sound plan follows material action, with small wooden/metal timbres.

## Comparison protocol

Final output must be decoded sequentially and audited for every frame. Match
scenes to appropriate reference phases (bare paper, drawing, close acting,
wash, physical book) instead of pretending two different stories have a
pixel-identical temporal alignment. Every output frame receives a reference
match and feature differences. Inspect every output atlas plus flagged frames
and full-resolution shot/event frames. Keep automated coverage, atlas review,
full-resolution review, motion playback and audio listening separate. Do not
convert distribution similarity into a claim of '100% identical'.
