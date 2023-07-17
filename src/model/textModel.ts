import * as THREE from 'three';
import { TAData } from '../types';
import { pallet } from '../Color';

let SIZE = 128 * 2; // グリッドサイズ
let ROW = 7;
let diff = 30;

export default class TextModel {
  words: string[];
  texture: THREE.Texture;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: TAData[] = [];
  constructor(size: number) {
    if (size < 900) {
      SIZE = 128;
      ROW = 5;
      diff = 15;
    }
    // SDF用canvas
    this.canvas = document.createElement('canvas')!;
    this.canvas.width = SIZE * ROW;
    this.canvas.height = SIZE * ROW;
    this.ctx = this.canvas.getContext('2d')!;
    // this.canvas.style.backgroundColor = 'blue';
    // this.canvas.style.position = 'absolute';
    // this.canvas.style.zIndex = '2';
    // this.canvas.style.top = '63px';
    // this.canvas.style.opacity = '1';
    // this.canvas.style.width = '500px';
    document.body.appendChild(this.canvas);

    this.texture = new THREE.CanvasTexture(
      this.canvas,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter
    );

    this.texture.premultiplyAlpha = true;
    this.texture.needsUpdate = true;
  }
  setCharData(data: TAData[]) {
    this.data = data;
  }
  update(time: number) {
    if (this.data.length === 0) return;
    this.ctx.clearRect(0, 0, SIZE * ROW, SIZE * ROW);
    const fontSize = SIZE * 0.8;
    this.ctx.font = `${SIZE * 0.8}px 'Noto Serif JP'`;
    // this.ctx.textBaseline = 'top'; // safariだと合わない
    this.ctx.fillStyle = pallet.second;

    let final = this.data.findIndex((d) => time < d.startTime - 1000);
    if (final === -1) {
      if (this.data[this.data.length - 1].startTime - 1000 > time) {
        final = this.data.length - 1;
      } else {
        return;
      }
    }

    const drawChars = this.data.slice(
      Math.max(0, final - ROW * ROW + 1),
      final + 1
    );
    drawChars.forEach((c) => {
      const x = c.tId % ROW;
      const y = Math.floor((c.tId % (ROW * ROW)) / ROW);

      this.ctx.fillText(
        c.char,
        x * SIZE + (SIZE - fontSize) / 2,
        (y + 1) * SIZE - (SIZE - fontSize) / 2 - diff
      );
      // this.ctx.strokeStyle = 'rgba(255, 0, 0)';
      // this.ctx.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
    });
    this.texture.needsUpdate = true;
  }
}
