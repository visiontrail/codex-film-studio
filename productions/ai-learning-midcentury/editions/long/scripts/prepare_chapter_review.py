"""Decode all chapter frames for subsequent visual inspection, retaining hashes."""
import argparse
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--follow', action='store_true')
    args = parser.parse_args()
    while True:
        count = 0
        for number in range(1, 8):
            video = ROOT / f'media/chapters/{number:02d}.mp4'
            meta = video.with_suffix('.json')
            if not video.exists() or not meta.exists():
                continue
            digest = hashlib.sha256(video.read_bytes()).hexdigest()
            out = ROOT / f'review/chapter-{number:02d}'
            summary = out / 'summary.json'
            if not summary.exists() or json.loads(summary.read_text())['sha256'] != digest:
                subprocess.run([sys.executable, str(ROOT / 'scripts/analyze_frames.py'), str(video), str(out)], check=True)
                subprocess.run([sys.executable, str(ROOT / 'scripts/compare_frames.py'), '--chapter', str(number)], check=True)
                print(f'Chapter {number}: all frames prepared; visual inspection still required', flush=True)
            count += 1
        if count == 7 or not args.follow:
            break
        time.sleep(25)

if __name__ == '__main__':
    main()
