<script setup lang="ts">
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()

const stats = [
  { k: 'Particles', v: '10K+' },
  { k: 'Depth', v: '∞' },
  { k: 'FPS', v: '60' },
]
</script>

<template>
  <SectionShell
    :index="index"
    eyebrow="Nebula Portal"
    title="星云入口"
    subtitle="进入数字宇宙"
    description="粒子从四周汇聚，光尘在黑色虚空中缓慢呼吸。滚动即前进，相机穿过星云，驶向时间折叠的边界。"
    accent="#7c5cff"
    hint="Scroll to enter"
  >
    <dl class="mt-9 flex flex-wrap gap-x-10 gap-y-4" data-reveal>
      <div v-for="stat in stats" :key="stat.k">
        <dt class="font-mono text-[10px] tracking-[0.28em] text-ink-dim/70 uppercase">{{ stat.k }}</dt>
        <dd class="mt-1 text-2xl font-semibold">{{ stat.v }}</dd>
      </div>
    </dl>
  </SectionShell>
</template>
