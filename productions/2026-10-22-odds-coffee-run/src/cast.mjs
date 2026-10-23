import {INK,WHITE,clamp,ease} from './ink.mjs';
const skinA='#f0c99b', shadeA='#d3aa84', skinB='#ad7853', shadeB='#895939';
export function hand(g,x,y,s=1,point=false,color=skinA){
 g.push(x,y,s);
 if(point){
  g.curve([[-15,10],[-23,-1],[-19,-17],[-8,-20],[-1,-24],[7,-20],[9,-12],[20,-20],[38,-28],[45,-23],[54,-18],[42,-11],[23,-5],[28,1],[23,7],[17,9],[18,16],[8,23],[-1,22],[-8,22],[-12,17],[-15,10]],color,INK,5,true);
  g.curve([[4,-9],[7,-4],[9,0],[15,2]],null,INK,3);
 }else{
  g.curve([[-15,11],[-22,-2],[-17,-20],[-4,-22],[3,-23],[8,-19],[9,-12],[16,-18],[24,-9],[18,-1],[22,5],[16,17],[7,20],[-4,24],[-10,22],[-15,11]],color,INK,5,true);
  g.curve([[8,-12],[4,-6],[2,-1],[1,5]],null,INK,3);
  g.line([[-9,7],[-4,15]],INK,2.5);
 }
 g.pop()
}
function mouth(g,x,y,open,panic=false,smile=0){if(open<.07){g.curve([[x-19,y+smile],[x-8,y-5-smile],[x+8,y-5-smile],[x+20,y+smile]],null,INK,4);return}
 const w=13+open*(panic?15:6),h=3+open*(panic?11:10);
 if(panic){
  // A shallow, asymmetrical open mouth leaves the jaw silhouette readable.
  g.curve([[x-w,y],[x-w*.55,y-h*1.2],[x+w*.2,y-h*1.15],[x+w,y],[x+w*.6,y+h*.7],[x-w*.55,y+h*.7],[x-w,y]],'#492234',INK,4,true);
  g.c.save();g.c.clip();g.ellipse(x+2,y+h*.65,w*.37,h*.18,'#d77d93',null,0);g.c.restore();
 }else{
  g.ellipse(x,y,w,h,'#492234',INK,4);g.c.save();g.c.clip();
  if(open>.7)g.rect(x-w*.63,y-h*.68,w*1.2,Math.min(6,h*.4),WHITE,null,0,2);
  if(h>10)g.ellipse(x+2,y+h*.65,w*.45,h*.2,'#d77d93',null,0);g.c.restore();
 }}
function eyes(g,x,y,kind,t,emotion,dir=1){let blink=((Math.floor(t*12)+(kind==='qin'?11:33))%63<2);let lid=kind==='qin'?!['panic','shock'].includes(emotion):['deadpan','tired','blank'].includes(emotion);let panic=['panic','shock'].includes(emotion);let rx=kind==='qin'?22:25,ry=kind==='qin'?22:25;
 for(let i=0;i<2;i++){let cx=x+(kind==='qin'?(i?24:-23):(i?32:-31)),cy=y+(i?-2:0);if(kind==='bo'){g.ellipse(cx,cy,33,33,shadeB,INK,5);g.ellipse(cx,cy,29,29,'#deedf2',null,0);if(blink)g.ellipse(cx,cy,25,25,skinB,INK,3)}g.ellipse(cx,cy,rx,blink?2:ry,WHITE,INK,kind==='bo'?3:4);if(!blink){g.ellipse(cx+dir*6+(panic?Math.sin(t*65+i)*2:0),cy+3,kind==='bo'?2.4:3.4,kind==='bo'?2.4:4,INK,null,0);if(lid){g.curve([[cx-rx,cy],[cx-rx,cy-ry*1.34],[cx+rx,cy-ry*1.34],[cx+rx,cy],[cx+rx*.3,cy-2],[cx-rx*.4,cy+2],[cx-rx,cy]],kind==='qin'?skinA:skinB,null,0,true);g.ellipse(cx,cy,rx,ry,null,INK,5);g.line([[cx-rx,cy+2],[cx+rx,cy-2]],INK,5)}}}
 if(kind==='bo')g.line([[x-1,y-4],[x+2,y-4]],INK,5);
 if(kind==='qin'){g.push(0,11);g.curve([[x-53,y-41],[x-39,y-46],[x-10,y-40],[x+4,y-43],[x+22,y-52],[x+50,y-47],[x+55,y-40],[x+59,y-34],[x+40,y-36],[x+29,y-36],[x+4,y-38],[x-17,y-30],[x-53,y-32],[x-61,y-31],[x-59,y-38],[x-53,y-41]],'#3e394a',INK,4,true);g.pop();return}
 if(panic||emotion==='worry'){
  const lift=panic?18:10;
  g.curve([[x-49,y-40],[x-34,y-43-lift*.25],[x-20,y-44-lift*.7],[x-10,y-43-lift]],null,INK,7);
  g.curve([[x+10,y-43-lift],[x+25,y-44-lift*.7],[x+39,y-43-lift*.25],[x+50,y-39]],null,INK,7);return
 }
 let up=emotion==='eager'?-9:emotion==='suspicious'?5:0;g.curve([[x-49,y-40+up],[x-32,y-48+up],[x-14,y-41],[x-4,y-40]],null,INK,7);g.curve([[x+7,y-42],[x+22,y-46+up],[x+45,y-42+up],[x+50,y-39]],null,INK,7)
}
function assistantArm(g,side,reach,color,point,pose){
 const sx=side*62,sy=-184,hx=pose?.x??side*(72+reach*119),hy=pose?.y??(-72-reach*190);
 const ex=sx+(hx-sx)*.43,ey=sy+(hy-sy)*.48+15*(1-reach);
 const dx=hx-sx,dy=hy-sy,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 g.curve([[sx+nx*11,sy+ny*11],[ex+nx*10,ey+ny*10],[hx+nx*8,hy+ny*8],[hx,hy+8],[hx-nx*8,hy-ny*8],[ex-nx*10,ey-ny*10],[sx-nx*11,sy-ny*11],[sx-nx*16,sy-ny*16],[sx+nx*16,sy+ny*16],[sx+nx*11,sy+ny*11]],color,INK,5,true);
 g.push(sx,sy,1,1,Math.atan2(dy,dx)-Math.PI/2);g.rect(-14,-9,28,43,WHITE,INK,5,12);g.pop();
 g.push(hx,hy,side,1,side===1?-reach*.18:reach*.18);hand(g,0,0,.64,point,color);g.pop();
 return {x:hx,y:hy};
}
export function character(g,kind,x,y,scale=1,opts={}){
 const previousInk=g.inkScale;
 // Preserve the usual screen-space stroke, thinning only during tiny portal poses.
 g.inkScale*=Math.min(1,Math.max(.12,scale/.65));
 let t=opts.still?0:(opts.time||0),pose=Math.floor(t*12)/12,emotion=opts.emotion||'deadpan',talk=opts.talk||0,panic=emotion==='panic',gesture=opts.gesture||0;
 let breath=opts.still?0:Math.sin(pose*2.3)*.007;let jitter=panic?Math.sin(pose*89)*2.7:0;g.push(x+jitter,y,scale*(1-breath),scale*(1+breath),opts.angle||0);
 if(kind==='qin'){
  g.push(0,0,1,1,.13);g.push(0,0,.9,1);
  // Patterned socks and oversized flat slippers.
  for(let lx of [-38,31]){g.rect(lx-13,-96,25,79,'#b39bd0',INK,5,6);for(let yy=-80;yy<-25;yy+=16)g.line([[lx-12,yy],[lx+11,yy]],'#71557b',3);g.ellipse(lx-10,-9,36,15,'#dd8fb1',INK,6)}
  g.pop();g.pop();g.push(0,0,.9,1);
  // The relaxed hand rests in the robe; gestures emerge from behind its contour.
  const lift=opts.flight||0,rx=50+gesture*120+lift*45,ry=-135-gesture*155-lift*225;
  g.curve([[75,-286],[102,-286],[110,-211],[rx,ry],[rx-16,ry+12],[77,-161],[66,-228]],'#226f70',INK,6,true);hand(g,rx,ry,.8,gesture>.6);
  g.curve([[-80,-310],[-113,-250],[-103,-110],[-83,-83],[-20,-72],[44,-72],[85,-87],[98,-174],[96,-257],[62,-311]],'#278f89',INK,7,true);
  g.poly([[45,-307],[73,-290],[91,-180],[84,-86],[50,-78],[36,-241]],'#1f6667',null,0);
  g.poly([[-29,-313],[31,-316],[14,-205]],'#b99ccf',INK,4);g.line([[-55,-301],[-24,-258],[9,-208],[-5,-120]],INK,4);g.line([[32,-310],[48,-262],[20,-216]],INK,4);
  g.rect(-92,-175,178,23,'#246f73',INK,5,7);g.ellipse(-10,-162,13,12,'#267a7d',INK,4);g.poly([[-15,-154],[-32,-108],[-11,-115],[-3,-153]],'#2d7d7a',INK,4);
  g.curve([[48,-135],[18,-135],[20,-119],[18,-108]],null,'#1b4146',4);g.pop();
  // Neck and head: asymmetry, long nose, beard shadow, forehead goggles.
  g.rect(-6,-328,32,24,skinA,INK,5,9);g.push(-10,-300,.97,1.12,.02+(opts.headAngle||0));g.push(0,300);
  let head=[[-62,-446],[-24,-482],[53,-474],[73,-425],[92,-374],[64,-315],[20,-306],[-25,-297],[-68,-333],[-76,-383],[-84,-412],[-78,-435],[-62,-446]];
  g.curve(head,skinA,INK,7,true);g.c.save();g.c.clip();
  g.curve([[-65,-348],[-50,-359],[-30,-349],[-9,-343],[22,-359],[40,-356],[65,-335],[55,-319],[20,-310],[-24,-309],[-58,-329],[-65,-348],[-65,-348]],shadeA,null,0,true);
  g.poly([[-84,-449],[76,-470],[82,-455],[-83,-435]],'#454551',null,0);
  g.c.restore();g.curve(head,null,INK,7,true);
  g.push(-14,0);
  for(let xx of [-27,13]){g.push(xx,-460,xx<0?.85:1);g.ellipse(0,0,18,16,'#6e7181',INK,5);g.ellipse(0,0,14,12,'#f1b839',null,0);g.ellipse(4,-5,4,3,'#fff1b0',null,0);g.pop()};
  g.curve([[-12,-469],[-22,-496],[15,-493],[12,-477]],null,INK,4);
  eyes(g,-5,-386,'qin',pose,emotion,opts.look??-1);
  g.curve([[-7,-392],[-12,-373],[-32,-363],[-28,-352],[-25,-340],[-5,-338],[4,-348],[9,-360],[5,-376],[0,-383]],skinA,INK,5);
  g.curve([[-51,-358],[-37,-351],[-28,-351],[-20,-355]],null,'#ac8064',3);
  g.curve([[10,-357],[25,-352],[42,-358],[48,-364]],null,INK,2.5);g.curve([[21,-349],[32,-347],[42,-351],[44,-352]],null,INK,2);
  g.c.save();g.push(14,0);g.curve(head,null,null,0,true);g.pop();g.c.clip();
  for(let i=0;i<22;i++){let xx=-49+(i*29%106),yy=-338+(i*17%25);if(((xx+5)/66)**2+((yy+383)/75)**2<.90)g.ellipse(xx,yy,1.25,1.25,'#a78263',null,0)}
  g.c.restore();
  mouth(g,1,-331,talk,panic,emotion==='relieved'?7:-1);
  g.pop();g.pop();g.pop();
  // A chest-height cup is the inventor's continuous foreground prop.
  g.push(0,0,.9,1);
  const hx=-105-18*lift,hy=-213-190*lift;
  g.curve([[-75,-290],[-104,-304],[-113,-260],[hx,hy],[hx+17,hy+16],[-57,-215],[-55,-250]],'#2ca099',INK,6,true);
  hand(g,hx,hy,.8);
  if(opts.prop==='remote'){g.rect(hx-18,hy-48,34,65,'#737b89',INK,5,8);g.ellipse(hx-1,hy-29,10,10,'#ed5b51',INK,3);g.line([[hx-2,hy-51],[hx-4,hy-66]],INK,4)}
  else {g.rect(hx-14,hy-43,46,58,'#e8dff1',INK,5,5);g.ellipse(hx+9,hy-43,23,6,'#74472e',INK,4);g.curve([[hx-14,hy-31],[hx-42,hy-41],[hx-42,hy+5],[hx-14,hy]],null,INK,5);g.text('ODDS?',hx+9,hy-14,9,'#78618f')}
  g.pop();
 }else{
  // Helmeted nervous assistant: broad head over a narrower, compact vest.
  g.push(0,0,.85,1);
  for(let lx of [-28,30]){g.rect(lx-10,-68,20,54,'#e4bd90',INK,5,4);g.rect(lx-12,-32,23,22,WHITE,INK,3);g.ellipse(lx-7,-8,31,12,'#738dce',INK,5)}
  g.rect(-72,-84,139,45,'#e4bd90',INK,5,13);
  g.curve([[-61,-198],[-89,-175],[-80,-105],[-57,-76],[-8,-68],[55,-68],[69,-89],[84,-127],[77,-185],[52,-198]],'#9663bd',INK,7,true);
  g.poly([[49,-192],[73,-166],[74,-111],[56,-79],[26,-72],[36,-124]],'#714698',null,0);
  g.poly([[-42,-194],[-10,-177],[8,-194],[-4,-154]],WHITE,INK,4);for(const yy of [-99,-91,-83])g.line([[-60,yy],[60,yy]],'#b88fcf',3);
  for(const [xx,color]of [[-44,'#f55c42'],[-32,'#6a83d4'],[-20,'#43b85d']])g.rect(xx,-157,9,24,color,INK,2.5,4);g.rect(-51,-139,45,29,WHITE,INK,3,4);
  const flight=opts.flight||0,reach=clamp(Math.max(gesture,opts.prop==='phone'?.36:0,flight)), leftReach=flight>0?flight:panic?reach*.82:emotion==='shock'?reach*.5:0;
  const thought=emotion==='think',panicLift=panic?ease((reach-.6)/.2):0;
  const leftPose=panicLift>0?{x:-(72+leftReach*119)*(1-panicLift)-78*panicLift,y:(-72-leftReach*190)*(1-panicLift)-288*panicLift}:null,rightPose=thought?{x:36,y:-214}:emotion==='smug'?{x:94,y:-162}:null;
  assistantArm(g,-1,leftReach,skinB,false,leftPose);
  const rightHand=assistantArm(g,1,reach,skinB,reach>.55&&opts.prop!=='phone',rightPose);
  g.rect(-15,-215,31,28,skinB,INK,4,7);g.pop();
  g.push(0,-207,1.1,1.08,opts.headAngle||0);g.push(0,217);
  for(const side of [-1,1]){g.ellipse(side*69,-266,12,19,skinB,INK,4);g.line([[side*72,-272],[side*68,-261]],shadeB,3)}
  const face=[[-67,-293],[-76,-274],[-67,-235],[-45,-219],[-28,-205],[-5,-199],[14,-207],[43,-215],[65,-241],[68,-271],[72,-300],[20,-326],[-15,-322],[-38,-326],[-58,-310],[-67,-293]];
  g.curve(face,skinB,INK,7,true);g.c.save();g.c.clip();
  g.poly([[41,-307],[68,-284],[63,-247],[36,-216],[8,-202],[-11,-215],[24,-230]],shadeB,null,0);g.c.restore();g.curve(face,null,INK,7,true);
  g.curve([[-77,-283],[-87,-332],[-49,-368],[-5,-369],[39,-375],[82,-341],[78,-283],[50,-285],[26,-291],[7,-280],[-13,-290],[-47,-283],[-77,-283]],'#e45e42',INK,7,true);
  g.curve([[30,-365],[61,-355],[82,-323],[78,-283],[58,-283],[33,-303],[28,-331],[26,-346],[28,-355],[30,-365]],'#b84437',null,0,true);
  for(const xx of [-32,0,33])g.rect(xx-6,-359+(xx?4:0),13,31,INK,null,0,6);
  g.star(-53,-320,8,'#f4d276');eyes(g,0,-270,'bo',pose,emotion,opts.look??1);
  g.ellipse(-1,-238,8,7,skinB,INK,3);mouth(g,0,panic?-205:-217,talk,panic,emotion==='relieved'?6:0);
  if(panic){for(const [xx,yy]of [[-61,-340],[64,-303]])g.curve([[xx,yy],[xx+8,yy+12],[xx+10,yy+24],[xx,yy+26],[xx-11,yy+27],[xx-10,yy+11],[xx,yy]],'#bce6eb',INK,3,true)}
  g.pop();g.pop();g.push(0,0,.85,1);
  if(opts.prop==='phone'){g.rect(rightHand.x-14,rightHand.y-52,32,57,'#46444f',INK,5,5);g.rect(rightHand.x-9,rightHand.y-42,22,32,'#8de1d8',null,0)}
  g.pop();
 }
 g.pop();g.inkScale=previousInk;
}
export function portal(g,x,y,r,t,alpha=1){let c=g.c;c.save();c.globalAlpha=alpha;g.ellipse(x,y,r*.86,r*1.18,'#caff731c',null,0);g.ellipse(x,y,r*.79,r*1.1,'#b8ff5a28',null,0);
 let pts=Array.from({length:120},(_,i)=>{let a=i/120*Math.PI*2,rr=r*(1+.034*Math.sin(a*9+t*2)+.02*Math.cos(a*13));return[x+Math.cos(a)*rr*.75,y+Math.sin(a)*rr]});g.poly(pts,'#45dc3c',INK,7);
 g.push(x,y,.72,1);for(let k=0;k<5;k++){let p=[];for(let i=0;i<=65;i++){let z=i/65,rr=r*.93*z,a=t*2.5+k*Math.PI*2/5+z*5;p.push([Math.cos(a)*rr,Math.sin(a)*rr])}for(let i=65;i>=0;i--){let z=i/65,rr=r*.93*z,a=t*2.5+k*Math.PI*2/5+z*5+.62;p.push([Math.cos(a)*rr,Math.sin(a)*rr])}g.poly(p,k%2?'#b5ff57':'#1faf43',null,0)}g.ellipse(0,0,r*.15,r*.15,'#f6ffd9',null,0);g.pop();
 for(let i=0;i<14;i++){let a=i*2.4+t*.7;g.ellipse(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*1.12,2.4,2.4,'#ebffb0',null,0)}
 for(let i=0;i<4;i++){let xx=x+(i-1.5)*r*.23;g.curve([[xx,y+r*.88],[xx-9,y+r*1.13],[xx+5,y+r*1.19],[xx+9,y+r*.94]],'#45dc3c',INK,4,true)}c.restore()
}
