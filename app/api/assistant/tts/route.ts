import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

export async function POST(request: NextRequest) {
  const apiKey = await getSetting('assistant_tts_api_key');
  const apiUrl = await getSetting('assistant_tts_api_url');
  const model = await getSetting('assistant_tts_model');
  const enabled = await getSetting('assistant_enabled');

  if (enabled !== 'true') {
    return NextResponse.json({ error: 'AI助手未启用', status: 403 });
  }

  if (!apiKey || !apiUrl) {
    return NextResponse.json({ error: 'TTS未配置', status: 503 });
  }

  const { text } = await request.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text 参数必填', status: 400 });
  }

  const endpoint = apiUrl.endsWith('/chat/completions')
    ? apiUrl
    : apiUrl.replace(/\/+$/, '') + '/v1/chat/completions';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'tts-1',
        messages: [
          {
            role: 'user',
            content: '请用自然、友好的语气朗读以下内容，直接输出即可，不要添加任何额外文字。',
          },
          {
            role: 'assistant',
            content: text,
          },
        ],
        audio: {
          format: 'wav',
          voice: '冰糖',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error:', response.status, errorText);
      return NextResponse.json({ error: `TTS API 错误: ${response.status}`, status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('audio') || contentType.includes('octet-stream')) {
      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // JSON response — extract audio data if present
    const data = await response.json();

    // mimo TTS returns audio as base64 in choices[0].message.audio.data
    const audioData = data.choices?.[0]?.message?.audio?.data;
    if (audioData) {
      const buffer = Buffer.from(audioData, 'base64');
      const audioFormat = data.choices[0].message.audio.format || 'wav';
      return new Response(buffer, {
        headers: {
          'Content-Type': `audio/${audioFormat}`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Fallback: return URL if present
    if (data.audioUrl || data.url) {
      return NextResponse.json(data);
    }

    console.error('TTS API returned no audio data:', JSON.stringify(data).slice(0, 200));
    return NextResponse.json({ error: 'TTS API 未返回音频数据' }, { status: 500 });
  } catch (error) {
    console.error('TTS request failed:', error);
    return NextResponse.json({ error: 'TTS请求失败' }, { status: 500 });
  }
}