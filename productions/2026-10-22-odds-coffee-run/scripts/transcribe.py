"""Independent Whisper check with real word timestamps; never give it the script."""
import argparse,hashlib,json,time,wave,re,math,os
from pathlib import Path
import numpy as np
from scipy.signal import resample_poly
import mlx_whisper
ROOT=Path(__file__).resolve().parents[1]
MODEL=os.environ.get('WHISPER_MODEL',str(Path.home()/'.cache/huggingface/hub/models--mlx-community--whisper-large-v3-turbo-q4/snapshots/660c343bbf4e52ac257f0b7d952e5388e6f93bef'))
p=argparse.ArgumentParser();p.add_argument('--watch',action='store_true');p.add_argument('--audio-dir',default='media/speech');p.add_argument('--output-dir',default='review/asr');a=p.parse_args()
out=ROOT/a.output_dir;out.mkdir(parents=True,exist_ok=True)
while True:
 count=0
 for wav in sorted((ROOT/a.audio_dir).glob('L*.wav')):
  dest=out/(wav.stem+'.json');sha=hashlib.sha256(wav.read_bytes()).hexdigest()
  if dest.exists() and json.loads(dest.read_text()).get('sha256')==sha:count+=1;continue
  with wave.open(str(wav),'rb') as f:
   sr=f.getframerate();channels=f.getnchannels();data=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(np.float32)/32768
  if channels>1:data=data.reshape(-1,channels).mean(1)
  data=resample_poly(data,16000//math.gcd(sr,16000),sr//math.gcd(sr,16000)).astype(np.float32)
  result=mlx_whisper.transcribe(data,path_or_hf_repo=MODEL,language='en',word_timestamps=True,condition_on_previous_text=False,temperature=0,verbose=False)
  result.update(sha256=sha,model=MODEL,source=str(wav),prompt_used=False)
  dest.write_text(json.dumps(result,indent=2));print(wav.stem,result['text'],flush=True);count+=1
 if not a.watch or count>=51:break
 time.sleep(15)
