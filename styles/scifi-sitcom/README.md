# Sci-Fi Sitcom Toon · 科幻情景喜剧卡通

**Package status: starter-ready / 创作起步包.** Flat cartoon drawing, contrasting performances, camera continuity and spatial comedy.

This package provides reusable rules, blank inputs and generic tools. Author the
new subject's characters, scenes, narration, renderer and sound in its own project.
The catalog records local showcase pages separately from a published demo.

## Explore the style

[Open the Sci-Fi Sitcom Toon page](https://visiontrail.github.io/codex-film-studio/styles/scifi-sitcom/showcase/index.html)
for the finished English sample, a bilingual visual guide, an interactive expression
study and copyable creation prompts. The original reference and frame controls
remain on the [comparison page](https://visiontrail.github.io/codex-film-studio/styles/scifi-sitcom/showcase/comparison.html).
The study illustrates generic expression and timing; its figures are not a required
cast for new productions.

## Start a film

From the repository root:

```sh
python3 scripts/new_film.py my-film --style scifi-sitcom
# Choose a new external directory if needed:
python3 scripts/new_film.py my-film --style scifi-sitcom --output /absolute/path/my-film
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
| [starter/WORKFLOW.md](starter/WORKFLOW.md) | Story, audio, frame timeline and rendering |
| [starter/INPUTS.md](starter/INPUTS.md) | Empty production inputs |
| [starter/REVIEW.md](starter/REVIEW.md) | Reference comparison and delivery |
| [starter/lib/ink.mjs](starter/lib/ink.mjs) | Drawing helpers |
| [starter/lib/timeline.mjs](starter/lib/timeline.mjs) | Deterministic frame clock |
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
python3 -B -m unittest discover -s styles/scifi-sitcom/tests -v
node --test styles/scifi-sitcom/starter/tests/*.mjs
```
