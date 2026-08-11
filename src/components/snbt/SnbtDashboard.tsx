import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import { SnbtStudentsPage } from './SnbtStudentsPage';
import { SnbtCampusPage } from './SnbtCampusPage';
import { SnbtRoadmapPage } from './SnbtRoadmapPage';
import { SnbtCountdownPage } from './SnbtCountdownPage';
import { SnbtLaporanPage } from './SnbtLaporanPage';
import { SnbtSyllabusPage } from './SnbtSyllabusPage';
import { SnbtMiniCountdownBadge } from './SnbtMiniCountdownBadge';
import {
  loadStoredSnbtStudents,
  loadStoredSnbtRoadmapMilestones,
  loadStoredSnbtCountdownTargets,
  SNBT_SUBTEST_LIST,
  SnbtStudentProfile,
  SnbtMilestone,
  SnbtCountdownTarget
} from './snbtData';
import {
  DEFAULT_SNBT_CAMPUSES,
  loadStoredSnbtCampuses
} from './snbtCampusData';
import {
  SNBT_7_SUBTEST_METAS,
  loadSnbtSyllabusModules
} from './snbtSyllabusData';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  School,
  Compass,
  Clock,
  BarChart3,
  Sparkles,
  Flame,
  Target,
  Award,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Lightbulb,
  FileCheck2,
  ChevronRight,
  Layers,
  GraduationCap,
  Timer,
  Zap,
  Activity,
  Check,
  ExternalLink
} from 'lucide-react';

interface SnbtDashboardProps {
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
  initialSubtab?: 'overview' | 'syllabus' | 'students' | 'campus' | 'roadmap' | 'countdown' | 'reports';
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  [key: string]: any;
}

export type SnbtSubtab = 'overview' | 'syllabus' | 'students' | 'campus' | 'roadmap' | 'countdown' | 'reports';

export const SnbtDashboard: React.FC<SnbtDashboardProps> = ({
  user,
  onNavigateTab,
  initialSubtab = 'overview',
  onShowToast
}) => {
  const [activeSubtab, setActiveSubtab] = useState<SnbtSubtab>(initialSubtab);

  // Sync if initialSubtab prop changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(initialSubtab);
    }
  }, [initialSubtab]);

  // Load summary state from data stores for the Overview Hub
  const [students, setStudents] = useState<SnbtStudentProfile[]>([]);
  const [milestones, setMilestones] = useState<SnbtMilestone[]>([]);
  const [countdownTargets, setCountdownTargets] = useState<SnbtCountdownTarget[]>([]);
  const [campusesCount, setCampusesCount] = useState<number>(0);
  const [modulesCount, setModulesCount] = useState<number>(0);

  useEffect(() => {
    const loadedStudents = loadStoredSnbtStudents();
    setStudents(loadedStudents);

    const loadedMilestones = loadStoredSnbtRoadmapMilestones();
    setMilestones(loadedMilestones);

    const loadedTargets = loadStoredSnbtCountdownTargets();
    setCountdownTargets(loadedTargets);

    const loadedCampuses = loadStoredSnbtCampuses();
    setCampusesCount(loadedCampuses.length || DEFAULT_SNBT_CAMPUSES.length);

    const loadedModules = loadSnbtSyllabusModules();
    setModulesCount(loadedModules.length);
  }, [activeSubtab]);

  // Nearest Target calculation for live countdown ticker in overview
  const nearestTarget = countdownTargets.length > 0 ? countdownTargets[0] : null;

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

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
          isPast: true
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
          isPast: false
        });
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [nearestTarget]);

  // Current active roadmap phase
  const activePhase = useMemo(() => {
    if (!milestones.length) return null;
    return milestones.find(m => m.status === 'IN_PROGRESS') || milestones[0];
  }, [milestones]);

  // High-level statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const veryReadyCount = students.filter(s => s.readinessLevel === 'SANGAT_SIAP').length;
    const readyCount = students.filter(s => s.readinessLevel === 'SIAP').length;
    const needHelpCount = students.filter(s => s.readinessLevel === 'PERLU_BIMBINGAN').length;

    const avgScores = students.map(s => s.avgTryoutScore).filter(score => score > 0);
    const overallAvgScore = avgScores.length
      ? Math.round(avgScores.reduce((acc, curr) => acc + curr, 0) / avgScores.length)
      : 712;

    const targetMetCount = students.filter(s => s.avgTryoutScore >= s.passingGrade1).length;

    return {
      totalStudents,
      veryReadyCount,
      readyCount,
      needHelpCount,
      overallAvgScore,
      targetMetCount
    };
  }, [students]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="space-y-6 pb-16">
      {/* =========================================================================
          1. UNIFIED PAGE HEADER HERO BANNER
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Info Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-gradient-to-r from-rose-600/30 via-indigo-600/30 to-blue-600/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  PUSAT KENDALI PRESTASI 2026
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Standar IRT SNPMB Resmi
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Kelas XII-UTBK & Gap Year
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Pusat Kendali Prestasi SNBT/UTBK 2026
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Pusat komando terpadu persiapan intensif UTBK-SNBT 2026. Akses kurikulum 7 subtes terstandar IRT, manajemen profil & target jurusan siswa, direktori passing grade PTN, roadmap 5 fase strategis, live countdown H-x, serta analisis rapor tryout.
              </p>
            </div>

            {/* Header Right Mini Countdown Widget */}
            <div className="shrink-0 flex items-center gap-3">
              <SnbtMiniCountdownBadge
                onSetActiveSubtab={() => setActiveSubtab('countdown')}
                onNavigateTab={onNavigateTab}
                size="sm"
              />
            </div>
          </div>

          {/* =========================================================================
              2. MENU GROUP BAR DI BAWAH HALAMAN JUDUL (GROUPED NAVIGATION)
          ========================================================================= */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Menu Navigasi Pusat Kendali (4 Kelompok Menu)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {/* GROUP 1: BERANDA & IKHTISAR */}
              <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 flex flex-col justify-between shadow-inner">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-3 h-3 text-indigo-400" />
                    1. UTAMA & IKHTISAR
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">HUB</span>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  <button
                    type="button"
                    id="snbt-menu-tab-overview"
                    onClick={() => setActiveSubtab('overview')}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSubtab === 'overview'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Ikhtisar Dashboard</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-80">Ringkasan</span>
                  </button>
                </div>
              </div>

              {/* GROUP 2: KURIKULUM & AKADEMIK */}
              <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 flex flex-col justify-between shadow-inner">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-blue-400" />
                    2. KURIKULUM & MATERI
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">7 SUBTES</span>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  <button
                    type="button"
                    id="snbt-menu-tab-syllabus"
                    onClick={() => setActiveSubtab('syllabus')}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSubtab === 'syllabus'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                      <span>Silabus & Modul 7 Subtes</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-500/30 px-1.5 py-0.5 rounded text-blue-200">
                      {modulesCount || 35} Modul
                    </span>
                  </button>

                  <button
                    type="button"
                    id="snbt-menu-tab-roadmap"
                    onClick={() => setActiveSubtab('roadmap')}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSubtab === 'roadmap'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Roadmap 5 Fase Strategis</span>
                    </div>
                    <span className="text-[10px] font-mono bg-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-200">
                      5 Fase
                    </span>
                  </button>
                </div>
              </div>

              {/* GROUP 3: SISWA & TARGET PTN */}
              <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between shadow-inner">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-amber-400" />
                    3. SISWA & TARGET PTN
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">KAMPUS</span>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  {user.role !== 'student' && (
                    <button
                      type="button"
                      id="snbt-menu-tab-students"
                      onClick={() => setActiveSubtab('students')}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        activeSubtab === 'students'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-300" />
                        <span>Data Siswa XII-UTBK</span>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-200">
                        {students.length} Siswa
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="snbt-menu-tab-campus"
                    onClick={() => setActiveSubtab('campus')}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSubtab === 'campus'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <School className="w-3.5 h-3.5 text-purple-300" />
                      <span>Pilihan Kampus & PTN</span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-500/30 px-1.5 py-0.5 rounded text-purple-200">
                      {campusesCount}+ PTN
                    </span>
                  </button>
                </div>
              </div>

              {/* GROUP 4: PEMANTAUAN & LAPORAN */}
              <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between shadow-inner">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3 text-emerald-400" />
                    4. MONITORING & HASIL
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">EVALUASI</span>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  <button
                    type="button"
                    id="snbt-menu-tab-countdown"
                    onClick={() => setActiveSubtab('countdown')}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSubtab === 'countdown'
                        ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-rose-300" />
                      <span>Countdown & Jadwal</span>
                    </div>
                    <span className="text-[10px] font-mono bg-rose-500/30 px-1.5 py-0.5 rounded text-rose-200">
                      H-{timeRemaining.days}
                    </span>
                  </button>

                  <button
                    type="button"
                    id="snbt-menu-tab-reports"
                    onClick={() => setActiveSubtab('reports')}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSubtab === 'reports'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Laporan & Rapor IRT</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">
                      Tryout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: OVERVIEW / IKHTISAR DASHBOARD (POLISHED EXECUTIVE VIEW)
      ========================================================================= */}
      {activeSubtab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 4 KPI Executive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Countdown H-x Live */}
            <div
              onClick={() => setActiveSubtab('countdown')}
              className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400/60 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  UTBK GELOMBANG 1
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400">Target Hari-H Ujian</div>
                <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                  <span className="text-rose-400 text-3xl">H-{timeRemaining.days}</span>
                  <span className="text-xs text-slate-400 font-sans">Hari Lagi</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
                  <span>{nearestTarget?.title || 'UTBK Gelombang 1'}</span>
                  <span className="font-mono text-rose-300 font-bold">
                    {pad(timeRemaining.hours)}j:{pad(timeRemaining.minutes)}m:{pad(timeRemaining.seconds)}d
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Siswa Kelas XII-UTBK / Direktori PTN */}
            {user.role !== 'student' ? (
              <div
                onClick={() => setActiveSubtab('students')}
                className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ROSTER SISWA
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400">Siswa Kelas XII-UTBK</div>
                  <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                    <span className="text-amber-400 text-3xl">{stats.totalStudents}</span>
                    <span className="text-xs text-slate-400 font-sans">Siswa Aktif</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
                    <span className="text-emerald-400 font-bold">{stats.veryReadyCount} Sangat Siap</span>
                    <span className="text-slate-400">{stats.readyCount} Siap</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setActiveSubtab('campus')}
                className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <School className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    DIREKTORI PTN
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400">Pilihan Kampus & PTN</div>
                  <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                    <span className="text-purple-400 text-3xl">{campusesCount}+</span>
                    <span className="text-xs text-slate-400 font-sans">PTN Nasional</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
                    <span>Passing Grade IRT</span>
                    <span className="text-purple-300 font-bold">Eksplorasi →</span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Kurikulum 7 Subtes & Modul */}
            <div
              onClick={() => setActiveSubtab('syllabus')}
              className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 hover:border-blue-400/60 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  100% TERPETAKAN
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400">Cakupan 7 Subtes SNBT</div>
                <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                  <span className="text-blue-400 text-3xl">{modulesCount || 35}</span>
                  <span className="text-xs text-slate-400 font-sans">Modul Pembahasan</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
                  <span>TPS, Literasi & PM</span>
                  <span className="text-cyan-300 font-bold">Standar IRT</span>
                </div>
              </div>
            </div>

            {/* Card 4: Rata-Rata Skor Tryout IRT */}
            <div
              onClick={() => setActiveSubtab('reports')}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RATA-RATA TRYOUT
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400">Rata-Rata Skor IRT Siswa</div>
                <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                  <span className="text-emerald-400 text-3xl">{stats.overallAvgScore}</span>
                  <span className="text-xs text-slate-400 font-sans">/ 1000 Poin</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
                  <span>Target Lolos: ≥ 700</span>
                  <span className="text-emerald-300 font-bold">{stats.targetMetCount} Lolos Target</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Roadmap Phase Highlight Banner */}
          {activePhase && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-slate-900 border border-blue-500/40 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                      <Activity className="w-3 h-3 text-amber-400" />
                      FASE AKTIF ROADMAP SAAT INI
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Jadwal: {activePhase.dateRange}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-white">
                    {activePhase.phaseName}: {activePhase.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePhase.description}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full"
                        style={{ width: `${activePhase.progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {activePhase.progressPercentage}% Capaian
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSubtab('roadmap')}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
                  >
                    <Compass className="w-4 h-4 text-cyan-300" />
                    <span>Buka Roadmap Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6 Feature Modules Bento Quick Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base md:text-lg font-black text-white">
                  Pusat Akses Cepat Modul & Fitur SNBT 2026
                </h2>
              </div>
              <span className="text-xs text-slate-400">Pilih modul untuk membuka halaman detail</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Module 1: Silabus & Modul 7 Subtes */}
              <div
                onClick={() => setActiveSubtab('syllabus')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-blue-950/80 border border-blue-500/40 text-blue-400 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      7 Subtes IRT
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                      Silabus & Modul Pembahasan
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Bank materi, silabus mingguan 7 subtes, plotting jadwal ajar, dan modul bedah soal HOTS terstruktur.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-bold">
                  <span>Akses Silabus & Modul</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Module 2: Data Siswa XII-UTBK (Only for Admin & Teacher) */}
              {user.role !== 'student' && (
                <div
                  onClick={() => setActiveSubtab('students')}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {students.length} Siswa Terdaftar
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        Data Siswa & Target Jurusan
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Kelola profil siswa, pilihan prodi 1 & 2 PTN, level kesiapan, catatan konseling, dan simulasi kelulusan.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>Buka Data Siswa</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* Module 3: Pilihan Kampus & Passing Grade */}
              <div
                onClick={() => setActiveSubtab('campus')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 group-hover:scale-110 transition-transform">
                      <School className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {campusesCount}+ Kampus PTN
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                      Direktori Kampus & Passing Grade
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Database lengkap PTN di Indonesia, daya tampung, rasio keketatan, passing grade IRT, dan prospek karir.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-bold">
                  <span>Eksplorasi Kampus</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Module 4: Roadmap 5 Fase Strategis */}
              <div
                onClick={() => setActiveSubtab('roadmap')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      5 Fase Milestone
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      Roadmap Sukses 5 Fase
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Panduan timeline belajar bertahap: Diagnostik, Penguasaan Konsep, Drilling Soal, Simulasi Tryout, & Finalisasi.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-bold">
                  <span>Lihat Roadmap Fase</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Module 5: Countdown H-x & Jadwal SNBT */}
              <div
                onClick={() => setActiveSubtab('countdown')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Live Countdown
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors">
                      Countdown Hari-H & Jadwal Gelombang
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Timer real-time countdown, jadwal resmi Gelombang 1 & 2 SNPMB, checklist dokumen ujian, dan alur Pusat UTBK.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-bold">
                  <span>Buka Countdown Ujian</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Module 6: Laporan & Analisis Rapor IRT */}
              <div
                onClick={() => setActiveSubtab('reports')}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Rapor Tryout & Cetak
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      Laporan & Analisis Rapor IRT
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Evaluasi performa tryout, analisis kelemahan subtes, radar grafik kemajuan belajar, dan cetak rapor evaluasi.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span>Lihat Rapor & Analisis</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* 7 Subtes UTBK Blueprint Matrix Table */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
                  <BrainCircuit className="w-4 h-4" />
                  <span>Struktur Komponen Ujian UTBK-SNBT 2026</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white">
                  Matriks 7 Subtes Resmi & Alokasi Waktu Ujian
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total 160 Soal dengan alokasi waktu total 195 Menit sesuai pedoman SNPMB BPPP Kemendikbudristek.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubtab('syllabus')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto cursor-pointer"
              >
                <span>Pelajari Materi Subtes</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {/* Subtests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {SNBT_7_SUBTEST_METAS.map(sub => (
                <div
                  key={sub.code}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {sub.category}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {sub.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {sub.description}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <div className="text-slate-500">Soal</div>
                      <div className="font-bold text-white font-mono">{sub.totalQuestions}</div>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <div className="text-slate-500">Waktu</div>
                      <div className="font-bold text-amber-400 font-mono">{sub.durationMinutes}m</div>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                      <div className="text-slate-500">Target</div>
                      <div className="font-bold text-emerald-400 font-mono">{sub.targetScoreAverage}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary Box in Grid */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-1">
                    TOTAL KOMPONEN UTBK
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    160 <span className="text-xs font-normal text-slate-400">Soal</span> / 195 <span className="text-xs font-normal text-slate-400">Menit</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Sistem Item Response Theory (IRT) memberi bobot lebih tinggi pada soal yang tingkat kesulitannya tinggi dan sedikit dijawab benar.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-indigo-500/20 text-[10px] text-indigo-300 font-bold flex items-center justify-between">
                  <span>Standar SNPMB 2026</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Standar & Tips Penilaian IRT Box */}
          <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0">
                <Lightbulb className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-amber-300">
                  Prinsip Strategi Penilaian IRT (Item Response Theory) UTBK-SNBT
                </h4>
                <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
                  Dalam sistem IRT, tidak ada pengurangan nilai untuk jawaban salah (+0). Kerjakan seluruh soal dengan teliti, prioritaskan subtes penguasaan terbaik di awal, dan jangan pernah mengosongkan lembar jawaban saat waktu tersisa sedikit.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubtab('reports')}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Simulasi Skor IRT
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SILABUS & MODUL 7 SUBTES
      ========================================================================= */}
      {activeSubtab === 'syllabus' && (
        <div className="animate-in fade-in duration-200">
          <SnbtSyllabusPage
            user={user}
            onNavigateTab={onNavigateTab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DATA SISWA KELAS XII-UTBK
      ========================================================================= */}
      {activeSubtab === 'students' && user.role !== 'student' && (
        <div className="animate-in fade-in duration-200">
          <SnbtStudentsPage
            user={user}
            onNavigateTab={onNavigateTab}
            onSetActiveSubtab={setActiveSubtab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW 4: PILIHAN KAMPUS & PASSING GRADE
      ========================================================================= */}
      {activeSubtab === 'campus' && (
        <div className="animate-in fade-in duration-200">
          <SnbtCampusPage
            user={user}
            onNavigateTab={onNavigateTab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW 5: ROADMAP 5 FASE STRATEGIS
      ========================================================================= */}
      {activeSubtab === 'roadmap' && (
        <div className="animate-in fade-in duration-200">
          <SnbtRoadmapPage
            user={user}
            initialMenu="roadmap"
            onNavigateTab={onNavigateTab}
            onSetActiveSubtab={setActiveSubtab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW 6: COUNTDOWN H-X & JADWAL GELOMBANG
      ========================================================================= */}
      {activeSubtab === 'countdown' && (
        <div className="animate-in fade-in duration-200">
          <SnbtCountdownPage
            user={user}
            onNavigateTab={onNavigateTab}
            onSetActiveSubtab={setActiveSubtab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW 7: LAPORAN & RAPOR IRT
      ========================================================================= */}
      {activeSubtab === 'reports' && (
        <div className="animate-in fade-in duration-200">
          <SnbtLaporanPage
            user={user}
            onNavigateTab={onNavigateTab}
            onShowToast={onShowToast}
          />
        </div>
      )}
    </div>
  );
};
