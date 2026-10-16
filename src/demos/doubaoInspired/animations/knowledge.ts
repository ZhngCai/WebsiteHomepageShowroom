import { gsap, ScrollTrigger } from '../composables/useSmoothScroll'

/**
 * Section 06 —— 知识 / AI 搜索（垂直滚动 → 水平体验）
 *
 * 用 GSAP ScrollTrigger pin 固定整节，把垂直滚动映射为轨道 translateX；
 * 每个内容块用 containerAnimation 绑定到「横向容器动画」上，
 * 因此它的 scale / opacity / rotateY 由「进入视口」驱动，而不是由纵向进度驱动。
 * Safari / iOS Safari：pin + scrub 是官方最稳的组合，配合 invalidateOnRefresh
 * 保证 resize / 旋转屏后位置正确。
 */
export function initKnowledgeAnimation(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-knowledge-track]')
  const items = gsap.utils.toArray<HTMLElement>('[data-knowledge-item]', root)
  if (!track) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(1, track.scrollWidth - window.innerWidth + 96)

    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    // 每个内容块：进入时 scale / opacity / rotateY，形成镜头横向扫过的空间感
    const itemTweens = items.map((item) =>
      gsap.fromTo(
        item,
        { scale: 0.86, opacity: 0.15, rotateY: 16, transformPerspective: 1200 },
        {
          scale: 1,
          opacity: 1,
          rotateY: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            containerAnimation: horizontal,
            start: 'left 88%',
            end: 'left 42%',
            scrub: true,
          },
        },
      ),
    )

    return () => {
      horizontal.scrollTrigger?.kill()
      horizontal.kill()
      for (const tween of itemTweens) {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }
  })

  // 移动端 / 减弱动效：降级为原生横向滚动（仍保留内容与基本进入动画）
  mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
    track.style.overflowX = 'auto'
    const tween = gsap.from(items, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: root, start: 'top 70%' },
    })
    return () => {
      track.style.overflowX = ''
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })

  return () => mm.revert()
}
