import React, { useState, useMemo } from 'react';
import { User, InstitutionInfo } from '../../types';
import { SnbtStudentProfile } from './snbtData';
import {
  SnbtLearningJournalEntry,
  SNBT_ACTIVITY_TYPE_METAS,
  SNBT_COMPREHENSION_METAS,
  calculateStudentJournalSummary,
  formatSnbtJournalWhatsAppMessage
} from './snbtJournalData';
import {
  INITIAL_SNBT_SYLLABUS_MODULES,
  SNBT_7_SUBTEST_METAS,
  SnbtSubtestCode
} from './snbtSyllabusData';
import { OfficialKopSurat } from '../common/OfficialKopSurat';
import { getAppSettings } from '../../utils/storage';
import {
  Printer,
  X,
  BookOpen,
  Calendar,
  Clock,
  User as UserIcon,
  Users,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Zap,
  Award,
  Layers,
  FileText,
  Share2,
  Check,
  Download,
  Filter,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckSquare,
  Square,
  GraduationCap,
  Building2,
  ChevronDown,
  ExternalLink,
  Target,
  Flame,
  Activity,
  QrCode
} from 'lucide-react';

export type JournalPreviewViewMode = 'SINGLE_SESSION' | 'STUDENT_CUMULATIVE' | 'TEACHER_CLASS_LOG';

interface SnbtTeachingJournalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: SnbtLearningJournalEntry[];
  students: SnbtStudentProfile[];
  selectedStudentId?: string;
  selectedJournalId?: string;
  initialViewMode?: JournalPreviewViewMode;
  onSelectStudent?: (studentId: string) => void;
  user?: User;
  institution?: InstitutionInfo;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export interface JournalPreviewFilterOptions {
  showKopSurat: boolean;
  showBiodata: boolean;
  showStatisticsCards: boolean;
  showSubtestMatrix: boolean;
  showDrillDetails: boolean;
  showReflectionAndFeedback: boolean;
  showSignatures: boolean;
  showQrVerification: boolean;
}

const DEFAULT_FILTERS: JournalPreviewFilterOptions = {
  showKopSurat: true,
  showBiodata: true,
  showStatisticsCards: true,
  showSubtestMatrix: true,
  showDrillDetails: true,
  showReflectionAndFeedback: true,
  showSignatures: true,
  showQrVerification: true
};

export const SnbtTeachingJournalPreviewModal: React.FC<SnbtTeachingJournalPreviewModalProps> = ({
  isOpen,
  onClose,
  journals,
  students,
  selectedStudentId,
  selectedJournalId,
  initialViewMode,
  onSelectStudent,
  user,
  institution,
  onShowToast
}) => {
  if (!isOpen) return null;

  // View Mode
  const [viewMode, setViewMode] = useState<JournalPreviewViewMode>(() => {
    if (initialViewMode) return initialViewMode;
    return selectedJournalId ? 'SINGLE_SESSION' : 'STUDENT_CUMULATIVE';
  });

  // Current selected student
  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    if (selectedStudentId) return selectedStudentId;
    if (students.length > 0) return students[0].id;
    return 'snbt-std-01';
  });

  // Current selected journal entry for Single Session View
  const [activeJournalId, setActiveJournalId] = useState<string>(() => {
    if (selectedJournalId) return selectedJournalId;
    const matchStudentJournals = journals.filter(j => j.studentId === (selectedStudentId || 'snbt-std-01'));
    if (matchStudentJournals.length > 0) return matchStudentJournals[0].id;
    return journals[0]?.id || '';
  });

  // Subtest Filter
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState<string>('ALL');

  // Display Customization Filters
  const [filterOptions, setFilterOptions] = useState<JournalPreviewFilterOptions>(DEFAULT_FILTERS);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Zoom Level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // WhatsApp Copied Feedback
  const [isCopiedWa, setIsCopiedWa] = useState<boolean>(false);

  // App settings for Kop Surat
  const appSettings = getAppSettings();
  const kopSettings = appSettings.kopSurat;
  const effectiveInstitution = institution || appSettings.institution;

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onShowToast) {
      onShowToast(msg, type);
    }
  };

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Student journals
  const studentJournals = useMemo(() => {
    return journals.filter(j => j.studentId === activeStudentId);
  }, [journals, activeStudentId]);

  // Filtered journals for the current view
  const displayJournals = useMemo(() => {
    let list = viewMode === 'TEACHER_CLASS_LOG' ? journals : studentJournals;
    if (selectedSubtestFilter !== 'ALL') {
      list = list.filter(j => j.subtestCode === selectedSubtestFilter || j.category === selectedSubtestFilter);
    }
    return list;
  }, [journals, studentJournals, viewMode, selectedSubtestFilter]);

  // Active single journal entry
  const activeJournal = useMemo(() => {
    return journals.find(j => j.id === activeJournalId) || displayJournals[0] || journals[0];
  }, [journals, activeJournalId, displayJournals]);

  // Student summary calculations
  const studentSummary = useMemo(() => {
    return calculateStudentJournalSummary(
      activeStudentId,
      journals,
      INITIAL_SNBT_SYLLABUS_MODULES
    );
  }, [activeStudentId, journals]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy WhatsApp
  const handleCopyWhatsApp = () => {
    if (!activeJournal) return;
    const text = formatSnbtJournalWhatsAppMessage(activeJournal, activeStudent || undefined);
    navigator.clipboard.writeText(text);
    setIsCopiedWa(true);
    notify('Laporan Jurnal Belajar berhasil disalin ke format WhatsApp!', 'success');
    setTimeout(() => {
      setIsCopiedWa(false);
    }, 3000);
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    try {
      const headers = [
        'No',
        'Pertemuan',
        'Tanggal',
        'Waktu',
        'Durasi (Menit)',
        'NIS',
        'Nama Siswa',
        'Subtes',
        'Kode Modul',
        'Judul Modul / Topik',
        'Aktivitas Belajar',
        'Guru Pengampu',
        'Kehadiran',
        'Pemahaman (%)',
        'Level Pemahaman',
        'Drill Benar',
        'Drill Total',
        'Akurasi (%)',
        'Status Tugas',
        'Dampak IRT',
        'Refleksi Siswa',
        'Rekomendasi Guru'
      ];

      const rows = displayJournals.map((j, idx) => [
        idx + 1,
        `"P-${j.meetingNumber}"`,
        `"${j.date}"`,
        `"${j.timeStart} - ${j.timeEnd}"`,
        j.durationMinutes,
        `"${j.nis}"`,
        `"${j.studentName}"`,
        `"${j.subtestCode} - ${j.subtestName}"`,
        `"${j.moduleCode || '-'}"`,
        `"${(j.moduleTitle || j.syllabusTitle).replace(/"/g, '""')}"`,
        `"${j.learningActivityType}"`,
        `"${j.instructorName}"`,
        `"${j.attendanceStatus}"`,
        j.comprehensionPercentage,
        `"${j.comprehensionLevel}"`,
        j.practiceQuestionsCorrect,
        j.practiceQuestionsCount,
        j.practiceAccuracy,
        `"${j.homeworkStatus}"`,
        `"${j.targetIrtImpact}"`,
        `"${(j.studentReflectionNotes || '').replace(/"/g, '""')}"`,
        `"${(j.tutorFeedback || '').replace(/"/g, '""')}"`
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Jurnal_Mengajar_SNBT_${activeStudent?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify('Rekap Jurnal Mengajar berhasil diunduh dalam format CSV!', 'success');
    } catch {
      notify('Gagal mengunduh file CSV.', 'error');
    }
  };

  const toggleFilter = (key: keyof JournalPreviewFilterOptions) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static"
      id="snbt-teaching-journal-modal"
    >
      {/* ========================================================================= */}
      {/* TOP CONTROL BAR (HIDDEN IN PRINT) */}
      {/* ========================================================================= */}
      <div className="fixed top-3 left-3 right-3 z-50 flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md print:hidden">
        {/* Left: Title & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Pratinjau Jurnal Mengajar SNBT</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Format A4 Resmi
                </span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Buku Jurnal Pembelajaran & Evaluasi IRT
              </span>
            </div>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('SINGLE_SESSION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'SINGLE_SESSION'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sesi Tunggal</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('STUDENT_CUMULATIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'STUDENT_CUMULATIVE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Siswa Lengkap</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TEACHER_CLASS_LOG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'TEACHER_CLASS_LOG'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Agenda Guru / Kelas</span>
            </button>
          </div>
        </div>

        {/* Center: Context Dropdowns (Student & Meeting selection) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Student Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <UserIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={activeStudentId}
              onChange={e => {
                const newId = e.target.value;
                setActiveStudentId(newId);
                if (onSelectStudent) onSelectStudent(newId);
                const sJournals = journals.filter(j => j.studentId === newId);
                if (sJournals.length > 0) setActiveJournalId(sJournals[0].id);
              }}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              {students.map(std => (
                <option key={std.id} value={std.id} className="bg-slate-900 text-white">
                  {std.name} ({std.nis})
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Selector (When in Single Session Mode) */}
          {viewMode === 'SINGLE_SESSION' && (
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={activeJournalId}
                onChange={e => setActiveJournalId(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-1"
              >
                {studentJournals.map(jrn => (
                  <option key={jrn.id} value={jrn.id} className="bg-slate-900 text-white">
                    P-{jrn.meetingNumber} ({jrn.subtestCode}) - {jrn.date}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subtest Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSubtestFilter}
              onChange={e => setSelectedSubtestFilter(e.target.value)}
              className="bg-transparent text-slate-300 font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua 7 Subtes</option>
              {SNBT_7_SUBTEST_METAS.map(s => (
                <option key={s.code} value={s.code} className="bg-slate-900 text-white">
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Customization, Print, WA, CSV, Close */}
        <div className="flex items-center gap-2">
          {/* Customization Options Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showFilterDrawer
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
              }`}
              title="Atur Bagian Dokumen yang Ditampilkan"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kustomisasi</span>
            </button>

            {/* Filter Drawer Popover */}
            {showFilterDrawer && (
              <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-black text-white text-xs">Pengaturan Tampilan Cetak</span>
                  <button
                    type="button"
                    onClick={() => setShowFilterDrawer(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Kop Lembaga Resmi</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showKopSurat}
                    onChange={() => toggleFilter('showKopSurat')}
                    className="accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Biodata Siswa & Guru</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showBiodata}
                    onChange={() => toggleFilter('showBiodata')}
                    className="accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Kartu Statistik & Progres</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showStatisticsCards}
                    onChange={() => toggleFilter('showStatisticsCards')}
                    className="accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Matriks Capaian 7 Subtes</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showSubtestMatrix}
                    onChange={() => toggleFilter('showSubtestMatrix')}
                    className="accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Drill Soal & Akurasi</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showDrillDetails}
                    onChange={() => toggleFilter('showDrillDetails')}
                    className="accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Refleksi & Rekomendasi Guru</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showReflectionAndFeedback}
                    onChange={() => toggleFilter('showReflectionAndFeedback')}
                    className="accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between py-1 text-slate-300 hover:text-white cursor-pointer">
                  <span>Kolom Tanda Tangan & QR</span>
                  <input
                    type="checkbox"
                    checked={filterOptions.showSignatures}
                    onChange={() => toggleFilter('showSignatures')}
                    className="accent-indigo-600 rounded"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-9 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(125, prev + 10))}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Download CSV Rekapitulasi Jurnal"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* WhatsApp Share Button */}
          {viewMode === 'SINGLE_SESSION' && (
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCopiedWa
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30'
              }`}
              title="Salin Pesan Format WhatsApp untuk Wali Siswa"
            >
              {isCopiedWa ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopiedWa ? 'Tersalin' : 'WA Laporan'}</span>
            </button>
          )}

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Tutup Pratinjau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spacer for Top Control Bar */}
      <div className="h-16 print:hidden w-full" />

      {/* ========================================================================= */}
      {/* PRINTABLE A4 DOCUMENT SHEET CONTAINER */}
      {/* ========================================================================= */}
      <div
        className="w-full flex justify-center py-6 px-2 sm:px-4 print:p-0 print:py-0"
        style={{
          transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
          transformOrigin: 'top center'
        }}
      >
        <div
          className="bg-white text-slate-900 w-full max-w-4xl p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:rounded-none my-4"
          id="printable-journal-sheet"
        >
          {/* ===================================================================== */}
          {/* 1. KOP SURAT RESMI */}
          {/* ===================================================================== */}
          {filterOptions.showKopSurat && (
            <div className="pb-3 mb-5 border-b-2 border-slate-900">
              <OfficialKopSurat
                kopSettings={kopSettings}
                institution={effectiveInstitution}
                documentTitle="PUSAT EVALUASI & AKADEMIK UTBK-SNBT 2026"
                documentSubtitle="BUKU JURNAL MENGAJAR & REKAP KEMAJUAN BELAJAR TERSTANDAR IRT"
                documentBadge="DOKUMEN RESMI AKADEMIK"
                documentId={`JRN-SNBT-2026-${activeStudent?.nis || 'STD'}`}
              />
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. DOKUMEN HEADER & NOMOR REGISTRASI */}
          {/* ===================================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-300">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase font-mono block">
                {viewMode === 'SINGLE_SESSION'
                  ? 'LEMBAR JURNAL BELAJAR SESI MENGAJAR'
                  : viewMode === 'STUDENT_CUMULATIVE'
                  ? 'REKAPITULASI BUKU JURNAL BELAJAR SISWA'
                  : 'AGENDA JURNAL MENGAJAR GURU & REKAP KELAS'}
              </span>
              <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                {viewMode === 'SINGLE_SESSION'
                  ? `Jurnal Sesi Pertemuan #${activeJournal?.meetingNumber || 1}: ${activeJournal?.subtestCode || 'PK'} - ${activeJournal?.subtestName || 'Pengetahuan Kuantitatif'}`
                  : `Buku Jurnal Belajar Lengkap: ${activeStudent?.name || 'Siswa SNBT'}`}
              </h1>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono font-bold text-slate-800">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>NO. REG: JRN/SNBT/2026/{activeStudent?.nis || '001'}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Diterbitkan: {currentDateFormatted}
              </span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. BIODATA SISWA & TARGET PTN */}
          {/* ===================================================================== */}
          {filterOptions.showBiodata && activeStudent && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Nama Siswa:</span>
                <strong className="text-slate-950 font-black text-sm block truncate">
                  {activeStudent.name}
                </strong>
                <span className="text-[10px] text-slate-600 font-mono">NIS: {activeStudent.nis}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Kelas & Sekolah:</span>
                <strong className="text-slate-900 font-bold block">{activeStudent.group}</strong>
                <span className="text-[10px] text-slate-600 truncate block">{activeStudent.schoolOrigin}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target PTN Pilihan 1:</span>
                <strong className="text-indigo-700 font-black block truncate">
                  {activeStudent.targetPtn1}
                </strong>
                <span className="text-[10px] text-slate-600">
                  {activeStudent.prodi1} (PG: {activeStudent.passingGrade1})
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Capaian Tryout Terkini:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-slate-950 font-mono">
                    {activeStudent.avgTryoutScore}
                  </span>
                  <span className="text-[10px] text-slate-500">(Rata-rata)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">
                  Tertinggi: {activeStudent.highestTryoutScore} Poin
                </span>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. MODE 1: SINGLE SESSION LESSON JOURNAL DETAIL */}
          {/* ===================================================================== */}
          {viewMode === 'SINGLE_SESSION' && activeJournal && (
            <div className="space-y-6">
              {/* Session Overview Grid */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    I. PARAMETER & IDENTITAS SESI MENGAJAR
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300 font-mono">
                    PERTEMUAN KE-{activeJournal.meetingNumber}
                  </span>
                </div>

                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Hari / Tanggal:</span>
                    <strong className="text-slate-950 font-bold">{activeJournal.date}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Waktu Sesi:</span>
                    <strong className="text-slate-950 font-bold">
                      {activeJournal.timeStart} - {activeJournal.timeEnd} WIB
                    </strong>
                    <span className="text-[10px] text-slate-500 block">({activeJournal.durationMinutes} Menit)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Guru / Tutor Pengampu:</span>
                    <strong className="text-slate-950 font-bold">{activeJournal.instructorName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Status Kehadiran Siswa:</span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-0.5">
                      {activeJournal.attendanceStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module & Subtopics Section */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    II. SUBTES, MODUL SILABUS & CAKUPAN POKOK BAHASAN
                  </span>
                </div>

                <div className="p-4 space-y-4 bg-white text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white font-mono">
                          {activeJournal.subtestCode}
                        </span>
                        <span className="font-bold text-slate-900">{activeJournal.subtestName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({activeJournal.category})</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-950 mt-1">
                        {activeJournal.moduleCode ? `[${activeJournal.moduleCode}] ` : ''}
                        {activeJournal.moduleTitle || activeJournal.syllabusTitle}
                      </h4>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Metode Belajar:</span>
                      <span className="text-xs font-bold text-indigo-700">
                        {SNBT_ACTIVITY_TYPE_METAS[activeJournal.learningActivityType]?.label || activeJournal.learningActivityType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Rincian Subtopik & Konsep yang Dibahas:
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {activeJournal.subtopicsCovered.map((sub, idx) => (
                        <li key={idx} className="text-xs text-slate-800 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comprehension & Drill Performance Section */}
              {filterOptions.showDrillDetails && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      III. DIAGNOSTIK PEMAHAMAN & EVALUASI DRILL SOAL
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Tingkat Pemahaman Konsep
                      </span>
                      <span className="text-xl font-black text-indigo-700 font-mono block">
                        {activeJournal.comprehensionPercentage}%
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {SNBT_COMPREHENSION_METAS[activeJournal.comprehensionLevel]?.label || activeJournal.comprehensionLevel}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Hasil Drill Soal Latihan
                      </span>
                      <span className="text-xl font-black text-amber-700 font-mono block">
                        {activeJournal.practiceQuestionsCorrect} / {activeJournal.practiceQuestionsCount} Butir
                      </span>
                      <span className="text-[10px] font-bold text-amber-900 block">
                        Akurasi Drill: {activeJournal.practiceAccuracy}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Proyeksi Dampak Skor IRT
                      </span>
                      <span className="text-base font-black text-emerald-700 block mt-1">
                        {activeJournal.targetIrtImpact}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Status Tugas: <strong>{activeJournal.homeworkStatus}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reflection & Tutor Recommendation Box */}
              {filterOptions.showReflectionAndFeedback && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      IV. REFLEKSI SISWA & REKOMENDASI TUTOR
                    </span>
                  </div>

                  <div className="p-4 space-y-3 bg-white text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Catatan Refleksi & Kendala Belajar Siswa:
                      </span>
                      <p className="text-slate-800 italic leading-relaxed">
                        "{activeJournal.studentReflectionNotes}"
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
                      <span className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">
                        Rekomendasi & Tindak Lanjut Guru ({activeJournal.instructorName}):
                      </span>
                      <p className="text-slate-900 leading-relaxed font-medium">
                        "{activeJournal.tutorFeedback}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* 5. MODE 2: STUDENT CUMULATIVE JOURNAL LEDGER */}
          {/* ===================================================================== */}
          {viewMode === 'STUDENT_CUMULATIVE' && (
            <div className="space-y-6">
              {/* Cumulative Statistical Cards */}
              {filterOptions.showStatisticsCards && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Sesi Jurnal</span>
                    <strong className="text-xl font-black text-indigo-700 font-mono block mt-0.5">
                      {studentSummary.totalEntries} Sesi
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">({studentSummary.totalStudyHours} Jam Belajar)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Rerata Pemahaman</span>
                    <strong className="text-xl font-black text-emerald-700 font-mono block mt-0.5">
                      {studentSummary.avgComprehension}%
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">Kategori Sangat Paham</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Akurasi Drill Soal</span>
                    <strong className="text-xl font-black text-amber-700 font-mono block mt-0.5">
                      {studentSummary.avgAccuracy}%
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({studentSummary.totalCorrect}/{studentSummary.totalQuestions} Soal Benar)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Ketercapaian Modul</span>
                    <strong className="text-xl font-black text-purple-700 font-mono block mt-0.5">
                      {studentSummary.completedModulesCount} / {INITIAL_SNBT_SYLLABUS_MODULES.length}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {studentSummary.coveragePercent}% Silabus Selesai
                    </span>
                  </div>
                </div>
              )}

              {/* 7 Subtests Matrix Table */}
              {filterOptions.showSubtestMatrix && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      I. MATRIKS PROGRES 7 SUBTES UTBK-SNBT
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Subtes SNBT</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Jml Sesi</th>
                        <th className="py-2.5 px-3 text-center">Rerata Pemahaman</th>
                        <th className="py-2.5 px-3 text-center">Akurasi Drill</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {SNBT_7_SUBTEST_METAS.map(sub => {
                        const subJournals = studentJournals.filter(j => j.subtestCode === sub.code);
                        const count = subJournals.length;
                        const avgComp =
                          count > 0
                            ? Math.round(subJournals.reduce((acc, j) => acc + j.comprehensionPercentage, 0) / count)
                            : 85;
                        const totQ = subJournals.reduce((acc, j) => acc + (j.practiceQuestionsCount || 0), 0);
                        const corQ = subJournals.reduce((acc, j) => acc + (j.practiceQuestionsCorrect || 0), 0);
                        const accPercent = totQ > 0 ? Math.round((corQ / totQ) * 100) : 88;

                        return (
                          <tr key={sub.code} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-indigo-700">{sub.code}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{sub.name}</td>
                            <td className="py-2 px-3 text-slate-600">{sub.categoryBadge}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold">{count} Sesi</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-indigo-700">
                              {avgComp}%
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-amber-700">
                              {accPercent}% ({corQ}/{totQ})
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                Sesuai Target
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Chronological All Sessions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    II. BUKU REKAPITULASI SESI BELAJAR LENGKAP ({displayJournals.length} ENTRI)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Kronologis Terbaru</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Sesi / Tgl</th>
                        <th className="py-2.5 px-3">Subtes & Modul</th>
                        <th className="py-2.5 px-3">Subtopik / Pokok Bahasan</th>
                        <th className="py-2.5 px-3">Guru Pengampu</th>
                        <th className="py-2.5 px-3 text-center">Pemahaman</th>
                        <th className="py-2.5 px-3 text-center">Drill</th>
                        <th className="py-2.5 px-3">Catatan Tutor & Dampak IRT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {displayJournals.map(jrn => (
                        <tr key={jrn.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-indigo-700 block">P-{jrn.meetingNumber}</span>
                            <span className="text-[10px] text-slate-500">{jrn.date}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 font-mono mr-1">
                              {jrn.subtestCode}
                            </span>
                            <strong className="text-slate-900 text-xs block mt-0.5">
                              {jrn.moduleTitle || jrn.syllabusTitle}
                            </strong>
                          </td>

                          <td className="py-2.5 px-3">
                            <ul className="text-[11px] text-slate-700 space-y-0.5 max-w-xs">
                              {jrn.subtopicsCovered.slice(0, 2).map((sub, sIdx) => (
                                <li key={sIdx} className="truncate">• {sub}</li>
                              ))}
                              {jrn.subtopicsCovered.length > 2 && (
                                <li className="text-[10px] text-indigo-600 font-medium">
                                  +{jrn.subtopicsCovered.length - 2} subtopik lainnya
                                </li>
                              )}
                            </ul>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900 block">{jrn.instructorName}</span>
                            <span className="text-[10px] text-slate-500">
                              {SNBT_ACTIVITY_TYPE_METAS[jrn.learningActivityType]?.label.split(' ')[0] || jrn.learningActivityType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono font-bold text-indigo-700">
                            {jrn.comprehensionPercentage}%
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono font-bold text-amber-700">
                            {jrn.practiceQuestionsCorrect}/{jrn.practiceQuestionsCount}
                            <span className="text-[9px] text-slate-500 block">({jrn.practiceAccuracy}%)</span>
                          </td>

                          <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-xs">
                            <p className="line-clamp-1 italic text-slate-600">"{jrn.tutorFeedback}"</p>
                            <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                              {jrn.targetIrtImpact}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 6. MODE 3: TEACHER CLASS AGENDA / LOGBOOK */}
          {/* ===================================================================== */}
          {viewMode === 'TEACHER_CLASS_LOG' && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    AGENDA REKAP MENGAJAR SELURUH PESERTA KELAS INTENSIF UTBK 2026
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Tanggal & Sesi</th>
                        <th className="py-2.5 px-3">Siswa & NIS</th>
                        <th className="py-2.5 px-3">Subtes & Modul</th>
                        <th className="py-2.5 px-3">Guru Pengampu</th>
                        <th className="py-2.5 px-3 text-center">Pemahaman</th>
                        <th className="py-2.5 px-3 text-center">Drill Akurat</th>
                        <th className="py-2.5 px-3">Catatan Evaluasi Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {displayJournals.map(jrn => (
                        <tr key={jrn.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <strong className="font-mono text-indigo-700 block">{jrn.date}</strong>
                            <span className="text-[10px] text-slate-500 font-bold">P-{jrn.meetingNumber} ({jrn.durationMinutes}m)</span>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <strong className="text-slate-950 font-bold block">{jrn.studentName}</strong>
                            <span className="text-[10px] text-slate-500 font-mono">NIS: {jrn.nis}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 font-mono mr-1">
                              {jrn.subtestCode}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{jrn.moduleTitle || jrn.syllabusTitle}</span>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900 block">{jrn.instructorName}</span>
                            <span className="text-[10px] text-slate-500">{jrn.attendanceStatus}</span>
                          </td>

                          <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700 whitespace-nowrap">
                            {jrn.comprehensionPercentage}%
                          </td>

                          <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700 whitespace-nowrap">
                            {jrn.practiceAccuracy}% ({jrn.practiceQuestionsCorrect}/{jrn.practiceQuestionsCount})
                          </td>

                          <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-xs">
                            <p className="line-clamp-1 italic">"{jrn.tutorFeedback}"</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 7. KOLOM PENGESAHAN & TANDA TANGAN RESMI */}
          {/* ===================================================================== */}
          {filterOptions.showSignatures && (
            <div className="mt-8 pt-6 border-t-2 border-slate-300 text-xs break-inside-avoid">
              <div className="flex items-center justify-between pb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pengesahan & Verifikasi Dokumen Jurnal Mengajar
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Jakarta, {currentDateFormatted}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center pt-2">
                <div className="space-y-16">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Siswa / Peserta Bimbingan
                  </span>
                  <div className="border-t border-slate-400 pt-1.5 inline-block w-40">
                    <strong className="text-slate-900 font-bold block text-xs">
                      {activeStudent?.name || 'Muhammad Farhan Al-Fatih'}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      NIS: {activeStudent?.nis || '2026120101'}
                    </span>
                  </div>
                </div>

                <div className="space-y-16">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Guru / Tutor Pengampu Subtes
                  </span>
                  <div className="border-t border-slate-400 pt-1.5 inline-block w-40">
                    <strong className="text-slate-900 font-bold block text-xs">
                      {activeJournal?.instructorName || 'Dr. Hendra Wijaya, M.Pd.'}
                    </strong>
                    <span className="text-[10px] text-slate-500">Tutor Spesialis SNBT</span>
                  </div>
                </div>

                <div className="space-y-16">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Koordinator Akademik & UTBK
                  </span>
                  <div className="border-t border-slate-400 pt-1.5 inline-block w-40">
                    <strong className="text-slate-900 font-bold block text-xs">
                      Bambang Wicaksono, M.Sc.
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">NIP: 198504122010011008</span>
                  </div>
                </div>
              </div>

              {/* QR Verification Footer */}
              {filterOptions.showQrVerification && (
                <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-700 shrink-0" />
                    <span>
                      Dokumen sah dan terverifikasi secara digital melalui Sistem Monitoring Silabus & IRT SNBT 2026.
                    </span>
                  </div>
                  <span className="font-mono">
                    ID-DOC: JRN-{activeJournal?.id || 'SNBT'}-{new Date().getFullYear()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
