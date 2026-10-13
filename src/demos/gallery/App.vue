<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DemoCard from './components/DemoCard.vue'
import { demos, plannedDemos } from '@/demos/registry'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const store = useAppStore()

const featured = computed(() => demos[0])
const readyCount = computed(() => demos.length)
const plannedCount = computed(() => plannedDemos.length)

function openDemo(name: string) {
  store.setDemo(name)
  router.push({ name })
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-void">
    <div class="pointer-events-none absolute inset-0">
      <div class="blob absolute -top-40 -left-32 h-[46rem] w-[46rem] rounded-full bg-nebula/22 blur-[140px]" />
      <div class="blob absolute top-1/3 -right-40 h-[40rem] w-[40rem] rounded-full bg-aurora/16 blur-[150px] [animation-delay:-6s]" />
      <div class="blob absolute bottom-0 left-1/3 h-[34rem] w-[34rem] rounded-full bg-ember/12 blur-[150px] [animation-delay:-12s]" />
      <div class="grid-lines absolute inset-0 opacity-[0.16]" />
      <div class="grain absolute inset-0" />
    </div>

    <div class="relative mx-auto max-w-7xl px-5 pt-24 pb-24 md:px-10 md:pt-32">
      <header class="flex flex-col gap-8">
        <div class="flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] text-ink-dim uppercase">
          <span class="h-px w-10 bg-gradient-to-r from-transparent to-aurora" />
          AI Creative Website Gallery
        </div>

        <h1 class="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-tight md:text-7xl">
          沉浸式官网
          <span class="bg-gradient-to-r from-aurora via-nebula to-ember bg-clip-text text-transparent"> Demo 展厅</span>
        </h1>

        <p class="max-w-2xl text-base leading-relaxed text-ink-dim md:text-lg">
          Vue3 + TypeScript + Three.js 打造的高端 WebGL 体验集合。每个 Demo 独立运行、独立场景、独立生命周期，
          进入即创建，离开即销毁。当前核心体验：
          <span class="text-ink">Scroll = Camera Movement</span>。
        </p>

        <div class="flex flex-wrap items-center gap-4">
          <button
            class="group relative overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-medium text-void transition hover:shadow-[0_0_44px_-6px_#fff]"
            @click="featured && openDemo(featured.name)"
          >
            <span class="relative z-10">进入 {{ featured?.title }} →</span>
          </button>
          <a
            href="#demos"
            class="glass-soft rounded-full px-6 py-3.5 text-sm text-ink-dim transition hover:text-ink"
          >
            浏览全部 {{ readyCount + plannedCount }} 个 Demo
          </a>
        </div>

        <dl class="mt-4 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/4 sm:grid-cols-4">
          <div v-for="stat in [
            { k: 'Ready', v: readyCount },
            { k: 'Roadmap', v: plannedCount },
            { k: 'FPS Target', v: '60' },
            { k: 'GPU Tier', v: store.quality.tier },
          ]" :key="stat.k" class="bg-void/40 px-5 py-4">
            <dt class="font-mono text-[10px] tracking-[0.24em] text-ink-dim uppercase">{{ stat.k }}</dt>
            <dd class="mt-1 text-xl font-semibold">{{ stat.v }}</dd>
          </div>
        </dl>
      </header>

      <section id="demos" class="mt-24 scroll-mt-24">
        <div class="mb-8 flex items-end justify-between gap-6">
          <h2 class="text-2xl font-semibold tracking-tight">在线 Demo</h2>
          <span class="font-mono text-[10px] tracking-[0.3em] text-ink-dim uppercase">dynamic import · code split</span>
        </div>

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <DemoCard
            v-for="(demo, index) in demos"
            :key="demo.name"
            :demo="demo"
            :index="index"
            status="ready"
            @open="openDemo"
          />
          <DemoCard v-for="(demo, index) in plannedDemos" :key="demo.name" :demo="demo" :index="index" status="planned" />
        </div>
      </section>

      <section class="mt-24">
        <div class="mb-8 flex items-end justify-between gap-6">
          <h2 class="text-2xl font-semibold tracking-tight">扩展方式</h2>
          <span class="font-mono text-[10px] tracking-[0.3em] text-ink-dim uppercase">zero-config</span>
        </div>

        <div class="glass grid gap-px overflow-hidden rounded-3xl md:grid-cols-3">
          <div v-for="step in [
            { n: '01', t: '新增目录', d: 'src/demos/newDemo/，包含 App.vue、components、sections、three、shaders、assets。' },
            { n: '02', t: '注册 Demo', d: '在 src/demos/registry.ts 追加一条记录（名称、封面、技术栈、load）。' },
            { n: '03', t: '自动生效', d: '路由 /demo/newDemo、大厅卡片、独立 Scene 与销毁逻辑自动接入。' },
          ]" :key="step.n" class="bg-void/50 p-7">
            <span class="font-mono text-[11px] tracking-[0.3em] text-aurora">{{ step.n }}</span>
            <h3 class="mt-4 text-lg font-medium">{{ step.t }}</h3>
            <p class="mt-2 text-[13px] leading-relaxed text-ink-dim">{{ step.d }}</p>
          </div>
        </div>
      </section>

      <footer class="mt-24 flex flex-col gap-4 border-t border-white/8 pt-8 text-[12px] text-ink-dim md:flex-row md:items-center md:justify-between">
        <span>© {{ new Date().getFullYear() }} AI Creative Gallery · Vue3 + Three.js</span>
        <span class="font-mono tracking-[0.2em] uppercase">scroll = camera movement</span>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.blob {
  animation: drift 24s ease-in-out infinite alternate;
}

.grid-lines {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 8%) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 8%) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(70% 60% at 50% 30%, #000 0%, transparent 100%);
}

@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(4%, -6%, 0) scale(1.12);
  }
}
</style>
