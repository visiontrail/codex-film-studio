// Original generic Canvas geometry; output-pixel strokes and deterministic boil.
export const INK = '#1b1422';

export function smallFigureStroke(scale, threshold = 0.65, minimum = 0.12) {
  if (!Number.isFinite(scale) || scale < 0 || !Number.isFinite(threshold) ||
      threshold <= 0 || !Number.isFinite(minimum) || minimum <= 0 || minimum > 1) {
    throw new RangeError('Invalid small-figure stroke parameters');
  }
  return Math.min(1, Math.max(minimum, scale / threshold));
}

export class Ink {
  constructor(context, frame, {framesPerDrawing = 2, cycle = 3} = {}) {
    if (!Number.isSafeInteger(frame) || frame < 0 ||
        !Number.isSafeInteger(framesPerDrawing) || framesPerDrawing < 1 ||
        !Number.isSafeInteger(cycle) || cycle < 1) {
      throw new RangeError('Invalid drawing clock');
    }
    this.context = context;
    this.phase = Math.floor(frame / framesPerDrawing) % cycle;
    this.matrix = [1, 0, 0, 1, 0, 0];
    this.stack = [];
    this.strokeScale = 1;
  }

  push(x = 0, y = 0, sx = 1, sy = sx, angle = 0) {
    this.stack.push([...this.matrix]);
    const [a, b, c, d, e, f] = this.matrix;
    const co = Math.cos(angle), si = Math.sin(angle);
    this.matrix = [(a * co + c * si) * sx, (b * co + d * si) * sx,
      (-a * si + c * co) * sy, (-b * si + d * co) * sy,
      a * x + c * y + e, b * x + d * y + f];
  }

  pop() {
    if (!this.stack.length) throw new Error('Unbalanced drawing transform');
    this.matrix = this.stack.pop();
  }

  point([x, y]) {
    const [a, b, c, d, e, f] = this.matrix;
    return [a * x + c * y + e, b * x + d * y + f];
  }

  withStrokeScale(scale, draw) {
    if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('Invalid stroke scale');
    const previous = this.strokeScale;
    this.strokeScale *= scale;
    try { return draw(this); } finally { this.strokeScale = previous; }
  }

  path(points, {closed = true, boil = 1, seed = 0, spacing = 9} = {}) {
    if (!Number.isFinite(spacing) || spacing <= 0) throw new RangeError('Invalid spacing');
    const source = points.map(point => this.point(point));
    if (source.length < 2) return source;
    const output = [];
    let distance = 0;
    for (let i = 0; i < source.length - (closed ? 0 : 1); i++) {
      const [x, y] = source[i], next = source[(i + 1) % source.length];
      const dx = next[0] - x, dy = next[1] - y, length = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(length / spacing));
      for (let j = 0; j < steps; j++) {
        const progress = j / steps, arc = distance + length * progress;
        const offset = boil * this.strokeScale * (
          1.15 * Math.sin(arc * 0.053 + this.phase * 2.1 + seed) +
          0.45 * Math.sin(arc * 0.13 + this.phase * 3.2));
        output.push([x + dx * progress - dy / (length || 1) * offset,
          y + dy * progress + dx / (length || 1) * offset]);
      }
      distance += length;
    }
    if (!closed) output.push(source.at(-1));
    return output;
  }

  poly(points, {fill = null, stroke = INK, width = 7, ...options} = {}) {
    const path = this.path(points, options);
    if (!path.length) return;
    const c = this.context;
    c.save();
    try {
      // All geometry above is already in output pixels; caller transforms cannot
      // accidentally multiply the stroke or the world-to-screen transform again.
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.beginPath();
      path.forEach((point, i) => i ? c.lineTo(...point) : c.moveTo(...point));
      if (options.closed !== false) c.closePath();
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke && width > 0) {
        c.strokeStyle = stroke;
        c.lineWidth = width * this.strokeScale;
        c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke();
      }
    } finally { c.restore(); }
  }

  ellipse(x, y, rx, ry, options = {}) {
    this.poly(Array.from({length: 64}, (_, i) => {
      const angle = i / 64 * Math.PI * 2;
      return [x + Math.cos(angle) * rx, y + Math.sin(angle) * ry];
    }), options);
  }
}
