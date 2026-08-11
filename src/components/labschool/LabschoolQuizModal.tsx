import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import {
  QuizHistoryDetail,
  QuizLeaderboardEntry,
  saveStoredQuizHistory,
  saveStoredQuizLeaderboard
} from './labschoolLaporanData';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  Sparkles,
  Trophy,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  ShieldCheck,
  Zap,
  Target,
  FileCheck2,
  HelpCircle,
  Check
} from 'lucide-react';

export interface QuizQuestionItem {
  id: string;
  level: 'SMP' | 'SMA';
  subtestCode: 'PK' | 'KV' | 'PM' | 'KA' | 'SK';
  subtestName: string;
  question: string;
  context?: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Mudah' | 'Sedang' | 'HOTS';
}

// Extensive curated question bank for Labschool PSB (SMP & SMA)
export const LABSCHOOL_QUIZ_BANK: QuizQuestionItem[] = [
  // ==================== SMP QUESTIONS ====================
  // --- PK: Pemahaman Kuantitatif (SMP) ---
  {
    id: 'smp-pk-1',
    level: 'SMP',
    subtestCode: 'PK',
    subtestName: 'Pemahaman Kuantitatif',
    question: 'Sebuah tangki air berbentuk kubus memiliki volume 512 liter. Jika tangki tersebut akan diisi air menggunakan ember bervolume 16 liter, berapa kali pengisian yang dibutuhkan hingga tangki terisi penuh?',
    options: [
      { key: 'A', text: '24 kali' },
      { key: 'B', text: '32 kali' },
      { key: 'C', text: '36 kali' },
      { key: 'D', text: '48 kali' }
    ],
    correctAnswer: 'B',
    explanation: 'Jumlah pengisian = Volume tangki / Volume ember = 512 liter / 16 liter = 32 kali pengisian.',
    difficulty: 'Mudah'
  },
  {
    id: 'smp-pk-2',
    level: 'SMP',
    subtestCode: 'PK',
    subtestName: 'Pemahaman Kuantitatif',
    question: 'Rasio perbandingan jumlah buku Matematika dan buku Sains di perpustakaan Labschool adalah 5 : 3. Jika selisih kedua jenis buku tersebut adalah 24 buah, maka total jumlah seluruh buku Matematika dan Sains adalah...',
    options: [
      { key: 'A', text: '72 buah' },
      { key: 'B', text: '84 buah' },
      { key: 'C', text: '96 buah' },
      { key: 'D', text: '120 buah' }
    ],
    correctAnswer: 'C',
    explanation: 'Selisih rasio = 5 - 3 = 2 bagian = 24 buku -> 1 bagian = 12 buku. Total buku = (5 + 3) × 12 = 8 × 12 = 96 buah.',
    difficulty: 'Sedang'
  },
  {
    id: 'smp-pk-3',
    level: 'SMP',
    subtestCode: 'PK',
    subtestName: 'Pemahaman Kuantitatif',
    question: 'Harga sepasang sepatu setelah mendapatkan diskon 20% adalah Rp 280.000,00. Berapakah harga sepasang sepatu tersebut sebelum didiskon?',
    options: [
      { key: 'A', text: 'Rp 320.000,00' },
      { key: 'B', text: 'Rp 336.000,00' },
      { key: 'C', text: 'Rp 350.000,00' },
      { key: 'D', text: 'Rp 360.000,00' }
    ],
    correctAnswer: 'C',
    explanation: 'Harga setelah diskon = 80% dari harga asli. Harga asli = Rp 280.000 / 0.8 = Rp 350.000,00.',
    difficulty: 'Sedang'
  },

  // --- KV: Kemampuan Verbal (SMP) ---
  {
    id: 'smp-kv-1',
    level: 'SMP',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    question: 'Pilihlah pasangan kata yang memiliki hubungan analogi paling sepadan dengan: DOKTER : PASIEN = ...',
    options: [
      { key: 'A', text: 'GURU : SISWA' },
      { key: 'B', text: 'ARSITEK : BANGUNAN' },
      { key: 'C', text: 'PETANI : CANGKUL' },
      { key: 'D', text: 'MASINIS : KERETA' }
    ],
    correctAnswer: 'A',
    explanation: 'Dokter memberikan bimbingan/layanan medis kepada pasien, sebagaimana Guru memberikan bimbingan/layanan pembelajaran kepada siswa (hubungan profesi dengan sasaran layanannya).',
    difficulty: 'Mudah'
  },
  {
    id: 'smp-kv-2',
    level: 'SMP',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    question: 'Manakah di antara kalimat berikut yang merupakan kalimat efektif dan baku sesuai kaidah PUEBI?',
    options: [
      { key: 'A', text: 'Bagi para siswa-siswa yang akan mengikuti ujian diharapkan hadir tepat waktu.' },
      { key: 'B', text: 'Kepada kepala sekolah waktu dan tempat kami persilakan.' },
      { key: 'C', text: 'Siswa yang akan mengikuti tes seleksi wajib membawa kartu peserta resmi.' },
      { key: 'D', text: 'Di dalam ruangan itu banyak terdapat bermacam-macam buku-buku referensi.' }
    ],
    correctAnswer: 'C',
    explanation: 'Opsi C tidak mengandung pemborosan kata (pleonasme) dan memiliki subjek serta predikat yang jelas dan baku.',
    difficulty: 'Sedang'
  },

  // --- PM: Penalaran Matematika (SMP) ---
  {
    id: 'smp-pm-1',
    level: 'SMP',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    question: 'Tentukan dua suku berikutnya dari barisan bilangan berikut: 3, 5, 9, 17, 33, ... , ...',
    options: [
      { key: 'A', text: '65, 129' },
      { key: 'B', text: '64, 128' },
      { key: 'C', text: '66, 130' },
      { key: 'D', text: '55, 110' }
    ],
    correctAnswer: 'A',
    explanation: 'Pola selisih antar-suku bertambah dua kali lipat: +2, +4, +8, +16, (+32 -> 33 + 32 = 65), (+64 -> 65 + 64 = 129).',
    difficulty: 'Sedang'
  },
  {
    id: 'smp-pm-2',
    level: 'SMP',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    question: 'Semua siswa Labschool gemar membaca buku sains. Beberapa siswa Labschool mengikuti ekstrakurikuler robotik. Kesimpulan logis yang paling tepat adalah...',
    options: [
      { key: 'A', text: 'Semua siswa yang mengikuti robotik tidak gemar membaca buku sains' },
      { key: 'B', text: 'Beberapa siswa yang mengikuti ekstrakurikuler robotik gemar membaca buku sains' },
      { key: 'C', text: 'Siswa yang tidak ikut robotik pasti tidak gemar membaca buku sains' },
      { key: 'D', text: 'Semua siswa gemar robotik dan membaca buku sains' }
    ],
    correctAnswer: 'B',
    explanation: 'Karena semua siswa gemar membaca buku sains, maka sebagian siswa yang mengikuti robotik (yang merupakan siswa Labschool) pasti juga gemar membaca buku sains.',
    difficulty: 'HOTS'
  },

  // --- KA: Kemampuan Akademik (SMP) ---
  {
    id: 'smp-ka-1',
    level: 'SMP',
    subtestCode: 'KA',
    subtestName: 'Kemampuan Akademik (IPA)',
    question: 'Perhatikan rantai makanan berikut: Padi -> Belalang -> Katak -> Ular -> Elang. Jika populasi katak mengalami kepunahan mendadak akibat perburuan liar, dampak ekologis yang paling cepat terjadi adalah...',
    options: [
      { key: 'A', text: 'Populasi belalang menurun drastis dan populasi ular meningkat' },
      { key: 'B', text: 'Populasi belalang melonjak tajam dan populasi padi menurun' },
      { key: 'C', text: 'Populasi elang meningkat drastis' },
      { key: 'D', text: 'Populasi padi dan ular sama-sama bertambah' }
    ],
    correctAnswer: 'B',
    explanation: 'Katak adalah predator belalang. Saat katak punah, belalang berkembang biak tanpa kendali dan memakan padi secara berlebihan sehingga populasi padi menurun.',
    difficulty: 'Sedang'
  },
  {
    id: 'smp-ka-2',
    level: 'SMP',
    subtestCode: 'KA',
    subtestName: 'Kemampuan Akademik (B. Inggris)',
    question: 'Complete the sentence: "Neither of the two candidates _____ selected for the student council president position last week."',
    options: [
      { key: 'A', text: 'were' },
      { key: 'B', text: 'was' },
      { key: 'C', text: 'are' },
      { key: 'D', text: 'is' }
    ],
    correctAnswer: 'B',
    explanation: '"Neither of + plural noun" memerlukan kata kerja tunggal (singular verb). Karena peristiwa terjadi lampau ("last week"), bentuk yang tepat adalah "was".',
    difficulty: 'HOTS'
  },

  // --- SK: Survei Karakter (SMP) ---
  {
    id: 'smp-sk-1',
    level: 'SMP',
    subtestCode: 'SK',
    subtestName: 'Survei Karakter & Profil Pelajar',
    question: 'Saat kerja kelompok proyek sains di kelas, salah satu temanmu tampak kesulitan memahami materi dan pasif. Sikap yang paling mencerminkan nilai Profil Pelajar Labschool adalah...',
    options: [
      { key: 'A', text: 'Membiarkannya agar ia belajar mandiri mencari sumber di internet' },
      { key: 'B', text: 'Mengambil alih seluruh bagian tugasnya agar nilai kelompok tetap aman' },
      { key: 'C', text: 'Mengajaknya berdiskusi secara ramah, membagi tugas sesuai kemampuannya, dan membimbingnya hingga paham' },
      { key: 'D', text: 'Melaporkannya kepada guru agar teman tersebut dikeluarkan dari kelompok' }
    ],
    correctAnswer: 'C',
    explanation: 'Mencerminkan nilai gotong royong, empati, inklusivitas, dan integritas kolaboratif yang menjadi fondasi karakter siswa Labschool.',
    difficulty: 'Sedang'
  },

  // ==================== SMA QUESTIONS ====================
  // --- PK: Pemahaman Kuantitatif (SMA) ---
  {
    id: 'sma-pk-1',
    level: 'SMA',
    subtestCode: 'PK',
    subtestName: 'Pemahaman Kuantitatif',
    question: 'Jika fungsi f(x) = 2x + 3 dan g(x) = x² - 4, maka nilai dari komposisi fungsi (g ∘ f)(1) adalah...',
    options: [
      { key: 'A', text: '21' },
      { key: 'B', text: '25' },
      { key: 'C', text: '16' },
      { key: 'D', text: '12' },
      { key: 'E', text: '9' }
    ],
    correctAnswer: 'A',
    explanation: 'f(1) = 2(1) + 3 = 5. Maka (g ∘ f)(1) = g(f(1)) = g(5) = 5² - 4 = 25 - 4 = 21.',
    difficulty: 'Sedang'
  },
  {
    id: 'sma-pk-2',
    level: 'SMA',
    subtestCode: 'PK',
    subtestName: 'Pemahaman Kuantitatif',
    question: 'Diketahui nilai logaritma ²log 3 = a dan ³log 5 = b. Nilai dari ⁶log 15 jika dinyatakan dalam a dan b adalah...',
    options: [
      { key: 'A', text: '(a + b) / (1 + a)' },
      { key: 'B', text: '(a(1 + b)) / (1 + a)' },
      { key: 'C', text: '(ab + 1) / (a + 1)' },
      { key: 'D', text: '(a + ab) / (a + b)' },
      { key: 'E', text: '(1 + b) / (1 + a)' }
    ],
    correctAnswer: 'B',
    explanation: '⁶log 15 = (²log 15) / (²log 6) = (²log 3 + ²log 5) / (²log 2 + ²log 3) = (a + ab) / (1 + a) = [a(1 + b)] / (1 + a).',
    difficulty: 'HOTS'
  },

  // --- KV: Kemampuan Verbal (SMA) ---
  {
    id: 'sma-kv-1',
    level: 'SMA',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    question: 'Pilihlah pasangan kata yang memiliki hubungan analogi setara dengan: HIPOTESIS : EKSPERIMEN = ...',
    options: [
      { key: 'A', text: 'PREMIS : KESIMPULAN' },
      { key: 'B', text: 'ESTIMASI : PENGUKURAN' },
      { key: 'C', text: 'TEORI : BUKTI' },
      { key: 'D', text: 'DUGAAN : VERIFIKASI' },
      { key: 'E', text: 'RENCANA : ANGGARAN' }
    ],
    correctAnswer: 'D',
    explanation: 'Hipotesis diuji kebenarannya melalui eksperimen, sebagaimana dugaan diuji kebenarannya melalui verifikasi.',
    difficulty: 'HOTS'
  },
  {
    id: 'sma-kv-2',
    level: 'SMA',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    question: 'Semua mahasiswa yang berprestasi memperoleh beasiswa riset. Beberapa peraih beasiswa riset aktif dalam organisasi internasional. Simpulan yang paling sah adalah...',
    options: [
      { key: 'A', text: 'Semua mahasiswa aktif organisasi internasional berprestasi' },
      { key: 'B', text: 'Beberapa mahasiswa yang berprestasi aktif dalam organisasi internasional' },
      { key: 'C', text: 'Mahasiswa yang tidak berprestasi tidak bisa ikut organisasi' },
      { key: 'D', text: 'Semua peraih beasiswa bukan mahasiswa berprestasi' },
      { key: 'E', text: 'Semua mahasiswa aktif organisasi peraih beasiswa' }
    ],
    correctAnswer: 'B',
    explanation: 'Simpulan partikular: Sebagian peraih beasiswa yang aktif organisasi merupakan mahasiswa yang berprestasi.',
    difficulty: 'Sedang'
  },

  // --- PM: Penalaran Matematika (SMA) ---
  {
    id: 'sma-pm-1',
    level: 'SMA',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    question: 'Sebuah perusahaan rintisan mencatat pertumbuhan keuntungan bulanan membentuk deret geometri. Pada bulan ke-2 keuntungan sebesar Rp 6 juta dan bulan ke-5 sebesar Rp 48 juta. Total keuntungan selama 6 bulan pertama adalah...',
    options: [
      { key: 'A', text: 'Rp 189 juta' },
      { key: 'B', text: 'Rp 192 juta' },
      { key: 'C', text: 'Rp 195 juta' },
      { key: 'D', text: 'Rp 210 juta' },
      { key: 'E', text: 'Rp 240 juta' }
    ],
    correctAnswer: 'A',
    explanation: 'U₂ = ar = 6; U₅ = ar⁴ = 48 -> r³ = 8 -> r = 2. Maka a = 3. S₆ = a(r⁶ - 1)/(r - 1) = 3(64 - 1)/1 = 3 × 63 = 189 juta.',
    difficulty: 'HOTS'
  },

  // --- KA: Kemampuan Akademik (SMA) ---
  {
    id: 'sma-ka-1',
    level: 'SMA',
    subtestCode: 'KA',
    subtestName: 'Kemampuan Akademik (Sains)',
    question: 'Gas ideal dalam ruang tertutup mengalami proses isotermal pada suhu 300 K. Jika volume gas diperkecil menjadi sepertiga dari volume semula, maka tekanan gas akan...',
    options: [
      { key: 'A', text: 'Menjadi 1/3 kali semula' },
      { key: 'B', text: 'Menjadi 3 kali semula' },
      { key: 'C', text: 'Menjadi 9 kali semula' },
      { key: 'D', text: 'Tetap tidak berubah' },
      { key: 'E', text: 'Menjadi 1/9 kali semula' }
    ],
    correctAnswer: 'B',
    explanation: 'Hukum Boyle (P₁V₁ = P₂V₂ pada T konstan). Jika V₂ = 1/3 V₁, maka P₂ = P₁ × (V₁ / V₂) = 3 P₁ (menjadi 3 kali semula).',
    difficulty: 'Sedang'
  },

  // --- SK: Survei Karakter (SMA) ---
  {
    id: 'sma-sk-1',
    level: 'SMA',
    subtestCode: 'SK',
    subtestName: 'Survei Karakter & Kepemimpinan',
    question: 'Sebagai ketua tim panitia acara sekolah Labschool, kamu mendapati dua divisi mengalami konflik internal terkait alokasi anggaran dan jadwal panggung. Tindakan terbaik yang harus diambil adalah...',
    options: [
      { key: 'A', text: 'Memutuskan sepihak tanpa meminta pendapat kedua divisi agar efisien' },
      { key: 'B', text: 'Mengadakan musyawarah terarah, mendengarkan argumen kedua belah pihak secara objektif, dan merumuskan win-win solution berlandaskan prioritas visi acara' },
      { key: 'C', text: 'Menyerahkan sepenuhnya kepada guru pembina tanpa mencoba mencari solusi' },
      { key: 'D', text: 'Memilih divisi yang anggotanya lebih banyak teman dekatmu' },
      { key: 'E', text: 'Membatalkan program panggung agar tidak terjadi perdebatan' }
    ],
    correctAnswer: 'B',
    explanation: 'Mencerminkan kepemimpinan inklusif, musyawarah mufakat, objektivitas, dan manajemen resolusi konflik yang matang.',
    difficulty: 'Sedang'
  }
];

interface LabschoolQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentActiveLevel: 'SMP' | 'SMA';
  onQuizCompleted?: (newScore: number, historyItem: QuizHistoryDetail) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LabschoolQuizModal: React.FC<LabschoolQuizModalProps> = ({
  isOpen,
  onClose,
  user,
  currentActiveLevel,
  onQuizCompleted,
  onShowToast
}) => {
  // Setup state
  const [targetLevel, setTargetLevel] = useState<'SMP' | 'SMA'>(currentActiveLevel);
  const [selectedSubtest, setSelectedSubtest] = useState<'ALL' | 'PK' | 'KV' | 'PM' | 'KA' | 'SK'>('ALL');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMode, setDurationMode] = useState<number>(5); // minutes

  // Active quiz state
  const [quizState, setQuizState] = useState<'CONFIG' | 'IN_PROGRESS' | 'FINISHED'>('CONFIG');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);

  // Sync level on open
  useEffect(() => {
    if (isOpen) {
      setTargetLevel(currentActiveLevel);
      setQuizState('CONFIG');
      setUserAnswers({});
      setFlaggedQuestions({});
      setCurrentIndex(0);
    }
  }, [isOpen, currentActiveLevel]);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (quizState === 'IN_PROGRESS' && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizState, secondsRemaining]);

  // Filter questions available for the setup
  const availableQuestions = useMemo(() => {
    return LABSCHOOL_QUIZ_BANK.filter((q) => {
      const matchLevel = q.level === targetLevel;
      const matchSub = selectedSubtest === 'ALL' || q.subtestCode === selectedSubtest;
      return matchLevel && matchSub;
    });
  }, [targetLevel, selectedSubtest]);

  // Start Quiz Handler
  const handleStartQuiz = () => {
    let pool = [...availableQuestions];
    if (pool.length === 0) {
      // Fallback to level questions if subtest has none
      pool = LABSCHOOL_QUIZ_BANK.filter(q => q.level === targetLevel);
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    setActiveQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setSecondsRemaining(durationMode * 60);
    setQuizStartTime(Date.now());
    setQuizState('IN_PROGRESS');
  };

  // Select Option
  const handleSelectOption = (questionId: string, optionKey: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // Toggle Flag
  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Finish and Calculate Results
  const quizResults = useMemo(() => {
    if (activeQuestions.length === 0) {
      return {
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        accuracy: 0,
        durationMinutes: 0,
        badgeTitle: 'Peserta Aktif'
      };
    }

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    activeQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!ans) {
        unanswered++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = Math.round((correct / activeQuestions.length) * 100);
    const accuracy = Math.round((correct / activeQuestions.length) * 100);
    const duration = Math.max(1, Math.round((Date.now() - quizStartTime) / 60000));

    let badgeTitle = 'Peserta Aktif';
    if (score >= 90) badgeTitle = selectedSubtest === 'PK' ? 'Master Kuantitatif' : selectedSubtest === 'KV' ? 'Ksatria Verbal' : selectedSubtest === 'PM' ? 'Pakar Logika PM' : 'Bintang Juara Labschool';
    else if (score >= 80) badgeTitle = 'Performa Unggul';
    else if (score >= 70) badgeTitle = 'Kandidat Tangguh';
    else badgeTitle = 'Pejuang Drill';

    return {
      score,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
      accuracy,
      durationMinutes: duration,
      badgeTitle
    };
  }, [activeQuestions, userAnswers, quizStartTime, selectedSubtest]);

  const handleFinishQuiz = () => {
    setQuizState('FINISHED');

    const result = quizResults;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const subtestLabel = selectedSubtest === 'ALL'
      ? 'Drill Komprehensif Skolastik & Akademik'
      : selectedSubtest === 'PK' ? 'Pemahaman Kuantitatif'
      : selectedSubtest === 'KV' ? 'Kemampuan Verbal'
      : selectedSubtest === 'PM' ? 'Penalaran Matematika'
      : selectedSubtest === 'KA' ? 'Kemampuan Akademik'
      : 'Survei Karakter';

    const status: 'LULUS_SEMPURNA' | 'LULUS' | 'REMEDIAL' =
      result.score >= 90 ? 'LULUS_SEMPURNA' : result.score >= 70 ? 'LULUS' : 'REMEDIAL';

    const newHistoryItem: QuizHistoryDetail = {
      id: `quiz-run-${Date.now()}`,
      quizTitle: `Drill Kilat ${selectedSubtest === 'ALL' ? 'Semua Subtes' : selectedSubtest} ${targetLevel}`,
      subtestCode: selectedSubtest === 'ALL' ? 'PM' : selectedSubtest,
      subtestName: subtestLabel,
      level: targetLevel,
      studentId: user.id || 'std-active-1',
      studentName: user.name || 'Siswa Berprestasi',
      score: result.score,
      correctCount: result.correctCount,
      totalQuestions: activeQuestions.length,
      durationMinutes: result.durationMinutes,
      completedAt: formattedDate,
      difficulty: 'Sedang',
      status: status,
      notes: `Menyelesaikan ${result.correctCount} dari ${activeQuestions.length} soal dengan akurasi ${result.accuracy}%. Tingkat penguasaan materi sangat baik.`
    };

    // Auto update leaderboard & history
    const currentHist = JSON.parse(localStorage.getItem('labschool_quiz_history_v2') || '[]');
    const updatedHist = [newHistoryItem, ...(Array.isArray(currentHist) ? currentHist : [])];
    saveStoredQuizHistory(updatedHist);

    // Update leaderboard entry
    const currentLb = JSON.parse(localStorage.getItem('labschool_quiz_leaderboard_v2') || '[]');
    let updatedLb = Array.isArray(currentLb) ? [...currentLb] : [];
    const myIdx = updatedLb.findIndex((l: QuizLeaderboardEntry) => l.studentId === user.id || l.studentName.toLowerCase() === user.name.toLowerCase());

    if (myIdx >= 0) {
      const old = updatedLb[myIdx];
      const newTotal = (old.totalQuizzesTaken || 1) + 1;
      const newAvg = Math.round(((old.averageScore * (newTotal - 1)) + result.score) / newTotal * 10) / 10;
      updatedLb[myIdx] = {
        ...old,
        averageScore: newAvg,
        totalQuizzesTaken: newTotal,
        accuracyPercentage: Math.round(((old.accuracyPercentage || 85) + result.accuracy) / 2),
        badgeTitle: result.badgeTitle
      };
    }
    saveStoredQuizLeaderboard(updatedLb);

    if (onQuizCompleted) {
      onQuizCompleted(result.score, newHistoryItem);
    }

    if (onShowToast) {
      onShowToast(`Kuis Selesai! Skor Anda: ${result.score}/100. Data telah tersinkronkan ke Leaderboard!`, 'success');
    }
  };

  if (!isOpen) return null;

  const currentQ = activeQuestions[currentIndex];
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Zap className="w-5 h-5 fill-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {quizState === 'CONFIG' && 'Mulai Drill Kuis Kilat PSB Labschool'}
                  {quizState === 'IN_PROGRESS' && `Kuis Aktif: ${targetLevel} Labschool`}
                  {quizState === 'FINISHED' && 'Hasil & Evaluasi Kuis Kilat'}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                  targetLevel === 'SMP'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {targetLevel}-LABS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {quizState === 'CONFIG' && 'Pilih subtes dan durasi untuk menguji kesiapan seleksi PSB.'}
                {quizState === 'IN_PROGRESS' && `Soal ${currentIndex + 1} dari ${activeQuestions.length} • Subtes ${currentQ?.subtestCode || ''}`}
                {quizState === 'FINISHED' && 'Skor Anda langsung tercatat ke Leaderboard & Grafik Nilai.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quizState === 'IN_PROGRESS' && (
              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-bold ${
                secondsRemaining <= 60
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-900 text-amber-300 border-amber-500/30'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-200">
          
          {/* ================= STAGE 1: CONFIGURATION ================= */}
          {quizState === 'CONFIG' && (
            <div className="space-y-5">
              {/* Level Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  1. Pilih Jenjang Sasaran Labschool:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetLevel('SMP')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      targetLevel === 'SMP'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                      targetLevel === 'SMP' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      SMP
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">PSB SMP Labschool</h4>
                      <p className="text-[10px] text-slate-400">Rawamangun, Kebayoran, Cibubur, Cirendeu</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetLevel('SMA')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      targetLevel === 'SMA'
                        ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                      targetLevel === 'SMA' ? 'bg-blue-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      SMA
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">PSB SMA Labschool</h4>
                      <p className="text-[10px] text-slate-400">Jalur Tes CAT & Jalur Prestasi Mandiri</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Subtest Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  2. Pilih Kategori Subtes:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { code: 'ALL', name: '🌟 Semua Subtes (Mix)', desc: 'Campuran 5 Subtes PSB' },
                    { code: 'PK', name: '📐 PK - Kuantitatif', desc: 'Matematika & Perhitungan' },
                    { code: 'KV', name: '📖 KV - Verbal', desc: 'Analogi & Literasi Bahasa' },
                    { code: 'PM', name: '🧠 PM - Penalaran', desc: 'Logika & Pola Angka' },
                    { code: 'KA', name: '🔬 KA - Akademik', desc: 'IPA, IPS, & B. Inggris' },
                    { code: 'SK', name: '🧭 SK - Karakter', desc: 'Profil Pelajar & Moral' }
                  ].map((sub) => (
                    <button
                      key={sub.code}
                      type="button"
                      onClick={() => setSelectedSubtest(sub.code as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedSubtest === sub.code
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-white block text-xs truncate">{sub.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{sub.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drill Length & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    3. Jumlah Butir Soal:
                  </label>
                  <div className="flex gap-2">
                    {[
                      { count: 3, label: '3 Soal Kilat' },
                      { count: 5, label: '5 Soal Standar' },
                      { count: 8, label: '8 Soal Intensif' }
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuestionCount(item.count)}
                        className={`flex-1 py-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          questionCount === item.count
                            ? 'bg-blue-600 border-blue-400 text-white shadow'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    4. Waktu Pengerjaan:
                  </label>
                  <div className="flex gap-2">
                    {[
                      { mins: 3, label: '3 Menit' },
                      { mins: 5, label: '5 Menit' },
                      { mins: 10, label: '10 Menit' }
                    ].map((item) => (
                      <button
                        key={item.mins}
                        type="button"
                        onClick={() => setDurationMode(item.mins)}
                        className={`flex-1 py-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          durationMode === item.mins
                            ? 'bg-amber-600 border-amber-400 text-white shadow'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ready Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Siap Melakukan Drill Kuis?</span>
                    <span className="text-[11px] text-slate-400">
                      Hasil latihan akan langsung memperbarui grafik batang leaderboard Anda.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-launch-quiz-now"
                  onClick={handleStartQuiz}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Mulai Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STAGE 2: IN PROGRESS ================= */}
          {quizState === 'IN_PROGRESS' && currentQ && (
            <div className="space-y-4">
              {/* Question Navigation Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30">
                    {currentQ.subtestCode} - {currentQ.subtestName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
                    Tingkat: {currentQ.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeQuestions.map((q, idx) => {
                    const isAnswered = !!userAnswers[q.id];
                    const isCurrent = idx === currentIndex;
                    const isFlagged = !!flaggedQuestions[q.id];

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center relative ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-md font-black'
                            : isAnswered
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text Box */}
              <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Pertanyaan Nomor {currentIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(currentQ.id)}
                    className={`flex items-center gap-1 font-semibold cursor-pointer ${
                      flaggedQuestions[currentQ.id] ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>🚩 {flaggedQuestions[currentQ.id] ? 'Ragu-ragu (Ditandai)' : 'Tandai Ragu'}</span>
                  </button>
                </div>

                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40'
                          : 'bg-slate-950/60 border-slate-800/90 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {opt.key}
                      </div>
                      <span className="text-xs sm:text-sm font-medium flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quiz Navigation Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < activeQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(prev => Math.min(activeQuestions.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinishQuiz}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Selesaikan & Kumpulkan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STAGE 3: FINISHED / RESULTS ================= */}
          {quizState === 'FINISHED' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Score Hero Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 text-center space-y-3 relative overflow-hidden shadow-xl">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                  <Trophy className="w-8 h-8 fill-slate-950" />
                </div>

                <div>
                  <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                    Hasil Latihan Kuis PSB Labschool
                  </span>
                  <div className="flex items-baseline justify-center gap-1 my-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">{quizResults.score}</span>
                    <span className="text-sm text-slate-400 font-mono">/100</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Badge Diraih: <strong className="text-amber-400 font-black">🏆 {quizResults.badgeTitle}</strong>
                  </p>
                </div>

                {/* Score Breakdown Cards */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Benar</span>
                    <span className="text-sm font-black text-emerald-400">{quizResults.correctCount} Soal</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Salah</span>
                    <span className="text-sm font-black text-rose-400">{quizResults.wrongCount} Soal</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Akurasi</span>
                    <span className="text-sm font-black text-blue-400">{quizResults.accuracy}%</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Waktu</span>
                    <span className="text-sm font-black text-amber-400">{quizResults.durationMinutes} Menit</span>
                  </div>
                </div>
              </div>

              {/* Question by Question Review & Explanations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Pembahasan & Kunci Jawaban Lengkap:
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {activeQuestions.length} Butir Soal
                  </span>
                </div>

                <div className="space-y-3">
                  {activeQuestions.map((q, idx) => {
                    const userAns = userAnswers[q.id];
                    const isCorrect = userAns === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border space-y-2.5 ${
                          isCorrect
                            ? 'bg-emerald-950/15 border-emerald-500/40'
                            : 'bg-rose-950/15 border-rose-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                              isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-bold text-white text-xs">
                              {q.subtestCode} - {q.subtestName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            {isCorrect ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+{Math.round(100 / activeQuestions.length)} Pts)
                              </span>
                            ) : (
                              <span className="text-rose-400 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Salah / Belum Tepat
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Jawaban Anda:</span>
                            <span className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {userAns ? `${userAns}. ${q.options.find(o => o.key === userAns)?.text}` : 'Tidak dijawab'}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Kunci Jawaban:</span>
                            <span className="font-bold text-emerald-400">
                              {q.correctAnswer}. {q.options.find(o => o.key === q.correctAnswer)?.text}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                          <strong className="text-amber-300 block mb-0.5">💡 Penjelasan Konsep:</strong>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuizState('CONFIG')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ulangi / Drill Baru</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Kembali ke Leaderboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
