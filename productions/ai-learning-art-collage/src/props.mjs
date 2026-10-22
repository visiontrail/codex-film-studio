import { images, photo, scrap, label, C, notebook, rng } from './materials.mjs'

// Manually inspected bounds in the 1774 × 887 source sheet. These are deliberately
// not equal cells: the notebook and desk are wider than the clock/calculator.
const SHEET = { width: 1774, height: 887 }
const CROPS = {
  laptop:     [20, 48, 494, 387],
  clock:      [526, 46, 301, 397],
  books:      [867, 84, 479, 351],
  brain:      [1351, 64, 416, 374],
  desk:       [23, 435, 468, 420],
  notebook:   [493, 484, 529, 340],
  hand:       [1032, 451, 361, 391],
  calculator: [1454, 449, 250, 387],
}

/** Draw one transparent photographic cutout. x/y are its top-left pivot. */
export function prop(g, name, x, y, w, rot = 0) {
  const bounds = CROPS[name]
  if (!bounds) throw new RangeError(`Unknown collage prop: ${name}`)
  const im = images['props-sheet']
  if (!im) {
    // Retain the drawing fallback only for the already-supported paper notebook.
    if (name === 'notebook') {
      notebook(g, x, y, w, w * bounds[3] / bounds[2], rot)
      return true
    }
    return false
  }
  const [sx, sy, sw, sh] = bounds
  const crop = [sx * im.width / SHEET.width, sy * im.height / SHEET.height,
    sw * im.width / SHEET.width, sh * im.height / SHEET.height]
  return photo(g, 'props-sheet', x, y, w, w * sh / sw, { rot, crop, shadow: 9 })
}

const EXAMPLES = [
  { headers: ['Item', 'Price'], rows: [['Apples', '2.40'], ['Pears', '2.10'], ['Rice', '3.60']], query: 'Pears', result: '2.10', hit: 1 },
  { headers: ['Code', 'Rate'], rows: [['A', '12'], ['B', '18'], ['C', '25']], query: 'B', result: '18', hit: 1 },
  { headers: ['Task', 'Hours'], rows: [['Research', '2'], ['Draft', '1'], ['Review', '1']], query: 'Research', result: '2', hit: 0 },
]

/** A worked spreadsheet example printed onto a cut paper sheet, not study data. */
export function spreadsheet(g, x, y, w, h, { variant = 0, reveal = 1, solution = true } = {}) {
  const example = EXAMPLES[((Math.trunc(variant) % EXAMPLES.length) + EXAMPLES.length) % EXAMPLES.length]
  const progress = Math.max(0, Math.min(1, reveal))
  const visibleRows = Math.floor(progress * 3 + 1e-6)
  const r = rng(519 + Math.trunc(variant))
  g.save(); g.translate(x, y); g.scale(w / 960, h / 580)
  scrap(g, 0, 0, 960, 580, { fill: '#eeeadd', rag: 7, shadow: 8, seed: 519 })
  label(g, solution ? 'WORKED EXAMPLE' : 'YOUR TURN', 36, 43, { size: 19, font: 'Typewriter', color: '#666859' })
  const left = 68, top = 84, rowHeight = 57
  const widths = [170, 125, 75, 75, 178, 170]
  const starts = [left]
  for (const width of widths) starts.push(starts.at(-1) + width)
  const bottom = top + rowHeight * 6
  g.fillStyle = '#c8d5c18f'; g.fillRect(left, top, starts.at(-1) - left, rowHeight)
  if (solution && progress >= .7) {
    g.fillStyle = '#e7d48670'
    g.fillRect(left, top + rowHeight * (example.hit + 1), widths[0] + widths[1], rowHeight)
  }
  g.strokeStyle = '#6e7a6780'; g.lineWidth = 1.4
  // Slight hand-ruled irregularity is fixed to the paper, never regenerated per frame.
  for (const xx of starts) {
    g.beginPath(); g.moveTo(xx, top); g.lineTo(xx + r() * .7 - .35, bottom); g.stroke()
  }
  for (let row = 0; row <= 6; row++) {
    g.beginPath(); g.moveTo(left, top + row * rowHeight)
    g.lineTo(starts.at(-1), top + row * rowHeight + r() * .7 - .35); g.stroke()
  }
  g.textAlign = 'center'; g.fillStyle = '#53614e'; g.font = '24px Typewriter'
  for (let column = 0; column < 6; column++) {
    g.fillText(String.fromCharCode(65 + column), starts[column] + widths[column] / 2, top - 16)
  }
  for (let row = 0; row < 6; row++) g.fillText(String(row + 1), left - 30, top + rowHeight * row + 37)
  g.textAlign = 'left'; g.fillStyle = C.ink; g.font = '27px Typewriter'
  const cell = (col, row, text, align = 'left') => {
    g.textAlign = align
    const xx = align === 'right' ? starts[col + 1] - 13 : starts[col] + 13
    g.fillText(text, xx, top + rowHeight * row + 37, widths[col] - 24)
  }
  cell(0, 0, example.headers[0]); cell(1, 0, example.headers[1])
  cell(4, 0, 'Find'); cell(5, 0, 'Result')
  for (let row = 0; row < visibleRows; row++) {
    cell(0, row + 1, example.rows[row][0]); cell(1, row + 1, example.rows[row][1], 'right')
  }
  if (progress >= .55) cell(4, 1, example.query)
  if (solution && progress >= .85) {
    cell(5, 1, example.result, 'right')
    g.textAlign = 'left'; g.font = '27px Typewriter'; g.fillStyle = '#334f42'
    g.fillText('F2  =VLOOKUP(E2,A2:B4,2,FALSE)', 42, 488)
    g.font = '21px Editorial'; g.fillStyle = '#656256'
    g.fillText('Find the matching item. Return its value.', 42, 537)
  }
  g.restore()
}

/** Printed note addressed to a tutor; returns its local height for staging. */
export function chatSlip(g, x, y, w, text, { rot = 0 } = {}) {
  const size = Math.max(24, Math.min(41, w * .052))
  const pad = Math.max(25, w * .055), lineHeight = size * 1.38
  g.save(); g.font = `${size}px Typewriter`
  const lines = []
  for (const paragraph of String(text).split('\n')) {
    if (!paragraph.trim()) { lines.push(''); continue }
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const attempt = line ? `${line} ${word}` : word
      if (line && g.measureText(attempt).width > w - pad * 2) { lines.push(line); line = word }
      else line = attempt
    }
    lines.push(line)
  }
  const height = 67 + lines.length * lineHeight + pad
  g.translate(x, y); g.rotate(rot)
  scrap(g, 0, 0, w, height, { fill: '#f0e7d6', rag: 9, seed: String(text).length + 221, shadow: 7 })
  g.strokeStyle = '#686c5259'; g.lineWidth = 1
  g.beginPath(); g.moveTo(pad, 48); g.lineTo(w - pad, 48); g.stroke()
  g.fillStyle = '#66654f'; g.font = '17px Typewriter'; g.textAlign = 'left'
  g.fillText('NOTE TO THE TUTOR', pad, 32)
  g.fillStyle = '#2d3b31'; g.font = `${size}px Typewriter`
  lines.forEach((line, index) => g.fillText(line, pad, 80 + index * lineHeight, w - pad * 2))
  // One translucent strip of tape, attached to the same physical note.
  g.save(); g.globalAlpha = .5
  scrap(g, w * .70, -12, w * .19, 31, { fill: '#c9b785', rot: .075, rag: 3, shadow: 0, seed: 118 })
  g.restore(); g.restore()
  return height
}

function openBook(g, x, y, width, height, word) {
  g.save(); g.translate(x, y)
  g.fillStyle = '#e7dfbf'; g.strokeStyle = '#261f1d'; g.lineWidth = 2
  g.beginPath(); g.moveTo(-2, 3); g.lineTo(width / 2, 10); g.lineTo(width + 2, 3)
  g.lineTo(width + 2, height + 5); g.lineTo(width / 2, height + 10); g.lineTo(-2, height + 5); g.closePath()
  g.fill(); g.stroke()
  g.fillStyle = '#f3efdf'
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(width * .23, -4, width / 2, 5)
  g.quadraticCurveTo(width * .77, -4, width, 0); g.lineTo(width, height)
  g.quadraticCurveTo(width * .76, height - 2, width / 2, height + 6)
  g.quadraticCurveTo(width * .24, height - 2, 0, height); g.closePath(); g.fill(); g.stroke()
  g.beginPath(); g.moveTo(width / 2, 5); g.lineTo(width / 2, height + 5); g.stroke()
  g.lineWidth = .65; g.strokeStyle = '#6e6354'
  for (let i = 0; i < 3; i++) {
    g.beginPath(); g.moveTo(3, height + 2 + i * 1.5); g.lineTo(width / 2 - 2, height + 6 + i); g.stroke()
    g.beginPath(); g.moveTo(width / 2 + 2, height + 6 + i); g.lineTo(width - 2, height + 2 + i * 1.5); g.stroke()
  }
  g.fillStyle = '#1d2421'; g.font = 'bold 19px Editorial'; g.textAlign = 'center'
  if (word.length === 2) {
    g.fillText(word[0], width * .24, height * .63)
    g.fillText(word[1], width * .76, height * .63)
  } else {
    g.font = 'bold 17px Editorial'
    g.fillText('T', width * .19, height * .63)
    g.fillText('A', width * .40, height * .63)
    g.fillText('S', width * .77, height * .63)
  }
  // Small dark clasps give the redrawn books their recognizable heraldic shape.
  g.fillStyle = '#aa934a'; g.strokeStyle = '#30291b'; g.lineWidth = 1
  for (const yy of [height * .2, height * .72]) {
    g.fillRect(-5, yy, 7, 5); g.strokeRect(-5, yy, 7, 5)
    g.fillRect(width - 2, yy, 7, 5); g.strokeRect(width - 2, yy, 7, 5)
  }
  g.restore()
}

/** Original collage redraw of Harvard's shield; not official supplied artwork.
 *  Identity reference: https://www.harvard.edu/about/history/shields/
 *  Books are arranged VE / RI above TAS, as documented by Harvard Archives:
 *  https://hollisarchives.lib.harvard.edu/catalog/hua18011
 */
export function harvard(g, x, y, s = 200) {
  g.save(); g.translate(x, y); g.scale(s / 200, s / 200)
  g.shadowColor = '#30251b35'; g.shadowOffsetX = 3; g.shadowOffsetY = 5; g.shadowBlur = 5
  g.fillStyle = '#a51c30'; g.strokeStyle = '#211d1b'; g.lineWidth = 4.4
  g.beginPath(); g.moveTo(8, 10); g.lineTo(192, 10); g.lineTo(187, 108)
  g.bezierCurveTo(181, 158, 143, 204, 100, 229)
  g.bezierCurveTo(57, 204, 19, 158, 13, 108); g.closePath(); g.fill(); g.stroke()
  g.shadowColor = 'transparent'
  g.save(); g.clip(); const r = rng(1636); g.fillStyle = '#e4c9b2'; g.globalAlpha = .13
  for (let i = 0; i < 420; i++) g.fillRect(r() * 200, r() * 230, .4 + r() * 1.2, .5)
  g.restore()
  openBook(g, 27, 40, 58, 45, 'VE')
  openBook(g, 114, 40, 58, 45, 'RI')
  openBook(g, 71, 126, 58, 45, 'TAS')
  g.restore()
}
