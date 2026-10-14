import type Lenis from 'lenis'
import { cameraPlans } from './Camera'
import type { SceneManager } from './SceneManager'
import { TRAVEL_START } from './World'
import { createReveal, gsap } from './Animation'
import { clamp, createLenis, documentTop, ScrollTrigger } from '../utils/scroll'

export interface ScrollManagerOptions {
  container: HTMLElement
  scene: SceneManager
  /** 当前激活的 Section 索引（用于导航高亮） */
  onActive?: (sectionIndex: number) => void
  onReady?: () => void
}

interface WorldAnchor {
  sectionIndex: number
  world: number
  top: number
  height: number
  center: number
}

/**
 * 滚动管理器 —— 全局滚动系统的唯一大脑：
 *
 * 1. Lenis 平滑 + GSAP ScrollTrigger 同帧管线
 * 2. 8 个 Section 混合高度（4 全屏 + 4 非全屏）统一生命周期
 * 3. 5 个 3D 章节的镜头时间轴：start/end 使用实时 DOM 位置，
 *    因此 pin 造成的布局偏移会被 ScrollTrigger 在 refresh 时自动重算
 */
export class ScrollManager {
  private readonly container: HTMLElement
  private readonly scene: SceneManager
  private readonly sections: HTMLElement[]
  private readonly lenis: Lenis
  private readonly detachLenis: () => void
  private readonly cleanups: (() => void)[] = []
  private readonly onActive?: (sectionIndex: number) => void

  private anchors: WorldAnchor[] = []
  private activeWorld = -1
  private activeSection = -1
  private maxScroll = 1

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

    this.measure()
    this.buildCameraTimelines()
    this.setupSections()
    this.setupReveals()
    this.setupSeek()

    lenis.on('scroll', this.update)
    ScrollTrigger.addEventListener('refresh', this.onRefresh)
    this.update()

    ScrollTrigger.refresh()
    requestAnimationFrame(() => onReady?.())
  }

  /** 供 UI 调用：平滑滚动到第 index 个 Section */
  seek(sectionIndex: number) {
    const section = this.sections[sectionIndex]
    if (!section) return
    this.lenis.scrollTo(documentTop(section), {
      duration: 1.25,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    })
  }

  destroy() {
    this.lenis.off('scroll', this.update)
    ScrollTrigger.removeEventListener('refresh', this.onRefresh)
    window.removeEventListener('future:seek', this.onSeek)

    for (const cleanup of this.cleanups) cleanup()
    this.cleanups.length = 0

    this.detachLenis()
  }

  // ---------- 测量与镜头 ----------

  private measure() {
    this.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    this.anchors = this.sections
      .map((section, sectionIndex) => {
        const world = section.dataset.world
        if (!world) return null
        const top = documentTop(section)
        const height = section.offsetHeight
        return { sectionIndex, world: Number(world), top, height, center: top + height / 2 }
      })
      .filter((anchor): anchor is WorldAnchor => anchor !== null)
      .sort((a, b) => a.top - b.top)
  }

  /**
   * 每个 3D 章节一条 scrubbed 时间轴，范围 = [本章节顶部, 下一章节顶部]。
   * duration 使用函数式取值（px），配合 invalidateOnRefresh 在布局变化后重新求值。
   */
  private buildCameraTimelines() {
    const rig = this.scene.rig
    Object.assign(rig, cameraPlans[0].arrival)

    this.anchors.forEach((anchor, index) => {
      const plan = cameraPlans[anchor.world]
      if (!plan) return

      const section = this.sections[anchor.sectionIndex]
      const next = this.anchors[index + 1]
      const nextSection = next ? this.sections[next.sectionIndex] : null
      const nextPlan = next ? cameraPlans[next.world] : null

      const rangeEnd = () => (nextSection ? documentTop(nextSection) : this.maxScroll)
      const exploreEnd = () => documentTop(section) + section.offsetHeight * TRAVEL_START

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: this.container,
          start: () => Math.max(0, documentTop(section)),
          end: rangeEnd,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      // 显式写入到达机位：即使刷新发生在别处，本段时间轴也自洽
      timeline.set(rig, { ...plan.arrival })
      timeline.to(rig, {
        ...plan.explore,
        duration: () => Math.max(1, exploreEnd() - documentTop(section)),
      })
      timeline.to(rig, {
        ...(nextPlan ? nextPlan.arrival : (plan.finale ?? plan.explore)),
        duration: () => Math.max(1, rangeEnd() - exploreEnd()),
      })

      this.cleanups.push(() => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
      })
    })
  }

  // ---------- Section 生命周期 ----------

  private setupSections() {
    for (const anchor of this.anchors) {
      const section = this.sections[anchor.sectionIndex]
      const trigger = ScrollTrigger.create({
        trigger: section,
        // 区间必须等于「本章节占据滚动距离」：
        // start=章节顶部对齐视口顶部；end=章节底部对齐视口顶部。
        // 若写成 'bottom bottom'，对恰好 100vh 的章节区间长度为 0，进度会瞬间跳到 1。
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => this.scene.setSectionProgress(anchor.world, self.progress),
        onToggle: (self) => {
          section.dataset.entered = self.isActive ? 'true' : 'false'
        },
      })
      this.cleanups.push(() => {
        trigger.kill()
        delete section.dataset.entered
      })
    }
  }

  /** DOM 文案进出场（每个 Section 独立触发；标记 data-reveal-skip 的章节自行管理） */
  private setupReveals() {
    for (const section of this.sections) {
      if (section.dataset.revealSkip !== undefined) continue

      const items = [...section.querySelectorAll('[data-reveal]')]
      const tween = createReveal(items, { trigger: section })
      if (tween) {
        this.cleanups.push(() => {
          tween.scrollTrigger?.kill()
          tween.kill()
        })
      }
    }
  }

  private setupSeek() {
    window.addEventListener('future:seek', this.onSeek)
    this.cleanups.push(() => window.removeEventListener('future:seek', this.onSeek))
  }

  private onSeek = (event: Event) => {
    this.seek((event as CustomEvent<number>).detail ?? 0)
  }

  private onRefresh = () => {
    this.measure()
  }

  /** 滚动 → 场景：全局进度 / 速度 / 激活世界与激活 Section */
  private update = () => {
    const vh = Math.max(1, window.innerHeight)
    const scroll = window.scrollY
    this.maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)

    this.scene.setGlobalProgress(clamp(scroll / this.maxScroll, 0, 1))
    this.scene.setVelocity(clamp(Math.abs(this.lenis.velocity) / 40, 0, 1))

    const center = scroll + vh * 0.5

    // 导航高亮：以「视口中心落在哪个 Section」为准（8 个 Section 全参与）
    let activeSection = 0
    for (let index = 0; index < this.sections.length; index++) {
      const section = this.sections[index]
      const top = section.offsetTop
      if (center >= top) activeSection = index
    }

    if (activeSection !== this.activeSection) {
      this.activeSection = activeSection
      this.onActive?.(activeSection)
    }

    // 3D 世界激活：取离视口中心最近的 3D 章节锚点
    let best = this.anchors[0]
    let bestDistance = Infinity
    for (const anchor of this.anchors) {
      const distance = Math.abs(center - anchor.center)
      if (distance < bestDistance) {
        bestDistance = distance
        best = anchor
      }
    }

    if (best && best.world !== this.activeWorld) {
      this.activeWorld = best.world
      this.scene.setActive(best.world)
    }
  }
}
