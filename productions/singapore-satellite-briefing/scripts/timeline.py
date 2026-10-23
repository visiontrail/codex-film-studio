"""One integer-frame clock, aligned to reviewed English Chatterbox word times."""
import argparse
import difflib
import hashlib
import json
import math
import pathlib
import re
import wave

ROOT = pathlib.Path(__file__).resolve().parents[1]
FPS = 24


def tokens(text):
    return re.findall(r"[a-z0-9]+", text.lower())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--draft', action='store_true')
    draft = parser.parse_args().draft
    script = json.loads((ROOT / 'content/narration.json').read_text())
    chunks_by_id = json.loads((ROOT / 'content/caption-chunks.json').read_text())
    manifest_path = ROOT / 'media/audio/manifest.json'
    manifest = {x['id']: x for x in json.loads(manifest_path.read_text())} if manifest_path.exists() else {}
    shots, captions, events, voices, alignment = [], [], [], [], []
    cursor = 0
    for row in script:
        ident = row['id']
        chunks = chunks_by_id[ident]
        if ' '.join(chunks) != row['text']:
            raise RuntimeError('Captions do not reproduce the current script: ' + ident)
        item = manifest.get(ident)
        if item and item['text'] != row['text']:
            if draft:
                item = None
            else:
                raise RuntimeError('Stale audio: ' + ident)
        if not item and not draft:
            raise RuntimeError('Missing final audio: ' + ident)
        duration = item['duration'] if item else len(tokens(row['text'])) / 2.9
        words, word_map = [], {}
        if item:
            path = ROOT / item['path']
            if hashlib.sha256(path.read_bytes()).hexdigest() != item['audio_sha256']:
                raise RuntimeError('Changed WAV: ' + ident)
            with wave.open(str(path)) as wav:
                actual_duration = wav.getnframes() / wav.getframerate()
            if abs(actual_duration - duration) > 1 / 24000:
                raise RuntimeError('Wrong WAV duration: ' + ident)
            asr = json.loads((ROOT / item['asr']).read_text())
            if asr['audio_sha256'] != item['audio_sha256']:
                raise RuntimeError('Stale ASR: ' + ident)
            for segment in asr['segments']:
                for word in segment.get('words', []):
                    words.extend({**word, 'token': token} for token in tokens(word['word']))
            matcher = difflib.SequenceMatcher(None, tokens(row['text']), [w['token'] for w in words], autojunk=False)
            for block in matcher.get_matching_blocks():
                for offset in range(block.size):
                    word_map[block.a + offset] = block.b + offset
        lead = 24 if ident == 'L01' else 20
        frames = max(228 if ident == 'L01' else 192, math.ceil((duration + 1.65) * FPS))
        shots.append({**row, 'start': cursor, 'end': cursor + frames, 'duration': frames,
                      'audio_start': cursor + lead, 'audio_duration': duration})
        events.append({'id': row['scene'] + '-lock', 'frame': cursor + 26})
        if item:
            voices.append({'id': ident, 'frame': cursor + lead, 'file': item['path'], 'sha256': item['audio_sha256']})
        boundaries = [cursor + max(0, lead - 12)]
        source_index = 0
        for previous, chunk in zip(chunks, chunks[1:]):
            source_index += len(tokens(previous))
            if item:
                if source_index not in word_map:
                    raise RuntimeError(f'Unmatched caption boundary {ident}: {chunk}')
                word = words[word_map[source_index]]
                second = word['start']
                method = 'exact_source_token_to_reviewed_ASR_word_start'
            else:
                second = duration * source_index / len(tokens(row['text']))
                word = None
                method = 'draft_word_proportion'
            frame = cursor + lead + round(second * FPS)
            boundaries.append(frame)
            alignment.append({'id': ident, 'caption_start_text': chunk, 'method': method,
                              'source_token_index': source_index, 'asr_word': word,
                              'seconds_within_audio': second, 'frame': frame,
                              'audio_sha256': item['audio_sha256'] if item else None})
        boundaries.append(cursor + frames - 5)
        for chunk, start, end in zip(chunks, boundaries, boundaries[1:]):
            if end <= start:
                raise RuntimeError('Non-positive caption duration: ' + ident)
            captions.append({'id': ident, 'start': start, 'end': end, 'en': chunk})
        cursor += frames
    shots.append({'id': 'END', 'scene': 'endcard', 'start': cursor, 'end': cursor + 96, 'duration': 96})
    cursor += 96
    result = {'fps': FPS, 'width': 1920, 'height': 1080, 'language': 'en',
              'duration_frames': cursor, 'draft': draft, 'shots': shots, 'captions': captions,
              'events': events, 'voices': voices}
    (ROOT / 'content/caption-alignment.json').write_text(json.dumps(alignment, indent=2) + '\n')
    (ROOT / 'content/timeline.json').write_text(json.dumps(result, indent=2) + '\n')
    def stamp(frame):
        ms = round(frame / FPS * 1000)
        return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
    (ROOT / 'media/captions.en.srt').write_text('\n\n'.join(
        f'{i+1}\n{stamp(s["start"])} --> {stamp(s["end"])}\n{s["en"]}' for i, s in enumerate(captions)) + '\n')
    print(json.dumps({'frames': cursor, 'seconds': cursor / FPS, 'final_audio_lines': len(voices), 'captions': len(captions), 'draft': draft}))


if __name__ == '__main__':
    main()
