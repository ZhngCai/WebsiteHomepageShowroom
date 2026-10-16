import { gsap, ScrollTrigger } from '../composables/useSmoothScroll'

/** 三阶段几何参数（STACK → FAN → HORIZONTAL SPREAD） */
const STACK_GAP_Z = 11
const FAN_STEP_DEG = 4.6
const FAN_RADIUS = 340
const SPREAD_GAP = 124
const SPREAD_SCALE = 0.62

export interface PlayingCardsController {
  focus(id: number): void
  close(): void
  destroy(): void
}

export interface PlayingCardsOptions {
  onSpreadChange?: (spread: boolean) => void
  onSelect?: (id: number) => void
}

/**
 * Section 05 —— 3D Playing Cards：STACK → FAN → HORIZONTAL SPREAD
 *
 * 三个阶段由同一条 scrubbed timeline 连续衔接（禁止跳变），
 * 逐张展开用 GSAP stagger 制造 80~150ms 的视觉错位（不使用 setTimeout）。
 * 排列完成后开启 hover / 3D tilt / 点击展开；点击时暂停 ScrollTrigger，
 * 避免滚动与聚焦动画互相抢占同一批 transform。
 */
export function initPlayingCardsAnimation(root: HTMLElement, options: PlayingCardsOptions = {}): PlayingCardsController {
  const stage = root.querySelector<HTMLElement>('[data-cards-stage]')
  const backdrop = root.querySelector<HTMLElement>('[data-cards-backdrop]')
  const cards = gsap.utils.toArray<HTMLElement>('[data-card-id]', root)
  const count = cards.length
  const mid = (count - 1) / 2

  let focusedId: number | null = null
  let spread = false
  const cleanups: (() => void)[] = []

  // ---------- Stage 1：真实纸牌叠 ----------
  gsap.set(cards, {
    // 真实纸牌叠：每张都有可见的错位、微旋转与层高差
    x: (i: number) => (i - mid) * 1.7,
    y: (i: number) => (i - mid) * 0.9,
    z: (i: number) => i * STACK_GAP_Z,
    rotationZ: (i: number) => (i - mid) * 0.55,
    rotationX: 0,
    rotationY: 0,
    scale: 1,
    opacity: 1,
    transformPerspective: 1100,
    transformOrigin: 'center center',
  })

  const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  const scrollTrigger = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: '+=180%',
    pin: stage,
    pinSpacing: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: timeline,
    onUpdate: (self) => {
      const next = self.progress > 0.9
      if (next !== spread) {
        spread = next
        options.onSpreadChange?.(next)
      }
    },
  })

  // ---------- Stage 2：扇形展开 ----------
  timeline.to(
    cards,
    {
      x: (i: number) => {
        const angle = ((i - mid) * FAN_STEP_DEG * Math.PI) / 180
        return Math.sin(angle) * FAN_RADIUS
      },
      y: (i: number) => {
        const angle = ((i - mid) * FAN_STEP_DEG * Math.PI) / 180
        return (1 - Math.cos(angle)) * FAN_RADIUS
      },
      z: (i: number) => i * 2,
      rotationZ: (i: number) => (i - mid) * FAN_STEP_DEG,
      duration: 0.45,
      stagger: 0.028,
    },
    0,
  )

  // ---------- Stage 3：横向排列 ----------
  timeline.to(
    cards,
    {
      x: (i: number) => (i - mid) * SPREAD_GAP,
      y: 0,
      z: 0,
      rotationZ: 0,
      rotationX: 0,
      rotationY: 0,
      scale: SPREAD_SCALE,
      duration: 0.45,
      stagger: 0.028,
    },
    0.5,
  )

  // ---------- 排列完成后的交互 ----------
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches

  const onPointerEnter = (event: Event) => {
    if (!spread || focusedId !== null || isMobile()) return
    const card = event.currentTarget as HTMLElement
    gsap.to(card, { y: -20, scale: SPREAD_SCALE * 1.04, duration: 0.42, ease: 'power3.out', overwrite: 'auto' })
  }

  const onPointerLeave = (event: Event) => {
    if (!spread || focusedId !== null) return
    const card = event.currentTarget as HTMLElement
    gsap.to(card, { y: 0, scale: SPREAD_SCALE, rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
  }

  // 极轻的 3D tilt：随指针在卡片内的位置偏转，幅度很小
  const onPointerMove = (event: PointerEvent) => {
    if (!spread || focusedId !== null || isMobile()) return
    const card = event.currentTarget as HTMLElement
    const rect = card.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    gsap.to(card, {
      rotationY: px * 7,
      rotationX: -py * 6,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const onCardClick = (event: Event) => {
    const card = event.currentTarget as HTMLElement
    const id = Number(card.dataset.cardId)
    if (!spread || focusedId !== null) return
    options.onSelect?.(id)
  }

  for (const card of cards) {
    card.addEventListener('pointerenter', onPointerEnter)
    card.addEventListener('pointerleave', onPointerLeave)
    card.addEventListener('pointermove', onPointerMove)
    card.addEventListener('click', onCardClick)
  }

  cleanups.push(() => {
    for (const card of cards) {
      card.removeEventListener('pointerenter', onPointerEnter)
      card.removeEventListener('pointerleave', onPointerLeave)
      card.removeEventListener('pointermove', onPointerMove)
      card.removeEventListener('click', onCardClick)
    }
  })

  return {
    /** 点击卡片：卡片向前移动到屏幕中央，其余卡片淡出、背景变暗 */
    focus(id: number) {
      const card = cards.find((item) => Number(item.dataset.cardId) === id)
      if (!card) return
      focusedId = id
      // 暂停滚动驱动，避免滚动与聚焦动画抢占同一批 transform
      scrollTrigger.disable(false)

      gsap.to(card, {
        x: 0,
        y: 0,
        z: 260,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 1.15,
        duration: 0.9,
        ease: 'power3.inOut',
        overwrite: 'auto',
      })
      gsap.to(
        cards.filter((item) => item !== card),
        { opacity: 0.25, duration: 0.7, ease: 'power2.out', overwrite: 'auto' },
      )
      gsap.to(backdrop, { opacity: 1, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
    },

    /** 关闭：恢复横向排列状态 */
    close() {
      if (focusedId === null) return
      const card = cards.find((item) => Number(item.dataset.cardId) === focusedId)
      focusedId = null
      scrollTrigger.enable()
      ScrollTrigger.update()

      if (card) {
        const index = cards.indexOf(card)
        gsap.to(card, {
          x: (index - mid) * SPREAD_GAP,
          y: 0,
          z: 0,
          scale: SPREAD_SCALE,
          duration: 0.8,
          ease: 'power3.inOut',
          overwrite: 'auto',
        })
      }
      gsap.to(cards, { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(backdrop, { opacity: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
    },

    destroy() {
      for (const cleanup of cleanups) cleanup()
      scrollTrigger.kill()
      timeline.kill()
      gsap.killTweensOf(cards)
      gsap.killTweensOf(backdrop)
    },
  }
}
