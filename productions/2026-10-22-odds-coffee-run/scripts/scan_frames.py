"""Decode every frame, retain per-frame metrics and labeled consecutive atlases."""
import argparse, csv, json, subprocess
from pathlib import Path
from ffmpeg_gate import ffmpeg_slot
import numpy as np
from PIL import Image, ImageDraw
p=argparse.ArgumentParser(); p.add_argument('video'); p.add_argument('out'); a=p.parse_args()
out=Path(a.out); out.mkdir(parents=True,exist_ok=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',a.video])); (out/'probe.json').write_text(json.dumps(probe,indent=2))
v=next(s for s in probe['streams'] if s['codec_type']=='video'); n,d=map(int,v['avg_frame_rate'].split('/')); fps=n/d
w,h=320,180; cols,rows=6,8; per=cols*rows
slot=ffmpeg_slot();slot.__enter__()
proc=subprocess.Popen(['ffmpeg','-v','error','-i',a.video,'-an','-vf',f'scale={w}:{h}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
i=0; prev=None; metrics=[]; atlas=None
while True:
 data=proc.stdout.read(w*h*3)
 if not data: break
 if len(data)!=w*h*3: raise RuntimeError('incomplete frame')
 ar=np.frombuffer(data,np.uint8).reshape(h,w,3); lum=ar.mean(2); delta=0 if prev is None else float(np.abs(ar.astype(float)-prev).mean())
 metrics.append({'frame':i,'seconds':round(i/fps,6),'mean_r':round(float(ar[:,:,0].mean()),3),'mean_g':round(float(ar[:,:,1].mean()),3),'mean_b':round(float(ar[:,:,2].mean()),3),'dark_ratio':round(float((lum<45).mean()),5),'bright_ratio':round(float((lum>230).mean()),5),'delta':round(delta,4)})
 if i%per==0: atlas=Image.new('RGB',(cols*w,rows*(h+22)), '#18151e'); draw=ImageDraw.Draw(atlas)
 x=(i%cols)*w; y=((i%per)//cols)*(h+22); atlas.paste(Image.fromarray(ar),(x,y)); draw.text((x+5,y+h+3),f'{i:05d} | {i/fps:07.3f}s',fill='white')
 if i%per==per-1: atlas.save(out/f'atlas_{i//per:03d}.jpg',quality=88)
 if i%24==0: Image.fromarray(ar).save(out/f'second_{i:05d}.jpg',quality=90)
 prev=ar.astype(float); i+=1
if i%per: atlas.save(out/f'atlas_{i//per:03d}.jpg',quality=88)
assert proc.wait()==0
slot.__exit__(None,None,None)
with (out/'frames.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=metrics[0]);writer.writeheader();writer.writerows(metrics)
summary={'video':a.video,'fps':fps,'decoded_frames':i,'atlas_pages':(i+per-1)//per,'frames_per_page':per,'visual_review':'not yet performed','hard_cut_candidates':[m['frame'] for m in metrics if m['delta']>24]}
(out/'summary.json').write_text(json.dumps(summary,indent=2)); print(json.dumps(summary))
