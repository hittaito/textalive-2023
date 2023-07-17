uniform sampler2D uVelocity;

in vec2 vUv;

out vec4 oColor;

void main() {
  vec3 col = texture(uVelocity, vUv).xyz;
  vec2 vel = texture(uVelocity, vUv).xy;
  float len = length(vel);
  vel = vel * .5 + .5;

  col = vec3(vel, 1.);
  col = mix(vec3(1.), col, len);

  oColor = vec4(col, 1.);
  // oColor = vec4(col , 1.);
}