<script setup lang="ts">
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()

const years = ['2015', '2017', '2019', '2021', '2023', '2025']
</script>

<template>
  <SectionShell
    :index="index"
    eyebrow="Time Warp"
    title="时间折叠"
    subtitle="垂直滚动 = 360° 空间旋转"
    description="巨大的 3D 时间环在空间中展开，年份、影像与文字沿曲线排列。相机绕环飞行，穿越时间隧道。"
    accent="#2ee6ff"
    hint="Camera orbits the ring"
  >
    <ul class="mt-9 flex flex-wrap gap-2" data-reveal>
      <li
        v-for="year in years"
        :key="year"
        class="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.2em] text-ink-dim"
      >
        {{ year }}
      </li>
    </ul>
  </SectionShell>
</template>
