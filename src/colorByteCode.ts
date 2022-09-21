// 画像下にくっつけるカラーバイトコードに関する関数群
import { createCanvas } from './utils';
import { Buffer } from 'buffer';
import { decode, encode } from '@msgpack/msgpack';
import { Pixel } from './types';

const R_CHANNEL_PARTITION = 4;
const G_CHANNEL_PARTITION = 4;
const B_CHANNEL_PARTITION = 4;

// 描画するカラーバイトコードのブロックサイズ
// 画像の長辺が MIN_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ
const MIN_IMAGE_WIDTH = 600;
const MIN_BLOCK_WIDTH = 8;

const BASE64_TABLE =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');

// ImageDataの拡張
declare global {
  interface ImageData {
    getPixelColor(x: number, y: number): Pixel;
  }
}
if (ImageData.prototype.getPixelColor === undefined) {
  ImageData.prototype.getPixelColor = function (x: number, y: number) {
    const index = (Math.round(x) + Math.round(y) * this.width) * 4;
    return [this.data[index], this.data[index + 1], this.data[index + 2]];
  };
}

// Base64文字を数値に変換する
const base64CharToNum = (char: string) =>
  BASE64_TABLE.findIndex((v) => v === char);
// Base64文字列を色配列に変換する
const base64StringToColors = (str: string): Pixel[] =>
  str.split('').map((v) => numToColor(base64CharToNum(v)));
// 数値をBase64文字に変換する
const numToBase64Char = (index: number) => BASE64_TABLE[index];
// 色配列をBase64文字列に変換する
const colorsToBase64String = (colors: Pixel[]) =>
  colors.reduce((p, c) => p + numToBase64Char(colorToNum(c)), '');

/**
 * 数値[0-63]を色に変換する
 * @param {*} color [r:number,g:number,b:number]
 */
const numToColor = (code: number): Pixel => {
  const bCode = code % B_CHANNEL_PARTITION;
  code = Math.floor(code / B_CHANNEL_PARTITION);

  const gCode = code % G_CHANNEL_PARTITION;
  code = Math.floor(code / G_CHANNEL_PARTITION);

  const rCode = code % R_CHANNEL_PARTITION;

  return [
    rCode * (255 / (R_CHANNEL_PARTITION - 1)),
    gCode * (255 / (G_CHANNEL_PARTITION - 1)),
    bCode * (255 / (B_CHANNEL_PARTITION - 1)),
  ];
};

/**
 * 色を数値[0-63]に変換する
 * @param {*} color [r:number,g:number,b:number]
 */
const colorToNum = (color: Pixel) => {
  let ret = getNearIndex(color[0], R_CHANNEL_PARTITION);
  ret = ret * G_CHANNEL_PARTITION + getNearIndex(color[1], G_CHANNEL_PARTITION);
  ret = ret * B_CHANNEL_PARTITION + getNearIndex(color[2], B_CHANNEL_PARTITION);
  return ret;
};

// v に一番近い Index を取得
const getNearIndex = (v: number, partition: number, max = 255) => {
  let ret = 0;
  let preDiff = max;
  for (let i = 0; i < partition; i++) {
    const diff = Math.abs(i * (max / (partition - 1)) - v);
    if (diff > preDiff) {
      break;
    }
    ret = i;
    preDiff = diff;
  }
  return ret;
};

// オブジェクトをJSON→Uint8Array→Base64にする
const objToBase64 = (v: unknown) => {
  return Buffer.from(encode(v)).toString('base64');
};

// base64をUint8Array→JSON→オブジェクトに変換する
const base64ToObj = (v: string): unknown => {
  // デコード失敗時、Base64末端の"A"を詰め物(=)に変更しつつ再トライする
  let retry = 0;
  while (retry < 4) {
    try {
      const str = window.atob(v);
      const ret = decode(
        Uint8Array.from(
          str.split('').map((v) => {
            return v.charCodeAt(0);
          })
        )
      );
      return ret;
    } catch (e) {
      console.log('catch', v.slice(-(retry + 1)).slice(0, 1));
      // もし末端が"A"じゃなかったら本当のデコード失敗
      if (v.slice(-(retry + 1)).slice(0, 1) !== 'A') {
        throw new Error('Failed to decode');
      }
      // 念のため
      if (retry > 4) {
        throw new Error('Failed to decode');
      }

      // 末端の"A"が"="の可能性を試す
      v =
        v.slice(0, v.length - retry - 1) +
        new Array(retry + 1).fill('=').reduce((p, c) => p + c, '');

      retry++;
    }
  }
};

// カラーバイトコードを印字する
const drawColorByteCodeBlock = (
  colorByteCodes: Pixel[],
  blockCountX: number,
  width: number
) => {
  // 印字するブロック数
  // const blockCountX = Math.floor(width / blockWidth);
  const length = colorByteCodes.length + 0;
  const blockWidth = width / blockCountX;

  // 最下段にデコード用の情報を入れる
  // 左から ブロック数/行(の1バイト)、ブロック数(2バイト) ... 右端にブロック数/行(の１バイト)
  // デコード時には 最初に左下端と右下端の情報から ブロック数/行 を算出したあと、ブロック数を取り出し、本データを取り始める
  console.log('blockCountX', blockCountX);
  // 左端にデータを挿入
  colorByteCodes.unshift(numToColor(Math.floor(length / 64)));
  colorByteCodes.unshift(numToColor(length % 64));
  colorByteCodes.unshift(numToColor(Math.floor(blockCountX / 64)));

  // 最初の行の右端にデータを挿入
  if (colorByteCodes.length < blockCountX - 1) {
    // 無意味なデータを埋めて横幅一杯にして埋め込む
    colorByteCodes.push(
      ...new Array(blockCountX - colorByteCodes.length - 1).fill([
        255, 255, 255,
      ])
    );
    colorByteCodes.push(numToColor(blockCountX % 64));
  } else {
    // 1行目の右端に埋め込む
    colorByteCodes = [
      ...colorByteCodes.slice(0, blockCountX - 1),
      numToColor(blockCountX % 64),
      ...colorByteCodes.slice(blockCountX - 1),
    ];
  }

  const blockCountY = Math.ceil(colorByteCodes.length / blockCountX);

  // 描画先キャンバス作成
  const [cv, ctx] = createCanvas(width, blockWidth * blockCountY);

  // 印字していく
  colorByteCodes.forEach((v, i) => {
    const x = (i % blockCountX) * blockWidth;
    const y = (blockCountY - Math.floor(i / blockCountX) - 1) * blockWidth;
    ctx.fillStyle = `rgb(${v[0]},${v[1]},${v[2]})`;
    ctx.fillRect(x, y, blockWidth + 1, blockWidth + 1);
  });

  return ctx.getImageData(0, 0, cv.width, cv.height);
};

// カラーバイトコードを読む
const readColorByteCode = (imageData: ImageData) => {
  // 左下と右下から ブロック数/行 を拾う
  const lNum = colorToNum(imageData.getPixelColor(0, imageData.height - 1));
  const rNum = colorToNum(
    imageData.getPixelColor(imageData.width - 1, imageData.height - 1)
  );

  const blockCountX = lNum * 64 + rNum;
  const blockWidth = imageData.width / blockCountX;

  console.log(blockCountX);

  // ブロック数を拾う
  const blockCountData = [
    [blockWidth * 1 + blockWidth / 2, imageData.height - blockWidth / 2],
    [blockWidth * 2 + blockWidth / 2, imageData.height - blockWidth / 2],
  ].map((v) => {
    console.log('color', v[0], v[1], imageData.getPixelColor(v[0], v[1]));
    return colorToNum(imageData.getPixelColor(v[0], v[1]));
  });
  // ブロック数
  const blockCount = blockCountData[0] + blockCountData[1] * 64;

  // 読み込みの開始
  const colors = [];
  // 4 は上記の固定データ数
  for (let i = 0; i < blockCount + 4; i++) {
    const x = (i % blockCountX) * blockWidth + blockWidth / 2;
    const y =
      imageData.height -
      Math.floor(i / blockCountX) * blockWidth -
      blockWidth / 2;
    // console.log(x, y)
    colors.push(imageData.getPixelColor(x, y));
  }

  // 本データの切り抜き
  let mainColors = [];
  if (blockCount + 3 < blockCountX) {
    // データが1行なら
    mainColors = colors.slice(3, 3 + blockCount);
  } else {
    // データが2行以上なら
    mainColors = [
      ...colors.slice(3, blockCountX - 1),
      ...colors.slice(blockCountX),
    ];
  }
  return mainColors;
};

// カラーバイトコードを作る
export const dataToColorByteCode = (
  data: unknown,
  width: number,
  height: number
) => {
  // 印字用データ
  const byte64Str = objToBase64(data);

  // 印字するカラーバイトコード
  const colorByteCodes = base64StringToColors(byte64Str);

  // 1行あたりのブロック数
  // 画像の長辺が MIN_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ
  const longStroke = width < height ? height : width;
  const blockWidth = Math.ceil(
    (MIN_BLOCK_WIDTH * longStroke) / MIN_IMAGE_WIDTH
  );
  const blockCountX = Math.floor(width / blockWidth);

  console.log(byte64Str);

  // 印字
  const colorByteCodeImageData = drawColorByteCodeBlock(
    colorByteCodes,
    blockCountX,
    width
  );

  return colorByteCodeImageData;
  // 暫定
  const canvas = document.querySelector('#BOARD');
  (canvas as HTMLCanvasElement).width = 1200;
  (canvas as HTMLCanvasElement).height = 200;

  const context = (canvas as HTMLCanvasElement).getContext('2d');

  context?.putImageData(colorByteCodeImageData, 0, 0);
};

// カラーバイトコードを読む
export const colorByteCodeToData = (imageData: ImageData): unknown => {
  const colors = readColorByteCode(imageData);
  const base64String = colorsToBase64String(colors);
  const data = base64ToObj(base64String);
  console.log(data);
  return data;
};

/*
const data = {
  v: 1,
  o: {
    s: 1,
    z: 1,
  },
  c: [
    [1, 1, 20, 20],
    [1, 1, 20, 20],
    [1, 1, 20, 20],
    [1, 1, 20, 20],
  ]

}
const text = JSON.stringify(data)


const printData = objToBase64(data)

console.log("encoded data", printData);
console.log("decoded data", base64ToObj(printData))

// console.log(createColorByteCode(data, 1200, 1600))

const testText = 'abcdefg';
for (let i = 0; i < 3; i++) {
  console.log(testText.slice(-(i + 1)).slice(0, 1))
  console.log(testText.slice(0, testText.length - i - 1) + new Array(i + 1).fill('0').reduce((p, c) => p + c, ''))
}
*/
