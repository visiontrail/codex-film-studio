"""Chatterbox Turbo on Apple MLX; private source-bound auditions and resumable takes."""
import argparse,hashlib,json,time,wave,copy
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--wait',action='store_true');p.add_argument('--only',nargs='*',default=['L001','L002','L016']);p.add_argument('--all',action='store_true');p.add_argument('--output-dir',default='media/speech-local');p.add_argument('--seed-offset',type=int,default=0);a=p.parse_args()
model_dir=ROOT/'media/models/chatterbox-turbo-8bit';tokenizer=ROOT/'media/models/S3TokenizerV2/model.safetensors'
while not (model_dir/'model.safetensors').exists() or not tokenizer.exists():
 if not a.wait:raise RuntimeError('Verified model download not complete')
 time.sleep(15)
# Route this one immutable, locally verified dependency into the normal model loader.
import huggingface_hub
original_download=huggingface_hub.hf_hub_download
def local_dependency(*args,**kw):
 repo=kw.get('repo_id',args[0] if args else None);file=kw.get('filename',args[1] if len(args)>1 else None)
 if repo=='mlx-community/S3TokenizerV2' and file=='model.safetensors':return str(tokenizer)
 return original_download(*args,**kw)
huggingface_hub.hf_hub_download=local_dependency
import mlx.core as mx
from mlx_audio.tts.utils import load_model
import soundfile as sf
print('Loading Chatterbox Turbo 8-bit on Metal',flush=True);model=load_model(str(model_dir));print('Model loaded',flush=True)
conditions={};voice_hashes={}
for speaker in ['bo','qin']:
 ref=ROOT/'media/voice-study'/f'{speaker}-reference.wav';voice_hashes[speaker]=hashlib.sha256(ref.read_bytes()).hexdigest()
 refdata,sr=sf.read(ref,dtype='float32');model.prepare_conditionals(refdata,sample_rate=sr,norm_loudness=True);conditions[speaker]=copy.deepcopy(model._conds);print('Conditioned',speaker,flush=True)
out=ROOT/a.output_dir;out.mkdir(parents=True,exist_ok=True)
lines=json.loads((ROOT/'content/script.json').read_text())
for line in lines:
 if not a.all and line['id'] not in a.only:continue
 target=out/f"{line['id']}.wav";record=out/f"{line['id']}.json";seed=83+int(line['id'][1:])+a.seed_offset
 identity={'text':line['text'],'speaker':line['speaker'],'reference_sha256':voice_hashes[line['speaker']],'model_sha256':'cbfe447b04d11bb2d877f1305c37945ca109ffcf74a982a533e4baa40f273ba2','tokenizer_sha256':'928726bc1f206a613d36b8f49e297eae9c5593a21bf9b92ddfe2c23f85eb92cc','seed':seed,'temperature':.75,'top_p':.95,'repetition_penalty':1.2,'model':'mlx-community/chatterbox-turbo-8bit','runtime':'mlx-audio 0.6.1 / MLX 0.32.4'}
 key=hashlib.sha256(json.dumps(identity,sort_keys=True).encode()).hexdigest()
 if record.exists() and target.exists():
  old=json.loads(record.read_text())
  if old['identity_sha256']!=key:raise RuntimeError('Changed identity; preserve before replacement '+line['id'])
  print(line['id'],'cached',flush=True);continue
 mx.random.seed(seed);model._conds=copy.deepcopy(conditions[line['speaker']]);start=time.monotonic();pieces=[]
 for result in model.generate(text=line['text'],temperature=.75,top_p=.95,repetition_penalty=1.2,max_tokens=1000,split_pattern=None):
  pieces.append(np.asarray(result.audio,dtype=np.float32));sr=result.sample_rate
 data=np.concatenate(pieces);temporary=out/f".{line['id']}.tmp.wav";sf.write(temporary,data,sr,subtype='PCM_16');temporary.replace(target);record.write_text(json.dumps({'identity':identity,'identity_sha256':key,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'duration':len(data)/sr,'generation_seconds':time.monotonic()-start,'status':'unaccepted audition'},indent=2));print(line['id'],'generated',round(len(data)/sr,2),'audio seconds in',round(time.monotonic()-start,2),'seconds',flush=True);mx.clear_cache()
