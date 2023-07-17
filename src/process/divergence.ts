import * as THREE from 'three';
import WebGL from '../webgl';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/divergence.frag?raw';

export class Divergence {
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  prevTime = 0;

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
        uVelocity: { value: null },
        uResolution: {
          value: new THREE.Vector2(1 / webgl.size.x / 4, 1 / webgl.size.y / 4),
        },
      },
    });
    this.mesh = new THREE.Mesh(g, m);
  }
  render(input: { vel: THREE.Texture }, output: THREE.WebGLRenderTarget) {
    this.renderer.setRenderTarget(output);
    this.mesh.material.uniforms.uVelocity.value = input.vel;
    this.renderer.render(this.mesh, this.camera);
  }
}
