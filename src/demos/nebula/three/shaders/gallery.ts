/** 无限画廊：随机漂浮 + 着色器景深（焦点平面外自动虚化） */

export const GALLERY_VERT = /* glsl */ `
uniform float uTime;
uniform float uAppear;
uniform float uSpeed;
uniform float uFocus;
uniform float uFocusRange;

attribute float aTile;
attribute float aSeed;

varying vec2 vUv;
varying float vTile;
varying float vBlur;
varying float vFade;

void main() {
  vUv = uv;
  vTile = aTile;

  vec3 transformed = position;

  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
  #endif

  // 随机漂浮
  float amp = 1.0 + uSpeed * 1.6;
  transformed.x += sin(uTime * (0.3 + aSeed * 0.5) + aSeed * 20.0) * 1.7 * amp;
  transformed.y += cos(uTime * (0.25 + aSeed * 0.4) + aSeed * 14.0) * 1.7 * amp;
  transformed.z += sin(uTime * 0.22 + aSeed * 30.0) * 2.4 * amp;

  vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
  float depth = -mv.z;

  // 景深：距离焦点平面越远越模糊
  vBlur = clamp(abs(depth - uFocus) / uFocusRange, 0.0, 1.0);

  // 相机身后的图块淡出，远处淡入黑暗
  vFade = (1.0 - smoothstep(200.0, 420.0, depth)) * smoothstep(-30.0, 70.0, depth) * clamp(uAppear, 0.0, 1.0);

  gl_Position = projectionMatrix * mv;
}
`

export const GALLERY_FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uCols;
uniform vec3 uAccent;

varying vec2 vUv;
varying float vTile;
varying float vBlur;
varying float vFade;

void main() {
  float col = mod(vTile, uCols);
  float row = floor(vTile / uCols);
  vec2 base = (vec2(col, row) + clamp(vUv, 0.008, 0.992)) / uCols;

  float radius = vBlur * 0.022 / uCols;

  vec4 tex = texture2D(uAtlas, base);
  if (radius > 0.0004) {
    tex += texture2D(uAtlas, base + vec2(radius, 0.0));
    tex += texture2D(uAtlas, base - vec2(radius, 0.0));
    tex += texture2D(uAtlas, base + vec2(0.0, radius));
    tex += texture2D(uAtlas, base - vec2(0.0, radius));
    tex *= 0.2;
  }

  // 圆角矩形
  vec2 q = abs(vUv - 0.5) - (0.5 - 0.022);
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.022;
  float mask = 1.0 - smoothstep(-0.004, 0.003, dist);
  if (mask <= 0.01) discard;

  float border = smoothstep(-0.022, -0.003, dist);
  vec3 color = tex.rgb + uAccent * border * 0.4 * (1.0 - vBlur * 0.7);
  float alpha = (tex.a * 0.92 + border * 0.32) * mask * vFade;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  #include <colorspace_fragment>
}
`
