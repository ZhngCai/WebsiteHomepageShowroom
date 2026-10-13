import { shallowRef, type InjectionKey, type ShallowRef } from 'vue'

/** 滚动容器根元素 —— 由 ScrollContainer 挂载后回填，MainScene 据此创建 ScrollManager */
export const scrollRootKey: InjectionKey<ShallowRef<HTMLElement | null>> = Symbol('nebula:scroll-root')

export const sectionList = [
  { id: 'nebula', label: 'Nebula' },
  { id: 'time-warp', label: 'Time Warp' },
  { id: 'card-universe', label: 'Card Universe' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'ai-universe', label: 'AI Universe' },
  { id: 'singularity', label: 'Singularity' },
]
