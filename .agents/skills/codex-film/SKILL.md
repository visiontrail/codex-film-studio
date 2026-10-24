---
name: codex-film
description: Make or adapt a video using a registered style, starter or editable sample from Codex Film Studio. Use when the user requests a film from this repository or one of its listed styles.
---

Locate the repository root containing `styles.json`. Read the requested
style's entry, `DIRECTOR.md`, `TECHNIQUE.md` and its `STYLE.md`. Only choose
styles actually listed. All visual styles live in `styles/<id>/`; check the
entry's completion status, capabilities and template kind. A toolkit or starter
requires new scenes and a renderer. `methods/` holds cross-style workflows only.

For a new topic, create a working copy with
`python3 scripts/new_film.py <name> --style <id>` for every style.
Use `--list` to see the complete catalog. The destination
must be external; `--output` selects it. Adapt the narration,
sources, drawings and camera together. Keep people and objects meaningful to
the story. Use the user's requested language and duration. For whiteboard,
account for its English lettering limitation before using a different script;
other styles follow their own typography rules.

Each fresh project includes `methods/README.md` and the common review tools.
Apply reference adaptation, media selection and revision guidance when relevant,
including in other visual styles. Keep the new brief authoritative; no fixed
story count, cast, runtime or previous production's acceptance is inherited.

Return only generic methods, tools and empty input contracts to this library.
Keep all story-specific material and per-production review in the external
project. For a specific real person, request a user-supplied portrait; matching
the reference person's face is not required for matching the visual style.

Existing local showcase pages are indexed separately from published demos.
Use `scripts/serve_styles.py` to open their retained project resources; never
copy a showcase story into a blank starter.

For a whiteboard sample reproduction, use `scripts/fetch_demo.py` and the existing
composition. Released narration and timing avoid a TTS dependency for replay.
For new narration use the documented Chatterbox service or import WAVs, then
produce independent word timing. Never invent a voice endpoint or credential.

Check representative stills and a motion preview before the complete build.
Inspect the final MP4, repair observed failures and deliver the file with its
editable source. Report actual verification scope. A local film request does
not authorize publishing it or creating an external account.
