import {C,images,photo,figure,ornament,ransom,label,wrap,scrap,arrow,check,cross,flag,stamp,ease,enter,clamp,chatBadge} from './materials.mjs'
import {prop,spreadsheet,chatSlip,harvard} from './props.mjs'
import {background} from './backgrounds.mjs'
import {midnightClock} from './midnight-clock.mjs'
function portrait(g,x,y,w=700,rot=0){const im=images['learner-sheet'];if(im)photo(g,'learner-sheet',x,y,w,w*244/223,{crop:[1105,4,223,244],rot})}
function paperText(g,text,x,y,w,size=64,rot=0,color=C.ink){g.save();g.font=`${size}px Editorial, Unicode`;while(g.measureText(text).width>w&&size>24){size-=2;g.font=`${size}px Editorial, Unicode`}g.translate(x,y);g.rotate(rot);scrap(g,-24,-size-20,w+48,size+65,{fill:'#ece4ce',seed:text.length,rag:7});label(g,text,0,0,{size,font:'Editorial',color});g.restore()}
function arrive(g,t,start,dx,dy,draw,d=.65){const e=enter(t,start,d);if(e<=0)return;g.save();g.translate((1-e)*dx,(1-e)*dy);draw();g.restore()}
// The changed table keeps the same lookup, but moves Price from B to C.
// It is a separate paper object so the worked solution can physically leave.
function changedWorksheet(g,x,y,w,h){
 g.save();g.translate(x,y);g.scale(w/960,h/580)
 scrap(g,0,0,960,580,{fill:'#eeeadd',rag:9,shadow:12,seed:522})
 label(g,'YOUR TURN',36,43,{size:19,font:'Typewriter',color:'#666859'})
 const left=68,top=84,rh=57,widths=[170,125,125,25,178,170],starts=[left]
 for(const width of widths)starts.push(starts.at(-1)+width)
 g.fillStyle='#c8d5c18f';g.fillRect(left,top,starts.at(-1)-left,rh)
 g.fillStyle='#e7d48650';g.fillRect(starts[2],top,widths[2],rh*4)
 g.strokeStyle='#6e7a6780';g.lineWidth=1.4
 for(const xx of starts){g.beginPath();g.moveTo(xx,top);g.lineTo(xx,top+rh*6);g.stroke()}
 for(let row=0;row<=6;row++){g.beginPath();g.moveTo(left,top+row*rh);g.lineTo(starts.at(-1),top+row*rh);g.stroke()}
 g.textAlign='center';g.fillStyle='#53614e';g.font='24px Typewriter'
 for(let col=0;col<6;col++)g.fillText(String.fromCharCode(65+col),starts[col]+widths[col]/2,top-16)
 for(let row=0;row<6;row++)g.fillText(String(row+1),left-30,top+row*rh+37)
 g.textAlign='left';g.fillStyle=C.ink;g.font='27px Typewriter'
 const rows=[['Item','Group','Price','','Find','Result'],['Apples','Fruit','2.40','','Pears',''],['Pears','Fruit','2.10','','',''],['Rice','Grain','3.60','','','']]
 rows.forEach((row,r)=>row.forEach((word,c)=>{if(word)g.fillText(word,starts[c]+13,top+r*rh+37,widths[c]-24)}))
 label(g,'F2 =',42,493,{size:30,font:'Typewriter',color:'#334f42'})
 g.strokeStyle='#7b7b68';g.lineWidth=1.4;g.beginPath();g.moveTo(150,501);g.lineTo(900,501);g.stroke()
 g.restore()
}
function rebuildDesk(g,s,t,p){
 const remove=enter(t,.20,1.25),build=enter(t,1.10,1.2),lean=enter(t,1.35,1.4)
 ornament(g,2,-100,650,1300,-.025);ornament(g,0,1480,180,600,.12)
 if(images['desk-group'])photo(g,'desk-group',40-lean*180,240+lean*70,730+lean*80,800+lean*88,{rot:-.025,crop:[302,0,925,1015]})
 else{prop(g,'desk',180,510,720,-.025);figure(g,0,210,310,670);prop(g,'laptop',520,400,430,-.05)}
 if(remove<1){
  g.save();g.translate(remove*210,-remove*1200);g.rotate(remove*-.10)
  spreadsheet(g,935,330,850,485,{variant:0,reveal:1,solution:true})
  chatBadge(g,770,405,125);paperText(g,'=VLOOKUP(E2, A2:B4, 2, FALSE)',915,920,850,41,.015)
  g.restore()
 }
 if(build>0){
  g.save();g.translate(0,(1-build)*1050);g.rotate((1-build)*.065)
  changedWorksheet(g,565,285,1250,720)
  g.restore()
 }
 ransom(g,'TOMORROW',970,190,{size:105,seed:303,center:true})
 arrive(g,t,3.15,0,300,()=>paperText(g,'Rebuild the method',650,1035,1050,58,-.012))
 if(p>.72)stamp(g,'TRY AGAIN',1110,915,{size:48,color:C.orange,rot:-.035})
}
export function deskScene(g,s,t,p){const id=Number(s.id);if(id===3){rebuildDesk(g,s,t,p);return}const fresh=id===45;if(id===2)t+=10;
 arrive(g,t,0,0,600,()=>ornament(g,2,-100,650,1300,-.025));arrive(g,t,.9,600,0,()=>ornament(g,0,1480,180,600,.12))
 arrive(g,t,.4,-1000,120,()=>{if(images['desk-group'])photo(g,'desk-group',40,240,730,800,{rot:-.025,crop:[302,0,925,1015]})
 else{prop(g,'desk',180,510,720,-.025);figure(g,0,210,310,670);prop(g,'laptop',520,400,430,-.05)}})
 const x=935+(1-enter(t,id===1?2.4:.55,.8))*1200;spreadsheet(g,x,330,850,485,{variant:fresh?1:0,reveal:enter(t,3.2,1.2),solution:!fresh});
 arrive(g,t,id===1?5:.9,1100,40,()=>{if(!fresh)chatBadge(g,770,405,125);paperText(g,fresh?'Rebuild the method':'=VLOOKUP(E2, A2:B4, 2, FALSE)',915,920,850,fresh?58:41,.015)})
 if(p>.72)stamp(g,fresh?'TRY AGAIN':'DONE',1370,825,{size:58,color:fresh?C.orange:C.teal,rot:-.035})
 arrive(g,t,.55,0,-350,()=>ransom(g,id===1?'MIDNIGHT':id===2?'DONE?':id===3?'TOMORROW':'TRY AGAIN',970,190,{size:id===3?105:120,seed:id+300,center:true}));if(id===1)arrive(g,t,1.6,400,0,()=>midnightClock(g,1665,35,170,.035))
}
export function titleScene(g,s,t,p){
 arrive(g,t,.3,-1000,300,()=>portrait(g,40,300,780,-.04));arrive(g,t,.65,900,0,()=>ornament(g,0,1000,130,900,.05));arrive(g,t,1.25,0,900,()=>ornament(g,1,1430,450,650,-.08));arrive(g,t,1.55,0,700,()=>ornament(g,3,650,660,580,.08))
 arrive(g,t,1.05,0,-500,()=>prop(g,'brain',280,90,400,-.11));if(t>1.55)arrow(g,620,315,1070,430,{color:C.orange,width:11});
 ransom(g,'LEARN',1240,425,{size:190,center:true,seed:320});if(p>.25)ransom(g,'or just',1130,625,{size:97,center:true,seed:321});if(p>.48)ransom(g,'FINISH?',1210,850,{size:152,center:true,seed:322})
}
export function turkeyScene(g,s,t,p){
 ornament(g,5,200,60,1510,-.03);ornament(g,2,-60,680,1500,.01);flag(g,'TR',1320,150,430,280,.08);
 ransom(g,'TURKEY',810,300,{size:150,center:true,seed:327});
 arrive(g,t,.8,0,800,()=>photo(g,'study-sheet',280,495,1300,778,{crop:[448,100,660,395],rot:-.025}));
 paperText(g,'Nearly 1,000 students',390,490,1120,90,-.025);if(p>.4){const cols=['CONTROL','GPT BASE','GPT TUTOR'];cols.forEach((a,i)=>paperText(g,a,135+i*625,1000,530,52,(i-1)*.018))}
}
export function physicsScene(g,s,t,p){const id=Number(s.id);
 ornament(g,2,0,565,1500,0);harvard(g,id===18?1600:1550,id===18?65:70,id===18?250:260);ornament(g,3,1370,650,570,-.1);
 if(id===18){ransom(g,'HARVARD',710,260,{size:160,center:true,seed:332});portrait(g,100,390,650,-.03);prop(g,'books',970,620,650,-.06);paperText(g,'Tutor',935,490,650,110,.02);if(p>.38)paperText(g,'Active classroom',810,960,1040,77,-.02)}
 else{ransom(g,'4.5',530,615,{size:270,center:true,seed:334});if(p>.34)ransom(g,'3.5',1200,615,{size:270,center:true,seed:335});paperText(g,'TUTOR',270,770,470,66,-.04);paperText(g,'CLASSROOM',960,770,660,66,.03);paperText(g,'Median immediate post-test scores',340,995,1280,54,.01)}
}
export function qualityScene(g,s,t,p){
 const e=ease((p-.03)/.4),count=Math.round(e*20);for(let i=0;i<count;i++){let col=i%5,row=Math.floor(i/5),xx=col*390-80+(i%3-1)*70,yy=row*280-70+(i%4)*23;arrive(g,t,i*.14,(i%2?1:-1)*1300,(i%3-1)*600,()=>{g.save();g.translate(xx,yy);g.rotate((i%3-1)*.13);if(images['study-sheet']){const crop=i%2?[16,25,412,511]:[454,91,646,409];photo(g,'study-sheet',0,0,560,560*crop[3]/crop[2],{crop,shadow:16})}else{scrap(g,0,0,490,340,{fill:'#e7e3d5',seed:i,rag:2,shadow:8});prop(g,'hand',60,-20,260,-.15)}g.restore()},.45)}
 if(p>.72){for(let i=0;i<7;i++)cross(g,170+i*260,220+(i%3)*270,75,C.orange)}
 if(p>.35){g.save();g.fillStyle='#22222240';g.fillRect(0,0,1920,1080);g.restore();ransom(g,'32%',960,560,{size:285,center:true,seed:340});paperText(g,'Failed the initial quality checks',440,760,1100,66,-.025)}
}
export function offloadScene(g,s,t,p){const id=Number(s.id);background(g,'teal',Math.round(t*25),s.index);
 if(id===23){ornament(g,1,535,200,860,-.02);prop(g,'brain',765,125,430,.02);prop(g,'calculator',1340,230,300,-.08);prop(g,'clock',90,180,420,.08);prop(g,'notebook',100,680,560,-.03);ornament(g,0,1200,600,730,.06);ransom(g,'WHAT STAYS',960,840,{size:105,center:true,seed:350});if(p>.5)ransom(g,'YOURS?',960,1010,{size:155,center:true,seed:351})}
 else{portrait(g,555,240,760);prop(g,'calculator',80,330,370,-.08);prop(g,'notebook',1330,450,560,.04);ransom(g,'FINISH',350,225,{size:105,center:true,seed:354});ransom(g,'LEARN',1530,225,{size:105,center:true,seed:355});if(p>.32){paperText(g,'Choose',1420,650,350,66,-.03);paperText(g,'Check',1370,810,420,70,.02);paperText(g,'Explain',1400,980,420,65,-.02)}}
}
export function equationScene(g,s,t,p){background(g,'teal',Math.round(t*25),s.index);const id=Number(s.id),transfer=id===41;
 const eqs=transfer?['3(y − 2) = 15','y − 2 = 5','y = 7']:id===38?['2(x + 3) = 14','x + 3 = 7','x = 4']:id===39?['2(4 + 3) = 14','2x + 3','2x + 6']:['2(x + 3) = 14','Why divide both sides?','Explain the steps']
 const sourceWidth=id===40?1510:1260;
 eqs.forEach((eq,i)=>{let e=enter(t,i*s.voice_duration*.3+.4,.65);if(e<=0)return;let xx=320+(i%2?170:-80)+(1-e)*(i%2?-1550:1550),yy=260+i*300;paperText(g,eq,xx,yy,sourceWidth,i===1&&id===40?96:122,(i-1)*.018,id===39&&i===1?C.orange:C.ink);if(id===39&&i===1&&p>.65)cross(g,950,520,160);if(i===2&&id!==40)check(g,1640,850,90,'#e7cd76')});
 if(id===38&&p>.3){label(g,'÷ 2',1630,410,{size:76,color:'#f4ebcc',font:'Editorial'});arrow(g,1650,450,1580,540,{color:C.orange,width:10})}
 prop(g,'hand',1380,720,500,-.4)
 if(id===40&&p>.65){let e=enter(t,s.voice_duration*.63,.7);scrap(g,80,600+(1-e)*600,1580,400,{fill:'#d6c8a4',rot:-.04,seed:99,rag:12});label(g,'Rebuild it yourself',300,820+(1-e)*600,{size:115,font:'Editorial'})}
 if(transfer&&p>.65)stamp(g,'NEAR TRANSFER',100,1020,{size:58,color:'#efe4b9',rot:-.03})
}
export function closingScene(g,s,t,p){portrait(g,-100,250,950,-.025);ornament(g,0,1130,50,970,.04);ornament(g,3,550,700,660,-.03);ornament(g,2,430,770,1250,.01);prop(g,'brain',50,90,390,-.06);
 if(p<.38){ransom(g,'EXPLAIN',1270,340,{size:145,center:true,seed:380});ransom(g,'CHECK',1180,600,{size:145,center:true,seed:381});ransom(g,'DO',1170,860,{size:170,center:true,seed:382})}
 else{ransom(g,'WHAT',1200,370,{size:220,center:true,seed:385});ransom(g,'REMAINS?',1170,700,{size:165,center:true,seed:386});if(p>.7)paperText(g,'Try again without the help.',920,940,850,52,-.02)}
}
export function toolsScene(g,s,t,p){
 background(g,'teal',Math.round(t*25),s.index)
 arrive(g,t,.1,0,-450,()=>{chatBadge(g,805,40,220,{showLabel:false});ransom(g,'GPT-4',960,390,{size:105,center:true,seed:601})})
 arrive(g,t,.65,-1000,150,()=>{prop(g,'laptop',60,420,690,-.08);paperText(g,'GPT Base',170,920,550,100,-.025)})
 arrive(g,t,1.2,1000,150,()=>{photo(g,'study-sheet',1140,395,650,650*431/453,{crop:[29,554,453,431],rot:.045});paperText(g,'GPT Tutor',1150,920,610,100,.025)})
 if(p>.34){paperText(g,'Complete solution',120,470,620,61,-.04);paperText(g,'Attempt → hint',1190,360,600,65,.03)}
 if(p>.68)paperText(g,'Same model. Different teaching design.',525,1040,1020,51,-.01)
}
export function helpScene(g,s,t,p){
 background(g,'magenta',Math.round(t*25),s.index)
 photo(g,'study-sheet',440,350,1050,1050*257/480,{crop:[1056,650,480,257],rot:-.015})
 const left=['Solve it for me.','Show every answer.','Copy the result.'],right=['Here is my attempt.','Which step is wrong?','Let me try again.']
 for(let i=0;i<3;i++){arrive(g,t,.4+i*1.5,-1300,60,()=>paperText(g,left[i],60+i*30,215+i*300,610,58,(i-1)*.035));arrive(g,t,1.0+i*1.5,1300,-60,()=>paperText(g,right[i],1190-i*20,260+i*300,640,58,(1-i)*.04))}
 paperText(g,'GPT BASE',100,1040,490,67,-.025);paperText(g,'GPT TUTOR',1230,1040,560,67,.025)
}
export function targetScene(g,s,t,p){
 photo(g,'study-sheet',-60,220,1510,1510*257/480,{crop:[1056,650,480,257],rot:-.03})
 ornament(g,0,1340,230,670,.05);prop(g,'hand',1300,640,550,-.25)
 const words=['CHOOSE','CHECK','EXPLAIN'];words.forEach((w,i)=>arrive(g,t,.5+i*s.voice_duration*.23,i%2?1200:-1400,80,()=>ransom(g,w,985+i*75,220+i*330,{size:135,center:true,seed:620+i})))
}
