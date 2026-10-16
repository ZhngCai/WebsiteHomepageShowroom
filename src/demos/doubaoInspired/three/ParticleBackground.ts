import * as THREE from 'three'
import { createRadialGlowTexture } from '@/shared/three/textures'

/**
 * 音乐模块的轻量粒子场 —— 一个由点云构成的圆环。
 * 滚动驱动旋转与扩张；离开时由 SceneManager 统一 dispose。
 */
export function createParticleRing(count = 900, radius = 15) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const thickness = (Math.random() - 0.5) * 1.6
    const r = radius + (Math.random() - 0.5) * 0.9

    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = Math.sin(angle) * r
    positions[i * 3 + 2] = thickness
    seeds[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const material = new THREE.PointsMaterial({
    size: 0.34,
    map: createRadialGlowTexture('#5b7cfa', 64),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false

  return {
    object: points,
    update(time: number, progress: number) {
      points.rotation.z = time * 0.06 + progress * Math.PI * 0.6
      const scale = 1 + progress * 0.22
      points.scale.set(scale, scale, 1)
      material.opacity = 0.35 + progress * 0.5
    },
  }
}
