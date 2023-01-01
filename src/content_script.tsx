// 'use strict';
chrome.runtime.onMessage.addListener((message, sender, callback) => {
  // Pixiv の画像サーバが403になるので、content_script で画像読む
  // 結局画像単体を新タブで開いた状態じゃないとダメになった。
  const imgs = document.getElementsByTagName('img');
  let imgEl = null;
  for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].src === message.src) {
      imgEl = imgs[i];
    }
  }

  if (!imgEl) {
    return true;
  }

  fetch(message.src)
    .then((res) => {
      res.blob().then((blob) => {
        chrome.runtime.sendMessage({ dataUrl: URL.createObjectURL(blob) });
      });
    })
    .catch((e) => {
      alert('画像の取得に失敗。画像だけを新タブで開いて再実施。' + e);
    });

  return true;
});
