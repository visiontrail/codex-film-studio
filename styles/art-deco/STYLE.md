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

Quantize articulated poses to 12 updates/second while the camera, lighting and export run at 24 fps. Keep breathing restrained. Draw continuous sleeves with rounded elbows, visible cuffs and simple finger/thumb marks. Hands must reach and remain attached to the prop they operate. Author shoulder, elbow, wrist and body placement together; reject elongated arms used to reach an impossible target. Check foot planting in both close view and pullback.

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
