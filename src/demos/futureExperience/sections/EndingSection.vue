<script setup lang="ts">
defineProps<{ index: number }>()
</script>

<template>
  <div class="fe-ending">
    <div class="fe-ending__sticky">
      <p class="fe-ending__eyebrow" data-reveal>Singularity Ending</p>
      <h2 class="fe-ending__title" data-reveal>CREATE THE FUTURE</h2>
      <p class="fe-ending__text" data-reveal>粒子、卡片、图片与文字在此融合为同一个点。</p>
      <span class="sr-only">Section {{ index + 1 }}</span>
    </div>
  </div>
</template>
