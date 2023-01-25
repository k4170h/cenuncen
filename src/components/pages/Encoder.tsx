import React, { useCallback, useEffect, useRef, useState } from 'react';
import SelectableCanvas from '../organisms/SelectableCanvas';
import { Stack } from '@mui/system';
import AreaSelectForm from '../organisms/AreaSelectForm';
import styled from '@emotion/styled';
import { Box, Button, Divider } from '@mui/material';
import SelectedAreaList from '../molecules/SelectedAreaList';
import PanningWrapper from '../organisms/PanningWrapper';
import SavableCanvas from '../organisms/SavableCanvas';
import EncodeForm from '../organisms/EncodeForm';
import { decodeImageData, encodeImageData } from '../../utils/convertUtils';
import {
  DEFAULT_AREA_SELECT_OPTION,
  DEFAULT_DECODE_OPTIONS,
  DEFAULT_ENCODE_OPTIONS,
  DEFAULT_TRIAL_DECODE_OPTIONS,
} from '../../utils/definition';
import SaveButtons from '../organisms/SaveButtons';
import SmallImageLoader from '../molecules/SmallImageLoader';
import Header from '../molecules/Header';
import DecodeForm from '../organisms/DecodeForm';
import {
  createCanvasFromImage,
  resizeImageData,
} from '../../utils/canvasUtils';
import TrialDecodeForm from '../organisms/TrialDecodeForm';
import {
  DecodeOptions,
  EncodeOptions,
  RectArea,
  TrialDecodeOptions,
} from '../../utils/types';

const ToolBox = styled(Box)({
  position: 'fixed',
  backgroundColor: '#fff',
  width: '300px',
  bottom: '0',
  right: '0',
  padding: 20,
  zIndex: 1000,
  height: '100%',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  overflowY: 'auto',
});

const Encoder = () => {
  const [page, setPage] = useState<'encode' | 'decode'>('encode');
  const [mode, setMode] = useState<'areaSelect' | 'encodeSetting'>(
    'areaSelect'
  );
  const panningRef = useRef<{
    moveToCenter: () => void;
    resetZoom: () => void;
    fitImage: () => void;
  }>();
  const [imageDataToEncode, setImageDataToEncode] = useState<ImageData>();
  const [encodedImageData, setEncodedImageData] = useState<ImageData>();
  const [imageDataToDecode, setImageDataToDecode] = useState<ImageData>();
  const [decodedImageData, setDecodedImageData] = useState<ImageData>();
  const [selectedAreas, setSelectedAreas] = useState<RectArea[]>([]);
  const [areaSelectOptions, setAreaSelectOptions] = useState(
    DEFAULT_AREA_SELECT_OPTION
  );
  const [encodeOptions, setEncodeOptions] = useState(DEFAULT_ENCODE_OPTIONS);
  const [decodeOptions, setDecodeOptions] = useState(DEFAULT_DECODE_OPTIONS);
  const [trialDecodeOptions, setTrialDecodeOptions] = useState(
    DEFAULT_TRIAL_DECODE_OPTIONS
  );
  const [tryDecoded, setTryDecoded] = useState(false);

  const encode = useCallback(
    (v?: { encodeOptions?: EncodeOptions; imageDataToEncode?: ImageData }) => {
      const {
        encodeOptions: encodeOptions_,
        imageDataToEncode: imageDataToEncode_,
      } = v ?? {
        encodeOptions_: null,
        imageDataToEncode_: null,
      };

      const imageData = imageDataToEncode_ ?? imageDataToEncode;
      if (!imageData) {
        console.error('invalid ImageData');
        return;
      }

      const options = encodeOptions_ ?? encodeOptions;
      if (!options) {
        console.error('invalid enocdeOptions');
        return;
      }

      const encodedImageData_ = encodeImageData(
        imageData,
        selectedAreas,
        options,
        areaSelectOptions
      );
      setEncodedImageData(encodedImageData_);
    },
    [
      areaSelectOptions,
      imageDataToEncode,
      selectedAreas,
      setEncodedImageData,
      encodeOptions,
    ]
  );

  const decode = useCallback(
    (v?: { decodeOptions?: DecodeOptions; imageDataToDecode?: ImageData }) => {
      const {
        decodeOptions: decodeOptions_,
        imageDataToDecode: imageDataToDecode_,
      } = v ?? {
        encodeOptions_: null,
        imageDataToEncode_: null,
      };

      const imageData = imageDataToDecode_ ?? imageDataToDecode;
      if (!imageData) {
        console.error('invalid ImageData');
        return;
      }

      const options = decodeOptions_ ?? decodeOptions;
      if (!options) {
        console.error('invalid enocdeOptions');
        return;
      }

      try {
        const decodedImageData_ = decodeImageData(imageData, options);
        setDecodedImageData(decodedImageData_);
      } catch (e) {
        alert('failed to decode');
        console.error(e);
      }
    },
    [imageDataToDecode, setDecodedImageData, decodeOptions]
  );

  const decodeFromEncodedImage = useCallback(
    (options: TrialDecodeOptions) => {
      if (!encodedImageData) {
        console.error('invalid encoded ImageData');
        return;
      }
      setImageDataToDecode(undefined);
      setDecodedImageData(undefined);
      const resizedImageData = resizeImageData(
        encodedImageData,
        (encodedImageData.width * options.scale) / 100
      );
      if (options.isJPG) {
        const [cv] = createCanvasFromImage(resizedImageData);
        const imageStr = cv.toDataURL('image/jpeg', 0.9);
        const img = new Image();
        img.onload = () => {
          const [cv, cx] = createCanvasFromImage(img);
          decode({
            imageDataToDecode: cx.getImageData(0, 0, cv.width, cv.height),
          });
          setImageDataToDecode(cx.getImageData(0, 0, cv.width, cv.height));
        };
        img.src = imageStr;
      } else {
        decode({ imageDataToDecode: resizedImageData });
        setImageDataToDecode(resizedImageData);
      }
      setPage('decode');
      setTryDecoded(true);
    },
    [decode, encodedImageData, setImageDataToDecode]
  );

  // 画像選択時
  const handleChangeImageToEncode = useCallback(
    (imageData: ImageData) => {
      setImageDataToEncode(imageData);
      setSelectedAreas([]);
      setTimeout(() => {
        panningRef.current?.fitImage();
      }, 1);
    },
    [setImageDataToEncode, setSelectedAreas]
  );
  const handleChangeImageToDecode = useCallback(
    (imageData: ImageData) => {
      setImageDataToDecode(imageData);
      decode({ imageDataToDecode: imageData });
      setTimeout(() => {
        panningRef.current?.fitImage();
      }, 1);
      setTryDecoded(false);
    },
    [decode, setImageDataToDecode]
  );

  const switchToAreaSelect = useCallback(() => {
    setMode('areaSelect');
  }, []);

  useEffect(() => {
    setTimeout(() => {
      panningRef.current?.fitImage();
    }, 1);
  }, [mode, page]);

  return (
    <>
      <Header<'encode' | 'decode'>
        onChange={(v) => {
          setPage(v);
        }}
        current={page}
        items={[
          {
            label: 'encode',
            value: 'encode',
          },
          {
            label: 'decode',
            value: 'decode',
          },
        ]}
      />
      <PanningWrapper ref={panningRef}>
        {imageDataToEncode && page === 'encode' && mode === 'areaSelect' && (
          <SelectableCanvas
            {...{
              imageData: imageDataToEncode,
              options: areaSelectOptions,
              selectedAreas,
              onSelectArea: (v) => {
                setSelectedAreas([...selectedAreas, v]);
              },
            }}
          />
        )}
        {encodedImageData && page === 'encode' && mode === 'encodeSetting' && (
          <SavableCanvas imageData={encodedImageData} />
        )}
        {decodedImageData && page === 'decode' && (
          <SavableCanvas imageData={decodedImageData} />
        )}
      </PanningWrapper>
      <ToolBox>
        {page === 'encode' && mode === 'areaSelect' && (
          <Stack spacing={4} mb={4}>
            <SmallImageLoader onImageLoaded={handleChangeImageToEncode} />
            <Divider />
            <AreaSelectForm
              disabled={!imageDataToEncode}
              imageSize={[
                imageDataToEncode?.width ?? 0,
                imageDataToEncode?.height ?? 0,
              ]}
              onChange={(v) => {
                setAreaSelectOptions(v);
              }}
              areaSelectOptions={areaSelectOptions}
            />
            <Divider />
            <SelectedAreaList
              selectedAreas={selectedAreas}
              onUpdateList={(v) => {
                setSelectedAreas(v);
              }}
            />
            <Divider />
            <Button
              disabled={!selectedAreas.length}
              onClick={() => {
                setMode('encodeSetting');
                encode();
              }}
              variant="contained"
            >
              Encode
            </Button>
          </Stack>
        )}
        {page === 'encode' && mode === 'encodeSetting' && (
          <>
            <Stack mb={2}>
              <Button variant="contained" onClick={switchToAreaSelect}>
                Back
              </Button>
            </Stack>
            <Divider />
            <EncodeForm
              onChange={(v) => {
                encode({ encodeOptions: v });
                setEncodeOptions(v);
              }}
              encodeOptions={encodeOptions}
            />
            <SaveButtons {...{ imageData: encodedImageData }} />
            <Divider />
            <Stack mb={2} mt={4} spacing={2}>
              {encodedImageData && (
                <TrialDecodeForm
                  onChange={(v) => {
                    setTrialDecodeOptions(v);
                  }}
                  trialDecodeOptions={trialDecodeOptions}
                  imageSize={[encodedImageData.width, encodedImageData.height]}
                  onSubmit={() => decodeFromEncodedImage(trialDecodeOptions)}
                  expanded={tryDecoded}
                />
              )}
            </Stack>
          </>
        )}
        {page === 'decode' && (
          <>
            {tryDecoded && (
              <Stack mb={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setPage('encode');
                  }}
                >
                  Back
                </Button>
              </Stack>
            )}
            <SmallImageLoader onImageLoaded={handleChangeImageToDecode} />
            <DecodeForm
              onChange={(v) => {
                decode({ decodeOptions: v });
                setDecodeOptions(v);
              }}
              decodeOptions={decodeOptions}
              disabled={!decodedImageData}
            />
            <SaveButtons {...{ imageData: decodedImageData }} />
          </>
        )}
      </ToolBox>
    </>
  );
};

export default Encoder;
