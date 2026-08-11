import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  SnbtStudentProfile,
  SnbtSubtestScore,
  SnbtTryoutHistory,
  SNBT_SUBTEST_LIST
} from './snbtData';
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  GraduationCap,
  Users,
  UserCheck,
  Search,
  Printer,
  Download,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  FileSpreadsheet,
  Table as TableIcon,
  LineChart as LineChartIcon,
  Compass,
  FileCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SnbtPrintMode } from './SnbtPrintReportModal';

interface SnbtActiveStudentReportProps {
  user?: User;
  student: SnbtStudentProfile;
  allStudents: SnbtStudentProfile[];
  onSelectStudent?: (id: string) => void;
  onOpenPrint?: (mode: SnbtPrintMode, studentId?: string) => void;
  onExportCsv?: () => void;
}

type ViewReportMode = 'ALL' | 'CHARTS' | 'TABLES';
type MatrixViewTab = 'STUDENT_SESSIONS' | 'CLASS_COHORT' | 'SUBTEST_GROWTH';

export const SnbtActiveStudentReport: React.FC<SnbtActiveStudentReportProps> = ({
  user,
  student,
  allStudents,
  onSelectStudent,
  onOpenPrint,
  onExportCsv
}) => {
  const isStudent = user?.role === 'student';

  const [viewMode, setViewMode] = useState<ViewReportMode>('ALL');
  const [matrixViewTab, setMatrixViewTab] = useState<MatrixViewTab>('STUDENT_SESSIONS');
  const [cohortSearchQuery, setCohortSearchQuery] = useState<string>('');
  const [cohortGroupFilter, setCohortGroupFilter] = useState<string>('ALL');
  const [cohortPassingFilter, setCohortPassingFilter] = useState<string>('ALL');
  const [activeChartSubtests, setActiveChartSubtests] = useState<{ [key: string]: boolean }>({
    TOTAL: true,
    PU: true,
    PPU: false,
    PBM: false,
    PK: true,
    LBI: false,
    LBE: false,
    PM: true
  });

  // Calculate Rank in Class
  const sortedStudents = useMemo(() => {
    return [...allStudents].sort((a, b) => b.avgTryoutScore - a.avgTryoutScore);
  }, [allStudents]);

  const studentRank = useMemo(() => {
    const idx = sortedStudents.findIndex(s => s.id === student.id);
    return idx !== -1 ? idx + 1 : 1;
  }, [sortedStudents, student.id]);

  // Target PTN 1 & 2 Gaps
  const target1Gap = student.avgTryoutScore - student.passingGrade1;
  const isTarget1Passed = target1Gap >= 0;

  const target2Gap = student.avgTryoutScore - student.passingGrade2;
  const isTarget2Passed = target2Gap >= 0;

  // Class Average 7 Subtest Scores
  const classSubtestAverages = useMemo(() => {
    const codes: Array<'PU' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM'> = [
      'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'
    ];
    const map: { [key: string]: number } = {};

    codes.forEach(code => {
      let sum = 0;
      let count = 0;
      allStudents.forEach(s => {
        const item = s.subtestScores.find(sub => sub.code === code);
        if (item) {
          sum += item.score;
          count++;
        }
      });
      map[code] = count > 0 ? Math.round(sum / count) : 700;
    });
    return map;
  }, [allStudents]);

  // Build complete 5 Tryout Sessions data for the active student
  const fullTryoutSessions = useMemo(() => {
    // Default 5 reference tryouts template with official naming
    const template = [
      { id: 'to-01', name: 'Tryout Akbar SNBT Nasional #1 (Diagnostik & Baseline)', date: '10 Jan 2026', totalParticipants: 4200 },
      { id: 'to-02', name: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)', date: '24 Jan 2026', totalParticipants: 5100 },
      { id: 'to-03', name: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)', date: '05 Feb 2026', totalParticipants: 6200 },
      { id: 'to-04', name: 'Tryout Prediksi Super Intensif #4 (HOTS Tinggi)', date: '20 Feb 2026', totalParticipants: 5800 },
      { id: 'to-05', name: 'Tryout Final Marathon UTBK 2026 #5 (Simulasi Akhir)', date: '08 Mar 2026', totalParticipants: 6500 }
    ];

    const studentHistory = student.tryoutHistory || [];

    return template.map((tpl, index) => {
      const match = studentHistory[index] || studentHistory.find(h => h.id === tpl.id);

      // Score extrapolation if history record is partial
      const growthFactor = (index - 2) * 12; // gradual progress
      const puScore = match?.subtests?.pu ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'PU')?.score || 720) + growthFactor));
      const ppuScore = match?.subtests?.ppu ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'PPU')?.score || 710) + growthFactor));
      const pbmScore = match?.subtests?.pbm ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'PBM')?.score || 715) + growthFactor));
      const pkScore = match?.subtests?.pk ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'PK')?.score || 730) + growthFactor));
      const lbiScore = match?.subtests?.lbi ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'LBI')?.score || 725) + growthFactor));
      const lbeScore = match?.subtests?.lbe ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'LBE')?.score || 740) + growthFactor));
      const pmScore = match?.subtests?.pm ?? Math.max(500, Math.min(800, (student.subtestScores.find(s => s.code === 'PM')?.score || 710) + growthFactor));

      const totalScore = match?.totalScore ?? Math.round((puScore + ppuScore + pbmScore + pkScore + lbiScore + lbeScore + pmScore) / 7);
      const rank = match?.rank ?? Math.max(1, Math.round(studentRank + (4 - index) * 2));
      const participants = match?.totalParticipants ?? tpl.totalParticipants;

      const gap1 = totalScore - student.passingGrade1;
      const gap2 = totalScore - student.passingGrade2;

      let status: 'AMAN' | 'KOMPETITIF' | 'PERLU_DITINGKATKAN' = 'KOMPETITIF';
      if (gap1 >= 0) status = 'AMAN';
      else if (gap1 >= -25) status = 'KOMPETITIF';
      else status = 'PERLU_DITINGKATKAN';

      return {
        id: tpl.id,
        sessionNum: index + 1,
        name: tpl.name,
        date: match?.date || tpl.date,
        totalScore,
        rank,
        totalParticipants: participants,
        passingStatus: status,
        gap1,
        gap2,
        subtests: {
          pu: puScore,
          ppu: ppuScore,
          pbm: pbmScore,
          pk: pkScore,
          lbi: lbiScore,
          lbe: lbeScore,
          pm: pmScore
        }
      };
    });
  }, [student, studentRank]);

  // Cohort filtered students for class comparative matrix
  const cohortFilteredStudents = useMemo(() => {
    return allStudents
      .filter(std => {
        const query = cohortSearchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          std.name.toLowerCase().includes(query) ||
          std.nis.includes(query) ||
          std.schoolOrigin.toLowerCase().includes(query) ||
          std.targetPtn1.toLowerCase().includes(query) ||
          std.prodi1.toLowerCase().includes(query);

        const matchGroup = cohortGroupFilter === 'ALL' || std.group.includes(cohortGroupFilter);

        let matchPassing = true;
        const isPassed = std.avgTryoutScore >= std.passingGrade1;
        if (cohortPassingFilter === 'LOLOS') matchPassing = isPassed;
        else if (cohortPassingFilter === 'KOMPETITIF') matchPassing = !isPassed && (std.avgTryoutScore - std.passingGrade1) >= -25;
        else if (cohortPassingFilter === 'BELUM') matchPassing = !isPassed && (std.avgTryoutScore - std.passingGrade1) < -25;

        return matchSearch && matchGroup && matchPassing;
      })
      .sort((a, b) => b.avgTryoutScore - a.avgTryoutScore);
  }, [allStudents, cohortSearchQuery, cohortGroupFilter, cohortPassingFilter]);

  // 7 Subtests Growth Matrix (Baseline TO #1 -> Final TO #5)
  const subtestGrowthMatrix = useMemo(() => {
    const codes: Array<'PU' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM'> = [
      'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'
    ];

    const to1 = fullTryoutSessions[0]?.subtests;
    const to2 = fullTryoutSessions[1]?.subtests;
    const to3 = fullTryoutSessions[2]?.subtests;
    const to4 = fullTryoutSessions[3]?.subtests;
    const to5 = fullTryoutSessions[4]?.subtests;

    return codes.map(code => {
      const key = code.toLowerCase() as keyof typeof to1;
      const subItem = student.subtestScores.find(s => s.code === code);
      const name = subItem?.name || code;
      const category = subItem?.category || 'TPS';
      const score1 = to1 ? to1[key] : 700;
      const score2 = to2 ? to2[key] : 710;
      const score3 = to3 ? to3[key] : 725;
      const score4 = to4 ? to4[key] : 740;
      const score5 = to5 ? to5[key] : 755;
      const delta = score5 - score1;
      const avg = Math.round((score1 + score2 + score3 + score4 + score5) / 5);
      const target = subItem?.targetScore || student.passingGrade1;
      const classAvg = classSubtestAverages[code] || 700;
      const accuracy = subItem?.accuracy || 85;

      return {
        code,
        name,
        category,
        score1,
        score2,
        score3,
        score4,
        score5,
        delta,
        avg,
        target,
        classAvg,
        accuracy,
        status: avg >= target ? 'MEMENUHI TARGET' : (avg - target) >= -20 ? 'KOMPETITIF' : 'PERLU DRILL'
      };
    });
  }, [fullTryoutSessions, student, classSubtestAverages]);

  // Trend Progression Data for Recharts Line & Area Chart
  const trendChartData = useMemo(() => {
    const classAveragesPerTo = [685, 702, 715, 728, 736];

    return fullTryoutSessions.map((session, idx) => {
      const prevScore = idx > 0 ? fullTryoutSessions[idx - 1].totalScore : session.totalScore;
      const delta = session.totalScore - prevScore;

      return {
        sessionName: `TO #${session.sessionNum}`,
        fullName: session.name,
        date: session.date,
        TOTAL: session.totalScore,
        PU: session.subtests.pu,
        PPU: session.subtests.ppu,
        PBM: session.subtests.pbm,
        PK: session.subtests.pk,
        LBI: session.subtests.lbi,
        LBE: session.subtests.lbe,
        PM: session.subtests.pm,
        TargetPTN1: student.passingGrade1,
        TargetPTN2: student.passingGrade2,
        RataRataKelas: classAveragesPerTo[idx] || 710,
        delta: idx > 0 ? delta : 0
      };
    });
  }, [fullTryoutSessions, student.passingGrade1, student.passingGrade2]);

  // Radar 7 Subtest Data
  const radarChartData = useMemo(() => {
    const subtestMeta = [
      { code: 'PU', name: 'Penalaran Umum (PU)' },
      { code: 'PPU', name: 'Pengetahuan Umum (PPU)' },
      { code: 'PBM', name: 'Pemahaman Bacaan (PBM)' },
      { code: 'PK', name: 'Kuantitatif (PK)' },
      { code: 'LBI', name: 'Literasi B. Indo (LBI)' },
      { code: 'LBE', name: 'Literasi B. Ing (LBE)' },
      { code: 'PM', name: 'Penalaran MTK (PM)' }
    ];

    return subtestMeta.map(sub => {
      const studentSub = student.subtestScores.find(s => s.code === sub.code);
      const studentScore = studentSub ? studentSub.score : 700;
      const classAvg = classSubtestAverages[sub.code] || 700;
      const targetScore = studentSub ? studentSub.targetScore : student.passingGrade1;

      return {
        subtest: sub.code,
        subtestFullName: sub.name,
        Siswa: studentScore,
        RataRataKelas: classAvg,
        TargetLolos: targetScore
      };
    });
  }, [student, classSubtestAverages]);

  // Subtest Breakdown Bar Chart Data
  const subtestBarData = useMemo(() => {
    return student.subtestScores.map(sub => {
      const gap = sub.score - sub.targetScore;
      const isAchieved = sub.score >= sub.targetScore;
      return {
        code: sub.code,
        name: sub.name,
        score: sub.score,
        targetScore: sub.targetScore,
        accuracy: sub.accuracy,
        correct: sub.correct,
        totalQuestions: sub.totalQuestions,
        category: sub.category,
        gap,
        isAchieved
      };
    });
  }, [student]);

  // Calculate Table Summary Stats
  const tableSummary = useMemo(() => {
    if (fullTryoutSessions.length === 0) return null;

    let sumPU = 0, sumPPU = 0, sumPBM = 0, sumPK = 0, sumLBI = 0, sumLBE = 0, sumPM = 0, sumTotal = 0;
    let minScore = 999;
    let maxScore = 0;

    fullTryoutSessions.forEach(s => {
      sumPU += s.subtests.pu;
      sumPPU += s.subtests.ppu;
      sumPBM += s.subtests.pbm;
      sumPK += s.subtests.pk;
      sumLBI += s.subtests.lbi;
      sumLBE += s.subtests.lbe;
      sumPM += s.subtests.pm;
      sumTotal += s.totalScore;

      if (s.totalScore < minScore) minScore = s.totalScore;
      if (s.totalScore > maxScore) maxScore = s.totalScore;
    });

    const count = fullTryoutSessions.length;
    const avgTotal = Math.round(sumTotal / count);
    const firstScore = fullTryoutSessions[0].totalScore;
    const lastScore = fullTryoutSessions[count - 1].totalScore;
    const totalGrowth = lastScore - firstScore;

    return {
      avgPU: Math.round(sumPU / count),
      avgPPU: Math.round(sumPPU / count),
      avgPBM: Math.round(sumPBM / count),
      avgPK: Math.round(sumPK / count),
      avgLBI: Math.round(sumLBI / count),
      avgLBE: Math.round(sumLBE / count),
      avgPM: Math.round(sumPM / count),
      avgTotal,
      minScore,
      maxScore,
      totalGrowth
    };
  }, [fullTryoutSessions]);

  // Highest and Lowest Subtest for Active Student
  const subtestPerformance = useMemo(() => {
    const sorted = [...student.subtestScores].sort((a, b) => b.score - a.score);
    return {
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1]
    };
  }, [student]);

  // 4 Target Prodi Simulation List
  const fourProdiSimulations = useMemo(() => {
    return [
      {
        pilihan: 'Pilihan #1 (Utama)',
        ptn: student.targetPtn1,
        prodi: student.prodi1,
        passingGrade: student.passingGrade1,
        currentScore: student.avgTryoutScore,
        gap: student.avgTryoutScore - student.passingGrade1,
        chance: student.avgTryoutScore >= student.passingGrade1 ? '85% (Sangat Tinggi)' : student.avgTryoutScore >= student.passingGrade1 - 15 ? '68% (Kompetitif)' : '42% (Perlu Peningkatan)',
        status: student.avgTryoutScore >= student.passingGrade1 ? 'LOLOS AMAN' : 'KOMPETITIF',
        statusColor: student.avgTryoutScore >= student.passingGrade1 ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' : 'text-amber-400 bg-amber-950/40 border-amber-500/30'
      },
      {
        pilihan: 'Pilihan #2 (Cadangan)',
        ptn: student.targetPtn2,
        prodi: student.prodi2,
        passingGrade: student.passingGrade2,
        currentScore: student.avgTryoutScore,
        gap: student.avgTryoutScore - student.passingGrade2,
        chance: student.avgTryoutScore >= student.passingGrade2 ? '92% (Sangat Aman)' : student.avgTryoutScore >= student.passingGrade2 - 15 ? '75% (Kompetitif)' : '50% (Butuh Tambahan)',
        status: student.avgTryoutScore >= student.passingGrade2 ? 'LOLOS AMAN' : 'REALISTIS',
        statusColor: student.avgTryoutScore >= student.passingGrade2 ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' : 'text-blue-400 bg-blue-950/40 border-blue-500/30'
      },
      {
        pilihan: 'Pilihan #3 (Vokasi/D4 Pilihan)',
        ptn: `${student.targetPtn1.split('(')[0].trim()} - Program Terapan`,
        prodi: 'D4 Manajemen Bisnis Terapan / Rekayasa Perangkat Lunak',
        passingGrade: Math.min(student.passingGrade1, student.passingGrade2) - 25,
        currentScore: student.avgTryoutScore,
        gap: student.avgTryoutScore - (Math.min(student.passingGrade1, student.passingGrade2) - 25),
        chance: '95% (Sangat Tinggi)',
        status: 'LOLOS PRIORITAS',
        statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
      },
      {
        pilihan: 'Pilihan #4 (Prodi Pengaman)',
        ptn: 'Universitas Negeri Jakarta (UNJ) / Kampus Mitra',
        prodi: 'Pendidikan Vokasional / Ilmu Informasi',
        passingGrade: Math.min(student.passingGrade1, student.passingGrade2) - 45,
        currentScore: student.avgTryoutScore,
        gap: student.avgTryoutScore - (Math.min(student.passingGrade1, student.passingGrade2) - 45),
        chance: '99% (Cadangan Kuat)',
        status: 'PENGAMAN AMAN',
        statusColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
      }
    ];
  }, [student]);

  const toggleChartSubtest = (key: string) => {
    setActiveChartSubtests(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6" id="snbt-active-student-full-report">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & VIEW MODE CONTROLS */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              LAPORAN SISWA AKTIF TERPADU
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              NIS: {student.nis}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Peringkat #{studentRank} / {allStudents.length} Siswa
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2.5">
            <span>Rapor Lengkap: {student.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Menampilkan rekapitulasi data tryout 7 subtes resmi SNPMB, grafik tren pertumbuhan nilai IRT, radar penguasaan materi, dan simulasi kelulusan prodi pilihan.
          </p>
        </div>

        {/* Action Buttons & View Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CHARTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'CHARTS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Grafik Saja</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'TABLES'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Saja</span>
            </button>
          </div>

          {/* Print PDF Button */}
          {onOpenPrint && (
            <button
              type="button"
              onClick={() => onOpenPrint('STUDENT_REPORT', student.id)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor</span>
            </button>
          )}

          {/* Export CSV Button */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATISTIK RINGKAS SISWA AKTIF */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-Rata IRT</span>
          <span className="text-2xl font-black text-indigo-400 font-mono block">{student.avgTryoutScore}</span>
          <span className="text-[10px] text-slate-500 font-medium">5 Sesi Tryout</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skor Tertinggi</span>
          <span className="text-2xl font-black text-amber-400 font-mono block">{student.highestTryoutScore}</span>
          <span className="text-[10px] text-amber-300 font-medium">Rekor Ujian</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peringkat Kelas</span>
          <span className="text-2xl font-black text-emerald-400 font-mono block">
            #{studentRank} <span className="text-xs text-slate-400 font-normal">/ {allStudents.length}</span>
          </span>
          <span className="text-[10px] text-emerald-300 font-medium">Top Performer</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pertumbuhan Total</span>
          <span className="text-2xl font-black text-emerald-400 font-mono block">
            +{tableSummary?.totalGrowth || 0}
          </span>
          <span className="text-[10px] text-emerald-300 font-medium">Poin dari TO-1</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subtes Terkuat</span>
          <span className="text-lg font-black text-cyan-400 font-mono block mt-1">
            {subtestPerformance.strongest?.code} ({subtestPerformance.strongest?.score})
          </span>
          <span className="text-[10px] text-cyan-300 font-medium truncate block">{subtestPerformance.strongest?.name}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peluang PTN 1</span>
          <span className={`text-lg font-black font-mono block mt-1 ${isTarget1Passed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isTarget1Passed ? `+${target1Gap} (Aman)` : `${target1Gap} Poin`}
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate block">{student.prodi1.split(' ')[0]}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION GRAFIK ANALISIS SISWA AKTIF */}
      {/* ========================================================================= */}
      {(viewMode === 'ALL' || viewMode === 'CHARTS') && (
        <div className="space-y-6" id="snbt-active-student-charts">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-indigo-400" />
              Grafik Analisis & Tren Siswa: {student.name}
            </h3>
            <span className="text-xs text-slate-400 font-medium">Visualisasi Interaktif Multi-Dimensi</span>
          </div>

          {/* Row 1: Line Progression Chart vs Passing Grade & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Line Chart Progression of Tryout 1 to 5 */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Tren Skor IRT per Tryout (TO-1 s.d. TO-5)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Membandingkan skor siswa terhadap passing grade target PTN 1 ({student.passingGrade1}) dan rata-rata kelas.
                    </p>
                  </div>
                </div>

                {/* Subtest Line Filter Toggles */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Tampilkan:</span>
                  {[
                    { key: 'TOTAL', label: 'Skor Total IRT', color: 'bg-indigo-600 text-white' },
                    { key: 'PU', label: 'PU', color: 'bg-blue-500 text-white' },
                    { key: 'PPU', label: 'PPU', color: 'bg-cyan-500 text-white' },
                    { key: 'PBM', label: 'PBM', color: 'bg-amber-500 text-white' },
                    { key: 'PK', label: 'PK', color: 'bg-rose-500 text-white' },
                    { key: 'LBI', label: 'LBI', color: 'bg-emerald-500 text-white' },
                    { key: 'LBE', label: 'LBE', color: 'bg-purple-500 text-white' },
                    { key: 'PM', label: 'PM', color: 'bg-fuchsia-500 text-white' }
                  ].map(sub => (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => toggleChartSubtest(sub.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeChartSubtests[sub.key]
                          ? `${sub.color} shadow-sm ring-1 ring-white/30`
                          : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Chart Component */}
              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="sessionName" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis domain={[620, 810]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '14px',
                        fontSize: '11px',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {activeChartSubtests.TOTAL && (
                      <Line
                        type="monotone"
                        dataKey="TOTAL"
                        name={`Skor ${student.name.split(' ')[0]}`}
                        stroke="#6366f1"
                        strokeWidth={3.5}
                        dot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                    )}

                    {activeChartSubtests.PU && (
                      <Line type="monotone" dataKey="PU" name="PU" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeChartSubtests.PPU && (
                      <Line type="monotone" dataKey="PPU" name="PPU" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeChartSubtests.PBM && (
                      <Line type="monotone" dataKey="PBM" name="PBM" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeChartSubtests.PK && (
                      <Line type="monotone" dataKey="PK" name="PK" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeChartSubtests.LBI && (
                      <Line type="monotone" dataKey="LBI" name="LBI" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeChartSubtests.LBE && (
                      <Line type="monotone" dataKey="LBE" name="LBE" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeChartSubtests.PM && (
                      <Line type="monotone" dataKey="PM" name="PM" stroke="#d946ef" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}

                    <Line
                      type="monotone"
                      dataKey="TargetPTN1"
                      name={`Target #1: ${student.prodi1.split(' ')[0]} (${student.passingGrade1})`}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="TargetPTN2"
                      name={`Target #2: ${student.prodi2.split(' ')[0]} (${student.passingGrade2})`}
                      stroke="#38bdf8"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="RataRataKelas"
                      name="Rata-rata Kelas"
                      stroke="#64748b"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Skor TO #1 (Baseline)</span>
                  <span className="text-xs sm:text-sm font-black text-slate-300 font-mono">
                    {fullTryoutSessions[0]?.totalScore || 0} IRT
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Skor TO #5 (Terakhir)</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-400 font-mono">
                    {fullTryoutSessions[fullTryoutSessions.length - 1]?.totalScore || 0} IRT
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Kenaikan Skor</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                    +{tableSummary?.totalGrowth || 0} Poin
                  </span>
                </div>
              </div>
            </div>

            {/* Chart 2: Radar Chart 7 Subtes */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <PieChartIcon className="w-4 h-4 text-indigo-400" />
                    Radar Penguasaan 7 Subtes
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    7 DIMENSI
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Perbandingan profil penguasaan 7 subtes siswa terhadap rata-rata angkatan dan passing grade.
                </p>
              </div>

              {/* Radar Chart Component */}
              <div className="w-full h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData} outerRadius="75%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subtest" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[550, 800]} stroke="#475569" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Rata-rata Kelas"
                      dataKey="RataRataKelas"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.25}
                    />
                    <Radar
                      name={student.name.split(' ')[0]}
                      dataKey="Siswa"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.55}
                    />
                    <Radar
                      name="Target Lolos"
                      dataKey="TargetLolos"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.05}
                      strokeDasharray="3 3"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Rangkuman Penguasaan:</p>
                <p>
                  Siswa <strong className="text-indigo-300">{student.name}</strong> paling menonjol pada subtes{' '}
                  <strong className="text-emerald-400">{subtestPerformance.strongest?.name} ({subtestPerformance.strongest?.score})</strong>{' '}
                  dan perlu drill tambahan pada subtes{' '}
                  <strong className="text-amber-400">{subtestPerformance.weakest?.name} ({subtestPerformance.weakest?.score})</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Bar Chart Skor Subtes vs Target & Akurasi */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Komparasi Nilai 7 Subtes Siswa vs Target Passing Score
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisasi nilai aktual siswa, target kelulusan per subtes, dan persentase akurasi jawaban benar.
                </p>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subtestBarData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis domain={[500, 820]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="score" name={`Skor Siswa (${student.name.split(' ')[0]})`} fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {subtestBarData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= entry.targetScore ? '#10b981' : entry.score >= 700 ? '#6366f1' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="targetScore" name="Target Skor Subtes" fill="#475569" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION TABEL LAPORAN SISWA AKTIF */}
      {/* ========================================================================= */}
      {(viewMode === 'ALL' || viewMode === 'TABLES') && (
        <div className="space-y-6" id="snbt-active-student-tables">
          {/* TABEL UTAMA: MATRIKS NILAI TRYOUT AKBAR #1 HINGGA TRYOUT FINAL #5 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4" id="snbt-active-student-matrix-tryout">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    MATRIKS KOMPREHENSIF MULTI-TRYOUT
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Standar IRT SNPMB Resmi
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    TO-1 s.d. TO-5
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1.5 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Matriks Nilai Tryout Akbar #1 hingga Tryout Final #5
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isStudent
                    ? 'Rekapitulasi perkembangan nilai per sesi tryout 7 subtes dan kalkulasi delta pertumbuhan skor IRT Anda.'
                    : 'Rekapitulasi perkembangan nilai per sesi tryout 7 subtes, komparasi ranking angkatan XII, dan kalkulasi delta pertumbuhan skor IRT.'}
                </p>
              </div>

              {/* View Switcher Tabs inside Matrix */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setMatrixViewTab('STUDENT_SESSIONS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    matrixViewTab === 'STUDENT_SESSIONS'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Sesi Siswa ({student.name.split(' ')[0]})</span>
                </button>

                {!isStudent && (
                  <button
                    type="button"
                    onClick={() => setMatrixViewTab('CLASS_COHORT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      matrixViewTab === 'CLASS_COHORT'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Komparasi Angkatan ({allStudents.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMatrixViewTab('SUBTEST_GROWTH')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    matrixViewTab === 'SUBTEST_GROWTH'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Pertumbuhan 7 Subtes</span>
                </button>
              </div>
            </div>

            {/* SUB-VIEW 1: SESI LENGKAP SISWA AKTIF (TO #1 s.d. TO #5 x 7 SUBTES) */}
            {matrixViewTab === 'STUDENT_SESSIONS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Menampilkan <strong className="text-white">5 Sesi Tryout Akbar & Simulasi UTBK</strong> untuk <strong className="text-indigo-300">{student.name}</strong> ({student.nis})
                  </span>
                  <span className="text-right">
                    Target PTN #1: <strong className="text-amber-400 font-mono">{student.prodi1} ({student.passingGrade1} IRT)</strong>
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 text-center">Sesi</th>
                        <th className="py-3 px-3 min-w-[200px]">Nama Tryout & Tanggal</th>
                        <th className="py-3 px-2 text-center text-blue-400">PU</th>
                        <th className="py-3 px-2 text-center text-cyan-400">PPU</th>
                        <th className="py-3 px-2 text-center text-amber-400">PBM</th>
                        <th className="py-3 px-2 text-center text-rose-400">PK</th>
                        <th className="py-3 px-2 text-center text-emerald-400">LBI</th>
                        <th className="py-3 px-2 text-center text-purple-400">LBE</th>
                        <th className="py-3 px-2 text-center text-fuchsia-400">PM</th>
                        <th className="py-3 px-3 text-center text-indigo-300 bg-indigo-950/40">Total IRT</th>
                        <th className="py-3 px-3 text-center">Peringkat</th>
                        <th className="py-3 px-3 text-center">Gap PTN #1</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-center">Growth (Δ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {fullTryoutSessions.map((session, idx) => {
                        const prevScore = idx > 0 ? fullTryoutSessions[idx - 1].totalScore : session.totalScore;
                        const delta = session.totalScore - prevScore;
                        const isPassed = session.totalScore >= student.passingGrade1;

                        return (
                          <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 text-center font-bold text-slate-400">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px]">
                                TO #{session.sessionNum}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <p className="font-bold text-white leading-tight">{session.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{session.date}</p>
                            </td>
                            <td className="py-3 px-2 text-center text-blue-400 font-bold">{session.subtests.pu}</td>
                            <td className="py-3 px-2 text-center text-cyan-400 font-bold">{session.subtests.ppu}</td>
                            <td className="py-3 px-2 text-center text-amber-400 font-bold">{session.subtests.pbm}</td>
                            <td className="py-3 px-2 text-center text-rose-400 font-bold">{session.subtests.pk}</td>
                            <td className="py-3 px-2 text-center text-emerald-400 font-bold">{session.subtests.lbi}</td>
                            <td className="py-3 px-2 text-center text-purple-400 font-bold">{session.subtests.lbe}</td>
                            <td className="py-3 px-2 text-center text-fuchsia-400 font-bold">{session.subtests.pm}</td>
                            <td className="py-3 px-3 text-center font-black text-indigo-300 text-sm bg-indigo-950/30">
                              {session.totalScore}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-300 font-sans text-[11px]">
                              #{session.rank} <span className="text-[9px] text-slate-500 font-mono">/ {session.totalParticipants}</span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-[11px]">
                              <span className={session.gap1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {session.gap1 >= 0 ? `+${session.gap1}` : session.gap1}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-sans">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                  isPassed
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : session.gap1 >= -20
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                {isPassed ? 'LOLOS AMAN' : session.gap1 >= -20 ? 'KOMPETITIF' : 'PERLU DRILL'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-[11px]">
                              {idx === 0 ? (
                                <span className="text-slate-500 text-[10px]">Baseline</span>
                              ) : delta > 0 ? (
                                <span className="text-emerald-400 flex items-center justify-center gap-0.5">
                                  <ArrowUpRight className="w-3 h-3" /> +{delta}
                                </span>
                              ) : delta < 0 ? (
                                <span className="text-rose-400 flex items-center justify-center gap-0.5">
                                  <ArrowDownRight className="w-3 h-3" /> {delta}
                                </span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {tableSummary && (
                      <tfoot>
                        <tr className="bg-slate-950 font-bold text-white border-t-2 border-slate-700 font-mono">
                          <td colSpan={2} className="py-3 px-3 font-sans text-xs uppercase text-indigo-300 font-black">
                            Rata-Rata Kumulatif Siswa
                          </td>
                          <td className="py-3 px-2 text-center text-blue-400">{tableSummary.avgPU}</td>
                          <td className="py-3 px-2 text-center text-cyan-400">{tableSummary.avgPPU}</td>
                          <td className="py-3 px-2 text-center text-amber-400">{tableSummary.avgPBM}</td>
                          <td className="py-3 px-2 text-center text-rose-400">{tableSummary.avgPK}</td>
                          <td className="py-3 px-2 text-center text-emerald-400">{tableSummary.avgLBI}</td>
                          <td className="py-3 px-2 text-center text-purple-400">{tableSummary.avgLBE}</td>
                          <td className="py-3 px-2 text-center text-fuchsia-400">{tableSummary.avgPM}</td>
                          <td className="py-3 px-3 text-center text-indigo-300 font-black text-sm bg-indigo-950/60">
                            {tableSummary.avgTotal}
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-400 font-sans text-xs">
                            Top #{studentRank}
                          </td>
                          <td className="py-3 px-3 text-center text-xs">
                            <span className={target1Gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {target1Gap >= 0 ? `+${target1Gap}` : target1Gap}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-sans">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {isTarget1Passed ? 'SIAP TEMPUR' : 'PERLU FOKUS'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-400 font-black text-xs">
                            +{tableSummary.totalGrowth} Poin
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: MATRIKS KOMPARASI ANGKATAN KELAS XII (TO #1 s.d. TO #5) */}
            {!isStudent && matrixViewTab === 'CLASS_COHORT' && (
              <div className="space-y-4">
                {/* Cohort Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cohortSearchQuery}
                      onChange={(e) => setCohortSearchQuery(e.target.value)}
                      placeholder="Cari nama siswa, NIS, target PTN, atau prodi..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={cohortGroupFilter}
                      onChange={(e) => setCohortGroupFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="ALL">Semua Kelompok</option>
                      <option value="XII-UTBK-A">XII-UTBK-A</option>
                      <option value="XII-UTBK-B">XII-UTBK-B</option>
                      <option value="XII-UTBK-C">XII-UTBK-C</option>
                    </select>

                    <select
                      value={cohortPassingFilter}
                      onChange={(e) => setCohortPassingFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="LOLOS">Lolos Passing Grade</option>
                      <option value="KOMPETITIF">Kompetitif (Gap &ge; -25)</option>
                      <option value="BELUM">Perlu Peningkatan</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3 text-center">Rank</th>
                        <th className="py-3 px-3 min-w-[180px]">Siswa</th>
                        <th className="py-3 px-3 min-w-[140px]">Target PTN 1 (PG)</th>
                        <th className="py-3 px-2 text-center bg-slate-950">TO #1 (Diag)</th>
                        <th className="py-3 px-2 text-center bg-slate-950">TO #2 (TPS)</th>
                        <th className="py-3 px-2 text-center bg-slate-950">TO #3 (IRT)</th>
                        <th className="py-3 px-2 text-center bg-slate-950">TO #4 (HOTS)</th>
                        <th className="py-3 px-2 text-center bg-slate-950">TO #5 (Final)</th>
                        <th className="py-3 px-3 text-center font-bold text-indigo-400 bg-indigo-950/30">Rata-Rata</th>
                        <th className="py-3 px-3 text-center font-bold text-amber-400 bg-amber-950/20">Tertinggi</th>
                        <th className="py-3 px-3 text-center text-emerald-400">Delta Growth</th>
                        <th className="py-3 px-3 text-center">Peluang Lolos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {cohortFilteredStudents.map((std, idx) => {
                        const to1 = std.tryoutHistory?.find(t => t.id === 'to-01')?.totalScore || '-';
                        const to2 = std.tryoutHistory?.find(t => t.id === 'to-02')?.totalScore || '-';
                        const to3 = std.tryoutHistory?.find(t => t.id === 'to-03')?.totalScore || '-';
                        const to4 = std.tryoutHistory?.find(t => t.id === 'to-04')?.totalScore || '-';
                        const to5 = std.tryoutHistory?.find(t => t.id === 'to-05')?.totalScore || '-';

                        const firstVal = typeof to1 === 'number' ? to1 : std.avgTryoutScore;
                        const lastVal = typeof to5 === 'number' ? to5 : typeof to3 === 'number' ? to3 : std.avgTryoutScore;
                        const growthDelta = lastVal - firstVal;
                        const isPassed = std.avgTryoutScore >= std.passingGrade1;
                        const isCurrentActive = std.id === student.id;

                        return (
                          <tr
                            key={std.id}
                            onClick={() => onSelectStudent && onSelectStudent(std.id)}
                            className={`transition-colors cursor-pointer ${
                              isCurrentActive
                                ? 'bg-indigo-950/50 ring-1 ring-inset ring-indigo-500/60'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={std.avatar}
                                  alt={std.name}
                                  className={`w-7 h-7 rounded-full object-cover border ${
                                    isCurrentActive ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-700'
                                  }`}
                                />
                                <div>
                                  <p className="font-bold text-white leading-tight flex items-center gap-1.5">
                                    <span>{std.name}</span>
                                    {isCurrentActive && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-500 text-white flex items-center gap-0.5 shadow-sm">
                                        <UserCheck className="w-2.5 h-2.5" />
                                        AKTIF
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono">{std.group.replace(' (UTBK)', '')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-200 leading-tight">{std.prodi1}</p>
                              <p className="text-[10px] text-slate-400">{std.targetPtn1} <span className="text-amber-400 font-mono font-bold">(PG: {std.passingGrade1})</span></p>
                            </td>

                            {/* 5 Tryout Score Columns */}
                            <td className="py-3 px-2 text-center font-mono text-slate-300">{to1}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-300">{to2}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-300">{to3}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-300">{to4}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-300 font-bold text-emerald-300">{to5}</td>

                            {/* Summary Metrics */}
                            <td className="py-3 px-3 text-center font-mono font-black text-indigo-400 text-sm bg-indigo-950/20">
                              {std.avgTryoutScore}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-amber-400 bg-amber-950/10">
                              {std.highestTryoutScore}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs ${
                                growthDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {growthDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {growthDelta >= 0 ? `+${growthDelta}` : growthDelta}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isPassed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {isPassed ? 'Sangat Berpeluang' : 'Kompetitif'}
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

            {/* SUB-VIEW 3: MATRIKS PERTUMBUHAN 7 SUBTES (TO #1 -> TO #5) */}
            {matrixViewTab === 'SUBTEST_GROWTH' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Pelacakan lonjakan skor 7 subtes <strong className="text-white">{student.name}</strong> dari Tryout #1 Diagnostik hingga Tryout #5 Final
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Target Skor IRT: {student.passingGrade1}+
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 text-center">Kode</th>
                        <th className="py-3 px-3">Nama Subtes & Kategori</th>
                        <th className="py-3 px-2 text-center text-slate-300">TO #1 (Awal)</th>
                        <th className="py-3 px-2 text-center text-slate-300">TO #2</th>
                        <th className="py-3 px-2 text-center text-slate-300">TO #3</th>
                        <th className="py-3 px-2 text-center text-slate-300">TO #4</th>
                        <th className="py-3 px-2 text-center text-emerald-400">TO #5 (Akhir)</th>
                        <th className="py-3 px-3 text-center text-indigo-300 bg-indigo-950/30">Rata-Rata</th>
                        <th className="py-3 px-3 text-center text-slate-400">Target</th>
                        <th className="py-3 px-3 text-center text-emerald-400">Growth (Δ)</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {subtestGrowthMatrix.map(row => {
                        const isHitTarget = row.avg >= row.target;
                        return (
                          <tr key={row.code} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 text-center font-bold">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700 text-xs">
                                {row.code}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-sans">
                              <p className="font-bold text-white">{row.name}</p>
                              <span className="text-[10px] text-slate-500">{row.category}</span>
                            </td>
                            <td className="py-3 px-2 text-center text-slate-400">{row.score1}</td>
                            <td className="py-3 px-2 text-center text-slate-400">{row.score2}</td>
                            <td className="py-3 px-2 text-center text-slate-400">{row.score3}</td>
                            <td className="py-3 px-2 text-center text-slate-400">{row.score4}</td>
                            <td className="py-3 px-2 text-center font-bold text-emerald-400">{row.score5}</td>
                            <td className="py-3 px-3 text-center font-black text-indigo-300 text-sm bg-indigo-950/30">
                              {row.avg}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-400">
                              {row.target}
                            </td>
                            <td className="py-3 px-3 text-center font-bold">
                              <span className={row.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {row.delta >= 0 ? `+${row.delta}` : row.delta}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-sans">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                isHitTarget
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : (row.avg - row.target) >= -20
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}>
                                {row.status}
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

          {/* TABEL 2: ANALISIS PENGUASAAN 7 SUBTES DETAIL */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    DIAGNOSTIK 7 SUBTES RESMI
                  </span>
                  <span className="text-xs text-slate-400">Tingkat Penguasaan & Akurasi</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Rincian Diagnostik Penguasaan 7 Subtes: {student.name}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 text-center">Kode</th>
                    <th className="py-3 px-3">Nama Subtes & Kategori</th>
                    <th className="py-3 px-3 text-center">Soal Benar / Total</th>
                    <th className="py-3 px-3 text-center">Akurasi (%)</th>
                    <th className="py-3 px-3 text-center">Skor Siswa</th>
                    <th className="py-3 px-3 text-center">Rata-Rata Kelas</th>
                    <th className="py-3 px-3 text-center">Target Skor</th>
                    <th className="py-3 px-3 text-center">Gap Target</th>
                    <th className="py-3 px-3 text-center">Status Penguasaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {student.subtestScores.map(sub => {
                    const classAvg = classSubtestAverages[sub.code] || 700;
                    const gap = sub.score - sub.targetScore;
                    const isPassed = sub.score >= sub.targetScore;

                    let badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
                    let statusLabel = 'SANGAT TINGGI';
                    if (sub.score < 680) {
                      badgeColor = 'text-rose-400 bg-rose-950/40 border-rose-500/30';
                      statusLabel = 'BUTUH DRILL';
                    } else if (sub.score < 730) {
                      badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-500/30';
                      statusLabel = 'SEDANG / BAIK';
                    }

                    return (
                      <tr key={sub.code} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-400 border border-slate-700 text-xs">
                            {sub.code}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <p className="font-bold text-white">{sub.name}</p>
                          <span className="text-[10px] text-slate-400">{sub.category}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-300 font-bold">
                          {sub.correct} <span className="text-slate-500 font-normal">/ {sub.totalQuestions} Soal</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${sub.accuracy >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {sub.accuracy}%
                            </span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${sub.accuracy >= 85 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${sub.accuracy}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-black text-sm text-indigo-400">
                          {sub.score}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400">
                          {classAvg}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400">
                          {sub.targetScore}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {gap >= 0 ? `+${gap}` : gap}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${badgeColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 3: SIMULASI 4 PILIHAN PROGRAM STUDI PTN */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    SIMULASI KELULUSAN PTN
                  </span>
                  <span className="text-xs text-slate-400">Strategi 4 Pilihan UTBK-SNBT 2026</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Simulasi 4 Pilihan Program Studi: {student.name}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Prioritas Pilihan</th>
                    <th className="py-3 px-3">Universitas & Program Studi</th>
                    <th className="py-3 px-3 text-center">Passing Grade</th>
                    <th className="py-3 px-3 text-center">Skor Siswa</th>
                    <th className="py-3 px-3 text-center">Selisih (Gap)</th>
                    <th className="py-3 px-3 text-center">Estimasi Peluang</th>
                    <th className="py-3 px-3 text-center">Status Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {fourProdiSimulations.map((sim, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-slate-300">
                        {sim.pilihan}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <p className="font-bold text-white">{sim.prodi}</p>
                        <p className="text-[10px] text-slate-400">{sim.ptn}</p>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400 font-bold">{sim.passingGrade}</td>
                      <td className="py-3 px-3 text-center font-black text-indigo-400 text-sm">{sim.currentScore}</td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={sim.gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {sim.gap >= 0 ? `+${sim.gap}` : sim.gap} Poin
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-sans font-bold text-slate-200">
                        {sim.chance}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${sim.statusColor}`}>
                          {sim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Counselor Note Bar */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white">Catatan Evaluasi & Rekomendasi Konselor untuk {student.name}:</p>
                <p className="text-slate-300 leading-relaxed">{student.counselorNotes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
