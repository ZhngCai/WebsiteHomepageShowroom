<script setup lang="ts">
withDefaults(
  defineProps<{
    index: number
    eyebrow: string
    title: string
    subtitle?: string
    description?: string
    align?: 'left' | 'center'
    accent?: string
    hint?: string
  }>(),
  { align: 'left', accent: '#d8b26a' },
)
</script>

<template>
  <div
    class="fe-heading"
    :class="align === 'center' ? 'is-center' : ''"
    :style="{ '--fe-accent': accent }"
  >
    <p class="fe-heading__eyebrow" data-reveal>
      <span class="fe-heading__index">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="fe-heading__rule" />
      <span>{{ eyebrow }}</span>
    </p>

    <h2 class="fe-heading__title" data-reveal>{{ title }}</h2>

    <p v-if="subtitle" class="fe-heading__subtitle" data-reveal>{{ subtitle }}</p>
    <p v-if="description" class="fe-heading__text" data-reveal>{{ description }}</p>

    <slot />

    <p v-if="hint" class="fe-heading__hint" data-reveal>
      <span class="fe-heading__tick" />
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.fe-heading {
  max-width: 46rem;
}

.fe-heading.is-center {
  margin-inline: auto;
  text-align: center;
}

.fe-heading__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-heading.is-center .fe-heading__eyebrow {
  justify-content: center;
}

.fe-heading__index {
  color: color-mix(in oklab, var(--color-ink-dim) 65%, transparent);
}

.fe-heading__rule {
  height: 1px;
  width: 2rem;
  background: linear-gradient(90deg, var(--fe-accent), transparent);
}

.fe-heading__title {
  margin-top: 1.25rem;
  font-size: clamp(2.4rem, 6.4vw, 5rem);
  line-height: 0.96;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.fe-heading__subtitle {
  margin-top: 1.25rem;
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  font-weight: 300;
  color: color-mix(in oklab, var(--color-ink) 88%, transparent);
}

.fe-heading__text {
  margin-top: 1rem;
  max-width: 34rem;
  font-size: 14px;
  line-height: 1.75;
  color: var(--color-ink-dim);
}

.fe-heading.is-center .fe-heading__text {
  margin-inline: auto;
}

.fe-heading__hint {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-ink-dim) 78%, transparent);
}

.fe-heading.is-center .fe-heading__hint {
  justify-content: center;
}

.fe-heading__tick {
  display: inline-block;
  height: 2rem;
  width: 1px;
  background: linear-gradient(180deg, var(--fe-accent), transparent);
  animation: fe-tick 2.4s ease-in-out infinite;
}

@keyframes fe-tick {
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
