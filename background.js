// 创建右键菜单项
chrome.contextMenus.create({
  id: "TranslationAssistantUnique",  // 菜单项唯一ID
  title: "Translation Assistant",  // 菜单项显示名称
  contexts: ["selection"]  // 仅在选中文本时显示
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "TranslationAssistantUnique") {
    const selectedText = "将下面的句子翻译成中文，确保翻译结果流畅且符合中文表达习惯: \n" + '`' +  info.selectionText + '`' ;  // 获取选中的文本
    if (selectedText) {
      // 打开插件弹窗并传递选中的文本

      chrome.action.openPopup();
      chrome.storage.local.set({ selectedText });
    }
  }
});
