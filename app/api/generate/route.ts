import { NextResponse } from 'next/server';

// ── Advanced Prompt ──
const SYSTEM_PROMPT = `You are an expert Gujarati persona generator.
Your goal is to generate HIGHLY UNIQUE and authentic-looking data for Aadhaar cards.

GUIDELINES:
1. Variety: Use a wide range of common and rare Gujarati names and surnames. Do NOT repeat Ramesh Patel.
2. Dialects/Regions: Consider names from different regions like Saurashtra (Rajkot, Jamnagar), North Gujarat (Mehsana, Patan), and South Gujarat (Surat, Valsad).
3. Language: Gujarati MUST be 100% accurate. ZERO English/Latin characters in Gujarati fields.
4. Addresses: Generate realistic addresses for both Urban (Societies/Apartments/Main Roads) and Rural (Villages/Faldas). 
   - Urban example: "ઘર નં ૧૨૩, સુમેરુ સોસાયટી, નવરંગપુરા, અમદાવાદ, ગુજરાત - ૩૮૦૦૦૯"
   - Rural example: "મુ. પો. મોટા વરાછા, તા. ચોર્યાસી, જિ. સુરત, ગુજરાત - ૩૯૪૧૦૧"
5. Gender: Use a mix of Male and Female profiles.
6. DOB: Generate DOB between 1970 and 2005.
7. Issue Date: Generate issue_date between 2012 and 2024. Issue date must be at least 15 years after DOB.

OUTPUT FORMAT (Strict JSON):
{
  "name_english": "First Middle Last",
  "name_gujarati": "પ્રથમ પિતાનું અટક",
  "gender_english": "Male/Female",
  "gender_gujarati": "પુરુષ/સ્ત્રી",
  "date_of_birth": "DD/MM/YYYY",
  "issue_date": "DD/MM/YYYY",
  "id_number": "123456789012", (12 random digits)
  "address_gujarati": "Full address in Gujarati",
  "address_english": "Full address in English"
}
`;

async function callAI(provider: any, messages: any) {
    const urls: Record<string, string> = {
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        aiml: 'https://api.aimlapi.com/v1/chat/completions'
    };
    const url = urls[provider.name as keyof typeof urls];

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`
    };
    
    if (provider.name === 'openrouter') {
        headers['HTTP-Referer'] = 'http://localhost:3001';
        headers['X-Title'] = 'KINGPARTH';
    }

    const response = await fetch(url as string, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: provider.model,
            messages,
            temperature: 1.0,
            max_tokens: 800,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`${provider.name} failed with status ${response.status}`);
    }
    return response.json();
}

export async function POST(req: Request) {
    const { useAdvancedMode } = await req.json().catch(() => ({}));
    
    // Priority list of providers
    const providers = [
        { name: 'groq', key: process.env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile' },
        { name: 'openrouter', key: process.env.OPENROUTER_API_KEY, model: 'qwen/qwen3-next-80b-a3b-instruct:free' },
        { name: 'aiml', key: process.env.AIML_API_KEY, model: 'google/gemini-2.0-flash-lite-preview-02-05:free' }
    ].filter(p => p.key);

    if (providers.length === 0) {
        return NextResponse.json(
            { error: 'No AI providers (Groq, OpenRouter, or AIML) are configured in .env' },
            { status: 500 }
        );
    }

    let lastError = '';
    
    for (const provider of providers) {
        try {
            const messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Generate a random, realistic Gujarati Aadhaar persona. 
                  Ensure the name and address are detailed and culturally natural. 
                  Return ONLY JSON.` }
            ];

            const result = await callAI(provider, messages);
            const raw: string = result.choices?.[0]?.message?.content?.trim() || '';

            const cleaned = raw
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim();

            const data = JSON.parse(cleaned);

            // Generate truly random ID & VID server-side for absolute consistency
            const randDigits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
            data.id_number = randDigits(12);
            data.vid = randDigits(16);

            return NextResponse.json(data);
        } catch (error: any) {
            console.error(`Provider ${provider.name} failed:`, error.message);
            lastError = error.message;
            // Continue to next provider...
        }
    }

    return NextResponse.json({ error: 'All AI providers failed: ' + lastError }, { status: 500 });
}
