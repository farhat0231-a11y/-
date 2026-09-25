import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { generateSmartQMJPlan } from './src/utils/qmjFallbackGenerator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate Full Kazakhstan QMJ Plan
app.post('/api/generate-qmj', async (req, res) => {
  try {
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
    } = req.body;

    if (!subject || !lessonTopic) {
      return res.status(400).json({ error: 'Пән мен сабақ тақырыбы міндетті түрде толтырылуы қажет.' });
    }

    const systemInstruction = `Сіз – Қазақстан Республикасы Оқу-ағарту министрлігінің мемлекеттік жалпыға міндетті білім беру стандартын (МЖМБС), жаңартылған білім мазмұнын және «Біртұтас тәрбие» бағдарламасын терең меңгерген тәжірибелі әдіскер-педагогсіз.
Сіздің міндетіңіз – мұғалімге ҚР Оқу-ағарту министрлігінің бекітілген типтік үлгісіне сай толыққанды, кәсіби, сапалы Қысқа мерзімді сабақ жоспарын (ҚМЖ) жасап беру.

Маңызды талаптар:
1. Тілі: Таза, академиялық қазақ тілі, педагогикалық терминологиясы сауатты.
2. «Сабақтың мақсаты» үш деңгейге жіктелуі керек: Барлық оқушылар үшін, Көпшілігі үшін, Кейбір оқушылар үшін.
3. Сабақтың 3 негізгі кезеңі болуы шарт:
   - Сабақтың басы (0-10 мин): Ұйымдастыру кезеңі, жағымды психологиялық ахуал (нақты әдісімен), қызығушылықты ояту/өткенді қайталау, оқу мақсатын таныстыру.
   - Сабақтың ортасы (10-35 мин): Мағынаны тану (жаңа ақпарат), топтық/жұптық тапсырма, жеке сараланған тапсырма (А, В, С деңгейлері), сергіту сәті, функционалдық тапсырма. Әр тапсырмаға нақты балдық жүйесі бар ДЕСКРИПТОР (1-10 балл) және формативті бағалау тәсілі («Бас бармақ», «Бағдаршам», «2 жұлдыз, 1 тілек» т.б.) жазылады.
   - Сабақтың соңы (35-45 мин): Сабақты бекіту, рефлексия («ББҮ», «Табыс ағашы», «Шығу билеті» т.б.), бағалау, үй тапсырмасы (негізгі және шығармашылық).
4. Құндылықтарға баулу «Біртұтас тәрбие» бағдарламасының негізгі идеяларын қамтуы керек.
5. Саралау бөлімінде қолдауды қажет ететін және қабілетті оқушыларға арналған нақты әдістер көрсетілсін.`;

    const userPrompt = `Келесі мәліметтер бойынша ҚМЖ сабақ жоспарын әзірлеңіз:
- Пән: ${subject}
- Сынып: ${grade || '7'}
- Сабақтың тақырыбы: ${lessonTopic}
${section ? `- Бөлім: ${section}` : ''}
${learningObjectives ? `- Оқу бағдарламасына сәйкес оқу мақсаты: ${learningObjectives}` : '- Оқу мақсаты: осы сынып пен тақырыпқа лайықты ресми 4 санды кодын (мысалы 7.2.1.3) және толық мәтінін жазыңыз'}
${teacherName ? `- Педагог: ${teacherName}` : ''}
${schoolName ? `- Білім ұйымы: ${schoolName}` : ''}
${lessonType ? `- Сабақ түрі: ${lessonType}` : '- Сабақ түрі: Жаңа білімді меңгеру сабағы'}
${selectedMethods?.length ? `- Қолданылатын әдіс-тәсілдер: ${selectedMethods.join(', ')}` : ''}
${valuesTheme ? `- Құндылық бағыты: ${valuesTheme}` : ''}
${hasInclusiveSupport ? `- Ерекше білімді қажет ететін (ЕББҚ) оқушылар үшін бейімделген тапсырмалар мен саралауды міндетті түрде қосыңыз.` : ''}
${extraPrompt ? `- Қосымша мұғалім тілегі: ${extraPrompt}` : ''}

Жауапты қатаң түрде JSON пішімінде төмендегі схема бойынша беріңіз.`;

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
            title: { type: Type.STRING, description: 'Сабақ жоспарының тақырыбы' },
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
                lessonObjectives: {
                  type: Type.OBJECT,
                  properties: {
                    allStudents: { type: Type.STRING },
                    mostStudents: { type: Type.STRING },
                    someStudents: { type: Type.STRING },
                  },
                  required: ['allStudents', 'mostStudents', 'someStudents'],
                },
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

    // Assign IDs if missing
    planData.id = `qmj-${Date.now()}`;
    planData.createdAt = new Date().toISOString().split('T')[0];
    if (planData.stages && Array.isArray(planData.stages)) {
      planData.stages = planData.stages.map((st: any, idx: number) => ({
        ...st,
        id: `st-${idx + 1}-${Date.now()}`,
      }));
    }

    res.json(planData);
  } catch (error: any) {
    console.error('Error generating QMJ via AI, providing smart fallback:', error);
    try {
      const fallback = generateSmartQMJPlan(req.body);
      return res.json(fallback);
    } catch (fallbackErr) {
      return res.status(500).json({
        error: 'ҚМЖ жасау кезінде қате орын алды.',
        details: error.message,
      });
    }
  }
});

// Endpoint: Enhance specific section with AI
app.post('/api/improve-section', async (req, res) => {
  try {
    const { sectionType, currentContent, subject, topic, instruction } = req.body;

    const prompt = `Сіз Қазақстанның жетекші әдіскер-ұстазысыз.
Пән: ${subject || 'Жалпы пән'}
Сабақ тақырыбы: ${topic || 'Сабақ'}
Бөлім түрі: ${sectionType}
Қазіргі мәтін:
${currentContent}

Тапсырма: ${instruction || 'Осы бөлімді заманауи интерактивті әдістермен, нақты дескрипторлармен және сараланған тапсырмалармен толықтырып, жетілдіріп беріңіз.'}

Жауабыңызды тікелей жетілдірілген мәтін ретінде қазақ тілінде қайтарыңыз (артық сәлемдесусіз және кіріспе сөздерсіз).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ improvedText: response.text?.trim() || currentContent });
  } catch (error: any) {
    console.error('Error improving section:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Suggest topics or learning objectives
app.post('/api/suggest-objectives', async (req, res) => {
  try {
    const { subject, grade, topic } = req.body;

    const prompt = `ҚР Оқу-ағарту министрлігінің типтік оқу бағдарламасына сай мына пән мен сынып үшін 4-5 оқу мақсатын (тиісті ресми кодымен, мысалы "7.1.2.1 ...") және сабақ мақсатын ұсыныңыз:
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
    res.json({ suggestions: list });
  } catch (error: any) {
    console.error('Error suggesting objectives:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware in development or static serve in production
if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
