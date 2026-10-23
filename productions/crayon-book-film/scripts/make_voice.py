"""Original narration; each accepted WAV is cached by exact text/voice/speed."""
import hashlib, json, math
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
ROOT=Path(__file__).resolve().parents[1]
SR=24000; FPS=24
voice={'narrator':('af_heart',.9),'leo':('am_michael',.94),'jojo':('af_bella',.96)}
engine=Kokoro(str(ROOT/'media/models/kokoro-v1.0.onnx'),str(ROOT/'media/models/voices-v1.0.bin'))
(ROOT/'media/voice').mkdir(exist_ok=True)
scenes=json.loads((ROOT/'content/story.json').read_text()); timeline=[]; cursor=0
for scene in scenes:
    local=24 if scene['id']!='opening' else 42
    lines=[]
    for speaker,text in scene['lines']:
        name,speed=voice[speaker]
        key=hashlib.sha256(f'{text}|{name}|{speed}'.encode()).hexdigest()[:16]
        path=ROOT/f'media/voice/{key}.wav'
        if not path.exists():
            samples,rate=engine.create(text,voice=name,speed=speed,lang='en-us')
            sf.write(path,samples,rate,subtype='PCM_16')
        samples,rate=sf.read(path)
        assert rate==SR
        duration=math.ceil(len(samples)/SR*FPS)
        lines.append(dict(speaker=speaker,text=text,start=cursor+local,end=cursor+local+duration,wav=str(path.relative_to(ROOT))))
        local+=duration+14
        print(scene['id'],speaker,duration/FPS,flush=True)
    length=max(round(scene['min']*FPS),local+28)
    timeline.append(dict(id=scene['id'],scene=scene['scene'],start=cursor,end=cursor+length,lines=lines))
    cursor+=length
result=dict(fps=FPS,width=1920,height=1080,total_frames=cursor,scenes=timeline,voices=voice)
(ROOT/'content/timeline.json').write_text(json.dumps(result,indent=2)+'\n')
print('TOTAL',cursor,'frames',cursor/FPS,'seconds')
