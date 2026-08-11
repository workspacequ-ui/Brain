import React, { useState, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SnbtCampusItem,
  SnbtMajorItem,
  SnbtMajorCluster,
  SnbtDegreeLevel,
  loadStoredSnbtCampuses,
  saveStoredSnbtCampuses,
  resetDefaultSnbtCampuses
} from './snbtCampusData';
import {
  SnbtStudentProfile,
  loadStoredSnbtStudents,
  saveStoredSnbtStudents
} from './snbtData';
import { SnbtCampusModal } from './SnbtCampusModal';
import { SnbtMajorModal } from './SnbtMajorModal';
import { SnbtCampusStudentModal } from './SnbtCampusStudentModal';
import { SnbtMiniCountdownBadge } from './SnbtMiniCountdownBadge';
import {
  School,
  Building2,
  GraduationCap,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Users,
  Target,
  Award,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  RotateCcw,
  Download,
  Info,
  MapPin,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SnbtCampusPageProps {
  user: User;
  onNavigateTab?: (tab: SidebarTab) => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SnbtCampusPage: React.FC<SnbtCampusPageProps> = ({
  user,
  onNavigateTab,
  onShowToast
}) => {
  const isAdminOrStaff = user.role === 'admin' || user.role === 'staff';

  // State
  const [campuses, setCampuses] = useState<SnbtCampusItem[]>(() =>
    loadStoredSnbtCampuses()
  );
  const [students, setStudents] = useState<SnbtStudentProfile[]>(() =>
    loadStoredSnbtStudents()
  );

  const [activeView, setActiveView] = useState<'table' | 'cards' | 'matrix'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('ALL');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('ALL');
  const [selectedDegreeFilter, setSelectedDegreeFilter] = useState<string>('ALL');
  const [selectedPassingGradeTier, setSelectedPassingGradeTier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'passingGradeDesc' | 'passingGradeAsc' | 'quotaDesc' | 'applicantsDesc' | 'campusName'>('passingGradeDesc');

  // Modals state
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<SnbtCampusItem | null>(null);

  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [targetCampusIdForMajor, setTargetCampusIdForMajor] = useState<string>('');
  const [editingMajor, setEditingMajor] = useState<SnbtMajorItem | null>(null);

  const [activeStudentModalMajor, setActiveStudentModalMajor] = useState<{
    campus: SnbtCampusItem;
    major: SnbtMajorItem;
  } | null>(null);

  // Flattened majors with campus info for the main table view
  const allMajorEntries = useMemo(() => {
    const list: Array<{ campus: SnbtCampusItem; major: SnbtMajorItem }> = [];
    campuses.forEach(camp => {
      camp.majors.forEach(maj => {
        list.push({ campus: camp, major: maj });
      });
    });
    return list;
  }, [campuses]);

  // Filtered & Sorted majors
  const filteredMajors = useMemo(() => {
    return allMajorEntries.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.major.name.toLowerCase().includes(q) ||
        item.major.code.includes(q) ||
        item.major.faculty.toLowerCase().includes(q) ||
        item.campus.name.toLowerCase().includes(q) ||
        item.campus.shortName.toLowerCase().includes(q) ||
        item.campus.city.toLowerCase().includes(q);

      const matchCampus =
        selectedCampusFilter === 'ALL' || item.campus.id === selectedCampusFilter;

      const matchCluster =
        selectedClusterFilter === 'ALL' || item.major.cluster === selectedClusterFilter;

      const matchDegree =
        selectedDegreeFilter === 'ALL' || item.major.degree === selectedDegreeFilter;

      const matchPg =
        selectedPassingGradeTier === 'ALL' ||
        (selectedPassingGradeTier === 'TIER_1' && item.major.passingGrade >= 720) ||
        (selectedPassingGradeTier === 'TIER_2' && item.major.passingGrade >= 700 && item.major.passingGrade < 720) ||
        (selectedPassingGradeTier === 'TIER_3' && item.major.passingGrade < 700);

      return matchSearch && matchCampus && matchCluster && matchDegree && matchPg;
    }).sort((a, b) => {
      if (sortBy === 'passingGradeDesc') return b.major.passingGrade - a.major.passingGrade;
      if (sortBy === 'passingGradeAsc') return a.major.passingGrade - b.major.passingGrade;
      if (sortBy === 'quotaDesc') return b.major.quota - a.major.quota;
      if (sortBy === 'applicantsDesc') return b.major.applicantsLastYear - a.major.applicantsLastYear;
      if (sortBy === 'campusName') return a.campus.name.localeCompare(b.campus.name);
      return 0;
    });
  }, [allMajorEntries, searchQuery, selectedCampusFilter, selectedClusterFilter, selectedDegreeFilter, selectedPassingGradeTier, sortBy]);

  // Overall stats
  const stats = useMemo(() => {
    const totalCampuses = campuses.length;
    const totalMajors = allMajorEntries.length;
    const avgPassingGrade =
      totalMajors > 0
        ? Math.round(
            allMajorEntries.reduce((acc, curr) => acc + curr.major.passingGrade, 0) / totalMajors
          )
        : 0;
    const totalQuota = allMajorEntries.reduce((acc, curr) => acc + curr.major.quota, 0);

    return {
      totalCampuses,
      totalMajors,
      avgPassingGrade,
      totalQuota
    };
  }, [campuses, allMajorEntries]);

  // CRUD Handlers for Campuses
  const handleSaveCampus = (savedCampus: SnbtCampusItem) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang memiliki akses mengubah data kampus.', 'error');
      return;
    }
    let updated: SnbtCampusItem[];
    const exists = campuses.some(c => c.id === savedCampus.id);
    if (exists) {
      updated = campuses.map(c => (c.id === savedCampus.id ? savedCampus : c));
      onShowToast?.(`Data kampus ${savedCampus.shortName} berhasil diperbarui!`, 'success');
    } else {
      updated = [savedCampus, ...campuses];
      onShowToast?.(`Kampus baru ${savedCampus.shortName} berhasil ditambahkan!`, 'success');
    }
    setCampuses(updated);
    saveStoredSnbtCampuses(updated);
  };

  const handleDeleteCampus = (campusId: string) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang memiliki akses menghapus kampus.', 'error');
      return;
    }
    const updated = campuses.filter(c => c.id !== campusId);
    setCampuses(updated);
    saveStoredSnbtCampuses(updated);
    onShowToast?.('Data kampus berhasil dihapus!', 'info');
  };

  // CRUD Handlers for Majors
  const handleSaveMajor = (campusId: string, savedMajor: SnbtMajorItem) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang memiliki akses mengubah data jurusan.', 'error');
      return;
    }
    const updated = campuses.map(camp => {
      if (camp.id !== campusId) return camp;
      const majorExists = camp.majors.some(m => m.id === savedMajor.id);
      let nextMajors: SnbtMajorItem[];
      if (majorExists) {
        nextMajors = camp.majors.map(m => (m.id === savedMajor.id ? savedMajor : m));
      } else {
        nextMajors = [...camp.majors, savedMajor];
      }
      return { ...camp, majors: nextMajors };
    });
    setCampuses(updated);
    saveStoredSnbtCampuses(updated);
    onShowToast?.(`Program studi ${savedMajor.name} berhasil disimpan!`, 'success');
  };

  const handleDeleteMajor = (campusId: string, majorId: string) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang memiliki akses menghapus jurusan.', 'error');
      return;
    }
    const updated = campuses.map(camp => {
      if (camp.id !== campusId) return camp;
      return { ...camp, majors: camp.majors.filter(m => m.id !== majorId) };
    });
    setCampuses(updated);
    saveStoredSnbtCampuses(updated);
    onShowToast?.('Program studi berhasil dihapus!', 'info');
  };

  // Student choice update handler
  const handleUpdateStudentTarget = (
    studentId: string,
    choiceNum: 1 | 2,
    ptnName: string,
    prodiName: string,
    passingGrade: number
  ) => {
    if (!isAdminOrStaff) {
      onShowToast?.('Hanya administrator dan staf yang memiliki akses mengubah target siswa.', 'error');
      return;
    }
    const updatedStudents = students.map(std => {
      if (std.id !== studentId) return std;
      if (choiceNum === 1) {
        return {
          ...std,
          targetPtn1: ptnName,
          prodi1: prodiName,
          passingGrade1: passingGrade
        };
      } else {
        return {
          ...std,
          targetPtn2: ptnName,
          prodi2: prodiName,
          passingGrade2: passingGrade
        };
      }
    });
    setStudents(updatedStudents);
    saveStoredSnbtStudents(updatedStudents);
    onShowToast?.(`Target Pilihan ${choiceNum} siswa berhasil diperbarui!`, 'success');
  };

  // Helper to get interested students for a major
  const getInterestedStudents = (camp: SnbtCampusItem, maj: SnbtMajorItem) => {
    return students.filter(std => {
      const matchPtn1 =
        std.targetPtn1.toLowerCase().includes(camp.shortName.toLowerCase()) ||
        std.targetPtn1.toLowerCase().includes(camp.name.toLowerCase());
      const matchProdi1 =
        std.prodi1.toLowerCase().includes(maj.name.toLowerCase()) ||
        maj.name.toLowerCase().includes(std.prodi1.toLowerCase());

      const matchPtn2 =
        std.targetPtn2.toLowerCase().includes(camp.shortName.toLowerCase()) ||
        std.targetPtn2.toLowerCase().includes(camp.name.toLowerCase());
      const matchProdi2 =
        std.prodi2.toLowerCase().includes(maj.name.toLowerCase()) ||
        maj.name.toLowerCase().includes(std.prodi2.toLowerCase());

      return (matchPtn1 && matchProdi1) || (matchPtn2 && matchProdi2);
    });
  };

  const handleResetData = () => {
    if (window.confirm('Reset semua data kampus & jurusan ke daftar standar SNPMB resmi?')) {
      const def = resetDefaultSnbtCampuses();
      setCampuses(def);
      onShowToast?.('Data kampus telah direset ke konfigurasi awal.', 'info');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Kampus',
      'Singkatan',
      'Kota',
      'Peringkat PTN',
      'Kode Prodi',
      'Nama Prodi',
      'Fakultas',
      'Jenjang',
      'Rumpun',
      'Passing Grade IRT',
      'Daya Tampung 2026',
      'Peminat 2025',
      'Rasio Keketatan',
      'Akreditasi Prodi',
      'Jumlah Siswa Memilih'
    ];

    const rows = allMajorEntries.map(item => {
      const interestedCount = getInterestedStudents(item.campus, item.major).length;
      return [
        `"${item.campus.name}"`,
        `"${item.campus.shortName}"`,
        `"${item.campus.city}"`,
        item.campus.ranking,
        `"${item.major.code}"`,
        `"${item.major.name}"`,
        `"${item.major.faculty}"`,
        item.major.degree,
        item.major.cluster,
        item.major.passingGrade,
        item.major.quota,
        item.major.applicantsLastYear,
        `"${item.major.tightnessRatio}"`,
        `"${item.major.accreditation}"`,
        interestedCount
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SNBT_Pilihan_Kampus_PassingGrade_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.('Export CSV Direktori Kampus SNBT berhasil!', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-blue-950/70 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                <span>PILIHAN KAMPUS & JURUSAN UTBK-SNBT 2026</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Passing Grade IRT & Kuota SNPMB
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Direktori PTN Terbaik & Analisis Passing Grade
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pusat informasi lengkap program studi di seluruh Perguruan Tinggi Negeri terkemuka di Indonesia. Dilengkapi passing grade IRT, kuota daya tampung, rasio keketatan, dan integrasi peminat siswa Kelas XII-UTBK.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <SnbtMiniCountdownBadge onOpenCountdown={() => onNavigateTab?.('snbt_countdown')} />

            {isAdminOrStaff && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCampus(null);
                    setIsCampusModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>+ Tambah PTN</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMajor(null);
                    setTargetCampusIdForMajor(campuses.length > 0 ? campuses[0].id : '');
                    setIsMajorModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Jurusan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-500/20">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>PTN Terdata</span>
            </div>
            <div className="text-xl font-black text-white">{stats.totalCampuses} Kampus</div>
            <div className="text-[10px] text-slate-400">Top universitas negeri nasional</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Program Studi</span>
            </div>
            <div className="text-xl font-black text-white">{stats.totalMajors} Prodi</div>
            <div className="text-[10px] text-blue-400">Sains & Soshum berakreditasi</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Rerata Passing Grade</span>
            </div>
            <div className="text-xl font-black text-amber-400">{stats.avgPassingGrade} IRT</div>
            <div className="text-[10px] text-amber-300/80">Skor aman SNBT 2026</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Total Kuota SNBT</span>
            </div>
            <div className="text-xl font-black text-emerald-400">{stats.totalQuota.toLocaleString()} Kursi</div>
            <div className="text-[10px] text-emerald-300/80">Daya tampung terdata</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Mode, Export */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {/* Top Row: Search & View Modes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari program studi, kampus (UI, ITB, UGM...), fakultas, kode, atau kota..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Buttons */}
            <div className="p-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel Lengkap</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'cards'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu Kampus</span>
              </button>
              {user.role !== 'student' && (
                <button
                  type="button"
                  onClick={() => setActiveView('matrix')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeView === 'matrix'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Matriks Siswa</span>
                </button>
              )}
            </div>

            {/* Export & Reset */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download Data Jurusan & Passing Grade CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {isAdminOrStaff && (
              <button
                type="button"
                onClick={handleResetData}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Reset Data ke Standar SNPMB"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-800">
          {/* Campus Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih PTN</label>
            <select
              value={selectedCampusFilter}
              onChange={e => setSelectedCampusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Kampus ({campuses.length})</option>
              {campuses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.shortName} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cluster Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Rumpun Keilmuan</label>
            <select
              value={selectedClusterFilter}
              onChange={e => setSelectedClusterFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Rumpun</option>
              <option value="SAINTEK">Sains & Teknologi (SAINTEK)</option>
              <option value="SOSHUM">Sosial & Humaniora (SOSHUM)</option>
              <option value="CAMPURAN">Campuran / Vokasi</option>
            </select>
          </div>

          {/* Degree Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jenjang</label>
            <select
              value={selectedDegreeFilter}
              onChange={e => setSelectedDegreeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Jenjang (S1 / D4)</option>
              <option value="S1">Sarjana (S1)</option>
              <option value="D4">Sarjana Terapan (D4)</option>
            </select>
          </div>

          {/* Passing Grade Tier Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tier Passing Grade</label>
            <select
              value={selectedPassingGradeTier}
              onChange={e => setSelectedPassingGradeTier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Skor IRT</option>
              <option value="TIER_1">≥ 720 (Sangat Ketat / Top Tier)</option>
              <option value="TIER_2">700 - 719 (Keketatan Tinggi)</option>
              <option value="TIER_3">&lt; 700 (Kompetitif Moderat)</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Urutkan</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="passingGradeDesc">Passing Grade (Tertinggi)</option>
              <option value="passingGradeAsc">Passing Grade (Terendah)</option>
              <option value="quotaDesc">Daya Tampung Terbanyak</option>
              <option value="applicantsDesc">Peminat Terbanyak</option>
              <option value="campusName">Nama Kampus (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN VIEW 1: TABEL LENGKAP JURUSAN & PASSING GRADE */}
      {activeView === 'table' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Tabel Program Studi & Passing Grade SNBT
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {filteredMajors.length} Jurusan
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Menampilkan data daya tampung resmi & pemetaan siswa bimbel
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Perguruan Tinggi (PTN)</th>
                  <th className="py-3 px-4">Program Studi & Fakultas</th>
                  <th className="py-3 px-3 text-center">Rumpun</th>
                  <th className="py-3 px-3 text-center">Passing Grade (IRT)</th>
                  <th className="py-3 px-3 text-center">Daya Tampung 2026</th>
                  <th className="py-3 px-3 text-center">Keketatan (2025)</th>
                  {user.role !== 'student' && (
                    <th className="py-3 px-4">Siswa Peminat (XII-UTBK)</th>
                  )}
                  {isAdminOrStaff && <th className="py-3 px-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredMajors.length === 0 ? (
                  <tr>
                    <td colSpan={7 + (user.role !== 'student' ? 1 : 0) + (isAdminOrStaff ? 1 : 0)} className="py-12 text-center text-slate-500">
                      <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      Tidak ada program studi yang cocok dengan kriteria pencarian & filter.
                    </td>
                  </tr>
                ) : (
                  filteredMajors.map((item, idx) => {
                    const interested = getInterestedStudents(item.campus, item.major);
                    const isTopTier = item.major.passingGrade >= 720;
                    const isHighTier = item.major.passingGrade >= 700 && item.major.passingGrade < 720;

                    return (
                      <tr
                        key={`${item.campus.id}-${item.major.id}`}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Number */}
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>

                        {/* Campus */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.campus.logo}
                              alt={item.campus.shortName}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{item.campus.shortName}</span>
                                <span className="text-[10px] font-normal text-slate-400">
                                  (Rank #{item.campus.ranking})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">
                                {item.campus.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Major & Faculty */}
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                              <span>{item.major.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {item.major.degree}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {item.major.faculty} • <span className="font-mono">Kode: {item.major.code}</span>
                            </div>
                            {item.major.specialRequirements && (
                              <div className="text-[10px] text-amber-400/90 mt-0.5 flex items-center gap-1">
                                <Info className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-xs">{item.major.specialRequirements}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Cluster */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.major.cluster === 'SAINTEK'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : item.major.cluster === 'SOSHUM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {item.major.cluster}
                          </span>
                        </td>

                        {/* Passing Grade (Score Meter) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                                isTopTier
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : isHighTier
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              <Target className="w-3.5 h-3.5" />
                              {item.major.passingGrade}
                            </span>
                            <span className="text-[9px] text-slate-500 mt-0.5">
                              {isTopTier ? 'Sangat Ketat' : isHighTier ? 'Keketatan Tinggi' : 'Kompetitif'}
                            </span>
                          </div>
                        </td>

                        {/* Quota */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-white text-xs">
                            {item.major.quota}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Kursi</span>
                        </td>

                        {/* Tightness */}
                        <td className="py-3 px-3 text-center">
                          <span className="text-xs font-bold text-slate-300">
                            {item.major.tightnessRatio}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {item.major.applicantsLastYear.toLocaleString()} peminat
                          </span>
                        </td>

                        {/* Interested Students (Integrated Feature! Hidden for students) */}
                        {user.role !== 'student' && (
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveStudentModalMajor({
                                  campus: item.campus,
                                  major: item.major
                                })
                              }
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-left w-full transition-all cursor-pointer group/btn"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {interested.length > 0 ? (
                                    <div className="flex -space-x-2 overflow-hidden">
                                      {interested.slice(0, 3).map(std => (
                                        <img
                                          key={std.id}
                                          src={std.avatar}
                                          alt={std.name}
                                          className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <Users className="w-4 h-4 text-slate-500" />
                                  )}
                                  <span className="font-bold text-xs text-white">
                                    {interested.length > 0
                                      ? `${interested.length} Siswa`
                                      : '0 Siswa'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-semibold text-indigo-400 group-hover/btn:text-indigo-300 flex items-center gap-0.5">
                                  <span>Lihat</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </span>
                              </div>
                            </button>
                          </td>
                        )}

                        {/* Admin Action Buttons */}
                        {isAdminOrStaff && (
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMajor(item.major);
                                  setTargetCampusIdForMajor(item.campus.id);
                                  setIsMajorModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Edit Program Studi"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Hapus program studi "${item.major.name}"?`)) {
                                    handleDeleteMajor(item.campus.id, item.major.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Program Studi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN VIEW 2: KARTU DIREKTORI KAMPUS & FAKULTAS */}
      {activeView === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campuses.map(camp => {
            const allCampMajors = camp.majors;
            const avgPg =
              allCampMajors.length > 0
                ? Math.round(
                    allCampMajors.reduce((acc, curr) => acc + curr.passingGrade, 0) /
                      allCampMajors.length
                  )
                : 0;

            const interestedCount = students.filter(
              std =>
                std.targetPtn1.toLowerCase().includes(camp.shortName.toLowerCase()) ||
                std.targetPtn2.toLowerCase().includes(camp.shortName.toLowerCase())
            ).length;

            return (
              <div
                key={camp.id}
                className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
              >
                {/* Card Top Image & Badges */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={camp.imageUrl}
                      alt={camp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Rank Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-600/90 text-white backdrop-blur-md shadow-lg">
                        Rank #{camp.ranking} Nasional
                      </span>
                      <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-slate-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                        {camp.accreditation}
                      </span>
                    </div>

                    {/* Admin Edit */}
                    {isAdminOrStaff && (
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCampus(camp);
                            setIsCampusModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                          title="Edit PTN"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Logo & Name in bottom image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
                      <img
                        src={camp.logo}
                        alt={camp.shortName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 bg-slate-900 shrink-0 shadow-lg"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-white truncate">
                          {camp.shortName} • {camp.name}
                        </h3>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>{camp.city}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Badge & Description */}
                    <div>
                      <div className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{camp.badge}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className={`grid ${user.role !== 'student' ? 'grid-cols-3' : 'grid-cols-2'} gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50`}>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block font-medium">Prodi</span>
                        <span className="text-sm font-extrabold text-white">
                          {camp.majors.length}
                        </span>
                      </div>
                      <div className={`text-center ${user.role !== 'student' ? 'border-x' : 'border-l'} border-slate-700/60`}>
                        <span className="text-[10px] text-slate-400 block font-medium">Avg PG</span>
                        <span className="text-sm font-extrabold text-amber-400">
                          {avgPg}
                        </span>
                      </div>
                      {user.role !== 'student' && (
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Peminat</span>
                          <span className="text-sm font-extrabold text-emerald-400">
                            {interestedCount} Siswa
                          </span>
                        </div>
                      )}
                    </div>

                    {/* List of Majors Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Daftar Jurusan Unggulan</span>
                        <span className="text-[10px] text-indigo-400">
                          {camp.majors.length} Pilihan
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {camp.majors.map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              if (user.role !== 'student') {
                                setActiveStudentModalMajor({
                                  campus: camp,
                                  major: m
                                });
                              }
                            }}
                            className={`p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-indigo-500/40 flex items-center justify-between text-xs transition-all ${user.role !== 'student' ? 'cursor-pointer' : ''}`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-white truncate text-[11px]">
                                {m.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {m.degree} • {m.cluster} • Kuota: {m.quota}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                                {m.passingGrade} IRT
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link & Add Major */}
                <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between gap-2">
                  <a
                    href={camp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Website PTN</span>
                  </a>

                  {isAdminOrStaff && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMajor(null);
                        setTargetCampusIdForMajor(camp.id);
                        setIsMajorModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Jurusan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MAIN VIEW 3: MATRIKS SISWA & TARGET KAMPUS */}
      {activeView === 'matrix' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Matriks Siswa Kelas XII-UTBK vs Target Passing Grade Kampus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {students.length} Siswa
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Evaluasi gap skor tryout IRT terhadap ambang batas kelulusan
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Siswa (XII-UTBK)</th>
                  <th className="py-3 px-3 text-center">Rerata Skor IRT</th>
                  <th className="py-3 px-4">Pilihan 1 (Utama)</th>
                  <th className="py-3 px-3 text-center">Passing Grade 1</th>
                  <th className="py-3 px-3 text-center">Gap & Peluang 1</th>
                  <th className="py-3 px-4">Pilihan 2 (Cadangan)</th>
                  <th className="py-3 px-3 text-center">Passing Grade 2</th>
                  <th className="py-3 px-3 text-center">Gap & Peluang 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {students.map((std, idx) => {
                  const gap1 = std.avgTryoutScore - std.passingGrade1;
                  const isSafe1 = gap1 >= 0;
                  const isComp1 = gap1 >= -15 && gap1 < 0;

                  const gap2 = std.avgTryoutScore - std.passingGrade2;
                  const isSafe2 = gap2 >= 0;
                  const isComp2 = gap2 >= -15 && gap2 < 0;

                  return (
                    <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white">{std.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {std.nis} • {std.schoolOrigin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-extrabold text-white">
                          {std.avgTryoutScore}
                        </span>
                        <span className="text-[10px] text-slate-500 block">IRT</span>
                      </td>

                      {/* Choice 1 */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{std.prodi1}</div>
                        <div className="text-[10px] text-indigo-300 font-medium">{std.targetPtn1}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-300">
                        {std.passingGrade1}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSafe1
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isComp1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {gap1 >= 0 ? `+${gap1} Aman` : `${gap1} Kompetitif`}
                        </span>
                      </td>

                      {/* Choice 2 */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{std.prodi2}</div>
                        <div className="text-[10px] text-indigo-300 font-medium">{std.targetPtn2}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-300">
                        {std.passingGrade2}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSafe2
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isComp2
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {gap2 >= 0 ? `+${gap2} Aman` : `${gap2} Drill`}
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

      {/* MODALS */}
      {isCampusModalOpen && (
        <SnbtCampusModal
          isOpen={isCampusModalOpen}
          onClose={() => {
            setIsCampusModalOpen(false);
            setEditingCampus(null);
          }}
          campus={editingCampus}
          onSave={handleSaveCampus}
          onDelete={handleDeleteCampus}
        />
      )}

      {isMajorModalOpen && (
        <SnbtMajorModal
          isOpen={isMajorModalOpen}
          onClose={() => {
            setIsMajorModalOpen(false);
            setEditingMajor(null);
          }}
          campuses={campuses}
          selectedCampusId={targetCampusIdForMajor}
          major={editingMajor}
          onSave={handleSaveMajor}
          onDelete={handleDeleteMajor}
        />
      )}

      {activeStudentModalMajor && user.role !== 'student' && (
        <SnbtCampusStudentModal
          isOpen={!!activeStudentModalMajor}
          onClose={() => setActiveStudentModalMajor(null)}
          campus={activeStudentModalMajor.campus}
          major={activeStudentModalMajor.major}
          students={students}
          onUpdateStudentTarget={handleUpdateStudentTarget}
          isAdminOrStaff={isAdminOrStaff}
        />
      )}
    </div>
  );
};
