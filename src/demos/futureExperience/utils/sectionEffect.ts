import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ScrollTrigger } from './scroll'

export type SectionEffectCleanup = (() => void) | void

/**
 * Section 效果统一生命周期：
 * 挂载 → 执行效果（返回清理函数）→ 刷新 ScrollTrigger；卸载 → 清理。
 *
 * 每个 Section 拥有完全独立的滚动效果，但共享同一套生命周期约定。
 */
export function useSectionEffect(setup: (root: HTMLElement) => SectionEffectCleanup) {
  const root = ref<HTMLElement>()
  let cleanup: SectionEffectCleanup

  onMounted(() => {
    if (!root.value) return

    try {
      cleanup = setup(root.value)
    } catch (error) {
      console.error('[future] Section 效果初始化失败:', error)
    }

    // 效果可能改变布局（pin / 固定高度），刷新一次让所有 ScrollTrigger 重新计算
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => {
    if (typeof cleanup === 'function') cleanup()
    cleanup = undefined
  })

  return root
}
