# Your crayon picture-book project

This project contains material tools and an empty `input-contract.json`.
Read `STYLE.md`, `WORKFLOW.md` and `REVIEW.md`, then supply your own subject,
characters, shots, narration, music and renderer. No film has been generated.

Run `npm install` to install the Canvas and OpenType dependencies and create a local lockfile.
The optional `scripts/synthesize_paper.py` needs Python, NumPy, SciPy and Pillow.
Use the copied `tools/frame_review/` for encoded-file inspection. Keep source
assets, provider records and outputs in this external project.

Use `Wax.reveal(key, progress, draw)` for each independent contour/colour group.
Register a licensed font with `registerWaxFont(name, bytes)` as well as the
Canvas font registry when letters need continuous path drawing. Configure
material options using `STYLE.md`; choose values from native-resolution proofs.

For a physical book reveal, keep the drawing attached to its page and use
`lib/book-camera.mjs` to move the whole desk/book scene. Run
`node scripts/check_book_camera.mjs` for the geometry checks; inspect encoded
motion and surface lighting separately.
