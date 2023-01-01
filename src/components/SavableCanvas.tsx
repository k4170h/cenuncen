import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getContext } from '../utils/canvasUtils';
import { ButtonLi, ButtonUl } from './ButtonWrapper';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CanvasWrapper = styled(Box)({
  backgroundColor: '#ccc',
  padding: '8px',
  boxShadow: 'inset 0 1px 3px 0px rgba(0,0,0,.2)',
  textAlign: 'center',
  overflow: 'auto',
  position: 'relative',
});

const Title = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#fff',
  padding: '4px',
  borderRadius: '0 0 10px 0',
  boxShadow: '0 1px 3px 0px rgba(0,0,0,.2)',
});

type Props = {
  imageData: ImageData | null;
  title?: string;
};

const SavableCanvas = ({ imageData, title }: Props) => {
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
      console.error(err);
    }
  }, []);

  return (
    <>
      {imageData != null && (
        <>
          <CanvasWrapper>
            <Title>{title}</Title>
            <canvas ref={canvas} width="100" height="0"></canvas>
          </CanvasWrapper>
          <ButtonUl>
            <ButtonLi>
              <Button
                onClick={() => {
                  saveToClipboard();
                }}
                disabled={imageData == null}
                variant="contained"
                size="small"
              >
                <ContentCopyIcon />
              </Button>
            </ButtonLi>
            <ButtonLi>
              <Button
                component={'a'}
                variant="contained"
                size="small"
                disabled={jpg == null}
                download="image"
                href={jpg == null ? '' : jpg}
              >
                <SaveAltIcon />
                JPG
              </Button>
            </ButtonLi>
            <ButtonLi>
              <Button
                component={'a'}
                variant="contained"
                size="small"
                disabled={png == null}
                href={png == null ? '' : png}
                download="image"
              >
                <SaveAltIcon />
                PNG
              </Button>
            </ButtonLi>
          </ButtonUl>
        </>
      )}
    </>
  );
};

export default SavableCanvas;
