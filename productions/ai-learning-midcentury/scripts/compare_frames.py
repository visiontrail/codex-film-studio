"""Pair every final frame with an indexed reference frame of like visual function.

The mapping follows shot purpose and normalized progress, not semantic identity.
Differences are diagnostics, never a claimed artistic similarity percentage.
"""
import csv
import json
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
def readcsv(path):return list(csv.DictReader(path.open()))
def main():
    tl=json.loads((ROOT/'content/timeline.json').read_text())
    new=readcsv(ROOT/'review/final/frames.csv');ref=readcsv(ROOT/'review/reference/frames.csv')
    if len(new)!=tl['duration_frames']:raise ValueError('Final frame count differs from edit')
    out=ROOT/'review/comparison';out.mkdir(exist_ok=True);(out/'atlases').mkdir(exist_ok=True)
    rows=[];si=0;atlas=None;cache={};mapping=[]
    for i,n in enumerate(new):
        while i>=tl['shots'][si]['end']:si+=1
        shot=tl['shots'][si];a,b=shot['reference_range'];r=min(len(ref)-1,round(a+(b-a-1)*(i-shot['start'])/max(1,shot['end']-shot['start'])))
        mapping.append(r);other=ref[r]
        delta={k:round(float(n[k])-float(other[k]),6) for k in ['mean_r','mean_g','mean_b','dark_fraction','light_fraction','edge_energy','motion_mad']}
        rows.append({'final_frame':i,'reference_frame':r,'shot':shot['scene'],**{'delta_'+k:v for k,v in delta.items()}})
        if i%48==0:atlas=Image.new('RGB',(1920,1920),'#eee4d3')
        x=(i%4)*480;y=((i%48)//4)*160
        if r not in cache:cache[r]=Image.open(ROOT/f'review/reference/frames/{r:06d}.jpg').resize((240,135),Image.Resampling.LANCZOS)
        im=Image.open(ROOT/f'review/final/frames/{i:06d}.jpg').resize((240,135),Image.Resampling.LANCZOS)
        atlas.paste(cache[r],(x,y));atlas.paste(im,(x+240,y))
        ImageDraw.Draw(atlas).text((x+5,y+138),f'REF {r:04d}  |  NEW {i:04d}  {shot["scene"]}',fill='#2b2420')
        if i%48==47 or i==len(new)-1:atlas.save(out/f'atlases/{i//48:03d}.jpg',quality=94)
    with (out/'frames.csv').open('w') as f:
        w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
    (out/'mapping.json').write_text(json.dumps(mapping))
    summary={'final_frames':len(new),'reference_frames':len(ref),'mapped_reference_frames':len(set(mapping)),'comparison_rows':len(rows),'paired_atlases':(len(new)+47)//48,'method':'Every final frame is mapped by shot function and normalized phase to an original reference range. Left is reference; right is new. Tile resolution 240x135; individual frame files are 640x360. Full resolution remains available in the videos.','metrics':'RGB means, dark/light fractions, edge energy and inter-frame motion are descriptive. They are not an artistic equivalence score.','coverage':'Atlas generation is not visual inspection. Actual opened atlas ranges are recorded separately.'}
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
if __name__=='__main__':main()
