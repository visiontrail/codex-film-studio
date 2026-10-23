import {createCanvas, loadImage, GlobalFonts, Path2D} from '@napi-rs/canvas'
import fs from 'node:fs'
import path from 'node:path'
export const W=1920,H=1080,FPS=25
export const C={paper:'#f4f3ef',ink:'#222620',teal:'#33736f',orange:'#c75232',yellow:'#e5c454',rose:'#d79093',blue:'#8dabbc',gray:'#605d56'}
for(const [file,family] of [['Arial Unicode.ttf','Unicode'],['Arial Bold.ttf','Headline'],['Arial Narrow Bold.ttf','Condensed'],['Georgia.ttf','Editorial'],['Courier New.ttf','Typewriter']]){
 const p='/System/Library/Fonts/Supplemental/'+file
 if(fs.existsSync(p))GlobalFonts.registerFromPath(p,family)
}
export function rng(seed=1){let a=seed|0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x))
export const ease=x=>{x=clamp(x);return 1-Math.pow(1-x,3)}
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x)}
export function enter(t,start=0,d=.6){return ease((t-start)/d)}
export function paperTexture(w=1920,h=1080,seed=54){
 const c=createCanvas(w,h),g=c.getContext('2d'),r=rng(seed),im=g.createImageData(w,h)
 const low=Array.from({length:Math.ceil(h/16)+2},()=>Array.from({length:Math.ceil(w/16)+2},()=>r()*2-1))
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const sx=x/16,sy=y/16,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy
  const n=(low[iy][ix]*(1-fx)+low[iy][ix+1]*fx)*(1-fy)+(low[iy+1][ix]*(1-fx)+low[iy+1][ix+1]*fx)*fy
  const v=(r()-.5)*8+n*8+Math.sin((x+y*2.2)*.33)*1.4
  let i=(y*w+x)*4;im.data[i]=246+v;im.data[i+1]=245+v;im.data[i+2]=241+v;im.data[i+3]=255
 }
 g.putImageData(im,0,0);g.globalAlpha=.09;g.lineWidth=.7
 for(let i=0;i<14500;i++){let x=r()*w,y=r()*h;g.strokeStyle=r()>.5?'white':'#79786d';g.beginPath();g.moveTo(x,y);g.lineTo(x+1+r()*10,y+(r()-.5)*6);g.stroke()}
 return c
}
// Versioned generated scan: stable physical fibres, shared by paper objects.
// It is required for reproducibility; missing source assets must fail loudly.
export const PAPER=await loadImage(new URL('../assets/generated/paper-fiber-v9.png',import.meta.url).pathname)
export function base(g,color=null){g.drawImage(PAPER,0,0,W,H);if(color){g.save();g.globalCompositeOperation='multiply';g.globalAlpha=.25;g.fillStyle=color;g.fillRect(0,0,W,H);g.restore()}}
export function tornPath(g,w,h,seed=1,rag=4){
 const r=rng(seed)
 // Large hand-torn sheets have long uneven tears with small fibres. Small
 // letter clippings retain a nearly straight scissor edge. The seeded contour
 // is fixed in object space, so a held sheet never shimmers between frames.
 const edge=(length,point)=>{
  const broad=rag>4,spacing=broad?38+r()*43:60+r()*40
  const knots=Array.from({length:Math.ceil(length/spacing)+2},()=>r()-.5)
  for(let d=0;d<=length;d+=6){
   const a=d/spacing,k=Math.floor(a),u=smooth(a-k)
   const drift=knots[k]*(1-u)+knots[k+1]*u
   const fibre=(r()-.5)*(broad?.28:.14)
   point(d,rag*(drift*(broad?1.65:.45)+fibre))
  }
  point(length,0)
 }
 g.beginPath();g.moveTo(0,0)
 edge(w,(d,n)=>g.lineTo(d,n))
 edge(h,(d,n)=>g.lineTo(w+n,d))
 edge(w,(d,n)=>g.lineTo(w-d,h+n))
 edge(h,(d,n)=>g.lineTo(n,h-d))
 g.closePath()
}
export function scrap(g,x,y,w,h,{fill=C.paper,rot=0,seed=1,shadow=10,rag=4,texture=true}={}){g.save();g.translate(x,y);g.rotate(rot);tornPath(g,w,h,seed,rag);g.shadowColor='#34302b33';g.shadowBlur=shadow;g.shadowOffsetX=3;g.shadowOffsetY=5;g.fillStyle=fill;g.fill();g.shadowColor='transparent';if(texture){g.clip();g.globalCompositeOperation='multiply';g.globalAlpha=.35;g.drawImage(PAPER,0,0,w,h)}g.restore()}
export function label(g,text,x,y,{size=62,color=C.ink,font='Headline',rot=0,fill=null,pad=15,align='left'}={}){g.save();g.font=`${size}px ${font}, Unicode`;const w=g.measureText(text).width;if(fill)scrap(g,x-pad-(align==='center'?w/2:0),y-size-pad*.4,w+2*pad,size+pad*1.5,{fill,rot,seed:text.length});g.translate(x,y);g.rotate(rot);g.font=`${size}px ${font}, Unicode`;g.fillStyle=color;g.textAlign=align;g.fillText(text,0,0);g.restore();return w}
export function wrap(g,text,x,y,width,{size=42,line=1.25,font='Editorial',color=C.ink,maxLines=10}={}){g.save();g.font=`${size}px ${font}, Unicode`;g.fillStyle=color;let lines=[],s='';for(const word of text.split(' ')){if(g.measureText(s+' '+word).width>width&&s){lines.push(s);s=word}else s+=(s?' ':'')+word}if(s)lines.push(s);lines.slice(0,maxLines).forEach((v,i)=>g.fillText(v,x,y+i*size*line));g.restore();return lines.length*size*line}
export function scribble(g,x,y,w,h,seed=1,color='#242421',alpha=.6){let r=rng(seed);g.save();g.translate(x,y);g.strokeStyle=color;g.globalAlpha=alpha;g.lineWidth=2.8;g.beginPath();for(let k=0;k<110;k++){let a=k*.38;let xx=w*.5+Math.sin(a)*w*.4*(.4+.6*r()),yy=h*.5+Math.cos(a*1.4)*h*.45*(.5+.5*r());if(k===0)g.moveTo(xx,yy);else g.lineTo(xx,yy)}g.stroke();g.restore()}
export function arrow(g,x1,y1,x2,y2,{color=C.ink,width=7,wiggle=12}={}){g.save();g.strokeStyle=color;g.fillStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2+wiggle,(y1+y2)/2-wiggle,x2,y2);g.stroke();let a=Math.atan2(y2-y1,x2-x1);g.translate(x2,y2);g.rotate(a);g.beginPath();g.moveTo(-25,-13);g.lineTo(0,0);g.lineTo(-25,13);g.stroke();g.restore()}
export function star(g,x,y,r=36,color=C.yellow){g.save();g.strokeStyle=color;g.lineWidth=7;g.beginPath();for(let i=0;i<11;i++){let a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.43:r;let xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;if(i===0)g.moveTo(xx,yy);else g.lineTo(xx,yy)}g.stroke();g.restore()}
export function cross(g,x,y,s=30,color=C.orange){g.save();g.strokeStyle=color;g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(x-s,y-s);g.lineTo(x+s,y+s);g.moveTo(x+s,y-s);g.lineTo(x-s,y+s);g.stroke();g.restore()}
export function check(g,x,y,s=30,color=C.teal){g.save();g.strokeStyle=color;g.lineWidth=10;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x-s,y);g.lineTo(x-s*.2,y+s*.7);g.lineTo(x+s*1.2,y-s);g.stroke();g.restore()}
export const images={}
export async function assets(){const dir='assets/generated';if(fs.existsSync(dir))for(const f of fs.readdirSync(dir))if(/\.(png|jpg|webp)$/.test(f))images[path.parse(f).name]=await loadImage(path.join(dir,f))}
export function photo(g,name,x,y,w,h,{rot=0,alpha=1,crop=null,shadow=10}={}){const im=images[name];if(!im)return false;g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=alpha;g.shadowColor='#22222230';g.shadowOffsetX=4;g.shadowOffsetY=7;g.shadowBlur=shadow;if(crop)g.drawImage(im,...crop,0,0,w,h);else g.drawImage(im,0,0,w,h);g.restore();return true}
const FIGURE_BOUNDS=JSON.parse(fs.readFileSync('assets/learner-bounds.json','utf8'))
export function figure(g,pose,x,y,height=650,rot=0){const im=images['learner-sheet'];if(!im)return false;const crop=FIGURE_BOUNDS[pose];return photo(g,'learner-sheet',x,y,height*crop[2]/crop[3],height,{rot,crop})}
export function stamp(g,text,x,y,{size=52,color=C.orange,rot=-.12}={}){g.save();g.translate(x,y);g.rotate(rot);g.font=`${size}px Condensed`;const w=g.measureText(text).width;g.strokeStyle=color;g.lineWidth=5;g.strokeRect(-16,-size-8,w+32,size+30);g.fillStyle=color;g.fillText(text,0,0);g.restore()}
export function flag(g,country,x,y,w=180,h=110,rot=-.04){g.save();g.translate(x,y);g.rotate(rot);scrap(g,0,0,w,h,{fill:'#f4f1e8',seed:40,shadow:7,rag:3});g.save();tornPath(g,w,h,40,3);g.clip();if(country==='TR'){g.fillStyle='#c73037';g.fillRect(0,0,w,h);g.fillStyle='white';g.beginPath();g.arc(w*.39,h*.5,h*.30,0,Math.PI*2);g.fill();g.fillStyle='#c73037';g.beginPath();g.arc(w*.46,h*.5,h*.24,0,Math.PI*2);g.fill();g.fillStyle='white';g.beginPath();for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,rr=(i%2?.075:.18)*h;g.lineTo(w*.67+Math.cos(a)*rr,h*.5+Math.sin(a)*rr)}g.closePath();g.fill()}else if(country==='ID'){g.fillStyle='#c93037';g.fillRect(0,0,w,h/2)}else if(country==='US'){for(let i=0;i<13;i++){g.fillStyle=i%2?'#f2eee1':'#b6323b';g.fillRect(0,i*h/13,w,h/13+.2)}g.fillStyle='#2c3f61';g.fillRect(0,0,w*.4,h*7/13);g.fillStyle='white';for(let row=0;row<9;row++){let count=row%2?5:6;for(let col=0;col<count;col++){let xx=(col+1+(row%2?.5:0))*w*.4/7,yy=(row+1)*h*7/13/10;g.beginPath();for(let a=0;a<10;a++){let theta=-Math.PI/2+a*Math.PI/5,rr=a%2?1.1:2.5;g.lineTo(xx+rr*Math.cos(theta),yy+rr*Math.sin(theta))}g.closePath();g.fill()}}}g.globalCompositeOperation='multiply';g.globalAlpha=.35;g.drawImage(PAPER,0,0,w,h);g.restore();g.restore()}
let chatBadgeInkCache
function chatBadgeInk(){
 if(chatBadgeInkCache)return chatBadgeInkCache
 // The exact filled path comes from the Blossom image on openai.com/brand/.
 // Its source SVG, isolated unchanged path and hashes are in assets/source/.
 const svg=fs.readFileSync(new URL('../assets/source/openai-blossom-mark.svg',import.meta.url),'utf8')
 const d=svg.match(/<path\s+d="([^"]+)"/)?.[1]
 if(!d)throw new Error('Official OpenAI Blossom path is missing')
 const c=createCanvas(1024,1024),g=c.getContext('2d'),mark=new Path2D(d)
 const scale=1000/267.198
 g.save();g.translate(12,12+(1000-264.812*scale)/2);g.scale(scale,scale);g.translate(-146.694,-227.042)
 g.fillStyle='#36594e';g.fill(mark);g.restore()
 // Source-atop keeps every original contour and gap intact. Only ink density
 // varies over the paper grain; there is no path jitter or deformation.
 g.globalCompositeOperation='source-atop';g.globalAlpha=.075;g.drawImage(PAPER,0,0,1024,1024)
 const r=rng(26022);g.fillStyle='#ede9dc';g.globalAlpha=.24
 for(let i=0;i<2800;i++){const x=r()*1024,y=r()*1024;g.fillRect(x,y,.35+r()*1.1,.25+r()*.9)}
 g.globalAlpha=1;g.globalCompositeOperation='source-over'
 chatBadgeInkCache=c;return c
}
export function chatBadge(g,x,y,s=160,{showLabel=true}={}){
 scrap(g,x,y,s,s,{fill:'#e7e6db',rot:-.035,seed:76})
 const ink=chatBadgeInk(),size=s*.82
 g.drawImage(ink,x+(s-size)/2,y+(s-size)/2,size,size)
 if(showLabel)label(g,'ChatGPT',x+s/2,y+s+38,{size:33,align:'center',font:'Headline'})
}
export function notebook(g,x,y,w=500,h=380,rot=-.03){scrap(g,x,y,w,h,{fill:'#ece9df',rot,seed:12});g.save();g.translate(x,y);g.rotate(rot);g.strokeStyle='#7b9ea34a';g.lineWidth=1.4;for(let yy=58;yy<h-20;yy+=35){g.beginPath();g.moveTo(28,yy);g.lineTo(w-25,yy);g.stroke()}g.strokeStyle='#bc716a55';g.beginPath();g.moveTo(65,25);g.lineTo(65,h-20);g.stroke();g.restore()}
export function ransom(g,text,x,y,{size=100,seed=1,center=false}={}){let r=rng(seed),cx=x;const colors=['#d9bc52','#edeee4','#d55a3a','#aec2bf','#f5dfcb'];g.save();g.font=`${size}px Headline`;let total=[...text].reduce((sum,ch)=>sum+g.measureText(ch).width+7,0);if(center)cx-=total/2;for(const ch of text){let w=g.measureText(ch).width+9;if(ch===' '){cx+=size*.35;continue}let angle=(r()-.5)*.17,fill=colors[Math.floor(r()*colors.length)];scrap(g,cx-4,y-size+2,w,size+16,{fill,rot:angle,seed:Math.floor(r()*900),rag:3,shadow:5});label(g,ch,cx,y,{size:size*(.92+r()*.1),font:r()>.52?'Editorial':'Headline',rot:angle,color:fill==='#d55a3a'?'#faf2da':C.ink});cx+=w+4}g.restore()}
export function ornament(g,index,x,y,w,rot=0){
 const im=images['ornament-sheet'];if(!im)return false
 // Manually inspected 1536×1024 sheet: its six objects do not occupy equal cells.
 const bounds=[[14,6,588,540],[609,31,321,506],[953,74,570,442],[20,509,480,510],[507,572,455,393],[969,558,556,411]]
 const b=bounds[index];if(!b)throw new RangeError(`Unknown ornament index: ${index}`)
 const crop=[b[0]*im.width/1536,b[1]*im.height/1024,b[2]*im.width/1536,b[3]*im.height/1024]
 g.save();g.translate(x,y);g.rotate(rot);g.scale(w/b[2],w/b[2])
 // The upper leaves and lower roses overlap in their bounding rectangles.
 // Clip only the empty gutter around each cutout at draw time; keep the PNG intact.
 if(index===0||index===3){
  const points=index===0?[[0,0],[588,0],[588,540],[174,540],[174,492],[0,492]]:[[0,0],[165,0],[165,42],[365,42],[480,55],[480,510],[0,510]]
  g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.clip()
 }
 photo(g,'ornament-sheet',0,0,b[2],b[3],{crop,shadow:5});g.restore();return true
}
