import React, { useCallback, useEffect, useState } from 'react';
import ImageLoader from './ImageLoader';
import SelectableCanvas from './SelectableCanvas';
import { encodeImage } from '../converter';
import { Options, RectArea } from '../types';
import SelectedAreaList from './SelectedAreaList';
import EncodeForm from './EncodeForm';
import { Box } from '@mui/material';
import SavableCanvas from './SavableCanvas';

const Encoder = () => {
  const [imageData, setImageData] = useState<null | ImageData>(null);
  const [originalImageData, setOriginalImageData] = useState<null | ImageData>(
    null
  );
  const [selectedAreas, setSelectedAreas] = useState<RectArea[]>([]);
  const [minGridSize, setMinGridSize] = useState<number>(8);

  useEffect(() => {
    if (originalImageData == null) {
      return;
    }
    const minGridSize = Math.round(
      (originalImageData.width > originalImageData.height
        ? originalImageData.width
        : originalImageData.height) / 100
    );
    setMinGridSize(minGridSize);
  }, [originalImageData]);

  // 画像選択時
  const onChangeImage = (imageData: ImageData) => {
    setImageData(null);
    setOriginalImageData(imageData);
    setSelectedAreas([]);
  };

  // 範囲が追加されたとき
  const onSelectArea = useCallback(
    (area: RectArea) => {
      setSelectedAreas(selectedAreas.concat([area]));
    },
    [setSelectedAreas, selectedAreas]
  );

  // エンコードを行う
  const encode = useCallback(
    (options: Options) => {
      if (originalImageData == null) {
        throw new Error();
      }

      // エンコードの実施
      const encodedImageData = encodeImage(
        originalImageData,
        selectedAreas,
        options
      );
      setImageData(encodedImageData);
    },
    [selectedAreas, originalImageData]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box width="100%" p={4} textAlign="center">
        <ImageLoader onImageLoaded={onChangeImage} />
      </Box>
      <Box width="100%">
        <SelectableCanvas
          {...{ imageData: originalImageData, onSelectArea, selectedAreas }}
        />
      </Box>
      <Box width={400} p={4}>
        <SelectedAreaList
          selectedAreas={selectedAreas}
          onUpdateList={setSelectedAreas}
        />
      </Box>
      <Box width={300} p={4}>
        <EncodeForm
          onSubmit={encode}
          disabled={originalImageData == null || selectedAreas.length === 0}
          minGridSize={minGridSize}
        />
      </Box>
      <Box
        width="100%"
        sx={{
          overflow: 'auto',
        }}
      >
        <SavableCanvas {...{ imageData }} />
      </Box>
    </Box>
  );
};

export default Encoder;
