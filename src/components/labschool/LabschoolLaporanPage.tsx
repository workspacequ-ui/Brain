import React, { useState, useMemo, useEffect } from 'react';
import { User, SidebarTab } from '../../types';
import { getUserLabschoolLevel } from '../../utils/labschoolHelpers';
import { LabschoolTryoutAnalysis } from './LabschoolTryoutAnalysis';
import { LabschoolQuizAnalysis } from './LabschoolQuizAnalysis';
import { LabschoolBelajarAnalysis } from './LabschoolBelajarAnalysis';
import { LabschoolPrintReportModal, PrintReportType } from './LabschoolPrintReportModal';
import {
  DEFAULT_LAB_TRYOUTS,
  DEFAULT_LABSCHOOL_ACTIVE_STUDENTS,
  getActiveStudentsByLevel,
  LabschoolActiveStudent,
  loadStoredTryoutResults,
  StudentTryoutResult
} from './labschoolLaporanData';
import {
  BarChart3,
  Trophy,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building2,
  Printer,
  Eye,
  SlidersHorizontal,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';

interface LabschoolLaporanPageProps {
  user: User;
  onNavigateTab?: (tab: SidebarTab) => void;
}

export type LaporanSubTab = 'tryout' | 'quiz' | 'belajar';

export const LabschoolLaporanPage: React.FC<LabschoolLaporanPageProps> = ({
  user,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<LaporanSubTab>('tryout');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalType, setPrintModalType] = useState<PrintReportType>('ALL');

  // Role check: Master Jenjang & Siswa Aktif filters only show for Admin & Guru Labschool
  const isStaff = user.role === 'admin' || user.role === 'teacher';

  // Centralized Master State: Jenjang ('SMP' | 'SMA') defaulted according to user's class
  const studentLevel = useMemo(() => {
    const lvl = getUserLabschoolLevel(user);
    return lvl === 'SMP' ? 'SMP' : 'SMA';
  }, [user]);

  const [selectedJenjang, setSelectedJenjang] = useState<'SMP' | 'SMA'>(studentLevel);

  useEffect(() => {
    if (user.role === 'student') {
      setSelectedJenjang(studentLevel);
    }
  }, [user.role, studentLevel]);

  // Tryout and Student Results dataset
  const tryouts = DEFAULT_LAB_TRYOUTS;
  const [tryoutResults] = useState<StudentTryoutResult[]>(() => loadStoredTryoutResults());

  // Active students list filtered by the chosen Jenjang
  const activeStudentsInJenjang = useMemo(() => {
    return getActiveStudentsByLevel(selectedJenjang);
  }, [selectedJenjang]);

  // Selected Student ID State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    user.role === 'student' ? user.id || 'u-s1' : 'u-s1'
  );

  // Selected Tryout ID State (Default to latest tryout of default student)
  const [selectedTryoutId, setSelectedTryoutId] = useState<string>('to-lab-sma-5');

  // Current active student profile object
  const activeStudentProfile = useMemo(() => {
    const found = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.find(s => s.id === selectedStudentId);
    if (found) return found;
    return activeStudentsInJenjang[0] || DEFAULT_LABSCHOOL_ACTIVE_STUDENTS[0];
  }, [selectedStudentId, activeStudentsInJenjang]);

  // Handle Jenjang Change (SMP-LABS vs SMA-LABS)
  const handleJenjangChange = (jenjang: 'SMP' | 'SMA') => {
    setSelectedJenjang(jenjang);
    const students = getActiveStudentsByLevel(jenjang);
    if (students.length > 0) {
      const firstStudent = students[0];
      setSelectedStudentId(firstStudent.id);

      // Find all tryouts completed by this student and pick the latest
      const studentTos = tryoutResults.filter(r => r.studentId === firstStudent.id);
      if (studentTos.length > 0) {
        const sortedTos = [...studentTos].sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setSelectedTryoutId(sortedTos[0].tryoutId);
      } else {
        const defaultTo = tryouts.find(t => t.level === jenjang);
        if (defaultTo) setSelectedTryoutId(defaultTo.id);
      }
      showToast(`Jenjang beralih ke ${jenjang}-LABS • Siswa Aktif: ${firstStudent.name}`, 'info');
    }
  };

  // Handle selecting a specific active student
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const chosenStudent = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.find(s => s.id === studentId);
    
    // Auto sync to student's latest tryout
    const studentTos = tryoutResults.filter(r => r.studentId === studentId);
    if (studentTos.length > 0) {
      const sortedTos = [...studentTos].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setSelectedTryoutId(sortedTos[0].tryoutId);
    }

    if (chosenStudent) {
      showToast(`Memantau Siswa Aktif: ${chosenStudent.name} (${chosenStudent.className})`, 'success');
    }
  };

  // Synchronized active student and tryout result
  const currentStudentResult = useMemo(() => {
    let match = tryoutResults.find(
      r => r.tryoutId === selectedTryoutId && (r.studentId === selectedStudentId || (user.role === 'student' && r.studentName.toLowerCase().includes(user.name.toLowerCase())))
    );
    if (!match && tryoutResults.length > 0) {
      match = tryoutResults.find(r => r.studentId === selectedStudentId) || tryoutResults[0];
    }
    return match || tryoutResults[0];
  }, [tryoutResults, selectedTryoutId, selectedStudentId, user]);

  const effectiveStudentName = activeStudentProfile?.name || currentStudentResult?.studentName || (user.role === 'student' ? user.name : 'Budi Santoso');
  const effectiveStudentNis = activeStudentProfile?.nis || currentStudentResult?.studentNis || (user.role === 'student' ? user.nis : '20261001');
  const effectiveLevel = selectedJenjang;
  const effectiveTargetCampus = activeStudentProfile?.targetCampusName || currentStudentResult?.targetCampusName || (effectiveLevel === 'SMP' ? 'SMP Labschool Kebayoran' : 'SMA Labschool Kebayoran');
  const effectiveTryoutScore = currentStudentResult?.totalScore || activeStudentProfile?.latestScore || 88.5;

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenPrint = (type?: PrintReportType) => {
    const selectedType: PrintReportType = type || (activeSubTab === 'tryout' ? 'TRYOUT' : activeSubTab === 'quiz' ? 'QUIZ' : 'JOURNAL');
    setPrintModalType(selectedType);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                : 'bg-blue-950/90 text-blue-300 border-blue-500/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-5 sm:p-6 lg:p-7 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                PSB LABSCHOOL 2026/2027
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
                Laporan & Analisis Komprehensif
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Laporan & Analisis Pembelajaran Labschool
            </h1>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
            {/* 1. Icon Pratinjau Laporan */}
            <button
              type="button"
              id="btn-pratinjau-laporan-labschool"
              onClick={() => handleOpenPrint()}
              className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 group relative"
              title="Pratinjau Lembar Rapor Laporan"
              aria-label="Pratinjau Lembar Rapor Laporan"
            >
              <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* 2. Icon Cetak Laporan (Printer) */}
            <button
              type="button"
              id="btn-cetak-laporan-labschool"
              onClick={() => handleOpenPrint('ALL')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95 group relative"
              title="Cetak Laporan Rapor Resmi Labschool"
              aria-label="Cetak Laporan Rapor Resmi Labschool"
            >
              <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* 3. Icon 5 Kampus Labschool */}
            {onNavigateTab && (
              <button
                type="button"
                id="btn-navigasi-5-kampus"
                onClick={() => onNavigateTab('labschool_kampus')}
                className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-700/80 hover:border-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 group relative"
                title="Profil & Passing Grade 5 Kampus Labschool"
                aria-label="Profil 5 Kampus Labschool"
              >
                <Building2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MASTER CONTROL BAR: JENJANG (SMP-LABS / SMA-LABS) & SISWA AKTIF           */}
      {/* TAMPIL KHUSUS PANEL ADMIN DAN GURU LABSCHOOL                              */}
      {/* ========================================================================= */}
      {isStaff ? (
        <div className="bg-slate-900/95 border-2 border-blue-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* 1. Menu Jenjang (SMP-LABS / SMA-LABS) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Pilih Jenjang Labschool</span>
              </div>
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  id="btn-jenjang-sma-labs"
                  onClick={() => handleJenjangChange('SMA')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                    selectedJenjang === 'SMA'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-cyan-300" />
                  <span>SMA-LABS</span>
                </button>

                <button
                  type="button"
                  id="btn-jenjang-smp-labs"
                  onClick={() => handleJenjangChange('SMP')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                    selectedJenjang === 'SMP'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-300" />
                  <span>SMP-LABS</span>
                </button>
              </div>
            </div>

            {/* 2. Pilihan Siswa Aktif (Dropdown Terintegrasi dengan Jenjang) */}
            <div className="flex-1 max-w-xl space-y-1.5">
              <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Siswa Aktif (Pantau Riwayat & Progres Belajar)</span>
              </div>
              <div className="relative">
                <select
                  id="select-siswa-aktif-labschool"
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-amber-500/40 hover:border-amber-400 focus:border-amber-400 text-slate-100 font-bold text-xs sm:text-sm rounded-2xl px-4 py-2.5 shadow-inner focus:outline-none cursor-pointer appearance-none pr-10"
                >
                  {activeStudentsInJenjang.map(student => (
                    <option key={student.id} value={student.id} className="bg-slate-900 text-slate-100 py-1">
                      {student.name} • NIS: {student.nis} ({student.className}) — Target: {student.targetCampusName} ({student.tryoutCount} TO Diikuti)
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400 font-bold">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* 3. Live Active Student Monitoring Summary Strip */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeStudentProfile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}
                alt={activeStudentProfile.name}
                className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover shrink-0"
              />
              <div className="space-y-1 min-w-0">
                {/* Nama Siswa */}
                <div className="font-extrabold text-white text-sm sm:text-base leading-tight truncate">
                  {activeStudentProfile.name}
                </div>

                {/* Informasi & Metadata Diletakkan di Bawah Nama Siswa */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                    NIS: {activeStudentProfile.nis}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                    {activeStudentProfile.className}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap shadow-xs">
                    <span className="text-amber-400 font-medium">Target:</span>
                    <span className="text-white font-bold">{activeStudentProfile.targetCampusName}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                    Riwayat: {activeStudentProfile.tryoutCount} Sesi TO
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Skor Terakhir</div>
                <div className="text-sm sm:text-base font-black text-emerald-400 leading-none mt-0.5">
                  {currentStudentResult?.totalScore || activeStudentProfile.latestScore} <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">/ 100</span>
                </div>
              </div>
              <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300 text-right">
                <div className="text-[9px] sm:text-[10px] text-blue-400/80 font-medium">Status Target</div>
                <div className="text-[10.5px] sm:text-xs font-black text-blue-300 leading-none mt-0.5">
                  {(currentStudentResult?.totalScore || activeStudentProfile.latestScore) >= 86.0 ? '✓ LOLOS PG' : 'KOMPETITIF'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Siswa view: Clean monitoring badge */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{user.name}</div>
              <div className="text-slate-400 text-[11px]">NIS: {user.nis || '20261001'} • Kelas: {effectiveLevel}-LABS • Target: {effectiveTargetCampus}</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            Siswa Terdaftar
          </span>
        </div>
      )}

      {/* Main 3 Sub-Tabs Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-stretch gap-1.5">
        {/* Tab 1: Analisis Tryout */}
        <button
          type="button"
          onClick={() => setActiveSubTab('tryout')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeSubTab === 'tryout'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>1. ANALISIS TRYOUT</span>
        </button>

        {/* Tab 2: Analisis Quiz */}
        <button
          type="button"
          onClick={() => setActiveSubTab('quiz')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeSubTab === 'quiz'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>2. ANALISIS QUIZ</span>
        </button>

        {/* Tab 3: Analisis Belajar & WA Generator */}
        <button
          type="button"
          onClick={() => setActiveSubTab('belajar')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeSubTab === 'belajar'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>3. ANALISIS BELAJAR</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeSubTab === 'tryout' && (
          <LabschoolTryoutAnalysis
            user={user}
            onShowToast={showToast}
            selectedJenjang={selectedJenjang}
            selectedTryoutId={selectedTryoutId}
            onSelectTryoutId={setSelectedTryoutId}
            selectedStudentId={selectedStudentId}
            onSelectStudentId={setSelectedStudentId}
            onOpenPrintModal={(type) => handleOpenPrint(type || 'TRYOUT')}
          />
        )}

        {activeSubTab === 'quiz' && (
          <LabschoolQuizAnalysis
            user={user}
            onShowToast={showToast}
            selectedStudentId={selectedStudentId}
            selectedStudentName={effectiveStudentName}
            selectedStudentNis={effectiveStudentNis}
            selectedLevel={effectiveLevel}
            onOpenPrintModal={(type) => handleOpenPrint(type || 'QUIZ')}
          />
        )}

        {activeSubTab === 'belajar' && (
          <LabschoolBelajarAnalysis
            user={user}
            onShowToast={showToast}
            selectedStudentId={selectedStudentId}
            selectedStudentName={effectiveStudentName}
            selectedStudentNis={effectiveStudentNis}
            selectedLevel={effectiveLevel}
            selectedTargetCampusName={effectiveTargetCampus}
            latestTryoutScore={effectiveTryoutScore}
            onOpenPrintModal={(type) => handleOpenPrint(type || 'JOURNAL')}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL CETAK & PRATINJAU LAPORAN RESMI LABSCHOOL                            */}
      {/* ========================================================================= */}
      <LabschoolPrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        user={user}
        initialReportType={printModalType}
        initialTryoutId={selectedTryoutId}
        initialStudentId={selectedStudentId}
        initialStudentName={effectiveStudentName}
        initialStudentNis={effectiveStudentNis}
        initialStudentLevel={effectiveLevel}
        initialCampusName={effectiveTargetCampus}
        initialResult={currentStudentResult}
        onShowToast={showToast}
      />
    </div>
  );
};

