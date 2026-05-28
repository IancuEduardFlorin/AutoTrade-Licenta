const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const callGemini = async (prompt) => {
    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
};

export const genereazaDescriere = async (req, res) => {
    try {
        const { marca, model, an, kilometraj, motorizare, transmisie, putere, tractiune, caroserie } = req.body;

        const prompt = `Write a professional and attractive car listing description in English for:
Brand: ${marca}, Model: ${model}, Year: ${an}, Mileage: ${kilometraj} km,
Engine: ${motorizare}, Transmission: ${transmisie}, Power: ${putere} HP,
Traction: ${tractiune}, Body: ${caroserie}.
Write 3-4 sentences. Be honest, do not invent features.`;

        const descriere = await callGemini(prompt);
        res.json({ descriere });
    } catch (error) {
        console.error('genereazaDescriere error:', error.message);
        res.status(500).json({ mesaj: 'AI service error', eroare: error.message });
    }
};

export const detecteazaSpam = async (req, res) => {
    try {
        const { titlu, descriere } = req.body;

        const prompt = `Analyze this car listing for spam or fraud.
Title: ${titlu}
Description: ${descriere}
Respond ONLY with valid JSON, no markdown, no extra text:
{"isSpam": false, "confidence": 10, "reason": "looks legitimate"}`;

        const text = await callGemini(prompt);
        const cleaned = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (error) {
        console.error('detecteazaSpam error:', error.message);
        res.status(500).json({ mesaj: 'AI service error', eroare: error.message });
    }
};

export const completeazaCampuri = async (req, res) => {
    try {
        const { text } = req.body;

        const prompt = `Extract car details from this text: "${text}"
Respond ONLY with valid JSON, no markdown, no extra text:
{"marca":"value or null","model":"value or null","an":number or null,"kilometraj":number or null,"motorizare":"value or null","transmisie":"manuala or automata or null","putere":number or null,"tractiune":"FWD or RWD or AWD or null","caroserie":"Small car or Off-road/SUV or Limousine or Sports car/Coupe or Van/Minibus or Convertible/Roadster or Combination or Other or null","capacitate_cilindrica":"value like 1598cc or null","pret":number or null,"titlu":"Brand Model Year short title or null"}`;

        const rawText = await callGemini(prompt);
        console.log('Gemini response:', rawText);
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (error) {
        console.error('completeazaCampuri error:', error.message);
        res.status(500).json({ mesaj: 'AI service error', eroare: error.message });
    }
};
import db from '../config/db.js';

// Chatbot care recomanda anunturi
export const chatbot = async (req, res) => {
    try {
        const { mesaj } = req.body;

        // Luam toate anunturile din baza de date
        const [anunturi] = await db.query(
            `SELECT id, titlu, marca, model, an, pret, kilometraj, motorizare, 
              transmisie, putere, tractiune, caroserie 
       FROM anunturi 
       ORDER BY creat_la DESC 
       LIMIT 50`
        );

        // Construim un rezumat al anunturilor pentru AI
        const anunturiText = anunturi.map(a =>
            `ID:${a.id} | ${a.titlu} | ${a.marca} ${a.model} ${a.an} | ${a.pret}€ | ${a.kilometraj}km | ${a.motorizare || '-'} | ${a.transmisie || '-'} | ${a.putere || '-'}HP | ${a.caroserie || '-'}`
        ).join('\n');

        const prompt = `You are a helpful car marketplace assistant for AutoTrade. A user is looking for a car.

User message: "${mesaj}"

Available listings:
${anunturiText}

Based on the user's request, recommend the most relevant cars from the list above. 
Respond in a friendly, conversational way in English. 
Mention specific cars with their details and prices.
If you recommend specific listings, include their IDs in this exact format at the end: [IDS: 1,2,3]
If no cars match, suggest what they could look for instead.
Keep your response concise (max 4-5 sentences before the IDs).`;

        const raspuns = await callGemini(prompt);

        // Extragem ID-urile recomandate
        const idsMatch = raspuns.match(/\[IDS:\s*([\d,\s]+)\]/);
        let recomandate = [];
        if (idsMatch) {
            const ids = idsMatch[1].split(',').map(id => parseInt(id.trim())).filter(Boolean);
            recomandate = anunturi.filter(a => ids.includes(a.id));
        }

        // Curatam raspunsul de tag-ul cu ID-uri
        const raspunsCurat = raspuns.replace(/\[IDS:[\d,\s]+\]/, '').trim();

        res.json({ raspuns: raspunsCurat, recomandate });

    } catch (error) {
        console.error('chatbot error:', error.message);
        res.status(500).json({ mesaj: 'AI service error', eroare: error.message });
    }
};