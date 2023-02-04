import React, { useCallback, useMemo } from 'react';
import { createCanvasFromImage } from '../../utils/canvasUtils';
import Button from '../atoms/Button';
import FlexRow from '../atoms/FlexRow';
import SectionTitle from '../atoms/SectionTitle';

type Props = {
  imageData?: ImageData;
};

const SaveButtons = ({ imageData }: Props) => {
  const disabled = useMemo(() => !imageData, [imageData]);

  // ファイルに保存する
  const saveToFile = useCallback(
    (type: 'jpg' | 'png') => {
      if (!imageData) {
        return;
      }
      const [cv] = createCanvasFromImage(imageData);
      const image =
        type === 'jpg'
          ? cv.toDataURL('image/jpeg', 0.9)
          : cv.toDataURL('image/png');
      const el = document.createElement('a');
      el.href = image;
      el.download = 'image';
      el.click();
      el.remove();
    },
    [imageData]
  );

  // クリップボードに保存する
  const saveToClipboard = useCallback(() => {
    if (!imageData) {
      return;
    }
    const [cv] = createCanvasFromImage(imageData);
    const bin = window.atob(cv.toDataURL('image/png').replace(/^.*,/, ''));
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
  }, [imageData]);

  return (
    <>
      <SectionTitle>Save Image</SectionTitle>
      <FlexRow>
        <Button
          onClick={() => {
            saveToClipboard();
          }}
          disabled={disabled}
        >
          COPY
        </Button>
        <Button onClick={() => saveToFile('jpg')} disabled={disabled}>
          JPG
        </Button>
        <Button onClick={() => saveToFile('png')} disabled={disabled}>
          PNG
        </Button>
      </FlexRow>
    </>
  );
};

export default SaveButtons;
