# The House Gets Coffee

An independently drawn English sci-fi sitcom about sports betting, developed from the supplied Chinese topic transcript and the visual reference **Coffee Run — Sci-Fi Sitcom Toon** by LemoLab.

This production is self-contained in this folder. No FrontierTechSN application Task was created. Existing Pocket TTS and Chatterbox services are accessed only through their TTS APIs. Local Chatterbox generation is also preserved as an alternate voice version. Its credentials remain in the existing local configuration, never in this production or Git.

## Current state

The completed Pocket TTS v9 edition is available at `media/the-house-gets-coffee.mp4`, byte-identical to `media/the-house-gets-coffee-pocket-v9.mp4`. It runs 5:28.708 at 1920×1080 / 24 fps: 7,889 frames, 95 shots and 51 English dialogue lines. Marius voices Bo; Javert voices Qin. Revision 19 fixes dense outlines on shrinking actors, cash-label legibility and pool framing. The qualitative style review passes under the user's clarification that the new subject is compared for drawing and animation language, not identical story content.

All-frame thumbnail coverage consists of 35 changed pages newly viewed plus 212 pages byte-identical to the already viewed v8 pages, covering all 7,889 frames. Native coverage comprises 36 decoded images: 11 new/changed samples inspected plus 25 byte-identical prior samples; the Turkey sample was additionally reopened. Full decode, audio signal checks and natural-end browser playback passed. Audio listening is not established by these checks. Exact hashes and coverage are recorded in `content/review-report.md`.

The current file SHA-256 is `c19a012b992322aa691962fad0055a36327a8413ae41010fb61c156c99eed45c`. Earlier exports and their actual inspection coverage are retained. No numerical “100% identical” claim is made.

Country, person, brand and statistic choices belong to this story. The Turkey example comes from the supplied transcript and its TFF source; it is not a reusable default or a style requirement. Future films must choose cases from their own subject and evidence.

The earlier 5:16.5 Chatterbox edition remains at `media/the-house-gets-coffee-chatterbox.mp4`.

## Files

- `content/english-script.txt`, `script.json`: exact English dialogue.
- `content/brief.md`, `shot-plan.md`: treatment, visual and sonic intent.
- `content/sources.md`: source ledger and corrections to the supplied input.
- `content/reference-analysis.md`: reference inspection coverage and revision ledger.
- `content/accepted-takes.json`: source and ASR hashes for all 51 selected Pocket takes.
- `content/review-report.md`: export identity, review coverage, findings and delivery decision.
- `content/timeline.json`: integer-frame edit, speech envelopes and captions. Its `draft` field is authoritative.
- `src/`: original vector geometry, cast, worlds, camera and caption drawing.
- `scripts/`: independent TTS, alignment, sound synthesis, rendering, frame comparison and delivery checks.
- `assets/fonts/`: font files and their OFL licenses.
- `review.html`: local paired-reference viewer with seek, frame step and corresponding shot-role controls.
- `media/`, `review/`, `reference/`: ignored generated media, private provider evidence and reference research. These are retained locally but are not committed.

## Reproduce

Node 22+ with `npm ci`; Python 3.11+ with NumPy, SciPy, Pillow and an available MLX Whisper environment on Apple Silicon. The optional local TTS environment uses `mlx-audio==0.6.1`, `mlx==0.32.4`, `soundfile==0.14.0`. Exact model revisions and hashes are recorded by the model download scripts. Existing remote WAVs and job IDs are resumable and must not be silently replaced.

```sh
npm ci
.venv/bin/python scripts/select_takes.py
.venv/bin/python scripts/timeline.py
.venv/bin/python scripts/sound.py
node scripts/render.mjs
.venv/bin/python scripts/mux.py
.venv/bin/python scripts/verify.py media/the-house-gets-coffee.mp4
.venv/bin/python scripts/scan_frames.py media/the-house-gets-coffee.mp4 review/final
.venv/bin/python scripts/compare_frames.py media/the-house-gets-coffee.mp4 --out review/comparison
python scripts/serve.py
```

These rebuild commands use the retained local WAVs and ASR files named by the selection manifest. Media, provider records, ASR evidence and model weights are intentionally excluded from Git, so a source-only checkout cannot reproduce the accepted voices without those local inputs. `requirements.lock` records this Apple Silicon environment; it is not a cross-platform lockfile.

For new Pocket requests, use `scripts/speech_pocket.py --builtin-bo marius --builtin-qin javert --output-dir media/speech-pocket-new` with the existing service repository's Python environment. `POCKET_CONFIG_REPO` selects the configuration repository. The script reads its endpoint and authentication in memory and does not create application Tasks or change service defaults. Use a fresh output directory when changing text, voice or synthesis punctuation. Follow with `prepare_pocket.py` and independent `transcribe.py` review, then explicitly update the selection manifest; do not automatically replace accepted takes.

`timeline.py` in final mode refuses missing speech, missing independent ASR or stale audio hashes. `render.mjs` refuses a draft timeline unless explicitly given `--draft`. The final SRT is emitted only from a non-draft edit.

`ffmpeg_gate.py` acquires a shared `/tmp/codex-film-studio-ffmpeg.lock`, then waits while any other FFmpeg process is running. All rendering, decoding, mixing, mastering and verification commands in this production use that gate. `ffprobe` reads metadata directly. Do not bypass the gate while the user's other video task is active.

Open `http://127.0.0.1:8736/review.html` after starting the server. It binds only to localhost and supports byte-range media seeking. The reference link is a local ignored symlink to the user-supplied MP4.

## Review boundaries

All 1,380 reference frames were decoded and visually reviewed as consecutive labeled thumbnails. Eight native-size reference frames were also inspected. Every-frame thumbnail review, sampled native-size inspection, automated measurements, independent speech transcription, signal measurements and browser playback are separate categories of evidence. The review report states the coverage actually completed. No numerical “100% identical” claim follows from an encode or a pixel statistic.

The new film draws different story content, so comparison pairs match shot roles rather than expecting equal pixels. Public figures and brands are independently redrawn, with identifying features and labels. Photographic research is not composited into the video. Source and font credits are included with the editable project; the visual reference also receives an end-card credit.
