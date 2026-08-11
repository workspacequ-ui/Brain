import { SyllabusItem, LearningMaterial, Exam } from '../../types';

export type SnbtSubtestCode = 'PU' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM';

export type SnbtSubtestCategory = 'TPS' | 'Literasi' | 'Penalaran Matematika';

export type SnbtModuleDifficulty = 'DASAR' | 'MENENGAH' | 'HOTS';

export type SnbtModuleStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface SnbtSubtestMeta {
  code: SnbtSubtestCode;
  name: string;
  category: SnbtSubtestCategory;
  categoryBadge: string;
  totalQuestions: number;
  durationMinutes: number;
  avgTimePerQuestionSec: number;
  targetScoreAverage: number;
  colorGradient: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  description: string;
  coreSkills: string[];
}

export interface SnbtSyllabusModule {
  id: string;
  code: string; // e.g. 'MOD-PU-01'
  subtestCode: SnbtSubtestCode;
  subtestName: string;
  category: SnbtSubtestCategory;
  title: string;
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  phaseName: string;
  weekNumber: number; // Pekan 1 - 20
  targetScoreIrt: number; // e.g. 720, 750
  durationMinutes: number; // e.g. 90
  difficulty: SnbtModuleDifficulty;
  teacherInCharge: string;
  description: string;
  subtopics: string[];
  competency: string;
  conceptSummary: string;
  flashFormula: string;
  academicSyllabusId?: string; // e.g. 'sil-1'
  academicSyllabusCode?: string; // e.g. 'SIL-MTK-XII-01'
  linkedMaterialTitle?: string;
  linkedMaterialUrl?: string;
  linkedMaterialType?: 'PDF' | 'VIDEO' | 'DRIVE' | 'PPT';
  linkedExamTitle?: string;
  sampleQuestionCount?: number;
  isOfficialBlueprint?: boolean;
}

export interface SnbtModuleUserProgress {
  status: SnbtModuleStatus;
  completedAt?: string;
  notes?: string;
  isBookmarked?: boolean;
  scorePractice?: number;
  understandingPercent?: number; // 0 - 100
}

export interface SnbtWeeklyPlottingItem {
  weekNumber: number;
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  phaseTitle: string;
  dateRange: string;
  focusTitle: string;
  targetIrtRange: string;
  sessionCount: number;
  moduleCodes: string[];
  activities: string[];
  examTarget?: string;
  isCurrentWeek?: boolean;
}

// 7 Subtes Resmi UTBK-SNBT Metadata
export const SNBT_7_SUBTEST_METAS: SnbtSubtestMeta[] = [
  {
    code: 'PU',
    name: 'Penalaran Umum',
    category: 'TPS',
    categoryBadge: 'Tes Potensi Skolastik',
    totalQuestions: 30,
    durationMinutes: 30,
    avgTimePerQuestionSec: 60,
    targetScoreAverage: 730,
    colorGradient: 'from-blue-600 to-indigo-700',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-950/30',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Kemampuan berpikir logis, analitis, dan sistematis dalam memecahkan masalah baru berdasarkan premis verbal, logika formal, maupun data kuantitatif tersirat.',
    coreSkills: ['Penalaran Induktif & Pola', 'Penalaran Deduktif & Silogisme', 'Penalaran Kuantitatif & Logika Angka']
  },
  {
    code: 'PPU',
    name: 'Pengetahuan & Pemahaman Umum',
    category: 'TPS',
    categoryBadge: 'Tes Potensi Skolastik',
    totalQuestions: 20,
    durationMinutes: 15,
    avgTimePerQuestionSec: 45,
    targetScoreAverage: 720,
    colorGradient: 'from-cyan-600 to-teal-700',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-950/30',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Kemampuan memahami intisari wacana, sinonim kontekstual, keterkaitan semantik, dan penalaran inferensial dari teks bahasa Indonesia baku.',
    coreSkills: ['Gagasan Pokok & Simpulan Tersirat', 'Hubungan Semantik & Kosakata Konteks', 'Kepaduan & Kohesi Paragraf']
  },
  {
    code: 'PBM',
    name: 'Pemahaman Bacaan & Menulis',
    category: 'TPS',
    categoryBadge: 'Tes Potensi Skolastik',
    totalQuestions: 20,
    durationMinutes: 25,
    avgTimePerQuestionSec: 75,
    targetScoreAverage: 740,
    colorGradient: 'from-amber-600 to-orange-700',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/30',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Kemampuan memahami kaidah sintaksis, ejaan resmi PUEBI / EYD V, pemilihan konjungsi yang padu, serta rekonstruksi kalimat efektif yang komunikatif.',
    coreSkills: ['PUEBI & EYD Edisi V', 'Kalimat Efektif & Struktur S-P-O-K', 'Konjungsi & Pembentukan Kata']
  },
  {
    code: 'PK',
    name: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    categoryBadge: 'Tes Potensi Skolastik',
    totalQuestions: 15,
    durationMinutes: 20,
    avgTimePerQuestionSec: 80,
    targetScoreAverage: 750,
    colorGradient: 'from-rose-600 to-red-700',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-950/30',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Penguasaan konsep dasar matematika praktis, aljabar, geometri, statistika, serta format soal unik kecukupan data (pernyataan 1 & 2) dan perbandingan nilai P vs Q.',
    coreSkills: ['Aljabar & Sistem Persamaan', 'Kecukupan Data (Pernyataan 1 & 2)', 'Geometri, Trigonometri & Statistika']
  },
  {
    code: 'LBI',
    name: 'Literasi dalam Bahasa Indonesia',
    category: 'Literasi',
    categoryBadge: 'Literasi Wacana',
    totalQuestions: 30,
    durationMinutes: 45,
    avgTimePerQuestionSec: 90,
    targetScoreAverage: 760,
    colorGradient: 'from-emerald-600 to-green-700',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/30',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Kompetensi membaca mendalam pada teks ilmiah, sosial, sastra, dan infografis multimoda untuk mengevaluasi fakta, opini, sudut pandang penulis, serta sintesis multiteks.',
    coreSkills: ['Membaca Kritis Teks Saintifik & Sosial', 'Evaluasi Argumen & Sikap Penulis', 'Sintesis Data Infografis & Multiteks']
  },
  {
    code: 'LBE',
    name: 'Literasi dalam Bahasa Inggris',
    category: 'Literasi',
    categoryBadge: 'Literasi Wacana',
    totalQuestions: 20,
    durationMinutes: 30,
    avgTimePerQuestionSec: 90,
    targetScoreAverage: 735,
    colorGradient: 'from-violet-600 to-purple-700',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/40',
    bgColor: 'bg-violet-950/30',
    badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    description: 'Critical reading comprehension on authentic English academic passages: topic synthesis, vocabulary in context, pronoun tracing, author tone, and implicit inferences.',
    coreSkills: ['Main Idea & Text Architecture', 'Vocabulary in Context & Inferences', 'Author Tone & Dual Passage Synthesis']
  },
  {
    code: 'PM',
    name: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    categoryBadge: 'Penalaran Matematika',
    totalQuestions: 20,
    durationMinutes: 30,
    avgTimePerQuestionSec: 90,
    targetScoreAverage: 755,
    colorGradient: 'from-fuchsia-600 to-pink-700',
    textColor: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-500/40',
    bgColor: 'bg-fuchsia-950/30',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    description: 'Kemampuan memformulasikan, menerapkan, dan menafsirkan model matematika dalam konteks permasalahan dunia nyata, aritmetika finansial, laju perubahan, dan optimasi.',
    coreSkills: ['Pemodelan Kontekstual Nyata', 'Aritmetika Finansial & Persentase', 'Geometri Aplikasi & Optimasi Grafik']
  }
];

// Data Blueprint Silabus & Modul Pembelajaran SNBT 2026 Lengkap (Terhubung Silabus Akademik)
export const INITIAL_SNBT_SYLLABUS_MODULES: SnbtSyllabusModule[] = [
  // ====================== 1. SUBTES PENALARAN UMUM (PU) ======================
  {
    id: 'mod-pu-01',
    code: 'MOD-PU-01',
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    title: 'Mastery Silogisme Formal, Modus Ponens & Negasi Logika',
    phaseNumber: 1,
    phaseName: 'Fase 1: Penguasaan Konsep Dasar',
    weekNumber: 1,
    targetScoreIrt: 700,
    durationMinutes: 90,
    difficulty: 'DASAR',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Penguasaan penalaran deduktif klasik: premis mayor/minor, modus ponens, modus tollens, silogisme hipotesis, dan ekuivalensi bentuk implikasi.',
    subtopics: [
      'Kaidah Modus Ponens & Modus Tollens',
      'Silogisme Majemuk & Rantai Implikasi (p -> q -> r)',
      'Hukum De Morgan & Negasi Kuantor (Semua vs Ada/Beberapa)',
      'Trik Cepat Diagram Euler'
    ],
    competency: 'Siswa mampu menarik simpulan valid dari 3 premis majemuk tanpa terkecoh pernyataan invers/konvers dalam waktu < 45 detik.',
    conceptSummary: 'Implikasi p -> q ekuivalen dengan ~q -> ~p (Kontraposisi) dan ~p v q. Negasi dari "Semua A adalah B" adalah "Ada A yang bukan B".',
    flashFormula: 'Trik: Jika premis berbentuk "Semua X adalah Y" dan "Z bukan Y", maka simpulan mutlak: "Z bukan X" (Modus Tollens).',
    academicSyllabusId: 'sil-1',
    academicSyllabusCode: 'SIL-MTK-XII-01',
    linkedMaterialTitle: 'E-Book Bedah Penalaran Deduktif & Silogisme HOTS',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-pu-02',
    code: 'MOD-PU-02',
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    title: 'Penalaran Induktif & Generalisasi Berdasarkan Data Fakta',
    phaseNumber: 2,
    phaseName: 'Fase 2: Pendalaman Trik Cepat',
    weekNumber: 6,
    targetScoreIrt: 730,
    durationMinutes: 90,
    difficulty: 'MENENGAH',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Menarik kesimpulan dari pola keteraturan fakta spesifik, kausalitas sebab-akibat, dan kelemahan/keunggulan suatu generalisasi argumen.',
    subtopics: [
      'Pola Sebab-Akibat Kompleks (Causal Reasoning)',
      'Generalisasi Induktif & Analogi Logis',
      'Identifikasi Pernyataan Memperlemah vs Memperkuat Argumen',
      'Jebakan Korelasi vs Kausalitas'
    ],
    competency: 'Mengidentifikasi opsi jawaban yang paling mungkin benar, pasti salah, atau memperlemah klaim utama teks opini/analitis.',
    conceptSummary: 'Fokus pada inti premis sebab-akibat. Argumen diperkuat oleh fakta yang membuktikan korelasi langsung dan tidak ada faktor perancu alternatif.',
    flashFormula: 'Eliminasi opsi yang menggunakan kata mutlak ("selalu", "mustahil") jika teks sumber bernada probabilitas ("cenderung", "berpotensi").',
    academicSyllabusId: 'sil-1',
    linkedMaterialTitle: 'Video Tutorial Trik Analisis Paragraf Argumen PU',
    linkedMaterialUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    linkedMaterialType: 'VIDEO',
    sampleQuestionCount: 18,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-pu-03',
    code: 'MOD-PU-03',
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    title: 'Penalaran Kuantitatif Simbolik, Pola Deret & Matriks Logika',
    phaseNumber: 3,
    phaseName: 'Fase 3: Bedah Soal HOTS',
    weekNumber: 11,
    targetScoreIrt: 760,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Pemecahan teka-teki logika angka, deret berulang Fibonacci/bertingkat dua, operasi aritmetika baru bertanda khusus (a @ b # c), dan tabel inferensi.',
    subtopics: [
      'Operasi Aritmetika Unik Lambang Khusus (*, #, @)',
      'Deret Angka Pola Bertingkat, Loncat Dua, dan Gabungan Alfabet',
      'Matriks Gambar & Rotasi Spasial 2D/3D',
      'Trik Pembagian Waktu Speed Test'
    ],
    competency: 'Menyelesaikan 10 soal logika numerik simbolik bertingkat dalam waktu maksimal 8 menit dengan akurasi di atas 90%.',
    conceptSummary: 'Untuk pola @ #, terjemahkan aturan baris per baris. Untuk deret angka melompat, pisahkan deret posisi ganjil dan genap terlebih dahulu.',
    flashFormula: 'Rumus Cepat: Jika selisih antar-suku bertambah teratur (+3, +5, +7, +9), itu adalah barisan aritmetika tingkat 2 (berbasis kuadrat n²).',
    academicSyllabusId: 'sil-1',
    linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },

  // ================= 2. SUBTES PENGETAHUAN & PEMAHAMAN UMUM (PPU) =================
  {
    id: 'mod-ppu-01',
    code: 'MOD-PPU-01',
    subtestCode: 'PPU',
    subtestName: 'Pengetahuan & Pemahaman Umum',
    category: 'TPS',
    title: 'Ekstraksi Ide Pokok, Kalimat Utama & Simpulan Wacana Padat',
    phaseNumber: 1,
    phaseName: 'Fase 1: Penguasaan Konsep Dasar',
    weekNumber: 2,
    targetScoreIrt: 710,
    durationMinutes: 90,
    difficulty: 'DASAR',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Teknik membaca cepat skimming wacana sains dan sosial untuk menemukan kalimat utama deduktif, induktif, atau campuran.',
    subtopics: [
      'Letak Kalimat Utama & Penjelas',
      'Penentuan Gagasan Utama Paragraf Jamak',
      'Menentukan Judul yang Paling Representatif',
      'Membedakan Fakta Objektif vs Opini Subjektif'
    ],
    competency: 'Menemukan kalimat utama dari wacana 4 paragraf dalam waktu kurang dari 35 detik.',
    conceptSummary: 'Gagasan utama bersifat umum dan menjadi payung seluruh kalimat penjelas. Kalimat utama induktif ditandai konjungsi kesimpulan "Oleh karena itu", "Dengan demikian".',
    flashFormula: 'Trik: Baca kalimat 1 dan kalimat terakhir di setiap paragraf sebelum membaca opsi jawaban untuk menghindari bias distraktor.',
    academicSyllabusId: 'sil-3',
    academicSyllabusCode: 'SIL-BIND-XII-03',
    linkedMaterialTitle: 'Modul Intisari PPU: 50 Teks Wacana & Pembahasan Kilat',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-ppu-02',
    code: 'MOD-PPU-02',
    subtestCode: 'PPU',
    subtestName: 'Pengetahuan & Pemahaman Umum',
    category: 'TPS',
    title: 'Hubungan Semantik, Sinonim Konteks & Makna Kiasan/Denotatif',
    phaseNumber: 2,
    phaseName: 'Fase 2: Pendalaman Trik Cepat',
    weekNumber: 7,
    targetScoreIrt: 740,
    durationMinutes: 90,
    difficulty: 'MENENGAH',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Analisis makna leksikal vs gramatikal, homonim, polisemi, kata berpasangan serasi (kolokasi), dan pergeseran makna kata serapan.',
    subtopics: [
      'Makna Denotatif vs Konotatif',
      'Sinonim Kontekstual Berdasarkan Wacana',
      'Makna Ungkapan & Idiom Bahasa Indonesia',
      'Kata Rujukan & Asosiasi Leksikal'
    ],
    competency: 'Menganalisis padanan kata asing dan kata serapan yang paling pas menggantikan kata dalam kalimat rumpang.',
    conceptSummary: 'Sinonim di PPU bukan sekadar arti kamus, melainkan fungsi substitusi dalam kalimat wacana tanpa mengubah nuansa makna penulis.',
    flashFormula: 'Trik Uji Substitusi: Masukkan kata pada pilihan jawaban ke dalam kalimat asli. Jika kalimat terasa ganjil secara logika wacana, segera coret!',
    academicSyllabusId: 'sil-3',
    sampleQuestionCount: 16,
    isOfficialBlueprint: true
  },

  // ================= 3. SUBTES PEMAHAMAN BACAAN & MENULIS (PBM) =================
  {
    id: 'mod-pbm-01',
    code: 'MOD-PBM-01',
    subtestCode: 'PBM',
    subtestName: 'Pemahaman Bacaan & Menulis',
    category: 'TPS',
    title: 'Standar Ejaan EYD V, Huruf Kapital, Miring & Tanda Baca Kritis',
    phaseNumber: 1,
    phaseName: 'Fase 1: Penguasaan Konsep Dasar',
    weekNumber: 3,
    targetScoreIrt: 730,
    durationMinutes: 90,
    difficulty: 'DASAR',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Penguasaan menyeluruh pedoman ejaan EYD edisi ke-5: penulisan kata turunan, partikel pun/lah, tanda koma sebelum konjungsi, titik dua, dan tanda hubung.',
    subtopics: [
      'Aturan Huruf Kapital (Gelar, Jabatan, Nama Geografi)',
      'Huruf Miring untuk Istilah Asing & Judul Buku',
      'Tanda Koma (,) pada Kalimat Majemuk Bertingkat & Konjungsi Antarkalimat',
      'Penulisan Partikel "pun" (Dipisah vs Digabung)'
    ],
    competency: 'Menemukan kesalahan ejaan dan tanda baca dalam teks 150 kata dalam waktu 60 detik.',
    conceptSummary: 'Partikel "pun" ditulis terpisah kecuali 12 kata baku tetap: adapun, andaipun, ataupun, bagaimanapun, biarpun, kalaupun, kendatipun, maupun, meskipun, sekalipun, sungguhpun, walaupun.',
    flashFormula: 'Hafalan 12 Pengecualian Pun: "Ada, Andai, Atau, Bagaimana, Biar, Kalau, Kendati, Mau, Meski, Sekali, Sungguh, Walau". Selain ini, "pun" WAJIB dipisah!',
    academicSyllabusId: 'sil-3',
    linkedMaterialTitle: 'Cheat Sheet Resmi EYD V & Master Bank Soal PBM',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-pbm-02',
    code: 'MOD-PBM-02',
    subtestCode: 'PBM',
    subtestName: 'Pemahaman Bacaan & Menulis',
    category: 'TPS',
    title: 'Rekonstruksi Kalimat Efektif, Keparalelan & Kepaduan Paragraf',
    phaseNumber: 3,
    phaseName: 'Fase 3: Bedah Soal HOTS',
    weekNumber: 12,
    targetScoreIrt: 760,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Menyusun kalimat efektif yang memenuhi 5 syarat: kesepadanan struktur (S-P), keparalelan bentuk afiks, kehematan kata, kelogisan makna, dan kecermatan.',
    subtopics: [
      'Syarat Wajib Kalimat Efektif (Subjek & Predikat Wajib Jelas)',
      'Keparalelan Bentuk (meN- dengan meN-, di- dengan di-)',
      'Menghilangkan Pleonasme & Pemborosan Kata',
      'Penataan Kalimat Sumbang dalam Paragraf'
    ],
    competency: 'Mengubah kalimat yang tidak efektif dan ambigu menjadi kalimat ilmiah baku sesuai standar penulisan artikel ilmiah.',
    conceptSummary: 'Kalimat kehilangan Subjek jika diawali preposisi ("Dalam penelitian ini membuktikan..." -> salah, subjek hilang; yang benar: "Penelitian ini membuktikan...").',
    flashFormula: 'Cek Cepat: Hindari kalimat berpredikat ganda tanpa konjungsi atau kalimat yang diawali kata "Untuk", "Bagi", "Dalam" sebelum kata kerja.',
    academicSyllabusId: 'sil-3',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },

  // ================= 4. SUBTES PENGETAHUAN KUANTITATIF (PK) =================
  {
    id: 'mod-pk-01',
    code: 'MOD-PK-01',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    title: 'Aljabar Lanjut, Sistem Persamaan & Fungsi Komposisi/Invers',
    phaseNumber: 1,
    phaseName: 'Fase 1: Penguasaan Konsep Dasar',
    weekNumber: 4,
    targetScoreIrt: 740,
    durationMinutes: 90,
    difficulty: 'DASAR',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Operasi aljabar faktorisasi istimewa, sifat-sifat eksponen & logaritma, persamaan kuadrat (akar-akar Vieta), dan fungsi komposisi f(g(x)).',
    subtopics: [
      'Faktorisasi Aljabar Istimewa (a²-b², a³±b³)',
      'Rumus Jumlah & Hasil Kali Akar Vieta (x1 + x2 = -b/a, x1.x2 = c/a)',
      'Fungsi Invers & Komposisi Trik Cepat',
      'Pertidaksamaan Rasional & Nilai Mutlak'
    ],
    competency: 'Menyelesaikan persamaan kuadrat dan aljabar eksponen dalam waktu rata-rata < 50 detik tanpa hitungan rumit.',
    conceptSummary: 'Jika f(x) = (ax + b)/(cx + d), maka inversnya f⁻¹(x) = (-dx + b)/(cx - a). Tukar posisi a dan d lalu beri tanda minus.',
    flashFormula: 'Trik Invers Cepat: Tukar posisi diagonal kiri-atas & kanan-bawah lalu kalikan -1. Sangat menghemat 40 detik di ruang ujian!',
    academicSyllabusId: 'sil-1',
    academicSyllabusCode: 'SIL-MTK-XII-01',
    linkedMaterialTitle: 'Ringkasan Rumus Kilat Aljabar PK SNBT 2026',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-pk-02',
    code: 'MOD-PK-02',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    title: 'Mastery Format Kecukupan Data (Pernyataan 1 & 2) & P vs Q',
    phaseNumber: 2,
    phaseName: 'Fase 2: Pendalaman Trik Cepat',
    weekNumber: 8,
    targetScoreIrt: 780,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Strategi khusus menuntaskan format soal kecukupan data opsi A-E tanpa harus menghitung nilai akhir, serta perbandingan kuantitas P vs Q.',
    subtopics: [
      'Struktur 5 Opsi Standar Kecukupan Data SNPMB',
      'Teknik Uji Pernyataan (1) Saja, (2) Saja, dan Keduanya',
      'Penggunaan Counter-Example (Angka 0, 1, Negatif, Pecahan)',
      'Trik Eliminasi Opsi Soal P vs Q'
    ],
    competency: 'Menentukan kecukupan data secara presisi dalam 40 detik dengan teknik eliminasi matriks opsi.',
    conceptSummary: 'Uji (1) mandiri: Jika CUKUP, opsi tersisa A atau D. Jika TIDAK, opsi tersisa B, C, atau E. Lanjutkan uji (2) mandiri untuk menentukan jawaban pasti.',
    flashFormula: 'Aturan Emas: JANGAN buang waktu menghitung jawaban numerik akhir. Yang dinilai hanya apakah informasi CUKUP menghasilkan nilai tunggal unik!',
    academicSyllabusId: 'sil-1',
    linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-pk-03',
    code: 'MOD-PK-03',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    title: 'Geometri Analitis, Sudut Lingkaran & Peluang Kombinatorika',
    phaseNumber: 3,
    phaseName: 'Fase 3: Bedah Soal HOTS',
    weekNumber: 13,
    targetScoreIrt: 790,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Analisis geometri bidang datar (kesebangunan, garis singgung lingkaran, luas daerah arsir) dan kaidah pencacahan permutasi/kombinasi.',
    subtopics: [
      'Garis Sejajar & Sudut Berseberangan/Sepihak',
      'Kesebangunan Segitiga & Dalil Menelaus/Ceva Sederhana',
      'Kombinasi nCr & Permutasi Siklis Meja Bundar',
      'Peluang Bersyarat Kejadian Saling Bebas'
    ],
    competency: 'Menghitung rasio luas daerah arsir dan kombinasi penataan objek dalam format soal HOTS modern.',
    conceptSummary: 'Rasio luas dua bangun sebangun sama dengan kuadrat rasio sisi-sisi bersesuaian: L1/L2 = (s1/s2)²',
    flashFormula: 'Rumus Cepat: Jika perbandingan sisi sebangun adalah 1 : k, maka perbandingan luasnya adalah 1 : k², dan perbandingan volumenya adalah 1 : k³.',
    academicSyllabusId: 'sil-1',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },

  // ================= 5. SUBTES LITERASI BAHASA INDONESIA (LBI) =================
  {
    id: 'mod-lbi-01',
    code: 'MOD-LBI-01',
    subtestCode: 'LBI',
    subtestName: 'Literasi dalam Bahasa Indonesia',
    category: 'Literasi',
    title: 'Membaca Kritis Teks Sains Populer & Evaluasi Bukti Argumen',
    phaseNumber: 1,
    phaseName: 'Fase 1: Penguasaan Konsep Dasar',
    weekNumber: 5,
    targetScoreIrt: 750,
    durationMinutes: 90,
    difficulty: 'DASAR',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Membedah teks artikel ilmiah populer, laporan riset bioteknologi, perubahan iklim, dan inovasi teknologi dengan metode Active Reading.',
    subtopics: [
      'Pemetaan Struktur Argumen (Premis, Bukti, Klaim Utama)',
      'Identifikasi Bias Penulis & Validitas Sumber',
      'Pertanyaan "Manakah pernyataan yang sesuai/tidak sesuai"',
      'Teknik Scanning Kata Kunci & Parafrasa Jawaban'
    ],
    competency: 'Menjawab soal pemahaman teks panjang 600 kata dalam alokasi waktu rata-rata 1 menit per soal.',
    conceptSummary: 'Pilihan jawaban yang benar di LBI hampir selalu berupa PARAFRASA dari teks asli, bukan copy-paste kata perkata dari wacana.',
    flashFormula: 'Waspadai Jebakan: Opsi yang menyalin persis kalimat teks seringkali ditambahkan sedikit kata penyimpang yang membuatnya salah makna.',
    academicSyllabusId: 'sil-3',
    academicSyllabusCode: 'SIL-BIND-XII-03',
    linkedMaterialTitle: 'Kumpulan 25 Teks Saintifik Populer LBI SNBT 2026',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-lbi-02',
    code: 'MOD-LBI-02',
    subtestCode: 'LBI',
    subtestName: 'Literasi dalam Bahasa Indonesia',
    category: 'Literasi',
    title: 'Sintesis Multiteks Komparatif & Analisis Infografis Multimoda',
    phaseNumber: 3,
    phaseName: 'Fase 3: Bedah Soal HOTS',
    weekNumber: 14,
    targetScoreIrt: 780,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Menghubungkan dua teks wacana berbeda sudut pandang (Teks 1 vs Teks 2) serta mengintegrasikan data tabel grafik infografis.',
    subtopics: [
      'Titik Temu & Perbedaan Pandangan Antara Teks 1 dan Teks 2',
      'Membaca Data Grafik Batang, Diagram Lingkaran & Tren Statistik',
      'Prediksi Dampak Kebijakan Berdasarkan Sintesis Data',
      'Trik Manajemen Waktu Teks Panjang'
    ],
    competency: 'Mengintegrasikan data infografis dengan argumen tekstual untuk menarik simpulan sintesis yang valid.',
    conceptSummary: 'Cari kesamaan topik umum terlebih dahulu, lalu bandingkan argumen spesifik: apakah Teks 2 mendukung, melengkapi, atau membantah Teks 1.',
    flashFormula: 'Trik Matriks Perbandingan: Catat 1 kata kunci kesimpulan Teks 1 dan 1 kata kunci Teks 2 di lembar coretan sebelum membaca opsi.',
    academicSyllabusId: 'sil-3',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },

  // ================= 6. SUBTES LITERASI BAHASA INGGRIS (LBE) =================
  {
    id: 'mod-lbe-01',
    code: 'MOD-LBE-01',
    subtestCode: 'LBE',
    subtestName: 'Literasi dalam Bahasa Inggris',
    category: 'Literasi',
    title: 'Academic Skimming, Main Idea & Paragraph Organization Blueprint',
    phaseNumber: 2,
    phaseName: 'Fase 2: Pendalaman Trik Cepat',
    weekNumber: 9,
    targetScoreIrt: 740,
    durationMinutes: 90,
    difficulty: 'MENENGAH',
    teacherInCharge: 'Sarah Maharani, S.Pd., M.Ed.',
    description: 'Mastering reading comprehension for college-level English expository texts: identifying topic sentences, transitional devices, and overarching thesis.',
    subtopics: [
      'Topic vs Main Idea vs Author Purpose Formulation',
      'Transition Markers (However, Furthermore, Consequently, In Contrast)',
      'Paragraph Flow & Predicting Preceding/Following Passages',
      'Scanning for Specific Factual Evidence'
    ],
    competency: 'Students can identify the central message and thesis statement of a 400-word passage within 45 seconds.',
    conceptSummary: 'The main idea is typically stated in the first paragraph (introductory thesis) or last paragraph (concluding summary). Transitional words signal rhetorical shifts.',
    flashFormula: 'Quick Strategy: Look for repeating synonyms across paragraphs; whatever noun phrase appears consistently represents the true subject/topic of the passage.',
    academicSyllabusId: 'sil-4',
    academicSyllabusCode: 'SIL-BING-XII-04',
    linkedMaterialTitle: 'English Academic Literacy Toolkit: 100 Key Roots & Prefixes',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-lbe-02',
    code: 'MOD-LBE-02',
    subtestCode: 'LBE',
    subtestName: 'Literasi dalam Bahasa Inggris',
    category: 'Literasi',
    title: 'Tone Analysis, Contextual Inference & Paired Passage Synthesis',
    phaseNumber: 4,
    phaseName: 'Fase 4: Drill Kecepatan & Tryout IRT',
    weekNumber: 16,
    targetScoreIrt: 770,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Sarah Maharani, S.Pd., M.Ed.',
    description: 'Detecting author attitude (optimistic, critical, objective, skeptical), deciphering academic jargon from context clues, and cross-comparing Passage A and B.',
    subtopics: [
      'Author Tone Vocabulary (Neutral, Cynical, Commendatory, Concerned)',
      'Context Clue Techniques (Definition, Contrast, Restatement)',
      'Drawing Logical Deductive Inferences without Over-generalization',
      'Comparative Dual Passage Matrix'
    ],
    competency: 'Deciphering nuanced author perspectives and contrasting viewpoints between two opposing scientific articles.',
    conceptSummary: 'Tone is detected through adjectives and modal verbs. If author uses "alarmingly, unfortunately", tone is concerned/critical. If purely data-driven, tone is objective.',
    flashFormula: 'Inference Rule: An inference must be 100% logically supported by textual evidence. Reject choices that sound true in real life but are unmentioned in the text.',
    academicSyllabusId: 'sil-4',
    sampleQuestionCount: 20,
    isOfficialBlueprint: true
  },

  // ================= 7. SUBTES PENALARAN MATEMATIKA (PM) =================
  {
    id: 'mod-pm-01',
    code: 'MOD-PM-01',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    title: 'Pemodelan Kontekstual Nyata, Aritmetika Sosial & Laju Perubahan',
    phaseNumber: 2,
    phaseName: 'Fase 2: Pendalaman Trik Cepat',
    weekNumber: 10,
    targetScoreIrt: 760,
    durationMinutes: 90,
    difficulty: 'MENENGAH',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Menerjemahkan narasi soal cerita panjang ke model matematika: diskon bertingkat, perpajakan, bunga bank majemuk, kecepatan berpapasan/menyusul.',
    subtopics: [
      'Diskon Ganda / Bertingkat (Diskon x% + y%)',
      'Bunga Tunggal & Bunga Majemuk Perbankan',
      'Kecepatan Relatif, Jarak Bertemu & Waktu Menyusul',
      'Perbandingan Senilai & Berbalik Nilai Bertingkat'
    ],
    competency: 'Merumuskan persamaan aljabar dari deskripsi studi kasus bisnis/fisika terapan dalam waktu < 45 detik.',
    conceptSummary: 'Diskon bertingkat a% + b% BUKAN (a+b)%. Harga Akhir = Harga Awal * (1 - a/100) * (1 - b/100). Total Diskon = a + b - (a*b)/100 %.',
    flashFormula: 'Rumus Cepat Diskon Ganda: Diskon Efektif = (a + b) - (a x b / 100)%. Sangat cepat menghitung diskon mall 50% + 20% = 70 - 10 = 60%!',
    academicSyllabusId: 'sil-1',
    academicSyllabusCode: 'SIL-MTK-XII-01',
    linkedMaterialTitle: 'Modul Penalaran Matematika Realistis SNBT 2026',
    linkedMaterialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    linkedMaterialType: 'PDF',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },
  {
    id: 'mod-pm-02',
    code: 'MOD-PM-02',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    title: 'Optimasi Biaya Maksimum/Minimum & Geometri Aplikasi Ruang Nyata',
    phaseNumber: 4,
    phaseName: 'Fase 4: Drill Kecepatan & Tryout IRT',
    weekNumber: 17,
    targetScoreIrt: 800,
    durationMinutes: 90,
    difficulty: 'HOTS',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Menentukan nilai optimum biaya minimum, kapasitas maksimum bak penampungan air, rute terpendek, dan integrasi grafik fungsi laju.',
    subtopics: [
      'Nilai Optimum Fungsi Kuadrat & Turunan Pertama (f\'(x) = 0)',
      'Geometri Ruang Terapan: Luas Permukaan Kemasan & Volume Efektif',
      'Analisis Grafik Laju Pengisian Air vs Waktu',
      'Statistika Terapan & Regresi Linier Sederhana'
    ],
    competency: 'Menyelesaikan permasalahan optimasi multidimensi yang menggabungkan kalkulus dasar, aljabar, dan interpretasi grafik.',
    conceptSummary: 'Nilai optimum terjadi saat turunan pertama f\'(x) = 0 atau pada titik puncak parabola x = -b/(2a). Substitusikan x optimum ke fungsi biaya.',
    flashFormula: 'Trik Cepat Persegi Panjang Maksimum: Untuk keliling K tetap, luas daerah akan MAKSIMUM jika bentuknya berupa Persegi (Panjang = Lebar = K/4).',
    academicSyllabusId: 'sil-1',
    sampleQuestionCount: 15,
    isOfficialBlueprint: true
  },

  // ================= 8. FASE 5: FINAL REVIEW & PREDIKSI AKBAR =================
  {
    id: 'mod-rev-01',
    code: 'MOD-REV-01',
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    title: 'Final Marathon Drill 7 Subtes: Speed & Accuracy Simulation',
    phaseNumber: 5,
    phaseName: 'Fase 5: Final Review & Mental Prep',
    weekNumber: 19,
    targetScoreIrt: 820,
    durationMinutes: 195,
    difficulty: 'HOTS',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Simulasi utuh 155 butir soal 7 subtes dalam 195 menit nonstop sesuai kondisi asli Pusat UTBK PTN dengan pemeringkatan sistem IRT.',
    subtopics: [
      'Simulasi CBT 155 Soal 7 Subtes Nonstop 195 Menit',
      'Manajemen Stamina Mental & Pencegahan Brain Fog',
      'Protokol Eliminasi Cepat Opsi Jawaban Meragukan',
      'Strategi Pengisian Lembar Jawaban & Timer Sesi'
    ],
    competency: 'Mencapai target skor akumulasi IRT > 750 dengan tingkat akurasi di atas 85% pada seluruh 7 subtes resmi.',
    conceptSummary: 'Ujian UTBK adalah maraton mental. Kunci sukses adalah disiplin alokasi waktu per soal: jika macet > 90 detik, tandai ragu dan lewati segera.',
    flashFormula: 'Protokol Darurat: Gunakan teknik eliminasi 2 opsi paling mustahil, lalu pilih jawaban paling logis di antara 2 opsi tersisa.',
    academicSyllabusId: 'sil-1',
    linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)',
    sampleQuestionCount: 155,
    isOfficialBlueprint: true
  }
];

// Ploting 20 Pekan Timeline Pembelajaran Terpadu SNBT
export const SNBT_WEEKLY_PLOTTING: SnbtWeeklyPlottingItem[] = [
  {
    weekNumber: 1,
    phaseNumber: 1,
    phaseTitle: 'Fase 1: Konsep Dasar',
    dateRange: 'Pekan 1 (Bulan 1)',
    focusTitle: 'Diagnostik & Fondasi Penalaran Deduktif',
    targetIrtRange: '550 - 620',
    sessionCount: 4,
    moduleCodes: ['MOD-PU-01'],
    activities: ['Pre-test Diagnostik 7 Subtes', 'Bedah Silogisme Formal & Modus Ponens', 'Pengenalan Sistem IRT SNPMB'],
    examTarget: 'Kuis Diagnostik Mandiri'
  },
  {
    weekNumber: 2,
    phaseNumber: 1,
    phaseTitle: 'Fase 1: Konsep Dasar',
    dateRange: 'Pekan 2 (Bulan 1)',
    focusTitle: 'Ekstraksi Ide Pokok Wacana PPU',
    targetIrtRange: '580 - 640',
    sessionCount: 4,
    moduleCodes: ['MOD-PPU-01'],
    activities: ['Bedah Gagasan Utama Paragraf Deduktif-Induktif', 'Latihan Speed Reading 20 Teks', 'Review Kesalahan Pre-test'],
    examTarget: 'Drill Soal PPU 20 Butir'
  },
  {
    weekNumber: 3,
    phaseNumber: 1,
    phaseTitle: 'Fase 1: Konsep Dasar',
    dateRange: 'Pekan 3 (Bulan 1)',
    focusTitle: 'Mastery Ejaan EYD V & Tanda Baca PBM',
    targetIrtRange: '600 - 660',
    sessionCount: 4,
    moduleCodes: ['MOD-PBM-01'],
    activities: ['Aturan Huruf Kapital & Miring', '12 Pengecualian Partikel Pun', 'Koreksi Teks Rusak'],
    examTarget: 'Kuis Ejaan PBM Online'
  },
  {
    weekNumber: 4,
    phaseNumber: 1,
    phaseTitle: 'Fase 1: Konsep Dasar',
    dateRange: 'Pekan 4 (Bulan 1)',
    focusTitle: 'Fondasi Aljabar & Eksponen PK',
    targetIrtRange: '620 - 680',
    sessionCount: 4,
    moduleCodes: ['MOD-PK-01'],
    activities: ['Faktorisasi Aljabar Istimewa', 'Akar-akar Vieta Persamaan Kuadrat', 'Fungsi Invers Cepat'],
    examTarget: 'Tryout Evaluasi Bulanan 1'
  },
  {
    weekNumber: 5,
    phaseNumber: 1,
    phaseTitle: 'Fase 1: Konsep Dasar',
    dateRange: 'Pekan 5 (Bulan 2)',
    focusTitle: 'Membaca Kritis Teks Sains LBI',
    targetIrtRange: '630 - 690',
    sessionCount: 4,
    moduleCodes: ['MOD-LBI-01'],
    activities: ['Bedah Teks Jurnal Saintifik Populer', 'Pemetaan Premis dan Bukti Argumen', 'Teknik Scanning Parafrasa'],
    examTarget: 'Drill Literasi BI 30 Soal'
  },
  {
    weekNumber: 6,
    phaseNumber: 2,
    phaseTitle: 'Fase 2: Pendalaman Trik',
    dateRange: 'Pekan 6 (Bulan 2)',
    focusTitle: 'Kausalitas & Generalisasi Induktif PU',
    targetIrtRange: '650 - 710',
    sessionCount: 4,
    moduleCodes: ['MOD-PU-02'],
    activities: ['Analisis Argumen Memperlemah vs Memperkuat', 'Studi Kasus Korelasi vs Sebab-Akibat', 'Trik Logika Gambar'],
    examTarget: 'Kuis Penalaran Induktif'
  },
  {
    weekNumber: 7,
    phaseNumber: 2,
    phaseTitle: 'Fase 2: Pendalaman Trik',
    dateRange: 'Pekan 7 (Bulan 2)',
    focusTitle: 'Semantik & Sinonim Kontekstual PPU',
    targetIrtRange: '660 - 720',
    sessionCount: 4,
    moduleCodes: ['MOD-PPU-02'],
    activities: ['Analisis Makna Konotasi vs Denotasi', 'Uji Substitusi Kata dalam Wacana', 'Kata Serapan & KBBI V'],
    examTarget: 'Drill PPU HOTS 20 Soal'
  },
  {
    weekNumber: 8,
    phaseNumber: 2,
    phaseTitle: 'Fase 2: Pendalaman Trik',
    dateRange: 'Pekan 8 (Bulan 2)',
    focusTitle: 'Format Khusus Kecukupan Data & P vs Q (PK)',
    targetIrtRange: '680 - 740',
    sessionCount: 4,
    moduleCodes: ['MOD-PK-02'],
    activities: ['Matriks 5 Opsi Kecukupan Data', 'Counter-Example Angka Pecahan & Nol', 'Trik Eliminasi Opsi Soal P vs Q'],
    examTarget: 'Tryout Evaluasi Bulanan 2'
  },
  {
    weekNumber: 9,
    phaseNumber: 2,
    phaseTitle: 'Fase 2: Pendalaman Trik',
    dateRange: 'Pekan 9 (Bulan 3)',
    focusTitle: 'Academic Skimming & Discourse Markers (LBE)',
    targetIrtRange: '690 - 745',
    sessionCount: 4,
    moduleCodes: ['MOD-LBE-01'],
    activities: ['Skimming 400-word Expository Passages', 'Identifying Discourse Transition Words', 'Synonym Tracing & Main Idea Drills'],
    examTarget: 'Drill English Literacy 20 Soal'
  },
  {
    weekNumber: 10,
    phaseNumber: 2,
    phaseTitle: 'Fase 2: Pendalaman Trik',
    dateRange: 'Pekan 10 (Bulan 3)',
    focusTitle: 'Aritmetika Finansial & Pemodelan Nyata (PM)',
    targetIrtRange: '700 - 755',
    sessionCount: 4,
    moduleCodes: ['MOD-PM-01'],
    activities: ['Rumus Cepat Diskon Ganda', 'Bunga Majemuk & Angsuran Bank', 'Kecepatan Papasan & Salip'],
    examTarget: 'Kuis Penalaran Matematika'
  },
  {
    weekNumber: 11,
    phaseNumber: 3,
    phaseTitle: 'Fase 3: Bedah Soal HOTS',
    dateRange: 'Pekan 11 (Bulan 3)',
    focusTitle: 'Deret Simbolik Bertingkat & Matriks Logika (PU)',
    targetIrtRange: '720 - 770',
    sessionCount: 4,
    moduleCodes: ['MOD-PU-03'],
    activities: ['Operasi Lambang Unik @ # *', 'Deret Loncat Dua & Bertingkat 2', 'Trik Speed Solving 50 Detik'],
    examTarget: 'Tryout Akbar SNBT Paket 1'
  },
  {
    weekNumber: 12,
    phaseNumber: 3,
    phaseTitle: 'Fase 3: Bedah Soal HOTS',
    dateRange: 'Pekan 12 (Bulan 3)',
    focusTitle: 'Rekonstruksi Kalimat Efektif Ilmiah (PBM)',
    targetIrtRange: '730 - 775',
    sessionCount: 4,
    moduleCodes: ['MOD-PBM-02'],
    activities: ['Analisis Kerancuan Subjek & Predikat', 'Keparalelan Afiksasi Kata', 'Rekonstruksi Paragraf Rusak'],
    examTarget: 'Drill PBM HOTS 20 Soal'
  },
  {
    weekNumber: 13,
    phaseNumber: 3,
    phaseTitle: 'Fase 3: Bedah Soal HOTS',
    dateRange: 'Pekan 13 (Bulan 4)',
    focusTitle: 'Geometri Luas Arsir & Kombinatorika (PK)',
    targetIrtRange: '740 - 790',
    sessionCount: 4,
    moduleCodes: ['MOD-PK-03'],
    activities: ['Rasio Luas Bangun Sebangun', 'Permutasi Siklis & Kombinasi Bersyarat', 'Peluang Kejadian Majemuk'],
    examTarget: 'Drill PK HOTS 15 Soal'
  },
  {
    weekNumber: 14,
    phaseNumber: 3,
    phaseTitle: 'Fase 3: Bedah Soal HOTS',
    dateRange: 'Pekan 14 (Bulan 4)',
    focusTitle: 'Sintesis Multiteks & Infografis Multimoda (LBI)',
    targetIrtRange: '750 - 795',
    sessionCount: 4,
    moduleCodes: ['MOD-LBI-02'],
    activities: ['Komparasi Teks 1 vs Teks 2 Kontroversial', 'Analisis Grafik Batang & Tren Statistik', 'Evaluasi Dampak Kebijakan'],
    examTarget: 'Tryout Akbar SNBT Paket 2'
  },
  {
    weekNumber: 15,
    phaseNumber: 4,
    phaseTitle: 'Fase 4: Speed Drill & IRT',
    dateRange: 'Pekan 15 (Bulan 4)',
    focusTitle: 'Speed Drill TPS: 85 Soal dalam 90 Menit',
    targetIrtRange: '755 - 805',
    sessionCount: 5,
    moduleCodes: ['MOD-PU-01', 'MOD-PPU-01', 'MOD-PBM-01', 'MOD-PK-01'],
    activities: ['Simulasi TPS Full Block Timed Session', 'Analisis Butir Soal Sulit & Distraktor', 'Strategi Skip & Flag'],
    examTarget: 'Simulasi TPS Terpadu'
  },
  {
    weekNumber: 16,
    phaseNumber: 4,
    phaseTitle: 'Fase 4: Speed Drill & IRT',
    dateRange: 'Pekan 16 (Bulan 4)',
    focusTitle: 'Tone Analysis & Dual Passage Inferences (LBE)',
    targetIrtRange: '760 - 810',
    sessionCount: 4,
    moduleCodes: ['MOD-LBE-02'],
    activities: ['Detecting Author Attitude & Tone Nuances', 'Contextual Academic Vocabulary Drills', 'Timed 20-question Speed Run'],
    examTarget: 'Drill English Literacy HOTS'
  },
  {
    weekNumber: 17,
    phaseNumber: 4,
    phaseTitle: 'Fase 4: Speed Drill & IRT',
    dateRange: 'Pekan 17 (Bulan 5)',
    focusTitle: 'Optimasi Biaya & Geometri Ruang Nyata (PM)',
    targetIrtRange: '770 - 815',
    sessionCount: 4,
    moduleCodes: ['MOD-PM-02'],
    activities: ['Optimasi Titik Puncak f\'(x) = 0', 'Volume Kemasan Maksimum', 'Analisis Laju Debit Pengisian'],
    examTarget: 'Drill Penalaran Matematika HOTS'
  },
  {
    weekNumber: 18,
    phaseNumber: 4,
    phaseTitle: 'Fase 4: Speed Drill & IRT',
    dateRange: 'Pekan 18 (Bulan 5)',
    focusTitle: 'Grand Tryout Nasional Prediksi Real UTBK',
    targetIrtRange: '780 - 830',
    sessionCount: 5,
    moduleCodes: ['MOD-PU-03', 'MOD-PK-03', 'MOD-LBI-02'],
    activities: ['Tryout CBT Real-Time 155 Butir Soal', 'Pemeringkatan Nasional & Ranking IRT', 'Konsultasi Penyesuaian Pilihan Prodi PTN'],
    examTarget: 'Grand Tryout Nasional 2026'
  },
  {
    weekNumber: 19,
    phaseNumber: 5,
    phaseTitle: 'Fase 5: Final Review',
    dateRange: 'Pekan 19 (Bulan 5)',
    focusTitle: 'Final Marathon Drill 7 Subtes Nonstop (195 Menit)',
    targetIrtRange: '800 - 850+',
    sessionCount: 5,
    moduleCodes: ['MOD-REV-01'],
    activities: ['Full Marathon 155 Soal Nonstop', 'Bedah Rumus Kilat & Flash Cards 7 Subtes', 'Konsolidasi Kelemahan Tiap Subtes'],
    examTarget: 'Final Simulation UTBK 2026'
  },
  {
    weekNumber: 20,
    phaseNumber: 5,
    phaseTitle: 'Fase 5: Final Review',
    dateRange: 'Pekan 20 (Hari H)',
    focusTitle: 'Mental Prep, Checklist Dokumen & Ready to Win',
    targetIrtRange: '820 - 880+ Top Tier',
    sessionCount: 3,
    moduleCodes: ['MOD-REV-01'],
    activities: ['Review Flash Formula Cheat Sheet', 'Simulasi Alur Masuk Ruang Ujian & ID Card', 'Briefing Mental & Doa Bersama'],
    examTarget: 'Ujian UTBK-SNBT Hari H'
  }
];

// Helper Storage Keys
const STORAGE_PREFIX_PROGRESS = 'bsa_snbt_module_progress_';
const STORAGE_CUSTOM_MODULES = 'bsa_snbt_custom_modules';

// Load User Progress Map
export function loadUserSnbtModuleProgress(userId: string): Record<string, SnbtModuleUserProgress> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_PROGRESS}${userId}`);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading module progress', e);
    return {};
  }
}

// Save User Progress Map
export function saveUserSnbtModuleProgress(
  userId: string,
  progress: Record<string, SnbtModuleUserProgress>
): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX_PROGRESS}${userId}`, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving module progress', e);
  }
}

// Load Modules (combining initial blueprint + custom stored modules)
export function loadSnbtSyllabusModules(): SnbtSyllabusModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_MODULES);
    if (!raw) return INITIAL_SNBT_SYLLABUS_MODULES;
    const customList: SnbtSyllabusModule[] = JSON.parse(raw);
    
    // Merge without duplicates by id
    const merged = [...INITIAL_SNBT_SYLLABUS_MODULES];
    customList.forEach(custom => {
      const idx = merged.findIndex(m => m.id === custom.id);
      if (idx >= 0) {
        merged[idx] = custom;
      } else {
        merged.push(custom);
      }
    });
    return merged;
  } catch (e) {
    console.error('Error loading snbt syllabus modules', e);
    return INITIAL_SNBT_SYLLABUS_MODULES;
  }
}

// Save/Update Module (for Admin / Guru)
export function saveSnbtSyllabusModule(module: SnbtSyllabusModule): SnbtSyllabusModule[] {
  try {
    const all = loadSnbtSyllabusModules();
    const idx = all.findIndex(m => m.id === module.id);
    let updated: SnbtSyllabusModule[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = module;
    } else {
      updated = [module, ...all];
    }
    localStorage.setItem(STORAGE_CUSTOM_MODULES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving snbt syllabus module', e);
    return loadSnbtSyllabusModules();
  }
}

// Delete Module (for Admin)
export function deleteSnbtSyllabusModule(moduleId: string): SnbtSyllabusModule[] {
  try {
    const all = loadSnbtSyllabusModules().filter(m => m.id !== moduleId);
    localStorage.setItem(STORAGE_CUSTOM_MODULES, JSON.stringify(all));
    return all;
  } catch (e) {
    console.error('Error deleting snbt syllabus module', e);
    return loadSnbtSyllabusModules();
  }
}

// ============================================================================
// 7 OFFICIAL SNBT ACADEMIC SYLLABI BLUEPRINT (Integrated with Akademik Silabus)
// ============================================================================
export const OFFICIAL_SNBT_7_ACADEMIC_SYLLABI: SyllabusItem[] = [
  {
    id: 'sil-pu',
    code: 'SIL-PU-XII-01',
    title: 'Silabus Penalaran Umum (PU) SNBT - Silogisme, Induktif, Deduktif & Logika Kuantitatif',
    subject: 'Penalaran Umum (PU)',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Penalaran Umum (30 butir soal, 30 menit). Meliputi silogisme klasik, modus ponens/tollens, penalaran induktif kausalitas, deret bilangan & huruf bertingkat, operasi lambang unik, penalaran analitis posisi, serta pola figural spasial.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'PU',
    snbtCategory: 'TPS',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-pu-1',
        meetingNumber: 1,
        title: 'Mastery Silogisme Formal, Kaidah Modus Ponens & Tollens',
        subtopics: ['Kaidah Modus Ponens & Modus Tollens', 'Silogisme Majemuk & Rantai Implikasi (p -> q -> r)', 'Hukum De Morgan & Negasi Kuantor (Semua vs Sebagian)', 'Trik Diagram Euler Cepat'],
        competency: 'Siswa mampu menarik simpulan valid dari 3 premis majemuk tanpa terkecoh pernyataan invers/konvers dalam < 45 detik.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Diagram Kebenaran',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      },
      {
        id: 'top-pu-2',
        meetingNumber: 2,
        title: 'Penalaran Induktif & Generalisasi Berdasarkan Fakta',
        subtopics: ['Argumen Memperkuat vs Memperlemah Simpulan', 'Pola Korelasi vs Kausalitas (Sebab-Akibat Nyata)', 'Penilaian Kebenaran Pernyataan Berdasarkan Data Wacana'],
        competency: 'Mengidentifikasi argumen yang paling kuat mendukung atau melemahkan hipotesis teks dalam waktu < 50 detik.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Studi Kasus & Bedah Soal HOTS'
      },
      {
        id: 'top-pu-3',
        meetingNumber: 3,
        title: 'Deret Simbolik, Pola Angka Bertingkat & Operasi Khusus',
        subtopics: ['Deret Pola Dua Jalur (Lompat) & Fibonacci Kompleks', 'Operasi Lambang Matematika Unik (Contoh: a @ b # c)', 'Matriks Angka dalam Bangun Datar Geometris'],
        competency: 'Menemukan aturan matematis tersembunyi pada pola bilangan/simbol unik dalam waktu < 40 detik.',
        durationMinutes: 90,
        teachingMethod: 'Speed Formula Drill & Latihan Mandiri'
      },
      {
        id: 'top-pu-4',
        meetingNumber: 4,
        title: 'Penalaran Kuantitatif Simpel dalam Teks (Word Problems)',
        subtopics: ['Ekstraksi Data Angka dari Teks Deskriptif', 'Perbandingan Rasio & Persentase Cepat', 'Kaidah Logika Nilai Ekstrem & Pertidaksamaan Sederhana'],
        competency: 'Menyelesaikan permasalahan kuantitatif terapan yang disajikan dalam bentuk narasi wacana secara cepat.',
        durationMinutes: 90,
        teachingMethod: 'Drill Soal Terstruktur & Timed Quiz'
      },
      {
        id: 'top-pu-5',
        meetingNumber: 5,
        title: 'Penalaran Analitis: Urutan Posisi & Penjadwalan Bersyarat',
        subtopics: ['Penataan Peringkat Nilai & Urutan Antrean', 'Posisi Duduk Meja Bundar & Berseberangan', 'Kombinasi Syarat Eliminasi Cepat dengan Metode Tabel Grid'],
        competency: 'Menyusun urutan posisi logis dari minimal 5 entitas dengan 4 syarat bersyarat dalam waktu < 60 detik.',
        durationMinutes: 90,
        teachingMethod: 'Metode Grid Matrix & Diskusi Interaktif'
      },
      {
        id: 'top-pu-6',
        meetingNumber: 6,
        title: 'Penalaran Spasial & Figural 2D/3D',
        subtopics: ['Rotasi Searah/Berlawanan Jarum Jam & Pencerminan Bangun', 'Kelanjutan Serial Pola Gambar Bergradasi', 'Jaring-jaring Kubus, Pola Lipatan Kertas & Matriks 3x3'],
        competency: 'Membayangkan transformasi spasial objek 2D/3D tanpa bantuan visual fisik secara akurat.',
        durationMinutes: 90,
        teachingMethod: 'Software Visualisasi Spasial & Bedah Opsi'
      },
      {
        id: 'top-pu-7',
        meetingNumber: 7,
        title: 'Trik Eliminasi Opsi & Manajemen Waktu 30 Menit 30 Soal',
        subtopics: ['Protokol Skip & Flag Soal Berdistraktor Tinggi', 'Identifikasi Jebakan Ekstrem (Selalu, Pasti, Tidak Pernah)', 'Strategi Menjaga Stamina Kognitif & Konsentrasi'],
        competency: 'Menguasai manajemen waktu 60 detik per butir soal dengan akurasi jawaban > 85%.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Waktu Realistis & Refleksi'
      },
      {
        id: 'top-pu-8',
        meetingNumber: 8,
        title: 'Simulasi Tryout Penalaran Umum Standar BPPP & Evaluasi IRT',
        subtopics: ['Simulasi CBT 30 Soal Berwaktu 30 Menit', 'Pembahasan Butir Soal Daya Beda Tinggi', 'Perhitungan Skor IRT & Analisis Kelemahan'],
        competency: 'Mencapai target skor IRT > 750 pada subtes Penalaran Umum.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT & Sesi Ulasan Intensif',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-ppu',
    code: 'SIL-PPU-XII-01',
    title: 'Silabus Pengetahuan & Pemahaman Umum (PPU) SNBT - Semantik, Makna Kontekstual & Kosakata Kritis',
    subject: 'Pengetahuan & Pemahaman Umum (PPU)',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Pengetahuan & Pemahaman Umum (20 butir soal, 15 menit). Berfokus pada pemahaman makna kata kontekstual, antonim/sinonim bernuansa, kata serapan, hubungan semantik, fungsi kalimat penjelas, serta sintesis gagasan pokok wacana.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'PPU',
    snbtCategory: 'TPS',
    createdAt: '2026-01-12',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-ppu-1',
        meetingNumber: 1,
        title: 'Ekstraksi Gagasan Pokok & Ide Pokok Wacana Ilmiah Padat',
        subtopics: ['Pola Deduktif, Induktif, dan Ineratif', 'Membedakan Topik, Gagasan Utama, dan Judul Teks', 'Speed Reading Scanning 25 Detik per Paragraf'],
        competency: 'Siswa mampu menentukan gagasan utama paragraf padat informasi dalam waktu < 30 detik.',
        durationMinutes: 90,
        teachingMethod: 'Speed Reading & Anotasi Wacana'
      },
      {
        id: 'top-ppu-2',
        meetingNumber: 2,
        title: 'Makna Kata Kontekstual: Denotasi vs Konotasi & Nuansa Makna',
        subtopics: ['Menafsirkan Kosakata Khusus/Jargon Ilmiah Sesuai Konteks', 'Uji Substitusi Kata Searti yang Tidak Mengubah Makna', 'Distinctions Nuansa Halus Emosi/Sikap Penulis'],
        competency: 'Menentukan padanan kata paling tepat yang selaras dengan pesan utama penulis wacana.',
        durationMinutes: 90,
        teachingMethod: 'Bedah Kamus KBBI V & Konteks Wacana'
      },
      {
        id: 'top-ppu-3',
        meetingNumber: 3,
        title: 'Hubungan Antar-Paragraf & Fungsi Kalimat Penjelas',
        subtopics: ['Kalimat Utama vs Kalimat Penjelas Mayor/Minor', 'Hubungan Sebab-Akibat, Penegasan, Perluasan & Pertentangan Antarparagraf', 'Analisis Paragraf Pengantar, Pengembang & Penutup'],
        competency: 'Membedah arsitektur wacana dan relasi logis antarbagian paragraf.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Struktur Teks Ilmiah'
      },
      {
        id: 'top-ppu-4',
        meetingNumber: 4,
        title: 'Pembentukan Kata Serapan, Morfologi & Kaidah EYD V',
        subtopics: ['Afiksasi Kompleks: meN-...-kan, peN-...-an, ke-...-an', 'Prinsip Penyerapan Kata Asing (Adopsi, Adaptasi, Penerjemahan)', 'Homofon, Homograf, Polisemi, dan Hiponim/Hipernim'],
        competency: 'Mengidentifikasi bentuk kata baku dan makna morfologis yang presisi.',
        durationMinutes: 90,
        teachingMethod: 'Drill Morfologi & Kuis Interaktif'
      },
      {
        id: 'top-ppu-5',
        meetingNumber: 5,
        title: 'Analogi Makna Kata & Asosiasi Semantik Khusus',
        subtopics: ['Hubungan Sebab-Akibat Kata (Pemicu -> Hasil)', 'Hubungan Bagian-Keseluruhan & Tingkat Intensitas', 'Trik Eliminasi Opsi Analogi Berpola Terbalik'],
        competency: 'Menyelesaikan pasangan analogi kata abstrak dalam waktu < 20 detik.',
        durationMinutes: 90,
        teachingMethod: 'Speed Drill & Analisis Pasangan Kata'
      },
      {
        id: 'top-ppu-6',
        meetingNumber: 6,
        title: 'Evaluasi Sikap, Nada (Tone) & Sudut Pandang Penulis',
        subtopics: ['Mendeteksi Sikap: Netral, Kritis, Skeptis, Optimis, Satiris', 'Tujuan Komunikatif Penulis (Menghibur, Membujuk, Mengkritik, Menginformasikan)', 'Asumsi Implisit yang Mendasari Pandangan Penulis'],
        competency: 'Menilai nada bicara dan keberpihakan penulis wacana secara objektif.',
        durationMinutes: 90,
        teachingMethod: 'Bedah Teks Editorial & Jurnal'
      },
      {
        id: 'top-ppu-7',
        meetingNumber: 7,
        title: 'Strategi Manajemen Waktu Subtes PPU (45 Detik per Soal)',
        subtopics: ['Trik Membaca Pertanyaan Sebelum Membaca Teks Penuh', 'Teknik Scanning Kata Kunci & Eliminasi Opsi Distraktor', 'Simulasi 20 Soal PPU dalam 15 Menit Nonstop'],
        competency: 'Mengerjakan seluruh butir soal PPU tepat waktu tanpa meninggalkan nomor kosong.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Berwaktu & Analisis Kesalahan'
      },
      {
        id: 'top-ppu-8',
        meetingNumber: 8,
        title: 'Simulasi Tryout PPU & Evaluasi IRT Target 760+',
        subtopics: ['Simulasi CBT 20 Butir Soal PPU', 'Pembahasan Komprehensif Opsi Jebakan', 'Penyusunan Lembar Refleksi Kelemahan'],
        competency: 'Mencapai ketuntasan materi PPU dengan nilai target IRT > 760.',
        durationMinutes: 90,
        teachingMethod: 'CBT Simulation & Feedback Session',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-3',
    code: 'SIL-PBM-XII-01',
    title: 'Silabus Pemahaman Bacaan & Menulis (PBM) SNBT - Kalimat Efektif, Ejaan EYD V & Kohesi Wacana',
    subject: 'Pemahaman Bacaan & Menulis (PBM)',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Pemahaman Bacaan & Menulis (20 butir soal, 25 menit). Menguji kemampuan menganalisis kalimat efektif, kohesi & koherensi wacana, penggabungan kalimat majemuk, konjungsi antarkalimat, ejaan EYD edisi V, serta perbaikan paragraf rumpang.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'PBM',
    snbtCategory: 'TPS',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-pbm-1',
        meetingNumber: 1,
        title: 'Struktur Kalimat Efektif & Syarat Kepengalimatannya',
        subtopics: ['Kehematan, Kesejajaran (Paralelisme), dan Kelogisan Kalimat', 'Kesepadanan Struktur (Subjek, Predikat, Objek, Keterangan)', 'Menghindari Kalimat Rancu & Pleonasme'],
        competency: 'Siswa mampu memperbaiki kalimat yang cacat struktur menjadi kalimat efektif baku dalam < 45 detik.',
        durationMinutes: 90,
        teachingMethod: 'Error Analysis & Rekonstruksi Kalimat'
      },
      {
        id: 'top-pbm-2',
        meetingNumber: 2,
        title: 'Kaidah Ejaan EYD Edisi V & Tanda Baca Presisi',
        subtopics: ['Penggunaan Huruf Kapital & Huruf Miring', 'Penulisan Kata Depan, Partikel, Singkatan & Akronim', 'Fungsi Koma (,), Titik Dua (:), Titik Koma (;), dan Tanda Hubung (-)'],
        competency: 'Mengoreksi kesalahan ejaan dan tanda baca pada teks narasi maupun ilmiah secara tepat.',
        durationMinutes: 90,
        teachingMethod: 'Drill Soal PBM & Quiz Interaktif'
      },
      {
        id: 'top-pbm-3',
        meetingNumber: 3,
        title: 'Konjungsi, Kohesi, & Koherensi Antar-Kalimat/Paragraf',
        subtopics: ['Konjungsi Koordinatif, Subordinatif, Korelatif & Antarkalimat', 'Kepaduan Paragraf & Kalimat Sumbang (Incoherent Sentence)', 'Prinsip Rujukan Kata & Substitusi Leksikal'],
        competency: 'Mengidentifikasi kalimat sumbang dan mengisi bagian rumpang dengan konjungsi presisi.',
        durationMinutes: 90,
        teachingMethod: 'Cloze Test & Analisis Wacana'
      },
      {
        id: 'top-pbm-4',
        meetingNumber: 4,
        title: 'Penggabungan & Transformasi Kalimat Majemuk',
        subtopics: ['Penggabungan 2 atau 3 Kalimat Tunggal Menjadi 1 Kalimat Majemuk Efektif', 'Inti Kalimat (Subjek Inti & Predikat Inti)', 'Transformasi Kalimat Pasif ke Aktif & Sebaliknya'],
        competency: 'Menentukan inti kalimat dan menyusun penggabungan kalimat tanpa mengaburkan makna.',
        durationMinutes: 90,
        teachingMethod: 'Sentence Combining Drills'
      },
      {
        id: 'top-pbm-5',
        meetingNumber: 5,
        title: 'Penataan Paragraf Padu & Kalimat Rumpang (Cloze Passage)',
        subtopics: ['Menyusun Urutan Kalimat Acak Menjadi Paragraf Logis', 'Melengkapi Kalimat Rumpang dalam Paragraf Argumentasi', 'Memilih Frasa yang Paling Tepat untuk Menyambung Gagasan'],
        competency: 'Membangun kembali alur pemikiran wacana yang padu dan runtut.',
        durationMinutes: 90,
        teachingMethod: 'Jigsaw Reading & Paragraph Assembly'
      },
      {
        id: 'top-pbm-6',
        meetingNumber: 6,
        title: 'Pembentukan Istilah & Tata Kalimat Berpola Paralel',
        subtopics: ['Keparalelan Bentuk Imbuhan dalam Rincian (Verba vs Nomina)', 'Kesesuaian Makna Istilah Baru Serapan dengan Konteks', 'Pilihan Kata (Diksi) Baku Berdasarkan Ragam Formal'],
        competency: 'Menerapkan paralelisme struktur bahasa secara konsisten.',
        durationMinutes: 90,
        teachingMethod: 'Parallelism Workshops'
      },
      {
        id: 'top-pbm-7',
        meetingNumber: 7,
        title: 'Speed Strategy PBM: Trik Eliminasi Opsi Menjebak',
        subtopics: ['Identifikasi Cepat Opsi Jawaban Berlebihan (Pleonasme)', 'Pengecekan Tanda Koma Sebelum Konjungsi Subordinatif (Karena, Sehingga)', 'Manajemen Waktu 75 Detik per Butir Soal PBM'],
        competency: 'Meningkatkan kecepatan analisis teks dan akurasi opsi jawaban > 90%.',
        durationMinutes: 90,
        teachingMethod: 'Timed Speed Runs & Opsi Elimination Strategy'
      },
      {
        id: 'top-pbm-8',
        meetingNumber: 8,
        title: 'Simulasi Tryout PBM & Evaluasi Akumulasi IRT',
        subtopics: ['Simulasi CBT 20 Soal PBM Berwaktu 25 Menit', 'Pembahasan Lengkap Soal Berbobot IRT Tinggi', 'Refleksi Hasil Belajar Siswa'],
        competency: 'Mencapai target skor IRT > 750 pada subtes Pemahaman Bacaan & Menulis.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT & Pembahasan Interaktif',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-1',
    code: 'SIL-PK-XII-01',
    title: 'Silabus Pengetahuan Kuantitatif (PK) SNBT - Aljabar, Geometri, Teori Bilangan & Kecukupan Data',
    subject: 'Pengetahuan Kuantitatif (PK)',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Pengetahuan Kuantitatif (15 butir soal, 20 menit). Berfokus pada aljabar murni, teori bilangan, persamaan kuadrat, geometri dimensi 2 & 3, kombinatorika peluang, matriks, serta format khusus UTBK: Kecukupan Data (Pernyataan 1 & 2) dan Hubungan Kuantitas (P vs Q).',
    totalMeetings: 12,
    status: 'ACTIVE',
    snbtSubtestCode: 'PK',
    snbtCategory: 'TPS',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-pk-1',
        meetingNumber: 1,
        title: 'Sistem Bilangan, Operasi Eksponen & Pola Bilangan Real',
        subtopics: ['Sifat-sifat Bilangan Real & Pecahan Berulang', 'Aturan Eksponen, Bentuk Akar & Logaritma Cepat', 'Pola Barisan Aritmetika & Geometri Bertingkat'],
        competency: 'Siswa mampu menyelesaikan persoalan aritmetika & aljabar eksponensial dalam waktu < 45 detik per soal.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Drill Soal SNBT'
      },
      {
        id: 'top-pk-2',
        meetingNumber: 2,
        title: 'Aljabar, Persamaan Kuadrat & Sistem Persamaan Linier',
        subtopics: ['Faktorisasi Aljabar Istimewa (a^2 - b^2, a^3 +- b^3)', 'Sifat Akar-Akar Persamaan Kuadrat (Teorema Vieta)', 'Sistem Persamaan Linier Dua & Tiga Variabel (SPLDV/SPLTV)'],
        competency: 'Menyelesaikan manipulasi aljabar tingkat lanjut tanpa perhitungan panjang.',
        durationMinutes: 90,
        teachingMethod: 'Ceramah Interaktif & Latihan Cepat'
      },
      {
        id: 'top-pk-3',
        meetingNumber: 3,
        title: 'Fungsi, Operasi Komposisi & Fungsi Invers',
        subtopics: ['Domain, Kodomain & Range Pemetaan', 'Operasi Aljabar Fungsi & Komposisi f(g(x))', 'Fungsi Invers & Transformasi Grafik'],
        competency: 'Memahami manipulasi fungsi bersusun dan grafik pemetaan untuk penalaran kuantitatif.',
        durationMinutes: 90,
        teachingMethod: 'Visualisasi Geogebra & Diskusi Kasus'
      },
      {
        id: 'top-pk-4',
        meetingNumber: 4,
        title: 'Geometri Dimensi Dua (Bangun Datar) & Teorema Sudut',
        subtopics: ['Luas & Keliling Segitiga, Segiempat, Lingkaran', 'Teorema Pythagoras & Kesebangunan Bangun Datar', 'Garis Singgung Lingkaran & Sudut Pusat/Keliling'],
        competency: 'Menganalisis luas daerah terarsir dan hubungan kesebangunan geometri analitik.',
        durationMinutes: 90,
        teachingMethod: 'Drill Soal Visual & Latihan Mandiri'
      },
      {
        id: 'top-pk-5',
        meetingNumber: 5,
        title: 'Geometri Dimensi Tiga (Bangun Ruang) & Jarak Titik/Bidang',
        subtopics: ['Volume & Luas Permukaan Kubus, Balok, Tabung, Kerucut, Bola', 'Jarak Titik ke Titik, Titik ke Garis, Titik ke Bidang', 'Sudut Antara Dua Garis & Bidang'],
        competency: 'Membayangkan proyeksi 3D dan menentukan jarak serta sudut pada bangun ruang.',
        durationMinutes: 90,
        teachingMethod: 'Model 3D Interaktif & Pembahasan Soal HOTS'
      },
      {
        id: 'top-pk-6',
        meetingNumber: 6,
        title: 'Statistika Deskriptif & Interpretasi Sajian Data',
        subtopics: ['Mean, Median, Modus data tunggal & kelompok', 'Kuartil, Jangkauan Interkuartil & Simpangan Baku', 'Interpretasi Diagram Batang, Garis, Lingkaran & Box Plot'],
        competency: 'Membaca dan menarik kesimpulan matematis dari sajian data statistik kompleks.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Studi Kasus Data Nyata & Latihan Soal'
      },
      {
        id: 'top-pk-7',
        meetingNumber: 7,
        title: 'Kaidah Pencacahan, Permutasi, & Kombinasi',
        subtopics: ['Aturan Penjumlahan & Perkalian', 'Permutasi Unsur Berbeda, Unsur Sama & Siklis', 'Kombinasi & Ekspansi Binomial Newton'],
        competency: 'Menerapkan kaidah pencacahan untuk menentukan banyaknya cara susunan dan pemilihan.',
        durationMinutes: 90,
        teachingMethod: 'Problem Solving Terstruktur'
      },
      {
        id: 'top-pk-8',
        meetingNumber: 8,
        title: 'Teori Peluang & Kejadian Majemuk',
        subtopics: ['Peluang Kejadian Tunggal & Frekuensi Harapan', 'Peluang Kejadian Saling Lepas & Saling Bebas', 'Peluang Bersyarat (Conditional Probability)'],
        competency: 'Menghitung probabilitas peristiwa bersyarat dan mengaplikasikannya dalam simulasi SNBT.',
        durationMinutes: 90,
        teachingMethod: 'Studi Kasus Game Probabilitas & Bedah Soal'
      },
      {
        id: 'top-pk-9',
        meetingNumber: 9,
        title: 'Format Khusus: Kecukupan Data (Pernyataan 1 & 2)',
        subtopics: ['Struktur 5 Opsi Standar Soal Kecukupan Data SNBT', 'Strategi Eliminasi Opsi A, B, C, D, E', 'Trik Menguji Kecukupan Informasi Tanpa Menghitung Angka Akhir'],
        competency: 'Menguasai metode penentuan kecukupan data informasi dalam waktu < 45 detik.',
        durationMinutes: 90,
        teachingMethod: 'Bedah Trik Strategi & Speed Test CBT'
      },
      {
        id: 'top-pk-10',
        meetingNumber: 10,
        title: 'Format Khusus: Perbandingan Kuantitas (P versus Q)',
        subtopics: ['Format Soal Hubungan Nilai P dan Q', 'Penggunaan Counter-Example (Bilangan Negatif, Nol, Pecahan 0 < x < 1)', 'Trik Cepat Menentukan Hubungan P > Q, Q > P, P = Q'],
        competency: 'Menentukan relasi kuantitas P dan Q dengan ketelitian tinggi tanpa bias asumsi.',
        durationMinutes: 90,
        teachingMethod: 'Counter Example Strategy Workshops'
      },
      {
        id: 'top-pk-11',
        meetingNumber: 11,
        title: 'Matriks, Vektor & Transformasi Geometri',
        subtopics: ['Determinan & Invers Matriks 2x2', 'Operasi Matriks pada SPLDV', 'Translasi, Refleksi, Rotasi & Dilatasi'],
        competency: 'Menyelesaikan permasalahan matriks dan transformasi titik/kurva secara efisien.',
        durationMinutes: 90,
        teachingMethod: 'Matrix Manipulation & Problem Solving'
      },
      {
        id: 'top-pk-12',
        meetingNumber: 12,
        title: 'Tryout Akbar Pengetahuan Kuantitatif & Evaluasi IRT Target 780+',
        subtopics: ['Simulasi 15 Soal PK dalam 20 Menit Nonstop', 'Analisis IRT & Scoring Akurasi', 'Rencana Remedial & Penguatan Sub-Topik'],
        competency: 'Mengevaluasi kesiapan mental dan ketepatan strategi manajemen waktu siswa.',
        durationMinutes: 90,
        teachingMethod: 'Tryout CBT Digital & Comprehensive Feedback',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-lbi',
    code: 'SIL-LBI-XII-01',
    title: 'Silabus Literasi dalam Bahasa Indonesia (LBI) SNBT - Sintesis Teks Jamak & Analisis Kritis',
    subject: 'Literasi Bahasa Indonesia',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Literasi dalam Bahasa Indonesia (30 butir soal, 45 menit). Menguji kemampuan memahami, menggunakan, mengevaluasi, dan merefleksikan teks multimodal informasi saintifik, sosial-humaniora, dan narasi sastra kompleks untuk mencapai tujuan dan mengembangkan potensi.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'LBI',
    snbtCategory: 'Literasi',
    createdAt: '2026-01-16',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-lbi-1',
        meetingNumber: 1,
        title: 'Membaca Kritis Wacana Saintifik & Humaniora',
        subtopics: ['Menemukan Informasi Tersurat & Tersirat dalam Teks Panjang', 'Membedakan Fakta Objektif vs Klaim/Opini Penulis', 'Anotasi Cepat Paragraf Deskriptif & Ekspositori'],
        competency: 'Siswa mampu mengekstrak pesan inti dari wacana 600 kata dalam waktu < 90 detik.',
        durationMinutes: 90,
        teachingMethod: 'Critical Reading & Anotasi Wacana'
      },
      {
        id: 'top-lbi-2',
        meetingNumber: 2,
        title: 'Rekonstruksi Ide, Tema & Asumsi Mendasar Penulis',
        subtopics: ['Menyimpulkan Tujuan Penulisan Teks', 'Menganalisis Asumsi yang Menjadi Landasan Argumen', 'Mengevaluasi Keberpihakan & Objektivitas Penulis'],
        competency: 'Mengidentifikasi premis implisit dan tujuan komunikatif pengarang secara tepat.',
        durationMinutes: 90,
        teachingMethod: 'Text Deconstruction Workshops'
      },
      {
        id: 'top-lbi-3',
        meetingNumber: 3,
        title: 'Komparasi Dua Teks Jamak (Dual Passage Synthesis)',
        subtopics: ['Membandingkan Sudut Pandang Teks 1 dan Teks 2 tentang Isu Sama', 'Menentukan Poin Kesepakatan & Pertentangan Antarpenulis', 'Sintesis Argumen Gabungan dari Kedua Wacana'],
        competency: 'Menyandingkan dua artikel berbeda perspektif dan merumuskan benang merahnya.',
        durationMinutes: 90,
        teachingMethod: 'Comparative Text Analysis & Diskusi'
      },
      {
        id: 'top-lbi-4',
        meetingNumber: 4,
        title: 'Integrasi Data Multimoda: Teks, Tabel, Grafik & Infografis',
        subtopics: ['Membaca Data Grafik Batang, Garis, dan Diagram Lingkaran dalam Teks', 'Memvalidasi Kesesuaian Pernyataan Teks dengan Data Statistik Visual', 'Menarik Simpulan Kritis dari Infografis Kebijakan Publik'],
        competency: 'Menghubungkan sajian data visual infografik dengan ulasan teks pendukung.',
        durationMinutes: 90,
        teachingMethod: 'Multimodal Infographic Drills'
      },
      {
        id: 'top-lbi-5',
        meetingNumber: 5,
        title: 'Analisis Kekuatan Argumen & Kredibilitas Bukti',
        subtopics: ['Menguji Validitas Bukti Empiris yang Disajikan Penulis', 'Mendeteksi Fallacy (Kesesatan Berpikir) dalam Argumen Opini', 'Menilai Apakah Bukti Cukup Kuat untuk Menopang Simpulan'],
        competency: 'Mengevaluasi ketangguhan penalaran logis dalam teks argumentatif.',
        durationMinutes: 90,
        teachingMethod: 'Argument Mapping & Critical Debate'
      },
      {
        id: 'top-lbi-6',
        meetingNumber: 6,
        title: 'Apresiasi Teks Narasi, Cerpen & Makna Simbolik',
        subtopics: ['Menganalisis Nilai Kehidupan, Moral, dan Karakter Tokoh', 'Menafsirkan Majas, Simbol, dan Makna Metaforis dalam Wacana', 'Menghubungkan Latar Cerita dengan Konteks Sosial Nyata'],
        competency: 'Memahami lapisan makna terselubung dan pesan moral dari teks naratif.',
        durationMinutes: 90,
        teachingMethod: 'Literary Analysis & Hermeneutic Discussion'
      },
      {
        id: 'top-lbi-7',
        meetingNumber: 7,
        title: 'Speed Strategy LBI: Manajemen Waktu 45 Menit 30 Soal',
        subtopics: ['Teknik Skimming Teks Sebelum Soal vs Soal Dulu Baru Cari Teks', 'Trik Mengeliminasi Opsi Jawaban yang Terlalu Luas/Terlalu Sempit', 'Protokol Menghindari Brain Fog pada Bacaan Panjang'],
        competency: 'Mengoptimalkan alokasi waktu 90 detik per butir soal dengan akurasi prima.',
        durationMinutes: 90,
        teachingMethod: 'Timed Reading Simulation'
      },
      {
        id: 'top-lbi-8',
        meetingNumber: 8,
        title: 'Simulasi Tryout Literasi Bahasa Indonesia & Refleksi IRT',
        subtopics: ['Simulasi CBT Penuh 30 Butir Soal Berwaktu 45 Menit', 'Pembahasan Soal HOTS Berdaya Beda Tinggi', 'Review Target Nilai IRT Kelulusan Jurusan PTN'],
        competency: 'Mencapai target skor IRT > 770 pada subtes Literasi Bahasa Indonesia.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT & Sesi Ulasan Komprehensif',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-4',
    code: 'SIL-LBE-XII-01',
    title: 'Silabus Literasi dalam Bahasa Inggris (LBE) SNBT - Reading Comprehension, Author Tone & Inferences',
    subject: 'Literasi Bahasa Inggris',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Sarah Maharani, S.Pd., M.Ed.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Literasi dalam Bahasa Inggris (20 butir soal, 30 menit). Dirancang mengasah kemampuan membaca teks akademik Bahasa Inggris standar internasional (IELTS/TOEFL/SAT): ide pokok, vocabulary in context, pronoun referents, text organization, author tone & attitude, serta inference penarikan simpulan tersirat.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'LBE',
    snbtCategory: 'Literasi',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-lbe-1',
        meetingNumber: 1,
        title: 'Main Idea, Topic, & Primary Purpose of Passage',
        subtopics: ['Skimming strategies for lengthy academic articles', 'Identifying Topic vs Main Idea vs Thesis Statement', 'Formulating the best title for a multi-paragraph text'],
        competency: 'Students can identify the central message and thesis of academic texts within 45 seconds.',
        durationMinutes: 90,
        teachingMethod: 'Skimming Exercises & Timed Reading Drills'
      },
      {
        id: 'top-lbe-2',
        meetingNumber: 2,
        title: 'Locating Specific Details & Factual Information',
        subtopics: ['Scanning keywords and synonyms in questions', 'Answering "According to the passage..." questions', '"EXCEPT" or "NOT TRUE" question elimination techniques'],
        competency: 'Quickly scanning factual details without rereading the whole passage.',
        durationMinutes: 90,
        teachingMethod: 'Guided Scanning Drills & Synonym Matching'
      },
      {
        id: 'top-lbe-3',
        meetingNumber: 3,
        title: 'Vocabulary in Context & Pronoun Referents',
        subtopics: ['Inferring word meaning from surrounding context clues', 'Prefixes, suffixes, and Latin/Greek root analysis', 'Tracing demonstrative and relative pronouns (this, that, which)'],
        competency: 'Deciphering unfamiliar terminology without relying on a dictionary.',
        durationMinutes: 90,
        teachingMethod: 'Context Clue Practice & Root Word Breakdowns'
      },
      {
        id: 'top-lbe-4',
        meetingNumber: 4,
        title: 'Author’s Tone, Attitude, & Target Audience',
        subtopics: ['Identifying Tone (Critical, Optimistic, Objective, Skeptical, Cynical)', 'Author’s Stance and Persuasive Devices', 'Predicting the most likely intended readers of the passage'],
        competency: 'Evaluating the emotional register and rhetorical stance of the author.',
        durationMinutes: 90,
        teachingMethod: 'Tone Analysis Workshops & Comparative Reviews'
      },
      {
        id: 'top-lbe-5',
        meetingNumber: 5,
        title: 'Text Organization & Rhetorical Structures',
        subtopics: ['Patterns of Organization: Cause-Effect, Problem-Solution, Compare-Contrast', 'Function of a Specific Paragraph/Sentence within the Whole Passage', 'Discourse Transition Words (However, Consequently, Furthermore)'],
        competency: 'Analyzing the logical architecture and flow of arguments in English passages.',
        durationMinutes: 90,
        teachingMethod: 'Discourse Marker Mapping & Structural Analysis'
      },
      {
        id: 'top-lbe-6',
        meetingNumber: 6,
        title: 'Making Inferences & Implicit Conclusions',
        subtopics: ['Drawing Logical Conclusions from Evidence Presented', '"It can be inferred from paragraph X that..." questions', 'Avoiding Overspeculation & Unsupported Inferences'],
        competency: 'Extracting implicit assumptions and subtext with rigorous academic precision.',
        durationMinutes: 90,
        teachingMethod: 'Inference Worksheets & Evidence Verification'
      },
      {
        id: 'top-lbe-7',
        meetingNumber: 7,
        title: 'Dual Passage Synthesis (Passage A vs Passage B)',
        subtopics: ['Comparing Author Perspectives on Contemporary Global Issues', 'Synthesizing Divergent Viewpoints into a Unified Synthesis', 'Speed Elimination of Conflicting Distractor Options'],
        competency: 'Synthesizing multi-text English arguments within 90 seconds per question block.',
        durationMinutes: 90,
        teachingMethod: 'Paired Passage Drills & Timed Speed Run'
      },
      {
        id: 'top-lbe-8',
        meetingNumber: 8,
        title: 'Full CBT Simulation & IRT Score Breakdown (Target 780+)',
        subtopics: ['20-question Timed Exam Simulation (30 Minutes)', 'Comprehensive Question-by-Question Strategy Review', 'Target IRT Score Optimization Plan'],
        competency: 'Achieving an IRT score exceeding 780 in SNBT English Literacy subtest.',
        durationMinutes: 90,
        teachingMethod: 'Digital CBT Simulation & Performance Review',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-pm',
    code: 'SIL-PM-XII-01',
    title: 'Silabus Penalaran Matematika (PM) SNBT - Pemodelan Kontekstual, Aritmetika Sosial & Statistika',
    subject: 'Penalaran Matematika (PM)',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum standar resmi SNBT 2026/2027 untuk subtes Penalaran Matematika (20 butir soal, 30 menit). Menekankan kemampuan memformulasikan permasalahan dunia nyata ke dalam model matematis, menyelesaikan aritmetika finansial, optimasi biaya/keuntungan, laju perubahan, debit fluida, geometri praktis, serta interpretasi peluang dan statistika kontekstual.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'PM',
    snbtCategory: 'Penalaran Matematika',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-pm-1',
        meetingNumber: 1,
        title: 'Pemodelan Matematika & Sistem Persamaan Dunia Nyata',
        subtopics: ['Menerjemahkan Narasi Cerita Kompleks Menjadi Model Aljabar', 'Sistem Persamaan Linier & Kuadrat Terapan', 'Analisis Syarat Batas & Daerah Solusi Fisibel'],
        competency: 'Siswa mampu merumuskan model matematis dari permasalahan kontekstual dalam < 45 detik.',
        durationMinutes: 90,
        teachingMethod: 'Contextual Problem Formulation'
      },
      {
        id: 'top-pm-2',
        meetingNumber: 2,
        title: 'Aritmetika Sosial & Perhitungan Finansial Nyata',
        subtopics: ['Diskon Bertingkat, Pajak Pertambahan Nilai (PPN), dan Margin Keuntungan', 'Bunga Tunggal, Bunga Majemuk, dan Skema Angsuran Finansial', 'Inflasi, Nilai Tukar Mata Uang & Rasio Investasi'],
        competency: 'Menyelesaikan permasalahan ekonomi finansial sehari-hari dengan kalkulasi cepat.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Kasus Finansial & Drill Soal'
      },
      {
        id: 'top-pm-3',
        meetingNumber: 3,
        title: 'Laju Perubahan, Kecepatan Papasan & Debit Pengisian',
        subtopics: ['Gerak Relatif: Papasan Searah, Berlawanan & Susul-Menyusul', 'Debit Aliran Pipa Ganda & Waktu Pengisian/Pengosongan Tangki', 'Laju Pertumbuhan Populasi Eksponensial & Waktu Paruh Peluruhan'],
        competency: 'Menganalisis fenomena laju perubahan dinamis dan proporsionalitas waktu.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Fisika-Matematika Terapan'
      },
      {
        id: 'top-pm-4',
        meetingNumber: 4,
        title: 'Geometri Aplikasi & Optimasi Ukuran/Biaya',
        subtopics: ['Optimasi Luas & Volume Maksimum Kemasan Produk', 'Kalkulasi Biaya Bahan Bangunan: Keramik, Cat, dan Pagar Keliling', 'Rasio Skala Peta, Denah Ruang & Proyeksi Luas Terpotong'],
        competency: 'Menerapkan konsep geometri untuk menghitung efisiensi bahan dan biaya minimum.',
        durationMinutes: 90,
        teachingMethod: 'Design Optimization Problems'
      },
      {
        id: 'top-pm-5',
        meetingNumber: 5,
        title: 'Peluang & Teori Keputusan dalam Bisnis/Manajemen',
        subtopics: ['Probabilitas Risiko Produksi Cacat & Quality Control', 'Nilai Harapan (Expected Value) dalam Keputusan Bisnis', 'Kombinasi Pemilihan Tim Proyek & Penugasan Kerja Optimal'],
        competency: 'Menghitung ekspektasi peluang keuntungan dan risiko dalam situasi bersyarat.',
        durationMinutes: 90,
        teachingMethod: 'Decision Tree & Game Theory Basics'
      },
      {
        id: 'top-pm-6',
        meetingNumber: 6,
        title: 'Statistika Terapan & Ekstrapolasi Tren Data',
        subtopics: ['Interpretasi Box-Plot, Histogram Frekuensi, dan Scatter Plot', 'Regresi Tren Linier Sederhana & Estimasi Nilai Masa Depan', 'Perbandingan Rata-rata Gabungan Beberapa Kelompok Data'],
        competency: 'Menganalisis pola distribusi data dan memproyeksikan kecenderungan statistik.',
        durationMinutes: 90,
        teachingMethod: 'Data Analysis Workshops'
      },
      {
        id: 'top-pm-7',
        meetingNumber: 7,
        title: 'Speed Solving Strategy: Trik Estimasi Opsi Masuk Akal',
        subtopics: ['Teknik Pendekatan Angka Bulat (Rounding Estimation)', 'Eliminasi Opsi Nilai yang Melampaui Batas Logika Nyata', 'Manajemen Waktu 90 Detik per Butir Soal Cerita PM'],
        competency: 'Menemukan jawaban tepat dengan estimasi cerdas tanpa pembagian desimal rumit.',
        durationMinutes: 90,
        teachingMethod: 'Estimation Strategy & Timed Speed Drills'
      },
      {
        id: 'top-pm-8',
        meetingNumber: 8,
        title: 'Simulasi Tryout Penalaran Matematika & Evaluasi IRT',
        subtopics: ['Simulasi CBT 20 Soal PM Berwaktu 30 Menit', 'Pembahasan Tuntas Soal HOTS Pemodelan', 'Penyusunan Rencana Peningkatan Akurasi Mandiri'],
        competency: 'Mencapai target nilai IRT > 770 pada subtes Penalaran Matematika.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT & Sesi Ulasan Interaktif',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  }
];

// Helper to synchronize SNBT modules with existing Academic Syllabi
export function syncSnbtModulesWithAcademicSyllabi(academicSyllabi: SyllabusItem[]): {
  syncedCount: number;
  unlinkedCount: number;
  subtestCoverage: Record<SnbtSubtestCode, boolean>;
} {
  const coverage: Record<SnbtSubtestCode, boolean> = {
    PU: false,
    PPU: false,
    PBM: false,
    PK: false,
    LBI: false,
    LBE: false,
    PM: false
  };

  academicSyllabi.forEach(sil => {
    if (sil.snbtSubtestCode && sil.snbtSubtestCode in coverage) {
      coverage[sil.snbtSubtestCode as SnbtSubtestCode] = true;
    }
    // Match by code/title heuristics if snbtSubtestCode is not explicitly set
    const lower = `${sil.code} ${sil.title} ${sil.subject}`.toLowerCase();
    if (lower.includes('penalaran umum') || lower.includes('sil-pu')) coverage.PU = true;
    if (lower.includes('pemahaman umum') || lower.includes('sil-ppu')) coverage.PPU = true;
    if (lower.includes('pemahaman bacaan') || lower.includes('pbm') || lower.includes('sil-pbm')) coverage.PBM = true;
    if (lower.includes('kuantitatif') || lower.includes('sil-pk') || lower.includes('sil-mtk')) coverage.PK = true;
    if (lower.includes('literasi bahasa indonesia') || lower.includes('sil-lbi')) coverage.LBI = true;
    if (lower.includes('literasi bahasa inggris') || lower.includes('english') || lower.includes('sil-lbe')) coverage.LBE = true;
    if (lower.includes('penalaran matematika') || lower.includes('sil-pm')) coverage.PM = true;
  });

  const modules = loadSnbtSyllabusModules();
  let synced = 0;
  let unlinked = 0;

  modules.forEach(m => {
    const hasMatch = academicSyllabi.some(
      s => s.id === m.academicSyllabusId || s.code === m.academicSyllabusCode || s.snbtSubtestCode === m.subtestCode
    );
    if (hasMatch) synced++;
    else unlinked++;
  });

  return {
    syncedCount: synced,
    unlinkedCount: unlinked,
    subtestCoverage: coverage
  };
}
