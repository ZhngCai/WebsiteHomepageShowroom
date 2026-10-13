import * as THREE from 'three'

/** 世界之间的空间间隔（沿 -Z 排列，滚动 = 前进） */
export const WORLD_GAP = 640

export function worldZ(index: number) {
  return -index * WORLD_GAP
}

export function createScene() {
  const scene = new THREE.Scene()
  scene.background = null
  // 指数雾保证远处世界自然淡出，同时避免出现“凭空出现”的物体
  scene.fog = new THREE.FogExp2(new THREE.Color('#04050a').getHex(), 0.0022)
  return scene
}
