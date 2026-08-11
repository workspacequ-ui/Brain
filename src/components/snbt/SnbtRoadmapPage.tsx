import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SNBT_ROADMAP_MILESTONES,
  SNBT_SUBTEST_LIST,
  SnbtMilestone,
  SnbtSubtestTopic,
  loadStoredSnbtRoadmapMilestones,
  saveStoredSnbtRoadmapMilestones,
  loadStoredSnbtCountdownTargets,
  SnbtCountdownTarget
} from './snbtData';
import { SnbtRoadmapModal } from './SnbtRoadmapModal';
import { SnbtMiniCountdownBadge } from './SnbtMiniCountdownBadge';
import { SnbtCountdownPage } from './SnbtCountdownPage';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  GraduationCap,
  Layers,
  Award,
  ChevronRight,
  Calendar,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  Printer,
  Flame,
  Radio,
  Sliders,
  BellRing,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface SnbtRoadmapPageProps {
  user: User;
  onNavigateTab?: (tab: SidebarTab) => void;
  onSetActiveSubtab?: (subtab: 'overview' | 'students' | 'campus' | 'roadmap' | 'countdown' | 'reports') => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  initialMenu?: 'roadmap' | 'countdown';
}

interface QuickTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalMs: number;
}

export const SnbtRoadmapPage: React.FC<SnbtRoadmapPageProps> = ({
  user,
  onNavigateTab,
  onSetActiveSubtab,
  onShowToast,
  initialMenu = 'roadmap'
}) => {
  const isAdmin = user.role === 'admin';

  // Primary sub-menu state: 'roadmap' or 'countdown'
  const [activeMenu, setActiveMenu] = useState<'roadmap' | 'countdown'>(initialMenu);

  // Roadmap milestones state loaded from local persistence
  const [milestones, setMilestones] = useState<SnbtMilestone[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING'>('ALL');

  // Selected phase ID for detailed display
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [selectedSubtestCode, setSelectedSubtestCode] = useState<string>('PU');

  // Modal states for CRUD operations
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<SnbtMilestone | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<SnbtMilestone | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Sync if initialMenu changes
  useEffect(() => {
    if (initialMenu) {
      setActiveMenu(initialMenu);
    }
  }, [initialMenu]);

  // Load Roadmap Milestones on mount & listen to updates
  useEffect(() => {
    const loaded = loadStoredSnbtRoadmapMilestones();
    setMilestones(loaded);
    if (loaded.length > 0) {
      // Pick in_progress phase or first one
      const activePhase = loaded.find(m => m.status === 'IN_PROGRESS') || loaded[0];
      setSelectedPhaseId(activePhase.id);
    }

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMilestones(e.detail);
      }
    };

    window.addEventListener('snbt-roadmap-updated', handleUpdate);
    return () => {
      window.removeEventListener('snbt-roadmap-updated', handleUpdate);
    };
  }, []);

  // Nearest Target calculation for live ticker widget under title
  const [targets, setTargets] = useState<SnbtCountdownTarget[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<QuickTimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    totalMs: 0
  });

  useEffect(() => {
    const loaded = loadStoredSnbtCountdownTargets();
    setTargets(loaded);
  }, []);

  const nearestTarget = targets.length > 0 ? targets[0] : null;

  useEffect(() => {
    if (!nearestTarget) return;

    const calculate = () => {
      const targetTime = new Date(nearestTarget.targetDateIso).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0 || isNaN(targetTime)) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          totalMs: 0
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          isPast: false,
          totalMs: diff
        });
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [nearestTarget]);

  // Filtered milestones based on search and status
  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.badgeTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [milestones, searchQuery, statusFilter]);

  // Fallback selected phase if deleted or changed
  const selectedPhase = useMemo(() => {
    if (!milestones.length) return null;
    const found = milestones.find(p => p.id === selectedPhaseId);
    return found || milestones[0];
  }, [milestones, selectedPhaseId]);

  const selectedSubtest =
    SNBT_SUBTEST_LIST.find(s => s.subtestCode === selectedSubtestCode) ||
    SNBT_SUBTEST_LIST[0];

  const pad = (n: number) => String(n).padStart(2, '0');

  // =========================================================================
  // CRUD HANDLERS
  // =========================================================================

  // CREATE / UPDATE
  const handleOpenCreateModal = () => {
    setEditingMilestone(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (milestone: SnbtMilestone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleSaveMilestone = (saved: SnbtMilestone) => {
    if (!isAdmin) {
      onShowToast?.('Hanya administrator yang memiliki akses mengubah roadmap.', 'error');
      return;
    }
    let updated: SnbtMilestone[];
    const exists = milestones.some(m => m.id === saved.id);

    if (exists) {
      updated = milestones.map(m => (m.id === saved.id ? saved : m));
      onShowToast?.(`Fase roadmap "${saved.title}" berhasil diperbarui!`, 'success');
    } else {
      updated = [...milestones, saved];
      onShowToast?.(`Fase baru "${saved.title}" berhasil ditambahkan ke roadmap!`, 'success');
    }

    // Sort by phaseNumber
    updated.sort((a, b) => a.phaseNumber - b.phaseNumber);

    setMilestones(updated);
    saveStoredSnbtRoadmapMilestones(updated);
    setSelectedPhaseId(saved.id);
    setIsModalOpen(false);
    setEditingMilestone(null);
  };

  // DELETE
  const handleOpenDeleteModal = (milestone: SnbtMilestone, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      onShowToast?.('Hanya administrator yang memiliki akses menghapus fase roadmap.', 'error');
      return;
    }
    setMilestoneToDelete(milestone);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!isAdmin) {
      onShowToast?.('Hanya administrator yang memiliki akses menghapus fase roadmap.', 'error');
      return;
    }
    if (!milestoneToDelete) return;

    const remaining = milestones.filter(m => m.id !== milestoneToDelete.id);
    // Renumber remaining phases if needed
    const renumbered = remaining.map((m, idx) => ({
      ...m,
      phaseNumber: idx + 1
    }));

    setMilestones(renumbered);
    saveStoredSnbtRoadmapMilestones(renumbered);

    if (selectedPhaseId === milestoneToDelete.id) {
      if (renumbered.length > 0) {
        setSelectedPhaseId(renumbered[0].id);
      }
    }

    onShowToast?.(`Fase "${milestoneToDelete.title}" berhasil dihapus dari roadmap.`, 'info');
    setIsDeleteModalOpen(false);
    setMilestoneToDelete(null);
  };

  // QUICK UPDATE STATUS & PROGRESS
  const handleQuickUpdateStatus = (
    milestoneId: string,
    newStatus: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING',
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      onShowToast?.('Hanya administrator yang memiliki akses mengubah status fase roadmap.', 'error');
      return;
    }
    const updated = milestones.map(m => {
      if (m.id === milestoneId) {
        let newProgress = m.progressPercentage;
        if (newStatus === 'COMPLETED') newProgress = 100;
        else if (newStatus === 'UPCOMING' && newProgress > 50) newProgress = 0;
        else if (newStatus === 'IN_PROGRESS' && (newProgress === 0 || newProgress === 100)) newProgress = 50;

        return {
          ...m,
          status: newStatus,
          progressPercentage: newProgress
        };
      }
      return m;
    });

    setMilestones(updated);
    saveStoredSnbtRoadmapMilestones(updated);
    onShowToast?.(`Status fase berhasil diubah ke ${newStatus === 'COMPLETED' ? 'Selesai' : newStatus === 'IN_PROGRESS' ? 'Aktif' : 'Akan Datang'}.`, 'success');
  };

  const handleQuickProgressChange = (milestoneId: string, newProgress: number) => {
    if (!isAdmin) return;
    const updated = milestones.map(m => {
      if (m.id === milestoneId) {
        let newStatus = m.status;
        if (newProgress >= 100) newStatus = 'COMPLETED';
        else if (newProgress > 0 && newStatus === 'UPCOMING') newStatus = 'IN_PROGRESS';

        return {
          ...m,
          progressPercentage: newProgress,
          status: newStatus
        };
      }
      return m;
    });

    setMilestones(updated);
    saveStoredSnbtRoadmapMilestones(updated);
  };

  // REORDER (MOVE UP / DOWN)
  const handleMovePhase = (index: number, direction: 'left' | 'right', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;

    const list = [...milestones];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Renumber
    const reordered = list.map((item, idx) => ({
      ...item,
      phaseNumber: idx + 1
    }));

    setMilestones(reordered);
    saveStoredSnbtRoadmapMilestones(reordered);
    onShowToast?.(`Urutan fase roadmap berhasil disesuaikan.`, 'success');
  };

  // RESET TO DEFAULT
  const handleConfirmReset = () => {
    if (!isAdmin) {
      onShowToast?.('Hanya administrator yang dapat mereset roadmap.', 'error');
      return;
    }
    setMilestones(SNBT_ROADMAP_MILESTONES);
    saveStoredSnbtRoadmapMilestones(SNBT_ROADMAP_MILESTONES);
    setSelectedPhaseId(SNBT_ROADMAP_MILESTONES[0].id);
    setIsResetModalOpen(false);
    onShowToast?.(`Roadmap berhasil direset ke standar resmi 5 Fase SNPMB.`, 'success');
  };

  // PRINT ROADMAP
  const handlePrintRoadmap = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner with Title & Navigation Menu Placed Directly Below */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-900 border border-blue-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Info Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  ROADMAP STRATEGIS 2026
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {milestones.length} Fase Strategis
                </span>
                {isAdmin && (
                  <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Mode Admin: Akses CRUD Aktif
                  </span>
                )}
              </div>

              {/* Page Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Roadmap Sukses & Countdown UTBK-SNBT
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Panduan terstruktur {milestones.length} fase strategis, blueprint materi 7 subtes standar IRT, serta pemantauan waktu real-time countdown H-x menuju Pusat UTBK.
              </p>
            </div>

            {/* Top Right Mini Live Countdown Widget */}
            <div className="flex items-center gap-3 shrink-0">
              <SnbtMiniCountdownBadge
                onSetActiveSubtab={() => setActiveMenu('countdown')}
                onNavigateTab={onNavigateTab}
                size="sm"
              />
            </div>
          </div>

          {/* Dedicated Sub-Menu Bar: Placed Directly Below Page Title */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Menu Navigation Buttons */}
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner w-full sm:w-auto">
                <button
                  type="button"
                  id="roadmap-menu-tab-phases"
                  onClick={() => setActiveMenu('roadmap')}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    activeMenu === 'roadmap'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title="Lihat Roadmap Fase Strategis & Blueprint 7 Subtes UTBK"
                >
                  <Compass className="w-4 h-4 text-cyan-300" />
                  <span>Roadmap {milestones.length} Fase & 7 Subtes</span>
                  {activeMenu === 'roadmap' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping hidden md:inline-block" />
                  )}
                </button>

                <button
                  type="button"
                  id="roadmap-menu-tab-countdown"
                  onClick={() => setActiveMenu('countdown')}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    activeMenu === 'countdown'
                      ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title="Lihat Countdown H-x Live, Jadwal Gelombang, dan Manajemen Target Ujian"
                >
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Countdown H-x & Jadwal SNBT</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/40 text-amber-200 border border-amber-400/30">
                    H-{timeRemaining.days}
                  </span>
                </button>
              </div>

              {/* Status / Quick Action Ticker when in Roadmap Mode */}
              {activeMenu === 'roadmap' && nearestTarget && (
                <div
                  onClick={() => setActiveMenu('countdown')}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 text-slate-300 hover:text-white transition-all cursor-pointer group shrink-0"
                  title="Klik untuk membuka tampilan Countdown lengkap"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-400 font-medium">Target Terdekat:</span>
                    <span className="font-bold text-amber-300">{nearestTarget.title}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-black text-xs text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span className="text-amber-400">{timeRemaining.days}h</span>
                    <span>:</span>
                    <span>{pad(timeRemaining.hours)}j</span>
                    <span>:</span>
                    <span>{pad(timeRemaining.minutes)}m</span>
                    <span>:</span>
                    <span className="text-rose-400">{pad(timeRemaining.seconds)}d</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              )}

              {/* Back to Roadmap Button when in Countdown Mode */}
              {activeMenu === 'countdown' && (
                <button
                  type="button"
                  onClick={() => setActiveMenu('roadmap')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-900/60 text-xs font-bold transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Kembali ke Roadmap {milestones.length} Fase</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ROADMAP 5 FASE & 7 SUBTES
      ========================================================================= */}
      {activeMenu === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Admin Management Toolbar & Search Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari fase roadmap, materi, atau aktivitas..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua ({milestones.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'IN_PROGRESS'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Aktif ({milestones.filter(m => m.status === 'IN_PROGRESS').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'COMPLETED'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Selesai ({milestones.filter(m => m.status === 'COMPLETED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('UPCOMING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'UPCOMING'
                      ? 'bg-slate-700 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Akan Datang ({milestones.filter(m => m.status === 'UPCOMING').length})
                </button>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Fase Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Kembalikan roadmap ke 5 Fase Standar SNPMB"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Reset Standar</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Roadmap Resmi Terverifikasi</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePrintRoadmap}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak Rencana Roadmap"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>

          {/* Horizontal Phase Milestone Navigator Cards */}
          {filteredMilestones.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${filteredMilestones.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-3`}>
              {filteredMilestones.map((phase, index) => {
                const isSelected = phase.id === selectedPhaseId;
                const isCompleted = phase.status === 'COMPLETED';
                const isInProgress = phase.status === 'IN_PROGRESS';

                return (
                  <div
                    key={phase.id}
                    onClick={() => setSelectedPhaseId(phase.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-blue-950/90 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                        : isCompleted
                        ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400/60'
                        : isInProgress
                        ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400/60'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
                    )}

                    <div>
                      {/* Top Header: Phase Number & Status Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-slate-400 uppercase">
                          FASE {phase.phaseNumber}
                        </span>

                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Selesai
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Akan Datang
                          </span>
                        )}
                      </div>

                      {/* Title & Date Range */}
                      <div className="font-bold text-xs text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                        {phase.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {phase.dateRange}
                      </div>
                    </div>

                    {/* Progress & Quick Action Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Progres</span>
                        <span className="font-mono font-bold text-slate-300">
                          {phase.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted
                              ? 'bg-emerald-400'
                              : isInProgress
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${phase.progressPercentage}%` }}
                        />
                      </div>

                      {/* Admin Quick Card Actions (Edit, Delete, Move) */}
                      {isAdmin && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-slate-400 opacity-90 group-hover:opacity-100 transition-opacity">
                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={e => handleMovePhase(index, 'left', e)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Geser ke kiri"
                            >
                              <ArrowUp className="w-3 h-3 -rotate-90" />
                            </button>
                            <button
                              type="button"
                              disabled={index === filteredMilestones.length - 1}
                              onClick={e => handleMovePhase(index, 'right', e)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Geser ke kanan"
                            >
                              <ArrowDown className="w-3 h-3 -rotate-90" />
                            </button>
                          </div>

                          {/* Edit / Delete Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={e => handleOpenEditModal(phase, e)}
                              className="p-1 rounded hover:bg-blue-950/80 text-blue-400 hover:text-blue-200 transition-colors cursor-pointer"
                              title="Edit Fase Roadmap"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={e => handleOpenDeleteModal(phase, e)}
                              className="p-1 rounded hover:bg-rose-950/80 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                              title="Hapus Fase Roadmap"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="font-bold text-white text-base">Tidak ada fase roadmap yang cocok</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau filter status, atau tambahkan fase roadmap baru.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Fase Baru</span>
                </button>
              )}
            </div>
          )}

          {/* Detail Selected Phase Card */}
          {selectedPhase && (
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header with Details & Admin Edit Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase">
                      {selectedPhase.badgeTag}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedPhase.subtitle}
                    </span>
                    {selectedPhase.status === 'COMPLETED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Selesai 100%
                      </span>
                    ) : selectedPhase.status === 'IN_PROGRESS' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        Fase Aktif Saat Ini ({selectedPhase.progressPercentage}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                        Fase Mendatang
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {selectedPhase.phaseName}: {selectedPhase.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-2xl">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200">
                      Jadwal: {selectedPhase.dateRange}
                    </span>
                  </div>

                  {/* Admin CRUD Action Buttons */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(selectedPhase)}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                        title="Edit detail fase roadmap ini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Fase</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(selectedPhase)}
                        className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-950/80 transition-colors cursor-pointer"
                        title="Hapus fase roadmap ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Quick Adjuster Inline Bar (Direct 1-Click Status & Progress Control) */}
              {isAdmin && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">Pengaturan Cepat Status & Progres Admin</div>
                      <div className="text-[11px] text-slate-400">Ubah status atau geser progres langsung tanpa membuka modal</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Quick Status Buttons */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => handleQuickUpdateStatus(selectedPhase.id, 'UPCOMING')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedPhase.status === 'UPCOMING'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Akan Datang
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUpdateStatus(selectedPhase.id, 'IN_PROGRESS')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedPhase.status === 'IN_PROGRESS'
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Aktif
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickUpdateStatus(selectedPhase.id, 'COMPLETED')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          selectedPhase.status === 'COMPLETED'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Selesai
                      </button>
                    </div>

                    {/* Quick Progress Slider */}
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-bold">Progres:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={selectedPhase.progressPercentage}
                        onChange={e => handleQuickProgressChange(selectedPhase.id, parseInt(e.target.value) || 0)}
                        className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-xs font-mono font-bold text-blue-400 w-9 text-right">
                        {selectedPhase.progressPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedPhase.description}
              </p>

              {/* 3 Columns: Key Activities, Deliverables, and Tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Key Activities */}
                <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Aktivitas Utama</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {selectedPhase.keyActivities.length} Poin
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {selectedPhase.keyActivities.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables / Luaran */}
                <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Target & Luaran Hasil</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {selectedPhase.deliverables.length} Poin
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {selectedPhase.deliverables.map((del, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expert Tips */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Tips Strategi Ahli</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed italic">
                    "{selectedPhase.tips}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7 Subtes Blueprint Explorer Section */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
                  <BrainCircuit className="w-4 h-4" />
                  <span>Blueprint Kurikulum & Silabus Subtes</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white">
                  Eksplorasi 7 Subtes Resmi UTBK-SNBT
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pahami materi esensial, distribusi waktu pengerjaan per soal, dan level penguasaan yang dibutuhkan.
                </p>
              </div>

              {/* Subtest Selector Chips */}
              <div className="flex flex-wrap gap-2">
                {SNBT_SUBTEST_LIST.map(sub => {
                  const isSubActive = sub.subtestCode === selectedSubtestCode;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubtestCode(sub.subtestCode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSubActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sub.subtestCode}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Subtest Deep Dive Card */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-bold text-blue-400">
                    Kategori: {selectedSubtest.category}
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white mt-0.5">
                    {selectedSubtest.subtestName} ({selectedSubtest.subtestCode})
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                    <span className="text-slate-400">Jumlah Soal: </span>
                    <span className="font-bold text-white font-mono">{selectedSubtest.totalQuestions} Soal</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                    <span className="text-slate-400">Alokasi Waktu: </span>
                    <span className="font-bold text-amber-400 font-mono">{selectedSubtest.durationMinutes} Menit</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                    <span className="text-slate-400">Rata-rata/Soal: </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {Math.round((selectedSubtest.durationMinutes * 60) / selectedSubtest.totalQuestions)} Detik
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedSubtest.topics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {topic.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        topic.masteryLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {topic.masteryLevel === 'HIGH' ? 'Prioritas Tinggi' : 'Menengah'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: COUNTDOWN H-X & JADWAL SNBT
      ========================================================================= */}
      {activeMenu === 'countdown' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SnbtCountdownPage
            user={user}
            onNavigateTab={onNavigateTab}
            onSetActiveSubtab={onSetActiveSubtab as any}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* =========================================================================
          MODALS FOR CRUD OPERATIONS
      ========================================================================= */}

      {/* CREATE & EDIT MODAL */}
      <SnbtRoadmapModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMilestone(null);
        }}
        onSave={handleSaveMilestone}
        initialMilestone={editingMilestone}
        existingCount={milestones.length}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && milestoneToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Hapus Fase Roadmap?</h3>
                <p className="text-xs text-rose-300">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                Fase {milestoneToDelete.phaseNumber}
              </div>
              <div className="text-sm font-black text-white">
                {milestoneToDelete.phaseName}: {milestoneToDelete.title}
              </div>
              <div className="text-xs text-slate-400">
                Jadwal: {milestoneToDelete.dateRange}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMilestoneToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Ya, Hapus Fase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Reset Roadmap ke Standar?</h3>
                <p className="text-xs text-amber-300">Kembalikan ke 5 fase resmi kurikulum SNPMB.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh perubahan custom pada fase roadmap akan digantikan dengan data 5 Fase Standar SNPMB (Fase 1 s.d. Fase 5).
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                Ya, Reset ke Standar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
