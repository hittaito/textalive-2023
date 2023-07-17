uniform vec2 uResolution;

out vec2 vUv;
out vec2 vR;
out vec2 vL;
out vec2 vT;
out vec2 vB;

void main() {
  vUv = uv;
  vL = vUv - vec2(uResolution.x, 0.0);
  vR = vUv + vec2(uResolution.x, 0.0);
  vT = vUv + vec2(0.0, uResolution.y);
  vB = vUv - vec2(0.0, uResolution.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}