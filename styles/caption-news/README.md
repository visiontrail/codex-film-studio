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

Reference influence: the editorial visual grammar of
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)'s Caption News style.
The rules and helpers here are independently authored; no upstream media or
production implementation is bundled.
