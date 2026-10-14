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
  { align: 'left', accent: '#7c5cff' },
)
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 z-10 flex"
    :class="[
      align === 'center' ? 'items-center justify-center text-center' : 'items-end justify-start pb-[14vh]',
      align === 'center' ? 'px-6' : 'px-6 md:px-16',
    ]"
    :style="{ '--accent': accent }"
  >
    <div class="section-scrim pointer-events-none absolute inset-0" :class="align === 'center' ? 'is-center' : ''" />

    <div class="pointer-events-auto relative max-w-3xl" :class="align === 'center' ? 'mx-auto' : ''">
      <p class="flex items-center gap-3 font-mono text-[11px] tracking-[0.34em] uppercase" :class="align === 'center' ? 'justify-center' : ''" data-reveal>
        <span class="text-ink-dim/60">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="h-px w-8" :style="{ background: `linear-gradient(90deg, ${accent}, transparent)` }" />
        <span :style="{ color: accent }">{{ eyebrow }}</span>
      </p>

      <h2
        class="mt-5 text-[clamp(2.4rem,7vw,5.6rem)] leading-[0.94] font-semibold tracking-[-0.03em]"
        data-reveal
      >
        {{ title }}
      </h2>

      <p v-if="subtitle" class="mt-5 text-[clamp(1rem,1.6vw,1.35rem)] font-light text-ink/85" data-reveal>
        {{ subtitle }}
      </p>

      <p v-if="description" class="mt-4 max-w-xl text-[13.5px] leading-relaxed text-ink-dim md:text-[15px]" :class="align === 'center' ? 'mx-auto' : ''" data-reveal>
        {{ description }}
      </p>

      <slot />

      <p v-if="hint" class="mt-8 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-ink-dim/70 uppercase" :class="align === 'center' ? 'justify-center' : ''" data-reveal>
        <span class="scroll-arrow inline-block h-8 w-px" :style="{ background: `linear-gradient(180deg, ${accent}, transparent)` }" />
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.section-scrim {
  background:
    radial-gradient(46% 62% at 16% 74%, rgb(4 5 10 / 82%) 0%, rgb(4 5 10 / 40%) 45%, transparent 72%),
    linear-gradient(180deg, rgb(4 5 10 / 45%) 0%, transparent 34%, rgb(4 5 10 / 62%) 100%);
}

.section-scrim.is-center {
  background: radial-gradient(56% 58% at 50% 50%, rgb(4 5 10 / 74%) 0%, rgb(4 5 10 / 28%) 52%, transparent 76%);
}

.scroll-arrow {
  animation: breathe 2.4s ease-in-out infinite;
}

@keyframes breathe {
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
