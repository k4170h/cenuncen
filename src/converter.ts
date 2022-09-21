import { colorByteCodeToData, dataToColorByteCode } from './colorByteCode';
import { Options, Pixel, PixelGroup, RectArea } from './types';
import {
  createCanvas,
  createCanvasFromImage,
  createHash,
  generateNumArrByHash,
  getContext,
} from './utils';

/**
 * 引数のImageDataから [ピクセル数]*Pixel の2次元配列を作る
 * @param imageData
 * @returns
 */
const imageDataToPixelArray = (imageData: ImageData): Pixel[] => {
  const pixels = imageData.data;
  return new Array(pixels.length / 4).fill(null).map((_, i) => {
    return [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
  });
};

/**
 * 引数のPixel配列からImageDataを作る
 * @param pixels
 * @param w
 * @param h
 * @returns
 */
const pixelArrayToImageData = (
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

// ピクセルをs四方でグループ化。w,h は gridWidth で割り切れないとダメ
const pixelsToGroup = (
  pixels: Pixel[],
  w: number,
  h: number,
  gridWidth: number
): PixelGroup[] => {
  console.log((w * h) / (gridWidth * gridWidth));
  const groups = new Array(Math.round((w * h) / (gridWidth * gridWidth)));
  // そのピクセル配列を s*s でグループ化
  for (let i = 0; i < h; i += gridWidth) {
    for (let j = 0; j < w; j += gridWidth) {
      const pixelGroup = new Array(Math.round(gridWidth * gridWidth));
      for (let k = 0; k < gridWidth; k++) {
        for (let l = 0; l < gridWidth; l++) {
          pixelGroup[Math.round(k * gridWidth + l)] =
            pixels[Math.round(i * w + k * w + j + l)];
        }
      }
      groups[Math.round((i / gridWidth) * (w / gridWidth) + j / gridWidth)] =
        pixelGroup;
    }
  }
  return groups;
};

// s四方でグループ化していたピクセルを戻す。w,h は s で割り切れないとダメ
const groupToPixels = (
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

// Hashをもとに配列を混ぜる
const sortByHash = (arr: PixelGroup[], hash: string) => {
  const beforeArr = JSON.parse(JSON.stringify(arr));
  const hashes = generateNumArrByHash(hash, beforeArr.length);

  const ret = new Array(beforeArr.length).fill(null);
  let index = 0;
  while (0 < beforeArr.length) {
    const hashIndex = hashes[index % hashes.length] % beforeArr.length;
    ret[index] = beforeArr[hashIndex];
    beforeArr.splice(hashIndex, 1);
    index++;
  }
  return ret;
};

// Hashをもとに混ざっていた配列を戻す
const resortByHash = (arr: PixelGroup[], hash: string) => {
  const hashes = generateNumArrByHash(hash, arr.length);
  const ret = new Array(arr.length).fill(null);
  for (let i = 0; i < arr.length; i++) {
    const hashIndex = hashes[i % hashes.length];
    let c = 0,
      ite = 0;
    while (c <= hashIndex) {
      c = ret[ite % ret.length] == null ? c + 1 : c;
      ite++;
    }
    ite--;
    ret[ite % ret.length] = arr[i];
  }
  return ret;
};

/**
 * PixelGroup の色を hash によって ネガ反転
 * @param groups
 * @param hash
 * @returns
 */
const negaGroups = (groups: PixelGroup[], hash: string) => {
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
const negaPixel = (pixel: Pixel, pattern = [1, 1, 1]) => {
  return [
    pattern[0] ? 255 - pixel[0] : pixel[0],
    pattern[1] ? 255 - pixel[1] : pixel[1],
    pattern[2] ? 255 - pixel[2] : pixel[2],
  ];
};

/**
 * リサイズ後の画像をデコードするとグリッドの境目が劣化する。ので、そのエリアを中央から引き延ばしてくる
 * @param imageData
 * @param gridWidth グリッドサイズ
 * @param gridLineWidth 劣化してると思しき範囲。グリッドの外側のgridLineWidth px が劣化している想定
 * @returns
 */
function fillGridLine(
  imageData: ImageData,
  gridWidth: number,
  gridLineWidth: number
) {
  const pixels = imageData.data;
  let ite = 0;
  const retArr = new Uint8ClampedArray(imageData.width * imageData.height * 4);
  for (let i = 0; i < imageData.height; i++) {
    for (let j = 0; j < imageData.width; j++) {
      // 対象座標のグリッド内における座標
      const pointer = [i % gridWidth, j % gridWidth];

      if (pointer[0] < gridLineWidth) {
        pointer[0] = gridLineWidth;
      }
      if (gridWidth - gridLineWidth <= pointer[0]) {
        pointer[0] = gridWidth - gridLineWidth - 1;
      }
      if (pointer[1] < gridLineWidth) {
        pointer[1] = gridLineWidth;
      }
      if (gridWidth - gridLineWidth <= pointer[1]) {
        pointer[1] = gridWidth - gridLineWidth - 1;
      }

      const px = i - (i % gridWidth) + pointer[0];
      const py = j - (j % gridWidth) + pointer[1];
      retArr[ite++] = pixels[4 * (px * imageData.width + py)];
      retArr[ite++] = pixels[4 * (px * imageData.width + py) + 1];
      retArr[ite++] = pixels[4 * (px * imageData.width + py) + 2];
      retArr[ite++] = 255;
    }
  }
  return new ImageData(retArr, imageData.width, imageData.height);
}

/**
 * 
/**
 * グリッドの収まる矩形の外側を補完する。
 * @param imageData 大本の画像
 * @param x 矩形の範囲
 * @param y 
 * @param w 
 * @param h 
 * @returns 
 */
function fillGridOutLine(
  imageData: ImageData,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // const pixels = imageData.data;

  const pixels = imageDataToPixelArray(imageData);

  // 上辺, 下辺
  for (let i = 0; i < w; i++) {
    // 上辺は1行上のピクセルを複製する
    const topIndex = y * imageData.width + (x + i);
    pixels[topIndex] = pixels[topIndex - imageData.width];
    // 下辺は1行下のピクセルを複製する
    const bottomIndex = (y + h) * imageData.width + (x + i);
    pixels[bottomIndex] = pixels[bottomIndex + imageData.width];

    // 念のため もう1pxやる(内側)
    const top2Index = (y + 1) * imageData.width + (x + i);
    const bottom2Index = (y - 1 + h) * imageData.width + (x + i);
    pixels[top2Index] = pixels[topIndex - imageData.width];
    pixels[bottom2Index] = pixels[bottomIndex + imageData.width];
  }

  // // 左辺,右辺
  for (let i = 0; i < h; i++) {
    // 左辺は1行前のピクセルを複製する
    const leftIndex = (y + i) * imageData.width + x;
    pixels[leftIndex] = pixels[leftIndex - 1];

    // →辺は1行跡のピクセルを複製する
    const rightIndex = (y + i) * imageData.width + (x + w);
    pixels[rightIndex] = pixels[rightIndex + 1];

    // 念のため もう1pxやる(内側)
    const left2Index = (y + i) * imageData.width + x + 1;
    const right2Index = (y + i) * imageData.width + (x + w - 1);
    pixels[left2Index] = pixels[leftIndex - 1];
    pixels[right2Index] = pixels[rightIndex + 1];
  }
  return pixelArrayToImageData(pixels, imageData.width, imageData.height);
}

// 切り取り範囲 を gridSize で割り切れるサイズにする.そしてその範囲が画像からはみ出さないようにする
export const convertAreasForGridSize = (
  areas: RectArea[],
  width: number,
  height: number,
  blockWidth: number
): RectArea[] => {
  return areas.map((v) => {
    let [cx, cy, cw, ch] = [...v];

    if (cw % blockWidth !== 0) {
      cw = cw + (blockWidth - (cw % blockWidth));
    }
    if (ch % blockWidth !== 0) {
      ch = ch + (blockWidth - (ch % blockWidth));
    }
    if (width < cx + cw) {
      cx = cx - (cx + cw - width);
    }
    if (height < cy + ch) {
      cy = cy - (cy + ch - height);
    }
    return [cx, cy, cw, ch];
  });
};

/**
 * imageDataの areas に option のシャッフルを適用し、その情報を下部に印字したものを返却する
 * @param imageData
 * @param areas
 * @param options
 * @returns
 */
export const encodeImage = (
  imageData: ImageData,
  areas: RectArea[],
  options: Options
) => {
  // 範囲をgirdSizeで割り切れるサイズに補正
  const resizedAreas = convertAreasForGridSize(
    areas,
    imageData.width,
    imageData.height,
    options.gridSize
  );

  // 範囲の個数分エンコードしたImageData作成
  const encodedImageData = resizedAreas.reduce((p, v) => {
    return encodeArea(p, v, options);
  }, imageData);

  // 画面下に追加する色バイトコードのImageData作成
  const data = {
    v: 1,
    w: imageData?.width,
    h: imageData?.height,
    o: {
      k: options.hashKey != null ? 1 : 0,
      r: options.isReplacePosition ? 1 : 0,
      c: options.isChangeColor ? 1 : 0,
      g: options.gridSize,
    },
    c: resizedAreas,
  };

  const colorByteCodeImageData = dataToColorByteCode(
    data,
    imageData.width,
    imageData.width
  );

  // 画像作成
  const [cv, ctx] = createCanvas(
    imageData.width,
    imageData.height + colorByteCodeImageData.height
  );

  ctx.putImageData(encodedImageData, 0, 0);
  ctx.putImageData(colorByteCodeImageData, 0, encodedImageData.height);
  return ctx.getImageData(0, 0, cv.width, cv.height);
};

/**
 * imageData の area の範囲をシャッフルする
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
const encodeArea = (imageData: ImageData, area: RectArea, options: Options) => {
  console.log('start encode Image');
  const [, ctx] = createCanvasFromImage(imageData);
  const [cx, cy, cw, ch] = [...area];

  // 対象範囲を切り取ってピクセル配列を作る
  const beforePixels = imageDataToPixelArray(ctx.getImageData(cx, cy, cw, ch));

  // そのピクセル配列を gridSize でグループ化
  let pixelBlocks = pixelsToGroup(beforePixels, cw, ch, options.gridSize);

  const hash = createHash(options.hashKey ?? 'TEST');

  // グループを並べ替え
  if (options.isReplacePosition) {
    pixelBlocks = sortByHash(pixelBlocks as [], hash);
  }

  // ハッシュ値で色反転
  if (options.isChangeColor) {
    pixelBlocks = negaGroups(pixelBlocks, hash);
  }

  // グループをピクセルに展開
  const encodedPixel = groupToPixels(pixelBlocks, cw, ch, options.gridSize);
  const encodedImageData = pixelArrayToImageData(encodedPixel, cw, ch);

  // 戻画像に張り付け
  const [baseCv, baseCx] = createCanvasFromImage(imageData);
  baseCx.putImageData(encodedImageData, cx, cy);

  return baseCx.getImageData(0, 0, baseCv.width, baseCv.height);
};

/**
 * imageData をデコードする
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
export const decodeImage = (imageData: ImageData) => {
  // 画像下部のカラーバイトコードを読む
  const data = colorByteCodeToData(imageData);

  // 画像をareasの逆順に
  const options: Options = {
    gridSize: (data as any).o.g,
    hashKey: (data as any).o.k,
    isChangeColor: (data as any).o.c,
    isReplacePosition: (data as any).o.r,
  };

  const decodedImageData = (data as any).c
    .reverse()
    .reduce((p: ImageData, c: RectArea) => {
      return decodeArea(p, c, options, (data as any).w, (data as any).h);
    }, imageData);

  return decodedImageData;
};

/**
 * 一範囲をデコードする
 * @param imageData
 * @param area
 * @param options
 * @param width
 * @param height
 * @returns
 */
const decodeArea = (
  imageData: ImageData,
  area: RectArea,
  options: Options,
  width: number,
  height: number
) => {
  // 対象エリア切り抜き

  const [cv, ctx] = createCanvasFromImage(imageData);
  const [originalCv, originalCtx] = createCanvas(area[2], area[3]);

  // 現在のサイズがリサイズ後であると仮定して、その状態で切り抜き範囲算出
  // 切り出した範囲を元のサイズに。グリッドサイズ、グリッド数を整数で扱いたい
  const scale = imageData.width / width;
  const [x, y, w, h] = area.map((v) => v * scale);
  console.log('scale', scale, 1 / scale);
  console.log('resized area', [x, y, w, h]);

  // 切り出した範囲をリサイズして oroginal に貼り付け
  originalCtx.scale(1 / scale, 1 / scale);
  originalCtx.drawImage(
    createCanvasFromImage(ctx.getImageData(x, y, w, h))[0],
    0,
    0
  );

  console.log('original size', originalCv.width, originalCv.height);

  // 該当範囲をグループ分け
  const beforePixels = imageDataToPixelArray(
    originalCtx.getImageData(0, 0, area[2], area[3])
  );
  let pixelBlocks = pixelsToGroup(
    beforePixels,
    area[2],
    area[3],
    options.gridSize
  );

  // ハッシュ作成
  const hash = createHash(options.hashKey ?? 'TEST');

  // ハッシュ値で色反転
  if (options.isChangeColor) {
    pixelBlocks = negaGroups(pixelBlocks, hash);
  }

  // グループを並べ替え
  if (options.isReplacePosition) {
    pixelBlocks = resortByHash(pixelBlocks, hash);
  }

  // グループをピクセルに戻す
  const decodedPixel = groupToPixels(
    pixelBlocks,
    area[2],
    area[3],
    options.gridSize
  );
  const decodedImageData = pixelArrayToImageData(
    decodedPixel,
    area[2],
    area[3]
  );

  // ピクセルをリサイズして貼り付け
  if (width === imageData.width) {
    // 原寸大ならそのまま貼り付け
    ctx.drawImage(createCanvasFromImage(decodedImageData)[0], area[0], area[1]);
  } else {
    // リサイズ画像なら元のサイズにして貼り付け

    // 貼り付け先の境界線をごまかす(ちょっと大きめにとる)
    const ib = fillGridOutLine(
      ctx.getImageData(0, 0, cv.width, cv.height),
      Math.round(area[0] * scale) - 1,
      Math.round(area[1] * scale) - 1,
      Math.round(area[2] * scale) + 2,
      Math.round(area[3] * scale) + 2
    );
    ctx.putImageData(ib, 0, 0);

    ctx.scale(scale, scale);
    // 貼り付け画像内の劣化している箇所をごまかしてから貼り付ける
    //*
    ctx.drawImage(
      createCanvasFromImage(
        fillGridLine(
          decodedImageData,
          options.gridSize,
          Math.ceil(1 / scale) + 1
        )
      )[0],
      area[0],
      area[1]
    );
    /*/
    ctx.drawImage(createCanvasFromImage(decodedImageData)[0], area[0], area[1]);
    //*/
  }

  // const testCV = document.querySelector('#BOARD1');
  // const testCTX = getContext(testCV as any);
  // testCTX.putImageData(
  //   fillGridLine(decodedImageData, options.gridSize, Math.ceil(1 / scale) + 1),
  //   0,
  //   0
  // );
  // const testCV2 = document.querySelector('#BOARD2');
  // const testCTX2 = getContext(testCV2 as any);
  // testCTX2.putImageData(decodedImageData, 0, 0);

  // ctx.putImageData(decodedImageData, area[0], area[1])
  return ctx.getImageData(0, 0, cv.width, cv.height);
};
