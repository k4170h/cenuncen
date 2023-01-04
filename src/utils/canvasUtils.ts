// CanvasやImageDataに関するUtil

import { Pixel } from './types';

/**
 * Canvas から 2D コンテキストを取得する
 * @param cv
 * @returns
 */
export const getContext = (cv: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = cv.getContext('2d', { willReadFrequently: true });
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
 * 引数のImageDataから [ピクセル数]*Pixel の2次元配列を作る
 * @param imageData
 * @returns
 */
export const imageDataToPixels = (imageData: ImageData): Pixel[] => {
  const pixels = imageData.data;
  return new Array(pixels.length / 4).fill(null).map((_, i) => {
    return [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
  });
};

/**
 * 引数のImageDataの横幅を w にリサイズした ImageData を取得する
 * @param imageData
 * @param w
 * @returns
 */
export const resizeImageData = (
  imageData: ImageData,
  w: number,
  h?: number
) => {
  const [cv] = createCanvasFromImage(imageData);

  if (!h) {
    const scale = w / imageData.width;
    const h = imageData.height * scale;
    const [, resultCx] = createCanvas(w, h);
    resultCx.scale(scale, scale);
    resultCx.drawImage(cv, 0, 0);
    return resultCx.getImageData(0, 0, w, h);
  } else {
    const scaleX = w / imageData.width;
    const scaleY = h / imageData.height;
    const [, resultCx] = createCanvas(w, h);
    resultCx.scale(scaleX, scaleY);
    resultCx.drawImage(cv, 0, 0);
    return resultCx.getImageData(0, 0, w, h);
  }
};
