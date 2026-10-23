"""Render reviewed chapters while remaining natural-speed voice clips arrive.

Each cached chapter is bound to source bytes and its exact shot timings. Final
assembly rejects a stale chapter. This is a local build, not a service task.
"""
import argparse
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path
from transcribe import tokens

ROOT=Path(__file__).resolve().parents[1]

def read(path):return json.loads(path.read_text())
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True).encode()).hexdigest()
def sources():
    files=list((ROOT/'src').glob('*.mjs'))+list((ROOT/'../../src').glob('*.mjs'))
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
def signature(shots):return digest({'sources':sources(),'shots':shots})

def ready(rows,audio,asr):
    for line in rows:
        a,r=audio.get(line['id']),asr.get(line['id'])
        if not a or not r:return False
        if a['text']!=line['text'] or a['audio_sha256']!=r['audio_sha256']:return False
        if tokens(r['transcript'])!=tokens(line['text']):
            p=ROOT/f"media/asr/{line['id']}-independent-medium.json"
            if not p.exists():return False
            second=read(p)
            if second['audio_sha256']!=a['audio_sha256'] or tokens(second['text'])!=tokens(line['text']):return False
    return True

def main():
    p=argparse.ArgumentParser();p.add_argument('--follow',action='store_true');p.add_argument('--assemble',action='store_true');args=p.parse_args()
    out=ROOT/'media/chapters';out.mkdir(exist_ok=True)
    lines=read(ROOT/'content/narration.json');names=list(dict.fromkeys(x['chapter'] for x in lines))
    groups=[[x for x in lines if x['chapter']==name] for name in names]
    while True:
        audio={x['id']:x for x in read(ROOT/'media/audio/manifest.json')}
        asr={x['id']:x for x in read(ROOT/'media/asr/review.json')}
        complete=True
        for i,group in enumerate(groups):
            if not ready([x for g in groups[:i+1] for x in g],audio,asr):complete=False;break
            draft=out/'timeline-draft.json'
            subprocess.run([sys.executable,str(ROOT/'scripts/timeline.py'),'--draft','--out',str(draft)],check=True,stdout=subprocess.DEVNULL)
            timeline=read(draft);shots=[s for s in timeline['shots'] if s.get('chapter')==names[i] or (i==len(groups)-1 and s['scene']=='credits')]
            sig=signature(shots);meta=out/f'{i+1:02d}.json';video=out/f'{i+1:02d}.mp4'
            if not (meta.exists() and video.exists() and read(meta)['signature']==sig):
                print('Rendering chapter',i+1,shots[0]['start'],shots[-1]['end'],flush=True)
                subprocess.run(['node',str(ROOT/'scripts/render.mjs'),'--timeline',str(draft),'--start',str(shots[0]['start']),'--end',str(shots[-1]['end']),'--out',str(video)],check=True)
                meta.write_text(json.dumps({'signature':sig,'start':shots[0]['start'],'end':shots[-1]['end'],'shots':[s['id'] for s in shots]},indent=2)+'\n')
        if complete or not args.follow:break
        time.sleep(20)
    if args.assemble:
        if not complete:raise ValueError('Unreviewed speech still blocks the final build')
        subprocess.run([sys.executable,str(ROOT/'scripts/timeline.py')],check=True)
        timeline=read(ROOT/'content/timeline.json')
        for i,name in enumerate(names):
            shots=[s for s in timeline['shots'] if s.get('chapter')==name or (i==len(groups)-1 and s['scene']=='credits')]
            assert signature(shots)==read(out/f'{i+1:02d}.json')['signature']
        concat=out/'concat.txt';concat.write_text(''.join(f"file '{i+1:02d}.mp4'\n" for i in range(len(groups))))
        subprocess.run([str(ROOT/'scripts/bin/ffmpeg'),'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(ROOT/'media/picture.mp4')],check=True)
        print('Assembled all exact-timing chapters',flush=True)

if __name__=='__main__':main()
