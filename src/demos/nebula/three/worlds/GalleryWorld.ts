import * as THREE from 'three'
import gsap from 'gsap'
import { createArtAtlas } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../scene'
import { GALLERY_FRAG, GALLERY_VERT } from '../shaders/gallery'
import { clamp } from '../../utils/scroll'
import { BaseWorld, exitFade, type FrameContext } from '../World'

const TUNNEL_DEPTH = 660
const AHEAD = 240
const BEHIND = 420
const TILE_SIZE = 21
/** 相机在本世界内的飞行范围（local z），回收参考点必须夹紧在此范围内：
 *  否则相机飞离后图块仍会被搬回相机前方，串入下一个世界的画面。 */
const CAMERA_FROM = -560
const CAMERA_TO = 60
const WORLD_UP = new THREE.Vector3(0, 1, 0)

interface Tile {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  scale: number
}

/**
 * 04 无限画廊 —— 空间图片墙 + 着色器景深。
 * 滚动即飞船前进，图块不断从两侧掠过，相机身后自动回收复用（无限长廊）。
 */
export class GalleryWorld extends BaseWorld {
  readonly id = 'gallery'
  readonly index = 3

  private readonly quality: QualityProfile
  private mesh: THREE.InstancedMesh | null = null
  private material: THREE.ShaderMaterial | null = null
  private camera: THREE.PerspectiveCamera | null = null

  private readonly tiles: Tile[] = []
  private readonly matrix = new THREE.Matrix4()
  private readonly positionScratch = new THREE.Vector3()
  private readonly axisScratch = new THREE.Vector3()
  private readonly quaternionScratch = new THREE.Quaternion()
  private readonly tiltScratch = new THREE.Quaternion()
  private readonly eulerScratch = new THREE.Euler()
  private readonly scaleScratch = new THREE.Vector3()

  private appear = 0
  private exit = 1
  private progress = 0
  private cameraLocalZ = 0
  private recycled = 0

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    const count = this.quality.galleryTiles
    const { texture, cols } = createArtAtlas(8, 192)

    const geometry = new THREE.PlaneGeometry(1, 1)
    const tiles = new Float32Array(count)
    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 环状分布：中央留出飞行通道，图片沿长廊两侧漂浮
      const angle = Math.random() * Math.PI * 2
      const radius = 54 + Math.pow(Math.random(), 0.72) * 96

      const tile: Tile = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.72,
        z: (Math.random() - 0.5) * TUNNEL_DEPTH,
        rx: (Math.random() - 0.5) * 0.42,
        ry: (Math.random() - 0.5) * 0.42,
        rz: (Math.random() - 0.5) * 0.5,
        scale: 0.5 + Math.random() * 0.95,
      }
      this.tiles.push(tile)

      tiles[i] = Math.floor(Math.random() * cols * cols)
      seeds[i] = Math.random()
    }

    geometry.setAttribute('aTile', new THREE.InstancedBufferAttribute(tiles, 1))
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))

    this.material = new THREE.ShaderMaterial({
      vertexShader: GALLERY_VERT,
      fragmentShader: GALLERY_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAppear: { value: 0 },
        uSpeed: { value: 0 },
        uFocus: { value: 120 },
        uFocusRange: { value: 170 },
        uAtlas: { value: texture },
        uCols: { value: cols },
        uAccent: { value: new THREE.Color('#ffc46b') },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    this.mesh = new THREE.InstancedMesh(geometry, this.material, count)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), TUNNEL_DEPTH)

    for (let i = 0; i < count; i++) this.writeMatrix(i)
    this.group.add(this.mesh)
  }

  protected onEnter() {
    gsap.to(this, { appear: 1, duration: 1.6, ease: 'power2.out', overwrite: true })
  }

  // 离开时不降透明度：由着色器的距离淡出接管，避免相机尚在长廊内就整体变暗。

  setProgress(progress: number) {
    this.progress = progress
  }

  update(ctx: FrameContext) {
    this.camera = ctx.camera
    this.exit = exitFade(this.progress)

    if (this.material) {
      this.material.uniforms.uTime.value = ctx.time
      this.material.uniforms.uAppear.value = this.appear * this.exit
      this.material.uniforms.uSpeed.value = this.progress
      // 焦点平面随速度前移：越快越远，形成“隧道尽头”的观感
      this.material.uniforms.uFocus.value = 110 + this.progress * 90
    }

    this.cameraLocalZ = clamp(ctx.camera.position.z - this.group.position.z, CAMERA_FROM, CAMERA_TO)
    this.recycle()
  }

  /** 相机身后/身前的图块循环复用，形成无限长廊 */
  private recycle() {
    if (!this.mesh) return
    let changed = false

    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i]
      if (tile.z > this.cameraLocalZ + AHEAD) {
        tile.z -= TUNNEL_DEPTH
      } else if (tile.z < this.cameraLocalZ - BEHIND) {
        tile.z += TUNNEL_DEPTH
      } else {
        continue
      }
      this.recycled++
      this.writeMatrix(i)
      changed = true
    }

    if (changed) this.mesh.instanceMatrix.needsUpdate = true
  }

  private writeMatrix(index: number) {
    const tile = this.tiles[index]
    if (!this.mesh || !tile) return

    this.positionScratch.set(tile.x, tile.y, tile.z)
    // 面向隧道轴线（相机飞行路径），再叠加随机倾斜 → 漂浮照片墙
    this.axisScratch.set(0, 0, tile.z)
    this.matrix.lookAt(this.axisScratch, this.positionScratch, WORLD_UP)
    this.quaternionScratch.setFromRotationMatrix(this.matrix)
    this.tiltScratch.setFromEuler(this.eulerScratch.set(tile.rx, tile.ry, tile.rz))
    this.quaternionScratch.multiply(this.tiltScratch)

    this.matrix.compose(
      this.positionScratch,
      this.quaternionScratch,
      this.scaleScratch.setScalar(TILE_SIZE * tile.scale),
    )
    this.mesh.setMatrixAt(index, this.matrix)
    this.mesh.instanceMatrix.needsUpdate = true
  }
}
