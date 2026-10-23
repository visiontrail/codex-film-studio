import {
  C, PAPER, images, photo, scrap, label, wrap, ransom, flag, stamp,
  ease, clamp, arrow, ornament, chatBadge, scribble,
} from './materials.mjs'
import { prop, harvard } from './props.mjs'

// Bounds measured from the 1536 x 1024 source. The PNG's original alpha is
// retained: the ragged photographic edges are part of each physical object.
const studyCrops = {
  papers: [6, 24, 419, 516],
  classroom: [448, 100, 660, 395],
  seven: [1138, 62, 398, 508],
  teacher: [22, 549, 470, 450],
  worked: [500, 548, 554, 453],
  eyes: [1052, 644, 484, 260],
}
const cue = (p, start, span = .18) => ease(clamp((p - start) / span))

function field(g, color) {
  g.fillStyle = color; g.fillRect(0, 0, 1920, 1080)
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55
  g.drawImage(PAPER, 0, 0, 1920, 1080); g.restore()
}

function cut(g, name, x, y, width, rotation = 0, alpha = 1) {
  const b = studyCrops[name], im = images['study-sheet']
  if (!im) throw new Error('Missing study-sheet.png')
  const crop = [b[0] * im.width / 1536, b[1] * im.height / 1024,
    b[2] * im.width / 1536, b[3] * im.height / 1024]
  photo(g, 'study-sheet', x, y, width, width * b[3] / b[2],
    { crop, rot: rotation, alpha, shadow: 16 })
}

function portrait(g, x, y, width, pose = 'writing', rotation = 0) {
  const crops = { writing: [258, 508, 235, 270], thinking: [702, 30, 256, 285] }
  const b = crops[pose], im = images['learner-sheet']
  if (!im) return
  photo(g, 'learner-sheet', x, y, width, width * b[3] / b[2],
    { crop: b, rot: rotation, shadow: 13 })
}

function tape(g, text, x, y, width, { size = 40, rotation = 0, fill = '#eadcba', color = C.ink } = {}) {
  g.save(); g.translate(x, y); g.rotate(rotation)
  scrap(g, -16, -size - 10, width, size + 34,
    { fill, seed: text.length + 400, rag: 8, shadow: 7 })
  label(g, text, 0, 0, { size, color, font: 'Typewriter' })
  g.restore()
}

function written(g, text, x, y, { size = 80, color = C.ink, rotation = 0 } = {}) {
  label(g, text, x, y, { size, color, font: 'Editorial', rot: rotation })
}

function questionPage(g, x, y, width, { rotation = 0, title = 'TRY IT', question = '3(y - 2) = 15' } = {}) {
  g.save(); g.translate(x, y); g.rotate(rotation); g.scale(width / 650, width / 650)
  scrap(g, 0, 0, 650, 560, { fill: '#f0e8d6', seed: 61, rag: 10, shadow: 16 })
  label(g, title, 40, 100, { size: 64, font: 'Condensed' })
  label(g, question, 40, 220, { size: 55, font: 'Typewriter' })
  g.lineWidth = 2; g.strokeStyle = '#63827b60'
  for (let y = 290; y < 560; y += 65) { g.beginPath(); g.moveTo(40, y); g.lineTo(610, y); g.stroke() }
  g.restore()
}

export function studyScene(g, s, t, p) {
  if (Number(s.id) === 21) {
    field(g, '#e5dac1')
    scrap(g, 620, -100, 685, 1280, { fill: '#9d345c', rot: -.035, seed: 211, rag: 14 })
    scrap(g, 1300, -60, 760, 1240, { fill: '#54746e', rot: .025, seed: 212, rag: 13 })
    cut(g, 'papers', 20, 325, 485, -.045)
    prop(g, 'laptop', 40, 640, 560, .025)
    chatBadge(g, 435, 315, 105)
    cut(g, 'teacher', 622, 180 + (1 - cue(p, .08)) * 800, 635, .045)
    cut(g, 'worked', 1285, 420 + (1 - cue(p, .25)) * 680, 630, -.045)
    label(g, 'GENERATED', 65, 170, { size: 76, font: 'Condensed', rot: -.025 })
    label(g, 'HUMAN', 730, 140, { size: 106, color: '#f5e5c8', font: 'Editorial', rot: .03 })
    label(g, 'NO HELP', 1340, 305, { size: 94, color: '#f5e5c8', font: 'Condensed', rot: -.035 })
    if (p > .43) tape(g, 'Generated > no help', 65, 962, 665,
      { size: 47, rotation: -.035, fill: '#e3c571' })
    if (p > .65) {
      tape(g, 'No clear difference from human help', 800, 958, 1070,
        { size: 38, rotation: .018 })
      written(g, 'Quality checks matter.', 1000, 1042, { size: 42, color: '#f5e9d0' })
    }
    return
  }

  field(g, '#6c8884')
  cut(g, 'eyes', 655, 15, 1280, -.025)
  cut(g, 'classroom', 35, 415, 980, -.055)
  cut(g, 'papers', 1335, 560, 470, .08)
  label(g, 'LOOK', 84, 185, { size: 162, font: 'Condensed', color: '#f3e8d2' })
  label(g, 'CLOSER', 80, 355, { size: 134, font: 'Editorial', color: '#f3e8d2' })
  const tabs = [
    ['With help', 930, 625, -.04], ['Alone', 1000, 750, .03],
    ['Later', 1020, 875, -.035], ['A new problem', 1120, 1000, .025],
  ]
  tabs.forEach(([text, x, y, rotation], i) => {
    const push = cue(p, .12 + i * .16, .13)
    g.save(); g.beginPath(); g.rect(890, 510, 1030, 570); g.clip()
    tape(g, text, x + (1 - push) * 1100, y, i === 3 ? 680 : 450,
      { size: 55, rotation, fill: i % 2 ? '#ebdfc5' : '#e0c170' })
    g.restore()
  })
}

export function scoreScene(g, s, t, p) {
  const id = Number(s.id)
  if (id === 12) {
    field(g, '#bfd0d0')
    cut(g, 'classroom', 580, -18, 1040, .035)
    cut(g, 'papers', -25, 425, 510, -.06)
    cut(g, 'papers', 1470, 345, 470, .10)
    ransom(g, 'PRACTICE', 72, 190, { size: 105, seed: 120 })
    const first = cue(p, .06), second = cue(p, .34)
    g.save(); g.translate(0, (1 - first) * 650)
    ransom(g, '+48%', 470, 650, { size: 178, seed: 121 })
    tape(g, 'GPT BASE', 480, 755, 540, { size: 55, rotation: -.035 })
    g.restore()
    g.save(); g.translate(0, (1 - second) * 680)
    ransom(g, '+127%', 1040, 817, { size: 170, seed: 122 })
    tape(g, 'GPT TUTOR', 1110, 922, 580, { size: 53, rotation: .025 })
    g.restore()
    if (p > .65) tape(g, 'Practice grades: relative to control', 165, 1040, 1120,
      { size: 42, rotation: -.016, fill: '#e2c476' })
    return
  }
  if (id === 13) {
    field(g, '#eee3cf')
    cut(g, 'classroom', 20, -20, 1180, -.025)
    cut(g, 'papers', 990, 80, 850, .045)
    const pull = cue(p, .08, .26)
    g.save(); g.beginPath(); g.rect(790, 0, 1130, 1080); g.clip()
    scrap(g, 1080 + pull * 1050, 195 - pull * 130, 620, 600,
      { fill: '#5e8a82', rot: -.035, seed: 130, rag: 17, shadow: 22 })
    chatBadge(g, 1270 + pull * 1050, 315 - pull * 130, 220)
    g.restore()
    if (p > .27) {
      ransom(g, '-17%', 110, 827, { size: 247, seed: 131 })
      stamp(g, 'WITHOUT HELP', 830, 840, { size: 81, color: '#9c3c36', rot: -.06 })
    }
    if (p > .60) {
      tape(g, 'GPT Base: subsequent exam', 150, 951, 1080, { size: 54, rotation: -.025 })
      tape(g, 'Relative to control', 455, 1038, 815, { size: 47, rotation: .018, fill: '#e0c67d' })
    }
    return
  }
  if (id !== 14) throw new RangeError(`No authored scoreboard scene for ${s.id}`)
  field(g, '#355e61')
  cut(g, 'classroom', 825, 25, 1060, .04)
  cut(g, 'teacher', 25, 330, 620, -.06)
  cut(g, 'papers', 1245, 545, 490, .10)
  tape(g, 'Relative changes', 145, 150, 950, { size: 73, rotation: -.025, fill: '#e1c56e' })
  if (p < .35) {
    tape(g, 'Percentage points?', 390, 340, 1120, { size: 70, rotation: .03 })
    if (p > .13) {
      g.save(); g.strokeStyle = '#a54135'; g.lineWidth = 11; g.lineCap = 'round'
      g.beginPath(); g.moveTo(365, 321); g.lineTo(1430, 275); g.stroke(); g.restore()
    }
  } else {
    const push = cue(p, .35, .18)
    g.save(); g.beginPath(); g.rect(540, 220, 1360, 620); g.clip()
    tape(g, 'NO CLEAR', 655 + (1 - push) * 1250, 475, 1010,
      { size: 120, rotation: -.035, fill: '#f0e4cb' })
    tape(g, 'DIFFERENCE', 655 + (1 - push) * 1250, 650, 1040,
      { size: 116, rotation: .018, fill: '#f0e4cb' })
    g.restore()
  }
  if (p > .65) {
    tape(g, 'GPT Tutor exam vs control', 590, 902, 1180,
      { size: 57, rotation: -.025, fill: '#dec377' })
    tape(g, 'Statistically indistinguishable', 600, 1018, 1180,
      { size: 48, rotation: -.015, fill: '#eadfc3' })
  }
}

export function feedbackScene(g, s, t, p) {
  field(g, '#e31777')
  cut(g, 'eyes', 780, 10, 1080, -.035)
  cut(g, 'papers', -50, 260, 590, -.05)
  prop(g, 'notebook', 495, 405, 1040, .035)
  written(g, '1/2 + 1/3 = ?', 590, 755, { size: 78, rotation: .035 })
  ransom(g, '704', 90, 210, { size: 159, seed: 260 })
  written(g, 'adults', 555, 302, { size: 65, color: '#f6e4c8' })
  stamp(g, 'PREPRINT', 515, 140, { size: 57, rot: -.08, color: '#f3dfc0' })
  // These are illustrative request words, never invented experimental counts.
  const replace = cue(p, .28, .19)
  tape(g, 'Give me the answer.', 250, 505, 1030,
    { size: 66, rotation: -.05, fill: '#e7d8b9' })
  g.save(); g.beginPath(); g.rect(160, 360, 1350, 390); g.clip()
  tape(g, 'Let me try one step.', 325 + (1 - replace) * 1450, 645, 1110,
    { size: 69, rotation: .025, fill: '#ddc165' })
  g.restore()
  prop(g, 'hand', 1280, 560, 485, -.22)
  if (p > .55) {
    tape(g, 'Fewer complete-answer requests', 115, 865, 1310,
      { size: 58, rotation: -.018, fill: '#eee0c5' })
    tape(g, 'Better later unaided performance', 370, 964, 1430,
      { size: 53, rotation: .015, fill: '#e3cb80' })
  }
  if (p > .77) tape(g, 'Effort rewards: no evidence of a change', 550, 1051, 1135,
    { size: 36, fill: '#eadfc3' })
}

export function delayedScene(g, s, t, p) {
  if (Number(s.id) === 32) {
    field(g, '#e6dbc4')
    cut(g, 'classroom', 410, -50, 1510, .035)
    cut(g, 'teacher', -75, 495, 615, -.05)
    flag(g, 'US', 85, 85, 325, 190, -.045)
    tape(g, 'WORKING PAPER 2026', 610, 115, 625,
      { size: 49, color: '#834938', rotation: .035, fill: '#ecdfc2' })
    ransom(g, '6,000+', 65, 475, { size: 137, seed: 320 })
    tape(g, 'middle-school students', 90, 586, 1060,
      { size: 55, rotation: -.025, fill: '#e1c975' })
    const split = cue(p, .30, .21)
    tape(g, 'AI support', 705 - (1 - split) * 1300, 765, 980,
      { size: 72, rotation: -.035, fill: '#e7dfc8' })
    tape(g, 'Conventional computer practice', 640 + (1 - split) * 1350, 895, 1240,
      { size: 52, rotation: .025, fill: '#e7dfc8' })
    if (p > .67) tape(g, 'With / without a mastery requirement', 585, 1035, 1280,
      { size: 43, rotation: -.018, fill: '#d4c06e' })
    return
  }
  if (Number(s.id) !== 33) throw new RangeError(`No authored delayed scene for ${s.id}`)
  field(g, '#b8cdd1')
  cut(g, 'classroom', 805, 390, 1050, .04)
  const turn = cue(p, .02, .26)
  cut(g, 'seven', 5, 35 - (1 - turn) * 820, 780, -.035)
  label(g, 'ONE WEEK', 830, 130, { size: 117, font: 'Condensed' })
  label(g, 'LATER', 955, 265, { size: 154, font: 'Editorial' })
  if (p > .34) {
    tape(g, 'Practised material', 755, 485, 1010,
      { size: 65, rotation: -.025, fill: '#e3c477' })
    tape(g, 'Unpractised material', 800, 630, 1030,
      { size: 60, rotation: .025 })
  }
  if (p > .66) {
    tape(g, 'With mastery, on practised material', 585, 861, 1260,
      { size: 45, rotation: -.035, fill: '#e3cb8d' })
    tape(g, 'Only marginal statistical evidence', 570, 970, 1270,
      { size: 46, rotation: .015, fill: '#eee1c5' })
    written(g, 'Limited. Conditional.', 825, 1052, { size: 46 })
  }
}

export function researchScene(g, s, t, p) {
  field(g, '#aec6cd')
  scrap(g, 640, -55, 650, 1210, { fill: '#973a5a', rot: -.012, seed: 340, rag: 12 })
  scrap(g, 1280, -55, 720, 1210, { fill: '#426e67', rot: .012, seed: 341, rag: 12 })
  cut(g, 'classroom', -15, 285, 680, -.035)
  cut(g, 'teacher', 660, 300, 590, .035)
  cut(g, 'seven', 1410, 170, 420, -.04)
  flag(g, 'TR', 70, 85, 260, 150, -.045)
  harvard(g, 840, 40, 165)
  label(g, 'TURKEY', 72, 285, { size: 85, font: 'Editorial' })
  label(g, 'HARVARD', 717, 285, { size: 84, font: 'Editorial', color: '#f3e4c8' })
  label(g, 'ONE WEEK', 1355, 132, { size: 82, font: 'Condensed', color: '#f3e4c8' })
  const sets = [
    ['High-school math', 'Base / tutor / control', 'Short-term unaided exam'],
    ['College physics', 'AI tutor / active class', 'Immediate post-test'],
    ['Middle-school practice', 'AI / conventional', 'One-week assessment'],
  ]
  sets.forEach((lines, col) => lines.forEach((text, row) => {
    const push = cue(p, .12 + row * .24, .16), x = 36 + col * 640
    g.save(); g.beginPath(); g.rect(col * 640, 680, 640, 400); g.clip()
    tape(g, text, x, 760 + row * 123 + (1 - push) * 420, 583,
      { size: row === 0 ? 38 : 33, rotation: (col - 1) * .018,
        fill: row === 2 ? '#e3c77d' : '#eee0c3' })
    g.restore()
  }))
}

export function fadeScene(g, s, t, p) {
  if (Number(s.id) === 43) {
    field(g, '#c3cbb9')
    scrap(g, -90, -90, 700, 1260, { fill: '#9c3e5f', rot: -.05, seed: 430, rag: 13 })
    scrap(g, 1420, -90, 700, 1260, { fill: '#567b78', rot: .04, seed: 431, rag: 13 })
    const withdraw = cue(p, .56, .20)
    cut(g, 'worked', -120 - withdraw * 1000, 245, 1070, -.10)
    if (withdraw < .98) tape(g, 'Full answer', 90 - withdraw * 1000, 165, 560,
      { size: 66, rotation: -.04, fill: '#e2c67b' })
    portrait(g, 640, 80, 700, 'writing', .025)
    prop(g, 'notebook', 600, 620, 1010, -.025)
    const hint = cue(p, .28, .17)
    g.save(); g.beginPath(); g.rect(1160, 140, 760, 600); g.clip()
    tape(g, 'HINT', 1340 + (1 - hint) * 820 + withdraw * 800, 310, 430,
      { size: 88, rotation: .035, fill: '#e2c67b' })
    tape(g, 'Divide both sides', 1220 + (1 - hint) * 820 + withdraw * 800, 435, 660,
      { size: 48, rotation: .035 })
    tape(g, 'by 2.', 1220 + (1 - hint) * 820 + withdraw * 800, 530, 660,
      { size: 58, rotation: .035 })
    g.restore()
    if (p > .69) {
      written(g, '2(x + 3) = 14', 735, 795, { size: 75, rotation: -.02 })
      tape(g, 'What can you do afterward?', 490, 1015, 1280,
        { size: 62, rotation: -.02, fill: '#e4cd7f' })
    }
    return
  }
  if (Number(s.id) !== 35) throw new RangeError(`No authored fade-support scene for ${s.id}`)
  field(g, '#eee3cb')
  ornament(g, 0, -150, -140, 900, -.10)
  ornament(g, 3, 1320, 420, 680, .12)
  cut(g, 'teacher', 30, 360, 540, -.08)
  questionPage(g, 600, 300, 980, { title: 'A FRESH ATTEMPT', rotation: .025 })
  const withdraw = cue(p, .69, .20), cover = cue(p, .34, .19)
  const pageX = 370 - withdraw * 1820
  cut(g, 'worked', pageX, 115, 1170, -.025)
  // Cover only the worked solution's lower lines; the original question remains.
  g.save(); g.translate(pageX, 115); g.rotate(-.025)
  if (cover > 0 && withdraw < 1) {
    g.beginPath(); g.rect(0, 0, 1170, 960); g.clip()
    scrap(g, 95 + (1 - cover) * 1300, 420, 510, 210,
      { fill: '#ebdfc3', rot: .01, seed: 350, rag: 12, shadow: 18 })
    label(g, 'Your next step?', 120 + (1 - cover) * 1300, 540,
      { size: 54, font: 'Editorial' })
  }
  g.restore()
  prop(g, 'hand', 1300, 640, 435, -.25)
  const words = p < .34 ? 'STUDY AN EXAMPLE' : p < .69 ? 'COMPLETE A STEP' : 'TRY A NEW ONE'
  tape(g, words, 235, 1035, 1320,
    { size: 78, rotation: -.018, fill: '#ddc16c' })
}

export { scoreScene as scoreboardScene, researchScene as researchTableScene, fadeScene as fadeSupportScene }
