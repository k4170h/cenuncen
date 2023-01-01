import { createCanvas, createCanvasFromImage } from './utils/canvasUtils';

console.log('contentscript init');
// 'use strict';
chrome.runtime.onMessage.addListener((message, sender, callback) => {
  // Pixiv の画像サーバが403になるので、content_script で画像読む
  // 結局画像単体を新タブで開いた状態じゃないとダメになった。
  console.log('this is content_script', message);
  const imgs = document.getElementsByTagName('img');
  let imgEl = null;
  for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].src === message.src) {
      imgEl = imgs[i];
    }
  }

  if (!imgEl) {
    console.log('imgEl was not found');
    return true;
  }

  fetch(message.src)
    .then((res) => {
      res.blob().then((blob) => {
        const el = document.createElement('a');

        chrome.runtime.sendMessage(
          { dataUrl: URL.createObjectURL(blob) },
          (v) => {
            console.log('content_script sendMessage callback');
          }
        );
      });
    })
    .catch((e) => {
      alert('画像の取得に失敗。画像だけを新タブで開いて再実施。' + e);
    });

  return true;
});
