const REPO = 'https://github.com/visiontrail/codex-film-studio';
const SITE = 'https://visiontrail.github.io/codex-film-studio/';
const copy = {
  en: {
    skip:'Skip to the style library', styles:'Styles', watch:'Screening room', create:'Create a film',
    heroEyebrow:'A COLLECTION OF VISUAL POSSIBILITIES', heroLine1:'One story.', heroLine2:'So many ways.',
    heroDescription:'A little ink. A cut of paper. A whole new world.<br>Find a visual language, then make it your own.',
    explore:'Explore the styles', watchSample:'Watch a sample', signature:'DRAWN WITH INTENTION. DIRECTED WITH CODEX.',
    heroCaption:'Different materials. A shared imagination.', originalArtwork:'ORIGINAL STYLE STUDY', collection:'THE STYLE COLLECTION',
    libraryEyebrow:'THE COLLECTION', libraryTitle:'Find your visual language.', all:'All styles', drawn:'Hand-drawn',
    animation:'Animation', material:'Paper & texture', geography:'Geography', search:'Find a style', loading:'Opening the collection…',
    collectionNote:'A style is a starting point. Each includes its own visual rules and tools; sample films and package readiness are listed separately.',
    compare:'Compare capabilities', screeningEyebrow:'FROM THE STUDIO', screeningTitle:'Ideas, in motion.',
    screeningAside:'Watch the films. Explore what made them.', publishedFilm:'PUBLISHED FILM',
    filmTitle:'Does AI help you learn—<br>or just finish?', filmDescription:'A continuous board. A moving marker. An argument that builds, one drawing at a time.',
    shortFilm:'3-minute film', longFilm:'12-minute film', filmSubtitle:'English narration · Subtitles & chapters',
    moreFromStudio:'More from the studio', localLabel:'LOCAL SHOWCASES',
    createEyebrow:'YOUR TURN IN THE DIRECTOR’S CHAIR', createLine1:'Bring the story.', createLine2:'Make it yours.',
    createDescription:'Choose a visual language. Bring your subject, audience and point of view. Build picture, voice and sound on one shared timeline.',
    readGuide:'Read the getting-started guide', step1Title:'Find a style that fits.', step1Text:'Explore its materials, movement and storytelling rules.',
    browseCollection:'Browse the collection ↑', step2Title:'Give your film its own space.', step2Text:'From the repository, create an independent project.',
    step3Title:'Direct it with Codex.', step3Text:'Bring your brief into the new project. Write, draw, animate, listen and refine.',
    copy:'Copy', copied:'Command copied', copyFailed:'Select and copy the command below.', footerTagline:'A visual language for your next film.',
    source:'Source & documentation ↗', previewCredits:'Preview credits ↗', inspiration:'With inspiration from', noResults:'No styles match. Try another name or category.',
    sketch:'STYLE STUDY', frame:'FILM FRAME', previewMissing:'Preview to come', available:'Available locally', localOnly:'Local project',
    publicSample:'Watch the sample', noFilm:'No player yet', localPages:'Local showcase', guide:'Style guide', prompt:'Style prompt', files:'Project files',
    openPages:'Films & showcase pages', startStyle:'Create in this style', localHelp:'These pages read media from retained production projects. To open them on your machine, run:',
    missingProject:'The retained project is unavailable on this machine.', noShowcase:'A film page is not available for this style yet. Explore the guide and tools to create your own.',
    loadFailed:'The collection could not be loaded. Reload the page or open the style guide.',
    publicNote:'Local films and review pages open from the studio on your machine. Run from the repository:',
    localNote:'Local showcases use retained project files. Availability is checked on this machine. A preview frame does not mean the complete film is published.',
    previous:'Previous showcases', next:'Next showcases', close:'Close style details', copyCommand:'Copy project command', filterLabel:'Filter styles',
    whiteboard:'Short and long published samples', 'crayon-film':'Leo the Farmer', 'crayon-comparison':'Frame comparison',
    'midcentury-short':'Short film', 'midcentury-long':'Long film', 'midcentury-motion':'Long-film motion review',
    'satellite-film':'Singapore film', 'satellite-composition':'Live composition', 'satellite-comparison':'Frame comparison', 'scifi-review':'The House Gets Coffee',
  },
  zh: {
    skip:'跳转到风格片库', styles:'风格片库', watch:'放映室', create:'开始创作',
    heroEyebrow:'让每个故事，找到自己的画面', heroLine1:'一个故事。', heroLine2:'不止一种可能。',
    heroDescription:'几笔墨线，一叠纸张，一个全新的世界。<br>找到喜欢的视觉语言，拍出自己的故事。',
    explore:'探索全部风格', watchSample:'观看样片', signature:'用心构思画面，与 CODEX 一起执导。',
    heroCaption:'不同的材质，同样自由的想象。', originalArtwork:'原创风格示意', collection:'风格片库',
    libraryEyebrow:'风格片库', libraryTitle:'故事，从喜欢的画风开始。', all:'全部风格', drawn:'手绘',
    animation:'动画', material:'纸材与纹理', geography:'地理影像', search:'搜索风格', loading:'正在打开风格片库…',
    collectionNote:'每种风格都是一个起点，包含各自的视觉规则和工具。可复用内容的完成状态与已有样片分别标注。',
    compare:'比较各风格能力', screeningEyebrow:'工作室出品', screeningTitle:'让想法，动起来。',
    screeningAside:'看看影片，也看看它们如何被创作。', publishedFilm:'已发布影片',
    filmTitle:'AI 帮你学会了，<br>还是只是做完了？', filmDescription:'一块持续保留内容的白板，一支移动的笔。让论证随着画面，一步步展开。',
    shortFilm:'三分钟版', longFilm:'十二分钟完整版', filmSubtitle:'英语旁白 · 字幕与章节',
    moreFromStudio:'更多工作室作品', localLabel:'本地展示',
    createEyebrow:'这一次，由你执导', createLine1:'带上你的故事。', createLine2:'拍出你的表达。',
    createDescription:'选一种视觉语言，带上主题、观众与观点。在同一条时间轴上，编排画面、旁白与声音。',
    readGuide:'阅读创作入门指南', step1Title:'选一种适合的画风。', step1Text:'了解它的材质、运动与叙事规则。',
    browseCollection:'浏览风格片库 ↑', step2Title:'为影片建立独立的空间。', step2Text:'在仓库根目录运行命令，创建独立项目。',
    step3Title:'与 Codex 一起执导。', step3Text:'在新项目中提供创作要求，编写、绘制、制作动画，试听并打磨。',
    copy:'复制', copied:'命令已复制', copyFailed:'请选择下方命令并复制。', footerTagline:'为下一个故事，找到自己的视觉语言。',
    source:'源码与文档 ↗', previewCredits:'预览素材署名 ↗', inspiration:'灵感参考', noResults:'没有匹配的风格，试试其他名称或分类。',
    sketch:'风格示意', frame:'样片剧照', previewMissing:'预览待补充', available:'本机可用', localOnly:'本地项目',
    publicSample:'可观看样片', noFilm:'暂无播放器', localPages:'本地展示页', guide:'风格说明', prompt:'风格提示词', files:'创作工程',
    openPages:'影片与展示页面', startStyle:'用这个风格创作', localHelp:'这些页面从保留的制作项目中读取影片素材。请在本机运行：',
    missingProject:'本机暂未找到保留的项目文件。', noShowcase:'这个风格尚未提供可打开的影片页面，可以从说明和工具开始创作。',
    loadFailed:'风格目录暂时无法加载，请刷新页面，或前往风格说明。',
    publicNote:'本地影片与审阅页面需要在自己的电脑中打开。请在仓库根目录运行：',
    localNote:'本地展示读取保留项目的文件，可用状态根据本机文件检查。展示剧照不代表完整影片已发布。',
    previous:'上一组展示', next:'下一组展示', close:'关闭风格详情', copyCommand:'复制项目创建命令', filterLabel:'筛选风格',
    whiteboard:'短版与长版发布样片', 'crayon-film':'农夫 Leo', 'crayon-comparison':'逐帧对照',
    'midcentury-short':'短片', 'midcentury-long':'长片', 'midcentury-motion':'长片运动审阅',
    'satellite-film':'新加坡影片', 'satellite-composition':'实时构图', 'satellite-comparison':'逐帧对照', 'scifi-review':'The House Gets Coffee',
  },
};

// Categories are presentation metadata; paths, readiness and showcases come from styles.json.
const categories = {
  whiteboard:['drawn'], 'art-collage':['material'], 'crayon-book':['drawn','material'],
  'midcentury-cartoon':['animation','drawn'], 'satellite-briefing':['geography'], 'scifi-sitcom':['animation'],
};
const state = { catalog:null, frames:{}, availability:{mode:'public', pages:{}}, language:'en', filter:'all', query:'', detail:null };
const $ = selector => document.querySelector(selector);
const t = key => copy[state.language][key] ?? copy.en[key] ?? key;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localized = (entry, field) => state.language === 'zh' ? entry[`${field}_zh`] ?? entry[field] : entry[field];
const repoLink = path => `${REPO}/blob/main/${path.split('/').map(encodeURIComponent).join('/')}`;
const commandFor = id => `python3 scripts/new_film.py my-film --style ${id}`;
const pageTitle = page => t(page.id) === page.id ? page.title : t(page.id);
const isAvailable = page => page.access === 'release' || state.availability.pages[page.id] === true;
function pageURL(page, edition) {
  const usePublicSample = page.access === 'release' && state.availability.mode === 'local' && state.availability.pages[page.id] === false;
  const url = usePublicSample ? new URL(SITE) : new URL(page.page, new URL('./',location.href));
  url.searchParams.set('lang', state.language);
  if (edition) url.searchParams.set('edition', edition);
  return url.href;
}
function preview(entry, eager = false) {
  const path = state.frames[entry.id] ?? localized(entry,'preview') ?? entry.poster;
  return path ? `<img src="${escape(path)}" alt="${escape(localized(entry,'name'))} — ${escape(t(entry.preview_kind === 'frame' ? 'frame' : 'sketch'))}" loading="${eager ? 'eager' : 'lazy'}">` : `<div class="preview-placeholder">${t('previewMissing')}</div>`;
}
function readPreference() {
  const query = new URLSearchParams(location.search).get('lang');
  if (['en','zh'].includes(query)) return query;
  try { return localStorage.getItem('film-studio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; }
}
function setLanguage(language) {
  state.language = language;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? 'Codex Film Studio — 故事，不止一种可能。' : 'Codex Film Studio — Stories take shape.';
  document.querySelectorAll('[data-i18n]').forEach(node => { node.innerHTML = t(node.dataset.i18n); });
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', button.dataset.language === language));
  const search = $('#style-search');
  search.placeholder = t('search'); search.setAttribute('aria-label',t('search'));
  $('.filters').setAttribute('aria-label',t('filterLabel'));
  $('#shelf-prev').setAttribute('aria-label',t('previous')); $('#shelf-next').setAttribute('aria-label',t('next'));
  $('.dialog-close').setAttribute('aria-label',t('close')); $('#copy-starter').setAttribute('aria-label',t('copyCommand'));
  try { localStorage.setItem('film-studio-language',language); } catch { /* Private browsing can disable storage. */ }
  const url = new URL(location.href); url.searchParams.set('lang',language); history.replaceState(null,'',url);
  if (state.catalog) { renderStyles(); renderScreening(); if (state.detail) renderDetail(); }
}
function renderStyles() {
  if (!state.catalog) return;
  const entries = state.catalog.styles.filter(entry => {
    const matchesCategory = state.filter === 'all' || categories[entry.id]?.includes(state.filter);
    const haystack = `${entry.name} ${entry.name_zh} ${entry.id} ${entry.description} ${entry.description_zh}`.toLocaleLowerCase();
    return matchesCategory && haystack.includes(state.query.toLocaleLowerCase().trim());
  });
  const count = entries.length, total = state.catalog.styles.length;
  $('#collection-range').textContent = `01 — ${String(total).padStart(2,'0')}`;
  $('#style-count').textContent = state.language === 'zh' ? `${total} 种视觉语言 · 无限种故事${count !== total ? ` · 显示 ${count} 种` : ''}` : `${total} visual languages. Endless stories.${count !== total ? ` · ${count} shown` : ''}`;
  $('#style-grid').innerHTML = entries.map((entry,i) => {
    const pages = entry.showcases ?? [], hasLocal = pages.some(p => p.access === 'local');
    const filmLabel = entry.capabilities.published_demo ? 'publicSample' : hasLocal ? 'localPages' : 'noFilm';
    return `<article class="style-card" style="--delay:${i*.035}s"><button type="button" class="card-open" data-style="${escape(entry.id)}" aria-label="${escape(localized(entry,'name'))}"><div class="card-art">${preview(entry)}<span class="card-index">${String(state.catalog.styles.indexOf(entry)+1).padStart(2,'0')}</span><span class="preview-kind">${t(entry.preview_kind === 'frame' ? 'frame' : 'sketch')}</span><span class="card-arrow" aria-hidden="true">↗</span></div><div class="card-heading"><h3>${escape(localized(entry,'name'))}</h3><span aria-hidden="true">↗</span></div><p class="card-description">${escape(localized(entry,'description'))}</p></button><div class="card-meta"><span>${escape(localized(state.catalog.statuses[entry.status],'name'))}</span><span class="${entry.capabilities.published_demo ? 'published' : ''}">${t(filmLabel)}</span></div></article>`;
  }).join('') || `<p class="empty-state">${t('noResults')}</p>`;
}
function renderScreening() {
  const released = state.catalog.styles.flatMap(s => s.showcases ?? []).find(p => p.access === 'release');
  if (released) {
    $('#featured-watch').href = pageURL(released,'short');
    $('#short-film').href = pageURL(released,'short'); $('#long-film').href = pageURL(released,'long');
  }
  const localStyles = state.catalog.styles.filter(s => s.showcases?.some(p => p.access === 'local'));
  $('#showcase-shelf').innerHTML = localStyles.map(entry => {
    const page = entry.showcases.find(p => p.access === 'local');
    return `<article class="showcase-card"><button type="button" data-style="${escape(entry.id)}"><div class="showcase-art">${preview(entry)}<span>${t(isAvailable(page) ? 'available' : 'localOnly')}</span></div><h4>${escape(pageTitle(page))}</h4><p>${escape(localized(entry,'name'))} · ${t(entry.preview_kind === 'frame' ? 'frame' : 'sketch')}</p></button></article>`;
  }).join('');
  $('#screening-note').innerHTML = state.availability.mode === 'local' ? t('localNote') : `${t('publicNote')} <code>python3 scripts/serve_styles.py</code>`;
  requestAnimationFrame(updateShelfControls);
}
function renderDetail() {
  const entry = state.catalog.styles.find(s => s.id === state.detail);
  if (!entry) return;
  const pages = entry.showcases ?? [], missing = pages.some(p => !isAvailable(p));
  const links = pages.map(page => isAvailable(page)
    ? `<a href="${escape(pageURL(page))}">${escape(pageTitle(page))}<span aria-hidden="true">↗</span></a>`
    : `<button type="button" disabled>${escape(pageTitle(page))} · ${t('localOnly')}</button>`).join('');
  $('#style-detail').innerHTML = `<div class="detail-art">${preview(entry,true)}<span class="preview-kind">${t(entry.preview_kind === 'frame' ? 'frame' : 'sketch')}</span></div><div class="detail-copy"><p class="eyebrow">${escape(entry.id.toUpperCase().replaceAll('-',' / '))}</p><h2 id="detail-title">${escape(localized(entry,'name'))}</h2><p class="detail-description">${escape(localized(entry,'description'))}</p><div class="detail-status"><strong>${escape(localized(state.catalog.statuses[entry.status],'name'))}</strong>${escape(localized(entry,'status_note'))}</div><h3>${t('openPages')}</h3><div class="detail-pages">${links}</div>${!pages.length ? `<p class="local-help">${t('noShowcase')}</p>` : ''}${missing ? `<p class="local-help">${state.availability.mode === 'local' ? t('missingProject') : t('localHelp')}</p><div class="command"><code>python3 scripts/serve_styles.py --port 8249</code><button type="button" data-copy="python3 scripts/serve_styles.py --port 8249">${t('copy')}</button></div>` : ''}<div class="detail-links"><a href="${repoLink(entry.guide)}" target="_blank" rel="noopener noreferrer">${t('guide')} ↗</a><a href="${repoLink(entry.prompt)}" target="_blank" rel="noopener noreferrer">${t('prompt')} ↗</a><a href="${REPO}/tree/main/${entry.template}" target="_blank" rel="noopener noreferrer">${t('files')} ↗</a></div><h3>${t('startStyle')}</h3><div class="command"><code>${escape(commandFor(entry.id))}</code><button type="button" data-copy="${escape(commandFor(entry.id))}">${t('copy')}</button></div></div>`;
}
function openStyle(id) {
  state.detail = id; renderDetail();
  $('#starter-command').textContent = commandFor(id);
  const url = new URL(location.href); url.searchParams.set('style',id); history.replaceState(null,'',url);
  if (!$('#style-dialog').open) $('#style-dialog').showModal();
}
function closeStyle() { $('#style-dialog').close(); }
function updateShelfControls() {
  const shelf = $('#showcase-shelf');
  $('#shelf-prev').disabled = shelf.scrollLeft <= 2;
  $('#shelf-next').disabled = shelf.scrollLeft + shelf.clientWidth >= shelf.scrollWidth - 2;
}
let toastTimer;
async function copyCommand(text) {
  try {
    await navigator.clipboard.writeText(text);
    $('#toast').textContent = t('copied');
  } catch {
    const command = [...document.querySelectorAll('code')].find(node => node.textContent === text);
    if (command) { const range = document.createRange(); range.selectNodeContents(command); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); }
    $('#toast').textContent = t('copyFailed');
  }
  clearTimeout(toastTimer); $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'),2600);
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click',() => setLanguage(button.dataset.language)));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',() => {
  state.filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => { const selected = item === button; item.classList.toggle('selected',selected); item.setAttribute('aria-pressed',selected); });
  renderStyles();
}));
$('#style-search').addEventListener('input',event => { state.query = event.target.value; if (state.catalog) renderStyles(); });
document.addEventListener('click',event => {
  const card = event.target.closest('[data-style]'); if (card) openStyle(card.dataset.style);
  const button = event.target.closest('[data-copy]'); if (button) copyCommand(button.dataset.copy);
});
$('.dialog-close').addEventListener('click',closeStyle);
$('#style-dialog').addEventListener('click',event => {
  if (event.target !== $('#style-dialog')) return;
  const bounds = event.target.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeStyle();
});
$('#style-dialog').addEventListener('close',() => {
  state.detail = null; const url = new URL(location.href); url.searchParams.delete('style'); history.replaceState(null,'',url);
});
$('#copy-starter').addEventListener('click',() => copyCommand($('#starter-command').textContent));
$('#shelf-prev').addEventListener('click',() => $('#showcase-shelf').scrollBy({left:-$('#showcase-shelf').clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
$('#shelf-next').addEventListener('click',() => $('#showcase-shelf').scrollBy({left:$('#showcase-shelf').clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
$('#showcase-shelf').addEventListener('scroll',updateShelfControls,{passive:true});
window.addEventListener('resize',updateShelfControls);
const navObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) document.querySelectorAll('.main-nav a').forEach(a => a.classList.toggle('active',a.hash === `#${entry.target.id}`));
},{rootMargin:'0px 0px -60% 0px'});
document.querySelectorAll('main section[id]').forEach(section => navObserver.observe(section));
setLanguage(readPreference());
try {
  const [catalog,availability,frames] = await Promise.all([
    fetch('styles.json').then(response => { if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`); return response.json(); }),
    fetch('catalog-availability.json').then(response => response.ok ? response.json() : null).catch(() => null),
    fetch('docs/readme/frames.json').then(response => response.ok ? response.json() : null).catch(() => null),
  ]);
  state.catalog = catalog; if (availability) state.availability = availability;
  for (const frame of frames?.frames ?? []) state.frames[frame.style] = frame.image;
  renderStyles(); renderScreening();
  // Keep old root links to a specific edition or chapter working after the homepage moves.
  const params = new URLSearchParams(location.search);
  if (params.has('edition') || location.hash === '#film') {
    const target = new URL('styles/whiteboard/studio/index.html',location.href);
    target.search = location.search; target.hash = location.hash; location.replace(target.href);
  } else if (params.has('style') && catalog.styles.some(entry => entry.id === params.get('style'))) openStyle(params.get('style'));
} catch (error) {
  console.error(error);
  $('#style-grid').innerHTML = `<p class="empty-state">${t('loadFailed')} <a href="${REPO}/blob/main/styles/README.md">↗</a></p>`;
  document.querySelectorAll('[data-filter]').forEach(button => { button.disabled = true; });
}
