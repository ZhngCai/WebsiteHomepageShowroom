<script setup lang="ts">
defineProps<{ index: number }>()

const facts = [
  { k: 'Est.', v: '2019' },
  { k: 'Ateliers', v: '6' },
  { k: 'Pieces', v: '128' },
]
</script>

<template>
  <div class="fe-layer fe-layer--hero">
    <div class="fe-hero">
      <p class="fe-hero__eyebrow" data-reveal>
        <span>01</span>
        <span class="fe-hero__rule" />
        <span>Cosmic Hero · Future Experience</span>
      </p>

      <p class="fe-hero__lead" data-reveal>
        一个以光为材料的品牌。<br />
        滚动，即穿越。
      </p>

      <dl class="fe-hero__facts" data-reveal>
        <div v-for="fact in facts" :key="fact.k">
          <dt>{{ fact.k }}</dt>
          <dd>{{ fact.v }}</dd>
        </div>
      </dl>

      <p class="fe-hero__hint" data-reveal>
        <span class="fe-hero__tick" />
        Scroll to travel
      </p>
    </div>

    <span class="sr-only">Section {{ index + 1 }}: Cosmic Hero</span>
  </div>
</template>

<style scoped>
.fe-hero {
  max-width: 34rem;
}

.fe-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-hero__rule {
  height: 1px;
  width: 2.5rem;
  background: linear-gradient(90deg, #d8b26a, transparent);
}

.fe-hero__lead {
  margin-top: 1.5rem;
  font-size: clamp(1.05rem, 1.7vw, 1.45rem);
  line-height: 1.7;
  font-weight: 300;
  color: color-mix(in oklab, var(--color-ink) 88%, transparent);
}

.fe-hero__facts {
  display: flex;
  gap: 2.5rem;
  margin-top: 2.25rem;
}

.fe-hero__facts dt {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-ink-dim) 70%, transparent);
}

.fe-hero__facts dd {
  margin-top: 0.35rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #f6f2e8;
}

.fe-hero__hint {
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-ink-dim) 78%, transparent);
}

.fe-hero__tick {
  display: inline-block;
  height: 2rem;
  width: 1px;
  background: linear-gradient(180deg, #d8b26a, transparent);
  animation: fe-hero-tick 2.4s ease-in-out infinite;
}

@keyframes fe-hero-tick {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(-3px);
  }
  50% {
    opacity: 1;
    transform: translateY(3px);
  }
}
</style>
