"""Measured two-pass loudness normalization and final MP4 mux."""
import json
from pathlib import Path
import re
import subprocess
ROOT=Path(__file__).resolve().parents[1]
FF=str(ROOT/'scripts/bin/ffmpeg')
def run(args):
    p=subprocess.run([FF,'-hide_banner','-nostdin','-y',*args],text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr[-6000:])
    return p.stderr

def main():
    tl=json.loads((ROOT/'content/timeline.json').read_text());duration=tl['duration_frames']/24
    base='loudnorm=I=-14:TP=-1.2:LRA=9'
    first=run(['-i',str(ROOT/'media/mix-master.wav'),'-af',base+':print_format=json','-f','null','-'])
    matches=re.findall(r'\{\s*"input_i"[\s\S]*?\}',first);measurement=json.loads(matches[-1])
    (ROOT/'review/loudness-pass1.json').write_text(json.dumps(measurement,indent=2))
    filt=base+f":measured_I={measurement['input_i']}:measured_TP={measurement['input_tp']}:measured_LRA={measurement['input_lra']}:measured_thresh={measurement['input_thresh']}:offset={measurement['target_offset']}:linear=true:print_format=json"
    second=run(['-i',str(ROOT/'media/mix-master.wav'),'-af',filt,'-ar','48000','-c:a','pcm_s24le',str(ROOT/'media/mix-final.wav')])
    (ROOT/'review/loudness-pass2.log').write_text(second)
    final=ROOT/'media/Does-AI-Help-You-Learn-Midcentury-Long.mp4'
    chapter_file=ROOT/'media/chapters.ffmetadata'
    chapters=[';FFMETADATA1','title=Does AI Help You Learn—or Just Finish?']
    for i,chapter in enumerate(tl['chapters']):
        end=tl['chapters'][i+1]['start'] if i+1<len(tl['chapters']) else tl['duration_frames']
        title=re.sub(r'([=;#\\])',r'\\\1',chapter['title']).replace('\n',' ')
        chapters.extend(['[CHAPTER]','TIMEBASE=1/24',f"START={chapter['start']}",f'END={end}',f'title={title}'])
    chapter_file.write_text('\n'.join(chapters)+'\n')
    run(['-i',str(ROOT/'media/picture.mp4'),'-i',str(ROOT/'media/mix-final.wav'),'-i',str(ROOT/'media/narration.en.srt'),'-f','ffmetadata','-i',str(chapter_file),'-map','0:v:0','-map','1:a:0','-map','2:s:0','-map_metadata','3','-map_chapters','3','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-c:s','mov_text','-metadata:s:s:0','language=eng','-disposition:s:0','0','-t',str(duration),'-movflags','+faststart',str(final)])
    check=run(['-i',str(final),'-map','0:a:0','-af',base+':print_format=json','-f','null','-'])
    actual=json.loads(re.findall(r'\{\s*"input_i"[\s\S]*?\}',check)[-1]);(ROOT/'review/final-loudness.json').write_text(json.dumps(actual,indent=2))
    run(['-v','error','-i',str(final),'-map','0:v:0','-map','0:a:0','-f','null','-'])
    print(json.dumps({'file':str(final),'seconds':duration,'measured_LUFS':actual['input_i'],'measured_true_peak_dBTP':actual['input_tp'],'decode':'complete without errors'}))
if __name__=='__main__':main()
