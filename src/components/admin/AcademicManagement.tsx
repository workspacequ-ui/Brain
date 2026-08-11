import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Teacher,
  ClassItem,
  SubjectItem,
  ExamCategory,
  SyllabusItem,
  LearningMaterial,
  Exam,
  ExamResult
} from '../../types';
import {
  School,
  Calendar,
  Layers,
  BookOpen,
  FileCheck2,
  BarChart3,
  Users,
  GraduationCap,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  BookMarked,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarCheck,
  CalendarDays,
  UserCheck,
  X,
  Edit2,
  Trash2,
  Megaphone,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { DashboardCalendarAgendaPengumuman } from '../common/DashboardCalendarAgendaPengumuman';

export interface ScheduleItem {
  id: string;
  day: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU';
  timeStart: string; // e.g. "07:30"
  timeEnd: string;   // e.g. "09:00"
  subject: string;
  className: string;
  teacherName: string;
  room: string;
  notes?: string;
}

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    day: 'SENIN',
    timeStart: '07:30',
    timeEnd: '09:00',
    subject: 'Matematika & TPS Kuantitatif',
    className: 'XII-UTBK',
    teacherName: 'Drs. Hendra Setiawan, M.Pd',
    room: 'Ruang Teori 12-A',
    notes: 'Pembahasan Aljabar & TPA Lanjutan'
  },
  {
    id: 'sch-2',
    day: 'SENIN',
    timeStart: '09:15',
    timeEnd: '10:45',
    subject: 'Fisika & Penalaran Sains',
    className: 'XII-UTBK',
    teacherName: 'Bambang Sudrajat, M.Si',
    room: 'Lab Fisika CBT',
    notes: 'Simulasi Gelombang & Optik'
  },
  {
    id: 'sch-3',
    day: 'SENIN',
    timeStart: '11:00',
    timeEnd: '12:30',
    subject: 'Biologi & Ilmu Hayati',
    className: 'XI-IPA',
    teacherName: 'Nurul Hidayah, S.Pd',
    room: 'Lab Biologi Terpadu',
    notes: 'Materi Genetika & Mutasi'
  },
  {
    id: 'sch-4',
    day: 'SELASA',
    timeStart: '07:30',
    timeEnd: '09:00',
    subject: 'Kimia & Reaksi Senyawa',
    className: 'XII-UTBK',
    teacherName: 'Siti Aminah, M.Pd',
    room: 'Lab Kimia Terpadu',
    notes: 'Stoikiometri & Larutan Asam Basa'
  },
  {
    id: 'sch-5',
    day: 'SELASA',
    timeStart: '09:15',
    timeEnd: '10:45',
    subject: 'Literasi Bahasa Inggris & SNBT',
    className: 'XI-IPA',
    teacherName: 'Rina Kusuma, S.Pd',
    room: 'Ruang Multimedia 1',
    notes: 'Reading Comprehension & Inference'
  },
  {
    id: 'sch-6',
    day: 'SELASA',
    timeStart: '11:00',
    timeEnd: '12:30',
    subject: 'Bahasa Indonesia & Literasi Teks',
    className: 'X-IPA',
    teacherName: 'Ahmad Fauzi, M.Hum',
    room: 'Ruang 10-A',
    notes: 'Analisis Paragraf HOTS'
  },
  {
    id: 'sch-7',
    day: 'RABU',
    timeStart: '07:30',
    timeEnd: '09:00',
    subject: 'Penalaran Umum & Logika Deduktif',
    className: 'XII-UTBK',
    teacherName: 'Drs. Hendra Setiawan, M.Pd',
    room: 'Ruang CBT Utama',
    notes: 'Latihan Silogisme & Analitik'
  },
  {
    id: 'sch-8',
    day: 'RABU',
    timeStart: '09:15',
    timeEnd: '10:45',
    subject: 'Fisika & Penalaran Sains',
    className: 'XI-IPA',
    teacherName: 'Bambang Sudrajat, M.Si',
    room: 'Lab Fisika CBT',
    notes: 'Mekanika & Gravitasi'
  },
  {
    id: 'sch-9',
    day: 'KAMIS',
    timeStart: '08:00',
    timeEnd: '10:00',
    subject: 'Tryout CBT Berkala UTBK-SNBT',
    className: 'XII-UTBK',
    teacherName: 'Tim Penguji Akademik',
    room: 'Lab Komputer CBT',
    notes: 'Simulasi Waktu Nyata CBT Engine'
  },
  {
    id: 'sch-10',
    day: 'KAMIS',
    timeStart: '10:30',
    timeEnd: '12:00',
    subject: 'Ekonomi & Akuntansi Soshum',
    className: 'XI-IPA',
    teacherName: 'Dewi Lestari, S.E., M.Ak',
    room: 'Ruang Teori 11-B',
    notes: 'Mekanisme Pasar & Kebijakan Fiskal'
  },
  {
    id: 'sch-11',
    day: 'JUMAT',
    timeStart: '07:30',
    timeEnd: '09:00',
    subject: 'Bimbingan Konseling & Rasionalisasi PTN',
    className: 'XII-UTBK',
    teacherName: 'Dra. Endang Sulistyowati, M.Psi',
    room: 'Ruang Konsultasi Akademik',
    notes: 'Pemilihan Jurusan & Analisis Daya Tampung SNBP/SNBT'
  },
  {
    id: 'sch-12',
    day: 'SABTU',
    timeStart: '08:00',
    timeEnd: '11:00',
    subject: 'Klinik Belajar & Bedah Soal HOTS',
    className: 'SEMUA',
    teacherName: 'Master Teacher Konsorsium',
    room: 'Auditorium & Live Stream',
    notes: 'Sesi Khusus Remedial & Pengayaan Terbuka'
  }
];

interface AcademicManagementProps {
  user: User;
  classes: ClassItem[];
  subjects: SubjectItem[];
  categories: ExamCategory[];
  teachers: Teacher[];
  syllabi: SyllabusItem[];
  materials: LearningMaterial[];
  exams: Exam[];
  results: ExamResult[];
  users: User[];
  onNavigateTab: (tab: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AcademicManagement: React.FC<AcademicManagementProps> = ({
  user,
  classes,
  subjects,
  categories,
  teachers,
  syllabi,
  materials,
  exams,
  results,
  users,
  onNavigateTab,
  onShowToast
}) => {
  // Active internal tab within Academic View
  const [academicTab, setAcademicTab] = useState<'calendar' | 'schedules' | 'teachers_load' | 'kkm' | 'circulars'>('calendar');

  // Academic Year & Semester State
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [activeSemester, setActiveSemester] = useState<'Ganjil' | 'Genap'>('Genap');

  // Schedules state with localStorage persistence
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('brain_space_academic_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SCHEDULES;
  });

  // Save schedules on change
  useEffect(() => {
    try {
      localStorage.setItem('brain_space_academic_schedules', JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to save academic schedules', e);
    }
  }, [schedules]);

  // Schedule Filters
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [scheduleSearch, setScheduleSearch] = useState<string>('');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formDay, setFormDay] = useState<ScheduleItem['day']>('SENIN');
  const [formTimeStart, setFormTimeStart] = useState('07:30');
  const [formTimeEnd, setFormTimeEnd] = useState('09:00');
  const [formSubject, setFormSubject] = useState(subjects[0]?.name || 'Matematika & TPS Kuantitatif');
  const [formClass, setFormClass] = useState(classes[0]?.name || 'XII-UTBK');
  const [formTeacher, setFormTeacher] = useState(teachers[0]?.name || 'Drs. Hendra Setiawan, M.Pd');
  const [formRoom, setFormRoom] = useState('Ruang Kelas');
  const [formNotes, setFormNotes] = useState('');

  // KKM & Standard Mastery State (stored in localStorage)
  const [kkmList, setKkmList] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('brain_space_kkm_standards');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      'Matematika & TPS Kuantitatif': 78,
      'Fisika & Penalaran Sains': 75,
      'Kimia & Reaksi Senyawa': 75,
      'Biologi & Ilmu Hayati': 76,
      'Literasi Bahasa Inggris & SNBT': 80,
      'Bahasa Indonesia & Literasi Teks': 80,
      'Penalaran Umum & Logika Deduktif': 82,
      'Ekonomi & Akuntansi Soshum': 76,
      'Geografi & Dinamika Geosfer': 75,
      'Sosiologi & Masalah Sosial': 78
    };
  });

  const handleUpdateKkm = (subjectName: string, value: number) => {
    const updated = { ...kkmList, [subjectName]: value };
    setKkmList(updated);
    try {
      localStorage.setItem('brain_space_kkm_standards', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (onShowToast) onShowToast(`Nilai KKM untuk ${subjectName} disetel ke ${value}`, 'info');
  };

  // Filtered schedules computation
  const filteredSchedules = useMemo(() => {
    return schedules.filter(sch => {
      if (selectedDayFilter !== 'ALL' && sch.day !== selectedDayFilter) return false;
      if (selectedClassFilter !== 'ALL' && sch.className !== selectedClassFilter && sch.className !== 'SEMUA') return false;
      if (scheduleSearch.trim()) {
        const q = scheduleSearch.toLowerCase();
        const matchSub = sch.subject.toLowerCase().includes(q);
        const matchTch = sch.teacherName.toLowerCase().includes(q);
        const matchCls = sch.className.toLowerCase().includes(q);
        const matchRm = sch.room.toLowerCase().includes(q);
        if (!matchSub && !matchTch && !matchCls && !matchRm) return false;
      }
      return true;
    });
  }, [schedules, selectedDayFilter, selectedClassFilter, scheduleSearch]);

  // Handler for opening add/edit schedule
  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setFormDay('SENIN');
    setFormTimeStart('07:30');
    setFormTimeEnd('09:00');
    setFormSubject(subjects[0]?.name || 'Matematika & TPS Kuantitatif');
    setFormClass(classes[0]?.name || 'XII-UTBK');
    setFormTeacher(teachers[0]?.name || 'Drs. Hendra Setiawan, M.Pd');
    setFormRoom('Ruang Teori CBT');
    setFormNotes('');
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (sch: ScheduleItem) => {
    setEditingSchedule(sch);
    setFormDay(sch.day);
    setFormTimeStart(sch.timeStart);
    setFormTimeEnd(sch.timeEnd);
    setFormSubject(sch.subject);
    setFormClass(sch.className);
    setFormTeacher(sch.teacherName);
    setFormRoom(sch.room);
    setFormNotes(sch.notes || '');
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      setSchedules(prev =>
        prev.map(item =>
          item.id === editingSchedule.id
            ? {
                ...item,
                day: formDay,
                timeStart: formTimeStart,
                timeEnd: formTimeEnd,
                subject: formSubject,
                className: formClass,
                teacherName: formTeacher,
                room: formRoom,
                notes: formNotes.trim() || undefined
              }
            : item
        )
      );
      if (onShowToast) onShowToast('Jadwal KBM berhasil diperbarui!', 'success');
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        day: formDay,
        timeStart: formTimeStart,
        timeEnd: formTimeEnd,
        subject: formSubject,
        className: formClass,
        teacherName: formTeacher,
        room: formRoom,
        notes: formNotes.trim() || undefined
      };
      setSchedules(prev => [...prev, newItem]);
      if (onShowToast) onShowToast('Jadwal KBM baru berhasil ditambahkan!', 'success');
    }
    setIsScheduleModalOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('Hapus jadwal pelajaran ini?')) {
      setSchedules(prev => prev.filter(i => i.id !== id));
      if (onShowToast) onShowToast('Jadwal pelajaran dihapus!', 'info');
    }
  };

  // Teachers load analysis calculations
  const teachersLoadData = useMemo(() => {
    return teachers.map(t => {
      const tSchedules = schedules.filter(s => s.teacherName.toLowerCase().includes(t.name.toLowerCase()));
      const tSyllabi = syllabi.filter(s => s.teacherId === t.id || s.teacherName?.toLowerCase().includes(t.name.toLowerCase()) || s.subject.toLowerCase() === t.subject.toLowerCase());
      const tMaterials = materials.filter(m => m.subject?.toLowerCase() === t.subject.toLowerCase());
      const tExams = exams.filter(e => e.subject?.toLowerCase() === t.subject.toLowerCase() || e.createdBy === t.name);

      // Estimated JTM (Jam Tatap Muka)
      const hoursCount = tSchedules.length * 2; // approx 2 JP per slot

      return {
        teacher: t,
        schedulesCount: tSchedules.length,
        hoursCount,
        syllabiCount: tSyllabi.length,
        materialsCount: tMaterials.length,
        examsCount: tExams.length,
        completeness: Math.min(100, Math.round(((tSyllabi.length > 0 ? 40 : 0) + (tMaterials.length > 0 ? 30 : 0) + (tExams.length > 0 ? 30 : 0))))
      };
    });
  }, [teachers, schedules, syllabi, materials, exams]);

  // Active students count
  const activeStudentsCount = useMemo(() => {
    return users.filter(u => u.role === 'student' && u.status === 'ACTIVE').length;
  }, [users]);

  // Print schedule handler
  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 
        ========================================================================
        HEADER: PUSAT MANAJEMEN & LAYANAN AKADEMIK
        ========================================================================
      */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Pusat Manajemen & Layanan Akademik
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TA {academicYear} • Semester {activeSemester}</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Sentral kendali kurikulum, kalender pendidikan terpadu, alokasi jadwal KBM harian, beban mengajar guru, dan standar ketuntasan belajar siswa.
              </p>
            </div>
          </div>

          {/* Quick Academic Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handlePrintSchedule()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Cetak Jadwal & Rekap Akademik"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Cetak Rekap</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddSchedule}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal KBM</span>
            </button>
          </div>
        </div>

        {/* 
          KPI SUMMARY CARDS
        */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div
            onClick={() => onNavigateTab('classes')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Kelas & Rombel</span>
              <Layers className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{classes.length}</span>
              <span className="text-[11px] text-blue-400 font-bold">Rombel Aktif</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Kelola Kelas & Mapel</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-400" />
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('teachers')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Guru Pengampu</span>
              <GraduationCap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{teachers.length}</span>
              <span className="text-[11px] text-amber-400 font-bold">Pendidik Binaan</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Beban & Alokasi Mengajar</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('syllabus')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Silabus & Materi</span>
              <BookMarked className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{syllabi.length + materials.length}</span>
              <span className="text-[11px] text-emerald-400 font-bold">Modul Pembelajaran</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Perencanaan Kurikulum</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('exams')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Paket Ujian CBT</span>
              <FileCheck2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{exams.length}</span>
              <span className="text-[11px] text-cyan-400 font-bold">Bank Soal & Tryout</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Evaluasi & Nilai Siswa</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-400" />
            </p>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        NAVIGATION TABS WITHIN AKADEMIK VIEW
        ========================================================================
      */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setAcademicTab('calendar')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              academicTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Kalender & Agenda Pendidikan</span>
          </button>

          <button
            type="button"
            onClick={() => setAcademicTab('schedules')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              academicTab === 'schedules'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Jadwal KBM & Alokasi Kelas ({schedules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAcademicTab('teachers_load')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              academicTab === 'teachers_load'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Beban Mengajar Guru ({teachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAcademicTab('kkm')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              academicTab === 'kkm'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Standar KKM & Ketuntasan</span>
          </button>
        </div>

        {/* Quick Nav Shortcut Dropdown to Other Admin Tabs */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-semibold">Aksi Cepat:</span>
          <button
            type="button"
            onClick={() => onNavigateTab('classes')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-400 text-xs font-semibold border border-slate-800 transition-colors"
          >
            + Kelas & Mapel
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('syllabus')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-semibold border border-slate-800 transition-colors"
          >
            + Silabus RPP
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('exams')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold border border-slate-800 transition-colors"
          >
            + Bank Ujian
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        TAB 1: KALENDER & AGENDA PENDIDIKAN
        ========================================================================
      */}
      {academicTab === 'calendar' && (
        <div className="space-y-6">
          <DashboardCalendarAgendaPengumuman
            user={user}
            onNavigateTab={onNavigateTab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* 
        ========================================================================
        TAB 2: JADWAL KBM & ALOKASI KELAS
        ========================================================================
      */}
      {academicTab === 'schedules' && (
        <div className="space-y-5">
          {/* Filters and Controls */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Day filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                {['ALL', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDayFilter(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedDayFilter === day
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {day === 'ALL' ? 'Semua Hari' : day}
                  </button>
                ))}
              </div>

              {/* Class Filter Select */}
              <div className="relative">
                <select
                  value={selectedClassFilter}
                  onChange={e => setSelectedClassFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="ALL">Semua Kelas ({classes.length} Rombel)</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>
                      Kelas {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari mapel, guru, kelas..."
                  value={scheduleSearch}
                  onChange={e => setScheduleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddSchedule}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Schedule Table / Cards */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  Matriks Jadwal Kegiatan Belajar Mengajar (KBM)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Ditemukan <strong className="text-white">{filteredSchedules.length}</strong> jadwal tatap muka
              </span>
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Clock className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">Tidak ada jadwal KBM yang sesuai filter</p>
                <p className="text-xs text-slate-600 mt-1">Coba sesuaikan pilihan hari atau kata kunci pencarian</p>
                <button
                  type="button"
                  onClick={handleOpenAddSchedule}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Jadwal Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Hari & Jam</th>
                      <th className="px-4 py-3">Mata Pelajaran</th>
                      <th className="px-4 py-3">Kelas / Rombel</th>
                      <th className="px-4 py-3">Guru Pengampu</th>
                      <th className="px-4 py-3">Ruangan & Lab</th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredSchedules.map(sch => (
                      <tr key={sch.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                              {sch.day}
                            </span>
                            <span className="text-white font-mono font-bold">
                              {sch.timeStart} - {sch.timeEnd}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                          {sch.subject}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
                            {sch.className}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-200 font-semibold whitespace-nowrap">
                          {sch.teacherName}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {sch.room}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">
                          {sch.notes || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSchedule(sch)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/50 transition-colors cursor-pointer"
                              title="Edit Jadwal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(sch.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        TAB 3: BEBAN MENGAJAR & KELENGKAPAN GURU
        ========================================================================
      */}
      {academicTab === 'teachers_load' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <span>Matriks Distribusi Beban Mengajar & Kelengkapan Perangkat Guru</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitoring alokasi jam tatap muka mingguan, kelengkapan silabus/RPP, materi, dan pembuatan bank ujian.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('teachers')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-all self-start sm:self-auto cursor-pointer"
              >
                + Kelola Data Guru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Nama Guru & NIP</th>
                    <th className="px-4 py-3.5">Mata Pelajaran</th>
                    <th className="px-4 py-3.5">Kelas Binaan</th>
                    <th className="px-4 py-3.5 text-center">JTM / Minggu</th>
                    <th className="px-4 py-3.5 text-center">Silabus</th>
                    <th className="px-4 py-3.5 text-center">Materi</th>
                    <th className="px-4 py-3.5 text-center">Bank Soal</th>
                    <th className="px-4 py-3.5">Status Kesiapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teachersLoadData.map(({ teacher, schedulesCount, hoursCount, syllabiCount, materialsCount, examsCount, completeness }) => (
                    <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{teacher.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {teacher.nip || '-'}</div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-blue-400">
                        {teacher.subject}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {teacher.targetClasses && teacher.targetClasses.length > 0 ? (
                            teacher.targetClasses.map(c => (
                              <span key={c} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-950 text-blue-300 border border-blue-800">
                          {hoursCount} JP ({schedulesCount} Sesi)
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-white">
                        {syllabiCount > 0 ? (
                          <span className="text-emerald-400 font-bold">{syllabiCount} RPP</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-white">
                        {materialsCount > 0 ? (
                          <span className="text-cyan-400 font-bold">{materialsCount} Modul</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-white">
                        {examsCount > 0 ? (
                          <span className="text-amber-400 font-bold">{examsCount} Paket</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1 w-32">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Kesiapan:</span>
                            <span className={`font-black ${completeness >= 80 ? 'text-emerald-400' : completeness >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {completeness}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${completeness}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        TAB 4: STANDAR KKM & KETUNTASAN
        ========================================================================
      */}
      {academicTab === 'kkm' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                  <span>Kriteria Ketuntasan Minimal (KKM) & Bobot Penilaian Akademik</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Standar batas kelulusan nilai rapor dan bobot penilaian berbasis CBT & Tugas Mandiri.
                </p>
              </div>

              {/* Predikat Grading Scales Guide */}
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">Predikat:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">A (90-100)</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold">B (80-89)</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">C (70-79)</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">D (&lt;70)</span>
              </div>
            </div>

            {/* KKM Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(sub => {
                const currentKkm = kkmList[sub.name] || 75;
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sub.name}</span>
                        {sub.code && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            {sub.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kelompok: {sub.group || 'Umum & Saintek'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-medium">KKM:</span>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={currentKkm}
                        onChange={e => handleUpdateKkm(sub.name, Number(e.target.value))}
                        className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-black text-cyan-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Weights Configuration */}
            <div className="pt-5 border-t border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Komposisi Bobot Nilai Akhir Semester
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Tugas & Kuis Harian</span>
                  <div className="text-xl font-black text-white mt-1">20%</div>
                  <span className="text-[10px] text-emerald-400">Formatif</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Penilaian Tengah Semester (PTS)</span>
                  <div className="text-xl font-black text-white mt-1">25%</div>
                  <span className="text-[10px] text-blue-400">Sumatif Tengah</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Penilaian Akhir Semester (PAS)</span>
                  <div className="text-xl font-black text-white mt-1">30%</div>
                  <span className="text-[10px] text-cyan-400">Sumatif Akhir</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Tryout CBT & Simulasi UTBK</span>
                  <div className="text-xl font-black text-white mt-1">25%</div>
                  <span className="text-[10px] text-amber-400">Skolastik Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL: TAMBAH / EDIT JADWAL KBM
        ========================================================================
      */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {editingSchedule ? 'Edit Jadwal KBM' : 'Tambah Jadwal KBM Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Alokasikan waktu dan ruangan untuk proses pembelajaran</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hari</label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(e.target.value as ScheduleItem['day'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    <option value="SENIN">Senin</option>
                    <option value="SELASA">Selasa</option>
                    <option value="RABU">Rabu</option>
                    <option value="KAMIS">Kamis</option>
                    <option value="JUMAT">Jumat</option>
                    <option value="SABTU">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formTimeStart}
                    onChange={e => setFormTimeStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formTimeEnd}
                    onChange={e => setFormTimeEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mata Pelajaran</label>
                <select
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kelas / Rombel</label>
                  <select
                    value={formClass}
                    onChange={e => setFormClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    <option value="SEMUA">Semua Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        Kelas {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Guru Pengampu</label>
                  <select
                    value={formTeacher}
                    onChange={e => setFormTeacher(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ruangan / Lab</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lab Komputer CBT 1 / Ruang Teori 12-A"
                  value={formRoom}
                  onChange={e => setFormRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Catatan / Topik Pembahasan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembahasan Soal HOTS & Tryout CBT"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-600/30"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
