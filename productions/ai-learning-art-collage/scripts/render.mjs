import fs from 'node:fs'
import {createCanvas} from '@napi-rs/canvas'
import {spawn} from 'node:child_process'
import {once} from 'node:events'
import {init,draw} from '../src/film.mjs'
const args=process.argv.slice(2),arg=(n,d)=>args.includes(n)?args[args.indexOf(n)+1]:d
const timeline=await init(arg('--timeline','media/timeline.json')),width=Number(arg('--width','1920')),height=Math.round(width*9/16)
const c=createCanvas(width,height),g=c.getContext('2d');const render=f=>{g.save();g.scale(width/1920,height/1080);draw(g,f);g.restore()}
fs.mkdirSync('review/stills',{recursive:true})
if(args.includes('--stills')){for(const s of timeline.shots){const frame=s.start+Math.round((s.end-s.start)*.57);render(frame);fs.writeFileSync(`review/stills/${s.id}.png`,c.toBuffer('image/png'));console.log('still',s.id)}process.exit(0)}
if(args.includes('--frame')){const f=Number(arg('--frame','0'));render(f);const out=arg('--out',`review/frame-${f}.png`);fs.writeFileSync(out,c.toBuffer('image/png'));console.log(out);process.exit(0)}
const start=Number(arg('--start','0')),end=Math.min(Number(arg('--end',String(timeline.duration_frames))),timeline.duration_frames),out=arg('--out','media/picture.mp4');fs.mkdirSync('media',{recursive:true})
const encoder=spawn('.venv/bin/python',['scripts/ffmpeg_gate.py','-y','-v','warning','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${height}`,'-framerate',String(timeline.fps),'-i','pipe:0','-an','-c:v','h264_videotoolbox','-b:v',width>=1920?'14M':'6M','-allow_sw','1','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']})
encoder.stdin.on('error',e=>{console.error(e.message);process.exitCode=1})
const done=once(encoder,'exit');const then=Date.now()
for(let f=start;f<end;f++){
  render(f)
  const raw=g.getImageData(0,0,width,height).data
  if(!encoder.stdin.write(Buffer.from(raw.buffer)))await once(encoder.stdin,'drain')
  if((f-start)%50===0&&global.gc)global.gc()
  if((f-start)%250===0)console.log(`${f-start}/${end-start} frames, ${((Date.now()-then)/1000).toFixed(1)} s, RSS ${Math.round(process.memoryUsage().rss/1048576)} MiB`)
}
encoder.stdin.end();const [code]=await done;if(code!==0)throw new Error(`encoder exit ${code}`);console.log(`Saved ${out}`)
