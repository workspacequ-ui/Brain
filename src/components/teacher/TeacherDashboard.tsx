import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Teacher,
  SyllabusItem,
  LearningMaterial,
  Exam,
  ExamResult,
  MarketplaceProduct,
  ClassItem,
  SubjectItem,
  ExamCategory,
  FeaturedProgram,
  SyllabusTopic
} from '../../types';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Calendar,
  Users,
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HardDrive,
  ExternalLink,
  Download,
  Edit3,
  Trash2,
  Eye,
  MessageCircle,
  FileText,
  Sparkles,
  TrendingUp,
  Layers,
  ShoppingBag,
  BarChart3,
  Phone,
  Mail,
  ChevronRight,
  BookMarked,
  LayoutGrid,
  List,
  Check,
  X,
  Printer,
  Table,
  SlidersHorizontal,
  Settings2,
  AlertCircle,
  TableProperties
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Sub-components re-used with teacher context
import { SyllabusManagement } from '../admin/SyllabusManagement';
import { MaterialManagement } from '../admin/MaterialManagement';
import { ExamManagement } from '../admin/ExamManagement';
import { ExamReports } from '../admin/ExamReports';
import { TryoutReports } from '../admin/TryoutReports';
import { MarketplaceManagement } from '../admin/MarketplaceManagement';
import { StudentGradingModal } from './StudentGradingModal';
import { DashboardCalendarAgendaPengumuman } from '../common/DashboardCalendarAgendaPengumuman';

interface TeacherDashboardProps {
  user: User;
  teachers?: Teacher[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  categories: ExamCategory[];
  syllabi: SyllabusItem[];
  materials: LearningMaterial[];
  exams: Exam[];
  results: ExamResult[];
  products: MarketplaceProduct[];
  allUsers: User[];
  selectedClass?: string;
  onSelectClass?: (className: string) => void;
  onSaveSyllabus: (syllabus: SyllabusItem) => void;
  onDeleteSyllabus: (id: string) => void;
  onSaveMaterial: (material: LearningMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onSaveExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onSaveExamResult?: (result: ExamResult) => void;
  onDeleteExamResult?: (id: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  activeTab: string;
  onNavigateTab?: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  teachers = [],
  classes,
  subjects,
  categories,
  syllabi,
  materials,
  exams,
  results,
  products,
  allUsers,
  selectedClass = 'ALL',
  onSelectClass,
  onSaveSyllabus,
  onDeleteSyllabus,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveExam,
  onDeleteExam,
  onSaveExamResult,
  onDeleteExamResult,
  onShowToast,
  activeTab,
  onNavigateTab
}) => {
  // Find current teacher's profile details if matched in teacher list
  const currentTeacher = useMemo(() => {
    return teachers.find(
      t => t.id === user.id || t.nip === user.nis || t.email === user.email || t.name === user.name
    );
  }, [teachers, user]);

  const teacherSubject = currentTeacher?.subject || user.subject || 'Mata Pelajaran Umum';
  const teacherClasses = currentTeacher?.targetClasses && currentTeacher.targetClasses.length > 0
    ? currentTeacher.targetClasses
    : [user.className || 'SEMUA'];

  // Local state for Class Hub management
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(selectedClass || 'ALL');
  const [classDetailSubTab, setClassDetailSubTab] = useState<'students' | 'syllabus' | 'materials' | 'exams' | 'reports'>('students');
  const [classSearchQuery, setClassSearchQuery] = useState('');

  // Keep local class filter in sync with prop
  useEffect(() => {
    if (selectedClass) {
      setSelectedClassFilter(selectedClass);
    }
  }, [selectedClass]);

  const handleClassFilterChange = (cls: string) => {
    setSelectedClassFilter(cls);
    if (onSelectClass) {
      onSelectClass(cls);
    }
  };

  // Helper string normalizer
  const norm = (str?: string) => (str || '').trim().toLowerCase();

  // Filtered Class List matching this teacher's assigned classes
  const teacherFilteredClasses = useMemo(() => {
    if (teacherClasses.includes('SEMUA')) return classes;
    const matched = classes.filter(c => 
      teacherClasses.some(tc => 
        norm(tc) === norm(c.name) || 
        norm(tc) === norm(c.code) ||
        norm(c.name).includes(norm(tc)) ||
        norm(tc).includes(norm(c.name))
      )
    );
    if (matched.length > 0) return matched;
    return teacherClasses.map((cls, i) => ({
      id: `cls-tch-${i}`,
      name: cls,
      code: cls,
      description: `Kelas Binaan ${cls}`
    }));
  }, [classes, teacherClasses]);

  // Filtered Subject List matching this teacher's subject
  const teacherFilteredSubjects = useMemo(() => {
    const matched = subjects.filter(s => 
      norm(s.name).includes(norm(teacherSubject)) ||
      norm(teacherSubject).includes(norm(s.name))
    );
    if (matched.length > 0) return matched;
    return [{
      id: 'sbj-tch',
      name: teacherSubject,
      code: teacherSubject.substring(0, 3).toUpperCase(),
      group: 'Mata Pelajaran Pengampu',
      description: `Mata Pelajaran ${teacherSubject}`,
      targetClasses: teacherClasses
    }];
  }, [subjects, teacherSubject, teacherClasses]);

  // Filtered Teacher entity representing this teacher
  const teacherFilteredTeachers = useMemo(() => {
    if (currentTeacher) return [currentTeacher];
    return [{
      id: user.id,
      nip: user.nis || '198501012020011001',
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      subject: teacherSubject,
      targetClasses: teacherClasses,
      gender: 'L',
      status: 'ACTIVE',
      createdAt: user.createdAt || new Date().toISOString().split('T')[0]
    } as Teacher];
  }, [currentTeacher, user, teacherSubject, teacherClasses]);

  // Filter items specifically for this teacher (STRICT subject AND class matching)
  const teacherSyllabi = useMemo(() => {
    const userTeacherName = norm(user.name);
    const currTeacherName = currentTeacher ? norm(currentTeacher.name) : '';
    const normTeacherSubject = norm(teacherSubject);

    return syllabi.filter(s => {
      const sSubj = norm(s.subject);
      const sTeacher = norm(s.teacherInCharge);
      const sClass = norm(s.targetClass);

      // Subject / Teacher match
      const matchSubject =
        (normTeacherSubject && (sSubj.includes(normTeacherSubject) || normTeacherSubject.includes(sSubj))) ||
        (sTeacher && (sTeacher.includes(userTeacherName) || (currTeacherName && sTeacher.includes(currTeacherName))));

      // Class match
      const matchClass =
        teacherClasses.includes('SEMUA') ||
        sClass === 'semua' ||
        teacherClasses.some(tc => {
          const normTc = norm(tc);
          return normTc === sClass || sClass.includes(normTc) || normTc.includes(sClass);
        });

      // BOTH subject and class MUST match according to teacher assignment
      return matchSubject && matchClass;
    });
  }, [syllabi, user.name, currentTeacher, teacherSubject, teacherClasses]);

  const teacherMaterials = useMemo(() => {
    const normTeacherSubject = norm(teacherSubject);

    return materials.filter(m => {
      const matchClass = teacherClasses.includes('SEMUA') ||
        m.targetClass === 'SEMUA' ||
        teacherClasses.some(tc => norm(tc) === norm(m.targetClass) || norm(m.targetClass).includes(norm(tc)));
      const matchSubj = !m.subject ||
        norm(m.subject).includes(normTeacherSubject) ||
        normTeacherSubject.includes(norm(m.subject)) ||
        norm(m.title).includes(normTeacherSubject);
      return matchClass && matchSubj;
    });
  }, [materials, teacherClasses, teacherSubject]);

  const teacherExams = useMemo(() => {
    const normTeacherSubject = norm(teacherSubject);

    return exams.filter(e => {
      const matchClass = teacherClasses.includes('SEMUA') ||
        e.targetClass === 'SEMUA' ||
        teacherClasses.some(tc => norm(tc) === norm(e.targetClass) || norm(e.targetClass).includes(norm(tc)));
      const matchSubj = !e.category ||
        norm(e.category).includes(normTeacherSubject) ||
        normTeacherSubject.includes(norm(e.category)) ||
        norm(e.title).includes(normTeacherSubject);
      return matchClass && matchSubj;
    });
  }, [exams, teacherClasses, teacherSubject]);

  // Students in this teacher's assigned classes
  const assignedStudents = useMemo(() => {
    return allUsers.filter(u => {
      if (u.role !== 'student') return false;
      if (teacherClasses.includes('SEMUA')) return true;
      return teacherClasses.includes(u.className);
    });
  }, [allUsers, teacherClasses]);

  // Student exam results in this teacher's classes
  const teacherResults = useMemo(() => {
    return results.filter(r => {
      const cls = r.studentClass || r.className || '';
      if (teacherClasses.includes('SEMUA')) return true;
      return teacherClasses.includes(cls);
    });
  }, [results, teacherClasses]);

  // Calculate stats
  const avgScore = useMemo(() => {
    if (teacherResults.length === 0) return 0;
    const sum = teacherResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(sum / teacherResults.length);
  }, [teacherResults]);

  // Teacher KKM (Kriteria Ketuntasan Minimal) Settings
  const [teacherKkm, setTeacherKkm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`teacher_kkm_${user.id}`);
      return saved ? parseInt(saved, 10) || 75 : 75;
    } catch {
      return 75;
    }
  });
  const [isEditingKkm, setIsEditingKkm] = useState(false);
  const [tempKkm, setTempKkm] = useState<number>(teacherKkm);

  const handleSaveKkm = (val: number) => {
    const validVal = Math.min(100, Math.max(10, val));
    setTeacherKkm(validVal);
    setTempKkm(validVal);
    setIsEditingKkm(false);
    try {
      localStorage.setItem(`teacher_kkm_${user.id}`, String(validVal));
    } catch {}
  };

  // Assessment Categories Configuration
  const ASSESSMENT_CATEGORY_CONFIG = [
    { id: 'ALL', name: 'Semua Kategori', shortName: 'Semua', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    { id: 'TUGAS', name: 'Tugas Harian', shortName: 'Tugas', keywords: ['tugas'], color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', headerColor: 'text-blue-400' },
    { id: 'UH', name: 'Ulangan Harian (UH)', shortName: 'UH', keywords: ['ulangan', 'uh'], color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', headerColor: 'text-cyan-400' },
    { id: 'KUIS', name: 'Kuis Singkat', shortName: 'Kuis', keywords: ['kuis', 'quiz'], color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', headerColor: 'text-amber-400' },
    { id: 'PTS', name: 'PTS (Tengah Semester)', shortName: 'PTS', keywords: ['tengah', 'pts', 'uts'], color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', headerColor: 'text-purple-400' },
    { id: 'PAS', name: 'PAS (Akhir Semester)', shortName: 'PAS', keywords: ['akhir', 'pas', 'uas'], color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', headerColor: 'text-rose-400' },
    { id: 'PRAKTIK', name: 'Praktik & Portofolio', shortName: 'Praktik', keywords: ['praktik', 'portofolio', 'proyek', 'praktek'], color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', headerColor: 'text-emerald-400' },
    { id: 'REMEDIAL', name: 'Remedial & Pemantapan', shortName: 'Remedial', keywords: ['remedial'], color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', headerColor: 'text-orange-400' }
  ];

  // Helper for category badge
  const getCategoryBadgeStyle = (cat?: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('tugas')) return { label: 'Tugas Harian', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' };
    if (c.includes('ulangan') || c.includes('uh')) return { label: 'Ulangan Harian (UH)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' };
    if (c.includes('kuis') || c.includes('quiz')) return { label: 'Kuis Singkat', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' };
    if (c.includes('tengah') || c.includes('pts') || c.includes('uts')) return { label: 'PTS', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' };
    if (c.includes('akhir') || c.includes('pas') || c.includes('uas')) return { label: 'PAS', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' };
    if (c.includes('praktik') || c.includes('portofolio') || c.includes('proyek') || c.includes('praktek')) return { label: 'Praktik', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' };
    if (c.includes('remedial')) return { label: 'Remedial', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' };
    return { label: cat || 'Evaluasi Mandiri', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400' };
  };

  // Helper to extract student breakdown per category
  const getStudentCategoryBreakdown = (st: User) => {
    const stResults = results.filter(
      r => r.studentNis === st.nis || r.studentId === st.id || r.studentName.toLowerCase() === st.name.toLowerCase()
    );

    const getScoreInfo = (keywords: string[]) => {
      const matched = stResults.filter(r => {
        const type = (r.assessmentType || r.examCategory || '').toLowerCase();
        const title = (r.examTitle || '').toLowerCase();
        return keywords.some(k => type.includes(k) || title.includes(k));
      });
      if (matched.length === 0) return { avg: null, count: 0, scores: [] };
      const sum = matched.reduce((a, b) => a + (b.score || 0), 0);
      return {
        avg: Math.round(sum / matched.length),
        count: matched.length,
        scores: matched.map(m => m.score || 0)
      };
    };

    const tugas = getScoreInfo(['tugas']);
    const uh = getScoreInfo(['ulangan', 'uh']);
    const kuis = getScoreInfo(['kuis', 'quiz']);
    const pts = getScoreInfo(['tengah', 'pts', 'uts']);
    const pas = getScoreInfo(['akhir', 'pas', 'uas']);
    const praktik = getScoreInfo(['praktik', 'portofolio', 'proyek', 'praktek']);
    const remedial = getScoreInfo(['remedial']);

    const overallAvg = stResults.length > 0
      ? Math.round(stResults.reduce((a, b) => a + (b.score || 0), 0) / stResults.length)
      : null;

    return {
      totalCount: stResults.length,
      overallAvg,
      tugas,
      uh,
      kuis,
      pts,
      pas,
      praktik,
      remedial,
      stResults
    };
  };

  // Grading Modal State
  const [gradingStudent, setGradingStudent] = useState<User | null>(null);

  // Student list search & filter in Roster tab
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');
  const [studentCategoryFilter, setStudentCategoryFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('ALL');
  const [studentViewMode, setStudentViewMode] = useState<'matrix' | 'journal' | 'cards'>('matrix');

  const filteredAssignedStudents = useMemo(() => {
    return assignedStudents.filter(st => {
      const matchSearch =
        st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.nis.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (st.email && st.email.toLowerCase().includes(studentSearch.toLowerCase()));
      const matchClass = studentClassFilter === 'ALL' || st.className === studentClassFilter;

      const breakdown = getStudentCategoryBreakdown(st);
      const hasGraded = breakdown.totalCount > 0;
      const stAvg = breakdown.overallAvg;

      // Category matching
      let matchCat = true;
      if (studentCategoryFilter !== 'ALL') {
        const catConfig = ASSESSMENT_CATEGORY_CONFIG.find(c => c.id === studentCategoryFilter);
        if (catConfig && catConfig.keywords) {
          const matchedCount = breakdown.stResults.filter(r => {
            const type = (r.assessmentType || r.examCategory || '').toLowerCase();
            const title = (r.examTitle || '').toLowerCase();
            return catConfig.keywords.some(k => type.includes(k) || title.includes(k));
          }).length;
          matchCat = matchedCount > 0;
        }
      }

      let matchStatus = true;
      if (studentStatusFilter === 'GRADED') matchStatus = hasGraded;
      else if (studentStatusFilter === 'UNGRADED') matchStatus = !hasGraded;
      else if (studentStatusFilter === 'PASSED') matchStatus = stAvg !== null && stAvg >= teacherKkm;
      else if (studentStatusFilter === 'REMEDIAL') matchStatus = stAvg !== null && stAvg < teacherKkm;

      return matchSearch && matchClass && matchCat && matchStatus;
    });
  }, [assignedStudents, studentSearch, studentClassFilter, studentCategoryFilter, studentStatusFilter, results, teacherKkm]);

  // Detailed journal entries filter
  const filteredJournalEntries = useMemo(() => {
    return teacherResults.filter(res => {
      const matchSearch =
        res.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (res.studentNis && res.studentNis.toLowerCase().includes(studentSearch.toLowerCase())) ||
        res.examTitle.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (res.teacherFeedback && res.teacherFeedback.toLowerCase().includes(studentSearch.toLowerCase()));

      const matchClass =
        studentClassFilter === 'ALL' ||
        res.studentClass === studentClassFilter ||
        res.className === studentClassFilter;

      let matchCat = true;
      if (studentCategoryFilter !== 'ALL') {
        const catConfig = ASSESSMENT_CATEGORY_CONFIG.find(c => c.id === studentCategoryFilter);
        if (catConfig && catConfig.keywords) {
          const type = (res.assessmentType || res.examCategory || '').toLowerCase();
          const title = (res.examTitle || '').toLowerCase();
          matchCat = catConfig.keywords.some(k => type.includes(k) || title.includes(k));
        }
      }

      const itemKkm = res.passingScore || teacherKkm;
      const isPass = (res.score || 0) >= itemKkm;

      let matchStatus = true;
      if (studentStatusFilter === 'PASSED') matchStatus = isPass;
      else if (studentStatusFilter === 'REMEDIAL') matchStatus = !isPass;

      return matchSearch && matchClass && matchCat && matchStatus;
    });
  }, [teacherResults, studentSearch, studentClassFilter, studentCategoryFilter, studentStatusFilter, teacherKkm]);

  // Unique list of classes assigned to this teacher / present in assigned students
  const teacherAssignedClassesList = useMemo(() => {
    const classSet = new Set<string>();
    assignedStudents.forEach(s => {
      if (s.className) classSet.add(s.className);
    });
    teacherClasses.forEach(tc => {
      if (tc && tc !== 'SEMUA') classSet.add(tc);
    });
    if (classSet.size === 0 && user.className) {
      classSet.add(user.className);
    }
    return Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [assignedStudents, teacherClasses, user.className]);

  // Group filtered students by their class for separated tables
  const groupedStudentsByClass = useMemo(() => {
    const map: { [className: string]: User[] } = {};
    filteredAssignedStudents.forEach(st => {
      const cls = st.className || 'Tanpa Kelas';
      if (!map[cls]) map[cls] = [];
      map[cls].push(st);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  }, [filteredAssignedStudents]);

  // Group filtered journal entries by student class for separated tables
  const groupedJournalByClass = useMemo(() => {
    const map: { [className: string]: ExamResult[] } = {};
    filteredJournalEntries.forEach(res => {
      const cls = res.studentClass || res.className || 'Tanpa Kelas';
      if (!map[cls]) map[cls] = [];
      map[cls].push(res);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  }, [filteredJournalEntries]);

  // Print & Export modal state for a specific class
  const [printClassModal, setPrintClassModal] = useState<{
    className: string;
    students: User[];
  } | null>(null);

  const handleOpenPrintClass = (targetClassName: string, studentsToPrint: User[]) => {
    setPrintClassModal({
      className: targetClassName,
      students: studentsToPrint
    });
  };

  const handleExportClassCsv = (targetClassName: string, studentsToExport: User[]) => {
    const headers = ['No', 'Nama Siswa', 'NIS', 'Kelas', 'Kelompok', 'Nomor WA', 'Tugas', 'UH', 'Kuis', 'PTS', 'PAS', 'Praktik', 'Remedial', 'Rata-rata', 'Status KKM'];
    const rows = studentsToExport.map((st, idx) => {
      const b = getStudentCategoryBreakdown(st);
      const isPass = b.overallAvg !== null && b.overallAvg >= teacherKkm;
      const statusText = b.overallAvg === null ? 'Belum Dinilai' : isPass ? 'TUNTAS' : 'REMEDIAL';
      return [
        idx + 1,
        `"${st.name.replace(/"/g, '""')}"`,
        `"${st.nis || ''}"`,
        `"${targetClassName}"`,
        `"${st.group || '-'}"`,
        `"${st.whatsapp || st.phone || '-'}"`,
        b.tugas.avg ?? '',
        b.uh.avg ?? '',
        b.kuis.avg ?? '',
        b.pts.avg ?? '',
        b.pas.avg ?? '',
        b.praktik.avg ?? '',
        b.remedial.avg ?? '',
        b.overallAvg ?? '',
        `"${statusText}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Kelas_${targetClassName.replace(/\s+/g, '_')}_${teacherSubject.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`File CSV Rekap Nilai Kelas ${targetClassName} berhasil diunduh.`, 'success');
  };

  const handleSaveGrade = (res: ExamResult) => {
    if (onSaveExamResult) {
      onSaveExamResult(res);
    }
  };

  const handleDeleteGrade = (resId: string) => {
    if (onDeleteExamResult) {
      onDeleteExamResult(resId);
    }
  };

  // Score distribution for chart
  const scoreDistributionData = useMemo(() => {
    const buckets = [
      { range: '0 - 40', count: 0, fill: '#ef4444' },
      { range: '41 - 60', count: 0, fill: '#f97316' },
      { range: '61 - 75', count: 0, fill: '#eab308' },
      { range: '76 - 85', count: 0, fill: '#3b82f6' },
      { range: '86 - 100', count: 0, fill: '#10b981' }
    ];

    teacherResults.forEach(r => {
      const s = r.score || 0;
      if (s <= 40) buckets[0].count++;
      else if (s <= 60) buckets[1].count++;
      else if (s <= 75) buckets[2].count++;
      else if (s <= 85) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [teacherResults]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* TAB: OVERVIEW (DASHBOARD UTAMA GURU) - Hanya di sini informasi nama & data profil guru ditampilkan */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* SPLIT CALENDAR, AGENDA ROADMAP, AND PENGUMUMAN WIDGET FOR TEACHER (PALING ATAS) */}
          <DashboardCalendarAgendaPengumuman
            user={user}
            onNavigateTab={onNavigateTab}
            onShowToast={onShowToast}
          />

          {/* 1. TEACHER WELCOME & IDENTITY HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Teacher Profile Left */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative">
                  <img
                    src={user.avatar || currentTeacher?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-500/30 shadow-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-lg font-bold shadow">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {user.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      GURU / PENDIDIK
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      AKTIF
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-amber-300">
                    {teacherSubject}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap">
                    <span>NIP/ID: <strong className="text-slate-200 font-mono">{user.nis || currentTeacher?.nip || '-'}</strong></span>
                    <span>•</span>
                    <span>Kelas Binaan:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {teacherClasses.map(cls => (
                        <span key={cls} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-700">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons Right */}
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                {onNavigateTab && (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('syllabus')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <BookMarked className="w-4 h-4 text-amber-400" />
                      <span>Silabus & RPP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('materials')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span>Bahan Ajar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('exams')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>Ujian CBT</span>
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* 2. STAT METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
              
              <div
                onClick={() => onNavigateTab && onNavigateTab('syllabus')}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold text-slate-400">Silabus & RPP</span>
                  <BookMarked className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {teacherSyllabi.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Kurikulum siap ajar</p>
              </div>

              <div
                onClick={() => onNavigateTab && onNavigateTab('materials')}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold text-slate-400">Bahan Ajar</span>
                  <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {teacherMaterials.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Modul & video digital</p>
              </div>

              <div
                onClick={() => onNavigateTab && onNavigateTab('exams')}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold text-slate-400">Paket CBT</span>
                  <FileCheck2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {teacherExams.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Ujian aktif & latihan</p>
              </div>

              <div
                onClick={() => onNavigateTab && onNavigateTab('students')}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold text-slate-400">Siswa Binaan</span>
                  <Users className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {assignedStudents.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Siswa terdaftar aktif</p>
              </div>

              <div
                onClick={() => onNavigateTab && onNavigateTab('reports')}
                className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold text-slate-400">Rata-rata CBT</span>
                  <TrendingUp className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {avgScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{teacherResults.length} submit ujian</p>
              </div>

            </div>

          </div>

          {/* Row: Active Teaching Schedule & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Silabus & Pertemuan Terdekat */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">
                    Silabus & Agenda Pertemuan Mengajar
                  </h3>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('syllabus')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Kelola Semua Silabus</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {teacherSyllabi.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherSyllabi.slice(0, 4).map(sil => (
                    <div
                      key={sil.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {sil.targetClass}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {sil.code}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">
                          {sil.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {sil.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {sil.topics?.length || sil.totalMeetings || 0} Pertemuan
                        </span>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('syllabus')}
                            className="text-xs font-bold text-amber-400 hover:underline"
                          >
                            Buka Rincian →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <BookMarked className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Belum ada silabus yang terkait dengan mata pelajaran Anda.</p>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('syllabus')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all"
                    >
                      + Buat Silabus Baru
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right 1 Col: Score Distribution Chart & Quick Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">
                  Sebaran Nilai CBT Siswa
                </h3>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Total Ujian Terkoreksi:</span>
                  <strong className="text-white font-bold">{teacherResults.length} data</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Row: Recent Student Submissions & Roster Summary */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Aktivitas Evaluasi & Nilai Terkini Siswa
                </h3>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('reports')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Lihat Laporan Lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {teacherResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3">Siswa</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3">Ujian / Tryout</th>
                      <th className="p-3 text-center">Nilai</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Tanggal Submit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {teacherResults.slice(0, 5).map(res => {
                      const isPassed = res.score >= 70;
                      return (
                        <tr key={res.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-xs">
                              {res.studentName.charAt(0)}
                            </span>
                            <span>{res.studentName}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                              {res.className}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-medium">
                            {res.examTitle}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-mono font-extrabold text-sm ${
                              res.score >= 80 ? 'text-emerald-400' : res.score >= 60 ? 'text-blue-400' : 'text-rose-400'
                            }`}>
                              {res.score}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPassed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-400 text-[11px]">
                            {res.submittedAt}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">Belum ada submit ujian dari siswa di kelas binaan Anda.</p>
            )}
          </div>

        </div>
      )}

      {/* TAB: MENU KELAS & KELAS BINAAN */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* 1. Header Card with Class Selector */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                    <span>Menu Kelas Binaan Guru</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {teacherClasses.length} Kelas
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mata Pelajaran: <span className="text-amber-300 font-semibold">{teacherSubject}</span> • Guru Pengampu: <span className="text-white font-medium">{user.name}</span>
                  </p>
                </div>
              </div>

              {/* Class Filter Tabs / Quick Select */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleClassFilterChange('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedClassFilter === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  Semua Kelas ({teacherClasses.length})
                </button>
                {teacherClasses.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleClassFilterChange(cls)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedClassFilter === cls
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Kelas {cls}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. OVERVIEW VIEW: IF "ALL" IS SELECTED */}
          {selectedClassFilter === 'ALL' ? (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Total Kelas</p>
                  <h4 className="text-2xl font-extrabold text-white mt-1">{teacherClasses.length} Kelas</h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Total Siswa Binaan</p>
                  <h4 className="text-2xl font-extrabold text-purple-400 mt-1">{assignedStudents.length} Siswa</h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Silabus & RPP</p>
                  <h4 className="text-2xl font-extrabold text-blue-400 mt-1">{teacherSyllabi.length} Dokumen</h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Bahan Ajar</p>
                  <h4 className="text-2xl font-extrabold text-amber-400 mt-1">{teacherMaterials.length} Materi</h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Rata-rata Nilai CBT</p>
                  <h4 className={`text-2xl font-extrabold mt-1 ${avgScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {avgScore > 0 ? `${avgScore} / 100` : '-'}
                  </h4>
                </div>
              </div>

              {/* Grid of Class Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teacherClasses.map(clsName => {
                  const clsStudents = allUsers.filter(u => u.role === 'student' && u.className === clsName);
                  const clsSyllabi = teacherSyllabi.filter(s => s.targetClass === 'SEMUA' || norm(s.targetClass) === norm(clsName) || norm(s.targetClass).includes(norm(clsName)));
                  const clsMaterials = teacherMaterials.filter(m => m.targetClass === 'SEMUA' || norm(m.targetClass) === norm(clsName) || norm(m.targetClass).includes(norm(clsName)));
                  const clsExams = teacherExams.filter(e => e.targetClass === 'SEMUA' || norm(e.targetClass) === norm(clsName) || norm(e.targetClass).includes(norm(clsName)));
                  const clsResults = teacherResults.filter(r => norm(r.className) === norm(clsName));
                  const clsAvg = clsResults.length > 0 ? Math.round(clsResults.reduce((a, b) => a + (b.score || 0), 0) / clsResults.length) : null;

                  return (
                    <div
                      key={clsName}
                      className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors">
                                Kelas {clsName}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium">Mapel: {teacherSubject}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold shrink-0">
                            {clsStudents.length} Siswa
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-500 block">Silabus & RPP</span>
                            <span className="font-bold text-white">{clsSyllabi.length} Topik</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-500 block">Bahan Ajar</span>
                            <span className="font-bold text-white">{clsMaterials.length} Materi</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-500 block">Paket Ujian CBT</span>
                            <span className="font-bold text-white">{clsExams.length} Ujian</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-500 block">Rata-rata Nilai</span>
                            <span className={`font-bold ${clsAvg === null ? 'text-slate-500' : clsAvg >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {clsAvg !== null ? `${clsAvg} / 100` : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleClassFilterChange(clsName);
                            setClassDetailSubTab('students');
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>Buka Detail Kelas</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 3. FOCUSED CLASS VIEW: SPECIFIC CLASS IS SELECTED */
            (() => {
              const clsStudents = allUsers.filter(u => {
                if (u.role !== 'student') return false;
                return norm(u.className) === norm(selectedClassFilter);
              });
              const filteredClsStudents = clsStudents.filter(st => {
                const q = classSearchQuery.toLowerCase();
                return st.name.toLowerCase().includes(q) || st.nis.toLowerCase().includes(q) || (st.email && st.email.toLowerCase().includes(q));
              });
              const clsSyllabi = teacherSyllabi.filter(s => s.targetClass === 'SEMUA' || norm(s.targetClass) === norm(selectedClassFilter) || norm(s.targetClass).includes(norm(selectedClassFilter)));
              const clsMaterials = teacherMaterials.filter(m => m.targetClass === 'SEMUA' || norm(m.targetClass) === norm(selectedClassFilter) || norm(m.targetClass).includes(norm(selectedClassFilter)));
              const clsExams = teacherExams.filter(e => e.targetClass === 'SEMUA' || norm(e.targetClass) === norm(selectedClassFilter) || norm(e.targetClass).includes(norm(selectedClassFilter)));
              const clsResults = teacherResults.filter(r => norm(r.className) === norm(selectedClassFilter));

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Class Sub-Navigation Tabs */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setClassDetailSubTab('students')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          classDetailSubTab === 'students'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Siswa ({clsStudents.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassDetailSubTab('syllabus')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          classDetailSubTab === 'syllabus'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>Silabus & RPP ({clsSyllabi.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassDetailSubTab('materials')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          classDetailSubTab === 'materials'
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Bahan Ajar ({clsMaterials.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassDetailSubTab('exams')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          classDetailSubTab === 'exams'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Paket Ujian ({clsExams.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassDetailSubTab('reports')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          classDetailSubTab === 'reports'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Nilai Siswa ({clsResults.length})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClassFilterChange('ALL')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      ← Kembali ke Semua Kelas
                    </button>
                  </div>

                  {/* Sub-tab 1: Siswa Kelas */}
                  {classDetailSubTab === 'students' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <div>
                          <h4 className="font-bold text-sm text-white">Daftar Siswa Kelas {selectedClassFilter}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Total {clsStudents.length} siswa terdaftar di rombel ini</p>
                        </div>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={classSearchQuery}
                            onChange={e => setClassSearchQuery(e.target.value)}
                            placeholder="Cari siswa di kelas ini..."
                            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 w-48 sm:w-60"
                          />
                        </div>
                      </div>

                      {filteredClsStudents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredClsStudents.map(st => {
                            const stResults = results.filter(r => r.studentNis === st.nis || r.studentName.toLowerCase() === st.name.toLowerCase());
                            const stAvg = stResults.length > 0
                              ? Math.round(stResults.reduce((a, b) => a + (b.score || 0), 0) / stResults.length)
                              : null;

                            return (
                              <div
                                key={st.id}
                                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                              >
                                <div className="flex items-start gap-3">
                                  <img
                                    src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                                    alt={st.name}
                                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/30 shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 justify-between">
                                      <h4 className="font-bold text-sm text-white truncate">{st.name}</h4>
                                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                                        {st.className}
                                      </span>
                                    </div>
                                    <p className="font-mono text-[11px] text-slate-400 mt-0.5">NIS: {st.nis}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{st.email || 'Email belum diisi'}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 text-xs border border-slate-800">
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Submit CBT:</span>
                                    <span className="font-bold text-white">{stResults.length} Ujian</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Rata-rata:</span>
                                    <span className={`font-mono font-bold ${
                                      stAvg === null ? 'text-slate-500' : stAvg >= 75 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                      {stAvg !== null ? `${stAvg} / 100` : '-'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setGradingStudent(st)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>+ Input Nilai</span>
                                  </button>

                                  {st.phone && (
                                    <a
                                      href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(st.name)},%20salam%20dari%20Bapak/Ibu%20Guru%20${encodeURIComponent(user.name)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all"
                                      title="Chat WhatsApp"
                                    >
                                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                          <Users className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">Tidak ada siswa yang ditemukan di kelas ini.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 2: Silabus & RPP */}
                  {classDetailSubTab === 'syllabus' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <div>
                          <h4 className="font-bold text-sm text-white">Silabus & RPP untuk Kelas {selectedClassFilter}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Topik dan materi ajar terdaftar pada kelas ini</p>
                        </div>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('syllabus')}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            Buka Manajemen Silabus
                          </button>
                        )}
                      </div>

                      {clsSyllabi.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {clsSyllabi.map(s => (
                            <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                                    Pertemuan ke-{s.meetingNumber || 1} • Semester {s.semester || 1}
                                  </span>
                                  <h4 className="font-bold text-white text-sm mt-0.5">{s.title}</h4>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {s.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2">{s.competencyStandard || s.description || 'Kompetensi Dasar belum diisi.'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                          <BookMarked className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">Belum ada silabus khusus untuk kelas ini.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: Bahan Ajar */}
                  {classDetailSubTab === 'materials' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <div>
                          <h4 className="font-bold text-sm text-white">Bahan Ajar & Media Pembelajaran</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Modul, slide, dan video untuk Kelas {selectedClassFilter}</p>
                        </div>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('materials')}
                            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            Kelola Semua Materi
                          </button>
                        )}
                      </div>

                      {clsMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {clsMaterials.map(m => (
                            <div key={m.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold uppercase">
                                    {m.mediaType}
                                  </span>
                                  <h4 className="font-bold text-white text-sm mt-1">{m.title}</h4>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2">{m.description || 'Tidak ada deskripsi.'}</p>
                              {m.url && (
                                <a
                                  href={m.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                                >
                                  <span>Buka Media Pembelajaran</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">Belum ada bahan ajar untuk kelas ini.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 4: Paket Ujian CBT */}
                  {classDetailSubTab === 'exams' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <div>
                          <h4 className="font-bold text-sm text-white">Paket Ujian CBT & LJK</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Ujian yang dijadwalkan untuk Kelas {selectedClassFilter}</p>
                        </div>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('exams')}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            Kelola Paket Ujian
                          </button>
                        )}
                      </div>

                      {clsExams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {clsExams.map(ex => (
                            <div key={ex.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                    {ex.category || 'CBT'}
                                  </span>
                                  <h4 className="font-bold text-white text-sm mt-1">{ex.title}</h4>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ex.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {ex.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>⏱ {ex.durationMinutes} Menit</span>
                                <span>📝 {ex.questions?.length || 0} Soal</span>
                                <span>🎯 KKM: {ex.passingScore || 75}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                          <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">Belum ada paket ujian untuk kelas ini.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 5: Rekap Nilai Siswa */}
                  {classDetailSubTab === 'reports' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <div>
                          <h4 className="font-bold text-sm text-white">Rekap Nilai Siswa Kelas {selectedClassFilter}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Riwayat hasil pengerjaan CBT di kelas ini</p>
                        </div>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('reports')}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            Buka Laporan Lengkap
                          </button>
                        )}
                      </div>

                      {clsResults.length > 0 ? (
                        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                              <tr>
                                <th className="p-3.5">Nama Siswa</th>
                                <th className="p-3.5">NIS</th>
                                <th className="p-3.5">Judul Ujian</th>
                                <th className="p-3.5 text-center">Nilai</th>
                                <th className="p-3.5 text-center">Status</th>
                                <th className="p-3.5 text-right">Waktu</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {clsResults.map(res => {
                                const isPassed = (res.score || 0) >= 75;
                                return (
                                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="p-3.5 font-bold text-white">{res.studentName}</td>
                                    <td className="p-3.5 font-mono text-slate-400">{res.studentNis}</td>
                                    <td className="p-3.5 text-slate-300">{res.examTitle}</td>
                                    <td className="p-3.5 text-center">
                                      <span className={`font-mono font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {res.score}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isPassed
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      }`}>
                                        {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-right text-slate-400 text-[11px]">{res.submittedAt}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                          <BarChart3 className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">Belum ada submit nilai ujian di kelas ini.</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })()
          )}
        </div>
      )}

      {/* TAB: SILABUS & RPP */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <SyllabusManagement
            syllabi={teacherSyllabi}
            classes={teacherFilteredClasses}
            subjects={teacherFilteredSubjects}
            teachers={teacherFilteredTeachers}
            materials={teacherMaterials}
            exams={teacherExams}
            onSaveSyllabus={onSaveSyllabus}
            onDeleteSyllabus={onDeleteSyllabus}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* TAB: BAHAN AJAR */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <MaterialManagement
            materials={teacherMaterials}
            classes={teacherFilteredClasses}
            subjects={teacherFilteredSubjects}
            syllabi={teacherSyllabi}
            onSaveMaterial={onSaveMaterial}
            onDeleteMaterial={onDeleteMaterial}
            onNavigateToSyllabus={() => {
              if (onNavigateTab) onNavigateTab('syllabus');
            }}
          />
        </div>
      )}

      {/* TAB: PAKET UJIAN & CBT */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <ExamManagement
            exams={teacherExams}
            classes={teacherFilteredClasses}
            categories={categories}
            onSaveExam={onSaveExam}
            onDeleteExam={onDeleteExam}
          />
        </div>
      )}

      {/* TAB: LAPORAN HASIL & NILAI */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <ExamReports
            results={teacherResults}
            classes={teacherFilteredClasses}
            categories={categories}
            onSaveResult={onSaveExamResult || (() => {})}
            onDeleteResult={onDeleteExamResult || (() => {})}
          />
        </div>
      )}

      {/* TAB: LAPORAN TRYOUT SISWA */}
      {activeTab === 'tryout_reports' && (
        <div className="space-y-4">
          <TryoutReports
            results={teacherResults}
            classes={teacherFilteredClasses}
            categories={categories}
            exams={exams}
            users={allUsers}
            currentUser={user}
            onSaveResult={onSaveExamResult}
            onDeleteResult={onDeleteExamResult}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* TAB: DAFTAR SISWA BINAAN & INPUT NILAI GURU */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          
          {/* Header Controls, KKM Settings & Filter */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <span>Daftar Siswa & Pengelolaan Nilai Akademik</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kelola nilai siswa, atur standar KKM mata pelajaran, dan analisis rekapan nilai dalam format tabel terpisah per kategori penilaian.
                </p>
              </div>

              {/* View Toggle (Matrix Table, Journal Table, Cards) */}
              <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStudentViewMode('matrix')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studentViewMode === 'matrix'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tabel Rekap Nilai per Kategori Penilaian"
                >
                  <TableProperties className="w-4 h-4" />
                  <span className="hidden sm:inline">Matriks Kategori</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentViewMode('journal')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studentViewMode === 'journal'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tabel Jurnal Seluruh Evaluasi & Penilaian"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Jurnal Nilai</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentViewMode('cards')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studentViewMode === 'cards'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Kartu Siswa"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Kartu Siswa</span>
                </button>
              </div>
            </div>

            {/* KKM (Kriteria Ketuntasan Minimal) Configuration Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">Standar KKM Guru:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-600 text-white font-mono font-black text-sm shadow-sm">
                      {teacherKkm}
                    </span>
                    <span className="text-[11px] text-purple-300 font-medium">
                      (Skala 0 - 100 • Mata Pelajaran: {teacherSubject})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Siswa dengan nilai &ge; {teacherKkm} dinyatakan <strong className="text-emerald-400">Tuntas KKM</strong>, sedangkan &lt; {teacherKkm} masuk status <strong className="text-rose-400">Perlu Remedial</strong>.
                  </p>
                </div>
              </div>

              {/* KKM Interactive Presets & Editor */}
              <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                {!isEditingKkm ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400">Pilih KKM:</span>
                    {[70, 75, 78, 80, 85].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSaveKkm(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          teacherKkm === val
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                        }`}
                        title={`Set KKM ${val}`}
                      >
                        {val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setTempKkm(teacherKkm);
                        setIsEditingKkm(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-1"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Ubah Kustom</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-purple-500/50">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={tempKkm}
                      onChange={e => setTempKkm(Math.min(100, Math.max(10, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-sm font-bold text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveKkm(tempKkm)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingKkm(false)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Total Siswa Binaan</span>
                <span className="text-lg font-black text-white">{assignedStudents.length} Siswa</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Sudah Dinilai</span>
                <span className="text-lg font-black text-purple-400">
                  {assignedStudents.filter(st => getStudentCategoryBreakdown(st).totalCount > 0).length} Siswa
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Rata-rata Kelas</span>
                <span className={`text-lg font-black font-mono ${avgScore >= teacherKkm ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {avgScore > 0 ? `${avgScore} / 100` : '-'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-emerald-400 block font-medium">Tuntas KKM (&ge;{teacherKkm})</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {assignedStudents.filter(st => {
                    const b = getStudentCategoryBreakdown(st);
                    return b.overallAvg !== null && b.overallAvg >= teacherKkm;
                  }).length} Siswa
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-rose-400 block font-medium">Remedial (&lt;{teacherKkm})</span>
                <span className="text-lg font-black text-rose-400 font-mono">
                  {assignedStudents.filter(st => {
                    const b = getStudentCategoryBreakdown(st);
                    return b.overallAvg !== null && b.overallAvg < teacherKkm;
                  }).length} Siswa
                </span>
              </div>
            </div>

            {/* Filter Bar with Search, Class, Assessment Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Cari nama, NIS, atau judul materi..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={studentClassFilter}
                  onChange={e => setStudentClassFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">Semua Kelas ({teacherClasses.length})</option>
                  {teacherClasses.map(cls => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={studentCategoryFilter}
                  onChange={e => setStudentCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-purple-500 cursor-pointer"
                >
                  {ASSESSMENT_CATEGORY_CONFIG.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={studentStatusFilter}
                  onChange={e => setStudentStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">Semua Status Penilaian</option>
                  <option value="PASSED">Tuntas KKM (&ge; {teacherKkm})</option>
                  <option value="REMEDIAL">Perlu Remedial (&lt; {teacherKkm})</option>
                  <option value="GRADED">Sudah Ada Nilai</option>
                  <option value="UNGRADED">Belum Dinilai</option>
                </select>
              </div>
            </div>

            {/* Class Quick Switcher Tabs / Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Pilih Tampilan Tabel:
              </span>
              <button
                type="button"
                onClick={() => setStudentClassFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  studentClassFilter === 'ALL'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Semua Kelas (Tabel Terpisah)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800/80 text-[10px] text-slate-300 font-mono">
                  {assignedStudents.length} Siswa
                </span>
              </button>

              {teacherAssignedClassesList.map(cls => {
                const countInClass = assignedStudents.filter(s => s.className === cls).length;
                const isSelected = studentClassFilter === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setStudentClassFilter(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    <span>Kelas {cls}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {countInClass} Siswa
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Category Filter Quick Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Filter Kategori:</span>
              {ASSESSMENT_CATEGORY_CONFIG.map(cat => {
                const isSelected = studentCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setStudentCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {cat.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIEW 1: MATRIX TABLE (Tabel Rekap Nilai Terpisah Berdasarkan Kelas) */}
          {filteredAssignedStudents.length > 0 && studentViewMode === 'matrix' && (
            <div className="space-y-6">
              {groupedStudentsByClass.map(([className, classStudents]) => {
                const classBreakdowns = classStudents.map(st => getStudentCategoryBreakdown(st));
                const classScores = classBreakdowns
                  .map(b => b.overallAvg)
                  .filter((v): v is number => v !== null);
                const classAvg = classScores.length > 0
                  ? Math.round(classScores.reduce((a, b) => a + b, 0) / classScores.length)
                  : null;
                const tuntasCount = classBreakdowns.filter(b => b.overallAvg !== null && b.overallAvg >= teacherKkm).length;
                const remedialCount = classBreakdowns.filter(b => b.overallAvg !== null && b.overallAvg < teacherKkm).length;
                const tuntasPercentage = classStudents.length > 0 ? Math.round((tuntasCount / classStudents.length) * 100) : 0;

                const getCatAvg = (catKey: 'tugas' | 'uh' | 'kuis' | 'pts' | 'pas' | 'praktik' | 'remedial') => {
                  const scores = classBreakdowns.map(b => b[catKey].avg).filter((v): v is number => v !== null);
                  if (scores.length === 0) return null;
                  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                };

                return (
                  <div
                    key={className}
                    className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-0"
                  >
                    {/* Class Table Header Banner */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-sm shadow-inner shrink-0">
                          {className.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-white tracking-tight">
                              Tabel Penilaian: Kelas {className}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-extrabold">
                              {classStudents.length} Siswa
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Mata Pelajaran: <strong className="text-slate-300">{teacherSubject}</strong> • Standar KKM: <strong className="text-purple-300 font-mono">{teacherKkm}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Class Quick KPIs & Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-400 text-[11px]">Rata-rata:</span>
                          <span className={`font-mono font-black ${
                            classAvg === null ? 'text-slate-500' : classAvg >= teacherKkm ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {classAvg !== null ? `${classAvg} / 100` : '-'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                          <span className="text-emerald-400 text-[11px]">Tuntas:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {tuntasCount} Siswa ({tuntasPercentage}%)
                          </span>
                        </div>

                        {remedialCount > 0 && (
                          <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                            <span className="text-rose-400 text-[11px]">Remedial:</span>
                            <span className="font-mono font-bold text-rose-400">{remedialCount} Siswa</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleExportClassCsv(className, classStudents)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          title={`Ekspor Rekap CSV Kelas ${className}`}
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>CSV</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPrintClass(className, classStudents)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          title={`Cetak Rekap Nilai Kelas ${className}`}
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-400" />
                          <span>Cetak Rekap</span>
                        </button>
                      </div>
                    </div>

                    {/* Matrix Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300 border-collapse">
                        <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 whitespace-nowrap">
                          <tr>
                            <th className="p-3 text-center w-12">No</th>
                            <th className="p-3 min-w-[200px]">Data Siswa</th>
                            <th className="p-3 text-center text-blue-300 bg-blue-950/20 border-x border-slate-800/60">
                              Tugas Harian
                            </th>
                            <th className="p-3 text-center text-cyan-300 bg-cyan-950/20 border-r border-slate-800/60">
                              Ulangan (UH)
                            </th>
                            <th className="p-3 text-center text-amber-300 bg-amber-950/20 border-r border-slate-800/60">
                              Kuis Singkat
                            </th>
                            <th className="p-3 text-center text-purple-300 bg-purple-950/20 border-r border-slate-800/60">
                              PTS
                            </th>
                            <th className="p-3 text-center text-rose-300 bg-rose-950/20 border-r border-slate-800/60">
                              PAS
                            </th>
                            <th className="p-3 text-center text-emerald-300 bg-emerald-950/20 border-r border-slate-800/60">
                              Praktik
                            </th>
                            <th className="p-3 text-center text-orange-300 bg-orange-950/20 border-r border-slate-800/60">
                              Remedial
                            </th>
                            <th className="p-3 text-center bg-slate-900 font-extrabold text-white border-r border-slate-800/60">
                              Rata-rata
                            </th>
                            <th className="p-3 text-center">Status KKM</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 whitespace-nowrap">
                          {classStudents.map((st, idx) => {
                            const breakdown = getStudentCategoryBreakdown(st);
                            const isPass = breakdown.overallAvg !== null && breakdown.overallAvg >= teacherKkm;

                            return (
                              <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                                      alt={st.name}
                                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                                    />
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-white block truncate max-w-[170px]">{st.name}</span>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-mono text-slate-400">NIS: {st.nis}</span>
                                        {st.group && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                                            {st.group}
                                          </span>
                                        )}
                                        {(st.whatsapp || st.phone) && (
                                          <a
                                            href={`https://wa.me/${(st.whatsapp || st.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 inline-flex items-center gap-0.5 hover:bg-emerald-900"
                                            title="Chat WhatsApp"
                                          >
                                            <MessageCircle className="w-2.5 h-2.5" />
                                            <span>{st.whatsapp || st.phone}</span>
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Tugas Harian */}
                                <td className="p-3 text-center border-x border-slate-800/60 bg-blue-950/10">
                                  {breakdown.tugas.avg !== null ? (
                                    <span className="font-mono font-bold text-blue-300">
                                      {breakdown.tugas.avg} <span className="text-[10px] text-blue-400/70 font-normal">({breakdown.tugas.count}x)</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* Ulangan Harian (UH) */}
                                <td className="p-3 text-center border-r border-slate-800/60 bg-cyan-950/10">
                                  {breakdown.uh.avg !== null ? (
                                    <span className="font-mono font-bold text-cyan-300">
                                      {breakdown.uh.avg} <span className="text-[10px] text-cyan-400/70 font-normal">({breakdown.uh.count}x)</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* Kuis Singkat */}
                                <td className="p-3 text-center border-r border-slate-800/60 bg-amber-950/10">
                                  {breakdown.kuis.avg !== null ? (
                                    <span className="font-mono font-bold text-amber-300">
                                      {breakdown.kuis.avg} <span className="text-[10px] text-amber-400/70 font-normal">({breakdown.kuis.count}x)</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* PTS */}
                                <td className="p-3 text-center border-r border-slate-800/60 bg-purple-950/10">
                                  {breakdown.pts.avg !== null ? (
                                    <span className="font-mono font-bold text-purple-300">
                                      {breakdown.pts.avg}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* PAS */}
                                <td className="p-3 text-center border-r border-slate-800/60 bg-rose-950/10">
                                  {breakdown.pas.avg !== null ? (
                                    <span className="font-mono font-bold text-rose-300">
                                      {breakdown.pas.avg}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* Praktik */}
                                <td className="p-3 text-center border-r border-slate-800/60 bg-emerald-950/10">
                                  {breakdown.praktik.avg !== null ? (
                                    <span className="font-mono font-bold text-emerald-300">
                                      {breakdown.praktik.avg}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* Remedial */}
                                <td className="p-3 text-center border-r border-slate-800/60 bg-orange-950/10">
                                  {breakdown.remedial.avg !== null ? (
                                    <span className="font-mono font-bold text-orange-300">
                                      {breakdown.remedial.avg}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>

                                {/* Rata-rata Akhir */}
                                <td className="p-3 text-center bg-slate-900/90 font-mono font-black text-sm border-r border-slate-800/60">
                                  <span className={
                                    breakdown.overallAvg === null
                                      ? 'text-slate-600'
                                      : isPass
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }>
                                    {breakdown.overallAvg !== null ? breakdown.overallAvg : '-'}
                                  </span>
                                </td>

                                {/* Status KKM */}
                                <td className="p-3 text-center">
                                  {breakdown.overallAvg === null ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                      Belum Dinilai
                                    </span>
                                  ) : (
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                      isPass
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    }`}>
                                      {isPass ? 'TUNTAS KKM' : 'REMEDIAL'}
                                    </span>
                                  )}
                                </td>

                                {/* Aksi */}
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setGradingStudent(st)}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>Input Nilai</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        {/* Class Summary Footer */}
                        <tfoot className="bg-slate-950/90 border-t-2 border-slate-800 text-xs font-bold whitespace-nowrap">
                          <tr>
                            <td colSpan={2} className="p-3 text-right text-slate-400 font-extrabold uppercase tracking-wider">
                              Rata-rata Kelas {className} :
                            </td>
                            <td className="p-3 text-center font-mono text-blue-300 bg-blue-950/30 border-x border-slate-800">
                              {getCatAvg('tugas') !== null ? getCatAvg('tugas') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono text-cyan-300 bg-cyan-950/30 border-r border-slate-800">
                              {getCatAvg('uh') !== null ? getCatAvg('uh') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono text-amber-300 bg-amber-950/30 border-r border-slate-800">
                              {getCatAvg('kuis') !== null ? getCatAvg('kuis') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono text-purple-300 bg-purple-950/30 border-r border-slate-800">
                              {getCatAvg('pts') !== null ? getCatAvg('pts') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono text-rose-300 bg-rose-950/30 border-r border-slate-800">
                              {getCatAvg('pas') !== null ? getCatAvg('pas') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono text-emerald-300 bg-emerald-950/30 border-r border-slate-800">
                              {getCatAvg('praktik') !== null ? getCatAvg('praktik') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono text-orange-300 bg-orange-950/30 border-r border-slate-800">
                              {getCatAvg('remedial') !== null ? getCatAvg('remedial') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono font-black text-sm bg-slate-900 border-r border-slate-800">
                              <span className={classAvg === null ? 'text-slate-500' : classAvg >= teacherKkm ? 'text-emerald-400' : 'text-rose-400'}>
                                {classAvg !== null ? classAvg : '-'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-[11px] font-extrabold text-emerald-400">
                                {tuntasPercentage}% TUNTAS
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenPrintClass(className, classStudents)}
                                className="text-[11px] text-purple-400 hover:text-purple-300 underline font-bold cursor-pointer"
                              >
                                Cetak Lembar
                              </button>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: JOURNAL TABLE (Tabel Jurnal Rinci Terpisah Berdasarkan Kelas) */}
          {studentViewMode === 'journal' && (
            <div className="space-y-6">
              {groupedJournalByClass.length > 0 ? (
                groupedJournalByClass.map(([className, classEntries]) => (
                  <div
                    key={className}
                    className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-0"
                  >
                    <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                          {className.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">Jurnal Nilai: Kelas {className}</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                              {classEntries.length} Entri Penilaian
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">Mata Pelajaran: {teacherSubject}</span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 whitespace-nowrap">
                          <tr>
                            <th className="p-3.5">Tanggal</th>
                            <th className="p-3.5">Siswa</th>
                            <th className="p-3.5">Judul Penilaian</th>
                            <th className="p-3.5">Kategori Penilaian</th>
                            <th className="p-3.5 text-center">Skor / KKM</th>
                            <th className="p-3.5 text-center">Status</th>
                            <th className="p-3.5">Catatan Guru</th>
                            <th className="p-3.5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {classEntries.map(res => {
                            const itemKkm = res.passingScore || teacherKkm;
                            const isPass = (res.score || 0) >= itemKkm;
                            const badgeStyle = getCategoryBadgeStyle(res.assessmentType || res.examCategory);
                            const matchedStudent = allUsers.find(
                              u => u.nis === res.studentNis || u.id === res.studentId || u.name.toLowerCase() === res.studentName.toLowerCase()
                            );

                            return (
                              <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                  {res.submittedAt || '-'}
                                </td>
                                <td className="p-3.5">
                                  <div>
                                    <span className="font-bold text-white block">{res.studentName}</span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                      <span>NIS: {res.studentNis || '-'}</span>
                                      {matchedStudent?.group && (
                                        <span className="text-[9px] font-sans px-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                          {matchedStudent.group}
                                        </span>
                                      )}
                                      {(matchedStudent?.whatsapp || matchedStudent?.phone) && (
                                        <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                          WA: {matchedStudent.whatsapp || matchedStudent.phone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 font-semibold text-white max-w-xs truncate">
                                  {res.examTitle}
                                </td>
                                <td className="p-3.5 whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeStyle.color}`}>
                                    {res.assessmentType || res.examCategory || 'Tugas Harian'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center whitespace-nowrap font-mono">
                                  <span className={`font-black text-sm ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {res.score}
                                  </span>
                                  <span className="text-[10px] text-slate-500"> / KKM {itemKkm}</span>
                                </td>
                                <td className="p-3.5 text-center whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                    isPass
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  }`}>
                                    {isPass ? 'TUNTAS' : 'REMEDIAL'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate italic">
                                  {res.teacherFeedback || '-'}
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {matchedStudent && (
                                      <button
                                        type="button"
                                        onClick={() => setGradingStudent(matchedStudent)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white transition-colors"
                                        title="Buka Form Kelola Siswa"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Hapus nilai "${res.examTitle}" untuk ${res.studentName}?`)) {
                                          handleDeleteGrade(res.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                                      title="Hapus Nilai"
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
                ))
              ) : (
                <div className="p-12 text-center space-y-2 rounded-3xl bg-slate-900 border border-slate-800">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Tidak ada data jurnal nilai yang sesuai dengan filter.</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: CARD VIEW (Tampilan Kartu Siswa Terpisah Berdasarkan Kelas) */}
          {filteredAssignedStudents.length > 0 && studentViewMode === 'cards' && (
            <div className="space-y-6">
              {groupedStudentsByClass.map(([className, classStudents]) => (
                <div key={className} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                        {className.substring(0, 3).toUpperCase()}
                      </div>
                      <h3 className="font-extrabold text-sm text-white">Kelas {className}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-extrabold">
                        {classStudents.length} Siswa
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenPrintClass(className, classStudents)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-400" />
                      <span>Cetak Rekap Kelas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classStudents.map(st => {
                      const breakdown = getStudentCategoryBreakdown(st);
                      const isPass = breakdown.overallAvg !== null && breakdown.overallAvg >= teacherKkm;
                      const latestResult = breakdown.stResults.length > 0 ? breakdown.stResults[breakdown.stResults.length - 1] : null;

                      return (
                        <div
                          key={st.id}
                          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all space-y-4 shadow-lg flex flex-col justify-between group"
                        >
                          <div className="space-y-3">
                            {/* Header Avatar & Info */}
                            <div className="flex items-start gap-3">
                              <img
                                src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                                alt={st.name}
                                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 justify-between">
                                  <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                                    {st.name}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-extrabold shrink-0">
                                    {st.className}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="font-mono text-[11px] text-slate-400">NIS: {st.nis}</p>
                                  {st.group && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 truncate">
                                      {st.group}
                                    </span>
                                  )}
                                </div>
                                {(st.whatsapp || st.phone) ? (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <a
                                      href={`https://wa.me/${(st.whatsapp || st.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-800/50 transition-colors"
                                      title="Kirim pesan WhatsApp"
                                    >
                                      <MessageCircle className="w-3 h-3" />
                                      <span>{st.whatsapp || st.phone}</span>
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{st.email || 'Email belum diisi'}</p>
                                )}
                              </div>
                            </div>

                            {/* Performance KPIs */}
                            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 text-xs border border-slate-800">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Total Penilaian:</span>
                                <span className="font-bold text-white">{breakdown.totalCount} Nilai</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Rata-rata (KKM {teacherKkm}):</span>
                                <span className={`font-mono font-black ${
                                  breakdown.overallAvg === null ? 'text-slate-500' : isPass ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {breakdown.overallAvg !== null ? `${breakdown.overallAvg} / 100` : '-'}
                                </span>
                              </div>
                            </div>

                            {/* Category Breakdown Chips */}
                            <div className="grid grid-cols-3 gap-1 text-[10px] pt-1">
                              <div className="p-1.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-center">
                                <span className="text-blue-400 block text-[9px]">Tugas</span>
                                <span className="font-bold text-blue-300 font-mono">{breakdown.tugas.avg ?? '-'}</span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-cyan-950/20 border border-cyan-900/30 text-center">
                                <span className="text-cyan-400 block text-[9px]">UH</span>
                                <span className="font-bold text-cyan-300 font-mono">{breakdown.uh.avg ?? '-'}</span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-center">
                                <span className="text-amber-400 block text-[9px]">Kuis</span>
                                <span className="font-bold text-amber-300 font-mono">{breakdown.kuis.avg ?? '-'}</span>
                              </div>
                            </div>

                            {/* Latest Grade Snippet */}
                            {latestResult && (
                              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-purple-300 font-semibold">
                                  <span>Evaluasi Terakhir:</span>
                                  <span className="font-mono">{latestResult.score} / 100</span>
                                </div>
                                <p className="text-white font-medium truncate text-[11px]">
                                  {latestResult.examTitle}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => setGradingStudent(st)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                            >
                              <GraduationCap className="w-4 h-4" />
                              <span>+ Input / Kelola Nilai</span>
                            </button>

                            {st.phone && (
                              <a
                                href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(st.name)},%20salam%20dari%20Bapak/Ibu%20Guru%20${encodeURIComponent(user.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all"
                                title="Chat WhatsApp Siswa"
                              >
                                <MessageCircle className="w-4 h-4 text-emerald-400" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAssignedStudents.length === 0 && (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-sm">Tidak Ada Siswa yang Sesuai</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian, filter kelas, filter kategori penilaian, atau status kelulusan KKM siswa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStudentSearch('');
                  setStudentClassFilter('ALL');
                  setStudentCategoryFilter('ALL');
                  setStudentStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <MarketplaceManagement
            products={products}
            categories={[]}
            onSaveProduct={() => {}}
            onDeleteProduct={() => {}}
            onSaveCategory={() => {}}
            onDeleteCategory={() => {}}
          />
        </div>
      )}

      {/* STUDENT GRADING & EVALUATION MODAL */}
      {gradingStudent && (
        <StudentGradingModal
          student={gradingStudent}
          teacherUser={user}
          teacherSubject={teacherSubject}
          syllabi={teacherSyllabi}
          allResults={results}
          isOpen={!!gradingStudent}
          onClose={() => setGradingStudent(null)}
          onSaveGrade={handleSaveGrade}
          onDeleteGrade={handleDeleteGrade}
          defaultKkm={teacherKkm}
        />
      )}

      {/* CLASS PRINT & EXPORT RECAP MODAL */}
      {printClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Action Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Pratinjau Cetak Lembar Rekapitulasi Nilai
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kelas: <strong className="text-purple-300">{printClassModal.className}</strong> • Mata Pelajaran: <strong className="text-white">{teacherSubject}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportClassCsv(printClassModal.className, printClassModal.students)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Unduh CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen (Print)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintClassModal(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Paper */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-950/40">
              <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl space-y-6 max-w-4xl mx-auto font-sans text-xs border border-slate-200 print:p-0 print:border-none print:shadow-none">
                
                {/* School Letterhead (Kop Surat) */}
                <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                    KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                  </h2>
                  <h1 className="text-base sm:text-lg font-black uppercase text-slate-950">
                    LEMBAR REKAPITULASI PENILAIAN HASIL BELAJAR SISWA
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Tahun Pelajaran 2025/2026 • Semester Genap • Kurikulum Merdeka
                  </p>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Mata Pelajaran</span>
                    <span className="font-extrabold text-slate-900">{teacherSubject}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Kelas / Rombel</span>
                    <span className="font-extrabold text-purple-900">Kelas {printClassModal.className}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Guru Pengampu</span>
                    <span className="font-extrabold text-slate-900">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Standar KKM Acuan</span>
                    <span className="font-black text-rose-700 font-mono text-sm">{teacherKkm}</span>
                  </div>
                </div>

                {/* Scores Ledger Table */}
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <tr>
                        <th className="p-2.5 text-center border-r border-slate-300 w-10">No</th>
                        <th className="p-2.5 border-r border-slate-300 min-w-[140px]">Nama Lengkap</th>
                        <th className="p-2.5 text-center border-r border-slate-300 w-24">NIS</th>
                        <th className="p-2.5 text-center border-r border-slate-300 min-w-[100px]">Kelompok</th>
                        <th className="p-2.5 text-center border-r border-slate-300 min-w-[100px]">Nomor WA</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-blue-50/50">Tugas</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-cyan-50/50">UH</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-amber-50/50">Kuis</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-purple-50/50">PTS</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-rose-50/50">PAS</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-emerald-50/50">Praktik</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-orange-50/50">Remedial</th>
                        <th className="p-2 text-center border-r border-slate-300 bg-slate-200 font-black">Rerata</th>
                        <th className="p-2.5 text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {printClassModal.students.map((st, idx) => {
                        const b = getStudentCategoryBreakdown(st);
                        const isPass = b.overallAvg !== null && b.overallAvg >= teacherKkm;

                        return (
                          <tr key={st.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                            <td className="p-2 text-center border-r border-slate-200 font-mono text-slate-500">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-200 font-semibold">{st.name}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-600">{st.nis || '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 text-[11px] text-purple-900 font-semibold">{st.group || '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-700">{st.whatsapp || st.phone || '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.tugas.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.uh.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.kuis.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.pts.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.pas.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.praktik.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono">{b.remedial.avg ?? '-'}</td>
                            <td className="p-2 text-center border-r border-slate-200 font-mono font-black text-sm bg-slate-100/60">
                              <span className={b.overallAvg === null ? 'text-slate-400' : isPass ? 'text-emerald-700' : 'text-rose-700'}>
                                {b.overallAvg ?? '-'}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              {b.overallAvg === null ? (
                                <span className="text-[10px] text-slate-400 font-medium">Belum Dinilai</span>
                              ) : isPass ? (
                                <span className="font-extrabold text-emerald-700 text-[11px]">TUNTAS</span>
                              ) : (
                                <span className="font-extrabold text-rose-700 text-[11px]">REMEDIAL</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Class Stats Summary Box */}
                {(() => {
                  const breakdowns = printClassModal.students.map(st => getStudentCategoryBreakdown(st));
                  const scores = breakdowns.map(b => b.overallAvg).filter((v): v is number => v !== null);
                  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '-';
                  const max = scores.length > 0 ? Math.max(...scores) : '-';
                  const min = scores.length > 0 ? Math.min(...scores) : '-';
                  const tuntas = breakdowns.filter(b => b.overallAvg !== null && b.overallAvg >= teacherKkm).length;
                  const tuntasPct = printClassModal.students.length > 0 ? Math.round((tuntas / printClassModal.students.length) * 100) : 0;

                  return (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">Total Siswa</span>
                        <span className="font-extrabold text-slate-900">{printClassModal.students.length} Siswa</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">Rata-rata Kelas</span>
                        <span className="font-extrabold text-purple-900 font-mono text-sm">{avg}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">Nilai Tertinggi</span>
                        <span className="font-extrabold text-emerald-700 font-mono text-sm">{max}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">Nilai Terendah</span>
                        <span className="font-extrabold text-rose-700 font-mono text-sm">{min}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold">Kelulusan KKM</span>
                        <span className="font-extrabold text-emerald-700">{tuntas} ({tuntasPct}%)</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Formal Signatures Block */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-16">
                    <p className="text-slate-600">
                      Mengetahui,<br />
                      <strong>Wali Kelas / Kepala Sekolah</strong>
                    </p>
                    <div>
                      <p className="font-extrabold text-slate-900 underline">....................................................</p>
                      <p className="text-[10px] text-slate-500">NIP. ....................................</p>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <p className="text-slate-600">
                      Kota, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                      <strong>Guru Mata Pelajaran</strong>
                    </p>
                    <div>
                      <p className="font-extrabold text-slate-900 underline">{user.name}</p>
                      <p className="text-[10px] text-slate-500">NIP. {user.nip || '....................................'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
