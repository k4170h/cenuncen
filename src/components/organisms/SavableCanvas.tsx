import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getContext } from '../../utils/canvasUtils';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Stack } from '@mui/system';
import CenteringBox from '../atoms/CenteringBox';

const CanvasWrapper = styled(Box)({
  textAlign: 'center',
  overflow: 'auto',
  position: 'relative',
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
        <CenteringBox>
          <CanvasWrapper>
            <canvas ref={canvas} width="100" height="0"></canvas>
          </CanvasWrapper>
          <Stack direction="row" spacing={2} m={2}>
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
          </Stack>
        </CenteringBox>
      )}
    </>
  );
};

export default SavableCanvas;
