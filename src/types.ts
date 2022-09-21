/**
 * エンコードのオプション
 */
export type Options = {
  // 隠蔽範囲のグリッドサイズ
  gridSize: number;
  // 位置のシャッフル有無
  isReplacePosition: boolean;
  // 色の反転有無
  isChangeColor: boolean;
  // ハッシュキー
  hashKey: string | null;
};

/**
 * 範囲
 */
export type RectArea = [number, number, number, number]

/**
 * ピクセルの色
 */
export type Pixel = [number, number, number]

/**
 * グループ化したピクセル
 */
export type PixelGroup = Pixel[];