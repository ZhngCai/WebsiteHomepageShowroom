<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, watch, type ShallowRef } from 'vue'
import { SceneManager } from '../three/SceneManager'
import { createWorldFactories } from '../three/worlds'
import { scrollRootKey } from '../utils/context'

const emit = defineEmits<{ ready: []; section: [index: number] }>()

const canvas = ref<HTMLCanvasElement>()
const container = inject<ShallowRef<HTMLElement | null>>(scrollRootKey)

let manager: SceneManager | null = null
let sections: HTMLElement[] = []
let onScroll: (() => void) | null = null

/** Phase 0：原生滚动框架（Phase 1 将由 Lenis + ScrollTrigger 接管） */
function boot(element: HTMLElement) {
  if (!canvas.value || manager) return

  manager = new SceneManager({
    canvas: canvas.value,
    onActiveChange: (index) => emit('section', index),
  })
  manager.registerWorlds(createWorldFactories())
  manager.start()

  sections = [...element.querySelectorAll<HTMLElement>('[data-section]')]
  const last = Math.max(1, sections.length - 1)

  onScroll = () => {
    const vh = window.innerHeight
    const scroll = window.scrollY

    sections.forEach((_, index) => {
      manager?.setSectionProgress(index, Math.min(1, Math.max(0, scroll / vh - index)))
    })

    manager?.setGlobalProgress(Math.min(1, Math.max(0, scroll / vh / last)))
    manager?.setActive(Math.min(sections.length - 1, Math.max(0, Math.round(scroll / vh))))
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  emit('ready')
}

onMounted(() => {
  if (container?.value) boot(container.value)
})

watch(
  () => container?.value,
  (element) => element && boot(element),
)

onBeforeUnmount(() => {
  if (onScroll) window.removeEventListener('scroll', onScroll)
  onScroll = null
  sections = []
  manager?.dispose()
  manager = null
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-0">
    <canvas ref="canvas" class="nebula-canvas h-full w-full" />
  </div>
</template>
