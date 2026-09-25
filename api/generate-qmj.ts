import { GoogleGenAI, Type } from '@google/genai';
import { generateSmartQMJPlan } from '../src/utils/qmjFallbackGenerator';

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    subject,
    grade,
    lessonTopic,
    section,
    learningObjectives,
    teacherName,
    schoolName,
    lessonType,
    selectedMethods,
    valuesTheme,
    hasInclusiveSupport,
    extraPrompt,
  } = req.body || {};

  if (!subject || !lessonTopic) {
    return res.status(400).json({ error: 'Пән мен сабақ тақырыбы міндетті түрде толтырылуы қажет.' });
  }

  // If Gemini API Key is available, use Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const systemInstruction = `Сіз – Қазақстан Республикасы Оқу-ағарту министрлігінің мемлекеттік жалпыға міндетті білім беру стандартын (МЖМБС), жаңартылған білім мазмұнын және «Біртұтас тәрбие» бағдарламасын терең меңгерген тәжірибелі әдіскер-педагогсіз.
Сіздің міндетіңіз – мұғалімге ҚР Оқу-ағарту министрлігінің бекітілген типтік үлгісіне сай толыққанды, кәсіби, сапалы Қысқа мерзімді сабақ жоспарын (ҚМЖ) жасап беру.

Маңызды талаптар:
1. Тілі: Таза, академиялық қазақ тілі, педагогикалық терминологиясы сауатты.
2. «Сабақтың мақсаты» – нақты 1 бірыңғай сабақ мақсаты ретінде (үш деңгейге бөлмей, бір мақсат етіп) жазылады.
3. Сабақтың 3 негізгі кезеңі болуы шарт (Басы, Ортасы, Соңы) дескрипторларымен және ресурстарымен.`;

      const userPrompt = `Келесі мәліметтер бойынша ҚМЖ сабақ жоспарын әзірлеңіз:
- Пән: ${subject}
- Сынып: ${grade || '7'}
- Сабақтың тақырыбы: ${lessonTopic}
${section ? `- Бөлім: ${section}` : ''}
${learningObjectives ? `- Оқу бағдарламасына сәйкес оқу мақсаты: ${learningObjectives}` : '- Оқу мақсаты: осы сынып пен тақырыпқа лайықты ресми 4 санды кодын және толық мәтінін жазыңыз'}
${teacherName ? `- Педагог: ${teacherName}` : ''}
${schoolName ? `- Білім ұйымы: ${schoolName}` : ''}
${lessonType ? `- Сабақ түрі: ${lessonType}` : ''}
${selectedMethods?.length ? `- Қолданылатын әдіс-тәсілдер: ${selectedMethods.join(', ')}` : ''}
${valuesTheme ? `- Құндылық бағыты: ${valuesTheme}` : ''}
${hasInclusiveSupport ? `- Ерекше білімді қажет ететін (ЕББҚ) оқушылар үшін бейімделген тапсырмалар мен саралауды міндетті түрде қосыңыз.` : ''}
${extraPrompt ? `- Қосымша мұғалім тілегі: ${extraPrompt}` : ''}

Жауапты қатаң түрде JSON пішімінде қайтарыңыз.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              header: {
                type: Type.OBJECT,
                properties: {
                  schoolName: { type: Type.STRING },
                  section: { type: Type.STRING },
                  teacherName: { type: Type.STRING },
                  date: { type: Type.STRING },
                  grade: { type: Type.STRING },
                  attendeesCount: { type: Type.STRING },
                  absentCount: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  lessonTopic: { type: Type.STRING },
                  learningObjectives: { type: Type.STRING },
                  lessonObjectives: { type: Type.STRING, description: 'Сабақтың нақты 1 бірыңғай мақсаты' },
                  valuesOrientation: { type: Type.STRING },
                  lessonType: { type: Type.STRING },
                  pedagogicalMethods: { type: Type.STRING },
                },
                required: [
                  'subject',
                  'lessonTopic',
                  'learningObjectives',
                  'lessonObjectives',
                  'valuesOrientation',
                  'lessonType',
                  'pedagogicalMethods',
                ],
              },
              stages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stageName: { type: Type.STRING },
                    subStage: { type: Type.STRING },
                    teacherActivity: { type: Type.STRING },
                    studentActivity: { type: Type.STRING },
                    assessment: { type: Type.STRING },
                    resources: { type: Type.STRING },
                  },
                  required: ['stageName', 'subStage', 'teacherActivity', 'studentActivity', 'assessment', 'resources'],
                },
              },
              conclusion: {
                type: Type.OBJECT,
                properties: {
                  differentiation: { type: Type.STRING },
                  inclusiveSupport: { type: Type.STRING },
                  assessmentCriteria: { type: Type.STRING },
                  healthAndSafety: { type: Type.STRING },
                  reflection: { type: Type.STRING },
                },
                required: ['differentiation', 'assessmentCriteria', 'healthAndSafety', 'reflection'],
              },
            },
            required: ['title', 'header', 'stages', 'conclusion'],
          },
        },
      });

      const text = response.text?.trim() || '{}';
      const planData = JSON.parse(text);
      planData.id = `qmj-${Date.now()}`;
      planData.createdAt = new Date().toISOString().split('T')[0];
      if (planData.stages && Array.isArray(planData.stages)) {
        planData.stages = planData.stages.map((st: any, idx: number) => ({
          ...st,
          id: `st-${idx + 1}-${Date.now()}`,
        }));
      }

      return res.status(200).json(planData);
    } catch (aiErr) {
      console.warn('Gemini API call failed, using high-quality pedagogical fallback:', aiErr);
    }
  }

  // Pedagogical engine fallback
  const fallbackPlan = generateSmartQMJPlan({
    subject,
    grade,
    lessonTopic,
    section,
    learningObjectives,
    teacherName,
    schoolName,
    lessonType,
    selectedMethods,
    valuesTheme,
    hasInclusiveSupport,
    extraPrompt,
  });

  return res.status(200).json(fallbackPlan);
}
