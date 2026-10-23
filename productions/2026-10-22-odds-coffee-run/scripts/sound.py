"""Original synthesized score/foley; frame-timed natural-speed dialogue; no FFmpeg."""
import argparse,json,math,wave
from pathlib import Path
import numpy as np
from scipy.signal import resample_poly, butter, sosfilt
from scipy.ndimage import uniform_filter1d
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--draft',action='store_true');p.add_argument('--seconds',type=float);a=p.parse_args()
timeline=json.loads((ROOT/'content/timeline.json').read_text());sr=48000;fps=timeline['fps'];duration=a.seconds or timeline['duration_frames']/fps;n=math.ceil(duration*sr);rng=np.random.default_rng(771)
speech=np.zeros((n,2),np.float32);music=np.zeros_like(speech);fx=np.zeros_like(speech);duck=np.ones(n,np.float32);reports=[]
def add(dst,data,start,amp=1,pan=0):
 i=round(start*sr);skip=max(0,-i);i=max(0,i);data=data[skip:skip+max(0,n-i)]
 if not len(data):return
 dst[i:i+len(data),0]+=data*amp*math.sqrt((1-pan)/2);dst[i:i+len(data),1]+=data*amp*math.sqrt((1+pan)/2)
def tone(freq,dur,kind='pluck'):
 t=np.arange(round(dur*sr))/sr
 if kind=='bass':s=np.sin(2*np.pi*freq*t)+.25*np.sin(4*np.pi*freq*t);e=(1-np.exp(-t*120))*np.exp(-t*7)
 elif kind=='theremin':s=np.sin(2*np.pi*freq*t+.07*np.sin(2*np.pi*5.6*t));e=np.sin(np.pi*np.minimum(t/dur,1))**.7
 elif kind=='bell':s=np.sin(2*np.pi*freq*t)+.4*np.sin(2*np.pi*freq*2.76*t);e=np.exp(-t*9)*(1-np.exp(-t*500))
 else:s=np.sin(2*np.pi*freq*t)+.3*np.sin(4*np.pi*freq*t)+.15*np.sin(6*np.pi*freq*t);e=np.exp(-t*13)*(1-np.exp(-t*350))
 return (s*e).astype(np.float32)
def hz(m):return 440*2**((m-69)/12)
for cue in timeline['cues']:
 if not cue.get('text'):continue
 path=ROOT/'media/speech'/f"{cue['id']}.wav"
 if not path.exists():
  if a.draft:continue
  raise FileNotFoundError(path)
 with wave.open(str(path),'rb') as f:
  old=f.getframerate();ch=f.getnchannels();samples=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(np.float32)/32768
 if ch>1:samples=samples.reshape(-1,ch).mean(1)
 samples=resample_poly(samples,sr//math.gcd(sr,old),old//math.gcd(sr,old)).astype(np.float32)
 samples=sosfilt(butter(2,70,btype='highpass',fs=sr,output='sos'),samples).astype(np.float32)
 active=samples[np.abs(samples)>.015];rms=np.sqrt(np.mean(active**2)) if len(active) else .01
 gain=min(2.8,.16/max(rms,.001));samples*=gain
 # Soft knee on rare transient peaks; preserve formants and natural duration.
 high=np.abs(samples)>.7;samples[high]=np.sign(samples[high])*(.7+.2*np.tanh((np.abs(samples[high])-.7)/.2))
 start=cue['start']/fps;add(speech,samples,start,1,(-.08 if cue['speaker']=='bo' else .08))
 lo=max(0,round((start-.1)*sr));hi=min(n,round((start+len(samples)/sr+.22)*sr));duck[lo:hi]=.45
 reports.append({'id':cue['id'],'seconds':len(samples)/sr,'gain_db':round(float(20*np.log10(gain)),2),'peak':float(np.max(np.abs(samples)))})
# Original 120 BPM theme: muted bass, tiny arpeggios, a restrained theremin motif.
beat=60/120;roots={'home':38,'odds':41,'parlay':43,'pool':36,'attention':38,'stadium':40,'legal':41,'underground':38}
world_ranges=[]
for shot in timeline['shots']:
 if world_ranges and world_ranges[-1][0]==shot['world'] and world_ranges[-1][2]==shot['start']:world_ranges[-1][2]=shot['end']
 else:world_ranges.append([shot['world'],shot['start'],shot['end']])
for world,first,last in world_ranges:
 st=first/fps;en=min(last/fps,duration);root=roots[world];k=0
 while st+k*beat<en:
  at=st+k*beat
  add(music,tone(hz(root+([0,0,7,0,0,10,7,0][k%8])),.42,'bass'),at,.05)
  if k%2==0:
   for j in range(2):add(music,tone(hz(root+24+[0,3,7,10,7,3,12,7][(k+j)%8]),.21),at+j*beat/2,.025,(-.4 if j else .4))
  if k%8 in [0,3,6]:add(music,tone(hz(root+36+[7,3,0][[0,3,6].index(k%8)]),beat*.84,'theremin'),at,.022,.2)
  tt=np.arange(int(.1*sr))/sr
  if k%2==0:kick=np.sin(2*np.pi*(70*tt+2*np.exp(-tt*35)))*np.exp(-tt*45);add(music,kick,at,.035)
  else:rim=rng.normal(0,1,len(tt))*np.exp(-tt*140);add(music,rim,at,.018,-.2)
  k+=1
# Event cues come from the frame edit, never hand-entered approximate timecodes.
for shot in timeline['shots']:
 at=shot['start']/fps
 cue=next((c for c in timeline['cues'] if c.get('id')==shot.get('line')),{});cue_at=cue.get('start',shot['start'])/fps;beats=cue.get('beats',{})
 if at>=duration:continue
 if shot['kind']=='departure':
  tt=np.arange(int(1.3*sr))/sr;env=np.sin(np.pi*np.minimum(tt/1.3,1))**1.5;wh=rng.normal(0,1,len(tt));wh=sosfilt(butter(2,1800,fs=sr,output='sos'),wh);portal=(.18*wh+.1*np.sin(2*np.pi*(80*tt+450*tt**2)))*env;add(fx,portal,at,.45)
 if shot['kind']=='arrival':
  tt=np.arange(int(.18*sr))/sr;add(fx,np.sin(2*np.pi*70*tt)*np.exp(-tt*28),at+.65,.13)
 if shot.get('shot')=='coins':
  for j,offset in enumerate([.6,1.3,beats.get('payout',2.6)+.25,beats.get('keep',3.7)+.1]):add(fx,tone(1250+j%3*230,.22,'bell'),cue_at+offset,.065,j%2*.4-.2)
 if shot.get('shot')=='gates':
  begin=beats.get('run',1.05);end=beats.get('crash',4.45)
  for j in range(2):add(fx,tone(620+j*260,.18,'bell'),cue_at+begin+(end-begin)*(j+1)/3,.06)
  tt=np.arange(int(.24*sr))/sr;impact=(np.sin(2*np.pi*(115*tt-90*tt**2))+.12*rng.normal(0,1,len(tt)))*np.exp(-tt*20);add(fx,impact,cue_at+end,.14,.15)
 if shot.get('line') in ['L021','L023']:
  offsets=[.15,beats.get('try1',1.2),beats.get('try2',2.6)] if shot.get('line')=='L023' else [.4,1.,1.6]
  for j,offset in enumerate(offsets):add(fx,tone(880+j*220,.13,'bell'),cue_at+offset,.055,.3)
 if shot.get('shot')=='debt':
  tt=np.arange(int(.4*sr))/sr;add(fx,rng.normal(0,1,len(tt))*np.exp(-tt*20),at+.6,.055,.3)
 if shot['kind']=='cold':
  for j in range(4):add(fx,tone(480-j*30,.15,'bell'),at+.1+j*.35,.06,-.4)
  for landing in [16,37]:add(fx,tone(1480,.09,'bell'),at+landing/fps,.025,-.4)
 if shot['kind']=='title':
  for j in range(4):add(fx,tone(hz(57+[0,3,7,12][j]),.4),at+j*.12,.09,j*.2-.3)
# Clean comedic silence after the reveal: only a very quiet room bed remains.
for c in timeline['cues']:
 if c.get('id')=='L048':
  lo=min(n,round(c['end']/fps*sr));hi=min(n,round((c['end']+65)/fps*sr));music[lo:hi]=0;fx[lo:hi]=0
# Smooth duck envelope without introducing a new delay.
attack=int(.03*sr);duck=uniform_filter1d(duck,attack);music*=duck[:,None]
room=(np.sin(np.arange(n)/sr*2*np.pi*60)*.00025).astype(np.float32);fx+=room[:,None]
fade=min(n,int(.6*sr));music[:fade]*=np.linspace(0,1,fade)[:,None];music[-fade:]*=np.linspace(1,0,fade)[:,None]
mix=speech+music+fx;peak=float(np.max(np.abs(mix)));master_gain=min(1,.89/max(peak,1e-8));mix*=master_gain
out=ROOT/'media/audio';out.mkdir(parents=True,exist_ok=True)
def write(name,data):
 with wave.open(str(out/name),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
write('mix-draft.wav' if a.draft else 'mix.wav',mix)
if not a.draft:
 write('speech.wav',speech);write('score.wav',music);write('foley.wav',fx)
(ROOT/'review/audio-mix.json').write_text(json.dumps({'duration':duration,'sample_rate':sr,'peak_before_gain':peak,'master_gain':master_gain,'speech':reports,'provenance':json.loads((ROOT/'content/accepted-takes.json').read_text())['engine']+' dialogue; original mathematical synthesis for score and sound effects. No speech tempo change.'},indent=2))
print('Mixed',duration,'seconds; peak',round(float(np.max(np.abs(mix))),4),'speech cues',len(reports))
