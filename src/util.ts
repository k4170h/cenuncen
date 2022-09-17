import { Area, Options } from './encoder';
import jsSHA from 'jssha';

export const getContext = (cv: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = cv.getContext('2d');
  if (ctx == null) {
    throw new Error();
  }
  return ctx;
};

// サイズを指定して canvas とその context を返す
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

// ImageData か CanvasElement から canvas とその context を返す
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isImage = (image: any): image is HTMLImageElement => {
  return image.src != null;
};

// 1ピクセルの情報(r,g,b)
type Pixel = [number, number, number];

/**
 * ImageDataから [ピクセル数]*Pixel の2次元配列を作る
 */
function imageDataToPixelArray(imageData: ImageData): Pixel[] {
  const pixels = imageData.data;
  return new Array(pixels.length / 4).fill(null).map((_, i) => {
    return [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
  });
}

/**
 * Pixel配列からImageDataを作る
 */
function pixelArrayToImageData(
  pixels: Pixel[],
  w: number,
  h: number
): ImageData {
  const retPixels = new Uint8ClampedArray(w * h * 4);
  pixels.forEach((v, i) => {
    retPixels[i * 4] = v[0];
    retPixels[i * 4 + 1] = v[1];
    retPixels[i * 4 + 2] = v[2];
    retPixels[i * 4 + 3] = 255;
  });
  return new ImageData(retPixels, w, h);
}

// ピクセルをs四方でグループ化。w,h は s で割り切れないとダメ
type PixelGroup = Pixel[];
function pixelsToGroup(
  pixels: Pixel[],
  w: number,
  h: number,
  gridWidth: number
): PixelGroup[] {
  const groups = new Array((w * h) / (gridWidth * gridWidth));
  // そのピクセル配列を s*s でグループ化
  for (let i = 0; i < h; i += gridWidth) {
    for (let j = 0; j < w; j += gridWidth) {
      const pixelGroup = new Array(gridWidth * gridWidth);
      for (let k = 0; k < gridWidth; k++) {
        for (let l = 0; l < gridWidth; l++) {
          pixelGroup[k * gridWidth + l] = pixels[i * w + k * w + j + l];
        }
      }
      groups[(i / gridWidth) * (w / gridWidth) + j / gridWidth] = pixelGroup;
    }
  }
  return groups;
}

// s四方でグループ化していたピクセルを戻す。w,h は s で割り切れないとダメ
function groupToPixels(
  groups: PixelGroup[],
  w: number,
  h: number,
  gridWidth: number
): Pixel[] {
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
}

// 引数からHashを作る
function createHash(key: string) {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(key);
  return shaObj.getHash('HEX');
}

// Hashを数値の配列にする
function generateNumArrByHash(hash: string, range = 16): number[] {
  const matched = hash.match(/.{1}/g);
  if (matched == null) {
    throw new Error();
  }
  return matched.map((v) => {
    return parseInt(v, 16) * Math.ceil(range / 16);
  });
}

// Hashをもとに配列を混ぜる
function sortByHash(arr: PixelGroup[], hash: string) {
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
}

// Hashをもとに混ざっていた配列を戻す
function resortByHash(arr: PixelGroup[], hash: string) {
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
}

/**
 * PixelGroup の色を hash によって ネガ反転
 * @param groups
 * @param hash
 * @returns
 */
function negaGroups(groups: PixelGroup[], hash: string) {
  const hashNums = generateNumArrByHash(hash);
  const ret = new Array(groups.length);
  for (let i = 0; i < groups.length; i++) {
    const h = (hashNums[i % hashNums.length] % 7) + 1;
    ret[i] = negaGroup(groups[i], [h & 1, h & 2, h & 4]);
  }
  return ret;
}
function negaGroup(group: PixelGroup, pattern = [1, 1, 1]) {
  return group.map((pixel) => {
    return negaPixel(pixel, pattern);
  });
}
function negaPixel(pixel: Pixel, pattern = [1, 1, 1]) {
  return [
    pattern[0] ? 255 - pixel[0] : pixel[0],
    pattern[1] ? 255 - pixel[1] : pixel[1],
    pattern[2] ? 255 - pixel[2] : pixel[2],
  ];
}

// 文字列から8進数
function strToOct(text: string) {
  return text.match(/.{1}/g)!.reduce((p, c) => {
    return p + ('0' + c.charCodeAt(0).toString(8)).slice(-3);
  }, '');
}

// 8進数から文字列
function octTotext(text: string) {
  return text.match(/.{3}/g)!.reduce((p, c) => {
    return p + String.fromCharCode(parseInt(c, 8));
  }, '');
}
// 色から8進数を作る
function pixelToOct(pixel: Pixel) {
  return (
    (pixel[0] > 200 ? 4 : 0) +
    (pixel[1] > 200 ? 2 : 0) +
    (pixel[2] > 200 ? 1 : 0)
  );
}

// 8進数から色を作る
function octToPixel(oct: string): Pixel {
  const col = ('000' + parseInt(oct, 8).toString(2)).slice(-3);
  return [
    parseInt(col[0]) * 255,
    parseInt(col[1]) * 255,
    parseInt(col[2]) * 255,
  ];
}

// 色の黒さを%で返す
function pixelBlackness(pixel: Pixel) {
  return 1 - (pixel[0] + pixel[1] + pixel[2]) / 3 / 255;
}

// 8進数の文字列から、1ブロックが任意のサイズのImageDataを作る。
// また、最下段にはリサイズ前サイズ算出用の情報を描く
function octToImageData(text: string, w: number, gridSize: number) {
  // 縦横のブロック数
  const gridW = Math.floor(w / gridSize);
  const gridH = Math.ceil(text.length / gridW);

  // ImageData生成
  const [cv, ctx] = createCanvas(w, gridH * gridSize);
  ctx.fillStyle = `rgb(255,255,255)`;
  ctx.fillRect(0, 0, w, cv.height);

  for (let i = 0; i < gridH; i++) {
    for (let j = 0; j < gridW; j++) {
      // コードを描き切ったら中断
      if (text.length <= i * gridW + j) {
        break;
      }
      const p = octToPixel(text[i * gridW + j]);
      ctx.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;
      // +1 しているのはグリッド間の1px未満の空白を消すため
      ctx.fillRect(j * gridSize, i * gridSize, gridSize + 1, gridSize + 1);
    }
  }
  return ctx.getImageData(0, 0, w, cv.height);
}

/**
 *
 * @param w
 * @param h
 * @param blockSize
 * @returns
 */
function createScaleCode(w: number, h: number, gridSize: number) {
  // ImageData生成
  const [cv, ctx] = createCanvas(w, gridSize);
  ctx.fillStyle = `rgb(255,255,255)`;
  ctx.fillRect(0, 0, w, cv.height);

  // 黒線作成
  ctx.fillStyle = `rgb(0,0,0)`;
  ctx.fillRect(w - 200, cv.height - gridSize, 200, gridSize);

  // w,h の数値から10文字の8進数
  const wCode = ('0000' + w.toString(8)).slice(-5);
  const hCode = ('0000' + h.toString(8)).slice(-5);
  ctx.putImageData(
    octToImageData(wCode + hCode, 10 * gridSize, gridSize),
    0,
    0
  );
  return ctx.getImageData(0, 0, w, gridSize);
}

/**
 * imageData の area の範囲をシャッフルする
 * @param imageData
 * @param area
 * @param options
 * @returns
 */
export const encodeImage = (
  imageData: ImageData,
  area: Area,
  options: Options
) => {
  console.log('start encode Image');
  const [, ctx] = createCanvasFromImage(imageData);

  // 切り取り範囲 を gridSize で割り切れるサイズにする
  const [cx, cy, cw, ch] = (() => {
    let [cx, cy, cw, ch] = [...area];

    if (cw % options.gridSize !== 0) {
      cw = cw + (options.gridSize - (cw % options.gridSize));
    }
    if (ch % options.gridSize !== 0) {
      ch = ch + (options.gridSize - (ch % options.gridSize));
    }
    if (imageData.width < cx + cw) {
      cx = cx - (cx + cw - imageData.width);
    }
    if (imageData.height < cy + ch) {
      cy = cy - (cy + ch - imageData.height);
    }

    return [cx, cy, cw, ch];
  })();
  console.log(1);
  // 対象範囲を切り取ってピクセル配列を作る
  const beforePixels = imageDataToPixelArray(ctx.getImageData(cx, cy, cw, ch));

  console.log(2);
  // そのピクセル配列を gridSize でグループ化
  let pixelGroups = pixelsToGroup(beforePixels, cw, ch, options.gridSize);

  const hash = createHash(options.hashKey ?? 'TEST');

  console.log(3);
  // グループを並べ替え
  if (options.isReplacePosition) {
    pixelGroups = sortByHash(pixelGroups as [], hash);
  }

  console.log(4);
  // ハッシュ値で色反転
  if (options.isChangeColor) {
    pixelGroups = negaGroups(pixelGroups, hash);
  }

  console.log(5);
  // グループをピクセルに展開
  const encodedPixel = groupToPixels(pixelGroups, cw, ch, options.gridSize);
  const encodedImageData = pixelArrayToImageData(encodedPixel, cw, ch);

  console.log(6);
  // 戻画像に張り付け
  const [baseCv, baseCx] = createCanvasFromImage(imageData);
  baseCx.putImageData(encodedImageData, cx, cy);

  return baseCx.getImageData(0, 0, baseCv.width, baseCv.height);
};

/**
 * 色コードを作って返す
 */
export const createColorCode = (
  imageArea: Area,
  areas: Area[],
  options: Options
) => {
  // 1ピクセルの大きさ(最小4)
  const MIN = 4;
  const longSide = imageArea[2] > imageArea[3] ? imageArea[2] : imageArea[3];
  const gridSize = longSide / 100 > MIN ? Math.round(longSide / 100) : MIN;

  // コードのImageData
  const data = JSON.stringify({
    v: 1,
    o: {
      k: options.hashKey != null ? 1 : 0,
      r: options.isReplacePosition ? 1 : 0,
      c: options.isChangeColor ? 1 : 0,
      g: options.gridSize,
    },
    c: areas,
  });

  console.log('crate code color', data);
  const codeImageData = octToImageData(
    strToOct('\\' + data + '\\'),
    imageArea[2],
    gridSize
  );
  console.log('crated code color', codeImageData);

  console.log(
    'create scale',
    imageArea[2],
    imageArea[3] + codeImageData.height + gridSize,
    gridSize
  );

  // 画面サイズを示すImageData
  const scaleImageData = createScaleCode(
    imageArea[2],
    imageArea[3] + codeImageData.height + gridSize,
    gridSize
  );
  console.log('created scale', scaleImageData);

  // 戻り値のImageData
  const [retCv, retCtx] = createCanvas(
    imageArea[2],
    codeImageData.height + scaleImageData.height
  );
  retCtx.putImageData(codeImageData, 0, 0);
  retCtx.putImageData(scaleImageData, 0, codeImageData.height);
  return retCtx.getImageData(0, 0, retCv.width, retCv.height);
};
