import * as THREE from 'three';
import WebGL from '../webgl';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/gradientSub.frag?raw';

export class GradientSub {
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor() {
    const webgl = new WebGL();
    this.camera = webgl.oCamera;
    this.renderer = webgl.renderer;

    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        uResolution: {
          value: new THREE.Vector2(1 / webgl.size.x / 4, 1 / webgl.size.y / 4),
        },
      },
    });
    this.mesh = new THREE.Mesh(g, m);
  }
  render(
    input: { press: THREE.Texture; vel: THREE.Texture },
    output: THREE.WebGLRenderTarget
  ) {
    this.renderer.setRenderTarget(output);
    // 毎フレーム解像度更新しないとうまくいかない。
    this.mesh.material.uniforms.uResolution.value.x = 1 / output.width;
    this.mesh.material.uniforms.uResolution.value.y = 1 / output.height;
    this.mesh.material.uniforms.uPressure.value = input.press;
    this.mesh.material.uniforms.uVelocity.value = input.vel;
    this.renderer.render(this.mesh, this.camera);
  }
}
