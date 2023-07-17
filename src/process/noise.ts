import * as THREE from 'three';
import WebGL from '../webgl';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/noise.frag?raw';

export class Noise {
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
        uTime: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(g, m);
  }
  render(target: THREE.WebGLRenderTarget | null) {
    this.renderer.setRenderTarget(target);
    this.mesh.material.uniforms.uTime.value += 1;
    this.renderer.render(this.mesh, this.camera);
  }
}
