// PixelGroup に対する加工関連Util

import { generateNumArrByHash } from './mathUtils';
import { Pixel, PixelGroup } from './types';

/**
 * PixelGroup の色味を薄くする
 * @param groups
 * @param hash
 * @returns
 */
export const lowContrastGroups = (
  groups: PixelGroup[],
  contrastLevel: number
) => {
  return groups.map((group) => lowContrastPixels(group, contrastLevel));
};
export const lowContrastPixels = (pixels: Pixel[], contrastLevel: number) => {
  return pixels.map((pixel) => {
    return ([0, 1, 2] as const).map((v) => {
      const col = pixel[v];
      if (col >= 128) {
        return 128 + (col - 128) * contrastLevel;
      } else {
        return 128 - (128 - col) * contrastLevel;
      }
    }) as Pixel;
  });
};

/**
 * PixelGroup の薄くなっていた色味を戻す
 * @param groups
 * @param contrastLevel [0-1]
 * @returns
 */
export const restoreLowContrastGroups = (
  groups: PixelGroup[],
  contrastLevel: number
) => {
  return groups.map((group) => restoreLowContrastPixels(group, contrastLevel));
};
export const restoreLowContrastPixels = (
  pixels: Pixel[],
  contrastLevel: number
) => {
  return pixels.map((pixel) => {
    return ([0, 1, 2] as const).map((v) => {
      const col = pixel[v];
      if (col >= 128) {
        return 128 + (1 / contrastLevel) * (col - 128);
      } else {
        return 128 - (1 / contrastLevel) * (128 - col);
      }
    }) as Pixel;
  });
};

/**
 * 色味がなくなった分、任意の色に寄せる
 * @param groups
 * @param contrastLevel コントラスト
 * @param color カラーコード。[0-f]{6}
 * @returns
 */
export const shiftColorGroups = (
  groups: PixelGroup[],
  contrastLevel: number,
  color: string
) => {
  // 16進を%に
  return groups.map((group) =>
    shiftColorPixels(group, contrastLevel, colorCode3To6(color))
  );
};

/**
 * [0-f]{6}のカラーコードを[0-f]{3}にする
 */
export const colorCode3To6 = (colorcode: string): string => {
  return (
    colorcode
      .match(/.{2}/g)
      ?.map((v) => {
        const d = parseInt(v, 16);
        let chr = Math.floor(d / 17);
        if (d % 17 > 8) {
          chr = chr + 1;
        }
        return chr.toString(16);
      })
      .join('') ?? ''
  );
};

export const shiftColorPixels = (
  pixels: Pixel[],
  contrastLevel: number,
  color: string
) => {
  // 16進を%に
  const colorPer = color.split('').map((v) => parseInt(v, 16) / 16);
  const base = 128 - 128 * contrastLevel;
  return pixels.map((pixel) => {
    return ([0, 1, 2] as const).map((v) => {
      return pixel[v] - base + base * 2 * colorPer[v];
    }) as Pixel;
  });
};

/**
 *
 * @param groups
 * @param color
 * @returns
 */
export const unShiftColorGroups = (
  groups: PixelGroup[],
  contrastLevel: number,
  color: string
) => {
  return groups.map((group) => unShiftColorPixels(group, contrastLevel, color));
};

export const unShiftColorPixels = (
  pixels: Pixel[],
  contrastLevel: number,
  color: string
) => {
  // 16進を%に
  const colorPer = color.split('').map((v) => parseInt(v, 16) / 16);
  const base = 128 - 128 * contrastLevel;
  return pixels.map((pixel) => {
    return ([0, 1, 2] as const).map(
      (v) => pixel[v] + base - base * 2 * colorPer[v]
    ) as Pixel;
  });
};

/**
 * PixelGroup の色を hash によって ネガ反転
 * @param groups
 * @param hash
 * @returns
 */
export const negaGroups = (groups: PixelGroup[], hash: string) => {
  const hashNums = generateNumArrByHash(hash);
  return groups.map((v, i) => {
    const h = (hashNums[i % hashNums.length] % 7) + 1;
    return negaGroup(v, [h & 1, h & 2, h & 4]);
  });
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
 * @param w 実際のサイズ
 * @param h 実際のサイズ
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

/**
 * 1隠蔽エリアのPixelGroup[] を Pixel[]にする
 * @param groups
 * @param w 横幅
 * @param h 縦幅
 * @param gridWidth
 * @returns
 */
export const groupsToPixels = (
  groups: PixelGroup[],
  width: number,
  height: number,
  gridWidth: number
): Pixel[] => {
  const pixels = new Array(width * height);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const groupIndex =
        Math.floor(i / gridWidth) * (width / gridWidth) +
        Math.floor(j / gridWidth);
      const x = j % gridWidth;
      const y = i % gridWidth;
      pixels[i * width + j] = groups[groupIndex][y * gridWidth + x];
    }
  }
  return pixels;
};

/**
 * ピクセルをs四方でグループ化。w,h は s で割り切れないとダメ
 * @param pixels
 * @param w 元画像の横幅
 * @param h 元画像の縦幅
 * @param s
 * @returns
 */
export const pixelsToGroups = (
  pixels: Pixel[],
  w: number,
  h: number,
  s: number
): PixelGroup[] => {
  const groups = new Array(Math.round((w * h) / (s * s)));
  // そのピクセル配列を s*s でグループ化
  for (let i = 0; i < h; i += s) {
    for (let j = 0; j < w; j += s) {
      const pixelGroup = new Array(Math.round(s * s));
      for (let k = 0; k < s; k++) {
        for (let l = 0; l < s; l++) {
          pixelGroup[Math.round(k * s + l)] =
            pixels[Math.round(i * w + k * w + j + l)];
        }
      }
      groups[Math.round((i / s) * (w / s) + j / s)] = pixelGroup;
    }
  }
  return groups;
};
