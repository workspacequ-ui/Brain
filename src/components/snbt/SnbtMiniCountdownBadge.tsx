import React, { useState, useEffect, useMemo } from 'react';
import { SidebarTab } from '../../types';
import {
  SnbtCountdownTarget,
  loadStoredSnbtCountdownTargets,
  formatTargetDateToIndonesian
} from './snbtData';
import {
  Clock,
  Flame,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface SnbtMiniCountdownBadgeProps {
  onNavigateTab?: (tab: SidebarTab) => void;
  onSetActiveSubtab?: (subtab: 'overview' | 'students' | 'roadmap' | 'countdown') => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  showTargetName?: boolean;
  interactive?: boolean;
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
  const diff = target - now;

  if (diff <= 0 || isNaN(target)) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isPast: false
  };
}

export const SnbtMiniCountdownBadge: React.FC<SnbtMiniCountdownBadgeProps> = ({
  onNavigateTab,
  onSetActiveSubtab,
  className = '',
  size = 'sm',
  showTargetName = true,
  interactive = true
}) => {
  const [targets, setTargets] = useState<SnbtCountdownTarget[]>(() =>
    loadStoredSnbtCountdownTargets()
  );
  const [showTooltip, setShowTooltip] = useState(false);

  // Sync targets with local storage or custom events
  useEffect(() => {
    const handleSync = () => {
      setTargets(loadStoredSnbtCountdownTargets());
    };

    window.addEventListener('snbt-countdown-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('snbt-countdown-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const activeTarget = useMemo(() => {
    const main = targets.find(t => t.isMain);
    return main || targets[0] || null;
  }, [targets]);

  const [time, setTime] = useState<TimeRemaining>(() =>
    activeTarget
      ? calculateTimeRemaining(activeTarget.targetDateIso)
      : { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  );

  useEffect(() => {
    if (!activeTarget) return;
    const update = () => {
      setTime(calculateTimeRemaining(activeTarget.targetDateIso));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTarget]);

  if (!activeTarget) return null;

  const isUrgent =
    !time.isPast &&
    ((time.days === 0 && (time.hours > 0 || time.minutes > 0 || time.seconds > 0)) ||
      (time.totalMs > 0 && time.totalMs < 24 * 60 * 60 * 1000));

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    if (onSetActiveSubtab) {
      onSetActiveSubtab('countdown');
    } else if (onNavigateTab) {
      onNavigateTab('snbt_roadmap');
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  // Size variations
  const isXs = size === 'xs';
  const isMd = size === 'md';

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        title="Klik untuk membuka Countdown UTBK lengkap & kelola target"
        className={`group relative flex items-center gap-2 rounded-2xl transition-all cursor-pointer shadow-lg backdrop-blur-md ${
          isUrgent
            ? 'bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 border border-rose-500/80 hover:border-rose-400 text-rose-100 ring-2 ring-rose-500/40 animate-pulse shadow-rose-950/50'
            : 'bg-slate-950/80 hover:bg-slate-900/95 border border-indigo-500/40 hover:border-indigo-400/80 text-white shadow-indigo-950/30 hover:scale-[1.02]'
        } ${
          isXs
            ? 'px-2 py-1 text-[10px]'
            : isMd
            ? 'px-3.5 py-2 text-xs'
            : 'px-2.5 py-1.5 text-[11px]'
        }`}
      >
        {/* Live Indicator Glow Dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isUrgent ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
          </span>

          {isUrgent ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
        </div>

        {/* Target Title / Badge Tag */}
        {showTargetName && (
          <span
            className={`font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-[9px] shrink-0 ${
              isUrgent
                ? 'bg-rose-600/60 text-rose-100 border border-rose-400/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
            }`}
          >
            {isUrgent ? 'SIAGA H-1' : `H-${time.days}`}
          </span>
        )}

        {/* Live Time Output */}
        <div className="flex items-center gap-1 font-mono font-bold tracking-tight shrink-0">
          {time.isPast ? (
            <span className="text-emerald-400 font-sans text-[11px]">Selesai Terlaksana</span>
          ) : (
            <>
              {time.days > 0 && (
                <span className={isUrgent ? 'text-rose-200' : 'text-slate-200'}>
                  <strong className="text-white font-black">{time.days}</strong>
                  <span className="text-[10px] text-slate-400 ml-0.5">h</span>
                </span>
              )}
              <span className={isUrgent ? 'text-rose-200' : 'text-slate-300'}>
                <strong className="text-white font-black">{pad(time.hours)}</strong>
                <span className="text-[10px] text-slate-400 ml-0.5">j</span>
              </span>
              <span className="text-slate-600">:</span>
              <span className={isUrgent ? 'text-amber-300' : 'text-slate-300'}>
                <strong className="text-white font-black">{pad(time.minutes)}</strong>
                <span className="text-[10px] text-slate-400 ml-0.5">m</span>
              </span>
              <span className="text-slate-600">:</span>
              <span
                className={`font-black ${
                  isUrgent ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {pad(time.seconds)}
                <span className="text-[9px] text-slate-400 ml-0.5 font-normal">s</span>
              </span>
            </>
          )}
        </div>

        {/* Subtle arrow indicator for clickability */}
        {interactive && (
          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
        )}
      </button>

      {/* Floating Hover Card Preview Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 z-50 w-72 p-3.5 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-md text-xs text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeTarget.badge}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Real-Time
            </span>
          </div>

          <div className="mt-2 font-bold text-white leading-snug">
            {activeTarget.title}
          </div>
          {activeTarget.subtitle && (
            <div className="text-[11px] text-indigo-300/90 mt-0.5">
              {activeTarget.subtitle}
            </div>
          )}

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium text-amber-200">{activeTarget.targetDateFormatted}</span>
            </div>
            {activeTarget.locationInfo && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate text-slate-400">{activeTarget.locationInfo}</span>
              </div>
            )}
          </div>

          {interactive && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-bold text-indigo-400 flex items-center justify-between">
              <span>Buka Countdown Penuh &raquo;</span>
              <span className="text-slate-500">Klik widget</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
