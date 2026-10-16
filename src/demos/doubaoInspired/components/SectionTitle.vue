<script setup lang="ts">
withDefaults(
  defineProps<{
    index: string
    eyebrow: string
    title: string
    description?: string
    align?: 'left' | 'center'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <header class="afl-section-title" :class="align === 'center' ? 'is-center' : ''">
    <p class="afl-eyebrow" data-reveal>
      <span>{{ index }}</span>
      <span class="afl-eyebrow__rule" />
      <span>{{ eyebrow }}</span>
    </p>
    <h2 class="afl-title" data-reveal>{{ title }}</h2>
    <p v-if="description" class="afl-text" data-reveal>{{ description }}</p>
  </header>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-section-title {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &.is-center {
    align-items: center;
    text-align: center;
  }
}
</style>
