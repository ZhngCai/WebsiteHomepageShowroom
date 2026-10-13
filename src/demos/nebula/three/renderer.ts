import * as THREE from 'three'
import type { QualityProfile } from '@/shared/utils/device'

export function createRenderer(canvas: HTMLCanvasElement, quality: QualityProfile) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    alpha: false,
    stencil: false,
    depth: true,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  })

  renderer.setClearColor(new THREE.Color('#04050a'), 1)
  renderer.setPixelRatio(effectiveDpr(quality, 1))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.autoClear = true

  return renderer
}

/** 设备像素比 × 自适应缩放（帧率不足时自动降档） */
export function effectiveDpr(quality: QualityProfile, scale: number) {
  return Math.min(window.devicePixelRatio || 1, quality.dpr) * scale
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  quality: QualityProfile,
  scale = 1,
) {
  const width = window.innerWidth
  const height = window.innerHeight

  renderer.setPixelRatio(effectiveDpr(quality, scale))
  renderer.setSize(width, height, false)

  camera.aspect = width / Math.max(1, height)
  camera.updateProjectionMatrix()

  return { width, height }
}
