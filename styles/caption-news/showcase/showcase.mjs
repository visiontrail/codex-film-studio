import { captionPose } from '../starter/lib/caption.mjs';

const root = new URL('../../../', import.meta.url);
const $ = selector => document.querySelector(selector);
const copy = {
  en: {
    skip:'Skip to content',back:'↖ All styles',eyebrow:'THE EDITORIAL SERIES / 09',subtitle:'A clear thought.<br>A bold impression.',
    intro:'Let the picture tell the story. Let the words land. Oversized captions, selective yellow emphasis and motion with a point.',
    watch:'Watch the film <span>↘</span>',explore:'Explore the visual language ↓',study:'TYPE IN MOTION / STYLE STUDY',studyNote:'An original type study, ready to replay.',replay:'↻ Replay motion',
    strap1:'PICTURE FIRST.',strap2:'WORDS THAT LAND.',strap3:'MOTION WITH INTENT.',screenEyebrow:'01 / THE SCREENING ROOM',screenTitle:'See it in motion.',screenIntro:'Picture, captions and sound.<br>One continuous editorial rhythm.',
    loading:'Checking the local screening copy…',localTitle:'Screen the film locally.',localDescription:'The complete film lives in the retained production project. Open this page through the local studio to watch it.',
    missing:'The retained film is not available on this machine. Restore the project registered in styles.json, then reload this page.',openLocal:'Open the local screening room ↗',localCopy:'LOCAL SCREENING COPY',
    chaptersTitle:'One film.<br>Every chapter.',chapterHelp:'Choose a chapter to jump into the film.',download:'Download MP4 ↗',captions:'English captions ↗',sourceNotes:'Sources & footage notes ↗',
    playError:'The film could not be played. Try the MP4 download or check the retained project.',
    grammarEyebrow:'02 / THE VISUAL LANGUAGE',grammarTitle:'Give every word a job.',grammarIntro:'One subject. A clear hierarchy.<br>Room for the idea to settle.',
    typeTitle:'Type that takes the lead.',typeText:'Heavy, tightly set captions. Short thought units. Highlight the phrase that carries the argument.',
    paperTitle:'Keep the context in frame.',paperText:'Warm paper for documents. Ruled ledgers for comparisons. Preserve sources, units and the subject’s space.',
    motionTitle:'Move. Land. Let it read.',motionText:'A punch of type, a highlight wipe, then a stable hold. Set the intensity to fit the story.',
    createEyebrow:'03 / YOUR NEXT STORY',createTitle:'Bring the news.<br>Make your point.',createText:'Start with a subject, an audience and a point of view. Build a new film in its own independent project.',
    starter:'AUTHORING STARTER',starterText:'Visual rules, blank inputs and caption motion helpers. Author the scenes, renderer and audio for your own story.',
    copy:'Copy',copied:'Command copied.',copyFailed:'Select and copy the command above.',guide:'Style guide ↗',prompt:'Creative prompt ↗',influence:'Visual grammar inspired by',independent:'An independently authored style package.',top:'Back to top ↑',
    metadata:'English narration + captions',chapterLabel:'Film chapters',specimenLabel:'Animated editorial typography study',
  },
  zh: {
    skip:'跳转到正文',back:'↖ 全部风格',eyebrow:'编辑叙事系列 / 09',subtitle:'让观点清晰。<br>让文字有力。',
    intro:'画面讲故事，字幕落重点。用大字、恰到好处的黄色强调与有目的的运动，让每个信息都被看见。',
    watch:'观看影片 <span>↘</span>',explore:'探索视觉语言 ↓',study:'动态字体 / 风格示意',studyNote:'原创字体示意，可重播观察动效。',replay:'↻ 重播动效',
    strap1:'画面在先。',strap2:'文字有力。',strap3:'运动有意。',screenEyebrow:'01 / 放映室',screenTitle:'看看它如何动起来。',screenIntro:'画面、字幕与声音，<br>形成连贯的叙事节奏。',
    loading:'正在检查本机影片…',localTitle:'在本机观看完整影片。',localDescription:'完整影片保存在独立制作项目中。通过本地工作室打开此页面，即可观看。',
    missing:'本机未找到保留的影片。请恢复 styles.json 中登记的制作项目，再刷新页面。',openLocal:'打开本地放映室 ↗',localCopy:'本地放映版',chaptersTitle:'一部影片。<br>逐章观看。',chapterHelp:'选择章节，从感兴趣的部分开始观看。',
    download:'下载 MP4 ↗',captions:'英文字幕 ↗',sourceNotes:'来源与素材说明 ↗',playError:'影片暂时无法播放，请尝试下载 MP4，或检查保留的制作项目。',
    grammarEyebrow:'02 / 视觉语言',grammarTitle:'每个字，都有它的作用。',grammarIntro:'一个主体，清晰的层次，<br>留出理解与阅读的时间。',
    typeTitle:'让文字引导视线。',typeText:'粗重而紧凑的字幕，以短句承载完整意思。黄色只强调真正推动论点的词句。',
    paperTitle:'让上下文留在画面里。',paperText:'用暖纸卡呈现文档，用横线图表比较数据。保留来源、单位与主体的展示空间。',
    motionTitle:'入场，落定，再读懂。',motionText:'字重冲击、重点擦入，随后留出稳定阅读时间。根据故事选择运动强度与节奏。',
    createEyebrow:'03 / 你的下一个故事',createTitle:'带上新闻。<br>说清观点。',createText:'从选题、观众与表达角度出发，在独立项目中编排一部新影片。',
    starter:'创作起步包',starterText:'包含视觉规则、空白输入与字幕动效工具。为自己的故事编写场景、渲染与音频。',
    copy:'复制',copied:'命令已复制。',copyFailed:'请选择并复制上方命令。',guide:'风格说明 ↗',prompt:'创作提示词 ↗',influence:'视觉语法灵感来自',independent:'独立编写的风格包。',top:'回到顶部 ↑',metadata:'英文旁白与字幕',chapterLabel:'影片章节',specimenLabel:'编辑风格动态字体示意',
  },
};
let language = 'en', manifest = null, missing = false;
const t = key => copy[language][key] ?? copy.en[key] ?? key;
const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`;

function setLanguage(value) {
  language = value;
  document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en';
  document.title = value === 'zh' ? '字幕新闻 — Caption News · Codex Film Studio' : 'Caption News — Codex Film Studio';
  document.querySelectorAll('[data-i18n]').forEach(node => { node.innerHTML = t(node.dataset.i18n); });
  document.querySelectorAll('[data-language]').forEach(node => node.setAttribute('aria-pressed',node.dataset.language === value));
  document.querySelectorAll('[data-home]').forEach(node => { const url = new URL(node.getAttribute('href'),location.href); url.searchParams.set('lang',value); node.href = url.href; });
  const local = new URL($('#local-link').href); local.searchParams.set('lang',value); $('#local-link').href = local.href;
  const url = new URL(location.href); url.searchParams.set('lang',value); history.replaceState(null,'',url);
  try { localStorage.setItem('film-studio-language',value); } catch { /* Optional preference. */ }
  $('#chapters').setAttribute('aria-label',t('chapterLabel'));
  $('#specimen').setAttribute('aria-label',t('specimenLabel'));
  if (missing) $('#availability-message').textContent = t('missing');
  if (manifest) renderMetadata();
}

// A short, finite study shares the starter's deterministic entrance function.
// It never runs on a loop; reduced-motion users see the settled composition.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let animation = 0;
function paint(frame) {
  for (const [index,id] of ['line-one','line-two'].entries()) {
    const pose = captionPose(frame,{start:index * 7,duration:18,scaleFrom:1.22,travelY:22});
    const node = document.getElementById(id);
    node.style.opacity = pose.visible ? '1' : '0';
    node.style.transform = `translateY(${pose.offsetY}px) scale(${pose.scale})`;
    if (index === 1) node.style.clipPath = `inset(0 ${(1-pose.highlight)*100}% 0 0)`;
  }
}
function replay() {
  cancelAnimationFrame(animation);
  if (reducedMotion.matches) { paint(90); return; }
  const start = performance.now();
  const tick = now => { const frame = Math.min(90,Math.floor((now-start)*30/1000)); paint(frame); if (frame < 90) animation = requestAnimationFrame(tick); };
  animation = requestAnimationFrame(tick);
}
$('#replay').addEventListener('click',replay);
reducedMotion.addEventListener('change',replay);
document.addEventListener('visibilitychange',() => { if (document.hidden) { cancelAnimationFrame(animation); paint(90); } });

function renderMetadata() {
  $('#film-meta').textContent = `${clock(manifest.durationSeconds)} · ${manifest.format.width} × ${manifest.format.height} · ${manifest.format.fps} fps`;
  $('#film-description').textContent = `${t('chapterHelp')} ${t('metadata')}${language === 'zh' ? '。' : '.'}`;
}

async function loadFilm() {
  try {
    const availability = await fetch(new URL('catalog-availability.json',root)).then(r => r.ok ? r.json() : null);
    if (availability?.mode !== 'local' || availability.pages['caption-news-film'] !== true) {
      missing = availability?.mode === 'local';
      if (missing) $('#availability-message').textContent = t('missing');
      $('#film-empty').hidden = false;
      return;
    }
    const project = new URL($('#screening').dataset.project,location.href);
    const response = await fetch(new URL('content/combined-delivery-manifest.json',project));
    if (!response.ok) throw new Error('Missing film manifest');
    manifest = await response.json();
    // Production metadata stays in the retained project, never in this style package.
    const asset = path => {
      const url = new URL(path,project);
      if (!url.href.startsWith(project.href)) throw new Error('Asset outside retained project');
      return url.href;
    };
    const film = $('#film');
    film.poster = asset(manifest.poster);
    film.src = asset(manifest.file);
    $('#download-film').href = asset(manifest.file);
    $('#download-captions').href = asset(manifest.subtitles);
    $('#source-notes').href = asset('index.html');
    for (const [index,chapter] of manifest.chapters.entries()) {
      const button = document.createElement('button'); button.type = 'button';
      for (const [className,text] of [['chapter-index',String(index+1).padStart(2,'0')],['chapter-time',clock(chapter.startSeconds)],['chapter-title',chapter.title]]) {
        const span = document.createElement('span'); span.className = className; span.textContent = text; button.append(span);
      }
      button.addEventListener('click',async () => {
        film.currentTime = chapter.startSeconds;
        try { await film.play(); $('#film-error').hidden = true; } catch { $('#film-error').hidden = false; }
      });
      $('#chapters').append(button);
    }
    const highlight = () => [...$('#chapters').children].forEach((button,index) => {
      const chapter = manifest.chapters[index];
      button.setAttribute('aria-current',film.currentTime >= chapter.startSeconds && film.currentTime < chapter.endSeconds ? 'true' : 'false');
    });
    film.addEventListener('timeupdate',highlight);
    film.addEventListener('error',() => { $('#film-error').hidden = false; });
    film.addEventListener('loadedmetadata',highlight);
    renderMetadata(); highlight(); $('#film-layout').hidden = false;
  } catch {
    missing = true;
    $('#film-layout').hidden = true; $('#film-empty').hidden = false;
    $('#availability-message').textContent = t('missing');
  } finally { $('#film-loading').hidden = true; }
}

$('#copy-command').addEventListener('click',async () => {
  try { await navigator.clipboard.writeText($('#create-command').textContent); $('#copy-status').textContent = t('copied'); }
  catch { const range = document.createRange(); range.selectNodeContents($('#create-command')); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); $('#copy-status').textContent = t('copyFailed'); }
});
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click',() => setLanguage(button.dataset.language)));
const requested = new URLSearchParams(location.search).get('lang');
let saved = 'en'; try { saved = localStorage.getItem('film-studio-language'); } catch { /* Optional preference. */ }
setLanguage(['en','zh'].includes(requested) ? requested : saved === 'zh' ? 'zh' : 'en');
replay();
await loadFilm();
