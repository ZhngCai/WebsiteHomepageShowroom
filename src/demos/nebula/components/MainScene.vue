<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, watch, type ShallowRef } from 'vue'
import { SceneManager } from '../three/SceneManager'
import { ScrollManager } from '../three/ScrollManager'
import { createWorldFactories } from '../three/worlds'
import { scrollRootKey } from '../utils/context'

const emit = defineEmits<{ ready: []; section: [index: number] }>()

const canvas = ref<HTMLCanvasElement>()
const container = inject<ShallowRef<HTMLElement | null>>(scrollRootKey)

let manager: SceneManager | null = null
let scroll: ScrollManager | null = null

function boot(element: HTMLElement) {
  if (!canvas.value || manager) return

  try {
    manager = new SceneManager({ canvas: canvas.value })
    manager.registerWorlds(createWorldFactories())
    manager.start()

    scroll = new ScrollManager({
      container: element,
      scene: manager,
      onActive: (index) => emit('section', index),
      onReady: () => emit('ready'),
    })
  } catch (error) {
    console.error('[nebula] 场景初始化失败:', error)
    emit('ready')
  }
}

onMounted(() => {
  if (container?.value) boot(container.value)
})

watch(
  () => container?.value,
  (element) => element && boot(element),
)

onBeforeUnmount(() => {
  scroll?.destroy()
  scroll = null
  manager?.dispose()
  manager = null
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-0">
    <canvas ref="canvas" class="nebula-canvas h-full w-full" />
  </div>
</template>
