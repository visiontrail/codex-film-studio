# Satellite Briefing · 卫星影像／地理简报

**Package status: starter-ready / 创作起步包.** Geographic camera, real imagery, measurements, local maps and verified footage.

This package provides reusable rules, blank inputs and generic tools. Author the
new subject's characters, scenes, narration, renderer and sound in its own project.
The catalog records local showcase pages separately from a published demo.

## Start a film

From the repository root:

```sh
python3 scripts/new_film.py my-film --style satellite-briefing
# Choose a new external directory if needed:
python3 scripts/new_film.py my-film --style satellite-briefing --output /absolute/path/my-film
```

Open `../codex-film-studio-projects/my-film` in Codex, read its `README.md` and
`prompt.txt`, and supply the topic, audience, language and duration. Creation does
not install packages or contact a voice service. Existing destinations are refused.
The working copy contains the style guide, shared production/review tools and
available provenance/license files. It is independent of previous productions.

## Package contents

| File | Purpose |
| --- | --- |
| [STYLE.md](STYLE.md) | Camera, imagery, annotation and sound grammar |
| [starter/WORKFLOW.md](starter/WORKFLOW.md) | Brief to delivery |
| [starter/FOOTAGE.md](starter/FOOTAGE.md) | Real footage verification and acquisition |
| [starter/INPUTS.md](starter/INPUTS.md) | Coordinate and timing contracts |
| [starter/REVIEW.md](starter/REVIEW.md) | Review and delivery |
| [starter/lib/geo.mjs](starter/lib/geo.mjs) | Projection, distance and camera helpers |
| [PROVENANCE.md](PROVENANCE.md) | Sources and licensing |
| [prompt.txt](prompt.txt) | Short prompt for the generated project |

## Reuse and review

New projects select their own facts, cast, identities, voices and assets. Specific
real people use portraits supplied for that production. Keep originals, provider
responses, films and review records in the external project. Contribute reusable
rules and tools back to this style package. The existing showcase pages are retained
examples; their review conclusions do not apply to new films.

Use [frame-review tools](../../scripts/frame_review/README.md), record actual
still inspection, motion playback and listening separately, and repair observed
defects. A successful helper test or render does not establish visual acceptance.

## Helper and packaging checks

```sh
python3 -B -m unittest discover -s styles/satellite-briefing/tests -v
node --test styles/satellite-briefing/starter/tests/*.mjs
```
