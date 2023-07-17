import * as THREE from 'three';
import WebGL from './webgl';
export class SwitchTexture {
  private r: THREE.WebGLRenderTarget;
  private w: THREE.WebGLRenderTarget;
  private s: number;
  private id = 0;
  get read() {
    if (this.id === 0) {
      return this.r.texture;
    } else {
      return this.w.texture;
    }
  }
  get write() {
    if (this.id === 0) {
      return this.w;
    } else {
      return this.r;
    }
  }
  constructor(scale: number) {
    const webgl = new WebGL();
    this.r = new THREE.WebGLRenderTarget(
      webgl.size.x / scale,
      webgl.size.y / scale,
      {
        type: THREE.FloatType,
      }
    );
    this.s = scale;
    this.w = this.r.clone();

    webgl.resizeEvent.push(this.resize.bind(this));
  }

  resize(x: number, y: number) {
    this.r.setSize(x / this.s, y / this.s);
    this.w.setSize(x / this.s, y / this.s);
  }
  swap() {
    this.id = 1 - this.id;
  }
}
