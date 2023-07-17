uniform sampler2D uMap;

in vec2 vUv;

out vec4 oColor;

void main() {
  vec4 texel = texture(uMap, vUv);
  float v1 = (vUv.y - .5) * 1.;
  v1 = 1. -  v1 * v1;

  float v2 = (vUv.y - .5) * 1.8;
  v2 = 1. - v2 * v2;

  float v = vUv.y > .5 ? v1 : v2;

  oColor = texel * v;
  // oColor = vec4(vec3(v), 1.);
}