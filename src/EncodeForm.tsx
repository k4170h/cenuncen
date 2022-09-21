import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colorByteCodeToData } from './colorByteCode';
import ImageLoader from './ImageLoader';

export type Options = {
  gridSize: number;
  isReplacePosition: boolean;
  isChangeColor: boolean;
  hashKey: string | null;
};


type Props = {
  currentImageWidth: number;
  onUpdateForm: (options: Options) => {}
}

const EncodeForm = () => {

  const gridSize = useRef<HTMLInputElement>(null);
  const isReplacePosition = useRef<HTMLInputElement>(null);
  const isChangeColor = useRef<HTMLInputElement>(null);
  const hashKey = useRef<HTMLInputElement>(null);


  return (
    <div>

      粒度:
      <input
        type="number"
        style={{ width: '4em' }}
        ref={gridSize}
        max={100}
      // onBlur={(e) => {
      //   if (parseInt(e.target.value) < minGridSize) {
      //     e.target.value = minGridSize + '';
      //   }
      // }}
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
    </div>
  );
};

export default EncodeForm;
