import React, { useState, useMemo } from 'react';
import { User, SidebarTab } from '../../types';
import { getUserLabschoolLevel } from '../../utils/labschoolHelpers';
import {
  Building2,
  MapPin,
  School,
  GraduationCap,
  Sparkles,
  Camera,
  Settings,
  ChevronRight,
  Target,
  Phone,
  Globe,
  Award,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  BookmarkCheck,
  ExternalLink
} from 'lucide-react';
import {
  LabschoolCampusItem,
  loadStoredCampuses,
  saveStoredCampuses
} from './labschoolCampusData';
import { LabschoolCampusSlider } from './LabschoolCampusSlider';
import { LabschoolCampusModal } from './LabschoolCampusModal';
import { LabschoolImageEditModal } from './LabschoolImageEditModal';

interface LabschoolKampusPageProps {
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
}

export const LabschoolKampusPage: React.FC<LabschoolKampusPageProps> = ({
  user,
  onNavigateTab
}) => {
  // User Labschool Level (SMP, SMA, or ALL)
  const userLabschoolLevel = useMemo(() => {
    return getUserLabschoolLevel(user);
  }, [user]);

  // State for campuses
  const [campuses, setCampuses] = useState<LabschoolCampusItem[]>(() => {
    return loadStoredCampuses();
  });

  // Selected campus for interactive in-page detail spotlight
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    campuses[0]?.id || 'camp-rawamangun'
  );

  // Modals state
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [modalInitialCampusId, setModalInitialCampusId] = useState<string | undefined>(undefined);
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);
  const [imageEditCampusId, setImageEditCampusId] = useState<string | undefined>(undefined);

  // User target campus state from localStorage
  const [userTargetCampus, setUserTargetCampus] = useState<string>(() => {
    try {
      return localStorage.getItem(`labschool_target_campus_${user.id || 'default'}`) || 'Labschool Rawamangun';
    } catch {
      return 'Labschool Rawamangun';
    }
  });

  const handleSetTargetCampus = (campusName: string) => {
    setUserTargetCampus(campusName);
    try {
      localStorage.setItem(`labschool_target_campus_${user.id || 'default'}`, campusName);
    } catch {
      // ignore
    }
  };

  const currentSelectedCampus =
    campuses.find((c) => c.id === selectedCampusId) || campuses[0] || null;

  const campusAccentMap: Record<string, { border: string; bg: string; badge: string; text: string; ring: string }> = {
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/30',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      text: 'text-blue-400',
      ring: 'ring-blue-500/50'
    },
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-400',
      ring: 'ring-emerald-500/50'
    },
    amber: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      text: 'text-amber-400',
      ring: 'ring-amber-500/50'
    },
    purple: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      text: 'text-purple-400',
      ring: 'ring-purple-500/50'
    },
    rose: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      text: 'text-rose-400',
      ring: 'ring-rose-500/50'
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300 pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION KAMPUS LABSCHOOL */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm">
                <Building2 className="w-3.5 h-3.5" />
                KAMPUS UTAMA LABSCHOOL YP-UNJ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                <Sparkles className="w-3 h-3 text-amber-400" />
                5 Kampus SMP & SMA
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Akreditasi A Unggul
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Profil & Pilihan Kampus Labschool 2027
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Jelajahi seluruh kampus unggulan Labschool (Rawamangun, Kebayoran, Cibubur, Cirendeu, dan Bintaro). Dapatkan rincian lokasi strategis, fasilitas kelas dunia, kuota penerimaan PSB, serta simulasi Passing Grade (PG) target kelulusan Anda.
            </p>
          </div>

          {/* Quick Action Control Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0 self-start md:self-center">
            {/* PENGATURAN EDIT GAMBAR KAMPUS (ADMIN/GURU ONLY) */}
            {user.role !== 'student' && (
              <button
                type="button"
                onClick={() => {
                  setImageEditCampusId(undefined);
                  setIsImageEditModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white text-xs font-bold border border-cyan-500/40 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Pengaturan Edit Gambar</span>
              </button>
            )}

            {/* KELOLA DATA & PASSING GRADE (ADMIN ONLY OR GENERAL POPUP) */}
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setModalInitialCampusId(undefined);
                  setIsCampusModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Kelola Data & Passing Grade</span>
              </button>
            )}

            {/* DETAIL / SIMULASI TARGET PILIHAN */}
            <button
              type="button"
              onClick={() => {
                setModalInitialCampusId(selectedCampusId);
                setIsCampusModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Target className="w-4 h-4" />
              <span>Buka Modal Pilihan & Passing Grade</span>
            </button>
          </div>
        </div>

        {/* Current User Target Campus Banner */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Kampus Pilihan Anda:</span>
            <span className="font-extrabold text-amber-300 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              {userTargetCampus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Jalur Pendaftaran:</span>
            {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMP') && (
              <button
                type="button"
                onClick={() => onNavigateTab('labschool_psb_smp')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold transition-colors"
              >
                PSB SMP
              </button>
            )}
            {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMA') && (
              <button
                type="button"
                onClick={() => onNavigateTab('labschool_psb_sma')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-bold transition-colors"
              >
                PSB SMA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SLIDE BANNER KAMPUS LABSCHOOL (FITUR SLIDER UTAMA) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Slide Show Profil 5 Kampus Labschool
              </h2>
              <p className="text-xs text-slate-400">
                Putar visual showcase setiap kampus secara otomatis atau interaktif
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
            {campuses.length} Kampus
          </span>
        </div>

        <LabschoolCampusSlider
          campuses={campuses}
          user={user}
          onOpenCampusView={(campusId) => {
            setModalInitialCampusId(campusId);
            setIsCampusModalOpen(true);
          }}
          onEditCampus={() => {
            setIsCampusModalOpen(true);
          }}
          onEditImage={user.role !== 'student' ? (campusId) => {
            setImageEditCampusId(campusId);
            setIsImageEditModalOpen(true);
          } : undefined}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. GRID 5 KAMPUS UNGGULAN LABSCHOOL (CARDS DENGAN EDIT GAMBAR & PASSING GRADE) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">5 Kampus Unggulan BPS Labschool YP-UNJ</h2>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Termasuk Labschool Bintaro
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user.role !== 'student' && (
              <button
                type="button"
                onClick={() => {
                  setImageEditCampusId(undefined);
                  setIsImageEditModalOpen(true);
                }}
                className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Gambar</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setModalInitialCampusId(undefined);
                setIsCampusModalOpen(true);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors px-2 py-1.5"
            >
              <span>Kelola & Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Campus Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {campuses.map((camp) => {
            const style = campusAccentMap[camp.accentColor] || campusAccentMap.blue;
            const isSelected = selectedCampusId === camp.id;
            const isTarget = userTargetCampus.toLowerCase().includes(camp.name.toLowerCase()) ||
              camp.name.toLowerCase().includes(userTargetCampus.toLowerCase());

            return (
              <div
                key={camp.id}
                onClick={() => setSelectedCampusId(camp.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border ${style.border} ${style.bg} flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-1 transition-all shadow-lg group relative overflow-hidden ${
                  isSelected ? `ring-2 ${style.ring} shadow-blue-500/10` : ''
                }`}
              >
                <div className="space-y-2.5">
                  {/* Visual Campus Thumbnail with Quick Edit Image Camera Button */}
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-800/90 shadow-inner group/thumb">
                    <img
                      src={camp.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80'}
                      alt={camp.name}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 brightness-[0.85]"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${style.badge} backdrop-blur-md`}>
                      {camp.badge}
                    </span>

                    {/* Quick Edit Image Button on each Card (Admin/Teacher only) */}
                    {user.role !== 'student' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageEditCampusId(camp.id);
                          setIsImageEditModalOpen(true);
                        }}
                        title={`Ubah Gambar ${camp.name}`}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-slate-900/85 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 opacity-90 group-hover/thumb:opacity-100 backdrop-blur-md transition-all shadow-md"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    )}

                    {isTarget && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> TARGET SAYA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate pr-1">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {camp.loc.split(',')[0]}
                    </span>
                    {camp.id === 'camp-bintaro' && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white shrink-0">
                        BARU
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-sm leading-snug group-hover:text-blue-300 transition-colors">
                    {camp.name}
                  </h4>
                  <p className={`text-[11px] font-semibold ${style.text}`}>{camp.unit}</p>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{camp.desc}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {/* Passing Grade SMP & SMA snippet */}
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">PG SMP</span>
                      <strong className="text-amber-300 font-bold font-mono">{camp.passingGradeSmp.toFixed(1)}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">PG SMA</span>
                      <strong className="text-emerald-300 font-bold font-mono">{camp.passingGradeSma.toFixed(1)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Kuota: {camp.quotaSmp + camp.quotaSma}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalInitialCampusId(camp.id);
                        setIsCampusModalOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SPOTLIGHT DETAIL KAMPUS PILIHAN (INTERAKTIF & FASILITAS UNGGULAN) */}
      {/* ========================================================================= */}
      {currentSelectedCampus && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentSelectedCampus.badge}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {currentSelectedCampus.loc}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {currentSelectedCampus.name}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-400 font-semibold">
                Unit Pendidikan: {currentSelectedCampus.unit}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSetTargetCampus(currentSelectedCampus.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  userTargetCampus === currentSelectedCampus.name
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>
                  {userTargetCampus === currentSelectedCampus.name
                    ? 'Sudah Menjadi Target Anda'
                    : 'Jadikan Target Utama Saya'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalInitialCampusId(currentSelectedCampus.id);
                  setIsCampusModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Compass className="w-4 h-4" />
                <span>Buka Profil Lengkap</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Campus Photo & Action */}
            <div className="lg:col-span-1 space-y-3">
              <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                <img
                  src={currentSelectedCampus.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80'}
                  alt={currentSelectedCampus.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                
                {user.role !== 'student' && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageEditCampusId(currentSelectedCampus.id);
                      setIsImageEditModalOpen(true);
                    }}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold border border-cyan-500/40 shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ubah Foto</span>
                  </button>
                )}
              </div>

              {/* Quick Contacts */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono">{currentSelectedCampus.contactWa || '0812-8000-1968'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <a
                    href={currentSelectedCampus.website?.startsWith('http') ? currentSelectedCampus.website : `https://${currentSelectedCampus.website || 'labschoolunj.sch.id'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>{currentSelectedCampus.website || 'labschoolunj.sch.id'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Campus Info & Key Highlights */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Deskripsi & Karakteristik Kampus
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentSelectedCampus.desc}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Alamat: {currentSelectedCampus.address}
                </p>
              </div>

              {/* Passing Grade & Quota Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400 block">PG Acuan SMP</span>
                  <div className="text-xl font-black text-white font-mono">
                    {currentSelectedCampus.passingGradeSmp.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-400">Kuota: {currentSelectedCampus.quotaSmp} Siswa</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-400 block">PG Acuan SMA</span>
                  <div className="text-xl font-black text-white font-mono">
                    {currentSelectedCampus.passingGradeSma.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-400">Kuota: {currentSelectedCampus.quotaSma} Siswa</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 space-y-1">
                  <span className="text-[11px] font-semibold text-blue-400 block">Total Kuota PSB</span>
                  <div className="text-xl font-black text-white font-mono">
                    {currentSelectedCampus.quotaSmp + currentSelectedCampus.quotaSma}
                  </div>
                  <span className="text-[10px] text-slate-400">SMP + SMA Labschool</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-1">
                  <span className="text-[11px] font-semibold text-indigo-400 block">Status Akreditasi</span>
                  <div className="text-xl font-black text-emerald-300">
                    A (Unggul)
                  </div>
                  <span className="text-[10px] text-slate-400">BAN-S/M Nasional</span>
                </div>
              </div>

              {/* Fasilitas & Program Unggulan */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Fasilitas & Keunggulan Program
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(currentSelectedCampus.features || []).map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{fac}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ROADMAP & HUBUNGAN DENGAN PERSIAPAN SELEKSI */}
      {/* ========================================================================= */}
      <div className={`grid grid-cols-1 ${userLabschoolLevel === 'ALL' ? 'md:grid-cols-2' : 'max-w-xl mx-auto'} gap-4`}>
        {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMP') && (
          <div
            onClick={() => onNavigateTab('labschool_psb_smp')}
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all shadow-xl flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm sm:text-base group-hover:text-emerald-300 transition-colors">
                  Panduan & Pilihan PSB SMP LABSCHOOL
                </h4>
                <p className="text-xs text-slate-400">
                  Syarat berkas, alur seleksi, serta panduan pendaftaran SMP 2027
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all shrink-0" />
          </div>
        )}

        {(userLabschoolLevel === 'ALL' || userLabschoolLevel === 'SMA') && (
          <div
            onClick={() => onNavigateTab('labschool_psb_sma')}
            className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 cursor-pointer transition-all shadow-xl flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm sm:text-base group-hover:text-indigo-300 transition-colors">
                  Panduan & Pilihan PSB SMA LABSCHOOL
                </h4>
                <p className="text-xs text-slate-400">
                  Peminatan IPA/IPS, jalur prestasi, tes psikologi, dan portofolio
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-300 transition-all shrink-0" />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DATA 5 KAMPUS LABSCHOOL & ADMIN CRUD */}
      {/* ========================================================================= */}
      <LabschoolCampusModal
        isOpen={isCampusModalOpen}
        onClose={() => setIsCampusModalOpen(false)}
        campuses={campuses}
        setCampuses={setCampuses}
        user={user}
        onNavigateTab={onNavigateTab}
        initialSelectedCampusId={modalInitialCampusId}
      />

      {/* ========================================================================= */}
      {/* MODAL: PENGATURAN EDIT GAMBAR KAMPUS LABSCHOOL */}
      {/* ========================================================================= */}
      <LabschoolImageEditModal
        isOpen={isImageEditModalOpen}
        onClose={() => setIsImageEditModalOpen(false)}
        campuses={campuses}
        setCampuses={setCampuses}
        initialCampusId={imageEditCampusId}
      />
    </div>
  );
};
