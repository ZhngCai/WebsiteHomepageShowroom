import * as THREE from 'three'
import gsap from 'gsap'

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement
  onFrame?: (time: number, delta: number) => void
}

/**
 * AI Future Lab 的 Three.js 生命周期管理器（仅音乐模块使用）。
 *
 * 只做三件事：渲染器 / 场景 / 相机的最小组合、与 GSAP ticker 同步的帧循环、
 * 以及完整的资源释放（离开路由后释放 GPU，避免泄漏）。
 */
export class SceneManager {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera

  private readonly canvas: HTMLCanvasElement
  private readonly onFrame?: (time: number, delta: number) => void
  private elapsed = 0
  private running = false
  private visible = true

  constructor({ canvas, onFrame }: SceneManagerOptions) {
    this.canvas = canvas
    this.onFrame = onFrame

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    this.renderer.setClearAlpha(0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100)
    this.camera.position.set(0, 0, 46)
    this.camera.lookAt(0, 0, 0)
  }

  start() {
    if (this.running) return
    this.running = true
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.add(this.tick)
    window.addEventListener('resize', this.onResize, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
    this.resize()
  }

  stop() {
    if (!this.running) return
    this.running = false
    gsap.ticker.remove(this.tick)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth
    const height = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / Math.max(1, height)
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this.stop()

    this.scene.traverse((node) => {
      const geometry = (node as THREE.Mesh).geometry
      geometry?.dispose()

      const material = (node as unknown as { material?: THREE.Material | THREE.Material[] }).material
      if (!material) return
      for (const item of Array.isArray(material) ? material : [material]) {
        for (const value of Object.values(item as unknown as Record<string, unknown>)) {
          if (value && typeof value === 'object' && (value as THREE.Texture).isTexture) {
            ;(value as THREE.Texture).dispose()
          }
        }
        item.dispose()
      }
    })
    this.scene.clear()

    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  private tick = (_time: number, deltaTime: number) => {
    if (!this.visible) return
    const delta = Math.min(deltaTime / 1000, 0.05)
    this.elapsed += delta
    this.onFrame?.(this.elapsed, delta)
    this.renderer.render(this.scene, this.camera)
  }

  private onResize = () => this.resize()

  private onVisibility = () => {
    this.visible = document.visibilityState === 'visible'
  }
}
