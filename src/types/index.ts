export type UserRole = 'admin' | 'student' | 'teacher';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface User {
  id: string;
  nis: string; // NIS for student, NIP for teacher, ID for admin
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  className: string; // e.g., 'XII-UTBK', 'XI-IPA', 'X-IPA', 'SEMUA'
  subject?: string; // for teacher
  targetClasses?: string[]; // for teacher
  phone?: string;
  whatsapp?: string; // Nomor WA / WhatsApp (e.g. '081234567890')
  group?: string; // Kelompok Belajar / Binaan (e.g. 'Kelompok 1 - Alpha', 'Kelompok Einstein')
  status: AccountStatus;
  createdAt: string;
  avatar?: string;
  bio?: string;
}

export type TeacherStatus = 'ACTIVE' | 'INACTIVE';

export interface Teacher {
  id: string;
  nip: string; // NIP / NUPTK / Kode Guru
  username?: string; // Username for login (e.g. hendra)
  password?: string; // Password for login (e.g. guru123)
  name: string;
  email: string;
  phone?: string;
  subject: string; // e.g. 'Matematika & TPS', 'Fisika', 'Biologi'
  targetClasses: string[]; // e.g. ['XII-UTBK', 'XI-IPA'] or ['SEMUA']
  gender: 'L' | 'P';
  status: TeacherStatus;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  group?: string; // e.g. 'Saintek & MIPA', 'Soshum & IPS', 'TPS & Skolastik', 'Bahasa & Literasi', 'Umum & Wajib'
  description: string;
  targetClasses?: string[];
  color?: string;
}

export interface ExamCategory {
  id: string;
  name: string;
  description: string;
}

export type MaterialType = 'PDF' | 'PPT' | 'VIDEO' | 'DRIVE';

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  targetClass: string; // e.g. 'XII-UTBK' or 'SEMUA'
  subject?: string; // e.g. 'Matematika & TPS Kuantitatif'
  mediaType: MaterialType;
  url: string;
  createdAt: string;
  syllabusId?: string; // ID Silabus Terkait
  syllabusCode?: string; // Kode Silabus, e.g. 'SIL-MTK-XII-01'
  syllabusTitle?: string; // Judul Silabus Terkait
  syllabusTopicId?: string; // ID Pokok Bahasan / Pertemuan
  meetingNumber?: number; // Pertemuan Ke-1, 2, dst.
  topicTitle?: string; // Judul Topik Pembahasan
}

export type ExamMode = 'NATIVE_CBT' | 'EMBED_DRIVE_PDF';

export type QuestionType = 'SINGLE_CHOICE' | 'COMPLEX_CHOICE' | 'TRUE_FALSE' | 'ESSAY';

export type QuestionDifficulty = 'mudah' | 'sedang' | 'sulit' | 'hots';

export interface TrueFalseStatement {
  id: string;
  text: string;
  correctAnswer: 'TRUE' | 'FALSE';
  weight?: number; // Bobot nilai / poin per pernyataan (default 1)
}

export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
  imageUrl?: string; // Optional image URL for option choice
}

export interface Question {
  id: string;
  number: number;
  text: string;
  imageUrl?: string;
  imageWidth?: 'small' | 'medium' | 'large' | 'full'; // 'small': 200px, 'medium': 400px, 'large': 600px, 'full': 100%
  imageAlign?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  questionType: QuestionType;
  options?: QuestionOption[];
  statements?: TrueFalseStatement[]; // Multi-statement for TRUE_FALSE table questions
  correctAnswer: string | string[] | Record<string, 'TRUE' | 'FALSE'>; // Single choice: 'A', Complex: ['A','C'], True/False: 'TRUE' or Record<statementId, 'TRUE'|'FALSE'>, Essay: 'keyword text'
  weight: number; // default 1 (bobot nilai per soal)
  discussion?: string; // Pembahasan Soal
  difficulty?: QuestionDifficulty; // Level Kesulitan Soal: mudah, sedang, sulit, hots
  // Subtest linkage within an Exam Package
  subtestId?: string; // ID kelompok subtest (e.g. 'subtest-vbi', 'subtest-vbe')
  subtestName?: string; // Nama kelompok subtest (e.g. 'Verbal Bahasa Indonesia', 'Verbal Bahasa Inggris')
  // IRT (Item Response Theory) specific parameters
  irtDifficulty?: number; // Parameter b: Tingkat Kesulitan (-3.0 s.d +3.0)
  irtDiscrimination?: number; // Parameter a: Daya Pembeda (0.5 s.d 2.5)
  irtGuessing?: number; // Parameter c: Tebakan Semu (0.0 s.d 0.25)
}

export interface ExamSubtest {
  id: string;
  name: string; // e.g. "Verbal Bahasa Indonesia", "Verbal Bahasa Inggris", "Penalaran Matematika"
  code?: string; // e.g. "VBI", "VBE", "PM"
  description?: string;
  durationMinutes?: number; // Alokasi durasi khusus subtest (opsional)
  passingScore?: number; // KKM kelulusan subtest
  questionCount?: number;
  order?: number;
}

export type ExamMainType = 'TRYOUT' | 'QUIZ' | 'ULANGAN';

export type TryoutSubType =
  | 'TO-SNBT'
  | 'TO-SMP LABSCHOOL'
  | 'TO-SMA LABSCHOOL'
  | 'TO-TKA SD'
  | 'TO-TKA SMP'
  | 'TO-TKA SMA';

export interface TryoutSubTypeOption {
  id: TryoutSubType;
  label: string;
  code: string;
  description: string;
  targetGroup: string;
  targetClass: string;
  allowedClasses: string[];
}

export const TRYOUT_SUB_TYPES: TryoutSubTypeOption[] = [
  {
    id: 'TO-SNBT',
    label: 'TO-SNBT',
    code: 'SNBT',
    description: 'Tryout Simulasi UTBK-SNBT Masuk PTN',
    targetGroup: 'Siswa Kelas XII-UTBK',
    targetClass: 'XII-UTBK',
    allowedClasses: ['XII-UTBK', 'XII UTBK', 'UTBK']
  },
  {
    id: 'TO-SMP LABSCHOOL',
    label: 'TO-SMP LABSCHOOL',
    code: 'SMP-LAB',
    description: 'Tryout Seleksi PSB Masuk SMP Labschool',
    targetGroup: 'Kelas SMP-LABSCHOOL',
    targetClass: 'SMP-LABSCHOOL',
    allowedClasses: ['SMP-LABSCHOOL', 'SMP LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'TO-SMA LABSCHOOL',
    label: 'TO-SMA LABSCHOOL',
    code: 'SMA-LAB',
    description: 'Tryout Seleksi PSB Masuk SMA Labschool',
    targetGroup: 'Kelas SMA-LABSCHOOL',
    targetClass: 'SMA-LABSCHOOL',
    allowedClasses: ['SMA-LABSCHOOL', 'SMA LABSCHOOL', 'Masuk Labschool']
  },
  {
    id: 'TO-TKA SD',
    label: 'TO-TKA SD',
    code: 'TKA-SD',
    description: 'Tryout Tes Kemampuan Akademik SD Kelas VI',
    targetGroup: 'Jenjang Kelas VI-SD (Kelas VI)',
    targetClass: 'VI-SD',
    allowedClasses: ['VI-SD', 'VI SD', 'KELAS VI', 'KELAS 6 SD', 'SD-6', '6-SD', 'SD']
  },
  {
    id: 'TO-TKA SMP',
    label: 'TO-TKA SMP',
    code: 'TKA-SMP',
    description: 'Tryout Tes Kemampuan Akademik SMP Kelas IX',
    targetGroup: 'Kelas IX-SMP',
    targetClass: 'IX-SMP',
    allowedClasses: ['IX-SMP', 'IX SMP', 'KELAS IX', 'KELAS 9 SMP', 'SMP-9', '9-SMP', 'SMP']
  },
  {
    id: 'TO-TKA SMA',
    label: 'TO-TKA SMA',
    code: 'TKA-SMA',
    description: 'Tryout Tes Kemampuan Akademik SMA Kelas XII',
    targetGroup: 'Kelas XII-SMA',
    targetClass: 'XII-SMA',
    allowedClasses: ['XII-SMA', 'XII SMA', 'KELAS XII', 'KELAS 12 SMA', 'SMA-12', '12-SMA', 'SMA']
  }
];

/**
 * Checks if a Tryout Sub-Type is visible/allowed for a specific student class name
 * Target Mapping:
 * - TO-SNBT -> XII-UTBK
 * - TO-SMP LABSCHOOL -> SMP-LABSCHOOL
 * - TO-SMA LABSCHOOL -> SMA-LABSCHOOL
 * - TO-TKA SD -> VI-SD (Jenjang SD Kelas VI)
 * - TO-TKA SMP -> IX-SMP (Kelas IX-SMP)
 * - TO-TKA SMA -> XII-SMA (Kelas XII-SMA)
 */
export function isTryoutSubTypeAllowedForClass(subTypeId: TryoutSubType, studentClassName?: string): boolean {
  if (!studentClassName || studentClassName.toUpperCase() === 'SEMUA' || studentClassName.toUpperCase() === 'ALL') {
    return true;
  }
  const normClass = studentClassName.trim().toUpperCase();
  const subOption = TRYOUT_SUB_TYPES.find(s => s.id === subTypeId);
  if (!subOption) return false;

  // Exact match with targetClass
  if (subOption.targetClass.toUpperCase() === normClass) return true;

  // Match in allowedClasses
  return subOption.allowedClasses.some(c => c.toUpperCase() === normClass);
}

/**
 * Returns available Tryout Sub-Types for a student based on their class name.
 * If user class matches one of the defined targets, strictly returns matching sub-types.
 */
export function getAvailableTryoutSubTypes(studentClassName?: string): TryoutSubTypeOption[] {
  if (!studentClassName || studentClassName.toUpperCase() === 'SEMUA' || studentClassName.toUpperCase() === 'ALL') {
    return TRYOUT_SUB_TYPES;
  }
  const filtered = TRYOUT_SUB_TYPES.filter(sub => isTryoutSubTypeAllowedForClass(sub.id, studentClassName));
  return filtered.length > 0 ? filtered : TRYOUT_SUB_TYPES;
}

/**
 * Get target class for a Tryout sub type
 */
export function getTargetClassForTryoutSubType(subTypeId: TryoutSubType): string {
  const opt = TRYOUT_SUB_TYPES.find(s => s.id === subTypeId);
  return opt ? opt.targetClass : 'XII-UTBK';
}

export function resolveExamType(exam: Partial<Exam>): {
  mainType: ExamMainType;
  tryoutSubType?: TryoutSubType;
  mainLabel: string;
  badgeLabel: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  // If explicitly declared
  let mainType: ExamMainType = exam.examType || 'TRYOUT';
  let tryoutSubType: TryoutSubType | undefined = exam.tryoutSubType;

  // Fallback detection from title or category if not set
  if (!exam.examType) {
    const titleLower = (exam.title || '').toLowerCase();
    const catLower = (exam.category || '').toLowerCase();

    if (titleLower.includes('quiz') || titleLower.includes('kuis') || catLower.includes('quiz') || catLower.includes('kuis')) {
      mainType = 'QUIZ';
    } else if (
      titleLower.includes('ulangan') ||
      titleLower.includes('pas') ||
      titleLower.includes('pts') ||
      titleLower.includes('penilaian') ||
      titleLower.includes('ujian sekolah') ||
      catLower.includes('ujian sekolah')
    ) {
      mainType = 'ULANGAN';
    } else {
      mainType = 'TRYOUT';
    }
  }

  // Resolve Tryout SubType if mainType is TRYOUT
  if (mainType === 'TRYOUT' && !tryoutSubType) {
    const titleLower = (exam.title || '').toLowerCase();
    const catLower = (exam.category || '').toLowerCase();
    const classUpper = (exam.targetClass || '').toUpperCase();

    if (
      classUpper === 'SMP-LABSCHOOL' ||
      titleLower.includes('smp labschool') ||
      titleLower.includes('to-smp lab')
    ) {
      tryoutSubType = 'TO-SMP LABSCHOOL';
    } else if (
      classUpper === 'SMA-LABSCHOOL' ||
      titleLower.includes('sma labschool') ||
      titleLower.includes('to-sma lab')
    ) {
      tryoutSubType = 'TO-SMA LABSCHOOL';
    } else if (
      classUpper === 'VI-SD' ||
      classUpper.includes('SD') ||
      titleLower.includes('tka sd') ||
      titleLower.includes('to-tka sd')
    ) {
      tryoutSubType = 'TO-TKA SD';
    } else if (
      classUpper === 'IX-SMP' ||
      titleLower.includes('tka smp') ||
      titleLower.includes('to-tka smp')
    ) {
      tryoutSubType = 'TO-TKA SMP';
    } else if (
      classUpper === 'XII-SMA' ||
      titleLower.includes('tka sma') ||
      titleLower.includes('tka saintek') ||
      titleLower.includes('tka soshum') ||
      titleLower.includes('to-tka sma')
    ) {
      tryoutSubType = 'TO-TKA SMA';
    } else if (
      classUpper === 'XII-UTBK' ||
      titleLower.includes('snbt') ||
      titleLower.includes('utbk') ||
      catLower.includes('snbt')
    ) {
      tryoutSubType = 'TO-SNBT';
    } else {
      tryoutSubType = 'TO-SNBT';
    }
  }

  if (mainType === 'QUIZ') {
    return {
      mainType: 'QUIZ',
      mainLabel: 'Quiz / Kuis',
      badgeLabel: 'Quiz',
      colorClass: 'text-amber-300',
      bgClass: 'bg-amber-950/80',
      borderClass: 'border-amber-800/80'
    };
  }

  if (mainType === 'ULANGAN') {
    return {
      mainType: 'ULANGAN',
      mainLabel: 'Ulangan / Penilaian',
      badgeLabel: 'Ulangan',
      colorClass: 'text-emerald-300',
      bgClass: 'bg-emerald-950/80',
      borderClass: 'border-emerald-800/80'
    };
  }

  // TRYOUT
  const subLabel = tryoutSubType || 'TO-SNBT';
  return {
    mainType: 'TRYOUT',
    tryoutSubType: subLabel,
    mainLabel: `Tryout (${subLabel})`,
    badgeLabel: subLabel,
    colorClass: 'text-cyan-300',
    bgClass: 'bg-cyan-950/80',
    borderClass: 'border-cyan-800/80'
  };
}

export interface Exam {
  id: string;
  title: string;
  category: string;
  targetClass: string;
  examType?: ExamMainType; // 'TRYOUT' | 'QUIZ' | 'ULANGAN'
  tryoutSubType?: TryoutSubType; // 'TO-SNBT' | 'TO-SMP LABSCHOOL' | 'TO-SMA LABSCHOOL' | 'TO-TKA SD' | 'TO-TKA SMP' | 'TO-TKA SMA'
  durationMinutes: number;
  mode: ExamMode;
  pdfDriveUrl?: string; // Link Embed PDF Google Drive
  token: string;
  isTokenPublic: boolean;
  shuffleQuestions: boolean;
  passingScore: number; // e.g. 70
  allowRetake?: boolean; // Pengerjaan berulang
  maxAttempts?: number; // Maksimal pengerjaan (default 1)
  showDiscussion?: boolean; // Izinkan siswa melihat pembahasan & analisis per nomor soal setelah ujian
  isCatEnabled?: boolean; // Computer Adaptive Test (CAT) system toggle for CBT
  catQuestionCount?: number; // Jumlah soal CAT yang akan ditampilkan ke siswa
  // IRT (Item Response Theory) Scoring Feature
  isIRTEnabled?: boolean; // Penilaian IRT (Item Response Theory) aktif jika diceklist
  scoringMethod?: 'CLASSICAL' | 'IRT'; // Metode penilaian: Klasikal atau IRT 2PL/3PL Skala 200-1000
  // Multi-subtest / Kelompok Soal dalam 1 paket ujian
  subtests?: ExamSubtest[]; // Daftar kelompok subtest (misal: Verbal B. Indonesia, Verbal B. Inggris)
  deadline: string;
  questions: Question[];
  totalQuestions: number;
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[] | Record<string, 'TRUE' | 'FALSE'>; // 'A', ['A','C'], 'TRUE' or Record<statementId, 'TRUE'|'FALSE'> or essay text
  isDoubtful?: boolean; // Ragu-ragu
}

export interface SubtestResult {
  subtestId: string;
  subtestName: string;
  subtestCode?: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  rawScore: number;
  maxRawScore?: number;
  percentage: number;
  score?: number; // Skor nilai subtest (klasikal persentase atau IRT 200-1000)
  irtScore?: number; // Skor IRT skala 200 - 1000 untuk subtest ini
  irtTheta?: number; // Estimasi kemampuan theta (-3.0 s.d +3.0)
  isPassed?: boolean;
  questionIds?: string[];
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  examCategory: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, StudentAnswer>;
  manualScores?: Record<string, number>; // Mapping questionId -> skor manual yang diinputkan/dikoreksi admin
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number; // Nilai persentase / skor klasikal (0-100) atau Skor IRT (200-1000)
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  // IRT (Item Response Theory) fields
  isIRTEnabled?: boolean;
  isIRTScore?: boolean; // Alias indicator for IRT evaluation
  irtScore?: number; // Skor IRT Komposit Skala 200 - 1000
  irtStandardScore?: number; // Skor Terstandar 200-1000
  irtTheta?: number; // Theta komposit (-3.0 s.d +3.0)
  irtPercentile?: number; // Estimasi persentil kemampuan
  // Subtest separated results
  subtestResults?: SubtestResult[];
  submittedAt: string;
  durationSpentSeconds: number;
  teacherFeedback?: string; // Catatan & feedback guru
  gradedBy?: string; // Nama guru penilai
  assessmentType?: string; // 'Tugas Harian', 'Ulangan Harian', 'Kuis', 'PTS', 'PAS', 'Ujian CBT', 'Praktik', 'Remedial'
  passingScore?: number; // KKM penilaian (default 75)
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface MarketplaceCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  externalLink: string; // Link Shopee/Tokopedia/WhatsApp
  status: ProductStatus;
  createdAt: string;
}

export interface FeaturedProgram {
  id: string;
  title: string;          // e.g. "Lolos PTN Impian"
  category: string;       // e.g. "Persiapan UTBK SNBT 2026"
  thumbnail: string;      // Image URL
  shortDesc: string;      // Brief summary for card thumbnail
  articleContent: string; // Detailed article / syllabus for "Lihat Selengkapnya"
  registerUrl: string;    // WhatsApp or Google Form link
  badge?: string;         // e.g. "TERFAVORIT", "INTENSIF", "EXCLUSIVE"
  isPublished: boolean;
  createdAt: string;
}

export interface InstitutionInfo {
  name: string;
  subtitle: string;
  motto?: string; // Slogan / Motto lembaga
  address?: string; // Alamat lengkap kantor/kampus
  phone?: string; // No telepon / Hotline kantor
  whatsapp?: string; // No HP / WhatsApp resmi lembaga
  email?: string; // Email resmi lembaga
  website?: string; // Website resmi lembaga
  city?: string; // Kota tempat lembaga / penerbitan dokumen resmi (e.g. Jakarta Selatan)
  principalName?: string; // Nama Kepala / Direktur Lembaga
  principalNip?: string; // NIP / Kode Jabatan Pimpinan
  signatureUrl?: string; // URL Gambar Tanda Tangan
  stampUrl?: string; // URL Gambar Stempel Lembaga
  logoUrl: string;
  logoFullArea?: boolean; // Apakah logo memenuhi 100% area space container (tanpa padding kosong)
  logoFit?: 'contain' | 'cover' | 'fill'; // Mode penyesuaian gambar (contain, cover, fill)
  logoShape?: 'rounded' | 'square' | 'circle' | 'banner'; // Bentuk sudut logo (rounded, square, circle, banner)
  logoSize?: 'normal' | 'large' | 'extralarge' | 'banner'; // Ukuran area space logo
  logoBgColor?: string; // Warna latar belakang wadah logo ('transparent' | 'dark' | 'white' | 'gradient' | string)
  logoBorder?: boolean; // Tampilkan garis tepi / border wadah logo
  logoPadding?: 'none' | 'small' | 'medium'; // Padding logo dalam wadah
}

export interface KopSuratSettings {
  enabled: boolean; // Aktifkan Kop Surat Resmi pada Cetak Dokumen
  institutionHeader: string; // e.g. "YAYASAN PENDIDIKAN BRAIN SPACE UTAMA"
  institutionName: string; // e.g. "BRAIN SPACE ACADEMY & UTBK CENTER"
  subHeader: string; // e.g. "PUSAT BIMBINGAN BELAJAR, CBT & EVALUASI STANDAR NASIONAL"
  addressLine1: string; // e.g. "Jl. Pendidikan Nasional No. 88, Kebayoran Baru, Jakarta Selatan 12160"
  addressLine2: string; // e.g. "Telp: (021) 7890-1234 • WA: 0812-3456-7890 • Email: info@brainspace.academy"
  website: string; // e.g. "Website: https://brainspace.academy"
  borderStyle: 'double' | 'solid' | 'gradient' | 'minimal'; // Gaya Garis Kop (Garis Ganda Tebal-Tipis, Solid, Gradasi, Minimal)
  showLogoLeft: boolean; // Tampilkan Logo Lembaga di Kiri
  showLogoRight: boolean; // Tampilkan Logo Tambahan di Kanan
  logoRightUrl?: string; // URL Logo Kanan (opsional)
  showSignatureSection: boolean; // Tampilkan Kolom Tanda Tangan di Bagian Bawah
  cityLocation: string; // Kota Terbit (e.g. "Jakarta Selatan")
  signerTitle: string; // Jabatan Penandatangan (e.g. "Kepala Lembaga / Penanggung Jawab Akademik")
  signerName: string; // Nama Penandatangan (e.g. "Dr. H. Hendra Wijaya, M.Pd.")
  signerNip: string; // NIP Penandatangan (e.g. "NIP. 19850714 201001 1 008")
  documentFooterNote: string; // Catatan Kaki Dokumen Cetak
}

export interface PageLabelItem {
  title: string;
  description: string;
}

export interface CustomPageLabels {
  overview: PageLabelItem;
  validation: PageLabelItem;
  students: PageLabelItem;
  teachers: PageLabelItem;
  admins: PageLabelItem;
  academic: PageLabelItem;
  classes: PageLabelItem;
  syllabus: PageLabelItem;
  materials: PageLabelItem;
  exams: PageLabelItem;
  marketplace: PageLabelItem;
  programs: PageLabelItem;
  reports: PageLabelItem;
  tryout_reports: PageLabelItem;
  history: PageLabelItem;
  labschool_overview: PageLabelItem;
  labschool_silabus: PageLabelItem;
  labschool_kampus: PageLabelItem;
  labschool_roadmap: PageLabelItem;
  labschool_psb_smp: PageLabelItem;
  labschool_psb_sma: PageLabelItem;
  labschool_laporan: PageLabelItem;
  snbt_dashboard: PageLabelItem;
  snbt_syllabus: PageLabelItem;
  snbt_students: PageLabelItem;
  snbt_campus: PageLabelItem;
  snbt_roadmap: PageLabelItem;
  snbt_countdown: PageLabelItem;
  snbt_reports: PageLabelItem;
  teacher_overview: PageLabelItem;
  student_overview: PageLabelItem;
  settings: PageLabelItem;
}

export interface CustomNavLabels {
  overview: string;
  user_management: string;
  validation: string;
  students: string;
  teachers: string;
  admins: string;
  academic_group: string;
  academic: string;
  classes: string;
  syllabus: string;
  materials: string;
  exams: string;
  marketplace: string;
  programs: string;
  reports: string;
  tryout_reports: string;
  history: string;
  labschool_group: string;
  labschool_overview: string;
  labschool_silabus: string;
  labschool_kampus: string;
  labschool_roadmap: string;
  labschool_psb_smp: string;
  labschool_psb_sma: string;
  labschool_laporan: string;
  snbt_group: string;
  snbt_dashboard: string;
  snbt_syllabus: string;
  snbt_students: string;
  snbt_campus: string;
  snbt_roadmap: string;
  snbt_reports: string;
  settings: string;
}

export interface CustomButtonLabels {
  btnSave: string; // "Simpan Perubahan"
  btnAdd: string; // "Tambah Data"
  btnCancel: string; // "Batal"
  btnDelete: string; // "Hapus"
  btnEdit: string; // "Edit Data"
  btnPrint: string; // "Cetak / Simpan PDF"
  btnExport: string; // "Ekspor Data"
  btnFilter: string; // "Filter Data"
  btnReset: string; // "Reset Filter"
  btnStartExam: string; // "Mulai Kerjakan Ujian"
  btnSubmitExam: string; // "Selesaikan Ujian"
  btnDoubtful: string; // "Ragu-Ragu"
  btnPrevQuestion: string; // "Soal Sebelumnya"
  btnNextQuestion: string; // "Soal Selanjutnya"
  btnDownloadMaterial: string; // "Download Modul"
  btnApproveUser: string; // "Setujui Akun"
  btnRejectUser: string; // "Tolak Pendaftaran"
  btnSearch: string; // "Cari Data..."
}

export interface AppSettings {
  institution: InstitutionInfo;
  kopSurat: KopSuratSettings;
  pageLabels: CustomPageLabels;
  navLabels: CustomNavLabels;
  buttonLabels: CustomButtonLabels;
  updatedAt?: string;
}

export type SyllabusStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface SyllabusTopic {
  id: string;
  meetingNumber: number; // Pertemuan Ke-1, 2, dst.
  title: string; // Judul Bab / Pokok Bahasan
  subtopics: string[]; // Rincian Sub-Bab / Materi
  competency: string; // Capaian Pembelajaran / Kompetensi Dasar
  durationMinutes?: number; // Durasi dalam menit (misal 90 menit)
  teachingMethod?: string; // Metode Ajar (misal: "Problem Based Learning & Bedah Soal HOTS")
  referenceNotes?: string; // Catatan guru / referensi buku
  linkedMaterialId?: string; // ID materi modul terkait
  linkedMaterialTitle?: string; // Judul materi modul terkait
  linkedExamId?: string; // ID paket soal / CBT evaluasi terkait
  linkedExamTitle?: string; // Judul latihan soal / CBT evaluasi terkait
  driveLink?: string; // Link Google Drive untuk materi, modul, soal, PPT, atau bahan tayang
  driveLinkTitle?: string; // Keterangan atau label khusus link Google Drive
}

export interface SyllabusItem {
  id: string;
  code: string; // e.g. "SIL-MTK-XII-01"
  title: string; // e.g. "Silabus Intensif Penalaran Matematika & TPS SNBT"
  subject: string; // e.g. "Matematika & TPS Kuantitatif"
  targetClass: string; // e.g. "XII-UTBK" or "XI-IPA" or "SEMUA"
  academicYear: string; // e.g. "2025/2026 Semester Ganjil & Genap"
  teacherInCharge?: string; // Nama guru PIC pengampu
  description: string; // Deskripsi dan tujuan umum silabus
  totalMeetings: number; // Total alokasi pertemuan
  status: SyllabusStatus;
  topics: SyllabusTopic[];
  pdfUrl?: string; // Dokumen lampiran PDF resmi jika ada
  snbtSubtestCode?: string; // e.g. 'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'
  snbtCategory?: string; // e.g. 'TPS', 'Literasi', 'Penalaran Matematika'
  createdAt: string;
  updatedAt?: string;
}

export type AgendaType = 'EXAM' | 'CLASS' | 'TASK' | 'MEETING' | 'EVENT' | 'HOLIDAY';
export type AgendaStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface AgendaItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (e.g. "2026-08-08")
  time: string; // e.g. "08:00 - 09:30"
  type: AgendaType;
  targetClass: string; // e.g. "XII-UTBK", "XI-IPA", "SEMUA"
  subject?: string;
  location?: string; // e.g. "Ruang CBT 1", "Kelas XII", "Online Zoom"
  description?: string;
  author?: string;
  status: AgendaStatus;
  isImportant?: boolean;
  linkedExamId?: string;
  linkedMaterialId?: string;
  linkedSyllabusId?: string;
  createdAt?: string;
}

export type AnnouncementCategory = 'AKADEMIK' | 'UJIAN' | 'PENTING' | 'KEGIATAN' | 'INFO_UMUM';
export type AnnouncementPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  targetRole: 'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN';
  targetClass?: string; // e.g. 'SEMUA' or 'XII-UTBK'
  authorName: string;
  authorRole: string; // e.g. 'Kepala Sekolah', 'Admin Akademik', 'Waka Kurikulum', 'Guru Pengampu'
  pinned: boolean;
  showOnRoadmap?: boolean; // Konfigurasi apakah tampil di Roadmap horizontal
  roadmapUntilDate?: string; // Batas akhir tanggal tampil di roadmap (YYYY-MM-DD)
  attachmentUrl?: string;
  attachmentName?: string;
  viewsCount?: number;
  createdAt: string;
}

export type SidebarTab =
  | 'overview'
  | 'validation'
  | 'students'
  | 'teachers'
  | 'admins'
  | 'academic'
  | 'classes'
  | 'syllabus'
  | 'materials'
  | 'exams'
  | 'marketplace'
  | 'programs'
  | 'reports'
  | 'tryout_reports'
  | 'history'
  | 'labschool_overview'
  | 'labschool_dashboard'
  | 'labschool_silabus'
  | 'labschool_kampus'
  | 'labschool_roadmap'
  | 'labschool_psb_smp'
  | 'labschool_smp'
  | 'labschool_psb_sma'
  | 'labschool_sma'
  | 'labschool_laporan'
  | 'snbt_dashboard'
  | 'snbt_students'
  | 'snbt_campus'
  | 'snbt_kampus'
  | 'snbt_roadmap'
  | 'snbt_countdown'
  | 'snbt_reports'
  | 'snbt_laporan'
  | 'snbt_syllabus'
  | 'snbt_silabus'
  | 'settings';


