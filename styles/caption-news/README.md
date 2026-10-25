# Caption News · 字幕新闻

**Package status: starter-ready / 创作起步包.** A subject-empty authoring package
for large editorial captions, selective emphasis, ledger graphics and kinetic
entrances. The scene renderer and audio pipeline must be authored per production.

From the library root:

```sh
python3 scripts/new_film.py my-film --style caption-news
```

The independent project contains [the style guide](STYLE.md),
[empty inputs](starter/INPUTS.md), [caption motion helpers](starter/lib/caption.mjs),
the shared methods and frame-review tools. Creation does not install packages,
contact a provider or reuse another film's story. Use supplied recordings or a
configured voice service, then measure and align the audio in that project.

Read [the starter guide](starter/README.md). Choose a licensed font and a renderer
suited to the new composition; the helpers need only a current Node.js runtime.
The starter contains no finished scene renderer. A separately published film
preview is available on the style page.

## Explore the style

Open the library's `styles/caption-news/showcase/index.html` for an original type study,
visual rules, bilingual navigation and a screening room. Watch the
[complete online film preview](https://visiontrail.github.io/codex-film-studio/styles/caption-news/showcase/index.html#screening).
For local production playback, from the library
root, run `python3 scripts/serve_styles.py --port 8249`, then open
<http://127.0.0.1:8249/styles/caption-news/showcase/index.html>.

The public build downloads a checksum-pinned Release bundle containing the
complete web preview, poster, captions, chapters and credits. Local playback can
still use the retained production registered in `styles.json`. The original
schematic artwork is labelled separately from the video. Production-specific
media and metadata stay in the Release bundle and Pages artifact; they are not
copied into new-film starters or reusable methods.

Reference influence: the editorial visual grammar of
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)'s Caption News style.
The rules and helpers here are independently authored; no upstream media or
production implementation is bundled.
