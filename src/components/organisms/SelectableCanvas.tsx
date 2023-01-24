import styled from '@emotion/styled';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { RectArea } from '../../utils/types';
import {
  createCanvas,
  createCanvasFromImage,
  getContext,
} from '../../utils/canvasUtils';
import { getNear } from '../../utils/mathUtils';
import {
  COLOR_PALETTE,
  DEFAULT_AREA_SELECT_OPTION,
} from '../../utils/definition';
import { convertRectAreaForGridSize } from '../../utils/convertUtils';
import { PanningInfo } from './PanningWrapper';

const Canvas = styled('canvas')({});

type Props = {
  imageData: ImageData | null;
  options: typeof DEFAULT_AREA_SELECT_OPTION;
  selectedAreas: RectArea[];
  onSelectArea: (v: RectArea) => void;
};

const SelectableCanvas = ({
  imageData,
  options: { gridSize, spacing, withColor },
  selectedAreas,
  onSelectArea,
}: Props) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [endPos, setEndPos] = useState<[number, number]>([0, 0]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);
  const [mouseMoved, setMouseMoved] = useState(false);

  const { zoom } = useContext(PanningInfo);

  // const { selectedAreas } = useContext(AppState);
  // const { setSelectedAreas } = useContext(AppStateFunc);

  // 下地になるImageDataを作成する
  useEffect(() => {
    if (imageData == null) {
      return;
    }

    // 矩形未選択なら propをそのまま流用
    if (selectedAreas.length === 0) {
      setBaseImageData(imageData);
      return;
    }

    // 選択済み矩形を反映したimageDataを作る
    const [cv, ctx] = createCanvasFromImage(imageData);

    const padding = spacing; //getGridPadding(imageData.width, imageData.height);
    selectedAreas.forEach((v, i) => {
      ctx.fillStyle = withColor
        ? COLOR_PALETTE[i % COLOR_PALETTE.length]
        : '#000';

      // グリッド内のPaddingより内側だけを塗りつぶす
      for (let i = 0; i < v[3]; i += gridSize) {
        for (let j = 0; j < v[2]; j += gridSize) {
          const rectArea = convertRectAreaForGridSize(
            v,
            imageData.width,
            imageData.height,
            gridSize
          );
          const rect = [
            rectArea[0] + j + padding,
            rectArea[1] + i + padding,
            gridSize - padding * 2,
            gridSize - padding * 2,
          ] as const;

          ctx.lineWidth = 1;
          ctx.fillRect(...rect);
        }
      }
    });
    setBaseImageData(ctx.getImageData(0, 0, cv.width, cv.height));
  }, [imageData, selectedAreas, gridSize, spacing, withColor]);

  // baseImageDataに変更があればCanvasに反映
  useEffect(() => {
    if (baseImageData != null && canvas.current != null) {
      canvas.current.width = baseImageData.width;
      canvas.current.height = baseImageData.height;
      getContext(canvas.current).putImageData(baseImageData, 0, 0);
    }
  }, [baseImageData]);

  // 選択範囲を消す
  const refleshCanvas = useCallback(() => {
    if (baseImageData == null || canvas.current == null) {
      throw new Error();
    }
    // 元画像の再描画
    const ctx = getContext(canvas.current);
    ctx.putImageData(baseImageData, 1, 0); // なんかうまく描画されないので・・・ごまかす
    ctx.putImageData(baseImageData, 0, 0);
  }, [baseImageData]);

  // 選択範囲のリセット
  const refleshArea = useCallback(() => {
    setStartPos([0, 0]);
    setEndPos([0, 0]);
  }, []);

  // マウスドラッグ開始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      // 左クリックでなければ終了
      if (e.button !== 0) {
        return;
      }

      if (!baseImageData) {
        return;
      }

      setMouseMoved(false);
      setMouseDown(true);
      // ドラッグ開始地点記録
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setStartPos([
        getNear((e.clientX - rect.left) * (1 / zoom), 8),
        getNear((e.clientY - rect.top) * (1 / zoom), 8),
      ]);
    },
    [baseImageData, zoom]
  );

  // マウスドラッグ中
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (mouseDown) {
        setMouseMoved(true);

        if (!baseImageData) {
          return;
        }

        // 座標を求める
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        // const x = getNear(e.clientX - rect.left, 8);
        // const y = getNear(e.clientY - rect.top, 8);

        const x = getNear((e.clientX - rect.left) * (1 / zoom), 8);
        const y = getNear((e.clientY - rect.top) * (1 / zoom), 8);

        setEndPos([x, y]);

        if (baseImageData == null) {
          throw new Error();
        }

        if (canvas.current == null) {
          throw new Error();
        }

        // 元画像の再描画
        const ctx = getContext(canvas.current);
        ctx.putImageData(baseImageData, 1, 0); // なんかうまく描画されないので・・・ごまかす
        ctx.putImageData(baseImageData, 0, 0);

        // 選択範囲の描画
        const ptn = getPattern(ctx);
        ctx.strokeStyle = ptn;
        ctx.fillStyle = 'rgba(0,0,0,.2)';
        ctx.lineWidth = 1;

        // 塗りつぶされる範囲をやってく
        const rectArea = convertRectAreaForGridSize(
          getSelectedArea(startPos, [x, y]),
          baseImageData.width,
          baseImageData.height,
          gridSize
        );

        const padding = spacing; //getGridPadding(
        //   baseImageData.width,
        //   baseImageData.height
        // );

        // グリッド内のPaddingより内側だけを塗りつぶす
        for (let i = 0; i < rectArea[3]; i += gridSize) {
          for (let j = 0; j < rectArea[2]; j += gridSize) {
            const rect = [
              rectArea[0] + j + padding,
              rectArea[1] + i + padding,
              gridSize - padding * 2,
              gridSize - padding * 2,
            ] as const;

            ctx.strokeRect(...rect);
            ctx.fillRect(...rect);
          }
        }
      }
    },
    [startPos, mouseDown, baseImageData, gridSize, zoom, spacing]
  );
  // マウスドラッグ完了
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setMouseDown(false);

      if (!mouseMoved) {
        refleshCanvas();
        return;
      }

      if (startPos[0] === endPos[0] || startPos[1] === endPos[1]) {
        return;
      }

      if (
        startPos[0] !== 0 ||
        startPos[1] !== 0 ||
        endPos[0] !== 0 ||
        endPos[1] !== 0
      ) {
        // setSelectedAreas([...selectedAreas, getSelectedArea(startPos, endPos)]);
        onSelectArea(getSelectedArea(startPos, endPos));
        refleshArea();
      }
    },
    [startPos, endPos, mouseMoved, refleshCanvas, refleshArea, onSelectArea]
  );
  if (canvas.current) {
    canvas.current.oncontextmenu = () => false;
    canvas.current.onwheel = () => false;
  }

  return (
    <>
      {baseImageData != null && (
        <Canvas
          ref={canvas}
          width="100"
          height="0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      )}
    </>
  );
};

export default SelectableCanvas;

// なぜか選択範囲が小数点込みになるので整数にする
const getSelectedArea = (
  start: [number, number],
  end: [number, number]
): RectArea => {
  return [
    Math.floor(start[0] < end[0] ? start[0] : end[0]),
    Math.floor(start[1] < end[1] ? start[1] : end[1]),
    Math.ceil(start[0] < end[0] ? end[0] - start[0] : start[0] - end[0]),
    Math.ceil(start[1] < end[1] ? end[1] - start[1] : start[1] - end[1]),
  ];
};

// 選択範囲の点線用パターンの定義
const dashedPattern = (() => {
  const size = 8;
  const [, ctx] = createCanvas(size, size);
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'rgb(255,255,255)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size / 2, 0);
  ctx.lineTo(0, size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.moveTo(size, 0);
  ctx.lineTo(size, size / 2);
  ctx.lineTo(size / 2, size);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
})();

const getPattern = (baseCtx: CanvasRenderingContext2D) => {
  const [cv] = createCanvasFromImage(dashedPattern);
  const ptn = baseCtx.createPattern(cv, 'repeat');
  if (ptn == null) {
    throw new Error();
  }
  return ptn;
};

const strokeLine = (ctx: CanvasRenderingContext2D, path: RectArea) => {
  ctx.beginPath();
  ctx.moveTo(path[0], path[1]);
  ctx.lineTo(path[2], path[3]);
  ctx.stroke();
};
