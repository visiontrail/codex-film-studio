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
