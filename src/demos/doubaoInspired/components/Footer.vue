<script setup lang="ts">
import { footerLinks } from '../data/features'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="afl-footer">
    <div class="afl-container afl-footer__inner">
      <div class="afl-footer__brand">
        <span class="afl-footer__mark">AI FUTURE LAB</span>
        <p class="afl-text">一个关于「安静的智能」的实验场。所有视觉与文案均为原创。</p>
      </div>

      <nav class="afl-footer__nav" aria-label="页脚导航">
        <a v-for="link in footerLinks" :key="link.label" :href="link.href">{{ link.label }}</a>
      </nav>

      <p class="afl-footer__meta afl-meta">© {{ year }} AFL · Built with Vue 3 · GSAP · Lenis</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-footer {
  position: relative;
  padding: 96px 0 56px;
  background: $paper;
  border-top: 1px solid $line;
}

.afl-footer__inner {
  display: grid;
  gap: 40px;

  @media (min-width: $bp-mobile) {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 1fr);
    align-items: start;
  }
}

.afl-footer__mark {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.16em;
}

.afl-footer__nav {
  display: flex;
  flex-direction: column;
  gap: 12px;

  a {
    font-size: 14px;
    color: $muted;
    transition: color 0.3s $ease-out;

    &:hover {
      color: $ink;
    }
  }
}

.afl-footer__meta {
  @media (min-width: $bp-mobile) {
    text-align: right;
  }
}
</style>
