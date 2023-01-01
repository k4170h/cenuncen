// 画像変換系Util

import {
  createCanvas,
  createCanvasFromImage,
  groupingPixels,
  imageDataToPixels,
  resizeImageData,
} from './canvasUtils';
import {
  colorByteCodeToData,
  dataToColorByteCode,
  toData,
} from './colorByteCodeUtils';
import {
  DEFAULT_KEY,
  MIN_PIXEL_GROUP_PADDING,
  MIN_RESIZED_IMAGE_WIDTH,
} from './definition';
import { createHash, resortByHash, sortByHash } from './mathUtils';
import {
  flipGroups,
  negaGroups,
  rerotateGroups,
  rotateGroups,
  pixelGroupToImageData,
  groupToPixels,
  pixelsToImageData,
} from './pixelGroupUtils';
import { DecodeOptions, EncodeOptions, RectArea } from './types';

/**
 * imageDataの areas に option のシャッフルを適用し、その情報を下部に印字したものを返却する
 * @param imageData
 * @param areas
 * @param options
 * @returns
 */
export const encodeImageData = (
  imageData: ImageData,
  areas: RectArea[],
  options: EncodeOptions
) => {
  const gs = options.gridSize;

  // 対象範囲をgirdSizeで割り切れるサイズに補正
  const resizedAreas = areas.map((v) =>
    convertRectAreaForGridSize(v, imageData.width, imageData.height, gs)
  );

  const [, ctx] = createCanvasFromImage(imageData);

  // 対象範囲を切り出し、それを裁断、シャッフル
  const shuffledImageDatas = resizedAreas
    .map((v) => {
      const resizedArea = convertRectAreaForGridSize(
        v,
        imageData.width,
        imageData.height,
        gs
      );
      return shuffleImageData(ctx.getImageData(...resizedArea), options);
    })
    .flat();

  // そのデータを並べたImageData作る
  const xCount = Math.floor(imageData.width / gs);
  const yCount = Math.ceil(shuffledImageDatas.length / xCount);
  const [shuffledCv, shuffledCx] = createCanvas(
    xCount * gs + (imageData.width % gs),
    yCount * gs
  );
  shuffledImageDatas.forEach((v, i) => {
    // shuffledCx.putImageData(v, (i % xCount) * gs, Math.floor(i / xCount) * gs);
    shuffledCx.putImageData(
      v,
      shuffledCv.width - gs - (i % xCount) * gs,
      Math.floor(i / xCount) * gs
    );
  });

  // 該当エリアを塗りつぶす
  const filledImageData = resizedAreas.reduce((p, c) => {
    return fillArea(p, c, options);
  }, imageData);

  // 画面下に追加する色バイトコードのImageData作成
  const data = toData(options, resizedAreas, [
    imageData.width,
    imageData.height,
    imageData.height + shuffledCv.height + 8, // 暫定値
  ]);
  const colorByteCodeImageData = dataToColorByteCode(
    data,
    imageData.width,
    imageData.height
  );

  // 最終縦幅
  const height =
    filledImageData.height + shuffledCv.height + colorByteCodeImageData.height;
  // 画面下に追加する色バイトコードのImageData作成
  const data2 = toData(options, resizedAreas, [
    imageData.width,
    imageData.height,
    height, // 最終決定値
  ]);
  const colorByteCodeImageData2 = dataToColorByteCode(
    data2,
    imageData.width,
    imageData.height
  );

  const [resultCv, resultCx] = createCanvas(imageData.width, height);

  resultCx.fillStyle = 'rgb(0,0,0)';
  resultCx.fillRect(0, 0, resultCv.width, resultCv.height);
  resultCx.drawImage(createCanvasFromImage(filledImageData)[0], 0, 0);
  resultCx.drawImage(shuffledCv, 0, imageData.height);
  resultCx.drawImage(
    createCanvasFromImage(colorByteCodeImageData2)[0],
    0,
    imageData.height + shuffledCv.height
  );

  return resultCx.getImageData(0, 0, resultCv.width, resultCv.height);
};

/**
 * imageDataを grid pxで裁断し、シャッフル、加工したimageDataの配列を返す
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
const shuffleImageData = (
  imageData: ImageData,
  options: EncodeOptions
): ImageData[] => {
  // ピクセルの配列を作る
  const beforePixels = imageDataToPixels(imageData);

  // そのピクセル配列を gridSize でグループ化
  const cw = imageData.width;
  const ch = imageData.height;
  let pixelBlocks = groupingPixels(beforePixels, cw, ch, options.gridSize);

  // ハッシュ
  const hash = createHash(options.hashKey ?? DEFAULT_KEY);

  // グループを並べ替え
  if (options.isSwap) {
    pixelBlocks = sortByHash(pixelBlocks as [], hash);
  }

  // ハッシュで回転(90度ずつ),反転
  if (options.isRotate) {
    pixelBlocks = rotateGroups(pixelBlocks, hash);
    pixelBlocks = flipGroups(pixelBlocks, hash);
  }

  // ハッシュ値で色反転
  if (options.isNega) {
    pixelBlocks = negaGroups(pixelBlocks, hash);
  }

  return pixelBlocks.map((v) => pixelGroupToImageData(v, options.gridSize));
};

// 切り取り範囲 を gridSize で割り切れるサイズにする.そしてその範囲が画像からはみ出さないようにする
export const convertRectAreaForGridSize = (
  area: RectArea,
  width: number,
  height: number,
  blockWidth: number
): RectArea => {
  let [cx, cy, cw, ch] = [...area];
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
};

/**
 * 該当エリアを塗りつぶす。ただしグリッドの境目は除く。
 * @param imageData
 * @param area
 */
const fillArea = (
  imageData: ImageData,
  area: RectArea,
  options: EncodeOptions
) => {
  const [cv, cx] = createCanvasFromImage(imageData);

  // パディング
  // 画像の長辺が MIN_RESIZED_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ
  const longStroke =
    imageData.width < imageData.height ? imageData.height : imageData.width;
  const padding = Math.ceil(
    (MIN_PIXEL_GROUP_PADDING * longStroke) / MIN_RESIZED_IMAGE_WIDTH
  );
  console.log('padding', padding);
  const gs = options.gridSize;

  // グリッド内のPaddingより内側だけを塗りつぶす
  // cx.fillStyle = 'rgb(255,0,0)';
  // cx.fillRect(area[0], area[1], area[2], area[3]);
  cx.fillStyle = 'rgb(0,0,0)';
  for (let i = 0; i < area[3]; i += gs) {
    for (let j = 0; j < area[2]; j += gs) {
      cx.fillRect(
        area[0] + j + padding,
        area[1] + i + padding,
        gs - padding * 2,
        gs - padding * 2
      );
    }
  }
  return cx.getImageData(0, 0, cv.width, cv.height);
};

/**
 * imageDataの areas に option のシャッフルを適用し、その情報を下部に印字したものを返却する
 * @param imageData
 * @param options
 * @returns
 */
export const decodeImageData = (
  imageData: ImageData,
  formOptions?: DecodeOptions
) => {
  const [cv, cx] = createCanvasFromImage(imageData);

  // 画像のカラーバイトコードを読む
  const {
    encodeOptions: options,
    areas,
    size,
  } = colorByteCodeToData(imageData);
  const isFullsize = imageData.width === size[0];

  // リサイズ前の画像
  const orgImageData = isFullsize
    ? imageData
    : resizeImageData(imageData, size[0], size[2]);
  const [, orgCx] = createCanvasFromImage(orgImageData);

  const scaleX = imageData.width / size[0];
  const scaleY = imageData.height / size[2];

  // ブロック単位で切り出し
  const blockImageDatas = getPixelBlocks(
    orgCx.getImageData(0, size[1], size[0], orgImageData.height - size[1]),
    options.gridSize,
    areas
  );

  if (formOptions?.hashKey) {
    options.hashKey = formOptions.hashKey;
  }

  areas.forEach((v) => {
    const len = (v[2] / options.gridSize) * (v[3] / options.gridSize);
    const targetBlockImages = blockImageDatas.splice(0, len);

    // シャッフルされていたやつを戻す
    const imageData = unShuffleImageData(targetBlockImages, options, v);

    const resizedImageData = resizeImageData(
      imageData,
      imageData.width * scaleX,
      imageData.height * scaleY
    );

    // 1ブロックずつ移す
    const [, rcx] = createCanvasFromImage(resizedImageData);
    const sgsX = options.gridSize * scaleX;
    const sgsY = options.gridSize * scaleX;
    const p = 1;
    for (let i = 0; i < v[3] / options.gridSize; i++) {
      for (let j = 0; j < v[2] / options.gridSize; j++) {
        cx.putImageData(
          rcx.getImageData(
            Math.round(j * sgsX + p * 1),
            Math.round(i * sgsY + p * 1),
            Math.round(sgsX - p * 2),
            Math.round(sgsY - p * 2)
          ),
          Math.round(v[0] * scaleX + j * sgsX + p * 1),
          Math.round(v[1] * scaleY + i * sgsY + p * 1)
        );
      }
    }
    // cx.putImageData(resizedImageData, v[0] * scale, v[1] * scale);
  });

  return cx.getImageData(0, 0, cv.width, cv.height);
};

/**
 * 画像から裁断したやつを切り出しImageData[]に整理する
 * @param imageData オリジナルサイズ
 * @param areas
 */
const getPixelBlocks = (
  imageData: ImageData,
  gridSize: number,
  areas: RectArea[]
) => {
  const [, cx] = createCanvasFromImage(imageData);
  const result: ImageData[] = [];

  // ブロックが収まっている横幅
  const w = imageData.width - (imageData.width % gridSize);

  const length = areas.reduce((p, c) => {
    return p + (c[2] / gridSize) * (c[3] / gridSize);
  }, 0);

  for (let i = 0; i < length; i++) {
    // const x = (i * gridSize) % w;
    const x = imageData.width - gridSize - ((i * gridSize) % w);
    const y = Math.floor((i * gridSize) / w) * gridSize;
    result.push(cx.getImageData(x, y, gridSize, gridSize));
  }

  return result;
};

/**
 * 加工、シャッフルされていたimageDataの配列をimageDataに戻す
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
const unShuffleImageData = (
  imageDatas: ImageData[],
  options: EncodeOptions,
  area: RectArea
): ImageData => {
  let pixelBlocks = imageDatas.map((v) => {
    return imageDataToPixels(v);
  });

  // ハッシュ作成
  const hash = createHash(options.hashKey ?? DEFAULT_KEY);

  // ハッシュ値で色反転
  if (options.isNega) {
    pixelBlocks = negaGroups(pixelBlocks, hash);
  }

  // ハッシュで回転(90度ずつ),反転
  if (options.isRotate) {
    pixelBlocks = flipGroups(pixelBlocks, hash);
    pixelBlocks = rerotateGroups(pixelBlocks, hash);
  }

  // グループを並べ替え
  if (options.isSwap) {
    pixelBlocks = resortByHash(pixelBlocks, hash);
  }

  // グループをピクセルに戻す
  const decodedPixels = groupToPixels(
    pixelBlocks,
    area[2],
    area[3],
    options.gridSize
  );

  // ピクセルをイメージデータに
  const imageData = pixelsToImageData(decodedPixels, area[2], area[3]);

  return imageData;
};
