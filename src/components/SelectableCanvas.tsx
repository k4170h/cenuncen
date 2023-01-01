import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RectArea } from '../utils/types';
import {
  createCanvas,
  createCanvasFromImage,
  getContext,
} from '../utils/canvasUtils';
import { getNear } from '../utils/mathUtils';
import { ButtonLi, ButtonUl } from './ButtonWrapper';

const CanvasBase = styled(Box)({
  boxShadow: 'inset 0 1px 3px 0px rgba(0,0,0,.2)',
  textAlign: 'center',
  backgroundColor: '#ccc',
  padding: '8px',
  overflow: 'auto',
  width: '100%',
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

type Props = {
  imageData: ImageData | null;
  selectedAreas: RectArea[];
  onSelectArea: (area: RectArea) => void;
};

const SelectableCanvas = ({
  imageData,
  onSelectArea,
  selectedAreas,
}: Props) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [addable, setAddable] = useState(false);
  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [endPos, setEndPos] = useState<[number, number]>([0, 0]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);

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

    // 選択済み矩形を反映したimageDataを用意
    const [cv, ctx] = createCanvasFromImage(imageData);

    selectedAreas.forEach((v) => {
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(...v);
      ctx.strokeStyle = 'rgba(0,0,0)';
      ctx.strokeRect(...v);
    });
    setBaseImageData(ctx.getImageData(0, 0, cv.width, cv.height));
  }, [imageData, selectedAreas]);

  // baseImageDataに変更があればCanvasに反映
  useEffect(() => {
    if (baseImageData != null && canvas.current != null) {
      canvas.current.width = baseImageData.width;
      canvas.current.height = baseImageData.height;
      getContext(canvas.current).putImageData(baseImageData, 0, 0);
    }
  }, [baseImageData]);

  // マウスドラッグ開始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      // 左クリックでなければ終了
      if (e.button !== 0) {
        return;
      }

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
        // 座標を求める
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setEndPos([getNear(x, 8), getNear(y, 8)]);

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
        ctx.lineWidth = 1;
        ctx.strokeRect(
          ...startPos,
          getNear(x - startPos[0], 8),
          getNear(y - startPos[1], 8)
        );
      }
    },
    [startPos, mouseDown, baseImageData]
  );
  // マウスドラッグ完了
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setMouseDown(false);
      if (
        startPos[0] !== 0 ||
        startPos[1] !== 0 ||
        endPos[0] !== 0 ||
        endPos[1] !== 0
      ) {
        setAddable(true);
      }
    },
    [startPos, endPos]
  );

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

  return (
    <>
      {baseImageData != null && (
        <>
          <CanvasBase>
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
