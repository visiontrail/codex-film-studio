"""Two-pass dialogue-level master; wait for other FFmpeg before each invocation."""
import json,re,subprocess
from pathlib import Path
from ffmpeg_gate import run
ROOT=Path(__file__).resolve().parents[1]
mix=ROOT/'media/audio/mix.wav';picture=ROOT/'media/picture.mp4';final=ROOT/'media/the-house-gets-coffee.mp4';staged=final.with_name('.'+final.name)
measure=run(['-hide_banner','-i',str(mix),'-af','loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json','-f','null','-'],capture_output=True,text=True);assert measure.returncode==0,measure.stderr
m=json.loads(re.search(r'\{\s*"input_i".*?\}',measure.stderr,re.S)[0]);(ROOT/'review/master-input.json').write_text(json.dumps(m,indent=2))
fil=f"loudnorm=I=-14:TP=-1.5:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
r=run(['-hide_banner','-y','-i',str(picture),'-i',str(mix),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',fil,'-ar','48000','-c:a','aac','-b:a','256k','-shortest','-movflags','+faststart',str(staged)],capture_output=True,text=True);assert r.returncode==0,r.stderr
staged.replace(final)
(ROOT/'review/master-encode.log').write_text(r.stderr);print(final)
