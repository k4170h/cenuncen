import ReactDOM from 'react-dom';
import { Box, Button, styled, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import queryString from 'query-string';
import { createCanvasFromImage } from './utils/canvasUtils';
import { decodeImageData } from './utils/convertUtils';
import SavableCanvas from './components/SavableCanvas';
import CloseIcon from '@mui/icons-material/Close';
import DecodeForm from './components/DecodeForm';
import { DecodeOptions } from './utils/types';
import CenteringBox from './components/CenteringBox';

const CloseButton = styled(Button)({
  display: 'block',
  position: 'fixed',
  top: 0,
  right: 0,
  borderRadius: '30px',
  width: '60px',
  height: '60px',
  color: '#333',
  backgroundColor: '#fff',
  fontSize: '60px',
  lineHeight: '60px',
  padding: 0,
});

const Viewer = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [decodedImageData, setDecodedImageData] = useState<ImageData | null>(
    null
  );
  const [error, setError] = useState('');
  const query = queryString.parse(window.location.search);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (query.dataUrl) {
      const image = new Image();
      image.src = query.dataUrl as string; // 画像のURLを指定
      image.onload = () => {
        setImage(image);
      };
    }
  }, [query.dataUrl]);

  useEffect(() => {
    if (!image) {
      return;
    }
    setError('');
    const [cv, cx] = createCanvasFromImage(image);
    setImageData(cx.getImageData(0, 0, cv.width, cv.height));
    try {
      const decodedImageData = decodeImageData(
        cx.getImageData(0, 0, cv.width, cv.height)
      );
      setDecodedImageData(decodedImageData);
    } catch (e) {
      setError('デコード失敗[' + e + ']');
    }
  }, [image]);

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
    <CenteringBox>
      <Box width="100%">
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
      <CloseButton
        onClick={() => {
          window.close();
        }}
      >
        <CloseIcon fontSize="large" />
      </CloseButton>
    </CenteringBox>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Viewer />
  </React.StrictMode>,
  document.getElementById('root')
);
