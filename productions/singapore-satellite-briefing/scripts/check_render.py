"""Check every recorded rendered frame against the authored timeline."""
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
timeline = json.loads((ROOT / 'content/timeline.json').read_text())
states = [json.loads(line) for line in (ROOT / 'review/render-state.jsonl').read_text().splitlines()]
errors = []
outside = []
non_english = []
boundaries = []
if [s['frame'] for s in states] != list(range(timeline['duration_frames'])):
    errors.append('Rendered frame indices do not exactly cover the final timeline')
for state in states:
    frame = state['frame']
    expected = next(s['scene'] for s in timeline['shots'] if s['start'] <= frame < s['end'])
    if state['scene'] != expected:
        errors.append(f'Wrong scene at {frame}')
    if not all(math.isfinite(v) for v in state['camera'].values()):
        errors.append(f'Non-finite camera at {frame}')
    for text in state['texts']:
        if text['alpha'] < .4:
            continue
        if re.search(r'[\u3400-\u9fff]', text['text']):
            non_english.append({'frame': frame, 'text': text['text']})
        if text['x'] < 0 or text['x'] + text['width'] > 1920 or text['y'] < 0 or text['y'] + text['height'] > 1080:
            outside.append({'frame': frame, **text})
for before, after in zip(states, states[1:]):
    if before['scene'] == after['scene']:
        continue
    delta = {key: after['camera'][key] - value for key, value in before['camera'].items()}
    boundaries.append({'frame': after['frame'], 'from': before['scene'], 'to': after['scene'], 'camera_delta': delta})
    if any(abs(value) > 1e-9 for value in delta.values()):
        errors.append(f'Camera discontinuity at scene boundary {after["frame"]}')
report = {'recorded_frames': len(states), 'expected_frames': timeline['duration_frames'],
          'timeline_is_final': not timeline['draft'], 'errors': errors,
          'visible_text_outside_frame': outside,
          'non_english_text': non_english,
          'scene_boundary_camera_continuity': boundaries,
          'scope': 'Geometry/text bounds from the rendered frame state; encoded pixel and visual reviews are separate.'}
(ROOT / 'review/render-validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'frames': len(states), 'errors': len(errors), 'text_bounds_findings': len(outside), 'non_english_text': len(non_english)}))
if errors or outside or non_english or timeline['draft']:
    raise SystemExit(1)
