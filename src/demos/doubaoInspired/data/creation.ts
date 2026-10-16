import { mulberry32 } from '@/shared/utils/art'

/**
 * Section 04 的视觉作品 —— 程序化生成（与项目其它 Demo 一致，不引入外部图片素材）。
 * 风格：浅色、编辑感、克制的蓝紫渐变 + 细线结构 + 轻微颗粒。
 */
export function createEditorialImage(width = 1280, height = 800, seed = 20261016) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[afl] 2D 上下文不可用')

  const random = mulberry32(seed)

  // 底色：纸白
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // 大面积柔光
  const blobs = [
    { x: 0.24, y: 0.3, r: 0.62, color: 'rgba(91, 124, 250, 0.22)' },
    { x: 0.74, y: 0.62, r: 0.56, color: 'rgba(139, 124, 246, 0.2)' },
    { x: 0.52, y: 0.18, r: 0.42, color: 'rgba(46, 230, 255, 0.1)' },
  ]
  for (const blob of blobs) {
    const gradient = ctx.createRadialGradient(
      blob.x * width,
      blob.y * height,
      0,
      blob.x * width,
      blob.y * height,
      blob.r * width,
    )
    gradient.addColorStop(0, blob.color)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  // 细线结构（编辑感排版线）
  ctx.strokeStyle = 'rgba(17, 17, 17, 0.08)'
  ctx.lineWidth = 1
  const columns = 9
  for (let i = 1; i < columns; i++) {
    const x = (i / columns) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let i = 1; i < 6; i++) {
    const y = (i / 6) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 几何体：少量、低透明度
  ctx.globalAlpha = 0.16
  for (let i = 0; i < 4; i++) {
    const size = 120 + random() * 320
    const x = random() * (width - size)
    const y = random() * (height - size)
    ctx.fillStyle = i % 2 === 0 ? '#5b7cfa' : '#8b7cf6'
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 一条横向的强调线
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = '#5b7cfa'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(width * 0.08, height * 0.72)
  ctx.lineTo(width * 0.42, height * 0.72)
  ctx.stroke()

  // 颗粒
  ctx.globalAlpha = 0.05
  ctx.fillStyle = '#111111'
  const grains = Math.floor(width * height * 0.0006)
  for (let i = 0; i < grains; i++) {
    ctx.fillRect(random() * width, random() * height, 1, 1)
  }

  ctx.globalAlpha = 1

  return canvas.toDataURL('image/jpeg', 0.9)
}
