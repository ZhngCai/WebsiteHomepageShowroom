<script setup lang="ts">
import { useRouter } from 'vue-router'
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()

const router = useRouter()

function restart() {
  window.dispatchEvent(new CustomEvent('nebula:seek', { detail: 0 }))
}

function toGallery() {
  router.push({ name: 'gallery' })
}
</script>

<template>
  <SectionShell
    :index="index"
    eyebrow="Singularity"
    title="奇点"
    subtitle="粒子、卡片与数据在此聚合成一颗巨大光球"
    description="所有世界最终坍缩为同一个点，然后炸开。那一刻，是结束，也是入口。"
    align="center"
    accent="#ffffff"
    hint="Approaching the light"
  >
    <div class="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4" data-reveal>
      <button
        class="rounded-full bg-white px-7 py-3 text-sm font-medium text-void transition hover:shadow-[0_0_40px_-4px_#fff]"
        @click="restart"
      >
        重新穿越
      </button>
      <button class="glass-soft rounded-full px-6 py-3 text-sm text-ink-dim transition hover:text-ink" @click="toGallery">
        返回 Demo 展厅
      </button>
    </div>
  </SectionShell>
</template>
