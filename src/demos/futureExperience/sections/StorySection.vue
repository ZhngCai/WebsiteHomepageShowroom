<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createArtDataUrl } from '@/shared/utils/art'
import { useSectionEffect } from '../utils/sectionEffect'
import { gsap, ScrollTrigger } from '../three/Animation'

defineProps<{ index: number }>()

const mainImage = ref('')
const insetImage = ref('')

onMounted(() => {
  // 程序化生成品牌视觉素材（无外部图片依赖）
  mainImage.value = createArtDataUrl(1080, 4211)
  insetImage.value = createArtDataUrl(640, 9137)
})

const details = [
  { k: 'Material', v: '光学级玻璃 / 再生钛' },
  { k: 'Craft', v: '手工抛光 32 道工序' },
  { k: 'Origin', v: '瑞士 · 汝拉山谷' },
]

const root = useSectionEffect((section) => {
  const text = section.querySelector<HTMLElement>('[data-story-text]')
  const media = section.querySelector<HTMLElement>('[data-story-media]')
  const inset = section.querySelector<HTMLElement>('[data-story-inset]')
  const line = section.querySelector<HTMLElement>('[data-story-line]')
  const rows = [...section.querySelectorAll<HTMLElement>('[data-story-row]')]

  const triggers: ScrollTrigger[] = []
  const tweens: ReturnType<typeof gsap.fromTo>[] = []

  // 文字固定：GSAP pin（不占额外空间，章节滚完自动解除）
  if (text) {
    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: 'top 18%',
        end: 'bottom 62%',
        pin: text,
        pinSpacing: false,
      }),
    )
  }

  // 主图：视差 + 缓慢放大（scrub 跟随滚动）
  if (media) {
    tweens.push(
      gsap.fromTo(
        media,
        { yPercent: -7, scale: 0.9 },
        {
          yPercent: 7,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      ),
    )
  }

  // 小图反向视差，形成层次
  if (inset) {
    tweens.push(
      gsap.fromTo(
        inset,
        { yPercent: 16, scale: 1.04 },
        {
          yPercent: -14,
          scale: 0.96,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      ),
    )
  }

  if (line) {
    tweens.push(
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 72%', toggleActions: 'play none none reverse' },
        },
      ),
    )
  }

  // 工艺细节逐行浮现
  if (rows.length) {
    tweens.push(
      gsap.fromTo(
        rows,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 58%', toggleActions: 'play reverse play reverse' },
        },
      ),
    )
  }

  return () => {
    for (const trigger of triggers) trigger.kill()
    for (const tween of tweens) {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }
})
</script>

<template>
  <div ref="root" class="fe-story">
    <div class="fe-story__grid">
      <div class="fe-story__text" data-story-text>
        <p class="fe-story__eyebrow">
          <span>02</span>
          <span class="fe-story__rule" />
          <span>Luxury Brand Story</span>
        </p>

        <h2 class="fe-story__title">
          时间的
          <span class="fe-story__title-accent">质感</span>
        </h2>

        <p class="fe-story__lead">
          AETHER 相信，真正的高级感来自时间：材料的呼吸、结构的秩序、以及每一次触碰留下的温度。
        </p>

        <div class="fe-story__line" data-story-line />

        <dl class="fe-story__details">
          <div v-for="detail in details" :key="detail.k" data-story-row>
            <dt>{{ detail.k }}</dt>
            <dd>{{ detail.v }}</dd>
          </div>
        </dl>
      </div>

      <div class="fe-story__media" data-story-media>
        <img :src="mainImage" alt="AETHER 品牌视觉" loading="lazy" />
        <span class="fe-story__media-glow" />
      </div>

      <div class="fe-story__inset" data-story-inset>
        <img :src="insetImage" alt="AETHER 工艺细节" loading="lazy" />
      </div>
    </div>

    <span class="sr-only">Section {{ index + 1 }}: Luxury Brand Story</span>
  </div>
</template>

<style scoped>
.fe-story {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 120vh;
  padding: 14vh 1.5rem;
}

.fe-story__grid {
  display: grid;
  width: 100%;
  max-width: 84rem;
  margin-inline: auto;
  gap: 3rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .fe-story__grid {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: 4.5rem;
  }
}

.fe-story__text {
  align-self: center;
}

.fe-story__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-story__rule {
  height: 1px;
  width: 2rem;
  background: linear-gradient(90deg, #d8b26a, transparent);
}

.fe-story__title {
  margin-top: 1.5rem;
  font-size: clamp(2.4rem, 5.6vw, 4.4rem);
  line-height: 1.02;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.fe-story__title-accent {
  background: linear-gradient(100deg, #f6f2e8 0%, #d8b26a 60%, #9fd8ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.fe-story__lead {
  margin-top: 1.75rem;
  max-width: 30rem;
  font-size: 15px;
  line-height: 1.85;
  color: var(--color-ink-dim);
}

.fe-story__line {
  margin-top: 2.5rem;
  height: 1px;
  transform-origin: left center;
  background: linear-gradient(90deg, rgb(216 178 106 / 70%), transparent);
}

.fe-story__details {
  margin-top: 2rem;
  display: grid;
  gap: 1rem;
}

.fe-story__details dt {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-ink-dim) 72%, transparent);
}

.fe-story__details dd {
  margin-top: 0.25rem;
  font-size: 14px;
  color: color-mix(in oklab, var(--color-ink) 90%, transparent);
}

.fe-story__media {
  position: relative;
  overflow: hidden;
  border-radius: 1.75rem;
  aspect-ratio: 4 / 5;
  will-change: transform;
}

.fe-story__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fe-story__media-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgb(5 6 12 / 78%) 100%);
  pointer-events: none;
}

.fe-story__inset {
  position: absolute;
  right: 1.5rem;
  bottom: 8vh;
  width: min(13rem, 32vw);
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgb(255 255 255 / 14%);
  box-shadow: 0 30px 60px -30px rgb(0 0 0 / 80%);
  will-change: transform;
}

.fe-story__inset img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

@media (min-width: 1024px) {
  .fe-story__inset {
    right: 4rem;
  }
}
</style>
