<script setup lang="ts">
import SectionHeading from '../components/SectionHeading.vue'

defineProps<{ index: number }>()

const milestones = [
  { year: '2019', title: 'AETHER 诞生', text: '第一代材料实验室成立。' },
  { year: '2021', title: '工艺体系', text: '建立可追溯的材质档案。' },
  { year: '2023', title: '数字孪生', text: '每件作品拥有独立数字身份。' },
  { year: '2025', title: '未来系列', text: '与 AI 共同完成的限量系列。' },
]
</script>

<template>
  <div class="fe-timeline">
    <div class="fe-timeline__viewport">
      <SectionHeading
        :index="index"
        eyebrow="Horizontal Timeline"
        title="品牌时间轴"
        subtitle="垂直滚动 → 水平展开"
        accent="#d8b26a"
        hint="Vertical scroll becomes horizontal"
      />

      <div class="fe-timeline__track" data-timeline-track>
        <article v-for="milestone in milestones" :key="milestone.year" class="fe-timeline__card">
          <span class="fe-timeline__year">{{ milestone.year }}</span>
          <h3>{{ milestone.title }}</h3>
          <p>{{ milestone.text }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
