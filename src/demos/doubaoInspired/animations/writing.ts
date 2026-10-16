import { gsap } from '../composables/useSmoothScroll'

/**
 * Section 03 —— 写作能力（电影级 Typography Animation）
 *
 * 每个单词独立动画：blur → clear、opacity、translateY，逐词进入；
 * 随后整段文字横向移动，形成「句子被写出来」的节奏。
 * 不使用整体 fade，也避免同时对大量 DOM 做 filter + transform：
 * blur 只在词数较少的行上使用，并在动画结束后清除。
 */
export function initWritingAnimation(root: HTMLElement) {
  const words = gsap.utils.toArray<HTMLElement>('[data-writing-word]', root)
  const lines = gsap.utils.toArray<HTMLElement>('[data-writing-line]', root)
  const aside = root.querySelector<HTMLElement>('[data-writing-aside]')
  if (!words.length) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    // 初始态由 JS 设置（JS 未执行时内容始终可见）
    gsap.set(words, { opacity: 0, y: 34, filter: 'blur(14px)' })
    gsap.set(aside, { opacity: 0, y: 30 })

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: root, start: 'top 62%', end: 'center 40%', scrub: 0.8 },
    })

    timeline
      .to(aside, { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(
        words,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.08,
        },
        0.15,
      )

    // 逐词进入之后，整段文字横向移动（镜头扫过排版）
    const drift = gsap.fromTo(
      lines,
      { x: 0 },
      {
        x: (index: number) => (index % 2 === 0 ? -46 : 34),
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'center 70%', end: 'bottom 20%', scrub: 1 },
      },
    )

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
      drift.scrollTrigger?.kill()
      drift.kill()
      gsap.set(words, { clearProps: 'filter' })
    }
  })

  mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
    gsap.set([words, aside], { clearProps: 'all', opacity: 1, y: 0 })
    const tween = gsap.from(words, {
      opacity: 0,
      y: 26,
      duration: 0.7,
      stagger: 0.05,
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
