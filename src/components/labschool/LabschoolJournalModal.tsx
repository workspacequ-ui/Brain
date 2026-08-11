import React, { useState, useEffect, useMemo } from 'react';
import { LearningJournalMeeting, saveStoredJournals, loadStoredJournals } from './labschoolLaporanData';
import { SyllabusItem, SyllabusTopic, User } from '../../types';
import { getStoredItem, KEYS, getUsers } from '../../utils/storage';
import { INITIAL_SYLLABI, INITIAL_USERS } from '../../data/mockData';
import { getUserLabschoolLevel, isStudentLevelLocked } from '../../utils/labschoolHelpers';
import {
  X,
  Save,
  Calendar,
  Clock,
  BookOpen,
  User as UserIcon,
  Users,
  UserCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Check,
  ChevronRight,
  Layers,
  GraduationCap,
  ListPlus,
  Filter,
  Search,
  Link2,
  CheckCheck,
  Building2,
  Tag,
  FolderOpen,
  ExternalLink,
  Edit2,
  RotateCcw,
  Copy,
  Trash2,
  IdCard,
  School,
  CheckSquare,
  Square
} from 'lucide-react';

interface LabschoolJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (meeting: LearningJournalMeeting) => void;
  initialData?: LearningJournalMeeting | null;
  defaultMeetingNumber?: number;
  user?: any;
  defaultSubject?: string;
  defaultSyllabusCode?: string;
  defaultTargetClass?: string;
  defaultLevel?: 'SMP' | 'SMA';
  defaultTopicTitle?: string;
  defaultSubtopics?: string[] | string;
  defaultCompetency?: string;
  defaultTeachingMethod?: string;
  defaultSyllabusTopicId?: string;
  defaultSyllabusId?: string;
  defaultDriveLink?: string;
  defaultDriveLinkTitle?: string;
  defaultInstructorName?: string;
}

export interface SyllabusTemplateItem {
  id: string;
  code: string;
  meetingNumber: number;
  subtestCode: string;
  subjectName: string;
  topicTitle: string;
  subtopics: string[];
  competency: string;
  teachingMethod: string;
  instructorName: string;
  driveLink?: string;
  driveLinkTitle?: string;
}

export const LABSCHOOL_SYLLABUS_TEMPLATES: Record<'SMA' | 'SMP', SyllabusTemplateItem[]> = {
  SMA: [
    // Pengetahuan Kuantitatif (PK)
    {
      id: 'top-sma-1',
      code: 'SIL-PK-SMA-LAB',
      meetingNumber: 1,
      subtestCode: 'PK',
      subjectName: 'Pengetahuan Kuantitatif (PK)',
      topicTitle: 'Strategi Bedah Soal Pola Bilangan, Barisan Deret & Aljabar Seleksi Labschool',
      subtopics: [
        'Pola Bilangan Bertingkat Dua & Fibonacci Khusus',
        'Manipulasi Aljabar Pecahan & Nilai Mutlak',
        'Trik Cepat 30 Detik Soal Persentase & Diskon Ganda'
      ],
      competency: 'Siswa mampu menyelesaikan persoalan aritmetika, pola bilangan bertingkat, dan manipulasi aljabar pecahan dalam batas waktu < 45 detik per soal.',
      teachingMethod: 'Problem-Based Learning & Speed Drills',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PK-SMA-2026',
      driveLinkTitle: 'Modul Pengetahuan Kuantitatif & Pembahasan Soal HOTS Labschool'
    },
    {
      id: 'top-sma-pk-2',
      code: 'SIL-PK-SMA-LAB',
      meetingNumber: 2,
      subtestCode: 'PK',
      subjectName: 'Pengetahuan Kuantitatif (PK)',
      topicTitle: 'Sistem Persamaan Linier & Kuadrat Terapan Soal Cerita Labschool',
      subtopics: [
        'Sistem Persamaan Linier Dua & Tiga Variabel (SPLDV/SPLTV)',
        'Akar-Akar Persamaan Kuadrat & Titik Puncak Parabola',
        'Model Matematika Masalah Usia, Pekerjaan Bersama & Kecepatan-Waktu-Jarak'
      ],
      competency: 'Menguasai pemodelan matematika aljabar dan trik subtitusi cepat untuk soal cerita HOTS.',
      teachingMethod: 'Pemodelan Soal Cerita & Drill Cepat',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PK-SPLDV-SMA-2026',
      driveLinkTitle: 'Modul Aljabar Terapan & Sistem Persamaan Linier Labschool'
    },
    {
      id: 'top-sma-pk-3',
      code: 'SIL-PK-SMA-LAB',
      meetingNumber: 3,
      subtestCode: 'PK',
      subjectName: 'Pengetahuan Kuantitatif (PK)',
      topicTitle: 'Kombinatorika, Peluang Bersyarat & Statistika Data Terpadu',
      subtopics: [
        'Prinsip perkalian, permutasi siklis, dan kombinasi pemilihan dengan batasan syarat',
        'Peluang kejadian majemuk saling lepas/bebas dan frekuensi harapan pada eksperimen bertingkat',
        'Statistika data kelompok: rata-rata gabungan, median tabel distribusi, dan simpangan kuartil'
      ],
      competency: 'Memecahkan persoalan probabilitas kejadian bersyarat dan menarik kesimpulan statistik dari data tabular maupun grafik.',
      teachingMethod: 'Problem Based Learning & Simulasi Ujian CAT Terwaktu',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PK-Peluang-Statistika',
      driveLinkTitle: 'Modul Peluang Bersyarat & Statistika Terpadu Labschool'
    },
    // Kemampuan Verbal (KV)
    {
      id: 'top-sma-2',
      code: 'SIL-KV-SMA-LAB',
      meetingNumber: 2,
      subtestCode: 'KV',
      subjectName: 'Kemampuan Verbal (KV)',
      topicTitle: 'Teknik Skimming-Scanning Teks Panjang, Silogisme Logis & Analogi Semantik',
      subtopics: [
        'Penarikan Kesimpulan Modus Ponens, Tollens & Silogisme',
        'Identifikasi Ide Pokok & Makna Tersirat Paragraf Kompleks',
        'Pemetaan Hubungan Analogi Kata Asosiatif'
      ],
      competency: 'Menganalisis paragraf argumentatif kompleks, menarik kesimpulan silogisme valid, dan memetakan analogi kata asosiatif dengan akurasi 90%+.',
      teachingMethod: 'Analisis Diagram Logika & Flashcard Kosa Kata',
      instructorName: 'Ahmad Fauzi, S.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-KV-SMA-2026',
      driveLinkTitle: 'Modul Kemampuan Verbal, Silogisme & Analogi Semantik'
    },
    {
      id: 'top-sma-kv-2',
      code: 'SIL-KV-SMA-LAB',
      meetingNumber: 8,
      subtestCode: 'KV',
      subjectName: 'Kemampuan Verbal (KV)',
      topicTitle: 'Penalaran Bahasa Inggris Akademik & Reading Comprehension Seleksi SMA',
      subtopics: [
        'Academic Reading Comprehension & Finding Main Topic',
        'Context Clues, Synonym Inference & Reference Words',
        'Author Tone, Attitude & Text Structure Analysis'
      ],
      competency: 'Memahami teks berbahasa Inggris standar seleksi Labschool dan menemukan gagasan tersirat dengan cepat.',
      teachingMethod: 'Timed Reading Drills & Keyword Scanning',
      instructorName: 'Sarah Maharani, S.Pd., M.Ed.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-English-Reading-2026',
      driveLinkTitle: 'Modul Bahasa Inggris Akademik & Reading Comprehension'
    },
    // Penalaran Matematika (PM)
    {
      id: 'top-sma-3',
      code: 'SIL-PM-SMA-LAB',
      meetingNumber: 3,
      subtestCode: 'PM',
      subjectName: 'Penalaran Matematika & Pemahaman Membaca (PM)',
      topicTitle: 'Geometri Analitik, Bangun Datar/Ruang & Peluang Kombinatorika',
      subtopics: [
        'Luas Daerah yang Diarsir & Teorema Phytagoras Lanjut',
        'Permutasi, Kombinasi & Peluang Bersyarat',
        'Statistika Data Tunggal & Rata-rata Gabungan'
      ],
      competency: 'Menguasai konsep luas bangun gabungan, peluang bersyarat, serta statistika data kontekstual standar soal HOTS Labschool.',
      teachingMethod: 'Konseptual Visual & Bedah Soal Asli PSB',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-PM-Geometri-2026',
      driveLinkTitle: 'Modul Geometri Analitik & Peluang Kombinatorika Labschool'
    },
    // Kemampuan Akademik (KA) - IPA / IPS
    {
      id: 'top-sma-4',
      code: 'SIL-AKA-IPA-SMA',
      meetingNumber: 4,
      subtestCode: 'KA',
      subjectName: 'Kemampuan Akademik IPA (AKA-IPA)',
      topicTitle: 'Fisika Terapan Mekanika, Kalor, Gelombang Bunyi & Cahaya',
      subtopics: [
        'Hukum Newton Gerak & Gesekan pada Bidang Miring',
        'Asas Black, Perpindahan Kalor & Perubahan Wujud',
        'Cepat Rambat Gelombang & Efek Doppler Sederhana'
      ],
      competency: 'Memahami hukum mekanika klasik dan hukum termodinamika terapan serta menyelesaikan hitungan cepat sains IPA.',
      teachingMethod: 'Eksperimen Interaktif & Mind Mapping Rumus',
      instructorName: 'Siti Nurhaliza, S.Si., M.Sc.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-AKA-IPA-Fisika-2026',
      driveLinkTitle: 'Modul Kemampuan Akademik IPA (Fisika Terapan & Mekanika)'
    },
    // Survei Karakter (SV)
    {
      id: 'top-sma-sv-1',
      code: 'SIL-SV-SMA',
      meetingNumber: 5,
      subtestCode: 'SV',
      subjectName: 'Survei Karakter & Profil Integritas (SV)',
      topicTitle: 'Integritas Akademik, Kepemimpinan Siswa & Penalaran Dilema Etika',
      subtopics: [
        'Studi Kasus Dilema Moral & Pengambilan Keputusan Etis',
        'Kepemimpinan Kolaboratif & Manajemen Konflik Remaja',
        'Pengamalan Nilai Profil Pelajar Labschool dalam Keseharian'
      ],
      competency: 'Mengembangkan kecerdasan emosional, integritas kejujuran akademik, dan kepemimpinan berkarakter.',
      teachingMethod: 'Studi Kasus Situasional & Diskusi Dilema Etika',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-SV-Karakter-2026',
      driveLinkTitle: 'Panduan & Soal Latihan Survei Karakter Profil Integritas'
    },
    // Skolastik & Logika (SK)
    {
      id: 'top-sma-5',
      code: 'SIL-LAB-SMA',
      meetingNumber: 6,
      subtestCode: 'SK',
      subjectName: 'Skolastik & Logika Spasial (SK)',
      topicTitle: 'Rotasi Spasial 3D, Pola Matriks Gambar & Logika Analitik Posisi',
      subtopics: [
        'Rotasi Sumbu XYZ pada Kubus Berpola',
        'Pola Matriks Gambar 3x3 Berubah Bentuk & Warna',
        'Urutan Duduk & Posisi Bersyarat (Analytical Reasoning)'
      ],
      competency: 'Memvisualisasikan transformasi rotasi ruang 3D, membaca matriks gambar kognitif, dan mengorganisasi urutan posisi logis.',
      teachingMethod: 'Software Visualisasi Spasial & Latihan Terpandu',
      instructorName: 'Sarah Maharani, S.Pd., M.Ed.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-SK-Spasial-3D-2026',
      driveLinkTitle: 'Modul Logika Spasial 3D & Pola Matriks Gambar'
    },
    // Simulasi & Evaluasi Akbar (SIM)
    {
      id: 'top-sma-6',
      code: 'SIL-LAB-SMA',
      meetingNumber: 7,
      subtestCode: 'SIM',
      subjectName: 'Simulasi & Evaluasi Akbar',
      topicTitle: 'Review Tryout Akbar & Strategi Manajemen Waktu PSB Labschool',
      subtopics: [
        'Pembahasan Komprehensif Soal Paling Sering Salah Nasional',
        'Manajemen Alokasi Waktu 30 Detik per Soal Mudah, 60 Detik Sedang',
        'Strategi Memaksimalkan Skor di Kampus Labschool Pilihan'
      ],
      competency: 'Memantapkan ketahanan mental, strategi eliminasi opsi, dan efisiensi waktu pengerjaan CBT dengan target skor di atas passing grade 87.5+.',
      teachingMethod: 'Simulasi CAT Terwaktu & Bedah Kunci Jawaban',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-Modul-SIM-Tryout-Akbar-2026',
      driveLinkTitle: 'Kumpulan Soal & Pembahasan Lengkap Tryout Akbar Labschool'
    }
  ],
  SMP: [
    // Pengetahuan Kuantitatif (PK) SMP
    {
      id: 'top-smp-1',
      code: 'SIL-SMP-PK',
      meetingNumber: 1,
      subtestCode: 'PK',
      subjectName: 'Pengetahuan Kuantitatif (PK) SMP',
      topicTitle: 'Aritmatika Sosial, Pecahan, FPB-KPK & Pola Bilangan Masuk SMP Labschool',
      subtopics: [
        'Operasi Hitung Campuran Pecahan & Desimal Kilat',
        'Penyelesaian Soal Cerita FPB dan KPK Kontekstual',
        'Trik Cepat Persentase Untung-Rugi & Diskon Bertingkat'
      ],
      competency: 'Siswa menguasai perhitungan cepat operasi pecahan campuran dan pemecahan masalah soal cerita FPB/KPK konteks sehari-hari.',
      teachingMethod: 'Trik Hitung Cepat & Latihan Soal Cerita',
      instructorName: 'Bambang Sudibyo, M.Si.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-PK-Aritmatika-2026',
      driveLinkTitle: 'Modul Aritmatika Sosial & Pola Bilangan Masuk SMP Labschool'
    },
    {
      id: 'top-smp-pk-2',
      code: 'SIL-SMP-PK',
      meetingNumber: 2,
      subtestCode: 'PK',
      subjectName: 'Pengetahuan Kuantitatif (PK) SMP',
      topicTitle: 'Perbandingan Senilai-Berbalik Nilai & Kecepatan Jarak Waktu Masuk SMP',
      subtopics: [
        'Perbandingan Bertingkat & Pembagian Warisan/Uang Saku',
        'Kecepatan Rata-rata, Waktu Berpapasan & Menyusul',
        'Skala Peta & Denah Ruang'
      ],
      competency: 'Menyelesaikan permasalahan perbandingan bertingkat dan perhitungan waktu tempuh realistis.',
      teachingMethod: 'Problem Solving Terpadu & Simulasi Soal',
      instructorName: 'Bambang Sudibyo, M.Si.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-PK-Perbandingan-2026',
      driveLinkTitle: 'Modul Perbandingan & Kecepatan-Jarak-Waktu SMP Labschool'
    },
    // Kemampuan Verbal (KV) SMP
    {
      id: 'top-smp-2',
      code: 'SIL-SMP-KV',
      meetingNumber: 3,
      subtestCode: 'KV',
      subjectName: 'Kemampuan Verbal (KV) SMP',
      topicTitle: 'Sinonim, Antonim, Padanan Kata (Analogi) & Kalimat Baku PUEBI',
      subtopics: [
        'Pemetaan Hubungan Kata Sebab-Akibat, Bagian-Keseluruhan',
        'Kosakata Baku KBBI yang Sering Muncul di PSB Labschool',
        'Perbaikan Kalimat Rancu & Tanda Baca Efektif'
      ],
      competency: 'Memperluas perbendaharaan kata baku dan menentukan hubungan analogi kata bahasa Indonesia dengan tepat.',
      teachingMethod: 'Kuis Flashcard Kosakata & Game Analogi',
      instructorName: 'Dra. Endang Sulastri',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-KV-Verbal-2026',
      driveLinkTitle: 'Modul Sinonim-Antonim, Analogi & Kalimat Baku Masuk SMP'
    },
    // Penalaran Matematika / Membaca (PM) SMP
    {
      id: 'top-smp-3',
      code: 'SIL-SMP-PM',
      meetingNumber: 4,
      subtestCode: 'PM',
      subjectName: 'Pemahaman Membaca & Penalaran (PM) SMP',
      topicTitle: 'Pemahaman Bacaan Paragraf Panjang, Fakta vs Opini & Ide Pokok',
      subtopics: [
        'Gagasan Pokok Paragraf Deduktif, Induktif & Campuran',
        'Menyimpulkan Isi Tersurat dan Tersirat Cerita Fiksi/Nonfiksi',
        'Menemukan Fakta vs Opini dalam Teks Informasi'
      ],
      competency: 'Mampu menemukan ide pokok dan membedakan fakta dengan opini dalam waktu cepat.',
      teachingMethod: 'Latihan Membaca Cepat & Mind Mapping Paragraf',
      instructorName: 'Dra. Endang Sulastri',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-PM-Bacaan-2026',
      driveLinkTitle: 'Modul Pemahaman Bacaan & Penalaran Deduktif-Induktif SMP'
    },
    // Kemampuan Akademik (KA) SMP - IPA & IPS
    {
      id: 'top-smp-4',
      code: 'SIL-SMP-AKA-IPA',
      meetingNumber: 5,
      subtestCode: 'KA',
      subjectName: 'Kemampuan Akademik IPA (AKA-IPA) SMP',
      topicTitle: 'Gaya, Gerak, Kalor, Perpindahan Energi & Ekosistem Hayati',
      subtopics: [
        'Gaya Gesek, Gaya Berat & Pengaruhnya pada Gerak Benda',
        'Perubahan Wujud Zat & Konsep Kalor Asas Black Sederhana',
        'Rantai Makanan, Simbiosis & Adaptasi Makhluk Hidup'
      ],
      competency: 'Menguasai konsep dasar sains fisika dan biologi lingkungan yang diujikan dalam tes akademik SMP Labschool.',
      teachingMethod: 'Eksperimen Virtual Sains & Mind Mapping',
      instructorName: 'Arief Budiman, S.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-AKA-IPA-2026',
      driveLinkTitle: 'Modul Kemampuan Akademik Sains IPA Terpadu Masuk SMP'
    },
    {
      id: 'top-smp-5',
      code: 'SIL-SMP-AKA-IPS',
      meetingNumber: 6,
      subtestCode: 'KA',
      subjectName: 'Kemampuan Akademik IPS (AKA-IPS) SMP',
      topicTitle: 'Peta Geografi Indonesia, Kegiatan Ekonomi & Sejarah Bangsa',
      subtopics: [
        'Letak Geografis & Astronomis Indonesia serta Pengaruh Iklim',
        'Peran Produsen, Distributor, dan Konsumen dalam Perekonomian',
        'Penerapan Karakter Integritas, Gotong Royong & Sejarah Nasional'
      ],
      competency: 'Memahami letak geografi Indonesia, dinamika ekonomi sosial, dan nilai karakter integritas seleksi Labschool.',
      teachingMethod: 'Studi Kasus & Diskusi Interaktif',
      instructorName: 'Dra. Endang Sulastri',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-AKA-IPS-2026',
      driveLinkTitle: 'Modul Pengetahuan Sosial IPS & Karakter Kebangsaan SMP'
    },
    // Survei Karakter (SV) SMP
    {
      id: 'top-smp-sv',
      code: 'SIL-SMP-SV',
      meetingNumber: 7,
      subtestCode: 'SV',
      subjectName: 'Survei Karakter (SV) SMP',
      topicTitle: 'Integritas Kejujuran Akademik, Empati Sosial & Anti-Bullying',
      subtopics: [
        'Sikap jujur dalam ujian, menolak kecurangan/plagiasi',
        'Empati sosial, menghargai perbedaan, dan gotong royong',
        'Resiliensi emosi dan pembiasaan profil pelajar Labschool'
      ],
      competency: 'Menunjukkan konsistensi nilai kejujuran dan empati sosial dalam simulasi tes survei karakter.',
      teachingMethod: 'Role Play Kasus Dilema Moral & Refleksi',
      instructorName: 'Dr. Hendra Wijaya, M.Pd.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-SV-Karakter-2026',
      driveLinkTitle: 'Panduan Survei Karakter & Profil Pelajar Integritas SMP'
    },
    // Skolastik & Logika (SK) SMP
    {
      id: 'top-smp-6',
      code: 'SIL-SMP-PK',
      meetingNumber: 8,
      subtestCode: 'SK',
      subjectName: 'Skolastik & Logika Spasial (SK) SMP',
      topicTitle: 'Jaring-jaring Ruang, Serial Gambar 2D/3D & Simulasi CBT Final',
      subtopics: [
        'Rotasi Bangun Pola Gambar 2D & Serial Matriks Gambar',
        'Pencocokan Jaring-jaring Balok dan Kubus Berpola',
        'Manajemen Waktu Pengerjaan Soal CBT 45 Detik per Soal'
      ],
      competency: 'Memiliki kecepatan tinggi dalam visualisasi jaring-jaring kubus dan serial gambar logika figural.',
      teachingMethod: 'Simulasi CAT CBT & Refleksi Kesiapan Seleksi',
      instructorName: 'Bambang Sudibyo, M.Si.',
      driveLink: 'https://drive.google.com/drive/folders/1Labschool-SMP-Modul-SK-Spasial-2026',
      driveLinkTitle: 'Modul Logika Figural, Jaring Ruang & Simulasi CBT SMP'
    }
  ]
};

// Subtest Code List for Labschool Filters
export const LABSCHOOL_SUBTEST_OPTIONS = [
  { code: 'ALL', label: 'Semua Subtes / Mapel' },
  { code: 'PK', label: 'PK - Pengetahuan Kuantitatif' },
  { code: 'KV', label: 'KV - Kemampuan Verbal (B.Indo / B.Inggris)' },
  { code: 'PM', label: 'PM - Pemahaman Membaca & Penalaran' },
  { code: 'KA', label: 'KA - Kemampuan Akademik (IPA / IPS)' },
  { code: 'SK', label: 'SK - Survei Karakter' },
  { code: 'SIM', label: 'SIM - Simulasi & Evaluasi Akbar' }
];

export const LabschoolJournalModal: React.FC<LabschoolJournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultMeetingNumber = 1,
  user,
  defaultSubject,
  defaultSyllabusCode,
  defaultTargetClass,
  defaultLevel,
  defaultTopicTitle,
  defaultSubtopics,
  defaultCompetency,
  defaultTeachingMethod,
  defaultSyllabusTopicId,
  defaultSyllabusId,
  defaultDriveLink,
  defaultDriveLinkTitle,
  defaultInstructorName
}) => {
  // Load real stored syllabi from localStorage/storage utility
  const [storedSyllabi, setStoredSyllabi] = useState<SyllabusItem[]>(() => {
    return getStoredItem<SyllabusItem[]>(KEYS.SYLLABUS, INITIAL_SYLLABI);
  });

  // Refresh stored syllabi when modal opens
  useEffect(() => {
    if (isOpen) {
      setStoredSyllabi(getStoredItem<SyllabusItem[]>(KEYS.SYLLABUS, INITIAL_SYLLABI));
    }
  }, [isOpen]);

  const isStudent = user?.role === 'student';
  const studentLevel = useMemo(() => getUserLabschoolLevel(user), [user]);
  const isLockedForStudent = useMemo(() => isStudentLevelLocked(user), [user]);

  // Load all registered student accounts from storage or mock data
  const allStoredStudents = useMemo<User[]>(() => {
    let list: User[] = [];
    try {
      const storedUsers = getUsers();
      if (Array.isArray(storedUsers) && storedUsers.length > 0) {
        list = storedUsers.filter(u => u.role === 'student');
      }
    } catch (e) {
      console.warn('Failed to load users from storage, fallback to INITIAL_USERS', e);
    }
    if (list.length === 0) {
      list = INITIAL_USERS.filter(u => u.role === 'student');
    }
    if (user && user.role === 'student') {
      const alreadyIn = list.some(u => u.id === user.id);
      if (!alreadyIn) {
        list = [user, ...list];
      }
    }
    return list;
  }, [user]);

  const initialEffectiveLevel = useMemo<'SMP' | 'SMA'>(() => {
    if (initialData?.level) return initialData.level;
    if (isLockedForStudent) return studentLevel === 'SMP' ? 'SMP' : 'SMA';
    if (defaultLevel) return defaultLevel;
    if (defaultTargetClass?.includes('SMP')) return 'SMP';
    return 'SMA';
  }, [initialData, isLockedForStudent, studentLevel, defaultLevel, defaultTargetClass]);

  const [level, setLevel] = useState<'SMP' | 'SMA'>(initialEffectiveLevel);

  // Dynamic student list corresponding to the chosen level (SMP / SMA)
  const studentsForLevel = useMemo<User[]>(() => {
    let filtered: User[] = [];
    if (level === 'SMP') {
      filtered = allStoredStudents.filter(u =>
        u.className === 'SMP-LABSCHOOL' ||
        u.className.toUpperCase().includes('SMP') ||
        u.className.includes('7') ||
        u.className.includes('8') ||
        u.className.includes('9')
      );
    } else {
      filtered = allStoredStudents.filter(u =>
        u.className === 'SMA-LABSCHOOL' ||
        u.className.toUpperCase().includes('SMA') ||
        u.className.includes('X') ||
        u.className.includes('XI') ||
        u.className.includes('XII')
      );
    }
    if (filtered.length === 0) {
      filtered = allStoredStudents;
    }
    if (user && user.role === 'student') {
      const alreadyIn = filtered.some(u => u.id === user.id);
      if (!alreadyIn) {
        filtered = [user, ...filtered];
      }
    }
    return filtered;
  }, [allStoredStudents, level, user]);

  // Student Selection Checklist State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() => {
    if (initialData?.attendees && initialData.attendees.length > 0) {
      return initialData.attendees.map(a => a.studentId);
    }
    if (initialData?.studentId) {
      return [initialData.studentId];
    }
    if (user?.role === 'student' && user?.id) {
      return [user.id];
    }
    return [];
  });

  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  // Stored journals for topic participation duplicate checking
  const [storedJournals, setStoredJournals] = useState<LearningJournalMeeting[]>(() => loadStoredJournals());

  // Notification alert when student has already taken the topic
  const [lastAlertNotification, setLastAlertNotification] = useState<{
    studentName: string;
    meetingNumber: number;
    date: string;
    topicTitle: string;
  } | null>(null);

  // Auto-dismiss alert notification after 6 seconds
  useEffect(() => {
    if (lastAlertNotification) {
      const timer = setTimeout(() => setLastAlertNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [lastAlertNotification]);

  // Refresh stored journals on modal open
  useEffect(() => {
    if (isOpen) {
      setStoredJournals(loadStoredJournals());
    }
  }, [isOpen]);

  const [meetingNumber, setMeetingNumber] = useState<number>(
    initialData ? initialData.meetingNumber : defaultMeetingNumber
  );
  const [date, setDate] = useState<string>(
    initialData ? initialData.date : new Date().toISOString().split('T')[0]
  );
  const [timeRange, setTimeRange] = useState<string>(
    initialData ? initialData.timeRange : '15:30 - 17:30'
  );
  
  // Filter Mapel/Subtest Selector for Syllabus Connection
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState<string>(
    initialData ? initialData.subtestCode : (defaultSyllabusCode || 'PK')
  );
  
  const [subtestCode, setSubtestCode] = useState<string>(
    initialData ? initialData.subtestCode : (defaultSyllabusCode || 'PK')
  );
  const [subjectName, setSubjectName] = useState<string>(
    initialData ? initialData.subjectName : (defaultSubject || 'Pengetahuan Kuantitatif (PK)')
  );
  const [topicTitle, setTopicTitle] = useState<string>(
    initialData ? initialData.topicTitle : (defaultTopicTitle || '')
  );
  const [subtopicsText, setSubtopicsText] = useState<string>(
    initialData ? (Array.isArray(initialData.subtopics) ? initialData.subtopics.join('\n') : initialData.subtopics) : (Array.isArray(defaultSubtopics) ? defaultSubtopics.join('\n') : (defaultSubtopics || ''))
  );
  const [instructorName, setInstructorName] = useState<string>(
    initialData ? initialData.instructorName : (defaultInstructorName || (user?.role === 'teacher' ? user.name : 'Dr. Hendra Wijaya, M.Pd.'))
  );
  // Status Progres Belajar: BELUM, SEDANG, SUDAH
  const [progress, setProgress] = useState<'BELUM' | 'SEDANG' | 'SUDAH'>(
    initialData?.progress || 'SUDAH'
  );
  const [comprehensionRating, setComprehensionRating] = useState<number>(
    initialData ? initialData.comprehensionRating : 5
  );
  const [studentNotes, setStudentNotes] = useState<string>(
    initialData ? initialData.studentNotes : ''
  );
  const [teacherEvaluation, setTeacherEvaluation] = useState<string>(
    initialData ? initialData.teacherEvaluation : ''
  );
  const [homeworkTask, setHomeworkTask] = useState<string>(
    initialData?.homeworkTask || ''
  );
  const [targetCampus, setTargetCampus] = useState<string>(
    initialData ? initialData.targetCampus : (defaultTargetClass || (level === 'SMP' ? 'SMP Labschool Rawamangun' : 'SMA Labschool Kebayoran'))
  );
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>(
    initialData?.syllabusId || defaultSyllabusId || ''
  );
  const [syllabusCode, setSyllabusCode] = useState<string>(
    initialData?.syllabusCode || defaultSyllabusCode || (level === 'SMA' ? 'SIL-PK-SMA-LAB' : 'SIL-SMP-PK')
  );
  const [syllabusTopicId, setSyllabusTopicId] = useState<string>(
    initialData?.syllabusTopicId || defaultSyllabusTopicId || ''
  );
  const [competencyTarget, setCompetencyTarget] = useState<string>(
    initialData?.competencyTarget || defaultCompetency || ''
  );
  const [teachingMethod, setTeachingMethod] = useState<string>(
    initialData?.teachingMethod || defaultTeachingMethod || 'Problem-Based Learning & Speed Drills'
  );
  
  // Google Drive Link State
  const [driveLink, setDriveLink] = useState<string>(
    initialData?.driveLink || defaultDriveLink || ''
  );
  const [driveLinkTitle, setDriveLinkTitle] = useState<string>(
    initialData?.driveLinkTitle || defaultDriveLinkTitle || ''
  );
  const [isEditingDriveLink, setIsEditingDriveLink] = useState<boolean>(false);

  const [selectedTopicDropdown, setSelectedTopicDropdown] = useState<string>('');
  const [topicSearchKeyword, setTopicSearchKeyword] = useState<string>('');

  // Auto-synchronize student selection when level or students list changes
  useEffect(() => {
    if (user?.role === 'student' && user?.id) {
      setSelectedStudentIds([user.id]);
    } else if (studentsForLevel.length > 0) {
      setSelectedStudentIds(prev => {
        const validExisting = prev.filter(id => studentsForLevel.some(s => s.id === id));
        if (validExisting.length > 0) return validExisting;
        // Default: select all students in the active level
        return studentsForLevel.map(s => s.id);
      });
    }
  }, [studentsForLevel, level, user]);

  // Helper to query past journals where a student took the matching topic
  const getStudentTopicHistory = (studentId: string, currentTopicTitle: string, currentTopicId?: string) => {
    if (!currentTopicTitle && !currentTopicId) return [];
    const cleanCurrent = (currentTopicTitle || '').trim().toLowerCase();

    return storedJournals.filter(j => {
      // Exclude current meeting if editing
      if (initialData?.id && j.id === initialData.id) return false;

      // Match topic by syllabus topic ID or title
      const matchTopicId = currentTopicId && j.syllabusTopicId && j.syllabusTopicId === currentTopicId;
      const jTitle = (j.topicTitle || '').trim().toLowerCase();
      const matchTitle = cleanCurrent && (
        jTitle === cleanCurrent ||
        (cleanCurrent.length > 8 && jTitle.includes(cleanCurrent)) ||
        (jTitle.length > 8 && cleanCurrent.includes(jTitle))
      );

      if (!matchTopicId && !matchTitle) return false;

      // Check if student participated
      const isDirect = j.studentId === studentId;
      const isAttendee = Array.isArray(j.attendees) && j.attendees.some(a => a.studentId === studentId);

      return isDirect || isAttendee;
    });
  };

  // Map of studentId -> past journal history for the currently active topic
  const studentTopicHistoryMap = useMemo(() => {
    const map = new Map<string, LearningJournalMeeting[]>();
    if (!topicTitle.trim() && !syllabusTopicId) return map;

    studentsForLevel.forEach(st => {
      const history = getStudentTopicHistory(st.id, topicTitle, syllabusTopicId);
      if (history.length > 0) {
        map.set(st.id, history);
      }
    });
    return map;
  }, [studentsForLevel, topicTitle, syllabusTopicId, storedJournals, initialData]);

  // Selected students who have already attended this topic previously
  const alreadyAttendedSelectedStudents = useMemo(() => {
    return studentsForLevel
      .filter(st => selectedStudentIds.includes(st.id) && studentTopicHistoryMap.has(st.id))
      .map(st => ({
        student: st,
        history: studentTopicHistoryMap.get(st.id)!
      }));
  }, [studentsForLevel, selectedStudentIds, studentTopicHistoryMap]);

  // Toggle single student checkbox
  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const isChecked = prev.includes(studentId);
      let next: string[];
      if (isChecked) {
        next = prev.filter(id => id !== studentId);
      } else {
        next = [...prev, studentId];
        // Trigger notification if this student already attended this topic
        const hist = studentTopicHistoryMap.get(studentId);
        if (hist && hist.length > 0) {
          const st = studentsForLevel.find(s => s.id === studentId);
          setLastAlertNotification({
            studentName: st?.name || 'Siswa',
            meetingNumber: hist[0].meetingNumber,
            date: hist[0].date,
            topicTitle: hist[0].topicTitle || topicTitle
          });
        }
      }
      return next;
    });
  };

  // Select all students of active level
  const handleSelectAllStudents = () => {
    setSelectedStudentIds(studentsForLevel.map(s => s.id));
    const attended = studentsForLevel.filter(s => studentTopicHistoryMap.has(s.id));
    if (attended.length > 0) {
      const firstHist = studentTopicHistoryMap.get(attended[0].id);
      setLastAlertNotification({
        studentName: `${attended.length} Siswa`,
        meetingNumber: firstHist ? firstHist[0].meetingNumber : 1,
        date: firstHist ? firstHist[0].date : '',
        topicTitle: topicTitle
      });
    }
  };

  // Deselect all students
  const handleDeselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  // Select only students who haven't taken this topic yet
  const handleSelectOnlyNewStudents = () => {
    const newStudentIds = studentsForLevel
      .filter(s => !studentTopicHistoryMap.has(s.id))
      .map(s => s.id);
    setSelectedStudentIds(newStudentIds);
  };

  // Filtered student list by search query
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return studentsForLevel;
    const q = studentSearchQuery.toLowerCase();
    return studentsForLevel.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        (s.group && s.group.toLowerCase().includes(q)) ||
        (s.bio && s.bio.toLowerCase().includes(q))
    );
  }, [studentsForLevel, studentSearchQuery]);

  // Selected student user object
  const selectedStudentUser = useMemo(() => {
    const firstId = selectedStudentIds[0];
    return (
      studentsForLevel.find(s => s.id === firstId) ||
      studentsForLevel[0] ||
      null
    );
  }, [studentsForLevel, selectedStudentIds]);

  // 1. Filtered real syllabi matching the target level (SMP / SMA) and optional subtest
  const matchingSyllabiList = useMemo(() => {
    const targetClassTag = level === 'SMA' ? 'SMA-LABSCHOOL' : 'SMP-LABSCHOOL';
    // Match targetClass or title/code mentioning level
    let list = storedSyllabi.filter(s => {
      const matchClass = s.targetClass === targetClassTag || s.targetClass === 'SEMUA';
      const matchTitle = s.title.toUpperCase().includes(level) || s.code.toUpperCase().includes(level);
      return matchClass || matchTitle;
    });

    if (selectedSubtestFilter !== 'ALL') {
      const sf = selectedSubtestFilter.toUpperCase();
      list = list.filter(s => {
        const sSub = (s.subject || '').toUpperCase();
        const sTitle = (s.title || '').toUpperCase();
        const sCode = (s.code || '').toUpperCase();
        
        if (sf === 'PK') return sSub.includes('KUANTITATIF') || sSub.includes('PK') || sCode.includes('PK');
        if (sf === 'KV') return sSub.includes('VERBAL') || sSub.includes('KV') || sCode.includes('KV');
        if (sf === 'PM') return sSub.includes('MEMBACA') || sSub.includes('PENALARAN') || sSub.includes('PM') || sCode.includes('PM');
        if (sf === 'KA') return sSub.includes('AKADEMIK') || sSub.includes('AKA') || sSub.includes('IPA') || sSub.includes('IPS') || sCode.includes('AKA');
        if (sf === 'SV') return sSub.includes('KARAKTER') || sSub.includes('SV') || sCode.includes('SV');
        if (sf === 'SK') return sSub.includes('SKOLASTIK') || sSub.includes('SPASIAL') || sCode.includes('SK');
        return sSub.includes(sf) || sTitle.includes(sf) || sCode.includes(sf);
      });
    }

    return list;
  }, [storedSyllabi, level, selectedSubtestFilter]);

  // Selected Active Syllabus object
  const activeSyllabus = useMemo(() => {
    if (selectedSyllabusId) {
      const found = matchingSyllabiList.find(s => s.id === selectedSyllabusId);
      if (found) return found;
    }
    return matchingSyllabiList[0] || null;
  }, [matchingSyllabiList, selectedSyllabusId]);

  // Extract all available topics from the active syllabus (or all matching syllabi if any)
  const availableSyllabusTopics = useMemo(() => {
    if (activeSyllabus && activeSyllabus.topics && activeSyllabus.topics.length > 0) {
      return activeSyllabus.topics;
    }

    // Fallback: collect topics from template items for current level
    const templateTopics = LABSCHOOL_SYLLABUS_TEMPLATES[level] || [];
    const filtered = selectedSubtestFilter === 'ALL'
      ? templateTopics
      : templateTopics.filter(t => t.subtestCode === selectedSubtestFilter);

    return filtered.map((t): SyllabusTopic => ({
      id: t.id,
      meetingNumber: t.meetingNumber,
      title: t.topicTitle,
      subtopics: t.subtopics,
      competency: t.competency,
      durationMinutes: 90,
      teachingMethod: t.teachingMethod,
      referenceNotes: t.subjectName
    }));
  }, [activeSyllabus, level, selectedSubtestFilter]);

  // Filtered topics by search keyword
  const filteredTopics = useMemo(() => {
    if (!topicSearchKeyword.trim()) return availableSyllabusTopics;
    const q = topicSearchKeyword.toLowerCase();
    return availableSyllabusTopics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.subtopics && t.subtopics.some(sub => sub.toLowerCase().includes(q))) ||
      (t.competency && t.competency.toLowerCase().includes(q))
    );
  }, [availableSyllabusTopics, topicSearchKeyword]);

  // Apply syllabus topic into form fields
  const handleApplyTopic = (topic: SyllabusTopic, silabusObj?: SyllabusItem | null) => {
    const parentSyllabus = silabusObj || activeSyllabus;
    setTopicTitle(topic.title);
    setSubtopicsText((topic.subtopics || []).join('\n'));
    setCompetencyTarget(topic.competency || '');
    setTeachingMethod(topic.teachingMethod || 'Problem-Based Learning & Speed Drills');
    setSyllabusTopicId(topic.id);
    setSelectedTopicDropdown(topic.id);

    // Check if any currently checked student has already taken this topic
    const attendedList = studentsForLevel.filter(st => {
      const history = getStudentTopicHistory(st.id, topic.title, topic.id);
      return history.length > 0;
    });

    if (attendedList.length > 0) {
      const firstHist = getStudentTopicHistory(attendedList[0].id, topic.title, topic.id)[0];
      setLastAlertNotification({
        studentName: attendedList.length === 1 ? attendedList[0].name : `${attendedList.length} Siswa (${attendedList.map(s => s.name.split(' ')[0]).join(', ')})`,
        meetingNumber: firstHist ? firstHist.meetingNumber : 1,
        date: firstHist ? firstHist.date : '',
        topicTitle: topic.title
      });
    }

    // Check if topic or template contains Google Drive Link
    const matchingTemplate = LABSCHOOL_SYLLABUS_TEMPLATES[level]?.find(
      t => t.id === topic.id || t.topicTitle.toLowerCase() === topic.title.toLowerCase()
    );
    const matchedDriveLink = (topic as any).driveLink || matchingTemplate?.driveLink || '';
    const matchedDriveTitle = (topic as any).driveLinkTitle || matchingTemplate?.driveLinkTitle || (topic.title ? `Modul Materi & Latihan: ${topic.title}` : '');

    if (matchedDriveLink) {
      setDriveLink(matchedDriveLink);
      setDriveLinkTitle(matchedDriveTitle);
      setIsEditingDriveLink(false);
    }

    if (parentSyllabus) {
      setSelectedSyllabusId(parentSyllabus.id);
      setSyllabusCode(parentSyllabus.code);
      setSubjectName(parentSyllabus.subject || parentSyllabus.title);
      if (parentSyllabus.teacherInCharge && !initialData) {
        setInstructorName(parentSyllabus.teacherInCharge);
      }

      // Infer subtest code from syllabus
      const sc = parentSyllabus.code.toUpperCase();
      const sj = parentSyllabus.subject.toUpperCase();
      if (sc.includes('PK') || sj.includes('KUANTITATIF')) setSubtestCode('PK');
      else if (sc.includes('KV') || sj.includes('VERBAL')) setSubtestCode('KV');
      else if (sc.includes('PM') || sj.includes('MEMBACA')) setSubtestCode('PM');
      else if (sc.includes('AKA') || sj.includes('IPA') || sj.includes('IPS')) setSubtestCode('KA');
      else if (sc.includes('SV') || sj.includes('KARAKTER')) setSubtestCode('SV');
      else if (sc.includes('SK') || sj.includes('SKOLASTIK')) setSubtestCode('SK');
    }
  };

  // Sync state if initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setMeetingNumber(initialData.meetingNumber);
      setDate(initialData.date);
      setTimeRange(initialData.timeRange);
      setLevel(initialData.level);
      setSubtestCode(initialData.subtestCode);
      setSelectedSubtestFilter(initialData.subtestCode || 'ALL');
      setSubjectName(initialData.subjectName);
      setTopicTitle(initialData.topicTitle);
      setSubtopicsText(initialData.subtopics.join('\n'));
      setInstructorName(initialData.instructorName);
      setProgress(initialData.progress || 'SUDAH');
      setComprehensionRating(initialData.comprehensionRating);
      setStudentNotes(initialData.studentNotes);
      setTeacherEvaluation(initialData.teacherEvaluation);
      setHomeworkTask(initialData.homeworkTask || '');
      setTargetCampus(initialData.targetCampus);
      setSelectedSyllabusId(initialData.syllabusId || '');
      setSyllabusCode(initialData.syllabusCode || '');
      setSyllabusTopicId(initialData.syllabusTopicId || '');
      setCompetencyTarget(initialData.competencyTarget || '');
      setTeachingMethod(initialData.teachingMethod || 'Problem-Based Learning & Speed Drills');
      setSelectedTopicDropdown(initialData.syllabusTopicId || '');
      setDriveLink(initialData.driveLink || '');
      setDriveLinkTitle(initialData.driveLinkTitle || '');
      setIsEditingDriveLink(false);
      if (initialData.attendees && initialData.attendees.length > 0) {
        setSelectedStudentIds(initialData.attendees.map(a => a.studentId));
      } else if (initialData.studentId) {
        setSelectedStudentIds([initialData.studentId]);
      }
    } else if (isOpen) {
      setMeetingNumber(defaultMeetingNumber);

      const targetLvl = defaultLevel || (defaultTargetClass?.includes('SMP') ? 'SMP' : 'SMA');
      setLevel(targetLvl);
      setTargetCampus(defaultTargetClass || (targetLvl === 'SMP' ? 'SMP Labschool Rawamangun' : 'SMA Labschool Kebayoran'));

      if (defaultSyllabusCode) {
        setSubtestCode(defaultSyllabusCode);
        setSelectedSubtestFilter(defaultSyllabusCode);
        setSyllabusCode(defaultSyllabusCode);
      }
      if (defaultSubject) {
        setSubjectName(defaultSubject);
      }
      if (defaultTopicTitle) {
        setTopicTitle(defaultTopicTitle);
      }
      if (defaultSubtopics) {
        setSubtopicsText(Array.isArray(defaultSubtopics) ? defaultSubtopics.join('\n') : defaultSubtopics);
      }
      if (defaultCompetency) {
        setCompetencyTarget(defaultCompetency);
      }
      if (defaultTeachingMethod) {
        setTeachingMethod(defaultTeachingMethod);
      }
      if (defaultSyllabusId) {
        setSelectedSyllabusId(defaultSyllabusId);
      }
      if (defaultSyllabusTopicId) {
        setSyllabusTopicId(defaultSyllabusTopicId);
        setSelectedTopicDropdown(defaultSyllabusTopicId);
      }
      if (defaultDriveLink) {
        setDriveLink(defaultDriveLink);
      }
      if (defaultDriveLinkTitle) {
        setDriveLinkTitle(defaultDriveLinkTitle);
      }
      if (defaultInstructorName) {
        setInstructorName(defaultInstructorName);
      }

      // Auto pre-fill from matching syllabus only if no explicit topic was provided
      if (!defaultTopicTitle && matchingSyllabiList.length > 0) {
        const topSil = matchingSyllabiList[0];
        setSelectedSyllabusId(topSil.id);
        setSyllabusCode(topSil.code);
        setSubjectName(topSil.subject || topSil.title);
        if (topSil.topics && topSil.topics.length > 0 && !topicTitle) {
          const topT = topSil.topics[0];
          handleApplyTopic(topT, topSil);
        }
      }
    }
  }, [
    initialData,
    defaultMeetingNumber,
    isOpen,
    defaultLevel,
    defaultSubject,
    defaultSyllabusCode,
    defaultTargetClass,
    defaultTopicTitle,
    defaultSubtopics,
    defaultCompetency,
    defaultTeachingMethod,
    defaultSyllabusTopicId,
    defaultSyllabusId,
    defaultDriveLink,
    defaultDriveLinkTitle,
    defaultInstructorName
  ]);

  // When Level changes (SMP / SMA)
  const handleLevelChange = (newLvl: 'SMP' | 'SMA') => {
    setLevel(newLvl);
    setTargetCampus(newLvl === 'SMP' ? 'SMP Labschool Rawamangun' : 'SMA Labschool Kebayoran');
    setSelectedTopicDropdown('');

    // Pre-select all students of the newly chosen level
    const newLevelStudents = allStoredStudents.filter(u => {
      if (newLvl === 'SMP') {
        return (
          u.className === 'SMP-LABSCHOOL' ||
          u.className.toUpperCase().includes('SMP') ||
          u.className.includes('7') ||
          u.className.includes('8') ||
          u.className.includes('9')
        );
      } else {
        return (
          u.className === 'SMA-LABSCHOOL' ||
          u.className.toUpperCase().includes('SMA') ||
          u.className.includes('X') ||
          u.className.includes('XI') ||
          u.className.includes('XII')
        );
      }
    });

    if (newLevelStudents.length > 0) {
      setSelectedStudentIds(newLevelStudents.map(s => s.id));
    }
  };

  // When Subtest Filter changes
  const handleSubtestFilterChange = (filterCode: string) => {
    setSelectedSubtestFilter(filterCode);
    if (filterCode !== 'ALL') {
      setSubtestCode(filterCode);
    }
    setSelectedTopicDropdown('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      alert('Mohon isi Judul Topik Bahasan Materi!');
      return;
    }

    let activeSelectedStudentIds = [...selectedStudentIds];
    if (activeSelectedStudentIds.length === 0) {
      if (user?.role === 'student' && user?.id) {
        activeSelectedStudentIds = [user.id];
        setSelectedStudentIds([user.id]);
      } else {
        alert('Mohon pilih / ceklist minimal satu siswa yang ditambahkan pada jurnal!');
        return;
      }
    }

    const subtopics = subtopicsText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Build attendees list from checked students
    let checkedStudents = studentsForLevel.filter(s => activeSelectedStudentIds.includes(s.id));
    if (checkedStudents.length === 0 && user?.role === 'student') {
      checkedStudents = [user];
    }

    let finalAttendees = checkedStudents.map(st => ({
      studentId: st.id,
      studentName: st.name,
      studentNis: st.nis,
      studentClass: st.className,
      studentAvatar: st.avatar,
      studentGroup: st.group,
      status: 'HADIR' as const,
      note: ''
    }));

    if (finalAttendees.length === 0 && user?.role === 'student') {
      finalAttendees = [{
        studentId: user.id,
        studentName: user.name,
        studentNis: user.nis || (level === 'SMP' ? '20267001' : '20261011'),
        studentClass: user.className || `${level}-LABSCHOOL`,
        studentAvatar: user.avatar,
        studentGroup: user.group,
        status: 'HADIR' as const,
        note: ''
      }];
    }

    const primaryStudent = (user?.role === 'student' ? user : checkedStudents[0]) || (studentsForLevel.length > 0 ? studentsForLevel[0] : user);

    const meetingItem: LearningJournalMeeting = {
      id: initialData?.id || `jm-${level.toLowerCase()}-${Date.now()}`,
      meetingNumber: Number(meetingNumber) || 1,
      date,
      timeRange,
      durationMinutes: 120,
      level,
      subtestCode: subtestCode || selectedSubtestFilter || 'PK',
      subjectName: subjectName || (level === 'SMA' ? 'Pengetahuan Kuantitatif (PK)' : 'Pengetahuan Kuantitatif (PK) SMP'),
      topicTitle: topicTitle.trim(),
      subtopics: subtopics.length > 0 ? subtopics : ['Penguasaan Konsep Dasar & Bedah Soal Seleksi Labschool'],
      instructorName: instructorName || 'Dr. Hendra Wijaya, M.Pd.',
      instructorRole: 'Master Tutor Labschool',
      attendanceStatus: 'HADIR',
      progress, // 'BELUM' | 'SEDANG' | 'SUDAH'
      comprehensionRating,
      comprehensionPercentage: comprehensionRating * 20,
      studentNotes: studentNotes || 'Memahami materi dengan baik dan menyelesaikan latihan soal secara mandiri.',
      teacherEvaluation: teacherEvaluation || 'Siswa aktif, konsisten dan siap menghadapi seleksi PSB Labschool 2026.',
      homeworkTask: homeworkTask || 'Review catatan jurnal belajar dan kerjakan modul latihan',
      homeworkStatus: progress === 'SUDAH' ? 'SEMPURNA' : 'BELUM',
      targetCampus,
      syllabusId: activeSyllabus?.id || selectedSyllabusId || (level === 'SMA' ? 'sil-sma-pk' : 'sil-smp-pk'),
      syllabusCode: activeSyllabus?.code || syllabusCode || (level === 'SMA' ? 'SIL-PK-SMA-LAB' : 'SIL-SMP-PK'),
      syllabusTopicId: syllabusTopicId || selectedTopicDropdown,
      competencyTarget: competencyTarget || 'Menguasai konsep dasar materi dan strategi eliminasi cepat seleksi Labschool.',
      teachingMethod: teachingMethod || 'Problem-Based Learning & Speed Drills',
      driveLink: driveLink.trim() || undefined,
      driveLinkTitle: driveLinkTitle.trim() || undefined,

      // Student Integration Data
      sessionType: checkedStudents.length === 1 ? 'INDIVIDUAL' : 'CLASS_GROUP',
      studentId: primaryStudent?.id || undefined,
      studentName: primaryStudent?.name || (level === 'SMP' ? 'Raditya Pratama Putra' : 'Arya Dewantara Putra'),
      studentNis: primaryStudent?.nis || (level === 'SMP' ? '20267001' : '20261011'),
      studentClass: primaryStudent?.className || (level === 'SMP' ? 'SMP-LABSCHOOL' : 'SMA-LABSCHOOL'),
      studentAvatar: primaryStudent?.avatar || undefined,
      studentGroup: primaryStudent?.group || undefined,
      attendees: finalAttendees.length > 0 ? finalAttendees : undefined,
      totalAttendees: finalAttendees.length,
      presentCount: finalAttendees.length
    };

    // Always persist to local stored journals
    const currentJournals = loadStoredJournals();
    const existingIdx = currentJournals.findIndex(j => j.id === meetingItem.id);
    if (existingIdx >= 0) {
      currentJournals[existingIdx] = meetingItem;
    } else {
      currentJournals.unshift(meetingItem);
    }
    saveStoredJournals(currentJournals);

    if (onSave) {
      onSave(meetingItem);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 my-6 text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>{initialData ? 'Edit Jurnal Pertemuan Belajar' : 'Input Jurnal Pertemuan Belajar'}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {level} Labschool
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Terhubung Otomatis dengan Data Silabus & Data Siswa {level} Labschool
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1">
          
          {/* SYLLABUS CONNECTION SUCCESS BADGE */}
          {topicTitle && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white">Data Silabus Terhubung Otomatis: </span>
                <span className="text-emerald-200">{level} Labschool • {subjectName} • Topik: <strong className="text-white">{topicTitle}</strong></span>
              </div>
            </div>
          )}

          {/* SECTION 1: FILTER JENJANG & SUBTES / MAPEL SILABUS */}
          <div className="bg-gradient-to-br from-indigo-950/50 via-slate-950 to-blue-950/50 border border-indigo-700/50 rounded-2xl p-4 space-y-3.5 shadow-md">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/40 pb-2.5">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Koneksi Silabus & Filter Mapel/Subtes</span>
              </div>
              <span className="text-[11px] text-indigo-300/80">
                Pilih Jenjang & Mapel untuk memuat silabus serta siswa otomatis
              </span>
            </div>

            {/* Filter Row: Jenjang & Mapel/Subtest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Jenjang Pendidikan Labschool:</span>
                  </span>
                  {isLockedForStudent && (
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">
                      Sesuai Kelas ({user.className || `${level}-LABSCHOOL`})
                    </span>
                  )}
                </label>
                {isLockedForStudent ? (
                  <div className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    level === 'SMA'
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-md'
                      : 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 shadow-md'
                  }`}>
                    <span>{level === 'SMA' ? '🎓 SMA Labschool (Persiapan Masuk SMA)' : '🏫 SMP Labschool (Persiapan Masuk SMP)'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300">
                      Terkunci Otomatis
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLevelChange('SMA')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        level === 'SMA'
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🎓 SMA Labschool</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLevelChange('SMP')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        level === 'SMP'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🏫 SMP Labschool</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <span>Filter Mapel / Subtes Ujian:</span>
                </label>
                <select
                  value={selectedSubtestFilter}
                  onChange={(e) => handleSubtestFilterChange(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 font-bold text-xs cursor-pointer"
                >
                  {LABSCHOOL_SUBTEST_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DYNAMIC SILABUS SELECTOR & TOPIC CHOOSER */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
              
              {/* Active Syllabus Display & Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                    {activeSyllabus?.code || (level === 'SMA' ? 'SIL-PK-SMA-LAB' : 'SIL-SMP-PK')}
                  </span>
                  <span className="font-bold text-slate-100 text-xs truncate">
                    {activeSyllabus?.title || 'Silabus Kurikulum Labschool'}
                  </span>
                </div>
                
                {matchingSyllabiList.length > 1 && (
                  <select
                    value={activeSyllabus?.id || ''}
                    onChange={(e) => {
                      const sel = matchingSyllabiList.find(s => s.id === e.target.value);
                      if (sel) {
                        setSelectedSyllabusId(sel.id);
                        setSyllabusCode(sel.code);
                        setSubjectName(sel.subject);
                        if (sel.topics && sel.topics.length > 0) {
                          handleApplyTopic(sel.topics[0], sel);
                        }
                      }
                    }}
                    className="bg-slate-950 text-indigo-300 text-[11px] font-medium rounded-lg px-2 py-1 border border-slate-700 cursor-pointer"
                  >
                    {matchingSyllabiList.map(s => (
                      <option key={s.id} value={s.id}>
                        Ganti Silabus: {s.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Topik / Materi Dropdown Auto-Fill Selector */}
              <div>
                <label className="text-indigo-300 font-bold block mb-1 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ListPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilih Topik / Materi Silabus (Otomatis Isi Data Form):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {availableSyllabusTopics.length} Topik Tersedia
                  </span>
                </label>

                <select
                  value={selectedTopicDropdown}
                  onChange={(e) => {
                    const top = availableSyllabusTopics.find(t => t.id === e.target.value);
                    if (top) {
                      handleApplyTopic(top, activeSyllabus);
                    }
                  }}
                  className="w-full bg-slate-950 text-emerald-300 font-bold text-xs rounded-xl px-3 py-2.5 border border-emerald-600/60 focus:outline-none focus:border-emerald-400 cursor-pointer shadow-sm"
                >
                  <option value="" className="text-slate-400">
                    -- Pilih Topik Bahasan dari Silabus ({level} - {selectedSubtestFilter}) --
                  </option>
                  {availableSyllabusTopics.map((top, idx) => (
                    <option key={top.id || idx} value={top.id} className="text-white">
                      Pertemuan #{top.meetingNumber || idx + 1}: {top.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Topic Cards Selection Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  Atau klik langsung topik silabus di bawah ini:
                </span>

                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {filteredTopics.map((top, idx) => {
                    const isSelected = topicTitle.trim() === top.title.trim() || syllabusTopicId === top.id;
                    return (
                      <div
                        key={top.id || idx}
                        onClick={() => handleApplyTopic(top, activeSyllabus)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 text-left ${
                          isSelected
                            ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-400/40'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {isSelected ? <Check className="w-3 h-3" /> : top.meetingNumber || idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs leading-tight text-white line-clamp-1">
                              {top.title}
                            </p>
                            {top.subtopics && top.subtopics.length > 0 && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                📚 {top.subtopics.join(' • ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg shrink-0 font-bold ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60'
                        }`}>
                          {isSelected ? 'Terpilih ✓' : 'Pilih ⚡'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DATA SISWA & CEKLIST PESERTA JURNAL (SMP / SMA) */}
          {isStudent ? (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold border border-indigo-500/30">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-xs">
                      Siswa Pencatat Jurnal Belajar Mandiri
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Jurnal akan tersimpan otomatis ke akun belajar Anda dan terhubung ke analitik persiapan PSB Labschool 2026.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Akun Aktif Terhubung</span>
                </span>
              </div>

              {/* Student Profile Card */}
              <div className="p-3 bg-slate-950/80 border border-indigo-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                    alt={user?.name || 'Siswa'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-2">
                      <span>{user?.name || 'Siswa Labschool'}</span>
                      <span className="text-[11px] font-mono text-indigo-300">({user?.nis || (level === 'SMP' ? '20267001' : '20261011')})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-slate-300 font-medium">🏫 {user?.className || `${level}-LABSCHOOL`}</span>
                      {user?.group && (
                        <span className="text-amber-300 font-medium">🏷️ {user?.group}</span>
                      )}
                      <span className="text-cyan-300 font-mono text-[10px]">• Target: {targetCampus}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-400/50 text-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Check className="w-4 h-4 text-indigo-300 stroke-[3]" />
                    <span>Tercatat Otomatis</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold border border-indigo-500/30">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs">
                      Data Siswa & Ceklist Peserta Jurnal ({level} Labschool)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                      {selectedStudentIds.length} / {studentsForLevel.length} Siswa Terpilih
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Centang siswa yang ditambahkan pada jurnal. Sistem otomatis mendeteksi riwayat materi sebelumnya.
                  </p>
                </div>
              </div>

              {/* Quick Batch Actions */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllStudents}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <CheckSquare className="w-3 h-3 text-indigo-400" />
                  <span>Pilih Semua ({studentsForLevel.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllStudents}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Square className="w-3 h-3 text-slate-500" />
                  <span>Batalkan Semua</span>
                </button>
              </div>
            </div>

            {/* Notification Alert Box for Duplicate Topic Participation */}
            {lastAlertNotification && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/50 rounded-xl flex items-start justify-between gap-3 text-amber-200 text-xs shadow-md">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>Peringatan: Siswa Sudah Pernah Mengikuti Topik Ini!</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                      Siswa <strong className="text-white bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">{lastAlertNotification.studentName}</strong> tercatat sudah pernah mengikuti materi <strong className="text-white">"{lastAlertNotification.topicTitle}"</strong> pada Pertemuan #{lastAlertNotification.meetingNumber} ({lastAlertNotification.date}).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLastAlertNotification(null)}
                  className="text-amber-400 hover:text-amber-100 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Persistent duplicate warning summary bar if any selected students already took the topic */}
            {alreadyAttendedSelectedStudents.length > 0 && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-[11px]">
                    <strong className="text-white font-bold">{alreadyAttendedSelectedStudents.length} siswa yang dicentang</strong> sudah pernah mempelajari materi ini.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSelectOnlyNewStudents}
                  className="px-2.5 py-1 text-[10px] bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-400/50 rounded-lg font-bold transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  Hanya Pilih Siswa yang Belum Pernah
                </button>
              </div>
            )}

            {/* Student Search & Stats Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari siswa jenjang ini berdasarkan Nama / NIS / Kelompok..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl pl-8 pr-8 py-2 border border-slate-700/80 focus:outline-none focus:border-indigo-500 text-xs shadow-inner"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {studentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStudentSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 font-medium">
                  Total: <strong className="text-white">{studentsForLevel.length}</strong>
                </span>
                <span className="px-2 py-1 bg-emerald-950/50 rounded-lg border border-emerald-500/30 text-emerald-300 font-bold">
                  Dicatat: <strong className="text-white">{selectedStudentIds.length}</strong>
                </span>
              </div>
            </div>

            {/* Student Checklist Grid / Roster */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                  Tidak ditemukan siswa dengan kata kunci "{studentSearchQuery}"
                </div>
              ) : (
                filteredStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  const pastHistory = studentTopicHistoryMap.get(st.id);
                  const hasAttended = pastHistory && pastHistory.length > 0;

                  return (
                    <div
                      key={st.id}
                      onClick={() => handleToggleStudent(st.id)}
                      className={`pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? hasAttended
                            ? 'bg-amber-950/30 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/30'
                            : 'bg-indigo-950/40 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Checkbox & Student Profile Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox Icon Indicator */}
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-transparent'
                        }`}>
                          <Check className={`w-3.5 h-3.5 stroke-[3] ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                        </div>

                        <img
                          src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                          alt={st.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{st.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">({st.nis})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-300 font-medium">🏫 {st.className}</span>
                            {st.group && (
                              <span className="text-amber-300 font-medium">🏷️ {st.group}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Topic Participation Status Badge */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {hasAttended ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Sudah Pernah (Pert. #{pastHistory[0].meetingNumber})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Materi Baru</span>
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {isChecked ? 'Ditambahkan ✓' : 'Belum Dipilih'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          )}

          {/* SECTION 3: BASIC SESSION DETAILS (Sesi, Tanggal, Waktu) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Pertemuan Ke-</label>
              <input
                type="number"
                min={1}
                max={50}
                value={meetingNumber}
                onChange={(e) => setMeetingNumber(Number(e.target.value))}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Tanggal Sesi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Waktu & Durasi</label>
              <input
                type="text"
                placeholder="e.g. 15:30 - 17:30"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 4: STATUS PROGRES PERTEMUAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Status Progres Pertemuan */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Status Progres Pertemuan:</span>
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  progress === 'SUDAH'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : progress === 'SEDANG'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {progress === 'SUDAH' ? 'Sudah Selesai' : progress === 'SEDANG' ? 'Sedang Berjalan' : 'Belum Dimulai'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setProgress('BELUM')}
                  className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 font-bold transition-all text-xs cursor-pointer ${
                    progress === 'BELUM'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Belum</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProgress('SEDANG')}
                  className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 font-bold transition-all text-xs cursor-pointer ${
                    progress === 'SEDANG'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-1 ring-blue-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Sedang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProgress('SUDAH')}
                  className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 font-bold transition-all text-xs cursor-pointer ${
                    progress === 'SUDAH'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Sudah</span>
                </button>
              </div>
            </div>

            {/* Ringkasan Peserta Terpilih */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Peserta Ditambahkan:</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {selectedStudentIds.length} Siswa Terpilih
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-white font-bold truncate">
                    {selectedStudentIds.length === 0 ? (
                      <span className="text-rose-400 font-normal">Belum ada siswa yang dicentang</span>
                    ) : selectedStudentIds.length === 1 ? (
                      studentsForLevel.find(s => s.id === selectedStudentIds[0])?.name || '1 Siswa Terpilih'
                    ) : (
                      `${selectedStudentIds.length} Siswa (${level} Labschool)`
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {selectedStudentIds.length === 1 ? 'Sesi Tunggal / Privat' : 'Sesi Kolektif / Rombel'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllStudents}
                  className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  Pilih Semua
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: TOPIK UTAMA & SUB-MATERI FORM */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-200 font-bold block">
                  Topik Pokok Bahasan / Judul Materi <span className="text-rose-400">*</span>
                </label>
                {syllabusTopicId && (
                  <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    Tersinkronisasi Silabus ({syllabusCode})
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Strategi Bedah Soal Pola Bilangan, Barisan Deret & Aljabar Seleksi Labschool"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                required
              />
            </div>

            {/* Rincian Sub-Topik */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Rincian Sub-Topik / Materi Pokok (Satu per baris)
              </label>
              <textarea
                rows={3}
                placeholder="Pola Bilangan Bertingkat Dua&#10;Manipulasi Aljabar Pecahan & Nilai Mutlak&#10;Trik Cepat 30 Detik Soal Persentase"
                value={subtopicsText}
                onChange={(e) => setSubtopicsText(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono text-[11px]"
              />
            </div>

            {/* Capaian Pembelajaran Silabus */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Target Capaian Pembelajaran / Kompetensi Silabus
              </label>
              <textarea
                rows={2}
                placeholder="Siswa mampu menguasai konsep dan menyelesaikan variasi soal HOTS standar seleksi Labschool..."
                value={competencyTarget}
                onChange={(e) => setCompetencyTarget(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* SECTION: LINK GOOGLE DRIVE MODUL MATERI & LATIHAN */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-indigo-950/40 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold border border-emerald-500/30">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                      <span>Link Google Drive / Modul Materi Pembelajaran</span>
                      {driveLink && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Terhubung Silabus
                        </span>
                      )}
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Link file/folder Google Drive modul materi dan bank soal sesuai topik silabus
                    </p>
                  </div>
                </div>

                {driveLink && !isEditingDriveLink && (
                  <button
                    type="button"
                    onClick={() => setIsEditingDriveLink(true)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-indigo-400" />
                    <span>Ubah Link</span>
                  </button>
                )}
              </div>

              {/* Display card when link exists and not editing */}
              {driveLink && !isEditingDriveLink ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">
                        {driveLinkTitle || 'Modul Pembelajaran & Latihan Soal Terpadu'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-emerald-400/90">{driveLink}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Drive</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsEditingDriveLink(true)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                      title="Ubah Link Google Drive"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDriveLink('');
                        setDriveLinkTitle('');
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 cursor-pointer"
                      title="Hapus Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Editable Form Inputs */
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2.5">
                  <div>
                    <label className="text-slate-300 text-[11px] font-semibold block mb-1">
                      URL Link Google Drive (Folder / Modul PDF / Spreadsheet)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/1Labschool-Modul-Materi..."
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        className="w-full bg-slate-950 text-white rounded-xl pl-8 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                      />
                      <Link2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-[11px] font-semibold block mb-1">
                      Judul / Keterangan Modul Drive
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Modul Ringkasan & Bank Soal Seleksi PSB Labschool 2026"
                      value={driveLinkTitle}
                      onChange={(e) => setDriveLinkTitle(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Helper to reload default template link */}
                    <button
                      type="button"
                      onClick={() => {
                        const matchingTemplate = LABSCHOOL_SYLLABUS_TEMPLATES[level]?.find(
                          t => t.id === syllabusTopicId || t.topicTitle.toLowerCase() === topicTitle.toLowerCase()
                        );
                        if (matchingTemplate?.driveLink) {
                          setDriveLink(matchingTemplate.driveLink);
                          setDriveLinkTitle(matchingTemplate.driveLinkTitle || `Modul: ${matchingTemplate.topicTitle}`);
                        } else {
                          const fallbackLink = `https://drive.google.com/drive/folders/1Labschool-${level}-${subtestCode}-2026`;
                          setDriveLink(fallbackLink);
                          setDriveLinkTitle(`Modul Materi & Latihan: ${topicTitle || subjectName}`);
                        }
                      }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Muat Link Default Silabus</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {driveLink && (
                        <button
                          type="button"
                          onClick={() => setIsEditingDriveLink(false)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: PEMAHAMAN, GURU, METODE & KAMPUS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Rating Pemahaman Siswa */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-slate-300 font-bold block text-xs">
                Tingkat Pemahaman Siswa: <span className="text-amber-400 font-bold">{comprehensionRating} / 5 Bintang ({comprehensionRating * 20}%)</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setComprehensionRating(star)}
                    className={`flex-1 py-1.5 rounded-xl border text-sm transition-all cursor-pointer ${
                      comprehensionRating >= star
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold ring-1 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Guru Pengampu */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1">
              <label className="text-slate-300 font-bold block text-xs">Guru Pengampu</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full bg-slate-900 text-white rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Target Kampus & Metode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Target Kampus Labschool</label>
              <input
                type="text"
                value={targetCampus}
                onChange={(e) => setTargetCampus(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Metode Pembelajaran</label>
              <input
                type="text"
                value={teachingMethod}
                onChange={(e) => setTeachingMethod(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Catatan Siswa & Evaluasi Guru */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Catatan Refleksi Belajar Siswa</label>
              <textarea
                rows={2}
                placeholder="Catatan poin penting atau rumus cepat yang dipahami..."
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Evaluasi & Saran Tindak Lanjut Guru</label>
              <textarea
                rows={2}
                placeholder="Apresiasi dan saran tindak lanjut guru..."
                value={teacherEvaluation}
                onChange={(e) => setTeacherEvaluation(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Tugas Mandiri / PR */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Tugas / Latihan Mandiri (PR)</label>
            <input
              type="text"
              placeholder="e.g. Kerjakan Modul Bab 1 Halaman 14-18 (Soal No. 1 - 25)"
              value={homeworkTask}
              onChange={(e) => setHomeworkTask(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Jurnal Belajar</span>
          </button>
        </div>

      </div>
    </div>
  );
};

