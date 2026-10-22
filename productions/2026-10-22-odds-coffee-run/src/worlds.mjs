import {INK,WHITE,clamp,ease} from './ink.mjs';
import {character} from './cast.mjs';
export const palettes={home:['#a7c3b1','#77927f','#bd9e76'],odds:['#ff92c6','#ad2b8b','#52d5da'],parlay:['#ffad57','#267f83','#ffdb87'],pool:['#b9e2d6','#6bada2','#ed8e74'],attention:['#472a75','#30204c','#e5c945'],stadium:['#7f96b7','#455c78','#be454c'],legal:['#efe2c7','#b69a75','#8b6546'],underground:['#7a344a','#39233a','#a96a7e']};
export function football(g,x,y,r=40){g.ellipse(x,y,r,r,WHITE,INK,5);g.poly(Array.from({length:5},(_,i)=>[x+Math.cos(i*Math.PI*2/5-Math.PI/2)*r*.43,y+Math.sin(i*Math.PI*2/5-Math.PI/2)*r*.43]),INK,null,0);for(let i=0;i<5;i++){let a=i*1.256-1.57;g.line([[x+Math.cos(a)*r*.35,y+Math.sin(a)*r*.35],[x+Math.cos(a)*r*.79,y+Math.sin(a)*r*.79]],INK,4)}}
function plant(g,x,y){g.poly([[x-27,y],[x+28,y],[x+20,y+65],[x-20,y+65]],'#c77d4d',INK,4);for(let i=-2;i<=2;i++)g.curve([[x,y],[x-15+i*10,y-30],[x+i*24,y-106+Math.abs(i)*17],[x+i*30,y-90],[x+i*18,y-38],[x+4,y-25],[x,y]],'#6da96a',INK,3,true)}
function counter(g,x,y,w,color='#a48564'){g.rect(x,y,w,210,color,INK,5,8);g.rect(x-12,y-18,w+24,28,'#ddd2b7',INK,5,5);for(let xx=x+15;xx<x+w-80;xx+=140)g.rect(xx,y+27,117,151,null,'#665747',4,5)}
function coffee(g,x,y,s=1){g.push(x,y,s);g.rect(-95,-200,190,210,'#aeb4be',INK,5,16);g.poly([[60,-191],[90,-180],[90,7],[54,7]],'#9096a0',null,0);g.rect(-69,-175,106,97,'#1c302b',INK,5,12);g.text('NO CREDIT',-14,-141,19,'#d86f62',{font:'VT323'});g.curve([[-46,-108],[-32,-117],[-24,-117],[-17,-108]],null,'#90b27e',3);g.curve([[-5,-108],[8,-117],[16,-117],[23,-108]],null,'#90b27e',3);for(let xx of [53,76])g.ellipse(xx,-142,7,7,xx===53?'#e97050':'#efc447',INK,2);g.rect(-45,-68,62,12,'#535763',INK,4,3);g.rect(-60,-51,93,59,'#d4e7eb',INK,5,9);g.ellipse(-12,-49,45,7,'#76482f',INK,3);g.line([[35,-41],[50,-32],[49,-10]],INK,6);g.pop()}
export function flag(g,id,x,y,w=120){let h=w*(id==='US'?10/19:id==='UK'?.5:2/3);g.push(x,y);const star=(x,y,r,c)=>g.star(x,y,r,c,5,null,0);g.rect(0,0,w,h,id==='US'||id==='UK'?'#244271':'#d84846',INK,3);
 if(id==='US'){for(let i=0;i<13;i++)g.rect(0,i*h/13,w,h/13,i%2?WHITE:'#d54d4e',null,0);g.rect(0,0,w*.42,h*.54,'#294573',null,0);for(let r=0;r<9;r++)for(let c=0;c<(r%2?5:6);c++){let xx=w*.035+c*w*.069+(r%2?w*.0345:0),yy=h*.032+r*h*.059;star(xx,yy,w*.013,WHITE)}}
 if(id==='UK'){g.line([[0,0],[w,h]],WHITE,14);g.line([[0,h],[w,0]],WHITE,14);g.line([[0,0],[w,h]],'#d5454b',5);g.line([[0,h],[w,0]],'#d5454b',5);g.rect(w*.4,0,w*.2,h,WHITE,null,0);g.rect(0,h*.35,w,h*.3,WHITE,null,0);g.rect(w*.44,0,w*.12,h,'#d5454b',null,0);g.rect(0,h*.41,w,h*.18,'#d5454b',null,0)}
 if(id==='TR'){g.ellipse(w*.4,h*.5,h*.29,h*.29,WHITE,null,0);g.ellipse(w*.45,h*.48,h*.24,h*.24,'#d84846',null,0);star(w*.64,h*.49,h*.14,WHITE)}
 if(id==='CN'){star(w*.2,h*.28,h*.16,'#ffdf52');for(let [xx,yy] of [[.34,.12],[.43,.25],[.43,.43],[.34,.56]])star(w*xx,h*yy,h*.055,'#ffdf52')}
 if(id==='SG'){g.rect(0,h/2,w,h/2,WHITE,null,0);g.ellipse(w*.22,h*.25,h*.19,h*.19,WHITE,null,0);g.ellipse(w*.25,h*.22,h*.16,h*.16,'#d84846',null,0);for(let i=0;i<5;i++){let a=i*1.256-1.57;star(w*.39+Math.cos(a)*h*.12,h*.25+Math.sin(a)*h*.12,h*.035,WHITE)}}
 if(id==='HK'){for(let i=0;i<5;i++){g.push(w*.5,h*.5,1,1,i*1.256);g.curve([[0,0],[-15,-4],[-17,-29],[1,-27],[17,-25],[14,-8],[0,0]],WHITE,null,0,true);star(-2,-17,2.7,'#d84846');g.pop()}}
 g.pop()}
export function register(g,x,y,t,show=0){g.push(x,y);g.ellipse(0,113,209,24,'#742c68',null,0);g.rect(-176,-180,352,265,'#65d5d2',INK,7,28);g.poly([[106,-173],[170,-161],[170,76],[108,81]],'#34a5ad',null,0);g.rect(-130,-146,260,96,'#243a41',INK,6,10);g.text(show===2?'$10 KEPT':'1.90 / 1.90',0,-97,37,'#e9df85',{font:'VT323'});
 for(let i=-2;i<=2;i++)g.rect(i*49-15,-17,34,24,'#f0e2bc',INK,4,5);
 let open=Math.max(0,Math.sin(t*1.6))*(show>=1?25:5);g.rect(-155,35,310,57+open,'#f8ce77',INK,6,8);for(let i=0;i<7;i++)g.poly([[-137+i*43,37],[-117+i*43,37],[-125+i*43,59]],WHITE,INK,3);g.ellipse(-49,-210,31,31,WHITE,INK,5);g.ellipse(48,-210,31,31,WHITE,INK,5);g.ellipse(-42,-210,5,6,INK,null,0);g.ellipse(54,-210,5,6,INK,null,0);
 if(show===2){g.ellipse(190,-8,42,42,'#edc451',INK,5);g.text('$10',190,-5,25,INK)}g.pop()}
function horse(g,x,y,s,t){g.push(x,y,s);g.ellipse(0,0,76,40,'#d4b08b',INK,5);g.curve([[39,-15],[47,-78],[66,-105],[96,-94],[111,-79],[112,-54],[81,-48],[76,-13],[69,11],[45,21]],'#d4b08b',INK,5,true);g.poly([[52,-68],[61,-100],[49,-105],[41,-76]],'#73504a',INK,3);g.poly([[79,-98],[85,-122],[96,-94]],'#d4b08b',INK,4);g.ellipse(91,-77,8,10,WHITE,INK,3);g.ellipse(95,-76,2.5,3,INK,null,0);for(let i of [-1,1])for(let j of [-1,1]){let xx=i*44+j*7,phase=t*7+i+j;g.line([[xx,23],[xx+Math.sin(phase)*15,58],[xx+Math.sin(phase)*30,84]],INK,11)}g.curve([[-67,-7],[-122,-39],[-114,20],[-99,26]],null,'#73504a',12);g.pop()}
export function portrait(g,who,x,y,s=1){g.push(x,y,s);let wool=who==='woolmer';g.rect(-125,-178,250,350,'#eee0c6',INK,6,8);g.rect(-108,-160,216,250,wool?'#b6c2aa':'#8d9eaa',INK,3,3);
 g.curve([[-103,85],[-104,8],[-61,-4],[-33,-12],[0,4],[35,-11],[63,-4],[105,10],[104,53],[105,85]],wool?'#292b36':WHITE,INK,5,true);
 g.rect(-22,-25,44,41,'#dcab89',INK,4,6);
 if(wool){
  g.poly([[-38,-5],[-4,18],[34,-7],[20,83],[-20,83]],WHITE,INK,3);g.poly([[-8,18],[7,18],[13,82],[-14,82]],'#5b7a9a',INK,3);g.poly([[-39,-7],[-8,39],[-48,20],[-40,56],[-77,19]],'#3e424c',INK,3);g.poly([[34,-9],[7,39],[45,19],[43,55],[74,18]],'#3e424c',INK,3);
  g.curve([[-64,-114],[-40,-151],[41,-149],[65,-109],[78,-62],[66,-26],[38,-9],[13,7],[-35,5],[-57,-17],[-74,-40],[-78,-84],[-64,-114]],'#e6bda3',INK,5,true);
  g.poly([[48,-112],[66,-86],[63,-39],[41,-17],[5,-9],[-34,-20],[-47,-39],[-13,-31],[24,-39],[54,-58]],'#cb9c83',null,0);
  g.curve([[-67,-89],[-81,-131],[-49,-156],[-13,-157],[23,-171],[67,-144],[68,-112],[60,-105],[45,-121],[21,-128],[-12,-132],[-51,-125],[-67,-89]],'#d4d5d0',INK,4,true);
  for(let i=0;i<7;i++)g.curve([[-54+i*16,-121],[-53+i*13,-136],[-45+i*12,-147],[-35+i*12,-146]],null,'#969c99',2);
  for(let xx of [-30,30]){g.ellipse(xx,-81,18,11,WHITE,INK,3);g.ellipse(xx+1,-79,3,5,INK,null,0);g.curve([[xx-17,-101],[xx-4,-107],[xx+8,-104],[xx+17,-99]],null,'#979a95',5);g.ellipse(xx,-82,27,20,null,'#4f514b',3)}g.line([[-3,-85],[5,-85]],'#4f514b',3);g.line([[-57,-83],[-72,-87]],'#4f514b',3);
  g.curve([[-1,-83],[-9,-67],[-10,-49],[-3,-47],[12,-44],[20,-53],[14,-59]],null,'#a47b62',3);g.curve([[-25,-29],[-11,-37],[15,-38],[28,-29]],null,INK,4);g.line([[-19,-25],[18,-25]],WHITE,4);g.curve([[-34,-16],[-8,-5],[13,-7],[33,-16]],null,'#b48871',2);
 }else{
  g.poly([[-40,-4],[-5,39],[39,-5],[27,-10],[-5,21],[-27,-10]],'#9a3042',INK,3);g.line([[-31,-6],[-5,28],[29,-6]],'#e1b454',4);
  g.curve([[-58,-118],[-37,-145],[38,-145],[59,-113],[66,-82],[61,-45],[47,-24],[32,-7],[-31,-7],[-47,-23],[-63,-41],[-67,-83],[-58,-118]],'#d9a27e',INK,5,true);
  g.poly([[44,-113],[60,-85],[55,-49],[33,-29],[8,-24],[-22,-28],[-33,-38],[-7,-33],[35,-45],[51,-69]],'#bd8765',null,0);
  g.poly([[-60,-103],[-66,-126],[-56,-147],[-48,-142],[-38,-157],[-30,-148],[-18,-160],[-11,-151],[0,-162],[10,-151],[19,-160],[28,-149],[40,-157],[46,-143],[55,-146],[65,-128],[62,-101],[49,-118],[20,-125],[-16,-126],[-45,-117]],'#26272c',INK,4);
  for(let xx of [-27,28]){g.ellipse(xx,-81,18,11,WHITE,INK,3);g.ellipse(xx+2,-81,4,5,'#394746',null,0);g.line([[xx-17,-101],[xx+14,-98]],'#36302c',6)}
  g.curve([[0,-83],[-6,-67],[-11,-54],[0,-50],[10,-50],[16,-57],[12,-60]],null,'#8e614b',3);g.curve([[-28,-34],[-9,-42],[15,-41],[30,-34]],null,INK,3);g.line([[-20,-33],[20,-33]],WHITE,5);g.line([[-17,-18],[18,-18]],'#a47258',2);g.text('USC',0,62,34,'#a42f43',{font:'Bungee'});
 }
 g.text(wool?'BOB WOOLMER':'OWEN HANSON',0,117,27,INK,{font:'VT323'});g.text(wool?'Cricket coach':'2017 sentencing',0,145,20,'#604b4d',{font:'VT323'});g.pop()}
export function brand(g,who,x,y,s=1){g.push(x,y,s);if(who==='fanduel'){g.poly([[-126,-45],[-68,-45],[-68,-1],[-96,27],[-126,-1]],'#168fda',INK,4);g.poly([[-115,-31],[-80,-31],[-80,-19],[-103,-19],[-103,-9],[-85,-9],[-97,5],[-114,-9]],WHITE,null,0);g.text('FANDUEL',35,-4,42,'#168fda',{font:'Baloo'})}
 else if(who==='draftkings'){g.poly([[-144,-42],[-127,-18],[-114,-44],[-98,-18],[-78,-42],[-86,2],[-135,2]],'#f8872f',INK,4);g.text('DRAFT',22,-15,39,'#eb8428',{font:'Bungee'});g.text('KINGS',22,26,39,'#55a540',{font:'Bungee'})}
 else if(who==='hkjc'){g.ellipse(-75,0,42,42,null,'#8d6d25',4);g.curve([[-96,22],[-60,7],[-87,-2],[-53,-27],[-52,-6],[-34,-9],[-49,10]],null,'#8d6d25',8);g.text('HKJC',35,-8,35,'#8d6d25',{font:'Bungee'});g.text('JOCKEY CLUB',35,26,21,'#8d6d25',{font:'VT323'})}
 else if(who==='singapore'){g.ellipse(-89,-1,27,27,null,'#387db6',7);g.line([[-114,-2],[-67,-2]],'#387db6',6);g.text('SINGAPORE',38,-15,27,'#3579b5',{font:'Baloo'});g.text('POOLS',38,18,32,'#e36946',{font:'Baloo'})}
 g.pop()}
export function background(g,world,t){let p=palettes[world]||palettes.home;g.rect(-1000,-1000,4000,2500,p[0],null,0);g.rect(-1000,820,4000,1000,p[1],null,0);g.line([[-200,820],[2200,820]],INK,5);
 if(world==='home'){
  for(let x=0;x<2000;x+=130)g.line([[x,0],[x,818]],'#98b6a5',2);
  counter(g,-35,635,620);coffee(g,180,617,1.25);plant(g,493,551);
  g.rect(622,211,530,364,'#2f4c40',INK,6,13);g.rect(610,574,552,17,'#bb9261',INK,4,3);g.text('COFFEE > CERTAINTY',887,271,33,'#e0e4ca',{font:'VT323'});g.text('P(win) IS NOT A PLAN',887,329,30,'#c8d6b6',{font:'VT323'});g.text('PORTAL Mk. 7     DO NOT LICK',887,523,23,'#dfbf67',{font:'VT323'});g.curve([[759,431],[695,347],[819,348],[787,430],[759,492],[722,406],[772,402]],null,'#91aa92',3);
  g.ellipse(1308,149,62,62,WHITE,INK,5);for(let i=0;i<12;i++){let a=i*Math.PI/6;g.line([[1308+Math.cos(a)*48,149+Math.sin(a)*48],[1308+Math.cos(a)*53,149+Math.sin(a)*53]],INK,3)}g.line([[1308,149],[1303,111]],INK,4);g.line([[1308,149],[1344,159]],INK,3);
  for(let y of [340,550]){g.rect(1515,y,335,20,'#bd9762',INK,4,4);for(let i=0;i<5;i++){let col=['#e96c55','#5fa7c7','#af79c2','#ccca62','#e79d55'][i];if(y===550)g.rect(1540+i*52,y-90,32,90,col,INK,3,2);else{g.poly([[1554+i*59,y-107],[1566+i*59,y-107],[1567+i*59,y-62],[1584+i*59,y-17],[1534+i*59,y-17],[1553+i*59,y-62]],'#e5eee6',INK,3);g.poly([[1544+i*59,y-38],[1576+i*59,y-38],[1580+i*59,y-20],[1539+i*59,y-20]],col,null,0)}}}
  for(let y=870;y<1080;y+=65)g.line([[-300,y],[2400,y]],'#657f71',2);
 }else if(world==='legal'){
  for(let x=0;x<2000;x+=80)g.line([[x,0],[x,820]],'#e4d6b9',2);counter(g,1000,619,750,'#ae8151');g.rect(1130,151,540,345,'#343b33',INK,5,10);g.text('LICENSE DESK',1400,213,42,'#e9dfc1',{font:'VT323'});g.text('LOCAL RULES APPLY',1400,272,31,'#e9dfc1',{font:'VT323'});g.text('PLEASE TAKE A NUMBER',1400,395,27,'#e9dfc1',{font:'VT323'});plant(g,1733,748);plant(g,140,740);g.ellipse(1520,494,55,62,'#edc19c',INK,5);g.curve([[1464,491],[1453,407],[1559,408],[1578,482]],'#78513e',INK,5,true);g.ellipse(1511,421,31,25,'#78513e',INK,4);g.rect(1457,541,128,76,'#4f8266',INK,5,15);g.rect(1485,551,70,64,'#edeee1',INK,3,7);g.curve([[1492,505],[1512,518],[1531,517],[1543,505]],null,INK,4);for(let x of [1210,1730]){g.line([[x,0],[x,160]],INK,3);g.curve([[x-58,190],[x-58,125],[x+58,125],[x+58,190]],'#426c54',INK,4,true)}
 }else if(world==='odds'){
  g.rect(-10,220,1940,330,'#ffacd8',null,0);for(let i=0;i<10;i++){let x=i*218-30,h=260+(i*71%230);g.rect(x,820-h,147,h,i%2?'#d5e768':'#b9dd4f',INK,4,18);for(let y=835-h;y<775;y+=55)for(let dx of [20,82])g.rect(x+dx,y,35,31,'#ed78b6',null,0,7)}for(let i=0;i<26;i++)g.ellipse(i*83%1920,861+i*43%170,25,6,'#c052a4',null,0);
 }else if(world==='parlay'){
  g.rect(-300,250,2700,310,'#ffc776',null,0);g.poly([[-50,760],[300,610],[680,752],[1130,589],[1680,678],[2500,624],[2500,840],[-50,840]],'#349d9b',INK,4);for(let x=0;x<=1920;x+=140)g.line([[960,815],[x*2-960,1160]],'#226c73',2);for(let yy=855;yy<1100;yy+=40)g.line([[-300,yy],[2400,yy]],'#226c73',2);
 }else if(world==='pool'){
  for(let i=0;i<8;i++){let xx=i*290;g.ellipse(xx,620,250,104,'#a4d2b8',INK,3)}g.ellipse(1350,729,435,142,'#e6cba1',INK,6);g.ellipse(1350,729,363,97,'#7ab7ab',INK,4);
 }else if(world==='attention'){
  for(let i=0;i<17;i++)g.rect(i*125,0,62,821,'#3f2466',null,0);for(let i=0;i<16;i++){let xx=i*181%1900,yy=150+(i*99%550);g.star(xx,yy,12,'#cbb255',4)}
 }else if(world==='stadium'){
  g.rect(-300,390,2700,370,'#a5b4c7',INK,4);for(let row=0;row<4;row++)for(let col=0;col<35;col++)g.rect(col*70,410+row*65,48,28,row%2?'#637d9f':'#c3ccd4',null,0,5);g.rect(-300,761,2700,90,'#8da58c',INK,3);for(let x of [100,1800]){g.line([[x,120],[x,720]],INK,10);g.rect(x-88,100,176,65,'#d6dfcb',INK,4,5);for(let i=0;i<5;i++)g.ellipse(x-60+i*30,130,10,16,WHITE,INK,2)}
 }else if(world==='underground'){
  for(let row=0;row<8;row++)for(let col=0;col<14;col++)g.rect(col*160+(row%2)*80,100+row*89,157,86,null,'#662c42',3);g.rect(1130,170,500,500,'#342236',INK,6,14);g.text('NO CASH UP FRONT',1380,233,40,'#df9aa2',{font:'VT323'});g.text('WE TRUST YOU.',1380,301,34,'#d7b29a',{font:'VT323'});g.line([[1710,0],[1710,230]],INK,5);g.ellipse(1710,244,49,30,'#d6aa7e',INK,5);g.poly([[1661,243],[1759,243],[1811,818],[1612,818]],'#b7776326',null,0);
 }
}
export function props(g,world,line,t){let shot=line.shot,id=line.id;
 if(world==='home'){if(shot==='reveal'||parseInt(id.slice(1))>47){g.rect(1190,650,420,214,'#ad7d4c',INK,6,7);g.rect(1180,629,440,27,'#ead8b6',INK,5,4);coffee(g,1410,613,.8);g.rect(1200,409,380,88,'#efc77c',INK,5,7);g.text('COFFEE. $10.',1390,458,47,INK,{font:'VT323'})}return}
 if(world==='odds'){
  register(g,1420,650,t,shot==='coins'?(t>(line.beats?.keep??3.7)?2:1):0);
  if(['board','machine'].includes(shot)){g.rect(1080,182,700,255,'#eee0b6',INK,6,12);if(id==='L013'){g.text('1 / 1.90 = 52.63%',1430,244,44,INK,{font:'VT323'});g.text('52.63 + 52.63 = 105.26%',1430,314,34,INK,{font:'VT323'});g.text('IMPLIED TOTAL > 100%',1430,384,33,'#a63e65',{font:'VT323'})}else if(shot==='machine'){for(let [j,s]of ['TURNOVER','REVENUE','PROFIT'].entries())g.text(s,1430,235+j*70,43,INK,{font:'VT323'})}else{g.text('TWO POSSIBLE RESULTS',1430,235,35,INK,{font:'VT323'});g.text('1.90          1.90',1430,311,58,INK,{font:'VT323'});g.text('STAKE: $100   RETURN: $190',1430,384,31,INK,{font:'VT323'})}}
  if(shot==='coins'){
   for(let j=0;j<2;j++){let ph=ease((t-.45-j*.7)/1.4);if(ph<1){let xx=1095+ph*310,yy=565-Math.sin(ph*Math.PI)*130;g.push(xx,yy,1,1,(1-ph)*.18);g.rect(-52,-29,104,58,'#cae1a4',INK,4,5);g.text('$100',0,3,27,INK,{font:'VT323'});g.pop()}}
   let payoutAt=line.beats?.payout??2.6,payout=ease((t-payoutAt)/1.2);if(t>payoutAt){g.push(1450+payout*235,612-Math.sin(payout*Math.PI)*105,1,1,payout*.13);g.rect(-64,-35,128,70,'#f4e1b5',INK,4,5);g.text('$190',0,2,34,INK,{font:'VT323'});g.pop()}
   g.text('$200 IN',1200,390,48,WHITE,{stroke:INK});g.text('$190 OUT',1610,390,48,WHITE,{stroke:INK});if(t>(line.beats?.keep??3.7))g.text('THE TILL KEEPS $10',1420,810,36,'#ffe08e',{stroke:INK});
  }

 }else if(world==='parlay'){
  const compact=shot!=='gates';if(compact){g.push(1300,620,.65);g.push(-1300,-620)}
  for(let i=0;i<3;i++){let x=1130+i*240;g.rect(x-75,366,150,461,'#e8d9ae',INK,6,70);g.rect(x-51,406,102,421,i===2?'#d6564a':'#316c70',INK,5,47);g.text('50%',x,336,43,WHITE,{stroke:INK});let runAt=line.beats?.run??1.05,crashAt=line.beats?.crash??4.45;let blink=id==='L017'||(id==='L015'&&t>(runAt+(crashAt-runAt)*(i+1)/3));if(blink){if(i===2){g.line([[x-24,550],[x+24,601]],'#ffe4a6',10);g.line([[x+24,550],[x-24,601]],'#ffe4a6',10)}else g.line([[x-26,576],[x-5,598],[x+30,550]],'#a7dbb1',10)}else g.text('?',x,586,80,WHITE);g.text(String(i+1),x,766,31,WHITE,{font:'VT323'})}g.rect(1040,175,710,97,'#f4d379',INK,5,10);g.text(shot==='gates'?'ALL THREE: 1 IN 8':'TINY STAKE. GIANT PRIZE.',1395,230,45,INK,{font:'VT323'});
  if(shot==='gates'&&t>(line.beats?.run??1.05)){let runAt=line.beats?.run??1.05,crashAt=line.beats?.crash??4.45;let run=clamp((t-runAt)/Math.max(.6,crashAt-runAt)),xx=1000+run*555,jump=Math.abs(Math.sin(run*Math.PI*3))*72,hit=run>.94;character(g,'bo',xx-(hit?ease((run-.94)/.06)*80:0),822-jump,.77,{time:t,talk:0,emotion:hit?'panic':'eager',gesture:.7,angle:hit?-.28:.09});if(hit)for(let i=0;i<3;i++)g.star(xx-30+i*39,480-Math.sin(t*8+i)*15,11,'#ffe999')}
  if(compact){g.pop();g.pop()}
 }else if(world==='pool'){
  for(let i=0;i<3;i++){let a=t*.6+i*2.094;horse(g,1350+Math.cos(a)*325,650+Math.sin(a)*92,.55,t+i)}g.ellipse(1350,670,193,151,'#ed9079',INK,6);g.ellipse(1350,603,199,55,'#f7dcb2',INK,6);g.ellipse(1350,607,177,37,'#79bcb0',INK,4);g.rect(1255,652,190,81,'#f5deaf',INK,5,8);g.text('THE POOL',1350,697,38,INK,{font:'VT323'});g.curve([[1173,649],[1090,610],[1104,740],[1170,731]],null,INK,13);g.line([[1509,734],[1610,734],[1610,818]],'#c66b56',27);g.line([[1509,734],[1610,734],[1610,818]],INK,5);
  // A fixed placard stays above the complete horse orbit. The leader identifies
  // the drain without letting a passing horse obscure the label itself.
  if(shot==='pool'){g.line([[1650,495],[1780,495],[1780,786],[1644,786]],INK,3);g.poly([[1644,780],[1633,786],[1644,792]],INK,null,0);g.rect(1525,448,250,48,'#f5deaf',INK,4,7);g.text('DEDUCTION',1650,473,30,INK,{font:'VT323'})}
  for(let j=0;j<5;j++){let p=(t*.22+j*.2)%1,xx=1180+p*320,yy=480+Math.sin(p*Math.PI)*120;g.ellipse(xx,yy,16,16,'#edc24e',INK,3);g.text('$',xx,yy,20,INK,{font:'VT323'})}if(t>1.8){let p=(t*.7)%1;g.ellipse(1610,820+p*80,17,17,'#edc24e',INK,3);g.text('$',1610,820+p*80,20,INK,{font:'VT323'})}
 }else if(world==='attention'){
  g.rect(1207,270,360,500,'#e7ca57',INK,8,40);g.rect(1230,313,312,387,'#efe5bd',INK,5,20);g.ellipse(1323,390,45,45,WHITE,INK,5);g.ellipse(1433,390,45,45,WHITE,INK,5);g.ellipse(1329,390,6,8,INK,null,0);g.ellipse(1439,390,6,8,INK,null,0);g.text('FREE*',1387,497,65,'#b5486f',{font:'Bungee'});g.text('*CONDITIONS APPLY',1387,578,26,INK,{font:'VT323'});g.ellipse(1387,739,18,18,'#745b3d',INK,4);for(let i=0;i<4;i++){let yy=270+i*110+Math.sin(t*2+i)*9,xx=i%2?1660:1060;g.rect(xx-92,yy,184,70,'#c69ce1',INK,5,13);g.text(['AGAIN?','SO CLOSE!','BONUS!','LIVE NOW'][i],xx,yy+37,26,INK,{font:'VT323'});g.line([[xx,yy+70],[xx+(i%2?-65:65),yy+96]],INK,4)}
 }else if(world==='stadium'){
  if(shot==='turkey'){flag(g,'TR',1110,188,180);g.rect(1080,350,680,350,'#e9dfc5',INK,6,12);g.text('TFF • OCTOBER 2025',1420,399,35,INK,{font:'VT323'});g.text('371  ACCOUNTS',1420,488,56,'#9d3444',{font:'VT323'});g.text('152  BETTING RECORDS',1420,562,45,INK,{font:'VT323'});g.text('NOT A MATCH-FIXING VERDICT',1420,641,29,INK,{font:'VT323'})}
  else if(shot==='woolmer'){portrait(g,'woolmer',1220,480,1.25);g.rect(1420,287,425,362,'#e9dfc5',INK,5,10);g.text('POLICE CONCLUSION',1632,343,29,INK,{font:'VT323'});g.text('NATURAL',1632,421,47,INK,{font:'Bungee'});g.text('CAUSES',1632,478,47,INK,{font:'Bungee'});g.text('Jamaica • June 2007',1632,569,28,INK,{font:'VT323'})}
  else{g.rect(1150,317,565,343,'#2b3a50',INK,6,10);g.text('UPSET IS NOT EVIDENCE',1432,384,41,WHITE,{font:'VT323'});g.text('WHO?  WHAT?  PROOF?',1432,569,31,'#e7c473',{font:'VT323'});football(g,1427,477,54);g.rect(1250,670,365,130,'#b6aa99',INK,5,5);g.text('EVIDENCE BOOTH',1432,740,32,INK,{font:'VT323'})}
 }else if(world==='legal'){
  if(shot==='flags'){g.rect(1050,190,750,390,'#f4e8ce',INK,6,10);flag(g,'UK',1170,265,230);flag(g,'US',1475,265,230);g.text('LICENSED',1285,465,37,INK,{font:'VT323'});g.text('STATE RULES',1590,465,37,INK,{font:'VT323'})}
  if(shot==='brands'){g.rect(1040,180,760,341,'#f5ead4',INK,6,11);brand(g,'fanduel',1405,280,1.35);brand(g,'draftkings',1410,428,1.35)}
  if(shot==='asia'){g.rect(1010,170,800,424,'#f4e8ce',INK,5,9);for(let [i,id]of ['HK','SG','CN'].entries()){flag(g,id,1070+i*246,225,160);g.text(['HONG KONG','SINGAPORE','MAINLAND CHINA'][i],1150+i*246,366,26,INK,{font:'VT323'})}brand(g,'hkjc',1150,452,.75);brand(g,'singapore',1400,452,.75);g.text('AUTHORIZED',1640,433,25,'#ad403c',{font:'VT323'});g.text('LOTTERIES',1640,470,25,'#ad403c',{font:'VT323'})}
 }else if(world==='underground'){
  if(shot==='hanson'){portrait(g,'hanson',1220,490,1.35);g.rect(1430,303,390,363,'#ead2b2',INK,5,9);g.text('U.S. DOJ • 2017',1625,358,32,INK,{font:'VT323'});g.text('255',1625,449,104,'#9e3c49',{font:'Bungee'});g.text('MONTHS',1625,543,47,INK,{font:'Bungee'});g.text('SENTENCE AT THAT TIME',1625,612,24,INK,{font:'VT323'})}
  else{let jump=shot==='debt'?Math.abs(Math.sin(t*3))*12:0;g.push(1400,677-jump);g.ellipse(0,75,207,33,'#2e1c30',null,0);g.ellipse(0,0,157,120,'#ae6a7c',INK,7);g.ellipse(0,0,124,91,'#dd9b9e',INK,4);g.ellipse(-43,-31,35,31,WHITE,INK,5);g.ellipse(39,-31,35,31,WHITE,INK,5);g.ellipse(-36,-31,5,7,INK,null,0);g.ellipse(46,-31,5,7,INK,null,0);g.ellipse(0,32,89,37,'#382332',INK,5);for(let i=-2;i<=2;i++){g.poly([[i*30-13,10],[i*30+12,10],[i*30,38]],WHITE,INK,3);g.poly([[i*30-12,52],[i*30+12,52],[i*30,31]],WHITE,INK,3)}g.pop();g.text('PAY LATER',1400,445,54,'#edceb0',{font:'Bungee',stroke:INK});g.line([[1235,748],[1179,790],[1152,743]],'#a47b85',17);g.line([[1552,742],[1612,785],[1661,752]],'#a47b85',17)}
 }
}
