import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export interface ScrollManagerOptions {
  /** 全局滚动进度 0~1 */
  onProgress?: (progress: number) => void
}

/**
 * 滚动引擎 —— 把 Lenis / GSAP / ScrollTrigger 收敛到同一条 requestAnimationFrame 管线。
 *
 * 关键设计：
 * 1. Lenis 用 requestAnimationFrame 手动驱动（autoRaf: false），并在每个滚动事件里
 *    调用 ScrollTrigger.update()，保证「滚动位置」与「ScrollTrigger 进度」同帧一致，
 *    不会出现 ScrollTrigger 跳动。
 * 2. gsap.ticker.lagSmoothing(0)：标签页切回 / 主线程卡顿后不做补帧，
 *    避免 Safari 上因为补帧导致的滚动跳动。
 * 3. ScrollTrigger.config({ ignoreMobileResize: true })：iOS Safari 地址栏收放会触发
 *    resize，忽略它可避免 sticky / pin 位置抖动。
 * 4. 尊重 prefers-reduced-motion：Lenis 自动退化为原生滚动（respectReducedMotion 默认 true）。
 */
export class ScrollManager {
  private lenis: Lenis | null = null
  private rafId = 0
  private started = false
  private readonly onProgress?: (progress: number) => void
  private globalTrigger: ScrollTrigger | null = null

  constructor(options: ScrollManagerOptions = {}) {
    this.onProgress = options.onProgress
  }

  get instance() {
    return this.lenis
  }

  start() {
    if (this.started) return
    this.started = true

    // Demo 必须独立运行：每次进入都从页面顶部开始，不还原上次滚动位置
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.config({ ignoreMobileResize: true })
    ScrollTrigger.clearScrollMemory('manual')

    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // 触屏交给系统原生惯性：iOS Safari 的 sticky / pin 与原生滚动配合最稳
      syncTouch: false,
      touchMultiplier: 1.6,
      autoRaf: false,
      anchors: false,
      stopInertiaOnNavigate: true,
    })

    this.lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      this.lenis?.raf(time)
      this.rafId = requestAnimationFrame(raf)
    }
    this.rafId = requestAnimationFrame(raf)

    if (this.onProgress) {
      this.globalTrigger = ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => this.onProgress?.(self.progress),
      })
    }

    ScrollTrigger.refresh()
  }

  destroy() {
    if (!this.started) return
    this.started = false

    cancelAnimationFrame(this.rafId)
    this.rafId = 0

    this.globalTrigger?.kill()
    this.globalTrigger = null

    this.lenis?.off('scroll', ScrollTrigger.update)
    this.lenis?.destroy()
    this.lenis = null
  }
}

/** 单例：同一时间只允许一个 Demo 持有滚动引擎 */
let shared: ScrollManager | null = null

export function getScrollManager(options: ScrollManagerOptions = {}) {
  if (!shared) shared = new ScrollManager(options)
  return shared
}

export function disposeScrollManager() {
  shared?.destroy()
  shared = null
}
