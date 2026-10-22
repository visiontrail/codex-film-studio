"""Materialize explicitly reviewed takes without discarding prior provider audio."""
import hashlib,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((ROOT/'content/accepted-takes.json').read_text())
script=json.loads((ROOT/'content/script.json').read_text());rows={x['id']:x for x in manifest['takes']}
assert manifest['script_sha256']==sha(ROOT/'content/script.json'),'Selection manifest belongs to a different script'
assert set(rows)=={x['id'] for x in script}
out=ROOT/'media/speech';asr_out=ROOT/'review/asr';archive=ROOT/'review/selected-archive';archive.mkdir(exist_ok=True);out.mkdir(exist_ok=True);asr_out.mkdir(exist_ok=True)
wav_archive=ROOT/'media/selected-archive';wav_archive.mkdir(exist_ok=True)
for line in script:
 row=rows[line['id']];src=ROOT/row['wav'];asr=ROOT/row['asr'];record=json.loads(src.with_suffix('.json').read_text());transcript=json.loads(asr.read_text())
 assert record['identity']['text']==line['text'],line['id']
 assert sha(src)==row['sha256']==record['sha256']==transcript['sha256'],line['id']
 assert sha(asr)==row['asr_sha256'],line['id']
 target=out/src.name;target_asr=asr_out/asr.name
 if target.exists() and sha(target)!=sha(src):
  previous=wav_archive/(target.stem+'-'+sha(target)+'.wav')
  if previous.exists():assert sha(previous)==sha(target)
  else:shutil.copy2(target,previous)
 if target_asr.exists() and sha(target_asr)!=sha(asr):
  saved=archive/(target_asr.stem+'-'+sha(target_asr)+'.json')
  if saved.exists():assert sha(saved)==sha(target_asr)
  else:shutil.copy2(target_asr,saved)
 shutil.copy2(src,target);shutil.copy2(asr,target_asr)
print('Selected',len(script),'reviewed, source-hash-bound takes. Original takes preserved.')
