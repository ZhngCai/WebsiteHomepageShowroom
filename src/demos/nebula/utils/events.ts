/**
 * 卡片星球的事件契约 —— three 世界与 DOM 面板之间的唯一耦合点，
 * 双方各自独立实现，不互相 import。
 */

export interface CardFocusDetail {
  id: number
  tile: number
  title: string
  year: string
  palette: string
  tag: string
  rect: { x: number; y: number; width: number; height: number }
}

export const CARD_FOCUS_EVENT = 'nebula:card-focus'
export const CARD_CLOSE_EVENT = 'nebula:card-close'
export const SINGULARITY_BURST_EVENT = 'nebula:singularity-burst'

export function emitCardFocus(detail: CardFocusDetail) {
  window.dispatchEvent(new CustomEvent<CardFocusDetail>(CARD_FOCUS_EVENT, { detail }))
}

export function emitCardClose() {
  window.dispatchEvent(new CustomEvent(CARD_CLOSE_EVENT))
}

export function emitSingularityBurst() {
  window.dispatchEvent(new CustomEvent(SINGULARITY_BURST_EVENT))
}
