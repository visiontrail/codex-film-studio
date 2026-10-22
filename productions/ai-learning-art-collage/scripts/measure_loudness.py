"""Measure a delivered PCM mix; this is not a listening or intelligibility test."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import wave

import numpy as np
import pyloudnorm as pyln
from scipy.signal import resample_poly


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('audio', type=Path)
    parser.add_argument('report', type=Path)
    args = parser.parse_args()
    with wave.open(str(args.audio), 'rb') as stream:
        rate, channels, width, frames = (stream.getframerate(), stream.getnchannels(),
                                         stream.getsampwidth(), stream.getnframes())
        if width != 2:
            raise ValueError('PCM16 required')
        data = np.frombuffer(stream.readframes(frames), '<i2').reshape(-1, channels).astype(np.float32) / 32768
    if not np.isfinite(data).all() or len(data) != frames:
        raise ValueError('Incomplete or nonfinite audio')
    sample_peak = float(np.max(np.abs(data)))
    integrated = pyln.Meter(rate).integrated_loudness(data)
    # Independent per-channel, bounded windows avoid allocating a 4x full-film copy.
    # Overlap keeps filter transients at window boundaries out of the maximum.
    peak = 0.0
    block, margin = rate * 10, 128
    for channel in range(channels):
        for start in range(0, frames, block):
            end = min(frames, start + block)
            a, b = max(0, start - margin), min(frames, end + margin)
            oversampled = resample_poly(data[a:b, channel], 4, 1)
            core = oversampled[(start-a)*4:(end-a)*4]
            peak = max(peak, float(np.max(np.abs(core))))
    report = {
        'audio_path': str(args.audio.resolve()),
        'sha256': hashlib.sha256(args.audio.read_bytes()).hexdigest(),
        'frames': frames, 'sample_rate': rate, 'channels': channels,
        'duration_seconds': frames/rate, 'integrated_lufs': integrated,
        'loudness_implementation': 'pyloudnorm 0.1.1 BS.1770 meter',
        'sample_peak_dbfs': 20*math.log10(max(sample_peak, 1e-12)),
        'oversampled_peak_dbfs': 20*math.log10(max(peak, 1e-12)),
        'peak_method': '4x scipy polyphase oversampling estimate; not a certified true-peak meter',
        'samples_at_full_scale': int(np.count_nonzero(np.abs(data) >= 1)),
        'subjective_listening_established': False,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
