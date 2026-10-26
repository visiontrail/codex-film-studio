const $ = selector => document.querySelector(selector);
const en = Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(n => [n.dataset.i18n,n.innerHTML]));
Object.assign(en,{pause:'Ⅱ Pause',copied:'Command copied.',copyFailed:'Select the command above and copy it.',mainNav:'Main',language:'Page language',materials:'Choose a material',sceneAria:'An original style study: a small performer presses a lever, compressing a block in four different materials.',press:'press',rule:'one touch. one result.',success:'DONE!',return:'NEXT ROUND',live:'ACTION STUDY',study:'MATERIAL STUDY',swissName:'SWISS PRINT',pixelName:'INDEXED PIXELS',terminalName:'AMBER TERMINAL',blueprintName:'BLUEPRINT'});
const zh = {
  fontLicense:'技术手写字体许可 ↗',skip:'跳到正文',all:'↖ 全部风格',make:'创作影片',notes:'制作说明',eyebrow:'风格 007 / 极速微游戏',title1:'小小关卡。',title2:'大大动静。',
  intro:'一道命令，一次瞬间判断，一个看得见的结果。在不同材质的小世界里闯关，再回到那个热闹又熟悉的舞台。',explore:'观看最终成片',studyTitle:'一个动作，四个世界。',studyMeta:'无声动效演示 / 16 秒',marquee:'命令 → 动作 → 结果',lives:'生命',threeLives:'三条生命',timer:'剩余时间',play:'▶ 播放演示',pause:'Ⅱ 暂停',replay:'↻ 从头播放',timeline:'演示时间轴，单位为秒',swiss:'瑞士平面',pixel:'索引像素',terminal:'琥珀色终端',blueprint:'技术蓝图',
  caption:'用原创交互演示呈现这套风格的视觉规则。初始暂停，可选择材质或拖动进度查看任意一帧。这是无声风格示意，并非完整影片。',
  grammarOver:'01 / 这个世界的规则',grammarTitle:'材质在变。<br>成败始终可见。',grammarIntro:'每个关卡都有新的画法。角色、倒计时和动作的后果，把不同世界连成一部影片。',
  rule1Title:'让命令，先声夺人。',rule1:'大字砸入、落稳，再缩到角落。动作开始前撤去爆炸框，让操作的手与物体始终清楚可见。',rule2Title:'接触，才是动作的起点。',rule2:'手碰到工具，工具改变物体。为结果留出足够的停顿，让观众看懂发生了什么；每个动作都要真正产生作用。',rule3Title:'带着结果，回到舞台。',rule3:'熟悉的舞台与有限的生命计数连接每一关。失败留下具体后果，让角色在之后的挑战中用上学到的经验。',
  rhythmOver:'02 / 影片的节拍',rhythmTitle:'越来越快。<br>依然看得清。',rhythmText:'命令、动作和回到舞台的停留一起收紧。给每种材质不同的乐器与拟音。在最终撞击之前，留下一段真正的安静。',commandLabel:'命令',actionLabel:'动作',resultLabel:'结果',scoreNote:'供影片创作参考的节奏示意。画面、旁白、配乐和音效共用一条帧时间轴。',
  createOver:'03 / 开始你的创作',createTitle:'你的故事。<br>全新的关卡。',createIntro:'带上主题、受众和时长。把每个想法变成一个看得见的小任务，让它有明确的动作与结果。',repoLabel:'在 GITHUB 获取项目',repoText:'视觉规则、材质工具，以及独立创作的起点。',step1Title:'获取风格库。',step1:'克隆仓库，在 Codex 中打开项目文件夹。',step2Title:'给影片一个独立空间。',step2:'创建独立制作项目，把故事、素材和输出保存在其中。',step3Title:'执导这场连锁反应。',step3:'写下命令与结果，选择材质，再编写场景与声音。观看、聆听并修改导出的影片。',copy:'复制',copied:'命令已复制。',copyFailed:'请选择上方命令并复制。',guide:'阅读风格说明 ↗',
  promptOver:'在 CODEX 中试试',promptText:'根据我提供的主题、受众和时长，创作一部原创微游戏影片。每关包含一句简短命令、一个真实作用于物体的动作和清晰的结果。关卡之间切换材质，同时保留角色的身份特征。让画面、旁白和音效共用一条时间轴。检查编码后的影片，修改完善后再交付。',promptLink:'获取通用创作提示词 ↗',
  notesOver:'04 / 工具包里有什么',notesTitle:'先构造材质。<br>再让动作发生。',status:'材质工具包',note1Title:'从这里，开始编写。',note1:'包含独立绘制、角色、动作和材质工具，以及空白输入约定。每部影片独立创作场景渲染器、旁白与配乐。',note2Title:'不同材质，不同构造。',note2:'索引像素缓冲、由字符搭起的终端、细线技术图、蜡质笔触与干湿墨迹。材质要改变绘画本身，不能只叠一层纹理。',note3Title:'一条时间轴，每一次接触。',note3:'镜头、命令和声音对齐整数帧。按交付尺寸检查手与工具的接触、回放取景和细节，再完整观看与聆听成片。',engine:'查看材质工具包 ↗',director:'导演指南 ↗',technique:'制作指南 ↗',
  sourcesOver:'05 / 参考与来源',sourcesTitle:'研究风格，独立构造。',sourcesText:'风格说明参考了 Lemomo 的 Microgame 影片与 lemo-opuscar。仓库保留的工具与本页交互演示均独立编写。',reference:'查看风格参考 ↗',referenceFilm:'原始参考影片 ↗',madeFor:'为',inspiration:'风格灵感：',top:'回到顶部 ↑',mainNav:'主导航',language:'页面语言',materials:'选择材质',sceneAria:'原创风格演示：小角色按动杠杆，使方块在四种材质中受压变形。',press:'按下',rule:'一次接触，一个结果。',success:'完成！',return:'下一关',live:'动作示意',study:'材质示意',swissName:'瑞士平面',pixelName:'索引像素',terminalName:'琥珀色终端',blueprintName:'技术蓝图'
};
const state={language:'en',time:1.15,playing:false,raf:0,previous:0};
const t = key => (state.language==='zh'?zh[key]:en[key]) ?? en[key] ?? key;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const canvas=$('#scene'),ctx=canvas.getContext('2d');
const pixel=document.createElement('canvas');pixel.width=120;pixel.height=60;const px=pixel.getContext('2d');
const ink='#191322',paper='#fff7dc';
function rect(x,y,w,h,fill,stroke=ink,lw=4){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.strokeRect(x,y,w,h);}}
function line(points,color=ink,width=5){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='miter';ctx.stroke();}
function circle(x,y,r,fill,stroke=ink,width=4){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function label(text,x,y,size=18,color=ink,font='Arial',align='left'){ctx.fillStyle=color;ctx.font=`bold ${size}px ${font}`;ctx.textAlign=align;ctx.fillText(text,x,y);}
function swiss(p){
  rect(0,0,960,480,'#f4f0e7',null);rect(40,388,880,3,ink,null);rect(720,0,240,480,'#e8e4db',null);
  label(t('press'),42,125,105,ink,'Arial');label(t('rule'),48,158,20,ink);label('01',909,71,38,'#d84225','Arial','right');
  // The hand shares its position with the lever endpoint; the platen follows the block surface.
  const hand=[485,202+55*p],top=371-(69-34*p);
  rect(642,177,22,204,'#d84225');rect(537,170,142,18,paper);rect(580,187,20,top-197,paper);rect(540,371,145,16,ink,null);
  rect(554-7*p,top,74+14*p,371-top,'#d84225');rect(535,top-14,112,14,paper);line([hand,[590,227]],ink,8);circle(590,227,9,paper);circle(...hand,10,'#d84225');
  rect(330+6*p,273,61,63,ink,null);line([[347,333],[340,380],[318,380]],ink,13);line([[375,332],[395,380],[417,380]],ink,13);
  line([[381+6*p,286],[433,278],hand],ink,13);circle(...hand,10,paper);circle(362+6*p,247,30,paper);
  rect(328+6*p,213,59,15,'#d84225');rect(339+6*p,194,29,19,'#d84225');circle(377+6*p,245,4,ink,null);line([[378+6*p,262],[389+6*p,262]],ink,3);
  label('TOUCH',745,267,17,ink,'Courier New');label('↓',745,313,36,'#d84225');label('CHANGE',745,350,17,ink,'Courier New');
}
function pixelLine(x1,y1,x2,y2,color,width=2){const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));px.fillStyle=color;for(let i=0;i<=n;i++)px.fillRect(Math.round(x1+(x2-x1)*i/n),Math.round(y1+(y2-y1)*i/n),width,width);}
function pixels(p){
  const fill=(x,y,w,h,c)=>{px.fillStyle=c;px.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  fill(0,0,120,60,'#17183d');
  [[8,12],[27,17],[63,8],[93,10],[111,23],[19,30],[44,13]].forEach(([x,y])=>fill(x,y,1,1,'#fff7dc'));
  fill(1,43,119,17,'#333366');fill(0,48,120,12,'#565a86');
  for(let y=49;y<60;y+=2)for(let x=(Math.floor((y-49)/2)%2)*2;x<120;x+=4)fill(x,y,1,1,'#17183d');
  const hx=61,hy=25+Math.round(p*7),top=47-(9-Math.round(p*4));
  fill(80,20,4,28,'#8bebe7');fill(67,20,20,3,'#8bebe7');fill(74,23,2,top-24,'#fff7dc');fill(68,47,18,2,'#ffe249');fill(70,top,11,47-top,'#ff71ad');fill(68,top-2,15,2,'#fff7dc');pixelLine(hx,hy,75,28,'#ffe249',2);fill(hx-1,hy-1,4,3,'#ff71ad');
  fill(41,34,9,8,'#ffe249');fill(46,35,4,7,'#cc873c');fill(42,41,3,6,'#fff7dc');fill(41,46,5,2,'#ffe249');fill(48,41,3,6,'#fff7dc');fill(48,46,5,2,'#ffe249');pixelLine(48,35,55,35,'#ffe249',2);pixelLine(55,35,hx,hy,'#ffe249',2);fill(hx,hy,2,2,'#fff7dc');
  fill(42,28,7,6,'#fff7dc');fill(41,29,9,3,'#fff7dc');fill(42,26,7,2,'#ff71ad');fill(44,24,3,2,'#ff71ad');fill(47,29,1,1,'#17183d');
  ctx.imageSmoothingEnabled=false;ctx.drawImage(pixel,0,0,960,480);label('02 / 8-COLOR BUFFER',42,52,18,'#8bebe7','Courier New');label(t('press').toUpperCase(),42,118,54,'#ffe249','Courier New');
}
function terminal(p){
  rect(0,0,960,480,'#19160f',null);const amber='#ffc369';
  label('> MATERIAL_ENGINE / TERMINAL',42,45,18,amber,'Courier New');label('03',910,45,18,amber,'Courier New','right');
  label(t('press').toUpperCase()+'_',42,105,48,amber,'Courier New');
  const rows=Array.from({length:19},()=>Array(73).fill(' '));
  const put=(s,x,y)=>{if(y<0||y>=rows.length)return;for(let i=0;i<s.length;i++)if(x+i>=0&&x+i<73)rows[y][x+i]=s[i];};
  const level=Math.round(2*p),leverY=5+Math.round(3*p),blockTop=13+level;
  put('  _^_ ',18,9);put(' [ o ]',18,10);put('  --- ',18,11);put(' /###\\',18,12);put(' |###|',18,13);put(' |###|',18,14);put(' /   \\',18,15);put('/     \\',18,16);put('==    ==',17,17);
  put('+===================+',43,3);put('|',61,4);for(let y=5;y<=15;y++)put('||',60,y);
  for(let y=4;y<blockTop-1;y++)put('||',49,y);put('+-------------+',44,blockTop-1);put('############',45,blockTop);for(let y=blockTop+1;y<=16;y++)put('|##########|',45,y);put('=====================',42,17);
  // Every prop and the contacting arm are constructed from characters.
  for(let x=24;x<=35;x++){const y=Math.round(13+(leverY-13)*(x-24)/11);put(x===35?'O':'=',x,y);}
  for(let x=36;x<=50;x++){const y=Math.round(leverY+(7-leverY)*(x-36)/14);put('-',x,y);}put('+',50,7);
  put('----+----------+----------+----------+----------+----------+-----',4,18);
  rows.forEach((r,y)=>label(r.join(''),37,153+y*14,16,amber,'Courier New'));
  label(`LOAD: ${Math.round(p*100).toString().padStart(3,'0')}%`,697,128,17,amber,'Courier New');
}
function blueprint(p){
  const blue='#174b91',white='#d4e9ff',faint='#3263a2';rect(0,0,960,480,blue,null);
  for(let x=0;x<960;x+=24)line([[x,0],[x,480]],faint,1);for(let y=0;y<480;y+=24)line([[0,y],[960,y]],faint,1);
  label('04 / PRESS ASSEMBLY',35,43,20,white,'Architects Daughter');label(t('press').toUpperCase(),35,95,42,white,'Architects Daughter');
  const top=375-(76-38*p),hand=[480,182+66*p];
  rect(637,137,25,251,blue,white,2);rect(525,130,153,20,blue,white,2);rect(585,150,15,top-164,blue,white,2);rect(530,375,160,15,blue,white,2);rect(548-7*p,top,87+14*p,375-top,blue,white,2);rect(530,top-15,123,15,blue,white,2);
  for(let x=553;x<635;x+=12)line([[x,top+3],[x+8,370]],white,1);
  line([hand,[592,213]],white,4);circle(...hand,8,blue,white,2);circle(592,213,7,blue,white,2);
  ctx.setLineDash([5,5]);line([[592,113],[592,405]],white,1);ctx.setLineDash([]);
  line([[675,top],[745,top],[775,top-18]],white,1);label('PLATEN',780,top-20,14,white,'Architects Daughter');
  line([[710,150],[710,374]],white,1);line([[701,150],[719,150]],white,1);line([[701,374],[719,374]],white,1);label('TRAVEL',727,250,13,white,'Architects Daughter');
  rect(35,178,257,215,blue,white,1);label('OPERATOR / DETAIL A',48,201,14,white,'Architects Daughter');
  // A separate operator inset keeps the moving mechanism legible at full size.
  const hx=246,hy=267+30*p;circle(128,264,21,blue,white,2);line([[104,246],[153,246],[145,234],[119,234],[104,246]],white,2);circle(139,262,2,white,null);
  line([[128,286],[128,331],[110,371]],white,3);line([[128,331],[153,371]],white,3);line([[128,295],[187,304],[hx,hy]],white,3);circle(hx,hy,5,blue,white,2);line([[hx,hy],[275,284]],white,2);
  line([[80,375],[177,375]],white,1);
  rect(35,420,890,35,blue,white,1);label('DRAWING 004     •     MOTION STUDY',48,443,13,white,'Architects Daughter');label('NOT TO SCALE',905,443,13,white,'Architects Daughter','right');
}
function render(){
  const index=Math.min(3,Math.floor(state.time/4)),local=state.time-index*4;
  const pressure=smooth((local-.9)/1.4);ctx.clearRect(0,0,960,480);[swiss,pixels,terminal,blueprint][index](pressure);
  if(local<.7){
    const hold=smooth(local/.16),scale=1.24-.24*hold;ctx.save();ctx.translate(480,245);ctx.scale(scale,scale);rect(-230,-65,460,130,'#ffe249',ink,6);label(t('press').toUpperCase()+'!',0,25,state.language==='zh'?65:77,ink,'Arial','center');ctx.restore();
  }
  if(local>2.4&&local<=3.55){const c=index===1?'#ffe249':index===2?'#ffc369':index===3?'#d4e9ff':'#d84225';label(t('success'),index===3?365:55,index===3?335:213,32,c,index===2?'Courier New':'Arial');}
  if(local>3.55){
    const a=smooth((local-3.55)/.2);ctx.save();ctx.globalAlpha=a;rect(0,0,960,480,'#502397',null);label(state.time>=16?t('success'):t('return'),480,235,62,'#ffe249','Arial','center');label(`${index+1} / 4`,480,294,26,'#fff7dc','Courier New','center');ctx.restore();
  }
  $('#material-name').textContent=`0${index+1} / ${t(['swissName','pixelName','terminalName','blueprintName'][index])}`;
  $('#round-label').textContent=`0${index+1} / 04`;
  $('#fuse-fill').style.transform=`scaleX(${1-clamp(local/4)})`;
  $('#timeline').value=state.time;$('#timeline').setAttribute('aria-valuetext',`${state.time.toFixed(1)} / 16 ${state.language==='zh'?'秒':'seconds'}`);
  $('#time').textContent=`${state.time.toFixed(2).padStart(5,'0')} / 16.00`;
  $('#play').textContent=t(state.playing?'pause':'play');$('#play').setAttribute('aria-pressed',String(state.playing));
  document.querySelectorAll('button[data-material]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  canvas.dataset.material=String(index);canvas.dataset.time=state.time.toFixed(2);
}
function pause(){state.playing=false;cancelAnimationFrame(state.raf);render();}
function tick(now){if(!state.playing)return;state.time=clamp(state.time+(now-state.previous)/1000,0,16);state.previous=now;if(state.time>=16)state.playing=false;render();if(state.playing)state.raf=requestAnimationFrame(tick);}
function play(){if(state.playing)return;if(state.time>=16)state.time=0;state.playing=true;state.previous=performance.now();render();state.raf=requestAnimationFrame(tick);}
$('#play').addEventListener('click',()=>state.playing?pause():play());
$('#replay').addEventListener('click',()=>{pause();state.time=0;play();});
$('#timeline').addEventListener('input',e=>{const time=Number(e.target.value);pause();state.time=time;render();});
document.querySelectorAll('button[data-material]').forEach(b=>b.addEventListener('click',()=>{pause();state.time=Number(b.dataset.material)*4+1.75;render();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');reducedMotion.addEventListener('change',e=>{if(e.matches)pause();});
function setLanguage(language){
  state.language=language;document.documentElement.lang=language;
  document.title=`${language==='zh'?'极速微游戏':'Microgame Frenzy'} — Codex Film Studio`;
  document.querySelectorAll('[data-i18n]').forEach(n=>{n.innerHTML=t(n.dataset.i18n);});
  document.querySelectorAll('[data-aria]').forEach(n=>n.setAttribute('aria-label',t(n.dataset.aria)));
  document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));
  document.querySelectorAll('[data-home]').forEach(a=>{const url=new URL(a.href);url.searchParams.set('lang',language);a.href=url.href;});
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  try{localStorage.setItem('film-studio-language',language);}catch{/* Language also persists in the URL. */}
  $('#copy-status').textContent='';render();
}
document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.language)));
$('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#command').textContent);$('#copy-status').textContent=t('copied');}catch{$('#copy-status').textContent=t('copyFailed');}});
let saved='en';try{saved=localStorage.getItem('film-studio-language')??'en';}catch{/* Storage is optional. */}
const requested=new URLSearchParams(location.search).get('lang');setLanguage((requested??saved)==='zh'?'zh':'en');

document.fonts.load('18px "Architects Daughter"').then(()=>render()).catch(()=>{});
