"""Fetch a known public media format in resumable HTTP byte ranges."""
import concurrent.futures, hashlib, json, os, sys, time
from pathlib import Path
import requests
meta=json.loads(Path(sys.argv[1]).read_text())
fmt=next(x for x in meta['formats'] if x['format_id']==sys.argv[2])
out=Path(sys.argv[3]);out.parent.mkdir(parents=True,exist_ok=True)
size=fmt.get('filesize') or fmt['filesize_approx'];step=512*1024
parts=out.parent/(out.stem+'-parts');parts.mkdir(exist_ok=True)
def get(i):
 start=i*step;end=min(size-1,start+step-1);p=parts/f'{i:04d}'
 if p.exists() and p.stat().st_size==end-start+1:return i
 for attempt in range(5):
  try:
   r=requests.get(fmt['url'],headers={'Range':f'bytes={start}-{end}'},timeout=(15,40))
   if r.status_code!=206 or len(r.content)!=end-start+1:raise RuntimeError(f'HTTP {r.status_code}, size {len(r.content)}')
   tmp=p.with_suffix('.tmp');tmp.write_bytes(r.content);tmp.replace(p);return i
  except Exception as e:
   if attempt==4:raise RuntimeError(f'part {i} failed: {type(e).__name__}') from None
   time.sleep(2+attempt)
count=(size+step-1)//step
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
 for done,i in enumerate(ex.map(get,range(count)),1):print(f'{done}/{count} ranges verified',flush=True)
with out.with_suffix('.building').open('wb') as stream:
 for i in range(count):stream.write((parts/f'{i:04d}').read_bytes())
out.with_suffix('.building').replace(out)
print(f'Complete {out.name} {out.stat().st_size} bytes sha256={hashlib.sha256(out.read_bytes()).hexdigest()}',flush=True)
