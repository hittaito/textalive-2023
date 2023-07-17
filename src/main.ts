import { Player } from 'textalive-app-api';
import WebGL from './webgl';
import song from './song.json';

const footerHeight = 60 + 3;

class Main {
  private webgl: WebGL;
  private player: Player;

  constructor() {
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
    canvas.width = innerWidth;
    canvas.height = innerHeight - footerHeight;
    this.webgl = new WebGL(canvas);

    this.player = new Player({ app: { token: import.meta.env.VITE_TOKEN } });
    this.player.addListener({
      onAppReady: () => {
        this.player.createFromSongUrl(song[0].url, song[0].data);
      },
      onAppMediaChange: () => {
        // 楽曲のリセット
      },
      onVideoReady: (v) => {
        // 初期状態に戻す
        document.querySelector('.lyric')!.textContent = '';
        document.querySelector('.current')!.textContent = '0:00';
        const progress = document.querySelector<HTMLElement>('.status')!;
        progress.style.width = '0%';
        this.webgl.reset();

        // 楽曲情報を更新する
        document.querySelector('.title')!.textContent =
          this.player.data.song.name;
        document.querySelector('.composer')!.textContent =
          this.player.data.song.artist.name;

        const ctrlBtn = document.querySelector('.ctrl-btn')!;
        ctrlBtn.classList.add('start-btn');
        ctrlBtn.classList.remove('load-btn');

        const totalsecond = this.player.data.song.length;
        const min = Math.floor(totalsecond / 60);
        const sec = Math.ceil(totalsecond % 60); // 切り上げor切り捨て??
        document.querySelector('.total')!.textContent = `${min}:${(
          '0' + sec
        ).slice(-2)}`;
        this.webgl.onAfterLoading(v.phrases);
      },
      onPause: () => {
        const ctrlBtn = document.querySelector('.ctrl-btn')!;
        ctrlBtn.classList.add('start-btn');
        ctrlBtn.classList.remove('pause-btn');
      },
      onPlay: () => {
        const ctrlBtn = document.querySelector('.ctrl-btn')!;
        ctrlBtn.classList.add('pause-btn');
        ctrlBtn.classList.remove('start-btn');
      },
      onStop: () => {},
      onTimeUpdate: (pos) => {
        // 少し早めに演出を出す。
        const isC = this.player.findChorus(pos + 500);
        this.webgl.onTimeUpdate(pos + 500, isC !== null);

        // progress barの更新
        const len = this.player.data.song.length;
        const progress = document.querySelector<HTMLElement>('.status')!;
        progress.style.width = `${(pos / 1000 / len) * 100}%`;

        // timeの更新
        let min = Math.floor(pos / 1000 / 60);
        let sec = Math.ceil((pos / 1000) % 60);
        if (sec === 60) {
          sec = 0;
          min += 1;
        }
        document.querySelector('.current')!.textContent = `${min}:${(
          '0' + sec
        ).slice(-2)}`;

        // 歌詞の更新
        const phrase = this.player.video.findPhrase(pos);
        document.querySelector('.lyric')!.textContent = phrase.text;
      },
    });

    // register event
    window.addEventListener('resize', () => {
      this.webgl.resize();
    });
    window.addEventListener('mousemove', (event) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      this.webgl.mousemove(event.x / W, 1 - event.y / H);
    });
    window.addEventListener('touchmove', (event) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const t = event.touches[0];
      this.webgl.mousemove(t.clientX / W, 1 - t.clientY / H);
    });

    canvas.addEventListener('click', () => {
      this.webgl.changeColor();
    });
  }
  start() {
    this.player.requestPlay();
  }
  pause() {
    this.player.requestPause();
  }
  change(i: number) {
    this.player.requestPause();
    this.player.createFromSongUrl(song[i].url, song[i].data);
    this.webgl.onTimeUpdate(0, false);
  }
}

window.onload = () => {
  const m = new Main();

  const btn = document.querySelector('.ctrl-btn')!;
  btn.addEventListener('click', () => {
    if (btn.classList.contains('start-btn')) {
      m.start();
    }
    if (btn.classList.contains('pause-btn')) {
      m.pause();
    }
  });

  const menu = document.querySelector('.menu-btn')!;
  const list = document.querySelectorAll('li');
  const ul = document.querySelector<HTMLElement>('.submenu')!;
  const background = document.querySelector<HTMLElement>('.background')!;
  menu.addEventListener('click', () => {
    if (ul.style.display === 'block') {
      ul.style.display = 'none';
    } else {
      ul.style.display = 'block';
      background.classList.add('visible');
    }
  });

  list.forEach((l, i) => {
    l.addEventListener('click', () => {
      if (ul.style.display === 'block') {
        ul.style.display = 'none';
      } else {
        ul.style.display = 'block';
      }
      m.change(i);
    });
  });

  background.addEventListener('click', () => {
    ul.style.display = 'none';
    background.classList.remove('visible');
  });
};
