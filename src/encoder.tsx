import React, { useCallback, useEffect, useRef, useState } from 'react';
import SelectableCanvas from './SelectableCanvas';
import {
  createCanvas,
  createCanvasFromImage,
  createColorCode,
  encodeImage,
  getContext,
} from './util';

export type Area = [number, number, number, number];
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
  const [tmpArea, setTmpArea] = useState<null | Area>(null);
  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);
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
  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 画像のロード
    const reader = new FileReader();
    if (e?.target?.files?.[0] == null) {
      return;
    }
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
      // データ読み込みが終わったら
      const image = new Image();
      image.src = reader.result as string;
      // 画像への読み込みが終わったら
      image.onload = () => {
        const [cv, cx] = createCanvasFromImage(image);
        // Stateに保存
        setImageData(cx.getImageData(0, 0, cv.width, cv.height));
        setOriginalImageData(cx.getImageData(0, 0, cv.width, cv.height));
      };
    };
  };

  // 画像の範囲を選択したら
  const onSelectArea = useCallback(
    (area: Area) => {
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

    // 範囲の個数分エンコードしたImageData作成
    const encodedImageData = selectedAreas.reduce((p, v) => {
      return encodeImage(p, v, options);
    }, originalImageData);

    // 画面下に追加する色コードのImageData作成
    const colorCodeImageData = createColorCode(
      [0, 0, originalImageData.width, originalImageData.height],
      selectedAreas,
      options
    );

    // 画像作成
    const [cv, ctx] = createCanvas(
      originalImageData.width,
      originalImageData.height + colorCodeImageData.height
    );

    ctx.putImageData(encodedImageData, 0, 0);
    ctx.putImageData(colorCodeImageData, 0, encodedImageData.height);
    setImageData(ctx.getImageData(0, 0, cv.width, cv.height));
  }, [selectedAreas, originalImageData]);

  return (
    <div>
      <input
        type="file"
        id="INPUT_FILE"
        name="inputFile"
        accept="image/png, image/jpeg"
        onChange={onChangeImage}
      />
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
