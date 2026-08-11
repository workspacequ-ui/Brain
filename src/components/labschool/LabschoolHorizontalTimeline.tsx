import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  RoadmapPhase,
  RoadmapMilestone
} from './labschoolRoadmapData';
import { User, SidebarTab } from '../../types';
import { getUserLabschoolLevel } from '../../utils/labschoolHelpers';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Target,
  Edit3,
  Trash2,
  GraduationCap,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Compass
} from 'lucide-react';

interface LabschoolHorizontalTimelineProps {
  phases: RoadmapPhase[];
  milestones: RoadmapMilestone[];
  completedTopicIds: string[];
  onToggleTopicCompletion: (id: string) => void;
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
  onEditMilestone?: (milestone: RoadmapMilestone) => void;
  onDeleteMilestone?: (milestoneId: string) => void;
  onAddMilestone?: (phaseId?: number) => void;
  selectedMilestoneId?: string;
  onSelectMilestone?: (id: string) => void;
}

export const LabschoolHorizontalTimeline: React.FC<LabschoolHorizontalTimelineProps> = ({
  phases,
  milestones,
  completedTopicIds,
  onToggleTopicCompletion,
  user,
  onNavigateTab,
  onEditMilestone,
  onDeleteMilestone,
  onAddMilestone,
  selectedMilestoneId,
  onSelectMilestone
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const userLabschoolLevel = useMemo(() => {
    return getUserLabschoolLevel(user);
  }, [user]);

  // Active selected milestone for detail view
  const [internalSelectedId, setInternalSelectedId] = useState<string>(() => {
    return selectedMilestoneId || milestones[0]?.id || '';
  });

  const currentSelectedId = selectedMilestoneId !== undefined ? selectedMilestoneId : internalSelectedId;

  const handleSelectMilestone = (id: string) => {
    setInternalSelectedId(id);
    if (onSelectMilestone) {
      onSelectMilestone(id);
    }
  };

  const selectedMilestone =
    milestones.find((m) => m.id === currentSelectedId) || milestones[0] || null;

  const selectedPhase = selectedMilestone
    ? phases.find((p) => p.id === selectedMilestone.phaseId) || phases[0]
    : phases[0];

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [milestones]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = 380;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollability, 300);
    }
  };

  const phaseColorMap: Record<string, { line: string; border: string; bg: string; text: string; badge: string; ring: string }> = {
    blue: {
      line: 'from-blue-500 to-cyan-500',
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/40',
      text: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      ring: 'ring-blue-500/50'
    },
    cyan: {
      line: 'from-cyan-500 to-teal-500',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      ring: 'ring-cyan-500/50'
    },
    amber: {
      line: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      ring: 'ring-amber-500/50'
    },
    emerald: {
      line: 'from-emerald-500 to-teal-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      ring: 'ring-emerald-500/50'
    },
    purple: {
      line: 'from-purple-500 to-pink-500',
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/40',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      ring: 'ring-purple-500/50'
    },
    rose: {
      line: 'from-rose-500 to-red-500',
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      ring: 'ring-rose-500/50'
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TIMELINE CONTROLS & PHASE LEGEND BAR */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Timeline Garis Horizontal Persiapan Labschool
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {milestones.length} Tahapan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geser secara horizontal untuk melihat tahapan dari Minggu 1 hingga H-Day Ujian CBT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            {user.role === 'admin' && onAddMilestone && (
              <button
                type="button"
                onClick={() => onAddMilestone(selectedPhase.id)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>+ Tambah Modul</span>
              </button>
            )}

            {/* Scroll navigation arrows */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all"
                title="Geser Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all"
                title="Geser Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Phase Legend Track */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          {phases.map((ph) => {
            const phStyle = phaseColorMap[ph.color] || phaseColorMap.blue;
            const isPhaseActive = selectedPhase.id === ph.id;
            const phaseMilestones = milestones.filter((m) => m.phaseId === ph.id);
            const doneCount = phaseMilestones.filter((m) => completedTopicIds.includes(m.id)).length;

            return (
              <div
                key={ph.id}
                onClick={() => {
                  const firstInPhase = phaseMilestones[0];
                  if (firstInPhase) {
                    handleSelectMilestone(firstInPhase.id);
                  }
                }}
                className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  isPhaseActive
                    ? `${phStyle.border} ${phStyle.bg} ring-1 ${phStyle.ring}`
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-black ${phStyle.text}`}>{ph.number}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {doneCount}/{phaseMilestones.length} Selesai
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{ph.title}</h4>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">{ph.duration}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HORIZONTAL TIMELINE TRACK WITH CONNECTING MASTER LINE */}
      {/* ========================================================================= */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glow Ambient background */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-48 bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-48 bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Continuous Horizontal Timeline Line Background */}
        <div className="relative pt-6 pb-4">
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 snap-x"
            style={{ scrollBehavior: 'smooth' }}
          >
            {/* The Master Horizontal Connecting Line Bar */}
            <div className="absolute top-11 left-6 right-6 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 via-amber-400 to-emerald-400 rounded-full opacity-60 pointer-events-none" />

            {milestones.map((milestone, index) => {
              const phase = phases.find((p) => p.id === milestone.phaseId) || phases[0];
              const style = phaseColorMap[phase.color] || phaseColorMap.blue;
              const isDone = completedTopicIds.includes(milestone.id);
              const isSelected = milestone.id === currentSelectedId;

              return (
                <div
                  key={milestone.id}
                  onClick={() => handleSelectMilestone(milestone.id)}
                  className={`relative flex flex-col justify-between w-80 sm:w-88 shrink-0 rounded-3xl border transition-all duration-300 cursor-pointer snap-start p-5 ${
                    isSelected
                      ? `bg-slate-900 ${style.border} ring-2 ${style.ring} shadow-2xl scale-[1.02] z-10`
                      : isDone
                      ? 'bg-slate-900/90 border-emerald-900/50 hover:border-emerald-700/80 shadow-lg'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 shadow-lg'
                  }`}
                >
                  {/* Pin Node Connector to Master Horizontal Line */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-lg transition-transform ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-300 text-slate-950 scale-110'
                          : isSelected
                          ? 'bg-blue-600 border-white text-white ring-4 ring-blue-500/40 scale-125'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                    </div>
                    {/* Vertical connector stem to card */}
                    <div className={`w-0.5 h-3.5 ${isSelected ? 'bg-blue-500' : 'bg-slate-700'}`} />
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3 pt-2">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${style.badge}`}>
                        {phase.number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          <Calendar className="w-3 h-3 text-blue-400" /> {milestone.weekRange}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Title */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                            milestone.level === 'SMP'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : milestone.level === 'SMA'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          Target: {milestone.level === 'ALL' ? 'SMP & SMA' : milestone.level}
                        </span>

                        {milestone.subtestCategory && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {milestone.subtestCategory}
                          </span>
                        )}

                        {milestone.importance === 'CRITICAL' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            PRIORITAS TINGGI
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-bold leading-snug ${
                          isDone ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {milestone.title}
                      </h4>
                    </div>

                    {/* Focus Summary */}
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 line-clamp-2">
                      <strong className="text-slate-400 block text-[10px] uppercase font-mono">Fokus Materi:</strong>
                      {milestone.focus}
                    </div>

                    {/* Topic count & deliverables */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        {milestone.topics.length} Pokok Bahasan
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        ~{milestone.estHours} Jam
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Toggle Completion button (Admin/Teacher only) */}
                    {user.role !== 'student' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTopicCompletion(milestone.id);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Dikuasai</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Tandai</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Admin Action Buttons on Card */}
                    {user.role === 'admin' && (
                      <div className="flex items-center gap-1">
                        {onEditMilestone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditMilestone(milestone);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all"
                            title="Edit Modul Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteMilestone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMilestone(milestone.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/30 transition-all"
                            title="Hapus Modul Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-0.5 ml-auto">
                      <span>Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SPOTLIGHT DETAIL VIEW: SELECTED MILESTONE DETAILS & SYLLABUS */}
      {/* ========================================================================= */}
      {selectedMilestone && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedPhase.number}: {selectedPhase.title}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {selectedMilestone.weekRange}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  ~{selectedMilestone.estHours} Jam Belajar
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white">
                {selectedMilestone.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-400 font-semibold">
                Fokus Bahasan: {selectedMilestone.focus}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {user.role !== 'student' && (
                <button
                  type="button"
                  onClick={() => onToggleTopicCompletion(selectedMilestone.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                    completedTopicIds.includes(selectedMilestone.id)
                      ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                  }`}
                >
                  {completedTopicIds.includes(selectedMilestone.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sudah Dikuasai (Klik Batalkan)</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Tandai Selesai Dikuasai</span>
                    </>
                  )}
                </button>
              )}

              {user.role === 'admin' && onEditMilestone && (
                <button
                  type="button"
                  onClick={() => onEditMilestone(selectedMilestone)}
                  className="px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Modul</span>
                </button>
              )}

              {user.role === 'admin' && onDeleteMilestone && (
                <button
                  type="button"
                  onClick={() => onDeleteMilestone(selectedMilestone.id)}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topic syllabus breakdown */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Daftar Pokok Bahasan & Silabus ({selectedMilestone.topics.length} Materi)
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {selectedMilestone.topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Deliverables & Key metrics */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Target Output & Deliverable
                </h4>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white leading-relaxed">
                  {selectedMilestone.deliverables}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Integrasi PSB Labschool
                </h4>
                <p className="text-xs text-slate-400">
                  Pelajari panduan pendaftaran dan persyaratan jalur seleksi resmi Labschool 2027.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMP') && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('labschool_psb_smp')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center justify-between transition-colors"
                    >
                      <span>Modul PSB SMP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMA') && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('labschool_psb_sma')}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center justify-between transition-colors"
                    >
                      <span>Modul PSB SMA</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
