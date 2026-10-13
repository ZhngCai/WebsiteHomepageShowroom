import * as THREE from 'three'

/**
 * 相机装配（Rig）—— 所有镜头运动都由 GSAP 时间轴改写这些纯数值，
 * 每帧再应用到 THREE 相机上，避免直接 tween 三维对象导致的抖动与耦合。
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

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 4000)
  camera.position.set(0, 0, 50)
  camera.lookAt(0, 0, 0)
  return camera
}

export function createCameraRig(): CameraRig {
  return { x: 0, y: 0, z: 50, tx: 0, ty: 0, tz: 0, fov: 62, roll: 0 }
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
