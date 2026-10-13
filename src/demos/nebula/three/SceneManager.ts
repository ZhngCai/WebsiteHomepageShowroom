import * as THREE from 'three'
import gsap from 'gsap'
import { createAmbientStars } from './AmbientStars'
import { applyCameraRig, createCamera, createCameraRig } from './camera'
import { createRenderer, resizeRenderer } from './renderer'
import { createScene } from './scene'
import type { FrameContext, World } from './World'
import { getQuality, type QualityProfile } from '@/shared/utils/device'

export type WorldFactory = (index: number) => World

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement
  onActiveChange?: (index: number) => void
}

/**
 * 场景管理器 —— 单渲染器 / 单场景 / 单相机，
 * 六个世界共享一次 draw call 提交，按需构建、按需更新。
 */
export class SceneManager {
  readonly quality: QualityProfile = getQuality()
  readonly renderer: THREE.WebGLRenderer
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly rig = createCameraRig()
  readonly pointer = new THREE.Vector2()

  private readonly canvas: HTMLCanvasElement
  private readonly stars: ReturnType<typeof createAmbientStars>
  private readonly pointerTarget = new THREE.Vector2()
  private readonly factories: WorldFactory[] = []
  private readonly worlds = new Map<number, World>()
  private readonly sectionProgress: number[] = []
  private readonly broken = new Set<string>()
  private readonly onActiveChange?: (index: number) => void

  private activeIndex = 0
  private globalProgress = 0
  private elapsed = 0
  private running = false
  private visible = true

  constructor({ canvas, onActiveChange }: SceneManagerOptions) {
    this.canvas = canvas
    this.onActiveChange = onActiveChange
    this.renderer = createRenderer(canvas, this.quality)
    this.scene = createScene()
    this.camera = createCamera()
    this.stars = createAmbientStars(this.quality.tier === 'low' ? 900 : 2200)
    this.scene.add(this.stars.group)
  }

  registerWorlds(factories: WorldFactory[]) {
    for (const world of this.worlds.values()) world.dispose()
    this.worlds.clear()
    this.factories.length = 0
    this.factories.push(...factories)
    this.sectionProgress.length = 0
    for (let i = 0; i < factories.length; i++) this.sectionProgress.push(0)

    this.ensureWorlds()
    this.worlds.get(this.activeIndex)?.enter()
  }

  getWorld(index: number) {
    return this.worlds.get(index)
  }

  setActive(index: number) {
    if (index === this.activeIndex) return
    this.worlds.get(this.activeIndex)?.leave()
    this.activeIndex = index
    this.ensureWorlds()
    this.worlds.get(index)?.enter()
    this.onActiveChange?.(index)
  }

  setSectionProgress(index: number, progress: number) {
    this.sectionProgress[index] = progress
    this.worlds.get(index)?.setProgress(progress)
  }

  setGlobalProgress(progress: number) {
    this.globalProgress = progress
  }

  start() {
    if (this.running) return
    this.running = true

    gsap.ticker.lagSmoothing(0)
    gsap.ticker.add(this.tick)

    window.addEventListener('resize', this.onResize, { passive: true })
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
    this.canvas.addEventListener('webglcontextlost', this.onContextLost, false)
  }

  stop() {
    if (!this.running) return
    this.running = false
    gsap.ticker.remove(this.tick)
  }

  resize() {
    const { height } = resizeRenderer(this.renderer, this.camera, this.quality)
    this.stars.resize(height)
  }

  dispose() {
    this.stop()

    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)

    for (const world of this.worlds.values()) world.dispose()
    this.worlds.clear()
    this.factories.length = 0
    this.broken.clear()

    this.stars.dispose()
    this.scene.clear()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  private tick = (time: number, deltaTime: number) => {
    this.render(time, deltaTime)
  }

  private render(_time: number, deltaTime: number) {
    if (!this.visible) return

    const delta = Math.min(deltaTime / 1000, 0.05)
    this.elapsed += delta
    this.pointer.lerp(this.pointerTarget, 0.06)

    applyCameraRig(this.camera, this.rig, this.pointer.x * 1.4, -this.pointer.y * 0.9)
    this.stars.update(this.elapsed)

    const ctx: FrameContext = {
      time: this.elapsed,
      delta,
      camera: this.camera,
      pointer: this.pointer,
      progress: 0,
      globalProgress: this.globalProgress,
      quality: this.quality,
      active: false,
    }

    for (const [index, world] of this.worlds) {
      if (!world.group.visible || this.broken.has(world.id)) continue
      ctx.progress = this.sectionProgress[index] ?? 0
      ctx.active = index === this.activeIndex
      try {
        world.update(ctx)
      } catch (error) {
        this.broken.add(world.id)
        console.error(`[world:${world.id}] 更新异常，已停用该世界:`, error)
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  private ensureWorlds() {
    const range = 1
    const from = Math.max(0, this.activeIndex - range)
    const to = Math.min(this.factories.length - 1, this.activeIndex + range)

    for (let i = from; i <= to; i++) this.ensureWorld(i)

    for (const [index, world] of this.worlds) {
      world.group.visible = Math.abs(index - this.activeIndex) <= range
    }
  }

  private ensureWorld(index: number) {
    const cached = this.worlds.get(index)
    if (cached) return cached

    const factory = this.factories[index]
    if (!factory) return undefined

    try {
      const world = factory(index)
      world.build()
      this.scene.add(world.group)
      this.worlds.set(index, world)
      return world
    } catch (error) {
      console.error(`[scene] 世界 ${index} 构建失败:`, error)
      return undefined
    }
  }

  private onResize = () => {
    this.resize()
  }

  private onPointerMove = (event: PointerEvent) => {
    const x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1
    const y = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    this.pointerTarget.set(x, -y)
  }

  private onVisibility = () => {
    this.visible = document.visibilityState === 'visible'
  }

  private onContextLost = (event: Event) => {
    event.preventDefault()
    console.warn('[scene] WebGL 上下文丢失，等待恢复')
  }
}
