import React, { useCallback, useEffect, useRef, useState } from 'react';
import { dataToColorByteCode } from './colorByteCode';
import ImageLoader from './ImageLoader';
import SelectableCanvas from './SelectableCanvas';
import { convertAreasForGridSize, encodeImage } from './converter';
import { RectArea } from './types';
import { createCanvasFromImage } from './utils';

// export type Area = [number, number, number, number];
export type Options = {
  gridSize: number;
  isReplacePosition: boolean;
  isChangeColor: boolean;
  hashKey: string | null;
};

const Encoder = () => {
  const [imageData, setImageData] = useState<null | ImageData>(null);
  const [originalImageData, setOriginalImageData] = useState<null | ImageData>(
    null
  );
  const [tmpArea, setTmpArea] = useState<null | RectArea>(null);
  const [selectedAreas, setSelectedAreas] = useState<RectArea[]>([]);
  const [isAddable, setIsAddable] = useState(false);
  const [minGridSize, setMinGridSize] = useState<number>(8);

  const gridSize = useRef<HTMLInputElement>(null);
  const isReplacePosition = useRef<HTMLInputElement>(null);
  const isChangeColor = useRef<HTMLInputElement>(null);
  const hashKey = useRef<HTMLInputElement>(null);

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
    gridSize.current!.value = minGridSize + '';
    gridSize.current!.min = minGridSize + '';
  }, [originalImageData]);

  // 画像選択時
  const onChangeImage = (imageData: ImageData) => {
    setImageData(imageData);
    setOriginalImageData(imageData);
  };

  // 画像の範囲を選択したら
  const onSelectArea = useCallback(
    (area: RectArea) => {
      setTmpArea(area);
      setIsAddable(true);
    },
    [setTmpArea]
  );

  // 範囲が追加されたとき
  const addArea = useCallback(() => {
    if (tmpArea != null) {
      // 仮選択の範囲を、対象範囲に追加
      setSelectedAreas(selectedAreas.concat([tmpArea]));

      if (imageData == null) {
        console.error('imageData was invalid');
        return;
      }

      // さらにImageDataを更新して、範囲を塗りつぶす
      const [cv, cx] = createCanvasFromImage(imageData);
      cx.strokeStyle = 'rgb(0,0,0)';
      cx.fillRect(...tmpArea);
      // 編集したImageDataを保存
      setImageData(cx.getImageData(0, 0, cv.width, cv.height));
      setIsAddable(false);
    }
  }, [setSelectedAreas, selectedAreas, tmpArea, imageData]);

  // リセット
  const resetArea = useCallback(() => {
    if (originalImageData == null) {
      console.error('imageData was invalid');
      return;
    }
    setSelectedAreas([]);
    const [cv, cx] = createCanvasFromImage(originalImageData);
    setImageData(cx.getImageData(0, 0, cv.width, cv.height));
    setIsAddable(false);
  }, [originalImageData]);

  // エンコードを行う
  const encode = useCallback(() => {
    if (originalImageData == null) {
      throw new Error();
    }

    // エンコードオプションをInputから作る
    const options = optionsFromElement(
      gridSize,
      isReplacePosition,
      isChangeColor,
      hashKey
    );

    // エンコードの実施
    const encodedImageData = encodeImage(
      originalImageData,
      selectedAreas,
      options
    );
    setImageData(encodedImageData);
  }, [selectedAreas, originalImageData]);

  return (
    <div>
      <ImageLoader onImageLoaded={onChangeImage} />
      <div
        style={{
          overflow: 'auto',
          width: '100%',
          maxHeight: 600,
          border: '1px red solid',
        }}
      >
        <SelectableCanvas {...{ imageData, onSelectArea }}></SelectableCanvas>
      </div>
      <button onClick={addArea} disabled={!isAddable}>
        範囲を追加
      </button>
      <button onClick={resetArea} disabled={selectedAreas.length === 0}>
        リセット
      </button>
      <div>
        {selectedAreas.map((v) => (
          <>
            {v[0]}:{v[1]}:{v[2]}:{v[3]}
            <br />
          </>
        ))}
      </div>
      粒度:
      <input
        type="number"
        style={{ width: '4em' }}
        ref={gridSize}
        max={100}
        onBlur={(e) => {
          if (parseInt(e.target.value) < minGridSize) {
            e.target.value = minGridSize + '';
          }
        }}
      />
      <br />
      位置混ぜ：
      <input type="checkbox" ref={isReplacePosition} defaultChecked={true} />
      <br />
      色混ぜ：
      <input type="checkbox" ref={isChangeColor} defaultChecked={true} />
      <br />
      鍵: <input type="text" size={4} ref={hashKey} />
      <br />
      <button onClick={encode} disabled={selectedAreas.length === 0}>
        エンコード
      </button>
    </div>
  );
};

export default Encoder;

const optionsFromElement = (
  gridSize_: React.RefObject<HTMLInputElement>,
  isReplacePosition_: React.RefObject<HTMLInputElement>,
  isChangeColor_: React.RefObject<HTMLInputElement>,
  hashKey_: React.RefObject<HTMLInputElement>
): Options => {
  if (
    gridSize_.current?.value == null ||
    isReplacePosition_.current?.checked == null ||
    isChangeColor_.current?.checked == null ||
    hashKey_.current == null
  ) {
    throw new Error();
  }
  const gridSize = parseInt(gridSize_.current?.value);
  if (gridSize == null) {
    throw new Error();
  }
  const isReplacePosition = isReplacePosition_.current.checked;
  const isChangeColor = isChangeColor_.current.checked;
  const hashKey =
    hashKey_.current.value == null ? null : hashKey_.current?.value;

  return {
    gridSize,
    isReplacePosition,
    isChangeColor,
    hashKey,
  };
};
