import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  User,
  AgendaItem,
  AgendaType,
  AnnouncementItem,
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
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Filter,
  Flame,
  ArrowRight,
  Compass,
  Check,
  Target,
  Megaphone,
  Pin,
  FileText,
  Bell,
  Eye,
  CalendarCheck2,
  Pencil
} from 'lucide-react';

interface AgendaHorizontalRoadmapProps {
  user: User;
  onNavigateTab?: (tab: string) => void;
  onStartExam?: (examId: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  onAgendaChange?: (agendas: AgendaItem[]) => void;
  onAnnouncementChange?: (announcements: AnnouncementItem[]) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Unified Roadmap Milestone Item
export type RoadmapItem =
  | {
      kind: 'AGENDA';
      id: string;
      title: string;
      date: string;
      time: string;
      isImportant: boolean;
      data: AgendaItem;
    }
  | {
      kind: 'ANNOUNCEMENT';
      id: string;
      title: string;
      date: string;
      time: string;
      isImportant: boolean;
      data: AnnouncementItem;
    };

export const AgendaHorizontalRoadmap: React.FC<AgendaHorizontalRoadmapProps> = ({
  user,
  onNavigateTab,
  onStartExam,
  onShowToast,
  onAgendaChange,
  onAnnouncementChange
}) => {
  // Master Agendas & Announcements State
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => getAgendas());
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => getAnnouncements());

  // Filter State: 'ALL' | 'UPCOMING' | 'ANNOUNCEMENT' | AgendaType
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'ANNOUNCEMENT' | AgendaType>('ALL');

  // Modals State
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaItem | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isAddAgendaModalOpen, setIsAddAgendaModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  const [isAddAnnModalOpen, setIsAddAnnModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  // Scroll Container Ref for Horizontal Drag / Arrows
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLDivElement>(null);

  // Today Date Strings
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

  // Form State for New Agenda
  const [newAgdTitle, setNewAgdTitle] = useState('');
  const [newAgdDate, setNewAgdDate] = useState(todayStr);
  const [newAgdTime, setNewAgdTime] = useState('08:00 - 09:30 WIB');
  const [newAgdType, setNewAgdType] = useState<AgendaType>('EXAM');
  const [newAgdTargetClass, setNewAgdTargetClass] = useState(user.className || 'SEMUA');
  const [newAgdSubject, setNewAgdSubject] = useState(user.subject || '');
  const [newAgdLocation, setNewAgdLocation] = useState('Ruang CBT & Lab Komputer');
  const [newAgdDescription, setNewAgdDescription] = useState('');
  const [newAgdIsImportant, setNewAgdIsImportant] = useState(false);

  // Form State for New Announcement (from Roadmap)
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<AnnouncementCategory>('AKADEMIK');
  const [newAnnPriority, setNewAnnPriority] = useState<AnnouncementPriority>('HIGH');
  const [newAnnTargetRole, setNewAnnTargetRole] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL');
  const [newAnnTargetClass, setNewAnnTargetClass] = useState('SEMUA');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPinned, setNewAnnPinned] = useState(true);
  const [newAnnShowOnRoadmap, setNewAnnShowOnRoadmap] = useState(true);
  const [newAnnRoadmapUntilDate, setNewAnnRoadmapUntilDate] = useState(defaultRoadmapUntilDate);
  const [newAnnAttachmentName, setNewAnnAttachmentName] = useState('');
  const [newAnnAttachmentUrl, setNewAnnAttachmentUrl] = useState('');

  // Sync state whenever storage updates
  const updateAgendasState = (newList: AgendaItem[]) => {
    setAgendas(newList);
    if (onAgendaChange) onAgendaChange(newList);
  };

  const updateAnnouncementsState = (newList: AnnouncementItem[]) => {
    setAnnouncements(newList);
    if (onAnnouncementChange) onAnnouncementChange(newList);
  };

  // --------------------------------------------------------------------------
  // Accessible Agendas for User
  // --------------------------------------------------------------------------
  const accessibleAgendas = useMemo(() => {
    return agendas.filter(item => {
      if (user.role === 'admin') return true;
      if (user.role === 'student') {
        if (item.targetClass && item.targetClass !== 'SEMUA' && user.className && item.targetClass !== user.className) {
          return false;
        }
      }
      if (user.role === 'teacher') {
        if (item.targetClass && item.targetClass !== 'SEMUA' && user.targetClasses && !user.targetClasses.includes('SEMUA') && !user.targetClasses.includes(item.targetClass)) {
          if (item.type === 'MEETING' || item.type === 'EVENT' || item.type === 'HOLIDAY') {
            return true;
          }
          return false;
        }
      }
      return true;
    });
  }, [agendas, user]);

  // --------------------------------------------------------------------------
  // Accessible & Active Roadmap Announcements
  // --------------------------------------------------------------------------
  const activeRoadmapAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      // Must be set to show on roadmap
      if (ann.showOnRoadmap === false) return false;

      // Check role target
      if (user.role === 'student' && ann.targetRole === 'TEACHER') return false;
      if (user.role === 'teacher' && ann.targetRole === 'STUDENT') return false;

      // Check class target
      if (user.role === 'student' && ann.targetClass && ann.targetClass !== 'SEMUA' && user.className && ann.targetClass !== user.className) {
        return false;
      }

      // Check date validity: If roadmapUntilDate is defined, show if not expired OR show during its validity
      if (ann.roadmapUntilDate && ann.roadmapUntilDate < todayStr) {
        // Expired from roadmap
        return false;
      }

      return true;
    });
  }, [announcements, user, todayStr]);

  // --------------------------------------------------------------------------
  // Unified Roadmap Items (Agendas + Announcements) Sorted Chronologically
  // --------------------------------------------------------------------------
  const unifiedRoadmapItems = useMemo<RoadmapItem[]>(() => {
    const agendaMilestones: RoadmapItem[] = accessibleAgendas.map(agd => ({
      kind: 'AGENDA',
      id: agd.id,
      title: agd.title,
      date: agd.date,
      time: agd.time || '08:00 WIB',
      isImportant: !!agd.isImportant,
      data: agd
    }));

    const announcementMilestones: RoadmapItem[] = activeRoadmapAnnouncements.map(ann => ({
      kind: 'ANNOUNCEMENT',
      id: ann.id,
      title: ann.title,
      date: ann.date,
      time: '07:00 WIB', // early time slot for top announcement visibility
      isImportant: ann.priority === 'HIGH' || !!ann.pinned,
      data: ann
    }));

    // Combine and sort chronologically by date, then by kind (announcements first on same date), then time
    const combined = [...agendaMilestones, ...announcementMilestones];

    return combined.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // Put announcements first on the same day as key official notices
      if (a.kind === 'ANNOUNCEMENT' && b.kind !== 'ANNOUNCEMENT') return -1;
      if (a.kind !== 'ANNOUNCEMENT' && b.kind === 'ANNOUNCEMENT') return 1;
      return a.time.localeCompare(b.time);
    });
  }, [accessibleAgendas, activeRoadmapAnnouncements]);

  // --------------------------------------------------------------------------
  // Filtered Roadmap Items based on active tab
  // --------------------------------------------------------------------------
  const filteredItems = useMemo(() => {
    if (activeFilter === 'ALL') return unifiedRoadmapItems;
    if (activeFilter === 'UPCOMING') {
      return unifiedRoadmapItems.filter(item => item.date >= todayStr);
    }
    if (activeFilter === 'ANNOUNCEMENT') {
      return unifiedRoadmapItems.filter(item => item.kind === 'ANNOUNCEMENT');
    }
    return unifiedRoadmapItems.filter(item => item.kind === 'AGENDA' && item.data.type === activeFilter);
  }, [unifiedRoadmapItems, activeFilter, todayStr]);

  // --------------------------------------------------------------------------
  // Statistics
  // --------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = unifiedRoadmapItems.length;
    const annCount = activeRoadmapAnnouncements.length;
    const agdCount = accessibleAgendas.length;
    const completed = unifiedRoadmapItems.filter(i => i.date < todayStr).length;
    const ongoing = unifiedRoadmapItems.filter(i => i.date === todayStr).length;
    const upcoming = unifiedRoadmapItems.filter(i => i.date > todayStr).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, annCount, agdCount, completed, ongoing, upcoming, percentage };
  }, [unifiedRoadmapItems, activeRoadmapAnnouncements, accessibleAgendas, todayStr]);

  // --------------------------------------------------------------------------
  // Scroll Navigation
  // --------------------------------------------------------------------------
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const handleFocusToday = () => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else if (scrollContainerRef.current) {
      const upcomingIndex = filteredItems.findIndex(a => a.date >= todayStr);
      if (upcomingIndex >= 0) {
        scrollContainerRef.current.scrollTo({ left: upcomingIndex * 320, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  };

  // Auto-scroll on mount / filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeNodeRef.current) {
        activeNodeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [filteredItems.length]);

  // --------------------------------------------------------------------------
  // Handlers for Add, Edit & Delete Agenda
  // --------------------------------------------------------------------------
  const handleOpenCreateAgenda = () => {
    setEditingAgenda(null);
    setNewAgdTitle('');
    setNewAgdDate(todayStr);
    setNewAgdTime('08:00 - 09:30 WIB');
    setNewAgdType('EXAM');
    setNewAgdTargetClass(user.className || 'SEMUA');
    setNewAgdSubject(user.subject || '');
    setNewAgdLocation('Ruang CBT & Lab Komputer');
    setNewAgdDescription('');
    setNewAgdIsImportant(false);
    setIsAddAgendaModalOpen(true);
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
    setIsAddAgendaModalOpen(true);
  };

  const handleCreateAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgdTitle.trim() || !newAgdDate) {
      alert('Judul dan tanggal agenda wajib diisi.');
      return;
    }

    const agendaPayload: AgendaItem = {
      id: editingAgenda ? editingAgenda.id : `agd-${Date.now()}`,
      title: newAgdTitle.trim(),
      date: newAgdDate,
      time: newAgdTime.trim() || '08:00 WIB',
      type: newAgdType,
      targetClass: newAgdTargetClass,
      subject: newAgdSubject.trim() || undefined,
      location: newAgdLocation.trim() || 'Ruang Kelas & CBT',
      description: newAgdDescription.trim() || undefined,
      author: editingAgenda ? editingAgenda.author : user.name,
      status: newAgdDate === todayStr ? 'ONGOING' : newAgdDate < todayStr ? 'COMPLETED' : 'UPCOMING',
      isImportant: newAgdIsImportant,
      linkedExamId: editingAgenda?.linkedExamId,
      createdAt: editingAgenda ? editingAgenda.createdAt : new Date().toISOString()
    };

    const updated = saveAgenda(agendaPayload);
    updateAgendasState(updated);
    if (selectedAgenda?.id === agendaPayload.id) {
      setSelectedAgenda(agendaPayload);
    }
    setIsAddAgendaModalOpen(false);
    setEditingAgenda(null);

    // Reset
    setNewAgdTitle('');
    setNewAgdDescription('');
    setNewAgdIsImportant(false);

    if (onShowToast) onShowToast(editingAgenda ? 'Milestone agenda berhasil diperbarui!' : 'Milestone agenda berhasil ditambahkan ke roadmap!', 'success');
  };

  const handleDeleteAgendaItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus milestone agenda ini dari roadmap?')) {
      const updated = deleteAgenda(id);
      updateAgendasState(updated);
      if (selectedAgenda?.id === id) {
        setSelectedAgenda(null);
      }
      if (onShowToast) onShowToast('Milestone agenda berhasil dihapus.', 'info');
    }
  };

  // --------------------------------------------------------------------------
  // Handlers for Add, Edit & Delete Announcement
  // --------------------------------------------------------------------------
  const handleOpenCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setNewAnnTitle('');
    setNewAnnCategory('AKADEMIK');
    setNewAnnPriority('HIGH');
    setNewAnnTargetRole('ALL');
    setNewAnnTargetClass('SEMUA');
    setNewAnnContent('');
    setNewAnnPinned(true);
    setNewAnnShowOnRoadmap(true);
    setNewAnnRoadmapUntilDate(defaultRoadmapUntilDate);
    setNewAnnAttachmentName('');
    setNewAnnAttachmentUrl('');
    setIsAddAnnModalOpen(true);
  };

  const handleOpenEditAnnouncement = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setNewAnnTitle(ann.title);
    setNewAnnCategory(ann.category);
    setNewAnnPriority(ann.priority);
    setNewAnnTargetRole(ann.targetRole as any || 'ALL');
    setNewAnnTargetClass(ann.targetClass || 'SEMUA');
    setNewAnnContent(ann.content);
    setNewAnnPinned(!!ann.pinned);
    setNewAnnShowOnRoadmap(ann.showOnRoadmap !== false);
    setNewAnnRoadmapUntilDate(ann.roadmapUntilDate || defaultRoadmapUntilDate);
    setNewAnnAttachmentName(ann.attachmentName || '');
    setNewAnnAttachmentUrl(ann.attachmentUrl || '');
    setIsAddAnnModalOpen(true);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      alert('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    if (editingAnnouncement) {
      // Update existing announcement (Admin can edit any teacher's announcement or own)
      const updatedItem: AnnouncementItem = {
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
        attachmentUrl: newAnnAttachmentUrl.trim() || undefined
      };

      const updatedList = saveAnnouncement(updatedItem);
      updateAnnouncementsState(updatedList);
      setIsAddAnnModalOpen(false);
      setEditingAnnouncement(null);

      // Also update selectedAnnouncement if currently viewed
      if (selectedAnnouncement?.id === editingAnnouncement.id) {
        setSelectedAnnouncement(updatedItem);
      }

      if (onShowToast) {
        const isEditingTeacherAnn = user.role === 'admin' && editingAnnouncement.authorName !== user.name;
        onShowToast(
          isEditingTeacherAnn
            ? `Pengumuman Guru (${editingAnnouncement.authorName}) berhasil diperbarui oleh Administrator.`
            : 'Pengumuman berhasil diperbarui.',
          'success'
        );
      }
    } else {
      // Create new announcement
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

      const updated = saveAnnouncement(created);
      updateAnnouncementsState(updated);
      setIsAddAnnModalOpen(false);

      // Reset
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnAttachmentName('');
      setNewAnnAttachmentUrl('');

      if (onShowToast) onShowToast('Pengumuman resmi berhasil diterbitkan ke Roadmap!', 'success');
    }
  };

  const handleDeleteAnnouncementItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus pengumuman ini dari linimasa dan sistem?')) {
      const updated = deleteAnnouncement(id);
      updateAnnouncementsState(updated);
      if (selectedAnnouncement?.id === id) {
        setSelectedAnnouncement(null);
      }
      if (onShowToast) onShowToast('Pengumuman berhasil dihapus.', 'info');
    }
  };

  const handleOpenAnnouncement = (ann: AnnouncementItem) => {
    setSelectedAnnouncement(ann);
    const updated = incrementAnnouncementViews(ann.id);
    updateAnnouncementsState(updated);
  };

  // --------------------------------------------------------------------------
  // Formatting Helpers
  // --------------------------------------------------------------------------
  const formatHumanDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dt = new Date(y, m, d);
        const day = DAY_NAMES[dt.getDay()];
        return `${day}, ${d} ${MONTH_NAMES[m]} ${y}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getRelativeBadge = (dateStr: string) => {
    if (dateStr === todayStr) {
      return {
        text: 'HARI INI',
        bg: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black animate-pulse shadow-md shadow-rose-500/20'
      };
    }
    const todayObj = new Date(todayStr);
    const dateObj = new Date(dateStr);
    const diffTime = dateObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      return { text: 'BESOK', bg: 'bg-cyan-500 text-slate-950 font-black' };
    }
    if (diffDays > 1 && diffDays <= 7) {
      return { text: `H-${diffDays}`, bg: 'bg-blue-900/90 text-blue-200 font-bold border border-blue-700' };
    }
    if (diffDays < 0) {
      return { text: 'SELESAI', bg: 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/80' };
    }
    return {
      text: `${dateStr.split('-')[2]} ${MONTH_NAMES[parseInt(dateStr.split('-')[1], 10) - 1]}`,
      bg: 'bg-slate-800 text-slate-300 font-medium'
    };
  };

  const getAgendaTheme = (type: AgendaType) => {
    switch (type) {
      case 'EXAM':
        return {
          label: 'UJIAN CBT',
          badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80',
          cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
          glow: 'from-emerald-950/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-emerald-500 text-slate-950 ring-emerald-500/40',
          accentGradient: 'bg-emerald-500',
          icon: <GraduationCap className="w-3.5 h-3.5" />
        };
      case 'CLASS':
        return {
          label: 'KBM KELAS',
          badgeBg: 'bg-blue-950/90 text-blue-300 border-blue-700/80',
          cardBorder: 'border-blue-500/40 hover:border-blue-400',
          glow: 'from-blue-950/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-blue-500 text-slate-950 ring-blue-500/40',
          accentGradient: 'bg-blue-500',
          icon: <BookOpen className="w-3.5 h-3.5" />
        };
      case 'TASK':
        return {
          label: 'TUGAS & KUIS',
          badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-700/80',
          cardBorder: 'border-amber-500/40 hover:border-amber-400',
          glow: 'from-amber-950/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-amber-500 text-slate-950 ring-amber-500/40',
          accentGradient: 'bg-amber-500',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      case 'MEETING':
        return {
          label: 'RAPAT DEWAN',
          badgeBg: 'bg-purple-950/90 text-purple-300 border-purple-700/80',
          cardBorder: 'border-purple-500/40 hover:border-purple-400',
          glow: 'from-purple-950/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-purple-500 text-slate-950 ring-purple-500/40',
          accentGradient: 'bg-purple-500',
          icon: <Users className="w-3.5 h-3.5" />
        };
      case 'EVENT':
        return {
          label: 'WORKSHOP & EVENT',
          badgeBg: 'bg-cyan-950/90 text-cyan-300 border-cyan-700/80',
          cardBorder: 'border-cyan-500/40 hover:border-cyan-400',
          glow: 'from-cyan-950/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-cyan-500 text-slate-950 ring-cyan-500/40',
          accentGradient: 'bg-cyan-500',
          icon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'HOLIDAY':
        return {
          label: 'LIBUR & PHBN',
          badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-700/80',
          cardBorder: 'border-rose-500/40 hover:border-rose-400',
          glow: 'from-rose-950/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-rose-500 text-slate-950 ring-rose-500/40',
          accentGradient: 'bg-rose-500',
          icon: <Award className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: 'AGENDA',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          cardBorder: 'border-slate-700 hover:border-slate-600',
          glow: 'from-slate-800/30 via-slate-900 to-slate-950',
          nodeBg: 'bg-slate-500 text-white ring-slate-500/40',
          accentGradient: 'bg-slate-500',
          icon: <CalendarDays className="w-3.5 h-3.5" />
        };
    }
  };

  return (
    <div id="agenda-horizontal-roadmap-section" className="w-full space-y-4">
      {/* 
        ========================================================================
        MAIN ROADMAP CONTAINER
        ========================================================================
      */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-md">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-gradient-to-b from-cyan-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-gradient-to-t from-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 
          1. HEADER BAR: Title, Live Badges, Quick Actions, & Navigation Controls
        */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
          
          {/* Left Title & Status Overview */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30 shrink-0 mt-0.5 sm:mt-0">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  Roadmap Linimasa Agenda & Pengumuman
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-950/90 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{stats.ongoing > 0 ? `${stats.ongoing} Agenda Hari Ini` : 'Linimasa Aktif'}</span>
                </span>
                {stats.annCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                    <Megaphone className="w-3 h-3 text-amber-400" />
                    <span>{stats.annCount} Pengumuman Terpasang</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alur tahapan pembelajaran, jadwal Tryout CBT, pengumuman resmi, KBM kelas, dan agenda sekolah secara kronologis.
              </p>
            </div>
          </div>

          {/* Right Controls: Stats Counters, Focus Today, Add Agenda/Pengumuman & Scroll Controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
            
            {/* Quick Counters Chip */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-2xl text-[11px]">
              <span className="text-slate-400">Total: <strong className="text-white">{stats.total}</strong></span>
              <span className="text-slate-700">•</span>
              <span className="text-amber-400 font-medium">Pengumuman: <strong className="text-white">{stats.annCount}</strong></span>
              <span className="text-slate-700">•</span>
              <span className="text-cyan-400 font-medium">Agenda: <strong className="text-white">{stats.agdCount}</strong></span>
            </div>

            {/* Jump / Focus Today Button */}
            <button
              type="button"
              onClick={handleFocusToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Fokus ke Posisi Hari Ini"
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hari Ini</span>
            </button>

            {/* Admin / Teacher Add Controls */}
            {(user.role === 'admin' || user.role === 'teacher') && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenCreateAgenda}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition-all cursor-pointer shrink-0 active:scale-95"
                  title="Tambah Agenda Milestone Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agenda</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateAnnouncement}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
                  title="Pasang Pengumuman ke Alur Roadmap"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Pengumuman</span>
                </button>
              </div>
            )}

            {/* Horizontal Scroll Navigation Buttons */}
            <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 p-0.5 rounded-xl shrink-0">
              <button
                type="button"
                onClick={handleScrollLeft}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Geser ke Kiri (Sebelumnya)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Geser ke Kanan (Berikutnya)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* 
          2. FILTER TABS & ROADMAP PROGRESS BAR
        */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Organized Menu Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'ALL'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
              }`}
            >
              <span>Semua</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                {unifiedRoadmapItems.length}
              </span>
            </button>

            {/* Dedicated Announcement Filter Tab */}
            <button
              type="button"
              onClick={() => setActiveFilter('ANNOUNCEMENT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'ANNOUNCEMENT'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md shadow-amber-500/25'
                  : 'bg-amber-950/30 text-amber-300 border border-amber-800/50 hover:bg-amber-900/50'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Pengumuman</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'ANNOUNCEMENT' ? 'bg-black/30 text-slate-950 font-black' : 'bg-amber-900/60 text-amber-200'}`}>
                {activeRoadmapAnnouncements.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('UPCOMING')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'UPCOMING'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-700 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Mendatang</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'UPCOMING' ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-900 text-slate-400'}`}>
                {unifiedRoadmapItems.filter(a => a.date >= todayStr).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('EXAM')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'EXAM'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span>Ujian CBT</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('CLASS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'CLASS'
                  ? 'bg-blue-950 text-blue-300 border border-blue-700 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
              <span>KBM & Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('TASK')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'TASK'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              <span>Tugas & Kuis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('MEETING')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'MEETING'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
              <span>Rapat Dewan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('EVENT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                activeFilter === 'EVENT'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span>Event & PHBN</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-950/60 border border-slate-800/90 px-3 py-1.5 rounded-xl self-start md:self-auto">
            <span className="text-[11px] text-slate-400 font-semibold">
              Progres Linimasa: <strong className="text-cyan-300">{stats.percentage}%</strong>
            </span>
            <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

        </div>

        {/* 
          3. HORIZONTAL ROADMAP TRACK & UNIFIED MILESTONE CARDS
        */}
        <div className="relative pt-3 pb-2">
          
          {/* Connecting Horizon Line (Behind Cards) */}
          <div className="absolute top-[42px] left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 via-amber-500/50 to-slate-800 z-0 pointer-events-none hidden md:block" />

          {/* Horizontal Scroll Viewport */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredItems.length === 0 ? (
              <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-6">
                <CalendarDays className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">
                  Tidak ada milestone agenda atau pengumuman pada filter ini.
                </p>
                {(user.role === 'admin' || user.role === 'teacher') && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewAgdDate(todayStr);
                        setIsAddAgendaModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Buat Agenda Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddAnnModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Buat Pengumuman</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isToday = item.date === todayStr;
                const isCompleted = item.date < todayStr;
                const relBadge = getRelativeBadge(item.date);

                // ============================================================
                // RENDER ITEM TYPE 1: PENGUMUMAN (Distinct Mega Icon & Glow)
                // ============================================================
                if (item.kind === 'ANNOUNCEMENT') {
                  const ann = item.data;
                  return (
                    <div
                      key={`ann-${ann.id}`}
                      ref={isToday ? activeNodeRef : null}
                      className="relative flex flex-col shrink-0 w-[295px] sm:w-[325px] group select-none"
                    >
                      {/* 
                        TOP MILESTONE PIN: MEGA ICON PENGUMUMAN (PEMBEDA KHUSUS)
                      */}
                      <div className="flex items-center gap-2 mb-3 z-10">
                        {/* Distinct Megaphone Node Circle */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg transition-transform group-hover:scale-115 shrink-0 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-slate-950 ring-4 ring-amber-500/40 animate-pulse"
                          title="Pengumuman Resmi Sekolah"
                        >
                          <Megaphone className="w-4 h-4 fill-slate-950 stroke-slate-950" />
                        </div>

                        {/* Step Label & Announcement Badge */}
                        <div className="flex items-center justify-between w-full pr-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                              <span>📢 PENGUMUMAN</span>
                            </span>
                            {ann.pinned && (
                              <span className="p-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                                <Pin className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800">
                            {ann.roadmapUntilDate ? `s/d ${formatHumanDate(ann.roadmapUntilDate).split(',')[1] || ann.roadmapUntilDate}` : relBadge.text}
                          </span>
                        </div>
                      </div>

                      {/* 
                        ANNOUNCEMENT CARD (Warm Amber Glow & Icon Distinction)
                      */}
                      <div
                        onClick={() => handleOpenAnnouncement(ann)}
                        className="flex-1 rounded-2xl p-4 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-500/10 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
                      >
                        {/* Top Amber-Orange Accent Ribbon */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

                        {/* Category & Priority Badges */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-700/80 flex items-center gap-1">
                            <Megaphone className="w-3 h-3 text-amber-400" />
                            <span>{ann.category}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                            ann.priority === 'HIGH'
                              ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                              : ann.priority === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {ann.priority === 'HIGH' ? '★ PENTING' : ann.priority === 'MEDIUM' ? 'INFO UTAMA' : 'INFO'}
                          </span>
                        </div>

                        {/* Title & Content Snippet */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                            {ann.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-normal">
                            {ann.content}
                          </p>
                        </div>

                        {/* Announcement Roadmap Validity Indicator */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/90 text-[11px]">
                          
                          {/* Validity Box */}
                          {ann.roadmapUntilDate && (
                            <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-[10px] text-amber-300">
                              <span className="flex items-center gap-1 font-bold">
                                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Tampil di Roadmap:</span>
                              </span>
                              <span className="font-extrabold font-mono text-amber-200">
                                s/d {ann.roadmapUntilDate}
                              </span>
                            </div>
                          )}

                          {/* Date Published & Author */}
                          <div className="flex items-center justify-between text-slate-400 text-[10px] pt-0.5">
                            <span className="truncate max-w-[140px]">
                              Oleh: <strong className="text-slate-300">{ann.authorName}</strong>
                            </span>
                            <span className="text-slate-500 font-mono">
                              {ann.date}
                            </span>
                          </div>

                          {/* Target Role & Class */}
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                              Sasaran: {ann.targetRole === 'ALL' ? 'Semua' : ann.targetRole === 'STUDENT' ? 'Siswa' : 'Dewan Guru'}
                            </span>
                            {ann.attachmentName && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-800 flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5" />
                                <span>Ada Lampiran</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer Action */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAnnouncement(ann);
                            }}
                            className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Baca Lengkap</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          {(user.role === 'admin' || ann.authorName === user.name) && (
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditAnnouncement(ann);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-950/50 transition-colors cursor-pointer"
                                title={user.role === 'admin' && ann.authorName !== user.name ? `Edit Pengumuman Guru (${ann.authorName}) sebagai Admin` : "Edit Pengumuman"}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteAnnouncementItem(ann.id, e)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                                title="Hapus Pengumuman"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                }

                // ============================================================
                // RENDER ITEM TYPE 2: AGENDA (Standard Agenda Milestone)
                // ============================================================
                const agd = item.data;
                const theme = getAgendaTheme(agd.type);

                return (
                  <div
                    key={`agd-${agd.id}`}
                    ref={isToday ? activeNodeRef : null}
                    className="relative flex flex-col shrink-0 w-[295px] sm:w-[325px] group select-none"
                  >
                    {/* 
                      TOP MILESTONE PIN: AGENDA STEP NUMBER
                    */}
                    <div className="flex items-center gap-2 mb-3 z-10">
                      
                      {/* Node Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg transition-transform group-hover:scale-110 shrink-0 ${
                          isToday
                            ? 'bg-gradient-to-tr from-amber-400 to-rose-500 text-slate-950 ring-4 ring-rose-500/30 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-500/40'
                            : 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isToday ? (
                          <Flame className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Step Label & Relative Badge */}
                      <div className="flex items-center justify-between w-full pr-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Tahap #{index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] ${relBadge.bg}`}>
                          {relBadge.text}
                        </span>
                      </div>

                    </div>

                    {/* 
                      AGENDA CARD 
                    */}
                    <div
                      onClick={() => setSelectedAgenda(agd)}
                      className={`flex-1 rounded-2xl p-4 bg-gradient-to-b ${theme.glow} border ${
                        isToday
                          ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-cyan-500/10'
                          : theme.cardBorder
                      } shadow-xl flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden`}
                    >
                      {/* Top Accent Line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          isToday
                            ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                            : isCompleted
                            ? 'bg-emerald-500'
                            : theme.accentGradient
                        }`}
                      />

                      {/* Card Category & Importance */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border flex items-center gap-1 ${theme.badgeBg}`}>
                          {theme.icon}
                          <span>{theme.label}</span>
                        </span>

                        {agd.isImportant && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                            ★ PENTING
                          </span>
                        )}
                      </div>

                      {/* Title & Short Description */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                          {agd.title}
                        </h4>
                        {agd.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {agd.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata: Date, Time, Class, & Location */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                        
                        {/* Date & Time */}
                        <div className="flex items-center justify-between text-slate-300">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <CalendarDays className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{formatHumanDate(agd.date)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{agd.time || 'Waktu Fleksibel'}</span>
                        </div>

                        {/* Class Target & Subject */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {agd.targetClass && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 font-bold text-[10px] border border-slate-700">
                              Kelas: {agd.targetClass}
                            </span>
                          )}
                          {agd.subject && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 font-medium text-[10px] border border-cyan-800/60">
                              {agd.subject}
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        {agd.location && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">{agd.location}</span>
                          </div>
                        )}

                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgenda(agd);
                          }}
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Detail Milestone</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* If CBT Exam & Student */}
                        {agd.type === 'EXAM' && agd.linkedExamId && onStartExam && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (agd.linkedExamId) onStartExam(agd.linkedExamId);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span>Kerjakan CBT</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {/* Admin / Teacher Controls (Edit & Delete) */}
                        {(user.role === 'admin' || user.role === 'teacher') && (
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditAgenda(agd, e)}
                              className="p-1 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-cyan-950/60 transition-colors cursor-pointer"
                              title="Edit Milestone Agenda"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAgendaItem(agd.id, e)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                              title="Hapus Milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })
            )}
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
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                    <Megaphone className="w-3 h-3 text-amber-400" /> PENGUMUMAN RESMI
                  </span>
                  {selectedAnnouncement.pinned && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-400" /> SEMATKAN
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedAnnouncement.category}
                  </span>
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
              
              {/* Roadmap Display Validity Badge if configured */}
              {selectedAnnouncement.roadmapUntilDate && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-2xl flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Ditampilkan pada Roadmap Linimasa sampai:</span>
                  </div>
                  <strong className="text-amber-200 font-mono">{selectedAnnouncement.roadmapUntilDate}</strong>
                </div>
              )}

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 font-sans">
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
                    <span className="text-[11px] text-slate-500 italic">Tersimpan di Dokumen</span>
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
        MODAL 2: DETAIL AGENDA MILESTONE
        ========================================================================
      */}
      {selectedAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Rincian Milestone</span>
                    {selectedAgenda.isImportant && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-950 text-rose-300 border border-rose-800">
                        PENTING
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-base leading-snug">
                    {selectedAgenda.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgenda(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
              
              {/* Timing & Type Info Box */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tanggal Pelaksanaan</p>
                  <p className="font-extrabold text-white text-xs sm:text-sm mt-0.5">
                    {formatHumanDate(selectedAgenda.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Waktu / Sesi</p>
                  <p className="font-extrabold text-cyan-300 text-xs sm:text-sm mt-0.5">
                    {selectedAgenda.time || 'Fleksibel'}
                  </p>
                </div>
              </div>

              {/* Badges Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Tipe Kegiatan</span>
                  <div className="font-bold text-slate-200 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    {getAgendaTheme(selectedAgenda.type).label}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Sasaran Kelas</span>
                  <div className="font-bold text-slate-200 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    {selectedAgenda.targetClass || 'Semua Kelas'}
                  </div>
                </div>
              </div>

              {selectedAgenda.subject && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Mata Pelajaran</span>
                  <div className="font-bold text-cyan-300 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/60">
                    {selectedAgenda.subject}
                  </div>
                </div>
              )}

              {selectedAgenda.location && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Lokasi / Ruangan</span>
                  <div className="flex items-center gap-2 font-medium text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{selectedAgenda.location}</span>
                  </div>
                </div>
              )}

              {selectedAgenda.description && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Deskripsi & Instruksi Kegiatan</span>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                    {selectedAgenda.description}
                  </div>
                </div>
              )}

              {selectedAgenda.author && (
                <div className="text-[11px] text-slate-500 pt-1">
                  Dibuat oleh: <strong className="text-slate-400">{selectedAgenda.author}</strong>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
              {(user.role === 'admin' || user.role === 'teacher') && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const itemToEdit = selectedAgenda;
                      setSelectedAgenda(null);
                      handleOpenEditAgenda(itemToEdit);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-bold text-xs border border-cyan-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Milestone</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleDeleteAgendaItem(selectedAgenda.id, e);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {selectedAgenda.type === 'EXAM' && selectedAgenda.linkedExamId && onStartExam && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAgenda.linkedExamId) onStartExam(selectedAgenda.linkedExamId);
                      setSelectedAgenda(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <span>Mulai Ujian CBT</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAgenda(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
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
        MODAL 3: FORM TAMBAH / EDIT AGENDA
        ========================================================================
      */}
      {isAddAgendaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleUp">
            
            <form onSubmit={handleCreateAgendaSubmit}>
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    {editingAgenda ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {editingAgenda ? 'Edit Milestone Agenda' : 'Tambah Milestone Agenda Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingAgenda ? 'Perbarui data milestone kegiatan pada roadmap' : 'Jadwalkan milestone kegiatan ke alur roadmap'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAgendaModalOpen(false);
                    setEditingAgenda(null);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Judul Agenda / Milestone *</label>
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-semibold"
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-semibold"
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
                      placeholder="Lab CBT 1 / Zoom"
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
                    placeholder="Instruksi, materi pembahasan, atau persiapan yang perlu dibawa..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-agd-road-imp"
                    checked={newAgdIsImportant}
                    onChange={e => setNewAgdIsImportant(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="chk-agd-road-imp" className="text-slate-300 font-bold cursor-pointer">
                    Tandai sebagai Agenda Wajib / Penting
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAgendaModalOpen(false);
                    setEditingAgenda(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold shadow-lg shadow-cyan-600/20 cursor-pointer"
                >
                  {editingAgenda ? 'Perbarui Milestone' : 'Simpan ke Roadmap'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 4: FORM TAMBAH / EDIT PENGUMUMAN DENGAN PENGATURAN ROADMAP
        ========================================================================
      */}
      {isAddAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-scaleUp">
            
            <form onSubmit={handleAnnouncementSubmit}>
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    {editingAnnouncement ? (
                      <Pencil className="w-5 h-5" />
                    ) : (
                      <Megaphone className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {editingAnnouncement
                        ? user.role === 'admin' && editingAnnouncement.authorName !== user.name
                          ? `Edit Pengumuman Guru (${editingAnnouncement.authorName})`
                          : 'Edit Pengumuman'
                        : 'Terbitkan Pengumuman ke Roadmap'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingAnnouncement
                        ? 'Perbarui konten atau masa aktif tayang pengumuman di roadmap'
                        : 'Pengumuman akan tampil sebagai icon khusus pada linimasa'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddAnnModalOpen(false)}
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
                          ? `Mode Edit Administrator: Anda memiliki hak akses penuh untuk mengubah pengumuman yang dibuat oleh Guru (${editingAnnouncement.authorName}).`
                          : 'Mode Edit Pengumuman: Silakan perbarui data atau pengaturan linimasa.'}
                      </p>
                      <p className="text-[11px] text-amber-400/80">
                        Penulis Asli: <strong>{editingAnnouncement.authorName}</strong> ({editingAnnouncement.authorRole}) • Tanggal Terbit: {editingAnnouncement.date}
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
                    placeholder="Contoh: Jadwal Resmi Pelaksanaan Tryout Akbar SNBT 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 outline-none font-semibold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Kategori Pengumuman</label>
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
                    <label className="block text-slate-300 font-bold mb-1">Prioritas Tampilan</label>
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
                      id="chk-road-show"
                      checked={newAnnShowOnRoadmap}
                      onChange={e => setNewAnnShowOnRoadmap(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="chk-road-show" className="text-amber-300 font-bold cursor-pointer flex items-center gap-1.5">
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
                    placeholder="Tuliskan instruksi lengkap, tata tertib, jadwal terperinci, dan link terkait..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nama File Lampiran (Opsional)</label>
                    <input
                      type="text"
                      value={newAnnAttachmentName}
                      onChange={e => setNewAnnAttachmentName(e.target.value)}
                      placeholder="Contoh: Petunjuk_CBT_2026.pdf"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">URL Link Lampiran (Opsional)</label>
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
                    id="chk-ann-road-pin"
                    checked={newAnnPinned}
                    onChange={e => setNewAnnPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="chk-ann-road-pin" className="text-slate-300 font-bold cursor-pointer">
                    Sematkan pengumuman di posisi utama (Pinned)
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan ke Linimasa'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
