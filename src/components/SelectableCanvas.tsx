import styled from '@emotion/styled';
import { Box, Button, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RectArea } from '../types';
import {
  createCanvas,
  createCanvasFromImage,
  getContext,
  getNear,
} from '../utils';

const CanvasWrapper = styled(Box)({
  backgroundColor: '#ccc',
  padding: '8px',
  boxShadow: 'inset 0 3px 3px -2px rgba(0,0,0,.2)',
  textAlign: 'center',
  overflow: 'auto',
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
    console.log('updated area', selectedAreas);
    if (imageData == null) {
      return;
    }

    // 矩形未選択なら propをそのまま流用
    if (selectedAreas.length === 0) {
      console.log('updated area, area is 0. set imagedata');
      setBaseImageData(imageData);
      return;
    }

    // 選択済み矩形を反映したimageDataを用意
    const [cv, ctx] = createCanvasFromImage(imageData);
    selectedAreas.forEach((v) => {
      ctx.fillRect(...v);
    });
    setBaseImageData(ctx.getImageData(0, 0, cv.width, cv.height));
  }, [imageData, selectedAreas]);

  // baseImageDataに変更があればCanvasに反映
  useEffect(() => {
    console.log('updated baseImageData');
    if (baseImageData != null && canvas.current != null) {
      canvas.current.width = baseImageData.width;
      canvas.current.height = baseImageData.height;
      getContext(canvas.current).putImageData(baseImageData, 0, 0);
    }
  }, [baseImageData]);

  // マウスドラッグ開始
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setMouseDown(true);
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
  const onMouseMove = useCallback(
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
  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setMouseDown(false);
      setAddable(true);
    },
    []
  );

  return (
    <>
      {baseImageData != null && (
        <>
          <CanvasWrapper>
            <canvas
              ref={canvas}
              width="100"
              height="0"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            ></canvas>
          </CanvasWrapper>
          <Box sx={{ display: 'flex', justifyContent: 'center' }} m={1}>
            <Button
              onClick={() => {
                onSelectArea(getSelectedArea(startPos, endPos));
                setAddable(false);
                setStartPos([0, 0]);
                setEndPos([0, 0]);
              }}
              disabled={!addable}
              variant="contained"
              size="small"
            >
              選択範囲を隠蔽対象に追加
            </Button>
            <Typography marginLeft={20}>画像上で対象範囲をドラッグ</Typography>
          </Box>
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
