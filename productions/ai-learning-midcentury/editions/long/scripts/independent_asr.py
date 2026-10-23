"""Second unprompted recognizer for concrete transcript discrepancies."""
import argparse
import hashlib
import json
import os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
os.environ['PATH']=str(ROOT/'scripts/bin')+os.pathsep+os.environ['PATH']
import mlx_whisper

def main():
    p=argparse.ArgumentParser();p.add_argument('--only',required=True);args=p.parse_args()
    manifest={x['id']:x for x in json.loads((ROOT/'media/audio/manifest.json').read_text())}
    for ident in args.only.split(','):
        row=manifest[ident];wav=ROOT/row['path'];sha=hashlib.sha256(wav.read_bytes()).hexdigest()
        assert sha==row['audio_sha256']
        result=mlx_whisper.transcribe(str(wav),path_or_hf_repo='mlx-community/whisper-medium-mlx',language='en',word_timestamps=True,temperature=0,initial_prompt=None,condition_on_previous_text=False,verbose=False)
        out={'model':'mlx-community/whisper-medium-mlx','audio_sha256':sha,'text':result['text'],'segments':result['segments'],'listening':'Not established by ASR'}
        (ROOT/f'media/asr/{ident}-independent-medium.json').write_text(json.dumps(out,indent=2)+'\n')
        print(ident,out['text'],flush=True)
if __name__=='__main__':main()
