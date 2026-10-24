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
The package includes no finished scene renderer or published demonstration.

## Explore the style

Open the library's `styles/caption-news/showcase/index.html` for an original type study,
visual rules, bilingual navigation and a local screening room. From the library
root, run `python3 scripts/serve_styles.py --port 8249`, then open
<http://127.0.0.1:8249/styles/caption-news/showcase/index.html>.

The page reads film metadata, chapters and media from the retained project
registered in `styles.json`. The generic page also works in a public build;
without local media it shows setup instructions. Its original schematic preview
is not a frame from a film. The page and retained film are excluded from new-film
starters, and the film is not included in the Pages artifact.

Reference influence: the editorial visual grammar of
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)'s Caption News style.
The rules and helpers here are independently authored; no upstream media or
production implementation is bundled.
