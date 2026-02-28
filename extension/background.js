// 1. Setup ALL Right-Click Menus in ONE listener
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verifyLink",
    title: "🔍 Scan Text/Link with KitaGuard",
    contexts: ["selection", "link"]
  });

  chrome.contextMenus.create({
    id: "kitaGuardScanImage",
    title: "🖼️ Scan Image with KitaGuard", 
    contexts: ["image"] 
  });
});

// 2. Set Panel Behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 3. Handle ALL Context Menu Clicks in ONE listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Always attempt to open the side panel when a menu item is clicked
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(err => console.error(err));

  if (info.menuItemId === "verifyLink") {
    const payload = info.selectionText || info.linkUrl;
    if (payload) {
      chrome.storage.local.set({ "pending_scan": payload });
    }
  } 
  else if (info.menuItemId === "kitaGuardScanImage") {
    chrome.storage.local.set({ "pending_image_scan": info.srcUrl });
  }
});

// 4. Listen for messages from Content Scripts (e.g., auto-detecting numbers)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerCheck") {
    const numberToCheck = request.payload;

    chrome.storage.local.set({ "pending_scan": numberToCheck }, () => {
      if (sender.tab && sender.tab.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId })
          .catch(err => console.log("Side panel needs user gesture:", err));
      }
    });
  }
});