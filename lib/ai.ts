import { getSetting } from './settings';

interface GenerateSummaryOptions {
    title: string;
    content: string;
}

export async function generateSummary({title, content}: GenerateSummaryOptions): Promise<string> {
    const apiKey = await getSetting('deepseek_api_key') || process.env.DEEPSEEK_API_KEY;
    const apiUrl = await getSetting('deepseek_api_url') || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

    if (!apiKey) {
        console.warn('DEEPSEEK_API_KEY not configured, returning empty summary');
        return '';
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                extra_body: {"thinking": {"type": "disabled"}},
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的文章摘要生成助手。请根据文章标题和内容，生成一段简洁、准确的摘要（100字以内）。直接返回摘要内容，不要添加任何前缀或说明。'
                    },
                    {
                        role: 'user',
                        content: `标题：${title}\n\n内容：\n${content.slice(0, 3000)}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API error:', errorText);
            return '';
        }

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content?.trim();

        return summary || '';
    } catch (error) {
        console.error('Failed to generate summary:', error);
        return '';
    }
}
