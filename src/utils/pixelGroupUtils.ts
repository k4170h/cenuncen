// PixelGroup に対する加工関連Util

import { generateNumArrByHash } from './mathUtils';
import { Pixel, PixelGroup } from './types';

/**
 * PixelGroup の色を hash によって ネガ反転
 * @param groups
 * @param hash
 * @returns
 */
export const negaGroups = (groups: PixelGroup[], hash: string) => {
  const hashNums = generateNumArrByHash(hash);
  const ret = new Array(groups.length);
  for (let i = 0; i < groups.length; i++) {
    const h = (hashNums[i % hashNums.length] % 7) + 1;
    ret[i] = negaGroup(groups[i], [h & 1, h & 2, h & 4]);
  }
  return ret;
};
const negaGroup = (group: PixelGroup, pattern = [1, 1, 1]) => {
  return group.map((pixel) => {
    return negaPixel(pixel, pattern);
  });
};
const negaPixel = (pixel: Pixel, pattern = [1, 1, 1]): Pixel => {
  return [
    pattern[0] ? 255 - pixel[0] : pixel[0],
    pattern[1] ? 255 - pixel[1] : pixel[1],
    pattern[2] ? 255 - pixel[2] : pixel[2],
  ];
};

/**
 * グループを回転する hash に基づいて回転させる。
 * @param groups
 * @param hash
 * @returns
 */
export const rotateGroups = (groups: PixelGroup[], hash: string) => {
  const hashNums = generateNumArrByHash(hash);
  return groups.map((v, i) => {
    const h = hashNums[i % hashNums.length] % 4;
    return h === 0 ? v : rotateGroup(v, h as 1 | 2 | 3);
  });
};
/**
 * 回転されていたグループをhash に基づいて戻す。
 * @param groups
 * @param hash
 * @returns
 */
export const rerotateGroups = (groups: PixelGroup[], hash: string) => {
  const hashNums = generateNumArrByHash(hash);
  return groups.map((v, i) => {
    const h = hashNums[i % hashNums.length] % 4;
    return h === 0 ? v : rotateGroup(v, (4 - h) as 1 | 2 | 3);
  });
};
const rotateGroup = (group: PixelGroup, angle: 1 | 2 | 3) => {
  const size = Math.sqrt(group.length);
  const ret: PixelGroup = new Array(group.length);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      switch (angle) {
        case 1:
          // 時計回りに90
          ret[j * size + (size - i - 1)] = group[i * size + j];
          break;
        case 2:
          // 時計回りに180
          ret[(size - i - 1) * size + (size - j - 1)] = group[i * size + j];
          break;
        case 3:
          // 時計回りに270
          ret[(size - j - 1) * size + i] = group[i * size + j];
          break;
      }
    }
  }
  return ret;
};

/**
 * hash に基づいて グループを反転する
 * @param groups
 * @param hash
 * @returns
 */
export const flipGroups = (groups: PixelGroup[], hash: string) => {
  const hashNums = generateNumArrByHash(hash);
  return groups.map((v, i) => {
    const h = hashNums[i % hashNums.length] % 3;
    return h === 0 ? v : flipGroup(v, h as 1 | 2);
  });
};
const flipGroup = (group: PixelGroup, mode: 1 | 2) => {
  const size = Math.sqrt(group.length);
  const ret: PixelGroup = new Array(group.length);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      switch (mode) {
        case 1:
          // 水平反転
          ret[i * size + (size - j - 1)] = group[i * size + j];
          break;
        case 2:
          // 垂直反転
          ret[(size - i - 1) * size + j] = group[i * size + j];
          break;
      }
    }
  }
  return ret;
};

/**
 * 引数のPixelGroupからImageDataを作る
 * @param pixelGroup
 * @param size 1辺の長さ
 * @returns
 */
export const pixelGroupToImageData = (pixelGroup: PixelGroup, size: number) => {
  const retPixels = new Uint8ClampedArray(size * size * 4);
  pixelGroup.forEach((v, i) => {
    retPixels[i * 4] = v[0];
    retPixels[i * 4 + 1] = v[1];
    retPixels[i * 4 + 2] = v[2];
    retPixels[i * 4 + 3] = 255;
  });
  return new ImageData(retPixels, size, size);
};

/**
 * 引数のPixel配列からImageDataを作る
 * @param pixels
 * @param w
 * @param h
 * @returns
 */
export const pixelsToImageData = (
  pixels: Pixel[],
  w: number,
  h: number
): ImageData => {
  const retPixels = new Uint8ClampedArray(w * h * 4);
  pixels.forEach((v, i) => {
    retPixels[i * 4] = v[0];
    retPixels[i * 4 + 1] = v[1];
    retPixels[i * 4 + 2] = v[2];
    retPixels[i * 4 + 3] = 255;
  });
  return new ImageData(retPixels, w, h);
};

// s四方でグループ化していたピクセルを戻す。w,h は s で割り切れないとダメ
export const groupToPixels = (
  groups: PixelGroup[],
  w: number,
  h: number,
  gridWidth: number
): Pixel[] => {
  const pixels = new Array(h * w);
  for (let i = 0; i < h; i += gridWidth) {
    for (let j = 0; j < w; j += gridWidth) {
      for (let k = 0; k < gridWidth; k++) {
        for (let l = 0; l < gridWidth; l++) {
          pixels[i * w + k * w + j + l] =
            groups[((i / gridWidth) * w) / gridWidth + j / gridWidth][
              k * gridWidth + l
            ];
        }
      }
    }
  }
  return pixels;
};
