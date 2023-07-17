import * as THREE from 'three';
import WebGL from '../webgl';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/advection.frag?raw';

export class Advection {
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  private prevTime = 0;
  private param = {
    velFactor: 0.2,
    colFactor: 1,
    timeScale: 1.5,
  };
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
        uSource: { value: null },
        uResolution: {
          value: new THREE.Vector2(
            1 / (webgl.size.x / 4),
            1 / (webgl.size.y / 4)
          ),
        },
        uDissipation: { value: 0.2 },
        uDeltaTime: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(g, m);

    if (webgl.ui) {
      const f = webgl.ui.addFolder('advection');
      f.add(this.param, 'velFactor', 0, 2);
      f.add(this.param, 'colFactor', 0, 2);
      f.add(this.param, 'timeScale', 0.1, 2);
    }
  }
  update(time: number) {
    this.mesh.material.uniforms.uDeltaTime.value =
      (time - this.prevTime) * this.param.timeScale;
    this.prevTime = time;
  }
  render(
    input: { vel: THREE.Texture; source: THREE.Texture; isVel: boolean },
    output: THREE.WebGLRenderTarget
  ) {
    this.renderer.setRenderTarget(output);
    this.mesh.material.uniforms.uVelocity.value = input.vel;
    this.mesh.material.uniforms.uSource.value = input.source;
    this.mesh.material.uniforms.uDissipation.value = input.isVel
      ? this.param.velFactor
      : this.param.colFactor;
    this.renderer.render(this.mesh, this.camera);
  }
}
