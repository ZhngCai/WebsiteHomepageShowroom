<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()
</script>

<template>
  <div class="fe-story">
    <div class="fe-story__text">
      <SectionHeading
        :index="index"
        eyebrow="Luxury Brand Story"
        title="时间的质感"
        subtitle="以工艺与克制，定义未来的奢侈品"
        description="AETHER 相信，真正的高级感来自时间：材料的呼吸、结构的秩序、以及每一次触碰留下的温度。"
        accent="#d8b26a"
      />
    </div>

    <div class="fe-story__media" data-reveal>
      <div class="fe-story__frame">
        <div class="fe-story__glow" />
      </div>
    </div>
  </div>
</template>
