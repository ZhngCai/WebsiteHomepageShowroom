<script setup lang="ts">
import { createArtSet } from '@/shared/utils/art'
import { useSectionEffect } from '../utils/sectionEffect'
import { EASE, gsap, ScrollTrigger } from '../three/Animation'
import { clamp } from '../utils/scroll'

defineProps<{ index: number }>()

/** 四列瀑布流：每列数量与画幅节奏不同，形成错落 */
const COLUMNS = [
  { count: 5, ratios: ['aspect-[3/4]', 'aspect-[1/1]', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[1/1]'] },
  { count: 4, ratios: ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-[1/1]', 'aspect-[4/5]'] },
  { count: 5, ratios: ['aspect-[1/1]', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[1/1]', 'aspect-[4/5]'] },
  { count: 4, ratios: ['aspect-[3/4]', 'aspect-[1/1]', 'aspect-[4/5]', 'aspect-[3/4]'] },
]

// 同步生成（首帧即渲染出图块，Section 效果才能正确获取目标元素）
const images = COLUMNS.map((column, columnIndex) => createArtSet(column.count, 720, 3301 + columnIndex * 977))

const root = useSectionEffect((section) => {
  const columns = [...section.querySelectorAll<HTMLElement>('[data-gallery-column]')]
  const tiles = [...section.querySelectorAll<HTMLElement>('[data-gallery-tile]')]
  const tweens: ReturnType<typeof gsap.fromTo>[] = []
  const triggers: ScrollTrigger[] = []

  // 每列不同速度的视差：形成纵深
  columns.forEach((column, index) => {
    const drift = [-70, 46, -34][index % 3]
    tweens.push(
      gsap.fromTo(
        column,
        { y: -drift },
        {
          y: drift,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      ),
    )
  })

  // 滚轮速度 → 3D 倾斜（速度越快，画面越倾斜）
  // 用 ticker + 插值驱动，避免每帧新建补间，也避免 quickTo 多目标的告警
  const tilt = { x: 0, y: 0, scale: 1 }
  const target = { x: 0, y: 0, scale: 1 }
  const tick = () => {
    tilt.x += (target.x - tilt.x) * 0.12
    tilt.y += (target.y - tilt.y) * 0.12
    tilt.scale += (target.scale - tilt.scale) * 0.12
    gsap.set(tiles, { rotateX: tilt.x, rotateY: tilt.y, scale: tilt.scale })
  }
  gsap.ticker.add(tick)

  triggers.push(
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocity = clamp(self.getVelocity() / 2600, -1, 1)
        target.x = -velocity * 15
        target.y = velocity * 9
        target.scale = 1 + Math.abs(velocity) * 0.05
      },
    }),
  )

  // 图块逐格浮现
  tweens.push(
    gsap.fromTo(
      tiles,
      { opacity: 0, y: 40, filter: 'blur(14px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: { each: 0.06, from: 'start' },
        ease: EASE.out,
        scrollTrigger: { trigger: section, start: 'top 72%', toggleActions: 'play reverse play reverse' },
      },
    ),
  )

  return () => {
    gsap.ticker.remove(tick)
    for (const trigger of triggers) trigger.kill()
    for (const tween of tweens) {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }
})
</script>

<template>
  <div ref="root" class="fe-gallery">
    <header class="fe-gallery__head">
      <p class="fe-gallery__eyebrow" data-reveal>
        <span>04</span>
        <span class="fe-gallery__rule" />
        <span>Infinite Product Gallery</span>
      </p>
      <h2 class="fe-gallery__title" data-reveal>产品瀑布</h2>
      <p class="fe-gallery__text" data-reveal>滚动越快，画面越倾斜 —— 速度直接驱动 3D 透视。</p>
    </header>

    <div class="fe-gallery__grid">
      <div
        v-for="(column, columnIndex) in COLUMNS"
        :key="columnIndex"
        class="fe-gallery__column"
        data-gallery-column
      >
        <figure
          v-for="(image, imageIndex) in images[columnIndex]"
          :key="imageIndex"
          class="fe-gallery__tile"
          :class="column.ratios[imageIndex % column.ratios.length]"
          data-gallery-tile
        >
          <img :src="image" :alt="`AETHER 作品 ${columnIndex + 1}-${imageIndex + 1}`" loading="lazy" />
          <figcaption>
            <span class="fe-gallery__no">No.{{ String(columnIndex * 5 + imageIndex + 1).padStart(2, '0') }}</span>
            <span class="fe-gallery__meta">AETHER Series</span>
          </figcaption>
        </figure>
      </div>
    </div>

    <span class="sr-only">Section {{ index + 1 }}: Infinite Product Gallery</span>
  </div>
</template>

<style scoped>
.fe-gallery {
  position: relative;
  padding: 16vh 1.5rem;
  perspective: 1400px;
}

@media (min-width: 768px) {
  .fe-gallery {
    padding-inline: 4rem;
  }
}

.fe-gallery__head {
  max-width: 34rem;
  margin-bottom: 8vh;
}

.fe-gallery__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-gallery__rule {
  height: 1px;
  width: 2rem;
  background: linear-gradient(90deg, #d8b26a, transparent);
}

.fe-gallery__title {
  margin-top: 1.25rem;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.fe-gallery__text {
  margin-top: 1rem;
  font-size: 14px;
  line-height: 1.75;
  color: var(--color-ink-dim);
}

.fe-gallery__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .fe-gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
}

@media (min-width: 1100px) {
  .fe-gallery__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.fe-gallery__column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  will-change: transform;
}

.fe-gallery__tile {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgb(255 255 255 / 10%);
  transform-style: preserve-3d;
  will-change: transform;
}

.fe-gallery__tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fe-gallery__tile figcaption {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  background: linear-gradient(180deg, transparent, rgb(5 6 12 / 82%));
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-ink) 82%, transparent);
}

.fe-gallery__meta {
  color: color-mix(in oklab, var(--color-ink-dim) 80%, transparent);
}
</style>
