"""Synthesize an original small-instrument score and scene-synchronous foley."""
import json,math
from pathlib import Path
import numpy as np
from scipy.signal import butter,sosfilt,resample_poly
import soundfile as sf
ROOT=Path(__file__).resolve().parents[1];SR=48000
T=json.loads((ROOT/'content/timeline.json').read_text());N=math.ceil(T['total_frames']/24*SR)
voice=np.zeros(N,dtype=np.float32);music=np.zeros((N,2),np.float32);foley=np.zeros((N,2),np.float32);rng=np.random.default_rng(6123)
def place(target,wave,at,gain=1,pan=0):
 i=round(at*SR);wave=np.asarray(wave);n=min(len(wave),len(target)-i)
 if n<=0:return
 if target.ndim==1:target[i:i+n]+=wave[:n]*gain
 else:
  target[i:i+n,0]+=wave[:n]*gain*math.sqrt((1-pan)/2)
  target[i:i+n,1]+=wave[:n]*gain*math.sqrt((1+pan)/2)
def tone(freq,dur,kind='wood'):
 t=np.arange(round(dur*SR))/SR
 if kind=='pluck':
  y=sum(np.sin(2*np.pi*freq*k*t+.2*k)*np.exp(-t*(1.5+k*.35))/(k**1.35) for k in range(1,9))
  return y*np.minimum(1,t/.006)*.13
 if kind=='bell':return (np.sin(2*np.pi*freq*t)*np.exp(-t*2)+.24*np.sin(2*np.pi*freq*2.76*t)*np.exp(-t*5))*(1-np.exp(-t*90))*.09
 return (np.sin(2*np.pi*freq*t)*np.exp(-t*30)+rng.normal(0,.17,len(t))*np.exp(-t*50))*.12
for sc in T['scenes']:
 for line in sc['lines']:
  a,sr=sf.read(ROOT/line['wav']);a=resample_poly(a,SR,sr)
  a=sosfilt(butter(2,80,fs=SR,btype='highpass',output='sos'),a)
  a=sosfilt(butter(2,8200,fs=SR,btype='lowpass',output='sos'),a)
  rms=np.sqrt(np.mean(a*a));a*=min(3,.115/max(.01,rms));a=np.tanh(a*1.1)/1.1
  place(voice,a,line['start']/24)
# A restrained pentatonic melody, acoustic plucks and occasional music-box answers.
chords=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[55,62,67,71]]
melody=[72,76,79,76,74,72,69,67,72,74,76,79,81,79,76,72]
end=T['total_frames']/24
for beat,at in enumerate(np.arange(.5,end-6,.88)):
 ch=chords[(beat//8)%4];note=ch[beat%len(ch)];freq=440*2**((note-69)/12)
 place(music,tone(freq,2.5,'pluck'),at,.38,-.22)
 if beat%2==0:
  note=melody[(beat//2)%len(melody)];place(music,tone(440*2**((note-69)/12),2,'bell'),at+.05,.32,.25)
 if beat%4==2:place(music,tone(160,.1),at,.13,-.2)
# Gentle room reflections only in score, never in dialogue.
for offset,gain in [(int(.061*SR),.18),(int(.113*SR),.11)]:music[offset:]+=music[:-offset,::-1].copy()*gain
for sc in T['scenes']:
 start=sc['start']/24;duration=(sc['end']-sc['start'])/24
 if sc['scene'] in ['walk','pack']:
  for i,at in enumerate(np.arange(start+.3,start+duration-.3,.52)):place(foley,tone(160 if i%2 else 190,.15),at,.4,(i%2-.5)*.3)
 if sc['scene']=='milk':
  for at in np.arange(start+1,start+duration-1,.55):place(foley,tone(1200,.15,'bell'),at,.33,-.15)
 if sc['scene']=='pull':
  cue=json.loads((ROOT/'content/action-cues.json').read_text())['pull'];place(foley,tone(430,.18),start+cue['carrot_pop_frame']/24,1.1,-.2)
 if sc['scene']=='pick':
  for at in [start+duration/3*.98,start+duration*2/3*.98,start+duration*.97]:place(foley,tone(260,.18),at,.6,.1)
 if sc['scene'] in ['farm','animals','end']:
  d=2.7 if sc['scene']!='end' else 1.2;t=np.arange(round(d*SR))/SR;noise=rng.normal(0,1,len(t));noise=sosfilt(butter(1,[600,4800],fs=SR,btype='bandpass',output='sos'),noise)
  env=np.sin(np.pi*np.minimum(1,t/d))*(.6+.4*np.sin(t*31)**2)
  place(foley,noise*env*.016,start+(.1 if sc['scene']!='end' else duration*.6),1,-.3)
 if sc['scene']=='nap':music[round((start+duration*.55)*SR):round((start+duration*.8)*SR)]*=.12
# Duck with voiced envelope, including a short release.
env=np.maximum.accumulate(np.zeros(1)) if N==0 else np.abs(voice)
env=sosfilt(butter(1,2.5,fs=SR,output='sos'),env);duck=1-.72*np.clip(env/.035,0,1);music*=duck[:,None]
fade=np.minimum(1,np.arange(N)/(SR*1.2))*np.minimum(1,np.arange(N)[::-1]/(SR*2.5));music*=fade[:,None]
# Final tiny cadence followed by a held paper end page.
for j,note in enumerate([72,76,79,84]):place(music,tone(440*2**((note-69)/12),2.8,'bell'),end-5+j*.28,.5,.1)
stereo=np.stack([voice,voice],axis=1)*.78+music+foley
peak=float(np.max(np.abs(stereo)));stereo*=min(1,.89/max(peak,1e-9))
for name,data in [('narration',voice),('music',music),('foley',foley),('mix',stereo)]:sf.write(ROOT/f'media/{name}.wav',data,SR,subtype='PCM_24')
(ROOT/'review/audio-mix.json').write_text(json.dumps({'sample_rate':SR,'samples':N,'duration':N/SR,'peak_before_scale':peak,'peak_after_scale':float(np.max(np.abs(stereo))),'voice_lines':sum(len(s['lines'])for s in T['scenes']),'original_music':True,'listening_review':False},indent=2))
print('Mixed',N/SR,'seconds; peak',peak)
