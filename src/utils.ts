// 比較的汎用的な関数群

import jsSHA from 'jssha';

/**
 * Canvas から 2D コンテキストを取得する
 * @param cv
 * @returns
 */
export const getContext = (cv: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = cv.getContext('2d');
  if (ctx == null) {
    throw new Error();
  }
  return ctx;
};

/**
 * 引数で指定したサイズの canvas とその context を返す
 * @param w
 * @param h
 * @returns
 */
export const createCanvas = (
  w: number,
  h: number
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = getContext(cv);
  return [cv, ctx];
};

/**
 * 引数の ImageData か CanvasElement から canvas とその context を返す
 * @param image
 * @returns
 */
//
export const createCanvasFromImage = (
  image: ImageData | HTMLImageElement
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const [cv, ctx] = createCanvas(image.width, image.height);
  if (isImage(image)) {
    ctx.drawImage(image, 0, 0);
  } else {
    ctx.putImageData(image, 0, 0);
  }
  return [cv, ctx];
};

/**
 * 引数が image か否かを返す
 * @param image
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isImage = (image: any): image is HTMLImageElement => {
  return image.src != null;
};

/**
 * 引数の文字列からHashを作る
 * @param key
 * @returns
 */
export const createHash = (key: string) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(key);
  return shaObj.getHash('HEX');
};

/**
 * Hashを1文字ずつ数値[0-15]に置き換えた配列にする
 * 引数の range で数値の範囲を引き延ばす
 * @param hash
 * @param range optional. default 16
 * @returns
 */
export const generateNumArrByHash = (hash: string, range = 16): number[] => {
  const matched = hash.match(/.{1}/g);
  if (matched == null) {
    throw new Error();
  }
  return matched.map((v) => {
    return parseInt(v, 16) * Math.ceil(range / 16);
  });
};

// v の最寄りの p の倍数を取得する
export const getNear = (v: number, m: number) => {
  return m * Math.round(v / m);
};

export const getNearCeil = (v: number, m: number) => {
  return m * Math.ceil(v / m);
};
