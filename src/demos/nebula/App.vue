<script setup lang="ts">
import { onBeforeUnmount, provide, ref, shallowRef, watch } from 'vue'
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

const ready = ref(false)
const active = ref(0)
const progress = ref(0)

provide(scrollRootKey, shallowRef<HTMLElement | null>(null))

let ticker: ReturnType<typeof setInterval> | undefined

function onReady() {
  ready.value = true
  progress.value = 1
  clearInterval(ticker)
  store.setLoading(false)
}

function seek(index: number) {
  window.dispatchEvent(new CustomEvent('nebula:seek', { detail: index }))
}

watch(active, (value) => store.setActiveSection(value))

onBeforeUnmount(() => clearInterval(ticker))

// 加载进度：构建期间缓升至 92%，就绪后补齐
ticker = setInterval(() => {
  if (ready.value) return
  progress.value = Math.min(0.92, progress.value + (0.92 - progress.value) * 0.18)
}, 120)
</script>

<template>
  <div class="nebula-root relative w-full bg-void">
    <MainScene @ready="onReady" @section="active = $event" />
    <ScrollContainer />

    <div class="nebula-vignette pointer-events-none fixed inset-0 z-20" />

    <Navbar :title="meta?.title" tagline="Scroll = Camera" :sections="sectionList" :active="active" @seek="seek" />

    <Loading :visible="!ready" :progress="progress" label="Loading 3D Experience" hint="滚动探索 · 六个世界" />
  </div>
</template>
