"""Resumable Pocket TTS client, independent of application tasks and pipelines.

Run with the configured service repository's Python to read its settings. Only
credentials and endpoint configuration are imported; no production state is changed.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import struct
import sys
import time
import urllib.request
import uuid
import wave

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--only', nargs='*')
parser.add_argument('--output-dir', default='media/speech-pocket')
parser.add_argument('--builtin-bo')
parser.add_argument('--builtin-qin')
parser.add_argument('--join-sentences', action='store_true', help='Use semicolon pauses in a fresh repair directory')
args = parser.parse_args()
sys.path.insert(0, os.environ.get('POCKET_CONFIG_REPO', '/Volumes/TP-1TB/WorspacePlus/IslaProject/FrontierTechSN'))
from backend import config

output = ROOT / args.output_dir
output.mkdir(parents=True, exist_ok=True)
(output / 'provider').mkdir(exist_ok=True)
lines = json.loads((ROOT / 'content/script.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()


def normalized_wav(raw):
    """Resolve streaming RIFF length placeholders without altering PCM samples."""
    if raw[:4] != b'RIFF' or raw[8:12] != b'WAVE':
        raise ValueError('Pocket TTS did not return RIFF WAV')
    offset = 12
    while offset + 8 <= len(raw):
        name, size = struct.unpack_from('<4sI', raw, offset)
        if name == b'fmt ':
            fmt, channels, rate, _, block, bits = struct.unpack_from('<HHIIHH', raw, offset + 8)
            assert fmt == 1 and bits == 16, (fmt, bits)
        if name == b'data':
            data = raw[offset + 8:]
            if size not in (0, 0x7fffffff, 0xffffffff) and size <= len(data):
                data = data[:size]
            assert data and len(data) % block == 0
            stream = io.BytesIO()
            with wave.open(stream, 'wb') as target:
                target.setnchannels(channels)
                target.setsampwidth(2)
                target.setframerate(rate)
                target.writeframes(data)
            return stream.getvalue(), len(data) / block / rate
        offset += 8 + size + size % 2
    raise ValueError('Missing PCM data')


for line in lines:
    if args.only and line['id'] not in args.only:
        continue
    voice = getattr(args, 'builtin_' + line['speaker'])
    reference = ROOT / 'media/voice-study' / (line['speaker'] + '-reference.wav')
    reference_data = b'' if voice else reference.read_bytes()
    identity = {
        'provider': 'pocket-tts', 'revision': config.POCKET_TTS_MODEL_REVISION,
        'text': line['text'], 'speaker': line['speaker'],
        'voice': voice or 'fictional-reference-' + line['speaker'],
        'reference_sha256': None if voice else sha(reference_data),
    }
    synthesis_text = line['text'].replace('. ', '; ') if args.join_sentences else line['text']
    if args.join_sentences:
        identity['synthesis_text'] = synthesis_text
    target = output / (line['id'] + '.wav')
    record = target.with_suffix('.json')
    if record.exists():
        previous = json.loads(record.read_text())
        assert previous['identity'] == identity, 'Preserve old take before changing identity'
        if target.exists() and previous.get('sha256') == sha(target.read_bytes()):
            print(line['id'], 'cached', flush=True)
            continue
    boundary = 'film-' + uuid.uuid4().hex
    fields = {'text': synthesis_text}
    if voice:
        fields['voice_url'] = voice
    parts = []
    for name, value in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    if not voice:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="voice_wav"; filename="reference.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode() + reference_data + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    headers = {'Content-Type': 'multipart/form-data; boundary=' + boundary}
    if config.POCKET_TTS_API_KEY:
        headers['X-API-Key'] = config.POCKET_TTS_API_KEY
    record.write_text(json.dumps({'identity': identity, 'status': 'requesting'}, indent=2))
    print(line['id'], 'requesting', identity['voice'], flush=True)
    started = time.monotonic()
    request = urllib.request.Request(config.POCKET_TTS_URL + '/tts', b''.join(parts), headers)
    with urllib.request.urlopen(request, timeout=config.POCKET_TTS_REQUEST_TIMEOUT) as response:
        raw = response.read()
    (output / 'provider' / (line['id'] + '.wav')).write_bytes(raw)
    audio, duration = normalized_wav(raw)
    temporary = target.with_name('.' + target.name)
    temporary.write_bytes(audio)
    temporary.replace(target)
    record.write_text(json.dumps({'identity': identity, 'status': 'completed', 'sha256': sha(audio),
        'provider_sha256': sha(raw), 'duration': duration, 'elapsed': time.monotonic() - started}, indent=2))
    print(line['id'], 'saved', round(duration, 3), 'seconds', flush=True)
