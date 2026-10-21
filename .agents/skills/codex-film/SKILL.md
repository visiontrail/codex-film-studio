---
name: codex-film
description: Make or adapt a video using a style and editable sample from Codex Film Studio. Use when the user requests a film from this repository or one of its listed styles.
---

Locate the repository root containing `styles.json`. Read the requested
style's entry, `DIRECTOR.md`, `TECHNIQUE.md` and its `STYLE.md`. Only choose
styles actually listed.

For a new topic, create a working copy with
`python3 scripts/new_film.py <name> --style <id>`. Adapt the narration,
sources, drawings and camera together. Keep people and objects meaningful to
the story. Use the user's requested language and duration; note the English
lettering limitation before attempting a different script.

For a sample reproduction, use `scripts/fetch_demo.py` and the existing
composition. Released narration and timing avoid a TTS dependency for replay.
For new narration use the documented Chatterbox service or import WAVs, then
produce independent word timing. Never invent a voice endpoint or credential.

Check representative stills and a motion preview before the complete build.
Inspect the final MP4, repair observed failures and deliver the file with its
editable source. Report actual verification scope. A local film request does
not authorize publishing it or creating an external account.
