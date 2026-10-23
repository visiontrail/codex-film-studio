# Crayon picture-book method

A subject-independent material and production method for tactile, hand-drawn
picture-book films. Start a production in an external directory and fill in
`input-contract.json` there. This directory contains no example story, cast,
narration, edit, media or acceptance record. It is a method, not a registered
style or a claim that an arbitrary render matches a reference.

## Visual grammar

- Warm ivory paper with multiscale fibre relief. Treat paper as a surface under
  the drawing: a camera move carries both grain and pigment, while illumination
  can stay in camera space.
- Dark indigo contours with restrained position and pressure variation. Keep
  eyes, mouths and small text readable; do not erode every object equally.
- Wax deposited in directional passes with irregular uncovered paper. Vary
  pressure by pigment and by form. Allow small, intentional strokes outside
  boundaries instead of applying the same speckle mask to every shape.
- Handwritten titles and captions with stable baselines and explicit safe areas.
  Text must remain legible at the delivery resolution and a smaller player size.
- Poses may hold for two frames while camera motion remains continuous. Derive
  all state from the requested frame so arbitrary seeking stays deterministic.
- Reveal actual drawing strokes in order. A wash advances with brush bands,
  bristle variation, pooling edges and wax resistance.
- A physical book ending needs a hinge, two paper surfaces, self-shadow, gutter,
  desk grain and a camera destination. Preserve contact and continuity through
  the turn rather than treating the image as a flat wipe.

`lib/material.mjs` provides deterministic canvas primitives and wax/paper
compositing. `lib/desk.mjs` provides an independent wood material and spread
lighting. They have no scene or character knowledge. Copy them into an external
project, install the dependency from `package.json` there, and author the
production-specific composition separately.

## Direction and timing

Resolve the source identity before writing. Record the intended audience,
story spine, visual reference, permitted adaptation and delivery format in the
external production. Keep source identity separate from style identity.

Use one integer-frame timeline with half-open ranges `[start, end)`. Reference
named events from both animation and sound. Caption timing follows recorded
speech. A change to the action frame must automatically move its sound cue.

## Music and sound

Define musical sections by narrative purpose, with explicit tempo, meter,
harmonic progression, motif, orchestration and transition. Use variations,
rests and a final cadence. A quiet scene should change the arrangement, not
merely turn down an unchanged loop.

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
