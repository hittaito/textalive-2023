uniform vec2 uResolution;
uniform vec2 uMouse[7]; // 0 ~ 1
uniform sampler2D uVelocity;
uniform sampler2D uForce;
uniform vec3 uColor[7];
uniform float uCircleSize;

in vec2 vUv;

out vec4 oColor;

void main() {
  vec4 col = vec4(0);
  vec4 vel = texture(uVelocity, vUv);

  float aspect = uResolution.x/uResolution.y;
  vec2 st = (vUv - .5) *2. * uResolution / uResolution.y;

  vec2 p2 = vUv - uMouse[0];
  p2.x *= aspect;
  float r = exp(-dot(p2,p2)/ (uCircleSize * .8));
  col += r * vec4(uColor[0], r);
  for (int i = 1; i< 7; i++) {
    p2 = vUv - uMouse[i];
    p2.x *= aspect;
    r = exp(-dot(p2,p2)/ (uCircleSize * .4) );
    col += r * vec4(uColor[i], r);
  }

  // text
  vec4 tCol = texture(uForce, vUv) * .5;
  col = col + tCol;

  col += vel ;

  oColor = col;
}