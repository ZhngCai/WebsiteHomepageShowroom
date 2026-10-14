<script setup lang="ts">
import { inject, onMounted, ref, type ShallowRef } from 'vue'
import { sectionComponents } from '../sections'
import { scrollRootKey, sectionList } from '../utils/context'

const root = ref<HTMLElement>()
const injectedRoot = inject<ShallowRef<HTMLElement | null>>(scrollRootKey)

onMounted(() => {
  if (injectedRoot) injectedRoot.value = root.value ?? null
})
</script>

<template>
  <div ref="root" class="fe-scroll">
    <section
      v-for="(meta, index) in sectionList"
      :key="meta.id"
      class="fe-section"
      :class="`fe-section--${meta.id}`"
      :data-section="meta.id"
      :data-index="index"
      :data-world="meta.world ?? ''"
    >
      <component :is="sectionComponents[index]" :index="index" />
    </section>
  </div>
</template>
