import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { QMJView } from './components/QMJView';
import { TemplateLibrary } from './components/TemplateLibrary';
import { SavedPlansList } from './components/SavedPlansList';
import { MethodologyGuide } from './components/MethodologyGuide';
import { SAMPLE_APPROVED_PLANS } from './data/curriculumData';
import { QMJPlan } from './types/qmj';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'view' | 'templates' | 'saved' | 'guide'>('generator');
  const [currentPlan, setCurrentPlan] = useState<QMJPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<QMJPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load saved plans from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qmj_saved_plans_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPlans(parsed);
          return;
        }
      }
      // If nothing saved yet, seed with one approved sample
      setSavedPlans([SAMPLE_APPROVED_PLANS[0]]);
      localStorage.setItem('qmj_saved_plans_list', JSON.stringify([SAMPLE_APPROVED_PLANS[0]]));
    } catch (e) {
      console.error('Failed to load saved plans:', e);
    }
  }, []);

  // Save to localStorage when savedPlans changes
  const persistSavedPlans = (newPlans: QMJPlan[]) => {
    setSavedPlans(newPlans);
    try {
      localStorage.setItem('qmj_saved_plans_list', JSON.stringify(newPlans));
    } catch (e) {
      console.error('Failed to persist saved plans:', e);
    }
  };

  const handlePlanGenerated = (plan: QMJPlan) => {
    setCurrentPlan(plan);
    // Also automatically add to saved plans so teacher never loses work
    const exists = savedPlans.some((p) => p.id === plan.id);
    if (!exists) {
      const updated = [plan, ...savedPlans];
      persistSavedPlans(updated);
    }
    setActiveTab('view');
  };

  const handleUpdatePlan = (updatedPlan: QMJPlan) => {
    setCurrentPlan(updatedPlan);
    const updatedList = savedPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    persistSavedPlans(updatedList);
  };

  const handleSavePlan = (plan: QMJPlan) => {
    const exists = savedPlans.some((p) => p.id === plan.id);
    let updatedList: QMJPlan[];
    if (exists) {
      updatedList = savedPlans.map((p) => (p.id === plan.id ? plan : p));
    } else {
      updatedList = [plan, ...savedPlans];
    }
    persistSavedPlans(updatedList);
  };

  const handleDeletePlan = (planId: string) => {
    const filtered = savedPlans.filter((p) => p.id !== planId);
    persistSavedPlans(filtered);
    if (currentPlan?.id === planId) {
      setCurrentPlan(null);
      setActiveTab('saved');
    }
  };

  const handleSelectTemplate = (template: QMJPlan) => {
    // Clone with fresh id
    const cloned: QMJPlan = {
      ...template,
      id: `qmj-clone-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      header: {
        ...template.header,
        date: new Date().toISOString().split('T')[0],
      },
    };
    setCurrentPlan(cloned);
    setActiveTab('view');
  };

  const handleSelectSavedPlan = (plan: QMJPlan) => {
    setCurrentPlan(plan);
    setActiveTab('view');
  };

  const handleNewPlan = () => {
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCurrentPlan={currentPlan !== null}
        savedCount={savedPlans.length}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'generator' && (
          <GeneratorForm
            onPlanGenerated={handlePlanGenerated}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {activeTab === 'view' && currentPlan && (
          <QMJView
            plan={currentPlan}
            onUpdatePlan={handleUpdatePlan}
            onSavePlan={handleSavePlan}
            onNewPlan={handleNewPlan}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
        )}

        {activeTab === 'saved' && (
          <SavedPlansList
            savedPlans={savedPlans}
            onSelectPlan={handleSelectSavedPlan}
            onDeletePlan={handleDeletePlan}
            onCreateNew={handleNewPlan}
          />
        )}

        {activeTab === 'guide' && <MethodologyGuide />}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">
            ҚМЖ Генераторы — Қазақстан ұстаздарының цифрлық көмекшісі
          </p>
          <p className="mt-1 text-slate-400">
            ҚР Оқу-ағарту министрлігінің мемлекеттік білім беру стандартына сәйкес жасалған
          </p>
        </div>
      </footer>
    </div>
  );
}
