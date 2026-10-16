<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PlayingCard from '../components/PlayingCard.vue'
import CardDetailPanel from '../components/CardDetailPanel.vue'
import { initPlayingCardsAnimation, type PlayingCardsController } from '../animations/playingCards'
import { createCardArt, playingCards as playingCardsSource, type PlayingCardData } from '../data/playingCards'
import { useMediaQuery } from '../composables/useMediaQuery'

const isMobile = useMediaQuery('(max-width: 767px)')

/** 桌面 12 张 / 移动端 6 张（需求：移动端不要硬塞 12 张） */
const cards = ref<PlayingCardData[]>([])
const focused = ref<PlayingCardData | null>(null)
const spread = ref(false)
const root = ref<HTMLElement>()
let controller: PlayingCardsController | null = null

// 图像只在卡片集合确定后生成一次（避免重复创建 canvas）
const images = ref<Map<number, string>>(new Map())
const imageFor = (card: PlayingCardData) => images.value.get(card.id) ?? ''

function buildCards() {
  const total = isMobile.value ? 6 : 12
  return playingCardsSource.slice(0, total)
}

onMounted(() => {
  cards.value = buildCards()
  images.value = new Map(cards.value.map((card) => [card.id, createCardArt(card.seed)]))
  if (!root.value) return

  // 等卡片渲染完成后再初始化动画（保证能取到全部 DOM 节点）
  requestAnimationFrame(() => {
    if (!root.value) return
    controller = initPlayingCardsAnimation(root.value, {
      onSpreadChange: (value) => (spread.value = value),
      onSelect: (id) => {
        const card = cards.value.find((item) => item.id === id) ?? null
        focused.value = card
        if (card) controller?.focus(card.id)
      },
    })
  })
})

onBeforeUnmount(() => {
  controller?.destroy()
  controller = null
})

function close() {
  focused.value = null
  controller?.close()
}

</script>

<template>
  <section id="cards" ref="root" class="afl-section afl-cards">
    <div class="afl-cards__stage" data-cards-stage>
      <div class="afl-cards__backdrop" data-cards-backdrop />

      <div class="afl-container afl-cards__head">
        <p class="afl-eyebrow">
          <span>05</span>
          <span class="afl-eyebrow__rule" />
          <span>Card Collection</span>
        </p>
        <h2 class="afl-title">Fold &amp; Spread</h2>
        <p class="afl-text">滚动，就是把一叠纸牌摊开。堆叠 → 扇形 → 横向牌列，全部由滚动进度决定。</p>
      </div>

      <div class="afl-cards__deck afl-stage">
        <PlayingCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :image="imageFor(card) "
          :focused="focused?.id === card.id"
          :dimmed="!!focused && focused.id !== card.id"
        />
      </div>

      <p class="afl-cards__hint afl-meta">
        {{ spread ? '点击任意卡牌查看详情' : '继续滚动以展开牌列' }}
      </p>
    </div>

    <CardDetailPanel :card="focused" @close="close" />
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-cards {
  position: relative;
  background: $paper-deep;
}

.afl-cards__stage {
  position: relative;
  display: flex;
  height: 100vh;
  height: 100svh;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.afl-cards__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(17, 17, 17, 0.28);
  opacity: 0;
  pointer-events: none;
}

.afl-cards__head {
  position: absolute;
  left: 50%;
  top: clamp(80px, 11vh, 140px);
  transform: translateX(-50%);
  max-width: 40rem;
  text-align: center;
  pointer-events: none;

  @media (min-width: $bp-mobile) {
    left: 48px;
    transform: none;
    text-align: left;
  }
}

.afl-cards__deck {
  position: relative;
  height: 420px;
  margin-top: 4vh;

  @media (max-width: $bp-mobile) {
    height: 300px;
  }
}

.afl-cards__hint {
  position: absolute;
  left: 50%;
  bottom: 8vh;
  transform: translateX(-50%);
  transition: opacity 0.5s $ease-out;
}
</style>
