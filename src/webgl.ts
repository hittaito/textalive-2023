import * as THREE from 'three';
import * as p2 from 'p2-es';
import World from './world';
import * as dat from 'lil-gui';
import stats from 'stats.js';
import { IPhrase } from 'textalive-app-api';
import { Colors } from './Color';
let webgl: WebGL;

const footerHeight = 60 + 3;

export default class WebGL {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  oCamera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  world: World;
  pWorld: p2.World;
  colorData: { id: number; color: THREE.Vector3 };
  colorId = 2;

  ui?: dat.GUI;
  stats?: stats;

  size: { x: number; y: number } = { x: 0, y: 0 };

  private clock: THREE.Clock;
  private time: number = 0;
  private isChorus = false;

  // events
  resizeEvent: ((x: number, y: number) => void)[] = [];
  mousemoveEvent: ((x: number, y: number) => void)[] = [];
  constructor(canvas?: HTMLCanvasElement) {
    if (webgl) {
      return webgl;
    }
    if (!canvas) return;
    webgl = this;

    this.setUp(canvas);
    this.render();
  }
  setUp(canvas: HTMLCanvasElement) {
    // size
    this.size = {
      x: window.innerWidth,
      y: window.innerHeight - footerHeight,
    };

    this.scene = new THREE.Scene();

    const fov = 60;
    const top = 100; //
    const z = top / Math.tan(((fov / 2) * Math.PI) / 180);
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.size.x / this.size.y,
      0.1,
      z + 0.1
    );

    this.camera.position.set(0, 0, z);

    this.oCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10);
    this.oCamera.position.set(0, 0, 9);
    this.oCamera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    this.renderer.setClearColor(0x100f0f);
    this.renderer.setSize(this.size.x, this.size.y);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // setup debug
    if (process.env.NODE_ENV !== 'production') {
      this.ui = new dat.GUI();
      this.stats = new stats();
      document.body.appendChild(this.stats.dom);
    }

    // physics
    this.pWorld = new p2.World({ gravity: [0, -9.82] });
    const solver = new p2.GSSolver();
    solver.iterations = 30;
    this.pWorld.solver = solver;

    this.world = new World();
    this.resize();
    this.clock = new THREE.Clock();
    this.changeColor();
  }
  onAfterLoading(pharases: IPhrase[]) {
    const data = pharases
      .flatMap((phrase) => {
        let i = 0;
        return phrase.children.flatMap((word) => {
          return word.children.map((char) => {
            i++;
            return {
              char: char.text,
              startTime: char.startTime,
              endTime: char.endTime,
              pStartTime: phrase.startTime,
              pEndTime: phrase.endTime,
              phraseLen: phrase.children.reduce(
                (p, c) => p + c.children.length,
                0
              ),
              index: i - 1,
            };
          });
        });
      })
      .map((t, i) => ({ ...t, tId: i }));
    this.world.onAfterLoading(data);
  }
  onTimeUpdate(time: number, isChorus: boolean) {
    this.time = time;
    this.isChorus = isChorus;
  }
  private render() {
    const currentTime = this.clock.getElapsedTime();
    if (this.stats) this.stats.begin();
    this.pWorld.step((1 / 60) * 3);
    this.world.render(
      currentTime * 1000,
      this.time,
      this.colorData.color,
      this.isChorus
    );
    if (this.stats) this.stats.end();
    requestAnimationFrame(() => this.render());
  }

  resize() {
    this.size = {
      x: window.innerWidth,
      y: window.innerHeight - footerHeight,
    };
    this.camera.aspect = this.size.x / this.size.y;
    this.camera.updateProjectionMatrix();
    this.oCamera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.size.x, this.size.y);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.resizeEvent.forEach((f) => f(this.size.x, this.size.y));
  }

  // x,y 0 ~ 1(左下原点)
  mousemove(x: number, y: number) {
    this.mousemoveEvent.forEach((f) => f(x, y));
  }
  changeColor() {
    this.colorId = (this.colorId + 1) % Colors.length;
    const c = Colors[this.colorId];
    this.colorData.color.set(c.r, c.g, c.b);
  }
  reset() {
    this.world.reset();
  }
}
