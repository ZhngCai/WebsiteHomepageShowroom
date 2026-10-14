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

/** Phase 0：基础全屏滚动框架（Phase 1 由 Lenis + ScrollTrigger 统一接管） */
function boot(element: HTMLElement) {
  if (!canvas.value || manager) return

  try {
    manager = new SceneManager({ canvas: canvas.value })
    manager.registerWorlds(createWorldFactories())
    manager.start()
  } catch (error) {
    console.error('[future] 场景初始化失败:', error)
    emit('ready')
    return
  }

  sections = [...element.querySelectorAll<HTMLElement>('[data-section]')]

  onScroll = () => {
    const vh = Math.max(1, window.innerHeight)
    const scroll = window.scrollY
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)

    for (const section of sections) {
      const index = Number(section.dataset.index ?? 0)
      const top = section.offsetTop
      const height = Math.max(1, section.offsetHeight)
      manager?.setSectionProgress(index, Math.min(1, Math.max(0, (scroll - top + vh) / (height + vh))))
    }

    manager?.setGlobalProgress(Math.min(1, Math.max(0, scroll / maxScroll)))
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
    <canvas ref="canvas" class="fe-canvas h-full w-full" />
  </div>
</template>
