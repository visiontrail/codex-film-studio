"""Align exact editorial captions to independently recognized words."""
import difflib,re,math
import numpy as np

def norm(w):return re.sub(r'[^a-z0-9]','',w.lower())
def align_captions(line,asr,duration,fps=24):
 script=line['text'].replace('Fan Duel','FanDuel').replace('Draft Kings','DraftKings').split()
 observed=[w for seg in asr['segments'] for w in seg.get('words',[])]
 if not observed:raise ValueError('No recognized words')
 raw=[norm(w['word']) for w in observed];expected=[norm(w) for w in script]
 matcher=difflib.SequenceMatcher(None,expected,raw,autojunk=False)
 starts={};ends={}
 for block in matcher.get_matching_blocks():
  for j in range(block.size):
   i=block.a+j;w=observed[block.b+j];starts[i]=w['start'];ends[i]=w['end']
 if not starts:raise ValueError('No matched words')
 # Interpolation applies only to changed written forms, e.g. ten / 10 or FanDuel.
 anchors=sorted(starts);times=np.interp(np.arange(len(script)),anchors,[starts[i] for i in anchors]);last_end=min(duration,observed[-1]['end']+.08)
 if anchors[0]>0:times[:anchors[0]]=np.linspace(max(0,observed[0]['start']),times[anchors[0]],anchors[0]+1)[:-1]
 boundaries=[];begin=0
 for i,w in enumerate(script):
  if (re.search(r'[.!?—]$',w) and i-begin>=2) or i-begin>=10 or i==len(script)-1:
   end=ends.get(i,times[i+1] if i+1<len(script) else last_end);end=max(end,times[begin]+.15)
   next_start=times[i+1] if i+1<len(script) else duration
   boundaries.append({'start':math.floor(times[begin]*fps),'end':min(math.ceil(duration*fps),math.ceil(min(next_start,max(end+.08,times[begin]+.3))*fps)),'text':' '.join(script[begin:i+1]),'speaker':line['speaker'],'line':line['id']});begin=i+1
 return boundaries,{'matched_words':len(starts),'script_words':len(script),'asr_words':len(observed),'raw_word_match_ratio':round(matcher.ratio(),4),'asr_text':asr['text'],'unmatched_script':[(i,w) for i,w in enumerate(script) if i not in starts],'word_starts':[(w,round(float(times[i]),5)) for i,w in enumerate(script)]}
