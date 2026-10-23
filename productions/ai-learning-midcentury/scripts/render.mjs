import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { render } from '../src/film.mjs'
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for(const [file,family] of [['AlfaSlabOne.ttf','Slab'],['OleoScript.ttf','Oleo'],['Jost.ttf','Jost'],['JostMedium.ttf','JostMedium'],['JostSemiBold.ttf','JostSemiBold']])GlobalFonts.registerFromPath(path.join(ROOT,'assets/fonts',file),family)
const args=process.argv.slice(2),opt=(n,d)=>{const i=args.indexOf(n);return i<0?d:args[i+1]}
const timeline=JSON.parse(fs.readFileSync(path.join(ROOT,'content/timeline.json')))
const width=Number(opt('--width','1920')),height=width*9/16,canvas=createCanvas(width,height),c=canvas.getContext('2d')
function draw(f){c.resetTransform();c.clearRect(0,0,width,height);c.scale(width/1920,height/1080);render(c,f,timeline)}
if(args.includes('--stills')){
  const dir=path.join(ROOT,'review/stills');fs.mkdirSync(dir,{recursive:true})
  for(const s of timeline.shots){const f=Math.min(s.end-18,s.start+Math.max(60,Math.floor((s.end-s.start)*.58)));draw(f);fs.writeFileSync(path.join(dir,`${s.id}-${s.scene}.png`),canvas.toBuffer('image/png'))}
  console.log(`Rendered ${timeline.shots.length} full-size review stills`)
}else if(args.includes('--frame')){
  const f=Number(opt('--frame','0'));draw(f);const out=opt('--out',`review/frame-${f}.png`);fs.writeFileSync(path.resolve(ROOT,out),canvas.toBuffer('image/png'));console.log(out)
}else{
  const start=Number(opt('--start','0')),end=Number(opt('--end',String(timeline.duration_frames))),out=path.resolve(ROOT,opt('--out','media/picture.mp4'))
  fs.mkdirSync(path.dirname(out),{recursive:true})
  const ff=spawn(path.join(ROOT,'scripts/bin/ffmpeg'),['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${height}`,'-framerate','24','-i','-','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',out],{stdio:['pipe','ignore','inherit']})
  ff.stdin.on('error',e=>{console.error(e);process.exitCode=1})
  const begin=Date.now()
  for(let f=start;f<end;f++){
    draw(f);const rgba=c.getImageData(0,0,width,height).data
    if(!ff.stdin.write(rgba))await once(ff.stdin,'drain')
    if((f-start)%240===0)console.log(JSON.stringify({frame:f,end,seconds:(Date.now()-begin)/1000}))
  }
  ff.stdin.end();const [code]=await once(ff,'close');if(code)throw Error(`Encoder exit ${code}`)
  console.log(JSON.stringify({file:out,frames:end-start,render_seconds:(Date.now()-begin)/1000}))
}
