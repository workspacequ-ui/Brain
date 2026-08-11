import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SNBT_COUNTDOWN_TARGETS,
  SnbtCountdownTarget,
  loadStoredSnbtCountdownTargets,
  saveStoredSnbtCountdownTargets,
  formatTargetDateToIndonesian
} from './snbtData';
import { SnbtMiniCountdownBadge } from './SnbtMiniCountdownBadge';
import {
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  BellRing,
  Radio,
  MapPin,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  Compass,
  GraduationCap,
  Users,
  Target,
  Award,
  BookOpen,
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
  Flame,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Sliders,
  Check,
  X,
  Copy,
  RotateCcw,
  Search,
  CheckCheck
} from 'lucide-react';

interface SnbtCountdownPageProps {
  user: User;
  onNavigateTab?: (tab: SidebarTab) => void;
  onSetActiveSubtab?: (subtab: 'overview' | 'students' | 'roadmap' | 'countdown') => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetDateIso: string): TimeRemaining {
  const target = new Date(targetDateIso).getTime();
  const now = Date.now();
  const difference = target - now;

  if (difference <= 0 || isNaN(target)) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    totalMs: difference,
    days,
    hours,
    minutes,
    seconds,
    isPast: false
  };
}

function toDatetimeLocalValue(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

function fromDatetimeLocalValue(localValue: string): string {
  try {
    const d = new Date(localValue);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

const BADGE_COLOR_PALETTES = [
  { id: 'rose-amber', name: 'Rose → Amber (Hari-H Utama)', value: 'from-rose-500 to-amber-500', sampleBg: 'bg-gradient-to-r from-rose-500 to-amber-500' },
  { id: 'blue-indigo', name: 'Blue → Indigo (Gelombang UTBK)', value: 'from-blue-500 to-indigo-500', sampleBg: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { id: 'emerald-teal', name: 'Emerald → Teal (Pengumuman Kelulusan)', value: 'from-emerald-500 to-teal-500', sampleBg: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
  { id: 'purple-pink', name: 'Purple → Pink (Registrasi Akun)', value: 'from-purple-500 to-pink-500', sampleBg: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'amber-orange', name: 'Amber → Orange (Tryout Akbar / Simulasi)', value: 'from-amber-500 to-orange-500', sampleBg: 'bg-gradient-to-r from-amber-500 to-orange-500' },
  { id: 'cyan-blue', name: 'Cyan → Blue (Bimbel / Persiapan)', value: 'from-cyan-500 to-blue-500', sampleBg: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
  { id: 'violet-fuchsia', name: 'Violet → Fuchsia (Ujian Mandiri PTN)', value: 'from-violet-500 to-fuchsia-500', sampleBg: 'bg-gradient-to-r from-violet-500 to-fuchsia-500' }
];

export const SnbtCountdownPage: React.FC<SnbtCountdownPageProps> = ({
  user,
  onNavigateTab,
  onSetActiveSubtab,
  onShowToast
}) => {
  const isAdmin = user.role === 'admin' || user.role === 'staff';

  // Stored targets list from localStorage
  const [targets, setTargets] = useState<SnbtCountdownTarget[]>(() => {
    return loadStoredSnbtCountdownTargets();
  });

  const [selectedTargetId, setSelectedTargetId] = useState<string>(() => {
    const mainTarget = targets.find(t => t.isMain);
    return mainTarget ? mainTarget.id : targets[0]?.id || 'target-gelombang-1';
  });

  const [simulateUrgent, setSimulateUrgent] = useState<boolean>(false);

  // Checklists state (stored in component state)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'doc-1': true,
    'doc-2': true,
    'doc-3': false,
    'strat-1': true,
    'strat-2': true,
    'strat-3': false
  });

  // Admin CRUD Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<SnbtCountdownTarget | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [searchTargetQuery, setSearchTargetQuery] = useState<string>('');

  // Target Form Values
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    targetDateLocal: '',
    badge: 'SNBT 2026',
    badgeColor: 'from-rose-500 to-amber-500',
    isMain: false,
    description: '',
    locationInfo: ''
  });

  // Ensure selectedTarget is always valid
  const selectedTarget = useMemo(() => {
    return (
      targets.find(t => t.id === selectedTargetId) ||
      targets[0] ||
      SNBT_COUNTDOWN_TARGETS[0]
    );
  }, [targets, selectedTargetId]);

  const [time, setTime] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(selectedTarget.targetDateIso)
  );

  // Update timer every second
  useEffect(() => {
    const updateTimer = () => {
      setTime(calculateTimeRemaining(selectedTarget.targetDateIso));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedTarget]);

  // Determine if time is under 24 hours (< 24 hours remaining)
  const isTimeUnder24Hours = useMemo(() => {
    return (
      !time.isPast &&
      ((time.days === 0 && (time.hours > 0 || time.minutes > 0 || time.seconds > 0)) ||
        (time.totalMs > 0 && time.totalMs < 24 * 60 * 60 * 1000))
    );
  }, [time]);

  // Effective urgency state (actual under 24h OR interactive simulation preview)
  const isUrgent = isTimeUnder24Hours || simulateUrgent;

  // Display time: If simulating urgent, show a simulated < 24h countdown (e.g. 14 jam 32 m 45 s)
  const displayDays = simulateUrgent && !isTimeUnder24Hours ? 0 : time.days;
  const displayHours = simulateUrgent && !isTimeUnder24Hours ? 14 : time.hours;
  const displayMinutes = simulateUrgent && !isTimeUnder24Hours ? 35 : time.minutes;
  const displaySeconds = simulateUrgent && !isTimeUnder24Hours ? time.seconds : time.seconds;

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Open Form to Create New Target
  const handleOpenCreateModal = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    defaultDate.setHours(7, 15, 0, 0);

    setEditingTargetId(null);
    setFormData({
      title: '',
      subtitle: '',
      targetDateLocal: toDatetimeLocalValue(defaultDate.toISOString()),
      badge: 'TRYOUT SNBT',
      badgeColor: 'from-amber-500 to-orange-500',
      isMain: false,
      description: 'Pastikan persiapan materi dan kelengkapan dokumen telah selesai.',
      locationInfo: 'Pusat UTBK PTN Terpilih'
    });
    setIsFormModalOpen(true);
  };

  // Open Form to Edit Target
  const handleOpenEditModal = (target: SnbtCountdownTarget) => {
    setEditingTargetId(target.id);
    setFormData({
      title: target.title,
      subtitle: target.subtitle,
      targetDateLocal: toDatetimeLocalValue(target.targetDateIso),
      badge: target.badge,
      badgeColor: target.badgeColor,
      isMain: target.isMain,
      description: target.description,
      locationInfo: target.locationInfo || ''
    });
    setIsFormModalOpen(true);
  };

  // Quick Preset Date Applicator in Form
  const applyDatePreset = (presetIso: string) => {
    setFormData(prev => ({
      ...prev,
      targetDateLocal: toDatetimeLocalValue(presetIso)
    }));
  };

  // Save Target (Create or Update)
  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      if (onShowToast) {
        onShowToast('Judul countdown target tidak boleh kosong', 'error');
      }
      return;
    }

    if (!formData.targetDateLocal) {
      if (onShowToast) {
        onShowToast('Silakan pilih tanggal dan jam pelaksanaan ujian', 'error');
      }
      return;
    }

    const targetDateIso = fromDatetimeLocalValue(formData.targetDateLocal);
    const targetDateFormatted = formatTargetDateToIndonesian(targetDateIso);

    let updatedTargets: SnbtCountdownTarget[] = [];

    if (editingTargetId) {
      // UPDATE
      updatedTargets = targets.map(t => {
        if (t.id === editingTargetId) {
          return {
            ...t,
            title: formData.title.trim(),
            subtitle: formData.subtitle.trim(),
            targetDateIso,
            targetDateFormatted,
            badge: formData.badge.trim().toUpperCase() || 'SNBT',
            badgeColor: formData.badgeColor,
            isMain: formData.isMain,
            description: formData.description.trim(),
            locationInfo: formData.locationInfo.trim()
          };
        }
        // If this one is main, unset others
        if (formData.isMain) {
          return { ...t, isMain: false };
        }
        return t;
      });

      if (onShowToast) {
        onShowToast(`Target "${formData.title}" berhasil diperbarui!`, 'success');
      }
    } else {
      // CREATE
      const newId = `target-${Date.now()}`;
      const newTarget: SnbtCountdownTarget = {
        id: newId,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        targetDateIso,
        targetDateFormatted,
        badge: formData.badge.trim().toUpperCase() || 'SNBT',
        badgeColor: formData.badgeColor,
        isMain: formData.isMain,
        description: formData.description.trim(),
        locationInfo: formData.locationInfo.trim()
      };

      if (formData.isMain) {
        updatedTargets = targets.map(t => ({ ...t, isMain: false }));
        updatedTargets.unshift(newTarget);
      } else {
        updatedTargets = [newTarget, ...targets];
      }

      setSelectedTargetId(newId);

      if (onShowToast) {
        onShowToast(`Target baru "${formData.title}" berhasil ditambahkan!`, 'success');
      }
    }

    setTargets(updatedTargets);
    saveStoredSnbtCountdownTargets(updatedTargets);
    setIsFormModalOpen(false);
  };

  // Delete Target
  const handleDeleteTarget = (targetToDelete: SnbtCountdownTarget) => {
    if (targets.length <= 1) {
      if (onShowToast) {
        onShowToast('Tidak dapat menghapus target terakhir. Minimal harus ada 1 target countdown.', 'error');
      }
      setDeleteConfirmTarget(null);
      return;
    }

    const updatedTargets = targets.filter(t => t.id !== targetToDelete.id);

    // If deleted target was main, make the first one main
    if (targetToDelete.isMain && updatedTargets.length > 0) {
      updatedTargets[0].isMain = true;
    }

    // If deleted target was active, change selectedTargetId
    if (selectedTargetId === targetToDelete.id) {
      setSelectedTargetId(updatedTargets[0]?.id || '');
    }

    setTargets(updatedTargets);
    saveStoredSnbtCountdownTargets(updatedTargets);
    setDeleteConfirmTarget(null);

    if (onShowToast) {
      onShowToast(`Target "${targetToDelete.title}" berhasil dihapus.`, 'info');
    }
  };

  // Duplicate Target
  const handleDuplicateTarget = (target: SnbtCountdownTarget) => {
    const newId = `target-copy-${Date.now()}`;
    const duplicated: SnbtCountdownTarget = {
      ...target,
      id: newId,
      title: `${target.title} (Salinan)`,
      isMain: false
    };

    const updatedTargets = [duplicated, ...targets];
    setTargets(updatedTargets);
    saveStoredSnbtCountdownTargets(updatedTargets);
    setSelectedTargetId(newId);

    if (onShowToast) {
      onShowToast(`Target berhasil disalin sebagai "${duplicated.title}".`, 'success');
    }
  };

  // Set Target as Main Default
  const handleSetMainTarget = (targetId: string) => {
    const updatedTargets = targets.map(t => ({
      ...t,
      isMain: t.id === targetId
    }));
    setTargets(updatedTargets);
    saveStoredSnbtCountdownTargets(updatedTargets);

    const tgt = updatedTargets.find(t => t.id === targetId);
    if (onShowToast && tgt) {
      onShowToast(`"${tgt.title}" dijadikan Target Utama Default.`, 'success');
    }
  };

  // Reset to Default SNPMB Targets
  const handleResetToDefaults = () => {
    setTargets(SNBT_COUNTDOWN_TARGETS);
    saveStoredSnbtCountdownTargets(SNBT_COUNTDOWN_TARGETS);
    setSelectedTargetId(SNBT_COUNTDOWN_TARGETS[0].id);
    setResetConfirmOpen(false);

    if (onShowToast) {
      onShowToast('Target countdown berhasil di-reset ke jadwal resmi SNPMB 2026.', 'success');
    }
  };

  // Filtered targets for the Manage modal
  const filteredTargets = useMemo(() => {
    if (!searchTargetQuery.trim()) return targets;
    const q = searchTargetQuery.toLowerCase();
    return targets.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle?.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        t.locationInfo?.toLowerCase().includes(q)
    );
  }, [targets, searchTargetQuery]);

  const checklistDocs = [
    { id: 'doc-1', title: 'Cetak Kartu Tanda Peserta UTBK-SNBT 2026', desc: 'Warna pada kertas HVS putih ukuran A4 tanpa dilipat barcode/foto.' },
    { id: 'doc-2', title: 'Surat Keterangan Lulus (SKL) / Ijazah Legalisir', desc: 'Asli atau fotokopi berstempel basah dari kepala sekolah SMA/MA.' },
    { id: 'doc-3', title: 'Kartu Identitas Diri (KTP / Kartu Pelajar Asli)', desc: 'Identitas resmi yang memuat foto dan NIK/NISN sesuai akun SNPMB.' },
    { id: 'doc-4', title: 'Pakaian Formal Rapi & Sepatu Tertutup', desc: 'Kemeja berkerah, celana/rok kain gelap panjang, dilarang kaos oblong/jeans robek.' }
  ];

  const checklistPrep = [
    { id: 'strat-1', title: 'Survei Lokasi Gedung & Ruang Pusat UTBK H-1', desc: 'Cek rute transportasi agar tiba 45 menit sebelum sesi dimulai.' },
    { id: 'strat-2', title: 'Istirahat Cukup & Tidur 7-8 Jam Malam Hari-H', desc: 'Kondisi fisik prima memaksimalkan fokus penalaran kuantitatif & literasi.' },
    { id: 'strat-3', title: 'Simulasi Manajemen Waktu 7 Subtes', desc: 'Alokasi waktu ketat: PU (30m), PPU (15m), PBM (25m), PK (20m), LBI (45m), LBE (30m), PM (30m).' },
    { id: 'strat-4', title: 'Teknik Eliminasi Pilihan Jawaban HOTS', desc: 'Coret opsi yang tidak rasional terlebih dahulu sebelum memilih jawaban terbaik.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner with Gradient & Admin Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  UTBK-SNBT 2026 RESMI
                </span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Pusat UTBK Seluruh Indonesia
                </span>
                <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  {targets.length} Target Terjadwal
                </span>
              </div>

              {/* Mini Countdown Badge in Corner of Title */}
              <SnbtMiniCountdownBadge
                onNavigateTab={onNavigateTab}
                size="xs"
                interactive={false}
              />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Countdown H-x Menuju UTBK-SNBT
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau waktu tersisa secara live, kelola target jadwal ujian (CRUD Admin), atur kesiapan mental & dokumen resmi, serta kuasai 7 subtes seleksi PTN impianmu.
            </p>
          </div>

          {/* Admin Management & Quick Action Toolbar */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(true)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/40 hover:scale-[1.02] transition-all cursor-pointer"
                  title="Kelola & edit semua target countdown (CRUD)"
                >
                  <Settings className="w-4 h-4 text-indigo-200" />
                  <span>Kelola Target (Admin CRUD)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 border border-emerald-400/40 hover:scale-105 transition-all cursor-pointer"
                  title="Tambah countdown jadwal ujian baru"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Target Baru</span>
                </button>
              </div>
            )}

            {/* Target Switcher Pill List */}
            <div className="flex flex-wrap lg:flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {targets.map(target => {
                const isSelected = target.id === selectedTargetId;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setSelectedTargetId(target.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/50 scale-[1.01]'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{target.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 font-mono shrink-0">
                      {target.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Countdown Display Card with Dynamic Warning Pulse Effect when < 24 Hours */}
      <div
        className={`rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-500 ${
          isUrgent
            ? 'bg-gradient-to-b from-slate-900 via-rose-950/40 to-slate-950 border-2 border-rose-500 ring-4 ring-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
            : 'bg-slate-900/90 border border-slate-800/90'
        }`}
      >
        {/* Pulsating Visual Glow Backdrop when Urgent (<24 Hours) */}
        {isUrgent && (
          <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none rounded-3xl" />
        )}

        {/* Top Header Row in Countdown Card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold mb-1 flex-wrap">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span className={isUrgent ? 'text-rose-300 font-extrabold' : 'text-amber-400'}>
                Target: {selectedTarget.targetDateFormatted}
              </span>
              {selectedTarget.isMain && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  TARGET UTAMA
                </span>
              )}
              {isUrgent && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-600 text-white uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  WAKTU KRUSIAL (&lt; 24 JAM)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 flex-wrap">
              <span>{selectedTarget.title}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${selectedTarget.badgeColor}`}>
                {selectedTarget.badge}
              </span>
              {isUrgent && <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce shrink-0" />}
            </h2>
            {selectedTarget.subtitle && (
              <p className="text-xs text-indigo-300 font-medium mt-0.5">
                {selectedTarget.subtitle}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {selectedTarget.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Edit Current Target Button (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedTarget)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 cursor-pointer shadow-sm"
                title="Ubah judul, tanggal, dan data target countdown ini"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Target Ini</span>
              </button>
            )}

            {/* Urgency Simulation Toggle for Live Preview */}
            <button
              type="button"
              onClick={() => setSimulateUrgent(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                simulateUrgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/20 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border-slate-700/60'
              }`}
              title="Aktifkan simulasi tampilan siaga < 24 jam untuk verifikasi visual"
            >
              <Radio className={`w-3.5 h-3.5 ${simulateUrgent ? 'text-rose-400 animate-spin' : 'text-slate-500'}`} />
              <span>{simulateUrgent ? 'Matikan Simulasi Siaga' : 'Simulasi Siaga < 24 Jam'}</span>
            </button>

            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs text-indigo-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[200px]">{selectedTarget.locationInfo || 'Pusat UTBK PTN'}</span>
            </div>
          </div>
        </div>

        {/* HIGH VISIBILITY URGENT WARNING BANNER WHEN < 24 HOURS */}
        {isUrgent && (
          <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-amber-950/90 border-2 border-rose-500/90 text-white shadow-xl shadow-rose-950/50 relative overflow-hidden animate-pulse">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/40 border border-rose-400/80 flex items-center justify-center shrink-0 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-black rounded bg-rose-600 text-white uppercase tracking-wider shadow-sm">
                      SIAGA TINGGI H-1
                    </span>
                    <span className="font-black text-sm md:text-base text-rose-100">
                      PERINGATAN URGENT: Waktu Ujian Kurang Dari 24 Jam!
                    </span>
                  </div>
                  <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                    Waktu pelaksanaan segera tiba. Pastikan Kartu Peserta UTBK telah dicetak, KTP/SKL legalisir asli telah dimasukkan tas ujian, dan Anda sudah mengetahui rute pasti menuju gedung ujian di Pusat UTBK.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-rose-600/30 text-rose-200 border border-rose-400/40 font-mono font-black text-xs">
                  {displayHours}J : {displayMinutes}M : {displaySeconds}D
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4 Large Digit Cards: Days, Hours, Minutes, Seconds */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 my-6">
          {/* Days */}
          <div
            className={`relative group rounded-2xl p-4 md:p-6 text-center shadow-lg transition-all transform hover:scale-105 ${
              isUrgent
                ? 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-2 border-rose-500/80 shadow-rose-900/30'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-indigo-500/30'
            }`}
          >
            {isUrgent && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black tracking-wider uppercase animate-pulse">
                HARI H
              </div>
            )}
            <div
              className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tight font-mono ${
                isUrgent ? 'text-rose-200' : 'text-white'
              }`}
            >
              {String(displayDays).padStart(2, '0')}
            </div>
            <div
              className={`text-xs md:text-sm font-bold uppercase tracking-wider mt-2 ${
                isUrgent ? 'text-rose-300' : 'text-indigo-300'
              }`}
            >
              Hari Lagi
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {displayDays > 0 ? `H-${displayDays} Ujian` : 'Waktu Hari-H Tiba'}
            </div>
          </div>

          {/* Hours (Pulsing if urgent) */}
          <div
            className={`relative group rounded-2xl p-4 md:p-6 text-center shadow-lg transition-all transform hover:scale-105 ${
              isUrgent
                ? 'bg-gradient-to-b from-rose-950/80 to-slate-900 border-2 border-rose-500 shadow-rose-600/40 ring-2 ring-rose-500/40 animate-pulse'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-rose-500/30'
            }`}
          >
            {isUrgent && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black tracking-wider uppercase shadow-md">
                &lt; 24 JAM
              </div>
            )}
            <div
              className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tight font-mono ${
                isUrgent ? 'text-rose-400' : 'text-white'
              }`}
            >
              {String(displayHours).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-rose-300 mt-2">
              Jam
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isUrgent ? 'Sisa Jam Kritis' : `Setara ${displayDays * 24 + displayHours} Jam Total`}
            </div>
          </div>

          {/* Minutes (Pulsing if urgent) */}
          <div
            className={`relative group rounded-2xl p-4 md:p-6 text-center shadow-lg transition-all transform hover:scale-105 ${
              isUrgent
                ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500/80 shadow-amber-900/30 ring-1 ring-amber-500/40 animate-pulse'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/30'
            }`}
          >
            <div
              className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tight font-mono ${
                isUrgent ? 'text-amber-400' : 'text-white'
              }`}
            >
              {String(displayMinutes).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-amber-300 mt-2">
              Menit
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isUrgent ? 'Hitung Mundur Akurat' : 'Waktu Akurat'}
            </div>
          </div>

          {/* Seconds (Pulsing real-time) */}
          <div
            className={`relative group rounded-2xl p-4 md:p-6 text-center shadow-lg transition-all transform hover:scale-105 ${
              isUrgent
                ? 'bg-gradient-to-b from-rose-950/70 to-slate-900 border-2 border-rose-500 shadow-rose-900/40'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-emerald-500/30'
            }`}
          >
            <div
              className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tight font-mono ${
                isUrgent ? 'text-rose-400 animate-pulse' : 'text-emerald-400 animate-pulse'
              }`}
            >
              {String(displaySeconds).padStart(2, '0')}
            </div>
            <div
              className={`text-xs md:text-sm font-bold uppercase tracking-wider mt-2 ${
                isUrgent ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              Detik
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-ping'}`} />
              <span>Live Real-Time</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Quick Action */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isUrgent ? 'Fokus Siaga: Cek Berkas & Rute Pusat UTBK' : 'Fokus Belajar Harian: 3-4 Jam Terjadwal'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isUrgent
                  ? 'Pastikan tidur cukup 7-8 jam sebelum ujian untuk menjaga ketajaman penalaran.'
                  : 'Latihan 30 soal HOTS per hari = 900+ soal teruji sebelum hari-H.'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Atur Target</span>
            </button>

            {onSetActiveSubtab && (
              <>
                <button
                  type="button"
                  onClick={() => onSetActiveSubtab('roadmap')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Roadmap SNBT</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetActiveSubtab('students')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Data Siswa XII-UTBK</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Preparation Checklists & Subtest Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Official Requirements & Checklist */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Checklist Dokumen & Perlengkapan Wajib
                </h3>
                <p className="text-xs text-slate-400">
                  Wajib dibawa ke ruang ujian di Pusat UTBK
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/30">
              Protokol SNPMB
            </span>
          </div>

          <div className="space-y-3">
            {checklistDocs.map(doc => {
              const isDone = !!checkedItems[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleCheck(doc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        isDone ? 'text-emerald-400 fill-emerald-950' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${isDone ? 'text-emerald-200 line-through opacity-80' : 'text-slate-200'}`}>
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {doc.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tips Hari-H dari Konselor BrainSpace
            </h4>
            <div className="space-y-2">
              {checklistPrep.map(prep => {
                const isDone = !!checkedItems[prep.id];
                return (
                  <div
                    key={prep.id}
                    onClick={() => toggleCheck(prep.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 ${
                      isDone
                        ? 'bg-indigo-950/20 border-indigo-500/40 text-slate-300'
                        : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isDone ? 'text-indigo-400' : 'text-slate-600'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{prep.title}</div>
                      <div className="text-[11px] text-slate-400">{prep.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 7 Subtes Overview & Durasi Ujian */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Struktur 7 Subtes UTBK-SNBT 2026
                </h3>
                <p className="text-xs text-slate-400">
                  Total 155 Soal • Alokasi Waktu 195 Menit
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Sistem IRT
            </span>
          </div>

          {/* Subtest Cards */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-200">1. Penalaran Umum (PU)</div>
                <div className="text-[11px] text-blue-400/80">Induktif, Deduktif, & Kuantitatif</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">30 Soal</div>
                <div className="text-[10px] text-blue-300">30 Menit</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-200">2. Pengetahuan & Pemahaman Umum (PPU)</div>
                <div className="text-[11px] text-cyan-400/80">Makna Kata, Ide Pokok, & Kalimat Efektif</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">20 Soal</div>
                <div className="text-[10px] text-cyan-300">15 Menit</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-200">3. Pemahaman Bacaan & Menulis (PBM)</div>
                <div className="text-[11px] text-amber-400/80">EYD V, Sintaksis, & Kohesi Paragraf</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">20 Soal</div>
                <div className="text-[10px] text-amber-300">25 Menit</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-200">4. Pengetahuan Kuantitatif (PK)</div>
                <div className="text-[11px] text-rose-400/80">Aljabar, Geometri, Peluang & Kecukupan Data</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">15 Soal</div>
                <div className="text-[10px] text-rose-300">20 Menit</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-200">5. Literasi dalam Bahasa Indonesia (LBI)</div>
                <div className="text-[11px] text-emerald-400/80">Teks Informasi, Saintifik & Sastra</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">30 Soal</div>
                <div className="text-[10px] text-emerald-300">45 Menit</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-violet-950/20 border border-violet-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-violet-200">6. Literasi dalam Bahasa Inggris (LBE)</div>
                <div className="text-[11px] text-violet-400/80">Main Idea, Author Tone & Inference</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">20 Soal</div>
                <div className="text-[10px] text-violet-300">30 Menit</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-fuchsia-200">7. Penalaran Matematika (PM)</div>
                <div className="text-[11px] text-fuchsia-400/80">Pemodelan Kontekstual, Aritmatika & Grafik</div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-white">20 Soal</div>
                <div className="text-[10px] text-fuchsia-300">30 Menit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: KELOLA TARGET COUNTDOWN (ADMIN CRUD MANAGER)                      */}
      {/* ========================================================================= */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      Pengaturan & Manajemen Countdown (CRUD)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      Admin Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tambah, ubah tanggal & jam, atur target utama, serta hapus jadwal countdown ujian.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Top Action Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari target ujian atau gelombang..."
                  value={searchTargetQuery}
                  onChange={e => setSearchTargetQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Kembalikan ke daftar jadwal resmi SNPMB"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Target Baru</span>
                </button>
              </div>
            </div>

            {/* Targets List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {filteredTargets.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  Tidak ada target countdown yang cocok dengan pencarian "{searchTargetQuery}".
                </div>
              ) : (
                filteredTargets.map(target => {
                  const isSelected = target.id === selectedTargetId;
                  const targetTime = calculateTimeRemaining(target.targetDateIso);

                  return (
                    <div
                      key={target.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-slate-800/80 border-indigo-500/80 shadow-lg shadow-indigo-950/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${target.badgeColor}`}
                          >
                            {target.badge}
                          </span>
                          <h4 className="font-bold text-sm text-white truncate">
                            {target.title}
                          </h4>
                          {target.isMain && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ⭐ UTAMA
                            </span>
                          )}
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              ✓ AKTIF
                            </span>
                          )}
                        </div>

                        {target.subtitle && (
                          <div className="text-xs text-indigo-300/80">{target.subtitle}</div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 text-amber-300/90">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            {target.targetDateFormatted}
                          </span>
                          {target.locationInfo && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                              {target.locationInfo}
                            </span>
                          )}
                          <span className="font-mono text-indigo-300">
                            {targetTime.isPast
                              ? '(Sudah Terlewat)'
                              : `${targetTime.days} Hari ${targetTime.hours} Jam Lagi`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                        {!isSelected && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTargetId(target.id);
                              if (onShowToast) {
                                onShowToast(`Menampilkan countdown untuk "${target.title}".`, 'info');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
                            title="Tampilkan di card utama"
                          >
                            Pilih
                          </button>
                        )}

                        {!target.isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMainTarget(target.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950/40 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer"
                            title="Jadikan Target Utama"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDuplicateTarget(target)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all cursor-pointer"
                          title="Duplikasi Target"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(target)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 transition-all cursor-pointer"
                          title="Edit Target & Tanggal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget(target)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-all cursor-pointer"
                          title="Hapus Target"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total {targets.length} target countdown tersimpan di sistem.
              </span>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM TAMBAH / EDIT TARGET COUNTDOWN & TANGGAL (CREATE / UPDATE)  */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                  {editingTargetId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingTargetId ? 'Edit Target Countdown & Tanggal' : 'Tambah Target Countdown Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Atur nama ujian, tanggal & waktu pelaksanaan, tema badge, dan informasi lokasi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveTarget} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Judul Target */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Judul Countdown / Nama Ujian <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pelaksanaan UTBK Gelombang 1 / Tryout Akbar Final"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subjudul */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Subjudul / Keterangan Sesi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sesi Pagi Pelaksanaan UTBK-SNBT 2026 Sesi 1"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tanggal & Waktu (Datetime-local) + Quick Presets */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Tanggal & Waktu Pelaksanaan Ujian (WIB)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.targetDateLocal}
                    onChange={e => setFormData({ ...formData, targetDateLocal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  {formData.targetDateLocal && (
                    <div className="text-[11px] text-amber-400 mt-1 font-medium">
                      Terbaca:{' '}
                      {formatTargetDateToIndonesian(fromDatetimeLocalValue(formData.targetDateLocal))}
                    </div>
                  )}
                </div>

                {/* Quick Date Presets */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                    ⚡ Preset Cepat Waktu Ujian:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_DATE_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyDatePreset(preset.getDate())}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 hover:border-indigo-500/40 text-slate-300 border border-slate-700/60 text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badge Label & Badge Color Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Label Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: GELOMBANG 1 / HARI H / SIMAK UI"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Pusat UTBK / Lokasi Ujian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pusat UTBK UI, ITB, UGM / Ruang CBT 3"
                    value={formData.locationInfo}
                    onChange={e => setFormData({ ...formData, locationInfo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Badge Theme Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Pilihan Warna Badge Gradient:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BADGE_COLOR_PALETTES.map(palette => {
                    const isSelected = formData.badgeColor === palette.value;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, badgeColor: palette.value })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${palette.sampleBg} shrink-0`} />
                        <span className="text-[10px] font-bold truncate">{palette.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deskripsi & Petunjuk Peserta */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Deskripsi / Petunjuk Dokumen & Persiapan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pastikan berkas cetak kartu peserta & ijazah/SKL sudah siap di tas ujian."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Toggle Is Main Target */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <input
                  type="checkbox"
                  id="isMainToggle"
                  checked={formData.isMain}
                  onChange={e => setFormData({ ...formData, isMain: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="isMainToggle" className="text-xs text-slate-200 font-bold cursor-pointer">
                  Jadikan sebagai Target Utama Default (Ditampilkan saat awal membuka halaman)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {editingTargetId ? 'Simpan Perubahan' : 'Tambahkan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION DIALOG                                       */}
      {/* ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">Hapus Target Countdown?</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus target{' '}
                <span className="font-bold text-rose-400">"{deleteConfirmTarget.title}"</span>? Data yang dihapus tidak dapat dipulihkan kecuali melakukan reset ke default.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTarget(deleteConfirmTarget)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Ya, Hapus Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESET TO DEFAULTS CONFIRMATION DIALOG                            */}
      {/* ========================================================================= */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">Reset ke Jadwal Default Resmi SNPMB?</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Semua modifikasi jadwal khusus akan dikembalikan ke 4 target resmi UTBK-SNBT 2026 (Gelombang 1, Gelombang 2, Pengumuman Hasil, dan Registrasi Akun).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QUICK_DATE_PRESETS = [
  {
    label: 'Besok Pagi (07:15 WIB)',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(7, 15, 0, 0);
      return d.toISOString();
    }
  },
  {
    label: '+3 Hari',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(7, 15, 0, 0);
      return d.toISOString();
    }
  },
  {
    label: '+7 Hari (Minggu Depan)',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(7, 15, 0, 0);
      return d.toISOString();
    }
  },
  {
    label: '+30 Hari (Bulan Depan)',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      d.setHours(7, 15, 0, 0);
      return d.toISOString();
    }
  },
  {
    label: '22 April 2026 (UTBK Gel. 1)',
    getDate: () => '2026-04-22T07:15:00+07:00'
  },
  {
    label: '05 Mei 2026 (UTBK Gel. 2)',
    getDate: () => '2026-05-05T07:15:00+07:00'
  },
  {
    label: '18 Juni 2026 (Pengumuman)',
    getDate: () => '2026-06-18T15:00:00+07:00'
  },
  {
    label: 'Siaga Urgent (< 12 Jam)',
    getDate: () => {
      const d = new Date(Date.now() + 11 * 60 * 60 * 1000 + 45 * 60 * 1000);
      return d.toISOString();
    }
  }
];
