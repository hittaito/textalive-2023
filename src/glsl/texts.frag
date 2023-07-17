uniform sampler2D uMap;
uniform float uTime;
uniform float uID;
uniform float uTileSize;
uniform vec3 uColor;

in vec2 vUv;

out vec4 outColor;

void main() {
  vec2 xy = vec2(mod(uID, uTileSize), uTileSize - floor(uID/uTileSize) -1.);
  vec2 tile = vec2(1./uTileSize);
  vec2 uv = vUv * tile + xy * tile;
  vec4 col = texture(uMap, uv);
  col.xyz *= uColor;
  outColor = col;//;vec4(col,1.);
}