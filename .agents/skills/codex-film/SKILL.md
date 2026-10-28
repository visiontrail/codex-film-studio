---
name: codex-film
description: Make or adapt a video using a registered style, starter or editable sample from Codex Film Studio. Use when the user requests a film from this repository or one of its listed styles.
---

Locate the repository root containing `styles.json`. Read the requested
style's entry, `DIRECTOR.md`, `TECHNIQUE.md` and its `STYLE.md`. Only choose
styles actually listed. All visual styles live in `styles/<id>/`; check the
entry's completion status, capabilities and template kind. Executable production
kits include material renderers and a shared runtime; new subjects still need
authored scenes and assets. `methods/` holds cross-style workflows only.

## Start from the user's brief

A natural-language request in this checkout is sufficient to start. The Agent
owns setup and execution: resolve a registered style from the user's name, link
or reference, choose a safe project name, create the external working copy,
install documented dependencies and continue there in the same conversation.
When the style is unspecified, choose a suitable one and explain the choice.
Use reasonable defaults for optional creative details. Do not hand terminal
commands back to the user, ask them to create the project, or require another
chat. Ask only when a missing input, asset, service access or permission blocks
the next necessary step. Report the concrete gap; never invent credentials or
silently substitute a different reproduction. Carry the request through
production, review and delivery of the actual MP4 and editable project.
A starter, plan or material proof is not the finished film.

## Agent execution

For a new topic, create a working copy with
`python3 scripts/new_film.py <name> --style <id>` for every style.
Use `--list` to see the complete catalog. The destination
must be external; `--output` selects it. Adapt the narration,
sources, drawings and camera together. Keep people and objects meaningful to
the story. Use the user's requested language and duration. For whiteboard,
account for its English lettering limitation before using a different script;
other styles follow their own typography rules.

Each fresh project includes `methods/README.md` and the common review tools.
Renderer-ready blank projects also include `PRODUCTION.md`, pinned npm dependencies, licensed
fonts, `scripts/render.mjs`, `src/scene.mjs`, and the empty executable timeline
`content/production.json`. Run `npm ci` and `npm run proof` to check the material
pipeline, then author scenes and run `npm run build`. A proof is diagnostic only.
Microgame carries its engine; no project may depend on a separate library checkout.
Use `npm run doctor` to check the environment. After authoring the timeline,
`npm run preview -- --start FRAME --end FRAME` cuts picture, captions and sound
to the same source interval; `npm run verify -- media/preview.mp4` rechecks the
encoded delivery. `npm run serve` opens the project's loopback preview server.
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
For any other exact sample, use `new_film.py NAME --style ID --replay-bundle PATH`
with a sealed external source bundle. Read `methods/reproduction.md`.
Acquire an available source archive with `scripts/fetch_source.py --index INDEX
--style ID --output EXTERNAL_DIRECTORY` before restoring it. Use a real supplier
index; `local-source-bundle` does not mean publicly downloadable. Read
`sample_rebuild` independently: a verified excerpt is not a full rebuild.
Showcase MP4 archives are not editable source bundles. Verify hashes before restoration;
follow the bundle's recorded dependency and render commands. Never replace a
missing original composition with a generic material proof and claim equivalence.
For new narration use the documented Chatterbox service or import WAVs, then
produce independent word timing. Never invent a voice endpoint or credential.

Check representative stills and a motion preview before the complete build.
Inspect the final MP4, repair observed failures and deliver the file with its
editable source. Report actual verification scope. A local film request does
not authorize publishing it or creating an external account.
