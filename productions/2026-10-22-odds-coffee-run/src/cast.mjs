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
 let w=13+open*(panic?15:6),h=3+open*(panic?28:14);g.ellipse(x,y,w,h,'#492234',INK,4);g.rect(x-w*.63,y-h*.68,w*1.2,Math.min(8,h*.5),WHITE,null,0,2);if(h>12)g.ellipse(x+2,y+h*.53,w*.5,h*.23,'#d77d93',null,0)}
function eyes(g,x,y,kind,t,emotion,dir=1){let blink=((Math.floor(t*12)+(kind==='qin'?11:33))%63<2);let lid=kind==='qin'?!['panic','shock'].includes(emotion):['deadpan','tired','blank'].includes(emotion);let panic=['panic','shock'].includes(emotion);let rx=kind==='qin'?22:25,ry=kind==='qin'?25:25;
 for(let i=0;i<2;i++){let cx=x+(kind==='qin'?(i?24:-23):(i?32:-31)),cy=y+(i?-2:0);if(kind==='bo'){g.ellipse(cx,cy,31,31,'#deedf2',INK,5);if(blink)g.ellipse(cx,cy,25,25,skinB,INK,3)}g.ellipse(cx,cy,rx,blink?2:ry,WHITE,INK,kind==='bo'?3:4);if(!blink){g.ellipse(cx+dir*6+(panic?Math.sin(t*65+i)*2:0),cy+3,kind==='bo'?2.4:3.4,kind==='bo'?2.4:4,INK,null,0);if(lid){g.curve([[cx-rx,cy],[cx-rx,cy-ry*1.34],[cx+rx,cy-ry*1.34],[cx+rx,cy],[cx+rx*.3,cy-2],[cx-rx*.4,cy+2],[cx-rx,cy]],kind==='qin'?skinA:skinB,null,0,true);g.ellipse(cx,cy,rx,ry,null,INK,5);g.line([[cx-rx,cy+2],[cx+rx,cy-2]],INK,5)}}}
 if(kind==='bo')g.line([[x-1,y-4],[x+2,y-4]],INK,5);
 if(kind==='qin'){g.curve([[x-53,y-41],[x-39,y-46],[x-10,y-40],[x+4,y-43],[x+22,y-52],[x+50,y-47],[x+55,y-40],[x+59,y-34],[x+40,y-36],[x+29,y-36],[x+4,y-38],[x-17,y-30],[x-53,y-32],[x-61,y-31],[x-59,y-38],[x-53,y-41]],'#3e394a',INK,4,true);return}
 let up=panic?-14:emotion==='eager'?-9:emotion==='suspicious'?5:0;g.curve([[x-49,y-40+up],[x-32,y-48+up],[x-14,y-41],[x-4,y-40]],null,INK,7);g.curve([[x+7,y-42],[x+22,y-46+up],[x+45,y-42+up],[x+50,y-39]],null,INK,7)
}
export function character(g,kind,x,y,scale=1,opts={}){
 let t=opts.still?0:(opts.time||0),pose=Math.floor(t*12)/12,emotion=opts.emotion||'deadpan',talk=opts.talk||0,panic=emotion==='panic',gesture=opts.gesture||0;
 let breath=opts.still?0:Math.sin(pose*2.3)*.007;let jitter=panic?Math.sin(pose*89)*2.7:0;g.push(x+jitter,y,scale*(1-breath),scale*(1+breath),opts.angle||0);
 if(kind==='qin'){
  // Patterned socks and oversized flat slippers.
  for(let lx of [-38,31]){g.rect(lx-13,-96,25,79,'#b39bd0',INK,5,6);for(let yy=-80;yy<-25;yy+=16)g.line([[lx-12,yy],[lx+11,yy]],'#71557b',3);g.ellipse(lx-10,-9,36,15,'#dd8fb1',INK,6)}
  g.curve([[-80,-290],[-113,-230],[-103,-110],[-83,-83],[-20,-72],[44,-72],[85,-87],[98,-174],[96,-237],[62,-291]],'#278f89',INK,7,true);
  g.poly([[45,-287],[73,-270],[91,-180],[84,-86],[50,-78],[36,-221]],'#1f6667',null,0);
  g.poly([[-29,-293],[31,-296],[14,-185]],'#b99ccf',INK,4);g.line([[-55,-281],[-24,-238],[9,-188],[-5,-120]],INK,4);g.line([[32,-290],[48,-242],[20,-196]],INK,4);
  g.rect(-92,-143,178,23,'#246f73',INK,5,7);g.ellipse(-10,-130,13,12,'#267a7d',INK,4);g.poly([[-15,-122],[-32,-76],[-11,-83],[-3,-121]],'#2d7d7a',INK,4);
  g.rect(39,-119,30,25,null,'#1a6669',3,4);
  // Neck and head: asymmetry, long nose, beard shadow, forehead goggles.
  g.rect(-21,-320,45,34,skinA,INK,5,9);g.push(0,-300,.82,1,-.075);g.push(0,300);
  let head=[[-62,-446],[-24,-482],[53,-474],[73,-425],[92,-374],[64,-315],[20,-306],[-25,-297],[-68,-333],[-76,-383],[-84,-412],[-78,-435],[-62,-446]];
  g.curve(head,skinA,INK,7,true);g.c.save();g.c.clip();
  g.curve([[-65,-348],[-50,-359],[-30,-349],[-9,-343],[22,-359],[40,-356],[65,-335],[55,-319],[20,-310],[-24,-309],[-58,-329],[-65,-348],[-65,-348]],shadeA,null,0,true);
  g.c.restore();g.curve(head,null,INK,7,true);
  g.curve([[-64,-443],[-55,-468],[-16,-478],[12,-462],[20,-470],[33,-467],[43,-448]],'#454551',INK,5,true);
  g.line([[-69,-438],[56,-452]],'#454551',10);
  for(let xx of [-27,13]){g.ellipse(xx,-460,18,16,'#6e7181',INK,5);g.ellipse(xx,-460,14,12,'#f1b839',null,0);g.ellipse(xx+4,-465,4,3,'#fff1b0',null,0)};
  g.curve([[-12,-469],[-22,-496],[15,-493],[12,-477]],null,INK,4);
  eyes(g,-5,-386,'qin',pose,emotion,opts.look??-1);
  g.curve([[-7,-392],[-12,-373],[-32,-363],[-28,-352],[-25,-340],[-5,-338],[4,-348],[9,-360],[5,-376],[0,-383]],skinA,INK,5);
  g.curve([[-51,-358],[-37,-351],[-28,-351],[-20,-355]],null,'#ac8064',3);
  g.curve([[10,-357],[25,-352],[42,-358],[48,-364]],null,INK,2.5);g.curve([[21,-349],[32,-347],[42,-351],[44,-352]],null,INK,2);
  for(let i=0;i<22;i++){let xx=-49+(i*29%106),yy=-338+(i*17%25);if(((xx+5)/66)**2+((yy+383)/75)**2<.90)g.ellipse(xx,yy,1.25,1.25,'#a78263',null,0)}
  mouth(g,12,-331,talk,panic,emotion==='relieved'?7:-1);
  g.pop();g.pop();
  // Near arm retains a clear elbow and independent hand.
  let hx=-105-gesture*55,hy=-176-gesture*80;
  g.curve([[-75,-270],[-101,-276],[-116,-213],[hx,hy],[hx+16,hy+16],[-69,-189],[-55,-230]],'#2ca099',INK,6,true);hand(g,hx-4,hy+5,.8,gesture>.6);
  g.curve([[75,-266],[104,-252],[118,-181],[93,-163],[80,-168],[71,-206],[66,-228]],'#226f70',INK,6,true);hand(g,91,-164,.8);
  if(opts.prop==='remote'){g.rect(hx-22,hy-44,34,65,'#737b89',INK,5,8);g.ellipse(hx-5,hy-23,10,10,'#ed5b51',INK,3);g.line([[hx-6,hy-47],[hx-8,hy-62]],INK,4)}
  else {g.rect(69,-191,42,49,'#f7e4c3',INK,5,5);g.ellipse(90,-191,21,6,'#74472e',INK,4);g.curve([[108,-181],[134,-188],[133,-151],[111,-155]],null,INK,5)}
 }else{
  // Helmeted nervous assistant: compact silhouette, broad eyes, contrasting warm skin.
  for(let lx of [-28,30]){g.rect(lx-10,-68,20,54,'#e4bd90',INK,5,4);g.rect(lx-12,-32,23,22,WHITE,INK,3);g.ellipse(lx-7,-8,31,12,'#738dce',INK,5)}
  g.curve([[-61,-208],[-89,-175],[-80,-95],[-57,-66],[-8,-58],[55,-58],[69,-79],[84,-117],[77,-185],[52,-208]],'#9663bd',INK,7,true);
  g.poly([[49,-202],[73,-166],[74,-101],[56,-69],[26,-62],[36,-124]],'#714698',null,0);
  g.poly([[-42,-204],[-10,-187],[8,-204],[-4,-164]],WHITE,INK,4);g.line([[-60,-80],[60,-80]],'#b88fcf',5);
  g.rect(-51,-155,34,34,WHITE,INK,3,4);g.line([[-43,-169],[-42,-148]],'#e67455',5);g.line([[-29,-167],[-28,-147]],'#55b4aa',5);
  g.rect(-15,-225,31,28,skinB,INK,4,7);
  g.ellipse(-2,-266,72,70,skinB,INK,7);g.poly([[43,-313],[68,-284],[66,-246],[39,-211],[8,-202],[-26,-219],[29,-231]],shadeB,null,0);
  g.curve([[-74,-276],[-88,-333],[-44,-370],[0,-365],[56,-366],[82,-327],[75,-278],[52,-297],[47,-311],[27,-305],[3,-315],[-17,-300],[-34,-311],[-53,-292],[-66,-285],[-74,-276]],'#e45e42',INK,7,true);
  g.poly([[38,-356],[63,-339],[77,-312],[74,-278],[54,-295],[49,-317]],'#b84437',null,0);
  for(let i=-2;i<=2;i++)g.line([[i*22,-351+(i*i)*3],[i*24,-330+(i*i)*4]],INK,8);
  g.star(-44,-324,9,'#f4d276');eyes(g,0,-270,'bo',pose,emotion,opts.look??1);
  g.ellipse(0,-238,10,6,skinB,INK,3);mouth(g,2,-219,talk,panic,emotion==='relieved'?6:0);
  let hy=-132-gesture*90,hx=81+gesture*50;
  g.curve([[67,-171],[83,-173],[81,-156],[hx+3,hy-7],[hx+13,hy+6],[hx-6,hy+18],[hx-13,hy+10],[72,-143],[60,-152],[67,-171]],skinB,INK,5,true);g.curve([[59,-190],[77,-195],[88,-178],[79,-162],[75,-145],[57,-153],[51,-164]],WHITE,INK,5,true);hand(g,hx,hy,.65,gesture>.5,skinB);
  g.curve([[-61,-189],[-80,-173],[-82,-127],[-57,-116],[-44,-122],[-57,-143],[-47,-173]],'#9f70c2',INK,5,true);hand(g,-53,-122,.65,false,skinB);
  if(opts.prop==='phone'){g.rect(hx-14,hy-52,32,57,'#46444f',INK,5,5);g.rect(hx-9,hy-42,22,32,'#8de1d8',null,0)}
  if(panic){g.curve([[68,-303],[81,-280],[87,-273],[78,-266],[68,-265],[65,-279],[68,-303]],'#bce6eb',INK,3,true)}
 }
 g.pop()
}
export function portal(g,x,y,r,t,alpha=1){let c=g.c;c.save();c.globalAlpha=alpha;g.ellipse(x,y,r*.86,r*1.18,'#caff731c',null,0);g.ellipse(x,y,r*.79,r*1.1,'#b8ff5a28',null,0);
 let pts=Array.from({length:120},(_,i)=>{let a=i/120*Math.PI*2,rr=r*(1+.034*Math.sin(a*9+t*2)+.02*Math.cos(a*13));return[x+Math.cos(a)*rr*.75,y+Math.sin(a)*rr]});g.poly(pts,'#45dc3c',INK,7);
 g.push(x,y,.72,1);for(let k=0;k<5;k++){let p=[];for(let i=0;i<=65;i++){let z=i/65,rr=r*.93*z,a=t*2.5+k*Math.PI*2/5+z*5;p.push([Math.cos(a)*rr,Math.sin(a)*rr])}for(let i=65;i>=0;i--){let z=i/65,rr=r*.93*z,a=t*2.5+k*Math.PI*2/5+z*5+.62;p.push([Math.cos(a)*rr,Math.sin(a)*rr])}g.poly(p,k%2?'#b5ff57':'#1faf43',null,0)}g.ellipse(0,0,r*.15,r*.15,'#f6ffd9',null,0);g.pop();
 for(let i=0;i<14;i++){let a=i*2.4+t*.7;g.ellipse(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*1.12,2.4,2.4,'#ebffb0',null,0)}
 for(let i=0;i<4;i++){let xx=x+(i-1.5)*r*.23;g.curve([[xx,y+r*.88],[xx-9,y+r*1.13],[xx+5,y+r*1.19],[xx+9,y+r*.94]],'#45dc3c',INK,4,true)}c.restore()
}
