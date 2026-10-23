"""Original cool-jazz score, material foley and natural-speed speech mix."""
import os

import json
import math
from pathlib import Path
os.environ['PATH']=str(Path(__file__).resolve().parent/'bin')+os.pathsep+os.environ['PATH']
import subprocess
import wave
import numpy as np
from scipy.signal import butter, sosfilt

ROOT=Path(__file__).resolve().parents[1]
SR=48000
RNG=np.random.default_rng(221022)

def readwav(path):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','1','-ar',str(SR),'-'])
    return np.frombuffer(raw,dtype='<f4').copy()
def writewav(path,a):
    a=np.clip(a,-1,1)
    with wave.open(str(path),'wb') as w:
        w.setnchannels(a.shape[1] if a.ndim==2 else 1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((a*32767).astype('<i2').tobytes())
def hz(m):return 440*2**((m-69)/12)
def oscillator(note,duration,kind):
    t=np.arange(int(SR*duration))/SR;f=hz(note)
    if kind=='vibes':
        # Struck metal-bar modes, fast upper-partial decay and rotating motor.
        x=(np.sin(2*np.pi*f*t)*np.exp(-t/1.35)+.32*np.sin(2*np.pi*f*3.98*t)*np.exp(-t/.18)+.10*np.sin(2*np.pi*f*9.8*t)*np.exp(-t/.06))
        x*=1-np.exp(-t/.003);x*=.88+.12*np.cos(2*np.pi*5.4*t)
    elif kind=='bass':
        x=(np.sin(2*np.pi*f*t)+.40*np.sin(2*np.pi*f*2*t)+.16*np.sin(2*np.pi*f*3*t))
        x*=np.exp(-t/.27)*(1-np.exp(-t/.002))
        x+=sosfilt(butter(2,1100,fs=SR,output='sos'),RNG.normal(0,1,len(t)))*np.exp(-t/.014)*.12
    else:
        phase=2*np.pi*f*t+.007*f*np.sin(2*np.pi*5.3*t)*np.minimum(t/.3,1)
        x=np.sin(phase)+.16*np.sin(phase*2)+.065*np.sin(phase*3)
        breath=sosfilt(butter(2,[800,5500],btype='bandpass',fs=SR,output='sos'),RNG.normal(0,1,len(t)))
        x=(x+breath*.035)*(1-np.exp(-t/.04))*np.minimum(1,(duration-t)/.12)
    x*=np.minimum(1,(duration-t)/.025)
    return x.astype(np.float32)
def noise(duration,kind):
    t=np.arange(int(SR*duration))/SR;n=RNG.normal(0,1,len(t))
    if kind=='brush':return (sosfilt(butter(2,[1800,8000],btype='bandpass',fs=SR,output='sos'),n)*np.exp(-t/.08)*(1-np.exp(-t/.003))*.24).astype(np.float32)
    if kind=='swish':return (sosfilt(butter(2,[450,4400],btype='bandpass',fs=SR,output='sos'),n)*np.sin(np.pi*t/duration)**2*.25).astype(np.float32)
    if kind=='click':return ((np.sin(2*np.pi*(950*t-500*t*t))*.5+n*.15)*np.exp(-t/.012)).astype(np.float32)
    if kind=='stamp':return ((np.sin(2*np.pi*115*t)*.55+n*.12)*np.exp(-t/.035)).astype(np.float32)
    return (sosfilt(butter(2,[300,2800],btype='bandpass',fs=SR,output='sos'),n)*np.sin(np.pi*t/duration)**2*.16).astype(np.float32)

def main():
    tl=json.loads((ROOT/'content/timeline.json').read_text())
    if tl['draft']:raise ValueError('Final sound requires actual voice timing')
    n=round(tl['duration_frames']/tl['fps']*SR);music=np.zeros((n,2),np.float32);foley=np.zeros_like(music);voice=np.zeros_like(music)
    def add(track,data,seconds,gain=1,pan=0):
        start=round(seconds*SR)
        if start<0:data=data[-start:];start=0
        data=data[:max(0,n-start)]
        if not len(data):return
        track[start:start+len(data),0]+=data*gain*math.sqrt((1-pan)/2)
        track[start:start+len(data),1]+=data*gain*math.sqrt((1+pan)/2)
    beat=60/tl['bpm'];chords=[[60,64,67,69],[62,65,69,72],[59,64,67,71],[60,64,67,69],[57,60,64,67],[62,65,69,72],[59,62,65,69],[60,64,67,71]]
    roots=[36,38,40,36,33,38,43,36]
    motif=[0,2,3,2,1,0,2,1,3,2,0,1,2,1,0,2]
    bars=int(n/SR/(4*beat))+1
    for bar in range(bars):
        base=bar*4*beat
        chapter=max((i for i,c in enumerate(tl['chapters']) if c['seconds']<=base),default=0)
        # Different density and register across the seven chapters.
        density=[1.0,.68,.78,.82,.88,.72,1.05][chapter%7]
        transpose=[0,0,5,0,5,0,0][chapter%7]
        chord=[note+transpose for note in chords[(bar+chapter*2)%8]]
        # Spacious offbeat voicings leave room for the instructor.
        for onset in ([.0,2.65] if chapter in [1,3,5] else [.0,1.62,3.0]):
            for j,note in enumerate(chord):add(music,oscillator(note,1.6,'vibes'),base+(onset+j*.017)*beat,.024*density,(-.28))
        for b,interval in enumerate([0,7,12,4 if bar%2==0 else 2]):
            if chapter in [1,5] and b%2:continue
            add(music,oscillator(roots[(bar+chapter*2)%8]+transpose+interval,.46,'bass'),base+b*beat,.080*density,.08)
        for b in range(4):
            add(music,noise(.24,'brush'),base+b*beat,(.05 if b%2 else .03)*density,.4)
            if b%2:add(music,noise(.16,'brush'),base+(b+.63)*beat,.022,.3)
        if bar%8 in ([0] if chapter in [1,3,5] else [0,4]):
            for j,onset in enumerate([.0,.68,1.5,2.65]):
                note=chord[motif[(bar+j)%16]]+12
                add(music,oscillator(note,.27 if j<3 else .48,'flute'),base+onset*beat,.023*density,-.18)
    # A small room, no long wash across the narration.
    for delay,gain in [(.047,.14),(.097,.08),(.151,.04)]:
        shift=int(SR*delay);music[shift:]+=music[:-shift,::-1].copy()*gain
    envelopes=np.ones(n,np.float32)
    for s in tl['shots']:
        if not s.get('audio'):continue
        x=readwav(ROOT/s['audio'])
        active=x[np.abs(x)>.02];rms=float(np.sqrt(np.mean(active*active))) if len(active) else .1
        gain=min(2.4,.125/max(rms,.025))
        # Short fades only; no tempo alteration, content repair or tail replacement.
        ramp=min(240,len(x)//2);x[:ramp]*=np.linspace(0,1,ramp);x[-ramp:]*=np.linspace(1,0,ramp)
        add(voice,x,s['voice_start']/24,gain,0)
        st=max(0,round((s['voice_start']/24-.18)*SR));end=min(n,round((s['voice_start']/24+len(x)/SR+.22)*SR));envelopes[st:end]=np.minimum(envelopes[st:end],.40)
    # Smooth the side-chain transitions over a tenth of a second.
    envelopes=sosfilt(butter(1,8,fs=SR,output='sos'),envelopes)
    music*=envelopes[:,None]
    for e in tl['events']:
        kind=e['kind'];add(foley,noise(.28 if kind in ['paper','swish'] else .10,kind),e['frame']/24,.16 if kind=='swish' else .22,.1)
    for s in tl['shots']:
        if s['scene']=='step2':
            a=max(0,round((s['action']/24-.28)*SR));b=round(s['action']/24*SR);music[a:b]=0;foley[a:b]=0
    # The viewer's explanation hold has room tone only after the voice ends.
    for shot in tl['shots']:
        if shot.get('hold',0):
            a=round((shot['voice_start']/24+shot['voice_duration']+.18)*SR)
            b=round(shot['end']/24*SR)
            fade=min(round(.35*SR),max(0,b-a))
            music[a:a+fade]*=np.linspace(1,0,fade)[:,None]
            music[a+fade:b]=0
    music[:int(1.36*SR)]=0
    fade=min(n,SR);music[:fade]*=np.linspace(0,1,fade)[:,None];music[-SR*2:]*=np.linspace(1,0,SR*2)[:,None]
    master=voice+music+foley
    peak=float(np.max(np.abs(master)))
    if peak>.96:master*=.96/peak
    for name,data in [('narration',voice),('original-score',music),('foley',foley),('mix-master',master)]:writewav(ROOT/f'media/{name}.wav',data)
    (ROOT/'review/audio-mix.json').write_text(json.dumps({'sample_rate':SR,'samples':n,'duration':n/SR,'pre_normalization_peak':peak,'speech_speed':1.0,'composition':'Original 132 BPM vibraphone, flute, pizzicato bass, brush score; physically modeled oscillators and deterministic noise. Seven chapter arrangements vary density, register and flute phrases; the explanation hold falls silent. No reference audio reused.','listening_status':'Audio input unavailable to this model. Signal and transcription review are separate from listening.'},indent=2))
    print(json.dumps({'samples':n,'seconds':n/SR,'peak':peak}))
if __name__=='__main__':main()
