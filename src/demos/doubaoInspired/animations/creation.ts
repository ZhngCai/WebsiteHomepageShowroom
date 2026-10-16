import { gsap } from '../composables/useSmoothScroll'

/**
 * Section 04 —— 视觉创作（小图 → 巨大图片）
 *
 * 图片：scale 0.35 → 1、border-radius 40px → 0，随后轻微放大，离开时缩小并上移；
 * 文字：与图片反向视差。全部由 ScrollTrigger scrub 驱动，不使用 pin
 * （用 CSS sticky 承担固定，Safari 上更稳，也不会引入 pin-spacer 布局问题）。
 */
export function initCreationAnimation(root: HTMLElement) {
  const frame = root.querySelector<HTMLElement>('[data-creation-frame]')
  const image = root.querySelector<HTMLElement>('[data-creation-image]')
  const copy = gsap.utils.toArray<HTMLElement>('[data-creation-copy]', root)
  const caption = root.querySelector<HTMLElement>('[data-creation-caption]')
  const panel = root.querySelector<HTMLElement>('[data-creation-panel]')
  if (!frame || !image) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.set(frame, { scale: 0.35, borderRadius: 40 })
    gsap.set(copy, { opacity: 0, y: 30 })
    gsap.set(panel, { opacity: 1 })
    gsap.set(caption, { opacity: 0, y: 24 })

    // 显式绝对位置：总时长严格等于 1，滚动进度与动画进度一一对应
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1 },
    })

    timeline
      // 扩张：小卡片 → 接近全屏
      .to(frame, { scale: 1, borderRadius: 0, duration: 0.4, ease: 'power2.out' }, 0)
      // 继续轻微放大（空间推进）
      .to(frame, { scale: 1.06, duration: 0.14 }, 0.4)
      // 前景文字出现
      .to(copy, { opacity: 1, y: 0, duration: 0.14, stagger: 0.04, ease: 'power2.out' }, 0.5)
      .to(caption, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.58)
      // 文字与图片反向视差
      .to(copy, { y: -46, duration: 0.22, ease: 'power1.in' }, 0.68)
      .to(image, { yPercent: 3.5, duration: 0.22 }, 0.68)
      // 离开：图片缩小上移；文字面板整体退场（不能只淡出内部文字，否则会留下空面板）
      .to(frame, { scale: 0.94, yPercent: -8, duration: 0.14, ease: 'power2.in' }, 0.86)
      .to(panel, { opacity: 0, y: -70, duration: 0.12 }, 0.86)

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  })

  mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
    gsap.set(frame, { clearProps: 'all' })
    gsap.set([copy, caption], { clearProps: 'all', opacity: 1, y: 0 })
    const tween = gsap.fromTo(
      frame,
      { scale: 0.86, borderRadius: 24 },
      {
        scale: 1,
        borderRadius: 0,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'center center', scrub: 1 },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })

  return () => mm.revert()
}
