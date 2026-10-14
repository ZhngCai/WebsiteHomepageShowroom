import * as THREE from 'three'

/**
 * 相机装配（Rig）—— 所有镜头运动都由 GSAP 时间轴改写这些纯数值，
 * 每帧再应用到 THREE 相机上，避免直接 tween 三维对象带来的抖动与耦合。
 */
export interface CameraRig {
  x: number
  y: number
  z: number
  tx: number
  ty: number
  tz: number
  fov: number
  roll: number
}

/** 一个 3D 章节的机位脚本：到达机位 + 章节内穿越后的机位 */
export interface CameraPlan {
  arrival: CameraRig
  explore: CameraRig
  /** 终章专用：最后一段滚动继续推进 */
  finale?: CameraRig
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 6000)
  camera.position.set(0, 0, 60)
  camera.lookAt(0, 0, 0)
  return camera
}

export function createCameraRig(): CameraRig {
  return { x: 0, y: 0, z: 60, tx: 0, ty: 0, tz: 0, fov: 58, roll: 0 }
}

export function rig(state: Partial<CameraRig>): CameraRig {
  return { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: -100, fov: 58, roll: 0, ...state }
}

const lookTarget = new THREE.Vector3()

export function applyCameraRig(camera: THREE.PerspectiveCamera, rig: CameraRig, parallaxX = 0, parallaxY = 0) {
  camera.position.set(rig.x + parallaxX, rig.y + parallaxY, rig.z)
  lookTarget.set(rig.tx + parallaxX * 1.6, rig.ty + parallaxY * 1.6, rig.tz)
  camera.lookAt(lookTarget)

  if (rig.roll !== 0) camera.rotateZ(rig.roll)

  if (Math.abs(camera.fov - rig.fov) > 0.01) {
    camera.fov = rig.fov
    camera.updateProjectionMatrix()
  }
}

/** 世界之间的空间间隔（沿 -Z 排列，滚动 = 前进） */
export const WORLD_GAP = 1100

export function worldZ(index: number) {
  return -index * WORLD_GAP
}

/**
 * 五个 3D 章节的镜头脚本 —— 每个世界给出「到达机位」与「穿越机位」，
 * 段落之间的飞行过渡由 ScrollManager 依据真实滚动距离自动补出。
 */
export const cameraPlans: CameraPlan[] = [
  // 01 Cosmic Hero：在粒子星云中向前推进，穿过 3D 文字
  {
    arrival: rig({ z: 90, tz: -80, fov: 58 }),
    explore: rig({ z: -50, tz: -240, fov: 70 }),
  },
  // 02 Card Universe：由远及近 zoom in，卡片随后散开
  {
    arrival: rig({ z: worldZ(1) + 165, tz: worldZ(1), fov: 56 }),
    explore: rig({ z: worldZ(1) + 58, tz: worldZ(1), fov: 46 }),
  },
  // 03 AI Neural World：从网络外部推进到内部
  {
    arrival: rig({ z: worldZ(2) + 300, tz: worldZ(2), fov: 58 }),
    explore: rig({ z: worldZ(2) + 84, tz: worldZ(2) - 70, fov: 72 }),
  },
  // 04 Floating Objects：侧向游走，像在展览馆中穿行
  {
    arrival: rig({ z: worldZ(3) + 230, tz: worldZ(3), fov: 56 }),
    explore: rig({ x: -118, y: 42, z: worldZ(3) + 60, tz: worldZ(3), fov: 62, roll: 0.03 }),
  },
  // 05 Singularity Ending：逼近能量球 → 爆炸
  {
    arrival: rig({ z: worldZ(4) + 230, tz: worldZ(4), fov: 56 }),
    explore: rig({ z: worldZ(4) + 74, tz: worldZ(4), fov: 48 }),
    finale: rig({ z: worldZ(4) + 34, tz: worldZ(4), fov: 40 }),
  },
]
