const $ = selector => document.querySelector(selector)
const $$ = selector => [...document.querySelectorAll(selector)]
const film = $('#film-player')
const originals = new Map($$('[data-zh]').map(element => [element, [...element.childNodes].map(node => node.cloneNode(true))]))
const attributes = ['aria-label', 'alt'].flatMap(attribute => {
  const data = attribute === 'alt' ? 'data-alt-zh' : 'data-aria-zh'
  return $$(`[${data}]`).map(element => ({element, attribute, english: element.getAttribute(attribute), chinese: element.getAttribute(data)}))
})
let language = 'en', timeline, mapping, frame = 0, sources = [], mediaReady = false, mediaFailed = false
let timelineFailed = false, comparisonFailed = false, sourcesFailed = false
const chapterNames = ['完成的作业', '研究测量了什么', '为什么顺畅不等于学会', 'Ada 自己掌握的一课', '迁移与隔一段时间再试', '数学之外：写作与代码', '下一次学习']
const text = (en, zh) => language === 'zh' ? zh : en
const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
const sourceCopy = [
  ['bjorklab', 'Learning, retrieval and desirable difficulties', '学习、提取与合意困难', '区分有帮助时的表现、独立表现、延迟记忆与迁移。片中的实践顺序是结合研究的教学建议。'],
  ['pnas.2422633122', 'Generative AI in high-school mathematics', '高中数学中的生成式 AI', '近千名土耳其高中生的实验中，GPT Base 组练习成绩相对高出 48%，无辅助考试成绩相对低 17%。教师提示护栏大体缓解了负面影响，但没有显示显著的正向考试收益。'],
  ['s41598-025-97652-6', 'A structured AI tutor in college physics', '大学物理中的结构化 AI 导师', '在这项研究的具体设置下，结构化 AI 导师组的即时后测表现优于主动课堂学习组。该结果不等于普遍优越，也不能说明数月后的记忆。'],
  ['01443410.2023.2273762', 'Worked examples for algebra novices', '面向代数初学者的解题示例', '解题示例可以帮助初学者；没有指导的困难练习并非普遍适用的建议。'],
  ['01693.x', 'Retrieval practice and delayed retention', '提取练习与延迟记忆', '短文实验中，重复学习在即时测试中占优，提取练习则更有利于延迟测试。重复学习还会提高信心；这不是一项 AI 实验。'],
  ['s11251-007-9015-8', 'Spacing and mixing mathematics practice', '间隔练习与混合题型', '分别检验间隔数学练习与混合题型的实验，都在后续测试中优于各自的对照条件。结果不能直接归因于聊天机器人。']
]

function updateLinks() {
  const here = new URL(location.href)
  $$('[data-section]').forEach(link => { link.href = `${here.pathname}${here.search}#${link.dataset.section}` })
}

function renderStatus() {
  const status = $('#status')
  status.textContent = mediaFailed
    ? text('Film unavailable. Check the retained local project.', '影片不可用，请检查保留的本地制作项目。')
    : mediaReady
      ? `${clock(film.currentTime)} / ${clock(film.duration)} · ${film.paused ? text('paused', '已暂停') : text('playing', '播放中')}`
      : text('Loading film…', '正在读取影片…')
}

function markChapter() {
  if (!timeline) return
  const active = timeline.chapters.findLastIndex(chapter => chapter.seconds <= film.currentTime)
  $$('#chapters button').forEach((button, index) => button.setAttribute('aria-current', String(index === active)))
}

function renderChapters() {
  const container = $('#chapters')
  container.replaceChildren()
  if (timelineFailed) {
    container.textContent = text('Chapter data is unavailable. Use the video controls.', '章节数据不可用，可以使用视频本身的播放控件。')
    return
  }
  if (!timeline) return
  timeline.chapters.forEach((chapter, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.disabled = !mediaReady
    const time = document.createElement('time')
    time.textContent = clock(chapter.seconds)
    const title = document.createElement('strong')
    title.textContent = language === 'zh' ? `${String(index + 1).padStart(2, '0')} · ${chapterNames[index]}` : chapter.title
    button.append(time, title)
    button.addEventListener('click', () => playFrom(chapter.seconds, true))
    container.append(button)
  })
  markChapter()
}

function renderSources() {
  const container = $('#sources')
  container.replaceChildren()
  if (sourcesFailed) {
    container.textContent = text('Source data is unavailable; use the complete source record below.', '来源数据暂时不可用，请使用下方的完整来源记录。')
    return
  }
  sources.forEach((source, index) => {
    const url = source.url || source.source
    const copy = sourceCopy.find(([match]) => url.includes(match))
    const item = document.createElement('li'), number = document.createElement('span'), body = document.createElement('div')
    const heading = document.createElement('h3'), link = document.createElement('a'), summary = document.createElement('p')
    number.className = 'source-number'
    number.textContent = String(index + 1).padStart(2, '0')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = (copy ? text(copy[1], copy[2]) : source.title || text('Original source', '原始资料')) + ' ↗'
    summary.textContent = language === 'zh' && copy ? copy[3] : source.claim || source.title
    heading.append(link)
    body.append(heading, summary)
    item.append(number, body)
    container.append(item)
  })
}

function renderComparison() {
  if (comparisonFailed) {
    $('#purpose').textContent = text('Frame-study files are unavailable in this local project.', '本地项目中的逐帧对照素材不可用。')
    return
  }
  if (!timeline || !mapping) return
  frame = Math.max(0, Math.min(timeline.duration_frames - 1, Math.round(frame)))
  const shot = timeline.shots.find(shot => shot.start <= frame && frame < shot.end)
  const reference = mapping[frame]
  $('#frame').value = frame
  $('#scrub').value = frame
  $('#shot').value = shot.id
  $('#ref').src = `review/reference/frames/${String(reference).padStart(6, '0')}.jpg`
  $('#new').src = `review/final/frames/${String(frame).padStart(6, '0')}.jpg?v=offset-frames-1`
  $('#refLabel').textContent = `LemoLab · Meet Pip · ${text('frame', '帧')} ${reference} · ${(reference / 24).toFixed(3)} s`
  $('#newLabel').textContent = `${text('This film', '本片')} · ${text('frame', '帧')} ${frame} · ${(frame / timeline.fps).toFixed(3)} s`
  $('#purpose').textContent = `${text('Shot note (original English)', '镜头说明（影片英文原文）')}: ${shot.purpose}`
  $('#prev').disabled = frame === 0
  $('#next').disabled = frame === timeline.duration_frames - 1
  $('#seek').disabled = !mediaReady
}

function setLanguage(next, remember = false) {
  language = next === 'zh' ? 'zh' : 'en'
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  for (const [element, nodes] of originals) {
    if (language === 'zh') element.textContent = element.dataset.zh
    else element.replaceChildren(...nodes.map(node => node.cloneNode(true)))
  }
  attributes.forEach(({element, attribute, english, chinese}) => element.setAttribute(attribute, language === 'zh' ? chinese : english))
  $$('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)))
  if (remember) {
    try { localStorage.setItem('midcentury-showcase-language', language) } catch {}
    const url = new URL(location.href)
    url.searchParams.set('lang', language)
    history.replaceState(null, '', url)
  }
  updateLinks()
  $('#copy-status').textContent = ''
  renderStatus()
  renderChapters()
  renderSources()
  renderComparison()
}

async function readJSON(path) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return response.json()
}

async function playFrom(seconds, showFilm = false) {
  if (!mediaReady) return
  film.currentTime = Math.max(0, Math.min(seconds, film.duration))
  if (showFilm) film.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'})
  try { await film.play() } catch { $('#status').textContent = text('Press the video play button to continue.', '请点击视频播放按钮继续。') }
}

function onMetadata() {
  mediaReady = !mediaFailed && Number.isFinite(film.duration) && film.duration > 0
  $('#play').disabled = $('#begin').disabled = !mediaReady
  renderStatus()
  renderChapters()
  renderComparison()
}
film.addEventListener('loadedmetadata', onMetadata)
film.addEventListener('error', () => { mediaFailed = true; onMetadata() })
for (const event of ['timeupdate', 'play', 'pause', 'ended']) film.addEventListener(event, () => { renderStatus(); markChapter() })
$('#play').addEventListener('click', () => film.paused ? playFrom(film.currentTime) : film.pause())
$('#begin').addEventListener('click', () => { if (mediaReady) film.currentTime = 0 })
$('#captions').addEventListener('click', () => {
  const track = film.textTracks[0]
  if (!track) return
  track.mode = track.mode === 'showing' ? 'disabled' : 'showing'
  $('#captions').setAttribute('aria-pressed', String(track.mode === 'showing'))
})
film.querySelector('track').addEventListener('error', () => { $('#status').textContent = text('English subtitle file is unavailable.', '英文字幕文件不可用。') })
$$('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language, true)))
$('#copy-prompt').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#prompt-text').textContent)
    $('#copy-status').textContent = text('Prompt copied. Paste it into your new Codex project.', '提示词已复制，可粘贴到新建的 Codex 项目中。')
  } catch {
    const range = document.createRange()
    range.selectNodeContents($('#prompt-text'))
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    $('#copy-status').textContent = text('Copy was blocked. The prompt is selected; press Command/Ctrl + C.', '自动复制不可用，已选中提示词，请按 Command/Ctrl + C。')
  }
})
$('#prev').addEventListener('click', () => { frame--; renderComparison() })
$('#next').addEventListener('click', () => { frame++; renderComparison() })
for (const id of ['frame', 'scrub']) $(`#${id}`).addEventListener('input', event => {
  if (event.target.value === '') return
  const next = Number(event.target.value)
  if (Number.isFinite(next)) { frame = next; renderComparison() }
})
$('#shot').addEventListener('change', event => { frame = timeline.shots.find(shot => shot.id === event.target.value).start; renderComparison() })
$('#seek').addEventListener('click', () => playFrom((frame + .1) / timeline.fps, true))
for (const id of ['ref', 'new']) $(`#${id}`).addEventListener('error', () => { $('#purpose').textContent = text('This indexed image is unavailable in the local project.', '本地项目中缺少此索引图像。') })

let initialLanguage = new URL(location.href).searchParams.get('lang')
if (!['en', 'zh'].includes(initialLanguage)) {
  try { initialLanguage = localStorage.getItem('midcentury-showcase-language') } catch {}
}
setLanguage(initialLanguage)
if (film.readyState >= 1) onMetadata()

async function loadTimeline() {
  try {
    timeline = await readJSON('content/timeline.json')
    renderChapters()
  } catch { timelineFailed = true; renderChapters(); comparisonFailed = true; renderComparison(); return }
  try {
    mapping = await readJSON('review/comparison/mapping.json')
    if (mapping.length !== timeline.duration_frames || !mapping.every(Number.isInteger)) throw new Error('Invalid mapping')
    const options = timeline.shots.map(shot => {
      const option = document.createElement('option')
      option.value = shot.id
      option.textContent = `${shot.id} · ${shot.title || shot.scene.replaceAll('_', ' ')}`
      return option
    })
    $('#shot').replaceChildren(...options)
    $('#frame').max = $('#scrub').max = timeline.duration_frames - 1
    for (const id of ['shot', 'frame', 'scrub']) $(`#${id}`).disabled = false
    renderComparison()
  } catch { comparisonFailed = true; renderComparison() }
}
async function loadSources() {
  try {
    const data = await readJSON('content/sources.json')
    sources = (Array.isArray(data) ? data : data.claims || []).filter(source => (source.url || source.source || '').startsWith('https://'))
  } catch { sourcesFailed = true }
  renderSources()
}
await Promise.allSettled([loadTimeline(), loadSources()])
