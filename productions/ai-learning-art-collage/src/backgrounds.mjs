import { createCanvas } from '@napi-rs/canvas'
import { PAPER, images, ornament, scrap, scribble, rng } from './materials.mjs'

// Original paper constructions. All texture lives in the piece's local space;
// no per-frame random grain or screen-space edge crawling.
const W = 1920, H = 1080
const cache = new Map()
const stock = new Map()
const TAU = Math.PI * 2
let cachedOrnamentImage

function photographicOrnament(g, index, x, y, width, rotation = 0) {
  return ornament(g,index,x,y,width,rotation)
}

function canvas(w, h) { return createCanvas(w, h) }

function paper(color = '#f3f2ed', seed = 11) {
  const key = `${color}:${seed % 7}`
  if (stock.has(key)) return stock.get(key)
  const c = canvas(W, H), g = c.getContext('2d'), r = rng(seed)
  g.fillStyle = color; g.fillRect(0, 0, W, H)
  const rgb = color.match(/[a-f\d]{2}/gi).map(v => parseInt(v,16))
  const luminance = .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = luminance > 180 ? .46 : .8
  // Keep the scan at working resolution: reducing to 640 pixels smoothed the
  // embedded fibre structure into a digital-looking wash in earlier versions.
  g.drawImage(PAPER, 0, 0, W, H)
  g.globalCompositeOperation = 'source-over'
  // Fibres have both a light ridge and a dark underside, like raking light on pulp.
  for (let i = 0; i < 2600; i++) {
    const x = r() * W, y = r() * H, length = 1 + r() * 6
    g.lineWidth = .3 + r() * .5
    g.globalAlpha = .02 + r() * .06
    g.strokeStyle = i % 3 ? '#6c675c' : '#ffffff'
    g.beginPath(); g.moveTo(x, y)
    g.quadraticCurveTo(x + length * .4, y - 1.2, x + length, y + r() * 2 - 1)
    g.stroke()
  }
  for (let i = 0; i < 12; i++) {
    const x = r() * W, y = r() * H, length = 30 + r() * 180
    g.lineWidth = .5 + r() * .8; g.globalAlpha = .025
    g.strokeStyle = i % 2 ? '#ffffff' : '#555047'
    g.beginPath(); g.moveTo(x, y)
    g.bezierCurveTo(x + length * .3, y - 5, x + length * .6, y + 8, x + length, y)
    g.stroke()
  }
  g.globalAlpha = 1
  stock.set(key, c)
  return c
}

function ground(g, color, seed = 11) {
  g.drawImage(paper(color, seed), 0, 0, W, H)
}

function tealPaper(g, seed) {
  ground(g, '#087f80', seed)
  const r = rng(seed + 800)
  // Long uneven compression ridges catch side light. They are integral to one
  // sheet of teal paper, not floating geometric decoration or a gradient stage.
  for (let i = 0; i < 6; i++) {
    const x = r() * W, y = r() * H, length = 120 + r() * 620
    const angle = r() * TAU, depth = 7 + r() * 20
    g.save(); g.translate(x, y); g.rotate(angle)
    const crease = g.createLinearGradient(0, -depth, 0, depth)
    crease.addColorStop(0, '#002f3700')
    crease.addColorStop(.45, '#003c4505')
    crease.addColorStop(.51, '#b0d7c504')
    crease.addColorStop(1, '#83c6be00')
    g.fillStyle = crease; g.beginPath(); g.moveTo(0, 0)
    g.bezierCurveTo(length * .30, -depth * .8, length * .71, -depth, length, 0)
    g.bezierCurveTo(length * .66, depth, length * .28, depth * .9, 0, 0)
    g.fill(); g.restore()
  }
  g.save(); g.strokeStyle = '#0b4d503d'; g.lineWidth = 2.1
  for (let i = 0; i < 17; i++) {
    const x = r() * W, y = r() * H
    g.beginPath(); g.moveTo(x, y)
    g.quadraticCurveTo(x + 9, y - 4, x + 14 + r() * 46, y - 16 - r() * 24)
    g.stroke()
  }
  g.restore()
}

function polygon(g, points, fill, seed = 1, rough = 4) {
  const r = rng(seed)
  g.beginPath()
  for (let side = 0; side < points.length; side++) {
    const a = points[side], b = points[(side + 1) % points.length]
    const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy)
    const count = Math.max(2, Math.ceil(length / 13))
    for (let i = 0; i < count; i++) {
      const t = i / count, n = (r() - .5) * rough
      const x = a[0] + dx * t - dy / length * n
      const y = a[1] + dy * t + dx / length * n
      if (!side && !i) g.moveTo(x, y); else g.lineTo(x, y)
    }
  }
  g.closePath(); g.fillStyle = fill; g.fill()
  g.save(); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .45
  g.drawImage(PAPER, 0, 0, W, H); g.restore()
}

function inkWear(g, x, y, w, h, seed, amount = 2500, light = '#efeadc') {
  const r = rng(seed)
  g.save(); g.fillStyle = light
  for (let i = 0; i < amount; i++) {
    g.globalAlpha = .05 + r() * .24
    const size = .5 + r() * 2.3
    g.fillRect(x + r() * w, y + r() * h, size, size * (.4 + r()))
  }
  g.restore()
}

function newspaper(g, x, y, w, h, seed, rotation = 0, tint = '#ddd7c2') {
  const r = rng(seed)
  g.save(); g.translate(x, y); g.rotate(rotation)
  scrap(g, 0, 0, w, h, { fill: tint, rag: 9, shadow: 4, seed })
  g.save(); g.beginPath(); g.rect(9, 10, w - 18, h - 20); g.clip()
  const columns = Math.max(2, Math.floor(w / 135)), gap = 16
  const columnWidth = (w - 32 - gap * (columns - 1)) / columns
  g.fillStyle = '#393b32'; g.globalAlpha *= .7
  g.font = 'bold 27px Editorial'; g.fillText('THE STUDY OF THINGS', 14, 34)
  g.lineWidth = 1; g.strokeStyle = '#3c4036'; g.beginPath()
  g.moveTo(14, 46); g.lineTo(w - 14, 46); g.stroke()
  g.font = '11px Editorial'
  const words = ['attention', 'observation', 'a question', 'the ordinary', 'a new idea', 'time',
    'experience', 'and the world', 'to understand', 'practice', 'in this light', 'the next page']
  for (let col = 0; col < columns; col++) {
    const xx = 16 + col * (columnWidth + gap)
    for (let yy = 66; yy < h - 12; yy += 12.5) {
      if (r() < .07) continue
      let line = ''
      while (g.measureText(line).width < columnWidth - 50) line += `${words[Math.floor(r() * words.length)]} `
      g.fillText(line, xx, yy, columnWidth)
    }
  }
  g.restore(); g.restore()
}

function sheetMusic(g, x, y, w, h, seed, rotation = 0) {
  const r = rng(seed)
  g.save(); g.translate(x, y); g.rotate(rotation)
  scrap(g, 0, 0, w, h, { fill: '#ded8c6', rag: 5, seed, shadow: 2 })
  g.strokeStyle = '#514f4260'; g.fillStyle = '#333a32'; g.lineWidth = .7
  for (let group = 18; group < h - 38; group += 60) {
    for (let line = 0; line < 5; line++) {
      g.beginPath(); g.moveTo(8, group + line * 6); g.lineTo(w - 8, group + line * 6); g.stroke()
    }
    for (let xx = 21; xx < w - 10; xx += 21 + r() * 18) {
      const yy = group + Math.floor(r() * 9) * 3
      g.beginPath(); g.ellipse(xx, yy, 3.6, 2.6, -.4, 0, TAU); g.fill()
      g.beginPath(); g.moveTo(xx + 3, yy); g.lineTo(xx + 3, yy - 22); g.stroke()
    }
  }
  g.restore()
}

function leaf(g, x, y, length, width, angle, seed, color = '#52816a') {
  const r = rng(seed)
  g.save(); g.translate(x, y); g.rotate(angle)
  g.beginPath(); g.moveTo(0, 0)
  g.bezierCurveTo(-width, -length * .27, -width * .7, -length * .72, 0, -length)
  g.bezierCurveTo(width * .8, -length * .7, width * .95, -length * .3, 0, 0)
  g.closePath(); g.fillStyle = '#f0eee2'; g.lineWidth = 7; g.strokeStyle = '#e8e4d7'; g.stroke()
  g.fillStyle = color; g.fill()
  g.save(); g.clip()
  g.globalAlpha = .55; g.globalCompositeOperation = 'multiply'; g.drawImage(PAPER, -width, -length, width * 2, length)
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = .45
  g.strokeStyle = '#d2d5a6'; g.lineWidth = .7
  for (let i = 1; i < 29; i++) {
    const yy = -length * i / 29, spread = Math.sin(Math.PI * i / 29) * width * .63
    for (const sign of [-1, 1]) {
      g.beginPath(); g.moveTo(0, yy)
      g.quadraticCurveTo(sign * spread * .5, yy - length * .04, sign * spread, yy - length * (.09 + r() * .025))
      g.stroke()
    }
  }
  g.strokeStyle = '#1d483e'; g.lineWidth = 1.4; g.globalAlpha = .6
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(2, -length * .55, 0, -length); g.stroke()
  g.restore(); g.restore()
}

function flower(g, x, y, size, seed, tone = '#c98790') {
  const r = rng(seed)
  g.save(); g.translate(x, y)
  for (let ring = 3; ring >= 0; ring--) {
    const petals = 5 + ring * 3
    for (let i = 0; i < petals; i++) {
      const a = i / petals * TAU + ring * .45
      const radius = size * (.11 + ring * .14)
      g.save(); g.translate(Math.cos(a) * radius, Math.sin(a) * radius); g.rotate(a + .5)
      g.beginPath(); g.ellipse(0, 0, size * (.13 + ring * .035), size * (.2 + ring * .025), 0, 0, TAU)
      g.fillStyle = ring % 2 ? tone : '#e7b9b6'; g.strokeStyle = '#f3e4d7'; g.lineWidth = 1.3
      g.fill(); g.stroke(); g.save(); g.clip()
      g.globalAlpha = .18; g.strokeStyle = '#5b393e'
      for (let j = 0; j < 11; j++) {
        const xx = (r() - .5) * size * .32
        g.beginPath(); g.moveTo(xx, size * .14)
        g.quadraticCurveTo(xx * .7, 0, xx * 1.8, -size * .22); g.stroke()
      }
      g.restore(); g.restore()
    }
  }
  g.fillStyle = '#8b6344'; g.beginPath(); g.arc(0, 0, size * .05, 0, TAU); g.fill()
  g.restore()
}

function botanicalSide(g, side, seed, scale = 1) {
  g.save(); g.translate(side === 'left' ? 60 : 1860, 1120)
  g.scale(side === 'left' ? scale : -scale, scale)
  const r = rng(seed)
  for (let i = 0; i < 9; i++) {
    const xx = 10 + i * 25, top = -320 - r() * 540, bend = 80 + r() * 90
    g.strokeStyle = '#49654f'; g.lineWidth = 2.2
    g.beginPath(); g.moveTo(xx, 0); g.quadraticCurveTo(xx - 35, top * .5, xx + bend, top); g.stroke()
    leaf(g, xx + bend * .6, top * .55, 130 + r() * 110, 33 + r() * 28, -.6 + r() * .9, seed + i * 4)
    leaf(g, xx + bend * .85, top * .79, 160 + r() * 120, 23 + r() * 25, .1 + r() * .9, seed + i * 4 + 1, '#688976')
    if (i % 3 === 0) flower(g, xx + bend, top, 45 + r() * 22, seed + i, i % 2 ? '#b16f72' : '#c78784')
  }
  g.restore()
}

function cityEdge(g, seed) {
  const r = rng(seed)
  for (const side of [0, 1]) {
    for (let i = 0; i < 5; i++) {
      const width = 55 + r() * 85, height = 110 + r() * 240
      const x = side ? 1710 + i * 43 : -65 + i * 58, y = 1070 - height
      g.save(); g.translate(x, y); g.rotate((r() - .5) * .04)
      polygon(g, [[0, height], [0, 8], [width * .6, 0], [width, 11], [width, height]],
        ['#4c625d', '#6c6b65', '#73867e'][i % 3], seed + i, 2)
      g.strokeStyle = '#dddacd'; g.globalAlpha = .4; g.lineWidth = 1
      for (let yy = 20; yy < height; yy += 8) {
        for (let xx = 5; xx < width - 4; xx += 6) {
          g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + 5); g.stroke()
        }
      }
      g.restore()
    }
  }
}

function oldMap(g, x, y, w, h, seed, angle) {
  const r = rng(seed)
  g.save(); g.translate(x, y); g.rotate(angle)
  scrap(g, 0, 0, w, h, { fill: '#ddd5b8', rag: 7, shadow: 7, seed })
  g.save(); g.beginPath(); g.rect(30, 35, w - 60, h - 70); g.clip()
  g.strokeStyle = '#60614b66'; g.lineWidth = .8
  for (let xx = 30; xx < w; xx += 34) { g.beginPath(); g.moveTo(xx, 35); g.lineTo(xx, h - 35); g.stroke() }
  for (let yy = 35; yy < h; yy += 30) { g.beginPath(); g.moveTo(30, yy); g.lineTo(w - 30, yy); g.stroke() }
  // Fictional archival contour plate, intentionally no geographic place labels.
  for (let island = 0; island < 5; island++) {
    const cx = r() * w, cy = r() * h, radius = 50 + r() * w * .16
    g.fillStyle = '#7e81694a'
    for (let ring = 6; ring > 0; ring--) {
      g.beginPath()
      for (let i = 0; i <= 64; i++) {
        const a = i / 64 * TAU
        const rr = radius * ring / 6 * (1 + .22 * Math.sin(a * 3 + island) + .14 * Math.sin(a * 7))
        const xx = cx + Math.cos(a) * rr * 1.4, yy = cy + Math.sin(a) * rr * .7
        if (!i) g.moveTo(xx, yy); else g.lineTo(xx, yy)
      }
      g.closePath(); if (ring === 6) g.fill(); g.stroke()
    }
  }
  g.restore(); g.strokeStyle = '#68664c'; g.lineWidth = 1.3; g.strokeRect(30, 35, w - 60, h - 70)
  g.restore()
}

function cubism(g, seed, width = W, height = H) {
  g.save(); g.scale(width / W, height / H)
  ground(g, '#4c646b', seed)
  polygon(g, [[-40,-20],[580,15],[725,250],[550,720],[-50,810]], '#b2a388', seed)
  polygon(g, [[365,-20],[990,0],[900,610],[1130,1110],[575,1110],[476,696]], '#d3cbb7', seed+1)
  polygon(g, [[1090,-40],[1730,0],[1900,360],[1540,750],[1440,1100],[1120,1100]], '#8b7f60', seed+2)
  polygon(g, [[1440,0],[1920,0],[1920,1070],[1750,940],[1670,485]], '#343d3a', seed+3)
  newspaper(g, -90, 570, 570, 660, seed+4, -.21)
  sheetMusic(g, 630, 720, 570, 420, seed+5, .11)
  newspaper(g, 1420, -120, 490, 390, seed+6, .14, '#bab49a')
  // Burlap patch: crosshatched warp and weft, with a cut edge.
  g.save(); polygon(g, [[1050,50],[1380,30],[1420,620],[1090,670]], '#a39471', seed+7)
  g.beginPath(); g.moveTo(1050,50); g.lineTo(1380,30); g.lineTo(1420,620); g.lineTo(1090,670); g.closePath(); g.clip()
  g.strokeStyle = '#4d4b3740'; g.lineWidth = 1
  for (let x = 1020; x < 1450; x += 4) { g.beginPath(); g.moveTo(x,0); g.lineTo(x+32,700); g.stroke() }
  for (let y = 0; y < 700; y += 4) { g.beginPath(); g.moveTo(1020,y); g.lineTo(1450,y-20); g.stroke() }
  g.restore()
  g.strokeStyle = '#222b29'; g.lineWidth = 3.4
  for (const points of [ [[110,90],[254,90],[211,470],[370,470]], [[1530,340],[1610,520],[1560,925]], [[40,970],[320,890],[570,1020]] ]) {
    g.beginPath(); points.forEach((p,i)=>i ? g.lineTo(...p) : g.moveTo(...p)); g.stroke()
  }
  // Offset charcoal shapes, left intentionally incomplete like clipped drawings.
  g.beginPath(); g.moveTo(777,0); g.bezierCurveTo(828,140,697,180,763,290)
  g.bezierCurveTo(835,390,786,432,712,520); g.stroke()
  inkWear(g,0,0,W,H,seed+10,9000)
  g.restore()
}

function magenta(g, seed, width = W, height = H) {
  g.save(); g.scale(width / W, height / H); ground(g, '#e71575', seed)
  const r = rng(seed)
  for (let i = 0; i < 24; i++) {
    const x = r() * 2150 - 170, y = r() * 1320 - 160
    const w = 60 + r() * 240, h = 90 + r() * 410, lean = r() * 100 - 50
    polygon(g, [[x,y],[x+w,y-10],[x+w+lean,y+h*.5],[x+w*.73+lean,y+h*.52],
      [x+w*.73+lean,y+h],[x+lean,y+h+15]],
    i % 7 === 0 ? '#29252b' : '#eee5cc', seed+i, 9)
  }
  // Coarse screen-print islands and dry-ink gaps, not a clean vector fill.
  g.fillStyle = '#28242b'
  for (let y = 20; y < H; y += 7) for (let x = 0; x < W; x += 7) {
    const band = Math.sin(x*.008 + seed) + Math.cos(y*.013 - x*.003)
    if (band > .75 && (x < 430 || x > 1430 || y > 850 || y < 160)) {
      const radius = .5 + Math.min(1.8, (band-.75)*2)
      g.beginPath(); g.arc(x,y,radius,0,TAU); g.fill()
    }
  }
  inkWear(g,0,0,W,H,seed+30,22000,'#e71575')
  g.restore()
}

function build(kind, sceneIndex) {
  const seed = 1009 + sceneIndex * 41
  const c = canvas(W,H), g = c.getContext('2d')
  if (kind === 'cubist') cubism(g,seed)
  else if (kind === 'magenta') magenta(g,seed)
  else if (kind === 'teal') tealPaper(g,seed)
  else if (kind === 'triptych') {
    cubism(g,seed,640,H)
    g.save(); g.translate(640,0); g.beginPath(); g.rect(0,0,640,H); g.clip()
    g.drawImage(paper('#1b7b78',seed),0,0,640,H)
    botanicalSide(g,'left',seed,.85)
    g.restore()
    g.save(); g.translate(1280,0); g.beginPath(); g.rect(0,0,640,H); g.clip()
    magenta(g,seed+13,640,H); g.restore()
    // A ragged seam, without presentation-panel borders.
    polygon(g,[[633,0],[643,0],[647,1080],[636,1080]],'#eee6cf',seed+9,7)
    polygon(g,[[1275,0],[1281,0],[1287,1080],[1278,1080]],'#e9d8c4',seed+10,7)
  } else if (kind === 'blue') {
    ground(g,'#c6dce3',seed)
    g.save(); g.globalAlpha = .16; newspaper(g,-40,35,2000,1020,seed,0,'#d6e3e6'); g.restore()
    oldMap(g,1370,-90,650,550,seed+1,.1)
    oldMap(g,-240,730,660,440,seed+2,-.15)
    newspaper(g,1560,800,510,400,seed+3,-.13,'#d5d1bb')
    g.save(); g.globalAlpha=.25; cityEdge(g,seed); g.restore()
    g.strokeStyle='#668b9a38'; g.lineWidth=2
    for(let y=215;y<H;y+=215){g.beginPath();g.moveTo(0,y);g.lineTo(W,y+4);g.stroke()}
  } else if (kind === 'botanical') {
    ground(g,'#f2f0e9',seed)
    newspaper(g,-135,760,465,480,seed+1,-.14)
    scrap(g,1640,-80,330,310,{fill:'#dedcc7',rot:.14,rag:12,seed})
    scribble(g,1660,15,250,190,seed,'#202a24',.55)
    if (images['ornament-sheet']) {
      photographicOrnament(g,0,-180,300,720,-.12)
      photographicOrnament(g,0,1540,430,550,.13)
      photographicOrnament(g,3,1570,20,340,.07)
      photographicOrnament(g,2,1140,850,790,-.02)
    } else {
      botanicalSide(g,'left',seed,1.1); botanicalSide(g,'right',seed+13,.83)
      flower(g,1720,130,82,seed+30,'#cf9092')
      leaf(g,1810,470,260,43,-.1,seed+34,'#6f8a71')
    }
  } else if (kind === 'news') {
    ground(g,'#e9e3d4',seed)
    newspaper(g,-70,-80,700,690,seed,-.07)
    newspaper(g,1260,-60,710,820,seed+2,.08)
    newspaper(g,-160,765,840,520,seed+3,.06)
    sheetMusic(g,1270,800,760,390,seed+4,-.1)
    polygon(g,[[410,-20],[1380,0],[1450,430],[1360,750],[1410,1100],[490,1100],[535,660]],'#ede7d7',seed+5,10)
    scrap(g,35,385,225,340,{fill:'#bcc1b4',rot:-.09,rag:7,seed:seed+7})
    g.save();g.globalAlpha=.55;scribble(g,55,440,170,220,seed+8,'#454a3d',.5);g.restore()
    scrap(g,1730,365,280,170,{fill:'#3c7067',rot:.1,rag:8,seed:seed+9})
  } else {
    ground(g,'#f5f4f0',seed)
    scribble(g,-80,-85,320,350,seed,'#262925',.72)
    scrap(g,1745,870,260,240,{fill:'#dbdcc6',rot:.1,rag:14,seed})
    if (images['ornament-sheet']) {
      photographicOrnament(g,2,-180,710,760,-.025)
      photographicOrnament(g,2,1270,720,820,.015)
      photographicOrnament(g,0,1640,310,450,.13)
      photographicOrnament(g,3,1620,10,260,.06)
    } else {
      g.save();g.globalAlpha=.6;cityEdge(g,seed);g.restore()
    }
    g.strokeStyle='#ada99b35';g.lineWidth=1.3
    g.beginPath();g.moveTo(1890,0);g.lineTo(1844,430);g.lineTo(1920,890);g.stroke()
  }
  return c
}

/** Paint a full 1920 × 1080 physical-paper background behind the authored subject. */
export function background(g, kind = 'white', frame = 0, sceneIndex = 0) {
  if (cachedOrnamentImage !== images['ornament-sheet']) {
    // A pending asset must not lock a procedural fallback into the render cache.
    cachedOrnamentImage = images['ornament-sheet']
    cache.clear()
  }
  const normalized = ['white','blue','cubist','magenta','botanical','triptych','news','teal'].includes(kind) ? kind : 'white'
  const key = `${normalized}:${Math.abs(Math.trunc(sceneIndex)) % 3}`
  if (!cache.has(key)) {
    cache.set(key, build(normalized,Math.abs(Math.trunc(sceneIndex)) % 3))
    // Sequential rendering needs only a few looks resident, not a canvas per scene.
    if (cache.size > 8) cache.delete(cache.keys().next().value)
  }
  g.save(); g.globalAlpha=1; g.globalCompositeOperation='source-over'
  g.drawImage(cache.get(key),0,0)
  g.restore()
}
