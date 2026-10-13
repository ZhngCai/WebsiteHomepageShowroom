import * as THREE from 'three'
import gsap from 'gsap'
import { createRadialGlowTexture } from '@/shared/three/textures'
import type { QualityProfile } from '@/shared/utils/device'
import { createNebulaParticles } from '../particles'
import { worldZ } from '../scene'
import { GLASS_PLANET_FRAG, GLASS_PLANET_VERT } from '../shaders/nebula'
import { BaseWorld, createFadeGroup, exitFade, type FrameContext } from '../World'

/**
 * 01 星云入口 —— 上万粒子构成的旋臂星云 + 中心巨大透明星球。
 * 进入：粒子从四周聚合；滚动：速度上升，相机穿越星云。
 */
export class NebulaWorld extends BaseWorld {
  readonly id = 'nebula'
  readonly index = 0

  private readonly quality: QualityProfile
  private particles: ReturnType<typeof createNebulaParticles> | null = null
  private planet: THREE.Mesh | null = null
  private core: THREE.Group | null = null
  private planetUniforms: {
    uTime: { value: number }
    uColor: { value: THREE.Color }
    uRimColor: { value: THREE.Color }
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

    this.particles = createNebulaParticles(this.quality.nebulaParticles)
    this.group.add(this.particles.object)

    this.buildPlanet()
  }

  protected onEnter() {
    if (this.particles) {
      gsap.to(this.particles.uniforms.uMorph, {
        value: 1,
        duration: 2.6,
        delay: 0.7,
        ease: 'power2.out',
        overwrite: true,
      })
    }
    gsap.to(this, { appear: 1, duration: 2.2, delay: 1.1, ease: 'power2.out', overwrite: true })
  }

  setProgress(progress: number) {
    this.progress = progress
  }

  resize(_width: number, height: number) {
    this.particles?.resize(height)
  }

  update(ctx: FrameContext) {
    if (!this.particles) return

    this.exit = exitFade(this.progress)
    const opacity = this.appear * this.exit

    // 滚动速度变化：静止 0.6 → 穿越 3.0
    this.particles.update(ctx.time, 0.6 + this.progress * 2.4, ctx.pointer, this.exit)
    this.particles.object.rotation.z = ctx.time * 0.012

    if (this.planetUniforms) {
      this.planetUniforms.uTime.value = ctx.time
      this.planetUniforms.uOpacity.value = opacity
    }

    this.fadeGroup?.set(opacity)

    if (this.core) {
      this.core.rotation.y = ctx.time * 0.09
      this.core.rotation.x = Math.sin(ctx.time * 0.14) * 0.12
    }

    if (this.planet) {
      const breathe = 1 + Math.sin(ctx.time * 0.6) * 0.02
      this.planet.scale.setScalar(breathe)
    }
  }

  private buildPlanet() {
    const planetUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#6f7dff') },
      uRimColor: { value: new THREE.Color('#9ff2ff') },
      uOpacity: { value: 0 },
    }
    this.planetUniforms = planetUniforms

    const geometry = new THREE.IcosahedronGeometry(17, 5)
    const material = new THREE.ShaderMaterial({
      vertexShader: GLASS_PLANET_VERT,
      fragmentShader: GLASS_PLANET_FRAG,
      uniforms: planetUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })

    this.planet = new THREE.Mesh(geometry, material)

    const core = new THREE.Group()
    core.add(this.planet)

    const wireGeometry = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(19, 2))
    const wireMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#8fa6ff'),
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    core.add(new THREE.LineSegments(wireGeometry, wireMaterial))

    const glowTexture = createRadialGlowTexture('#7c5cff', 256)
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    glow.scale.setScalar(132)
    core.add(glow)

    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('#dff0ff', 256),
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    coreGlow.scale.setScalar(46)
    core.add(coreGlow)

    this.core = core
    this.group.add(core)
    this.fadeGroup = createFadeGroup(core)
  }
}
