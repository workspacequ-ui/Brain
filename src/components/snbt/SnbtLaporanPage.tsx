import React, { useState, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SnbtStudentProfile,
  loadStoredSnbtStudents,
  saveStoredSnbtStudents
} from './snbtData';
import { SnbtMiniCountdownBadge } from './SnbtMiniCountdownBadge';
import { SnbtPrintReportModal, SnbtPrintMode } from './SnbtPrintReportModal';
import { SnbtAnalisisTryout } from './SnbtAnalisisTryout';
import { SnbtAnalisisBelajar } from './SnbtAnalisisBelajar';
import { SnbtEvaluasi } from './SnbtEvaluasi';
import { SnbtActiveStudentReport } from './SnbtActiveStudentReport';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Award,
  Printer,
  Download,
  Flame,
  Users,
  UserCheck,
  Sparkles,
  ChevronRight,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

interface SnbtLaporanPageProps {
  user: User;
  onNavigateTab?: (tab: SidebarTab) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  initialMenu?: 'rapor_siswa' | 'analisis_tryout' | 'analisis_belajar' | 'evaluasi';
}

export type SnbtLaporanMenu = 'rapor_siswa' | 'analisis_tryout' | 'analisis_belajar' | 'evaluasi';

export const SnbtLaporanPage: React.FC<SnbtLaporanPageProps> = ({
  user,
  onNavigateTab,
  onShowToast,
  initialMenu = 'rapor_siswa'
}) => {
  const [students, setStudents] = useState<SnbtStudentProfile[]>(() => loadStoredSnbtStudents());
  const [activeMenu, setActiveMenu] = useState<SnbtLaporanMenu>(initialMenu);

  // Selected student state for active monitoring across all tabs
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (user.role === 'student') {
      const match = students.find(s => s.name.toLowerCase().includes(user.name.toLowerCase()) || s.email === user.email);
      return match ? match.id : students[0]?.id || 'snbt-std-01';
    }
    return students[0]?.id || 'snbt-std-01';
  });

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<SnbtPrintMode>('STUDENT_REPORT');

  // Active student object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const std = students.find(s => s.id === studentId);
    if (std) {
      notify(`Memantau data analisis lengkap: ${std.name}`, 'info');
    }
  };

  // Open Print Modal
  const handleOpenPrint = (mode: SnbtPrintMode = 'STUDENT_REPORT', studentId?: string) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    setPrintMode(mode);
    setIsPrintModalOpen(true);
  };

  // Export to CSV Handler
  const handleExportCsv = () => {
    try {
      const headers = ['Peringkat', 'NIS', 'Nama Lengkap', 'Kelompok', 'Asal Sekolah', 'Rata-rata Skor', 'Skor Tertinggi', 'Target PTN 1', 'Prodi 1', 'Passing Grade 1', 'Target PTN 2', 'Prodi 2', 'Passing Grade 2', 'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];
      const sorted = [...students].sort((a, b) => b.avgTryoutScore - a.avgTryoutScore);

      const rows = sorted.map((std, idx) => {
        const getScore = (code: string) => std.subtestScores.find(s => s.code === code)?.score || 0;
        return [
          idx + 1,
          `"${std.nis}"`,
          `"${std.name}"`,
          `"${std.group}"`,
          `"${std.schoolOrigin}"`,
          std.avgTryoutScore,
          std.highestTryoutScore,
          `"${std.targetPtn1}"`,
          `"${std.prodi1}"`,
          std.passingGrade1,
          `"${std.targetPtn2}"`,
          `"${std.prodi2}"`,
          std.passingGrade2,
          getScore('PU'),
          getScore('PPU'),
          getScore('PBM'),
          getScore('PK'),
          getScore('LBI'),
          getScore('LBE'),
          getScore('PM')
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rekapitulasi_Analisis_SNBT_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify('Data rekapitulasi nilai dan analisis berhasil diexport ke CSV!', 'success');
    } catch {
      notify('Gagal mengexport file CSV.', 'error');
    }
  };

  // Overall Class Statistics
  const classStats = useMemo(() => {
    if (students.length === 0) return { avg: 0, highest: 0, targetReached: 0, total: 0 };
    const totalScore = students.reduce((acc, s) => acc + s.avgTryoutScore, 0);
    const avg = Math.round(totalScore / students.length);
    const highest = Math.max(...students.map(s => s.highestTryoutScore));
    const targetReached = students.filter(s => s.avgTryoutScore >= s.passingGrade1).length;
    return { avg, highest, targetReached, total: students.length };
  }, [students]);

  // Handler for direct jump from tryout leaderboard to student evaluation
  const handleSelectStudentForEval = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveMenu('evaluasi');
    const std = students.find(s => s.id === studentId);
    if (std) {
      notify(`Membuka rapor evaluasi ${std.name}`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  ANALISIS & LAPORAN SNBT
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  UTBK-SNBT 2026/2027
                </span>
              </div>

              {/* Mini Countdown Badge in Title Corner */}
              <SnbtMiniCountdownBadge
                onNavigateTab={onNavigateTab}
                size="xs"
              />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Analisis & Laporan SNBT
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Pusat kendali komprehensif evaluasi capaian tryout IRT, analisis pola & penguasaan materi belajar 7 subtes, serta rapor evaluasi kesiapan masuk PTN impian.
            </p>
          </div>

          {/* Quick Action Buttons Header (Icon-only) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenPrint('STUDENT_REPORT')}
              title="Cetak Rapor Siswa (Filter Tabel, Grafik & Analisis)"
              aria-label="Cetak Rapor Siswa"
              className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-rose-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/20"
            >
              <Printer className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              title="Export CSV / Excel"
              aria-label="Export CSV"
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 font-bold shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Cards inside Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400">Total Siswa Terdaftar</span>
            <div className="text-xl font-black text-white mt-0.5">{classStats.total} Siswa</div>
            <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">Kelas XII-UTBK Intensif</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400">Rata-Rata Kelas</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">{classStats.avg} <span className="text-xs font-normal text-slate-400">/ 1000</span></div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Skala IRT Resmi</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400">Skor Tertinggi Tryout</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">{classStats.highest} <span className="text-xs font-normal text-slate-400">/ 1000</span></div>
            <div className="text-[10px] text-amber-300 font-semibold mt-0.5">Performa Terbaik</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400">Lolos Passing Grade #1</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {classStats.targetReached} / {classStats.total}
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
              {Math.round((classStats.targetReached / (classStats.total || 1)) * 100)}% Kesiapan Masuk PTN
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Navigation Bar + Integrated Student Selector Group */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md sticky top-20 z-20" id="snbt-laporan-nav-tabs">
        {/* Navigation Tabs Group */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveMenu('rapor_siswa')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === 'rapor_siswa'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 scale-[1.02] ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-300" />
            <span>RAPOR SISWA</span>
            {currentStudent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/80 text-amber-300 font-mono">
                {currentStudent.name.split(' ')[0]}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('analisis_tryout')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === 'analisis_tryout'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-300" />
            <span>ANALISIS TRYOUT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('analisis_belajar')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === 'analisis_belajar'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>ANALISIS BELAJAR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('evaluasi')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === 'evaluasi'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>EVALUASI</span>
          </button>
        </div>

        {/* Student Selector Group (Grouped with RAPOR SISWA menu bar) */}
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 rounded-xl px-3 py-1.5 shrink-0 self-end lg:self-auto">
          {currentStudent && (
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-7 h-7 rounded-full object-cover border border-indigo-500/50 shrink-0"
            />
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
              Pilih Siswa:
            </span>
            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[210px] sm:max-w-[260px] truncate"
            >
              {students.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  #{idx + 1} {s.name} ({s.avgTryoutScore} IRT)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MENU 0: RAPOR SISWA AKTIF (TABEL & GRAFIK) */}
      {/* ========================================================================= */}
      {activeMenu === 'rapor_siswa' && currentStudent && (
        <SnbtActiveStudentReport
          user={user}
          student={currentStudent}
          allStudents={students}
          onSelectStudent={handleSelectStudent}
          onOpenPrint={handleOpenPrint}
          onExportCsv={handleExportCsv}
        />
      )}

      {/* ========================================================================= */}
      {/* MENU 1: ANALISIS TRYOUT */}
      {/* ========================================================================= */}
      {activeMenu === 'analisis_tryout' && (
        <SnbtAnalisisTryout
          user={user}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
          onSelectStudentForEval={handleSelectStudentForEval}
          onOpenPrint={handleOpenPrint}
          onExportCsv={handleExportCsv}
          onNavigateTab={onNavigateTab}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MENU 2: ANALISIS BELAJAR */}
      {/* ========================================================================= */}
      {activeMenu === 'analisis_belajar' && (
        <SnbtAnalisisBelajar
          user={user}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
          onNavigateTab={onNavigateTab}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MENU 3: EVALUASI */}
      {/* ========================================================================= */}
      {activeMenu === 'evaluasi' && (
        <SnbtEvaluasi
          user={user}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={handleSelectStudent}
          onUpdateStudents={(updated) => setStudents(updated)}
          onOpenPrint={handleOpenPrint}
          onExportCsv={handleExportCsv}
          onNavigateTab={onNavigateTab}
          onShowToast={onShowToast}
        />
      )}

      {/* Printable Report Modal */}
      {currentStudent && (
        <SnbtPrintReportModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={currentStudent}
          allStudents={students}
          printMode={printMode}
          onSelectStudent={(id) => setSelectedStudentId(id)}
        />
      )}
    </div>
  );
};
