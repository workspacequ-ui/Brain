import {
  User,
  Teacher,
  ClassItem,
  SubjectItem,
  ExamCategory,
  LearningMaterial,
  Exam,
  MarketplaceProduct,
  MarketplaceCategory,
  ExamResult,
  FeaturedProgram,
  SyllabusItem,
  AgendaItem,
  AnnouncementItem
} from '../types';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    nip: '198503152010011012',
    username: 'hendra',
    password: 'guru123',
    name: 'Dr. Hendra Wijaya, M.Pd.',
    email: 'hendra.wijaya@brainspace.id',
    phone: '081234567891',
    subject: 'Matematika & TPS Kuantitatif',
    targetClasses: ['XII-UTBK', 'XI-IPA'],
    gender: 'L',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    bio: 'Pakar Penalaran Matematika & TPS SNBT dengan pengalaman 12+ tahun membimbing ribuan siswa lolos PTN.',
    createdAt: '2025-08-10'
  },
  {
    id: 'tch-2',
    nip: '199008242015022008',
    username: 'siti',
    password: 'guru123',
    name: 'Siti Nurhaliza, S.Si., M.Sc.',
    email: 'siti.nurhaliza@brainspace.id',
    phone: '081298765432',
    subject: 'Fisika & TKA Saintek',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'X-IPA'],
    gender: 'P',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    bio: 'Spesialis Fisika Konseptual dan Bedah Soal HOTS Olimpiade & SNBT.',
    createdAt: '2025-09-01'
  },
  {
    id: 'tch-3',
    nip: '198811122014031005',
    username: 'ahmad',
    password: 'guru123',
    name: 'Ahmad Fauzi, S.Pd.',
    email: 'ahmad.fauzi@brainspace.id',
    phone: '081377889900',
    subject: 'Bahasa Indonesia & Literasi',
    targetClasses: ['XII-UTBK', 'XI-IPS', 'X-IPA'],
    gender: 'L',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    bio: 'Ahli Literasi Membaca, Pemahaman Bacaan & Menulis serta Penulisan Esai Ujian.',
    createdAt: '2025-10-15'
  },
  {
    id: 'tch-4',
    nip: '199304182018042003',
    username: 'sarah',
    password: 'guru123',
    name: 'Sarah Maharani, S.Pd., M.Ed.',
    email: 'sarah.maharani@brainspace.id',
    phone: '082155667788',
    subject: 'Bahasa Inggris & English Literacy',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'XI-IPS'],
    gender: 'P',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900ce?w=150&q=80',
    bio: 'Instruktur Bahasa Inggris IELTS & SNBT Reading Comprehension.',
    createdAt: '2025-11-20'
  },
  {
    id: 'tch-5',
    nip: '199102052016011007',
    username: 'rian',
    password: 'guru123',
    name: 'Rian Pratama, S.Si.',
    email: 'rian.pratama@brainspace.id',
    phone: '085211223344',
    subject: 'Biologi & Sains Terapan',
    targetClasses: ['XI-IPA', 'X-IPA'],
    gender: 'L',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    bio: 'Pengajar Biologi Berbasis Mind Mapping dan Visualisasi Mikroskopis.',
    createdAt: '2025-12-05'
  }
];


export const INITIAL_MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { id: 'mcat1', name: 'Buku Cetak', description: 'Buku pelajaran fisik dan soal latihan' },
  { id: 'mcat2', name: 'Paket Tryout Premium', description: 'Paket tryout online bersistem IRT' },
  { id: 'mcat3', name: 'Akses Bimbel VIP', description: 'Bimbingan belajar live interaktif' },
  { id: 'mcat4', name: 'Merchandising', description: 'Atribut & pernak-pernik resmi Brain Space' }
];

export const INITIAL_CLASSES: ClassItem[] = [
  { id: 'c1', name: 'XII-UTBK', code: 'XII-UTBK', description: 'Kelas XII Intensif Persiapan SNBT & UTBK Masuk PTN' },
  { id: 'c-smp-lab', name: 'SMP-LABSCHOOL', code: 'SMP-LABSCHOOL', description: 'Program Khusus Seleksi PSB Masuk SMP Labschool (Kelas 7)' },
  { id: 'c-sma-lab', name: 'SMA-LABSCHOOL', code: 'SMA-LABSCHOOL', description: 'Program Khusus Seleksi PSB Masuk SMA Labschool (Kelas 10)' },
  { id: 'c-sd-6', name: 'VI-SD', code: 'VI-SD', description: 'Jenjang Kelas VI-SD / Persiapan TKA SD (Kelas VI)' },
  { id: 'c-smp-9', name: 'IX-SMP', code: 'IX-SMP', description: 'Kelas IX-SMP / Persiapan TKA SMP (Kelas IX)' },
  { id: 'c-sma-12', name: 'XII-SMA', code: 'XII-SMA', description: 'Kelas XII-SMA / Persiapan TKA SMA (Kelas XII)' },
  { id: 'c2', name: 'XI-IPA', code: 'XI-IPA', description: 'Kelas XI MIPA Semester 1 & 2' },
  { id: 'c3', name: 'XI-IPS', code: 'XI-IPS', description: 'Kelas XI IPS Semester 1 & 2' },
  { id: 'c4', name: 'X-IPA', code: 'X-IPA', description: 'Kelas X Sepuluh MIPA' },
  { id: 'c5', name: 'Masuk Labschool', code: 'LABSCHOOL', description: 'Program Khusus Seleksi Labschool' }
];

export const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    id: 'sbj-1',
    name: 'Matematika & TPS Kuantitatif',
    code: 'MTK',
    group: 'Saintek & MIPA',
    description: 'Penalaran Kuantitatif, Aljabar, Geometri, Kalkulus & Matematika Dasar/Lanjut',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'X-IPA']
  },
  {
    id: 'sbj-2',
    name: 'Fisika & TKA Saintek',
    code: 'FIS',
    group: 'Saintek & MIPA',
    description: 'Mekanika, Gelombang, Termodinamika, Listrik Magnet & Fisika Modern',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'X-IPA']
  },
  {
    id: 'sbj-3',
    name: 'Kimia & TKA Saintek',
    code: 'KIM',
    group: 'Saintek & MIPA',
    description: 'Stoikiometri, Ikatan Kimia, Termokimia, Larutan & Kimia Karbon',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'X-IPA']
  },
  {
    id: 'sbj-4',
    name: 'Biologi & Sains Terapan',
    code: 'BIO',
    group: 'Saintek & MIPA',
    description: 'Biologi Sel, Metabolisme, Genetika, Evolusi & Ekologi Lingkungan',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'X-IPA']
  },
  {
    id: 'sbj-5',
    name: 'Bahasa Indonesia & Literasi',
    code: 'BIND',
    group: 'Bahasa & Literasi',
    description: 'Literasi Membaca, Pemahaman Bacaan & Menulis (PBM), serta Tata Bahasa',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'XI-IPS', 'X-IPA']
  },
  {
    id: 'sbj-6',
    name: 'Bahasa Inggris & English Literacy',
    code: 'BING',
    group: 'Bahasa & Literasi',
    description: 'Reading Comprehension, Inference, Text Structure & Grammar',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'XI-IPS', 'X-IPA']
  },
  {
    id: 'sbj-7',
    name: 'Penalaran Umum & Logika',
    code: 'PU',
    group: 'TPS & Skolastik',
    description: 'Penalaran Induktif, Deduktif, Logika Posisi & Silogisme',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'XI-IPS']
  },
  {
    id: 'sbj-8',
    name: 'Ekonomi & TPS Soshum',
    code: 'EKO',
    group: 'Soshum & IPS',
    description: 'Mikro/Makro Ekonomi, Manajemen, Pasar Modal & Akuntansi',
    targetClasses: ['XII-UTBK', 'XI-IPS']
  },
  {
    id: 'sbj-9',
    name: 'Sosiologi & Geografi',
    code: 'SOS-GEO',
    group: 'Soshum & IPS',
    description: 'Struktur Sosial, Konflik, Geografi Fisik & Dinamika Kependudukan',
    targetClasses: ['XII-UTBK', 'XI-IPS']
  },
  {
    id: 'sbj-10',
    name: 'Teknologi Informasi & Komputer',
    code: 'TIK',
    group: 'Umum & Vokasi',
    description: 'Dasar Pemrograman, Algoritma, Basis Data & Literasi Digital',
    targetClasses: ['SEMUA']
  },
  {
    id: 'sbj-pk',
    name: 'Pengetahuan Kuantitatif (PK)',
    code: 'PK',
    group: 'TPS & Skolastik',
    description: 'Operasi Aritmatika, Aljabar, Geometri, Kombinatorika & Penalaran Kuantitatif PSB Labschool',
    targetClasses: ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'sbj-kv',
    name: 'Kemampuan Verbal (KV)',
    code: 'KV',
    group: 'Bahasa & Literasi',
    description: 'Analogi Padanan Kata, Silogisme Logis, Sinonim-Antonim Bahasa Indonesia & English Vocabulary',
    targetClasses: ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'sbj-pm',
    name: 'Pemahaman Membaca (PM)',
    code: 'PM',
    group: 'Bahasa & Literasi',
    description: 'Literasi Membaca Bahasa Indonesia & English Reading Comprehension PSB Labschool',
    targetClasses: ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'sbj-aka-ipa',
    name: 'Kemampuan Akademik IPA (AKA-IPA)',
    code: 'AKA-IPA',
    group: 'Saintek & MIPA',
    description: 'Fisika Mekanika/Kalor/Optik, Biologi Sel/Sistem Organ, Kimia & Sains Terpadu Labschool',
    targetClasses: ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'sbj-aka-ips',
    name: 'Kemampuan Akademik IPS (AKA-IPS)',
    code: 'AKA-IPS',
    group: 'Soshum & IPS',
    description: 'Geografi Spasial, Ekonomi Pasar, Sejarah & Sosiologi Dinamika Sosial Seleksi Labschool',
    targetClasses: ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'sbj-sv',
    name: 'Survei Karakter (SV)',
    code: 'SV',
    group: 'Umum & Vokasi',
    description: 'Integritas Kejujuran Akademik, Empati, Anti-Bullying, Kepemimpinan & Profil Pelajar Labschool',
    targetClasses: ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'Masuk Labschool']
  }
];

export const INITIAL_CATEGORIES: ExamCategory[] = [
  { id: 'cat-saintek', name: 'Saintek & MIPA', description: 'Rumpun Sains, Teknologi, Matematika & Ilmu Pengetahuan Alam' },
  { id: 'cat-soshum', name: 'Soshum & IPS', description: 'Rumpun Sosial, Humaniora, Ekonomi, Geografi & Sosiologi' },
  { id: 'cat-tps', name: 'TPS & Skolastik', description: 'Tes Potensi Skolastik, Penalaran Umum & Literasi Kognitif' },
  { id: 'cat-bahasa', name: 'Bahasa & Literasi', description: 'Literasi Bahasa Indonesia, Bahasa Inggris & Komunikasi' },
  { id: 'cat-umum', name: 'Umum & Vokasi', description: 'Mata Pelajaran Wajib Umum, Pendidikan Karakter & Keterampilan Vokasi' },
  { id: 'cat-snbt-2026', name: 'SNBT 2026', description: 'Seleksi Nasional Berdasarkan Tes & Simulasi UTBK' },
  { id: 'cat-tka-saintek', name: 'TKA Saintek', description: 'Tes Kemampuan Akademik Saintek' },
  { id: 'cat-ujian-sekolah', name: 'Ujian Sekolah', description: 'Penilaian Akhir Semester & Ujian Sekolah Terstandar' },
  { id: 'cat-masuk-labschool', name: 'Masuk Labschool', description: 'Seleksi Penerimaan Siswa Baru Labschool' },
  { id: 'cat-tryout-premium', name: 'Tryout Premium', description: 'Paket Tryout Eksklusif & Evaluasi Intensif' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    nis: 'ADMIN001',
    name: 'Administrator Utama',
    email: 'admin@brainspace.id',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    className: 'SEMUA',
    phone: '081234567890',
    whatsapp: '081234567890',
    group: 'Admin Pusat',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  },
  {
    id: 'tch-1',
    nis: '198503152010011012',
    name: 'Dr. Hendra Wijaya, M.Pd.',
    email: 'hendra.wijaya@brainspace.id',
    username: 'hendra',
    password: 'guru123',
    role: 'teacher',
    className: 'XII-UTBK',
    subject: 'Matematika & TPS Kuantitatif',
    targetClasses: ['XII-UTBK', 'XI-IPA'],
    phone: '081234567891',
    whatsapp: '081234567891',
    group: 'Dewan Guru Sains',
    status: 'ACTIVE',
    createdAt: '2025-08-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    bio: 'Pakar Penalaran Matematika & TPS SNBT dengan pengalaman 12+ tahun membimbing ribuan siswa lolos PTN.'
  },
  {
    id: 'tch-2',
    nis: '199008242015022008',
    name: 'Siti Nurhaliza, S.Si., M.Sc.',
    email: 'siti.nurhaliza@brainspace.id',
    username: 'siti',
    password: 'guru123',
    role: 'teacher',
    className: 'XII-UTBK',
    subject: 'Fisika & TKA Saintek',
    targetClasses: ['XII-UTBK', 'XI-IPA', 'X-IPA'],
    phone: '081298765432',
    whatsapp: '081298765432',
    group: 'Dewan Guru Sains',
    status: 'ACTIVE',
    createdAt: '2025-09-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    bio: 'Spesialis Fisika Konseptual dan Bedah Soal HOTS Olimpiade & SNBT.'
  },
  {
    id: 'u-s1',
    nis: '20261001',
    name: 'Budi Santoso',
    email: 'budi@student.com',
    username: 'budi',
    password: 'user123',
    role: 'student',
    className: 'XII-UTBK',
    phone: '081298765431',
    whatsapp: '081298765431',
    group: 'Kelompok 1 - Alpha (UTBK)',
    status: 'ACTIVE',
    createdAt: '2026-01-15',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
  },
  {
    id: 'u-s2',
    nis: '20261002',
    name: 'Siti Rahmawati',
    email: 'siti@student.com',
    password: 'user123',
    role: 'student',
    className: 'XI-IPA',
    phone: '085712345678',
    whatsapp: '085712345678',
    group: 'Kelompok 2 - Einstein',
    status: 'ACTIVE',
    createdAt: '2026-01-18',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
  },
  {
    id: 'u-s3',
    nis: '20261005',
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@student.com',
    password: 'user123',
    role: 'student',
    className: 'XII-UTBK',
    phone: '082188776655',
    whatsapp: '082188776655',
    group: 'Kelompok 1 - Alpha (UTBK)',
    status: 'ACTIVE',
    createdAt: '2026-01-20',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
  },
  {
    id: 'u-s4',
    nis: '20261006',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@student.com',
    username: 'dewi',
    password: 'user123',
    role: 'student',
    className: 'XI-IPA',
    phone: '081399887766',
    whatsapp: '081399887766',
    group: 'Kelompok 2 - Einstein (Reguler)',
    status: 'ACTIVE',
    bio: 'Siswa Reguler Kelas XI-IPA MIPA SMA | Kurikulum Nasional & Penilaian Semester',
    createdAt: '2026-01-22',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80'
  },
  {
    id: 'u-s5',
    nis: '20261007',
    name: 'Rizky Pratama',
    email: 'rizky.pratama@student.com',
    password: 'user123',
    role: 'student',
    className: 'XI-IPS',
    phone: '087811223344',
    whatsapp: '087811223344',
    group: 'Kelompok 3 - Galileo',
    status: 'ACTIVE',
    createdAt: '2026-01-25',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80'
  },
  {
    id: 'u-s6',
    nis: '20261008',
    name: 'Nabila Zahra',
    email: 'nabila.zahra@student.com',
    password: 'user123',
    role: 'student',
    className: 'X-IPA',
    phone: '089655443322',
    whatsapp: '089655443322',
    group: 'Kelompok 4 - Curie',
    status: 'ACTIVE',
    createdAt: '2026-01-28',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'
  },
  {
    id: 'u-p1',
    nis: '20261003',
    name: 'Rian Hidayat',
    email: 'rian@pending.com',
    password: 'user123',
    role: 'student',
    className: 'XII-UTBK',
    phone: '081277665544',
    whatsapp: '081277665544',
    group: 'Kelompok 1 - Alpha (UTBK)',
    status: 'PENDING',
    createdAt: '2026-02-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },
  {
    id: 'u-p2',
    nis: '20261004',
    name: 'Anisa Putri',
    email: 'anisa@pending.com',
    password: 'user123',
    role: 'student',
    className: 'XI-IPS',
    phone: '085299881122',
    whatsapp: '085299881122',
    group: 'Kelompok 3 - Galileo',
    status: 'PENDING',
    createdAt: '2026-02-01',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80'
  },
  // --- SISWA TERDAFTAR KELAS SMP-LABSCHOOL ---
  {
    id: 'u-smp-lab-1',
    nis: '20267001',
    name: 'Raditya Pratama Putra',
    email: 'raditya.pratama@student.com',
    username: 'raditya',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '081298112233',
    whatsapp: '081298112233',
    group: 'Kelompok Alpha (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Rawamangun | Jalur Tes Seleksi CBT | Nilai Tryout Terakhir: 865',
    createdAt: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
  },
  {
    id: 'u-smp-lab-2',
    nis: '20267002',
    name: 'Keisha Aurelia Putri',
    email: 'keisha.aurelia@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '081388223344',
    whatsapp: '081388223344',
    group: 'Kelompok Beta (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Kebayoran | Jalur PSBP Prestasi Rapor & Sains | Juara 1 OSN IPA',
    createdAt: '2026-01-12',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80'
  },
  {
    id: 'u-smp-lab-3',
    nis: '20267003',
    name: 'M. Rizky Fadhilah',
    email: 'rizky.fadhilah@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '085711224455',
    whatsapp: '085711224455',
    group: 'Kelompok Gamma (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Cibubur | Jalur Tes Seleksi CBT | Fokus Pendalaman Matematika HOTS',
    createdAt: '2026-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },
  {
    id: 'u-smp-lab-4',
    nis: '20267004',
    name: 'Kayla Zahra Syarafina',
    email: 'kayla.zahra@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '082199334455',
    whatsapp: '082199334455',
    group: 'Kelompok Delta (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Cirendeu | Jalur Tes Seleksi CBT & TPA Skolastik',
    createdAt: '2026-01-18',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'
  },
  {
    id: 'u-smp-lab-5',
    nis: '20267005',
    name: 'Davin Alfarizi Ramadhan',
    email: 'davin.alfarizi@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '081277445566',
    whatsapp: '081277445566',
    group: 'Kelompok Alpha (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Rawamangun | Jalur Tes Seleksi CBT | Rapor Rata-rata 91.5',
    createdAt: '2026-01-20',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
  },
  {
    id: 'u-smp-lab-6',
    nis: '20267006',
    name: 'Naura Sabrina Azzahra',
    email: 'naura.sabrina@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '087811998877',
    whatsapp: '087811998877',
    group: 'Kelompok Beta (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Kebayoran | Jalur Tes Seleksi & Bahasa Inggris',
    createdAt: '2026-01-22',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
  },
  {
    id: 'u-smp-lab-7',
    nis: '20267007',
    name: 'Keenan Arkananta',
    email: 'keenan.arkan@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '089611223344',
    whatsapp: '089611223344',
    group: 'Kelompok Gamma (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Cibubur | Jalur Tes Seleksi CBT | Juara Robotik Tingkat Provinsi',
    createdAt: '2026-01-25',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80'
  },
  {
    id: 'u-smp-lab-8',
    nis: '20267008',
    name: 'Althaf Xavier Danendra',
    email: 'althaf.xavier@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMP-LABSCHOOL',
    phone: '085233445566',
    whatsapp: '085233445566',
    group: 'Kelompok Delta (SMP-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMP Labschool Cirendeu | Jalur Mandiri & Tes Terpadu Labschool',
    createdAt: '2026-01-28',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  },

  // --- SISWA TERDAFTAR KELAS SMA-LABSCHOOL ---
  {
    id: 'u-sma-lab-1',
    nis: '20261011',
    name: 'Arya Dewantara Putra',
    email: 'arya.dewantara@student.com',
    username: 'arya',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '081233998877',
    whatsapp: '081233998877',
    group: 'Kelompok Garuda (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Kebayoran | Peminatan MIPA Saintek | Nilai Tryout: 890 (Top 5%)',
    createdAt: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
  },
  {
    id: 'u-sma-lab-2',
    nis: '20261012',
    name: 'Amanda Felicia Wardani',
    email: 'amanda.felicia@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '085799887766',
    whatsapp: '085799887766',
    group: 'Kelompok Elang (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Rawamangun | Peminatan MIPA Kedokteran | Jalur PPSB Prestasi Rapor 93.4',
    createdAt: '2026-01-12',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80'
  },
  {
    id: 'u-sma-lab-3',
    nis: '20261013',
    name: 'Dimas Arya Satya',
    email: 'dimas.satya@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '081388112233',
    whatsapp: '081388112233',
    group: 'Kelompok Rajawali (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Cirendeu | Peminatan IPS Soshum & Ekonomi | Jalur Tes Seleksi CBT',
    createdAt: '2026-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },
  {
    id: 'u-sma-lab-4',
    nis: '20261014',
    name: 'Zahra Khairunnisa',
    email: 'zahra.khairunnisa@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '082155443322',
    whatsapp: '082155443322',
    group: 'Kelompok Garuda (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Cibubur | Peminatan MIPA Teknik | Nilai TPS Kuantitatif 920',
    createdAt: '2026-01-18',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
  },
  {
    id: 'u-sma-lab-5',
    nis: '20261015',
    name: 'Farhan Maulana Yusuf',
    email: 'farhan.maulana@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '087822334455',
    whatsapp: '087822334455',
    group: 'Kelompok Elang (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Kebayoran | Peminatan MIPA IT & Komputer | Juara KSN Matematika SMP',
    createdAt: '2026-01-20',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
  },
  {
    id: 'u-sma-lab-6',
    nis: '20261016',
    name: 'Syifa Azzahra Putri',
    email: 'syifa.azzahra@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '089677889900',
    whatsapp: '089677889900',
    group: 'Kelompok Rajawali (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Rawamangun | Peminatan IPS Hubungan Internasional & Bahasa Inggris',
    createdAt: '2026-01-22',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'
  },
  {
    id: 'u-sma-lab-7',
    nis: '20261017',
    name: 'Rafif Danish Pratama',
    email: 'rafif.danish@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '085288991122',
    whatsapp: '085288991122',
    group: 'Kelompok Garuda (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Cirendeu | Peminatan MIPA Farmasi | Jalur Tes Terpadu Labschool',
    createdAt: '2026-01-25',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80'
  },
  {
    id: 'u-sma-lab-8',
    nis: '20261018',
    name: 'Nadine Aurelia Salma',
    email: 'nadine.salma@student.com',
    password: 'user123',
    role: 'student',
    className: 'SMA-LABSCHOOL',
    phone: '081266554433',
    whatsapp: '081266554433',
    group: 'Kelompok Elang (SMA-Labs)',
    status: 'ACTIVE',
    bio: 'Target: SMA Labschool Cibubur | Peminatan MIPA Kedokteran | Skor Tryout Rata-rata 875',
    createdAt: '2026-01-28',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80'
  },

  // --- SISWA TERDAFTAR KELAS VI-SD (TARGET: TO-TKA SD) ---
  {
    id: 'u-sd-1',
    nis: '20266001',
    name: 'Aditya Maulana Pratama',
    email: 'aditya.sd@student.com',
    username: 'aditya',
    password: 'user123',
    role: 'student',
    className: 'VI-SD',
    phone: '081266778899',
    whatsapp: '081266778899',
    group: 'Kelas VI SD (TKA Dasar)',
    status: 'ACTIVE',
    bio: 'Siswa Jenjang SD Kelas VI | Persiapan Ujian Sekolah & TO-TKA SD',
    createdAt: '2026-01-20',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  },

  // --- SISWA TERDAFTAR KELAS IX-SMP (TARGET: TO-TKA SMP) ---
  {
    id: 'u-smp-1',
    nis: '20269001',
    name: 'Naufal Azka Ramadhan',
    email: 'naufal.smp@student.com',
    username: 'naufal',
    password: 'user123',
    role: 'student',
    className: 'IX-SMP',
    phone: '081377889911',
    whatsapp: '081377889911',
    group: 'Kelas IX SMP (TKA Menengah)',
    status: 'ACTIVE',
    bio: 'Siswa Kelas IX SMP | Persiapan Asesmen Akademik & TO-TKA SMP',
    createdAt: '2026-01-22',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },

  // --- SISWA TERDAFTAR KELAS XII-SMA (TARGET: TO-TKA SMA) ---
  {
    id: 'u-sma-1',
    nis: '20261201',
    name: 'Rendra Kusuma Wijaya',
    email: 'rendra.sma@student.com',
    username: 'rendra',
    password: 'user123',
    role: 'student',
    className: 'XII-SMA',
    phone: '081299887722',
    whatsapp: '081299887722',
    group: 'Kelas XII SMA (TKA Lanjutan)',
    status: 'ACTIVE',
    bio: 'Siswa Kelas XII SMA | Penguatan Akademik Saintek & TO-TKA SMA',
    createdAt: '2026-01-25',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
  }
];

export const INITIAL_MATERIALS: LearningMaterial[] = [
  {
    id: 'm1',
    title: 'Modul Ringkas Penalaran Matematika SNBT 2026',
    description: 'Panduan lengkap rumus cepat, trik eliminasi opsi, dan pembahasan soal HOTS Penalaran Matematika.',
    targetClass: 'XII-UTBK',
    subject: 'Matematika & TPS Kuantitatif',
    mediaType: 'PDF',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2026-01-20',
    syllabusId: 'sil-1',
    syllabusCode: 'SIL-MTK-XII-01',
    syllabusTitle: 'Silabus Intensif Penalaran Matematika & TPS Kuantitatif SNBT',
    syllabusTopicId: 'top-1-1',
    meetingNumber: 1,
    topicTitle: 'Sistem Bilangan & Trik Operasi Pecahan/Eksponen'
  },
  {
    id: 'm2',
    title: 'Video Strategi Membedah Soal PPU & Literasi Bahasa Indonesia',
    description: 'Trik menemukan ide pokok paragraf dalam waktu 30 detik untuk ujian SNBT.',
    targetClass: 'XII-UTBK',
    subject: 'Bahasa Indonesia & Literasi',
    mediaType: 'VIDEO',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: '2026-01-22',
    syllabusId: 'sil-3',
    syllabusCode: 'SIL-IND-XII-01',
    syllabusTitle: 'Silabus Literasi Bahasa Indonesia & Pemahaman Bacaan (PBM/PPU)',
    syllabusTopicId: 'top-3-1',
    meetingNumber: 1,
    topicTitle: 'Ide Pokok, Kalimat Utama & Struktur Paragraf Kritis'
  },
  {
    id: 'm3',
    title: 'Slide Presentasi Fisika: Kinematika & Hukum Newton',
    description: 'Materi interaktif gerak lurus beraturan, gerak parabola, dan dinamika gerak.',
    targetClass: 'XI-IPA',
    subject: 'Fisika & TKA Saintek',
    mediaType: 'PPT',
    url: 'https://docs.google.com/gview?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2026-01-25',
    syllabusId: 'sil-2',
    syllabusCode: 'SIL-FIS-XI-01',
    syllabusTitle: 'Silabus Fisika Mekanika & Gelombang Kelas XI',
    syllabusTopicId: 'top-2-1',
    meetingNumber: 1,
    topicTitle: 'Kinematika Gerak Lurus & Gerak Parabola'
  },
  {
    id: 'm4',
    title: 'Ringkasan Materi Ekonomi & Akuntansi Dasar',
    description: 'Pembahasan siklus akuntansi perusahaan jasa dan perhitungan jurnal penyesuaian.',
    targetClass: 'XI-IPS',
    subject: 'Ekonomi & Soshum',
    mediaType: 'PDF',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2026-01-28'
  }
];

export const INITIAL_EXAMS: Exam[] = [
  // 0. EXEMPLAR TRYOUT IRT MULTI-SUBTEST: TO-SNBT KEMAMPUAN VERBAL
  {
    id: 'exam-to-snbt-verbal',
    title: 'Tryout UTBK-SNBT 2026 - Kemampuan Verbal (Multi-Subtes)',
    category: 'SNBT 2026',
    targetClass: 'XII-UTBK',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-SNBT',
    durationMinutes: 45,
    mode: 'NATIVE_CBT',
    token: 'VERBAL26',
    isTokenPublic: true,
    isIRTEnabled: true,
    scoringMethod: 'IRT',
    shuffleQuestions: false,
    passingScore: 650,
    allowRetake: true,
    maxAttempts: 3,
    deadline: '2026-12-31 23:59',
    totalQuestions: 6,
    createdAt: '2026-02-01',
    subtests: [
      {
        id: 'sub-vbi',
        code: 'VBI',
        name: 'Verbal Bahasa Indonesia',
        description: 'Pemahaman wacana, sinonim, analogi kata, dan penalaran induktif-deduktif Bahasa Indonesia.',
        questionCount: 3,
        durationMinutes: 20
      },
      {
        id: 'sub-vbe',
        code: 'VBE',
        name: 'Verbal Bahasa Inggris',
        description: 'Reading comprehension, context vocabulary, and text reasoning in English.',
        questionCount: 3,
        durationMinutes: 25
      }
    ],
    questions: [
      {
        id: 'q-vbi-1',
        subtestId: 'sub-vbi',
        number: 1,
        text: 'Manakah pasangan kata berikut yang memiliki hubungan analogi yang paling sepadan dengan EMAS : TAMBANG?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Kayu : Hutan' },
          { key: 'B', text: 'Garam : Dapur' },
          { key: 'C', text: 'Kain : Jahit' },
          { key: 'D', text: 'Ikan : Pasar' },
          { key: 'E', text: 'Minyak : Pabrik' }
        ],
        correctAnswer: 'A',
        weight: 1,
        irtDiscrimination: 1.35,
        irtDifficulty: -0.2,
        irtGuessing: 0.2,
        discussion: 'Emas diperoleh/dihasilkan secara alami dari tambang, sebagaimana kayu dihasilkan secara alami dari hutan.'
      },
      {
        id: 'q-vbi-2',
        subtestId: 'sub-vbi',
        number: 2,
        text: 'Sinonim yang paling tepat untuk kata "INKLUSIF" dalam konteks kebijakan pendidikan adalah...',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Terbuka dan merangkul semua golongan' },
          { key: 'B', text: 'Khusus untuk kelompok berprestasi' },
          { key: 'C', text: 'Tertutup bagi pihak eksternal' },
          { key: 'D', text: 'Berdasarkan status sosial ekonomi' },
          { key: 'E', text: 'Hanya untuk jenjang lanjutan' }
        ],
        correctAnswer: 'A',
        weight: 1,
        irtDiscrimination: 1.45,
        irtDifficulty: 0.3,
        irtGuessing: 0.2,
        discussion: 'Inklusif bermakna menyeluruh, mencakup, dan merangkul semua kalangan tanpa diskriminasi.'
      },
      {
        id: 'q-vbi-3',
        subtestId: 'sub-vbi',
        number: 3,
        text: 'Semua ilmuwan berpikir kritis. Beberapa penemu adalah ilmuwan. Kesimpulan yang sah adalah...',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Beberapa penemu berpikir kritis' },
          { key: 'B', text: 'Semua penemu berpikir kritis' },
          { key: 'C', text: 'Tidak ada penemu yang berpikir kritis' },
          { key: 'D', text: 'Semua yang berpikir kritis adalah ilmuwan' },
          { key: 'E', text: 'Hanya ilmuwan yang menjadi penemu' }
        ],
        correctAnswer: 'A',
        weight: 1,
        irtDiscrimination: 1.6,
        irtDifficulty: 0.7,
        irtGuessing: 0.2,
        discussion: 'Berdasarkan silogisme kategorik, irisan antara penemu dan ilmuwan menghasilkan kesimpulan bahwa beberapa penemu berpikir kritis.'
      },
      {
        id: 'q-vbe-1',
        subtestId: 'sub-vbe',
        number: 4,
        text: 'Choose the word that is closest in meaning to the highlighted word: "The new renewable energy policy aims to MITIGATE the severe impacts of global warming."',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Reduce' },
          { key: 'B', text: 'Accelerate' },
          { key: 'C', text: 'Ignore' },
          { key: 'D', text: 'Complicate' },
          { key: 'E', text: 'Highlight' }
        ],
        correctAnswer: 'A',
        weight: 1,
        irtDiscrimination: 1.4,
        irtDifficulty: 0.1,
        irtGuessing: 0.2,
        discussion: '"Mitigate" means to make something less severe or harmful, which is synonymous with "Reduce".'
      },
      {
        id: 'q-vbe-2',
        subtestId: 'sub-vbe',
        number: 5,
        text: 'According to modern linguistics, learning a second language not only enhances communication skills _____ also boosts cognitive flexibility and problem-solving abilities.',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'but' },
          { key: 'B', text: 'and' },
          { key: 'C', text: 'so' },
          { key: 'D', text: 'whereas' },
          { key: 'E', text: 'although' }
        ],
        correctAnswer: 'A',
        weight: 1,
        irtDiscrimination: 1.5,
        irtDifficulty: 0.4,
        irtGuessing: 0.2,
        discussion: 'The correlative conjunction pair is "not only ... but (also)".'
      },
      {
        id: 'q-vbe-3',
        subtestId: 'sub-vbe',
        number: 6,
        text: '"If the scientific team had completed the clinical trial earlier, the vaccine _____ distributed months ahead of schedule."',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'would have been' },
          { key: 'B', text: 'will have been' },
          { key: 'C', text: 'was being' },
          { key: 'D', text: 'would be' },
          { key: 'E', text: 'is going to be' }
        ],
        correctAnswer: 'A',
        weight: 1,
        irtDiscrimination: 1.7,
        irtDifficulty: 1.1,
        irtGuessing: 0.2,
        discussion: 'This is a Third Conditional sentence expressing an unreal past situation: If + Past Perfect, Subject + would have + V3 / been.'
      }
    ]
  },

  // 1. TRYOUT: TO-SNBT
  {
    id: 'exam-pdf-1',
    title: 'Simulasi UTBK-SNBT 2026 - Kemampuan Penalaran Umum (KPU)',
    category: 'SNBT 2026',
    targetClass: 'XII-UTBK',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-SNBT',
    durationMinutes: 30,
    mode: 'EMBED_DRIVE_PDF',
    pdfDriveUrl: 'https://drive.google.com/file/d/1Bzx7tT3i82xR1y9O0-G6kQ1h7U63N_f2/preview',
    token: 'SNBT2026',
    isTokenPublic: true,
    shuffleQuestions: false,
    passingScore: 70,
    allowRetake: true,
    maxAttempts: 2,
    deadline: '2026-12-31 23:59',
    totalQuestions: 10,
    createdAt: '2026-01-20',
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `q-pdf-${i + 1}`,
      number: i + 1,
      text: `Nomor ${i + 1}: Silakan cermati lembar soal PDF di panel sebelah kiri untuk menjawab soal nomor ${i + 1}.`,
      questionType: 'SINGLE_CHOICE',
      options: [
        { key: 'A', text: 'Pilihan A' },
        { key: 'B', text: 'Pilihan B' },
        { key: 'C', text: 'Pilihan C' },
        { key: 'D', text: 'Pilihan D' },
        { key: 'E', text: 'Pilihan E' }
      ],
      correctAnswer: ['A', 'B', 'C', 'D', 'E'][i % 5],
      weight: 10,
      discussion: `Pembahasan Nomor ${i + 1}: Berdasarkan analisis data pada dokumen PDF halaman ${Math.floor(i / 3) + 1}, opsi yang paling tepat adalah kunci jawaban yang tertera.`
    }))
  },

  // 2. TRYOUT: TO-SMA LABSCHOOL
  {
    id: 'exam-to-sma-lab',
    title: 'Tryout Seleksi PSB SMA Labschool 2026 - Kemampuan Akademik (AKA IPA/IPS)',
    category: 'Masuk Labschool',
    targetClass: 'SMA-LABSCHOOL',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-SMA LABSCHOOL',
    durationMinutes: 60,
    mode: 'NATIVE_CBT',
    token: 'SMALABS',
    isTokenPublic: true,
    shuffleQuestions: true,
    passingScore: 75,
    allowRetake: true,
    maxAttempts: 2,
    deadline: '2026-12-31 23:59',
    totalQuestions: 5,
    createdAt: '2026-01-22',
    questions: [
      {
        id: 'q-sml-1',
        number: 1,
        text: 'Sebuah bola dilemparkan vertikal ke atas dengan kecepatan awal 20 m/s. Jika percepatan gravitasi g = 10 m/s², berapakah tinggi maksimum yang dicapai bola?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '10 meter' },
          { key: 'B', text: '15 meter' },
          { key: 'C', text: '20 meter' },
          { key: 'D', text: '25 meter' },
          { key: 'E', text: '40 meter' }
        ],
        correctAnswer: 'C',
        weight: 20,
        discussion: 'Hmax = v0² / (2g) = (20)² / (2 * 10) = 400 / 20 = 20 meter.'
      },
      {
        id: 'q-sml-2',
        number: 2,
        text: 'Manakah dari faktor berikut yang mempengaruhi pergeseran kurva permintaan ke kanan dalam teori ekonomi makro? (Pilih semua yang tepat)',
        questionType: 'COMPLEX_CHOICE',
        options: [
          { key: 'A', text: 'Kenaikan pendapatan rata-rata masyarakat' },
          { key: 'B', text: 'Kenaikan harga bahan baku produksi' },
          { key: 'C', text: 'Pertambahan jumlah penduduk / konsumen' },
          { key: 'D', text: 'Ekspektasi kenaikan harga barang di masa mendatang' }
        ],
        correctAnswer: ['A', 'C', 'D'],
        weight: 20,
        discussion: 'Kurva permintaan bergeser ke kanan ketika pendapatan naik, populasi bertambah, atau konsumen mengantisipasi harga akan naik.'
      },
      {
        id: 'q-sml-3',
        number: 3,
        text: 'Pernyataan: "Mitokondria merupakan organel sel yang berfungsi menghasilkan ATP melalui respirasi seluler."',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 20,
        discussion: 'BENAR. Mitokondria adalah the powerhouse of the cell tempat siklus Krebs dan fosforilasi oksidatif terjadi.'
      },
      {
        id: 'q-sml-4',
        number: 4,
        text: 'Hitunglah nilai dari limit: lim (x -> 3) [(x² - 9) / (x - 3)]',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '0' },
          { key: 'B', text: '3' },
          { key: 'C', text: '6' },
          { key: 'D', text: '9' },
          { key: 'E', text: 'Tidak terdefinisi' }
        ],
        correctAnswer: 'C',
        weight: 20,
        discussion: '(x² - 9)/(x - 3) = (x - 3)(x + 3)/(x - 3) = x + 3. Substitusi x = 3 => 3 + 3 = 6.'
      },
      {
        id: 'q-sml-5',
        number: 5,
        text: 'Sebutkan nama perjanjian bersejarah yang mengakhiri Perang Dunia I pada tahun 1919!',
        questionType: 'ESSAY',
        correctAnswer: 'Perjanjian Versailles',
        weight: 20,
        discussion: 'Perjanjian Versailles (Treaty of Versailles) ditandatangani pada 28 Juni 1919 di Balai Cermin Istana Versailles, Prancis.'
      }
    ]
  },

  // 3. TRYOUT: TO-SMP LABSCHOOL
  {
    id: 'exam-to-smp-lab',
    title: 'Tryout Seleksi PSB SMP Labschool 2026 - Kemampuan Kuantitatif & Verbal',
    category: 'Masuk Labschool',
    targetClass: 'SMP-LABSCHOOL',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-SMP LABSCHOOL',
    durationMinutes: 45,
    mode: 'NATIVE_CBT',
    token: 'SMPLABS',
    isTokenPublic: true,
    shuffleQuestions: true,
    passingScore: 70,
    allowRetake: true,
    maxAttempts: 2,
    deadline: '2026-12-31 23:59',
    totalQuestions: 5,
    createdAt: '2026-01-24',
    questions: [
      {
        id: 'q-spl-1',
        number: 1,
        text: 'ANALOGI KATA: GELAP : LAMPU = HAUS : ...',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'MAKANAN' },
          { key: 'B', text: 'AIR' },
          { key: 'C', text: 'DAHAGA' },
          { key: 'D', text: 'KERONGKONGAN' },
          { key: 'E', text: 'PANAS' }
        ],
        correctAnswer: 'B',
        weight: 20,
        discussion: 'Gelap diatasi dengan Lampu, Haus diatasi dengan Air.'
      },
      {
        id: 'q-spl-2',
        number: 2,
        text: 'Jika 3 buah buku dan 2 pensil harganya Rp 24.000, sedangkan harga 1 buku Rp 6.000, berapakah harga 1 pensil?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Rp 2.000' },
          { key: 'B', text: 'Rp 3.000' },
          { key: 'C', text: 'Rp 4.000' },
          { key: 'D', text: 'Rp 5.000' },
          { key: 'E', text: 'Rp 6.000' }
        ],
        correctAnswer: 'B',
        weight: 20,
        discussion: '3 buku = 3 * 6.000 = 18.000. 2 pensil = 24.000 - 18.000 = 6.000. 1 pensil = 6.000 / 2 = Rp 3.000.'
      },
      {
        id: 'q-spl-3',
        number: 3,
        text: 'Pernyataan: "Semua mamalia bernapas dengan paru-paru dan sebagian besar melahirkan anaknya."',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 20,
        discussion: 'BENAR. Ciri khas mamalia adalah bernapas dengan paru-paru dan memiliki kelenjar susu untuk menyusui.'
      },
      {
        id: 'q-spl-4',
        number: 4,
        text: 'Pilihlah bilangan prima yang terletak di antara 20 dan 35! (PILIH LEBIH DARI SATU)',
        questionType: 'COMPLEX_CHOICE',
        options: [
          { key: 'A', text: '23' },
          { key: 'B', text: '27' },
          { key: 'C', text: '29' },
          { key: 'D', text: '31' },
          { key: 'E', text: '33' }
        ],
        correctAnswer: ['A', 'C', 'D'],
        weight: 20,
        discussion: 'Bilangan prima antara 20 dan 35 adalah 23, 29, dan 31. (27 habis dibagi 3/9, 33 habis dibagi 3/11).'
      },
      {
        id: 'q-spl-5',
        number: 5,
        text: 'Berapa luas persegi yang memiliki keliling 48 cm?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '96 cm²' },
          { key: 'B', text: '120 cm²' },
          { key: 'C', text: '144 cm²' },
          { key: 'D', text: '169 cm²' },
          { key: 'E', text: '196 cm²' }
        ],
        correctAnswer: 'C',
        weight: 20,
        discussion: 'Sisi s = 48 / 4 = 12 cm. Luas = s * s = 12 * 12 = 144 cm².'
      }
    ]
  },

  // 4. TRYOUT: TO-TKA SMA
  {
    id: 'exam-cbt-1',
    title: 'Tryout TKA SMA - Matematika & Fisika Saintek',
    category: 'TKA Saintek',
    targetClass: 'XII-SMA',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-TKA SMA',
    durationMinutes: 40,
    mode: 'NATIVE_CBT',
    token: 'TKASAIN',
    isTokenPublic: false,
    shuffleQuestions: true,
    passingScore: 75,
    allowRetake: false,
    maxAttempts: 1,
    deadline: '2026-12-31 23:59',
    totalQuestions: 5,
    createdAt: '2026-01-25',
    questions: [
      {
        id: 'q1',
        number: 1,
        text: 'Diketahui persamaan kuadrat x² - (k + 2)x + 16 = 0 memiliki dua akar real yang sama. Berapakah nilai positif dari k?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'k = 4' },
          { key: 'B', text: 'k = 6' },
          { key: 'C', text: 'k = 8' },
          { key: 'D', text: 'k = 10' },
          { key: 'E', text: 'k = 12' }
        ],
        correctAnswer: 'B',
        weight: 20,
        discussion: 'Syarat akar sama adalah Diskriminan D = 0. b² - 4ac = 0 => (k+2)² - 4(1)(16) = 0 => (k+2)² = 64 => k + 2 = 8 => k = 6.'
      },
      {
        id: 'q2',
        number: 2,
        text: 'Manakah dari pernyataan berikut yang merupakan Sifat-Sifat Gelombang Elektromagnetik? (PILIH LEBIH DARI SATU JAWABAN)',
        questionType: 'COMPLEX_CHOICE',
        options: [
          { key: 'A', text: 'Merupakan gelombang transversal' },
          { key: 'B', text: 'Memerlukan medium materi untuk merambat' },
          { key: 'C', text: 'Dapat mengalami peristiwa polarisasi' },
          { key: 'D', text: 'Laju rambatnya di ruang hampa bernilai konstan (c = 3 x 10⁸ m/s)' },
          { key: 'E', text: 'Bermuatan listrik negatif saat melewati medan magnet' }
        ],
        correctAnswer: ['A', 'C', 'D'],
        weight: 20,
        discussion: 'Gelombang elektromagnetik adalah gelombang transversal yang tidak memerlukan medium dan dapat merambat di ruang hampa dengan kecepatan c serta dapat terpolarisasi.'
      },
      {
        id: 'q3',
        number: 3,
        text: 'Tentukan kebenaran dari pernyataan berikut: "Suatu benda yang bergerak melingkar beraturan mengalami percepatan sentripetal yang arahnya selalu menuju ke pusat lingkaran."',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 20,
        discussion: 'BENAR. Percepatan sentripetal senantiasa tegak lurus dengan arah kecepatan linier dan selalu mengarah ke titik pusat lintasan lingkaran.'
      },
      {
        id: 'q4',
        number: 4,
        text: 'Sebutkan organel sel tumbuhan yang berfungsi sebagai tempat terjadinya proses fotosintesis!',
        questionType: 'ESSAY',
        correctAnswer: 'Kloroplas',
        weight: 20,
        discussion: 'Fotosintesis terjadi di organel Kloroplas yang mengandung pigmen klorofil untuk menangkap energi cahaya matahari.'
      },
      {
        id: 'q5',
        number: 5,
        text: 'Sebuah mobil bermassa 1000 kg bergerak dengan kecepatan 20 m/s. Hitunglah energi kinetik mobil tersebut!',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '100 kJ' },
          { key: 'B', text: '150 kJ' },
          { key: 'C', text: '200 kJ' },
          { key: 'D', text: '250 kJ' },
          { key: 'E', text: '400 kJ' }
        ],
        correctAnswer: 'C',
        weight: 20,
        discussion: 'Ek = 1/2 * m * v² = 1/2 * 1000 * (20)² = 500 * 400 = 200.000 Joule = 200 kJ.'
      }
    ]
  },

  // 5. TRYOUT: TO-TKA SMP
  {
    id: 'exam-to-tka-smp',
    title: 'Tryout TO-TKA SMP - Penilaian Kompetensi Akademik Terpadu',
    category: 'Ujian Sekolah',
    targetClass: 'IX-SMP',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-TKA SMP',
    durationMinutes: 40,
    mode: 'NATIVE_CBT',
    token: 'TKASMP1',
    isTokenPublic: true,
    shuffleQuestions: false,
    passingScore: 70,
    allowRetake: true,
    maxAttempts: 2,
    deadline: '2026-12-31 23:59',
    totalQuestions: 4,
    createdAt: '2026-01-26',
    questions: [
      {
        id: 'q-tsmp-1',
        number: 1,
        text: 'Sebuah segitiga siku-siku memiliki panjang sisi siku-siku 6 cm dan 8 cm. Berapakah panjang sisi miring (hipotenusa) segitiga tersebut?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '9 cm' },
          { key: 'B', text: '10 cm' },
          { key: 'C', text: '12 cm' },
          { key: 'D', text: '14 cm' }
        ],
        correctAnswer: 'B',
        weight: 25,
        discussion: 'Berdasarkan Teorema Pythagoras: c² = a² + b² = 6² + 8² = 36 + 64 = 100 => c = 10 cm.'
      },
      {
        id: 'q-tsmp-2',
        number: 2,
        text: 'Manakah dari perubahan berikut yang termasuk dalam contoh PERUBAHAN KIMIA? (PILIH LEBIH DARI SATU)',
        questionType: 'COMPLEX_CHOICE',
        options: [
          { key: 'A', text: 'Besi yang berkarat' },
          { key: 'B', text: 'Es batu yang mencair' },
          { key: 'C', text: 'Kertas yang dibakar menjadi abu' },
          { key: 'D', text: 'Gula yang dilarutkan ke dalam air' }
        ],
        correctAnswer: ['A', 'C'],
        weight: 25,
        discussion: 'Besi berkarat dan pembakaran kertas menghasilkan zat baru (perubahan kimia), sedangkan es mencair dan melarutkan gula adalah perubahan fisika.'
      },
      {
        id: 'q-tsmp-3',
        number: 3,
        text: 'Pernyataan: "Gaya gravitasi bulan adalah penyebab utama terjadinya pasang surut air laut di bumi."',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 25,
        discussion: 'BENAR. Gaya gravitasi tarik bulan (dan matahari) terhadap massa air bumi menyebabkan fenomena pasang naik dan pasang surut.'
      },
      {
        id: 'q-tsmp-4',
        number: 4,
        text: 'Tentukan antonim (lawan kata) yang tepat dari kata "PROGRESIF":',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Konservatif' },
          { key: 'B', text: 'Agresif' },
          { key: 'C', text: 'Inovatif' },
          { key: 'D', text: 'Modern' }
        ],
        correctAnswer: 'A',
        weight: 25,
        discussion: 'Progresif berarti maju/berkembang ke arah kemajuan, lawannya adalah konservatif atau statis.'
      }
    ]
  },

  // 6. TRYOUT: TO-TKA SD
  {
    id: 'exam-to-tka-sd',
    title: 'Tryout TO-TKA SD - Tes Kemampuan Akademik Jenjang Dasar',
    category: 'Ujian Sekolah',
    targetClass: 'VI-SD',
    examType: 'TRYOUT',
    tryoutSubType: 'TO-TKA SD',
    durationMinutes: 30,
    mode: 'NATIVE_CBT',
    token: 'TKASD01',
    isTokenPublic: true,
    shuffleQuestions: false,
    passingScore: 70,
    allowRetake: true,
    maxAttempts: 3,
    deadline: '2026-12-31 23:59',
    totalQuestions: 4,
    createdAt: '2026-01-27',
    questions: [
      {
        id: 'q-tsd-1',
        number: 1,
        text: 'Hasil dari operasi hitung 250 + 15 x 8 - 70 adalah...',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '290' },
          { key: 'B', text: '300' },
          { key: 'C', text: '310' },
          { key: 'D', text: '320' }
        ],
        correctAnswer: 'B',
        weight: 25,
        discussion: 'Dahulukan perkalian: 15 x 8 = 120. Kemudian: 250 + 120 - 70 = 370 - 70 = 300.'
      },
      {
        id: 'q-tsd-2',
        number: 2,
        text: 'Hewan berikut yang berkembang biak dengan cara OVIPAR (bertelur) adalah... (PILIH SEMUA YANG BENAR)',
        questionType: 'COMPLEX_CHOICE',
        options: [
          { key: 'A', text: 'Ayam' },
          { key: 'B', text: 'Kucing' },
          { key: 'C', text: 'Bebek' },
          { key: 'D', text: 'Kura-kura' }
        ],
        correctAnswer: ['A', 'C', 'D'],
        weight: 25,
        discussion: 'Ayam, bebek, dan kura-kura adalah hewan ovipar (bertelur). Kucing adalah vivipar (melahirkan).'
      },
      {
        id: 'q-tsd-3',
        number: 3,
        text: 'Pernyataan: "Matahari terbit dari sebelah timur dan tenggelam di sebelah barat akibat peristiwa rotasi bumi."',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 25,
        discussion: 'BENAR. Gerak semu harian matahari disebabkan oleh perputaran bumi pada porosnya (rotasi bumi) dari barat ke timur.'
      },
      {
        id: 'q-tsd-4',
        number: 4,
        text: 'Ibu kota dari Provinsi Jawa Barat adalah kota...',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Semarang' },
          { key: 'B', text: 'Surabaya' },
          { key: 'C', text: 'Bandung' },
          { key: 'D', text: 'Serang' }
        ],
        correctAnswer: 'C',
        weight: 25,
        discussion: 'Ibu kota Provinsi Jawa Barat adalah Kota Bandung.'
      }
    ]
  },

  // 7. QUIZ
  {
    id: 'exam-quiz-aljabar',
    title: 'Quiz Pemahaman Cepat: Aljabar, Eksponen & Logaritma',
    category: 'Saintek & MIPA',
    targetClass: 'XI-IPA',
    examType: 'QUIZ',
    durationMinutes: 20,
    mode: 'NATIVE_CBT',
    token: 'QUIZALJ',
    isTokenPublic: true,
    shuffleQuestions: true,
    passingScore: 80,
    allowRetake: true,
    maxAttempts: 3,
    deadline: '2026-12-31 23:59',
    totalQuestions: 4,
    createdAt: '2026-01-28',
    questions: [
      {
        id: 'q-qz-1',
        number: 1,
        text: 'Berapakah nilai dari ²log 32 + ²log 8 - ²log 4?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '4' },
          { key: 'B', text: '5' },
          { key: 'C', text: '6' },
          { key: 'D', text: '7' },
          { key: 'E', text: '8' }
        ],
        correctAnswer: 'C',
        weight: 25,
        discussion: '²log 32 = 5, ²log 8 = 3, ²log 4 = 2. Hasil = 5 + 3 - 2 = 6.'
      },
      {
        id: 'q-qz-2',
        number: 2,
        text: 'Pernyataan: "Untuk sembarang bilangan real a > 0 dan a ≠ 1, nilai dari ᵃlog 1 selalu sama dengan 0."',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 25,
        discussion: 'BENAR. Karena a⁰ = 1 untuk setiap a ≠ 0, maka ᵃlog 1 = 0.'
      },
      {
        id: 'q-qz-3',
        number: 3,
        text: 'Jika 3^(2x - 1) = 27, berapakah nilai x?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '1' },
          { key: 'B', text: '2' },
          { key: 'C', text: '3' },
          { key: 'D', text: '4' }
        ],
        correctAnswer: 'B',
        weight: 25,
        discussion: '3^(2x - 1) = 3³ => 2x - 1 = 3 => 2x = 4 => x = 2.'
      },
      {
        id: 'q-qz-4',
        number: 4,
        text: 'Manakah bentuk yang ekuivalen dengan (x³ * y²)³ / (x² * y)⁴? (Pilih jawaban yang benar)',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'x⁷ * y²' },
          { key: 'B', text: 'x⁷ / y²' },
          { key: 'C', text: 'x / y²' },
          { key: 'D', text: 'x⁹ / y⁴' }
        ],
        correctAnswer: 'A',
        weight: 25,
        discussion: '(x⁹ * y⁶) / (x⁸ * y⁴) = x^(9-8) * y^(6-4) = x¹ * y².'
      }
    ]
  },

  // 8. ULANGAN
  {
    id: 'exam-ulangan-harian-1',
    title: 'Ulangan Harian 1: Kinematika Gerak Lurus & Hukum Newton',
    category: 'Ujian Sekolah',
    targetClass: 'XI-IPA',
    examType: 'ULANGAN',
    durationMinutes: 45,
    mode: 'NATIVE_CBT',
    token: 'UH1FIS',
    isTokenPublic: true,
    shuffleQuestions: false,
    passingScore: 75,
    allowRetake: false,
    maxAttempts: 1,
    deadline: '2026-12-31 23:59',
    totalQuestions: 4,
    createdAt: '2026-01-30',
    questions: [
      {
        id: 'q-uh-1',
        number: 1,
        text: 'Benda bermassa 5 kg ditarik dengan gaya tetap 30 N pada lantai licin mendatar. Berapakah percepatan yang dialami benda tersebut?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '2 m/s²' },
          { key: 'B', text: '4 m/s²' },
          { key: 'C', text: '6 m/s²' },
          { key: 'D', text: '8 m/s²' }
        ],
        correctAnswer: 'C',
        weight: 25,
        discussion: 'Hukum II Newton: F = m * a => a = F / m = 30 / 5 = 6 m/s².'
      },
      {
        id: 'q-uh-2',
        number: 2,
        text: 'Hukum I Newton (Kelembaman) menyatakan bahwa benda akan cenderung mempertahankan keadaan diam atau gerak lurus beraturannya jika resultan gaya yang bekerja sama dengan nol.',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'TRUE',
        weight: 25,
        discussion: 'BENAR. ΣF = 0 menghasilkan benda diam tetap diam, atau benda bergerak lurus beraturan tetap bergerak lurus beraturan.'
      },
      {
        id: 'q-uh-3',
        number: 3,
        text: 'Manakah dari grafik GLBB berikut yang menunjukkan gerak dipercepat beraturan? (PILIH JAWABAN YANG TEPAT)',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Grafik v - t berbentuk garis lurus miring ke atas' },
          { key: 'B', text: 'Grafik v - t mendatar sejajar sumbu t' },
          { key: 'C', text: 'Grafik s - t berbentuk garis lurus mendatar' },
          { key: 'D', text: 'Grafik a - t berbentuk garis turun menuju 0' }
        ],
        correctAnswer: 'A',
        weight: 25,
        discussion: 'Pada GLBB dipercepat beraturan, kecepatan bertambah secara linier terhadap waktu sehingga grafik v-t berupa garis lurus miring ke atas dengan gradien positif.'
      },
      {
        id: 'q-uh-4',
        number: 4,
        text: 'Sebuah partikel bergerak lurus dengan persamaan posisi s(t) = 3t² + 4t + 2 (dalam satuan meter dan detik). Tentukan kecepatan partikel pada saat t = 2 detik!',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: '12 m/s' },
          { key: 'B', text: '14 m/s' },
          { key: 'C', text: '16 m/s' },
          { key: 'D', text: '18 m/s' }
        ],
        correctAnswer: 'C',
        weight: 25,
        discussion: 'Kecepatan v(t) = ds/dt = d(3t² + 4t + 2)/dt = 6t + 4. Pada t = 2 s => v(2) = 6(2) + 4 = 12 + 4 = 16 m/s.'
      }
    ]
  }
];

export const INITIAL_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    name: 'Buku Super Master SNBT 2026 + Akses Bank Soal 10.000+',
    category: 'Buku Cetak',
    price: 149000,
    description: 'Buku cetak fisik eksklusif terbitan Brain Space Academy berisi strategi lolos PTN, bedah pola soal 5 tahun terakhir, dan barcode QR latihan interaktif.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    externalLink: 'https://shopee.co.id',
    status: 'ACTIVE',
    createdAt: '2026-01-10'
  },
  {
    id: 'prod-2',
    name: 'Paket Bundling Tryout Premium 15x Simulasi SNBT Realistic',
    category: 'Paket Tryout Premium',
    price: 99000,
    description: 'Akses 15 kali Tryout Online dengan sistem IRT (Item Response Theory), pemeringkatan nasional, dan analisis kelemahan per subtes.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    externalLink: 'https://tokopedia.com',
    status: 'ACTIVE',
    createdAt: '2026-01-12'
  },
  {
    id: 'prod-3',
    name: 'Bimbel Online Intensive VIP Brain Space (1 Bulan)',
    category: 'Akses Bimbel VIP',
    price: 350000,
    description: 'Program bimbingan belajar live via Zoom 4x seminggu bersama Master Teacher, konsultasi jurusan 1-on-1, dan akses rekam kelas.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    externalLink: 'https://wa.me/6281234567890?text=Halo%20Brain%20Space%20Academy,%20saya%20ingin%20mendaftar%20Bimbel%20VIP',
    status: 'ACTIVE',
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-4',
    name: 'Jaket & Merchandise Official Brain Space Academy',
    category: 'Merchandising',
    price: 185000,
    description: 'Jaket Hoodie kualitas premium katun fleece hangat, bordir logo presisi, bonus stiker dan gantungan kunci Brain Space.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80',
    externalLink: 'https://shopee.co.id',
    status: 'ACTIVE',
    createdAt: '2026-01-18'
  }
];

export const INITIAL_RESULTS: ExamResult[] = [
  // 0. EXEMPLAR MULTI-SUBTEST IRT RESULT
  {
    id: 'res-snbt-verbal-budi',
    examId: 'exam-to-snbt-verbal',
    examTitle: 'Tryout UTBK-SNBT 2026 - Kemampuan Verbal (Multi-Subtes)',
    examCategory: 'SNBT 2026',
    studentId: 'u-s1',
    studentNis: '20261001',
    studentName: 'Budi Santoso',
    studentClass: 'XII-UTBK',
    answers: {
      'q-vbi-1': { questionId: 'q-vbi-1', answer: 'A' },
      'q-vbi-2': { questionId: 'q-vbi-2', answer: 'A' },
      'q-vbi-3': { questionId: 'q-vbi-3', answer: 'A' },
      'q-vbe-1': { questionId: 'q-vbe-1', answer: 'A' },
      'q-vbe-2': { questionId: 'q-vbe-2', answer: 'A' },
      'q-vbe-3': { questionId: 'q-vbe-3', answer: 'B' }
    },
    correctCount: 5,
    incorrectCount: 1,
    unansweredCount: 0,
    score: 780,
    maxScore: 1000,
    percentage: 78,
    isPassed: true,
    isIRTScore: true,
    irtTheta: 1.15,
    irtStandardScore: 780,
    irtPercentile: 88,
    subtestResults: [
      {
        subtestId: 'sub-vbi',
        subtestCode: 'VBI',
        subtestName: 'Verbal Bahasa Indonesia',
        totalQuestions: 3,
        correctCount: 3,
        incorrectCount: 0,
        unansweredCount: 0,
        rawScore: 3,
        score: 835,
        percentage: 100
      },
      {
        subtestId: 'sub-vbe',
        subtestCode: 'VBE',
        subtestName: 'Verbal Bahasa Inggris',
        totalQuestions: 3,
        correctCount: 2,
        incorrectCount: 1,
        unansweredCount: 0,
        rawScore: 2,
        score: 725,
        percentage: 67
      }
    ],
    submittedAt: '2026-02-03 16:45',
    durationSpentSeconds: 2100,
    assessmentType: 'Tryout CBT IRT',
    gradedBy: 'Mesin IRT 3PL & Tim Litbang UTBK',
    teacherFeedback: 'Penguasaan materi Verbal Bahasa Indonesia sempurna (100%). Perlu penguatan pola Third Conditional pada Verbal Bahasa Inggris.',
    passingScore: 650
  },
  {
    id: 'res-1',
    examId: 'exam-pdf-1',
    examTitle: 'Simulasi SNBT 2026 - Kemampuan Penalaran Umum (KPU)',
    examCategory: 'SNBT 2026',
    studentId: 'u-s1',
    studentNis: '20261001',
    studentName: 'Budi Santoso',
    studentClass: 'XII-UTBK',
    answers: {
      'q-pdf-1': { questionId: 'q-pdf-1', answer: 'A' },
      'q-pdf-2': { questionId: 'q-pdf-2', answer: 'B' },
      'q-pdf-3': { questionId: 'q-pdf-3', answer: 'C' },
      'q-pdf-4': { questionId: 'q-pdf-4', answer: 'D' },
      'q-pdf-5': { questionId: 'q-pdf-5', answer: 'E' },
      'q-pdf-6': { questionId: 'q-pdf-6', answer: 'A' },
      'q-pdf-7': { questionId: 'q-pdf-7', answer: 'B' },
      'q-pdf-8': { questionId: 'q-pdf-8', answer: 'C' }
    },
    correctCount: 8,
    incorrectCount: 0,
    unansweredCount: 2,
    score: 80,
    maxScore: 100,
    percentage: 80,
    isPassed: true,
    submittedAt: '2026-01-28 14:30',
    durationSpentSeconds: 1420,
    assessmentType: 'Ujian CBT / Tryout',
    gradedBy: 'Sistem CBT & Dr. Hendra Wijaya, M.Pd.',
    teacherFeedback: 'Hasil pengerjaan penalaran umum sangat baik, pertahankan kecepatan pengerjaan!',
    passingScore: 75
  },
  {
    id: 'res-t1-budi',
    examId: 'manual-task-1',
    examTitle: 'Tugas Mandiri 1: Eksponen & Barisan Aritmetika (Pertemuan 1)',
    examCategory: 'Matematika & TPS Kuantitatif',
    studentId: 'u-s1',
    studentNis: '20261001',
    studentName: 'Budi Santoso',
    studentClass: 'XII-UTBK',
    answers: {},
    correctCount: 9,
    incorrectCount: 1,
    unansweredCount: 0,
    score: 92,
    maxScore: 100,
    percentage: 92,
    isPassed: true,
    submittedAt: '2026-02-02 10:15',
    durationSpentSeconds: 1800,
    assessmentType: 'Tugas Harian',
    gradedBy: 'Dr. Hendra Wijaya, M.Pd.',
    teacherFeedback: 'Langkah penyelesaian sistematis dan penguasaan rumus eksponen sangat matang. Nilai A+.',
    passingScore: 75
  },
  {
    id: 'res-uh1-budi',
    examId: 'manual-uh-1',
    examTitle: 'Ulangan Harian 1: Aljabar & Sistem Persamaan Kuadrat',
    examCategory: 'Matematika & TPS Kuantitatif',
    studentId: 'u-s1',
    studentNis: '20261001',
    studentName: 'Budi Santoso',
    studentClass: 'XII-UTBK',
    answers: {},
    correctCount: 8,
    incorrectCount: 2,
    unansweredCount: 0,
    score: 85,
    maxScore: 100,
    percentage: 85,
    isPassed: true,
    submittedAt: '2026-02-05 11:30',
    durationSpentSeconds: 2400,
    assessmentType: 'Ulangan Harian',
    gradedBy: 'Dr. Hendra Wijaya, M.Pd.',
    teacherFeedback: 'Nilai di atas KKM. Perhatikan kembali tanda minus saat pemfaktoran bentuk akar.',
    passingScore: 75
  },
  {
    id: 'res-2',
    examId: 'exam-pdf-1',
    examTitle: 'Simulasi SNBT 2026 - Kemampuan Penalaran Umum (KPU)',
    examCategory: 'SNBT 2026',
    studentId: 'u-s2',
    studentNis: '20261002',
    studentName: 'Siti Rahmawati',
    studentClass: 'XI-IPA',
    answers: {
      'q-pdf-1': { questionId: 'q-pdf-1', answer: 'A' },
      'q-pdf-2': { questionId: 'q-pdf-2', answer: 'B' },
      'q-pdf-3': { questionId: 'q-pdf-3', answer: 'A' },
      'q-pdf-4': { questionId: 'q-pdf-4', answer: 'C' },
      'q-pdf-5': { questionId: 'q-pdf-5', answer: 'E' },
      'q-pdf-6': { questionId: 'q-pdf-6', answer: 'A' }
    },
    correctCount: 4,
    incorrectCount: 2,
    unansweredCount: 4,
    score: 40,
    maxScore: 100,
    percentage: 40,
    isPassed: false,
    submittedAt: '2026-01-29 09:15',
    durationSpentSeconds: 1680,
    assessmentType: 'Ujian CBT / Tryout',
    gradedBy: 'Sistem CBT',
    teacherFeedback: 'Perlu bimbingan remedial dan pembahasan ulang soal-soal penalaran analitis.',
    passingScore: 75
  },
  {
    id: 'res-t1-siti',
    examId: 'manual-fis-1',
    examTitle: 'Praktikum & Tugas Kinematika Gerak Lurus',
    examCategory: 'Fisika & TKA Saintek',
    studentId: 'u-s2',
    studentNis: '20261002',
    studentName: 'Siti Rahmawati',
    studentClass: 'XI-IPA',
    answers: {},
    correctCount: 8,
    incorrectCount: 2,
    unansweredCount: 0,
    score: 82,
    maxScore: 100,
    percentage: 82,
    isPassed: true,
    submittedAt: '2026-02-03 13:45',
    durationSpentSeconds: 1200,
    assessmentType: 'Praktik',
    gradedBy: 'Siti Nurhaliza, S.Si., M.Sc.',
    teacherFeedback: 'Analisis grafik GLBB dan ketelitian pengolahan data praktikum sangat baik.',
    passingScore: 75
  }
];

export const INITIAL_FEATURED_PROGRAMS: FeaturedProgram[] = [
  {
    id: 'prog-1',
    title: 'Lolos PTN Impian',
    category: 'Persiapan UTBK - SNBT & Mandiri PTN',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    shortDesc: 'Program akselerasi intensif tembus PTN Favorit (UI, ITB, UGM, ITS, Unpad) dengan analisis rasionalisasi nilai SNBT & tryout berkala IRT.',
    articleContent: `### Program Akselerasi Lolos PTN Impian 2026

Selamat datang di **Program Lolos PTN Impian Brain Space Academy**! Program ini dirancang khusus untuk siswa SMA/K kelas 12 dan alumni (gap year) yang memiliki target lulus di Perguruan Tinggi Negeri papan atas di Indonesia.

#### Keunggulan Utama Program:
1. **Tryout CBT Sistem IRT Presisi High-Accuracy**: Pemeringkatan nasional menggunakan algoritma Item Response Theory (IRT) persis standar SNPMB.
2. **Bedah Soal HOTS & Triks Cepat Penalaran**: Pengajaran konsep dasar matematika penalaran, literasi bahasa, serta penalaran umum tanpa hafalan rumit.
3. **Konsultasi & Rasionalisasi Jurusan**: Didampingi mentor akademik berpengalaman untuk analisis peluang kelulusan berdasarkan statistik historis kampus.
4. **Modul Digital & Akses Rekaman Video**: Materi dapat diakses 24/7 kapan pun dan di mana pun melalui portal platform siswa.

#### Fasilitas Tambahan:
- Grup diskusi WhatsApp bersama Tutor Master 24 Jam.
- Bank soal prediksi SNBT terbaru tahun 2026.
- Garansi pendampingan hingga Ujian Mandiri PTN.`,
    registerUrl: 'https://wa.me/6281234567890?text=Halo%20Admin%20Brain%20Space,%20saya%20tertarik%20mendaftar%20Program%20Lolos%20PTN%20Impian',
    badge: 'PROGRAM UNGGULAN',
    isPublished: true,
    createdAt: '2026-01-10'
  },
  {
    id: 'prog-2',
    title: 'Raih Nilai TKA Terbaik',
    category: 'Tes Kemampuan Akademik Saintek & Soshum',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    shortDesc: 'Pendalaman materi komprehensif Matematika, Fisika, Kimia, Biologi, Ekonomi, Geografi, dan Sosiologi untuk meraih nilai akademik tertinggi.',
    articleContent: `### Program Kuasai TKA (Tes Kemampuan Akademik) Terbaik

Program **Raih Nilai TKA Terbaik** disiapkan untuk mempertajam pemahaman konseptual dan tingkat literasi sains/sosial siswa dalam menghadapi TKA Sekolah, Seleksi Mandiri PTN, dan Olimpiade Akademik.

#### Kurikulum & Pembelajaran:
- **Peta Konsep Konseptual**: Memahami konsep dasar hingga deep problem solving.
- **Pembahasan Latihan Soal Variatif**: Tingkat kesulitan dari easy, medium, hingga HOTS (Higher Order Thinking Skills).
- **Simulasi Nilai Ujian Berkala**: Evaluasi perkembangan belajar setiap pekan dengan grafik perkembangan siswa.

#### Cocok Untuk:
- Siswa Kelas 10, 11, dan 12 SMA/MA MIPA & IPS.
- Persiapan Olimpiade Sains & Seleksi Mandiri Kampus Negeri.`,
    registerUrl: 'https://forms.google.com',
    badge: 'TERFAVORIT',
    isPublished: true,
    createdAt: '2026-01-12'
  },
  {
    id: 'prog-3',
    title: 'Masuk Sekolah Impian',
    category: 'Seleksi SMA Favorit & Labschool 2026',
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    shortDesc: 'Bimbingan khusus lulus seleksi pendaftaran Labschool, SMA Taruna Nusantara, SMA Pradita Dirgantara, dan SMA Negeri Unggulan.',
    articleContent: `### Bimbingan Seleksi Masuk Sekolah Impian (Labschool & SMA Unggulan)

Raih impian menembus jenjang sekolah menengah atas terbaik dan favorit di Indonesia bersama **Brain Space Academy**.

#### Cakupan Materi Seleksi:
1. **Tes Potensi Akademik (TPA) & Kemampuan Skolastik**.
2. **Tes Bahasa Inggris & Literasi Bahasa Indonesia**.
3. **Tes Matematika & Penalaran Logika**.
4. **Latihan Wawancara & Psikotes Dasar**.

#### Layanan Spesial:
- Modul eksklusif kumpulan soal seleksi Labschool & SMA Unggulan 5 tahun terakhir.
- Simulasi ujian CBT bertimer persis kondisi ujian asli.`,
    registerUrl: 'https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20daftar%20Program%20Masuk%20Sekolah%20Impian',
    badge: 'POPULER',
    isPublished: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'prog-4',
    title: 'Lolos CPNS & Kedinasan',
    category: 'Persiapan SKD, STIS, IPDN, PKN STAN & CPNS',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    shortDesc: 'Strategi pemantapan SKD (TWK, TIU, TKP) berstandar BKN dengan sistem CAT realistis, passing grade otomatis, dan pembahasan lengkap.',
    articleContent: `### Program Bimbingan Lolos Seleksi CPNS & Sekolah Kedinasan 2026

Persiapkan diri Anda menghadapi persaingan seleksi Calon Pegawai Negeri Sipil (CPNS) serta Sekolah Kedinasan (PKN STAN, IPDN, STIS, Poltekip/Poltekim) secara matang.

#### Program Belajar SKD Lengkap:
- **Tes Wawasan Kebangsaan (TWK)**: Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, dan Nasionalisme.
- **Tes Intelegensi Umum (TIU)**: Kemampuan Verbal, Numerik, Silogisme, Analitis, dan Figural dengan metode fast calculation.
- **Tes Karakteristik Pribadi (TKP)**: Strategi analisis poin tertinggi (skor 5) pada setiap opsi jawaban.

#### Fitur & Fasilitas:
- **Simulasi CAT BKN Realistis**: Sistem timer otomatis, pembobotan nilai akurat, dan laporan perangkingan nasional.
- **E-Book & Pembahasan Video HD**: Penjelasan mendalam dari Coach & Asesor tersertifikasi.`,
    registerUrl: 'https://forms.google.com',
    badge: 'INTENSIF',
    isPublished: true,
    createdAt: '2026-01-18'
  }
];

export const INITIAL_SYLLABI: SyllabusItem[] = [
  {
    id: 'sil-1',
    code: 'SIL-MTK-XII-01',
    title: 'Silabus Intensif Penalaran Matematika & TPS Kuantitatif SNBT',
    subject: 'Matematika & TPS Kuantitatif',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum intensif persiapan UTBK-SNBT 2026 berfokus pada Penguasaan Aljabar, Aritmetika Sosial, Geometri Analitik, Peluang, Statistika Data, dan Trik Penalaran Kuantitatif Cepat (Fast Calculation).',
    totalMeetings: 12,
    status: 'ACTIVE',
    pdfUrl: 'https://drive.google.com/file/d/1y2_Math_Syllabus_Sample/preview',
    snbtSubtestCode: 'PK',
    snbtCategory: 'TPS',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-01',
    topics: [
      {
        id: 'top-1-1',
        meetingNumber: 1,
        title: 'Sistem Bilangan & Trik Operasi Pecahan/Eksponen',
        subtopics: ['Sifat-sifat Bilangan Real & Pecahan Berulang', 'Aturan Eksponen, Bentuk Akar & Logaritma Cepat', 'Pola Barisan Aritmetika & Geometri Bertingkat'],
        competency: 'Siswa mampu menyelesaikan persoalan aritmetika & aljabar eksponensial dalam waktu < 45 detik per soal.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Drill Soal SNBT 2020-2025',
        referenceNotes: 'Buku Master TPS Kuantitatif Bab 1 & 2',
        linkedMaterialId: 'm1',
        linkedMaterialTitle: 'Modul Ringkas Penalaran Matematika SNBT 2026',
        linkedExamId: 'exam-pdf-1',
        linkedExamTitle: 'Simulasi SNBT 2026 - Kemampuan Penalaran Umum (KPU)',
        driveLink: 'https://drive.google.com/file/d/1Bzx7tT3i82xR1y9O0-G6kQ1h7U63N_f2/view',
        driveLinkTitle: 'Bahan Ajar & Bank Soal Bilangan Real (Google Drive)'
      },
      {
        id: 'top-1-2',
        meetingNumber: 2,
        title: 'Persamaan & Pertidaksamaan Aljabar Linier/Kuadrat',
        subtopics: ['Persamaan Kuadrat & Sifat Akar-Akar', 'Pertidaksamaan Nilai Mutlak & Garis Bilangan', 'Sistem Persamaan Linier Dua & Tiga Variabel (SPLDV/SPLTV)'],
        competency: 'Mengidentifikasi domain, range solusi nilai mutlak dan menyelesaikan sistem persamaan bersyarat.',
        durationMinutes: 90,
        teachingMethod: 'Ceramah Interaktif & Diskusi Kelompok Soal HOTS',
        referenceNotes: 'Handout Modul Aljabar Terapan',
        linkedMaterialId: 'm1',
        linkedMaterialTitle: 'Modul Ringkas Penalaran Matematika SNBT 2026',
        driveLink: 'https://drive.google.com/drive/folders/1Aljabar_Persamaan_Materi_Sample',
        driveLinkTitle: 'Folder Slide Presentasi PPT Aljabar & Handout'
      },
      {
        id: 'top-1-3',
        meetingNumber: 3,
        title: 'Fungsi, Komposisi, & Invers',
        subtopics: ['Domain, Kodomain & Range Fungsi', 'Operasi Aljabar Fungsi & Komposisi f(g(x))', 'Fungsi Invers & Transformasi Grafik'],
        competency: 'Memahami manipulasi fungsi bersusun dan grafik pemetaan untuk penalaran kuantitatif.',
        durationMinutes: 90,
        teachingMethod: 'Visualisasi Geogebra & Diskusi Kasus'
      },
      {
        id: 'top-1-4',
        meetingNumber: 4,
        title: 'Geometri Dimensi Dua (Bangun Datar) & Teorema Sudut',
        subtopics: ['Luas & Keliling Segitiga, Segiempat, Lingkaran', 'Teorema Pythagoras & Kesebangunan Bangun Datar', 'Garis Singgung Lingkaran & Sudut Pusat/Keliling'],
        competency: 'Menganalisis luas daerah terarsir dan hubungan kesebangunan geometri analitik.',
        durationMinutes: 90,
        teachingMethod: 'Drill Soal Visual & Latihan Mandiri'
      },
      {
        id: 'top-1-5',
        meetingNumber: 5,
        title: 'Geometri Dimensi Tiga (Bangun Ruang) & Jarak Titik',
        subtopics: ['Volume & Luas Permukaan Kubus, Balok, Tabung, Kerucut, Bola', 'Jarak Titik ke Titik, Titik ke Garis, Titik ke Bidang', 'Sudut Antara Dua Garis & Bidang'],
        competency: 'Membayangkan proyeksi 3D dan menentukan jarak serta sudut pada bangun ruang.',
        durationMinutes: 90,
        teachingMethod: 'Model 3D Interaktif & Pembahasan Soal HOTS'
      },
      {
        id: 'top-1-6',
        meetingNumber: 6,
        title: 'Statistika Deskriptif & Interpretasi Data Grafik/Tabel',
        subtopics: ['Mean, Median, Modus data tunggal & kelompok', 'Kuartil, Jangkauan Interkuartil & Simpangan Baku', 'Interpretasi Diagram Batang, Garis, Lingkaran & Box Plot'],
        competency: 'Membaca dan menarik kesimpulan matematis dari sajian data statistik kompleks.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Studi Kasus Data Nyata & Latihan Soal'
      },
      {
        id: 'top-1-7',
        meetingNumber: 7,
        title: 'Kaidah Pencacahan, Permutasi, & Kombinasi',
        subtopics: ['Aturan Penjumlahan & Perkalian', 'Permutasi Unsur Berbeda, Unsur Sama & Siklis', 'Kombinasi & Ekspansi Binomial Newton'],
        competency: 'Menerapkan kaidah pencacahan untuk menentukan banyaknya cara susunan dan pemilihan.',
        durationMinutes: 90,
        teachingMethod: 'Problem Solving Terstruktur'
      },
      {
        id: 'top-1-8',
        meetingNumber: 8,
        title: 'Teori Peluang & Kejadian Majemuk',
        subtopics: ['Peluang Kejadian Tunggal & Frekuensi Harapan', 'Peluang Kejadian Saling Lepas & Saling Bebas', 'Peluang Bersyarat (Conditional Probability)'],
        competency: 'Menghitung probabilitas peristiwa bersyarat dan mengaplikasikannya dalam simulasi SNBT.',
        durationMinutes: 90,
        teachingMethod: 'Studi Kasus Game Probabilitas & Bedah Soal'
      },
      {
        id: 'top-1-9',
        meetingNumber: 9,
        title: 'Kecukupan Data (Pernyataan 1 & 2)',
        subtopics: ['Struktur Soal Kecukupan Data SNBT', 'Strategi Eliminasi Opsi A, B, C, D, E', 'Jebakan Soal Unik (Tidak Perlu Menghitung Angka Akhir)'],
        competency: 'Menguasai metode penentuan kecukupan informasi tanpa terjebak komputasi panjang.',
        durationMinutes: 90,
        teachingMethod: 'Bedah Trik Strategi & Speed Test CBT',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      },
      {
        id: 'top-1-10',
        meetingNumber: 10,
        title: 'Perbandingan Kuantitas (P versus Q)',
        subtopics: ['Format Soal Hubungan Nilai P dan Q', 'Penggunaan Variabel Negatif/Pecahan/Nol sebagai Counter Example', 'Trik Cepat Soal Perbandingan'],
        competency: 'Menentukan apakah P > Q, Q > P, P = Q, atau informasi tidak cukup secara presisi.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT Mandiri & Diskusi Pembahasan'
      },
      {
        id: 'top-1-11',
        meetingNumber: 11,
        title: 'Penalaran Matematika Kontekstual & Model Realistis',
        subtopics: ['Aritmetika Sosial: Diskon Bertingkat, Pajak, Bunga Tunggal/Majemuk', 'Kecepatan, Waktu & Jarak Bertemu/Menyusul', 'Perbandingan Senilai & Berbalik Nilai Bertingkat'],
        competency: 'Menyelesaikan soal cerita matematika penalaran yang berakar pada konteks kehidupan nyata.',
        durationMinutes: 90,
        teachingMethod: 'Contextual Teaching and Learning (CTL)'
      },
      {
        id: 'top-1-12',
        meetingNumber: 12,
        title: 'Tryout Evaluasi Akbar & Bedah Soal Prediksi UTBK',
        subtopics: ['Simulasi Pengerjaan 20 Soal UTBK dalam 25 Menit', 'Analisis IRT & Scoring Akurasi', 'Rencana Remedial & Penguatan Sub-Topik'],
        competency: 'Mengevaluasi kesiapan mental dan ketepatan strategi manajemen waktu siswa.',
        durationMinutes: 90,
        teachingMethod: 'Tryout CBT Digital & Comprehensive Feedback Session',
        linkedExamTitle: 'Simulasi UTBK SNBT 2026 - Paket 1 (Lengkap)'
      }
    ]
  },
  {
    id: 'sil-2',
    code: 'SIL-FIS-XII-02',
    title: 'Silabus Fisika Konseptual & TKA Saintek HOTS',
    subject: 'Fisika & TKA Saintek',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Siti Nurhaliza, S.Si., M.Sc.',
    description: 'Pendalaman konsep fisika mekanika klasik, fluida statis/dinamis, termodinamika, gelombang optik, listrik magnet, dan fisika modern dengan pendekatan analisis grafik dan fenomena fisis.',
    totalMeetings: 10,
    status: 'ACTIVE',
    createdAt: '2026-01-12',
    updatedAt: '2026-02-05',
    topics: [
      {
        id: 'top-2-1',
        meetingNumber: 1,
        title: 'Kinematika Gerak Lurus & Gerak Parabola',
        subtopics: ['GLB, GLBB, dan Gerak Vertikal Bebas', 'Gerak Melingkar Beraturan & Berubah Beraturan', 'Analisis Vektor Gerak Parabola & Jangkauan Maksimum'],
        competency: 'Menganalisis grafik v-t, s-t, dan menentukan posisi partikel dalam lintasan multi-dimensi.',
        durationMinutes: 90,
        teachingMethod: 'Animasi PhET Simulation & Bedah Soal TKA Saintek'
      },
      {
        id: 'top-2-2',
        meetingNumber: 2,
        title: 'Dinamika Gerak & Hukum Newton I, II, III',
        subtopics: ['Gaya Normal, Gaya Gesek Statis/Kinetik, dan Gaya Tegangan Tali', 'Hukum Gerak pada Bidang Miring & Sistem Katrol', 'Gaya Sentripetal pada Tikungan Miring'],
        competency: 'Menggambar diagram gaya bebas (FBD) dan memecahkan persamaan percepatan sistem.',
        durationMinutes: 90,
        teachingMethod: 'Problem Solving & Eksperimen Virtual'
      },
      {
        id: 'top-2-3',
        meetingNumber: 3,
        title: 'Usaha, Energi, & Hukum Kekekalan Energi Mekanik',
        subtopics: ['Usaha oleh Gaya Konstan & Gaya Variabel', 'Teorema Usaha-Energi Kinetik', 'Hukum Kekekalan Energi Mekanik pada Pegas & Lintasan Melingkar'],
        competency: 'Menghubungkan kerja gaya konservatif dan non-konservatif dengan perubahan energi fisis.',
        durationMinutes: 90,
        teachingMethod: 'Diskusi Interaktif & Latihan Mandiri'
      },
      {
        id: 'top-2-4',
        meetingNumber: 4,
        title: 'Impuls, Momentum, & Tumbukan',
        subtopics: ['Konsep Impuls & Perubahan Momentum', 'Hukum Kekekalan Momentum Linier', 'Tumbukan Lenting Sempurna, Sebagian & Tidak Lenting'],
        competency: 'Menghitung koefisien restitusi dan kecepatan benda pasca tumbukan dua partikel.',
        durationMinutes: 90,
        teachingMethod: 'Studi Kasus Balistik & Drill Soal'
      },
      {
        id: 'top-2-5',
        meetingNumber: 5,
        title: 'Fluida Statis & Dinamis',
        subtopics: ['Tekanan Hidrostatis, Hukum Pascal & Hukum Archimedes', 'Tegangan Permukaan, Meniskus & Viskositas', 'Persamaan Kontinuitas, Asas Bernoulli & Tabung Venturi'],
        competency: 'Menganalisis gaya angkat sayap pesawat, pipa venturimeter, dan kebocoran tangki air.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Interaktif & Bedah Soal Ujian'
      },
      {
        id: 'top-2-6',
        meetingNumber: 6,
        title: 'Suhu, Kalor, & Termodinamika',
        subtopics: ['Asas Black, Kalor Laten & Perpindahan Kalor (Konduksi, Konveksi, Radiasi)', 'Hukum I Termodinamika & Usaha Gas Ideal', 'Siklus Carnot, Efisiensi Mesin Kalor & Hukum II Termodinamika'],
        competency: 'Menghitung kerja pada proses isotermal, isobarik, isokhorik, adiabatik serta efisiensi mesin.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Grafik P-V & Drill Soal'
      },
      {
        id: 'top-2-7',
        meetingNumber: 7,
        title: 'Gelombang Mekanik, Bunyi, & Efek Doppler',
        subtopics: ['Persamaan Gelombang Berjalan & Gelombang Stasioner', 'Intensitas & Taraf Intensitas Bunyi (Desibel)', 'Efek Doppler dengan Pengaruh Angin & Sumber Bergerak'],
        competency: 'Menentukan frekuensi yang didengar pengamat dan letak simpul/perut gelombang.',
        durationMinutes: 90,
        teachingMethod: 'Demonstrasi Audio Visual & Latihan Soal'
      },
      {
        id: 'top-2-8',
        meetingNumber: 8,
        title: 'Listrik Statis & Kapasitor',
        subtopics: ['Hukum Coulomb & Medan Listrik Muatan Titik/Bola Konduktor', 'Potensial Listrik & Energi Potensial Listrik', 'Kapasitor Keping Sejajar, Rangkaian Seri/Paralel & Dielektrik'],
        competency: 'Menghitung kuat medan listrik dan kapasitas muatan pada susunan dielektrik kapasitor.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning'
      },
      {
        id: 'top-2-9',
        meetingNumber: 9,
        title: 'Listrik Dinamis & Rangkaian Arus Searah (DC)',
        subtopics: ['Hukum Ohm & Hambatan Jenis Kawat Konduktor', 'Hukum I & II Kirchhoff pada Rangkaian Multi-Loop', 'Jembatan Wheatstone & Daya Disipasi Resistor'],
        competency: 'Menghitung kuat arus dan tegangan jepit pada rangkaian dua loop kompleks.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Sirkuit Digital & Latihan Soal'
      },
      {
        id: 'top-2-10',
        meetingNumber: 10,
        title: 'Kemagnetan, Induksi Elektromagnetik & Fisika Kuantum',
        subtopics: ['Gaya Lorentz pada Kawat Berarus & Muatan Bergerak', 'Hukum Faraday, Hukum Lenz & GGL Induksi Generator', 'Efek Fotolistrik, Radiasi Benda Hitam & Teori Relativitas Khusus'],
        competency: 'Menganalisis arah gaya magnet dan energi foton pada efek fotolistrik Einstein.',
        durationMinutes: 90,
        teachingMethod: 'Kuliah Ringkas & Tryout Komprehensif',
        linkedExamTitle: 'Ulangan Harian Fisika: Gelombang & Optik'
      }
    ]
  },
  {
    id: 'sil-3',
    code: 'SIL-BIND-XII-03',
    title: 'Silabus Literasi Bahasa Indonesia & Pemahaman Bacaan (PBM)',
    subject: 'Bahasa Indonesia & Literasi',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Penguasaan teknik membaca kritis, pemahaman ide pokok, simpulan tersirat, kalimat efektif, ejaan PUEBI/EYD V, kohesi & koherensi paragraf, serta logika penulisan teks analitis.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'PBM',
    snbtCategory: 'TPS',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-06',
    topics: [
      {
        id: 'top-3-1',
        meetingNumber: 1,
        title: 'Menemukan Gagasan Utama, Ide Pokok & Judul Teks',
        subtopics: ['Letak Kalimat Utama (Deduktif, Induktif, Campuran)', 'Menentukan Tema & Judul yang Tepat', 'Membedakan Fakta dan Opini dalam Teks Berita/Opini'],
        competency: 'Siswa mampu menentukan ide pokok paragraf padat informasi dalam < 30 detik.',
        durationMinutes: 90,
        teachingMethod: 'Speed Reading & Anotasi Paragraf Kritis'
      },
      {
        id: 'top-3-2',
        meetingNumber: 2,
        title: 'Penarikan Simpulan & Makna Tersirat (Inference)',
        subtopics: ['Simpulan Logis Berdasarkan Premis Teks', 'Asumsi & Implikasi Penulis', 'Sikap, Nada (Tone), dan Tujuan Penulis'],
        competency: 'Menganalisis maksud terselubung dan argumen pendukung dari teks eksposisi/argumentasi.',
        durationMinutes: 90,
        teachingMethod: 'Bedah Teks Jurnal Ilmiah & Diskusi Interaktif'
      },
      {
        id: 'top-3-3',
        meetingNumber: 3,
        title: 'Struktur Kalimat Efektif & Syarat Kepengalimatannya',
        subtopics: ['Kehematan, Kesejajaran (Paralelisme), dan Kelogisan Kalimat', 'Kesepadanan Struktur (Subjek, Predikat, Objek, Keterangan)', 'Menghindari Kalimat Rancu & Pleonasme'],
        competency: 'Memperbaiki kalimat yang cacat struktur menjadi kalimat efektif baku.',
        durationMinutes: 90,
        teachingMethod: 'Error Analysis & Rekonstruksi Kalimat'
      },
      {
        id: 'top-3-4',
        meetingNumber: 4,
        title: 'Kaidah Ejaan EYD Edisi V & Tanda Baca',
        subtopics: ['Penggunaan Huruf Kapital & Huruf Miring', 'Penulisan Kata Depan, Partikel, Singkatan & Akronim', 'Fungsi Koma (,), Titik Dua (:), Titik Koma (;), dan Tanda Hubung (-)'],
        competency: 'Mengoreksi kesalahan ejaan dan tanda baca pada teks narasi maupun ilmiah.',
        durationMinutes: 90,
        teachingMethod: 'Drill Soal PBM & Quiz Interaktif'
      },
      {
        id: 'top-3-5',
        meetingNumber: 5,
        title: 'Konjungsi, Kohesi, & Koherensi Antar-Kalimat/Paragraf',
        subtopics: ['Konjungsi Koordinatif, Subordinatif, Korelatif & Antarkalimat', 'Kepaduan Paragraf & Kalimat Sumbang (Incoherent Sentence)', 'Prinsip Rujukan Kata & Substitusi Leksikal'],
        competency: 'Mengidentifikasi kalimat sumbang dan mengisi bagian rumpang dengan konjungsi presisi.',
        durationMinutes: 90,
        teachingMethod: 'Cloze Test & Analisis Wacana'
      },
      {
        id: 'top-3-6',
        meetingNumber: 6,
        title: 'Pembentukan Kata (Morfologi) & Makna Kata (Semantik)',
        subtopics: ['Imbuhan (Afiksasi): meN-, ber-, di-, peN-, -kan, -an, ke-...-an', 'Kata Berulang, Kata Majemuk & Istilah Khusus (Serapan)', 'Makna Denotatif, Konotatif, Polisemi, Homonim, & Antonim'],
        competency: 'Menentukan pembentukan kata baku dan makna konteks sesuai KBBI.',
        durationMinutes: 90,
        teachingMethod: 'Bedah Kosakata & Kamus Digital'
      },
      {
        id: 'top-3-7',
        meetingNumber: 7,
        title: 'Literasi Teks Informasi Jamak & Infografik Multimoda',
        subtopics: ['Membaca Tabel, Grafik, Diagram Batang & Pie Chart dalam Teks', 'Membandingkan Dua Teks dengan Topik Sama (Komparatif)', 'Sintesis Data Multitabel untuk Menjawab Pertanyaan Kritis'],
        competency: 'Mengintegrasikan informasi tekstual dengan data visual statistik secara komprehensif.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Multimoda Infografis & Drill Soal'
      },
      {
        id: 'top-3-8',
        meetingNumber: 8,
        title: 'Simulasi Tryout Literasi Bahasa Indonesia & Refleksi',
        subtopics: ['Pengerjaan 30 Soal Literasi Bahasa Indonesia CBT', 'Pembahasan Strategi Eliminasi Opsi Menjebak', 'Evaluasi Nilai & Catatan Penguatan Pribadi Siswa'],
        competency: 'Mencapai target ketuntasan minimal 85% pada subtes Literasi Bahasa Indonesia SNBT.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT & Sesi Ulasan Intensif'
      }
    ]
  },
  {
    id: 'sil-4',
    code: 'SIL-BING-XII-04',
    title: 'Silabus English for SNBT & Academic Reading Literacy',
    subject: 'Bahasa Inggris & English Literacy',
    targetClass: 'XII-UTBK',
    academicYear: '2025/2026 Ganjil & Genap',
    teacherInCharge: 'Sarah Maharani, S.Pd., M.Ed.',
    description: 'Bimbingan literasi Bahasa Inggris berstandar UTBK & IELTS meliputi skimming/scanning teks akademik sains/sosial, vocabulary in context, text organization, author purpose & tone, dan logical inferences.',
    totalMeetings: 8,
    status: 'ACTIVE',
    snbtSubtestCode: 'LBE',
    snbtCategory: 'Literasi',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-04',
    topics: [
      {
        id: 'top-4-1',
        meetingNumber: 1,
        title: 'Main Idea, Topic, & Primary Purpose of Passage',
        subtopics: ['Skimming strategies for lengthy academic articles', 'Identifying Topic vs Main Idea vs Thesis Statement', 'Formulating the best title for a multi-paragraph text'],
        competency: 'Students can identify the central message and thesis of academic texts within 45 seconds.',
        durationMinutes: 90,
        teachingMethod: 'Skimming Exercises & Timed Reading Drills'
      },
      {
        id: 'top-4-2',
        meetingNumber: 2,
        title: 'Locating Specific Details & Factual Information',
        subtopics: ['Scanning keywords and synonyms in questions', 'Answering "According to the passage..." questions', '"EXCEPT" or "NOT TRUE" question elimination techniques'],
        competency: 'Quickly scanning factual details without rereading the whole passage.',
        durationMinutes: 90,
        teachingMethod: 'Guided Scanning Drills & Synonym Matching'
      },
      {
        id: 'top-4-3',
        meetingNumber: 3,
        title: 'Vocabulary in Context & Pronoun Referents',
        subtopics: ['Inferring word meaning from surrounding context clues', 'Prefixes, suffixes, and Latin/Greek root analysis', 'Tracing demonstrative and relative pronouns (this, that, which)'],
        competency: 'Deciphering unfamiliar terminology without relying on a dictionary.',
        durationMinutes: 90,
        teachingMethod: 'Context Clue Practice & Root Word Breakdowns'
      },
      {
        id: 'top-4-4',
        meetingNumber: 4,
        title: 'Author’s Tone, Attitude, & Target Audience',
        subtopics: ['Identifying Tone (Critical, Optimistic, Objective, Skeptical)', 'Author’s Stance and Persuasive Devices', 'Predicting the most likely intended readers'],
        competency: 'Evaluating the emotional register and rhetorical stance of the author.',
        durationMinutes: 90,
        teachingMethod: 'Tone Analysis Workshops & Comparative Passage Reviews'
      },
      {
        id: 'top-4-5',
        meetingNumber: 5,
        title: 'Text Organization & Rhetorical Structures',
        subtopics: ['Cause and effect, Problem-solution, Chronological, Compare-contrast patterns', 'Transition words and discourse markers (However, Furthermore, Consequently)', 'Predicting preceding and succeeding paragraphs'],
        competency: 'Mapping the structural blueprint and logical progression of expository essays.',
        durationMinutes: 90,
        teachingMethod: 'Paragraph Flow Mapping & Cloze Sentence Insertion'
      },
      {
        id: 'top-4-6',
        meetingNumber: 6,
        title: 'Making Inferences & Drawing Logical Conclusions',
        subtopics: ['Distinguishing between explicit evidence and logical deduction', 'Hypothetical and conditional reading situations', 'Evaluating strength of conclusions based on given evidence'],
        competency: 'Drawing rigorous deductive conclusions without unwarranted assumptions.',
        durationMinutes: 90,
        teachingMethod: 'Critical Thinking Inquiry & HOTS Problem Sets'
      },
      {
        id: 'top-4-7',
        meetingNumber: 7,
        title: 'Dual Passage Synthesis & Comparison',
        subtopics: ['Comparing Passage A and Passage B on controversial topics', 'Identifying points of agreement and divergence', 'Synthesizing combined insights to answer multi-text prompts'],
        competency: 'Synthesizing two contrasting viewpoints on scientific/social debates.',
        durationMinutes: 90,
        teachingMethod: 'Paired Passage Workshop & Debate-Style Analysis'
      },
      {
        id: 'top-4-8',
        meetingNumber: 8,
        title: 'Final English Literacy UTBK Simulation & Review',
        subtopics: ['Full 20-question CBT timed simulation (15 minutes)', 'Score analysis and deep discussion of tricky distractors', 'Actionable tips for exam day time management'],
        competency: 'Achieving speed and accuracy targets for top PTN English literacy percentiles.',
        durationMinutes: 90,
        teachingMethod: 'CBT Test Run & Live Teacher Review'
      }
    ]
  },
  {
    id: 'sil-5',
    code: 'SIL-BIO-XI-05',
    title: 'Silabus Biologi Sel, Genetika & Ekologi Lingkungan',
    subject: 'Biologi & Sains Terapan',
    targetClass: 'XI-IPA',
    academicYear: '2025/2026 Semester 1',
    teacherInCharge: 'Rian Pratama, S.Si.',
    description: 'Silabus kurikulum MIPA Biologi kelas XI berfokus pada struktur organel seluler, mekanisme transport membran, enzim metabolisme katabolisme/anabolisme, sintesis protein, dan pewarisan sifat hukum Mendel.',
    totalMeetings: 8,
    status: 'ACTIVE',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-02',
    topics: [
      {
        id: 'top-5-1',
        meetingNumber: 1,
        title: 'Struktur & Fungsi Organel Sel Eukariotik/Prokariotik',
        subtopics: ['Perbedaan Sel Hewan vs Sel Tumbuhan', 'Fungsi Mitokondria, Ribosom, Retikulum Endoplasma, Badan Golgi, Lisosom', 'Dinding Sel, Vakuola & Kloroplas'],
        competency: 'Mengidentifikasi peran masing-masing organel dalam homeostasis sel.',
        durationMinutes: 90,
        teachingMethod: 'Visualisasi 3D Sel & Diskusi'
      },
      {
        id: 'top-5-2',
        meetingNumber: 2,
        title: 'Mekanisme Transport Membran Sel',
        subtopics: ['Difusi Sederhana & Difusi Terfasilitasi', 'Osmosis pada Larutan Hipertonis, Isotonis, Hipotonis (Plasmolisis, Turgid, Lisis)', 'Transport Aktif: Pompa Natrium-Kalium, Endositosis & Eksositosis'],
        competency: 'Menganalisis arah perpindahan zat melalui membran semipermeabel.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Laboratorium Maya & Praktikum'
      },
      {
        id: 'top-5-3',
        meetingNumber: 3,
        title: 'Enzim & Katabolisme Karbohidrat (Respirasi Seluler)',
        subtopics: ['Sifat Enzim, Teori Gembok-Kunci & Inhibitor Kompetitif/Non-Kompetitif', 'Glikolisis & Dekarboksilasi Oksidatif', 'Siklus Krebs & Rantai Transpor Elektron (Fosforilasi Oksidatif)'],
        competency: 'Menghitung total energi ATP yang dihasilkan pada respirasi aerob dan anaerob (fermentasi).',
        durationMinutes: 90,
        teachingMethod: 'Bagan Alir Biokimia & Pembahasan Soal'
      },
      {
        id: 'top-5-4',
        meetingNumber: 4,
        title: 'Anabolisme: Fotosintesis & Kemosintesis',
        subtopics: ['Reaksi Terang (Fotolisis Air, Aliran Elektron Siklik & Non-Siklik)', 'Reaksi Gelap (Siklus Calvin-Benson): Fiksasi, Reduksi, Regenerasi', 'Faktor yang Mempengaruhi Laju Fotosintesis (Percobaan Ingenhousz & Sachs)'],
        competency: 'Memahami proses konversi energi cahaya menjadi energi kimia pada kloroplas.',
        durationMinutes: 90,
        teachingMethod: 'Eksperimen Virtual & Latihan Soal'
      },
      {
        id: 'top-5-5',
        meetingNumber: 5,
        title: 'Materi Genetik: DNA, RNA, & Sintesis Protein',
        subtopics: ['Struktur Nukleotida DNA & Aturan Chargaff', 'Perbedaan DNA dan RNA', 'Mekanisme Transkripsi (mRNA) & Translasi (tRNA di Ribosom)'],
        competency: 'Menerjemahkan urutan rantai DNA sense/antisense menjadi kodon asam amino polipeptida.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Kode Genetik & Studi Kasus Mutasi'
      },
      {
        id: 'top-5-6',
        meetingNumber: 6,
        title: 'Pembelahan Sel: Mitosis & Meiosis',
        subtopics: ['Siklus Sel (Interfase: G1, S, G2)', 'Tahapan Mitosis (Profase, Metafase, Anafase, Telofase) & Sitokinesis', 'Tahapan Meiosis I & II, Pindah Silang (Crossing Over) & Gametogenesis'],
        competency: 'Membedakan jumlah kromosom diploid (2n) dan haploid (n) serta variasi genetik.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Mikroskopis Sel & Drill Soal'
      },
      {
        id: 'top-5-7',
        meetingNumber: 7,
        title: 'Hukum Pewarisan Sifat Mendel & Penyimpangan Semu',
        subtopics: ['Persilangan Monohibrid & Dihibrid (Hukum Segregasi & Asortasi Bebas)', 'Penyimpangan Semu: Kriptomeri, Epistasis-Hipostasis, Polimeri, Komplementer', 'Tautan Gen & Pautan Seks (Hemofilia, Buta Warna)'],
        competency: 'Menghitung rasio fenotipe dan genotipe keturunan filial F1 dan F2.',
        durationMinutes: 90,
        teachingMethod: 'Diagram Punnett & Silsilah Pohon Keluarga (Pedigree)'
      },
      {
        id: 'top-5-8',
        meetingNumber: 8,
        title: 'Evaluasi Tengah Semester & Bedah Soal Olimpiade/CBT',
        subtopics: ['Ujian CBT Berwaktu 40 Soal Pilihan Ganda & Sebab-Akibat', 'Pembahasan Soal HOTS Berbasis Jurnal', 'Pengayaan Remedial'],
        competency: 'Mengukur pemahaman konseptual dan kesiapan ujian semester siswa kelas XI MIPA.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT & Diskusi Kelas'
      }
    ]
  },
  {
    id: 'sil-6',
    code: 'SIL-LAB-06',
    title: 'Silabus Seleksi Masuk Labschool & Tes Potensi Akademik',
    subject: 'Penalaran Umum & Logika',
    targetClass: 'Masuk Labschool',
    academicYear: '2025/2026 Persiapan Khusus',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Program persiapan terpadu seleksi PSB Labschool mencakup Logika Verbal, Pola Deret Angka, Penalaran Spasial/Figural, Silogisme, dan Pemecahan Masalah Kognitif Terstandar.',
    totalMeetings: 6,
    status: 'ACTIVE',
    createdAt: '2026-01-22',
    updatedAt: '2026-02-05',
    topics: [
      {
        id: 'top-6-1',
        meetingNumber: 1,
        title: 'Penalaran Verbal, Analogi Kata & Hubungan Makna',
        subtopics: ['Analogi Kata Tunggal & Berpasangan', 'Sinonim, Antonim & Hubungan Hierarki Konsep', 'Penalaran Definisi & Pemahaman Instruksi Khusus'],
        competency: 'Mengidentifikasi korelasi makna antar kata secara cepat dan tepat.',
        durationMinutes: 90,
        teachingMethod: 'Speed Drills & Quiz Flashcard'
      },
      {
        id: 'top-6-2',
        meetingNumber: 2,
        title: 'Pola Deret Angka, Huruf & Matriks Numerik',
        subtopics: ['Deret Aritmetika, Geometri & Fibonacci', 'Deret Huruf Bertingkat & Pola Dua Jalur (Lompat)', 'Teka-teki Matriks Angka dalam Pola Gambar'],
        competency: 'Menemukan aturan matematis tersembunyi pada rangkaian pola bilangan.',
        durationMinutes: 90,
        teachingMethod: 'Pola Visual & Formula Cepat'
      },
      {
        id: 'top-6-3',
        meetingNumber: 3,
        title: 'Penalaran Logis: Silogisme & Modus Ponens/Tollens',
        subtopics: ['Penarikan Kesimpulan Premis Mayor & Minor', 'Pernyataan Kuantor: "Semua", "Beberapa/Sebagian", "Tidak Ada"', 'Hukum Kontraposisi & Ekuivalensi Logika'],
        competency: 'Menarik kesimpulan valid tanpa terpengaruh asumsi di luar premis yang diberikan.',
        durationMinutes: 90,
        teachingMethod: 'Diagram Venn & Tabel Kebenaran Logika'
      },
      {
        id: 'top-6-4',
        meetingNumber: 4,
        title: 'Penalaran Analitis & Urutan Posisi (Ordering/Grouping)',
        subtopics: ['Peringkat Nilai, Posisi Duduk Meja Bundar/Lurus', 'Jadwal Kerja & Kombinasi Syarat Bersyarat', 'Trik Menggambar Tabel Grid Analisis Cepat'],
        competency: 'Menyusun urutan posisi logis berdasarkan serangkaian petunjuk bersyarat.',
        durationMinutes: 90,
        teachingMethod: 'Metode Matriks Grid & Latihan Mandiri'
      },
      {
        id: 'top-6-5',
        meetingNumber: 5,
        title: 'Penalaran Spasial & Figural 2D/3D',
        subtopics: ['Rotasi & Pencerminan Bangun Datar/Ruang', 'Kelanjutan Pola Gambar Serial', 'Jaring-jaring Kubus & Pencocokan Pola Lipatan'],
        competency: 'Membayangkan transformasi visual dan membedakan gambar yang tidak seirama.',
        durationMinutes: 90,
        teachingMethod: 'Software Visualisasi Spasial & Drill Soal'
      },
      {
        id: 'top-6-6',
        meetingNumber: 6,
        title: 'Simulasi Akbar Tryout CBT Seleksi Labschool & Pembahasan',
        subtopics: ['Ujian 60 Soal TPA CBT Berwaktu 60 Menit', 'Passing Grade & Perangkingan Prediksi Kelulusan', 'Kiat Menghadapi Wawancara & Psikotes PSB'],
        competency: 'Memantapkan strategi pengerjaan dan efisiensi waktu ujian seleksi sebenarnya.',
        durationMinutes: 90,
        teachingMethod: 'Full CBT Simulation & Motivation Session'
      }
    ]
  },
  {
    id: 'sil-lab-sma',
    code: 'SIL-LAB-SMA',
    title: 'Silabus Kurikulum Intensif Seleksi Masuk SMA Labschool (5 Subtes)',
    subject: 'Persiapan PSB SMA Labschool',
    targetClass: 'Masuk SMA Labschool',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum terstandar seleksi PSB SMA Labschool 4 Kampus (Kebayoran, Rawamangun, Cibubur, Cirendeu) mencakup 5 Subtes Utama: Pengetahuan Kuantitatif (PK), Kemampuan Verbal (KV), Penalaran Matematika (PM), Kemampuan Akademik Saintek/Soshum (KA), dan Skolastik & Logika (SK) + Simulasi CBT.',
    totalMeetings: 6,
    status: 'ACTIVE',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-08',
    topics: [
      {
        id: 'top-sma-1',
        meetingNumber: 1,
        title: 'Pengetahuan Kuantitatif (PK): Pola Bilangan, Barisan Deret & Aljabar Seleksi Labschool',
        subtopics: ['Pola Bilangan Bertingkat Dua & Fibonacci Khusus', 'Manipulasi Aljabar Pecahan & Nilai Mutlak', 'Trik Cepat 30 Detik Soal Persentase & Diskon Ganda'],
        competency: 'Siswa mampu menyelesaikan persoalan aritmetika, pola bilangan bertingkat, dan manipulasi aljabar pecahan dalam batas waktu < 45 detik per soal.',
        durationMinutes: 120,
        teachingMethod: 'Problem-Based Learning & Speed Drills'
      },
      {
        id: 'top-sma-2',
        meetingNumber: 2,
        title: 'Kemampuan Verbal (KV): Teknik Skimming-Scanning Teks Panjang, Silogisme Logis & Analogi Semantik',
        subtopics: ['Penarikan Kesimpulan Modus Ponens, Tollens & Silogisme', 'Identifikasi Ide Pokok & Makna Tersirat Paragraf Kompleks', 'Pemetaan Hubungan Analogi Kata Asosiatif'],
        competency: 'Menganalisis paragraf argumentatif kompleks, menarik kesimpulan silogisme valid, dan memetakan analogi kata asosiatif dengan akurasi 90%+.',
        durationMinutes: 120,
        teachingMethod: 'Analisis Diagram Logika & Flashcard Kosa Kata'
      },
      {
        id: 'top-sma-3',
        meetingNumber: 3,
        title: 'Penalaran Matematika (PM): Geometri Analitik, Bangun Datar/Ruang & Peluang Kombinatorika',
        subtopics: ['Luas Daerah yang Diarsir & Teorema Phytagoras Lanjut', 'Permutasi, Kombinasi & Peluang Bersyarat', 'Statistika Data Tunggal & Rata-rata Gabungan'],
        competency: 'Menguasai konsep luas bangun gabungan, peluang bersyarat, serta statistika data kontekstual standar soal HOTS Labschool.',
        durationMinutes: 120,
        teachingMethod: 'Konseptual Visual & Bedah Soal Asli PSB'
      },
      {
        id: 'top-sma-4',
        meetingNumber: 4,
        title: 'Kemampuan Akademik (KA): Fisika Terapan Mekanika, Kalor, Gelombang Bunyi & Cahaya',
        subtopics: ['Hukum Newton Gerak & Gesekan pada Bidang Miring', 'Asas Black, Perpindahan Kalor & Perubahan Wujud', 'Cepat Rambat Gelombang & Efek Doppler Sederhana'],
        competency: 'Memahami hukum mekanika klasik dan hukum termodinamika terapan serta menyelesaikan hitungan cepat sains IPA.',
        durationMinutes: 120,
        teachingMethod: 'Eksperimen Interaktif & Mind Mapping Rumus'
      },
      {
        id: 'top-sma-5',
        meetingNumber: 5,
        title: 'Skolastik & Logika (SK): Rotasi Spasial 3D, Pola Matriks Gambar & Logika Analitik Posisi',
        subtopics: ['Rotasi Sumbu XYZ pada Kubus Berpola', 'Pola Matriks Gambar 3x3 Berubah Bentuk & Warna', 'Urutan Duduk & Posisi Bersyarat (Analytical Reasoning)'],
        competency: 'Memvisualisasikan transformasi rotasi ruang 3D, membaca matriks gambar kognitif, dan mengorganisasi urutan posisi logis.',
        durationMinutes: 120,
        teachingMethod: 'Software Visualisasi Spasial & Latihan Terpandu'
      },
      {
        id: 'top-sma-6',
        meetingNumber: 6,
        title: 'Simulasi & Evaluasi Akbar: Review Tryout CBT & Strategi Manajemen Waktu PSB Labschool',
        subtopics: ['Pembahasan Komprehensif Soal Paling Sering Salah Nasional', 'Manajemen Alokasi Waktu 30 Detik per Soal Mudah, 60 Detik Sedang', 'Strategi Memaksimalkan Skor di Kampus Labschool Pilihan'],
        competency: 'Memantapkan ketahanan mental, strategi eliminasi opsi, dan efisiensi waktu pengerjaan CBT dengan target skor di atas passing grade 87.5+.',
        durationMinutes: 120,
        teachingMethod: 'Simulasi CAT Terwaktu & Bedah Kunci Jawaban'
      }
    ]
  },
  {
    id: 'sil-lab-smp',
    code: 'SIL-LAB-SMP',
    title: 'Silabus Kurikulum Akselerasi Seleksi Masuk SMP Labschool (5 Subtes)',
    subject: 'Persiapan PSB SMP Labschool',
    targetClass: 'Masuk SMP Labschool',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Bambang Sudibyo, M.Si.',
    description: 'Kurikulum komprehensif akselerasi seleksi PSB SMP Labschool untuk jenjang SD ke SMP mencakup Aritmetika Dasar, Verbal Kebahasaan, Penalaran Spasial Kognitif, Sains IPA/IPS Terpadu, dan Profil Karakter Siswa.',
    totalMeetings: 6,
    status: 'ACTIVE',
    createdAt: '2026-01-12',
    updatedAt: '2026-02-08',
    topics: [
      {
        id: 'top-smp-1',
        meetingNumber: 1,
        title: 'Pengetahuan Kuantitatif (PK): Aritmatika Sosial, Pecahan, FPB-KPK & Pola Bilangan Masuk SMP',
        subtopics: ['Operasi Hitung Campuran Pecahan & Desimal Kilat', 'Penyelesaian Soal Cerita FPB dan KPK Kontekstual', 'Trik Cepat Persentase Untung-Rugi & Diskon Bertingkat'],
        competency: 'Siswa menguasai perhitungan cepat operasi pecahan campuran dan pemecahan masalah soal cerita FPB/KPK konteks sehari-hari.',
        durationMinutes: 120,
        teachingMethod: 'Trik Hitung Cepat & Latihan Soal Cerita'
      },
      {
        id: 'top-smp-2',
        meetingNumber: 2,
        title: 'Kemampuan Verbal (KV): Sinonim, Antonim, Padanan Kata (Analogi) & Kalimat Baku PUEBI SMP',
        subtopics: ['Pemetaan Hubungan Kata Sebab-Akibat, Bagian-Keseluruhan', 'Kosakata Baku KBBI yang Sering Muncul di PSB Labschool', 'Perbaikan Kalimat Rancu & Tanda Baca Efektif'],
        competency: 'Memperluas perbendaharaan kata baku dan menentukan hubungan analogi kata bahasa Indonesia dengan tepat.',
        durationMinutes: 120,
        teachingMethod: 'Kuis Flashcard Kosakata & Game Analogi'
      },
      {
        id: 'top-smp-3',
        meetingNumber: 3,
        title: 'Penalaran Matematika (PM): Geometri Bangun Datar, Sudut Garis Sejajar & Soal Cerita Logika',
        subtopics: ['Keliling dan Luas Daerah yang Diarsir Bangun Datar Gabungan', 'Sifat Sudut Berseberangan & Sudut Sepihak', 'Statistika Rata-rata Gabungan & Diagram Batang'],
        competency: 'Mampu menganalisis luas bangun datar gabungan tak beraturan dan menarik kesimpulan dari diagram statistika.',
        durationMinutes: 120,
        teachingMethod: 'Visualisasi Geometri & Diskusi Interaktif'
      },
      {
        id: 'top-smp-4',
        meetingNumber: 4,
        title: 'Kemampuan Akademik (KA) - Sains: Gaya, Gerak, Kalor, Perpindahan Energi & Ekosistem Hayati',
        subtopics: ['Gaya Gesek, Gaya Berat & Pengaruhnya pada Gerak Benda', 'Perubahan Wujud Zat & Konsep Kalor Asas Black Sederhana', 'Rantai Makanan, Simbiosis & Adaptasi Makhluk Hidup'],
        competency: 'Menguasai konsep dasar sains fisika dan biologi lingkungan yang diujikan dalam tes akademik SMP Labschool.',
        durationMinutes: 120,
        teachingMethod: 'Eksperimen Virtual Sains & Mind Mapping'
      },
      {
        id: 'top-smp-5',
        meetingNumber: 5,
        title: 'Kemampuan Akademik (KA) - IPS & Karakter: Peta Geografi Indonesia, Kegiatan Ekonomi & Karakter',
        subtopics: ['Letak Geografis & Astronomis Indonesia serta Pengaruh Iklim', 'Peran Produsen, Distributor, dan Konsumen dalam Perekonomian', 'Penerapan Karakter Integritas, Gotong Royong & Anti Perundungan'],
        competency: 'Memahami letak geografi Indonesia, dinamika ekonomi sosial, dan nilai karakter integritas seleksi Labschool.',
        durationMinutes: 120,
        teachingMethod: 'Studi Kasus & Diskusi Nilai Karakter'
      },
      {
        id: 'top-smp-6',
        meetingNumber: 6,
        title: 'Skolastik & Logika Spasial (SK): Jaring-jaring Ruang, Serial Gambar 2D/3D & Simulasi CBT Final',
        subtopics: ['Rotasi Bangun Pola Gambar 2D & Serial Matriks Gambar', 'Pencocokan Jaring-jaring Balok dan Kubus Berpola', 'Manajemen Waktu Pengerjaan Soal CBT 45 Detik per Soal'],
        competency: 'Memiliki kecepatan tinggi dalam visualisasi jaring-jaring kubus dan serial gambar logika figural.',
        durationMinutes: 120,
        teachingMethod: 'Simulasi CAT CBT & Refleksi Kesiapan Seleksi'
      }
    ]
  },
  {
    id: 'sil-smp-pk',
    code: 'SIL-PK-SMP-LAB',
    title: 'Silabus Pengetahuan Kuantitatif (PK) - Seleksi Masuk SMP Labschool',
    subject: 'Pengetahuan Kuantitatif (PK)',
    targetClass: 'SMP-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum intensif Pengetahuan Kuantitatif (PK) persiapan seleksi PSB SMP Labschool, mencakup operasi hitung pecahan & desimal kilat, aritmatika sosial transaksi ekonomi, serta pola barisan bilangan & FPB-KPK kontekstual.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-smp-pk-1',
        meetingNumber: 1,
        title: 'Operasi Hitung Campuran, Pecahan & Desimal Kilat',
        subtopics: [
          'Aturan prioritas operasi hitung campuran (Kabataku & Tanda Kurung)',
          'Trik perkalian & pembagian pecahan campuran tanpa penyebut besar',
          'Konversi kilat bentuk persen, pecahan biasa, dan desimal berulang'
        ],
        competency: 'Siswa mampu menyelesaikan hitungan aritmetika pecahan dan desimal dalam waktu < 30 detik tanpa kalkulator dengan tingkat akurasi 100%.',
        durationMinutes: 90,
        teachingMethod: 'Fast Calculation Tricks & Drill Soal Aritmetika',
        referenceNotes: 'Bank Soal PSB Labschool Pengetahuan Kuantitatif & Modul Mandiri BSA',
        linkedMaterialId: 'mat-1',
        linkedMaterialTitle: 'Modul Intensif Pengetahuan Kuantitatif & Logika Aritmatika'
      },
      {
        id: 'top-smp-pk-2',
        meetingNumber: 2,
        title: 'Aritmatika Sosial, Rasio Perbandingan & Diskon Bertingkat',
        subtopics: [
          'Perhitungan untung, rugi, persentase diskon ganda & potongan harga toko',
          'Perbandingan senilai dan berbalik nilai pada soal kecepatan/jarak/waktu',
          'Estimasi pajak belanja dan bunga tabungan tunggal sederhana'
        ],
        competency: 'Menganalisis dan memecahkan soal cerita kontekstual transaksi ekonomi dan perbandingan kuantitas standar PSB SMP Labschool.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Studi Kasus Finansial Sederhana',
        referenceNotes: 'Kompilasi Soal Aritmatika Sosial Seleksi Masuk Sekolah Unggulan',
        linkedMaterialId: 'mat-1',
        linkedMaterialTitle: 'Modul Intensif Pengetahuan Kuantitatif & Logika Aritmatika'
      },
      {
        id: 'top-smp-pk-3',
        meetingNumber: 3,
        title: 'Pola Barisan Bilangan, FPB-KPK & Penalaran Aljabar Dasar',
        subtopics: [
          'Pola barisan aritmetika, geometri bertingkat, dan deret loncat dua',
          'Penerapan FPB dan KPK pada soal cerita jadwal lampu & pembagian bingkisan',
          'Model aljabar dasar satu variabel untuk pemecahan teka-teki logika angka'
        ],
        competency: 'Menemukan pola bilangan tersembunyi dan memformulasikan persamaan matematika sederhana dari permasalahan kontekstual.',
        durationMinutes: 90,
        teachingMethod: 'Pola Visual & Bedah Soal HOTS PSB Labschool',
        referenceNotes: 'Mastery Seri Soal Penalaran Kuantitatif Labschool'
      }
    ]
  },
  {
    id: 'sil-smp-kv',
    code: 'SIL-KV-SMP-LAB',
    title: 'Silabus Kemampuan Verbal B.Indo & B.Inggris (KV) - SMP Labschool',
    subject: 'Kemampuan Verbal (KV)',
    targetClass: 'SMP-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Pendalaman kemampuan verbal dwibahasa (Bahasa Indonesia & Bahasa Inggris) untuk seleksi SMP Labschool, mencakup analogi padanan kata, sinonim-antonim baku, hubungan semantik, serta English vocabulary in context & sentence completion.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-smp-kv-1',
        meetingNumber: 1,
        title: 'Analogi Hubungan Kata & Padanan Makna (Bahasa Indonesia)',
        subtopics: [
          'Pola analogi sebab-akibat, fungsi alat, bagian-keseluruhan, dan asosiasi profesi',
          'Identifikasi sinonim dan antonim kata baku KBBI yang sering keluar di PSB',
          'Trik eliminasi opsi hubungan kata yang tidak sepadan dan pengecoh'
        ],
        competency: 'Mengidentifikasi logika keterhubungan makna antar kata dalam bahasa Indonesia dengan kecepatan dan ketepatan tinggi.',
        durationMinutes: 90,
        teachingMethod: 'Speed Flashcard & Analisis Matriks Hubungan Makna',
        referenceNotes: 'Kamus Sinonim-Antonim & Bank Soal Analogi Verbal'
      },
      {
        id: 'top-smp-kv-2',
        meetingNumber: 2,
        title: 'English Vocabulary in Context & Word Association (Bahasa Inggris)',
        subtopics: [
          'Synonyms and antonyms of common academic words (Tier 2 vocabulary)',
          'Contextual word meaning in short daily dialogues and descriptive sentences',
          'Word classification, odd-one-out categories, and semantic grouping'
        ],
        competency: 'Menguasai perbendaharaan kosakata Bahasa Inggris akademik level SMP dan menentukan padanan kata dalam kalimat konteks.',
        durationMinutes: 90,
        teachingMethod: 'Interactive Vocabulary Quiz & Context Clue Analysis',
        referenceNotes: 'Cambridge Junior English Vocabulary & Labschool Prep Module'
      },
      {
        id: 'top-smp-kv-3',
        meetingNumber: 3,
        title: 'Silogisme Verbal Logis & Struktur Kalimat Baku Dwi-Bahasa',
        subtopics: [
          'Penarikan simpulan logis premis verbal Bahasa Indonesia (Kuantor Semua/Sebagian)',
          'English sentence completion and connector usage (because, although, therefore, however)',
          'Koreksi kalimat rancu/tidak efektif dan pemilihan diksi presisi'
        ],
        competency: 'Mampu menarik simpulan verbal berbasis premis dan menyusun struktur kalimat baku dwibahasa secara logis.',
        durationMinutes: 90,
        teachingMethod: 'Logical Diagramming & Dual-Language Sentence Workshop',
        referenceNotes: 'Panduan Silogisme & Logika Verbal Labschool'
      }
    ]
  },
  {
    id: 'sil-smp-pm',
    code: 'SIL-PM-SMP-LAB',
    title: 'Silabus Pemahaman Membaca B.Indo & B.Inggris (PM) - SMP Labschool',
    subject: 'Pemahaman Membaca (PM)',
    targetClass: 'SMP-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Sarah Maharani, S.Pd., M.Ed.',
    description: 'Kurikulum literasi membaca intensif dwi-bahasa untuk seleksi SMP Labschool, melatih teknik skimming & scanning cepat, penentuan gagasan utama, inferensi tersirat, serta sintesis informasi multiteks naratif & eksposisi.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-smp-pm-1',
        meetingNumber: 1,
        title: 'Gagasan Utama, Ide Pokok & Fakta-Opini Teks Bahasa Indonesia',
        subtopics: [
          'Menemukan kalimat utama pada paragraf deduktif, induktif, dan campuran',
          'Membedakan pernyataan fakta vs opini dalam wacana berita aktual',
          'Menentukan judul dan simpulan yang paling merepresentasikan isi bacaan'
        ],
        competency: 'Siswa mampu mengekstrak inti sari wacana teks Bahasa Indonesia dalam waktu kurang dari 45 detik.',
        durationMinutes: 90,
        teachingMethod: 'Skimming-Scanning Drills & Paragraph Blueprinting',
        referenceNotes: 'Seri Literasi Membaca Cepat & Pemahaman Wacana Kritis'
      },
      {
        id: 'top-smp-pm-2',
        meetingNumber: 2,
        title: 'Main Idea, Supporting Details & Inferences in English Passages',
        subtopics: [
          'Locating main ideas and topic sentences in descriptive and recount passages',
          'Scanning for specific details (dates, names, causes, definitions, locations)',
          'Making accurate inferences based on implied context and evidence'
        ],
        competency: 'Memahami teks bacaan Bahasa Inggris, menjawab pertanyaan detail dan inferensi tersirat secara akurat.',
        durationMinutes: 90,
        teachingMethod: 'Question-Passage Mapping & Timed Reading Practice',
        referenceNotes: 'Standard Reading Comprehension for Junior High School Entrance'
      },
      {
        id: 'top-smp-pm-3',
        meetingNumber: 3,
        title: 'Analisis Tujuan Penulis & Sintesis Informasi Multiteks',
        subtopics: [
          'Mengidentifikasi tujuan penulisan wacana (to inform, persuade, entertain)',
          'Menemukan amanat dan pesan moral pada teks fabel/cerpen inspiratif',
          'Membandingkan dua teks berbeda dengan tema serupa dalam Bahasa Indonesia dan Inggris'
        ],
        competency: 'Menganalisis pesan tersirat dan membandingkan informasi dari dua sumber bacaan berbeda secara kritis.',
        durationMinutes: 90,
        teachingMethod: 'Comparative Reading Workshop & Critical Thinking Discussion',
        referenceNotes: 'Kompilasi Soal Pemahaman Membaca HOTS Labschool'
      }
    ]
  },
  {
    id: 'sil-smp-aka-ipa',
    code: 'SIL-SMP-AKA-IPA',
    title: 'Silabus Kemampuan Akademik IPA (AKA-IPA) - SMP Labschool',
    subject: 'Kemampuan Akademik IPA (AKA-IPA)',
    targetClass: 'SMP-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Siti Nurhaliza, S.Si., M.Sc.',
    description: 'Kurikulum persiapan tes Kemampuan Akademik IPA Seleksi SMP Labschool, mencakup konsep mekanika dasar gaya & gerak, termodinamika kalor & energi terbarukan, serta sistem organ tubuh & ekosistem hayati.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-smp-ipa-1',
        meetingNumber: 1,
        title: 'Mekanika Dasar: Gaya, Gerak, Pesawat Sederhana & Tekanan',
        subtopics: [
          'Pengaruh gaya gesek, gravitasi, dan gaya magnet terhadap gerak benda',
          'Konsep kelajuan, kecepatan, jarak, dan grafik gerak lurus beraturan (GLB)',
          'Prinsip kerja tuas, bidang miring, katrol, serta konsep tekanan hidrostatis'
        ],
        competency: 'Menjelaskan konsep gerak, menghitung besaran fisis sederhana, dan menganalisis keuntungan mekanis pesawat sederhana.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Virtual PhET & Pembahasan Soal Konseptual',
        referenceNotes: 'Fisika Dasar SMP & Bank Soal TKA IPA Terpadu'
      },
      {
        id: 'top-smp-ipa-2',
        meetingNumber: 2,
        title: 'Suhu, Kalor, Wujud Zat & Energi Terbarukan',
        subtopics: [
          'Konversi skala termometer (Celcius, Reamur, Fahrenheit, Kelvin)',
          'Perpindahan kalor (konduksi, konveksi, radiasi) dan perubahan wujud zat',
          'Sumber energi alternatif ramah lingkungan (surya, angin, air, biomassa)'
        ],
        competency: 'Memahami mekanisme perpindahan energi kalor dan pentingnya pemanfaatan energi ramah lingkungan.',
        durationMinutes: 90,
        teachingMethod: 'Eksperimen Sederhana & Mind Mapping Energi',
        referenceNotes: 'Buku Ajar Sains Terpadu Labschool'
      },
      {
        id: 'top-smp-ipa-3',
        meetingNumber: 3,
        title: 'Ciri Makhluk Hidup, Sistem Organ Tubuh & Ekosistem Hayati',
        subtopics: [
          'Klasifikasi dan bentuk adaptasi morfologi/fisiologi tumbuhan & hewan',
          'Sistem pernapasan, pencernaan, dan peredaran darah manusia',
          'Rantai makanan, jaring-jaring makanan, simbiosis, dan mitigasi polusi lingkungan'
        ],
        competency: 'Menganalisis hubungan timbal balik dalam ekosistem dan memelihara kesehatan sistem organ tubuh.',
        durationMinutes: 90,
        teachingMethod: 'Visualisasi Diagram Hayati & Bedah Soal HOTS Sains',
        referenceNotes: 'Biologi Lingkungan & Kesehatan Remaja'
      }
    ]
  },
  {
    id: 'sil-smp-aka-ips',
    code: 'SIL-SMP-AKA-IPS',
    title: 'Silabus Kemampuan Akademik IPS (AKA-IPS) - SMP Labschool',
    subject: 'Kemampuan Akademik IPS (AKA-IPS)',
    targetClass: 'SMP-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dra. Endang Purwanti, M.Pd.',
    description: 'Kurikulum Kemampuan Akademik IPS untuk seleksi SMP Labschool, mencakup geografi spasial nusantara & mitigasi bencana, kegiatan ekonomi & literasi finansial, serta sejarah perjuangan bangsa & interaksi sosial budaya.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-smp-ips-1',
        meetingNumber: 1,
        title: 'Geografi Nusantara: Peta, Letak Astronomis & Kenampakan Alam',
        subtopics: [
          'Membaca simbol peta, skala, letak astronomis (iklim tropis) dan geografis Indonesia',
          'Pembagian 3 zona waktu (WIB, WITA, WIT) dan potensi sumber daya maritim/agraris',
          'Mitigasi bencana alam gempa bumi, gunung meletus, tsunami, dan banjir'
        ],
        competency: 'Memahami kondisi geografis nusantara, membaca peta tematik, serta memahami prinsip mitigasi bencana.',
        durationMinutes: 90,
        teachingMethod: 'Peta Digital Interaktif & Studi Kasus Geografis',
        referenceNotes: 'Atlas Indonesia & Geografi Spasial Nusantara'
      },
      {
        id: 'top-smp-ips-2',
        meetingNumber: 2,
        title: 'Kegiatan Ekonomi, Pelaku Pasar & Kebutuhan Manusia',
        subtopics: [
          'Alur kegiatan produksi, distribusi, dan konsumsi dalam rantai pasok ekonomi',
          'Peran uang, pasar tradisional vs modern, serta perdagangan antarpulau',
          'Literasi keuangan dasar: menabung, hidup hemat, dan skala prioritas kebutuhan'
        ],
        competency: 'Menganalisis alur kegiatan ekonomi dan menerapkan sikap bijak dalam pengambilan keputusan finansial sehari-hari.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Alur Distribusi & Diskusi Ekonomi Kerakyatan',
        referenceNotes: 'Pengantar Ilmu Ekonomi & Literasi Finansial Remaja'
      },
      {
        id: 'top-smp-ips-3',
        meetingNumber: 3,
        title: 'Sejarah Perjuangan Bangsa, Keragaman Budaya & Interaksi Sosial',
        subtopics: [
          'Tokoh pahlawan nasional, peristiwa proklamasi kemerdekaan & ikrar Sumpah Pemuda',
          'Keragaman suku, rumah adat, tarian daerah, dan semboyan Bhinneka Tunggal Ika',
          'Bentuk interaksi sosial asosiatif: gotong royong, akomodasi, dan kerja sama tim'
        ],
        competency: 'Menumbuhkan wawasan kebangsaan, menghargai keberagaman budaya, dan menjunjung nilai persatuan Indonesia.',
        durationMinutes: 90,
        teachingMethod: 'Timeline Sejarah Visual & Diskusi Kebudayaan',
        referenceNotes: 'Sejarah Nasional Indonesia & Sosiologi Interaksi Sosial'
      }
    ]
  },
  {
    id: 'sil-smp-sv',
    code: 'SIL-SMP-SV',
    title: 'Silabus Survei Karakter & Profil Integritas Siswa (SV) - SMP Labschool',
    subject: 'Survei Karakter (SV)',
    targetClass: 'SMP-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum pembinaan Karakter dan Profil Pelajar Labschool (Integritas Kejujuran Akademik, Empati Sosial, Anti-Bullying, Gotong Royong, Kemandirian, dan Wawasan Kebangsaan) untuk instrumen Survei Karakter & Wawancara PSB.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-smp-sv-1',
        meetingNumber: 1,
        title: 'Integritas Kejujuran Akademik, Tanggung Jawab & Disiplin Diri',
        subtopics: [
          'Sikap jujur dalam ujian, menolak kecurangan/plagiasi, dan berani mengakui kesalahan',
          'Manajemen waktu belajar mandiri dan kedisiplinan mematuhi tata tertib sekolah',
          'Tanggung jawab menyelesaikan tugas individu maupun proyek kelompok tepat waktu'
        ],
        competency: 'Menunjukkan konsistensi nilai kejujuran dan tanggung jawab personal dalam situasi simulasi dilema moral.',
        durationMinutes: 90,
        teachingMethod: 'Studi Kasus Dilema Moral & Refleksi Diri',
        referenceNotes: 'Panduan Pembentukan Karakter Siswa Labschool'
      },
      {
        id: 'top-smp-sv-2',
        meetingNumber: 2,
        title: 'Empati Sosial, Anti-Perundungan (Anti-Bullying) & Gotong Royong',
        subtopics: [
          'Mengenali bentuk perundungan verbal, fisik, siber, dan sikap membela korban secara bijak',
          'Sikap empati, menghargai perbedaan latar belakang teman, dan toleransi beragama',
          'Kolaborasi gotong royong dan kontribusi aktif dalam dinamika kelompok kerja'
        ],
        competency: 'Menerapkan sikap pro-sosial, empati aktif, dan komitmen menciptakan lingkungan belajar aman tanpa kekerasan.',
        durationMinutes: 90,
        teachingMethod: 'Role-Play Situasional & Diskusi Empati Lingkungan',
        referenceNotes: 'Modul Anti-Bullying & Iklim Positif Sekolah'
      },
      {
        id: 'top-smp-sv-3',
        meetingNumber: 3,
        title: 'Kemandirian, Problem Solving Adaptif & Wawasan Kebangsaan',
        subtopics: [
          'Kemampuan mengelola emosi (self-regulation) saat menghadapi tekanan dan kegagalan',
          'Pengambilan keputusan mandiri yang berdasar pada nilai kebenaran dan kebaikan',
          'Penerapan nilai-nilai Pancasila dalam kehidupan sehari-hari sebagai pelajar Labschool'
        ],
        competency: 'Mengembangkan resiliensi emosi, daya juang (grit), dan sikap cinta tanah air berlandaskan Profil Pelajar Labschool.',
        durationMinutes: 90,
        teachingMethod: 'Refleksi Jurnal Karakter & Simulasi Wawancara PSB',
        referenceNotes: 'Profil Pelajar Labschool Berintegritas & Berprestasi'
      }
    ]
  },
  {
    id: 'sil-sma-pk',
    code: 'SIL-PK-SMA-LAB',
    title: 'Silabus Pengetahuan Kuantitatif (PK) - Seleksi Masuk SMA Labschool',
    subject: 'Pengetahuan Kuantitatif (PK)',
    targetClass: 'SMA-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum tingkat lanjut Pengetahuan Kuantitatif (PK) seleksi masuk SMA Labschool, mencakup aljabar faktorisasi & persamaan kuadrat, geometri analitik kesebangunan & dimensi tiga, serta kombinatorika peluang bersyarat & statistika data terpadu.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-sma-pk-1',
        meetingNumber: 1,
        title: 'Aljabar Lanjut: Faktorisasi, Persamaan Kuadrat & Pertidaksamaan Rasional',
        subtopics: [
          'Faktorisasi suku aljabar tingkat tinggi & manipulasi bentuk pecahan aljabar kompleks',
          'Sifat akar-akar persamaan kuadrat (Vieta), diskriminan, dan model grafik parabola',
          'Pertidaksamaan pecahan rasional dan pertidaksamaan nilai mutlak pada garis bilangan'
        ],
        competency: 'Siswa mampu memanipulasi ekspresi aljabar rumit dan menentukan himpunan penyelesaian pertidaksamaan dalam waktu < 45 detik.',
        durationMinutes: 90,
        teachingMethod: 'Metode Fast Algebraic Tricks & Bedah Soal HOTS',
        referenceNotes: 'Aljabar Lanjut Seleksi Masuk SMA Labschool 4 Kampus',
        linkedMaterialId: 'mat-1',
        linkedMaterialTitle: 'Modul Intensif Pengetahuan Kuantitatif & Logika Aritmatika'
      },
      {
        id: 'top-sma-pk-2',
        meetingNumber: 2,
        title: 'Geometri Analitik: Kesebangunan, Luas Arsir & Dimensi Tiga',
        subtopics: [
          'Teorema Pythagoras lanjut, garis singgung lingkaran luar/dalam, dan dalil sudut pusat/keliling',
          'Perhitungan luas daerah bangun datar tak beraturan yang diarsir menggunakan dekomposisi luas',
          'Volume dan luas permukaan bangun ruang gabungan (tabung-kerucut-bola-prisma)'
        ],
        competency: 'Menganalisis konfigurasi geometri bidang datar dan ruang menggunakan penalaran deduktif yang presisi.',
        durationMinutes: 90,
        teachingMethod: 'Visualisasi Spasial 3D & Analisis Geometri Kuantitatif',
        referenceNotes: 'Geometri Kuantitatif & Soal Analitik Tingkat Lanjut'
      },
      {
        id: 'top-sma-pk-3',
        meetingNumber: 3,
        title: 'Kombinatorika, Peluang Bersyarat & Statistika Data Terpadu',
        subtopics: [
          'Prinsip perkalian, permutasi siklis, dan kombinasi pemilihan dengan batasan syarat',
          'Peluang kejadian majemuk saling lepas/bebas dan frekuensi harapan pada eksperimen bertingkat',
          'Statistika data kelompok: rata-rata gabungan, median tabel distribusi, dan simpangan kuartil'
        ],
        competency: 'Memecahkan persoalan probabilitas kejadian bersyarat dan menarik kesimpulan statistik dari data tabular maupun grafik.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Simulasi Ujian CAT Terwaktu',
        referenceNotes: 'Kombinatorika & Statistika Terapan PSB SMA Labschool'
      }
    ]
  },
  {
    id: 'sil-sma-kv',
    code: 'SIL-SMA-KV',
    title: 'Silabus Kemampuan Verbal B.Indo & B.Inggris (KV) - SMA Labschool',
    subject: 'Kemampuan Verbal (KV)',
    targetClass: 'SMA-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Ahmad Fauzi, S.Pd.',
    description: 'Kurikulum penguasaan Kemampuan Verbal dwibahasa level SMA Labschool, memadukan analogi kompleks multiasosiasi & diksi baku lanjutan, advanced English academic vocabulary & idiomatic collocations, serta silogisme deduktif kategorial & logika proposisi dwi-bahasa.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-sma-kv-1',
        meetingNumber: 1,
        title: 'Analogi Hubungan Semantik Kompleks & Diksi Lanjut (Bahasa Indonesia)',
        subtopics: [
          'Analogi kata berpasangan multiasosiasi (hierarki konsep, fungsi spesifik, derajat intensitas makna)',
          'Perbendaharaan kata serapan baku KBBI, istilah ilmiah populer, dan homonim/polisemi',
          'Pemilihan diksi presisi pada kalimat argumentatif formal dan eliminasi lewah kata'
        ],
        competency: 'Mampu memetakan analogi kata tingkat tinggi dan memilih diksi paling akurat dalam konteks kalimat kompleks.',
        durationMinutes: 90,
        teachingMethod: 'Semantic Mapping & Speed Analogy Drills',
        referenceNotes: 'Analogi Semantik Tingkat Lanjut & Tata Kata Bahasa Indonesia'
      },
      {
        id: 'top-sma-kv-2',
        meetingNumber: 2,
        title: 'Advanced English Vocabulary, Idiomatic Expressions & Sentence Completion',
        subtopics: [
          'Academic Word List (AWL) mastery and contextual nuance analysis in formal texts',
          'Common English idioms, phrasal verbs, and prepositional collocations in high school tests',
          'Sentence completion with double blanks requiring logical cohesion and grammatical agreement'
        ],
        competency: 'Menguasai kosakata akademik bahasa Inggris lanjutan dan melengkapi kalimat rumpang dengan koherensi gramatikal tepat.',
        durationMinutes: 90,
        teachingMethod: 'Contextual Fill-in Workshops & Idiom Flashcards',
        referenceNotes: 'SAT/Labschool English Verbal Preparation Kit'
      },
      {
        id: 'top-sma-kv-3',
        meetingNumber: 3,
        title: 'Penalaran Silogisme Verbal Deduktif & Logika Proposisi Dwi-Bahasa',
        subtopics: [
          'Penarikan kesimpulan valid dari silogisme kategorial (Kuantor: Semua, Sebagian, Tidak Ada)',
          'Hukum logika kontraposisi, Modus Ponens, dan Modus Tollens pada wacana dwi-bahasa',
          'Identifikasi kesesatan berpikir (logical fallacies) dalam penalaran deduktif & induktif'
        ],
        competency: 'Menilai validitas penalaran deduktif pada wacana bahasa Indonesia dan bahasa Inggris tanpa terjebak asumsi palsu.',
        durationMinutes: 90,
        teachingMethod: 'Venn Diagram Logic Analysis & Fallacy Hunting Workshop',
        referenceNotes: 'Logika Verbal Formal & Penalaran Kritis'
      }
    ]
  },
  {
    id: 'sil-sma-pm',
    code: 'SIL-SMA-PM',
    title: 'Silabus Pemahaman Membaca B.Indo & B.Inggris (PM) - SMA Labschool',
    subject: 'Pemahaman Membaca (PM)',
    targetClass: 'SMA-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Sarah Maharani, S.Pd., M.Ed.',
    description: 'Kurikulum intensif literasi membaca kritis tingkat tinggi (Higher Order Reading Comprehension) dwibahasa untuk seleksi SMA Labschool, membedah struktur argumen teks editorial ilmiah, author\'s tone & purpose pada teks Bahasa Inggris, serta perbandingan sintesis dua teks (dual passages) dan grafik multimoda.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-sma-pm-1',
        meetingNumber: 1,
        title: 'Membaca Kritis Teks Argumentatif, Editorial & Sintesis Gagasan (B. Indo)',
        subtopics: [
          'Membedah tesis, argumen utama, bukti pendukung, dan asumsi tersembunyi dalam artikel ilmiah populer',
          'Mengidentifikasi nada penulisan (tone), sikap subjektif vs objektif, dan perspektif penulis',
          'Merangkum dan menyintesis esensi wacana panjang padat informasi secara ringkas dan akurat'
        ],
        competency: 'Menganalisis struktur retorika artikel ilmiah dan menyintesis argumen utama secara akurat.',
        durationMinutes: 90,
        teachingMethod: 'Critical Reading Seminar & Argument Mapping',
        referenceNotes: 'Wacana Kritis & Pemahaman Teks Tingkat Tinggi'
      },
      {
        id: 'top-sma-pm-2',
        meetingNumber: 2,
        title: 'Advanced Academic Reading: Author\'s Tone, Purpose & Inferences (English)',
        subtopics: [
          'Deciphering author\'s attitude, perspective, and subtle tone (objective, skeptical, critical, ironic)',
          'Identifying underlying assumptions and drawing high-level deductive inferences from texts',
          'Determining the author\'s primary communicative purpose, target audience, and rhetorical strategy'
        ],
        competency: 'Mampu mendeteksi sikap dan sudut pandang penulis dalam teks eksposisi akademik berbahasa Inggris.',
        durationMinutes: 90,
        teachingMethod: 'Tone & Stance Annotation & In-depth Discussion',
        referenceNotes: 'Advanced Academic Reading Passages for High School Entrance'
      },
      {
        id: 'top-sma-pm-3',
        meetingNumber: 3,
        title: 'Dual Passage Synthesis, Multimodal Data & Comparative Evaluation',
        subtopics: [
          'Comparing and contrasting Passage A vs Passage B with opposing scientific/social viewpoints',
          'Synthesizing information between textual passages and accompanying data charts/infographics',
          'Formulating answers to multi-passage integrative questions under strict CBT time limits'
        ],
        competency: 'Menyintesis dua teks yang saling berlawanan atau melengkapi beserta grafik visual multimoda secara efisien.',
        durationMinutes: 90,
        teachingMethod: 'Paired-Passage Workshop & Speed CBT Simulation',
        referenceNotes: 'Sintesis Multiteks & Analisis Data Grafis'
      }
    ]
  },
  {
    id: 'sil-sma-aka-ipa',
    code: 'SIL-SMA-AKA-IPA',
    title: 'Silabus Kemampuan Akademik IPA Saintek (AKA-IPA) - SMA Labschool',
    subject: 'Kemampuan Akademik IPA (AKA-IPA)',
    targetClass: 'SMA-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Siti Nurhaliza, S.Si., M.Sc.',
    description: 'Kurikulum persiapan tes Kemampuan Akademik IPA Saintek Seleksi Masuk SMA Labschool, mengintegrasikan Fisika Mekanika Newton & Gelombang Optik, Kimia Struktur Atom & Stoikiometri Larutan Dasar, serta Biologi Organisasi Seluler & Genetika Mendel.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-sma-ipa-1',
        meetingNumber: 1,
        title: 'Fisika: Mekanika Dinamika Newton, Usaha-Energi & Gelombang Optik',
        subtopics: [
          'Aplikasi Hukum Newton I, II, III pada sistem katrol, bidang miring kasar, dan tegangan tali',
          'Teorema usaha-energi kinetik dan hukum kekekalan energi mekanik pada lintasan lengkung',
          'Gelombang bunyi, efek Doppler, serta pembentukan bayangan lensa cembung/cekung'
        ],
        competency: 'Menganalisis gerak benda dengan diagram gaya bebas dan memecahkan persamaan gelombang bunyi & optik.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Simulasi Fisika Virtual',
        referenceNotes: 'Fisika Saintek Seleksi SMA Labschool'
      },
      {
        id: 'top-sma-ipa-2',
        meetingNumber: 2,
        title: 'Kimia: Struktur Atom, Ikatan Kimia & Stoikiometri Larutan Dasar',
        subtopics: [
          'Partikel penyusun atom, nomor massa/atom, isotop, dan konfigurasi elektron Bohr/Mekanika Kuantum',
          'Ikatan ionik, kovalen polar/nonpolar, dan sifat fisis senyawa (titik didih & konduktivitas)',
          'Konsep mol, hukum kekekalan massa (Lavoisier/Proust), dan hitungan massa pereaksi pembatas'
        ],
        competency: 'Memahami model atom, memprediksi jenis ikatan senyawa, dan menghitung kuantitas zat dalam reaksi kimia.',
        durationMinutes: 90,
        teachingMethod: 'Visualisasi Molekul 3D & Drill Soal Perhitungan Kimia',
        referenceNotes: 'Kimia Dasar & Stoikiometri Larutan'
      },
      {
        id: 'top-sma-ipa-3',
        meetingNumber: 3,
        title: 'Biologi: Organisasi Sel, Fotosintesis-Respirasi & Genetika Dasar Mendel',
        subtopics: [
          'Struktur dan fungsi organel sel eukariotik serta mekanisme transpor membran (difusi & osmosis)',
          'Metabolisme energi: reaksi fotosintesis (terang/gelap) vs respirasi seluler aerobik',
          'Pola pewarisan sifat persilangan monohibrid/dihibrid Hukum I dan II Mendel serta peta silsilah'
        ],
        competency: 'Menganalisis proses biokimia tingkat sel dan menghitung rasio fenotipe keturunan persilangan genetik.',
        durationMinutes: 90,
        teachingMethod: 'Mind Mapping Biologi & Analisis Diagram Punnett',
        referenceNotes: 'Biologi Sel & Genetika Dasar'
      }
    ]
  },
  {
    id: 'sil-sma-aka-ips',
    code: 'SIL-SMA-AKA-IPS',
    title: 'Silabus Kemampuan Akademik IPS Soshum (AKA-IPS) - SMA Labschool',
    subject: 'Kemampuan Akademik IPS (AKA-IPS)',
    targetClass: 'SMA-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dra. Endang Purwanti, M.Pd.',
    description: 'Kurikulum Kemampuan Akademik IPS Soshum untuk seleksi masuk SMA Labschool, memadukan Ekonomi Mekanisme Pasar & Kebijakan Fiskal-Moneter, Geografi Dinamika Geosfer & Sistem Informasi Geografis (SIG), serta Sosiologi Struktur Sosial, Konflik & Perubahan Sosial Modern.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-sma-ips-1',
        meetingNumber: 1,
        title: 'Ekonomi: Mekanisme Pasar (Permintaan-Penawaran) & Kebijakan Fiskal-Moneter',
        subtopics: [
          'Hukum permintaan dan penawaran, koefisien elastisitas harga, dan kurva titik ekuilibrium pasar',
          'Peran Bank Indonesia, inflasi, suku bunga acuan, dan instrumen kebijakan fiskal/moneter',
          'Perdagangan internasional, kurs valuta asing, dan neraca pembayaran nasional'
        ],
        competency: 'Menganalisis interaksi kekuatan pasar dan memahami dampak kebijakan fiskal-moneter terhadap perekonomian.',
        durationMinutes: 90,
        teachingMethod: 'Analisis Kurva Grafik Ekonomi & Diskusi Isu Makro',
        referenceNotes: 'Ekonomi Makro & Pasar Modal Indonesia'
      },
      {
        id: 'top-sma-ips-2',
        meetingNumber: 2,
        title: 'Geografi: Litosfer, Atmosfer, Hidrosfer & Sistem Informasi Geografis (SIG)',
        subtopics: [
          'Dinamika lempeng tektonik tektonisme, vulkanisme, gempa bumi, dan siklus batuan litosfer',
          'Unsur cuaca/iklim (Köppen, Junghuhn) dan siklus hidrologi air tanah serta daerah aliran sungai (DAS)',
          'Pemanfaatan Citra Penginderaan Jauh (PJ) dan SIG untuk mitigasi bencana & tata ruang kota'
        ],
        competency: 'Menginterpretasikan fenomena geosfer dan memahami aplikasi SIG dalam pemecahan masalah tata ruang wilayah.',
        durationMinutes: 90,
        teachingMethod: 'Peta Digital GIS & Studi Kasus Lingkungan Hidup',
        referenceNotes: 'Geografi Fisik & Sistem Informasi Geografis'
      },
      {
        id: 'top-sma-ips-3',
        meetingNumber: 3,
        title: 'Sosiologi: Diferensiasi, Stratifikasi Sosial, Konflik & Perubahan Sosial Modern',
        subtopics: [
          'Bentuk diferensiasi sosial horizontal dan stratifikasi sosial vertikal terbuka vs tertutup',
          'Faktor penyebab konflik sosial dan mekanisme resolusi konflik (konsiliasi, mediasi, arbitrase)',
          'Dampak globalisasi, modernisasi digital, dan perubahan sosial terhadap institusi masyarakat'
        ],
        competency: 'Menganalisis dinamika struktur sosial dan memformulasikan solusi damai terhadap konflik sosial di masyarakat majemuk.',
        durationMinutes: 90,
        teachingMethod: 'Studi Kasus Sosiologis & Diskusi Analisis Kritis',
        referenceNotes: 'Sosiologi Masyarakat Majemuk & Perubahan Sosial'
      }
    ]
  },
  {
    id: 'sil-sma-sv',
    code: 'SIL-SMA-SV',
    title: 'Silabus Survei Karakter & Wawasan Kepemimpinan (SV) - SMA Labschool',
    subject: 'Survei Karakter (SV)',
    targetClass: 'SMA-LABSCHOOL',
    academicYear: '2025/2026 Gelombang I & II',
    teacherInCharge: 'Dr. Hendra Wijaya, M.Pd.',
    description: 'Kurikulum pembinaan Karakter, Integritas Etika Akademik, Kepemimpinan Diri (Self-Leadership), Kecerdasan Emosional (EQ) & Resiliensi, serta Wawasan Kebangsaan & Moderasi Beragama untuk seleksi PSB 4 Kampus SMA Labschool.',
    totalMeetings: 3,
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28',
    topics: [
      {
        id: 'top-sma-sv-1',
        meetingNumber: 1,
        title: 'Integritas Etika Akademik, Anti-Kecurangan & Kepemimpinan Diri (Self-Leadership)',
        subtopics: [
          'Konsistensi moral dalam menolak kecurangan digital/akademik dan menjunjung orisinalitas karya ilmiah',
          'Karakter kepemimpinan diri: proaktif, penetapan visi pribadi, dan manajemen prioritas waktu',
          'Akuntabilitas personal dan keberanian bersuara untuk kebenaran (moral courage) di lingkungan sekolah'
        ],
        competency: 'Menunjukkan keteguhan integritas etika dan kemampuan memimpin diri sendiri dalam situasi tekanan kompetisi tinggi.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi Dilema Etika & Analisis Kasus Kepemimpinan',
        referenceNotes: 'Kepemimpinan Remaja & Etika Akademik Unggul'
      },
      {
        id: 'top-sma-sv-2',
        meetingNumber: 2,
        title: 'Kecerdasan Emosional (EQ), Resiliensi Mental & Manajemen Stres Belajar',
        subtopics: [
          'Mengenali pemicu stres akademik dan strategi koping adaptif (mindfulness & growth mindset)',
          'Resiliensi mental menghadapi kegagalan/penolakan dan membangun daya juang pantang menyerah',
          'Komunikasi asertif, resolusi konflik interpersonal secara damai, dan empati sosial mendalam'
        ],
        competency: 'Menerapkan kecerdasan emosional dan ketangguhan mental dalam menghadapi tantangan akademik jenjang SMA.',
        durationMinutes: 90,
        teachingMethod: 'Workshop Resiliensi & Latihan Komunikasi Asertif',
        referenceNotes: 'Kecerdasan Emosional Remaja & Manajemen Stres'
      },
      {
        id: 'top-sma-sv-3',
        meetingNumber: 3,
        title: 'Wawasan Kebangsaan, Moderasi Beragama & Komitmen Kontribusi Sosial',
        subtopics: [
          'Penerapan nilai-nilai luhur Pancasila dalam pergaulan global dan pemanfaatan etis teknologi digital',
          'Sikap moderasi beragama, toleransi aktif, dan penghargaan mendalam atas keragaman multikultural',
          'Komitmen kontribusi sosial: inisiatif pelayanan masyarakat dan kepedulian aksi lingkungan hidup'
        ],
        competency: 'Mengekspresikan wawasan kebangsaan yang kokoh, toleransi multikultural, dan komitmen kontribusi nyata bagi masyarakat.',
        durationMinutes: 90,
        teachingMethod: 'Presentasi Reflektif Karakter & Simulasi Wawancara Seleksi PSB',
        referenceNotes: 'Profil Pelajar Berwawasan Kebangsaan & Berkarakter Global'
      }
    ]
  },
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

// Today's date string helper for consistent dynamic demo
const todayObj = new Date();
const currentYear = todayObj.getFullYear();
const currentMonth = String(todayObj.getMonth() + 1).padStart(2, '0');
const currentDay = String(todayObj.getDate()).padStart(2, '0');
const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

const getOffsetDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const INITIAL_AGENDAS: AgendaItem[] = [
  {
    id: 'agd-1',
    title: 'Tryout Akbar UTBK-SNBT 2026 Gelombang I',
    date: todayStr,
    time: '08:00 - 10:30 WIB',
    type: 'EXAM',
    targetClass: 'XII-UTBK',
    subject: 'TPS & Literasi SNBT',
    location: 'Lab CBT Digital 1 & Online',
    description: 'Simulasi ujian CAT berbasis waktu standar BPPP Kemendikbudristek untuk seluruh siswa kelas XII.',
    author: 'Tim Kurikulum CBT',
    status: 'ONGOING',
    isImportant: true,
    linkedExamId: 'exam-1',
    createdAt: '2026-08-01'
  },
  {
    id: 'agd-2',
    title: 'KBM Intensif: Penalaran Matematika & Aljabar HOTS',
    date: todayStr,
    time: '13:00 - 14:30 WIB',
    type: 'CLASS',
    targetClass: 'XII-UTBK',
    subject: 'Matematika & TPS Kuantitatif',
    location: 'Ruang Teori 12A / Google Meet',
    description: 'Pembahasan 15 tipe soal fungsi kuadrat dan sistem persamaan linear bersama Dr. Hendra Wijaya, M.Pd.',
    author: 'Dr. Hendra Wijaya, M.Pd.',
    status: 'UPCOMING',
    isImportant: false,
    linkedSyllabusId: 'sil-mtk-1',
    createdAt: '2026-08-02'
  },
  {
    id: 'agd-3',
    title: 'Deadline Pengumpulan Tugas Resensi & Literasi Kritis',
    date: getOffsetDateStr(1),
    time: '23:59 WIB',
    type: 'TASK',
    targetClass: 'SEMUA',
    subject: 'Bahasa Indonesia & Literasi',
    location: 'Portal CBT / Form Tugas',
    description: 'Pengunggahan dokumen PDF analisis teks argumentatif editorial media massa nasional.',
    author: 'Ahmad Fauzi, S.Pd.',
    status: 'UPCOMING',
    isImportant: true,
    createdAt: '2026-08-03'
  },
  {
    id: 'agd-4',
    title: 'Rapat Koordinasi Evaluasi Belajar & Kurikulum Merdeka',
    date: getOffsetDateStr(2),
    time: '09:00 - 11:30 WIB',
    type: 'MEETING',
    targetClass: 'SEMUA',
    location: 'Ruang Guru & Aula Utama',
    description: 'Rapat pleno dewan guru bersama Kepala Sekolah membahas capaian KKM dan rekapitulasi penilaian.',
    author: 'Kepala Sekolah',
    status: 'UPCOMING',
    isImportant: true,
    createdAt: '2026-08-04'
  },
  {
    id: 'agd-5',
    title: 'Workshop Bedah Soal English Reading Comprehension & IELTS',
    date: getOffsetDateStr(3),
    time: '10:00 - 12:00 WIB',
    type: 'EVENT',
    targetClass: 'XI-IPA',
    subject: 'Bahasa Inggris & English Literacy',
    location: 'Auditorium Brain Space',
    description: 'Sesi pendalaman trik cepat skimming & scanning teks naratif panjang dengan skor akurasi 95%+.',
    author: 'Sarah Maharani, S.Pd., M.Ed.',
    status: 'UPCOMING',
    isImportant: false,
    createdAt: '2026-08-05'
  },
  {
    id: 'agd-6',
    title: 'Ulangan Harian Bab Termodinamika & Gas Ideal',
    date: getOffsetDateStr(4),
    time: '08:00 - 09:30 WIB',
    type: 'EXAM',
    targetClass: 'XI-IPA',
    subject: 'Fisika & TKA Saintek',
    location: 'Lab Fisika & Portal CBT',
    description: 'Evaluasi formatif 25 butir soal pilihan ganda kompleks dan analisis grafik siklus Carnot.',
    author: 'Siti Nurhaliza, S.Si., M.Sc.',
    status: 'UPCOMING',
    isImportant: false,
    linkedExamId: 'exam-2',
    createdAt: '2026-08-06'
  },
  {
    id: 'agd-7',
    title: 'Peringatan Hari Kemerdekaan RI Ke-81 & Lomba Sains',
    date: getOffsetDateStr(9),
    time: '07:30 - 15:00 WIB',
    type: 'HOLIDAY',
    targetClass: 'SEMUA',
    location: 'Lapangan Utama & Kampus Akademi',
    description: 'Upacara bendera peringatan kemerdekaan dilanjutkan olimpiade mini cerdas cermat antarkelas.',
    author: 'Panitia PHBN',
    status: 'UPCOMING',
    isImportant: true,
    createdAt: '2026-08-07'
  },
  {
    id: 'agd-8',
    title: 'Praktikum Virtual Mikroskopis Biologi Sel & Jaringan',
    date: getOffsetDateStr(-1),
    time: '13:00 - 15:00 WIB',
    type: 'CLASS',
    targetClass: 'X-IPA',
    subject: 'Biologi & Sains Terapan',
    location: 'Lab Komputer 2',
    description: 'Eksplorasi pembelahan mitosis dan meiosis menggunakan modul simulasi interaktif digital.',
    author: 'Rian Pratama, S.Si.',
    status: 'COMPLETED',
    isImportant: false,
    createdAt: '2026-08-01'
  }
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Jadwal Resmi Pelaksanaan Tryout Akbar CBT SNBT & Kedinasan 2026',
    content: `Diberitahukan kepada seluruh siswa kelas XII dan pejuang PTN/Kedinasan 2026, bahwa Tryout Akbar CBT Nasional Gelombang I resmi dimulai hari ini.

Ketentuan Pelaksanaan Ujian:
1. Pastikan perangkat (laptop/tablet/smartphone) telah terhubung ke jaringan internet stabil.
2. Token ujian akan dibuka secara otomatis pada sistem CBT pada pukul 08:00 WIB.
3. Siswa wajib menyelesaikan seluruh subtes sesuai durasi waktu timer yang telah ditentukan.
4. Laporan perangkingan dan skor IRT (Item Response Theory) dapat dilihat pada menu Riwayat & Analisis Nilai.

Selamat berjuang dan raih skor impianmu!`,
    date: todayStr,
    category: 'UJIAN',
    priority: 'HIGH',
    targetRole: 'ALL',
    targetClass: 'SEMUA',
    authorName: 'Waka Kurikulum & Tim CBT',
    authorRole: 'Admin Akademik',
    pinned: true,
    showOnRoadmap: true,
    roadmapUntilDate: getOffsetDateStr(14),
    attachmentName: 'Panduan_Tata_Tertib_CBT_2026.pdf',
    attachmentUrl: 'https://brainspace.id/docs/tata-tertib-cbt.pdf',
    viewsCount: 428,
    createdAt: '2026-08-08'
  },
  {
    id: 'ann-2',
    title: 'Update Silabus Kurikulum Merdeka & Bank Soal HOTS Semester Ini',
    content: `Tim pengajar telah menyinkronkan seluruh Silabus, RPP, dan Bahan Ajar Digital untuk Mata Pelajaran Matematika TPS, Fisika, Kimia, Biologi, Bahasa Indonesia, dan Bahasa Inggris.

Bagi Bapak/Ibu Guru dan Siswa, modul dapat langsung diakses dan diunduh melalui tab "Materi Pembelajaran" atau terintegrasi langsung dalam "Silabus & RPP".`,
    date: getOffsetDateStr(-1),
    category: 'AKADEMIK',
    priority: 'MEDIUM',
    targetRole: 'ALL',
    targetClass: 'SEMUA',
    authorName: 'Dr. Hendra Wijaya, M.Pd.',
    authorRole: 'Koordinator Kurikulum',
    pinned: true,
    showOnRoadmap: true,
    roadmapUntilDate: getOffsetDateStr(10),
    attachmentName: 'Silabus_Lengkap_Semester_Genap.pdf',
    viewsCount: 295,
    createdAt: '2026-08-07'
  },
  {
    id: 'ann-3',
    title: 'Pembukaan Pendaftaran Kelas Bimbingan Khusus Kedokteran & STAN 2026',
    content: `Telah dibuka pendaftaran program intensif bimbingan spesialis Fakultas Kedokteran PTN Favorit dan Sekolah Kedinasan (STAN, STIS, IPDN, Poltekim).

Fasilitas Program:
- Pendampingan 1-on-1 bersama Master Teacher berpengalaman.
- 50+ Paket Tryout Prediktif dengan sistem CAT standar BKN.
- Pembahasan video interaktif dan analisis kelemahan materi siswa.
- Konsultasi pemilihan jurusan & strategi passing grade.

Informasi lengkap dapat diakses pada menu Program Unggulan atau menghubungi Hotline Customer Care.`,
    date: getOffsetDateStr(-2),
    category: 'INFO_UMUM',
    priority: 'MEDIUM',
    targetRole: 'STUDENT',
    targetClass: 'SEMUA',
    authorName: 'Biro Penerimaan Siswa Baru',
    authorRole: 'Manajemen Akademi',
    pinned: false,
    showOnRoadmap: true,
    roadmapUntilDate: getOffsetDateStr(21),
    viewsCount: 512,
    createdAt: '2026-08-06'
  },
  {
    id: 'ann-4',
    title: 'Petunjuk Pengisian Lembar Jawab Komputer (LJK) Digital CBT',
    content: `Untuk kenyamanan pengerjaan ujian berbasis PDF dan CBT interaktif, siswa dianjurkan memperhatikan navigasi nomor soal:
- Tombol Ragu-ragu (Warna Kuning) untuk menandai nomor yang ingin diperiksa ulang.
- Tombol Simpan & Submit Ujian hanya ditekan apabila seluruh soal telah terjawab.
- Nilai dan pembahasan detail nomor per nomor akan otomatis muncul setelah waktu berakhir.`,
    date: getOffsetDateStr(-3),
    category: 'UJIAN',
    priority: 'LOW',
    targetRole: 'STUDENT',
    targetClass: 'SEMUA',
    authorName: 'Tim Helpdesk CBT',
    authorRole: 'Admin Sistem',
    pinned: false,
    showOnRoadmap: false,
    roadmapUntilDate: getOffsetDateStr(3),
    viewsCount: 184,
    createdAt: '2026-08-05'
  },
  {
    id: 'ann-5',
    title: 'Edaran Sosialisasi Kalender Akademik & Agenda Penilaian Tengah Semester',
    content: `Yth. Bapak/Ibu Guru Pengampu dan Siswa/i Akademi,

Diberitahukan bahwa Penilaian Tengah Semester (PTS) Genap akan dilaksanakan mulai tanggal 15 September 2026. Mohon Bapak/Ibu Guru mempersiapkan paket soal CBT dan siswa dapat mempelajari modul ajar yang telah dibagikan.`,
    date: getOffsetDateStr(-5),
    category: 'PENTING',
    priority: 'HIGH',
    targetRole: 'ALL',
    targetClass: 'SEMUA',
    authorName: 'Drs. H. Mulyadi, M.M.',
    authorRole: 'Kepala Sekolah',
    pinned: false,
    showOnRoadmap: true,
    roadmapUntilDate: getOffsetDateStr(30),
    attachmentName: 'Kalender_Akademik_2025_2026.pdf',
    viewsCount: 376,
    createdAt: '2026-08-03'
  }
];

