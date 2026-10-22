import { GlobalFonts } from '@napi-rs/canvas'
import fs from 'node:fs'
import { C, PAPER, images, photo, scrap, flag, arrow, check, cross, ease } from './materials.mjs'
import { prop } from './props.mjs'
import { background } from './backgrounds.mjs'

const handwriting = '/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf'
if (fs.existsSync(handwriting)) GlobalFonts.registerFromPath(handwriting, 'PracticeHand')

// Manually inspected source bounds; the six cutouts are deliberately unequal.
const STUDY = {
  papers: [7, 25, 418, 510],
  classroom: [449, 99, 650, 395],
  calendar: [1138, 67, 398, 502],
  teacher: [26, 549, 466, 447],
  algebra: [501, 547, 553, 447],
  eyes: [1054, 644, 482, 260],
}
function study(g, kind, x, y, w, rot = 0) {
  const b = STUDY[kind], im = images['study-sheet']
  if (!im) return false
  const crop = [b[0] * im.width / 1536, b[1] * im.height / 1024,
    b[2] * im.width / 1536, b[3] * im.height / 1024]
  return photo(g, 'study-sheet', x, y, w, w * b[3] / b[2], { crop, rot, shadow: 8 })
}
function stage(g, kind, s, t) { background(g, kind, Math.floor(t * 25), Number(s.index || s.id || 0)) }
function progress(p, at, duration = .12) { return ease((p - at) / duration) }
function ink(g, text, x, y, size = 90, width = 1300, color = C.ink, align = 'left') {
  g.save(); g.font = `${size}px PracticeHand, Editorial, Unicode`
  while (g.measureText(text).width > width && size > 20) {
    size -= 1; g.font = `${size}px PracticeHand, Editorial, Unicode`
  }
  g.fillStyle = color; g.textAlign = align; g.fillText(text, x, y); g.restore()
}
function type(g, text, x, y, size = 36, width = 1300, color = C.ink, align = 'left') {
  g.save(); g.font = `${size}px Typewriter`
  while (g.measureText(text).width > width && size > 18) {
    size -= 1; g.font = `${size}px Typewriter`
  }
  g.fillStyle = color; g.textAlign = align; g.fillText(text, x, y); g.restore()
}
function ruled(g, x, y, w, h, rot = 0, seed = 21, fill = '#eee6d3') {
  g.save(); g.translate(x, y); g.rotate(rot)
  scrap(g, -11, 14, w + 15, h - 4, { fill: '#c7bda2', rag: 8, rot: -.008, seed: seed + 1, shadow: 13 })
  scrap(g, 0, 0, w, h, { fill, rag: 8, seed, shadow: 7 })
  g.strokeStyle = '#6e999539'; g.lineWidth = 1.4
  for (let yy = 112; yy < h - 30; yy += 91) {
    g.beginPath(); g.moveTo(24, yy); g.lineTo(w - 20, yy + 2); g.stroke()
  }
  g.strokeStyle = '#a35f5d55'; g.lineWidth = 2
  g.beginPath(); g.moveTo(88, 26); g.lineTo(89, h - 22); g.stroke()
  g.strokeStyle = '#76684c18'; g.lineWidth = 5
  g.beginPath(); g.moveTo(w * .57, 5); g.lineTo(w * .575, h - 4); g.stroke()
  g.restore()
}
function tape(g, x, y, w = 160, rot = -.06) {
  g.save(); g.globalAlpha = .55
  scrap(g, x, y, w, 44, { fill: '#bdae83', seed: 404, rag: 7, rot, shadow: 0 })
  g.restore()
}
function paperLine(g, text, x, y, w, h = 145, size = 83, rot = 0, color = C.ink, fill = '#ece3cc') {
  g.save(); g.translate(x, y); g.rotate(rot)
  scrap(g, 0, 0, w, h, { fill, rag: 9, seed: text.length * 31, shadow: 10 })
  ink(g, text, 45, h * .72, size, w - 90, color)
  g.restore()
}

export function retrieval(g, s, t, p) {
  const id = Number(s.id)
  if (id === 29) return checkMistake(g, s, t, p)
  stage(g, 'white', s, t)
  study(g, 'papers', -70, 470, 500, -.10)
  study(g, 'eyes', 960, -160, 850, .035)
  const rot = -.028, x = 190, y = 230
  ruled(g, x, y, 1500, 850, rot, 620)
  g.save(); g.translate(x, y); g.rotate(rot)
  type(g, id === 28 ? 'RETRIEVAL PRACTICE' : 'LOOKING IS NOT THE SAME AS RECALLING', 140, 67, 32, 1260, '#64614c')
  ink(g, '2(x + 3) = 14', 150, 195, 115, 1240)
  ink(g, 'x + 3 = 7', 150, 390, 112, 1090, '#3c5653')
  ink(g, 'x = 4', 150, 565, 112, 1050, '#3c5653')
  ink(g, '2(4 + 3) = 14', 150, 740, 74, 510, '#3c5653')
  const covered = progress(p, id === 28 ? .04 : .33, .14)
  const compare = id === 28 ? progress(p, .74, .12) : 0
  const coverX = 105 + (1 - covered) * 1750 + compare * 610
  const coverY = 245 - compare * 10
  g.save(); g.translate(coverX, coverY); g.rotate(.014)
  scrap(g, 0, 0, 1300, 580, { fill: '#e5d6b7', rag: 14, seed: 817, shadow: 14 })
  tape(g, 930, -12, 220, -.035)
  type(g, compare > .5 ? 'YOUR RECONSTRUCTION' : 'WITH THE ANSWER COVERED', 70, 80, 31, compare > .5 ? 660 : 1160, '#6a5b41')
  if (p > (id === 28 ? .40 : .72)) {
    const writing = progress(p, id === 28 ? .40 : .72, .11)
    g.save(); g.beginPath(); g.rect(50, 130, 1120 * writing, 300); g.clip()
    ink(g, id === 28 ? 'x + 3 = 7' : 'x + 3 = ...', 70, 260, 100, compare > .5 ? 640 : 1140)
    if (id === 28) ink(g, 'x = 4', 70, 418, 100, 850)
    g.restore()
  }
  g.restore()
  if (id === 28 && compare > .6) {
    check(g, 570, 560, 45, C.teal)
    type(g, 'COMPARE THE STEPS', 140, 815, 30, 1120, C.teal)
  }
  g.restore()
  if (p > .4) {
    const hand = progress(p, .4, .14)
    prop(g, 'hand', 1430 + (1 - hand) * 650, 720, 420, -.23)
  }
  if (id === 28) {
    paperLine(g, '44-study review', 55, 80, 620, 125, 64, -.04)
  }
}

function checkMistake(g, s, t, p) {
  stage(g, 'magenta', s, t)
  // The repeated print is deliberately wrong and is visibly interrupted below.
  g.save(); g.globalAlpha = .60
  paperLine(g, '2x + 3 = 14', -80, 130, 870, 150, 102, -.06, '#603828', '#e6bfba')
  paperLine(g, '2x + 3 = 14', 890, 115, 950, 150, 102, .04, '#603828', '#e6bfba')
  paperLine(g, '2x + 3 = 14', 140, 890, 960, 150, 102, -.04, '#603828', '#e6bfba')
  g.restore()
  paperLine(g, '2(x + 3) = 14', 110, 290, 1640, 220, 132, -.018)
  paperLine(g, '2x + 3 = 14', 235, 535, 1350, 190, 124, .022)
  if (p > .39) {
    const e = progress(p, .39, .12)
    cross(g, 640, 636, 56 * e, C.orange)
    prop(g, 'hand', 1390 + (1 - e) * 700, 520, 470, -.32)
  }
  if (p > .73) {
    const e = progress(p, .73, .12)
    g.save(); g.translate(100, 740 + (1 - e) * 650); g.rotate(-.023)
    scrap(g, 0, 0, 1660, 310, { fill: '#c6d3bd', seed: 315, rag: 13, shadow: 14 })
    ink(g, '2x + 6 = 14', 70, 130, 120, 1390, '#243c35')
    ink(g, 'Check: 2(4 + 3) = 14', 70, 245, 82, 1490, '#243c35')
    check(g, 1500, 115, 50, '#275f4e'); g.restore()
  }
}

export function novice(g, s, t, p) {
  stage(g, 'blue', s, t)
  study(g, 'classroom', -30, 150, 1130, -.035)
  paperLine(g, 'A way in', 85, 60, 700, 155, 118, -.045)
  flag(g, 'ID', 1400, 55, 340, 225, .045)
  type(g, 'INDONESIA', 1415, 328, 37, 400)
  const e = progress(p, .05, .12)
  g.save(); g.translate((1 - e) * 1100, (1 - e) * 70)
  study(g, 'algebra', 820, 350, 1040, -.02)
  g.save(); g.translate(880, 520); g.rotate(-.025)
  scrap(g, 0, 0, 540, 475, { fill: '#e9dfc4', rag: 8, seed: 315 })
  type(g, 'WORKED EXAMPLE', 33, 58, 29, 475, '#655e47')
  ink(g, '3(a + 2)', 35, 170, 85, 470)
  ink(g, '= 3a + 6', 35, 300, 85, 470)
  if (p > .40) {
    arrow(g, 165, 330, 320, 390, { color: C.orange, width: 5, wiggle: -25 })
  }
  g.restore(); g.restore()
  scrap(g, 65, 817, 570, 59, { fill: '#d9e1d8', seed: 30, rag: 5, shadow: 2 })
  type(g, 'Illustrative classroom', 90, 855, 29, 520, '#344f55')
  if (p > .4) {
    const f = progress(p, .4, .12)
    paperLine(g, '4(b + 3) = ?', 1190 + (1 - f) * 900, 820, 650, 195, 80, .025)
  }
  if (p > .74) paperLine(g, 'Tested just after learning', 70, 935, 1030, 100, 51, -.02)
}

export function sequence(g, s, t, p) {
  stage(g, 'triptych', s, t)
  study(g, 'papers', 75, 280, 690, -.06)
  study(g, 'teacher', 1130, 175, 690, .035)
  paperLine(g, 'TRY, THEN INSTRUCTION', 160, 85, 1490, 170, 104, -.025)
  type(g, '53-study review', 125, 301, 47, 600)
  const e = progress(p, .07, .15)
  arrow(g, 730, 430, 1100, 365, { color: '#f5e6bf', width: 13 * e, wiggle: -38 })
  if (p > .41) {
    const f = progress(p, .41, .14)
    paperLine(g, 'INSTRUCTION, THEN TRY', 570 - (1 - f) * 1750, 780, 1220, 150, 85, .018)
  }
  if (p > .74) {
    paperLine(g, 'Learner', 100, 945, 490, 100, 58, -.025, C.ink, '#d5c68b')
    paperLine(g, 'Task', 665, 965, 390, 100, 58, .025, C.ink, '#bdc9b9')
    paperLine(g, 'Design', 1220, 950, 500, 100, 58, -.015, C.ink, '#d4b6ba')
  }
}

export function protocol(g, s, t, p) {
  stage(g, 'teal', s, t)
  const id = Number(s.id)
  if (id === 36) {
    ink(g, 'One skill. One problem.', 960, 180, 91, 1430, '#f0e5c5', 'center')
    const e = progress(p, .04, .14)
    study(g, 'algebra', 550, 300 - (1 - e) * 700, 820, -.035)
    g.save(); g.translate(600, 440 - (1 - e) * 700); g.rotate(-.04)
    scrap(g, 0, 0, 360, 400, { fill: '#e9dfc9', seed: 91, rag: 7, shadow: 5 })
    type(g, 'BRACKETS', 28, 48, 31, 300, '#71624b')
    ink(g, '2(x + 3) = 14', 28, 132, 52, 305)
    type(g, 'Your attempt', 28, 220, 28, 300, '#71624b')
    if (p > .72) ink(g, 'x + 3 = ...', 28, 312, 52, 305)
    g.restore()
    if (p > .40) {
      const f = progress(p, .40, .16)
      prop(g, 'hand', 1120 + (1 - f) * 750, 670, 400, -.28)
    }
    type(g, 'Practical learning check', 960, 1030, 34, 1200, '#e1d4b7', 'center')
  } else {
    ink(g, 'New topic?', 180, 160, 104, 900, '#f2e8cb')
    study(g, 'algebra', 160, 270, 1020, -.035)
    const e = progress(p, .4, .14)
    if (p > .4) {
      g.save(); g.strokeStyle = '#bd5a36'; g.lineWidth = 6
      g.beginPath(); g.ellipse(440, 570, 175, 68, -.03, 0, Math.PI * 2 * e); g.stroke(); g.restore()
      g.save(); g.translate(1150 + (1 - e) * 900, 370); g.rotate(.04)
      scrap(g, 0, 0, 630, 440, { fill: '#e7ddc2', rag: 13, seed: 342, shadow: 13 })
      ink(g, 'Which step?', 45, 115, 85, 535)
      ink(g, 'Why divide both', 45, 235, 65, 535)
      ink(g, 'sides by 2?', 45, 335, 65, 535)
      tape(g, 330, -20, 220, -.06); g.restore()
    }
    if (p > .74) {
      prop(g, 'hand', 1370, 760, 410, -.3)
      type(g, 'Show your attempt.', 1120, 255, 40, 650, '#eee0bb')
    }
  }
}

function laterCalendar(g, x, y, w) {
  g.save(); g.translate(x, y); g.scale(w / 398, w / 398)
  study(g, 'calendar', 0, 0, 398)
  // The photographed calendar says 7. Cover that numeral completely: this scene
  // deliberately recommends no specific or universal delay.
  g.save(); g.beginPath(); g.moveTo(80, 142); g.lineTo(232, 110)
  g.lineTo(281, 325); g.lineTo(122, 360); g.closePath()
  g.fillStyle = '#ddd0ad'; g.shadowColor = '#33271833'; g.shadowBlur = 4; g.fill()
  g.clip(); g.shadowColor = 'transparent'; g.globalCompositeOperation = 'multiply'; g.globalAlpha = .45
  g.drawImage(PAPER, 70, 110, 220, 260); g.restore()
  g.save(); g.translate(125, 226); g.rotate(-.20)
  ink(g, 'LATER', 0, 0, 42, 140)
  type(g, 'return & try', -1, 43, 15, 145, '#716146'); g.restore()
  g.restore()
}
function envelope(g, x, y, w, h) {
  g.save(); g.translate(x, y); g.rotate(.045)
  scrap(g, 0, 0, w, h, { fill: '#c9b68d', rag: 6, seed: 611, shadow: 14 })
  g.fillStyle = '#d8c6a1'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0)
  g.lineTo(w * .53, h * .61); g.closePath(); g.fill()
  g.strokeStyle = '#7e6d4c60'; g.lineWidth = 2
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w * .53, h * .61); g.lineTo(w, 0); g.stroke()
  g.beginPath(); g.moveTo(0, h); g.lineTo(w * .3, h * .48); g.moveTo(w, h); g.lineTo(w * .74, h * .44); g.stroke()
  type(g, 'EARLIER SOLUTION', w / 2, h * .84, 42, w - 80, '#514833', 'center')
  tape(g, w * .43, h * .49, w * .19, -.07); g.restore()
}
export function calendar(g, s, t, p) {
  stage(g, 'botanical', s, t)
  laterCalendar(g, 80, 95, 650)
  const e = progress(p, .05, .14)
  envelope(g, 855, 130 - (1 - e) * 660, 825, 435)
  if (p > .4) {
    const f = progress(p, .4, .15)
    g.save(); g.translate(710, 665 + (1 - f) * 580); g.rotate(-.045)
    ruled(g, 0, 0, 1110, 370, 0, 701)
    type(g, 'FRESH PROBLEM', 130, 78, 35, 900, '#72604a')
    ink(g, '3(y − 2) = 15', 130, 222, 105, 900)
    g.restore()
  }
  if (p > .75) paperLine(g, 'Keep the earlier solution hidden.', 755, 564, 1080, 105, 47, -.018)
}

export function log(g, s, t, p) {
  stage(g, 'news', s, t)
  study(g, 'papers', -80, 300, 610, -.12)
  const x = 175, y = 90, rot = -.017
  // The record arrives as one sheet; its three paper columns are placed in
  // sequence rather than leaving an empty table on screen for five seconds.
  const landing = progress(p, .02, .10)
  g.save(); g.translate(0, (1 - landing) * 1000)
  ruled(g, x, y, 1570, 925, rot, 201)
  g.save(); g.translate(x, y); g.rotate(rot)
  type(g, 'A SMALL LEARNING RECORD', 145, 96, 45, 1300, '#62573f')
  const columns = [145, 645, 1115]
  const heading = ['ATTEMPT', 'HELP', 'ALONE']
  heading.forEach((word, i) => ink(g, word, columns[i], 245, 76, i === 2 ? 385 : 410))
  const texts = [
    ['Brackets', '2(x + 3) = 14', 'x + 3 = ?'],
    ['One hint', 'Divide both', 'sides by 2'],
    ['Rebuilt it', 'x + 3 = 7', 'x = 4'],
  ]
  const fills = ['#dfc6a4', '#d5b2a5', '#c0ccba']
  g.save(); g.beginPath(); g.rect(90, 285, 1460, 460); g.clip()
  for (let i = 0; i < 3; i++) {
    const e = progress(p, .14 + i * .23, .12)
    if (e === 0) continue
    g.save(); g.translate(columns[i] - 20, 310 + (1 - e) * 500)
    g.rotate([-.012, .014, -.01][i])
    scrap(g, 0, 0, i === 0 ? 460 : 420, 420, { fill: fills[i], rag: 14, seed: 944 + i, shadow: 9 })
    texts[i].forEach((text, row) => ink(g, text, 20, 85 + row * 115, row === 0 ? 65 : 59, i === 0 ? 410 : 375))
    g.restore()
  }
  g.restore()
  if (p > .80) {
    const tabs = progress(p, .80, .08)
    g.save(); g.translate((1 - tabs) * -1600, 0)
    paperLine(g, 'Change the problem', 125, 785, 800, 105, 57, -.03, '#294b3d', '#c6d0b8')
    paperLine(g, 'Return later', 980, 792, 530, 105, 57, .015, '#294b3d', '#d8c493')
    g.restore()
  }
  g.restore(); g.restore()
  const move = progress(p, .12, .62)
  prop(g, 'hand', 680 + move * 860, 865 - Math.sin(move * Math.PI) * 65, 350, -.28)
}

// The type-named exports plug directly into the scene dispatch table; aliases
// also match the existing renderer's naming convention.
export { retrieval as retrievalScene, novice as noviceScene, sequence as sequenceScene,
  protocol as protocolScene, calendar as calendarScene, log as logScene }
