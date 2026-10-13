<script setup lang="ts">
import { inject, onMounted, ref, type ShallowRef } from 'vue'
import { sectionComponents } from '../sections'
import SingularityEnding from '../sections/SingularityEnding.vue'
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

    <!-- 终章空间：为最后一屏留出滚动余量，用于奇点爆炸与结尾动画 -->
    <div class="nebula-outro relative h-screen w-full" data-outro>
      <SingularityEnding />
    </div>
  </div>
</template>
