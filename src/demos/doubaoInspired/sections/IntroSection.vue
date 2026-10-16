<script setup lang="ts">
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initIntroAnimation } from '../animations/intro'
import { capabilities } from '../data/features'

const root = useScrollAnimation(initIntroAnimation)
</script>

<template>
  <section id="intro" ref="root" class="afl-section afl-intro">
    <div class="afl-intro__sticky">
      <div class="afl-container afl-intro__grid">
        <!-- 左侧：固定标题 -->
        <div class="afl-intro__aside">
          <div data-intro-title>
            <p class="afl-eyebrow">
              <span>02</span>
              <span class="afl-eyebrow__rule" />
              <span>Capabilities</span>
            </p>
            <h2 class="afl-title afl-intro__heading">
              一种能力<br />
              四层递进
            </h2>
            <p class="afl-text afl-intro__lead">
              从读懂一句话，到完成一件事。AFL-3 把理解、创造、推理与执行串成同一条链路。
            </p>
          </div>
        </div>

        <!-- 右侧：逐个切换的内容状态 -->
        <div class="afl-intro__stage">
          <article
            v-for="item in capabilities"
            :key="item.id"
            class="afl-intro__item"
            data-intro-item
          >
            <span class="afl-intro__index">{{ item.index }}</span>
            <h3 class="afl-intro__title">{{ item.title }}</h3>
            <p class="afl-intro__desc">{{ item.description }}</p>
            <span class="afl-meta afl-intro__meta">{{ item.meta }}</span>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-intro {
  position: relative;
  background: $white;
  transition: background-color 0.4s linear;
}

// Sticky 容器：Safari 下同样可靠（不依赖 overflow 祖先）
.afl-intro__sticky {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 100vh;
  height: 100svh;
}

.afl-intro__grid {
  display: grid;
  gap: 48px;
  align-items: center;

  @media (min-width: $bp-tablet) {
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    gap: 72px;
  }
}

.afl-intro__heading {
  margin-top: 18px;
}

.afl-intro__lead {
  margin-top: 20px;
}

.afl-intro__stage {
  position: relative;
  min-height: 340px;
}

.afl-intro__item {
  position: absolute;
  inset-inline: 0;
  top: 0;
  padding: 34px 36px 38px;
  border: 1px solid $line;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  box-shadow: $shadow-soft;
  transform-origin: center top;
  will-change: transform, opacity;

  @media (max-width: $bp-mobile) {
    position: relative;
    padding: 26px 24px 30px;

    & + & {
      margin-top: 18px;
    }
  }
}

.afl-intro__index {
  font-family: $font-mono;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: $accent-blue;
}

.afl-intro__title {
  margin-top: 16px;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.afl-intro__desc {
  margin-top: 14px;
  max-width: 30rem;
  font-size: 14.5px;
  line-height: 1.85;
  color: $muted;
}

.afl-intro__meta {
  display: block;
  margin-top: 22px;
}
</style>
