import React, { useRef } from 'react';
import ImageLoader from './ImageLoader';
import { decodeImage } from './converter';

const Decoder = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const onImageLoaded = (imageData: ImageData) => {
    const decodedImageData = decodeImage(imageData);

    // const data = colorByteCodeToData(imageData);
    // console.log(data);
    // const decodedImageData = (data as any).c.reverse().reduce((p: ImageData, c: RectArea) => {
    //   return decodeImage(p, c, (data as any).o, (data as any).w, (data as any).h)
    // }, imageData)

    // console.log(decodedImageData)
    canvas.current!.width = decodedImageData.width;
    canvas.current!.height = decodedImageData.height;
    canvas.current!.getContext('2d')!.putImageData(decodedImageData, 0, 0);
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
