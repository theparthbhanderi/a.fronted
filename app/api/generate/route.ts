import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert Gujarati translator generating Aadhaar card data.
Your Gujarati MUST be FLAWLESS — no English letters, no Latin symbols.

RULES:
1. address_gujarati = 100% ગુજરાતી script. ZERO English.
   "House No." = "ઘર નં" | "Flat" = "ફ્લેટ" | "Society" = "સોસાયટી"
   "Apartment" = "એપાર્ટમેન્ટ" | "Road" = "રોડ" | "Main Road" = "મેઈન રોડ"
   "Street" = "શેરી" | "Near" = "પાસે" | "Nagar" = "નગર" | "Park" = "પાર્ક"
   "Tower" = "ટાવર" | "Residency" = "રેસિડેન્સી"

2. CITY GUJARATI:
   Ahmedabad=અમદાવાદ | Surat=સુરત | Vadodara=વડોદરા | Rajkot=રાજકોટ
   Bhavnagar=ભાવનગર | Jamnagar=જામનગર | Gandhinagar=ગાંધીનગર
   Junagadh=જૂનાગઢ | Anand=આણંદ | Nadiad=નડિયાદ | Mehsana=મહેસાણા
   Morbi=મોરબી | Navsari=નવસારી | Bharuch=ભરૂચ | Vapi=વાપી
   Palanpur=પાલનપુર | Porbandar=પોરબંદર | Amreli=અમરેલી | Botad=બોટાદ

3. City address (use house no): "ઘર નં XX, SocietyGuj, AreaGuj, CityGuj, ગુજરાત - PIN"
   Village address (use father): "નો પુત્ર: FatherGuj, VillageGuj, CityGuj, ગુજરાત - PIN"

4. DATES: DD/MM/YYYY | DOB: 1980-2005 | Issue: 2012-2024
5. ID: random 12 digits

OUTPUT: ONLY valid JSON, no markdown.
{"name_english":"...","name_gujarati":"...","gender_english":"...","gender_gujarati":"...","date_of_birth":"...","issue_date":"...","id_number":"...","address_gujarati":"...","address_english":"..."}`;

// ── Name Database ──
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const MALE: [string, string][] = [
    ['Ramesh', 'રમેશ'], ['Mahesh', 'મહેશ'], ['Nilesh', 'નિલેશ'], ['Hitesh', 'હિતેશ'],
    ['Jignesh', 'જીગ્નેશ'], ['Bhavesh', 'ભાવેશ'], ['Darshan', 'દર્શન'], ['Krunal', 'કૃણાલ'],
    ['Chirag', 'ચિરાગ'], ['Tushar', 'તુષાર'], ['Hardik', 'હાર્દિક'], ['Vishal', 'વિશાલ'],
    ['Gaurav', 'ગૌરવ'], ['Pratik', 'પ્રતિક'], ['Kamlesh', 'કમલેશ'], ['Alpesh', 'અલ્પેશ'],
    ['Dinesh', 'દિનેશ'], ['Sunil', 'સુનિલ'], ['Harsh', 'હર્ષ'], ['Ronak', 'રોનક'],
    ['Sagar', 'સાગર'], ['Mehul', 'મેહુલ'], ['Viral', 'વિરલ'], ['Jayesh', 'જયેશ'],
    ['Parth', 'પાર્થ'], ['Dhaval', 'ધવલ'], ['Vivek', 'વિવેક'], ['Ashish', 'આશીષ'],
    ['Rakesh', 'રાકેશ'], ['Manish', 'મનીષ'], ['Deepak', 'દીપક'], ['Brijesh', 'બ્રિજેશ'],
    ['Naresh', 'નરેશ'], ['Paresh', 'પરેશ'], ['Anil', 'અનિલ'], ['Vimal', 'વિમલ'],
    ['Keval', 'કેવલ'], ['Mitesh', 'મિતેશ'], ['Jigar', 'જીગર'], ['Hiren', 'હિરેન'],
    ['Ketan', 'કેતન'], ['Nayan', 'નયન'], ['Nikunj', 'નિકુંજ'], ['Hemant', 'હેમંત'],
    ['Pankaj', 'પંકજ'], ['Sandip', 'સંદીપ'], ['Yogesh', 'યોગેશ'], ['Umesh', 'ઉમેશ'],
    ['Rajesh', 'રાજેશ'], ['Mukesh', 'મુકેશ'], ['Lokesh', 'લોકેશ'], ['Bharat', 'ભરત'],
    ['Vijay', 'વિજય'], ['Ajay', 'અજય'], ['Sanjay', 'સંજય'], ['Kiran', 'કિરણ'],
    ['Tejas', 'તેજસ'], ['Maulik', 'મૌલિક'], ['Ravi', 'રવિ'], ['Haresh', 'હરેશ'],
    ['Vinod', 'વિનોદ'], ['Praful', 'પ્રફુલ'], ['Dharmesh', 'ધર્મેશ'], ['Ritesh', 'રિતેશ'],
    ['Nirav', 'નિરવ'], ['Ankur', 'અંકુર'], ['Kunal', 'કુનાલ'], ['Yash', 'યશ'],
    ['Kartik', 'કાર્તિક'], ['Arjun', 'અર્જુન'], ['Dev', 'દેવ'], ['Sahil', 'સાહિલ'],
    ['Mohit', 'મોહિત'], ['Nimesh', 'નિમેશ'], ['Piyush', 'પિયૂષ'], ['Lalit', 'લલીત'],
    ['Ghanshyam', 'ઘનશ્યામ'], ['Govind', 'ગોવિંદ'], ['Kishan', 'કિશન'], ['Viren', 'વિરેન'],
    ['Tarun', 'તરુણ'], ['Chetan', 'ચેતન'], ['Bhavin', 'ભાવિન'], ['Milan', 'મિલન'],
    ['Varun', 'વરુણ'], ['Akash', 'આકાશ'], ['Rahul', 'રાહુલ'], ['Amit', 'અમિત'],
];

const FEMALE: [string, string][] = [
    ['Priya', 'પ્રિયા'], ['Meera', 'મીરા'], ['Bhavna', 'ભાવના'], ['Hetal', 'હેતલ'],
    ['Komal', 'કોમલ'], ['Nisha', 'નિશા'], ['Swati', 'સ્વાતિ'], ['Pooja', 'પૂજા'],
    ['Kruti', 'કૃતિ'], ['Riya', 'રિયા'], ['Disha', 'દિશા'], ['Jinal', 'જીનલ'],
    ['Tanvi', 'તન્વી'], ['Urvi', 'ઉર્વિ'], ['Vaishali', 'વૈશાલી'], ['Kajal', 'કાજલ'],
    ['Neha', 'નેહા'], ['Mansi', 'માનસી'], ['Darshana', 'દર્શના'], ['Rekha', 'રેખા'],
    ['Sonal', 'સોનલ'], ['Pallavi', 'પલ્લવી'], ['Tulsi', 'તુલસી'], ['Divya', 'દિવ્યા'],
    ['Mital', 'મિતલ'], ['Nidhi', 'નિધિ'], ['Payal', 'પાયલ'], ['Sneha', 'સ્નેહા'],
    ['Jyoti', 'જ્યોતિ'], ['Aarti', 'આરતી'], ['Kinjal', 'કિંજલ'], ['Falguni', 'ફાલ્ગુની'],
    ['Bhumika', 'ભૂમિકા'], ['Charmi', 'ચાર્મિ'], ['Dhara', 'ધારા'], ['Hansa', 'હંસા'],
    ['Ila', 'ઈલા'], ['Pushpa', 'પુષ્પા'], ['Jagruti', 'જાગૃતિ'], ['Ankita', 'અંકિતા'],
];

const FATHERS: [string, string][] = [
    ['Haribhai', 'હરિભાઈ'], ['Kantibhai', 'કાંતીભાઈ'], ['Vinodbhai', 'વિનોદભાઈ'],
    ['Rameshbhai', 'રમેશભાઈ'], ['Manubhai', 'મનુભાઈ'], ['Govindbhai', 'ગોવિંદભાઈ'],
    ['Bhikhabhai', 'ભીખાભાઈ'], ['Kalubhai', 'કાળુભાઈ'], ['Shankarbhai', 'શંકરભાઈ'],
    ['Dahyabhai', 'દાહ્યાભાઈ'], ['Chhaganbhai', 'છગનભાઈ'], ['Jethabhai', 'જેઠાભાઈ'],
    ['Laxmanbhai', 'લક્ષ્મણભાઈ'], ['Gordhanbhai', 'ગોરધનભાઈ'], ['Amrutbhai', 'અમૃતભાઈ'],
    ['Natubhai', 'નાથુભાઈ'], ['Bhagvanbhai', 'ભગવાનભાઈ'], ['Ishwarbhai', 'ઈશ્વરભાઈ'],
    ['Devjibhai', 'દેવજીભાઈ'], ['Somabhai', 'સોમાભાઈ'], ['Motibhai', 'મોતીભાઈ'],
    ['Pravinbhai', 'પ્રવિણભાઈ'], ['Jayantibhai', 'જયંતીભાઈ'], ['Babubhai', 'બાબુભાઈ'],
    ['Naranbhai', 'નારણભાઈ'], ['Veljibhai', 'વેલજીભાઈ'], ['Tribhovanbhai', 'ત્રિભોવનભાઈ'],
    ['Ranchhodbhai', 'રણછોડભાઈ'], ['Parsottambhai', 'પરસોત્તમભાઈ'], ['Arjunbhai', 'અર્જુનભાઈ'],
    ['Dineshbhai', 'દિનેશભાઈ'], ['Sureshbhai', 'સુરેશભાઈ'], ['Nareshbhai', 'નરેશભાઈ'],
    ['Maheshbhai', 'મહેશભાઈ'], ['Rajeshbhai', 'રાજેશભાઈ'], ['Mukeshbhai', 'મુકેશભાઈ'],
    ['Jagdishbhai', 'જગદીશભાઈ'], ['Valjibhai', 'વાલજીભાઈ'], ['Premjibhai', 'પ્રેમજીભાઈ'],
    ['Batukbhai', 'બટુકભાઈ'], ['Dalpatbhai', 'દલપતભાઈ'], ['Karshanbhai', 'કરશનભાઈ'],
    ['Maganbhai', 'મગનભાઈ'], ['Lakhabhai', 'લાખાભાઈ'], ['Jivanbhai', 'જીવનભાઈ'],
    ['Keshavbhai', 'કેશવભાઈ'], ['Chaturbhai', 'ચતુરભાઈ'], ['Popatabhai', 'પોપટભાઈ'],
    ['Revabhai', 'રેવાભાઈ'], ['Ukabhai', 'ઉકાભાઈ'], ['Hirabhai', 'હીરાભાઈ'],
];

const SURNAMES: [string, string][] = [
    ['Patel', 'પટેલ'], ['Shah', 'શાહ'], ['Solanki', 'સોલંકી'], ['Parmar', 'પરમાર'],
    ['Gohel', 'ગોહેલ'], ['Rabari', 'રબારી'], ['Thakor', 'ઠાકોર'], ['Chaudhary', 'ચૌધરી'],
    ['Barot', 'બારોટ'], ['Vaghela', 'વાઘેલા'], ['Jadeja', 'જાડેજા'], ['Makwana', 'મકવાણા'],
    ['Rathod', 'રાઠોડ'], ['Chauhan', 'ચૌહાણ'], ['Savaliya', 'સાવલિયા'], ['Dobariya', 'ડોબરિયા'],
    ['Bhanderi', 'ભંડેરી'], ['Hirpara', 'હિરપરા'], ['Faldu', 'ફાલ્દુ'], ['Gajera', 'ગજેરા'],
    ['Savani', 'સાવણી'], ['Kanani', 'કાનાણી'], ['Dudhat', 'દુધાત'], ['Khunt', 'ખુંટ'],
    ['Kanzariya', 'કાંઝરિયા'], ['Bavadiya', 'બાવડિયા'], ['Sarvaiya', 'સરવૈયા'], ['Vataliya', 'વાતળિયા'],
    ['Bhatt', 'ભટ્ટ'], ['Joshi', 'જોશી'], ['Pandya', 'પંડ્યા'], ['Raval', 'રાવલ'],
    ['Desai', 'દેસાઈ'], ['Modi', 'મોદી'], ['Mehta', 'મહેતા'], ['Trivedi', 'ત્રિવેદી'],
    ['Dave', 'દવે'], ['Oza', 'ઓઝા'], ['Thakkar', 'ઠક્કર'], ['Vyas', 'વ્યાસ'],
    ['Darji', 'દરજી'], ['Suthar', 'સુથાર'], ['Luhar', 'લુહાર'], ['Vankar', 'વણકર'],
    ['Prajapati', 'પ્રજાપતિ'], ['Soni', 'સોની'], ['Mistry', 'મિસ્ત્રી'], ['Kumbhar', 'કુંભાર'],
    ['Vaghasiya', 'વાઘાસિયા'], ['Boghara', 'બોઘરા'], ['Virani', 'વિરાણી'],
    ['Rangani', 'રંગાણી'], ['Hadiya', 'હાડિયા'], ['Nakum', 'નકુમ'],
    ['Gadhavi', 'ગઢવી'], ['Chavda', 'ચાવડા'], ['Dabhi', 'ડાભી'],
];

export async function POST() {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'OPENROUTER_API_KEY is not set in environment variables' },
            { status: 500 }
        );
    }

    // ── Server-side random selection (guaranteed unique every time) ──
    const isMale = Math.random() > 0.3;
    const firstName = isMale ? pick(MALE) : pick(FEMALE);
    const father = pick(FATHERS);
    const surname = pick(SURNAMES);

    const nameEn = `${firstName[0]} ${father[0]} ${surname[0]}`;
    const nameGu = `${firstName[1]} ${father[1]} ${surname[1]}`;
    const genderEn = isMale ? 'Male' : 'Female';
    const genderGu = isMale ? 'પુરુષ' : 'સ્ત્રી';

    // ── Pre-pick address components ──
    const SOCIETIES: [string, string][] = [
        ['Shanti Nagar Society', 'શાંતિ નગર સોસાયટી'],
        ['Sardar Patel Society', 'સરદાર પટેલ સોસાયટી'],
        ['Narmada Society', 'નર્મદા સોસાયટી'],
        ['Swaminarayan Society', 'સ્વામિનારાયણ સોસાયટી'],
        ['Krishna Nagar Society', 'કૃષ્ણ નગર સોસાયટી'],
        ['Gokul Dham Society', 'ગોકુલ ધામ સોસાયટી'],
        ['Akshar Dham Society', 'અક્ષર ધામ સોસાયટી'],
        ['Mangal Murti Society', 'મંગલ મૂર્તિ સોસાયટી'],
        ['Jay Ambe Society', 'જય અંબે સોસાયટી'],
        ['Tulsi Society', 'તુલસી સોસાયટી'],
        ['Radha Krishna Society', 'રાધા કૃષ્ણ સોસાયટી'],
        ['Punit Nagar Society', 'પુનિત નગર સોસાયટી'],
        ['Aashirwad Society', 'આશીર્વાદ સોસાયટી'],
        ['Vrundavan Society', 'વૃંદાવન સોસાયટી'],
        ['Madhav Society', 'માધવ સોસાયટી'],
        ['Omkar Society', 'ઓમકાર સોસાયટી'],
        ['New India Society', 'ન્યૂ ઈન્ડિયા સોસાયટી'],
        ['Rajhans Society', 'રાજહંસ સોસાયટી'],
        ['Narayan Society', 'નારાયણ સોસાયટી'],
        ['Anand Society', 'આનંદ સોસાયટી'],
    ];
    const ROADS: [string, string][] = [
        ['Main Road', 'મેઈન રોડ'], ['Station Road', 'સ્ટેશન રોડ'],
        ['Highway Road', 'હાઈવે રોડ'], ['Ring Road', 'રીંગ રોડ'],
        ['College Road', 'કોલેજ રોડ'], ['Market Road', 'માર્કેટ રોડ'],
        ['Gandhi Road', 'ગાંધી રોડ'], ['Nehru Road', 'નહેરુ રોડ'],
    ];
    const AREAS: [string, string][] = [
        ['Maninagar', 'મણિનગર'], ['Navrangpura', 'નવરંગપુરા'],
        ['Satellite', 'સેટેલાઇટ'], ['Vastrapur', 'વસ્ત્રાપુર'],
        ['Bopal', 'બોપલ'], ['Gota', 'ગોતા'], ['Chandkheda', 'ચાંદખેડા'],
        ['Naroda', 'નરોડા'], ['Nikol', 'નિકોળ'], ['Vastral', 'વાસ્ત્રાલ'],
        ['Ranip', 'રાણીપ'], ['Thaltej', 'થલતેજ'], ['Paldi', 'પાલડી'],
        ['Shahibaug', 'શાહીબાગ'], ['Sabarmati', 'સાબરમતી'],
        ['Adajan', 'અડાજણ'], ['Vesu', 'વેસુ'], ['Katargam', 'કાતરગામ'],
        ['Alkapuri', 'અલકાપુરી'], ['Manjalpur', 'માંજલપુર'],
    ];
    const CITIES: [string, string][] = [
        ['Ahmedabad', 'અમદાવાદ'], ['Surat', 'સુરત'], ['Vadodara', 'વડોદરા'],
        ['Rajkot', 'રાજકોટ'], ['Bhavnagar', 'ભાવનગર'], ['Gandhinagar', 'ગાંધીનગર'],
        ['Jamnagar', 'જામનગર'], ['Junagadh', 'જૂનાગઢ'], ['Anand', 'આણંદ'],
        ['Nadiad', 'નડિયાદ'], ['Mehsana', 'મહેસાણા'], ['Navsari', 'નવસારી'],
    ];

    const society = pick(SOCIETIES);
    const road = pick(ROADS);
    const area = pick(AREAS);
    const city = pick(CITIES);
    const houseNo = Math.floor(Math.random() * 200) + 1;
    const pin = String(360001 + Math.floor(Math.random() * 40000));

    // Pre-build both addresses server-side for consistency
    const addrGu = `ઘર નં ${houseNo}, ${society[1]}\n${area[1]}, ${road[1]}\n${city[1]}, ગુજરાત - ${pin}`;
    const addrEn = `House No. ${houseNo}, ${society[0]}\n${area[0]}, ${road[0]}\n${city[0]}, Gujarat - ${pin}`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'KINGPARTH',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: `Use EXACTLY these values:
name_english: "${nameEn}"
name_gujarati: "${nameGu}"
gender_english: "${genderEn}"
gender_gujarati: "${genderGu}"
address_gujarati: "${addrGu.replace(/\n/g, '\\n')}"
address_english: "${addrEn.replace(/\n/g, '\\n')}"

Generate: date_of_birth (DD/MM/YYYY, 1980-2005), issue_date (DD/MM/YYYY, 2012-2024), id_number (12 random digits).
Use the EXACT address values given above. Do NOT modify them.
Return ONLY JSON.`,
                    },
                ],
                temperature: 1.0,
                top_p: 0.9,
                max_tokens: 400,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('OpenRouter API error:', err);
            return NextResponse.json(
                { error: 'OpenRouter API error: ' + response.status },
                { status: response.status }
            );
        }

        const result = await response.json();
        const raw: string = result.choices?.[0]?.message?.content?.trim() || '';

        const cleaned = raw
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        const data = JSON.parse(cleaned);

        // Force server-picked values (override anything AI changed)
        data.name_english = nameEn;
        data.name_gujarati = nameGu;
        data.gender_english = genderEn;
        data.gender_gujarati = genderGu;
        data.address_gujarati = addrGu;
        data.address_english = addrEn;

        // Generate truly random ID & VID server-side
        const randDigits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
        data.id_number = randDigits(12);
        data.vid = randDigits(16);

        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Generate API error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
