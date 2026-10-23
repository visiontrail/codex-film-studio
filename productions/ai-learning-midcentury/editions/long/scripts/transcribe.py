"""Unprompted transcription and source comparisons; never a listening certificate."""
import os

import argparse
import difflib
import hashlib
import json
from pathlib import Path
os.environ['PATH']=str(Path(__file__).resolve().parent/'bin')+os.pathsep+os.environ['PATH']
import re
import time
import mlx_whisper

ROOT=Path(__file__).resolve().parents[1]
def tokens(text):
    text=text.lower().replace('’',"'")
    text=re.sub(r'\bnon[- ]empty\b','nonempty',text)
    for contraction,expanded in {"you're":'you are',"it's":'it is',"don't":'do not',"can't":'cannot',"doesn't":'does not',"isn't":'is not',"that's":'that is',"you'll":'you will'}.items():text=re.sub(r'\b'+re.escape(contraction)+r'\b',expanded,text)
    text=re.sub(r'\$(\d+)',r'\1 dollars',text.lower()).replace('%',' percent').replace('dollars','dollar').replace('practise','practice').replace('practising','practicing')
    for a,b in {'48':'forty eight','17':'seventeen','11':'eleven','12':'twelve','15':'fifteen','8':'eight','6':'six','4':'four','3':'three','2':'two','1':'one'}.items():text=re.sub(r'\b'+a+r'\b',b,text)
    return re.findall(r'[a-z]+|\d+',text.replace("'",'').replace('’',''))
def main():
    p=argparse.ArgumentParser();p.add_argument('--follow',action='store_true');a=p.parse_args()
    out=ROOT/'media/asr';out.mkdir(parents=True,exist_ok=True)
    total=len(json.loads((ROOT/'content/narration.json').read_text()))
    while True:
        mp=ROOT/'media/audio/manifest.json'
        if not mp.exists():time.sleep(10);continue
        manifest=json.loads(mp.read_text());results=[]
        for row in manifest:
            wav=ROOT/row['path'];sha=hashlib.sha256(wav.read_bytes()).hexdigest()
            if sha!=row['audio_sha256']:raise ValueError('Audio hash mismatch')
            cache=out/f"{row['id']}-{sha[:12]}.json"
            if not cache.exists() and row.get('reuse'):
                old_root=ROOT/'../..'
                old_review=json.loads((old_root/'media/asr/review.json').read_text())
                match=next((r for r in old_review if r['audio_sha256']==sha and r['expected']==row['text']),None)
                if match:
                    result={**match,'id':row['id'],'source_sha256':row['source_sha256'],'reuse_evidence':'Identical source and WAV hash from short edition'}
                    cache.write_text(json.dumps(result,indent=2)+'\n')
                    old_second=old_root/f"media/asr/{match['id']}-independent-medium.json"
                    if old_second.exists():
                        second=json.loads(old_second.read_text())
                        assert second['audio_sha256']==sha
                        (out/f"{row['id']}-independent-medium.json").write_text(json.dumps(second,indent=2)+'\n')
            if cache.exists():result=json.loads(cache.read_text())
            else:
                heard=mlx_whisper.transcribe(str(wav),path_or_hf_repo='mlx-community/whisper-large-v3-turbo-q4',language='en',word_timestamps=True,temperature=0,initial_prompt=None,condition_on_previous_text=False,verbose=False)
                expected,actual=tokens(row['text']),tokens(heard['text'])
                changes=[{'kind':tag,'expected':expected[i:j],'heard':actual[k:l]} for tag,i,j,k,l in difflib.SequenceMatcher(None,expected,actual,autojunk=False).get_opcodes() if tag!='equal']
                result={'id':row['id'],'expected':row['text'],'transcript':heard['text'],'audio_sha256':sha,'source_sha256':row['source_sha256'],'changes':changes,'words':[w for s in heard['segments'] for w in s.get('words',[])],'segments':heard['segments'],'model':'mlx-community/whisper-large-v3-turbo-q4','listening':'Not established by ASR'}
                cache.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:result[k] for k in ['id','transcript','changes']}),flush=True)
            expected,actual=tokens(row['text']),tokens(result['transcript'])
            result['changes']=[{'kind':tag,'expected':expected[i:j],'heard':actual[k:l]} for tag,i,j,k,l in difflib.SequenceMatcher(None,expected,actual,autojunk=False).get_opcodes() if tag!='equal']
            results.append(result)
        (out/'review.json').write_text(json.dumps(results,indent=2)+'\n')
        if not a.follow or len(results)==total:break
        time.sleep(15)
if __name__=='__main__':main()
