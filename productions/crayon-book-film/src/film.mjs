import fs from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {Wax,paperTexture,composite,W,H,C,clamp,ease} from './material.mjs';
import {person,animal,barn,tree,sun,grass,hill,fence,item,bucket} from './drawings.mjs';
GlobalFonts.registerFromPath(new URL('../assets/fonts/Gaegu-Bold.ttf',import.meta.url).pathname,'Gaegu');
GlobalFonts.registerFromPath(new URL('../assets/fonts/PatrickHand-Regular.ttf',import.meta.url).pathname,'Patrick Hand');
const root=new URL('../',import.meta.url);
export function loadTimeline(){let p=new URL('content/timeline.json',root);if(fs.existsSync(p))return JSON.parse(fs.readFileSync(p));let cursor=0;return {fps:24,total_frames:3936,scenes:JSON.parse(fs.readFileSync(new URL('content/story.json',root))).map(s=>{let start=cursor;cursor+=s.min*24;return {...s,start,end:cursor,lines:[]}})}}
export class Film{
 constructor(){this.timeline=loadTimeline();this.cues=JSON.parse(fs.readFileSync(new URL('content/action-cues.json',root)));this.wax=new Wax();this.paper=paperTexture();this.canvas=createCanvas(W,H);this.book=createCanvas(W,H);}
 render(frame){
 const tl=this.timeline,sc=tl.scenes.find(s=>frame>=s.start&&frame<s.end)||tl.scenes.at(-1),local=frame-sc.start,t=local/24,p=local/(sc.end-sc.start),dur=(sc.end-sc.start)/24,w=this.wax,c=w.ctx;
 const active=sc.lines.find(l=>frame>=l.start&&frame<l.end),speaking=active?.speaker;
 const talk=who=>speaking===who?([.2,.9,.55,0][Math.floor(frame/2)%4]):0;
 const blink=(Math.floor(frame/2)%83)>79;
 w.begin(frame);c.save();
 // The camera is sampled at 24 fps while every pose and stroke is held for two.
 let zoom=1+.035*ease(p);let cx=640,cy=360;c.translate(cx,cy);c.scale(zoom,zoom);c.translate(-cx,-cy);
 const pose={closed:blink};const leo=(x,y,s=1,o={})=>person(w,'leo',x,y,s,{...pose,talk:talk('leo'),...o});const jojo=(x,y,s=1,o={})=>person(w,'jojo',x,y,s,{...pose,talk:talk('jojo'),...o});
 const title=txt=>w.text(txt,70,100,54,C.ink,'Gaegu');
 const field=()=>{hill(w);grass(w,620)};
 const vocabulary=(arr,y=245,spacing=165,scale=.8,labels=true,labelY=85)=>{let start=640-(arr.length-1)*spacing/2;arr.forEach((a,i)=>{let appear=ease((t-.5-i*.6)/.4);if(appear>0){c.save();c.translate(start+i*spacing,y+(1-appear)*18);c.scale(appear,appear);item(w,a,0,0,scale);if(labels)w.text(a,0,labelY,30,C.ink,'Patrick Hand','center',clamp((t-.8-i*.6)/.5));c.restore();}})};
 const floor=()=>{w.line([[40,604],[320,597],[690,606],[1230,600]],C.brown,3,.7);for(let i=0;i<10;i++)w.line([[i*143,614],[i*143+80,616]],C.brown,1.5,.6)};
 if(sc.scene==='farm'){
  w.strokeBudget=t<3.4?ease(t/3.4)*2700:Infinity;
  barn(w,610,626,1);tree(w,195,624,.78);sun(w,1050,139,52);grass(w,650);leo(941,625,1.4,{hat:true,arm:'wave'});jojo(1120,627,1.25,{look:-1});
  w.strokeBudget=Infinity;w.text('Leo the Farmer',65,112,67,C.ink,'Gaegu','left',ease(t/1.4));
 }
 if(sc.scene==='bedroom'){
  title('A sleepy start');floor();w.rect(87,156,250,227,C.brown,6);w.rect(101,168,220,198,C.blue,7);w.line([[210,170],[210,363]],C.ink,4);w.line([[103,267],[319,267]],C.ink,4);sun(w,260,216,27);
  w.rect(430,466,440,116,C.brown,8);w.rect(411,361,22,240,C.brown,11);w.ellipse(422,356,18,18,C.brown,12);w.rect(847,436,21,168,C.brown,4);
  let rise=ease((t-2.7)/2);jojo(635,510-rise*53,1.8,{closed:t<3||blink,tilt:(1-rise)*-.12,look:1});
  w.shape([[441,438],[800,449],[849,499],[844,565],[441,559]],C.green,24);for(let x=460;x<835;x+=37)w.line([[x,448],[x-9,556]],C.yellow,4,.63);
  leo(1080,604,2.1,{arm:'wave',hat:true,look:-1});
 }
 if(sc.scene==='wardrobe'){
  title('What should Jojo wear?');floor();
  const choices=['raincoat','swimsuit','pajamas','slippers'];vocabulary(choices,238,195,.92);
  let sel=ease((t-5)/.7);if(sel){c.save();c.globalAlpha=sel;item(w,'shirt',430,464,1);item(w,'overalls',631,464,1);item(w,'boots',830,464,.92);w.text('shirt',430,558,32,C.ink,'Patrick Hand','center');w.text('overalls',631,558,32,C.ink,'Patrick Hand','center');w.text('boots',830,558,32,C.ink,'Patrick Hand','center');for(let x of [430,631,830])w.line([[x-12,586],[x-3,597],[x+21,574]],C.green,4,.9);c.restore()}
  jojo(161,614,1.75,{arm:t>6?'wave':'down',look:1});leo(1118,614,1.75,{hat:true,look:-1});
 }
 if(sc.scene==='walk'){
  field();barn(w,235,535,.65);tree(w,1060,574,.85);sun(w,923,130,45);w.shape([[-40,650],[410,505],[600,524],[258,720]],C.yellow,6,false);
  let walk=Math.floor(frame/2)/4;leo(557+ease(p)*100,600,1.8,{walk,hat:true});jojo(840+ease(p)*75,620,1.7,{walk:walk+Math.PI});bucket(w,745+ease(p)*85,545,1.05);bucket(w,951+ease(p)*60,569,1);
 }
 if(sc.scene==='animals'){
  title('Who is hungry?');fence(w,77,636,1130);grass(w,650);
  let arr=['cow','horse','pig','rabbit','chicken','goat','duck'];let labels=['cows','horses','pigs','rabbits','chickens','goats','ducks'];
  arr.forEach((a,i)=>{let x=175+(i%4)*303,y=i<4?335:500;if(i>=4)x=335+(i-4)*303;let enter=ease((t-.3-i*.7)/.4);c.save();c.translate(x,y+(1-enter)*20);c.scale(enter,enter);animal(w,a,0,0,1.15);w.text(labels[i],0,52,33,C.ink,'Patrick Hand','center');c.restore()});
 }
 if(sc.scene==='feeding'){
  title('Breakfast for everyone');field();barn(w,1080,530,.53);fence(w,705,560,500);
  animal(w,'cow',230,555,1.55);animal(w,'horse',119,373,1.1);animal(w,'pig',1001,575,1.12,{flip:true});animal(w,'goat',1114,415,1.03,{flip:true});animal(w,'rabbit',936,619,.9,{flip:true});animal(w,'chicken',729,612,1.06);animal(w,'duck',811,611,.95);
  leo(446,587,1.65,{hat:true,arm:'hold'});jojo(685,580,1.6,{arm:'hold',tilt:Math.sin(Math.floor(frame/2)/10)*.025});
  for(let i=0;i<8;i++)w.line([[330+i*6,490],[366+i*5,453]],C.yellow,4,.8,i);
  bucket(w,704,514,.9);for(let i=0;i<18;i++){let q=((Math.floor(frame/2)/17+i*.17)%1);w.ellipse(719+q*75+i%3*9,530+q*q*68,2.5,2,C.yellow,i,false)}
 }
 if(sc.scene==='milk'){
  title('Little by little');grass(w,632);fence(w,60,574,1150);animal(w,'cow',560,568,2.5,{flip:true});jojo(700,606,1.8,{arm:'milk',pump:Math.sin(Math.floor(frame/2)/4)*3,sit:true,tilt:-.07});w.rect(642,573,122,16,C.brown,9);w.line([[652,586],[645,623]],C.brown,8);w.line([[747,586],[755,623]],C.brown,8);bucket(w,599,602,1.65,true);leo(1035,610,1.85,{hat:true,look:-1});
  for(let i=0;i<3;i++){let q=(t*1.8+i*.34)%1;w.ellipse(595+i*6,510+q*49,2,4,C.white,3,false)}
 }
 if(sc.scene==='vegetables'){
  title('Down in the vegetable patch');w.shape([[40,476],[1260,453],[1280,643],[0,652]],C.brown,51,false);
  vocabulary(['pumpkin','sweet potato','carrot'],300,310,1.5,true,125);
  for(let x=190;x<1190;x+=80){item(w,'carrot',x,520,.35);}
  leo(155,622,1.55,{hat:true,look:1});jojo(1110,625,1.55,{look:-1,arm:'wave'});
 }
 if(sc.scene==='pull'){
  title('One more tug...');w.shape([[-10,567],[1280,538],[1300,650],[-10,670]],C.brown,42,false);grass(w,630);
  const cue=this.cues.pull;let pop=ease((local-cue.carrot_pop_frame+cue.carrot_reveal_lead)/cue.carrot_reveal_frames),lift=ease((local-cue.pumpkin_lift_start_frame)/cue.pumpkin_lift_frames),pumpkinY=582-lift*99,lean=Math.sin(Math.floor(frame/2)/5)*.035*(1-pop);jojo(434-pop*30,615-pop*19,2.3,{arm:'pull',tilt:-.13-lean-pop*.1,talk:pop>.7?.6:0});item(w,'carrot',491-pop*45,590-pop*133,1.2);leo(881,614,2.15,{hat:true,arm:'hold',handY:(pumpkinY-8-614)/2.15});item(w,'pumpkin',874,pumpkinY,1.18);
  for(let i=0;i<8;i++){let a=i/8*6.28,r=25+pop*95;if(pop>0&&pop<1)w.ellipse(485+Math.cos(a)*r,571+Math.sin(a)*r-pop*20,4,3,C.brown,i,false)}
  if(pop>.7)w.text('pop!',525,393,49,C.red,'Gaegu','left',ease((pop-.7)/.3));
 }
 if(sc.scene==='orchard'){
  title('Up in the orchard');field();tree(w,238,609,1.2);tree(w,1050,616,1.15,'pear');vocabulary(['grapes','apple','pear'],210,192,1.02);leo(504,619,1.5,{hat:true});jojo(760,623,1.5,{look:1,arm:'wave'});
 }
 if(sc.scene==='pick'){
  field();tree(w,359,620,1.55);tree(w,1120,617,.9,'pear');
  w.line([[480,625],[385,352]],C.brown,10,.95);w.line([[560,627],[467,353]],C.brown,10,.95);for(let k=0;k<7;k++)w.line([[480-k*13,611-k*36],[554-k*13,611-k*36]],C.yellow,7,.9);
  leo(459,460,1.6,{hat:true,arm:'reach'});jojo(738,624,1.9,{arm:'hold',look:-1});let q=(p*3)%1;item(w,'apple',478+q*247,318+q*q*151,.62);for(let i=0;i<3;i++)item(w,'apple',716+i*20,492-i%2*18,.5);item(w,'basket',956,598,1.3);
 }
 if(sc.scene==='carry'){
  title('How can we carry it?');grass(w,632);jojo(300,622,2.05,{arm:'hold',talk:talk('jojo'),tilt:Math.sin(Math.floor(frame/2)/5)*.025});for(let i=0;i<7;i++)item(w,i%3?'apple':'pear',273+(i%3)*25,493-Math.floor(i/3)*27,.55);
  let options=['plate','bag','trash can'];options.forEach((a,i)=>{item(w,a,601+i*213,257,.95);w.text(a,601+i*213,346,33,C.ink,'Patrick Hand','center')});
  if(t>4){item(w,'basket',760,492,1.35);item(w,'box',1039,492,1.35);w.text('basket',760,584,35,C.ink,'Patrick Hand','center');w.text('box',1039,584,35,C.ink,'Patrick Hand','center');}
 }
 if(sc.scene==='pack'){
  field();barn(w,1071,527,.55);tree(w,164,568,.65);let step=Math.floor(frame/2)/5,dx=ease(p)*120;leo(403+dx,615,1.9,{arm:'hold',hat:true,walk:step});jojo(821+dx,617,1.8,{arm:'hold',walk:step+Math.PI});
  for(let i=0;i<4;i++)item(w,'apple',373+dx+i*22,486-(i%2)*14,.51);item(w,'box',405+dx,510,.98);for(let i=0;i<4;i++)item(w,'pear',798+dx+i*18,500-(i%2)*12,.48);item(w,'basket',825+dx,522,.92);
 }
 if(sc.scene==='nap'){
  field();tree(w,674,620,1.38);sun(w,1081,149,43);item(w,'box',253,603,1.1);for(let i=0;i<4;i++)item(w,'apple',229+i*22,557,.5);item(w,'basket',1028,608,1.1);for(let i=0;i<3;i++)item(w,'pear',1010+i*20,573,.5);
  let settle=ease((p-.28)/.23);jojo(748,622,1.6,{closed:true,tilt:.16,arm:'hold',sit:true});leo(506,619,1.9-settle*.3,{hat:p<.56,closed:settle>.8,tilt:-settle*.15,arm:'hold',sit:settle>.5});if(settle>.8){w.text('z',854,331-Math.sin(t)*6,34,C.purple,'Gaegu');w.text('z',880,297-Math.sin(t)*6,24,C.purple,'Gaegu');}
 }
 if(sc.scene==='end'){
  title('A good day on the farm');grass(w,628);tree(w,652,632,1.3);leo(494,624,1.65,{closed:true,tilt:-.16,arm:'hold',sit:true});jojo(757,625,1.6,{closed:true,tilt:.16,arm:'hold',sit:true});item(w,'basket',1036,604,1.15);item(w,'box',240,608,1.16);for(let i=0;i<4;i++){item(w,'apple',214+i*20,562,.52);item(w,'pear',1014+i*16,566,.49)}
 }
 c.restore();
 this.caption(sc,frame);
 composite(w,this.paper,this.canvas);
 if(sc.scene==='animals')this.wash(clamp(t/3.5));
 if(sc.scene==='end'&&p>.52)this.pageTurn(clamp((p-.52)/.48),frame);
 return this.canvas;
 }
 caption(sc,frame){
 let line=sc.lines.find(l=>frame>=l.start&&frame<l.end);if(!line)return;let chunks=line.text.match(/[^.!?]+[.!?]*\s*/g)||[line.text];let total=chunks.reduce((a,s)=>a+s.length,0),elapsed=(frame-line.start)/(line.end-line.start)*total,acc=0,selected=chunks.at(-1).trim(),start=line.start;
 for(let chunk of chunks){if(elapsed<acc+chunk.length){selected=chunk.trim();start=line.start+acc/total*(line.end-line.start);break}acc+=chunk.length;}
 let rows=[];while(selected.length>62){let i=selected.lastIndexOf(' ',62);rows.push(selected.slice(0,i));selected=selected.slice(i+1);}rows.push(selected);
 const w=this.wax,c=w.ctx;let y=rows.length>1?651:674;
 for(let i=0;i<rows.length;i++){c.save();c.font='35px "Patrick Hand"';let wid=c.measureText(rows[i]).width;c.globalCompositeOperation='destination-out';c.beginPath();c.ellipse(640,y-10,wid/2+42,30,0,0,Math.PI*2);c.fill();c.restore();w.text(rows[i],640,y,35,C.ink,'Patrick Hand','center',clamp((frame-start)/9));y+=39;}
 }
 wash(progress){
 // One wet brush sweeps along three bands; white wax clouds resist the stain.
 const c=this.canvas.getContext('2d'),im=c.getImageData(0,0,W,H),d=im.data,ink=this.wax.ctx.getImageData(0,0,W,H).data;
 for(let y=165;y<750;y++)for(let x=30;x<W-30;x++){let band=Math.floor((y-165)/195),u=clamp(progress*3-band),edge=(band%2?W*(1-u):W*u)+8*Math.sin(y*.081);let reached=band%2?x>edge:x<edge;if(!reached)continue;let j=(y*W+x)*4;if(ink[j+3]>20)continue;let cloud=((x-440)/130)**2+((y-230)/42)**2<1||((x-1480)/150)**2+((y-231)/39)**2<1;if(cloud)continue;let a=.12+.025*Math.sin(y*.12)+.028*Math.sin(x*.039+y*.06);if(Math.abs(x-edge)<10)a+=.08;for(let k=0;k<3;k++)d[j+k]=d[j+k]*(1-a)+[87,142,177][k]*a;}
 c.putImageData(im,0,0);
 }
 makeDesk(){
 const w=new Wax();w.begin(0);w.ctx.fillStyle=C.brown;w.ctx.fillRect(-10,-10,1300,740);
 for(let y=2;y<720;y+=8)w.line([[0,y],[330,y+4],[720,y-2],[1280,y+2]],y%3?C.yellow:C.ink,1.8,.3,y);
 const crayon=(x,y,col,angle)=>{let c=w.ctx;c.save();c.translate(x,y);c.rotate(angle);w.shape([[-67,-12],[58,-12],[78,0],[58,12],[-67,12]],col,8);w.rect(-48,-13,78,26,col,4);w.line([[-38,-12],[-38,12]],C.ink,6,.8);w.line([[23,-12],[23,12]],C.ink,5,.8);w.line([[-27,-6],[-17,5],[-6,-5],[4,6],[15,-6]],C.ink,1.3,.7);c.restore()};
 crayon(166,644,C.blue,-.38);crayon(365,606,C.yellow,.09);crayon(554,652,C.purple,-.23);crayon(750,610,C.ink,.26);crayon(955,648,C.red,-.05);crayon(1130,607,C.rose,.48);
 w.ctx.save();w.ctx.translate(820,100);w.ctx.rotate(-.16);w.shape([[-160,-6],[80,-6],[80,7],[-160,7],[-177,0]],C.brown,11);w.rect(80,-10,49,20,C.blue,7);w.shape([[129,-10],[151,-9],[158,0],[151,10],[129,10]],C.ink,4);w.ctx.restore();
 for(let j of [0,1]){let circle=[];for(let i=0;i<=64;i++){let a=i/64*Math.PI*2;circle.push([198+Math.cos(a)*(49-j*4),85+j*6+Math.sin(a)*(47-j*7)])}w.line(circle,C.blue,2,.7);}w.line([[153,91],[158,147],[199,158],[237,145],[244,89]],C.blue,2,.7);
 let out=createCanvas(W,H);composite(w,this.paper,out);return out;
 }
 pageTurn(p,frame){
 if(!this.desk)this.desk=this.makeDesk();const c=this.book.getContext('2d'),src=this.canvas;
 c.resetTransform();c.globalAlpha=1;c.drawImage(this.desk,0,0);
 const bx=96,by=276,bw=1728,bh=500,spine=960,pw=864;
 c.save();c.shadowColor='#1e1529aa';c.shadowBlur=24;c.shadowOffsetY=14;c.fillStyle=C.ink;c.fillRect(bx-14,by-13,bw+28,bh+29);c.restore();
 c.fillStyle='#a99d83';c.fillRect(bx-3,by+3,bw+6,bh+7);c.drawImage(this.paper.canvas,bx,by,bw,bh);
 // An open spread, with a soft gutter shadow and a real turning right page.
 for(let k=30;k>0;k--){c.fillStyle=`rgba(53,42,38,${.006})`;c.fillRect(spine-k,by,k*2,bh);}
 c.save();c.fillStyle=C.ink;c.textAlign='center';c.font='bold 92px "Gaegu"';c.fillText('The End',1390,495);c.font='38px "Patrick Hand"';c.fillText('A good day on the farm',1390,574);c.font='23px "Patrick Hand"';c.fillText('A crayon retelling · Play with Gyuri',1390,656);c.fillText('Visual study · LemoLab · CC BY 4.0',1390,696);c.restore();
 let zoom=ease(p/.25),dx=spine*zoom,dy=by*zoom,dw=W+(pw-W)*zoom,dh=H+(bh-H)*zoom;
 if(p<.25){c.drawImage(src,dx,dy,dw,dh);}else{
  let turn=ease((p-.25)/.52),angle=Math.PI*turn,cos=Math.cos(angle),sin=Math.sin(angle);
  // Draw strips from hinge to free edge. Lift expands at the free edge;
  // both surfaces carry paper grain, with a travelling self-shadow.
  if(turn<1){for(let i=0;i<200;i++){
   let u=i/200,v=(i+1)/200;
   let x1=spine+pw*cos*u+Math.sin(Math.PI*u)*sin*45,x2=spine+pw*cos*v+Math.sin(Math.PI*v)*sin*45;
   let lift=Math.sin(u*Math.PI/2)*sin*100,y=by-lift,hh=bh+lift*2;
   if(Math.abs(x2-x1)<.15)continue;
   if(cos>=0)c.drawImage(src,u*W,0,W/200,H,Math.min(x1,x2),y,Math.abs(x2-x1)+1,hh);
   else c.drawImage(this.paper.canvas,u*W,0,W/200,H,Math.min(x1,x2),y,Math.abs(x2-x1)+1,hh);
   c.fillStyle=`rgba(56,42,35,${Math.max(0,sin*(.22-.15*u))})`;c.fillRect(Math.min(x1,x2),y,Math.abs(x2-x1)+1,hh);
  }}else c.drawImage(this.paper.canvas,bx,by,pw,bh);
 }
 this.canvas.getContext('2d').drawImage(this.book,0,0);
 }
}
