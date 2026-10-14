import * as THREE from 'three'
import type { QualityProfile } from '@/shared/utils/device'

/** 每帧注入世界的上下文 */
export interface FrameContext {
  time: number
  delta: number
  camera: THREE.PerspectiveCamera
  /** 归一化指针（-1 ~ 1），已平滑 */
  pointer: THREE.Vector2
  /** 当前 Section 的滚动进度 0 ~ 1 */
  progress: number
  /** 全局滚动进度 0 ~ 1 */
  globalProgress: number
  /** 归一化滚动速度（用于速度感应类动效） */
  velocity: number
  quality: QualityProfile
  active: boolean
}

/** 世界（3D 章节）—— 独立 group、独立生命周期、独立销毁 */
export interface World {
  readonly id: string
  readonly index: number
  readonly group: THREE.Group
  build(): void
  enter(): void
  leave(): void
  update(ctx: FrameContext): void
  setProgress(progress: number): void
  resize(width: number, height: number): void
  dispose(): void
}

export abstract class BaseWorld implements World {
  abstract readonly id: string
  abstract readonly index: number

  readonly group = new THREE.Group()

  private built = false

  build() {
    if (this.built) return
    this.built = true
    try {
      this.onBuild()
    } catch (error) {
      console.error(`[world:${this.id}] 构建失败:`, error)
    }
  }

  enter() {
    this.onEnter()
  }

  leave() {
    this.onLeave()
  }

  setProgress(_progress: number) {}

  update(_ctx: FrameContext) {}

  resize(_width: number, _height: number) {}

  dispose() {
    disposeObject(this.group)
    this.group.clear()
    this.built = false
  }

  protected abstract onBuild(): void
  protected onEnter() {}
  protected onLeave() {}
}

/**
 * 相机在本章节内的「穿越结束点」——之后开始飞向下一世界。
 * 注意：这是相机行为，不要与「世界退场透明度」混用。
 */
export const TRAVEL_START = 0.62

/**
 * 世界退场窗口：本节最后 15% 才淡出。
 * 若沿用相机的 0.62 起点，场景会在章节还剩三分之一时就淡掉、
 * 章节末尾整场消失（卡片宇宙 / AI 意识空间都踩过这个坑）。
 */
export const EXIT_START = 0.85
export const EXIT_END = 1

export function exitFade(progress: number) {
  const t = Math.min(1, Math.max(0, (progress - EXIT_START) / (EXIT_END - EXIT_START)))
  return 1 - t * t * (3 - 2 * t)
}

/** 批量透明度句柄：收集子树中的内置材质，统一按比例缩放原始 opacity */
export function createFadeGroup(root: THREE.Object3D) {
  const entries: { material: THREE.Material & { opacity: number }; base: number }[] = []

  root.traverse((node) => {
    const material = (node as THREE.Mesh).material
    if (!material || Array.isArray(material)) return
    if ((material as THREE.ShaderMaterial).isShaderMaterial) return

    const opacity = (material as { opacity?: number }).opacity
    if (typeof opacity !== 'number') return

    entries.push({ material: material as THREE.Material & { opacity: number }, base: opacity })
  })

  return {
    set(scale: number) {
      for (const entry of entries) entry.material.opacity = entry.base * scale
    },
  }
}

/** 递归释放整棵子树的 geometry / material / texture */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((node) => {
    const geometry = (node as THREE.Mesh).geometry
    if (geometry) geometry.dispose()

    const material = (node as unknown as { material?: THREE.Material | THREE.Material[] }).material
    if (!material) return

    for (const item of Array.isArray(material) ? material : [material]) {
      const uniforms = (item as THREE.ShaderMaterial).uniforms
      if (uniforms) {
        for (const uniform of Object.values(uniforms)) {
          const value = uniform?.value as THREE.Texture | undefined
          if (value?.isTexture) value.dispose()
        }
      }

      for (const value of Object.values(item as unknown as Record<string, unknown>)) {
        if (value && typeof value === 'object' && (value as THREE.Texture).isTexture) {
          ;(value as THREE.Texture).dispose()
        }
      }
      item.dispose()
    }
  })
}
