import React, { useCallback, useState } from 'react';
import ImageLoader from '../molecules/ImageFileLoader';
import SavableCanvas from '../organisms/SavableCanvas';
import { DecodeOptions } from '../../utils/types';
import { Box, Typography } from '@mui/material';
import { decodeImageData } from '../../utils/convertUtils';
import DecodeForm from '../organisms/DecodeForm';
import ImageFromClipboard from '../molecules/ClipboardImageLoader';
import CenteringBox from '../atoms/CenteringBox';
import { Stack } from '@mui/system';

const Decoder = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [decodedImageData, setDecodedImageData] = useState<ImageData | null>(
    null
  );
  const [error, setError] = useState('');

  const onImageLoaded = useCallback((imageData: ImageData) => {
    setError('');
    setDecodedImageData(null);
    try {
      setImageData(imageData);

      // const decodedImageData = decodeImageData(imageData);

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
      // const decodedImageData = decodeImageData(imageData, decodeOptions);
      setDecodedImageData(decodedImageData);
    },
    [imageData]
  );

  return (
    <>
      <CenteringBox>
        <Stack direction={'row'} spacing={2} m={2}>
          <ImageLoader onImageLoaded={onImageLoaded} />
          <ImageFromClipboard onImageLoaded={onImageLoaded} />
        </Stack>
        {error && <Typography color={'#c00'}>{error}</Typography>}
        {imageData && !decodedImageData && (
          <Box width="100%" mb={2}>
            <SavableCanvas imageData={imageData} title="Failed" />
          </Box>
        )}
        {decodedImageData && (
          <>
            <Box width={'auto'}>
              {/* <DecodeForm
                // onChange={reDecode}
                disabled={decodedImageData == null}
              /> */}
            </Box>
            <Box width="100%" mb={2}>
              <SavableCanvas imageData={decodedImageData} title="Result" />
            </Box>
          </>
        )}
      </CenteringBox>
    </>
  );
};

export default Decoder;
