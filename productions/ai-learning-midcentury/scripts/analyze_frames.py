"""Decode every frame into an indexed image, metrics row and consecutive atlas."""
import os

import argparse
import csv
import hashlib
import json
from pathlib import Path
os.environ['PATH']=str(Path(__file__).resolve().parent/'bin')+os.pathsep+os.environ['PATH']
import subprocess

import numpy as np
from PIL import Image, ImageDraw


def analyze(source, out):
    out.mkdir(parents=True, exist_ok=True)
    frames = out / 'frames'
    sheets = out / 'atlases'
    frames.mkdir(exist_ok=True)
    sheets.mkdir(exist_ok=True)
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(source)]))
    (out / 'probe.json').write_text(json.dumps(probe, indent=2))
    stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    rate = stream['avg_frame_rate'].split('/')
    fps = int(rate[0]) / int(rate[1])
    width, height = 640, 360
    proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(source), '-map', '0:v:0', '-vf', f'scale={width}:{height}', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    previous = None
    rows = []
    atlas = None
    for i in range(1000000):
        raw = proc.stdout.read(width * height * 3)
        if not raw:
            break
        if len(raw) != width * height * 3:
            raise RuntimeError('Incomplete decoded frame')
        pix = np.frombuffer(raw, np.uint8).reshape(height, width, 3)
        lum = pix.astype(np.float32).mean(2)
        diff = 0 if previous is None else float(np.abs(pix.astype(float) - previous).mean())
        row = dict(frame=i, seconds=round(i/fps, 6), mean_r=round(float(pix[:,:,0].mean()),3), mean_g=round(float(pix[:,:,1].mean()),3), mean_b=round(float(pix[:,:,2].mean()),3), dark_fraction=round(float((lum<80).mean()),6), light_fraction=round(float((lum>220).mean()),6), edge_energy=round(float(np.abs(np.diff(lum,axis=1)).mean()),4), motion_mad=round(diff,4), rgb_sha256=hashlib.sha256(raw).hexdigest())
        rows.append(row)
        im = Image.fromarray(pix)
        im.save(frames/f'{i:06d}.jpg', quality=91)
        if i % 48 == 0:
            atlas = Image.new('RGB', (2304, 1888), '#efe5d1')
        tile = im.resize((384,216),Image.Resampling.LANCZOS)
        x, y = (i%6)*384, ((i%48)//6)*236
        atlas.paste(tile, (x,y))
        ImageDraw.Draw(atlas).text((x+8,y+218),f'{i:05d}   {i/fps:07.3f}s',fill='#251f1c')
        if i%48 == 47:
            atlas.save(sheets/f'{i//48:03d}.jpg',quality=93)
        previous=pix.astype(float)
    if len(rows)%48:
        atlas.save(sheets/f'{(len(rows)-1)//48:03d}.jpg',quality=93)
    if proc.wait()!=0:
        raise RuntimeError('Decoder failed')
    with (out/'frames.csv').open('w') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]))
        writer.writeheader(); writer.writerows(rows)
    summary={'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'decoded_frames':len(rows),'fps':fps,'duration':len(rows)/fps,'atlas_count':(len(rows)+47)//48,'resolution_metrics':[640,360], 'coverage':'Every encoded frame decoded, measured and indexed. Atlas creation alone is not a visual review.','median_motion':float(np.median([r['motion_mad'] for r in rows])),'scene_change_candidates':[r['frame'] for r in rows if r['motion_mad']>20]}
    (out/'summary.json').write_text(json.dumps(summary,indent=2))
    print(json.dumps(summary))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('out',type=Path);a=p.parse_args();analyze(a.source,a.out)
