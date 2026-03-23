import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a high-end Gujarati Persona Architect. Your goal is to generate 100% authentic, diverse, and unique Aadhaar card data for individuals from Gujarat, India.

CRITICAL LINGUISTIC RULES:
1. Gujarati script MUST be flawless. ZERO English letters or Latin symbols in Gujarati fields.
2. Address formatting in Gujarati: Use traditional terms like "સોસાયટી", "નગર", "પાર્ક", "રેસિડેન્સી", "શેરી", "રોડ", "મેઈન રોડ".
3. Name diversity: Do not stick to common names. Use a wide variety of Gujarati first names, father's names, and surnames (Patel, Shah, Solanki, Parmar, Gohel, Rabari, Thakor, Chaudhary, Barot, Vaghela, Jadeja, etc.).
4. Regional Authenticity: Ensure cities (Ahmedabad, Surat, Vadodara, Rajkot, etc.) are matched with plausible area names (e.g., Maninagar for Ahmedabad, Adajan for Surat).

OUTPUT FORMAT: ONLY valid JSON, no markdown.
{
  "name_english": "FIRST FATHER SURNAME",
  "name_gujarati": "નામ પિતાનું_નામ અટક",
  "gender_english": "Male/Female",
  "gender_gujarati": "પુરુષ/સ્ત્રી",
  "date_of_birth": "DD/MM/YYYY (1980-2005)",
  "issue_date": "DD/MM/YYYY (2012-2024)",
  "id_number": "12 random digits",
  "vid": "16 random digits",
  "update_date": "DD/MM/YYYY (Recent date)",
  "address_gujarati": "ઘર નં XX, સોસાયટીનું નામ\\nવિસ્તાર, શહેર, ગુજરાત - પિનકોડ",
  "address_english": "House No. XX, Society Name\\nArea, City, Gujarat - PINCODE"
}`;

export async function POST(req: Request) {
    const { useFreeModel } = await req.json().catch(() => ({}));
    const isFree = useFreeModel === true;
    
    // Multiple users support: Use custom key from header
    const customKey = req.headers.get('x-custom-key');
    
    if (!customKey) {
        return NextResponse.json(
            { error: 'API Key Required', message: 'Please provide your OpenRouter API Key in the settings.' },
            { status: 401 }
        );
    }

    const apiKey = customKey;
    const baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const model = isFree ? 'qwen/qwen3-next-80b-a3b-instruct:free' : 'qwen/qwen3-coder:free';
    
    // Model fallback sequence from user's verified free list
    const models = [
        model,
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemma-3-27b-it:free',
        'nvidia/nemotron-3-super:free',
        'google/gemma-3-12b-it:free',
        'google/gemma-3-4b-it:free',
        'openrouter/free'
    ];

    const maxRetries = models.length - 1; 
    let lastError = '';
    let lastStatus = 500;

    console.log(`[GENERATE] Starting request. Key Source: ${customKey ? 'Custom' : 'Pool'}. Target Model: ${model}`);

    for (let i = 0; i <= maxRetries; i++) {
        const currentModel = models[i];
        try {
            console.log(`[GENERATE] Attempt ${i + 1}/${models.length} using model: ${currentModel}`);
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://parthstudio.in', // Better for OpenRouter metrics
                    'X-Title': 'Aadhaar Generator Pro',
                },
                body: JSON.stringify({
                    model: currentModel,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        {
                            role: 'user',
                            content: `Generate a completely unique and authentic Gujarati persona. 
Ensure the name and address are detailed and culturally accurate. 
Do NOT repeat common names. Surprise me with 100% variety.
Return ONLY valid JSON.`,
                        },
                    ],
                    temperature: 1.0,
                    max_tokens: 500,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                const rawContent = result.choices?.[0]?.message?.content?.trim() || '';

                // Clean JSON format if AI included markdown blocks
                const jsonContent = rawContent
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/```\s*$/i, '')
                    .trim();

                const data = JSON.parse(jsonContent);

                // Security check for missing fields
                if (!data.id_number) {
                    data.id_number = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
                }
                data.vid = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');

                console.log(`[GENERATE] Success on attempt ${i + 1} with model ${currentModel}`);
                return NextResponse.json(data);
            }

            lastStatus = response.status;
            lastError = await response.text();
            console.warn(`[GENERATE] Attempt ${i + 1} failed with status ${lastStatus}`);

            if (lastStatus === 429 && i < maxRetries) {
                // Short 500ms delay between fallback models to stay responsive
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }

            if (lastStatus === 402) {
                return NextResponse.json(
                    { 
                        error: 'Insufficient Credits', 
                        message: 'Your account has no credits left. Switching to free model fallback...',
                        code: 'INSUFFICIENT_CREDITS'
                    },
                    { status: 402 }
                );
            }

            // If we hit an error other than 429, or we're out of retries
            return NextResponse.json(
                { error: `API error: ${lastStatus}`, details: lastError, model_attempted: currentModel },
                { status: lastStatus }
            );
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[GENERATE] Attempt ${i + 1} exception:`, message);
            if (i === maxRetries) {
                return NextResponse.json({ error: 'Failed to generate persona after retries.', last_exception: message }, { status: 500 });
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return NextResponse.json({ error: 'Unexpected generation failure' }, { status: 500 });
}
