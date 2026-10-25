# Art Collage · 艺术拼贴

[**Open the Art Collage page / 打开艺术拼贴独立页面 ↗**](https://visiontrail.github.io/codex-film-studio/styles/art-collage/showcase/index.html)

**Package status: starter-ready / 创作起步包.** Paper materials, cutouts, typography, physical motion and review rules.

This package provides reusable rules, blank inputs and generic tools. Author the
new subject's characters, scenes, narration, renderer and sound in its own project.
The standalone page includes a released film preview, chapters, English captions,
transcript, research notes and a bilingual guide to the style. This screening copy
is separate from the blank authoring starter and does not add a scene renderer.

## Start a film

From the repository root:

```sh
python3 scripts/new_film.py my-film --style art-collage
# Choose a new external directory if needed:
python3 scripts/new_film.py my-film --style art-collage --output /absolute/path/my-film
```

Open `../codex-film-studio-projects/my-film` in Codex, read its `README.md` and
`prompt.txt`, and supply the topic, audience, language and duration. Creation does
not install packages or contact a voice service. Existing destinations are refused.
The working copy contains the style guide, shared production/review tools and
available provenance/license files. It is independent of previous productions.

## Package contents

| File | Purpose |
| --- | --- |
| [STYLE.md](STYLE.md) | Visual, motion, identity and production rules |
| [starter/content/brief.json](starter/content/brief.json) | Empty production brief |
| [starter/content/characters.json](starter/content/characters.json) | Portrait and character inputs |
| [starter/lib/paper.mjs](starter/lib/paper.mjs) | Deterministic torn paper and compositing primitives |
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
