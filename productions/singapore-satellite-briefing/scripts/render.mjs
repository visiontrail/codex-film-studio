import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import {fileURLToPath} from 'node:url'
import {spawn} from 'node:child_process'
import {once} from 'node:events'
import {chromium} from 'playwright'
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url))),argv=process.argv.slice(2)
const opt=(k,d)=>argv.includes(k)?argv[argv.indexOf(k)+1]:d
const timeline=JSON.parse(fs.readFileSync(path.join(ROOT,'content/timeline.json')))
if(!argv.includes('--stills')&&!argv.includes('--frame')&&!JSON.parse(fs.readFileSync(path.join(ROOT,'content/imagery.json'))).plates.some(p=>p.id==='metro'))throw Error('The intermediate EOX imagery plate is required for a video export')
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.wav':'audio/wav'}
const server=http.createServer((req,res)=>{const url=decodeURIComponent(req.url.split('?')[0]);const f=path.join(ROOT,url==='/'?'index.html':url);if(!f.startsWith(ROOT)||!fs.existsSync(f)){res.writeHead(404);res.end();return}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)})
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--enable-webgl','--use-angle=metal','--ignore-gpu-blocklist']})
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});page.on('pageerror',e=>console.error(e));await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.READY||window.BOOT_ERROR,{},{timeout:120000});const error=await page.evaluate(()=>window.BOOT_ERROR);if(error)throw Error(error)
await page.locator('#controls').evaluate(el=>el.remove())
const stateFile=path.join(ROOT,'review/render-state.jsonl')
fs.mkdirSync(path.dirname(stateFile),{recursive:true})
if(argv.includes('--stills')){
 fs.mkdirSync(path.join(ROOT,'review/stills'),{recursive:true});const frames=[0,18,48,96,144,192,...timeline.shots.map(s=>Math.min(s.end-1,s.start+Math.round((s.end-s.start)*.60)))];for(const frame of frames){const state=await page.evaluate(f=>window.renderFrame(f),frame);const file=path.join(ROOT,`review/stills/${String(frame).padStart(5,'0')}-${state.scene}.jpg`);await page.screenshot({path:file,type:'jpeg',quality:93});console.log(path.basename(file))}
}else if(argv.includes('--frame')){
 const frame=+opt('--frame',0);await page.evaluate(f=>window.renderFrame(f),frame);await page.screenshot({path:path.join(ROOT,opt('--out',`review/frame-${frame}.png`))})
}else{
 const start=+opt('--start',0),end=+opt('--end',timeline.duration_frames),output=path.join(ROOT,opt('--out','media/picture.mp4'));fs.mkdirSync(path.dirname(output),{recursive:true})
 const encoder=spawn(path.join(ROOT,'.venv/bin/python'),[path.join(ROOT,'scripts/ffmpeg_gate.py'),'ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(timeline.fps),'-vcodec','mjpeg','-i','-','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']})
 encoder.stdin.on('error',e=>console.error('encoder stdin',e.message));const states=fs.createWriteStream(stateFile),begin=Date.now()
 for(let frame=start;frame<end;frame++){const state=await page.evaluate(f=>window.renderFrame(f),frame);states.write(JSON.stringify(state)+'\n');const image=await page.screenshot({type:'jpeg',quality:94});if(!encoder.stdin.write(image))await once(encoder.stdin,'drain');if((frame-start)%120===0)console.log(JSON.stringify({frame,end,elapsed:(Date.now()-begin)/1000}))}
 states.end();encoder.stdin.end();const [code]=await once(encoder,'close');if(code)throw Error(`ffmpeg exited ${code}`);console.log(output)
}
await browser.close();await new Promise(r=>server.close(r))
