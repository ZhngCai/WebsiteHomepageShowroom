<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import MainScene from './components/MainScene.vue'
import ScrollContainer from './components/ScrollContainer.vue'
import Loading from '@/shared/Loading.vue'
import Navbar from '@/shared/Navbar.vue'
import { demos } from '@/demos/registry'
import { useAppStore } from '@/stores/app'
import { scrollRootKey, sectionList } from './utils/context'
import './styles/index.css'

const store = useAppStore()
const meta = demos.find((demo) => demo.name === 'future-experience')

const sceneReady = ref(false)
const active = ref(0)

provide(scrollRootKey, shallowRef<HTMLElement | null>(null))

let ticker: ReturnType<typeof setInterval> | undefined
let bootedAt = performance.now()

const progress = computed(() => store.loadingProgress)
const showLoading = computed(() => !sceneReady.value || store.loading)
const navSections = sectionList.map((meta) => ({ id: meta.id, label: meta.label }))

function onReady() {
  // 首帧就绪后仍保留一点加载时长，避免 loading 一闪而过
  const delay = Math.max(0, 900 - (performance.now() - bootedAt))
  setTimeout(() => {
    sceneReady.value = true
    store.setLoading(false)
  }, delay)
}

function seek(index: number) {
  window.dispatchEvent(new CustomEvent('future:seek', { detail: index }))
}

watch(active, (value) => store.setActiveSection(value))

onMounted(() => {
  bootedAt = performance.now()
  store.setDemo('future-experience')

  ticker = setInterval(() => {
    if (sceneReady.value) return
    store.setProgress(store.loadingProgress + (0.92 - store.loadingProgress) * 0.18)
  }, 120)
})

onBeforeUnmount(() => clearInterval(ticker))
</script>

<template>
  <div class="fe-root">
    <MainScene @ready="onReady" @section="active = $event" />
    <ScrollContainer />

    <div class="fe-vignette pointer-events-none fixed inset-0" />

    <Navbar :title="meta?.title" tagline="Scroll = Experience" :sections="navSections" :active="active" @seek="seek" />

    <Loading :visible="showLoading" :progress="progress" label="Loading Experience" hint="八个章节 · 滚动即体验" />
  </div>
</template>
