export interface QMJLessonObjectives {
  allStudents: string;
  mostStudents: string;
  someStudents: string;
}

export interface QMJHeader {
  schoolName: string;
  section: string; // Бөлім
  teacherName: string; // Педагогтің Т.А.Ә.
  date: string; // Күні
  grade: string; // Сынып (мысалы 7 «А»)
  attendeesCount: string; // Қатысушылар саны
  absentCount: string; // Қатыспағандар саны
  subject: string; // Пән
  lessonTopic: string; // Сабақтың тақырыбы
  learningObjectives: string; // Оқу бағдарламасына сәйкес оқыту мақсаттары (мысалы: 7.1.2.1)
  lessonObjectives: QMJLessonObjectives; // Сабақтың мақсаты
  valuesOrientation: string; // Құндылықтарға баулу («Біртұтас тәрбие»)
  lessonType: string; // Сабақтың түрі (Жаңа сабақ, т.б.)
  pedagogicalMethods: string; // Әдіс-тәсілдер
}

export interface QMJStageItem {
  id: string;
  stageName: string; // Сабақтың кезеңі / уақыт (Сабақтың басы (0-10 мин), т.б.)
  subStage: string; // Қысқаша сипаттама (Ұйымдастыру, Үй тапсырмасы т.б.)
  teacherActivity: string; // Педагогтің әрекеті
  studentActivity: string; // Оқушының әрекеті
  assessment: string; // Бағалау (дескриптор, ұпай, формативті)
  resources: string; // Ресурстар (оқулық, таратпа материал, сілтеме)
}

export interface QMJConclusion {
  differentiation: string; // Саралау – Сіз қандай тәсілмен көбірек қолдау көрсетпексіз? Қабілетті оқушыларға қандай тапсырмалар бересіз?
  inclusiveSupport?: string; // Ерекше білім беруді қажет ететін (ЕББҚ) оқушыларға қолдау
  assessmentCriteria: string; // Бағалау – Сіз оқушылардың материалды игеру деңгейін қалай тексеруді жоспарлайсыз?
  healthAndSafety: string; // Денсаулық және қауіпсіздік техникасын сақтау
  reflection: string; // Жалпы баға / Сабақ бойынша рефлексия
}

export interface QMJPlan {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  header: QMJHeader;
  stages: QMJStageItem[];
  conclusion: QMJConclusion;
}

export interface QMJGenerateRequest {
  subject: string;
  grade: string;
  lessonTopic: string;
  section?: string;
  learningObjectives?: string;
  teacherName?: string;
  schoolName?: string;
  lessonType?: string;
  selectedMethods?: string[];
  valuesTheme?: string;
  hasInclusiveSupport?: boolean;
  extraPrompt?: string;
}
