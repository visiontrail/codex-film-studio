# Art Deco

Original Canvas 2D drawing tools for a lacquer-and-brass animated film. This is a material and figure toolkit, not a completed scene generator. A new subject needs its own drawings, blocking, narration, camera and score.

## Reference and scope

The visual reference is LemoLab's [Art Deco film, Midnight at the Starlight Hotel](https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/art-deco.mp4), from [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar), CC BY 4.0. The reference is landscape; vertical productions must restage depth, scale and safe areas. The toolkit is independently authored and imports no upstream renderer or animation code.

The reference's characteristic combination is precise metallic linework, warm faceted figures, stepped architecture, spatial camera movement, causal physical comedy and jazz orchestration. Gold captions on a dark background alone do not reproduce it.

## Drawing system

- Base: black lacquer `#0D0B09`; deepest black `#060504`.
- Metal: dark brass `#6F5220`, gold `#C9A24B`, warm highlight `#F3D98B`, narrow hot edge `#FFF4D2`.
- Paper: ivory `#F2E8D5`. Paper and faces retain a light endpoint; do not shade them to black.
- Accent: burgundy `#8E1B2E` and emerald `#1D6B57`.
- Form: hard directional planes with a restrained airbrush gradient. Continuous thin lit edges have a slightly wider dark undercut. Avoid a thick uniform cartoon outline.
- Structure: stepped arches with a circular crown, sunbursts, fans and chevrons belong to architecture and props. Do not repeat the same decorative border behind every shot.
- Type: Limelight for short display titles, Poiret One for fine inscriptions, Josefin Sans for readable captions. Load actual fonts before rendering; retain their OFL notices.

## Figures and physical action

Use a slender roughly seven-head silhouette, fitted clothing, small brass fastenings, warm two-plane skin, curved brows, almond eyes and a single nose stroke. Acting needs a changing pose or expression, not only translation of a static character.

Use 12 pose updates/second for slower articulated motion such as walking, and distinct poses on consecutive 24 fps frames for quick forehead sweeps. The camera, lighting and export run at 24 fps. Keep breathing restrained. Draw continuous sleeves with rounded elbows, visible cuffs and simple finger/thumb marks. Hands must reach and remain attached to the prop they operate. Author shoulder, elbow, wrist and body placement together; reject elongated arms used to reach an impossible target. Check foot planting in both close view and pullback.

## Camera and timing

Use a real projective camera for rooms, floors, towers and overhead patterns. Foreground and background must change scale at different rates. A long scene should contain an observable setup, action and result. Add short insert cuts when a small detail causes the next event.

Characteristic transitions include center-opening cartouches, hinged brass doors with perspective shortening, circular prop match cuts, architectural cutaways, and an oblique composition resolving into an overhead radial pattern. Do not put the same door transition between every pair of shots. Use direct cuts for facial reactions and causal detail inserts.

Sequential bulbs ignite individually, briefly peak above their settled brightness, then decay over about 0.18 seconds. Glows are restrained local light, not a uniform bloom over the frame. Searchlights, reflections and material sheens move independently of rigid geometry.

## Sound and captions

Compose original piano/clarinet/strings/muted-brass jazz or an equivalent period ensemble. Map accents, steps, switches, turns and impacts to integer timeline frames. Narration needs space in the orchestration. Normalize voices consistently, duck the music smoothly, and check both integrated loudness and true peak after mixing.

Caption intervals come from the actual accepted audio, not equal fractions of a shot. Keep clauses short, remain inside the vertical safe area, and do not leave a spoken caption over a long music-only passage. Original provider WAVs, request hashes and repair history stay in the production.

## Acceptance

1. Retain the actual reference film and its provenance in the production.
2. Decode every reference and output frame; store indices, timestamps and complete contact-sheet coverage.
3. Map output shots to relevant reference shot classes. Different stories are not compared by matching global elapsed time.
4. Inspect all declared frame ranges, then inspect faces, hands, typography, occlusion and transition boundaries at native size. Record observed defects and repairs.
5. Verify normal-speed encoded playback, seeking, ending, audio intelligibility and caption timing separately.
6. Freeze the material system and make a new story with it. Record its own review; an earlier successful film does not validate a new film.

Palette, edge and frame-difference metrics help locate discrepancies. They do not constitute a perceptual similarity percentage or proof of exact style equivalence. State the actual inspection resolution and the limits of listening access.

Profile walking is available through `person(..., {pose: "walk", turn: -1 | 1})`. Use it for lateral travel; keep camera targets on the traveling subject through large scale changes. A close hand insert must have a continuous sleeve extending into the character or beyond the frame.

Portrait inserts should retain recognizable architecture with shallow depth of field. Render the background to an offscreen layer, blur that layer, and keep the face and clothing edges sharp. Metallic fasteners use directional or radial highlights without the light halo used for electric bulbs.

Faces use a curved cheek and jaw enclosing one clipped shadow plane. Keep the upper eyelid stronger than the lower contour; make surprise, concern and determination visibly distinct. A hand-to-headgear reaction needs shoulder anticipation, an elbow bend and a wrist that remains connected when drawn in front of the head. The toolkit's `consider` pose exposes that action through `action` from zero to one.

Ivory fans retain a light outer edge, scalloped folds, fine brass ribs and a double pivot. A radial arrangement can pair each large outward-facing fan with a small inward-facing fan, then add faint counter-rotating inner rings. Derive the portrait camera fit from the projected outer fan envelopes at every tilt, including the magnified near side. Fitting pivot positions alone can still crop the petals. Inspect the transition into and out of the formation as well as the overhead endpoint.

Mechanical inserts need a physical setting: mounting depth, cast shadows, visible fasteners and a supporting floor or plinth. Shade cylindrical brass across its diameter; a long gradient along the whole path makes a tube read as a flat ribbon. `brassTube(context, points, width)` provides a restrained wall shadow and a transverse highlight for each straight segment. Add elbows or bolted flanges over junctions in the production drawing. Place traveling light pulses by cumulative path distance so speed remains continuous across unequal segment lengths. Check feet against the chosen floor height and put a dark cartouche behind any label that crosses equipment edges.

For stationary effort, `person(..., {planted: true, bodyLean: radians, handTargets})` rotates the torso about the pelvis while keeping the feet fixed. Hand targets are measured in the unrotated local body coordinates and compensate for that lean. Keep each shoulder-to-wrist distance within 210 local units for the two 105-unit arm segments. Shape discrete pulls with anticipation, peak and release, and align each peak with the relevant action word; constant sinusoidal drift does not communicate repeated effort.

Separate cool exterior darkness from localized warm glazing and lamps. Give architecture front and side planes; project the thickness of arches through the same camera as their openings. Use sparse distant silhouettes behind the foreground skyline and broken horizontal reflections below lit waterfronts. `lightBeam(context, from, to, nearWidth, farWidth, {color, strength})` draws a clipped, fading light cone; animate its direction independently of buildings and keep its opacity low. It is a stylized lighting layer, not a physical volumetric simulation. For interiors, pair a roof shaft with a restrained floor pool and cast shadows. Check foreground planters and furnishings against the figure's feet through the whole camera move, keeping walkways visibly clear.

Build portrait reactions from distinct beats: anticipation, a quick gesture, a change in gaze or expression, then release. `reactionActing(time, progress, {beat, greenUniform})` supplies timed poses for `listen`, `concern`, `remember`, `discover` and `relief`; spread its result into `person` options. Use these as story cues, not continuous idle motion. The discovery gesture supplies explicit `elbowSides` for a natural bend; keep inverse-kinematic wrist targets within reach and inspect them through every close-insert boundary.

For radial formations, derive each fan or leaf axis from the projected center-to-pivot vector with `projectedRadialAngle(project, x, z)`. A world-space angle is not a screen-space rotation: the overhead camera can reverse its vertical component. `radialFloor` adds alternating dark wedges and concentric brass rings through the same projection. `radialBeat` supplies tempo-linked opening, staggered bloom and opposing pair displacement; pass the actual score BPM. Quantize articulated opening at 12 fps while camera and slow rotation remain continuous. Keep conservative petal envelopes inside the portrait frame at every tilt, and review consecutive opening/closing cycles rather than one attractive endpoint.

An overhead center emblem belongs below foreground figures and should foreshorten with the floor; drawing it last at a fixed circular scale can conceal faces during the tilt. Leaves may accept an optional `{base, light}` material as the final `leaf` argument. For a dark radial stage, a pale jade highlight (`#d5d1a4`) over `#627b4e` retains green identity while separating the silhouette from black lacquer. Keep this choice local to the shot and recheck neighboring scenes for unchanged materials.

Keep the exposed neck short relative to the face height in both frontal and profile drawings. When moving the head, move head-contact wrists by the same amount and verify the full gesture, including release. Shallow open-eye arches and an upward closed-eye curve support the reference cartoon expression; use a brief closed-eye beat for relief instead of holding one smile throughout a long reaction.

The neck has a rounded lower edge overlapping the collar, a narrow lit side and a hard shadow plane. Drawing it behind the tunic can hide this curve and leave a short rectangle. Keep head width independent of height; when narrowing it, adjust earphone and forehead-contact wrists horizontally. A clipped cheek highlight, shallow warm lower-eyelid shadow and long single-stroke nose bridge complete the face material. Inspect frontal reactions and both profile directions after changing these proportions.

Give a radial phrase a final arrangement: after opening and paired movement, gather adjacent sectors and move one pair to two distances along a common radius. Let the fans settle open, reduce inner echoes, and fade any center ornament before an inward fan crosses it. `radialBeat` returns `resolve` for this final phase. Verify that inward travel preserves the projected outward axis, keeps both fan pivots joined, and leaves the whole formation inside the frame.

Portrait reactions use `expression: 1` to narrow both eyelids for determination, clip the iris to the visible eye opening, strengthen the brow angle and give relief a small open smile with a light upper edge. `expression: 0` retains the quieter drawing for other scenes. Time a forehead touch and release in seconds, so a longer narration does not stretch a brief reaction into a prolonged pose. Check the surprise-to-determination change, hand release and smile at normal speed as well as on enlarged frames.

For an emphatic forehead reaction, `foreheadSweep: true` with `pose: "consider"` rotates the upper arm across the chest and above the head before contact. `action` runs this path forward from 0 to 1 and backward for release. Both limb segments retain their lengths throughout the arc. The quick crossing, diagonal, overhead and contact poses advance on consecutive 24 fps frames, followed by a contact hold; slower body animation can remain at 12 updates/second. `reactionActing` supplies this sweep for concern, recollection and the green-uniform relief beat, with a small opposite torso lean to keep the wide elbow inside a portrait composition. Inspect the intermediate crossing poses, not just the contact endpoint; allow brief face occlusion during the sweep and keep the expression readable during the hold.

A spoken passage may continue across a brief reaction, a causal prop insert and the character's next action. Avoid stretching a portrait to the full narration interval. Author internal cuts on integer frames, keep sound and caption timing continuous, and map each cut separately to the appropriate reference shot class. Inspect the first and last source frame of each class so a neighboring shot does not enter the comparison by an inclusive-boundary mistake. Retain only the gesture beats that remain readable at normal speed; inspect both sides of every new boundary and any outgoing transition that reuses the final frame.

Fit a reaction to the full gesture envelope, including the glove beyond its wrist target. Check every intermediate pose on a wider transparent canvas before cropping to the delivery aspect ratio; a bounds test on an already cropped image cannot detect lost pixels. Keep this fit stable across the shot so the correction does not introduce a zoom during the gesture.

Give reaction backgrounds a lighting progression. `portraitLighting(context, time, {resolved, origin})` applies cool negative fill on the left and suppresses a bright foreground floor. With `resolved: true`, a warm right-side glow and three restrained diagonal cones separate a discovery or relief beat from a darker concern beat. Draw this layer after the defocused set and before the sharp figure; keep the face's hard shadow plane and the metal edges readable. `origin` locates the principal source above the frame. Cones drift slowly in seconds, independently of the character's pose updates. Inspect both the close insert and its adjacent cuts: an attractive isolated light pattern does not establish continuity or reference equivalence.
