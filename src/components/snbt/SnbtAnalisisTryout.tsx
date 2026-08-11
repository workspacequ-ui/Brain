import React, { useState, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SnbtStudentProfile,
  SNBT_SUBTEST_LIST,
  SnbtTryoutHistory
} from './snbtData';
import {
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  BrainCircuit,
  Target,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  HelpCircle,
  Sparkles,
  Eye,
  SlidersHorizontal,
  GraduationCap,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  AlertCircle,
  BookOpen,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Cell
} from 'recharts';

interface SnbtAnalisisTryoutProps {
  user: User;
  students: SnbtStudentProfile[];
  selectedStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  onSelectStudentForEval?: (studentId: string) => void;
  onOpenPrint?: (mode: 'STUDENT_REPORT' | 'CLASS_ROSTER' | 'SUBTEST_ANALYSIS') => void;
  onExportCsv?: () => void;
  onNavigateTab?: (tab: SidebarTab) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export type ViewTabMode = 'ALL_IN_ONE' | 'TABLE_SUBTESTS' | 'MATRIX_MULTI_TO' | 'CHARTS_ANALYTICS';

export const SnbtAnalisisTryout: React.FC<SnbtAnalisisTryoutProps> = ({
  user,
  students,
  selectedStudentId,
  onSelectStudent,
  onSelectStudentForEval,
  onOpenPrint,
  onExportCsv,
  onNavigateTab,
  onShowToast
}) => {
  const isStudent = user?.role === 'student';
  const [selectedTryoutId, setSelectedTryoutId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedPassingStatusFilter, setSelectedPassingStatusFilter] = useState<string>('ALL');
  const [onlyShowActiveStudent, setOnlyShowActiveStudent] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'SCORE_ASC' | 'GROWTH_DESC' | 'NAME_ASC' | 'PU_DESC' | 'PK_DESC' | 'PM_DESC'>('SCORE_DESC');
  const [viewTabMode, setViewTabMode] = useState<ViewTabMode>('ALL_IN_ONE');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [selectedStudentForChart, setSelectedStudentForChart] = useState<string>(selectedStudentId || students[0]?.id || 'snbt-std-01');

  // Synchronize internal chart student with external selectedStudentId
  React.useEffect(() => {
    if (selectedStudentId) {
      setSelectedStudentForChart(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleSelectStudentInternal = (id: string) => {
    setSelectedStudentForChart(id);
    if (onSelectStudent) {
      onSelectStudent(id);
    }
  };

  // Filter visibility for Multi-Tryout Line Chart
  const [activeSubtestLines, setActiveSubtestLines] = useState<{ [key: string]: boolean }>({
    TOTAL: true,
    PU: true,
    PPU: false,
    PBM: false,
    PK: true,
    LBI: true,
    LBE: false,
    PM: true
  });

  const tryoutSessions = [
    {
      id: 'all',
      code: 'SEMUA',
      name: 'Semua Tryout (Agregat & Komparasi Multi-Tryout)',
      shortName: 'Agregat Semua TO',
      date: 'Januari - Maret 2026',
      totalParticipants: 6500,
      avgScore: 721,
      highestScore: 768,
      badge: 'AGREGAT LENGKAP',
      desc: 'Nilai rata-rata kumulatif dan progres dari TO 1 hingga TO 5'
    },
    {
      id: 'to-01',
      code: 'TO #1',
      name: 'Tryout Akbar SNBT Nasional #1 (Diagnostik & Baseline)',
      shortName: 'TO #1 Diagnostik',
      date: '10 Januari 2026',
      totalParticipants: 4200,
      avgScore: 685,
      highestScore: 738,
      badge: 'DIAGNOSTIK BASELINE',
      desc: 'Pemetaan awal profil kekuatan & kelemahan materi'
    },
    {
      id: 'to-02',
      code: 'TO #2',
      name: 'Tryout Akbar SNBT Nasional #2 (TPS & Skolastik)',
      shortName: 'TO #2 Skolastik',
      date: '24 Januari 2026',
      totalParticipants: 5100,
      avgScore: 712,
      highestScore: 752,
      badge: 'PENDALAMAN TPS',
      desc: 'Pendalaman penalaran kuantitatif dan logika membaca'
    },
    {
      id: 'to-03',
      code: 'TO #3',
      name: 'Tryout Intensif IRT BrainSpace #3 (Simulasi SNPMB)',
      shortName: 'TO #3 Simulasi IRT',
      date: '05 Februari 2026',
      totalParticipants: 6200,
      avgScore: 728,
      highestScore: 768,
      badge: 'STANDAR RESMI IRT',
      desc: 'Algoritma bobot IRT 3 parameter (Daya pembeda, kesulitan, tebakan)'
    },
    {
      id: 'to-04',
      code: 'TO #4',
      name: 'Tryout Prediksi Super Intensif #4 (HOTS Tinggi)',
      shortName: 'TO #4 Prediksi HOTS',
      date: '20 Februari 2026',
      totalParticipants: 5800,
      avgScore: 734,
      highestScore: 775,
      badge: 'PREDIKSI AKURAT',
      desc: 'Uji daya saing ketat passing grade prodi klaster 1'
    },
    {
      id: 'to-05',
      code: 'TO #5',
      name: 'Tryout Final Marathon UTBK 2026 #5 (Simulasi Akhir)',
      shortName: 'TO #5 Final Sprint',
      date: '08 Maret 2026',
      totalParticipants: 6500,
      avgScore: 742,
      highestScore: 785,
      badge: 'SIMULASI AKHIR',
      desc: 'Pemantapan batas akhir kesiapan UTBK Gelombang 1 & 2'
    }
  ];

  const currentSession = useMemo(() => {
    return tryoutSessions.find(t => t.id === selectedTryoutId) || tryoutSessions[0];
  }, [selectedTryoutId]);

  // Helper to extract student scores for the active session (or aggregate)
  const getStudentSessionData = (student: SnbtStudentProfile, tryoutId: string) => {
    if (tryoutId === 'all') {
      const getScore = (code: string) => student.subtestScores.find(s => s.code === code)?.score || 0;
      const pu = getScore('PU');
      const ppu = getScore('PPU');
      const pbm = getScore('PBM');
      const pk = getScore('PK');
      const lbi = getScore('LBI');
      const lbe = getScore('LBE');
      const pm = getScore('PM');
      const total = student.avgTryoutScore;
      const isPassed = total >= student.passingGrade1;
      const gap = total - student.passingGrade1;

      // Compute growth from first tryout to last tryout
      const firstScore = student.tryoutHistory && student.tryoutHistory.length > 0 ? student.tryoutHistory[0].totalScore : total;
      const lastScore = student.tryoutHistory && student.tryoutHistory.length > 0 ? student.tryoutHistory[student.tryoutHistory.length - 1].totalScore : total;
      const growth = lastScore - firstScore;

      return {
        pu, ppu, pbm, pk, lbi, lbe, pm,
        total,
        rank: 0, // will be ranked in list
        isPassed,
        gap,
        growth,
        passingStatus: isPassed ? 'AMAN' : gap >= -20 ? 'KOMPETITIF' : 'PERLU_DITINGKATKAN'
      };
    } else {
      const history = student.tryoutHistory?.find(t => t.id === tryoutId);
      if (history) {
        const isPassed = history.totalScore >= student.passingGrade1;
        const gap = history.totalScore - student.passingGrade1;

        // Find previous tryout for immediate delta
        const currentIndex = student.tryoutHistory.findIndex(t => t.id === tryoutId);
        const prevScore = currentIndex > 0 ? student.tryoutHistory[currentIndex - 1].totalScore : history.totalScore;
        const growth = history.totalScore - prevScore;

        return {
          pu: history.subtests.pu,
          ppu: history.subtests.ppu,
          pbm: history.subtests.pbm,
          pk: history.subtests.pk,
          lbi: history.subtests.lbi,
          lbe: history.subtests.lbe,
          pm: history.subtests.pm,
          total: history.totalScore,
          rank: history.rank,
          isPassed,
          gap,
          growth,
          passingStatus: history.passingStatus
        };
      }
      // Fallback
      return {
        pu: 0, ppu: 0, pbm: 0, pk: 0, lbi: 0, lbe: 0, pm: 0,
        total: 0,
        rank: 999,
        isPassed: false,
        gap: -100,
        growth: 0,
        passingStatus: 'PERLU_DITINGKATKAN'
      };
    }
  };

  // Filtered & Sorted Student List for the table
  const processedStudents = useMemo(() => {
    return students
      .map(student => {
        const sessionData = getStudentSessionData(student, selectedTryoutId);
        return {
          ...student,
          sessionData
        };
      })
      .filter(item => {
        const matchSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nis.includes(searchQuery) ||
          item.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.targetPtn1.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.prodi1.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.group.toLowerCase().includes(searchQuery.toLowerCase());

        const matchGroup = selectedGroupFilter === 'ALL' || item.group.includes(selectedGroupFilter);

        const matchActiveStudent = !onlyShowActiveStudent || item.id === selectedStudentForChart;

        let matchStatus = true;
        if (selectedPassingStatusFilter === 'LOLOS') {
          matchStatus = item.sessionData.isPassed;
        } else if (selectedPassingStatusFilter === 'KOMPETITIF') {
          matchStatus = !item.sessionData.isPassed && item.sessionData.gap >= -25;
        } else if (selectedPassingStatusFilter === 'BELUM') {
          matchStatus = !item.sessionData.isPassed && item.sessionData.gap < -25;
        }

        return matchSearch && matchGroup && matchStatus && matchActiveStudent;
      })
      .sort((a, b) => {
        if (sortBy === 'SCORE_DESC') return b.sessionData.total - a.sessionData.total;
        if (sortBy === 'SCORE_ASC') return a.sessionData.total - b.sessionData.total;
        if (sortBy === 'GROWTH_DESC') return b.sessionData.growth - a.sessionData.growth;
        if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortBy === 'PU_DESC') return b.sessionData.pu - a.sessionData.pu;
        if (sortBy === 'PK_DESC') return b.sessionData.pk - a.sessionData.pk;
        if (sortBy === 'PM_DESC') return b.sessionData.pm - a.sessionData.pm;
        return b.sessionData.total - a.sessionData.total;
      });
  }, [students, selectedTryoutId, searchQuery, selectedGroupFilter, selectedPassingStatusFilter, onlyShowActiveStudent, selectedStudentForChart, sortBy]);

  // Subtest metrics calculated for the selected session
  const subtestMetrics = useMemo(() => {
    const subtestKeys = [
      { code: 'PU', name: 'Penalaran Umum', category: 'TPS', maxTarget: 750, color: '#3b82f6', bg: 'bg-blue-500/20', text: 'text-blue-400' },
      { code: 'PPU', name: 'Pengetahuan Umum', category: 'TPS', maxTarget: 730, color: '#06b6d4', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
      { code: 'PBM', name: 'Pemahaman Menulis', category: 'TPS', maxTarget: 740, color: '#f59e0b', bg: 'bg-amber-500/20', text: 'text-amber-400' },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', maxTarget: 770, color: '#ef4444', bg: 'bg-rose-500/20', text: 'text-rose-400' },
      { code: 'LBI', name: 'Literasi B. Indonesia', category: 'Literasi', maxTarget: 750, color: '#10b981', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
      { code: 'LBE', name: 'Literasi B. Inggris', category: 'Literasi', maxTarget: 740, color: '#8b5cf6', bg: 'bg-purple-500/20', text: 'text-purple-400' },
      { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', maxTarget: 750, color: '#d946ef', bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400' }
    ];

    return subtestKeys.map(sub => {
      const scores = students.map(std => {
        const data = getStudentSessionData(std, selectedTryoutId);
        if (sub.code === 'PU') return data.pu;
        if (sub.code === 'PPU') return data.ppu;
        if (sub.code === 'PBM') return data.pbm;
        if (sub.code === 'PK') return data.pk;
        if (sub.code === 'LBI') return data.lbi;
        if (sub.code === 'LBE') return data.lbe;
        if (sub.code === 'PM') return data.pm;
        return 0;
      });

      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const highest = scores.length ? Math.max(...scores) : 0;
      const lowest = scores.length ? Math.min(...scores) : 0;

      return {
        ...sub,
        avgScore: avg,
        highestScore: highest,
        lowestScore: lowest,
        passingStandard: sub.maxTarget,
        accuracy: Math.round((avg / 800) * 100)
      };
    });
  }, [students, selectedTryoutId]);

  // Data for Radar Chart (7 Subtests Radar)
  const radarChartData = useMemo(() => {
    const selectedStd = students.find(s => s.id === selectedStudentForChart) || students[0];
    const stdData = selectedStd ? getStudentSessionData(selectedStd, selectedTryoutId) : null;

    return subtestMetrics.map(sub => {
      let studentVal = 0;
      if (stdData) {
        if (sub.code === 'PU') studentVal = stdData.pu;
        if (sub.code === 'PPU') studentVal = stdData.ppu;
        if (sub.code === 'PBM') studentVal = stdData.pbm;
        if (sub.code === 'PK') studentVal = stdData.pk;
        if (sub.code === 'LBI') studentVal = stdData.lbi;
        if (sub.code === 'LBE') studentVal = stdData.lbe;
        if (sub.code === 'PM') studentVal = stdData.pm;
      }

      return {
        subtest: sub.code,
        fullName: sub.name,
        'Rata-rata Kelas': sub.avgScore,
        'Nilai Tertinggi': sub.highestScore,
        'Target Passing Grade': 720,
        [selectedStd ? selectedStd.name.split(' ')[0] : 'Siswa Terpilih']: studentVal
      };
    });
  }, [subtestMetrics, students, selectedStudentForChart, selectedTryoutId]);

  // Data for Multi-Tryout Trend Line Chart (TO 1 to TO 5)
  const multiTryoutTrendData = useMemo(() => {
    const toKeys = ['to-01', 'to-02', 'to-03', 'to-04', 'to-05'];
    const toLabels: { [k: string]: string } = {
      'to-01': 'TO 1 (Diagnostik)',
      'to-02': 'TO 2 (TPS)',
      'to-03': 'TO 3 (Simulasi IRT)',
      'to-04': 'TO 4 (Prediksi HOTS)',
      'to-05': 'TO 5 (Final Sprint)'
    };

    return toKeys.map(toId => {
      const toScores = students.map(std => {
        const h = std.tryoutHistory?.find(t => t.id === toId);
        return h ? h : null;
      }).filter(Boolean) as SnbtTryoutHistory[];

      const count = toScores.length || 1;
      const avgTotal = Math.round(toScores.reduce((a, b) => a + b.totalScore, 0) / count);
      const avgPU = Math.round(toScores.reduce((a, b) => a + b.subtests.pu, 0) / count);
      const avgPPU = Math.round(toScores.reduce((a, b) => a + b.subtests.ppu, 0) / count);
      const avgPBM = Math.round(toScores.reduce((a, b) => a + b.subtests.pbm, 0) / count);
      const avgPK = Math.round(toScores.reduce((a, b) => a + b.subtests.pk, 0) / count);
      const avgLBI = Math.round(toScores.reduce((a, b) => a + b.subtests.lbi, 0) / count);
      const avgLBE = Math.round(toScores.reduce((a, b) => a + b.subtests.lbe, 0) / count);
      const avgPM = Math.round(toScores.reduce((a, b) => a + b.subtests.pm, 0) / count);

      return {
        sessionName: toLabels[toId],
        shortName: toId.toUpperCase(),
        TOTAL: avgTotal,
        PU: avgPU,
        PPU: avgPPU,
        PBM: avgPBM,
        PK: avgPK,
        LBI: avgLBI,
        LBE: avgLBE,
        PM: avgPM,
        TargetUI: 735
      };
    });
  }, [students]);

  // Data for Score Distribution Bar Chart
  const scoreDistributionData = useMemo(() => {
    let under680 = 0;
    let range680to710 = 0;
    let range710to740 = 0;
    let over740 = 0;

    students.forEach(std => {
      const data = getStudentSessionData(std, selectedTryoutId);
      if (data.total < 680) under680++;
      else if (data.total < 710) range680to710++;
      else if (data.total <= 740) range710to740++;
      else over740++;
    });

    return [
      { range: '< 680 (Perlu Drill)', jumlah: under680, label: 'Drill Dasar', fill: '#f43f5e' },
      { range: '680 - 709 (Kompetitif PTN 2)', jumlah: range680to710, label: 'Klaster 2', fill: '#f59e0b' },
      { range: '710 - 739 (Aman Klaster 1)', jumlah: range710to740, label: 'Klaster 1', fill: '#3b82f6' },
      { range: '≥ 740 (Top Tier UI/ITB)', jumlah: over740, label: 'Top Tier 1%', fill: '#10b981' }
    ];
  }, [students, selectedTryoutId]);

  // Active student object for deep-dive chart
  const activeChartStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentForChart) || students[0];
  }, [students, selectedStudentForChart]);

  // Subtest where the active chart student has highest score
  const bestSubtestForActiveStudent = useMemo(() => {
    if (!activeChartStudent || !subtestMetrics.length) return 'Penalaran Umum';
    const stdData = getStudentSessionData(activeChartStudent, selectedTryoutId);
    const sorted = [...subtestMetrics].sort((a, b) => {
      const aVal = (stdData[a.code.toLowerCase() as keyof ReturnType<typeof getStudentSessionData>] as number) || 0;
      const bVal = (stdData[b.code.toLowerCase() as keyof ReturnType<typeof getStudentSessionData>] as number) || 0;
      return bVal - aVal;
    });
    return sorted[0]?.name || 'Penalaran Umum';
  }, [activeChartStudent, subtestMetrics, selectedTryoutId]);

  // Student specific 5-Tryout history data for the individual chart
  const studentHistoricalChartData = useMemo(() => {
    if (!activeChartStudent?.tryoutHistory) return [];
    return activeChartStudent.tryoutHistory.map((h, idx) => ({
      name: `TO #${idx + 1}`,
      tryoutName: h.tryoutName.replace(' (UTBK)', ''),
      SkorTotal: h.totalScore,
      PU: h.subtests.pu,
      PK: h.subtests.pk,
      PM: h.subtests.pm,
      LBI: h.subtests.lbi,
      LBE: h.subtests.lbe,
      PassingGrade: activeChartStudent.passingGrade1
    }));
  }, [activeChartStudent]);

  // Export full table to CSV
  const handleExportFullCsv = () => {
    if (onExportCsv) {
      onExportCsv();
    } else {
      try {
        const headers = [
          'Rank', 'NIS', 'Nama Siswa', 'Kelompok', 'Asal Sekolah', 'Target PTN 1', 'Prodi 1', 'Passing Grade',
          'Sesi Tryout', 'Skor Total IRT', 'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM',
          'TO 1', 'TO 2', 'TO 3', 'TO 4', 'TO 5', 'Status Kelulusan'
        ];

        const rows = processedStudents.map((std, idx) => {
          const to1 = std.tryoutHistory?.find(t => t.id === 'to-01')?.totalScore || '-';
          const to2 = std.tryoutHistory?.find(t => t.id === 'to-02')?.totalScore || '-';
          const to3 = std.tryoutHistory?.find(t => t.id === 'to-03')?.totalScore || '-';
          const to4 = std.tryoutHistory?.find(t => t.id === 'to-04')?.totalScore || '-';
          const to5 = std.tryoutHistory?.find(t => t.id === 'to-05')?.totalScore || '-';

          return [
            idx + 1,
            `"${std.nis}"`,
            `"${std.name}"`,
            `"${std.group}"`,
            `"${std.schoolOrigin}"`,
            `"${std.targetPtn1}"`,
            `"${std.prodi1}"`,
            std.passingGrade1,
            `"${currentSession.name}"`,
            std.sessionData.total,
            std.sessionData.pu,
            std.sessionData.ppu,
            std.sessionData.pbm,
            std.sessionData.pk,
            std.sessionData.lbi,
            std.sessionData.lbe,
            std.sessionData.pm,
            to1, to2, to3, to4, to5,
            std.sessionData.isPassed ? 'Lolos Passing Grade' : 'Kompetitif'
          ];
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Hasil_Tryout_SNBT_7Subtes_${selectedTryoutId}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (onShowToast) onShowToast('Export data hasil tryout 7 subtes berhasil!', 'success');
      } catch {
        if (onShowToast) onShowToast('Gagal mengexport file CSV', 'error');
      }
    }
  };

  const toggleSubtestLine = (subKey: string) => {
    setActiveSubtestLines(prev => ({
      ...prev,
      [subKey]: !prev[subKey]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="snbt-analisis-tryout-section">
      {/* Top Header Card & Session Picker */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                ANALISIS TRYOUT & 7 SUBTES RESMI
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Sistem Penilaian Item Response Theory (IRT) SNPMB 2026/2027
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{currentSession.name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pelaksanaan: <strong className="text-slate-200">{currentSession.date}</strong> • Total Peserta Ujian: <strong className="text-indigo-300 font-mono">{currentSession.totalParticipants.toLocaleString('id-ID')} Siswa</strong>
            </p>
          </div>

          {/* Sesi Dropdown & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 text-xs font-bold pl-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Pilih Sesi:
              </span>
              <select
                value={selectedTryoutId}
                onChange={(e) => {
                  setSelectedTryoutId(e.target.value);
                  if (onShowToast) onShowToast(`Menampilkan data ${e.target.options[e.target.selectedIndex].text}`, 'info');
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[260px] sm:max-w-none"
              >
                {tryoutSessions.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.code}: {t.name}
                  </option>
                ))}
              </select>
            </div>

            {onOpenPrint && !isStudent && (
              <button
                type="button"
                onClick={() => onOpenPrint('CLASS_ROSTER')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Cetak Roster Lengkap Tryout"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Roster</span>
              </button>
            )}

            {!isStudent && (
              <button
                type="button"
                onClick={handleExportFullCsv}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Export Hasil 7 Subtest ke Excel/CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Rata-Rata Skor Sesi</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
              {currentSession.id === 'all'
                ? Math.round(students.reduce((a, b) => a + b.avgTryoutScore, 0) / (students.length || 1))
                : currentSession.avgScore}
              <span className="text-xs font-normal text-slate-500 ml-1">/ 1000</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Standar Algoritma IRT SNPMB
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Skor Tertinggi Siswa</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {currentSession.id === 'all'
                ? Math.max(...students.map(s => s.highestTryoutScore))
                : currentSession.highestScore}
              <span className="text-xs font-normal text-slate-500 ml-1">/ 1000</span>
            </div>
            <div className="text-[10px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Top 1% Nasional (Peluang Kedokteran/STEI)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Tingkat Kesiapan Lolos PTN #1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {Math.round(
                (students.filter(s => {
                  const data = getStudentSessionData(s, selectedTryoutId);
                  return data.isPassed;
                }).length / (students.length || 1)) * 100
              )}%
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold mt-1">
              {students.filter(s => getStudentSessionData(s, selectedTryoutId).isPassed).length} dari {students.length} Siswa Lolos Passing Grade
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Tingkat Kesulitan Soal (HOTS)</span>
              <Zap className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              Tinggi (HOTS)
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">
              Daya Pembeda Sesi: <strong className="text-slate-200">0.42 (Sangat Baik)</strong>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Tampilan:
          </span>

          <button
            type="button"
            onClick={() => setViewTabMode('ALL_IN_ONE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTabMode === 'ALL_IN_ONE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isStudent ? 'Tampilan Lengkap Grafik & Analisis' : 'Tampilan Lengkap (Grafik & Tabel)'}</span>
          </button>

          {!isStudent && (
            <>
              <button
                type="button"
                onClick={() => setViewTabMode('TABLE_SUBTESTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewTabMode === 'TABLE_SUBTESTS'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Tabel 7 Subtes per Sesi</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTabMode('MATRIX_MULTI_TO')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewTabMode === 'MATRIX_MULTI_TO'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Matriks Komparasi Multi-Tryout (TO 1 - 5)</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setViewTabMode('CHARTS_ANALYTICS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTabMode === 'CHARTS_ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Pusat Grafik & Radar IRT</span>
          </button>
        </div>
      </div>

      {/* Active Student Monitoring Spotlight Card */}
      {activeChartStudent && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={activeChartStudent.avatar}
                alt={activeChartStudent.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-400" />
                    SISWA AKTIF DIPANTAU
                  </span>
                  <span className="text-xs font-mono text-slate-400">NIS: {activeChartStudent.nis}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    {activeChartStudent.group.replace(' (UTBK)', '')} • {activeChartStudent.schoolOrigin}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  {activeChartStudent.name}
                </h2>

                <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>Target #1: <strong className="text-amber-300">{activeChartStudent.targetPtn1} - {activeChartStudent.prodi1}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Passing Grade: <strong className="text-white font-mono">{activeChartStudent.passingGrade1}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className={activeChartStudent.avgTryoutScore >= activeChartStudent.passingGrade1 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    Rerata IRT: {activeChartStudent.avgTryoutScore} ({activeChartStudent.avgTryoutScore >= activeChartStudent.passingGrade1 ? 'Lolos Target' : 'Kompetitif'})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Shortcuts for Monitored Student */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setOnlyShowActiveStudent(!onlyShowActiveStudent)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  onlyShowActiveStudent
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{onlyShowActiveStudent ? 'Tampilkan Semua Siswa' : 'Fokuskan Tabel ke Siswa Ini'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTabMode('CHARTS_ANALYTICS')}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PieChartIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Radar IRT</span>
              </button>

              {onSelectStudentForEval && (
                <button
                  type="button"
                  onClick={() => onSelectStudentForEval(activeChartStudent.id)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rapor Evaluasi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7 SUBTESTS OVERVIEW CARDS (Always visible or in charts/table mode) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              Capaian 7 Subtes UTBK pada Sesi {currentSession.shortName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rata-rata skor kelas, rekor nilai tertinggi, dan standar batas aman kelulusan prodi favorit.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30">4 TPS (PU, PPU, PBM, PK)</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">2 Literasi (LBI, LBE)</span>
            <span className="px-2.5 py-1 rounded-lg bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30">1 Penalaran MTK (PM)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {subtestMetrics.map(sub => (
            <div
              key={sub.code}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded border ${sub.bg} ${sub.text} border-current/30`}>
                  {sub.code}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Standar: {sub.passingStandard}</span>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs line-clamp-1" title={sub.name}>{sub.name}</h4>
                <span className="text-[10px] text-slate-400">{sub.category}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400">Rata-Rata:</span>
                  <span className={`font-mono font-black text-sm ${sub.text}`}>{sub.avgScore}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400">Tertinggi:</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">{sub.highestScore}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (sub.avgScore / 800) * 100)}%`,
                      backgroundColor: sub.color
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Akurasi: {sub.accuracy}%</span>
                  <span className={sub.avgScore >= sub.passingStandard ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {sub.avgScore >= sub.passingStandard ? 'Target Aman' : 'Perlu Drill'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: GRAFIK ANALISIS TERPADU */}
      {(viewTabMode === 'ALL_IN_ONE' || viewTabMode === 'CHARTS_ANALYTICS') && (
        <div className="space-y-6">
          {/* Charts Row 1: Radar Chart & Multi-Tryout Line Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Radar Chart 7 Subtest Analysis */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <PieChartIcon className="w-4 h-4 text-indigo-400" />
                    Radar Analisis 7 Subtes UTBK
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    7 DIMENSI
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Komparasi penguasaan materi 7 subtes: Rata-Rata Kelas vs Passing Grade PTN vs Siswa Terpilih.
                </p>
              </div>

              {/* Student Selector for Radar */}
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] font-bold pl-1">Pilih Siswa:</span>
                <select
                  value={selectedStudentForChart}
                  onChange={(e) => setSelectedStudentForChart(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer flex-1"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.targetPtn1} - {s.prodi1.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Radar Chart Component */}
              <div className="w-full h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData} outerRadius="75%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subtest" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[500, 800]} stroke="#475569" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Rata-rata Kelas"
                      dataKey="Rata-rata Kelas"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={activeChartStudent ? activeChartStudent.name.split(' ')[0] : 'Siswa'}
                      dataKey={activeChartStudent ? activeChartStudent.name.split(' ')[0] : 'Siswa'}
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Target PG (720)"
                      dataKey="Target Passing Grade"
                      stroke="#ef4444"
                      fill="#ef4444"
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
                <p className="font-semibold text-slate-200">Interpretasi Radar:</p>
                <p>
                  Siswa <strong className="text-indigo-300">{activeChartStudent?.name}</strong> unggul di subtes{' '}
                  <strong className="text-emerald-400">
                    {bestSubtestForActiveStudent}
                  </strong>.
                </p>
              </div>
            </div>

            {/* Chart 2: Multi-Tryout Score Progression Trend (Line Chart) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Tren Pertumbuhan Skor Antar Tryout (TO #1 s/d TO #5)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Perkembangan rata-rata skor per subtes dan total IRT seluruh siswa dari tryout diagnostik hingga simulasi akhir.
                    </p>
                  </div>
                </div>

                {/* Subtest Line Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Filter Garis:</span>
                  {[
                    { key: 'TOTAL', label: 'Total Skor', color: 'bg-indigo-500 text-white' },
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
                      onClick={() => toggleSubtestLine(sub.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeSubtestLines[sub.key]
                          ? `${sub.color} shadow-sm`
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Chart Component */}
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={multiTryoutTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="sessionName" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 600 }} />
                    <YAxis domain={[640, 800]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                    {activeSubtestLines.TOTAL && (
                      <Line type="monotone" dataKey="TOTAL" name="Skor Total IRT" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                    )}
                    {activeSubtestLines.PU && (
                      <Line type="monotone" dataKey="PU" name="Penalaran Umum (PU)" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeSubtestLines.PPU && (
                      <Line type="monotone" dataKey="PPU" name="PPU" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeSubtestLines.PBM && (
                      <Line type="monotone" dataKey="PBM" name="PBM" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeSubtestLines.PK && (
                      <Line type="monotone" dataKey="PK" name="Kuantitatif (PK)" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeSubtestLines.LBI && (
                      <Line type="monotone" dataKey="LBI" name="Literasi B. Indo (LBI)" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeSubtestLines.LBE && (
                      <Line type="monotone" dataKey="LBE" name="Literasi B. Ing (LBE)" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    {activeSubtestLines.PM && (
                      <Line type="monotone" dataKey="PM" name="Penalaran MTK (PM)" stroke="#d946ef" strokeWidth={1.5} dot={{ r: 3 }} />
                    )}
                    <Line type="monotone" dataKey="TargetUI" name="Batas Aman UI (735)" stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Pertumbuhan Rata-Rata</span>
                  <div className="text-sm font-black text-emerald-400 font-mono">+57 Poin</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Subtes Terkuat</span>
                  <div className="text-sm font-black text-indigo-400">PK (Kuantitatif)</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Subtes Perlu Drill</span>
                  <div className="text-sm font-black text-rose-400">PM (Penalaran MTK)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Bar Comparison & Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 3: Grouped Bar Chart of 7 Subtests */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Komparasi 7 Subtes: Rata-Rata vs Nilai Tertinggi Sesi Ini
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Perbandingan skor rata-rata kelas, skor tertinggi, dan standar batas passing grade pada sesi {currentSession.shortName}.
                </p>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subtestMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis domain={[500, 820]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="avgScore" name="Rata-Rata Kelas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="highestScore" name="Skor Tertinggi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passingStandard" name="Standar Target" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Score Distribution Bar Chart */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  Distribusi Skor IRT & Daya Saing PTN
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sebaran jumlah siswa berdasarkan rentang skor IRT dan peluang masuk klaster PTN.
                </p>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="label" type="category" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Bar dataKey="jumlah" name="Jumlah Siswa" radius={[0, 6, 6, 0]}>
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Siswa Terdaftar: <strong className="text-white">{students.length} Siswa</strong></span>
                <span className="text-emerald-400 font-bold">
                  {students.filter(s => getStudentSessionData(s, selectedTryoutId).isPassed).length} Lolos Target 1
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TABEL HASIL TRYOUT SISWA LENGKAP 7 SUBTEST (Disembunyikan pada panel siswa) */}
      {!isStudent && (viewTabMode === 'ALL_IN_ONE' || viewTabMode === 'TABLE_SUBTESTS') && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4" id="table-7-subtests-section">
          {/* Header Controls & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  TABEL LENGKAP 7 SUBTES
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Sesi: <strong className="text-indigo-300">{currentSession.shortName}</strong>
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Rekapitulasi Skor & Peringkat Tryout Siswa
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Memuat rincian nilai 7 subtes: PU, PPU, PBM, PK, LBI, LBE, PM, Total Skor IRT, dan analisis passing grade.
              </p>
            </div>

            {/* Filter Group, Status, Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIS, sekolah, prodi..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              {/* Kelompok Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['ALL', 'Alpha', 'Einstein', 'Newton'].map(grp => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroupFilter(grp)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      selectedGroupFilter === grp
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {grp === 'ALL' ? 'Semua' : grp}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={selectedPassingStatusFilter}
                onChange={(e) => setSelectedPassingStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="LOLOS">Lolos Passing Grade</option>
                <option value="KOMPETITIF">Kompetitif (Margin Tipis)</option>
                <option value="BELUM">Perlu Peningkatan</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="SCORE_DESC">Sort: Skor Tertinggi</option>
                <option value="SCORE_ASC">Sort: Skor Terendah</option>
                <option value="GROWTH_DESC">Sort: Progres Pertumbuhan (+)</option>
                <option value="PU_DESC">Sort: Nilai PU</option>
                <option value="PK_DESC">Sort: Nilai PK</option>
                <option value="PM_DESC">Sort: Nilai PM</option>
                <option value="NAME_ASC">Sort: Nama A-Z</option>
              </select>

              {/* Monitored Student Filter Toggle */}
              <button
                type="button"
                onClick={() => setOnlyShowActiveStudent(!onlyShowActiveStudent)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  onlyShowActiveStudent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title="Tampilkan hanya data siswa yang sedang dipilih / dipantau"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{onlyShowActiveStudent ? 'Hanya Siswa Terpilih (Aktif)' : 'Fokus Siswa Dipantau'}</span>
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-3 text-center w-12">Rank</th>
                  <th className="py-3.5 px-3 min-w-[200px]">Data Siswa</th>
                  <th className="py-3.5 px-3 min-w-[160px]">Target PTN 1 & PG</th>
                  {/* 7 Subtests Headers */}
                  <th className="py-3.5 px-2.5 text-center bg-blue-950/20 text-blue-300 border-x border-slate-800/60" title="Penalaran Umum (TPS)">PU</th>
                  <th className="py-3.5 px-2.5 text-center bg-cyan-950/20 text-cyan-300 border-r border-slate-800/60" title="Pengetahuan & Pemahaman Umum (TPS)">PPU</th>
                  <th className="py-3.5 px-2.5 text-center bg-amber-950/20 text-amber-300 border-r border-slate-800/60" title="Pemahaman Bacaan & Menulis (TPS)">PBM</th>
                  <th className="py-3.5 px-2.5 text-center bg-rose-950/20 text-rose-300 border-r border-slate-800/60" title="Pengetahuan Kuantitatif (TPS)">PK</th>
                  <th className="py-3.5 px-2.5 text-center bg-emerald-950/20 text-emerald-300 border-r border-slate-800/60" title="Literasi Bahasa Indonesia">LBI</th>
                  <th className="py-3.5 px-2.5 text-center bg-purple-950/20 text-purple-300 border-r border-slate-800/60" title="Literasi Bahasa Inggris">LBE</th>
                  <th className="py-3.5 px-2.5 text-center bg-fuchsia-950/20 text-fuchsia-300 border-r border-slate-800/60" title="Penalaran Matematika">PM</th>
                  <th className="py-3.5 px-3 text-center font-bold text-indigo-400 bg-indigo-950/30">Total IRT</th>
                  <th className="py-3.5 px-3 text-center min-w-[110px]">Status Lolos</th>
                  <th className="py-3.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {processedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  processedStudents.map((std, idx) => {
                    const isExpanded = expandedStudentId === std.id;
                    const isActiveMonitored = std.id === selectedStudentForChart;
                    const { pu, ppu, pbm, pk, lbi, lbe, pm, total, isPassed, gap, growth } = std.sessionData;

                    return (
                      <React.Fragment key={std.id}>
                        <tr
                          onClick={() => handleSelectStudentInternal(std.id)}
                          className={`transition-colors cursor-pointer ${
                            isActiveMonitored
                              ? 'bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/50'
                              : isExpanded
                              ? 'bg-slate-800/30'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono font-black text-xs ${
                              idx === 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                                : idx === 1
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                                : idx === 2
                                ? 'bg-amber-700/20 text-amber-400 border border-amber-600/40'
                                : 'text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>

                          {/* Student Info */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={std.avatar}
                                alt={std.name}
                                className={`w-8 h-8 rounded-full object-cover border ${
                                  isActiveMonitored ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-700'
                                }`}
                              />
                              <div>
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <span>{std.name}</span>
                                  {isActiveMonitored && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500 text-white flex items-center gap-0.5 shadow-sm">
                                      <UserCheck className="w-2.5 h-2.5" />
                                      DIPANTAU
                                    </span>
                                  )}
                                  {growth > 0 && (
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                      +{growth}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {std.nis} • {std.schoolOrigin}
                                </p>
                                <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                                  {std.group.replace(' (UTBK)', '')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Target PTN & Passing Grade */}
                          <td className="py-3 px-3">
                            <p className="font-bold text-white text-xs leading-tight">{std.prodi1}</p>
                            <p className="text-[10px] text-slate-400">{std.targetPtn1}</p>
                            <div className="flex items-center gap-1 text-[10px] font-mono mt-0.5">
                              <span className="text-slate-500">PG:</span>
                              <span className="text-amber-300 font-bold">{std.passingGrade1}</span>
                              <span className="text-slate-600">•</span>
                              <span className={gap >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-semibold'}>
                                {gap >= 0 ? `+${gap}` : `${gap}`} poin
                              </span>
                            </div>
                          </td>

                          {/* 7 SUBTEST CELLS */}
                          <td className="py-3 px-2.5 text-center font-mono font-bold text-blue-300 bg-blue-950/10 border-x border-slate-800/40">{pu}</td>
                          <td className="py-3 px-2.5 text-center font-mono font-bold text-cyan-300 bg-cyan-950/10 border-r border-slate-800/40">{ppu}</td>
                          <td className="py-3 px-2.5 text-center font-mono font-bold text-amber-300 bg-amber-950/10 border-r border-slate-800/40">{pbm}</td>
                          <td className="py-3 px-2.5 text-center font-mono font-black text-rose-300 bg-rose-950/10 border-r border-slate-800/40">{pk}</td>
                          <td className="py-3 px-2.5 text-center font-mono font-bold text-emerald-300 bg-emerald-950/10 border-r border-slate-800/40">{lbi}</td>
                          <td className="py-3 px-2.5 text-center font-mono font-bold text-purple-300 bg-purple-950/10 border-r border-slate-800/40">{lbe}</td>
                          <td className="py-3 px-2.5 text-center font-mono font-black text-fuchsia-300 bg-fuchsia-950/10 border-r border-slate-800/40">{pm}</td>

                          {/* Total Score */}
                          <td className="py-3 px-3 text-center bg-indigo-950/20">
                            <div className="font-mono font-black text-indigo-300 text-sm">{total}</div>
                            <span className="text-[9px] text-slate-500 font-mono">Skor IRT</span>
                          </td>

                          {/* Status Passing Grade */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPassed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : gap >= -25
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {isPassed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Lolos PG
                                </>
                              ) : gap >= -25 ? (
                                <>
                                  <Activity className="w-3 h-3 text-amber-400" />
                                  Kompetitif
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 text-rose-400" />
                                  Kurang
                                </>
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setExpandedStudentId(isExpanded ? null : std.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                                title={isExpanded ? 'Tutup Rincian' : 'Lihat Rincian 7 Subtes & Multi TO'}
                              >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>

                              {onSelectStudentForEval && (
                                <button
                                  type="button"
                                  onClick={() => onSelectStudentForEval(std.id)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                >
                                  Evaluasi
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED ROW ACCORDION */}
                        {isExpanded && (
                          <tr className="bg-slate-950/80 border-b border-slate-800">
                            <td colSpan={13} className="p-4 sm:p-6">
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                                  <div className="flex items-center gap-3">
                                    <img src={std.avatar} alt={std.name} className="w-10 h-10 rounded-full object-cover border border-indigo-500/40" />
                                    <div>
                                      <h4 className="font-black text-white text-sm flex items-center gap-2">
                                        <span>Rincian Lengkap Hasil Tryout: {std.name}</span>
                                        <span className="text-xs font-mono text-indigo-300">({std.nis})</span>
                                      </h4>
                                      <p className="text-xs text-slate-400">
                                        Pilihan 1: <strong className="text-slate-200">{std.targetPtn1} - {std.prodi1}</strong> (PG: {std.passingGrade1}) • Pilihan 2: <strong className="text-slate-200">{std.targetPtn2} - {std.prodi2}</strong> (PG: {std.passingGrade2})
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedStudentForChart(std.id);
                                        setViewTabMode('CHARTS_ANALYTICS');
                                        if (onShowToast) onShowToast(`Menampilkan grafik radar untuk ${std.name}`, 'info');
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <PieChartIcon className="w-3.5 h-3.5" />
                                      <span>Lihat Radar IRT Siswa</span>
                                    </button>
                                  </div>
                                </div>

                                {/* 7 Subtest Accuracy Breakdown */}
                                <div>
                                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                                    Capaian 7 Subtes pada Sesi Ini ({currentSession.shortName}):
                                  </h5>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                    {[
                                      { code: 'PU', name: 'Penalaran Umum', score: pu, target: 750, color: 'text-blue-400' },
                                      { code: 'PPU', name: 'Pengetahuan Umum', score: ppu, target: 730, color: 'text-cyan-400' },
                                      { code: 'PBM', name: 'Pemahaman Menulis', score: pbm, target: 740, color: 'text-amber-400' },
                                      { code: 'PK', name: 'Kuantitatif', score: pk, target: 770, color: 'text-rose-400' },
                                      { code: 'LBI', name: 'Literasi B. Indo', score: lbi, target: 750, color: 'text-emerald-400' },
                                      { code: 'LBE', name: 'Literasi B. Ing', score: lbe, target: 740, color: 'text-purple-400' },
                                      { code: 'PM', name: 'Penalaran MTK', score: pm, target: 750, color: 'text-fuchsia-400' }
                                    ].map(item => (
                                      <div key={item.code} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                          <span>{item.code}</span>
                                          <span className="font-mono">{item.score >= item.target ? 'Aman' : 'Drill'}</span>
                                        </div>
                                        <div className={`text-base font-black font-mono ${item.color}`}>
                                          {item.score}
                                        </div>
                                        <div className="text-[9px] text-slate-500 truncate" title={item.name}>
                                          {item.name}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Multi-Tryout Mini Table for this student */}
                                {std.tryoutHistory && std.tryoutHistory.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                      Riwayat Perkembangan 7 Subtes (TO #1 s/d TO #5):
                                    </h5>
                                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                                      <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                          <tr className="bg-slate-950 text-[10px] font-black text-slate-400 uppercase">
                                            <th className="py-2 px-3">Sesi Tryout</th>
                                            <th className="py-2 px-2 text-center text-blue-300">PU</th>
                                            <th className="py-2 px-2 text-center text-cyan-300">PPU</th>
                                            <th className="py-2 px-2 text-center text-amber-300">PBM</th>
                                            <th className="py-2 px-2 text-center text-rose-300">PK</th>
                                            <th className="py-2 px-2 text-center text-emerald-300">LBI</th>
                                            <th className="py-2 px-2 text-center text-purple-300">LBE</th>
                                            <th className="py-2 px-2 text-center text-fuchsia-300">PM</th>
                                            <th className="py-2 px-3 text-center text-indigo-300 font-bold">Total IRT</th>
                                            <th className="py-2 px-3 text-center">Rank</th>
                                            <th className="py-2 px-3 text-center">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                                          {std.tryoutHistory.map((to, tIdx) => (
                                            <tr key={to.id} className="hover:bg-slate-800/30">
                                              <td className="py-2 px-3 font-semibold text-white">
                                                {to.tryoutName}
                                                <span className="text-[10px] text-slate-500 block font-mono">{to.date}</span>
                                              </td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.pu}</td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.ppu}</td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.pbm}</td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.pk}</td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.lbi}</td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.lbe}</td>
                                              <td className="py-2 px-2 text-center font-mono text-slate-300">{to.subtests.pm}</td>
                                              <td className="py-2 px-3 text-center font-mono font-black text-indigo-400 text-sm">
                                                {to.totalScore}
                                              </td>
                                              <td className="py-2 px-3 text-center font-mono text-slate-400">
                                                #{to.rank} <span className="text-[9px] text-slate-600">/ {to.totalParticipants}</span>
                                              </td>
                                              <td className="py-2 px-3 text-center">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                                  to.totalScore >= std.passingGrade1
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'bg-amber-500/20 text-amber-300'
                                                }`}>
                                                  {to.totalScore >= std.passingGrade1 ? 'Lolos PG' : 'Kompetitif'}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Counselor Note */}
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-start gap-2">
                                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-slate-200">Catatan & Saran Mentor UTBK:</span>
                                    <p className="text-slate-400 text-xs mt-0.5">{std.counselorNotes}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: MATRIKS KOMPARASI MULTI-TRYOUT (TO #1 s/d TO #5) (Disembunyikan pada panel siswa) */}
      {!isStudent && (viewTabMode === 'ALL_IN_ONE' || viewTabMode === 'MATRIX_MULTI_TO') && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4" id="matrix-multi-tryout-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  MATRIKS MULTI-TRYOUT
                </span>
                <span className="text-xs text-slate-400 font-semibold">Komparasi Perkembangan Skor Siswa</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Matriks Nilai Tryout Akbar #1 hingga Tryout Final #5
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Membandingkan progres setiap siswa dari TO Diagnostik (#1) hingga Simulasi UTBK Terakhir (#5) dengan delta pertumbuhan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportFullCsv}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Matriks CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-3 min-w-[180px]">Siswa</th>
                  <th className="py-3 px-3 min-w-[140px]">Target PTN 1 (PG)</th>
                  <th className="py-3 px-3 text-center bg-slate-950">TO #1 (Diag)</th>
                  <th className="py-3 px-3 text-center bg-slate-950">TO #2 (TPS)</th>
                  <th className="py-3 px-3 text-center bg-slate-950">TO #3 (IRT)</th>
                  <th className="py-3 px-3 text-center bg-slate-950">TO #4 (HOTS)</th>
                  <th className="py-3 px-3 text-center bg-slate-950">TO #5 (Final)</th>
                  <th className="py-3 px-3 text-center font-bold text-indigo-400 bg-indigo-950/30">Rata-Rata</th>
                  <th className="py-3 px-3 text-center font-bold text-amber-400 bg-amber-950/20">Tertinggi</th>
                  <th className="py-3 px-3 text-center text-emerald-400">Delta Growth</th>
                  <th className="py-3 px-3 text-center">Peluang Lolos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {students
                  .slice()
                  .sort((a, b) => b.avgTryoutScore - a.avgTryoutScore)
                  .map((std, idx) => {
                    const to1 = std.tryoutHistory?.find(t => t.id === 'to-01')?.totalScore || '-';
                    const to2 = std.tryoutHistory?.find(t => t.id === 'to-02')?.totalScore || '-';
                    const to3 = std.tryoutHistory?.find(t => t.id === 'to-03')?.totalScore || '-';
                    const to4 = std.tryoutHistory?.find(t => t.id === 'to-04')?.totalScore || '-';
                    const to5 = std.tryoutHistory?.find(t => t.id === 'to-05')?.totalScore || '-';

                    const firstVal = typeof to1 === 'number' ? to1 : std.avgTryoutScore;
                    const lastVal = typeof to5 === 'number' ? to5 : typeof to3 === 'number' ? to3 : std.avgTryoutScore;
                    const growthDelta = lastVal - firstVal;
                    const isPassed = std.avgTryoutScore >= std.passingGrade1;
                    const isActiveMonitored = std.id === selectedStudentForChart;

                    return (
                      <tr
                        key={std.id}
                        onClick={() => handleSelectStudentInternal(std.id)}
                        className={`transition-colors cursor-pointer ${
                          isActiveMonitored
                            ? 'bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/50'
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
                                isActiveMonitored ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-700'
                              }`}
                            />
                            <div>
                              <p className="font-bold text-white leading-tight flex items-center gap-1.5">
                                <span>{std.name}</span>
                                {isActiveMonitored && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-500 text-white flex items-center gap-0.5 shadow-sm">
                                    <UserCheck className="w-2.5 h-2.5" />
                                    DIPANTAU
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
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{to1}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{to2}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{to3}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{to4}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300 font-bold text-emerald-300">{to5}</td>

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

      {/* SECTION: ANALISIS BUTIR IRT & STRATEGI SUBTES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IRT Difficulty Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            Distribusi Tingkat Kesulitan Soal (IRT)
          </h3>
          <p className="text-xs text-slate-400">
            Pembobotan nilai IRT ditentukan oleh seberapa banyak siswa yang dapat menjawab benar butir soal tersebut.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-300">Kategori Soal Mudah (30%)</span>
                <span className="text-[11px] font-mono text-slate-400">Bobot IRT: 500 - 620</span>
              </div>
              <p className="text-[11px] text-slate-400">Tingkat ketuntasan kelas: <strong className="text-emerald-400">92% Benar</strong>. Berfungsi sebagai nilai dasar.</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-blue-300">Kategori Soal Sedang (45%)</span>
                <span className="text-[11px] font-mono text-slate-400">Bobot IRT: 620 - 740</span>
              </div>
              <p className="text-[11px] text-slate-400">Tingkat ketuntasan kelas: <strong className="text-blue-400">76% Benar</strong>. Menentukan daya saing ke PTN klaster 2.</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[76%]" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-rose-300">Kategori Soal Sulit / HOTS (25%)</span>
                <span className="text-[11px] font-mono text-slate-400">Bobot IRT: 740 - 850+</span>
              </div>
              <p className="text-[11px] text-slate-400">Tingkat ketuntasan kelas: <strong className="text-rose-400">54% Benar</strong>. Penentu kelulusan prodi favorit (Kedokteran, STEI, FTI).</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[54%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Speed & Response Time Pacing */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-cyan-400" />
            Analisis Kecepatan Respon Pengerjaan
          </h3>
          <p className="text-xs text-slate-400">
            Rata-rata alokasi waktu aktual siswa per butir soal dibandingkan batas waktu maksimal SNPMB.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <p className="font-bold text-white text-xs">Penalaran Umum (PU)</p>
                <p className="text-[10px] text-slate-400">30 Soal / 30 Menit (Alokasi: 60 dtk/soal)</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-emerald-400 text-sm">48 dtk</span>
                <span className="text-[10px] text-emerald-300 block">Sangat Efisien</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <p className="font-bold text-white text-xs">Pengetahuan Kuantitatif (PK)</p>
                <p className="text-[10px] text-slate-400">15 Soal / 20 Menit (Alokasi: 80 dtk/soal)</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-amber-400 text-sm">74 dtk</span>
                <span className="text-[10px] text-amber-300 block">Cukup Ketat</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <p className="font-bold text-white text-xs">Literasi Bahasa Indonesia (LBI)</p>
                <p className="text-[10px] text-slate-400">30 Soal / 45 Menit (Alokasi: 90 dtk/soal)</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-blue-400 text-sm">72 dtk</span>
                <span className="text-[10px] text-blue-300 block">Optimal</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <p className="font-bold text-white text-xs">Penalaran Matematika (PM)</p>
                <p className="text-[10px] text-slate-400">20 Soal / 30 Menit (Alokasi: 90 dtk/soal)</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-rose-400 text-sm">88 dtk</span>
                <span className="text-[10px] text-rose-300 block">Perlu Drill Latihan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Summary Across Sessions */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Ringkasan Skor Rata-Rata Antar Sesi
          </h3>
          <p className="text-xs text-slate-400">
            Perkembangan rata-rata skor IRT kelas XII-UTBK dari tryout pertama hingga sesi terkini.
          </p>

          <div className="space-y-2.5 pt-2">
            {tryoutSessions.filter(t => t.id !== 'all').map((to, idx, arr) => (
              <div
                key={to.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{to.code}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">{to.badge}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{to.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-indigo-400 text-sm">{to.avgScore}</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    {idx === 0 ? 'Baseline' : `+${to.avgScore - arr[idx - 1].avgScore} poin`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
