import * as THREE from 'three';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import WebGL from '../webgl';

export class Copy {
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  copy: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  constructor() {
    const webgl = new WebGL();
    this.camera = webgl.oCamera;
    this.renderer = webgl.renderer;

    const g = new THREE.PlaneGeometry(2, 2);
    const copyMat = new THREE.ShaderMaterial(CopyShader);
    this.copy = new THREE.Mesh(g, copyMat);
  }
  render(input: THREE.Texture, output: THREE.WebGLRenderTarget) {
    this.renderer.setRenderTarget(output);
    this.copy.material.uniforms.tDiffuse.value = input;
    this.renderer.render(this.copy, this.camera);
  }
}
