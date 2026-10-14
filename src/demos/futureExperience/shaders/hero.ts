import { GLSL_HASH, GLSL_POINT_MASK } from '@/shared/shaders/common'

/** Cosmic Hero 星尘：聚合 / 流场漂移 / 穿越加速 / 分层视差（金—冰—白品牌色） */
export const HERO_DUST_VERT = /* glsl */ `
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
  float t = uTime * (0.04 + uSpeed * 0.05);
  vec3 drift = vec3(
    noise3(pos * 0.011 + vec3(t, 0.0, 0.0)),
    noise3(pos * 0.011 + vec3(0.0, t, 9.7)),
    noise3(pos * 0.011 + vec3(6.1, 0.0, t))
  ) - 0.5;
  pos += drift * (9.0 + 20.0 * uSpeed) * mix(1.0, 0.18, ease);

  // 滚动加速：粒子朝相机方向持续流动，产生穿越感
  float flow = mod(uTime * (4.0 + uSpeed * 13.0) * (0.35 + aSeed) + aSeed * 240.0, 280.0) - 140.0;
  pos.z += flow * (0.03 + 0.085 * uSpeed) * mix(0.5, 1.0, ease);

  // 鼠标视差：离中心越远位移越大
  float depth = clamp(length(target) / 150.0, 0.0, 1.0);
  pos.xy += uPointer * (3.0 + depth * 18.0) * mix(0.35, 1.0, ease);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * aSize * (uScale / max(1.0, -mv.z)), 0.8, 14.0);

  float near = smoothstep(0.5, 16.0, -mv.z);
  float far = 1.0 - smoothstep(260.0, 780.0, -mv.z);
  float twinkle = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.2) + aSeed * 44.0);

  vAlpha = near * far * mix(0.04, 0.68, ease) * twinkle * uOpacity;
  vSeed = aSeed;
}
`

export const HERO_DUST_FRAG = /* glsl */ `
uniform vec3 uColorCore;
uniform vec3 uColorIce;
uniform vec3 uColorGold;

varying float vAlpha;
varying float vSeed;
${GLSL_POINT_MASK}

void main() {
  float mask = pointMask(gl_PointCoord, 0.46);
  if (mask <= 0.002) discard;

  float pick = fract(vSeed * 6.3);
  vec3 color = mix(uColorCore, uColorIce, smoothstep(0.0, 0.6, pick));
  color = mix(color, uColorGold, smoothstep(0.62, 1.0, pick));

  gl_FragColor = vec4(color, mask * vAlpha);
  #include <colorspace_fragment>
}
`

/** 3D 标题平面：文字 + 轻微扫描光泽 */
export const HERO_TITLE_VERT = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const HERO_TITLE_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uGlow;

varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uMap, vUv);
  if (tex.a <= 0.01) discard;

  // 沿文字表面扫过的高光
  float sweep = smoothstep(0.0, 1.0, sin((vUv.x + vUv.y) * 3.2 - uTime * 0.9) * 0.5 + 0.5);
  vec3 color = tex.rgb + uGlow * sweep * 0.35;

  gl_FragColor = vec4(color, tex.a * uOpacity);
  #include <colorspace_fragment>
}
`
