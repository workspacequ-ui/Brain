import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab, ClassItem, AccountStatus } from '../../types';
import { getUsers, saveUsers, saveUser, deleteUser } from '../../utils/storage';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  HelpCircle,
  Info,
  MapPin,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Users,
  XCircle,
  Zap,
  ChevronRight,
  School,
  AlertTriangle,
  Search,
  Filter,
  Phone,
  Mail,
  MessageCircle,
  LayoutGrid,
  ListFilter,
  FileSpreadsheet,
  BadgeCheck,
  Building,
  UserCheck,
  X,
  TrendingUp,
  UserPlus,
  Edit2,
  Trash2,
  Printer,
  Check,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface LabschoolPsbSmpProps {
  user: User;
  users?: User[];
  classes?: ClassItem[];
  onSaveStudent?: (student: User) => void;
  onDeleteStudent?: (id: string) => void;
  onNavigateTab: (tab: SidebarTab) => void;
  onStartExam?: (exam?: any) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface QuizQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LabschoolPsbSmp: React.FC<LabschoolPsbSmpProps> = ({
  user,
  users,
  classes = [],
  onSaveStudent,
  onDeleteStudent,
  onNavigateTab,
  onStartExam,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'kisi_kisi' | 'simulasi' | 'jadwal' | 'data_siswa'>('info');

  const isAdminOrTeacher = user.role === 'admin' || user.role === 'teacher';

  // Student CRUD Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<User | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);

  // Form State for Add / Edit Student
  const [formNis, setFormNis] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('user123');
  const [formPhone, setFormPhone] = useState('');
  const [formClass, setFormClass] = useState('SMP-LABSCHOOL');
  const [formGroup, setFormGroup] = useState('Kelompok Alpha (SMP-Labs)');
  const [formCampus, setFormCampus] = useState('SMP Labschool Rawamangun');
  const [formTargetLevel, setFormTargetLevel] = useState('Kelas 7 SMP Labschool');
  const [formStatus, setFormStatus] = useState<AccountStatus>('ACTIVE');
  const [formBio, setFormBio] = useState('');

  // Local synced users list
  const [localUsers, setLocalUsers] = useState<User[]>([]);

  useEffect(() => {
    if (users && users.length > 0) {
      setLocalUsers(users);
    } else {
      setLocalUsers(getUsers());
    }
  }, [users]);

  // Student Roster Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('SMP-LABSCHOOL');
  const [filterCampus, setFilterCampus] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Filter ONLY registered students belonging to SMP-LABSCHOOL
  const smpStudents = useMemo(() => {
    return localUsers.filter(u => {
      if (u.role !== 'student') return false;
      const cls = (u.className || '').trim().toUpperCase();
      return cls === 'SMP-LABSCHOOL' || cls === 'SMP LABSCHOOL' || cls.includes('SMP-LAB') || cls === 'MASUK LABSCHOOL (SMP)';
    });
  }, [localUsers]);

  // Filtered list based on search and filters
  const filteredSmpStudents = useMemo(() => {
    return localUsers.filter(st => {
      if (st.role !== 'student') return false;

      const cls = (st.className || '').trim().toUpperCase();
      const isSmpLab = cls === 'SMP-LABSCHOOL' || cls === 'SMP LABSCHOOL' || cls.includes('SMP-LAB') || cls === 'MASUK LABSCHOOL (SMP)';

      if (filterClass === 'SMP-LABSCHOOL') {
        if (!isSmpLab) return false;
      } else if (filterClass !== 'ALL') {
        if (st.className !== filterClass) return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || 
        st.name.toLowerCase().includes(q) ||
        st.nis.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        (st.phone && st.phone.includes(q)) ||
        (st.whatsapp && st.whatsapp.includes(q)) ||
        (st.group && st.group.toLowerCase().includes(q)) ||
        (st.bio && st.bio.toLowerCase().includes(q));

      const matchCampus = filterCampus === 'ALL' || 
        (st.bio && st.bio.toLowerCase().includes(filterCampus.toLowerCase())) ||
        (st.group && st.group.toLowerCase().includes(filterCampus.toLowerCase()));

      const matchGroup = filterGroup === 'ALL' || (st.group && st.group.toLowerCase().includes(filterGroup.toLowerCase()));

      const matchStatus = filterStatus === 'ALL' || st.status === filterStatus;

      return matchQ && matchCampus && matchGroup && matchStatus;
    });
  }, [localUsers, searchQuery, filterClass, filterCampus, filterGroup, filterStatus]);

  // Available classes list
  const availableClassOptions = useMemo(() => {
    const list = classes && classes.length > 0 ? classes.map(c => c.name) : ['SMP-LABSCHOOL', 'SMA-LABSCHOOL', 'VII-A', 'VIII-A', 'IX-A'];
    if (!list.includes('SMP-LABSCHOOL')) list.unshift('SMP-LABSCHOOL');
    return Array.from(new Set(list));
  }, [classes]);

  // Open Add Student Modal
  const handleOpenAddModal = () => {
    const randomNis = `2026${Math.floor(1000 + Math.random() * 9000)}`;
    setFormNis(randomNis);
    setFormName('');
    setFormEmail('');
    setFormPassword('user123');
    setFormPhone('');
    setFormClass('SMP-LABSCHOOL');
    setFormGroup('Kelompok Alpha (SMP-Labs)');
    setFormCampus('SMP Labschool Rawamangun');
    setFormTargetLevel('Kelas 7 SMP Labschool');
    setFormStatus('ACTIVE');
    setFormBio(`Target: SMP Labschool Rawamangun | Target Nilai CBT 85+`);
    setIsAddModalOpen(true);
  };

  // Open Edit Student Modal
  const handleOpenEditModal = (st: User) => {
    setStudentToEdit(st);
    setFormNis(st.nis || '');
    setFormName(st.name || '');
    setFormEmail(st.email || '');
    setFormPassword(st.password || 'user123');
    setFormPhone(st.whatsapp || st.phone || '');
    setFormClass(st.className || 'SMP-LABSCHOOL');
    setFormGroup(st.group || 'Kelompok Alpha (SMP-Labs)');
    
    // Parse campus from bio or default
    const campus = st.bio?.includes('Kebayoran') ? 'SMP Labschool Kebayoran' :
                   st.bio?.includes('Cibubur') ? 'SMP Labschool Cibubur' :
                   st.bio?.includes('Cirendeu') ? 'SMP Labschool Cirendeu' :
                   'SMP Labschool Rawamangun';
    
    setFormCampus(campus);
    setFormTargetLevel('Kelas 7 SMP Labschool');
    setFormStatus(st.status || 'ACTIVE');
    setFormBio(st.bio || '');
    setIsEditModalOpen(true);
  };

  // Save New Student
  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNis.trim() || !formEmail.trim()) {
      if (onShowToast) onShowToast('Mohon lengkapi Nama, NIS, dan Email siswa.', 'error');
      return;
    }

    const newStudent: User = {
      id: `u-smp-lab-${Date.now()}`,
      nis: formNis.trim(),
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      password: formPassword || 'user123',
      role: 'student',
      className: formClass,
      phone: formPhone.trim(),
      whatsapp: formPhone.trim(),
      group: formGroup,
      status: formStatus,
      bio: formBio.trim() || `Target: ${formCampus} | ${formTargetLevel}`,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (localUsers.length % 10)}?w=150&q=80`
    };

    if (onSaveStudent) {
      onSaveStudent(newStudent);
    } else {
      const updated = saveUser(newStudent);
      setLocalUsers(updated);
    }

    setIsAddModalOpen(false);
    if (onShowToast) onShowToast(`Siswa "${newStudent.name}" berhasil didaftarkan di kelas ${newStudent.className}!`, 'success');
  };

  // Update Existing Student
  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;

    const updatedStudent: User = {
      ...studentToEdit,
      nis: formNis.trim(),
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      password: formPassword,
      className: formClass,
      phone: formPhone.trim(),
      whatsapp: formPhone.trim(),
      group: formGroup,
      status: formStatus,
      bio: formBio.trim()
    };

    if (onSaveStudent) {
      onSaveStudent(updatedStudent);
    } else {
      const updated = saveUser(updatedStudent);
      setLocalUsers(updated);
    }

    if (selectedStudent?.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }

    setIsEditModalOpen(false);
    setStudentToEdit(null);
    if (onShowToast) onShowToast(`Data siswa "${updatedStudent.name}" berhasil diperbarui!`, 'success');
  };

  // Toggle Status Active / Pending
  const handleToggleStatus = (st: User) => {
    const nextStatus: AccountStatus = st.status === 'ACTIVE' ? 'PENDING' : 'ACTIVE';
    const updated: User = { ...st, status: nextStatus };
    if (onSaveStudent) {
      onSaveStudent(updated);
    } else {
      const res = saveUser(updated);
      setLocalUsers(res);
    }
    if (selectedStudent?.id === st.id) setSelectedStudent(updated);
    if (onShowToast) onShowToast(`Status siswa ${st.name} diubah menjadi ${nextStatus}`, 'info');
  };

  // Delete Student
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    if (onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
    } else {
      const updated = deleteUser(studentToDelete.id);
      setLocalUsers(updated);
    }
    if (selectedStudent?.id === studentToDelete.id) {
      setSelectedStudent(null);
    }
    setIsDeleteModalOpen(false);
    const deletedName = studentToDelete.name;
    setStudentToDelete(null);
    if (onShowToast) onShowToast(`Data siswa "${deletedName}" berhasil dihapus dari sistem.`, 'info');
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['No', 'NIS/ID', 'Nama Siswa', 'Kelas', 'Kelompok Belajar', 'Target Kampus', 'WhatsApp', 'Email', 'Status', 'Catatan / Bio'];
    const rows = filteredSmpStudents.map((st, idx) => [
      idx + 1,
      `"${st.nis}"`,
      `"${st.name}"`,
      `"${st.className}"`,
      `"${st.group || '-'}"`,
      `"${st.bio?.includes('Rawamangun') ? 'Labschool Rawamangun' : st.bio?.includes('Kebayoran') ? 'Labschool Kebayoran' : st.bio?.includes('Cibubur') ? 'Labschool Cibubur' : st.bio?.includes('Cirendeu') ? 'Labschool Cirendeu' : 'SMP Labschool'}"`,
      `"${st.whatsapp || st.phone || '-'}"`,
      `"${st.email}"`,
      `"${st.status}"`,
      `"${(st.bio || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_siswa_smp_labschool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Export data siswa SMP Labschool berhasil diunduh.', 'success');
  };

  // Mini CBT Simulation State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const smpQuestions: QuizQuestion[] = [
    {
      id: 1,
      subject: 'Matematika & Penalaran',
      question: 'Sebuah tangki air berbentuk kubus memiliki volume 512 liter. Jika tangki tersebut akan diisi air menggunakan ember bervolume 16 liter, berapa kali pengisian yang dibutuhkan hingga tangki penuh?',
      options: ['24 kali', '32 kali', '36 kali', '48 kali'],
      correctIndex: 1,
      explanation: 'Jumlah pengisian = Volume tangki / Volume ember = 512 liter / 16 liter = 32 kali pengisian.'
    },
    {
      id: 2,
      subject: 'Tes Potensi Akademik (TPA)',
      question: 'Semua siswa Labschool gemar membaca buku. Beberapa siswa Labschool mengikuti klub robotik. Kesimpulan yang benar adalah...',
      options: [
        'Semua siswa yang mengikuti klub robotik tidak gemar membaca buku',
        'Beberapa siswa yang mengikuti klub robotik gemar membaca buku',
        'Siswa yang tidak ikut robotik tidak gemar membaca buku',
        'Semua siswa gemar robotik dan membaca buku'
      ],
      correctIndex: 1,
      explanation: 'Karena semua siswa gemar membaca, maka anggota klub robotik yang merupakan siswa Labschool pastilah gemar membaca buku (Beberapa siswa yang mengikuti robotik gemar membaca).'
    },
    {
      id: 3,
      subject: 'Matematika HOTS',
      question: 'Rasio perbandingan jumlah buku Matematika dan buku Sains di perpustakaan adalah 5 : 3. Jika selisih kedua jenis buku tersebut adalah 24 buah, maka total jumlah seluruh buku Matematika dan Sains adalah...',
      options: ['72 buah', '84 buah', '96 buah', '120 buah'],
      correctIndex: 2,
      explanation: 'Selisih perbandingan = 5 - 3 = 2 bagian = 24 buku -> 1 bagian = 12 buku. Total buku = (5 + 3) x 12 = 8 x 12 = 96 buah.'
    },
    {
      id: 4,
      subject: 'Ilmu Pengetahuan Alam (IPA)',
      question: 'Perhatikan rantai makanan berikut: Padi -> Belalang -> Katak -> Ular -> Elang. Jika populasi katak mengalami kepunahan secara mendadak akibat perburuan liar, dampak yang paling mungkin terjadi pada ekosistem adalah...',
      options: [
        'Populasi belalang menurun dan populasi ular meningkat',
        'Populasi belalang meningkat dan populasi padi menurun drastis',
        'Populasi elang meningkat tajam',
        'Populasi padi dan ular sama-sama bertambah banyak'
      ],
      correctIndex: 1,
      explanation: 'Ketika predator katak punah, mangsanya (belalang) tidak terkontrol sehingga populasinya melonjak tajam. Lonjakan belalang memakan padi secara berlebihan sehingga populasi padi menurun drastis.'
    },
    {
      id: 5,
      subject: 'Bahasa Indonesia Literasi',
      question: 'Manakah di antara kalimat berikut yang merupakan kalimat efektif dan baku sesuai PUEBI?',
      options: [
        'Bagi para siswa-siswa yang akan mengikuti ujian diharapkan hadir tepat waktu.',
        'Kepada kepala sekolah waktu dan tempat kami persilakan.',
        'Siswa yang akan mengikuti tes seleksi wajib membawa kartu peserta resmi.',
        'Di dalam ruangan itu banyak terdapat bermacam-macam buku-buku referensi.'
      ],
      correctIndex: 2,
      explanation: 'Opsi C tidak mengandung pemborosan kata (pleonasme) dan memiliki subjek serta predikat yang jelas dan baku.'
    },
    {
      id: 6,
      subject: 'Bahasa Inggris',
      question: 'Complete the sentence: "Neither of the two candidates _____ selected for the student council president position last week."',
      options: ['were', 'was', 'are', 'is'],
      correctIndex: 1,
      explanation: '"Neither of + plural noun" memerlukan kata kerja tunggal (singular verb). Karena terjadi di masa lampau ("last week"), bentuk yang tepat adalah "was".'
    },
    {
      id: 7,
      subject: 'TPA Deret Angka',
      question: 'Tentukan dua angka selanjutnya dari barisan bilangan berikut: 3, 5, 9, 17, 33, ... , ...',
      options: ['65, 129', '64, 128', '66, 130', '55, 110'],
      correctIndex: 0,
      explanation: 'Pola selisih: +2, +4, +8, +16, (+32 -> 33 + 32 = 65), (+64 -> 65 + 64 = 129).'
    },
    {
      id: 8,
      subject: 'IPA Fisika Dasar',
      question: 'Benda bermassa 500 gram diletakkan pada permukaan bidang miring tanpa gesekan. Jika percepatan gravitasi bumi g = 10 m/s², berapakah berat (gaya berat) benda tersebut?',
      options: ['5 Newton', '50 Newton', '500 Newton', '0.5 Newton'],
      correctIndex: 0,
      explanation: 'Massa m = 500 gram = 0.5 kg. Berat W = m x g = 0.5 kg x 10 m/s² = 5 Newton.'
    }
  ];

  // Timer Effect for Quiz
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizActive && !isQuizSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsQuizSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizActive, isQuizSubmitted, timeLeft]);

  const handleStartQuiz = () => {
    setIsQuizActive(true);
    setIsQuizSubmitted(false);
    setUserAnswers({});
    setCurrentQIndex(0);
    setTimeLeft(600);
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (isQuizSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: optIndex
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    smpQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: smpQuestions.length,
      percentage: Math.round((correct / smpQuestions.length) * 100)
    };
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Title Group */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-800/40 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-700/60 text-amber-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Penerimaan Siswa Baru SMP Labschool 2026/2027</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('labschool_roadmap')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all hover:text-white"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Roadmap Belajar
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            INFORMASI PSB SMP <span className="text-amber-400">LABSCHOOL</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Panduan lengkap seleksi masuk SMP Labschool (Rawamangun, Kebayoran, Cibubur, Cirendeu). 
            Pelajari jalur masuk, kisi-kisi ujian HOTS, jadwal resmi, dan uji kemampuan dengan simulasi CBT interaktif.
          </p>

          {/* Menu Tab Navigasi - Satu Group Di Bawah Halaman Judul */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md">
              {[
                { id: 'info', label: 'Informasi & Jalur Masuk', icon: Info, count: null },
                { id: 'jadwal', label: 'Jadwal Penting', icon: Calendar, count: null },
                { id: 'kisi_kisi', label: 'Kisi-kisi & Format Ujian', icon: BookOpen, count: null },
                { id: 'simulasi', label: 'Simulasi Latihan Soal CBT', icon: FileCheck2, count: null },
                { id: 'data_siswa', label: 'Data Siswa (SMP-LABSCHOOL)', icon: Users, count: smpStudents.length }
              ].map(t => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    id={`menu-smp-tab-${t.id}`}
                    type="button"
                    onClick={() => {
                      setActiveTab(t.id as any);
                      if (t.id === 'simulasi' && !isQuizActive) {
                        handleStartQuiz();
                      }
                      if (t.id === 'data_siswa') {
                        setTimeout(() => {
                          const el = document.getElementById('section-data-siswa-smp');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950 font-black ring-1 ring-amber-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                    {t.count !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: INFORMASI & JALUR MASUK */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Jalur Tes Reguler */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Jalur Utama (75% Kuota)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">1. Jalur Tes Seleksi (CBT)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ujian seleksi berbasis komputer yang diselenggarakan serentak untuk seluruh calon peserta didik baru.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Materi: TPA, Matematika, IPA, B. Indo & B. Inggris</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sistem CBT dengan skor real-time</span>
                </div>
              </div>
            </div>

            {/* Jalur PSBP / Prestasi */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Jalur Prestasi (20% Kuota)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">2. Jalur PSBP (Prestasi)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Penelusuran Siswa Berprestasi berdasarkan nilai rapor konsisten dan sertifikat kejuaraan tingkat kota/provinsi/nasional.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nilai Rapor Kelas 4 - 5 SD rata-rata ≥ 85.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Piagam Olimpiade Sains, Robotik, Seni / Olahraga</span>
                </div>
              </div>
            </div>

            {/* Jalur Kerjasama UNJ */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <School className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Jalur Kerjasama (5% Kuota)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">3. Jalur Afiliasi & Kerjasama</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Penerimaan khusus untuk putra/putri keluarga besar sivitas akademika Universitas Negeri Jakarta (UNJ) & mitra strategis.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifikasi dokumen kepegawaian resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tetap mengikuti placement test standarisasi</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Kampus SMP Labschool Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Pilihan Kampus SMP Labschool & Daya Tampung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMP Labschool Jakarta</h4>
                <p className="text-xs text-slate-400">Rawamangun, Jakarta Timur</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Daya Tampung:</span>
                  <span className="font-bold text-amber-400">~240 Siswa</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMP Labschool Kebayoran</h4>
                <p className="text-xs text-slate-400">Kebayoran Baru, Jakarta Selatan</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Daya Tampung:</span>
                  <span className="font-bold text-blue-400">~240 Siswa</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMP Labschool Cibubur</h4>
                <p className="text-xs text-slate-400">Jatisampurna, Bekasi</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Daya Tampung:</span>
                  <span className="font-bold text-emerald-400">~200 Siswa</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMP Labschool Cirendeu</h4>
                <p className="text-xs text-slate-400">Ciputat Timur, Tangerang Selatan</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Daya Tampung:</span>
                  <span className="font-bold text-purple-400">~180 Siswa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KISI-KISI & FORMAT UJIAN */}
      {activeTab === 'kisi_kisi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mapel 1: TPA & Skolastik */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  30 Soal • 35 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 30%</span>
              </div>
              <h3 className="font-bold text-base text-white">1. Tes Potensi Akademik (TPA) & Logika</h3>
              <p className="text-xs text-slate-300">Menilai daya nalar, logika analitis, dan kemampuan pemecahan masalah spasial calon siswa.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Analogi Hubungan Kata, Sinonim, Antonim</li>
                <li>Deret Angka, Barisan Huruf & Pola Bilangan</li>
                <li>Penalaran Spasial & Rotasi Bentuk Gambar 2D/3D</li>
                <li>Silogisme & Penarikan Kesimpulan Logis</li>
              </ul>
            </div>

            {/* Mapel 2: Matematika Penalaran */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  25 Soal • 40 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 30%</span>
              </div>
              <h3 className="font-bold text-base text-white">2. Matematika Penalaran (HOTS)</h3>
              <p className="text-xs text-slate-300">Fokus pada aplikasi konsep hitung bilangan, geometri dan pemecahan soal cerita kontekstual.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Operasi Campuran Bilangan Bulat, Pecahan & Desimal</li>
                <li>KPK, FPB, Perbandingan Senilai & Berbalik Nilai</li>
                <li>Aritmatika Sosial (Diskon, Keuntungan, Bunga)</li>
                <li>Geometri Bangun Datar, Bangun Ruang & Statistika Data</li>
              </ul>
            </div>

            {/* Mapel 3: IPA Terpadu */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  25 Soal • 35 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 20%</span>
              </div>
              <h3 className="font-bold text-base text-white">3. Ilmu Pengetahuan Alam (IPA)</h3>
              <p className="text-xs text-slate-300">Konsep dasar sains fisik dan hayati tingkat sekolah dasar kelas 4, 5, dan 6.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Pengukuran, Gaya, Gerak, Energi & Perubahannya</li>
                <li>Suhu, Kalor, Cahaya, Bunyi, Listrik & Magnet</li>
                <li>Ciri Makhluk Hidup, Ekosistem, Rantai Makanan & Adaptasi</li>
                <li>Sistem Organ Manusia (Pencernaan, Pernapasan, Peredaran Darah)</li>
              </ul>
            </div>

            {/* Mapel 4: Bahasa Indonesia & Inggris */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  30 Soal • 35 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 20%</span>
              </div>
              <h3 className="font-bold text-base text-white">4. Bahasa Indonesia & Bahasa Inggris</h3>
              <p className="text-xs text-slate-300">Mengukur pemahaman literasi bacaan kritis dan tata bahasa dasar.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Menentukan Ide Pokok, Simpulan & Makna Tersirat Bacaan</li>
                <li>Kalimat Efektif, Ejaan PUEBI & Penggunaan Tanda Baca</li>
                <li>English: Reading Comprehension & Vocabulary in Context</li>
                <li>English: Basic Grammar (Tenses, Pronouns, Prepositions)</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SIMULASI LATIHAN SOAL CBT */}
      {activeTab === 'simulasi' && (
        <div className="space-y-6">
          {!isQuizActive ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg">
                <FileCheck2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">Simulasi Soal Seleksi Masuk SMP Labschool</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Uji kemampuan Anda dengan {smpQuestions.length} paket soal HOTS pilihan (TPA, Matematika, IPA, Bahasa Indonesia & Bahasa Inggris). 
                  Waktu pengerjaan 10 menit dengan scoring dan pembahasan otomatis.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 max-w-md mx-auto text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Jumlah Soal</span>
                  <strong className="text-white text-sm">{smpQuestions.length} Soal</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Durasi</span>
                  <strong className="text-amber-400 text-sm">10 Menit</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Passing Score</span>
                  <strong className="text-emerald-400 text-sm">75 / 100</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-amber-950/50 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Mulai Simulasi Sekarang
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
              
              {/* Quiz Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                    Soal {currentQIndex + 1} dari {smpQuestions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    • {smpQuestions[currentQIndex].subject}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                    timeLeft < 120 ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse' : 'bg-slate-950 text-amber-400 border-slate-800'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sisa Waktu: {formatTimer(timeLeft)}</span>
                  </div>

                  {!isQuizSubmitted && (
                    <button
                      type="button"
                      onClick={() => setIsQuizSubmitted(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-all"
                    >
                      Selesai & Kumpulkan
                    </button>
                  )}
                </div>
              </div>

              {/* Quiz Result Summary (If submitted) */}
              {isQuizSubmitted && (
                (() => {
                  const score = calculateScore();
                  return (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Simulasi Anda:</span>
                          <h4 className="text-2xl font-extrabold text-white">
                            Skor Akhir: <span className={score.percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}>{score.percentage} / 100</span>
                          </h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-300">
                            Benar: <strong className="text-emerald-400">{score.correct}</strong> • Salah: <strong className="text-rose-400">{score.total - score.correct}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={handleStartQuiz}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Ulangi
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">
                        {score.percentage >= 80
                          ? ' Luar biasa! Kemampuan Anda sangat siap untuk menembus seleksi SMP Labschool.'
                          : score.percentage >= 60
                          ? ' Bagus! Terus latih materi yang salah dengan melihat pembahasan di bawah.'
                          : ' Perbanyak latihan modul dan ikuti roadmap persiapan belajar Labschool.'}
                      </p>
                    </div>
                  );
                })()
              )}

              {/* Question Body */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  {smpQuestions[currentQIndex].question}
                </p>

                {/* Options List */}
                <div className="space-y-2.5">
                  {smpQuestions[currentQIndex].options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQIndex] === optIdx;
                    const isCorrect = optIdx === smpQuestions[currentQIndex].correctIndex;

                    let optStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';
                    if (isQuizSubmitted) {
                      if (isCorrect) {
                        optStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        optStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-amber-600/20 border-amber-500 text-amber-300 font-semibold shadow-md';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQIndex, optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer ${optStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isQuizSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isQuizSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Block (Shown when submitted) */}
                {isQuizSubmitted && (
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Pembahasan & Kunci Jawaban (Opsi {String.fromCharCode(65 + smpQuestions[currentQIndex].correctIndex)}):
                    </span>
                    <p className="text-slate-300 leading-relaxed pt-1">
                      {smpQuestions[currentQIndex].explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Pagination Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Soal Sebelumnya
                </button>

                {/* Question Number Pills */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {smpQuestions.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentQIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentQIndex === i
                          ? 'bg-amber-600 text-white shadow'
                          : userAnswers[i] !== undefined
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentQIndex === smpQuestions.length - 1}
                  onClick={() => setCurrentQIndex(prev => Math.min(smpQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Soal Selanjutnya →
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 2: JADWAL PENTING */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Jadwal Penting & Perkiraan Timeline PSB SMP Labschool 2026/2027
            </h3>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">1. Pendaftaran Online Jalur PSBP (Prestasi)</h4>
                  <p className="text-slate-400">Pengisian biodata & unggah berkas nilai rapor kelas 4 & 5 serta sertifikat</p>
                </div>
                <span className="font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-xl border border-blue-800 shrink-0">
                  Oktober - November 2026
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">2. Pendaftaran Online Jalur Tes (CBT)</h4>
                  <p className="text-slate-400">Pendaftaran akun, pemilihan kampus target & pembayaran biaya pendaftaran</p>
                </div>
                <span className="font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-xl border border-amber-800 shrink-0">
                  November - Desember 2026
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">3. Pelaksanaan Ujian CBT Masuk SMP</h4>
                  <p className="text-slate-400">Ujian serentak CBT daring / luring di kampus pilihan masing-masing</p>
                </div>
                <span className="font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-800 shrink-0">
                  Januari 2027 (Minggu ke-2)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">4. Pengumuman Kelulusan & Daftar Ulang</h4>
                  <p className="text-slate-400">Pengumuman hasil seleksi resmi melalui website BPS Labschool & konfirmasi berkas</p>
                </div>
                <span className="font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded-xl border border-purple-800 shrink-0">
                  Januari - Februari 2027
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB DATA SISWA KHUSUS KELAS SMP-LABSCHOOL */}
      {activeTab === 'data_siswa' && (
        <div id="section-data-siswa-smp" className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-amber-500/30 backdrop-blur-md shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    Kelas SMP-LABSCHOOL
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Terintegrasi Sistem
                  </span>
                  {isAdminOrTeacher && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-400" /> Mode Pengelola ({user.role === 'admin' ? 'Administrator' : 'Guru / Pendidik'})
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-amber-400" />
                  Daftar Siswa Persiapan PSB SMP Labschool
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Menampilkan seluruh data siswa aktif terdaftar pada kelas <strong className="text-amber-400">SMP-LABSCHOOL</strong> untuk bimbingan intensif seleksi masuk SMP Labschool (Rawamangun, Kebayoran, Cibubur, Cirendeu). Anda dapat mengelola siswa, mengubah status, mengedit data, serta mencetak roster resmi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isAdminOrTeacher && (
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                    title="Tambah Siswa Baru ke Kelas SMP-LABSCHOOL"
                  >
                    <UserPlus className="w-4 h-4" />
                    + Tambah Siswa
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  title="Cetak Dokumen Resmi Roster Siswa PSB SMP Labschool"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  Cetak Roster
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  title="Export Data Siswa ke format CSV / Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Siswa Terdaftar</p>
                <p className="text-xl font-black text-amber-400 mt-0.5">{smpStudents.length} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Status Aktif (Active)</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{smpStudents.filter(s => s.status === 'ACTIVE').length} <span className="text-xs font-normal text-slate-400">Terverifikasi</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Kelompok Belajar</p>
                <p className="text-xl font-black text-blue-400 mt-0.5">{new Set(smpStudents.map(s => s.group).filter(Boolean)).size || 4} <span className="text-xs font-normal text-slate-400">Kelompok</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Jenjang Target</p>
                <p className="text-xl font-black text-purple-400 mt-0.5">SMP 7 <span className="text-xs font-normal text-slate-400">Labschool</span></p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIS, kelompok, kampus..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Class Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="SMP-LABSCHOOL" className="bg-slate-900 text-white">Khusus Kelas: SMP-LABSCHOOL</option>
                  <option value="ALL" className="bg-slate-900 text-white">Semua Kelas Terdaftar</option>
                  {availableClassOptions.filter(c => c !== 'SMP-LABSCHOOL').map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">Kelas: {c}</option>
                  ))}
                </select>
              </div>

              {/* Campus Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterCampus}
                  onChange={(e) => setFilterCampus(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Semua Kampus Target</option>
                  <option value="Rawamangun" className="bg-slate-900 text-white">Labschool Rawamangun</option>
                  <option value="Kebayoran" className="bg-slate-900 text-white">Labschool Kebayoran</option>
                  <option value="Cibubur" className="bg-slate-900 text-white">Labschool Cibubur</option>
                  <option value="Cirendeu" className="bg-slate-900 text-white">Labschool Cirendeu</option>
                </select>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Semua Kelompok</option>
                  <option value="Alpha" className="bg-slate-900 text-white">Kelompok Alpha</option>
                  <option value="Beta" className="bg-slate-900 text-white">Kelompok Beta</option>
                  <option value="Gamma" className="bg-slate-900 text-white">Kelompok Gamma</option>
                  <option value="Delta" className="bg-slate-900 text-white">Kelompok Delta</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Semua Status</option>
                  <option value="ACTIVE" className="bg-slate-900 text-white">Status: ACTIVE</option>
                  <option value="PENDING" className="bg-slate-900 text-white">Status: PENDING</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Tabel"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Student Content View */}
          {filteredSmpStudents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">Tidak Ada Data Siswa Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery || filterCampus !== 'ALL' || filterGroup !== 'ALL' || filterClass !== 'SMP-LABSCHOOL'
                  ? 'Tidak ada siswa yang sesuai dengan kriteria pencarian atau filter yang Anda pilih.'
                  : 'Belum ada siswa yang terdaftar pada kelas SMP-LABSCHOOL.'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterClass('SMP-LABSCHOOL');
                    setFilterCampus('ALL');
                    setFilterGroup('ALL');
                    setFilterStatus('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Reset Filter & Pencarian
                </button>
                {isAdminOrTeacher && (
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Siswa Sekarang
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSmpStudents.map((student) => {
                const targetCampus = student.bio?.includes('Rawamangun')
                  ? 'Labschool Rawamangun'
                  : student.bio?.includes('Kebayoran')
                  ? 'Labschool Kebayoran'
                  : student.bio?.includes('Cibubur')
                  ? 'Labschool Cibubur'
                  : student.bio?.includes('Cirendeu')
                  ? 'Labschool Cirendeu'
                  : 'SMP Labschool';

                return (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-amber-500/5"
                  >
                    <div>
                      {/* Top Row: Class Badge & Status with toggle */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 truncate max-w-[130px]">
                          {student.className || 'SMP-LABSCHOOL'}
                        </span>
                        {isAdminOrTeacher ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer hover:opacity-80 flex items-center gap-1 ${
                              student.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                            }`}
                            title="Klik untuk ubah status ACTIVE / PENDING"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                            {student.status}
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            student.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {student.status}
                          </span>
                        )}
                      </div>

                      {/* Avatar & Student Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=f59e0b&color=0f172a`}
                            alt={student.name}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {student.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            NIS: {student.nis}
                          </p>
                        </div>
                      </div>

                      {/* Kelompok Belajar & Target */}
                      <div className="space-y-1.5 py-2.5 border-t border-b border-slate-800/80 my-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Kelompok:</span>
                          <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[130px]">{student.group || 'Belum diatur'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Target Kampus:</span>
                          <span className="font-bold text-amber-400 text-[11px]">{targetCampus}</span>
                        </div>
                      </div>

                      {/* Bio / Catatan Khusus */}
                      {student.bio && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 italic mb-3">
                          "{student.bio}"
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center gap-1.5 mt-auto border-t border-slate-800/50">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Lihat Detail Profil Siswa"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        Detail
                      </button>

                      {isAdminOrTeacher && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 transition-all cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStudentToDelete(student);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 transition-all cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {student.whatsapp && (
                        <a
                          href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 transition-all"
                          title={`Chat WhatsApp: ${student.whatsapp}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {student.email && (
                        <a
                          href={`mailto:${student.email}`}
                          className="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-slate-950 border border-blue-500/30 transition-all"
                          title={`Kirim Email: ${student.email}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5 text-center">No</th>
                      <th className="px-4 py-3.5">Siswa</th>
                      <th className="px-4 py-3.5">NIS</th>
                      <th className="px-4 py-3.5">Kelas & Kelompok</th>
                      <th className="px-4 py-3.5">Target Kampus</th>
                      <th className="px-4 py-3.5">Kontak</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSmpStudents.map((student, idx) => {
                      const targetCampus = student.bio?.includes('Rawamangun')
                        ? 'Labschool Rawamangun'
                        : student.bio?.includes('Kebayoran')
                        ? 'Labschool Kebayoran'
                        : student.bio?.includes('Cibubur')
                        ? 'Labschool Cibubur'
                        : student.bio?.includes('Cirendeu')
                        ? 'Labschool Cirendeu'
                        : 'SMP Labschool';

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=f59e0b&color=0f172a`}
                                alt={student.name}
                                className="w-8 h-8 rounded-lg object-cover border border-amber-500/20"
                              />
                              <div>
                                <p className="font-bold text-white hover:text-amber-300 transition-colors">
                                  {student.name}
                                </p>
                                <p className="text-[10px] text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300 font-medium">
                            {student.nis}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mr-1.5">
                              {student.className}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {student.group || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-400">
                            {targetCampus}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {student.whatsapp && (
                                <a
                                  href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono text-[11px]"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {student.whatsapp}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isAdminOrTeacher ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer hover:opacity-80 ${
                                  student.status === 'ACTIVE'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                                }`}
                                title="Klik untuk ubah status ACTIVE / PENDING"
                              >
                                {student.status}
                              </button>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                student.status === 'ACTIVE'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {student.status}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                              >
                                Detail
                              </button>

                              {isAdminOrTeacher && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditModal(student)}
                                    className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 transition-all cursor-pointer"
                                    title="Edit Siswa"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setStudentToDelete(student);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 transition-all cursor-pointer"
                                    title="Hapus Siswa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DETAIL SISWA SMP-LABSCHOOL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-800">
              <img
                src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=f59e0b&color=0f172a`}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase">
                    {selectedStudent.className}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedStudent.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-400 font-mono">NIS: {selectedStudent.nis}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">Kelompok Belajar & Pembinaan</span>
                <p className="font-bold text-amber-300 text-sm">{selectedStudent.group || 'Kelompok Belajar Belum Ditentukan'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">Email Siswa</span>
                  <p className="font-medium text-white truncate">{selectedStudent.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">WhatsApp / Kontak</span>
                  <p className="font-medium text-emerald-400">{selectedStudent.whatsapp || selectedStudent.phone || '-'}</p>
                </div>
              </div>

              {selectedStudent.bio && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">Target PSB & Catatan Akademik</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedStudent.bio}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-4 border-t border-slate-800">
              {isAdminOrTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Data Siswa
                </button>
              )}

              {selectedStudent.whatsapp && (
                <a
                  href={`https://wa.me/${selectedStudent.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}

              <button
                onClick={() => setSelectedStudent(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH SISWA BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Siswa Baru</h3>
                <p className="text-xs text-slate-400">Pendaftaran kelas persiapan PSB SMP Labschool 2026</p>
              </div>
            </div>

            <form onSubmit={handleSaveNewStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Muhammad Farhan"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor Induk Siswa (NIS) *</label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="Contoh: 20268801"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Siswa *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="farhan@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp / No. HP</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelas Terdaftar</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {availableClassOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelompok Belajar</label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Kelompok Alpha (SMP-Labs)">Kelompok Alpha (SMP-Labs)</option>
                    <option value="Kelompok Beta (SMP-Labs)">Kelompok Beta (SMP-Labs)</option>
                    <option value="Kelompok Gamma (SMP-Labs)">Kelompok Gamma (SMP-Labs)</option>
                    <option value="Kelompok Delta (SMP-Labs)">Kelompok Delta (SMP-Labs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Kampus SMP Labschool</label>
                  <select
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="SMP Labschool Rawamangun">SMP Labschool Rawamangun</option>
                    <option value="SMP Labschool Kebayoran">SMP Labschool Kebayoran</option>
                    <option value="SMP Labschool Cibubur">SMP Labschool Cibubur</option>
                    <option value="SMP Labschool Cirendeu">SMP Labschool Cirendeu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Pendaftaran</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AccountStatus)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Disetujui & Aktif)</option>
                    <option value="PENDING">PENDING (Menunggu Verifikasi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password Default Siswa</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="user123"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Portofolio / Asal SD / Target CBT</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Target nilai rata-rata CBT 85+, Asal SD Negeri 01..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DATA SISWA */}
      {isEditModalOpen && studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setStudentToEdit(null);
              }}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Data Siswa: {studentToEdit.name}</h3>
                <p className="text-xs text-slate-400">Perbarui profil, kelas, kelompok bimbingan, dan kontak siswa</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor Induk Siswa (NIS) *</label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Siswa *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp / No. HP</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelas Terdaftar</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {availableClassOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelompok Belajar</label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Kelompok Alpha (SMP-Labs)">Kelompok Alpha (SMP-Labs)</option>
                    <option value="Kelompok Beta (SMP-Labs)">Kelompok Beta (SMP-Labs)</option>
                    <option value="Kelompok Gamma (SMP-Labs)">Kelompok Gamma (SMP-Labs)</option>
                    <option value="Kelompok Delta (SMP-Labs)">Kelompok Delta (SMP-Labs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Kampus SMP Labschool</label>
                  <select
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="SMP Labschool Rawamangun">SMP Labschool Rawamangun</option>
                    <option value="SMP Labschool Kebayoran">SMP Labschool Kebayoran</option>
                    <option value="SMP Labschool Cibubur">SMP Labschool Cibubur</option>
                    <option value="SMP Labschool Cirendeu">SMP Labschool Cirendeu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AccountStatus)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Disetujui & Aktif)</option>
                    <option value="PENDING">PENDING (Menunggu Verifikasi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password Siswa</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Portofolio / Asal SD / Target CBT</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setStudentToEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: HAPUS SISWA */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Siswa</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 my-4 text-xs space-y-1.5">
              <p className="text-slate-300">Apakah Anda yakin ingin menghapus data siswa:</p>
              <p className="font-bold text-white text-sm">{studentToDelete.name}</p>
              <p className="text-slate-400 font-mono">NIS: {studentToDelete.nis} | Kelas: {studentToDelete.className}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CETAK ROSTER RESMI */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-200 my-8">
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print Header */}
            <div className="text-center pb-5 mb-5 border-b-2 border-slate-800 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-1">
                <School className="w-4 h-4" /> BPS LABSCHOOL UNJ - PROGRAM PERSIAPAN PSB 2026/2027
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                DAFTAR RESMI SISWA BIMBINGAN PERSIAPAN PSB SMP LABSCHOOL
              </h2>
              <p className="text-xs text-slate-400">
                Pusat Pembinaan PSB Kelas SMP-LABSCHOOL • Kampus Rawamangun, Kebayoran, Cibubur & Cirendeu
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 pt-2 font-mono">
                <span>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                <span>•</span>
                <span>Total Siswa: {filteredSmpStudents.length} Siswa</span>
                <span>•</span>
                <span>Pengawas / Administrator: {user.name} ({user.role.toUpperCase()})</span>
              </div>
            </div>

            {/* Print Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-center">No</th>
                    <th className="p-3">NIS</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas & Kelompok</th>
                    <th className="p-3">Target Kampus</th>
                    <th className="p-3">WhatsApp / Telp</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSmpStudents.map((st, i) => (
                    <tr key={st.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-center font-mono text-slate-400">{i + 1}</td>
                      <td className="p-3 font-mono font-bold text-amber-300">{st.nis}</td>
                      <td className="p-3 font-bold text-white">{st.name}</td>
                      <td className="p-3">
                        <span className="text-amber-400 font-semibold">{st.className}</span> • <span className="text-slate-300">{st.group || '-'}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        {st.bio?.includes('Rawamangun') ? 'Rawamangun' : st.bio?.includes('Kebayoran') ? 'Kebayoran' : st.bio?.includes('Cibubur') ? 'Cibubur' : st.bio?.includes('Cirendeu') ? 'Cirendeu' : 'SMP Labschool'}
                      </td>
                      <td className="p-3 font-mono text-emerald-400">{st.whatsapp || st.phone || '-'}</td>
                      <td className="p-3 font-bold text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full ${st.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Signature Box */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-800 text-xs">
              <div className="text-center space-y-12">
                <p className="text-slate-400">Koordinator Bimbingan PSB SMP Labschool,</p>
                <p className="font-bold text-white border-t border-slate-700 pt-1 w-48 mx-auto">( ............................................ )</p>
              </div>
              <div className="text-center space-y-12">
                <p className="text-slate-400">Kepala Bagian Akademik & Penjaminan Mutu,</p>
                <p className="font-bold text-white border-t border-slate-700 pt-1 w-48 mx-auto">( ............................................ )</p>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Dokumen Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

