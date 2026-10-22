import fs from 'node:fs'
import path from 'node:path'
import {createCanvas} from '@napi-rs/canvas'
import {init,draw} from '../src/film.mjs'
const args=process.argv.slice(2),arg=(n,d)=>args.includes(n)?args[args.indexOf(n)+1]:d
const timeline=await init(arg('--timeline','media/timeline.json'))
const from=Number(arg('--from','1')),to=Number(arg('--to','46')),out=arg('--out','review/phases')
fs.mkdirSync(out,{recursive:true})
const phases=[.02,.18,.4,.6,.8,.98],records=[]
for(const s of timeline.shots.filter(s=>Number(s.id)>=from&&Number(s.id)<=to)){
 const sheet=createCanvas(1280,1146),sg=sheet.getContext('2d')
 sg.fillStyle='#222';sg.fillRect(0,0,1280,1146)
 for(let i=0;i<phases.length;i++){
  const frame=s.start+Math.floor((s.end-s.start-1)*phases[i]),c=createCanvas(640,360),g=c.getContext('2d')
  g.scale(1/3,1/3);draw(g,frame)
  const x=i%2*640,y=Math.floor(i/2)*382
  sg.fillStyle='#fff';sg.font='16px sans-serif';sg.fillText(`Shot ${s.id} | frame ${frame} | phase ${phases[i]}`,x+8,y+17)
  sg.drawImage(c,x,y+22)
 }
 const file=path.join(out,`${s.id}.jpg`);fs.writeFileSync(file,sheet.toBuffer('image/jpeg',92))
 records.push({id:s.id,file,phases,frames:phases.map(p=>s.start+Math.floor((s.end-s.start-1)*p))})
 console.log('sheet',s.id)
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({timeline:arg('--timeline','media/timeline.json'),representation:'six decoded-state source renders per shot at640x360; not encoded delivery review',records},null,2)+'\n')
