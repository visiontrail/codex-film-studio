# Codex Film Studio

A library of reusable film styles and shared production methods. All visual
styles live in `styles/<id>/` and are registered in `styles.json`, including
toolkits and starters without published demos. Read each entry's completion
status and capabilities. `methods/` contains only cross-style workflows.

New contributions must be methodology, generic tools or empty input contracts.
Do not add a requested example's narration, claims, portraits, brand assets,
story-specific scene code, films or review records to this library. Keep each
production in an external project directory. Existing published demo assets are
legacy content; do not silently rewrite or remove unrelated work.

Reference-person likeness is not a required style property. A specific real
person requires a portrait supplied by the user of the new production. Preserve
that portrait's identity while adapting its paper/print treatment; do not carry
a previous production's cast into a reusable method.

For a film request, read `DIRECTOR.md`, `TECHNIQUE.md` and the selected
`styles/<id>/STYLE.md`. Use `scripts/new_film.py <name> --style <id>` to make
an independent working copy outside the repository. Its default location is
`../codex-film-studio-projects/<name>`; `--output` selects another external path.
Use the same `--style <id>` command for every style; `--list` shows completion
status. Keep published examples intact. Existing showcase entrypoints belong in
`styles/<id>/showcase/` (whiteboard retains its legacy `studio/` page). Their
local media dependencies remain in the retained production projects; use
`scripts/serve_styles.py` to preview them. Do not copy showcase content into
new-film starters or treat a local page as a published demo.
The repo-local `codex-film` skill describes this workflow.

The human entry point is a natural-language brief in this checkout. Treat a
request to make or recreate a film as an instruction to execute the workflow,
not to return setup commands. Resolve the style from its name, ID, linked page
or reference; if none is specified, choose a suitable registered style and state
the choice. Infer a safe project name, create the external working copy yourself,
prepare dependencies, and continue production there in the same conversation.
Do not make the user run `new_film.py`, install packages manually, or open a
second chat. Ask only for genuinely missing creative inputs, source assets,
service access or required permissions. Never invent a voice service or its
credentials. For exact replay, check source and asset availability first and
report concrete missing inputs; a showcase MP4 is not an editable source bundle.
Deliver the MP4 and editable project with the actual review scope, not just a
plan or material proof.

For an exact sample rebuild, use the released demo inputs and existing
composition. For a new subject, rewrite both narration and drawings; replacing
captions alone does not adapt the film. Keep narration, camera, captions and
sound on the same timeline. Draw people and objects when they explain the story.

Inspect rendered stills and motion, repair observed problems, then verify the
final MP4. Describe what was actually checked. Do not call a successful render,
ASR match or generated contact sheet a visual or listening review.

Never commit credentials, provider jobs, generated films or dependency folders.
Use scoped commits and preserve unrelated work. Publishing a repository,
release or film requires the user's request; a film request alone does not
authorize publication.
