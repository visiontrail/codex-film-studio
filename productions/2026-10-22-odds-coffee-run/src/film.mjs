import {Ink,INK,WHITE,clamp,ease} from './ink.mjs';
import {character,portal} from './cast.mjs';
import {background,props,palettes,football} from './worlds.mjs';
const tags={home:['DIMENSION 01','THE COFFEE PROBLEM'],odds:['DIMENSION 02','THE HOUSE MARGIN'],parlay:['DIMENSION 03','ONE MORE GATE'],pool:['DIMENSION 04','THE MONEY SOUP'],attention:['DIMENSION 05','ONE MORE TURN'],stadium:['DIMENSION 06','EVIDENCE, PLEASE'],legal:['DIMENSION 07','SUSPICIOUSLY NORMAL'],underground:['DIMENSION 08','PAY LATER']};
export function drawFilm(ctx,frame,timeline,width=1920){ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);let g=new Ink(ctx,frame);g.push(0,0,width/1920);let t=frame/24,shot=timeline.shots.find(s=>frame>=s.start&&frame<s.end)||timeline.shots.at(-1),local=(frame-shot.start)/24,line=timeline.cues.find(c=>c.id===shot.line)||{id:'L000',shot:'wide',emotion:'deadpan',speaker:'qin'},kind=shot.kind,world=shot.world;
 const contentLine=line;line={...line,shot:shot.shot||line.shot};let cue=line.start===undefined?null:line,speech=cue&&frame>=cue.start&&frame<cue.end,index=cue?Math.floor((frame-cue.start)/2):0,amp=speech?(cue.rms12?.[index]??(.3+Math.sin(index*1.7)*.2)):0;
 const homeReturn=world==='home'&&(kind==='arrival'||Number(line.id.slice(1))>=45);
 const boX=world==='home'?(homeReturn?515:650):530,qinX=world==='home'?(homeReturn?960:1000):810;
 let cam={x:960,y:580,z:1.45};if(world==='home')cam.x=860;if(kind==='title')cam={x:960,y:540,z:1.15};if(kind==='dialogue'){
  if(['bo','qin'].includes(line.shot))cam={x:line.shot==='bo'?boX:qinX-40,y:line.shot==='bo'?(line.emotion==='panic'?590:580):470,z:2.7};
  if(['phone'].includes(line.shot))cam={x:boX+22,y:650,z:2.8};
  if(['board','machine','coins','gates','pool','referee','turkey','woolmer','brands','asia','flags','debt','hanson','reveal'].includes(line.shot))cam={x:world==='home'?1400:1410,y:['hanson','woolmer'].includes(line.shot)?490:510,z:1.36};
  if(line.shot==='pool')cam={x:1380,y:650,z:1.36};
  if(line.shot==='portal')cam={x:850,y:565,z:1.30};
  cam.z*=1+Math.min(.035,local*.0025);
  if(line.emotion==='panic'&&local<.8){cam.x+=Math.sin(frame*4)*4;cam.y+=Math.cos(frame*3)*2}
 }
 if(kind==='cold')cam={x:265,y:495,z:2.4+local*.025};
 if(kind==='departure'&&world==='home')cam={x:850,y:565,z:1.31};
 if(kind==='end'){
  g.rect(-4,-4,1928,1088,'#231638',null,0);g.push(960,505,1.38,1);portal(g,0,0,415,t,.48);g.pop();title(g,t,960,300,1);g.text('A sci-fi sitcom about sports betting',960,679,42,'#e7d8b8');g.text('AN INTERDIMENSIONAL CAUTIONARY COMEDY',960,751,28,'#bbaac9',{font:'VT323'});g.text('Visual reference: Coffee Run - LemoLab (CC BY 4.0)',960,850,25,'#bbaac9',{font:'VT323'});g.text('THE HOUSE GETS COFFEE / 2026',960,887,23,'#bbaac9',{font:'VT323'});football(g,960+Math.sin(local*3)*77,493+Math.cos(local*2)*66,22);g.pop();return;
 }
 g.push(960-cam.x*cam.z,540-cam.y*cam.z,cam.z);background(g,world,t);props(g,world,{...contentLine,shot:line.shot==='debt'?'debt':contentLine.shot},Math.max(0,cue?(frame-cue.start)/24:local));
 if(kind==='cold'){
  // The machine acts before either character speaks: a blinking warning and
  // two tiny drops land in the cup on the cold-open foley beats.
  g.push(270,617,1.25);
  if(Math.floor(frame/6)%2===1){g.rect(-65,-168,97,40,'#1c302b',null,0);g.text('NO CREDIT',-14,-141,19,'#80b88b',{font:'VT323'})}
  for(let onset of [8,29]){let phase=(frame-onset)/8;if(phase>=0&&phase<1){let y=-57+phase*phase*9;g.ellipse(-14,y,2.4,3.1,'#76482f',INK,1.4)}}
  g.pop();
 }
 let qb={x:qinX,y:865,s:1},bb={x:boX,y:865,s:.93};
 if(kind==='arrival'){let d=ease(local/.7);qb.y=865-(1-d)*500;bb.y=865-(1-ease((local-.2)/.75))*540;qb.s=1+Math.sin(Math.max(0,local-.7)*17)*Math.exp(-Math.max(0,local-.7)*8)*.08;portal(g,250,490,150,t,1-ease((local-.9)/.5))}
 if(kind==='departure'){let d=ease(local/.9),px=world==='home'?qinX+290:660;if(local<=.65)portal(g,px,world==='home'?535:540,world==='home'?210:180*(.7+d*.4),t);qb.x=qinX+(px-qinX)*d;bb.x=boX+(px-boX)*d;qb.y=865-270*d;bb.y=865-210*d;qb.s=1-d*.95;bb.s=.93-d*.85}
 let acting=performance(frame,line,speech),gesture=acting.gesture;
 let still=line.id==='L048'&&frame>line.end;
 let focus=['bo','qin','phone'].includes(line.shot)?line.shot:null;
 let insert=['board','machine','coins','gates','pool','referee','turkey','woolmer','brands','asia','flags','debt','hanson','reveal'].includes(line.shot)&&kind==='dialogue';
 if(kind!=='cold'){
  if(!insert&&focus!=='qin')character(g,'bo',bb.x,bb.y,bb.s,{time:t,flight:kind==='arrival'?1-ease((local-.2)/.75):0,angle:kind==='arrival'?-.2*(1-ease((local-.2)/.75)):0,talk:line.speaker==='bo'?amp:0,emotion:line.speaker==='bo'?line.emotion:world==='underground'?'worry':'alert',gesture:line.speaker==='bo'?gesture:0,headAngle:line.speaker==='bo'?acting.headAngle:-.025,prop:contentLine.shot==='phone'||line.shot==='phone'||world==='attention'?'phone':null,still});
  if(!insert&&focus!=='bo'&&focus!=='phone')character(g,'qin',qb.x,qb.y,qb.s,{time:t,flight:kind==='arrival'?1-ease(local/.75):0,angle:-.13+(kind==='arrival'?.16*(1-ease(local/.7)):0),talk:line.speaker==='qin'?amp:0,emotion:line.speaker==='qin'?line.emotion:'deadpan',gesture:line.speaker==='qin'?gesture:0,headAngle:line.speaker==='qin'?acting.headAngle:0,prop:line.shot==='portal'||(kind==='departure'&&world==='home')?'remote':null,still});
 }
 if(line.shot==='portal'){let d=ease((local-.7)/.6);portal(g,qinX+290,535,210*d,t)}
 g.pop();
 if(kind==='departure'&&local>.65){
  // Enlarge the existing world portal into the wipe, preserving its center at the handoff.
  const d=ease((local-.65)/.35),px=world==='home'?qinX+290:660,py=world==='home'?535:540;
  const sx=960+(px-cam.x)*cam.z,sy=540+(py-cam.y)*cam.z,r=(world==='home'?210:180*(.7+ease(local/.9)*.4))*cam.z;
  portal(g,sx+(960-sx)*d,sy+(540-sy)*d,r+2000*d,t);
 }
 if(kind==='arrival'&&local<.35){let d=1-ease(local/.35);portal(g,960,540,1700*d,t)}
 if(kind==='title')title(g,t,1000,240,Math.min(1,local*4));
 if(['dialogue','arrival'].includes(kind)&&world!=='home'&&line.id!=='L048')tag(g,world,(frame-(shot.world_entry??shot.start))/24);
 if(speech){let cap=timeline.captions.find(c=>frame>=c.start&&frame<c.end);if(cap)caption(g,cap)}
 g.pop()
}
function performance(frame,line,speaking){
 if(!speaking)return {gesture:0,headAngle:0};
 const f=Math.floor((frame-line.start)/2)*2,age=f/24,duration=(line.end-line.start)/24;
 const settle=ease(age/.22),release=1-ease((age-duration+.22)/.22);
 const beat=Math.floor(age/1.7),accent=[1,.52,.84][beat%3],base=({panic:.96,shock:.76,eager:.65,explain:.72,worry:.25,think:.28,confused:.45,smug:.35,relieved:.28,serious:.15,deadpan:.10,tired:.06,blank:0})[line.emotion]??.15;
 const previous=[1,.52,.84][Math.max(0,beat-1)%3],transition=ease((age-beat*1.7)/.16);
 const held=previous+(accent-previous)*transition;
 const tilt=({panic:.075,shock:-.065,eager:.035,smug:-.06,think:.09,confused:.06,worry:.04,relieved:-.035,tired:.055})[line.emotion]??-.018;
 return {gesture:base*held*settle*release,headAngle:tilt*settle+Math.sin(Math.min(1,(age%1.7)/.28)*Math.PI)*.018};
}
function tag(g,world,t){let [a,b]=tags[world];g.rect(65,55,435,126,({odds:'#f7449f',parlay:'#ee8730',pool:'#478f83',attention:'#664292',stadium:'#546b8e',legal:'#9d7c4c',underground:'#873c56'})[world],INK,6,9);g.text(('> '+a).slice(0,Math.floor(t*40)+4),92,96,39,WHITE,{font:'VT323',align:'left'});g.text(b,92,145,28,WHITE,{font:'VT323',align:'left'})}
function title(g,t,x,y,s){g.push(x,y,s,s,-.025);g.ellipse(0,15,615,110,null,'#59cfd0',7);g.text('THE HOUSE GETS',6,-22,83,'#b94980',{font:'Bungee',stroke:INK,width:19});g.text('THE HOUSE GETS',0,-28,83,'#fff0ce',{font:'Bungee',stroke:INK,width:12});g.text('COFFEE',10,83,104,'#b94980',{font:'Bungee',stroke:INK,width:19});g.text('COFFEE',0,73,104,'#fff0ce',{font:'Bungee',stroke:INK,width:12});for(let i of [-1,1])g.star(i*630,-37,15,'#e8bf65',4);g.pop()}
function caption(g,cap){let c=g.c;c.font='800 48px Baloo';let words=cap.text.split(' '),rows=[cap.text];
 if(c.measureText(cap.text).width>1250&&words.length>1){let cut=1,best=Infinity;for(let j=1;j<words.length;j++){let a=words.slice(0,j).join(' '),b=words.slice(j).join(' '),wa=c.measureText(a).width,wb=c.measureText(b).width,score=Math.abs(wa-wb)+Math.max(0,Math.max(wa,wb)-1250)*10;if(score<best){best=score;cut=j}}rows=[words.slice(0,cut).join(' '),words.slice(cut).join(' ')]}
 let base=rows.length===1?981:952;rows.forEach((s,i)=>g.text(s,1002,base+i*57,48,WHITE,{stroke:INK,width:12}));let maxw=Math.max(...rows.map(s=>c.measureText(s).width)),x=Math.max(72,1002-maxw/2-102);g.rect(x,base-15,81,32,cap.speaker==='bo'?'#df6d51':'#3d9c98',INK,3,7);g.text(cap.speaker==='bo'?'BO':'QIN',x+40,base+3,23,WHITE,{font:'VT323'})}
