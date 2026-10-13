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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dpr))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.autoClear = true

  return renderer
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  quality: QualityProfile,
) {
  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, quality.dpr)

  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height, false)

  camera.aspect = width / Math.max(1, height)
  camera.updateProjectionMatrix()

  return { width, height, dpr }
}
