uniform sampler2D uPressure;
uniform sampler2D uDivergence;

in vec2 vUv;

out vec4 oColor;

void main() {
  ivec2 st = ivec2(vUv * vec2(textureSize(uPressure, 0)));

  int dist = 2;
  float p1 = texelFetch(uPressure, st+ivec2(dist,0), 0).x;
  float p2 = texelFetch(uPressure, st+ivec2(-dist,0), 0).x;
  float p3 = texelFetch(uPressure, st+ivec2(0,dist), 0).x;
  float p4 = texelFetch(uPressure, st+ivec2(0,-dist), 0).x;

  float div = texelFetch(uDivergence, st, 0).x;
  float pres =  (p1+p2+p3+p4 - div) * .25;

  oColor = vec4(vec3(pres),  1.);
}