<script setup lang="ts">
import { createArtSet } from '@/shared/utils/art'
import { useSectionEffect } from '../utils/sectionEffect'
import { EASE, gsap, ScrollTrigger } from '../three/Animation'

defineProps<{ index: number }>()

const milestones = [
  { year: '2019', title: 'AETHER 诞生', text: '第一代材料实验室在苏黎世成立，专注光学玻璃与再生钛。' },
  { year: '2020', title: '光的研究', text: '完成 1200 组折射实验，确立品牌的光学语言。' },
  { year: '2021', title: '工艺体系', text: '建立可追溯的材质档案，每件作品拥有独立编号。' },
  { year: '2022', title: '首个系列', text: 'Aurora 系列发布，48 小时内售罄。' },
  { year: '2023', title: '数字孪生', text: '每件作品拥有数字身份，可在空间中重新观看。' },
  { year: '2025', title: '未来系列', text: '与 AI 共同完成的限量系列，进入永久收藏。' },
]

const images = createArtSet(milestones.length, 640, 6101)

const root = useSectionEffect((section) => {
  section.dataset.revealSkip = ''
  const track = section.querySelector<HTMLElement>('[data-timeline-track]')
  const cards = [...section.querySelectorAll<HTMLElement>('[data-timeline-card]')]
  const head = section.querySelector<HTMLElement>('[data-timeline-head]')
  if (!track) return

  const tweens: ReturnType<typeof gsap.fromTo>[] = []

  // 垂直滚动 → 水平展开：pin 住整节，横向平移轨道
  const distance = () => Math.max(1, track.scrollWidth - window.innerWidth + 64)

  tweens.push(
    gsap.fromTo(
      track,
      { x: 0 },
      {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: true,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      },
    ),
  )

  if (head) {
    tweens.push(
      gsap.fromTo(
        head,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: EASE.out,
          scrollTrigger: { trigger: section, start: 'top 62%', toggleActions: 'play reverse play reverse' },
        },
      ),
    )
  }

  if (cards.length) {
    tweens.push(
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, rotateY: -8 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 1,
          stagger: 0.1,
          ease: EASE.out,
          scrollTrigger: { trigger: section, start: 'top 55%', toggleActions: 'play reverse play reverse' },
        },
      ),
    )
  }

  return () => {
    for (const tween of tweens) {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
    delete section.dataset.revealSkip
  }
})
</script>

<template>
  <div ref="root" class="fe-timeline">
    <div class="fe-timeline__viewport">
      <header class="fe-timeline__head" data-timeline-head>
        <p class="fe-timeline__eyebrow">
          <span>06</span>
          <span class="fe-timeline__rule" />
          <span>Horizontal Timeline</span>
        </p>
        <h2 class="fe-timeline__title">品牌时间轴</h2>
        <p class="fe-timeline__text">垂直滚动被转换为水平移动 —— 时间在一条轴上展开。</p>
      </header>

      <div class="fe-timeline__rail">
        <div class="fe-timeline__track" data-timeline-track>
          <article v-for="(milestone, i) in milestones" :key="milestone.year" class="fe-timeline__card" data-timeline-card>
            <figure>
              <img :src="images[i]" :alt="milestone.title" loading="lazy" />
            </figure>
            <div class="fe-timeline__body">
              <span class="fe-timeline__year">{{ milestone.year }}</span>
              <h3>{{ milestone.title }}</h3>
              <p>{{ milestone.text }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>

    <span class="sr-only">Section {{ index + 1 }}: Horizontal Timeline</span>
  </div>
</template>

<style scoped>
.fe-timeline {
  position: relative;
  height: 200vh;
}

.fe-timeline__viewport {
  display: flex;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  gap: 4vh;
  overflow: hidden;
  padding-block: 12vh;
}

.fe-timeline__head {
  padding-inline: 1.5rem;
  max-width: 40rem;
}

@media (min-width: 768px) {
  .fe-timeline__head {
    padding-inline: 4rem;
  }
}

.fe-timeline__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-timeline__rule {
  height: 1px;
  width: 2rem;
  background: linear-gradient(90deg, #d8b26a, transparent);
}

.fe-timeline__title {
  margin-top: 1rem;
  font-size: clamp(2rem, 4.4vw, 3.4rem);
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.fe-timeline__text {
  margin-top: 0.85rem;
  font-size: 14px;
  color: var(--color-ink-dim);
}

.fe-timeline__rail {
  position: relative;
}

.fe-timeline__track {
  display: flex;
  gap: 1.5rem;
  padding-inline: 1.5rem;
  will-change: transform;
}

@media (min-width: 768px) {
  .fe-timeline__track {
    padding-inline: 4rem;
  }
}

.fe-timeline__card {
  flex: 0 0 auto;
  width: min(23rem, 74vw);
  overflow: hidden;
  border-radius: 1.5rem;
  border: 1px solid rgb(255 255 255 / 10%);
  background: linear-gradient(150deg, rgb(255 255 255 / 7%), rgb(255 255 255 / 2%));
  backdrop-filter: blur(18px);
  will-change: transform;
}

.fe-timeline__card figure {
  margin: 0;
  overflow: hidden;
}

.fe-timeline__card img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.fe-timeline__body {
  padding: 1.25rem 1.5rem 1.75rem;
}

.fe-timeline__year {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #d8b26a;
}

.fe-timeline__body h3 {
  margin-top: 0.6rem;
  font-size: 1.15rem;
  font-weight: 600;
}

.fe-timeline__body p {
  margin-top: 0.6rem;
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-ink-dim);
}
</style>
