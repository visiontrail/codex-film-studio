"""Check the encoded file, not merely the render process exit code."""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
from ffmpeg_gate import run
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('video');p.add_argument('--draft',action='store_true');a=p.parse_args();video=Path(a.video)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-count_frames','-of','json',str(video)]))
v=next(x for x in probe['streams'] if x['codec_type']=='video');aud=next(x for x in probe['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'])==(1920,1080);assert v['avg_frame_rate']=='24/1';assert v['pix_fmt']=='yuv420p';assert v['color_space']=='bt709';assert int(aud['sample_rate'])==48000;assert aud['channels']==2
if not a.draft:
 timeline=json.loads((ROOT/'content/timeline.json').read_text());assert not timeline['draft'];assert int(v['nb_read_frames'])==timeline['duration_frames'];assert abs(float(probe['format']['duration'])-timeline['duration_frames']/24)<.05
result=run(['-v','error','-i',str(video),'-map','0:v:0','-map','0:a:0','-f','null','-'],capture_output=True,text=True);assert result.returncode==0 and not result.stderr,result.stderr
loud=run(['-hide_banner','-i',str(video),'-vn','-af','loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json','-f','null','-'],capture_output=True,text=True);assert loud.returncode==0;match=re.search(r'\{\s*"input_i".*?\}',loud.stderr,re.S);assert match
report={'file':str(video.resolve()),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'probe':probe,'full_decode':'passed','loudness':json.loads(match[0]),'draft':a.draft,'visual_review':'separate evidence','audio_listening':'Not established by these signal measurements','browser_playback':'separate evidence'}
(ROOT/'review'/('delivery-draft.json' if a.draft else 'delivery.json')).write_text(json.dumps(report,indent=2));print(json.dumps({'frames':v['nb_read_frames'],'duration':probe['format']['duration'],'loudness':report['loudness']},indent=2))
