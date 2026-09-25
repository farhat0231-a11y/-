import { QMJPlan } from '../types/qmj';

export function exportQMJToWord(plan: QMJPlan) {
  const h = plan.header;
  const c = plan.conclusion;

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${plan.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm; /* A4 */
      margin: 1.5cm 1.5cm 1.5cm 2.0cm;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.25;
      color: #000000;
    }
    h1, h2, h3 {
      font-family: 'Times New Roman', Times, serif;
      margin: 4pt 0;
      color: #000000;
    }
    .header-box {
      width: 100%;
      margin-bottom: 12pt;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .text-bold {
      font-weight: bold;
    }
    .qmj-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 12pt;
      font-size: 10.5pt;
    }
    .qmj-table th, .qmj-table td {
      border: 1px solid #000000;
      padding: 6pt 8pt;
      vertical-align: top;
    }
    .qmj-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12pt;
      font-size: 10.5pt;
    }
    .info-table td {
      border: 1px solid #000000;
      padding: 5pt 7pt;
      vertical-align: middle;
    }
    .info-label {
      font-weight: bold;
      width: 30%;
      background-color: #f9f9f9;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 4pt;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Мектеп және бекіту деректері -->
    <table class="header-box" style="border: none;">
      <tr>
        <td style="border: none; width: 50%; vertical-align: top;">
          <p style="margin: 0; font-size: 10pt; font-weight: bold;">${h.schoolName || 'Білім беру ұйымының атауы'}</p>
          <p style="margin: 2pt 0 0 0; font-size: 9.5pt; color: #444;">Педагог: ${h.teacherName || '________________'}</p>
        </td>
        <td style="border: none; width: 50%; text-align: right; vertical-align: top;">
          <p style="margin: 0; font-size: 10pt; font-weight: bold;">«БЕКІТЕМІН»</p>
          <p style="margin: 2pt 0; font-size: 9.5pt;">Мектеп директоры: _______________</p>
          <p style="margin: 2pt 0; font-size: 9.5pt;">«____» _______________ 202__ ж.</p>
        </td>
      </tr>
    </table>

    <div class="text-center" style="margin-top: 10pt; margin-bottom: 12pt;">
      <h2 style="font-size: 13pt; margin-bottom: 2pt;">ҚЫСҚА МЕРЗІМДІ САБАҚ ЖОСПАРЫ (ҚМЖ)</h2>
      <p style="margin: 0; font-size: 11pt; font-style: italic;">ҚР Оқу-ағарту министрлігінің стандартына сай</p>
    </div>

    <!-- 1. Жалпы мәліметтер кестесі -->
    <table class="info-table">
      <tr>
        <td class="info-label">Бөлім:</td>
        <td>${h.section || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Педагогтің Т.А.Ә.:</td>
        <td>${h.teacherName || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Күні:</td>
        <td>${h.date || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Сынып:</td>
        <td>${h.grade || '—'} &nbsp;&nbsp;&nbsp;&nbsp; <b>Қатысқандар саны:</b> ${h.attendeesCount || '—'} &nbsp;&nbsp;&nbsp;&nbsp; <b>Қатыспағандар саны:</b> ${h.absentCount || '0'}</td>
      </tr>
      <tr>
        <td class="info-label">Пән:</td>
        <td><b>${h.subject || '—'}</b></td>
      </tr>
      <tr>
        <td class="info-label">Сабақтың тақырыбы:</td>
        <td><b>${h.lessonTopic || '—'}</b></td>
      </tr>
      <tr>
        <td class="info-label">Оқу бағдарламасына сәйкес оқыту мақсаттары:</td>
        <td>${h.learningObjectives || '—'}</td>
      </tr>
      <tr>
        <td class="info-label">Сабақтың мақсаты:</td>
        <td>
          <p style="margin: 0 0 3pt 0;"><b>Барлық оқушылар үшін:</b> ${h.lessonObjectives?.allStudents || '—'}</p>
          <p style="margin: 0 0 3pt 0;"><b>Көпшілігі үшін:</b> ${h.lessonObjectives?.mostStudents || '—'}</p>
          <p style="margin: 0;"><b>Кейбір оқушылар үшін:</b> ${h.lessonObjectives?.someStudents || '—'}</p>
        </td>
      </tr>
      <tr>
        <td class="info-label">Құндылықтарға баулу:</td>
        <td>${h.valuesOrientation || '«Біртұтас тәрбие» бағдарламасы бойынша'}</td>
      </tr>
      <tr>
        <td class="info-label">Сабақ түрі және әдістері:</td>
        <td><b>Түрі:</b> ${h.lessonType || 'Жаңа сабақ'} <br/><b>Әдіс-тәсілдер:</b> ${h.pedagogicalMethods || 'Интербелсенді'}</td>
      </tr>
    </table>

    <!-- 2. Сабақтың барысы кестесі -->
    <div class="section-title">Сабақтың барысы</div>
    <table class="qmj-table">
      <thead>
        <tr>
          <th style="width: 14%;">Сабақтың кезеңі / уақыт</th>
          <th style="width: 28%;">Педагогтің әрекеті</th>
          <th style="width: 28%;">Оқушының әрекеті</th>
          <th style="width: 16%;">Бағалау</th>
          <th style="width: 14%;">Ресурстар</th>
        </tr>
      </thead>
      <tbody>
        ${plan.stages
          .map(
            (stage) => `
        <tr>
          <td>
            <b>${stage.stageName}</b>
            ${stage.subStage ? `<br/><i style="font-size: 9.5pt; color: #333;">${stage.subStage}</i>` : ''}
          </td>
          <td>${stage.teacherActivity.replace(/\n/g, '<br/>')}</td>
          <td>${stage.studentActivity.replace(/\n/g, '<br/>')}</td>
          <td>${stage.assessment.replace(/\n/g, '<br/>')}</td>
          <td>${stage.resources.replace(/\n/g, '<br/>')}</td>
        </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>

    <!-- 3. Саралау, Бағалау, Денсаулық кестесі -->
    <div class="section-title">Қосымша ақпарат және саралау</div>
    <table class="info-table">
      <tr>
        <td class="info-label" style="width: 30%;">Саралау – Сіз қандай тәсілмен көбірек қолдау көрсетпексіз? Қабілетті оқушыларға қандай тапсырмалар бересіз?</td>
        <td>${c.differentiation.replace(/\n/g, '<br/>')}</td>
      </tr>
      ${
        c.inclusiveSupport
          ? `<tr>
        <td class="info-label" style="width: 30%;">Ерекше білім беруді қажет ететін (ЕББҚ) оқушыларға қолдау:</td>
        <td>${c.inclusiveSupport.replace(/\n/g, '<br/>')}</td>
      </tr>`
          : ''
      }
      <tr>
        <td class="info-label" style="width: 30%;">Бағалау – Сіз оқушылардың материалды игеру деңгейін қалай тексеруді жоспарлап отырсыз?</td>
        <td>${c.assessmentCriteria.replace(/\n/g, '<br/>')}</td>
      </tr>
      <tr>
        <td class="info-label" style="width: 30%;">Денсаулық және қауіпсіздік техникасын сақтау:</td>
        <td>${c.healthAndSafety.replace(/\n/g, '<br/>')}</td>
      </tr>
      <tr>
        <td class="info-label" style="width: 30%;">Жалпы баға / Сабақ бойынша рефлексия:</td>
        <td>${c.reflection.replace(/\n/g, '<br/>')}</td>
      </tr>
    </table>

    <table style="width: 100%; border: none; margin-top: 25pt;">
      <tr>
        <td style="border: none; width: 50%;">
          Пән мұғалімінің қолы: ___________________
        </td>
        <td style="border: none; width: 50%; text-align: right;">
          Күні: «____» _______________ 202__ ж.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const sanitizedFileName = (plan.header.lessonTopic || plan.title || 'QMJ_Zhospary')
    .replace(/[^\w\d\u0400-\u04FF\s-_]/gi, '')
    .trim()
    .slice(0, 50);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ҚМЖ_${sanitizedFileName || 'сабақ_жоспары'}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyPlanToClipboard(plan: QMJPlan): Promise<void> {
  const h = plan.header;
  const c = plan.conclusion;

  let text = `ҚЫСҚА МЕРЗІМДІ САБАҚ ЖОСПАРЫ (ҚМЖ)\n`;
  text += `Білім беру ұйымы: ${h.schoolName}\n`;
  text += `Педагогтің Т.А.Ә.: ${h.teacherName}\n`;
  text += `Күні: ${h.date} | Сынып: ${h.grade} | Қатысқандар: ${h.attendeesCount} | Қатыспағандар: ${h.absentCount}\n`;
  text += `Пән: ${h.subject}\n`;
  text += `Сабақтың тақырыбы: ${h.lessonTopic}\n`;
  text += `Бөлім: ${h.section}\n`;
  text += `Оқу мақсаты: ${h.learningObjectives}\n`;
  text += `Сабақтың мақсаты:\n  - Барлық оқушылар: ${h.lessonObjectives?.allStudents}\n  - Көпшілігі: ${h.lessonObjectives?.mostStudents}\n  - Кейбір оқушылар: ${h.lessonObjectives?.someStudents}\n`;
  text += `Құндылықтар: ${h.valuesOrientation}\n`;
  text += `Сабақ түрі: ${h.lessonType} | Әдіс-тәсілдері: ${h.pedagogicalMethods}\n\n`;

  text += `--- САБАҚТЫҢ БАРЫСЫ ---\n`;
  plan.stages.forEach((s) => {
    text += `\n[${s.stageName}] - ${s.subStage}\n`;
    text += `Мұғалімнің әрекеті:\n${s.teacherActivity}\n`;
    text += `Оқушының әрекеті:\n${s.studentActivity}\n`;
    text += `Бағалау:\n${s.assessment}\n`;
    text += `Ресурстар: ${s.resources}\n`;
  });

  text += `\n--- ҚОСЫМША АҚПАРАТ ---\n`;
  text += `Саралау: ${c.differentiation}\n`;
  if (c.inclusiveSupport) {
    text += `ЕББҚ қолдау: ${c.inclusiveSupport}\n`;
  }
  text += `Бағалау критерийлері: ${c.assessmentCriteria}\n`;
  text += `Денсаулық және техникалық қауіпсіздік: ${c.healthAndSafety}\n`;
  text += `Рефлексия: ${c.reflection}\n`;

  return navigator.clipboard.writeText(text);
}
