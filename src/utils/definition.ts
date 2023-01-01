/** デフォルトHashキー */
export const DEFAULT_KEY = '74k4H1r0';

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
