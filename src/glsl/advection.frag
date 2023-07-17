uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDeltaTime;
uniform vec2 uResolution;
uniform float uDissipation;

in vec2 vUv;

out vec4 oColor;

void main() {
  vec2 texel = uResolution;
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 uv = vUv - vel  * uDeltaTime * texel * .001;
  vec4 newVel = texture(uSource, uv);

  float decay = 1. + uDissipation * uDeltaTime * .001;
  newVel /= decay;

  oColor = newVel;

}