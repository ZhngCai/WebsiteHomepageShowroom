import * as THREE from 'three'
import gsap from 'gsap'
import { createRadialGlowTexture } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../scene'
import {
  NEURAL_FLOW_FRAG,
  NEURAL_FLOW_VERT,
  NEURAL_LINE_FRAG,
  NEURAL_LINE_VERT,
  NEURAL_NODE_FRAG,
  NEURAL_NODE_VERT,
} from '../shaders/neural'
import { BaseWorld, type FrameContext } from '../World'

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const CHAOS_RADIUS = 250

/**
 * 05 AI 宇宙 —— 1000 个节点从混沌态逐渐连接成神经网络。
 * 形态插值、突触放电、粒子流动全部在 GPU 完成，CPU 每帧只写 uniform。
 */
export class NeuralWorld extends BaseWorld {
  readonly id = 'ai-universe'
  readonly index = 4

  private readonly quality: QualityProfile
  private nodes: THREE.Points | null = null
  private lines: THREE.LineSegments | null = null
  private flow: THREE.Points | null = null
  private core: THREE.Sprite | null = null
  private appear = 0
  private progress = 0

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    const count = this.quality.neuralNodes
    const chaos = new Float32Array(count * 3)
    const brain = new Float32Array(count * 3)
    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 混沌态：大球体内随机分布
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 60 + Math.pow(Math.random(), 0.6) * CHAOS_RADIUS
      chaos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      chaos[i * 3 + 1] = radius * Math.cos(phi)
      chaos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      const point = brainPoint(i, count)
      brain[i * 3] = point.x
      brain[i * 3 + 1] = point.y
      brain[i * 3 + 2] = point.z

      seeds[i] = Math.random()
    }

    this.buildNodes(chaos, brain, seeds, count)
    this.buildFlow(chaos, brain)
    this.buildCore()
  }

  protected onEnter() {
    gsap.to(this, { appear: 1, duration: 1.4, ease: 'power2.out', overwrite: true })
  }

  protected onLeave() {
    gsap.to(this, { appear: 0.3, duration: 1.2, ease: 'power2.out', overwrite: true })
  }

  setProgress(progress: number) {
    this.progress = progress
  }

  update(ctx: FrameContext) {
    // 混沌 → 大脑：滚动进度驱动形态插值
    const morph = Math.min(1, Math.max(0, this.progress)) * this.appear

    const nodeMaterial = this.nodes?.material as THREE.ShaderMaterial | undefined
    if (nodeMaterial) {
      nodeMaterial.uniforms.uTime.value = ctx.time
      nodeMaterial.uniforms.uMorph.value = morph
    }

    const lineMaterial = this.lines?.material as THREE.ShaderMaterial | undefined
    if (lineMaterial) {
      lineMaterial.uniforms.uTime.value = ctx.time
      lineMaterial.uniforms.uMorph.value = morph
    }

    const flowMaterial = this.flow?.material as THREE.ShaderMaterial | undefined
    if (flowMaterial) {
      flowMaterial.uniforms.uTime.value = ctx.time
      flowMaterial.uniforms.uMorph.value = morph
    }

    if (this.core) {
      const scale = 150 + morph * 60 + Math.sin(ctx.time * 0.8) * 6
      this.core.scale.setScalar(scale)
      ;(this.core.material as THREE.SpriteMaterial).opacity = 0.12 + morph * 0.22
    }

    if (this.nodes) this.nodes.rotation.y = ctx.time * 0.02
    if (this.lines) this.lines.rotation.y = ctx.time * 0.02
    if (this.flow) this.flow.rotation.y = ctx.time * 0.02
  }

  private buildNodes(chaos: Float32Array, brain: Float32Array, seeds: Float32Array, count: number) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(chaos, 3))
    geometry.setAttribute('aBrain', new THREE.BufferAttribute(brain, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHAOS_RADIUS + 400)

    const material = new THREE.ShaderMaterial({
      vertexShader: NEURAL_NODE_VERT,
      fragmentShader: NEURAL_NODE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uScale: { value: window.innerHeight * 0.5 },
        uSize: { value: 2.7 },
        uColorA: { value: new THREE.Color('#a78bfa') },
        uColorB: { value: new THREE.Color('#e9fbff') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.nodes = new THREE.Points(geometry, material)
    this.nodes.frustumCulled = false
    this.group.add(this.nodes)

    // 突触连线：k 近邻（k=2）构建静态缓冲，形态插值交给顶点着色器
    const edges = buildEdges(brain, count, this.quality.neuralEdges)
    const linePositions = new Float32Array(edges.length * 2 * 3)
    const lineBrain = new Float32Array(edges.length * 2 * 3)
    const lineEdges = new Float32Array(edges.length * 2)

    edges.forEach(([a, b], index) => {
      const offset = index * 6
      linePositions[offset] = chaos[a * 3]
      linePositions[offset + 1] = chaos[a * 3 + 1]
      linePositions[offset + 2] = chaos[a * 3 + 2]
      linePositions[offset + 3] = chaos[b * 3]
      linePositions[offset + 4] = chaos[b * 3 + 1]
      linePositions[offset + 5] = chaos[b * 3 + 2]

      lineBrain[offset] = brain[a * 3]
      lineBrain[offset + 1] = brain[a * 3 + 1]
      lineBrain[offset + 2] = brain[a * 3 + 2]
      lineBrain[offset + 3] = brain[b * 3]
      lineBrain[offset + 4] = brain[b * 3 + 1]
      lineBrain[offset + 5] = brain[b * 3 + 2]

      const seed = Math.random()
      lineEdges[index * 2] = seed
      lineEdges[index * 2 + 1] = seed
    })

    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('aBrain', new THREE.BufferAttribute(lineBrain, 3))
    lineGeometry.setAttribute('aEdge', new THREE.BufferAttribute(lineEdges, 1))
    lineGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHAOS_RADIUS + 400)

    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: NEURAL_LINE_VERT,
      fragmentShader: NEURAL_LINE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uColorA: { value: new THREE.Color('#7c5cff') },
        uColorB: { value: new THREE.Color('#bff4ff') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    this.lines.frustumCulled = false
    this.group.add(this.lines)
  }

  /** 沿突触流动的粒子：位置由两个节点插值得到，整段动画在 GPU 上完成 */
  private buildFlow(chaos: Float32Array, brain: Float32Array) {
    const count = this.quality.flowParticles
    const nodeCount = this.quality.neuralNodes

    const from = new Float32Array(count * 3)
    const fromBrain = new Float32Array(count * 3)
    const to = new Float32Array(count * 3)
    const toBrain = new Float32Array(count * 3)
    const offsets = new Float32Array(count)
    const speeds = new Float32Array(count)
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * nodeCount)
      let b = Math.floor(Math.random() * nodeCount)
      if (b === a) b = (b + 1) % nodeCount

      from[i * 3] = chaos[a * 3]
      from[i * 3 + 1] = chaos[a * 3 + 1]
      from[i * 3 + 2] = chaos[a * 3 + 2]
      fromBrain[i * 3] = brain[a * 3]
      fromBrain[i * 3 + 1] = brain[a * 3 + 1]
      fromBrain[i * 3 + 2] = brain[a * 3 + 2]

      to[i * 3] = chaos[b * 3]
      to[i * 3 + 1] = chaos[b * 3 + 1]
      to[i * 3 + 2] = chaos[b * 3 + 2]
      toBrain[i * 3] = brain[b * 3]
      toBrain[i * 3 + 1] = brain[b * 3 + 1]
      toBrain[i * 3 + 2] = brain[b * 3 + 2]

      offsets[i] = Math.random()
      speeds[i] = 0.14 + Math.random() * 0.36
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
    geometry.setAttribute('aFromBrain', new THREE.BufferAttribute(fromBrain, 3))
    geometry.setAttribute('aTo', new THREE.BufferAttribute(to, 3))
    geometry.setAttribute('aToBrain', new THREE.BufferAttribute(toBrain, 3))
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHAOS_RADIUS + 400)

    const material = new THREE.ShaderMaterial({
      vertexShader: NEURAL_FLOW_VERT,
      fragmentShader: NEURAL_FLOW_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uScale: { value: window.innerHeight * 0.5 },
        uSize: { value: 4.6 },
        uColor: { value: new THREE.Color('#8ff0ff') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.flow = new THREE.Points(geometry, material)
    this.flow.frustumCulled = false
    this.group.add(this.flow)
  }

  private buildCore() {
    this.core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#a78bfa', 256),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.core.scale.setScalar(160)
    this.group.add(this.core)
  }

  resize(_width: number, height: number) {
    const scale = height * 0.5
    for (const object of [this.nodes, this.flow]) {
      const material = object?.material as THREE.ShaderMaterial | undefined
      if (material) material.uniforms.uScale.value = scale
    }
  }
}

/** 类脑点云：椭球 + 半球分叶 + 中央沟 + 表面扰动 */
function brainPoint(index: number, count: number) {
  const y = 1 - (index / Math.max(1, count - 1)) * 2
  const radius = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = GOLDEN * index

  let x = Math.cos(theta) * radius
  let yy = y
  let z = Math.sin(theta) * radius

  const lobe = 1 + 0.14 * Math.sin(theta * 6) * Math.cos(y * 5)
  const groove = 1 - 0.22 * Math.exp(-Math.pow(x / 0.14, 2))

  const scaleX = 92
  const scaleY = 74
  const scaleZ = 108

  x *= scaleX * lobe * groove
  yy *= scaleY * lobe * groove
  z *= scaleZ * lobe

  const noise = (Math.sin(x * 0.08) + Math.cos(z * 0.07) + Math.sin(yy * 0.09)) * 3.6

  return new THREE.Vector3(x + noise, yy + noise * 0.6, z - noise * 0.8)
}

/** k 近邻连线（k=2，去重），限制总边数 */
function buildEdges(brain: Float32Array, count: number, maxEdges: number) {
  const edges: [number, number][] = []

  for (let i = 0; i < count; i++) {
    let best1 = -1
    let best2 = -1
    let d1 = Infinity
    let d2 = Infinity

    const xi = brain[i * 3]
    const yi = brain[i * 3 + 1]
    const zi = brain[i * 3 + 2]

    for (let j = 0; j < count; j++) {
      if (j === i) continue
      const dx = xi - brain[j * 3]
      const dy = yi - brain[j * 3 + 1]
      const dz = zi - brain[j * 3 + 2]
      const distance = dx * dx + dy * dy + dz * dz

      if (distance < d1) {
        d2 = d1
        best2 = best1
        d1 = distance
        best1 = j
      } else if (distance < d2) {
        d2 = distance
        best2 = j
      }
    }

    if (best1 >= 0 && i < best1) edges.push([i, best1])
    if (best2 >= 0 && i < best2) edges.push([i, best2])
    if (edges.length >= maxEdges) break
  }

  return edges
}
