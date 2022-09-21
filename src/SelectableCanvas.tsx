import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RectArea } from './types';

type Props = {
  imageData: ImageData | null;
  onSelectArea: (area: RectArea) => void;
};

const SelectableCanvas = ({ imageData, onSelectArea }: Props) => {
  console.log('SelectableCanvas render');
  const [mouseDown, setMouseDown] = useState(false);
  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [endPos, setEndPos] = useState<[number, number]>([0, 0]);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageData != null) {
      canvas.current!.width = imageData.width;
      canvas.current!.height = imageData.height;
      canvas.current!.getContext('2d')!.putImageData(imageData, 0, 0);
    }
  }, [imageData]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      console.log('onMouseDown');
      setMouseDown(true);

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setStartPos([e.clientX - rect.left, e.clientY - rect.top]);
      canvas.current!.getContext('2d')!.lineWidth = 1;
    },
    []
  );
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      console.log('onMouseMove');
      if (mouseDown && imageData != null) {
        // 座標を求める
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setEndPos([x, y]);

        // 元画像の再描画
        const ctx = canvas.current!.getContext('2d')!;
        ctx.fillRect(0, 0, canvas.current!.width, canvas.current!.height);
        ctx.putImageData(imageData, 1, 0);
        ctx.putImageData(imageData, 0, 0);
        ctx.strokeRect(...startPos, x - startPos[0], y - startPos[1]);
        console.log('updated spos', startPos, [
          e.clientX - rect.left,
          e.clientY - rect.top,
        ]);
        console.log('canvas', canvas.current?.width, canvas.current?.height);
      }
    },
    [startPos, mouseDown, imageData]
  );
  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setMouseDown(false);
      onSelectArea(getSelectedArea(startPos, endPos));
    },
    [endPos, onSelectArea, startPos]
  );

  return (
    <>
      {imageData != null && (
        <canvas
          ref={canvas}
          width="100"
          height="0"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          {' '}
        </canvas>
      )}
    </>
  );
};

export default SelectableCanvas;

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
