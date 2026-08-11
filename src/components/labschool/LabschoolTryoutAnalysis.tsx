import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  StudentTryoutResult,
  LabschoolTryoutItem,
  DEFAULT_LAB_TRYOUTS,
  loadStoredTryoutResults,
  calculateCampusComparisons,
  CampusComparisonResult
} from './labschoolLaporanData';
import { loadStoredCampuses } from './labschoolCampusData';
import { LabschoolTryoutMultiTable } from './LabschoolTryoutMultiTable';
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  Building2,
  Clock,
  ChevronDown,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Filter,
  Layers,
  Search,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  GraduationCap,
  Info,
  SlidersHorizontal,
  FileText,
  Check,
  Activity,
  CheckCheck,
  TableProperties
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
  LabelList
} from 'recharts';

interface LabschoolTryoutAnalysisProps {
  user: User;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  selectedJenjang?: 'SMP' | 'SMA';
  selectedTryoutId?: string;
  onSelectTryoutId?: (id: string) => void;
  selectedStudentId?: string;
  onSelectStudentId?: (id: string) => void;
  onOpenPrintModal?: (type?: 'ALL' | 'TRYOUT' | 'TRYOUT_TABLE' | 'QUIZ' | 'JOURNAL') => void;
}

// Subtest topics breakdown for SMP & SMA
const SUBTEST_TOPIC_DETAILS: Record<string, { smp: string[]; sma: string[]; focusTip: string }> = {
  PK: {
    smp: ['Pecahan & Desimal', 'FPB, KPK & Aritmatika', 'Perbandingan & Skala', 'Geometri Bangun Datar'],
    sma: ['Aljabar & Fungsi Kuadrat', 'Pola Bilangan & Barisan Deret', 'Aritmatika Sosial & Persentase', 'Geometri Analitik & Sudut'],
    focusTip: 'Latihan soal HOTS aljabar dengan batas waktu < 1.5 menit per soal'
  },
  KV: {
    smp: ['Padanan Hubungan Kata', 'Sinonim & Antonim Dasar', 'Kalimat Efektif Bahasa Indonesia', 'Basic English Reading'],
    sma: ['Analogi Asosiasi Kata Kompleks', 'Silogisme & Logika Bahasa', 'Grammar & Vocabulary TOEFL Junior', 'Koreksi Kalimat Rancu'],
    focusTip: 'Perluas perbendaharaan kata baku KBBI dan kata serapan bahasa asing'
  },
  PM: {
    smp: ['Ide Pokok Cerita Naratif', 'Menarik Kesimpulan Paragraf', 'Identifikasi Fakta vs Opini', 'Literasi Sains Sederhana'],
    sma: ['Menemukan Gagasan Utama Teks Panjang', 'Inferensi & Asumsi Penulis', 'Literasi Teks Indonesia & English HOTS', 'Analisis Data Grafik & Tabel'],
    focusTip: 'Gunakan teknik skimming & scanning untuk membaca wacana 400+ kata'
  },
  KA: {
    smp: ['IPA Terpadu (Gaya, Energi, Tumbuhan)', 'Sistem Organ & Ekosistem', 'IPS (Peta, Keragaman Sosial)', 'Sejarah Nasional Dasar'],
    sma: ['Fisika Terapan & Mekanika Kinematika', 'Biologi Sel, Genetika & Ekologi', 'Kimia Dasar & Stoikiometri', 'IPS Terpadu (Ekonomi Mikro & Geografi)'],
    focusTip: 'Perkuat konsep fisika rumus dasar dan istilah biologi kontekstual'
  },
  SK: {
    smp: ['Penalaran Pola Gambar Spasial', 'Tes Figural 2D & Matriks', 'Survei Karakter Pelajar Pancasila', 'Kemandirian & Integritas'],
    sma: ['Logika Spasial 3D & Jaring Bangun', 'Silogisme Kompleks & Penalaran Analitis', 'Survei Karakter & Profil Pemimpin', 'Etika Belajar & Ketangguhan Mental'],
    focusTip: 'Pertahankan kejujuran dan konsistensi pada butir survei integritas'
  }
};

export const LabschoolTryoutAnalysis: React.FC<LabschoolTryoutAnalysisProps> = ({
  user,
  onShowToast,
  selectedJenjang,
  selectedTryoutId: propTryoutId,
  onSelectTryoutId,
  selectedStudentId: propStudentId,
  onSelectStudentId,
  onOpenPrintModal
}) => {
  const availableTryouts = useMemo(() => {
    if (!selectedJenjang || selectedJenjang === 'ALL') return DEFAULT_LAB_TRYOUTS;
    return DEFAULT_LAB_TRYOUTS.filter(t => t.level === selectedJenjang);
  }, [selectedJenjang]);
  const tryouts = availableTryouts;
  const [results, setResults] = useState<StudentTryoutResult[]>(() => loadStoredTryoutResults());
  const campuses = useMemo(() => loadStoredCampuses(), []);

  // Filter States with controlled / uncontrolled fallback
  const [internalTryoutId, setInternalTryoutId] = useState<string>(tryouts[tryouts.length - 1]?.id || tryouts[0]?.id);
  const [internalStudentId, setInternalStudentId] = useState<string>(
    user.role === 'student' ? user.id || 'u-s1' : 'u-s1'
  );

  const selectedTryoutId = propTryoutId || internalTryoutId;
  const selectedStudentId = propStudentId || internalStudentId;

  const handleTryoutChange = (newId: string) => {
    setInternalTryoutId(newId);
    if (onSelectTryoutId) onSelectTryoutId(newId);
  };

  const handleStudentChange = (newId: string) => {
    setInternalStudentId(newId);
    if (onSelectStudentId) onSelectStudentId(newId);
  };

  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'MULTI_TABLE' | 'DIAGNOSTIC'>('MULTI_TABLE');
  const [chartViewMode, setChartViewMode] = useState<'LINE_SUBTEST' | 'LINE_TREND' | 'BAR_CAMPUS' | 'RADAR'>('LINE_SUBTEST');

  // Active Tryout
  const activeTryout = useMemo(() => {
    return tryouts.find(t => t.id === selectedTryoutId) || tryouts[0];
  }, [tryouts, selectedTryoutId]);

  // Filtered Student Result
  const currentResult = useMemo(() => {
    let match = results.find(
      r => r.tryoutId === selectedTryoutId && (r.studentId === selectedStudentId || (user.role === 'student' && r.studentName.toLowerCase().includes(user.name.toLowerCase())))
    );
    if (!match) {
      match = results.find(r => r.studentId === selectedStudentId && (!selectedJenjang || selectedJenjang === 'ALL' || r.level === selectedJenjang));
    }
    if (!match && results.length > 0) {
      match = results.find(r => r.tryoutId === selectedTryoutId && (!selectedJenjang || selectedJenjang === 'ALL' || r.level === selectedJenjang)) ||
              results.find(r => !selectedJenjang || selectedJenjang === 'ALL' || r.level === selectedJenjang) ||
              results[0];
    }
    return match || results[0];
  }, [results, selectedTryoutId, selectedStudentId, selectedJenjang, user]);

  // Campus Comparisons calculation (Urutan Pertama: Target Labschool Pilihan)
  const comparisons: CampusComparisonResult[] = useMemo(() => {
    if (!currentResult) return [];
    const raw = calculateCampusComparisons(currentResult.totalScore, currentResult.level, campuses);
    
    // Sort so Target Labschool Pilihan is ALWAYS in index 0 (urutan pertama)
    const targetName = (currentResult.targetCampusName || '').toLowerCase();
    const targetId = currentResult.targetCampusId;

    return [...raw].sort((a, b) => {
      const aIsTarget = (targetId && a.campus.id === targetId) || (targetName && (a.campus.name.toLowerCase().includes(targetName) || targetName.includes(a.campus.name.toLowerCase())));
      const bIsTarget = (targetId && b.campus.id === targetId) || (targetName && (b.campus.name.toLowerCase().includes(targetName) || targetName.includes(b.campus.name.toLowerCase())));
      if (aIsTarget && !bIsTarget) return -1;
      if (!aIsTarget && bIsTarget) return 1;
      return 0;
    });
  }, [currentResult, campuses]);

  // Target Campus Passing Grade (First item in comparisons if target, or found item)
  const targetCampusItem = useMemo(() => {
    return comparisons[0] || comparisons.find(c =>
      currentResult?.targetCampusName?.toLowerCase().includes(c.campus.name.toLowerCase()) ||
      c.campus.id === currentResult?.targetCampusId
    ) || comparisons[0];
  }, [comparisons, currentResult]);

  const targetPassingGrade = targetCampusItem ? targetCampusItem.targetPassingGrade : 86.0;
  const scoreDiffWithTarget = currentResult ? currentResult.totalScore - targetPassingGrade : 0;
  const isPassedTarget = scoreDiffWithTarget >= 0;

  // 1. Line Chart Data for 5 Subtests (Using Abbreviations PK, KV, PM, KA, SK)
  const subtestLineData = useMemo(() => {
    if (!currentResult) return [];
    const nationalAverages: Record<string, number> = {
      PK: 75.8,
      KV: 78.2,
      PM: 74.5,
      KA: 72.0,
      SK: 79.5
    };

    return currentResult.subtestScores.map(sub => {
      const natAvg = nationalAverages[sub.code] || 75.0;
      const diffPg = (sub.score - targetPassingGrade).toFixed(1);
      return {
        code: sub.code, // Singkatan subtes
        fullName: sub.code === 'SK' ? 'Survei Karakter' : sub.name,
        score: sub.score,
        targetPassingGrade: targetPassingGrade,
        nationalAverage: natAvg,
        accuracy: sub.accuracy,
        diffPg: Number(diffPg),
        status: sub.status === 'Tinggi' ? 'Sangat Tinggi' : sub.status === 'Sedang' ? 'Sedang' : 'Perlu Penguatan'
      };
    });
  }, [currentResult, targetPassingGrade]);

  // 2. Line Chart Data for Tryout Progress Trend (Calculated dynamically from all tryout history of selected student)
  const trendLineData = useMemo(() => {
    const studentHistory = results.filter(r => r.studentId === selectedStudentId);
    if (studentHistory.length === 0) {
      if (!currentResult) return [];
      return [
        {
          series: 'Sesi 1',
          code: 'TO-1',
          studentScore: currentResult.totalScore,
          passingGrade: targetPassingGrade,
          nationalAvg: 78.4,
          rank: currentResult.rank,
          label: currentResult.tryoutTitle.split('-')[1]?.trim() || 'Evaluasi Tryout'
        }
      ];
    }

    return studentHistory
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map((item, idx) => {
        const matchingTo = tryouts.find(t => t.id === item.tryoutId);
        const titleParts = item.tryoutTitle.split('-');
        const seriesLabel = titleParts.length > 1 ? titleParts[1].trim() : `Seri ${idx + 1}`;
        return {
          series: `TO ${idx + 1}`,
          code: `TO-${idx + 1}`,
          studentScore: item.totalScore,
          passingGrade: targetPassingGrade,
          nationalAvg: matchingTo ? matchingTo.averageScore : 80.0,
          rank: item.rank,
          label: seriesLabel
        };
      });
  }, [results, selectedStudentId, currentResult, targetPassingGrade, tryouts]);

  // 3. Radar Data for Subtest
  const radarData = useMemo(() => {
    if (!currentResult) return [];
    return currentResult.subtestScores.map(s => ({
      subject: s.code,
      fullName: s.code === 'SK' ? 'Survei Karakter' : s.name,
      score: s.score,
      target: targetPassingGrade,
      fullMark: 100
    }));
  }, [currentResult, targetPassingGrade]);

  // 4. Bar Comparison Data for 5 Campuses (Nilai Siswa sebagai Batang, Passing Grade sebagai Garis Horizontal)
  const campusBarData = useMemo(() => {
    if (!currentResult) return [];
    const targetName = (currentResult.targetCampusName || '').toLowerCase();
    const targetId = currentResult.targetCampusId;

    const getCampusColor = (id: string, name: string) => {
      const n = name.toLowerCase();
      if (id === 'camp-kebayoran' || n.includes('kebayoran')) return '#8b5cf6'; // Purple
      if (id === 'camp-rawamangun' || n.includes('rawamangun')) return '#f43f5e'; // Rose
      if (id === 'camp-cibubur' || n.includes('cibubur')) return '#f59e0b'; // Amber
      if (id === 'camp-grand-wisata' || n.includes('grand wisata')) return '#10b981'; // Emerald
      if (id === 'camp-cirebon' || n.includes('cirebon')) return '#06b6d4'; // Cyan
      return '#3b82f6';
    };

    return comparisons.map((c, index) => {
      const isTarget = index === 0 || (targetId && c.campus.id === targetId) || (targetName && (c.campus.name.toLowerCase().includes(targetName) || targetName.includes(c.campus.name.toLowerCase())));
      const shortName = c.campus.name.replace('Labschool ', '').replace('Jakarta ', '');
      const isPass = currentResult.totalScore >= c.targetPassingGrade;
      const lineColor = getCampusColor(c.campus.id, c.campus.name);

      return {
        name: isTarget ? `★ ${shortName} (Target)` : shortName,
        rawName: shortName,
        fullName: c.campus.name,
        passingGrade: c.targetPassingGrade,
        studentScore: currentResult.totalScore,
        margin: c.margin,
        chance: c.chanceLabel,
        isTarget: isTarget,
        campusId: c.campus.id,
        isPass: isPass,
        statusLabel: isPass ? 'LOLOS' : 'BELUM LOLOS',
        lineColor: lineColor,
        barColor: isTarget ? '#0284c7' : '#1e3a8a', // Distinct ocean/sapphire blue for student score bar
        barStroke: isTarget ? '#38bdf8' : '#60a5fa'
      };
    });
  }, [comparisons, currentResult]);

  // Helper to format subtest status label
  const getSubtestStatusBadge = (score: number, accuracy: number) => {
    if (score >= 90) {
      return {
        label: 'SANGAT TINGGI (AMAN)',
        className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      };
    }
    if (score >= 85) {
      return {
        label: 'TINGGI (OPTIMAL)',
        className: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      };
    }
    if (score >= 78) {
      return {
        label: 'SEDANG (STANDAR)',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }
    return {
      label: 'PERLU PENGUATAN',
      className: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP FILTER & SELECTOR BAR (MENU TERATUR DI BAWAH JUDUL, TANPA DISKRIPSI)   */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Analisis & Grafik Hasil Tryout Labschool
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Jenjang {currentResult?.level || 'SMA'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              5 Subtes Resmi
            </span>
          </div>
        </div>

        {/* Menu Controls & Filters (Tersusun Rapi Tepat di Bawah Judul) */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2.5">
          {/* Tab Switcher: Multi-Tryout Table vs Single Tryout Diagnostic */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/90 rounded-2xl border border-slate-800/90 shrink-0">
            <button
              type="button"
              id="tab-btn-multi-tryout-table"
              onClick={() => setActiveAnalysisTab('MULTI_TABLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeAnalysisTab === 'MULTI_TABLE'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tabel Analisis Hasil Tryout</span>
            </button>

            <button
              type="button"
              id="tab-btn-diagnostic-charts"
              onClick={() => setActiveAnalysisTab('DIAGNOSTIC')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeAnalysisTab === 'DIAGNOSTIC'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Grafik Diagnostik & Komparasi</span>
            </button>
          </div>

          {/* Selectors & Action Buttons (Kecil di Samping Menu Pilihan Tabel/Grafik) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pilih TO (Satu-satunya Filter di Toolbar Tryout Sesuai Instruksi) */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Pilih TO:</span>
              </span>
              <select
                id="select-tryout-paket"
                value={selectedTryoutId}
                onChange={(e) => handleTryoutChange(e.target.value)}
                className="text-xs bg-transparent text-slate-200 focus:outline-none font-semibold cursor-pointer max-w-[200px] sm:max-w-[280px]"
              >
                {tryouts.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                    [{t.level}] {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Badge Siswa Aktif Terpilih */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-slate-400">Siswa:</span>
              <span className="font-bold text-white">{currentResult?.studentName || 'Budi Santoso'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: 14-COLUMN MULTI-TRYOUT ANALYSIS TABLE */}
      {activeAnalysisTab === 'MULTI_TABLE' && (
        <div className="space-y-4">
          <LabschoolTryoutMultiTable
            user={user}
            tryoutResults={results}
            selectedStudentId={selectedStudentId}
            onOpenPrintModal={onOpenPrintModal}
            onUpdateResults={(newResults) => setResults(newResults)}
            onShowToast={onShowToast}
            onSelectTryout={(resultOrId: any) => {
              const toId = typeof resultOrId === 'string' ? resultOrId : resultOrId?.tryoutId || resultOrId?.id;
              const toTitle = typeof resultOrId === 'string' ? resultOrId : resultOrId?.tryoutTitle || resultOrId?.title || toId;
              if (toId) handleTryoutChange(toId);
              setActiveAnalysisTab('DIAGNOSTIC');
              if (onShowToast) {
                onShowToast(`Beralih ke analisis grafis untuk paket ${toTitle}`, 'info');
              }
            }}
          />
        </div>
      )}

      {/* VIEW MODE 2: DIAGNOSTIC GRAPHS & DETAILED SUBTEST DRILLDOWN */}
      {activeAnalysisTab === 'DIAGNOSTIC' && currentResult && (
        <>
          {/* ========================================================================= */}
          {/* MAIN SCORE HERO CARD (SKOR TERLIHAT SANGAT JELAS & HIGH-CONTRAST)         */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Ultra-Clear Big Score Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border-2 border-blue-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Student Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentResult.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}
                      alt={currentResult.studentName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-400/60 shadow-md shrink-0"
                    />
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                        {currentResult.studentName}
                      </h3>
                      
                      {/* Label & Informasi Tepat di Bagian Bawah Nama Siswa */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                          NIS: {currentResult.studentNis}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                          {currentResult.studentClass}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                          <span className="text-amber-400 font-bold">Target :</span>
                          <span className="text-white font-extrabold">{currentResult.targetCampusName}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMPACT & TIDY SCORE DISPLAY (TARGETED CSS CONTAINER) */}
                <div className="bg-slate-950/90 rounded-2xl p-3.5 sm:p-4 border border-slate-800 shadow-inner text-center relative overflow-hidden">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Skor Total Akhir Tryout (LRI)
                    </span>
                  </div>

                  {/* Compact & High Contrast Score Display */}
                  <div className="flex items-baseline justify-center gap-1.5 my-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]">
                      {currentResult.totalScore.toFixed(1)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-400 font-mono">
                      / 100.0
                    </span>
                  </div>

                  {/* Status Lulus / Passing Grade Banner */}
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide border shadow-sm ${
                      isPassedTarget
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isPassedTarget ? 'LOLOS / AMAN DI ATAS PG' : 'KOMPETITIF (DI BAWAH TARGET)'}</span>
                    </span>

                    <p className="text-[11px] text-slate-300 font-medium">
                      Selisih: <strong className={isPassedTarget ? 'text-emerald-400' : 'text-rose-400'}>
                        {scoreDiffWithTarget >= 0 ? `+${scoreDiffWithTarget.toFixed(1)}` : scoreDiffWithTarget.toFixed(1)} Poin
                      </strong> dari PG {currentResult.targetCampusName} ({targetPassingGrade})
                    </p>
                  </div>
                </div>

                {/* Fast Subtest Badges Summary */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ringkasan Nilai 5 Subtes (Singkatan):
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono font-black">
                    {currentResult.subtestScores.map(sub => (
                      <div
                        key={sub.code}
                        className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center gap-0.5"
                      >
                        <span className="text-[10px] font-black text-slate-400">{sub.code}</span>
                        <span className="text-xs font-bold text-white">{sub.score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Target Pilihan:</span>
                    <strong className="text-white font-bold block truncate">{currentResult.targetCampusName}</strong>
                    <span className="text-[10px] text-amber-400 font-mono">PG: {targetPassingGrade} Poin</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Durasi & Submit:</span>
                    <strong className="text-white font-bold block">{currentResult.durationMinutes} Menit</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{currentResult.submittedAt}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400 italic">
                  💡 Evaluasi kesiapan seleksi dianalisis berdasarkan Passing Grade resmi PSB Labschool.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Line Charts & Visual Comparison */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
              <div>
                {/* Title Header */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                        Grafik Diagram Garis Performa & Nilai
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Visualisasi perbandingan capaian nilai siswa terhadap passing grade target
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                    PG: <strong className="text-amber-400">{targetPassingGrade}</strong>
                  </span>
                </div>

                {/* Menu Controls Bar (Arranged directly under the title) */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800/90 mb-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id="btn-chart-mode-subtest"
                      onClick={() => setChartViewMode('LINE_SUBTEST')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        chartViewMode === 'LINE_SUBTEST'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span>5 Subtes (PK–SK)</span>
                    </button>
                    <button
                      type="button"
                      id="btn-chart-mode-trend"
                      onClick={() => setChartViewMode('LINE_TREND')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        chartViewMode === 'LINE_TREND'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span>Tren Seri TO</span>
                    </button>
                    <button
                      type="button"
                      id="btn-chart-mode-radar"
                      onClick={() => setChartViewMode('RADAR')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        chartViewMode === 'RADAR'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span>Radar Kompetensi</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono px-2 hidden md:inline">
                    {chartViewMode === 'LINE_SUBTEST' && 'Perbandingan Skor 5 Subtes'}
                    {chartViewMode === 'LINE_TREND' && 'Progres Perkembangan Tryout Seri 1–5'}
                    {chartViewMode === 'RADAR' && 'Keseimbangan Kompetensi Siswa'}
                  </span>
                </div>

                {/* CHART DISPLAY AREA */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 h-64 w-full relative">
                  
                  {/* VIEW 1: LINE CHART 5 SUBTESTS (WITH EXPLICIT LABELS ON POINTS) */}
                  {chartViewMode === 'LINE_SUBTEST' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={subtestLineData}
                        margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="code"
                          stroke="#94a3b8"
                          tick={{ fontSize: 11, fontWeight: 700 }}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          domain={[60, 100]}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            fontSize: '11px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                          }}
                          formatter={(value: any, name: string) => [
                            `${value} Poin`,
                            name === 'score'
                              ? 'Skor Siswa'
                              : name === 'targetPassingGrade'
                              ? `Passing Grade Target (${targetPassingGrade})`
                              : 'Rata-rata Nasional'
                          ]}
                          labelFormatter={(code) => {
                            const match = subtestLineData.find(s => s.code === code);
                            return `${code} - ${match ? match.fullName : ''}`;
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                          formatter={(value) => (
                            <span className="text-slate-300 font-medium">
                              {value === 'score'
                                ? 'Skor Siswa (Per Subtes)'
                                : value === 'targetPassingGrade'
                                ? `Target Passing Grade (${targetPassingGrade})`
                                : 'Rata-rata Peserta Nasional'}
                            </span>
                          )}
                        />

                        {/* Standar Target Reference Line */}
                        <ReferenceLine
                          y={targetPassingGrade}
                          stroke="#a855f7"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                        />

                        {/* National Average Line */}
                        <Line
                          type="monotone"
                          dataKey="nationalAverage"
                          stroke="#64748b"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={{ r: 3, fill: '#64748b' }}
                          name="nationalAverage"
                        />

                        {/* Target Passing Grade Line */}
                        <Line
                          type="monotone"
                          dataKey="targetPassingGrade"
                          stroke="#a855f7"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: '#a855f7' }}
                          name="targetPassingGrade"
                        />

                        {/* Main Student Score Line with Explicit Value Labels on Nodes */}
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#38bdf8"
                          strokeWidth={3.5}
                          activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                          dot={{ r: 5, fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2 }}
                          name="score"
                        >
                          <LabelList
                            dataKey="score"
                            position="top"
                            offset={10}
                            fill="#38bdf8"
                            fontSize={11}
                            fontWeight={800}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* VIEW 2: LINE CHART TRYOUT SERIES TREND */}
                  {chartViewMode === 'LINE_TREND' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendLineData}
                        margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="code"
                          stroke="#94a3b8"
                          tick={{ fontSize: 11, fontWeight: 700 }}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          domain={[65, 100]}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            fontSize: '11px'
                          }}
                          formatter={(value: any, name: string) => [
                            `${value} Poin`,
                            name === 'studentScore' ? 'Skor Siswa' : 'Passing Grade'
                          ]}
                          labelFormatter={(code) => {
                            const match = trendLineData.find(t => t.code === code);
                            return match ? match.series : code;
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                          formatter={(value) => (
                            <span className="text-slate-300 font-medium">
                              {value === 'studentScore' ? 'Tren Skor Siswa' : `Passing Grade (${targetPassingGrade})`}
                            </span>
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="passingGrade"
                          stroke="#a855f7"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: '#a855f7' }}
                          name="passingGrade"
                        />
                        <Line
                          type="monotone"
                          dataKey="studentScore"
                          stroke="#10b981"
                          strokeWidth={3.5}
                          activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                          dot={{ r: 5, fill: '#059669', stroke: '#10b981', strokeWidth: 2 }}
                          name="studentScore"
                        >
                          <LabelList
                            dataKey="studentScore"
                            position="top"
                            offset={10}
                            fill="#10b981"
                            fontSize={11}
                            fontWeight={800}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* VIEW 3: RADAR CHART */}
                  {chartViewMode === 'RADAR' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 8 }} />
                        <Radar name="Skor Siswa" dataKey="score" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                        <Radar name="Target Passing Grade" dataKey="target" stroke="#ec4899" fill="#ec4899" fillOpacity={0.15} strokeDasharray="3 3" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
                  <span>Singkatan: <strong>PK</strong> (Kuantitatif) • <strong>KV</strong> (Verbal) • <strong>PM</strong> (Membaca) • <strong>KA</strong> (Akademik) • <strong>SK</strong> (Survei Karakter)</span>
                  <span className="text-cyan-400 font-semibold font-mono">Nilai & Label terpasang</span>
                </div>
              </div>

              {/* Strengths & Focus Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mt-3">
                <div className="p-3 rounded-2xl bg-emerald-950/25 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 mb-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Materi Unggulan (Kuat):</span>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                    {currentResult.strengths.map((str, idx) => (
                      <li key={idx} className="truncate">{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/25 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Fokus Penguatan (Target):</span>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                    {currentResult.weaknesses.map((w, idx) => (
                      <li key={idx} className="truncate">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: COMPARISON TERHADAP 5 KAMPUS LABSCHOOL                           */}
          {/* ========================================================================= */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                    Komparasi Kelulusan Terhadap 5 Kampus Labschool
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  Skor Siswa: <strong className="text-amber-300 font-black">{currentResult.totalScore.toFixed(1)}</strong> Poin
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-300">
                  Target: <strong className="text-cyan-300">{currentResult.targetCampusName}</strong> (PG: {targetPassingGrade.toFixed(1)})
                </span>
              </div>
            </div>

            {/* Campus Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisons.map((item) => {
                const isTarget = currentResult.targetCampusName.toLowerCase().includes(item.campus.name.toLowerCase()) ||
                  item.campus.id === currentResult.targetCampusId;

                return (
                  <div
                    key={item.campus.id}
                    className={`rounded-2xl p-4 transition-all duration-200 border relative overflow-hidden flex flex-col justify-between ${
                      isTarget
                        ? 'bg-gradient-to-b from-blue-950/50 via-slate-900 to-slate-950 border-blue-500/60 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {isTarget && (
                      <span className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-red-500 to-blue-600 text-white font-extrabold text-[9px] rounded-bl-xl tracking-wider shadow">
                        TARGET SISWA
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0 font-black text-xs">
                          {item.campus.loc.includes('Timur') ? 'RAW' : item.campus.loc.includes('Selatan') ? 'KEB' : item.campus.name.slice(9, 12).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{item.campus.name}</h4>
                          <p className="text-[10px] text-slate-400">{item.campus.loc} • {item.campus.accreditation}</p>
                        </div>
                      </div>

                      {/* Score Comparison Box */}
                      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Passing Grade</span>
                          <span className="text-sm font-extrabold text-indigo-300">{item.targetPassingGrade.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Delta Margin</span>
                          <span className={`text-sm font-extrabold ${item.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.margin >= 0 ? `+${item.margin.toFixed(1)}` : `${item.margin.toFixed(1)}`} Poin
                          </span>
                        </div>
                      </div>

                      {/* Chance Status Badge */}
                      <div className={`p-2 rounded-xl text-center text-xs font-bold border mb-3 ${item.chanceBadgeBg}`}>
                        {item.chanceLabel}
                      </div>
                    </div>

                    {/* Gauge Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Peluang Lolos</span>
                        <span className="font-bold text-white">{item.chancePercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.chancePercentage >= 80
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : item.chancePercentage >= 65
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                              : 'bg-gradient-to-r from-amber-500 to-rose-500'
                          }`}
                          style={{ width: `${item.chancePercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* GRAFIK KOMPARASI NILAI SISWA VS PASSING GRADE 5 KAMPUS LABSCHOOL          */}
            {/* Nilai Siswa = Grafik Batang | Passing Grade = Garis Horizontal Pembeda    */}
            {/* ========================================================================= */}
            <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
                    Grafik Komparasi Nilai Siswa vs Passing Grade 5 Kampus Labschool
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Batang: <strong>Nilai Siswa ({currentResult.totalScore.toFixed(1)} Poin)</strong> • Garis Horizontal: <strong>Passing Grade Ambang Batas 5 Kampus</strong>
                  </p>
                </div>
                <span className="text-[11px] text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  Target Siswa: {currentResult.targetCampusName} (PG: {targetPassingGrade.toFixed(1)})
                </span>
              </div>

              {/* Bar Chart with Inside Labels (Lolos / Belum Lolos) & Horizontal Passing Grade Lines */}
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campusBarData} margin={{ top: 28, right: 30, left: -5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 700 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      domain={[65, 100]}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{
                        value: 'Skor / Passing Grade',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#64748b',
                        fontSize: 10,
                        offset: 12
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '11px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                      formatter={(val: any, name: string, item: any) => {
                        const payload = item?.payload || {};
                        const isPass = payload.isPass;
                        const margin = payload.margin !== undefined ? payload.margin : (currentResult.totalScore - payload.passingGrade);
                        return [
                          <div key="tt" className="space-y-1">
                            <div className="font-bold text-white">
                              Nilai Siswa: <span className="text-sky-300">{currentResult.totalScore.toFixed(1)} Poin</span>
                            </div>
                            <div className="text-slate-300">
                              Passing Grade: <span className="font-semibold text-amber-300">{payload.passingGrade?.toFixed(1)} Poin</span>
                            </div>
                            <div className={`font-bold text-xs ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                              Status: {isPass ? '✓ LOLOS' : '✗ BELUM LOLOS'} (Margin: {margin >= 0 ? `+${margin.toFixed(1)}` : `${margin.toFixed(1)}`} Poin)
                            </div>
                          </div>,
                          payload.fullName || 'Komparasi Kampus'
                        ];
                      }}
                    />

                    {/* 5 Distinct Horizontal Reference Lines for Passing Grades (Without text labels as requested) */}
                    {campusBarData.map((entry, index) => (
                      <ReferenceLine
                        key={`ref-line-${entry.campusId || index}`}
                        y={entry.passingGrade}
                        stroke={entry.lineColor}
                        strokeWidth={entry.isTarget ? 2.5 : 1.8}
                        strokeDasharray={entry.isTarget ? '6 3' : '4 4'}
                      />
                    ))}

                    {/* Nilai Siswa Bar Chart with Inside Label & Top Score */}
                    <Bar
                      dataKey="studentScore"
                      radius={[8, 8, 0, 0]}
                      name="Nilai Siswa (Skor)"
                    >
                      {campusBarData.map((entry, index) => (
                        <Cell
                          key={`student-bar-${index}`}
                          fill={entry.isTarget ? '#0284c7' : '#1e3a8a'}
                          stroke={entry.isTarget ? '#38bdf8' : '#60a5fa'}
                          strokeWidth={entry.isTarget ? 2.5 : 1.5}
                        />
                      ))}

                      {/* Top Label: Skor Angka Siswa */}
                      <LabelList
                        dataKey="studentScore"
                        position="top"
                        fill="#38bdf8"
                        fontSize={11}
                        fontWeight={900}
                        offset={6}
                        formatter={(val: any) => `${Number(val).toFixed(1)}`}
                      />

                      {/* Inside Bar Label: Status Lolos / Belum Lolos & Delta */}
                      <LabelList
                        dataKey="statusLabel"
                        content={(props: any) => {
                          const { x, y, width, height, index } = props;
                          const item = campusBarData[index];
                          if (!item || width < 20 || height < 30) return null;
                          const isPass = item.isPass;
                          const labelText = isPass ? '✓ LOLOS' : '✗ BELUM LOLOS';
                          const marginText = item.margin >= 0 ? `+${item.margin.toFixed(1)}` : `${item.margin.toFixed(1)}`;
                          const centerX = x + width / 2;
                          const centerY = y + Math.max(26, Math.min(height / 2, 50));

                          return (
                            <g>
                              {/* Pill Badge Container */}
                              <rect
                                x={centerX - 46}
                                y={centerY - 16}
                                width={92}
                                height={30}
                                rx={6}
                                fill={isPass ? '#064e3b' : '#4c0519'}
                                stroke={isPass ? '#34d399' : '#fb7185'}
                                strokeWidth={1.2}
                                opacity={0.95}
                              />
                              <text
                                x={centerX}
                                y={centerY - 3}
                                textAnchor="middle"
                                fill={isPass ? '#6ee7b7' : '#fecdd3'}
                                fontSize={9.5}
                                fontWeight={900}
                                letterSpacing="0.4px"
                              >
                                {labelText}
                              </text>
                              <text
                                x={centerX}
                                y={centerY + 9}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={8.5}
                                fontWeight={700}
                                fontFamily="monospace"
                              >
                                (Δ {marginText})
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ========================================================================= */}
              {/* KETERANGAN & CATATAN ANALISIS KOMPARASI (LENGKAP & JELAS)                  */}
              {/* ========================================================================= */}
              <div className="pt-4 border-t border-slate-800/90 space-y-4">
                {/* Header Keterangan */}
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <h5 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                    Keterangan Garis Passing Grade 5 Kampus & Batang Nilai Siswa
                  </h5>
                </div>

                {/* Legend Definition Badges: 5 Campus Passing Grade Lines */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* Nilai Siswa */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/40 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 rounded bg-sky-500 shrink-0" />
                      <strong className="text-sky-300 font-bold text-xs">Nilai Siswa</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Skor: <strong>{currentResult.totalScore.toFixed(1)}</strong> Poin (Grafik Batang)
                    </span>
                  </div>

                  {/* 5 Campus Passing Grade Lines */}
                  {campusBarData.map((cmp) => (
                    <div
                      key={cmp.campusId}
                      className={`p-2.5 rounded-xl bg-slate-900 border flex flex-col justify-between ${
                        cmp.isTarget ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className="w-3 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: cmp.lineColor }}
                        />
                        <strong className="text-xs font-bold text-slate-200 truncate" title={cmp.fullName}>
                          {cmp.rawName} {cmp.isTarget && '★'}
                        </strong>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        PG: <strong style={{ color: cmp.lineColor }}>{cmp.passingGrade.toFixed(1)}</strong> Poin
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pedoman Interpretasi Delta Margin & Status Label */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      Pedoman Interpretasi Label di Dalam Batang:
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Ambang Batas PSB Labschool 2026
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-slate-300 flex items-start gap-2">
                      <span className="px-2 py-0.5 bg-emerald-700 text-white font-black rounded text-[10px] shrink-0 mt-0.5">
                        ✓ LOLOS
                      </span>
                      <div>
                        <strong className="text-emerald-300 font-bold block">Nilai Siswa ≥ Garis Passing Grade Kampus</strong>
                        Tercantum di dalam batang dengan delta selisih (+). Siswa memenuhi kuota ambang batas aman kelulusan kampus tersebut.
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-slate-300 flex items-start gap-2">
                      <span className="px-2 py-0.5 bg-rose-700 text-white font-black rounded text-[10px] shrink-0 mt-0.5">
                        ✗ BELUM LOLOS
                      </span>
                      <div>
                        <strong className="text-rose-300 font-bold block">Nilai Siswa &lt; Garis Passing Grade Kampus</strong>
                        Tercantum di dalam batang dengan delta minus (-). Diperlukan peningkatan poin pada subtes prioritas untuk mencapai passing grade.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Notes */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-300">Catatan Rekomendasi & Strategi Belajar Master Mentor:</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentResult.recommendationNotes}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
