import React from 'react';
import { User, InstitutionInfo } from '../../types';
import { Menu, LogOut, ShieldCheck, GraduationCap, Sparkles, Camera, Building2, Database } from 'lucide-react';

interface HeaderNavbarProps {
  user: User;
  institution?: InstitutionInfo;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  onEditProfile?: () => void;
  onEditInstitution?: () => void;
  onOpenNeonDb?: () => void;
  activeMenuTitle?: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  user,
  institution,
  onLogout,
  onToggleMobileSidebar,
  onEditProfile,
  onEditInstitution,
  onOpenNeonDb,
  activeMenuTitle = 'Dashboard'
}) => {
  const instName = institution?.name || 'BRAIN SPACE ACADEMY';
  const instSubtitle = institution?.subtitle || 'CBT & LMS SMART ACADEMY';
  const logoUrl = institution?.logoUrl;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-5 lg:px-7 py-2 sm:py-2.5 transition-all shadow-sm w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-7xl mx-auto">
        
        {/* Left Side: Mobile Menu Button & Institution Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink flex-1">
          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors shrink-0"
            title="Buka Menu Navigasi"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Institution Logo */}
            {(() => {
              const shapeClass = institution?.logoShape === 'square'
                ? 'rounded-none'
                : institution?.logoShape === 'circle'
                ? 'rounded-full'
                : institution?.logoShape === 'banner'
                ? 'rounded-2xl'
                : 'rounded-xl';

              const sizeClass = institution?.logoSize === 'large'
                ? 'w-10 h-10 sm:w-12 sm:h-12'
                : institution?.logoSize === 'extralarge'
                ? 'w-11 h-11 sm:w-14 sm:h-14'
                : institution?.logoSize === 'banner'
                ? 'h-9 sm:h-10 w-auto max-w-[110px] sm:max-w-[150px]'
                : 'w-9 h-9 sm:w-10 sm:h-10';

              const isFullArea = institution?.logoFullArea ?? true;
              const paddingClass = (isFullArea && (institution?.logoPadding === 'none' || !institution?.logoPadding))
                ? 'p-0'
                : institution?.logoPadding === 'medium'
                ? 'p-1.5'
                : institution?.logoPadding === 'small'
                ? 'p-0.5'
                : 'p-0';

              const fitClass = institution?.logoFit === 'cover'
                ? 'object-cover'
                : institution?.logoFit === 'fill'
                ? 'object-fill'
                : 'object-contain';

              const bgClass = institution?.logoBgColor === 'white'
                ? 'bg-white'
                : institution?.logoBgColor === 'dark'
                ? 'bg-slate-950'
                : institution?.logoBgColor === 'blue'
                ? 'bg-blue-950'
                : institution?.logoBgColor === 'slate'
                ? 'bg-slate-900'
                : 'bg-transparent';

              const borderClass = institution?.logoBorder !== false
                ? 'border border-slate-700/80 shadow-md shadow-blue-950/40'
                : 'border-0';

              return (
                <button
                  type="button"
                  onClick={user.role === 'admin' ? onEditInstitution : undefined}
                  className={`relative ${shapeClass} overflow-hidden shrink-0 transition-transform ${user.role === 'admin' ? 'hover:scale-105 cursor-pointer group' : ''}`}
                  title={user.role === 'admin' ? 'Klik untuk ubah Pengaturan Logo & Nama Lembaga' : instName}
                >
                  {logoUrl ? (
                    <div className={`${sizeClass} ${shapeClass} ${bgClass} ${paddingClass} ${borderClass} flex items-center justify-center overflow-hidden`}>
                      <img
                        src={logoUrl}
                        alt={instName}
                        className={`w-full h-full ${fitClass} ${institution?.logoShape === 'circle' ? 'rounded-full' : shapeClass}`}
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 via-blue-600 to-blue-700 p-0.5 shadow-lg shadow-blue-900/30 flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                      </div>
                    </div>
                  )}
                  {user.role === 'admin' && (
                    <span className={`absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity ${shapeClass}`}>
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Title & Subtitle Info */}
            <div className="min-w-0 shrink">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-xs xs:text-sm sm:text-base md:text-lg tracking-tight text-white drop-shadow-sm truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-[340px] lg:max-w-md">
                  {instName}
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-xs shrink-0">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-red-400" /> CBT & LMS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate hidden md:block max-w-[240px] lg:max-w-sm">
                <span className="text-blue-300 font-semibold">{activeMenuTitle}</span> • {instSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Action Badges, User Profile Card & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Admin Database Quick Action */}
          {user.role === 'admin' && onOpenNeonDb && (
            <button
              type="button"
              onClick={onOpenNeonDb}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl transition-all shadow-sm focus:outline-none shrink-0"
              title="Status & Sinkronisasi Database Neon PostgreSQL"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline">Neon DB</span>
            </button>
          )}

          {/* Admin Logo Config Quick Action */}
          {user.role === 'admin' && onEditInstitution && (
            <button
              type="button"
              onClick={onEditInstitution}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 border border-blue-700/60 rounded-xl transition-all shadow-sm focus:outline-none shrink-0"
              title="Pengaturan Logo & Nama Lembaga"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Logo Lembaga</span>
            </button>
          )}

          {/* User Bio Card (Clickable to Edit Profile & Photo) */}
          <button
            type="button"
            onClick={onEditProfile}
            className="flex items-center gap-2 sm:gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/60 rounded-2xl p-1 sm:p-1.5 sm:pr-3 shadow-sm transition-all group text-left focus:outline-none shrink-0"
            title="Klik untuk ubah foto profil & data akun"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                alt={user.name}
                className="w-full h-full rounded-xl object-cover aspect-square ring-2 ring-red-500/50 group-hover:ring-blue-500 transition-all"
              />
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-md shadow group-hover:scale-110 transition-all">
                <Camera className="w-2 h-2" />
              </span>
            </div>

            <div className="text-left hidden sm:block min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-blue-300 transition-colors truncate max-w-[90px] md:max-w-[130px] lg:max-w-[160px]">
                  {user.name}
                </span>
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 rounded shrink-0">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                  </span>
                ) : user.role === 'teacher' ? (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded shrink-0">
                    <GraduationCap className="w-2.5 h-2.5 mr-0.5 text-amber-400" /> Guru
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded shrink-0">
                    Siswa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[130px] md:max-w-[170px]">
                <span className="truncate">{user.role === 'teacher' ? 'NIP' : user.role === 'admin' ? 'ID' : 'NIS'}: {user.nis}</span>
                <span>•</span>
                <span className={`${user.role === 'teacher' ? 'text-amber-400' : 'text-blue-400'} font-medium truncate`}>
                  {user.role === 'teacher' && user.subject ? user.subject : user.className}
                </span>
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all shadow-sm focus:outline-none shrink-0"
            title="Keluar dari sistem"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden md:inline">Keluar</span>
          </button>

        </div>

      </div>
    </header>
  );
};
