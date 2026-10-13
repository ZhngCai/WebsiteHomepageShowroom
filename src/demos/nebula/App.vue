<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import MainScene from './components/MainScene.vue'
import ScrollContainer from './components/ScrollContainer.vue'
import Loading from '@/shared/Loading.vue'
import Navbar from '@/shared/Navbar.vue'
import { demos } from '@/demos/registry'
import { useAppStore } from '@/stores/app'
import { scrollRootKey, sectionList } from './utils/context'
import './style.css'

const store = useAppStore()
const meta = demos.find((demo) => demo.name === 'nebula')

const sceneReady = ref(false)
const active = ref(0)

provide(scrollRootKey, shallowRef<HTMLElement | null>(null))

let ticker: ReturnType<typeof setInterval> | undefined
let bootedAt = performance.now()

const progress = computed(() => store.loadingProgress)
const showLoading = computed(() => !sceneReady.value || store.loading)

function onReady() {
  // 首帧就绪后仍保留一点加载时长，避免 loading 一闪而过
  const elapsed = performance.now() - bootedAt
  const delay = Math.max(0, 900 - elapsed)
  setTimeout(() => {
    sceneReady.value = true
    store.setLoading(false)
  }, delay)
}

function seek(index: number) {
  window.dispatchEvent(new CustomEvent('nebula:seek', { detail: index }))
}

watch(active, (value) => store.setActiveSection(value))

onMounted(() => {
  bootedAt = performance.now()
  store.setDemo('nebula')

  // 加载进度：构建期间缓升至 92%，就绪后补齐
  ticker = setInterval(() => {
    if (sceneReady.value) return
    store.setProgress(store.loadingProgress + (0.92 - store.loadingProgress) * 0.18)
  }, 120)
})

onBeforeUnmount(() => clearInterval(ticker))
</script>

<template>
  <div class="nebula-root relative w-full bg-void">
    <MainScene @ready="onReady" @section="active = $event" />
    <ScrollContainer />

    <div class="nebula-vignette pointer-events-none fixed inset-0 z-20" />

    <Navbar :title="meta?.title" tagline="Scroll = Camera" :sections="sectionList" :active="active" @seek="seek" />

    <Loading :visible="showLoading" :progress="progress" label="Loading 3D Experience" hint="滚动探索 · 六个世界" />
  </div>
</template>

