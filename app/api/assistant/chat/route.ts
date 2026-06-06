import { NextRequest } from 'next/server';
import { getSetting } from '@/lib/settings';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

function isHeaderSafe(value: string): boolean {
  return /^[\x00-\xff]*$/.test(value);
}

export async function POST(request: NextRequest) {
  const apiKey = await getSetting('assistant_llm_api_key');
  const apiUrl = await getSetting('assistant_llm_api_url');
  const model = await getSetting('assistant_llm_model');
  const systemPrompt = await getSetting('assistant_system_prompt', '你是star和lemon的小站的AI助手，友好地回答访客的问题。');
  const enabled = await getSetting('assistant_enabled');

  if (enabled !== 'true') {
    return new Response('AI助手未启用', { status: 403 });
  }

  if (!apiKey || !apiUrl) {
    return new Response('AI助手未配置', { status: 503 });
  }

  const normalizedApiKey = apiKey.trim();

  if (!isHeaderSafe(normalizedApiKey)) {
    return new Response('LLM API Key 包含非法字符，请检查是否填入了中文、全角字符或占位文字', { status: 400 });
  }

  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response('messages 必须是数组', { status: 400 });
  }

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  // Normalize API URL: if it doesn't end with a chat completions path, append /v1/chat/completions
  const endpoint = apiUrl.endsWith('/chat/completions')
    ? apiUrl
    : apiUrl.replace(/\/+$/, '') + '/v1/chat/completions';

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${normalizedApiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-v4-flash',
        messages: apiMessages,
        stream: true,
      }),
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('Assistant LLM request failed:', message);
    return new Response(`LLM 请求失败: ${message}`, { status: 502 });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Assistant LLM API error:', response.status, errorText);
    return new Response(`LLM API 错误: ${response.status}`, { status: response.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.error(new Error('LLM API 未返回响应流'));
        return;
      }

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              if (delta) {
                const content = delta.content;
                const reasoning = delta.reasoning_content;
                if (content || reasoning) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: content || '', reasoning: reasoning || '' })}\n\n`));
                }
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
