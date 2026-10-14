/**
 * 程序化艺术图 —— 与 Three.js 无关的纯 Canvas 绘制，
 * 既可用于 3D 贴图（three/textures.ts），也可直接生成 DOM 图片 data URL。
 */

const ART_PALETTES = [
  ['#7c5cff', '#2ee6ff', '#0a0c1e'],
  ['#ff5fa2', '#7c5cff', '#160a1e'],
  ['#2ee6ff', '#0a6f8f', '#040d14'],
  ['#ffc46b', '#ff5fa2', '#1a0d08'],
  ['#8fa6ff', '#c7b8ff', '#0b0d1c'],
  ['#39ffd0', '#2ee6ff', '#04140f'],
  ['#ff8f6b', '#ffd9a0', '#160b06'],
  ['#b16bff', '#39ffd0', '#0d0618'],
]

/** 确定性伪随机（同一 seed 每次刷新结果一致，保证 Demo 可复现） */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createArtCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

/** 在给定 2D 上下文里绘制一张程序化艺术图（无需外部图片资源） */
export function paintArt(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, seed: number) {
  const random = mulberry32(seed)
  const [c1, c2, bg] = ART_PALETTES[Math.floor(random() * ART_PALETTES.length)]

  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.rect(0, 0, size, size)
  ctx.clip()

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  const base = ctx.createLinearGradient(0, 0, size, size)
  base.addColorStop(0, `${c1}${random() > 0.5 ? 'aa' : '88'}`)
  base.addColorStop(1, `${c2}55`)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  const blobs = 3 + Math.floor(random() * 4)
  for (let i = 0; i < blobs; i++) {
    const radius = size * (0.12 + random() * 0.4)
    const bx = random() * size
    const by = random() * size
    const glow = ctx.createRadialGradient(bx, by, 0, bx, by, radius)
    const color = random() > 0.5 ? c1 : c2
    glow.addColorStop(0, `${color}dd`)
    glow.addColorStop(1, `${color}00`)
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)
  }

  ctx.globalAlpha = 0.28
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  const lines = 4 + Math.floor(random() * 8)
  for (let i = 0; i < lines; i++) {
    ctx.beginPath()
    const ly = (i / lines) * size + random() * 6
    ctx.moveTo(0, ly)
    ctx.lineTo(size, ly + (random() - 0.5) * 24)
    ctx.stroke()
  }

  if (random() > 0.55) {
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = c2
    ctx.lineWidth = size * 0.02
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * (0.2 + random() * 0.16), 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

/** 单张艺术图的 data URL —— 直接给 <img> / CSS background 使用 */
export function createArtDataUrl(size = 512, seed = 1) {
  const canvas = createArtCanvas(size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[art] 2D 上下文不可用')

  paintArt(ctx, 0, 0, size, seed)
  return canvas.toDataURL('image/jpeg', 0.86)
}

/** 批量生成艺术图（带尺寸与 seed，便于瀑布流/时间轴复用） */
export function createArtSet(count: number, size = 512, seedOffset = 0) {
  return Array.from({ length: count }, (_, index) => createArtDataUrl(size, seedOffset + index * 7919 + 13))
}
