#define PI acos(-1.)

uniform float uTime;

out vec2 vUv;

void main() {
  vUv = uv;

  vec3 pos = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}