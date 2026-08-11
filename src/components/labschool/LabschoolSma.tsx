import React, { useState } from 'react';
import { User, Exam, LearningMaterial } from '../../types';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileCheck2,
  BookOpen,
  Zap,
  HelpCircle,
  Award,
  Play,
  RotateCcw,
  Target,
  ChevronRight,
  Clock,
  Layers,
  Calculator,
  Compass,
  FileText,
  Flame,
  Check
} from 'lucide-react';
import { SidebarTab } from '../common/Sidebar';

interface LabschoolSmaProps {
  user: User;
  exams: Exam[];
  materials: LearningMaterial[];
  onNavigateTab: (tab: SidebarTab) => void;
  onStartExam?: (exam: Exam) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LabschoolSma: React.FC<LabschoolSmaProps> = ({
  user,
  exams,
  materials,
  onNavigateTab,
  onStartExam,
  onShowToast
}) => {
  // Flash Quiz state
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Chance & Major Recommendation Calculator
  const [raporScore, setRaporScore] = useState<number>(90);
  const [tryoutScore, setTryoutScore] = useState<number>(820);
  const [interestMajor, setInterestMajor] = useState<'MIPA' | 'IPS'>('MIPA');
  const [targetCampus, setTargetCampus] = useState<'rawamangun' | 'kebayoran' | 'cibubur' | 'cirendeu'>('kebayoran');
  const [calcResult, setCalcResult] = useState<{ percentage: number; status: string; recommendation: string; advice: string } | null>(null);

  // Quick Flash Questions for SMA
  const flashQuestions = [
    {
      id: 1,
      subject: 'Matematika Lanjutan (Aljabar)',
      text: 'Jika akar-akar persamaan kuadrat 2x² - 6x + (p + 1) = 0 adalah α dan β, serta diketahui α² + β² = 5, berapakah nilai dari p?',
      options: [
        { key: 'A', text: 'p = 1' },
        { key: 'B', text: 'p = 2' },
        { key: 'C', text: 'p = 3' },
        { key: 'D', text: 'p = 4' }
      ],
      correct: 'C',
      explanation: 'α + β = -b/a = 6/2 = 3. αβ = (p+1)/2. α² + β² = (α+β)² - 2αβ => 5 = (3)² - 2((p+1)/2) => 5 = 9 - (p+1) => p + 1 = 4 => p = 3.'
    },
    {
      id: 2,
      subject: 'Fisika Terpadu (Mekanika)',
      text: 'Sebuah balok bermassa 4 kg ditarik dengan gaya konstan 20 N mendatar di atas lantai kasar dengan koefisien gesek kinetik μk = 0,25. Jika g = 10 m/s², percepatan balok tersebut adalah...',
      options: [
        { key: 'A', text: '1,5 m/s²' },
        { key: 'B', text: '2,5 m/s²' },
        { key: 'C', text: '3,0 m/s²' },
        { key: 'D', text: '5,0 m/s²' }
      ],
      correct: 'B',
      explanation: 'Gaya normal N = m.g = 4(10) = 40 N. Gaya gesek fk = μk.N = 0,25(40) = 10 N. ΣF = m.a => F - fk = m.a => 20 - 10 = 4.a => 10 = 4a => a = 2,5 m/s².'
    },
    {
      id: 3,
      subject: 'Biologi (Genetika)',
      text: 'Persilangan antara tanaman ercis berbiji bulat kuning (BbKk) dengan tanaman berbiji keriput hijau (bbkk) akan menghasilkan persentase keturunan berbiji bulat hijau sebesar...',
      options: [
        { key: 'A', text: '12,5%' },
        { key: 'B', text: '25%' },
        { key: 'C', text: '50%' },
        { key: 'D', text: '75%' }
      ],
      correct: 'B',
      explanation: 'Ini adalah testcross dihibrid: BbKk x bbkk menghasilkan rasio genotipe dan fenotipe 1:1:1:1 (Bulat Kuning, Bulat Hijau, Keriput Kuning, Keriput Hijau). Masing-masing memiliki peluang 1/4 = 25%.'
    },
    {
      id: 4,
      subject: 'Bahasa Inggris (Advanced Reading)',
      text: 'Read the sentence:\n"Had the laboratory technician calibrated the spectrometer beforehand, the anomalies in the spectral measurements ________."',
      options: [
        { key: 'A', text: 'would be avoided' },
        { key: 'B', text: 'would have been avoided' },
        { key: 'C', text: 'will have avoided' },
        { key: 'D', text: 'had been avoided' }
      ],
      correct: 'B',
      explanation: 'Inverted Conditional Type 3 (Past Unreal Condition): "Had + Subject + V3, Subject + would have + V3 / been + V3". Pilihan yang tepat adalah passive form "would have been avoided".'
    },
    {
      id: 5,
      subject: 'TPA & Logika Analitis Posisi',
      text: 'Enam siswa (A, B, C, D, E, F) duduk berjajar. A duduk di sebelah B. C duduk tepat di sebelah kanan E. D tidak boleh duduk di ujung barisan. Jika B duduk di posisi paling kiri (posisi 1), dan F di posisi paling kanan (posisi 6), maka siapa yang duduk di posisi ke-2?',
      options: [
        { key: 'A', text: 'Siswa A' },
        { key: 'B', text: 'Siswa C' },
        { key: 'C', text: 'Siswa D' },
        { key: 'D', text: 'Siswa E' }
      ],
      correct: 'A',
      explanation: 'Karena A harus duduk di sebelah B, dan B berada di posisi 1, maka posisi 2 pasti ditempati oleh Siswa A.'
    }
  ];

  const handleSelectOption = (key: string) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [activeQuizQuestion]: key }));
  };

  const handleCalculateMajor = () => {
    let score = (raporScore * 3) + (tryoutScore / 1000 * 60);
    const campusTarget = targetCampus === 'kebayoran' ? 89 : targetCampus === 'rawamangun' ? 88 : targetCampus === 'cibubur' ? 83 : 81;
    const diff = score - campusTarget;

    let percentage = Math.min(99, Math.max(30, Math.round(78 + diff * 3.2)));
    let status = percentage >= 85 ? 'Sangat Berpeluang Besar Lolos Masuk' : percentage >= 70 ? 'Peluang Bersaing & Memenuhi Syarat' : 'Perlu Peningkatan Latihan Tryout & HOTS';
    
    let recommendation = interestMajor === 'MIPA'
      ? 'Direkomendasikan Peminatan MIPA (Matematika & Ilmu Alam) Unggulan Labschool'
      : 'Direkomendasikan Peminatan IPS (Ilmu Pengetahuan Sosial & Ekonomi Global) Labschool';

    let advice = percentage >= 85
      ? 'Skor simulasi Anda berada di zona aman. Pertahankan stabilitas waktu pengerjaan 54 detik per butir soal.'
      : percentage >= 70
      ? 'Fokuskan pemantapan pada Fisika Terpadu dan deret angka tingkat lanjut pada subtes TPA.'
      : 'Maksimalkan tryout CBT akbar berkala dan pelajari bank soal asli seleksi 3 tahun terakhir.';

    setCalcResult({ percentage, status, recommendation, advice });
  };

  // Find or craft SMA Exams
  const smaExamList = exams.filter(e => e.title.toLowerCase().includes('sma') || e.category.toLowerCase().includes('sma') || e.category.toLowerCase().includes('labschool'));

  const fallbackSmaExam: Exam = {
    id: 'exam-labschool-sma-1',
    title: 'Simulasi CAT Akbar PSB SMA Labschool 2026 - Paket Super Intensif (TPA & TKA MIPA Terpadu)',
    category: 'Masuk Labschool',
    targetClass: 'Masuk Labschool',
    durationMinutes: 45,
    mode: 'NATIVE_CBT',
    token: 'LABSSMA26',
    isTokenPublic: true,
    shuffleQuestions: true,
    passingScore: 78,
    allowRetake: true,
    maxAttempts: 5,
    deadline: '2026-12-31 23:59',
    totalQuestions: 5,
    createdAt: '2026-01-10',
    questions: flashQuestions.map((q, idx) => ({
      id: `q-sma-cbt-${idx + 1}`,
      number: idx + 1,
      text: q.text,
      questionType: 'SINGLE_CHOICE',
      options: q.options,
      correctAnswer: q.correct,
      weight: 20,
      discussion: q.explanation
    }))
  };

  const handleLaunchSmaExam = (targetEx?: Exam) => {
    const examToRun = targetEx || (smaExamList.length > 0 ? smaExamList[0] : fallbackSmaExam);
    if (onStartExam) {
      onStartExam(examToRun);
    } else {
      onNavigateTab('exams');
    }
  };

  const scoreQuiz = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
    return acc + (ans === flashQuestions[Number(idx)].correct ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Banner PSB SMA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/60 to-slate-950 border border-amber-800/40 p-5 sm:p-7 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <GraduationCap className="w-3.5 h-3.5" />
                SELEKSI PENERIMAAN SISWA BARU (PSB) SMA LABSCHOOL
              </span>
              <span className="text-xs text-slate-400 font-semibold">Tahun Ajaran 2026/2027</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Modul & Latihan Ujian CAT Masuk SMA Labschool
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              Persiapkan diri Anda untuk menembus persaingan ketat <strong className="text-amber-300">SMA Labschool Kebayoran, Rawamangun, Cibubur, dan Cirendeu</strong> melalui jalur tes berbasis komputer CAT dan jalur PPSBB (Program Penjaringan Siswa Baru Berprestasi).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleLaunchSmaExam()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Simulasi Tryout CAT SMA</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('labschool_roadmap')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400 transition-all"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Lihat Roadmap Silabus</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:w-80 shrink-0 space-y-2.5 shadow-xl text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Struktur Ujian PSB SMA</span>
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Total Butir Soal</span>
                <span className="font-bold text-white">100 - 120 Soal Pilihan Ganda</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Durasi Waktu</span>
                <span className="font-bold text-amber-400">90 Menit</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Target Passing Grade</span>
                <span className="font-bold text-emerald-400">Skor 820+ / 1000</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Jalur Penerimaan</span>
                <span className="font-bold text-blue-400">PPSBB & Tes CAT Mandiri</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5 Core Pillars for SMA Labschool */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>5 Subtes Mata Uji Wajib Masuk SMA Labschool</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold text-xs">
                30% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">25 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Matematika Lanjutan & Kuantitatif</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persamaan kuadrat, SPLDV/SPLTV, barisan deret aritmetika/geometri, trigonometri dasar, fungsi analitis, dan statistika peluang.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs">
                25% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">25 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">IPA Terpadu (Fisika, Biologi, Kimia)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mekanika klasik hukum Newton, fluida, optik, genetika seluler & pewarisan sifat, metabolisme, struktur atom, dan larutan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs">
                20% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">20 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">TPA & Tes Potensi Akademik SMA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Logika analitis penempatan posisi, silogisme induktif/deduktif, deret huruf/angka bertingkat, dan penalaran figural 3D.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold text-xs">
                15% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">15 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Literasi Bahasa Indonesia & Wacana</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analisis struktur teks editorial/opini, penarikan simpulan logis wacana, perbaikan kalimat tidak efektif, dan ejaan baku EYD V.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold text-xs">
                10% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">15 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Bahasa Inggris Tingkat Lanjut</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Academic reading comprehension, grammar structure (subjunctive, conditionals, participle clauses), dan vocabulary in context.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-700/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">PAKET SIMULASI CBT</span>
              <h3 className="font-extrabold text-white text-base mt-1">Uji Kesiapan Mandiri Sekarang</h3>
              <p className="text-xs text-slate-300 mt-1">
                Latihan simulasi CBT standar seleksi SMA Labschool dengan perankingan dan kunci pembahasan lengkap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleLaunchSmaExam()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md"
            >
              <span>Mulai Ujian Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Flash Quiz & Recommendation Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flash Quiz Component (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base sm:text-lg">Kuis Kilat HOTS Masuk SMA Labschool (5 Soal)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Soal {activeQuizQuestion + 1} dari {flashQuestions.length}
            </span>
          </div>

          {/* Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {flashQuestions[activeQuizQuestion].subject}
              </span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed whitespace-pre-line">
              {flashQuestions[activeQuizQuestion].text}
            </p>

            {/* Options */}
            <div className="space-y-2 pt-2">
              {flashQuestions[activeQuizQuestion].options.map(opt => {
                const isSelected = userAnswers[activeQuizQuestion] === opt.key;
                const isCorrect = flashQuestions[activeQuizQuestion].correct === opt.key;

                let optClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';
                if (isSelected && !quizSubmitted) {
                  optClass = 'bg-amber-600/20 border-amber-500 text-amber-200 font-bold';
                }
                if (quizSubmitted) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  }
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optClass}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {opt.key}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {quizSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {quizSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submission */}
            {quizSubmitted && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pembahasan & Kunci Jawaban:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {flashQuestions[activeQuizQuestion].explanation}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1.5">
              {flashQuestions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveQuizQuestion(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    activeQuizQuestion === i
                      ? 'bg-amber-600 text-white shadow-sm'
                      : userAnswers[i]
                      ? 'bg-slate-800 text-amber-300 border border-slate-700'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(true);
                    if (onShowToast) onShowToast('Kuis selesai diperiksa!', 'success');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all"
                >
                  Periksa Jawaban
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-400">
                    Skor: {scoreQuiz} / {flashQuestions.length} ({Math.round((scoreQuiz / flashQuestions.length) * 100)}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswers({});
                      setQuizSubmitted(false);
                      setActiveQuizQuestion(0);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ulangi</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Major Recommendation & Passing Chance Calculator (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Kalkulator Peluang & Jurusan SMA</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analisis peluang kelulusan dan kesesuaian peminatan MIPA/IPS di SMA Labschool impian Anda.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Kampus SMA Labschool</label>
                <select
                  value={targetCampus}
                  onChange={e => setTargetCampus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="kebayoran">SMA Labschool Kebayoran (Jakarta Selatan)</option>
                  <option value="rawamangun">SMA Labschool Rawamangun (Jakarta Timur)</option>
                  <option value="cibubur">SMA Labschool Cibubur (Bekasi/Cibubur)</option>
                  <option value="cirendeu">SMA Labschool Cirendeu (Tangerang Selatan)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Peminatan yang Dituju</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterestMajor('MIPA')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      interestMajor === 'MIPA'
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    MIPA (Sains)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestMajor('IPS')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      interestMajor === 'IPS'
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    IPS (Sosial Humaniora)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Rata-Rata Rapor SMP (Semester 1-5)</span>
                  <span className="text-amber-400 font-bold">{raporScore}</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="100"
                  value={raporScore}
                  onChange={e => setRaporScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Estimasi Skor Tryout CAT SMA (Skala 1000)</span>
                  <span className="text-blue-400 font-bold">{tryoutScore}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="1000"
                  step="10"
                  value={tryoutScore}
                  onChange={e => setTryoutScore(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCalculateMajor}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Hitung Estimasi Peluang & Rekomendasi</span>
            </button>

            {calcResult && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Peluang Lolos:</span>
                  <span className="text-base font-extrabold text-amber-400">
                    {calcResult.percentage}%
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{calcResult.status}</p>
                <p className="text-[11px] font-semibold text-blue-300">{calcResult.recommendation}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{calcResult.advice}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
