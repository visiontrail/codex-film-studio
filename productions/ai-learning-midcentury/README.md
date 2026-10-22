# Does AI Help You Learn—or Just Finish?

An independently illustrated Mid-century Cartoon short: **3:18 · 1920×1080 ·
24 fps · 23 shots · English Chatterbox narration**. Ada finishes an assignment,
closes the computer, and discovers which parts of the work she can explain
herself. The film moves from research evidence to a worked learning example.

## Watch and inspect

- [Final MP4](media/Does-AI-Help-You-Learn-Midcentury.mp4)
- [English SRT](media/narration.en.srt) and [WebVTT](media/narration.en.vtt)
- [Verification and limits](QA.md), [release hashes](release.json), [credits](CREDITS.md)
- [Reference study](content/reference-analysis.md), [scientific claims](content/sources.json)
- [Narration](content/narration.json) and [integer-frame edit](content/timeline.json)

Run `python3 scripts/serve.py --port 8776` here, then open
<http://127.0.0.1:8776/>. The player supports seeking and a left/right comparison
for every final frame. Each pair matches a shot's function and normalized phase;
the two films have different stories and lengths. The generated media and
review evidence are retained locally, outside Git.

## What was built

`src/print.mjs` draws paper grain, broken pressure-varying outlines and
misregistered flat colors. `src/objects.mjs` draws Ada and the physical props.
`src/film.mjs` stages the story, camera, circular irises and reading holds.
Character poses update on pairs of frames while the camera and transitions
run at 24 fps. Oleo Script, Alfa Slab One and Jost preserve the reference's
typographic language. The Turkish flag and OpenAI mark are drawn in the
film's palette; Ada is fictional.

The score is an original 132 BPM arrangement synthesized from vibraphone,
flute, bass and brush-like voices, with timed paper, click and stamp effects.
Speech remains at natural speed. No music or narration from Meet Pip is used.

This production does not invoke either project's film engine or create a
FrontierTechSN Task. The only optional FrontierTechSN integration is reading
its configured Chatterbox credentials and verifying exact-source cached WAVs
against the deployed provider. The renderer, edit, illustrations and sound
composition were written for this folder.

## Rebuild

Use Node 24 and Python 3.11+; transcription requires Apple Silicon and the
listed MLX package. FFmpeg and FFprobe must be installed. The local guard in
`scripts/bin/ffmpeg` currently points to `/opt/homebrew/bin/ffmpeg`; adjust that
one path when moving to another host. It waits for existing FFmpeg processes
before each invocation and serializes this production's calls with an advisory
lock. It never stops other jobs. A non-cooperating external process can still
start after the process-table check.

```sh
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

For existing accepted recordings, begin with timeline generation. To generate
new speech, provide `CHATTERBOX_TTS_URL` and `CHATTERBOX_TTS_API_KEY` in the
environment, then run `.venv/bin/python scripts/speech.py`. Alternatively use
`--frontier-root /path/to/FrontierTechSN` to read its configuration without
starting its task system. Do not put credentials in commands or tracked files.
`--only 13 --seed-offset 1000` creates a new, retained repair request; old
provider jobs and WAVs stay intact.

```sh
.venv/bin/python scripts/transcribe.py
.venv/bin/python scripts/timeline.py
.venv/bin/python scripts/captions.py
.venv/bin/python scripts/soundtrack.py
node scripts/render.mjs --stills
node scripts/render.mjs
.venv/bin/python scripts/finalize.py
.venv/bin/python scripts/analyze_frames.py media/Does-AI-Help-You-Learn-Midcentury.mp4 review/final
.venv/bin/python scripts/compare_frames.py
python3 scripts/audit_release.py
```

The first transcription run downloads a Whisper model. Unresolved ASR
differences stop final timing; the retained line 08 recording has an independent,
unprompted Whisper Medium check on the same WAV hash. ASR is not a listening
certificate. After changing any picture or sound, repeat visual and playback
review and update its record before treating the new output as reviewed.

The comparison additionally needs the supplied reference decoded with
`scripts/analyze_frames.py /path/to/Meet-Pip.mp4 review/reference`.
The release audit checks existing evidence and content bindings; it does not
replace a fresh FFmpeg full-decode check or an actual visual review.

For an individual full-size drawing:

```sh
node scripts/render.mjs --frame 2660 --out review/algebra-fixed.png
```
