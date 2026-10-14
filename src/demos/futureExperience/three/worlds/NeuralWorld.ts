import * as THREE from 'three'
import gsap from 'gsap'
import { createRadialGlowTexture } from '@/shared/three/textures'
import {
  NEURAL_FLOW_FRAG,
  NEURAL_FLOW_VERT,
  NEURAL_LINE_FRAG,
  NEURAL_LINE_VERT,
  NEURAL_NODE_FRAG,
  NEURAL_NODE_VERT,
} from '@/shared/shaders/neural'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../Camera'
import { BaseWorld, exitFade, type FrameContext } from '../World'

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const CHAOS_RADIUS = 300
/** 成形完成点：相机在 0.62 处开始飞离，形态必须在此之前完成 */
const MORPH_END = 0.62
const NEIGHBOURS = 4

/**
 * 03 AI Neural World —— 1000 个节点从混沌态聚成「AI 核心」。
 * 形态插值、突触放电、粒子流动全部在 GPU 完成；着色器与 nebula demo 共用
 * （见 @/shared/shaders/neural），本文件只负责目标形态与缓冲构建。
 */
export class NeuralWorld extends BaseWorld {
  readonly id = 'ai'
  readonly index = 2

  private readonly quality: QualityProfile
  private nodes: THREE.Points | null = null
  private lines: THREE.LineSegments | null = null
  private flow: THREE.Points | null = null
  private core: THREE.Sprite | null = null
  private appear = 0
  private exit = 1
  private progress = 0

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    const count = this.quality.neuralNodes
    const chaos = new Float32Array(count * 3)
    const target = new Float32Array(count * 3)
    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 70 + Math.pow(Math.random(), 0.6) * CHAOS_RADIUS
      chaos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      chaos[i * 3 + 1] = radius * Math.cos(phi)
      chaos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      const point = corePoint(i, count)
      target[i * 3] = point.x
      target[i * 3 + 1] = point.y
      target[i * 3 + 2] = point.z

      seeds[i] = Math.random()
    }

    const edges = buildEdges(target, count, this.quality.neuralEdges)

    this.buildNodes(chaos, target, seeds, edges)
    this.buildFlow(chaos, target, edges)
    this.buildCore()
  }

  protected onEnter() {
    gsap.to(this, { appear: 1, duration: 1.4, ease: 'power2.out', overwrite: 'auto' })
  }

  setProgress(progress: number) {
    this.progress = progress
  }

  update(ctx: FrameContext) {
    // 混沌 → AI 核心：进度前 62% 完成成形，之后形态保持稳定
    const raw = Math.min(1, Math.max(0, this.progress / MORPH_END))
    const morph = raw * raw * (3 - 2 * raw)

    this.exit = exitFade(this.progress)
    const opacity = this.appear * this.exit

    for (const object of [this.nodes, this.lines, this.flow]) {
      const material = object?.material as THREE.ShaderMaterial | undefined
      if (!material) continue
      material.uniforms.uTime.value = ctx.time
      material.uniforms.uMorph.value = morph
      material.uniforms.uOpacity.value = opacity
    }

    if (this.core) {
      this.core.scale.setScalar(120 + morph * 60 + Math.sin(ctx.time * 0.8) * 6)
      ;(this.core.material as THREE.SpriteMaterial).opacity = (0.05 + morph * 0.16) * opacity
    }

    const spin = ctx.time * 0.03
    if (this.nodes) this.nodes.rotation.y = spin
    if (this.lines) this.lines.rotation.y = spin
    if (this.flow) this.flow.rotation.y = spin
  }

  resize(_width: number, height: number) {
    const scale = height * 0.5
    for (const object of [this.nodes, this.flow]) {
      const material = object?.material as THREE.ShaderMaterial | undefined
      if (material) material.uniforms.uScale.value = scale
    }
  }

  private buildNodes(chaos: Float32Array, target: Float32Array, seeds: Float32Array, edges: [number, number][]) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(chaos, 3))
    geometry.setAttribute('aBrain', new THREE.BufferAttribute(target, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHAOS_RADIUS + 400)

    this.nodes = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: NEURAL_NODE_VERT,
        fragmentShader: NEURAL_NODE_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uOpacity: { value: 0 },
          uScale: { value: window.innerHeight * 0.5 },
          uSize: { value: 2.7 },
          uColorA: { value: new THREE.Color('#9fd8ff') },
          uColorB: { value: new THREE.Color('#f6f2e8') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.nodes.frustumCulled = false
    this.group.add(this.nodes)

    const linePositions = new Float32Array(edges.length * 6)
    const lineTargets = new Float32Array(edges.length * 6)
    const lineSeeds = new Float32Array(edges.length * 2)

    edges.forEach(([a, b], index) => {
      const offset = index * 6
      for (let axis = 0; axis < 3; axis++) {
        linePositions[offset + axis] = chaos[a * 3 + axis]
        linePositions[offset + 3 + axis] = chaos[b * 3 + axis]
        lineTargets[offset + axis] = target[a * 3 + axis]
        lineTargets[offset + 3 + axis] = target[b * 3 + axis]
      }
      const seed = Math.random()
      lineSeeds[index * 2] = seed
      lineSeeds[index * 2 + 1] = seed
    })

    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('aBrain', new THREE.BufferAttribute(lineTargets, 3))
    lineGeometry.setAttribute('aEdge', new THREE.BufferAttribute(lineSeeds, 1))
    lineGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHAOS_RADIUS + 400)

    this.lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.ShaderMaterial({
        vertexShader: NEURAL_LINE_VERT,
        fragmentShader: NEURAL_LINE_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uOpacity: { value: 0 },
          uColorA: { value: new THREE.Color('#7c5cff') },
          uColorB: { value: new THREE.Color('#d8b26a') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.lines.frustumCulled = false
    this.group.add(this.lines)
  }

  private buildFlow(chaos: Float32Array, target: Float32Array, edges: [number, number][]) {
    if (!edges.length) return

    const count = this.quality.flowParticles
    const from = new Float32Array(count * 3)
    const fromTarget = new Float32Array(count * 3)
    const to = new Float32Array(count * 3)
    const toTarget = new Float32Array(count * 3)
    const offsets = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const [a, b] = edges[Math.floor(Math.random() * edges.length)]
      for (let axis = 0; axis < 3; axis++) {
        from[i * 3 + axis] = chaos[a * 3 + axis]
        fromTarget[i * 3 + axis] = target[a * 3 + axis]
        to[i * 3 + axis] = chaos[b * 3 + axis]
        toTarget[i * 3 + axis] = target[b * 3 + axis]
      }
      offsets[i] = Math.random()
      speeds[i] = 0.14 + Math.random() * 0.36
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geometry.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
    geometry.setAttribute('aFromBrain', new THREE.BufferAttribute(fromTarget, 3))
    geometry.setAttribute('aTo', new THREE.BufferAttribute(to, 3))
    geometry.setAttribute('aToBrain', new THREE.BufferAttribute(toTarget, 3))
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHAOS_RADIUS + 400)

    this.flow = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: NEURAL_FLOW_VERT,
        fragmentShader: NEURAL_FLOW_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uOpacity: { value: 0 },
          uScale: { value: window.innerHeight * 0.5 },
          uSize: { value: 4.4 },
          uColor: { value: new THREE.Color('#d8b26a') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.flow.frustumCulled = false
    this.group.add(this.flow)
  }

  private buildCore() {
    this.core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#9fd8ff', 256),
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.core.scale.setScalar(130)
    this.group.add(this.core)
  }
}

/**
 * 目标形态：AI 核心 —— 稠密内核 + 三层环带 + 稀疏外壳。
 * 与 nebula demo 的「大脑」形态刻意区分，但共用同一套着色器与连线逻辑。
 */
function corePoint(index: number, count: number) {
  const layer = index % 5
  const t = index / Math.max(1, count - 1)

  if (layer === 0) {
    // 内核：球体内均匀分布
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = Math.pow(Math.random(), 0.55) * 34
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * 0.86,
      radius * Math.sin(phi) * Math.sin(theta),
    )
  }

  if (layer <= 2) {
    // 环带：三层倾斜的粒子环，形成「算力轨道」
    const ring = layer - 1
    const angle = t * Math.PI * 2 * 3.2 + ring * 1.7
    const radius = 62 + ring * 26
    const wobble = Math.sin(angle * 3 + ring) * 5
    const x = Math.cos(angle) * (radius + wobble)
    const z = Math.sin(angle) * (radius + wobble)
    const y = Math.sin(angle * 2 + ring * 0.8) * (12 + ring * 4)
    const tilt = ring * 0.42

    return new THREE.Vector3(
      x,
      y * Math.cos(tilt) - z * Math.sin(tilt) * 0.35,
      z * Math.cos(tilt) + y * Math.sin(tilt) * 0.5,
    )
  }

  // 外壳：稀疏球壳
  const y = 1 - t * 2
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = GOLDEN * index
  const radius = 148 * (0.9 + Math.random() * 0.18)

  return new THREE.Vector3(
    Math.cos(theta) * radiusAtY * radius,
    y * radius * 0.8,
    Math.sin(theta) * radiusAtY * radius,
  )
}

/** k 近邻连线（k=4，去重），限制总边数 */
function buildEdges(target: Float32Array, count: number, maxEdges: number) {
  const edges: [number, number][] = []
  const best = new Int32Array(NEIGHBOURS)
  const bestDistance = new Float64Array(NEIGHBOURS)

  for (let i = 0; i < count; i++) {
    best.fill(-1)
    bestDistance.fill(Infinity)

    const xi = target[i * 3]
    const yi = target[i * 3 + 1]
    const zi = target[i * 3 + 2]

    for (let j = 0; j < count; j++) {
      if (j === i) continue
      const dx = xi - target[j * 3]
      const dy = yi - target[j * 3 + 1]
      const dz = zi - target[j * 3 + 2]
      const distance = dx * dx + dy * dy + dz * dz
      if (distance >= bestDistance[NEIGHBOURS - 1]) continue

      let slot = NEIGHBOURS - 1
      while (slot > 0 && bestDistance[slot - 1] > distance) {
        bestDistance[slot] = bestDistance[slot - 1]
        best[slot] = best[slot - 1]
        slot--
      }
      bestDistance[slot] = distance
      best[slot] = j
    }

    for (let k = 0; k < NEIGHBOURS; k++) {
      const j = best[k]
      if (j >= 0 && i < j) edges.push([i, j])
    }

    if (edges.length >= maxEdges) break
  }

  return edges
}
