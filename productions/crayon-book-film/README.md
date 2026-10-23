# Leo the Farmer — crayon-book study

An independent animated retelling of **Leo the Farmer**, the Play with Gyuri farm story explicitly confirmed by the user. English narration and dialogue, 15 scenes, 1920×1080, 24 fps, 3,991 frames, 2:46.292. See `content/source-resolution.md` for the source decision.

Open `index.html` through a local HTTP server, or play `media/leo-the-farmer-crayon-book.mp4` directly. Generated media and reference files remain local and are ignored by Git.

The delivered file's SHA256 is `d1bfb97b968c3f145baf2f1e6b21dbccbb70d348c7ba24c172401f83d6596349`. Read [the review record](content/quality-review.md) and [verification manifest](content/verification.json) for actual coverage and limitations. Open `review/compare.html` for independently controlled reference/output playback and all indexed frame atlases. A literal 100% perceptual style match is not certified.

## Contents

- `src/`: independent Canvas geometry, wax deposition, paper relief, poses, camera, captions, water wash, and page turn. No lemo-opuscar engine code copied.
- `content/story.json`: new narration and dialogue, preserving the linked story's sequence.
- `content/timeline.json`: authoritative 24 fps timeline, derived from cached voice WAV lengths.
- `scripts/`: local speech generation, original instrumental score and foley, rendering, sequential frame audit, exhaustive numerical comparison.
- `reference/`: local reference videos, metadata and automatic captions; never committed.
- `review/`: frame-by-frame atlases, metrics, full-resolution stills, transcription and verification evidence; never committed.
- `media/`: models, voice stems, audio stems, proof films and final MP4; never committed.

## Reproduce

Use Node 24, Python 3.11, and FFmpeg/ffprobe. Install `npm ci` and the pinned `requirements.txt` in a local virtual environment. Kokoro models come from the official kokoro-onnx `model-files-v1.1` release: `kokoro-v1.0.onnx` and `voices-v1.0.bin`, stored under `media/models/`.

```sh
.venv/bin/python scripts/make_voice.py
.venv/bin/python scripts/mix_audio.py
node scripts/render.mjs --stills
.venv/bin/python scripts/encode.py
.venv/bin/python scripts/finalize.py
.venv/bin/python scripts/audit_frames.py media/leo-the-farmer-crayon-book.mp4 review/final
.venv/bin/python scripts/compare_frames.py
.venv/bin/python scripts/verify_delivery.py
.venv/bin/python scripts/build_review.py
.venv/bin/python -m http.server 8789 --bind 127.0.0.1
```

Every encoder/decoder launched by these scripts takes the shared advisory lock and waits for any existing FFmpeg process. Do not bypass `scripts/ffmpeg_gate.py` while other video work is active.

The frame comparison needs the reference film at `reference/crayon-book.mp4` and its audit under `review/reference/`. Obtain the official [crayon-book film](https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/crayon-book.mp4), then run `scripts/audit_frames.py reference/crayon-book.mp4 review/reference` with the local Python environment. `scripts/repair_range.py clothes vegetables orchard` demonstrates replacing selected scenes in one join while preserving the prior silent film. Preserve a finished MP4 before rerunning `finalize.py`. Rebuilding can change encoded bytes and requires a new verification manifest.

Optional independent speech checking uses `scripts/transcribe_check.py` in an Apple Silicon Python environment with `mlx-whisper` installed. That optional dependency is separate from the film-rendering requirements. It downloads the `mlx-community/whisper-small-mlx` model on first use.

## Attribution

Story and recognizable character reference: [Play with Gyuri — Leo the Farmer](https://www.youtube.com/watch?v=AeKJ9v0yFgY), Tuntun English. This is an unofficial retelling; the original footage, voice recording and music are not part of the delivered film. New drawings do not transfer ownership of the underlying characters.

Visual study: [LemoLab crayon-book / The Moon Can't Sleep](https://github.com/lemomo-ai/lemo-opuscar), reference film under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Material and animation ideas are independently implemented for a different story.

Narration: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0), via [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) (MIT); af_heart, am_michael and af_bella stock voices. No voice cloning. Original procedural music and sound effects in `scripts/mix_audio.py`.

Fonts: Gaegu and Patrick Hand, Google Fonts; bundled OFL notices in `assets/fonts/`.

## Review boundaries

Every frame is decoded and indexed. Every completed atlas inspection must be logged in `content/quality-review.md`. Full-resolution inspection, frame metrics, ASR, playback and listening are separate evidence. The numerical comparison measures image characteristics; it does **not** prove identical perceived style or a 100% match.
