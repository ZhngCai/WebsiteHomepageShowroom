/** AI 宇宙：节点 / 突触连线 / 流动粒子 —— 全部在 GPU 完成「混沌 → 大脑」形态插值 */

export const NEURAL_NODE_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uScale;
uniform float uSize;

attribute vec3 aBrain;
attribute float aSeed;

varying float vAlpha;
varying float vSeed;

void main() {
  vec3 pos = mix(position, aBrain, uMorph);

  // 混沌期额外抖动
  pos += vec3(
    sin(uTime * 0.7 + aSeed * 30.0),
    cos(uTime * 0.6 + aSeed * 22.0),
    sin(uTime * 0.5 + aSeed * 18.0)
  ) * (1.0 - uMorph) * 7.0;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * (0.6 + aSeed) * (uScale / max(1.0, -mv.z)), 1.0, 24.0);

  float depth = -mv.z;
  vAlpha = (1.0 - smoothstep(160.0, 460.0, depth)) * (0.35 + 0.65 * uMorph);
  vSeed = aSeed;
}
`

export const NEURAL_NODE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vSeed;

float pointMask(vec2 coord, float softness) {
  float d = length(coord - 0.5);
  return 1.0 - smoothstep(0.5 - softness, 0.5, d);
}

void main() {
  float mask = pointMask(gl_PointCoord, 0.34);
  if (mask <= 0.004) discard;

  vec3 color = mix(uColorA, uColorB, step(0.72, fract(vSeed * 7.3)));
  gl_FragColor = vec4(color, mask * vAlpha);
  #include <colorspace_fragment>
}
`

export const NEURAL_LINE_VERT = /* glsl */ `
uniform float uMorph;

attribute vec3 aBrain;
attribute float aEdge;

varying float vAlpha;
varying float vEdge;

void main() {
  vec3 pos = mix(position, aBrain, uMorph);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mv;
  vEdge = aEdge;
  vAlpha = (1.0 - smoothstep(160.0, 460.0, -mv.z)) * uMorph;
}
`

export const NEURAL_LINE_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vEdge;

void main() {
  // 突触随机放电
  float pulse = smoothstep(0.82, 1.0, sin(uTime * 1.3 + vEdge * 17.0));
  vec3 color = mix(uColorA, uColorB, pulse);
  float alpha = vAlpha * (0.08 + pulse * 0.72);

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`

export const NEURAL_FLOW_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uScale;
uniform float uSize;

attribute vec3 aFrom;
attribute vec3 aFromBrain;
attribute vec3 aTo;
attribute vec3 aToBrain;
attribute float aOffset;
attribute float aSpeed;

varying float vAlpha;

void main() {
  float t = fract(uTime * aSpeed + aOffset);

  vec3 from = mix(aFrom, aFromBrain, uMorph);
  vec3 to = mix(aTo, aToBrain, uMorph);
  vec3 pos = mix(from, to, t);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * (uScale / max(1.0, -mv.z)), 1.0, 16.0);

  // 两端淡出，形成沿突触流动的脉冲
  vAlpha = sin(t * 3.14159265) * (1.0 - smoothstep(160.0, 460.0, -mv.z)) * uMorph;
}
`

export const NEURAL_FLOW_FRAG = /* glsl */ `
uniform vec3 uColor;

varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float mask = 1.0 - smoothstep(0.18, 0.5, d);
  if (mask <= 0.004) discard;

  gl_FragColor = vec4(uColor, mask * vAlpha);
  #include <colorspace_fragment>
}
`
