import { ClipPos } from './types';

/** デフォルトHashキー */
export const DEFAULT_KEY = 'W4kzH9r0';

// 描画するカラーバイトコードのブロックサイズ
// 画像の長辺が MIN_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ

/** デコードの品質を保証するサイズ。画像の長辺がこのサイズより小さくなることは無い という前提で組む */
export const MIN_RESIZED_IMAGE_WIDTH = 800;

/** カラーバイトコードの最小サイズ */
export const MIN_COLOR_BYTE_BLOCK_WIDTH = 8;

/** カラーバイトコードの色味 */
export const COLOR_BYTE_BLOCK_SHIFT_COLOR = '000';

/** カラーバイトコードのコントラスト */
export const COLOR_BYTE_BLOCK_CONTRAST = 0.5;

/** PixelGroupの最小サイズ */
export const MIN_PIXEL_BLOCK_WIDTH = 16;

/** PixelGroupの最小Padding幅 */
export const MIN_PIXEL_GROUP_PADDING = 3;

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

export const DEFAULT_ENCODE_OPTIONS = {
  doSwap: true,
  doRotate: true,
  doNega: true,
  doColorShift: false,
  contrastLevel: 0.9,
  shiftColor: '888888',
  withKey: false,
  key: '',
  pos: 'bottom' as ClipPos,
  fillColor: '000000',
};
export type EncodeOptions = typeof DEFAULT_ENCODE_OPTIONS;
export type RestoredEncodeOptions = Omit<
  EncodeOptions,
  'withKey' | 'pos' | 'fillColor'
>;

export const DEFAULT_DECODE_OPTIONS = {
  doCrop: true,
  padding: 2,
  offsetX: 0,
  offsetY: 0,
  key: '',
};
export type DecodeOptions = typeof DEFAULT_DECODE_OPTIONS;

export const DEFAULT_AREA_SELECT_OPTION = {
  zoom: 'ff0000',
  gridSize: 8,
  spacing: 2,
  withColor: true,
};
export type AreaSelectOptions = typeof DEFAULT_AREA_SELECT_OPTION;

export const DEFAULT_TRIAL_DECODE_OPTIONS = {
  isJPG: true,
  scale: 100,
};
export type TrialDecodeOptions = typeof DEFAULT_TRIAL_DECODE_OPTIONS;
