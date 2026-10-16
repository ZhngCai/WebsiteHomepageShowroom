import { onBeforeUnmount, ref } from 'vue'

/**
 * 媒体查询（响应式 / 能力探测）
 * 监听器在卸载时移除，避免重复进入 Demo 后残留。
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  if (typeof window === 'undefined') return matches

  const mql = window.matchMedia(query)
  matches.value = mql.matches

  const onChange = (event: MediaQueryListEvent) => (matches.value = event.matches)
  mql.addEventListener('change', onChange)

  onBeforeUnmount(() => mql.removeEventListener('change', onChange))

  return matches
}
