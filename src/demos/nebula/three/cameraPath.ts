import type { CameraRig } from './camera'
import { worldZ } from './scene'

/**
 * 六段镜头脚本：每个世界给出「到达机位」与「穿越结束机位」，
 * 段落之间由 ScrollManager 自动补出飞行过渡。
 */
export interface WorldCameraPlan {
  arrival: CameraRig
  explore: CameraRig
}

function rig(state: Partial<CameraRig>): CameraRig {
  return { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: -100, fov: 62, roll: 0, ...state }
}

export const cameraPlans: WorldCameraPlan[] = [
  // 01 星云入口：z 50 → -60，穿越粒子云，视角随速度放大
  {
    arrival: rig({ z: 50, tz: worldZ(0) - 60, fov: 62 }),
    explore: rig({ z: -60, tz: worldZ(0) - 180, fov: 74 }),
  },
  // 02 时间折叠：绕时间环做 360° 空间旋转
  {
    arrival: rig({ y: 8, z: worldZ(1) + 200, tz: worldZ(1), fov: 60 }),
    explore: rig({ x: -212, y: 104, z: worldZ(1) + 152, tz: worldZ(1), fov: 56, roll: 0.07 }),
  },
  // 03 卡片星球：由远及近 zoom in，卡片随后散开
  {
    arrival: rig({ z: worldZ(2) + 100, tz: worldZ(2), fov: 58 }),
    explore: rig({ z: worldZ(2) + 46, tz: worldZ(2), fov: 48 }),
  },
  // 04 无限画廊：滚动即前进，穿过整条图片长廊
  {
    arrival: rig({ z: worldZ(3) + 60, tz: worldZ(3) - 380, fov: 66 }),
    explore: rig({ z: worldZ(3) - 560, tz: worldZ(3) - 980, fov: 80 }),
  },
  // 05 AI 宇宙：进入神经网络内部
  {
    arrival: rig({ z: worldZ(4) + 160, tz: worldZ(4), fov: 62 }),
    explore: rig({ z: worldZ(4) + 10, tz: worldZ(4) - 120, fov: 84 }),
  },
  // 06 奇点：逼近光球 → 爆炸
  {
    arrival: rig({ z: worldZ(5) + 160, tz: worldZ(5), fov: 62 }),
    explore: rig({ z: worldZ(5) + 52, tz: worldZ(5), fov: 44 }),
  },
]
