export const sendToActiveTab = async (msg) => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);

  if (tab !== undefined) {
      chrome.tabs.sendMessage(tab.id, msg);
  }
};

export const sendToAllTabs = async (msg) => {
  let tabs = await chrome.tabs.query({});

  tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, msg);
  });
};