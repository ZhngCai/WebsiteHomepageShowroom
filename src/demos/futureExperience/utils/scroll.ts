import gsap from 'gsap'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { ScrollTrigger }

export interface LenisController {
  lenis: Lenis
  detach: () => void
}

/**
 * Lenis 平滑滚动 —— 与 GSAP ticker / ScrollTrigger 统一到同一条帧管线，
 * 保证滚动、相机、动画三者永不脱帧。
 */
export function createLenis(): LenisController {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.8,
    autoRaf: false,
    anchors: false,
    stopInertiaOnNavigate: true,
    // respectReducedMotion 默认 true：系统开启「减弱动效」时自动退化为原生滚动
  })

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return {
    lenis,
    detach() {
      gsap.ticker.remove(raf)
      lenis.destroy()
    },
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** 元素在文档中的绝对滚动位置（实时读取，pin 造成的布局变化也能正确反映） */
export function documentTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY
}
