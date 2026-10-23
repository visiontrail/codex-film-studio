import {createCanvas} from '@napi-rs/canvas';
import {W,H} from './material.mjs';

function noise(x,y){let n=Math.imul(x+17,374761393)^Math.imul(y+29,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}

// The table has its own directional grain. Paper-sized white erosion belongs
// to the crayons on top of it, not to every pixel of the wooden surface.
export function deskTexture(paper){
 const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),im=ctx.createImageData(W,H),d=im.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const j=(y*W+x)*4;
  const wave=y+3.5*Math.sin(x*.004+y*.006)+1.4*Math.sin(x*.014+y*.011);
  const grain=Math.sin(wave*.41+Math.sin(wave*.023)*2.4);
  const fine=Math.sin(wave*1.62+x*.002)*1.6;
  const band=Math.sin(wave*.075+Math.sin(wave*.031))*7;
  const groove=-Math.pow(Math.max(0,grain),7)*15;
  const raised=Math.pow(Math.max(0,-grain),5)*(7+noise(Math.floor(x/13),y)*9);
  const fibre=(noise(Math.floor(x/7),y)-.5)*9+(noise(x,y)-.5)*6;
  const scratch=Math.pow(Math.max(0,-grain),11)*(noise(Math.floor(x/3),Math.floor(y/2))>.55?30:0);
  const tooth=(paper.p[j]-paper.p[Math.floor(y/4)*4*W+Math.floor(x/4)*16])*.035;
  const light=1+.09*Math.exp(-(((x-970)/700)**2+((y-490)/470)**2));
  const amount=band+groove+raised+fine+fibre+tooth+scratch;
  for(let k=0;k<3;k++)d[j+k]=[143,101,57][k]*light+amount*[1,.79,.52][k];
  d[j+3]=255;
 }
 ctx.putImageData(im,0,0);
 // Fine plank seams, with a soft raised edge, share the local wood direction.
 for(const y of [259,566,876]){
  ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(620,y-6,1350,y+2,W,y-4);
  ctx.strokeStyle='rgba(48,26,16,.55)';ctx.lineWidth=2;ctx.stroke();
  ctx.translate(0,2);ctx.strokeStyle='rgba(226,180,105,.24)';ctx.lineWidth=1;ctx.stroke();ctx.translate(0,-2);
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
