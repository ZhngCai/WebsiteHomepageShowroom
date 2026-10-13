/** 奇点：粒子/卡片/数据节点聚合为巨大光球 → 爆炸 */

export const SINGULARITY_PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uBurst;
uniform float uScale;
uniform float uSize;

attribute vec3 aStart;
attribute vec3 aOrb;
attribute float aSeed;
attribute float aKind;

varying float vAlpha;
varying float vSeed;
varying float vKind;

void main() {
  float morph = clamp(uMorph, 0.0, 1.0);
  float ease = morph * morph * (3.0 - 2.0 * morph);

  vec3 pos = mix(aStart, aOrb, ease);

  // 聚合过程中的螺旋吸入
  float swirl = (1.0 - ease) * 7.0;
  pos.xz += vec2(sin(uTime * 0.5 + aSeed * 20.0), cos(uTime * 0.5 + aSeed * 16.0)) * swirl;

  // 爆炸：沿径向飞出
  float burst = clamp(uBurst, 0.0, 1.0);
  pos += normalize(pos + vec3(0.001)) * burst * burst * (70.0 + aSeed * 260.0);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * (0.6 + aSeed) * (uScale / max(1.0, -mv.z)), 1.0, 30.0);

  vAlpha = (1.0 - smoothstep(220.0, 760.0, -mv.z)) * (1.0 - burst * 0.55) * (0.35 + ease * 0.85);
  vSeed = aSeed;
  vKind = aKind;
}
`

export const SINGULARITY_PARTICLE_FRAG = /* glsl */ `
uniform vec3 uColorParticle;
uniform vec3 uColorCard;
uniform vec3 uColorNode;
uniform float uMorph;

varying float vAlpha;
varying float vSeed;
varying float vKind;

float pointMask(vec2 coord, float softness) {
  float d = length(coord - 0.5);
  return 1.0 - smoothstep(0.5 - softness, 0.5, d);
}

void main() {
  float mask = pointMask(gl_PointCoord, 0.4);
  if (mask <= 0.003) discard;

  vec3 color = vKind < 0.5 ? uColorParticle : (vKind < 1.5 ? uColorCard : uColorNode);
  // 聚合后整体趋近白热
  color = mix(color, vec3(1.0), uMorph * 0.55);

  gl_FragColor = vec4(color, mask * vAlpha);
  #include <colorspace_fragment>
}
`

export const ORB_VERT = /* glsl */ `
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

export const ORB_FRAG = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocal;

float hash13(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void main() {
  float facing = abs(dot(normalize(vNormal), normalize(vViewDir)));
  float fresnel = pow(1.0 - facing, 2.2);

  float energy = hash13(floor(vLocal * 0.35 + vec3(uTime * 0.35))) * 0.6
               + 0.5 * sin(vLocal.y * 0.22 - uTime * 1.6);

  vec3 color = mix(uColorA, uColorB, fresnel) * (0.5 + energy * 0.9 + fresnel * 1.6) * uIntensity;
  float alpha = clamp((0.12 + fresnel * 0.7 + energy * 0.25) * uIntensity, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`
