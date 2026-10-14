import * as THREE from 'three'
import { createArtCanvas, paintArt } from '@/shared/utils/art'

export { mulberry32, paintArt } from '@/shared/utils/art'

/** 径向光晕贴图 —— 用于核心光球、辉光精灵 */
export function createRadialGlowTexture(color = '#ffffff', size = 256) {
  const canvas = createArtCanvas(size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[textures] 2D 上下文不可用')

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.18, `${color}cc`)
  gradient.addColorStop(0.45, `${color}44`)
  gradient.addColorStop(1, `${color}00`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** 单张艺术图纹理 */
export function createArtTexture(size = 256, seed = 1) {
  const canvas = createArtCanvas(size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[textures] 2D 上下文不可用')

  paintArt(ctx, 0, 0, size, seed)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * 艺术图集 —— 一张纹理内含 cols×cols 张图，
 * 供 InstancedMesh + UV 偏移使用（1 次 draw call 渲染上百张卡片）。
 */
export function createArtAtlas(cols = 8, tileSize = 192) {
  const size = cols * tileSize
  const canvas = createArtCanvas(size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[textures] 2D 上下文不可用')

  for (let index = 0; index < cols * cols; index++) {
    const x = (index % cols) * tileSize
    const y = Math.floor(index / cols) * tileSize
    paintArt(ctx, x, y, tileSize, index * 7919 + 13)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return { texture, cols, count: cols * cols }
}

/** 文字精灵纹理 —— 用于年份、标签等 3D 文字 */
export function createTextTexture(text: string, options: { size?: number; color?: string; font?: string } = {}) {
  const { size = 256, color = '#e9ecff', font = '600 96px Inter, "PingFang SC", sans-serif' } = options
  const canvas = createArtCanvas(size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[textures] 2D 上下文不可用')

  ctx.clearRect(0, 0, size, size)
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.12
  ctx.fillStyle = color
  ctx.fillText(text, size / 2, size / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * 巨幅标题纹理 —— 用于 Hero 的「巨大 3D 文字」：
 * 宽高比可变，透明底，直接贴在 3D 平面上。
 */
export function createTitleTexture(
  lines: string[],
  options: { width?: number; height?: number; color?: string; accent?: string; letterSpacing?: string } = {},
) {
  const { width = 2048, height = 768, color = '#ffffff', accent = '#7c5cff', letterSpacing = '0.08em' } = options
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[textures] 2D 上下文不可用')

  ctx.clearRect(0, 0, width, height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const fontSize = Math.floor(height / (lines.length * 1.28))
  ctx.font = `600 ${fontSize}px Inter, "PingFang SC", sans-serif`

  // letterSpacing 为较新的 Canvas2D 属性，老浏览器下静默跳过
  const spacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
  if (spacing.letterSpacing !== undefined) spacing.letterSpacing = letterSpacing

  ctx.shadowColor = accent
  ctx.shadowBlur = fontSize * 0.5

  lines.forEach((line, index) => {
    const y = height / 2 + (index - (lines.length - 1) / 2) * fontSize * 1.28
    const gradient = ctx.createLinearGradient(0, y - fontSize / 2, 0, y + fontSize / 2)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, accent)
    ctx.fillStyle = gradient
    ctx.fillText(line, width / 2, y)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return { texture, aspect: width / height }
}
