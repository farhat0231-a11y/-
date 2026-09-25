import React, { useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Save,
  Edit3,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Wand2,
  FileText,
  AlertCircle,
  HelpCircle,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { QMJPlan, QMJStageItem } from '../types/qmj';
import { exportQMJToWord, copyPlanToClipboard } from '../utils/exportWord';
import { improveSectionSmart } from '../utils/qmjFallbackGenerator';

interface QMJViewProps {
  plan: QMJPlan;
  onUpdatePlan: (updatedPlan: QMJPlan) => void;
  onSavePlan: (plan: QMJPlan) => void;
  onNewPlan: () => void;
}

export const QMJView: React.FC<QMJViewProps> = ({
  plan,
  onUpdatePlan,
  onSavePlan,
  onNewPlan,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI improve modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleCopy = async () => {
    try {
      await copyPlanToClipboard(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDoc = () => {
    exportQMJToWord(plan);
  };

  const handleSave = () => {
    onSavePlan(plan);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Header field change
  const handleHeaderChange = (field: string, value: string) => {
    onUpdatePlan({
      ...plan,
      header: {
        ...plan.header,
        [field]: value,
      },
    });
  };

  // Objectives change
  const handleObjectiveChange = (level: 'allStudents' | 'mostStudents' | 'someStudents', value: string) => {
    onUpdatePlan({
      ...plan,
      header: {
        ...plan.header,
        lessonObjectives: {
          ...plan.header.lessonObjectives,
          [level]: value,
        },
      },
    });
  };

  // Stage field change
  const handleStageChange = (stageId: string, field: keyof QMJStageItem, value: string) => {
    onUpdatePlan({
      ...plan,
      stages: plan.stages.map((st) => (st.id === stageId ? { ...st, [field]: value } : st)),
    });
  };

  // Conclusion field change
  const handleConclusionChange = (field: string, value: string) => {
    onUpdatePlan({
      ...plan,
      conclusion: {
        ...plan.conclusion,
        [field]: value,
      },
    });
  };

  // Add new stage row
  const handleAddStageRow = () => {
    const newStage: QMJStageItem = {
      id: `st-custom-${Date.now()}`,
      stageName: 'Қосымша кезең',
      subStage: 'Бекіту жаттығуы',
      teacherActivity: 'Мұғалім оқушыларға қосымша тапсырма ұсынады.',
      studentActivity: 'Оқушылар тапсырманы орындайды.',
      assessment: 'Дескриптор бойынша бағалау (2 балл).',
      resources: 'Таратпа карточкалар, оқулық.',
    };
    onUpdatePlan({
      ...plan,
      stages: [...plan.stages, newStage],
    });
  };

  // Delete stage row
  const handleDeleteStage = (stageId: string) => {
    if (plan.stages.length <= 1) return;
    onUpdatePlan({
      ...plan,
      stages: plan.stages.filter((s) => s.id !== stageId),
    });
  };

  // Open AI improve for a stage
  const openAiImprove = (key: string, defaultPrompt: string) => {
    setSelectedSectionKey(key);
    setAiInstruction(defaultPrompt);
    setAiError('');
    setAiModalOpen(true);
  };

  const handleApplyAiImprove = async () => {
    setIsAiLoading(true);
    setAiError('');

    try {
      let currentText = '';
      if (selectedSectionKey.startsWith('stage-')) {
        const stageId = selectedSectionKey.replace('stage-', '');
        const st = plan.stages.find((s) => s.id === stageId);
        currentText = st ? `Мұғалім әрекеті: ${st.teacherActivity}\nОқушы әрекеті: ${st.studentActivity}\nБағалау: ${st.assessment}` : '';
      } else if (selectedSectionKey === 'differentiation') {
        currentText = plan.conclusion.differentiation;
      } else if (selectedSectionKey === 'objectives') {
        currentText = `Барлығы: ${plan.header.lessonObjectives?.allStudents}\nКөпшілігі: ${plan.header.lessonObjectives?.mostStudents}\nКейбірі: ${plan.header.lessonObjectives?.someStudents}`;
      }

      let improved = '';
      try {
        const res = await fetch('/api/improve-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionType: selectedSectionKey,
            currentContent: currentText,
            subject: plan.header.subject,
            topic: plan.header.lessonTopic,
            instruction: aiInstruction,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.improvedText) improved = data.improvedText;
        }
      } catch (netErr) {
        console.warn('API improve error, falling back to smart local enhancer:', netErr);
      }

      if (!improved) {
        improved = improveSectionSmart(
          selectedSectionKey,
          currentText,
          plan.header.subject,
          plan.header.lessonTopic,
          aiInstruction
        );
      }

      if (selectedSectionKey.startsWith('stage-')) {
        const stageId = selectedSectionKey.replace('stage-', '');
        onUpdatePlan({
          ...plan,
          stages: plan.stages.map((st) => {
            if (st.id === stageId) {
              return {
                ...st,
                assessment: improved.includes('Дескриптор') ? improved : `${st.assessment}\n\nҚосымша: ${improved}`,
              };
            }
            return st;
          }),
        });
      } else if (selectedSectionKey === 'differentiation') {
        onUpdatePlan({
          ...plan,
          conclusion: {
            ...plan.conclusion,
            differentiation: improved,
          },
        });
      }

      setAiModalOpen(false);
    } catch (e: any) {
      setAiError(e.message || 'Қате болды');
    } finally {
      setIsAiLoading(false);
    }
  };

  const h = plan.header;
  const c = plan.conclusion;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Action toolbar (screen only) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {h.subject || 'Пән'} – {h.lessonTopic || 'Сабақ жоспары'}
            </h2>
            <p className="text-xs text-slate-500">
              {h.grade} • {h.lessonType || 'Жаңа сабақ'} • {h.date || 'Күні'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              isEditing
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Өңдеуді аяқтау' : 'Мәтінді өңдеу'}
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Сақталды!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-blue-600" />
                <span>Сақтау</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Көшірілді!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Көшіру</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Басып шығару (PDF)</span>
          </button>

          <button
            onClick={handleExportDoc}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word (.doc) жүктеу</span>
          </button>
        </div>
      </div>

      {/* Editing notice if active */}
      {isEditing && (
        <div className="no-print mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <b>Өңдеу режимі қосулы:</b> Төмендегі кестенің кез келген ұяшығына мәтін енгізіп,
              өзгерте аласыз.
            </span>
          </div>
          <button
            onClick={handleAddStageRow}
            className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Жаңа кезең қосу
          </button>
        </div>
      )}

      {/* Official Kazakhstan QMJ Paper Document Layout */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-8 sm:p-12 print-page text-black font-serif">
        {/* Top school and approval bar */}
        <div className="flex justify-between items-start mb-6 text-sm">
          <div className="w-1/2 pr-4">
            {isEditing ? (
              <input
                type="text"
                value={h.schoolName}
                onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                placeholder="Білім беру ұйымының атауы"
                className="w-full font-bold border border-slate-300 rounded p-1 text-xs"
              />
            ) : (
              <p className="font-bold uppercase tracking-tight text-xs sm:text-sm">
                {h.schoolName || '«№ ___ ЖАЛПЫ БІЛІМ БЕРЕТІН МЕКТЕП» КММ'}
              </p>
            )}
            <p className="text-xs text-slate-700 mt-1">
              Педагог: <b>{h.teacherName || '________________________'}</b>
            </p>
          </div>

          <div className="w-1/2 pl-4 text-right text-xs sm:text-sm">
            <p className="font-bold">«БЕКІТЕМІН»</p>
            <p>Мектеп директоры: _______________</p>
            <p className="text-xs text-slate-600 mt-0.5">«____» _______________ 202__ ж.</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
            Қысқа мерзімді сабақ жоспары (ҚМЖ)
          </h1>
          <p className="text-xs italic text-slate-600 mt-1">
            ҚР Оқу-ағарту министрлігінің стандартына сәйкес үлгі
          </p>
        </div>

        {/* 1. Жалпы мәліметтер кестесі */}
        <div className="overflow-x-auto mb-8">
          <table className="qmj-info-table w-full border-collapse border border-black text-xs sm:text-sm">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50 w-1/4">Бөлім:</td>
                <td className="border border-black p-2" colSpan={3}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={h.section}
                      onChange={(e) => handleHeaderChange('section', e.target.value)}
                      className="w-full border border-slate-300 p-1 rounded"
                    />
                  ) : (
                    h.section || '—'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Педагогтің Т.А.Ә.:</td>
                <td className="border border-black p-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={h.teacherName}
                      onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                      className="w-full border border-slate-300 p-1 rounded"
                    />
                  ) : (
                    h.teacherName || '—'
                  )}
                </td>
                <td className="border border-black p-2 font-bold bg-slate-50 w-1/6">Күні:</td>
                <td className="border border-black p-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={h.date}
                      onChange={(e) => handleHeaderChange('date', e.target.value)}
                      className="w-full border border-slate-300 p-1 rounded"
                    />
                  ) : (
                    h.date || '—'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Сынып:</td>
                <td className="border border-black p-2" colSpan={3}>
                  <div className="flex flex-wrap items-center gap-4">
                    <span>
                      Сынып: <b>{h.grade}</b>
                    </span>
                    <span>
                      Қатысқандар: <b>{h.attendeesCount || '24'}</b>
                    </span>
                    <span>
                      Қатыспағандар: <b>{h.absentCount || '0'}</b>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Пән:</td>
                <td className="border border-black p-2 font-bold text-blue-900" colSpan={3}>
                  {h.subject}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Сабақтың тақырыбы:</td>
                <td className="border border-black p-2 font-bold" colSpan={3}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={h.lessonTopic}
                      onChange={(e) => handleHeaderChange('lessonTopic', e.target.value)}
                      className="w-full border border-slate-300 p-1 rounded"
                    />
                  ) : (
                    h.lessonTopic
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">
                  Оқу бағдарламасына сәйкес оқыту мақсаттары:
                </td>
                <td className="border border-black p-2" colSpan={3}>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={h.learningObjectives}
                      onChange={(e) => handleHeaderChange('learningObjectives', e.target.value)}
                      className="w-full border border-slate-300 p-1 rounded font-mono text-xs"
                    />
                  ) : (
                    <span className="font-medium text-slate-900">{h.learningObjectives || '—'}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Сабақтың мақсаты:</td>
                <td className="border border-black p-2" colSpan={3}>
                  <div className="space-y-1.5">
                    <div>
                      <span className="font-bold text-xs uppercase text-slate-700">
                        Барлық оқушылар үшін:
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={h.lessonObjectives?.allStudents || ''}
                          onChange={(e) => handleObjectiveChange('allStudents', e.target.value)}
                          className="w-full border border-slate-300 p-1 rounded text-xs mt-0.5"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm pl-2">
                          {h.lessonObjectives?.allStudents || '—'}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs uppercase text-slate-700">
                        Көпшілігі үшін:
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={h.lessonObjectives?.mostStudents || ''}
                          onChange={(e) => handleObjectiveChange('mostStudents', e.target.value)}
                          className="w-full border border-slate-300 p-1 rounded text-xs mt-0.5"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm pl-2">
                          {h.lessonObjectives?.mostStudents || '—'}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs uppercase text-slate-700">
                        Кейбір оқушылар үшін:
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={h.lessonObjectives?.someStudents || ''}
                          onChange={(e) => handleObjectiveChange('someStudents', e.target.value)}
                          className="w-full border border-slate-300 p-1 rounded text-xs mt-0.5"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm pl-2">
                          {h.lessonObjectives?.someStudents || '—'}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Құндылықтарға баулу:</td>
                <td className="border border-black p-2" colSpan={3}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={h.valuesOrientation}
                      onChange={(e) => handleHeaderChange('valuesOrientation', e.target.value)}
                      className="w-full border border-slate-300 p-1 rounded text-xs"
                    />
                  ) : (
                    h.valuesOrientation || '«Біртұтас тәрбие» бағдарламасы'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Сабақ түрі мен әдістері:</td>
                <td className="border border-black p-2" colSpan={3}>
                  <p>
                    <b>Түрі:</b> {h.lessonType || 'Жаңа білімді меңгеру'}
                  </p>
                  <p className="mt-0.5">
                    <b>Әдіс-тәсілдері:</b> {h.pedagogicalMethods || 'Интербелсенді әдістер'}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Сабақтың барысы кестесі */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider">
              Сабақтың барысы
            </h2>
            <div className="no-print">
              <span className="text-[11px] text-slate-500 font-sans">
                ҚР Ұлттық білім стандартына сай 5 бағанды кесте
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="qmj-table w-full border-collapse border border-black text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-2 text-center font-bold w-[15%]">
                    Сабақтың кезеңі / уақыт
                  </th>
                  <th className="border border-black p-2 text-center font-bold w-[28%]">
                    Педагогтің әрекеті
                  </th>
                  <th className="border border-black p-2 text-center font-bold w-[28%]">
                    Оқушының әрекеті
                  </th>
                  <th className="border border-black p-2 text-center font-bold w-[16%]">
                    Бағалау
                  </th>
                  <th className="border border-black p-2 text-center font-bold w-[13%]">
                    Ресурстар
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.stages.map((stage, idx) => (
                  <tr key={stage.id || idx}>
                    {/* Кезең атауы */}
                    <td className="border border-black p-2 align-top bg-slate-50/50">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={stage.stageName}
                            onChange={(e) =>
                              handleStageChange(stage.id, 'stageName', e.target.value)
                            }
                            className="w-full font-bold text-xs border border-slate-300 p-1 rounded"
                          />
                          <input
                            type="text"
                            value={stage.subStage}
                            onChange={(e) =>
                              handleStageChange(stage.id, 'subStage', e.target.value)
                            }
                            placeholder="Қосымша түсіндірме"
                            className="w-full text-[11px] border border-slate-300 p-1 rounded italic"
                          />
                          <div className="pt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                openAiImprove(
                                  `stage-${stage.id}`,
                                  'Осы кезеңге нақты 1-10 балдық дескриптор және белсенді оқыту ойынын қосып беріңіз',
                                )
                              }
                              className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                            >
                              <Wand2 className="w-2.5 h-2.5" /> AI көмек
                            </button>
                            {plan.stages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteStage(stage.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold">{stage.stageName}</p>
                          {stage.subStage && (
                            <p className="text-[11px] text-slate-600 italic mt-1">
                              {stage.subStage}
                            </p>
                          )}
                          <div className="no-print mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                openAiImprove(
                                  `stage-${stage.id}`,
                                  'Осы кезеңге қосымша дескриптор мен бағалау критерийлерін қосыңыз',
                                )
                              }
                              className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> AI толықтыру
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Педагог әрекеті */}
                    <td className="border border-black p-2 align-top whitespace-pre-line leading-relaxed">
                      {isEditing ? (
                        <textarea
                          rows={6}
                          value={stage.teacherActivity}
                          onChange={(e) =>
                            handleStageChange(stage.id, 'teacherActivity', e.target.value)
                          }
                          className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                        />
                      ) : (
                        stage.teacherActivity
                      )}
                    </td>

                    {/* Оқушы әрекеті */}
                    <td className="border border-black p-2 align-top whitespace-pre-line leading-relaxed">
                      {isEditing ? (
                        <textarea
                          rows={6}
                          value={stage.studentActivity}
                          onChange={(e) =>
                            handleStageChange(stage.id, 'studentActivity', e.target.value)
                          }
                          className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                        />
                      ) : (
                        stage.studentActivity
                      )}
                    </td>

                    {/* Бағалау */}
                    <td className="border border-black p-2 align-top whitespace-pre-line leading-relaxed bg-slate-50/30">
                      {isEditing ? (
                        <textarea
                          rows={6}
                          value={stage.assessment}
                          onChange={(e) =>
                            handleStageChange(stage.id, 'assessment', e.target.value)
                          }
                          className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                        />
                      ) : (
                        stage.assessment
                      )}
                    </td>

                    {/* Ресурстар */}
                    <td className="border border-black p-2 align-top whitespace-pre-line leading-relaxed">
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={stage.resources}
                          onChange={(e) =>
                            handleStageChange(stage.id, 'resources', e.target.value)
                          }
                          className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                        />
                      ) : (
                        stage.resources
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Саралау, Бағалау, Денсаулық кестесі */}
        <div className="mb-6">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider mb-2">
            Қосымша ақпарат және саралау
          </h2>
          <div className="overflow-x-auto">
            <table className="qmj-info-table w-full border-collapse border border-black text-xs sm:text-sm">
              <tbody>
                <tr>
                  <td className="border border-black p-2.5 font-bold bg-slate-50 w-1/3 align-top">
                    Саралау – Сіз қандай тәсілмен көбірек қолдау көрсетпексіз? Қабілетті оқушыларға
                    қандай тапсырмалар бересіз?
                  </td>
                  <td className="border border-black p-2.5 align-top whitespace-pre-line leading-relaxed">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={c.differentiation}
                        onChange={(e) => handleConclusionChange('differentiation', e.target.value)}
                        className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                      />
                    ) : (
                      c.differentiation
                    )}
                  </td>
                </tr>

                {c.inclusiveSupport && (
                  <tr>
                    <td className="border border-black p-2.5 font-bold bg-slate-50 align-top">
                      Ерекше білім беруді қажет ететін (ЕББҚ) оқушыларға қолдау:
                    </td>
                    <td className="border border-black p-2.5 align-top whitespace-pre-line leading-relaxed">
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={c.inclusiveSupport}
                          onChange={(e) =>
                            handleConclusionChange('inclusiveSupport', e.target.value)
                          }
                          className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                        />
                      ) : (
                        c.inclusiveSupport
                      )}
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="border border-black p-2.5 font-bold bg-slate-50 align-top">
                    Бағалау – Сіз оқушылардың материалды игеру деңгейін қалай тексеруді жоспарлап
                    отырсыз?
                  </td>
                  <td className="border border-black p-2.5 align-top whitespace-pre-line leading-relaxed">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={c.assessmentCriteria}
                        onChange={(e) =>
                          handleConclusionChange('assessmentCriteria', e.target.value)
                        }
                        className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                      />
                    ) : (
                      c.assessmentCriteria
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="border border-black p-2.5 font-bold bg-slate-50 align-top">
                    Денсаулық және қауіпсіздік техникасын сақтау:
                  </td>
                  <td className="border border-black p-2.5 align-top whitespace-pre-line leading-relaxed">
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={c.healthAndSafety}
                        onChange={(e) =>
                          handleConclusionChange('healthAndSafety', e.target.value)
                        }
                        className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                      />
                    ) : (
                      c.healthAndSafety
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="border border-black p-2.5 font-bold bg-slate-50 align-top">
                    Жалпы баға / Сабақ бойынша рефлексия:
                  </td>
                  <td className="border border-black p-2.5 align-top whitespace-pre-line leading-relaxed">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={c.reflection}
                        onChange={(e) => handleConclusionChange('reflection', e.target.value)}
                        className="w-full text-xs border border-slate-300 p-1 rounded font-sans"
                      />
                    ) : (
                      c.reflection
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer sign block */}
        <div className="flex justify-between items-center pt-8 text-xs sm:text-sm">
          <div>
            Пән мұғалімінің қолы: ___________________
          </div>
          <div>
            Күні: «____» _______________ 202__ ж.
          </div>
        </div>
      </div>

      {/* AI improve modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-blue-700">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Бөлімді AI арқылы жетілдіру</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Таңдалған кезеңге арнайы тапсырмаларды, дескрипторларды немесе әдістемелік
              қолдауды автоматты түрде қосуға нұсқау беріңіз:
            </p>

            {aiError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {aiError}
              </div>
            )}

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                AI нұсқаулығы:
              </label>
              <textarea
                rows={4}
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="Мысалы: 1-10 баллдық дескриптор қосыңыз және жұптық жұмыс тәсілін егжей-тегжейлі жазыңыз..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              {/* Quick prompt presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setAiInstruction(
                      'Осы тапсырмаға нақты балдық жүйесі бар толық Дескриптор (1-10 балл) қосып жазыңыз.',
                    )
                  }
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-slate-700"
                >
                  + Дескрипторларды толықтыру
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAiInstruction(
                      'Сабаққа қызықты интерактивті ойын элементін (Kahoot немесе квест) қосыңыз.',
                    )
                  }
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-slate-700"
                >
                  + Ойын элементін қосу
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAiInstruction(
                      'Тапсырманы А, В, С үш деңгейіне саралап бөліп беріңіз.',
                    )
                  }
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-slate-700"
                >
                  + А, В, С деңгейлеріне саралау
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                disabled={isAiLoading}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Бас тарту
              </button>
              <button
                type="button"
                onClick={handleApplyAiImprove}
                disabled={isAiLoading}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                {isAiLoading ? (
                  <span>Жаңартылуда...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Жетілдіруді қолдану</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
