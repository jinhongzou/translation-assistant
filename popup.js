// 发送消息（保留原有监听逻辑）
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 初始化时加载历史记录
window.addEventListener('load', loadHistory);

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const text =  userInput.value.trim();
    if (!text) return;

    addMessage('user', "user: " + text);
    // 保存消息到历史记录
    saveMessageToHistory('user', text);
    userInput.value = '';

    try {
      // 直接使用固定API Key（需自行替换为真实值）
      const apiKey = "你的api_key"; 
      
      // 从存储中加载历史记录
      const chatHistory = await new Promise((resolve) => {
          chrome.storage.local.get(['chatHistory'], (result) => {
              resolve(result.chatHistory || []);
          });
      });

      // 构造 messages 数组，包含系统提示、历史记录和当前用户输入
      const messages = [
      {
            role: "system",
            content: `
            **角色设定**  
            你是一名乐于助人的帮手。
            `
        },
        ...chatHistory.map((message) => ({
            role: message.role,
            content: message.content
        })),
        { role: "user", content: text }
    ];

    const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: messages,
          stream: false,
        } )
      };
      
      // 修复点：使用 await 统一处理异步请求
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options);
      const data = await response.json();  // 正确的作用域访问
      
      // 修复点：根据实际API响应结构调整字段
      const reply = data.choices[0].message.content;
      addMessage('assistant', "assistant: " + reply + '['+ messages.length + ']');


      saveMessageToHistory('assistant', reply);

    } catch (error) {
        addMessage('system', `错误: ${error.message}`);
    }
}

// 工具函数：添加消息到聊天界面
function addMessage(role, content) {
    const history = document.getElementById('chat-history');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = content;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

// 工具函数：保存消息到历史记录
function saveMessageToHistory(in_role, in_content) {
    chrome.storage.local.get(['chatHistory'], (result) => {
        const chatHistory = result.chatHistory || [];
        chatHistory.push({ role: in_role, content: in_content});
        chrome.storage.local.set({ chatHistory });
        //console.log('Message saved to history:', chatHistory); // 添加日志

    });
}

// 工具函数：加载历史记录
function loadHistory() {
  setTimeout(() => {
      chrome.storage.local.get(['chatHistory'], (result) => {
          const chatHistory = result.chatHistory || [];
          chatHistory.forEach((message) => {
              addMessage(message.role, `${message.role}: ${message.content}`);
          });
      });
  }, 500); // 延迟 500ms
}

// 监听存储变化（保留选中文本填充功能）
chrome.storage.local.get(['selectedText'], ({ selectedText }) => {
    if (selectedText) {
        const input = document.getElementById('user-input');
        input.value = selectedText;
        chrome.storage.local.remove('selectedText');
    }
});

// 添加清除历史记录的按钮
document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

function clearHistory() {
    chrome.storage.local.remove('chatHistory', () => {
        console.log('历史记录已清除');
        // 清空聊天界面
        const history = document.getElementById('chat-history');
        history.innerHTML = '';
    });
}

