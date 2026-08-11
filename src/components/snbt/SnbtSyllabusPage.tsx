import React, { useState, useMemo, useEffect } from 'react';
import {
  SnbtSyllabusModule,
  SnbtSubtestCode,
  SnbtSubtestCategory,
  SnbtModuleDifficulty,
  SnbtModuleStatus,
  SnbtModuleUserProgress,
  SNBT_7_SUBTEST_METAS,
  SNBT_WEEKLY_PLOTTING,
  loadSnbtSyllabusModules,
  saveSnbtSyllabusModule,
  deleteSnbtSyllabusModule,
  loadUserSnbtModuleProgress,
  saveUserSnbtModuleProgress
} from './snbtSyllabusData';
import { User, SidebarTab, SyllabusItem, LearningMaterial, Exam, Teacher } from '../../types';
import { SnbtModuleDetailModal } from './SnbtModuleDetailModal';
import { SnbtModuleEditModal } from './SnbtModuleEditModal';
import { SnbtSchedulePlottingModal, SnbtUserSchedulePlan } from './SnbtSchedulePlottingModal';
import { SnbtPrintSyllabusModal } from './SnbtPrintSyllabusModal';
import { getSyllabi, getMaterials, getExams, getTeachers, getInstitutionInfo } from '../../utils/storage';
import {
  BookOpen,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  Zap,
  Filter,
  Search,
  Plus,
  Printer,
  ExternalLink,
  Flame,
  Award,
  Layers,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FileText,
  Video,
  Table,
  LayoutGrid,
  List,
  GraduationCap,
  Bookmark,
  Check,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Compass,
  ArrowRight,
  TrendingUp,
  Link2,
  Trash2,
  Edit3
} from 'lucide-react';

interface SnbtSyllabusPageProps {
  user: User | null;
  onNavigateTab?: (tab: SidebarTab) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type MainTab = 'modules' | 'timeline' | 'matrix' | 'academic_sync';

export const SnbtSyllabusPage: React.FC<SnbtSyllabusPageProps> = ({
  user,
  onNavigateTab,
  onShowToast
}) => {
  // State Modules & Academic Data
  const [modules, setModules] = useState<SnbtSyllabusModule[]>([]);
  const [academicSyllabi, setAcademicSyllabi] = useState<SyllabusItem[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // User Progress state
  const userId = user?.id || 'guest-user';
  const [userProgress, setUserProgress] = useState<Record<string, SnbtModuleUserProgress>>({});

  // Active View Tab
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('modules');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubtest, setSelectedSubtest] = useState<string>('ALL'); // 'ALL' or 'PU', 'PPU', etc.
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL'); // 'ALL', 'TPS', 'Literasi', 'Penalaran Matematika'
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL'); // 'ALL', 'DASAR', 'MENENGAH', 'HOTS'
  const [selectedPhase, setSelectedPhase] = useState<number | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [selectedModuleForDetail, setSelectedModuleForDetail] = useState<SnbtSyllabusModule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<SnbtSyllabusModule | null>(null);
  const [isPlottingModalOpen, setIsPlottingModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  // Load initial data
  useEffect(() => {
    const loadedModules = loadSnbtSyllabusModules();
    setModules(loadedModules);

    const loadedProgress = loadUserSnbtModuleProgress(userId);
    setUserProgress(loadedProgress);

    setAcademicSyllabi(getSyllabi());
    setMaterials(getMaterials());
    setExams(getExams());
    setTeachers(getTeachers());
  }, [userId]);

  // Handle Status Update
  const handleUpdateStatus = (
    moduleId: string,
    status: SnbtModuleStatus,
    notes?: string,
    understanding?: number
  ) => {
    const updated = {
      ...userProgress,
      [moduleId]: {
        ...userProgress[moduleId],
        status,
        notes: notes ?? userProgress[moduleId]?.notes,
        understandingPercent: understanding ?? userProgress[moduleId]?.understandingPercent ?? 80,
        completedAt: status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined
      }
    };
    setUserProgress(updated);
    saveUserSnbtModuleProgress(userId, updated);
    if (onShowToast) {
      const statusLabel =
        status === 'COMPLETED' ? 'Tuntas' : status === 'IN_PROGRESS' ? 'Sedang Dipelajari' : 'Belum Dimulai';
      onShowToast(`Status modul diperbarui: ${statusLabel}`, 'success');
    }
  };

  const handleToggleBookmark = (moduleId: string) => {
    const isCurrentlyBookmarked = !!userProgress[moduleId]?.isBookmarked;
    const updated = {
      ...userProgress,
      [moduleId]: {
        ...userProgress[moduleId],
        status: userProgress[moduleId]?.status || 'NOT_STARTED',
        isBookmarked: !isCurrentlyBookmarked
      }
    };
    setUserProgress(updated);
    saveUserSnbtModuleProgress(userId, updated);
  };

  const handleQuickToggleComplete = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = userProgress[moduleId]?.status || 'NOT_STARTED';
    const nextStatus: SnbtModuleStatus = current === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    handleUpdateStatus(moduleId, nextStatus);
  };

  // Admin / Guru CRUD
  const handleSaveModule = (savedMod: SnbtSyllabusModule) => {
    if (!isAdminOrTeacher) {
      if (onShowToast) {
        onShowToast('Hanya administrator dan guru yang dapat mengubah modul silabus.', 'error');
      }
      return;
    }
    const updated = saveSnbtSyllabusModule(savedMod);
    setModules(updated);
    if (onShowToast) {
      onShowToast('Modul silabus SNBT berhasil disimpan!', 'success');
    }
  };

  const handleDeleteModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdminOrTeacher) {
      if (onShowToast) {
        onShowToast('Hanya administrator dan guru yang dapat menghapus modul silabus.', 'error');
      }
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus modul silabus ini?')) {
      const updated = deleteSnbtSyllabusModule(moduleId);
      setModules(updated);
      if (onShowToast) {
        onShowToast('Modul silabus berhasil dihapus.', 'info');
      }
    }
  };

  // Academic Sync Action
  const handleSyncAcademicSyllabus = () => {
    if (!isAdminOrTeacher) {
      if (onShowToast) {
        onShowToast('Hanya administrator dan guru yang dapat melakukan sinkronisasi silabus.', 'error');
      }
      return;
    }
    const freshSyllabi = getSyllabi();
    setAcademicSyllabi(freshSyllabi);
    setMaterials(getMaterials());
    setExams(getExams());
    if (onShowToast) {
      onShowToast(`Sinkronisasi berhasil! ${freshSyllabi.length} silabus akademik terhubung.`, 'success');
    }
  };

  // Calculation for Overall Progress & Per-Subtest Progress
  const overallStats = useMemo(() => {
    const total = modules.length;
    let completed = 0;
    let inProgress = 0;

    modules.forEach(m => {
      const st = userProgress[m.id]?.status;
      if (st === 'COMPLETED') completed++;
      else if (st === 'IN_PROGRESS') inProgress++;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      percent
    };
  }, [modules, userProgress]);

  // Per Subtest Progress map
  const subtestStats = useMemo(() => {
    const map: Record<string, { total: number; completed: number; percent: number }> = {};
    SNBT_7_SUBTEST_METAS.forEach(sub => {
      const subModules = modules.filter(m => m.subtestCode === sub.code);
      const completed = subModules.filter(m => userProgress[m.id]?.status === 'COMPLETED').length;
      const percent = subModules.length > 0 ? Math.round((completed / subModules.length) * 100) : 0;
      map[sub.code] = { total: subModules.length, completed, percent };
    });
    return map;
  }, [modules, userProgress]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchCode = m.code.toLowerCase().includes(q);
        const matchSubtest = m.subtestName.toLowerCase().includes(q);
        const matchTeacher = m.teacherInCharge.toLowerCase().includes(q);
        const matchDesc = m.description.toLowerCase().includes(q);
        const matchSubtopics = m.subtopics.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchSubtest && !matchTeacher && !matchDesc && !matchSubtopics) {
          return false;
        }
      }

      // Subtest Filter
      if (selectedSubtest !== 'ALL' && m.subtestCode !== selectedSubtest) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        const userStatus = userProgress[m.id]?.status || 'NOT_STARTED';
        if (userStatus !== selectedStatus) {
          return false;
        }
      }

      // Difficulty Filter
      if (selectedDifficulty !== 'ALL' && m.difficulty !== selectedDifficulty) {
        return false;
      }

      // Phase Filter
      if (selectedPhase !== 'ALL' && m.phaseNumber !== selectedPhase) {
        return false;
      }

      return true;
    });
  }, [
    modules,
    searchQuery,
    selectedSubtest,
    selectedCategory,
    selectedStatus,
    selectedDifficulty,
    selectedPhase,
    userProgress
  ]);

  const getDifficultyBadge = (diff: SnbtModuleDifficulty) => {
    switch (diff) {
      case 'DASAR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MENENGAH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'HOTS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 text-white text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                UTBK-SNBT 2026 / 2027
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                7 Subtes SNPMB
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sinkron Akademik BSA
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Silabus & Modul Pembelajaran SNBT
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Panduan terstruktur 7 subtes resmi SNPMB (TPS, Literasi & Penalaran Matematika), timeline
              pembelajaran 20 pekan, rumus kilat, checklist progres materi, dan integrasi silabus akademik.
            </p>
          </div>

          {/* Action Buttons (Icon-Only with Tooltips) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="snbt-btn-plotting"
              onClick={() => setIsPlottingModalOpen(true)}
              title="Ploting Jadwal Pembelajaran 20 Pekan"
              aria-label="Ploting Jadwal"
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 shadow-md transition-all cursor-pointer relative group"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              id="snbt-btn-print"
              onClick={() => setIsPrintModalOpen(true)}
              title="Cetak Silabus & Modul SNBT"
              aria-label="Cetak Silabus"
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 hover:border-amber-500/50 shadow-md transition-all cursor-pointer relative group"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              id="snbt-btn-sync"
              onClick={handleSyncAcademicSyllabus}
              title="Sinkronisasi Data Silabus Akademik"
              aria-label="Sinkronisasi Silabus"
              className="p-2.5 sm:p-3 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900/80 text-cyan-300 hover:text-white border border-indigo-500/40 hover:border-cyan-500/50 shadow-md transition-all cursor-pointer relative group"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {isAdminOrTeacher && (
              <button
                type="button"
                id="snbt-btn-add-module"
                onClick={() => {
                  setModuleToEdit(null);
                  setIsEditModalOpen(true);
                }}
                title="Tambah Modul Silabus Baru"
                aria-label="Tambah Modul"
                className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Master Progress Bar Section */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                PROGRES KETUNTASAN MATERI 7 SUBTES
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                {overallStats.completed} dari {overallStats.total} Modul Tuntas ({overallStats.percent}%)
              </span>
            </div>
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> {overallStats.completed} Selesai
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> {overallStats.inProgress} Sedang Belajar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> {overallStats.notStarted} Belum Dimulai
              </span>
            </div>
          </div>

          {/* Master Progress Bar Line */}
          <div className="w-full h-3.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/80 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 shadow-md shadow-emerald-500/30"
              style={{ width: `${Math.max(overallStats.percent, 3)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7 Subtest Interactive Pill Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            7 SUBTES RESMI UTBK-SNBT (PILIH SUBTES UNTUK FILTER CEPAT)
          </h2>
          {selectedSubtest !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedSubtest('ALL')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
            >
              Reset Filter Subtes (Lihat Semua)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {SNBT_7_SUBTEST_METAS.map(sub => {
            const stat = subtestStats[sub.code] || { total: 0, completed: 0, percent: 0 };
            const isSelected = selectedSubtest === sub.code;

            return (
              <button
                key={sub.code}
                type="button"
                onClick={() => setSelectedSubtest(isSelected ? 'ALL' : sub.code)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900/60 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/60'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-black text-xs text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {sub.totalQuestions} Soal
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white">
                    {sub.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {sub.category} • {sub.durationMinutes} Mnt
                  </span>
                </div>

                {/* Subtest Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>{stat.completed}/{stat.total} Modul</span>
                    <span className={`font-bold ${stat.percent === 100 ? 'text-emerald-400' : 'text-indigo-300'}`}>
                      {stat.percent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.percent === 100
                          ? 'bg-emerald-400'
                          : isSelected
                          ? 'bg-indigo-400'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navigation Menu Tabs (Icon-Only with Tooltips) */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            id="tab-btn-modules"
            onClick={() => setActiveMainTab('modules')}
            title={`Modul & Silabus 7 Subtes (${filteredModules.length} Modul)`}
            aria-label="Modul & Silabus"
            className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer relative group ${
              activeMainTab === 'modules'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Modul & Silabus</span>
          </button>

          <button
            type="button"
            id="tab-btn-timeline"
            onClick={() => setActiveMainTab('timeline')}
            title="Timeline & Ploting Pembelajaran 20 Pekan"
            aria-label="Timeline 20 Pekan"
            className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer relative group ${
              activeMainTab === 'timeline'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Timeline 20 Pekan</span>
          </button>

          <button
            type="button"
            id="tab-btn-matrix"
            onClick={() => setActiveMainTab('matrix')}
            title="Matriks Struktur 7 Subtes Resmi UTBK"
            aria-label="Matriks 7 Subtes"
            className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer relative group ${
              activeMainTab === 'matrix'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Table className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Matriks 7 Subtes</span>
          </button>

          <button
            type="button"
            id="tab-btn-academic-sync"
            onClick={() => setActiveMainTab('academic_sync')}
            title="Integrasi Silabus Akademik BSA"
            aria-label="Integrasi Silabus Akademik"
            className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer relative group ${
              activeMainTab === 'academic_sync'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Link2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="sr-only">Integrasi Silabus Akademik</span>
          </button>
        </div>

        {/* View mode toggle for modules (Icon-Only) */}
        {activeMainTab === 'modules' && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              id="btn-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-2 sm:p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Tampilan Grid Kartu"
              aria-label="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-view-list"
              onClick={() => setViewMode('list')}
              className={`p-2 sm:p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Tampilan Daftar Kompak"
              aria-label="Tampilan Daftar"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ===================== TAB 1: MODUL & SILABUS ===================== */}
      {activeMainTab === 'modules' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari pokok bahasan, rumus, materi, guru..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-white text-xs placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">Status: Semua Status</option>
                  <option value="COMPLETED">Tuntas / Selesai</option>
                  <option value="IN_PROGRESS">Sedang Belajar</option>
                  <option value="NOT_STARTED">Belum Dimulai</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">Level: Semua Tingkat</option>
                  <option value="DASAR">Dasar (Konsep)</option>
                  <option value="MENENGAH">Menengah (Trik Cepat)</option>
                  <option value="HOTS">HOTS (Analisis Tinggi)</option>
                </select>
              </div>

              {/* Phase Filter */}
              <div>
                <select
                  value={selectedPhase}
                  onChange={e => setSelectedPhase(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">Fase: Semua 5 Fase</option>
                  <option value={1}>Fase 1: Konsep Dasar</option>
                  <option value={2}>Fase 2: Pendalaman Trik</option>
                  <option value={3}>Fase 3: Bedah Soal HOTS</option>
                  <option value={4}>Fase 4: Speed Drill & IRT</option>
                  <option value={5}>Fase 5: Final Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Module Grid or List */}
          {filteredModules.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak ada modul yang cocok</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Coba sesuaikan kata kunci pencarian atau reset filter subtes, level, dan status.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubtest('ALL');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedDifficulty('ALL');
                  setSelectedPhase('ALL');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map(mod => {
                const subMeta = SNBT_7_SUBTEST_METAS.find(s => s.code === mod.subtestCode);
                const progress = userProgress[mod.id];
                const isCompleted = progress?.status === 'COMPLETED';
                const isInProgress = progress?.status === 'IN_PROGRESS';

                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModuleForDetail(mod)}
                    className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:border-indigo-500/60 cursor-pointer group relative overflow-hidden ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20'
                        : isInProgress
                        ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${subMeta?.badgeBg || 'bg-slate-800 text-white'}`}>
                            {mod.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(mod.difficulty)}`}>
                            {mod.difficulty}
                          </span>
                        </div>

                        {/* Quick Checkbox Toggle */}
                        <button
                          type="button"
                          onClick={e => handleQuickToggleComplete(mod.id, e)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                          title={isCompleted ? 'Tandai Belum Tuntas' : 'Tandai Tuntas'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1.5 leading-snug">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {mod.description}
                      </p>

                      {/* Subtopics Pill preview */}
                      <div className="space-y-1 mb-3">
                        {mod.subtopics.slice(0, 2).map((sub, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span className="truncate">{sub}</span>
                          </div>
                        ))}
                        {mod.subtopics.length > 2 && (
                          <span className="text-[10px] text-indigo-400 font-semibold pl-3">
                            +{mod.subtopics.length - 2} sub-topik lainnya
                          </span>
                        )}
                      </div>

                      {/* Flash Formula snippet if available */}
                      {mod.flashFormula && (
                        <div className="bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl mb-3 flex items-start gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-rose-200 font-mono line-clamp-1">
                            {mod.flashFormula}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Status */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          W{mod.weekNumber}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Target className="w-3 h-3 text-emerald-400" />
                          {mod.targetScoreIrt}+
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Tuntas
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            Sedang Belajar
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            Belum Mulai
                          </span>
                        )}

                        {isAdminOrTeacher && (
                          <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setModuleToEdit(mod);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
                              title="Edit Modul"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={e => handleDeleteModule(mod.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Hapus Modul"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Mode */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Kode & Subtes</th>
                      <th className="p-3.5">Pokok Bahasan Modul</th>
                      <th className="p-3.5">Pekan / Fase</th>
                      <th className="p-3.5">Target IRT</th>
                      <th className="p-3.5">Level</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredModules.map(mod => {
                      const isCompleted = userProgress[mod.id]?.status === 'COMPLETED';
                      const isInProgress = userProgress[mod.id]?.status === 'IN_PROGRESS';

                      return (
                        <tr
                          key={mod.id}
                          onClick={() => setSelectedModuleForDetail(mod)}
                          className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-white block">{mod.code}</span>
                            <span className="text-[10px] text-indigo-400 font-semibold">{mod.subtestName}</span>
                          </td>
                          <td className="p-3.5">
                            <strong className="text-white font-bold block">{mod.title}</strong>
                            <span className="text-[11px] text-slate-400 line-clamp-1">{mod.description}</span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-bold text-white">Pekan {mod.weekNumber}</span>
                            <span className="text-[10px] text-slate-400 block">Fase {mod.phaseNumber}</span>
                          </td>
                          <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">
                            {mod.targetScoreIrt}+
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(mod.difficulty)}`}>
                              {mod.difficulty}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {isCompleted ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Tuntas
                              </span>
                            ) : isInProgress ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] w-fit block">
                                Belajar
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] w-fit block">
                                Belum
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedModuleForDetail(mod)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors mr-2 cursor-pointer"
                            >
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={e => handleQuickToggleComplete(mod.id, e)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-500 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
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

      {/* ===================== TAB 2: TIMELINE 20 PEKAN ===================== */}
      {activeMainTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Roadmap & Ploting Pembelajaran 20 Pekan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                5 Fase komprehensif dari Penguasaan Konsep Dasar hingga Final Review Maraton Hari H
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-timeline-plot"
                onClick={() => setIsPlottingModalOpen(true)}
                title="Atur Target Ploting Pembelajaran 20 Pekan"
                aria-label="Atur Target Ploting"
                className="p-2.5 sm:p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Timeline Cards Grid */}
          <div className="space-y-4">
            {SNBT_WEEKLY_PLOTTING.map((week, idx) => {
              const weekModules = modules.filter(m => m.weekNumber === week.weekNumber);
              const completedCount = weekModules.filter(m => userProgress[m.id]?.status === 'COMPLETED').length;

              return (
                <div
                  key={week.weekNumber}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Week Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-lg shadow-indigo-900/40">
                      <span className="text-[10px] uppercase tracking-wider text-indigo-200">Pekan</span>
                      <span className="text-lg font-black leading-none">{week.weekNumber}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-indigo-500/30">
                          {week.phaseTitle}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{week.dateRange}</span>
                      </div>

                      <h3 className="text-base font-bold text-white">{week.focusTitle}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Target className="w-3.5 h-3.5 text-emerald-400" />
                          Target IRT: {week.targetIrtRange}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {week.sessionCount} Sesi Bimbingan
                        </span>
                        {week.examTarget && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                              {week.examTarget}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activities / Modules */}
                  <div className="lg:w-80 space-y-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Aktivitas Pembelajaran:
                    </span>
                    <ul className="space-y-1">
                      {week.activities.map((act, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="truncate">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: MATRIKS 7 SUBTES ===================== */}
      {activeMainTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-400" />
              Matriks Struktur 7 Subtes Resmi UTBK-SNBT
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Spesifikasi teknis jumlah butir soal, alokasi waktu, target nilai IRT, dan keterampilan inti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SNBT_7_SUBTEST_METAS.map(sub => {
              const subModules = modules.filter(m => m.subtestCode === sub.code);

              return (
                <div
                  key={sub.code}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {sub.code}
                        </span>
                        <span className="text-xs font-bold text-indigo-300">{sub.category}</span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">{sub.name}</h3>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${sub.colorGradient} text-white shadow-md`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-3 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Soal</span>
                      <strong className="text-white font-bold">{sub.totalQuestions} Butir</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Waktu</span>
                      <strong className="text-amber-400 font-bold">{sub.durationMinutes} Mnt</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Target IRT</span>
                      <strong className="text-emerald-400 font-bold">{sub.targetScoreAverage}+</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{sub.description}</p>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Kompetensi Kunci:
                    </span>
                    <div className="space-y-1">
                      {sub.coreSkills.map((skill, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{subModules.length} Modul Terjadwal</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubtest(sub.code);
                        setActiveMainTab('modules');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Modul</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: INTEGRASI AKADEMIK ===================== */}
      {activeMainTab === 'academic_sync' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-400" />
                Integrasi Data Silabus Akademik Brain Space Academy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Koneksi langsung antara kurikulum kelas XII SMA/UTBK dengan modul persiapan seleksi PTN
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onNavigateTab && (
                <button
                  type="button"
                  id="btn-open-academic-syllabus"
                  onClick={() => onNavigateTab('syllabus')}
                  title="Buka Menu Silabus Akademik"
                  aria-label="Buka Menu Silabus Akademik"
                  className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <button
                type="button"
                id="btn-reload-syllabus"
                onClick={handleSyncAcademicSyllabus}
                title="Muat Ulang & Sinkronkan Data Silabus Akademik"
                aria-label="Muat Ulang Data Silabus"
                className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded-2xl transition-all cursor-pointer hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {academicSyllabi.map(syl => (
              <div
                key={syl.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                      {syl.code}
                    </span>
                    {syl.snbtSubtestCode && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>SNBT: {syl.snbtSubtestCode} ({syl.snbtCategory || 'TPS'})</span>
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white">{syl.title}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Kelas: {syl.targetClass} • {syl.academicYear}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{syl.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Guru PIC Pengampu:</span>
                    <strong className="text-slate-200">{syl.teacherInCharge || 'Dr. Hendra Wijaya, M.Pd.'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Alokasi Pertemuan:</span>
                    <strong className="text-slate-200">{syl.totalMeetings} Pertemuan</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Kurikulum:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Aktif
                    </span>
                  </div>
                </div>

                {/* Topics Accordion preview */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Pokok Bahasan Terkait ({syl.topics.length} Bab):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {syl.topics.slice(0, 4).map(top => (
                      <div
                        key={top.id}
                        className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2 text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {top.meetingNumber}
                        </span>
                        <span className="truncate">{top.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedModuleForDetail && (
        <SnbtModuleDetailModal
          module={selectedModuleForDetail}
          userProgress={userProgress[selectedModuleForDetail.id]}
          onClose={() => setSelectedModuleForDetail(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleBookmark={handleToggleBookmark}
          onOpenExam={examTitle => {
            setSelectedModuleForDetail(null);
            if (onNavigateTab) {
              onNavigateTab('exams');
            }
          }}
        />
      )}

      {isEditModalOpen && (
        <SnbtModuleEditModal
          initialModule={moduleToEdit}
          academicSyllabi={academicSyllabi}
          teachers={teachers}
          onClose={() => {
            setIsEditModalOpen(false);
            setModuleToEdit(null);
          }}
          onSave={handleSaveModule}
        />
      )}

      {isPlottingModalOpen && (
        <SnbtSchedulePlottingModal
          onClose={() => setIsPlottingModalOpen(false)}
          onSaveSchedule={plan => {
            if (onShowToast) {
              onShowToast('Target jadwal dan skor IRT berhasil diperbarui!', 'success');
            }
          }}
        />
      )}

      {isPrintModalOpen && (
        <SnbtPrintSyllabusModal
          modules={modules}
          user={user}
          institution={getInstitutionInfo()}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
