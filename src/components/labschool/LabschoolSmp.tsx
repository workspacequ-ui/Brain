import React, { useState } from 'react';
import { User, Exam, LearningMaterial } from '../../types';
import {
  School,
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
  Download,
  Flame,
  Check
} from 'lucide-react';
import { SidebarTab } from '../common/Sidebar';

interface LabschoolSmpProps {
  user: User;
  exams: Exam[];
  materials: LearningMaterial[];
  onNavigateTab: (tab: SidebarTab) => void;
  onStartExam?: (exam: Exam) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LabschoolSmp: React.FC<LabschoolSmpProps> = ({
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

  // Chance Calculator state
  const [raporScore, setRaporScore] = useState<number>(88);
  const [tryoutScore, setTryoutScore] = useState<number>(780);
  const [hasAchievement, setHasAchievement] = useState<boolean>(true);
  const [targetCampus, setTargetCampus] = useState<'rawamangun' | 'kebayoran' | 'cibubur' | 'cirendeu'>('rawamangun');
  const [calcResult, setCalcResult] = useState<{ percentage: number; status: string; advice: string } | null>(null);

  // Quick Flash Questions for SMP
  const flashQuestions = [
    {
      id: 1,
      subject: 'Matematika Dasar',
      text: 'Sebuah kolam renang diisi air melalui pipa A dalam waktu 4 jam dan pipa B dalam waktu 6 jam. Jika kedua pipa dibuka bersamaan, berapa jam waktu yang dibutuhkan untuk mengisi penuh kolam tersebut?',
      options: [
        { key: 'A', text: '2 jam 24 menit (2,4 jam)' },
        { key: 'B', text: '2 jam 30 menit (2,5 jam)' },
        { key: 'C', text: '3 jam' },
        { key: 'D', text: '5 jam' }
      ],
      correct: 'A',
      explanation: '1/t = 1/4 + 1/6 = (3 + 2)/12 = 5/12. t = 12/5 = 2,4 jam = 2 jam 24 menit.'
    },
    {
      id: 2,
      subject: 'IPA Sains Terpadu',
      text: 'Manakah bentuk adaptasi tumbuhan kaktus untuk mengurangi laju penguapan air di habitat kering (gurun)?',
      options: [
        { key: 'A', text: 'Memiliki daun lebar dan tipis' },
        { key: 'B', text: 'Daun termodifikasi menjadi duri dan batang tebal berlapis lilin' },
        { key: 'C', text: 'Akar pendek yang menggantung di udara' },
        { key: 'D', text: 'Batang berongga besar berisi udara' }
      ],
      correct: 'B',
      explanation: 'Duri pada kaktus adalah daun yang termodifikasi untuk meminimalkan penguapan, dan batang tebal berlapis kutikula lilin berfungsi menyimpan air.'
    },
    {
      id: 3,
      subject: 'Bahasa Indonesia',
      text: 'Bacalah kalimat berikut: "Siswa yang teliti itu membaca buku dengan seksama di perpustakaan." Kata baku yang tepat untuk menggantikan kata "seksama" adalah...',
      options: [
        { key: 'A', text: 'Seksamah' },
        { key: 'B', text: 'Saksama' },
        { key: 'C', text: 'Sesama' },
        { key: 'D', text: 'Sek-sama' }
      ],
      correct: 'B',
      explanation: 'Berdasarkan KBBI dan kaidah EYD bahasa Indonesia yang baku, penulisan yang tepat adalah "saksama" (bukan seksama).'
    },
    {
      id: 4,
      subject: 'Bahasa Inggris',
      text: 'Choose the correct sentence to complete the dialog:\nMother: "Why are you taking an umbrella?"\nAndi: "Look at the dark clouds! It ________ rain soon."',
      options: [
        { key: 'A', text: 'is going to' },
        { key: 'B', text: 'was' },
        { key: 'C', text: 'did' },
        { key: 'D', text: 'have' }
      ],
      correct: 'A',
      explanation: '"Be going to" (is going to) digunakan untuk menyatakan prediksi masa depan yang didukung oleh bukti nyata saat ini (the dark clouds).'
    },
    {
      id: 5,
      subject: 'TPS Skolastik (Pola Angka)',
      text: 'Lengkapilah deret bilangan berikut: 3, 6, 12, 24, 48, ...',
      options: [
        { key: 'A', text: '60' },
        { key: 'B', text: '72' },
        { key: 'C', text: '96' },
        { key: 'D', text: '120' }
      ],
      correct: 'C',
      explanation: 'Pola deret adalah dikali 2 pada setiap suku: 3x2=6, 6x2=12, 12x2=24, 24x2=48, 48x2=96.'
    }
  ];

  const handleSelectOption = (key: string) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [activeQuizQuestion]: key }));
  };

  const handleCalculateChance = () => {
    let score = (raporScore * 3) + (tryoutScore / 1000 * 60) + (hasAchievement ? 10 : 0);
    // Baseline targets
    const thresholdMap = {
      kebayoran: 88,
      rawamangun: 87,
      cibubur: 82,
      cirendeu: 80
    };
    const minNeeded = thresholdMap[targetCampus];
    const diff = score - minNeeded;

    let percentage = Math.min(99, Math.max(35, Math.round(75 + diff * 3.5)));
    let status = percentage >= 85 ? 'Sangat Berpeluang Besar Lolos' : percentage >= 70 ? 'Peluang Baik & Bersaing' : 'Perlu Peningkatan Latihan Tryout';
    let advice = percentage >= 85
      ? 'Pertahankan performa tryout dan maksimalkan penguasaan trik cepat soal cerita matematika.'
      : percentage >= 70
      ? 'Fokuskan pada latihan soal HOTS IPA Sains dan hafalkan kata baku bahasa Indonesia.'
      : 'Tingkatkan frekuensi tryout CBT mandiri dan perbaiki subtes dengan skor terendah.';

    setCalcResult({ percentage, status, advice });
  };

  // Find or craft SMP Exams
  const smpExamList = exams.filter(e => e.title.toLowerCase().includes('smp') || e.category.toLowerCase().includes('smp') || e.category.toLowerCase().includes('labschool'));

  const fallbackSmpExam: Exam = {
    id: 'exam-labschool-smp-1',
    title: 'Simulasi CAT PSB SMP Labschool 2026 - Paket 1 (Skolastik & Akademik Terpadu)',
    category: 'Masuk Labschool',
    targetClass: 'Masuk Labschool',
    durationMinutes: 45,
    mode: 'NATIVE_CBT',
    token: 'LABSSMP26',
    isTokenPublic: true,
    shuffleQuestions: true,
    passingScore: 75,
    allowRetake: true,
    maxAttempts: 5,
    deadline: '2026-12-31 23:59',
    totalQuestions: 5,
    createdAt: '2026-01-10',
    questions: flashQuestions.map((q, idx) => ({
      id: `q-smp-cbt-${idx + 1}`,
      number: idx + 1,
      text: q.text,
      questionType: 'SINGLE_CHOICE',
      options: q.options,
      correctAnswer: q.correct,
      weight: 20,
      discussion: q.explanation
    }))
  };

  const handleLaunchSmpExam = (targetEx?: Exam) => {
    const examToRun = targetEx || (smpExamList.length > 0 ? smpExamList[0] : fallbackSmpExam);
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
      {/* Hero Banner PSB SMP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/70 to-slate-950 border border-emerald-800/40 p-5 sm:p-7 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <School className="w-3.5 h-3.5" />
                SELEKSI PENERIMAAN SISWA BARU (PSB) SMP LABSCHOOL
              </span>
              <span className="text-xs text-slate-400 font-semibold">Tahun Ajaran 2026/2027</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Modul & Latihan Ujian CAT Masuk SMP Labschool
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              Persiapkan diri Anda untuk menembus seleksi <strong className="text-emerald-300">SMP Labschool Rawamangun, Kebayoran, Cibubur, dan Cirendeu</strong> melalui jalur tes berbasis komputer (CAT) dan jalur prestasi (PPSB).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleLaunchSmpExam()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Simulasi Tryout CAT SMP</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('labschool_roadmap')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-400 transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Lihat Roadmap Silabus</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:w-80 shrink-0 space-y-2.5 shadow-xl text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Struktur Ujian PSB SMP</span>
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Total Butir Soal</span>
                <span className="font-bold text-white">100 Soal Pilihan Ganda</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Durasi Waktu</span>
                <span className="font-bold text-emerald-400">90 Menit</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Sistem Penilaian</span>
                <span className="font-bold text-amber-400">Tanpa Sistem Minus</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Format Ujian</span>
                <span className="font-bold text-blue-400">CAT Komputer CBT</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5 Core Pillars for SMP Labschool */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>5 Subtes Mata Uji Wajib Masuk SMP Labschool</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold text-xs">
                30% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">25 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Matematika & Logika Berhitung</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Operasi pecahan, perbandingan berbalik nilai, geometri bangun datar/ruang, statistika dasar, dan soal cerita pemecahan masalah.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs">
                25% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">25 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">IPA Dasar / Sains Terpadu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ciri makhluk hidup, rantai makanan ekosistem, sistem organ tubuh manusia, besaran, gaya, gerak, kalor, dan tata surya.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs">
                20% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">20 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Tes Potensi Skolastik (TPS)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pola deret angka, hubungan analogi verbal, silogisme logika penarikan kesimpulan, dan penalaran spasial rotasi gambar.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold text-xs">
                15% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">15 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Bahasa Indonesia & Literasi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menentukan ide pokok teks, makna kata istilah, kalimat efektif, penulisan kata baku, dan tanda baca sesuai kaidah EYD.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold text-xs">
                10% BOBOT
              </span>
              <span className="text-[11px] text-slate-400">15 Soal</span>
            </div>
            <h3 className="font-bold text-white text-base">Bahasa Inggris Dasar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reading comprehension (pemahaman teks deskriptif/naratif), vocabulary context, simple grammar tenses, dan functional text.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-700/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">PAKET SIMULASI CBT</span>
              <h3 className="font-extrabold text-white text-base mt-1">Uji Kesiapan Mandiri Sekarang</h3>
              <p className="text-xs text-slate-300 mt-1">
                Latihan simulasi CBT berbasis timer dengan sistem penilaian otomatis dan pembahasan instan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleLaunchSmpExam()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
            >
              <span>Mulai Ujian Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Flash Quiz & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flash Quiz Component (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base sm:text-lg">Kuis Kilat Interaktif PSB SMP (5 Soal)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Soal {activeQuizQuestion + 1} dari {flashQuestions.length}
            </span>
          </div>

          {/* Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
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
                  optClass = 'bg-blue-600/20 border-blue-500 text-blue-200 font-bold';
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
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300 space-y-1">
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
                      ? 'bg-blue-600 text-white shadow-sm'
                      : userAnswers[i]
                      ? 'bg-slate-800 text-blue-300 border border-slate-700'
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                >
                  Periksa Jawaban
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-400">
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

        {/* Passing Chance Calculator (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Kalkulator Peluang Lolos PSB SMP</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hitung peluang kelulusan seleksi SMP Labschool berdasarkan nilai rapor, estimasi skor tryout, dan target kampus.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Kampus Labschool Tujuan</label>
                <select
                  value={targetCampus}
                  onChange={e => setTargetCampus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="rawamangun">Labschool Rawamangun (Jakarta Timur)</option>
                  <option value="kebayoran">Labschool Kebayoran (Jakarta Selatan)</option>
                  <option value="cibubur">Labschool Cibubur (Bekasi/Cibubur)</option>
                  <option value="cirendeu">Labschool Cirendeu (Tangerang Selatan)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Rata-Rata Rapor SD (Kelas 4-6)</span>
                  <span className="text-emerald-400 font-bold">{raporScore}</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="100"
                  value={raporScore}
                  onChange={e => setRaporScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Estimasi Skor Tryout CAT (Skala 1000)</span>
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasAchieve"
                  checked={hasAchievement}
                  onChange={e => setHasAchievement(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-emerald-500"
                />
                <label htmlFor="hasAchieve" className="text-slate-300 cursor-pointer">
                  Memiliki Piagam Prestasi (Olimpiade / Seni / Olahraga)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCalculateChance}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Hitung Estimasi Peluang</span>
            </button>

            {calcResult && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Peluang Lolos:</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {calcResult.percentage}%
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{calcResult.status}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{calcResult.advice}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
