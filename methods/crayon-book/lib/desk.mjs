import {createCanvas} from '@napi-rs/canvas';
import {W,H} from './material.mjs';

function noise(x,y){let n=Math.imul(x+17,374761393)^Math.imul(y+29,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function field(x,y,sx,sy,seed=0){
 const a=x/sx,b=y/sy,i=Math.floor(a),j=Math.floor(b),u=(a-i)**2*(3-2*(a-i)),v=(b-j)**2*(3-2*(b-j));
 return (noise(i+seed,j)*(1-u)+noise(i+1+seed,j)*u)*(1-v)+(noise(i+seed,j+1)*(1-u)+noise(i+1+seed,j+1)*u)*v;
}

// Long fibres have irregular spacing, bends and broken highlights. Several
// independent scales prevent a periodic sine pattern or a striped wallpaper.
export function deskTexture(paper){
 const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),im=ctx.createImageData(W,H),d=im.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const j=(y*W+x)*4,warp=y+x*.022+(field(x,y,430,94,36)-.5)*18+(field(x,y,94,32,41)-.5)*3;
  const broad=(field(x,warp,600,34,8)-.5)*29;
  const grain=(field(x,warp,175,3.6,23)-.5)*31;
  const fibre=(field(x,warp,29,.85,71)-.5)*15+(noise(x,y)-.5)*8;
  const radial=((x-1030)/1290)**2+((y-510)/880)**2;
  const light=1.05-.29*radial+.10*Math.exp(-(((x-1090)/500)**2+((y-220)/370)**2));
  const value=broad+grain+fibre;
  for(let k=0;k<3;k++)d[j+k]=[150,104,59][k]*light+value*[1,.86,.62][k];
  d[j+3]=255;
 }
 ctx.putImageData(im,0,0);
 // Draw long, pressure-varying grain paths. Broken chalk-like glints sit
 // beside darker grooves, rather than bright dots on equally spaced rows.
 for(let row=-10,index=0;row<H+20;row+=5+noise(index++,93)*16){
  const bend=6+noise(index,97)*9,period=150+noise(index,81)*390;
  const curve=x=>row-x*.022+Math.sin(x/period+index)*bend+(field(x,row,170,50,104)-.5)*4;
  ctx.beginPath();for(let x=-20;x<W+20;x+=12){let y=curve(x);x===-20?ctx.moveTo(x,y):ctx.lineTo(x,y)}
  ctx.strokeStyle=`rgba(52,27,13,${.16+noise(index,118)*.35})`;ctx.lineWidth=.8+noise(index,127)*2.3;ctx.stroke();
  for(let x=-20,part=0;x<W;x+=11+noise(part++,index)*27){
   const length=8+noise(part+300,index)*77;
   if(noise(part,index+19)<.28)continue;
   ctx.beginPath();for(let dx=0;dx<length;dx+=5){let y=curve(x+dx)-1.5;dx===0?ctx.moveTo(x+dx,y):ctx.lineTo(x+dx,y)}
   ctx.strokeStyle=`rgba(235,199,137,${.15+noise(part,index+77)*.32})`;ctx.lineWidth=.6+noise(part,index+53)*1.5;ctx.stroke();
  }
 }
 // Sparse dry pigment catches on elongated wood ridges.
 const surface=ctx.getImageData(0,0,W,H),pixels=surface.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x,j=i*4,ridge=field(x,y+x*.022,60,2.3,201),clump=field(x,y,4,1.5,227);
  if(ridge>.64&&clump>.56&&noise(x,y+88)>.35){
   const a=(ridge-.64)*1.5+.28;for(let k=0;k<3;k++)pixels[j+k]=pixels[j+k]*(1-a)+[226,194,149][k]*a;
  }
 }
 ctx.putImageData(surface,0,0);
 for(const [row,seed] of [[254,17],[570,29],[870,43]]){
  ctx.beginPath();for(let x=0;x<=W;x+=12){const y=row+Math.sin(x/330+seed)*4+(field(x,row,80,50,seed)-.5)*3;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  ctx.strokeStyle='rgba(44,23,12,.48)';ctx.lineWidth=1.6;ctx.stroke();
 }
 return {canvas,p:ctx.getImageData(0,0,W,H).data,tooth:paper.tooth};
}

export function shadeSpread(c,bx,by,pw,bh){
 c.save();c.beginPath();c.rect(bx,by,pw*2,bh);c.clip();
 c.fillStyle='rgba(187,141,77,.09)';c.fillRect(bx,by,pw*2,bh);
 const light=c.createRadialGradient(bx+pw*1.36,by+bh*.44,15,bx+pw*1.36,by+bh*.44,pw*.95);
 light.addColorStop(0,'rgba(255,225,165,.27)');light.addColorStop(.45,'rgba(223,191,137,.08)');light.addColorStop(1,'rgba(62,39,21,.29)');
 c.fillStyle=light;c.fillRect(bx,by,pw*2,bh);
 const gutter=c.createLinearGradient(bx+pw-54,0,bx+pw+54,0);
 gutter.addColorStop(0,'rgba(61,43,26,0)');gutter.addColorStop(.34,'rgba(61,43,26,.07)');gutter.addColorStop(.49,'rgba(61,43,26,.30)');gutter.addColorStop(.53,'rgba(61,43,26,.23)');gutter.addColorStop(.76,'rgba(61,43,26,.06)');gutter.addColorStop(1,'rgba(61,43,26,0)');
 c.fillStyle=gutter;c.fillRect(bx+pw-54,by,108,bh);c.restore();
}
