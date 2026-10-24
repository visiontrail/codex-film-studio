# Continuity in a drawn story

Use these rules for a picture-book film whose visual language is drawing on
paper. They apply to the finished film and to its production tools. Keep the
story, cast, timings, media and review evidence in an external production.

## Sound crosses the picture cut

A new shot is not automatically a new musical cue. Compose against one global
beat and harmony clock. Do not restart a bar, change tempo, change meter or
truncate a sounding note merely because the picture changes. Scene boundaries
may select an arrangement destination; approach it over a musical phrase.

- Keep a common instrument, pulse or sustained harmony through the boundary.
- Introduce and withdraw instrumental layers gradually. Resolve incompatible
  harmonies before overlapping them; a crossfade alone cannot fix a bad join.
- Let note releases and reverberation tails continue into the next shot.
- Use gradual tempo changes where the story warrants them. Put a true stop or
  new cue at an intentional dramatic event, with enough space to hear it.
- Keep a continuous ambience bed for a shared location. Change its perspective
  with overlapping envelopes. Do not fade every scene to silence and start a
  fresh noise bed at the next cut.
- Place action sounds on the shared event clock, with natural tails. Removing a
  visual action also removes its associated sound; stationary feet do not
  receive a walking loop.
- Duck music and ambience smoothly around speech. Do not use scene boundaries
  as automatic gain envelopes.

Review at least a phrase before and after every cut, first as score/ambience
stems, then as the complete encoded mix. Check beat continuity, harmony,
orchestration, level, ambience perspective and release tails. A waveform without
clicks may still sound like disconnected cues. Listening and a numerical seam
audit must be recorded separately.

## Every new element is drawn

Assign a stable reveal group and explicit onset to every newly introduced
character, prop, setting component, label and late answer. Each group has its
own progress; completing the setting must not cause later props to appear
instantly.

1. Trace contours along actual path length. Interpolate the endpoint of the
   current stroke; do not reveal only whole segments.
2. Lay pigment down in ordered directional passes, with pressure variation and
   uncovered paper. Avoid a flat coloured fill underneath an unfinished reveal.
3. Finish small internal marks and lettering, then give the completed drawing a
   readable hold.

Keep contour and pigment budgets separate. A colour pass must not erase an
earlier line-stage budget or change unrelated groups. Character scale and
opacity stay stable during drawing; shrinking, expanding, sliding and fading
are not substitutes for a drawing operation. Handwritten typography can trace
font paths and then fill the glyph with clipped hatch strokes.

Build a compact onset review for every group: blank, partial contour, completed
contour, partial pigment and finished hold. Include elements introduced late
inside a shot. Inspect a consecutive motion segment as well as these stills.
Seeking the same frame from different histories must produce the same pixels.

## Planted characters, purposeful local actions

Start with a readable static pose. Keep the actor's root position, body scale
and planted feet constant through the shot. Do not add a generic walk cycle,
bob, whole-body sway or repeated pose change simply to keep the frame moving.

Use a new drawing or cut when the story requires another location. A restrained
camera move can direct attention after the drawing has settled. Keep paper and
pigment in the same camera space.

Allow small local motion only when it communicates something specific: a blink,
a mouth shape, a hand working a tool, or an object being lifted. Keep the hand,
grip and prop on the same event model. Moving the object while leaving its hand
behind is a continuity defect. Confirm contacts through the entire motion,
including the first and last action frames.

Record exceptions deliberately. A well-supported full-body action can be
appropriate; its root motion, foot contacts, pose transitions and sound must be
reviewed as an action, rather than accepted because it rendered.

## Acceptance evidence

Maintain three independent review columns:

| Concern | Evidence to inspect | Failure that requires revision |
| --- | --- | --- |
| Sound continuity | Every cut in musical context, stems and encoded mix | Unmotivated restart, incompatible overlap, lost release or ambience gap |
| Draw-on appearance | Every group's contour/fill stages and consecutive frames | Fade, scale pop, premature solid fill, missed late group |
| Restrained motion | Static root/scale records and full contact sequences | Unmotivated translation, bobbing, stiff limb jump or detached prop |

Bind observations to the exact export hash. A decoded file, ASR transcript,
loudness result or generated contact sheet is not perceptual approval. Preserve
specific user feedback as an observed defect in the external production and
use it to revise both the implementation and these reusable rules.

When a user confirms a particular quality, record their exact reply, its scope
and the export hash. Keep that separate from agent listening or visual review;
confirmation of smooth transitions does not certify every other audio property.
For later picture-only revisions, copy the accepted encoded audio stream rather
than remixing or re-encoding it. Compare packet payload hashes, packet timing,
codec configuration and duration before carrying that acceptance forward.

For material adjustments, compare the same drawing at native output resolution
with paper, lighting and camera fixed. Test a small range of pressure values
before changing the whole film. Pigment pressure can reduce excessive bare-paper
gaps without thickening dark contours; it must still follow the actual drawing
strokes. Use coherent irregular bends and interrupted pressure for directional
materials such as wood, rather than uniform full-width parallel lines. Check
the result in a moving encoded sequence as well as stills. A material trial is
not accepted merely because its pixel statistics moved toward a reference.

Separate visible paper relief, pigment grain and contour erosion. One shared
noise mask can make faces, clothing, foliage and small marks look equally worn.
Choose pigment granularity at native output scale, use stable form-specific
pressure and drawing direction, and retain enough pigment in small identifying
marks. Pressure seeds must follow object identity, never the changing position
of a moving hand or prop. Check the rotated fill bounds as well as the texture:
a directional change must not leave an unintended unpainted wedge in the form.

When repeated hatch bands dominate a coloured form, vary stroke length, overlap,
endpoint placement and local pressure while keeping the intended drawing
direction. Changing only global grain does not break long parallel bands.
Compare small white and dark features separately: a treatment suitable for
foliage can obscure eyes or noses. Keep the original treatment for those marks
when the trial shows a regression. Preserve deterministic object seeds and
recheck contour/fill budgets after changing stroke topology.

Repeated props need stable individual drawings. Keep a common design, but vary
their local contour, hatch direction and pressure with an explicit identity key.
Nest component keys under their parent object and reuse them across shots.
Do not derive this identity from screen position, current time or call order:
that would change the material when an object moves or the scene is rearranged.
Protect grip coordinates, feet and identifying facial details. Compare a row
of repeated objects, then the same object at several times; variation must
reduce copying without introducing animation or identity drift. Verify scoped
state restoration and reveal budgets after adding these variants.

Inspect reference and candidate at the same native output scale before deciding
that a texture is too coarse or smooth. A reduced contact tile is useful for
sequence coverage but cannot judge line tooth. If the coloured wax already
matches and only contours look too clean, adjust contour deposition separately.
Do not weaken pupils, lettering or the entire picture to distress an outline.
Test fine limbs and drawing-stage frames as well as large closed shapes, and
hold material pressure constant throughout the reveal. Preserve the accepted
movie until the encoded candidate passes its own visual review.

When colour ends exactly at every contour, inspect whether edge marks are being
sampled by individual polygon segments. Dense curves can silently receive none
when every segment is shorter than the sampling interval. Sample cumulative
perimeter length instead, keep dry passes aligned with local hatching, and
limit their reach so silhouettes and contact points stay readable. Preserve
small facial marks, white features and dark identifying shapes. Compare a large
circle, an angular form and a grip at native size, then the complete draw-on
sequence. A rougher finished still does not prove a continuous pigment reveal.

## Continuous material through a physical transition

Separate base material, local wear and illumination. A washed-out page edge
may be a light-field error even when the paper colour is correct; inspect the
centre, edges and gutter before changing the whole drawing palette. On wood,
vary the density and contrast of coherent fibres over broad regions instead
of increasing the same speckle everywhere. Keep material variation fixed in
surface space during camera moves.

A turning leaf and its settled surface must share the same texture orientation
and light treatment. Reverse sampling order on the back face, carry the gutter
with the hinge, and remove the moving self-shadow continuously as the leaf
settles. Inspect consecutive native-resolution frames across that handoff;
checking only the midpoint and final pose can miss a brightness jump.

For a local picture repair, preserve earlier encoded GOPs when the splice
boundary permits it. Before inheriting an earlier visual review, decode and
compare every reused frame and its timestamp, bind both source file hashes,
and explicitly record the inherited range. Review all newly encoded frames
and the splice boundary. A stream-copy command alone is insufficient evidence.
`scripts/frame_review/check_video_prefix_identity.py` checks the decoded prefix
and writes per-frame hashes and timestamp comparisons to an external report.
