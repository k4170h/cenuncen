/**
 * エンコードのオプション
 */
export type EncodeOptions = {
  // 隠蔽範囲のグリッドサイズ
  gridSize: number;
  // 位置のシャッフル有無
  isSwap?: boolean;
  // 回転の有無
  isRotate?: boolean;
  // 色の反転有無
  isNega?: boolean;
  // ハッシュキー
  hashKey?: string;
  // 色をコントラストを下げてシフトする
  shiftColor?: {
    // コントラストの度合。0 < x < 1 で、0に近いほど灰色になる
    contrast: number;
    // 0-7
    color: number;
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
  // 鍵が必要か
  hashKey?: string;
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
