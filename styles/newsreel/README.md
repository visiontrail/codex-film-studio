# Newsreel

[Watch the double feature and explore the style](https://visiontrail.github.io/codex-film-studio/styles/newsreel/showcase/).

Warm monochrome, spinning headlines, nine-card paper montages, left-spine page turns and period transitions. See [STYLE.md](STYLE.md) for the visual rules and [PROVENANCE.md](PROVENANCE.md) for the reference.

Status: **starter-ready**. The reusable package contains blank inputs and shared production/review guidance. New scenes, rendering and audio must be authored for each production. Published previews are demonstrations, separate from this blank starter.

```sh
python3 scripts/new_film.py my-film --style newsreel
```

The independent page contains two complete English-language 720p web films, chapters, bilingual transcripts, a silent interactive effect study and a reusable creative prompt. Production-specific media, titles and narration live in a checksum-pinned Release bundle, not in the starter. The 1080p masters and detailed production reviews remain local.

The complete Newsreel MP4s stream directly from the pinned GitHub Release;
posters, captions, chapters and credits are installed from its verified small
archive. This keeps the existing Pages site under its 1 GB build budget without
recompressing or removing other styles. Video byte counts and SHA-256 hashes
are recorded in `styles/newsreel/demo-assets.json` (`external_media`).
