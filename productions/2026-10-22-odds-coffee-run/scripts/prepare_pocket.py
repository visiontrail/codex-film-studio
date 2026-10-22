"""Conservatively shorten measured silence; preserve every non-silent PCM sample.

No speed or pitch change. Raw provider files remain untouched. Independently
transcribe the prepared directory before accepting takes or rebuilding the edit.
"""
import argparse
import hashlib
import json
from pathlib import Path
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--source', default='media/speech-pocket')
p.add_argument('--output', default='media/speech-pocket-edited')
a = p.parse_args()
source, output = ROOT / a.source, ROOT / a.output
output.mkdir(parents=True, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
for file in sorted(source.glob('L[0-9][0-9][0-9].wav')):
    record = json.loads(file.with_suffix('.json').read_text())
    with wave.open(str(file)) as f:
        assert f.getnchannels() == 1 and f.getsampwidth() == 2
        sr = f.getframerate()
        pcm = np.frombuffer(f.readframes(f.getnframes()), '<i2').copy()
    assert sha(file.read_bytes()) == record['sha256']
    hop = round(sr * .01)
    quiet = [np.max(np.abs(pcm[i:i + hop].astype(float))) < 49
             for i in range(0, len(pcm), hop)]
    runs = []
    start = None
    for index, silent in enumerate(quiet + [False]):
        if silent and start is None:
            start = index * hop
        if not silent and start is not None:
            end = min(index * hop, len(pcm))
            if start == 0 and end > .12 * sr:
                runs.append((0, max(0, end - round(.10 * sr))))
            elif end == len(pcm) and end - start > .12 * sr:
                runs.append((start + round(.10 * sr), end))
            elif end - start > .50 * sr:
                # Leave a quarter-second pause and at least 120 ms on each side.
                runs.append((start + round(.125 * sr), end - round(.125 * sr)))
            start = None
    chunks, cursor = [], 0
    for lo, hi in runs:
        assert np.max(np.abs(pcm[lo:hi].astype(float))) < 49
        chunks.append(pcm[cursor:lo])
        cursor = hi
    chunks.append(pcm[cursor:])
    result = np.concatenate(chunks)
    target = output / file.name
    with wave.open(str(target), 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(result.astype('<i2').tobytes())
    record.update(sha256=sha(target.read_bytes()), parent_wav=str(file.relative_to(ROOT)),
                  parent_sha256=sha(file.read_bytes()), duration=len(result) / sr,
                  silence_edits=[{'source_start': lo / sr, 'source_end': hi / sr} for lo, hi in runs],
                  transformation='Remove only measured near-silence below -56.5 dBFS; preserve spoken samples, pitch and rate')
    target.with_suffix('.json').write_text(json.dumps(record, indent=2))
    print(file.stem, round(len(pcm) / sr, 3), '->', round(len(result) / sr, 3), 'seconds')
