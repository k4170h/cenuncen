type MenuId = 'decode' | 'openDecode';

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('converter.html');
  await chrome.tabs.create({ url });
  return true;
});

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.contextMenus.create({
    id: 'parent',
    title: 'Ancen',
    contexts: ['all'],
  });

  chrome.contextMenus.create({
    id: 'decode' as MenuId,
    title: 'Decode',
    contexts: ['image'],
    parentId: 'parent',
  });
  chrome.contextMenus.create({
    id: 'openDecode' as MenuId,
    title: 'Open decoder',
    contexts: ['all'],
    parentId: 'parent',
  });
});

/**
 * メニューが選択されたときの処理
 * 選択されたメニューが関数の引数に渡される。
 * 複数のメニューを登録した場合は、item.menuItemIdでクリックされたメニューが取得できる
 */
chrome.contextMenus.onClicked.addListener((item, tab) => {
  if ((item.menuItemId as MenuId) === 'openDecode') {
    const url = chrome.runtime.getURL('converter.html?d=1');
    chrome.tabs.create({ url });
    return;
  }

  if (!item.srcUrl) {
    return;
  }

  if (!tab || !tab.id) {
    return;
  }

  // 画像の取得を試みる
  fetch(item.srcUrl, {
    mode: 'no-cors',
  })
    .then((v) => {
      return v.blob();
    })
    .then((blob) => {
      if (
        ['image/jpeg', 'image/gif', 'image/png', 'image/webp'].every(
          (v) => blob.type !== v
        )
      ) {
        throw new Error('not image data : ' + blob.type);
      }

      return new Promise<string>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(fileReader.result as string);
        };
        fileReader.readAsDataURL(blob);
      });
    })
    .then((dataURI) => {
      chrome.tabs.sendMessage(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tab.id!,
        {
          type: 'replaceImage',
          dataURI,
          src: item.srcUrl,
        },
        (v) => true
      );
    })
    .catch((e) => {
      // 403だった場合もあるので、content_script でも行わせる
      chrome.tabs.sendMessage(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tab.id!,
        {
          type: 'replaceImage',
          dataURI: null,
          src: item.srcUrl,
        },
        (v) => true
      );
    });
});
