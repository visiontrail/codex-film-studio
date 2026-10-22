"""Render bounded, resumable chunks and concatenate without re-encoding.

Each new encoder passes through ffmpeg_gate.py. Source changes invalidate reuse.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

import av

ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    temporary = path.with_suffix('.tmp.json')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    temporary.replace(path)


def check_video(path, expected, width, fps):
    with av.open(str(path)) as container:
        stream = container.streams.video[0]
        if stream.width != width or stream.height != round(width * 9 / 16):
            raise ValueError('Encoded dimensions mismatch')
        if float(stream.average_rate) != fps:
            raise ValueError('Encoded frame rate mismatch')
        count = 0
        previous = -1
        for frame in container.decode(stream):
            if frame.pts is None or frame.pts <= previous:
                raise ValueError('Non-increasing encoded timestamps')
            previous = frame.pts
            count += 1
        if count != expected:
            raise ValueError(f'Encoded {count} frames, expected {expected}')
    return {'frames': count, 'sha256': digest(path)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--timeline', type=Path, default=ROOT / 'media/timeline.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'media/picture.mp4')
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--chunk-frames', type=int, default=750)
    parser.add_argument('--width', type=int, default=1920)
    args = parser.parse_args()
    if not 100 <= args.chunk_frames <= 1500:
        raise ValueError('Chunk size must be between 100 and 1500 frames')
    args.work = args.work.resolve()
    args.output = args.output.resolve()
    args.timeline = args.timeline.resolve()
    args.work.mkdir(parents=True, exist_ok=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    source_paths = sorted((ROOT / 'src').glob('*.mjs')) + [
        ROOT / 'scripts/render.mjs', ROOT / 'scripts/render_film.py',
        ROOT / 'assets/learner-bounds.json', ROOT / 'package-lock.json']
    source_paths += sorted((ROOT / 'assets/generated').glob('*.png'))
    source_paths += sorted((ROOT / 'assets/source').glob('*.svg'))
    identity = {'timeline_sha256': digest(args.timeline), 'width': args.width,
                'chunk_frames': args.chunk_frames,
                'sources': {str(path.relative_to(ROOT)): digest(path) for path in source_paths}}
    checkpoint_path = args.work / 'checkpoint.json'
    if checkpoint_path.exists():
        state = json.loads(checkpoint_path.read_text())
        if state['identity'] != identity:
            raise ValueError('Checkpoint inputs changed; select a fresh work directory')
    else:
        state = {'identity': identity, 'chunks': [], 'status': 'in_progress'}
        write_json(checkpoint_path, state)
    snapshot = args.work / 'timeline.json'
    snapshot.write_bytes(args.timeline.read_bytes())
    timeline = json.loads(snapshot.read_text())
    total, fps = timeline['duration_frames'], timeline['fps']
    cached = {row['start']: row for row in state['chunks']}
    chunks = []
    for start in range(0, total, args.chunk_frames):
        end = min(total, start + args.chunk_frames)
        path = args.work / f'frames-{start:07d}-{end-1:07d}.mp4'
        row = cached.get(start)
        if row and row['end'] == end and path.exists() and digest(path) == row['sha256']:
            print(f'Reuse frames {start}..{end-1}', flush=True)
        else:
            temporary = path.with_suffix('.partial.mp4')
            command = ['node', '--expose-gc', 'scripts/render.mjs', '--timeline', str(snapshot),
                       '--width', str(args.width), '--start', str(start), '--end', str(end), '--out', str(temporary)]
            subprocess.run(command, cwd=ROOT, check=True)
            validated = check_video(temporary, end-start, args.width, fps)
            temporary.replace(path)
            row = {'start': start, 'end': end, 'path': str(path.relative_to(ROOT)), **validated}
            state['chunks'] = [entry for entry in state['chunks'] if entry['start'] != start] + [row]
            write_json(checkpoint_path, state)
        chunks.append(path)
    for relative, expected_hash in identity['sources'].items():
        if digest(ROOT / relative) != expected_hash:
            raise ValueError(f'Source changed during rendering: {relative}')
    listing = args.work / 'concat.txt'
    listing.write_text(''.join("file '" + str(path).replace("'", "'\\''") + "'\n" for path in chunks))
    temporary = args.output.with_suffix('.partial.mp4')
    subprocess.run([sys.executable, str(ROOT / 'scripts/ffmpeg_gate.py'), '-y', '-v', 'warning',
                    '-f', 'concat', '-safe', '0', '-i', str(listing), '-an', '-c:v', 'copy',
                    '-movflags', '+faststart', str(temporary)], cwd=ROOT, check=True)
    validation = check_video(temporary, total, args.width, fps)
    temporary.replace(args.output)
    state.update({'status': 'complete', 'output': str(args.output), 'validation': validation})
    write_json(checkpoint_path, state)
    print(json.dumps({'output': str(args.output), **validation}), flush=True)


if __name__ == '__main__':
    main()
