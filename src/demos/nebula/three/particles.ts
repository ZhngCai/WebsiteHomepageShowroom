import * as THREE from 'three'
import { NEBULA_PARTICLE_FRAG, NEBULA_PARTICLE_VERT } from './shaders/nebula'

/**
 * 星云粒子系统 —— 单次 draw call 承载上万粒子。
 * 聚合（morph）、速度（speed）、视差（pointer）全部在 GPU 完成，CPU 每帧只更新 uniform。
 */
export function createNebulaParticles(count: number) {
  const positions = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // 形态：三条旋臂构成的扁平星云盘 + 球状晕
    const halo = Math.random() < 0.18
    const radius = halo ? 34 + Math.pow(Math.random(), 0.5) * 96 : Math.pow(Math.random(), 0.75) * 118
    const arm = Math.floor(Math.random() * 3)
    const angle = Math.random() * Math.PI * 2 + (arm * Math.PI * 2) / 3 + radius * 0.018
    const thickness = halo ? 82 : 5 + radius * 0.08

    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.82
    positions[i * 3 + 2] = (Math.random() - 0.5) * thickness

    // 初始散点：远处球壳，进入时向中心聚合
    const shell = 480 + Math.random() * 900
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    scatter[i * 3] = shell * Math.sin(phi) * Math.cos(theta)
    scatter[i * 3 + 1] = shell * Math.cos(phi) * 0.8
    scatter[i * 3 + 2] = shell * Math.sin(phi) * Math.sin(theta)

    seeds[i] = Math.random()
    sizes[i] = 0.45 + Math.random() * 1.2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1500)

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uSpeed: { value: 0.6 },
    uOpacity: { value: 1 },
    uScale: { value: window.innerHeight * 0.5 },
    uSize: { value: 1.05 },
    uPointer: { value: new THREE.Vector2() },
    uColorA: { value: new THREE.Color('#e8f2ff') },
    uColorB: { value: new THREE.Color('#7c5cff') },
    uColorC: { value: new THREE.Color('#2ee6ff') },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader: NEBULA_PARTICLE_VERT,
    fragmentShader: NEBULA_PARTICLE_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const object = new THREE.Points(geometry, material)
  object.frustumCulled = false

  return {
    object,
    uniforms,
    update(time: number, speed: number, pointer: THREE.Vector2, opacity = 1) {
      uniforms.uTime.value = time
      uniforms.uSpeed.value = speed
      uniforms.uOpacity.value = opacity
      uniforms.uPointer.value.copy(pointer)
    },
    resize(height: number) {
      uniforms.uScale.value = height * 0.5
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
