"""Decode both files; map every delivered frame to a reference shot-role frame.
This produces review evidence, not a scalar claim of perceptual identity.
"""
import argparse,csv,json,hashlib,subprocess,math
from pathlib import Path
from ffmpeg_gate import ffmpeg_slot
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('video');p.add_argument('--out',default='review/comparison');a=p.parse_args()
timeline=json.loads((ROOT/'content/timeline.json').read_text());out=ROOT/a.out;out.mkdir(parents=True,exist_ok=True)
def decode(file,w=240,h=135):
 with ffmpeg_slot():
  proc=subprocess.Popen(['ffmpeg','-v','error','-i',str(file),'-an','-vf',f'scale={w}:{h}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
  while True:
   data=proc.stdout.read(w*h*3)
   if not data:break
   if len(data)!=w*h*3:raise RuntimeError('Short decoded frame')
   yield np.frombuffer(data,np.uint8).reshape(h,w,3).copy()
  assert proc.wait()==0
reference=list(decode(ROOT/'reference/coffee-run.mp4'))
assert len(reference)==1380
# Half-open reference intervals, selected by observed visual role. New subject props
# have no identical reference object and are explicitly labeled as adaptations.
def interval(shot,line):
 world=shot['world'];kind=shot['kind'];role=shot.get('shot',line.get('shot','wide'))
 if kind=='cold':return 0,56,'coffee machine insert'
 if kind=='end':return 1272,1380,'end title'
 if kind=='title':return 228,303,'orbital title'
 if kind=='departure':return 276,313,'portal wipe'
 if kind=='arrival':return (*({'odds':(313,363),'parlay':(506,545),'legal':(750,807),'home':(869,903)}.get(world,(313,363))),'portal arrival')
 if role in ['bo','phone']:
  return (*( (584,651) if line.get('emotion')=='panic' else (452,498) if world=='odds' else (1016,1056)),'assistant reaction')
 if role=='qin':return (*((651,679) if world=='parlay' else (135,161)),'deadpan close-up')
 if role in ['board','machine','coins','gates','pool','referee','turkey','woolmer','brands','asia','flags','debt','hanson','reveal']:return 423,452,'new subject prop / reference object insert'
 return (*({'home':(1179,1250),'odds':(363,423),'parlay':(545,584),'legal':(807,861)}.get(world,(363,423))),'medium ensemble')
rows=[];shots=timeline['shots'];si=0;w=240;h=135;cols=4;rows_per=8;per=cols*rows_per;atlas=None;previous=None;prev_ref=None;metrics=[]
for i,frame in enumerate(decode(Path(a.video))):
 while si+1<len(shots) and i>=shots[si]['end']:si+=1
 shot=shots[si];line=next((x for x in timeline['cues'] if x.get('id')==shot.get('line')),{});lo,hi,role=interval(shot,line)
 progress=(i-shot['start'])/max(1,shot['end']-shot['start']);ri=min(hi-1,lo+int(progress*(hi-lo)));ref=reference[ri]
 def ink(ar):return float((np.linalg.norm(ar.astype(float)-np.array([27,20,34]),axis=2)<25).mean())
 delta=float(np.abs(frame.astype(float)-previous).mean()) if previous is not None else 0
 metrics.append({'film_frame':i,'film_seconds':round(i/24,6),'shot':shot['id'],'world':shot['world'],'reference_frame':ri,'role':role,'film_ink_fraction':round(ink(frame),5),'reference_ink_fraction':round(ink(ref),5),'film_temporal_delta':round(delta,4)})
 if i%per==0:atlas=Image.new('RGB',(cols*w*2,rows_per*(h+27)),'#19161f');draw=ImageDraw.Draw(atlas)
 x=(i%cols)*w*2;y=((i%per)//cols)*(h+27);atlas.paste(Image.fromarray(ref),(x,y));atlas.paste(Image.fromarray(frame),(x+w,y));draw.text((x+4,y+h+3),f'REF {ri:04d}   |   FILM {i:05d}  {shot["id"]}',fill='white')
 if i%per==per-1:atlas.save(out/f'pair_{i//per:03d}.jpg',quality=92)
 previous=frame.astype(float)
count=len(metrics)
if count%per:atlas.save(out/f'pair_{(count-1)//per:03d}.jpg',quality=92)
assert count==timeline['duration_frames'],(count,timeline['duration_frames'])
with (out/'frame-pairs.csv').open('w') as f:wr=csv.DictWriter(f,fieldnames=metrics[0]);wr.writeheader();wr.writerows(metrics)
(out/'coverage.json').write_text(json.dumps({'film':str(Path(a.video).resolve()),'sha256':hashlib.sha256(Path(a.video).read_bytes()).hexdigest(),'decoded_film_frames':count,'decoded_reference_frames':len(reference),'mapped_film_frames':len(metrics),'pages':math.ceil(count/per),'pairs_per_page':per,'thumbnail_dimensions':[w,h],'mapping':'shot role and normalized progress; not semantic identity or pixel correspondence','visual_review':'pending; inspect every pair page before updating this field','score':'No numerical perceptual-equality score is inferred'},indent=2));print('paired',count,'frames on',math.ceil(count/per),'pages')
