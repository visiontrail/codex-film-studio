import {openaiMark} from './marks.mjs'
import {P,at,cel,ink,path,rect,ellipse,label,star,tint,clamp,smooth} from './print.mjs'

export function hand(c,x,y,{s=1,angle=0,kind='open'}={}){
  at(c,x,y,s,angle,()=>{
    let d
    if(kind==='point')d='M -14 7 C -23 0 -20 -11 -10 -12 L -8 -40 C -7 -54 5 -53 7 -41 L 8 -15 C 17 -18 23 -12 22 -6 C 35 -6 34 8 27 11 C 31 22 19 26 11 22 L 6 34 L -13 30 Z'
    else if(kind==='grip')d='M -19 20 C -34 12 -29 -3 -18 -4 C -29 -15 -21 -24 -10 -20 C -1 -29 7 -26 10 -19 C 25 -24 32 -15 27 -7 C 36 0 32 10 24 12 C 28 24 17 29 6 22 L -4 32 Z'
    else d='M -14 24 C -24 19 -30 4 -25 -4 C -33 -10 -36 -22 -30 -25 C -24 -29 -19 -16 -13 -13 C -18 -24 -24 -39 -16 -43 C -9 -47 -4 -28 0 -17 C -1 -32 -2 -47 6 -46 C 15 -44 10 -25 12 -15 C 17 -26 21 -35 28 -31 C 35 -26 24 -14 21 -7 C 33 -14 43 -7 37 0 L 21 16 L 9 30 Z'
    cel(c,d,P.skin,{w:3.6,seed:77,broken:false});ink(c,[[1,5],[9,4],[17,7]],1.7,{broken:false})
  })
}
function elbow(s,t,l1=128,l2=145,bend=1){const dx=t[0]-s[0],dy=t[1]-s[1],d=Math.min(l1+l2-.1,Math.max(1,Math.hypot(dx,dy)));const a=Math.atan2(dy,dx),b=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return [s[0]+l1*Math.cos(a+b*bend),s[1]+l1*Math.sin(a+b*bend)]}
function sleeve(c,s,e,h){const points=[s,e,h];const widths=[17,13,10];const left=[],right=[];for(let i=0;i<3;i++){let a=points[Math.max(0,i-1)],b=points[Math.min(2,i+1)],an=Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2;left.push([points[i][0]+Math.cos(an)*widths[i],points[i][1]+Math.sin(an)*widths[i]]);right.push([points[i][0]-Math.cos(an)*widths[i],points[i][1]-Math.sin(an)*widths[i]])}cel(c,[...left,...right.reverse()],P.coral,{w:4,curve:true,seed:38});ink(c,[left[1],left[2]],2,{color:P.coralD,broken:false})}

export function ada(c,x,y,{s=1,t=0,pose='present',target=null,emotion='happy',dir=1,prop=null}={}){
  at(c,x,y,s,0,()=>{
    c.scale(dir,1)
    ellipse(c,0,7,82,14,'#8A754C44',{w:0,off:false})
    // Fixed held torso and narrow, geometric legs.
    cel(c,[[-48,-250],[-3,-250],[-7,-12],[-38,-10]],P.navy,{w:4,seed:2})
    cel(c,[[4,-250],[48,-250],[37,-12],[6,-12]],P.navy,{w:4,seed:3})
    cel(c,'M -41 -13 C -53 -19 -75 -3 -69 5 L -9 5 L -8 -12 Z',P.ink,{w:0})
    cel(c,'M 6 -13 L 38 -13 C 56 -10 64 -3 58 6 L 6 6 Z',P.ink,{w:0})
    let back=[-71,-204],front=[220,-360]
    if(pose==='write'){front=[250+Math.sin(t*5)*9,-211];back=[-57,-208]}
    if(pose==='think'){front=[68,-423];back=[-57,-209]}
    if(pose==='celebrate'){back=[-140,-515];front=[146,-521]}
    if(pose==='rest'){front=[72,-196]}
    if(pose==='point'){front=[270,-405]}
    if(pose==='close'){front=[230,-254]}
    if(!target&&['write','point','present'].includes(pose)){const reach=smooth(t/.45);front=[72+(front[0]-72)*reach,-220+(front[1]+220)*reach]}
    if(target)front=[(target[0]-x)/s*dir,(target[1]-y)/s]
    const bs=[-45,-372],fs=[43,-373]
    sleeve(c,bs,elbow(bs,back,112,125,1),back);hand(c,...back,{s:.56,angle:.7,kind:'open'})
    cel(c,[[-52,-380],[-35,-392],[34,-390],[55,-375],[48,-254],[-46,-254]],P.coral,{w:4,curve:true,seed:4})
    cel(c,[[29,-384],[50,-372],[44,-261],[27,-263]],P.coralD,{w:0})
    rect(c,-47,-267,95,14,P.gold,6,{w:2.8})
    rect(c,-17,-418,35,30,P.skin,8,{w:3})
    c.save();c.translate(0,22)
    // Cropped bob, bean face and triangular nose. Original character geometry.
    cel(c,'M -72 -490 C -89 -550 -31 -584 24 -563 C 68 -547 61 -497 68 -472 L 82 -444 C 44 -450 38 -428 5 -431 L -75 -438 L -91 -449 C -66 -449 -76 -474 -72 -490 Z',P.hair,{w:0})
    cel(c,'M -58 -525 C -45 -556 14 -565 43 -531 L 48 -504 L 79 -485 L 46 -477 C 42 -445 24 -425 -8 -429 C -47 -430 -67 -461 -58 -525 Z',P.skin,{w:3.8,seed:7})
    cel(c,'M -66 -523 C -70 -566 -14 -580 21 -558 C 32 -555 42 -547 47 -526 C 39 -512 3 -514 -18 -524 C -33 -504 -50 -500 -66 -512 Z',P.hair,{w:0})
    ink(c,[[-66,-538],[-39,-562],[-6,-565],[25,-549]],6,{color:P.gold,broken:false})
    const blink=(Math.floor(t*12)%59)<2
    if(blink){ink(c,[[1,-502],[12,-502]],3,{broken:false});ink(c,[[29,-504],[37,-504]],3,{broken:false})}
    else{ellipse(c,7,-501,3.8,7,P.ink,{w:0,off:false});ellipse(c,33,-504,3.4,6.7,P.ink,{w:0,off:false});ellipse(c,8,-504,1.2,2,P.cream,{w:0,off:false})}
    if(emotion==='puzzled'){ink(c,[[-1,-518],[11,-524]],3,{broken:false});ink(c,[[23,-522],[37,-517]],3,{broken:false});ink(c,[[13,-454],[29,-459],[35,-455]],2.6,{broken:false})}
    else ink(c,[[9,-456],[20,-450],[33,-458]],2.8,{broken:false})
    ellipse(c,-18,-472,10,6,'#EFA98F',{w:0,off:false})
    ellipse(c,-45,-464,5,7,P.gold,{w:0,off:false})
    c.restore()
    const e=pose==='think'?[143,-350]:elbow(fs,front,128,145,1);sleeve(c,fs,e,front)
    hand(c,...front,{s:.63,angle:pose==='point'?Math.PI/2:pose==='write'?1.6:.8,kind:pose==='point'?'point':pose==='write'?'grip':'open'})
    if(prop==='pencil'||pose==='write')at(c,front[0]+10,front[1]+8,1,.4,()=>pencil(c,0,0,.75))
  })
}
export function pencil(c,x,y,s=1){at(c,x,y,s,0,()=>{cel(c,[[-5,-70],[6,-70],[6,28],[0,44],[-5,28]],P.gold,{w:2,broken:false});cel(c,[[-5,28],[6,28],[0,44]],P.skin,{w:1.5});cel(c,[[-2,38],[3,38],[0,44]],P.ink,{w:0});rect(c,-5,-78,11,13,P.coral,2,{w:1.5})})}
export function desk(c,x=1150,y=650,w=700){cel(c,[[x-w/2+30,y],[x-w/2+60,y],[x-w/2+20,807],[x-w/2-3,807]],P.kraft,{w:3.4});cel(c,[[x+w/2-50,y],[x+w/2-20,y],[x+w/2+23,807],[x+w/2+2,807]],P.kraft,{w:3.4});cel(c,[[x-w/2-25,y-15],[x+w/2-5,y-15],[x+w/2+35,y+8],[x-w/2-5,y+10]],'#DDB47F',{w:4});ink(c,[[x-w/2+22,y+6],[x+w/2-5,y+6]],2,{color:'#A2713F'})}
export function laptop(c,x,y,{s=1,open=1,screen=['2x + 3 = 11','x = 4'],brand='AI tutor',hint=false}={}){
  at(c,x,y,s,0,()=>{
    ellipse(c,4,15,195,17,'#735B3C33',{w:0,off:false})
    c.save();c.scale(1,Math.max(.035,open));cel(c,[[-159,-245],[152,-245],[166,-12],[-155,-12]],P.teal,{w:4.5,curve:true,seed:18});rect(c,-137,-222,269,176,P.cream,15,{w:3.2,seed:20})
    const identified=brand.startsWith('GPT');if(identified)openaiMark(c,-100,-201,30)
    label(c,brand,identified?12:0,-191,{size:24,weight:600,align:'center',fill:P.tealD,max:identified?180:230})
    screen.forEach((s,i)=>label(c,s,0,-135+i*43,{size:hint?25:35,weight:500,align:'center',max:245}))
    ellipse(c,0,-29,5,4,P.coral,{w:0});c.restore()
    cel(c,[[-155,-12],[168,-12],[204,22],[-195,22]],P.teal,{w:4,seed:21});rect(c,-44,-3,88,15,P.tealD,4,{w:1.8})
    for(let i=0;i<8;i++)ink(c,[[-132+i*35,-5],[-125+i*35,8]],1.4,{color:P.tealD,broken:false})
  })
}
export function sheet(c,x,y,{s=1,rot=0,lines=[],title='',color=P.cream,progress=100}={}){at(c,x,y,s,rot,()=>{cel(c,[[-190,-215],[165,-222],[185,217],[-178,212]],'#AC966C44',{w:0});cel(c,[[-202,-227],[152,-234],[173,205],[-190,200]],color,{w:3.5,seed:31});if(title)label(c,title,-14,-165,{size:31,weight:600,align:'center',max:315});ink(c,[[-159,-135],[123,-138]],2,{color:P.blue});lines.forEach((v,i)=>{if(progress>i)label(c,v,-20,-75+i*69,{size:36,align:'center',max:320})})})}
export function book(c,x,y,s=1,color=P.blue){at(c,x,y,s,-.1,()=>{cel(c,[[-85,-110],[75,-100],[88,105],[-68,103]],P.cream,{w:3});cel(c,[[-93,-117],[67,-108],[79,93],[-82,103]],color,{w:4});ink(c,[[-66,-112],[-57,94]],3,{color:tint(color,-.3)});rect(c,-49,-65,100,44,P.cream,2,{w:2});label(c,'NOTES',0,-35,{size:22,align:'center'})})}
export function flagTurkey(c,x,y,s=1){at(c,x,y,s,0,()=>{cel(c,[[0,0],[150,0],[150,100],[0,100]],'#CB443D',{w:2.8,seed:71});ellipse(c,60,50,29,29,P.cream,{w:0,off:false});ellipse(c,69,46,23,23,'#CB443D',{w:0,off:false});star(c,100,48,16,P.cream,5,Math.PI/2);ink(c,[[0,-8],[0,150]],4,{broken:false})})}
export function clockFace(c,x,y,r,t=0){ellipse(c,x,y,r,r,P.cream,{w:4,seed:6});for(let i=0;i<12;i++){const a=i*Math.PI/6;ink(c,[[x+Math.sin(a)*r*.82,y-Math.cos(a)*r*.82],[x+Math.sin(a)*r*.9,y-Math.cos(a)*r*.9]],2.5,{broken:false})}ink(c,[[x+Math.sin(t)*r*.45,y-Math.cos(t)*r*.45],[x,y],[x+Math.sin(t*1.8+.8)*r*.7,y-Math.cos(t*1.8+.8)*r*.7]],4,{broken:false});ellipse(c,x,y,6,6,P.coral,{w:0})}
export function check(c,x,y,s=1,color=P.teal){ink(c,[[x-25*s,y],[x-6*s,y+23*s],[x+37*s,y-32*s]],8*s,{color,broken:false})}
export function bulb(c,x,y,s=1){at(c,x,y,s,0,()=>{cel(c,'M -25 33 C -26 5 -60 -5 -52 -42 C -44 -94 46 -94 53 -43 C 60 -7 27 5 25 33 Z',P.gold,{w:4});rect(c,-23,33,46,35,P.teal,5,{w:3});ink(c,[[-20,42],[20,42]],2);ink(c,[[-20,54],[20,54]],2);ink(c,[[-10,30],[-10,-10],[10,-10],[10,30]],2,{broken:false})})}
