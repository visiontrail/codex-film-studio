"""Original 100 BPM telemetry score, event foley and a voice-led stereo mix."""
import json
import pathlib
import wave
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly

ROOT=pathlib.Path(__file__).resolve().parents[1]
RATE=48000
timeline=json.loads((ROOT/'content/timeline.json').read_text())
N=round(timeline['duration_frames']/timeline['fps']*RATE)
rng=np.random.default_rng(20261022)
music=np.zeros((N,2),np.float32);fx=np.zeros_like(music);voice=np.zeros_like(music)


def place(bus,signal,second,gain=1,pan=0):
    start=round(second*RATE)
    if start<0:signal=signal[-start:];start=0
    count=min(len(signal),len(bus)-start)
    if count<=0:return
    mono=np.asarray(signal[:count])*gain
    bus[start:start+count,0]+=mono*np.sqrt((1-pan)/2)
    bus[start:start+count,1]+=mono*np.sqrt((1+pan)/2)


def env(t,attack=.02,release=3):return (1-np.exp(-t/attack))*np.exp(-t/release)
def ping(hz=1174.66,length=.65):
    t=np.arange(round(length*RATE))/RATE
    return np.sin(2*np.pi*hz*t+1.4*np.sin(2*np.pi*hz*2*t)*np.exp(-t*20))*env(t,.002,.16)
def hit(length=1.3):
    t=np.arange(round(length*RATE))/RATE
    drum=np.sin(2*np.pi*(68*t+18*(1-np.exp(-t*24))/24))*env(t,.002,.18)
    noise=sosfilt(butter(2,[500,4800],btype='bandpass',fs=RATE,output='sos'),rng.standard_normal(len(t)))*np.exp(-t*32)
    brass=np.zeros(len(t))
    for freq in [73.416,110,146.832]:
        for h in range(1,14):brass+=np.sin(2*np.pi*freq*h*t)*np.exp(-h*.15)/h
    return drum*.65+noise*.25+brass*.09*env(t,.035,.26)
def sweep(length=1.1,up=True):
    t=np.arange(round(length*RATE))/RATE;noise=rng.standard_normal(len(t))
    noise=sosfilt(butter(2,[300,4800],btype='bandpass',fs=RATE,output='sos'),noise)
    shape=np.sin(np.pi*t/length)**2
    tone=np.sin(2*np.pi*(150*t+(250 if up else -70)*t*t/length))
    return noise*shape*.65+tone*shape*.05


# Low, dark pad with mild stereo divergence. Notes change on camera sections.
for si,shot in enumerate(timeline['shots']):
    start=shot['start']/24;length=shot['duration']/24;t=np.arange(round((length+.8)*RATE))/RATE
    major=shot['scene'] in ('gardens','island','return','endcard')
    freqs=[146.832,185 if major else 174.614,220]
    pad=np.zeros(len(t))
    for f in freqs:
        pad+=(np.sin(2*np.pi*f*t)+.34*np.sin(2*np.pi*(f*1.003)*t)+.14*np.sin(2*np.pi*f*2*t))/3
    shape=np.minimum(1,t/.9)*np.minimum(1,np.maximum(0,(length+.8-t)/1.1))
    place(music,pad*shape,start,.023,-.22 if si%2 else .22)
    if shot['scene']!='endcard':
        place(fx,ping(),start+1.08,.065,-.35)
        place(fx,sweep(.72),start,.047)
    if shot['scene'] in ('bay','districts','sentosa'):
        place(fx,hit(),start+1.15,.21)
        # A brief intake of silence before each measured arrival.
        lo=max(0,round((start+.86)*RATE));hi=round((start+1.12)*RATE);music[lo:hi]*=.08
    if shot['scene'] in ('gardens','island'):
        for j,f in enumerate([587.33,440,554.37,739.99,659.25]):place(music,ping(f,1.5),start+1.2+j*.6,.024,(j-2)*.2)

duration=N/RATE
for beat in np.arange(0,duration,.6):
    t=np.arange(round(.32*RATE))/RATE
    pulse=(np.sin(2*np.pi*73.416*t)+.45*np.sin(2*np.pi*146.832*t)+.2*np.sin(2*np.pi*220.248*t))*env(t,.004,.055)
    place(music,pulse,beat,.021)
for tick in np.arange(.3,duration,.3):place(fx,ping(1760,.055),tick,.0055,-.55 if int(tick*10)%2 else .55)

for item in timeline['voices']:
    with wave.open(str(ROOT/item['file'])) as wav:
        rate=wav.getframerate();channels=wav.getnchannels();a=np.frombuffer(wav.readframes(wav.getnframes()),dtype='<i2').astype(np.float64)/32768
    if channels>1:a=a.reshape(-1,channels).mean(1)
    a=resample_poly(a,RATE,rate)
    a=sosfilt(butter(2,75,btype='highpass',fs=RATE,output='sos'),a)
    rms=np.sqrt(np.mean(a*a));gain=np.clip(.12/max(rms,.001),.75,2.1)
    place(voice,a,item['frame']/24,gain)

# Voice activity drives the music duck; narration is never time-stretched.
power=np.mean(voice**2,axis=1)
activity=np.sqrt(sosfilt(butter(1,3,fs=RATE,output='sos'),power).clip(0))
duck=1-.55*np.clip(activity/.035,0,1)
music*=duck[:,None]
mix=voice+music+fx
mix=sosfilt(butter(2,38,btype='highpass',fs=RATE,output='sos'),mix,axis=0)
fade=np.ones(N);fade[:24000]=np.linspace(0,1,24000);fade[-72000:]=np.linspace(1,0,72000)
mix*=fade[:,None]
peak=np.max(np.abs(mix));mix*=min(1,.78/peak)
report={'sample_rate':RATE,'frames':N,'seconds':N/RATE,'peak_before':float(peak),'peak_final':float(np.max(np.abs(mix))),'voice_count':len(timeline['voices']),'score':'Original deterministic synthesis, 100 BPM, D minor / D major','listening':'Not inferred from numerical checks'}
try:
    import pyloudnorm
    meter=pyloudnorm.Meter(RATE);lufs=meter.integrated_loudness(mix);report['lufs_before']=float(lufs)
    gain=min(10**((-15-lufs)/20),.84/max(np.max(np.abs(mix)),1e-9));mix*=gain
    report['lufs_final']=float(meter.integrated_loudness(mix));report['peak_final']=float(np.max(np.abs(mix)))
except ImportError:report['lufs_final']=None
with wave.open(str(ROOT/'media/mix.wav'),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(RATE);out.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
(ROOT/'review/mix-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
