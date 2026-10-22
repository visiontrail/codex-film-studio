import { C, PAPER } from './materials.mjs'
import { prop } from './props.mjs'

// Scene 01 alone receives a replacement paper dial. Keep the photographed
// alarm-clock body and every other use of the shared clock asset unchanged.
export function midnightClock(g, x, y, width, rotation = 0) {
  g.save()
  g.translate(x, y)
  g.rotate(rotation)
  g.scale(width / 301, width / 301)
  prop(g, 'clock', 0, 0, 301)
  const cx = 164, cy = 231, rx = 100, ry = 109
  g.save()
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip()
  g.fillStyle = '#e5d4ad'; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2)
  g.globalAlpha = .16
  g.drawImage(PAPER, 180, 220, 220, 230, cx - rx, cy - ry, rx * 2, ry * 2)
  g.restore()
  g.strokeStyle = '#766b52'; g.lineWidth = 1.1
  for (let tick = 0; tick < 60; tick++) {
    const a = tick * Math.PI / 30 - Math.PI / 2
    const long = tick % 5 === 0, inner = long ? .89 : .94
    g.beginPath()
    g.moveTo(cx + Math.cos(a) * rx * inner, cy + Math.sin(a) * ry * inner)
    g.lineTo(cx + Math.cos(a) * rx * .98, cy + Math.sin(a) * ry * .98)
    g.stroke()
  }
  g.fillStyle = C.ink; g.font = '26px Editorial'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  for (let n = 1; n <= 12; n++) {
    const a = n * Math.PI / 6 - Math.PI / 2
    g.fillText(String(n), cx + Math.cos(a) * rx * .78, cy + Math.sin(a) * ry * .79)
  }
  // Both hands point exactly to twelve. Their different lengths remain visible.
  g.strokeStyle = '#27291f'; g.lineCap = 'round'
  g.lineWidth = 8
  g.beginPath(); g.moveTo(cx, cy + 5); g.lineTo(cx, cy - 57); g.stroke()
  g.lineWidth = 3.5
  g.beginPath(); g.moveTo(cx, cy + 7); g.lineTo(cx, cy - 86); g.stroke()
  g.fillStyle = '#5a513a'
  g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill()
  g.restore()
}
