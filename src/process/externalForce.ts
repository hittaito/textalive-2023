import * as THREE from 'three';
import WebGL from '../webgl';
import vert from '../glsl/base.vert?raw';
import frag from '../glsl/externalForce.frag?raw';
import { Colors } from '../Color';

export class ExternalForce {
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  private param = {
    colorForce: 3000,
    circleSize: 0.001,
  };

  private mouse = { x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0 };
  constructor() {
    const webgl = new WebGL();
    this.camera = webgl.oCamera;
    this.renderer = webgl.renderer;

    const vec3 = new THREE.Vector3();
    const vec2 = new THREE.Vector2();

    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uResolution: { value: new THREE.Vector2(webgl.size.x, webgl.size.y) },
        uMouse: {
          value: [
            vec2,
            vec2.clone(),
            vec2.clone(),
            vec2.clone(),
            vec2.clone(),
            vec2.clone(),
            vec2.clone(),
          ],
        },
        uVelocity: { value: null },
        uForce: { value: null },
        uColor: {
          value: [
            vec3,
            vec3.clone(),
            vec3.clone(),
            vec3.clone(),
            vec3.clone(),
            vec3.clone(),
            vec3.clone(),
          ],
        },
        uCircleSize: { value: this.param.circleSize },
      },
    });

    this.mesh = new THREE.Mesh(g, m);

    webgl.mousemoveEvent.push(this.mouseEvent.bind(this));

    if (webgl.ui) {
      const f = webgl.ui.addFolder('externalForce');
      f.add(this.param, 'colorForce', 1, 10000);
      f.add(this.param, 'circleSize', 0.0001, 0.01);
    }
  }
  render(
    input: {
      vel: THREE.Texture;
      force: THREE.Texture;
    },
    output: THREE.WebGLRenderTarget
  ) {
    this.renderer.setRenderTarget(output);
    this.mesh.material.uniforms.uVelocity.value = input.vel;
    this.mesh.material.uniforms.uForce.value = input.force;
    this.mesh.material.uniforms.uCircleSize.value = this.param.circleSize;
    this.renderer.render(this.mesh, this.camera);
  }
  update(positons: THREE.Vector2[]) {
    // mouseの更新
    positons.forEach((p, i) => {
      this.mesh.material.uniforms.uMouse.value[i].x = p.x;
      this.mesh.material.uniforms.uMouse.value[i].y = p.y;
    });
  }
  setColorFromVel(colors: THREE.Vector2[]) {
    colors.forEach((p, i) => {
      this.mesh.material.uniforms.uColor.value[i].x = p.x;
      this.mesh.material.uniforms.uColor.value[i].y = p.y;
      this.mesh.material.uniforms.uColor.value[i].z = 0;
    });
  }
  setColor(color: THREE.Vector3, isChorus: boolean) {
    this.mesh.material.uniforms.uColor.value[0].x = color.x;
    this.mesh.material.uniforms.uColor.value[0].y = color.y;
    this.mesh.material.uniforms.uColor.value[0].z = color.z;
    for (let i = 0; i < 6; i++) {
      if (isChorus) {
        this.mesh.material.uniforms.uColor.value[i + 1].x = Colors[i].r;
        this.mesh.material.uniforms.uColor.value[i + 1].y = Colors[i].g;
        this.mesh.material.uniforms.uColor.value[i + 1].z = Colors[i].b;
      } else {
        this.mesh.material.uniforms.uColor.value[i + 1].x = 0;
        this.mesh.material.uniforms.uColor.value[i + 1].y = 0;
        this.mesh.material.uniforms.uColor.value[i + 1].z = 0;
      }
    }
  }
  mouseEvent(x: number, y: number) {
    this.mouse.x = x;
    this.mouse.y = y;
  }
}
