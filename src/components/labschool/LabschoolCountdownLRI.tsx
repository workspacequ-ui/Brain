import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  Timer,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Target,
  Flame,
  Zap,
  X,
  Settings,
  Clock,
  Minimize2,
  Maximize2,
  SlidersHorizontal,
  Check,
  RotateCcw,
  FileText
} from 'lucide-react';
import { LabschoolLriGauge } from './LabschoolLriGauge';
import { LABSCHOOL_SUBTESTS, calculateLriScore, getLatestTryoutForUser } from './labschoolSubtestData';

interface LabschoolCountdownLRIProps {
  user?: User;
  onOpenRoadmap?: () => void;
  onOpenTryout?: () => void;
  onOpenJournal?: () => void;
  onSelectSubtest?: (subtestCode: string) => void;
}

interface TestScheduleOption {
  id: string;
  name: string;
  targetDate: string; // ISO string
  type: string;
  campusTarget?: string;
  level?: string;
}

const DEFAULT_SCHEDULES: TestScheduleOption[] = [
  {
    id: 'psb-cbt-2027',
    name: 'Tes CBT Reguler PSB 2027',
    targetDate: '2027-01-17T07:30:00',
    type: 'Ujian CBT Serentak 5 Kampus',
    campusTarget: 'Semua Kampus Labschool',
    level: 'SMP & SMA'
  },
  {
    id: 'psbp-prestasi-2026',
    name: 'Jalur PSBP Prestasi 2026/2027',
    targetDate: '2026-11-15T08:00:00',
    type: 'Seleksi Portofolio & Wawancara',
    campusTarget: 'Rawamangun & Kebayoran',
    level: 'SMP & SMA'
  },
  {
    id: 'tryout-akbar-2026',
    name: 'Simulasi Akbar Tryout CBT 2026',
    targetDate: '2026-10-25T08:00:00',
    type: 'Simulasi Prediktif Nasional',
    campusTarget: '5 Kampus Labschool',
    level: 'SMP & SMA'
  }
];

export const LabschoolCountdownLRI: React.FC<LabschoolCountdownLRIProps> = ({
  user,
  onOpenRoadmap,
  onOpenTryout,
  onOpenJournal,
  onSelectSubtest
}) => {
  const isAdmin = user?.role === 'admin';

  // Stored state for schedule & settings
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(() => {
    return localStorage.getItem('labschool_active_schedule_id') || 'psb-cbt-2027';
  });

  const [eventName, setEventName] = useState<string>(() => {
    return localStorage.getItem('labschool_event_name') || 'Tes CBT Reguler PSB 2027';
  });

  const [customDate, setCustomDate] = useState<string>(() => {
    return localStorage.getItem('labschool_custom_test_date') || DEFAULT_SCHEDULES[0].targetDate;
  });

  const [targetCampus, setTargetCampus] = useState<string>(() => {
    return localStorage.getItem('labschool_target_campus') || 'Semua 5 Kampus Labschool';
  });

  const [targetLevel, setTargetLevel] = useState<string>(() => {
    return localStorage.getItem('labschool_target_level') || 'SMP & SMA';
  });

  // Display Mode: 'compact' (Tampilan Countdown Kecil) vs 'full' (Tampilan Lengkap)
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    return localStorage.getItem('labschool_countdown_compact') === 'true';
  });

  // Modals state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isLriModalOpen, setIsLriModalOpen] = useState<boolean>(false);

  // Temporary settings form inside modal
  const [formEventName, setFormEventName] = useState(eventName);
  const [formDate, setFormDate] = useState(() => customDate.split('T')[0] || '2027-01-17');
  const [formTime, setFormTime] = useState(() => customDate.split('T')[1]?.substring(0, 5) || '07:30');
  const [formTargetCampus, setFormTargetCampus] = useState(targetCampus);
  const [formTargetLevel, setFormTargetLevel] = useState(targetLevel);
  const [formCompactMode, setFormCompactMode] = useState(isCompactMode);
  const [saveToast, setSaveToast] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Latest Tryout (TO Terakhir) as the data source for 5 Subtests & LRI
  const latestTryout = React.useMemo(() => {
    return getLatestTryoutForUser(user, targetLevel.includes('SMP') ? 'SMP' : 'SMA');
  }, [user, targetLevel]);

  // Custom user subtest scores for LRI simulation - defaults directly to the latest TO scores!
  const [customScores, setCustomScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('labschool_lri_subtest_scores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const initialLatest = getLatestTryoutForUser(user, targetLevel.includes('SMP') ? 'SMP' : 'SMA');
    return initialLatest.subtestScores;
  });

  // Calculate LRI from subtest data (students strictly use latest TO scores)
  const activeScores = isAdmin ? customScores : latestTryout.subtestScores;
  const lriResult = calculateLriScore(activeScores);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  // Live Countdown ticker
  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(customDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true
        });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isPast: false
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [customDate]);

  // Toggle Compact Mode
  const toggleCompactMode = () => {
    const next = !isCompactMode;
    setIsCompactMode(next);
    localStorage.setItem('labschool_countdown_compact', String(next));
  };

  // Open Settings Modal
  const handleOpenSettings = () => {
    setFormEventName(eventName);
    setFormDate(customDate.split('T')[0] || '2027-01-17');
    setFormTime(customDate.split('T')[1]?.substring(0, 5) || '07:30');
    setFormTargetCampus(targetCampus);
    setFormTargetLevel(targetLevel);
    setFormCompactMode(isCompactMode);
    setIsSettingsModalOpen(true);
  };

  // Save Settings from Modal
  const handleSaveSettings = () => {
    const combinedIso = `${formDate}T${formTime || '08:00'}:00`;
    setEventName(formEventName.trim() || 'Ujian Seleksi Labschool');
    setCustomDate(combinedIso);
    setTargetCampus(formTargetCampus);
    setTargetLevel(formTargetLevel);
    setIsCompactMode(formCompactMode);

    localStorage.setItem('labschool_event_name', formEventName.trim() || 'Ujian Seleksi Labschool');
    localStorage.setItem('labschool_custom_test_date', combinedIso);
    localStorage.setItem('labschool_target_campus', formTargetCampus);
    localStorage.setItem('labschool_target_level', formTargetLevel);
    localStorage.setItem('labschool_countdown_compact', String(formCompactMode));

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setIsSettingsModalOpen(false);
    }, 800);
  };

  const handleSelectPresetSchedule = (sched: TestScheduleOption) => {
    setFormEventName(sched.name);
    setFormDate(sched.targetDate.split('T')[0]);
    setFormTime(sched.targetDate.split('T')[1]?.substring(0, 5) || '08:00');
    if (sched.campusTarget) setFormTargetCampus(sched.campusTarget);
    if (sched.level) setFormTargetLevel(sched.level);
    setSelectedScheduleId(sched.id);
  };

  const handleScoreChange = (code: string, value: number) => {
    const updated = {
      ...customScores,
      [code]: Math.max(0, Math.min(100, isNaN(value) ? 0 : value))
    };
    setCustomScores(updated);
    try {
      localStorage.setItem('labschool_lri_subtest_scores', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Reset/sync directly to the latest Tryout (TO Terakhir) results
  const handleResetToLatestTryout = () => {
    const latest = getLatestTryoutForUser(user, targetLevel.includes('SMP') ? 'SMP' : 'SMA');
    setCustomScores(latest.subtestScores);
    try {
      localStorage.setItem('labschool_lri_subtest_scores', JSON.stringify(latest.subtestScores));
    } catch {
      // ignore
    }
    setSyncToastMessage(`Nilai 5 subtest berhasil disinkronkan dari hasil TO Terakhir: ${latest.tryoutTitle}`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Reset to Labschool standard default curriculum scores
  const handleResetScores = () => {
    const def: Record<string, number> = {};
    LABSCHOOL_SUBTESTS.forEach(st => {
      def[st.code] = st.defaultScore;
    });
    setCustomScores(def);
    try {
      localStorage.setItem('labschool_lri_subtest_scores', JSON.stringify(def));
    } catch {
      // ignore
    }
    setSyncToastMessage('Nilai subtest direset ke standar kurikulum Labschool.');
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* ========================================================================= */}
      {/* 1. COUNTDOWN SECTION: MENDUKUNG TAMPILAN NORMAL & TAMPILAN COUNTDOWN KECIL */}
      {/* ========================================================================= */}
      {isCompactMode ? (
        /* ================= TAMPILAN COUNTDOWN KECIL (KOMPAK / MINI) ================= */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 p-3 sm:p-3.5 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white truncate">
                    {eventName}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                    H-{timeLeft.days}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 inline" />
                  <span className="text-white font-bold">{String(timeLeft.days).padStart(2, '0')} Hari</span> :
                  <span className="text-cyan-300 font-bold">{String(timeLeft.hours).padStart(2, '0')} Jam</span> :
                  <span className="text-cyan-300 font-bold">{String(timeLeft.minutes).padStart(2, '0')} Menit</span> :
                  <span className="text-emerald-400 font-bold">{String(timeLeft.seconds).padStart(2, '0')} Detik</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Compact View */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Pengaturan Countdown"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Atur Jadwal</span>
                </button>
              )}
              <button
                type="button"
                onClick={toggleCompactMode}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Perbesar Tampilan Countdown"
              >
                <Maximize2 className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAMPILAN COUNTDOWN REGULER (KARTU LENGKAP) ================= */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/80 p-4 sm:p-5 shadow-xl backdrop-blur-md">
          {/* Glow ambient background */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Top Left info */}
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse shrink-0">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                    Countdown Ujian Seleksi Labschool
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                    H-{timeLeft.days}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block font-medium mt-0.5">
                  {eventName} • <span className="text-slate-300">{targetLevel} ({targetCampus})</span> • <span className="text-amber-300 font-bold">{new Date(customDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
            </div>

            {/* Countdown Numbers Grid + Controls */}
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Days */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center min-w-[56px]">
                  <span className="text-base sm:text-lg font-black text-amber-300 font-mono leading-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hari</span>
                </div>

                {/* Hours */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center min-w-[56px]">
                  <span className="text-base sm:text-lg font-black text-white font-mono leading-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Jam</span>
                </div>

                {/* Minutes */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center min-w-[56px]">
                  <span className="text-base sm:text-lg font-black text-cyan-300 font-mono leading-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Menit</span>
                </div>

                {/* Seconds */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col items-center min-w-[56px]">
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono leading-tight">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Detik</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenSettings}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Pengaturan Jadwal Countdown"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Atur</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleCompactMode}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  title="Ubah ke Tampilan Ringkas"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LRI (LABSCHOOL READINESS INDEX) DENGAN GRAFIK LRI & KESIAPAN BERSEBELAHAN SECARA HORIZONTAL */}
      {/* DILETAKKAN DI BAWAH JUDUL HALAMAN (REQUIREMENT) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-700/80 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
        
        {/* LRI Main Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white tracking-tight">LRI</span>
                <span className="text-xs font-bold text-slate-400">(Labschool Readiness Index)</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${lriResult.status.badge}`}>
                  {lriResult.overallScore.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold block">
                Evaluasi Kesiapan & Prediksi Kelulusan 5 Subtest Masuk Labschool 2027
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsLriModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Detail & Diagnostik LRI Lengkap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAdmin ? 'Detail & Simulasi LRI' : 'Detail Diagnostik LRI'}</span>
            </button>
          </div>
        </div>

        {/* ================= GRAFIK LRI DENGAN KESIAPAN BERSEBELAHAN SECARA HORIZONTAL ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* KOLOM KIRI: GRAFIK LRI (GAUGE SETENGAH LINGKARAN) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-slate-800/90 flex flex-col items-center justify-center relative shadow-inner">
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-blue-300">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Grafik Indeks Kesiapan (LRI)</span>
              </span>
              <span className="font-mono text-cyan-300 font-extrabold">{lriResult.overallScore.toFixed(1)}%</span>
            </div>

            {/* Gauge Setengah Lingkaran */}
            <div className="w-full flex justify-center py-1">
              <LabschoolLriGauge score={lriResult.overallScore} />
            </div>

            {/* Target Passing Grade Tick Subtitle */}
            <div className="mt-2 text-center flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Target Passing Grade:</span>
              <strong className="text-xs text-amber-300 font-mono font-bold">81.5 - 85.0</strong>
            </div>
          </div>

          {/* KOLOM KANAN: INFORMASI KESIAPAN */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-slate-800/90 flex flex-col justify-between space-y-3.5 shadow-inner">
            <div className="space-y-3">
              {/* Header Card Informasi Kesiapan */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-white">Informasi Kesiapan</span>
                    <p className="text-[10px] text-slate-400">Status evaluasi 5 subtest seleksi masuk Labschool</p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${lriResult.status.badge}`}>
                  {lriResult.overallScore.toFixed(1)}%
                </span>
              </div>

              {/* Status Kesiapan Details: 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Status Kelulusan</span>
                  <span className={`text-xs font-black ${lriResult.status.color}`}>
                    {lriResult.status.label}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Target Passing Grade</span>
                  <span className="text-xs font-mono font-black text-amber-300">
                    81.5 - 85.0
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Prediksi Peluang</span>
                  <span className="text-xs font-black text-emerald-400">
                    Tinggi (5 Kampus)
                  </span>
                </div>
              </div>

              {/* 5 Subtest Readiness Pills */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mb-2 gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-300">Skor 5 Pilar Subtest:</span>
                    <span className="text-[10px] text-cyan-400 font-medium truncate max-w-[200px]" title={latestTryout.tryoutTitle}>
                      (Hasil TO Terakhir)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Bobot (%)</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {lriResult.breakdown.map((item) => (
                    <div
                      key={item.code}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center hover:border-cyan-500/40 transition-colors"
                      title={`${item.title} (Bobot ${item.weight}%)`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.code}</span>
                      <span className="text-xs sm:text-sm font-mono font-black text-cyan-300">{item.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PENGATURAN COUNTDOWN UJIAN LABSCHOOL (REQUIREMENT) */}
      {/* ========================================================================= */}
      {isAdmin && isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Pengaturan Countdown Ujian</h3>
                  <p className="text-xs text-slate-400">Atur tanggal target, nama agenda ujian, dan mode tampilan countdown.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Save Toast Notification */}
            {saveToast && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Pengaturan Countdown Berhasil Disimpan!</span>
              </div>
            )}

            {/* Preset Jadwal Populer */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Pilih Dari Template Jadwal Resmi:
              </label>
              <div className="space-y-1.5">
                {DEFAULT_SCHEDULES.map((sched) => (
                  <button
                    key={sched.id}
                    type="button"
                    onClick={() => handleSelectPresetSchedule(sched)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      selectedScheduleId === sched.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-white block">{sched.name}</span>
                      <span className="text-[10px] text-slate-400">{sched.type} • {sched.level}</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 shrink-0 font-bold">
                      {new Date(sched.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nama Agenda / Judul Ujian:</label>
                <input
                  type="text"
                  value={formEventName}
                  onChange={(e) => setFormEventName(e.target.value)}
                  placeholder="Misal: Tes CBT Reguler Masuk Labschool 2027"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Tanggal Target Ujian:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Waktu / Jam Ujian:</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Target Kampus Tujuan:</label>
                  <select
                    value={formTargetCampus}
                    onChange={(e) => setFormTargetCampus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Semua 5 Kampus Labschool">Semua 5 Kampus Labschool</option>
                    <option value="Labschool Rawamangun">Labschool Rawamangun</option>
                    <option value="Labschool Kebayoran">Labschool Kebayoran</option>
                    <option value="Labschool Cibubur">Labschool Cibubur</option>
                    <option value="Labschool Cirendeu">Labschool Cirendeu</option>
                    <option value="Labschool Bintaro Sektor 9">Labschool Bintaro Sektor 9</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Jenjang Masuk:</label>
                  <select
                    value={formTargetLevel}
                    onChange={(e) => setFormTargetLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="SMP & SMA">SMP & SMA Labschool</option>
                    <option value="SMP Labschool">SMP Labschool</option>
                    <option value="SMA Labschool">SMA Labschool</option>
                  </select>
                </div>
              </div>

              {/* Mode Tampilan Toggle (Countdown Kecil vs Normal) */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Tampilan Countdown Kecil (Mini)</span>
                  <span className="text-[10px] text-slate-400">Gunakan tampilan ringkas di dashboard</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormCompactMode(!formCompactMode)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    formCompactMode ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
              >
                Simpan Pengaturan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL DIAGNOSTIK LRI (5 SUBTEST RESMI LABSCHOOL) */}
      {/* ========================================================================= */}
      {isLriModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLriModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Labschool Readiness Index (LRI)</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    5 Subtest Resmi
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Indeks komputasi prediktif peluang kelulusan seleksi SMP & SMA Labschool 2027 berdasarkan 5 pilar subtest yang diujikan.
                </p>
              </div>
            </div>

            {/* LRI Gauge & Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border border-blue-500/30 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* Semi-circle Gauge (5 cols) */}
              <div className="sm:col-span-5 flex flex-col items-center">
                <LabschoolLriGauge score={lriResult.overallScore} size={200} />
              </div>

              {/* Status Info (7 cols) */}
              <div className="sm:col-span-7 space-y-2.5">
                <span className="text-xs text-slate-400 block font-semibold">Status Kesiapan Ujian:</span>
                <strong className={`text-base font-black flex items-center gap-1.5 ${lriResult.status.color}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {lriResult.status.label}
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Skor LRI dihitung dari 5 subtest resmi Labschool: <strong>PK</strong> (Kuantitatif 25%), <strong>KV</strong> (Verbal Indo & Eng 20%), <strong>PM</strong> (Membaca Indo & Eng 20%), <strong>KA</strong> (IPA & IPS 25%), dan <strong>SK</strong> (Karakter 10%).
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono">
                    Target Minimum PG: 81.5 - 85.0
                  </span>
                </div>
              </div>

            </div>

            {/* Sumber Data Nilai TO Terakhir Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">Sumber Nilai 5 Subtest: Hasil TO Terakhir</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      Tersinkronisasi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate max-w-sm sm:max-w-md mt-0.5">
                    {latestTryout.tryoutTitle} • Skor Total: <strong className="text-cyan-300 font-mono">{latestTryout.totalScore.toFixed(1)}</strong>
                    {latestTryout.rank ? ` (Rank #${latestTryout.rank}/${latestTryout.totalParticipants})` : ''}
                  </p>
                </div>
              </div>

              {/* Tombol Sinkronisasi Menampilkan Icon Saja */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetToLatestTryout}
                  className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 transition-colors cursor-pointer flex items-center justify-center"
                  title="Sinkronkan Nilai dari Hasil TO Terakhir"
                  aria-label="Sinkronkan Nilai dari Hasil TO Terakhir"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sync Notification Toast */}
            {syncToastMessage && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{syncToastMessage}</span>
              </div>
            )}

            {/* 5 Subtests Detail & Status (Siswa Read-Only, Tidak Dapat Mengedit Apapun) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  {isAdmin ? 'Rincian 5 Subtest yang Diujikan & Simulasi Skor:' : 'Rincian 5 Subtest yang Diujikan (Nilai TO Terakhir):'}
                </h4>
                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetToLatestTryout}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset ke Nilai TO Terakhir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetScores}
                      className="text-[11px] text-slate-400 hover:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Standar</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                {LABSCHOOL_SUBTESTS.map((st) => {
                  const toDetail = latestTryout.subtestDetails.find(d => d.code === st.code);
                  const currentScore = activeScores[st.code] !== undefined ? activeScores[st.code] : (toDetail?.score ?? st.defaultScore);
                  const originalToScore = toDetail?.score ?? st.defaultScore;
                  const isModified = currentScore !== originalToScore;

                  return (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-xs bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700">
                            {st.code}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white block">{st.title}</span>
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                Bobot {st.weightPercentage}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Sub-bagian: {st.subparts.map(s => s.name).join(' & ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          {isAdmin ? (
                            <>
                              <div className="text-right text-[10px]">
                                <span className="text-slate-400 block">Nilai TO Terakhir:</span>
                                <strong className="text-cyan-400 font-mono font-bold">{originalToScore}%</strong>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentScore}
                                  onChange={(e) => handleScoreChange(st.code, Number(e.target.value))}
                                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                                />
                                <span className="text-xs text-slate-400 font-mono">%</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono font-bold text-cyan-300 shadow-inner">
                                {originalToScore}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detail Metrics from TO */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] border-t border-slate-800/60">
                        <div className="flex items-center gap-3 text-slate-400">
                          <span>
                            Benar: <strong className="text-white font-mono">{toDetail?.correctCount ?? 0}</strong> / {toDetail?.totalQuestions ?? st.totalQuestions} Soal
                          </span>
                          <span>•</span>
                          <span>
                            Status: <strong className={currentScore >= 85 ? 'text-emerald-400' : currentScore >= 75 ? 'text-amber-400' : 'text-rose-400'}>
                              {currentScore >= 85 ? 'Sangat Siap' : currentScore >= 75 ? 'Cukup Siap' : 'Perlu Pendalaman'}
                            </strong>
                          </span>
                        </div>

                        {isAdmin && isModified && (
                          <span className="text-[10px] text-amber-400 font-medium italic">
                            (Nilai simulasi manual)
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">
                        {st.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target 5 Campuses Passing Grade Comparison */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Target className="w-4 h-4" />
                <span>Peluang Kelulusan di 5 Kampus Labschool:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Rawamangun (84.5)</span>
                  <span className="font-bold text-emerald-400">
                    {lriResult.overallScore >= 84.5 ? 'Peluang 88% (Tinggi)' : 'Perlu +2.5 Poin'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Kebayoran (85.0)</span>
                  <span className="font-bold text-emerald-400">
                    {lriResult.overallScore >= 85.0 ? 'Peluang 86% (Tinggi)' : 'Perlu +2.0 Poin'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Cibubur (82.5)</span>
                  <span className="font-bold text-cyan-400">Peluang 92% (Sangat Tinggi)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Cirendeu (82.0)</span>
                  <span className="font-bold text-cyan-400">Peluang 93% (Sangat Tinggi)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Bintaro Sektor 9 (81.5)</span>
                  <span className="font-bold text-cyan-400">Peluang 95% (Sangat Tinggi)</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsLriModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
