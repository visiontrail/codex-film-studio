"""Replace only the closing scene, preserving the accepted earlier animation."""
import json,subprocess,sys
from pathlib import Path
from ffmpeg_gate import gate
ROOT=Path(__file__).resolve().parents[1];FF='/opt/homebrew/bin/ffmpeg'
t=json.loads((ROOT/'content/timeline.json').read_text());start=t['scenes'][-1]['start'];end=t['total_frames']
final=ROOT/'media/leo-the-farmer-crayon-book.mp4'
if final.exists() and not (ROOT/'media/leo-the-farmer-crayon-book-v1.mp4').exists():final.rename(ROOT/'media/leo-the-farmer-crayon-book-v1.mp4')
subprocess.run([sys.executable,str(ROOT/'scripts/encode.py'),'--start',str(start),'--end',str(end),'--output','media/parts/closing-v2.mp4'],cwd=ROOT,check=True)
with gate():subprocess.run([FF,'-hide_banner','-loglevel','warning','-y','-i',str(ROOT/'media/leo-the-farmer-picture.mp4'),'-vf',f'trim=end_frame={start},setpts=PTS-STARTPTS','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p',str(ROOT/'media/parts/prefix-v2.mp4')],check=True)
manifest=ROOT/'media/parts/repair-concat.txt';manifest.write_text("file 'prefix-v2.mp4'\nfile 'closing-v2.mp4'\n")
with gate():subprocess.run([FF,'-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i',str(manifest),'-c','copy','-movflags','+faststart',str(ROOT/'media/leo-the-farmer-picture-v2.mp4')],check=True)
(ROOT/'media/leo-the-farmer-picture.mp4').rename(ROOT/'media/leo-the-farmer-picture-v1.mp4');(ROOT/'media/leo-the-farmer-picture-v2.mp4').rename(ROOT/'media/leo-the-farmer-picture.mp4')
print('Replaced closing scene',start,end)
