# Reference examination

Reference: LemoLab, **Meet Pip — Mid-century Cartoon**, local supplied MP4.
SHA-256: `a73905d12f82a935d75413ef3415e51e5400b0a41dd45a132c2be55f43420ed6`.
40.000 s, 1920×1080, 24 fps, **960 decoded frames**. Source is full-range
H.264 tagged bt470bg, with AAC stereo at 48 kHz. New delivery will use explicitly
tagged BT.709, standard-range yuv420p; decoded RGB comparisons account for this.

## Visual inspection coverage

All 20 consecutive atlases were opened and visually examined during this run,
each containing 48 consecutive frames. Coverage is 0–959 inclusive. Atlas
tiles are 384×216; their viewer displays were resized. This establishes a
complete sequential overview, not full-resolution scrutiny of every tiny
detail. Full-size frames 70, 211 and 455 were also opened to examine type,
line, registration, texture and glove construction. The automated records in
`review/reference/frames.csv` contain one row per decoded frame at 640×360.

| Frames | What is actually visible | Transfer to the new film |
|---|---|---|
| 0–30 | Box flaps open; held figure; small anticipation | Establish a real action before explanatory titles |
| 31–73 | Rays, product disc, script reveal and slab title | Warm mustard reveal; script kicker and offset plate |
| 74–163 | Long held composition; presenter changes arms | Let narration and the viewer catch up |
| 164–179 | Number disc grows into a circular next scene | Medallion/prop-centered iris, 24 fps |
| 180–239 | Kneel, physical contact, magnified hand, diagram | Actual hand-to-object contact; round contextual close-up |
| 240–292 | Clearance detail held, subtle registration changes | Reading windows; held body with moving eyes/hands |
| 293–335 | Number iris, new room color, phone callout | Rotate ground palette; keep the AI terminal turquoise |
| 336–399 | Finger tap, menu, signal rings, confirmation | An action with anticipation, contact and visible result |
| 400–437 | Confirmed state held; next number rises | Stop moving after an action succeeds |
| 438–526 | Large finger approaches button, hold, recoil | Close-screen action receives the full-frame close-up |
| 527–573 | Iris from button into overhead plan, rapid pullback | Move from algebra detail to a new practical situation |
| 574–654 | Continuous route over colored room planes | One causal sequence revealed progressively, then held |
| 655–744 | Side wipe to pink tip; cable lifted physically | Pink retention scene and practical tip ribbon |
| 745–878 | Bottom wipe, three medallions, summary held | A concise final manual with coherent colors and labels |
| 879–959 | Iris-out, small circle, circular credits | Closing circle with the new film's own title and credit |

## Measured and observed constraints

- Warm near-black ink, paper cream, coral sweater, navy trousers, turquoise
  object, and mustard / dusty-blue / avocado / pink grounds.
- Fill registration about 6 px right and 4 px down, with small changes on
  pairs of frames. Broken rounded outlines are visibly uneven, not dashed UI
  borders. One flat shade plane; no dimensional airbrush shading.
- Character head/face remains stable; hands carry action. Small motion is
  sparse. Camera and wipes are smoother than poses.
- Oleo Script kicker, Alfa Slab titles, medium Jost captions. Bottom caption
  card at approximately y=943–1021 with small coral stars and thin ink outline.
- The reference contains a male Kokoro narrator and an original cool-jazz score.
  New speech is explicitly Chatterbox; matching timbre is not assumed.

## First revision findings

The first new storyboard showed incorrect elbow choice, a writing hand that
missed the paper, an enlarged circular inset covering computer text, excessively
sharp grain, and an overly spiky result stamp. Revision changes elbow bend,
places the paper flat under the nib, separates inset/monitor bounds, reduces
grain alpha and broadens stamp points. Static Jost weights are retrieved separately
because the variable font initially rendered too light in the chosen renderer.

No pixel-similarity score between different stories is presented as a measure
of artistic equivalence. New-frame comparison will use corresponding visual
functions and keep its review coverage explicit.
