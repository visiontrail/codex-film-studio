import {drawPerformance} from './performance.mjs';

const $ = selector => document.querySelector(selector);
const film = $('#film');
const canvas = $('#acting');
let language = 'en';
let seconds = 0, playing = false, animation = 0, previousTime = 0, lastFrame = -1;
let filmError = false, shotError = false;
const say = (en, zh) => language === 'zh' ? zh : en;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const filmPlayText = () => $('#play-film').textContent = film.paused ? say('▶ Play the film','▶ 播放成片') : say('Ⅱ Pause film','Ⅱ 暂停影片');
function initialLanguage() {
  const query = new URL(location.href).searchParams.get('lang');
  if (['en','zh'].includes(query)) return query;
  try { return localStorage.getItem('film-studio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; }
}
function setLanguage(next, updateURL = true) {
  language = next === 'zh' ? 'zh' : 'en';
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = say('Sci-Fi Sitcom Toon — Codex Film Studio','科幻情景喜剧卡通 — Codex Film Studio');
  document.querySelectorAll('[data-en][data-zh]').forEach(node => node.innerHTML = node.dataset[language]);
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.lang === language)));
  document.querySelectorAll('[data-home],[data-local]').forEach(link => {
    const url = new URL(link.getAttribute('href'),location.href);
    url.searchParams.set('lang',language);
    link.href = url.href;
  });
  $('#copy-status').textContent = '';
  if (shotError) $('#shot').options[0].textContent = say('Shot list unavailable','镜头列表暂不可用');
  if (filmError) showFilmError();
  filmPlayText();
  updateStudy();
  try { localStorage.setItem('film-studio-language',language); } catch { /* Storage is optional. */ }
  if (updateURL) { const url = new URL(location.href); url.searchParams.set('lang',language); history.replaceState(null,'',url); }
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click',()=>setLanguage(button.dataset.lang)));

function showFilmError() {
  filmError = true;
  $('#film-status').hidden = false;
  $('#film-status').textContent = say('The film could not load. Try the MP4 download, or reload the page.','影片未能载入，请尝试下载 MP4，或刷新页面。');
}
$('#play-film').addEventListener('click',async()=>{
  if (!film.paused) return film.pause();
  try { await film.play(); $('#film-status').hidden=true; filmError=false; } catch { showFilmError(); }
});
for(const event of ['play','pause','ended']) film.addEventListener(event,filmPlayText);
film.addEventListener('play',()=>setPlaying(false));
film.addEventListener('error',showFilmError);
if (film.error) showFilmError();

function timestamp(value) { const whole = Math.floor(value); return `${Math.floor(whole/60).toString().padStart(2,'0')}:${(whole%60).toString().padStart(2,'0')}`; }
async function loadShots() {
  try {
    const response=await fetch('/_projects/scifi-review/content/timeline.json');
    if(!response.ok) throw new Error(`Timeline ${response.status}`);
    const data=await response.json();
    const shots=data.shots.filter(shot=>Number.isFinite(shot.start)&&shot.start>=0);
    if(!shots.length) throw new Error('Empty timeline');
    const select=$('#shot');
    select.replaceChildren(...shots.map(shot=>{
      const option=document.createElement('option');
      option.value=shot.start/24;
      option.textContent=`${timestamp(shot.start/24)} · ${shot.id} · ${shot.world ?? shot.kind ?? ''}`;
      return option;
    }));
    select.disabled=false;
    select.addEventListener('change',()=>{
      film.pause();
      const seek=()=>{film.currentTime=Math.min(Number(select.value),film.duration || Infinity);};
      if(film.readyState>=1) seek(); else film.addEventListener('loadedmetadata',seek,{once:true});
    });
  } catch {
    shotError=true;
    $('#shot').options[0].textContent=say('Shot list unavailable','镜头列表暂不可用');
  }
}

function updateStudy() {
  drawPerformance(canvas,seconds);
  $('#study-time').value=Math.round(seconds*24);
  $('#study-time').setAttribute('aria-valuetext',say(`${seconds.toFixed(1)} of 6 seconds`,`${seconds.toFixed(1)} 秒，共 6 秒`));
  $('#study-clock').textContent=`${seconds.toFixed(1).padStart(4,'0')} / 06.0`;
  const index=seconds<2?0:seconds<4?1:2;
  $('#reaction-label').textContent=[say('ALL GOOD.','一切正常。'),say('WAIT. WHAT?','等一下，啥？'),say('ABSOLUTELY NOT!','这不对劲！')][index];
  document.querySelectorAll('[data-beat]').forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
  const button=$('#play-study');
  button.textContent=playing?say('Ⅱ Pause reactions','Ⅱ 暂停演示'):seconds>=6?say('↻ Replay reactions','↻ 重播演示'):say('▶ Play the reactions','▶ 播放表情演示');
  button.setAttribute('aria-pressed',String(playing));
}
function tick(now) {
  if(!playing)return;
  if(previousTime)seconds=Math.min(6,seconds+(now-previousTime)/1000);
  previousTime=now;
  const frame=Math.floor(seconds*24);
  if(frame!==lastFrame){lastFrame=frame;updateStudy();}
  if(seconds>=6){setPlaying(false);return;}
  animation=requestAnimationFrame(tick);
}
function setPlaying(value) {
  playing=value;
  cancelAnimationFrame(animation);
  if(playing){if(seconds>=6)seconds=0;previousTime=0;lastFrame=-1;animation=requestAnimationFrame(tick);}
  updateStudy();
}
$('#play-study').addEventListener('click',()=>setPlaying(!playing));
$('#restart-study').addEventListener('click',()=>{seconds=0;setPlaying(false);});
$('#study-time').addEventListener('input',event=>{seconds=Math.max(0,Math.min(6,Number(event.target.value)/24));setPlaying(false);});
document.querySelectorAll('[data-beat]').forEach(button=>button.addEventListener('click',()=>{seconds=Number(button.dataset.beat);setPlaying(false);}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)setPlaying(false);},{threshold:.1}).observe($('#acting-lab'));
reducedMotion.addEventListener('change',()=>setPlaying(false));

for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{
  const source=document.getElementById(button.dataset.copy);
  try { await navigator.clipboard.writeText(source.textContent.trim()); $('#copy-status').textContent=say('Copied. Ready for your next film.','已复制，可以开始你的新片了。'); }
  catch {
    const range=document.createRange();range.selectNodeContents(source);
    const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
    $('#copy-status').textContent=say('Text selected. Use your device’s Copy command.','文本已选中，请使用设备的复制命令。');
  }
});
setLanguage(initialLanguage(),false);
loadShots();
