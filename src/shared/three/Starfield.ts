import * as THREE from 'three'

const VERT = /* glsl */ `
uniform float uTime;
uniform float uScale;
uniform float uSize;
attribute float aSeed;
varying float vTwinkle;
varying float vSeed;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);

  float twinkle = 0.45 + 0.55 * sin(uTime * (0.4 + aSeed * 0.9) + aSeed * 42.0);
  vTwinkle = twinkle;
  vSeed = aSeed;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(uSize * (0.5 + aSeed) * (uScale / max(1.0, -mv.z)), 22.0);
}
`

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vTwinkle;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float mask = 1.0 - smoothstep(0.08, 0.5, d);
  if (mask <= 0.002) discard;

  vec3 color = mix(uColorA, uColorB, vSeed);
  float alpha = mask * vTwinkle;
  gl_FragColor = vec4(color * alpha, alpha);
  #include <colorspace_fragment>
}
`

export interface StarfieldOptions {
  count: number
  size?: number
  colorA?: string
  colorB?: string
  /** 半径区间 */
  radius?: [number, number]
  /** 是否随相机移动（作为天空盒，保证飞行途中始终有星空） */
  followCamera?: boolean
}

/**
 * 远景星尘 —— 常驻于所有世界背后的星空。
 * 独立于各世界之外，为整段滚动旅程提供空间连续感。
 */
export function createStarfield(options: StarfieldOptions) {
  const { count, size = 3, colorA = '#8fa6ff', colorB = '#ffd9f0', radius = [420, 1320], followCamera = true } = options

  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const r = radius[0] + Math.random() * (radius[1] - radius[0])
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const sinPhi = Math.sin(phi)

    positions[i * 3] = r * sinPhi * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.7
    positions[i * 3 + 2] = r * sinPhi * Math.sin(theta)
    seeds[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: window.innerHeight * 0.5 },
      uSize: { value: size },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.matrixAutoUpdate = false

  const group = new THREE.Group()
  group.add(points)

  return {
    group,
    update(time: number, camera?: THREE.PerspectiveCamera) {
      material.uniforms.uTime.value = time
      group.rotation.y = time * 0.006
      group.rotation.x = Math.sin(time * 0.05) * 0.02
      if (followCamera && camera) group.position.copy(camera.position)
    },
    resize(height: number) {
      material.uniforms.uScale.value = height * 0.5
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
