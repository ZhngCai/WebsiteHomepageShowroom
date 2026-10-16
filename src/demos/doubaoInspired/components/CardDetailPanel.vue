<script setup lang="ts">
import type { PlayingCardData } from '../data/playingCards'

defineProps<{ card: PlayingCardData | null }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="afl-panel">
    <aside v-if="card" class="afl-panel" role="dialog" aria-modal="false" :aria-label="card.title" data-card-panel>
      <div class="afl-panel__inner">
        <header class="afl-panel__head">
          <span class="afl-meta">{{ card.number }} — {{ card.category }}</span>
          <button class="afl-panel__close" aria-label="关闭" @click="emit('close')">×</button>
        </header>

        <h3 class="afl-panel__title">{{ card.title }}</h3>
        <p class="afl-panel__line">{{ card.line }}</p>

        <dl class="afl-panel__meta">
          <div>
            <dt class="afl-meta">Date</dt>
            <dd>{{ card.date }}</dd>
          </div>
          <div>
            <dt class="afl-meta">Category</dt>
            <dd>{{ card.category }}</dd>
          </div>
        </dl>

        <ul class="afl-panel__tags">
          <li v-for="tag in card.tags" :key="tag">{{ tag }}</li>
        </ul>

        <button class="afl-panel__back" @click="emit('close')">返回牌列</button>
      </div>
    </aside>
  </Transition>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-panel {
  position: fixed;
  z-index: 70;
  right: clamp(20px, 5vw, 72px);
  top: 50%;
  width: min(24rem, calc(100vw - 40px));
  transform: translateY(-50%);
}

.afl-panel__inner {
  padding: 26px 28px 30px;
  border: 1px solid rgba(17, 17, 17, 0.1);
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: blur(26px) saturate(150%);
  backdrop-filter: blur(26px) saturate(150%);
  box-shadow: $shadow-card;
}

.afl-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.afl-panel__close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid $line-strong;
  border-radius: 50%;
  font-size: 15px;
  color: $muted;
  transition:
    color 0.3s $ease-out,
    border-color 0.3s $ease-out;

  &:hover {
    color: $ink;
    border-color: $ink;
  }
}

.afl-panel__title {
  margin-top: 18px;
  font-size: 1.9rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.afl-panel__line {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.75;
  color: $muted;
}

.afl-panel__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid $line;

  dd {
    margin-top: 6px;
    font-size: 14px;
  }
}

.afl-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;

  li {
    padding: 5px 12px;
    border: 1px solid $line-strong;
    border-radius: 999px;
    font-family: $font-mono;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $muted;
  }
}

.afl-panel__back {
  width: 100%;
  margin-top: 24px;
  padding: 13px 0;
  border-radius: 999px;
  background: $ink;
  color: $white;
  font-size: 14px;
  transition: transform 0.4s $ease-out;

  &:hover {
    transform: translateY(-1px);
  }
}

.afl-panel-enter-active,
.afl-panel-leave-active {
  transition:
    opacity 0.45s $ease-out,
    transform 0.55s $ease-out,
    filter 0.45s linear;
}

.afl-panel-enter-from,
.afl-panel-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(18px);
  filter: blur(8px);
}
</style>
