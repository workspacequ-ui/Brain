import React, { useState, useEffect } from 'react';
import { SnbtMilestone } from './snbtData';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Award,
  Lightbulb,
  Compass,
  Calendar,
  Layers,
  Save,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  Sliders,
  Flame,
  Check
} from 'lucide-react';

interface SnbtRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: SnbtMilestone) => void;
  initialMilestone?: SnbtMilestone | null;
  existingCount: number;
}

const DEFAULT_ACTIVITY_PRESETS = [
  'Tryout Diagnostik Awal (Baseline Test IRT)',
  'Drill Harian 30 Soal Subtes Berbasis Timer',
  'Workshop Bedah Soal Penalaran Matematika Kontekstual',
  'Registrasi & Verifikasi Simpan Permanen Akun SNPMB',
  'Sesi Literasi Membaca Cepat (Skimming & Scanning) Teks Saintifik',
  'Klinik Konsultasi Pemilihan Jurusan & Passing Grade PTN',
  'Drill Kilat Paket Ujian Full 155 Soal / 195 Menit',
  'Briefing Akhir H-3 & Pengecekan Lokasi Pusat UTBK',
  'Evaluasi Kelemahan Subtes via Rapor Grafik IRT'
];

const DEFAULT_DELIVERABLE_PRESETS = [
  'Rapor Baseline Profil Kemampuan Siswa',
  'Peta Target Skor per Subtes (Target ≥ 700)',
  'Portofolio Hasil Latihan 1.500+ Soal HOTS',
  'Bukti Cetak Simpan Permanen Akun SNPMB Siswa',
  'Kartu Peserta Ujian UTBK-SNBT Tercetak Rapi',
  'Laporan Skor Tryout IRT Mingguan',
  'Sertifikat Resmi Nilai UTBK untuk Daftar Ulang PTN',
  'Rekomendasi Rasio Peluang Masuk Prodi PTN'
];

const BADGE_PRESETS = [
  'FONDASE & DIAGNOSTIK',
  'PENDALAMAN HOTS',
  'SIMULASI & REGISTRASI',
  'FINAL SPRINT & STRATEGI',
  'EKSEKUSI & PENGUMUMAN',
  'INTENSIF DRILL',
  'EVALUASI AKADEMIK',
  'SELEKSI PTN'
];

export const SnbtRoadmapModal: React.FC<SnbtRoadmapModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMilestone,
  existingCount
}) => {
  const isEdit = !!initialMilestone;

  const [phaseNumber, setPhaseNumber] = useState<number>(existingCount + 1);
  const [phaseName, setPhaseName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING'>('UPCOMING');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [badgeTag, setBadgeTag] = useState<string>('FASE STRATEGIS');
  const [description, setDescription] = useState<string>('');
  const [keyActivities, setKeyActivities] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [tips, setTips] = useState<string>('');

  const [newActivityInput, setNewActivityInput] = useState<string>('');
  const [newDeliverableInput, setNewDeliverableInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMilestone) {
        setPhaseNumber(initialMilestone.phaseNumber || 1);
        setPhaseName(initialMilestone.phaseName || '');
        setTitle(initialMilestone.title || '');
        setSubtitle(initialMilestone.subtitle || '');
        setDateRange(initialMilestone.dateRange || '');
        setStatus(initialMilestone.status || 'UPCOMING');
        setProgressPercentage(initialMilestone.progressPercentage ?? 0);
        setBadgeTag(initialMilestone.badgeTag || 'FASE STRATEGIS');
        setDescription(initialMilestone.description || '');
        setKeyActivities(initialMilestone.keyActivities ? [...initialMilestone.keyActivities] : []);
        setDeliverables(initialMilestone.deliverables ? [...initialMilestone.deliverables] : []);
        setTips(initialMilestone.tips || '');
      } else {
        const nextNum = existingCount + 1;
        setPhaseNumber(nextNum);
        setPhaseName(`Fase ${nextNum}: Target & Pemantapan Baru`);
        setTitle('');
        setSubtitle(`Bulan ${nextNum * 2 - 1} - ${nextNum * 2}`);
        setDateRange('');
        setStatus('UPCOMING');
        setProgressPercentage(0);
        setBadgeTag('INTENSIF SNBT');
        setDescription('');
        setKeyActivities([]);
        setDeliverables([]);
        setTips('');
      }
      setNewActivityInput('');
      setNewDeliverableInput('');
      setErrorMsg(null);
      setActiveTab('form');
    }
  }, [isOpen, initialMilestone, existingCount]);

  if (!isOpen) return null;

  const handleAddActivity = (textToAdd?: string) => {
    const val = (textToAdd || newActivityInput).trim();
    if (!val) return;
    if (keyActivities.includes(val)) return;
    setKeyActivities([...keyActivities, val]);
    if (!textToAdd) setNewActivityInput('');
  };

  const handleRemoveActivity = (index: number) => {
    setKeyActivities(keyActivities.filter((_, i) => i !== index));
  };

  const handleMoveActivity = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= keyActivities.length) return;
    const updated = [...keyActivities];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setKeyActivities(updated);
  };

  const handleAddDeliverable = (textToAdd?: string) => {
    const val = (textToAdd || newDeliverableInput).trim();
    if (!val) return;
    if (deliverables.includes(val)) return;
    setDeliverables([...deliverables, val]);
    if (!textToAdd) setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleMoveDeliverable = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= deliverables.length) return;
    const updated = [...deliverables];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setDeliverables(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul fase tidak boleh kosong.');
      return;
    }
    if (!phaseName.trim()) {
      setErrorMsg('Nama fase (contoh: "Fase 1: Diagnostik & Fondasi") wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Deskripsi fase roadmap wajib diisi.');
      return;
    }

    const milestoneData: SnbtMilestone = {
      id: initialMilestone?.id || `snbt-phase-${Date.now()}`,
      phaseNumber: Number(phaseNumber) || 1,
      phaseName: phaseName.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() || `Fase ${phaseNumber}`,
      dateRange: dateRange.trim() || 'Sesuai Jadwal SNPMB',
      status,
      progressPercentage: Math.min(100, Math.max(0, Number(progressPercentage) || 0)),
      badgeTag: (badgeTag.trim() || 'ROADMAP SNBT').toUpperCase(),
      description: description.trim(),
      keyActivities: keyActivities.length > 0 ? keyActivities : ['Latihan soal dan pendalaman materi sesuai silabus UTBK.'],
      deliverables: deliverables.length > 0 ? deliverables : ['Penguasaan konsep dan target nilai subtes tercapai.'],
      tips: tips.trim() || 'Fokus pada strategi manajemen waktu dan evaluasi mandiri secara konsisten.'
    };

    onSave(milestoneData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">
                  {isEdit ? 'Mode Edit Fase Roadmap' : 'Tambah Fase Roadmap Baru'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  UTBK-SNBT 2026
                </span>
              </div>
              <h2 className="text-lg font-black text-white">
                {isEdit ? `Edit: ${phaseName || title}` : 'Konfigurasi Fase & Kurikulum SNBT'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Form / Preview Tab Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Form Input
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'form' ? (
            <form id="roadmap-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Nomor Fase & Status & Progres */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nomor Urut Fase <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={phaseNumber}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setPhaseNumber(val);
                      if (!isEdit || phaseName.startsWith('Fase ')) {
                        setPhaseName(`Fase ${val}: ${title || 'Target Baru'}`);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Status Pelaksanaan <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={e => {
                      const newStatus = e.target.value as any;
                      setStatus(newStatus);
                      if (newStatus === 'COMPLETED' && progressPercentage < 100) {
                        setProgressPercentage(100);
                      } else if (newStatus === 'UPCOMING' && progressPercentage > 50) {
                        setProgressPercentage(0);
                      } else if (newStatus === 'IN_PROGRESS' && (progressPercentage === 0 || progressPercentage === 100)) {
                        setProgressPercentage(50);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="UPCOMING">Akan Datang (Upcoming)</option>
                    <option value="IN_PROGRESS">Sedang Berjalan (Active / In Progress)</option>
                    <option value="COMPLETED">Selesai (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Progres Capaian ({progressPercentage}%)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressPercentage}
                      onChange={e => setProgressPercentage(parseInt(e.target.value) || 0)}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between gap-1">
                      {[0, 25, 50, 75, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setProgressPercentage(val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                            progressPercentage === val
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Nama Fase & Judul Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Label Nama Fase <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={phaseName}
                    onChange={e => setPhaseName(e.target.value)}
                    placeholder="Contoh: Fase 1: Diagnostik & Fondasi Konsep"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ditampilkan sebagai header judul fase.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Judul Inti Fokus Fase <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      if (!isEdit && (!phaseName || phaseName.startsWith(`Fase ${phaseNumber}:`))) {
                        setPhaseName(`Fase ${phaseNumber}: ${e.target.value}`);
                      }
                    }}
                    placeholder="Contoh: Pemetaan Awal & Penguasaan Konsep Esensial"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Subtitle, Jadwal Rentang Waktu, & Badge Tag */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Sub-judul Periode
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="Contoh: Bulan 1 - 2 (Juli - September)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Rentang Waktu / Kalender
                  </label>
                  <input
                    type="text"
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    placeholder="Contoh: Juli - September"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tag / Badge Fase
                  </label>
                  <input
                    type="text"
                    value={badgeTag}
                    onChange={e => setBadgeTag(e.target.value.toUpperCase())}
                    placeholder="Contoh: FONDASE & DIAGNOSTIK"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 uppercase font-mono text-xs"
                  />
                  {/* Quick Preset Tags */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {BADGE_PRESETS.slice(0, 4).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setBadgeTag(tag)}
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deskripsi Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Deskripsi Lengkap & Panduan Fase <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan, ruang lingkup, dan sasaran kompetensi siswa pada fase ini..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  required
                />
              </div>

              {/* Dynamic Section: Aktivitas Utama (Key Activities) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Daftar Aktivitas Utama ({keyActivities.length} Butir)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Aktivitas belajar / drill harian
                  </span>
                </div>

                {/* Add Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityInput}
                    onChange={e => setNewActivityInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddActivity();
                      }
                    }}
                    placeholder="Ketik aktivitas baru lalu tekan Enter / Tambah..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddActivity()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>

                {/* Preset suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Saran Cepat:</span>
                  {DEFAULT_ACTIVITY_PRESETS.slice(0, 4).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddActivity(preset)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-300 hover:border-blue-500/40 transition-colors cursor-pointer"
                    >
                      + {preset.length > 28 ? preset.substring(0, 28) + '...' : preset}
                    </button>
                  ))}
                </div>

                {/* List items */}
                {keyActivities.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {keyActivities.map((act, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-slate-200 truncate">{act}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveActivity(index, 'up')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === keyActivities.length - 1}
                            onClick={() => handleMoveActivity(index, 'down')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(index)}
                            className="p-1 rounded hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Belum ada aktivitas. Tambahkan di atas atau gunakan saran cepat.
                  </p>
                )}
              </div>

              {/* Dynamic Section: Target & Luaran Hasil (Deliverables) */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Target & Luaran Hasil ({deliverables.length} Butir)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Output & deliverables yang harus dicapai
                  </span>
                </div>

                {/* Add Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverableInput}
                    onChange={e => setNewDeliverableInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Ketik target/luaran baru lalu tekan Enter / Tambah..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDeliverable()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>

                {/* Preset suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Saran Cepat:</span>
                  {DEFAULT_DELIVERABLE_PRESETS.slice(0, 4).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddDeliverable(preset)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors cursor-pointer"
                    >
                      + {preset.length > 28 ? preset.substring(0, 28) + '...' : preset}
                    </button>
                  ))}
                </div>

                {/* List items */}
                {deliverables.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {deliverables.map((del, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 truncate">{del}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveDeliverable(index, 'up')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === deliverables.length - 1}
                            onClick={() => handleMoveDeliverable(index, 'down')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(index)}
                            className="p-1 rounded hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Belum ada target luaran. Tambahkan di atas atau gunakan saran cepat.
                  </p>
                )}
              </div>

              {/* Tips Strategi Ahli */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tips Strategi Ahli & Catatan Konselor
                </label>
                <textarea
                  rows={2}
                  value={tips}
                  onChange={e => setTips(e.target.value)}
                  placeholder="Contoh: Fokus pada pemahaman logika konsep, hindari sekadar menghafal rumus cepat..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                />
              </div>
            </form>
          ) : (
            /* Live Preview Card */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Berikut adalah pratinjau tampilan kartu fase roadmap bagi siswa & pengajar:</span>
              </div>

              {/* Mini Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/90 to-slate-900 border border-blue-500 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase">
                    FASE {phaseNumber}
                  </span>
                  {status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Selesai
                    </span>
                  ) : status === 'IN_PROGRESS' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      Akan Datang
                    </span>
                  )}
                </div>

                <div className="font-bold text-sm text-white">
                  {title || 'Judul Fase Roadmap'}
                </div>
                <div className="text-xs text-slate-400">
                  {dateRange || 'Rentang Waktu Kalender'}
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Progres</span>
                    <span className="font-mono font-bold text-slate-300">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === 'COMPLETED'
                          ? 'bg-emerald-400'
                          : status === 'IN_PROGRESS'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Full Detailed View Preview */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase">
                        {badgeTag || 'ROADMAP SNBT'}
                      </span>
                      <span className="text-xs text-slate-400">{subtitle || 'Periode Belajar'}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-white">
                      {phaseName || `Fase ${phaseNumber}`}: {title || 'Judul Utama Fase'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-200 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{dateRange || 'Belum diatur'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {description || 'Deskripsi fase belum ditulis...'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Aktivitas Utama</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {keyActivities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target & Luaran</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tips Strategi Ahli</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed italic">
                      "{tips || 'Belum ada tips ahli'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Kembali ke Form
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan Fase' : 'Simpan Fase Baru'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
