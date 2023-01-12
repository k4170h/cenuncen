import styled from '@emotion/styled';
import { Box, Button, Slider, Stack } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RectArea } from '../utils/types';
import {
  createCanvas,
  createCanvasFromImage,
  getContext,
} from '../utils/canvasUtils';
import { getNear, getNearCeil } from '../utils/mathUtils';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import {
  COLOR_PALETTE,
  MIN_PIXEL_BLOCK_WIDTH,
  MIN_RESIZED_IMAGE_WIDTH,
} from '../utils/definition';
import {
  convertRectAreaForGridSize,
  getGridPadding,
} from '../utils/convertUtils';
import Grid3x3OutlinedIcon from '@mui/icons-material/Grid3x3Outlined';
import Grid4x4OutlinedIcon from '@mui/icons-material/Grid4x4Outlined';

const CanvasBase = styled(Box)({
  boxShadow: 'inset 0 1px 3px 0px rgba(0,0,0,.2)',
  textAlign: 'center',
  backgroundColor: '#ccc',
  padding: '8px',
  // overflow: 'auto',
  width: '100%',
  position: 'relative',
});
const CanvasWrapper = styled(Box)({
  display: 'inline-block',
  position: 'relative',
});

const ButtonWrapper = styled(Box)({
  position: 'absolute',
  backgroundColor: '#fff',
  padding: '4px',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
});

const SliderWrapper = styled(Box)({
  backgroundColor: '#fff',
  width: '200px',
  height: '30px',
  display: 'block',
  position: 'sticky',
  left: 'calc( 50% - 100px )',
  top: '70px',
  marginBottom: '10px',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
  zIndex: 500,
});

type Props = {
  imageData: ImageData | null;
  selectedAreas: RectArea[];
  onSelectArea: (area: RectArea) => void;
  onChangeGridSize: (gridSize: number) => void;
};

const SelectableCanvas = ({
  imageData,
  onSelectArea,
  selectedAreas,
  onChangeGridSize,
}: Props) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [addable, setAddable] = useState(false);
  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [endPos, setEndPos] = useState<[number, number]>([0, 0]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);
  const [gridSize, setGridSize] = useState<number>(16);
  const [minGridSize, setMinGridSize] = useState<number>(16);
  const [mouseMoved, setMouseMoved] = useState(false);

  // グリッドの最小幅を算出
  useEffect(() => {
    if (imageData == null) {
      return;
    }
    const longStroke =
      imageData.width > imageData.height ? imageData.width : imageData.height;
    let minGridSize = Math.ceil(
      (MIN_PIXEL_BLOCK_WIDTH * longStroke) / MIN_RESIZED_IMAGE_WIDTH
    );
    minGridSize = minGridSize + (8 - (minGridSize % 8));
    if (minGridSize < MIN_PIXEL_BLOCK_WIDTH) {
      minGridSize = MIN_PIXEL_BLOCK_WIDTH;
    }

    setMinGridSize(minGridSize);
    setGridSize(minGridSize);
    onChangeGridSize(minGridSize);
  }, [imageData, onChangeGridSize]);

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

    // selectedAreas.forEach((v, i) => {
    //   ctx.fillStyle = '#000';
    //   ctx.fillRect(...v);
    // });

    const padding = getGridPadding(imageData.width, imageData.height);
    ctx.fillStyle = '#000';
    selectedAreas.forEach((v, i) => {
      ctx.strokeStyle = COLOR_PALETTE[i % COLOR_PALETTE.length];
      // ctx.strokeRect(...v);

      // グリッド内のPaddingより内側だけを塗りつぶす
      for (let i = 0; i < v[3]; i += gridSize) {
        for (let j = 0; j < v[2]; j += gridSize) {
          if (i === 0 && j === 0) {
            console.log('conf', v[0] + j + padding, v[1] + i + padding);
          }
          const rectArea = convertRectAreaForGridSize(
            v,

            imageData.width,
            imageData.height,
            gridSize
          );
          ctx.strokeRect(
            rectArea[0] + j + padding,
            rectArea[1] + i + padding,
            gridSize - padding * 2,
            gridSize - padding * 2
          );
          ctx.fillRect(
            rectArea[0] + j + padding,
            rectArea[1] + i + padding,
            gridSize - padding * 2,
            gridSize - padding * 2
          );
        }
      }
    });
    setBaseImageData(ctx.getImageData(0, 0, cv.width, cv.height));
  }, [imageData, selectedAreas, gridSize]);

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
    setAddable(false);
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

      setMouseMoved(false);
      setMouseDown(true);
      setAddable(false);
      // ドラッグ開始地点記録
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setStartPos([
        getNear(e.clientX - rect.left, 8),
        getNear(e.clientY - rect.top, 8),
      ]);
    },
    []
  );

  // マウスドラッグ中
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (mouseDown) {
        setMouseMoved(true);

        // 座標を求める
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = getNear(e.clientX - rect.left, 8);
        const y = getNear(e.clientY - rect.top, 8);

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
        // ctx.strokeRect(
        //   ...startPos,
        //   getNear(x - startPos[0], 8),
        //   getNear(y - startPos[1], 8)
        // );

        // 終点が マイナスだった場合の対応
        const width = getNear(x - startPos[0], 8);
        const height = getNear(y - startPos[1], 8);
        const [x1, x2] =
          width >= 0 ? [startPos[0], width] : [startPos[0] + width, width * -1];
        const [y1, y2] =
          height >= 0
            ? [startPos[1], height]
            : [startPos[1] + height, height * -1];

        // 塗りつぶされる範囲をやってく
        const rectArea = convertRectAreaForGridSize(
          [x1, y1, x2, y2],
          baseImageData.width,
          baseImageData.height,
          gridSize
        );

        const padding = getGridPadding(
          baseImageData.width,
          baseImageData.height
        );

        // グリッド内のPaddingより内側だけを塗りつぶす
        for (let i = 0; i < rectArea[3]; i += gridSize) {
          for (let j = 0; j < rectArea[2]; j += gridSize) {
            ctx.strokeRect(
              rectArea[0] + j + padding,
              rectArea[1] + i + padding,
              gridSize - padding * 2,
              gridSize - padding * 2
            );
            ctx.fillRect(
              rectArea[0] + j + padding,
              rectArea[1] + i + padding,
              gridSize - padding * 2,
              gridSize - padding * 2
            );
          }
        }
      }
    },
    [startPos, mouseDown, baseImageData, gridSize]
  );
  // マウスドラッグ完了
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setMouseDown(false);

      if (!mouseMoved) {
        refleshCanvas();
        setAddable(false);
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
        setAddable(true);
      }
    },
    [startPos, endPos, refleshCanvas, mouseMoved]
  );

  return (
    <>
      {baseImageData != null && (
        <>
          <CanvasBase>
            <SliderWrapper>
              <Stack
                spacing={2}
                direction="row"
                sx={{ mb: 1 }}
                alignItems="center"
              >
                <Grid4x4OutlinedIcon />
                <Slider
                  value={gridSize}
                  step={8}
                  valueLabelDisplay="auto"
                  min={getNearCeil(minGridSize ?? 8, 8)}
                  max={getNearCeil(minGridSize ?? 8, 8) + 40}
                  onChange={(_, v) => {
                    setGridSize(v as number);

                    console.log('onchange!', v);
                    onChangeGridSize(v as number);
                  }}
                />
                <Grid3x3OutlinedIcon />
              </Stack>
            </SliderWrapper>
            <CanvasWrapper>
              <canvas
                ref={canvas}
                width="100"
                height="0"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              ></canvas>

              {addable && (
                <ButtonWrapper
                  style={{
                    left: Math.abs(endPos[0]),
                    top: Math.abs(endPos[1]),
                  }}
                >
                  <ButtonUl>
                    <ButtonLi>
                      <Button
                        onClick={() => {
                          onSelectArea(getSelectedArea(startPos, endPos));
                          refleshArea();
                        }}
                        disabled={!addable}
                        variant="contained"
                        size="small"
                      >
                        add
                      </Button>
                    </ButtonLi>
                    <ButtonLi>
                      <Button
                        onClick={() => {
                          refleshCanvas();
                          refleshArea();
                        }}
                        disabled={!addable}
                        variant="contained"
                        size="small"
                      >
                        cancel
                      </Button>
                    </ButtonLi>
                  </ButtonUl>
                </ButtonWrapper>
              )}
            </CanvasWrapper>
          </CanvasBase>
        </>
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
