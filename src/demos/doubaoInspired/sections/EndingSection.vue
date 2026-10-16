<script setup lang="ts">
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initEndingAnimation } from '../animations/ending'
import { endingCopy } from '../data/features'

const root = useScrollAnimation(initEndingAnimation)
</script>

<template>
  <section id="ending" ref="root" class="afl-section afl-ending">
    <div class="afl-ending__sticky">
      <span class="afl-ending__glow" data-ending-glow />

      <div class="afl-ending__inner">
        <h2 class="afl-display afl-ending__title" data-ending-title>
          <span>{{ endingCopy.title[0] }}</span>
          <span class="afl-accent-text">{{ endingCopy.title[1] }}</span>
        </h2>
        <p class="afl-ending__subtitle" data-ending-subtitle>{{ endingCopy.subtitle }}</p>
      </div>

      <span class="afl-ending__dot" data-ending-dot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-ending {
  position: relative;
  background: $white;
}

.afl-ending__sticky {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
}

.afl-ending__glow {
  position: absolute;
  width: min(70vw, 760px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(46% 46% at 50% 50%, rgba(91, 124, 250, 0.14) 0%, transparent 70%);
  filter: blur(8px);
}

.afl-ending__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  text-align: center;
}

.afl-ending__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: clamp(2.2rem, 7.2vw, 6.4rem);
  will-change: transform, opacity;
}

.afl-ending__subtitle {
  max-width: 34rem;
  font-size: 14.5px;
  line-height: 1.8;
  color: $muted;
}

.afl-ending__dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $ink;
  will-change: transform, opacity;
}
</style>
