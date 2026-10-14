import { shallowRef, type InjectionKey, type ShallowRef } from 'vue'

/** 滚动容器根元素 —— 由 ScrollContainer 挂载后回填，MainScene 据此创建 ScrollManager */
export const scrollRootKey: InjectionKey<ShallowRef<HTMLElement | null>> = Symbol('future:scroll-root')

/**
 * 八个 Section —— 4 个全屏 + 4 个非全屏（按内容高度）。
 * world 字段指向 three/worlds 中的 3D 世界；null 表示纯 DOM 章节。
 */
export interface SectionMeta {
  id: string
  label: string
  world: number | null
}

export const sectionList: SectionMeta[] = [
  { id: 'hero', label: 'Hero', world: 0 },
  { id: 'story', label: 'Story', world: null },
  { id: 'cards', label: 'Card Universe', world: 1 },
  { id: 'gallery', label: 'Gallery', world: null },
  { id: 'ai', label: 'AI Neural', world: 2 },
  { id: 'timeline', label: 'Timeline', world: null },
  { id: 'floating', label: 'Objects', world: 3 },
  { id: 'ending', label: 'Ending', world: 4 },
]

export const worldSectionIndices = sectionList
  .map((meta, index) => (meta.world === null ? -1 : index))
  .filter((index) => index >= 0)
