import React, { useCallback, useState } from 'react';
import ImageLoader from './ImageLoader';
import SavableCanvas from './SavableCanvas';
import { DecodeOptions } from '../utils/types';
import { Box, Button } from '@mui/material';
import { decodeImageData } from '../utils/convertUtils';
import { createCanvasFromImage } from '../utils/canvasUtils';
import DecodeForm from './DecodeForm';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import ImageFromClipboard from './ImageFromClipboard';

const Decoder = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [decodedImageData, setDecodedImageData] = useState<ImageData | null>(
    null
  );

  const onImageLoaded = useCallback((imageData: ImageData) => {
    try {
      setImageData(imageData);

      const decodedImageData = decodeImageData(imageData);

      setDecodedImageData(decodedImageData);
    } catch (e) {
      alert('デコード失敗:' + e);
      console.error('failed decode from local file.' + e);
    }
  }, []);

  // キーを指定して再デコード
  const reDecode = useCallback(
    (decodeOptions: DecodeOptions) => {
      if (!imageData) {
        return;
      }
      const decodedImageData = decodeImageData(imageData, {
        hashKey: decodeOptions.hashKey,
      });
      setDecodedImageData(decodedImageData);
    },
    [imageData]
  );

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
            const decodedImageData = decodeImageData(
              cx.getImageData(0, 0, cv.width, cv.height)
            );
            setDecodedImageData(decodedImageData);
          };
        });
      } catch (e) {
        alert(e);
        console.error('failed to load image from clipboard.' + e);
      }
    });
  }, []);

  return (
    <Box>
      <ButtonUl>
        <ButtonLi>
          <ImageLoader onImageLoaded={onImageLoaded} />
        </ButtonLi>
        <ButtonLi>
          <ImageFromClipboard onImageLoaded={onImageLoaded} />
        </ButtonLi>
      </ButtonUl>
      <Box>
        {decodedImageData && (
          <>
            <SavableCanvas imageData={decodedImageData} title="デコード後" />
            <DecodeForm onSubmit={reDecode} />
          </>
        )}
        {imageData && (
          <>
            <SavableCanvas imageData={imageData} title="デコード前" />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Decoder;
