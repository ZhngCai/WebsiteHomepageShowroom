import * as THREE from 'three'
import type { QualityProfile } from '@/shared/utils/device'

/** 每帧注入世界（World）的上下文 */
export interface FrameContext {
  time: number
  delta: number
  camera: THREE.PerspectiveCamera
  /** 归一化指针（-1 ~ 1），已做平滑 */
  pointer: THREE.Vector2
  /** 当前 section 的滚动进度 0 ~ 1 */
  progress: number
  /** 全局滚动进度 0 ~ 1 */
  globalProgress: number
  quality: QualityProfile
  /** 是否为当前激活世界 */
  active: boolean
}

/**
 * 世界（World）—— 六屏中的每一屏都是独立世界，
 * 拥有自己的 group、生命周期与销毁逻辑，互不引用。
 */
export interface World {
  readonly id: string
  readonly index: number
  readonly group: THREE.Group
  /** 首次进入视野时构建（延迟加载重资源） */
  build(): void
  /** 成为激活世界 */
  enter(): void
  /** 离开激活世界 */
  leave(): void
  /** 每帧更新 */
  update(ctx: FrameContext): void
  /** 该 section 的滚动进度 0 ~ 1 */
  setProgress(progress: number): void
  /** 视口尺寸变化 */
  resize(width: number, height: number): void
  /** 释放 geometry / material / texture */
  dispose(): void
}

/** 世界基类：统一 group 管理、构建开关与资源销毁 */
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

/** 递归释放整棵子树的 geometry / material / texture */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((node) => {
    const geometry = (node as THREE.Mesh).geometry
    if (geometry) geometry.dispose()

    const material = (node as unknown as { material?: THREE.Material | THREE.Material[] }).material
    if (!material) return

    for (const item of Array.isArray(material) ? material : [material]) {
      for (const value of Object.values(item as unknown as Record<string, unknown>)) {
        if (value && typeof value === 'object' && (value as THREE.Texture).isTexture) {
          ;(value as THREE.Texture).dispose()
        }
      }
      item.dispose()
    }
  })
}
