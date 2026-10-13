import * as THREE from 'three'
import gsap from 'gsap'
import { createArtTexture, createRadialGlowTexture, createTextTexture } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../scene'
import { TIME_RING_FRAG, TIME_RING_VERT } from '../shaders/timeRing'
import { BaseWorld, createFadeGroup, exitFade, type FrameContext } from '../World'

const RING_RADIUS = 62
const YEARS = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']

/**
 * 02 时间折叠 —— TubeGeometry 时间环 + 沿曲线排列的年份与影像卡片。
 * 滚动时相机绕环飞行，形成穿越时间隧道的体验。
 */
export class TimeWarpWorld extends BaseWorld {
  readonly id = 'time-warp'
  readonly index = 1

  private readonly quality: QualityProfile
  private ring: THREE.Mesh | null = null
  private halo: THREE.Mesh | null = null
  private inner: THREE.Mesh | null = null
  private vortex: THREE.Points | null = null
  private ringUniforms: {
    uTime: { value: number }
    uSpeed: { value: number }
    uOpacity: { value: number }
  } | null = null

  private progress = 0
  private appear = 0
  private exit = 1
  private fadeGroup: ReturnType<typeof createFadeGroup> | null = null

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    const curve = this.buildCurve()
    this.buildRing(curve)
    this.buildVortex()
    this.buildYears(curve)
    this.buildCards(curve)
    this.buildCore()
    this.fadeGroup = createFadeGroup(this.group)
  }

  protected onEnter() {
    // 靠近时环体渐显，避免远处世界“凭空出现”
    gsap.to(this, { appear: 1, duration: 1.6, ease: 'power2.out', overwrite: true })
  }

  // 离开时不主动降透明度：由着色器中的距离淡出接管，
  // 避免相机尚未离开时环体就开始消失。

  setProgress(progress: number) {
    this.progress = progress
  }

  update(ctx: FrameContext) {
    this.exit = exitFade(this.progress)
    const opacity = this.appear * this.exit

    if (this.ringUniforms) {
      this.ringUniforms.uTime.value = ctx.time
      this.ringUniforms.uSpeed.value = 0.4 + this.progress * 1.6
      this.ringUniforms.uOpacity.value = opacity
    }

    // 年份精灵 / 影像卡片 / 柔光管：统一退场
    this.fadeGroup?.set(opacity)

    const spin = ctx.time * 0.05 + this.progress * 0.5
    if (this.ring) this.ring.rotation.z = spin
    if (this.halo) this.halo.rotation.z = -spin * 0.6
    if (this.inner) {
      this.inner.rotation.z = -spin * 1.4
      this.inner.rotation.x = Math.sin(ctx.time * 0.2) * 0.25
    }

    if (this.vortex) {
      this.vortex.rotation.z = -ctx.time * 0.22 - this.progress * 0.9
    }

    if (this.group.children.length) {
      this.group.position.y = Math.sin(ctx.time * 0.3) * 1.5
    }
  }
  /** 带纵向起伏的闭合时间环 */
  private buildCurve() {
    const points: THREE.Vector3[] = []
    const segments = 20

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const radius = RING_RADIUS + Math.sin(angle * 3) * 3
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.94, Math.sin(angle * 3) * 9))
    }

    return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
  }

  private buildRing(curve: THREE.CatmullRomCurve3) {
    const uniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 0.4 },
      uOpacity: { value: 0 },
      uColorA: { value: new THREE.Color('#2ee6ff') },
      uColorB: { value: new THREE.Color('#e9fbff') },
    }
    this.ringUniforms = uniforms

    const geometry = new THREE.TubeGeometry(curve, 420, 1.5, 12, true)
    const material = new THREE.ShaderMaterial({
      vertexShader: TIME_RING_VERT,
      fragmentShader: TIME_RING_FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.ring = new THREE.Mesh(geometry, material)
    this.group.add(this.ring)

    // 外层柔光管：营造能量包裹感
    const haloGeometry = new THREE.TubeGeometry(curve, 240, 4.2, 10, true)
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#2ee6ff'),
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    })
    this.halo = new THREE.Mesh(haloGeometry, haloMaterial)
    this.group.add(this.halo)

    // 内层反向旋转的细环：强化隧道纵深
    const innerCurve = new THREE.CatmullRomCurve3(
      curve.getPoints(40).map((point) => point.clone().multiplyScalar(0.62)),
      true,
      'catmullrom',
      0.5,
    )
    const innerGeometry = new THREE.TubeGeometry(innerCurve, 200, 0.5, 8, true)
    this.inner = new THREE.Mesh(innerGeometry, material.clone())
    this.group.add(this.inner)
  }

  /** 环内漩涡粒子：时间隧道的能量流 */
  private buildVortex() {
    const count = this.quality.tier === 'low' ? 320 : 700
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.pow(Math.random(), 0.6) * 54
      const angle = Math.random() * Math.PI * 2 + radius * 0.09

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.94
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26 - radius * 0.14
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    this.vortex = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        map: createRadialGlowTexture('#9ff2ff', 64),
        size: 2.4,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.group.add(this.vortex)
  }

  private buildYears(curve: THREE.CatmullRomCurve3) {    const count = YEARS.length

    YEARS.forEach((year, index) => {
      const t = index / count
      const point = curve.getPointAt(t)
      const outward = point.clone().setZ(0).normalize()

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createTextTexture(year, { size: 256, color: index % 2 === 0 ? '#e9ecff' : '#2ee6ff' }),
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        }),
      )
      sprite.position.copy(point).addScaledVector(outward, 12)
      sprite.scale.setScalar(9)
      this.group.add(sprite)
    })
  }

  private buildCards(curve: THREE.CatmullRomCurve3) {
    const count = this.quality.timeRingCards

    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count
      const point = curve.getPointAt(t)
      const outward = point.clone().setZ(0).normalize()

      const texture = createArtTexture(256, i * 31 + 7)
      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(17, 11),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.94,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )

      card.position.copy(point).addScaledVector(outward, 26)
      // 面向观众，同时按环上方位做轻微偏转，形成环绕的“影像环”
      card.lookAt(card.position.x, card.position.y, card.position.z + 100)
      card.rotateY(outward.x * 0.42)
      card.rotateX(-outward.y * 0.42)
      this.group.add(card)

      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(17.6, 11.6)),
        new THREE.LineBasicMaterial({
          color: new THREE.Color('#2ee6ff'),
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        }),
      )
      frame.position.copy(card.position)
      frame.quaternion.copy(card.quaternion)
      this.group.add(frame)
    }
  }

  private buildCore() {
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#2ee6ff', 256),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    glow.scale.setScalar(150)
    this.group.add(glow)
  }
}
