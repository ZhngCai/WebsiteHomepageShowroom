<script setup lang="ts">
import type { DemoMeta } from '@/demos/registry'

withDefaults(
  defineProps<{
    demo: DemoMeta
    status?: 'ready' | 'planned'
    index?: number
  }>(),
  { status: 'ready', index: 0 },
)

const emit = defineEmits<{ open: [name: string] }>()
</script>

<template>
  <button
    class="group glass relative flex w-full flex-col overflow-hidden rounded-3xl p-3 text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5"
    :class="status === 'planned' ? 'opacity-60 hover:opacity-90' : ''"
    :style="{ '--accent': demo.accent }"
    :disabled="status === 'planned'"
    :aria-label="`打开 Demo ${demo.title}`"
    @click="emit('open', demo.name)"
  >
    <div class="relative aspect-[16/10] w-full overflow-hidden rounded-2xl" :style="{ background: demo.cover }">
      <div class="grain absolute inset-0" />
      <div
        class="absolute -inset-x-10 -bottom-24 h-40 opacity-70 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
        :style="{ background: `radial-gradient(50% 100% at 50% 100%, ${demo.accent}66, transparent 70%)` }"
      />

      <div class="absolute inset-x-0 top-0 flex items-center gap-1.5 px-4 py-3">
        <span class="h-1.5 w-1.5 rounded-full bg-white/45" />
        <span class="h-1.5 w-1.5 rounded-full bg-white/30" />
        <span class="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span class="ml-3 font-mono text-[9px] tracking-[0.24em] text-white/45 uppercase">/demo/{{ demo.name }}</span>
      </div>

      <div class="absolute inset-x-5 bottom-5 space-y-2">
        <div class="h-1.5 w-2/3 rounded-full bg-white/35" />
        <div class="h-1.5 w-1/3 rounded-full bg-white/20" />
        <div class="flex gap-1.5 pt-2">
          <span v-for="chip in demo.stack.slice(0, 3)" :key="chip" class="rounded-full bg-black/35 px-2 py-0.5 font-mono text-[9px] text-white/60">
            {{ chip }}
          </span>
        </div>
      </div>

      <span
        v-if="status === 'planned'"
        class="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-white/70 uppercase"
      >
        Coming soon
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-3 px-3 pt-5 pb-3">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg leading-tight font-semibold tracking-tight">{{ demo.title }}</h3>
          <p class="mt-1 font-mono text-[10px] tracking-[0.24em] uppercase" :style="{ color: demo.accent }">
            {{ demo.tagline }}
          </p>
        </div>
        <span
          class="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-sm transition group-hover:border-white/40 group-hover:bg-white/10"
        >
          ↗
        </span>
      </div>

      <p class="text-[13px] leading-relaxed text-ink-dim">{{ demo.description }}</p>

      <div class="mt-auto flex flex-wrap gap-1.5 pt-2">
        <span
          v-for="tech in demo.stack"
          :key="tech"
          class="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] text-ink-dim"
        >
          {{ tech }}
        </span>
      </div>
    </div>
  </button>
</template>
