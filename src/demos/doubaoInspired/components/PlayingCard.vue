<script setup lang="ts">
import type { PlayingCardData } from '../data/playingCards'

defineProps<{
  card: PlayingCardData
  image: string
  focused: boolean
  dimmed: boolean
}>()

const emit = defineEmits<{ select: [card: PlayingCardData] }>()
</script>

<template>
  <article
    class="afl-card"
    :class="[focused ? 'is-focused' : '', dimmed ? 'is-dimmed' : '']"
    :data-card-id="card.id"
    :aria-label="`${card.number} ${card.title}`"
    :role="'button'"
    :tabindex="0"
    @click="emit('select', card)"
    @keydown.enter.prevent="emit('select', card)"
    @keydown.space.prevent="emit('select', card)"
  >
    <div class="afl-card__face">
      <header class="afl-card__head">
        <span class="afl-card__number">{{ card.number }}</span>
        <span class="afl-card__category">{{ card.category }}</span>
      </header>

      <figure class="afl-card__figure">
        <img class="afl-card__image" :src="image" :alt="card.title" loading="lazy" draggable="false" />
      </figure>

      <footer class="afl-card__foot">
        <h3 class="afl-card__title">{{ card.title }}</h3>
        <p class="afl-card__line">{{ card.line }}</p>
        <span class="afl-card__date">{{ card.date }}</span>
      </footer>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 248px;
  height: 360px;
  margin: -180px 0 0 -124px;
  border-radius: 18px;
  background: $white;
  border: 1px solid rgba(17, 17, 17, 0.1);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 22px 40px -28px rgba(17, 17, 17, 0.42);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  cursor: pointer;
  // 只动 transform / opacity：Safari 上最稳，也不会触发布局
  will-change: transform;
  transition: opacity 0.45s $ease-out;

  @media (max-width: $bp-mobile) {
    width: 176px;
    height: 256px;
    margin: -128px 0 0 -88px;
    border-radius: 14px;
  }
}

.afl-card__face {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 14px 16px;
  transform: translateZ(0);
}

.afl-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.afl-card__number {
  font-family: $font-mono;
  font-size: 11px;
  letter-spacing: 0.24em;
  color: $ink;
}

.afl-card__category {
  font-family: $font-mono;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $muted-light;
}

.afl-card__figure {
  position: relative;
  margin: 12px 0 0;
  overflow: hidden;
  border-radius: 12px;
  flex: 1 1 auto;

  @media (max-width: $bp-mobile) {
    margin-top: 8px;
    border-radius: 10px;
  }
}

.afl-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
}

.afl-card__foot {
  padding-top: 12px;
}

.afl-card__title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.afl-card__line {
  margin-top: 4px;
  font-size: 11.5px;
  line-height: 1.5;
  color: $muted;
}

.afl-card__date {
  display: block;
  margin-top: 8px;
  font-family: $font-mono;
  font-size: 9px;
  letter-spacing: 0.22em;
  color: $muted-light;
}

.afl-card.is-dimmed {
  opacity: 0.25;
}

.afl-card.is-focused {
  cursor: default;
  box-shadow: 0 40px 90px -40px rgba(17, 17, 17, 0.55);
}
</style>
