import { gsap } from '../composables/useSmoothScroll'

/**
 * Section 08 —— Ending
 *
 * 三段：巨大文字从远处进入 → 快速靠近（scale 1 → 4 并淡出）→ 屏幕只剩一个圆点，
 * 圆点缓慢缩小，页面结束。回到极简，克制收尾。
 */
export function initEndingAnimation(root: HTMLElement) {
  const title = root.querySelector<HTMLElement>('[data-ending-title]')
  const subtitle = root.querySelector<HTMLElement>('[data-ending-subtitle]')
  const dot = root.querySelector<HTMLElement>('[data-ending-dot]')
  const glow = root.querySelector<HTMLElement>('[data-ending-glow]')
  if (!title) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1 },
    })

    timeline
      // 从远处进入
      .fromTo(
        title,
        { scale: 0.42, opacity: 0, y: 60 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0,
      )
      .fromTo(subtitle, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.24)
      .fromTo(glow, { opacity: 0, scale: 0.8 }, { opacity: 0.8, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.1)
      // 快速靠近
      .to(subtitle, { opacity: 0, duration: 0.1 }, 0.44)
      .to(title, { scale: 4, opacity: 0, duration: 0.34, ease: 'power2.in' }, 0.46)
      .to(glow, { opacity: 0, scale: 1.6, duration: 0.3 }, 0.5)
      // 只剩一个圆点，缓慢缩小
      .fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: 'power2.out' }, 0.76)
      .to(dot, { scale: 0, opacity: 0, duration: 0.22, ease: 'power2.inOut' }, 0.86)

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  })

  mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
    gsap.set([title, subtitle], { clearProps: 'all', opacity: 1, scale: 1, y: 0 })
    const tween = gsap.from([title, subtitle], {
      opacity: 0,
      y: 40,
      duration: 0.9,
      stagger: 0.12,
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
