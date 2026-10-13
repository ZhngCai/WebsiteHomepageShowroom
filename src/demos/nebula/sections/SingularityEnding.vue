<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SINGULARITY_BURST_EVENT } from '../utils/events'

const router = useRouter()
const flashKey = ref(0)

function onBurst() {
  flashKey.value += 1
}

function restart() {
  window.dispatchEvent(new CustomEvent('nebula:seek', { detail: 0 }))
}

onMounted(() => window.addEventListener(SINGULARITY_BURST_EVENT, onBurst))
onBeforeUnmount(() => window.removeEventListener(SINGULARITY_BURST_EVENT, onBurst))
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
    <div class="ending-scrim absolute inset-0" />

    <div class="relative max-w-3xl">
      <p class="flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.34em] text-ink-dim uppercase" data-reveal>
        <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70" />
        End of transmission
      </p>

      <h2
        class="mt-6 text-[clamp(2.6rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.04em]"
        data-reveal
      >
        ENTER THE
        <span class="bg-linear-to-r from-aurora via-nebula to-ember bg-clip-text text-transparent">FUTURE</span>
      </h2>

      <p class="mx-auto mt-6 max-w-xl text-[14px] leading-relaxed text-ink-dim md:text-[15px]" data-reveal>
        你已穿越星云、时间环、卡片星球、无限画廊与神经网络。六个世界最终坍缩为同一个点 ——
        那不是终点，而是下一个世界的入口。
      </p>

      <div class="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4" data-reveal>
        <button
          class="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-void transition hover:shadow-[0_0_44px_-4px_#fff]"
          @click="restart"
        >
          重新穿越
        </button>
        <button
          class="glass-soft rounded-full px-6 py-3.5 text-sm text-ink-dim transition hover:text-ink"
          @click="router.push({ name: 'gallery' })"
        >
          返回 Demo 展厅
        </button>
      </div>

      <p class="mt-8 font-mono text-[10px] tracking-[0.3em] text-ink-dim/60 uppercase" data-reveal>
        Vue3 · Three.js · GSAP · Lenis
      </p>
    </div>

    <div v-if="flashKey" :key="flashKey" class="burst-flash pointer-events-none absolute inset-0" />
  </div>
</template>

<style scoped>
.ending-scrim {
  background: radial-gradient(58% 58% at 50% 50%, rgb(4 5 10 / 78%) 0%, rgb(4 5 10 / 30%) 55%, transparent 78%);
}

.burst-flash {
  background: radial-gradient(60% 60% at 50% 50%, #fff 0%, rgb(167 139 250 / 60%) 38%, transparent 76%);
  animation: burst 1s var(--ease-out-expo) forwards;
}

@keyframes burst {
  0% {
    opacity: 0;
    transform: scale(0.25);
  }
  14% {
    opacity: 0.72;
  }
  100% {
    opacity: 0;
    transform: scale(2.2);
  }
}
</style>
