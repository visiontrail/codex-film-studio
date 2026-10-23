"""Resumable public model download, immutable revision and SHA-256 verification."""
import concurrent.futures,hashlib,json,time,urllib.request,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
repo='mlx-community/S3TokenizerV2';rev='e0c9886f0e1c35ae85b1f27277416fb19fc72bec';sha='928726bc1f206a613d36b8f49e297eae9c5593a21bf9b92ddfe2c23f85eb92cc';size=494868984;chunk=8*1024*1024
out=ROOT/'media/models/S3TokenizerV2';parts=out/'parts';parts.mkdir(parents=True,exist_ok=True)
def one(i):
 start=i*chunk;end=min(size,start+chunk)-1;p=parts/f'{i:04d}.part'
 if p.exists() and p.stat().st_size==end-start+1:return i,'cached'
 for attempt in range(12):
  try:
   temp=p.with_suffix('.tmp');have=temp.stat().st_size if temp.exists() else 0
   if have==end-start+1:temp.replace(p);return i,'resumed'
   offset=start+have
   u=f'https://huggingface.co/{repo}/resolve/{rev}/model.safetensors?download=true&part={i}&offset={offset}'
   req=urllib.request.Request(u,headers={'Range':f'bytes={offset}-{end}'})
   with urllib.request.urlopen(req,timeout=90) as r:
    assert r.status==206 and r.headers.get('Content-Range','').startswith(f'bytes {offset}-{end}/'),r.headers.get('Content-Range')
    with temp.open('ab') as f:
     while True:
      data=r.read(256*1024)
      if not data:break
      f.write(data)
   assert temp.stat().st_size==end-start+1
   temp.replace(p);return i,'downloaded'
  except Exception as e:
   print('retry',i,attempt,type(e).__name__,flush=True);time.sleep(2+attempt*3)
 raise RuntimeError('Failed part '+str(i))
t=time.monotonic();count=(size+chunk-1)//chunk
with concurrent.futures.ThreadPoolExecutor(max_workers=48) as pool:
 for n,f in enumerate(concurrent.futures.as_completed([pool.submit(one,i) for i in range(count)]),1):print(n,'/',count,f.result(),'elapsed',round(time.monotonic()-t),flush=True)
digest=hashlib.sha256();target=out/'model.safetensors'
with target.with_suffix('.tmp').open('wb') as f:
 for i in range(count):
  data=(parts/f'{i:04d}.part').read_bytes();digest.update(data);f.write(data)
assert digest.hexdigest()==sha,digest.hexdigest();target.with_suffix('.tmp').replace(target)
(out/'download-provenance.json').write_text(json.dumps({'repo':repo,'revision':rev,'sha256':sha,'size':size},indent=2));print('Verified',target,flush=True)
