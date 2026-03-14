import { PrismaClient, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studentBadge.deleteMany();
  await prisma.weaknessArea.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.studentSubject.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  // ========== USERS ==========
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash,
      nameAr: 'محمد المدير',
      nameEn: 'Mohammed Admin',
      role: 'ADMIN',
      email: 'admin@studyworld.sa',
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      username: 'parent',
      passwordHash,
      nameAr: 'أبو أحمد',
      nameEn: 'Abu Ahmed',
      role: 'PARENT',
    },
  });

  const ahmedUser = await prisma.user.create({
    data: {
      username: 'ahmed',
      passwordHash,
      nameAr: 'أحمد النقيدان',
      nameEn: 'Ahmed Al-Naqeedan',
      role: 'STUDENT',
      avatarUrl: '🧑‍🎓',
    },
  });

  const abdulrahmanUser = await prisma.user.create({
    data: {
      username: 'abdulrahman',
      passwordHash,
      nameAr: 'عبدالرحمن بن كليب',
      nameEn: 'Abdulrahman Bin Kulaib',
      role: 'STUDENT',
      avatarUrl: '👦',
    },
  });

  // ========== STUDENTS ==========
  const ahmed = await prisma.student.create({
    data: {
      userId: ahmedUser.id,
      gradeLevel: 'الصف الثالث الابتدائي',
      className: 'الثالث أ',
      points: 250,
      level: 3,
      currentStreak: 5,
      longestStreak: 12,
      parentId: parentUser.id,
      lastActivityAt: new Date(),
    },
  });

  const abdulrahman = await prisma.student.create({
    data: {
      userId: abdulrahmanUser.id,
      gradeLevel: 'الصف الثالث الابتدائي',
      className: 'الثالث أ',
      points: 180,
      level: 2,
      currentStreak: 3,
      longestStreak: 7,
      parentId: parentUser.id,
      lastActivityAt: new Date(),
    },
  });

  // ========== SUBJECTS ==========
  const subjects = await Promise.all([
    prisma.subject.create({ data: { nameAr: 'الرياضيات', nameEn: 'Mathematics', slug: 'math', icon: '🔢', color: '#3b82f6', isMathFocus: true, sortOrder: 1 } }),
    prisma.subject.create({ data: { nameAr: 'لغتي', nameEn: 'Arabic Language', slug: 'arabic', icon: '📖', color: '#22c55e', sortOrder: 2 } }),
    prisma.subject.create({ data: { nameAr: 'العلوم', nameEn: 'Science', slug: 'science', icon: '🔬', color: '#8b5cf6', sortOrder: 3 } }),
    prisma.subject.create({ data: { nameAr: 'الدراسات الإسلامية', nameEn: 'Islamic Studies', slug: 'islamic', icon: '🕌', color: '#14b8a6', sortOrder: 4 } }),
    prisma.subject.create({ data: { nameAr: 'القرآن الكريم', nameEn: 'Quran', slug: 'quran', icon: '📗', color: '#059669', sortOrder: 5 } }),
    prisma.subject.create({ data: { nameAr: 'الإنجليزي', nameEn: 'English', slug: 'english', icon: '🌍', color: '#f97316', sortOrder: 6 } }),
    prisma.subject.create({ data: { nameAr: 'المهارات الحياتية', nameEn: 'Life Skills', slug: 'life-skills', icon: '🌟', color: '#eab308', sortOrder: 7 } }),
    prisma.subject.create({ data: { nameAr: 'التربية البدنية', nameEn: 'Physical Education', slug: 'pe', icon: '⚽', color: '#ef4444', sortOrder: 8 } }),
    prisma.subject.create({ data: { nameAr: 'التربية الفنية', nameEn: 'Art', slug: 'art', icon: '🎨', color: '#ec4899', sortOrder: 9 } }),
  ]);

  const [math, arabic, science, islamic, quran, english, lifeSkills, pe, art] = subjects;

  // ========== TEACHERS ==========
  const teachers = await Promise.all([
    prisma.teacher.create({ data: { nameAr: 'أ. خالد العتيبي', phone: '0501234567', note: 'معلم الرياضيات' } }),
    prisma.teacher.create({ data: { nameAr: 'أ. فهد السبيعي', phone: '0507654321', note: 'معلم لغتي' } }),
    prisma.teacher.create({ data: { nameAr: 'أ. سعد الدوسري', phone: '0509876543', note: 'معلم العلوم' } }),
    prisma.teacher.create({ data: { nameAr: 'أ. عبدالله الشمري', note: 'معلم الدراسات الإسلامية والقرآن' } }),
    prisma.teacher.create({ data: { nameAr: 'أ. محمد الحربي', note: 'معلم الإنجليزي' } }),
    prisma.teacher.create({ data: { nameAr: 'أ. ناصر القحطاني', note: 'معلم التربية البدنية' } }),
    prisma.teacher.create({ data: { nameAr: 'أ. أحمد المالكي', note: 'معلم التربية الفنية والمهارات' } }),
  ]);

  const [tMath, tArabic, tScience, tIslamic, tEnglish, tPe, tArt] = teachers;

  // Teacher-Subject assignments
  await Promise.all([
    prisma.teacherSubject.create({ data: { teacherId: tMath.id, subjectId: math.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tArabic.id, subjectId: arabic.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tScience.id, subjectId: science.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tIslamic.id, subjectId: islamic.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tIslamic.id, subjectId: quran.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tEnglish.id, subjectId: english.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tArt.id, subjectId: lifeSkills.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tPe.id, subjectId: pe.id } }),
    prisma.teacherSubject.create({ data: { teacherId: tArt.id, subjectId: art.id } }),
  ]);

  // ========== STUDENT-SUBJECT ENROLLMENT ==========
  for (const student of [ahmed, abdulrahman]) {
    for (const subject of subjects) {
      await prisma.studentSubject.create({
        data: { studentId: student.id, subjectId: subject.id },
      });
    }
  }

  // ========== SCHEDULES ==========
  const scheduleTemplate: { day: DayOfWeek; periods: { subjectIdx: number; teacherIdx: number; start: string; end: string }[] }[] = [
    { day: 'SUNDAY', periods: [
      { subjectIdx: 3, teacherIdx: 3, start: '07:00', end: '07:45' },
      { subjectIdx: 4, teacherIdx: 3, start: '07:50', end: '08:35' },
      { subjectIdx: 0, teacherIdx: 0, start: '08:55', end: '09:40' },
      { subjectIdx: 1, teacherIdx: 1, start: '09:45', end: '10:30' },
      { subjectIdx: 2, teacherIdx: 2, start: '10:50', end: '11:35' },
      { subjectIdx: 5, teacherIdx: 4, start: '11:40', end: '12:25' },
    ]},
    { day: 'MONDAY', periods: [
      { subjectIdx: 0, teacherIdx: 0, start: '07:00', end: '07:45' },
      { subjectIdx: 0, teacherIdx: 0, start: '07:50', end: '08:35' },
      { subjectIdx: 1, teacherIdx: 1, start: '08:55', end: '09:40' },
      { subjectIdx: 2, teacherIdx: 2, start: '09:45', end: '10:30' },
      { subjectIdx: 7, teacherIdx: 5, start: '10:50', end: '11:35' },
      { subjectIdx: 6, teacherIdx: 6, start: '11:40', end: '12:25' },
    ]},
    { day: 'TUESDAY', periods: [
      { subjectIdx: 4, teacherIdx: 3, start: '07:00', end: '07:45' },
      { subjectIdx: 3, teacherIdx: 3, start: '07:50', end: '08:35' },
      { subjectIdx: 1, teacherIdx: 1, start: '08:55', end: '09:40' },
      { subjectIdx: 0, teacherIdx: 0, start: '09:45', end: '10:30' },
      { subjectIdx: 5, teacherIdx: 4, start: '10:50', end: '11:35' },
      { subjectIdx: 8, teacherIdx: 6, start: '11:40', end: '12:25' },
    ]},
    { day: 'WEDNESDAY', periods: [
      { subjectIdx: 0, teacherIdx: 0, start: '07:00', end: '07:45' },
      { subjectIdx: 1, teacherIdx: 1, start: '07:50', end: '08:35' },
      { subjectIdx: 2, teacherIdx: 2, start: '08:55', end: '09:40' },
      { subjectIdx: 3, teacherIdx: 3, start: '09:45', end: '10:30' },
      { subjectIdx: 6, teacherIdx: 6, start: '10:50', end: '11:35' },
      { subjectIdx: 7, teacherIdx: 5, start: '11:40', end: '12:25' },
    ]},
    { day: 'THURSDAY', periods: [
      { subjectIdx: 1, teacherIdx: 1, start: '07:00', end: '07:45' },
      { subjectIdx: 0, teacherIdx: 0, start: '07:50', end: '08:35' },
      { subjectIdx: 5, teacherIdx: 4, start: '08:55', end: '09:40' },
      { subjectIdx: 4, teacherIdx: 3, start: '09:45', end: '10:30' },
      { subjectIdx: 8, teacherIdx: 6, start: '10:50', end: '11:35' },
    ]},
  ];

  for (const student of [ahmed, abdulrahman]) {
    for (const daySchedule of scheduleTemplate) {
      for (let i = 0; i < daySchedule.periods.length; i++) {
        const p = daySchedule.periods[i];
        await prisma.schedule.create({
          data: {
            studentId: student.id,
            subjectId: subjects[p.subjectIdx].id,
            teacherId: teachers[p.teacherIdx].id,
            dayOfWeek: daySchedule.day,
            periodNumber: i + 1,
            startTime: p.start,
            endTime: p.end,
          },
        });
      }
    }
  }

  // ========== LESSONS ==========
  const lessonData = [
    { subjectId: math.id, title: 'الجمع والطرح حتى 999', content: 'في هذا الدرس نتعلم جمع وطرح الأعداد حتى 999. نبدأ بمراجعة خانات الآحاد والعشرات والمئات.', chapter: 1, lessonOrder: 1 },
    { subjectId: math.id, title: 'الضرب في 2 و 5 و 10', content: 'نتعلم جدول الضرب في 2 و 5 و 10. الضرب هو جمع متكرر.', chapter: 2, lessonOrder: 2 },
    { subjectId: math.id, title: 'القسمة البسيطة', content: 'القسمة هي عكس الضرب. نتعلم قسمة الأعداد البسيطة.', chapter: 3, lessonOrder: 3 },
    { subjectId: math.id, title: 'الأشكال الهندسية', content: 'نتعرف على المربع والمستطيل والمثلث والدائرة وخصائص كل شكل.', chapter: 4, lessonOrder: 4 },
    { subjectId: arabic.id, title: 'قراءة: حي التعاون', content: 'نقرأ نص حي التعاون ونتعلم عن أهمية التعاون بين الجيران.', chapter: 1, lessonOrder: 1 },
    { subjectId: arabic.id, title: 'الجملة الاسمية والفعلية', content: 'الجملة الاسمية تبدأ باسم والجملة الفعلية تبدأ بفعل.', chapter: 2, lessonOrder: 2 },
    { subjectId: arabic.id, title: 'أنواع الكلمة', content: 'الكلمة ثلاثة أنواع: اسم وفعل وحرف.', chapter: 3, lessonOrder: 3 },
    { subjectId: science.id, title: 'المخلوقات الحية', content: 'المخلوقات الحية تتنفس وتتغذى وتنمو وتتكاثر.', chapter: 1, lessonOrder: 1 },
    { subjectId: science.id, title: 'النباتات وأجزاؤها', content: 'للنبات جذور وساق وأوراق وأزهار. كل جزء له وظيفة.', chapter: 2, lessonOrder: 2 },
    { subjectId: islamic.id, title: 'أركان الإسلام', content: 'أركان الإسلام خمسة: الشهادتان والصلاة والزكاة والصوم والحج.', chapter: 1, lessonOrder: 1 },
    { subjectId: islamic.id, title: 'آداب المسجد', content: 'من آداب المسجد: الدخول بالرجل اليمنى والدعاء والسكينة.', chapter: 2, lessonOrder: 2 },
    { subjectId: english.id, title: 'Colors and Numbers', content: 'Learn colors: red, blue, green, yellow. Numbers: 1-20.', chapter: 1, lessonOrder: 1 },
    { subjectId: english.id, title: 'My Family', content: 'Learn family words: father, mother, brother, sister.', chapter: 2, lessonOrder: 2 },
  ];

  for (const lesson of lessonData) {
    await prisma.lesson.create({ data: lesson });
  }

  // ========== HOMEWORK ==========
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (const student of [ahmed, abdulrahman]) {
    await prisma.homework.create({
      data: {
        studentId: student.id,
        subjectId: math.id,
        title: 'حل تمارين الجمع والطرح',
        description: 'حل التمارين من صفحة 25 إلى 27 في كتاب الرياضيات',
        dueDate: tomorrow,
        status: 'PENDING',
      },
    });
    await prisma.homework.create({
      data: {
        studentId: student.id,
        subjectId: arabic.id,
        title: 'كتابة موضوع عن التعاون',
        description: 'اكتب فقرة من 5 جمل عن أهمية التعاون',
        dueDate: nextWeek,
        status: 'PENDING',
      },
    });
    await prisma.homework.create({
      data: {
        studentId: student.id,
        subjectId: science.id,
        title: 'رسم أجزاء النبات',
        description: 'ارسم نباتاً وأشر إلى أجزائه: الجذور والساق والأوراق والأزهار',
        dueDate: nextWeek,
        status: 'PENDING',
      },
    });
    await prisma.homework.create({
      data: {
        studentId: student.id,
        subjectId: math.id,
        title: 'جدول الضرب في 2',
        description: 'احفظ جدول الضرب في 2 واكتبه 3 مرات',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'SUBMITTED',
        submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        grade: 90,
        feedback: 'أحسنت! عمل ممتاز',
      },
    });
  }

  // ========== QUIZZES ==========
  const mathQuiz = await prisma.quiz.create({
    data: {
      subjectId: math.id,
      title: 'اختبار يومي - الجمع والطرح',
      type: 'DAILY',
      totalMarks: 5,
      timeLimit: 10,
      questions: [
        { id: 'q1', text: 'ما ناتج 25 + 13؟', type: 'mcq', options: ['38', '28', '35', '48'], correctAnswer: 0, explanation: '25 + 13 = 38', topic: 'الجمع' },
        { id: 'q2', text: 'ما ناتج 50 - 22؟', type: 'mcq', options: ['32', '28', '22', '30'], correctAnswer: 1, explanation: '50 - 22 = 28', topic: 'الطرح' },
        { id: 'q3', text: '15 + 15 = 30', type: 'true_false', options: ['صح', 'خطأ'], correctAnswer: 0, explanation: '15 + 15 = 30 ✓', topic: 'الجمع' },
        { id: 'q4', text: 'ما ناتج 100 - 45؟', type: 'mcq', options: ['65', '55', '45', '35'], correctAnswer: 1, explanation: '100 - 45 = 55', topic: 'الطرح' },
        { id: 'q5', text: 'ما ناتج 33 + 17؟', type: 'mcq', options: ['40', '50', '60', '45'], correctAnswer: 1, explanation: '33 + 17 = 50', topic: 'الجمع' },
      ],
    },
  });

  const arabicQuiz = await prisma.quiz.create({
    data: {
      subjectId: arabic.id,
      title: 'اختبار يومي - أنواع الجملة',
      type: 'DAILY',
      totalMarks: 4,
      timeLimit: 8,
      questions: [
        { id: 'q1', text: '"ذهب أحمد إلى المدرسة" هذه جملة...', type: 'mcq', options: ['فعلية', 'اسمية', 'حرفية'], correctAnswer: 0, explanation: 'بدأت بفعل "ذهب" فهي جملة فعلية' },
        { id: 'q2', text: '"الشمس مشرقة" هذه جملة...', type: 'mcq', options: ['اسمية', 'فعلية', 'حرفية'], correctAnswer: 0, explanation: 'بدأت باسم "الشمس" فهي جملة اسمية' },
        { id: 'q3', text: 'الجملة الفعلية تبدأ بفعل', type: 'true_false', options: ['صح', 'خطأ'], correctAnswer: 0, explanation: 'نعم الجملة الفعلية تبدأ بفعل' },
        { id: 'q4', text: 'ما نوع كلمة "كتاب"؟', type: 'mcq', options: ['اسم', 'فعل', 'حرف'], correctAnswer: 0, explanation: 'كتاب هو اسم لأنه يدل على شيء' },
      ],
    },
  });

  const weeklyQuiz = await prisma.quiz.create({
    data: {
      subjectId: math.id,
      title: 'الاختبار الأسبوعي الشامل - الرياضيات',
      type: 'WEEKLY',
      totalMarks: 10,
      timeLimit: 20,
      weekNumber: 1,
      questions: [
        { id: 'q1', text: 'ما ناتج 234 + 156؟', type: 'mcq', options: ['390', '380', '400', '370'], correctAnswer: 0, explanation: '234 + 156 = 390', topic: 'الجمع' },
        { id: 'q2', text: 'ما ناتج 500 - 275؟', type: 'mcq', options: ['225', '235', '215', '245'], correctAnswer: 0, explanation: '500 - 275 = 225', topic: 'الطرح' },
        { id: 'q3', text: 'ما ناتج 5 × 3؟', type: 'mcq', options: ['15', '20', '10', '8'], correctAnswer: 0, explanation: '5 × 3 = 15', topic: 'الضرب' },
        { id: 'q4', text: 'ما ناتج 2 × 7؟', type: 'mcq', options: ['14', '12', '16', '9'], correctAnswer: 0, explanation: '2 × 7 = 14', topic: 'الضرب' },
        { id: 'q5', text: 'كم عدد أضلاع المثلث؟', type: 'mcq', options: ['3', '4', '5', '6'], correctAnswer: 0, explanation: 'المثلث له 3 أضلاع', topic: 'الأشكال' },
        { id: 'q6', text: 'كم عدد أضلاع المربع؟', type: 'mcq', options: ['4', '3', '5', '6'], correctAnswer: 0, explanation: 'المربع له 4 أضلاع متساوية', topic: 'الأشكال' },
        { id: 'q7', text: '10 × 10 = 100', type: 'true_false', options: ['صح', 'خطأ'], correctAnswer: 0, explanation: '10 × 10 = 100 ✓', topic: 'الضرب' },
        { id: 'q8', text: 'ما ناتج 999 - 500؟', type: 'mcq', options: ['499', '500', '498', '501'], correctAnswer: 0, explanation: '999 - 500 = 499', topic: 'الطرح' },
        { id: 'q9', text: 'أيهما أكبر: 456 أم 465؟', type: 'mcq', options: ['465', '456', 'متساويان'], correctAnswer: 0, explanation: '465 > 456', topic: 'المقارنة' },
        { id: 'q10', text: 'ما ناتج 5 × 10؟', type: 'mcq', options: ['50', '15', '55', '45'], correctAnswer: 0, explanation: '5 × 10 = 50', topic: 'الضرب' },
      ],
    },
  });

  // ========== GRADES ==========
  const gradeData = [
    { studentId: ahmed.id, subjectId: math.id, title: 'اختبار الفصل الأول', category: 'exam', score: 88, maxScore: 100 },
    { studentId: ahmed.id, subjectId: math.id, title: 'واجب الضرب', category: 'homework', score: 95, maxScore: 100 },
    { studentId: ahmed.id, subjectId: arabic.id, title: 'اختبار القراءة', category: 'exam', score: 92, maxScore: 100 },
    { studentId: ahmed.id, subjectId: arabic.id, title: 'واجب الإملاء', category: 'homework', score: 85, maxScore: 100 },
    { studentId: ahmed.id, subjectId: science.id, title: 'اختبار المخلوقات الحية', category: 'exam', score: 90, maxScore: 100 },
    { studentId: ahmed.id, subjectId: islamic.id, title: 'حفظ السور', category: 'participation', score: 95, maxScore: 100 },
    { studentId: ahmed.id, subjectId: english.id, title: 'Vocabulary Test', category: 'exam', score: 78, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: math.id, title: 'اختبار الفصل الأول', category: 'exam', score: 75, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: math.id, title: 'واجب الضرب', category: 'homework', score: 70, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: arabic.id, title: 'اختبار القراءة', category: 'exam', score: 85, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: arabic.id, title: 'واجب الإملاء', category: 'homework', score: 80, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: science.id, title: 'اختبار المخلوقات الحية', category: 'exam', score: 82, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: islamic.id, title: 'حفظ السور', category: 'participation', score: 90, maxScore: 100 },
    { studentId: abdulrahman.id, subjectId: english.id, title: 'Vocabulary Test', category: 'exam', score: 72, maxScore: 100 },
  ];

  for (const grade of gradeData) {
    await prisma.grade.create({ data: grade });
  }

  // ========== BADGES ==========
  const badges = await Promise.all([
    prisma.badge.create({ data: { code: 'math_hero', nameAr: 'بطل الرياضيات', descriptionAr: 'أكمل 10 تمارين رياضيات', icon: '🏆', category: 'academic', pointsValue: 50, sortOrder: 1, requirement: { type: 'quiz_count', count: 10 } } }),
    prisma.badge.create({ data: { code: 'homework_star', nameAr: 'نجم الواجبات', descriptionAr: 'سلّم 5 واجبات', icon: '⭐', category: 'academic', pointsValue: 30, sortOrder: 2, requirement: { type: 'homework_count', count: 5 } } }),
    prisma.badge.create({ data: { code: 'quiz_master', nameAr: 'ملك الاختبارات', descriptionAr: 'احصل على 100% في اختبار', icon: '👑', category: 'academic', pointsValue: 40, sortOrder: 3, requirement: { type: 'quiz_perfect' } } }),
    prisma.badge.create({ data: { code: 'streak_3', nameAr: 'المتابع', descriptionAr: 'حافظ على 3 أيام متتالية', icon: '🔥', category: 'streak', pointsValue: 15, sortOrder: 4, requirement: { type: 'streak', count: 3 } } }),
    prisma.badge.create({ data: { code: 'streak_7', nameAr: 'فارس المراجعة', descriptionAr: 'حافظ على 7 أيام متتالية', icon: '🛡️', category: 'streak', pointsValue: 30, sortOrder: 5, requirement: { type: 'streak', count: 7 } } }),
    prisma.badge.create({ data: { code: 'streak_14', nameAr: 'المثابر', descriptionAr: 'حافظ على 14 يوم متتالي', icon: '💎', category: 'streak', pointsValue: 50, sortOrder: 6, requirement: { type: 'streak', count: 14 } } }),
    prisma.badge.create({ data: { code: 'first_quiz', nameAr: 'الخطوة الأولى', descriptionAr: 'أكمل أول اختبار', icon: '🎯', category: 'participation', pointsValue: 10, sortOrder: 7, requirement: { type: 'quiz_count', count: 1 } } }),
    prisma.badge.create({ data: { code: 'reader', nameAr: 'محب القراءة', descriptionAr: 'راجع 5 دروس', icon: '📚', category: 'academic', pointsValue: 25, sortOrder: 8, requirement: { type: 'points', count: 100 } } }),
    prisma.badge.create({ data: { code: 'punctual', nameAr: 'ملتزم المواعيد', descriptionAr: 'سلّم جميع الواجبات في وقتها', icon: '⏰', category: 'participation', pointsValue: 35, sortOrder: 9, requirement: { type: 'homework_count', count: 10 } } }),
    prisma.badge.create({ data: { code: 'week_star', nameAr: 'متفوق الأسبوع', descriptionAr: 'احصل على أعلى درجة أسبوعية', icon: '🌟', category: 'special', pointsValue: 60, sortOrder: 10, requirement: { type: 'points', count: 500 } } }),
    prisma.badge.create({ data: { code: 'hundred_points', nameAr: 'جامع النقاط', descriptionAr: 'اجمع 100 نقطة', icon: '💰', category: 'participation', pointsValue: 20, sortOrder: 11, requirement: { type: 'points', count: 100 } } }),
    prisma.badge.create({ data: { code: 'explorer', nameAr: 'المستكشف', descriptionAr: 'استخدم المعلم الذكي 5 مرات', icon: '🔍', category: 'participation', pointsValue: 15, sortOrder: 12, requirement: { type: 'points', count: 50 } } }),
  ]);

  // Award some badges to students
  await prisma.studentBadge.create({ data: { studentId: ahmed.id, badgeId: badges[3].id } }); // streak_3
  await prisma.studentBadge.create({ data: { studentId: ahmed.id, badgeId: badges[4].id } }); // streak_7
  await prisma.studentBadge.create({ data: { studentId: ahmed.id, badgeId: badges[6].id } }); // first_quiz
  await prisma.studentBadge.create({ data: { studentId: ahmed.id, badgeId: badges[10].id } }); // hundred_points
  await prisma.studentBadge.create({ data: { studentId: abdulrahman.id, badgeId: badges[3].id } }); // streak_3
  await prisma.studentBadge.create({ data: { studentId: abdulrahman.id, badgeId: badges[6].id } }); // first_quiz

  // ========== HOLIDAYS ==========
  await Promise.all([
    prisma.holiday.create({ data: { nameAr: 'اليوم الوطني السعودي', nameEn: 'Saudi National Day', startDate: new Date('2026-09-23'), endDate: new Date('2026-09-23'), holidayType: 'NATIONAL' } }),
    prisma.holiday.create({ data: { nameAr: 'يوم التأسيس', nameEn: 'Founding Day', startDate: new Date('2026-02-22'), endDate: new Date('2026-02-22'), holidayType: 'NATIONAL' } }),
    prisma.holiday.create({ data: { nameAr: 'إجازة عيد الفطر', nameEn: 'Eid Al-Fitr Break', startDate: new Date('2026-03-20'), endDate: new Date('2026-04-03'), holidayType: 'NATIONAL' } }),
    prisma.holiday.create({ data: { nameAr: 'إجازة عيد الأضحى', nameEn: 'Eid Al-Adha Break', startDate: new Date('2026-05-27'), endDate: new Date('2026-06-07'), holidayType: 'NATIONAL' } }),
    prisma.holiday.create({ data: { nameAr: 'إجازة منتصف الفصل الأول', nameEn: 'Mid-Semester 1 Break', startDate: new Date('2025-10-16'), endDate: new Date('2025-10-20'), holidayType: 'SCHOOL_BREAK' } }),
    prisma.holiday.create({ data: { nameAr: 'إجازة نهاية الفصل الأول', nameEn: 'End of Semester 1', startDate: new Date('2025-12-20'), endDate: new Date('2026-01-04'), holidayType: 'SCHOOL_BREAK' } }),
    prisma.holiday.create({ data: { nameAr: 'إجازة منتصف الفصل الثاني', nameEn: 'Mid-Semester 2 Break', startDate: new Date('2026-03-05'), endDate: new Date('2026-03-15'), holidayType: 'SCHOOL_BREAK' } }),
    prisma.holiday.create({ data: { nameAr: 'إجازة نهاية العام الدراسي', nameEn: 'End of School Year', startDate: new Date('2026-06-18'), endDate: new Date('2026-08-28'), holidayType: 'SCHOOL_BREAK' } }),
  ]);

  // ========== WEAKNESS AREAS ==========
  await prisma.weaknessArea.create({
    data: {
      studentId: ahmed.id,
      subjectId: math.id,
      topic: 'الضرب',
      description: 'يحتاج تمارين إضافية في جدول الضرب',
      severity: 3,
      recommendation: 'مراجعة جدول الضرب يومياً مع تمارين تفاعلية',
    },
  });

  await prisma.weaknessArea.create({
    data: {
      studentId: abdulrahman.id,
      subjectId: math.id,
      topic: 'الطرح مع الاستلاف',
      description: 'صعوبة في عمليات الطرح التي تحتاج استلاف',
      severity: 4,
      recommendation: 'شرح مفهوم الاستلاف بالصور والأمثلة العملية',
    },
  });

  await prisma.weaknessArea.create({
    data: {
      studentId: abdulrahman.id,
      subjectId: math.id,
      topic: 'القسمة',
      description: 'يحتاج تأسيس في مفهوم القسمة',
      severity: 2,
      recommendation: 'ربط القسمة بالتوزيع العادل وأمثلة حياتية',
    },
  });

  // ========== NOTIFICATIONS ==========
  for (const student of [ahmed, abdulrahman]) {
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'مرحباً بك في عالم الدراسة! 🎉',
        message: 'نتمنى لك رحلة تعلم ممتعة ومفيدة',
        type: 'SYSTEM',
      },
    });
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'واجب جديد 📝',
        message: 'لديك واجب رياضيات جديد - حل تمارين الجمع والطرح',
        type: 'HOMEWORK',
        data: { subjectName: 'الرياضيات' },
      },
    });
  }

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Admin:       admin / password123');
  console.log('   Parent:      parent / password123');
  console.log('   Student 1:   ahmed / password123');
  console.log('   Student 2:   abdulrahman / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
