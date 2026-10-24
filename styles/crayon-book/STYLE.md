# Crayon Picture Book · Style guide

A subject-independent material and production method for tactile, hand-drawn
picture-book films. Start a production in an external directory and fill in
`input-contract.json` there. This directory contains no example story, cast,
narration, edit, media or acceptance record. It is registered as a material toolkit in `styles.json`. Its tools do not
establish that an arbitrary render matches a reference.

## Visual grammar

- Warm ivory paper with multiscale fibre relief. Treat paper as a surface under
  the drawing: a camera move carries both grain and pigment, while illumination
  can stay in camera space. Keep fine tooth, broader relief and longer fibres
  separately adjustable; compare the encoded texture at its intended scale.
- Dark indigo contours with restrained position and pressure variation. Keep
  eyes, mouths and small text readable; do not erode every object equally.
- Wax deposited in directional passes with irregular uncovered paper. Vary
  pressure by pigment and by form. Allow small, intentional strokes outside
  boundaries instead of applying the same speckle mask to every shape. Subdivide
  long polygon edges with small seeded displacements; protect tiny features.
- Handwritten titles and captions with stable baselines and explicit safe areas.
  Text must remain legible at the delivery resolution and a smaller player size.
- Poses may hold for two frames while camera motion remains continuous. Derive
  all state from the requested frame so arbitrary seeking stays deterministic.
- Reveal actual drawing strokes in order. Where the reference separates line
  drawing and colouring, keep separate stroke budgets for those passes. Drawing
  one fully coloured object after another is a visibly different reveal.
  `Wax.outlineOnly`, `strokeBudget` and `fillBudget` permit independent stages;
  `begin(frame)` resets their state so the caller sets them after each begin.
  A wash advances with brush bands,
  bristle variation, pooling edges and wax resistance.
- Give every new element its own contour and pigment progress, including late
  props, answers and lettering. Trace partial paths to an interpolated endpoint,
  then deposit colour in directional passes. Keep position, scale and opacity
  stable during the reveal; a fade, scale pop or flat fill is not drawing.
  Review each group's onset, partial contour, partial pigment and finished hold.
- A physical book ending needs a hinge, two paper surfaces, self-shadow, gutter,
  desk grain and a camera destination. Combine irregular long fibres, broken
  highlights and broad tonal bands to avoid periodic wood stripes. Preserve contact and continuity through
  the turn rather than treating the image as a flat wipe.

`starter/lib/material.mjs` provides deterministic canvas primitives and wax/paper
compositing. `starter/lib/desk.mjs` provides an independent wood material and spread
lighting. `deskTexture(paper, {meander, wear})` can bend long fibres and vary
local ridge density and contrast; `wear` defaults to 0. Use a fixed seed and
compare both sparse and dense regions rather than adding uniform white noise.
`shadeSpread(context, x, y, pageWidth, height, {tableLight})` adds a fixed warm
light pool with asymmetric edge falloff; `tableLight` defaults to 0. Compare
paper illumination separately from the underlying paper colour and relief.
Use the same shaded reverse surface during a page turn and after it settles,
and reverse the texture coordinate order when the page faces away. Inspect
the last turning frame and first settled frame for brightness and grain jumps.
These controls have no scene or character knowledge. Copy them into an external
project, install the dependencies from `starter/package.json` there, and author the
production-specific composition separately. In a generated working copy, these
files are at `lib/` and `package.json`, without the `starter/` prefix.

For pigment that looks too neatly clipped, `Wax.edgeScumble` accepts a fixed
strength from 0 to 1; its default is 0 and retains the earlier edge treatment.
It places short dry passes along the whole perimeter, using arc length rather
than vertex count or individual segment length. This makes dense circular
outlines and sparse polygons both eligible for boundary overruns. Marks follow
the form's hatch direction and stable seed. Small coloured marks, white features
and indigo shapes retain their original treatment. Inspect faces, grip contacts,
silhouettes and partial colour stages before enabling it for a production.
The strength is material pressure/extent, never a time-based opacity entrance.

## Paper calibration from a blank sample

When a procedural grain looks like sand instead of paper, isolate a genuinely
blank reference area or frame and compare several texture scales before tuning.
With Python, NumPy, SciPy and Pillow installed, `scripts/synthesize_paper.py`
accepts a reference image and an output path. It removes slow illumination,
smooths the power spectrum, randomizes spatial phase and iteratively matches the
relief histogram. The resulting little-endian float32 map has new spatial
structure. Record the reference license, image hash, seed, output hash and any
render gain in the external production. Keep both input and generated assets
outside this library.

Load the map as a `Float32Array` and pass it to
`paperTexture({reliefMap, reliefGain})`. Its dimensions must match the canvas;
the gain defaults to 1. The map controls visible paper relief; the separate
wax-tooth field still controls pigment deposition. Include the map in render
cache keys. Compare the encoded result, since grading, scaling and compression
change fine texture. Matched statistics and low spatial correlation are process
checks, not proof of identical perceived style.

## Independent pigment and stroke controls

`paperTexture({reliefMap, reliefGain, toothScale})` keeps the visible paper and
original contour tooth unchanged while `toothScale` adjusts the coloured-wax
sampling scale. Its default is 1. Test finer grain against the same picture at
native resolution; making all marks finer can accidentally clean up the dark
contours as well. `Wax.pigmentLift` defaults to 0 and changes coloured-pigment
pressure without replacing the draw-on paths.

Set `Wax.formedHatching = true` to vary pass direction and pressure by stable
shape seed. `withHatch(angleInRadians, draw)` chooses a deliberate direction for
a form, restoring the previous direction afterward. The clipping boundary stays
in object space and the pen rotates within it. Extend rotated pass bounds far
enough to cover the whole form. Keep seeds independent of moving positions so a
hand or prop does not change pigment pressure while it moves.

If native-scale review reveals uniform bands across large coloured shapes,
set `Wax.brokenHatching = true` with formed hatching enabled. It staggers short
pass endpoints, overlaps neighbouring strokes and varies pressure locally.
A number from 0 to 1 controls the pressure variation; 0 disables this option.
White features and indigo marks retain the original pass model so eye whites
and pupils do not acquire the same treatment as foliage. Review their actual
sizes before adopting the setting. Long directional marks may be correct for
a reference; use the option only when a held-frame comparison supports it.

`Wax.organicContours = true` adds gradual stroke-width variation along indigo
contours. `Wax.contourPressure` defaults to 1 and scales pressure only on indigo
contour strokes up to 6 scene units wide, excluding pigment passes and glyphs.
Lower values expose more paper tooth inside the line. Choose the value from
native-resolution comparisons of broad outlines, fine limbs and internal face
marks; excess erosion can turn a closed contour into a broken silhouette.
Keep the value constant over time. This is a material setting, not a reveal
opacity envelope. `Wax.protectSmallMarks = true` increases pressure on small dark marks;
check pupils, nostrils and mouth shapes at their displayed sizes instead of
eroding them as heavily as a large coloured field. These options are off by
default. Their native-resolution and encoded motion proof belongs to the new
production; the toolkit supplies no universal material acceptance setting.

Repeated objects should share a design without sharing every pen mark. Wrap a
repeated drawing in `Wax.withVariant(stableKey, draw)` to give it a stable
identity. The key changes local hatch, pressure and contour seeds, and adds
small smooth displacements inside larger shapes while preserving their bounding
extremes. Nested keys distinguish components within an object. Keys must not
contain the current frame, moving coordinates or draw-order counters; retain
the same key when an object returns. Leave identifying facial marks and exact
contact geometry outside a variant scope unless separately reviewed.

The scope restores its previous seed even when drawing throws. A null or zero
key inherits the current scope. Set `Wax.variantStrength = 0` before drawing to
disable variant scopes for a controlled baseline; 1 uses the normal shape
variation. Calls outside a variant scope retain the original material. Compare
both repeated objects and a return to the same object, then recheck draw-on
budgets and out-of-order seeks. Different seeds alone do not establish a better
hand-drawn result; inspect the rendered silhouettes and pigment.

For drawing reveals, `Wax.reveal(key, progress, draw)` measures each group and
keeps its contour and pigment budgets separate. Use a stable key and unchanging
stroke topology for the group. There is no solid colour rectangle underneath an
unfinished hatch. Register licensed font bytes with `registerWaxFont` and the
Canvas font registry to trace partial letters along paths; unregistered fonts
fall back to whole glyphs and require a separate lettering solution.

## Direction and timing

Resolve the source identity before writing. Record the intended audience,
story spine, visual reference, permitted adaptation and delivery format in the
external production. Keep source identity separate from style identity.

Use one integer-frame timeline with half-open ranges `[start, end)`. Reference
named events from both animation and sound. Caption timing follows recorded
speech. A change to the action frame must automatically move its sound cue.

Give each action shot a camera destination: follow the active character, move
closer to a small action, or settle with the pose. Keep educational choice
spreads wide enough to read. Evaluate the whole move, not only its midpoint,
for clipped titles, lost contact points and limbs outside the frame.

Default to planted actor roots and readable held poses. Avoid generic walking,
bobbing and whole-body sway. Use small blinks, mouth shapes and necessary hand
or prop actions, with shared contact coordinates. Begin restrained camera moves
after the drawing settles. A full-body move is an explicit exception requiring
continuous foot, hand, prop and sound review.

`composite(wax, paper, canvas, scale, centerX, centerY)` samples the paper in
the same camera space as the drawing. Centers use output-pixel coordinates;
omitted centers default to the canvas center. Convert scene coordinates by
the rendering scale and keep the sampled viewport within the paper bounds.

## Music and sound

Define musical sections by narrative purpose, with explicit tempo, meter,
harmonic progression, motif, orchestration and transition. Use variations,
rests and a final cadence. A quiet scene should change the arrangement, not
merely turn down an unchanged loop.

Compose on one continuous beat and harmony clock. A picture cut must not restart
a bar, truncate notes or reset the ambience. Approach new orchestration over a
musical phrase, preserve release tails, and change tempo gradually when needed.
Keep shared-location ambience continuous with overlapping perspective changes.
Remove footfall loops when characters are planted. Check every transition in
musical context as stems and as the encoded mix; numerical seam checks alone
cannot establish perceived continuity.

The shared [drawn-story continuity method](../../methods/drawn-story-continuity.md)
details these sound, reveal and performance rules. They apply to new productions
even when the material toolkit requires additional renderer implementation.

Keep separate narration, score, ambience and event-sound stems. Place footsteps,
contacts, material noises and character/environment sounds where the depicted
actions occur. Alternate samples or synthesis seeds to avoid mechanical repeats.
Use restrained stereo placement, short perspective-appropriate reverberation,
and speech-driven ducking. Richness means relevant layers and dynamic contrast,
not a loud sound on every frame.

Record source URL, author, license, actual downloaded-file hash and edits for
each external sound. Keep this ledger and the sounds outside this repository.
Preserve original provider output when generating narration. Listen to the
encoded result when the interface supports it; ASR, loudness measurements and
successful playback do not establish auditory review.

## Reference comparison and delivery

Use `../../scripts/frame_review/` with output paths in the external project.
Map new shots to reference phases by visual function and relative progress.
Compare paper, stroke, pigment, lettering, motion, camera and physical effects;
different subjects or day/night settings are not themselves style defects.

Decode every frame and retain indexed, consecutive-frame evidence. Record
actual thumbnail inspection separately from native-resolution inspection,
motion playback and listening. An exported contact sheet is not a reviewed
contact sheet. Palette or edge statistics are descriptive and must not become
an invented artistic similarity percentage. Use a separate defect log and
re-render each observed mismatch. Only verified identical frame ranges can
inherit earlier pixel-level observations.

Verify the encoded delivery file: complete decode, frame count and timing,
dimensions, audio streams and loudness, start/end and seeking in the intended
player. Serve local video with byte-range support. Bind evidence to the exact
delivered hash. Preserve revisions externally. Use the shared FFmpeg gate and
wait for another encoder instead of stopping it.

## Reference provenance

Visual grammar was studied from the `crayon-book` example in
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar), attributed to LemoLab
under CC BY 4.0. The material code here is independently authored. A future
production must verify and retain the license of the particular reference
and assets it actually uses.
