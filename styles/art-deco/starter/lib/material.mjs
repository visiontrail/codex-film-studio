// Original deterministic drawing vocabulary. No upstream animation source imports.
export const C={ink:'#0d0b09',black:'#060504',night:'#0a0e16',emerald:'#1D6B57',burgundy:'#8E1B2E',ivory:'#F2E8D5',gold:'#C9A24B',light:'#F3D98B',hot:'#FFF4D2'};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export const mix=(a,b,t)=>a+(b-a)*t;
export const tau=Math.PI*2;
export function path(g,p,close=false){g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath()}
export function gold(g,x=0,y=0,w=1080,h=1920,t=0){let z=g.createLinearGradient(x,y,x+w,y+h);z.addColorStop(0,'#6F5220');z.addColorStop(.23,'#C9A24B');z.addColorStop(.42+.08*Math.sin(t),'#FFF4D2');z.addColorStop(.57+.08*Math.sin(t),'#F3D98B');z.addColorStop(.79,'#C9A24B');z.addColorStop(1,'#6F5220');return z}
export function line(g,p,w=2,t=0,closed=false,alpha=1){g.save();g.globalAlpha*=alpha;path(g,p,closed);g.lineWidth=w+1.6;g.strokeStyle='#241808';g.stroke();g.lineWidth=w;g.strokeStyle=gold(g,p[0][0],p[0][1],300,420,t);g.stroke();g.lineWidth=.42;g.strokeStyle='rgba(255,244,210,.45)';g.stroke();g.restore()}
export function poly(g,p,base='#332717',light='#80652e',rim=true){let xs=p.map(v=>v[0]),ys=p.map(v=>v[1]);const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;let z=g.createLinearGradient(x,y,x+w,y+h*.5);z.addColorStop(0,light);z.addColorStop(.42,base);const end={'#bd8c68':'#b07a58','#a5684a':'#a46c4e','#a97350':'#ae7854','#8E1B2E':'#5a1220','#1D6B57':'#153e31','#163f31':'#123729','#b9a878':'#d4c7a5','#b2a475':'#d8cba9'}[base]||'#0b0907';z.addColorStop(1,end);path(g,p,true);g.fillStyle=z;g.fill();if(rim)line(g,p,1.5,0,true)}
export function rect(g,x,y,w,h,base='#20180e',light='#6a5325'){poly(g,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],base,light)}
export function ellipse(g,x,y,rx,ry,fill=C.gold,stroke=true){g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,tau);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=gold(g,x-rx,y-ry,rx*2,ry*2);g.lineWidth=1.5;g.stroke()}}
export function glow(g,x,y,r,color='245,206,110',strength=.25){const z=g.createRadialGradient(x,y,0,x,y,r);z.addColorStop(0,`rgba(${color},${strength})`);z.addColorStop(1,`rgba(${color},0)`);g.fillStyle=z;g.fillRect(x-r,y-r,2*r,2*r)}
export function bulb(g,x,y,on=1,r=4){if(on>0)glow(g,x,y,r*7,'255,216,135',Math.min(.35,on*.3));ellipse(g,x,y,r,r,on>0?`rgba(255,236,180,${Math.min(1,on)})`:'#17120a');if(on>1)ellipse(g,x,y,r*.6,r*.6,C.hot,false)}
export function rays(g,x,y,r=1600,amount=1,rot=0){g.save();g.globalAlpha*=amount;for(let i=0;i<64;i++){let a=i*tau/64+rot,b=a+tau/128;g.fillStyle=i%2?'rgba(201,162,75,.025)':'rgba(201,162,75,.10)';path(g,[[x,y],[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(b)*r,y+Math.sin(b)*r]],true);g.fill();if(i%2===0)line(g,[[x,y],[x+Math.cos(a)*r,y+Math.sin(a)*r]],.6,0,false,.22)}g.restore()}
export function sparkle(g,x,y,r=10,a=1){g.save();g.globalAlpha*=a;poly(g,[[x,y-r],[x+r*.23,y-r*.23],[x+r,y],[x+r*.23,y+r*.23],[x,y+r],[x-r*.23,y+r*.23],[x-r,y],[x-r*.23,y-r*.23]],C.light,C.hot,false);g.restore()}
export function archPoints(x,y,w,h){const r=w*.16,cy=y-h+r,p=[[x-w/2,y],[x-w/2,y-h*.34],[x-w*.40,y-h*.34],[x-w*.40,y-h*.52],[x-w*.29,y-h*.52],[x-w*.29,cy],[x-w*.16,cy]];for(let i=0;i<=32;i++){let a=Math.PI+i*Math.PI/32;p.push([x+Math.cos(a)*r,cy+Math.sin(a)*r])}p.push([x+w*.29,cy],[x+w*.29,y-h*.52],[x+w*.40,y-h*.52],[x+w*.40,y-h*.34],[x+w/2,y-h*.34],[x+w/2,y]);return p}
export function arch(g,x,y,w,h,n=4){for(let i=0;i<n;i++)line(g,archPoints(x,y,w+i*20,h+i*12),i===0?2.8:1.4)}
export function chevrons(g,x,y,w,n=8,h=24){for(let k=0;k<3;k++){let p=[];for(let i=0;i<=n*2;i++)p.push([x+i*w/(n*2),y+k*7+(i%2)*h]);line(g,p,1.2)}}
export function fan(g,x,y,r,open=1,rot=0,color=C.emerald){g.save();g.translate(x,y);g.rotate(rot);for(let i=0;i<12;i++){let a=-Math.PI/2-open*Math.PI/2+i*open*Math.PI/12,b=a+open*Math.PI/12;poly(g,[[0,0],[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(b)*r,Math.sin(b)*r]],color,i%2?'#639c7a':'#2e5f4e');}ellipse(g,0,0,r*.06,r*.06,C.gold);g.restore()}
export function text(g,s,x,y,size=48,font='Limelight',color=null,align='center'){g.font=`${size}px "${font}"`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color||gold(g,x-size*2,y-size,size*4,size*2);g.fillText(s,x,y)}
export function plaque(g,s,x,y,w=800,size=44,p=1){g.save();g.translate(x,y);g.scale(ease(p),1);const h=100;let pts=[[-w/2,-h/2],[-w/2+25,-h/2],[-w/2+25,-h/2-15],[w/2-25,-h/2-15],[w/2-25,-h/2],[w/2,-h/2],[w/2,h/2],[w/2-25,h/2],[w/2-25,h/2+15],[-w/2+25,h/2+15],[-w/2+25,h/2],[-w/2,h/2]];poly(g,pts,C.black,'#191209');g.save();g.scale(.973,.84);line(g,pts,1,0,true);g.restore();text(g,s,0,0,size);g.restore()}
export function backdrop(g,t,kind='night'){let z=g.createLinearGradient(0,0,0,1920);z.addColorStop(0,kind==='night'?'#070a0e':'#0d0b09');z.addColorStop(.6,kind==='night'?'#10231f':'#231b0d');z.addColorStop(1,'#060504');g.fillStyle=z;g.fillRect(0,0,1080,1920);}
export function stars(g,t){for(let i=0;i<90;i++){let x=(i*337.217)%1080,y=(i*179.523)%1100;g.globalAlpha=.18+.18*(1+Math.sin(t*.3+i))/2;if(i%17===0)sparkle(g,x,y,6,1);else {g.fillStyle=C.ivory;g.fillRect(x,y,1.6,1.6)}}g.globalAlpha=1}
export function moon(g,x=820,y=330,r=88){ellipse(g,x,y,r,r,'#c8b77e',false);ellipse(g,x+r*.38,y-r*.16,r*.85,r*.90,'#090e13',false);for(let i=0;i<3;i++){g.beginPath();g.arc(x,y,r+12+i*14,0,tau);g.strokeStyle=`rgba(201,162,75,${.2-i*.04})`;g.lineWidth=.9;g.stroke()}}
export function vignette(g){let z=g.createRadialGradient(540,880,320,540,930,1130);z.addColorStop(0,'rgba(0,0,0,0)');z.addColorStop(1,'rgba(0,0,0,.38)');g.fillStyle=z;g.fillRect(0,0,1080,1920)}
export function camera({x=0,y=2,z=-8,tx=0,ty=2.5,tz=7,f=900,cy=950}={}){let dx=tx-x,dy=ty-y,dz=tz-z,ln=Math.hypot(dx,dy,dz);let forward=[dx/ln,dy/ln,dz/ln],right=[forward[2],0,-forward[0]],rn=Math.hypot(...right);right=right.map(v=>v/rn);let up=[forward[1]*right[2]-forward[2]*right[1],forward[2]*right[0]-forward[0]*right[2],forward[0]*right[1]-forward[1]*right[0]];return (X,Y,Z)=>{let d=[X-x,Y-y,Z-z],depth=d.reduce((a,v,i)=>a+v*forward[i],0);return [540+f*d.reduce((a,v,i)=>a+v*right[i],0)/depth,cy-f*d.reduce((a,v,i)=>a+v*up[i],0)/depth,f/depth]}}
export function ppoly(g,P,pts,base,light){poly(g,pts.map(v=>P(...v).slice(0,2)),base,light)}
export function room(g,t,{live=true,greenUniform=false,dolly=0}={}){
backdrop(g,t,'room');let P=camera({z:-10+dolly*.4,y:3.2,ty:2.8,tz:12,f:1120,cy:840});
ppoly(g,P,[[-7,0,-8],[7,0,-8],[7,0,20],[-7,0,20]],'#0d0c08','#2d271b');
ppoly(g,P,[[-7,0,-8],[-7,9,-8],[-7,9,20],[-7,0,20]],'#20180e','#72562a');
ppoly(g,P,[[7,0,-8],[7,9,-8],[7,9,20],[7,0,20]],'#1a140d','#4a3820');
ppoly(g,P,[[-7,0,20],[7,0,20],[7,9,20],[-7,9,20]],'#110f09','#2e2413');
for(let x=-7;x<=7;x+=1)line(g,[P(x,0,-8),P(x,0,20)],.7,0,false,.4);
for(let z=-7;z<20;z+=1.2){line(g,[P(-7,0,z),P(7,0,z)],.7,0,false,.4)}
// Broad ivory chevron carpet and reflected side wall light, reaching the lens.
ppoly(g,P,[[-2.5,0,-8],[2.5,0,-8],[2.5,0,20],[-2.5,0,20]],'#b8ae95','#e1d6bc');
for(let z=-8;z<20;z+=1.8){ppoly(g,P,[[-2.5,.002,z],[0,.002,z+.55],[2.5,.002,z],[2.5,.002,z+.33],[0,.002,z+.9],[-2.5,.002,z+.33]],'#100e09','#292419')}
for(const side of [-1,1]){line(g,[P(side*2.65,0,-8),P(side*2.65,0,20)],2);for(let z=-4;z<20;z+=3){let X=7*side;for(let k=0;k<4;k++)line(g,[P(X,0,z+k*.13),P(X,8.2,z+k*.13)],1);let q=P(X*.995,4.8,z+.2);fan(g,q[0],q[1],q[2]*.7,1,0,'#8b7039');if(live){glow(g,q[0],q[1],q[2]*2.6,'235,193,106',.26);let ref=P(X*.65,.001,z);g.save();g.globalAlpha=.08;poly(g,[[q[0]-20,q[1]],[q[0]+20,q[1]],[ref[0]+90,ref[1]],[ref[0]-90,ref[1]]],'#b79448','#e7cf82',false);g.restore()}}}
let q=P(0,0,19.9),top=P(0,7.1,19.9);arch(g,q[0],q[1],P(4,0,19.9)[0]-P(-4,0,19.9)[0],q[1]-top[1],5);
for(let z=0;z<20;z+=4){line(g,[P(-7,9,z),P(7,9,z)],1.2)}
let l=P(-6.7,7.7,19.9),r=P(6.7,7.7,19.9);chevrons(g,l[0],l[1],r[0]-l[0],8,12);
return P}
export function gear(g,x,y,r,rot=0,n=18){g.save();g.translate(x,y);g.rotate(rot);let pts=[];for(let i=0;i<n*4;i++){let a=i*tau/(n*4),rr=(i%4===0||i%4===3)?r*.88:r;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}poly(g,pts,'#644b21','#dcc582');ellipse(g,0,0,r*.72,r*.72,'#15120b');for(let i=0;i<6;i++){g.save();g.rotate(i*tau/6);rect(g,-r*.035,-r*.70,r*.07,r*.58,'#8e7137','#f3d98b');g.restore()}ellipse(g,0,0,r*.18,r*.18,'#80622b');ellipse(g,0,0,r*.055,r*.055,C.black);g.restore()}
export function dial(g,x,y,r,value=.5,label='SIGNAL',t=0){glow(g,x,y,r*1.5,'241,204,113',.08);ellipse(g,x,y,r,r,'#161209');ellipse(g,x,y,r*.94,r*.94,'#0b0a07');for(let i=0;i<=50;i++){let a=Math.PI*.8+i*Math.PI*1.4/50;line(g,[[x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.82],[x+Math.cos(a)*r*(i%5?.88:.94),y+Math.sin(a)*r*(i%5?.88:.94)]],i%5?1:2);if(i%10===0)text(g,String(i*2),x+Math.cos(a)*r*.64,y+Math.sin(a)*r*.64,r*.12,'Poiret One')}
let a=Math.PI*.8+clamp(value)*Math.PI*1.4;poly(g,[[x-5,y+4],[x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78],[x+5,y-4]],'#bca25c','#fff4d2');ellipse(g,x,y,r*.045,r*.045,C.gold);text(g,label,x,y+r*.35,r*.12,'Josefin Sans',C.ivory)}
export function leaf(g,x,y,size,rot=0,open=1){g.save();g.translate(x,y);g.rotate(rot);g.scale(Math.max(.01,open),1);poly(g,[[0,0],[-size*.27,-size*.25],[-size*.38,-size*.63],[0,-size],[size*.38,-size*.63],[size*.27,-size*.25]],'#163f31','#6eaa77');line(g,[[0,0],[0,-size]],1.7);for(let i=1;i<5;i++)line(g,[[-size*.27*(1-i/6),-size*i/5],[0,-size*(i/5+.1)],[size*.27*(1-i/6),-size*i/5]],.6);g.restore()}
// Continuous tapered sleeves with round elbows; all motion quantized to twelve poses/sec.
function sleeve(g,points,w,col,lit){
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  g.save();g.lineCap='round';g.lineJoin='round';path(g,points);
  g.strokeStyle='#24180d';g.lineWidth=w+3;g.stroke();
  g.strokeStyle=gold(g,Math.min(...xs),Math.min(...ys),70,180);g.lineWidth=w+1;g.stroke();
  let shade=g.createLinearGradient(Math.min(...xs)-w,0,Math.max(...xs)+w,0);shade.addColorStop(0,lit);shade.addColorStop(.46,col);shade.addColorStop(1,col==='#8E1B2E'?'#611522':'#173f32');
  g.strokeStyle=shade;g.lineWidth=w-2;g.stroke();
  g.restore();
}
function glove(g,x,y,angle=0,grip=0){
 g.save();g.translate(x,y);g.rotate(angle);const z=g.createLinearGradient(-7,0,9,0);z.addColorStop(0,'#fff0d0');z.addColorStop(1,'#c9b691');g.fillStyle=z;g.strokeStyle='#ac9154';g.lineWidth=.7;
 g.beginPath();g.moveTo(-6,-5);g.bezierCurveTo(-9,1,-8,12,-3,16);g.quadraticCurveTo(2,20,5,13);g.lineTo(7,4);g.quadraticCurveTo(14,0,9,-4);g.lineTo(5,-7);g.closePath();g.fill();g.stroke();
 g.strokeStyle='rgba(100,70,35,.3)';g.lineWidth=.5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-4+i*3,5);g.quadraticCurveTo(-5+i*3,11,-2+i*3,14-grip*3);g.stroke()}g.restore();
}
function metalButton(g,x,y,r=2.4){const z=g.createRadialGradient(x-r*.4,y-r*.5,r*.1,x,y,r);z.addColorStop(0,'#fff4d2');z.addColorStop(.3,'#e8cf85');z.addColorStop(.75,'#b29347');z.addColorStop(1,'#6f5220');ellipse(g,x,y,r,r,z,false)}
function walkingProfile(g,x,y,h,t,direction,greenUniform){
 const tt=Math.floor(t*12)/12,phase=tt*7,stride=Math.sin(phase),col=greenUniform?'#1D6B57':'#8E1B2E',lit=greenUniform?'#569371':'#D4485C';
 g.save();g.translate(x,y);g.scale((direction<0?-1:1)*h/700,h/700);g.translate(0,-Math.abs(stride)*7);
 glow(g,0,-2,90,'0,0,0',.5);
 for(const side of [-1,1]){
  const swing=stride*side,hip=[side*9,-326],knee=[swing*59,-171-Math.max(0,swing)*33],foot=[swing*101,-10-Math.max(0,swing)*20];
  sleeve(g,[hip,knee,foot],25,'#2b2233','#625160');
  poly(g,[[foot[0]-11,foot[1]-5],[foot[0]+14,foot[1]-6],[foot[0]+29,foot[1]+8],[foot[0]-11,foot[1]+8]],'#0b0908','#b59857');
 }
 const arm=(side)=>[[0,-532],[-stride*side*44,-432],[stride*-side*89+10,-346]];
 sleeve(g,arm(-1),19,col,lit);glove(g,...arm(-1)[2],0);
 poly(g,[[-25,-548],[24,-551],[33,-493],[25,-430],[33,-333],[-20,-322],[-33,-430]],col,lit,false);
 line(g,[[-25,-548],[-32,-430],[-20,-322],[33,-333]],1.2);
 if(!greenUniform)for(let i=0;i<6;i++)metalButton(g,24,-512+i*29,2.2);
 poly(g,[[-7,-588],[12,-586],[13,-548],[-9,-546]],'#bd8c68','#eab88c',false);
 sleeve(g,arm(1),20,col,lit);glove(g,...arm(1)[2],0);
 g.save();g.translate(5,-620);g.scale(.78,.78);
 // A continuous forehead, nose, mouth and jaw silhouette, facing the travel direction.
 g.fillStyle='#eab88c';g.beginPath();g.moveTo(-31,-42);g.bezierCurveTo(-19,-83,29,-78,36,-44);g.lineTo(40,-13);g.lineTo(55,0);g.quadraticCurveTo(56,6,39,7);g.lineTo(40,29);g.quadraticCurveTo(32,48,11,52);g.lineTo(-17,30);g.closePath();g.fill();
 poly(g,[[-31,-42],[-3,-53],[5,24],[11,52],[-17,30]],'#a5684a','#bd8663',false);
 g.fillStyle='#0b0807';g.beginPath();g.moveTo(-29,30);g.bezierCurveTo(-55,-20,-38,-78,2,-83);g.bezierCurveTo(26,-84,42,-64,38,-45);g.quadraticCurveTo(10,-61,-8,-32);g.lineTo(-10,20);g.closePath();g.fill();
 line(g,[[-33,-12],[-30,-45],[-8,-68],[20,-70]],1);
 const blink=tt%4.3>.13&&tt%4.3<.3;line(g,[[20,-10],[29,blink?-8:-14],[37,-10]],1.5);if(!blink)ellipse(g,30,-9,3,4,'#291d15',false);line(g,[[18,-24],[36,-26]],2.4);line(g,[[28,28],[39,27]],1.8);
 if(greenUniform){poly(g,[[-37,-69],[-27,-103],[22,-102],[36,-69]],'#1D6B57','#4e8d6a');ellipse(g,3,-68,48,6,'#275c43')}
 else{g.strokeStyle=gold(g,-50,-85,100,100);g.lineWidth=4;g.beginPath();g.arc(-3,-12,47,Math.PI,Math.PI*1.95);g.stroke();ellipse(g,-18,-4,9,20,'#57401c');ellipse(g,-18,-4,6,15,'#100e0a')}
 g.restore();g.restore();
}
export function person(g,x,y,h,t,{greenUniform=false,pose='stand',emotion='calm',gaze=0,back=false,turn=0,action=1,headTilt=0,handTargets=null}={}){
 if(h<=0)return;
 if(pose==='walk'&&turn){walkingProfile(g,x,y,h,t,turn,greenUniform);return;}
 const tt=Math.floor(t*12)/12,phase=tt*7,walking=pose==='walk',walk=walking?Math.sin(phase):0;
 const effort=pose==='crank'?Math.sin(tt*3):0,breath=Math.sin(tt*1.8)*1.1,col=greenUniform?'#1D6B57':'#8E1B2E',lit=greenUniform?'#569371':'#D4485C';
 g.save();g.translate(x,y);g.scale(h/700,h/700);g.translate(walking?Math.sin(phase)*3:effort*4,walking?-Math.abs(Math.sin(phase))*9:breath);
 // Grounding, trouser planes and softly articulated knees.
 glow(g,0,-2,90,'0,0,0',.5);
 for(const side of [-1,1]){let hip=[side*20,-337],knee=[side*24+walk*53*side,-174-Math.max(0,walk*side)*25],foot=[side*26+walk*84*side,-12-Math.max(0,walk*side)*7];
 sleeve(g,[hip,knee,foot],25,'#2b2233','#625160');
 g.save();g.translate(...foot);g.fillStyle='#0b0908';g.strokeStyle='#b59857';g.lineWidth=.8;g.beginPath();g.moveTo(-12,0);g.quadraticCurveTo(-12,-7,4,-8);g.quadraticCurveTo(13,-7,22,8);g.lineTo(-12,8);g.closePath();g.fill();g.stroke();g.restore();}
 // Neck precedes tunic, so no rectangular rim floats in front of the collar.
 poly(g,[[-9,-590],[12,-590],[13,-546],[-10,-546]],'#bd8c68','#eab88c',false);
 poly(g,[[-49,-552],[49,-552],[44,-491],[35,-430],[37,-337],[0,-318],[-37,-337],[-35,-430],[-44,-491]],col,lit,false);
 poly(g,[[4,-550],[43,-550],[35,-337],[0,-318]],col,col,false);
 line(g,[[-48,-548],[-34,-431],[-36,-336],[0,-319],[37,-336]],1.1);
 if(greenUniform){poly(g,[[-25,-522],[25,-522],[32,-339],[-32,-339]],'#1D6B57','#49896c',false);line(g,[[-24,-522],[-35,-550]],3);line(g,[[24,-522],[35,-550]],3);line(g,[[-26,-402],[-26,-368],[26,-368],[26,-402]],.8);for(const s of [-1,1])metalButton(g,s*24,-514,2.4)}
 else{line(g,[[0,-537],[0,-326]],1);for(let row=0;row<6;row++)for(let s of [-1,1])metalButton(g,s*(19-row*.7),-511+row*29,2.4);poly(g,[[-35,-551],[-10,-554],[0,-533],[-22,-538]],'#6a1928','#b74151');poly(g,[[35,-551],[10,-554],[0,-533],[22,-538]],'#6a1928','#b74151');}
 for(const side of [-1,1]){g.save();g.translate(side*45,-550);g.rotate(side*.17);rect(g,-12,-2,24,5,'#C9A24B','#F3D98B');g.restore()}
 let left=[[-48,-540],[-64,-432],[-72,-330]],right=[[48,-540],[64,-432],[72,-330]];
 if(pose==='listen'){const q=ease(action);right=[[48,-540],[mix(64,105,q),mix(-432,-527,q)],[mix(72,49,q),mix(-330,-613,q)]];left=[[-48,-540],[-74,-447],[-47,-393]]}
 if(pose==='reach'){right=[[48,-540],[110,-503],[181,-502+Math.sin(tt*2)*2]];left=[[-48,-540],[-71,-443],[-40,-399]]}
 if(pose==='crank'){let a=tt*3;right=[[48,-540],[105,-465],[132+34*Math.cos(a),-410+34*Math.sin(a)]];left=[[-48,-540],[-74,-451],[-49,-398]]}
 if(pose==='lift'){left=[[-48,-540],[-94,-591],[-84,-683]];right=[[48,-540],[94,-591],[84,-683]]}
 if(pose==='hold'){right=[[48,-540],[93,-448],[20,-388]];left=[[-48,-540],[-93,-448],[-20,-388]]}
 if(walking){left=[[-48,-540],[-65+walk*38,-438],[-72+walk*80,-337]];right=[[48,-540],[65-walk*38,-438],[72-walk*80,-337]]}
 if(handTargets){for(let i=0;i<2;i++){if(!handTargets[i])continue;let arm=i?right:left,target=handTargets[i];arm[2]=target;let dx=target[0]-arm[0][0],dy=target[1]-arm[0][1],len=Math.hypot(dx,dy),bend=Math.sqrt(Math.max(0,105**2-len**2/4));arm[1]=[(target[0]+arm[0][0])/2-dy/len*bend*(i?-1:1),(target[1]+arm[0][1])/2+dx/len*bend*(i?-1:1)]}}
 for(const arm of [left,right]){sleeve(g,arm,20,col,lit);let a=Math.atan2(arm[2][1]-arm[1][1],arm[2][0]-arm[1][0])-Math.PI/2;g.save();g.translate(...arm[2]);g.rotate(a);rect(g,-10,-6,20,4,'#C9A24B','#F3D98B');g.restore();glove(g,arm[2][0]+Math.sin(-a)*8,arm[2][1]+Math.cos(a)*8,a,pose==='crank'?1:0)}
 g.save();g.translate(gaze*3,-621);g.rotate(headTilt+(emotion==='worry'?-0.06:0)+Math.sin(tt*.85)*.012);g.scale(.78,.78);
 if(back){ellipse(g,0,-13,44,62,'#10100b',false)}else{
 // Warm directional planes: curved contour, one angular shadow plane.
 let skin=g.createLinearGradient(-45,-25,45,25);skin.addColorStop(0,'#f0c69c');skin.addColorStop(.48,'#eab88c');skin.addColorStop(1,'#bd8663');g.fillStyle=skin;
 g.beginPath();g.moveTo(-39,-28);g.bezierCurveTo(-43,-65,-22,-78,4,-76);g.bezierCurveTo(33,-75,43,-53,41,-17);g.lineTo(35,23);g.quadraticCurveTo(27,47,8,55);g.quadraticCurveTo(-5,59,-20,44);g.quadraticCurveTo(-38,27,-39,-28);g.fill();
 poly(g,[[5,-72],[35,-51],[40,-15],[34,24],[21,46],[8,55],[7,13]],'#a5684a','#bd8663',false);
 // Ears, hair cap and two engraved lit-edge strands.
 for(const side of [-1,1]){ellipse(g,side*40,-9,4.7,15,side<0?'#d7a581':'#a86e50',false)}
 g.fillStyle='#0b0807';g.beginPath();g.moveTo(-41,15);g.bezierCurveTo(-54,-6,-48,-64,-23,-79);g.bezierCurveTo(1,-98,37,-81,46,-52);g.lineTo(42,-12);g.quadraticCurveTo(33,-42,14,-54);g.quadraticCurveTo(-7,-49,-25,-29);g.lineTo(-32,14);g.closePath();g.fill();
 for(let k=0;k<2;k++){g.strokeStyle=k?'#64512d':'#8c7846';g.lineWidth=.8;g.beginPath();g.moveTo(-42+k*4,-5);g.bezierCurveTo(-46,-48,-24,-83,16,-77+k*4);g.stroke()}
 line(g,[[-37,9],[-32,27],[-21,44],[8,55]],.6);
 let blink=(tt%4.3)>.13&&(tt%4.3)<.30,eyeY=-7;
 for(const side of [-1,1]){let ex=side*18+gaze*2;
 g.strokeStyle='#28170f';g.lineWidth=1.8;g.beginPath();
 if(blink||emotion==='relief'){g.moveTo(ex-9,eyeY);g.quadraticCurveTo(ex,eyeY+5,ex+9,eyeY);g.stroke()}
 else {g.fillStyle='#f7e5c1';g.moveTo(ex-10,eyeY);g.quadraticCurveTo(ex,eyeY-12,ex+10,eyeY);g.quadraticCurveTo(ex,eyeY+7,ex-10,eyeY);g.fill();g.stroke();ellipse(g,ex+gaze*3,eyeY-1,3.3,4.9,'#291d15',false);ellipse(g,ex+gaze*3-1,eyeY-3,1.1,1.3,C.ivory,false)}
 let worry=emotion==='worry'?side*5:emotion==='determined'?-side*4:0;g.lineCap='round';g.lineWidth=3.1;g.beginPath();g.moveTo(ex-10,eyeY-20+worry);g.quadraticCurveTo(ex,eyeY-24,ex+9,eyeY-20-worry);g.stroke();}
 g.strokeStyle='#85543a';g.lineWidth=1.7;g.beginPath();g.moveTo(3,-7);g.lineTo(0,13);g.quadraticCurveTo(4,16,9,14);g.stroke();
 g.strokeStyle='#824734';g.lineWidth=2.5;g.beginPath();g.moveTo(-6,32);g.quadraticCurveTo(2,emotion==='smile'||emotion==='relief'?41:emotion==='worry'?26:32,12,31);g.stroke();
 }
 if(greenUniform){g.save();g.rotate(-.16);poly(g,[[-42,-68],[-32,-104],[26,-104],[37,-68]],'#1D6B57','#4e8d6a');ellipse(g,0,-68,47,7,'#275c43');line(g,[[-34,-96],[29,-96]],2);g.restore()}
 else {g.strokeStyle=gold(g,-60,-80,120,100);g.lineWidth=4;g.beginPath();g.arc(0,-12,49,Math.PI,0);g.stroke();for(const side of [-1,1]){ellipse(g,side*45,-6,6.5,19,'#57401c');ellipse(g,side*46,-6,4.2,14,'#100e0a')}}
 g.restore();g.restore();
}
