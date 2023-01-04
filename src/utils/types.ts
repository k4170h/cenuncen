/**
 * エンコードのオプション
 */
export type EncodeOptions = {
  // 隠蔽範囲のグリッドサイズ
  gridSize: number;
  // 位置のシャッフル有無
  isSwap: boolean;
  // 回転の有無
  isRotate: boolean;
  // 色の反転有無
  isNega: boolean;
  // ハッシュキー
  hashKey: string | null;
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
