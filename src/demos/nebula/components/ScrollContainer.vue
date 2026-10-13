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
  <div ref="root" class="nebula-scroll relative z-10">
    <section
      v-for="(meta, index) in sectionList"
      :key="meta.id"
      class="nebula-section relative h-screen w-full"
      :data-section="meta.id"
      :data-index="index"
    >
      <component :is="sectionComponents[index]" :index="index" />
    </section>
  </div>
</template>
