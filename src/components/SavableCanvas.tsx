import styled from '@emotion/styled';
import { Box, Button, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RectArea } from '../types';
import { createCanvas, createCanvasFromImage, getContext } from '../utils';

const CanvasWrapper = styled(Box)({
  backgroundColor: '#ccc',
  padding: '8px',
  boxShadow: 'inset 0 3px 3px -2px rgba(0,0,0,.2)',
  textAlign: 'center',
  overflow: 'auto',
});

type Props = {
  imageData: ImageData | null;
};

const SavableCanvas = ({ imageData }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [jpg, setJpg] = useState<string | null>(null);
  const [png, setPng] = useState<string | null>(null);

  // imageDataに変更があればCanvasに反映
  useEffect(() => {
    if (imageData != null && canvas.current != null) {
      canvas.current.width = imageData.width;
      canvas.current.height = imageData.height;
      getContext(canvas.current).putImageData(imageData, 0, 0);
      setJpg(canvas.current.toDataURL('image/jpeg', 0.9));
      setPng(canvas.current.toDataURL('image/png'));
    }
  }, [imageData]);

  const saveToClipboard = useCallback(() => {
    if (canvas.current == null) {
      return;
    }
    const png = canvas.current.toDataURL('image/png').replace(/^.*,/, '');

    const bin = window.atob(png);
    const buffer = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      buffer[i] = bin.charCodeAt(i);
    }
    const blob = new Blob([buffer], { type: 'image/png' }); //. イメージバッファから Blob を生成
    try {
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <>
      {imageData != null && (
        <>
          <CanvasWrapper>
            <canvas ref={canvas} width="100" height="0"></canvas>
          </CanvasWrapper>
          <Box sx={{ display: 'flex', justifyContent: 'center' }} m={1}>
            <Button
              onClick={() => {
                saveToClipboard();
              }}
              disabled={imageData == null}
              variant="contained"
              size="small"
              style={{
                display: 'block',
                margin: 4,
              }}
            >
              クリップボードにコピー
            </Button>
            <Button
              component={'a'}
              variant="contained"
              size="small"
              disabled={jpg == null}
              download="image"
              href={jpg == null ? '' : jpg}
              style={{
                display: 'block',
                margin: 4,
              }}
            >
              JPGで保存
            </Button>
            <Button
              component={'a'}
              variant="contained"
              size="small"
              disabled={png == null}
              href={png == null ? '' : png}
              download="image"
              style={{
                display: 'block',
                margin: 4,
              }}
            >
              PNGで保存
            </Button>
          </Box>
        </>
      )}
    </>
  );
};

export default SavableCanvas;
