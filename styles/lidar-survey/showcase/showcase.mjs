const $ = selector => document.querySelector(selector);
const en = Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(node => [node.dataset.i18n,node.innerHTML]));
const enAria = Object.fromEntries([...document.querySelectorAll('[data-aria]')].map(node => [node.dataset.aria,node.getAttribute('aria-label')]));
const zh = {
  skip:'跳转到最终成片', navigation:'主导航', language:'页面语言', navStudy:'风格演示', navMake:'开始创作', allStyles:'全部风格 ↗',
  styleName:'LiDAR Survey · 点云测绘', discipline:'点云 → 地表 → 证据', title:'层层看见，<br><em>地表的形状。</em>',
  intro:'从一个回波进入一片空间。剥开树冠，让地形在侧光下浮现，沿着剖面看清它的起伏。', explore:'观看最终成片 ↓',
  studyTitle:'测绘视窗', studyType:'合成风格示意 / 20 秒 / 无声', instrument:'LIDAR / 材质实验', dataLabel:'数据类型', synthetic:'合成示意',
  viewportNote:'仅演示造型与运动 · 不含真实测绘数据', canvas:'合成地形演示：点云、树冠剥离、地表显现和剖面。使用下方控件探索。',
  play:'播放演示 ▷', pause:'暂停 Ⅱ', replay:'重新播放 ↺', restart:'重置演示', timeline:'演示时间轴', chapters:'演示章节',
  chapter0:'进入点云',chapter1:'剥离树冠',chapter2:'显现地表',chapter3:'读取剖面',chapter4:'回归环境',
  studyNote:'这是一段原创程序化风格示意。地形与植被均为合成，不对应任何真实地点或测绘成果。',
  grammarEyebrow:'01 / 视觉语言',grammarTitle:'安静的底色，<br>清晰的显现。',grammarIntro:'镜头发现空间，切面分离层次。一项有依据的读数，让画面值得停留。',
  rule1Title:'保留回波的真实位置。',rule1:'真实测绘影片中的每一个点，都应留在它被测得的位置。稀疏区域与缺失回波也是证据的一部分。',
  rule2Title:'让层次解释变化。',rule2:'扫描前缘、逐层下降的树冠切面、侧光下显现的地表，每次转变都解释一种空间关系。',
  rule3Title:'一次看清一个读数。',rule3:'用细线剖面和贴合对象的标注解释测量。数值旁保留来源与方法，显示比例的夸张也要明确标出。',
  swatch0:'背景',swatch1:'回波',swatch2:'地表',swatch3:'前缘',swatch4:'读数',
  makeEyebrow:'02 / 开始你的创作',makeTitle:'你的地点，<br>新的视角。',makeIntro:'带来一处地点、一个问题和一份测绘数据。围绕数据能够说明的内容，组织你的影片。',
  repoLabel:'在 GITHUB 获取工程',guide:'阅读风格指南 ↗',copy:'复制命令',copied:'命令已复制',copyFailed:'请选中上方命令并复制。',
  promptEyebrow:'试着这样对 CODEX 说',prompt:'根据我提供的地点与测绘数据，制作一部 LiDAR Survey 点云测绘影片。使用真实测得的点、清晰的树冠剥离、侧光地表和一处易读剖面，说明证据能够支持的结论。把镜头、旁白和声音放在同一条时间轴上，检查并打磨成片。',
  fullPrompt:'打开可复用提示词 ↗',packageNote:'已包含风格指南、空白测绘与时间轴约定，以及共享制作方法。新影片需要自己的数据集、渲染器和声音。',
  notesEyebrow:'03 / 制作方法',notesTitle:'从一个回波，<br>到一份依据。',
  note1Title:'先把地面弄清楚。',note1:'记录数据来源、采集日期、使用许可、分类、单位和坐标系统。区分直接测量与解释性描绘。',
  note2Title:'共享一只时钟。',note2:'一起安排环绕镜头、切面、标注、安静的停顿和地表显现。细小滴答与轻扫声跟随空间变化。',
  note3Title:'在交付尺寸下审看。',note3:'检查编码成片中的点云清晰度、遮挡、标注停留和镜头运动，再单独试听旁白与混音。',
  starter:'查看创作起步包 ↗',director:'导演指南 ↗',production:'制作指南 ↗',
  creditsEyebrow:'04 / 参考与署名',creditsTitle:'一种走近细看的语言。',
  creditsBody:'风格语法参考 LemoLab / Lemomo 的 lemo-opuscar 中的 LiDAR Survey：固定回波、分类剥离、连续镜头和细线测量。本页交互演示与合成地形为独立创作。',
  reference:'查看原始风格与参考影片 ↗',provenance:'来源与许可 ↗',
  fontNote:'字体在本站托管：Barlow Project Authors 的 Barlow Condensed 与 IBM 的 IBM Plex Mono，均采用 SIL Open Font License。',
  footer:'为下一个故事，找到自己的视觉语言。'
};
Object.assign(en,{pause:'Pause Ⅱ',replay:'Replay ↺',copied:'Command copied',copyFailed:'Select and copy the command above.'});
const descriptions = {
 en:[
  'Fixed points and a moving camera make volume legible. Colour separates the ground from the canopy.',
  'A descending plane removes the canopy in layers. The ground points stay where they were.',
  'One front reveals a stone-coloured surface. Raking light makes small changes in relief legible.',
  'An amber section follows the terrain. The inset shows the same synthetic profile, without survey units.',
  'The canopy returns as a faint ghost. The surface remains visible beneath its context.'
 ],
 zh:[
  '点的位置固定，镜头的移动让体积变得清晰。色彩区分地面与树冠。',
  '下降的切面逐层移除树冠，地面点保留在原有位置。',
  '同一道前缘显现石色地表，低角度侧光让细小起伏可见。',
  '琥珀色剖面线沿地形展开，插图展示同一条合成剖面，不使用测绘单位。',
  '树冠作为淡淡的背景回归，地表与环境的关系依然清楚。'
 ]
};
const phaseNames = {en:['RETURNS','CANOPY PEEL','SURFACE','SECTION','CONTEXT'],zh:['点云回波','树冠剥离','地表显现','剖面','环境回归']};
let language='en', time=3.5, playing=false, lastStamp=0, request=0, visible=true;
const duration=20;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function t(key){return (language==='zh'?zh[key]:en[key])??en[key]??key;}
function sync(){
 const phase=Math.min(4,Math.floor(time/4));
 $('#phase-label').textContent=`0${phase+1} / ${phaseNames[language][phase]}`;
 $('#phase-description').textContent=descriptions[language][phase];
 document.querySelectorAll('[data-chapter]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.chapter)===phase)));
 $('#seek').value=time;
 $('#seek').setAttribute('aria-valuetext',language==='zh'?`${time.toFixed(1)} 秒，共 20 秒`:`${time.toFixed(1)} of 20 seconds`);
 $('#time').value=`00:${String(Math.floor(time)).padStart(2,'0')} / 00:20`;
 $('#play').textContent=t(playing?'pause':time>=duration?'replay':'play');
 $('#play').setAttribute('aria-label',t(playing?'pause':time>=duration?'replay':'play'));
}
function setLanguage(value){
 language=value;
 document.documentElement.lang=value==='zh'?'zh-CN':'en';
 document.title=value==='zh'?'LiDAR Survey 点云测绘 — Codex Film Studio':'LiDAR Survey — Codex Film Studio';
 document.querySelectorAll('[data-i18n]').forEach(node=>node.innerHTML=t(node.dataset.i18n));
 document.querySelectorAll('[data-aria]').forEach(node=>node.setAttribute('aria-label',value==='zh'?zh[node.dataset.aria]:enAria[node.dataset.aria]));
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===value)));
 document.querySelectorAll('[data-home]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('lang',value);link.href=url.href;});
 const preview=$('[data-preview]');preview.src=`preview.${value}.svg`;
 preview.alt=value==='zh'?'合成地形的点云示意与琥珀色剖面线':'Synthetic terrain illustrated with muted green points and an amber section';
 const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);
 try{localStorage.setItem('film-studio-language',value);}catch{}
 sync();draw();
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));


// Entirely synthetic, deterministic geometry. No geographic coordinates or
// empirical measurements: the study demonstrates visual grammar only.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
let seed=5711;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function terrain(x,z){
 return 3+18*Math.exp(-((x+30)**2/2500+(z-15)**2/4000))+10*Math.exp(-((x-65)**2/1900+(z+45)**2/1300))+4*Math.sin(x*.035+z*.025)+2.2*Math.sin(z*.085)*Math.cos(x*.026);
}
const points=[];
for(let z=-105;z<=105;z+=2.4)for(let x=-110;x<=110;x+=2.4){
 const px=x+(random()-.5)*1.5,pz=z+(random()-.5)*1.5;
 points.push({x:px,z:pz,y:terrain(px,pz),canopy:false,tone:random()});
}
for(let n=0;n<65;n++){
 const x=(random()-.5)*205,z=(random()-.5)*195,base=terrain(x,z),radius=7+random()*6,height=16+random()*19;
 for(let k=0;k<145;k++){
  const a=random()*Math.PI*2,r=Math.sqrt(random())*radius;
  const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
  const y=base+height+Math.sqrt(1-(r/radius)**2)*radius*.7+(random()-.5)*2;
  points.push({x:px,z:pz,y,canopy:true,tone:random()});
 }
}
const cells=[];
for(let z=-105;z<105;z+=5)for(let x=-110;x<110;x+=5){
 const dx=(terrain(x+1,z)-terrain(x-1,z))/2,dz=(terrain(x,z+1)-terrain(x,z-1))/2;
 const shade=clamp((.38-dx*.42-dz*.32)/Math.sqrt(1+dx*dx+dz*dz),.15,.87);
 const c=[x,z,x+5,z,x+5,z+5,x,z+5];
 cells.push({x:x+2.5,z:z+2.5,c,shade});
}
const canvas=$('#cloud'),ctx=canvas.getContext('2d');
let width=0,height=0;
function line(vertices,color,lineWidth=1){
 ctx.beginPath();vertices.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();
}
function draw(){
 if(!ctx||!width||!height)return;
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#080f12';ctx.fillRect(0,0,width,height);
 const yaw=-.52+time*.018,pitch=.52+Math.sin(time*.13)*.07,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const scale=Math.min(width/340,height/182),centerX=width*.49,centerY=height*.61;
 const depth=(x,z)=>-x*sy+z*cy;
 const project=(x,y,z)=>{const d=depth(x,z),q=1/(1+d*.0015);return [centerX+(x*cy+z*sy)*scale*q,centerY+(d*sp-y*cp)*scale*q];};
 // Ground instruments are quiet spatial guides, not an invented HUD.
 for(let v=-130;v<=130;v+=26){
  line([project(v,-5,-126),project(v,-5,126)],'#142528',.7);
  line([project(-130,-5,v),project(130,-5,v)],'#142528',.7);
 }
 const front=-115+230*smooth((time-8)/3.8);
 if(time>=8){
  const sorted=[...cells].sort((a,b)=>depth(b.x,b.z)-depth(a.x,a.z));
  for(const cell of sorted){
   const alpha=smooth((front-cell.x)/9);if(!alpha)continue;
   const color=cell.shade;ctx.globalAlpha=alpha;
   ctx.fillStyle=`rgb(${Math.round(95+114*color)},${Math.round(93+109*color)},${Math.round(85+97*color)})`;
   ctx.beginPath();
   for(let j=0;j<8;j+=2){const x=cell.c[j],z=cell.c[j+1],p=project(x,terrain(x,z),z);j?ctx.lineTo(...p):ctx.moveTo(...p);}
   ctx.closePath();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.5;ctx.stroke();
  }
 }
 const cut=60*(1-smooth((time-4)/3.6))-3;
 const ghost=.22*smooth((time-16)/3.3);
 const reveal=-120+240*smooth(time/3.2);
 const sortedPoints=points.map(p=>[p,depth(p.x,p.z)]).sort((a,b)=>b[1]-a[1]);
 for(const [p] of sortedPoints){
  let alpha=time<4?smooth((reveal-p.x)/10):1;
  if(p.canopy)alpha*=Math.max(1-smooth((p.y-cut)/5),ghost);
  else if(time>=8)alpha*=1-smooth((front-p.x)/9);
  if(alpha<.015)continue;
  const s=project(p.x,p.y,p.z);
  ctx.globalAlpha=alpha*(p.canopy?.55+p.tone*.4:.55+p.tone*.35);
  const lum=p.tone*.6+clamp(p.y/65)*.4;
  ctx.fillStyle=p.canopy?`rgb(${Math.round(43+126*lum)},${Math.round(88+132*lum)},${Math.round(73+111*lum)})`:`rgb(${Math.round(142+53*lum)},${Math.round(130+52*lum)},${Math.round(106+50*lum)})`;
  const size=Math.max(.65,scale*.35);ctx.fillRect(s[0],s[1],size,size);
 }
 ctx.globalAlpha=1;
 if(time>4&&time<7.6&&cut>0){
  const corners=[[-110,-105],[110,-105],[110,105],[-110,105],[-110,-105]].map(([x,z])=>project(x,cut,z));
  ctx.fillStyle='#b5ffe30b';ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();
  line(corners,'#b3d9c36b',.8);
 }
 if(time>8&&time<11.8){
  const seam=[];for(let z=-105;z<=105;z+=2)seam.push(project(front,terrain(front,z)+.4,z));
  line(seam,'#d4fff0',1.5);
 }
 if(time>=12){
  const section=[];const end=-92+184*smooth((time-12)/1.4);
  for(let x=-92;x<=end;x+=2)section.push(project(x,terrain(x,8)+.65,8));
  line(section,'#ffb347',1.6);
  const a=project(-92,terrain(-92,8),8),b=project(92,terrain(92,8),8);
  ctx.fillStyle='#ffb347';for(const p of [a,b]){ctx.beginPath();ctx.arc(...p,2.4,0,Math.PI*2);ctx.fill();}
  const boxW=Math.min(width*.29,260),boxH=height*.20,bx=width-boxW-24,by=height*.19;
  ctx.globalAlpha=smooth((time-12.3)/.8);ctx.fillStyle='#080f12e8';ctx.fillRect(bx-10,by-15,boxW+18,boxH+38);
  ctx.font=`${Math.max(7,Math.min(10,width/120))}px Plex, monospace`;ctx.fillStyle='#c3d4c9';
  ctx.fillText(language==='zh'?'合成剖面 / 无量纲':'SYNTHETIC SECTION / UNITLESS',bx,by);
  const profile=[];for(let x=-92;x<=92;x+=2)profile.push([bx+(x+92)/184*boxW,by+boxH-terrain(x,8)/32*(boxH-12)]);
  line([[bx,by+boxH],[bx+boxW,by+boxH]],'#52605b',.7);line(profile,'#ffb347',1.3);
  ctx.globalAlpha=1;
 }
 // Small registration marks frame the study without adding data-like claims.
 for(const [x,y,dx,dy] of [[12,12,1,1],[width-12,12,-1,1],[12,height-12,1,-1],[width-12,height-12,-1,-1]])line([[x+8*dx,y],[x,y],[x,y+8*dy]],'#50625d',1);
 canvas.dataset.time=time.toFixed(2);document.querySelector('.viewport').classList.add('canvas-ready');
}
function resize(){
 const bounds=canvas.getBoundingClientRect();width=bounds.width;height=bounds.height;
 if(!ctx)return;
 const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw();
}
function stop(){playing=false;cancelAnimationFrame(request);request=0;sync();}
function tick(stamp){
 if(!playing)return;
 time=Math.min(duration,time+(stamp-lastStamp)/1000);lastStamp=stamp;sync();draw();
 if(time>=duration)stop();else request=requestAnimationFrame(tick);
}
$('#play').addEventListener('click',()=>{
 if(playing){stop();return;}if(!ctx||!visible||document.hidden)return;
 if(time>=duration)time=0;
 playing=true;lastStamp=performance.now();sync();request=requestAnimationFrame(tick);
});
$('#restart').addEventListener('click',()=>{stop();time=0;sync();draw();});
$('#seek').addEventListener('input',event=>{const next=Number(event.target.value);stop();time=clamp(next,0,duration);sync();draw();});
document.querySelectorAll('[data-chapter]').forEach(button=>button.addEventListener('click',()=>{stop();time=Number(button.dataset.chapter)*4+2;sync();draw();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)stop();},{threshold:.05}).observe(canvas);
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)stop();});
new ResizeObserver(resize).observe(canvas);
let saved='en';try{saved=localStorage.getItem('film-studio-language')||'en';}catch{}
const initial=new URLSearchParams(location.search).get('lang');
resize();setLanguage(['en','zh'].includes(initial)?initial:saved==='zh'?'zh':'en');
if(!ctx){$('#play').disabled=true;$('#restart').disabled=true;$('#seek').disabled=true;document.querySelectorAll('[data-chapter]').forEach(button=>button.disabled=true);}
