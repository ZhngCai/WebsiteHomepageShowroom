import { gsap } from '../composables/useSmoothScroll'
import { useReducedMotion } from '../composables/useReducedMotion'

/**
 * Section 01 —— Hero
 *
 * 进入（不依赖滚动，四阶段，克制）：
 *   1. 标题逐行从下方漂入（行遮罩，非简单 fadeIn）
 *   2. 行内轻微 scaleX 展开，模拟字间距打开
 *   3. 副标题上移淡入
 *   4. 背景光晕极淡地浮现
 *
 * 滚动（ScrollTrigger scrub，空间离开感）：
 *   标题 scale ↑ / translateY ↑ / opacity ↓，背景反向 scale + translate，
 *   形成「内容向镜头后方掠过」的空间纵深。
 */
export function initHeroAnimation(root: HTMLElement) {
  const reduced = useReducedMotion()

  const ctx = gsap.context(() => {
    const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line] > span')
    const title = root.querySelector<HTMLElement>('[data-hero-title]')
    const subtitle = root.querySelector<HTMLElement>('[data-hero-subtitle]')
    const meta = root.querySelector<HTMLElement>('[data-hero-meta]')
    const glow = root.querySelector<HTMLElement>('[data-hero-glow]')
    const bg = root.querySelector<HTMLElement>('[data-hero-bg]')
    const footer = root.querySelector<HTMLElement>('[data-hero-footer]')

    // ---------- 1. 进入 ----------
    if (reduced) {
      gsap.set([lines, subtitle, meta, footer, glow], { opacity: 1, y: 0 })
    } else {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })

      intro
        .from(lines, { yPercent: 118, opacity: 0, duration: 1.25, stagger: 0.09 })
        .from(title, { scaleX: 1.05, transformOrigin: 'left center', duration: 1.4, ease: 'power4.out' }, 0.1)
        .from(subtitle, { y: 26, opacity: 0, duration: 1 }, '-=0.85')
        .from(meta, { opacity: 0, duration: 0.8 }, '-=1.1')
        .from(footer, { y: 18, opacity: 0, duration: 0.9 }, '-=0.9')
        .from(glow, { opacity: 0, scale: 0.9, duration: 1.8, ease: 'power2.out' }, 0.4)

      // ---------- 2. 滚动离开 ----------
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 1 },
        })
        .to(title, { scale: 1.14, yPercent: -14, opacity: 0.05 }, 0)
        .to(subtitle, { y: -46, opacity: 0 }, 0)
        .to(meta, { opacity: 0 }, 0)
        .to(footer, { y: -24, opacity: 0 }, 0)
        // 背景反向运动：视差 + 轻微放大，产生空间离开感
        .to(bg, { scale: 1.12, yPercent: 8 }, 0)
        .to(glow, { scale: 1.3, yPercent: 14, opacity: 0.35 }, 0)
    }
  }, root)

  return () => ctx.revert()
}
