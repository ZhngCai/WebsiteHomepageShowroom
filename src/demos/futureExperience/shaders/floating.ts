/** 漂浮物体：菲涅尔边缘光（无需灯光，纯着色器表现） */

export const FLOATING_VERT = /* glsl */ `
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

export const FLOATING_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocal;

void main() {
  float facing = abs(dot(normalize(vNormal), normalize(vViewDir)));
  float fresnel = pow(1.0 - facing, 1.9);

  // 表面缓慢流动的纹理带
  float band = 0.5 + 0.5 * sin(vLocal.y * 2.4 + uTime * 0.4);

  vec3 color = mix(uColorA, uColorB, fresnel) * (0.34 + band * 0.26 + fresnel * 1.35);
  float alpha = clamp(uOpacity * (0.42 + fresnel * 0.58), 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`
