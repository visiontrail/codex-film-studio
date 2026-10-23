# Does AI Help You Learn—or Just Finish? — long edition

A seven-chapter English film that follows Ada from a finished assignment to
independent practice. The extended story covers the research evidence,
retrieval and spacing, a performed algebra lesson, transfer to a purchasing
problem, writing, programming and a practical record of later attempts.

## Watch

**10:25.5 · 1920 × 1080 · 24 fps · 7 chapters · 64 Chatterbox segments**

The MP4 includes English captions and chapter markers. External SRT/WebVTT
subtitles and an interactive reference comparison are included.

- [Final MP4](media/Does-AI-Help-You-Learn-Midcentury-Long.mp4)
- [English SRT](media/narration.en.srt) and [WebVTT](media/narration.en.vtt)
- [QA and limits](QA.md), [release manifest](release.json), [credits](CREDITS.md)
- [Narration](content/narration.json), [sources](content/sources.json), [edit](content/timeline.json)

Run `python3 scripts/serve.py --port 8777` in this directory and open
<http://127.0.0.1:8777/>. The player includes chapter navigation and a frame
comparison with Meet Pip. The original [short edition](../../README.md)
remains available.

## Production

The edition uses this production's own Canvas illustrations, Ada character,
printed-paper palette, imperfect ink contours, flat color registration,
limited character motion and circular transitions. `src/lesson.mjs` holds
the algebra model; a common state drives the equation and both scale pans.
The new writing and code scenes perform specific decisions on screen.

The 64 natural-speed Chatterbox segments use exact-source, hash-bound
recordings. Unprompted Whisper transcription checks each recording. A second
model examines mismatches; confirmed errors receive retained new provider
requests. The original 132 BPM score varies across seven chapters and leaves
an explanation pause quiet. It uses synthesized vibes, flute, bass and brushes.

No Lemo film engine or FrontierTechSN Task is invoked. The optional
FrontierTechSN path only supplies configured Chatterbox access. Media, provider
checkpoints and review evidence stay in ignored local directories.

## Rebuild

Install Node dependencies using `npm ci` in the short edition directory.
Install `requirements.txt` in a Python environment; MLX transcription requires
Apple Silicon. FFmpeg and FFprobe must be installed. Every FFmpeg call goes
through `scripts/bin/ffmpeg`, which waits for existing FFmpeg processes and
uses the studio's shared lock. It never stops unrelated jobs.

```sh
python scripts/transcribe.py
python scripts/render_chapters.py --assemble
python scripts/captions.py
python scripts/soundtrack.py
python scripts/finalize.py
python scripts/analyze_frames.py media/Does-AI-Help-You-Learn-Midcentury-Long.mp4 review/final
python scripts/compare_frames.py
```

To create speech, provide the Chatterbox endpoint and API key as environment
variables, or pass `--frontier-root /path/to/FrontierTechSN` to
`scripts/speech.py`. Existing provider requests are resumed. Repairs use
`--only ID --output-folder media/audio-repairs --seed-offset N`; verify a
repair's source and WAV hashes before adopting its manifest row.

Chapters are cached against drawing source bytes and exact shot timing.
`prepare_chapter_review.py` builds every-frame inventories and paired atlases.
Actual visual inspection is recorded separately. After final assembly,
`seal_review.py` requires all chapter review records and exact decoded pixel
identity between every reviewed chapter frame and the final video.
`audit_release.py` binds the delivered media to retained evidence. Neither
script performs subjective visual inspection or listening.
