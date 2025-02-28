// 发送消息（保留原有监听逻辑）
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const text =  userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';

    try {
      // 直接使用固定API Key（需自行替换为真实值）
      const apiKey = "sk-xxxxxx"; 

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            {
              role: "system",
              content: `
              **角色设定**  
              你是一名乐于助人的帮手。
              `
            },
            { role: "user", content: text }
          ],
          stream: false,
        } )
      };
      
      // 修复点：使用 await 统一处理异步请求
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options);
      const data = await response.json();  // 正确的作用域访问
      
      // 修复点：根据实际API响应结构调整字段
      const reply2 = data.choices[0].message.content;  // 典型OpenAI格式响应路径
      //addMessage('assistant', reply);

    //const reply = data.output?.text || data.message;
      addMessage('assistant', "assistant: " + reply2);
      //addMessage('assistant', reply);
    } catch (error) {
      addMessage('system', `错误: ${error.message}`);
    }
}

// 工具函数保持不变
function addMessage(role, content) {
    const history = document.getElementById('chat-history');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = content;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

// 监听存储变化（保留选中文本填充功能）
chrome.storage.local.get(['selectedText'], ({ selectedText }) => {
    if (selectedText) {
      const input = document.getElementById('user-input');
      input.value = selectedText;
      chrome.storage.local.remove('selectedText');
    }
});


