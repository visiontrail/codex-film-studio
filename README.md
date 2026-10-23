# Codex Film Studio

**Choose a style. Bring a story. Make a film with Codex.**

A growing library of film styles, with explicit completion status, reusable
rules and project starters. All styles live in `styles/`; shared production
workflows live in `methods/`. Existing films and local projects are preserved.

[Watch the films online](https://visiontrail.github.io/codex-film-studio/) ·
[简体中文](README.zh-CN.md) · [Make a film](#make-a-film-with-codex) ·
[Rebuild the sample](#rebuild-the-whiteboard-sample) · [Releases](https://github.com/visiontrail/codex-film-studio/releases)

## The styles

Start with the [complete style catalog](styles/README.md) or run:

```sh
python3 scripts/new_film.py --list
python3 scripts/new_film.py my-film --style midcentury-cartoon
```

The catalog includes **whiteboard, art-collage, crayon-book, midcentury-cartoon,
satellite-briefing and scifi-sitcom**. Each uses the same command. Completion
is recorded as a published sample, an authoring starter or a material toolkit;
the catalog also lists whether a renderer and local showcase pages exist.

Open all existing showcase pages from one local entrypoint:

```sh
python3 scripts/serve_styles.py --port 8249
```

Open **http://127.0.0.1:8249/**. The pages live under their style package and read
media from the retained projects. See the [local showcase guide](docs/pages.md#local-style-catalog)
for dependencies and the difference between local and published pages.

### Published sample · Whiteboard Explainer

[![Whiteboard: learners, a Turkish flag and two scoreboards](styles/whiteboard/poster.png)](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-3min.mp4)

**Does AI Help You Learn—or Just Finish?**

Floating markers draw a story on one persistent board. Handwritten notes,
people, laptops, books and a Turkish flag explain the difference between
finishing with help and doing the work alone.

[Watch / download 3-minute film](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-3min.mp4) ·
[12-minute edition](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-long.mp4) ·
[Style guide](styles/whiteboard/STYLE.md) · [Sample details](styles/whiteboard/DEMO.md)

## Shared production methods

[methods/](methods/README.md) contains the common production and review workflows.
Style-specific paper, crayon, cartoon, geography and performance rules live with
the corresponding style. Existing external projects are independent copies.

## Make a film with Codex

```sh
git clone https://github.com/visiontrail/codex-film-studio.git
cd codex-film-studio
```

Open this folder in Codex and ask:

> Use the whiteboard style to make a three-minute film about how solar panels
> work. Create it outside this library in ../codex-film-studio-projects/solar-panels. Draw people and objects when they help
> explain an idea. Use English narration and deliver a 1080p MP4. Inspect the
> rendered result and repair problems before showing me the film.

The repository includes `AGENTS.md` and a repo-local
[`codex-film` skill](.agents/skills/codex-film/SKILL.md). You can also explicitly
ask Codex to read that file. The style prompt is available separately in
[`styles/whiteboard/prompt.txt`](styles/whiteboard/prompt.txt).

Codex creates a working copy, writes the story, adapts the composition,
generates or imports narration, then renders the film. New narration needs
your own Chatterbox-compatible service or WAV recordings. The included sample
can be rebuilt with its released narration, without TTS credentials.

## Rebuild the whiteboard sample

Requirements: **Node.js 20+, Python 3.11+, FFmpeg**. Tested on Apple Silicon
macOS with Node 24 and FFmpeg 8. The sample replay also has a Linux CI smoke
check. Native Windows is not supported by the speech client; use WSL.

From the repository root:

```sh
# Download the original sample narration, timing and finished video.
python3 scripts/fetch_demo.py --edition short
cd styles/whiteboard/studio
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# A quick picture preview, then a complete rebuild with voice and sound.
node scripts/render.mjs --start 0 --end 8 --width 960 --out media/preview.mp4
.venv/bin/python scripts/build.py --skip-atlases
python3 scripts/serve.py
```

Open **http://127.0.0.1:8246/**. The final file is
`styles/whiteboard/studio/media/does-ai-help-you-learn-3min.mp4`.
Rendering time depends on your machine. The preview is picture-only; the
complete build mixes narration, music and marker sounds.

For both editions, run `python3 scripts/fetch_demo.py --edition all` from the
repository root. Add `--edition long` to the studio's render/build commands.
The long output is `editions/long/media/does-ai-help-you-learn-long.mp4`.

Git contains source, fonts and instrument samples. MP4s, narration WAVs and
timing data are downloaded from the versioned Release and checked against
SHA-256 hashes. Cloning alone does not download the films. Rebuilding preserves
the composition and input audio; different renderer/encoder versions can
produce different file bytes.

## Make your own working copy

```sh
python3 scripts/new_film.py my-film --style <id>
# Optional destination; it must not already exist and must be outside this library.
python3 scripts/new_film.py my-film --style <id> --output /absolute/path/my-film
```

Open `../codex-film-studio-projects/my-film` in Codex. Read its `README.md`,
`STYLE.md`, `prompt.txt` and available workflow/review guides. Supply the subject,
audience, language and duration. The command prepares a project; authoring,
narration and rendering follow in that project.

The whiteboard studio contains its legacy sample composition as editable code.
Other styles supply blank inputs and helpers; scenes and rendering must be
written for the new subject. Crayon Book currently supplies material tools and
an input contract. New films always need their own picture, motion and audio review.

The former `methods/<style>/` packages now live in `styles/<style>/`. Use the
unified command above. `--method <id>` remains a deprecated alias for saved
commands. No old project must be recreated to continue using it.

## Add a style

Register every visual style in `styles.json`, including those without a published
sample. Record actual completion and capabilities, then regenerate the readable
index with `python3 scripts/update_style_index.py`. See [CONTRIBUTING.md](CONTRIBUTING.md).

Specific real people require portraits supplied for the new film. Keep production
media and private records in the external project; contribute reusable rules,
tools and blank inputs to the library. Existing samples and showcase pages remain
available as reference material.

## The public showcase

The [GitHub Pages site](https://visiontrail.github.io/codex-film-studio/) plays
both sample editions with subtitles, chapters and links to the getting-started
guides. The Pages workflow deploys updates pushed to `main`.

To host a fork, select **Settings → Pages → Source → GitHub Actions**, then
run **Deploy film showcase** in Actions. The build downloads the pinned Release
assets, verifies their SHA-256 hashes and publishes only the player assets.
See [the deployment guide](docs/pages.md) for local preview and customization.

## Credits and license

By **LeoGuoLabs**, built with Codex. Inspired by the style-library approach of
[LemoLab's lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar).

Original code and documentation: [MIT](LICENSE). Our sample films and stills:
[CC BY 4.0](MEDIA-LICENSE.md). Fonts and instrument recordings retain their
own licenses; see [credits](styles/whiteboard/studio/CREDITS.md).
