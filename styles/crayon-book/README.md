# Crayon Picture Book · 蜡笔绘本

**Package status: toolkit-ready / 材质工具包.** Wax pigment, paper relief, drawing reveals and physical picture-book motion.

This package provides reusable rules, blank inputs and generic tools. Author the
new subject's characters, scenes, narration, renderer and sound in its own project.
The catalog records local showcase pages separately from a published demo.

## Start a film

From the repository root:

```sh
python3 scripts/new_film.py my-film --style crayon-book
# Choose a new external directory if needed:
python3 scripts/new_film.py my-film --style crayon-book --output /absolute/path/my-film
```

Open `../codex-film-studio-projects/my-film` in Codex, read its `README.md` and
`prompt.txt`, and supply the topic, audience, language and duration. Creation does
not install packages or contact a voice service. Existing destinations are refused.
The working copy contains the style guide, shared production/review tools and
available provenance/license files. It is independent of previous productions.

## Package contents

| File | Purpose |
| --- | --- |
| [STYLE.md](STYLE.md) | Material, camera, motion and sound grammar |
| [starter/input-contract.json](starter/input-contract.json) | Empty subject, shots, narration and delivery contract |
| [starter/lib/material.mjs](starter/lib/material.mjs) | Wax and paper primitives |
| [starter/lib/desk.mjs](starter/lib/desk.mjs) | Desk material and spread lighting |
| [starter/scripts/synthesize_paper.py](starter/scripts/synthesize_paper.py) | Paper relief synthesis from a supplied blank sample |
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
