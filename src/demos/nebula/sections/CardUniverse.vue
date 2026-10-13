<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import SectionShell from '../components/SectionShell.vue'
import { CARD_CLOSE_EVENT, CARD_FOCUS_EVENT, emitCardClose, type CardFocusDetail } from '../utils/events'

gsap.registerPlugin(Flip)

defineProps<{ index: number }>()

const panel = ref<HTMLElement>()
const card = ref<CardFocusDetail | null>(null)
const visible = ref(false)
const ready = ref(false)

let flipTween: ReturnType<typeof Flip.from> | null = null
let readyTimer: ReturnType<typeof setTimeout> | undefined

/** 卡片从 3D 空间飞出 → 用 GSAP Flip 把玻璃面板从卡片屏幕位置展开到最终布局 */
async function onFocus(event: Event) {
  const detail = (event as CustomEvent<CardFocusDetail>).detail
  card.value = detail
  visible.value = true
  ready.value = false
  await nextTick()

  const element = panel.value
  if (!element) return

  flipTween?.kill()

  element.style.position = 'fixed'
  element.style.left = `${detail.rect.x}px`
  element.style.top = `${detail.rect.y}px`
  element.style.width = `${detail.rect.width}px`
  element.style.height = `${detail.rect.height}px`
  element.style.margin = '0'
  element.style.transform = 'none'

  const state = Flip.getState(element)
  element.removeAttribute('style')

  flipTween = Flip.from(state, {
    duration: 0.9,
    ease: 'power3.inOut',
    scale: true,
  })

  clearTimeout(readyTimer)
  readyTimer = setTimeout(() => (ready.value = true), 260)
}

function onClose() {
  clearTimeout(readyTimer)
  ready.value = false
  visible.value = false
  card.value = null
}

function close() {
  emitCardClose()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && visible.value) close()
}

onMounted(() => {
  window.addEventListener(CARD_FOCUS_EVENT, onFocus)
  window.addEventListener(CARD_CLOSE_EVENT, onClose)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  clearTimeout(readyTimer)
  flipTween?.kill()
  window.removeEventListener(CARD_FOCUS_EVENT, onFocus)
  window.removeEventListener(CARD_CLOSE_EVENT, onClose)
  window.removeEventListener('keydown', onKeydown)
  if (panel.value) gsap.killTweensOf(panel.value)
})
</script>

<template>
  <div class="relative h-full w-full">
    <SectionShell
      :index="index"
      eyebrow="Card Universe"
      title="卡片星球"
      subtitle="100 张记忆构成一颗球体"
      description="卡片在球面上缓慢自转，鼠标拖动可任意旋转。悬停放大，点击后卡片从 3D 空间飞出并展开玻璃信息卡。"
      accent="#ff5fa2"
      hint="Drag · Hover · Click"
    >
      <p class="mt-8 font-mono text-[11px] tracking-[0.24em] text-ink-dim/70 uppercase" data-reveal>
        {{ visible ? 'Card focused · esc to close' : 'Click any card to expand' }}
      </p>
    </SectionShell>

    <Transition name="panel">
      <div v-show="visible" class="pointer-events-none fixed inset-0 z-30 flex items-center justify-end px-6 md:px-14">
        <article
          ref="panel"
          class="glass card-panel pointer-events-auto w-[min(30rem,calc(100vw-3rem))] overflow-hidden rounded-3xl"
          data-ui
          role="dialog"
          aria-modal="false"
          :aria-label="card?.title"
        >
          <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <span class="font-mono text-[10px] tracking-[0.34em] text-ink-dim uppercase">Glass Info Card</span>
            <button
              class="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-sm text-ink-dim transition hover:border-white/40 hover:text-ink"
              aria-label="关闭"
              @click="close"
            >
              ×
            </button>
          </div>

          <div class="px-6 pt-6 pb-7" :class="ready ? 'is-ready' : ''">
            <h3 class="text-3xl leading-tight font-semibold tracking-tight">{{ card?.title }}</h3>
            <p class="mt-2 font-mono text-[11px] tracking-[0.3em] uppercase" style="color: #ff5fa2">
              {{ card?.tag }} · {{ card?.palette }}
            </p>

            <dl class="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10">
              <div
                v-for="row in [
                  { k: 'Year', v: card?.year },
                  { k: 'Index', v: String((card?.id ?? 0) + 1).padStart(3, '0') },
                  { k: 'Tile', v: String(card?.tile ?? 0) },
                ]"
                :key="row.k"
                class="bg-white/4 px-4 py-3"
              >
                <dt class="font-mono text-[9px] tracking-[0.26em] text-ink-dim uppercase">{{ row.k }}</dt>
                <dd class="mt-1 font-mono text-sm">{{ row.v }}</dd>
              </div>
            </dl>

            <p class="mt-5 text-[13px] leading-relaxed text-ink-dim">
              这张卡片来自球体表面的记忆采样，由程序化艺术图集实时生成，无任何外部图片资源。
              关闭后它会沿原轨迹飞回球体，继续参与旋转。
            </p>

            <button
              class="mt-6 w-full rounded-full bg-white py-3 text-sm font-medium text-void transition hover:shadow-[0_0_36px_-6px_#fff]"
              @click="close"
            >
              返回球体
            </button>
          </div>
        </article>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.card-panel {
  transform-origin: center;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 0.4s var(--ease-out-expo),
    filter 0.4s linear;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  filter: blur(12px);
}

.is-ready {
  animation: panel-content 0.5s var(--ease-out-expo) both;
}

@keyframes panel-content {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
