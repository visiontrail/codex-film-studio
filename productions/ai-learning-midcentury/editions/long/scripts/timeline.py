"""Time the long edition from actual speech, with explicit reading holds."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from transcribe import tokens

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--draft', action='store_true')
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    lines = json.loads((ROOT / 'content/narration.json').read_text())
    def optional(name):
        path = ROOT / name
        return json.loads(path.read_text()) if path.exists() else []
    audio = {row['id']: row for row in optional('media/audio/manifest.json')}
    asr = {row['id']: row for row in optional('media/asr/review.json')}
    short = json.loads((ROOT / '../../content/timeline.json').read_text())
    original = {s['id']: s for s in short['shots']}
    shots, events, chapters = [], [], []
    frame = 0
    previous_chapter = None
    for line in lines:
        row = audio.get(line['id'])
        if not args.draft:
            assert row and row['text'] == line['text']
            assert hashlib.sha256((ROOT / row['path']).read_bytes()).hexdigest() == row['audio_sha256']
            report = asr.get(line['id'])
            assert report and report['audio_sha256'] == row['audio_sha256']
            if tokens(report['transcript']) != tokens(line['text']):
                second = json.loads((ROOT / f"media/asr/{line['id']}-independent-medium.json").read_text())
                assert second['audio_sha256'] == row['audio_sha256']
                assert tokens(second['text']) == tokens(line['text']), line['id']
        seconds = row['duration'] if row else len(line['text'].split()) / 3.05
        new_chapter = previous_chapter != line['chapter']
        lead = 27 if new_chapter else 18
        duration = math.ceil(max(7.0, seconds + lead / 24 + .45 + line.get('hold', 0)) * 2) * 12
        shot = {**line, 'start': frame, 'end': frame + duration,
                'voice_start': frame + lead, 'voice_duration': seconds,
                'audio': row['path'] if row else None,
                'action': frame + 54, 'cues': {}}
        if line.get('reuse_short_id'):
            prior = original[line['reuse_short_id']]
            shift = frame + lead - prior['voice_start']
            shot['action'] = prior['action'] + shift
            shot['cues'] = {key: value + shift for key, value in prior.get('cues', {}).items()}
        else:
            shot['action'] = frame + round(min(seconds * .4 + lead / 24, 4.8) * 24)
        if new_chapter:
            chapters.append({'title': line['chapter'], 'start': frame, 'seconds': frame / 24})
        events.extend([{'id': line['id'] + '-transition', 'frame': frame, 'kind': 'swish'},
                       {'id': line['id'] + '-action', 'frame': shot['action'], 'kind': 'click' if line['scene'] in ['code', 'step2'] else 'paper'}])
        shots.append(shot)
        frame += duration
        previous_chapter = line['chapter']
    shots.append({'id': '65', 'scene': 'credits', 'chapter': 'Credits', 'start': frame,
                  'end': frame + 144, 'voice_start': frame, 'voice_duration': 0,
                  'audio': None, 'text': '', 'caption': '', 'action': frame,
                  'purpose': 'Circular end title and source attribution.', 'reference_range': [891, 960]})
    frame += 144
    timeline = {'fps': 24, 'duration_frames': frame, 'draft': args.draft, 'bpm': 132,
                'chapters': chapters, 'shots': shots, 'events': events}
    (args.out or ROOT / 'content/timeline.json').write_text(json.dumps(timeline, indent=2) + '\n')
    print(json.dumps({'seconds': frame / 24, 'shots': len(shots), 'chapters': len(chapters), 'draft': args.draft}))


if __name__ == '__main__':
    main()
