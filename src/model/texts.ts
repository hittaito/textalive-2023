import * as THREE from 'three';
import * as p2 from 'p2-es';
import WebGL from '../webgl';
import { TAData } from '../types';
import vert from '../glsl/texts.vert?raw';
import frag from '../glsl/texts.frag?raw';
import { gsap } from 'gsap';

let COUNT = 7 * 7;
const preBuffer = 900;
let afterBuffer = 5000;

export class Texts {
  private origin: TAData[] = [];
  private world: p2.World;
  private texts: {
    mesh: THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>;
    body: p2.Body | null;
    start: number;
    end: number;
    deleteFlag: boolean;
  }[] = [];

  constructor() {
    const webgl = new WebGL();
    this.world = webgl.pWorld;

    if (webgl.size.x < 900) {
      COUNT = 5 * 5;
      afterBuffer = 2000;
    }

    const m = new THREE.ShaderMaterial({
      fragmentShader: frag,
      vertexShader: vert,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uID: { value: null },
        uMap: { value: null },
        uTileSize: { value: Math.sqrt(COUNT) },
        uColor: { value: new THREE.Color(1, 1, 1) },
      },
      transparent: true,
    });

    const g = new THREE.CircleGeometry(1);

    for (let i = 0; i < COUNT; i++) {
      const m1 = m.clone();
      m1.uniforms.uID.value = i;
      const mesh = new THREE.Mesh(g, m1);
      webgl.scene.add(mesh);

      this.texts.push({
        mesh,
        body: null,
        deleteFlag: false,
        start: 0,
        end: 0,
      });
    }

    // contact event
    webgl.pWorld.on('beginContact', (event) => {
      const colorA =
        webgl.colorData.id === event.bodyA.id ? webgl.colorData : undefined;
      const colorB =
        webgl.colorData.id === event.bodyB.id ? webgl.colorData : undefined;

      if (colorA === undefined && colorB === undefined) {
        return;
      }
      if (colorA !== undefined && colorB !== undefined) {
        return;
      }

      if (colorA) {
        const target = this.texts.find((t) => t.body?.id === event.bodyB.id);
        if (target) {
          target.mesh.material.uniforms.uColor.value.setFromVector3(
            colorA.color
          );
        }
      }
      if (colorB) {
        const target = this.texts.find((t) => t.body?.id === event.bodyA.id);
        if (target) {
          target.mesh.material.uniforms.uColor.value.setFromVector3(
            colorB.color
          );
        }
      }
    });
  }
  setTextData(d: TAData[]) {
    this.origin = d;
  }

  update(input: { time: number; map: THREE.Texture }) {
    this.generate(input.time);
    this.remove(input.time);
    this.texts.forEach((t) => {
      if (t.body) {
        t.mesh.material.uniforms.uMap.value = input.map;
        t.mesh.position.x = t.body.position[0];
        t.mesh.position.y = t.body.position[1];
        t.mesh.rotation.z = t.body.angle;
        t.mesh.visible = true;
      } else if (t.end !== 0) {
        t.mesh.material.uniforms.uMap.value = input.map;
        t.mesh.visible = true;
      } else {
        t.mesh.visible = false;
      }
    });
  }
  update2(input: { time: number; map: THREE.Texture }) {
    this.texts.forEach((t) => {
      if (t.end > input.time && t.end - 300 < input.time) {
        t.mesh.visible = true;
      } else {
        t.mesh.visible = false;
      }
    });
  }
  generate(time: number) {
    this.origin
      .filter(
        (data) => data.startTime - preBuffer < time && time < data.startTime
      )
      .filter(
        (data) =>
          !this.texts.some((t) => t.start === data.startTime - preBuffer)
      )
      .forEach((d) => {
        const rate = (d.startTime - d.pStartTime) / (d.pEndTime - d.pStartTime);
        const targetId = d.tId % COUNT;

        if (innerWidth > 900) {
          this.texts[targetId].mesh.position.x =
            (((200 * rate - 100) * innerWidth) / innerHeight) * 0.9;
          this.texts[targetId].mesh.position.y = Math.random() * 90 - 10;
        } else {
          const a = Math.ceil(d.phraseLen / 3);
          const y = d.index % a;
          const ratio = innerWidth / innerHeight;
          this.texts[targetId].mesh.position.x =
            (Math.random() - 0.5) * 2 * 70 * ratio;
          this.texts[targetId].mesh.position.y = 80 - (y / a) * 150;
        }
        this.texts[targetId].mesh.scale.set(0.1, 0.1, 1);

        this.texts[targetId].mesh.rotation.z =
          (Math.random() * Math.PI) / 2 - Math.PI / 4;
        this.texts[targetId].mesh.material.uniforms.uColor.value.setRGB(
          1,
          1,
          1
        );
        this.texts[targetId].start = d.startTime - preBuffer;
        this.texts[targetId].end = d.endTime + afterBuffer;

        // easing animation
        const param = { radius: 0.1 };
        gsap.to(param, {
          radius: Math.min(30, (d.endTime - (d.startTime - preBuffer)) * 0.01),
          duration: (d.endTime - (d.startTime - preBuffer)) * 0.001,
          ease: 'power4.in',
          onUpdate: () => {
            this.texts[targetId].mesh.scale.set(param.radius, param.radius, 1);
          },
          onComplete: () => {
            const t = this.texts[targetId];
            const shape = new p2.Circle({ radius: 1 * t.mesh.scale.x });
            const body = new p2.Body({
              mass: 50,
              position: [t.mesh.position.x, t.mesh.position.y],
              angle: t.mesh.rotation.z,
            });

            body.addShape(shape);
            this.world.addBody(body);
            t.body = body;
          },
        });
      });
  }

  remove(time: number) {
    this.texts
      .filter((text) => text.end < time)
      .filter((text) => text.body !== null)
      .forEach((t) => {
        this.world.removeBody(t.body!);
        t.body = null;
        t.start = 0;
        t.end = 0;
      });
  }
  reset() {
    this.texts.forEach((t) => {
      if (t.body) {
        this.world.removeBody(t.body);
      }
      t.body = null;
      t.start = 0;
      t.end = 0;
    });
  }
}
