---
name: codex-film
description: Make or adapt a video using a style and editable sample from Codex Film Studio. Use when the user requests a film from this repository or one of its listed styles.
---

Locate the repository root containing `styles.json`. Read the requested
style's entry, `DIRECTOR.md`, `TECHNIQUE.md` and its `STYLE.md`. Only choose
styles actually listed. Reusable methods live separately in `methods/`; read
the selected method instead of requiring an example film or its cast.

For a new topic, create a working copy with
`python3 scripts/new_film.py <name> --style <id>` or create a blank method project
with `python3 scripts/new_film.py <name> --method art-collage`. The destination
must be external; `--output` selects it. Adapt the narration,
sources, drawings and camera together. Keep people and objects meaningful to
the story. Use the user's requested language and duration; note the English
lettering limitation before attempting a different script.

Return only generic methods, tools and empty input contracts to this library.
Keep all story-specific material and per-production review in the external
project. For a specific real person, request a user-supplied portrait; matching
the reference person's face is not required for matching the visual style.

For a sample reproduction, use `scripts/fetch_demo.py` and the existing
composition. Released narration and timing avoid a TTS dependency for replay.
For new narration use the documented Chatterbox service or import WAVs, then
produce independent word timing. Never invent a voice endpoint or credential.

Check representative stills and a motion preview before the complete build.
Inspect the final MP4, repair observed failures and deliver the file with its
editable source. Report actual verification scope. A local film request does
not authorize publishing it or creating an external account.
