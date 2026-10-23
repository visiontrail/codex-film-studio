"""Calibrated paper vignette, two-pass loudness, and final H.264/AAC encoding."""
import json,re,subprocess
from pathlib import Path
import numpy as np
from PIL import Image
from ffmpeg_gate import gate
ROOT=Path(__file__).resolve().parents[1];FF='/opt/homebrew/bin/ffmpeg'
with gate():
 r=subprocess.run([FF,'-hide_banner','-i',str(ROOT/'media/mix.wav'),'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
measure=json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1]);(ROOT/'review/loudness-input.json').write_text(json.dumps(measure,indent=2))
filt='loudnorm=I=-16:TP=-1.5:LRA=9:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true:print_format=json'.format(**measure)
# Precompute the spatial field once; avoid evaluating the same polynomial
# for all 8 billion output pixels. RGB multiplication retains paper relief.
y,x=np.mgrid[:1080,:1920];rad=((x-960)/(1920*.65))**2+((y-1080*.48)/(1080*.85))**2
ratio=(1-.30*rad)/(1-.16*rad);mask=np.repeat(np.round(ratio[:,:,None]*255),3,axis=2).astype(np.uint8)
Image.fromarray(mask).save(ROOT/'media/vignette-map.png')
grade='[0:v]format=gbrp[base];[2:v]format=gbrp[mask];[base][mask]blend=all_mode=multiply:shortest=1,format=yuv420p[graded]'
frames=json.loads((ROOT/'content/timeline.json').read_text())['total_frames']
command=[FF,'-hide_banner','-nostats','-progress',str(ROOT/'media/finalize-progress.txt'),'-y','-i',str(ROOT/'media/leo-the-farmer-picture.mp4'),'-i',str(ROOT/'media/mix.wav'),'-loop','1','-framerate','24','-i',str(ROOT/'media/vignette-map.png'),'-filter_complex',grade,'-map','[graded]','-map','1:a:0','-frames:v',str(frames),'-c:v','libx264','-preset','fast','-crf','16','-af',filt,'-c:a','aac','-b:a','256k','-ar','48000','-movflags','+faststart','-metadata','title=Leo the Farmer — A Crayon Storybook','-metadata','comment=Unofficial retelling. Story/characters: Play with Gyuri. Visual study: LemoLab crayon-book (CC BY 4.0). Independent artwork, narration, score and renderer.',str(ROOT/'media/leo-the-farmer-crayon-book.mp4')]
with gate():r=subprocess.run(command,capture_output=True,text=True,check=True)
(ROOT/'review/final-mux.log').write_text(r.stderr);print(r.stderr[-2000:])
