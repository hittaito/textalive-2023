uniform sampler2D uImage1;
uniform sampler2D uImage2;
in vec2 vUv;

out vec4 oColor;

void main() {
    vec4 i1 = texture2D(uImage1, vUv);

    vec4 i2 = texture2D(uImage2, vUv);
    vec4 col = i1 + i2;

    oColor = col;
}