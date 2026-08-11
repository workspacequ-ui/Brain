import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { getUserLabschoolLevel } from '../../utils/labschoolHelpers';
import {
  QuizLeaderboardEntry,
  QuizHistoryDetail,
  loadStoredQuizLeaderboard,
  loadStoredQuizHistory
} from './labschoolLaporanData';
import { LabschoolQuizModal } from './LabschoolQuizModal';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Clock,
  Target,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  X,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Medal,
  GraduationCap,
  Printer,
  ShieldCheck,
  UserCheck,
  BarChart3,
  LayoutGrid,
  Table as TableIcon,
  BarChart2,
  Star,
  Layers,
  ChevronRight,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';

interface LabschoolQuizAnalysisProps {
  user: User;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  selectedStudentId?: string;
  selectedStudentName?: string;
  selectedStudentNis?: string;
  selectedLevel?: 'SMP' | 'SMA' | 'ALL';
  onOpenPrintModal?: (type?: 'QUIZ') => void;
}

export const LabschoolQuizAnalysis: React.FC<LabschoolQuizAnalysisProps> = ({
  user,
  onShowToast,
  selectedStudentId,
  selectedStudentName,
  selectedStudentNis,
  selectedLevel: propLevel,
  onOpenPrintModal
}) => {
  // State from storage or defaults
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>(() => loadStoredQuizLeaderboard());
  const [quizHistory, setQuizHistory] = useState<QuizHistoryDetail[]>(() => loadStoredQuizHistory());
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleQuizCompleted = () => {
    setQuizHistory(loadStoredQuizHistory());
    setLeaderboard(loadStoredQuizLeaderboard());
  };

  // Role detection
  const isStudent = user.role === 'student';

  // Determine user's student level (SMP vs SMA)
  const studentLevel = useMemo<'SMP' | 'SMA'>(() => {
    if (propLevel === 'SMP' || propLevel === 'SMA') return propLevel;
    const lvl = getUserLabschoolLevel(user);
    return lvl === 'SMP' ? 'SMP' : 'SMA';
  }, [propLevel, user]);

  // Active Leaderboard Jenjang Tab (SMA vs SMP vs ALL)
  // For students: locked to their own level (e.g. 'SMP' for SMP student, 'SMA' for SMA student)
  const [activeLeaderboardJenjang, setActiveLeaderboardJenjang] = useState<'SMA' | 'SMP' | 'ALL'>(
    isStudent ? studentLevel : (propLevel === 'SMP' ? 'SMP' : 'SMA')
  );

  // View Mode for Leaderboard: 'CHART' (Grafik Batang), 'TABLE' (Tabel & Podium), 'BOTH' (Semua)
  const [leaderboardViewMode, setLeaderboardViewMode] = useState<'CHART' | 'TABLE' | 'BOTH'>('CHART');

  // Chart Metric Selector: 'averageScore' (Skor Rata-rata), 'accuracyPercentage' (Akurasi %), 'totalQuizzesTaken' (Total Kuis)
  const [chartMetric, setChartMetric] = useState<'averageScore' | 'accuracyPercentage' | 'totalQuizzesTaken'>('averageScore');

  // Toggle for showing photo and badge directly inside the bar chart
  const [showPhotoBadgeInBar, setShowPhotoBadgeInBar] = useState<boolean>(true);

  // Selected student highlight
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);

  // Sync tab with studentLevel or propLevel
  useEffect(() => {
    if (isStudent) {
      setActiveLeaderboardJenjang(studentLevel);
    } else if (propLevel === 'SMP' || propLevel === 'SMA' || propLevel === 'ALL') {
      setActiveLeaderboardJenjang(propLevel);
    }
  }, [isStudent, studentLevel, propLevel]);

  // Effective student metadata
  const effectiveStudentName = useMemo(() => {
    if (isStudent) return user.name || (studentLevel === 'SMP' ? 'Siti Aminah' : 'Budi Santoso');
    return selectedStudentName || 'Budi Santoso';
  }, [isStudent, user.name, studentLevel, selectedStudentName]);

  const effectiveStudentNis = useMemo(() => {
    if (isStudent) return user.nis || (studentLevel === 'SMP' ? '20261002' : '20261001');
    return selectedStudentNis || '20261001';
  }, [isStudent, user.nis, studentLevel, selectedStudentNis]);

  const effectiveStudentId = useMemo(() => {
    if (isStudent) return user.id || (studentLevel === 'SMP' ? 'u-s2' : 'u-s1');
    return selectedStudentId || 'u-s1';
  }, [isStudent, user.id, studentLevel, selectedStudentId]);

  const currentActiveLevel = isStudent ? studentLevel : (activeLeaderboardJenjang === 'ALL' ? 'SMA' : activeLeaderboardJenjang);

  // Search & Filter
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySubtestFilter, setHistorySubtestFilter] = useState<'ALL' | 'PK' | 'KV' | 'PM' | 'KA' | 'SK'>('ALL');

  // Modal Review Pembahasan
  const [selectedQuizForReview, setSelectedQuizForReview] = useState<QuizHistoryDetail | null>(null);

  // Filtered Leaderboard (Strictly separated based on activeLeaderboardJenjang / student's level)
  const filteredLeaderboard = useMemo(() => {
    const targetJenjang = isStudent ? studentLevel : activeLeaderboardJenjang;
    const list = leaderboard.filter(item => {
      return targetJenjang === 'ALL' || item.level === targetJenjang;
    });

    // Re-rank items sequentially for the active jenjang
    return list
      .sort((a, b) => b.averageScore - a.averageScore || b.totalScore - a.totalScore)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }, [leaderboard, isStudent, studentLevel, activeLeaderboardJenjang]);

  // Top 3 Podium for the selected Jenjang
  const topThree = useMemo(() => {
    return filteredLeaderboard.slice(0, 3);
  }, [filteredLeaderboard]);

  // Data formatted specifically for the Leaderboard Bar Chart (Grafik Batang)
  const chartData = useMemo(() => {
    return filteredLeaderboard.map(item => {
      const isCurrentStudent =
        (effectiveStudentId && (item.studentId === effectiveStudentId || item.studentNis === effectiveStudentNis)) ||
        item.studentName.toLowerCase().includes(effectiveStudentName.toLowerCase()) ||
        (isStudent && (item.studentId === user.id || item.studentNis === user.nis || item.studentName.toLowerCase().includes(user.name.toLowerCase())));

      // Shorten name for XAxis display (e.g. "Budi S." or first 2 words)
      const nameParts = item.studentName.split(' ');
      const shortName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

      return {
        id: item.id,
        rank: item.rank,
        fullName: item.studentName,
        displayName: `#${item.rank} ${shortName}`,
        shortName,
        nis: item.studentNis,
        class: item.studentClass,
        level: item.level,
        averageScore: item.averageScore,
        accuracyPercentage: item.accuracyPercentage,
        totalQuizzesTaken: item.totalQuizzesTaken,
        speed: item.averageSpeedSeconds,
        badgeTitle: item.badgeTitle,
        badgeType: item.badgeType,
        avatar: item.studentAvatar,
        isCurrentStudent
      };
    });
  }, [filteredLeaderboard, effectiveStudentId, effectiveStudentNis, effectiveStudentName, isStudent, user]);

  // Summary Metrics for Synchronized Student (Derived from matching level and personal performance)
  const currentStudentStats = useMemo(() => {
    const targetJenjang = isStudent ? studentLevel : (activeLeaderboardJenjang === 'ALL' ? 'SMA' : activeLeaderboardJenjang);

    // Find student in leaderboard
    const matchedInLb = filteredLeaderboard.find(l =>
      (effectiveStudentId && (l.studentId === effectiveStudentId || l.studentNis === effectiveStudentNis)) ||
      l.studentName.toLowerCase().includes(effectiveStudentName.toLowerCase()) ||
      (isStudent && (l.studentId === user.id || l.studentNis === user.nis || l.studentName.toLowerCase().includes(user.name.toLowerCase())))
    );

    // Student quizzes matching this level
    const studentQuizzes = quizHistory.filter(q =>
      (targetJenjang === 'ALL' || q.level === targetJenjang) && (
        (effectiveStudentId && q.studentId === effectiveStudentId) ||
        q.studentName.toLowerCase().includes(effectiveStudentName.toLowerCase()) ||
        (isStudent && (q.studentId === user.id || q.studentName.toLowerCase().includes(user.name.toLowerCase())))
      )
    );

    const effectiveList = studentQuizzes.length > 0
      ? studentQuizzes
      : quizHistory.filter(q => targetJenjang === 'ALL' || q.level === targetJenjang);

    const totalQuizzes = matchedInLb?.totalQuizzesTaken || effectiveList.length || 1;
    const avgScore = matchedInLb?.averageScore ?? +(effectiveList.reduce((sum, q) => sum + q.score, 0) / (effectiveList.length || 1)).toFixed(1);
    const perfectCount = effectiveList.filter(q => q.score === 100).length;
    const totalCorrect = effectiveList.reduce((sum, q) => sum + q.correctCount, 0);
    const totalQuestions = effectiveList.reduce((sum, q) => sum + q.totalQuestions, 0);
    const accuracy = matchedInLb?.accuracyPercentage ?? (totalQuestions > 0 ? +((totalCorrect / totalQuestions) * 100).toFixed(1) : 95.0);
    const rank = matchedInLb?.rank || (isStudent ? 1 : 1);
    const badgeTitle = matchedInLb?.badgeTitle || (targetJenjang === 'SMP' ? 'Grand Champion SMP' : 'Grand Champion SMA');

    return {
      totalQuizzes,
      avgScore,
      perfectCount,
      accuracy,
      rank,
      badgeTitle
    };
  }, [filteredLeaderboard, quizHistory, isStudent, studentLevel, activeLeaderboardJenjang, effectiveStudentId, effectiveStudentNis, effectiveStudentName, user]);

  // Filtered Quiz History (Strictly synchronized according to student's level and role)
  const filteredHistory = useMemo(() => {
    const targetJenjang = isStudent ? studentLevel : activeLeaderboardJenjang;
    return quizHistory.filter(q => {
      // 1. Level check
      const matchLevel = targetJenjang === 'ALL' || q.level === targetJenjang;
      if (!matchLevel) return false;

      // 2. Student check for student role
      if (isStudent) {
        const hasMyQuizzes = quizHistory.some(item =>
          item.level === targetJenjang && (
            item.studentId === user.id ||
            item.studentId === effectiveStudentId ||
            item.studentName.toLowerCase().includes(user.name.toLowerCase())
          )
        );
        if (hasMyQuizzes) {
          const isMine = (
            q.studentId === user.id ||
            q.studentId === effectiveStudentId ||
            q.studentName.toLowerCase().includes(user.name.toLowerCase())
          );
          if (!isMine) return false;
        }
      }

      // 3. Subtest filter
      const matchSubtest = historySubtestFilter === 'ALL' || q.subtestCode === historySubtestFilter;
      if (!matchSubtest) return false;

      // 4. Search query
      const matchSearch = !historySearchQuery.trim() ||
        q.quizTitle.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        q.studentName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        q.subtestName.toLowerCase().includes(historySearchQuery.toLowerCase());

      return matchSearch;
    });
  }, [quizHistory, isStudent, studentLevel, activeLeaderboardJenjang, user, effectiveStudentId, historySubtestFilter, historySearchQuery]);

  // Helper color for bar items
  const getBarColor = (entry: typeof chartData[0], index: number) => {
    if (entry.isCurrentStudent) {
      return '#f59e0b'; // Amber 500 Gold glowing for current student
    }
    if (index === 0) return '#fbbf24'; // Rank 1 Yellow Gold
    if (index === 1) return '#94a3b8'; // Rank 2 Silver Slate
    if (index === 2) return '#d97706'; // Rank 3 Bronze Amber
    return currentActiveLevel === 'SMP' ? '#10b981' : '#3b82f6'; // Emerald for SMP, Blue for SMA
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Integrated Synchronization Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                  Analisis Kuis & Leaderboard PSB Labschool
                </h2>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase border ${
                  currentActiveLevel === 'SMP'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  Jenjang {currentActiveLevel} Labschool
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Papan peringkat kompetisi drill kuis kilat, visualisasi grafik batang nilai, dan rekap kuis sesuai jenjang kelas siswa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Status Sinkronisasi Otomatis Sesuai Profil Siswa */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">
                  {isStudent ? 'Profil Kamu:' : 'Siswa Dipantau:'}
                </span>
                <strong className="text-slate-100 font-bold">{effectiveStudentName}</strong>
                <span className="text-slate-500 font-mono text-[11px]">(NIS: {effectiveStudentNis})</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                  currentActiveLevel === 'SMP'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {currentActiveLevel}-LABS
                </span>
              </div>
            </div>

            {/* Action Buttons: Print (Icon-Only) & Mulai Quiz */}
            <div className="flex items-center gap-2">
              {onOpenPrintModal && (
                <button
                  type="button"
                  id="btn-print-quiz-report"
                  onClick={() => onOpenPrintModal('QUIZ')}
                  title="Cetak Rapor Kuis & Leaderboard"
                  aria-label="Cetak Rapor Kuis"
                  className="p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow hover:shadow-amber-500/10 active:scale-95 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                id="btn-start-quiz"
                onClick={() => setIsQuizModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Mulai Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Sesuai Jenjang Siswa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Rata-rata Skor Kuis</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white">{currentStudentStats.avgScore}</span>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Kuis Diselesaikan</span>
            <span className="text-xl sm:text-2xl font-black text-white">{currentStudentStats.totalQuizzes} Paket</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Skor 100% Perfect</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{currentStudentStats.perfectCount} Kali</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Tingkat Akurasi</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-300">{currentStudentStats.accuracy}%</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PAPAN LEADERBOARD QUIZ DENGAN GRAFIK BATANG & TABEL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                  Papan Leaderboard Kuis PSB Labschool
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-extrabold">
                  Grafik Batang Interaktif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Peringkat komparatif skor dan akurasi kuis per siswa jenjang {currentActiveLevel} Labschool
              </p>
            </div>
          </div>

          {/* Right Controls: Jenjang Filter + View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Grafik Batang vs Tabel vs Semua */}
            <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                id="btn-view-chart"
                onClick={() => setLeaderboardViewMode('CHART')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  leaderboardViewMode === 'CHART'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilkan sebagai Grafik Batang"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Grafik Batang</span>
              </button>

              <button
                type="button"
                id="btn-view-table"
                onClick={() => setLeaderboardViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  leaderboardViewMode === 'TABLE'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilkan sebagai Tabel & Podium"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel & Podium</span>
              </button>

              <button
                type="button"
                id="btn-view-both"
                onClick={() => setLeaderboardViewMode('BOTH')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  leaderboardViewMode === 'BOTH'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilkan Grafik dan Tabel Bersamaan"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Semua</span>
              </button>
            </div>

            {/* PEMISAH LEADERBOARD BERDASARKAN JENJANG */}
            {isStudent ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Jenjang:</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border flex items-center gap-1 ${
                  studentLevel === 'SMP'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                  {studentLevel} Labschool
                </span>
              </div>
            ) : (
              <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  id="btn-leaderboard-sma"
                  onClick={() => setActiveLeaderboardJenjang('SMA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeLeaderboardJenjang === 'SMA'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>SMA</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-900/60 text-blue-200 text-[10px]">
                    {leaderboard.filter(l => l.level === 'SMA').length}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-leaderboard-smp"
                  onClick={() => setActiveLeaderboardJenjang('SMP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeLeaderboardJenjang === 'SMP'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>SMP</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-900/60 text-emerald-200 text-[10px]">
                    {leaderboard.filter(l => l.level === 'SMP').length}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-leaderboard-all"
                  onClick={() => setActiveLeaderboardJenjang('ALL')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    activeLeaderboardJenjang === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Semua</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- GRAFIK BATANG (BAR CHART) LEADERBOARD ---------------- */}
        {(leaderboardViewMode === 'CHART' || leaderboardViewMode === 'BOTH') && (
          <div className="space-y-4">
            {/* Metric Selector Bar & Controls */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-slate-400 font-medium">Metrik:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartMetric('averageScore')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      chartMetric === 'averageScore'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🏆 Skor Rata-rata
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartMetric('accuracyPercentage')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      chartMetric === 'accuracyPercentage'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🎯 Akurasi (%)
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartMetric('totalQuizzesTaken')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      chartMetric === 'totalQuizzesTaken'
                        ? 'bg-blue-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📚 Total Kuis
                  </button>
                </div>

                {/* Toggle Foto & Badge di dalam Bar */}
                <button
                  type="button"
                  onClick={() => setShowPhotoBadgeInBar(!showPhotoBadgeInBar)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showPhotoBadgeInBar
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Tampilkan / Sembunyikan Foto Siswa dan Badge di dalam Grafik Batang"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Foto & Badge di Bar: {showPhotoBadgeInBar ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50" />
                  <span className="text-slate-300 font-semibold">Juara 1 👑</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span>Juara 2 🥈</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block" />
                  <span>Juara 3 🥉</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/60 inline-block animate-pulse" />
                  <span className="text-amber-300 font-bold">{isStudent ? '★ Kamu' : '★ Siswa Terpilih'}</span>
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-inner relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-3">
                <div>
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span>Grafik Batang Leaderboard {currentActiveLevel} Labschool</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                      {chartMetric === 'averageScore' ? 'Skor Rata-rata' : chartMetric === 'accuracyPercentage' ? 'Akurasi' : 'Total Kuis'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Setiap batang menampilkan foto profil siswa dan badge prestasi di dalamnya
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Ambang Standar: <span className="text-emerald-400 font-bold">85.0</span>
                </div>
              </div>

              <div className="w-full h-96 sm:h-[430px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 25, right: 15, left: -15, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
                    <XAxis
                      dataKey="displayName"
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis
                      domain={[
                        0,
                        chartMetric === 'totalQuizzesTaken' ? 25 : 100
                      ]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[230px]">
                              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                <img
                                  src={data.avatar}
                                  alt={data.fullName}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-amber-400/80 shadow"
                                />
                                <div>
                                  <div className="font-extrabold text-white flex items-center gap-1.5">
                                    <span>#{data.rank}</span>
                                    <span>{data.fullName}</span>
                                    {data.isCurrentStudent && (
                                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded">
                                        KAMU
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    NIS: {data.nis} • {data.class}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="p-1.5 rounded-lg bg-slate-950 text-center">
                                  <span className="text-[10px] text-slate-400 block">Skor Rata-rata</span>
                                  <span className="text-sm font-black text-amber-400">{data.averageScore}</span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-950 text-center">
                                  <span className="text-[10px] text-slate-400 block">Akurasi</span>
                                  <span className="text-sm font-bold text-emerald-400">{data.accuracyPercentage}%</span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-950 text-center">
                                  <span className="text-[10px] text-slate-400 block">Total Kuis</span>
                                  <span className="text-sm font-bold text-blue-400">{data.totalQuizzesTaken} Paket</span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-950 text-center">
                                  <span className="text-[10px] text-slate-400 block">Kecepatan</span>
                                  <span className="text-sm font-bold text-slate-300">{data.speed}s / soal</span>
                                </div>
                              </div>

                              <div className="pt-1 text-center">
                                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10.5px] border border-amber-500/30 inline-block shadow-sm">
                                  🏆 {data.badgeTitle}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {chartMetric !== 'totalQuizzesTaken' && (
                      <ReferenceLine
                        y={85}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: 'Ambang Aman 85.0',
                          fill: '#34d399',
                          fontSize: 10,
                          position: 'insideTopRight'
                        }}
                      />
                    )}

                    <Bar
                      dataKey={chartMetric}
                      animationDuration={800}
                      shape={(props: any) => {
                        const { x, y, width, height, payload, index } = props;
                        if (!payload || width <= 0 || height <= 0) return null;

                        const isCurrentStudent = payload.isCurrentStudent;
                        const isHighlighted = highlightedStudentId === payload.id;
                        const rank = payload.rank;
                        const avatar = payload.avatar;
                        const badgeTitle = payload.badgeTitle || '';
                        const metricVal = payload[chartMetric];

                        const centerX = x + width / 2;
                        const barRadius = Math.min(8, width / 4);

                        // Adaptive avatar radius
                        const avatarRadius = Math.min(18, Math.max(10, width * 0.28));
                        const avatarCenterY = y + avatarRadius + 14;

                        // Dynamic colors based on rank and role
                        let strokeColor = currentActiveLevel === 'SMP' ? '#10b981' : '#3b82f6';
                        let ringColor = currentActiveLevel === 'SMP' ? '#6ee7b7' : '#60a5fa';
                        let badgeBg = currentActiveLevel === 'SMP' ? 'rgba(6, 78, 59, 0.9)' : 'rgba(30, 58, 138, 0.9)';
                        let badgeBorder = currentActiveLevel === 'SMP' ? '#34d399' : '#60a5fa';
                        let badgeText = currentActiveLevel === 'SMP' ? '#a7f3d0' : '#bfdbfe';
                        let gradTop = currentActiveLevel === 'SMP' ? '#10b981' : '#3b82f6';
                        let gradBottom = currentActiveLevel === 'SMP' ? '#047857' : '#1d4ed8';

                        if (isCurrentStudent) {
                          gradTop = '#f59e0b';
                          gradBottom = '#b45309';
                          strokeColor = '#fbbf24';
                          ringColor = '#fde047';
                          badgeBg = 'rgba(120, 53, 15, 0.95)';
                          badgeBorder = '#fbbf24';
                          badgeText = '#fef08a';
                        } else if (rank === 1) {
                          gradTop = '#f59e0b';
                          gradBottom = '#d97706';
                          strokeColor = '#fbbf24';
                          ringColor = '#fde047';
                          badgeBg = 'rgba(120, 53, 15, 0.9)';
                          badgeBorder = '#fbbf24';
                          badgeText = '#fef08a';
                        } else if (rank === 2) {
                          gradTop = '#94a3b8';
                          gradBottom = '#475569';
                          strokeColor = '#cbd5e1';
                          ringColor = '#f1f5f9';
                          badgeBg = 'rgba(51, 65, 85, 0.9)';
                          badgeBorder = '#cbd5e1';
                          badgeText = '#f8fafc';
                        } else if (rank === 3) {
                          gradTop = '#d97706';
                          gradBottom = '#92400e';
                          strokeColor = '#f59e0b';
                          ringColor = '#fcd34d';
                          badgeBg = 'rgba(124, 45, 18, 0.9)';
                          badgeBorder = '#f59e0b';
                          badgeText = '#fed7aa';
                        }

                        // Truncate badge to fit width
                        const maxBadgeChars = Math.max(5, Math.floor((width - 6) / 6.2));
                        const displayBadge = badgeTitle.length > maxBadgeChars 
                          ? badgeTitle.slice(0, maxBadgeChars) + '..' 
                          : badgeTitle;

                        const clipId = `avatar-clip-${payload.id || index}`;
                        const gradId = `bar-grad-${payload.id || index}`;

                        const hasRoomForAvatar = height >= 55 && width >= 22;
                        const hasRoomForBadge = height >= 115 && width >= 28;
                        const hasRoomForStudentTag = isCurrentStudent && height >= 160 && width >= 34;
                        const badgePillWidth = Math.min(width - 6, 80);
                        const fontSize = Math.min(9.5, Math.max(7.5, width * 0.16));

                        return (
                          <g 
                            key={`bar-node-${index}`}
                            className="custom-bar-node cursor-pointer transition-all"
                            onClick={() => setHighlightedStudentId(payload.id === highlightedStudentId ? null : payload.id)}
                          >
                            <defs>
                              <clipPath id={clipId}>
                                <circle cx={centerX} cy={avatarCenterY} r={avatarRadius} />
                              </clipPath>
                              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={gradTop} stopOpacity={0.95} />
                                <stop offset="100%" stopColor={gradBottom} stopOpacity={0.8} />
                              </linearGradient>
                            </defs>

                            {/* Main Bar Rectangle */}
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              rx={barRadius}
                              ry={barRadius}
                              fill={`url(#${gradId})`}
                              stroke={isHighlighted ? '#ffffff' : (isCurrentStudent ? '#fbbf24' : strokeColor)}
                              strokeWidth={isHighlighted ? 3 : (isCurrentStudent ? 2.5 : 1)}
                              className="transition-all duration-200"
                            />

                            {/* Top Value Label above Bar */}
                            <text
                              x={centerX}
                              y={y - 7}
                              textAnchor="middle"
                              fill={isCurrentStudent ? '#fbbf24' : '#e2e8f0'}
                              fontSize={Math.min(12, Math.max(9.5, width * 0.22))}
                              fontWeight={800}
                            >
                              {chartMetric === 'accuracyPercentage' ? `${metricVal}%` : metricVal}
                            </text>

                            {showPhotoBadgeInBar && (
                              <>
                                {/* 1. Student Avatar / Photo inside the Bar */}
                                {hasRoomForAvatar && (
                                  <g className="bar-avatar-element">
                                    {/* Avatar Outer Glow Ring */}
                                    <circle
                                      cx={centerX}
                                      cy={avatarCenterY}
                                      r={avatarRadius + 2.5}
                                      fill="#0f172a"
                                      stroke={ringColor}
                                      strokeWidth={isCurrentStudent ? 2.5 : 1.5}
                                    />
                                    {/* Circular Cropped Photo */}
                                    <image
                                      href={avatar}
                                      x={centerX - avatarRadius}
                                      y={avatarCenterY - avatarRadius}
                                      width={avatarRadius * 2}
                                      height={avatarRadius * 2}
                                      clipPath={`url(#${clipId})`}
                                      preserveAspectRatio="xMidYMid slice"
                                    />
                                    {/* Crown or Rank medal above the avatar inside the bar */}
                                    {rank <= 3 && (
                                      <text
                                        x={centerX}
                                        y={avatarCenterY - avatarRadius - 2}
                                        textAnchor="middle"
                                        fontSize={Math.max(10, avatarRadius * 0.85)}
                                      >
                                        {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                                      </text>
                                    )}
                                  </g>
                                )}

                                {/* 2. Badge Title Pill inside the Bar */}
                                {hasRoomForBadge && (
                                  <g transform={`translate(${centerX}, ${avatarCenterY + avatarRadius + 13})`}>
                                    <rect
                                      x={-badgePillWidth / 2}
                                      y={-8}
                                      width={badgePillWidth}
                                      height={16}
                                      rx={4}
                                      ry={4}
                                      fill={badgeBg}
                                      stroke={badgeBorder}
                                      strokeWidth={1}
                                    />
                                    <text
                                      x={0}
                                      y={3.5}
                                      textAnchor="middle"
                                      fill={badgeText}
                                      fontSize={fontSize}
                                      fontWeight={800}
                                      letterSpacing="0.01em"
                                    >
                                      {displayBadge}
                                    </text>
                                  </g>
                                )}

                                {/* 3. Special Active Student Tag [★ KAMU] inside the Bar */}
                                {hasRoomForStudentTag && (
                                  <g transform={`translate(${centerX}, ${avatarCenterY + avatarRadius + 33})`}>
                                    <rect
                                      x={-22}
                                      y={-7}
                                      width={44}
                                      height={14}
                                      rx={3}
                                      fill="#f59e0b"
                                      stroke="#fde047"
                                      strokeWidth={1}
                                    />
                                    <text
                                      x={0}
                                      y={3}
                                      textAnchor="middle"
                                      fill="#0f172a"
                                      fontSize="8.5"
                                      fontWeight={900}
                                    >
                                      ★ KAMU
                                    </text>
                                  </g>
                                )}
                              </>
                            )}
                          </g>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Informative footer bar for the chart */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Siswa teratas di jenjang <strong className="text-slate-200">{currentActiveLevel}</strong> adalah{' '}
                    <strong className="text-amber-400">{chartData[0]?.fullName}</strong> dengan skor rata-rata{' '}
                    <strong className="text-emerald-400">{chartData[0]?.averageScore}</strong>.
                  </span>
                </div>
                <div className="text-slate-500">
                  Menampilkan {chartData.length} siswa teratas • Klik batang untuk sorot
                </div>
              </div>
            </div>

            {/* Companion Strip: Kartu Siswa & Badge Leaderboard */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Daftar Profil Siswa & Badge di Grafik:
                </span>
                <span className="text-[11px] text-slate-500">
                  {chartData.length} Peserta {currentActiveLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {chartData.map((student) => {
                  const isSelected = highlightedStudentId === student.id;
                  return (
                    <div
                      key={student.id}
                      onClick={() => setHighlightedStudentId(isSelected ? null : student.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        student.isCurrentStudent
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                          : isSelected
                          ? 'bg-slate-800 border-blue-400 shadow-md'
                          : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={student.avatar}
                          alt={student.fullName}
                          className={`w-10 h-10 rounded-full object-cover border-2 ${
                            student.rank === 1
                              ? 'border-amber-400'
                              : student.rank === 2
                              ? 'border-slate-300'
                              : student.rank === 3
                              ? 'border-amber-700'
                              : 'border-slate-700'
                          }`}
                        />
                        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow ${
                          student.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : student.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : student.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {student.rank}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h5 className="text-xs font-bold text-white truncate">{student.fullName}</h5>
                          {student.isCurrentStudent && (
                            <span className="shrink-0 text-[8px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                              KAMU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{student.class} • NIS: {student.nis}</p>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-extrabold text-[9px] border border-amber-500/20 truncate">
                            {student.badgeTitle}
                          </span>
                          <span className="text-[10px] font-black text-emerald-400 shrink-0">
                            {chartMetric === 'averageScore'
                              ? `${student.averageScore} Pts`
                              : chartMetric === 'accuracyPercentage'
                              ? `${student.accuracyPercentage}%`
                              : `${student.totalQuizzesTaken} Kuis`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TABEL & PODIUM LEADERBOARD ---------------- */}
        {(leaderboardViewMode === 'TABLE' || leaderboardViewMode === 'BOTH') && (
          <div className="space-y-6">
            {/* Podium Top 3 Khusus Jenjang yang Dipilih */}
            {topThree.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Rank 2 (Silver) */}
                <div className="order-2 sm:order-1 bg-gradient-to-b from-slate-800/80 via-slate-900 to-slate-950 border border-slate-700/60 rounded-3xl p-5 text-center flex flex-col items-center justify-between shadow-lg relative overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center mb-2 shadow">
                    2
                  </div>
                  <img
                    src={topThree[1].studentAvatar}
                    alt={topThree[1].studentName}
                    className="w-16 h-16 rounded-full object-cover border-3 border-slate-300 shadow-md mb-2"
                  />
                  <h4 className="text-sm font-bold text-white truncate max-w-[160px]">{topThree[1].studentName}</h4>
                  <p className="text-[11px] text-slate-400">{topThree[1].studentClass}</p>

                  <div className="my-3 px-3 py-1 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs">
                    <span className="text-slate-400 font-medium">Skor Rata-rata: </span>
                    <span className="font-extrabold text-slate-200">{topThree[1].averageScore}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-700 text-slate-200 text-[10px] font-bold">
                    {topThree[1].badgeTitle}
                  </span>
                </div>

                {/* Rank 1 (Gold - Elevated) */}
                <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 text-center flex flex-col items-center justify-between shadow-2xl relative overflow-hidden sm:-translate-y-2">
                  <span className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[9px] rounded-bl-xl tracking-wider shadow">
                    JUARA 1 {currentActiveLevel}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-base flex items-center justify-center mb-2 shadow-lg shadow-amber-500/30">
                    👑
                  </div>
                  <img
                    src={topThree[0].studentAvatar}
                    alt={topThree[0].studentName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl mb-2"
                  />
                  <h4 className="text-base font-extrabold text-white truncate max-w-[180px]">{topThree[0].studentName}</h4>
                  <p className="text-xs text-amber-400/90 font-medium">{topThree[0].studentClass} • NIS: {topThree[0].studentNis}</p>

                  <div className="my-3 px-4 py-1.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-xs">
                    <span className="text-amber-300 font-medium">Skor Rata-rata: </span>
                    <span className="font-black text-amber-200 text-sm">{topThree[0].averageScore}</span>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-md">
                    {topThree[0].badgeTitle}
                  </span>
                </div>

                {/* Rank 3 (Bronze) */}
                <div className="order-3 sm:order-3 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 border border-amber-800/40 rounded-3xl p-5 text-center flex flex-col items-center justify-between shadow-lg relative overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-sm flex items-center justify-center mb-2 shadow">
                    3
                  </div>
                  <img
                    src={topThree[2].studentAvatar}
                    alt={topThree[2].studentName}
                    className="w-16 h-16 rounded-full object-cover border-3 border-amber-700 shadow-md mb-2"
                  />
                  <h4 className="text-sm font-bold text-white truncate max-w-[160px]">{topThree[2].studentName}</h4>
                  <p className="text-[11px] text-slate-400">{topThree[2].studentClass}</p>

                  <div className="my-3 px-3 py-1 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs">
                    <span className="text-slate-400 font-medium">Skor Rata-rata: </span>
                    <span className="font-extrabold text-slate-200">{topThree[2].averageScore}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-900/60 text-amber-200 text-[10px] font-bold border border-amber-700/40">
                    {topThree[2].badgeTitle}
                  </span>
                </div>
              </div>
            )}

            {/* Full Leaderboard Table Sesuai Jenjang */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold bg-slate-950/50">
                    <th className="py-3 px-3.5 rounded-l-xl">Peringkat</th>
                    <th className="py-3 px-3.5">Siswa</th>
                    <th className="py-3 px-3.5">Jenjang / Kelas</th>
                    <th className="py-3 px-3.5 text-center">Kuis Diikuti</th>
                    <th className="py-3 px-3.5 text-center">Rata-rata Skor</th>
                    <th className="py-3 px-3.5 text-center">Akurasi</th>
                    <th className="py-3 px-3.5 text-center">Kecepatan</th>
                    <th className="py-3 px-3.5 rounded-r-xl">Badge Gelar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeaderboard.map((item, idx) => {
                    const isCurrentStudent =
                      (effectiveStudentId && (item.studentId === effectiveStudentId || item.studentNis === effectiveStudentNis)) ||
                      item.studentName.toLowerCase().includes(effectiveStudentName.toLowerCase()) ||
                      (isStudent && (item.studentId === user.id || item.studentNis === user.nis || item.studentName.toLowerCase().includes(user.name.toLowerCase())));
                    
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors font-medium ${
                          isCurrentStudent
                            ? 'bg-amber-500/15 border-y border-amber-500/50 text-white shadow-inner'
                            : 'hover:bg-slate-800/40 text-slate-200'
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950 font-bold'
                              : idx === 2
                              ? 'bg-amber-700 text-amber-100 font-bold'
                              : isCurrentStudent
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 font-medium'
                          }`}>
                            #{item.rank}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.studentAvatar}
                              alt={item.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {item.studentName}
                                {idx === 0 && <span className="text-xs">👑</span>}
                                {isCurrentStudent && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-black rounded bg-amber-500 text-slate-950 shadow-sm">
                                    {isStudent ? 'KAMU' : 'SISWA AKTIF'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">NIS: {item.studentNis}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            item.level === 'SMP'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}>
                            {item.studentClass}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-center font-bold text-slate-300">
                          {item.totalQuizzesTaken} Kuis
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <span className="font-black text-sm text-amber-400">{item.averageScore}</span>
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full rounded-full"
                                style={{ width: `${item.accuracyPercentage}%` }}
                              />
                            </div>
                            <span className="font-semibold text-[11px] text-emerald-400">{item.accuracyPercentage}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3.5 text-center text-slate-300 text-[11px]">
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {item.averageSpeedSeconds}s / soal
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            item.badgeType === 'gold'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : item.badgeType === 'speed'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : item.badgeType === 'streak'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : item.badgeType === 'silver'
                              ? 'bg-slate-300/20 text-slate-200 border-slate-300/30'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}>
                            {item.badgeTitle}
                          </span>
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

      {/* SECTION 2: RIWAYAT & HASIL NILAI QUIZ PER TOPIK (SESUAI JENJANG SISWA) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                Riwayat & Hasil Nilai Kuis Harian Siswa ({currentActiveLevel})
              </h3>
              <p className="text-xs text-slate-400">
                Rincian perolehan nilai drill soal, tingkat akurasi pengerjaan, dan pembahasan terintegrasi
              </p>
            </div>
          </div>

          {/* Search & Subtest Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kuis..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {(['ALL', 'PK', 'KV', 'PM', 'KA', 'SK'] as const).map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setHistorySubtestFilter(sub)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    historySubtestFilter === sub
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz History Cards */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-400 text-xs space-y-3">
              <p>Tidak ada riwayat kuis untuk filter ini.</p>
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Mulai Quiz Sekarang</span>
              </button>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${
                    item.subtestCode === 'PK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    item.subtestCode === 'KV' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    item.subtestCode === 'PM' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    item.subtestCode === 'KA' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  }`}>
                    {item.subtestCode}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.quizTitle}</h4>
                      <span className={`px-2 py-0.2 text-[9px] font-bold rounded-md border ${
                        item.level === 'SMP'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {item.level}
                      </span>
                      <span className="px-2 py-0.2 text-[9px] font-bold rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.completedAt} • Siswa: <span className="text-slate-300 font-medium">{item.studentName}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                      💡 {item.notes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xl font-black text-amber-400">{item.score}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {item.correctCount}/{item.totalQuestions} Soal Benar
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedQuizForReview(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Detail Review Pembahasan */}
      {selectedQuizForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-black text-xs">
                  {selectedQuizForReview.subtestCode}
                </span>
                <h3 className="text-sm font-bold text-white">Detail & Pembahasan Kuis</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuizForReview(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">{selectedQuizForReview.quizTitle}</h4>
              <p className="text-slate-400">Diselesaikan pada: {selectedQuizForReview.completedAt}</p>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Skor</span>
                  <span className="text-base font-black text-amber-400">{selectedQuizForReview.score}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Benar / Total</span>
                  <span className="text-base font-bold text-emerald-400">{selectedQuizForReview.correctCount}/{selectedQuizForReview.totalQuestions}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Durasi</span>
                  <span className="text-base font-bold text-blue-400">{selectedQuizForReview.durationMinutes} Menit</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs space-y-1">
              <h5 className="font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Catatan Evaluasi Guru:
              </h5>
              <p className="text-slate-300 leading-relaxed">
                {selectedQuizForReview.notes}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedQuizForReview(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Labschool Quiz Drill Modal */}
      <LabschoolQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        user={user}
        currentActiveLevel={currentActiveLevel as 'SMP' | 'SMA'}
        onQuizCompleted={handleQuizCompleted}
        onShowToast={onShowToast}
      />
    </div>
  );
};
