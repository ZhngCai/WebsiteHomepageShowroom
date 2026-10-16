<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ScrollProgress from './components/ScrollProgress.vue'
import HeroSection from './sections/HeroSection.vue'
import IntroSection from './sections/IntroSection.vue'
import WritingSection from './sections/WritingSection.vue'
import CreationSection from './sections/CreationSection.vue'
import PlayingCardsSection from './sections/PlayingCardsSection.vue'
import KnowledgeSection from './sections/KnowledgeSection.vue'
import MusicSection from './sections/MusicSection.vue'
import EndingSection from './sections/EndingSection.vue'
import { disposeScrollManager, getScrollManager, ScrollTrigger } from './composables/useSmoothScroll'
import { useAppStore } from '@/stores/app'
import { demos } from '@/demos/registry'

const store = useAppStore()
const meta = demos.find((demo) => demo.name === 'doubao-inspired')

const ready = ref(false)
const active = ref(0)

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'intro', label: 'Capabilities' },
  { id: 'writing', label: 'Writing' },
  { id: 'creation', label: 'Creation' },
  { id: 'cards', label: 'Collection' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'music', label: 'Rhythm' },
  { id: 'ending', label: 'Ending' },
]

let revealTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  store.setDemo('doubao-inspired')

  const manager = getScrollManager()
  manager.start()

  // 等首帧与 ScrollTrigger 初始化完成后再收起加载遮罩，避免闪动
  requestAnimationFrame(() => {
    revealTimer = setTimeout(() => {
      ready.value = true
      ScrollTrigger.refresh()
    }, 620)
  })
})

onBeforeUnmount(() => {
  clearTimeout(revealTimer)
  disposeScrollManager()
})

function seek(index: number) {
  const section = document.getElementById(sections[index]?.id ?? 'hero')
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="afl">
    <Header />

    <ScrollProgress :sections="sections" />

    <main class="afl-main">
      <HeroSection />
      <IntroSection />
      <WritingSection />
      <CreationSection />
      <PlayingCardsSection />
      <KnowledgeSection />
      <MusicSection />
      <EndingSection />
    </main>

    <Footer />

    <Transition name="afl-loading">
      <div v-if="!ready" class="afl-loading" role="status" :aria-label="meta?.title">
        <div class="afl-loading__inner">
          <span class="afl-loading__mark">AI Future Lab</span>
          <span class="afl-loading__bar"><span class="afl-loading__fill" /></span>
        </div>
      </div>
    </Transition>

    <span class="afl-visually-hidden" aria-live="polite">{{ sections[active]?.label }}</span>
  </div>
</template>

<style lang="scss">
@use './styles/variables' as *;
@use './styles/base.scss';
@use './styles/animations.scss';

.afl-main {
  position: relative;
}
</style>
