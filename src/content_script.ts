// 'use strict';

import { createCanvasFromImage } from './utils/canvasUtils';
import { decodeImageData } from './utils/convertUtils';
import { DEFAULT_DECODE_OPTIONS } from './utils/definition';

chrome.runtime.onMessage.addListener((message, sender, callback) => {
  switch (message.type) {
    case 'replaceImage': {
      replaceImage(message.src, message.dataURI)
        .then(() => {
          callback();
        })
        .catch((e) => {
          alert(e.message);
          callback();
        });

      break;
    }
  }
  return true;
});

const replaceImage = async (src: string, dataURI: string) => {
  if (!dataURI) {
    // ログイン必須系サービスの画像が403になるので、content_script でも画像を読む
    // 画像単体を表示していれば成功する
    const res = await fetch(src).catch((e) => {
      throw e;
    });
    const blob = await res.blob();
    if (
      ['image/jpeg', 'image/gif', 'image/png', 'image/webp'].every(
        (v) => blob.type !== v
      )
    ) {
      throw new Error("couldn't load image data. maybe 403");
    }
    dataURI = URL.createObjectURL(blob);
  }

  const image = await new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = dataURI; // 画像のURLを指定
  });

  const [cv, cx] = createCanvasFromImage(image);
  const newImg = document.createElement('img');
  try {
    const decodedImageData = decodeImageData(
      cx.getImageData(0, 0, cv.width, cv.height),
      DEFAULT_DECODE_OPTIONS
    );
    const [cv_] = createCanvasFromImage(decodedImageData);
    newImg.src = cv_.toDataURL();
  } catch (e) {
    throw new Error('Decode Failed : ' + e);
  }

  newImg.style.maxWidth = 'calc(100% - 20px)';
  newImg.style.maxHeight = 'calc(100% - 20px)';
  newImg.style.display = 'block';
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.zIndex = '10000';
  div.style.textAlign = 'center';
  div.style.backgroundColor = ' rgba(0,0,0,.8)';
  div.style.display = 'flex';
  div.style.justifyContent = 'center';
  div.style.alignItems = 'center';
  div.onclick = () => {
    div.remove();
  };
  div.appendChild(newImg);
  document.body.appendChild(div);
  return true;
};
