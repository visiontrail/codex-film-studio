"""Direct Chatterbox client with immutable requests and resumable job IDs."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import time
import urllib.request
import wave

ROOT=Path(__file__).resolve().parents[1]

def sha(data):
    return hashlib.sha256(data if isinstance(data,bytes) else json.dumps(data,sort_keys=True).encode()).hexdigest()

def save(path,data):
    tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(data,indent=2)+'\n');tmp.replace(path)

def main():
    p=argparse.ArgumentParser();p.add_argument('--frontier-root',type=Path);p.add_argument('--reuse-from',type=Path);p.add_argument('--only');p.add_argument('--seed-offset',type=int,default=0);a=p.parse_args()
    url=os.getenv('CHATTERBOX_TTS_URL','');key=os.getenv('CHATTERBOX_TTS_API_KEY','')
    if a.frontier_root:
        sys.path.insert(0,str(a.frontier_root))
        from backend import config
        url,key=config.CHATTERBOX_TTS_URL,config.CHATTERBOX_TTS_API_KEY
    if not url: raise ValueError('Set CHATTERBOX_TTS_URL or provide --frontier-root')
    def request(path,payload=None,idem=None,binary=False):
        headers={'X-API-Key':key}
        if idem:headers['Idempotency-Key']=idem
        if payload:headers['Content-Type']='application/json'
        req=urllib.request.Request(url.rstrip('/')+path,json.dumps(payload).encode() if payload else None,headers)
        for retry in range(5):
            try:
                with urllib.request.urlopen(req,timeout=60) as r:raw=r.read()
                return raw if binary else json.loads(raw)
            except (OSError,TimeoutError):
                if retry==4:raise
                time.sleep(2+retry*3)
    out=ROOT/'media/audio';out.mkdir(parents=True,exist_ok=True)
    cap=request('/v1/capabilities');save(out/'capabilities.json',cap)
    voice=next(v for v in cap['voices'] if v['id']=='space-en-f1')
    lines=json.loads((ROOT/'content/narration.json').read_text())
    if any(len(x['text'])>cap['max_chars'] for x in lines):raise ValueError('Narration exceeds provider limit')
    manifest_path=out/'manifest.json'
    manifest={x['id']:x for x in json.loads(manifest_path.read_text())} if manifest_path.exists() else {}
    old=[]
    if a.reuse_from:
        old=json.loads((a.reuse_from/'media/audio/manifest.json').read_text())
    for line in lines:
        ident=line['id'];source_sha=sha(line['text'].encode())
        if a.only and ident not in a.only.split(','):continue
        if ident in manifest and not a.seed_offset:
            row=manifest[ident]
            if row['source_sha256']==source_sha and sha((ROOT/row['path']).read_bytes())==row['audio_sha256']:
                print(ident,'retained',flush=True);continue
        match=next((x for x in old if x['text']==line['text'] and x.get('source_sha256')==source_sha and x.get('voice')==voice['id'] and x.get('job_id')),None)
        if match and not a.seed_offset:
            data=(a.reuse_from/match['path']).read_bytes()
            if sha(data)!=match['audio_sha256']:raise ValueError('Source cached WAV changed')
            job=request('/v1/jobs/'+match['job_id'])
            if job['audio_sha256']!=sha(data) or job['request']['text']!=line['text'] or job['voice_fingerprint']!=voice['fingerprint']:raise ValueError('Cached provider binding mismatch')
            target=out/f'{ident}-{sha(data)[:12]}.wav';target.write_bytes(data)
            save(target.with_suffix('.job.json'),job)
            row={**match,**line,'path':str(target.relative_to(ROOT)),'reuse':'Exact source, WAV hash, deployed job and voice verified'}
        else:
            payload={'text':line['text'],'language_id':'en','voice':voice['id'],'seed':420+int(ident)+a.seed_offset,'exaggeration':0.45,'cfg_weight':0.5,'temperature':0.8,'repetition_penalty':2.0,'min_p':0.05,'top_p':1.0,'speed':1.0}
            identity=sha({'payload':payload,'deployment':cap['fingerprint'],'voice':voice['fingerprint']})
            checkpoint_path=out/f'{ident}-{identity[:12]}.request.json'
            checkpoint=json.loads(checkpoint_path.read_text()) if checkpoint_path.exists() else {'source_sha256':source_sha,'identity':identity,'payload':payload,'voice_fingerprint':voice['fingerprint'],'deployment_fingerprint':cap['fingerprint']}
            save(checkpoint_path,checkpoint)
            if 'job_id' not in checkpoint:
                checkpoint['job_id']=request('/v1/jobs',payload,'codex-midcentury-'+identity)['id'];save(checkpoint_path,checkpoint)
            previous=None
            while True:
                job=request('/v1/jobs/'+checkpoint['job_id'])
                if job['status']!=previous:
                    print(ident,job['status'],checkpoint['job_id'],flush=True);previous=job['status']
                if job['status']=='completed':break
                if job['status']=='failed':save(checkpoint_path.with_suffix('.job.json'),job);raise RuntimeError('Provider failed; retained evidence')
                time.sleep(5)
            if job['request']!=payload or job['voice_fingerprint']!=voice['fingerprint']:raise ValueError('Provider request or voice changed')
            data=request('/v1/jobs/'+checkpoint['job_id']+'/audio',binary=True)
            if sha(data)!=job['audio_sha256']:raise ValueError('WAV hash mismatch')
            target=out/f'{ident}-{identity[:12]}.wav';target.write_bytes(data);save(target.with_suffix('.job.json'),job)
            row={**line,'path':str(target.relative_to(ROOT)),'job_id':checkpoint['job_id'],'audio_sha256':sha(data),'source_sha256':source_sha,'voice':voice['id'],'speed':1.0,'reuse':False}
        with wave.open(str(ROOT/row['path'])) as wav:
            row['duration']=wav.getnframes()/wav.getframerate()
            row['format']={'channels':wav.getnchannels(),'rate':wav.getframerate(),'width':wav.getsampwidth()}
        manifest[ident]=row;save(manifest_path,[manifest[x['id']] for x in lines if x['id'] in manifest])
        print(ident,f"{row['duration']:.2f}s",'retrieved; independent review pending',flush=True)

if __name__=='__main__':main()
