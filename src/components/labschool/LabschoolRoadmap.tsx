import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import { getUserLabschoolLevel, isStudentLevelLocked } from '../../utils/labschoolHelpers';
import {
  RoadmapPhase,
  RoadmapMilestone,
  loadStoredRoadmapPhases,
  saveStoredRoadmapPhases,
  loadStoredRoadmapMilestones,
  saveStoredRoadmapMilestones,
  resetRoadmapToDefault
} from './labschoolRoadmapData';
import { LabschoolHorizontalTimeline } from './LabschoolHorizontalTimeline';
import { LabschoolRoadmapModal } from './LabschoolRoadmapModal';
import {
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  Plus,
  Settings,
  Search,
  LayoutGrid,
  Layers,
  ArrowRight,
  Edit3,
  Trash2,
  RotateCcw,
  Target
} from 'lucide-react';

interface LabschoolRoadmapProps {
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
}

export const LabschoolRoadmap: React.FC<LabschoolRoadmapProps> = ({
  user,
  onNavigateTab
}) => {
  // Roadmap Data & State
  const [phases, setPhases] = useState<RoadmapPhase[]>(() => loadStoredRoadmapPhases());
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(() => loadStoredRoadmapMilestones());

  // View & Filter States
  const [viewMode, setViewMode] = useState<'horizontal_timeline' | 'grid_list'>('horizontal_timeline');
  const userLabschoolLevel = useMemo(() => {
    return getUserLabschoolLevel(user);
  }, [user]);

  const isLockedForStudent = useMemo(() => {
    return isStudentLevelLocked(user);
  }, [user]);

  // Initial Level Filter based on student's class
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'SMP' | 'SMA'>(() => {
    const lvl = getUserLabschoolLevel(user);
    return lvl;
  });

  // Keep levelFilter in sync if student level is locked
  useEffect(() => {
    if (isLockedForStudent && (userLabschoolLevel === 'SMP' || userLabschoolLevel === 'SMA')) {
      setLevelFilter(userLabschoolLevel);
    }
  }, [isLockedForStudent, userLabschoolLevel]);
  const [activePhase, setActivePhase] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');

  // Admin CRUD Modal State
  const [isCrudModalOpen, setIsCrudModalOpen] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null);
  const [crudDefaultPhaseId, setCrudDefaultPhaseId] = useState<number>(1);

  // Completed Topics Tracker (User Specific)
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`labschool_completed_topics_${user.id}`);
      return saved ? JSON.parse(saved) : ['top-1', 'top-2'];
    } catch {
      return ['top-1', 'top-2'];
    }
  });

  const toggleTopicCompletion = (topicId: string) => {
    setCompletedTopicIds((prev) => {
      const updated = prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId];
      try {
        localStorage.setItem(`labschool_completed_topics_${user.id}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save completed topics', err);
      }
      return updated;
    });
  };

  // CRUD Handlers
  const handleSaveMilestone = (milestone: RoadmapMilestone, isNew: boolean) => {
    let updated: RoadmapMilestone[];
    if (isNew) {
      updated = [...milestones, milestone];
    } else {
      updated = milestones.map((m) => (m.id === milestone.id ? milestone : m));
    }
    setMilestones(updated);
    saveStoredRoadmapMilestones(updated);
    setSelectedMilestoneId(milestone.id);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    const updated = milestones.filter((m) => m.id !== milestoneId);
    setMilestones(updated);
    saveStoredRoadmapMilestones(updated);
    if (selectedMilestoneId === milestoneId) {
      setSelectedMilestoneId(updated[0]?.id || '');
    }
  };

  const handleSavePhase = (phase: RoadmapPhase) => {
    const updated = phases.map((p) => (p.id === phase.id ? phase : p));
    setPhases(updated);
    saveStoredRoadmapPhases(updated);
  };

  const handleResetToDefault = () => {
    const { phases: defPhases, milestones: defMilestones } = resetRoadmapToDefault();
    setPhases(defPhases);
    setMilestones(defMilestones);
    setSelectedMilestoneId(defMilestones[0]?.id || '');
  };

  const handleOpenAddModal = (phaseId?: number) => {
    setEditingMilestone(null);
    setCrudDefaultPhaseId(phaseId || activePhase || 1);
    setIsCrudModalOpen(true);
  };

  const handleOpenEditModal = (milestone: RoadmapMilestone) => {
    setEditingMilestone(milestone);
    setIsCrudModalOpen(true);
  };

  // Filtered Milestones
  const filteredMilestones = milestones.filter((m) => {
    if (levelFilter !== 'ALL' && m.level !== 'ALL' && m.level !== levelFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchFocus = m.focus.toLowerCase().includes(q);
      const matchTopics = m.topics.some((t) => t.toLowerCase().includes(q));
      const matchDeliverable = m.deliverables.toLowerCase().includes(q);
      const matchCategory = m.subtestCategory?.toLowerCase().includes(q);
      return matchTitle || matchFocus || matchTopics || matchDeliverable || matchCategory;
    }
    return true;
  });

  const totalTopicsCount = milestones.length;
  const completedCount = milestones.filter((m) => completedTopicIds.includes(m.id)).length;
  const progressPercent = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER: ROADMAP */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-800/40 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Kurikulum Terintegrasi Labschool
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TIMELINE RESMI
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              ROADMAP <span className="text-cyan-300 font-extrabold">Kurikulum Belajar Persiapan Tes Labschool</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Panduan roadmap timeline horizontal 4 fase belajar dari fondasi dasar, penguasaan materi HOTS, drill bank soal 5 tahun terakhir, hingga simulasi CBT nasional Labschool.
            </p>
          </div>

          {/* Progress Tracker Widget & Admin Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch gap-3 w-full lg:w-80 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 w-full shadow-lg space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Progress Penguasaan
                </span>
                <span className="font-extrabold text-emerald-400 font-mono">{progressPercent}%</span>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{completedCount} dari {totalTopicsCount} modul selesai</span>
                <span className="text-blue-300 font-medium">Auto-saved</span>
              </div>
            </div>

            {/* Admin CRUD Quick Trigger */}
            {user.role === 'admin' && (
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Modul</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCrudModalOpen(true)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
                  title="Kelola & Edit Seluruh Roadmap"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Kelola CRUD</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Level Filter & View Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Level Filter Tabs or Locked Student Badge */}
            {isLockedForStudent ? (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border shadow-inner ${
                levelFilter === 'SMP'
                  ? 'bg-blue-950/70 border-blue-500/40 text-blue-200'
                  : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200'
              }`}>
                {levelFilter === 'SMP' ? <GraduationCap className="w-4 h-4 text-blue-400" /> : <Award className="w-4 h-4 text-cyan-400" />}
                <span className="font-extrabold text-xs text-white">
                  Jenjang: {levelFilter} Labschool
                </span>
                <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${
                  levelFilter === 'SMP'
                    ? 'bg-blue-500/30 text-blue-200 border-blue-500/50'
                    : 'bg-cyan-500/30 text-cyan-200 border-cyan-500/50'
                }`}>
                  {user.className || `${levelFilter}-LABSCHOOL`}
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  (Otomatis Sesuai Kelas)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setLevelFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    levelFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua Jenjang
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('SMP')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    levelFilter === 'SMP'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SMP Labschool (Kelas 6 SD)
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('SMA')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    levelFilter === 'SMA'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SMA Labschool (Kelas 9 SMP)
                </button>
              </div>
            )}

            {/* View Mode Toggle: Horizontal Timeline vs Grid */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setViewMode('horizontal_timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'horizontal_timeline'
                    ? 'bg-slate-800 text-cyan-300 shadow-md border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Timeline Horizontal</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid_list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid_list'
                    ? 'bg-slate-800 text-cyan-300 shadow-md border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Daftar Modul</span>
              </button>
            </div>
          </div>

          {/* PSB Shortcuts */}
          <div className="flex items-center gap-2">
            {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMP') && (
              <button
                type="button"
                onClick={() => onNavigateTab('labschool_psb_smp')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-xl transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Modul PSB SMP
              </button>
            )}

            {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMA') && (
              <button
                type="button"
                onClick={() => onNavigateTab('labschool_psb_sma')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-xl transition-all"
              >
                <Award className="w-3.5 h-3.5" /> Modul PSB SMA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & QUICK FILTER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi, subtes, atau silabus..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Menampilkan <strong className="text-white">{filteredMilestones.length}</strong> dari {milestones.length} modul</span>
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="text-blue-400 hover:text-blue-300 font-bold ml-2 underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Modul</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY VIEW: HORIZONTAL TIMELINE OR GRID */}
      {/* ========================================================================= */}
      {viewMode === 'horizontal_timeline' ? (
        <LabschoolHorizontalTimeline
          phases={phases}
          milestones={filteredMilestones}
          completedTopicIds={completedTopicIds}
          onToggleTopicCompletion={toggleTopicCompletion}
          user={user}
          onNavigateTab={onNavigateTab}
          onEditMilestone={handleOpenEditModal}
          onDeleteMilestone={handleDeleteMilestone}
          onAddMilestone={handleOpenAddModal}
          selectedMilestoneId={selectedMilestoneId}
          onSelectMilestone={setSelectedMilestoneId}
        />
      ) : (
        /* GRID / LIST VIEW OF MILESTONES BY PHASE */
        <div className="space-y-6">
          {/* Phase Stepper Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {phases.map((phase) => {
              const isActive = activePhase === phase.id;
              const phaseMilestones = milestones.filter((m) => m.phaseId === phase.id);
              const isFinished =
                phaseMilestones.length > 0 &&
                phaseMilestones.every((m) => completedTopicIds.includes(m.id));

              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => setActivePhase(phase.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {phase.number}
                      </span>
                      {isFinished && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <Check className="w-3 h-3" /> Selesai
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-white line-clamp-1">
                      {phase.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {phase.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {phase.duration}
                    </span>
                    <span className="font-bold text-blue-400">
                      {phaseMilestones.length} Modul
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Card */}
          {(() => {
            const currentPhaseObj = phases.find((p) => p.id === activePhase) || phases[0];
            return (
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-extrabold text-sm shrink-0">
                    {currentPhaseObj.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {currentPhaseObj.number}: {currentPhaseObj.title}
                    </h4>
                    <p className="text-xs text-slate-300">{currentPhaseObj.desc}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60 shrink-0 self-start sm:self-center">
                  {currentPhaseObj.badge}
                </span>
              </div>
            );
          })()}

          {/* Milestones list for active phase */}
          <div className="space-y-4">
            {filteredMilestones
              .filter((m) => m.phaseId === activePhase)
              .map((milestone) => {
                const isDone = completedTopicIds.includes(milestone.id);

                return (
                  <div
                    key={milestone.id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 shadow-xl ${
                      isDone
                        ? 'bg-slate-900/90 border-emerald-900/60 shadow-emerald-950/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-start sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTopicCompletion(milestone.id)}
                          className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500 hover:text-white'
                          }`}
                          title={isDone ? 'Klik untuk tandai belum selesai' : 'Klik untuk tandai sudah dikuasai'}
                        >
                          {isDone ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {milestone.weekRange}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                                milestone.level === 'SMP'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : milestone.level === 'SMA'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              Target: {milestone.level === 'ALL' ? 'SMP & SMA' : `Kelas ${milestone.level}`}
                            </span>
                            {milestone.subtestCategory && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {milestone.subtestCategory}
                              </span>
                            )}
                            {milestone.importance === 'CRITICAL' && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Prioritas Tinggi
                              </span>
                            )}
                          </div>

                          <h3 className={`text-base sm:text-lg font-bold ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                            {milestone.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end lg:self-center">
                        <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> ~{milestone.estHours} Jam Belajar
                        </span>

                        {user.role === 'admin' && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(milestone)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all"
                              title="Edit Modul"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus modul "${milestone.title}"?`)) {
                                  handleDeleteMilestone(milestone.id);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/30 transition-all"
                              title="Hapus Modul"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Focus Area */}
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Target className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Fokus Pokok Bahasan:</span>
                        <span className="text-slate-200">{milestone.focus}</span>
                      </div>

                      {/* Topics Bullet List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {milestone.topics.map((t, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>

                      {/* Deliverables / Output */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Target Output: <strong className="text-white">{milestone.deliverables}</strong></span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTopicCompletion(milestone.id)}
                          className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                          }`}
                        >
                          {isDone ? '✓ Sudah Dikuasai' : 'Tandai Dikuasai'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN CRUD MODAL */}
      {/* ========================================================================= */}
      <LabschoolRoadmapModal
        isOpen={isCrudModalOpen}
        onClose={() => {
          setIsCrudModalOpen(false);
          setEditingMilestone(null);
        }}
        phases={phases}
        milestones={milestones}
        onSaveMilestone={handleSaveMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        onSavePhase={handleSavePhase}
        onResetToDefault={handleResetToDefault}
        initialMilestone={editingMilestone}
        defaultPhaseId={crudDefaultPhaseId}
      />

    </div>
  );
};
