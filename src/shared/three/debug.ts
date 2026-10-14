import type * as THREE from 'three'

/**
 * 开发环境调试句柄（生产构建会被 tree-shake 掉）。
 * 多个 Demo 共用同一份全局声明，避免 Window 属性类型冲突。
 */
export interface ExperienceDebug {
  camera: THREE.PerspectiveCamera
  rig: { x: number; y: number; z: number; fov: number; roll: number }
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  active: () => number
  worlds: () => { id: string; index: number; visible: boolean }[]
  /** 世界实例（仅用于调试读取内部状态） */
  instances?: () => unknown[]
}

declare global {
  interface Window {
    __nebula?: ExperienceDebug
  }
}
