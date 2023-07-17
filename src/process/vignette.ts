import * as THREE from 'three';

import vert from '../glsl/base.vert?raw';
import frag from '../glsl/vignette.frag?raw';
import WebGL from '../webgl';

export class Vignette {
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
        uMap: { value: null },
        uText: { value: null },
        uSplit: { value: 40 }, // 画面の分割数(y方向)
        uTextSize: { value: 3 },
        uResolution: { value: new THREE.Vector2(0, 0) },
      },
    });
    this.mesh = new THREE.Mesh(g, m);
  }
  render(texture: THREE.Texture, target: THREE.WebGLRenderTarget | null) {
    this.renderer.setRenderTarget(target);
    this.mesh.material.uniforms.uMap.value = texture;

    this.renderer.render(this.mesh, this.camera);
  }
}
