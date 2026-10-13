<script setup lang="ts">
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()
</script>

<template>
  <SectionShell
    :index="index"
    eyebrow="Card Universe"
    title="卡片星球"
    subtitle="100 张记忆构成一颗球体"
    description="卡片在球面上缓慢自转，鼠标拖动可任意旋转。悬停放大，点击后卡片从 3D 空间飞出并展开玻璃信息卡。"
    accent="#ff5fa2"
    hint="Drag · Hover · Click"
  />
</template>
