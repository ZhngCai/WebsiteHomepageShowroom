<script setup lang="ts">
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()
</script>

<template>
  <SectionShell
    :index="index"
    eyebrow="Infinite Gallery"
    title="无限画廊"
    subtitle="滚动 = 飞船前进"
    description="图片在空间中随机漂浮，从两侧高速掠过。着色器景深让焦点之外的一切自然虚化，形成电影级空间穿越。"
    accent="#ffc46b"
    hint="Forward flight"
  />
</template>
