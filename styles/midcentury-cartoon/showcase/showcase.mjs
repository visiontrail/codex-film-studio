const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const originals = new Map($$('[data-zh]').map(node => [node, node.innerHTML]));
const labels = new Map($$('[data-aria-zh]').map(node => [node, node.getAttribute('aria-label')]));
const film = $('#film-player');
const clock = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '—';
let language = 'en', edition = 'short', chapterData = [], mediaRequest = 0, copyMessage = '';
let studyTime = 0, studyPlaying = false, printOffset = true, animation = 0, lastTick = 0;
const text = (en, zh) => language === 'zh' ? zh : en;
const chapterNames = ['完成的作业', '研究测量了什么', '为什么顺畅不等于学会', 'Ada 自己掌握的一课', '迁移与隔一段时间再试', '数学之外', '下一次学习'];

function setLanguage(next) {
  language = next === 'zh' ? 'zh' : 'en';
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = text('Mid-century Cartoon — Codex Film Studio', '50 年代平涂卡通 Mid-century Cartoon — Codex Film Studio');
  for (const [node, original] of originals) {
    if (language === 'zh') node.textContent = node.dataset.zh;
    else node.innerHTML = original;
  }
  for (const [node, original] of labels) node.setAttribute('aria-label', language === 'zh' ? node.dataset.ariaZh : original);
  $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed', button.dataset.lang === language));
  $$('[data-home], [data-language-link]').forEach(link => {
    const url = new URL(link.href); url.searchParams.set('lang', language); link.href = url.href;
  });
  try { localStorage.setItem('codex-film-language', language); } catch {}
  const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url);
  $('#copy-status').textContent = '';
  renderChapters(); updateFilm(); renderStudy(); updatePrint();
}
$$('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));

function updateFilm() {
  $('#play-film').textContent = film.paused ? text('▶ Play film', '▶ 播放影片') : text('Ⅱ Pause film', 'Ⅱ 暂停影片');
  $('#film-time').textContent = `${clock(film.currentTime)} / ${clock(film.duration)}`;
  $('#film-error').textContent = text('The film could not be played. Try the MP4 download or reopen this page.', '影片暂时无法播放，请尝试下载 MP4 或重新打开页面。');
  const active = chapterData.findLastIndex(chapter => film.currentTime >= chapter.seconds);
  $$('#chapters button').forEach((button, i) => button.setAttribute('aria-current', i === active));
}
async function playFilm() {
  pauseStudy();
  try { await film.play(); $('#film-error').hidden = true; }
  catch { $('#film-error').hidden = false; updateFilm(); }
}
$('#play-film').addEventListener('click', () => film.paused ? playFilm() : film.pause());
$('#restart-film').addEventListener('click', () => { film.currentTime = 0; playFilm(); });
['loadedmetadata', 'timeupdate', 'play', 'pause', 'ended'].forEach(event => film.addEventListener(event, updateFilm));
film.addEventListener('error', () => { $('#film-error').hidden = false; updateFilm(); });
film.addEventListener('play', pauseStudy);
function renderChapters() {
  $('#chapters').replaceChildren();
  $('#chapters').hidden = !chapterData.length;
  chapterData.forEach((chapter, index) => {
    const button = document.createElement('button'); button.type = 'button';
    const time = document.createElement('time'); time.textContent = clock(chapter.seconds);
    const title = document.createElement('span'); title.textContent = language === 'zh' ? chapterNames[index] || chapter.title : chapter.title;
    button.append(time, title);
    button.addEventListener('click', () => { film.currentTime = chapter.seconds; playFilm(); });
    $('#chapters').append(button);
  });
  updateFilm();
}
async function loadChapters(root) {
  const request = ++mediaRequest;
  chapterData = []; renderChapters();
  if (edition !== 'long') return;
  try {
    const response = await fetch(`${root}content/timeline.json`);
    if (!response.ok) throw new Error('Timeline unavailable');
    const timeline = await response.json();
    if (request !== mediaRequest) return;
    chapterData = (timeline.chapters || []).filter(chapter => Number.isFinite(chapter.seconds) && chapter.seconds >= 0);
    renderChapters();
  } catch { /* Native seeking remains available if chapter data cannot load. */ }
}
function selectEdition(button) {
  if (edition === button.dataset.edition) return;
  film.pause(); edition = button.dataset.edition;
  const root = button.dataset.root;
  $$('[data-edition]').forEach(item => item.setAttribute('aria-pressed', item === button));
  $('#film-error').hidden = true;
  film.poster = root + button.dataset.poster;
  film.querySelector('source').src = root + button.dataset.video;
  film.querySelector('track').src = `${root}media/narration.en.vtt`;
  $('#download-film').href = root + button.dataset.video;
  $('#download-captions').href = `${root}media/narration.en.srt`;
  $('#film-credits').href = `${root}CREDITS.md`;
  film.load(); updateFilm(); loadChapters(root);
  const url = new URL(location.href); url.searchParams.set('edition', edition); history.replaceState(null, '', url);
}
$$('[data-edition]').forEach(button => button.addEventListener('click', () => selectEdition(button)));

const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
function renderStudy() {
  // Character holds update on twos on a 24 fps clock. Seeking is deterministic.
  const t = Math.floor(studyTime * 12) / 12;
  const reach = ease((t - .5) / 1.9) * (1 - ease((t - 3.4) / 1.8));
  const press = ease((t - 2.4) / .3) * (1 - ease((t - 3.1) / .3));
  const x = 420 + 95 * reach, y = 287 + 12 * reach + 6 * press;
  $('#hand').setAttribute('transform', `translate(${x} ${y})`);
  $('#forearm').setAttribute('d', `M359 270 ${390 + 25 * reach} ${289 + 8 * reach} ${x} ${y} ${x} ${y + 18} ${384 + 25 * reach} ${311 + 8 * reach} 342 293Z`);
  $('#switch').setAttribute('transform', `translate(0 ${6 * press})`);
  $('#lamp-light').setAttribute('opacity', t >= 2.67 ? '1' : '0');
  const phase = t < 2.4 ? 0 : t < 3.4 ? 1 : t < 6 ? 2 : 3;
  const captions = [text('A little anticipation.', '先给动作一点准备。'), text('The hand meets the switch.', '手指碰到真正的开关。'), text('Now, a bright idea.', '看见动作带来的结果。'), text('Let the idea settle.', '停一停，让结果被看清。')];
  $('#drawing-caption').textContent = captions[phase];
  $('#drawing-description').textContent = text('An original geometric cartoon figure reaches across a table and presses a switch to light a lamp. Flat colour sits slightly outside the ink.', '一个原创几何卡通人物伸手按下桌上的开关，点亮台灯。平涂色块与墨线轻微错位。');
  $$('[data-time]').forEach((button, index) => button.setAttribute('aria-pressed', index === phase));
  $('#study-scrub').value = studyTime;
  $('#study-time').textContent = `${studyTime.toFixed(1)} / 8 s`;
  $('#study-play').textContent = studyPlaying ? text('Ⅱ Pause action', 'Ⅱ 暂停动作') : studyTime >= 8 ? text('↺ Play again', '↺ 再看一次') : text('▶ Play the action', '▶ 播放动作');
  $('#drawing').style.setProperty('--offset-x', `${4 + Math.sin(Math.floor(t * 12) * 1.7) * .6}px`);
  $('#drawing').style.setProperty('--offset-y', `${3 + Math.cos(Math.floor(t * 12) * 1.3) * .4}px`);
}
function pauseStudy() { studyPlaying = false; cancelAnimationFrame(animation); renderStudy(); }
function tick(now) {
  if (!studyPlaying) return;
  studyTime = Math.min(8, studyTime + Math.max(0, (now - lastTick) / 1000)); lastTick = now;
  if (studyTime >= 8) studyPlaying = false;
  renderStudy();
  if (studyPlaying) animation = requestAnimationFrame(tick);
}
$('#study-play').addEventListener('click', () => {
  if (studyPlaying) { pauseStudy(); return; }
  film.pause(); if (studyTime >= 8) studyTime = 0;
  studyPlaying = true; lastTick = performance.now(); renderStudy(); animation = requestAnimationFrame(tick);
});
$('#study-restart').addEventListener('click', () => { studyTime = 0; pauseStudy(); });
$('#study-scrub').addEventListener('input', event => { studyTime = Number(event.target.value); pauseStudy(); });
$$('[data-time]').forEach(button => button.addEventListener('click', () => { studyTime = Number(button.dataset.time); pauseStudy(); }));
function updatePrint() {
  document.body.classList.toggle('registration-off', !printOffset);
  $('#print-toggle').setAttribute('aria-pressed', printOffset);
  $('#print-toggle').textContent = printOffset ? text('Print offset: on', '套色偏移：开') : text('Print offset: off', '套色偏移：关');
}
$('#print-toggle').addEventListener('click', () => { printOffset = !printOffset; updatePrint(); });
new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pauseStudy(); }, {threshold: .15}).observe($('#study'));
document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseStudy(); film.pause(); } });

async function copy(selector) {
  try {
    await navigator.clipboard.writeText($(selector).textContent.trim());
    copyMessage = text('Copied. Ready for your next film.', '已复制，可以开始你的下一部影片。');
  } catch {
    const range = document.createRange(); range.selectNodeContents($(selector));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    copyMessage = text('Text selected. Press ⌘C or Ctrl+C to copy.', '文字已选中，请按 ⌘C 或 Ctrl+C 复制。');
  }
  $('#copy-status').textContent = copyMessage;
}
$('#copy-prompt').addEventListener('click', () => copy('#creative-prompt'));
let saved = 'en'; try { saved = localStorage.getItem('codex-film-language') || 'en'; } catch {}
setLanguage(new URL(location.href).searchParams.get('lang') || saved);
if (new URL(location.href).searchParams.get('edition') === 'long') selectEdition($('[data-edition="long"]'));
