# GitHub Pages

Live site: <https://visiontrail.github.io/codex-film-studio/>.

The published site uses the existing whiteboard showcase. Its three-minute and
twelve-minute films, posters, subtitles and chapter timings come from the
checksum-pinned `v0.1.0` Release. Videos are served from Pages itself, so the
player and captions share the same origin. No TTS credentials are required.

The header switches between English and Chinese page copy, including chapters,
instructions and research summaries. The choice is remembered locally; a
`?lang=en` or `?lang=zh` link overrides it. Language changes preserve the film's
playback state. The sample films retain their original English narration and
subtitles.

## Deploy

1. In the repository, select **Settings → Pages → Source → GitHub Actions**.
2. Push to `main`, or run **Deploy film showcase** from the Actions tab.
3. Wait for both the build and deployment jobs. The deployment environment
   links to the live site.

The workflow downloads the exact assets listed in
`styles/whiteboard/demo-assets.json` and checks their file sizes and SHA-256
hashes before publishing. It copies an explicit list of player assets to
`.site/`; source audio, local working films, review records and settings are
not included. `build-info.json` records the deployed commit and video hashes.
The Pages permission is limited to the deployment job.

The local `productions/` directory is ignored by Git and is not a Pages build
input. Keep its working projects locally; the published whiteboard demos remain
in the Release and the existing `styles/whiteboard/` source directories.

## Preview locally

From the repository root, with Python 3.11 or later:

```sh
python3 scripts/build_pages.py
python3 styles/whiteboard/studio/scripts/serve.py --port 8248 --directory .site
```

Open <http://127.0.0.1:8248/>. To reuse downloaded Release files, add
`--asset-dir /path/to/release-files` to the build command. The builder refuses
to overwrite an existing output folder; use `--output /path/to/a/new-folder`
for a second preview build.

## Customize a fork

The page source is `styles/whiteboard/studio/index.html`, `showcase.css` and
`showcase.mjs`. Update the GitHub links and README site URLs to your repository.
To publish different sample films, update the Release asset manifest and the
page's edition filenames together. All player assets use relative paths so
the site works under a project URL such as `/codex-film-studio/`.

GitHub's [custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
describes the Pages deployment actions.

## Local style catalog

All style packages and retained showcase pages are indexed in `styles.json`.
The readable catalog is `styles/README.md`; preview them together with:

```sh
python3 scripts/serve_styles.py --port 8249
```

Open **http://127.0.0.1:8249/**. Mid-century Cartoon has short/long players and
motion review, Satellite Briefing has a player, live composition and frame
comparison, Sci-Fi Sitcom has its review player, and Crayon Book has its player
and frame comparison. These HTML files live under `styles/<id>/showcase/`.
Whiteboard retains its existing `styles/whiteboard/studio/` entrypoint.

The migrated pages read media and review assets from the retained local projects.
Each local `showcases` entry records a repository-relative `project` and original
`source_page`. The server maps `/_projects/<showcase-id>/...` to that project,
with byte-range support for video seeking. An explicitly listed `linked_files`
entry permits a retained file symlink such as the sci-fi reference video; other
paths remain inside their project. A page's base URL preserves CSS,
fetches and dynamic image paths; links between migrated pages use their new
`styles/` paths. Original production files and prior snapshots remain available.
If a project is stored elsewhere, update that entry's `project` path locally.

A fresh clone contains the page source but does not include local films or private
review assets. The catalog marks a missing project, and missing resources return
404. To replay whiteboard locally, download its Release assets with
`python3 scripts/fetch_demo.py --edition all`. The local catalog does not alter
`build_pages.py`: only the existing pinned whiteboard showcase is published by
the Pages workflow. Publishing another film remains a separate requested action.
