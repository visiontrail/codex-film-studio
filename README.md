# Codex Film Studio

**Choose a style. Bring a story. Make a film with Codex.**

A growing library of film styles, each with a real sample, a reusable style
prompt and editable production code.

[Watch the films online](https://visiontrail.github.io/codex-film-studio/) ·
[简体中文](README.zh-CN.md) · [Make a film](#make-a-film-with-codex) ·
[Rebuild the sample](#rebuild-the-whiteboard-sample) · [Releases](https://github.com/visiontrail/codex-film-studio/releases)

## The styles

### 01 · Whiteboard Explainer

[![Whiteboard: learners, a Turkish flag and two scoreboards](styles/whiteboard/poster.png)](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-3min.mp4)

**Does AI Help You Learn—or Just Finish?**

Floating markers draw a story on one persistent board. Handwritten notes,
people, laptops, books and a Turkish flag explain the difference between
finishing with help and doing the work alone.

[Watch / download 3-minute film](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-3min.mp4) ·
[12-minute edition](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-long.mp4) ·
[Style guide](styles/whiteboard/STYLE.md) · [Sample details](styles/whiteboard/DEMO.md)

## Reusable production methods

[Mid-century Cartoon](methods/midcentury-cartoon/README.md) preserves misregistered
flat colour, broken ink, held character poses, purposeful hand actions and a
cool-jazz sound palette. Its subject-empty starter includes Canvas primitives,
an audio-led frame timeline, Chatterbox contracts and explicit every-frame
review rules for short or chaptered films:

```sh
python3 methods/midcentury-cartoon/new_project.py my-film
```

[Satellite Briefing](methods/satellite-briefing/README.md) provides geographic
camera and measurement rules, local map/scan treatment, an optional verified
YouTube-footage workflow, Chatterbox timing contracts and frame-review criteria.
Its external starter contains empty inputs and tested geographic helpers:

```sh
python3 methods/satellite-briefing/new_project.py my-film
```

[Sci-Fi Sitcom Toon](methods/scifi-sitcom/README.md) provides subject-independent
drawing, acting, camera, sound and review rules, an empty project creator, and
generic ink/timeline helpers. It includes no inherited story, cast, country,
statistics or dialogue. Start with its guide and supply your own subject.

```sh
python3 methods/scifi-sitcom/new_project.py my-film
```

The project is created outside the library. This is a reusable method package;
it is separate from the released sample styles listed above.

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
python3 scripts/new_film.py my-film --style whiteboard
```

Open `../codex-film-studio-projects/my-film` in Codex. See [TECHNIQUE.md](TECHNIQUE.md) for the file map,
speech setup and rendering commands. The starter contains the sample story
as editable code; Codex must adapt its narration **and** illustrations.

## Add a style

Each entry in `styles.json` points to its own guide, prompt, poster, demo and
working template. See [Contributing a style](CONTRIBUTING.md).

## Reusable methods

[Art collage](methods/art-collage/README.md) contains visual and motion rules,
portrait input contracts, material primitives and [frame-review tools](scripts/frame_review/README.md).
Its starter has no example story, narration, character or brand asset:

```sh
python3 scripts/new_film.py my-film --method art-collage --output /path/to/my-film
```

Specific real people require portraits supplied by the new film's user. The
reference person's likeness is optional; material, composition and motion are
reviewed separately. Keep each new production outside this library. Contribute
only reusable methods/tools or empty inputs back to the repository. Existing
published demos remain legacy reference material.

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
