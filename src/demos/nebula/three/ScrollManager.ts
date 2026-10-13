import gsap from 'gsap'
import type Lenis from 'lenis'
import { cameraPlans } from './cameraPath'
import type { SceneManager } from './SceneManager'
import { clamp, createLenis, ScrollTrigger } from '../utils/scroll'
import { prefersReducedMotion } from '@/shared/utils/device'

export interface ScrollManagerOptions {
  container: HTMLElement
  scene: SceneManager
  onActive?: (index: number) => void
  onReady?: () => void
}

/**
 * 滚动管理器 —— 6 屏沉浸式滚动系统的唯一大脑：
 * Lenis 平滑 + ScrollTrigger 驱动镜头时间轴 + snap 吸附 + section 进出动画。
 */
export class ScrollManager {
  private readonly container: HTMLElement
  private readonly scene: SceneManager
  private readonly lenis: Lenis
  private readonly detachLenis: () => void
  private readonly sections: HTMLElement[]
  private readonly timeline: ReturnType<typeof gsap.timeline>
  private readonly cleanups: (() => void)[] = []
  private readonly onActive?: (index: number) => void

  private snapTimer: ReturnType<typeof setTimeout> | undefined
  private snapping = false
  private activeIndex = -1

  constructor({ container, scene, onActive, onReady }: ScrollManagerOptions) {
    this.container = container
    this.scene = scene
    this.onActive = onActive
    this.sections = [...container.querySelectorAll<HTMLElement>('[data-section]')]

    // Demo 必须独立运行：屏蔽浏览器滚动还原，每次进入都从第一屏开始
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const { lenis, detach } = createLenis()
    this.lenis = lenis
    this.detachLenis = detach

    this.timeline = this.buildCameraTimeline()
    this.setupSections()
    this.setupReveals()
    this.setupSnap()
    this.setupSeek()

    lenis.on('scroll', this.update)
    this.update()

    ScrollTrigger.refresh()
    requestAnimationFrame(() => onReady?.())
  }

  /** 供 UI 调用：跳转到第 index 屏 */
  seek(index: number) {
    const target = Math.min(index * window.innerHeight, this.lenis.limit)
    this.snapping = true
    this.lenis.scrollTo(target, {
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      lock: true,
      onComplete: () => (this.snapping = false),
    })
  }

  destroy() {
    clearTimeout(this.snapTimer)
    this.lenis.off('scroll', this.update)
    window.removeEventListener('nebula:seek', this.onSeek)

    this.timeline.scrollTrigger?.kill()
    this.timeline.kill()
    for (const cleanup of this.cleanups) cleanup()
    this.cleanups.length = 0

    this.detachLenis()
  }

  /**
   * 镜头时间轴：6 段，总时长固定为 6（1 段 = 1 屏滚动）。
   * 每段 = 探索当前世界(0.62) + 飞向下一世界(0.38)；末段只做探索。
   */
  private buildCameraTimeline() {
    const rig = this.scene.rig
    Object.assign(rig, cameraPlans[0].arrival)

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      scrollTrigger: {
        trigger: this.container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    cameraPlans.forEach((plan, index) => {
      const next = cameraPlans[index + 1]
      timeline.to(rig, { ...plan.explore, duration: next ? 0.62 : 1 })
      if (next) timeline.to(rig, { ...next.arrival, duration: 0.38 })
    })

    return timeline
  }

  /** 每屏一个 ScrollTrigger：暴露 onEnter / onLeave（写入 data-entered 供样式与调试使用） */
  private setupSections() {
    this.sections.forEach((section) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          section.dataset.entered = self.isActive ? 'true' : 'false'
        },
      })
      this.cleanups.push(() => {
        trigger.kill()
        delete section.dataset.entered
      })
    })
  }

  /** DOM 文案进出场：进入 fade + rise，离开自动 reverse */
  private setupReveals() {
    // 系统开启“减弱动效”时只做淡入，不做位移与模糊
    const reduced = prefersReducedMotion()

    for (const section of [...this.sections, this.container.querySelector<HTMLElement>('[data-outro]')]) {
      if (!section) continue
      const items = section.querySelectorAll('[data-reveal]')
      if (!items.length) continue

      gsap.set(items, reduced ? { opacity: 0 } : { opacity: 0, y: 46, filter: 'blur(14px)' })

      const tween = gsap.to(items, {
        opacity: 1,
        ...(reduced ? {} : { y: 0, filter: 'blur(0px)' }),
        duration: reduced ? 0.6 : 1.15,
        stagger: reduced ? 0.04 : 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 62%',
          end: 'bottom 30%',
          toggleActions: 'play reverse play reverse',
        },
      })
      this.cleanups.push(() => {
        tween.scrollTrigger?.kill()
        tween.kill()
      })
    }
  }

  /** 吸附：停止滚动后自动对齐到最近的一屏（Apple 官网式 snap） */
  private setupSnap() {
    // 调试开关：?nosnap 关闭吸附，便于逐帧检查中间态
    const enabled = !new URLSearchParams(location.search).has('nosnap')

    const schedule = () => {
      if (!enabled || this.snapping) return
      clearTimeout(this.snapTimer)
      this.snapTimer = setTimeout(() => {
        if (this.lenis.isScrolling || Math.abs(this.lenis.velocity) > 0.35) {
          schedule()
          return
        }
        const index = Math.round(this.lenis.actualScroll / window.innerHeight)
        const target = clamp(index, 0, this.sections.length) * window.innerHeight
        if (Math.abs(target - this.lenis.actualScroll) < 2) return

        this.snapping = true
        this.lenis.scrollTo(Math.min(target, this.lenis.limit), {
          duration: 0.9,
          easing: (t) => 1 - Math.pow(1 - t, 4),
          lock: true,
          onComplete: () => (this.snapping = false),
        })
      }, 170)
    }

    this.lenis.on('scroll', schedule)
    this.cleanups.push(() => this.lenis.off('scroll', schedule))
  }

  private setupSeek() {
    window.addEventListener('nebula:seek', this.onSeek)
    this.cleanups.push(() => window.removeEventListener('nebula:seek', this.onSeek))
  }

  private onSeek = (event: Event) => {
    this.seek((event as CustomEvent<number>).detail ?? 0)
  }

  /** 滚动 → 场景：section 进度 / 全局进度 / 激活世界与激活屏 */
  private update = () => {
    const vh = Math.max(1, window.innerHeight)
    const scroll = window.scrollY
    const raw = scroll / vh
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)

    for (let index = 0; index < this.sections.length; index++) {
      this.scene.setSectionProgress(index, clamp(raw - index, 0, 1))
    }

    this.scene.setGlobalProgress(clamp(scroll / maxScroll, 0, 1))

    const active = clamp(Math.round(raw), 0, this.sections.length - 1)
    this.scene.setActive(active)

    if (active !== this.activeIndex) {
      this.activeIndex = active
      this.onActive?.(active)
    }
  }
}
