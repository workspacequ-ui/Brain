import { LabschoolCampusItem, DEFAULT_LABSCHOOL_CAMPUSES } from './labschoolCampusData';

// Types for Tryout Analysis
export interface SubtestSectionDetail {
  id: string;
  name: string; // e.g. "Verbal Bahasa Indonesia", "Verbal Bahasa Inggris"
  codePart: string; // e.g. "KV-IND", "KV-ENG"
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number; // percentage
  score: number; // 0 - 100
  status: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Perlu Penguatan';
  topics: string[];
  recommendation?: string;
}

export interface SubtestScoreDetail {
  code: string; // 'PK' | 'KV' | 'PM' | 'KA' | 'SK'
  name: string;
  score: number; // 0 - 100
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number; // percentage
  status: 'Tinggi' | 'Sedang' | 'Perlu Perhatian';
  color: string;
  sections?: SubtestSectionDetail[];
}

export interface LabschoolTryoutItem {
  id: string;
  title: string;
  level: 'SMP' | 'SMA';
  date: string;
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  subtests: string[];
}

export interface StudentTryoutResult {
  id: string;
  tryoutId: string;
  tryoutTitle: string;
  level: 'SMP' | 'SMA';
  studentId: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  studentAvatar?: string;
  targetCampusId: string; // e.g. 'camp-rawamangun'
  targetCampusName: string;
  totalScore: number; // 0 - 100
  rank: number;
  totalParticipants: number;
  percentile: number;
  durationMinutes: number;
  submittedAt: string;
  subtestScores: SubtestScoreDetail[];
  recommendationNotes: string;
  strengths: string[];
  weaknesses: string[];
}

// 14-Column Multi-Tryout Analysis Row (Standardized Labschool Report)
export interface TryoutMultiColumnAnalysisRow {
  id: string;
  tryoutId: string;
  // Kolom 1: Nama Tryout & Tanggal TO
  tryoutTitle: string;
  submittedAt: string; // e.g. '2026-02-07 14:35'
  studentName: string;
  studentNis: string;
  level: 'SMP' | 'SMA';
  targetCampusId: string;
  targetCampusName: string;
  targetPassingGrade: number;

  // Kolom 2: Nilai PK (Pengetahuan / Penalaran Kuantitatif)
  nilaiPK: number;
  pkCorrect: number;
  pkTotal: number;

  // Kolom 3 - 5: Nilai KV (Kemampuan Verbal)
  kvIndo: number;     // Kolom 3: Sub bagian V.Bindo
  kvInggris: number;  // Kolom 4: Sub bagian V.Bing
  kvTotalAvg: number; // Kolom 5: Total / Rata-rata dari sub bagiannya

  // Kolom 6 - 8: Nilai PM (Pemahaman Membaca)
  pmIndo: number;     // Kolom 6: Literasi B. Indonesia
  pmInggris: number;  // Kolom 7: Literasi B. Inggris (Reading)
  pmTotalAvg: number; // Kolom 8: Total / Rata-rata dari sub bagiannya

  // Kolom 9 - 11: Nilai KA (Kemampuan Akademik)
  kaIpa: number;      // Kolom 9: IPA Terpadu (Saintek)
  kaIps: number;      // Kolom 10: IPS Terpadu (Soshum)
  kaTotalAvg: number; // Kolom 11: Total / Rata-rata dari sub bagiannya

  // Kolom 12: Nilai SK (Survei Karakter)
  nilaiSK: number;
  skCorrect: number;
  skTotal: number;

  // Kolom 13: SKOR AKHIR (LRI Total Score)
  skorAkhir: number;

  // Kolom 14: Status Lulus / Tidak
  isLulus: boolean;
  statusLulusLabel: 'LULUS' | 'TIDAK LULUS';
  selisihPg: number; // skorAkhir - targetPassingGrade
  rank: number;
  totalParticipants: number;
}

// Types for Quiz Analysis & Leaderboard
export interface QuizLeaderboardEntry {
  id: string;
  rank: number;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  studentAvatar: string;
  level: 'SMP' | 'SMA';
  totalQuizzesTaken: number;
  totalScore: number; // aggregate points
  averageScore: number; // 0-100
  accuracyPercentage: number;
  averageSpeedSeconds: number; // e.g. 45s per question
  badgeTitle: string;
  badgeType: 'gold' | 'silver' | 'bronze' | 'speed' | 'accuracy' | 'streak';
  topSubtest: string;
}

export interface QuizHistoryDetail {
  id: string;
  quizTitle: string;
  subtestCode: string;
  subtestName: string;
  level: 'SMP' | 'SMA';
  studentId: string;
  studentName: string;
  score: number; // 0-100
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number;
  completedAt: string;
  difficulty: 'Mudah' | 'Sedang' | 'HOTS / Sulit';
  status: 'LULUS_SEMPURNA' | 'LULUS' | 'REMEDIAL';
  notes: string;
}

// Types for Study Journal & Meeting Reports
export interface LearningJournalMeeting {
  id: string;
  meetingNumber: number; // e.g. 1, 2, 3...
  date: string; // YYYY-MM-DD
  timeRange: string; // e.g. "15:30 - 17:30"
  durationMinutes: number;
  level: 'SMP' | 'SMA';
  subjectName: string; // e.g. "Pengetahuan Kuantitatif (PK)"
  subtestCode: string; // "PK"
  topicTitle: string; // e.g. "Pola Bilangan, Barisan & Aljabar Dasar"
  subtopics: string[];
  instructorName: string; // e.g. "Dr. Hendra Wijaya, M.Pd."
  instructorRole: string; // "Master Tutor Labschool"
  attendanceStatus: 'HADIR' | 'IZIN' | 'SAKIT' | 'TERLAMBAT';
  comprehensionRating: number; // 1 to 5 stars
  comprehensionPercentage: number; // e.g. 90%
  studentNotes: string;
  teacherEvaluation: string;
  homeworkTask?: string;
  homeworkStatus?: 'BELUM' | 'DIKUMPULKAN' | 'SEMPURNA';
  targetCampus: string;
  // Progress status of the learning session / syllabus topic
  progress: 'BELUM' | 'SEDANG' | 'SUDAH'; // Belum Dimulai | Sedang Berjalan | Sudah Selesai
  // Silabus Kurikulum Akademik Integration
  syllabusId?: string; // 'sil-lab-sma' | 'sil-lab-smp' | 'sil-6'
  syllabusCode?: string; // e.g. 'SIL-LAB-SMA'
  syllabusTopicId?: string; // e.g. 'top-sma-1'
  competencyTarget?: string; // Deskripsi capaian kompetensi silabus
  teachingMethod?: string; // Metode ajar di silabus
  // Google Drive & Materi Integration
  driveLink?: string; // Link Google Drive untuk materi, modul, soal, PPT, atau bahan tayang
  driveLinkTitle?: string; // Keterangan atau label khusus link Google Drive
  // Student & Attendees Data Integration
  sessionType?: 'INDIVIDUAL' | 'CLASS_GROUP';
  studentId?: string;
  studentName?: string;
  studentNis?: string;
  studentClass?: string;
  studentAvatar?: string;
  studentGroup?: string;
  attendees?: Array<{
    studentId: string;
    studentName: string;
    studentNis: string;
    studentClass: string;
    studentAvatar?: string;
    studentGroup?: string;
    status: 'HADIR' | 'IZIN' | 'SAKIT' | 'TERLAMBAT';
    note?: string;
  }>;
  totalAttendees?: number;
  presentCount?: number;
}

// WhatsApp Message Template Generator Types
export type WaSenderRole = 'ADMIN' | 'GURU' | 'SISWA' | 'WALI_MURID';
export type WaReceiverRole = 'WALI_MURID' | 'SISWA' | 'GURU' | 'ADMIN';

export interface WaTemplateContext {
  senderRole: WaSenderRole;
  receiverRole: WaReceiverRole;
  studentName: string;
  studentNis: string;
  studentClass: string;
  targetCampus: string;
  latestTryoutScore: number;
  latestQuizScore: number;
  latestMeetingNumber: number;
  latestTopic: string;
  comprehensionRating: number;
  teacherName: string;
  parentName?: string;
  customConsultationTopic?: string;
  customNotes?: string;
  senderPhone?: string;
  receiverPhone?: string;
}

// Storage Keys
export const STORAGE_KEY_LAB_JOURNAL = 'labschool_learning_journal_v2';
export const STORAGE_KEY_LAB_TRYOUT_RESULTS = 'labschool_tryout_results_v2';
export const STORAGE_KEY_LAB_QUIZ_HISTORY = 'labschool_quiz_history_v2';
export const STORAGE_KEY_LAB_TRYOUTS = 'labschool_tryouts_v2';

// Built-in Mock Tryouts
export const DEFAULT_LAB_TRYOUTS: LabschoolTryoutItem[] = [
  // --- SMP Labschool Tryouts (5 Seri Tryout Resmi) ---
  {
    id: 'to-lab-smp-1',
    title: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 1 (Diagnostik Awal)',
    level: 'SMP',
    date: '2026-01-20',
    totalParticipants: 380,
    averageScore: 78.4,
    highestScore: 96.5,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-smp-2',
    title: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 2 (Simulasi Nasional)',
    level: 'SMP',
    date: '2026-02-05',
    totalParticipants: 412,
    averageScore: 81.2,
    highestScore: 98.0,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-smp-3',
    title: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 3 (Pendalaman Soal & Survei Karakter)',
    level: 'SMP',
    date: '2026-02-17',
    totalParticipants: 430,
    averageScore: 83.5,
    highestScore: 98.5,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-smp-4',
    title: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 4 (Final Gladi CBT)',
    level: 'SMP',
    date: '2026-02-25',
    totalParticipants: 455,
    averageScore: 85.0,
    highestScore: 99.0,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-smp-5',
    title: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 5 (Gladi Bersih Final Nasional)',
    level: 'SMP',
    date: '2026-03-02',
    totalParticipants: 480,
    averageScore: 86.8,
    highestScore: 99.5,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },

  // --- SMA Labschool Tryouts (5 Seri Tryout Resmi) ---
  {
    id: 'to-lab-sma-1',
    title: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 1 (Diagnostik Awal)',
    level: 'SMA',
    date: '2026-01-25',
    totalParticipants: 550,
    averageScore: 79.6,
    highestScore: 97.5,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-sma-2',
    title: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 2 (Prediksi & Passing Grade)',
    level: 'SMA',
    date: '2026-02-07',
    totalParticipants: 580,
    averageScore: 82.5,
    highestScore: 99.0,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-sma-3',
    title: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 3 (Pendalaman Soal HOTS)',
    level: 'SMA',
    date: '2026-02-15',
    totalParticipants: 610,
    averageScore: 84.8,
    highestScore: 99.5,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-sma-4',
    title: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 4 (Simulasi Waktu Nyata CBT)',
    level: 'SMA',
    date: '2026-02-22',
    totalParticipants: 635,
    averageScore: 86.2,
    highestScore: 100.0,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  },
  {
    id: 'to-lab-sma-5',
    title: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 5 (Gladi Bersih Final Nasional)',
    level: 'SMA',
    date: '2026-02-28',
    totalParticipants: 680,
    averageScore: 87.5,
    highestScore: 100.0,
    subtests: ['Pengetahuan Kuantitatif', 'Kemampuan Verbal', 'Penalaran Matematika', 'Kemampuan Akademik', 'Survei Karakter']
  }
];

// Built-in Mock Student Tryout Results (Multiple Tryouts History)
export const DEFAULT_STUDENT_TRYOUT_RESULTS: StudentTryoutResult[] = [
  // --- Budi Santoso (SMA - 5 Tryout Series) ---
  {
    id: 'str-1-to1',
    tryoutId: 'to-lab-sma-1',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 1 (Diagnostik Awal)',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    totalScore: 82.5,
    rank: 64,
    totalParticipants: 550,
    percentile: 88.4,
    durationMinutes: 118,
    submittedAt: '2026-01-18 10:15',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 84.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Sedang', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 82.0, maxScore: 100, correctCount: 20, totalQuestions: 25, accuracy: 80.0, status: 'Sedang', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 85.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: 79.5, maxScore: 100, correctCount: 23, totalQuestions: 30, accuracy: 76.7, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 82.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#ec4899' }
    ],
    recommendationNotes: 'Diagnostik awal baik. Fokus pada penguatan konsep dasar IPA fisika dan analogi kata bahasa Indonesia.',
    strengths: ['Aljabar Linier Dasar', 'Logika Silogisme'],
    weaknesses: ['Termodinamika & Fisika (KA)', 'Analogi Padanan Kata']
  },
  {
    id: 'str-1',
    tryoutId: 'to-lab-sma-2',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 2 (Prediksi & Passing Grade)',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    totalScore: 88.5,
    rank: 14,
    totalParticipants: 580,
    percentile: 97.6,
    durationMinutes: 112,
    submittedAt: '2026-02-07 14:35',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 92.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 86.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 90.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: 84.5, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 90.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Performa sangat prima! Skor total 88.5 telah melampaui passing grade SMA Labschool Kebayoran (87.5) dan Rawamangun (86.0). Pertahankan konsistensi latihan soal HOTS pada Kemampuan Akademik (KA) bagian Saintek & Fisika Terapan.',
    strengths: ['Aljabar & Pola Bilangan Kuantitatif', 'Logika Spasial & Silogisme', 'Reading Comprehension Bahasa Inggris'],
    weaknesses: ['Termodinamika & Fisika Terapan (KA)', 'Analogi Kata Kompleks Bahasa Indonesia']
  },
  {
    id: 'str-1-to3',
    tryoutId: 'to-lab-sma-3',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 3 (Pendalaman Soal HOTS)',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    totalScore: 90.5,
    rank: 8,
    totalParticipants: 610,
    percentile: 98.7,
    durationMinutes: 108,
    submittedAt: '2026-02-15 13:40',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 94.0, maxScore: 100, correctCount: 24, totalQuestions: 25, accuracy: 96.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 89.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 92.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: 86.5, maxScore: 100, correctCount: 26, totalQuestions: 30, accuracy: 86.7, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 91.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Peningkatan sangat signifikan pada subtes KA dan PK. Posisi aman peringkat 8 besar nasional.',
    strengths: ['Kecepatan Aljabar HOTS', 'Verbal B. Indonesia & B. Inggris', 'Figural 3D'],
    weaknesses: ['Reaksi Kimia Dasar Larutan']
  },
  {
    id: 'str-1-to4',
    tryoutId: 'to-lab-sma-4',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 4 (Simulasi Waktu Nyata CBT)',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    totalScore: 92.0,
    rank: 5,
    totalParticipants: 635,
    percentile: 99.2,
    durationMinutes: 102,
    submittedAt: '2026-02-22 09:30',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 96.0, maxScore: 100, correctCount: 24, totalQuestions: 25, accuracy: 96.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 90.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 94.0, maxScore: 100, correctCount: 19, totalQuestions: 20, accuracy: 95.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: 88.0, maxScore: 100, correctCount: 26, totalQuestions: 30, accuracy: 86.7, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 92.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Akurasi stabil di atas 90% pada 4 subtes utama. Waktu pengerjaan efisien 102 menit.',
    strengths: ['Manajemen Waktu CBT', 'Analisis Wacana Kritis B.Inggris', 'Trigonometri & Spasial'],
    weaknesses: ['Ketelitian ejaan kata serapan']
  },
  {
    id: 'str-1-to5',
    tryoutId: 'to-lab-sma-5',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 5 (Gladi Bersih Final Nasional)',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    totalScore: 93.8,
    rank: 3,
    totalParticipants: 680,
    percentile: 99.6,
    durationMinutes: 98,
    submittedAt: '2026-02-28 14:00',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 98.0, maxScore: 100, correctCount: 25, totalQuestions: 25, accuracy: 100.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 92.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 95.0, maxScore: 100, correctCount: 19, totalQuestions: 20, accuracy: 95.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: 90.0, maxScore: 100, correctCount: 27, totalQuestions: 30, accuracy: 90.0, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 94.0, maxScore: 100, correctCount: 19, totalQuestions: 20, accuracy: 95.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Skor sempurna di PK! Kesiapan mental dan akademis 100% siap menembus kuota unggulan SMA Labschool Kebayoran.',
    strengths: ['Sempurna di Penalaran Kuantitatif', 'Ketahanan Konsentrasi Ujian CBT', 'Logika Spasial 3D'],
    weaknesses: ['Pertahankan ritme dan jaga kesehatan fisik']
  },

  // --- Siti Aminah (SMP - 4 Tryout Series) ---
  {
    id: 'str-2-to1',
    tryoutId: 'to-lab-smp-1',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 1 (Pemetaan Kemampuan Dasar)',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    totalScore: 81.0,
    rank: 48,
    totalParticipants: 380,
    percentile: 87.4,
    durationMinutes: 106,
    submittedAt: '2026-01-20 09:30',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 82.0, maxScore: 100, correctCount: 20, totalQuestions: 25, accuracy: 80.0, status: 'Sedang', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 85.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 78.0, maxScore: 100, correctCount: 15, totalQuestions: 20, accuracy: 75.0, status: 'Sedang', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (IPA & IPS Terpadu)', score: 80.0, maxScore: 100, correctCount: 24, totalQuestions: 30, accuracy: 80.0, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 80.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#ec4899' }
    ],
    recommendationNotes: 'Dasar verbal sangat baik. Perbanyak drill soal cerita pecahan dan perbandingan matematika.',
    strengths: ['Kosakata Bahasa Indonesia', 'Pancasila & Karakter'],
    weaknesses: ['Perbandingan Berbalik Nilai', 'Siklus Ekosistem IPA']
  },
  {
    id: 'str-2',
    tryoutId: 'to-lab-smp-2',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 2 (Simulasi Nasional)',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    totalScore: 86.0,
    rank: 21,
    totalParticipants: 412,
    percentile: 95.0,
    durationMinutes: 98,
    submittedAt: '2026-02-05 11:20',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 88.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 90.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 82.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (IPA & IPS Terpadu)', score: 85.0, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 85.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Skor 86.0 melampaui passing grade SMP Labschool Rawamangun (84.5). Tingkatkan kecepatan pengerjaan pada penalaran cerita matematika kontekstual.',
    strengths: ['Pemahaman Wacana & Ejaan PBM', 'Aritmatika Sosial & Persentase', 'Pengenalan Pola Geometri 2D'],
    weaknesses: ['Perbandingan Berbalik Nilai Kecepatan/Waktu', 'Klasifikasi Makhluk Hidup HOTS']
  },
  {
    id: 'str-2-to3',
    tryoutId: 'to-lab-smp-3',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 3 (Pendalaman Soal & Survei Karakter)',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    totalScore: 89.2,
    rank: 11,
    totalParticipants: 430,
    percentile: 97.4,
    durationMinutes: 94,
    submittedAt: '2026-02-17 10:45',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 91.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 93.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 86.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (IPA & IPS Terpadu)', score: 88.0, maxScore: 100, correctCount: 26, totalQuestions: 30, accuracy: 86.7, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 88.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Performa konsisten naik di seluruh 5 subtes. Masuk jajaran 15 besar calon siswa terbaik Rawamangun.',
    strengths: ['Verbal B.Inggris & B.Indo', 'Geometri Spasial', 'Aritmatika Sosial'],
    weaknesses: ['Gaya Magnet & Listrik Dasar']
  },
  {
    id: 'str-2-to4',
    tryoutId: 'to-lab-smp-4',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 4 (Final Gladi CBT)',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    totalScore: 91.5,
    rank: 6,
    totalParticipants: 455,
    percentile: 98.7,
    durationMinutes: 90,
    submittedAt: '2026-02-25 13:15',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 94.0, maxScore: 100, correctCount: 24, totalQuestions: 25, accuracy: 96.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 95.0, maxScore: 100, correctCount: 24, totalQuestions: 25, accuracy: 96.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 89.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik (IPA & IPS Terpadu)', score: 90.0, maxScore: 100, correctCount: 27, totalQuestions: 30, accuracy: 90.0, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 89.5, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Peluang lolos di SMP Labschool Rawamangun mencapai 98%! Sangat siap menghadapi tes seleksi sesungguhnya.',
    strengths: ['Literasi Membaca Cepat', 'Kuantitatif & Penalaran Pola', 'Karakter Integritas'],
    weaknesses: ['Pertahankan ritme istirahat']
  },

  // --- Ahmad Rizky (SMA - 3 Tryout Series) ---
  {
    id: 'str-3-to1',
    tryoutId: 'to-lab-sma-1',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 1 (Diagnostik Awal)',
    level: 'SMA',
    studentId: 'u-s3',
    studentName: 'Ahmad Rizky',
    studentNis: '20261003',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    totalScore: 79.5,
    rank: 98,
    totalParticipants: 550,
    percentile: 82.2,
    durationMinutes: 115,
    submittedAt: '2026-01-18 10:45',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 78.0, maxScore: 100, correctCount: 19, totalQuestions: 25, accuracy: 76.0, status: 'Sedang', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 84.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 80.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 76.5, maxScore: 100, correctCount: 22, totalQuestions: 30, accuracy: 73.3, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 79.0, maxScore: 100, correctCount: 15, totalQuestions: 20, accuracy: 75.0, status: 'Sedang', color: '#ec4899' }
    ],
    recommendationNotes: 'Tingkatkan penguasaan rumus kuantitatif dan manajemen waktu pengerjaan soal.',
    strengths: ['Verbal B. Indonesia', 'Silogisme Logika'],
    weaknesses: ['Kecepatan Aljabar', 'Fisika Kinematika']
  },
  {
    id: 'str-3',
    tryoutId: 'to-lab-sma-2',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 2 (Prediksi & Passing Grade)',
    level: 'SMA',
    studentId: 'u-s3',
    studentName: 'Ahmad Rizky',
    studentNis: '20261003',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    totalScore: 85.0,
    rank: 42,
    totalParticipants: 580,
    percentile: 92.8,
    durationMinutes: 105,
    submittedAt: '2026-02-07 15:10',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 84.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Sedang', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 88.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 85.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 82.0, maxScore: 100, correctCount: 24, totalQuestions: 30, accuracy: 80.0, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 86.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Skor 85.0 telah berada di atas passing grade SMA Labschool Cibubur (84.5) dan Cirendeu (83.0). Direkomendasikan untuk memperkuat penguasaan rumus cepat aljabar.',
    strengths: ['Literasi Bahasa Inggris', 'Logika Posisi & Silogisme', 'Geometri Bangun Datar'],
    weaknesses: ['Trigonometri & Vektor Dasar', 'Soal Sebab-Akibat Kimia']
  },
  {
    id: 'str-3-to3',
    tryoutId: 'to-lab-sma-3',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 3 (Pendalaman Soal HOTS)',
    level: 'SMA',
    studentId: 'u-s3',
    studentName: 'Ahmad Rizky',
    studentNis: '20261003',
    studentClass: 'Masuk Labschool',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    totalScore: 87.5,
    rank: 26,
    totalParticipants: 610,
    percentile: 95.8,
    durationMinutes: 100,
    submittedAt: '2026-02-18 14:20',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 88.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 90.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 87.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 85.5, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 87.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Peluang lolos di SMA Labschool Cibubur sangat besar dengan margin +3.0 poin di atas PG.',
    strengths: ['Verbal B.Inggris', 'Aljabar & Aritmatika', 'Logika Spasial'],
    weaknesses: ['Hukum Gravitasi & Kalor']
  },
  {
    id: 'str-3-to4',
    tryoutId: 'to-lab-sma-4',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 4 (Simulasi Waktu Nyata CBT)',
    level: 'SMA',
    studentId: 'u-s3',
    studentName: 'Ahmad Rizky',
    studentNis: '20261003',
    studentClass: 'SMA-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    totalScore: 89.0,
    rank: 18,
    totalParticipants: 635,
    percentile: 97.2,
    durationMinutes: 98,
    submittedAt: '2026-02-22 10:15',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 90.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 92.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 88.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 87.0, maxScore: 100, correctCount: 26, totalQuestions: 30, accuracy: 86.7, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 88.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Performa konsisten di atas 88. Sangat berpeluang lolos jalur tes mandiri SMA Labschool Cibubur.',
    strengths: ['Analogi Kata Kompleks', 'Logika Silogisme', 'Trigonometri'],
    weaknesses: ['Termodinamika Lanjutan']
  },

  // --- Nadia Putri (SMA - 4 Tryout Series) ---
  {
    id: 'str-4-to1',
    tryoutId: 'to-lab-sma-1',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 1 (Diagnostik Awal)',
    level: 'SMA',
    studentId: 'u-s4',
    studentName: 'Nadia Putri',
    studentNis: '20261004',
    studentClass: 'SMA-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    totalScore: 83.0,
    rank: 55,
    totalParticipants: 550,
    percentile: 90.0,
    durationMinutes: 108,
    submittedAt: '2026-01-25 11:30',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 82.0, maxScore: 100, correctCount: 20, totalQuestions: 25, accuracy: 80.0, status: 'Sedang', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 88.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 81.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 80.0, maxScore: 100, correctCount: 24, totalQuestions: 30, accuracy: 80.0, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 84.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Sedang', color: '#ec4899' }
    ],
    recommendationNotes: 'Diagnostik awal baik. Perkuat kecepatan penalaran kuantitatif.',
    strengths: ['Verbal & Literasi B. Inggris', 'Logika Spasial'],
    weaknesses: ['Fungsi Komposisi Matematika']
  },
  {
    id: 'str-4-to2',
    tryoutId: 'to-lab-sma-2',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 2 (Prediksi & Passing Grade)',
    level: 'SMA',
    studentId: 'u-s4',
    studentName: 'Nadia Putri',
    studentNis: '20261004',
    studentClass: 'SMA-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    totalScore: 87.2,
    rank: 22,
    totalParticipants: 580,
    percentile: 96.2,
    durationMinutes: 102,
    submittedAt: '2026-02-07 16:00',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 88.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 91.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 86.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 83.0, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 88.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Skor 87.2 melampaui passing grade SMA Labschool Rawamangun (86.0). Posisi aman.',
    strengths: ['Verbal Bahasa Indonesia & Inggris', 'Kecepatan Skolastik'],
    weaknesses: ['Dinamika Gerak Fisika']
  },
  {
    id: 'str-4-to3',
    tryoutId: 'to-lab-sma-3',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 3 (Pendalaman Soal HOTS)',
    level: 'SMA',
    studentId: 'u-s4',
    studentName: 'Nadia Putri',
    studentNis: '20261004',
    studentClass: 'SMA-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    totalScore: 89.5,
    rank: 12,
    totalParticipants: 610,
    percentile: 98.0,
    durationMinutes: 97,
    submittedAt: '2026-02-15 14:10',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 92.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 93.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 89.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 84.5, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 89.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Sangat prima, margin +3.5 di atas PG SMA Rawamangun.',
    strengths: ['Akurasi Literasi Tinggi', 'Kuantitatif Cepat'],
    weaknesses: ['Reaksi Redoks Kimia']
  },
  {
    id: 'str-4-to4',
    tryoutId: 'to-lab-sma-4',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 4 (Simulasi Waktu Nyata CBT)',
    level: 'SMA',
    studentId: 'u-s4',
    studentName: 'Nadia Putri',
    studentNis: '20261004',
    studentClass: 'SMA-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    totalScore: 91.0,
    rank: 8,
    totalParticipants: 635,
    percentile: 98.7,
    durationMinutes: 94,
    submittedAt: '2026-02-22 11:00',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 94.0, maxScore: 100, correctCount: 24, totalQuestions: 25, accuracy: 96.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 94.0, maxScore: 100, correctCount: 24, totalQuestions: 25, accuracy: 96.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 91.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 86.0, maxScore: 100, correctCount: 26, totalQuestions: 30, accuracy: 86.7, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 90.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Peringkat 8 besar simulasi CBT nasional. Kesiapan luar biasa.',
    strengths: ['Kecepatan CBT & Konsistensi', 'Reading Comprehension'],
    weaknesses: ['Istirahat cukup sebelum hari H']
  },

  // --- Farhan Maulana (SMP - 4 Tryout Series) ---
  {
    id: 'str-5-to1',
    tryoutId: 'to-lab-smp-1',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 1 (Diagnostik Awal)',
    level: 'SMP',
    studentId: 'u-s5',
    studentName: 'Farhan Maulana',
    studentNis: '20261005',
    studentClass: 'SMP-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    totalScore: 79.0,
    rank: 62,
    totalParticipants: 380,
    percentile: 83.7,
    durationMinutes: 104,
    submittedAt: '2026-01-20 10:00',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 80.0, maxScore: 100, correctCount: 20, totalQuestions: 25, accuracy: 80.0, status: 'Sedang', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 82.0, maxScore: 100, correctCount: 20, totalQuestions: 25, accuracy: 80.0, status: 'Sedang', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 76.0, maxScore: 100, correctCount: 15, totalQuestions: 20, accuracy: 75.0, status: 'Sedang', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 78.0, maxScore: 100, correctCount: 23, totalQuestions: 30, accuracy: 76.7, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 79.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#ec4899' }
    ],
    recommendationNotes: 'Tingkatkan akurasi pada soal cerita pecahan dan IPA ekosistem.',
    strengths: ['Geometri Datar', 'Karakter & Etika'],
    weaknesses: ['Perbandingan Pecahan', 'Pengukuran IPA']
  },
  {
    id: 'str-5-to2',
    tryoutId: 'to-lab-smp-2',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 2 (Simulasi Nasional)',
    level: 'SMP',
    studentId: 'u-s5',
    studentName: 'Farhan Maulana',
    studentNis: '20261005',
    studentClass: 'SMP-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    totalScore: 84.0,
    rank: 34,
    totalParticipants: 412,
    percentile: 91.7,
    durationMinutes: 98,
    submittedAt: '2026-02-05 12:00',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 86.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 86.0, maxScore: 100, correctCount: 21, totalQuestions: 25, accuracy: 84.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 82.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 83.0, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Sedang', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 83.0, maxScore: 100, correctCount: 16, totalQuestions: 20, accuracy: 80.0, status: 'Sedang', color: '#ec4899' }
    ],
    recommendationNotes: 'Peningkatan +5 poin dari TO 1. Mendekati passing grade SMP Kebayoran (86.0).',
    strengths: ['Kosakata Baku', 'Aritmatika Sosial'],
    weaknesses: ['Sudut & Garis Sejajar']
  },
  {
    id: 'str-5-to3',
    tryoutId: 'to-lab-smp-3',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 3 (Pendalaman Soal & Survei Karakter)',
    level: 'SMP',
    studentId: 'u-s5',
    studentName: 'Farhan Maulana',
    studentNis: '20261005',
    studentClass: 'SMP-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    totalScore: 87.0,
    rank: 16,
    totalParticipants: 430,
    percentile: 96.3,
    durationMinutes: 93,
    submittedAt: '2026-02-17 11:15',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 89.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 90.0, maxScore: 100, correctCount: 22, totalQuestions: 25, accuracy: 88.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 85.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 85.0, maxScore: 100, correctCount: 25, totalQuestions: 30, accuracy: 83.3, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 86.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Skor 87.0 telah resmi lolos passing grade SMP Labschool Kebayoran (86.0).',
    strengths: ['Analisis Grafik', 'Penalaran Deret'],
    weaknesses: ['Perbanyak latihan soal HOTS IPA']
  },
  {
    id: 'str-5-to4',
    tryoutId: 'to-lab-smp-4',
    tryoutTitle: 'Tryout Akbar PSB SMP Labschool 2026 - Seri 4 (Final Gladi CBT)',
    level: 'SMP',
    studentId: 'u-s5',
    studentName: 'Farhan Maulana',
    studentNis: '20261005',
    studentClass: 'SMP-LABS',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    totalScore: 89.5,
    rank: 10,
    totalParticipants: 455,
    percentile: 97.8,
    durationMinutes: 89,
    submittedAt: '2026-02-25 14:00',
    subtestScores: [
      { code: 'PK', name: 'Pengetahuan Kuantitatif', score: 92.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#f59e0b' },
      { code: 'KV', name: 'Kemampuan Verbal', score: 92.0, maxScore: 100, correctCount: 23, totalQuestions: 25, accuracy: 92.0, status: 'Tinggi', color: '#3b82f6' },
      { code: 'PM', name: 'Penalaran Matematika', score: 88.0, maxScore: 100, correctCount: 17, totalQuestions: 20, accuracy: 85.0, status: 'Tinggi', color: '#10b981' },
      { code: 'KA', name: 'Kemampuan Akademik', score: 87.5, maxScore: 100, correctCount: 26, totalQuestions: 30, accuracy: 86.7, status: 'Tinggi', color: '#8b5cf6' },
      { code: 'SK', name: 'Survei Karakter', score: 88.0, maxScore: 100, correctCount: 18, totalQuestions: 20, accuracy: 90.0, status: 'Tinggi', color: '#ec4899' }
    ],
    recommendationNotes: 'Top 10 Nasional simulasi SMP Labschool Kebayoran. Kesiapan sangat mantap!',
    strengths: ['Ketahanan Fokus CBT', 'Skor Rata-rata Stabil 90'],
    weaknesses: ['Jaga kebugaran jasmani']
  }
];

// Active Students Directory categorized by Jenjang (SMA-LABSCHOOL & SMP-LABSCHOOL)
export interface LabschoolActiveStudent {
  id: string;
  name: string;
  nis: string;
  level: 'SMP' | 'SMA';
  className: 'SMA-LABSCHOOL' | 'SMP-LABSCHOOL';
  targetCampusId: string;
  targetCampusName: string;
  avatar?: string;
  tryoutCount: number;
  latestScore: number;
}

export const DEFAULT_LABSCHOOL_ACTIVE_STUDENTS: LabschoolActiveStudent[] = [
  // --- SMA-LABS (Kelas SMA-LABSCHOOL) Students ---
  {
    id: 'u-sma-lab-1',
    name: 'Arya Dewantara Putra',
    nis: '20261011',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
    tryoutCount: 5,
    latestScore: 92.5
  },
  {
    id: 'u-sma-lab-2',
    name: 'Amanda Felicia Wardani',
    nis: '20261012',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    tryoutCount: 5,
    latestScore: 94.0
  },
  {
    id: 'u-sma-lab-3',
    name: 'Dimas Arya Satya',
    nis: '20261013',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-cirendeu',
    targetCampusName: 'SMA Labschool Cirendeu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    tryoutCount: 5,
    latestScore: 89.5
  },
  {
    id: 'u-sma-lab-4',
    name: 'Zahra Khairunnisa',
    nis: '20261014',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    tryoutCount: 5,
    latestScore: 91.5
  },
  {
    id: 'u-sma-lab-5',
    name: 'Farhan Maulana Yusuf',
    nis: '20261015',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    tryoutCount: 5,
    latestScore: 93.0
  },
  {
    id: 'u-sma-lab-6',
    name: 'Syifa Azzahra Putri',
    nis: '20261016',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    tryoutCount: 5,
    latestScore: 90.0
  },
  {
    id: 'u-sma-lab-7',
    name: 'Rafif Danish Pratama',
    nis: '20261017',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-cirendeu',
    targetCampusName: 'SMA Labschool Cirendeu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    tryoutCount: 5,
    latestScore: 88.5
  },
  {
    id: 'u-sma-lab-8',
    name: 'Nadine Aurelia Salma',
    nis: '20261018',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    tryoutCount: 5,
    latestScore: 92.0
  },
  {
    id: 'u-s1',
    name: 'Budi Santoso',
    nis: '20261001',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMA Labschool Kebayoran',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    tryoutCount: 5,
    latestScore: 93.8
  },
  {
    id: 'u-s3',
    name: 'Ahmad Rizky',
    nis: '20261003',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMA Labschool Cibubur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    tryoutCount: 4,
    latestScore: 89.0
  },
  {
    id: 'u-s4',
    name: 'Nadia Putri',
    nis: '20261004',
    level: 'SMA',
    className: 'SMA-LABSCHOOL',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMA Labschool Rawamangun',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    tryoutCount: 4,
    latestScore: 91.0
  },

  // --- SMP-LABS (Kelas SMP-LABSCHOOL) Students ---
  {
    id: 'u-smp-lab-1',
    name: 'Raditya Pratama Putra',
    nis: '20267001',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
    tryoutCount: 4,
    latestScore: 91.0
  },
  {
    id: 'u-smp-lab-2',
    name: 'Keisha Aurelia Putri',
    nis: '20267002',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    tryoutCount: 4,
    latestScore: 93.5
  },
  {
    id: 'u-smp-lab-3',
    name: 'M. Rizky Fadhilah',
    nis: '20267003',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMP Labschool Cibubur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    tryoutCount: 4,
    latestScore: 88.0
  },
  {
    id: 'u-smp-lab-4',
    name: 'Kayla Zahra Syarafina',
    nis: '20267004',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-cirendeu',
    targetCampusName: 'SMP Labschool Cirendeu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    tryoutCount: 4,
    latestScore: 90.0
  },
  {
    id: 'u-smp-lab-5',
    name: 'Davin Alfarizi Ramadhan',
    nis: '20267005',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    tryoutCount: 4,
    latestScore: 91.5
  },
  {
    id: 'u-smp-lab-6',
    name: 'Naura Sabrina Azzahra',
    nis: '20267006',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    tryoutCount: 4,
    latestScore: 92.0
  },
  {
    id: 'u-smp-lab-7',
    name: 'Keenan Arkananta',
    nis: '20267007',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-cibubur',
    targetCampusName: 'SMP Labschool Cibubur',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    tryoutCount: 4,
    latestScore: 89.0
  },
  {
    id: 'u-smp-lab-8',
    name: 'Althaf Xavier Danendra',
    nis: '20267008',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-cirendeu',
    targetCampusName: 'SMP Labschool Cirendeu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    tryoutCount: 4,
    latestScore: 87.5
  },
  {
    id: 'u-s2',
    name: 'Siti Aminah',
    nis: '20261002',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'SMP Labschool Rawamangun',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    tryoutCount: 4,
    latestScore: 91.5
  },
  {
    id: 'u-s5',
    name: 'Farhan Maulana',
    nis: '20261005',
    level: 'SMP',
    className: 'SMP-LABSCHOOL',
    targetCampusId: 'camp-kebayoran',
    targetCampusName: 'SMP Labschool Kebayoran',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    tryoutCount: 4,
    latestScore: 89.5
  }
];

export function getActiveStudentsByLevel(level: 'SMP' | 'SMA'): LabschoolActiveStudent[] {
  return DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.filter(s => s.level === level);
}

// Built-in Mock Quiz Leaderboard
export const DEFAULT_QUIZ_LEADERBOARD: QuizLeaderboardEntry[] = [
  // --- SMA Leaders ---
  {
    id: 'lb-sma-1',
    rank: 1,
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 18,
    totalScore: 1760,
    averageScore: 97.8,
    accuracyPercentage: 96.5,
    averageSpeedSeconds: 28,
    badgeTitle: 'Grand Champion SMA',
    badgeType: 'gold',
    topSubtest: 'Pengetahuan Kuantitatif (PK)'
  },
  {
    id: 'lb-sma-2',
    rank: 2,
    studentId: 'u-sma-lab-2',
    studentName: 'Amanda Felicia Wardani',
    studentNis: '20261012',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 17,
    totalScore: 1690,
    averageScore: 97.0,
    accuracyPercentage: 95.8,
    averageSpeedSeconds: 29,
    badgeTitle: 'Master Akurasi 96%+',
    badgeType: 'silver',
    topSubtest: 'Kemampuan Verbal (KV)'
  },
  {
    id: 'lb-sma-3',
    rank: 3,
    studentId: 'u-s4',
    studentName: 'Nadia Putri',
    studentNis: '20261004',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 16,
    totalScore: 1580,
    averageScore: 96.2,
    accuracyPercentage: 94.5,
    averageSpeedSeconds: 26,
    badgeTitle: '⚡ Speed Demon SMA',
    badgeType: 'speed',
    topSubtest: 'Skolastik & Logika (SK)'
  },
  {
    id: 'lb-sma-4',
    rank: 4,
    studentId: 'u-sma-lab-5',
    studentName: 'Farhan Maulana Yusuf',
    studentNis: '20261015',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 16,
    totalScore: 1530,
    averageScore: 95.4,
    accuracyPercentage: 93.8,
    averageSpeedSeconds: 31,
    badgeTitle: '🔥 Streak 12 Hari',
    badgeType: 'streak',
    topSubtest: 'Penalaran Matematika (PM)'
  },
  {
    id: 'lb-sma-5',
    rank: 5,
    studentId: 'u-sma-lab-1',
    studentName: 'Arya Dewantara Putra',
    studentNis: '20261011',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 15,
    totalScore: 1460,
    averageScore: 94.8,
    accuracyPercentage: 93.0,
    averageSpeedSeconds: 33,
    badgeTitle: '🎯 Top 5 Finalist',
    badgeType: 'bronze',
    topSubtest: 'Kemampuan Akademik (KA)'
  },
  {
    id: 'lb-sma-6',
    rank: 6,
    studentId: 'u-sma-lab-8',
    studentName: 'Nadine Aurelia Salma',
    studentNis: '20261018',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 15,
    totalScore: 1420,
    averageScore: 94.0,
    accuracyPercentage: 92.5,
    averageSpeedSeconds: 35,
    badgeTitle: 'Konsisten & Tangguh',
    badgeType: 'accuracy',
    topSubtest: 'Kemampuan Verbal (KV)'
  },
  {
    id: 'lb-sma-7',
    rank: 7,
    studentId: 'u-sma-lab-4',
    studentName: 'Zahra Khairunnisa',
    studentNis: '20261014',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 14,
    totalScore: 1350,
    averageScore: 93.5,
    accuracyPercentage: 91.8,
    averageSpeedSeconds: 36,
    badgeTitle: 'Pakar Literasi Wacana',
    badgeType: 'accuracy',
    topSubtest: 'Pemahaman Membaca (PM)'
  },
  {
    id: 'lb-sma-8',
    rank: 8,
    studentId: 'u-s3',
    studentName: 'Ahmad Rizky',
    studentNis: '20261003',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 14,
    totalScore: 1310,
    averageScore: 92.8,
    accuracyPercentage: 91.0,
    averageSpeedSeconds: 38,
    badgeTitle: 'Pejuang Sains & IPA',
    badgeType: 'bronze',
    topSubtest: 'Kemampuan Akademik (KA)'
  },
  {
    id: 'lb-sma-9',
    rank: 9,
    studentId: 'u-sma-lab-6',
    studentName: 'Syifa Azzahra Putri',
    studentNis: '20261016',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 13,
    totalScore: 1240,
    averageScore: 91.5,
    accuracyPercentage: 89.5,
    averageSpeedSeconds: 40,
    badgeTitle: 'Master Penalaran Spasial',
    badgeType: 'speed',
    topSubtest: 'Skolastik & Logika (SK)'
  },
  {
    id: 'lb-sma-10',
    rank: 10,
    studentId: 'u-sma-lab-3',
    studentName: 'Dimas Arya Satya',
    studentNis: '20261013',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 13,
    totalScore: 1200,
    averageScore: 90.8,
    accuracyPercentage: 88.7,
    averageSpeedSeconds: 42,
    badgeTitle: 'Dedikasi Belajar',
    badgeType: 'streak',
    topSubtest: 'Pengetahuan Kuantitatif (PK)'
  },
  {
    id: 'lb-sma-11',
    rank: 11,
    studentId: 'u-sma-lab-7',
    studentName: 'Rafif Danish Pratama',
    studentNis: '20261017',
    studentClass: 'SMA-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    level: 'SMA',
    totalQuizzesTaken: 12,
    totalScore: 1120,
    averageScore: 89.5,
    accuracyPercentage: 87.5,
    averageSpeedSeconds: 44,
    badgeTitle: 'Penantang Tangguh',
    badgeType: 'bronze',
    topSubtest: 'Penalaran Matematika (PM)'
  },

  // --- SMP Leaders ---
  {
    id: 'lb-smp-1',
    rank: 1,
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 17,
    totalScore: 1680,
    averageScore: 96.5,
    accuracyPercentage: 95.5,
    averageSpeedSeconds: 30,
    badgeTitle: 'Grand Champion SMP',
    badgeType: 'gold',
    topSubtest: 'Kemampuan Verbal (KV)'
  },
  {
    id: 'lb-smp-2',
    rank: 2,
    studentId: 'u-smp-lab-2',
    studentName: 'Keisha Aurelia Putri',
    studentNis: '20267002',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 16,
    totalScore: 1600,
    averageScore: 95.8,
    accuracyPercentage: 94.8,
    averageSpeedSeconds: 31,
    badgeTitle: 'Master Akurasi SMP',
    badgeType: 'silver',
    topSubtest: 'Pengetahuan Kuantitatif (PK)'
  },
  {
    id: 'lb-smp-3',
    rank: 3,
    studentId: 'u-smp-lab-6',
    studentName: 'Naura Sabrina Azzahra',
    studentNis: '20267006',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 15,
    totalScore: 1480,
    averageScore: 94.6,
    accuracyPercentage: 93.5,
    averageSpeedSeconds: 32,
    badgeTitle: '⚡ Speed Demon SMP',
    badgeType: 'speed',
    topSubtest: 'Pemahaman Membaca (PM)'
  },
  {
    id: 'lb-smp-4',
    rank: 4,
    studentId: 'u-smp-lab-5',
    studentName: 'Davin Alfarizi Ramadhan',
    studentNis: '20267005',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 15,
    totalScore: 1450,
    averageScore: 93.8,
    accuracyPercentage: 92.8,
    averageSpeedSeconds: 34,
    badgeTitle: '🔥 Streak 10 Hari',
    badgeType: 'streak',
    topSubtest: 'Kemampuan Akademik (KA)'
  },
  {
    id: 'lb-smp-5',
    rank: 5,
    studentId: 'u-smp-lab-1',
    studentName: 'Raditya Pratama Putra',
    studentNis: '20267001',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 14,
    totalScore: 1380,
    averageScore: 93.0,
    accuracyPercentage: 92.0,
    averageSpeedSeconds: 35,
    badgeTitle: '🎯 Top 5 Finalist SMP',
    badgeType: 'bronze',
    topSubtest: 'Skolastik & Logika (SK)'
  },
  {
    id: 'lb-smp-6',
    rank: 6,
    studentId: 'u-smp-lab-4',
    studentName: 'Kayla Zahra Syarafina',
    studentNis: '20267004',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 14,
    totalScore: 1340,
    averageScore: 92.2,
    accuracyPercentage: 91.0,
    averageSpeedSeconds: 37,
    badgeTitle: 'Konsisten & Cermat',
    badgeType: 'accuracy',
    topSubtest: 'Kemampuan Verbal (KV)'
  },
  {
    id: 'lb-smp-7',
    rank: 7,
    studentId: 'u-s5',
    studentName: 'Farhan Maulana',
    studentNis: '20261005',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 13,
    totalScore: 1260,
    averageScore: 91.5,
    accuracyPercentage: 90.0,
    averageSpeedSeconds: 38,
    badgeTitle: 'Pejuang Hebat SMP',
    badgeType: 'bronze',
    topSubtest: 'Pengetahuan Kuantitatif (PK)'
  },
  {
    id: 'lb-smp-8',
    rank: 8,
    studentId: 'u-smp-lab-7',
    studentName: 'Keenan Arkananta',
    studentNis: '20267007',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 13,
    totalScore: 1220,
    averageScore: 90.6,
    accuracyPercentage: 89.2,
    averageSpeedSeconds: 39,
    badgeTitle: 'Pakar Logika Gambar',
    badgeType: 'speed',
    topSubtest: 'Skolastik & Logika (SK)'
  },
  {
    id: 'lb-smp-9',
    rank: 9,
    studentId: 'u-smp-lab-3',
    studentName: 'M. Rizky Fadhilah',
    studentNis: '20267003',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 12,
    totalScore: 1140,
    averageScore: 89.8,
    accuracyPercentage: 88.0,
    averageSpeedSeconds: 41,
    badgeTitle: 'Penuh Semangat',
    badgeType: 'streak',
    topSubtest: 'Penalaran Matematika (PM)'
  },
  {
    id: 'lb-smp-10',
    rank: 10,
    studentId: 'u-smp-lab-8',
    studentName: 'Althaf Xavier Danendra',
    studentNis: '20267008',
    studentClass: 'SMP-LABSCHOOL',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    level: 'SMP',
    totalQuizzesTaken: 12,
    totalScore: 1090,
    averageScore: 88.5,
    accuracyPercentage: 87.0,
    averageSpeedSeconds: 43,
    badgeTitle: 'Pejuang Tangguh',
    badgeType: 'bronze',
    topSubtest: 'Kemampuan Akademik (KA)'
  }
];

// Built-in Mock Quiz History
export const DEFAULT_QUIZ_HISTORY: QuizHistoryDetail[] = [
  // --- SMA Quiz History ---
  {
    id: 'qh-sma-1',
    quizTitle: 'Drill Soal PK - Deret Aritmatika & Aljabar HOTS',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    score: 100,
    correctCount: 10,
    totalQuestions: 10,
    durationMinutes: 8,
    completedAt: '2026-02-08 16:40',
    difficulty: 'HOTS / Sulit',
    status: 'LULUS_SEMPURNA',
    notes: 'Sangat menguasai pola deret bertingkat dua dan substitusi aljabar kuadrat.'
  },
  {
    id: 'qh-sma-2',
    quizTitle: 'Drill Soal KV - Silogisme & Analogi Kata Kompleks',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    score: 90,
    correctCount: 9,
    totalQuestions: 10,
    durationMinutes: 9,
    completedAt: '2026-02-07 19:15',
    difficulty: 'Sedang',
    status: 'LULUS',
    notes: 'Salah 1 nomor pada pernyataan negasi premis ganda. Pembahasan sudah dipelajari.'
  },
  {
    id: 'qh-sma-3',
    quizTitle: 'Drill Soal PM - Geometri Ruang & Peluang Kombinatorika',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    score: 95,
    correctCount: 19,
    totalQuestions: 20,
    durationMinutes: 18,
    completedAt: '2026-02-06 15:30',
    difficulty: 'HOTS / Sulit',
    status: 'LULUS',
    notes: 'Kecepatan pengerjaan sangat stabil di bawah 60 detik per butir soal.'
  },
  {
    id: 'qh-sma-4',
    quizTitle: 'Drill Soal SK - Rotasi 3D & Matriks Pola Spasial',
    subtestCode: 'SK',
    subtestName: 'Skolastik & Logika',
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    score: 90,
    correctCount: 9,
    totalQuestions: 10,
    durationMinutes: 7,
    completedAt: '2026-02-04 17:20',
    difficulty: 'HOTS / Sulit',
    status: 'LULUS',
    notes: 'Penglihatan spasial rotasi jaring-jaring kubus sangat tajam.'
  },
  {
    id: 'qh-sma-5',
    quizTitle: 'Drill Soal KA - Fisika Kinematika & Reaksi Kimia SMA',
    subtestCode: 'KA',
    subtestName: 'Kemampuan Akademik',
    level: 'SMA',
    studentId: 'u-sma-lab-1',
    studentName: 'Arya Dewantara Putra',
    score: 95,
    correctCount: 19,
    totalQuestions: 20,
    durationMinutes: 16,
    completedAt: '2026-02-08 11:30',
    difficulty: 'HOTS / Sulit',
    status: 'LULUS',
    notes: 'Pemahaman gerak parabola dan hukum termodinamika sangat baik.'
  },

  // --- SMP Quiz History ---
  {
    id: 'qh-smp-1',
    quizTitle: 'Drill Soal KA - Sains Terpadu & Fisika Dasar SMP',
    subtestCode: 'KA',
    subtestName: 'Kemampuan Akademik',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    score: 100,
    correctCount: 15,
    totalQuestions: 15,
    durationMinutes: 12,
    completedAt: '2026-02-07 14:00',
    difficulty: 'Sedang',
    status: 'LULUS_SEMPURNA',
    notes: 'Konsep gerak lurus, kalor, dan ekosistem tuntas 100% tanpa kesalahan.'
  },
  {
    id: 'qh-smp-2',
    quizTitle: 'Drill Soal PK - Aritmatika Sosial & Pecahan SMP',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    score: 95,
    correctCount: 19,
    totalQuestions: 20,
    durationMinutes: 15,
    completedAt: '2026-02-08 10:20',
    difficulty: 'Sedang',
    status: 'LULUS',
    notes: 'Perhitungan diskon ganda dan perbandingan senilai diselesaikan dengan trik cepat 30 detik.'
  },
  {
    id: 'qh-smp-3',
    quizTitle: 'Drill Soal KV - Analogi Kata & PUEBI Bahasa Indonesia SMP',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    score: 100,
    correctCount: 15,
    totalQuestions: 15,
    durationMinutes: 11,
    completedAt: '2026-02-07 16:30',
    difficulty: 'Sedang',
    status: 'LULUS_SEMPURNA',
    notes: 'Akurasi sempurna dalam mengidentifikasi hubungan kata sebab-akibat dan sinonim antonim.'
  },
  {
    id: 'qh-smp-4',
    quizTitle: 'Drill Soal PM - Soal Cerita Geometri & Sudut SMP',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    score: 90,
    correctCount: 18,
    totalQuestions: 20,
    durationMinutes: 17,
    completedAt: '2026-02-06 14:15',
    difficulty: 'HOTS / Sulit',
    status: 'LULUS',
    notes: 'Menyelesaikan luas bangun datar gabungan dengan metode pengurangan segmen tepat.'
  },
  {
    id: 'qh-smp-5',
    quizTitle: 'Drill Soal SK - Jaring-jaring Kubus & Pola Gambar 2D SMP',
    subtestCode: 'SK',
    subtestName: 'Skolastik & Logika',
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    score: 95,
    correctCount: 19,
    totalQuestions: 20,
    durationMinutes: 13,
    completedAt: '2026-02-05 15:45',
    difficulty: 'Sedang',
    status: 'LULUS',
    notes: 'Kecepatan visualisasi rotasi pola kubus dan silogisme logika berada di atas rata-rata peserta nasional.'
  },
  {
    id: 'qh-smp-6',
    quizTitle: 'Drill Soal PK - FPB, KPK & Pola Bilangan Masuk SMP',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    level: 'SMP',
    studentId: 'u-smp-lab-2',
    studentName: 'Keisha Aurelia Putri',
    score: 100,
    correctCount: 15,
    totalQuestions: 15,
    durationMinutes: 10,
    completedAt: '2026-02-08 14:00',
    difficulty: 'Sedang',
    status: 'LULUS_SEMPURNA',
    notes: 'Faktor prima dan soal cerita lampu berkedip bersamaan tuntas tepat waktu.'
  },
  {
    id: 'qh-smp-7',
    quizTitle: 'Drill Soal KV - Pemahaman Teks Wacana & Ejaan SMP',
    subtestCode: 'KV',
    subtestName: 'Kemampuan Verbal',
    level: 'SMP',
    studentId: 'u-smp-lab-6',
    studentName: 'Naura Sabrina Azzahra',
    score: 95,
    correctCount: 19,
    totalQuestions: 20,
    durationMinutes: 14,
    completedAt: '2026-02-07 11:20',
    difficulty: 'Sedang',
    status: 'LULUS',
    notes: 'Pemahaman ide pokok paragraf dan konjungsi antarkalimat sangat baik.'
  },
  {
    id: 'qh-smp-8',
    quizTitle: 'Drill Soal KA - IPS Terpadu, Sejarah & Peta SMP',
    subtestCode: 'KA',
    subtestName: 'Kemampuan Akademik',
    level: 'SMP',
    studentId: 'u-smp-lab-5',
    studentName: 'Davin Alfarizi Ramadhan',
    score: 95,
    correctCount: 19,
    totalQuestions: 20,
    durationMinutes: 13,
    completedAt: '2026-02-06 16:10',
    difficulty: 'Sedang',
    status: 'LULUS',
    notes: 'Skala peta dan letak geografis Indonesia dikuasai dengan baik.'
  }
];

// Built-in Mock Learning Journal Meetings (SMA & SMP)
export const DEFAULT_JOURNAL_MEETINGS: LearningJournalMeeting[] = [
  // --- SMA Learning Journal Meetings ---
  {
    id: 'jm-sma-1',
    meetingNumber: 1,
    date: '2026-01-15',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'SMA-LABSCHOOL',
    subjectName: 'Pengetahuan Kuantitatif (PK)',
    subtestCode: 'PK',
    topicTitle: 'Strategi Bedah Soal Pola Bilangan, Barisan Deret & Aljabar Seleksi Labschool',
    subtopics: [
      'Pola Bilangan Bertingkat Dua & Fibonacci Khusus',
      'Manipulasi Aljabar Pecahan & Nilai Mutlak',
      'Trik Cepat 30 Detik Soal Persentase & Diskon Ganda'
    ],
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    instructorRole: 'Master Tutor Matematika Labschool',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 95,
    studentNotes: 'Memahami metode eliminasi cepat untuk barisan pecahan bertingkat. Sangat terbantu dengan rumus cepat 30 detik.',
    teacherEvaluation: 'Siswa sangat aktif bertanya, mampu menyelesaikan 18 dari 20 latihan soal tantangan dengan tepat waktu.',
    homeworkTask: 'Kerjakan Modul Bab 1 Halaman 14-18 (Soal No. 1 - 25)',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMA Labschool Kebayoran',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-sma',
    syllabusCode: 'SIL-LAB-SMA',
    syllabusTopicId: 'top-sma-1',
    competencyTarget: 'Siswa mampu menyelesaikan persoalan aritmetika, pola bilangan bertingkat, dan manipulasi aljabar pecahan dalam batas waktu < 45 detik per soal.',
    teachingMethod: 'Problem-Based Learning & Speed Drills',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PK-SMA-2026',
    driveLinkTitle: 'Modul Pengetahuan Kuantitatif & Pembahasan Soal HOTS Labschool'
  },
  {
    id: 'jm-sma-2',
    meetingNumber: 2,
    date: '2026-01-18',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'SMA-LABSCHOOL',
    subjectName: 'Kemampuan Verbal (KV)',
    subtestCode: 'KV',
    topicTitle: 'Teknik Skimming-Scanning Teks Panjang, Silogisme Logis & Analogi Semantik',
    subtopics: [
      'Penarikan Kesimpulan Modus Ponens, Tollens & Silogisme',
      'Identifikasi Ide Pokok & Makna Tersirat Paragraf Kompleks',
      'Pemetaan Hubungan Analogi Kata Asosiatif'
    ],
    instructorName: 'Ahmad Fauzi, S.Pd.',
    instructorRole: 'Tutor Senior Bahasa & Literasi',
    attendanceStatus: 'HADIR',
    comprehensionRating: 4,
    comprehensionPercentage: 88,
    studentNotes: 'Perlu lebih teliti pada silogisme yang mengandung kata "sebagian besar" dan "tidak semua".',
    teacherEvaluation: 'Pemahaman bacaan sangat baik. Tingkatkan latihan silogisme berbasis diagram venn untuk akurasi mutlak.',
    homeworkTask: 'Latihan Mandiri CBT Kuis KV Paket 2 di Portal Belajar',
    homeworkStatus: 'DIKUMPULKAN',
    targetCampus: 'SMA Labschool Kebayoran',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-sma',
    syllabusCode: 'SIL-LAB-SMA',
    syllabusTopicId: 'top-sma-2',
    competencyTarget: 'Menganalisis paragraf argumentatif kompleks, menarik kesimpulan silogisme valid, dan memetakan analogi kata asosiatif dengan akurasi 90%+.',
    teachingMethod: 'Analisis Diagram Logika & Flashcard Kosa Kata',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-KV-SMA-2026',
    driveLinkTitle: 'Modul Kemampuan Verbal, Silogisme & Analogi Semantik'
  },
  {
    id: 'jm-sma-3',
    meetingNumber: 3,
    date: '2026-01-22',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMA',
    studentId: 'u-sma-lab-2',
    studentName: 'Amanda Felicia Wardani',
    studentNis: '20261012',
    studentClass: 'SMA-LABSCHOOL',
    subjectName: 'Penalaran Matematika (PM)',
    subtestCode: 'PM',
    topicTitle: 'Geometri Analitik, Bangun Datar/Ruang & Peluang Kombinatorika',
    subtopics: [
      'Luas Daerah yang Diarsir & Teorema Phytagoras Lanjut',
      'Permutasi, Kombinasi & Peluang Bersyarat',
      'Statistika Data Tunggal & Rata-rata Gabungan'
    ],
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    instructorRole: 'Master Tutor Matematika Labschool',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 92,
    studentNotes: 'Sudah menguasai teknik menghitung luas tembereng lingkaran dan kombinasi pemilihan tim.',
    teacherEvaluation: 'Siswa memiliki penalaran spasial yang kokoh, daya tangkap rumus sangat cepat.',
    homeworkTask: 'Bedah 15 Soal Asli PSB Labschool Tahun Lalu (Bagian Geometri)',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMA Labschool Kebayoran',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-sma',
    syllabusCode: 'SIL-LAB-SMA',
    syllabusTopicId: 'top-sma-3',
    competencyTarget: 'Menguasai konsep luas bangun gabungan, peluang bersyarat, serta statistika data kontekstual standar soal HOTS Labschool.',
    teachingMethod: 'Konseptual Visual & Bedah Soal Asli PSB',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PM-SMA-2026',
    driveLinkTitle: 'Modul Geometri Analitik & Peluang Kombinatorika'
  },
  {
    id: 'jm-sma-4',
    meetingNumber: 4,
    date: '2026-01-27',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'SMA-LABSCHOOL',
    subjectName: 'Kemampuan Akademik (KA) - Saintek',
    subtestCode: 'KA',
    topicTitle: 'Fisika Terapan Mekanika, Kalor, Gelombang Bunyi & Cahaya',
    subtopics: [
      'Hukum Newton Gerak & Gesekan pada Bidang Miring',
      'Asas Black, Perpindahan Kalor & Perubahan Wujud',
      'Cepat Rambat Gelombang & Efek Doppler Sederhana'
    ],
    instructorName: 'Siti Nurhaliza, S.Si., M.Sc.',
    instructorRole: 'Tutor Spesialis Sains & Fisika',
    attendanceStatus: 'HADIR',
    comprehensionRating: 4,
    comprehensionPercentage: 85,
    studentNotes: 'Masih agak bingung pada penentuan tanda positif/negatif pada rumus Efek Doppler ketika pendengar menjauh.',
    teacherEvaluation: 'Konsep dasar hukum Newton mantap, perlu pendalaman pada latihan soal variasi Efek Doppler.',
    homeworkTask: 'Buat Mind Mapping Rumus Gelombang & 10 Soal Latihan',
    homeworkStatus: 'DIKUMPULKAN',
    targetCampus: 'SMA Labschool Kebayoran',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-sma',
    syllabusCode: 'SIL-LAB-SMA',
    syllabusTopicId: 'top-sma-4',
    competencyTarget: 'Memahami hukum mekanika klasik dan hukum termodinamika terapan serta menyelesaikan hitungan cepat sains IPA.',
    teachingMethod: 'Eksperimen Interaktif & Mind Mapping Rumus',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-KA-IPA-2026',
    driveLinkTitle: 'Modul Fisika Mekanika & Termodinamika Sains Labschool'
  },
  {
    id: 'jm-sma-5',
    meetingNumber: 5,
    date: '2026-02-01',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMA',
    studentId: 'u-sma-lab-4',
    studentName: 'Zahra Khairunnisa',
    studentNis: '20261014',
    studentClass: 'SMA-LABSCHOOL',
    subjectName: 'Skolastik & Logika (SK)',
    subtestCode: 'SK',
    topicTitle: 'Rotasi Spasial 3D, Pola Matriks Gambar & Logika Analitik Posisi',
    subtopics: [
      'Rotasi Sumbu XYZ pada Kubus Berpola',
      'Pola Matriks Gambar 3x3 Berubah Bentuk & Warna',
      'Urutan Duduk & Posisi Bersyarat (Analytical Reasoning)'
    ],
    instructorName: 'Sarah Maharani, S.Pd., M.Ed.',
    instructorRole: 'Tutor Penalaran Skolastik & Tes Bakat',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 96,
    studentNotes: 'Sangat seru, semua soal matriks gambar 3x3 berhasil dijawab benar dalam waktu kurang dari 30 detik!',
    teacherEvaluation: 'Istimewa! Refleks logika visual siswa berada di persentil 98% teratas.',
    homeworkTask: 'Drill Soal Spasial CBT Paket 4',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMA Labschool Kebayoran',
    progress: 'SEDANG',
    syllabusId: 'sil-lab-sma',
    syllabusCode: 'SIL-LAB-SMA',
    syllabusTopicId: 'top-sma-5',
    competencyTarget: 'Memvisualisasikan transformasi rotasi ruang 3D, membaca matriks gambar kognitif, dan mengorganisasi urutan posisi logis.',
    teachingMethod: 'Software Visualisasi Spasial & Latihan Terpandu',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-SK-Spasial-2026',
    driveLinkTitle: 'Modul Rotasi Spasial 3D & Logika Analitik Posisi'
  },
  {
    id: 'jm-sma-6',
    meetingNumber: 6,
    date: '2026-02-06',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMA',
    studentId: 'u-s1',
    studentName: 'Budi Santoso',
    studentNis: '20261001',
    studentClass: 'SMA-LABSCHOOL',
    subjectName: 'Simulasi & Evaluasi Akbar',
    subtestCode: 'SIM',
    topicTitle: 'Review Tryout Akbar 2 & Strategi Manajemen Waktu PSB Labschool',
    subtopics: [
      'Pembahasan Komprehensif Soal Paling Sering Salah Nasional',
      'Manajemen Alokasi Waktu 30 Detik per Soal Mudah, 60 Detik Sedang',
      'Strategi Memaksimalkan Skor di Kampus Labschool Pilihan'
    ],
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    instructorRole: 'Master Tutor Matematika Labschool',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 94,
    studentNotes: 'Mendapat tips penting: kerjakan soal kuantitatif yang berpola terlebih dahulu sebelum soal cerita panjang.',
    teacherEvaluation: 'Siswa siap tempur. Target skor passing grade 87.5 sudah terlampaui (hasil TO: 88.5). Jaga stamina dan fokus.',
    homeworkTask: 'Review Catatan Jurnal & Istirahat Teratur Jelang Hari-H',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMA Labschool Kebayoran',
    progress: 'BELUM',
    syllabusId: 'sil-lab-sma',
    syllabusCode: 'SIL-LAB-SMA',
    syllabusTopicId: 'top-sma-6',
    competencyTarget: 'Memantapkan ketahanan mental, strategi eliminasi opsi, dan efisiensi waktu pengerjaan CBT dengan target skor di atas passing grade 87.5+.',
    teachingMethod: 'Simulasi CAT Terwaktu & Bedah Kunci Jawaban',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Simulasi-Final-2026',
    driveLinkTitle: 'Paket Bedah Kunci Jawaban & Tryout Final PSB Labschool'
  },

  // --- SMP Learning Journal Meetings ---
  {
    id: 'jm-smp-1',
    meetingNumber: 1,
    date: '2026-01-16',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    subjectName: 'Pengetahuan Kuantitatif (PK) SMP',
    subtestCode: 'PK',
    topicTitle: 'Aritmatika Sosial, Pecahan, FPB-KPK & Pola Bilangan Masuk SMP Labschool',
    subtopics: [
      'Operasi Hitung Campuran Pecahan & Desimal Kilat',
      'Penyelesaian Soal Cerita FPB dan KPK Kontekstual',
      'Trik Cepat Persentase Untung-Rugi & Diskon Bertingkat'
    ],
    instructorName: 'Bambang Sudibyo, M.Si.',
    instructorRole: 'Master Tutor Matematika SMP Labschool',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 94,
    studentNotes: 'Sangat paham trik menyamakan penyebut pecahan cepat tanpa mencari KPK manual.',
    teacherEvaluation: 'Daya tangkap siswa sangat cepat, mampu menyelesaikan soal pecahan HOTS dengan benar.',
    homeworkTask: 'Latihan Mandiri Modul Matematika SMP Halaman 8-12',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMP Labschool Rawamangun',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-smp',
    syllabusCode: 'SIL-LAB-SMP',
    syllabusTopicId: 'top-smp-1',
    competencyTarget: 'Siswa menguasai perhitungan cepat operasi pecahan campuran dan pemecahan masalah soal cerita FPB/KPK konteks sehari-hari.',
    teachingMethod: 'Trik Hitung Cepat & Latihan Soal Cerita',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PK-SMP-2026',
    driveLinkTitle: 'Modul Aritmatika Sosial, Pecahan & FPB-KPK Masuk SMP Labschool'
  },
  {
    id: 'jm-smp-2',
    meetingNumber: 2,
    date: '2026-01-19',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    subjectName: 'Kemampuan Verbal (KV) SMP',
    subtestCode: 'KV',
    topicTitle: 'Sinonim, Antonim, Padanan Kata (Analogi) & Kalimat Baku PUEBI',
    subtopics: [
      'Pemetaan Hubungan Kata Sebab-Akibat, Bagian-Keseluruhan',
      'Kosakata Baku KBBI yang Sering Muncul di PSB Labschool',
      'Perbaikan Kalimat Rancu & Tanda Baca Efektif'
    ],
    instructorName: 'Dra. Endang Sulastri',
    instructorRole: 'Tutor Senior Bahasa Indonesia & Literasi SMP',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 92,
    studentNotes: 'Memahami cara menentukan kata kunci hubungan analogi kata agar tidak terkecoh pilihan menjebak.',
    teacherEvaluation: 'Perbendaharaan kata siswa sangat luas. Konsistensi latihan analogi kata sangat memuaskan.',
    homeworkTask: 'Kuis Verbal Mandiri Paket 2 di Aplikasi',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMP Labschool Rawamangun',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-smp',
    syllabusCode: 'SIL-LAB-SMP',
    syllabusTopicId: 'top-smp-2',
    competencyTarget: 'Memperluas perbendaharaan kata baku dan menentukan hubungan analogi kata bahasa Indonesia dengan tepat.',
    teachingMethod: 'Kuis Flashcard Kosakata & Game Analogi',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-KV-SMP-2026',
    driveLinkTitle: 'Modul Sinonim, Antonim & Analogi PUEBI Bahasa Indonesia SMP'
  },
  {
    id: 'jm-smp-3',
    meetingNumber: 3,
    date: '2026-01-23',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMP',
    studentId: 'u-smp-lab-1',
    studentName: 'Raditya Pratama Putra',
    studentNis: '20267001',
    studentClass: 'SMP-LABSCHOOL',
    subjectName: 'Penalaran Matematika (PM) SMP',
    subtestCode: 'PM',
    topicTitle: 'Geometri Bangun Datar, Sudut Garis Sejajar & Soal Cerita Logika',
    subtopics: [
      'Keliling dan Luas Daerah yang Diarsir Bangun Datar Gabungan',
      'Sifat Sudut Berseberangan & Sudut Sepihak',
      'Statistika Rata-rata Gabungan & Diagram Batang'
    ],
    instructorName: 'Bambang Sudibyo, M.Si.',
    instructorRole: 'Master Tutor Matematika SMP Labschool',
    attendanceStatus: 'HADIR',
    comprehensionRating: 4,
    comprehensionPercentage: 88,
    studentNotes: 'Perlu lebih teliti dalam membagi bangun tak beraturan menjadi beberapa bentuk dasar.',
    teacherEvaluation: 'Penalaran spasial sangat baik. Terus latih perhitungan luas tembereng lingkaran.',
    homeworkTask: 'Bedah 10 Soal Asli Geometri PSB SMP Labschool',
    homeworkStatus: 'DIKUMPULKAN',
    targetCampus: 'SMP Labschool Rawamangun',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-smp',
    syllabusCode: 'SIL-LAB-SMP',
    syllabusTopicId: 'top-smp-3',
    competencyTarget: 'Mampu menganalisis luas bangun datar gabungan tak beraturan dan menarik kesimpulan dari diagram statistika.',
    teachingMethod: 'Visualisasi Geometri & Diskusi Interaktif',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PM-SMP-2026',
    driveLinkTitle: 'Modul Geometri Bangun Datar & Soal Cerita Logika SMP'
  },
  {
    id: 'jm-smp-4',
    meetingNumber: 4,
    date: '2026-01-28',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    subjectName: 'Kemampuan Akademik (KA) - IPA Terpadu SMP',
    subtestCode: 'KA',
    topicTitle: 'Gaya, Gerak, Kalor, Perpindahan Energi & Ekosistem Hayati',
    subtopics: [
      'Gaya Gesek, Gaya Berat & Pengaruhnya pada Gerak Benda',
      'Perubahan Wujud Zat & Konsep Kalor Asas Black Sederhana',
      'Rantai Makanan, Simbiosis & Adaptasi Makhluk Hidup'
    ],
    instructorName: 'Arief Budiman, S.Pd.',
    instructorRole: 'Tutor Spesialis Sains & IPA SMP',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 95,
    studentNotes: 'Sangat menyukai pembahasan rantai makanan dan rumus perubahan suhu benda.',
    teacherEvaluation: 'Siswa menguasai konsep dasar IPA dengan sangat matang, skor latihan 100%.',
    homeworkTask: 'Mind Mapping Ekosistem & 15 Soal Latihan IPA',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMP Labschool Rawamangun',
    progress: 'SUDAH',
    syllabusId: 'sil-lab-smp',
    syllabusCode: 'SIL-LAB-SMP',
    syllabusTopicId: 'top-smp-4',
    competencyTarget: 'Menguasai konsep dasar sains fisika dan biologi lingkungan yang diujikan dalam tes akademik SMP Labschool.',
    teachingMethod: 'Eksperimen Virtual Sains & Mind Mapping',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-KA-IPA-SMP-2026',
    driveLinkTitle: 'Modul IPA Terpadu Sains, Ekosistem & Kalor SMP Labschool'
  },
  {
    id: 'jm-smp-5',
    meetingNumber: 5,
    date: '2026-02-02',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMP',
    studentId: 'u-smp-lab-4',
    studentName: 'Kayla Zahra Syarafina',
    studentNis: '20267004',
    studentClass: 'SMP-LABSCHOOL',
    subjectName: 'Kemampuan Akademik (KA) - IPS & Karakter SMP',
    subtestCode: 'KA',
    topicTitle: 'Peta Geografi Indonesia, Kegiatan Ekonomi & Profil Pelajar Pancasila',
    subtopics: [
      'Letak Geografis & Astronomis Indonesia serta Pengaruh Iklim',
      'Peran Produsen, Distributor, dan Konsumen dalam Perekonomian',
      'Penerapan Karakter Integritas, Gotong Royong & Anti Perundungan'
    ],
    instructorName: 'Dra. Endang Sulastri',
    instructorRole: 'Tutor Senior IPS & Karakter SMP',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 96,
    studentNotes: 'Memahami cara membaca garis bujur dan pembagian zona waktu WIB, WITA, WIT.',
    teacherEvaluation: 'Pemahaman konsep sosial dan integritas karakter siswa sangat tinggi dan konsisten.',
    homeworkTask: 'Review Catatan IPS Terpadu Bab 1-3',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMP Labschool Rawamangun',
    progress: 'SEDANG',
    syllabusId: 'sil-lab-smp',
    syllabusCode: 'SIL-LAB-SMP',
    syllabusTopicId: 'top-smp-5',
    competencyTarget: 'Memahami letak geografi Indonesia, dinamika ekonomi sosial, dan nilai karakter integritas seleksi Labschool.',
    teachingMethod: 'Studi Kasus & Diskusi Nilai Karakter',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-KA-IPS-SMP-2026',
    driveLinkTitle: 'Modul IPS Terpadu Geografi, Ekonomi & Karakter SMP'
  },
  {
    id: 'jm-smp-6',
    meetingNumber: 6,
    date: '2026-02-07',
    timeRange: '15:30 - 17:30',
    durationMinutes: 120,
    level: 'SMP',
    studentId: 'u-s2',
    studentName: 'Siti Aminah',
    studentNis: '20261002',
    studentClass: 'SMP-LABSCHOOL',
    subjectName: 'Skolastik & Logika Spasial (SK) SMP',
    subtestCode: 'SK',
    topicTitle: 'Jaring-jaring Ruang, Serial Gambar 2D/3D & Simulasi CBT Final',
    subtopics: [
      'Rotasi Bangun Pola Gambar 2D & Serial Matriks Gambar',
      'Pencocokan Jaring-jaring Balok dan Kubus Berpola',
      'Manajemen Waktu Pengerjaan Soal CBT 45 Detik per Soal'
    ],
    instructorName: 'Bambang Sudibyo, M.Si.',
    instructorRole: 'Master Tutor Matematika & Skolastik SMP',
    attendanceStatus: 'HADIR',
    comprehensionRating: 5,
    comprehensionPercentage: 95,
    studentNotes: 'Trik melipat jaring-jaring kubus di angan-angan sangat membantu menyelesaikan 10 soal hanya dalam 5 menit.',
    teacherEvaluation: 'Kesiapan siswa menghadapi PSB SMP Labschool sudah mencapai level optimal (95%+). Tetap percaya diri.',
    homeworkTask: 'Istirahat Cukup & Siap Menghadapi Seleksi PSB Labschool',
    homeworkStatus: 'SEMPURNA',
    targetCampus: 'SMP Labschool Rawamangun',
    progress: 'BELUM',
    syllabusId: 'sil-lab-smp',
    syllabusCode: 'SIL-LAB-SMP',
    syllabusTopicId: 'top-smp-6',
    competencyTarget: 'Memiliki kecepatan tinggi dalam visualisasi jaring-jaring kubus dan serial gambar logika figural.',
    teachingMethod: 'Simulasi CAT CBT & Refleksi Kesiapan Seleksi',
    driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-SK-SMP-2026',
    driveLinkTitle: 'Modul Jaring-jaring Ruang & Serial Gambar Logika SMP'
  }
];

// Helper to compute Syllabus vs Journal completion matrix & analytics
export interface SyllabusProgressReport {
  syllabusId: string;
  syllabusCode: string;
  syllabusTitle: string;
  level: 'SMP' | 'SMA';
  totalTopics: number;
  completedTopics: number;
  completionRate: number; // percentage (0 - 100)
  averageComprehension: number; // percentage (0 - 100)
  attendanceRate: number; // percentage
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  subtestBreakdown: {
    code: string;
    name: string;
    totalSyllabus: number;
    completedInJournal: number;
    accuracyOrComprehension: number;
    color: string;
  }[];
}

export function getLabschoolSyllabusProgress(
  level: 'SMP' | 'SMA',
  journals: LearningJournalMeeting[]
): SyllabusProgressReport {
  const isSMA = level === 'SMA';
  const syllabusId = isSMA ? 'sil-lab-sma' : 'sil-lab-smp';
  const syllabusCode = isSMA ? 'SIL-LAB-SMA' : 'SIL-LAB-SMP';
  const syllabusTitle = isSMA
    ? 'Silabus Kurikulum Intensif Seleksi Masuk SMA Labschool (5 Subtes)'
    : 'Silabus Kurikulum Akselerasi Seleksi Masuk SMP Labschool (5 Subtes)';

  const totalTopics = 6;
  const levelJournals = journals.filter(j => j.level === level);
  const completedTopics = levelJournals.filter(j => j.progress === 'SUDAH' || (!j.progress && j.attendanceStatus === 'HADIR')).length;
  const completionRate = Math.min(100, Math.round((completedTopics / totalTopics) * 100));

  const avgComp = completedTopics > 0
    ? Math.round(levelJournals.reduce((acc, curr) => acc + (curr.comprehensionPercentage || curr.comprehensionRating * 20), 0) / levelJournals.length)
    : 0;

  const attendedCount = levelJournals.filter(j => j.attendanceStatus === 'HADIR').length;
  const attendanceRate = levelJournals.length > 0 ? Math.round((attendedCount / levelJournals.length) * 100) : 0;

  const subtestCodes = [
    { code: 'PK', name: 'Pengetahuan Kuantitatif', color: 'amber' },
    { code: 'KV', name: 'Kemampuan Verbal', color: 'blue' },
    { code: 'PM', name: 'Penalaran Matematika', color: 'purple' },
    { code: 'KA', name: 'Kemampuan Akademik', color: 'emerald' },
    { code: 'SK', name: 'Survei Karakter', color: 'rose' },
    { code: 'SIM', name: 'Simulasi & Evaluasi', color: 'cyan' }
  ];

  const subtestBreakdown = subtestCodes.map(sub => {
    const matching = levelJournals.filter(j => j.subtestCode === sub.code);
    const completedMatching = matching.filter(j => j.progress === 'SUDAH' || (!j.progress && j.attendanceStatus === 'HADIR'));
    const subComp = matching.length > 0
      ? Math.round(matching.reduce((a, c) => a + (c.comprehensionPercentage || c.comprehensionRating * 20), 0) / matching.length)
      : 0;
    return {
      code: sub.code,
      name: sub.name,
      totalSyllabus: 1,
      completedInJournal: completedMatching.length,
      accuracyOrComprehension: subComp > 0 ? subComp : 90,
      color: sub.color
    };
  });

  return {
    syllabusId,
    syllabusCode,
    syllabusTitle,
    level,
    totalTopics,
    completedTopics,
    completionRate,
    averageComprehension: avgComp || 93,
    attendanceRate: attendanceRate || 100,
    status: completionRate >= 100 ? 'COMPLETED' : completionRate > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
    subtestBreakdown
  };
}

// Helper to load and save journals from LocalStorage
export function loadStoredJournals(): LearningJournalMeeting[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAB_JOURNAL);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every item has progress
        return parsed.map((item: any, index: number) => ({
          ...item,
          progress: item.progress || (item.attendanceStatus === 'HADIR' ? (index < parsed.length - 2 ? 'SUDAH' : index === parsed.length - 2 ? 'SEDANG' : 'BELUM') : 'BELUM')
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load journals from localStorage', e);
  }
  return DEFAULT_JOURNAL_MEETINGS;
}

export function saveStoredJournals(journals: LearningJournalMeeting[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LAB_JOURNAL, JSON.stringify(journals));
  } catch (e) {
    console.error('Failed to save journals to localStorage', e);
  }
}

// Helper to get detailed subtest sections breakdown (e.g. Verbal Bahasa Indonesia & Verbal Bahasa Inggris for KV)
export function getSubtestSectionsWithDefaults(
  sub: SubtestScoreDetail,
  level: 'SMP' | 'SMA' = 'SMA'
): SubtestSectionDetail[] {
  if (sub.sections && sub.sections.length > 0) {
    return sub.sections;
  }

  const baseAcc = sub.accuracy;
  const baseScore = sub.score;

  switch (sub.code) {
    case 'KV': {
      // 1. Verbal Bahasa Indonesia (13 Soal)
      const indCorrect = Math.min(13, Math.max(0, Math.round(13 * (baseAcc / 100))));
      const indAcc = +( (indCorrect / 13) * 100 ).toFixed(1);
      const indScore = +( Math.min(100, Math.max(40, baseScore + (indAcc >= baseAcc ? 1.5 : -1.5))) ).toFixed(1);

      // 2. Verbal Bahasa Inggris (12 Soal)
      const engCorrect = Math.min(12, Math.max(0, sub.correctCount - indCorrect));
      const engAcc = +( (engCorrect / 12) * 100 ).toFixed(1);
      const engScore = +( Math.min(100, Math.max(40, baseScore + (engAcc >= baseAcc ? 1.0 : -2.0))) ).toFixed(1);

      return [
        {
          id: `${sub.code}-ind`,
          codePart: 'KV-IND',
          name: 'Verbal Bahasa Indonesia',
          totalQuestions: 13,
          correctCount: indCorrect,
          wrongCount: 13 - indCorrect,
          accuracy: indAcc,
          score: indScore,
          status: indAcc >= 85 ? 'Sangat Tinggi' : indAcc >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Padanan Hubungan Kata (Analogi)', 'Sinonim & Antonim Dasar', 'Kalimat Efektif & PUEBI', 'Logika Kebahasaan Sederhana']
            : ['Analogi Hubungan Kata Asosiatif', 'Sinonim & Antonim Kontekstual', 'Koreksi Kalimat Efektif & Kebakuan', 'Silogisme Logika Bahasa'],
          recommendation: 'Perkuat perbendaharaan kata baku KBBI dan ketelitian hubungan kata antonim kontekstual.'
        },
        {
          id: `${sub.code}-eng`,
          codePart: 'KV-ENG',
          name: 'Verbal Bahasa Inggris',
          totalQuestions: 12,
          correctCount: engCorrect,
          wrongCount: 12 - engCorrect,
          accuracy: engAcc,
          score: engScore,
          status: engAcc >= 85 ? 'Sangat Tinggi' : engAcc >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Basic Vocabulary in Context', 'Grammar & Verb Tenses', 'Sentence Completion', 'Short Dialogue Comprehension']
            : ['English Structure & Grammar', 'Academic Vocabulary in Context', 'Sentence Completion HOTS', 'Idiomatic Expressions & Inferences'],
          recommendation: 'Latih kecepatan identifikasi tenses dan pemahaman kosakata sinonim bahasa Inggris.'
        }
      ];
    }

    case 'PK': {
      // 1. Aritmatika & Aljabar Dasar (10 Soal)
      const c1 = Math.min(10, Math.max(0, Math.round(10 * ((baseAcc + 4) / 100))));
      const acc1 = +( (c1 / 10) * 100 ).toFixed(1);
      // 2. Geometri & Pengukuran Spasial (8 Soal)
      const c2 = Math.min(8, Math.max(0, Math.round(8 * ((baseAcc - 2) / 100))));
      const acc2 = +( (c2 / 8) * 100 ).toFixed(1);
      // 3. Logika Kuantitatif & Deret (7 Soal)
      const c3 = Math.min(7, Math.max(0, sub.correctCount - c1 - c2));
      const acc3 = +( (c3 / 7) * 100 ).toFixed(1);

      return [
        {
          id: `${sub.code}-alj`,
          codePart: 'PK-ALJ',
          name: 'Aritmatika & Aljabar Dasar',
          totalQuestions: 10,
          correctCount: c1,
          wrongCount: 10 - c1,
          accuracy: acc1,
          score: Math.min(100, +(baseScore + 2.0).toFixed(1)),
          status: acc1 >= 85 ? 'Sangat Tinggi' : acc1 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Operasi Hitung Pecahan & Desimal', 'FPB & KPK Kontekstual', 'Aritmatika Sosial Dasar']
            : ['Aljabar Linier & Persamaan Kuadrat', 'Manipulasi Bentuk Pecahan Aljabar', 'Aritmatika Sosial & Persentase Ganda'],
          recommendation: 'Pertahankan metode cepat eliminasi dan substitusi persamaan aljabar.'
        },
        {
          id: `${sub.code}-geo`,
          codePart: 'PK-GEO',
          name: 'Geometri & Pengukuran Spasial',
          totalQuestions: 8,
          correctCount: c2,
          wrongCount: 8 - c2,
          accuracy: acc2,
          score: Math.min(100, +(baseScore - 1.5).toFixed(1)),
          status: acc2 >= 85 ? 'Sangat Tinggi' : acc2 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Keliling & Luas Bangun Datar', 'Sudut & Garis Sejajar', 'Volume Kubus & Balok']
            : ['Luas Daerah yang Diarsir', 'Teorema Phytagoras & Trigonometri Dasar', 'Geometri Analitik & Sudut Ruang'],
          recommendation: 'Perbanyak latihan soal geometri bidang tak beraturan yang diarsir.'
        },
        {
          id: `${sub.code}-log`,
          codePart: 'PK-LOG',
          name: 'Logika Kuantitatif & Deret Bilangan',
          totalQuestions: 7,
          correctCount: c3,
          wrongCount: 7 - c3,
          accuracy: acc3,
          score: Math.min(100, +(baseScore + 0.5).toFixed(1)),
          status: acc3 >= 85 ? 'Sangat Tinggi' : acc3 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Pola Barisan Bilangan', 'Perbandingan Senilai & Berbalik Nilai', 'Interpretasi Diagram Batang']
            : ['Barisan Aritmatika & Geometri Bertingkat', 'Pola Logika Angka dalam Gambar', 'Analisis Data Tabel & Grafik'],
          recommendation: 'Kuasai pola deret bertingkat dua dan rasio pecahan cepat.'
        }
      ];
    }

    case 'PM': {
      // 1. Literasi Wacana Bahasa Indonesia (11 Soal)
      const c1 = Math.min(11, Math.max(0, Math.round(11 * ((baseAcc + 2) / 100))));
      const acc1 = +( (c1 / 11) * 100 ).toFixed(1);
      // 2. Literasi Bahasa Inggris / Reading Comprehension (9 Soal)
      const c2 = Math.min(9, Math.max(0, sub.correctCount - c1));
      const acc2 = +( (c2 / 9) * 100 ).toFixed(1);

      return [
        {
          id: `${sub.code}-ind`,
          codePart: 'PM-IND',
          name: 'Literasi Wacana Bahasa Indonesia',
          totalQuestions: 11,
          correctCount: c1,
          wrongCount: 11 - c1,
          accuracy: acc1,
          score: Math.min(100, +(baseScore + 1.0).toFixed(1)),
          status: acc1 >= 85 ? 'Sangat Tinggi' : acc1 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Ide Pokok Cerita & Artikel', 'Menyimpulkan Isi Bacaan', 'Fakta vs Opini']
            : ['Gagasan Utama Paragraf Kompleks', 'Simpulan Inferensial & Asumsi Penulis', 'Struktur Retorika & Makna Tersirat'],
          recommendation: 'Gunakan skimming 30 detik untuk memetakan tema utama setiap paragraf.'
        },
        {
          id: `${sub.code}-eng`,
          codePart: 'PM-ENG',
          name: 'Literasi Teks Bahasa Inggris (Reading)',
          totalQuestions: 9,
          correctCount: c2,
          wrongCount: 9 - c2,
          accuracy: acc2,
          score: Math.min(100, +(baseScore - 1.0).toFixed(1)),
          status: acc2 >= 85 ? 'Sangat Tinggi' : acc2 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Main Idea of Short Passage', 'Detail Information Extraction', 'Context Vocabulary']
            : ['Main Ideas & Author Tone', 'Critical Reading & Inferences', 'Context Clues & Synthesis'],
          recommendation: 'Tingkatkan pengenalan kata transisi (however, therefore, consequently).'
        }
      ];
    }

    case 'KA': {
      // 1. Akademik IPA Terpadu (Saintek) (16 Soal)
      const c1 = Math.min(16, Math.max(0, Math.round(16 * ((baseAcc - 2) / 100))));
      const acc1 = +( (c1 / 16) * 100 ).toFixed(1);
      // 2. Akademik IPS Terpadu (Soshum) (14 Soal)
      const c2 = Math.min(14, Math.max(0, sub.correctCount - c1));
      const acc2 = +( (c2 / 14) * 100 ).toFixed(1);

      return [
        {
          id: `${sub.code}-ipa`,
          codePart: 'KA-IPA',
          name: 'Akademik IPA Terpadu (Saintek)',
          totalQuestions: 16,
          correctCount: c1,
          wrongCount: 16 - c1,
          accuracy: acc1,
          score: Math.min(100, +(baseScore - 1.0).toFixed(1)),
          status: acc1 >= 85 ? 'Sangat Tinggi' : acc1 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Gaya, Gerak & Energi Sederhana', 'Organ Tubuh & Ekosistem Hayati', 'Zat Aditif & Perubahan Materi']
            : ['Mekanika Gerak & Hukum Newton', 'Termodinamika, Kalor & Gelombang', 'Biologi Sel, Genetika & Ekosistem', 'Struktur Atom & Reaksi Kimia Dasar'],
          recommendation: 'Perbanyak drill soal sebab-akibat fenomena alam dan rumus kalor/kinematika.'
        },
        {
          id: `${sub.code}-ips`,
          codePart: 'KA-IPS',
          name: 'Akademik IPS Terpadu (Soshum)',
          totalQuestions: 14,
          correctCount: c2,
          wrongCount: 14 - c2,
          accuracy: acc2,
          score: Math.min(100, +(baseScore + 1.5).toFixed(1)),
          status: acc2 >= 85 ? 'Sangat Tinggi' : acc2 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Peta & Letak Astronomis Indonesia', 'Kegiatan Ekonomi Produsen-Konsumen', 'Peristiwa Sejarah Proklamasi']
            : ['Geografi Kebencanaan & Dinamika Litosfer', 'Ekonomi Mikro, Inflasi & Permintaan', 'Sejarah Pergerakan Nasional & Sosiologi'],
          recommendation: 'Kuasai konsep interaksi keruangan dan prinsip ekonomi dasar.'
        }
      ];
    }

    case 'SK': {
      // 1. Penalaran Figural & Spasial 3D (12 Soal)
      const c1 = Math.min(12, Math.max(0, Math.round(12 * ((baseAcc + 2) / 100))));
      const acc1 = +( (c1 / 12) * 100 ).toFixed(1);
      // 2. Survei Karakter & Profil Integritas (8 Soal)
      const c2 = Math.min(8, Math.max(0, sub.correctCount - c1));
      const acc2 = +( (c2 / 8) * 100 ).toFixed(1);

      return [
        {
          id: `${sub.code}-spa`,
          codePart: 'SK-SPA',
          name: 'Penalaran Figural & Logika Spasial 3D',
          totalQuestions: 12,
          correctCount: c1,
          wrongCount: 12 - c1,
          accuracy: acc1,
          score: Math.min(100, +(baseScore + 1.0).toFixed(1)),
          status: acc1 >= 85 ? 'Sangat Tinggi' : acc1 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Pola Gambar 2D & Serial Deret Gambar', 'Jaring-Jaring Kubus & Balok', 'Pencerminan & Simetri Lipat']
            : ['Rotasi Spasial Objek 3D Kompleks', 'Matriks Logika Gambar 3x3', 'Jaring Bangun Ruang Tak Beraturan'],
          recommendation: 'Latih kemampuan visualisasi perputaran sudut objek secara mental.'
        },
        {
          id: `${sub.code}-kar`,
          codePart: 'SK-KAR',
          name: 'Survei Karakter & Profil Integritas',
          totalQuestions: 8,
          correctCount: c2,
          wrongCount: 8 - c2,
          accuracy: acc2,
          score: Math.min(100, +(baseScore).toFixed(1)),
          status: acc2 >= 85 ? 'Sangat Tinggi' : acc2 >= 70 ? 'Tinggi' : 'Sedang',
          topics: level === 'SMP'
            ? ['Profil Pelajar Pancasila', 'Kejujuran & Tanggung Jawab', 'Gotong Royong & Empati Sosial']
            : ['Integritas Akademik & Anti-Kecurangan', 'Kemandirian & Ketangguhan Mental', 'Kepemimpinan & Etika Kolaboratif'],
          recommendation: 'Konsistensi jawaban pada butir integritas karakter sudah sangat baik.'
        }
      ];
    }

    default:
      return [];
  }
}

export function generateComprehensiveStudentTryoutResults(): StudentTryoutResult[] {
  const baseResults = [...DEFAULT_STUDENT_TRYOUT_RESULTS];
  const existingStudentIds = new Set(baseResults.map(r => r.studentId));

  // For any active student not explicitly listed, generate realistic tryout results across all tryouts of their level
  DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.forEach(student => {
    if (!existingStudentIds.has(student.id)) {
      const relevantTryouts = DEFAULT_LAB_TRYOUTS.filter(t => t.level === student.level);
      const totalTOs = relevantTryouts.length;
      
      relevantTryouts.forEach((toItem, index) => {
        // Score progression from earlier tryouts to latestScore
        const progressDiff = (totalTOs - 1 - index) * 2.2;
        const totalScore = Math.min(99.0, Math.max(65.0, +(student.latestScore - progressDiff).toFixed(1)));
        const rank = Math.max(1, Math.round((100 - totalScore) * 1.5 + (index === totalTOs - 1 ? 2 : 5)));
        const percentile = +(100 - (rank / toItem.totalParticipants) * 100).toFixed(1);

        // Realistic subtest scores
        const pkScore = Math.min(100, Math.max(60, +(totalScore + 1.2).toFixed(1)));
        const kvScore = Math.min(100, Math.max(60, +(totalScore - 0.8).toFixed(1)));
        const pmScore = Math.min(100, Math.max(60, +(totalScore + 0.6).toFixed(1)));
        const kaScore = Math.min(100, Math.max(60, +(totalScore - 1.4).toFixed(1)));
        const skScore = Math.min(100, Math.max(60, +(totalScore + 0.4).toFixed(1)));

        baseResults.push({
          id: `str-gen-${student.id}-${toItem.id}`,
          tryoutId: toItem.id,
          tryoutTitle: toItem.title,
          level: student.level,
          studentId: student.id,
          studentName: student.name,
          studentNis: student.nis,
          studentClass: student.className,
          studentAvatar: student.avatar,
          targetCampusId: student.targetCampusId,
          targetCampusName: student.targetCampusName,
          totalScore: totalScore,
          rank: rank,
          totalParticipants: toItem.totalParticipants,
          percentile: percentile,
          durationMinutes: student.level === 'SMA' ? 105 - index * 3 : 95 - index * 3,
          submittedAt: `${toItem.date} 14:00`,
          subtestScores: [
            { code: 'PK', name: 'Pengetahuan Kuantitatif', score: pkScore, maxScore: 100, correctCount: Math.round(25 * (pkScore / 100)), totalQuestions: 25, accuracy: pkScore, status: pkScore >= 85 ? 'Tinggi' : pkScore >= 75 ? 'Sedang' : 'Perlu Perhatian', color: '#f59e0b' },
            { code: 'KV', name: 'Kemampuan Verbal', score: kvScore, maxScore: 100, correctCount: Math.round(25 * (kvScore / 100)), totalQuestions: 25, accuracy: kvScore, status: kvScore >= 85 ? 'Tinggi' : kvScore >= 75 ? 'Sedang' : 'Perlu Perhatian', color: '#3b82f6' },
            { code: 'PM', name: 'Penalaran Matematika', score: pmScore, maxScore: 100, correctCount: Math.round(20 * (pmScore / 100)), totalQuestions: 20, accuracy: pmScore, status: pmScore >= 85 ? 'Tinggi' : pmScore >= 75 ? 'Sedang' : 'Perlu Perhatian', color: '#10b981' },
            { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: kaScore, maxScore: 100, correctCount: Math.round(30 * (kaScore / 100)), totalQuestions: 30, accuracy: kaScore, status: kaScore >= 85 ? 'Tinggi' : kaScore >= 75 ? 'Sedang' : 'Perlu Perhatian', color: '#8b5cf6' },
            { code: 'SK', name: 'Survei Karakter', score: skScore, maxScore: 100, correctCount: Math.round(20 * (skScore / 100)), totalQuestions: 20, accuracy: skScore, status: skScore >= 85 ? 'Tinggi' : skScore >= 75 ? 'Sedang' : 'Perlu Perhatian', color: '#ec4899' }
          ],
          recommendationNotes: `Performa ${student.name} pada ${toItem.title} menunjukkan hasil ${totalScore >= 88 ? 'sangat memuaskan dan berpeluang tinggi lolos di target ' + student.targetCampusName : 'kompetitif, pertahankan ritme belajar intensif pada subtes Kemampuan Akademik'}.`,
          strengths: student.level === 'SMA' ? ['Aljabar & Penalaran Kuantitatif', 'Logika Spasial 3D', 'Reading Comprehension'] : ['Aritmatika Sosial & Pecahan', 'Analogi Verbal', 'Jaring Bangun Ruang'],
          weaknesses: student.level === 'SMA' ? ['Fisika Terapan Termodinamika', 'Analogi Padanan Kata Kompleks'] : ['Soal Cerita Bangun Gabungan', 'Istilah Sains Kontekstual']
        });
      });
    }
  });

  return baseResults;
}

// Helper to load and save Tryout Results
export function loadStoredTryoutResults(): StudentTryoutResult[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAB_TRYOUT_RESULTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: StudentTryoutResult) => ({
          ...item,
          subtestScores: item.subtestScores.map(sub => ({
            ...sub,
            name: sub.code === 'SK' ? 'Survei Karakter' : sub.name,
            sections: getSubtestSectionsWithDefaults(sub, item.level)
          }))
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load tryout results from localStorage', e);
  }
  return generateComprehensiveStudentTryoutResults().map(item => ({
    ...item,
    subtestScores: item.subtestScores.map(sub => ({
      ...sub,
      name: sub.code === 'SK' ? 'Survei Karakter' : sub.name,
      sections: getSubtestSectionsWithDefaults(sub, item.level)
    }))
  }));
}

export function saveStoredTryoutResults(results: StudentTryoutResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LAB_TRYOUT_RESULTS, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save tryout results to localStorage', e);
  }
}

// Helper to calculate Campus Comparison for a given score & level
export interface CampusComparisonResult {
  campus: LabschoolCampusItem;
  targetPassingGrade: number;
  studentScore: number;
  margin: number; // studentScore - targetPassingGrade
  chanceStatus: 'SANGAT_BERPELUANG' | 'KOMPETITIF' | 'PERLU_PENINGKATAN';
  chanceLabel: string;
  chanceColor: string;
  chanceBadgeBg: string;
  chancePercentage: number;
}

export function calculateCampusComparisons(
  score: number,
  level: 'SMP' | 'SMA',
  campuses: LabschoolCampusItem[] = DEFAULT_LABSCHOOL_CAMPUSES
): CampusComparisonResult[] {
  return campuses.map(c => {
    const passingGrade = level === 'SMP' ? c.passingGradeSmp : c.passingGradeSma;
    const margin = +(score - passingGrade).toFixed(1);

    let chanceStatus: 'SANGAT_BERPELUANG' | 'KOMPETITIF' | 'PERLU_PENINGKATAN' = 'KOMPETITIF';
    let chanceLabel = 'Peluang Terbuka (Zona Kompetitif)';
    let chanceColor = 'text-amber-400';
    let chanceBadgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    let chancePercentage = 75;

    if (margin >= 1.5) {
      chanceStatus = 'SANGAT_BERPELUANG';
      chanceLabel = 'Sangat Berpeluang (Lolos Kuota Unggulan)';
      chanceColor = 'text-emerald-400';
      chanceBadgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      chancePercentage = Math.min(99, Math.round(85 + margin * 3));
    } else if (margin >= -1.0) {
      chanceStatus = 'KOMPETITIF';
      chanceLabel = 'Peluang Terbuka (Zona Kompetitif)';
      chanceColor = 'text-blue-400';
      chanceBadgeBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      chancePercentage = Math.max(60, Math.round(75 + margin * 5));
    } else {
      chanceStatus = 'PERLU_PENINGKATAN';
      chanceLabel = `Perlu Peningkatan Skor (Gap: ${margin} poin)`;
      chanceColor = 'text-rose-400';
      chanceBadgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      chancePercentage = Math.max(30, Math.round(50 + margin * 4));
    }

    return {
      campus: c,
      targetPassingGrade: passingGrade,
      studentScore: score,
      margin,
      chanceStatus,
      chanceLabel,
      chanceColor,
      chanceBadgeBg,
      chancePercentage
    };
  });
}

// Generate Intelligent WhatsApp Messages based on Role & Context
export interface GenerateWaMessageOptions {
  senderRole: WaSenderRole;
  receiverRole: WaReceiverRole;
  studentName?: string;
  studentNis?: string;
  studentClass?: string;
  targetCampus?: string;
  meeting: LearningJournalMeeting;
  latestTryoutScore?: number;
  latestQuizScore?: number;
  customNote?: string;
  parentName?: string;
}

export function generateWaMessage(opts: GenerateWaMessageOptions): string {
  const {
    senderRole,
    receiverRole,
    studentName = 'Bintang Pratama',
    studentNis = 'LAB-2026-089',
    studentClass = 'Kelas 9 SMP (Persiapan SMA Labschool)',
    targetCampus = 'SMA Labschool Kebayoran',
    meeting,
    latestTryoutScore = 88.5,
    latestQuizScore = 92.0,
    customNote,
    parentName = 'Bapak/Ibu Orang Tua Siswa'
  } = opts;

  const stars = '⭐'.repeat(Math.max(1, Math.min(5, meeting.comprehensionRating)));
  const progressLabel = meeting.progress === 'SUDAH' 
    ? 'Sudah Selesai ✅' 
    : meeting.progress === 'SEDANG' 
    ? 'Sedang Berjalan 🔄' 
    : 'Belum Dimulai ⏳';

  const driveLinkSection = meeting.driveLink
    ? `\n📂 *Modul & Bank Soal (Google Drive):*\n${meeting.driveLinkTitle ? `${meeting.driveLinkTitle}\n` : ''}${meeting.driveLink}\n`
    : '';

  // 1. GURU / ADMIN -> WALI MURID
  if (senderRole === 'GURU' && receiverRole === 'WALI_MURID') {
    return `*LAPORAN PERKEMBANGAN BELAJAR SISWA - PSB LABSCHOOL 2026*
_Bimbel & Program Intensif Seleksi Masuk Labschool_

Yth. *${parentName}*,
Wali dari ananda *${studentName}* (${studentClass} / NIS: ${studentNis})

Berikut kami sampaikan laporan pelaksanaan sesi pembelajaran ananda:

📚 *Rincian Jurnal Pertemuan:*
• *Sesi Pertemuan:* Pertemuan #${meeting.meetingNumber} (${meeting.level} Labschool)
• *Mata Pelajaran / Subtes:* ${meeting.subjectName}
• *Topik Bahasan:* ${meeting.topicTitle}
• *Status Progres Materi:* *${progressLabel}*
• *Waktu & Tanggal:* ${meeting.date} (${meeting.timeRange})
• *Kehadiran:* ${meeting.attendanceStatus}
• *Tingkat Pemahaman:* ${stars} (${meeting.comprehensionPercentage}%)
• *Guru / Pemateri:* ${meeting.instructorName}

🎯 *Target Silabus & Kompetensi:*
${meeting.competencyTarget || 'Menguasai konsep dasar materi dan strategi eliminasi cepat seleksi Labschool.'}

📝 *Catatan & Evaluasi Guru:*
"${customNote || meeting.teacherEvaluation || 'Ananda aktif berpartisipasi dan memahami materi dengan sangat baik.'}"

📌 *Tugas Mandiri (PR):*
${meeting.homeworkTask || 'Review catatan jurnal belajar dan kerjakan modul latihan'}${driveLinkSection}
📊 *Update Hasil Ujian & Target:*
• *Skor Tryout Terakhir:* *${latestTryoutScore} / 100*
• *Skor Rata-rata Kuis:* *${latestQuizScore} / 100*
• *Target Sekolah Pilihan:* *${meeting.targetCampus || targetCampus}*

Terima kasih atas kerjasama dan dukungan Bapak/Ibu dalam mendampingi ananda.

Salam Hormat,
*${meeting.instructorName}*
_Tim Akademik Bimbel Seleksi Labschool_`;
  }

  // 2. GURU -> SISWA
  if (senderRole === 'GURU' && receiverRole === 'SISWA') {
    return `*EVALUASI BELAJAR & TARGET PSB LABSCHOOL 2026*
Halo, *${studentName}*! 🔥 Tetap semangat menuju *${meeting.targetCampus || targetCampus}*!

Berikut rekap sesi belajarmu hari ini:
• *Sesi Pertemuan:* Pertemuan #${meeting.meetingNumber} - ${meeting.subjectName}
• *Topik:* ${meeting.topicTitle}
• *Status Progres:* *${progressLabel}*
• *Tingkat Pemahaman:* ${stars} (${meeting.comprehensionPercentage}%)

💡 *Sub-Materi yang Dipelajari:*
${meeting.subtopics.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

📝 *Catatan Guru:*
${customNote || meeting.teacherEvaluation || 'Pertahankan fokus dan ketelitian dalam latihan soal berbatas waktu!'}

📌 *Tugas Latihan Mandiri (PR):*
${meeting.homeworkTask || 'Review modul dan kerjakan latihan soal'}${driveLinkSection}
Jika ada soal yang masih bingung, segera tanyakan ke guru ya! Kamu pasti bisa lolos seleksi Labschool! 🚀`;
  }

  // 3. SISWA -> GURU
  if (senderRole === 'SISWA' && receiverRole === 'GURU') {
    return `*KONSULTASI MATERI BELAJAR PSB LABSCHOOL 2026*

Assalamu'alaikum / Selamat Pagi/Siang *${meeting.instructorName}*,

Saya *${studentName}* (Kelas ${studentClass}, NIS: ${studentNis}).
Target Kampus Labschool Pilihan saya: *${meeting.targetCampus || targetCampus}*.

Izin bertanya dan berkonsultasi mengenai materi pada Pertemuan #${meeting.meetingNumber}:
📌 *Topik Materi:* ${meeting.topicTitle} (${meeting.subjectName})
📌 *Status Progres Belajar:* ${progressLabel}

❓ *Kendala / Pertanyaan yang Ingin Dikonsultasikan:*
${customNote || meeting.studentNotes || 'Saya ingin memperdalam strategi penyelesaian cepat untuk variasi soal HOTS pada materi ini.'}

Apakah ada waktu luang untuk sesi tanya jawab singkat atau pembahasan klinik soal?

Terima kasih banyak atas bimbingan Bapak/Ibu Guru. 🙏`;
  }

  // 4. WALI MURID -> GURU
  return `*KONSULTASI PERKEMBANGAN SISWA - PERSIAPAN PSB LABSCHOOL*

Selamat Pagi/Siang *${meeting.instructorName}*,

Saya ${parentName}, orang tua dari ananda *${studentName}* (Kelas ${studentClass}).
Target kampus ananda: *${meeting.targetCampus || targetCampus}*.

Melalui pesan ini, saya ingin menanyakan mengenai progres ananda pada Pertemuan #${meeting.meetingNumber} (*${meeting.topicTitle}*):
• *Status Progres Materi:* ${progressLabel}
• *Pemahaman Siswa:* ${stars} (${meeting.comprehensionPercentage}%)

💬 *Hal yang Ingin Dikonsultasikan:*
${customNote || `Berdasarkan hasil pembelajaran dan nilai tryout (${latestTryoutScore}), bagaimana pandangan Bapak/Ibu mengenai kesiapan ananda menuju seleksi di ${meeting.targetCampus || targetCampus}?`}

Mohon arahan dan masukan dari Bapak/Ibu Guru. Terima kasih banyak atas bimbingan dan dedikasi Bapak/Ibu. 🙏`;
}

export function generateWhatsAppMessage(ctx: WaTemplateContext): {
  message: string;
  encodedUrl: string;
  summaryTitle: string;
} {
  const {
    senderRole,
    receiverRole,
    studentName,
    studentNis,
    studentClass,
    targetCampus,
    latestTryoutScore,
    latestQuizScore,
    latestMeetingNumber,
    latestTopic,
    comprehensionRating,
    teacherName,
    parentName = 'Bapak/Ibu Orang Tua Siswa',
    customConsultationTopic,
    customNotes,
    receiverPhone = ''
  } = ctx;

  let msg = '';
  let summaryTitle = '';

  const cleanPhone = receiverPhone.replace(/\D/g, '').replace(/^0/, '62');

  // Case 1: ADMIN or GURU sending Report to WALI MURID (Orang Tua)
  if ((senderRole === 'ADMIN' || senderRole === 'GURU') && receiverRole === 'WALI_MURID') {
    summaryTitle = 'Laporan Progres Belajar Resmi ke Wali Murid';
    const stars = '⭐'.repeat(Math.max(1, Math.min(5, comprehensionRating)));
    
    msg = `*LAPORAN PERKEMBANGAN BELAJAR SISWA - PERSIAPAN PSB LABSCHOOL 2026*
Bimbel & Program Intensif Masuk Labschool

Yth. *${parentName}*,
Wali dari ananda *${studentName}* (${studentClass} / NIS: ${studentNis})

Berikut kami sampaikan ringkasan progres & jurnal belajar ananda per sesi terkini:

📚 *Jurnal Sesi Pertemuan:*
• *Pertemuan Ke:* Sesi #${latestMeetingNumber}
• *Topik Bahasan:* ${latestTopic}
• *Guru Pengampu:* ${teacherName}
• *Tingkat Pemahaman:* ${stars} (${comprehensionRating * 20}%)

📊 *Hasil Evaluasi & Uji Kemampuan:*
• *Skor Tryout Akbar:* *${latestTryoutScore} / 100*
• *Skor Rata-rata Kuis:* *${latestQuizScore} / 100*
• *Target Sekolah Pilihan:* *${targetCampus}*
• *Status Prediksi Peluang:* _${latestTryoutScore >= 85 ? 'Sangat Berpeluang & Lolos Passing Grade' : 'Dalam Jalur Kompetitif Positif'}_

📝 *Catatan & Rekomendasi Guru:*
"${customNotes || 'Ananda menunjukkan keaktifan dan daya tangkap materi yang sangat baik. Mohon dukungan di rumah untuk istirahat cukup dan mengulang latihan soal variasi HOTS.'}"

Terima kasih atas kerjasama dan kepercayaan Bapak/Ibu mendampingi ananda menuju Labschool Impian.

Salam Hormat,
*${teacherName}*
_Tim Akademik & Bimbingan PSB Labschool_`;
  }
  
  // Case 2: ADMIN or GURU sending Report to SISWA
  else if ((senderRole === 'ADMIN' || senderRole === 'GURU') && receiverRole === 'SISWA') {
    summaryTitle = 'Laporan Rekap Belajar & Motivasi ke Siswa';
    const stars = '⭐'.repeat(Math.max(1, Math.min(5, comprehensionRating)));

    msg = `*EVALUASI BELAJAR & TARGET PSB LABSCHOOL 2026*
Halo, *${studentName}*! 🔥

Tetap semangat ya! Berikut evaluasi perkembangan belajarmu:
• *Sesi Terakhir:* Pertemuan #${latestMeetingNumber} - ${latestTopic}
• *Pemahaman Materi:* ${stars} (${comprehensionRating * 20}%)
• *Skor Tryout Terakhir:* *${latestTryoutScore}* (Target: ${targetCampus})
• *Skor Kuis:* *${latestQuizScore}*

💡 *Fokus Latihan Mandiri:*
${customNotes || 'Pertahankan ketelitian pada soal kuantitatif HOTS dan optimalkan kecepatan membaca silogisme. Kamu sudah berada di jalur juara!'}

Jika ada soal yang masih membingungkan, silakan hubungi Guru/Mentor untuk konsultasi klinik soal ya!`;
  }

  // Case 3: SISWA sending Consultation to GURU / MENTOR (Konsultasi Materi Belajar)
  else if (senderRole === 'SISWA') {
    summaryTitle = 'Pesan Konsultasi Materi Belajar dari Siswa ke Guru';
    const topicToConsult = customConsultationTopic || latestTopic || 'Pengetahuan Kuantitatif & Aljabar Seleksi Labschool';

    msg = `*KONSULTASI MATERI BELAJAR PSB LABSCHOOL 2026*

Assalamu'alaikum / Selamat Pagi/Siang *${teacherName}*,

Saya *${studentName}* (Siswa Kelas ${studentClass}, NIS: ${studentNis}).
Target Kampus Labschool Pilihan saya: *${targetCampus}*.

Izin bertanya dan berkonsultasi mengenai materi pembelajaran:
📌 *Topik Materi yang Ingin Dikonsultasikan:*
_${topicToConsult}_

❓ *Kendala / Pertanyaan Spesifik:*
${customNotes || 'Saya masih mengalami kesulitan dalam menentukan langkah tercepat pada variasi soal cerita perbandingan berbalik nilai dan manipulasi aljabar bertingkat.'}

Apakah ada waktu luang untuk sesi penjelasan singkat / klinik soal via WA atau saat jadwal bimbingan berikutnya?

Terima kasih banyak atas bimbingan dan waktu Bapak/Ibu Guru. 🙏`;
  }

  // Case 4: WALI MURID sending Consultation to GURU / WALI KELAS (Konsultasi Perkembangan & Progres)
  else {
    summaryTitle = 'Pesan Konsultasi Wali Murid ke Guru tentang Progres Siswa';

    msg = `*KONSULTASI PERKEMBANGAN SISWA - PERSIAPAN PSB LABSCHOOL*

Selamat Pagi/Siang *${teacherName}*,

Saya *${parentName}*, orang tua dari ananda *${studentName}* (Kelas ${studentClass}).
Tujuan kampus yang dituju ananda: *${targetCampus}*.

Melalui pesan ini, saya ingin berkonsultasi mengenai perkembangan belajar dan kesiapan ananda menghadapi Seleksi PSB Labschool 2026:

💬 *Hal yang Ingin Dikonsultasikan:*
${customNotes || `Berdasarkan hasil Tryout terakhir ananda (${latestTryoutScore}) dan kuis (${latestQuizScore}), bagaimana pandangan Bapak/Ibu mengenai peluang ananda masuk ke ${targetCampus}? Serta apa saja yang perlu kami optimalkan dalam mendampingi ananda belajar di rumah?`}

Mohon arahan dan masukan dari Bapak/Ibu Guru untuk kebaikan ananda. Terima kasih banyak atas bimbingan dan dedikasi Bapak/Ibu. 🙏`;
  }

  const encodedUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

  return {
    message: msg,
    encodedUrl,
    summaryTitle
  };
}

// Compute 14-Column Multi-Tryout Analysis Row
export function computeTryoutMultiColumnRow(
  item: StudentTryoutResult,
  targetPassingGrade?: number
): TryoutMultiColumnAnalysisRow {
  const pkSub = item.subtestScores.find(s => s.code === 'PK');
  const kvSub = item.subtestScores.find(s => s.code === 'KV');
  const pmSub = item.subtestScores.find(s => s.code === 'PM');
  const kaSub = item.subtestScores.find(s => s.code === 'KA');
  const skSub = item.subtestScores.find(s => s.code === 'SK');

  const kvSections = kvSub ? getSubtestSectionsWithDefaults(kvSub, item.level) : [];
  const pmSections = pmSub ? getSubtestSectionsWithDefaults(pmSub, item.level) : [];
  const kaSections = kaSub ? getSubtestSectionsWithDefaults(kaSub, item.level) : [];

  // KV: V.Bindo (Kolom 3) & V.Bing (Kolom 4) & Total/Avg (Kolom 5)
  const kvInd = kvSections.find(s => s.codePart === 'KV-IND' || s.id.includes('ind'))?.score ?? (kvSub ? +(kvSub.score + 1.2).toFixed(1) : 0);
  const kvEng = kvSections.find(s => s.codePart === 'KV-ENG' || s.id.includes('eng'))?.score ?? (kvSub ? +(kvSub.score - 1.2).toFixed(1) : 0);
  const kvAvg = +( ((kvInd + kvEng) / 2) ).toFixed(1);

  // PM: B.Indo (Kolom 6) & B.Ing (Kolom 7) & Total/Avg (Kolom 8)
  const pmInd = pmSections.find(s => s.codePart === 'PM-IND' || s.id.includes('ind'))?.score ?? (pmSub ? +(pmSub.score + 0.8).toFixed(1) : 0);
  const pmEng = pmSections.find(s => s.codePart === 'PM-ENG' || s.id.includes('eng'))?.score ?? (pmSub ? +(pmSub.score - 0.8).toFixed(1) : 0);
  const pmAvg = +( ((pmInd + pmEng) / 2) ).toFixed(1);

  // KA: IPA (Kolom 9) & IPS (Kolom 10) & Total/Avg (Kolom 11)
  const kaIpa = kaSections.find(s => s.codePart === 'KA-IPA' || s.id.includes('ipa'))?.score ?? (kaSub ? +(kaSub.score - 1.0).toFixed(1) : 0);
  const kaIps = kaSections.find(s => s.codePart === 'KA-IPS' || s.id.includes('ips'))?.score ?? (kaSub ? +(kaSub.score + 1.0).toFixed(1) : 0);
  const kaAvg = +( ((kaIpa + kaIps) / 2) ).toFixed(1);

  // Passing grade determination
  let pg = targetPassingGrade;
  if (!pg) {
    const campus = DEFAULT_LABSCHOOL_CAMPUSES.find(c => c.id === item.targetCampusId);
    pg = campus ? (item.level === 'SMP' ? campus.passingGradeSmp : campus.passingGradeSma) : 85.0;
  }

  const skorAkhir = item.totalScore;
  const isLulus = skorAkhir >= pg;
  const selisihPg = +(skorAkhir - pg).toFixed(1);

  return {
    id: item.id,
    tryoutId: item.tryoutId,
    tryoutTitle: item.tryoutTitle,
    submittedAt: item.submittedAt,
    studentName: item.studentName,
    studentNis: item.studentNis,
    level: item.level,
    targetCampusId: item.targetCampusId,
    targetCampusName: item.targetCampusName,
    targetPassingGrade: pg,

    // Kolom 2: PK
    nilaiPK: pkSub ? pkSub.score : 0,
    pkCorrect: pkSub ? pkSub.correctCount : 0,
    pkTotal: pkSub ? pkSub.totalQuestions : 25,

    // Kolom 3 - 5: KV
    kvIndo: kvInd,
    kvInggris: kvEng,
    kvTotalAvg: kvAvg,

    // Kolom 6 - 8: PM
    pmIndo: pmInd,
    pmInggris: pmEng,
    pmTotalAvg: pmAvg,

    // Kolom 9 - 11: KA
    kaIpa: kaIpa,
    kaIps: kaIps,
    kaTotalAvg: kaAvg,

    // Kolom 12: SK
    nilaiSK: skSub ? skSub.score : 0,
    skCorrect: skSub ? skSub.correctCount : 0,
    skTotal: skSub ? skSub.totalQuestions : 20,

    // Kolom 13: SKOR AKHIR
    skorAkhir: skorAkhir,

    // Kolom 14: Status Lulus / Tidak
    isLulus,
    statusLulusLabel: isLulus ? 'LULUS' : 'TIDAK LULUS',
    selisihPg,
    rank: item.rank,
    totalParticipants: item.totalParticipants
  };
}

export function loadStoredTryouts(): LabschoolTryoutItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAB_TRYOUTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load tryouts from storage', e);
  }
  return DEFAULT_LAB_TRYOUTS;
}

export const STORAGE_KEY_LAB_QUIZ_LEADERBOARD = 'labschool_quiz_leaderboard_v2';

export function loadStoredQuizHistory(): QuizHistoryDetail[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAB_QUIZ_HISTORY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load quiz history from storage', e);
  }
  return DEFAULT_QUIZ_HISTORY;
}

export function saveStoredQuizHistory(history: QuizHistoryDetail[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LAB_QUIZ_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save quiz history to storage', e);
  }
}

export function loadStoredQuizLeaderboard(): QuizLeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAB_QUIZ_LEADERBOARD);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load quiz leaderboard from storage', e);
  }
  return DEFAULT_QUIZ_LEADERBOARD;
}

export function saveStoredQuizLeaderboard(leaderboard: QuizLeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LAB_QUIZ_LEADERBOARD, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Failed to save quiz leaderboard to storage', e);
  }
}


