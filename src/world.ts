import * as THREE from 'three';
import WebGL from './webgl';
import { FXAA } from './process/FXAA';
import { Gauss } from './process/gauss';
import { Merge } from './process/merge';
import { Noise } from './process/noise';
import { Advection } from './process/advection';
import { Divergence } from './process/divergence';
import { GradientSub } from './process/gradientSub';
import { SwitchTexture } from './switchTexture';
import { ExternalForce } from './process/externalForce';
import { Pressure } from './process/pressure';
import TextModel from './model/textModel';
import { TAData } from './types';
import { Wall } from './model/wall';
import { Texts } from './model/texts';
import { Pointer } from './model/pointer';
import { Vignette } from './process/vignette';

let texScale = 4;

export default class World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  // 1/4サイズ
  vel: SwitchTexture;
  col: SwitchTexture;
  pres: SwitchTexture;
  tmp1: THREE.WebGLRenderTarget;
  // fullscreen
  fTmp1: THREE.WebGLRenderTarget;
  fTmp2: THREE.WebGLRenderTarget;

  // phrase info
  phraseData: TAData[] = [];
  currentPhraseID = -1;

  // text canvas
  textModel: TextModel;

  // model
  wall: Wall;
  texts: Texts;
  pointer: Pointer;

  // fluid simulation
  externalForce: ExternalForce;
  advection: Advection;
  divergence: Divergence;
  pressure: Pressure;
  gradientSub: GradientSub;

  // process
  noise: Noise;
  gauss: Gauss;
  merge: Merge;
  vignette: Vignette;
  fxaa: FXAA;

  width: number;
  height: number;

  constructor() {
    const webgl = new WebGL();
    this.scene = webgl.scene;
    this.camera = webgl.camera;
    this.renderer = webgl.renderer;

    if (webgl.size.x < 900) {
      texScale = 8;
    }

    this.width = webgl.size.x;
    this.height = webgl.size.y;

    // renderTarget
    this.vel = new SwitchTexture(texScale);
    this.pres = new SwitchTexture(texScale);
    this.col = new SwitchTexture(texScale);
    this.tmp1 = new THREE.WebGLRenderTarget(
      this.width / texScale,
      this.height / texScale,
      {
        type: THREE.FloatType,
      }
    );
    this.fTmp1 = new THREE.WebGLRenderTarget(this.width, this.height, {
      type: THREE.FloatType,
    });
    this.fTmp2 = this.fTmp1.clone();

    this.pointer = new Pointer();
    this.wall = new Wall();
    this.texts = new Texts();

    // model
    this.textModel = new TextModel(this.width);

    // fluid simulation
    this.externalForce = new ExternalForce();
    this.advection = new Advection();
    this.divergence = new Divergence();
    this.pressure = new Pressure();
    this.gradientSub = new GradientSub();

    // process for scene
    this.gauss = new Gauss();
    this.noise = new Noise();
    this.merge = new Merge();
    this.vignette = new Vignette();
    this.fxaa = new FXAA();

    // register events
    webgl.resizeEvent.push(this.resize);
  }
  onAfterLoading(data: TAData[]) {
    this.phraseData = data;
    this.textModel.setCharData(data);
    this.texts.setTextData(data);
  }
  render(
    time: number,
    musicTime: number,
    color: THREE.Vector3,
    isChorus: boolean
  ) {
    // canvas textの更新
    this.textModel.update(musicTime);

    // model,sceneによる描画
    this.texts.update({ time: musicTime, map: this.textModel.texture });
    this.pointer.update();

    this.renderer.setRenderTarget(this.fTmp1);
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(this.tmp1);
    this.texts.update2({ time: musicTime, map: this.textModel.texture });
    this.renderer.render(this.scene, this.camera);

    // fluid simulation ----------------------------------------------------
    this.renderer.setViewport(
      0,
      0,
      this.width / texScale,
      this.height / texScale
    );
    this.externalForce.update(this.pointer.positions);
    this.externalForce.setColorFromVel(this.pointer.colors);
    this.externalForce.render(
      { vel: this.vel.read, force: this.tmp1.texture },
      this.vel.write
    );
    this.vel.swap();

    this.externalForce.setColor(color, isChorus);
    this.externalForce.render(
      { vel: this.col.read, force: this.tmp1.texture },
      this.col.write
    );
    this.col.swap();

    this.divergence.render({ vel: this.vel.read }, this.tmp1);

    for (let i = 0; i < 4; i++) {
      this.pressure.render(
        { press: this.pres.read, div: this.tmp1.texture },
        this.pres.write
      );
      this.pres.swap();
    }
    this.gradientSub.render(
      { press: this.pres.read, vel: this.vel.read },
      this.vel.write
    );
    this.vel.swap();

    this.advection.update(time);
    this.advection.render(
      { vel: this.vel.read, source: this.vel.read, isVel: true },
      this.vel.write
    );
    this.vel.swap();

    this.advection.render(
      { vel: this.vel.read, source: this.col.read, isVel: false },
      this.col.write
    );
    this.col.swap();

    // // ----------------------------------------------------------------------
    this.renderer.setViewport(0, 0, this.width, this.height);
    this.merge.render(this.fTmp2, this.col.read, this.fTmp1.texture);

    // post process
    this.gauss.render(this.fTmp2.texture);
    this.merge.render(this.fTmp1, this.fTmp2.texture, this.gauss.texture);
    this.vignette.render(this.fTmp1.texture, this.fTmp2);
    this.fxaa.render(null, this.fTmp2.texture);
  }
  resize = (x: number, y: number) => {
    this.width = x;
    this.height = y;
    this.fTmp1.setSize(x, y);
    this.fTmp2.setSize(x, y);
    this.tmp1.setSize(x / texScale, y / texScale);
  };
  reset() {
    this.texts.reset();
  }
}
