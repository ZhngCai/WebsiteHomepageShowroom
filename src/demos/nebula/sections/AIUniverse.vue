<script setup lang="ts">
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()

const metrics = [
  { k: 'Nodes', v: '1000' },
  { k: 'Synapses', v: '2200' },
  { k: 'Flow', v: 'Live' },
]
</script>

<template>
  <SectionShell
    :index="index"
    eyebrow="AI Universe"
    title="AI 宇宙"
    subtitle="从混沌到意识"
    description="1000 个节点在空间中逐渐连接成神经网络，粒子沿突触流动。相机继续前进，最终进入网络内部。"
    accent="#a78bfa"
    hint="Entering the network"
  >
    <dl class="mt-9 flex flex-wrap gap-x-10 gap-y-4" data-reveal>
      <div v-for="metric in metrics" :key="metric.k">
        <dt class="font-mono text-[10px] tracking-[0.28em] text-ink-dim/70 uppercase">{{ metric.k }}</dt>
        <dd class="mt-1 text-2xl font-semibold">{{ metric.v }}</dd>
      </div>
    </dl>
  </SectionShell>
</template>
