import type { Message } from '../types/chat';

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream: boolean;
}
//异步生成器函数，用于流式获取聊天完成结果
export async function* streamCompletion(messages: Message[]) {
  if (!API_KEY) {
    throw new Error('API Key is missing. Please check .env file.');
  }

  //将内部消息格式转换为API消息格式
  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  // 发送POST请求到API
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    // 构建请求体
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: apiMessages,
      stream: true
    })
  });

  console.log(response);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status} ${JSON.stringify(error)}`);
  }
  //获取响应体的读取器
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');
   // 创建文本解码器
  const decoder = new TextDecoder('utf-8');
  // 用于存储部分完成的行
  let buffer = '';

  while (true) {
    // 读取响应体的下一个数据块
    const { done, value } = await reader.read();
    if (done) break;
    // 解码数据块并添加到缓冲区
    buffer += decoder.decode(value, { stream: true });
    // 按行分割缓冲区
    const lines = buffer.split('\n');
    // 移除最后一行（可能不完整）
    buffer = lines.pop() || '';

    for (const line of lines) {
      // 跳过空行或包含[DONE]的行
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

      if (trimmedLine.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmedLine.slice(6));
          const content = json.choices[0]?.delta?.content || '';
          if (content) {
            yield content;
          }
        } catch (e) {
          console.error('Error parsing stream chunk', e);
        }
      }
    }
  }
}
