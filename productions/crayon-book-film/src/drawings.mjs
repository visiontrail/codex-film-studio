import {C,clamp,ease} from './material.mjs';
const pts=(x,y,r,n=16)=>Array.from({length:n},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*r,y+Math.sin(i/n*Math.PI*2)*r]);
export function eyes(w,x,y,scale=1,look=0,closed=false,talk=0){
 for(let s of [-1,1]){let xx=x+s*18*scale;if(closed){w.line([[xx-9*scale,y],[xx,y+4*scale],[xx+9*scale,y]],C.ink,2.5*scale)}else{w.ellipse(xx,y,13*scale,17*scale,C.white,11+s);w.ellipse(xx+look*4*scale,y+2*scale,6*scale,9*scale,C.ink,20+s,false);w.ellipse(xx+(look*4-2)*scale,y-2*scale,2*scale,3*scale,C.white,9,false)}}
}
export function person(w,kind,x,y,s=1,opt={}){
 const c=w.ctx;c.save();c.translate(x,y);c.scale(s*(opt.flip?-1:1),s);c.rotate(opt.tilt||0);let phase=opt.walk||0,bob=phase?Math.abs(Math.sin(phase))*4:0;
 c.translate(0,-bob);const lion=kind==='leo',skin=lion?C.yellow:C.rose,clothes=lion?C.blue:C.teal,boot=lion?C.ink:C.red;
 // Curling tail and substituted, planted feet.
 if(!lion){w.line([[34,-40],[64,-43],[75,-65],[69,-79],[57,-77],[54,-68]],skin,9,.88);w.line([[34,-40],[64,-43],[75,-65],[69,-79],[57,-77],[54,-68]],C.ink,2,.96)}
 else {w.line([[32,-38],[60,-28],[67,-41]],C.yellow,6,.88);w.ellipse(69,-44,8,10,C.purple,6)}
 for(let side of [-1,1]){let leg=opt.sit?side*19:(phase?Math.sin(phase)*side*12:0);w.shape([[side*11-8,-41],[side*11+9,-41],[side*14+leg+10,-5],[side*14+leg-9,-5]],clothes,35);w.ellipse(side*17+leg,-5,17,10,boot,40+side);}
 w.shape([[-32,-95],[29,-95],[33,-37],[-33,-37]],C.white,2);
 w.shape([[-18,-96],[-12,-96],[-12,-77],[16,-77],[16,-96],[22,-96],[28,-39],[-28,-39]],clothes,4);
 w.rect(-11,-65,22,16,clothes,9);w.ellipse(-17,-77,2,2,C.yellow,9,false);w.ellipse(20,-77,2,2,C.yellow,9,false);
 const arm=opt.arm||'down';
 for(let side of [-1,1]){let end=[side*44,-45];if(arm==='wave'&&side===1)end=[56,-140];if(arm==='hold')end=[side*20,opt.handY??-65];if(arm==='reach')end=[side*39,-143];if(arm==='pull')end=[25+side*4,-20];if(arm==='milk')end=side===-1?[-60,-50+(opt.pump||0)]:[-28,-66];
  w.line([[side*29,-87],[side*41,-68],end],C.ink,16,.98);w.line([[side*29,-87],[side*41,-68],end],C.white,12,.95);w.ellipse(...end,10,11,skin,21+side);
 }
 if(lion){let mane=[];for(let i=0;i<96;i++){let a=i/96*Math.PI*2,r=52+5*Math.sin(a*12);mane.push([Math.cos(a)*r,Math.sin(a)*r-133])}w.shape(mane,C.purple,91);w.ellipse(-29,-170,11,13,C.yellow,7);w.ellipse(28,-169,11,13,C.yellow,8);w.ellipse(0,-132,41,43,C.yellow,5)}
 else {w.ellipse(-40,-137,17,19,skin,11);w.ellipse(40,-137,17,19,skin,12);w.ellipse(-40,-137,10,12,C.peach,13);w.ellipse(40,-137,10,12,C.peach,14);w.ellipse(0,-133,43,48,skin,8);w.shape([[-30,-157],[-18,-166],[-2,-159],[11,-166],[28,-156],[32,-129],[24,-106],[0,-98],[-28,-110],[-33,-135]],C.peach,9)}
 eyes(w,0,-137,.9,opt.look||0,opt.closed||false);w.ellipse(-28,-117,7,4,C.red,1,false);w.ellipse(28,-117,7,4,C.red,1,false);
 w.ellipse(0,-119,6,4,lion?C.ink:C.brown,4,false);
 if(opt.talk){w.ellipse(2,-105,9,4+opt.talk*5,C.ink,4,false);w.ellipse(3,-101,4,2,C.red,7,false)}else if(opt.closed){w.line([[-9,-105],[0,-102],[9,-105]],C.ink,2)}else w.line([[-12,-108],[-5,-102],[5,-102],[13,-110]],C.ink,2.7);
 if(opt.hat){w.ellipse(0,-176,57,10,C.yellow,6);w.shape([[-30,-179],[-26,-207],[23,-208],[30,-178]],C.yellow,9);w.line([[-27,-181],[27,-181]],C.red,5,.9)}
 c.restore();
}
export function grass(w,y=615){for(let i=0;i<46;i++){let x=i*29-18;w.line([[x,y+35],[x+4,y+8],[x+10,y+27],[x+17,y+3],[x+19,y+36]],C.green,4.5,.7,i)}}
export function hill(w){w.shape([[-20,570],[170,535],[350,559],[580,520],[820,544],[1050,516],[1300,550],[1300,720],[-20,720]],C.green,71,false)}
export function sun(w,x=1050,y=130,r=53){for(let i=0;i<14;i++){let a=i/14*Math.PI*2;w.line([[x+Math.cos(a)*(r+10),y+Math.sin(a)*(r+10)],[x+Math.cos(a)*(r+23),y+Math.sin(a)*(r+23)]],C.yellow,5,.8,i)}w.ellipse(x,y,r,r,C.yellow,5);w.line([[x-15,y+10],[x,y+17],[x+15,y+9]],C.brown,2.5);}
export function barn(w,x,y,s=1){const c=w.ctx;c.save();c.translate(x,y);c.scale(s,s);w.shape([[-160,0],[-160,-160],[0,-265],[160,-160],[160,0]],C.yellow,10);w.shape([[-180,-156],[0,-286],[180,-158],[145,-145],[0,-246],[-143,-143]],C.red,12);w.rect(-58,-135,116,135,C.brown,3);w.line([[0,-135],[0,0]],C.ink,3);w.line([[-52,-123],[48,-8],[-48,-8],[52,-123]],C.white,6,.9);w.ellipse(0,-195,26,26,C.blue,6);w.line([[0,-220],[0,-170]],C.ink,2);w.line([[-24,-195],[24,-195]],C.ink,2);c.restore()}
export function tree(w,x,y,s=1,fruit='apple'){const c=w.ctx;c.save();c.translate(x,y);c.scale(s,s);w.shape([[-16,0],[-19,-185],[-46,-222],[-37,-234],[0,-202],[37,-238],[46,-228],[17,-181],[19,0]],C.brown,10);let canopy=[];for(let i=0;i<80;i++){let a=i/80*Math.PI*2,r=118+7*Math.sin(a*9);canopy.push([Math.cos(a)*r,Math.sin(a)*r*.9-225])}w.shape(canopy,C.green,9);for(let i=0;i<9;i++){let a=i*2.4,r=30+(i%3)*25;item(w,fruit,Math.cos(a)*r,Math.sin(a)*r-225,.32)}c.restore()}
export function fence(w,x,y,length=500){for(let i=0;i<length;i+=40){w.shape([[x+i-5,y],[x+i-5,y-58],[x+i,y-66],[x+i+6,y-58],[x+i+6,y]],C.white,i+1)}w.line([[x,y-22],[x+length,y-24]],C.brown,5,.9);w.line([[x,y-44],[x+length,y-46]],C.brown,5,.9)}
export function bucket(w,x,y,s=1,fill=false){w.ctx.save();w.ctx.translate(x,y);w.ctx.scale(s,s);w.shape([[-23,-30],[23,-30],[17,10],[-17,10]],C.blue,4);w.ellipse(0,-30,23,7,fill?C.white:C.ink,2);let a=[];for(let i=0;i<20;i++){let t=Math.PI+i/19*Math.PI;a.push([Math.cos(t)*22,Math.sin(t)*24-28])}w.line(a,C.ink,2);w.ctx.restore()}
export function item(w,type,x,y,s=1){const c=w.ctx;c.save();c.translate(x,y);c.scale(s,s);
 if(type==='apple'){w.shape([[0,-22],[-18,-29],[-33,-18],[-34,4],[-24,26],[-9,33],[1,28],[14,33],[29,20],[35,-3],[24,-23],[9,-28]],C.red,42);w.line([[0,-22],[3,-38]],C.brown,4);w.shape([[3,-30],[14,-43],[29,-37],[14,-29]],C.green,5);}
 if(type==='pear'){w.shape([[-8,-34],[9,-34],[16,-7],[29,11],[29,29],[13,40],[-14,39],[-29,26],[-26,10],[-16,-8]],C.yellow,8);w.line([[0,-35],[5,-48]],C.brown,3)}
 if(type==='grapes'){for(let j=0;j<4;j++)for(let i=0;i<4-j;i++)w.ellipse((i-(3-j)/2)*17,j*16-20,12,13,C.purple,9+i+j);w.line([[0,-30],[5,-49],[22,-43]],C.green,5)}
 if(type==='carrot'){w.shape([[-18,-20],[19,-20],[9,19],[-4,58]],C.orange,8);w.line([[-12,-5],[4,0]],C.brown,2);w.line([[-6,19],[7,24]],C.brown,2);for(let k=-1;k<2;k++)w.line([[0,-19],[k*19,-56],[k*9,-32]],C.green,6,.83,k+5)}
 if(type==='pumpkin'){w.ellipse(0,0,52,38,C.orange,8);for(let k=-1;k<2;k++)w.line([[k*19,-33],[k*26,-5],[k*23,22],[k*13,34]],C.brown,2,.74);w.line([[0,-34],[-5,-51],[6,-56]],C.green,6)}
 if(type==='sweet potato'){w.ellipse(0,0,47,21,C.rose,7);w.line([[-25,-3],[15,7]],C.brown,1.5)}
 if(type==='basket'){w.shape([[-48,-8],[48,-8],[37,39],[-36,39]],C.brown,7);for(let i=-30;i<40;i+=14)w.line([[i,-5],[i*.8,35]],C.yellow,3,.8);for(let y=5;y<35;y+=10)w.line([[-42,y],[42,y]],C.yellow,3,.8);let p=[];for(let i=0;i<30;i++){let a=Math.PI+i/29*Math.PI;p.push([Math.cos(a)*40,Math.sin(a)*37-7])}w.line(p,C.brown,6,.9)}
 if(type==='box'){w.shape([[-51,-23],[50,-23],[50,36],[-51,36]],C.brown,3);for(let yy=-10;yy<36;yy+=16)w.line([[-47,yy],[46,yy]],C.yellow,4,.8);w.line([[-43,-20],[-43,34]],C.ink,2);w.line([[43,-20],[43,34]],C.ink,2)}
 if(type==='plate'){w.ellipse(0,0,46,17,C.white,5);w.ellipse(0,0,33,10,null,8)}
 if(type==='bag'){w.rect(-29,-35,58,67,C.brown,3);w.line([[-17,-36],[-14,-56],[14,-56],[18,-36]],C.ink,5);w.rect(-19,-3,38,24,C.yellow,8)}
 if(type==='trash can'){w.shape([[-28,-30],[28,-30],[23,39],[-23,39]],C.blue,6);w.ellipse(0,-32,34,8,C.blue,3);for(let x=-15;x<25;x+=15)w.line([[x,-22],[x*.8,32]],C.ink,2)}
 if(type==='shirt'||type==='raincoat'){w.shape([[-19,-39],[-43,-22],[-34,1],[-21,-8],[-23,42],[24,42],[20,-8],[34,1],[45,-22],[20,-39],[11,-28],[-10,-28]],type==='shirt'?C.white:C.yellow,9);if(type==='raincoat'){w.line([[0,-22],[0,38]],C.ink,2);for(let y=-12;y<35;y+=15)w.ellipse(5,y,2,2,C.ink,3,false)}}
 if(type==='overalls'){w.shape([[-23,-42],[-13,-42],[-13,-17],[13,-17],[13,-42],[23,-42],[25,42],[5,42],[0,13],[-5,42],[-25,42]],C.blue,4);w.rect(-12,-10,24,19,C.blue,9);for(let x of [-18,18])w.ellipse(x,-17,3,3,C.yellow,5,false)}
 if(type==='swimsuit'){w.shape([[-19,-42],[-11,-42],[-10,-19],[10,-19],[11,-42],[19,-42],[26,-6],[19,17],[6,34],[-6,34],[-19,17],[-26,-6]],C.blue,9);w.line([[-20,-1],[20,-1]],C.white,6,.9);w.line([[-15,15],[15,15]],C.white,6,.9)}
 if(type==='pajamas'){w.shape([[-15,-44],[-37,-32],[-30,-9],[-18,-17],[-18,0],[18,0],[18,-17],[30,-9],[37,-32],[15,-44],[5,-34],[-5,-34]],C.rose,9);w.shape([[-20,8],[20,8],[25,43],[6,43],[0,22],[-6,43],[-25,43]],C.rose,6);for(let y of [-24,-9])w.line([[-17,y],[17,y]],C.white,4,.9);for(let x of [-12,12])w.line([[x,15],[x*1.3,38]],C.white,4,.9);w.line([[0,-30],[0,-1]],C.ink,1.5)}
 if(type==='boots'){for(let side of [-1,1]){let xx=side*25;w.shape([[xx-10,-30],[xx+10,-30],[xx+10,11],[xx+20,14],[xx+21,29],[xx-12,29]],C.red,4+side)}}
 if(type==='slippers'){for(let side of [-1,1]){let xx=side*29;w.shape([[xx-23,9],[xx-20,-6],[xx-7,-12],[xx+9,-9],[xx+20,3],[xx+24,13],[xx+19,20],[xx-22,20]],C.purple,4+side);w.ellipse(xx-11,0,10,6,C.ink,7,false);w.line([[xx-22,16],[xx+21,16]],C.white,3,.9)}}
 c.restore();}
export function animal(w,type,x,y,s=1,opt={}){const c=w.ctx;c.save();c.translate(x,y);c.scale(s,s);if(opt.flip)c.scale(-1,1);let bird=['duck','chicken'].includes(type),rabbit=type==='rabbit',pig=type==='pig',horse=type==='horse',goat=type==='goat';let col=pig?C.rose:horse?C.brown:bird?(type==='duck'?C.yellow:C.white):C.white;
 if(bird){w.ellipse(0,-29,30,23,col,1);w.ellipse(21,-57,17,19,col,2);w.shape([[36,-62],[54,-55],[36,-49]],C.orange,4);w.ellipse(25,-61,3,4,C.ink,3,false);w.line([[-8,-9],[-10,3],[-19,5]],C.orange,3);w.line([[8,-9],[10,3],[18,5]],C.orange,3);if(type==='chicken'){w.shape([[12,-73],[12,-88],[20,-81],[27,-90],[31,-75]],C.red,5)}}else{
 for(let xx of [-34,-19,28,42]){w.line([[xx,-42],[xx+(opt.step||0),-4]],C.ink,15,.97);w.line([[xx,-42],[xx+(opt.step||0),-4]],col,10,.97);w.line([[xx-5,-3],[xx+5,-3]],C.ink,4,.95);}
 if(type==='cow'){w.ellipse(-15,-28,18,12,C.peach,23);w.line([[-23,-19],[-23,-12]],C.peach,5);w.line([[-9,-19],[-9,-12]],C.peach,5)}w.ellipse(0,-56,rabbit?34:53,rabbit?30:33,col,7);if(type==='cow'){w.ellipse(-20,-65,18,17,C.ink,4,false);w.ellipse(16,-43,18,12,C.ink,6,false)}
 let hx=rabbit?26:48,hy=rabbit?-78:-84;w.ellipse(hx,hy,24,28,col,5);if(rabbit){w.ellipse(hx-10,hy-33,9,28,C.white,2);w.ellipse(hx+9,hy-33,8,26,C.white,3);w.line([[hx-9,hy-54],[hx-8,hy-25]],C.rose,4,.7);w.ellipse(-33,-56,13,13,C.white,8)}else{w.ellipse(hx-24,hy-15,14,8,col,4);w.ellipse(hx+22,hy-12,14,8,col,3);if(goat||type==='cow'){w.line([[hx-14,hy-23],[hx-20,hy-38]],C.brown,5);w.line([[hx+13,hy-22],[hx+18,hy-37]],C.brown,5)}}
 w.ellipse(hx+8,hy+12,23,12,pig?C.rose:horse?C.peach:C.peach,7);w.ellipse(hx+9,hy-7,4,6,C.ink,5,false);w.ellipse(hx+18,hy+13,2,3,C.ink,1,false);if(horse)w.line([[hx-17,hy-22],[hx-25,hy+1],[hx-29,hy+22]],C.ink,8,.9);if(goat)w.shape([[hx+2,hy+24],[hx+12,hy+43],[hx+20,hy+23]],C.white,9);if(pig)w.line([[-51,-55],[-64,-62],[-70,-56],[-66,-49],[-59,-54]],C.rose,4)}c.restore()}
