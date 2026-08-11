import { Exam, Question, QuestionDifficulty, StudentAnswer, ExamSubtest, SubtestResult } from '../types';

/**
 * Parameter IRT default berdasarkan tingkat kesulitan soal jika belum dikustomisasi
 * Model 2PL / 3PL:
 * a = Daya Pembeda (0.5 s.d 2.5)
 * b = Tingkat Kesulitan (-3.0 s.d +3.0)
 * c = Tebakan Semu (0.0 s.d 0.25)
 */
export const DEFAULT_IRT_DIFFICULTY_PARAMS: Record<
  QuestionDifficulty,
  { a: number; b: number; c: number; label: string; color: string }
> = {
  mudah: {
    a: 0.85,
    b: -1.3,
    c: 0.05,
    label: 'Mudah',
    color: 'text-emerald-400'
  },
  sedang: {
    a: 1.1,
    b: 0.0,
    c: 0.05,
    label: 'Sedang',
    color: 'text-cyan-400'
  },
  sulit: {
    a: 1.5,
    b: 1.35,
    c: 0.05,
    label: 'Sulit',
    color: 'text-amber-400'
  },
  hots: {
    a: 1.9,
    b: 2.1,
    c: 0.05,
    label: 'HOTS (Sangat Sulit)',
    color: 'text-purple-400'
  }
};

/**
 * Template Preset Kelompok Subtest Populer
 */
export interface SubtestPreset {
  id: string;
  title: string;
  description: string;
  categoryHint: string;
  subtests: Array<{
    name: string;
    code: string;
    description: string;
    durationMinutes?: number;
  }>;
}

export const SUBTEST_PRESET_TEMPLATES: SubtestPreset[] = [
  {
    id: 'preset-verbal-duo',
    title: 'Paket Kemampuan Verbal (2 Subtes)',
    description: 'Kelompok Verbal Bahasa Indonesia & Verbal Bahasa Inggris terpadu',
    categoryHint: 'Kemampuan Verbal',
    subtests: [
      {
        name: 'Verbal Bahasa Indonesia',
        code: 'VBI',
        description: 'Sinonim, Antonim, Analogi Kata, Silogisme & Logika Bahasa Indonesia',
        durationMinutes: 20
      },
      {
        name: 'Verbal Bahasa Inggris',
        code: 'VBE',
        description: 'Synonyms, Antonyms, Word Analogy, Sentence Completion & Vocabulary',
        durationMinutes: 20
      }
    ]
  },
  {
    id: 'preset-tps-snbt-7',
    title: 'TPS & Literasi UTBK-SNBT (7 Subtes Lengkap)',
    description: 'Format baku SNBT 2026: TPS, Literasi Bahasa & Penalaran Matematika',
    categoryHint: 'SNBT 2026',
    subtests: [
      { name: 'Penalaran Umum (PU)', code: 'PU', description: 'Penalaran Induktif, Deduktif & Kuantitatif', durationMinutes: 30 },
      { name: 'Pengetahuan & Pemahaman Umum (PPU)', code: 'PPU', description: 'Bahasa, Kosakata & Makna Teks', durationMinutes: 15 },
      { name: 'Pemahaman Bacaan & Menulis (PBM)', code: 'PBM', description: 'Kaidah Ejaan & Struktur Kalimat Efektif', durationMinutes: 25 },
      { name: 'Pengetahuan Kuantitatif (PK)', code: 'PK', description: 'Matematika Dasar, Aritmatika & Aljabar', durationMinutes: 20 },
      { name: 'Literasi Bahasa Indonesia', code: 'LIT-INDO', description: 'Teks Informasi & Sastra Bahasa Indonesia', durationMinutes: 45 },
      { name: 'Literasi Bahasa Inggris', code: 'LIT-ENG', description: 'Teks Argumentatif, Eksposisi & Naratif English', durationMinutes: 30 },
      { name: 'Penalaran Matematika (PM)', code: 'PM', description: 'Pemecahan Masalah Matematika Kontekstual', durationMinutes: 30 }
    ]
  },
  {
    id: 'preset-labschool-psb',
    title: 'Seleksi PSB Labschool (5 Subtes)',
    description: 'Format tes seleksi penerimaan siswa baru SMP/SMA Labschool',
    categoryHint: 'Masuk Labschool',
    subtests: [
      { name: 'Kemampuan Verbal (KV)', code: 'KV', description: 'Analogi Padanan Kata & Silogisme Verbal', durationMinutes: 20 },
      { name: 'Pengetahuan Kuantitatif (PK)', code: 'PK', description: 'Aritmatika, Geometri & Logika Hitung', durationMinutes: 25 },
      { name: 'Pemahaman Membaca (PM)', code: 'PM', description: 'Literasi Membaca & Struktur Paragraf', durationMinutes: 25 },
      { name: 'Kemampuan Akademik (AKA)', code: 'AKA', description: 'Mata Pelajaran IPA & IPS Terpadu', durationMinutes: 30 },
      { name: 'Survei Karakter (SV)', code: 'SV', description: 'Integritas, Empati & Karakter Pelajar', durationMinutes: 15 }
    ]
  },
  {
    id: 'preset-tka-saintek',
    title: 'TKA Saintek (4 Subtes)',
    description: 'Tes Kemampuan Akademik Bidang Sains & Teknologi',
    categoryHint: 'TKA Saintek',
    subtests: [
      { name: 'Matematika Saintek', code: 'MAT-IPA', description: 'Kalkulus, Trigonometri & Vektor', durationMinutes: 25 },
      { name: 'Fisika', code: 'FIS', description: 'Mekanika, Termodinamika & Gelombang', durationMinutes: 25 },
      { name: 'Kimia', code: 'KIM', description: 'Stoikiometri, Ikatan Kimia & Reaksi', durationMinutes: 25 },
      { name: 'Biologi', code: 'BIO', description: 'Biologi Sel, Genetika & Ekologi', durationMinutes: 25 }
    ]
  }
];

/**
 * Mengambil parameter IRT untuk sebuah soal (a, b, c)
 */
export function getQuestionIRTParameters(q: Question): { a: number; b: number; c: number } {
  const diffKey = q.difficulty || 'sedang';
  const defaults = DEFAULT_IRT_DIFFICULTY_PARAMS[diffKey] || DEFAULT_IRT_DIFFICULTY_PARAMS.sedang;

  const a = typeof q.irtDiscrimination === 'number' && q.irtDiscrimination > 0 ? q.irtDiscrimination : defaults.a;
  const b = typeof q.irtDifficulty === 'number' ? q.irtDifficulty : defaults.b;
  const c = typeof q.irtGuessing === 'number' && q.irtGuessing >= 0 ? q.irtGuessing : defaults.c;

  return { a, b, c };
}

/**
 * Fungsi Probabilitas IRT 3PL (Three-Parameter Logistic Model)
 * P(theta) = c + (1 - c) / (1 + exp(-1.702 * a * (theta - b)))
 */
export function irtProbability(theta: number, a: number, b: number, c: number): number {
  const D = 1.702; // Konstanta scaling normal
  const exponent = -D * a * (theta - b);
  // Clamping exponent to prevent numerical overflow
  const clampedExp = Math.max(-30, Math.min(30, exponent));
  return c + (1 - c) / (1 + Math.exp(clampedExp));
}

/**
 * Estimasi Kemampuan Theta (θ) menggunakan metode EAP (Expected A Posteriori)
 * dengan prior Gaussian baku N(0, 1) pada range [-4.0, +4.0].
 * Metode ini sangat stabil, tidak divergen bahkan jika peserta menjawab 0% atau 100% benar.
 */
export function estimateThetaEAP(
  items: Array<{ isCorrect: boolean; a: number; b: number; c: number }>
): { theta: number; se: number } {
  if (!items || items.length === 0) {
    return { theta: 0, se: 1.0 };
  }

  // Gaussian quadrature 41 nodes from -4.0 to +4.0 (step 0.2)
  const nodesCount = 41;
  const minTheta = -4.0;
  const maxTheta = 4.0;
  const step = (maxTheta - minTheta) / (nodesCount - 1);

  let numerator = 0;
  let denominator = 0;

  const nodeLikelihoods: Array<{ theta: number; weight: number }> = [];

  for (let i = 0; i < nodesCount; i++) {
    const th = minTheta + i * step;
    // Standard normal prior: phi(th) = exp(-th^2 / 2) / sqrt(2 * PI)
    const prior = Math.exp(-0.5 * th * th) / Math.sqrt(2 * Math.PI);

    // Log-likelihood calculation
    let logL = 0;
    for (const item of items) {
      const p = Math.max(1e-6, Math.min(1 - 1e-6, irtProbability(th, item.a, item.b, item.c)));
      if (item.isCorrect) {
        logL += Math.log(p);
      } else {
        logL += Math.log(1 - p);
      }
    }

    // Weight = Likelihood * Prior
    // Clamping logL to prevent extreme underflow
    const clampedLogL = Math.max(-100, Math.min(50, logL));
    const L = Math.exp(clampedLogL);
    const w = L * prior;

    numerator += th * w;
    denominator += w;
    nodeLikelihoods.push({ theta: th, weight: w });
  }

  const estimatedTheta = denominator > 0 ? numerator / denominator : 0;

  // Standard error estimation
  let varianceNum = 0;
  for (const node of nodeLikelihoods) {
    varianceNum += Math.pow(node.theta - estimatedTheta, 2) * node.weight;
  }
  const variance = denominator > 0 ? varianceNum / denominator : 1.0;
  const se = Math.sqrt(Math.max(0.1, variance));

  return {
    theta: Math.round(estimatedTheta * 1000) / 1000,
    se: Math.round(se * 1000) / 1000
  };
}

/**
 * Konversi nilai Theta (-3.0 s.d +3.0) ke Skala Skor Baku IRT UTBK (Rentang 200 - 1000)
 * Mean = 500, SD = 120
 */
export function thetaToStandardIRTScore(theta: number): number {
  const mean = 500;
  const sd = 120;
  const rawScore = mean + theta * sd;
  const clamped = Math.min(1000, Math.max(200, Math.round(rawScore)));
  return clamped;
}

/**
 * Mengelompokkan kategori level performa IRT
 */
export function getIRTPerformanceLevel(irtScore: number): {
  level: string;
  badgeBg: string;
  badgeText: string;
  description: string;
} {
  if (irtScore >= 750) {
    return {
      level: 'Istimewa / Sangat Tinggi (Top Tier)',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/50',
      badgeText: 'text-emerald-300',
      description: 'Penguasaan materi tingkat lanjut & daya nalar sangat matang'
    };
  }
  if (irtScore >= 620) {
    return {
      level: 'Tinggi / Di Atas Rata-rata',
      badgeBg: 'bg-cyan-950/80 border-cyan-500/50',
      badgeText: 'text-cyan-300',
      description: 'Mampu menyelesaikan soal berbobot sedang hingga sulit dengan konsisten'
    };
  }
  if (irtScore >= 500) {
    return {
      level: 'Sedang / Rata-rata Nasional',
      badgeBg: 'bg-blue-950/80 border-blue-500/50',
      badgeText: 'text-blue-300',
      description: 'Memenuhi standar kompetensi dasar, perlu penguatan soal tingkat HOTS'
    };
  }
  if (irtScore >= 380) {
    return {
      level: 'Cukup / Perlu Latihan Tambahan',
      badgeBg: 'bg-amber-950/80 border-amber-500/50',
      badgeText: 'text-amber-300',
      description: 'Perlu bimbingan intensif pada konsep-konsep kunci dan penalaran dasar'
    };
  }
  return {
    level: 'Kurang / Perlu Remedial Intensif',
    badgeBg: 'bg-rose-950/80 border-rose-500/50',
    badgeText: 'text-rose-300',
    description: 'Segera lakukan review materi dari tingkat dasar'
  };
}

/**
 * Mengevaluasi apakah jawaban siswa pada butir soal tertentu benar / salah / kosong
 */
export function evaluateQuestionAnswer(
  q: Question,
  studentAnsRaw: any,
  manualScore?: number
): {
  isCorrect: boolean;
  earnedWeight: number;
  maxWeight: number;
  isUnanswered: boolean;
} {
  let maxWeight = q.weight || 1;
  if (q.questionType === 'TRUE_FALSE' && q.statements && q.statements.length > 0) {
    const sumStmts = q.statements.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);
    maxWeight = sumStmts > 0 ? sumStmts : (q.weight || 1);
  }

  // Jika ada skor manual yang diinput guru/admin
  if (typeof manualScore === 'number') {
    const isCorr = manualScore >= maxWeight * 0.5;
    return {
      isCorrect: isCorr,
      earnedWeight: manualScore,
      maxWeight,
      isUnanswered: false
    };
  }

  if (
    studentAnsRaw === undefined ||
    studentAnsRaw === null ||
    studentAnsRaw === '' ||
    (Array.isArray(studentAnsRaw) && studentAnsRaw.length === 0) ||
    (typeof studentAnsRaw === 'object' && Object.keys(studentAnsRaw).length === 0)
  ) {
    return {
      isCorrect: false,
      earnedWeight: 0,
      maxWeight,
      isUnanswered: true
    };
  }

  if (q.questionType === 'COMPLEX_CHOICE') {
    const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
    const studentArr = Array.isArray(studentAnsRaw) ? studentAnsRaw : [studentAnsRaw];
    const isCorrect =
      correctArr.length === studentArr.length &&
      correctArr.every(val => studentArr.includes(val));
    return {
      isCorrect,
      earnedWeight: isCorrect ? maxWeight : 0,
      maxWeight,
      isUnanswered: false
    };
  }

  if (q.questionType === 'TRUE_FALSE' && q.statements && q.statements.length > 0) {
    let earned = 0;
    let matchCount = 0;
    q.statements.forEach(stmt => {
      const studentChoice = (studentAnsRaw as Record<string, 'TRUE' | 'FALSE'>)?.[stmt.id];
      const stmtWeight = stmt.weight !== undefined ? Number(stmt.weight) || 1 : maxWeight / q.statements!.length;
      if (studentChoice && studentChoice === stmt.correctAnswer) {
        earned += stmtWeight;
        matchCount++;
      }
    });

    const isCorrect = matchCount === q.statements.length;
    return {
      isCorrect,
      earnedWeight: earned,
      maxWeight,
      isUnanswered: false
    };
  }

  if (q.questionType === 'ESSAY') {
    const expected = String(q.correctAnswer || '').trim().toLowerCase();
    const given = String(studentAnsRaw).trim().toLowerCase();
    const isCorrect = expected.length > 0 && (given.includes(expected) || expected.includes(given));
    return {
      isCorrect,
      earnedWeight: isCorrect ? maxWeight : 0,
      maxWeight,
      isUnanswered: false
    };
  }

  // SINGLE_CHOICE default
  const isCorrect = String(studentAnsRaw).trim().toUpperCase() === String(q.correctAnswer || '').trim().toUpperCase();
  return {
    isCorrect,
    earnedWeight: isCorrect ? maxWeight : 0,
    maxWeight,
    isUnanswered: false
  };
}

/**
 * Mengambil daftar subtest aktif dari suatu Exam
 */
export function getSubtestsFromExam(exam: Partial<Exam>): ExamSubtest[] {
  if (exam.subtests && exam.subtests.length > 0) {
    return exam.subtests;
  }

  // Jika belum dideklarasikan eksplisit di exam.subtests, kumpulkan secara dinamis dari questions
  if (exam.questions && exam.questions.length > 0) {
    const subtestMap = new Map<string, ExamSubtest>();
    exam.questions.forEach((q, idx) => {
      if (q.subtestId || q.subtestName) {
        const id = q.subtestId || `subtest-${(q.subtestName || '').toLowerCase().replace(/\s+/g, '-')}`;
        const name = q.subtestName || `Subtest ${subtestMap.size + 1}`;
        if (!subtestMap.has(id)) {
          subtestMap.set(id, {
            id,
            name,
            code: name.slice(0, 4).toUpperCase(),
            order: subtestMap.size + 1
          });
        }
      }
    });

    if (subtestMap.size > 0) {
      return Array.from(subtestMap.values());
    }
  }

  // Fallback 1 default subtest utama
  return [
    {
      id: 'subtest-main',
      name: exam.title || 'Subtest Utama',
      code: 'UTAMA',
      order: 1
    }
  ];
}

/**
 * Menghitung kalkulasi lengkap: Skor Klasikal, Skor IRT, dan Pemisahan Hasil per Subtest
 */
export function calculateExamAndSubtestResults(
  exam: Exam,
  answers: Record<string, StudentAnswer>,
  manualScores?: Record<string, number>
): {
  subtestResults: SubtestResult[];
  totalScore: number;
  finalScore: number;
  percentage: number;
  maxScore: number;
  totalMaxScore: number;
  isPassed: boolean;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  isIRTEnabled: boolean;
  irtScore?: number;
  irtStandardScore?: number;
  irtTheta?: number;
  irtPercentile?: number;
} {
  const isIRTEnabled = exam.isIRTEnabled === true || exam.scoringMethod === 'IRT';
  const questions = exam.questions || [];
  const subtests = getSubtestsFromExam(exam);

  // Group questions by subtest
  const subtestQuestionsMap = new Map<string, Question[]>();
  subtests.forEach(st => {
    subtestQuestionsMap.set(st.id, []);
  });

  // Default bucket if question has no subtestId matching
  const defaultSubtestId = subtests[0]?.id || 'subtest-main';

  questions.forEach(q => {
    let targetStId = q.subtestId;
    if (!targetStId && q.subtestName) {
      const matchByName = subtests.find(s => s.name.toLowerCase() === q.subtestName?.toLowerCase());
      if (matchByName) {
        targetStId = matchByName.id;
      }
    }
    if (!targetStId || !subtestQuestionsMap.has(targetStId)) {
      targetStId = defaultSubtestId;
    }

    if (!subtestQuestionsMap.has(targetStId)) {
      subtestQuestionsMap.set(targetStId, []);
    }
    subtestQuestionsMap.get(targetStId)!.push(q);
  });

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;
  let totalEarnedWeight = 0;
  let totalMaxWeight = 0;

  const allIRTItems: Array<{ isCorrect: boolean; a: number; b: number; c: number }> = [];
  const subtestResults: SubtestResult[] = [];

  subtests.forEach(st => {
    const stQuestions = subtestQuestionsMap.get(st.id) || [];
    if (stQuestions.length === 0 && subtests.length > 1) {
      // Lewati subtest kosong jika ada subtest lain
      return;
    }

    let stCorrect = 0;
    let stIncorrect = 0;
    let stUnanswered = 0;
    let stEarned = 0;
    let stMax = 0;
    const stIRTItems: Array<{ isCorrect: boolean; a: number; b: number; c: number }> = [];
    const qIds: string[] = [];

    stQuestions.forEach(q => {
      qIds.push(q.id);
      const studentAnsRaw = answers[q.id]?.answer;
      const evalRes = evaluateQuestionAnswer(q, studentAnsRaw, manualScores?.[q.id]);

      stMax += evalRes.maxWeight;
      stEarned += evalRes.earnedWeight;

      if (evalRes.isUnanswered) {
        stUnanswered++;
      } else if (evalRes.isCorrect) {
        stCorrect++;
      } else {
        stIncorrect++;
      }

      // IRT Item Registration
      const irtParams = getQuestionIRTParameters(q);
      const itemRecord = {
        isCorrect: evalRes.isCorrect,
        a: irtParams.a,
        b: irtParams.b,
        c: irtParams.c
      };
      stIRTItems.push(itemRecord);
      allIRTItems.push(itemRecord);
    });

    totalCorrect += stCorrect;
    totalIncorrect += stIncorrect;
    totalUnanswered += stUnanswered;
    totalEarnedWeight += stEarned;
    totalMaxWeight += stMax;

    const stPercentage = stMax > 0 ? Math.round((stEarned / stMax) * 100) : 0;
    const subtestPassing = st.passingScore ? stPercentage >= st.passingScore : undefined;

    // Subtest IRT Calculation
    let stTheta: number | undefined = undefined;
    let stIRTScore: number | undefined = undefined;

    if (isIRTEnabled && stIRTItems.length > 0) {
      const eap = estimateThetaEAP(stIRTItems);
      stTheta = eap.theta;
      stIRTScore = thetaToStandardIRTScore(stTheta);
    }

    const stScore = isIRTEnabled && stIRTScore ? stIRTScore : stPercentage;

    subtestResults.push({
      subtestId: st.id,
      subtestName: st.name,
      subtestCode: st.code,
      totalQuestions: stQuestions.length,
      correctCount: stCorrect,
      incorrectCount: stIncorrect,
      unansweredCount: stUnanswered,
      rawScore: Math.round(stEarned * 10) / 10,
      maxRawScore: Math.round(stMax * 10) / 10,
      percentage: stPercentage,
      score: stScore,
      irtScore: stIRTScore,
      irtTheta: stTheta,
      isPassed: subtestPassing,
      questionIds: qIds
    });
  });

  // Overall Score Calculations
  const finalClassicalScore = totalMaxWeight > 0 ? Math.round((totalEarnedWeight / totalMaxWeight) * 100) : 0;

  // Composite IRT Score Calculation
  let totalTheta: number | undefined = undefined;
  let totalIRTScore: number | undefined = undefined;
  let irtPercentile: number | undefined = undefined;

  if (isIRTEnabled && allIRTItems.length > 0) {
    const overallEap = estimateThetaEAP(allIRTItems);
    totalTheta = overallEap.theta;
    totalIRTScore = thetaToStandardIRTScore(totalTheta);

    // Approximate percentile using standard normal CDF
    const z = totalTheta;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1 - p;
    irtPercentile = Math.max(1, Math.min(99, Math.round(p * 100)));
  }

  // Determination of Passing:
  // If IRT is active, passingScore can be on 0-100 or 200-1000 scale.
  let isPassed = false;
  const passThreshold = exam.passingScore || 70;
  if (isIRTEnabled && totalIRTScore !== undefined) {
    if (passThreshold > 100) {
      isPassed = totalIRTScore >= passThreshold;
    } else {
      isPassed = finalClassicalScore >= passThreshold || totalIRTScore >= (500 + (passThreshold - 50) * 8);
    }
  } else {
    isPassed = finalClassicalScore >= passThreshold;
  }

  const computedFinalScore = isIRTEnabled && totalIRTScore !== undefined ? totalIRTScore : finalClassicalScore;

  return {
    subtestResults,
    totalScore: computedFinalScore,
    finalScore: computedFinalScore,
    percentage: finalClassicalScore,
    maxScore: isIRTEnabled ? 1000 : 100,
    totalMaxScore: isIRTEnabled ? 1000 : 100,
    isPassed,
    correctCount: totalCorrect,
    incorrectCount: totalIncorrect,
    unansweredCount: totalUnanswered,
    isIRTEnabled,
    irtScore: totalIRTScore,
    irtStandardScore: totalIRTScore,
    irtTheta: totalTheta,
    irtPercentile
  };
}
