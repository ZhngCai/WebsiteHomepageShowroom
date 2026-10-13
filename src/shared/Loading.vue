<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    label?: string
    hint?: string
    progress?: number
  }>(),
  {
    label: 'Loading 3D Experience',
    hint: '滚动探索 · 六个世界',
    progress: 0,
  },
)
</script>

<template>
  <Transition name="loading">
    <div v-if="visible" class="fixed inset-0 z-[900] flex flex-col items-center justify-center bg-void">
      <div class="relative flex h-28 w-28 items-center justify-center">
        <span class="loading-ring absolute inset-0 rounded-full" />
        <span class="loading-ring absolute inset-3 rounded-full [animation-direction:reverse]" />
        <span class="h-2 w-2 rounded-full bg-white shadow-[0_0_20px_#fff]" />
      </div>

      <p class="mt-10 font-mono text-[11px] tracking-[0.42em] text-ink-dim uppercase">{{ label }}</p>

      <div class="mt-5 h-px w-56 overflow-hidden bg-white/12">
        <div
          class="h-full bg-gradient-to-r from-aurora via-nebula to-ember transition-[width] duration-500 ease-out"
          :style="{ width: `${Math.round(progress * 100)}%` }"
        />
      </div>

      <p class="mt-4 font-mono text-[10px] tracking-[0.3em] text-ink-dim/70 uppercase">
        {{ hint }} · {{ Math.round(progress * 100) }}%
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.loading-ring {
  background: conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--color-nebula) 90%, transparent) 140deg, transparent 240deg);
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  animation: spin 1.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-leave-active {
  transition:
    opacity 0.7s var(--ease-out-expo),
    filter 0.7s linear;
}

.loading-leave-to {
  opacity: 0;
  filter: blur(20px);
}
</style>
