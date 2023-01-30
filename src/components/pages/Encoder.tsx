import React, { useCallback, useRef, useState } from 'react';
import SelectableCanvas from '../organisms/SelectableCanvas';
import AreaSelectForm from '../organisms/AreaSelectForm';
import styled from '@emotion/styled';
import SelectedAreaList from '../molecules/SelectedAreaList';
import PanningWrapper from '../organisms/PanningWrapper';
import EncodeForm from '../organisms/EncodeForm';
import { decodeImageData, encodeImageData } from '../../utils/convertUtils';
import {
  DEFAULT_AREA_SELECT_OPTION,
  DEFAULT_DECODE_OPTIONS,
  DEFAULT_ENCODE_OPTIONS,
  DEFAULT_TRIAL_DECODE_OPTIONS,
} from '../../utils/definition';
import SaveButtons from '../organisms/SaveButtons';
import ImageLoader from '../molecules/ImageLoader';
import Header from '../molecules/Header';
import DecodeForm from '../organisms/DecodeForm';
import {
  createCanvasFromImage,
  resizeImageData,
} from '../../utils/canvasUtils';
import TrialDecodeForm from '../organisms/TrialDecodeForm';
import {
  DecodeOptions,
  EncodeMode,
  EncodeOptions,
  Page,
  RectArea,
  TrialDecodeOptions,
} from '../../utils/types';
import PendingBox from '../atoms/PendingBox';
import Button from '../atoms/Button';
import ImageDataCanvas from '../organisms/ImageDataCanvas';

const ToolBox = styled('div')({
  position: 'fixed',
  backgroundColor: '#fff',
  width: '300px',
  bottom: '0',
  right: '0',
  padding: 20,
  zIndex: 1000,
  height: '100%',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  overflowY: 'auto',
});

const SlidableToolBox = styled(ToolBox)({
  transition: 'right ease-out .2s',
  '&.hide': {
    right: '-300px',
  },
});

type Props = {
  page: Page;
};

const Encoder = ({ page: defaultPage }: Props) => {
  const [page, setPage] = useState<Page>(defaultPage);
  const [mode, setMode] = useState<EncodeMode>('areaSelect');
  const panningRef = useRef<{
    moveToCenter: () => void;
    resetZoom: () => void;
    fitImage: () => void;
  }>();
  const [pending, setPending] = useState(false);
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
    async (v?: {
      encodeOptions?: EncodeOptions;
      imageDataToEncode?: ImageData;
    }) => {
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

      setPending(true);
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            setEncodedImageData(
              encodeImageData(
                imageData,
                selectedAreas,
                options,
                areaSelectOptions
              )
            );
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 1);
      }).catch((e) => {
        alert('Decode failed.');
        console.error(e);
      });
      setPending(false);
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
    async (v?: {
      decodeOptions?: DecodeOptions;
      imageDataToDecode?: ImageData;
    }) => {
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

      setPending(true);
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            setDecodedImageData(decodeImageData(imageData, options));
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 1);
      }).catch((e) => {
        alert('Decode failed.');
        console.error(e);
      });
      setPending(false);
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
      let imagedataPromise: Promise<ImageData>;
      if (options.isJPG) {
        const [cv] = createCanvasFromImage(resizedImageData);
        const imageStr = cv.toDataURL('image/jpeg', 0.9);
        imagedataPromise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const [cv, cx] = createCanvasFromImage(img);
            resolve(cx.getImageData(0, 0, cv.width, cv.height));
          };
          img.src = imageStr;
        });
      } else {
        imagedataPromise = Promise.resolve(resizedImageData);
      }

      setTryDecoded(true);
      imagedataPromise
        .then((imageData) => {
          setImageDataToDecode(imageData);
          return decode({ imageDataToDecode: imageData });
        })
        .then(() => {
          setPage('decode');
        });
    },
    [decode, encodedImageData, setImageDataToDecode]
  );

  // 画像選択時
  const handleChangeImageToEncode = useCallback(
    (imageData: ImageData) => {
      setImageDataToEncode(imageData);
      setSelectedAreas([]);
    },
    [setImageDataToEncode, setSelectedAreas]
  );
  const handleChangeImageToDecode = useCallback(
    (imageData: ImageData) => {
      setImageDataToDecode(imageData);
      decode({ imageDataToDecode: imageData });
      setTryDecoded(false);
    },
    [decode, setImageDataToDecode]
  );

  const switchToAreaSelect = useCallback(() => {
    setMode('areaSelect');
  }, []);

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
          <ImageDataCanvas imageData={encodedImageData} />
        )}
        {decodedImageData && page === 'decode' && (
          <ImageDataCanvas imageData={decodedImageData} />
        )}
      </PanningWrapper>
      <ToolBox>
        {mode === 'areaSelect' && page === 'encode' && (
          <div>
            <ImageLoader onImageLoaded={handleChangeImageToEncode} />
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
            <SelectedAreaList
              selectedAreas={selectedAreas}
              onUpdateList={(v) => {
                setSelectedAreas(v);
              }}
            />
            <div style={{ height: '32px' }} />
            <Button
              disabled={!selectedAreas.length}
              onClick={() => {
                encode().then(() => {
                  setMode('encodeSetting');
                });
              }}
            >
              Encode &gt;
            </Button>
          </div>
        )}
      </ToolBox>
      <SlidableToolBox className={mode !== 'encodeSetting' ? 'hide' : ''}>
        {mode === 'encodeSetting' && page === 'encode' && (
          <>
            <div>
              <Button onClick={switchToAreaSelect}>&lt; Back</Button>
            </div>
            <EncodeForm
              onChange={(v) => {
                encode({ encodeOptions: v }).then();
                setEncodeOptions(v);
              }}
              encodeOptions={encodeOptions}
            />
            <SaveButtons {...{ imageData: encodedImageData }} />
            <div>
              {encodedImageData && (
                <TrialDecodeForm
                  onChange={(v) => {
                    setTrialDecodeOptions(v);
                  }}
                  trialDecodeOptions={trialDecodeOptions}
                  imageSize={[encodedImageData.width, encodedImageData.height]}
                  onSubmit={() => decodeFromEncodedImage(trialDecodeOptions)}
                />
              )}
            </div>
          </>
        )}
      </SlidableToolBox>
      <SlidableToolBox className={page !== 'decode' ? 'hide' : ''}>
        {page === 'decode' && (
          <>
            {tryDecoded && (
              <div>
                <Button
                  onClick={() => {
                    setPage('encode');
                  }}
                >
                  &lt; Back
                </Button>
              </div>
            )}
            <ImageLoader onImageLoaded={handleChangeImageToDecode} />
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
      </SlidableToolBox>
      <PendingBox show={pending} />
    </>
  );
};

export default Encoder;
