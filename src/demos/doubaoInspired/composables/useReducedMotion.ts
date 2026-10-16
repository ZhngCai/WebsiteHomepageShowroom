import { useMediaQuery } from './useMediaQuery'

/**
 * 是否偏好减弱动效。
 * 为 true 时各 Section 动画只保留最基础的淡入，关闭视差 / 3D / 粒子。
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
