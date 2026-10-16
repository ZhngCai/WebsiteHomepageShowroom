<script setup lang="ts">
import { ref } from 'vue'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initCreationAnimation } from '../animations/creation'
import { createEditorialImage } from '../data/creation'
import { creationCopy } from '../data/features'

const root = useScrollAnimation(initCreationAnimation)

// 程序化生成视觉作品（无外部图片素材）
const image = ref(createEditorialImage())
</script>

<template>
  <section id="creation" ref="root" class="afl-section afl-creation">
    <div class="afl-creation__sticky">
      <div class="afl-creation__stage">
        <figure class="afl-creation__frame" data-creation-frame>
          <img class="afl-media" :src="image" :alt="creationCopy.caption" loading="lazy" data-creation-image />
        </figure>

        <div class="afl-creation__copy" data-creation-panel>
          <p class="afl-eyebrow" data-creation-copy>
            <span>04</span>
            <span class="afl-eyebrow__rule" />
            <span>{{ creationCopy.eyebrow }}</span>
          </p>
          <h2 class="afl-display afl-creation__title" data-creation-copy>{{ creationCopy.title }}</h2>
          <p class="afl-text afl-creation__text" data-creation-copy>{{ creationCopy.description }}</p>
          <p class="afl-meta afl-creation__caption" data-creation-caption>{{ creationCopy.caption }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-creation {
  position: relative;
  background: $white;
}

.afl-creation__sticky {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 100vh;
  height: 100svh;
}

.afl-creation__stage {
  position: relative;
  width: 100%;
  display: grid;
  place-items: center;
}

.afl-creation__frame {
  position: relative;
  width: min(94vw, 1360px);
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 40px;
  // 画框不做投影：border-radius 动画期间阴影会随裁剪逐帧重栅格化，代价远大于收益
  box-shadow: 0 1px 0 rgba(17, 17, 17, 0.06) inset;
  transform-origin: center center;
  will-change: transform, border-radius;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform;
  }
}

.afl-creation__copy {
  position: absolute;
  left: 50%;
  bottom: -6vh;
  width: min(88vw, 1040px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 30px 34px;
  border: 1px solid $line;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.78);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  backdrop-filter: blur(12px) saturate(140%);
  box-shadow: $shadow-soft;

  @media (max-width: $bp-mobile) {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    margin-top: 24px;
    width: min(92vw, 100%);
  }
}

.afl-creation__title {
  font-size: clamp(1.8rem, 4.4vw, 3.4rem);
}

.afl-creation__text {
  max-width: 44rem;
}

.afl-creation__caption {
  margin-top: 4px;
}
</style>
