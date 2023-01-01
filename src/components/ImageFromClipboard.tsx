import React, { useCallback, useState } from 'react';
import ImageLoader from './ImageLoader';
import SavableCanvas from './SavableCanvas';
import { DecodeOptions } from '../utils/types';
import { Button } from '@mui/material';
import { createCanvasFromImage } from '../utils/canvasUtils';

type Props = {
  onImageLoaded: (imageData: ImageData) => void;
};

const ImageFromClipboard = ({ onImageLoaded }: Props) => {
  // クリップボードから画像を開く
  const loadFromClipboard = useCallback(() => {
    const clipboard = navigator.clipboard.read();
    clipboard.then(([item]) => {
      try {
        // const item = v[0];
        if (!item.types.includes('image/png')) {
          throw new Error('invalid clipboard.');
        }
        item.getType('image/png').then((blob) => {
          const image = new Image();
          image.src = URL.createObjectURL(blob); // 画像のURLを指定
          image.onload = () => {
            const [cv, cx] = createCanvasFromImage(image);

            onImageLoaded(cx.getImageData(0, 0, cv.width, cv.height));
          };
        });
      } catch (e) {
        alert('デコード失敗:' + e);
        console.error('failed decode from clipboard.' + e);
      }
    });
  }, []);

  return (
    <Button variant="contained" onClick={loadFromClipboard}>
      FROM CLIPBOARD
    </Button>
  );
};

export default ImageFromClipboard;
