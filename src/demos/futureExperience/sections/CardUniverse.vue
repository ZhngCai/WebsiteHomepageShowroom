<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()
</script>

<template>
  <div class="fe-layer fe-layer--cards">
    <SectionHeading
      :index="index"
      eyebrow="3D Card Universe"
      title="卡片宇宙"
      subtitle="100+ 张卡片构成一颗星体"
      description="拖动旋转、悬停放大、点击后卡片飞向镜头，展开玻璃信息卡。"
      accent="#d8b26a"
      hint="Drag · Hover · Click"
    />
  </div>
</template>
