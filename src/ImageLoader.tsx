import React from 'react';
import { createCanvasFromImage } from './utils';

type Props = {
  onImageLoaded: (imageData: ImageData) => void;
};

const ImageLoader = ({ onImageLoaded }: Props) => {
  // 画像選択時
  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 画像のロード
    const reader = new FileReader();
    if (e?.target?.files?.[0] == null) {
      return;
    }
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
      // データ読み込みが終わったら
      const image = new Image();
      image.src = reader.result as string;
      // 画像への読み込みが終わったら
      image.onload = () => {
        const [cv, cx] = createCanvasFromImage(image);
        onImageLoaded(cx.getImageData(0, 0, cv.width, cv.height));
      };
    };
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onChangeImage} />
    </div>
  );
};

export default ImageLoader;
