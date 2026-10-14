/** 可复用的 GLSL 片段（hash / 噪声 / 点精灵 / 深度淡出） */

export const GLSL_HASH = /* glsl */ `
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash13(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash13(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(i + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}
`

/** 圆形点精灵遮罩 */
export const GLSL_POINT_MASK = /* glsl */ `
float pointMask(vec2 coord, float softness) {
  float d = length(coord - 0.5);
  return 1.0 - smoothstep(0.5 - softness, 0.5, d);
}
`

/** 相机距离淡出（替代 fog，用于自定义 ShaderMaterial） */
export const GLSL_DEPTH_FADE = /* glsl */ `
float depthFade(float viewZ, float near, float far) {
  return 1.0 - smoothstep(near, far, -viewZ);
}
`
