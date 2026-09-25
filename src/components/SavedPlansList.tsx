import React, { useState } from 'react';
import { QMJPlan } from '../types/qmj';
import { exportQMJToWord } from '../utils/exportWord';
import {
  FolderHeart,
  Eye,
  Download,
  Trash2,
  Copy,
  Calendar,
  BookOpen,
  Search,
  Sparkles,
} from 'lucide-react';

interface SavedPlansListProps {
  savedPlans: QMJPlan[];
  onSelectPlan: (plan: QMJPlan) => void;
  onDeletePlan: (planId: string) => void;
  onCreateNew: () => void;
}

export const SavedPlansList: React.FC<SavedPlansListProps> = ({
  savedPlans,
  onSelectPlan,
  onDeletePlan,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = savedPlans.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.header?.subject?.toLowerCase().includes(q) ||
      p.header?.lessonTopic?.toLowerCase().includes(q) ||
      p.header?.grade?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderHeart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Менің сақталған сабақ жоспарларым
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Барлық жасалған және өңделген ҚМЖ жоспарларыңыз осында сақталады (барлығы:{' '}
            {savedPlans.length} жоспар)
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Жаңа ҚМЖ құрастыру</span>
        </button>
      </div>

      {savedPlans.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Сақталған жоспарлардан іздеу..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            />
          </div>
        </div>
      )}

      {savedPlans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <FolderHeart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Әзірге сақталған сабақ жоспарлары жоқ
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Жаңа ҚМЖ жасағанда «Сақтау» батырмасын басып, өз жоспарларыңызды кез келген уақытта қайта
            қарап, Word-қа жүктей аласыз.
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs"
          >
            Алғашқы ҚМЖ құрастыру
          </button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Іздеу нәтижесі бойынша ешқандай жоспар табылмады.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {plan.header.subject}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {plan.header.grade}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                  {plan.header.lessonTopic}
                </h4>

                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {plan.header.learningObjectives}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Сақталған: {plan.createdAt || 'Бүгін'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Қарау</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportQMJToWord(plan)}
                  title="Word жүктеу"
                  className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePlan(plan.id)}
                  title="Өшіру"
                  className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
