import * as THREE from 'three';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/merge.frag?raw';
import WebGL from '../webgl';

export class Merge {
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  constructor() {
    const webgl = new WebGL();
    this.camera = webgl.oCamera;
    this.renderer = webgl.renderer;

    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uImage1: { value: null },
        uImage2: { value: null },
      },
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: THREE.GLSL3,
    });

    this.mesh = new THREE.Mesh(g, m);
  }

  render(
    target: THREE.WebGLRenderTarget | null,
    texture1: THREE.Texture,
    texture2: THREE.Texture
  ) {
    this.renderer.setRenderTarget(target);
    this.mesh.material.uniforms.uImage1.value = texture1;
    this.mesh.material.uniforms.uImage2.value = texture2;
    this.renderer.render(this.mesh, this.camera);
  }
}
