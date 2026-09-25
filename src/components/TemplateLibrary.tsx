import React, { useState } from 'react';
import { SAMPLE_APPROVED_PLANS, KAZAKHSTAN_SUBJECTS } from '../data/curriculumData';
import { QMJPlan } from '../types/qmj';
import { exportQMJToWord } from '../utils/exportWord';
import { Download, Eye, BookOpen, CheckCircle, Search, Sparkles } from 'lucide-react';

interface TemplateLibraryProps {
  onSelectTemplate: (plan: QMJPlan) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Барлығы');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = SAMPLE_APPROVED_PLANS.filter((plan) => {
    const matchesSubject =
      selectedSubject === 'Барлығы' ||
      plan.header.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.header.lessonTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.header.learningObjectives.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Әдістемелік кеңеспен тексерілген
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            ҚР Үлгілік бекітілген ҚМЖ дайын жоспарлары
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
            Мұғалімдер үшін арнайы әзірленген, барлық оқу мақсаттары мен сараланған дескрипторлары
            қамтылған дайын сабақ жоспарлары. Кез келген үлгіні бір басу арқылы өзіңізге бейімдеп,
            өңдеп, Word құжаты ретінде жүктей аласыз.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Тақырып, пән немесе оқу мақсаты бойынша іздеу..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['Барлығы', 'Математика', 'Қазақ тілі', 'Информатика'].map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  selectedSubject === subj
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {plan.header.subject}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {plan.header.grade}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                {plan.header.lessonTopic}
              </h3>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                <b>Оқу мақсаты:</b> {plan.header.learningObjectives}
              </p>

              <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                <p>
                  <b>Бөлім:</b> {plan.header.section}
                </p>
                <p>
                  <b>Әдіс-тәсілдер:</b> {plan.header.pedagogicalMethods}
                </p>
                <p>
                  <b>Құндылық:</b> {plan.header.valuesOrientation}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectTemplate(plan)}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ашу және өңдеу</span>
              </button>
              <button
                type="button"
                onClick={() => exportQMJToWord(plan)}
                title="Word жүктеу"
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
