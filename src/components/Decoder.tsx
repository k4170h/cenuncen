import React, { useRef } from 'react';
import ImageLoader from './ImageLoader';
import { decodeImage } from '../converter';
import { getContext } from '../utils';

const Decoder = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const onImageLoaded = (imageData: ImageData) => {
    if (canvas.current == null) {
      throw new Error();
    }
    const decodedImageData = decodeImage(imageData);
    canvas.current.width = decodedImageData.width;
    canvas.current.height = decodedImageData.height;
    getContext(canvas.current).putImageData(decodedImageData, 0, 0);
  };

  return (
    <div>
      <ImageLoader onImageLoaded={onImageLoaded} />

      <canvas ref={canvas} width="100" height="0">
        {' '}
      </canvas>
    </div>
  );
};

export default Decoder;
