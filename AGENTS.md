# Codex Film Studio

A library of reusable film methods and styles. Start with `styles.json` for
registered styles, or `methods/` for subject-independent production methods.

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
Use `--method art-collage` for an empty collage starter. Keep published examples intact.
The repo-local `codex-film` skill describes this workflow.

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
