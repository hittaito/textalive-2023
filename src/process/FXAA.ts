import * as THREE from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import WebGL from '../webgl';

export class FXAA {
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  constructor() {
    const webgl = new WebGL();
    this.camera = webgl.oCamera;
    this.renderer = webgl.renderer;

    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.ShaderMaterial({
      ...FXAAShader,
    });

    this.mesh = new THREE.Mesh(g, m);
    this.mesh.material.uniforms.resolution.value.x = 1 / webgl.size.x;
    this.mesh.material.uniforms.resolution.value.y = 1 / webgl.size.y;

    webgl.resizeEvent.push(this.resize);
  }
  render(target: THREE.WebGLRenderTarget | null, texture: THREE.Texture) {
    this.renderer.setRenderTarget(target);
    this.mesh.material.uniforms.tDiffuse.value = texture;
    this.renderer.render(this.mesh, this.camera);
  }
  resize = (x: number, y: number) => {
    this.mesh.material.uniforms.resolution.value.x = 1 / x;
    this.mesh.material.uniforms.resolution.value.y = 1 / y;
  };
}
