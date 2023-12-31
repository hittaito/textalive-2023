# 「マジカルミライ 2023」 プログラミング・コンテスト応募作品 「風化」

TextAlive App Api を用いたリリックアプリです。  
本リポジトリは、「マジカルミライ 2023」 プログラミング・コンテスト応募作品となります。

![img](https://github.com/hittaito/textalive-2023/assets/61876075/e78e8ed9-6b9e-4f8b-b124-72ebb8eaa38c))

## 開発

Node.js がインストールされている環境が必要です。  
また、事前に開発者登録を行いトークンを取得する必要があります。[参考](https://developer.textalive.jp/)

```bash
// パッケージのインストール
$ npm install

// .envを作成し、textalive開発者トークンを記載します
$ echo 'VITE_TOKEN={{YOUR_TOKEN}}' > .env

// 開発サーバーの起動
$ npm run dev

// ビルド。distディレクトリが作成されます。
$ npm run build
```

## アプリ説明

歌詞そのものを演出の中心に置いた作品です。歌詞を目で追いたくなるようにシンプルな演出を目指しました。

- 楽曲に合わせて歌詞がポンと表示されていきます。
- 出現した歌詞は一定時間経過後、フワッと消えていきます。
- 物理演算を用いることで文字とのインタラクションを楽しむことが来出ます。マウスをグリグリして動作を楽しんでください。
- 画面をクリックすることでポインターの色が変わります。好きな色で動かしてください。
- 画面左下から好きな楽曲を選択してください。

## 動作環境

PC 環境を推奨しています。  
スマートフォンでも動作を確認しておりますが、演出の都合上スマートフォンでは見づらい部分があります。
