import {createCanvas} from '@napi-rs/canvas'
import {C, W, H, PAPER, images, photo, scrap, label, ransom, smooth, clamp} from './materials.mjs'
import {prop} from './props.mjs'
import {background} from './backgrounds.mjs'

// Two isolated V8 scene replacements. All movement is a function of the
// existing shot fraction: there are no timers, random per-frame offsets or
// changes to narration, scene duration, or the shared rendering helpers.
const mix=(a,b,u)=>a+(b-a)*u
const phase=(p,a,b)=>smooth(clamp((p-a)/(b-a)))
function pose(p,keys){
  let a=keys[0],b=keys.at(-1)
  for(let i=1;i<keys.length;i++)if(p<=keys[i].p){a=keys[i-1];b=keys[i];break}
  const u=phase(p,a.p,b.p),out={}
  for(const key of Object.keys(a))if(key!=='p')out[key]=mix(a[key],b[key],u)
  return out
}
function note(g,text,x,y,w,{size=58,rot=0,fill='#ece4ce',seed=24}={}){
  g.save();g.translate(x,y);g.rotate(rot)
  scrap(g,-w/2,-size-14,w,size+43,{fill,seed,rag:10,shadow:9})
  label(g,text,0,0,{size,font:'Typewriter',align:'center'})
  g.restore()
}
function personCard(g,a){
  const w=a.w,h=w*244/223
  g.save();g.translate(a.x,a.y);g.rotate(a.r)
  g.transform(1,a.skew,0,1,0,0)
  scrap(g,-w/2-15,-h/2-13,w+30,h+28,{fill:'#d8cdb4',seed:242,rag:12,shadow:17})
  photo(g,'learner-sheet',-w/2,-h/2,w,h,{crop:[1105,4,223,244],shadow:0})
  g.restore()
}
function calculatorCard(g,a){
  const h=a.w*387/250
  g.save();g.translate(a.x,a.y);g.rotate(a.r)
  g.transform(1,a.skew,0,1,0,0)
  scrap(g,-a.w/2-26,-h/2-23,a.w+52,h+46,{fill:'#e4d6b4',seed:243,rag:12,shadow:18})
  prop(g,'calculator',-a.w/2,-h/2,a.w)
  g.restore()
}

export function offloadMotionScene(g,s,t,p){
  background(g,'teal',Math.round(t*25),s.index)
  const learner=pose(p,[
    {p:0,x:1720,y:675,w:635,r:.23,skew:-.05},
    {p:.16,x:1230,y:625,w:635,r:.04,skew:-.015},
    {p:.36,x:1010,y:560,w:635,r:-.09,skew:.035},
    {p:.59,x:1355,y:555,w:600,r:.035,skew:0},
    {p:.80,x:1370,y:535,w:600,r:-.018,skew:0},
    {p:1,x:1370,y:535,w:600,r:-.018,skew:0},
  ])
  const calculator=pose(p,[
    {p:0,x:145,y:645,w:340,r:-.27,skew:.06},
    {p:.16,x:415,y:630,w:340,r:-.13,skew:.025},
    {p:.36,x:780,y:630,w:340,r:.11,skew:-.025},
    {p:.59,x:385,y:595,w:315,r:-.075,skew:0},
    {p:.80,x:385,y:555,w:315,r:-.04,skew:0},
    {p:1,x:385,y:555,w:315,r:-.04,skew:0},
  ])
  // Separate physical cards assemble, overlap as a tool/person cluster, then
  // separate again. The notebook and retained skill slips join the learner.
  personCard(g,learner)
  calculatorCard(g,calculator)
  const notebook=phase(p,.40,.65)
  if(notebook>0){
    g.save();g.translate((1-notebook)*1050,(1-notebook)*360)
    prop(g,'notebook',1080,755,700,-.035)
    g.restore()
  }
  g.save()
  ransom(g,'FINISH',390,140,{size:96,center:true,seed:354})
  label(g,'the bookkeeping',390,215,{size:43,font:'Editorial',align:'center',fill:'#ece4ce'})
  ransom(g,'LEARN',1420,140,{size:96,center:true,seed:355})
  label(g,'the method',1420,215,{size:43,font:'Editorial',align:'center',fill:'#ece4ce'})
  g.restore()
  const steps=[['Choose',.48,1100,788,-.06],['Check',.63,1345,884,.025],['Explain',.77,1580,984,-.025]]
  for(const [word,start,x,y,rot] of steps){
    const e=phase(p,start,start+.10)
    if(e>0)note(g,word,mix(1980,x,e),mix(y+95,y,e),330,{size:58,rot:mix(.17,rot,e),seed:word.length+240,fill:word==='Choose'?'#e6ca6a':'#ece4ce'})
  }
}

const printCache=new Map()
function printedPhoto(variant){
  if(printCache.has(variant))return printCache.get(variant)
  const c=createCanvas(720,430),g=c.getContext('2d')
  g.fillStyle='#eeeade';g.fillRect(0,0,720,430)
  // Reuse original generated study imagery only, with two eye crops and one
  // teacher photograph. Printing treatment is fixed once in object space.
  const crops=[[1056,650,480,257],[1140,690,355,185],[29,554,453,431]]
  const crop=crops[variant%3]
  if(!images['study-sheet'])throw new Error('S25 requires study-sheet image')
  g.drawImage(images['study-sheet'],...crop,20,20,680,390)
  const pixels=g.getImageData(20,20,680,390)
  for(let i=0;i<pixels.data.length;i+=4){
    const v=pixels.data[i]*.299+pixels.data[i+1]*.587+pixels.data[i+2]*.114
    const ink=Math.max(0,Math.min(255,(v-128)*1.2+128))
    pixels.data[i]=ink;pixels.data[i+1]=ink;pixels.data[i+2]=ink
  }
  g.putImageData(pixels,20,20)
  g.save();g.beginPath();g.rect(20,20,680,390);g.clip()
  g.fillStyle='#171918';g.globalAlpha=.18
  for(let y=23;y<410;y+=6)for(let x=23+(y%12?3:0);x<700;x+=6){g.beginPath();g.arc(x,y,.85,0,Math.PI*2);g.fill()}
  g.globalCompositeOperation='multiply';g.globalAlpha=.32;g.drawImage(PAPER,0,0,720,430)
  g.restore();printCache.set(variant,c);return c
}
function card(g,x,y,w,rot,variant){
  const h=w*430/720
  g.save();g.translate(x,y);g.rotate(rot)
  scrap(g,-w/2-6,-h/2-6,w+12,h+12,{fill:'#eeeade',seed:variant+252,rag:5,shadow:15})
  g.drawImage(printedPhoto(variant),-w/2,-h/2,w,h)
  g.restore()
}
const pile=[
  [180,80,780,-.16,1],[820,40,800,.09,0],[1600,70,850,-.10,2],
  [-20,510,780,.12,0],[530,560,780,-.17,2],[1540,550,920,.16,1],
  [120,1040,870,-.09,2],[870,1060,860,.16,1],[1780,1040,940,-.11,0],
  [1050,540,1060,-.055,0],
]

export function targetMotionScene(g,s,t,p){
  // 1: photo cards accumulate. 2: the foreground eye print takes the center.
  // 3: the whole pile pushes into a macro crop. 4: one physical blue sheet
  // sweeps across, leaving the three retained skills on a clear paper field.
  const push=phase(p,.39,.69),zoom=mix(1,1.37,push)
  g.save();g.translate(960,540);g.scale(zoom,zoom);g.translate(-960,-540)
  pile.forEach(([x,y,w,r,v],i)=>{
    const e=phase(p,.018+i*.024,.13+i*.024)
    if(e<=0)return
    const dx=i%2?1250:-1250,dy=i%3===0?-480:480
    card(g,x+(1-e)*dx,y+(1-e)*dy,w,mix(r+(i%2?.21:-.21),r,e),v)
  })
  g.restore()
  const wipe=phase(p,.70,.93)
  if(wipe>0){
    const x=mix(W+50,-130,wipe)
    scrap(g,x,-100,2300,1300,{fill:'#127c8d',seed:255,rag:25,shadow:20})
  }
  const settle=phase(p,.72,.94)
  const words=[['CHOOSE',.06,395,235,430,400],['CHECK',.28,980,565,960,560],['EXPLAIN',.49,1450,905,1490,720]]
  words.forEach(([word,start,x,y,endX,endY],i)=>{
    const e=phase(p,start,start+.09)
    if(e<=0)return
    const xx=mix(x,endX,settle),yy=mix(y,endY,settle)
    g.save();g.translate(xx,yy+(1-e)*200);g.rotate(mix((i-1)*.045,0,settle))
    ransom(g,word,0,0,{size:i===2?109:120,center:true,seed:620+i})
    g.restore()
  })
}
