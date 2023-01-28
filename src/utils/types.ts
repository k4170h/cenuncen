import {
  DEFAULT_AREA_SELECT_OPTION,
  DEFAULT_DECODE_OPTIONS,
  DEFAULT_ENCODE_OPTIONS,
  DEFAULT_TRIAL_DECODE_OPTIONS,
} from './definition';

// 入力フォームの型
export type EncodeOptions = typeof DEFAULT_ENCODE_OPTIONS;
export type RestoredEncodeOptions = Omit<
  EncodeOptions,
  'key' | 'withKey' | 'pos' | 'fillColor'
>;
export type DecodeOptions = typeof DEFAULT_DECODE_OPTIONS;
export type AreaSelectOptions = typeof DEFAULT_AREA_SELECT_OPTION;
export type TrialDecodeOptions = typeof DEFAULT_TRIAL_DECODE_OPTIONS;

/**
 * 画像のどこを隠すかの情報
 */
export type SelectedAreaInfo = {
  imageData: ImageData;
  selectedAreas: RectArea[];
  gridSize: number;
};

/**
 * 切り出した隠蔽部分を置く場
 */
export type ClipPos = 'top' | 'right' | 'bottom' | 'left';

/**
 * 範囲
 */
export type RectArea = [number, number, number, number];

/**
 * ピクセルの色
 */
export type Pixel = [number, number, number];

/**
 * グループ化したピクセル
 */
export type PixelGroup = Pixel[];

/**
 * ページ種別
 */
export type Page = 'encode' | 'decode';

export type EncodeMode = 'areaSelect' | 'encodeSetting';
