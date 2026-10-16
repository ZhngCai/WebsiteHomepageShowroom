<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap, ScrollTrigger } from '../composables/useSmoothScroll'
import { footerLinks } from '../data/features'

const scrolled = ref(false)
let trigger: ScrollTrigger | null = null

onMounted(() => {
  // 只在状态切换时改一次 class，不做逐帧 DOM 写入
  trigger = ScrollTrigger.create({
    start: 'top -40',
    end: 'max',
    onToggle: (self) => (scrolled.value = self.isActive),
  })
})

onBeforeUnmount(() => {
  trigger?.kill()
  trigger = null
  gsap.killTweensOf('.afl-header')
})

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <header class="afl-header" :class="scrolled ? 'is-scrolled' : ''">
    <div class="afl-header__inner">
      <button class="afl-logo" aria-label="AI Future Lab" @click="toTop">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
          <rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="currentColor" stroke-width="1.4" />
          <circle cx="16" cy="16" r="6.4" fill="none" stroke="currentColor" stroke-width="1.4" />
          <circle cx="16" cy="16" r="2.1" fill="currentColor" />
        </svg>
        <span class="afl-logo__text">
          AI Future Lab
          <em>未来实验室</em>
        </span>
      </button>

      <nav class="afl-header__nav" aria-label="主导航">
        <a v-for="link in footerLinks.slice(0, 3)" :key="link.label" class="afl-header__link" :href="link.href">
          {{ link.label }}
        </a>
      </nav>

      <div class="afl-header__actions">
        <a class="afl-header__link is-strong" href="#hero">Explore</a>
        <button class="afl-header__menu" aria-label="菜单">
          <span />
          <span />
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.5s $ease-out,
    border-color 0.5s $ease-out,
    backdrop-filter 0.5s $ease-out;

  &.is-scrolled {
    background: rgba(255, 255, 255, 0.72);
    border-bottom-color: $line;
    // Safari 需要 -webkit- 前缀
    -webkit-backdrop-filter: saturate(160%) blur(14px);
    backdrop-filter: saturate(160%) blur(14px);
  }
}

.afl-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 68px;
  padding-inline: 24px;

  @media (min-width: $bp-mobile) {
    padding-inline: 48px;
  }
}

.afl-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: $ink;
}

.afl-logo__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;

  em {
    font-family: $font-mono;
    font-size: 9px;
    font-style: normal;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: $muted-light;
  }
}

.afl-header__nav {
  display: none;
  gap: 28px;

  @media (min-width: $bp-tablet) {
    display: flex;
  }
}

.afl-header__link {
  position: relative;
  font-size: 13px;
  color: $muted;
  transition: color 0.3s $ease-out;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.4s $ease-out;
  }

  &:hover {
    color: $ink;

    &::after {
      transform: scaleX(1);
    }
  }

  &.is-strong {
    color: $ink;
    font-weight: 500;
  }
}

.afl-header__actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.afl-header__menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 26px;
  height: 26px;

  span {
    display: block;
    width: 100%;
    height: 1px;
    background: $ink;
    transition: transform 0.3s $ease-out;
  }

  &:hover span:first-child {
    transform: translateX(-3px);
  }

  &:hover span:last-child {
    transform: translateX(3px);
  }
}
</style>
