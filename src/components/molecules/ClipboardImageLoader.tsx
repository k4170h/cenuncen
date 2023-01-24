import React, { ReactNode, useCallback, useState } from 'react';
import { Button } from '@mui/material';
import { createCanvasFromImage } from '../../utils/canvasUtils';

type Props = {
  onImageLoaded: (imageData: ImageData) => void;
  children?: ReactNode;
};

const ClipboardImageLoader = ({ onImageLoaded, children }: Props) => {
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
        alert('load image Failed:' + e);
        console.error(e);
      }
    });
  }, [onImageLoaded]);

  return (
    <Button variant="contained" onClick={loadFromClipboard}>
      {children ?? 'READ CLIPBOARD'}
    </Button>
  );
};

export default ClipboardImageLoader;
