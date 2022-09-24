import React, { useCallback, useRef, useState } from 'react';
import ImageLoader from './ImageLoader';
import { decodeImage } from '../converter';
import SavableCanvas from './SavableCanvas';
import { colorByteCodeToData } from '../colorByteCode';
import DecodeForm from './DecodeForm';
import { DecodeOptions, EncodeOptions, RectArea } from '../types';
import { Box } from '@mui/material';

const Decoder = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [decodedImageData, setDecodedImageData] = useState<ImageData | null>(
    null
  );
  const [isFullsize, setIsFullsize] = useState(false);
  const [needKey, setNeedKey] = useState(false);
  const [colorByteCodeData, setColorByteCodeData] = useState<{
    encodeOptions: EncodeOptions;
    areas: RectArea[];
    size: [number, number];
    optionalData: any;
  } | null>(null);

  const onImageLoaded = useCallback((imageData: ImageData) => {
    setImageData(imageData);

    // 画像のカラーバイトコードを読む
    const colorByteCodeData_ = colorByteCodeToData(imageData);
    setColorByteCodeData(colorByteCodeData_);

    setIsFullsize(imageData.width === colorByteCodeData_.size[0]);
    setNeedKey(colorByteCodeData_.encodeOptions.hashKey !== null);

    // デコード実施
    const decodedImageData = decodeImage(
      imageData,
      colorByteCodeData_.areas,
      colorByteCodeData_.encodeOptions,
      { hashKey: null, isJuggle: true },
      colorByteCodeData_.size,
      colorByteCodeData_.optionalData
    );
    setDecodedImageData(decodedImageData);
  }, []);

  const decode = useCallback(
    (decodeOptions: DecodeOptions) => {
      if (colorByteCodeData == null || imageData == null) {
        return;
      }

      // デコード実施(Formの入力オプションで)
      const decodedImageData = decodeImage(
        imageData,
        colorByteCodeData.areas,
        colorByteCodeData.encodeOptions,
        decodeOptions,
        colorByteCodeData.size,
        colorByteCodeData.optionalData
      );
      setDecodedImageData(decodedImageData);
    },
    [imageData, colorByteCodeData]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box width="100%" pt={4} textAlign="center">
        <ImageLoader onImageLoaded={onImageLoaded} />
      </Box>
      <Box width={300} p={4}>
        <DecodeForm
          disabled={imageData == null}
          isFullsize={isFullsize}
          needKey={needKey}
          onSubmit={decode}
        />
      </Box>
      <Box width="100%">
        <SavableCanvas imageData={decodedImageData} />
      </Box>
    </Box>
  );
};

export default Decoder;
