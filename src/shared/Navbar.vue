<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

defineProps<{
  title?: string
  tagline?: string
  sections?: { id: string; label: string }[]
  active?: number
}>()

const emit = defineEmits<{ seek: [index: number] }>()

const router = useRouter()
const store = useAppStore()

function back() {
  store.setDemo(null)
  router.push({ name: 'gallery' })
}
</script>

<template>
  <header class="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10">
    <div class="pointer-events-auto flex items-center gap-3">
      <button
        class="glass-soft flex h-9 items-center gap-2 rounded-full px-4 text-[11px] tracking-[0.2em] text-ink-dim uppercase transition hover:text-ink"
        @click="back"
      >
        <span class="text-base leading-none">←</span>
        Gallery
      </button>
      <div class="hidden flex-col leading-tight md:flex">
        <span class="text-[13px] font-medium">{{ title }}</span>
        <span class="font-mono text-[10px] tracking-[0.24em] text-ink-dim uppercase">{{ tagline }}</span>
      </div>
    </div>

    <nav v-if="sections?.length" class="pointer-events-auto hidden items-center gap-1.5 md:flex">
      <button
        v-for="(section, index) in sections"
        :key="section.id"
        class="group relative flex items-center gap-2 rounded-full px-3 py-2 text-[10px] tracking-[0.2em] uppercase transition"
        :class="index === active ? 'text-ink' : 'text-ink-dim/60 hover:text-ink-dim'"
        :aria-current="index === active ? 'true' : undefined"
        @click="emit('seek', index)"
      >
        <span
          class="h-1 w-1 rounded-full transition-all"
          :class="index === active ? 'w-5 bg-aurora shadow-[0_0_10px_var(--color-aurora)]' : 'bg-white/30 group-hover:bg-white/60'"
        />
        <span class="hidden lg:inline">{{ section.label }}</span>
      </button>
    </nav>

    <div class="pointer-events-auto flex items-center gap-2">
      <span class="glass-soft hidden rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-ink-dim uppercase sm:block">
        {{ store.quality.tier }} · {{ store.quality.cards }}c
      </span>
    </div>
  </header>
</template>
