const zh = {
  skip:'跳转到正文',navigation:'主导航',pageLanguage:'页面语言',allStyles:'全部风格 ↗',navFilm:'观看影片',navMake:'创作影片',issue:'材质系列 / 02',issueRight:'让纸片，有自己的表达',annotation:'边缘可以不齐，想法必须清楚。',intro:'让想法拥有轮廓。撕开的纸边、摄影剪贴与各有性格的文字，一片片搭起有意图的故事。',watch:'观看影片',explore:'探索视觉语言 ↓',specimen:'由绿色拱形、胶片纸签和剪贴字母组成的层叠纸张风格示意',study:'原创纸材与运动示意。',replay:'↻ 重播剪贴动画',palette:'纸上的颜色',paper:'暖纸',green:'森林绿',red:'朱红',yellow:'赭黄',filmEyebrow:'01 / 放映室',filmTitle:'一个想法，<br>一片片展开。',filmIntro:'看这套视觉语言，如何讲完一个故事。',filmLabel:'艺术拼贴影片',videoFallback:'请使用下载链接观看影片。',filmStamp:'艺术拼贴 / 完整影片',download:'下载 MP4 ↗',chaptersTitle:'找到你想看的那一片。',chapterHint:'选择章节，从这里开始 ↘',chapters:'影片章节',transcript:'阅读英文完整旁白',grammarEyebrow:'02 / 视觉语言',grammarTitle:'每一片都有位置，<br>也有分量。',grammarIntro:'表面、轮廓、遮挡关系。每一个选择，都改变一个想法被感知的方式。',materialTitle:'能感受到的纸。',materialText:'纤维、颜料、撕裂边缘与柔和接触阴影。纹理附着在纸张上，跟着纸片与镜头运动。',typeTitle:'不同碎片，同一种表达。',typeText:'摄影剪贴与裁切文字、手写痕迹并置。用尺度和遮挡引导视线，为观点留下阅读空间。',motionTitle:'每一次移动都有理由。',motionText:'卡片滑入、接触、落稳，再被一张剪贴打断。进入、接触与替换跟随同一时间轴，推进叙述。',makeEyebrow:'03 / 你的下一部影片',makeTitle:'新的故事，<br><em>同一把剪刀。</em>',makeIntro:'带来主题、受众和时长，为自己的故事搭起一个纸上世界。',step1:'打开工作室。',step1Body:'克隆仓库，然后在仓库根目录运行项目创建命令。',step2:'从一张白纸开始。',step2Body:'创建独立的艺术拼贴项目，在 Codex 中打开新文件夹。',copy:'复制',step3:'让它成为你的故事。',step3Body:'编写旁白与场景，选择人物和材料，再把运动与声音一起编排。',package:'查看创作起步包 ↗',starterNote:'起步包包含空白输入、纸材工具和制作指南。每部新影片都需要创作自己的场景、渲染器与音频。',promptLabel:'在 CODEX 中试试',prompt:'为［受众］制作一部关于［主题］的三分钟艺术拼贴影片。使用有触感的纸张、富有表现力的剪贴、裁切字体和有叙事作用的实体运动。创作原创脚本与构图，让旁白、镜头、字幕和声音共用一条时间轴。检查最终画面、运动与声音，并修复实际发现的问题。',copyPrompt:'复制创作提示词 ↗',notesEyebrow:'04 / 剪贴台上的手记',notesTitle:'打磨细节，<br>留住表达。',notesIntro:'清楚的方法，为有性格的影片留出更多创作空间。',identityTitle:'为故事选择人物。',identityText:'保持角色在不同镜头中的辨识度。特定真人使用为本次制作提供的肖像，在保留身份特征的基础上调整纸材与印刷处理。',clockTitle:'共用一种节奏。',clockText:'画面、旁白、字幕与声音共用整数帧时间轴。给不同物件不同的重量，让重要观点停留到足够看清。',reviewTitle:'看画面，看运动，听声音。',reviewText:'以适合检查的尺寸查看编码后静帧，分别观看运动与聆听混音。修复实际发现的缺陷，再检查最终交付。',styleGuide:'艺术拼贴风格指南 ↗',director:'导演指南 ↗',technique:'制作方法 ↗',researchEyebrow:'05 / 影片的注脚',researchTitle:'沿着线索，往下读。',researchIntro:'影片背后的研究，以及每项研究的适用范围与局限。',influence:'风格库灵感：',credits:'影片鸣谢与来源 ↗'
};
const $ = selector => document.querySelector(selector);
const english = Object.fromEntries([...document.querySelectorAll('[data-copy]')].map(n => [n.dataset.copy,n.innerHTML]));
const englishAria = Object.fromEntries([...document.querySelectorAll('[data-aria]')].map(n => [n.dataset.aria,n.getAttribute('aria-label')]));
const revision = new URL(import.meta.url).searchParams.get('v');
const assetURL = path => {const url=new URL(path,location.href);if(revision)url.searchParams.set('v',revision);return url.href;};
const player=$('#film-player');
zh.playFilm='▶ 播放成片';
let language='en',model;
const say=(en,zh)=>language==='zh'?zh:en;
const time=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function preference(){const q=new URL(location.href).searchParams.get('lang');if(['en','zh'].includes(q))return q;try{return localStorage.getItem('film-studio-language')==='zh'?'zh':'en';}catch{return 'en';}}
function message(en,zh){$('#playback-message').textContent=say(en,zh);$('#playback-message').hidden=false;}
function setLanguage(next,update=true){
  language=next==='zh'?'zh':'en';document.documentElement.lang=language==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-copy]').forEach(n=>{n.innerHTML=language==='zh'?zh[n.dataset.copy]??english[n.dataset.copy]:english[n.dataset.copy];});
  document.querySelectorAll('[data-aria]').forEach(n=>n.setAttribute('aria-label',language==='zh'?zh[n.dataset.aria]??englishAria[n.dataset.aria]:englishAria[n.dataset.aria]));
  document.querySelectorAll('[data-lang]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.lang===language)));
  document.querySelectorAll('[data-home]').forEach(n=>{const u=new URL(n.getAttribute('href'),location.href);u.searchParams.set('lang',language);if(revision)u.searchParams.set('v',revision);n.href=u.href;});
  document.title=say('Art Collage — Codex Film Studio','艺术拼贴 Art Collage — Codex Film Studio');
  $('#copy-status').textContent='';
  try{localStorage.setItem('film-studio-language',language);}catch{}
  if(update){const u=new URL(location.href);u.searchParams.set('lang',language);history.replaceState(null,'',u);}
  if(model){renderFilm();renderChapters();renderSources();}
}
function renderFilm(){
  $('#film-title').textContent=model.title[language];$('#film-intro').textContent=model.description[language];
  player.setAttribute('aria-label',model.title[language]);
  $('#film-meta').textContent=`${time(model.duration)} · ${model.height}P · ${model.fps} FPS · ${say('ENGLISH AUDIO','英语旁白')}`;
  document.querySelectorAll('.duration').forEach(n=>n.textContent=time(model.duration));
}
function activeChapter(){if(!model)return;let active=0;model.chapters.forEach((c,i)=>{if(player.currentTime>=c.start)active=i;});document.querySelectorAll('.chapter').forEach((n,i)=>n.setAttribute('aria-current',String(i===active)));}
async function seek(seconds){
  $('#playback-message').hidden=true;
  if(player.readyState<1){message('The film is still loading. Press Play, then choose a chapter.','影片仍在加载，请先点击播放，再选择章节。');return;}
  player.currentTime=seconds;activeChapter();player.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  try{await player.play();}catch{message('Press Play to continue from this chapter.','请点击播放，从这一章节继续。');}
}
function renderChapters(){$('#chapters').replaceChildren(...model.chapters.map((c,i)=>{const b=document.createElement('button');b.type='button';b.className='chapter';const n=document.createElement('span');n.textContent=`${String(i+1).padStart(2,'0')} /`;const t=document.createElement('time');t.textContent=time(c.start);const title=document.createElement('strong');title.textContent=c[language];b.append(n,t,title);b.addEventListener('click',()=>seek(c.start));b.setAttribute('aria-label',`${c[language]}, ${time(c.start)}`);return b;}));activeChapter();}
function renderTranscript(){$('#transcript-content').replaceChildren(...model.transcript.map(c=>{const p=document.createElement('p'),b=document.createElement('button'),s=document.createElement('span');b.type='button';b.textContent=time(c.start);b.setAttribute('aria-label',`Play from ${time(c.start)}`);b.addEventListener('click',()=>seek(c.start));s.textContent=c.text;p.append(b,s);return p;}));}
function renderSources(){const open=new Set([...document.querySelectorAll('.source[open]')].map(n=>n.dataset.id));$('#sources').replaceChildren(...model.sources.map((s,i)=>{const d=document.createElement('details');d.className='source';d.dataset.id=s.id;d.open=open.has(s.id);const summary=document.createElement('summary');const n=document.createElement('span');n.className='source-no';n.textContent=String(i+1).padStart(2,'0');const title=document.createElement('span');title.className='source-title';title.textContent=s.title[language];const plus=document.createElement('span');plus.textContent='+';plus.setAttribute('aria-hidden','true');summary.append(n,title,plus);const body=document.createElement('div');body.className='source-body';const type=document.createElement('p');type.className='source-type';type.textContent=s.type[language];const description=document.createElement('p');description.textContent=s.summary[language];const a=document.createElement('a');const u=new URL(s.url);if(['https:','http:'].includes(u.protocol))a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=say('Read the source ↗','阅读原始研究 ↗');body.append(type,description,a);d.append(summary,body);return d;}));}
async function copyText(selector){const node=$(selector);try{await navigator.clipboard.writeText(node.textContent);$('#copy-status').textContent=say('Copied. Ready for your next story.','已复制，开始你的下一个故事。');}catch{const range=document.createRange();range.selectNodeContents(node);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);$('#copy-status').textContent=say('Text selected. Press Ctrl+C or ⌘C to copy.','文字已选中，请按 Ctrl+C 或 ⌘C 复制。');}}
function replay(){const stage=$('#specimen');stage.classList.remove('animate');requestAnimationFrame(()=>requestAnimationFrame(()=>stage.classList.add('animate')));}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
$('#copy-prompt').addEventListener('click',()=>copyText('#prompt-text'));$('#copy-command').addEventListener('click',()=>copyText('#create-command'));$('#replay').addEventListener('click',replay);
async function playFilm(){
  $('#playback-message').hidden=true;
  if(player.error)player.load();
  try{await player.play();}catch{message('Press Play to retry, or open the MP4 download.','请点击播放重试，或打开 MP4 下载链接。');}
}
document.querySelectorAll('a[href="#film"], #play-film').forEach(button=>button.addEventListener('click',playFilm));
player.addEventListener('timeupdate',activeChapter);player.addEventListener('seeked',activeChapter);player.addEventListener('error',()=>message('The film could not load. Try the MP4 download or reload this page.','影片未能加载，请尝试下载 MP4 或刷新页面。'));
player.querySelector('source').addEventListener('error',()=>message('The film file could not load. Retry playback or open the MP4 download.','影片文件未能加载，请重试播放或打开 MP4 下载链接。'));
player.addEventListener('playing',()=>{$('#playback-message').hidden=true;});
setLanguage(preference(),false);replay();
// Give every public media request the deployment revision, including direct links.
if(revision){player.poster=assetURL('media/poster.jpg');player.querySelector('source').src=assetURL('media/film.mp4');player.querySelector('track').src=assetURL('media/captions.vtt');player.load();}
$('#download-film').href=assetURL('media/film.mp4');
try{const r=await fetch(assetURL('media/manifest.json'));if(!r.ok)throw new Error(`Manifest HTTP ${r.status}`);model=await r.json();renderFilm();renderChapters();renderSources();renderTranscript();document.body.dataset.ready='true';}catch(error){message('Chapters and research could not load. Reload the page, or open the published screening room.','章节与研究内容未能加载，请刷新页面或打开已发布的放映室。');console.error(error);}
