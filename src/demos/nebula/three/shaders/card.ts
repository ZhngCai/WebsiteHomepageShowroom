/** 卡片星球：图集采样 + 圆角描边 + 悬浮高亮（InstancedMesh 单次 draw call） */

export const CARD_VERT = /* glsl */ `
uniform float uTime;
uniform float uGather;
uniform float uOpacity;
uniform float uScatter;

attribute float aTile;
attribute float aSeed;
attribute float aHighlight;

varying vec2 vUv;
varying float vTile;
varying float vFade;
varying float vHighlight;

void main() {
  vUv = uv;
  vTile = aTile;
  vHighlight = aHighlight;

  vec3 transformed = position;

  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
  #endif

  vec3 outward = normalize(transformed + vec3(0.001));

  // 进入：从远处聚合；滚动：卡片向外散开
  transformed += outward * ((1.0 - uGather) * 46.0 + uScatter * 7.0);
  transformed.y += sin(uTime * 0.7 + aSeed * 32.0) * 0.32;

  vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
  vFade = (1.0 - smoothstep(150.0, 420.0, -mv.z)) * clamp(uOpacity, 0.0, 1.0);

  gl_Position = projectionMatrix * mv;
}
`

export const CARD_FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uCols;
uniform vec3 uAccent;

varying vec2 vUv;
varying float vTile;
varying float vFade;
varying float vHighlight;

void main() {
  float col = mod(vTile, uCols);
  float row = floor(vTile / uCols);
  vec2 uv = (vec2(col, row) + clamp(vUv, 0.004, 0.996)) / uCols;
  vec4 tex = texture2D(uAtlas, uv);

  // 圆角矩形 SDF
  vec2 q = abs(vUv - 0.5) - (0.5 - 0.055);
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.055;

  float mask = 1.0 - smoothstep(-0.005, 0.003, dist);
  if (mask <= 0.01) discard;

  float border = smoothstep(-0.035, -0.004, dist);
  vec3 color = tex.rgb + uAccent * (border * (0.25 + vHighlight * 0.75) + vHighlight * 0.18);
  float alpha = (tex.a * 0.95 + border * 0.45) * mask * vFade;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  #include <colorspace_fragment>
}
`
