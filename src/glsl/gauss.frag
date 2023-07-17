uniform sampler2D uMap;
uniform bool uHorizon;
uniform int uStep;

in vec2 vUv;

out vec4 outColor;

const float[5] w = float[](0.2270270, 0.1945945, 0.1216216, 0.0540540, 0.0162162);

ivec2 clampCoord(ivec2 coord, ivec2 size) {
    return max(min(coord, size - 1), 0);
}

void main(void) {
  ivec2 texSize = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(uMap, 0);
  vec4 color = texelFetch(uMap, texSize, 0);
  vec4 sum = w[0] * color * color.a;
  sum.a = w[0] * color.a;

  for (int i = 1; i < 5; i++) {
    ivec2 offset = (uHorizon ? ivec2(i, 0) : ivec2(0, i)) * uStep;
    color = texelFetch(uMap, clampCoord(texSize + offset, size), 0);
    sum.rgb += w[i] * color.rgb * color.a;
    sum.a += w[i] * color.a;
    color = texelFetch(uMap, clampCoord(texSize - offset, size), 0);
    sum.rgb += w[i] * color.rgb * color.a;
    sum.a += w[i] * color.a;
  }
  float a = sum.a == 0. ? 0. : 1.;
  outColor = vec4(sum.rgb/sum.a, sum.a);
}