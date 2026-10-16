<script setup lang="ts">
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initHeroAnimation } from '../animations/hero'

const root = useScrollAnimation(initHeroAnimation)

const facts = [
  { k: 'Model', v: 'AFL-3' },
  { k: 'Context', v: '1M' },
  { k: 'Modality', v: 'Text · Image · Code' },
]
</script>

<template>
  <section id="hero" ref="root" class="afl-section afl-hero">
    <div class="afl-hero__bg" data-hero-bg>
      <span class="afl-hero__glow" data-hero-glow />
      <span class="afl-hero__grid" />
    </div>

    <div class="afl-container afl-hero__inner">
      <p class="afl-eyebrow" data-hero-meta>
        <span class="afl-eyebrow__rule" />
        <span>AI Future Lab · Since 2026</span>
      </p>

      <h1 class="afl-display afl-hero__title" data-hero-title>
        <span class="afl-hero__line" data-hero-line><span>AI THAT</span></span>
        <span class="afl-hero__line" data-hero-line><span>MOVES</span></span>
        <span class="afl-hero__line" data-hero-line><span class="afl-accent-text">WITH YOU</span></span>
      </h1>

      <p class="afl-hero__subtitle" data-hero-subtitle>
        安静的智能，随你的节奏工作。<br />
        它理解语境、参与创作，也承担那些重复的判断。
      </p>

      <div class="afl-hero__footer" data-hero-footer>
        <dl class="afl-hero__facts">
          <div v-for="fact in facts" :key="fact.k">
            <dt class="afl-meta">{{ fact.k }}</dt>
            <dd>{{ fact.v }}</dd>
          </div>
        </dl>

        <p class="afl-hero__scroll">
          <span class="afl-hero__scroll-line" />
          Scroll
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-hero {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: $white;
}

.afl-hero__bg {
  position: absolute;
  inset: -10% -6%;
  z-index: 0;
  will-change: transform;
}

.afl-hero__glow {
  position: absolute;
  left: 50%;
  top: 42%;
  width: min(78vw, 980px);
  aspect-ratio: 1;
  transform: translate3d(-50%, -50%, 0);
  background:
    radial-gradient(46% 46% at 50% 50%, rgba(91, 124, 250, 0.16) 0%, transparent 68%),
    radial-gradient(34% 34% at 62% 58%, rgba(139, 124, 246, 0.14) 0%, transparent 72%);
  filter: blur(6px);
  opacity: 0.9;
}

.afl-hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(17, 17, 17, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(17, 17, 17, 0.035) 1px, transparent 1px);
  background-size: 96px 96px;
  mask-image: radial-gradient(70% 62% at 50% 46%, #000 0%, transparent 100%);
  -webkit-mask-image: radial-gradient(70% 62% at 50% 46%, #000 0%, transparent 100%);
}

.afl-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-block: 120px 72px;
}

.afl-hero__title {
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
}

// 行遮罩：让标题「从下方漂入」而不是整体淡入
.afl-hero__line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.06em;

  > span {
    display: block;
    will-change: transform;
  }
}

.afl-hero__subtitle {
  max-width: 30rem;
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  line-height: 1.85;
  color: $muted;
}

.afl-hero__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-top: 24px;
  padding-top: 28px;
  border-top: 1px solid $line;
}

.afl-hero__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;

  dd {
    margin-top: 6px;
    font-size: 15px;
    font-weight: 500;
  }
}

.afl-hero__scroll {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: $font-mono;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: $muted-light;
}

.afl-hero__scroll-line {
  display: block;
  width: 64px;
  height: 1px;
  background: linear-gradient(90deg, $accent-blue, transparent);
  transform-origin: left center;
  animation: afl-hero-scroll 2.4s $ease-out infinite;
}

@keyframes afl-hero-scroll {
  0%,
  100% {
    transform: scaleX(0.35);
    opacity: 0.5;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
}
</style>
