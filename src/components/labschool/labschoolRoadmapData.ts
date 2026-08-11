export interface RoadmapPhase {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  duration: string;
  color: 'blue' | 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';
  badge: string;
  desc: string;
}

export interface RoadmapMilestone {
  id: string;
  phaseId: number;
  level: 'SMP' | 'SMA' | 'ALL';
  weekRange: string;
  title: string;
  focus: string;
  topics: string[];
  deliverables: string;
  estHours: number;
  importance: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  subtestCategory?: string;
  order?: number;
}

export const DEFAULT_ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 1,
    number: 'Fase 01',
    title: 'Diagnostic & Foundation Phase',
    subtitle: 'Penguatan Konsep Dasar & Pemetaan Kemampuan',
    duration: 'Bulan 1 - 2 (Minggu 1 - 8)',
    color: 'blue',
    badge: 'Pondasi Utama',
    desc: 'Mendiagnosis kelemahan dasar per mapel dan membangun pemahaman konsep matematika, sains, bahasa, serta pola logika TPA.'
  },
  {
    id: 2,
    number: 'Fase 02',
    title: 'Core Mastery & HOTS Logic',
    subtitle: 'Pendalaman Materi Esensial & Skolastik Intensif',
    duration: 'Bulan 3 - 4 (Minggu 9 - 16)',
    color: 'cyan',
    badge: 'Penguasaan Materi',
    desc: 'Mendalami materi kurikulum esensial berstandar Labschool UNJ dengan penekanan pada soal HOTS (Higher Order Thinking Skills).'
  },
  {
    id: 3,
    number: 'Fase 03',
    title: 'Speed, Accuracy & Time Attack',
    subtitle: 'Drill Soal Menantang & Manajemen Waktu',
    duration: 'Bulan 5 (Minggu 17 - 20)',
    color: 'amber',
    badge: 'Kecepatan & Akurasi',
    desc: 'Meningkatkan kecepatan mengerjakan (rata-rata 45-60 detik per soal) serta trik eliminasi jawaban pengecoh pada bank soal Labschool.'
  },
  {
    id: 4,
    number: 'Fase 04',
    title: 'Real Simulation & Final Polish',
    subtitle: 'Simulasi Tryout CBT & Kesiapan Mental',
    duration: 'Bulan 6 (Minggu 21 - 24 / H-30)',
    color: 'emerald',
    badge: 'Simulasi Puncak',
    desc: 'Tryout CBT adaptif menyerupai ujian resmi, evaluasi passing grade kampus pilihan, dan pendampingan wawancara serta kesiapan mental.'
  }
];

export const DEFAULT_ROADMAP_MILESTONES: RoadmapMilestone[] = [
  // FASE 1
  {
    id: 'top-1',
    phaseId: 1,
    level: 'ALL',
    weekRange: 'Minggu 1 - 2',
    title: 'Diagnostic Test & Analisis Peta Kemampuan Awal',
    focus: 'Evaluasi Baseline Skor & Identifikasi Subject Gap',
    subtestCategory: 'TPA & Diagnostik',
    topics: [
      'Pre-Test Seleksi Labschool (CBT 100 Soal Campuran)',
      'Pemetaan kelemahan per indikator kompetensi (Matematika, IPA, B. Indo, B. Inggris, TPA)',
      'Penyusunan Jadwal Belajar Mandiri & Target Kampus Pilihan (Rawamangun, Kebayoran, Cibubur, Cirendeu, Bintaro)'
    ],
    deliverables: 'Laporan Skor Baseline & Radar Chart Kompetensi Siswa',
    estHours: 12,
    importance: 'CRITICAL',
    order: 1
  },
  {
    id: 'top-2',
    phaseId: 1,
    level: 'SMP',
    weekRange: 'Minggu 3 - 5',
    title: 'Pondasi Matematika Dasar & Logika Bilangan (SMP)',
    focus: 'Aritmatika Sosial, Pecahan, Perbandingan & Pola Bilangan',
    subtestCategory: 'PK (Pengetahuan Kuantitatif)',
    topics: [
      'Operasi Hitung Campuran Bilangan Bulat, Pecahan & Desimal',
      'KPK, FPB, Faktor Prima & Aplikasi Soal Cerita',
      'Perbandingan Senilai & Berbalik Nilai, Skala Peta',
      'Dasar Aritmatika Sosial (Untung, Rugi, Diskon, Bunga Tunggal)'
    ],
    deliverables: 'Modul Latihan 80 Soal Matematika Dasar + Pembahasan',
    estHours: 18,
    importance: 'HIGH',
    order: 2
  },
  {
    id: 'top-3',
    phaseId: 1,
    level: 'SMA',
    weekRange: 'Minggu 3 - 5',
    title: 'Pondasi Aljabar & Persamaan Kuadrat (SMA)',
    focus: 'Manipulasi Aljabar, Eksponen, Bentuk Akar & Fungsi Kuadrat',
    subtestCategory: 'PK (Pengetahuan Kuantitatif)',
    topics: [
      'Pemfaktoran Aljabar Lanjut & Pecahan Aljabar',
      'Sifat-sifat Eksponen, Bentuk Akar & Logaritma Dasar',
      'Persamaan & Pertidaksamaan Linier serta Kuadrat',
      'Sistem Persamaan Linier Dua & Tiga Variabel (SPLDV/SPLTV)'
    ],
    deliverables: 'Bank Soal Aljabar & Fungsi Kuadrat HOTS (75 Soal)',
    estHours: 20,
    importance: 'CRITICAL',
    order: 3
  },
  {
    id: 'top-4',
    phaseId: 1,
    level: 'ALL',
    weekRange: 'Minggu 6 - 8',
    title: 'Pengenalan Pola Tes Potensi Akademik (TPA / Skolastik)',
    focus: 'Penalaran Verbal, Deret Angka & Logika Spasial',
    subtestCategory: 'TPA & Skolastik',
    topics: [
      'Sinonim, Antonim, Analogi Hubungan Kata & Pemahaman Istilah',
      'Deret Bilangan, Huruf & Pola Barisan Bertingkat',
      'Penalaran Gambar (Rotasi, Refleksi, Pencerminan 3D & Jaring-jaring Ruang)',
      'Silogisme Dasar (Semua - Beberapa & Penarikan Kesimpulan Sah)'
    ],
    deliverables: 'Kuis Cepat TPA 50 Soal per Sesi',
    estHours: 15,
    importance: 'HIGH',
    order: 4
  },

  // FASE 2
  {
    id: 'top-5',
    phaseId: 2,
    level: 'SMP',
    weekRange: 'Minggu 9 - 12',
    title: 'Mastery Sains Terpadu & Geometri Dasar (SMP)',
    focus: 'Fisika Pengukuran & Energi, Biologi Makhluk Hidup & Bangun Ruang',
    subtestCategory: 'Sains Terpadu',
    topics: [
      'Fisika: Besaran, Satuan, Pengukuran, Suhu & Kalor, Gerak Lurus (GLB/GLBB)',
      'Biologi: Ciri Makhluk Hidup, Ekosistem, Rantai Makanan & Sistem Organ Manusia',
      'Geometri: Luas & Keliling Bangun Datar Kompleks, Volume & Luas Permukaan Bangun Ruang',
      'Statistika Dasar: Mean, Median, Modus & Membaca Diagram Batang/Lingkaran'
    ],
    deliverables: 'Modul Sains Terpadu + 100 Soal Pembahasan',
    estHours: 22,
    importance: 'HIGH',
    order: 5
  },
  {
    id: 'top-6',
    phaseId: 2,
    level: 'SMA',
    weekRange: 'Minggu 9 - 12',
    title: 'Mastery IPA Terpadu (Fisika, Kimia, Biologi) & Geometri Analitik (SMA)',
    focus: 'Mekanika Klasik, Reaksi Kimia Dasar, Genetika & Trigonometri',
    subtestCategory: 'Sains Terpadu',
    topics: [
      'Fisika: Kinematika Gerak, Hukum Newton, Usaha & Energi, Fluida & Optik Geometri',
      'Kimia: Struktur Atom, Tabel Periodik, Ikatan Kimia & Konsep Mol Sederhana',
      'Biologi: Struktur Sel, Metabolisme, Sistem Reproduksi, Hereditas & Bioteknologi',
      'Geometri & Trigonometri: Teorema Pythagoras Lanjut, Sin/Cos/Tan Sudut Istimewa & Kesebangunan'
    ],
    deliverables: 'Paket Drill Soal IPA Saintek Terpadu 120 Soal',
    estHours: 25,
    importance: 'CRITICAL',
    order: 6
  },
  {
    id: 'top-7',
    phaseId: 2,
    level: 'ALL',
    weekRange: 'Minggu 13 - 16',
    title: 'Literasi Bahasa Indonesia & Bahasa Inggris Kritis',
    focus: 'Reading Comprehension, Ide Pokok, Kalimat Efektif & Grammar Mastery',
    subtestCategory: 'Literasi Bahasa',
    topics: [
      'Menemukan Ide Pokok, Gagasan Utama & Simpulan Paragraf Kritis',
      'Ejaan Bahasa Indonesia (EBI), Konjungsi & Struktur Kalimat Baku',
      'English: Main Idea, Inference, Vocabulary in Context & Tone of Author',
      'English: Tenses Essential, Subject-Verb Agreement & Conjunctions'
    ],
    deliverables: 'Drill 60 Soal Teks Panjang & Pembahasan Detail',
    estHours: 16,
    importance: 'HIGH',
    order: 7
  },

  // FASE 3
  {
    id: 'top-8',
    phaseId: 3,
    level: 'ALL',
    weekRange: 'Minggu 17 - 18',
    title: 'Bedah Bank Soal Asli Seleksi Labschool (5 Tahun Terakhir)',
    focus: 'Analisis Karakteristik Soal, Trik Jawaban Cepat & Jebakan Opsi',
    subtestCategory: 'Bank Soal Asli',
    topics: [
      'Bedah Soal TPA / Skolastik Asli Ujian Masuk Labschool',
      'Bedah Soal Matematika Penalaran HOTS & Pembuktian Logis',
      'Bedah Soal Sains Terpadu & Analisis Grafik Data Ilmiah',
      'Trik Eliminasi Opsi Jawaban Pengecoh dalam < 30 Detik'
    ],
    deliverables: 'Buku Kompilasi 250 Soal Asli + Video Pembahasan',
    estHours: 20,
    importance: 'CRITICAL',
    order: 8
  },
  {
    id: 'top-9',
    phaseId: 3,
    level: 'ALL',
    weekRange: 'Minggu 19 - 20',
    title: 'Time Management & Speed Drill Simulation',
    focus: 'Latihan Menjawab Cepat dengan Tekanan Waktu Riil',
    subtestCategory: 'Speed Drill',
    topics: [
      'Speed Test Matematika: 25 Soal dalam 30 Menit',
      'Speed Test TPA: 40 Soal dalam 30 Menit',
      'Speed Test Sains & Bahasa: 35 Soal dalam 30 Menit',
      'Evaluasi Kesalahan Umum (Careless Mistake Review)'
    ],
    deliverables: 'Statistik Waktu Pengerjaan per Jenis Soal',
    estHours: 18,
    importance: 'CRITICAL',
    order: 9
  },

  // FASE 4
  {
    id: 'top-10',
    phaseId: 4,
    level: 'ALL',
    weekRange: 'Minggu 21 - 22',
    title: 'Simulasi Tryout Akbar CBT Nasional Labschool (Seri 1 & 2)',
    focus: 'Simulasi Lengkap Format Digital Mirip Ujian Resmi',
    subtestCategory: 'Simulasi CBT',
    topics: [
      'Tryout Akbar CBT Seri 1 (Skor Standar & Passing Grade Kampus)',
      'Tryout Akbar CBT Seri 2 (Prediksi Soal Baru 2026/2027)',
      'Analisis Perangkingan Nasional & Rekomendasi Kampus Alternatif'
    ],
    deliverables: 'Raport Kelulusan Tryout + Sertifikat Prediksi',
    estHours: 16,
    importance: 'CRITICAL',
    order: 10
  },
  {
    id: 'top-11',
    phaseId: 4,
    level: 'ALL',
    weekRange: 'Minggu 23 - 24',
    title: 'Final Polish, Wawancara & Kesiapan Mental Menjelang H-Day',
    focus: 'Review Formula Esensial, Tips Hari-H & Penguatan Mental',
    subtestCategory: 'Wawancara & Kesiapan',
    topics: [
      'Ringkasan 1 Halaman Rumus & Konsep Kunci Seluruh Mata Uji',
      'Simulasi Wawancara & Penguatan Berkas Portofolio (Jalur PSBP)',
      'Briefing Tata Tertib Ujian, Perangkat Ujian CBT & Manajemen Stres',
      'Doa Bersama & Motivasi Sukses Tembus Labschool'
    ],
    deliverables: 'Checklist Kesiapan Hari-H & Dokumen Kartu Ujian',
    estHours: 10,
    importance: 'HIGH',
    order: 11
  }
];

const PHASES_STORAGE_KEY = 'labschool_roadmap_phases_v2';
const MILESTONES_STORAGE_KEY = 'labschool_roadmap_milestones_v2';

export const loadStoredRoadmapPhases = (): RoadmapPhase[] => {
  try {
    const saved = localStorage.getItem(PHASES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored roadmap phases', err);
  }
  return DEFAULT_ROADMAP_PHASES;
};

export const saveStoredRoadmapPhases = (phases: RoadmapPhase[]): void => {
  try {
    localStorage.setItem(PHASES_STORAGE_KEY, JSON.stringify(phases));
  } catch (err) {
    console.error('Error saving roadmap phases', err);
  }
};

export const loadStoredRoadmapMilestones = (): RoadmapMilestone[] => {
  try {
    const saved = localStorage.getItem(MILESTONES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored roadmap milestones', err);
  }
  return DEFAULT_ROADMAP_MILESTONES;
};

export const saveStoredRoadmapMilestones = (milestones: RoadmapMilestone[]): void => {
  try {
    localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
  } catch (err) {
    console.error('Error saving roadmap milestones', err);
  }
};

export const resetRoadmapToDefault = (): { phases: RoadmapPhase[]; milestones: RoadmapMilestone[] } => {
  saveStoredRoadmapPhases(DEFAULT_ROADMAP_PHASES);
  saveStoredRoadmapMilestones(DEFAULT_ROADMAP_MILESTONES);
  return {
    phases: DEFAULT_ROADMAP_PHASES,
    milestones: DEFAULT_ROADMAP_MILESTONES
  };
};
