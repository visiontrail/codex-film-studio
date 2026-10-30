const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const player = document.querySelector('video');
const chapterNav = document.querySelector('[data-chapters]');
const lab = document.querySelector('.holo-lab');
const modeStatus = {scan:['SCAN / READY','扫描 / 就绪'],lock:['TARGET / LOCKED','目标 / 已锁定'],explode:['ASSEMBLY / OPEN','组件 / 已展开']};
let chapters = [], scanAnimation;
function renderMode() {
  document.querySelector('#lab-status').textContent = modeStatus[lab.dataset.state][language() === 'zh' ? 1 : 0];
}
function updateChapter() {
  const index = chapters.findLastIndex(chapter => player.currentTime >= chapter.time);
  [...chapterNav.children].forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
}
function renderChapters() {
  chapterNav.replaceChildren();
  chapters.forEach(chapter => {
    const button = document.createElement('button'); button.type = 'button';
    const time = document.createElement('b'); time.textContent = `${Math.floor(chapter.time / 60)}:${String(chapter.time % 60).padStart(2,'0')}`;
    const label = document.createElement('span'); label.textContent = chapter.label[language()] ?? chapter.label.en;
    button.append(time, label);
    button.addEventListener('click', () => {
      if (player.readyState >= 1) player.currentTime = chapter.time;
      else player.addEventListener('loadedmetadata', () => { player.currentTime = chapter.time; }, {once:true});
      player.scrollIntoView({block:'center', behavior:reducedMotion() ? 'auto' : 'smooth'});
    });
    chapterNav.append(button);
  });
  updateChapter();
}
function setLanguage(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en]').forEach(node => { node.textContent = lang === 'zh' ? node.dataset.zh : node.dataset.en; });
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
  document.querySelectorAll('[data-home]').forEach(link => { const url = new URL(link.href); url.searchParams.set('lang',lang); link.href = url.href; });
  const url = new URL(location.href); url.searchParams.set('lang',lang); history.replaceState(null,'',url);
  try { localStorage.setItem('film-studio-language',lang); } catch { /* Optional preference. */ }
  chapterNav.setAttribute('aria-label',lang === 'zh' ? '影片章节' : 'Film chapters');
  renderChapters(); renderMode();
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
let stored; try { stored = localStorage.getItem('film-studio-language'); } catch { /* Default to English. */ }
const requested = new URLSearchParams(location.search).get('lang');
setLanguage(['en','zh'].includes(requested) ? requested : stored === 'zh' ? 'zh' : 'en');
player.addEventListener('timeupdate',updateChapter);
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  scanAnimation?.cancel();
  lab.dataset.state = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
  renderMode();
  if (button.dataset.mode === 'scan' && !reducedMotion()) {
    scanAnimation = lab.querySelector('.scan-plane').animate([
      {opacity:0,transform:'translateY(-65px)'}, {opacity:.75,offset:.12},
      {opacity:.6,offset:.85}, {opacity:0,transform:'translateY(200px)'}
    ], {duration:1500,easing:'ease-in-out'});
  }
}));
// Pause the finite study animation when it cannot be seen.
document.addEventListener('visibilitychange', () => { if (document.hidden) scanAnimation?.cancel(); });
const revision = new URL(import.meta.url).searchParams.get('v');
function mediaURL(name) { const url = new URL(`media/${name}`,location.href); if (revision) url.searchParams.set('v',revision); return url; }
try {
  const response = await fetch(mediaURL('films.json'));
  if (!response.ok) throw new Error(`Chapters HTTP ${response.status}`);
  const manifest = await response.json(); chapters = manifest.films?.[0]?.chapters ?? [];
  renderChapters();
} catch (error) { chapterNav.hidden = true; document.querySelector('.chapter-heading').hidden = true; console.error(error); }
try {
  const response = await fetch(mediaURL('transcript.json'));
  if (!response.ok) throw new Error(`Transcript HTTP ${response.status}`);
  const rows = await response.json();
  const container = document.querySelector('[data-transcript]');
  rows.forEach(row => { const p = document.createElement('p'); p.textContent = row.text; container.append(p); });
} catch (error) { document.querySelector('.transcript').hidden = true; console.error(error); }
