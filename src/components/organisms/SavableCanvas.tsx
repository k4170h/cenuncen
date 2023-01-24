import React, { useEffect, useRef } from 'react';
import { getContext } from '../../utils/canvasUtils';

type Props = {
  imageData: ImageData | null;
  title?: string;
};

const ImageDataCanvas = ({ imageData }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  // imageDataに変更があればCanvasに反映
  useEffect(() => {
    if (imageData != null && canvas.current != null) {
      canvas.current.width = imageData.width;
      canvas.current.height = imageData.height;
      getContext(canvas.current).putImageData(imageData, 0, 0);
    }
  }, [imageData]);

  return (
    <>
      {imageData != null && (
        <canvas ref={canvas} width="100" height="0"></canvas>
      )}
    </>
  );
};

export default ImageDataCanvas;
