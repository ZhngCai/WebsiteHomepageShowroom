<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()

const stats = [
  { k: 'Nodes', v: '1000' },
  { k: 'Synapses', v: '2.2K' },
  { k: 'Flow', v: 'Live' },
]
</script>

<template>
  <div class="fe-layer fe-layer--ai">
    <SectionHeading
      :index="index"
      eyebrow="AI Neural World"
      title="AI 意识空间"
      subtitle="1000 个节点构成神经网络"
      description="相机继续前进，最终进入网络内部。"
      accent="#9fd8ff"
      hint="Entering the network"
    >
      <dl class="fe-stats" data-reveal>
        <div v-for="stat in stats" :key="stat.k">
          <dt>{{ stat.k }}</dt>
          <dd>{{ stat.v }}</dd>
        </div>
      </dl>
    </SectionHeading>
  </div>
</template>
