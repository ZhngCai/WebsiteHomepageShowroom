import * as THREE from 'three'
import gsap from 'gsap'
import { createArtAtlas } from './textures'
import { CARD_FRAG, CARD_VERT } from '../shaders/card'

export interface CardRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CardSphereFocus {
  index: number
  tile: number
  /** 卡片在屏幕上的矩形（供 DOM 面板做 GSAP Flip） */
  rect: CardRect
}

export interface CardSphereOptions {
  count: number
  radius?: number
  cardSize?: number
  atlasCols?: number
  accent?: string
  /** 飞出后相对相机的局部机位 */
  focus?: { x: number; y: number; z: number; scale: number }
  /** 关闭事件名（DOM 面板通知 3D 收回卡片） */
  closeEvent?: string
  onFocus?: (focus: CardSphereFocus) => void
  onClose?: () => void
}

export interface CardSphereContext {
  time: number
  delta: number
  camera: THREE.PerspectiveCamera
}

const DEFAULT_FOCUS = { x: -6.5, y: 3.6, z: -40, scale: 2.9 }

/**
 * 卡片球 —— 上百张图片卡片按球面排列的通用实现。
 *
 * 能力：自动旋转、鼠标拖动（含惯性）、hover 放大、点击飞出到镜头前、
 * 关闭后沿原轨迹返回。InstancedMesh 单次 draw call；交互与动画逻辑与业务解耦，
 * 通过 onFocus / onClose / closeEvent 与 DOM 层通信。
 */
export function createCardSphere(options: CardSphereOptions) {
  const {
    count,
    radius = 30,
    // 卡片尺寸需保证球面覆盖率足够（过小会出现大量空隙，点击/hover 命中率低）
    cardSize = 6.6,
    atlasCols = 8,
    accent = '#ff5fa2',
    focus = DEFAULT_FOCUS,
    closeEvent,
    onFocus,
    onClose,
  } = options

  const { texture, cols } = createArtAtlas(atlasCols, 192)
  const group = new THREE.Group()

  const transforms: { position: THREE.Vector3; quaternion: THREE.Quaternion }[] = []
  const tiles = new Float32Array(count)
  const seeds = new Float32Array(count)
  const highlights = new Float32Array(count)

  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const r = radius * (0.95 + Math.random() * 0.1)

    const position = new THREE.Vector3(Math.cos(theta) * radiusAtY * r, y * r, Math.sin(theta) * radiusAtY * r)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize())
    transforms.push({ position, quaternion })

    tiles[i] = Math.floor(Math.random() * cols * cols)
    seeds[i] = Math.random()
  }

  const geometry = new THREE.PlaneGeometry(1, 1)
  geometry.setAttribute('aTile', new THREE.InstancedBufferAttribute(tiles, 1))
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
  const highlightAttribute = new THREE.InstancedBufferAttribute(highlights, 1)
  geometry.setAttribute('aHighlight', highlightAttribute)

  const material = new THREE.ShaderMaterial({
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uGather: { value: 0 },
      uOpacity: { value: 0 },
      uScatter: { value: 0 },
      uAtlas: { value: texture },
      uCols: { value: cols },
      uAccent: { value: new THREE.Color(accent) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.frustumCulled = false
  mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 2)

  const matrix = new THREE.Matrix4()
  const scaleScratch = new THREE.Vector3()
  const writeMatrix = (index: number, scale: number) => {
    const transform = transforms[index]
    if (!transform) return
    matrix.compose(transform.position, transform.quaternion, scaleScratch.setScalar(cardSize * scale))
    mesh.setMatrixAt(index, matrix)
    mesh.instanceMatrix.needsUpdate = true
  }

  for (let i = 0; i < count; i++) writeMatrix(i, 1)
  group.add(mesh)

  // ---------- 焦点卡片 ----------
  const focusGeometry = new THREE.PlaneGeometry(1, 1)
  focusGeometry.setAttribute('aTile', new THREE.BufferAttribute(new Float32Array(4), 1))
  focusGeometry.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(4), 1))
  focusGeometry.setAttribute('aHighlight', new THREE.BufferAttribute(new Float32Array(4), 1))

  const focusMaterial = new THREE.ShaderMaterial({
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uGather: { value: 1 },
      uOpacity: { value: 1 },
      uScatter: { value: 0 },
      uAtlas: { value: texture },
      uCols: { value: cols },
      uAccent: { value: new THREE.Color(accent) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const focusCard = new THREE.Mesh(focusGeometry, focusMaterial)
  focusCard.visible = false
  focusCard.renderOrder = 10
  group.add(focusCard)

  // ---------- 状态 ----------
  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  const dragLast = new THREE.Vector2()
  const velocity = new THREE.Vector2()
  const hoverTween = { value: 0 }
  const scratch = new THREE.Vector3()
  const scratchQuaternion = new THREE.Quaternion()

  let camera: THREE.PerspectiveCamera | null = null
  let hovered = -1
  let focused = -1
  let focusState: 'idle' | 'opening' | 'open' | 'closing' = 'idle'
  let focusFrom: { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: number } | null = null
  let scatter = 0
  let dragging = false
  let dragDistance = 0
  let pointerDirty = false
  let listening = false
  /** 外部透明度系数（章节飞离淡出用），与 gatherIn 的 opacity 相乘 */
  let externalOpacity = 1

  // 供 GSAP 补间的纯数值状态（避免直接 tween 对象内部结构）
  const state = { focusT: 0, gather: 0, opacity: 0 }

  const isInteractive = (target: EventTarget | null) =>
    Boolean((target as HTMLElement | null)?.closest?.('button, a, input, [data-ui]'))

  const setHover = (index: number) => {
    const previous = hovered
    hovered = index

    if (previous >= 0) highlightAttribute.setX(previous, 0)
    if (index >= 0) highlightAttribute.setX(index, 1)
    highlightAttribute.needsUpdate = true

    if (previous >= 0 && previous !== index) writeMatrix(previous, 1)

    gsap.to(hoverTween, {
      value: index >= 0 ? 1 : 0,
      duration: 0.32,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        if (hovered >= 0) writeMatrix(hovered, 1 + hoverTween.value * 0.22)
      },
    })
  }

  const updateHover = () => {
    if (!camera || focusState !== 'idle' || state.gather < 0.4) {
      setHover(-1)
      return
    }
    raycaster.setFromCamera(pointerNdc, camera)
    const hits = raycaster.intersectObject(mesh, false)
    debugRaycast.hits = hits.length
    debugRaycast.origin = raycaster.ray.origin.toArray().map((v) => Math.round(v))
    debugRaycast.direction = raycaster.ray.direction.toArray().map((v) => Number(v.toFixed(3)))
    const index = hits.length ? (hits[0].instanceId ?? -1) : -1
    if (index !== hovered) setHover(index)
  }

  const debugRaycast = { hits: -1, origin: [] as number[], direction: [] as number[] }

  /** 3D 卡片 → 屏幕矩形，供 DOM 面板做 GSAP Flip */
  const projectRect = (position: THREE.Vector3, quaternion: THREE.Quaternion): CardRect => {
    if (!camera) return { x: 0, y: 0, width: 0, height: 0 }

    const half = new THREE.Vector3(cardSize * 0.5, 0, 0).applyQuaternion(quaternion)
    const left = position.clone().sub(half).project(camera)
    const right = position.clone().add(half).project(camera)
    const center = position.clone().project(camera)

    const width = Math.max(24, Math.abs(right.x - left.x) * 0.5 * window.innerWidth)
    const x = (center.x * 0.5 + 0.5) * window.innerWidth
    const y = (-center.y * 0.5 + 0.5) * window.innerHeight

    return { x: x - width / 2, y: y - width / 2, width, height: width }
  }

  const focusIndex = (index: number) => {
    const transform = transforms[index]
    if (!transform || !camera) return

    const localPosition = transform.position.clone()
    const localQuaternion = transform.quaternion.clone()
    const worldPosition = localPosition.clone().applyMatrix4(group.matrixWorld)
    const worldQuaternion = group.quaternion.clone().multiply(localQuaternion)

    focusCard.visible = true
    focusCard.position.copy(localPosition)
    focusCard.quaternion.copy(localQuaternion)
    focusCard.scale.setScalar(cardSize)

    setHover(-1)
    writeMatrix(index, 0)

    focusFrom = { position: localPosition, quaternion: localQuaternion, scale: cardSize }
    focused = index
    focusState = 'opening'
    state.focusT = 0

    gsap.to(state, {
      focusT: 1,
      duration: 1.05,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        focusState = 'open'
      },
    })

    onFocus?.({
      index,
      tile: tiles[index] ?? 0,
      rect: projectRect(worldPosition, worldQuaternion),
    })
  }

  const close = () => {
    if (focusState === 'idle' || focused < 0) return
    focusState = 'closing'

    gsap.to(state, {
      focusT: 0,
      duration: 0.8,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        const index = focused
        focused = -1
        focusState = 'idle'
        focusCard.visible = false
        if (index >= 0) writeMatrix(index, 1)
      },
    })

    onClose?.()
  }

  const onPointerDown = (event: PointerEvent) => {
    if (isInteractive(event.target) || focusState !== 'idle') return
    dragging = true
    dragDistance = 0
    dragLast.set(event.clientX, event.clientY)
  }

  const onPointerMove = (event: PointerEvent) => {
    pointerNdc.set((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1))
    pointerDirty = true

    if (!dragging) return

    const dx = event.clientX - dragLast.x
    const dy = event.clientY - dragLast.y
    dragLast.set(event.clientX, event.clientY)
    dragDistance += Math.abs(dx) + Math.abs(dy)

    group.rotation.y += dx * 0.005
    group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + dy * 0.003, -0.85, 0.85)
    velocity.set(dy * 0.22, dx * 0.22)
  }

  const onPointerUp = () => {
    if (!dragging) return
    dragging = false
    if (dragDistance >= 8 || !camera || focused >= 0) return

    raycaster.setFromCamera(pointerNdc, camera)
    const hits = raycaster.intersectObject(mesh, false)
    const index = hits.length ? (hits[0].instanceId ?? -1) : -1
    if (index >= 0) focusIndex(index)
  }

  const onCloseRequest = () => close()

  const attach = () => {
    if (listening) return
    listening = true
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    if (closeEvent) window.addEventListener(closeEvent, onCloseRequest)
  }

  const detach = () => {
    if (!listening) return
    listening = false
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    if (closeEvent) window.removeEventListener(closeEvent, onCloseRequest)
    dragging = false
    setHover(-1)
  }

  return {
    group,
    attach,
    detach,
    close,
    focusIndex,
    get focused() {
      return focused
    },
    /** 进入时调用：卡片从远处聚合 */
    gatherIn(duration = 1.8, delay = 0.2) {
      gsap.to(state, { gather: 1, duration, delay, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(state, { opacity: 1, duration: duration * 0.9, delay, ease: 'power2.out', overwrite: 'auto' })
    },
    update(ctx: CardSphereContext) {
      camera = ctx.camera

      material.uniforms.uTime.value = ctx.time
      material.uniforms.uGather.value = state.gather
      material.uniforms.uOpacity.value = state.opacity * externalOpacity
      material.uniforms.uScatter.value = scatter
      focusMaterial.uniforms.uTime.value = ctx.time
      focusMaterial.uniforms.uOpacity.value = state.opacity * externalOpacity

      // 自动旋转 + 拖动惯性
      velocity.multiplyScalar(dragging ? 1 : 0.94)
      group.rotation.y += (0.14 + scatter * 0.22 + velocity.y) * ctx.delta
      group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + velocity.x * ctx.delta, -0.85, 0.85)
      group.updateMatrixWorld()

      if (pointerDirty && !dragging) {
        pointerDirty = false
        updateHover()
      }

      if (focusState === 'idle' || !focusFrom) return

      // 焦点卡片始终钉在相机前，滚动/移动时跟随
      scratch.set(focus.x, focus.y, focus.z)
      camera.localToWorld(scratch)
      group.worldToLocal(scratch)
      scratchQuaternion.copy(group.quaternion).invert().multiply(camera.quaternion)

      const t = state.focusT
      focusCard.position.lerpVectors(focusFrom.position, scratch, t)
      focusCard.quaternion.slerpQuaternions(focusFrom.quaternion, scratchQuaternion, t)
      focusCard.scale.setScalar(THREE.MathUtils.lerp(focusFrom.scale, cardSize * focus.scale, t))
    },
    setScatter(value: number) {
      scatter = value
    },
    /**
     * 章节飞离淡出：外部透明度系数（0~1）。
     * 必须由宿主世界按自身滚动进度传入，否则相机会在「已经进入下一章节」时
     * 仍然停留在球体内部，导致卡片压住下一个章节的画面。
     */
    setOpacity(value: number) {
      externalOpacity = Math.min(1, Math.max(0, value))
    },
    /** 开发调试：暴露内部状态（供 CDP 探针读取） */
    debug() {
      return {
        gather: Number(state.gather.toFixed(3)),
        opacity: Number(state.opacity.toFixed(3)),
        pointer: [Number(pointerNdc.x.toFixed(3)), Number(pointerNdc.y.toFixed(3))],
        cameraZ: camera ? Math.round(camera.position.z) : null,
        listening,
        focusState,
        hovered,
        focused,
        dragging,
        dragDistance,
        externalOpacity,
        raycast: debugRaycast,
        matrixWorld: group.matrixWorld.elements.slice(12, 15).map((v) => Math.round(v)),
      }
    },
    dispose() {
      detach()
      gsap.killTweensOf(state)
      gsap.killTweensOf(hoverTween)
      geometry.dispose()
      focusGeometry.dispose()
      material.dispose()
      focusMaterial.dispose()
      texture.dispose()
    },
  }
}
