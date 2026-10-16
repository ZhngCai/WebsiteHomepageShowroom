<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sections: { id: string; label: string }[]
  /** 全局滚动进度 0~1（由 App 的单一全局 ScrollTrigger 提供） */
  progress: number
}>()

const active = computed(() => Math.min(props.sections.length - 1, Math.round(props.progress * (props.sections.length - 1))))
</script>

<template>
  <aside class="afl-progress" aria-hidden="true">
    <div class="afl-progress__track">
      <span class="afl-progress__fill" :style="{ '--progress': progress.toFixed(4) }" />
    </div>
    <ul class="afl-progress__dots">
      <li
        v-for="(section, index) in sections"
        :key="section.id"
        class="afl-progress__dot"
        :class="index === active ? 'is-active' : ''"
      >
        <span />
        <em>{{ section.label }}</em>
      </li>
    </ul>
  </aside>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-progress {
  position: fixed;
  right: 22px;
  top: 50%;
  z-index: 55;
  display: none;
  transform: translateY(-50%);
  align-items: center;
  gap: 14px;

  @media (min-width: $bp-tablet) {
    display: flex;
  }
}

.afl-progress__track {
  position: relative;
  width: 1px;
  height: 160px;
  background: $line-strong;
}

.afl-progress__fill {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: calc(var(--progress, 0) * 100%);
  background: linear-gradient(180deg, $accent-blue, $accent-violet);
}

.afl-progress__dots {
  display: flex;
  flex-direction: column;
  gap: 14px;

  em {
    position: absolute;
    right: 20px;
    font-family: $font-mono;
    font-size: 9px;
    font-style: normal;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: $muted-light;
    opacity: 0;
    transition: opacity 0.4s $ease-out;
    white-space: nowrap;
  }
}

.afl-progress__dot {
  position: relative;
  display: flex;
  align-items: center;

  span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: $line-strong;
    transition:
      background-color 0.4s $ease-out,
      transform 0.4s $ease-out;
  }

  &.is-active span {
    background: $accent-blue;
    transform: scale(1.5);
  }

  &.is-active em,
  &:hover em {
    opacity: 1;
  }
}
</style>
