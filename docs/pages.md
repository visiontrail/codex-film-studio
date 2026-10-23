# The Film Studio homepage

Site URL: <https://visiontrail.github.io/codex-film-studio/>.

The source now builds a unified style library at the root and keeps the existing
whiteboard player at `styles/whiteboard/studio/index.html`. The English and Chinese
READMEs link to the homepage in their own language; film links open the player
directly. Root links with `?edition=short`, `?edition=long` or `#film` continue to
the whiteboard player. The deployed revision is recorded in `build-info.json`;
changing local source alone does not publish it.

## Design and source

`index.html` and `catalog/` contain the homepage. Its streaming-library layout uses
forest black, warm white and coral, an original material-study hero, a searchable
style collection, a screening room and an authoring path. English and Chinese
copy share the same layout; `?lang=en` / `?lang=zh` overrides the saved language.
Motion respects `prefers-reduced-motion`. No framework, CDN, remote font or
third-party script is needed.

Public builds add the commit revision to homepage asset URLs, catalog requests
and frame previews. This avoids reusing assets from the previous deployment
within GitHub Pages' cache window. Local previews do not require a revision.

`styles.json` supplies every style's name, descriptions, readiness, preview and
showcase paths, as it does for the READMEs. Filters add only presentation metadata
in `catalog/studio.mjs`; an unfamiliar style still appears under All styles and
in search. `docs/readme/frames.json` supplies undecorated film frames when present,
with the registry preview as a fallback. [Preview credits](readme/README.md)
remain with those images. The hero is an original, subject-independent SVG.

Style details show all available showcase links, guides, prompts and the project
creation command. Readiness describes the reusable package. A displayed frame,
a retained local film and a published sample remain separate states.

## Local style catalog

From the repository root:

```sh
python3 scripts/serve_styles.py --port 8249
```

Open **http://127.0.0.1:8249/** for the homepage. The server's
`catalog-availability.json` checks the actual entry file for each retained local
project. Missing projects have disabled showcase links and setup instructions.

Mid-century Cartoon has short/long players and motion review. Satellite Briefing
has a player, live composition and frame comparison. Sci-Fi Sitcom has its review
player, and Crayon Book has its player and frame comparison. Their HTML lives in
`styles/<id>/showcase/`; whiteboard retains `styles/whiteboard/studio/`.

Each local `showcases` entry records a repository-relative `project` and original
`source_page`. The server maps `/_projects/<showcase-id>/...` to that project,
with byte-range support for video seeking. An explicitly listed `linked_files`
entry permits a retained file symlink such as the sci-fi reference video; other
paths remain inside their project. Original production files are preserved.
If a project is stored elsewhere, update its `project` path locally.

A fresh clone contains the page source and preview images. It does not contain
local films or private review assets. To replay whiteboard locally, download its
pinned Release assets with:

```sh
python3 scripts/fetch_demo.py --edition all
```

## Build and preview Pages

With Python 3.11 or later:

```sh
python3 scripts/build_pages.py
python3 styles/whiteboard/studio/scripts/serve.py --port 8248 --directory .site
```

Open <http://127.0.0.1:8248/>. Add `--asset-dir /path/to/release-files` to reuse
downloaded Release archives. The builder refuses to overwrite an existing output;
use `--output /path/to/a/new-folder` for another preview build.

The builder copies an explicit list: the homepage, catalog, preview artwork and
existing whiteboard player with its checksum-verified `v0.1.0` sample assets.
It omits local production paths from the public catalog. Local showcases remain
discoverable in style details, with instructions to open them locally. Their
films, review pages, working audio and provider settings are not packaged.
`build-info.json` retains the source revision and released video hashes.

Assets use relative paths, including under a project URL such as
`/codex-film-studio/`. The player keeps its own relative media paths, subtitles,
chapters, language and edition controls.

## Deploy

Publishing requires a user request. The existing workflow runs on a push to
`main` or **Deploy film showcase** in Actions. Set **Settings → Pages → Source →
GitHub Actions** first, then wait for both build and deployment jobs. Only the
deployment job has Pages write permission. A local build or preview is not
evidence of a successful public deployment.

To publish another film, add its approved assets and player deliberately; do not
copy a retained production directory into the Pages output.
