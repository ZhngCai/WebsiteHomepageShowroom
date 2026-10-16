<script setup lang="ts">
import { computed } from 'vue'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initMusicAnimation } from '../animations/music'
import { musicCopy } from '../data/features'

const root = useScrollAnimation(initMusicAnimation)

/** 频谱线：绕圆均匀分布 */
const bars = computed(() =>
  Array.from({ length: 72 }, (_, index) => {
    const angle = (index / 72) * Math.PI * 2
    return { angle, key: index }
  }),
)

const rings = [58, 74, 92, 112]
</script>

<template>
  <section id="music" ref="root" class="afl-section afl-music">
    <div class="afl-music__sticky">
      <div class="afl-container afl-music__inner">
        <div class="afl-music__copy">
          <p class="afl-eyebrow">
            <span>07</span>
            <span class="afl-eyebrow__rule" />
            <span>Sound &amp; Rhythm</span>
          </p>
          <h2 class="afl-display afl-music__title">{{ musicCopy.title }}</h2>
          <p class="afl-text">{{ musicCopy.description }}</p>
        </div>

        <div class="afl-music__stage" data-music-stage>
          <canvas ref="canvas" class="afl-music__canvas" data-music-canvas aria-hidden="true" />

          <svg class="afl-music__svg" viewBox="0 0 320 320" aria-hidden="true">
            <defs>
              <radialGradient id="afl-core" cx="42%" cy="38%">
                <stop offset="0%" stop-color="#8b7cf6" stop-opacity="0.92" />
                <stop offset="58%" stop-color="#5b7cfa" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#5b7cfa" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="afl-bar" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stop-color="#5b7cfa" stop-opacity="0.15" />
                <stop offset="100%" stop-color="#5b7cfa" stop-opacity="0.9" />
              </linearGradient>
            </defs>

            <!-- 波纹 -->
            <g class="afl-music__rings">
              <circle
                v-for="(r, index) in rings"
                :key="r"
                data-music-ring
                class="afl-music__ring"
                cx="160"
                cy="160"
                :r="r"
                :style="{ transformOrigin: '160px 160px', opacity: 0.4 - index * 0.06 }"
              />
            </g>

            <!-- 频谱线 -->
            <g class="afl-music__bars">
              <rect
                v-for="bar in bars"
                :key="bar.key"
                data-music-bar
                class="afl-music__bar"
                x="159.2"
                y="16"
                width="1.6"
                height="26"
                rx="0.8"
                :transform="`rotate(${(bar.angle * 180) / Math.PI} 160 160)`"
                :style="{ transformOrigin: '160px 160px' }"
              />
            </g>

            <!-- 圆形核心 -->
            <g data-music-core class="afl-music__core" style="transform-origin: 160px 160px">
              <circle cx="160" cy="160" r="46" fill="url(#afl-core)" />
              <circle cx="160" cy="160" r="30" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1" />
              <circle cx="160" cy="160" r="6" fill="#111111" fill-opacity="0.85" />
            </g>

            <!-- 沿圆运动的文字 -->
            <g data-music-text class="afl-music__text" style="transform-origin: 160px 160px">
              <path id="afl-text-path" d="M160,160 m-126,0 a126,126 0 1,1 252,0 a126,126 0 1,1 -252,0" fill="none" />
              <text class="afl-music__text-inner">
                <textPath href="#afl-text-path" startOffset="0%">
                  FOLLOW THE RHYTHM · AFL · FOLLOW THE RHYTHM · AFL ·
                </textPath>
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-music {
  position: relative;
  background: $white;
}

.afl-music__sticky {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 100vh;
  height: 100svh;
}

.afl-music__inner {
  display: grid;
  gap: 40px;
  align-items: center;

  @media (min-width: $bp-tablet) {
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    gap: 64px;
  }
}

.afl-music__copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 30rem;
}

.afl-music__title {
  font-size: clamp(1.9rem, 4.6vw, 3.4rem);
  letter-spacing: -0.02em;
}

.afl-music__stage {
  position: relative;
  width: 100%;
  max-width: 620px;
  margin-inline: auto;
  aspect-ratio: 1;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.afl-music__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.afl-music__svg {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.afl-music__ring {
  fill: none;
  stroke: rgba(91, 124, 250, 0.4);
  stroke-width: 0.8;
  stroke-dasharray: 4 10;
}

.afl-music__bar {
  fill: url(#afl-bar);
}

.afl-music__text-inner {
  font-family: $font-mono;
  font-size: 11px;
  letter-spacing: 0.42em;
  fill: rgba(17, 17, 17, 0.42);
}
</style>
