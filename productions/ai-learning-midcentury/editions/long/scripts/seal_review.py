"""Transfer already recorded chapter inspections only after decoded-pixel identity.

This does not perform visual inspection. Each chapter must already have a
manual atlas coverage record bound to its current media and decoded inventory.
"""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads((ROOT / path).read_text())


def sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def rows(path):
    with (ROOT / path).open() as handle:
        return list(csv.DictReader(handle))


def main():
    final = read('review/final/summary.json')
    final_path = 'media/Does-AI-Help-You-Learn-Midcentury-Long.mp4'
    assert final['sha256'] == sha(final_path)
    timeline = read('content/timeline.json')
    assert not timeline['draft']
    decoded = rows('review/final/frames.csv')
    assert len(decoded) == final['decoded_frames'] == timeline['duration_frames']
    assert [int(r['frame']) for r in decoded] == list(range(len(decoded)))
    log = read('review/inspection-log.json')
    inspections = {r['chapter']: r for r in log['final_all_frame_review']}
    assert set(inspections) == set(range(1, 8))
    position, evidence = 0, []
    for chapter in range(1, 8):
        prefix = f'review/chapter-{chapter:02d}'
        video = f'media/chapters/{chapter:02d}.mp4'
        meta = read(f'media/chapters/{chapter:02d}.json')
        summary = read(prefix + '/summary.json')
        review = inspections[chapter]
        assert review['video_sha256'] == summary['sha256'] == sha(video)
        assert review['frames_csv_sha256'] == sha(prefix + '/frames.csv')
        assert sorted(review['atlases_seen']) == list(range(summary['atlas_count']))
        assert review['frames'] == summary['decoded_frames'] == meta['end'] - meta['start']
        assert meta['start'] == position
        frames = rows(prefix + '/frames.csv')
        assert [int(r['frame']) for r in frames] == list(range(review['frames']))
        for frame in frames:
            assert frame['rgb_sha256'] == decoded[position]['rgb_sha256'], position
            position += 1
        evidence.append({**review, 'start_frame': meta['start'], 'end_frame_exclusive': position})
    assert position == len(decoded)
    report = {
        'final_sha256': final['sha256'],
        'final_frames_csv_sha256': sha('review/final/frames.csv'),
        'consecutive_thumbnail_frames_reviewed': position,
        'chapter_to_final_decoded_pixel_matches': position,
        'identity_resolution': [640, 360],
        'review_method': 'Every frame opened in consecutive reference/new paired atlases. Source tiles 240x135, tool display approximately 200x112. Selected action and text details also inspected at full resolution. This is not native-resolution inspection of every frame.',
        'chapters': evidence,
        'reference_frames': read('review/reference/summary.json')['decoded_frames'],
        'reference_review': 'All 960 reference frames were reviewed in the preceding short-edition production; shared reference inventory retained.',
        'artistic_equivalence_percentage': None,
        'subjective_listening': 'not completed; audio input unavailable',
        'manual_inspection_log_sha256': sha('review/inspection-log.json'),
    }
    (ROOT / 'review/visual-review.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'verified_pixel_matches': position, 'reviewed_chapters': len(evidence)}))


if __name__ == '__main__':
    main()
