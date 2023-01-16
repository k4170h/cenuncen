import React, { useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import { createCanvasFromImage } from '../../utils/canvasUtils';

type Props = {
  onImageLoaded: (imageData: ImageData) => void;
};

const ImageLoader = ({ onImageLoaded }: Props) => {
  const input = useRef<HTMLInputElement>(null);

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

  const handleClick = useCallback(() => {
    if (input && input.current) {
      input.current.click();
    }
  }, []);

  return (
    <>
      <Button variant="contained" onClick={handleClick}>
        local file
      </Button>
      <input
        type="file"
        accept="image/*"
        onChange={onChangeImage}
        hidden
        ref={input}
      />
    </>
  );
};

export default ImageLoader;
