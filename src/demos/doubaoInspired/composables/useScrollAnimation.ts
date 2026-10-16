import { onBeforeUnmount, onMounted, ref } from 'vue'

export type AnimationCleanup = (() => void) | void

/**
 * Section 动画统一生命周期：
 * 挂载 → 调用 animations/*.ts 的 init 函数（返回 cleanup）→ 卸载 → cleanup。
 *
 * 所有动画模块都必须返回 cleanup，并在其中 kill ScrollTrigger / timeline、
 * 移除事件监听，避免「重复进入页面后动画叠加」。
 */
export function useScrollAnimation(init: (root: HTMLElement) => AnimationCleanup) {
  const root = ref<HTMLElement>()
  let cleanup: AnimationCleanup

  onMounted(() => {
    if (!root.value) return
    try {
      cleanup = init(root.value)
    } catch (error) {
      console.error('[afl] Section 动画初始化失败:', error)
    }
  })

  onBeforeUnmount(() => {
    if (typeof cleanup === 'function') cleanup()
    cleanup = undefined
  })

  return root
}
