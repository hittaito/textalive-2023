import * as THREE from 'three';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/gauss.frag?raw';
import WebGL from '../webgl';

export class Gauss {
  renderer: THREE.WebGLRenderer;
  targets: THREE.WebGLRenderTarget[];
  camera: THREE.OrthographicCamera;
  active = 0;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  get texture() {
    return this.targets[this.active].texture;
  }
  constructor() {
    const webgl = new WebGL();
    this.camera = webgl.oCamera;
    this.renderer = webgl.renderer;
    const target = new THREE.WebGLRenderTarget(webgl.size.x, webgl.size.y);
    this.targets = [target, target.clone()];

    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uMap: { value: null },
        uStep: { value: 0 },
        uHorizon: { value: false },
      },
    });
    this.mesh = new THREE.Mesh(g, m);

    webgl.resizeEvent.push(this.resize.bind(this));
  }
  render(texture: THREE.Texture) {
    this.mesh.material.uniforms.uMap.value = texture;

    for (let i = 0; i < 6; i++) {
      this.mesh.material.uniforms.uStep.value = Math.floor(i / 2) + 1;
      this.renderer.setRenderTarget(this.targets[1 - this.active]);
      this.mesh.material.uniforms.uHorizon.value = this.active === 0;
      this.renderer.render(this.mesh, this.camera);

      this.active = 1 - this.active;
      this.mesh.material.uniforms.uMap.value =
        this.targets[this.active].texture;
    }
  }
  resize(x: number, y: number) {
    this.targets.forEach((t) => t.setSize(x, y));
  }
}
