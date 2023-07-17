uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uResolution;

in vec2 vUv;
in vec2 vR;
in vec2 vL;
in vec2 vT;
in vec2 vB;

out vec4 oColor;

void main() {
  // ivec2 st = ivec2(vUv * vec2(textureSize(uPressure, 0)));
  // float px1 = texelFetch(uPressure, st+ivec2( 1, 0), 0).x;
  // float px2 = texelFetch(uPressure, st+ivec2(-1, 0), 0).x;
  // float py1 = texelFetch(uPressure, st+ivec2( 0, 1), 0).x;
  // float py2 = texelFetch(uPressure, st+ivec2( 0,-1), 0).x;
  // float px1 = texture(uPressure, vUv+vec2(r.x, 0.)).x;
  // float px2 = texture(uPressure, vUv+vec2(-r.x, 0.)).x;
  // float py1 = texture(uPressure, vUv+vec2(0., r.y)).x;
  // float py2 = texture(uPressure, vUv+vec2(0., -r.y)).x;
  float px1 = texture(uPressure, vR).x;
  float px2 = texture(uPressure, vL).x;
  float py1 = texture(uPressure, vT).x;
  float py2 = texture(uPressure, vB).x;

  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 gradP = vec2(px1 - px2, py1 - py2);

  vel = vel -  gradP;
  oColor = vec4(vel, 0., 1.);
}