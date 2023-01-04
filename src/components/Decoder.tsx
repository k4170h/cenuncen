import React, { useCallback, useState } from 'react';
import ImageLoader from './ImageLoader';
import SavableCanvas from './SavableCanvas';
import { DecodeOptions } from '../utils/types';
import { Box, Typography } from '@mui/material';
import { decodeImageData } from '../utils/convertUtils';
import DecodeForm from './DecodeForm';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import ImageFromClipboard from './ImageFromClipboard';
import CenteringBox from './CenteringBox';

const Decoder = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [decodedImageData, setDecodedImageData] = useState<ImageData | null>(
    null
  );
  const [error, setError] = useState('');

  const onImageLoaded = useCallback((imageData: ImageData) => {
    setError('');
    try {
      setImageData(imageData);

      const decodedImageData = decodeImageData(imageData);

      setDecodedImageData(decodedImageData);
    } catch (e) {
      setError('デコード失敗[' + e + ']');
      console.error(e);
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

  return (
    <>
      <CenteringBox>
        <ButtonUl>
          <ButtonLi>
            <ImageLoader onImageLoaded={onImageLoaded} />
          </ButtonLi>
          <ButtonLi>
            <ImageFromClipboard onImageLoaded={onImageLoaded} />
          </ButtonLi>
        </ButtonUl>
        <Box m={4} width="100%">
          {error && <Typography color={'#c00'}>{error}</Typography>}
          {imageData && !decodedImageData && (
            <>
              <SavableCanvas imageData={imageData} title="Failed" />
            </>
          )}
          {decodedImageData && (
            <>
              <DecodeForm onSubmit={reDecode} />
              <Box height="16px" />
              <SavableCanvas imageData={decodedImageData} title="Result" />
            </>
          )}
        </Box>
      </CenteringBox>
    </>
  );
};

export default Decoder;
