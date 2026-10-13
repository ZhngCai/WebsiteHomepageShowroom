import * as THREE from 'three'
import gsap from 'gsap'
import { createArtAtlas } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../scene'
import { CARD_FRAG, CARD_VERT } from '../shaders/card'
import { BaseWorld, exitFade, type FrameContext } from '../World'
import { CARD_CLOSE_EVENT, emitCardClose, emitCardFocus } from '../../utils/events'

const SPHERE_RADIUS = 30
const CARD_SIZE = 5.4
const FOCUS_DISTANCE = 40
const PALETTES = ['Ultraviolet', 'Aurora', 'Ember', 'Abyss', 'Neon Bloom', 'Ion', 'Solar Dust', 'Void']
const TAGS = ['Memory', 'Signal', 'Fragment', 'Archive', 'Echo', 'Trace']

/**
 * 03 卡片星球 —— 100 张图片卡片球形排列（InstancedMesh 单 draw call）。
 * 自动旋转 / 鼠标拖动 / hover 放大 / 点击飞出 + 玻璃信息卡。
 */
export class CardUniverseWorld extends BaseWorld {
  readonly id = 'card-universe'
  readonly index = 2

  private readonly quality: QualityProfile
  private mesh: THREE.InstancedMesh | null = null
  private focusCard: THREE.Mesh | null = null
  private highlight: THREE.InstancedBufferAttribute | null = null
  private tileArray: Float32Array | null = null
  private material: THREE.ShaderMaterial | null = null
  private focusMaterial: THREE.ShaderMaterial | null = null
  private camera: THREE.PerspectiveCamera | null = null

  private readonly transforms: { position: THREE.Vector3; quaternion: THREE.Quaternion }[] = []
  private readonly raycaster = new THREE.Raycaster()
  private readonly matrix = new THREE.Matrix4()
  private readonly scaleScratch = new THREE.Vector3()
  private readonly pointerNdc = new THREE.Vector2()
  private readonly dragLast = new THREE.Vector2()
  private readonly velocity = new THREE.Vector2()
  private readonly hoverTween = { value: 0 }
  private readonly scratch = new THREE.Vector3()
  private readonly scratchQuaternion = new THREE.Quaternion()

  private hovered = -1
  private focused = -1
  private focusState: 'idle' | 'opening' | 'open' | 'closing' = 'idle'
  private focusFrom: { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: number } | null = null
  private focusT = 0
  private appear = 0
  private exit = 1
  private progress = 0

  private dragging = false
  private dragDistance = 0
  private pointerDirty = false
  private listening = false

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    const count = this.quality.cards
    const { texture, cols } = createArtAtlas(8, 192)

    const geometry = new THREE.PlaneGeometry(1, 1)
    const tiles = new Float32Array(count)
    const seeds = new Float32Array(count)
    const highlights = new Float32Array(count)

    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i
      const radius = SPHERE_RADIUS * (0.95 + Math.random() * 0.1)

      const position = new THREE.Vector3(
        Math.cos(theta) * radiusAtY * radius,
        y * radius,
        Math.sin(theta) * radiusAtY * radius,
      )
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      )
      this.transforms.push({ position, quaternion })

      tiles[i] = Math.floor(Math.random() * cols * cols)
      seeds[i] = Math.random()
    }

    geometry.setAttribute('aTile', new THREE.InstancedBufferAttribute(tiles, 1))
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    this.highlight = new THREE.InstancedBufferAttribute(highlights, 1)
    geometry.setAttribute('aHighlight', this.highlight)
    this.tileArray = tiles

    this.material = new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: CARD_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uGather: { value: 0 },
        uOpacity: { value: 0 },
        uScatter: { value: 0 },
        uAtlas: { value: texture },
        uCols: { value: cols },
        uAccent: { value: new THREE.Color('#ff5fa2') },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    this.mesh = new THREE.InstancedMesh(geometry, this.material, count)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), SPHERE_RADIUS * 2)

    for (let i = 0; i < count; i++) this.writeMatrix(i, 1)
    this.group.add(this.mesh)

    this.buildFocusCard(cols)
  }

  protected onEnter() {
    this.attach()
    gsap.to(this, { appear: 1, duration: 1.8, delay: 0.2, ease: 'power2.out', overwrite: true })
  }

  protected onLeave() {
    // 只解除交互；球体形态与亮度保持，交给着色器的距离淡出
    this.detach()
    this.closeFocus()
  }

  setProgress(progress: number) {
    this.progress = progress
    if (progress < 0.03 || progress > 0.97) this.closeFocus()
  }

  update(ctx: FrameContext) {
    this.camera = ctx.camera
    this.exit = exitFade(this.progress)

    const opacity = this.appear * this.exit
    if (this.material) {
      this.material.uniforms.uTime.value = ctx.time
      this.material.uniforms.uGather.value = this.appear
      this.material.uniforms.uOpacity.value = opacity
      this.material.uniforms.uScatter.value = this.progress
    }
    if (this.focusMaterial) {
      this.focusMaterial.uniforms.uTime.value = ctx.time
      this.focusMaterial.uniforms.uOpacity.value = opacity
    }

    // 自动旋转 + 拖动惯性
    this.velocity.multiplyScalar(this.dragging ? 1 : 0.94)
    const autoSpeed = 0.14 + this.progress * 0.22
    this.group.rotation.y += (autoSpeed + this.velocity.y) * ctx.delta
    this.group.rotation.x = THREE.MathUtils.clamp(
      this.group.rotation.x + this.velocity.x * ctx.delta,
      -0.85,
      0.85,
    )
    this.group.updateMatrixWorld()

    if (this.pointerDirty && !this.dragging) {
      this.pointerDirty = false
      this.updateHover()
    }

    this.updateFocus()
  }

  dispose() {
    this.detach()
    gsap.killTweensOf(this)
    gsap.killTweensOf(this.hoverTween)
    super.dispose()
  }

  // ---------- 交互 ----------

  private attach() {
    if (this.listening) return
    this.listening = true
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true })
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    window.addEventListener('pointerup', this.onPointerUp, { passive: true })
    window.addEventListener(CARD_CLOSE_EVENT, this.onCloseRequest)
  }

  private detach() {
    if (!this.listening) return
    this.listening = false
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener(CARD_CLOSE_EVENT, this.onCloseRequest)
    this.dragging = false
    this.setHover(-1)
  }

  private onPointerDown = (event: PointerEvent) => {
    if (isInteractive(event.target) || this.focusState !== 'idle') return
    this.dragging = true
    this.dragDistance = 0
    this.dragLast.set(event.clientX, event.clientY)
  }

  private onPointerMove = (event: PointerEvent) => {
    this.pointerNdc.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    )
    this.pointerDirty = true

    if (!this.dragging) return

    const dx = event.clientX - this.dragLast.x
    const dy = event.clientY - this.dragLast.y
    this.dragLast.set(event.clientX, event.clientY)
    this.dragDistance += Math.abs(dx) + Math.abs(dy)

    this.group.rotation.y += dx * 0.005
    this.group.rotation.x = THREE.MathUtils.clamp(this.group.rotation.x + dy * 0.003, -0.85, 0.85)
    this.velocity.set(dy * 0.22, dx * 0.22)
  }

  private onPointerUp = () => {
    if (!this.dragging) return
    this.dragging = false
    if (this.dragDistance < 8) this.pick()
  }

  private onCloseRequest = () => {
    this.closeFocus()
  }

  private updateHover() {
    if (!this.mesh || !this.camera || this.focusState !== 'idle' || this.appear < 0.4) {
      this.setHover(-1)
      return
    }

    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    const hits = this.raycaster.intersectObject(this.mesh, false)
    const id = hits.length ? (hits[0].instanceId ?? -1) : -1
    if (id !== this.hovered) this.setHover(id)
  }

  private setHover(id: number) {
    const previous = this.hovered
    this.hovered = id

    if (this.highlight) {
      if (previous >= 0) this.highlight.setX(previous, 0)
      if (id >= 0) this.highlight.setX(id, 1)
      this.highlight.needsUpdate = true
    }

    if (previous >= 0 && previous !== id) this.writeMatrix(previous, 1)

    gsap.to(this.hoverTween, {
      value: id >= 0 ? 1 : 0,
      duration: 0.32,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        if (this.hovered >= 0) this.writeMatrix(this.hovered, 1 + this.hoverTween.value * 0.22)
      },
    })
  }

  private pick() {
    if (!this.mesh || !this.camera || this.focused >= 0) return

    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    const hits = this.raycaster.intersectObject(this.mesh, false)
    const id = hits.length ? (hits[0].instanceId ?? -1) : -1
    if (id < 0) return

    this.focusInstance(id)
  }

  // ---------- 飞出 / 返回 ----------

  private focusInstance(id: number) {
    const transform = this.transforms[id]
    const card = this.focusCard
    if (!transform || !card || !this.camera) return

    // 球面上的实例变换（局部空间，随球体一起旋转）
    const localPosition = transform.position.clone()
    const localQuaternion = transform.quaternion.clone()
    // 投影用世界坐标
    const worldPosition = localPosition.clone().applyMatrix4(this.group.matrixWorld)
    const worldQuaternion = this.group.quaternion.clone().multiply(localQuaternion)

    card.visible = true
    card.position.copy(localPosition)
    card.quaternion.copy(localQuaternion)
    card.scale.setScalar(CARD_SIZE)

    this.setHover(-1)
    this.writeMatrix(id, 0)

    this.focusFrom = { position: localPosition, quaternion: localQuaternion, scale: CARD_SIZE }
    this.focused = id
    this.focusState = 'opening'
    this.focusT = 0

    gsap.to(this, {
      focusT: 1,
      duration: 1.05,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => {
        this.focusState = 'open'
      },
    })

    const tile = this.tileArray?.[id] ?? 0
    emitCardFocus({
      id,
      tile,
      title: `MEMORY #${String(id + 1).padStart(3, '0')}`,
      year: String(2014 + (id % 12)),
      palette: PALETTES[id % PALETTES.length],
      tag: TAGS[id % TAGS.length],
      rect: this.projectRect(worldPosition, worldQuaternion),
    })
  }

  private closeFocus() {
    if (this.focusState === 'idle' || this.focused < 0) return
    this.focusState = 'closing'

    gsap.to(this, {
      focusT: 0,
      duration: 0.8,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => {
        const id = this.focused
        this.focused = -1
        this.focusState = 'idle'
        if (this.focusCard) this.focusCard.visible = false
        if (id >= 0) this.writeMatrix(id, 1)
      },
    })

    emitCardClose()
  }

  private updateFocus() {
    const card = this.focusCard
    const from = this.focusFrom
    const camera = this.camera
    if (!card || !from || !camera || this.focusState === 'idle') return

    // 目标：相机前偏左上的固定机位，转换回球体局部空间（卡片是 group 的子节点）
    this.scratch.set(-6.5, 3.6, -FOCUS_DISTANCE)
    camera.localToWorld(this.scratch)
    this.group.worldToLocal(this.scratch)
    this.scratchQuaternion.copy(this.group.quaternion).invert().multiply(camera.quaternion)

    const t = this.focusT
    card.position.lerpVectors(from.position, this.scratch, t)
    card.quaternion.slerpQuaternions(from.quaternion, this.scratchQuaternion, t)
    card.scale.setScalar(THREE.MathUtils.lerp(from.scale, CARD_SIZE * 2.9, t))
  }

  // ---------- 工具 ----------

  private buildFocusCard(cols: number) {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const tileArray = new Float32Array(4)
    const seedArray = new Float32Array(4)
    const highlightArray = new Float32Array(4)
    geometry.setAttribute('aTile', new THREE.BufferAttribute(tileArray, 1))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seedArray, 1))
    geometry.setAttribute('aHighlight', new THREE.BufferAttribute(highlightArray, 1))

    this.focusMaterial = new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: CARD_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uGather: { value: 1 },
        uOpacity: { value: 1 },
        uScatter: { value: 0 },
        uAtlas: { value: this.material?.uniforms.uAtlas.value ?? null },
        uCols: { value: cols },
        uAccent: { value: new THREE.Color('#ff5fa2') },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    this.focusCard = new THREE.Mesh(geometry, this.focusMaterial)
    this.focusCard.visible = false
    this.focusCard.renderOrder = 10
    this.group.add(this.focusCard)
  }

  private writeMatrix(id: number, scale: number) {
    const transform = this.transforms[id]
    if (!this.mesh || !transform) return

    this.matrix.compose(transform.position, transform.quaternion, this.scaleScratch.setScalar(CARD_SIZE * scale))
    this.mesh.setMatrixAt(id, this.matrix)
    this.mesh.instanceMatrix.needsUpdate = true
  }

  /** 把 3D 卡片投影为屏幕矩形，供 DOM 面板做 GSAP Flip */
  private projectRect(position: THREE.Vector3, quaternion: THREE.Quaternion) {
    const camera = this.camera
    if (!camera) return { x: 0, y: 0, width: 0, height: 0 }

    const half = new THREE.Vector3(CARD_SIZE * 0.5, 0, 0).applyQuaternion(quaternion)
    const left = position.clone().sub(half).project(camera)
    const right = position.clone().add(half).project(camera)
    const center = position.clone().project(camera)

    const width = Math.max(24, Math.abs(right.x - left.x) * 0.5 * window.innerWidth)
    const x = (center.x * 0.5 + 0.5) * window.innerWidth
    const y = (-center.y * 0.5 + 0.5) * window.innerHeight

    return { x: x - width / 2, y: y - width / 2, width, height: width }
  }
}

function isInteractive(target: EventTarget | null) {
  return Boolean((target as HTMLElement | null)?.closest?.('button, a, input, [data-ui]'))
}
