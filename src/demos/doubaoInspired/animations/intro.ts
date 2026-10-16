import { gsap, ScrollTrigger } from '../composables/useSmoothScroll'

/** 状态切换的连续插值：以「与当前索引的距离」计算，避免任何跳变 */
function stateFor(delta: number) {
  if (delta >= 0) {
    // 当前内容与已经过去的内容
    return {
      scale: 1 - Math.min(0.08, delta * 0.08),
      opacity: Math.max(0.2, 1 - delta * 0.9),
      y: 0,
    }
  }
  // 尚未进入的内容
  return {
    scale: 1,
    opacity: Math.max(0, 1 + delta * 1.25),
    y: Math.min(60, -delta * 60),
  }
}

/**
 * Section 02 —— AI 能力（Sticky Scroll Storytelling）
 *
 * 左侧标题 sticky 固定，右侧 01~04 内容随滚动逐个切换：
 *   当前 scale 1 / opacity 1，上一条 0.92 / 0.2，下一条 +60px / 0。
 * 状态用连续插值计算，不使用 display:none，全部由 GSAP 控制。
 *
 * 响应式与可访问性用 gsap.matchMedia 分流：
 *   - 桌面：完整 Sticky 叙事
 *   - 移动端：降级为堆叠列表（保留内容，去掉状态切换）
 *   - prefers-reduced-motion：只做淡入
 */
export function initIntroAnimation(root: HTMLElement) {
  const items = gsap.utils.toArray<HTMLElement>('[data-intro-item]', root)
  const title = root.querySelector<HTMLElement>('[data-intro-title]')
  if (!items.length) return

  const tints = ['#ffffff', '#f8f9ff', '#f6f4ff', '#f7f7f8']

  const mix = (a: string, b: string, ratio: number) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
    return `rgb(${pa.map((value, index) => Math.round(value + (pb[index] - value) * ratio)).join(', ')})`
  }

  const mm = gsap.matchMedia()

  // ---------- 桌面：完整 Sticky 叙事 ----------
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const setters = items.map((item) => ({
      scale: gsap.quickSetter(item, 'scale') as (v: number) => void,
      opacity: gsap.quickSetter(item, 'opacity') as (v: number) => void,
      y: gsap.quickSetter(item, 'y', 'px') as (v: number) => void,
    }))

    const apply = (progress: number) => {
      const position = progress * (items.length - 1)
      setters.forEach((setter, index) => {
        const state = stateFor(position - index)
        setter.scale(state.scale)
        setter.opacity(state.opacity)
        setter.y(state.y)
      })
    }

    apply(0)

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
    })

    // 背景色随进度缓慢变化（单元素、每帧一次写入）
    const bgTrigger = ScrollTrigger.create({
      trigger: root,
      start: 'top 70%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const position = self.progress * (tints.length - 1)
        const from = Math.floor(position)
        const to = Math.min(tints.length - 1, from + 1)
        root.style.backgroundColor = mix(tints[from], tints[to], position - from)
      },
    })

    // 左侧标题轻微跟随，避免完全静止显得呆板
    const titleTween = title
      ? gsap.fromTo(
          title,
          { y: 26 },
          {
            y: -26,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1 },
          },
        )
      : null

    return () => {
      trigger.kill()
      bgTrigger.kill()
      titleTween?.scrollTrigger?.kill()
      titleTween?.kill()
      root.style.backgroundColor = ''
    }
  })

  // ---------- 移动端 / 减弱动效：降级为堆叠列表 ----------
  mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
    gsap.set(items, { clearProps: 'all', opacity: 1, y: 0, scale: 1 })
    const tween = gsap.from(items, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: root, start: 'top 70%' },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })

  return () => mm.revert()
}
