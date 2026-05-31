import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

export async function GET() {
  const enabled = await getSetting('assistant_enabled');
  const llmApiKey = await getSetting('assistant_llm_api_key');
  const llmApiUrl = await getSetting('assistant_llm_api_url');
  const ttsApiKey = await getSetting('assistant_tts_api_key');
  const ttsApiUrl = await getSetting('assistant_tts_api_url');

  return NextResponse.json({
    enabled: enabled === 'true' && !!llmApiKey && !!llmApiUrl,
    ttsAvailable: !!ttsApiKey && !!ttsApiUrl,
  });
}