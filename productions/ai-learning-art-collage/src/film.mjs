import fs from 'node:fs'
import {createCanvas} from '@napi-rs/canvas'
import {W,H,FPS,assets,clamp,smooth} from './materials.mjs'
import {background} from './backgrounds.mjs'
import * as hero from './hero-scenes.mjs'
import * as critical from './critical-scenes.mjs'
import * as practice from './practice-scenes.mjs'
import * as evidence from './evidence-scenes.mjs'
import {errorScene,rebuildScene} from './reconstruction-scenes.mjs'
import {helpSceneV8,immediateSceneV8,offloadSceneV8} from './motion-v8-scenes.mjs'
import {offloadMotionScene,targetMotionScene} from './learning-motion-scenes.mjs'

export let timeline
const holds=new Map()
export async function init(timelinePath='media/timeline.json'){
  await assets()
  timeline=JSON.parse(fs.readFileSync(timelinePath,'utf8'))
  holds.clear()
  return timeline
}
const scenes={
  desk:hero.deskScene,title:hero.titleScene,
  metrics:critical.metricScene,boundary:critical.boundaryScene,
  two_tools:hero.toolsScene,help_logs:hero.helpScene,target:hero.targetScene,
  physics:hero.physicsScene,quality:hero.qualityScene,offload:hero.offloadScene,
  equation:hero.equationScene,transfer:hero.equationScene,closing:hero.closingScene,
  study:evidence.studyScene,scoreboard:evidence.scoreScene,feedback:evidence.feedbackScene,
  delayed:evidence.delayedScene,research_table:evidence.researchScene,fade_support:evidence.fadeScene,
  retrieval:practice.retrieval,novice:practice.novice,sequence:practice.sequence,
  protocol:practice.protocol,calendar:practice.calendar,log:practice.log,
}
const sceneOverrides={'16':helpSceneV8,'20':immediateSceneV8,'23':offloadSceneV8,'24':offloadMotionScene,'25':targetMotionScene}
const pushIn=new Set(['04','18','23','46'])
function shot(g,s,f){
  const t=f/FPS,p=clamp(f/(s.end-s.start))
  g.save()
  background(g,s.bg||'white',s.start+f,s.index)
  if(pushIn.has(s.id)){
    const z=1+.022*smooth(p)
    g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2,-H/2)
  }
  const render=sceneOverrides[s.id]||(s.id==='10'?hero.turkeyScene:s.id==='39'?errorScene:s.id==='40'?rebuildScene:scenes[s.scene_type])
  if(!render)throw new Error(`Unimplemented scene ${s.id}: ${s.scene_type}`)
  render(g,s,t,p)
  g.restore()
}
function previousFrame(s){
  const prev=timeline.shots[s.index-1]
  if(!holds.has(prev.id)){
    const c=createCanvas(W,H)
    shot(c.getContext('2d'),prev,prev.end-prev.start-1)
    holds.set(prev.id,c)
    if(holds.size>3)holds.delete(holds.keys().next().value)
  }
  return holds.get(prev.id)
}
// Chapter changes use paper reveals; related shots can cut cleanly.
const transitions={'04':'columns','06':'columns','10':'diagonal','15':'left','18':'diagonal','23':'left','28':'diagonal','31':'columns','34':'columns','36':'left','45':'diagonal','46':'columns'}
function reveal(g,kind,e){
  g.beginPath()
  if(kind==='columns'){
    for(let i=0;i<3;i++){
      const q=clamp((e-i*.12)/.76),height=q*(H+70)
      const top=i%2?H-height:-20
      g.rect(i*W/3-2,top,W/3+4,height+20)
    }
  }else if(kind==='diagonal'){
    const x=e*(W+H+100)-H-50
    g.moveTo(-10,-10);g.lineTo(x+H,-10)
    for(let y=0;y<=H+20;y+=18)g.lineTo(x+H-y+Math.sin(y*.13)*5,y)
    g.lineTo(-10,H+20);g.closePath()
  }else{
    const x=e*(W+60)-30
    g.moveTo(-10,-10);g.lineTo(x,-10)
    for(let y=0;y<=H+20;y+=16)g.lineTo(x+Math.sin(y*.47)*6,y)
    g.lineTo(-10,H+20);g.closePath()
  }
  g.clip()
}
export function draw(g,frame){
  const s=timeline.shots.find(x=>frame>=x.start&&frame<x.end)||timeline.shots.at(-1)
  const f=frame-s.start,kind=transitions[s.id]
  if(kind&&s.index>0&&f<22){
    g.drawImage(previousFrame(s),0,0)
    g.save();reveal(g,kind,smooth(f/21));shot(g,s,f);g.restore()
  }else shot(g,s,f)
}
