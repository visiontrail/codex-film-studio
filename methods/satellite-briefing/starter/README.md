# Author a new geographic film

This folder starts empty. No film has been generated or accepted.

1. Fill `content/brief.json`: subject, viewer, question, language and delivery.
2. Read [STYLE.md](STYLE.md), [WORKFLOW.md](WORKFLOW.md) and [INPUTS.md](INPUTS.md).
3. Source the actual location and dates; use [FOOTAGE.md](FOOTAGE.md) for real clips.
4. Author the renderer and edit. `lib/geo.mjs` is geographic math, not a renderer.
5. Review and deliver the encoded file using [REVIEW.md](REVIEW.md).

The project creator also supplies `prompt.txt`, `PROVENANCE.md`, `LICENSE`,
`METHOD.md` and `tools/frame_review/`. Read the tools' README before installing
optional media dependencies. `node --test tests/geo.test.mjs` runs the math checks
without a package install. The docs' production commands are steps to implement
or use with real inputs; this starter does not promise a one-command film build.

Keep source media, provider responses and exports here, outside the method
library. Keep credentials in environment variables or an approved private
configuration, never in narration, source ledgers or Git. Return only generic
improvements to the library.
