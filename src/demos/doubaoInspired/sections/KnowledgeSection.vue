<script setup lang="ts">
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initKnowledgeAnimation } from '../animations/knowledge'
import { knowledgeTrack } from '../data/features'

const root = useScrollAnimation(initKnowledgeAnimation)
</script>

<template>
  <section id="knowledge" ref="root" class="afl-section afl-knowledge">
    <div class="afl-knowledge__viewport">
      <div class="afl-container afl-knowledge__head">
        <p class="afl-eyebrow">
          <span>06</span>
          <span class="afl-eyebrow__rule" />
          <span>Knowledge</span>
        </p>
        <h2 class="afl-title">从检索到答案</h2>
        <p class="afl-text">垂直滚动被转换为横向移动 —— 镜头沿着知识的链条向前扫过。</p>
      </div>

      <div class="afl-knowledge__rail">
        <div class="afl-knowledge__track" data-knowledge-track>
          <article v-for="item in knowledgeTrack" :key="item.step" class="afl-knowledge__item" data-knowledge-item>
            <span class="afl-knowledge__step">{{ item.step }}</span>
            <h3 class="afl-knowledge__title">{{ item.title }}</h3>
            <p class="afl-knowledge__desc">{{ item.description }}</p>
            <span class="afl-knowledge__line" />
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-knowledge {
  position: relative;
  background: $paper;
  border-block: 1px solid $line;
}

.afl-knowledge__viewport {
  display: flex;
  height: 100vh;
  height: 100svh;
  flex-direction: column;
  justify-content: center;
  gap: 6vh;
  overflow: hidden;
}

.afl-knowledge__head {
  max-width: 42rem;
}

.afl-knowledge__rail {
  position: relative;
  width: 100%;
}

.afl-knowledge__track {
  display: flex;
  gap: 24px;
  padding-inline: 24px;
  will-change: transform;

  @media (min-width: $bp-mobile) {
    padding-inline: 48px;
  }
}

.afl-knowledge__item {
  position: relative;
  flex: 0 0 auto;
  width: min(24rem, 76vw);
  padding: 34px 32px 40px;
  border: 1px solid $line;
  border-radius: $radius-lg;
  background: $white;
  box-shadow: $shadow-soft;
  transform-origin: center center;
  backface-visibility: hidden;
  will-change: transform, opacity;

  @media (max-width: $bp-mobile) {
    width: min(20rem, 78vw);
  }
}

.afl-knowledge__step {
  font-family: $font-mono;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: $accent-blue;
}

.afl-knowledge__title {
  margin-top: 18px;
  font-size: clamp(1.5rem, 2.6vw, 2.1rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.afl-knowledge__desc {
  margin-top: 14px;
  font-size: 14.5px;
  line-height: 1.8;
  color: $muted;
}

.afl-knowledge__line {
  display: block;
  margin-top: 26px;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(91, 124, 250, 0.5), transparent);
}
</style>
