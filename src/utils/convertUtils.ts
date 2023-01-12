// 画像変換系Util

import {
  createCanvas,
  createCanvasFromImage,
  imageDataToPixels,
  resizeImageData,
} from './canvasUtils';
import { colorByteCodeToData, dataToColorByteCode } from './colorByteCodeUtils';
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
  pixelsToImageData,
  groupsToPixels,
  pixelsToGroups,
  lowContrastGroups,
  restoreLowContrastGroups,
  shiftColorGroups,
  unShiftColorGroups,
} from './pixelGroupUtils';
import {
  DecodeOptions,
  EncodeFormValues,
  EncodeOptions,
  PixelGroup,
  RectArea,
} from './types';

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
  options: EncodeFormValues
) => {
  const gs = options.gridSize;

  // 対象範囲をgirdSizeで割り切れるサイズに補正
  const resizedAreas = areas.map((v) =>
    convertRectAreaForGridSize(v, imageData.width, imageData.height, gs)
  );

  const [, ctx] = createCanvasFromImage(imageData);

  // 対象範囲を切り出し、それを裁断
  const clippedPixelGroups = resizedAreas.reduce((p, c) => {
    return [...p, ...clipImageData(ctx.getImageData(...c), options.gridSize)];
  }, [] as PixelGroup[]);

  // それをシャッフル
  const shuffledPixelGrooups = shufflePixelGrooups(clippedPixelGroups, options);

  // それをImageDataの配列に
  const shuffledImageDatas = shuffledPixelGrooups.map((v) =>
    pixelGroupToImageData(v, options.gridSize)
  );

  // そのデータを並べたImageData作る
  const [xCount, yCount] = (() => {
    switch (options.clipPos) {
      case 'left':
      case 'right': {
        const yCount = Math.floor(imageData.height / gs);
        const xCount = Math.ceil(shuffledImageDatas.length / yCount);
        return [xCount, Math.ceil(shuffledImageDatas.length / xCount)];
      }
      case 'top':
      case 'bottom': {
        const xCount = Math.floor(imageData.width / gs);
        const yCount = Math.ceil(shuffledImageDatas.length / xCount);
        return [Math.ceil(shuffledImageDatas.length / yCount), yCount];
      }
    }
  })();

  const [clippedCv, clippedCx] = createCanvas(xCount * gs, yCount * gs);
  shuffledImageDatas.forEach((v, i) => {
    clippedCx.putImageData(v, (i % xCount) * gs, Math.floor(i / xCount) * gs);
  });

  // 該当エリアを塗りつぶす
  const filledImageData = resizedAreas.reduce((p, c) => {
    return fillArea(p, c, options, '#' + options.backgroundColor);
  }, imageData);

  // 隠蔽対象のエリア一覧(x,y,xグリッド数,yグリッド数)
  const gridAreas = resizedAreas.map(
    (v): RectArea => [v[0], v[1], v[2] / gs, v[3] / gs]
  );

  // 出力画像のキャンバス
  const [resultCv, resultCx] =
    options.clipPos === 'left' || options.clipPos === 'right'
      ? createCanvas(imageData.width + clippedCv.width, imageData.height)
      : createCanvas(imageData.width, imageData.height + clippedCv.height);

  // 本画像
  const mainPosX = options.clipPos === 'left' ? clippedCv.width : 0;
  const mainPosY = options.clipPos === 'top' ? clippedCv.height : 0;

  // 画面下に追加する色バイトコードのImageData作成
  const clippedPosX = options.clipPos === 'right' ? imageData.width : 0;
  const clippedPosY = options.clipPos === 'bottom' ? imageData.height : 0;
  const colorByteCodeImageData = dataToColorByteCode(
    options,
    gridAreas,
    [clippedPosX, clippedPosY, clippedCv.width / gs, clippedCv.height / gs],
    [mainPosX, mainPosY, imageData.width, imageData.height],
    [resultCv.width, resultCv.height]
  );

  // アプトプットの作成
  resultCv.height += colorByteCodeImageData.height;
  resultCx.fillStyle = '#' + options.backgroundColor;
  resultCx.fillRect(0, 0, resultCv.width, resultCv.height);
  const [filledCv] = createCanvasFromImage(filledImageData);
  const [codeCv] = createCanvasFromImage(colorByteCodeImageData);
  resultCx.drawImage(filledCv, mainPosX, mainPosY);
  resultCx.drawImage(clippedCv, clippedPosX, clippedPosY);
  resultCx.drawImage(codeCv, 0, resultCv.height - codeCv.height);
  return resultCx.getImageData(0, 0, resultCv.width, resultCv.height);
};

/**
 * imageDataを grid pxで裁断し、PixelGroupの配列を返す
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
const clipImageData = (
  imageData: ImageData,
  gridSize: number
): PixelGroup[] => {
  // ピクセルの配列に変換する
  const beforePixels = imageDataToPixels(imageData);

  // そのピクセル配列を gridSize でグループ化
  const cw = imageData.width;
  const ch = imageData.height;
  return pixelsToGroups(beforePixels, cw, ch, gridSize);
};

/**
 * PixelGroup[]に裁断された画像を、シャッフル、加工
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
const shufflePixelGrooups = (
  pixelGroups: PixelGroup[],
  options: EncodeOptions
): PixelGroup[] => {
  // ハッシュ
  const hash = createHash(options.hashKey ?? DEFAULT_KEY);

  let result = pixelGroups.map((v) => [...v]);

  // グループを並べ替え
  if (!options.noSwap) {
    result = sortByHash(result as [], hash);
  }

  // ハッシュで回転(90度ずつ),反転
  if (!options.noRotate) {
    result = rotateGroups(result, hash);
    result = flipGroups(result, hash);
  }

  // ハッシュ値で色反転
  if (!options.noNega) {
    result = negaGroups(result, hash);
  }

  // 色シフト ()
  if (options.shiftColor) {
    result = lowContrastGroups(result, options.shiftColor.contrast);
    result = shiftColorGroups(
      result,
      options.shiftColor.contrast,
      options.shiftColor.color
    );
  }
  return result;
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
    cx = cx - (blockWidth - (cw % blockWidth)) / 2;
    cw = cw + (blockWidth - (cw % blockWidth));
  }
  if (ch % blockWidth !== 0) {
    cy = cy - (blockWidth - (ch % blockWidth)) / 2;
    ch = ch + (blockWidth - (ch % blockWidth));
  }
  if (cx < 0) {
    cx = cx = 0;
  }
  if (width < cx + cw) {
    cx = cx - (cx + cw - width);
  }
  if (cy < 0) {
    cy = 0;
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
  options: EncodeOptions,
  colorCode: string
) => {
  const [cv, cx] = createCanvasFromImage(imageData);

  const padding = getGridPadding(imageData.width, imageData.height);
  const gs = options.gridSize;

  // グリッド内のPaddingより内側だけを塗りつぶす
  cx.fillStyle = colorCode;
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
 * 画像を塗りつぶすときの各グリッドの外側のパディング
 * @param w
 * @param h
 * @returns
 */
export const getGridPadding = (w: number, h: number) => {
  // 画像の長辺が MIN_RESIZED_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ
  const longStroke = w < h ? h : w;
  const padding = Math.ceil(
    (MIN_PIXEL_GROUP_PADDING * longStroke) / MIN_RESIZED_IMAGE_WIDTH
  );
  return padding > MIN_PIXEL_GROUP_PADDING ? padding : MIN_PIXEL_GROUP_PADDING;
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
    filledAreas,
    size,
    clippedArea,
    mainArea,
  } = colorByteCodeToData(imageData);

  const gs = options.gridSize;

  const isFullsize = imageData.width === size[0];

  // リサイズ前の画像
  const orgImageData = isFullsize
    ? imageData
    : resizeImageData(imageData, size[0], size[1]);
  const [, orgCx] = createCanvasFromImage(orgImageData);

  const scaleX = imageData.width / size[0];
  const scaleY = imageData.height / size[1];

  // 切り出していた隠蔽部分をPixelに
  const clippedPixels = imageDataToPixels(
    orgCx.getImageData(
      clippedArea[0],
      clippedArea[1],
      clippedArea[2] * gs,
      clippedArea[3] * gs
    )
  );

  // Pixels を PixelGroups に
  const clippedPixelGroups = pixelsToGroups(
    clippedPixels,
    clippedArea[2] * gs,
    clippedArea[3] * gs,
    gs
  );

  if (formOptions?.hashKey) {
    options.hashKey = formOptions.hashKey;
  }

  // 末端あたりのゴミデータのぞく
  const filterdPixelGroups = clippedPixelGroups.splice(
    0,
    filledAreas.reduce((p, c) => {
      return p + c[2] * c[3];
    }, 0)
  );

  // シャッフルされていたやつを戻す
  const unShuffledPixelGroups = unShufflePixelGroup(
    filterdPixelGroups,
    options
  );

  filledAreas.forEach((v) => {
    const len = v[2] * v[3];
    // 対象のPixelGroupを切り出し
    const targetPixelGroups = unShuffledPixelGroups.splice(0, len);

    // PixelGroupをPixel → ImageDataへ
    const pixels = groupsToPixels(targetPixelGroups, v[2] * gs, v[3] * gs, gs);
    const imageData = pixelsToImageData(pixels, v[2] * gs, v[3] * gs);

    const resizedImageData = resizeImageData(
      imageData,
      imageData.width * scaleX,
      imageData.height * scaleY
    );

    // 1ブロックずつ移す
    const [, rcx] = createCanvasFromImage(resizedImageData);
    const sgsX = options.gridSize * scaleX;
    const sgsY = options.gridSize * scaleY;
    const p = 1;
    for (let i = 0; i < v[3]; i++) {
      for (let j = 0; j < v[2]; j++) {
        cx.putImageData(
          rcx.getImageData(
            Math.round(j * sgsX + p * 1),
            Math.round(i * sgsY + p * 1),
            Math.round(sgsX - p * 2),
            Math.round(sgsY - p * 2)
          ),
          Math.round(v[0] * scaleX + j * sgsX + p * 1 + mainArea[0] * scaleX),
          Math.round(v[1] * scaleY + i * sgsY + p * 1 + mainArea[1] * scaleY)
        );
      }
    }

    // グリッド境目の劣化を考えず、Paddingを無視して移す場合はこちら
    // cx.putImageData(resizedImageData, v[0] * scale, v[1] * scale);
  });

  if (formOptions && formOptions.crop) {
    if (isFullsize) {
      return cx.getImageData(
        mainArea[0],
        mainArea[1],
        mainArea[2],
        mainArea[3]
      );
    } else {
      return cx.getImageData(
        mainArea[0] * scaleX,
        mainArea[1] * scaleY,
        mainArea[2] * scaleX,
        mainArea[3] * scaleY
      );
    }
  }

  return cx.getImageData(0, 0, cv.width, cv.height);
};

/**
 * 加工、シャッフルされていたimageDataの配列をimageDataに戻す
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
const unShufflePixelGroup = (
  pixelGroups: PixelGroup[],
  options: EncodeOptions
): PixelGroup[] => {
  let result = pixelGroups.map((v) => [...v]);

  // ハッシュ作成
  const hash = createHash(options.hashKey ?? DEFAULT_KEY);

  // 色シフト
  if (options.shiftColor) {
    result = unShiftColorGroups(
      result,
      options.shiftColor.contrast,
      options.shiftColor.color
    );
    result = restoreLowContrastGroups(result, options.shiftColor.contrast);
  }

  // ハッシュ値で色反転
  if (!options.noNega) {
    result = negaGroups(result, hash);
  }

  // ハッシュで回転(90度ずつ),反転
  if (!options.noRotate) {
    result = flipGroups(result, hash);
    result = rerotateGroups(result, hash);
  }

  // グループを並べ替え
  if (!options.noSwap) {
    result = resortByHash(result, hash);
  }

  return result;
};
