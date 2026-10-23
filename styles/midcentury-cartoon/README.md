# Mid-century Cartoon · 50 年代平涂卡通

**Package status: starter-ready / 创作起步包.** Misregistered flat colour, broken ink, held poses, purposeful hand actions and jazz.

This package provides reusable rules, blank inputs and generic tools. Author the
new subject's characters, scenes, narration, renderer and sound in its own project.
The catalog records local showcase pages separately from a published demo.

## Start a film

From the repository root:

```sh
python3 scripts/new_film.py my-film --style midcentury-cartoon
# Choose a new external directory if needed:
python3 scripts/new_film.py my-film --style midcentury-cartoon --output /absolute/path/my-film
```

Open `../codex-film-studio-projects/my-film` in Codex, read its `README.md` and
`prompt.txt`, and supply the topic, audience, language and duration. Creation does
not install packages or contact a voice service. Existing destinations are refused.
The working copy contains the style guide, shared production/review tools and
available provenance/license files. It is independent of previous productions.

## Package contents

| File | Purpose |
| --- | --- |
| [STYLE.md](STYLE.md) | Visual, performance and sound grammar |
| [starter/WORKFLOW.md](starter/WORKFLOW.md) | Short and chaptered film production |
| [starter/AUDIO.md](starter/AUDIO.md) | Narration, original WAVs and timing |
| [starter/REVIEW.md](starter/REVIEW.md) | Frame, motion and listening review |
| [starter/INPUTS.md](starter/INPUTS.md) | Empty input contracts |
| [starter/lib/print.mjs](starter/lib/print.mjs) | Print and drawing primitives |
| [starter/lib/timeline.mjs](starter/lib/timeline.mjs) | Frame clock and shot lookup |
| [PROVENANCE.md](PROVENANCE.md) | Sources and licensing |
| [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt) | Retained upstream license |
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
python3 -B -m unittest discover -s styles/midcentury-cartoon/tests -v
node --test styles/midcentury-cartoon/starter/tests/*.mjs
```
