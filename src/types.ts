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

export type DecodeOptions = {
  // 補正するか
  isJuggle: boolean;
  // 鍵が必要か
  hashKey: string | null;
};

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
