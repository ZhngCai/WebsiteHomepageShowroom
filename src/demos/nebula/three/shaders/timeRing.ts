/** 时间环：沿管体的能量流动 + 管壁高光 */
export const TIME_RING_VERT = /* glsl */ `
uniform float uTime;
uniform float uSpeed;

varying vec2 vUv;
varying float vFlow;

void main() {
  vUv = uv;
  vFlow = fract(uv.x * 5.0 - uTime * (0.1 + uSpeed * 0.28));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const TIME_RING_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying vec2 vUv;
varying float vFlow;

void main() {
  float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
  float pulse = pow(vFlow, 2.5);
  float bands = 0.5 + 0.5 * sin(vUv.x * 120.0);

  vec3 color = mix(uColorA, uColorB, pulse) * (0.6 + pulse * 0.9);
  float alpha = (0.06 + pulse * 0.8) * edge * uOpacity * (0.72 + bands * 0.28);

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  #include <colorspace_fragment>
}
`
