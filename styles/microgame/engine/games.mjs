import {W,H,INK,clamp,lerp,smooth,ease,hash,line,rr,oval,path,text,fitText,transformed,star,command,fuse,stamp} from './primitives.mjs';
import {palettes,background,finish,mediumObject,materialPass} from './materials.mjs';
import {hero} from './characters.mjs';
import {blot,brush} from './brush.mjs';
export function drawGame(g,s,lt,film,createCanvas,cache,options={}){
 let m=s.medium,p=palettes[m],dur=(s.end-s.start)/30,u=clamp(lt/dur),tick=Math.floor(lt*s.character_fps)/s.character_fps,pu=clamp(tick/dur),a=smooth((pu-.28)/.42),done=u>.76;
 background(g,m,createCanvas,cache);
 g.save();
 const sceneZoom=m==='ink'&&['pour','stir'].includes(s.action)?1.5:m==='swiss'?1.15:m==='blueprint'?1.20:1.0; g.translate(270,620);g.scale(sceneZoom,sceneZoom);g.translate(-270,-620);
 let floor=720;
 if(m!=='terminal'&&m!=='pixel'){g.fillStyle=p.ground;g.fillRect(0,floor,W,60);line(g,[[0,floor],[W,floor]],p.ink,m==='blueprint'?2:4)}
 if(m==='crayon'){for(let i=0;i<70;i++)line(g,[[i*10-40,775],[i*10+25,723]],p.paper,2);oval(g,454,300,35,35,p.object,p.ink,2);for(let i=0;i<12;i++){let an=i/12*6.28;line(g,[[454+Math.cos(an)*43,300+Math.sin(an)*43],[454+Math.cos(an)*57,300+Math.sin(an)*57]],p.object,2)}}
 if(m==='ink'){brush(g,[[35,748],[190,741],[350,746],[508,738]],7,27);rr(g,450,290,31,43,2,p.accent,null);text(g,'02',465,312,18,p.paper,null,0,'Titan One')}
 if(m==='woodcut'){for(let i=0;i<7;i++){let xx=i*90;path(g,[[xx-60,717],[xx+25,583],[xx+110,717]],p.ground,p.ink,1);for(let j=0;j<8;j++)line(g,[[xx-30+j*10,704],[xx+25+j*3,620+j*9]],p.paper,1)}}
 // A wide, legible play area. Early poses on 8 fps; camera/UI remain continuous.
 let hx=m==='ink'?180:137,hy=675,hs=1.48,arm=.15+.6*Math.sin(a*Math.PI),lean=.10*Math.sin(a*Math.PI),jump=0;
 if(['jump','carry','collect'].includes(s.action))hx=lerp(110,380,a);
 if(s.action==='jump')jump=Math.sin(a*Math.PI)*183;
 if(s.action==='carry'){hy=690-Math.sin(a*8*Math.PI)*5;lean=.1*Math.sin(a*5)}
 if(!s.success&&done){arm=.85;lean=-.15}
 const item=(x,y,scale=1,kind=s.object,rot=0)=>transformed(g,x,y,scale,rot,()=>mediumObject(g,m,0,0,1,kind));
 const bowl=(x=354,y=651)=>{
  if(m==='ink'){
   path(g,[[x-72,y-15],[x+72,y-15],[x+52,y+45],[x-52,y+45]],'#c3c5b7',null);
   brush(g,[[x-72,y-15],[x-52,y+45],[x+52,y+45],[x+72,y-15]],6,210);
   const points=[];for(let i=0;i<=60;i++){let a=i/60*6.28;points.push([x+Math.cos(a)*72,y-15+Math.sin(a)*17])}brush(g,points,4,211);
  }else{path(g,[[x-72,y-15],[x+72,y-15],[x+52,y+45],[x-52,y+45]],p.hero,p.ink,m==='blueprint'?2:4);oval(g,x,y-15,72,17,p.paper,p.ink,3)}
 };
 const bits=(x,y,n,color,spread=70)=>{for(let i=0;i<n;i++){let ang=hash(i*13)*6.28,dd=hash(i*31)*spread;oval(g,x+Math.cos(ang)*dd,y+Math.sin(ang)*dd,2+hash(i)*6,2+hash(i*3)*4,color,p.ink,1)}};
 switch(s.action){
 case 'scoop':
  bowl();oval(g,355,623,48,16,p.paper,p.ink,2);bits(355,617,15,p.object,35);transformed(g,lerp(270,350,a),lerp(490,605,a)+Math.sin(a*Math.PI)*-50,1,-.5+a,()=>{line(g,[[-48,0],[18,0]],p.ink,10);oval(g,35,0,25,12,p.paper,p.ink,3);bits(35,-8,7,p.object,18)});break;
 case 'pour':{
  bowl();let ax=304,ay=456;item(ax,ay,1,s.object,-a*1.35);
  if(a>.15){let streamEnd=lerp(ay+30,634,clamp((a-.15)*3));line(g,[[330,ay+25],[340,streamEnd]],m==='ink'?p.ink:s.object==='icing'?'#f293b8':p.accent,12);bits(340,streamEnd,10,p.object,24)}
  if(!s.success&&a>.62){let sp=smooth((a-.62)/.38);for(let i=0;i<13;i++){let xx=lerp(350,80+i*33,sp),yy=lerp(635,610+Math.sin(i*2)*90,sp);if(m==='ink')blot(g,xx,yy,sp*(20+hash(i)*30),sp*(20+hash(i+8)*20),150+i);else oval(g,xx,yy,sp*(20+hash(i)*30),sp*(20+hash(i+8)*20),p.accent,null)}if(m==='ink')blot(g,350,704,120*sp,20*sp,174);else oval(g,350,704,120*sp,20*sp,p.accent,null)}break;
 }
 case 'meter':{
  rr(g,285,345,160,330,12,p.paper,p.ink,4);for(let i=0;i<11;i++){let y=625-i*24;line(g,[[315,y],[i%5?338:360,y]],p.ink,2)}
  rr(g,376,355,40,296,4,p.ground,p.ink,2);let value=done?.72:.1+.85*Math.abs(Math.sin(a*3.4));g.fillStyle=p.accent;g.fillRect(381,645-value*280,30,value*280);rr(g,369,423,54,29,2,null,p.accent,4);text(g,done?'LOCK':'CHECK',365,320,26,p.ink,null,0,m==='terminal'?'monospace':'Arial');item(222,609,.6);break;
 }
 case 'stir':bowl();item(354,638,.7);transformed(g,355,604,1,Math.sin(a*18)*.55,()=>{line(g,[[0,-132],[0,35]],p.ink,10);line(g,[[-2,-132],[-2,35]],p.object,5)});if(a>.2)for(let i=0;i<6;i++){let ang=a*16+i;oval(g,355+Math.cos(ang)*46,631+Math.sin(ang)*13,4,3,p.accent,null)}break;
 case 'catch':item(365,lerp(342,608,ease(a)),.9,s.object,a*1.8);line(g,[[276,642],[460,642]],p.ink,7);rr(g,305,652,133,40,5,p.hero,p.ink,3);if(done)star(g,435,575,18,p.accent);break;
 case 'press':item(357,658,1.3);transformed(g,355,lerp(390,600,a<.7?a/.7:lerp(1,.25,(a-.7)/.3)),1,0,()=>{rr(g,-15,-70,30,66,4,p.hero,p.ink,3);rr(g,-62,-10,124,27,4,p.object,p.ink,4)});if(a>.6)bits(355,680,18,p.object,65);break;
 case 'roll':item(355,666,1.35,'dough');item(355+Math.sin(a*12)*42,633,1.4,'rollingpin');break;
 case 'cut':case 'crack':{
  let split=smooth((a-.55)/.25);if(a<.62)item(355,647,1.3);else {g.save();g.beginPath();g.rect(250-split*30,550,104,170);g.clip();item(355-split*30,647,1.3);g.restore();g.save();g.beginPath();g.rect(355+split*30,550,150,170);g.clip();item(355+split*30,647,1.3);g.restore()}
  if(s.action==='cut'){let ky=lerp(396,644,clamp(a*1.4));path(g,[[344,ky-90],[364,ky-90],[364,ky+30],[344,ky+12]],p.paper,p.ink,3);rr(g,342,ky-137,24,52,5,p.accent,p.ink,3)}
  if(!s.success&&a>.6){bits(355,640,26,p.object,125*split);item(470+split*70,665+split*105,.45,'crumb',split*6);text(g,'CRUNCH.',350,390,26,p.accent,null,0,'serif')}break;
 }
 case 'collect':
  for(let i=0;i<6;i++){let ix=250+i*40,iy=700;if(a>i/7){ix=lerp(ix,hx+65,smooth((a-i/7)*4));iy=lerp(iy,595,smooth((a-i/7)*4))}item(ix,iy,.28,s.object,i*.8)}item(hx+72,639,.6,'box');break;
 case 'stack':
  for(let i=0;i<4;i++){let pr=clamp(a*4-i);item(362+Math.sin(a*10+i)*3,lerp(300,670-i*55,ease(pr)),.8,s.object);if(pr<.001)break}break;
 case 'fan':
  item(368,640,1.1);transformed(g,258,496,1,Math.sin(a*18)*.35,()=>{path(g,[[0,80],[-49,-25],[10,-57],[65,-15]],p.paper,p.ink,3);for(let i=0;i<6;i++)line(g,[[0,80],[-49+i*22,-25-Math.sin(i/5*Math.PI)*30]],p.ink,1) });
  for(let i=0;i<4;i++){let yy=480+i*32;line(g,[[300,yy],[360+20*Math.sin(a*30),yy-10],[440,yy]],p.ink,2)}break;
 case 'jump':item(300,698,.85);break;
 case 'dial':{
  item(360,628,1.5);oval(g,355,441,68,68,p.paper,p.ink,4);for(let i=0;i<11;i++){let an=-2.5+i*.5;line(g,[[355+Math.cos(an)*50,441+Math.sin(an)*50],[355+Math.cos(an)*59,441+Math.sin(an)*59]],p.ink,2)}let angle=lerp(-2.5,1.0,a);line(g,[[355,441],[355+Math.cos(angle)*48,441+Math.sin(angle)*48]],p.accent,6);oval(g,355,441,8,8,p.ink,null);break;
 }
 case 'fold':{
  let q=smooth(a);path(g,[[285,603],[430,603],[430,696],[285,696]],p.object,p.ink,3);path(g,[[285,603],[lerp(225,315,q),lerp(560,646,q)],[lerp(370,460,q),lerp(560,646,q)],[430,603]],p.paper,p.ink,3);path(g,[[285,696],[lerp(238,310,q),lerp(740,665,q)],[lerp(383,455,q),lerp(740,665,q)],[430,696]],p.hero,p.ink,3);break;
 }
 case 'sprinkle':item(355,652,1.3,s.object==='seed'?'soil':'cake');item(290,400,.7,'flour',-.7);for(let i=0;i<30;i++){let v=(a*3+hash(i))%1;let xx=305+(hash(i*3)-.5)*100;oval(g,xx+v*60,440+v*210,3,5,i%2?p.accent:p.object,null)}break;
 case 'align':
  for(let i=0;i<3;i++){item(lerp(260+hash(i)*170,355,a),475+i*83,.6,s.object,lerp((hash(i)-.5)*.7,0,a))}g.setLineDash([6,6]);line(g,[[355,350],[355,720]],p.accent,2);g.setLineDash([]);break;
 case 'balance':{
  let angle=Math.sin(a*14)*(1-a)*.3;transformed(g,355,600,1,angle,()=>{line(g,[[-90,50],[90,50]],p.ink,8);item(0,0,1.15)});path(g,[[355,654],[329,717],[383,717]],p.accent,p.ink,3);break;
 }
 case 'tie':item(365,615,1.5);line(g,[[300,lerp(510,610,a)],[417,lerp(710,610,a)]],p.accent,6);if(done){g.beginPath();g.ellipse(350,597,20,12,-.5,0,6.28);g.ellipse(382,597,20,12,.5,0,6.28);g.strokeStyle=p.accent;g.lineWidth=6;g.stroke();line(g,[[365,608],[345,648]],p.accent,5);line(g,[[365,608],[385,644]],p.accent,5)}break;
 case 'carry':item(hx+70,551,.8);rr(g,390,570,90,147,4,null,p.ink,4);text(g,'GOAL',434,548,23,p.ink,null,0,'Arial');break;
 case 'plant':
  item(350,670,1.4,'pot');item(350,lerp(390,628,a),.7,'seed');if(done){line(g,[[350,635],[350,lerp(635,525,smooth((u-.76)/.15))]],p.ink,5);oval(g,333,552,23,10,p.ground,p.ink,2);oval(g,369,569,23,10,p.ground,p.ink,2)}break;
 case 'bend':
  transformed(g,355,690,1,a<.6?a*.5:.3,()=>item(0,-75,1.7,'stake',Math.PI/2));if(a>.6){item(395+120*(a-.6),590+150*(a-.6),.8,'stick',a*5);bits(355,600,8,p.object,40);text(g,'SNAP.',350,380,29,p.ink,null,0,'serif')}break;
 default:item(350,630,1.3);
 }
 // Put the performer in front of scenery but behind the action cue.
 let target=null;
 if(s.action==='scoop')target=[lerp(270,350,a)-48,lerp(490,605,a)-Math.sin(a*Math.PI)*50];
 if(s.action==='pour')target=[304,456];
 if(s.action==='stir')target=[355+Math.sin(Math.sin(a*18)*.55)*92,604-Math.cos(Math.sin(a*18)*.55)*92];
 if(s.action==='roll')target=[355+Math.sin(a*12)*42-70,633];
 if(s.action==='cut')target=[355,lerp(396,644,clamp(a*1.4))-115];
 if(s.action==='fan')target=[258,576];
 if(s.action==='carry')target=[hx+65,590];
 if(m!=='blueprint')hero(g,m,hx,hy,hs,{arm,lean,jump,target:target?[(target[0]-hx)/hs,(target[1]-hy+jump)/hs]:null,face:!s.success&&done?'shock':'happy'},film.hero);
 if(done&&s.success){for(let i=0;i<5;i++){let an=i*1.25;star(g,358+Math.cos(an)*95,535+Math.sin(an)*90,8+hash(i)*5,p.accent)}}
 g.restore();
 if(m==='blueprint'){
  rr(g,35,292,127,163,2,p.paper,p.ink,2);hero(g,m,98,425,.62,{arm:.4+arm},film.hero);
  line(g,[[188,305],[465,305]],p.ink,1);line(g,[[188,299],[188,311]],p.ink,1);line(g,[[465,299],[465,311]],p.ink,1);text(g,'DETAIL A / 2 : 1',327,287,13,p.ink,null,0,'monospace');
  g.setLineDash([5,5]);line(g,[[269,332],[269,730]],p.ink,1);g.setLineDash([]);
 }
 finish(g,m,createCanvas,cache);
 materialPass(g,m,cache);
 if(!options.noHud){
  fuse(g,options.timerProgress??u,dur*s.bpm/60,options.timerTime??lt);command(g,s.command,lt,[.73,.60,.45][s.round]);
 }
}
