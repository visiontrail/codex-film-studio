"""Independent, resumable Chatterbox client. No application task or pipeline writes."""
import argparse, hashlib, json, os, sys, time, urllib.request, uuid, wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--limit',type=int);p.add_argument('--only',nargs='*');p.add_argument('--output-dir',default='media/speech-remote');a=p.parse_args()
# Read existing configured service credentials in memory only.
service_repo=os.environ.get('CHATTERBOX_CONFIG_REPO','/Volumes/TP-1TB/WorspacePlus/IslaProject/FrontierTechSN')
sys.path.insert(0,service_repo)
from backend import config
base=config.CHATTERBOX_TTS_URL; headers={'X-API-Key':config.CHATTERBOX_TTS_API_KEY}
out=ROOT/a.output_dir;out.mkdir(parents=True,exist_ok=True)
private=ROOT/'media'/'provider';private.mkdir(parents=True,exist_ok=True)
def save(p,d):
 temp=p.with_suffix('.tmp');temp.write_text(json.dumps(d,ensure_ascii=False,indent=2));temp.replace(p)
def req(path,payload=None,key=None):
 hs=dict(headers)
 if payload is not None: hs['Content-Type']='application/json'
 if key: hs['Idempotency-Key']=key
 data=None if payload is None else json.dumps(payload).encode()
 with urllib.request.urlopen(urllib.request.Request(base+path,data=data,headers=hs),timeout=60) as r:return r.read()
cap=json.loads(req('/v1/capabilities'));save(private/'capabilities.json',cap)
lines=json.loads((ROOT/'content/script.json').read_text())
if a.only:lines=[x for x in lines if x['id'] in a.only]
if a.limit:lines=lines[:a.limit]
for line in lines:
 remote_voice={'bo':'jane','qin':'default'}[line['speaker']]
 payload={'text':line['text'],'language_id':'en','voice':remote_voice,'seed':83,'exaggeration':0.5,'cfg_weight':0.5,'temperature':0.8,'repetition_penalty':2.0,'min_p':0.05,'top_p':1.0,'speed':1.0}
 assert len(payload['text'])<=cap['max_chars']
 voice=next(v for v in cap['voices'] if v['id']==remote_voice)
 identity=hashlib.sha256(json.dumps({'payload':payload,'service':cap['fingerprint'],'voice':voice['fingerprint']},sort_keys=True).encode()).hexdigest()
 checkpoint=private/(line['id']+'.json'); wav=out/(line['id']+'.wav')
 state=json.loads(checkpoint.read_text()) if checkpoint.exists() else {'identity':identity,'key':uuid.uuid4().hex,'payload':payload,'service_fingerprint':cap['fingerprint'],'voice_fingerprint':voice['fingerprint']}
 if state['identity']!=identity:raise RuntimeError('Input changed: preserve old audio before regenerating '+line['id'])
 if state.get('completed') and wav.exists():print(line['id'],'cached',flush=True);continue
 save(checkpoint,state)
 if not state.get('job_id'):
  job=json.loads(req('/v1/jobs',payload,state['key']));state['job_id']=job.get('id') or job.get('job_id');assert state['job_id'];save(checkpoint,state)
 print(line['id'],'submitted',state['job_id'],flush=True)
 last=None
 while True:
  job=json.loads(req('/v1/jobs/'+state['job_id']));status=job['status']
  if status!=last:print(line['id'],status,flush=True);last=status
  if status=='completed':break
  if status=='failed':state['failure']=job;save(checkpoint,state);raise RuntimeError(str(job))
  time.sleep(12)
 audio=req('/v1/jobs/'+state['job_id']+'/audio');wav.write_bytes(audio)
 with wave.open(str(wav),'rb') as w: duration=w.getnframes()/w.getframerate();meta={'sample_rate':w.getframerate(),'channels':w.getnchannels(),'duration':duration,'frames':w.getnframes()}
 state.update(completed=True,job=job,audio_sha256=hashlib.sha256(audio).hexdigest(),audio=meta);save(checkpoint,state)
 print(line['id'],'saved',round(duration,2),'seconds',flush=True)
