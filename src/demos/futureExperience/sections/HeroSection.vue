<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()
</script>

<template>
  <div class="fe-layer fe-layer--hero">
    <SectionHeading
      :index="index"
      eyebrow="Cosmic Hero"
      title="AETHER"
      subtitle="Future Experience · 进入未来的第一屏"
      accent="#d8b26a"
      hint="Scroll to travel"
    />
  </div>
</template>
