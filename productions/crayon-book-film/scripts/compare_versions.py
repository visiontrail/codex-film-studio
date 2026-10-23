"""Compare every aligned frame after bounded scene repairs; not a style score."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

from ffmpeg_gate import gate

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('previous', type=Path)
    parser.add_argument('current', type=Path)
    parser.add_argument('scenes', nargs='+')
    parser.add_argument('--report', default='review/version-comparison-v4')
    args = parser.parse_args()
    timeline = json.loads((ROOT / 'content/timeline.json').read_text())
    ranges = [(s['start'], s['end']) for s in timeline['scenes']
              if s['id'] in args.scenes]
    assert len(ranges) == len(set(args.scenes))
    report = Path(args.report)
    stats = report.with_suffix('.txt')
    with gate():
        subprocess.run([
            '/opt/homebrew/bin/ffmpeg', '-hide_banner', '-loglevel', 'error',
            '-i', str(args.previous), '-i', str(args.current),
            '-filter_complex', f'[0:v][1:v]ssim=stats_file={stats}',
            '-an', '-f', 'null', '-'], check=True)
    values = [float(re.search(r'All:([0-9.]+)', line)[1])
              for line in stats.read_text().splitlines()]
    assert len(values) == timeline['total_frames']
    unchanged = [v for i, v in enumerate(values)
                 if not any(first <= i < last for first, last in ranges)]
    result = {
        'previous_sha256': hashlib.sha256(args.previous.read_bytes()).hexdigest(),
        'current_sha256': hashlib.sha256(args.current.read_bytes()).hexdigest(),
        'frames_compared': len(values),
        'changed_content_ranges_end_exclusive': ranges,
        'changed_content_frames': len(values) - len(unchanged),
        'unchanged_content_frames': len(unchanged),
        'unchanged_ssim_min': min(unchanged),
        'unchanged_ssim_mean': sum(unchanged) / len(unchanged),
        'interpretation': 'Aligned version continuity only. Lossy re-encoding '
                          'changes pixels outside repaired scenes. This is '
                          'not comparison to the style reference.'}
    report.with_suffix('.json').write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
