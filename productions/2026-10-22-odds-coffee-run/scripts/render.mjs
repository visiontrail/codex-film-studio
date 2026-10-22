import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';import {once} from 'node:events';
import {drawFilm} from '../src/film.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));process.chdir(root);
for(let [f,family]of [['Baloo2[wght].ttf','Baloo'],['Bungee-Regular.ttf','Bungee'],['VT323-Regular.ttf','VT323']])GlobalFonts.registerFromPath(path.join(root,'assets/fonts',f),family);
const args=process.argv.slice(2),val=(s,d)=>args.includes(s)?args[args.indexOf(s)+1]:d,timeline=JSON.parse(fs.readFileSync('content/timeline.json'));
let width=Number(val('--width',1920)),canvas=createCanvas(width,width*9/16),ctx=canvas.getContext('2d');
fs.mkdirSync('review/stills',{recursive:true});fs.mkdirSync('media',{recursive:true});
if(args.includes('--frames')){for(let frame of val('--frames','0').split(',').map(Number)){drawFilm(ctx,frame,timeline,width);fs.writeFileSync(`review/stills/frame-${frame}.png`,canvas.toBuffer('image/png'))}process.exit(0)}
if(args.includes('--stills')){for(let shot of timeline.shots){if(shot.kind!=='dialogue'&&shot.kind!=='title'&&shot.kind!=='cold')continue;let frame=shot.start+Math.min(60,Math.floor((shot.end-shot.start)*.5));drawFilm(ctx,frame,timeline,width);fs.writeFileSync(`review/stills/${shot.id}-${shot.line||shot.kind}.png`,canvas.toBuffer('image/png'))}console.log('Saved representative stills');process.exit(0)}
let start=Number(val('--start',0)),end=Number(val('--end',timeline.duration_frames)),output=val('--out','media/picture.mp4');
if(timeline.draft&&!args.includes('--draft'))throw Error('Draft audio timing requires --draft');
const py=process.env.FILM_PYTHON||path.join(root,'.venv/bin/python');
const enc=spawn(py,['scripts/ffmpeg_gate.py','ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-r','24','-i','pipe:0','-an','-vf','scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=full:out_range=limited','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
let finished=once(enc,'close');let tick=Date.now();for(let fr=start;fr<end;fr++){drawFilm(ctx,fr,timeline,width);let jpg=canvas.toBuffer('image/jpeg',95);if(!enc.stdin.write(jpg))await once(enc.stdin,'drain');if(fr%240===0)console.log('frame',fr,'of',end,'elapsed',((Date.now()-tick)/1000).toFixed(1))}enc.stdin.end();let [code]=await finished;if(code!==0)throw Error('encode failed '+code);console.log('Rendered',output);
