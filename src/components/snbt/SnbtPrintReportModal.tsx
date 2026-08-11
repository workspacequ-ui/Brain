import React, { useState, useMemo } from 'react';
import {
  SnbtStudentProfile,
  SnbtSubtestScore,
  SNBT_SUBTEST_LIST
} from './snbtData';
import {
  Printer,
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  GraduationCap,
  TrendingUp,
  Target,
  Flame,
  FileText,
  ShieldCheck,
  Filter,
  Layers,
  Table as TableIcon,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  Sliders,
  Users,
  UserCheck,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  FileSpreadsheet,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  LineChart,
  Line,
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
import { OfficialKopSurat } from '../common/OfficialKopSurat';
import { getAppSettings } from '../../utils/storage';

export type SnbtPrintMode = 'STUDENT_REPORT' | 'CLASS_ROSTER' | 'SUBTEST_ANALYSIS';

export type PrintPresetType = 'ALL' | 'TABLES_ONLY' | 'CHARTS_ONLY' | 'EXECUTIVE_SUMMARY' | 'ANALYSIS_ONLY' | 'CUSTOM';

export interface SnbtPrintFilterOptions {
  // 1. Header & Biodata Siswa
  showKopSurat: boolean;
  showStudentBiodata: boolean;
  showSummaryCards: boolean;

  // 2. Tabel Data & Riwayat Ujian
  showTryoutHistoryTable: boolean;      // Tabel Riwayat 5 Sesi Tryout (TO-1 s.d. TO-5)
  showSubtestDiagnostikTable: boolean;  // Tabel Diagnostik Penguasaan 7 Subtes IRT
  showProdiSimulationTable: boolean;    // Tabel Simulasi 4 Program Studi PTN 2026
  showClassRosterTable: boolean;        // Tabel Roster Kelas (Peringkat Angkatan)

  // 3. Grafik & Visualisasi Performa
  showLineTrendChart: boolean;          // Grafik Garis Tren Skor IRT TO-1 s.d. TO-5
  showRadarChart: boolean;              // Grafik Radar 7 Dimensi Subtes SNBT
  showBarSubtestChart: boolean;         // Grafik Batang Capaian Nilai per Subtes

  // 4. Analisis & Rekomendasi Konseling
  showSwotAnalysis: boolean;            // Analisis Kekuatan & Area Peningkatan Subtes
  showTargetPtnAnalysis: boolean;       // Analisis Rasionalisasi & Peluang PTN
  showCounselorNotes: boolean;          // Catatan Evaluasi Tim Konselor
  showActionPlan: boolean;              // Rekomendasi Rencana Aksi 30 Hari UTBK
  showSignatures: boolean;              // Kolom Pengesahan & Tanda Tangan Resmi
  showFooterDisclaimer: boolean;        // Footer & Nomor Verifikasi Sistem IRT
}

interface SnbtPrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: SnbtStudentProfile;
  allStudents: SnbtStudentProfile[];
  printMode?: SnbtPrintMode;
  tryoutTitle?: string;
  onSelectStudent?: (studentId: string) => void;
}

const DEFAULT_FILTERS: SnbtPrintFilterOptions = {
  showKopSurat: true,
  showStudentBiodata: true,
  showSummaryCards: true,

  showTryoutHistoryTable: true,
  showSubtestDiagnostikTable: true,
  showProdiSimulationTable: true,
  showClassRosterTable: false,

  showLineTrendChart: true,
  showRadarChart: true,
  showBarSubtestChart: true,

  showSwotAnalysis: true,
  showTargetPtnAnalysis: true,
  showCounselorNotes: true,
  showActionPlan: true,
  showSignatures: true,
  showFooterDisclaimer: true
};

export const SnbtPrintReportModal: React.FC<SnbtPrintReportModalProps> = ({
  isOpen,
  onClose,
  student: initialStudent,
  allStudents,
  printMode: initialPrintMode = 'STUDENT_REPORT',
  tryoutTitle = 'Tryout Intensif IRT SNBT 2026',
  onSelectStudent
}) => {
  if (!isOpen) return null;

  // Active student selection state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudent.id);
  const [currentMode, setCurrentMode] = useState<SnbtPrintMode>(initialPrintMode);
  const [activePreset, setActivePreset] = useState<PrintPresetType>('ALL');
  const [filters, setFilters] = useState<SnbtPrintFilterOptions>(DEFAULT_FILTERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Active Student Object
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === selectedStudentId) || initialStudent;
  }, [allStudents, selectedStudentId, initialStudent]);

  // App Settings
  const appSettings = getAppSettings();
  const kopSettings = appSettings.kopSurat;
  const institution = appSettings.institution;

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Handle Preset Selection
  const handleApplyPreset = (preset: PrintPresetType) => {
    setActivePreset(preset);
    switch (preset) {
      case 'ALL':
        setFilters({
          showKopSurat: true,
          showStudentBiodata: true,
          showSummaryCards: true,
          showTryoutHistoryTable: true,
          showSubtestDiagnostikTable: true,
          showProdiSimulationTable: true,
          showClassRosterTable: false,
          showLineTrendChart: true,
          showRadarChart: true,
          showBarSubtestChart: true,
          showSwotAnalysis: true,
          showTargetPtnAnalysis: true,
          showCounselorNotes: true,
          showActionPlan: true,
          showSignatures: true,
          showFooterDisclaimer: true
        });
        break;
      case 'TABLES_ONLY':
        setFilters({
          showKopSurat: true,
          showStudentBiodata: true,
          showSummaryCards: true,
          showTryoutHistoryTable: true,
          showSubtestDiagnostikTable: true,
          showProdiSimulationTable: true,
          showClassRosterTable: false,
          showLineTrendChart: false,
          showRadarChart: false,
          showBarSubtestChart: false,
          showSwotAnalysis: false,
          showTargetPtnAnalysis: true,
          showCounselorNotes: false,
          showActionPlan: false,
          showSignatures: true,
          showFooterDisclaimer: true
        });
        break;
      case 'CHARTS_ONLY':
        setFilters({
          showKopSurat: true,
          showStudentBiodata: true,
          showSummaryCards: true,
          showTryoutHistoryTable: false,
          showSubtestDiagnostikTable: false,
          showProdiSimulationTable: false,
          showClassRosterTable: false,
          showLineTrendChart: true,
          showRadarChart: true,
          showBarSubtestChart: true,
          showSwotAnalysis: true,
          showTargetPtnAnalysis: true,
          showCounselorNotes: false,
          showActionPlan: false,
          showSignatures: true,
          showFooterDisclaimer: true
        });
        break;
      case 'EXECUTIVE_SUMMARY':
        setFilters({
          showKopSurat: true,
          showStudentBiodata: true,
          showSummaryCards: true,
          showTryoutHistoryTable: false,
          showSubtestDiagnostikTable: true,
          showProdiSimulationTable: true,
          showClassRosterTable: false,
          showLineTrendChart: true,
          showRadarChart: false,
          showBarSubtestChart: false,
          showSwotAnalysis: true,
          showTargetPtnAnalysis: true,
          showCounselorNotes: true,
          showActionPlan: false,
          showSignatures: true,
          showFooterDisclaimer: true
        });
        break;
      case 'ANALYSIS_ONLY':
        setFilters({
          showKopSurat: true,
          showStudentBiodata: true,
          showSummaryCards: true,
          showTryoutHistoryTable: false,
          showSubtestDiagnostikTable: true,
          showProdiSimulationTable: true,
          showClassRosterTable: false,
          showLineTrendChart: false,
          showRadarChart: false,
          showBarSubtestChart: false,
          showSwotAnalysis: true,
          showTargetPtnAnalysis: true,
          showCounselorNotes: true,
          showActionPlan: true,
          showSignatures: true,
          showFooterDisclaimer: true
        });
        break;
      default:
        break;
    }
  };

  const handleToggleFilter = (key: keyof SnbtPrintFilterOptions) => {
    setActivePreset('CUSTOM');
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleGroup = (keys: (keyof SnbtPrintFilterOptions)[], enable: boolean) => {
    setActivePreset('CUSTOM');
    setFilters(prev => {
      const next = { ...prev };
      keys.forEach(k => {
        next[k] = enable;
      });
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate Rank in Class
  const sortedStudents = useMemo(() => {
    return [...allStudents].sort((a, b) => b.avgTryoutScore - a.avgTryoutScore);
  }, [allStudents]);

  const studentRank = useMemo(() => {
    const idx = sortedStudents.findIndex(s => s.id === currentStudent.id);
    return idx !== -1 ? idx + 1 : 1;
  }, [sortedStudents, currentStudent.id]);

  // Target PTN 1 & 2 Gaps
  const target1Gap = currentStudent.avgTryoutScore - currentStudent.passingGrade1;
  const isTarget1Passed = target1Gap >= 0;

  const target2Gap = currentStudent.avgTryoutScore - currentStudent.passingGrade2;
  const isTarget2Passed = target2Gap >= 0;

  const calculatePtnChance = (studentScore: number, passingGrade: number) => {
    const diff = studentScore - passingGrade;
    if (diff >= 10) {
      return { status: 'SANGAT TINGGI (AMAN)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', diff: `+${diff}` };
    }
    if (diff >= -15) {
      return { status: 'KOMPETITIF / REALISTIS', color: 'text-blue-700 bg-blue-50 border-blue-300', diff: `${diff > 0 ? '+' : ''}${diff}` };
    }
    return { status: 'PERLU PENINGKATAN SKOR', color: 'text-amber-700 bg-amber-50 border-amber-300', diff: `${diff}` };
  };

  const ptn1Chance = calculatePtnChance(currentStudent.avgTryoutScore, currentStudent.passingGrade1);
  const ptn2Chance = calculatePtnChance(currentStudent.avgTryoutScore, currentStudent.passingGrade2);

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
    const template = [
      { id: 'to-01', name: 'TO #1 Diagnostik & Baseline', date: '10 Jan 2026', totalParticipants: 4200 },
      { id: 'to-02', name: 'TO #2 TPS & Skolastik', date: '24 Jan 2026', totalParticipants: 5100 },
      { id: 'to-03', name: 'TO #3 Simulasi SNPMB', date: '05 Feb 2026', totalParticipants: 6200 },
      { id: 'to-04', name: 'TO #4 Prediksi Super Intensif', date: '20 Feb 2026', totalParticipants: 5800 },
      { id: 'to-05', name: 'TO #5 Final Marathon UTBK', date: '08 Mar 2026', totalParticipants: 6500 }
    ];

    const studentHistory = currentStudent.tryoutHistory || [];

    return template.map((tpl, index) => {
      const match = studentHistory[index] || studentHistory.find(h => h.id === tpl.id);
      const growthFactor = (index - 2) * 12;
      const puScore = match?.subtests?.pu ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'PU')?.score || 720) + growthFactor));
      const ppuScore = match?.subtests?.ppu ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'PPU')?.score || 710) + growthFactor));
      const pbmScore = match?.subtests?.pbm ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'PBM')?.score || 715) + growthFactor));
      const pkScore = match?.subtests?.pk ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'PK')?.score || 730) + growthFactor));
      const lbiScore = match?.subtests?.lbi ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'LBI')?.score || 725) + growthFactor));
      const lbeScore = match?.subtests?.lbe ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'LBE')?.score || 740) + growthFactor));
      const pmScore = match?.subtests?.pm ?? Math.max(500, Math.min(800, (currentStudent.subtestScores.find(s => s.code === 'PM')?.score || 710) + growthFactor));

      const totalScore = match?.totalScore ?? Math.round((puScore + ppuScore + pbmScore + pkScore + lbiScore + lbeScore + pmScore) / 7);
      const rank = match?.rank ?? Math.max(1, Math.round(studentRank + (4 - index) * 2));
      const participants = match?.totalParticipants ?? tpl.totalParticipants;

      const gap1 = totalScore - currentStudent.passingGrade1;
      const gap2 = totalScore - currentStudent.passingGrade2;

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
  }, [currentStudent, studentRank]);

  // Trend Progression Data for Recharts
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
        PK: session.subtests.pk,
        PM: session.subtests.pm,
        TargetPTN1: currentStudent.passingGrade1,
        TargetPTN2: currentStudent.passingGrade2,
        RataRataKelas: classAveragesPerTo[idx] || 710,
        delta: idx > 0 ? delta : 0
      };
    });
  }, [fullTryoutSessions, currentStudent.passingGrade1, currentStudent.passingGrade2]);

  // Radar 7 Subtest Data
  const radarChartData = useMemo(() => {
    const subtestMeta = [
      { code: 'PU', name: 'Penalaran Umum' },
      { code: 'PPU', name: 'Pengetahuan Umum' },
      { code: 'PBM', name: 'Pemahaman Bacaan' },
      { code: 'PK', name: 'Kuantitatif' },
      { code: 'LBI', name: 'Literasi B. Indo' },
      { code: 'LBE', name: 'Literasi B. Ing' },
      { code: 'PM', name: 'Penalaran MTK' }
    ];

    return subtestMeta.map(sub => {
      const studentSub = currentStudent.subtestScores.find(s => s.code === sub.code);
      const studentScore = studentSub ? studentSub.score : 700;
      const classAvg = classSubtestAverages[sub.code] || 700;
      const targetScore = studentSub ? studentSub.targetScore : currentStudent.passingGrade1;

      return {
        subtest: sub.code,
        subtestFullName: sub.name,
        Siswa: studentScore,
        RataRataKelas: classAvg,
        TargetLolos: targetScore
      };
    });
  }, [currentStudent, classSubtestAverages]);

  // Subtest Breakdown Bar Chart Data
  const subtestBarData = useMemo(() => {
    return currentStudent.subtestScores.map(sub => {
      const gap = sub.score - sub.targetScore;
      return {
        code: sub.code,
        name: sub.name,
        score: sub.score,
        targetScore: sub.targetScore,
        accuracy: sub.accuracy,
        correct: sub.correct,
        totalQuestions: sub.totalQuestions,
        category: sub.category,
        gap
      };
    });
  }, [currentStudent]);

  // 4 Target Prodi Simulation List
  const fourProdiSimulations = useMemo(() => {
    return [
      {
        pilihan: 'Pilihan #1 (Utama)',
        ptn: currentStudent.targetPtn1,
        prodi: currentStudent.prodi1,
        passingGrade: currentStudent.passingGrade1,
        currentScore: currentStudent.avgTryoutScore,
        gap: currentStudent.avgTryoutScore - currentStudent.passingGrade1,
        chance: currentStudent.avgTryoutScore >= currentStudent.passingGrade1 ? '85% (Sangat Tinggi)' : currentStudent.avgTryoutScore >= currentStudent.passingGrade1 - 15 ? '68% (Kompetitif)' : '42% (Perlu Peningkatan)',
        status: currentStudent.avgTryoutScore >= currentStudent.passingGrade1 ? 'LOLOS AMAN' : 'KOMPETITIF',
        statusColor: currentStudent.avgTryoutScore >= currentStudent.passingGrade1 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
      },
      {
        pilihan: 'Pilihan #2 (Alternatif)',
        ptn: currentStudent.targetPtn2,
        prodi: currentStudent.prodi2,
        passingGrade: currentStudent.passingGrade2,
        currentScore: currentStudent.avgTryoutScore,
        gap: currentStudent.avgTryoutScore - currentStudent.passingGrade2,
        chance: currentStudent.avgTryoutScore >= currentStudent.passingGrade2 ? '92% (Sangat Aman)' : currentStudent.avgTryoutScore >= currentStudent.passingGrade2 - 15 ? '75% (Kompetitif)' : '50% (Butuh Tambahan)',
        status: currentStudent.avgTryoutScore >= currentStudent.passingGrade2 ? 'LOLOS AMAN' : 'REALISTIS',
        statusColor: currentStudent.avgTryoutScore >= currentStudent.passingGrade2 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'
      },
      {
        pilihan: 'Pilihan #3 (Vokasi / D4)',
        ptn: `${currentStudent.targetPtn1.split('(')[0].trim()} - Program Terapan`,
        prodi: 'D4 Manajemen Bisnis Terapan / Rekayasa Perangkat Lunak',
        passingGrade: Math.min(currentStudent.passingGrade1, currentStudent.passingGrade2) - 25,
        currentScore: currentStudent.avgTryoutScore,
        gap: currentStudent.avgTryoutScore - (Math.min(currentStudent.passingGrade1, currentStudent.passingGrade2) - 25),
        chance: '95% (Sangat Tinggi)',
        status: 'LOLOS PRIORITAS',
        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      },
      {
        pilihan: 'Pilihan #4 (Pengaman / Cadangan)',
        ptn: 'Universitas Negeri Jakarta (UNJ) / Kampus Mitra',
        prodi: 'Pendidikan Vokasional / Ilmu Informasi',
        passingGrade: Math.min(currentStudent.passingGrade1, currentStudent.passingGrade2) - 45,
        currentScore: currentStudent.avgTryoutScore,
        gap: currentStudent.avgTryoutScore - (Math.min(currentStudent.passingGrade1, currentStudent.passingGrade2) - 45),
        chance: '99% (Cadangan Kuat)',
        status: 'PENGAMAN AMAN',
        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      }
    ];
  }, [currentStudent]);

  // Highest and Lowest Subtests
  const subtestPerformance = useMemo(() => {
    const sorted = [...currentStudent.subtestScores].sort((a, b) => b.score - a.score);
    return {
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1]
    };
  }, [currentStudent]);

  const firstScore = fullTryoutSessions[0]?.totalScore || currentStudent.avgTryoutScore;
  const lastScore = fullTryoutSessions[fullTryoutSessions.length - 1]?.totalScore || currentStudent.avgTryoutScore;
  const totalGrowth = lastScore - firstScore;

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const totalFiltersCount = Object.keys(filters).length;

  const getSubtestCategoryColor = (category: string) => {
    switch (category) {
      case 'TPS':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Literasi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Penalaran Matematika':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible" id="snbt-print-modal-container">
      
      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS (SCREEN ONLY) */}
      {/* ========================================================================= */}
      <div className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between print:hidden bg-slate-900/95 border border-slate-700/80 p-2.5 sm:px-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-white">Pratinjau & Pengaturan Cetak Rapor SNBT</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeFiltersCount}/{totalFiltersCount} Bagian Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pilih bagian tabel, grafik, dan analisis yang ingin ditampilkan pada lembar cetak dokumen resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle filter sidebar button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isSidebarOpen
                ? 'bg-slate-800 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel Filter</span>
          </button>

          {/* Print PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: FILTER SIDEBAR (LEFT) + PRINTABLE A4 PREVIEW (RIGHT) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-7xl pt-16 pb-12 print:pt-0 print:pb-0 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* FILTER CONTROL SIDEBAR (SCREEN ONLY) */}
        {/* ======================================================================= */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-84 xl:w-96 shrink-0 print:hidden bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            
            {/* 1. Student Selector & Mode Switcher */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Siswa yang Dicetak
                </label>
                <span className="text-[10px] text-slate-500 font-mono">NIS: {currentStudent.nis}</span>
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  if (onSelectStudent) onSelectStudent(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sortedStudents.map((std, idx) => (
                  <option key={std.id} value={std.id}>
                    #{idx + 1} - {std.name} ({std.avgTryoutScore} IRT) - {std.className}
                  </option>
                ))}
              </select>

              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCurrentMode('STUDENT_REPORT')}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    currentMode === 'STUDENT_REPORT'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rapor Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMode('CLASS_ROSTER')}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    currentMode === 'CLASS_ROSTER'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Roster Kelas
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMode('SUBTEST_ANALYSIS')}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    currentMode === 'SUBTEST_ANALYSIS'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  7 Subtes
                </button>
              </div>
            </div>

            {/* 2. Preset Filter Buttons */}
            <div className="space-y-2 pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Preset Filter Cepat
                </span>
                {activePreset === 'CUSTOM' && (
                  <span className="text-[10px] text-amber-400 font-bold">Kustom</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('ALL')}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer border ${
                    activePreset === 'ALL'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">🌟 Lengkap (Semua)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('TABLES_ONLY')}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer border ${
                    activePreset === 'TABLES_ONLY'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">📋 Hanya Tabel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('CHARTS_ONLY')}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer border ${
                    activePreset === 'CHARTS_ONLY'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <LineChartIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">📈 Hanya Grafik</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('ANALYSIS_ONLY')}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer border ${
                    activePreset === 'ANALYSIS_ONLY'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">🎯 Analisis & Target</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('EXECUTIVE_SUMMARY')}
                  className={`col-span-2 px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer border ${
                    activePreset === 'EXECUTIVE_SUMMARY'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">📑 Rapor Eksekutif Ringkas (1-2 Halaman)</span>
                </button>
              </div>
            </div>

            {/* 3. Granular Filter Toggles */}
            <div className="space-y-4 text-xs">
              
              {/* GROUP 1: HEADER & BIODATA SISWA */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    1. Header & Biodata
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showKopSurat', 'showStudentBiodata', 'showSummaryCards'], true)}
                      className="text-indigo-400 hover:underline cursor-pointer"
                    >
                      Semua
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showKopSurat', 'showStudentBiodata', 'showSummaryCards'], false)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showKopSurat}
                      onChange={() => handleToggleFilter('showKopSurat')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Kop Surat Resmi & Nomor SK</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showStudentBiodata}
                      onChange={() => handleToggleFilter('showStudentBiodata')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Biodata Siswa & Akun SNPMB</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showSummaryCards}
                      onChange={() => handleToggleFilter('showSummaryCards')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Kartu Metrik & Rata-Rata IRT</span>
                  </label>
                </div>
              </div>

              {/* GROUP 2: TABEL DATA & RIWAYAT */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <TableIcon className="w-3.5 h-3.5 text-blue-400" />
                    2. Tabel Data & Ujian
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showTryoutHistoryTable', 'showSubtestDiagnostikTable', 'showProdiSimulationTable'], true)}
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      Semua
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showTryoutHistoryTable', 'showSubtestDiagnostikTable', 'showProdiSimulationTable'], false)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showTryoutHistoryTable}
                      onChange={() => handleToggleFilter('showTryoutHistoryTable')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-white">Tabel Riwayat Tryout 1 s.d. 5</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showSubtestDiagnostikTable}
                      onChange={() => handleToggleFilter('showSubtestDiagnostikTable')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-white">Tabel Diagnostik 7 Subtes</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showProdiSimulationTable}
                      onChange={() => handleToggleFilter('showProdiSimulationTable')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-white">Tabel Simulasi 4 Prodi PTN</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-400">
                    <input
                      type="checkbox"
                      checked={filters.showClassRosterTable}
                      onChange={() => handleToggleFilter('showClassRosterTable')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Tabel Peringkat Roster Kelas</span>
                  </label>
                </div>
              </div>

              {/* GROUP 3: GRAFIK & VISUALISASI */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <LineChartIcon className="w-3.5 h-3.5 text-emerald-400" />
                    3. Grafik & Visualisasi
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showLineTrendChart', 'showRadarChart', 'showBarSubtestChart'], true)}
                      className="text-emerald-400 hover:underline cursor-pointer"
                    >
                      Semua
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showLineTrendChart', 'showRadarChart', 'showBarSubtestChart'], false)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showLineTrendChart}
                      onChange={() => handleToggleFilter('showLineTrendChart')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-white">Grafik Tren Skor IRT (TO 1-5)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showRadarChart}
                      onChange={() => handleToggleFilter('showRadarChart')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-white">Grafik Radar 7 Dimensi Subtes</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showBarSubtestChart}
                      onChange={() => handleToggleFilter('showBarSubtestChart')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-white">Grafik Batang Capaian vs Target</span>
                  </label>
                </div>
              </div>

              {/* GROUP 4: ANALISIS, EVALUASI & REKOMENDASI */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    4. Analisis & Evaluasi
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showSwotAnalysis', 'showTargetPtnAnalysis', 'showCounselorNotes', 'showActionPlan', 'showSignatures', 'showFooterDisclaimer'], true)}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Semua
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(['showSwotAnalysis', 'showTargetPtnAnalysis', 'showCounselorNotes', 'showActionPlan', 'showSignatures', 'showFooterDisclaimer'], false)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showSwotAnalysis}
                      onChange={() => handleToggleFilter('showSwotAnalysis')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Analisis Diagnostik Kekuatan/Kelemahan</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showTargetPtnAnalysis}
                      onChange={() => handleToggleFilter('showTargetPtnAnalysis')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Analisis Peluang Target PTN</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showCounselorNotes}
                      onChange={() => handleToggleFilter('showCounselorNotes')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Catatan Evaluasi Konselor</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showActionPlan}
                      onChange={() => handleToggleFilter('showActionPlan')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Action Plan 30 Hari UTBK</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showSignatures}
                      onChange={() => handleToggleFilter('showSignatures')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Kolom Tanda Tangan & Pengesahan</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters.showFooterDisclaimer}
                      onChange={() => handleToggleFilter('showFooterDisclaimer')}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Footer Verifikasi & Barcode IRT</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Quick Action Reset */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('ALL')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reset Semua Filter (Pilih Lengkap)</span>
              </button>
            </div>
          </aside>
        )}

        {/* ======================================================================= */}
        {/* PRINTABLE DOCUMENT (A4 SHEET LIVE PREVIEW) */}
        {/* ======================================================================= */}
        <main
          id="labschool-printable-document"
          className="flex-1 w-full bg-white text-slate-900 rounded-3xl shadow-2xl print:my-0 print:shadow-none print:rounded-none overflow-hidden print:w-full print:max-w-none border border-slate-200"
        >
          
          {/* 1. KOP SURAT RESMI */}
          {filters.showKopSurat && (
            <div className="p-6 sm:p-8 pb-2 print:p-4 print:pb-1">
              <OfficialKopSurat
                kopSettings={kopSettings}
                institution={institution}
                documentBadge="RAPOR EVALUASI RESMI UTBK-SNBT"
                documentId={`SNBT-EVAL-${currentStudent.nis}`}
              />
            </div>
          )}

          {/* DOCUMENT BODY */}
          <div className="p-6 sm:p-8 pt-3 space-y-6 text-xs print:p-4 print:space-y-4">
            
            {/* DOCUMENT TITLE BANNER */}
            <div className="text-center pb-2 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
                {currentMode === 'STUDENT_REPORT' && 'LAPORAN HASIL EVALUASI TRYOUT & ANALISIS IRT KELAS XII-UTBK'}
                {currentMode === 'CLASS_ROSTER' && 'REKAPITULASI PERINGKAT & PRESTASI KELAS XII-UTBK TAHUN 2026'}
                {currentMode === 'SUBTEST_ANALYSIS' && 'ANALISIS PENGUASAAN 7 SUBTES UTBK-SNBT (STANDAR BPPP)'}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Periode Pembinaan Intensif Menuju UTBK Gelombang 1 & 2 • {tryoutTitle}
              </p>
            </div>

            {/* =================================================================== */}
            {/* SECTION 1: BIODATA SISWA & SUMMARY METRICS */}
            {/* =================================================================== */}
            {currentMode === 'STUDENT_REPORT' && filters.showStudentBiodata && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-slate-50 print-avoid-break">
                <div className="space-y-1.5">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Nama Lengkap</span>
                    <span className="font-bold text-slate-900">: {currentStudent.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Nomor Induk Siswa</span>
                    <span className="font-mono font-bold text-slate-900">: {currentStudent.nis}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Kelas / Kelompok</span>
                    <span className="font-semibold text-slate-900">: {currentStudent.className} ({currentStudent.group})</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Asal Sekolah</span>
                    <span className="text-slate-900">: {currentStudent.schoolOrigin}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Akun SNPMB</span>
                    <span className="font-bold text-emerald-700">: {currentStudent.snpmbAccountStatus}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Skor Rata-Rata</span>
                    <span className="font-mono font-black text-indigo-700 text-sm">: {currentStudent.avgTryoutScore} / 1000 IRT</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Peringkat Kelas</span>
                    <span className="font-bold text-slate-900">: Ke-{studentRank} dari {allStudents.length} Siswa</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Tingkat Kesiapan</span>
                    <span className="font-bold text-indigo-900">: {currentStudent.readinessLevel.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* METRICS SUMMARY CARDS */}
            {filters.showSummaryCards && currentMode === 'STUDENT_REPORT' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print-avoid-break">
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-center">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Rata-Rata IRT</span>
                  <span className="text-xl font-black text-indigo-900 font-mono block">{currentStudent.avgTryoutScore}</span>
                  <span className="text-[10px] text-indigo-600 font-medium">5 Sesi Tryout</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Skor Tertinggi</span>
                  <span className="text-xl font-black text-amber-900 font-mono block">{currentStudent.highestTryoutScore}</span>
                  <span className="text-[10px] text-amber-600 font-medium">Rekor Ujian</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Peringkat Angkatan</span>
                  <span className="text-xl font-black text-emerald-900 font-mono block">
                    #{studentRank} <span className="text-xs font-normal text-slate-600">/ {allStudents.length}</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Top Performer</span>
                </div>

                <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 text-center">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">Pertumbuhan Skor</span>
                  <span className="text-xl font-black text-cyan-900 font-mono block">
                    +{totalGrowth} Poin
                  </span>
                  <span className="text-[10px] text-cyan-600 font-medium">Dari TO #1</span>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 2: TARGET PROGRAM STUDI & PELUANG PTN */}
            {/* =================================================================== */}
            {filters.showTargetPtnAnalysis && currentMode === 'STUDENT_REPORT' && (
              <div className="border border-slate-200 rounded-xl p-4 bg-white print-avoid-break">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-rose-600" />
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                    Target Program Studi & Peluang Kelulusan PTN 2026
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
                  {/* Target 1 */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800">
                        PILIHAN 1 (UTAMA)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ptn1Chance.color}`}>
                        {ptn1Chance.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{currentStudent.prodi1}</p>
                    <p className="text-[11px] text-slate-600 font-medium">{currentStudent.targetPtn1}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Passing Grade Est: <strong>{currentStudent.passingGrade1}</strong></span>
                      <span className="font-mono font-bold text-indigo-700">Selisih Skor: {ptn1Chance.diff}</span>
                    </div>
                  </div>

                  {/* Target 2 */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                        PILIHAN 2 (ALTERNATIF)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ptn2Chance.color}`}>
                        {ptn2Chance.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{currentStudent.prodi2}</p>
                    <p className="text-[11px] text-slate-600 font-medium">{currentStudent.targetPtn2}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Passing Grade Est: <strong>{currentStudent.passingGrade2}</strong></span>
                      <span className="font-mono font-bold text-blue-700">Selisih Skor: {ptn2Chance.diff}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 3: VISUALISASI GRAFIK & TREN (PRINTABLE RECHARTS) */}
            {/* =================================================================== */}
            {(filters.showLineTrendChart || filters.showRadarChart || filters.showBarSubtestChart) && currentMode === 'STUDENT_REPORT' && (
              <div className="space-y-4 print-avoid-break">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Chart 1: Line Progression Chart */}
                  {filters.showLineTrendChart && (
                    <div className={`${filters.showRadarChart ? 'md:col-span-7' : 'md:col-span-12'} p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                          Grafik Tren Skor IRT (TO-1 s.d. TO-5)
                        </h4>
                        <span className="text-[10px] text-slate-500">Target PTN 1: {currentStudent.passingGrade1}</span>
                      </div>

                      <div className="w-full h-56 print:h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="sessionName" stroke="#475569" tick={{ fontSize: 10, fontWeight: 700 }} />
                            <YAxis domain={[620, 800]} stroke="#475569" tick={{ fontSize: 9 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                            <Line
                              type="monotone"
                              dataKey="TOTAL"
                              name={`Skor ${currentStudent.name.split(' ')[0]}`}
                              stroke="#4f46e5"
                              strokeWidth={3}
                              dot={{ r: 4, fill: '#4f46e5' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="TargetPTN1"
                              name={`Target #1 (${currentStudent.passingGrade1})`}
                              stroke="#d97706"
                              strokeDasharray="4 4"
                              strokeWidth={2}
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
                    </div>
                  )}

                  {/* Chart 2: Radar Chart 7 Subtes */}
                  {filters.showRadarChart && (
                    <div className={`${filters.showLineTrendChart ? 'md:col-span-5' : 'md:col-span-12'} p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                          <PieChartIcon className="w-3.5 h-3.5 text-indigo-600" />
                          Radar 7 Dimensi Subtes
                        </h4>
                        <span className="text-[10px] text-slate-500">Peta Penguasaan</span>
                      </div>

                      <div className="w-full h-56 print:h-48 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarChartData} outerRadius="70%">
                            <PolarGrid stroke="#cbd5e1" />
                            <PolarAngleAxis dataKey="subtest" stroke="#334155" tick={{ fontSize: 9, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={30} domain={[550, 800]} stroke="#94a3b8" tick={{ fontSize: 8 }} />
                            <Radar
                              name="Rata-rata Kelas"
                              dataKey="RataRataKelas"
                              stroke="#0284c7"
                              fill="#0284c7"
                              fillOpacity={0.2}
                            />
                            <Radar
                              name={currentStudent.name.split(' ')[0]}
                              dataKey="Siswa"
                              stroke="#4f46e5"
                              fill="#4f46e5"
                              fillOpacity={0.45}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                </div>

                {/* Chart 3: Subtest Bar Chart */}
                {filters.showBarSubtestChart && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 print-avoid-break">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
                        Komparasi Nilai 7 Subtes Siswa vs Target Passing Score
                      </h4>
                      <span className="text-[10px] text-slate-500">Skor IRT Standar</span>
                    </div>

                    <div className="w-full h-48 print:h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subtestBarData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                          <XAxis dataKey="code" stroke="#475569" tick={{ fontSize: 10, fontWeight: 700 }} />
                          <YAxis domain={[500, 820]} stroke="#475569" tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                          <Bar dataKey="score" name={`Skor Siswa (${currentStudent.name.split(' ')[0]})`} fill="#4f46e5" radius={[4, 4, 0, 0]}>
                            {subtestBarData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.score >= entry.targetScore ? '#059669' : entry.score >= 700 ? '#4f46e5' : '#d97706'}
                              />
                            ))}
                          </Bar>
                          <Bar dataKey="targetScore" name="Target Skor Subtes" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 4: TABEL DATA LENGKAP */}
            {/* =================================================================== */}

            {/* TABEL 1: RIWAYAT 5 TRYOUT RESMI */}
            {filters.showTryoutHistoryTable && currentMode === 'STUDENT_REPORT' && (
              <div className="space-y-2 print-avoid-break">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    Tabel 1: Rekapitulasi Riwayat Tryout Siswa (TO-1 s.d. TO-5)
                  </h3>
                  <span className="text-[10px] text-slate-500">Skor IRT per Sesi</span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-700">
                        <th className="py-2 px-2.5 text-center">Sesi</th>
                        <th className="py-2 px-2.5">Nama Tryout</th>
                        <th className="py-2 px-1.5 text-center">PU</th>
                        <th className="py-2 px-1.5 text-center">PPU</th>
                        <th className="py-2 px-1.5 text-center">PBM</th>
                        <th className="py-2 px-1.5 text-center">PK</th>
                        <th className="py-2 px-1.5 text-center">LBI</th>
                        <th className="py-2 px-1.5 text-center">LBE</th>
                        <th className="py-2 px-1.5 text-center">PM</th>
                        <th className="py-2 px-2.5 text-center font-bold text-indigo-900 bg-indigo-50">Total IRT</th>
                        <th className="py-2 px-2 text-center">Peringkat</th>
                        <th className="py-2 px-2 text-center">Gap PTN 1</th>
                        <th className="py-2 px-2 text-center">Status</th>
                        <th className="py-2 px-2 text-center">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {fullTryoutSessions.map((session, idx) => {
                        const prev = idx > 0 ? fullTryoutSessions[idx - 1].totalScore : session.totalScore;
                        const delta = session.totalScore - prev;
                        const isPassed = session.totalScore >= currentStudent.passingGrade1;

                        return (
                          <tr key={session.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="py-2 px-2 text-center font-mono font-bold text-slate-700">TO #{session.sessionNum}</td>
                            <td className="py-2 px-2.5 font-semibold text-slate-900">
                              <div>{session.name}</div>
                              <div className="text-[9px] text-slate-500">{session.date}</div>
                            </td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.pu}</td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.ppu}</td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.pbm}</td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.pk}</td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.lbi}</td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.lbe}</td>
                            <td className="py-2 px-1.5 text-center font-mono">{session.subtests.pm}</td>
                            <td className="py-2 px-2.5 text-center font-mono font-black text-indigo-700 bg-indigo-50/70">
                              {session.totalScore}
                            </td>
                            <td className="py-2 px-2 text-center font-mono text-[11px]">#{session.rank}</td>
                            <td className="py-2 px-2 text-center font-mono font-bold">
                              <span className={session.gap1 >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                {session.gap1 >= 0 ? `+${session.gap1}` : session.gap1}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                isPassed ? 'bg-emerald-100 text-emerald-800' : session.gap1 >= -20 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isPassed ? 'AMAN' : session.gap1 >= -20 ? 'KOMPETITIF' : 'DRILL'}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-[10px]">
                              {idx === 0 ? (
                                <span className="text-slate-400">Base</span>
                              ) : delta > 0 ? (
                                <span className="text-emerald-700">+{delta}</span>
                              ) : delta < 0 ? (
                                <span className="text-rose-700">{delta}</span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABEL 2: RINCIAN DIAGNOSTIK 7 SUBTES */}
            {filters.showSubtestDiagnostikTable && currentMode === 'STUDENT_REPORT' && (
              <div className="space-y-2 print-avoid-break">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Tabel 2: Rincian Diagnostik 7 Subtes UTBK-SNBT (Skala IRT 200 - 1000)
                  </h3>
                  <span className="text-[10px] text-slate-500">Standar BPPP SNPMB</span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-700">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Subtes UTBK</th>
                        <th className="py-2.5 px-3">Rumpun</th>
                        <th className="py-2.5 px-3 text-center">Benar / Soal</th>
                        <th className="py-2.5 px-3 text-center">Akurasi</th>
                        <th className="py-2.5 px-3 text-center">Target</th>
                        <th className="py-2.5 px-3 text-center font-bold text-indigo-900">Skor IRT</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {currentStudent.subtestScores.map((sub, idx) => {
                        const isAboveTarget = sub.score >= sub.targetScore;
                        return (
                          <tr key={sub.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold font-mono text-indigo-700">{sub.code}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{sub.name}</td>
                            <td className="py-2 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSubtestCategoryColor(sub.category)}`}>
                                {sub.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-700">
                              {sub.correct} / {sub.totalQuestions}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                              {sub.accuracy.toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-500">{sub.targetScore}</td>
                            <td className="py-2 px-3 text-center font-mono font-black text-indigo-700 text-sm">
                              {sub.score}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  isAboveTarget
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isAboveTarget ? 'TUNTAS' : 'DRILL LAGI'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-100/90 font-black border-t-2 border-slate-300">
                        <td colSpan={7} className="py-2.5 px-3 text-right text-slate-800 uppercase tracking-wide">
                          Rata-Rata Skor Keseluruhan:
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-sm text-indigo-900">
                          {currentStudent.avgTryoutScore}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                          {currentStudent.avgTryoutScore >= 700 ? 'KOMPETITIF TINGGI' : 'SIAP OPTIMALISASI'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABEL 3: SIMULASI 4 PILIHAN PRODI PTN */}
            {filters.showProdiSimulationTable && currentMode === 'STUDENT_REPORT' && (
              <div className="space-y-2 print-avoid-break">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Tabel 3: Simulasi Kelulusan 4 Pilihan Program Studi PTN 2026
                  </h3>
                  <span className="text-[10px] text-slate-500">Skema 4 Pilihan SNPMB</span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-700">
                        <th className="py-2.5 px-3">Pilihan</th>
                        <th className="py-2.5 px-3">Perguruan Tinggi Negeri (PTN)</th>
                        <th className="py-2.5 px-3">Program Studi</th>
                        <th className="py-2.5 px-3 text-center">Passing Grade</th>
                        <th className="py-2.5 px-3 text-center">Skor Siswa</th>
                        <th className="py-2.5 px-3 text-center">Gap Nilai</th>
                        <th className="py-2.5 px-3 text-center">Estimasi Peluang</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {fourProdiSimulations.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="py-2 px-3 font-bold text-slate-800">{item.pilihan}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.ptn}</td>
                          <td className="py-2 px-3 text-slate-700">{item.prodi}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600">{item.passingGrade}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-indigo-700">{item.currentScore}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            <span className={item.gap >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                              {item.gap >= 0 ? `+${item.gap}` : item.gap}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-slate-800">{item.chance}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABEL ROSTER KELAS (IF ENABLED OR CLASS ROSTER MODE) */}
            {(filters.showClassRosterTable || currentMode === 'CLASS_ROSTER') && (
              <div className="space-y-2 print-avoid-break">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Daftar Rekapitulasi Prestasi & Peringkat Angkatan Kelas XII
                  </h3>
                  <span className="text-[10px] text-slate-500">Urut Berdasarkan Rata-Rata IRT</span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-700">
                        <th className="py-2 px-2.5 text-center">Rank</th>
                        <th className="py-2 px-2.5">NIS</th>
                        <th className="py-2 px-3">Nama Siswa</th>
                        <th className="py-2 px-2.5">Kelompok</th>
                        <th className="py-2 px-3">Target PTN 1</th>
                        <th className="py-2 px-2 text-center">PU</th>
                        <th className="py-2 px-2 text-center">PK</th>
                        <th className="py-2 px-2 text-center">PM</th>
                        <th className="py-2 px-2.5 text-center font-bold text-indigo-900">Rata-Rata</th>
                        <th className="py-2 px-2 text-center">Peluang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {sortedStudents.map((std, idx) => {
                        const pu = std.subtestScores.find(s => s.code === 'PU')?.score || 0;
                        const pk = std.subtestScores.find(s => s.code === 'PK')?.score || 0;
                        const pm = std.subtestScores.find(s => s.code === 'PM')?.score || 0;
                        const chance = calculatePtnChance(std.avgTryoutScore, std.passingGrade1);
                        const isCurrent = std.id === currentStudent.id;

                        return (
                          <tr key={std.id} className={isCurrent ? 'bg-indigo-50 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="py-2 px-2.5 text-center font-mono font-bold text-indigo-700">#{idx + 1}</td>
                            <td className="py-2 px-2.5 font-mono text-slate-600">{std.nis}</td>
                            <td className="py-2 px-3 text-slate-900">{std.name}</td>
                            <td className="py-2 px-2.5 text-slate-600 text-[10px]">{std.group.replace(' (UTBK)', '')}</td>
                            <td className="py-2 px-3 text-slate-800 text-[11px]">
                              <div className="font-semibold">{std.prodi1}</div>
                              <div className="text-[9px] text-slate-500">{std.targetPtn1}</div>
                            </td>
                            <td className="py-2 px-2 text-center font-mono text-slate-700">{pu}</td>
                            <td className="py-2 px-2 text-center font-mono text-slate-700">{pk}</td>
                            <td className="py-2 px-2 text-center font-mono text-slate-700">{pm}</td>
                            <td className="py-2 px-2.5 text-center font-mono font-black text-indigo-700">
                              {std.avgTryoutScore}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${chance.color}`}>
                                {chance.diff}
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

            {/* =================================================================== */}
            {/* SECTION 5: ANALISIS DIAGNOSTIK, EVALUASI & ACTION PLAN */}
            {/* =================================================================== */}

            {/* SWOT SUBTEST ANALYSIS */}
            {filters.showSwotAnalysis && currentMode === 'STUDENT_REPORT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print-avoid-break">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Subtes Unggulan / Kekuatan Utama Siswa</span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    Siswa menunjukkan penguasaan sangat prima pada subtes{' '}
                    <strong>{subtestPerformance.strongest?.name} ({subtestPerformance.strongest?.score} IRT)</strong> dengan tingkat akurasi{' '}
                    <strong>{subtestPerformance.strongest?.accuracy.toFixed(1)}%</strong>. Nilai ini menjadi modal poin utama untuk mendongkrak skor gabungan UTBK.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Subtes Prioritas Peningkatan (Fokus Drill)</span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    Perlu akselerasi pemahaman konsep dan drill soal bertahap pada subtes{' '}
                    <strong>{subtestPerformance.weakest?.name} ({subtestPerformance.weakest?.score} IRT)</strong>. Kenaikan 15-20 poin pada subtes ini akan mengamankan pilihan 1.
                  </p>
                </div>
              </div>
            )}

            {/* ACTION PLAN 30 HARI */}
            {filters.showActionPlan && currentMode === 'STUDENT_REPORT' && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2 print-avoid-break">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Rekomendasi Rencana Aksi 30 Hari Menuju UTBK-SNBT 2026</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-800">
                  <div className="p-2 rounded-lg bg-white border border-indigo-100">
                    <p className="font-bold text-indigo-700">Minggu 1-2: Penguatan Konsep</p>
                    <p className="text-slate-600 mt-0.5">Fokus penutupan materi pada {subtestPerformance.weakest?.name} dan latihan 30 soal per hari.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-indigo-100">
                    <p className="font-bold text-indigo-700">Minggu 3: Speed & Accuracy</p>
                    <p className="text-slate-600 mt-0.5">Latihan manajemen waktu (1 menit per butir soal) dan simulasi ujian tanpa bantuan alat.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-indigo-100">
                    <p className="font-bold text-indigo-700">Minggu 4: Final Marathon</p>
                    <p className="text-slate-600 mt-0.5">Tryout prediksi nasional intensif, evaluasi error log, serta conditioning mental & stamina.</p>
                  </div>
                </div>
              </div>
            )}

            {/* COUNSELOR EVALUATION NOTES */}
            {filters.showCounselorNotes && currentMode === 'STUDENT_REPORT' && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80 space-y-1.5 print-avoid-break">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Catatan Evaluasi & Rekomendasi Konselor Bimbingan Belajar
                </h3>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {currentStudent.counselorNotes || 'Siswa menunjukkan konsistensi belajar yang sangat baik pada subtes Penalaran Umum dan Literasi. Disarankan untuk memperbanyak simulasi soal Penalaran Matematika dan mengunci pilihan 1 dan 2 sebelum masa pendaftaran UTBK.'}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Telah ditinjau dan divalidasi oleh Tim Akademik & Konseling UTBK BrainSpace Center.</span>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 6: PENGESAHAN TANDA TANGAN RESMI */}
            {/* =================================================================== */}
            {filters.showSignatures && (
              <div className="pt-6 border-t border-slate-300 print-avoid-break">
                <div className="flex justify-between items-start text-center">
                  <div className="space-y-12">
                    <p className="text-slate-600 font-medium">
                      Mengetahui,<br />
                      <strong>Kepala Program Bimbingan UTBK</strong>
                    </p>
                    <div>
                      <p className="font-bold text-slate-900 underline">Dr. Hendra Wijaya, M.Pd.</p>
                      <p className="text-[10px] text-slate-500">NIP. 19800512 200501 1 003</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <p className="text-slate-600 font-medium">
                      Jakarta, {currentDateFormatted}<br />
                      <strong>Wali Kelas & Konselor Akademik</strong>
                    </p>
                    <div>
                      <p className="font-bold text-slate-900 underline">Siti Nurhaliza, S.Psi., M.A.</p>
                      <p className="text-[10px] text-slate-500">Koordinator Bimbingan Karir SNBT</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 7: FOOTER & LEGAL DISCLAIMER */}
            {/* =================================================================== */}
            {filters.showFooterDisclaimer && (
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 print-avoid-break">
                <div className="flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dokumen Resmi Terverifikasi Sistem Evaluasi IRT BrainSpace Academy</span>
                </div>
                <div className="font-mono">
                  Dicetak pada: {currentDateFormatted} • SNBT-{currentStudent.nis}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};
