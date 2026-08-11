import { User } from '../../types';

export interface SnbtSubtestScore {
  code: 'PU' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM';
  name: string;
  category: 'TPS' | 'Literasi' | 'Penalaran Matematika';
  score: number; // e.g. 720
  targetScore: number; // e.g. 750
  correct: number;
  totalQuestions: number;
  accuracy: number; // percentage
}

export interface SnbtTryoutHistory {
  id: string;
  tryoutName: string;
  date: string;
  totalScore: number;
  rank: number;
  totalParticipants: number;
  passingStatus: 'AMAN' | 'KOMPETITIF' | 'PERLU_DITINGKATKAN';
  subtests: {
    pu: number;
    ppu: number;
    pbm: number;
    pk: number;
    lbi: number;
    lbe: number;
    pm: number;
  };
}

export interface SnbtStudentProfile {
  id: string;
  nis: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  className: string; // 'XII-UTBK'
  group: string; // 'Kelompok 1 - Alpha (UTBK)', 'Kelompok 2 - Einstein (UTBK)', etc.
  schoolOrigin: string;
  targetPtn1: string; // e.g. 'Universitas Indonesia (UI)'
  prodi1: string; // e.g. 'Pendidikan Dokter'
  passingGrade1: number; // e.g. 735
  targetPtn2: string; // e.g. 'Institut Teknologi Bandung (ITB)'
  prodi2: string; // e.g. 'Sekolah Teknik Elektro & Informatika (STEI)'
  passingGrade2: number; // e.g. 710
  avgTryoutScore: number; // e.g. 718
  highestTryoutScore: number; // e.g. 745
  targetOverallScore: number; // e.g. 750
  snpmbAccountStatus: 'TERVERIFIKASI' | 'PERLU_FINALISASI' | 'BELUM_DAFTAR';
  readinessLevel: 'SANGAT_SIAP' | 'SIAP' | 'PERLU_BIMBINGAN';
  subtestScores: SnbtSubtestScore[];
  tryoutHistory: SnbtTryoutHistory[];
  counselorNotes: string;
  lastActive: string;
}

export interface SnbtMilestone {
  id: string;
  phaseNumber: number;
  phaseName: string;
  title: string;
  subtitle: string;
  dateRange: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  progressPercentage: number;
  badgeTag: string;
  description: string;
  keyActivities: string[];
  deliverables: string[];
  tips: string;
}

export interface SnbtSubtestTopic {
  id: string;
  subtestCode: 'PU' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM';
  subtestName: string;
  category: 'TPS' | 'Literasi' | 'Penalaran Matematika';
  durationMinutes: number;
  totalQuestions: number;
  color: string;
  accentColor: string;
  topics: {
    name: string;
    description: string;
    masteryLevel: 'HIGH' | 'MEDIUM' | 'BASIC';
  }[];
}

export interface SnbtCountdownTarget {
  id: string;
  title: string;
  subtitle: string;
  targetDateIso: string; // e.g. '2026-04-22T07:30:00+07:00'
  targetDateFormatted: string;
  badge: string;
  badgeColor: string;
  isMain: boolean;
  description: string;
  locationInfo?: string;
}

// 7 Subtes UTBK-SNBT Resmi SNPMB
export const SNBT_SUBTEST_LIST: SnbtSubtestTopic[] = [
  {
    id: 'sub-pu',
    subtestCode: 'PU',
    subtestName: 'Penalaran Umum',
    category: 'TPS',
    durationMinutes: 30,
    totalQuestions: 30,
    color: 'from-blue-500 to-indigo-600',
    accentColor: 'blue',
    topics: [
      { name: 'Penalaran Induktif', description: 'Menarik kesimpulan dari pola fenomena/data spesifik', masteryLevel: 'HIGH' },
      { name: 'Penalaran Deduktif', description: 'Logika silogisme formal, modus ponens & tollens', masteryLevel: 'HIGH' },
      { name: 'Penalaran Kuantitatif Dasar', description: 'Operasi logika bilangan, pola deret angka & tabel inferensi', masteryLevel: 'MEDIUM' }
    ]
  },
  {
    id: 'sub-ppu',
    subtestCode: 'PPU',
    subtestName: 'Pengetahuan & Pemahaman Umum',
    category: 'TPS',
    durationMinutes: 15,
    totalQuestions: 20,
    color: 'from-cyan-500 to-teal-600',
    accentColor: 'cyan',
    topics: [
      { name: 'Ide Pokok & Simpulan Teks', description: 'Menemukan gagasan utama dan intisari paragraf', masteryLevel: 'HIGH' },
      { name: 'Makna Kata & Hubungan Semantik', description: 'Sinonim kontekstual, antonim, dan polisemi kata', masteryLevel: 'MEDIUM' },
      { name: 'Kepaduan Paragraf & Kohesi', description: 'Identifikasi kalimat sumbang dan kata rujukan', masteryLevel: 'MEDIUM' }
    ]
  },
  {
    id: 'sub-pbm',
    subtestCode: 'PBM',
    subtestName: 'Pemahaman Bacaan & Menulis',
    category: 'TPS',
    durationMinutes: 25,
    totalQuestions: 20,
    color: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    topics: [
      { name: 'Ejaan & Tanda Baca (EYD V / PUEBI)', description: 'Huruf kapital, miring, tanda hubung, koma, titik koma', masteryLevel: 'HIGH' },
      { name: 'Kalimat Efektif & Struktur S-P-O-K', description: 'Kelogisan, kecermatan, dan keparalelan bentuk kalimat', masteryLevel: 'HIGH' },
      { name: 'Penggabungan & Pembentukan Kalimat', description: 'Konjungsi koordinatif, subordinatif & antar-kalimat', masteryLevel: 'MEDIUM' }
    ]
  },
  {
    id: 'sub-pk',
    subtestCode: 'PK',
    subtestName: 'Pengetahuan Kuantitatif',
    category: 'TPS',
    durationMinutes: 20,
    totalQuestions: 15,
    color: 'from-rose-500 to-red-600',
    accentColor: 'rose',
    topics: [
      { name: 'Aljabar & Fungsi', description: 'Persamaan linear, kuadrat, eksponen & sistem pertidaksamaan', masteryLevel: 'HIGH' },
      { name: 'Geometri & Trigonometri', description: 'Bangun datar, ruang, sudut, phytagoras & koordinat kartesius', masteryLevel: 'MEDIUM' },
      { name: 'Kecukupan Data (Pernyataan 1 & 2)', description: 'Evaluasi apakah informasi cukup untuk menjawab soal', masteryLevel: 'HIGH' },
      { name: 'Statistika & Peluang Kombinatorika', description: 'Rata-rata, median, permutasi, kombinasi & peluang bersyarat', masteryLevel: 'MEDIUM' }
    ]
  },
  {
    id: 'sub-lbi',
    subtestCode: 'LBI',
    subtestName: 'Literasi dalam Bahasa Indonesia',
    category: 'Literasi',
    durationMinutes: 45,
    totalQuestions: 30,
    color: 'from-emerald-500 to-green-600',
    accentColor: 'emerald',
    topics: [
      { name: 'Teks Informasi & Saintifik Populer', description: 'Mengevaluasi argumen, fakta versus opini, dan bias teks', masteryLevel: 'HIGH' },
      { name: 'Teks Sastra & Naratif Reflektif', description: 'Menemukan pesan tersirat, sudut pandang & gaya bahasa', masteryLevel: 'MEDIUM' },
      { name: 'Sintesis Multi-Teks', description: 'Membandingkan perspektif dari dua teks bacaan berbeda', masteryLevel: 'HIGH' }
    ]
  },
  {
    id: 'sub-lbe',
    subtestCode: 'LBE',
    subtestName: 'Literasi dalam Bahasa Inggris',
    category: 'Literasi',
    durationMinutes: 30,
    totalQuestions: 20,
    color: 'from-violet-500 to-purple-600',
    accentColor: 'violet',
    topics: [
      { name: 'Main Idea & Paragraph Organization', description: 'Identifying topic sentences and text structural flow', masteryLevel: 'HIGH' },
      { name: 'Contextual Inference & Vocabulary', description: 'Deducing implicit meaning of advanced academic terms', masteryLevel: 'MEDIUM' },
      { name: 'Author Tone & Attitude Analysis', description: 'Detecting critical, subjective, skeptical, or neutral tones', masteryLevel: 'MEDIUM' }
    ]
  },
  {
    id: 'sub-pm',
    subtestCode: 'PM',
    subtestName: 'Penalaran Matematika',
    category: 'Penalaran Matematika',
    durationMinutes: 30,
    totalQuestions: 20,
    color: 'from-fuchsia-500 to-pink-600',
    accentColor: 'fuchsia',
    topics: [
      { name: 'Pemodelan Kontekstual Nyata', description: 'Menerjemahkan narasi masalah nyata ke model matematika', masteryLevel: 'HIGH' },
      { name: 'Aritmatika Sosial & Finansial', description: 'Bunga bank, diskon bertingkat, perpajakan, dan rasio laba', masteryLevel: 'HIGH' },
      { name: 'Optimasi & Analisis Data Grafik', description: 'Nilai optimum maksimum/minimum dan interpretasi tren infografis', masteryLevel: 'MEDIUM' }
    ]
  }
];

// Countdown Targets Resmi SNBT 2026/2027
export const SNBT_COUNTDOWN_TARGETS: SnbtCountdownTarget[] = [
  {
    id: 'target-gelombang-1',
    title: 'Pelaksanaan UTBK Gelombang 1',
    subtitle: 'Hari Pertama Ujian UTBK-SNBT 2026 Sesi Pagi',
    targetDateIso: '2026-04-22T07:15:00+07:00',
    targetDateFormatted: '22 April 2026, 07:15 WIB',
    badge: 'HARI H GELOMBANG 1',
    badgeColor: 'from-rose-500 to-amber-500',
    isMain: true,
    description: 'Pusat UTBK PTN Seluruh Indonesia. Pastikan berkas cetak kartu peserta & ijazah/SKL sudah siap.',
    locationInfo: 'Pusat UTBK UI, ITB, UGM, Unair, ITS, IPB, Undip, dll.'
  },
  {
    id: 'target-gelombang-2',
    title: 'Pelaksanaan UTBK Gelombang 2',
    subtitle: 'Sesi Ujian Gelombang Kedua UTBK-SNBT 2026',
    targetDateIso: '2026-05-05T07:15:00+07:00',
    targetDateFormatted: '05 Mei 2026, 07:15 WIB',
    badge: 'GELOMBANG 2',
    badgeColor: 'from-blue-500 to-indigo-500',
    isMain: false,
    description: 'Pelaksanaan UTBK gelombang 2 bagi peserta yang memilih jadwal gelombang kedua.',
    locationInfo: 'Pusat UTBK Terpilih'
  },
  {
    id: 'target-pengumuman',
    title: 'Pengumuman Hasil UTBK-SNBT',
    subtitle: 'Rilis Resmi Kelulusan Mahasiswa Baru PTN 2026',
    targetDateIso: '2026-06-18T15:00:00+07:00',
    targetDateFormatted: '18 Juni 2026, 15:00 WIB',
    badge: 'PENGUMUMAN HASIL',
    badgeColor: 'from-emerald-500 to-teal-500',
    isMain: false,
    description: 'Akses portal pengumuman-snbt.bppp.kemdikbud.go.id & 40 mirror link PTN.',
    locationInfo: 'Portal Resmi SNPMB Kemdikbud'
  },
  {
    id: 'target-registrasi-akun',
    title: 'Penutupan Registrasi Akun SNPMB',
    subtitle: 'Batas Akhir Simpan Permanen Akun Siswa',
    targetDateIso: '2026-02-15T15:00:00+07:00',
    targetDateFormatted: '15 Februari 2026, 15:00 WIB',
    badge: 'AKUN SNPMB',
    badgeColor: 'from-purple-500 to-pink-500',
    isMain: false,
    description: 'Pastikan pasfoto formal 4x6 dan verifikasi NISN/NPSN sudah berstatus SIMPAN PERMANEN.',
    locationInfo: 'Portal SNPMB'
  }
];

// Roadmap Milestones SNBT
export const SNBT_ROADMAP_MILESTONES: SnbtMilestone[] = [
  {
    id: 'snbt-phase-1',
    phaseNumber: 1,
    phaseName: 'Fase 1: Diagnostik & Fondasi Konsep',
    title: 'Pemetaan Awal & Penguasaan Konsep Esensial',
    subtitle: 'Bulan 1 - 2 (Juli - September)',
    dateRange: 'Juli - September',
    status: 'COMPLETED',
    progressPercentage: 100,
    badgeTag: 'FONDASE & DIAGNOSTIK',
    description: 'Melakukan diagnostik baseline kemampuan di 7 subtes, membedah blueprint resmi SNPMB, dan mengunci materi dasar aljabar, PUEBI, logika matematika, serta pembacaan kritis.',
    keyActivities: [
      'Tryout Diagnostik Awal (Baseline Test IRT)',
      'Konsultasi Minat Bakat & Penentuan Target PTN/Prodi Awal',
      'Penguasaan Matematika Dasar & Logika Kuantitatif',
      'Penguatan Grammar & Academic English Reading'
    ],
    deliverables: [
      'Rapor Baseline Profil Kemampuan Siswa',
      'Peta Target Skor per Subtes (Target ≥ 700)',
      'Buku Catatan Rumus & Peta Konsep 7 Subtes'
    ],
    tips: 'Fokus pada pemahaman logika konsep, hindari sekadar menghafal rumus cepat tanpa memahami dasar penalarannya.'
  },
  {
    id: 'snbt-phase-2',
    phaseNumber: 2,
    phaseName: 'Fase 2: Pendalaman Materi & Bank Soal HOTS',
    title: 'Bedah 7 Subtes & Latihan Soal Standar Tinggi',
    subtitle: 'Bulan 3 - 5 (Oktober - Desember)',
    dateRange: 'Oktober - Desember',
    status: 'COMPLETED',
    progressPercentage: 100,
    badgeTag: 'PENDALAMAN HOTS',
    description: 'Drill ribuan soal tipe Higher Order Thinking Skills (HOTS) pada Penalaran Umum, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, dan Penalaran Matematika.',
    keyActivities: [
      'Drill Harian 30 Soal Subtes Spesifik Berbasis Timer',
      'Workshop Bedah Soal Penalaran Matematika Kontekstual',
      'Sesi Literasi Membaca Cepat (Skimming & Scanning) Teks Saintifik',
      'Tryout Evaluasi Bulanan Berstandar Nilai IRT'
    ],
    deliverables: [
      'Portofolio Hasil Latihan 1.500+ Soal HOTS',
      'Grafik Tren Peningkatan Akurasi Pengerjaan',
      'Modul Bank Soal & Pembahasan Analitis'
    ],
    tips: 'Latih kecepatan membaca teks panjang dengan teknik chunking agar tidak kehabisan waktu di subtes Literasi.'
  },
  {
    id: 'snbt-phase-3',
    phaseNumber: 3,
    phaseName: 'Fase 3: Simulasi Tryout IRT & Administrasi SNPMB',
    title: 'Simulasi Sistem Nyata & Verifikasi Akun',
    subtitle: 'Bulan 6 - 7 (Januari - Februari)',
    dateRange: 'Januari - Februari',
    status: 'IN_PROGRESS',
    progressPercentage: 80,
    badgeTag: 'SIMULASI & REGISTRASI',
    description: 'Melakukan registrasi dan Simpan Permanen Akun SNPMB, serta mengikuti siklus Tryout Akbar berkala dengan algoritma pembobotan Item Response Theory (IRT).',
    keyActivities: [
      'Registrasi & Verifikasi Simpan Permanen Akun SNPMB',
      'Simulasi Tryout CBT dengan Antarmuka Mirip Asli UTBK',
      'Analisis Butir Soal & Identifikasi Subtes Titik Lemah Siswa',
      'Klinik Konsultasi Pemilihan Jurusan Pilihan 1, 2, 3, & 4'
    ],
    deliverables: [
      'Bukti Cetak Simpan Permanen Akun SNPMB Siswa',
      'Laporan Skor Tryout IRT Mingguan',
      'Rekomendasi Rasio Peluang Masuk Prodi PTN'
    ],
    tips: 'Pastikan pasfoto memenuhi standar SNPMB: latar belakang polos (merah/biru), pakaian formal rapi, dan wajah tampak jelas.'
  },
  {
    id: 'snbt-phase-4',
    phaseNumber: 4,
    phaseName: 'Fase 4: Final Sprint & Mentoring Pilihan Jurusan',
    title: 'Pendaftaran UTBK & Penguncian Strategi Skor',
    subtitle: 'Bulan 8 (Maret - Awal April)',
    dateRange: 'Maret - Awal April',
    status: 'UPCOMING',
    progressPercentage: 45,
    badgeTag: 'FINAL SPRINT & STRATEGI',
    description: 'Finalisasi pendaftaran UTBK-SNBT, pemilihan Pusat UTBK terdekat, serta pemantapan strategi pengerjaan soal dengan teknik eliminasi dan manajemen waktu ketat.',
    keyActivities: [
      'Pendaftaran Resmi UTBK-SNBT & Pembayaran Biaya Ujian',
      'Cetak Kartu Tanda Peserta Ujian UTBK 2026',
      'Sesi Mentoring 1-on-1 Strategi Lolos Passing Grade PTN',
      'Drill Kilat Paket Ujian Full 155 Soal / 195 Menit'
    ],
    deliverables: [
      'Kartu Peserta Ujian UTBK-SNBT Tercetak Rapi',
      'Lembar Strategi Target Skor Per Subtes per Siswa',
      'Rencana Logistik Hari-H (Lokasi & Transportasi Pusat UTBK)'
    ],
    tips: 'Manfaatkan 4 pilihan program studi secara cerdas: kombinasikan prodi impian utama (passing grade tinggi) dengan prodi pengaman.'
  },
  {
    id: 'snbt-phase-5',
    phaseNumber: 5,
    phaseName: 'Fase 5: Hari H UTBK & Sukses Lolos PTN',
    title: 'Eksekusi Hari H, Pengumuman & Pasca Ujian',
    subtitle: 'Bulan 9 - 10 (April - Juni)',
    dateRange: 'April - Juni',
    status: 'UPCOMING',
    progressPercentage: 10,
    badgeTag: 'EKSEKUSI & PENGUMUMAN',
    description: 'Pelaksanaan ujian di Pusat UTBK dengan kondisi fisik dan mental prima, pemantauan pengumuman resmi, pengunduhan sertifikat nilai, dan persiapan jalur mandiri PTN jika diperlukan.',
    keyActivities: [
      'Briefing Akhir H-3 & Pengecekan Lokasi Ruang Ujian',
      'Pelaksanaan Ujian UTBK Sesi Pagi / Siang',
      'Pemberian Doa Bersama & Penguatan Mental Juang Siswa',
      'Pemantauan Rilis Pengumuman Kelulusan PTN',
      'Unduh Sertifikat Resmi Nilai UTBK SNPMB'
    ],
    deliverables: [
      'Sertifikat Resmi Nilai UTBK untuk Daftar Ulang PTN',
      'Dokumentasi Kelulusan Siswa di Kampus Impian',
      'Rencana Cadangan Jalur Mandiri (SIMAK UI, UTUL UGM, SMUP Unpad, dll.)'
    ],
    tips: 'Datang ke lokasi Pusat UTBK minimal 45 menit sebelum sesi dimulai. Bawa KTP/Kartu Pelajar dan Ijazah/SKL asli.'
  }
];

// Initial Data Siswa Kelas XII-UTBK
export const INITIAL_SNBT_STUDENTS: SnbtStudentProfile[] = [
  {
    id: 'snbt-std-01',
    nis: '20261001',
    name: 'Budi Santoso',
    email: 'budi@student.com',
    phone: '081298765431',
    whatsapp: '081298765431',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 1 - Alpha (UTBK)',
    schoolOrigin: 'SMA Negeri 8 Jakarta',
    targetPtn1: 'Universitas Indonesia (UI)',
    prodi1: 'Pendidikan Dokter (FK UI)',
    passingGrade1: 748,
    targetPtn2: 'Universitas Gadjah Mada (UGM)',
    prodi2: 'Kedokteran (FKKMK UGM)',
    passingGrade2: 735,
    avgTryoutScore: 742,
    highestTryoutScore: 768,
    targetOverallScore: 760,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SANGAT_SIAP',
    counselorNotes: 'Performa sangat konsisten di Penalaran Matematika dan Literasi B. Inggris. Perlu sedikit peningkatan efisiensi waktu di Pengetahuan Kuantitatif.',
    lastActive: 'Hari ini, 10:45 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 760, targetScore: 750, correct: 27, totalQuestions: 30, accuracy: 90 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 720, targetScore: 730, correct: 17, totalQuestions: 20, accuracy: 85 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 735, targetScore: 740, correct: 18, totalQuestions: 20, accuracy: 90 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 755, targetScore: 770, correct: 14, totalQuestions: 15, accuracy: 93.3 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 740, targetScore: 750, correct: 27, totalQuestions: 30, accuracy: 90 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 765, targetScore: 760, correct: 19, totalQuestions: 20, accuracy: 95 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 720, targetScore: 750, correct: 17, totalQuestions: 20, accuracy: 85 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 698,
        rank: 14,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 710, ppu: 680, pbm: 690, pk: 720, lbi: 700, lbe: 715, pm: 670 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 724,
        rank: 8,
        totalParticipants: 5100,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 735, ppu: 710, pbm: 715, pk: 740, lbi: 720, lbe: 745, pm: 705 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 745,
        rank: 3,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 760, ppu: 720, pbm: 735, pk: 755, lbi: 740, lbe: 765, pm: 740 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 758,
        rank: 2,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 770, ppu: 735, pbm: 750, pk: 775, lbi: 755, lbe: 780, pm: 745 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 768,
        rank: 1,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 780, ppu: 745, pbm: 760, pk: 790, lbi: 765, lbe: 790, pm: 750 }
      }
    ]
  },
  {
    id: 'snbt-std-02',
    nis: '20261005',
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@student.com',
    phone: '082188776655',
    whatsapp: '082188776655',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 1 - Alpha (UTBK)',
    schoolOrigin: 'SMA Labschool Kebayoran',
    targetPtn1: 'Institut Teknologi Bandung (ITB)',
    prodi1: 'Sekolah Teknik Elektro & Informatika (STEI)',
    passingGrade1: 732,
    targetPtn2: 'Universitas Indonesia (UI)',
    prodi2: 'Ilmu Komputer (Fasilkom UI)',
    passingGrade2: 725,
    avgTryoutScore: 738,
    highestTryoutScore: 765,
    targetOverallScore: 750,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SANGAT_SIAP',
    counselorNotes: 'Sangat kuat di Penalaran Matematika & Pengetahuan Kuantitatif. Literasi Bahasa Indonesia menunjukkan peningkatan positif.',
    lastActive: 'Kemarin, 19:20 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 745, targetScore: 740, correct: 26, totalQuestions: 30, accuracy: 86.6 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 710, targetScore: 720, correct: 16, totalQuestions: 20, accuracy: 80 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 715, targetScore: 730, correct: 16, totalQuestions: 20, accuracy: 80 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 780, targetScore: 770, correct: 15, totalQuestions: 15, accuracy: 100 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 720, targetScore: 730, correct: 25, totalQuestions: 30, accuracy: 83.3 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 745, targetScore: 740, correct: 17, totalQuestions: 20, accuracy: 85 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 755, targetScore: 750, correct: 18, totalQuestions: 20, accuracy: 90 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 710,
        rank: 9,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 720, ppu: 690, pbm: 680, pk: 760, lbi: 690, lbe: 720, pm: 710 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 738,
        rank: 4,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 745, ppu: 710, pbm: 715, pk: 780, lbi: 720, lbe: 745, pm: 755 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 748,
        rank: 2,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 750, ppu: 720, pbm: 725, pk: 790, lbi: 735, lbe: 755, pm: 760 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 755,
        rank: 3,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 760, ppu: 730, pbm: 735, pk: 800, lbi: 740, lbe: 760, pm: 765 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 765,
        rank: 2,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 770, ppu: 740, pbm: 745, pk: 810, lbi: 750, lbe: 770, pm: 775 }
      }
    ]
  },
  {
    id: 'snbt-std-03',
    nis: '20261003',
    name: 'Rian Hidayat',
    email: 'rian@pending.com',
    phone: '081277665544',
    whatsapp: '081277665544',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 1 - Alpha (UTBK)',
    schoolOrigin: 'SMA Negeri 28 Jakarta',
    targetPtn1: 'Universitas Gadjah Mada (UGM)',
    prodi1: 'Teknik Sipil & Lingkungan',
    passingGrade1: 695,
    targetPtn2: 'Institut Teknologi Sepuluh Nopember (ITS)',
    prodi2: 'Teknik Industri',
    passingGrade2: 685,
    avgTryoutScore: 688,
    highestTryoutScore: 715,
    targetOverallScore: 720,
    snpmbAccountStatus: 'PERLU_FINALISASI',
    readinessLevel: 'SIAP',
    counselorNotes: 'Perlu finalisasi akun SNPMB sebelum tenggat. Kemampuan PK dan PM sudah solid, dorong peningkatan di PBM dan PPU.',
    lastActive: '2 hari lalu',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 690, targetScore: 710, correct: 23, totalQuestions: 30, accuracy: 76.6 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 660, targetScore: 700, correct: 14, totalQuestions: 20, accuracy: 70 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 675, targetScore: 710, correct: 14, totalQuestions: 20, accuracy: 70 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 715, targetScore: 740, correct: 13, totalQuestions: 15, accuracy: 86.6 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 680, targetScore: 710, correct: 23, totalQuestions: 30, accuracy: 76.6 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 695, targetScore: 710, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 702, targetScore: 730, correct: 16, totalQuestions: 20, accuracy: 80 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 668,
        rank: 45,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 670, ppu: 640, pbm: 650, pk: 700, lbi: 660, lbe: 675, pm: 680 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 695,
        rank: 22,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 690, ppu: 660, pbm: 675, pk: 715, lbi: 680, lbe: 695, pm: 702 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 705,
        rank: 18,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 700, ppu: 675, pbm: 685, pk: 730, lbi: 695, lbe: 710, pm: 715 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 710,
        rank: 15,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 705, ppu: 680, pbm: 695, pk: 735, lbi: 700, lbe: 715, pm: 720 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 715,
        rank: 12,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 710, ppu: 690, pbm: 700, pk: 745, lbi: 710, lbe: 720, pm: 730 }
      }
    ]
  },
  {
    id: 'snbt-std-04',
    nis: '20261011',
    name: 'Alya Putri Kirana',
    email: 'alya.kirana@student.com',
    phone: '081344556677',
    whatsapp: '081344556677',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 2 - Einstein (UTBK)',
    schoolOrigin: 'SMA Negeri 70 Jakarta',
    targetPtn1: 'Universitas Indonesia (UI)',
    prodi1: 'Ilmu Hukum (FH UI)',
    passingGrade1: 715,
    targetPtn2: 'Universitas Padjadjaran (Unpad)',
    prodi2: 'Hubungan Internasional',
    passingGrade2: 698,
    avgTryoutScore: 732,
    highestTryoutScore: 755,
    targetOverallScore: 735,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SANGAT_SIAP',
    counselorNotes: 'Unggul di seluruh rumpun Literasi Bahasa Indonesia & Bahasa Inggris serta PBM. Strategi pilihan 1 dan 2 sangat realistis.',
    lastActive: 'Hari ini, 09:15 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 730, targetScore: 730, correct: 25, totalQuestions: 30, accuracy: 83.3 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 740, targetScore: 730, correct: 18, totalQuestions: 20, accuracy: 90 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 755, targetScore: 740, correct: 19, totalQuestions: 20, accuracy: 95 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 695, targetScore: 710, correct: 12, totalQuestions: 15, accuracy: 80 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 760, targetScore: 750, correct: 28, totalQuestions: 30, accuracy: 93.3 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 750, targetScore: 740, correct: 18, totalQuestions: 20, accuracy: 90 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 670, targetScore: 700, correct: 14, totalQuestions: 20, accuracy: 70 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 712,
        rank: 8,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 710, ppu: 720, pbm: 740, pk: 680, lbi: 745, lbe: 735, pm: 655 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 738,
        rank: 5,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 730, ppu: 740, pbm: 755, pk: 695, lbi: 760, lbe: 750, pm: 670 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 742,
        rank: 4,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 735, ppu: 745, pbm: 760, pk: 705, lbi: 770, lbe: 755, pm: 680 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 748,
        rank: 4,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 740, ppu: 750, pbm: 765, pk: 710, lbi: 775, lbe: 760, pm: 685 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 755,
        rank: 3,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 745, ppu: 755, pbm: 770, pk: 720, lbi: 785, lbe: 770, pm: 695 }
      }
    ]
  },
  {
    id: 'snbt-std-05',
    nis: '20261012',
    name: 'Dimas Arya Pratama',
    email: 'dimas.arya@student.com',
    phone: '085711223344',
    whatsapp: '085711223344',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 2 - Einstein (UTBK)',
    schoolOrigin: 'SMA Negeri 34 Jakarta',
    targetPtn1: 'Universitas Airlangga (Unair)',
    prodi1: 'Kedokteran Gigi (FKG Unair)',
    passingGrade1: 710,
    targetPtn2: 'Universitas Brawijaya (UB)',
    prodi2: 'Kedokteran Hewan',
    passingGrade2: 675,
    avgTryoutScore: 712,
    highestTryoutScore: 735,
    targetOverallScore: 725,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SIAP',
    counselorNotes: 'Progres signifikan dalam 3 minggu terakhir. Tingkatkan penguasaan materi Penalaran Induktif dan Logika Kalimat.',
    lastActive: 'Kemarin, 16:40 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 710, targetScore: 720, correct: 24, totalQuestions: 30, accuracy: 80 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 695, targetScore: 710, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 700, targetScore: 715, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 730, targetScore: 740, correct: 13, totalQuestions: 15, accuracy: 86.6 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 705, targetScore: 720, correct: 24, totalQuestions: 30, accuracy: 80 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 710, targetScore: 720, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 690, targetScore: 720, correct: 15, totalQuestions: 20, accuracy: 75 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 685,
        rank: 28,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 690, ppu: 675, pbm: 680, pk: 710, lbi: 690, lbe: 695, pm: 660 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 712,
        rank: 16,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 710, ppu: 695, pbm: 700, pk: 730, lbi: 705, lbe: 710, pm: 690 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 720,
        rank: 12,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 715, ppu: 700, pbm: 710, pk: 740, lbi: 715, lbe: 720, pm: 700 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 728,
        rank: 9,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 725, ppu: 710, pbm: 720, pk: 750, lbi: 720, lbe: 725, pm: 710 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 735,
        rank: 8,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 730, ppu: 715, pbm: 725, pk: 760, lbi: 730, lbe: 735, pm: 720 }
      }
    ]
  },
  {
    id: 'snbt-std-06',
    nis: '20261014',
    name: 'Zahra Amelia',
    email: 'zahra.amelia@student.com',
    phone: '089688776655',
    whatsapp: '089688776655',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 3 - Newton (UTBK)',
    schoolOrigin: 'SMA Negeri 61 Jakarta',
    targetPtn1: 'Institut Pertanian Bogor (IPB)',
    prodi1: 'Ilmu Komputer (Ilkom IPB)',
    passingGrade1: 702,
    targetPtn2: 'Universitas Diponegoro (Undip)',
    prodi2: 'Informatika',
    passingGrade2: 690,
    avgTryoutScore: 702,
    highestTryoutScore: 725,
    targetOverallScore: 715,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SIAP',
    counselorNotes: 'Kekuatan di Penalaran Umum dan Literasi B. Inggris. Perlu drill tambahan untuk soal Penalaran Matematika bertipe optimasi grafik.',
    lastActive: 'Hari ini, 11:30 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 720, targetScore: 720, correct: 25, totalQuestions: 30, accuracy: 83.3 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 685, targetScore: 700, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 690, targetScore: 700, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 710, targetScore: 725, correct: 13, totalQuestions: 15, accuracy: 86.6 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 680, targetScore: 700, correct: 23, totalQuestions: 30, accuracy: 76.6 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 725, targetScore: 730, correct: 16, totalQuestions: 20, accuracy: 80 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 678, targetScore: 710, correct: 14, totalQuestions: 20, accuracy: 70 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 678,
        rank: 36,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 700, ppu: 670, pbm: 675, pk: 695, lbi: 665, lbe: 710, pm: 645 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 704,
        rank: 18,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 720, ppu: 685, pbm: 690, pk: 710, lbi: 680, lbe: 725, pm: 678 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 710,
        rank: 14,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 725, ppu: 690, pbm: 695, pk: 720, lbi: 690, lbe: 730, pm: 685 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 718,
        rank: 12,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 730, ppu: 700, pbm: 705, pk: 730, lbi: 700, lbe: 735, pm: 690 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 725,
        rank: 10,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 735, ppu: 710, pbm: 715, pk: 740, lbi: 710, lbe: 740, pm: 700 }
      }
    ]
  },
  {
    id: 'snbt-std-07',
    nis: '20261017',
    name: 'Nabila Syakira',
    email: 'nabila.syakira@student.com',
    phone: '081399887766',
    whatsapp: '081399887766',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 2 - Einstein (UTBK)',
    schoolOrigin: 'SMA Negeri 28 Jakarta',
    targetPtn1: 'Universitas Indonesia (UI)',
    prodi1: 'Psikologi (FPsi UI)',
    passingGrade1: 720,
    targetPtn2: 'Universitas Padjadjaran (Unpad)',
    prodi2: 'Psikologi',
    passingGrade2: 705,
    avgTryoutScore: 722,
    highestTryoutScore: 745,
    targetOverallScore: 730,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SANGAT_SIAP',
    counselorNotes: 'Penalaran deduktif & induktif sangat tajam. Pemahaman bacaan teks panjang sangat cepat dan akurat.',
    lastActive: 'Hari ini, 08:30 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 740, targetScore: 730, correct: 26, totalQuestions: 30, accuracy: 86.6 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 730, targetScore: 720, correct: 17, totalQuestions: 20, accuracy: 85 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 745, targetScore: 730, correct: 18, totalQuestions: 20, accuracy: 90 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 710, targetScore: 720, correct: 13, totalQuestions: 15, accuracy: 86.6 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 750, targetScore: 740, correct: 27, totalQuestions: 30, accuracy: 90 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 735, targetScore: 730, correct: 17, totalQuestions: 20, accuracy: 85 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 695, targetScore: 710, correct: 15, totalQuestions: 20, accuracy: 75 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 695,
        rank: 16,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 710, ppu: 700, pbm: 715, pk: 680, lbi: 720, lbe: 705, pm: 665 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 720,
        rank: 10,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 735, ppu: 720, pbm: 735, pk: 700, lbi: 740, lbe: 725, pm: 685 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 728,
        rank: 8,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 740, ppu: 730, pbm: 745, pk: 710, lbi: 750, lbe: 735, pm: 695 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 736,
        rank: 6,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 745, ppu: 735, pbm: 750, pk: 720, lbi: 760, lbe: 745, pm: 705 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 745,
        rank: 5,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 750, ppu: 745, pbm: 760, pk: 730, lbi: 770, lbe: 755, pm: 715 }
      }
    ]
  },
  {
    id: 'snbt-std-08',
    nis: '20261020',
    name: 'Kevin Pratama Wijaya',
    email: 'kevin.pratama@student.com',
    phone: '081266554433',
    whatsapp: '081266554433',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80',
    className: 'XII-UTBK',
    group: 'Kelompok 3 - Newton (UTBK)',
    schoolOrigin: 'SMA Kanisius Jakarta',
    targetPtn1: 'Institut Teknologi Sepuluh Nopember (ITS)',
    prodi1: 'Teknik Informatika (Informatika ITS)',
    passingGrade1: 718,
    targetPtn2: 'Universitas Brawijaya (UB)',
    prodi2: 'Teknik Informatika',
    passingGrade2: 695,
    avgTryoutScore: 718,
    highestTryoutScore: 740,
    targetOverallScore: 725,
    snpmbAccountStatus: 'TERVERIFIKASI',
    readinessLevel: 'SANGAT_SIAP',
    counselorNotes: 'Nilai Pengetahuan Kuantitatif dan Penalaran Matematika konsisten di level atas (>750). Pertahankan ritme latihan.',
    lastActive: 'Kemarin, 21:10 WIB',
    subtestScores: [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 725, targetScore: 720, correct: 25, totalQuestions: 30, accuracy: 83.3 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 690, targetScore: 700, correct: 15, totalQuestions: 20, accuracy: 75 },
      { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 705, targetScore: 710, correct: 16, totalQuestions: 20, accuracy: 80 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 760, targetScore: 750, correct: 14, totalQuestions: 15, accuracy: 93.3 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 710, targetScore: 710, correct: 24, totalQuestions: 30, accuracy: 80 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 720, targetScore: 720, correct: 16, totalQuestions: 20, accuracy: 80 },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 740, targetScore: 730, correct: 17, totalQuestions: 20, accuracy: 85 }
    ],
    tryoutHistory: [
      {
        id: 'to-01',
        tryoutName: 'Tryout Akbar SNBT Nasional #1 (Diagnostik)',
        date: '2026-01-10',
        totalScore: 690,
        rank: 20,
        totalParticipants: 4200,
        passingStatus: 'KOMPETITIF',
        subtests: { pu: 700, ppu: 670, pbm: 685, pk: 735, lbi: 685, lbe: 700, pm: 715 }
      },
      {
        id: 'to-02',
        tryoutName: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
        date: '2026-01-24',
        totalScore: 715,
        rank: 14,
        totalParticipants: 5100,
        passingStatus: 'AMAN',
        subtests: { pu: 720, ppu: 685, pbm: 700, pk: 755, lbi: 705, lbe: 715, pm: 735 }
      },
      {
        id: 'to-03',
        tryoutName: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
        date: '2026-02-05',
        totalScore: 724,
        rank: 9,
        totalParticipants: 6200,
        passingStatus: 'AMAN',
        subtests: { pu: 730, ppu: 695, pbm: 710, pk: 765, lbi: 715, lbe: 725, pm: 745 }
      },
      {
        id: 'to-04',
        tryoutName: 'Tryout Prediksi Super Intensif #4',
        date: '2026-02-20',
        totalScore: 732,
        rank: 8,
        totalParticipants: 5800,
        passingStatus: 'AMAN',
        subtests: { pu: 735, ppu: 700, pbm: 715, pk: 775, lbi: 720, lbe: 730, pm: 750 }
      },
      {
        id: 'to-05',
        tryoutName: 'Tryout Final Marathon UTBK 2026 #5',
        date: '2026-03-08',
        totalScore: 740,
        rank: 7,
        totalParticipants: 6500,
        passingStatus: 'AMAN',
        subtests: { pu: 740, ppu: 710, pbm: 725, pk: 785, lbi: 730, lbe: 740, pm: 760 }
      }
    ]
  }
];

const STORAGE_KEY_SNBT_STUDENTS = 'bsa_snbt_students_v1';
const STORAGE_KEY_SNBT_COUNTDOWN = 'bsa_snbt_countdown_v1';
const STORAGE_KEY_SNBT_ROADMAP = 'bsa_snbt_roadmap_v1';

export function loadStoredSnbtRoadmapMilestones(): SnbtMilestone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNBT_ROADMAP);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SNBT_ROADMAP, JSON.stringify(SNBT_ROADMAP_MILESTONES));
      return SNBT_ROADMAP_MILESTONES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SNBT_ROADMAP_MILESTONES;
  } catch {
    return SNBT_ROADMAP_MILESTONES;
  }
}

export function saveStoredSnbtRoadmapMilestones(milestones: SnbtMilestone[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNBT_ROADMAP, JSON.stringify(milestones));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snbt-roadmap-updated', { detail: milestones }));
    }
  } catch (err) {
    console.error('Error saving SNBT roadmap milestones:', err);
  }
}

export function loadStoredSnbtStudents(): SnbtStudentProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNBT_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SNBT_STUDENTS, JSON.stringify(INITIAL_SNBT_STUDENTS));
      return INITIAL_SNBT_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Check if students have full tryout history (at least 3 tryouts), otherwise sync with INITIAL_SNBT_STUDENTS
      const needsUpgrade = parsed.some((s: SnbtStudentProfile) => !s.tryoutHistory || s.tryoutHistory.length < 3 || parsed.length < INITIAL_SNBT_STUDENTS.length);
      if (needsUpgrade) {
        localStorage.setItem(STORAGE_KEY_SNBT_STUDENTS, JSON.stringify(INITIAL_SNBT_STUDENTS));
        return INITIAL_SNBT_STUDENTS;
      }
      return parsed;
    }
    return INITIAL_SNBT_STUDENTS;
  } catch {
    return INITIAL_SNBT_STUDENTS;
  }
}

export function saveStoredSnbtStudents(students: SnbtStudentProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNBT_STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving SNBT students data:', err);
  }
}

export function loadStoredSnbtCountdownTargets(): SnbtCountdownTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNBT_COUNTDOWN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SNBT_COUNTDOWN, JSON.stringify(SNBT_COUNTDOWN_TARGETS));
      return SNBT_COUNTDOWN_TARGETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SNBT_COUNTDOWN_TARGETS;
  } catch {
    return SNBT_COUNTDOWN_TARGETS;
  }
}

export function saveStoredSnbtCountdownTargets(targets: SnbtCountdownTarget[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNBT_COUNTDOWN, JSON.stringify(targets));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snbt-countdown-updated', { detail: targets }));
    }
  } catch (err) {
    console.error('Error saving SNBT countdown targets data:', err);
  }
}

export function formatTargetDateToIndonesian(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch {
    return isoString;
  }
}

