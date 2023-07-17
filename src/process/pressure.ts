import * as THREE from 'three';
import WebGL from '../webgl';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/pressure.frag?raw';

export class Pressure {
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
        uDivergence: { value: null },
      },
    });
    this.mesh = new THREE.Mesh(g, m);
  }
  render(
    input: { div: THREE.Texture; press: THREE.Texture },
    output: THREE.WebGLRenderTarget
  ) {
    this.mesh.material.uniforms.uDivergence.value = input.div;
    this.mesh.material.uniforms.uPressure.value = input.press;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.mesh, this.camera);
  }
}
