import {
  C, PAPER, images, photo, scrap, label, ransom, stamp, ornament,
  chatBadge, ease, clamp,
} from './materials.mjs'
import { prop, harvard } from './props.mjs'
import { background } from './backgrounds.mjs'

// Three scenes with finite paper actions, authored against the existing timeline.
// These are visual-functional matches to the reference, not pixel alignment.
// All movement is seekable; settled objects have no random per-frame jitter.
const cue = (p, at, span = .12) => ease(clamp((p - at) / span))

function fit(g, text, x, y, width, size, {
  font = 'Editorial', color = C.ink, align = 'left',
} = {}) {
  g.save(); g.font = `${size}px ${font}, Unicode`
  while (g.measureText(text).width > width && size > 18) {
    size -= 1; g.font = `${size}px ${font}, Unicode`
  }
  g.fillStyle = color; g.textAlign = align; g.fillText(text, x, y); g.restore()
}

function study(g, name, x, y, width, rotation = 0) {
  const im = images['study-sheet']
  if (!im) return
  const bounds = name === 'eyes' ? [1054, 644, 482, 260] : [1138, 67, 398, 502]
  const crop = [bounds[0] * im.width / 1536, bounds[1] * im.height / 1024,
    bounds[2] * im.width / 1536, bounds[3] * im.height / 1024]
  photo(g, 'study-sheet', x, y, width, width * bounds[3] / bounds[2],
    { crop, rot: rotation, shadow: 13 })
}

function inkStrip(g, text, x, y, width, {
  size = 61, rot = 0, fill = '#efe4c9', seed = 1, backing = false,
} = {}) {
  g.save(); g.translate(x, y); g.rotate(rot)
  if (backing) {
    scrap(g, -28, -size - 31, width + 61, size + 93,
      { fill: '#2b2928', seed: seed + 40, rag: 11, shadow: 11, rot: -.017 })
    g.save(); g.globalAlpha = .24; g.globalCompositeOperation = 'screen'
    g.drawImage(PAPER, -28, -size - 31, width + 61, size + 93); g.restore()
  }
  scrap(g, -17, -size - 18, width + 34, size + 59,
    { fill, seed, rag: 9, shadow: 8 })
  fit(g, text, 7, 0, width - 14, size)
  g.restore()
}

/** S16: three paired examples physically replace one another around the eyes. */
export function helpSceneV8(g, s, t, p) {
  background(g, 'magenta', Math.round(t * 25), s.index)
  const eyeIn = cue(p, 0, .13), look = cue(p, .68, .16)
  const eyeWidth = 1110 + look * 110
  study(g, 'eyes', 405 - look * 60, 285 + (1 - eyeIn) * 590 - look * 20,
    eyeWidth, -.025 + (1 - eyeIn) * .10)

  // These are illustrative requests, not verbatim participant quotations.
  const pairs = [
    { left: 'Solve it for me.', right: 'Here is my attempt.', at: .025, out: .26,
      lx: 80, ly: 300, rx: 1095, ry: 850, lr: -.055, rr: .045 },
    { left: 'Show every answer.', right: 'Which step is wrong?', at: .31, out: .53,
      lx: 85, ly: 795, rx: 1110, ry: 295, lr: .045, rr: -.045 },
    { left: 'Copy the result.', right: 'Let me try again.', at: .58, out: 2,
      lx: 145, ly: 305, rx: 1115, ry: 815, lr: -.035, rr: .035 },
  ]
  pairs.forEach((q, index) => {
    const arrived = cue(p, q.at, .10), swept = cue(p, q.out, .09)
    if (arrived <= 0 || swept >= 1) return
    const sweep = swept * 1750
    g.save(); g.translate(-(1 - arrived) * 1100 - sweep, -swept * 150)
    inkStrip(g, q.left, q.lx, q.ly, 675,
      { size: 64, rot: q.lr - swept * .13, seed: 810 + index,
        fill: index === 1 ? '#c6d1c1' : '#efe4c9', backing: true })
    g.restore()
    g.save(); g.translate((1 - arrived) * 1100 + sweep, swept * 160)
    inkStrip(g, q.right, q.rx, q.ry, 665,
      { size: 60, rot: q.rr + swept * .12, seed: 820 + index,
        fill: index === 1 ? '#e7c465' : '#eee9da', backing: index !== 1 })
    g.restore()
  })

  // Anchor labels stay fixed while the examples change their level and backing.
  inkStrip(g, 'GPT BASE', 90, 137, 440,
    { size: 71, rot: -.025, seed: 830, fill: '#e6c263' })
  inkStrip(g, 'GPT TUTOR', 1275, 145, 490,
    { size: 71, rot: .025, seed: 831, fill: '#bfcfc6' })
  inkStrip(g, 'Illustrative requests', 62, 1034, 368,
    { size: 29, rot: -.02, seed: 833, fill: '#ece2c7' })
  const caveat = cue(p, .79, .10)
  if (caveat > 0) {
    inkStrip(g, 'Patterns help interpret. They do not isolate every cause.',
      500, 1022 + (1 - caveat) * 180, 1290,
      { size: 37, rot: -.012, fill: '#ead7a6', seed: 832 })
  }
}

function physicsExam(g, x, y, width, rotation) {
  g.save(); g.translate(x, y); g.rotate(rotation); g.scale(width / 740, width / 740)
  scrap(g, 14, 9, 740, 840, { fill: '#bab49f', rag: 11, seed: 840, shadow: 16 })
  scrap(g, 0, 0, 740, 840, { fill: '#ebe2c9', rag: 13, seed: 841, shadow: 16 })
  label(g, 'PHYSICS', 48, 65, { size: 35, font: 'Headline' })
  label(g, 'EXAM', 42, 188, { size: 133, font: 'Editorial' })
  g.strokeStyle = '#6f715a99'; g.lineWidth = 2.2
  g.beginPath(); g.moveTo(46, 220); g.lineTo(690, 220); g.stroke()
  label(g, 'Name', 48, 268, { size: 27, font: 'Typewriter' })
  g.beginPath(); g.moveTo(147, 271); g.lineTo(690, 271); g.stroke()
  const questions = ['1. Explain the force.', '2. Predict the flow.', '3. Justify your method.']
  questions.forEach((text, i) => {
    label(g, text, 48, 365 + 126 * i, { size: 37, font: 'Typewriter' })
    g.beginPath(); g.moveTo(48, 418 + 126 * i); g.lineTo(688, 418 + 126 * i); g.stroke()
  })
  stamp(g, 'AFTER THE LESSON', 77, 771, { size: 42, color: '#9b4439', rot: -.04 })
  g.restore()
}

function calendarPage(g, { future = false, x = 590, y = 112, rot = .035 } = {}) {
  const width = 835, height = 830
  g.save(); g.translate(x, y); g.rotate(rot)
  for (let i = 2; i >= 0; i--) {
    scrap(g, i * 10, i * 11, width, height,
      { fill: i ? '#bab39b' : '#ebe3cc', rag: 13, seed: 850 + i, shadow: 11 })
  }
  scrap(g, 0, 0, width, 148,
    { fill: '#a63e3b', rag: 8, seed: 855, shadow: 0 })
  fit(g, future ? 'MONTHS LATER?' : 'NOW', width / 2, future ? 106 : 119,
    width - 65, future ? 84 : 130,
    { font: 'Editorial', color: '#f5e8ca', align: 'center' })
  // Blank dated cells do not invent a follow-up measurement or a study result.
  g.strokeStyle = '#807c6529'; g.lineWidth = 1.5
  for (let i = 1; i < 7; i++) {
    const xx = 32 + i * (width - 64) / 7
    g.beginPath(); g.moveTo(xx, 184); g.lineTo(xx, 738); g.stroke()
  }
  for (let y = 184; y <= 738; y += 111) {
    g.beginPath(); g.moveTo(32, y); g.lineTo(width - 32, y); g.stroke()
  }
  if (future) {
    label(g, '?', width / 2, 609,
      { size: 389, font: 'Editorial', color: '#4b5550', align: 'center' })
  } else {
    fit(g, 'After the lesson', 70, 600, 540, 65,
      { color: '#4b5550' })
  }
  for (let i = 0; i < 6; i++) {
    const xx = 67 + i * 138
    g.fillStyle = '#817d69'; g.fillRect(xx, -23, 12, 58)
    g.fillStyle = '#c6c0a5'; g.fillRect(xx + 3, -22, 3, 55)
  }
  g.restore()
}

/** S20: a measured exam is pulled away; an unanswered future page covers NOW. */
export function immediateSceneV8(g, s, t, p) {
  background(g, 'teal', Math.round(t * 25), s.index)
  const pull = cue(p, .20, .16), future = cue(p, .53, .17)
  const lowerClock = cue(p, .65, .14)
  harvard(g, 100, 95, 205)
  // Small at the edge, the learner no longer becomes a fixed left-side host.
  const learner = images['learner-sheet']
  if (learner) photo(g, 'learner-sheet', 60, 623, 365, 365 * 285 / 256,
    { crop: [702, 30, 256, 285], rot: -.035, shadow: 12 })
  calendarPage(g, { x: 590, y: 112 + (1 - pull) * 210 })
  prop(g, 'clock', 1235, 170 + lowerClock * 1020, 590, .065 - lowerClock * .11)
  if (pull < 1) {
    physicsExam(g, 525 - pull * 70, 155 + pull * 1200, 775, -.045 + pull * .10)
  }
  if (future > 0) {
    // The actual paper remains opaque while sweeping across the prior page.
    calendarPage(g, { future: true, x: 590 + (1 - future) * 1580,
      y: 112 - (1 - future) * 85, rot: .035 + (1 - future) * .07 })
  }
  const question = cue(p, .78, .12)
  if (question > 0) inkStrip(g, 'That question remains open.',
    603, 1010 + (1 - question) * 180, 1120,
    { size: 61, rot: -.025, fill: '#e3c474', seed: 860 })
}

/** S23: a single interlocked assemblage, followed by removal and a paper-edge exit. */
export function offloadSceneV8(g, s, t, p) {
  background(g, 'teal', Math.round(t * 25), s.index)
  const assemble = cue(p, .015, .16), fan = cue(p, .18, .15)
  // The tool list occurs late in the spoken sentence, so the objects stay present
  // until the final clause. The short group exit belongs to the shot's tail.
  const brain = cue(p, .34, .13), toolsAway = cue(p, .84, .09)
  const lowerGroup = cue(p, .94, .06)
  const groupY = (1 - assemble) * 900 + lowerGroup * 690

  // The notebook forms an opaque foreground lip. Other pieces pass behind it.
  g.save(); g.translate(960, 925 + groupY); g.scale(1.25, 1.25); g.translate(-960, -800)
  ornament(g, 0, 1110, 490, 490, .09)
  if (fan > 0) {
    const down = toolsAway * 760
    prop(g, 'clock', 485 + (1 - fan) * 310 - toolsAway * 35,
      375 + (1 - fan) * 240 + down, 300, -.11 + (1 - fan) * .24)
    study(g, 'calendar', 490 + (1 - fan) * 320,
      626 + (1 - fan) * 200 + down, 210, -.10)
    prop(g, 'calculator', 1180 - (1 - fan) * 290 + toolsAway * 30,
      400 + (1 - fan) * 240 + down, 235, .085 - (1 - fan) * .24)
    chatBadge(g, 1250 - (1 - fan) * 250, 560 + down, 145, { showLabel: false })
  }
  ornament(g, 1, 727, 307, 480, -.025)
  if (brain > 0) {
    prop(g, 'brain', 824, 235 - (1 - brain) * 600, 318,
      -.025 + (1 - brain) * .22)
  }
  g.restore()

  // An underlay gives the notebook a tactile seam rather than a podium shape.
  scrap(g, 490, 960, 1100, 280,
    { fill: '#ccbc96', rot: -.035, rag: 14, seed: 870, shadow: 13 })
  prop(g, 'notebook', 444, 808, 1045, -.035)
  const question = cue(p, .28, .11)
  if (question > 0) {
    g.save(); g.translate(0, -(1 - question) * 280)
    ransom(g, 'WHAT STAYS YOURS?', 960, 166, { size: 103, center: true, seed: 871 })
    g.restore()
  }
}
