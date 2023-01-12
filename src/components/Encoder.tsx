import React, { useCallback, useEffect, useState } from 'react';
import ImageLoader from './ImageLoader';
import SelectableCanvas from './SelectableCanvas';
import { EncodeFormValues, RectArea } from '../utils/types';
import SelectedAreaList from './SelectedAreaList';
import EncodeForm from './EncodeForm';
import { Box } from '@mui/material';
import SavableCanvas from './SavableCanvas';
import { encodeImageData } from '../utils/convertUtils';
import {
  MIN_PIXEL_BLOCK_WIDTH,
  MIN_RESIZED_IMAGE_WIDTH,
} from '../utils/definition';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import CenteringBox from './CenteringBox';
import { scroller, Element } from 'react-scroll';
import Stepper from './Stepper';
import ImageFromClipboard from './ImageFromClipboard';

const Encoder = () => {
  const [encodedImageData, setEncodedImageData] = useState<null | ImageData>(
    null
  );
  const [originalImageData, setOriginalImageData] = useState<null | ImageData>(
    null
  );
  const [selectedAreas, setSelectedAreas] = useState<RectArea[]>([]);
  const [gridSize, setGridSize] = useState<number>(0);

  // 画像選択時
  const onChangeImage = (imageData: ImageData) => {
    setEncodedImageData(null);
    setOriginalImageData(imageData);
    setSelectedAreas([]);

    scroller.scrollTo('step2', {
      duration: 800,
      delay: 100,
      smooth: 'easeInOutQuart',
      offset: -60,
    });
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
    (options: EncodeFormValues) => {
      if (originalImageData == null) {
        throw new Error();
      }

      options.gridSize = gridSize;

      console.log(options);
      // エンコードの実施
      const encodedImageData = encodeImageData(
        originalImageData,
        selectedAreas,
        options
      );
      setEncodedImageData(encodedImageData);
      scroller.scrollTo('step4', {
        duration: 800,
        delay: 100,
        smooth: 'easeInOutQuart',
        offset: -60,
      });
    },
    [selectedAreas, originalImageData, gridSize]
  );

  const handleChangeGridSize = useCallback((gridSize: number) => {
    setGridSize(gridSize);
  }, []);

  return (
    <>
      <Stepper />
      <CenteringBox>
        <Element name="step1"></Element>
        <ButtonUl>
          <ButtonLi>
            <ImageLoader onImageLoaded={onChangeImage} />
          </ButtonLi>
          <ButtonLi>
            <ImageFromClipboard onImageLoaded={onChangeImage} />
          </ButtonLi>
        </ButtonUl>
        <Box height="16px" />
        <Element name="step2"></Element>
        <SelectableCanvas
          {...{ imageData: originalImageData, onSelectArea, selectedAreas }}
          onChangeGridSize={handleChangeGridSize}
        />
        <Element name="step3"></Element>
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
          />
        </Box>
        <Element name="step4"></Element>
        <Box
          width="100%"
          sx={{
            overflow: 'auto',
          }}
        >
          <SavableCanvas imageData={encodedImageData} title="Result" />
        </Box>
      </CenteringBox>
    </>
  );
};

export default Encoder;
