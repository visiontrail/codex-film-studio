import {
  C, PAPER, images, photo, scrap, label, ransom, flag, stamp,
  ease, clamp, scribble,
} from './materials.mjs'
import { prop, harvard } from './props.mjs'

// These seven scenes replace the repeated figure-plus-lecture-card staging.
// All actions are seekable: the same progress always produces the same frame.
const cue = (p, start, span = .16) => ease(clamp((p - start) / span))
const portraitCrops = {
  thinking: [702, 30, 256, 285],
  reading: [1109, 4, 218, 300],
  writing: [258, 508, 235, 270],
  surprised: [644, 508, 293, 260],
}

function portrait(g, pose, x, y, width, rotation = 0) {
  const crop = portraitCrops[pose]
  if (!images['learner-sheet']) return
  photo(g, 'learner-sheet', x, y, width, width * crop[3] / crop[2],
    { crop, rot: rotation, shadow: 16 })
}

function coloredField(g, color) {
  g.fillStyle = color; g.fillRect(0, 0, 1920, 1080)
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .62
  g.drawImage(PAPER, 0, 0); g.restore()
}

function strip(g, text, x, y, width, { size = 44, rot = 0, fill = '#e7d7b9', color = C.ink } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot)
  scrap(g, -18, -size - 9, width, size + 36,
    { fill, seed: text.length + 31, rag: 8, shadow: 7 })
  label(g, text, 0, 0, { size, color, font: 'Typewriter' })
  g.restore()
}

function paperExam(g, x, y, width, { rotation = -.06, subject = 'MATHEMATICS', filled = false, stampText = '' } = {}) {
  g.save(); g.translate(x, y); g.rotate(rotation); g.scale(width / 500, width / 500)
  scrap(g, 0, 0, 500, 650, { fill: '#eee5ce', rag: 8, seed: 81, shadow: 15 })
  label(g, subject, 36, 61, { size: 29, font: 'Headline' })
  label(g, 'EXAM', 34, 151, { size: 77, font: 'Editorial' })
  g.strokeStyle = '#595c4970'; g.lineWidth = 2
  g.beginPath(); g.moveTo(35, 175); g.lineTo(463, 175); g.stroke()
  label(g, 'Name', 36, 213, { size: 22, font: 'Typewriter' })
  g.beginPath(); g.moveTo(105, 216); g.lineTo(460, 216); g.stroke()
  const questions = subject === 'PHYSICS' ? ['1. Explain the force.', '2. Predict the flow.', '3. Justify your method.']
    : ['1.  2(x + 3) = 14', '2.  3(y - 2) = 15', '3.  Explain one step.']
  questions.forEach((q, i) => {
    label(g, q, 36, 280 + i * 106, { size: 26, font: 'Typewriter' })
    g.beginPath(); g.moveTo(36, 330 + i * 106); g.lineTo(460, 330 + i * 106); g.stroke()
  })
  if (filled) {
    label(g, 'x = 4', 82, 324, { size: 31, font: 'Editorial', color: '#3b6555' })
    label(g, 'y = 7', 82, 430, { size: 31, font: 'Editorial', color: '#3b6555' })
  }
  if (stampText) stamp(g, stampText, 60, 602, { size: 31, color: C.orange, rot: -.08 })
  g.restore()
}

function calendarLeaf(g, x, y, width, { word = 'LATER', rotation = .06, turn = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rotation); g.scale(width / 480, width / 480)
  for (let n = 2; n >= 0; n--) scrap(g, n * 7, n * 8, 480, 510,
    { fill: n ? '#c8c0a9' : '#f0e8d1', rag: 7, shadow: 8, seed: 51 + n })
  scrap(g, 0, 0, 480, 96, { fill: '#b33f3b', rag: 6, shadow: 0, seed: 54 })
  label(g, word, 240, 70, { size: 48, color: '#fff7e2', font: 'Headline', align: 'center' })
  for (let i = 0; i < 5; i++) {
    g.fillStyle = '#7d7b6b'; g.fillRect(49 + i * 84, -16, 9, 43)
  }
  const days = 'M T W T F S S'.split(' ')
  for (let i = 0; i < 7; i++) label(g, days[i], 49 + i * 63, 144,
    { size: 22, font: 'Typewriter', align: 'center', color: '#686b60' })
  for (let i = 0; i < 31; i++) label(g, String(i + 1), 49 + (i % 7) * 63, 204 + Math.floor(i / 7) * 55,
    { size: 29, font: 'Editorial', align: 'center' })
  if (turn < 1) {
    g.save(); g.beginPath(); g.rect(-20, -20, 530, 570); g.clip()
    const shift = -turn * 610
    scrap(g, 0, 96 + shift, 480, 414, { fill: '#dbd1b7', rag: 7, seed: 62, shadow: 12 })
    label(g, 'TODAY', 240, 300 + shift, { size: 85, font: 'Editorial', align: 'center' })
    g.restore()
  }
  g.restore()
}

function smallQuestion(g, x, y, width, variant = 0, rotation = 0) {
  strip(g, variant ? '3(y - 2) = 15' : '2(x + 3) = 14', x, y, width,
    { size: 53, rot: rotation, fill: '#ece8d8' })
}

export function metricScene(g, s, t, p) {
  if (Number(s.id) === 7) {
    // Time is a large physical object; a changed problem arrives on its own strip.
    coloredField(g, '#b9d0d6')
    scrap(g, 1020, -100, 1050, 1280, { fill: '#277774', rot: -.055, rag: 14, seed: 77 })
    scribble(g, 1490, 35, 450, 230, 93, '#eee5d2', .35)
    const turn = cue(p, .10, .23), replace = cue(p, .45, .18)
    calendarLeaf(g, 95, 160, 640, { word: 'LATER', rotation: -.10, turn })
    portrait(g, 'thinking', 695, 425, 545, -.035)
    ransom(g, 'LATER', 150, 950, { size: 134, seed: 118 })
    strip(g, 'Can you still do it?', 141, 1033, 590, { size: 36, rot: -.04 })
    label(g, 'SOMEWHERE', 1210, 175, { size: 88, font: 'Condensed', color: '#f5ead4' })
    label(g, 'NEW', 1270, 315, { size: 151, font: 'Editorial', color: '#f5ead4' })
    smallQuestion(g, 1180, 480, 660, 0, .035)
    // This is an actual opaque paper replacement, not a crossfade of text.
    g.save(); g.beginPath(); g.rect(1100, 340, 820, 450); g.clip()
    smallQuestion(g, 1180 + (1 - replace) * 900, 590, 660, 1, -.055)
    g.restore()
    if (p > .70) strip(g, 'Can you adapt the idea?', 1200, 805, 660,
      { size: 39, rot: .04, fill: '#e6c77a' })
    return
  }

  // Same question, two tangible situations. No floating comparison cards.
  coloredField(g, '#efe7d5')
  scrap(g, 1000, -100, 1100, 1300, { fill: '#397b74', rot: .055, rag: 15, seed: 71 })
  scribble(g, 0, 0, 390, 250, 55, '#2c332d', .22)
  portrait(g, 'reading', 58, 213, 445, -.025)
  prop(g, 'laptop', 350, 535, 630, -.07)
  ransom(g, 'WITH HELP', 94, 174, { size: 99, seed: 111 })
  strip(g, '2(x + 3) = 14', 450, 425, 515, { size: 43, rot: .045 })
  if (p > .12) strip(g, 'x = 4', 690, 538, 200,
    { size: 61, rot: -.06, fill: '#dfc564' })
  const pull = cue(p, .38, .19)
  portrait(g, 'writing', 1165, 315, 555, .035)
  prop(g, 'notebook', 1035, 765, 720, -.055)
  label(g, '2(x + 3) = 14', 1100, 895, { size: 42, font: 'Typewriter', rot: -.055 })
  g.save(); g.beginPath(); g.rect(975, 0, 945, 780); g.clip()
  strip(g, 'The worked solution', 1100 + pull * 1050, 260 - pull * 160, 750,
    { size: 51, rot: -.035 - pull * .07, fill: '#e5c778' })
  g.restore()
  if (pull > .48) label(g, 'ALONE', 1160, 200,
    { size: 150, color: '#fff1cf', font: 'Editorial', rot: -.035 })
  if (p > .73) {
    strip(g, 'Rebuild it.', 1330, 1010, 355, { size: 49, rot: .035, fill: '#edcf73' })
    label(g, 'With support', 140, 1010, { size: 43, font: 'Editorial' })
  }
}

function testedScene(g, p) {
  coloredField(g, '#adcbd1')
  scrap(g, -130, 900, 2240, 450, { fill: '#46616a', rot: -.13, rag: 16, seed: 14 })
  portrait(g, 'thinking', 1210, 183, 610, .015)
  paperExam(g, 150, 220 + (1 - cue(p, .03)) * 600, 515, { rotation: -.095 })
  stamp(g, 'TESTED NOW', 116, 213, { size: 47, rot: -.07, color: '#8d3831' })
  prop(g, 'clock', 515, 670, 300, .06)
  calendarLeaf(g, 780, 100 - (1 - cue(p, .33, .19)) * 750, 465,
    { word: 'MONTHS LATER?', rotation: .085, turn: 1 })
  if (p > .43) label(g, '?', 942, 400, { size: 150, font: 'Editorial', color: C.orange })
  const push = cue(p, .67, .18)
  g.save(); g.beginPath(); g.rect(670, 720, 1130, 340); g.clip()
  smallQuestion(g, 800 + (1 - push) * 1150, 948, 900, 1, -.035)
  g.restore()
  if (p > .80) strip(g, 'A different problem?', 1030, 1035, 670,
    { size: 39, rot: .02, fill: '#dfc76e' })
}

function differenceScene(g, p) {
  coloredField(g, '#e31777')
  scribble(g, 1150, 40, 690, 450, 151, '#f5dfc7', .20)
  portrait(g, 'surprised', 1030, 180, 820, .025)
  paperExam(g, -90, 505, 445, { rotation: -.18, stampText: 'EXAM RESULT' })
  prop(g, 'books', 1320, 850, 580, -.045)
  label(g, 'NO CLEAR', 138, 200, { size: 131, font: 'Condensed', color: '#f7e7cc', rot: -.025 })
  label(g, 'DIFFERENCE', 125, 345, { size: 132, font: 'Editorial', color: '#f7e7cc', rot: -.025 })
  const pull = cue(p, .30, .18)
  strip(g, 'A gain was not established.', 350, 550, 870,
    { size: 44, rot: .055, fill: '#ddca9c' })
  g.save(); g.beginPath(); g.rect(310, 600, 1120, 380); g.clip()
  strip(g, 'THE SAME?', 360 + (1 - pull) * 1200, 760, 800,
    { size: 78, rot: -.05, fill: '#e3cb79' })
  g.restore()
  if (p > .65) {
    g.save(); g.strokeStyle = '#a84032'; g.lineWidth = 11; g.lineCap = 'round'
    g.beginPath(); g.moveTo(345, 730); g.lineTo(1060, 670); g.stroke(); g.restore()
    strip(g, 'Not proof of equality.', 455, 919, 835,
      { size: 47, rot: -.025, fill: '#eadfc2' })
  }
}

// Low-resolution geographic outline, retrieved 2026-10-22 from:
// https://raw.githubusercontent.com/johan/world.geo.json/master/countries/TUR.geo.json
// Drawn as an orientation map; the film does not claim national sampling.
const turkeyOutline = [
  [[36.913,41.335],[38.348,40.949],[39.513,41.103],[40.373,41.014],[41.554,41.536],[42.620,41.583],[43.583,41.092],[43.753,40.740],[43.656,40.254],[44.400,40.005],[44.794,39.713],[44.109,39.428],[44.421,38.281],[44.226,37.972],[44.773,37.170],[44.293,37.002],[43.942,37.256],[42.779,37.385],[42.350,37.230],[41.212,37.074],[40.673,37.091],[39.523,36.716],[38.700,36.713],[38.168,36.901],[37.067,36.623],[36.739,36.818],[36.685,36.260],[36.418,36.041],[36.150,35.822],[35.782,36.275],[36.161,36.651],[35.551,36.565],[34.715,36.796],[34.027,36.220],[32.509,36.108],[31.700,36.644],[30.622,36.678],[30.391,36.263],[29.700,36.144],[28.733,36.677],[27.641,36.659],[27.049,37.653],[26.318,38.208],[26.805,38.986],[26.171,39.464],[27.280,40.420],[28.820,40.460],[29.240,41.220],[31.146,41.088],[32.348,41.736],[33.513,42.019],[35.168,42.040],[36.913,41.335]],
  [[27.192,40.691],[26.358,40.152],[26.043,40.618],[26.057,40.824],[26.295,40.936],[26.604,41.562],[26.117,41.827],[27.136,42.141],[27.997,42.007],[28.116,41.623],[28.988,41.300],[28.806,41.055],[27.619,41.000],[27.192,40.691]],
]

function schoolScopeScene(g, p) {
  coloredField(g, '#c1d3d6')
  scrap(g, -95, 105, 1200, 780, { fill: '#d2c6a5', rot: -.07, rag: 14, seed: 170 })
  g.save(); g.translate(-95, 105); g.rotate(-.07)
  g.strokeStyle = '#6f735047'; g.lineWidth = 1.3
  for (let x = 25; x < 1200; x += 55) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 780); g.stroke() }
  for (let y = 25; y < 780; y += 55) { g.beginPath(); g.moveTo(0, y); g.lineTo(1200, y); g.stroke() }
  g.restore()
  g.save(); g.fillStyle = '#56756a'; g.strokeStyle = '#2c4a43'; g.lineWidth = 2.5
  for (const ring of turkeyOutline) {
    g.beginPath()
    ring.forEach(([lon, lat], i) => {
      const x = 95 + (lon - 26) / 19 * 940, y = 330 + (42.4 - lat) / 7 * 290
      if (i) g.lineTo(x, y); else g.moveTo(x, y)
    })
    g.closePath(); g.fill(); g.stroke()
  }
  g.restore()
  ransom(g, 'TURKEY', 195, 245, { size: 133, seed: 170 })
  const drop = cue(p, .08, .18)
  flag(g, 'TR', 105, 532 - (1 - drop) * 650, 285, 185, -.065)
  prop(g, 'desk', 475, 550, 465, .04)
  portrait(g, 'thinking', 1240, 190, 590, -.02)
  strip(g, 'One school setting', 180, 775, 790,
    { size: 51, rot: -.06, fill: '#e7d6a8' })
  const test = cue(p, .34, .18)
  paperExam(g, 925, 460 + (1 - test) * 700, 430,
    { rotation: .10, subject: 'MATHEMATICS', stampText: 'SHORT-TERM EXAM' })
  if (p > .69) {
    strip(g, 'Years later? Not measured here.', 95, 1010, 780,
      { size: 36, rot: .015 })
  }
}

function immediateScene(g, p) {
  coloredField(g, '#315d62')
  scrap(g, -125, -110, 1000, 1300, { fill: '#cec1a0', rot: .08, rag: 15, seed: 201 })
  // A large face and antique clock form the primary image, not a text card.
  harvard(g, 130, 100, 190)
  paperExam(g, 95, 425 + (1 - cue(p, .03)) * 600, 410,
    { rotation: -.10, subject: 'PHYSICS', stampText: 'AFTER THE LESSON' })
  label(g, 'NOW', 1092, 170, { size: 157, font: 'Editorial', color: '#f2e3bd', rot: -.025 })
  const later = cue(p, .36, .20)
  g.save(); g.beginPath(); g.rect(340, 0, 920, 500); g.clip()
  calendarLeaf(g, 470, -540 + later * 570, 430,
    { word: 'MONTHS LATER?', rotation: .13, turn: 1 })
  g.restore()
  portrait(g, 'thinking', 600, 225, 610, -.035)
  prop(g, 'clock', 1270, 195, 620, .045)
  if (p > .69) {
    strip(g, 'That question remains open.', 770, 990, 1075,
      { size: 51, rot: -.035, fill: '#e0c878' })
  }
}

function preprintScene(g, p) {
  coloredField(g, '#475d62')
  scribble(g, 1030, 10, 770, 270, 271, '#e7dac2', .18)
  portrait(g, 'thinking', 1190, 225, 630, .02)
  // The fractions are the dominant image: a concrete task, not a generic limit list.
  label(g, 'ONE', 118, 165, { size: 151, font: 'Condensed', color: '#f4e8ce', rot: -.035 })
  label(g, 'NARROW TASK', 125, 290, { size: 111, font: 'Editorial', color: '#f4e8ce', rot: -.035 })
  const values = [[130, 445, '1', '2'], [590, 480, '1', '3']]
  values.forEach(([x, y, a, b], i) => {
    g.save(); g.translate(x, y + (1 - cue(p, .06 + i * .15, .18)) * 620); g.rotate(i ? .075 : -.06)
    scrap(g, -20, -110, 330, 450, { fill: i ? '#e0c378' : '#f0e8d7', rag: 11, seed: 280 + i, shadow: 14 })
    label(g, a, 145, 30, { size: 161, font: 'Editorial', align: 'center' })
    g.strokeStyle = '#28332d'; g.lineWidth = 6; g.beginPath(); g.moveTo(30, 74); g.lineTo(255, 74); g.stroke()
    label(g, b, 145, 255, { size: 161, font: 'Editorial', align: 'center' })
    g.restore()
  })
  label(g, '+', 465, 620, { size: 114, font: 'Editorial', color: '#f4e8ce' })
  prop(g, 'hand', 750, 660, 400, -.28)
  if (p > .40) stamp(g, 'PREPRINT', 170, 925,
    { size: 88, rot: -.095, color: '#f0d8b0' })
  if (p > .70) strip(g, 'Promising. Still limited.', 700, 1040, 1060,
    { size: 47, rot: -.02, fill: '#e3cd92' })
}

export function boundaryScene(g, s, t, p) {
  const id = Number(s.id)
  if (id === 8) return testedScene(g, p)
  if (id === 15) return differenceScene(g, p)
  if (id === 17) return schoolScopeScene(g, p)
  if (id === 20) return immediateScene(g, p)
  if (id === 27) return preprintScene(g, p)
  throw new RangeError(`No authored critical scene for ${s.id}`)
}
