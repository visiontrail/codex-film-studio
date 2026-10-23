"""Build integer-frame edit, captions and mouth envelopes from measured speech."""
import argparse,json,wave,hashlib,math,re
from pathlib import Path
import numpy as np
from align import align_captions
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--draft',action='store_true');a=p.parse_args()
alignment=[]
fps=24;lines=json.loads((ROOT/'content/script.json').read_text());shots=[];cues=[];cursor=48;previous='home';words=[]
def add(kind,world,duration,line=None):
 global cursor
 item={'id':f'S{len(shots):03}','kind':kind,'world':world,'start':cursor,'end':cursor+duration}
 if line:item.update(line=line['id'],shot=line['shot'])
 shots.append(item);cursor+=duration;return item
shots.append({'id':'S000','kind':'cold','world':'home','start':0,'end':48})
for line in lines:
 if line['world']!=previous:
  add('departure',previous,24);add('arrival',line['world'],34);previous=line['world']
  cues.append({'id':'portal-'+line['id'],'frame':cursor-58,'kind':'portal'})
 if line['id']=='L005':add('title','odds',55)
 wav=ROOT/'media/speech'/f"{line['id']}.wav";env=[];spectral=[]
 if wav.exists():
  with wave.open(str(wav),'rb') as w:sr=w.getframerate();samples=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float64)/32768;channels=w.getnchannels()
  if channels>1:samples=samples.reshape(-1,channels).mean(1)
  duration=len(samples)/sr
  active=samples[np.abs(samples)>.015];active_rms=float(np.sqrt(np.mean(active**2))) if len(active) else .09
  mouth_gain=min(3.0,max(.4,.09/max(active_rms,.001)))
  for fr in range(math.ceil(duration*12)):
   seg=samples[round(fr*sr/12):round((fr+1)*sr/12)];rms=float(np.sqrt(np.mean(seg**2))) if len(seg) else 0;env.append(round(min(1,rms*12*mouth_gain),4));spec=np.abs(np.fft.rfft(seg*np.hanning(len(seg)))) if len(seg) else np.zeros(1);freq=np.fft.rfftfreq(len(seg),1/sr) if len(seg) else np.zeros(1);spectral.append(round(float((spec*freq).sum()/max(spec.sum(),1e-9)),2))
  audio_hash=hashlib.sha256(wav.read_bytes()).hexdigest()
 elif a.draft:duration=max(1.0,len(line['text'].split())/2.8);audio_hash=None
 else:raise RuntimeError('Missing '+str(wav))
 pre=5;tail=12 if line['speaker']=='bo' else 14
 if line['id'] in ['L003','L011','L016','L020','L028','L035','L043']:tail=24
 if line['id']=='L048':pre=10;tail=65
 if line['id']=='L051':tail=43
 duration_frames=math.ceil(duration*fps);shot=add('dialogue',line['world'],pre+duration_frames+tail,line)
 cue={**line,'start':shot['start']+pre,'end':shot['start']+pre+duration_frames,'duration':duration,'audio_sha256':audio_hash,'rms12':env,'centroid12':spectral};cues.append(cue)
 asr_path=ROOT/'review/asr'/f"{line['id']}.json"
 if asr_path.exists() and audio_hash:
  asr=json.loads(asr_path.read_text())
  if asr['sha256']!=audio_hash:raise RuntimeError('Stale ASR '+line['id'])
  caps,report=align_captions(line,asr,duration,fps);alignment.append({'id':line['id'],**report})
  anchors={'L010':{'payout':'Either winner','keep':'Ten stays'},'L015':{'run':'Every selection','crash':'All three'},'L023':{'try1':'One more try','try2':'Another try'}}.get(line['id'],{})
  cue['beats']={}
  tokens=[re.sub(r'[^a-z0-9]','',w.lower()) for w,_ in report['word_starts']]
  for name,phrase in anchors.items():
   target=[re.sub(r'[^a-z0-9]','',w.lower()) for w in phrase.split()];matches=[i for i in range(len(tokens)) if tokens[i:i+len(target)]==target];assert len(matches)==1
   cue['beats'][name]=round(report['word_starts'][matches[0]][1]*fps)/fps
  for cap in caps:words.append({**cap,'start':cap['start']+cue['start'],'end':cap['end']+cue['start']})
  continue
 if not a.draft:raise RuntimeError('Missing independent ASR '+line['id'])
 # Draft-only estimated captions for missing audio. Forbidden in final mode.
 parts=re.findall(r'[^.!?—]+[.!?—]?',line['text']);chunks=[]
 for part in parts:
  ws=part.strip().split()
  while ws:
   chunks.append(' '.join(ws[:12]));ws=ws[12:]
 total=sum(len(c) for c in chunks);pos=cue['start']
 for j,c in enumerate(chunks):
  end=cue['end'] if j==len(chunks)-1 else pos+round(duration_frames*len(c)/total)
  words.append({'start':pos,'end':end,'text':c,'speaker':line['speaker'],'line':line['id']});pos=end
add('end','home',96)
cut_specs=json.loads((ROOT/'content/cuts.json').read_text());edited=[];alignment_by_id={r['id']:r for r in alignment}
for shot in shots:
 specs=cut_specs.get(shot.get('line'),[]) if shot['kind']=='dialogue' else []
 if not specs:edited.append(shot);continue
 cue=next(c for c in cues if c['id']==shot['line']);tokens=cue['text'].replace('Fan Duel','FanDuel').replace('Draft Kings','DraftKings').split();normalized=[re.sub(r'[^a-z0-9]','',w.lower()) for w in tokens]
 cuts=[]
 for spec in specs:
  target=[re.sub(r'[^a-z0-9]','',w.lower()) for w in spec['at'].split()];matches=[i for i in range(len(tokens)) if normalized[i:i+len(target)]==target];assert len(matches)==1,(shot['line'],spec)
  index=matches[0];report=alignment_by_id.get(shot['line']);seconds=report['word_starts'][index][1] if report else cue['duration']*index/len(tokens);at=cue['start']+round(seconds*fps)
  if at-shot['start']>=12 and shot['end']-at>=12:cuts.append((at,spec['shot']))
 current=shot.copy()
 for at,role in sorted(cuts):
  edited.append({**current,'end':at});current={**shot,'start':at,'shot':role,'continuation':True}
 edited.append(current)
shots=edited
entry=0;last_world=None
for i,shot in enumerate(shots):
 shot['id']=f'S{i:03}'
 if shot['world']!=last_world:entry=shot['start'];last_world=shot['world']
 shot['world_entry']=entry
for current,following in zip(words,words[1:]):
 if current['end']>following['start']:current['end']=following['start']
 assert current['end']>current['start'],current
out={'fps':fps,'width':1920,'height':1080,'duration_frames':cursor,'draft':a.draft,'shots':shots,'cues':cues,'captions':words}
(ROOT/'content/timeline.json').write_text(json.dumps(out,indent=2))
print('timeline',cursor,'frames',round(cursor/fps,2),'seconds',len(shots),'shots')

(ROOT/'review/alignment.json').write_text(json.dumps(alignment,indent=2))
def stamp(frame):
 ms=round(frame/fps*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
if not a.draft:
 (ROOT/'content/english.srt').write_text('\n'.join(f"{i+1}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}\n" for i,c in enumerate(words)))
