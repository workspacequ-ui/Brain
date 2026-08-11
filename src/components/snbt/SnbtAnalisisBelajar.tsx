import React, { useState, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SnbtStudentProfile,
  SNBT_SUBTEST_LIST
} from './snbtData';
import {
  SnbtLearningJournalEntry,
  loadStoredSnbtJournals,
  saveStoredSnbtJournals,
  calculateStudentJournalSummary,
  formatSnbtJournalWhatsAppMessage,
  SNBT_ACTIVITY_TYPE_METAS,
  SNBT_COMPREHENSION_METAS,
  SnbtComprehensionLevel
} from './snbtJournalData';
import {
  SnbtSyllabusModule,
  INITIAL_SNBT_SYLLABUS_MODULES,
  SNBT_7_SUBTEST_METAS,
  SnbtSubtestCode
} from './snbtSyllabusData';
import { SnbtJournalModal } from './SnbtJournalModal';
import { SnbtModuleDetailModal } from './SnbtModuleDetailModal';
import {
  SnbtTeachingJournalPreviewModal,
  JournalPreviewViewMode
} from './SnbtTeachingJournalPreviewModal';
import {
  BookOpen,
  BrainCircuit,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Activity,
  Layers,
  Award,
  ChevronRight,
  BookCheck,
  CheckSquare,
  UserCheck,
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  Share2,
  Printer,
  Calendar,
  Check,
  ArrowUpRight,
  Users,
  Grid,
  ListFilter,
  Eye,
  FileText,
  FileSpreadsheet,
  BarChart2,
  PieChart,
  ListChecks,
  GraduationCap,
  Compass,
  HelpCircle,
  Info,
  SlidersHorizontal,
  Download
} from 'lucide-react';

interface SnbtAnalisisBelajarProps {
  user: User;
  students: SnbtStudentProfile[];
  selectedStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  isFocusMode?: boolean;
  onNavigateTab?: (tab: SidebarTab) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export type SnbtBelajarSubTab = 'jurnal' | 'matrix' | 'ringkasan' | 'detail';

export const SnbtAnalisisBelajar: React.FC<SnbtAnalisisBelajarProps> = ({
  user,
  students,
  selectedStudentId,
  onSelectStudent,
  isFocusMode = true,
  onNavigateTab,
  onShowToast
}) => {
  const isStudent = user?.role === 'student';

  // Navigation sub-tab inside Analisis Belajar
  const [activeSubTab, setActiveSubTab] = useState<SnbtBelajarSubTab>('jurnal');

  // Journals State
  const [journals, setJournals] = useState<SnbtLearningJournalEntry[]>(() => loadStoredSnbtJournals());

  // Modal States
  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [editingJournal, setEditingJournal] = useState<SnbtLearningJournalEntry | null>(null);
  const [selectedModuleForModal, setSelectedModuleForModal] = useState<string | undefined>(undefined);
  const [selectedSubtestForModal, setSelectedSubtestForModal] = useState<SnbtSubtestCode | undefined>(undefined);

  // Module Blueprint Preview Modal
  const [previewModule, setPreviewModule] = useState<SnbtSyllabusModule | null>(null);

  // Teaching Journal Preview Modal States
  const [isTeachingJournalPreviewOpen, setIsTeachingJournalPreviewOpen] = useState<boolean>(false);
  const [previewJournalId, setPreviewJournalId] = useState<string | undefined>(undefined);
  const [previewJournalMode, setPreviewJournalMode] = useState<JournalPreviewViewMode>('STUDENT_CUMULATIVE');

  // Filters & Search for Journals
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState<string>('ALL');
  const [selectedComprehensionFilter, setSelectedComprehensionFilter] = useState<string>('ALL');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewScope, setViewScope] = useState<'STUDENT' | 'CLASS'>('STUDENT');
  const [journalLayoutMode, setJournalLayoutMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // WhatsApp Copied Feedback
  const [copiedJournalId, setCopiedJournalId] = useState<string | null>(null);

  // Active student object
  const activeStudent = useMemo(() => {
    if (!students || students.length === 0) return null;
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  // Student-specific journal statistics
  const studentJournalSummary = useMemo(() => {
    if (!activeStudent) {
      return calculateStudentJournalSummary('snbt-std-01', journals, INITIAL_SNBT_SYLLABUS_MODULES);
    }
    return calculateStudentJournalSummary(activeStudent.id, journals, INITIAL_SNBT_SYLLABUS_MODULES);
  }, [activeStudent, journals]);

  // Filtered Journals List
  const filteredJournals = useMemo(() => {
    return journals.filter(j => {
      // Filter by Student Scope
      if (viewScope === 'STUDENT' && activeStudent) {
        if (j.studentId !== activeStudent.id) return false;
      }

      // Filter by Subtest
      if (selectedSubtestFilter !== 'ALL') {
        if (j.subtestCode !== selectedSubtestFilter && j.category !== selectedSubtestFilter) {
          return false;
        }
      }

      // Filter by Comprehension
      if (selectedComprehensionFilter !== 'ALL') {
        if (j.comprehensionLevel !== selectedComprehensionFilter) return false;
      }

      // Filter by Activity Type
      if (selectedActivityFilter !== 'ALL') {
        if (j.learningActivityType !== selectedActivityFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = j.moduleTitle?.toLowerCase().includes(q) || j.syllabusTitle.toLowerCase().includes(q);
        const matchCode = j.moduleCode?.toLowerCase().includes(q) || j.subtestCode.toLowerCase().includes(q);
        const matchTeacher = j.instructorName.toLowerCase().includes(q);
        const matchNotes = j.studentReflectionNotes.toLowerCase().includes(q) || j.tutorFeedback.toLowerCase().includes(q);
        const matchStudent = j.studentName.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchTeacher && !matchNotes && !matchStudent) {
          return false;
        }
      }

      return true;
    });
  }, [
    journals,
    viewScope,
    activeStudent,
    selectedSubtestFilter,
    selectedComprehensionFilter,
    selectedActivityFilter,
    searchQuery
  ]);

  // Detail Sub-Tab Specific State
  const [detailSubtestFilter, setDetailSubtestFilter] = useState<string>('ALL');
  const [detailComprehensionFilter, setDetailComprehensionFilter] = useState<string>('ALL');
  const [detailSearchQuery, setDetailSearchQuery] = useState<string>('');
  const [detailSortBy, setDetailSortBy] = useState<'MEETING_DESC' | 'MEETING_ASC' | 'ACCURACY_DESC' | 'ACCURACY_ASC'>('MEETING_DESC');

  // Subtest Detailed Analytics for the Detail Tab
  const subtestDetailedStats = useMemo(() => {
    return SNBT_7_SUBTEST_METAS.map(subMeta => {
      const subJournals = journals.filter(j => (!activeStudent || j.studentId === activeStudent.id) && j.subtestCode === subMeta.code);
      const subModules = INITIAL_SNBT_SYLLABUS_MODULES.filter(m => m.subtestCode === subMeta.code);
      
      const coveredModuleIds = new Set<string>();
      let totalQuestions = 0;
      let correctQuestions = 0;
      let totalComprehension = 0;
      let totalMinutes = 0;

      subJournals.forEach(j => {
        if (j.moduleId) coveredModuleIds.add(j.moduleId);
        if (j.moduleCode) coveredModuleIds.add(j.moduleCode);
        totalQuestions += j.practiceQuestionsCount || 0;
        correctQuestions += j.practiceQuestionsCorrect || 0;
        totalComprehension += j.comprehensionPercentage || 80;
        totalMinutes += j.durationMinutes || 90;
      });

      const completedCount = subModules.filter(m => coveredModuleIds.has(m.id) || coveredModuleIds.has(m.code)).length;
      const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : (subJournals.length > 0 ? 80 : 0);
      const avgComprehension = subJournals.length > 0 ? Math.round(totalComprehension / subJournals.length) : (subJournals.length > 0 ? 85 : 0);
      const stdScore = activeStudent?.subtestScores.find(s => s.code === subMeta.code)?.score || 0;

      return {
        meta: subMeta,
        modules: subModules,
        sessionsCount: subJournals.length,
        completedModulesCount: completedCount,
        totalModulesCount: subModules.length,
        completionRate: Math.round((completedCount / (subModules.length || 1)) * 100),
        totalQuestions,
        correctQuestions,
        accuracy,
        avgComprehension,
        totalMinutes,
        stdScore,
        coveredModuleIds
      };
    });
  }, [journals, activeStudent]);

  // Filtered Journals for the Detail Tab
  const detailFilteredJournals = useMemo(() => {
    if (!activeStudent) return [];
    let list = journals.filter(j => j.studentId === activeStudent.id);

    if (detailSubtestFilter !== 'ALL') {
      list = list.filter(j => j.subtestCode === detailSubtestFilter || j.category === detailSubtestFilter);
    }

    if (detailComprehensionFilter !== 'ALL') {
      list = list.filter(j => j.comprehensionLevel === detailComprehensionFilter);
    }

    if (detailSearchQuery.trim()) {
      const q = detailSearchQuery.toLowerCase();
      list = list.filter(j => 
        j.moduleTitle?.toLowerCase().includes(q) ||
        j.syllabusTitle.toLowerCase().includes(q) ||
        j.subtestCode.toLowerCase().includes(q) ||
        j.subtestName.toLowerCase().includes(q) ||
        j.instructorName.toLowerCase().includes(q) ||
        j.studentReflectionNotes.toLowerCase().includes(q) ||
        j.tutorFeedback.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (detailSortBy === 'MEETING_DESC') return b.meetingNumber - a.meetingNumber;
      if (detailSortBy === 'MEETING_ASC') return a.meetingNumber - b.meetingNumber;
      if (detailSortBy === 'ACCURACY_DESC') return (b.practiceAccuracy || 0) - (a.practiceAccuracy || 0);
      if (detailSortBy === 'ACCURACY_ASC') return (a.practiceAccuracy || 0) - (b.practiceAccuracy || 0);
      return 0;
    });
  }, [journals, activeStudent, detailSubtestFilter, detailComprehensionFilter, detailSearchQuery, detailSortBy]);

  // Learning Activity & Pattern Breakdown
  const learningActivityBreakdown = useMemo(() => {
    const studentJournals = journals.filter(j => !activeStudent || j.studentId === activeStudent.id);
    const total = studentJournals.length || 1;
    const drillCount = studentJournals.filter(j => j.learningActivityType === 'DRILL_SOAL').length;
    const theoryCount = studentJournals.filter(j => j.learningActivityType === 'TEORI_KONSEP').length;
    const hotsCount = studentJournals.filter(j => j.learningActivityType === 'BEDAH_HOTS').length;
    const reviewCount = studentJournals.filter(j => j.learningActivityType === 'REVIEW_TRYOUT').length;
    return {
      drillCount,
      drillPct: Math.round((drillCount / total) * 100),
      theoryCount,
      theoryPct: Math.round((theoryCount / total) * 100),
      hotsCount,
      hotsPct: Math.round((hotsCount / total) * 100),
      reviewCount,
      reviewPct: Math.round((reviewCount / total) * 100),
      total
    };
  }, [journals, activeStudent]);

  // Handlers for Journal CRUD
  const handleOpenAddJournal = (defaultModId?: string, defaultSub?: SnbtSubtestCode) => {
    if (isStudent) {
      notify('Fitur pencatatan dan penulisan jurnal belajar hanya dapat dilakukan oleh Guru / Tutor bimbingan.', 'info');
      return;
    }
    setEditingJournal(null);
    setSelectedModuleForModal(defaultModId);
    setSelectedSubtestForModal(defaultSub);
    setIsJournalModalOpen(true);
  };

  const handleOpenEditJournal = (jrn: SnbtLearningJournalEntry) => {
    if (isStudent) return;
    setEditingJournal(jrn);
    setSelectedModuleForModal(jrn.moduleId);
    setSelectedSubtestForModal(jrn.subtestCode);
    setIsJournalModalOpen(true);
  };

  const handleSaveJournal = (journal: SnbtLearningJournalEntry) => {
    if (isStudent) return;
    let updated: SnbtLearningJournalEntry[];
    const exists = journals.some(j => j.id === journal.id);

    if (exists) {
      updated = journals.map(j => (j.id === journal.id ? journal : j));
      notify(`Jurnal belajar pertemuan #${journal.meetingNumber} berhasil diperbarui!`, 'success');
    } else {
      updated = [journal, ...journals];
      notify(`Jurnal belajar pertemuan #${journal.meetingNumber} (${journal.moduleCode || journal.subtestCode}) berhasil ditambahkan!`, 'success');
    }

    setJournals(updated);
    saveStoredSnbtJournals(updated);
  };

  const handleDeleteJournal = (journalId: string, meetingNo: number) => {
    if (isStudent) return;
    if (window.confirm(`Hapus catatan jurnal belajar pertemuan #${meetingNo}?`)) {
      const updated = journals.filter(j => j.id !== journalId);
      setJournals(updated);
      saveStoredSnbtJournals(updated);
      notify(`Jurnal pertemuan #${meetingNo} telah dihapus.`, 'info');
    }
  };

  // WhatsApp Message Copy Handler
  const handleCopyWhatsApp = (journal: SnbtLearningJournalEntry) => {
    const text = formatSnbtJournalWhatsAppMessage(journal, activeStudent || undefined);
    navigator.clipboard.writeText(text);
    setCopiedJournalId(journal.id);
    notify(`Laporan Jurnal Belajar berhasil disalin ke format WhatsApp! Siap dikirim ke Orang Tua/Siswa.`, 'success');
    setTimeout(() => {
      setCopiedJournalId(null);
    }, 3000);
  };

  // Print Journals
  const handlePrintJournals = () => {
    handleOpenTeachingJournalPreview(
      undefined,
      viewScope === 'CLASS' ? 'TEACHER_CLASS_LOG' : 'STUDENT_CUMULATIVE'
    );
  };

  // Open Teaching Journal Preview Modal
  const handleOpenTeachingJournalPreview = (
    journalId?: string,
    mode: JournalPreviewViewMode = 'STUDENT_CUMULATIVE'
  ) => {
    setPreviewJournalId(journalId);
    setPreviewJournalMode(mode);
    setIsTeachingJournalPreviewOpen(true);
  };

  // Open Module Detail
  const handleOpenModuleDetail = (moduleIdOrCode: string) => {
    const found = INITIAL_SNBT_SYLLABUS_MODULES.find(
      m => m.id === moduleIdOrCode || m.code === moduleIdOrCode
    );
    if (found) {
      setPreviewModule(found);
    } else {
      notify(`Detail modul ${moduleIdOrCode} tidak ditemukan.`, 'info');
    }
  };

  // Weakness Database for Ringkasan Tab
  const allTopicDatabase = [
    {
      subtestCode: 'PK',
      subtest: 'Pengetahuan Kuantitatif (PK)',
      topic: 'Kecukupan Data Pernyataan (1) & (2)',
      errorRate: 48,
      severity: 'HIGH' as const,
      description: 'Menilai apakah informasi pada pernyataan (1) saja, (2) saja, atau keduanya cukup untuk menjawab pertanyaan.',
      remedialAction: 'Drill 30 butir soal tipe kecukupan data & workshop teknik eliminasi cepat.'
    },
    {
      subtestCode: 'PBM',
      subtest: 'Pemahaman Bacaan & Menulis (PBM)',
      topic: 'Kalimat Efektif & Struktur S-P-O-K',
      errorRate: 42,
      severity: 'HIGH' as const,
      description: 'Keparalelan bentuk kata, kelogisan makna, penghilangan subjek ganda, dan ketepatan konjungsi.',
      remedialAction: 'Review materi kaidah EYD V / PUEBI dan latihan deteksi kalimat rancu.'
    },
    {
      subtestCode: 'PM',
      subtest: 'Penalaran Matematika (PM)',
      topic: 'Pemodelan Kontekstual & Aritmatika Sosial',
      errorRate: 39,
      severity: 'HIGH' as const,
      description: 'Menerjemahkan narasi masalah nyata ke persamaan aljabar dan perhitungan bunga/diskon bertingkat.',
      remedialAction: 'Pemantapan alur translasi soal cerita ke bentuk matematis sistematis.'
    },
    {
      subtestCode: 'LBI',
      subtest: 'Literasi dalam Bahasa Indonesia (LBI)',
      topic: 'Sintesis Multi-Teks Saintifik & Opini',
      errorRate: 36,
      severity: 'MEDIUM' as const,
      description: 'Membandingkan perspektif, kesimpulan implisit, dan validitas argumen dari dua bacaan berbeda.',
      remedialAction: 'Latihan membaca cepat analitis dengan teknik skimming & anotasi poin utama.'
    },
    {
      subtestCode: 'LBE',
      subtest: 'Literasi dalam Bahasa Inggris (LBE)',
      topic: 'Contextual Inference & Author Tone',
      errorRate: 34,
      severity: 'MEDIUM' as const,
      description: 'Menyimpulkan makna tersirat (implied meaning) dan mengenali nada sikap penulis (skeptical, critical, approving).',
      remedialAction: 'Drill vocabulary akademik berbasis konteks dan analisis nada wacana artikel jurnal.'
    },
    {
      subtestCode: 'PU',
      subtest: 'Penalaran Umum (PU)',
      topic: 'Silogisme Kompleks & Penalaran Analitis',
      errorRate: 28,
      severity: 'LOW' as const,
      description: 'Penyusunan urutan logika posisi duduk, jadwal berkala, dan penarikan kesimpulan negasi bersyarat.',
      remedialAction: 'Latihan diagram Venn dan tabel matriks kondisi.'
    },
    {
      subtestCode: 'PPU',
      subtest: 'Pengetahuan & Pemahaman Umum (PPU)',
      topic: 'Makna Kontekstual Kata & Idiom Serapan',
      errorRate: 31,
      severity: 'LOW' as const,
      description: 'Menentukan sinonim, antonim, makna kiasan, dan bentukan kata bentukan asing.',
      remedialAction: 'Pembiasaan kuis harian 10 kosakata akademik dan tes sinonim cepat.'
    }
  ];

  const studentWeakTopics = useMemo(() => {
    if (!activeStudent || !activeStudent.subtestScores) return allTopicDatabase.slice(0, 5);
    const scoreMap = new Map<string, number>();
    activeStudent.subtestScores.forEach(s => scoreMap.set(s.code, s.score));
    return [...allTopicDatabase].sort((a, b) => {
      const scoreA = scoreMap.get(a.subtestCode) || 700;
      const scoreB = scoreMap.get(b.subtestCode) || 700;
      return scoreA - scoreB;
    });
  }, [activeStudent]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="snbt-analisis-belajar-section">
      {/* Active Monitored Student Spotlight Banner */}
      {activeStudent && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={activeStudent.avatar}
                alt={activeStudent.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-400" />
                    JURNAL BELAJAR & SILABUS TERINTEGRASI
                  </span>
                  <span className="text-xs font-mono text-slate-400">NIS: {activeStudent.nis}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    {activeStudent.group.replace(' (UTBK)', '')}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                  {activeStudent.name}
                </h2>

                <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>
                    Target #1: <strong className="text-amber-300">{activeStudent.targetPtn1} - {activeStudent.prodi1}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>PG: <strong className="text-white font-mono">{activeStudent.passingGrade1}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className={activeStudent.avgTryoutScore >= activeStudent.passingGrade1 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    Rerata IRT: {activeStudent.avgTryoutScore}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Scope Toggle */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap self-start lg:self-auto">
              <button
                type="button"
                onClick={() =>
                  handleOpenTeachingJournalPreview(
                    undefined,
                    viewScope === 'CLASS' ? 'TEACHER_CLASS_LOG' : 'STUDENT_CUMULATIVE'
                  )
                }
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shrink-0"
                title="Pratinjau Format Cetak Resmi Jurnal Mengajar & Belajar A4"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Pratinjau Jurnal Mengajar</span>
              </button>

              {!isStudent && (
                <button
                  type="button"
                  onClick={() => handleOpenAddJournal()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tulis Jurnal Belajar</span>
                </button>
              )}

              {/* View Scope Toggle */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewScope('STUDENT')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewScope === 'STUDENT'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{activeStudent.name.split(' ')[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewScope('CLASS')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewScope === 'CLASS'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Semua Siswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Summary Highlight KPI Cards from Journals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Total Jam Belajar Riil</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
            {studentJournalSummary.totalStudyHours} Jam
          </div>
          <div className="text-[10px] text-indigo-300 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            {studentJournalSummary.totalEntries} Sesi Jurnal Terdata
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Modul Silabus Tuntas</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
            {studentJournalSummary.completedModulesCount} / {studentJournalSummary.totalModulesCount}
          </div>
          <div className="text-[10px] text-purple-300 font-medium">
            {studentJournalSummary.coveragePercent}% Blueprint 7 Subtes
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Akurasi Drill Soal</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {studentJournalSummary.avgAccuracy}%
          </div>
          <div className="text-[10px] text-amber-300 font-medium">
            {studentJournalSummary.totalCorrect} dari {studentJournalSummary.totalQuestions} Butir Soal
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Rerata Penguasaan</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {studentJournalSummary.avgComprehension}%
          </div>
          <div className="text-[10px] text-emerald-300 font-medium">
            Status: Sangat Siap UTBK
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar inside Analisis Belajar */}
      <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('jurnal')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'jurnal'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>BUKU JURNAL BELAJAR</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/80 font-mono text-indigo-300">
              {filteredJournals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>PETA KETERCAPAIAN 28 MODUL SILABUS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ringkasan')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'ringkasan'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>POLA BELAJAR & TITIK LEMAH</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('detail')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'detail'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>DETAIL EVALUASI BELAJAR</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/80 font-mono text-emerald-300">
              {studentJournalSummary.coveragePercent}% Tuntas
            </span>
          </button>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('snbt_syllabus')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors self-end sm:self-auto shrink-0"
          >
            <span>Buka Silabus Nasional</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: BUKU JURNAL BELAJAR SISWA (DAFTAR, FILTER, KARTU & TABEL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'jurnal' && (
        <div className="space-y-5">
          {/* Filter & Search Toolbar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari modul, materi, subtopik, guru pengampu, refleksi..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Layout Switcher (Cards vs Table) & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setJournalLayoutMode('CARDS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      journalLayoutMode === 'CARDS'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Kartu Rinci</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJournalLayoutMode('TABLE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      journalLayoutMode === 'TABLE'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Tabel Rekap</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenTeachingJournalPreview(
                      undefined,
                      viewScope === 'CLASS' ? 'TEACHER_CLASS_LOG' : 'STUDENT_CUMULATIVE'
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  title="Pratinjau Jurnal Mengajar (Kop Surat Resmi, Cetak A4, Ekspor CSV & Filter)"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pratinjau Jurnal</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintJournals}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Cetak Jurnal Mengajar Langsung"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Jurnal</span>
                </button>

                {!isStudent && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddJournal()}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Entri Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* 7 Subtests Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setSelectedSubtestFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  selectedSubtestFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Semua Subtes ({journals.length})
              </button>

              {SNBT_7_SUBTEST_METAS.map(s => {
                const isSelected = selectedSubtestFilter === s.code;
                const count = journals.filter(j => j.subtestCode === s.code).length;
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setSelectedSubtestFilter(s.code)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{s.code}</span>
                    <span className="text-[10px] font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {filteredJournals.length === 0 && (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Belum Ada Catatan Jurnal yang Sesuai</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Belum ada rekaman sesi belajar untuk kriteria filter atau pencarian ini.
                </p>
              </div>
              {!isStudent ? (
                <button
                  type="button"
                  onClick={() => handleOpenAddJournal()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tulis Jurnal Belajar Sekarang</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-indigo-300 font-medium inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Catatan jurnal belajar akan terdata setelah guru/tutor menyelesaikan sesi pendampingan Anda.</span>
                </div>
              )}
            </div>
          )}

          {/* ================= LAYOUT MODE 1: CARDS ================= */}
          {journalLayoutMode === 'CARDS' && filteredJournals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJournals.map(jrn => {
                const subMeta = SNBT_7_SUBTEST_METAS.find(s => s.code === jrn.subtestCode);
                const actMeta = SNBT_ACTIVITY_TYPE_METAS[jrn.learningActivityType] || SNBT_ACTIVITY_TYPE_METAS.PEMBAHASAN_MODUL;
                const compMeta = SNBT_COMPREHENSION_METAS[jrn.comprehensionLevel] || SNBT_COMPREHENSION_METAS.PAHAM;
                const isCopied = copiedJournalId === jrn.id;

                return (
                  <div
                    key={jrn.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 shadow-xl transition-all space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Meeting #, Subtest Badge & Date */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                              P-{jrn.meetingNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${subMeta?.badgeBg || 'bg-blue-500/20 text-blue-300'}`}>
                              {jrn.subtestCode} • {jrn.subtestName}
                            </span>
                            {jrn.moduleDifficulty && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {jrn.moduleDifficulty}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-white mt-1.5 line-clamp-2">
                            {jrn.moduleTitle || jrn.syllabusTitle}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            {jrn.date}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                            {jrn.timeStart} - {jrn.timeEnd} ({jrn.durationMinutes}m)
                          </span>
                        </div>
                      </div>

                      {/* Student Badge (if viewing all students) */}
                      {viewScope === 'CLASS' && (
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Siswa:</span>
                          <span className="font-bold text-indigo-300">{jrn.studentName} ({jrn.nis})</span>
                        </div>
                      )}

                      {/* Module Code Badge & Quick Blueprint Opener */}
                      {jrn.moduleCode && (
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 shrink-0">
                              {jrn.moduleCode}
                            </span>
                            <span className="text-xs text-slate-300 truncate font-medium">
                              {jrn.moduleTitle}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenModuleDetail(jrn.moduleId || jrn.moduleCode || '')}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <span>Blueprint</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Subtopics Covered List */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Cakupan Subtopik:
                        </span>
                        <ul className="space-y-1">
                          {jrn.subtopicsCovered.map((sub, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span className="line-clamp-1">{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Performance & Comprehension Metric Chips */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block">Pemahaman</span>
                          <span className="text-xs font-black text-indigo-400 font-mono mt-0.5 block">
                            {jrn.comprehensionPercentage}%
                          </span>
                          <span className="text-[8px] text-slate-500 truncate block">
                            {jrn.comprehensionLevel.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block">Drill Soal</span>
                          <span className="text-xs font-black text-amber-400 font-mono mt-0.5 block">
                            {jrn.practiceQuestionsCorrect}/{jrn.practiceQuestionsCount}
                          </span>
                          <span className="text-[8px] text-amber-300 font-bold block">
                            {jrn.practiceAccuracy}% Akurat
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block">Aktivitas</span>
                          <span className="text-[10px] font-bold text-emerald-400 mt-0.5 truncate block">
                            {actMeta.label.split(' ')[0]}
                          </span>
                          <span className="text-[8px] text-slate-500 block">{jrn.attendanceStatus}</span>
                        </div>
                      </div>

                      {/* Student Reflection & Tutor Feedback Box */}
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Catatan Refleksi Siswa:</span>
                          <p className="text-[11px] text-slate-300 italic mt-0.5 leading-relaxed line-clamp-2">
                            "{jrn.studentReflectionNotes}"
                          </p>
                        </div>

                        <div className="pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Rekomendasi Guru ({jrn.instructorName}):
                          </span>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                            "{jrn.tutorFeedback}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 mt-2">
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">
                        {jrn.targetIrtImpact}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailSubtestFilter(jrn.subtestCode);
                            setActiveSubTab('detail');
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Buka Analisis Detail Subtes Ini"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenTeachingJournalPreview(jrn.id, 'SINGLE_SESSION')}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          title={`Pratinjau Jurnal Resmi Pertemuan #${jrn.meetingNumber}`}
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyWhatsApp(jrn)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          }`}
                          title="Salin Format WhatsApp Laporan Siswa"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isCopied ? 'Tersalin' : 'WA Laporan'}</span>
                        </button>

                        {!isStudent && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditJournal(jrn)}
                              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                              title="Edit Jurnal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteJournal(jrn.id, jrn.meetingNumber)}
                              className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                              title="Hapus Jurnal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= LAYOUT MODE 2: TABLE ================= */}
          {journalLayoutMode === 'TABLE' && filteredJournals.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Sesi / Tgl</th>
                      <th className="py-3.5 px-4">Subtes & Modul</th>
                      <th className="py-3.5 px-4">Topik & Subtopik Bahasan</th>
                      <th className="py-3.5 px-4">Guru / Tutor</th>
                      <th className="py-3.5 px-4 text-center">Pemahaman</th>
                      <th className="py-3.5 px-4 text-center">Drill Akurasi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredJournals.map(jrn => {
                      const subMeta = SNBT_7_SUBTEST_METAS.find(s => s.code === jrn.subtestCode);
                      return (
                        <tr key={jrn.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px]">
                              P-{jrn.meetingNumber}
                            </span>
                            <div className="font-mono text-[11px] text-slate-300 mt-1">{jrn.date}</div>
                            <div className="text-[10px] text-slate-500">{jrn.durationMinutes} mnt</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${subMeta?.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                                {jrn.subtestCode}
                              </span>
                              {jrn.moduleCode && (
                                <span className="font-mono text-[10px] text-indigo-300 font-bold">
                                  {jrn.moduleCode}
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-white text-xs mt-1 line-clamp-1 max-w-[200px]">
                              {jrn.moduleTitle || jrn.syllabusTitle}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 text-[11px] line-clamp-2 max-w-[280px]">
                              {jrn.subtopicsCovered.join(', ')}
                            </div>
                            <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold">
                              {jrn.targetIrtImpact}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-200 text-xs block">{jrn.instructorName}</span>
                            <span className="text-[10px] text-slate-400">{jrn.learningActivityType.replace('_', ' ')}</span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="text-sm font-black font-mono text-indigo-400 block">
                              {jrn.comprehensionPercentage}%
                            </span>
                            <span className="text-[9px] text-emerald-400 font-bold">
                              {jrn.comprehensionLevel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-amber-400 block">
                              {jrn.practiceQuestionsCorrect}/{jrn.practiceQuestionsCount}
                            </span>
                            <span className="text-[10px] font-bold text-amber-300">
                              {jrn.practiceAccuracy}%
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailSubtestFilter(jrn.subtestCode);
                                  setActiveSubTab('detail');
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
                                title="Buka Analisis Detail Subtes Ini"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenTeachingJournalPreview(jrn.id, 'SINGLE_SESSION')}
                                className="p-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/40 cursor-pointer shadow-sm"
                                title={`Pratinjau Jurnal Sesi #${jrn.meetingNumber}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyWhatsApp(jrn)}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 cursor-pointer"
                                title="Salin WA"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              {!isStudent && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditJournal(jrn)}
                                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJournal(jrn.id, jrn.meetingNumber)}
                                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PETA KETERCAPAIAN 28 MODUL SILABUS SNBT (MATRIX VIEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <Grid className="w-3.5 h-3.5" /> MATRIKS SILABUS & MODUL
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Standar Blueprint UTBK-SNBT 2026</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  Peta Ketercapaian 28 Modul Belajar
                  {activeStudent && (
                    <span className="text-indigo-300 text-sm font-semibold">({activeStudent.name})</span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lacak modul yang telah selesai dipelajari, jumlah sesi jurnal, tingkat pemahaman, dan tombol langsung untuk mencatat jurnal per modul.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 block">Ketercapaian Modul</span>
                  <span className="text-lg font-black text-purple-400 font-mono">
                    {studentJournalSummary.completedModulesCount} / {INITIAL_SNBT_SYLLABUS_MODULES.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix Grouped by 7 Subtests */}
            <div className="space-y-6 pt-2">
              {SNBT_7_SUBTEST_METAS.map(subMeta => {
                const subModules = INITIAL_SNBT_SYLLABUS_MODULES.filter(m => m.subtestCode === subMeta.code);

                return (
                  <div
                    key={subMeta.code}
                    className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4"
                  >
                    {/* Subtest Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${subMeta.badgeBg}`}>
                          {subMeta.code}
                        </span>
                        <div>
                          <h4 className="font-black text-white text-sm">{subMeta.name}</h4>
                          <span className="text-[10px] text-slate-400">{subMeta.categoryBadge} • Target Rerata IRT: {subMeta.targetScoreAverage}</span>
                        </div>
                      </div>

                      {!isStudent && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddJournal(undefined, subMeta.code)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tulis Jurnal {subMeta.code}</span>
                        </button>
                      )}
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {subModules.map(mod => {
                        // Check if student has journal for this module
                        const studentModuleJournals = journals.filter(
                          j =>
                            (activeStudent ? j.studentId === activeStudent.id : true) &&
                            (j.moduleId === mod.id || j.moduleCode === mod.code)
                        );
                        const isDone = studentModuleJournals.length > 0;
                        const latestJournal = studentModuleJournals[0];

                        return (
                          <div
                            key={mod.id}
                            className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                              isDone
                                ? 'bg-indigo-950/30 border-indigo-500/40 shadow-md'
                                : 'bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                                  {mod.code}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  isDone
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {isDone ? '✅ TUNTAS' : 'BELUM DIBUAT'}
                                </span>
                              </div>

                              <h5 className="font-bold text-white text-xs line-clamp-2 leading-tight">
                                {mod.title}
                              </h5>

                              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                {mod.description}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-800/80">
                              {isDone && latestJournal ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400">Pemahaman:</span>
                                    <span className="font-mono font-bold text-indigo-400">{latestJournal.comprehensionPercentage}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400">Drill Soal:</span>
                                    <span className="font-mono font-bold text-amber-400">{latestJournal.practiceAccuracy}%</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 italic">
                                  Belum ada rekaman sesi
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenModuleDetail(mod.id)}
                                  className="flex-1 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] font-bold text-center border border-slate-800 cursor-pointer"
                                >
                                  Blueprint
                                </button>
                                {isDone && latestJournal && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenTeachingJournalPreview(latestJournal.id, 'SINGLE_SESSION')}
                                    className="p-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/40 cursor-pointer"
                                    title={`Pratinjau Jurnal Sesi #${latestJournal.meetingNumber}`}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!isStudent && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddJournal(mod.id, mod.subtestCode)}
                                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold text-center cursor-pointer shadow-sm"
                                  >
                                    + Jurnal
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: POLA BELAJAR & DETEKSI TITIK LEMAH (RINGKASAN TAB) */}
      {/* ========================================================================= */}
      {activeSubTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Weakness Detection & Remedial Recommendation */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Deteksi Titik Lemah & Rekomendasi Remedial
                  {activeStudent && (
                    <span className="text-indigo-300 text-sm font-semibold">({activeStudent.name})</span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Topik-topik dengan prioritas perbaikan tertinggi berdasarkan analisis kesalahan butir soal tryout dan gap target PTN.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold self-start sm:self-auto">
                Prioritas Perbaikan Skor IRT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {studentWeakTopics.slice(0, 6).map((item, idx) => {
                const studentSubScore = activeStudent?.subtestScores?.find(s => s.code === item.subtestCode)?.score;

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">{item.subtest}</span>
                            {studentSubScore && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                Skor: {studentSubScore}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-xs mt-0.5">{item.topic}</h4>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          item.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          Error: {item.errorRate}%
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Rekomendasi Tindakan:
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{item.remedialAction}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7 Subtests Breakdown Cards */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                Peta Penguasaan 7 Subtes & Alokasi Waktu
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rincian cakupan materi, durasi ujian, dan status pemahaman konsep pada seluruh subtes resmi SNPMB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {SNBT_SUBTEST_LIST.map(topic => {
                const subCode = topic.subtestCode;
                const scores = students.map(s => s.subtestScores.find(sub => sub.code === subCode)?.score || 0);
                const classAvgScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
                const studentScore = activeStudent?.subtestScores?.find(s => s.code === subCode)?.score || classAvgScore;
                const displayScore = viewScope === 'STUDENT' ? studentScore : classAvgScore;
                const isMastered = displayScore >= 730;

                return (
                  <div
                    key={topic.id}
                    className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 shadow-xl space-y-4 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              {topic.subtestCode}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">{topic.category}</span>
                          </div>
                          <h4 className="font-black text-white text-sm">{topic.subtestName}</h4>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isMastered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {isMastered ? 'TUNTAS' : 'PERLU DRILL'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400">Skor IRT Saat Ini</span>
                          <p className="font-mono font-black text-indigo-300 text-sm mt-0.5">{displayScore} / 1000</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">Alokasi Waktu</span>
                          <p className="font-mono font-bold text-slate-300 text-xs mt-0.5">{topic.durationMinutes} mnt ({topic.totalQuestions} soal)</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Materi Esensial:
                        </span>
                        {topic.topics.map((t, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/70 text-xs flex items-center justify-between">
                            <span className="font-medium text-slate-200">{t.name}</span>
                            <span className="text-[9px] font-bold text-emerald-400">{t.masteryLevel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!isStudent && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddJournal(undefined, topic.subtestCode as SnbtSubtestCode)}
                        className="w-full py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Tulis Jurnal {topic.subtestCode}</span>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: DETAIL EVALUASI BELAJAR & DIAGNOSTIK KELULUSAN SISWA */}
      {/* ========================================================================= */}
      {activeSubTab === 'detail' && (
        <div className="space-y-6">
          {/* 1. Header Profile & Diagnostic Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-xl shrink-0 shadow-inner">
                  {activeStudent?.name.split(' ').map(n => n[0]).slice(0, 2).join('') || 'ST'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {isStudent ? 'Profil Saya' : 'Laporan Siswa Aktif'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      NIS: {activeStudent?.nis || '-'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-300 font-medium">
                      {activeStudent?.schoolOrigin || 'SMA N/A'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {activeStudent?.name || 'Siswa SNBT'}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-1">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-slate-400">Pilihan 1:</span>
                      <span className="font-bold text-white">{activeStudent?.targetPtn1} ({activeStudent?.prodi1})</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">PG: {activeStudent?.passingGrade1}</span>
                    </div>
                    {activeStudent?.targetPtn2 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Pilihan 2:</span>
                        <span className="font-bold text-white">{activeStudent?.targetPtn2} ({activeStudent?.prodi2})</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">PG: {activeStudent?.passingGrade2}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenTeachingJournalPreview(undefined, 'STUDENT_CUMULATIVE')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  title="Buka Lembar Cetak Jurnal A4 Resmi Siswa"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Buku Jurnal A4</span>
                </button>

                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('snbt_syllabus')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Silabus 28 Modul</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Executive 4 Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Ketuntasan 28 Modul</span>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <BookCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">
                    {studentJournalSummary.completedModulesCount}
                  </span>
                  <span className="text-xs text-slate-400">/ 28 Modul</span>
                  <span className="ml-auto text-xs font-mono font-bold text-emerald-400">
                    {studentJournalSummary.coveragePercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${studentJournalSummary.coveragePercent}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                {28 - studentJournalSummary.completedModulesCount} modul tersisa menuju UTBK SNBT
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Akurasi Drill Pembelajaran</span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {studentJournalSummary.avgAccuracy}%
                  </span>
                  <span className="text-xs text-slate-400">Akurasi Rata-rata</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    style={{ width: `${studentJournalSummary.avgAccuracy}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {studentJournalSummary.totalCorrect} benar dari {studentJournalSummary.totalQuestions} soal dikerjakan
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total Waktu Bimbingan</span>
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-400 font-mono">
                    {studentJournalSummary.totalStudyHours}h {studentJournalSummary.totalStudyMinutes % 60}m
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((studentJournalSummary.totalStudyHours / 40) * 100))}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Terakumulasi dalam {studentJournalSummary.totalEntries} sesi jurnal pembelajaran
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Tingkat Retensi & Kesiapan</span>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-400 font-mono">
                    {studentJournalSummary.avgComprehension}%
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Sangat Siap</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                    style={{ width: `${studentJournalSummary.avgComprehension}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Rerata penguasaan konsep esensial & penalaran HOTS
              </p>
            </div>
          </div>

          {/* 3. Deep Subtest 7-Breakdown Analytics Grid */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-400" />
                  <span>Matriks Detail Penguasaan 7 Subtes UTBK-SNBT</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analisis komparatif per subtes: ketuntasan 4 modul, tingkat akurasi drill, skor tryout, dan durasi bimbingan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter cepat tabel sesi:</span>
                <button
                  type="button"
                  onClick={() => setDetailSubtestFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    detailSubtestFilter === 'ALL'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Semua Subtes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {subtestDetailedStats.map(stat => {
                const isSelected = detailSubtestFilter === stat.meta.code;
                return (
                  <div
                    key={stat.meta.code}
                    className={`p-4 rounded-2xl bg-slate-950/70 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-950'
                        : 'border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Subtest Meta Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                              {stat.meta.code}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {stat.meta.category === 'TPS' ? 'Tes Potensi Skolastik' : stat.meta.category === 'LITERASI' ? 'Literasi' : 'Penalaran MTK'}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white mt-1">
                            {stat.meta.name}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {stat.stdScore > 0 ? `${stat.stdScore} Poin` : 'Tryout -'}
                        </span>
                      </div>

                      {/* Progress Bar & Modul Count */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Modul Tuntas</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {stat.completedModulesCount}/{stat.totalModulesCount} ({stat.completionRate}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${stat.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Accuracy & Sesi Stats */}
                      <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Sesi</span>
                          <span className="text-xs font-mono font-bold text-white">{stat.sessionsCount}x</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Akurasi</span>
                          <span className="text-xs font-mono font-bold text-amber-400">{stat.accuracy}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Pemahaman</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{stat.avgComprehension}%</span>
                        </div>
                      </div>

                      {/* 4 Modules mini list */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Silabus Modul ({stat.modules.length}):
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-none pr-1">
                          {stat.modules.map(mod => {
                            const isDone = stat.coveredModuleIds.has(mod.id) || stat.coveredModuleIds.has(mod.code);
                            return (
                              <button
                                key={mod.id}
                                type="button"
                                onClick={() => handleOpenModuleDetail(mod.id)}
                                className={`w-full p-1.5 rounded-lg text-left text-[11px] flex items-center justify-between gap-1 transition-colors cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-200 border border-emerald-500/20'
                                    : 'bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 border border-slate-800'
                                }`}
                                title={`Klik untuk pratinjau silabus ${mod.code}`}
                              >
                                <span className="truncate font-medium">
                                  <span className="font-mono font-bold text-indigo-300 mr-1">{mod.code}</span>
                                  {mod.title}
                                </span>
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-3 border-t border-slate-850 mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailSubtestFilter(isSelected ? 'ALL' : stat.meta.code)}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800'
                        }`}
                      >
                        <ListFilter className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Tampilkan Semua Sesi' : `Lihat Log ${stat.meta.code}`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Complete Session Journal Log & Evaluation Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Rincian Lengkap Sesi Pembelajaran & Evaluasi Pertemuan</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan {detailFilteredJournals.length} dari total {journals.filter(j => !activeStudent || j.studentId === activeStudent.id).length} sesi bimbingan tercatat.
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={detailSearchQuery}
                    onChange={e => setDetailSearchQuery(e.target.value)}
                    placeholder="Cari materi, instruktur, catatan..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {detailSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDetailSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={detailSortBy}
                  onChange={e => setDetailSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="MEETING_DESC">Sesi Terbaru (# Terbesar)</option>
                  <option value="MEETING_ASC">Sesi Terlama (# Terkecil)</option>
                  <option value="ACCURACY_DESC">Akurasi Soal Tertinggi</option>
                  <option value="ACCURACY_ASC">Akurasi Soal Terendah</option>
                </select>
              </div>
            </div>

            {/* Subtest & Comprehension Filter Pills */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span className="text-xs text-slate-400 mr-1 shrink-0 font-medium">Subtes:</span>
                <button
                  type="button"
                  onClick={() => setDetailSubtestFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                    detailSubtestFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  SEMUA ({journals.filter(j => !activeStudent || j.studentId === activeStudent.id).length})
                </button>
                {SNBT_7_SUBTEST_METAS.map(sub => {
                  const count = journals.filter(j => (!activeStudent || j.studentId === activeStudent.id) && j.subtestCode === sub.code).length;
                  return (
                    <button
                      key={sub.code}
                      type="button"
                      onClick={() => setDetailSubtestFilter(sub.code)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                        detailSubtestFilter === sub.code
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {sub.code} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span className="text-xs text-slate-400 mr-1 shrink-0 font-medium">Pemahaman:</span>
                <button
                  type="button"
                  onClick={() => setDetailComprehensionFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                    detailComprehensionFilter === 'ALL'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Semua Level
                </button>
                {['SANGAT_PAHAM', 'PAHAM', 'CUKUP', 'BUTUH_REMEDIAL'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDetailComprehensionFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 ${
                      detailComprehensionFilter === lvl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lvl.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4 text-center">Sesi</th>
                    <th className="py-3 px-4">Waktu & Tanggal</th>
                    <th className="py-3 px-4">Subtes & Modul Silabus</th>
                    <th className="py-3 px-4">Aktivitas</th>
                    <th className="py-3 px-4">Guru / Tutor</th>
                    <th className="py-3 px-4 text-center">Drill Soal</th>
                    <th className="py-3 px-4 text-center">Pemahaman</th>
                    <th className="py-3 px-4">Catatan & Proyeksi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {detailFilteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-slate-300">Tidak ada catatan sesi pembelajaran yang sesuai filter.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setDetailSubtestFilter('ALL');
                            setDetailComprehensionFilter('ALL');
                            setDetailSearchQuery('');
                          }}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reset Filter Pencarian
                        </button>
                      </td>
                    </tr>
                  ) : (
                    detailFilteredJournals.map(jrn => {
                      return (
                        <tr key={jrn.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="font-mono font-black text-white text-xs px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                              #{jrn.meetingNumber}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono text-slate-300 text-xs font-medium">{jrn.date}</div>
                            <div className="font-mono text-[10px] text-slate-500 mt-0.5">{jrn.timeStart} - {jrn.timeEnd} ({jrn.durationMinutes}m)</div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[260px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-200">
                                {jrn.subtestCode}
                              </span>
                              {jrn.moduleCode && (
                                <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                                  {jrn.moduleCode}
                                </span>
                              )}
                            </div>
                            <div className="font-black text-white text-xs mt-1 truncate" title={jrn.moduleTitle || jrn.syllabusTitle}>
                              {jrn.moduleTitle || jrn.syllabusTitle}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {jrn.subtopicsCovered.join(', ')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 block w-fit">
                              {jrn.learningActivityType.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-200 text-xs block">{jrn.instructorName}</span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-amber-400 block">
                              {jrn.practiceQuestionsCorrect}/{jrn.practiceQuestionsCount} Benar
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                              {jrn.practiceAccuracy}% Akurasi
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="text-sm font-black font-mono text-indigo-400 block">
                              {jrn.comprehensionPercentage}%
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              jrn.comprehensionLevel === 'SANGAT_PAHAM'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : jrn.comprehensionLevel === 'PAHAM'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {jrn.comprehensionLevel.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="text-[11px] text-slate-300 line-clamp-1 italic" title={jrn.studentReflectionNotes}>
                              "{jrn.studentReflectionNotes}"
                            </div>
                            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                              {jrn.targetIrtImpact}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenTeachingJournalPreview(jrn.id, 'SINGLE_SESSION')}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                                title={`Buka Pratinjau Detail Jurnal Sesi #${jrn.meetingNumber}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Detail</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyWhatsApp(jrn)}
                                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 cursor-pointer"
                                title="Salin Laporan WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {!isStudent && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditJournal(jrn)}
                                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                                  title="Edit Jurnal"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Learning Patterns, Activity Allocation & Cognitive Diagnostic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Distribution */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  <span>Distribusi Alokasi Aktivitas Belajar Siswa</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proporsi waktu dan format interaksi pembelajaran yang telah dilalui siswa selama bimbingan.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Drill Soal Cepat & Pembahasan Taktis</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {learningActivityBreakdown.drillPct}% ({learningActivityBreakdown.drillCount} Sesi)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${learningActivityBreakdown.drillPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Bedah Teori & Penguasaan Konsep Dasar</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {learningActivityBreakdown.theoryPct}% ({learningActivityBreakdown.theoryCount} Sesi)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${learningActivityBreakdown.theoryPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Bedah Soal Penalaran Tingkat Tinggi (HOTS)</span>
                    <span className="font-mono font-bold text-amber-400">
                      {learningActivityBreakdown.hotsPct}% ({learningActivityBreakdown.hotsCount} Sesi)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${learningActivityBreakdown.hotsPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Review & Evaluasi Tryout Akbar</span>
                    <span className="font-mono font-bold text-purple-400">
                      {learningActivityBreakdown.reviewPct}% ({learningActivityBreakdown.reviewCount} Sesi)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${learningActivityBreakdown.reviewPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cognitive Competency Diagnostic */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  <span>Evaluasi 4 Pilar Kognitif UTBK-SNBT</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Penilaian kesiapan mental dan ketangkasan kognitif siswa dalam menghadapi format soal UTBK terbaru.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Kecepatan Waktu</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">92/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Siswa mampu menyelesaikan rata-rata 1 soal TPS dalam waktu 45-60 detik dengan ritme stabil.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Analisis Teks</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">88/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Daya serap bacaan panjang pada Literasi Bahasa Indonesia & Inggris sangat optimal dan teliti.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Logika Simbolik</span>
                    <span className="text-xs font-mono font-bold text-purple-400">94/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Penguasaan aljabar, pola bilangan, dan penalaran matematika sangat matang dan siap HOTS.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Eliminasi Opsi</span>
                    <span className="text-xs font-mono font-bold text-amber-400">90/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Kemampuan mengidentifikasi jebakan/distraktor opsi jawaban pada soal cerita sangat terlatih.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* 1. Add / Edit Journal Modal */}
      {isJournalModalOpen && (
        <SnbtJournalModal
          isOpen={isJournalModalOpen}
          onClose={() => setIsJournalModalOpen(false)}
          onSave={handleSaveJournal}
          initialData={editingJournal}
          students={students}
          selectedStudentId={activeStudent?.id}
          defaultModuleId={selectedModuleForModal}
          defaultSubtestCode={selectedSubtestForModal}
        />
      )}

      {/* 2. Module Blueprint Detail Modal */}
      {previewModule && (
        <SnbtModuleDetailModal
          module={previewModule}
          onClose={() => setPreviewModule(null)}
          onUpdateStatus={() => {}}
        />
      )}

      {/* 3. Teaching Journal Preview & Print Modal */}
      {isTeachingJournalPreviewOpen && (
        <SnbtTeachingJournalPreviewModal
          isOpen={isTeachingJournalPreviewOpen}
          onClose={() => setIsTeachingJournalPreviewOpen(false)}
          journals={journals}
          students={students}
          selectedStudentId={activeStudent?.id}
          selectedJournalId={previewJournalId}
          initialViewMode={previewJournalMode}
          onSelectStudent={(studentId) => {
            if (onSelectStudent) {
              onSelectStudent(studentId);
            }
          }}
          user={user}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
