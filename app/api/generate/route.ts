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
    
    // Both models are now on OpenRouter/AIML, but we prioritize the user's requested Qwen 3 for "free" mode
    const apiKey = isFree ? process.env.OPENROUTER_API_KEY : process.env.AIML_API_KEY;
    const baseUrl = isFree ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.aimlapi.com/v1/chat/completions';
    const model = isFree ? 'qwen/qwen3-next-80b-a3b-instruct:free' : 'gemini-2.0-flash-lite';

    if (!apiKey) {
        return NextResponse.json(
            { error: `${isFree ? 'OPENROUTER_API_KEY' : 'AIML_API_KEY'} is not set in environment variables` },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Aadhaar Generator Pro',
            },
            body: JSON.stringify({
                model: model,
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

        if (!response.ok) {
            const err = await response.text();
            console.error('API error:', err);
            
            if (response.status === 402) {
                return NextResponse.json(
                    { 
                        error: 'Insufficient Credits', 
                        message: 'Your account has no credits left. Switching to free model fallback...',
                        code: 'INSUFFICIENT_CREDITS'
                    },
                    { status: 402 }
                );
            }

            return NextResponse.json(
                { error: 'API error: ' + response.status },
                { status: response.status }
            );
        }

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

        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Generate API error:', message);
        return NextResponse.json({ error: 'Failed to generate persona. Please try again.' }, { status: 500 });
    }
}
