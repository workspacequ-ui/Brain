import React, { useState, useMemo } from 'react';
import {
  User,
  AgendaItem,
  AnnouncementItem,
  AgendaType,
  AnnouncementCategory,
  AnnouncementPriority
} from '../../types';
import {
  getAgendas,
  saveAgenda,
  deleteAgenda,
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  incrementAnnouncementViews
} from '../../utils/storage';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Megaphone,
  Pin,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Pencil,
  X,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Bell,
  Share2,
  ChevronDown,
  CalendarCheck2,
  Target,
  ArrowRight
} from 'lucide-react';
import { AgendaHorizontalRoadmap } from './AgendaHorizontalRoadmap';

interface DashboardCalendarAgendaPengumumanProps {
  user: User;
  onNavigateTab?: (tab: string) => void;
  onStartExam?: (examId: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const DashboardCalendarAgendaPengumuman: React.FC<DashboardCalendarAgendaPengumumanProps> = ({
  user,
  onNavigateTab,
  onStartExam,
  onShowToast
}) => {
  // Master Agendas & Announcements State
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => getAgendas());
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => getAnnouncements());

  // Calendar State (Default to current date)
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const defaultRoadmapUntilDate = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + 14);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [calendarAgendaTypeFilter, setCalendarAgendaTypeFilter] = useState<'ALL' | AgendaType>('ALL');

  // Announcement Filter & Search State
  const [announcementCategory, setAnnouncementCategory] = useState<'ALL' | AnnouncementCategory>('ALL');
  const [announcementSearch, setAnnouncementSearch] = useState<string>('');

  // Modals State
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaItem | null>(null);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState<boolean>(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);

  // New Announcement Form State (with Roadmap visibility settings)
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<AnnouncementCategory>('AKADEMIK');
  const [newAnnPriority, setNewAnnPriority] = useState<AnnouncementPriority>('MEDIUM');
  const [newAnnTargetRole, setNewAnnTargetRole] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL');
  const [newAnnTargetClass, setNewAnnTargetClass] = useState('SEMUA');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPinned, setNewAnnPinned] = useState(false);
  const [newAnnShowOnRoadmap, setNewAnnShowOnRoadmap] = useState(true);
  const [newAnnRoadmapUntilDate, setNewAnnRoadmapUntilDate] = useState(defaultRoadmapUntilDate);
  const [newAnnAttachmentName, setNewAnnAttachmentName] = useState('');
  const [newAnnAttachmentUrl, setNewAnnAttachmentUrl] = useState('');

  // New Agenda Form State
  const [newAgdTitle, setNewAgdTitle] = useState('');
  const [newAgdDate, setNewAgdDate] = useState(todayStr);
  const [newAgdTime, setNewAgdTime] = useState('08:00 - 09:30 WIB');
  const [newAgdType, setNewAgdType] = useState<AgendaType>('CLASS');
  const [newAgdTargetClass, setNewAgdTargetClass] = useState(user.className || 'SEMUA');
  const [newAgdSubject, setNewAgdSubject] = useState(user.subject || '');
  const [newAgdLocation, setNewAgdLocation] = useState('Ruang Teori & Online');
  const [newAgdDescription, setNewAgdDescription] = useState('');
  const [newAgdIsImportant, setNewAgdIsImportant] = useState(false);

  // --------------------------------------------------------------------------
  // Calendar Calculations & Navigation
  // --------------------------------------------------------------------------
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleResetToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Generate calendar days grid for currentMonth & currentYear
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month trailing days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Filter Agendas based on user role and class permissions
  const accessibleAgendas = useMemo(() => {
    return agendas.filter(agd => {
      if (user.role === 'admin') return true;
      if (user.role === 'teacher') {
        if (agd.targetClass === 'SEMUA') return true;
        if (user.targetClasses && user.targetClasses.includes(agd.targetClass)) return true;
        if (agd.author === user.name) return true;
        return false;
      }
      // Student
      if (agd.targetClass === 'SEMUA') return true;
      if (agd.targetClass === user.className) return true;
      return false;
    });
  }, [agendas, user]);

  // Filtered Agendas for Calendar Matrix & Badges
  const filteredAccessibleAgendas = useMemo(() => {
    if (calendarAgendaTypeFilter === 'ALL') return accessibleAgendas;
    return accessibleAgendas.filter(a => a.type === calendarAgendaTypeFilter);
  }, [accessibleAgendas, calendarAgendaTypeFilter]);

  // Date to Agenda Map for fast dot rendering on Calendar
  const agendaDateMap = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    filteredAccessibleAgendas.forEach(agd => {
      const existing = map.get(agd.date) || [];
      existing.push(agd);
      map.set(agd.date, existing);
    });
    return map;
  }, [filteredAccessibleAgendas]);

  // Filter Announcements based on user role and search
  const accessibleAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      if (user.role !== 'admin') {
        if (ann.targetRole !== 'ALL' && ann.targetRole !== user.role.toUpperCase()) {
          return false;
        }
        if (ann.targetClass && ann.targetClass !== 'SEMUA' && user.role === 'student' && ann.targetClass !== user.className) {
          return false;
        }
      }

      if (announcementCategory !== 'ALL' && ann.category !== announcementCategory) {
        return false;
      }

      if (announcementSearch.trim()) {
        const query = announcementSearch.toLowerCase();
        const matchTitle = ann.title.toLowerCase().includes(query);
        const matchContent = ann.content.toLowerCase().includes(query);
        const matchAuthor = ann.authorName.toLowerCase().includes(query);
        if (!matchTitle && !matchContent && !matchAuthor) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned first, then date descending
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    });
  }, [announcements, user, announcementCategory, announcementSearch]);

  // --------------------------------------------------------------------------
  // Handlers for Add / Edit / Delete Announcements & Agendas
  // --------------------------------------------------------------------------
  const handleOpenAnnouncementDetail = (ann: AnnouncementItem) => {
    setSelectedAnnouncement(ann);
    const updated = incrementAnnouncementViews(ann.id);
    setAnnouncements(updated);
  };

  const handleOpenCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setNewAnnTitle('');
    setNewAnnCategory('AKADEMIK');
    setNewAnnPriority('MEDIUM');
    setNewAnnTargetRole('ALL');
    setNewAnnTargetClass('SEMUA');
    setNewAnnContent('');
    setNewAnnPinned(false);
    setNewAnnShowOnRoadmap(true);
    setNewAnnRoadmapUntilDate(defaultRoadmapUntilDate);
    setNewAnnAttachmentName('');
    setNewAnnAttachmentUrl('');
    setIsAddAnnouncementOpen(true);
  };

  const handleOpenEditAnnouncement = (ann: AnnouncementItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAnnouncement(ann);
    setNewAnnTitle(ann.title);
    setNewAnnCategory(ann.category);
    setNewAnnPriority(ann.priority);
    setNewAnnTargetRole(ann.targetRole);
    setNewAnnTargetClass(ann.targetClass || 'SEMUA');
    setNewAnnContent(ann.content);
    setNewAnnPinned(!!ann.pinned);
    setNewAnnShowOnRoadmap(ann.showOnRoadmap !== false);
    setNewAnnRoadmapUntilDate(ann.roadmapUntilDate || defaultRoadmapUntilDate);
    setNewAnnAttachmentName(ann.attachmentName || '');
    setNewAnnAttachmentUrl(ann.attachmentUrl || '');
    setIsAddAnnouncementOpen(true);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      alert('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    if (editingAnnouncement) {
      // UPDATE EXISTING ANNOUNCEMENT
      const updated: AnnouncementItem = {
        ...editingAnnouncement,
        title: newAnnTitle.trim(),
        category: newAnnCategory,
        priority: newAnnPriority,
        targetRole: newAnnTargetRole,
        targetClass: newAnnTargetClass,
        content: newAnnContent.trim(),
        pinned: newAnnPinned,
        showOnRoadmap: newAnnShowOnRoadmap,
        roadmapUntilDate: newAnnShowOnRoadmap ? (newAnnRoadmapUntilDate || defaultRoadmapUntilDate) : undefined,
        attachmentName: newAnnAttachmentName.trim() || undefined,
        attachmentUrl: newAnnAttachmentUrl.trim() || undefined,
      };

      const updatedList = saveAnnouncement(updated);
      setAnnouncements(updatedList);
      setIsAddAnnouncementOpen(false);
      
      // Update selected announcement if currently open
      if (selectedAnnouncement?.id === updated.id) {
        setSelectedAnnouncement(updated);
      }
      setEditingAnnouncement(null);

      // Reset Form
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnPinned(false);
      setNewAnnAttachmentName('');
      setNewAnnAttachmentUrl('');

      if (onShowToast) {
        if (user.role === 'admin' && editingAnnouncement.authorName !== user.name) {
          onShowToast(`Pengumuman Guru (${editingAnnouncement.authorName}) berhasil diedit oleh Admin!`, 'success');
        } else {
          onShowToast('Pengumuman berhasil diperbarui!', 'success');
        }
      }
    } else {
      // CREATE NEW ANNOUNCEMENT
      const created: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: newAnnTitle.trim(),
        category: newAnnCategory,
        priority: newAnnPriority,
        targetRole: newAnnTargetRole,
        targetClass: newAnnTargetClass,
        content: newAnnContent.trim(),
        authorName: user.name,
        authorRole: user.role === 'admin' ? 'Administrator Sekolah' : 'Guru Pengampu',
        pinned: newAnnPinned,
        showOnRoadmap: newAnnShowOnRoadmap,
        roadmapUntilDate: newAnnShowOnRoadmap ? (newAnnRoadmapUntilDate || defaultRoadmapUntilDate) : undefined,
        attachmentName: newAnnAttachmentName.trim() || undefined,
        attachmentUrl: newAnnAttachmentUrl.trim() || undefined,
        viewsCount: 1,
        date: todayStr,
        createdAt: new Date().toISOString()
      };

      const updatedList = saveAnnouncement(created);
      setAnnouncements(updatedList);
      setIsAddAnnouncementOpen(false);

      // Reset Form
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnPinned(false);
      setNewAnnAttachmentName('');
      setNewAnnAttachmentUrl('');

      if (onShowToast) onShowToast('Pengumuman berhasil dipublikasikan!', 'success');
    }
  };

  const handleDeleteAnnouncementItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus pengumuman ini?')) {
      const updated = deleteAnnouncement(id);
      setAnnouncements(updated);
      if (selectedAnnouncement?.id === id) {
        setSelectedAnnouncement(null);
      }
      if (onShowToast) onShowToast('Pengumuman berhasil dihapus.', 'info');
    }
  };

  const handleOpenCreateAgenda = (defaultDate?: string) => {
    setEditingAgenda(null);
    setNewAgdTitle('');
    setNewAgdDate(defaultDate || selectedDate || todayStr);
    setNewAgdTime('08:00 - 09:30 WIB');
    setNewAgdType('CLASS');
    setNewAgdTargetClass(user.className || 'SEMUA');
    setNewAgdSubject(user.subject || '');
    setNewAgdLocation('Ruang Kelas & Online');
    setNewAgdDescription('');
    setNewAgdIsImportant(false);
    setIsAddAgendaOpen(true);
  };

  const handleOpenEditAgenda = (agd: AgendaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAgenda(agd);
    setNewAgdTitle(agd.title);
    setNewAgdDate(agd.date);
    setNewAgdTime(agd.time || '08:00 WIB');
    setNewAgdType(agd.type);
    setNewAgdTargetClass(agd.targetClass || 'SEMUA');
    setNewAgdSubject(agd.subject || '');
    setNewAgdLocation(agd.location || '');
    setNewAgdDescription(agd.description || '');
    setNewAgdIsImportant(!!agd.isImportant);
    setIsAddAgendaOpen(true);
  };

  const handleCreateAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgdTitle.trim() || !newAgdDate) {
      alert('Judul dan tanggal agenda wajib diisi.');
      return;
    }

    if (editingAgenda) {
      // UPDATE EXISTING AGENDA
      const updatedAgenda: AgendaItem = {
        ...editingAgenda,
        title: newAgdTitle.trim(),
        date: newAgdDate,
        time: newAgdTime.trim() || '08:00 WIB',
        type: newAgdType,
        targetClass: newAgdTargetClass,
        subject: newAgdSubject.trim() || undefined,
        location: newAgdLocation.trim() || 'Ruang Kelas',
        description: newAgdDescription.trim() || undefined,
        isImportant: newAgdIsImportant,
        status: newAgdDate === todayStr ? 'ONGOING' : newAgdDate < todayStr ? 'COMPLETED' : 'UPCOMING'
      };

      const updatedList = saveAgenda(updatedAgenda);
      setAgendas(updatedList);
      setIsAddAgendaOpen(false);

      if (selectedAgenda?.id === updatedAgenda.id) {
        setSelectedAgenda(updatedAgenda);
      }

      // Auto select date
      setSelectedDate(newAgdDate);
      const agdDateObj = new Date(newAgdDate);
      setCurrentYear(agdDateObj.getFullYear());
      setCurrentMonth(agdDateObj.getMonth());

      // Reset Form
      setEditingAgenda(null);
      setNewAgdTitle('');
      setNewAgdDescription('');
      setNewAgdIsImportant(false);

      if (onShowToast) onShowToast('Agenda kegiatan berhasil diperbarui!', 'success');
    } else {
      // CREATE NEW AGENDA
      const created: AgendaItem = {
        id: `agd-${Date.now()}`,
        title: newAgdTitle.trim(),
        date: newAgdDate,
        time: newAgdTime.trim() || '08:00 WIB',
        type: newAgdType,
        targetClass: newAgdTargetClass,
        subject: newAgdSubject.trim() || undefined,
        location: newAgdLocation.trim() || 'Ruang Kelas',
        description: newAgdDescription.trim() || undefined,
        author: user.name,
        status: newAgdDate === todayStr ? 'ONGOING' : newAgdDate < todayStr ? 'COMPLETED' : 'UPCOMING',
        isImportant: newAgdIsImportant,
        createdAt: new Date().toISOString()
      };

      const updatedList = saveAgenda(created);
      setAgendas(updatedList);
      setIsAddAgendaOpen(false);

      // Auto select the new agenda date on calendar
      setSelectedDate(newAgdDate);
      const agdDateObj = new Date(newAgdDate);
      setCurrentYear(agdDateObj.getFullYear());
      setCurrentMonth(agdDateObj.getMonth());

      // Reset Form
      setNewAgdTitle('');
      setNewAgdDescription('');
      setNewAgdIsImportant(false);

      if (onShowToast) onShowToast('Agenda kegiatan berhasil ditambahkan ke kalender!', 'success');
    }
  };

  const handleDeleteAgendaItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus agenda ini dari kalender?')) {
      const updated = deleteAgenda(id);
      setAgendas(updated);
      if (selectedAgenda?.id === id) {
        setSelectedAgenda(null);
      }
      if (onShowToast) onShowToast('Agenda berhasil dihapus.', 'info');
    }
  };

  // Helper Badge Colors
  const getAgendaTypeBadge = (type: AgendaType) => {
    switch (type) {
      case 'EXAM':
        return { label: 'UJIAN CBT', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80', dot: 'bg-emerald-400 shadow-sm shadow-emerald-400/50 ring-1 ring-emerald-400/60' };
      case 'CLASS':
        return { label: 'KBM KELAS', bg: 'bg-blue-950/80 text-blue-300 border-blue-800/80', dot: 'bg-sky-400 shadow-sm shadow-sky-400/50 ring-1 ring-sky-400/60' };
      case 'TASK':
        return { label: 'TUGAS & KUIS', bg: 'bg-amber-950/80 text-amber-300 border-amber-800/80', dot: 'bg-amber-400 shadow-sm shadow-amber-400/50 ring-1 ring-amber-400/60' };
      case 'MEETING':
        return { label: 'RAPAT DEWAN', bg: 'bg-purple-950/80 text-purple-300 border-purple-800/80', dot: 'bg-purple-400 shadow-sm shadow-purple-400/50 ring-1 ring-purple-400/60' };
      case 'EVENT':
        return { label: 'WORKSHOP & EVENT', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80', dot: 'bg-cyan-400 shadow-sm shadow-cyan-400/50 ring-1 ring-cyan-400/60' };
      case 'HOLIDAY':
        return { label: 'LIBUR & ACARA', bg: 'bg-rose-950/80 text-rose-300 border-rose-800/80', dot: 'bg-rose-400 shadow-sm shadow-rose-400/50 ring-1 ring-rose-400/60' };
      default:
        return { label: 'AGENDA', bg: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400 shadow-sm ring-1 ring-slate-400/60' };
    }
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">PENTING</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">INFO UTAMA</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700">PEMBERITAHUAN</span>;
    }
  };

  const getCategoryBadge = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'UJIAN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800/60">UJIAN</span>;
      case 'AKADEMIK':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800/60">AKADEMIK</span>;
      case 'PENTING':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800/60">PENTING</span>;
      case 'KEGIATAN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800/60">KEGIATAN</span>;
      case 'INFO_UMUM':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">INFO UMUM</span>;
    }
  };

  const formatSelectedDateHuman = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dateObj.getDay()];
        const monthName = MONTH_NAMES[m];
        return `${dayName}, ${d} ${monthName} ${y}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <div id="dashboard-calendar-agenda-pengumuman-section" className="space-y-6">
      
      {/* 
        ========================================================================
        1. TOP HORIZONTAL AGENDA ROADMAP (ROADMAP DI PALING ATAS DENGAN ICON PENGUMUMAN)
        ========================================================================
      */}
      <AgendaHorizontalRoadmap
        user={user}
        onNavigateTab={onNavigateTab}
        onStartExam={onStartExam}
        onShowToast={onShowToast}
        onAgendaChange={(updated) => setAgendas(updated)}
        onAnnouncementChange={(updated) => setAnnouncements(updated)}
      />

      {/* 
        ========================================================================
        2. SPLIT MAIN LAYOUT (BELOW ROADMAP):
        - LEFT (lg:col-span-7): KALENDER AKADEMIK & DETAIL JADWAL TANGGAL TERPILIH
        - RIGHT (lg:col-span-5): PUSAT PENGUMUMAN DENGAN PENGATURAN ROADMAP
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ====================================================================
            LEFT SECTION (7 COLS): KALENDER AKADEMIK & MENU TERORGANISIR
            ==================================================================== */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
          
          {/* Main Card Header & Quick Menu Controls */}
          <div className="space-y-4 border-b border-slate-800/80 pb-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                    <span>Kalender Akademik</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 hidden sm:inline-flex">
                      {accessibleAgendas.length} Agenda Terjadwal
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Navigasi jadwal KBM, Tryout CBT, tenggat tugas, dan agenda harian sekolah.
                  </p>
                </div>
              </div>

              {/* Admin / Teacher Quick Add Agenda */}
              {(user.role === 'admin' || user.role === 'teacher') && (
                <button
                  type="button"
                  onClick={() => {
                    setNewAgdDate(selectedDate || todayStr);
                    setIsAddAgendaOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Agenda</span>
                </button>
              )}
            </div>

            {/* Menu Bar: Month Selector, Year Selector, Reset Today, & Quick Nav Arrows */}
            <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-950/80 border border-slate-800/90 p-2 rounded-2xl">
              
              {/* Left: Month and Year Dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Month Dropdown Selector */}
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-extrabold text-xs outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((mName, idx) => (
                    <option key={mName} value={idx} className="bg-slate-900 text-white">
                      {mName}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown Selector */}
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-cyan-300 font-bold text-xs outline-none focus:border-cyan-500 cursor-pointer font-mono"
                >
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>

                {/* Reset to Today Button */}
                <button
                  type="button"
                  onClick={handleResetToday}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Fokus ke Hari Ini"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Hari Ini</span>
                </button>

              </div>

              {/* Right: Previous & Next Month Arrows */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-2 text-slate-400 font-semibold">
                  {MONTH_NAMES[currentMonth].substring(0, 3)} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Quick Agenda Filter Tabs on Calendar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => setCalendarAgendaTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  calendarAgendaTypeFilter === 'ALL'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Semua Agenda
              </button>
              <button
                type="button"
                onClick={() => setCalendarAgendaTypeFilter('EXAM')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  calendarAgendaTypeFilter === 'EXAM'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Ujian CBT
              </button>
              <button
                type="button"
                onClick={() => setCalendarAgendaTypeFilter('CLASS')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  calendarAgendaTypeFilter === 'CLASS'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                KBM Kelas
              </button>
              <button
                type="button"
                onClick={() => setCalendarAgendaTypeFilter('TASK')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  calendarAgendaTypeFilter === 'TASK'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Tugas
              </button>
              <button
                type="button"
                onClick={() => setCalendarAgendaTypeFilter('MEETING')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  calendarAgendaTypeFilter === 'MEETING'
                    ? 'bg-purple-950 text-purple-300 border border-purple-700 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Rapat
              </button>
              <button
                type="button"
                onClick={() => setCalendarAgendaTypeFilter('HOLIDAY')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  calendarAgendaTypeFilter === 'HOLIDAY'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Libur
              </button>
            </div>

          </div>

          {/* Calendar Grid Container */}
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/80">
              {DAY_NAMES.map((d, i) => (
                <div key={d} className={`py-1 ${i === 0 ? 'text-rose-400 font-black' : i === 6 ? 'text-cyan-400 font-black' : ''}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Dates Grid Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDate;
                const dayAgendas = agendaDateMap.get(cell.dateStr) || [];
                const hasAgendas = dayAgendas.length > 0;

                return (
                  <button
                    key={`${cell.dateStr}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(cell.dateStr);
                    }}
                    className={`relative flex flex-col items-center justify-between p-1.5 min-h-[52px] sm:min-h-[58px] rounded-2xl text-xs font-semibold transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-600/90 to-blue-600/90 text-white font-black shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-400 scale-[1.02] z-10'
                        : cell.isToday
                        ? 'bg-cyan-950/80 text-cyan-300 font-extrabold border border-cyan-500/70 shadow-sm'
                        : cell.isCurrentMonth
                        ? 'bg-slate-900/70 border border-slate-800/80 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border border-slate-900/40 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {/* Top Row: Day Number & Today indicator */}
                    <div className="w-full flex items-center justify-between px-1">
                      <span className={`text-xs ${isSelected ? 'text-white font-black' : cell.isToday ? 'text-cyan-300 font-black' : cell.isCurrentMonth ? 'text-slate-200' : 'text-slate-600'}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.isToday && (
                        <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-cyan-900 text-cyan-300'}`}>
                          HARI INI
                        </span>
                      )}
                    </div>

                    {/* Event Indicator: Colored Dots Only */}
                    <div className="w-full flex items-center justify-center min-h-[16px] mt-auto pb-0.5">
                      {hasAgendas && (
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap max-w-full">
                          {dayAgendas.slice(0, 4).map((ag, i) => {
                            const badgeInfo = getAgendaTypeBadge(ag.type);
                            return (
                              <span
                                key={i}
                                title={`${ag.title} (${ag.time}) • ${badgeInfo.label}`}
                                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${badgeInfo.dot} transition-transform hover:scale-125 shrink-0 ${
                                  isSelected ? 'ring-2 ring-white shadow-md' : ''
                                }`}
                              />
                            );
                          })}
                          {dayAgendas.length > 4 && (
                            <span
                              title={`${dayAgendas.length - 4} agenda lainnya`}
                              className={`text-[8px] font-black leading-none px-1 py-0.5 rounded-full shrink-0 ${
                                isSelected
                                  ? 'bg-white text-slate-950'
                                  : 'bg-slate-800 text-cyan-300 border border-slate-700'
                              }`}
                            >
                              +{dayAgendas.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Selected Date Detail Section */}
            {(() => {
              const selectedDateAgendas = accessibleAgendas.filter(a => a.date === selectedDate);
              return (
                <div className="pt-3.5 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-extrabold text-white">
                        Agenda pada {formatSelectedDateHuman(selectedDate)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {selectedDateAgendas.length} Jadwal
                      </span>
                    </div>

                    {(user.role === 'admin' || user.role === 'teacher') && (
                      <button
                        type="button"
                        onClick={() => handleOpenCreateAgenda(selectedDate)}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Agenda di Tanggal Ini</span>
                      </button>
                    )}
                  </div>

                  {selectedDateAgendas.length === 0 ? (
                    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
                      <span>Tidak ada kegiatan khusus pada tanggal ini.</span>
                      <span className="text-[11px] text-slate-500 font-mono">Status: Hari Normal</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDateAgendas.map(agd => {
                        const badge = getAgendaTypeBadge(agd.type);
                        const canEditOrDelete = user.role === 'admin' || agd.author === user.name;
                        return (
                          <div
                            key={agd.id}
                            onClick={() => setSelectedAgenda(agd)}
                            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group flex items-start justify-between gap-2 shadow-sm"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                                <span className="text-[10px] text-cyan-300 font-mono">{agd.time}</span>
                                {agd.isImportant && (
                                  <span className="px-1 py-0.2 rounded text-[8px] font-black bg-rose-950 text-rose-300 border border-rose-800">
                                    PENTING
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                                {agd.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                {agd.targetClass} • {agd.location || 'Ruang Kelas'}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-center">
                              {canEditOrDelete && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenEditAgenda(agd, e)}
                                    className="p-1 text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Ubah Agenda"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteAgendaItem(agd.id, e)}
                                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Hapus Agenda"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <span className="text-cyan-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Calendar Legend / Info Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5" title="Jadwal Ujian CBT & Tryout Online">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 ring-1 ring-emerald-400/60" />
                  <span className="font-medium text-slate-300">Ujian CBT</span>
                </div>
                <div className="flex items-center gap-1.5" title="Kegiatan Belajar Mengajar">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 ring-1 ring-sky-400/60" />
                  <span className="font-medium text-slate-300">KBM Kelas</span>
                </div>
                <div className="flex items-center gap-1.5" title="Tugas, PR, dan Kuis Siswa">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 ring-1 ring-amber-400/60" />
                  <span className="font-medium text-slate-300">Tugas & Kuis</span>
                </div>
                <div className="flex items-center gap-1.5" title="Rapat Dewan Guru & Manajemen">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50 ring-1 ring-purple-400/60" />
                  <span className="font-medium text-slate-300">Rapat Dewan</span>
                </div>
                <div className="flex items-center gap-1.5" title="Workshop, Seminar & Acara Sekolah">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 ring-1 ring-cyan-400/60" />
                  <span className="font-medium text-slate-300">Event</span>
                </div>
                <div className="flex items-center gap-1.5" title="Libur Nasional & Cuti Bersama">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50 ring-1 ring-rose-400/60" />
                  <span className="font-medium text-slate-300">Libur</span>
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('exams')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Modul CBT</span> →
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ====================================================================
            RIGHT SECTION (5 COLS): PUSAT PENGUMUMAN & PENGATURAN ROADMAP
            ==================================================================== */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 flex flex-col justify-between">
          
          {/* Header Pengumuman */}
          <div className="space-y-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-1.5">
                    <span>Pengumuman</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800/80">
                      {accessibleAnnouncements.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Pemberitahuan & Edaran Resmi</p>
                </div>
              </div>

              {/* Buat Pengumuman Button for Admin & Teacher */}
              {(user.role === 'admin' || user.role === 'teacher') && (
                <button
                  type="button"
                  onClick={handleOpenCreateAnnouncement}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700 shadow-sm"
                  title="Tulis Pengumuman Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Baru</span>
                </button>
              )}
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={announcementSearch}
                onChange={e => setAnnouncementSearch(e.target.value)}
                placeholder="Cari pengumuman & edaran..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
              />
              {announcementSearch && (
                <button
                  type="button"
                  onClick={() => setAnnouncementSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() => setAnnouncementCategory('ALL')}
                className={`px-2 py-0.5 rounded-md font-bold shrink-0 transition-all cursor-pointer ${
                  announcementCategory === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementCategory('PENTING')}
                className={`px-2 py-0.5 rounded-md font-bold shrink-0 transition-all cursor-pointer ${
                  announcementCategory === 'PENTING'
                    ? 'bg-rose-900 text-rose-200 border border-rose-700'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Penting
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementCategory('AKADEMIK')}
                className={`px-2 py-0.5 rounded-md font-bold shrink-0 transition-all cursor-pointer ${
                  announcementCategory === 'AKADEMIK'
                    ? 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Akademik
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementCategory('UJIAN')}
                className={`px-2 py-0.5 rounded-md font-bold shrink-0 transition-all cursor-pointer ${
                  announcementCategory === 'UJIAN'
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Ujian
              </button>
            </div>
          </div>

          {/* Announcement Cards Scrollable List */}
          <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1 flex-1">
            {accessibleAnnouncements.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <Bell className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">Tidak ada pengumuman yang sesuai.</p>
              </div>
            ) : (
              accessibleAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  onClick={() => handleOpenAnnouncementDetail(ann)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-2 ${
                    ann.pinned
                      ? 'bg-slate-950/90 border-amber-500/40 hover:border-amber-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ann.pinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-950 text-amber-300 border border-amber-800">
                          <Pin className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>SEMATKAN</span>
                        </span>
                      )}
                      {getCategoryBadge(ann.category)}
                      {getPriorityBadge(ann.priority)}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {ann.date}
                      </span>
                      {(user.role === 'admin' || ann.authorName === user.name) && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditAnnouncement(ann, e)}
                            className="p-1 text-slate-500 hover:text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity rounded hover:bg-slate-800"
                            title={user.role === 'admin' && ann.authorName !== user.name ? `Edit Pengumuman Guru (${ann.authorName}) sebagai Admin` : "Edit Pengumuman"}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAnnouncementItem(ann.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 opacity-80 group-hover:opacity-100 transition-opacity rounded hover:bg-slate-800"
                            title="Hapus Pengumuman"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {ann.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {ann.content}
                    </p>
                  </div>

                  {/* Roadmap Status indicator on Card */}
                  {ann.showOnRoadmap && ann.roadmapUntilDate && (
                    <div className="px-2 py-1 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-[10px] text-amber-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <Megaphone className="w-3 h-3 text-amber-400" />
                        <span>Di Roadmap</span>
                      </span>
                      <span className="font-mono text-[9px] font-bold">s/d {ann.roadmapUntilDate}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[130px] text-slate-400">
                      Oleh: <strong className="text-slate-300">{ann.authorName}</strong>
                    </span>

                    <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                      <span>Baca Detail</span> →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Announcement Footer Stats */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Diberitahukan untuk: <strong className="text-slate-200">{user.role === 'admin' ? 'Semua User' : user.role === 'teacher' ? 'Dewan Guru' : `Siswa ${user.className}`}</strong></span>
            <span className="text-slate-500">Update Terkini</span>
          </div>

        </div>

      </div>

      {/* 
        ========================================================================
        MODAL 1: DETAIL PENGUMUMAN LENGKAP
        ========================================================================
      */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedAnnouncement.pinned && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-400" /> SEMATKAN
                    </span>
                  )}
                  {getCategoryBadge(selectedAnnouncement.category)}
                  {getPriorityBadge(selectedAnnouncement.priority)}
                </div>
                <h3 className="font-extrabold text-white text-base sm:text-lg mt-1.5 leading-snug">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Diterbitkan oleh: <strong className="text-white">{selectedAnnouncement.authorName}</strong> ({selectedAnnouncement.authorRole}) • Tanggal: <strong className="text-cyan-300">{selectedAnnouncement.date}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              
              {/* Roadmap Display Validity Badge */}
              {selectedAnnouncement.showOnRoadmap && selectedAnnouncement.roadmapUntilDate && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-2xl flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Ditampilkan pada Roadmap Linimasa sampai:</span>
                  </div>
                  <strong className="text-amber-200 font-mono">{selectedAnnouncement.roadmapUntilDate}</strong>
                </div>
              )}

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 font-sans">
                {selectedAnnouncement.content}
              </div>

              {/* Attachment File Card if any */}
              {selectedAnnouncement.attachmentName && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{selectedAnnouncement.attachmentName}</p>
                      <p className="text-[11px] text-slate-500">Dokumen Lampiran Pengumuman</p>
                    </div>
                  </div>

                  {selectedAnnouncement.attachmentUrl ? (
                    <a
                      href={selectedAnnouncement.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all"
                    >
                      <span>Buka File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-italic">Tersimpan di Arsip</span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dibaca {selectedAnnouncement.viewsCount || 1} kali</span>
                </span>
                {user.role === 'admin' && selectedAnnouncement.authorName !== user.name && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                    Akses Admin
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {(user.role === 'admin' || selectedAnnouncement.authorName === user.name) && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const annToEdit = selectedAnnouncement;
                        setSelectedAnnouncement(null);
                        handleOpenEditAnnouncement(annToEdit);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      title={user.role === 'admin' && selectedAnnouncement.authorName !== user.name ? `Edit Pengumuman Guru (${selectedAnnouncement.authorName}) sebagai Admin` : "Edit Pengumuman"}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Pengumuman</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteAnnouncementItem(selectedAnnouncement.id, e)}
                      className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 2: DETAIL AGENDA MODAL
        ========================================================================
      */}
      {selectedAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getAgendaTypeBadge(selectedAgenda.type).bg}`}>
                    {getAgendaTypeBadge(selectedAgenda.type).label}
                  </span>
                  {selectedAgenda.isImportant && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800">
                      PENTING
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-white text-base sm:text-lg mt-1">
                  {selectedAgenda.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgenda(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Tanggal Kegiatan</span>
                  <span className="font-extrabold text-white">{formatSelectedDateHuman(selectedAgenda.date)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Waktu / Durasi</span>
                  <span className="font-extrabold text-cyan-300 font-mono">{selectedAgenda.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Target Kelas</span>
                  <span className="font-bold text-amber-300">{selectedAgenda.targetClass}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Lokasi / Ruang</span>
                  <span className="font-bold text-white">{selectedAgenda.location || 'Ruang Kelas'}</span>
                </div>
              </div>

              {selectedAgenda.subject && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Mata Pelajaran Terkait</span>
                  <span className="font-extrabold text-cyan-400">{selectedAgenda.subject}</span>
                </div>
              )}

              {selectedAgenda.description && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Keterangan & Catatan</span>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed">
                    {selectedAgenda.description}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
              <span className="text-slate-500">Pembuat: {selectedAgenda.author || 'Admin'}</span>
              <div className="flex items-center gap-2">
                {(user.role === 'admin' || selectedAgenda.author === user.name) && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        const agd = selectedAgenda;
                        setSelectedAgenda(null);
                        handleOpenEditAgenda(agd, e);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Ubah Agenda</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        const agdId = selectedAgenda.id;
                        handleDeleteAgendaItem(agdId, e);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAgenda(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 3: TAMBAH / EDIT PENGUMUMAN DENGAN PENGATURAN ROADMAP (ADMIN & GURU)
        ========================================================================
      */}
      {isAddAnnouncementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <form onSubmit={handleAnnouncementSubmit}>
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {editingAnnouncement ? (
                    <Pencil className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Megaphone className="w-5 h-5 text-amber-400" />
                  )}
                  <h3 className="font-bold text-white text-base">
                    {editingAnnouncement
                      ? user.role === 'admin' && editingAnnouncement.authorName !== user.name
                        ? `Edit Pengumuman Guru (${editingAnnouncement.authorName})`
                        : 'Edit Pengumuman'
                      : 'Publikasikan Pengumuman Baru'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAnnouncementOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {/* Informational Banner for Editing Announcement */}
                {editingAnnouncement && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-800/70 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-amber-300">
                        {user.role === 'admin' && editingAnnouncement.authorName !== user.name
                          ? `Mode Edit Administrator: Anda memiliki hak akses penuh untuk mengubah pengumuman yang diterbitkan oleh Guru (${editingAnnouncement.authorName}).`
                          : 'Mode Edit Pengumuman: Silakan perbarui data atau pengaturan linimasa.'}
                      </p>
                      <p className="text-[11px] text-amber-400/80">
                        Penulis Asli: <strong>{editingAnnouncement.authorName}</strong> ({editingAnnouncement.authorRole}) • Tanggal Awal: {editingAnnouncement.date}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Judul Pengumuman *</label>
                  <input
                    type="text"
                    required
                    value={newAnnTitle}
                    onChange={e => setNewAnnTitle(e.target.value)}
                    placeholder="Contoh: Jadwal Pelaksanaan Tryout Akbar SNBT 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 outline-none font-semibold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Kategori</label>
                    <select
                      value={newAnnCategory}
                      onChange={e => setNewAnnCategory(e.target.value as AnnouncementCategory)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    >
                      <option value="AKADEMIK">Akademik</option>
                      <option value="UJIAN">Ujian CBT</option>
                      <option value="PENTING">Penting & Mendesak</option>
                      <option value="KEGIATAN">Kegiatan & Lomba</option>
                      <option value="INFO_UMUM">Informasi Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Prioritas</label>
                    <select
                      value={newAnnPriority}
                      onChange={e => setNewAnnPriority(e.target.value as AnnouncementPriority)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    >
                      <option value="HIGH">Tinggi (PENTING)</option>
                      <option value="MEDIUM">Sedang (Info Utama)</option>
                      <option value="LOW">Rendah (Pemberitahuan)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Target Sasaran</label>
                    <select
                      value={newAnnTargetRole}
                      onChange={e => setNewAnnTargetRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    >
                      <option value="ALL">Semua (Siswa & Guru)</option>
                      <option value="STUDENT">Khusus Siswa</option>
                      <option value="TEACHER">Khusus Dewan Guru</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Target Kelas</label>
                    <input
                      type="text"
                      value={newAnnTargetClass}
                      onChange={e => setNewAnnTargetClass(e.target.value)}
                      placeholder="SEMUA atau XII-UTBK"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                {/* ========================================================== */}
                {/* PENGATURAN ROADMAP & BATAS TANGGAL TAMPIL                  */}
                {/* ========================================================== */}
                <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk-dash-road-show"
                      checked={newAnnShowOnRoadmap}
                      onChange={e => setNewAnnShowOnRoadmap(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="chk-dash-road-show" className="text-amber-300 font-bold cursor-pointer flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Tampilkan Pengumuman ini di Roadmap Linimasa</span>
                    </label>
                  </div>

                  {newAnnShowOnRoadmap && (
                    <div className="pl-6 space-y-1.5">
                      <label className="block text-slate-300 font-bold text-[11px]">
                        Tampil di Roadmap Sampai Tanggal:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          required={newAnnShowOnRoadmap}
                          value={newAnnRoadmapUntilDate}
                          onChange={e => setNewAnnRoadmapUntilDate(e.target.value)}
                          className="px-3 py-2 bg-slate-950 border border-amber-600/50 rounded-xl text-white outline-none font-mono text-xs w-full max-w-xs focus:border-amber-400"
                        />
                        <span className="text-[10px] text-slate-400">
                          (Setelah tanggal ini, pengumuman otomatis berhenti tampil di roadmap)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Isi Lengkap Pengumuman *</label>
                  <textarea
                    required
                    rows={4}
                    value={newAnnContent}
                    onChange={e => setNewAnnContent(e.target.value)}
                    placeholder="Tuliskan detail pengumuman, instruksi, tata tertib, dan informasi penting lainnya..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 outline-none leading-relaxed text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nama File Lampiran (Opsional)</label>
                    <input
                      type="text"
                      value={newAnnAttachmentName}
                      onChange={e => setNewAnnAttachmentName(e.target.value)}
                      placeholder="Contoh: Jadwal_Resmi_CBT.pdf"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Link URL Lampiran (Opsional)</label>
                    <input
                      type="url"
                      value={newAnnAttachmentUrl}
                      onChange={e => setNewAnnAttachmentUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-ann-pin-dash"
                    checked={newAnnPinned}
                    onChange={e => setNewAnnPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="chk-ann-pin-dash" className="text-slate-300 font-bold cursor-pointer">
                    Sematkan pengumuman di bagian paling atas (Pinned)
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnnouncementOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 4: TAMBAH AGENDA KALENDER (ADMIN & GURU)
        ========================================================================
      */}
      {isAddAgendaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateAgendaSubmit}>
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {editingAgenda ? (
                    <Pencil className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <CalendarDays className="w-5 h-5 text-cyan-400" />
                  )}
                  <h3 className="font-bold text-white text-base">
                    {editingAgenda ? 'Ubah Agenda Kalender' : 'Tambah Agenda Kalender Baru'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAgendaOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Judul Agenda / Jadwal *</label>
                  <input
                    type="text"
                    required
                    value={newAgdTitle}
                    onChange={e => setNewAgdTitle(e.target.value)}
                    placeholder="Contoh: Tryout Akbar CBT TPS & Literasi SNBT"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-500 outline-none font-semibold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tanggal (YYYY-MM-DD) *</label>
                    <input
                      type="date"
                      required
                      value={newAgdDate}
                      onChange={e => setNewAgdDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      value={newAgdTime}
                      onChange={e => setNewAgdTime(e.target.value)}
                      placeholder="Contoh: 08:00 - 10:30 WIB"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tipe Agenda</label>
                    <select
                      value={newAgdType}
                      onChange={e => setNewAgdType(e.target.value as AgendaType)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    >
                      <option value="EXAM">Ujian CBT / Tryout</option>
                      <option value="CLASS">KBM & Pertemuan Kelas</option>
                      <option value="TASK">Tenggat Tugas / Kuis</option>
                      <option value="MEETING">Rapat Dewan Guru</option>
                      <option value="EVENT">Workshop & Acara</option>
                      <option value="HOLIDAY">Libur Nasional / PHBN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Target Kelas</label>
                    <input
                      type="text"
                      value={newAgdTargetClass}
                      onChange={e => setNewAgdTargetClass(e.target.value)}
                      placeholder="SEMUA, XII-UTBK, XI-IPA"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mata Pelajaran (Opsional)</label>
                    <input
                      type="text"
                      value={newAgdSubject}
                      onChange={e => setNewAgdSubject(e.target.value)}
                      placeholder="Contoh: Matematika & TPS"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Lokasi / Ruangan</label>
                    <input
                      type="text"
                      value={newAgdLocation}
                      onChange={e => setNewAgdLocation(e.target.value)}
                      placeholder="Lab Komputer 1 / Google Meet"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Keterangan Tambahan</label>
                  <textarea
                    rows={3}
                    value={newAgdDescription}
                    onChange={e => setNewAgdDescription(e.target.value)}
                    placeholder="Instruksi kegiatan, materi pembahasan, atau persiapan yang perlu dibawa..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-agd-imp"
                    checked={newAgdIsImportant}
                    onChange={e => setNewAgdIsImportant(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="chk-agd-imp" className="text-slate-300 font-bold cursor-pointer">
                    Tandai sebagai Agenda Wajib / Penting
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAgendaOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold shadow-lg shadow-cyan-600/20 cursor-pointer transition-all"
                >
                  {editingAgenda ? 'Simpan Perubahan' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
