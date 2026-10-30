// The page describes a reusable style; film-specific details live in its Release bundle.
const key = 'film-studio-language';
const player = document.querySelector('video');
const revision = new URL(import.meta.url).searchParams.get('v');
const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
const localized = value => typeof value === 'string' ? value : value?.[language()] ?? value?.en ?? '';
const layerCaptions = {
  en: ['01 / A SETTING WITH DEPTH', '02 / A SUBJECT WITH A PURPOSE', '03 / LIGHT DIRECTS ATTENTION'],
  zh: ['01 / 用层次建立环境', '02 / 让主体承担动作', '03 / 用光感引导注意力'],
};
let phase = 2, chapters = [];
function storedLanguage() { try { return localStorage.getItem(key); } catch { return null; } }
function markChapter() {
  let active = -1;
  chapters.forEach((chapter, index) => { if (player.currentTime >= chapter.time) active = index; });
  document.querySelectorAll('[data-chapters] button').forEach((button, index) => {
    button.setAttribute('aria-current', String(index === active));
  });
}
function renderChapters() {
  const nav = document.querySelector('[data-chapters]');
  nav.replaceChildren();
  for (const chapter of chapters) {
    const button = document.createElement('button'); button.type = 'button';
    const time = document.createElement('b');
    time.textContent = `${Math.floor(chapter.time / 60)}:${String(Math.floor(chapter.time % 60)).padStart(2, '0')}`;
    const title = document.createElement('span'); title.textContent = localized(chapter.label);
    button.append(time, title);
    button.addEventListener('click', () => {
      player.currentTime = chapter.time;
      player.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      markChapter();
    });
    nav.append(button);
  }
  markChapter();
}
function setLanguage(next) {
  document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
  document.title = next === 'zh' ? '明彩世界 — Codex Film Studio' : 'Luminous Worlds — Codex Film Studio';
  document.querySelectorAll('[data-en]').forEach(node => { node.textContent = next === 'zh' ? node.dataset.zh : node.dataset.en; });
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === next)));
  document.querySelectorAll('[data-home]').forEach(link => { const url = new URL(link.href); url.searchParams.set('lang', next); link.href = url.href; });
  const url = new URL(location.href); url.searchParams.set('lang', next); history.replaceState(null, '', url);
  try { localStorage.setItem(key, next); } catch {}
  document.querySelector('[data-layer-caption]').textContent = layerCaptions[next][phase];
  renderChapters();
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
const requested = new URLSearchParams(location.search).get('lang');
setLanguage(['en', 'zh'].includes(requested) ? requested : storedLanguage() === 'zh' ? 'zh' : 'en');
document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
  phase = Number(button.dataset.layer);
  document.querySelector('.layer-canvas').dataset.phase = String(phase);
  document.querySelectorAll('[data-layer]').forEach(node => node.setAttribute('aria-pressed', String(Number(node.dataset.layer) === phase)));
  document.querySelector('[data-layer-caption]').textContent = layerCaptions[language()][phase];
}));
player.addEventListener('timeupdate', markChapter);
const assetURL = path => { const url = new URL(path, location.href); if (revision) url.searchParams.set('v', revision); return url; };
const sharedPlayer = new URL('../../../catalog/film-screening.mjs', import.meta.url);
if (revision) sharedPlayer.searchParams.set('v', revision);
await import(sharedPlayer.href);
try {
  const response = await fetch(assetURL('media/films.json'));
  if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
  const data = await response.json(); chapters = data.films?.[0]?.chapters ?? []; renderChapters();
  const responseText = await fetch(assetURL('media/transcript.json'));
  if (!responseText.ok) throw new Error(`Transcript HTTP ${responseText.status}`);
  const rows = await responseText.json();
  const box = document.querySelector('[data-transcript]');
  rows.forEach(row => { const paragraph = document.createElement('p'); paragraph.textContent = row.text; box.append(paragraph); });
} catch (error) {
  if (!chapters.length) document.querySelector('[data-chapters]').hidden = true;
  document.querySelector('.transcript').hidden = true;
  console.warn('Optional film details unavailable', error);
}
