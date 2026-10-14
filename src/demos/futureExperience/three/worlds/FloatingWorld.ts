import * as THREE from 'three'
import gsap from 'gsap'
import type { QualityProfile } from '@/shared/utils/device'
import { FLOATING_FRAG, FLOATING_VERT } from '../../shaders/floating'
import { worldZ } from '../Camera'
import { BaseWorld, exitFade, type FrameContext } from '../World'

const FIELD_RADIUS = 150
const MAGNET_RADIUS = 46

interface FloatingObject {
  mesh: THREE.Mesh
  base: THREE.Vector3
  spin: THREE.Vector3
  phase: number
  floatSpeed: number
  scale: number
  /** 磁吸偏移（会被 lerp 回 0） */
  magnet: THREE.Vector3
}

/**
 * 04 Floating Objects —— 大量 3D 物体在空间中漂浮。
 * 滚动：整个场旋转；鼠标：沿视线射线产生磁吸；效果：空间展览馆。
 */
export class FloatingWorld extends BaseWorld {
  readonly id = 'floating'
  readonly index = 3

  private readonly quality: QualityProfile
  private objects: FloatingObject[] = []
  private materials: THREE.ShaderMaterial[] = []
  private appear = 0
  private exit = 1
  private progress = 0

  private readonly rayOrigin = new THREE.Vector3()
  private readonly rayDirection = new THREE.Vector3()
  private readonly toObject = new THREE.Vector3()

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    const count = this.quality.floatingObjects
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusGeometry(1, 0.34, 16, 32),
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.TorusKnotGeometry(0.9, 0.26, 64, 12),
      new THREE.CylinderGeometry(0.7, 0.7, 1.6, 24),
      new THREE.ConeGeometry(0.9, 1.6, 24),
      new THREE.SphereGeometry(1, 24, 16),
    ]

    for (let i = 0; i < count; i++) {
      const geometry = geometries[i % geometries.length]
      const material = new THREE.ShaderMaterial({
        vertexShader: FLOATING_VERT,
        fragmentShader: FLOATING_FRAG,
        uniforms: {
          uColorA: { value: new THREE.Color(i % 3 === 0 ? '#d8b26a' : '#9fd8ff') },
          uColorB: { value: new THREE.Color(i % 3 === 0 ? '#f6f2e8' : '#7c5cff') },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      this.materials.push(material)

      const mesh = new THREE.Mesh(geometry, material)

      // 球壳内随机分布，避免全部挤在中心
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 46 + Math.pow(Math.random(), 0.6) * FIELD_RADIUS
      const base = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) * 0.72,
        radius * Math.sin(phi) * Math.sin(theta),
      )

      const scale = 4 + Math.random() * 11
      mesh.position.copy(base)
      mesh.scale.setScalar(scale)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

      this.group.add(mesh)
      this.objects.push({
        mesh,
        base,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.3,
        ),
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.5,
        scale,
        magnet: new THREE.Vector3(),
      })
    }
  }

  protected onEnter() {
    gsap.to(this, { appear: 1, duration: 1.6, ease: 'power2.out', overwrite: 'auto' })
  }

  setProgress(progress: number) {
    this.progress = progress
  }

  update(ctx: FrameContext) {
    this.exit = exitFade(this.progress)
    const opacity = this.appear * this.exit

    // 滚动驱动整个场旋转
    this.group.rotation.y = this.progress * Math.PI * 0.9
    this.group.rotation.x = Math.sin(this.progress * Math.PI) * 0.08

    // 鼠标磁吸：以相机到指针的射线为磁力线
    this.rayOrigin.copy(ctx.camera.position)
    this.rayDirection
      .set(ctx.pointer.x, ctx.pointer.y, 0.5)
      .unproject(ctx.camera)
      .sub(this.rayOrigin)
      .normalize()

    for (const object of this.objects) {
      const material = object.mesh.material as THREE.ShaderMaterial
      material.uniforms.uOpacity.value = opacity
      material.uniforms.uTime.value = ctx.time

      // 漂浮
      const bob = Math.sin(ctx.time * object.floatSpeed + object.phase) * 3.2
      object.mesh.position.set(object.base.x, object.base.y + bob, object.base.z)

      // 旋转：滚动进度加速自转
      const spinScale = 1 + this.progress * 2.4
      object.mesh.rotation.x += object.spin.x * ctx.delta * spinScale
      object.mesh.rotation.y += object.spin.y * ctx.delta * spinScale
      object.mesh.rotation.z += object.spin.z * ctx.delta * spinScale

      // 磁吸：物体到射线的垂距越小，吸附越强
      this.toObject.copy(object.mesh.position).sub(this.rayOrigin)
      const along = this.toObject.dot(this.rayDirection)
      const perpendicular = this.toObject.clone().addScaledVector(this.rayDirection, -along).length()

      const influence = along > 0 ? Math.max(0, 1 - perpendicular / MAGNET_RADIUS) : 0
      if (influence > 0) {
        // 朝射线上的最近点移动，形成「被吸住」的手感
        const target = this.rayOrigin.clone().addScaledVector(this.rayDirection, Math.max(60, along))
        object.magnet.lerp(target.sub(object.mesh.position).multiplyScalar(0.12 * influence), 0.12)
      }

      object.magnet.multiplyScalar(0.92)
      object.mesh.position.add(object.magnet)

      // 被吸附时轻微放大，强化「被吸住」的反馈
      const magnetAmount = object.magnet.length()
      object.mesh.scale.setScalar(object.scale * (1 + Math.min(0.28, magnetAmount * 0.006)))
    }
  }
}
