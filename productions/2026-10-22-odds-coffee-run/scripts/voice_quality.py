"""Signal diagnostics for raw takes; not a substitute for listening or ASR."""
import argparse,json,math
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfilt,resample_poly,correlate,find_peaks

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('directory');p.add_argument('--out',default='review/voice-signals.json');a=p.parse_args()
def measure(path):
 data,sr=sf.read(path,dtype='float32');data=data.mean(axis=1) if data.ndim==2 else data
 peak=float(np.max(np.abs(data)));rms=float(np.sqrt(np.mean(data**2)));clipped=int(np.count_nonzero(np.abs(data)>=.9999))
 mono=resample_poly(data,8000//math.gcd(8000,sr),sr//math.gcd(8000,sr));mono=sosfilt(butter(3,[65,1000],btype='bandpass',fs=8000,output='sos'),mono)
 pitches=[];strengths=[];window=640;hop=160
 for i in range(0,len(mono)-window,hop):
  x=mono[i:i+window]
  if np.sqrt(np.mean(x*x))<.012:continue
  x=(x-x.mean())*np.hanning(window);corr=correlate(x,x,mode='full',method='fft')[window-1:];corr/=max(corr[0],1e-10);lo,hi=round(8000/350),round(8000/70)
  candidates,_=find_peaks(corr[lo:hi]);candidates=candidates+lo
  if not len(candidates):continue
  lag=candidates[np.argmax(corr[candidates])]
  if corr[lag]>.5:pitches.append(8000/lag);strengths.append(float(corr[lag]))
 return {'file':str(path),'seconds':len(data)/sr,'sample_rate':sr,'peak':round(peak,5),'rms_dbfs':round(20*math.log10(max(rms,1e-9)),2),'clipped_samples':clipped,'voiced_windows':len(pitches),'pitch_hz_quartiles':np.round(np.percentile(pitches,[25,50,75]),2).tolist() if pitches else [],'pitch_method':'80ms autocorrelation; strongest periodic peak, 70-350Hz. Music can bias reference measurements.'}
files=sorted((ROOT/a.directory).glob('*.wav'));result={'takes':[measure(p) for p in files],'reference':[measure(p) for p in sorted((ROOT/'media/voice-study').glob('*-reference.wav'))],'limitations':'Signal diagnostics and pitch estimates do not establish intelligibility, acting quality or perceptual voice identity.'}
out=ROOT/a.out;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
