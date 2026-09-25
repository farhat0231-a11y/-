import { GoogleGenAI } from '@google/genai';
import { suggestObjectivesSmart } from '../src/utils/qmjFallbackGenerator';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subject, grade, topic } = req.body || {};

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `ҚР Оқу-ағарту министрлігінің типтік оқу бағдарламасына сай мына пән мен сынып үшін 4-5 оқу мақсатын (тиісті ресми кодымен, мысалы "7.1.2.1 ...") ұсыныңыз:
Пән: ${subject}
Сынып: ${grade}
Тақырып: ${topic || 'Негізгі тақырыптар'}

JSON форматында қайтарыңыз:
[
  { "code": "7.1.2.1", "text": "Оқу мақсатының толық сипаттамасы" }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const list = JSON.parse(response.text?.trim() || '[]');
      return res.status(200).json({ suggestions: list });
    } catch (e) {
      console.warn('Gemini suggest objectives failed, falling back to smart curriculum:', e);
    }
  }

  const suggestions = suggestObjectivesSmart(subject || 'Жалпы пән', grade || '7', topic || '');
  return res.status(200).json({ suggestions });
}
