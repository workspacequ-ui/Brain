import React, { useState, useEffect } from 'react';
import { User, ClassItem, FeaturedProgram, MarketplaceProduct, InstitutionInfo, Teacher } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { getFeaturedPrograms, getProducts, getInstitutionInfo, getTeachers } from '../../utils/storage';
import { PendingApprovalView } from './PendingApprovalView';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  IdCard,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Search,
  Tag,
  Package,
  Store,
  Check,
  Eye,
  EyeOff,
  MessageCircle,
  LogIn,
  UserPlus
} from 'lucide-react';

interface LandingAuthProps {
  onLoginSuccess: (user: User) => void;
  onRegisterSubmit: (newUser: Omit<User, 'id' | 'createdAt'>) => User;
  classes: ClassItem[];
  users: User[];
  teachers?: Teacher[];
  pendingUser?: User | null;
  onLogoutPending?: () => void;
  institutionInfo?: InstitutionInfo;
}

export const LandingAuth: React.FC<LandingAuthProps> = ({
  onLoginSuccess,
  onRegisterSubmit,
  classes,
  users,
  teachers: propTeachers,
  pendingUser,
  onLogoutPending,
  institutionInfo
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const institution = institutionInfo || getInstitutionInfo();
  const teachersList = propTeachers || getTeachers();
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regNis, setRegNis] = useState('');
  const [regName, setRegName] = useState('');
  const [regClass, setRegClass] = useState(classes[0]?.name || 'XII-UTBK');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Local feedback message
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Featured Programs & Marketplace Products state for auto-sliding banner
  const [featuredPrograms] = useState<FeaturedProgram[]>(() => getFeaturedPrograms().filter(p => p.isPublished !== false));
  const [products] = useState<MarketplaceProduct[]>(() => getProducts());
  const [slideIdx, setSlideIdx] = useState(0);

  // Marketplace Modal View State
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [mktSearch, setMktSearch] = useState('');
  const [mktCategory, setMktCategory] = useState('SEMUA');

  // Detail Modal for selected slide item
  const [selectedDetailItem, setSelectedDetailItem] = useState<FeaturedProgram | MarketplaceProduct | null>(null);

  // Auto-scroll Featured Programs & Products every 5 seconds
  useEffect(() => {
    if (featuredPrograms.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIdx(prev => (prev >= featuredPrograms.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredPrograms.length]);

  const prevSlide = () => {
    setSlideIdx(prev => (prev === 0 ? Math.max(0, featuredPrograms.length - 1) : prev - 1));
  };

  const nextSlide = () => {
    setSlideIdx(prev => (prev >= featuredPrograms.length - 1 ? 0 : prev + 1));
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const activeSlideItem = featuredPrograms[slideIdx] || featuredPrograms[0];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(mktSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(mktSearch.toLowerCase());
    const matchesCategory = mktCategory === 'SEMUA' || p.category === mktCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Login Submission (Supports Email, Username, NIS, NIP)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Silakan isi email / username / NIP / NIS dan password Anda.');
      return;
    }

    const inputId = loginEmail.trim().toLowerCase();
    const inputPass = loginPassword;

    // 1. Search in users (by email, username, nis)
    let foundUser = users.find(u => {
      const matchId =
        u.email.toLowerCase() === inputId ||
        (u.username && u.username.toLowerCase() === inputId) ||
        u.nis.toLowerCase() === inputId ||
        u.name.toLowerCase() === inputId;
      return matchId && (u.password === inputPass || (!u.password && (inputPass === 'user123' || inputPass === 'guru123')));
    });

    // 2. If not found in users, search in teachers list
    if (!foundUser && teachersList && teachersList.length > 0) {
      const matchedTeacher = teachersList.find(t => {
        const matchTch =
          t.email.toLowerCase() === inputId ||
          (t.username && t.username.toLowerCase() === inputId) ||
          t.nip.toLowerCase() === inputId ||
          t.name.toLowerCase() === inputId;
        const validPass = t.password ? t.password === inputPass : (inputPass === 'guru123' || inputPass === 'admin123');
        return matchTch && validPass;
      });

      if (matchedTeacher) {
        foundUser = {
          id: matchedTeacher.id,
          nis: matchedTeacher.nip,
          username: matchedTeacher.username || matchedTeacher.nip,
          name: matchedTeacher.name,
          email: matchedTeacher.email,
          password: matchedTeacher.password || 'guru123',
          role: 'teacher',
          className: matchedTeacher.targetClasses?.[0] || 'SEMUA',
          subject: matchedTeacher.subject,
          targetClasses: matchedTeacher.targetClasses || ['SEMUA'],
          phone: matchedTeacher.phone,
          status: matchedTeacher.status === 'ACTIVE' ? 'ACTIVE' : 'REJECTED',
          createdAt: matchedTeacher.createdAt,
          avatar: matchedTeacher.avatar,
          bio: matchedTeacher.bio
        };
      }
    }

    if (!foundUser) {
      setErrorMessage('Kredensial tidak valid. Silakan periksa username/email/NIP dan password Anda.');
      return;
    }

    if (foundUser.status === 'REJECTED') {
      setErrorMessage('Akun Anda telah dinonaktifkan atau ditolak oleh Administrator.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  // Quick Demo Login Helper for easy evaluation
  const handleQuickLogin = (identifier: string, pass: string) => {
    setLoginEmail(identifier);
    setLoginPassword(pass);
    setErrorMessage('');
    setSuccessMessage('');
    const inputId = identifier.trim().toLowerCase();

    // 1. Check users list
    let target = users.find(
      u =>
        u.email.toLowerCase() === inputId ||
        (u.username && u.username.toLowerCase() === inputId) ||
        u.nis.toLowerCase() === inputId ||
        u.name.toLowerCase() === inputId
    );

    // 2. Check teachers if not found
    if (!target && teachersList && teachersList.length > 0) {
      const matchedTch = teachersList.find(
        t =>
          t.email.toLowerCase() === inputId ||
          (t.username && t.username.toLowerCase() === inputId) ||
          t.nip.toLowerCase() === inputId ||
          t.name.toLowerCase() === inputId
      );
      if (matchedTch) {
        target = {
          id: matchedTch.id,
          nis: matchedTch.nip,
          username: matchedTch.username || matchedTch.nip,
          name: matchedTch.name,
          email: matchedTch.email,
          password: matchedTch.password || pass,
          role: 'teacher',
          className: matchedTch.targetClasses?.[0] || 'SEMUA',
          subject: matchedTch.subject,
          targetClasses: matchedTch.targetClasses || ['SEMUA'],
          phone: matchedTch.phone,
          status: matchedTch.status === 'ACTIVE' ? 'ACTIVE' : 'REJECTED',
          createdAt: matchedTch.createdAt,
          avatar: matchedTch.avatar,
          bio: matchedTch.bio
        };
      }
    }

    // 3. Check INITIAL_USERS fallback
    if (!target && INITIAL_USERS && INITIAL_USERS.length > 0) {
      const matchedInit = INITIAL_USERS.find(
        u =>
          u.email.toLowerCase() === inputId ||
          (u.username && u.username.toLowerCase() === inputId) ||
          u.nis.toLowerCase() === inputId ||
          u.name.toLowerCase() === inputId
      );
      if (matchedInit) {
        target = matchedInit;
      }
    }

    // 4. Guaranteed fallback definitions for all 6 demo accounts
    if (!target) {
      if (inputId === 'admin') {
        target = {
          id: 'u-admin',
          nis: 'ADMIN001',
          name: 'Administrator Utama',
          email: 'admin@brainspace.id',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          className: 'SEMUA',
          status: 'ACTIVE',
          createdAt: '2026-01-10',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
        };
      } else if (inputId === 'hendra') {
        target = {
          id: 'tch-1',
          nis: '198503152010011012',
          name: 'Dr. Hendra Wijaya, M.Pd.',
          email: 'hendra.wijaya@brainspace.id',
          username: 'hendra',
          password: 'guru123',
          role: 'teacher',
          className: 'XII-UTBK',
          subject: 'Matematika & TPS Kuantitatif',
          targetClasses: ['XII-UTBK', 'XI-IPA'],
          status: 'ACTIVE',
          createdAt: '2025-08-10',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
          bio: 'Pakar Penalaran Matematika & TPS SNBT'
        };
      } else if (inputId === 'raditya') {
        target = {
          id: 'u-smp-lab-1',
          nis: '20267001',
          name: 'Raditya Pratama Putra',
          email: 'raditya.pratama@student.com',
          username: 'raditya',
          password: 'user123',
          role: 'student',
          className: 'SMP-LABSCHOOL',
          group: 'Kelompok Alpha (SMP-Labs)',
          status: 'ACTIVE',
          createdAt: '2026-01-10',
          bio: 'Target: SMP Labschool Rawamangun | Jalur CBT Labschool',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
        };
      } else if (inputId === 'arya') {
        target = {
          id: 'u-sma-lab-1',
          nis: '20261011',
          name: 'Arya Dewantara Putra',
          email: 'arya.dewantara@student.com',
          username: 'arya',
          password: 'user123',
          role: 'student',
          className: 'SMA-LABSCHOOL',
          group: 'Kelompok Garuda (SMA-Labs)',
          status: 'ACTIVE',
          createdAt: '2026-01-10',
          bio: 'Target: SMA Labschool Kebayoran | Jalur CBT SMA Labschool',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
        };
      } else if (inputId === 'budi') {
        target = {
          id: 'u-s1',
          nis: '20261001',
          name: 'Budi Santoso',
          email: 'budi@student.com',
          username: 'budi',
          password: 'user123',
          role: 'student',
          className: 'XII-UTBK',
          group: 'Kelompok 1 - Alpha (UTBK)',
          status: 'ACTIVE',
          createdAt: '2026-01-15',
          bio: 'Target PTN: UI - Kedokteran | Rata-rata Tryout: 712',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
        };
      } else if (inputId === 'dewi') {
        target = {
          id: 'u-s4',
          nis: '20261006',
          name: 'Dewi Lestari',
          email: 'dewi.lestari@student.com',
          username: 'dewi',
          password: 'user123',
          role: 'student',
          className: 'XI-IPA',
          group: 'Kelompok 2 - Einstein (Reguler)',
          status: 'ACTIVE',
          createdAt: '2026-01-22',
          bio: 'Siswa Reguler Kelas XI-IPA MIPA SMA | Non-Labs & Non-SNBT',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80'
        };
      }
    }

    if (target) {
      onLoginSuccess(target);
    }
  };

  // Handle Registration Submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regNis || !regName || !regEmail || !regPassword) {
      setErrorMessage('Semua bidang registrasi wajib diisi!');
      return;
    }

    // Check duplicate NIS or Email
    const existingEmail = users.find(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existingEmail) {
      setErrorMessage('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      return;
    }

    const existingNis = users.find(u => u.nis === regNis.trim());
    if (existingNis) {
      setErrorMessage('NIS sudah terdaftar dalam sistem.');
      return;
    }

    const newUser = onRegisterSubmit({
      nis: regNis.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: 'student',
      className: regClass,
      status: 'PENDING',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
    });

    onLoginSuccess(newUser);
  };

  // If user is PENDING, show "Halaman Tunggu Validation" with Catalog & Marketplace slides
  if (pendingUser && pendingUser.status === 'PENDING') {
    return (
      <PendingApprovalView
        user={pendingUser}
        onLogout={onLogoutPending || (() => {})}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* TOP NAVBAR PADA HALAMAN LOGIN */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-6 lg:px-8 py-3 transition-all shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo & Institution Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {institution?.logoUrl ? (
              (() => {
                const shapeClass = institution?.logoShape === 'square'
                  ? 'rounded-none'
                  : institution?.logoShape === 'circle'
                  ? 'rounded-full'
                  : institution?.logoShape === 'banner'
                  ? 'rounded-2xl'
                  : 'rounded-xl';

                const sizeClass = institution?.logoSize === 'large'
                  ? 'w-11 h-11 sm:w-12 sm:h-12'
                  : institution?.logoSize === 'extralarge'
                  ? 'w-12 h-12 sm:w-14 sm:h-14'
                  : institution?.logoSize === 'banner'
                  ? 'h-9 sm:h-10 w-auto max-w-[130px]'
                  : 'w-9 h-9 sm:w-10 sm:h-10';

                const isFullArea = institution?.logoFullArea ?? true;
                const paddingClass = (isFullArea && (institution?.logoPadding === 'none' || !institution?.logoPadding))
                  ? 'p-0'
                  : institution?.logoPadding === 'medium'
                  ? 'p-1'
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
                  : 'bg-transparent';

                const borderClass = institution?.logoBorder !== false
                  ? 'border border-slate-700/80 shadow-md'
                  : 'border-0';

                return (
                  <div className={`${sizeClass} ${shapeClass} ${bgClass} ${paddingClass} ${borderClass} flex items-center justify-center shrink-0 overflow-hidden`}>
                    <img
                      src={institution.logoUrl}
                      alt={institution.name || 'Brain Space Academy'}
                      className={`w-full h-full ${fitClass} ${institution?.logoShape === 'circle' ? 'rounded-full' : shapeClass}`}
                    />
                  </div>
                );
              })()
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 via-blue-600 to-blue-700 p-0.5 shadow-md shadow-blue-900/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-sm sm:text-base md:text-lg tracking-tight text-white drop-shadow-sm truncate">
                  {institution?.name ? institution.name : (
                    <>
                      <span className="text-red-500">BRAIN</span> <span className="text-blue-400">SPACE</span> <span className="text-white hidden sm:inline">ACADEMY</span>
                    </>
                  )}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-sm shrink-0">
                  <Sparkles className="w-3 h-3 mr-1 text-red-400" /> CBT & LMS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate hidden sm:block">
                {institution?.subtitle || 'LMS & Online Exam System (CBT)'}
              </p>
            </div>
          </div>

          {/* Nav Items: WhatsApp Icon, Marketplace Icon, Login, Register (Icon Only) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* 1. WhatsApp Icon Button */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Brain%20Space%20Academy,%20saya%20ingin%20konsultasi%20layanan%20dan%20pendaftaran"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 border border-emerald-700/60 hover:border-emerald-500 transition-all shadow-sm group hover:scale-105 active:scale-95"
              title="Hubungi WhatsApp"
              aria-label="Hubungi WhatsApp"
            >
              <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400 group-hover:text-emerald-300 transition-transform" />
            </a>

            {/* 2. Marketplace Icon Button */}
            <button
              type="button"
              onClick={() => setShowMarketplaceModal(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-100 border border-cyan-700/60 hover:border-cyan-400 transition-all shadow-sm group cursor-pointer hover:scale-105 active:scale-95"
              title="Marketplace Sekolah"
              aria-label="Marketplace Sekolah"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-400 group-hover:text-cyan-300 transition-transform" />
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-800 mx-0.5" />

            {/* 3. Login Icon Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
                const formEl = document.getElementById('auth-form-container');
                if (formEl) {
                  formEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-blue-900/40 border border-blue-400/40'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70'
              }`}
              title="Login"
              aria-label="Login"
            >
              <LogIn className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* 4. Register Icon Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
                const formEl = document.getElementById('auth-form-container');
                if (formEl) {
                  formEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-blue-900/40 border border-blue-400/40'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70'
              }`}
              title="Register"
              aria-label="Register"
            >
              <UserPlus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

          </div>

        </div>
      </header>

      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Sisi Kiri (Branding Area) */}
        <div className="lg:col-span-7 bg-slate-900 border-r border-slate-800 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            {institution?.logoUrl ? (
              (() => {
                const shapeClass = institution?.logoShape === 'square'
                  ? 'rounded-none'
                  : institution?.logoShape === 'circle'
                  ? 'rounded-full'
                  : institution?.logoShape === 'banner'
                  ? 'rounded-2xl'
                  : 'rounded-2xl';

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
                  : 'bg-transparent';

                const borderClass = institution?.logoBorder !== false
                  ? 'border border-slate-700/80 shadow-xl'
                  : 'border-0';

                return (
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${shapeClass} ${bgClass} ${paddingClass} ${borderClass} flex items-center justify-center shrink-0 overflow-hidden`}>
                    <img
                      src={institution.logoUrl}
                      alt={institution.name || 'Brain Space Academy'}
                      className={`w-full h-full ${fitClass} ${institution?.logoShape === 'circle' ? 'rounded-full' : shapeClass}`}
                    />
                  </div>
                );
              })()
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-600 via-blue-600 to-blue-700 p-0.5 shadow-xl shadow-blue-900/40 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow">
                {institution?.name ? institution.name : (
                  <>
                    <span className="text-red-500">BRAIN</span> <span className="text-blue-400">SPACE</span> <span className="text-white">ACADEMY</span>
                  </>
                )}
              </h1>
              <p className="text-xs text-blue-300 font-semibold tracking-wider uppercase">
                {institution?.subtitle || 'LMS & Online Exam System (CBT)'}
              </p>
            </div>
          </div>

          {/* SLIDE DINAMIS PRODUK UNGGULAN (BERGULIR OTOMATIS EVERY 5s) */}
          <div className="relative z-10 my-6 space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-200 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Katalog Program & Produk Unggulan</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full animate-pulse border border-amber-500/40">
                  Gulir Otomatis 5s
                </span>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Slide Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Slide Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Card Display */}
            {activeSlideItem && (
              <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 group">
                <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                  <img
                    src={activeSlideItem.thumbnail}
                    alt={activeSlideItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Award className="w-3 h-3" /> {activeSlideItem.badge || 'PRODUK UNGGULAN'}
                  </span>

                  {/* Auto Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                    <div className="h-full bg-amber-400 animate-pulse w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      {activeSlideItem.category}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Item #{slideIdx + 1} dari {featuredPrograms.length}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {activeSlideItem.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {activeSlideItem.shortDesc}
                  </p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailItem(activeSlideItem)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Detail Silabus
                    </button>

                    {activeSlideItem.registerUrl && (
                      <a
                        href={activeSlideItem.registerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1"
                      >
                        Daftar Program <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  {featuredPrograms.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSlideIdx(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === slideIdx ? 'w-6 bg-amber-400' : 'w-2 bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Menu Tombol Marketplace Toko Sekolah */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMarketplaceModal(true)}
                className="w-full p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 border border-blue-500/40 hover:border-cyan-400/60 rounded-2xl shadow-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/30 text-blue-300 rounded-xl group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        Katalog Marketplace & Toko Sekolah
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                        Toko Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Klik untuk melihat daftar produk buku, paket tryout, & merchandise sekolah
                    </p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 rounded-xl transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 pt-8 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <p>© 2026 Brain Space Academy. Hak Cipta Dilindungi.</p>
            <p className="font-medium text-slate-300">CBT & LMS Portal</p>
          </div>

        </div>

        {/* Sisi Kanan (Form Area) */}
        <div id="auth-form-container" className="lg:col-span-5 bg-slate-950 p-6 sm:p-10 lg:p-12 flex flex-col justify-start items-center pt-6 sm:pt-10 lg:pt-12 scroll-mt-20">
          <div className="w-full max-w-md space-y-5">

            {/* Tab Toggle Login / Register */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                className={`py-2.5 font-bold text-sm rounded-xl transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk / Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`py-2.5 font-bold text-sm rounded-xl transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrasi Siswa
              </button>
            </div>

            {/* Messages */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORM LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-100">Masuk Akun Platform</h3>
                  <p className="text-xs text-slate-400">Masuk sebagai Guru, Administrator, atau Siswa terdaftar.</p>
                </div>

                {/* Quick Role Selection / Demo Accounts (6 Akun Demo Lengkap) */}
                <div className="p-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Akses Cepat Akun Demo:
                    </span>
                    <span className="text-[10px] text-slate-500">Klik kartu untuk login instan</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {/* 1. Admin */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin', 'admin123')}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-left transition-all text-xs font-semibold group flex flex-col justify-between"
                      title="Masuk sebagai Administrator (admin / admin123)"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                          👑 Admin
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">admin</span>
                      </div>
                      <div className="truncate text-slate-100 group-hover:text-rose-200 font-bold">Administrator</div>
                      <div className="text-[10px] text-slate-400 truncate">Super Admin</div>
                    </button>

                    {/* 2. Guru */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('hendra', 'guru123')}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-left transition-all text-xs font-semibold group flex flex-col justify-between"
                      title="Masuk sebagai Guru MTK (hendra / guru123)"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                          👨‍🏫 Guru
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">hendra</span>
                      </div>
                      <div className="truncate text-slate-100 group-hover:text-amber-200 font-bold">Dr. Hendra</div>
                      <div className="text-[10px] text-slate-400 truncate">Guru MTK & TPS</div>
                    </button>

                    {/* 3. Siswa SMP Labs */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('raditya', 'user123')}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-left transition-all text-xs font-semibold group flex flex-col justify-between"
                      title="Masuk sebagai Siswa SMP Labschool (raditya / user123)"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          🏫 SMP Labs
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">raditya</span>
                      </div>
                      <div className="truncate text-slate-100 group-hover:text-emerald-200 font-bold">Raditya P.</div>
                      <div className="text-[10px] text-slate-400 truncate">SMP-LABSCHOOL</div>
                    </button>

                    {/* 4. Siswa SMA Labs */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('arya', 'user123')}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-left transition-all text-xs font-semibold group flex flex-col justify-between"
                      title="Masuk sebagai Siswa SMA Labschool (arya / user123)"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                          🏛️ SMA Labs
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">arya</span>
                      </div>
                      <div className="truncate text-slate-100 group-hover:text-indigo-200 font-bold">Arya Dewantara</div>
                      <div className="text-[10px] text-slate-400 truncate">SMA-LABSCHOOL</div>
                    </button>

                    {/* 5. Siswa SNBT */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('budi', 'user123')}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-left transition-all text-xs font-semibold group flex flex-col justify-between"
                      title="Masuk sebagai Siswa SNBT / XII-UTBK (budi / user123)"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          🎯 Siswa SNBT
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">budi</span>
                      </div>
                      <div className="truncate text-slate-100 group-hover:text-cyan-200 font-bold">Budi Santoso</div>
                      <div className="text-[10px] text-slate-400 truncate">XII-UTBK 2026</div>
                    </button>

                    {/* 6. Siswa Reguler (Non-Labs & Non-SNBT) */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('dewi', 'user123')}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-left transition-all text-xs font-semibold group flex flex-col justify-between"
                      title="Masuk sebagai Siswa Reguler Non-Labs & Non-SNBT (dewi / user123)"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                          📚 Siswa Reguler
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">dewi</span>
                      </div>
                      <div className="truncate text-slate-100 group-hover:text-purple-200 font-bold">Dewi Lestari</div>
                      <div className="text-[10px] text-slate-400 truncate">XI-IPA Reguler</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username / Email / NIP / NIS
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="contoh: hendra, budi, atau 198503152010011012"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kata Sandi / Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                        title={showLoginPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 via-blue-600 to-blue-700 hover:from-red-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all text-sm flex items-center justify-center gap-2 mt-4"
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* FORM REGISTRASI */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-100">Pendaftaran Siswa Baru</h3>
                  <p className="text-xs text-slate-400">Isi formulir dengan data diri asli Anda.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nomor Induk Siswa (NIS)
                    </label>
                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regNis}
                        onChange={e => setRegNis(e.target.value)}
                        placeholder="20261005"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pilihan Kelas
                    </label>
                    <select
                      value={regClass}
                      onChange={e => setRegClass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Siswa
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Nama lengkap sesuai ijazah"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alamat Email Active
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="email.aktif@gmail.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                      title={showRegPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                  ℹ️ Akun pendaftaran baru akan berstatus <strong className="text-amber-400">PENDING</strong> dan memerlukan persetujuan Administrator sebelum bisa digunakan.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 via-blue-600 to-blue-700 hover:from-red-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all text-xs flex items-center justify-center gap-2 mt-2"
                >
                  <span>Daftar Siswa Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Feature Highlights Grid placed directly under the form */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-100">LJK Digital & PDF Split</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Ujian dengan tampilan dokumen PDF berdampingan LJK instan.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-100">Kalkulasi Skor Otomatis</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Hasil ujian, pembahasan soal, dan perangkingan real-time.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL MARKETPLACE / TOKO SEKOLAH */}
      {showMarketplaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    Katalog Marketplace Pendidikan & Toko Sekolah
                  </h3>
                  <p className="text-xs text-slate-400">
                    Satu tempat untuk membeli modul, buku cetak, paket tryout premium, dan merchandise official Brain Space.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMarketplaceModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={mktSearch}
                  onChange={e => setMktSearch(e.target.value)}
                  placeholder="Cari produk toko..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['SEMUA', 'Buku Cetak', 'Paket Tryout Premium', 'Akses Bimbel VIP', 'Merchandising'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMktCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      mktCategory === cat
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <Package className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">Tidak ada produk ditemukan sesuai pencarian.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
                    >
                      <div>
                        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-cyan-300 font-bold text-[10px] rounded-lg border border-slate-700 uppercase">
                            {prod.category}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-sm text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-3">
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-500 block font-bold uppercase">Harga Resmi</span>
                            <span className="text-base font-extrabold text-amber-400">
                              {formatRupiah(prod.price)}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-md">
                            Tersedia
                          </span>
                        </div>

                        {prod.externalLink && (
                          <a
                            href={prod.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <span>Beli / Pesan Sekarang</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <p>Menampilkan {filteredProducts.length} produk dari Toko Brain Space Academy.</p>
              <button
                type="button"
                onClick={() => setShowMarketplaceModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
              >
                Tutup Katalog
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DETAIL PROGRAM / SILABUS */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold rounded-full uppercase">
                  {selectedDetailItem.category}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">
                  {selectedDetailItem.title || (selectedDetailItem as any).name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
              {(selectedDetailItem as FeaturedProgram).articleContent ? (
                <div className="whitespace-pre-line">
                  {(selectedDetailItem as FeaturedProgram).articleContent}
                </div>
              ) : (
                <p>{(selectedDetailItem as any).description}</p>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Tutup
              </button>

              {((selectedDetailItem as FeaturedProgram).registerUrl || (selectedDetailItem as MarketplaceProduct).externalLink) && (
                <a
                  href={(selectedDetailItem as FeaturedProgram).registerUrl || (selectedDetailItem as MarketplaceProduct).externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                >
                  Daftar / Beli Sekarang <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
