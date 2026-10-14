import * as THREE from 'three'
import gsap from 'gsap'
import { createRadialGlowTexture } from '@/shared/three/textures'
import {
  ORB_FRAG,
  ORB_VERT,
  SINGULARITY_PARTICLE_FRAG,
  SINGULARITY_PARTICLE_VERT,
} from '@/shared/shaders/singularity'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../Camera'
import { BaseWorld, type FrameContext } from '../World'
import { emitEndingBurst } from '../../utils/events'

const ORB_RADIUS = 11
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const BURST_AT = 0.72

/**
 * 05 Singularity Ending —— 前四个章节的元素（星尘 / 卡片 / 神经元 / 漂浮物）
 * 在此聚合为一颗巨大能量球，随后炸开并交出 CREATE THE FUTURE。
 * 粒子与光球着色器与 nebula demo 共用（@/shared/shaders/singularity）。
 */
export class EndingWorld extends BaseWorld {
  readonly id = 'ending'
  readonly index = 4

  private readonly quality: QualityProfile
  private particles: THREE.Points | null = null
  private orb: THREE.Mesh | null = null
  private glow: THREE.Sprite | null = null
  private core: THREE.Sprite | null = null
  private particleMaterial: THREE.ShaderMaterial | null = null
  private orbMaterial: THREE.ShaderMaterial | null = null

  private appear = 0
  private progress = 0
  private burstFired = false
  private shake = 0

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)
    this.buildParticles()
    this.buildOrb()
  }

  protected onEnter() {
    gsap.to(this, { appear: 1, duration: 1.5, ease: 'power2.out', overwrite: 'auto' })
  }

  setProgress(progress: number) {
    this.progress = progress

    if (progress >= BURST_AT && !this.burstFired) {
      this.burstFired = true
      this.shake = 1
      emitEndingBurst()
    } else if (progress < BURST_AT - 0.1) {
      this.burstFired = false
    }
  }

  update(ctx: FrameContext) {
    const morph = Math.min(1, Math.max(0, this.progress)) * this.appear
    const burst = Math.max(0, Math.min(1, (this.progress - BURST_AT) / (1 - BURST_AT))) * this.appear

    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = ctx.time
      this.particleMaterial.uniforms.uMorph.value = morph
      this.particleMaterial.uniforms.uBurst.value = burst
    }

    const orbScale = THREE.MathUtils.lerp(52, ORB_RADIUS, morph) + burst * 20
    if (this.orb) {
      this.orb.scale.setScalar(orbScale)
      this.orb.rotation.y = ctx.time * 0.16
      this.orb.rotation.x = Math.sin(ctx.time * 0.2) * 0.12
    }

    if (this.orbMaterial) {
      this.orbMaterial.uniforms.uTime.value = ctx.time
      this.orbMaterial.uniforms.uIntensity.value = (0.25 + morph * 1.4) * (1 - burst * 0.9) * Math.max(0.2, this.appear)
    }

    if (this.glow) {
      this.glow.scale.setScalar(lerp(200, 128, morph) + burst * 80)
      ;(this.glow.material as THREE.SpriteMaterial).opacity = (0.1 + morph * 0.34) * (1 - burst * 0.75) * this.appear
    }

    if (this.core) {
      this.core.scale.setScalar(lerp(44, 24, morph) + burst * 30)
      ;(this.core.material as THREE.SpriteMaterial).opacity = (0.2 + morph * 0.6) * (1 - burst * 0.8)
    }

    // 爆炸余震：在 SceneManager 应用机位之后叠加相机抖动
    if (this.shake > 0.001) {
      this.shake = Math.max(0, this.shake - ctx.delta * 1.5)
      const amp = this.shake * this.shake * 2.8
      ctx.camera.position.x += (Math.random() - 0.5) * amp
      ctx.camera.position.y += (Math.random() - 0.5) * amp
      ctx.camera.rotateZ((Math.random() - 0.5) * amp * 0.006)
    }
  }

  resize(_width: number, height: number) {
    if (this.particleMaterial) this.particleMaterial.uniforms.uScale.value = height * 0.5
  }

  private buildParticles() {
    const count = this.quality.endingParticles
    const start = new Float32Array(count * 3)
    const orb = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const kinds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 四类来源：星尘 / 卡片球 / 神经元 / 漂浮物
      const kind = i % 4
      kinds[i] = kind

      const source =
        kind === 0 ? dustSource() : kind === 1 ? cardSource(i, count) : kind === 2 ? nodeSource(i, count) : objectSource(i, count)
      start[i * 3] = source.x
      start[i * 3 + 1] = source.y
      start[i * 3 + 2] = source.z

      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = ORB_RADIUS * (0.82 + Math.random() * 0.3)
      orb[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      orb[i * 3 + 1] = radius * Math.cos(phi)
      orb[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      seeds[i] = Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geometry.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    geometry.setAttribute('aOrb', new THREE.BufferAttribute(orb, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.setAttribute('aKind', new THREE.BufferAttribute(kinds, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 900)

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: SINGULARITY_PARTICLE_VERT,
      fragmentShader: SINGULARITY_PARTICLE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uBurst: { value: 0 },
        uScale: { value: window.innerHeight * 0.5 },
        uSize: { value: 2.4 },
        uColorParticle: { value: new THREE.Color('#9fd8ff') },
        uColorCard: { value: new THREE.Color('#d8b26a') },
        uColorNode: { value: new THREE.Color('#7c5cff') },
        uColorFloat: { value: new THREE.Color('#f6f2e8') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.particles = new THREE.Points(geometry, this.particleMaterial)
    this.particles.frustumCulled = false
    this.group.add(this.particles)
  }

  private buildOrb() {
    this.orbMaterial = new THREE.ShaderMaterial({
      vertexShader: ORB_VERT,
      fragmentShader: ORB_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uColorA: { value: new THREE.Color('#9fd8ff') },
        uColorB: { value: new THREE.Color('#ffffff') },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })

    this.orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 5), this.orbMaterial)
    this.group.add(this.orb)

    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#d8b26a', 256),
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.group.add(this.glow)

    this.core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#ffffff', 256),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.group.add(this.core)
  }
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t
}

/** 来源 A：Cosmic Hero 星尘旋臂 */
function dustSource() {
  const radius = Math.pow(Math.random(), 0.72) * 165
  const arm = Math.floor(Math.random() * 3)
  const angle = Math.random() * Math.PI * 2 + (arm * Math.PI * 2) / 3 + radius * 0.016
  return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.84, (Math.random() - 0.5) * 26)
}

/** 来源 B：Card Universe 球面卡片 */
function cardSource(index: number, count: number) {
  const y = 1 - (index / Math.max(1, count - 1)) * 2
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = GOLDEN * index
  const radius = 34 * (0.96 + Math.random() * 0.08)
  return new THREE.Vector3(
    Math.cos(theta) * radiusAtY * radius,
    y * radius,
    Math.sin(theta) * radiusAtY * radius,
  )
}

/** 来源 C：AI 核心环带与外壳 */
function nodeSource(index: number, count: number) {
  const layer = index % 5
  const t = index / Math.max(1, count - 1)

  if (layer <= 2) {
    const ring = layer
    const angle = t * Math.PI * 2 * 3.2 + ring * 1.7
    const radius = 62 + ring * 26
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle * 2 + ring) * (12 + ring * 4), Math.sin(angle) * radius)
  }

  const y = 1 - t * 2
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = GOLDEN * index
  const radius = 148 * (0.9 + Math.random() * 0.18)
  return new THREE.Vector3(Math.cos(theta) * radiusAtY * radius, y * radius * 0.8, Math.sin(theta) * radiusAtY * radius)
}

/** 来源 D：Floating Objects 球壳 */
function objectSource(index: number, count: number) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  const radius = 46 + Math.pow(Math.random(), 0.6) * 150
  const jitter = (index / Math.max(1, count - 1)) * 6
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta) + jitter,
    radius * Math.cos(phi) * 0.72,
    radius * Math.sin(phi) * Math.sin(theta),
  )
}
