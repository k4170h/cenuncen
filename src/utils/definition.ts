/** デフォルトHashキー */
export const DEFAULT_KEY = 'W4kzH9r0';

// 描画するカラーバイトコードのブロックサイズ
// 画像の長辺が MIN_IMAGE_WIDTH px までリサイズされたときに MIN_BLOCK_WIDTH px になる大きさ

/** デコードの品質を保証するサイズ。画像の長辺がこのサイズより小さくなることは無い という前提で組む */
export const MIN_RESIZED_IMAGE_WIDTH = 600;

/** カラーバイトコードの最小サイズ */
export const MIN_COLOR_BYTE_BLOCK_WIDTH = 8;

/** PixelGroupの最小サイズ */
export const MIN_PIXEL_BLOCK_WIDTH = 16;

/** PixelGroupの最小Padding幅 */
export const MIN_PIXEL_GROUP_PADDING = 2;

/** 色反転時についでで行うコントラストの度合。1に近いほどドキツイ */
export const CONTRAST_LEVEL = 4;
