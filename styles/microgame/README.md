# Microgame toolkit

Independent Canvas 2D material, character, action and UI helpers. No example
story, narration, provider jobs or films are packaged in this library.

- `engine/primitives.mjs`: outlined toon shapes, command typography and fuse.
- `engine/materials.mjs`: separate palettes, material response and generic props.
- `engine/characters.mjs`: performer and stage-host drawing helpers.
- `engine/brush.mjs`: pressure-shaped bristles, dry gaps, wet edges and ink figures.
- `engine/games.mjs`: deterministic action construction; requires authored inputs.
- `engine/frame_audit.py`: complete encoded-frame ledger and sequential atlases.
- `engine/ffmpeg_gate.py`: shared FFmpeg serialization without killing other work.

The pixel material exports `indexPixelBuffer(context)` for palette quantization
before enlargement. The action renderer adds Swiss headline and rule typography.
Run `node --test engine/characters.test.mjs engine/materials.test.mjs` to check
contact transforms and palette closure; inspect rendered motion separately.

Author your composition, camera, story-specific transformations, audio and final
export in the production project. The toolkit has no accepted published demo.
See `STYLE.md` for review criteria. Python audit requires OpenCV, NumPy and
Pillow; drawing needs a compatible Canvas 2D implementation and licensed fonts.

The frame audit decodes every frame, hashes its RGB pixels, and writes consecutive
atlases without sampling. Use `--expect-frames` to catch truncated exports. Keep
a separate inspection log bound to the source hash; generating an atlas does not
mean anyone has looked at it. The FFmpeg gate accepts an executable and arguments,
for example `python engine/ffmpeg_gate.py ffmpeg ...`.
