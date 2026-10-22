import {P,clock,at,cel,ink,path,rect,ellipse,label,star,rays,ground,arrow,tag,caption,header,finish,smooth,clamp,pop,mix,tint} from './print.mjs'
import {ada,hand,desk,laptop,sheet,book,flagTurkey,clockFace,check,pencil,bulb} from './objects.mjs'

const colors={hook:P.gold,title:P.gold,four_tests:P.paper,turkey:P.blue,exam:P.blue,guardrails:P.gold,physics:P.olive,limits:P.pink,choose:P.blue,step1:P.blue,example:P.gold,hint:P.gold,algebra:P.olive,step2:P.olive,retrieve:P.paper,feedback:P.gold,step3:P.blue,transfer:P.pink,later:P.pink,summary:P.paper,caution:P.paper,closing:P.gold,credits:P.ink}
function floatIn(c,x,y,u,fn){at(c,x,y,Math.max(.001,pop(u/.28)),0,fn)}
function callout(c,x,y,r,t,fn){const sc=Math.max(.001,pop(t/.3));at(c,x,y,sc,0,()=>{ellipse(c,8,10,r,r,'#725C3433',{w:0});ellipse(c,0,0,r,r,P.paper,{w:4,seed:89});c.save();c.beginPath();c.arc(0,0,r-11,0,Math.PI*2);c.clip();fn();c.restore();ellipse(c,0,0,r-12,r-12,null,{w:2.7,seed:16})})}
function medallion(c,n,x,y,r,color){ellipse(c,x,y,r,r,color,{w:3.6,seed:n*18});label(c,String(n),x,y+r*.34,{size:r*1.12,family:'Slab',align:'center',fill:color===P.ink?P.paper:P.ink,plate:color===P.ink?null:P.paper})}
function screenDesk(c,t,{closed=0,pose='write',text=['2x + 3 = 11','x = 4'],brand='AI tutor',x=690}={}){
  desk(c,1120,650,770);laptop(c,1175,625,{s:1.0,open:1-closed,screen:text,brand})
  cel(c,[[854,624],[1000,620],[1034,651],[872,660]],P.cream,{w:2.2,seed:31});ink(c,[[889,637],[967,634]],1.5,{color:P.blue});ink(c,[[897,646],[985,641]],1.5,{color:P.ink})
  ada(c,x,803,{s:.94,t:pose==='write'?Math.max(0,t-1):t,pose,emotion:closed>.8?'puzzled':'happy'})
}
function stampValue(c,value,x,y,t,color=P.teal){floatIn(c,x,y,t,()=>{star(c,0,0,130,color,16);label(c,value,0,32,{size:80,family:'Slab',fill:P.cream,plate:P.ink,align:'center',max:225})})}
function topSheet(c,t,lines,shown=10){sheet(c,960,540,{s:1.35,rot:-.035,lines,progress:shown,title:'ADA’S OWN WORK'});pencil(c,1340,780,1.2);book(c,480,600,.8,P.blue)}
function chatBubble(c,x,y,width,lines,color=P.paper){rect(c,x,y,width,lines.length*52+42,color,22,{w:3.3,seed:12});cel(c,[[x+35,y+lines.length*52+38],[x+10,y+lines.length*52+72],[x+77,y+lines.length*52+38]],color,{w:2.8});lines.forEach((l,i)=>label(c,l,x+width/2,y+51+i*52,{size:34,align:'center',max:width-44}))}

function paintScene(c,shot,frame){
  const t=(frame-shot.start)/24,q=Math.floor(t*12)/12,d=(shot.end-shot.start)/24
  const action=(shot.action-shot.start)/24,a=q-action,u=smooth((q-.5)/.55)
  const scene=shot.scene,color=colors[scene]
  ground(c,color,{floor:!['title','four_tests','algebra','retrieve','summary','caution','credits'].includes(scene),burst:['hook','title','algebra','step2','closing'].includes(scene),time:t})
  // A gentle rostrum camera; labels and bottom caption remain in screen coordinates.
  c.save()
  const zoom=['summary','caution','credits','four_tests'].includes(scene)?1:1+.018*smooth(t/Math.max(1,d-1))
  c.translate(960,520);c.scale(zoom,zoom);c.translate(-960,-520)
  switch(scene){
    case 'hook':{
      const closed=smooth((a+.05)/.25)
      desk(c,1135,650,765);laptop(c,1215,625,{s:1.08,open:1-closed,screen:['2x + 3 = 11','x = 4']})
      cel(c,[[835,626],[1035,626],[1060,658],[854,663]],P.cream,{w:2.5});label(c,closed>.8?'?':'DONE',945,650,{size:25,align:'center'})
      ada(c,620,803,{s:1,t:q,pose:closed>.8?'think':'point',emotion:closed>.8?'puzzled':'happy'})
      c.save();c.beginPath();c.rect(90,80,Math.max(0,750*smooth(t/.7)),170);c.clip();label(c,'Meet Ada.',90,213,{family:'Oleo',size:142,plate:P.paper});c.restore()
      if(t>1.4)tag(c,'Homework: finished.',1320,282,{size:36})
      if(closed>.8){star(c,1515,530,34,P.coral);label(c,'?',1450,550,{size:150,family:'Slab',plate:P.paper})}
      break}
    case 'title':{
      rays(c,1360,570,P.goldL,t*.007);ellipse(c,1400,585,335,335,P.paper,{w:4,seed:31})
      ada(c,1410,875,{s:1.1,t:q,pose:'present'});star(c,1700,300,35,P.coral);star(c,1145,770,28,P.coral)
      label(c,'Does AI help',120,300,{family:'Slab',size:115,plate:P.paper,max:1040})
      label(c,'you learn…',120,445,{family:'Slab',size:115,plate:P.paper,max:1040})
      if(t>.9)label(c,'or just finish?',120,615,{family:'Oleo',size:128,plate:P.paper,max:1050})
      if(t>1.5){rect(c,128,716,690,61,P.ink,27,{w:0,off:false});label(c,'A LITTLE GUIDE TO LEARNING WITH AI',473,758,{size:27,fill:P.paper,align:'center',tracking:3,max:640})}
      break}
    case 'four_tests':{
      header(c,'Four different tests',{kicker:'LOOK BEYOND THE FINISHED PAGE',t})
      const names=['With help','Alone','Later','New problem']
      for(let i=0;i<4;i++){
        const x=340+i*415,enter=t-.25-i*1.25
        if(enter<0)continue
        floatIn(c,x,496,enter,()=>{ellipse(c,0,0,150,150,[P.blue,P.gold,P.pink,P.olive][i],{w:3});if(i===0)laptop(c,0,68,{s:.58,screen:['HINT'],brand:'AI tutor'});if(i===1)sheet(c,0,0,{s:.45,lines:['2x = 8','x = 4']});if(i===2)clockFace(c,0,0,85,.7);if(i===3){book(c,-40,0,.55);book(c,45,8,.55,P.coral)};medallion(c,i+1,-117,-115,34,P.ink);label(c,names[i],0,224,{size:39,family:'Slab',align:'center',max:360})})
        if(i>0&&t>i*1.25+1)arrow(c,x-249,492,x-177,492,1,P.ink)
      }
      label(c,'Performance  ·  Independence  ·  Retention  ·  Transfer',960,834,{size:34,align:'center',max:1650})
      break}
    case 'turkey':{
      header(c,'A better practice score…',{kicker:'RANDOMIZED HIGH-SCHOOL MATHEMATICS STUDY',t})
      flagTurkey(c,1590,235,1.1);tag(c,'Turkey',1670,445,{size:30})
      desk(c,780,670,590);laptop(c,840,645,{s:.9,screen:['2x + 3 = 11','x = 4'],brand:'GPT-4'})
      cel(c,[[520,646],[610,646],[630,671],[530,673]],P.cream,{w:2});ada(c,365,807,{s:.77,t:q,pose:'write'});sheet(c,1315,545,{s:.94,title:'PRACTICE',lines:['WITH GPT BASE']})
      if(a>0){stampValue(c,'+48%',1320,610,a,P.teal);tag(c,'relative to control',1315,824,{size:29})}
      label(c,'Nearly 1,000 students · Bastani et al., PNAS (2025)',100,890,{size:26})
      break}
    case 'exam':{
      header(c,'…did not mean better learning',{kicker:'THE SAME STUDY: EXAM WITHOUT THE TOOL',t})
      desk(c,780,670,590);laptop(c,840,645,{s:.9,open:0,screen:[],brand:'GPT-4'});ada(c,365,807,{s:.77,t:q,pose:'think',emotion:'puzzled'})
      sheet(c,1315,545,{s:.94,title:'UNAIDED EXAM',lines:[]})
      if(a>0){stampValue(c,'−17%',1320,610,a,P.coral);tag(c,'relative to control',1315,824,{size:29})}
      label(c,'GPT Base group · Relative changes, not percentage points',100,890,{size:26})
      break}
    case 'guardrails':{
      header(c,'Make the tutor give a hint',{kicker:'TOOL DESIGN CHANGES THE LEARNING TASK',t})
      screenDesk(c,q,{pose:'point',text:['Which operation','comes first?'],brand:'GPT Tutor',x:450})
      if(t>.8)callout(c,1580,395,205,t-.8,()=>{rect(c,-195,-180,390,360,P.cream,8,{w:0});label(c,'TEACHER’S HINT',0,-106,{size:29,weight:600,align:'center'});label(c,'Undo the',0,-30,{size:45,align:'center'});label(c,'addition first.',0,30,{size:43,align:'center'});bulb(c,0,111,.49)})
      if(t>2)tag(c,'Penalty largely removed',1150,855,{size:32})
      break}
    case 'physics':{
      header(c,'A different tutor. A different result.',{kicker:'SEPARATE COLLEGE PHYSICS EXPERIMENT',t})
      ada(c,390,803,{s:.86,t:q,pose:'point'});desk(c,1160,680,870);laptop(c,1430,650,{s:.75,screen:['Predict.','Explain. Test.'],brand:'Guided tutor'})
      ink(c,path('M880 660 L880 310 L1090 310'),9,{broken:false});const theta=.38*Math.cos(t*2.6),px=995+Math.sin(theta)*210,py=310+Math.cos(theta)*210;ink(c,[[995,310],[px,py]],3,{broken:false});ellipse(c,995,310,8,8,P.ink,{w:0,off:false});ellipse(c,px,py,43,43,P.coral,{w:4});arrow(c,1050,540,1120,540,smooth(t-1),P.ink)
      if(t>1)tag(c,'Higher immediate test scores',1110,820,{size:34})
      label(c,'Compared with an active classroom lesson · Kestin et al. (2025)',100,890,{size:26})
      break}
    case 'limits':{
      header(c,'Now is not the same as later',{kicker:'WHAT THE EVIDENCE DOES — AND DOES NOT — SHOW',t})
      ada(c,420,805,{s:.86,t:q,pose:'present'});clockFace(c,925,510,165,t*.18)
      rect(c,1300,310,320,386,P.paper,8,{w:4});rect(c,1300,310,320,73,P.coral,5,{w:3});label(c,'MONTHS LATER',1460,360,{size:31,weight:600,align:'center',max:286});label(c,'?',1460,595,{size:180,family:'Slab',align:'center',plate:P.gold})
      arrow(c,1100,510,1265,510,smooth(t-1));tag(c,'Not measured here',1460,780,{size:30})
      break}
    case 'choose':{
      header(c,'Keep the thinking in your hands',{kicker:'WHEN LEARNING IS THE GOAL',t})
      screenDesk(c,q,{pose:'present',text:['A hint, please.','Check my step.'],x:440})
      if(t>1)callout(c,1560,350,180,t-1,()=>{sheet(c,0,0,{s:.7,lines:['MY METHOD','MY REASON']});hand(c,70,117,{s:1.3,angle:-.3,kind:'point'})})
      break}
    case 'step1':{
      header(c,'Make an attempt',{number:1,t});screenDesk(c,q,{pose:t<1?'think':'write',text:['What have you','tried so far?'],x:690})
      if(t>1.5)callout(c,1585,365,209,t-1.5,()=>{sheet(c,0,0,{s:.86,lines:['2x + 3 = 11'],title:'FIRST ATTEMPT'});pencil(c,105,10,1);hand(c,120,-55,{s:.95,kind:'grip',angle:1.5})})
      break}
    case 'example':{
      header(c,'New topic? Use an example',{number:1,kicker:'MATCH THE HELP TO WHAT YOU KNOW',t})
      ada(c,420,805,{s:.83,t:q,pose:'present'});at(c,1220,555,1,0,()=>{cel(c,[[-350,-230],[-30,-190],[0,-165],[30,-190],[350,-230],[350,245],[45,260],[0,275],[-45,260],[-350,245]],P.cream,{w:4,seed:47});ink(c,[[0,-165],[0,270]],3);label(c,'WORKED',-175,-117,{size:39,family:'Slab',align:'center'});label(c,'EXAMPLE',-175,-60,{size:39,family:'Slab',align:'center'});bulb(c,-175,90,.8);['2x + 3 = 11','2x = 8','x = 4'].forEach((str,i)=>{if(t>1+i*.9)label(c,str,170,-90+i*95,{size:38,align:'center',max:285})})})
      break}
    case 'hint':{
      header(c,'Ask for the next useful hint',{number:1,t})
      ada(c,400,804,{s:.8,t:q,pose:'point'});laptop(c,1050,760,{s:1.42,screen:[],brand:'AI tutor'})
      chatBubble(c,765,250,700,['Check my first step.','What should I undo first?'])
      if(t>2.4)chatBubble(c,1030,500,640,['Try subtracting three','from both sides.'],P.cream)
      break}
    case 'algebra':{
      rays(c,1000,590,tint(P.olive,.3),t*.008);header(c,'Undo the addition first',{number:1,t})
      rect(c,410,315,1100,445,P.paper,28,{w:4.5});label(c,'2x + 3',825,462,{size:108,family:'Slab',align:'center'});label(c,'=',1090,462,{size:108,family:'Slab',align:'center'});label(c,'11',1290,462,{size:108,family:'Slab',align:'center'})
      if(a>0){const v=smooth(a/.22);label(c,'− 3',825,585,{size:66,align:'center',fill:P.coral});label(c,'− 3',1290,585,{size:66,align:'center',fill:P.coral});ink(c,[[545,610],[1370,610]],4);label(c,'2x',825,715,{size:81,family:'Slab',align:'center'});label(c,'=',1090,715,{size:81,family:'Slab',align:'center'});label(c,'8',1290,715,{size:81,family:'Slab',align:'center'});const hy=100+v*100;cel(c,[[1248,-60],[1344,-60],[1338,hy-50],[1258,hy-50]],P.coral,{w:4,seed:98});hand(c,1300,hy,{s:2.4,angle:Math.PI,kind:'point'})}
      break}
    case 'step2':{
      header(c,'Hide the answer',{number:2,t});const close=smooth(a/.22)
      laptop(c,960,765,{s:2.05,open:1-close,screen:['2x + 3 = 11','x = 4']})
      // The glove contacts the same hinge-driven lid that it closes.
      const hy=765-245*2.05*(1-close)
      cel(c,[[2040,250],[1770,245],[1450,hy-70],[1190,hy-25],[1190,hy+15],[1450,hy-15],[1780,310],[2040,315]],P.coral,{w:5,curve:true,seed:99})
      hand(c,1190,hy,{s:1.55,angle:-Math.PI/2,kind:'open'})
      if(a>.6)tag(c,'A fresh sheet. Your own explanation.',960,861,{size:35})
      break}
    case 'retrieve':{
      header(c,'Tell yourself why',{number:2,t})
      const sub=(shot.cues?.subtracts-shot.start)/24||2,div=(shot.cues?.divides-shot.start)/24||4.2,num=(shot.cues?.number-shot.start)/24||6.2;const n=t<sub?1:t<num?2:3
      topSheet(c,q,['2x + 3 = 11','2x = 8','x = 4'],n)
      if(t>sub)tag(c,'Subtract 3 from BOTH sides',1510,420,{size:29,max:560})
      if(t>div)tag(c,'Divide BOTH sides by 2',1490,610,{size:29,max:560})
      break}
    case 'feedback':{
      header(c,'Check the answer',{number:2,t})
      ada(c,420,805,{s:.86,t:q,pose:'point'});sheet(c,1210,530,{s:1.15,title:'CHECK IN THE ORIGINAL',lines:['2 × 4 + 3','8 + 3','11']})
      if(a>0){floatIn(c,1480,690,a,()=>{ellipse(c,0,0,94,94,P.teal,{w:3});check(c,0,0,1.5,P.cream)});tag(c,'It checks.',1220,845,{size:35})}
      break}
    case 'step3':{
      header(c,'Change the problem',{number:3,t})
      ada(c,430,805,{s:.86,t:q,pose:'present'});sheet(c,1000,525,{s:.8,rot:-.09,title:'NEW NUMBERS',lines:['2x + 3 = 15','x = ?']})
      if(t>1){book(c,1510,518,1.1,P.coral);book(c,1375,550,.95,P.blue);tag(c,'A new situation',1460,790,{size:34})}
      arrow(c,1180,430,1350,430,smooth(t-1.7))
      break}
    case 'transfer':{
      header(c,'Build the equation yourself',{number:3,t})
      const progress=smooth(t/3),z=mix(1.12,1,progress)
      at(c,960,535,z,0,()=>{
        cel(c,[[-680,-255],[675,-245],[700,295],[-688,295]],'#E9D4AE',{w:4,seed:22})
        book(c,-420,-50,1.2,P.blue);book(c,-200,-50,1.2,P.coral)
        tag(c,'$3 delivery',-310,190,{size:37,color:P.cream})
        sheet(c,395,-3,{s:1.03,title:'TOTAL: $15',lines:a>=0?['2x + 3 = 15','2x = 12','x = $6']:['x = ?'],progress:a<.7?1:a<1.35?2:3})
        label(c,'TWO NOTEBOOKS',-310,-195,{size:34,weight:600,align:'center'});arrow(c,-40,15,170,15,smooth(t-1.5))
      })
      break}
    case 'later':{
      header(c,'Come back later',{number:3,t})
      ada(c,390,805,{s:.85,t:q,pose:'think'});desk(c,1170,660,700);laptop(c,1390,634,{s:.72,open:0});sheet(c,1050,620,{s:.5,title:'A FRESH PROBLEM',lines:['YOUR TURN']})
      rect(c,845,235,310,250,P.cream,9,{w:3.5});rect(c,845,235,310,58,P.coral,9,{w:3});label(c,'ANOTHER DAY',1000,277,{size:29,align:'center'});clockFace(c,1000,386,70,.6)
      if(t>1.3){const p=smooth((t-1.3)/.45);c.save();c.globalAlpha=1-p;cel(c,[[845,293],[1155,293],[1155+220*p,485-180*p],[845+200*p,485-180*p]],P.paper,{w:3});c.restore()}
      tag(c,'No tool. No copied answer.',1210,838,{size:33})
      break}
    case 'summary':case 'caution':{
      const isTip=scene==='caution'
      label(c,'A little practice manual',960,158,{family:'Oleo',size:88,fill:P.coral,plate:P.paper,align:'center'})
      label(c,'Make the next attempt yours.',960,249,{family:'Slab',size:67,plate:P.goldL,align:'center',max:1710})
      const centers=[485,960,1435]
      for(let i=0;i<3;i++){
        const e=isTip?10:t-.2-i*.55;if(e<0)continue
        floatIn(c,centers[i],490,e,()=>{
          ellipse(c,0,0,132,132,[P.blue,P.gold,P.olive][i],{w:4,seed:i+80});medallion(c,i+1,-104,-104,35,P.ink)
          if(i===0){sheet(c,0,10,{s:.37,lines:['MY TRY']});pencil(c,65,3,.8)}
          if(i===1){laptop(c,0,35,{s:.5,open:0});hand(c,40,-30,{s:.7,kind:'point',angle:Math.PI})}
          if(i===2){book(c,-35,0,.5);clockFace(c,45,10,47,.5)}
          label(c,['Attempt','Hide & explain','Change & return'][i],0,202,{size:43,family:'Slab',align:'center',max:435})
          label(c,['Use suitable guidance','Check and correct','Test transfer and retention'][i],0,248,{size:29,align:'center',max:430})
        })
        if(i<2&&(isTip||t>1.2+i*.55))arrow(c,centers[i]+160,487,centers[i+1]-160,487,1,P.ink)
      }
      if(isTip||t>2.3){cel(c,[[545,817],[1375,817],[1355,849],[1375,881],[545,881],[565,849]],P.pink,{w:3});star(c,600,848,22,P.coral,12);label(c,isTip?'Adapt the help to the learner and task.':'Check the work. Keep the thinking.',980,861,{size:32,align:'center',max:700})}
      break}
    case 'closing':{
      header(c,'What can you do on your own?',{kicker:'WHEN THE ANSWER IS GONE',t})
      ellipse(c,1145,560,310,310,P.paper,{w:4});desk(c,1150,700,680);laptop(c,1335,673,{s:.75,open:0});sheet(c,1020,608,{s:.63,title:'MY METHOD',lines:['2x + 3 = 15','x = $6']});ada(c,590,805,{s:1.01,t:q,pose:'present'})
      if(t>1.5){check(c,1030,700,1.2);star(c,1500,345,33,P.coral);star(c,805,336,22,P.cream)}
      break}
    case 'credits':{
      ellipse(c,960,520,425,425,P.paper,{w:3.8,seed:16});label(c,'Learn. Then try.',960,347,{family:'Oleo',size:79,align:'center',plate:P.goldL});label(c,'MID-CENTURY CARTOON',960,414,{size:26,fill:P.coral,tracking:5,align:'center'});label(c,'Does AI Help You Learn',960,498,{size:37,family:'Slab',align:'center',max:690});label(c,'—or Just Finish?',960,554,{size:37,family:'Slab',align:'center',max:690});label(c,'An original Codex Film Studio production',960,631,{size:25,align:'center',max:690});label(c,'Style reference: LemoLab / lemo-opuscar',960,682,{size:23,align:'center',max:690});label(c,'New story, drawings, animation and score.',960,720,{size:22,align:'center',max:690});star(c,960,810,30,P.teal,8)
      break}
  }
  c.restore()
  if(shot.caption)caption(c,shot.caption,t-.25)
}

export function render(c,frame,timeline){
  clock(frame)
  const index=timeline.shots.findIndex(s=>s.start<=frame&&frame<s.end)
  if(index<0)throw Error('Frame outside edit')
  const shot=timeline.shots[index],local=frame-shot.start
  // Circular changes of step, color-plane wipes for evidence and tips.
  if(index>0&&local<14){
    const prev=timeline.shots[index-1];if(shot.scene==='credits'){c.fillStyle=P.ink;c.fillRect(0,0,1920,1080)}else paintScene(c,prev,prev.end-1)
    const u=smooth((local+1)/14)
    c.save();c.beginPath()
    if(['limits','choose','summary','caution'].includes(shot.scene))c.rect(1920*(1-u),0,1920*u,1080)
    else c.arc(shot.scene==='credits'?960:1260,shot.scene==='credits'?520:620,2300*u,0,Math.PI*2)
    c.clip();paintScene(c,shot,frame);c.restore()
  }else paintScene(c,shot,frame)
  if(shot.scene==='closing'&&frame>=shot.end-20){const radius=2200*(1-smooth((frame-(shot.end-20))/19));c.save();c.fillStyle=P.ink;c.beginPath();c.rect(0,0,1920,1080);c.arc(1145,560,Math.max(.01,radius),0,Math.PI*2,true);c.fill('evenodd');c.restore()}
  finish(c)
}
