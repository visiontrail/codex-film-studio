"""Decode the delivered audio and extract numbered 1080p inspection frames."""
import json
from pathlib import Path
import re
import subprocess

from ffmpeg_gate import gate


ROOT = Path(__file__).resolve().parents[1]
MOVIE = ROOT / 'media/leo-the-farmer-crayon-book.mp4'
OUT = ROOT / 'review/delivery'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    timeline = json.loads((ROOT / 'content/timeline.json').read_text())
    frames = sorted(set([0, 24, 48, 80, 3241, 3242, 3702, 3703,
                         3740, 3790, 3830, 3870, 3910, 3950, 3990] +
                        [s['start'] + (s['end'] - s['start']) // 2
                         for s in timeline['scenes']]))
    expression = '+'.join(f'eq(n\\,{n})' for n in frames)
    with gate():
        subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-y',
                        '-i', str(MOVIE), '-an', '-vf', f'select={expression}',
                        '-fps_mode', 'vfr', str(OUT / 'selected-%03d.png')], check=True)
    manifest = []
    for i, frame in enumerate(frames, 1):
        name = f'frame-{frame:06d}.png'
        (OUT / f'selected-{i:03d}.png').replace(OUT / name)
        manifest.append({'frame': frame, 'seconds': frame / 24, 'file': name})
    (OUT / 'full-resolution-frames.json').write_text(json.dumps(manifest, indent=2))
    with gate():
        audio = subprocess.run([
            '/opt/homebrew/bin/ffmpeg', '-hide_banner', '-i', str(MOVIE),
            '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json',
            '-f', 'null', '-'], capture_output=True, text=True, check=True)
    (OUT / 'audio-decode.log').write_text(audio.stderr)
    measurement = json.loads(re.findall(r'\{[^{}]+\}', audio.stderr)[-1])
    result = {'movie': str(MOVIE.relative_to(ROOT)),
              'selected_full_resolution_frames': frames,
              'audio_full_decode_passed': audio.returncode == 0,
              'measured_integrated_lufs': float(measurement['input_i']),
              'measured_true_peak_dbtp': float(measurement['input_tp']),
              'measured_loudness_range_lu': float(measurement['input_lra']),
              'auditory_listening_review': False}
    (OUT / 'technical-checks.json').write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
