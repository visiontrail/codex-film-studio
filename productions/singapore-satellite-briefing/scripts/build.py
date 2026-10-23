"""Rebuild this independent film from its retained, reviewed media inputs."""
import argparse
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)


parser = argparse.ArgumentParser()
parser.add_argument('--mux-only', action='store_true', help='Use the completed picture and mix from this exact timeline')
args = parser.parse_args()
if not args.mux_only:
    run(sys.executable, 'scripts/timeline.py')
    run(sys.executable, 'scripts/soundtrack.py')
    run('node', 'scripts/render.mjs', '--out', 'media/picture.mp4')
run(sys.executable, 'scripts/check_render.py')
credits = ('Visual reference: Satellite Briefing / The Map Still Says Sea, LemoLab, '
           'https://github.com/lemomo-ai/lemo-opuscar (CC BY 4.0). '
           'Imagery: NASA Blue Marble; EOX Sentinel-2 cloudless 2016, '
           'Contains modified Copernicus Sentinel data 2016 (CC BY 4.0). '
           'Footage: Free Stock Videos / Dheeraj Sahu '
           'https://www.youtube.com/watch?v=nCQai7lfwwY (CC BY); '
           'dod5 https://www.youtube.com/watch?v=mNLqks3eiHk (CC BY). '
           'Modified excerpts, grading and graphics. Natural Earth land: public domain. '
           'Independent English narration and original procedural score. See CREDITS.md.')
run(sys.executable, 'scripts/ffmpeg_gate.py', 'ffmpeg', '-hide_banner', '-loglevel', 'error',
    '-y', '-i', 'media/picture.mp4', '-i', 'media/mix.wav', '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart',
    '-metadata', 'title=Singapore · Three Days, Three Routes', '-metadata', 'comment=' + credits,
    'media/final.mp4')
run(sys.executable, 'scripts/compare_frames.py')
print('Rendered and measured. Visual inspection and browser playback remain separate checks.')
