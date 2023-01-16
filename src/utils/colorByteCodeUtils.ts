// 画像下にくっつけるカラーバイトコードに関する関数群
import { createCanvas } from './canvasUtils';
import { Buffer } from 'buffer';
import { decode, encode } from '@msgpack/msgpack';
import { EncodeOptions, Pixel, RectArea } from './types';
import {
  MIN_COLOR_BYTE_BLOCK_WIDTH,
  MIN_RESIZED_IMAGE_WIDTH,
} from './definition';
import {} from './pixelGroupUtils';

const R_CHANNEL_PARTITION = 4;
const G_CHANNEL_PARTITION = 4;
const B_CHANNEL_PARTITION = 4;

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
export const base64CharToNum = (char: string) =>
  BASE64_TABLE.findIndex((v) => v === char);
// Base64文字列を色配列に変換する
const base64StringToColors = (str: string): Pixel[] =>
  str.split('').map((v) => numToColor(base64CharToNum(v)));
// 数値をBase64文字に変換する
export const numToBase64Char = (index: number) => BASE64_TABLE[index];
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
  return Buffer.from(encode(JSON.parse(JSON.stringify(v)))).toString('base64');
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
      // もし末端が"A"じゃなかったら本当のデコード失敗
      if (v.slice(-(retry + 1)).slice(0, 1) !== 'A') {
        throw new Error('Couldnt Find ColorByteCode.');
      }
      // 念のため
      if (retry > 4) {
        throw new Error('Couldnt Find ColorByteCode.');
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
  const length = colorByteCodes.length + 0;
  const blockWidth = width / blockCountX;

  // 最下段にデコード用の情報を入れる
  // 左から ブロック数/行(の1バイト)、バージョン(1バイト)、ブロック数(2バイト) ... 右端にブロック数/行(の１バイト)
  // デコード時には 最初に左下端と右下端の情報から ブロック数/行 を算出したあと、ブロック数を取り出し、本データを取り始める

  // 左端にデータを挿入
  colorByteCodes.unshift(numToColor(Math.floor(length / 64))); // ブロック数
  colorByteCodes.unshift(numToColor(length % 64)); // ブロック数
  colorByteCodes.unshift(numToColor(1)); // バージョン
  colorByteCodes.unshift(numToColor(Math.floor(blockCountX / 64))); // ブロック数/行(の1バイト)

  // 最初の行の右端にデータを挿入
  if (colorByteCodes.length < blockCountX - 1) {
    // 無意味なデータを埋めて横幅一杯にして埋め込む
    colorByteCodes.push(
      ...new Array(blockCountX - colorByteCodes.length - 1).fill(null)
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
    if (v == null) {
      return;
    }
    const x = (i % blockCountX) * blockWidth;
    const y = (blockCountY - Math.floor(i / blockCountX) - 1) * blockWidth;
    ctx.fillStyle = `rgb(${v[0]},${v[1]},${v[2]})`;
    ctx.fillRect(x, y, blockWidth + 1, blockWidth + 1);
  });
  return ctx.getImageData(0, 0, cv.width, cv.height);

  // 色を黒くする
  // let pixels = imageDataToPixels(ctx.getImageData(0, 0, cv.width, cv.height));
  // pixels = lowContrastPixels(pixels, COLOR_BYTE_BLOCK_CONTRAST);
  // pixels = shiftColorPixels(
  //   pixels,
  //   COLOR_BYTE_BLOCK_CONTRAST,
  //   COLOR_BYTE_BLOCK_SHIFT_COLOR
  // );
  // return pixelsToImageData(pixels, cv.width, cv.height);
};

// カラーバイトコードを読む
const readColorByteCode = (imageData: ImageData) => {
  // 黒いやつを明るくする
  // let pixels = imageDataToPixels(imageData);
  // pixels = unShiftColorPixels(
  //   pixels,
  //   COLOR_BYTE_BLOCK_CONTRAST,
  //   COLOR_BYTE_BLOCK_SHIFT_COLOR
  // );
  // pixels = restoreLowContrastPixels(pixels, COLOR_BYTE_BLOCK_CONTRAST);
  // imageData = pixelsToImageData(pixels, imageData.width, imageData.height);

  // 左下と右下から ブロック数/行 を拾う
  const lNum = colorToNum(imageData.getPixelColor(0, imageData.height - 1));
  const rNum = colorToNum(
    imageData.getPixelColor(imageData.width - 1, imageData.height - 1)
  );
  console.log('read', lNum, rNum);

  const blockCountX = lNum * 64 + rNum;
  const blockWidth = imageData.width / blockCountX;

  // バージョンを拾う
  // const version = colorToNum(
  //   imageData.getPixelColor(
  //     blockWidth + blockWidth / 2,
  //     imageData.height - blockWidth / 2
  //   )
  // );

  // 以降は バージョン=1 の読み込み方法
  // もし別バージョンのカラーバイトコードを編み出したらここを分岐させる

  // ブロック数を拾う
  const blockCountData = [
    [blockWidth * 2 + blockWidth / 2, imageData.height - blockWidth / 2],
    [blockWidth * 3 + blockWidth / 2, imageData.height - blockWidth / 2],
  ].map((v) => {
    return colorToNum(imageData.getPixelColor(v[0], v[1]));
  });
  // ブロック数
  const blockCount = blockCountData[0] + blockCountData[1] * 64;

  // 読み込みの開始
  const colors = [];
  // 5 は上記の固定データ数
  for (let i = 0; i < blockCount + 5; i++) {
    const x = (i % blockCountX) * blockWidth + blockWidth / 2;
    const y =
      imageData.height -
      Math.floor(i / blockCountX) * blockWidth -
      blockWidth / 2;
    colors.push(imageData.getPixelColor(x, y));
  }

  // 本データの切り抜き
  let mainColors = [];
  if (blockCount + 4 < blockCountX) {
    // データが1行なら
    mainColors = colors.slice(4, 4 + blockCount);
  } else {
    // データが2行以上なら
    mainColors = [
      ...colors.slice(4, blockCountX - 1),
      ...colors.slice(blockCountX),
    ];
  }
  return mainColors;
};

// カラーバイトコードを作る
export const dataToColorByteCode = (
  encodeOptions: EncodeOptions,
  filledAreas: RectArea[],
  clipArea: RectArea,
  mainArea: RectArea,
  size: [number, number]
) => {
  // データ作成
  const data = toData({
    encodeOptions,
    filledAreas,
    clipArea,
    mainArea,
    size,
  });
  console.log('save', data);

  // 1行あたりのブロック数
  // 画像の長辺が MIN_RESIZED_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ
  const longStroke = size[0] < size[1] ? size[1] : size[0];
  let blockWidth = Math.ceil(
    (MIN_COLOR_BYTE_BLOCK_WIDTH * longStroke) / MIN_RESIZED_IMAGE_WIDTH
  );
  if (blockWidth < MIN_COLOR_BYTE_BLOCK_WIDTH) {
    blockWidth = MIN_COLOR_BYTE_BLOCK_WIDTH;
  }

  const blockCountX = Math.floor(size[0] / blockWidth);
  console.log('byte width', blockWidth, longStroke);

  // 印字用データ
  const byte64Str_ = objToBase64(data);

  // 事前に高さを算出してデータを再編集  5はJson以外の固定データ
  const height = Math.ceil((byte64Str_.length + 5) / blockCountX) * blockWidth;

  data.s[1] += height;

  // 印字用データ
  const byte64Str = objToBase64(data);

  // 印字するカラーバイトコード
  const colorByteCodes = base64StringToColors(byte64Str);

  // 印字
  const colorByteCodeImageData = drawColorByteCodeBlock(
    colorByteCodes,
    blockCountX,
    size[0]
  );

  return colorByteCodeImageData;
};

// カラーバイトコードを読む
export const colorByteCodeToData = (imageData: ImageData) => {
  const colors = readColorByteCode(imageData);
  const base64String = colorsToBase64String(colors);
  const data = base64ToObj(base64String);
  return fromData(data);
};

export const fromData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): {
  encodeOptions: EncodeOptions;
  filledAreas: RectArea[];
  size: [number, number];
  clippedArea: RectArea;
  mainArea: RectArea;
} => {
  const result = {
    encodeOptions: {
      gridSize: data.o.g,
      isSwap: data.o.s,
      isRotate: data.o.r,
      isNega: data.o.n,
      // hashKey: data.o.k ? DEFAULT_KEY : undefined,
      shiftColor: data.o.c,
    },
    filledAreas: data.c,
    size: data.s,
    clippedArea: data.g,
    mainArea: data.p,
  };
  if (
    !result.encodeOptions ||
    !result.filledAreas ||
    result.filledAreas.length === 0 ||
    !result.size ||
    result.size.length !== 2 ||
    !result.clippedArea ||
    result.clippedArea.length !== 4 ||
    !result.mainArea ||
    result.mainArea.length !== 4
  ) {
    throw new Error('Invalid ColorByteCode Type.');
  }

  if (result.encodeOptions.shiftColor) {
    const cs = result.encodeOptions.shiftColor;
    if (!cs.length || cs.length !== 2) {
      result.encodeOptions.shiftColor = undefined;
    } else if (!cs[0] || cs[0] <= 0 || 1 <= cs[0]) {
      result.encodeOptions.shiftColor = undefined;
    } else if (!cs[1].length || cs[1].length !== 3) {
      result.encodeOptions.shiftColor = undefined;
    } else {
      result.encodeOptions.shiftColor = {
        contrast: Number(cs[0]),
        color: cs[1],
      };
    }
  }

  console.log('load', result);
  return result;
};

export const toData = ({
  encodeOptions,
  filledAreas,
  clipArea,
  mainArea,
  size,
}: {
  encodeOptions: EncodeOptions;
  // 隠蔽エリア [x,y,w/gridSize,h/gridSize]
  filledAreas: RectArea[];
  // 隠蔽で切り取った画像 [x,y,w/gridSize,h/gridSize]
  clipArea: RectArea;
  // メイン画像[x,y,w,h]
  mainArea: RectArea;
  // 最終的な画像サイズ [w,h]
  size: [number, number];
}) => {
  return {
    s: size,
    o: {
      // k: encodeOptions.hashKey != null ? 1 : 0,
      s: encodeOptions.noSwap ? 1 : undefined,
      n: encodeOptions.noNega ? 1 : undefined,
      r: encodeOptions.noRotate ? 1 : undefined,
      g: encodeOptions.gridSize,
      c: encodeOptions.shiftColor
        ? [encodeOptions.shiftColor.contrast, encodeOptions.shiftColor.color]
        : undefined,
    },
    c: filledAreas,
    g: clipArea,
    p: mainArea,
  };
};
