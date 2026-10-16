<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { isTouchDevice } from '@/shared/utils/device'

const store = useAppStore()
const dot = ref<HTMLElement>()
const ring = ref<HTMLElement>()

let raf = 0
let targetX = 0
let targetY = 0
let ringX = 0
let ringY = 0
let visible = false

function onMove(event: PointerEvent) {
  targetX = event.clientX
  targetY = event.clientY
  if (!visible) {
    visible = true
    ringX = targetX
    ringY = targetY
    document.body.classList.add('cursor-hidden')
  }
  const interactive = (event.target as HTMLElement | null)?.closest('a, button, [data-cursor]')
  ring.value?.classList.toggle('is-active', Boolean(interactive))
}

function onLeave() {
  visible = false
  document.body.classList.remove('cursor-hidden')
}

function onDown() {
  ring.value?.classList.add('is-down')
}

function onUp() {
  ring.value?.classList.remove('is-down')
}

function tick() {
  raf = requestAnimationFrame(tick)
  if (!visible) return
  ringX += (targetX - ringX) * 0.18
  ringY += (targetY - ringY) * 0.18
  if (dot.value) dot.value.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`
  if (ring.value) ring.value.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
}

onMounted(() => {
  if (isTouchDevice() || !store.settings.cursorFx) return
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('pointerup', onUp)
  document.removeEventListener('pointerleave', onLeave)
  document.body.classList.remove('cursor-hidden')
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-999 hidden md:block">
    <span
      ref="ring"
      class="cursor-ring absolute top-0 left-0 h-10 w-10 rounded-full border border-white/45 transition-[width,height,border-color,background-color] duration-300"
    />
    <span ref="dot" class="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_#fff]" />
  </div>
</template>

<style scoped>
/* mix-blend-mode: difference 让光标在深色/浅色站点上都保持可见 */
.cursor-ring,
.cursor-ring + span {
  mix-blend-mode: difference;
}

.cursor-ring.is-active {
  width: 62px;
  height: 62px;
  border-color: color-mix(in oklab, var(--color-aurora) 85%, transparent);
  background: color-mix(in oklab, var(--color-aurora) 12%, transparent);
}

.cursor-ring.is-down {
  width: 26px;
  height: 26px;
}
</style>
