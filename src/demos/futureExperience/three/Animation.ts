import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/shared/utils/device'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** 全站统一缓动（需求：ease power3.out） */
export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  soft: 'power2.out',
} as const

export function reducedMotion() {
  return prefersReducedMotion()
}

export interface RevealOptions {
  trigger: HTMLElement
  /** 起始位移（px） */
  y?: number
  /** 起始缩放 */
  scale?: number
  /** 起始旋转（deg） */
  rotate?: number
  stagger?: number
  duration?: number
  start?: string
  end?: string
  /** 进入后是否在离开时反向播放 */
  reverse?: boolean
}

/**
 * 统一的章节进出场动画（GSAP + ScrollTrigger）。
 * 系统开启「减弱动效」时自动退化为纯淡入。
 */
export function createReveal(targets: Element[], options: RevealOptions) {
  const { trigger, y = 44, scale = 1, rotate = 0, stagger = 0.08, duration = 1.1, start = 'top 68%', end = 'bottom 32%', reverse = true } = options
  if (!targets.length) return null

  const reduced = reducedMotion()
  const from = reduced ? { opacity: 0 } : { opacity: 0, y, scale, rotate }

  gsap.set(targets, from)

  return gsap.to(targets, {
    opacity: 1,
    ...(reduced ? {} : { y: 0, scale: 1, rotate: 0 }),
    duration: reduced ? 0.6 : duration,
    stagger: reduced ? 0.04 : stagger,
    ease: EASE.out,
    scrollTrigger: {
      trigger,
      start,
      end,
      toggleActions: reverse ? 'play reverse play reverse' : 'play none none none',
    },
  })
}

/** 数字滚动（用于数据类文案） */
export function countTo(target: { value: number }, value: number, options: { duration?: number; trigger?: HTMLElement } = {}) {
  const { duration = 1.4, trigger } = options
  return gsap.to(target, {
    value,
    duration,
    ease: EASE.out,
    ...(trigger ? { scrollTrigger: { trigger, start: 'top 75%', toggleActions: 'play none none none' } } : {}),
  })
}
