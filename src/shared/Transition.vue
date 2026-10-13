<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const veil = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const offBefore = router.beforeEach(() => {
  veil.value = true
})

const offAfter = router.afterEach(() => {
  clearTimeout(timer)
  timer = setTimeout(() => (veil.value = false), 420)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  offBefore()
  offAfter()
})
</script>

<template>
  <div class="relative min-h-screen">
    <Transition name="route" mode="out-in">
      <slot />
    </Transition>

    <Transition name="veil">
      <div v-if="veil" class="route-veil pointer-events-none fixed inset-0 z-800" />
    </Transition>
  </div>
</template>

<style scoped>
.route-veil {
  background:
    radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--color-nebula) 26%, transparent) 0%, transparent 70%),
    var(--color-void);
  mix-blend-mode: screen;
}

.veil-enter-active {
  transition: opacity 0.28s ease-out;
}

.veil-leave-active {
  transition: opacity 0.5s var(--ease-out-expo);
}

.veil-enter-from,
.veil-leave-to {
  opacity: 0;
}
</style>
