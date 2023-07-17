import WebGL from '../webgl';
import * as p2 from 'p2-es';

export class Wall {
  right: p2.Body;
  left: p2.Body;

  constructor() {
    const webgl = new WebGL();

    const bottom = new p2.Body();
    bottom.position[1] = -100;
    const shape1 = new p2.Plane();
    bottom.addShape(shape1);
    webgl.pWorld.addBody(bottom);

    const left = new p2.Body();
    left.angle = -Math.PI / 2;
    left.position[0] = (-100 * webgl.size.x) / webgl.size.y;
    const shape2 = new p2.Plane();
    left.addShape(shape2);
    webgl.pWorld.addBody(left);

    const right = new p2.Body();
    right.angle = Math.PI / 2;
    right.position[0] = (100 * webgl.size.x) / webgl.size.y;
    const shape3 = new p2.Plane();
    right.addShape(shape3);
    webgl.pWorld.addBody(right);

    this.right = right;
    this.left = left;
    webgl.resizeEvent.push(this.resize.bind(this));
  }
  resize(x: number, y: number) {
    this.left.position[0] = (-100 * x) / y;
    this.right.position[0] = (100 * x) / y;
  }
}
