import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  School,
  Settings,
  Pause,
  Play,
  CheckCircle2,
  Info,
  Sparkles,
  Target,
  Camera
} from 'lucide-react';
import { LabschoolCampusItem } from './labschoolCampusData';
import { User, SidebarTab } from '../../types';

interface LabschoolCampusSliderProps {
  campuses: LabschoolCampusItem[];
  user: User;
  onOpenCampusView: (campusId?: string) => void;
  onEditCampus?: (campus: LabschoolCampusItem) => void;
  onEditImage?: (campusId: string) => void;
  onNavigateTab: (tab: SidebarTab) => void;
}

export const LabschoolCampusSlider: React.FC<LabschoolCampusSliderProps> = ({
  campuses,
  user,
  onOpenCampusView,
  onEditCampus,
  onEditImage
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = campuses.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isPlaying && !isHovered && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, currentIndex, totalSlides]);

  if (campuses.length === 0) return null;

  const current = campuses[currentIndex] || campuses[0];

  // Theme styling map
  const themeMap: Record<string, {
    border: string;
    badgeBg: string;
    textAccent: string;
    glow: string;
  }> = {
    blue: {
      border: 'border-blue-500/40',
      badgeBg: 'bg-blue-600/30 text-blue-200 border-blue-400/40',
      textAccent: 'text-blue-300',
      glow: 'from-blue-600/30 to-indigo-900/20'
    },
    emerald: {
      border: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-600/30 text-emerald-200 border-emerald-400/40',
      textAccent: 'text-emerald-300',
      glow: 'from-emerald-600/30 to-teal-900/20'
    },
    amber: {
      border: 'border-amber-500/40',
      badgeBg: 'bg-amber-600/30 text-amber-200 border-amber-400/40',
      textAccent: 'text-amber-300',
      glow: 'from-amber-600/30 to-orange-900/20'
    },
    purple: {
      border: 'border-purple-500/40',
      badgeBg: 'bg-purple-600/30 text-purple-200 border-purple-400/40',
      textAccent: 'text-purple-300',
      glow: 'from-purple-600/30 to-fuchsia-900/20'
    },
    rose: {
      border: 'border-rose-500/40',
      badgeBg: 'bg-rose-600/30 text-rose-200 border-rose-400/40',
      textAccent: 'text-rose-300',
      glow: 'from-rose-600/30 to-red-900/20'
    },
    teal: {
      border: 'border-teal-500/40',
      badgeBg: 'bg-teal-600/30 text-teal-200 border-teal-400/40',
      textAccent: 'text-teal-300',
      glow: 'from-teal-600/30 to-emerald-900/20'
    }
  };

  const currentTheme = themeMap[current.accentColor] || themeMap.blue;

  return (
    <div
      className="relative space-y-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header of Slider */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <School className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <span>5 Kampus Unggulan BPS Labschool YP-UNJ</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                Slide Banner Interaktif
              </span>
            </h2>
          </div>
        </div>

        {/* Controls: Prev, Pause/Play, Next, Slide Counter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Jeda Otomatis' : 'Putar Otomatis'}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 text-xs transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide Sebelumnya"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-400 px-1">
            <strong className="text-white">{currentIndex + 1}</strong> / {totalSlides}
          </span>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide Selanjutnya"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN SLIDE CARD BANNER: FULL IMAGE BANNER DENGAN TULISAN DI DALAM GAMBAR */}
      {/* ========================================================================= */}
      <div
        className={`relative overflow-hidden rounded-3xl border ${currentTheme.border} min-h-[240px] sm:min-h-[280px] md:min-h-[300px] shadow-2xl transition-all duration-500 group flex flex-col justify-end p-5 sm:p-7 bg-slate-950`}
      >
        {/* Campus Background Image Banner */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={current.imageUrl}
            alt={current.name}
            className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out brightness-[0.82]"
            loading="lazy"
            onError={(e) => {
              // Fallback image if network fails
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80';
            }}
          />

          {/* Cinematic Multi-Layer Gradient Overlays for crystal clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentTheme.glow} opacity-40 mix-blend-overlay`} />
        </div>

        {/* Top Badges & Status inside Image Banner */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-auto pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-extrabold px-3 py-1 rounded-full border backdrop-blur-md ${currentTheme.badgeBg} shadow-sm`}
            >
              {current.badge}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {current.accreditation}
            </span>
            <span className="text-[11px] text-slate-200 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 shadow-sm">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              {current.loc}
            </span>
            {current.id === 'camp-bintaro' && (
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-900/40 animate-pulse">
                Kampus Baru
              </span>
            )}
          </div>

          {/* Quick Passing Grade Badge in Top Right */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/70 text-xs shadow-md">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-semibold">PG SMP:</span>
              <strong className="text-amber-300 font-bold font-mono">{current.passingGradeSmp.toFixed(1)}</strong>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-semibold">PG SMA:</span>
              <strong className="text-emerald-300 font-bold font-mono">{current.passingGradeSma.toFixed(1)}</strong>
            </div>
          </div>
        </div>

        {/* Center & Bottom: NAMA KAMPUS IMPIAN & MENU YANG DITAMPILKAN DI DALAM GAMBAR */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-t border-slate-700/40">
          
          {/* Campus Name, Unit, and Snippet inside Image */}
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
              {current.name}
            </h3>
            <p className={`text-xs sm:text-sm font-bold ${currentTheme.textAccent} drop-shadow`}>
              {current.unit}
            </p>
            <p className="text-xs text-slate-200/90 leading-relaxed line-clamp-2 drop-shadow-sm hidden sm:block pt-0.5">
              {current.desc}
            </p>
          </div>

          {/* MENUS DISPLAYED (DETAIL BUTTON & ATUR PASSING GRADE ICON SAJA) */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* 1. MENU DETAIL (REQUIREMENT) */}
            <button
              type="button"
              onClick={() => onOpenCampusView(current.id)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-blue-950/60 backdrop-blur-md transition-all hover:scale-105 border border-blue-400/40"
            >
              <Info className="w-4 h-4" />
              <span>Detail</span>
            </button>

            {/* 2. ATUR GAMBAR KAMPUS (ICON KAMERA - ADMIN/GURU ONLY) */}
            {user.role !== 'student' && onEditImage && (
              <button
                type="button"
                onClick={() => onEditImage(current.id)}
                title={`Ubah Foto Banner ${current.name}`}
                aria-label={`Ubah Foto Banner ${current.name}`}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-xl transition-all hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {/* 3. ATUR PASSING GRADE & DATA (ICON SAJA - REQUIREMENT) */}
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  if (onEditCampus) {
                    onEditCampus(current);
                  } else {
                    onOpenCampusView(current.id);
                  }
                }}
                title="Atur Passing Grade & Data Kampus"
                aria-label="Atur Passing Grade & Data Kampus"
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-xl transition-all hover:scale-110 group/btn"
              >
                <Settings className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Bottom Dot Navigator & Campus Quick Selectors */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 px-1 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {campuses.map((camp, idx) => (
            <button
              key={camp.id || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="hidden sm:inline">
                {camp.name.replace('Labschool ', '')}
              </span>
              <span className="sm:hidden font-mono">{idx + 1}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onOpenCampusView()}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
        >
          <span>Buka Semua Data 5 Kampus</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
