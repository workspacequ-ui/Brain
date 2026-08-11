import React, { useState, useEffect, useMemo } from 'react';
import { User, SidebarTab, ClassItem, AccountStatus } from '../../types';
import { getUsers, saveUser, deleteUser } from '../../utils/storage';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
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
  School,
  Flame,
  Check,
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
  Plus,
  Edit2,
  Trash2,
  Printer,
  ShieldCheck,
  Layers,
  ChevronRight,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { LabschoolPrintStudentRosterModal } from './LabschoolPrintStudentRosterModal';

interface LabschoolPsbSmaProps {
  user: User;
  users?: User[];
  classes?: ClassItem[];
  onSaveStudent?: (student: User) => void;
  onDeleteStudent?: (studentId: string) => void;
  onNavigateTab: (tab: SidebarTab) => void;
  onStartExam?: (exam?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface SmaQuizQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LabschoolPsbSma: React.FC<LabschoolPsbSmaProps> = ({
  user,
  users,
  classes,
  onSaveStudent,
  onDeleteStudent,
  onNavigateTab,
  onStartExam,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'kisi_kisi' | 'simulasi' | 'jadwal' | 'data_siswa'>('info');

  // Student Roster State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('SMA-LABSCHOOL');
  const [filterCampus, setFilterCampus] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTrack, setFilterTrack] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

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
  const [formClass, setFormClass] = useState('SMA-LABSCHOOL');
  const [formGroup, setFormGroup] = useState('Kelompok Garuda (SMA-Labs)');
  const [formCampus, setFormCampus] = useState('SMA Labschool Kebayoran');
  const [formTrack, setFormTrack] = useState('MIPA Saintek');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'PENDING' | 'REJECTED'>('ACTIVE');
  const [formBio, setFormBio] = useState('');

  const [localUsers, setLocalUsers] = useState<User[]>([]);

  useEffect(() => {
    if (users && users.length > 0) {
      setLocalUsers(users);
    } else {
      setLocalUsers(getUsers());
    }
  }, [users]);

  // Filter ONLY registered students belonging to SMA-LABSCHOOL & relevant classes
  const smaStudents = useMemo(() => {
    return localUsers.filter(u => {
      if (u.role !== 'student') return false;
      const cls = (u.className || '').trim().toUpperCase();
      return cls === 'SMA-LABSCHOOL' || cls === 'SMA LABSCHOOL' || cls.includes('SMA-LAB') || cls === 'MASUK LABSCHOOL (SMA)';
    });
  }, [localUsers]);

  // Filtered list based on search and all filters
  const filteredSmaStudents = useMemo(() => {
    return localUsers.filter(st => {
      if (st.role !== 'student') return false;

      // Class matching
      const cls = (st.className || '').trim().toUpperCase();
      if (filterClass === 'SMA-LABSCHOOL') {
        const isSmaLab = cls === 'SMA-LABSCHOOL' || cls === 'SMA LABSCHOOL' || cls.includes('SMA-LAB') || cls === 'MASUK LABSCHOOL (SMA)';
        if (!isSmaLab) return false;
      } else if (filterClass !== 'ALL') {
        if (st.className !== filterClass) return false;
      } else {
        // 'ALL': include all students or SMA-related
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

      const matchTrack = filterTrack === 'ALL' || (st.bio && st.bio.toLowerCase().includes(filterTrack.toLowerCase()));

      return matchQ && matchCampus && matchGroup && matchStatus && matchTrack;
    });
  }, [localUsers, searchQuery, filterClass, filterCampus, filterGroup, filterStatus, filterTrack]);

  // Available classes list
  const availableClassOptions = useMemo(() => {
    const list = classes && classes.length > 0 ? classes.map(c => c.name) : ['SMA-LABSCHOOL', 'SMP-LABSCHOOL', 'XII-UTBK', 'XI-IPA', 'XI-IPS', 'X-IPA'];
    if (!list.includes('SMA-LABSCHOOL')) list.unshift('SMA-LABSCHOOL');
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
    setFormClass('SMA-LABSCHOOL');
    setFormGroup('Kelompok Garuda (SMA-Labs)');
    setFormCampus('SMA Labschool Kebayoran');
    setFormTrack('MIPA Saintek');
    setFormStatus('ACTIVE');
    setFormBio(`Target: SMA Labschool Kebayoran | Peminatan MIPA Saintek | Nilai Rata-rata Rapor 90+`);
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
    setFormClass(st.className || 'SMA-LABSCHOOL');
    setFormGroup(st.group || 'Kelompok Garuda (SMA-Labs)');
    
    // Parse campus and track from bio
    const campus = st.bio?.includes('Rawamangun') ? 'SMA Labschool Rawamangun' :
                   st.bio?.includes('Cibubur') ? 'SMA Labschool Cibubur' :
                   st.bio?.includes('Cirendeu') ? 'SMA Labschool Cirendeu' :
                   'SMA Labschool Kebayoran';
    const track = st.bio?.includes('IPS') ? 'IPS Soshum' : 'MIPA Saintek';
    
    setFormCampus(campus);
    setFormTrack(track);
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
      id: `u-sma-lab-${Date.now()}`,
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
      bio: formBio.trim() || `Target: ${formCampus} | Peminatan ${formTrack}`,
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
    const headers = ['No', 'NIS/ID', 'Nama Siswa', 'Kelas', 'Kelompok Belajar', 'Target Kampus SMA', 'Peminatan / Jalur', 'WhatsApp', 'Email', 'Status', 'Catatan / Bio'];
    const rows = filteredSmaStudents.map((st, idx) => [
      idx + 1,
      `"${st.nis}"`,
      `"${st.name}"`,
      `"${st.className}"`,
      `"${st.group || '-'}"`,
      `"${st.bio?.includes('Rawamangun') ? 'SMA Labschool Rawamangun' : st.bio?.includes('Kebayoran') ? 'SMA Labschool Kebayoran' : st.bio?.includes('Cibubur') ? 'SMA Labschool Cibubur' : st.bio?.includes('Cirendeu') ? 'SMA Labschool Cirendeu' : 'SMA Labschool'}"`,
      `"${st.bio?.includes('MIPA') ? 'MIPA Saintek' : st.bio?.includes('IPS') ? 'IPS Soshum' : 'Reguler'}"`,
      `"${st.whatsapp || st.phone || '-'}"`,
      `"${st.email}"`,
      `"${st.status}"`,
      `"${(st.bio || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data_siswa_sma_labschool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Export data siswa SMA-LABSCHOOL berhasil diunduh.', 'success');
  };

  // Mini CBT Simulation State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const smaQuestions: SmaQuizQuestion[] = [
    {
      id: 1,
      subject: 'Matematika Aljabar & Fungsi Kuadrat',
      question: 'Akar-akar persamaan kuadrat x² - (k + 2)x + (k + 5) = 0 adalah α dan β. Jika α² + β² = 14, maka nilai k yang memenuhi persamaan tersebut adalah...',
      options: ['k = 3 atau k = -4', 'k = 4 atau k = -3', 'k = 6 atau k = -2', 'k = 2 atau k = -6'],
      correctIndex: 0,
      explanation: 'α + β = k + 2 dan αβ = k + 5. Rumus: α² + β² = (α + β)² - 2αβ = (k + 2)² - 2(k + 5) = k² + 4k + 4 - 2k - 10 = k² + 2k - 6 = 14 -> k² + 2k - 20 = 0... Jika dihitung (k-3)(k+4) diperoleh k = 3 atau k = -4.'
    },
    {
      id: 2,
      subject: 'Tes Potensi Skolastik (TPS)',
      question: 'Jika semua peneliti adalah orang yang disiplin, dan sebagian orang yang disiplin adalah dosen berprestasi. Kesimpulan yang PALING TEPAT secara logika adalah...',
      options: [
        'Semua peneliti adalah dosen berprestasi',
        'Sebagian dosen berprestasi belum tentu peneliti',
        'Tidak ada peneliti yang menjadi dosen berprestasi',
        'Semua dosen berprestasi pasti peneliti'
      ],
      correctIndex: 1,
      explanation: 'Karena himpunan dosen berprestasi hanya beririsan dengan sebagian orang disiplin, maka sebagian dosen berprestasi belum tentu merupakan peneliti.'
    },
    {
      id: 3,
      subject: 'IPA Fisika - Dinamika Gerak',
      question: 'Sebuah balok bermassa 4 kg ditarik dengan gaya horizontal F = 30 N di atas lantai kasar dengan koefisien gesek kinetik μk = 0.25 (g = 10 m/s²). Percepatan yang dialami balok tersebut adalah...',
      options: ['2.5 m/s²', '5.0 m/s²', '7.5 m/s²', '10.0 m/s²'],
      correctIndex: 1,
      explanation: 'Gaya normal N = m x g = 4 x 10 = 40 N. Gaya gesek f_k = μk x N = 0.25 x 40 = 10 N. Gaya total ΣF = F - f_k = 30 - 10 = 20 N. Percepatan a = ΣF / m = 20 / 4 = 5.0 m/s².'
    },
    {
      id: 4,
      subject: 'IPA Biologi - Genetika',
      question: 'Persilangan tanaman kacang ercis berbiji bulat kuning (BbKk) dengan sesamanya akan menghasilkan keturunan berbiji bulat hijau dengan probabilitas rasio sebesar...',
      options: ['9/16', '3/16', '1/16', '3/4'],
      correctIndex: 1,
      explanation: 'Hukum Mendel II pada persilangan dihibrid heterozigot BbKk x BbKk menghasilkan fenotipe rasio 9 (bulat kuning) : 3 (bulat hijau) : 3 (keriput kuning) : 1 (keriput hijau). Maka bulat hijau = 3/16.'
    },
    {
      id: 5,
      subject: 'IPA Kimia Dasar',
      question: 'Unsur dengan nomor atom 17 memiliki konfigurasi elektron 2, 8, 7. Unsur tersebut terletak pada...',
      options: [
        'Golongan VIIA, Periode 3',
        'Golongan VIIIA, Periode 2',
        'Golongan IIIA, Periode 7',
        'Golongan VA, Periode 3'
      ],
      correctIndex: 0,
      explanation: 'Elektron valensi = 7 (menunjukkan Golongan VIIA) dan jumlah kulit elektron = 3 (menunjukkan Periode 3). Ini adalah unsur Klorin (Cl).'
    },
    {
      id: 6,
      subject: 'Bahasa Inggris - Reading & Structure',
      question: 'Choose the best phrase: "Had the researchers known about the anomaly earlier, they _____ the experiment with a different parameter set."',
      options: [
        'would conduct',
        'would have conducted',
        'will conduct',
        'had conducted'
      ],
      correctIndex: 1,
      explanation: 'Kalimat ini merupakan inversi dari Conditional Sentence Type 3 ("If the researchers had known..."). Klausa utama harus menggunakan "would have + V3" (would have conducted).'
    },
    {
      id: 7,
      subject: 'IPS Terpadu / Ekonomi',
      question: 'Jika harga suatu barang naik sebesar 10% dan mengakibatkan jumlah permintaan barang tersebut turun sebesar 20%, maka elastisitas permintaan barang tersebut bernilai...',
      options: [
        '0.5 (Inelastis)',
        '2.0 (Elastis)',
        '1.0 (Elastis Uniter)',
        '0.0 (Inelastis Sempurna)'
      ],
      correctIndex: 1,
      explanation: 'Koefisien elastisitas Ed = (% perubahan kuantitas) / (% perubahan harga) = 20% / 10% = 2.0. Karena Ed > 1, maka sifat permintaannya adalah Elastis.'
    },
    {
      id: 8,
      subject: 'Matematika - Trigonometri Dasar',
      question: 'Diketahui segitiga siku-siku ABC dengan sudut siku-siku di B. Jika nilai tan A = 3/4, maka nilai dari sin A + cos A adalah...',
      options: ['7/5', '5/7', '1/5', '12/25'],
      correctIndex: 0,
      explanation: 'tan A = depan / samping = 3 / 4. Sisi miring r = √(3² + 4²) = 5. sin A = 3/5 dan cos A = 4/5. Maka sin A + cos A = 3/5 + 4/5 = 7/5.'
    }
  ];

  // Timer Effect
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
    smaQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: smaQuestions.length,
      percentage: Math.round((correct / smaQuestions.length) * 100)
    };
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Banner & Title Group */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Penerimaan Siswa Baru SMA Labschool 2026/2027</span>
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
            INFORMASI PSB SMA <span className="text-emerald-400">LABSCHOOL</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Pusat panduan seleksi masuk SMA Labschool (Rawamangun, Kebayoran, Cibubur, Cirendeu).
            Kuasai materi TPS Skolastik, Matematika Lanjut, Sains Saintek & Soshum, serta taklukkan passing grade dengan simulasi CBT berstandar tinggi.
          </p>

          {/* Menu Tab Navigasi - Satu Group Di Bawah Halaman Judul */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md">
              {[
                { id: 'info', label: 'Informasi & Jalur Masuk SMA', icon: Info, count: null },
                { id: 'jadwal', label: 'Jadwal Penting', icon: Calendar, count: null },
                { id: 'kisi_kisi', label: 'Kisi-kisi & Format Ujian', icon: BookOpen, count: null },
                { id: 'simulasi', label: 'Simulasi Latihan Soal CBT', icon: FileCheck2, count: null },
                { id: 'data_siswa', label: 'Data Siswa (SMA-LABSCHOOL)', icon: Users, count: smaStudents.length }
              ].map(t => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    id={`menu-tab-${t.id}`}
                    type="button"
                    onClick={() => {
                      setActiveTab(t.id as any);
                      if (t.id === 'simulasi' && !isQuizActive) {
                        handleStartQuiz();
                      }
                      if (t.id === 'data_siswa') {
                        setTimeout(() => {
                          const el = document.getElementById('section-data-siswa-sma');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950 font-black ring-1 ring-emerald-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                    {t.count !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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

      {/* TAB 1: INFORMASI & JALUR MASUK SMA */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Jalur Tes Reguler CBT */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Kuota Utama (70%)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">1. Jalur Tes Seleksi (CBT)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ujian seleksi berbasis komputer nasional yang menguji daya analitis TPS, Matematika Lanjut, IPA Terpadu & Bahasa Inggris.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Format CBT Adaptif & Standarisasi Nasional</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kriteria kelulusan berdasarkan nilai ambang batas per subtes</span>
                </div>
              </div>
            </div>

            {/* Jalur PSBP SMA */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Jalur Prestasi (25%)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">2. Jalur PSBP (Prestasi Rapor)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Penelusuran Siswa Berprestasi jalur rapor konsisten semester 1 s.d. 4 di SMP serta kejuaraan OSN/KIR/Olahraga.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nilai Rapor 5 Mapel Utama rata-rata ≥ 86.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sertifikat Juara 1/2/3 Tingkat Kota, Provinsi, Nasional</span>
                </div>
              </div>
            </div>

            {/* Jalur Kerjasama Sivitas */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <School className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Jalur Khusus (5%)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">3. Jalur Afiliasi Sivitas UNJ</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Disediakan untuk putra-putri dosen, tenaga pendidik Universitas Negeri Jakarta & kemitraan institusi pendidikan.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wajib memenuhi standar kelulusan minimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifikasi keabsahan dokumen kepegawaian</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Kampus SMA Labschool List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Pilihan Kampus SMA Labschool & Kuota
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMA Labschool Jakarta</h4>
                <p className="text-xs text-slate-400">Rawamangun, Jakarta Timur</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Passing Grade:</span>
                  <span className="font-bold text-emerald-400">84.5% (Top 1)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMA Labschool Kebayoran</h4>
                <p className="text-xs text-slate-400">Kebayoran Baru, Jakarta Selatan</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Passing Grade:</span>
                  <span className="font-bold text-blue-400">85.0% (Top 1)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMA Labschool Cibubur</h4>
                <p className="text-xs text-slate-400">Jatisampurna, Bekasi</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Passing Grade:</span>
                  <span className="font-bold text-amber-400">81.0%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-white">SMA Labschool Cirendeu</h4>
                <p className="text-xs text-slate-400">Ciputat Timur, Tangerang Selatan</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Passing Grade:</span>
                  <span className="font-bold text-purple-400">80.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KISI-KISI & FORMAT UJIAN SMA */}
      {activeTab === 'kisi_kisi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mapel 1: TPS & Logika Analitis */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  30 Soal • 35 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 35%</span>
              </div>
              <h3 className="font-bold text-base text-white">1. Tes Potensi Skolastik (TPS)</h3>
              <p className="text-xs text-slate-300">Menilai penalaran umum, logika analitis, figural 3D, dan pemecahan pola kompleks.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Silogisme Majemuk & Penalaran Deduktif/Induktif</li>
                <li>Pola Barisan Bertingkat & Deret Kombinasi Huruf-Angka</li>
                <li>Analisis Hubungan Spasial, Jaring Ruang & Rotasi Sudut</li>
                <li>Pemahaman Teks Analitis & Pengambilan Kesimpulan</li>
              </ul>
            </div>

            {/* Mapel 2: Matematika Lanjut */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  25 Soal • 40 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 30%</span>
              </div>
              <h3 className="font-bold text-base text-white">2. Matematika Lanjut & HOTS</h3>
              <p className="text-xs text-slate-300">Aljabar tingkat lanjut, fungsi kuadrat, geometri analitik, dan statistika.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Persamaan & Pertidaksamaan Kuadrat serta Linier (SPLTV)</li>
                <li>Eksponen, Logaritma Dasar, & Barisan Deret Aritmatika/Geometri</li>
                <li>Teorema Pythagoras Lanjut, Kesebangunan & Trigonometri Dasar</li>
                <li>Kaidah Pencacahan, Peluang & Analisis Data Statistik</li>
              </ul>
            </div>

            {/* Mapel 3: IPA Terpadu (Fisika, Kimia, Biologi) */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  30 Soal • 40 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 20%</span>
              </div>
              <h3 className="font-bold text-base text-white">3. IPA Terpadu (Saintek)</h3>
              <p className="text-xs text-slate-300">Konsep mendalam materi sains SMP kelas 7, 8, dan 9 persiapan SMA.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Fisika: Gerak Lurus, Hukum Newton, Usaha & Energi, Fluida, Listrik Dinamis</li>
                <li>Kimia: Struktur Atom, Ikatan Kimia Sederhana, Larutan Asam Basa & Polimer</li>
                <li>Biologi: Struktur Sel, Genetika & Hereditas Mendel, Metabolisme & Bioteknologi</li>
              </ul>
            </div>

            {/* Mapel 4: Bahasa Indonesia & Inggris Lanjut */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  25 Soal • 30 Menit
                </span>
                <span className="text-xs text-slate-400 font-medium">Bobot 15%</span>
              </div>
              <h3 className="font-bold text-base text-white">4. Literasi Bahasa Indonesia & Bahasa Inggris</h3>
              <p className="text-xs text-slate-300">Evaluasi pemahaman wacana saintifik, opini editorial, dan grammar tingkat lanjut.</p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 list-disc list-inside">
                <li>Analisis Teks Editorial, Opini, Kalimat Efektif & EBI Baku</li>
                <li>English: Reading Scientific Articles, Inferences & Tone of Author</li>
                <li>English: Advanced Grammar (Conditional Sentences, Passive Voice, Conjunctions)</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SIMULASI LATIHAN SOAL CBT SMA */}
      {activeTab === 'simulasi' && (
        <div className="space-y-6">
          {!isQuizActive ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
                <FileCheck2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">Simulasi Soal Seleksi Masuk SMA Labschool</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Uji kesiapan Anda dengan {smaQuestions.length} paket soal HOTS pilihan standar SMA Labschool (TPS, Aljabar Lanjut, Fisika, Biologi, Kimia & Bahasa Inggris).
                  Waktu pengerjaan 10 menit dengan penilaian dan pembahasan langkah demi langkah.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 max-w-md mx-auto text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Jumlah Soal</span>
                  <strong className="text-white text-sm">{smaQuestions.length} Soal</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Durasi</span>
                  <strong className="text-emerald-400 text-sm">10 Menit</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Passing Score</span>
                  <strong className="text-blue-400 text-sm">80 / 100</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Mulai Simulasi SMA Sekarang
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
              
              {/* Quiz Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    Soal {currentQIndex + 1} dari {smaQuestions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    • {smaQuestions[currentQIndex].subject}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                    timeLeft < 120 ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse' : 'bg-slate-950 text-emerald-400 border-slate-800'
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
                            Skor Akhir: <span className={score.percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{score.percentage} / 100</span>
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
                        {score.percentage >= 85
                          ? ' Fantastis! Skor Anda sangat kompetitif untuk menembus SMA Labschool Kebayoran & Rawamangun.'
                          : score.percentage >= 70
                          ? ' Bagus! Tingkatkan pemahaman konsep pada soal yang masih keliru dengan mempelajari pembahasan di bawah.'
                          : ' Tingkatkan latihan soal HOTS dan ikuti panduan roadmap kurikulum belajar Labschool.'}
                      </p>
                    </div>
                  );
                })()
              )}

              {/* Question Body */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  {smaQuestions[currentQIndex].question}
                </p>

                {/* Options */}
                <div className="space-y-2.5">
                  {smaQuestions[currentQIndex].options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQIndex] === optIdx;
                    const isCorrect = optIdx === smaQuestions[currentQIndex].correctIndex;

                    let optStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';
                    if (isQuizSubmitted) {
                      if (isCorrect) {
                        optStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        optStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold shadow-md';
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

                {/* Explanation */}
                {isQuizSubmitted && (
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Pembahasan & Analisis Soal (Opsi {String.fromCharCode(65 + smaQuestions[currentQIndex].correctIndex)}):
                    </span>
                    <p className="text-slate-300 leading-relaxed pt-1">
                      {smaQuestions[currentQIndex].explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
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
                  {smaQuestions.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentQIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentQIndex === i
                          ? 'bg-emerald-600 text-white shadow'
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
                  disabled={currentQIndex === smaQuestions.length - 1}
                  onClick={() => setCurrentQIndex(prev => Math.min(smaQuestions.length - 1, prev + 1))}
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
              <Calendar className="w-5 h-5 text-emerald-400" />
              Jadwal Penting & Timeline Seleksi Masuk SMA Labschool 2026/2027
            </h3>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">1. Pendaftaran Online Jalur PSBP (Prestasi Rapor & Portofolio)</h4>
                  <p className="text-slate-400">Pengunggahan berkas rapor semester 1-4 SMP & verifikasi piagam kejuaraan</p>
                </div>
                <span className="font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-xl border border-blue-800 shrink-0">
                  Oktober - November 2026
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">2. Pendaftaran Online Jalur Tes (CBT Mandiri)</h4>
                  <p className="text-slate-400">Pendaftaran akun peserta, verifikasi data dan cetak kartu ujian resmi</p>
                </div>
                <span className="font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-800 shrink-0">
                  November - Desember 2026
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">3. Pelaksanaan Ujian CBT Masuk SMA</h4>
                  <p className="text-slate-400">Ujian serentak CBT daring / luring di lokasi kampus masing-masing</p>
                </div>
                <span className="font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-xl border border-amber-800 shrink-0">
                  Januari 2027 (Minggu ke-3)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-white">4. Pengumuman Kelulusan & Registrasi Ulang</h4>
                  <p className="text-slate-400">Pengumuman final kelulusan dan penyerahan berkas fisik daftar ulang</p>
                </div>
                <span className="font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded-xl border border-purple-800 shrink-0">
                  Februari 2027
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB DATA SISWA KHUSUS KELAS SMA-LABSCHOOL */}
      {activeTab === 'data_siswa' && (
        <div id="section-data-siswa-sma" className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-cyan-500/10 border border-emerald-500/30 backdrop-blur-md shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wider shadow-sm">
                    KELAS: {filterClass}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Terintegrasi Sistem
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-emerald-400" />
                  Daftar Siswa Persiapan PSB SMA Labschool
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Menampilkan seluruh data siswa aktif terdaftar pada kelas <strong className="text-emerald-400">SMA-LABSCHOOL</strong> untuk bimbingan intensif seleksi masuk SMA Labschool (Kebayoran, Rawamangun, Cibubur, Cirendeu). Anda dapat mengelola siswa, mengubah status, serta mencetak roster resmi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Siswa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Cetak Roster Resmi Dokumen Labschool"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Cetak Roster</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Export Data Siswa ke format CSV / Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Siswa Kelas</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{filteredSmaStudents.length} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Terverifikasi (Active)</p>
                <p className="text-xl font-black text-cyan-400 mt-0.5">{filteredSmaStudents.filter(s => s.status === 'ACTIVE').length} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kelompok Binaan</p>
                <p className="text-xl font-black text-amber-400 mt-0.5">{new Set(filteredSmaStudents.map(s => s.group).filter(Boolean)).size || 3} <span className="text-xs font-normal text-slate-400">Kelompok</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Peminatan MIPA / IPS</p>
                <p className="text-xl font-black text-purple-400 mt-0.5">
                  {filteredSmaStudents.filter(s => s.bio?.includes('MIPA')).length} <span className="text-xs text-slate-400 font-normal">MIPA</span> / {filteredSmaStudents.filter(s => s.bio?.includes('IPS')).length} <span className="text-xs text-slate-400 font-normal">IPS</span>
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIS, kelompok, peminatan..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Class Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <School className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-transparent text-emerald-300 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="SMA-LABSCHOOL" className="bg-slate-900 text-emerald-300">Kelas: SMA-LABSCHOOL (Default)</option>
                  <option value="ALL" className="bg-slate-900 text-white">Semua Kelas</option>
                  {availableClassOptions.filter(c => c !== 'SMA-LABSCHOOL').map(c => (
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
                  <option value="Kebayoran" className="bg-slate-900 text-white">SMA Labschool Kebayoran</option>
                  <option value="Rawamangun" className="bg-slate-900 text-white">SMA Labschool Rawamangun</option>
                  <option value="Cibubur" className="bg-slate-900 text-white">SMA Labschool Cibubur</option>
                  <option value="Cirendeu" className="bg-slate-900 text-white">SMA Labschool Cirendeu</option>
                </select>
              </div>

              {/* Major Track Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterTrack}
                  onChange={(e) => setFilterTrack(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Semua Peminatan</option>
                  <option value="MIPA" className="bg-slate-900 text-white">MIPA / Saintek</option>
                  <option value="IPS" className="bg-slate-900 text-white">IPS / Soshum</option>
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
                  <option value="Garuda" className="bg-slate-900 text-white">Kelompok Garuda</option>
                  <option value="Elang" className="bg-slate-900 text-white">Kelompok Elang</option>
                  <option value="Rajawali" className="bg-slate-900 text-white">Kelompok Rajawali</option>
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
                  <option value="ACTIVE" className="bg-slate-900 text-emerald-300">Status: ACTIVE</option>
                  <option value="PENDING" className="bg-slate-900 text-amber-300">Status: PENDING</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    viewMode === 'table' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Tabel"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Student Content View */}
          {filteredSmaStudents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">Tidak Ada Data Siswa Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery || filterCampus !== 'ALL' || filterGroup !== 'ALL' || filterTrack !== 'ALL' || filterStatus !== 'ALL'
                  ? 'Tidak ada siswa yang sesuai dengan kriteria pencarian atau filter yang Anda pilih.'
                  : `Belum ada siswa yang terdaftar pada kelas ${filterClass}.`}
              </p>
              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> + Tambah Siswa Sekarang
                </button>
                {(searchQuery || filterCampus !== 'ALL' || filterGroup !== 'ALL' || filterStatus !== 'ALL' || filterTrack !== 'ALL' || filterClass !== 'SMA-LABSCHOOL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterClass('SMA-LABSCHOOL');
                      setFilterCampus('ALL');
                      setFilterGroup('ALL');
                      setFilterStatus('ALL');
                      setFilterTrack('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSmaStudents.map((student) => {
                const targetCampus = student.bio?.includes('Kebayoran')
                  ? 'Kebayoran'
                  : student.bio?.includes('Rawamangun')
                  ? 'Rawamangun'
                  : student.bio?.includes('Cibubur')
                  ? 'Cibubur'
                  : student.bio?.includes('Cirendeu')
                  ? 'Cirendeu'
                  : 'SMA Labschool';

                const majorTrack = student.bio?.includes('MIPA')
                  ? 'MIPA Saintek'
                  : student.bio?.includes('IPS')
                  ? 'IPS Soshum'
                  : 'Reguler';

                return (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-emerald-500/5"
                  >
                    <div>
                      {/* Top Row: Class Badge & Status Toggle */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {student.className || 'SMA-LABSCHOOL'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            student.status === 'ACTIVE'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30'
                          }`}
                          title="Klik untuk ubah status (ACTIVE / PENDING)"
                        >
                          {student.status}
                        </button>
                      </div>

                      {/* Avatar & Student Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=0f172a`}
                            alt={student.name}
                            className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shadow-md"
                          />
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                            student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
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
                          <span className="font-bold text-emerald-400 text-[11px]">{targetCampus}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">Peminatan:</span>
                          <span className="font-semibold text-cyan-300 text-[11px]">{majorTrack}</span>
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
                    <div className="pt-2 flex items-center gap-1.5 mt-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Detail
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(student)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
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
                        className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 transition-all"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

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
                      <th className="px-4 py-3.5">Target Kampus & Peminatan</th>
                      <th className="px-4 py-3.5">Kontak</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSmaStudents.map((student, idx) => {
                      const targetCampus = student.bio?.includes('Kebayoran')
                        ? 'SMA Labschool Kebayoran'
                        : student.bio?.includes('Rawamangun')
                        ? 'SMA Labschool Rawamangun'
                        : student.bio?.includes('Cibubur')
                        ? 'SMA Labschool Cibubur'
                        : student.bio?.includes('Cirendeu')
                        ? 'SMA Labschool Cirendeu'
                        : 'SMA Labschool';

                      const majorTrack = student.bio?.includes('MIPA')
                        ? 'MIPA Saintek'
                        : student.bio?.includes('IPS')
                        ? 'IPS Soshum'
                        : 'Reguler';

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=0f172a`}
                                alt={student.name}
                                className="w-8 h-8 rounded-lg object-cover border border-emerald-500/20"
                              />
                              <div>
                                <p className="font-bold text-white hover:text-emerald-300 transition-colors">
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
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mr-1.5">
                              {student.className}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {student.group || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-emerald-400">{targetCampus}</p>
                            <p className="text-[10px] text-cyan-300 font-medium">{majorTrack}</p>
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
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                student.status === 'ACTIVE'
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25'
                                  : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25'
                              }`}
                              title="Klik untuk ubah status"
                            >
                              {student.status}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedStudent(student)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all"
                              >
                                Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(student)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentToDelete(student);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1 rounded-lg bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white transition-all"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

      {/* MODAL 1: TAMBAH SISWA SMA-LABSCHOOL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Siswa Kelas SMA-LABSCHOOL</h3>
                <p className="text-xs text-slate-400">Daftarkan siswa baru ke bimbingan persiapan PSB SMA Labschool</p>
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
                    placeholder="Contoh: Muhammad Farhan Pratama"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor Induk Siswa (NIS) *</label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="Contoh: 2026101"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none"
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
                    placeholder="siswa@labschool.sch.id"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. WhatsApp / HP Siswa</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelas Terdaftar *</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-emerald-300 font-bold focus:outline-none"
                  >
                    {availableClassOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelompok Belajar Binaan</label>
                  <input
                    type="text"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    placeholder="Contoh: Kelompok Garuda (SMA-Labs)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Kampus SMA Labschool</label>
                  <select
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="SMA Labschool Kebayoran">SMA Labschool Kebayoran</option>
                    <option value="SMA Labschool Rawamangun">SMA Labschool Rawamangun</option>
                    <option value="SMA Labschool Cibubur">SMA Labschool Cibubur</option>
                    <option value="SMA Labschool Cirendeu">SMA Labschool Cirendeu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peminatan / Jalur</label>
                  <select
                    value={formTrack}
                    onChange={(e) => setFormTrack(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-cyan-300 font-semibold focus:outline-none"
                  >
                    <option value="MIPA Saintek">MIPA Saintek (Matematika & IPA)</option>
                    <option value="IPS Soshum">IPS Soshum (Sosial & Humaniora)</option>
                    <option value="Reguler">Reguler Umum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Terverifikasi & Aktif)</option>
                    <option value="PENDING">PENDING (Menunggu Verifikasi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password Awal</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Profil / Target Nilai</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Target nilai tryout, riwayat prestasi atau sekolah asal..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-950 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SISWA SMA-LABSCHOOL */}
      {isEditModalOpen && studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Data Siswa: {studentToEdit.name}</h3>
                <p className="text-xs text-slate-400">Perbarui profil, kelas terdaftar, dan kontak siswa</p>
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
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none"
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
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp / No. HP</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelas Terdaftar</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-emerald-300 font-bold focus:outline-none"
                  >
                    {availableClassOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelompok Belajar</label>
                  <input
                    type="text"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Kampus</label>
                  <select
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="SMA Labschool Kebayoran">SMA Labschool Kebayoran</option>
                    <option value="SMA Labschool Rawamangun">SMA Labschool Rawamangun</option>
                    <option value="SMA Labschool Cibubur">SMA Labschool Cibubur</option>
                    <option value="SMA Labschool Cirendeu">SMA Labschool Cirendeu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peminatan</label>
                  <select
                    value={formTrack}
                    onChange={(e) => setFormTrack(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-cyan-300 font-semibold focus:outline-none"
                  >
                    <option value="MIPA Saintek">MIPA Saintek</option>
                    <option value="IPS Soshum">IPS Soshum</option>
                    <option value="Reguler">Reguler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Terverifikasi)</option>
                    <option value="PENDING">PENDING (Menunggu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio / Catatan Portofolio</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-950 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS SISWA */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Hapus Data Siswa?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus data siswa <strong className="text-white">{studentToDelete.name}</strong> (NIS: {studentToDelete.nis}) dari kelas <strong className="text-emerald-400">{studentToDelete.className}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-950"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL SISWA SMA-LABSCHOOL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-800">
              <img
                src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=10b981&color=0f172a`}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                    {selectedStudent.className}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedStudent.status === 'ACTIVE'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
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
                <p className="font-bold text-emerald-300 text-sm">{selectedStudent.group || 'Kelompok Belajar Belum Ditentukan'}</p>
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
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">Target PSB, Peminatan & Portofolio</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedStudent.bio}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedStudent)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                Edit Siswa
              </button>

              {selectedStudent.whatsapp && (
                <a
                  href={`https://wa.me/${selectedStudent.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CETAK ROSTER RESMI DATA SISWA KELAS SMA-LABSCHOOL */}
      <LabschoolPrintStudentRosterModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        level="SMA"
        targetClassName={filterClass}
        students={filteredSmaStudents}
        user={user}
        onShowToast={onShowToast}
      />

    </div>
  );
};
