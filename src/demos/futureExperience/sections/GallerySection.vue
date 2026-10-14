<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()
</script>

<template>
  <div class="fe-gallery">
    <SectionHeading
      :index="index"
      eyebrow="Infinite Product Gallery"
      title="产品瀑布"
      subtitle="滚动越快，画面越倾斜"
      accent="#d8b26a"
      hint="Scroll speed drives the tilt"
    />

    <div class="fe-gallery__grid">
      <div v-for="column in 3" :key="column" class="fe-gallery__column" :data-column="column - 1">
        <div v-for="item in 3" :key="item" class="fe-gallery__item" />
      </div>
    </div>
  </div>
</template>
