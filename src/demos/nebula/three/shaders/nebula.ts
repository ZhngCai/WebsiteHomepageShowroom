import { GLSL_HASH, GLSL_POINT_MASK } from './common'

/** 星云粒子：聚合 / 流场漂移 / 穿越加速 / 分层视差 */
export const NEBULA_PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSpeed;
uniform float uOpacity;
uniform float uScale;
uniform float uSize;
uniform vec2 uPointer;

attribute vec3 aScatter;
attribute float aSeed;
attribute float aSize;

varying float vAlpha;
varying float vSeed;
${GLSL_HASH}

void main() {
  float morph = clamp(uMorph, 0.0, 1.0);
  float ease = 1.0 - pow(1.0 - morph, 3.0);

  vec3 target = position;
  vec3 pos = mix(aScatter, target, ease);

  // 缓慢流场漂移
  float t = uTime * (0.05 + uSpeed * 0.05);
  vec3 drift = vec3(
    noise3(pos * 0.012 + vec3(t, 0.0, 0.0)),
    noise3(pos * 0.012 + vec3(0.0, t, 11.7)),
    noise3(pos * 0.012 + vec3(7.3, 0.0, t))
  ) - 0.5;
  pos += drift * (8.0 + 18.0 * uSpeed) * mix(1.0, 0.16, ease);

  // 滚动加速：粒子持续朝相机方向流动，产生穿越星云的速度感
  float flow = mod(uTime * (4.0 + uSpeed * 12.0) * (0.35 + aSeed) + aSeed * 220.0, 260.0) - 130.0;
  pos.z += flow * (0.03 + 0.08 * uSpeed) * mix(0.5, 1.0, ease);

  // 鼠标视差：离核心越远位移越大，形成分层深度
  float depth = clamp(length(target) / 130.0, 0.0, 1.0);
  pos.xy += uPointer * (3.0 + depth * 16.0) * mix(0.35, 1.0, ease);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * aSize * (uScale / max(1.0, -mv.z)), 0.8, 15.0);

  float near = smoothstep(0.5, 14.0, -mv.z);
  float far = 1.0 - smoothstep(180.0, 560.0, -mv.z);
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 40.0);

  vAlpha = near * far * mix(0.05, 0.62, ease) * twinkle * mix(1.0, 1.3, min(uSpeed, 3.0) * 0.3) * uOpacity;
  vSeed = aSeed;
}
`

export const NEBULA_PARTICLE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

varying float vAlpha;
varying float vSeed;
${GLSL_POINT_MASK}

void main() {
  float mask = pointMask(gl_PointCoord, 0.45);
  if (mask <= 0.002) discard;

  float pick = fract(vSeed * 5.7);
  vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, pick));
  color = mix(color, uColorC, smoothstep(0.72, 1.0, pick) * 0.85);

  gl_FragColor = vec4(color, mask * vAlpha);
  #include <colorspace_fragment>
}
`

/** 巨大透明星球：菲涅尔玻璃壳 */
export const GLASS_PLANET_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocal;

void main() {
  vLocal = position;
  vNormal = normalize(normalMatrix * normal);

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mv.xyz);

  gl_Position = projectionMatrix * mv;
}
`

export const GLASS_PLANET_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uRimColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocal;
${GLSL_HASH}

void main() {
  float facing = abs(dot(normalize(vNormal), normalize(vViewDir)));
  float fresnel = pow(1.0 - facing, 2.6);

  float bands = 0.5 + 0.5 * sin(vLocal.y * 0.06 + uTime * 0.25);
  float grain = noise3(vLocal * 0.05 + vec3(uTime * 0.05, 0.0, 0.0)) * 0.35;

  vec3 color = mix(uColor, uRimColor, fresnel) * (0.22 + fresnel * 1.7 + bands * 0.16 + grain);
  float alpha = (0.04 + fresnel * 0.62 + grain * 0.05) * uOpacity;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  #include <colorspace_fragment>
}
`
