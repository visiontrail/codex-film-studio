import {createCanvas} from '@napi-rs/canvas';
export const W=1920,H=1080;
export const C={ink:'#343258',purple:'#805496',yellow:'#e4b83b',red:'#c75043',rose:'#b95d85',peach:'#e8c4a5',blue:'#5888ae',teal:'#58a5ab',green:'#6d934e',brown:'#967044',orange:'#df8f36',white:'#f4efe3'};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
function hash(x,y,s=0){let n=Math.imul(x+71,374761393)^Math.imul(y+131,668265263)^Math.imul(s+3,2246822519);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function grid(x,y,step,s){let xx=x/step,yy=y/step,i=Math.floor(xx),j=Math.floor(yy),u=ease(xx-i),v=ease(yy-j);return (hash(i,j,s)*(1-u)+hash(i+1,j,s)*u)*(1-v)+(hash(i,j+1,s)*(1-u)+hash(i+1,j+1,s)*u)*v;}
export function paperTexture({reliefMap=null,reliefGain=1}={}){
 if(reliefMap&&reliefMap.length!==W*H)throw new Error('Paper relief dimensions must match the canvas');
 const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),im=ctx.createImageData(W,H),p=im.data,tooth=new Float32Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x;let n=grid(x,y,1.7,3)*.45+grid(x,y,4,5)*.32+grid(x,y,12,9)*.23;
  const ridge=grid(x-1,y-1,1.7,3)-grid(x+1,y+1,1.7,3);
  const fibre=(grid(x/5,y,2,12)-.5)*8;
  const rad=((x-W*.5)/(W*.65))**2+((y-H*.48)/(H*.85))**2;
  const shade=1-.16*rad;
  const relief=reliefMap?reliefMap[i]*reliefGain:(n-.5)*27+ridge*33+fibre*1.25+(hash(x,y)-.5)*43;
  for(let k=0;k<3;k++)p[4*i+k]=[234,229,217][k]*shade+relief;
  p[4*i+3]=255;tooth[i]=clamp((n-.28)*1.85+(hash(x,y,4)-.5)*.12);
 }
 ctx.putImageData(im,0,0);return {canvas,p,tooth};
}
export class Wax {
 constructor(){this.canvas=createCanvas(W,H);this.ctx=this.canvas.getContext('2d');this.frame=0;this.letterCanvas=createCanvas(W,H);this.letters=this.letterCanvas.getContext('2d');}
 begin(frame){this.letters.resetTransform();this.letters.clearRect(0,0,W,H);this.strokeIndex=0;this.strokeBudget=Infinity;this.fillIndex=0;this.fillBudget=Infinity;this.filling=false;this.outlineOnly=false;this.frame=Math.floor(frame/2);this.ctx.resetTransform();this.ctx.clearRect(0,0,W,H);this.ctx.setTransform(1.5,0,0,1.5,0,0);}
 rnd(s){return hash(s,this.frame%7,33)}
 line(points,color=C.ink,width=3,pressure=.97,seed=1){
  const available=this.filling?this.fillBudget-this.fillIndex++:this.strokeBudget-this.strokeIndex++;if(this.outlineOnly){color=C.ink;width=Math.min(width,2.8);}if(available<=0||points.length<2)return;if(available<1)points=points.slice(0,Math.max(2,Math.ceil(points.length*available)));const c=this.ctx;c.save();c.strokeStyle=color;c.globalAlpha=pressure;c.lineWidth=width*(color===C.ink&&width<=6?(this.contourScale??1):1);c.lineJoin='round';c.lineCap='round';c.beginPath();
  points.forEach(([x,y],i)=>{const dx=(hash(i,seed,this.frame%5)-.5)*.75,dy=(hash(i+32,seed,this.frame%5)-.5)*.75;i?c.lineTo(x+dx,y+dy):c.moveTo(x+dx,y+dy)});c.stroke();c.restore();
 }
 curve(points,color=C.ink,width=3,pressure=.97){this.line(points,color,width,pressure,17)}
 path(points){const c=this.ctx;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
 shape(points,color,seed=1,outline=true,progress=1){
  const boundary=points;
  // Larger polygons follow a softly wandering hand instead of ruler-straight
  // edges. Tiny facial features keep their original geometry.
  if(points.length<20){
   const edge=[];for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),count=Math.max(1,Math.ceil(len/14));
    for(let j=0;j<count;j++){const q=j/count,offset=Math.sin(q*Math.PI)*(hash(i*101+j,seed+211)-.5)*1.8;edge.push([a[0]+dx*q-dy/Math.max(1,len)*offset,a[1]+dy*q+dx/Math.max(1,len)*offset]);}
   }points=edge;
  }
  const c=this.ctx;let xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  c.save();this.path(points);c.clip();c.globalAlpha=1;c.globalCompositeOperation='destination-out';c.fillStyle='#fff';c.fillRect(x0-2,y0-2,x1-x0+4,y1-y0+4);c.globalCompositeOperation='source-over';
  if(color&&!this.outlineOnly){
   this.filling=true;
   const pressure=({[C.yellow]:1.18,[C.peach]:1.13,[C.orange]:1.04,[C.green]:.78,[C.red]:.83,[C.blue]:.90,[C.purple]:.92})[color]??.96;
   c.fillStyle=color;c.globalAlpha=.19*pressure;if(this.fillIndex<this.fillBudget)c.fillRect(x0,y0,x1-x0,(y1-y0)*progress);
   let ii=0;for(let y=y0-45;y<y1+50;y+=6.5){
    let yy=y+(hash(ii,seed)-.5)*3;let end=x0+(x1-x0+15)*clamp(progress*1.1);if(y>y0+(y1-y0)*progress+40)break;
    const pts=[];for(let x=x0-12;x<end+10;x+=8)pts.push([x,yy+(x-x0)*.2+(hash(ii,Math.round(x),seed)-.5)*2]);
    this.line(pts,color,7.8+(hash(ii,seed+6)-.5)*2.2,(.58+hash(ii,seed+2)*.25)*pressure,seed+ii);ii++;
   }
   for(let y=y0-50;y<y1+50;y+=13){let pts=[[x0-8,y+20],[x1+10,y-(x1-x0)*.28]];this.line(pts,color,3.7,.24*pressure,seed+31)}
  }
  this.filling=false;c.restore();
  // Short wax passes cross selected edges; they keep large fill shapes from
  // looking perfectly clipped, without obscuring small facial features.
  if(color&&!this.outlineOnly&&x1-x0>55&&y1-y0>45&&this.fillIndex<this.fillBudget){
   this.filling=true;
   for(let i=0;i<boundary.length;i++){
    const a=boundary[i],b=boundary[(i+1)%boundary.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let j=0;j<Math.floor(len/25);j++){
     const q=(j+.45)/Math.max(1,Math.floor(len/25)),x=a[0]+(b[0]-a[0])*q,y=a[1]+(b[1]-a[1])*q;
     if(hash(j+i*29,seed)>.48)this.line([[x-2,y-1],[x+3+hash(j,seed)*2,y+1.2]],color,2.2,.42,seed+i+j);
    }
   }
  }
  this.filling=false;
  if(outline)this.line([...points,points[0]],C.ink,2.8,.96,seed);
 }
 ellipse(x,y,rx,ry,color,seed=1,outline=true){let pts=[];for(let i=0;i<60;i++){let a=i/60*Math.PI*2,noise=1+(hash(i,seed)-.5)*.024;pts.push([x+Math.cos(a)*rx*noise,y+Math.sin(a)*ry*noise]);}this.shape(pts,color,seed,outline);}
 rect(x,y,w,h,color,seed=1,outline=true){this.shape([[x,y],[x+w,y+.9],[x+w+1,y+h],[x-1,y+h-1]],color,seed,outline)}
 text(text,x,y,size=40,color=C.ink,font='Patrick Hand',align='left',reveal=1){
  let c=this.ctx;c.save();c.font=`${size}px "${font}"`;let total=c.measureText(text).width,dx=align==='center'?-total/2:align==='right'?-total:0;
  const visible=Math.ceil(text.length*clamp(reveal));for(let i=0;i<text.length;i++){let w=c.measureText(text[i]).width;if(i<visible){c.save();c.translate(x+dx,y+(hash(i,71)-.5)*1.2);c.rotate((hash(i,18)-.5)*.025);c.fillStyle=color;c.globalAlpha=.99;c.fillText(text[i],0,0);this.letters.setTransform(c.getTransform());this.letters.font=c.font;this.letters.fillStyle=color;this.letters.globalAlpha=.82;this.letters.fillText(text[i],0,0);c.restore()}dx+=w;}c.restore();
 }
}
export function composite(wax,paper,out,cameraScale=1,cameraCenterX=W/2,cameraCenterY=H/2){
 const c=out.getContext('2d'),ink=wax.ctx.getImageData(0,0,W,H).data,im=c.createImageData(W,H),d=im.data,p=paper.p,t=paper.tooth;
 const xx=Float32Array.from({length:W},(_,x)=>clamp((x-W/2)/cameraScale+cameraCenterX,0,W-1)),yy=Float32Array.from({length:H},(_,y)=>clamp((y-H/2)/cameraScale+cameraCenterY,0,H-1));
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let i=y*W+x,j=i*4,sx=xx[x],sy=yy[y],x0=Math.floor(sx),y0=Math.floor(sy),u=sx-x0,v=sy-y0;
  const i0=y0*W+x0,i1=y0*W+Math.min(W-1,x0+1),i2=Math.min(H-1,y0+1)*W+x0,i3=Math.min(H-1,y0+1)*W+Math.min(W-1,x0+1);
  const sample=(arr,k,stride=1)=>(arr[i0*stride+k]*(1-u)+arr[i1*stride+k]*u)*(1-v)+(arr[i2*stride+k]*(1-u)+arr[i3*stride+k]*u)*v;
  const tooth=sample(t,0),a=ink[j+3]/255,threshold=.97-a*.86,cover=ease((tooth-threshold+.07)/.14)*Math.min(1,a*1.65);
  // Pigment is deposited on raised fibres. Wax never erases the paper relief.
  for(let k=0;k<3;k++){const pigment=ink[j+k]*(.92+tooth*.12);d[j+k]=sample(p,k,4)*(1-cover)+pigment*cover;}
  d[j+3]=255;
 }
 c.putImageData(im,0,0);c.drawImage(wax.letterCanvas,0,0);return out;
}
