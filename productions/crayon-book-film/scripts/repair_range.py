"""Re-render one exact scene range, preserve the prior movie, and rejoin."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

from ffmpeg_gate import gate

ROOT = Path(__file__).resolve().parents[1]


def frame_count(path):
    data = subprocess.check_output([
        '/opt/homebrew/bin/ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=nb_frames', '-of', 'json', str(path)])
    return int(json.loads(data)['streams'][0]['nb_frames'])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('scene', nargs='+')
    args = parser.parse_args()
    timeline = json.loads((ROOT / 'content/timeline.json').read_text())
    scenes = sorted((next(s for s in timeline['scenes'] if s['id'] == name)
                     for name in set(args.scene)), key=lambda s: s['start'])
    picture = ROOT / 'media/leo-the-farmer-picture.mp4'
    digest = hashlib.sha256(picture.read_bytes()).hexdigest()[:12]
    names = '-'.join(s['id'] for s in scenes)
    previous = picture.with_name(f'picture-before-{names}-{digest}.mp4')
    if not previous.exists():
        shutil.copy2(picture, previous)
    inputs = ['-i', str(previous)]
    filters, labels, cursor = [], [], 0
    for index, scene in enumerate(scenes, 1):
        first, last = scene['start'], scene['end']
        patch = ROOT / f'media/parts/repair-{scene["id"]}.mp4'
        subprocess.run([sys.executable, str(ROOT / 'scripts/encode.py'),
                        '--start', str(first), '--end', str(last),
                        '--output', str(patch)], cwd=ROOT, check=True)
        assert frame_count(patch) == last - first
        inputs.extend(['-i', str(patch)])
        if first > cursor:
            label = f'original{index}'
            filters.append(f'[0:v]trim=start_frame={cursor}:end_frame={first},'
                           f'setpts=PTS-STARTPTS[{label}]')
            labels.append(f'[{label}]')
        label = f'patch{index}'
        filters.append(f'[{index}:v]setpts=PTS-STARTPTS[{label}]')
        labels.append(f'[{label}]')
        cursor = last
    if cursor < timeline['total_frames']:
        filters.append(f'[0:v]trim=start_frame={cursor},setpts=PTS-STARTPTS[tail]')
        labels.append('[tail]')
    filters.append(''.join(labels) + f'concat=n={len(labels)}:v=1:a=0[out]')
    graph = ';'.join(filters)
    temporary = picture.with_name('repaired-picture.mp4')
    with gate():
        subprocess.run(['/opt/homebrew/bin/ffmpeg', '-hide_banner', '-loglevel',
                        'warning', '-y', *inputs,
                        '-filter_complex', graph, '-map', '[out]', '-an',
                        '-c:v', 'libx264', '-preset', 'fast', '-crf', '17',
                        '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                        str(temporary)], check=True)
    assert frame_count(temporary) == timeline['total_frames']
    temporary.replace(picture)
    print(f'Repaired {names}: {[(s["start"], s["end"]) for s in scenes]}', flush=True)


if __name__ == '__main__':
    main()
