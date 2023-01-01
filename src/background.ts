chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('converter.html');
  await chrome.tabs.create({ url });
});

chrome.runtime.onInstalled.addListener(function (details) {
  const parentId = chrome.contextMenus.create({
    id: 'menu',
    title: 'samplemenu',
    contexts: ['image'],
  });
});

/**
 * メニューが選択されたときの処理
 * 選択されたメニューが関数の引数に渡される。
 * 複数のメニューを登録した場合は、item.menuItemIdでクリックされたメニューが取得できる
 */
chrome.contextMenus.onClicked.addListener((item, tab) => {
  if (!item.srcUrl) {
    return;
  }

  // fetch(item.srcUrl).then((res) => {
  //   // fetch('https://zipcloud.ibsnet.co.jp/api/search?zipcode=7830060').then((res) => {
  //   res.text().then((v) => {
  //     console.log('json', v);
  //   });
  //   res.blob().then((blob) => {
  //     console.log('bk blob', blob);
  //   });
  // });

  if (!tab || !tab.id) {
    return;
  }
  console.log(tab.id);
  chrome.tabs.sendMessage(tab.id, { type: 'type1', src: item.srcUrl }, (v) => {
    console.log('callback', v);
  });

  // const getImg = (url: string) => {
  //   console.log('getImg', url);
  //   // fetchでアクセス.

  //   return fetch(url, { mode: 'no-cors' }).then((v) => {
  //     v.blob().then((v) => {
  //       console.log('blob is ', v);
  //     });
  //   });
  // };

  // chrome.scripting
  //   .executeScript({
  //     target: { tabId: tab.id },
  //     func: getImg,
  //     args: [item.srcUrl],
  //   })
  //   .then((v) => {
  //     console.log('result', v);
  //   });

  // const url = chrome.runtime.getURL('viewer.html?src=' + item.srcUrl);
  // chrome.tabs.create({ url });
});

chrome.runtime.onMessage.addListener((message) => {
  const url = chrome.runtime.getURL('viewer.html?dataUrl=' + message.dataUrl);
  chrome.tabs.create({ url });
});
