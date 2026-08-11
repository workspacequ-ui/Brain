import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, User, Teacher, ClassItem, SidebarTab, CustomNavLabels } from '../../types';
import { getUserLabschoolLevel, isStudentLabschool, isStudentSnbt } from '../../utils/labschoolHelpers';
import {
  UserCheck,
  Users,
  GraduationCap,
  ShieldCheck,
  UserCog,
  Layers,
  BookOpen,
  FileCheck2,
  ShoppingBag,
  BarChart3,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  History,
  Sparkles,
  BookMarked,
  School,
  TrendingUp,
  Compass,
  Award,
  Flame,
  Building2,
  Clock,
  Target,
  Settings,
  Sliders
} from 'lucide-react';

export type { SidebarTab };

interface SidebarProps {
  role: UserRole;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  pendingCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: User;
  teachers?: Teacher[];
  classes?: ClassItem[];
  teacherClasses?: string[];
  selectedTeacherClass?: string;
  onSelectTeacherClass?: (className: string) => void;
  navLabels?: CustomNavLabels;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  pendingCount = 0,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  teachers = [],
  classes = [],
  teacherClasses,
  selectedTeacherClass = 'ALL',
  onSelectTeacherClass,
  navLabels
}) => {
  // State for User Management dropdown (default hidden/closed)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // State for Academic dropdown (default hidden/closed)
  const [isAcademicOpen, setIsAcademicOpen] = useState(false);

  // State for LABSCHOOL dropdown (default open)
  const [isLabschoolOpen, setIsLabschoolOpen] = useState(true);

  // State for SNBT / UTBK dropdown (default open)
  const [isSnbtOpen, setIsSnbtOpen] = useState(true);

  // State for Teacher Class Menu dropdown (default open if activeTab === 'classes' or true)
  const [isTeacherClassMenuOpen, setIsTeacherClassMenuOpen] = useState(true);

  const isLabschoolSubmenuActive = [
    'labschool_overview',
    'labschool_dashboard',
    'labschool_silabus',
    'labschool_kampus',
    'labschool_roadmap',
    'labschool_psb_smp',
    'labschool_smp',
    'labschool_psb_sma',
    'labschool_sma',
    'labschool_laporan'
  ].includes(activeTab);

  const isSnbtSubmenuActive = [
    'snbt_dashboard',
    'snbt_syllabus',
    'snbt_silabus',
    'snbt_students',
    'snbt_campus',
    'snbt_kampus',
    'snbt_roadmap',
    'snbt_countdown',
    'snbt_reports',
    'snbt_laporan'
  ].includes(activeTab);

  // Auto expand dropdown if activeTab becomes relevant
  useEffect(() => {
    if (activeTab === 'classes') {
      setIsTeacherClassMenuOpen(true);
    }
    if (isLabschoolSubmenuActive) {
      setIsLabschoolOpen(true);
    }
    if (isSnbtSubmenuActive) {
      setIsSnbtOpen(true);
    }
  }, [activeTab, isLabschoolSubmenuActive, isSnbtSubmenuActive]);

  // Compute Current Teacher and Assigned Classes for Teacher Role
  const currentTeacher = useMemo(() => {
    if (!currentUser || role !== 'teacher') return undefined;
    return teachers.find(
      t => t.id === currentUser.id || t.nip === currentUser.nis || t.email === currentUser.email || t.name === currentUser.name
    );
  }, [teachers, currentUser, role]);

  const teacherAssignedClasses = useMemo(() => {
    if (role !== 'teacher') return [];
    
    // Explicit prop takes highest priority
    if (teacherClasses && teacherClasses.length > 0) {
      if (teacherClasses.includes('SEMUA')) {
        return classes.length > 0 ? classes.map(c => c.name) : ['XII-UTBK', 'XI-IPA', 'X-IPA'];
      }
      return teacherClasses;
    }

    const rawClasses = currentTeacher?.targetClasses && currentTeacher.targetClasses.length > 0
      ? currentTeacher.targetClasses
      : currentUser?.targetClasses && currentUser.targetClasses.length > 0
      ? currentUser.targetClasses
      : currentUser?.className
      ? [currentUser.className]
      : ['SEMUA'];

    if (rawClasses.includes('SEMUA')) {
      return classes.length > 0 ? classes.map(c => c.name) : ['XII-UTBK', 'XI-IPA', 'X-IPA'];
    }
    
    return rawClasses;
  }, [role, teacherClasses, currentTeacher, currentUser, classes]);

  // Submenu items under "Manajemen User"
  const userSubMenuItems = [
    {
      id: 'validation',
      label: navLabels?.validation || 'Validasi User Baru',
      icon: UserCheck,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'students', label: navLabels?.students || 'Pengelola Data Siswa', icon: Users },
    { id: 'teachers', label: navLabels?.teachers || 'Pengelola Data Guru', icon: GraduationCap },
    { id: 'admins', label: navLabels?.admins || 'Data Pengelola Admin', icon: ShieldCheck }
  ];

  // User Labschool Level (SMP, SMA, or ALL)
  const userLabschoolLevel = useMemo(() => {
    return getUserLabschoolLevel(currentUser);
  }, [currentUser]);

  // Submenu items under "LABSCHOOL" (Filtered by student / user class)
  const labschoolSubMenuItems = useMemo(() => {
    const baseItems = [
      { id: 'labschool_overview', label: navLabels?.labschool_overview || 'Dashboard-Labs', icon: Sparkles, tag: 'HUB' },
      { id: 'labschool_silabus', label: navLabels?.labschool_silabus || 'Modul & Silabus', icon: BookOpen, tag: 'SILABUS' },
      { id: 'labschool_kampus', label: navLabels?.labschool_kampus || 'Kampus Labschool', icon: Building2, tag: 'KAMPUS' },
      { id: 'labschool_roadmap', label: navLabels?.labschool_roadmap || 'ROADMAP', icon: Compass, tag: 'ROADMAP' },
      { id: 'labschool_psb_smp', label: navLabels?.labschool_psb_smp || 'PSB SMP LABSCHOOL', icon: School, tag: 'SMP' },
      { id: 'labschool_psb_sma', label: navLabels?.labschool_psb_sma || 'PSB SMA LABSCHOOL', icon: GraduationCap, tag: 'SMA' },
      { id: 'labschool_laporan', label: navLabels?.labschool_laporan || 'LAPORAN & ANALISIS', icon: BarChart3, tag: 'LAPORAN' }
    ];

    if (userLabschoolLevel === 'SMP') {
      return baseItems.filter(item => item.id !== 'labschool_psb_sma');
    }
    if (userLabschoolLevel === 'SMA') {
      return baseItems.filter(item => item.id !== 'labschool_psb_smp');
    }
    return baseItems;
  }, [userLabschoolLevel, navLabels]);

  // Submenu items under "Akademik" (default dropdown closed/hidden)
  const academicSubMenuItems = [
    { id: 'academic', label: navLabels?.academic || 'Pusat & Kalender Akademik', icon: School },
    { id: 'classes', label: navLabels?.classes || 'Kelas & Mapel', icon: Layers },
    { id: 'syllabus', label: navLabels?.syllabus || 'Silabus', icon: BookMarked },
    { id: 'materials', label: navLabels?.materials || 'Materi Pembelajaran', icon: BookOpen },
    { id: 'exams', label: navLabels?.exams || 'Ujian', icon: FileCheck2 }
  ];

  const adminGeneralMenuItems = [
    { id: 'marketplace', label: navLabels?.marketplace || 'Marketplace', icon: ShoppingBag },
    { id: 'programs', label: navLabels?.programs || 'Program Unggulan', icon: Sparkles },
    { id: 'reports', label: navLabels?.reports || 'Laporan', icon: BarChart3 },
    { id: 'tryout_reports', label: navLabels?.tryout_reports || 'Laporan Tryout', icon: TrendingUp },
    { id: 'settings', label: navLabels?.settings || 'Pusat Pengaturan', icon: Settings, isSpecial: true }
  ];

  const teacherGeneralMenuItems = [
    { id: 'syllabus', label: 'Silabus & RPP', icon: BookMarked },
    { id: 'materials', label: 'Materi Pembelajaran', icon: BookOpen },
    { id: 'exams', label: 'Ujian', icon: FileCheck2 },
    { id: 'reports', label: 'Rekap Nilai & Analisis', icon: BarChart3 },
    { id: 'tryout_reports', label: 'Laporan Tryout', icon: TrendingUp },
    { id: 'students', label: 'Siswa Kelas Bimbingan', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag }
  ];

  const studentMenuItems = [
    { id: 'overview', label: 'Dashboard Siswa', icon: LayoutDashboard },
    { id: 'materials', label: 'Materi Saya', icon: BookOpen },
    { id: 'exams', label: 'Daftar Ujian', icon: FileCheck2 },
    { id: 'tryout_reports', label: 'Laporan Tryout', icon: TrendingUp },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'history', label: 'Riwayat & Hasil', icon: History }
  ];

  const handleItemClick = (id: SidebarTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const handleTeacherClassClick = (className: string) => {
    if (onSelectTeacherClass) {
      onSelectTeacherClass(className);
    }
    onSelectTab('classes');
    onCloseMobile();
  };

  const isUserSubmenuActive = ['validation', 'students', 'teachers', 'admins'].includes(activeTab);
  const isAcademicSubmenuActive = ['academic', 'classes', 'syllabus', 'materials', 'exams'].includes(activeTab);
  const isTeacherClassSubmenuActive = activeTab === 'classes';

  const toggleUserManagement = () => {
    if (isCollapsed) {
      onToggleCollapse(); // Auto expand sidebar if collapsed
      setIsUserManagementOpen(true);
    } else {
      setIsUserManagementOpen(prev => !prev);
    }
  };

  const toggleLabschool = () => {
    if (isCollapsed) {
      onToggleCollapse(); // Auto expand sidebar if collapsed
      setIsLabschoolOpen(true);
    } else {
      setIsLabschoolOpen(prev => !prev);
    }
  };

  const toggleSnbt = () => {
    if (isCollapsed) {
      onToggleCollapse(); // Auto expand sidebar if collapsed
      setIsSnbtOpen(true);
    } else {
      setIsSnbtOpen(prev => !prev);
    }
  };

  const toggleAcademic = () => {
    if (isCollapsed) {
      onToggleCollapse(); // Auto expand sidebar if collapsed
      setIsAcademicOpen(true);
    } else {
      setIsAcademicOpen(prev => !prev);
    }
  };

  const toggleTeacherClassMenu = () => {
    if (isCollapsed) {
      onToggleCollapse(); // Auto expand sidebar if collapsed
      setIsTeacherClassMenuOpen(true);
    } else {
      setIsTeacherClassMenuOpen(prev => !prev);
    }
  };

  // Submenu items under "SNBT / UTBK"
  const snbtSubMenuItems = [
    { id: 'snbt_dashboard', label: navLabels?.snbt_dashboard || 'SNBT-Dashboard', icon: LayoutDashboard, tag: 'HUB' },
    { id: 'snbt_syllabus', label: navLabels?.snbt_syllabus || 'Silabus & Modul SNBT', icon: BookOpen, tag: 'SILABUS' },
    { id: 'snbt_students', label: navLabels?.snbt_students || 'Data Siswa XII-UTBK', icon: Users, tag: 'SISWA' },
    { id: 'snbt_campus', label: navLabels?.snbt_campus || 'Pilihan Kampus', icon: School, tag: 'PTN' },
    { id: 'snbt_roadmap', label: navLabels?.snbt_roadmap || 'ROADMAP-SNBT', icon: Compass, tag: 'ROADMAP' },
    { id: 'snbt_reports', label: navLabels?.snbt_reports || 'Laporan & Analisis', icon: BarChart3, tag: 'LAPORAN' }
  ];

  // Shared SNBT / UTBK Navigation Dropdown Component
  const renderSnbtMenu = () => (
    <div className="space-y-1 my-1">
      <button
        type="button"
        onClick={toggleSnbt}
        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
          isSnbtSubmenuActive
            ? 'bg-gradient-to-r from-indigo-950/80 via-rose-950/60 to-slate-900 text-indigo-300 font-bold border border-indigo-500/50 shadow-md'
            : isSnbtOpen
            ? 'bg-slate-800/70 text-slate-200'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
        }`}
        title={isCollapsed ? 'SNBT / UTBK' : undefined}
      >
        {isSnbtSubmenuActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-indigo-500 via-rose-500 to-amber-500 rounded-r-full shadow-md shadow-indigo-500/50" />
        )}

        <div className="relative">
          <Flame className={`w-5 h-5 shrink-0 transition-transform ${isSnbtSubmenuActive ? 'text-amber-400 fill-amber-400 scale-110' : 'text-amber-400 group-hover:scale-105'}`} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>

        <div className={`flex items-center gap-2 flex-1 truncate text-left ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
          <span className="font-extrabold tracking-wide text-white">SNBT / UTBK</span>
          <span className="px-1.5 py-0.2 text-[9px] font-black rounded-sm bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500 text-white tracking-wider">
            UTBK 26
          </span>
        </div>

        {/* Dropdown Chevron Indicator */}
        {!isCollapsed && (
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              isSnbtOpen ? 'rotate-180 text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
        )}
      </button>

      {/* Submenu Container (SNBT-Dashboard, Data Siswa XII-UTBK, ROADMAP-SNBT, Countdown H-x) */}
      {isSnbtOpen && !isCollapsed && (
        <div className="pl-2.5 pr-1 py-1 space-y-1 ml-3 border-l-2 border-indigo-500/40 my-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {snbtSubMenuItems
            .filter(subItem => !(role === 'student' && subItem.id === 'snbt_students'))
            .map(subItem => {
            const SubIcon = subItem.icon;
            const isSubActive = activeTab === subItem.id;

            return (
              <button
                key={subItem.id}
                type="button"
                onClick={() => handleItemClick(subItem.id as SidebarTab)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 relative group cursor-pointer ${
                  isSubActive
                    ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <SubIcon className={`w-4 h-4 shrink-0 transition-transform ${isSubActive ? 'text-indigo-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="truncate text-left">{subItem.label}</span>
                </div>

                {subItem.tag && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded-md ${
                    subItem.tag === 'HUB'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : subItem.tag === 'SISWA'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : subItem.tag === 'ROADMAP'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : subItem.tag === 'TIMER'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : subItem.tag === 'LAPORAN'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    {subItem.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // Shared Labschool Navigation Dropdown Component
  const renderLabschoolMenu = () => (
    <div className="space-y-1 my-1">
      <button
        type="button"
        onClick={toggleLabschool}
        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
          isLabschoolSubmenuActive
            ? 'bg-gradient-to-r from-red-950/60 via-blue-950/60 to-slate-900 text-blue-300 font-bold border border-blue-500/50 shadow-md'
            : isLabschoolOpen
            ? 'bg-slate-800/70 text-slate-200'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
        }`}
        title={isCollapsed ? 'LABSCHOOL' : undefined}
      >
        {isLabschoolSubmenuActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-red-500 to-blue-500 rounded-r-full shadow-md shadow-red-500/50" />
        )}

        <div className="relative">
          <GraduationCap className={`w-5 h-5 shrink-0 transition-transform ${isLabschoolSubmenuActive ? 'text-blue-400 scale-110' : 'text-amber-400 group-hover:scale-105'}`} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
        </div>

        <div className={`flex items-center gap-2 flex-1 truncate text-left ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
          <span className="font-extrabold tracking-wide text-white">LABSCHOOL</span>
          <span className="px-1.5 py-0.2 text-[9px] font-black rounded-sm bg-gradient-to-r from-red-500 to-blue-600 text-white tracking-wider">
            PSB 26
          </span>
        </div>

        {/* Dropdown Chevron Indicator */}
        {!isCollapsed && (
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              isLabschoolOpen ? 'rotate-180 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
        )}
      </button>

      {/* Submenu Container (Dashboard-Labs, Roadmap Kurikulum, PSB SMP, PSB SMA) */}
      {isLabschoolOpen && !isCollapsed && (
        <div className="pl-2.5 pr-1 py-1 space-y-1 ml-3 border-l-2 border-gradient-to-b border-blue-500/40 my-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {labschoolSubMenuItems.map(subItem => {
            const SubIcon = subItem.icon;
            const isSubActive = activeTab === subItem.id;

            return (
              <button
                key={subItem.id}
                type="button"
                onClick={() => handleItemClick(subItem.id as SidebarTab)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 relative group cursor-pointer ${
                  isSubActive
                    ? 'bg-blue-600/25 text-blue-300 border border-blue-500/50 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <SubIcon className={`w-4 h-4 shrink-0 transition-transform ${isSubActive ? 'text-blue-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="truncate text-left">{subItem.label}</span>
                </div>

                {subItem.tag && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded-md ${
                    subItem.tag === 'HUB'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : subItem.tag === 'KAMPUS'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : subItem.tag === 'ROADMAP'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : subItem.tag === 'SMP'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : subItem.tag === 'SMA'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : subItem.tag === 'LAPORAN'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    {subItem.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-20 lg:top-[53px] sm:lg:top-[57px] lg:h-[calc(100vh-53px)] sm:lg:h-[calc(100vh-57px)] bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Header inside Mobile Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <span className="font-extrabold text-white text-sm tracking-tight">
              <span className="text-red-500">BRAIN</span> <span className="text-blue-400">SPACE</span>
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <div className={`px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'hidden lg:block text-center' : ''}`}>
            {isCollapsed ? '•••' : role === 'admin' ? 'PANEL ADMINISTRATOR' : role === 'teacher' ? 'PANEL GURU / PENDIDIK' : 'PANEL SISWA'}
          </div>

          {/* ADMIN ROLE NAVIGATION */}
          {role === 'admin' ? (
            <div className="space-y-1">
              {/* 1. Dashboard Utama */}
              <button
                onClick={() => handleItemClick('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group ${
                  activeTab === 'overview'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? 'Dashboard Utama' : undefined}
              >
                {activeTab === 'overview' && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-red-500 to-blue-500 rounded-r-full shadow-lg shadow-red-500/50" />
                )}
                <LayoutDashboard className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'overview' ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />
                <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                  Dashboard Utama
                </span>
              </button>

              {/* 2. Menu Khusus LABSCHOOL (Dashboard-Labs, Roadmap, PSB SMP, PSB SMA) */}
              {renderLabschoolMenu()}

              {/* 3. Menu Khusus SNBT / UTBK (Dashboard, Siswa XII-UTBK, Roadmap, Countdown) */}
              {renderSnbtMenu()}

              {/* 3. Dropdown Menu: Manajemen User */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={toggleUserManagement}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
                    isUserSubmenuActive
                      ? 'bg-slate-800/90 text-blue-300 font-semibold border border-slate-700/80 shadow-sm'
                      : isUserManagementOpen
                      ? 'bg-slate-800/60 text-slate-200'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? 'Manajemen User' : undefined}
                >
                  {isUserSubmenuActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
                  )}

                  <UserCog className={`w-5 h-5 shrink-0 transition-transform ${isUserSubmenuActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />

                  <span className={`truncate text-left flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    Manajemen User
                  </span>

                  {/* Pending Badge on Parent when dropdown is closed */}
                  {!isCollapsed && !isUserManagementOpen && pendingCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {pendingCount}
                    </span>
                  )}

                  {/* Dropdown Chevron Indicator */}
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isUserManagementOpen ? 'rotate-180 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                  )}

                  {/* Collapsed view badge indicator */}
                  {isCollapsed && pendingCount > 0 && (
                    <span className="lg:absolute lg:top-2 lg:right-2 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>

                {/* Submenu Container (Hidden by default, shown when clicked) */}
                {isUserManagementOpen && !isCollapsed && (
                  <div className="pl-3 pr-1 py-1 space-y-1 ml-3 border-l-2 border-slate-800/90 my-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {userSubMenuItems.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          type="button"
                          onClick={() => handleItemClick(subItem.id as SidebarTab)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 relative group cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 shrink-0 transition-transform ${isSubActive ? 'text-blue-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="truncate text-left">{subItem.label}</span>
                          
                          {/* Badge for Pending Approval */}
                          {subItem.badge !== undefined && (
                            <span className="ml-auto px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                              {subItem.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Dropdown Menu: Akademik */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={toggleAcademic}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
                    isAcademicSubmenuActive
                      ? 'bg-slate-800/90 text-blue-300 font-semibold border border-slate-700/80 shadow-sm'
                      : isAcademicOpen
                      ? 'bg-slate-800/60 text-slate-200'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? 'Akademik' : undefined}
                >
                  {isAcademicSubmenuActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
                  )}

                  <School className={`w-5 h-5 shrink-0 transition-transform ${isAcademicSubmenuActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />

                  <span className={`truncate text-left flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    Akademik
                  </span>

                  {/* Submenu count badge when closed */}
                  {!isCollapsed && !isAcademicOpen && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {academicSubMenuItems.length}
                    </span>
                  )}

                  {/* Dropdown Chevron Indicator */}
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isAcademicOpen ? 'rotate-180 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                  )}
                </button>

                {/* Submenu Container (Hidden by default, shown when clicked) */}
                {isAcademicOpen && !isCollapsed && (
                  <div className="pl-3 pr-1 py-1 space-y-1 ml-3 border-l-2 border-slate-800/90 my-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {academicSubMenuItems.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          type="button"
                          onClick={() => handleItemClick(subItem.id as SidebarTab)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 relative group cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 shrink-0 transition-transform ${isSubActive ? 'text-blue-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="truncate text-left">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Other Admin Menu Items */}
              {adminGeneralMenuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isSettings = item.id === 'settings';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id as SidebarTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
                      isActive
                        ? isSettings
                          ? 'bg-gradient-to-r from-rose-950/60 to-slate-900 text-rose-300 border border-rose-500/50 shadow-md font-bold'
                          : 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-md font-bold'
                        : isSettings
                        ? 'text-slate-300 hover:text-rose-300 hover:bg-rose-950/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full shadow-lg ${
                        isSettings
                          ? 'bg-gradient-to-b from-rose-500 to-amber-500 shadow-rose-500/50'
                          : 'bg-gradient-to-b from-red-500 to-blue-500 shadow-red-500/50'
                      }`} />
                    )}

                    <Icon className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive
                        ? isSettings
                          ? 'text-rose-400 scale-110'
                          : 'text-blue-400 scale-110'
                        : isSettings
                        ? 'text-rose-400 group-hover:scale-105'
                        : 'text-slate-400 group-hover:scale-105'
                    }`} />

                    <span className={`truncate text-left flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {item.label}
                    </span>

                    {isSettings && !isCollapsed && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        ADMIN
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : role === 'teacher' ? (
            /* TEACHER ROLE NAVIGATION */
            <div className="space-y-1">
              {/* 1. Dashboard Utama Guru */}
              <button
                onClick={() => handleItemClick('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group ${
                  activeTab === 'overview'
                    ? 'bg-amber-600/15 text-amber-400 border border-amber-500/40 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? 'Dashboard Guru' : undefined}
              >
                {activeTab === 'overview' && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-r-full shadow-lg shadow-amber-500/50" />
                )}
                <LayoutDashboard className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'overview' ? 'text-amber-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />
                <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                  Dashboard Guru
                </span>
              </button>

              {/* 2. Menu Khusus LABSCHOOL */}
              {renderLabschoolMenu()}

              {/* 2b. Menu Khusus SNBT / UTBK */}
              {renderSnbtMenu()}

              {/* 3. Dropdown Menu: Menu Kelas (Kelas yang Diajar) */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={toggleTeacherClassMenu}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
                    isTeacherClassSubmenuActive
                      ? 'bg-slate-800/90 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                      : isTeacherClassMenuOpen
                      ? 'bg-slate-800/60 text-slate-200'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? 'Menu Kelas Diajar' : undefined}
                >
                  {isTeacherClassSubmenuActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-r-full shadow-md shadow-amber-500/50" />
                  )}

                  <Layers className={`w-5 h-5 shrink-0 transition-transform ${isTeacherClassSubmenuActive ? 'text-amber-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />

                  <span className={`truncate text-left flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    Menu Kelas
                  </span>

                  {/* Badge showing count of assigned classes when not collapsed */}
                  {!isCollapsed && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {teacherAssignedClasses.length} Kelas
                    </span>
                  )}

                  {/* Dropdown Chevron Indicator */}
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isTeacherClassMenuOpen ? 'rotate-180 text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                  )}
                </button>

                {/* Submenu Dropdown Items: Kelas yang Diajar */}
                {isTeacherClassMenuOpen && !isCollapsed && (
                  <div className="pl-3 pr-1 py-1 space-y-1 ml-3 border-l-2 border-amber-500/40 my-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Option: Semua Kelas Binaan */}
                    <button
                      type="button"
                      onClick={() => handleTeacherClassClick('ALL')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                        activeTab === 'classes' && (selectedTeacherClass === 'ALL' || !selectedTeacherClass)
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Layers className={`w-4 h-4 shrink-0 ${activeTab === 'classes' && selectedTeacherClass === 'ALL' ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="truncate">Semua Kelas Binaan</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Overview</span>
                    </button>

                    {/* Individual Classes Taught by this Teacher */}
                    {teacherAssignedClasses.map(clsName => {
                      const isSubClassActive = activeTab === 'classes' && selectedTeacherClass === clsName;

                      return (
                        <button
                          key={clsName}
                          type="button"
                          onClick={() => handleTeacherClassClick(clsName)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                            isSubClassActive
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <GraduationCap className={`w-4 h-4 shrink-0 ${isSubClassActive ? 'text-amber-400' : 'text-slate-500'}`} />
                            <span className="truncate font-semibold">Kelas {clsName}</span>
                          </div>
                          {isSubClassActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Other General Teacher Menu Items */}
              {teacherGeneralMenuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id as SidebarTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-amber-600/15 text-amber-400 border border-amber-500/40 shadow-md font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-r-full shadow-lg shadow-amber-500/50" />
                    )}

                    <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-amber-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />

                    <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* STUDENT ROLE NAVIGATION */
            <div className="space-y-1">
              {/* 1. Dashboard Siswa */}
              <button
                onClick={() => handleItemClick('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group ${
                  activeTab === 'overview'
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? 'Dashboard Siswa' : undefined}
              >
                {activeTab === 'overview' && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-red-500 to-blue-500 rounded-r-full shadow-lg shadow-red-500/50" />
                )}
                <LayoutDashboard className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'overview' ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />
                <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                  Dashboard Siswa
                </span>
              </button>

              {/* 2. Menu Khusus LABSCHOOL (Hanya untuk Siswa Program Labschool) */}
              {isStudentLabschool(currentUser) && renderLabschoolMenu()}

              {/* 2b. Menu Khusus SNBT / UTBK (Hanya untuk Siswa Program SNBT) */}
              {isStudentSnbt(currentUser) && renderSnbtMenu()}

              {/* 3. Other Student Menu Items */}
              {studentMenuItems.filter(item => item.id !== 'overview').map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id as SidebarTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-md font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-red-500 to-blue-500 rounded-r-full shadow-lg shadow-red-500/50" />
                    )}

                    <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:scale-105'}`} />

                    <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Fold/Collapse Toggle (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-800 bg-slate-950/40">
          {!isCollapsed && (
            <span className="text-xs text-slate-500 font-medium px-2">
              Versi 2.5 • BSA CBT
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              isCollapsed ? 'w-full flex justify-center' : ''
            }`}
            title={isCollapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  );
};
