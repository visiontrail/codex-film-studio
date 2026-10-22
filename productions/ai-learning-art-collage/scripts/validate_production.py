#!/usr/bin/env python3
"""Read-only identity/coverage checks; JSON to stdout, no provider or FFmpeg calls.

Stages are cumulative: source, audio, timeline. A pass does not establish research
truth, pronunciation, listening, visual quality, style equivalence or delivery.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import struct
import sys
import wave
import xml.etree.ElementTree as ET

EXPECTED_IDS = [f'{i:02d}' for i in range(1, 47)]


def sha(data):
    return hashlib.sha256(data).hexdigest()


class Audit:
    def __init__(self, root, stage):
        self.root, self.stage = root.resolve(), stage
        self.errors, self.checks, self.inputs = [], [], {}
        self.snapshots = {}

    def check(self, condition, name, detail=None):
        entry = {'check': name, 'passed': bool(condition)}
        if detail is not None:
            entry['detail'] = detail
        self.checks.append(entry)
        if not condition:
            self.errors.append(entry)
        return bool(condition)

    def read(self, relative):
        path = (self.root / relative).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError(f'Input escapes production directory: {relative}')
        before = path.stat()
        data = path.read_bytes()
        after = path.stat()
        stamp = (after.st_size, after.st_mtime_ns)
        if (before.st_size, before.st_mtime_ns) != stamp:
            raise ValueError(f'Input changed while reading: {relative}')
        self.snapshots[path] = stamp
        self.inputs[str(path.relative_to(self.root))] = {'sha256': sha(data), 'bytes': len(data)}
        return data

    def json(self, relative):
        return json.loads(self.read(relative))

    def rows(self, data, name, key='id'):
        if isinstance(data, dict):
            data = data.get('shots', data.get('lines'))
        if not isinstance(data, list):
            raise ValueError(f'{name}: expected a list')
        ids = [str(row[key]) for row in data]
        self.check(len(ids) == len(set(ids)), f'{name}: unique IDs')
        self.check(ids == EXPECTED_IDS, f'{name}: canonical 46-ID order',
                   {'missing': sorted(set(EXPECTED_IDS) - set(ids)),
                    'unexpected': sorted(set(ids) - set(EXPECTED_IDS))})
        return {str(row[key]): row for row in data}

    def source(self):
        canonical = self.rows(self.json('content/narration.json'), 'narration')
        plans = self.rows(self.json('content/shot-plan.json'), 'shot plan')
        mapping = self.rows(self.json('content/reference-map.json'), 'reference mapping', 'shot_id')
        research = self.json('content/sources.json')
        claims = {row['id'] for row in research['claims']}
        for line_id, line in canonical.items():
            self.check(isinstance(line.get('text'), str) and bool(line['text'].strip()),
                       f'{line_id}: nonempty narration')
            self.check(set(line.get('claim_ids', [])) <= claims, f'{line_id}: known claim IDs')
            if line_id in plans and line_id in mapping:
                match = mapping[line_id]
                self.check(plans[line_id]['scene_type'] == match['scene_type'],
                           f'{line_id}: mapped scene type')
                start, end = match['reference_start_seconds'], match['reference_end_seconds_exclusive']
                self.check(0 <= start < end <= 222.04, f'{line_id}: valid reference interval')
        cues = self.json('content/audio-cues.json')['cues']
        for index, cue in enumerate(cues):
            self.check(cue.get('shot') in canonical, f'cue {index}: known shot')
            self.check(cue.get('kind') in {'wood', 'fold', 'slide', 'pencil'}, f'cue {index}: known sound kind')
            fields = [key for key in ['fraction', 'seconds', 'voice_fraction'] if key in cue]
            self.check(len(fields) == 1, f'cue {index}: one timing basis')
            for key in fields:
                value = cue[key]
                self.check(isinstance(value, (int, float)) and math.isfinite(value) and value >= 0
                           and (key == 'seconds' or value <= 1), f'cue {index}: valid {key}')
            offset = cue.get('offset_seconds', 0)
            self.check(isinstance(offset, (int, float)) and math.isfinite(offset) and offset >= 0,
                       f'cue {index}: valid timing offset')
        provenance = self.json('content/asset-provenance.json')
        for asset in provenance['generated_assets'] + provenance['official_assets']:
            data = self.read(asset['file'])
            self.check(sha(data) == asset['sha256'], f"asset hash: {asset['file']}")
            if asset['file'].endswith('.png'):
                dimensions = list(struct.unpack('>II', data[16:24])) if data[:8] == b'\x89PNG\r\n\x1a\n' else None
                self.check(dimensions == asset['dimensions'], f"asset dimensions: {asset['file']}")
        source = ET.fromstring(self.read('assets/source/openai-blossom-official.svg'))
        original_path = next(e.attrib['d'] for e in source if e.tag.endswith('path') and e.attrib.get('fill') == 'black')
        isolated = ET.fromstring(self.read('assets/source/openai-blossom-mark.svg'))
        self.check(list(isolated)[0].attrib['d'] == original_path, 'OpenAI logo: unchanged official path')
        return canonical, plans, mapping, cues

    def audio(self, canonical):
        manifest = self.rows(self.json('media/audio/manifest.json'), 'audio manifest')
        identities = set()
        for line_id, line in canonical.items():
            row = manifest.get(line_id)
            if row is None:
                continue  # Exact ID coverage was already marked as failed.
            text = line['text']
            self.check(row['text'] == text and row['source_sha256'] == sha(text.encode()),
                       f'{line_id}: canonical text and source hash')
            synthesis = row.get('synthesis_text', text)
            self.check(row.get('synthesis_sha256') == sha(synthesis.encode()), f'{line_id}: synthesis hash')
            data = self.read(row['path'])
            self.check(sha(data) == row['audio_sha256'], f'{line_id}: assembled WAV hash')
            with wave.open(str(self.root / row['path']), 'rb') as wav:
                rate, count = wav.getframerate(), wav.getnframes()
                channels, width = wav.getnchannels(), wav.getsampwidth()
                pcm = wav.readframes(count)
            self.check((rate, channels, width) == (24000, 1, 2), f'{line_id}: mono PCM16 at 24 kHz')
            self.check(len(pcm) == count * channels * width and count > 0, f'{line_id}: complete nonempty PCM')
            self.check(count == row['frames'] and rate == row['sample_rate']
                       and channels == row['channels'] and width == row['sample_width']
                       and math.isclose(count / rate, row['duration'], rel_tol=0, abs_tol=1e-6),
                       f'{line_id}: manifest PCM clock')
            self.check(row.get('speed') == 1.0, f'{line_id}: natural speech speed')
            identity = (row.get('voice'), row.get('voice_fingerprint'), row.get('deployment_fingerprint'))
            self.check(all(identity), f'{line_id}: voice/deployment identity present')
            identities.add(identity)
            self.check(bool(row.get('parts')), f'{line_id}: retained provider parts')
            for index, part in enumerate(row.get('parts', [])):
                path = Path(row['path']).parent / part['path']
                self.check(sha(self.read(path)) == part['audio_sha256'], f'{line_id}: provider part {index + 1} hash')
        self.check(len(identities) == 1, 'One voice/deployment identity across canonical audio')
        return manifest

    def timeline(self, canonical, plans, manifest, cues):
        timeline = self.json('media/timeline.json')
        shots = self.rows(timeline['shots'], 'timeline')
        self.check(timeline.get('draft') is False, 'Timeline is explicitly non-draft')
        self.check((timeline.get('width'), timeline.get('height'), timeline.get('fps')) == (1920, 1080, 25),
                   'Timeline format is 1920x1080 at 25 fps')
        end = 0
        for index, line_id in enumerate(EXPECTED_IDS):
            shot, line, audio = shots.get(line_id), canonical.get(line_id), manifest.get(line_id)
            if not shot or not line or not audio:
                continue
            integers = all(type(shot.get(key)) is int for key in ['start', 'end', 'voice_start', 'voice_end'])
            self.check(integers, f'{line_id}: integer frame coordinates')
            if not integers:
                continue
            self.check(shot['index'] == index and shot['start'] == end and shot['end'] > end,
                       f'{line_id}: contiguous ordered shot')
            self.check(shot['start'] <= shot['voice_start'] < shot['voice_end'] <= shot['end'],
                       f'{line_id}: voice inside shot')
            self.check(shot['voice_end'] - shot['voice_start'] == math.ceil(audio['duration'] * 25)
                       and math.isclose(shot['voice_duration'], audio['duration'], rel_tol=0, abs_tol=1e-6),
                       f'{line_id}: voice frames derive from real PCM')
            self.check(shot['text'] == line['text'] == audio['text'] and shot['audio'] == audio['path']
                       and shot.get('source_sha256') == audio['source_sha256']
                       and shot.get('audio_sha256') == audio['audio_sha256'], f'{line_id}: bound text/audio identity')
            self.check(shot['scene_type'] == plans[line_id]['scene_type'], f'{line_id}: current scene type')
            end = shot['end']
        self.check(timeline.get('duration_frames') == end
                   and math.isclose(timeline.get('duration_seconds', -1), end / 25, rel_tol=0, abs_tol=1e-8),
                   'Total duration matches contiguous frame clock')
        events = timeline.get('events', [])
        by_event = {e['id']: e for e in events}
        expected_events = {f"{cue['shot']}-sound-{index}" for index, cue in enumerate(cues)}
        self.check(len(by_event) == len(events) and set(by_event) == expected_events,
                   'Explicit audio cues have exact event coverage')
        for index, cue in enumerate(cues):
            event = by_event.get(f"{cue['shot']}-sound-{index}")
            shot = shots.get(cue['shot'])
            if event and shot:
                relative = (cue['fraction'] * (shot['end'] - shot['start']) if 'fraction' in cue else
                            cue.get('seconds', cue.get('voice_fraction', 0) * shot['voice_duration']
                                    + cue.get('offset_seconds', 0)) * 25)
                self.check(event.get('kind') == cue['kind'] and event.get('action') == cue['action']
                           and type(event.get('frame')) is int and shot['start'] <= event['frame'] < shot['end']
                           and event['frame'] == shot['start'] + round(relative),
                           f'cue {index}: event identity and in-shot frame')

    def run(self):
        try:
            canonical, plans, mapping, cues = self.source()
            if self.stage in {'audio', 'timeline'}:
                manifest = self.audio(canonical)
                if self.stage == 'timeline':
                    self.timeline(canonical, plans, manifest, cues)
        except (OSError, ValueError, KeyError, TypeError, StopIteration, ET.ParseError, wave.Error) as error:
            self.check(False, 'Readable complete input structure', f'{type(error).__name__}: {error}')
        for path, stamp in self.snapshots.items():
            try:
                stat = path.stat()
                stable = (stat.st_size, stat.st_mtime_ns) == stamp
            except OSError:
                stable = False
            self.check(stable, f'Input unchanged during audit: {path.relative_to(self.root)}')
        return {'schema_version': 1, 'checked_utc': datetime.now(timezone.utc).isoformat(),
                'validator_sha256': sha(Path(__file__).read_bytes()),
                'root': str(self.root), 'stage': self.stage, 'passed': not self.errors,
                'check_count': len(self.checks), 'failures': self.errors, 'checks': self.checks,
                'inputs': self.inputs, 'expected_narration_ids': EXPECTED_IDS,
                'read_only': True, 'provider_requests': 0, 'ffmpeg_subprocesses': 0,
                'research_truth': 'not assessed', 'word_and_pronunciation': 'not assessed',
                'audio_listening': 'not assessed', 'visual_quality': 'not assessed',
                'style_equivalence': 'not assessed', 'final_delivery': 'not assessed'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--stage', choices=['source', 'audio', 'timeline'], default='timeline')
    args = parser.parse_args()
    result = Audit(args.root.resolve(), args.stage).run()
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    print()
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
