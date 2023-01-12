/**
 * エンコードのオプション
 */
export type EncodeOptions = {
  // 隠蔽範囲のグリッドサイズ
  gridSize: number;
  // 位置のシャッフル有無
  noSwap?: boolean;
  // 回転の有無
  noRotate?: boolean;
  // 色の反転有無
  noNega?: boolean;
  // ハッシュキー
  hashKey?: string;
  // 色をコントラストを下げてシフトする
  shiftColor?: {
    // コントラストの度合。0 < x < 1 で、0に近いほど灰色になる
    contrast: number;
    // 0-7
    color: string;
  };
};

/**
 * エンコードのオプション
 */
export type EncodeFormValues = EncodeOptions & {
  clipPos: ClipPos;
  backgroundColor: string;
};

export type DecodeOptions = {
  // 鍵
  hashKey?: string;
  // 切り抜くか
  crop: boolean;
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
