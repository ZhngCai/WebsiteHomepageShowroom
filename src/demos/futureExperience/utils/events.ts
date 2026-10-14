import type { CardRect } from '@/shared/three/CardSphere'

export interface CardContent {
  title: string
  titleZh: string
  quote: string
  quoteZh: string
  date: string
  location: string
  locationZh: string
  tags: string[]
}

export interface CardFocusDetail extends CardContent {
  index: number
  tile: number
  rect: CardRect
}

export const CARD_FOCUS_EVENT = 'future:card-focus'
export const CARD_CLOSE_EVENT = 'future:card-close'
export const ENDING_BURST_EVENT = 'future:ending-burst'

export function emitCardFocus(detail: CardFocusDetail) {
  window.dispatchEvent(new CustomEvent<CardFocusDetail>(CARD_FOCUS_EVENT, { detail }))
}

export function emitCardClose() {
  window.dispatchEvent(new CustomEvent(CARD_CLOSE_EVENT))
}

export function emitEndingBurst() {
  window.dispatchEvent(new CustomEvent(ENDING_BURST_EVENT))
}
