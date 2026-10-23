import {P,clock,at,cel,ink,rect,ellipse,label,star,rays,ground,arrow,tag,caption,header,finish,smooth,pop,mix,tint} from '../../../src/print.mjs'
import {ada,hand,desk,laptop,sheet,book,flagTurkey,clockFace,check,pencil,bulb} from '../../../src/objects.mjs'
import {paintScene as paintShort} from '../../../src/film.mjs'

import {balanceState} from './lesson.mjs'

const original=new Set(['hook','title','four_tests','turkey','exam','guardrails','physics','limits','choose','step1','example','hint','algebra','step2','retrieve','feedback','step3','transfer','later','summary','caution','closing','credits'])
const colors={two_pages:P.paper,tests_detail:P.gold,evidence_board:P.blue,reading:P.gold,retrieval_study:P.paper,practice_cards:P.blue,calendar_long:P.pink,mix_cards:P.olive,balance:P.olive,error_work:P.gold,transfer_model:P.pink,writing:P.blue,code:P.olive,practice_log:P.paper}
function reveal(c,x,y,t,fn){if(t<0)return;at(c,x,y,Math.max(.001,pop(t/.32)),0,fn)}
function number(c,n,x,y){ellipse(c,x,y,36,36,P.ink,{w:0,off:false});label(c,String(n),x,y+15,{size:43,family:'Slab',fill:P.paper,align:'center'})}
function page(c,x,y,lines,{w=590,h=480,accent=P.blue,t=10}={}){
 rect(c,x-w/2+10,y-h/2+12,w,h,'#9D895133',12,{w:0});rect(c,x-w/2,y-h/2,w,h,P.cream,12,{w:3.8});rect(c,x-w/2,y-h/2,w,88,accent,9,{w:3});
 label(c,lines[0],x,y-h/2+57,{size:35,family:'Slab',align:'center',max:w-50,plate:P.paper});
 for(let i=1;i<lines.length;i++)if(t>.5+(i-1)*.6){label(c,lines[i],x,y-h/2+160+(i-1)*87,{size:44,align:'center',max:w-55});ink(c,[[x-w/2+40,y-h/2+184+(i-1)*87],[x+w/2-40,y-h/2+184+(i-1)*87]],2,{color:tint(accent,.35)})}
}
function ringObject(c,x,y,r,color,kind){ellipse(c,x,y,r,r,color,{w:3.5});if(kind==='screen')laptop(c,x,y+40,{s:r/220,screen:['HINT'],brand:'AI tutor'});if(kind==='paper')sheet(c,x,y,{s:r/260,lines:['MY TRY']});if(kind==='clock')clockFace(c,x,y,r*.58,.6);if(kind==='books'){book(c,x-35,y,r/190);book(c,x+35,y+8,r/190,P.coral)}}
function coin(c,x,y,value,fill=P.gold){ellipse(c,x,y,20,20,fill,{w:2.3});if(value)label(c,value,x,y+8,{size:23,align:'center'})}
function cube(c,x,y,value){rect(c,x-39,y-38,78,76,P.teal,7,{w:3});label(c,value,x,y+17,{size:50,family:'Slab',align:'center',fill:P.cream})}
function calendar(c,x,y,t,mode){
 rect(c,x,y,750,400,P.cream,12,{w:4});rect(c,x,y,750,70,P.coral,8,{w:3});label(c,mode==='spacing'?'ACROSS SESSIONS':'A LATER INDEPENDENT ATTEMPT',x+375,y+47,{size:30,align:'center',max:700,fill:P.cream});
 const labels=mode==='spacing'?['First','Later','Later again']:['Study','Put away','Return'];
 for(let i=0;i<3;i++){const xx=x+125+i*250;ink(c,[[x+i*250,y+70],[x+i*250,y+400]],2);label(c,labels[i],xx,y+124,{size:34,align:'center'});if(t>.6+i*1.0){sheet(c,xx,y+260,{s:.38,title:i===0?'TRY':'FRESH',lines:[i===0?'WITH HELP':'YOUR WORK']});number(c,i+1,xx+65,y+168)}}
 if(t>3.6){arrow(c,x+180,y+355,x+590,y+355,1,P.teal);tag(c,'Illustrative schedule — adjust the interval',x+375,y+465,{size:29,max:900})}
}
function paint(c,s,f){
 if(original.has(s.scene)){paintShort(c,s,f);return}
 const t=(f-s.start)/24,q=Math.floor(t*12)/12,d=(s.end-s.start)/24,a=(s.action-s.start)/24;
 let bg=colors[s.scene]||P.paper;if(s.scene==='evidence_board')bg=P[s.tone]||P.blue;
 ground(c,bg,{floor:!['two_pages','retrieval_study','balance','practice_log','mix_cards'].includes(s.scene),burst:['balance','tests_detail'].includes(s.scene),time:t});
 header(c,s.title,{kicker:s.chapter.toUpperCase(),t});
 c.save();const z=1+.012*smooth(t/Math.max(1,d-1));c.translate(960,520);c.scale(z,z);c.translate(-960,-520);
 switch(s.scene){
  case 'two_pages':{
   reveal(c,485,525,t,()=>page(c,0,0,s.left,{accent:P.blue,t}));
   reveal(c,1435,525,t-1,()=>page(c,0,0,s.right,{accent:P.olive,t:t-1}));
   ada(c,955,855,{s:.46,t:q,pose:t>2?'present':'think'});if(t>1.8){arrow(c,800,470,1090,470,smooth(t-1.8),P.ink)}
   break}
  case 'tests_detail':{
   const names=['With help','Alone','Later','New situation'],kinds=['screen','paper','clock','books'];
   for(let i=0;i<4;i++){const x=300+440*i,focus=s.focus===3?i>=2:i===s.focus;const y=focus?470:560,r=focus?150:108;
    reveal(c,x,y,t-i*.18,()=>{ringObject(c,0,0,r,[P.blue,P.goldL,P.pink,P.olive][i],kinds[i]);number(c,i+1,-r*.78,-r*.78);label(c,names[i],0,r+76,{size:41,family:'Slab',align:'center',max:405});if(focus)star(c,r+45,-r+20,28,P.coral)})}
   break}
  case 'evidence_board':{
   ada(c,325,805,{s:.83,t:q,pose:'point'});page(c,1190,525,s.lines,{w:940,h:520,accent:tint(bg,-.08),t});
   rect(c,1100,234,180,55,P.kraft,18,{w:3});if(t>a)tag(c,s.aside,1190,853,{size:32,max:1190});
   break}
  case 'reading':{
   ada(c,340,805,{s:.83,t:q,pose:s.mode==='closed'?'think':'point',emotion:s.mode==='closed'?'puzzled':'happy'});
   const close=s.mode==='closed'?smooth((t-1.3)/.38):0;
   at(c,1190,555,1,0,()=>{
    cel(c,[[-430,-240],[-30,-205],[0,-175],[30,-205],[430,-240],[430,245],[45,270],[0,280],[-45,270],[-430,245]],P.cream,{w:4});ink(c,[[0,-175],[0,280]],3);
    label(c,'THE EXAMPLE',-215,-130,{family:'Slab',size:43,align:'center',max:370});
    const lines=s.mode==='gap'?['Subtract 3','Divide by 2','Why?']:['2x + 3 = 11','2x = 8','x = 4'];
    lines.forEach((l,i)=>{if(t>.4+i*.6){if(s.mode==='gap'&&i===1)rect(c,54,-145+i*94,328,65,P.goldL,5,{w:0});label(c,l,217,-103+i*94,{size:48,align:'center',max:370})}});
    for(let i=0;i<4;i++)ink(c,[[-374,-42+i*45],[-67,-42+i*45]],3,{color:P.blue});
    if(close>0){c.save();c.translate(-430,0);c.scale(close,1);rect(c,0,-242,860,524,P.teal,12,{w:4});label(c,'NOW EXPLAIN IT',430,-30,{size:66,family:'Slab',align:'center',max:750,fill:P.paper});label(c,'without looking',430,64,{size:48,align:'center',fill:P.paper});c.restore()}
   });if(s.mode==='gap'&&t>3)tag(c,'Reopen the step you cannot explain',1190,865,{size:32});
   break}
  case 'retrieval_study':{
   const rowY=[410,670],labs=['REPEATED STUDY','RECALL TESTS'];
   for(let j=0;j<2;j++){label(c,labs[j],100,rowY[j]-64,{size:31,weight:600});book(c,235,rowY[j]+15,.62,j?P.olive:P.blue);arrow(c,355,rowY[j],545,rowY[j],smooth(t-.4));
    page(c,760,rowY[j],[j?'RETRIEVE':'READ AGAIN',j?'Blank page':'Open passage'],{w:360,h:180,accent:j?P.olive:P.blue,t:10});
    arrow(c,970,rowY[j],1150,rowY[j],smooth(t-1.5));clockFace(c,1250,rowY[j],66,.6);
    if(t>2.7){label(c,j?'Delayed advantage':'Immediate advantage',1585,rowY[j]+16,{size:34,align:'center',max:415});check(c,1585,rowY[j]+75,.65)}}
   label(c,s.phase==='confidence'?'More confidence after restudy did not settle later recall.':'Prose passages · Roediger & Karpicke (2006)',960,872,{size:31,align:'center',max:1700});
   break}
  case 'practice_cards':{
   for(let i=0;i<3;i++){const x=450+i*510;reveal(c,x,510,t-i*.8,()=>{ringObject(c,0,0,150,[P.gold,P.pink,P.olive][i],['paper','screen','clock'][i]);number(c,i+1,-115,-116);label(c,s.labels[i],0,240,{size:33,family:'Slab',align:'center',max:480})});if(i>0&&t>i*.8+.5)arrow(c,x-325,510,x-183,510,1,P.ink)}
   break}
  case 'calendar_long':{
   ada(c,345,805,{s:.82,t:q,pose:'present'});calendar(c,820,300,t,s.mode);break}
  case 'mix_cards':{
   if(s.mode==='fees'){
    book(c,430,485,1.2);book(c,790,485,1.2,P.coral);tag(c,'+$3 each',610,725,{size:40});
    if(t>1.5){page(c,1390,525,['FEE PER NOTEBOOK','2(x + 3) = 15','A different model'],{w:660,h:440,accent:P.pink,t});arrow(c,930,520,1035,520,smooth(t-1.5))}
   }else{
    const xs=[250,535,820,1105,1390,1675],types=['A','A','B','B','C','C'],permutation=[0,2,4,1,3,5],u=smooth((t-1.6)/1.0);
    for(let i=0;i<6;i++){const x=mix(xs[i],xs[permutation.indexOf(i)],u),y=480+Math.sin(u*Math.PI)*(i%2?120:-100);reveal(c,x,y,t-i*.13,()=>{rect(c,-108,-130,216,260,[P.blue,P.blue,P.gold,P.gold,P.pink,P.pink][i],14,{w:3.4});label(c,types[i],0,35,{family:'Slab',size:110,align:'center',plate:P.paper})})}
    tag(c,t<2?'Blocked by type':'Mixed: choose the method',960,815,{size:42});label(c,'Same problem types, a different order',960,883,{size:27,align:'center'})
   }break}
  case 'balance':{
   const state=balanceState(s.mode,t-a),u=state.progress;
   label(c,state.equation,960,294,{size:83,family:'Slab',align:'center',plate:P.paper,max:1700});
   cel(c,[[920,778],[1000,778],[980,478],[940,478]],P.kraft,{w:4});rect(c,795,780,330,40,P.kraft,10,{w:4});ink(c,[[400,480],[1520,480]],8);ellipse(c,960,480,15,15,P.gold,{w:3});
   for(const x of [525,1395]){ink(c,[[x-130,480],[x-165,660]],3);ink(c,[[x+130,480],[x+165,660]],3);cel(c,[[x-200,660],[x+200,660],[x+160,702],[x-160,702]],P.blue,{w:4})}
   cube(c,465+(s.mode==='divide'?60*u:0),605,'x');
   c.save();if(state.removeX){c.globalAlpha=1-u;c.translate(0,-130*u)}cube(c,580,605,'x');c.restore();
   for(let i=0;i<state.leftUnits;i++){c.save();if(state.removeUnits){c.globalAlpha=1-u;c.translate(0,-130*u)}coin(c,460+i*60,532,'1');c.restore()}
   for(let i=0;i<state.rightUnits;i++){c.save();if(i>=state.rightUnits-state.removeUnits){c.globalAlpha=1-u;c.translate(0,-130*u)}coin(c,1265+(i%5)*63,618-Math.floor(i/5)*53,'1');c.restore()}
   if(s.mode!=='initial'&&t>a)tag(c,s.mode==='divide'?'Divide BOTH sides by 2':'Subtract 3 from BOTH sides',960,885,{size:37});
   break}
  case 'error_work':{
   ada(c,330,810,{s:.82,t:q,pose:'think',emotion:'puzzled'});
   page(c,1110,525,['CHECK THE CLAIM','2x + 3 = 11',s.mode==='wrong'?'2x = 11  (wrong)':'2x = 8',s.mode==='wrong'?'x = 5.5':'x = 4'],{w:850,h:570,accent:s.mode==='wrong'?P.pink:P.olive,t});
   if(t>a){tag(c,s.mode==='wrong'?'2 × 5.5 + 3 = 14, not 11':'2 × 4 + 3 = 11',1170,861,{size:37,max:1110});if(s.mode==='correct')check(c,1630,600,1.7);else{ink(c,[[1570,530],[1660,620]],8,{color:P.coral,broken:false});ink(c,[[1660,530],[1570,620]],8,{color:P.coral,broken:false})}}
   break}
  case 'transfer_model':{
   book(c,350,495,1.22,P.blue);book(c,615,495,1.22,P.coral);label(c,'x',350,715,{size:77,family:'Slab',align:'center'});label(c,'x',615,715,{size:77,family:'Slab',align:'center'});tag(c,'$3 delivery, once',490,827,{size:36});
   const lines=s.mode==='build'?['MODEL THE TOTAL','x + x + 3','2x + 3 = 15']:s.mode==='solve'?['SOLVE','2x = 12','x = $6']:['CHECK THE COST','2 × $6 = $12','$12 + $3 = $15'];
   page(c,1370,535,lines,{w:700,h:500,accent:P.gold,t});arrow(c,805,505,985,505,smooth(t-.9));break}
  case 'writing':{
   ada(c,315,805,{s:.8,t:q,pose:s.mode==='question'?'think':'point'});rect(c,700,260,1030,580,P.cream,8,{w:4});label(c,'ILLUSTRATIVE PARAGRAPH',1215,320,{size:29,align:'center',fill:P.tealD});
   const lines=s.mode==='new'?['New topic. Blank page.','State the claim.','Choose the evidence.']:['The library should open later.','Evening classes finish at eight.','Who needs the extra hour?'];
   lines.forEach((l,i)=>{if(t>.4+i*.75){label(c,l,750,415+i*115,{size:43,max:920});ink(c,[[750,440+i*115],[1650,440+i*115]],2,{color:P.blue})}});
   if(s.mode==='question'&&t>a){ink(c,[[750,460],[1660,460]],7,{color:P.coral,broken:false});tag(c,'Which claim still needs evidence?',1200,880,{size:32})}
   if(s.mode==='claim'&&t>a)tag(c,'Claim / evidence / explanation',1215,880,{size:33});break}
  case 'code':{
   ada(c,230,805,{s:.69,t:q,pose:'point'});rect(c,570,260,1190,560,P.teal,22,{w:4});rect(c,600,290,1130,500,P.cream,16,{w:3});label(c,'A SMALL PYTHON FUNCTION',640,340,{size:26,tracking:3,fill:P.tealD});
   const fixed=s.mode==='repair';const code=fixed?['def first(items):','    if not items:','        return None','    return items[0]']:['def first(items):','    return items[0]'];
   code.forEach((l,i)=>label(c,l,650,415+i*66,{size:42,max:1000}));
   const result=s.mode==='trace'?'first([4, 7]) returns 4':s.mode==='empty'?'first([]) raises IndexError':'first([]) returns None';
   if(t>a){rect(c,620,704,1080,62,s.mode==='empty'?P.pink:P.goldL,7,{w:2});label(c,result,1160,748,{size:36,align:'center',max:1020});if(fixed)check(c,1670,370,.8)}
   break}
  case 'practice_log':{
   label(c,'A little learning record',960,285,{family:'Oleo',size:81,align:'center',fill:P.coral});rect(c,350,340,1240,500,P.cream,13,{w:4});
   const labels=['My attempt','Help I used','Error I corrected','Later, on my own'],values=['Explain an equation','One hint','Both sides must change','Solve a fresh problem'];
   for(let i=0;i<4;i++){const y=420+i*108;ink(c,[[380,y+40],[1555,y+40]],2,{color:P.blue});label(c,labels[i],405,y,{size:37,weight:600,max:460});if(t>.6+i*.85){label(c,values[i],925,y,{size:37,max:520});check(c,1530,y-15,.5)}}
   break}
  default:throw Error('Unknown long-film scene '+s.scene)
 }
 c.restore();if(s.caption)caption(c,s.caption,t-.25)
}
export function render(c,frame,tl){
 clock(frame);const i=tl.shots.findIndex(s=>s.start<=frame&&frame<s.end);if(i<0)throw Error('Frame outside edit');const s=tl.shots[i],local=frame-s.start;
 if(i>0&&local<14){const prev=tl.shots[i-1];if(s.scene==='credits'){c.fillStyle=P.ink;c.fillRect(0,0,1920,1080)}else paint(c,prev,prev.end-1);const u=smooth((local+1)/14);c.save();c.beginPath();
  if(['two_pages','evidence_board','writing','calendar_long','practice_log'].includes(s.scene))c.rect(1920*(1-u),0,1920*u,1080);else c.arc(s.scene==='credits'?960:1200,s.scene==='credits'?520:580,2300*u,0,Math.PI*2);c.clip();paint(c,s,frame);c.restore()
 }else paint(c,s,frame);
 if(s.scene==='closing'&&frame>=s.end-20){const r=2200*(1-smooth((frame-(s.end-20))/19));c.save();c.fillStyle=P.ink;c.beginPath();c.rect(0,0,1920,1080);c.arc(1145,560,Math.max(.01,r),0,Math.PI*2,true);c.fill('evenodd');c.restore()}
 finish(c)
}
