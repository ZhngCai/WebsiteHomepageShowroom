<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()
</script>

<template>
  <div class="fe-floating">
    <SectionHeading
      :index="index"
      eyebrow="Floating Objects"
      title="漂浮空间"
      subtitle="物体在空间中缓慢漂浮"
      description="滚动控制旋转，鼠标产生磁吸。"
      accent="#9fd8ff"
      hint="Move the cursor"
    />
  </div>
</template>
