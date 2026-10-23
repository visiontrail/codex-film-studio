# New Art Deco production

Read `STYLE.md`, `DIRECTOR.md`, `TECHNIQUE.md`, `WORKFLOW.md` and `REVIEW.md` before authoring.

`content/film.json` is an empty input contract. Use integer frame intervals `[start, end)` and keep narration, camera, captions, animation and sound on this timeline.

`lib/material.mjs` exports Canvas 2D primitives: metallic `gold`, `line`, `poly`, `arch`, `fan`, `rays`, `bulb`, `plaque`, `brassTube`; `camera` and `ppoly` for projection; and `person` for articulated figures. Its internal coordinate system is 1080×1920. Scale the context uniformly to the output size. Functions are deterministic in their explicit time argument. `person` supports `greenUniform`, pose, emotion, gaze, head tilt and local hand targets; the production must author valid reachable targets and stage body placement.

No dependency installation or rendering happens automatically. Use a browser Canvas 2D context or a compatible raster implementation, load Limelight/Poiret One/Josefin Sans before drawing, and add a new scene interpreter for the new story. A successful primitive render is not a complete film.

Store generated media, source reference files, audio and reviews locally under ignored directories. Use `tools/frame_review/ffmpeg_gate.py` before launching FFmpeg when other productions share the host. Use `tools/frame_review/audit_frames.py` for complete frame coverage, then perform and record actual visual/audio review.
