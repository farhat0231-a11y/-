import React, { useState } from 'react';
import {
  VALUES_PROGRAM,
  PEDAGOGICAL_METHODS,
} from '../data/curriculumData';
import {
  HelpCircle,
  Award,
  Sparkles,
  BookOpen,
  Target,
  Brain,
  CheckCircle2,
  Users,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const MethodologyGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'structure' | 'values' | 'methods' | 'assessment' | 'differentiation'>('structure');

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Педагогикалық анықтамалық
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            ҚМЖ құрастыру әдістемесі және стандарттар
          </h2>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Қазақстан Республикасы Оқу-ағарту министрлігінің мемлекеттік білім беру стандартына,
            жаңартылған білім бағдарламасына және «Біртұтас тәрбие» бағдарламасына негізделген
            практикалық нұсқаулық.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-100 pt-4">
          {[
            { id: 'structure', label: 'ҚМЖ құрылымы мен талаптары' },
            { id: 'values', label: '«Біртұтас тәрбие» құндылықтары' },
            { id: 'methods', label: 'Белсенді әдістер және 4К моделі' },
            { id: 'assessment', label: 'Дескриптор және бағалау (1-10 балл)' },
            { id: 'differentiation', label: 'Саралап оқыту және ЕББҚ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on tab */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Қысқа мерзімді сабақ жоспарының (ҚМЖ) міндетті құрылымы
              </h3>
              <p className="text-sm text-slate-600">
                ҚР Оқу-ағарту министрлігінің №130 бұйрығына сәйкес ҚМЖ келесі 3 негізгі блоктан тұрады:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <span className="font-bold text-blue-800 text-sm block mb-1">
                  1. Жалпы мәліметтер
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Бөлім, педагогтің Т.А.Ә., күні, сынып, пән, тақырып, ресми оқу мақсаттары (4
                  санды кодпен), сабақ мақсаттары (3 деңгейде) және «Біртұтас тәрбие» құндылықтары.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="font-bold text-emerald-800 text-sm block mb-1">
                  2. Сабақтың барысы (5 баған)
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Сабақтың кезеңі/уақыты, Педагогтің әрекеті, Оқушының әрекеті, Бағалау (нақты
                  дескриптор, формативті баға), Ресурстар. Сабақтың басы, ортасы, соңы.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
                <span className="font-bold text-purple-800 text-sm block mb-1">
                  3. Қосымша міндетті бөлімдер
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Саралау (қолдау және қабілетті оқушылар), ЕББҚ қолдау, Бағалау критерийлері,
                  Денсаулық және техникалық қауіпсіздік, Рефлексия.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-900 text-sm">
                Сабақтың мақсатын SMART талаптары бойынша 3 деңгейге жіктеу:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <b>Барлық оқушылар үшін:</b> Негізгі ұғымдар мен ережелерді біледі, қарапайым
                  тапсырмаларды орындайды.
                </li>
                <li>
                  <b>Көпшілігі үшін:</b> Тақырыпты өз бетінше талдайды, есептер мен жаттығуларды ортақ
                  алгоритммен қатесіз шешеді.
                </li>
                <li>
                  <b>Кейбір оқушылар үшін:</b> Шығармашылық және зерттеушілік тапсырмаларды
                  орындайды, логикалық қорытынды жасайды.
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'values' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                «Біртұтас тәрбие» бағдарламасы бойынша құндылықтар
              </h3>
              <p className="text-sm text-slate-600">
                Әрбір сабақта пәндік біліммен қатар ұлттық және адами құндылықтар қатар сіңірілуі тиіс:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VALUES_PROGRAM.map((v, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Award className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-sm">{v.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                4К моделі және белсенді оқыту әдістері
              </h3>
              <p className="text-sm text-slate-600">
                XXI ғасыр дағдыларын дамытуға бағытталған педагогикалық технологиялар:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                <span className="font-bold text-amber-900 text-xs block mb-1">1. Сыни ойлау</span>
                <p className="text-[11px] text-slate-600">
                  Деректерді сараптау, себеп-салдарды анықтау, дәлелді қорытынды жасау.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50">
                <span className="font-bold text-sky-900 text-xs block mb-1">2. Креативтілік</span>
                <p className="text-[11px] text-slate-600">
                  Жаңа идеяларды ұсыну, стандарттан тыс шешім табу, инновациялық тәсілдер.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="font-bold text-emerald-900 text-xs block mb-1">3. Коммуникация</span>
                <p className="text-[11px] text-slate-600">
                  Өз ойын еркін және сауатты жеткізу, пікірталасқа түсу, белсенді тыңдау.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <span className="font-bold text-indigo-900 text-xs block mb-1">4. Коллаборация</span>
                <p className="text-[11px] text-slate-600">
                  Топта бірлесе жұмыс істеу, ортақ мақсатқа жету, көшбасшылық және қолдау.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">
                Танымал әдістер банкі:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {PEDAGOGICAL_METHODS.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="font-bold text-blue-900 block">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Қалыптастырушы бағалау және 1-10 баллдық дескриптор
              </h3>
              <p className="text-sm text-slate-600">
                ҚР мектептеріндегі 10 баллдық бағалау жүйесі бойынша әрбір тапсырмаға нақты
                өлшенетін дескрипторлар жазылуы қажет:
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-3">
              <h4 className="font-bold text-blue-950 text-sm">
                Үлгі: Математика / Қазақ тілі тапсырмасының дескрипторы (Жалпы – 10 балл):
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                <li>Есептің шартын немесе грамматикалық ережені дұрыс түсінеді – 2 балл;</li>
                <li>Қажетті формуланы немесе сөзжасам тәсілін дәл таңдайды – 3 балл;</li>
                <li>Шешу жолдарын математикалық немесе тілдік нормаға сай жазады – 3 балл;</li>
                <li>Қорытынды жауапты қатесіз анықтап, дәйектейді – 2 балл.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-900 text-sm">
                Формативті кері байланыс құралдары:
              </p>
              <p>
                <b>«2 жұлдыз, 1 тілек»</b> – оқушының екі жетістігін атап, бір дамыту бағытын ұсыну.
              </p>
              <p>
                <b>«Бағдаршам»</b> – Жасыл (толық түсіндім), Сары (сұрақтарым бар), Қызыл (көмек қажет).
              </p>
              <p>
                <b>«Бас бармақ»</b> – жылдам экспресс-бағалау.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'differentiation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Саралап оқыту және инклюзивті қолдау (ЕББҚ)
              </h3>
              <p className="text-sm text-slate-600">
                Сыныптағы оқушылардың жеке қажеттіліктері мен қабілеттерін ескеру:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h4 className="font-bold text-slate-900 text-sm mb-2">
                  Саралаудың негізгі 5 тәсілі:
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <b>Тапсырма бойынша:</b> Қарапайымнан күрделіге қарай деңгейлік тапсырмалар (А,
                    В, С).
                  </li>
                  <li>
                    <b>Дереккөздер бойынша:</b> Әртүрлі ақпарат көздері (мәтін, сызба, аудио, бейне).
                  </li>
                  <li>
                    <b>Қарқын бойынша:</b> Тапсырманы тез орындағандарға қосымша шығармашылық
                    жұмыс.
                  </li>
                  <li>
                    <b>Диалог және қолдау:</b> Мұғалімнің жеке көмек көрсетуі, бағыттаушы сұрақтар.
                  </li>
                  <li>
                    <b>Бағалау бойынша:</b> Жеке өсу траекториясын есепке алу.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <h4 className="font-bold text-indigo-950 text-sm mb-2">
                  Ерекше білім беруді қажет ететін (ЕББҚ) оқушыларға қолдау:
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-indigo-900/90">
                  <li>Тапсырмаларды қысқартылған немесе визуалды үлгіде беру.</li>
                  <li>Уақыт регламентін жеңілдету және көмекші карточкалар ұсыну.</li>
                  <li>Жұптық жұмыста қолдау көрсететін серіктес тағайындау.</li>
                  <li>Мотивациясын арттыратын мадақтау жүйесін қолдану.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
