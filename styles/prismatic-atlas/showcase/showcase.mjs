const sharedPlayer=new URL('../../../catalog/film-screening.mjs',import.meta.url);
const moduleRevision=new URL(import.meta.url).searchParams.get('v');if(moduleRevision)sharedPlayer.searchParams.set('v',moduleRevision);
await import(sharedPlayer.href);
const key='film-studio-language', player=document.querySelector('video');
const lang=()=>document.documentElement.lang.startsWith('zh')?'zh':'en';
const copy=v=>v?.[lang()]??v?.en??v;
let chapters=[], phase=0;
const captions={en:['01 / ESTABLISH THE WORLD','02 / REVEAL THE MECHANISM','03 / INSPECT THE DETAIL'],zh:['01 / 建立世界','02 / 揭示机制','03 / 查看细节']};
function stored(){try{return localStorage.getItem(key)}catch{return null}}
function renderChapters(){
 const nav=document.querySelector('[data-chapters]');nav.replaceChildren();
 chapters.forEach(c=>{const b=document.createElement('button');b.type='button';const time=document.createElement('b');time.textContent=`${Math.floor(c.time/60)}:${String(Math.floor(c.time%60)).padStart(2,'0')}`;const label=document.createElement('span');label.textContent=copy(c.label);b.append(time,label);b.addEventListener('click',()=>{player.currentTime=c.time;player.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});nav.append(b)});
}
function setLanguage(next){
 document.documentElement.lang=next==='zh'?'zh-CN':'en';
 document.title=next==='zh'?'棱彩图谱 — Codex Film Studio':'Prismatic Atlas — Codex Film Studio';
 document.querySelectorAll('[data-en]').forEach(n=>n.textContent=next==='zh'?n.dataset.zh:n.dataset.en);
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===next)));
 document.querySelectorAll('[data-home]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('lang',next);a.href=u.href});
 const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);
 try{localStorage.setItem(key,next)}catch{}
 document.querySelector('[data-scale-caption]').textContent=captions[next][phase];renderChapters();
}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
const requested=new URLSearchParams(location.search).get('lang');setLanguage(['en','zh'].includes(requested)?requested:stored()==='zh'?'zh':'en');
document.querySelectorAll('[data-scale]').forEach(b=>b.addEventListener('click',()=>{phase=Number(b.dataset.scale);document.querySelector('.scale-canvas').dataset.phase=String(phase);document.querySelectorAll('[data-scale]').forEach(n=>n.setAttribute('aria-pressed',String(Number(n.dataset.scale)===phase)));document.querySelector('[data-scale-caption]').textContent=captions[lang()][phase]}));
try{
 const revision=new URL(import.meta.url).searchParams.get('v');const url=new URL('media/films.json',location.href);if(revision)url.searchParams.set('v',revision);
 const response=await fetch(url);if(!response.ok)throw new Error(response.status);const data=await response.json();chapters=data.films?.[0]?.chapters??[];renderChapters();
 const transcriptURL=new URL('media/transcript.json',location.href);if(revision)transcriptURL.searchParams.set('v',revision);
 const transcript=await fetch(transcriptURL);if(!transcript.ok)throw new Error(transcript.status);const rows=await transcript.json();const box=document.querySelector('[data-transcript]');rows.forEach(s=>{const p=document.createElement('p');p.textContent=s.text;box.append(p)});
}catch(e){document.querySelector('[data-chapters]').hidden=true;document.querySelector('.transcript').hidden=true;console.warn('Optional film details unavailable',e)}
