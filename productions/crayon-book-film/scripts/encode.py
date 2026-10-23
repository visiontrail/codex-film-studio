"""Render bounded frame ranges with resumable, source-bound checkpoints."""
import argparse,hashlib,json,subprocess
from pathlib import Path
from ffmpeg_gate import gate
ROOT=Path(__file__).resolve().parents[1];FF='/opt/homebrew/bin/ffmpeg';PROBE='/opt/homebrew/bin/ffprobe'
p=argparse.ArgumentParser();p.add_argument('--start',type=int,default=0);p.add_argument('--end',type=int);p.add_argument('--output',default='media/leo-the-farmer-picture.mp4');args=p.parse_args()
def count(path):
 try:return int(json.loads(subprocess.check_output([PROBE,'-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',str(path)]))['streams'][0]['nb_frames'])
 except (subprocess.CalledProcessError,ValueError,KeyError,IndexError):return -1

def encode(first,last,path):
 with gate():
  with open(ROOT/'media/render-progress.log','a') as log:
   producer=subprocess.Popen(['node','--expose-gc','scripts/render.mjs','--range',str(first),str(last)],cwd=ROOT,stdout=subprocess.PIPE,stderr=log)
   command=[FF,'-hide_banner','-loglevel','warning','-y','-f','rawvideo','-pixel_format','rgba','-video_size','1920x1080','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(path)]
   try:
    result=subprocess.run(command,stdin=producer.stdout,cwd=ROOT);producer.stdout.close();code=producer.wait()
    if code or result.returncode:raise RuntimeError(f'render={code}, encoder={result.returncode}; completed previous checkpoints remain preserved')
   finally:
    if producer.poll() is None:producer.terminate();producer.wait()
 if count(path)!=last-first:raise RuntimeError('Incorrect checkpoint frame count')

if args.end is not None:
 encode(args.start,args.end,ROOT/args.output)
else:
 digest=hashlib.sha256()
 for path in sorted([*ROOT.glob('src/*.mjs'),*ROOT.glob('assets/fonts/*.ttf'),ROOT/'content/timeline.json',ROOT/'content/action-cues.json',ROOT/'package-lock.json']):digest.update(path.read_bytes())
 cache=ROOT/'media/render-cache'/digest.hexdigest()[:20];cache.mkdir(parents=True,exist_ok=True)
 total=json.loads((ROOT/'content/timeline.json').read_text())['total_frames'];parts=[]
 for first in range(0,total,480):
  last=min(total,first+480);path=cache/f'{first:06d}-{last:06d}.mp4'
  if not path.exists() or count(path)!=last-first:encode(first,last,path)
  parts.append(path);print('Accepted checkpoint',first,last,flush=True)
 manifest=cache/'concat.txt';manifest.write_text(''.join("file '"+str(path).replace("'","'\\''")+"'\n"for path in parts))
 with gate():subprocess.run([FF,'-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i',str(manifest),'-c','copy','-movflags','+faststart',str(ROOT/args.output)],check=True)
 if count(ROOT/args.output)!=total:raise RuntimeError('Final frame count mismatch')
