# Frame evidence and review method

Run from this production directory with its PyAV, Pillow and NumPy environment:

```sh
.venv/bin/python scripts/audit_frames.py reference/art-collage-1080p.mp4 review/reference-audit-new
.venv/bin/python scripts/audit_frames.py delivery/Does-AI-Help-You-Learn-or-Just-Finish.mp4 review/output-audit-new
```

The second argument must be a new or empty directory, so a previous review cannot
be silently overwritten. The script invokes no `ffmpeg` executable: PyAV decodes
through its linked libav libraries. It does consume CPU while decoding.

Every decoded frame produces one row in `frames.csv` and `frames.jsonl`: zero-based
index, original PTS and time base, timestamp, dimensions, palette ratios, luminance,
edge density/strength, adjacent-frame RGB/histogram differences and cut candidacy.
Colour and edge metrics use a 320-pixel-wide image; `--metric-width` changes this.
Palette buckets are mutually exclusive HSV heuristics, including dark ink and warm
light paper. They describe colour proportions, not material identity or style quality.

Every frame appears exactly once in consecutive `contact-sheets/` images, in reading
order, 100 frames per sheet (10 × 10 cells, each 160 × 90). The final sheet may have
unused dark cells. Each occupied cell has its exact frame index and timestamp in
a separate label strip below the image, leaving the complete picture unobscured.
`audit.json` records each sheet's inclusive frame range and coverage count.

Candidate hard cuts require RGB difference ≥ 0.16 and histogram distance ≥ 0.08,
or RGB difference ≥ 0.32. The defaults can be changed with `--cut-diff`, `--cut-hist`
and `--cut-diff-strong`. Nonmaximum suppression keeps the strongest candidate within
`--min-shot-seconds` (default 0.35). These are candidate boundaries: flashes and rapid
motion can create false positives, while subtle cuts and dissolves can be missed.

Each candidate shot receives a native-resolution middle frame in `shots/`. Each
selected boundary gets native-resolution frames from two frames before to two frames
after in `cuts/`; use `--cut-context` to expand this. Those images are extracted in a
second decode pass and checked against their expected frame indices. Shot intervals
are half-open `[start_frame, end_frame_exclusive)`.

Automated decoding, metric calculation and sheet generation are **not** visual review.
The script always records visual review, audio listening and style equivalence as
unreviewed/unassessed. It writes a separate `visual-review-template.json`, which a
reviewer fills only after actual inspection, with exact intervals, viewing method,
reference mapping, observations, defects, decisions and reviewer identity. Reviewing
160 × 90 thumbnails cannot establish native-resolution texture or text quality.

For reference-to-output comparison, establish a separate mapping by shot purpose and
position within the shot; global timestamps need not match for different subjects.
Inspect corresponding frames at native resolution, transitions as consecutive frames,
and actual motion with sound. Record material, composition, scale, colour, typography,
motion and timing defects individually. These descriptors cannot establish a numerical
“100% style match”; only the actual review observations support a quality conclusion.

`scripts/compare_frames.py` creates the paired comparison: every delivery frame is
matched to the selected reference interval by normalized position within its shot.
This is a comparison by visual purpose, not a claim of identical content or matching
global timestamps. Each sheet contains 50 pairs, delivery on the left and reference
on the right; three larger pairs per shot support detail checks. A reviewer must
actually open the sheets and record their inclusive frame ranges before they count
as visually inspected. The HTML viewer also exposes exact frame pairs and both
seekable videos.

Speech alignment uses independent transcription and hash-bound adjudications.
Waveform, loudness and full-scale sample checks establish technical properties only.
They do not replace subjective listening. If the review environment cannot provide
audio perception, the delivery record must explicitly retain that limitation.
