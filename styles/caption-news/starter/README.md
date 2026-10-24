# Independent caption-led production

Fill `content/brief.json`, then author the inputs described in [INPUTS.md](INPUTS.md).
Read [STYLE.md](STYLE.md), [WORKFLOW.md](WORKFLOW.md), [REVIEW.md](REVIEW.md)
and [the shared methods](methods/README.md) in the generated working copy.

`lib/caption.mjs` provides deterministic entrance and highlight progress. It does
not render a film. Choose a Canvas, SVG, HTML or other renderer, licensed fonts
and media for this subject, then lock dependencies in this production. The helper
has no package dependencies; verify it with `node --test tests/*.mjs`.

Import recordings or configure a voice provider in the external environment.
Preserve accepted takes and measure timing before finalizing the edit. Source
media, extracted frames, captions, audio, delivery files and review evidence all
stay here. No previous film's narration, people, brands or facts are supplied.
