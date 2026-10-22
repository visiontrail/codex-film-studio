# Coffee Run: frame-based visual analysis

Reference file: supplied Sci-Fi Sitcom Toon MP4, 1920 x 1080, 24 fps, 57.5 seconds, 1,380 decoded frames. Source: LemoLab / lemomo-ai/lemo-opuscar; visual reference licensed CC BY 4.0. The new film uses original drawing functions and choreography, not the reference's animation implementation.

## Coverage

All frames 0–1379 were decoded and retained as consecutive labeled 320 x 180 thumbnails in 29 atlases (48 frames per full page). All 29 atlas pages were visually inspected in sequence. This is **every-frame thumbnail inspection**, not native-resolution manual inspection of 1,380 separate images. Native-size frames 70, 150, 320, 450, 590, 820, 1090 and 1180 were additionally inspected. Metrics are in ignored `review/reference/frames.csv`; the native extractions are `full-01.png` through `full-08.png`.

## Edit grammar and specific observations

- Early home scene: medium two-shot; tall inventor on right, compact anxious assistant on left. Speech stutter stays with one reaction beat. At frames 135, 161 and 190 the short interruptions cut tightly into facial reactions.
- Portal around frame 228 becomes the transition device. It is a lumpy green oval with flat spiral arms, pale center, sparse sparks and short lower drips. It rotates smoothly while characters move in held drawings.
- Title is an orbital Bungee lockup with cream fill and offset magenta; the opening world change occurs around frames 303–313. Arrival at frame 320 includes a visibly displaced character body, raised arms and a squash/settle, not just an opacity fade.
- Jelly world: magenta sky, acid-lime towers with pink windows, cyan foreground counter. Object insert around 423–451 gives the impossible coffee its own beat; reaction around 452 precedes the next portal.
- Orange/teal world: frame 590 uses a large anxious face, white eye masses, minute pupils and sweat drops; raised forearm creates a clear action silhouette. The deadpan response around 651 drops the energy.
- Montage around 679, 703 and 728 uses fast discrete destination changes. The ordinary shop around 750 onward returns to beige, brown and green. Frame 820 shows a deliberately mundane counter, worker and plant.
- Return home around 861; close-up around 903; cup insert around 977; assistant reaction around 1016; inventor/cup exchange around 1056; held silence around 1114. Frame 1180 is a medium pair with an unexpectedly speaking coffee. End sequence around 1272.

## Drawing constraints derived from the rendered pixels

Purple-black outlines, approximately 6–8 screen pixels on silhouettes; subordinate detail thinner. Camera magnification does not multiply all line widths. Outlines have a three-drawing irregularity at 12 drawings/second, distinct from camera and portal motion at 24 frames/second. Large flat fills, one hard shadow shape per major form; limited highlights on glass/liquid. The source does show a little tonal variation in a few fills: the dominant read remains flat, not glossy 3D.

Inventor: tall asymmetrical egg-shaped head, sparse hair loop, forehead goggles with amber glass, substantial dark brow, half-lidded eyes, long downturned nose, stippled stubble, teal robe, pale purple shirt and striped socks, pink slippers. Assistant: orange helmet with broad dark vents, warm brown face, separated circular glasses with pale inner rings, white eye discs and small pupils, purple vest, small pen pocket, anxious brow angles. Hands have a deliberate articulated silhouette rather than simple circles.

Captions: rounded heavy Baloo, off-white fill, thick dark border, typically one/two lines in lower safe area; compact colored speaker name pill. World card: top-left colored rectangle with dark hand-drawn boundary, large pixel font and an economical subtitle. Character expressions and silent reactions carry more comedy than the tags.

## Revision ledger

1. First look: medium close-ups retained an accidental cropped fragment of the other character. Revised close-up cameras and explicit foreground focus; prop inserts suppress unrelated characters.
2. First look: rectangular eyelid masks erased the upper eye boundary. Rebuilt curved lid fill and redrew the complete outline; Qin now retains half-lids during explanation.
3. First look: oversized normal speaking mouths, intersecting spectacle rings, mismatched hand skin and generic portraits. Reduced normal mouth range, separated glasses, corrected hands; Woolmer and Hanson rebuilt against inspected photographs.
4. First look: unsupported checkmark/arrow glyphs and a star-shaped football panel. Checkmarks/arrows now use geometry or supported characters; football uses pentagonal panels.
5. First look: tag contrast and proportions diverged. Increased tag type/size, restored scene-specific saturated cards, removed home-scene tag.
6. Native-size comparison: Qin's head remained too round and a hard shadow crossed the face outline. Narrowed the head, clipped the beard shadow to the silhouette, restored the final outer contour, added lower-eye folds and distinct goggle rims.
7. Dialogue pacing: added 25 internal cuts at script phrase boundaries, driven by the independently aligned word starts. Continuous parlay and cash-flow actions retain their uninterrupted inserts. World tags now type once at entry rather than restarting at every cut. Phone continuity is retained across the opening cut.
8. All 78 current representative dialogue/title/cold frames were inspected in seven labeled pages under `review/edited-look/`. These are composition checks for the draft edit, not every-frame final acceptance. The 37.25-second older opening preview also played to its end in the browser with 1920x1080 dimensions, readyState 4, unmuted, and no reported media error; it uses earlier drawing and provisional voices.

9. Initial full export, frames 0–47: coffee-machine warning and drip motion were too static. Added a six-frame warning-color pulse and two visible drops with timed foley. Native frames 8, 12 and 17 were inspected after the change.
10. User-requested Pocket TTS option: connected the existing service; reference-WAV upload returned HTTP 500, so the new casting uses Marius / Bo and Javert / Qin. All selected English takes were independently transcribed; exact raw audio, repairs, silence edits and selected hashes are retained. Longer silence is shortened without accelerating speech. Dialogue timing and mouth envelopes were rebuilt, producing 7,889 frames / 328.708 seconds / 95 shots.
11. Color check: the renderer's actual JPEG input reports full-range BT.601. The export now explicitly converts to limited-range BT.709 before encoding. A 12-patch encode/decode check measured a maximum channel difference of 4/255. The unchanged matte look was retained; a flat reference region had only 0.24/255 high-pass variation, insufficient evidence for adding a new grain effect.
12. All 78 current Pocket representative dialogue/title/cold frames were inspected in seven pages under `review/pocket-look/`, selected strictly from the current timeline. The separate `pocket-look-unfiltered` directory mixed legacy stills and is excluded from current-export evidence.

13. The first Pocket export (SHA-256 `853bccefed4951091a4cf4043d12f5a0a71300b455cd06419fbbce35bbf6a061`) was inspected in all 247 paired pages, covering frames 0–7888 without gaps. Nineteen additional native-size decoded frames were inspected. Browser playback reached the natural end with no media error. Records are retained under `review/pocket-v1/`; the paired thumbnails remain in `review/comparison-pocket/`. This coverage applies to that exact export.
14. Native-size comparison against reference frames 150, 590 and 1180 exposed overly elongated assistant spectacles and overly simple hands. Revised Bo to round spectacles with pale inner rims and smaller pupils; replaced circular hands with thumb and finger contours. Full-size candidate frames 190, 290, 2250 and 3500 were inspected, including a small ensemble view to keep the inner rims visible at that scale. The revised full export and its changed-frame review remain pending.

Every-frame thumbnail coverage is distinct from native-resolution inspection. These records do not establish a numerical or perceptual 100% identity.
