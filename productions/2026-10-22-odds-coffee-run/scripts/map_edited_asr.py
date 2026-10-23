"""Map independently recognized raw word times through documented silence cuts.

The recognized text is copied unchanged. This is timestamp transformation, not
a fresh transcription. Both raw and independently re-transcribed edited audio
remain available for comparing ASR ambiguities.
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--only', nargs='+', required=True)
p.add_argument('--audio-dir', default='media/speech-pocket-edited')
p.add_argument('--raw-asr-dir', default='review/asr-pocket')
p.add_argument('--output-dir', default='review/asr-pocket-mapped')
a = p.parse_args()
out = ROOT / a.output_dir
out.mkdir(parents=True, exist_ok=True)
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
for name in a.only:
    wav = ROOT / a.audio_dir / (name + '.wav')
    record = json.loads(wav.with_suffix('.json').read_text())
    raw_file = ROOT / a.raw_asr_dir / (name + '.json')
    raw = json.loads(raw_file.read_text())
    assert raw['sha256'] == record['parent_sha256']
    assert sha(wav) == record['sha256']

    def mapped(t):
        removed = sum(max(0, min(t, edit['source_end']) - edit['source_start'])
                      for edit in record['silence_edits'])
        return round(max(0, min(record['duration'], t - removed)), 6)

    for segment in raw['segments']:
        for item in [segment, *segment.get('words', [])]:
            for key in ('start', 'end'):
                item[key] = mapped(item[key])
    raw.update(sha256=sha(wav), source=str(wav), raw_asr=str(raw_file.relative_to(ROOT)),
               raw_asr_sha256=sha(raw_file), timing_method='Map raw independent word timestamps through PCM silence cuts; recognized text unchanged')
    (out / (name + '.json')).write_text(json.dumps(raw, indent=2))
    print(name, raw['text'])
