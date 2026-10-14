<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ENDING_BURST_EVENT } from '../utils/events'

defineProps<{ index: number }>()

const router = useRouter()
const flashKey = ref(0)
const burst = ref(false)

function onBurst() {
  flashKey.value += 1
  burst.value = true
}

function restart() {
  window.dispatchEvent(new CustomEvent('future:seek', { detail: 0 }))
}

onMounted(() => window.addEventListener(ENDING_BURST_EVENT, onBurst))
onBeforeUnmount(() => window.removeEventListener(ENDING_BURST_EVENT, onBurst))
</script>

<template>
  <div class="fe-ending">
    <div class="fe-ending__sticky">
      <p class="fe-ending__eyebrow" data-reveal>
        <span class="fe-ending__rule" />
        Singularity Ending
      </p>

      <h2 class="fe-ending__title" :class="burst ? 'is-burst' : ''">
        <span>CREATE THE</span>
        <span class="fe-ending__accent">FUTURE</span>
      </h2>

      <p class="fe-ending__text" :class="burst ? 'is-burst' : ''">
        星尘、卡片、神经元与漂浮物在此坍缩为同一个点。<br />
        那不是终点，而是入口。
      </p>

      <div class="fe-ending__actions" :class="burst ? 'is-burst' : ''">
        <button
          class="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-void transition hover:shadow-[0_0_44px_-4px_#fff]"
          @click="restart"
        >
          重新穿越
        </button>
        <button
          class="fe-glass rounded-full px-6 py-3.5 text-sm text-ink-dim transition hover:text-ink"
          @click="router.push({ name: 'gallery' })"
        >
          返回 Demo 展厅
        </button>
      </div>

      <p class="fe-ending__foot" :class="burst ? 'is-burst' : ''">Vue3 · Three.js · GSAP · Lenis · Pinia</p>

      <div v-if="flashKey" :key="flashKey" class="fe-ending__flash" />
    </div>

    <span class="sr-only">Section {{ index + 1 }}: Singularity Ending</span>
  </div>
</template>

<style scoped>
.fe-ending {
  position: relative;
  height: 170vh;
}

.fe-ending__sticky {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding-inline: 1.5rem;
  text-align: center;
}

.fe-ending__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-ending__rule {
  height: 1px;
  width: 2.5rem;
  background: linear-gradient(90deg, transparent, #d8b26a);
}

.fe-ending__title {
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  font-size: clamp(2.6rem, 8vw, 7rem);
  line-height: 0.92;
  font-weight: 600;
  letter-spacing: -0.04em;
}

.fe-ending__accent {
  background: linear-gradient(100deg, #9fd8ff 0%, #d8b26a 55%, #f6f2e8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.fe-ending__text {
  max-width: 34rem;
  font-size: 14px;
  line-height: 1.9;
  color: var(--color-ink-dim);
}

.fe-ending__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.fe-ending__foot {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-ink-dim) 62%, transparent);
}

/* 爆炸前的标题与按钮保持克制，炸开后再浮现 */
.fe-ending__title,
.fe-ending__text,
.fe-ending__actions,
.fe-ending__foot {
  opacity: 0.35;
  transition:
    opacity 1.1s var(--ease-out-expo),
    transform 1.1s var(--ease-out-expo),
    filter 1.1s linear;
  filter: blur(2px);
}

.fe-ending__title {
  transform: scale(0.97);
}

.is-burst {
  opacity: 1;
  filter: blur(0);
}

.fe-ending__title.is-burst {
  transform: scale(1);
}

.fe-ending__flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(58% 58% at 50% 50%, #fff 0%, rgb(216 178 106 / 55%) 38%, transparent 74%);
  animation: fe-burst 1.05s var(--ease-out-expo) forwards;
  pointer-events: none;
}

@keyframes fe-burst {
  0% {
    opacity: 0;
    transform: scale(0.25);
  }
  14% {
    opacity: 0.78;
  }
  100% {
    opacity: 0;
    transform: scale(2.2);
  }
}
</style>
