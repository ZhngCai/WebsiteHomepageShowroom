import { computed, ref } from 'vue'
import { playingCards, type PlayingCardData } from '../data/playingCards'

/**
 * 纸牌模块的交互状态（与动画解耦，便于组件复用与测试）。
 * - spread: 滚动进度是否已进入横向排列（只有排列完成后才允许 hover / 点击）
 * - focused: 当前展开的卡片
 */
export function usePlayingCards() {
  const spread = ref(false)
  const focused = ref<PlayingCardData | null>(null)
  const hovered = ref<number | null>(null)

  const isFocused = computed(() => focused.value !== null)

  function focus(card: PlayingCardData) {
    if (!spread.value) return
    focused.value = card
  }

  function close() {
    focused.value = null
  }

  return { cards: playingCards, spread, focused, hovered, isFocused, focus, close }
}
