import { startOrbit } from './orbit.mjs'

const $ = selector => document.querySelector(selector)
const player = $('#film-player')
const languageButtons = [...document.querySelectorAll('[data-language]')]
const translations = [...document.querySelectorAll('[data-zh]')].map(element => {
  element.innerHTML=element.innerHTML.replaceAll('\\n','\n')
  return { element, en:element.innerHTML, zh:element.dataset.zh.replaceAll('\\n','\n') }
})
const labels = [...document.querySelectorAll('[data-zh-label]')].map(element => ({element,en:element.getAttribute('aria-label'),zh:element.dataset.zhLabel}))
const descriptions = [...document.querySelectorAll('[data-zh-alt]')].map(element => ({element,en:element.alt,zh:element.dataset.zhAlt}))
const text = {
  en:{ title:'Singapore · Satellite Briefing — Codex Film Studio', error:'The film could not be loaded. Download the MP4 below, or reopen this page through the local style server.', copied:'Prompt copied.', copyError:'Copy is unavailable in this browser. Select the prompt text to copy it.', paused:'Playback is paused. Use the video’s Play control to continue.' },
  zh:{ title:'新加坡 · 卫星简报 — Codex Film Studio', error:'影片暂时无法加载。可下载下方 MP4，或通过本地风格服务器重新打开页面。', copied:'提示词已复制。', copyError:'此浏览器无法自动复制，请选择提示词文字复制。', paused:'播放已暂停，可使用播放器的播放按钮继续。' }
}
let language='en', filmStatus='', copyStatus=''
const status = () => {
  $('#film-error').hidden=!filmStatus
  $('#film-error').textContent=text[language][filmStatus] || ''
  $('#copy-status').textContent=text[language][copyStatus] || ''
}
function setLanguage(next, persist=false) {
  language=next==='zh'?'zh':'en'
  document.documentElement.lang=language==='zh'?'zh-CN':'en'
  document.title=text[language].title
  for(const row of translations) {
    if(language==='en') row.element.innerHTML=row.en
    else row.element.textContent=row.zh
  }
  labels.forEach(row=>row.element.setAttribute('aria-label',row[language]))
  descriptions.forEach(row=>row.element.alt=row[language])
  languageButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)))
  status()
  if(persist) {
    try{localStorage.setItem('codex-film-language',language)}catch{}
    const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url)
  }
}
let savedLanguage
try{savedLanguage=localStorage.getItem('codex-film-language')}catch{}
setLanguage(new URLSearchParams(location.search).get('lang') || savedLanguage || 'en')
languageButtons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language,true)))

// Retain the previous page's bounded local preview-source parameter.
const requestedSource = new URLSearchParams(location.search).get('src')
if(requestedSource && /^media\/[\w.-]+\.mp4$/.test(requestedSource)) {
  const source=`/_projects/satellite-film/${requestedSource}`
  player.src=source
  $('#download-film').href=source
}
const chapters=[...document.querySelectorAll('[data-seek]')]
const updateChapter=()=>{
  const active=chapters.findLast(button=>player.currentTime>=Number(button.dataset.seek)-.05) || chapters[0]
  chapters.forEach(button=>{
    if(button===active)button.setAttribute('aria-current','true')
    else button.removeAttribute('aria-current')
  })
}
player.addEventListener('timeupdate',updateChapter)
player.addEventListener('error',()=>{filmStatus='error';status()})
player.querySelector('source')?.addEventListener('error',()=>{filmStatus='error';status()})
player.addEventListener('playing',()=>{filmStatus='';status()})
chapters.forEach(button=>button.addEventListener('click',async()=>{
  player.currentTime=Number(button.dataset.seek)
  updateChapter()
  $('#screen').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})
  try{await player.play()}catch{filmStatus=player.error?'error':'paused';status()}
}))
$('#colour-scan').addEventListener('input',event=>{
  $('#scan-map').style.setProperty('--split',`${event.target.value}%`)
})
$('#copy-prompt').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('#prompt').textContent.trim());copyStatus='copied'}catch{copyStatus='copyError'}
  status()
})
startOrbit($('#orbit'),$('.target-marker')).catch(()=>$('.orbit-field').classList.add('unavailable'))
