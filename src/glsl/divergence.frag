uniform sampler2D uVelocity;

in vec2 vUv;
in vec2 vR;
in vec2 vL;
in vec2 vT;
in vec2 vB;

out vec4 oColor;

void main() {
  ivec2 st = ivec2(vUv * vec2(textureSize(uVelocity, 0)));
  float L = texelFetch(uVelocity, st+ivec2(-1,0), 0).x;
  float R = texelFetch(uVelocity, st+ivec2(1,0), 0).x;
  float T = texelFetch(uVelocity, st+ivec2(0,1), 0).y;
  float B = texelFetch(uVelocity, st+ivec2(0,-1), 0).y;

  vec2 C = texelFetch(uVelocity, st, 0).xy;
  if (vL.x < 0.) {L = -C.x;}
  if (vR.x > 1.) {R = -C.x;}
  if (vB.y < 0.) {B = -C.y;}
  if (vT.y > 1.) {T = -C.y;}

  float div = .5 * (R-L+T-B) ;
  oColor = vec4(div,0.,0.,1.);
}