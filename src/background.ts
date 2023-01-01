chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('converter.html');
  await chrome.tabs.create({ url });
});

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.contextMenus.create({
    id: 'menu',
    title: 'uncensoring',
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

  if (!tab || !tab.id) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: 'type1', src: item.srcUrl });
});

chrome.runtime.onMessage.addListener((message) => {
  const url = chrome.runtime.getURL('viewer.html?dataUrl=' + message.dataUrl);
  chrome.tabs.create({ url });
});
