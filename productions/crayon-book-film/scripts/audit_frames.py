"""Full sequential decode: every frame gets metrics and a numbered atlas tile.

This provides complete automated coverage and reviewable visual evidence,
not a claim of manual full-resolution inspection of every frame.
"""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw
from ffmpeg_gate import gate


def audit(source, output):
    output.mkdir(parents=True, exist_ok=True)
    meta = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(source)]))
    stream = next(s for s in meta['streams'] if s['codec_type'] == 'video')
    n, d = map(int, stream['r_frame_rate'].split('/'))
    fps = n / d
    width, height = 480, 270
    tile_w, tile_h, columns, rows = 320, 198, 6, 6
    page_size = columns * rows
    metrics, previous, page, i = [], None, None, 0
    selected = {round(t * fps) for t in [0, 1, 3, 6, 10, 14, 18, 22, 26, 30, 33, 36, 40, 43, 47, 50, 51.9]}
    with gate():
        process = subprocess.Popen([
            '/opt/homebrew/bin/ffmpeg', '-v', 'error', '-i', str(source), '-map', '0:v:0',
            '-vf', f'scale={width}:{height}', '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
            stdout=subprocess.PIPE)
        while True:
            raw = process.stdout.read(width * height * 3)
            if not raw:
                break
            if len(raw) != width * height * 3:
                raise RuntimeError('Truncated decoded frame')
            a = np.frombuffer(raw, np.uint8).reshape(height, width, 3).astype(np.float32)
            luma = a.mean(2)
            sat = (a.max(2) - a.min(2)) / np.maximum(1, a.max(2))
            paper = (luma > 205) & (sat < .20)
            delta = np.abs(a - previous).mean() if previous is not None else 0
            metrics.append([i, round(i / fps, 6), *[round(float(v), 4) for v in
                [*a.mean((0, 1)), luma.std(), paper.mean(), (luma < 65).mean(),
                 sat.mean(), np.abs(np.diff(luma, axis=1)).mean(), delta]],
                 hashlib.sha256(raw).hexdigest()])
            im = Image.fromarray(a.astype(np.uint8))
            if i % page_size == 0:
                page = Image.new('RGB', (columns * tile_w, rows * tile_h), '#dedbd4')
            x, y = (i % columns) * tile_w, (i % page_size // columns) * tile_h
            page.paste(im.resize((320, 180), Image.Resampling.LANCZOS), (x, y))
            ImageDraw.Draw(page).text((x + 4, y + 182), f'frame {i:05d} | {i/fps:07.3f}s', fill='#282c3c')
            if i % page_size == page_size - 1:
                page.save(output / f'atlas-{i//page_size:04d}.jpg', quality=90)
            if i in selected:
                im.save(output / f'frame-{i:05d}.png')
            previous = a
            i += 1
        if process.wait() != 0:
            raise RuntimeError('Decode failed')
    if i % page_size:
        page.save(output / f'atlas-{i//page_size:04d}.jpg', quality=90)
    with (output / 'frames.csv').open('w') as f:
        writer = csv.writer(f)
        writer.writerow(['frame', 'time', 'red', 'green', 'blue', 'luma_std', 'paper_fraction',
                         'dark_fraction', 'saturation', 'horizontal_texture', 'frame_delta', 'decoded_sha256'])
        writer.writerows(metrics)
    report = dict(source=str(source), sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                  width=stream['width'], height=stream['height'], fps=fps,
                  frames_decoded=i, expected_frames=stream.get('nb_frames'),
                  full_sequential_decode=True, metric_resolution=[width, height],
                  visual_coverage='Every frame has a numbered atlas tile; inspection recorded separately.',
                  atlas_pages=(i + page_size - 1)//page_size, stream_metadata=meta)
    (output / 'report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps({k:v for k,v in report.items() if k != 'stream_metadata'}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    audit(args.source, args.output)
