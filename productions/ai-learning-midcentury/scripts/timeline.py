"""One integer-frame edit for speech, drawings, transitions and score accents."""
import argparse
import json
from pathlib import Path
import math
from transcribe import tokens

ROOT=Path(__file__).resolve().parents[1]
FPS=24
# Caption cards are intentional visual summaries; SRT contains verbatim speech.
CARDS=[
 'The page is finished. Is the learning?', 'What remains when the help goes away?',
 'Help now. Alone. Later. Somewhere new.', 'Practice grades: +48% relative to control.',
 'Unaided exam grades: −17% relative to control.', 'Teacher-designed hints changed the outcome.',
 'Tutor design matters.', 'An immediate test is not a long-term test.',
 'Keep the thinking you need to practise.', 'Step one. Make an attempt.',
 'New topic? Start with a worked example.', 'Ask for the next useful hint.',
 'Undo the addition first.', 'Step two. Hide the answer.',
 'Explain why each step works.', 'Check. Correct. Try again.',
 'Step three. Change the problem.', 'Choose the method in a new situation.',
 'Return later. Try without the tool.', 'Attempt. Explain. Check. Transfer. Return.',
 'Match the help to the learner and the task.', 'What can you do when the answer is gone?'
]
PURPOSES=[
 'Ada closes a completed answer and hesitates over an empty page.',
 'Title opens from the empty answer circle; Ada presents the question.',
 'Four physical medallions expose four different outcome measures.',
 'A Turkish classroom and a GPT-4 terminal establish the randomized study; the practice result stamps onto paper.',
 'The screen is covered. A second test paper reveals the independent-performance reversal.',
 'The answer card becomes a hint card; show mitigation without inventing an exam gain.',
 'A physics learner tests a pendulum with a structured tutor; establish a separate experiment.',
 'A moving calendar and clock distinguish immediate testing from later memory.',
 'Ada moves the terminal aside to put her own working sheet in the centre.',
 'First numbered medallion; Ada writes her own attempt.',
 'Open example book supports a novice without pretending unassisted struggle is always best.',
 'Round detail callout shows the specific hint request and a partial response.',
 'Close-up of the actual algebra and subtraction action.',
 'Second numbered medallion; a large gloved hand shuts the computer.',
 'An overhead page reveals the reasoning one step at a time.',
 'Ada substitutes the result into the original equation and stamps a check.',
 'Third numbered medallion; the algebra sheet becomes a shop problem.',
 'Two notebooks, a delivery tag and a receipt establish a real transfer example.',
 'Calendar page turns; a clean question awaits Ada with the computer closed.',
 'Pull back from the detail into the three-step manual card.',
 'Tip ribbon makes the practical limits explicit.',
 'Return to Ada and a new successful page, then close into a circular end card.'
]
ANCHORS={'hook':('close','close'),'turkey':('result','forty'),'exam':('result','seventeen'),'algebra':('subtract','undo'),'step2':('close','close'),'retrieve':('divide','divides'),'feedback':('check','eleven'),'transfer':('equation','equation'),'later':('later','later')}
def main():
    p=argparse.ArgumentParser();p.add_argument('--draft',action='store_true');a=p.parse_args()
    lines=json.loads((ROOT/'content/narration.json').read_text())
    ap=ROOT/'media/audio/manifest.json';audio={x['id']:x for x in json.loads(ap.read_text())} if ap.exists() else {}
    rp=ROOT/'media/asr/review.json';asr={x['id']:x for x in json.loads(rp.read_text())} if rp.exists() else {}
    if not a.draft and set(audio)!={x['id'] for x in lines}:raise ValueError('All actual speech is required for final timing')
    if not a.draft:
        for line in lines:
            row=audio[line['id']];report=asr.get(line['id'])
            if not report or report['audio_sha256']!=row['audio_sha256']:raise ValueError('Current WAV requires independent transcription')
            if report['changes']:
                second_path=ROOT/f"media/asr/{line['id']}-independent-medium.json"
                second=json.loads(second_path.read_text()) if second_path.exists() else {}
                if second.get('audio_sha256')!=row['audio_sha256'] or tokens(second.get('text',''))!=tokens(line['text']):raise ValueError(f"Unresolved transcription difference in {line['id']}")
    shots=[];events=[];f=0
    for i,line in enumerate(lines):
        row=audio.get(line['id']);dur=row['duration'] if row else len(line['text'].split())/2.65
        duration=math.ceil(max(dur+1.65,11 if line['scene']=='transfer' else 6.8)*FPS/12)*12
        voice=f+18
        shot={**line,'start':f,'end':f+duration,'voice_start':voice,'voice_duration':dur,'audio':row['path'] if row else None,'caption':CARDS[i],'purpose':PURPOSES[i],'reference_range':[[0,174],[42,174],[744,878],[175,300],[175,300],[307,430],[307,430],[655,744],[175,300],[175,300],[307,430],[325,420],[438,526],[438,526],[528,655],[307,430],[175,300],[528,655],[655,744],[744,878],[655,744],[878,960]][i]}
        # Primary action happens after an actual spoken cue when available.
        shot['action']=f+round(min(2.2,dur*.4)*FPS)
        if line['scene'] in ANCHORS:
            name,word=ANCHORS[line['scene']]
            found=next((w for w in asr.get(line['id'],{}).get('words',[]) if w['word'].lower().strip('.,?!:; $%') in {'forty':['forty','48'],'seventeen':['seventeen','17'],'eleven':['eleven','11']}.get(word,[word])),None)
            if found:shot['action']=voice+round(found['start']*FPS)
            events.append({'id':line['scene']+'-'+name,'frame':shot['action'],'kind':'click' if name=='close' else 'stamp'})
        else:events.append({'id':line['scene']+'-reveal','frame':shot['action'],'kind':'paper'})
        events.append({'id':line['scene']+'-transition','frame':f,'kind':'swish'})
        shot['cues']={key:voice+round(w['start']*FPS) for key in ['subtracts','divides','number'] for w in asr.get(line['id'],{}).get('words',[]) if w['word'].lower().strip('.,?!:; ')==key}
        shots.append(shot);f+=duration
    credits={'id':'23','scene':'credits','start':f,'end':f+120,'voice_start':f,'voice_duration':0,'audio':None,'text':'','caption':'','purpose':'Circular end title and source attribution.','reference_range':[891,960],'action':f}
    shots.append(credits);f+=120
    timeline={'fps':FPS,'duration_frames':f,'draft':a.draft,'bpm':132,'shots':shots,'events':events}
    (ROOT/'content/timeline.json').write_text(json.dumps(timeline,indent=2)+'\n')
    print(json.dumps({'seconds':f/FPS,'frames':f,'shots':len(shots),'draft':a.draft}))
if __name__=='__main__':main()
