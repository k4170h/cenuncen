/** デフォルトHashキー */
export const DEFAULT_KEY = 'W4kzH9r0';

// 描画するカラーバイトコードのブロックサイズ
// 画像の長辺が MIN_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ

/** デコードの品質を保証するサイズ。画像の長辺がこのサイズより小さくなることは無い という前提で組む */
export const MIN_RESIZED_IMAGE_WIDTH = 1000;

/** カラーバイトコードの最小サイズ */
export const MIN_COLOR_BYTE_BLOCK_WIDTH = 8;

/** PixelGroupの最小サイズ */
export const MIN_PIXEL_BLOCK_WIDTH = 16;

/** PixelGroupの最小Padding幅 */
export const MIN_PIXEL_GROUP_PADDING = 1.5;

/** 色反転時についでで行うコントラストの度合。1に近いほどドキツイ */
export const HIGH_CONTRAST_LEVEL = 3;
// ↑ 0-255 の色が 128 から離れる度合。

/** 色反転時についでで行うコントラストの度合。0 < x < 1 で、0に近いほど灰色になる */
export const LOW_CONTRAST_LEVEL = 0.2;

/** 色の配列 */
export const COLOR_PALETTE = [
  '#9c27b0',
  '#f44336',
  '#3f51b5',
  '#03a9f4',
  '#009688',
  '#8bc34a',
  '#ffeb3b',
  '#ff9800',
  '#e81e63',
  '#673ab7',
  '#2196f3',
  '#00bcd4',
  '#4caf50',
  '#cddc39',
  '#ffc107',
  '#ff5722',
];
