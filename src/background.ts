chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('converter.html');
  const tab = await chrome.tabs.create({ url });
  console.log('tab', tab);
});
