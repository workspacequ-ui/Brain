import React, { useState } from 'react';
import {
  X,
  School,
  MapPin,
  Target,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Users,
  Search,
  Filter,
  Save,
  Phone,
  Globe,
  AlertTriangle,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  LabschoolCampusItem,
  DEFAULT_LABSCHOOL_CAMPUSES,
  saveStoredCampuses
} from './labschoolCampusData';
import { User, SidebarTab } from '../../types';

interface LabschoolCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: LabschoolCampusItem[];
  setCampuses: React.Dispatch<React.SetStateAction<LabschoolCampusItem[]>>;
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
  initialSelectedCampusId?: string;
}

export const LabschoolCampusModal: React.FC<LabschoolCampusModalProps> = ({
  isOpen,
  onClose,
  campuses,
  setCampuses,
  user,
  onNavigateTab,
  initialSelectedCampusId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<'ALL' | 'JAKARTA' | 'BANTEN_JABAR'>('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<LabschoolCampusItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for Create / Edit
  const [formState, setFormState] = useState<LabschoolCampusItem>({
    id: '',
    name: '',
    unit: 'SMP & SMA Labschool',
    loc: '',
    address: '',
    desc: '',
    badge: 'Kampus Unggulan',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
    quotaSmp: 180,
    quotaSma: 200,
    passingGradeSmp: 82.0,
    passingGradeSma: 84.0,
    accreditation: 'Terakreditasi A Unggul',
    ratioKeketatan: '1 : 5.0',
    accentColor: 'blue',
    features: ['Laboratorium Digital', 'Bilingual Program', 'Pembinaan Prestasi'],
    contactWa: '081200000000',
    website: 'https://labschoolunj.sch.id'
  });

  const [featuresInput, setFeaturesInput] = useState('');

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingCampus(null);
    const newId = `camp-${Date.now()}`;
    setFormState({
      id: newId,
      name: '',
      unit: 'SMP & SMA Labschool',
      loc: '',
      address: '',
      desc: '',
      badge: 'Kampus Baru Labschool',
      imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=80',
      quotaSmp: 180,
      quotaSma: 200,
      passingGradeSmp: 82.0,
      passingGradeSma: 84.0,
      accreditation: 'Terakreditasi A Unggul',
      ratioKeketatan: '1 : 4.5',
      accentColor: 'rose',
      features: ['Akses Lokasi Strategis', 'Smart Classroom & AI Lab', 'Bimbingan PSB 2027'],
      contactWa: '',
      website: ''
    });
    setFeaturesInput('Akses Lokasi Strategis, Smart Classroom & AI Lab, Bimbingan PSB 2027');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (campus: LabschoolCampusItem) => {
    setIsCreatingNew(false);
    setEditingCampus(campus);
    setFormState({
      ...campus,
      imageUrl: campus.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80'
    });
    setFeaturesInput(campus.features.join(', '));
    setIsEditModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      showNotification('error', 'Nama kampus tidak boleh kosong.');
      return;
    }

    const parsedFeatures = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const updatedCampusItem: LabschoolCampusItem = {
      ...formState,
      features: parsedFeatures.length > 0 ? parsedFeatures : formState.features,
      quotaSmp: Number(formState.quotaSmp) || 180,
      quotaSma: Number(formState.quotaSma) || 200,
      passingGradeSmp: Number(formState.passingGradeSmp) || 80.0,
      passingGradeSma: Number(formState.passingGradeSma) || 82.0
    };

    let updatedList: LabschoolCampusItem[];
    if (isCreatingNew) {
      updatedList = [...campuses, updatedCampusItem];
      showNotification('success', `Kampus "${updatedCampusItem.name}" berhasil ditambahkan.`);
    } else {
      updatedList = campuses.map((c) => (c.id === updatedCampusItem.id ? updatedCampusItem : c));
      showNotification('success', `Data & Passing Grade "${updatedCampusItem.name}" berhasil diperbarui.`);
    }

    setCampuses(updatedList);
    saveStoredCampuses(updatedList);
    setIsEditModalOpen(false);
  };

  const handleDeleteCampus = (id: string) => {
    const campusToDelete = campuses.find((c) => c.id === id);
    const updatedList = campuses.filter((c) => c.id !== id);
    setCampuses(updatedList);
    saveStoredCampuses(updatedList);
    setDeleteConfirmId(null);
    showNotification('success', `Kampus "${campusToDelete?.name || id}" berhasil dihapus.`);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset data kampus ke 5 kampus resmi default (Rawamangun, Kebayoran, Cibubur, Cirendeu, Bintaro)?')) {
      setCampuses(DEFAULT_LABSCHOOL_CAMPUSES);
      saveStoredCampuses(DEFAULT_LABSCHOOL_CAMPUSES);
      showNotification('success', 'Data berhasil direset ke 5 Kampus Standar BPS Labschool.');
    }
  };

  // Filter logic
  const filteredCampuses = campuses.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.badge.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRegion === 'JAKARTA') {
      return camp.loc.toLowerCase().includes('jakarta');
    }
    if (filterRegion === 'BANTEN_JABAR') {
      return !camp.loc.toLowerCase().includes('jakarta');
    }
    return true;
  });

  // Calculate statistics
  const totalSmpQuota = campuses.reduce((sum, c) => sum + (c.quotaSmp || 0), 0);
  const totalSmaQuota = campuses.reduce((sum, c) => sum + (c.quotaSma || 0), 0);
  const avgPassingSmp = campuses.length > 0
    ? (campuses.reduce((sum, c) => sum + (c.passingGradeSmp || 0), 0) / campuses.length).toFixed(1)
    : '0.0';
  const avgPassingSma = campuses.length > 0
    ? (campuses.reduce((sum, c) => sum + (c.passingGradeSma || 0), 0) / campuses.length).toFixed(1)
    : '0.0';

  const accentStyles: Record<string, { card: string; badge: string; text: string; barSmp: string; barSma: string }> = {
    blue: {
      card: 'border-blue-500/40 bg-slate-900/90 shadow-blue-500/5',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      text: 'text-blue-400',
      barSmp: 'bg-amber-500',
      barSma: 'bg-blue-500'
    },
    emerald: {
      card: 'border-emerald-500/40 bg-slate-900/90 shadow-emerald-500/5',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-400',
      barSmp: 'bg-amber-500',
      barSma: 'bg-emerald-500'
    },
    amber: {
      card: 'border-amber-500/40 bg-slate-900/90 shadow-amber-500/5',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      text: 'text-amber-400',
      barSmp: 'bg-amber-500',
      barSma: 'bg-orange-500'
    },
    purple: {
      card: 'border-purple-500/40 bg-slate-900/90 shadow-purple-500/5',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      text: 'text-purple-400',
      barSmp: 'bg-amber-500',
      barSma: 'bg-purple-500'
    },
    rose: {
      card: 'border-rose-500/40 bg-slate-900/90 shadow-rose-500/5',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      text: 'text-rose-400',
      barSmp: 'bg-amber-500',
      barSma: 'bg-rose-500'
    },
    teal: {
      card: 'border-teal-500/40 bg-slate-900/90 shadow-teal-500/5',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      text: 'text-teal-400',
      barSmp: 'bg-amber-500',
      barSma: 'bg-teal-500'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-slate-200 max-h-[92vh] flex flex-col my-auto">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Data 5 Kampus Labschool & Standar Passing Grade
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PSB 2027
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola data profil kampus, kuota daya tampung, dan pembobotan passing grade SMP & SMA Labschool.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            className={`my-3 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {feedbackMsg.text}
            </span>
            <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">
              Tutup
            </button>
          </div>
        )}

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Total Kampus Labschool</span>
            <span className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
              <School className="w-4 h-4 text-blue-400" />
              {campuses.length} Kampus
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Rata-rata Passing Grade SMP</span>
            <span className="text-lg font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
              <Target className="w-4 h-4 text-amber-400" />
              {avgPassingSmp} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Rata-rata Passing Grade SMA</span>
            <span className="text-lg font-black text-emerald-300 flex items-center gap-1.5 mt-0.5">
              <Target className="w-4 h-4 text-emerald-400" />
              {avgPassingSma} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Total Kuota PSB 2027</span>
            <span className="text-lg font-black text-cyan-300 flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-cyan-400" />
              {totalSmpQuota + totalSmaQuota} Kursi
            </span>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Admin CRUD Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 shrink-0">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kampus (Rawamangun, Kebayoran, Bintaro, dll)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setFilterRegion('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterRegion === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterRegion('JAKARTA')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterRegion === 'JAKARTA' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                DKI Jakarta
              </button>
              <button
                type="button"
                onClick={() => setFilterRegion('BANTEN_JABAR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterRegion === 'BANTEN_JABAR' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tangsel / Jabar
              </button>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kampus</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetToDefault}
              title="Reset ke 5 Kampus Default"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
          </div>
        </div>

        {/* Campuses Cards Scrollable Grid Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {filteredCampuses.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
              <School className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Tidak ada kampus yang cocok dengan pencarian.</p>
              <p className="text-xs text-slate-500">Coba ganti kata kunci atau reset filter pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampuses.map((camp) => {
                const style = accentStyles[camp.accentColor] || accentStyles.blue;
                const isSelected = initialSelectedCampusId === camp.id;

                return (
                  <div
                    key={camp.id}
                    className={`rounded-3xl border ${style.card} p-5 space-y-4 relative transition-all overflow-hidden ${
                      isSelected ? 'ring-2 ring-blue-400 scale-[1.01]' : ''
                    }`}
                  >
                    {/* Visual Banner Image inside Card */}
                    <div className="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                      <img
                        src={camp.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80'}
                        alt={camp.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.85]"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${style.badge}`}>
                          {camp.badge}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-700/60 font-semibold">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span>{camp.loc}</span>
                        </div>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                        <div>
                          <h4 className="text-sm font-black text-white drop-shadow-md flex items-center gap-1.5">
                            {camp.name}
                            {camp.id === 'camp-bintaro' && (
                              <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white">
                                BARU
                              </span>
                            )}
                          </h4>
                          <p className={`text-[11px] font-bold ${style.text} drop-shadow`}>{camp.unit}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 backdrop-blur-md">
                          Akreditasi A
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">{camp.desc}</p>

                    {/* PASSING GRADE METRICS BOX */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-amber-400" />
                          Standar Passing Grade PSB:
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Rasio {camp.ratioKeketatan}
                        </span>
                      </div>

                      {/* SMP Passing Grade Row */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 text-[11px] font-semibold">1. SMP Labschool</span>
                          <span className="font-bold text-amber-300 font-mono">
                            {camp.passingGradeSmp.toFixed(1)} <span className="text-[10px] text-slate-400">/ 100</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, camp.passingGradeSmp))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Kuota: {camp.quotaSmp} Siswa</span>
                          <span className="text-emerald-400 font-medium">Terakreditasi A</span>
                        </div>
                      </div>

                      {/* SMA Passing Grade Row */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 text-[11px] font-semibold">2. SMA Labschool</span>
                          <span className="font-bold text-emerald-300 font-mono">
                            {camp.passingGradeSma.toFixed(1)} <span className="text-[10px] text-slate-400">/ 100</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, camp.passingGradeSma))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Kuota: {camp.quotaSma} Siswa</span>
                          <span className="text-emerald-400 font-medium">Terakreditasi A Unggul</span>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Keunggulan & Fasilitas Utama
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {camp.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Address Snippet */}
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      <strong className="text-slate-300">Alamat:</strong> {camp.address}
                    </p>

                    {/* Card Actions Footer (Edit & Delete for Admin, Roadmap CTA for all) */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(camp)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit & Passing Grade</span>
                            </button>

                            {deleteConfirmId === camp.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCampus(camp.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-[11px]"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(camp.id)}
                                title="Hapus Kampus"
                                className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar di PSB 2027
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateTab('labschool_roadmap');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <span>Roadmap Seleksi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            * Passing grade merupakan indikator skor kelulusan terkalibrasi hasil tryout dan tes CBT resmi BPS Labschool.
          </p>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors ml-auto"
          >
            Tutup Halaman Data
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ADMIN CRUD MODAL: EDIT / CREATE CAMPUS DATA & PASSING GRADE */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 my-auto max-h-[92vh] overflow-y-auto space-y-5">
            
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isCreatingNew ? 'Tambah Kampus Labschool Baru' : `Edit Kampus & Passing Grade: ${editingCampus?.name}`}
                </h3>
                <p className="text-xs text-slate-400">
                  Atur nilai passing grade, kuota siswa, alamat, deskripsi, dan fitur keunggulan.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              
              {/* Campus Name & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Nama Kampus Labschool <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Contoh: Labschool Bintaro"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Unit Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.unit}
                    onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
                    placeholder="Contoh: SMP & SMA Labschool Bintaro"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* PASSING GRADE SMP & PASSING GRADE SMA (CRITICAL ADMIN FEATURE) */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Pengaturan Passing Grade PSB 2027 (Skala 0 - 100)
                  </h4>
                  <span className="text-[10px] text-amber-400 font-bold">Wajib Diisi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-200 font-semibold block mb-1">
                      Passing Grade SMP Labschool (Skala 100)
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={formState.passingGradeSmp}
                        onChange={(e) => setFormState({ ...formState, passingGradeSmp: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-transparent text-sm font-bold text-amber-300 focus:outline-none font-mono"
                      />
                      <span className="text-xs text-slate-400 font-bold">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Standar kelulusan jalur CBT SMP</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-200 font-semibold block mb-1">
                      Passing Grade SMA Labschool (Skala 100)
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={formState.passingGradeSma}
                        onChange={(e) => setFormState({ ...formState, passingGradeSma: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-transparent text-sm font-bold text-emerald-300 focus:outline-none font-mono"
                      />
                      <span className="text-xs text-slate-400 font-bold">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Standar kelulusan jalur CBT SMA</span>
                  </div>
                </div>
              </div>

              {/* Quota SMP & SMA, Ratio Keketatan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Kuota Siswa SMP (Kursi)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={formState.quotaSmp}
                    onChange={(e) => setFormState({ ...formState, quotaSmp: parseInt(e.target.value) || 180 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Kuota Siswa SMA (Kursi)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={formState.quotaSma}
                    onChange={(e) => setFormState({ ...formState, quotaSma: parseInt(e.target.value) || 200 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Rasio Keketatan Seleksi
                  </label>
                  <input
                    type="text"
                    value={formState.ratioKeketatan}
                    onChange={(e) => setFormState({ ...formState, ratioKeketatan: e.target.value })}
                    placeholder="Contoh: 1 : 4.5"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Location, Badge, Accent Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Lokasi Wilayah Singkat
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.loc}
                    onChange={(e) => setFormState({ ...formState, loc: e.target.value })}
                    placeholder="Contoh: Tangerang Selatan (Bintaro)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Badge / Label Keunggulan
                  </label>
                  <input
                    type="text"
                    value={formState.badge}
                    onChange={(e) => setFormState({ ...formState, badge: e.target.value })}
                    placeholder="Contoh: Kampus Prestasi Bintaro"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Tema Warna Aksen
                  </label>
                  <select
                    value={formState.accentColor}
                    onChange={(e) => setFormState({ ...formState, accentColor: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="blue">Biru (Utama Rawamangun)</option>
                    <option value="emerald">Hijau Emerald (Kebayoran)</option>
                    <option value="amber">Amber / Emas (Cibubur)</option>
                    <option value="purple">Ungu Digital (Cirendeu)</option>
                    <option value="rose">Merah Rose (Bintaro)</option>
                    <option value="teal">Teal Toska (Modern)</option>
                  </select>
                </div>
              </div>

              {/* Banner Image URL & Preview */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  URL Gambar Banner Kampus (Unsplash / URL Langsung)
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formState.imageUrl || ''}
                    onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  {formState.imageUrl && (
                    <div className="relative h-24 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={formState.imageUrl}
                        alt="Preview Banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                        <span className="text-[10px] text-slate-300 font-mono">Pratinjau Banner Kampus</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Alamat Lengkap Kampus
                </label>
                <input
                  type="text"
                  required
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  placeholder="Jl. Bintaro Utama Sektor 9, Pondok Aren, Tangerang Selatan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Deskripsi & Profil Kampus
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.desc}
                  onChange={(e) => setFormState({ ...formState, desc: e.target.value })}
                  placeholder="Jelaskan keunggulan kurikulum, suasana belajar, dan fasilitas khas kampus..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Features (Comma separated) */}
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Fitur & Keunggulan Utama (Pisahkan dengan tanda koma ",")
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Laboratorium AI, Smart Digital Class, Akses Bintaro Sektor 9"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/30 transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Kampus & Passing Grade</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
