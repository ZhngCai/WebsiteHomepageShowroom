import { gsap } from '../composables/useSmoothScroll'
import { SceneManager } from '../three/SceneManager'
import { createParticleRing } from '../three/ParticleBackground'

/**
 * Section 07 —— 音乐 / 多媒体（圆形视觉系统）
 *
 * 中心圆形核心 + 外围波纹 + 频谱线 + 轻量粒子（Three.js 圆环点云）。
 * 滚动控制旋转与波纹扩散；离开组件时释放 WebGL（dispose + forceContextLoss）。
 */
export function initMusicAnimation(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-music-canvas]')
  const stage = root.querySelector<HTMLElement>('[data-music-stage]')
  const core = root.querySelector<HTMLElement>('[data-music-core]')
  const rings = gsap.utils.toArray<SVGElement>('[data-music-ring]', root)
  const bars = gsap.utils.toArray<SVGElement>('[data-music-bar]', root)
  const text = root.querySelector<HTMLElement>('[data-music-text]')

  let manager: SceneManager | null = null
  let ring: ReturnType<typeof createParticleRing> | null = null
  let progress = 0

  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    manager = new SceneManager({
      canvas,
      onFrame: (time) => ring?.update(time, progress),
    })
    ring = createParticleRing(window.innerWidth < 768 ? 420 : 900)
    manager.scene.add(ring.object)
    manager.start()
  }

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          progress = self.progress
        },
      },
    })

    timeline
      .fromTo(core, { rotate: -18, scale: 0.9 }, { rotate: 42, scale: 1.06, duration: 1 }, 0)
      .fromTo(text, { rotate: -8 }, { rotate: 26, duration: 1 }, 0)
      .fromTo(
        rings,
        { scale: 0.72, opacity: 0.15 },
        { scale: 1.16, opacity: 0.5, duration: 1, stagger: 0.06 },
        0,
      )
      .fromTo(
        bars,
        { scaleY: 0.28, opacity: 0.25 },
        { scaleY: 1, opacity: 0.85, duration: 1, stagger: { each: 0.004, from: 'start' } },
        0,
      )

    // 轻微 3D：滚动时舞台微微前倾
    const tilt = gsap.fromTo(
      stage,
      { rotateX: 6 },
      {
        rotateX: -6,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
      },
    )

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
      tilt.scrollTrigger?.kill()
      tilt.kill()
    }
  })

  return () => {
    mm.revert()
    manager?.dispose()
    manager = null
    ring = null
  }
}
