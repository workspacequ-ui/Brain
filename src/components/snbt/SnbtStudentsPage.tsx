import React, { useState, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SnbtStudentProfile,
  loadStoredSnbtStudents,
  saveStoredSnbtStudents
} from './snbtData';
import { SnbtStudentEditModal } from './SnbtStudentEditModal';
import { SnbtPrintStudentsModal } from './SnbtPrintStudentsModal';
import { SnbtMiniCountdownBadge } from './SnbtMiniCountdownBadge';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MessageCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Printer,
  Sparkles,
  School,
  TrendingUp,
  LayoutGrid,
  List,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Plus,
  RotateCcw
} from 'lucide-react';

interface SnbtStudentsPageProps {
  user: User;
  onNavigateTab?: (tab: SidebarTab) => void;
  onSetActiveSubtab?: (subtab: 'overview' | 'students' | 'roadmap' | 'countdown') => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SnbtStudentsPage: React.FC<SnbtStudentsPageProps> = ({
  user,
  onNavigateTab,
  onSetActiveSubtab,
  onShowToast
}) => {
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

  const [students, setStudents] = useState<SnbtStudentProfile[]>(() =>
    loadStoredSnbtStudents()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedReadiness, setSelectedReadiness] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingStudent, setEditingStudent] = useState<SnbtStudentProfile | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(std => {
      const matchSearch =
        std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.nis.includes(searchQuery) ||
        std.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.targetPtn1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.prodi1.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGroup =
        selectedGroup === 'ALL' || std.group.includes(selectedGroup);

      const matchStatus =
        selectedStatus === 'ALL' || std.snpmbAccountStatus === selectedStatus;

      const matchReadiness =
        selectedReadiness === 'ALL' || std.readinessLevel === selectedReadiness;

      return matchSearch && matchGroup && matchStatus && matchReadiness;
    });
  }, [students, searchQuery, selectedGroup, selectedStatus, selectedReadiness]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const avgScore =
      total > 0
        ? Math.round(
            students.reduce((acc, curr) => acc + curr.avgTryoutScore, 0) / total
          )
        : 0;
    const verifiedAccounts = students.filter(
      s => s.snpmbAccountStatus === 'TERVERIFIKASI'
    ).length;
    const veryReady = students.filter(
      s => s.readinessLevel === 'SANGAT_SIAP'
    ).length;

    return {
      total,
      avgScore,
      verifiedAccounts,
      verifiedPct: total > 0 ? Math.round((verifiedAccounts / total) * 100) : 0,
      veryReady
    };
  }, [students]);

  const createNewStudentTemplate = (): SnbtStudentProfile => {
    const newId = `snbt-std-${Date.now()}`;
    return {
      id: newId,
      nis: `${232412000 + Math.floor(Math.random() * 900)}`,
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      className: 'XII-UTBK',
      group: 'Kelompok 1 - Alpha (UTBK)',
      schoolOrigin: 'SMA Negeri 1 Jakarta',
      targetPtn1: 'Universitas Indonesia (UI)',
      prodi1: 'Pendidikan Dokter',
      passingGrade1: 725,
      targetPtn2: 'Universitas Gadjah Mada (UGM)',
      prodi2: 'Farmasi',
      passingGrade2: 690,
      avgTryoutScore: 680,
      highestTryoutScore: 700,
      targetOverallScore: 730,
      snpmbAccountStatus: 'PERLU_FINALISASI',
      readinessLevel: 'SIAP',
      subtestScores: [
        { code: 'PU', name: 'Penalaran Umum', category: 'TPS', score: 680, targetScore: 720, correct: 21, totalQuestions: 30, accuracy: 70 },
        { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', category: 'TPS', score: 670, targetScore: 710, correct: 14, totalQuestions: 20, accuracy: 70 },
        { code: 'PBM', name: 'Pemahaman Bacaan & Menulis', category: 'TPS', score: 690, targetScore: 730, correct: 18, totalQuestions: 25, accuracy: 72 },
        { code: 'PK', name: 'Pengetahuan Kuantitatif', category: 'TPS', score: 650, targetScore: 700, correct: 11, totalQuestions: 20, accuracy: 55 },
        { code: 'LBI', name: 'Literasi Bahasa Indonesia', category: 'Literasi', score: 710, targetScore: 750, correct: 23, totalQuestions: 30, accuracy: 77 },
        { code: 'LBE', name: 'Literasi Bahasa Inggris', category: 'Literasi', score: 670, targetScore: 710, correct: 14, totalQuestions: 20, accuracy: 70 },
        { code: 'PM', name: 'Penalaran Matematika', category: 'Penalaran Matematika', score: 650, targetScore: 700, correct: 12, totalQuestions: 20, accuracy: 60 },
      ],
      tryoutHistory: [],
      counselorNotes: 'Siswa baru terdaftar di program bimbingan intensif UTBK-SNBT.',
      lastActive: new Date().toISOString().slice(0, 10)
    };
  };

  const handleSaveStudent = (updated: SnbtStudentProfile) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang memiliki akses mengubah data siswa.', 'error');
      return;
    }
    const exists = students.some(s => s.id === updated.id);
    const newStudents = exists
      ? students.map(s => (s.id === updated.id ? updated : s))
      : [updated, ...students];
    setStudents(newStudents);
    saveStoredSnbtStudents(newStudents);
    onShowToast?.(
      exists
        ? `Profil siswa "${updated.name}" berhasil diperbarui.`
        : `Siswa baru "${updated.name}" berhasil ditambahkan.`,
      'success'
    );
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang dapat menghapus data siswa.', 'error');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${studentName}" dari sistem SNBT? Tindakan ini tidak dapat dibatalkan.`)) {
      const updated = students.filter(s => s.id !== studentId);
      setStudents(updated);
      saveStoredSnbtStudents(updated);
      onShowToast?.(`Data siswa "${studentName}" berhasil dihapus.`, 'success');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'NIS',
      'Nama',
      'Kelompok',
      'Sekolah Asal',
      'Target PTN 1',
      'Prodi 1',
      'Passing Grade 1',
      'Target PTN 2',
      'Prodi 2',
      'Passing Grade 2',
      'Rata-rata Skor Tryout',
      'Status Akun SNPMB',
      'Tingkat Kesiapan'
    ];

    const rows = filteredStudents.map(s => [
      s.nis,
      `"${s.name}"`,
      `"${s.group}"`,
      `"${s.schoolOrigin}"`,
      `"${s.targetPtn1}"`,
      `"${s.prodi1}"`,
      s.passingGrade1,
      `"${s.targetPtn2}"`,
      `"${s.prodi2}"`,
      s.passingGrade2,
      s.avgTryoutScore,
      s.snpmbAccountStatus,
      s.readinessLevel
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_siswa_xii_utbk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedGroup !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedReadiness !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGroup('ALL');
    setSelectedStatus('ALL');
    setSelectedReadiness('ALL');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner dengan Judul 1 Baris Lurus dan Menu Rapi di Bawah Judul */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 border border-amber-500/30 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges & Countdown */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              KELAS XII-UTBK INTENSIF
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
              Tahun Ajaran 2025/2026
            </span>
            <span className="hidden sm:inline-flex px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Program Khusus SNBT 2026
            </span>
            {isAdminOrStaff && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mode Admin / Staf
              </span>
            )}
          </div>

          {/* Mini Countdown Badge in Corner */}
          <SnbtMiniCountdownBadge
            onSetActiveSubtab={onSetActiveSubtab}
            onNavigateTab={onNavigateTab}
            size="xs"
          />
        </div>

        {/* Judul Halaman 1 Baris Lurus & Deskripsi */}
        <div className="relative z-10 space-y-2">
          <h1
            id="snbt-students-page-title"
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight whitespace-nowrap overflow-x-auto custom-scrollbar flex items-center gap-3 py-0.5"
            title="Data & Analisis Siswa Kelas XII-UTBK"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-300">
              Data & Analisis Siswa Kelas XII-UTBK
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            Monitoring komprehensif target PTN pilihan 1 & 2, progres skor IRT 7 subtes, status verifikasi akun SNPMB, dan rekomendasi bimbingan kelulusan.
          </p>
        </div>

        {/* Menu Navigasi & Aksi Terpadu Tepat di Bawah Judul Halaman */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
          {/* Kelompok Tombol Aksi Utama */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button
              type="button"
              id="snbt-btn-campus-directory"
              onClick={() => {
                if (onNavigateTab) {
                  onNavigateTab('snbt_campus');
                } else if (onSetActiveSubtab) {
                  onSetActiveSubtab('campus' as any);
                }
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/30 hover:scale-[1.02]"
              title="Buka Direktori Pilihan Kampus & Passing Grade PTN"
            >
              <School className="w-4 h-4 text-purple-200" />
              <span>Pilihan Kampus & Passing Grade</span>
            </button>

            {isAdminOrStaff && (
              <button
                type="button"
                id="snbt-btn-add-student"
                onClick={() => setEditingStudent(createNewStudentTemplate())}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-[1.02]"
                title="Tambah Profil Siswa Baru XII-UTBK"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            )}

            <button
              type="button"
              id="snbt-btn-print-students"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
              title="Cetak Data & Rapor Siswa yang Sedang Ditampilkan (PDF / Print)"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak Data Siswa ({filteredStudents.length})</span>
            </button>

            <button
              type="button"
              id="snbt-btn-export-csv"
              onClick={handleExportCsv}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Ekspor Data Siswa Terfilter ke format CSV"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Ekspor CSV</span>
            </button>

            {isFilterActive && (
              <button
                type="button"
                id="snbt-btn-reset-filters"
                onClick={resetFilters}
                className="px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800/60 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Reset Filter</span>
              </button>
            )}
          </div>

          {/* Mode Tampilan & Info Data */}
          <div className="flex items-center gap-2.5 ml-auto">
            <span className="text-[11px] text-slate-400 hidden md:inline font-medium">
              Menampilkan <span className="text-amber-400 font-bold font-mono">{filteredStudents.length}</span> dari <span className="text-slate-200 font-bold font-mono">{students.length}</span> Siswa
            </span>

            <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                id="btn-view-grid-mode"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Tampilan Kartu Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-view-table-mode"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Tampilan Tabel Komprehensif"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Siswa XII-UTBK</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-white font-mono">
            {stats.total} <span className="text-xs text-slate-400 font-sans font-normal">Siswa</span>
          </div>
          <div className="text-[11px] text-blue-400 font-medium">
            Terbagi dalam 3 Kelompok Belajar
          </div>
        </div>

        {/* Avg Score */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rata-Rata Skor IRT</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
            {stats.avgScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 1000</span>
          </div>
          <div className="text-[11px] text-amber-300/80 font-medium">
            Target Kelas: ≥ 730
          </div>
        </div>

        {/* SNPMB Status */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Akun SNPMB Permanen</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
            {stats.verifiedPct}% <span className="text-xs text-slate-400 font-sans font-normal">({stats.verifiedAccounts}/{stats.total})</span>
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium">
            Simpan Permanen Terverifikasi
          </div>
        </div>

        {/* Very Ready */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Kesiapan Sangat Tinggi</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-purple-400 font-mono">
            {stats.veryReady} <span className="text-xs text-slate-400 font-sans font-normal">Siswa</span>
          </div>
          <div className="text-[11px] text-purple-300/80 font-medium">
            Passing Grade Pilihan 1 Terpenuhi
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIS, sekolah asal, atau PTN..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Kelompok</option>
            <option value="Alpha">Kelompok 1 (Alpha)</option>
            <option value="Einstein">Kelompok 2 (Einstein)</option>
            <option value="Newton">Kelompok 3 (Newton)</option>
          </select>

          {/* SNPMB Account Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status Akun</option>
            <option value="TERVERIFIKASI">Terverifikasi</option>
            <option value="PERLU_FINALISASI">Perlu Finalisasi</option>
            <option value="BELUM_DAFTAR">Belum Daftar</option>
          </select>

          {/* Readiness Level */}
          <select
            value={selectedReadiness}
            onChange={e => setSelectedReadiness(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Kesiapan</option>
            <option value="SANGAT_SIAP">Sangat Siap (≥ 720)</option>
            <option value="SIAP">Siap (650 - 719)</option>
            <option value="PERLU_BIMBINGAN">Perlu Bimbingan</option>
          </select>
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Tidak ada siswa ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan kembali data siswa.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => {
            const isPassing1 = student.avgTryoutScore >= student.passingGrade1;
            const diff1 = student.avgTryoutScore - student.passingGrade1;

            return (
              <div
                key={student.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Student Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          student.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                        }
                        alt={student.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-white line-clamp-1">
                          {student.name}
                        </h3>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIS: {student.nis}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {student.schoolOrigin}
                        </div>
                      </div>
                    </div>

                    {isAdminOrStaff ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingStudent(student)}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 transition-colors cursor-pointer"
                          title="Edit Profil Siswa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600/30 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Hapus Siswa dari Program SNBT"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingStudent(student)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Lihat Detail Profil Siswa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Group & SNPMB Badges */}
                  <div className="flex items-center justify-between gap-2 mt-3 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium truncate">
                      {student.group}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        student.snpmbAccountStatus === 'TERVERIFIKASI'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : student.snpmbAccountStatus === 'PERLU_FINALISASI'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {student.snpmbAccountStatus}
                    </span>
                  </div>

                  {/* Target PTN Cards */}
                  <div className="mt-3 space-y-2">
                    {/* PTN 1 */}
                    <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-blue-400">PILIHAN 1</span>
                        <span className="font-mono text-slate-400">
                          PG: {student.passingGrade1}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {student.targetPtn1}
                      </div>
                      <div className="text-[11px] text-blue-200/80 line-clamp-1">
                        {student.prodi1}
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-slate-400">Skor vs PG:</span>
                        <span
                          className={`font-bold font-mono ${
                            isPassing1 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isPassing1 ? `+${diff1} (Aman)` : `${diff1} (Perlu +${Math.abs(diff1)})`}
                        </span>
                      </div>
                    </div>

                    {/* PTN 2 */}
                    <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-cyan-400">PILIHAN 2</span>
                        <span className="font-mono text-slate-400">
                          PG: {student.passingGrade2}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 line-clamp-1">
                        {student.targetPtn2}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {student.prodi2}
                      </div>
                    </div>
                  </div>

                  {/* 7 Subtests Score Chips */}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Nilai 7 Subtes UTBK
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center font-mono">
                      {student.subtestScores.map(sub => (
                        <div
                          key={sub.code}
                          className="p-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px]"
                          title={`${sub.name}: ${sub.score} (Target: ${sub.targetScore})`}
                        >
                          <div className="text-[8px] text-slate-500 font-bold">{sub.code}</div>
                          <div className={`font-bold ${sub.score >= sub.targetScore ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {sub.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counselor Note */}
                  {student.counselorNotes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 italic line-clamp-2">
                      "{student.counselorNotes}"
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Rata-Rata Skor</div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      {student.avgTryoutScore}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        (Tgt: {student.targetOverallScore})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {student.whatsapp && (
                      <a
                        href={`https://wa.me/${student.whatsapp.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                        title="Hubungi via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingStudent(student)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAdminOrStaff ? 'Edit / Detail' : 'Detail Profil'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Siswa</th>
                  <th className="px-4 py-3.5">Kelompok</th>
                  <th className="px-4 py-3.5">Pilihan 1 (PTN & Prodi)</th>
                  <th className="px-4 py-3.5">Pilihan 2 (PTN & Prodi)</th>
                  <th className="px-4 py-3.5 text-center">Avg Skor</th>
                  <th className="px-4 py-3.5 text-center">Akun SNPMB</th>
                  <th className="px-4 py-3.5 text-center">Kesiapan</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            student.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                          }
                          alt={student.name}
                          className="w-8 h-8 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-white">{student.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {student.nis} • {student.schoolOrigin}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {student.group}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-300">{student.targetPtn1}</div>
                      <div className="text-[10px] text-slate-400">{student.prodi1} (PG: {student.passingGrade1})</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-cyan-300">{student.targetPtn2}</div>
                      <div className="text-[10px] text-slate-400">{student.prodi2} (PG: {student.passingGrade2})</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-amber-400">
                      {student.avgTryoutScore}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.snpmbAccountStatus === 'TERVERIFIKASI'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : student.snpmbAccountStatus === 'PERLU_FINALISASI'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {student.snpmbAccountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.readinessLevel === 'SANGAT_SIAP'
                            ? 'bg-purple-500/20 text-purple-300'
                            : student.readinessLevel === 'SIAP'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {student.readinessLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdminOrStaff ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingStudent(student)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 transition-colors cursor-pointer"
                              title="Edit Profil"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Students Modal (Prints exactly what is currently filtered and displayed) */}
      <SnbtPrintStudentsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={filteredStudents}
        allCount={students.length}
        selectedGroup={selectedGroup}
        selectedStatus={selectedStatus}
        selectedReadiness={selectedReadiness}
        searchQuery={searchQuery}
      />

      {/* Edit / Add / View Student Modal */}
      {editingStudent && (
        <SnbtStudentEditModal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          student={editingStudent}
          onSave={isAdminOrStaff ? handleSaveStudent : undefined}
          readOnly={!isAdminOrStaff}
        />
      )}
    </div>
  );
};
