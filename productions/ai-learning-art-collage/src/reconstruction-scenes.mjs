import {C,photo,scrap,label,ransom,ease,cross,arrow} from './materials.mjs'
import {prop} from './props.mjs'
import {background} from './backgrounds.mjs'

function paper(g,text,x,y,w,size,rot=0,fill='#eee4cc',color=C.ink){
  g.save();g.translate(x,y);g.rotate(rot)
  scrap(g,-25,-size-25,w+50,size+70,{fill,rag:12,seed:text.length*91,shadow:13})
  label(g,text,0,0,{size,font:'Editorial',color});g.restore()
}

// A sharp printed interruption separates error checking from the quiet hint.
export function errorScene(g,s,t,p){
  background(g,'magenta',Math.round(t*25),s.index)
  photo(g,'study-sheet',-270,255,920,920*447/553,{crop:[501,547,553,447],rot:-.17})
  ransom(g,'CHECK',1320,200,{size:170,center:true,seed:391})
  const first=ease((p-.025)/.13)
  paper(g,'2(4 + 3) = 14',680+(1-first)*1450,425,1060,136,-.025)
  if(p>.33){
    const e=ease((p-.33)/.13)
    paper(g,'2x + 3',580-(1-e)*1450,700,900,169,.032,'#f0d4b6','#63291f')
  }
  if(p>.66){
    const e=ease((p-.66)/.11)
    // Center the crossing strokes on the incorrect constant, not empty paper.
    cross(g,1040,650,92*e,'#ab271d')
  }
  if(p>.73){
    const e=ease((p-.73)/.12)
    paper(g,'2x + 6',780,980+(1-e)*580,950,170,-.025,'#d0d6b6','#23453b')
    arrow(g,1500,735,1510,835,{width:10,color:'#f6ecd3',wiggle:35})
  }
  prop(g,'hand',1510,560,470,-.27)
}

// Cover the actual worked example early, then leave room for reconstruction.
export function rebuildScene(g,s,t,p){
  background(g,'white',Math.round(t*25),s.index)
  photo(g,'study-sheet',90,45,1640,1640*447/553,{crop:[501,547,553,447],rot:-.025})
  paper(g,'Why does each step work?',1000,280,760,61,.045)
  const cover=ease((p-.08)/.15),cx=215-(1-cover)*1600,cy=365
  if(cover>0){
    g.save();g.translate(cx,cy);g.rotate(-.04)
    scrap(g,0,0,820,640,{fill:'#e2d1aa',rag:17,seed:400,shadow:17})
    label(g,'YOUR RECONSTRUCTION',55,95,{size:44,font:'Typewriter',color:'#5b513b'})
    g.strokeStyle='#6a806b55';g.lineWidth=2
    for(let y=230;y<580;y+=145){g.beginPath();g.moveTo(55,y);g.lineTo(755,y);g.stroke()}
    if(p>.48)label(g,'2(x + 3) = 14',65,205,{size:70,font:'Editorial'})
    if(p>.73)label(g,'Choose. Explain.',65,500,{size:65,font:'Editorial',color:'#31574d'})
    g.restore()
  }
  if(p>.38){
    const e=ease((p-.38)/.14)
    prop(g,'hand',1310+(1-e)*800,680,520,-.35)
  }
}
