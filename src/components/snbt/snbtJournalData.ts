import { SnbtSubtestCode, SnbtSubtestCategory, SnbtModuleDifficulty, SnbtSyllabusModule, INITIAL_SNBT_SYLLABUS_MODULES, SNBT_7_SUBTEST_METAS } from './snbtSyllabusData';
import { SnbtStudentProfile } from './snbtData';

export type SnbtLearningActivityType =
  | 'PEMBAHASAN_MODUL'
  | 'DRILL_SOAL'
  | 'KONSULTASI_GURU'
  | 'BELAJAR_MANDIRI'
  | 'SIMULASI_CBT'
  | 'REMEDIAL_IRT';

export type SnbtComprehensionLevel = 'SANGAT_PAHAM' | 'PAHAM' | 'CUKUP' | 'BUTUH_REMEDIAL';

export type SnbtAttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'MANDIRI';

export type SnbtHomeworkStatus = 'SEMPURNA' | 'SELESAI' | 'SEBAGIAN' | 'BELUM';

export interface SnbtLearningJournalEntry {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  date: string; // YYYY-MM-DD
  meetingNumber: number;
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  durationMinutes: number;
  subtestCode: SnbtSubtestCode;
  subtestName: string;
  category: SnbtSubtestCategory;
  syllabusCode: string;
  syllabusTitle: string;
  moduleId?: string;
  moduleCode?: string;
  moduleTitle?: string;
  moduleDifficulty?: SnbtModuleDifficulty;
  subtopicsCovered: string[];
  learningActivityType: SnbtLearningActivityType;
  instructorName: string;
  attendanceStatus: SnbtAttendanceStatus;
  comprehensionLevel: SnbtComprehensionLevel;
  comprehensionPercentage: number; // 0 - 100
  practiceQuestionsCount: number;
  practiceQuestionsCorrect: number;
  practiceAccuracy: number; // 0 - 100
  homeworkStatus: SnbtHomeworkStatus;
  studentReflectionNotes: string;
  tutorFeedback: string;
  targetIrtImpact: string;
  linkedMaterialUrl?: string;
  linkedMaterialTitle?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SNBT_ACTIVITY_TYPE_METAS: Record<SnbtLearningActivityType, { label: string; badgeColor: string; icon: string }> = {
  PEMBAHASAN_MODUL: {
    label: 'Pembahasan Modul Teori',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    icon: 'BookOpen'
  },
  DRILL_SOAL: {
    label: 'Drill Soal HOTS Berwaktu',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: 'Zap'
  },
  KONSULTASI_GURU: {
    label: 'Sesi Konsultasi & Bedah Soal',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: 'Users'
  },
  BELAJAR_MANDIRI: {
    label: 'Belajar Mandiri Terpandu',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: 'UserCheck'
  },
  SIMULASI_CBT: {
    label: 'Simulasi Tryout CBT Subtes',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: 'Activity'
  },
  REMEDIAL_IRT: {
    label: 'Remedial Penguatan IRT',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: 'Flame'
  }
};

export const SNBT_COMPREHENSION_METAS: Record<SnbtComprehensionLevel, { label: string; badgeColor: string; minPercent: number }> = {
  SANGAT_PAHAM: {
    label: 'Sangat Paham (Mastery)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    minPercent: 90
  },
  PAHAM: {
    label: 'Paham Konsep',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    minPercent: 75
  },
  CUKUP: {
    label: 'Cukup (Perlu Review)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    minPercent: 60
  },
  BUTUH_REMEDIAL: {
    label: 'Butuh Remedial & Latihan Khusus',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    minPercent: 0
  }
};

// Initial Seed Data for SNBT Learning Journals
export const INITIAL_SNBT_JOURNALS: SnbtLearningJournalEntry[] = [
  // Student 1: Muhammad Farhan Al-Fatih (snbt-std-01)
  {
    id: 'jrn-snbt-01',
    studentId: 'snbt-std-01',
    studentName: 'Muhammad Farhan Al-Fatih',
    nis: '2026120101',
    date: '2026-02-08',
    meetingNumber: 12,
    timeStart: '15:30',
    timeEnd: '17:00',
    durationMinutes: 90,
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    syllabusCode: 'SIL-PK-XII-01',
    syllabusTitle: 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial',
    moduleId: 'mod-pk-01',
    moduleCode: 'MOD-PK-01',
    moduleTitle: 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Operasi Aljabar Pecahan & Nilai Mutlak',
      'Invers & Komposisi Fungsi f(g(x))',
      'Operasi Determinan & Invers Matriks 2x2',
      'Trik Cepat Faktorisasi Polinomial Derajat 3'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 94,
    practiceQuestionsCount: 20,
    practiceQuestionsCorrect: 19,
    practiceAccuracy: 95,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Konsep determinan matriks dan invers komposisi f(g(x)) sudah sangat lancar. Berhasil menyelesaikan 20 butir soal dalam waktu 18 menit tanpa rumus panjang.',
    tutorFeedback: 'Akurasi Farhan luar biasa (95%). Fokus berikutnya pada trik eliminasi 30 detik untuk tipe soal kecukupan data pernyataan (1) & (2).',
    targetIrtImpact: '+18 Poin Proyeksi IRT PK (Target 780)',
    linkedMaterialTitle: 'Modul Pengetahuan Kuantitatif & Pembahasan Soal HOTS',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-08T17:15:00Z',
    updatedAt: '2026-02-08T17:15:00Z'
  },
  {
    id: 'jrn-snbt-02',
    studentId: 'snbt-std-01',
    studentName: 'Muhammad Farhan Al-Fatih',
    nis: '2026120101',
    date: '2026-02-06',
    meetingNumber: 11,
    timeStart: '13:30',
    timeEnd: '15:00',
    durationMinutes: 90,
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    syllabusCode: 'SIL-MTK-XII-01',
    syllabusTitle: 'Mastery Silogisme Formal, Modus Ponens & Negasi Logika',
    moduleId: 'mod-pu-01',
    moduleCode: 'MOD-PU-01',
    moduleTitle: 'Mastery Silogisme Formal, Modus Ponens & Negasi Logika',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Kaidah Modus Ponens & Modus Tollens',
      'Silogisme Majemuk & Rantai Implikasi (p -> q -> r)',
      'Hukum De Morgan & Negasi Kuantor'
    ],
    learningActivityType: 'PEMBAHASAN_MODUL',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 92,
    practiceQuestionsCount: 15,
    practiceQuestionsCorrect: 14,
    practiceAccuracy: 93,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Kaidah kontraposisi (~q -> ~p) sangat membantu mengeliminasi jawaban jebakan invers dan konvers dalam waktu < 20 detik.',
    tutorFeedback: 'Pemahaman penalaran deduktif sangat solid. Siap masuk modul penalaran induktif kausalitas pekan depan.',
    targetIrtImpact: '+15 Poin Proyeksi IRT PU (Skor Saat Ini: 780)',
    linkedMaterialTitle: 'E-Book Bedah Penalaran Deduktif & Silogisme HOTS',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-06T15:10:00Z',
    updatedAt: '2026-02-06T15:10:00Z'
  },
  {
    id: 'jrn-snbt-03',
    studentId: 'snbt-std-01',
    studentName: 'Muhammad Farhan Al-Fatih',
    nis: '2026120101',
    date: '2026-02-03',
    meetingNumber: 10,
    timeStart: '16:00',
    timeEnd: '17:30',
    durationMinutes: 90,
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    syllabusCode: 'SIL-PM-XII-01',
    syllabusTitle: 'Pemodelan Masalah Realistik: Aljabar, Persentase & Aritmetika Finansial',
    moduleId: 'mod-pm-01',
    moduleCode: 'MOD-PM-01',
    moduleTitle: 'Pemodelan Masalah Realistik: Aljabar, Persentase & Aritmetika Finansial',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Translasi Narasi Soal Cerita ke Persamaan Linier',
      'Perhitungan Bunga Majemuk, Diskon Bertingkat, dan Margin Usaha',
      'Optimasi Alokasi Anggaran & Titik Impas (Break-Even Point)'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'PAHAM',
    comprehensionPercentage: 88,
    practiceQuestionsCount: 16,
    practiceQuestionsCorrect: 14,
    practiceAccuracy: 87.5,
    homeworkStatus: 'SELESAI',
    studentReflectionNotes: 'Perlu sedikit lebih teliti saat membaca narasi diskon bertingkat ganda 50% + 20% agar tidak langsung dijumlahkan 70%.',
    tutorFeedback: 'Telah menguasai translasi persamaan aljabar kontekstual. Rekomendasi: teruskan latihan 5 soal cerita PM setiap pagi.',
    targetIrtImpact: '+20 Poin Proyeksi IRT PM',
    linkedMaterialTitle: 'Modul Penalaran Matematika Kontekstual',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-03T17:40:00Z',
    updatedAt: '2026-02-03T17:40:00Z'
  },
  {
    id: 'jrn-snbt-04',
    studentId: 'snbt-std-01',
    studentName: 'Muhammad Farhan Al-Fatih',
    nis: '2026120101',
    date: '2026-01-30',
    meetingNumber: 9,
    timeStart: '15:00',
    timeEnd: '16:30',
    durationMinutes: 90,
    subtestCode: 'LBE',
    subtestName: 'Literasi dalam Bahasa Inggris',
    category: 'Literasi',
    syllabusCode: 'SIL-LBE-XII-01',
    syllabusTitle: 'Main Idea, Topic, & Primary Purpose of Passage',
    moduleId: 'mod-lbe-01',
    moduleCode: 'MOD-LBE-01',
    moduleTitle: 'Main Idea, Topic, & Primary Purpose of Academic Texts',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Skimming strategies for lengthy academic articles',
      'Identifying Topic vs Main Idea vs Thesis Statement',
      'Formulating the best title for a multi-paragraph text'
    ],
    learningActivityType: 'PEMBAHASAN_MODUL',
    instructorName: 'Sarah Maharani, S.Pd., M.Ed.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 90,
    practiceQuestionsCount: 18,
    practiceQuestionsCorrect: 17,
    practiceAccuracy: 94.4,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Skimming strategy helped me grasp the main thesis statement in paragraph 1 within 30 seconds. Vocabulary in context felt natural.',
    tutorFeedback: 'Farhan has strong reading retention and skim technique. Progressing rapidly towards 780+ in English literacy.',
    targetIrtImpact: '+16 Poin Proyeksi IRT LBE',
    linkedMaterialTitle: 'Intensive English Reading & Question Bank 2026',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-01-30T16:45:00Z',
    updatedAt: '2026-01-30T16:45:00Z'
  },

  // Student 2: Annisa Rahmawati (snbt-std-02)
  {
    id: 'jrn-snbt-05',
    studentId: 'snbt-std-02',
    studentName: 'Annisa Rahmawati',
    nis: '2026120102',
    date: '2026-02-08',
    meetingNumber: 12,
    timeStart: '15:30',
    timeEnd: '17:00',
    durationMinutes: 90,
    subtestCode: 'LBI',
    subtestName: 'Literasi dalam Bahasa Indonesia',
    category: 'Literasi',
    syllabusCode: 'SIL-BIND-XII-03',
    syllabusTitle: 'Membaca Kritis Teks Saintifik, Opini & Jurnal Populer',
    moduleId: 'mod-lbi-01',
    moduleCode: 'MOD-LBI-01',
    moduleTitle: 'Membaca Kritis Teks Saintifik, Opini & Jurnal Populer',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Identifikasi Fakta vs Opini Penulis',
      'Penarikan Simpulan Logis Berdasarkan Bukti Teks',
      'Analisis Argumen dan Sikap Keberpihakan Penulis'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Ahmad Fauzi, S.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 96,
    practiceQuestionsCount: 22,
    practiceQuestionsCorrect: 21,
    practiceAccuracy: 95.5,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Sangat menyukai teks saintifik kedokteran & bioteknologi. Membedakan fakta riset dengan interpretasi opini penulis terasa mudah.',
    tutorFeedback: 'Kemampuan literasi Annisa tertinggi di angkatan (Skor 800 di LBI). Terus pertahankan ritme membaca cepat.',
    targetIrtImpact: '+12 Poin Proyeksi IRT LBI (Puncak IRT 800)',
    linkedMaterialTitle: 'Bedah Wacana Multiteks Saintifik & Sosial LBI',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-08T17:15:00Z',
    updatedAt: '2026-02-08T17:15:00Z'
  },
  {
    id: 'jrn-snbt-06',
    studentId: 'snbt-std-02',
    studentName: 'Annisa Rahmawati',
    nis: '2026120102',
    date: '2026-02-05',
    meetingNumber: 11,
    timeStart: '14:00',
    timeEnd: '15:30',
    durationMinutes: 90,
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    syllabusCode: 'SIL-PK-XII-01',
    syllabusTitle: 'Format Unik SNBT: Kecukupan Data Pernyataan (1) & (2)',
    moduleId: 'mod-pk-02',
    moduleCode: 'MOD-PK-02',
    moduleTitle: 'Format Unik SNBT: Kecukupan Data Pernyataan (1) & (2)',
    moduleDifficulty: 'MENENGAH',
    subtopicsCovered: [
      'Alur Berpikir 4 Langkah Kecukupan Data',
      'Uji Independen Pernyataan (1) Saja vs Pernyataan (2) Saja',
      'Kombinasi Pernyataan (1) DAN (2) Bersama-sama',
      'Eliminasi Opsi Klasik (A, B, C, D, E)'
    ],
    learningActivityType: 'KONSULTASI_GURU',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'PAHAM',
    comprehensionPercentage: 82,
    practiceQuestionsCount: 15,
    practiceQuestionsCorrect: 12,
    practiceAccuracy: 80,
    homeworkStatus: 'SELESAI',
    studentReflectionNotes: 'Kadang masih tergoda menghitung nilai akhir secara lengkap padahal hanya perlu memastikan kecukupan informasinya saja.',
    tutorFeedback: 'Kunci kecukupan data: "Don\'t calculate the exact value, only prove uniqueness!". Annisa sudah mengalami kenaikan signifikan.',
    targetIrtImpact: '+25 Poin Proyeksi IRT PK (Mengejar target FK UI)',
    linkedMaterialTitle: 'Drill 100 Butir Kecukupan Data & Perbandingan Nilai P vs Q',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-05T15:45:00Z',
    updatedAt: '2026-02-05T15:45:00Z'
  },

  // Student 3: Rizky Pratama (snbt-std-03)
  {
    id: 'jrn-snbt-07',
    studentId: 'snbt-std-03',
    studentName: 'Rizky Pratama',
    nis: '2026120103',
    date: '2026-02-07',
    meetingNumber: 12,
    timeStart: '15:30',
    timeEnd: '17:00',
    durationMinutes: 90,
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    syllabusCode: 'SIL-PK-XII-01',
    syllabusTitle: 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial',
    moduleId: 'mod-pk-01',
    moduleCode: 'MOD-PK-01',
    moduleTitle: 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Operasi Aljabar Pecahan & Nilai Mutlak',
      'Invers & Komposisi Fungsi f(g(x))',
      'Operasi Determinan & Invers Matriks 2x2'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 98,
    practiceQuestionsCount: 20,
    practiceQuestionsCorrect: 20,
    practiceAccuracy: 100,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Skor sempurna 20/20 di sesi drill PK. Semua trik matriks dan determinan langsung tereksekusi < 30 detik per soal.',
    tutorFeedback: 'Rizky adalah top scorer PK (Skor 810). Saatnya memperkuat subtes literasi bahasa agar nilai agregat merata tinggi.',
    targetIrtImpact: '+10 Poin Proyeksi IRT PK (Solid > 800)',
    linkedMaterialTitle: 'Modul Pengetahuan Kuantitatif & Pembahasan Soal HOTS',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-07T17:10:00Z',
    updatedAt: '2026-02-07T17:10:00Z'
  },
  {
    id: 'jrn-snbt-08',
    studentId: 'snbt-std-03',
    studentName: 'Rizky Pratama',
    nis: '2026120103',
    date: '2026-02-04',
    meetingNumber: 11,
    timeStart: '13:30',
    timeEnd: '15:00',
    durationMinutes: 90,
    subtestCode: 'PBM',
    subtestName: 'Pemahaman Bacaan & Menulis',
    category: 'TPS',
    syllabusCode: 'SIL-PBM-XII-01',
    syllabusTitle: 'Standar Ejaan EYD V, Huruf Kapital, Miring & Tanda Baca Kritis',
    moduleId: 'mod-pbm-01',
    moduleCode: 'MOD-PBM-01',
    moduleTitle: 'Standar Ejaan EYD V, Huruf Kapital, Miring & Tanda Baca Kritis',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Aturan Huruf Kapital (Gelar, Jabatan, Nama Geografi)',
      'Penulisan Kata Gabung & Unsur Serapan',
      'Tanda Koma Sebelum Konjungsi Koordinatif & Subordinatif'
    ],
    learningActivityType: 'REMEDIAL_IRT',
    instructorName: 'Ahmad Fauzi, S.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'CUKUP',
    comprehensionPercentage: 74,
    practiceQuestionsCount: 18,
    practiceQuestionsCorrect: 13,
    practiceAccuracy: 72.2,
    homeworkStatus: 'SELESAI',
    studentReflectionNotes: 'Masih sering rancu membedakan kata depan "di mana" dengan konjungsi "yang mana", serta tanda koma sebelum konjungsi "tetapi" vs "sedangkan".',
    tutorFeedback: 'Rizky butuh pendalaman flashcard EYD V 15 menit setiap hari sebelum tidur agar ejaan menjadi refleks visual.',
    targetIrtImpact: '+35 Poin Proyeksi IRT PBM (Kejar target STEI ITB)',
    linkedMaterialTitle: 'Buku Saku Ringkasan Kaidah EYD Edisi V Resmi PUEBI',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-04T15:15:00Z',
    updatedAt: '2026-02-04T15:15:00Z'
  },

  // Student 4: Siti Aisyah Putri (snbt-std-04)
  {
    id: 'jrn-snbt-09',
    studentId: 'snbt-std-04',
    studentName: 'Siti Aisyah Putri',
    nis: '2026120104',
    date: '2026-02-07',
    meetingNumber: 12,
    timeStart: '16:00',
    timeEnd: '17:30',
    durationMinutes: 90,
    subtestCode: 'PPU',
    subtestName: 'Pengetahuan & Pemahaman Umum',
    category: 'TPS',
    syllabusCode: 'SIL-BIND-XII-03',
    syllabusTitle: 'Ekstraksi Ide Pokok, Kalimat Utama & Simpulan Wacana Padat',
    moduleId: 'mod-ppu-01',
    moduleCode: 'MOD-PPU-01',
    moduleTitle: 'Ekstraksi Ide Pokok, Kalimat Utama & Simpulan Wacana Padat',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Letak Kalimat Utama & Penjelas',
      'Penentuan Gagasan Utama Paragraf Jamak',
      'Menentukan Judul yang Paling Representatif'
    ],
    learningActivityType: 'PEMBAHASAN_MODUL',
    instructorName: 'Ahmad Fauzi, S.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 92,
    practiceQuestionsCount: 20,
    practiceQuestionsCorrect: 18,
    practiceAccuracy: 90,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Teknik membaca kalimat awal dan akhir paragraf sangat efektif menghemat waktu pengerjaan.',
    tutorFeedback: 'Siti memiliki pemahaman teks yang sangat jernih. Pertahankan akurasi di atas 90%.',
    targetIrtImpact: '+18 Poin Proyeksi IRT PPU',
    linkedMaterialTitle: 'Modul Intisari PPU: 50 Teks Wacana & Pembahasan Kilat',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-07T17:40:00Z',
    updatedAt: '2026-02-07T17:40:00Z'
  },

  // Student 5: Budi Santoso (snbt-std-05)
  {
    id: 'jrn-snbt-10',
    studentId: 'snbt-std-05',
    studentName: 'Budi Santoso',
    nis: '2026120105',
    date: '2026-02-08',
    meetingNumber: 12,
    timeStart: '13:30',
    timeEnd: '15:00',
    durationMinutes: 90,
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    syllabusCode: 'SIL-PM-XII-01',
    syllabusTitle: 'Geometri Dimensi 2 & 3: Keliling, Luas, Volume & Optimasi Ruang',
    moduleId: 'mod-pm-03',
    moduleCode: 'MOD-PM-03',
    moduleTitle: 'Geometri Dimensi 2 & 3: Keliling, Luas, Volume & Optimasi Ruang',
    moduleDifficulty: 'MENENGAH',
    subtopicsCovered: [
      'Luas & Volume Bangun Ruang Gabungan',
      'Jarak Titik ke Garis/Bidang pada Kubus & Balok',
      'Optimasi Bahan Kemasan Produk'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'PAHAM',
    comprehensionPercentage: 86,
    practiceQuestionsCount: 15,
    practiceQuestionsCorrect: 13,
    practiceAccuracy: 86.7,
    homeworkStatus: 'SELESAI',
    studentReflectionNotes: 'Visualisasi 3D pada bangun ruang gabungan cukup jelas setelah dibantu sketsa ortogonal.',
    tutorFeedback: 'Budi sudah melampaui target passing grade Teknik Mesin ITS. Terus jaga konsistensi!',
    targetIrtImpact: '+22 Poin Proyeksi IRT PM',
    linkedMaterialTitle: 'Bank Soal HOTS Geometri & Pemodelan Ruang PM',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-08T15:15:00Z',
    updatedAt: '2026-02-08T15:15:00Z'
  },

  // Student 6: Dian Kusuma (snbt-std-06)
  {
    id: 'jrn-snbt-11',
    studentId: 'snbt-std-06',
    studentName: 'Dian Kusuma',
    nis: '2026120106',
    date: '2026-02-06',
    meetingNumber: 11,
    timeStart: '15:30',
    timeEnd: '17:00',
    durationMinutes: 90,
    subtestCode: 'PBM',
    subtestName: 'Pemahaman Bacaan & Menulis',
    category: 'TPS',
    syllabusCode: 'SIL-PBM-XII-01',
    syllabusTitle: 'Kalimat Efektif, Struktur S-P-O-K, & Ketatabahasaan Baku',
    moduleId: 'mod-pbm-02',
    moduleCode: 'MOD-PBM-02',
    moduleTitle: 'Kalimat Efektif, Struktur S-P-O-K, & Ketatabahasaan Baku',
    moduleDifficulty: 'MENENGAH',
    subtopicsCovered: [
      'Struktur Inti Kalimat (S-P Minimal)',
      'Subjek Ganda & Penghilangan Unsur Wajib',
      'Keparalelan Bentuk Imbuhan (me- vs di-)',
      'Kelogisan Nalar Kalimat'
    ],
    learningActivityType: 'KONSULTASI_GURU',
    instructorName: 'Ahmad Fauzi, S.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 90,
    practiceQuestionsCount: 16,
    practiceQuestionsCorrect: 15,
    practiceAccuracy: 93.8,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Sudah bisa dengan cepat mendeteksi kalimat tanpa predikat (anak kalimat bertumpuk dengan konjungsi "yang").',
    tutorFeedback: 'Dian sangat detail dalam menganalisis konstruksi kalimat. Skor PBM meningkat pesat ke 740+.',
    targetIrtImpact: '+20 Poin Proyeksi IRT PBM (Mendekati PG Psikologi UI)',
    linkedMaterialTitle: 'Ringkasan Kalimat Efektif & Rekonstruksi Paragraf Baku',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-06T17:10:00Z',
    updatedAt: '2026-02-06T17:10:00Z'
  },

  // Student 7: Fajar Ramadhan (snbt-std-07)
  {
    id: 'jrn-snbt-12',
    studentId: 'snbt-std-07',
    studentName: 'Fajar Ramadhan',
    nis: '2026120107',
    date: '2026-02-07',
    meetingNumber: 12,
    timeStart: '14:00',
    timeEnd: '15:30',
    durationMinutes: 90,
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    syllabusCode: 'SIL-MTK-XII-01',
    syllabusTitle: 'Penalaran Kuantitatif Simbolik, Pola Deret & Matriks Logika',
    moduleId: 'mod-pu-03',
    moduleCode: 'MOD-PU-03',
    moduleTitle: 'Penalaran Kuantitatif Simbolik, Pola Deret & Matriks Logika',
    moduleDifficulty: 'HOTS',
    subtopicsCovered: [
      'Operasi Aritmetika Unik Lambang Khusus (*, #, @)',
      'Deret Angka Pola Bertingkat & Loncat Dua',
      'Matriks Gambar & Rotasi Spasial 2D/3D'
    ],
    learningActivityType: 'SIMULASI_CBT',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'PAHAM',
    comprehensionPercentage: 84,
    practiceQuestionsCount: 20,
    practiceQuestionsCorrect: 17,
    practiceAccuracy: 85,
    homeworkStatus: 'SELESAI',
    studentReflectionNotes: 'Operasi lambang khusus # @ sudah aman. Masih perlu melatih kecepatan di rotasi spasial gambar 3D.',
    tutorFeedback: 'Kecepatan Fajar meningkat dari 75 detik/soal menjadi 55 detik/soal. Tren sangat positif.',
    targetIrtImpact: '+24 Poin Proyeksi IRT PU (Lolos Target Hukum UNDIP)',
    linkedMaterialTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-07T15:45:00Z',
    updatedAt: '2026-02-07T15:45:00Z'
  },

  // Student 8: Gita Nurul (snbt-std-08)
  {
    id: 'jrn-snbt-13',
    studentId: 'snbt-std-08',
    studentName: 'Gita Nurul Hidayah',
    nis: '2026120108',
    date: '2026-02-08',
    meetingNumber: 12,
    timeStart: '16:00',
    timeEnd: '17:30',
    durationMinutes: 90,
    subtestCode: 'LBE',
    subtestName: 'Literasi dalam Bahasa Inggris',
    category: 'Literasi',
    syllabusCode: 'SIL-LBE-XII-01',
    syllabusTitle: 'Author’s Tone, Attitude, & Target Audience',
    moduleId: 'mod-lbe-03',
    moduleCode: 'MOD-LBE-03',
    moduleTitle: 'Author’s Tone, Attitude, & Rhetorical Stance',
    moduleDifficulty: 'MENENGAH',
    subtopicsCovered: [
      'Identifying Tone (Critical, Optimistic, Objective, Skeptical)',
      'Author’s Stance and Persuasive Devices',
      'Predicting Target Audience of the Text'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Sarah Maharani, S.Pd., M.Ed.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 92,
    practiceQuestionsCount: 16,
    practiceQuestionsCorrect: 15,
    practiceAccuracy: 93.8,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Learning tone words like "skeptical", "pragmatic", and "condescending" helped eliminate distractors immediately.',
    tutorFeedback: 'Gita shows strong nuance detection in academic passages. Ready for dual passage comparative analysis.',
    targetIrtImpact: '+18 Poin Proyeksi IRT LBE (Aman untuk HI UNAIR)',
    linkedMaterialTitle: 'Tone & Attitude Analysis in SNBT English Passages',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-08T17:40:00Z',
    updatedAt: '2026-02-08T17:40:00Z'
  },

  // Student 9: Hendra Gunawan (snbt-std-09)
  {
    id: 'jrn-snbt-14',
    studentId: 'snbt-std-09',
    studentName: 'Hendra Gunawan',
    nis: '2026120109',
    date: '2026-02-07',
    meetingNumber: 11,
    timeStart: '15:00',
    timeEnd: '16:30',
    durationMinutes: 90,
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    syllabusCode: 'SIL-PK-XII-01',
    syllabusTitle: 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial',
    moduleId: 'mod-pk-01',
    moduleCode: 'MOD-PK-01',
    moduleTitle: 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial',
    moduleDifficulty: 'DASAR',
    subtopicsCovered: [
      'Operasi Aljabar Pecahan & Nilai Mutlak',
      'Invers & Komposisi Fungsi f(g(x))',
      'Operasi Determinan & Invers Matriks 2x2'
    ],
    learningActivityType: 'REMEDIAL_IRT',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'CUKUP',
    comprehensionPercentage: 68,
    practiceQuestionsCount: 15,
    practiceQuestionsCorrect: 10,
    practiceAccuracy: 66.7,
    homeworkStatus: 'SEBAGIAN',
    studentReflectionNotes: 'Masih lambat di manipulasi pecahan aljabar bertingkat. Perlu lebih sering drilling rumus dasar aljabar SMP-SMA.',
    tutorFeedback: 'Hendra butuh 2 sesi tutorial privat tambahan untuk memantapkan aljabar dasar sebelum melangkah ke geometri analitik.',
    targetIrtImpact: '+30 Poin Proyeksi IRT PK (Prioritas Remedial Akuntansi UNPAD)',
    linkedMaterialTitle: 'Modul Pengetahuan Kuantitatif & Pembahasan Soal HOTS',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-07T16:45:00Z',
    updatedAt: '2026-02-07T16:45:00Z'
  },

  // Student 10: Indah Permata (snbt-std-10)
  {
    id: 'jrn-snbt-15',
    studentId: 'snbt-std-10',
    studentName: 'Indah Permata Sari',
    nis: '2026120110',
    date: '2026-02-08',
    meetingNumber: 12,
    timeStart: '14:00',
    timeEnd: '15:30',
    durationMinutes: 90,
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    syllabusCode: 'SIL-PM-XII-01',
    syllabusTitle: 'Peluang & Teori Keputusan dalam Bisnis/Manajemen',
    moduleId: 'mod-pm-02',
    moduleCode: 'MOD-PM-02',
    moduleTitle: 'Peluang, Kombinatorika & Teori Keputusan Bisnis',
    moduleDifficulty: 'MENENGAH',
    subtopicsCovered: [
      'Kaidah Pencacahan, Permutasi & Kombinasi Bersyarat',
      'Peluang Kejadian Majemuk Saling Lepas & Bebas',
      'Nilai Harapan (Expected Value) dalam Keputusan Finansial'
    ],
    learningActivityType: 'DRILL_SOAL',
    instructorName: 'Dr. Hendra Wijaya, M.Pd.',
    attendanceStatus: 'HADIR',
    comprehensionLevel: 'SANGAT_PAHAM',
    comprehensionPercentage: 94,
    practiceQuestionsCount: 18,
    practiceQuestionsCorrect: 17,
    practiceAccuracy: 94.4,
    homeworkStatus: 'SEMPURNA',
    studentReflectionNotes: 'Sangat menyukai soal kombinatorika tim kerja dan expected value bisnis. Logika peluang terasa intuitif.',
    tutorFeedback: 'Indah sangat berbakat di penalaran logika statistik dan peluang. Sangat cocok dengan target Manajemen UB.',
    targetIrtImpact: '+16 Poin Proyeksi IRT PM (Target Lolos Aman)',
    linkedMaterialTitle: 'Modul Penalaran Matematika Kontekstual',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isVerified: true,
    createdAt: '2026-02-08T15:40:00Z',
    updatedAt: '2026-02-08T15:40:00Z'
  }
];

const SNBT_JOURNALS_STORAGE_KEY = 'snbt_learning_journals_v2';

export function loadStoredSnbtJournals(): SnbtLearningJournalEntry[] {
  try {
    const raw = localStorage.getItem(SNBT_JOURNALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SNBT_JOURNALS_STORAGE_KEY, JSON.stringify(INITIAL_SNBT_JOURNALS));
      return INITIAL_SNBT_JOURNALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SNBT_JOURNALS;
  } catch (err) {
    console.error('Failed to load SNBT journals from localStorage', err);
    return INITIAL_SNBT_JOURNALS;
  }
}

export function saveStoredSnbtJournals(journals: SnbtLearningJournalEntry[]): void {
  try {
    localStorage.setItem(SNBT_JOURNALS_STORAGE_KEY, JSON.stringify(journals));
  } catch (err) {
    console.error('Failed to save SNBT journals to localStorage', err);
  }
}

// Calculate comprehensive student learning summary from journals
export function calculateStudentJournalSummary(
  studentId: string,
  journals: SnbtLearningJournalEntry[],
  allModules: SnbtSyllabusModule[] = INITIAL_SNBT_SYLLABUS_MODULES
) {
  const studentJournals = journals.filter(j => j.studentId === studentId);
  const totalEntries = studentJournals.length;
  
  const totalStudyMinutes = studentJournals.reduce((acc, j) => acc + (j.durationMinutes || 90), 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  const totalQuestions = studentJournals.reduce((acc, j) => acc + (j.practiceQuestionsCount || 0), 0);
  const totalCorrect = studentJournals.reduce((acc, j) => acc + (j.practiceQuestionsCorrect || 0), 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100 * 10) / 10 : 85;

  const avgComprehension = totalEntries > 0
    ? Math.round(studentJournals.reduce((acc, j) => acc + (j.comprehensionPercentage || 80), 0) / totalEntries)
    : 85;

  // Module coverage (which modules have at least 1 journal entry)
  const coveredModuleCodes = new Set<string>();
  studentJournals.forEach(j => {
    if (j.moduleCode) coveredModuleCodes.add(j.moduleCode);
    if (j.moduleId) coveredModuleCodes.add(j.moduleId);
  });

  const totalModulesCount = allModules.length || 28;
  const completedModulesCount = coveredModuleCodes.size;
  const coveragePercent = Math.round((completedModulesCount / totalModulesCount) * 100);

  // Subtest Breakdown in Journals
  const subtestCounts: Record<SnbtSubtestCode, number> = {
    PU: 0,
    PPU: 0,
    PBM: 0,
    PK: 0,
    LBI: 0,
    LBE: 0,
    PM: 0
  };

  const subtestAccuracies: Record<SnbtSubtestCode, { totalQ: number; correctQ: number; avgAcc: number }> = {
    PU: { totalQ: 0, correctQ: 0, avgAcc: 0 },
    PPU: { totalQ: 0, correctQ: 0, avgAcc: 0 },
    PBM: { totalQ: 0, correctQ: 0, avgAcc: 0 },
    PK: { totalQ: 0, correctQ: 0, avgAcc: 0 },
    LBI: { totalQ: 0, correctQ: 0, avgAcc: 0 },
    LBE: { totalQ: 0, correctQ: 0, avgAcc: 0 },
    PM: { totalQ: 0, correctQ: 0, avgAcc: 0 }
  };

  studentJournals.forEach(j => {
    if (j.subtestCode in subtestCounts) {
      subtestCounts[j.subtestCode]++;
      subtestAccuracies[j.subtestCode].totalQ += j.practiceQuestionsCount || 0;
      subtestAccuracies[j.subtestCode].correctQ += j.practiceQuestionsCorrect || 0;
    }
  });

  // Calculate final subtest accuracies
  Object.keys(subtestAccuracies).forEach(k => {
    const key = k as SnbtSubtestCode;
    const item = subtestAccuracies[key];
    item.avgAcc = item.totalQ > 0 ? Math.round((item.correctQ / item.totalQ) * 100) : 80;
  });

  return {
    studentId,
    totalEntries,
    totalStudyHours,
    totalStudyMinutes,
    totalQuestions,
    totalCorrect,
    avgAccuracy,
    avgComprehension,
    completedModulesCount,
    totalModulesCount,
    coveragePercent,
    coveredModuleCodes,
    subtestCounts,
    subtestAccuracies
  };
}

// Generate formatted WhatsApp message for journal sharing
export function formatSnbtJournalWhatsAppMessage(
  journal: SnbtLearningJournalEntry,
  student?: SnbtStudentProfile
): string {
  const compMeta = SNBT_COMPREHENSION_METAS[journal.comprehensionLevel];
  const actMeta = SNBT_ACTIVITY_TYPE_METAS[journal.learningActivityType];

  return `*📋 JURNAL BELAJAR & PROGRES UTBK-SNBT 2026*
*BIMBEL KELAS XII INTENSIF PTN*
----------------------------------------
👤 *Nama Siswa:* ${journal.studentName}
🆔 *NIS:* ${journal.nis}
🎯 *Target PTN:* ${student ? `${student.targetPtn1} (${student.prodi1})` : 'Target PTN Pilihan'}

📅 *Tanggal Sesi:* ${journal.date} (Pertemuan #${journal.meetingNumber})
⏰ *Waktu:* ${journal.timeStart} - ${journal.timeEnd} WIB (${journal.durationMinutes} Menit)
👨‍🏫 *Guru / Tutor:* ${journal.instructorName}

📚 *SUBTES & MODUL TERINTEGRASI:*
• *Subtes:* ${journal.subtestName} (${journal.subtestCode})
• *Modul:* ${journal.moduleCode ? `[${journal.moduleCode}] ` : ''}${journal.moduleTitle || journal.syllabusTitle}
• *Tingkat Kesulitan:* ${journal.moduleDifficulty || 'DASAR'}
• *Aktivitas:* ${actMeta.label}

📖 *Materi & Subtopik yang Dipelajari:*
${journal.subtopicsCovered.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}

📊 *HASIL EVALUASI PEMAHAMAN:*
• *Tingkat Pemahaman:* ${compMeta.label} (${journal.comprehensionPercentage}%)
• *Drill Latihan Soal:* ${journal.practiceQuestionsCorrect}/${journal.practiceQuestionsCount} Butir Benar (Akurasi: ${journal.practiceAccuracy}%)
• *Status Tugas/PR:* ${journal.homeworkStatus}
• *Dampak Target Skor IRT:* ${journal.targetIrtImpact}

📝 *Catatan Refleksi Siswa:*
"${journal.studentReflectionNotes}"

💡 *Rekomendasi Tindak Lanjut Guru:*
"${journal.tutorFeedback}"
----------------------------------------
_Laporan otomatis disinkronisasi melalui Sistem Evaluasi SNBT & Silabus Modul Nasional._`;
}
