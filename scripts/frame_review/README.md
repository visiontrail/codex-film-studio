# Generic frame-review tools

These tools accept external files. They contain no narration, subject, cast,
fixed scene count or source footage. Install dependencies in an external project:

```sh
python3 -m venv /path/to/project/.venv
/path/to/project/.venv/bin/pip install av==18.1.0 Pillow==13.0.0 numpy==2.4.6
```

Run the scripts by absolute path or from this directory, directing outputs to
the external project. Output directories must be new or empty.

```sh
python audit_frames.py /path/to/reference.mp4 /path/to/project/review/reference
python compare_frames.py /path/to/output.mp4 /path/to/reference.mp4 /path/to/timeline.json /path/to/mapping.json /path/to/project/review/pairs
python compare_decoded_versions.py /path/to/old.mp4 /path/to/new.mp4 /path/to/project/review/identity
python compare_frames.py serve /path/to/project --port 8876
```

The audit decodes all frames and inventories timing, dimensions and image
statistics. The comparator creates 50 frame pairs per sheet, each image160×90,
with labels outside the pixels, plus three native-size samples per shot and an
interactive viewer. Palette and edge statistics are descriptive, not similarity
percentages. Every-frame generation does not establish every-frame visual review.

The timeline contains `fps`, `duration_frames`, and contiguous `shots` with `id`,
`scene_type`, `start`, `end`, and `headline`. Ranges are zero-based and end-exclusive.
The map contains `shots` with matching `shot_id` and `scene_type`, plus
`reference_start_seconds` and `reference_end_seconds_exclusive`. Map each shot by
visual purpose and relative progress, recorded in its `visual_function` string.
Do not force equal durations or matching
people. The tools reject missing/duplicate IDs, gaps and inconsistent frame clocks.

Identity comparison checks every decoded RGB pixel and exact rational timestamps.
Its defaults are1920×1080 at25fps; pass `--width`, `--height` and `--fps` for
another delivery contract, including a rational rate such as `30000/1001`.
Only verified identical ranges may inherit prior actual image observations,
intersected with their documented coverage. It cannot inherit playback, listening
or artistic judgments. Bind reviews to exact input and evidence hashes.

`ffmpeg_gate.py` is a wrapper for an installed FFmpeg executable. It takes the
usual FFmpeg arguments, holds a cooperative local lock and waits for existing
FFmpeg processes. It never stops another encoder. Uncoordinated software can
still start after the check, so use the same lock in collaborating productions.

Review records must distinguish automated decoding, actual thumbnail inspection,
native-resolution inspection, playback and listening. Record missing capabilities
instead of substituting ASR or waveform metrics for listening.
