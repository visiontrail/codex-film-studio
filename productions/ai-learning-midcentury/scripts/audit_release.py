"""Bind a release to retained frame, subtitle, speech and review evidence.

This reads existing evidence. It never claims a new decode, visual inspection
or subjective listening, and does not invoke FFmpeg or a provider service.
"""
import csv
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(name):
    return json.loads((ROOT / name).read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalize(text):
    text = re.sub(r"\$(\d+)", r"\1 dollars", text.lower())
    text = text.replace('%', ' percent').replace('dollars', 'dollar')
    text = text.replace('practise', 'practice')
    for number, words in {'48': 'forty eight', '17': 'seventeen', '11': 'eleven',
                          '15': 'fifteen', '4': 'four', '3': 'three',
                          '2': 'two', '1': 'one'}.items():
        text = re.sub(r'\b' + number + r'\b', words, text)
    return re.findall(r'[a-z]+|\d+', text.replace("'", '').replace('’', ''))


def main():
    timeline = read('content/timeline.json')
    video = ROOT / 'media/Does-AI-Help-You-Learn-Midcentury.mp4'
    video_hash = sha(video)
    inventory = read('review/final/summary.json')
    delivery = read('review/delivery/delivery-check.json')
    visual = read('review/visual-review.json')
    assert inventory['sha256'] == video_hash == visual['final_sha256']
    assert not timeline['draft'] and delivery['checks_passed']
    assert inventory['decoded_frames'] == delivery['decoded_frames'] == timeline['duration_frames']
    assert int(delivery['format']['size']) == video.stat().st_size
    assert delivery['fps'] == timeline['fps'] == 24
    with (ROOT / 'review/final/frames.csv').open() as handle:
        rows = list(csv.DictReader(handle))
    assert [int(row['frame']) for row in rows] == list(range(timeline['duration_frames']))
    comparison = read('review/comparison/summary.json')
    assert comparison['comparison_rows'] == timeline['duration_frames']
    assert len(read('review/comparison/mapping.json')) == timeline['duration_frames']

    lines = read('content/narration.json')
    manifest = {row['id']: row for row in read('media/audio/manifest.json')}
    asr = {row['id']: row for row in read('media/asr/review.json')}
    assert set(manifest) == set(asr) == {row['id'] for row in lines}
    independent = []
    for line in lines:
        row, report = manifest[line['id']], asr[line['id']]
        assert row['text'] == line['text']
        assert hashlib.sha256(line['text'].encode()).hexdigest() == row['source_sha256']
        assert sha(ROOT / row['path']) == row['audio_sha256'] == report['audio_sha256']
        if normalize(report['transcript']) != normalize(line['text']):
            second = read(f"media/asr/{line['id']}-independent-medium.json")
            assert second['audio_sha256'] == row['audio_sha256']
            assert normalize(second['text']) == normalize(line['text'])
            independent.append(line['id'])

    srt = (ROOT / 'media/narration.en.srt').read_text().strip().split('\n\n')
    subtitle_text, previous_end = [], 0.0
    for i, block in enumerate(srt, 1):
        number, timing, *words = block.splitlines()
        assert int(number) == i and words
        def seconds(stamp):
            hour, minute, second, ms = map(int, re.split('[:,]', stamp))
            return hour * 3600 + minute * 60 + second + ms / 1000
        start, end = map(seconds, timing.split(' --> '))
        assert 0 <= previous_end <= start < end <= inventory['duration']
        previous_end = end
        subtitle_text.extend(words)
    assert normalize(' '.join(subtitle_text)) == normalize(' '.join(x['text'] for x in lines))

    files = ['media/Does-AI-Help-You-Learn-Midcentury.mp4',
             'media/narration.en.srt', 'media/narration.en.vtt',
             'content/timeline.json', 'content/narration.json',
             'review/visual-review.json', 'review/delivery/delivery-check.json',
             'review/comparison/frames.csv', 'review/comparison-browser.png']
    result = {
        'title': 'Does AI Help You Learn—or Just Finish?',
        'duration_seconds': inventory['duration'], 'fps': 24,
        'resolution': [delivery['width'], delivery['height']],
        'frames': timeline['duration_frames'], 'shots': len(timeline['shots']),
        'speech_recordings': len(manifest), 'subtitle_cues': len(srt),
        'hash_bound_independent_asr_lines': independent,
        'retained_evidence_checks_passed': True,
        'subjective_listening': 'not completed; audio input unavailable',
        'artistic_equivalence_percentage': None,
        'files': {name: {'bytes': (ROOT / name).stat().st_size,
                         'sha256': sha(ROOT / name)} for name in files},
    }
    (ROOT / 'release.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'files'}, indent=2))


if __name__ == '__main__':
    main()
