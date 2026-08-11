import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import { getUserLabschoolLevel } from '../../utils/labschoolHelpers';
import {
  ArrowUpRight,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  GraduationCap,
  HelpCircle,
  Image,
  Lightbulb,
  MapPin,
  Plus,
  School,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
  Settings,
  Layers,
  ShieldCheck
} from 'lucide-react';
import {
  LabschoolCampusItem,
  loadStoredCampuses,
  saveStoredCampuses
} from './labschoolCampusData';
import {
  LearningJournalMeeting,
  loadStoredJournals,
  saveStoredJournals
} from './labschoolLaporanData';
import { LabschoolCampusModal } from './LabschoolCampusModal';
import { LabschoolCountdownLRI } from './LabschoolCountdownLRI';
import { LabschoolImageEditModal } from './LabschoolImageEditModal';
import { LabschoolSubtestExplorer } from './LabschoolSubtestExplorer';
import { LABSCHOOL_SUBTESTS } from './labschoolSubtestData';

interface LabschoolDashboardProps {
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
}

interface StudyJournalEntry {
  id: string;
  date: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  rating: number; // 1 to 5 stars
  notes: string;
  targetCampus: string;
}

export const LabschoolDashboard: React.FC<LabschoolDashboardProps> = ({
  user,
  onNavigateTab
}) => {
  // Modals state for rich interactivity
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [selectedCampusIdForModal, setSelectedCampusIdForModal] = useState<string | undefined>(undefined);
  const [activeSubtestExplorerCode, setActiveSubtestExplorerCode] = useState<string>('PK');
  
  // Image Edit Modal State
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);
  const [selectedCampusIdForImageEdit, setSelectedCampusIdForImageEdit] = useState<string | undefined>(undefined);

  // 5 Labschool Campuses State with LocalStorage persistence & Admin CRUD support
  const [campuses, setCampuses] = useState<LabschoolCampusItem[]>(() => {
    return loadStoredCampuses();
  });

  // Journal state with localStorage persistence
  const [journalList, setJournalList] = useState<StudyJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`labschool_journal_${user.id || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'j-1',
        date: new Date().toISOString().split('T')[0],
        subject: 'PK (Pengetahuan Kuantitatif)',
        topic: 'Deret Aritmatika Bertingkat & Pola Aljabar',
        durationMinutes: 60,
        rating: 5,
        notes: 'Sudah menguasai 15 tipe pola deret bersusun dan rotasi 3D bangun ruang.',
        targetCampus: 'SMA Labschool Kebayoran'
      },
      {
        id: 'j-2',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        subject: 'KV (Kemampuan Verbal)',
        topic: 'Analogi Kata & English Vocabulary in Context',
        durationMinutes: 75,
        rating: 4,
        notes: 'Perlu latihan lagi pada hubungan asosiasi kata ganda dan sinonim kontekstual.',
        targetCampus: 'SMA Labschool Rawamangun'
      }
    ];
  });

  const [newJournal, setNewJournal] = useState({
    subject: 'PK (Pengetahuan Kuantitatif)',
    topic: '',
    durationMinutes: 60,
    rating: 5,
    notes: '',
    targetCampus: 'Labschool Kebayoran'
  });

  const saveJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'student') return; // Fitur CRUD mutasi nonaktif untuk siswa
    if (!newJournal.topic.trim()) return;

    const entry: StudyJournalEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subject: newJournal.subject,
      topic: newJournal.topic,
      durationMinutes: Number(newJournal.durationMinutes) || 60,
      rating: Number(newJournal.rating) || 5,
      notes: newJournal.notes,
      targetCampus: newJournal.targetCampus
    };

    const updated = [entry, ...journalList];
    setJournalList(updated);
    try {
      localStorage.setItem(`labschool_journal_${user.id || 'guest'}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Also synchronize into global learning journal meetings
    try {
      const currentJournals = loadStoredJournals();
      const effectiveLvl: 'SMP' | 'SMA' = userLabschoolLevel === 'SMP' ? 'SMP' : 'SMA';
      const meetingItem: LearningJournalMeeting = {
        id: `jm-${Date.now()}`,
        meetingNumber: currentJournals.length + 1,
        date: new Date().toISOString().split('T')[0],
        timeRange: '15:30 - 17:30',
        durationMinutes: Number(newJournal.durationMinutes) || 60,
        level: effectiveLvl,
        targetCampus: newJournal.targetCampus || (effectiveLvl === 'SMP' ? 'SMP Labschool Rawamangun' : 'SMA Labschool Kebayoran'),
        subtestCode: newJournal.subject.startsWith('PK') ? 'PK' : newJournal.subject.startsWith('KV') ? 'KV' : newJournal.subject.startsWith('PM') ? 'PM' : newJournal.subject.startsWith('KA') ? 'KA' : 'SK',
        subjectName: newJournal.subject,
        topicTitle: newJournal.topic.trim(),
        subtopics: [newJournal.topic.trim()],
        competencyTarget: 'Pemahaman konsep dasar dan latihan soal seleksi PSB Labschool 2026',
        teachingMethod: 'Problem-Based Learning & Speed Drills',
        instructorName: 'Tutor Belajar Mandiri Labschool',
        instructorRole: 'Master Tutor Labschool',
        attendanceStatus: 'HADIR',
        progress: 'SUDAH',
        comprehensionRating: Number(newJournal.rating) || 5,
        comprehensionPercentage: (Number(newJournal.rating) || 5) * 20,
        studentNotes: newJournal.notes || 'Mencatat pokok bahasan materi secara mandiri.',
        teacherEvaluation: 'Siswa aktif, konsisten dan siap menghadapi seleksi PSB Labschool 2026.',
        homeworkTask: `Latihan soal mandiri: ${newJournal.topic}`,
        homeworkStatus: 'SEMPURNA',
        sessionType: 'INDIVIDUAL',
        studentId: user?.id,
        studentName: user?.name || 'Siswa Labschool',
        studentNis: user?.nis || (effectiveLvl === 'SMP' ? '20267001' : '20261011'),
        studentClass: user?.className || `${effectiveLvl}-LABSCHOOL`,
        attendees: [{
          studentId: user?.id,
          studentName: user?.name || 'Siswa Labschool',
          studentNis: user?.nis || (effectiveLvl === 'SMP' ? '20267001' : '20261011'),
          studentClass: user?.className || `${effectiveLvl}-LABSCHOOL`,
          status: 'HADIR',
          note: ''
        }],
        totalAttendees: 1,
        presentCount: 1
      };
      currentJournals.unshift(meetingItem);
      saveStoredJournals(currentJournals);
    } catch (err) {
      console.warn('Failed to sync journal to global storage:', err);
    }

    setNewJournal({
      subject: 'PK (Pengetahuan Kuantitatif)',
      topic: '',
      durationMinutes: 60,
      rating: 5,
      notes: '',
      targetCampus: 'Labschool Kebayoran'
    });
  };

  const deleteJournalEntry = (id: string) => {
    if (user.role === 'student') return; // Fitur CRUD mutasi nonaktif untuk siswa
    const updated = journalList.filter(item => item.id !== id);
    setJournalList(updated);
    try {
      localStorage.setItem(`labschool_journal_${user.id || 'guest'}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Mini Quiz Interactive State covering ALL 5 SUBTESTS (PK, KV, PM, KA, SK)
  const quizQuestions = [
    {
      subtest: 'PK (Pengetahuan Kuantitatif)',
      q: 'Jika pola bilangan: 3, 5, 9, 17, 33, ... maka bilangan selanjutnya adalah?',
      options: ['49', '57', '65', '73'],
      ans: 2,
      explanation: 'Pola pertambahan selisih adalah +2, +4, +8, +16, +32. Jadi 33 + 32 = 65.'
    },
    {
      subtest: 'KV (Kemampuan Verbal - B. Indonesia)',
      q: 'Manakah pasangan kata yang memiliki hubungan analogi paling setara dengan: GURU : SEKOLAH?',
      options: ['Dokter : Pasien', 'Hakim : Pengadilan', 'Petani : Padi', 'Koki : Makanan'],
      ans: 1,
      explanation: 'GURU bertugas di SEKOLAH, sebagaimana HAKIM bertugas di PENGADILAN (Profesi : Tempat Bekerja).'
    },
    {
      subtest: 'KV (Kemampuan Verbal - B. Inggris)',
      q: 'Find the closest synonym for the word: "ACCURATE"',
      options: ['Approximate', 'Precise', 'Doubtful', 'Complex'],
      ans: 1,
      explanation: '"Accurate" means exact and correct. "Precise" is the closest synonym.'
    },
    {
      subtest: 'PM (Pemahaman Membaca)',
      q: 'Sebuah paragraf yang kalimat utamanya terletak di awal paragraf dan diikuti oleh kalimat-kalimat penjelas dinamakan paragraf...',
      options: ['Induktif', 'Deduktif', 'Campuran', 'Naratif Deskriptif'],
      ans: 1,
      explanation: 'Paragraf Deduktif menempatkan ide pokok di awal kalimat kemudian dijabarkan rinciannya.'
    },
    {
      subtest: 'KA (Kemampuan Akademik - IPA)',
      q: 'Organel sel yang berfungsi sebagai pusat pembangkit energi (respirasi sel) adalah...',
      options: ['Ribosom', 'Mitokondria', 'Badan Golgi', 'Kloroplas'],
      ans: 1,
      explanation: 'Mitokondria adalah "powerhouse of the cell" yang memproduksi ATP melalui respirasi seluler.'
    },
    {
      subtest: 'KA (Kemampuan Akademik - IPS)',
      q: 'Secara astronomis, letak wilayah Indonesia berada pada 6°LU - 11°LS, sehingga menyebabkan Indonesia memiliki iklim...',
      options: ['Subtropis', 'Tropis', 'Kutub', 'Sedang'],
      ans: 1,
      explanation: 'Letak di sekitar garis khatulistiwa membuat Indonesia beriklim tropis dengan curah hujan melimpah dan sinar matahari sepanjang tahun.'
    },
    {
      subtest: 'SK (Survei Karakter)',
      q: 'Ketika mengerjakan tugas proyek kelompok, salah satu rekan Anda sakit mendadak. Respon terbaik yang mencerminkan empati dan gotong royong adalah...',
      options: [
        'Membiarkan bagian tugasnya kosong',
        'Mengeluarkan rekan tersebut dari daftar anggota kelompok',
        'Membagi tugas rekan yang sakit secara adil bersama anggota lain agar selesai tepat waktu',
        'Mengerjakan sendiri dan meminta nilai khusus dari guru'
      ],
      ans: 2,
      explanation: 'Sikap gotong royong dan kepemimpinan etis ditunjukkan dengan berinisiatif menyelesaikan kendala tim secara kolaboratif.'
    }
  ];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizAnswer = (optionIdx: number) => {
    if (isQuizAnswered) return;
    setSelectedQuizAnswer(optionIdx);
    setIsQuizAnswered(true);
    if (optionIdx === quizQuestions[currentQuizIndex].ans) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    setIsQuizAnswered(false);
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setCurrentQuizIndex(0);
    }
  };

  // User Labschool Level (SMP, SMA, or ALL)
  const userLabschoolLevel = useMemo(() => {
    return getUserLabschoolLevel(user);
  }, [user]);

  // DYNAMIC MENU ITEMS (Filtered by student / user class)
  const dashboardMenuItems = useMemo(() => {
    const allItems = [
      {
        id: 'psb_smp',
        title: 'PSB SMP LABSCHOOL',
        icon: GraduationCap,
        theme: 'from-amber-600/20 via-orange-600/10 to-slate-900 border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white shadow-amber-500/5',
        iconBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
        onClick: () => onNavigateTab('labschool_psb_smp')
      },
      {
        id: 'psb_sma',
        title: 'PSB SMA LABSCHOOL',
        icon: Award,
        theme: 'from-emerald-600/20 via-teal-600/10 to-slate-900 border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white shadow-emerald-500/5',
        iconBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
        onClick: () => onNavigateTab('labschool_psb_sma')
      },
      {
        id: 'labschool_pilihan',
        title: 'KAMPUS LABSCHOOL',
        icon: Compass,
        theme: 'from-blue-600/20 via-indigo-600/10 to-slate-900 border-blue-500/40 hover:border-blue-400 text-blue-300 hover:text-white shadow-blue-500/5',
        iconBg: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
        onClick: () => onNavigateTab('labschool_kampus')
      },
      {
        id: 'tryout',
        title: 'TRYOUT CBT LABSCHOOL',
        icon: FileCheck2,
        theme: 'from-purple-600/20 via-violet-600/10 to-slate-900 border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white shadow-purple-500/5',
        iconBg: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
        onClick: () => onNavigateTab('exams')
      },
      {
        id: 'silabus',
        title: 'MODUL & SILABUS',
        icon: BookOpen,
        theme: 'from-cyan-600/20 via-sky-600/10 to-slate-900 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white shadow-cyan-500/5',
        iconBg: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
        onClick: () => onNavigateTab('labschool_silabus')
      },
      {
        id: 'quiz',
        title: 'QUIZ CEPAT SUBTEST',
        icon: Zap,
        theme: 'from-rose-600/20 via-pink-600/10 to-slate-900 border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white shadow-rose-500/5',
        iconBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
        onClick: () => setIsQuizModalOpen(true)
      },
      {
        id: 'jurnal_belajar',
        title: 'JURNAL BELAJAR',
        icon: Calendar,
        theme: 'from-yellow-500/20 via-amber-600/10 to-slate-900 border-yellow-500/40 hover:border-yellow-400 text-yellow-300 hover:text-white shadow-yellow-500/5',
        iconBg: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
        onClick: () => setIsJournalModalOpen(true)
      },
      {
        id: 'laporan_analisis',
        title: 'LAPORAN & ANALISIS',
        icon: TrendingUp,
        theme: 'from-teal-600/20 via-emerald-600/10 to-slate-900 border-teal-500/40 hover:border-teal-400 text-teal-300 hover:text-white shadow-teal-500/5',
        iconBg: 'bg-teal-500/20 border-teal-500/30 text-teal-300',
        onClick: () => onNavigateTab('tryout_reports')
      }
    ];

    if (userLabschoolLevel === 'SMP') {
      return allItems.filter(item => item.id !== 'psb_sma');
    }
    if (userLabschoolLevel === 'SMA') {
      return allItems.filter(item => item.id !== 'psb_smp');
    }
    return allItems;
  }, [userLabschoolLevel, onNavigateTab]);

  const keySuccessTips = [
    {
      title: '1. Kuasai PK (Pengetahuan Kuantitatif) & Aritmatika',
      text: 'Soal kuantitatif Labschool menguji logika berhitung cepat, perbandingan, aljabar, dan deret angka dengan batasan waktu yang ketat.'
    },
    {
      title: '2. Asah KV (Kemampuan Verbal) & PM (Pemahaman Membaca)',
      text: 'Tingkatkan literasi membaca kritis baik dalam Bahasa Indonesia maupun English Comprehension untuk menangkap gagasan utama dan penarikan kesimpulan.'
    },
    {
      title: '3. Kuasai KA (Kemampuan Akademik: IPA & IPS)',
      text: 'Pemahaman konsep sains terpadu (Fisika, Biologi) dan fenomena sosial (Geografi, Sejarah, Ekonomi) menjadi pembeda nilai pada passing grade tinggi.'
    },
    {
      title: '4. Terapkan Nilai Unggul pada SK (Survei Karakter)',
      text: 'Survei karakter menilai integritas, nasionalisme, kemandirian, gotong royong, dan kesiapan adaptasi dengan budaya berprestasi Labschool.'
    }
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HALAMAN UTAMA: JUDUL + COUNTDOWN KECIL/BESAR + LRI GAUGE SETENGAH LINGKARAN */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 border border-blue-800/40 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row: Judul Halaman & Deskripsi */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Program Intensif & Akselerasi Seleksi Masuk Labschool</span>
            </div>

            {/* JUDUL HALAMAN: SUKSES SMP-SMA IMPIAN 2027 */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              SUKSES SMP-SMA <span className="text-amber-300 font-black drop-shadow-md">IMPIAN 2027</span>
            </h1>

            {/* DESKRIPSI (TANPA KATA SELAMAT DATANG) */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              Portal terpadu akselerasi dan persiapan intensif seleksi masuk SMP & SMA Labschool 2027 (Rawamangun, Kebayoran, Cibubur, Cirendeu, Bintaro). Lengkap dengan penguasaan 5 subtest resmi: <strong className="text-white font-bold">PK (Pengetahuan Kuantitatif)</strong>, <strong className="text-white font-bold">KV (Kemampuan Verbal: B. Indo & B. Inggris)</strong>, <strong className="text-white font-bold">PM (Pemahaman Membaca: B. Indo & B. Inggris)</strong>, <strong className="text-white font-bold">KA (Kemampuan Akademik: IPA & IPS)</strong>, dan <strong className="text-white font-bold">SK (Survei Karakter)</strong>.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DI BAWAH JUDUL HALAMAN: GRAFIK LRI DENGAN KESIAPAN BERSEBELAHAN SECARA HORIZONTAL + COUNTDOWN */}
        {/* ========================================================================= */}
        <div className="relative z-10">
          <LabschoolCountdownLRI
            user={user}
            onOpenRoadmap={() => onNavigateTab('labschool_roadmap')}
            onOpenTryout={() => onNavigateTab('exams')}
            onOpenJournal={() => setIsJournalModalOpen(true)}
            onSelectSubtest={(code) => setActiveSubtestExplorerCode(code)}
          />
        </div>

        {/* ========================================================================= */}
        {/* 8 MENU AKSELERASI SUKSES LABSCHOOL 2027 - TEPAT DI BAWAH HALAMAN JUDUL (SATU GROUP) */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-800/80 pt-5 relative z-10 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <span>MENU AKSELERASI SUKSES LABSCHOOL 2027</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Akses cepat persiapan PSB, pendaftaran, silabus 5 subtest, tryout CBT, dan evaluasi hasil belajar
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/80 text-cyan-300 border border-cyan-500/30 font-mono shrink-0 self-start sm:self-auto">
              {dashboardMenuItems.length} Menu Akselerasi
            </span>
          </div>

          {/* 8 MENU ITEMS - 4 COLUMNS ON DESKTOP FOR PERFECT SYMMETRY & TIDINESS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            {dashboardMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full group text-left px-3.5 py-3 rounded-2xl bg-gradient-to-r ${item.theme} border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex items-center justify-between gap-2.5 min-h-[60px] cursor-pointer`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl border ${item.iconBg} group-hover:scale-110 transition-transform shrink-0 shadow-sm`}>
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    {/* HANYA TAMPILAN JUDUL MENU */}
                    <span className="text-xs sm:text-[13px] font-black text-white group-hover:text-white tracking-wide truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-lg bg-slate-900/80 border border-slate-700/60 group-hover:bg-white group-hover:text-slate-950 text-slate-400 flex items-center justify-center shrink-0 transition-all">
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEKSI SUBTEST RESMI LABSCHOOL: PK, KV, PM, KA, SK (REQUIREMENT) */}
      {/* ========================================================================= */}
      <LabschoolSubtestExplorer
        initialSubtestCode={activeSubtestExplorerCode}
        onStartExam={(code) => {
          onNavigateTab('exams');
        }}
      />

      {/* ========================================================================= */}
      {/* 3. STRATEGY & KEY TIPS SECTION BASED ON 5 SUBTESTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Key Success Tips */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">4 Kunci Sukses Lolos Seleksi Labschool</h3>
          </div>

          <div className="space-y-3">
            {keySuccessTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-100">{tip.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Struktur Bobot 5 Subtest Ujian Seleksi */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
            <Target className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Komposisi Bobot 5 Subtest PSB Labschool</h3>
          </div>

          <div className="space-y-2.5">
            {LABSCHOOL_SUBTESTS.map((st) => (
              <div key={st.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${st.color.badge}`}>
                      {st.code}
                    </span>
                    <span className="font-semibold text-slate-200">{st.title}</span>
                  </div>
                  <span className={`font-bold font-mono ${st.color.text}`}>{st.weightPercentage}% Bobot</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {st.subparts.map(sp => sp.name).join(' • ')}
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${st.color.gradient} h-full`}
                    style={{ width: `${st.weightPercentage * 4}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: JURNAL BELAJAR */}
      {/* ========================================================================= */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsJournalModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Jurnal Belajar Harian Siswa</h3>
                <p className="text-xs text-slate-400">Catat topik yang dipelajari berdasarkan 5 subtest, durasi, target pemahaman, dan refleksi.</p>
              </div>
            </div>

            {/* Add New Entry Form (Staff/Guru/Admin Only) or Read-Only Banner for Students */}
            {user.role !== 'student' ? (
              <form onSubmit={saveJournalEntry} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Tambah Catatan Belajar Baru
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Mata Uji / Subtest</label>
                    <select
                      value={newJournal.subject}
                      onChange={(e) => setNewJournal({ ...newJournal, subject: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="PK (Pengetahuan Kuantitatif)">PK (Pengetahuan Kuantitatif)</option>
                      <option value="KV - Verbal B. Indonesia">KV - Verbal B. Indonesia</option>
                      <option value="KV - Verbal B. Inggris">KV - Verbal B. Inggris</option>
                      <option value="PM - Pemahaman Membaca B. Indo">PM - Pemahaman Membaca B. Indo</option>
                      <option value="PM - Reading Comprehension B. Eng">PM - Reading Comprehension B. Eng</option>
                      <option value="KA - IPA (Fisika, Biologi, Kimia)">KA - IPA (Fisika, Biologi, Kimia)</option>
                      <option value="KA - IPS (Geografi, Sejarah, Sosiologi)">KA - IPS (Geografi, Sejarah, Sosiologi)</option>
                      <option value="SK (Survei Karakter)">SK (Survei Karakter)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Target Kampus</label>
                    <select
                      value={newJournal.targetCampus}
                      onChange={(e) => setNewJournal({ ...newJournal, targetCampus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="Labschool Kebayoran">Labschool Kebayoran</option>
                      <option value="Labschool Rawamangun">Labschool Rawamangun</option>
                      <option value="Labschool Cibubur">Labschool Cibubur</option>
                      <option value="Labschool Cirendeu">Labschool Cirendeu</option>
                      <option value="Labschool Bintaro Sektor 9">Labschool Bintaro Sektor 9</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Pokok Bahasan / Topik Materi</label>
                    <input
                      type="text"
                      value={newJournal.topic}
                      onChange={(e) => setNewJournal({ ...newJournal, topic: e.target.value })}
                      placeholder="Misal: Deret Aritmatika Bertingkat & SPLDV"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Durasi Belajar (Menit)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={newJournal.durationMinutes}
                      onChange={(e) => setNewJournal({ ...newJournal, durationMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Catatan / Refleksi Belajar</label>
                  <textarea
                    rows={2}
                    value={newJournal.notes}
                    onChange={(e) => setNewJournal({ ...newJournal, notes: e.target.value })}
                    placeholder="Tuliskan kendala, rumus penting, atau hal yang masih perlu ditanyakan ke guru..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Simpan ke Jurnal Belajar
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-300">Mode Siswa (Hanya Lihat / Read-Only)</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Siswa tidak diizinkan melakukan perubahan data jurnal (tambah, ubah, atau hapus). Seluruh catatan pertemuan dan evaluasi belajar dikelola serta diverifikasi oleh Guru/Tutor Labschool.
                  </p>
                </div>
              </div>
            )}

            {/* List of Entries */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Riwayat Catatan Belajar ({journalList.length})</span>
                <span className="text-[11px] text-slate-500">Tersimpan secara lokal</span>
              </h4>

              {journalList.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">Belum ada catatan belajar yang disimpan.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {journalList.map(item => (
                    <div key={item.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            {item.subject}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                          <span className="text-[11px] text-slate-400">• {item.durationMinutes} mnt</span>
                        </div>
                        <p className="text-xs font-bold text-white">{item.topic}</p>
                        {item.notes && <p className="text-[11px] text-slate-300 italic">{item.notes}</p>}
                        <div className="flex items-center gap-1 text-yellow-400 pt-0.5">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      {user.role !== 'student' && (
                        <button
                          onClick={() => deleteJournalEntry(item.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Hapus Catatan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsJournalModalOpen(false);
                  onNavigateTab('labschool_jurnal');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buka Panel Jurnal & Analisis Lengkap ➔</span>
              </button>
              <button
                type="button"
                onClick={() => setIsJournalModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SILABUS 5 SUBTEST LABSCHOOL */}
      {/* ========================================================================= */}
      {isSyllabusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsSyllabusModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Silabus Kurikulum 5 Subtest Seleksi Labschool</h3>
                <p className="text-xs text-slate-400">Rincian cakupan materi resmi untuk PK, KV (Indo & Eng), PM (Indo & Eng), KA (IPA & IPS), dan SK.</p>
              </div>
            </div>

            <div className="space-y-3">
              {LABSCHOOL_SUBTESTS.map((st) => (
                <div key={st.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg ${st.color.badge}`}>
                        {st.code}
                      </span>
                      <strong className="text-sm text-white">{st.title}</strong>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Bobot {st.weightPercentage}% • {st.totalQuestions} Soal
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">{st.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {st.subparts.map(sp => (
                      <div key={sp.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-cyan-300 block">{sp.name} ({sp.code})</span>
                        <ul className="text-[11px] text-slate-400 space-y-0.5">
                          {sp.topics.map((top, tIdx) => (
                            <li key={tIdx}>• {top}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSyllabusModalOpen(false);
                    onNavigateTab('labschool_silabus');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <BookOpen className="w-4 h-4" /> Buka Timeline Silabus (Topik 1, 2...)
                </button>
                <button
                  onClick={() => {
                    setIsSyllabusModalOpen(false);
                    onNavigateTab('labschool_roadmap');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-cyan-400" /> Buka Roadmap
                </button>
              </div>
              <button
                onClick={() => setIsSyllabusModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUIZ LATIHAN CEPAT (5 SUBTEST STANDAR LABSCHOOL) */}
      {/* ========================================================================= */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 space-y-5">
            <button
              onClick={() => setIsQuizModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quiz Cepat Standar 5 Subtest</h3>
                  <p className="text-xs text-slate-400">Drill soal interaktif PK, KV, PM, KA, dan SK.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                {currentQuizIndex + 1} / {quizQuestions.length}
              </span>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {quizQuestions[currentQuizIndex].subtest}
              </span>

              <p className="text-sm font-semibold text-white leading-relaxed pt-1">
                {quizQuestions[currentQuizIndex].q}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                  let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700';
                  if (isQuizAnswered) {
                    if (idx === quizQuestions[currentQuizIndex].ans) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (idx === selectedQuizAnswer) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={isQuizAnswered}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>
                        <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong> {opt}
                      </span>
                      {isQuizAnswered && idx === quizQuestions[currentQuizIndex].ans && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isQuizAnswered && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 space-y-1">
                  <p className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" /> Pembahasan Soal:
                  </p>
                  <p className="leading-relaxed text-slate-300">{quizQuestions[currentQuizIndex].explanation}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Skor Benar: <strong className="text-emerald-400 font-bold">{quizScore}</strong>
              </span>

              <div className="flex items-center gap-2">
                {isQuizAnswered ? (
                  <button
                    onClick={nextQuizQuestion}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1"
                  >
                    <span>{currentQuizIndex + 1 < quizQuestions.length ? 'Soal Berikutnya' : 'Selesai Drill'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsQuizModalOpen(false);
                      onNavigateTab('exams');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
                  >
                    Buka Tryout CBT Penuh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DATA 5 KAMPUS LABSCHOOL PILIHAN & ADMIN CRUD DENGAN PASSING GRADE */}
      {/* ========================================================================= */}
      <LabschoolCampusModal
        isOpen={isCampusModalOpen}
        onClose={() => setIsCampusModalOpen(false)}
        campuses={campuses}
        setCampuses={setCampuses}
        user={user}
        onNavigateTab={onNavigateTab}
        initialSelectedCampusId={selectedCampusIdForModal}
      />

      {/* ========================================================================= */}
      {/* MODAL 5: PENGATURAN EDIT GAMBAR KAMPUS LABSCHOOL (REQUIREMENT) */}
      {/* ========================================================================= */}
      <LabschoolImageEditModal
        isOpen={isImageEditModalOpen}
        onClose={() => setIsImageEditModalOpen(false)}
        campuses={campuses}
        setCampuses={setCampuses}
        initialCampusId={selectedCampusIdForImageEdit}
      />

    </div>
  );
};
