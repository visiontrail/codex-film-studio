"""Verbatim source subtitles, timed by an independent word alignment."""
import difflib
import json
from pathlib import Path
import re
from transcribe import tokens
ROOT=Path(__file__).resolve().parents[1]
def stamp(t,sep=','):
    n=round(t*1000);h,n=divmod(n,3600000);m,n=divmod(n,60000);s,ms=divmod(n,1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'
def main():
    tl=json.loads((ROOT/'content/timeline.json').read_text());reports={r['id']:r for r in json.loads((ROOT/'media/asr/review.json').read_text())};cues=[]
    for shot in tl['shots']:
        if not shot['text']:continue
        words=shot['text'].split();expected=[];owners=[]
        for i,w in enumerate(words):
            terms=tokens(w);expected.extend(terms);owners.extend([i]*len(terms))
        heard=[];times=[]
        for w in reports[shot['id']]['words']:
            terms=tokens(w['word']);heard.extend(terms);times.extend([(w['start'],w['end'])]*len(terms))
        spans={}
        for block in difflib.SequenceMatcher(None,expected,heard,autojunk=False).get_matching_blocks():
            for j in range(block.size):spans.setdefault(owners[block.a+j],[]).append(times[block.b+j])
        aligned=[]
        for i,w in enumerate(words):
            if i in spans:start=min(x[0] for x in spans[i]);end=max(x[1] for x in spans[i])
            else:
                prev=max((k for k in spans if k<i),default=None);nxt=min((k for k in spans if k>i),default=None)
                start=max(x[1] for x in spans[prev]) if prev is not None else 0
                end=min(x[0] for x in spans[nxt]) if nxt is not None else shot['voice_duration']
            aligned.append((w,start,end))
        group=[]
        def emit():
            if not group:return
            txt=' '.join(w[0] for w in group)
            if len(txt)>46:
                gaps=[i for i,c in enumerate(txt) if c==' '];pivot=min(gaps,key=lambda i:abs(i-len(txt)/2));txt=txt[:pivot]+'\n'+txt[pivot+1:]
            offset=shot['voice_start']/24
            cues.append({'start':offset+group[0][1],'end':offset+max(group[-1][2],group[0][1]+.45),'text':txt})
        for w in aligned:
            if group and (len(' '.join(x[0] for x in group))+len(w[0])+1>78 or w[2]-group[0][1]>4.8):emit();group=[]
            group.append(w)
            if w[0].endswith(('.', '?', '!')):emit();group=[]
        emit()
    for a,b in zip(cues,cues[1:]):a['end']=min(a['end']+.10,b['start']-.01)
    srt='\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(cues))+'\n'
    vtt='WEBVTT\n\n'+'\n\n'.join(f'{stamp(c["start"],".")} --> {stamp(c["end"],".")}\n{c["text"]}' for c in cues)+'\n'
    (ROOT/'media/narration.en.srt').write_text(srt);(ROOT/'media/narration.en.vtt').write_text(vtt)
    (ROOT/'review/subtitle-cues.json').write_text(json.dumps(cues,indent=2));print(f'{len(cues)} source-aligned subtitle cues')
if __name__=='__main__':main()
