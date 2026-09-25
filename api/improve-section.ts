import { GoogleGenAI } from '@google/genai';
import { improveSectionSmart } from '../src/utils/qmjFallbackGenerator';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sectionType, currentContent, subject, topic, instruction } = req.body || {};

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Сіз Қазақстанның жетекші әдіскер-ұстазысыз.
Пән: ${subject || 'Жалпы пән'}
Сабақ тақырыбы: ${topic || 'Сабақ'}
Бөлім түрі: ${sectionType}
Қазіргі мәтін:
${currentContent}

Тапсырма: ${instruction || 'Осы бөлімді заманауи интерактивті әдістермен, нақты дескрипторлармен және сараланған тапсырмалармен толықтырып, жетілдіріп беріңіз.'}

Жауабыңызды тікелей жетілдірілген мәтін ретінде қазақ тілінде қайтарыңыз.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.status(200).json({ improvedText: response.text?.trim() || currentContent });
    } catch (e) {
      console.warn('Gemini improve section failed, falling back to smart local enhancer:', e);
    }
  }

  const improved = improveSectionSmart(
    sectionType || '',
    currentContent || '',
    subject || '',
    topic || '',
    instruction || ''
  );
  return res.status(200).json({ improvedText: improved });
}
