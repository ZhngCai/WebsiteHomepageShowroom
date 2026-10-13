<script setup lang="ts">
import SectionShell from '../components/SectionShell.vue'

defineProps<{ index: number }>()
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
  />
</template>
