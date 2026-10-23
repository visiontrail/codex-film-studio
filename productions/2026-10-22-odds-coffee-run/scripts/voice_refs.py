"""Build voice-study excerpts from the user-supplied synthetic-character reference."""
import json,wave,hashlib
from pathlib import Path
import numpy as np
from scipy.signal import butter,sosfilt
ROOT=Path(__file__).resolve().parents[1]
with wave.open(str(ROOT/'reference/coffee-run-audio.wav'),'rb') as w:sr=w.getframerate();audio=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float32)/32768
segments={'qin':[(7.72,9.20),(14.91,16.72),(38.32,40.20),(45.90,47.86),(50.25,52.10)],'bo':[(2.32,5.60),(23.90,27.00),(33.78,35.34),(42.10,43.80)]};out=ROOT/'media/voice-study';out.mkdir(parents=True,exist_ok=True)
for speaker,ranges in segments.items():
 pieces=[]
 for lo,hi in ranges:
  chunk=audio[round(lo*sr):round(hi*sr)].copy();edge=round(.012*sr);chunk[:edge]*=np.linspace(0,1,edge);chunk[-edge:]*=np.linspace(1,0,edge);pieces.extend([chunk,np.zeros(round(.08*sr))])
 y=np.concatenate(pieces);y=sosfilt(butter(3,[110,7200],btype='bandpass',fs=sr,output='sos'),y);y*=min(1,.8/np.max(np.abs(y)))
 file=out/f'{speaker}-reference.wav'
 with wave.open(str(file),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((y*32767).astype('<i2').tobytes())
 (out/f'{speaker}-reference.json').write_text(json.dumps({'source':'User-supplied Coffee Run, LemoLab, CC BY 4.0; synthetic fictional character voice','ranges_seconds':ranges,'processing':'Mono 24 kHz, 12 ms edge fades, 110–7200 Hz bandpass; no tempo or pitch change','sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'status':'voice audition reference, not accepted final dialogue'},indent=2))
 print(speaker,len(y)/sr)
