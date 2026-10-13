import * as THREE from 'three'
import gsap from 'gsap'
import { createRadialGlowTexture } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../scene'
import {
  ORB_FRAG,
  ORB_VERT,
  SINGULARITY_PARTICLE_FRAG,
  SINGULARITY_PARTICLE_VERT,
} from '../shaders/singularity'
import { BaseWorld, type FrameContext } from '../World'
import { emitSingularityBurst } from '../../utils/events'

const ORB_RADIUS = 10
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const BURST_AT = 0.74

/**
 * 06 奇点 —— 星云粒子 / 卡片星球 / 数据节点在此聚合为巨大光球，
 * 逼近后炸开，屏幕闪白，交出「ENTER THE FUTURE」。
 */
export class SingularityWorld extends BaseWorld {
  readonly id = 'singularity'
  readonly index = 5

  private readonly quality: QualityProfile
  private particles: THREE.Points | null = null
  private orb: THREE.Mesh | null = null
  private glow: THREE.Sprite | null = null
  private core: THREE.Sprite | null = null
  private orbMaterial: THREE.ShaderMaterial | null = null
  private particleMaterial: THREE.ShaderMaterial | null = null
  private appear = 0
  private progress = 0
  private burst = 0
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
    gsap.to(this, { appear: 1, duration: 1.4, ease: 'power2.out', overwrite: true })
  }

  // 离开时保持形态：光球与粒子由着色器的距离淡出接管。

  setProgress(progress: number) {
    this.progress = progress

    if (progress >= BURST_AT && !this.burstFired) {
      this.burstFired = true
      this.shake = 1
      emitSingularityBurst()
    } else if (progress < BURST_AT - 0.12) {
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

    // 光球：随聚合收紧，爆炸瞬间外扩并迅速熄灭
    const orbScale = THREE.MathUtils.lerp(44, ORB_RADIUS, morph) + burst * 18
    if (this.orb) {
      this.orb.scale.setScalar(orbScale)
      this.orb.rotation.y = ctx.time * 0.16
      this.orb.rotation.x = Math.sin(ctx.time * 0.2) * 0.12
    }

    if (this.orbMaterial) {
      this.orbMaterial.uniforms.uTime.value = ctx.time
      this.orbMaterial.uniforms.uIntensity.value =
        (0.25 + morph * 1.35) * (1 - burst * 0.9) * Math.max(0.2, this.appear)
    }

    if (this.glow) {
      this.glow.scale.setScalar(lerp(180, 120, morph) + burst * 70)
      ;(this.glow.material as THREE.SpriteMaterial).opacity =
        (0.1 + morph * 0.34) * (1 - burst * 0.75) * this.appear
    }

    if (this.core) {
      this.core.scale.setScalar(lerp(40, 22, morph) + burst * 26)
      ;(this.core.material as THREE.SpriteMaterial).opacity = (0.2 + morph * 0.6) * (1 - burst * 0.8)
    }

    // 爆炸余震：在 SceneManager 应用机位之后叠加相机抖动
    if (this.shake > 0.001) {
      this.shake = Math.max(0, this.shake - ctx.delta * 1.6)
      const amp = this.shake * this.shake * 2.6
      ctx.camera.position.x += (Math.random() - 0.5) * amp
      ctx.camera.position.y += (Math.random() - 0.5) * amp
      ctx.camera.rotateZ((Math.random() - 0.5) * amp * 0.006)
    }
  }

  private buildParticles() {
    const count = this.quality.singularityParticles
    const start = new Float32Array(count * 3)
    const orb = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const kinds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 三类来源：星云粒子 / 卡片星球 / 数据节点
      const kind = i % 5 < 2 ? 0 : i % 5 < 4 ? 1 : 2
      kinds[i] = kind

      const source = kind === 0 ? nebulaSource() : kind === 1 ? cardSource(i, count) : brainSource(i, count)
      start[i * 3] = source.x
      start[i * 3 + 1] = source.y
      start[i * 3 + 2] = source.z

      // 目标：光球表面（略带厚度）
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
        uColorParticle: { value: new THREE.Color('#7c5cff') },
        uColorCard: { value: new THREE.Color('#ff5fa2') },
        uColorNode: { value: new THREE.Color('#2ee6ff') },
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
        uColorA: { value: new THREE.Color('#7c5cff') },
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
        map: createRadialGlowTexture('#a78bfa', 256),
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

  resize(_width: number, height: number) {
    if (this.particleMaterial) this.particleMaterial.uniforms.uScale.value = height * 0.5
  }
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t
}

/** 来源 A：星云旋臂 */
function nebulaSource() {
  const radius = Math.pow(Math.random(), 0.75) * 150
  const arm = Math.floor(Math.random() * 3)
  const angle = Math.random() * Math.PI * 2 + (arm * Math.PI * 2) / 3 + radius * 0.018
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 0.82,
    (Math.random() - 0.5) * 26,
  )
}

/** 来源 B：卡片星球球面 */
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

/** 来源 C：类脑点云 */
function brainSource(index: number, count: number) {
  const y = 1 - (index / Math.max(1, count - 1)) * 2
  const radius = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = GOLDEN * index
  const lobe = 1 + 0.14 * Math.sin(theta * 6) * Math.cos(y * 5)
  const groove = 1 - 0.22 * Math.exp(-Math.pow(Math.cos(theta) * radius / 0.14, 2))
  return new THREE.Vector3(
    Math.cos(theta) * radius * 92 * lobe * groove,
    y * 74 * lobe * groove,
    Math.sin(theta) * radius * 108 * lobe,
  )
}
