# Visual revision record

The complete V7 candidate remains in `delivery/`. V8 is rendered into a separate
`delivery/v8/` directory. Neither is a publication. Inputs, rejected attempts,
provider audio and review records remain local under the ignored media/review
folders; they are not silently replaced by the newer candidate.

## V7 review

The four actual visual-review records cover output frames 0–14661 exactly,
with 294 paired sheets. Reference review covers frames 0–5550 exactly,
with 56 sheets. Every cell was viewed at 160 × 90; selected images were also
opened at 1920 × 1080. This is not a claim that every frame was viewed at native
resolution. The separate coverage/hash aggregation is
`review/v7-visual-review-coverage.json`.

The V7 review found a clock showing the wrong time in the opening, overlap
between that clock and a spreadsheet header, a low-contrast equation arrow,
and several scenes with long holds or sparse paper layouts. It did not establish
perfect style equivalence. Fifteen older V5/V6 stills referenced as supplementary
context in the reference-A report have since been replaced; that legacy context
is excluded from the verified V7 and reference coverage.

## V8 changes

| Shot | Change |
| --- | --- |
| 01 | Dedicated midnight clock, resized and moved clear of the spreadsheet header |
| 03 | Old answer, formula and assistant badge physically leave; a blank new exercise arrives with the price column moved from B to C |
| 16 | Three paired illustrative requests enter and leave as paper strips; stable system labels and the causal caveat remain |
| 20 | An exam page leaves to reveal NOW; an unanswered MONTHS LATER? page covers it |
| 23 | A dense assemblage of statue, brain, tools and notebook forms, then the tools leave |
| 24 | Person and calculator paper cards overlap, separate, and retain the skill slips with the learner |
| 25 | Printed photographs accumulate, push into an eye close-up, then leave behind a blue paper wipe and three skill labels |
| 38 | The operation arrow is orange against the cream strip; the divide-by-two label is retained |
| 44 | The page and three colored columns arrive as physical objects, replacing the long initially empty table |

Narration, accepted WAVs, the frame clock, mixed sound and subtitles are unchanged.
The V7 source snapshot was checked against its render checkpoint before V8
integration. Source-phase reviews are evidence about source renders; the encoded
V8 candidate is covered by new actual reviews of changed frames plus the strict
decoded identity intersection with the complete V7 review. Its 75 assigned pages
contain all 3,067 changed frames; review completion and evidence validity are
recorded separately in `review/v8-visual-review-coverage.json` when available.

## V9 material revision

V8 native comparisons showed synthetic horizontal grain and angular highlights
in the teal stock, while the reference used coarse irregular fibres. A new
original rag-paper scan was generated with the built-in image tool; the complete
prompt is `content/paper-texture-v9-prompt.txt`. The original asset and hash are
listed in the asset provenance file. Background stock now retains working
resolution; pale stock uses a lower blend strength, while the teal stock retains
its stronger fibre contrast. The large artificial crease highlights were reduced.
The V8 source snapshot is preserved at `review/revisions/v8/source/`.

Root opened native V9 source frames 150, 12048 and 13980, and compared reference
frames 140, 2812 and 4410. This established a material improvement only, not full
film acceptance. All encoded V9 frames require a new actual visual review.

## Carrying visual evidence between versions

`scripts/compare_decoded_versions.py` compares all decoded RGB pixels and exact
frame timestamps. A completed, stable-input comparison may carry a prior actual
review only into verified pixel-identical ranges, intersected with that prior
review's coverage. Any changed frame must be inspected again. This method carries
image observations only; it neither invents a new visual review nor inherits
motion playback, listening or a style-equivalence verdict.

No palette, motion or hash statistic is a percentage of artistic similarity.

## V10 full-frame material correction

Native encoded V9 frames1362/2278/3536 exposed a source-size regression: the
new1672×941paper was drawn without an explicit destination size by two field
helpers, creating straight untextured strips. V9 is preserved as a rejected
candidate; its partial visual reviews are not final acceptance.

V10 scales those two full-frame draws to1920×1080 and corrects the unused base
helper in the same way. Three native source frames were opened after repair;
the strips are absent and text remains clear. Full encoded rendering and actual
frame review are required before delivering V10. No narration, subtitle, clock,
figure, formula or motion was changed.
