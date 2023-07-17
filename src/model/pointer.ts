import * as THREE from 'three';
import * as p2 from 'p2-es';
import WebGL from '../webgl';

export class Pointer {
  private pointer: Mouse;
  private othres: Point[] = [];

  get colors() {
    return [this.pointer.colorVec, ...this.othres.map((o) => o.colorVec)];
  }

  get positions() {
    return [this.pointer.pos, ...this.othres.map((o) => o.pos)];
  }

  constructor() {
    this.pointer = new Mouse();
    for (let i = 0; i < 6; i++) {
      const b = new Point(i);
      this.othres.push(b);
    }
    const webgl = new WebGL();

    // mouse event
    webgl.mousemoveEvent.push(this.onMouseMove.bind(this));

    // set color data for contact event
    webgl.colorData = {
      id: this.pointer.body.id,
      color: new THREE.Vector3(0, 1, 0),
    };
  }
  update() {
    this.pointer.update();
    this.othres.forEach((o) => {
      o.update();
      o.move();
    });
  }

  onMouseMove(x: number, y: number) {
    this.pointer.pos.x = x;
    this.pointer.pos.y = y;
  }
}
class Point {
  t = 0;
  pos: THREE.Vector2; // 0 ~ 1
  prev: THREE.Vector2;
  vel: THREE.Vector2;
  colorVec: THREE.Vector2;
  active = false;
  random = 0;
  dir = 1;
  constructor(n: number) {
    this.pos = new THREE.Vector2(-1, 0);
    this.prev = this.pos.clone();
    this.vel = this.pos.clone();
    this.colorVec = new THREE.Vector2();
    this.t = ((Math.PI * 2) / 6) * n + Math.random() * 0.1;
    this.random = Math.random() * 5 + 3;
    // this.dir = ((n % 2) - 0.5) * 2;
  }
  setMove() {
    if (Math.random() > 0.5) {
      this.pos.x = 1.01;
      this.pos.y = 0;
      this.prev.copy(this.pos);
      this.vel.x = -0.003;
    } else {
      this.pos.y = 0;
      this.pos.x = -0.01;
      this.prev.copy(this.pos);
      this.vel.x = 0.003;
    }
    this.active = true;
    this.random = Math.random() * 5 + 3;
  }
  move() {
    this.pos.x = Math.sin(this.t) * 0.5 + 0.5;
    this.t += 0.01 * this.dir;
    const x1 = (this.pos.x - 0.5) * 2;
    const d = x1 * x1 * x1 * x1;
    const s = Math.sin(this.pos.x * this.random);
    const c = Math.cos(this.pos.x * this.random * 1.2);
    if (Math.cos(this.t) < 0) {
      this.pos.y = 1 - (1 - Math.abs(s * c)) * d * 0.5 - 0.02;
      return;
    }

    this.pos.y = (1 - Math.abs(s * c)) * d * 0.5 + 0.05;
  }
  update() {
    this.colorVec.x = (this.pos.x - this.prev.x) * 3000;
    this.colorVec.y = (this.pos.y - this.prev.y) * 3000;
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
  }
}

// p2付き
class Mouse {
  body: p2.Body;
  pos: THREE.Vector2; // 0 ~ 1
  prev: THREE.Vector2;

  colorVec: THREE.Vector2;
  constructor() {
    this.pos = new THREE.Vector2(0, 0);
    this.prev = this.pos.clone();
    this.colorVec = new THREE.Vector2();
    const webgl = new WebGL();

    const shape = new p2.Circle({ radius: 8 });
    const body = new p2.Body({
      type: p2.Body.KINEMATIC,
      position: [0, 0],
    });
    body.addShape(shape);

    webgl.pWorld.addBody(body);
    this.body = body;
  }

  update() {
    this.body.position[0] =
      ((this.pos.x - 0.5) * 2 * 100 * innerWidth) / innerHeight;
    this.body.position[1] = (this.pos.y - 0.5) * 2 * 100;
    this.colorVec.x = (this.pos.x - this.prev.x) * 3000;
    this.colorVec.y = (this.pos.y - this.prev.y) * 3000;
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
  }
}
