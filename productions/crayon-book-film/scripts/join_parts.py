"""Join verified frame ranges without recompressing, then verify frame count."""
import json,subprocess
from pathlib import Path
from ffmpeg_gate import gate
ROOT=Path(__file__).resolve().parents[1]
parts=sorted((ROOT/'media/parts').glob('part-*.mp4'));expected=0
for p in parts:
 a,b=map(int,p.stem.split('-')[1:]);assert a==expected,(a,expected)
 data=json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',str(p)]));assert int(data['streams'][0]['nb_frames'])==b-a;expected=b
assert expected==json.loads((ROOT/'content/timeline.json').read_text())['total_frames']
manifest=ROOT/'media/parts/concat.txt';manifest.write_text(''.join("file '"+str(p).replace("'","'\\''")+"'\n"for p in parts))
with gate():subprocess.run(['/opt/homebrew/bin/ffmpeg','-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i',str(manifest),'-c','copy','-movflags','+faststart',str(ROOT/'media/leo-the-farmer-picture.mp4')],check=True)
print('Joined',expected,'frames')
