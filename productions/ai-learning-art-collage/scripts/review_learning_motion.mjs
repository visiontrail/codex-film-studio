import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {createCanvas} from '@napi-rs/canvas'
import {init} from '../src/film.mjs'
import {background} from '../src/backgrounds.mjs'
import {offloadMotionScene,targetMotionScene} from '../src/learning-motion-scenes.mjs'
const out='review/revisions/v8-learning-motion'
fs.mkdirSync(out,{recursive:true})
const timeline=await init('media/timeline.json')
const phases=[.02,.10,.20,.34,.49,.63,.77,.88,.98],records=[]
const hash=x=>crypto.createHash('sha256').update(x).digest('hex')
for(const id of ['24','25']){
  const s=timeline.shots.find(x=>x.id===id),render=id==='24'?offloadMotionScene:targetMotionScene
  const sheet=createCanvas(1440,876),sg=sheet.getContext('2d')
  sg.fillStyle='#222';sg.fillRect(0,0,sheet.width,sheet.height)
  for(const [i,p] of phases.entries()){
    const f=Math.floor((s.end-s.start-1)*p),actual=f/(s.end-s.start)
    const c=createCanvas(1920,1080),g=c.getContext('2d')
    background(g,s.bg,s.start+f,s.index);render(g,s,f/25,actual)
    const file=path.join(out,`shot-${id}-phase-${String(Math.round(p*100)).padStart(2,'0')}.png`),raw=c.toBuffer('image/png')
    fs.writeFileSync(file,raw)
    const x=i%3*480,y=Math.floor(i/3)*292
    sg.fillStyle='#fff';sg.font='16px sans-serif';sg.fillText(`S${id} F${s.start+f} p=${p}`,x+8,y+17);sg.drawImage(c,x,y+22,480,270)
    records.push({id,phase:p,actual_fraction:actual,frame:s.start+f,file,sha256:hash(raw),dimensions:[1920,1080],actually_opened:false})
  }
  fs.writeFileSync(path.join(out,`shot-${id}-phases.jpg`),sheet.toBuffer('image/jpeg',93))
  console.log(`Rendered nine native phase PNGs for S${id}`)
}
// Repeat a nonsequential request to catch any accidental stateful animation.
const s=timeline.shots.find(x=>x.id==='25'),f=Math.floor((s.end-s.start-1)*.49)
const c=createCanvas(1920,1080),g=c.getContext('2d');background(g,s.bg,s.start+f,s.index);targetMotionScene(g,s,f/25,f/(s.end-s.start))
const deterministic=hash(c.toBuffer('image/png'))===records.find(x=>x.id==='25'&&x.phase===.49).sha256
if(!deterministic)throw new Error('Repeated S25 frame differs')
fs.writeFileSync(path.join(out,'phase-manifest.json'),JSON.stringify({source:'src/learning-motion-scenes.mjs',source_sha256:hash(fs.readFileSync('src/learning-motion-scenes.mjs')),timeline_sha256:hash(fs.readFileSync('media/timeline.json')),representation:'Native source-render phase PNGs; not encoded delivery review',deterministic_repeat_pass:deterministic,records},null,2)+'\n')
