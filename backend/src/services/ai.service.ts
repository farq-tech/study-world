import { askClaude, isClaudeAvailable } from '../lib/claude';

const GRADE3_SYSTEM = `أنت معلم ذكي ولطيف لطالب في الصف الثالث الابتدائي في السعودية.
قواعد مهمة:
- استخدم لغة عربية بسيطة جداً مناسبة لطفل عمره 8-9 سنوات
- استخدم أمثلة من الحياة اليومية
- كن مشجعاً ولطيفاً دائماً
- لا تستخدم كلمات صعبة
- اشرح خطوة بخطوة
- استخدم الرموز التعبيرية بشكل معتدل
- شجع التفكير قبل إعطاء الإجابة
- لا تعطِ الإجابة مباشرة، ساعد الطالب يوصل للحل بنفسه`;

export async function explainHomework(title: string, subjectName: string, description: string) {
  if (!isClaudeAvailable()) {
    return generateFallbackExplanation(title, subjectName);
  }

  const prompt = `اشرح هذا الواجب لطالب الصف الثالث:
المادة: ${subjectName}
العنوان: ${title}
الوصف: ${description}

اشرح بطريقة بسيطة ومرحة:
1. ما المطلوب في هذا الواجب؟
2. كيف يمكن حله خطوة بخطوة؟
3. نصائح مهمة`;

  return askClaude(GRADE3_SYSTEM, prompt);
}

export async function generateLessonSummary(lessonTitle: string, subjectName: string, content: string) {
  if (!isClaudeAvailable()) {
    return `ملخص الدرس: ${lessonTitle}\nالمادة: ${subjectName}`;
  }

  const prompt = `لخص هذا الدرس لطالب الصف الثالث:
المادة: ${subjectName}
عنوان الدرس: ${lessonTitle}
المحتوى: ${content}

أريد:
1. رؤوس أقلام (أهم النقاط)
2. الكلمات المهمة
3. فكرة الدرس الرئيسية بجملة واحدة بسيطة
4. ثلاث أسئلة تحضيرية سهلة`;

  return askClaude(GRADE3_SYSTEM, prompt);
}

export async function provideTutoringHelp(question: string, subject: string, context?: string) {
  if (!isClaudeAvailable()) {
    return 'المعلم الذكي غير متاح حالياً. حاول مرة أخرى لاحقاً.';
  }

  const prompt = `الطالب يسأل عن مادة ${subject}:
${context ? `السياق: ${context}\n` : ''}
سؤال الطالب: ${question}

ساعد الطالب بطريقة تعليمية:
- لا تعطِ الإجابة مباشرة
- اعطِ تلميحات أولاً
- ثم وجّه خطوة بخطوة
- شجّع الطالب`;

  return askClaude(GRADE3_SYSTEM, prompt);
}

export async function generateQuizQuestions(
  subjectName: string,
  topic: string,
  count: number = 5,
  difficulty: 'easy' | 'medium' = 'easy'
) {
  if (!isClaudeAvailable()) {
    return generateFallbackQuiz(subjectName, count);
  }

  const prompt = `أنشئ ${count} أسئلة اختبار لمادة ${subjectName}
الموضوع: ${topic}
المستوى: ${difficulty === 'easy' ? 'سهل' : 'متوسط'}
الصف: الثالث الابتدائي

أريد الأسئلة بتنسيق JSON:
[
  {
    "id": "q1",
    "text": "نص السؤال",
    "type": "mcq",
    "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
    "correctAnswer": 0,
    "explanation": "شرح الإجابة الصحيحة",
    "topic": "${topic}"
  }
]

أنواع الأسئلة المتاحة: mcq, true_false
اجعل الأسئلة واضحة وبسيطة ومناسبة للأطفال`;

  const response = await askClaude(GRADE3_SYSTEM, prompt);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  return generateFallbackQuiz(subjectName, count);
}

export async function generateMathDrill(topic: string, count: number = 5) {
  if (!isClaudeAvailable()) {
    return generateFallbackMathDrill(topic, count);
  }

  const prompt = `أنشئ ${count} تمارين رياضيات للصف الثالث الابتدائي
الموضوع: ${topic}

أريد التمارين بتنسيق JSON:
[
  {
    "id": "d1",
    "text": "نص التمرين",
    "type": "mcq",
    "options": ["5", "7", "3", "9"],
    "correctAnswer": 0,
    "explanation": "شرح الحل",
    "topic": "${topic}"
  }
]

اجعل التمارين متدرجة من السهل للأصعب قليلاً`;

  const response = await askClaude(GRADE3_SYSTEM, prompt);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}

  return generateFallbackMathDrill(topic, count);
}

export async function generateMotivationalFeedback(score: number, subject: string) {
  if (score >= 90) return `ماشاء الله! أداء ممتاز في ${subject}! أنت نجم ⭐`;
  if (score >= 70) return `أحسنت! أداء جيد في ${subject}! استمر 💪`;
  if (score >= 50) return `جيد! يمكنك التحسن أكثر في ${subject}. حاول مرة أخرى 🌟`;
  return `لا تقلق! التعلم يحتاج ممارسة. راجع ${subject} وحاول مرة أخرى 📚`;
}

// Fallback functions when Claude is not available
function generateFallbackExplanation(title: string, subject: string) {
  return `📚 الواجب: ${title}\nالمادة: ${subject}\n\nراجع الدرس جيداً واقرأ الأسئلة بعناية.\nإذا واجهت صعوبة، اطلب مساعدة من أهلك أو معلمك.`;
}

function generateFallbackQuiz(subject: string, count: number) {
  const questions = [];
  for (let i = 0; i < Math.min(count, 3); i++) {
    questions.push({
      id: `q${i + 1}`,
      text: `سؤال ${i + 1} في ${subject}`,
      type: 'true_false' as const,
      options: ['صح', 'خطأ'],
      correctAnswer: 0,
      explanation: 'هذه إجابة تجريبية',
      topic: subject,
    });
  }
  return questions;
}

function generateFallbackMathDrill(topic: string, count: number) {
  const drills = [];
  for (let i = 0; i < Math.min(count, 5); i++) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = a + b;
    const options = [String(answer), String(answer + 1), String(answer - 1), String(answer + 2)];

    drills.push({
      id: `d${i + 1}`,
      text: `${a} + ${b} = ؟`,
      type: 'mcq' as const,
      options,
      correctAnswer: 0,
      explanation: `${a} + ${b} = ${answer}`,
      topic,
    });
  }
  return drills;
}
