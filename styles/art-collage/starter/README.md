# Independent art-collage production

This is an empty production starter. Fill `content/brief.json`, write a new
story and shot plan, then supply required portraits in `content/characters.json`.
No scene, narration or identity from a previous production is included.

For each specific real person, record an `id`, `kind: "real"`, `name`, `portrait` local path,
`source: "user-supplied"`, and optional `crop: [x, y, width, height]` in pixels.
Ask the user for a missing portrait. Use `kind: "anonymous"` for an intentionally
fictional character; design that character for this production.

Run `npm install` to create this project's lockfile. `lib/paper.mjs` provides
surface and cutout primitives; author a renderer around the new shot plan.
Read `METHOD.md` for production and verification steps. Keep inputs, finished
media and review records here, outside the method library.
