import fs from 'node:fs';
import {once} from 'node:events';
import {Film} from '../src/film.mjs';
const film=new Film();
if(process.argv.includes('--stills')){
 fs.mkdirSync('review/stills',{recursive:true});
 for(let sc of film.timeline.scenes){let frame=sc.start+Math.floor((sc.end-sc.start)*.55);let image=film.render(frame);fs.writeFileSync(`review/stills/${sc.id}.png`,image.toBuffer('image/png'));console.error(sc.id,frame);}
}else{
 let at=process.argv.indexOf('--range'),start=at>=0?+process.argv[at+1]:0,end=at>=0?+process.argv[at+2]:film.timeline.total_frames;
 for(let f=start;f<end;f++){const canvas=film.render(f),raw=canvas.getContext('2d').getImageData(0,0,1920,1080).data;if(!process.stdout.write(Buffer.from(raw.buffer)))await once(process.stdout,'drain');if(f%48===0&&global.gc)global.gc();if(f%48===0)console.error(`frame ${f}/${end}`);}
}
