// Original deterministic print renderer. No lemo-opuscar engine imports.
import { createCanvas, Path2D } from '@napi-rs/canvas'
import { svgPathProperties } from 'svg-path-properties'

export const P={paper:'#F4EAD5',cream:'#FBF6EA',ink:'#2B2420',coral:'#E4613F',coralD:'#B8452B',gold:'#E8B43A',goldL:'#F3D37F',teal:'#3FA7A0',tealD:'#257A74',blue:'#7F9CC0',olive:'#A7AE5B',pink:'#F0B4A8',plum:'#6E4A6B',navy:'#3B4766',skin:'#F2C7A0',hair:'#3A2621',kraft:'#C9955D'}
let frame=0
export const clock=f=>{frame=f}
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x))
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x)}
export const mix=(a,b,t)=>a+(b-a)*t
export const pop=x=>{x=clamp(x)-1;return 1+2.7*x*x*x+1.7*x*x}
export const rng=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
export function tint(hex,amt){const v=parseInt(hex.slice(1),16);return '#'+[v>>16,(v>>8)&255,v&255].map(x=>Math.round(mix(x,amt>0?255:0,Math.abs(amt))).toString(16).padStart(2,'0')).join('')}
export function at(c,x,y,s,angle,fn){c.save();c.translate(x,y);c.rotate(angle||0);c.scale(s,s);fn();c.restore()}
export function path(points,closed=true,curve=false){
  if(typeof points==='string')return new Path2D(points)
  const p=new Path2D();p.moveTo(...points[0])
  if(curve){
    const n=points.length
    for(let i=0;i<(closed?n:n-1);i++){
      const a=points[(i-1+n)%n],b=points[i],d=points[(i+1)%n],e=points[(i+2)%n]
      const aa=!closed&&i===0?b:a,ee=!closed&&i===n-2?d:e
      p.bezierCurveTo(b[0]+(d[0]-aa[0])/6,b[1]+(d[1]-aa[1])/6,d[0]-(ee[0]-b[0])/6,d[1]-(ee[1]-b[1])/6,...d)
    }
  }else for(const q of points.slice(1))p.lineTo(...q)
  if(closed)p.closePath();return p
}
// Cached pressure ribbons: a printed contour tapers, fattens and occasionally
// loses ink. Geometry is held; only the colored plate registers on twos.
const contours=new Map()
function pressureContour(p,w,seed){
  const svg=p.toSVGString(),key=`${w}:${seed}:${svg}`
  if(contours.has(key))return contours.get(key)
  const result=new Path2D(),properties=new svgPathProperties(svg)
  let offset=0,run=[]
  function flush(){
    if(run.length>1){
      const left=[],right=[]
      for(let i=0;i<run.length;i++){
        const a=run[Math.max(0,i-1)],b=run[Math.min(run.length-1,i+1)],q=run[i]
        const an=Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2
        const pressure=.97+.22*Math.sin(q.s*.031+seed)+.13*Math.sin(q.s*.084+seed*2)
        const taper=Math.min(1,(i+1)/2,(run.length-i)/2),r=w*.5*pressure*taper
        left.push([q.x+Math.cos(an)*r,q.y+Math.sin(an)*r]);right.push([q.x-Math.cos(an)*r,q.y-Math.sin(an)*r])
      }
      result.addPath(path([...left,...right.reverse()],true,false))
    }
    run=[]
  }
  let last=null
  for(const part of properties.getParts()){
    if(last&&Math.hypot(last.x-part.start.x,last.y-part.start.y)>3)flush()
    const steps=Math.max(1,Math.ceil(part.length/4))
    for(let i=0;i<steps;i++){
      const d=part.length*i/steps,q=part.getPointAtLength(d),s=offset+d
      const cycle=(s+rng(seed)*190)% (295+rng(seed+2)*110)
      if(cycle<3.2){flush();continue}
      run.push({...q,s})
    }
    offset+=part.length;last=part.end
  }
  if(last)run.push({...last,s:offset});flush()
  if(contours.size>1800)contours.delete(contours.keys().next().value)
  contours.set(key,result);return result
}
export function ink(c,p,w=4,{seed=1,color=P.ink,broken=true}={}){
  p=p instanceof Path2D?p:path(p,false,true)
  c.save();c.strokeStyle=color;c.fillStyle=color;c.lineCap='round';c.lineJoin='round';c.lineWidth=w
  if(broken&&w>=2)c.fill(pressureContour(p,w,seed));else c.stroke(p)
  c.restore()
}
export function cel(c,pts,fill=P.paper,{w=4,seed=1,curve=false,off=true,broken=true}={}){
  const p=pts instanceof Path2D?pts:path(pts,true,curve)
  if(fill){c.save();if(off)c.translate(5.5+(rng(Math.floor(frame/2)+seed)-.5)*2.5,3.5+(rng(Math.floor(frame/2)+seed+100)-.5)*2.5);c.fillStyle=fill;c.fill(p);c.restore()}
  if(w)ink(c,p,w,{seed,broken});return p
}
export function rect(c,x,y,w,h,fill=P.paper,r=10,o={}){const p=new Path2D();p.roundRect(x,y,w,h,r);return cel(c,p,fill,o)}
export function ellipse(c,x,y,rx,ry,fill=P.paper,o={}){const p=new Path2D();p.ellipse(x,y,rx,ry,0,0,Math.PI*2);return cel(c,p,fill,o)}
export function label(c,str,x,y,{size=42,family='Jost',weight=500,fill=P.ink,plate=null,align='left',max=1700,tracking=0}={}){
  c.save();c.font=`${size}px "${family==='Jost'?(weight>=600?'JostSemiBold':'JostMedium'):family}"`;c.textBaseline='alphabetic';c.textAlign=align
  if(tracking)c.letterSpacing=`${tracking}px`
  const width=c.measureText(str).width
  if(width>max){c.translate(x,y);c.scale(max/width,1);x=0;y=0}
  if(plate){c.fillStyle=plate;c.fillText(str,x+5,y+4)}c.fillStyle=fill;c.fillText(str,x,y);c.restore()
}
export function star(c,x,y,r,fill=P.coral,n=4,rot=0){const ps=[];for(let i=0;i<2*n;i++){const a=i*Math.PI/n-Math.PI/2+rot,d=i%2?r*(n>=10?.76:n===8?.35:.22):r;ps.push([x+Math.cos(a)*d,y+Math.sin(a)*d])}cel(c,ps,fill,{w:0})}
export function rays(c,x,y,color,angle=0){c.save();c.globalAlpha=.48;for(let i=0;i<30;i++){const a=i*Math.PI*2/30+angle;cel(c,[[x,y],[x+2600*Math.cos(a),y+2600*Math.sin(a)],[x+2600*Math.cos(a+.094),y+2600*Math.sin(a+.094)]],color,{w:0,off:false})}c.restore()}
export function ground(c,color,{floor=true,burst=false,time=0}={}){c.fillStyle=color;c.fillRect(0,0,1920,1080);if(burst)rays(c,1020,730,tint(color,.32),time*.004);if(floor){c.fillStyle=tint(color,.12);c.fillRect(0,805,1920,275);ink(c,[[0,806],[350,806],[710,806],[1080,806],[1500,806],[1920,806]],3,{seed:41})}}
export function arrow(c,x1,y1,x2,y2,u=1,color=P.coral){u=smooth(u);const dx=x2-x1,dy=y2-y1;const p=new Path2D();p.moveTo(x1,y1);p.quadraticCurveTo(x1+dx*.5,y1+dy*.5-60,x1+dx*u,y1+dy*u-60*Math.sin(Math.PI*u));ink(c,p,4,{color,broken:false});if(u>.96){const a=Math.atan2(dy,dx);at(c,x2,y2,1,a,()=>cel(c,[[0,0],[-23,-11],[-17,0],[-23,11]],color,{w:1.6}))}}
export function tag(c,str,x,y,{size=32,color=P.paper,max=800}={}){c.save();c.font=`500 ${size}px Jost`;let w=Math.min(max,c.measureText(str).width+82);rect(c,x-w/2,y-29,w,61,color,8,{w:2.5,seed:48});star(c,x-w/2+27,y+1,12,P.coral,8);label(c,str,x+14,y+12,{size,align:'center',max:w-65});c.restore()}
export function caption(c,str,t){const a=smooth(t/.16);if(a<=0)return;c.save();c.globalAlpha=a;const size=42;c.font=`500 ${size}px Jost`;const w=Math.min(1710,c.measureText(str).width+122);rect(c,(1920-w)/2,944+10*(1-a),w,78,P.paper,12,{w:3.2,seed:94,broken:false});label(c,str,960,997+10*(1-a),{size,align:'center',max:w-105});star(c,(1920-w)/2+31,984,16,P.coral,8,t*.08);star(c,(1920+w)/2-31,984,16,P.coral,8,-t*.08);c.restore()}
export function header(c,title,{number=null,kicker='',t=1}={}){const d=80*(1-smooth(Math.floor(t*12)/12/.35));c.save();c.translate(-d,0);if(number!==null){ellipse(c,128,130,54,54,P.ink,{w:0,off:false});label(c,String(number),128,155,{size:66,family:'Slab',fill:P.paper,align:'center'});label(c,kicker||`STEP ${number} OF 3`,205,103,{size:25,weight:600,tracking:5});label(c,title,205,171,{size:62,family:'Slab',plate:P.paper,max:1570})}else{label(c,kicker,90,93,{size:25,weight:600,tracking:4});label(c,title,90,166,{size:62,family:'Slab',plate:P.paper,max:1730})}c.restore()}

// A fixed paper sheet: fine tooth, broad mottling and sparse fibres.
const paper=createCanvas(1920,1080),pc=paper.getContext('2d'),im=pc.createImageData(1920,1080)
for(let y=0;y<1080;y++)for(let x=0;x<1920;x++){const i=(y*1920+x)*4;const v=rng(x+y*1920);im.data[i]=im.data[i+1]=im.data[i+2]=v>.5?255:30;im.data[i+3]=Math.round(2+v*6)}pc.putImageData(im,0,0)
for(let i=0;i<4200;i++){const x=rng(i*7)*1920,y=rng(i*7+1)*1080;pc.strokeStyle=i%2?'rgba(255,248,220,.10)':'rgba(60,40,20,.025)';pc.lineWidth=.6;pc.beginPath();pc.moveTo(x,y);pc.quadraticCurveTo(x+1,y+3,x+(rng(i+5)-.5)*8,y+4+rng(i+6)*12);pc.stroke()}
export function finish(c){c.drawImage(paper,0,0);const g=c.createRadialGradient(960,500,450,960,500,1250);g.addColorStop(0,'rgba(90,57,20,0)');g.addColorStop(1,'rgba(90,57,20,.08)');c.fillStyle=g;c.fillRect(0,0,1920,1080)}
