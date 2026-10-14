import * as THREE from 'three'
import gsap from 'gsap'
import { createRadialGlowTexture, createTitleTexture } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { HERO_DUST_FRAG, HERO_DUST_VERT, HERO_TITLE_FRAG, HERO_TITLE_VERT } from '../../shaders/hero'
import { BaseWorld, exitFade, type FrameContext } from '../World'

const TITLE_Z = -96
const TITLE_WIDTH = 132

/**
 * 01 Cosmic Hero —— 粒子星云 + 巨大 3D 文字。
 * 进入：粒子从四周聚合、文字自远处浮现；滚动：相机向前推进，穿越星云。
 */
export class HeroWorld extends BaseWorld {
  readonly id = 'hero'
  readonly index = 0

  private readonly quality: QualityProfile
  private dust: ReturnType<typeof createHeroDust> | null = null
  private title: THREE.Group | null = null
  private titleMaterial: THREE.ShaderMaterial | null = null
  private halo: THREE.Sprite | null = null

  private appear = 0
  private titleIn = 0
  private exit = 1
  private progress = 0

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.buildDust()
    this.buildTitle()
  }

  protected onEnter() {
    if (this.dust) {
      gsap.to(this.dust.uniforms.uMorph, { value: 1, duration: 2.8, delay: 0.5, ease: 'power2.out', overwrite: true })
    }
    // 注意：同一目标上的多个补间必须用 overwrite:'auto'，
    // 否则 overwrite:true 会杀掉同目标的其它属性补间（appear 会被中断在 0）。
    gsap.to(this, { appear: 1, duration: 1.6, delay: 0.2, ease: 'power2.out', overwrite: 'auto' })
    gsap.to(this, { titleIn: 1, duration: 2.1, delay: 0.9, ease: 'power3.out', overwrite: 'auto' })
  }

  setProgress(progress: number) {
    this.progress = progress
  }

  update(ctx: FrameContext) {
    this.exit = exitFade(this.progress)
    const opacity = this.appear * this.exit

    // 滚动速度变化：静止 0.6 → 穿越 3.2
    this.dust?.update(ctx.time, 0.6 + this.progress * 2.6, ctx.pointer, opacity)
    if (this.dust) this.dust.object.rotation.z = ctx.time * 0.01

    if (this.title) {
      // 文字随进度后退，与相机推进形成纵深
      this.title.position.z = TITLE_Z + this.progress * 30
      this.title.position.y = this.progress * 7
      this.title.position.x = ctx.pointer.x * 3.4
      this.title.rotation.y = ctx.pointer.x * 0.05
      this.title.rotation.x = -ctx.pointer.y * 0.03

      const scale = 0.82 + this.titleIn * 0.18
      this.title.scale.setScalar(scale)
    }

    if (this.titleMaterial) {
      this.titleMaterial.uniforms.uTime.value = ctx.time
      this.titleMaterial.uniforms.uOpacity.value = this.titleIn * this.exit
    }

    if (this.halo) {
      this.halo.scale.setScalar(210 + Math.sin(ctx.time * 0.6) * 8)
      ;(this.halo.material as THREE.SpriteMaterial).opacity = this.titleIn * this.exit * 0.28
    }
  }

  resize(_width: number, height: number) {
    this.dust?.resize(height)
  }

  private buildDust() {
    this.dust = createHeroDust(this.quality.heroParticles)
    this.group.add(this.dust.object)
  }

  private buildTitle() {
    const { texture, aspect } = createTitleTexture(['AETHER'], {
      color: '#f6f2e8',
      accent: '#d8b26a',
      letterSpacing: '0.16em',
      fontSize: 560,
    })

    const material = new THREE.ShaderMaterial({
      vertexShader: HERO_TITLE_VERT,
      fragmentShader: HERO_TITLE_FRAG,
      uniforms: {
        uMap: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uGlow: { value: new THREE.Color('#d8b26a') },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.titleMaterial = material

    const group = new THREE.Group()
    const height = TITLE_WIDTH / aspect

    // 主平面 + 两层错位副本 → 廉价但有效的“立体文字”厚度
    group.add(new THREE.Mesh(new THREE.PlaneGeometry(TITLE_WIDTH, height), material))

    for (const offset of [-0.9, 0.9]) {
      const ghostMaterial = new THREE.ShaderMaterial({
        vertexShader: HERO_TITLE_VERT,
        fragmentShader: HERO_TITLE_FRAG,
        uniforms: {
          uMap: { value: texture },
          uTime: { value: 0 },
          uOpacity: { value: 0.2 },
          uGlow: { value: new THREE.Color('#9fd8ff') },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      })

      const ghost = new THREE.Mesh(new THREE.PlaneGeometry(TITLE_WIDTH, height), ghostMaterial)
      ghost.position.set(0, offset * 0.35, offset)
      group.add(ghost)
    }

    group.position.z = TITLE_Z
    group.scale.setScalar(0.82)
    this.title = group
    this.group.add(group)

    // 文字背后的辉光
    this.halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#d8b26a', 256),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.halo.position.set(0, 0, TITLE_Z - 14)
    this.halo.scale.setScalar(210)
    this.group.add(this.halo)
  }
}

/**
 * 星尘粒子系统 —— 单次 draw call 承载上万粒子。
 * 聚合（morph）、速度（speed）、视差（pointer）全部在 GPU 完成。
 */
function createHeroDust(count: number) {
  const positions = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // 形态：三条旋臂的扁盘星云 + 球状晕
    const halo = Math.random() < 0.2
    const radius = halo ? 40 + Math.pow(Math.random(), 0.5) * 130 : Math.pow(Math.random(), 0.72) * 168
    const arm = Math.floor(Math.random() * 3)
    const angle = Math.random() * Math.PI * 2 + (arm * Math.PI * 2) / 3 + radius * 0.016
    const thickness = halo ? 110 : 8 + radius * 0.1

    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.84
    positions[i * 3 + 2] = (Math.random() - 0.5) * thickness

    // 初始散点：远处球壳，进入时向中心聚合
    const shell = 560 + Math.random() * 900
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    scatter[i * 3] = shell * Math.sin(phi) * Math.cos(theta)
    scatter[i * 3 + 1] = shell * Math.cos(phi) * 0.8
    scatter[i * 3 + 2] = shell * Math.sin(phi) * Math.sin(theta)

    seeds[i] = Math.random()
    sizes[i] = 0.5 + Math.random() * 1.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1800)

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uSpeed: { value: 0.6 },
    uOpacity: { value: 1 },
    uScale: { value: window.innerHeight * 0.5 },
    uSize: { value: 1.15 },
    uPointer: { value: new THREE.Vector2() },
    uColorCore: { value: new THREE.Color('#f6f2e8') },
    uColorIce: { value: new THREE.Color('#9fd8ff') },
    uColorGold: { value: new THREE.Color('#d8b26a') },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader: HERO_DUST_VERT,
    fragmentShader: HERO_DUST_FRAG,
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
  }
}
