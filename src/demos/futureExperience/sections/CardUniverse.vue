<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { CARD_CLOSE_EVENT, CARD_FOCUS_EVENT, emitCardClose, type CardFocusDetail } from '../utils/events'

gsap.registerPlugin(Flip)

defineProps<{ index: number }>()

const panel = ref<HTMLElement>()
const card = ref<CardFocusDetail | null>(null)
const visible = ref(false)
const ready = ref(false)
const lang = ref<'en' | 'zh'>('en')

let flipTween: ReturnType<typeof Flip.from> | null = null
let readyTimer: ReturnType<typeof setTimeout> | undefined

const title = computed(() => (lang.value === 'en' ? card.value?.title : card.value?.titleZh))
const quote = computed(() => (lang.value === 'en' ? card.value?.quote : card.value?.quoteZh))
const location = computed(() => (lang.value === 'en' ? card.value?.location : card.value?.locationZh))

/** 卡片从 3D 空间飞出 → GSAP Flip 把玻璃信息卡从卡片屏幕位置展开到最终布局 */
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

  flipTween = Flip.from(state, { duration: 0.9, ease: 'power3.inOut', scale: true })

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
  <div class="fe-layer fe-layer--cards">
    <div class="fe-cards-heading">
      <p class="fe-cards-heading__eyebrow" data-reveal>
        <span>03</span>
        <span class="fe-cards-heading__rule" />
        <span>3D Card Universe</span>
      </p>
      <h2 class="fe-cards-heading__title" data-reveal>卡片宇宙</h2>
      <p class="fe-cards-heading__text" data-reveal>
        {{ visible ? '卡片已飞向镜头 · Esc 关闭' : '拖动旋转 · 悬停放大 · 点击任意卡片展开作品信息' }}
      </p>
    </div>

    <Transition name="panel">
      <div v-show="visible" class="pointer-events-none fixed inset-0 z-30 flex items-center justify-end px-6 md:px-14">
        <article
          ref="panel"
          class="fe-glass pointer-events-auto w-[min(28rem,calc(100vw-3rem))] overflow-hidden rounded-3xl"
          data-ui
          role="dialog"
          aria-modal="false"
          :aria-label="title"
        >
          <header class="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <span class="font-mono text-[10px] tracking-[0.34em] text-ink-dim uppercase">Glass Information Card</span>
            <button
              class="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-sm text-ink-dim transition hover:border-white/40 hover:text-ink"
              aria-label="关闭"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="px-6 pt-6 pb-7" :class="ready ? 'is-ready' : ''">
            <h3 class="text-3xl leading-tight font-semibold tracking-tight">{{ title }}</h3>
            <p class="mt-3 text-[15px] leading-relaxed text-ink/85 italic">“{{ quote }}”</p>

            <dl class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10">
              <div class="bg-white/4 px-4 py-3">
                <dt class="font-mono text-[9px] tracking-[0.26em] text-ink-dim uppercase">Date</dt>
                <dd class="mt-1 font-mono text-sm">{{ card?.date }}</dd>
              </div>
              <div class="bg-white/4 px-4 py-3">
                <dt class="font-mono text-[9px] tracking-[0.26em] text-ink-dim uppercase">Location</dt>
                <dd class="mt-1 text-sm">{{ location }}</dd>
              </div>
            </dl>

            <ul class="mt-5 flex flex-wrap gap-2">
              <li
                v-for="tag in card?.tags ?? []"
                :key="tag"
                class="rounded-full border border-white/12 bg-white/5 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-ink-dim uppercase"
              >
                {{ tag }}
              </li>
            </ul>

            <div class="mt-6 flex items-center gap-3">
              <button
                class="flex-1 rounded-full bg-white py-3 text-sm font-medium text-void transition hover:shadow-[0_0_36px_-6px_#fff]"
                @click="close"
              >
                返回球体
              </button>
              <button
                class="rounded-full border border-white/15 px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-ink-dim uppercase transition hover:border-white/40 hover:text-ink"
                :aria-pressed="lang === 'zh'"
                @click="lang = lang === 'en' ? 'zh' : 'en'"
              >
                {{ lang === 'en' ? '中文' : 'EN' }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </Transition>

    <span class="sr-only">Section {{ index + 1 }}: 3D Card Universe</span>
  </div>
</template>

<style scoped>
.fe-cards-heading {
  max-width: 30rem;
}

.fe-cards-heading__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-ink-dim);
}

.fe-cards-heading__rule {
  height: 1px;
  width: 2rem;
  background: linear-gradient(90deg, #d8b26a, transparent);
}

.fe-cards-heading__title {
  margin-top: 1.25rem;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.fe-cards-heading__text {
  margin-top: 1rem;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-ink-dim);
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
  animation: fe-panel 0.5s var(--ease-out-expo) both;
}

@keyframes fe-panel {
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
