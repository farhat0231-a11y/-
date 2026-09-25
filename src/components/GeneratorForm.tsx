import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Wand2,
  ChevronDown,
  Info,
  Check,
  RotateCcw,
  Loader2,
  Award,
  Layers,
  HeartHandshake,
  Lightbulb,
} from 'lucide-react';
import {
  KAZAKHSTAN_SUBJECTS,
  VALUES_PROGRAM,
  LESSON_TYPES,
  PEDAGOGICAL_METHODS,
} from '../data/curriculumData';
import { QMJPlan, QMJGenerateRequest } from '../types/qmj';

interface GeneratorFormProps {
  onPlanGenerated: (plan: QMJPlan) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onPlanGenerated,
  isLoading,
  setIsLoading,
}) => {
  // Form fields
  const [subject, setSubject] = useState('Математика');
  const [grade, setGrade] = useState('5');
  const [lessonTopic, setLessonTopic] = useState('');
  const [section, setSection] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [lessonType, setLessonType] = useState('Жаңа білімді меңгеру сабағы');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([
    '4К моделі (Сыни ойлау, Креативтілік, Коммуникация, Коллаборация)',
    '«Ойлан - Жұптас - Бөліс» әдісі',
  ]);
  const [valuesTheme, setValuesTheme] = useState('Еңбекқорлық және кәсібилік');
  const [hasInclusiveSupport, setHasInclusiveSupport] = useState(false);
  const [extraPrompt, setExtraPrompt] = useState('');

  // AI suggestions state
  const [suggestedObjectives, setSuggestedObjectives] = useState<
    { code: string; text: string }[]
  >([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load teacher profile from local storage if available
  useEffect(() => {
    const savedTeacher = localStorage.getItem('qmj_teacher_name');
    const savedSchool = localStorage.getItem('qmj_school_name');
    if (savedTeacher) setTeacherName(savedTeacher);
    if (savedSchool) setSchoolName(savedSchool);
  }, []);

  // Update sample topics & section suggestion when subject or grade changes
  const currentSubjectData = KAZAKHSTAN_SUBJECTS.find(
    (s) => s.name.toLowerCase() === subject.toLowerCase(),
  );

  const matchedTopicSamples = currentSubjectData?.sampleTopics?.filter(
    (st) => String(st.grade) === String(grade),
  ) || [];

  const handleSelectSampleTopic = (sample: {
    topic: string;
    objectiveCode: string;
    objectiveText: string;
  }) => {
    setLessonTopic(sample.topic);
    setLearningObjectives(`${sample.objectiveCode} ${sample.objectiveText}`);
    if (currentSubjectData?.defaultSections?.length) {
      setSection(currentSubjectData.defaultSections[0]);
    }
  };

  const handleToggleMethod = (methodName: string) => {
    if (selectedMethods.includes(methodName)) {
      setSelectedMethods(selectedMethods.filter((m) => m !== methodName));
    } else {
      setSelectedMethods([...selectedMethods, methodName]);
    }
  };

  // AI suggest objectives via API
  const handleFetchSuggestedObjectives = async () => {
    if (!subject) return;
    setIsSuggesting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/suggest-objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          topic: lessonTopic,
        }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestedObjectives(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Submit generate
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !lessonTopic.trim()) {
      setErrorMessage('Пән атауы мен сабақ тақырыбын енгізу міндетті.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    // Save profile to local storage for convenience
    if (teacherName.trim()) localStorage.setItem('qmj_teacher_name', teacherName.trim());
    if (schoolName.trim()) localStorage.setItem('qmj_school_name', schoolName.trim());

    const requestBody: QMJGenerateRequest = {
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
    };

    try {
      const response = await fetch('/api/generate-qmj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ҚМЖ генерациялау сәтсіз аяқталды');
      }

      const plan: QMJPlan = await response.json();

      // Ensure fallback properties
      if (!plan.header.teacherName && teacherName) plan.header.teacherName = teacherName;
      if (!plan.header.schoolName && schoolName) plan.header.schoolName = schoolName;
      if (!plan.header.grade) plan.header.grade = `${grade}-сынып`;
      if (!plan.header.date) plan.header.date = new Date().toISOString().split('T')[0];

      onPlanGenerated(plan);
    } catch (err: any) {
      console.error('Error generating QMJ:', err);
      setErrorMessage(
        err.message || 'ҚМЖ жасау кезінде күтпеген қате болды. Қайта көріңіз.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 sm:p-8 text-white relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Жасанды интеллект көмекшісі
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Қысқа мерзімді сабақ жоспарын (ҚМЖ) әзірлеу
            </h2>
            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              Пән мен тақырыпты таңдаңыз, жүйе ҚР Оқу-ағарту министрлігінің стандартына сай
              сабақ мақсаттарын, сараланған дескрипторлы тапсырмаларды, рефлексияны және
              «Біртұтас тәрбие» құндылықтарын толықтай дайындап береді.
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Қате орын алды</p>
              <p className="text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="p-6 sm:p-8 space-y-7">
          {/* 1. Пән және сынып */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Пән және сыныпты таңдау
              </h3>
            </div>

            {/* Popular subject quick tags */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {KAZAKHSTAN_SUBJECTS.slice(0, 10).map((subj) => (
                <button
                  type="button"
                  key={subj.id}
                  onClick={() => {
                    setSubject(subj.name);
                    if (!subj.grades.includes(Number(grade))) {
                      setGrade(String(subj.grades[0]));
                    }
                  }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    subject.toLowerCase() === subj.name.toLowerCase()
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {subj.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Пән атауы *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Мысалы: Математика, Қазақ тілі, Физика..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Сынып *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => (
                    <option key={g} value={g}>
                      {g}-сынып
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Сабақ тақырыбы мен оқу мақсаттары */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Сабақтың тақырыбы және оқу мақсаты
              </h3>
            </div>

            {/* Quick suggested topics from curriculum */}
            {matchedTopicSamples.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  {grade}-сынып бойынша үлгілік тақырыптар (1 басу арқылы таңдау):
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedTopicSamples.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleTopic(sample)}
                      className="text-xs bg-white text-blue-800 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-all font-medium text-left"
                    >
                      {sample.topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Сабақтың тақырыбы *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  placeholder="Мысалы: Жай бөлшектерді қосу және азайту немесе Етістіктің шақтары..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Бөлім (Тақырыптық бөлім)
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Мысалы: Жай бөлшектерге амалдар қолдану"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Оқыту мақсаты (ББЖ / ТЖБ коды)
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchSuggestedObjectives}
                      disabled={isSuggesting}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {isSuggesting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Іздеуде...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3" /> AI-мен табу
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    placeholder="Мысалы: 5.1.2.17 Жай бөлшектерді қосу және азайту..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Suggested objectives from AI */}
              {suggestedObjectives.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold text-slate-700">
                    Ұсынылған ресми оқу мақсаттары:
                  </p>
                  <div className="space-y-1">
                    {suggestedObjectives.map((obj, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setLearningObjectives(`${obj.code} ${obj.text}`)}
                        className="w-full text-left text-xs p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all flex items-start gap-2"
                      >
                        <span className="font-bold text-blue-600 shrink-0">
                          {obj.code}
                        </span>
                        <span className="text-slate-700">{obj.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Педагогикалық тәсілдер мен тәрбие құндылықтары */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Әдістемелік баптаулар және «Біртұтас тәрбие»
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Сабақ түрі
                </label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 bg-white"
                >
                  {LESSON_TYPES.map((lt, idx) => (
                    <option key={idx} value={lt}>
                      {lt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Құндылықтарға баулу («Біртұтас тәрбие»)
                </label>
                <select
                  value={valuesTheme}
                  onChange={(e) => setValuesTheme(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 bg-white"
                >
                  {VALUES_PROGRAM.map((v) => (
                    <option key={v.id} value={v.title}>
                      {v.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Methods picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Қолданылатын интербелсенді әдіс-тәсілдер:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PEDAGOGICAL_METHODS.map((method) => {
                  const isChecked = selectedMethods.includes(method.name);
                  return (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => handleToggleMethod(method.name)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-sm flex items-center justify-center mt-0.5 shrink-0 ${
                          isChecked ? 'bg-blue-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-snug">{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inclusive education toggle */}
            <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  id="inclusiveCheck"
                  checked={hasInclusiveSupport}
                  onChange={(e) => setHasInclusiveSupport(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>
              <label htmlFor="inclusiveCheck" className="cursor-pointer select-none text-xs">
                <span className="font-bold text-indigo-950 block">
                  Ерекше білім беруді қажет ететін (ЕББҚ) оқушыларға саралау қосу
                </span>
                <span className="text-indigo-800/80">
                  ҚМЖ мазмұнына инклюзивті білім беру талаптарына сәйкес арнайы деңгейлік және
                  бейімделген тапсырмалар қосылады.
                </span>
              </label>
            </div>
          </div>

          {/* 4. Мұғалім және мектеп деректері */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Педагог және білім беру ұйымы
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Педагогтің Т.А.Ә.
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Мысалы: Асанқызы Арайлым"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Білім беру ұйымының атауы
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Мысалы: №14 жалпы білім беретін мектеп"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Қосымша мұғалім тілегі немесе ескертулер (қажет болса)
              </label>
              <input
                type="text"
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="Мысалы: Bilimland бейнеролигін қосу, сергіту сәтінде көз жаттығуын қолдану..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ҚМЖ жасалуда... (Сабақ мақсаттары мен кезеңдері жинақталуда)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Толық ҚМЖ сабақ жоспарын жасау</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2.5">
              Жоспар дайын болған соң оны еркін өңдеп, Word (.doc) форматында жүктей немесе
              тікелей басып шығара аласыз.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
