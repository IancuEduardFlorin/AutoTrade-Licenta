import Groq from 'groq-sdk';
import db from '../config/db.js';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const callGroq = async (prompt, temperature = 0.7) => {
    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature,
        max_tokens: 1000,
    });
    return completion.choices[0].message.content.trim();
};

export const genereazaDescriere = async (req, res) => {
    try {
        const { marca, model: modelMasina, an, kilometraj, motorizare, transmisie, putere, tractiune, caroserie } = req.body;

        const prompt = `Write a detailed, professional and attractive car listing description in English for this car:
Brand: ${marca}
Model: ${modelMasina}
Year: ${an}
Mileage: ${kilometraj} km
Engine: ${motorizare}
Transmission: ${transmisie}
Power: ${putere} HP
Traction: ${tractiune}
Body type: ${caroserie}

Write 5-7 sentences. Include:
1. A strong opening highlighting the car's appeal
2. Key technical highlights and what makes this engine/model special
3. Practical benefits for the buyer (reliability, fuel economy, comfort)
4. Any well-known strengths of this specific model
5. A closing sentence encouraging the buyer to contact

Be specific and informative. Do not invent mileage or price details not provided.`;

        const descriere = await callGroq(prompt, 0.8);
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

        const text = await callGroq(prompt, 0.1);
        const cleaned = text.replace(/```json|```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { isSpam: false, confidence: 0, reason: 'Could not analyze' };
        }

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

Rules:
- Be very permissive, extract whatever you can
- "hp" or "HP" or "horsepower" = putere as number
- "km" = kilometraj as number
- "euro" or "€" or "$" = pret as number
- "automatic" = transmisie "automata"
- "manual" = transmisie "manuala"
- "awd" or "4x4" = tractiune "AWD"
- "fwd" = tractiune "FWD"
- "rwd" = tractiune "RWD"
- "SUV" = caroserie "Off-road/SUV"
- "Spyder" or "spider" or "coupe" = caroserie "Sports car/Coupe"
- Generate a short title from brand + model + year

Return ONLY this JSON with no other text before or after it:
{"marca":null,"model":null,"an":null,"kilometraj":null,"motorizare":null,"transmisie":null,"putere":null,"tractiune":null,"caroserie":null,"capacitate_cilindrica":null,"pret":null,"titlu":null}

Replace null values with extracted data where possible.`;

        const rawText = await callGroq(prompt, 0.1);
        console.log('Groq raw:', rawText);

        let parsed;
        const attempts = [
            rawText,
            rawText.replace(/```json|```/g, '').trim(),
            rawText.match(/\{[\s\S]*\}/)?.[0],
            rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1),
        ];

        for (const attempt of attempts) {
            if (!attempt) continue;
            try {
                parsed = JSON.parse(attempt);
                break;
            } catch { continue; }
        }

        if (!parsed) throw new Error('Could not parse JSON from response');

        res.json(parsed);
    } catch (error) {
        console.error('completeazaCampuri error:', error.message);
        res.status(500).json({ mesaj: 'AI service error', eroare: error.message });
    }
};

export const chatbot = async (req, res) => {
    try {
        const { mesaj } = req.body;

        const [anunturi] = await db.query(
            `SELECT id, titlu, marca, model, an, pret, kilometraj, motorizare,
                    transmisie, putere, tractiune, caroserie
             FROM anunturi
             ORDER BY creat_la DESC
                 LIMIT 50`
        );

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

        const raspuns = await callGroq(prompt, 0.7);

        const idsMatch = raspuns.match(/\[IDS:\s*([\d,\s]+)\]/);
        let recomandate = [];
        if (idsMatch) {
            const ids = idsMatch[1].split(',').map(id => parseInt(id.trim())).filter(Boolean);
            recomandate = anunturi.filter(a => ids.includes(a.id));
        }

        const raspunsCurat = raspuns.replace(/\[IDS:[\d,\s]+\]/, '').trim();
        res.json({ raspuns: raspunsCurat, recomandate });
    } catch (error) {
        console.error('chatbot error:', error.message);
        res.status(500).json({ mesaj: 'AI service error', eroare: error.message });
    }
};