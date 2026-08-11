import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../../types';
import {
  LearningJournalMeeting,
  loadStoredJournals,
  saveStoredJournals,
  generateWhatsAppMessage,
  WaSenderRole,
  WaReceiverRole,
  WaTemplateContext
} from './labschoolLaporanData';
import { LabschoolJournalModal } from './LabschoolJournalModal';
import { LabschoolWaPopupModal } from './LabschoolWaPopupModal';
import {
  BookOpen,
  Calendar,
  Clock,
  Send,
  Copy,
  Check,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Star,
  User as UserIcon,
  MessageSquare,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Layers,
  ChevronRight,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  X,
  FileText,
  CheckCheck,
  GraduationCap,
  Download,
  FolderOpen,
  Link2,
  ShieldCheck
} from 'lucide-react';

interface LabschoolBelajarAnalysisProps {
  user: User;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  selectedStudentId?: string;
  selectedStudentName?: string;
  selectedStudentNis?: string;
  selectedLevel?: 'SMP' | 'SMA' | 'ALL';
  selectedTargetCampusName?: string;
  latestTryoutScore?: number;
  onOpenPrintModal?: (type?: 'ALL' | 'TRYOUT' | 'QUIZ' | 'JOURNAL') => void;
}

export const LabschoolBelajarAnalysis: React.FC<LabschoolBelajarAnalysisProps> = ({
  user,
  onShowToast,
  selectedStudentId,
  selectedStudentName,
  selectedStudentNis,
  selectedLevel: propLevel,
  selectedTargetCampusName,
  latestTryoutScore: propTryoutScore,
  onOpenPrintModal
}) => {
  // Journals state with persistence
  const [journals, setJournals] = useState<LearningJournalMeeting[]>(() => loadStoredJournals());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<LearningJournalMeeting | null>(null);

  // WhatsApp Format Popup Modal State
  const [selectedMeetingForWaModal, setSelectedMeetingForWaModal] = useState<LearningJournalMeeting | null>(null);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  // Synchronized active values from Master Tryout Filter
  const effectiveStudentName = selectedStudentName || (user.role === 'student' ? user.name : 'Bintang Pratama');
  const effectiveStudentNis = selectedStudentNis || 'LAB-2026-089';
  const effectiveLevel = propLevel || 'SMA';
  const effectiveTargetCampus = selectedTargetCampusName || (effectiveLevel === 'SMP' ? 'SMP Labschool Rawamangun' : 'SMA Labschool Kebayoran');
  const effectiveTryoutScore = propTryoutScore || 88.5;

  // WhatsApp Generator State
  const initialSenderRole: WaSenderRole =
    user.role === 'admin'
      ? 'ADMIN'
      : user.role === 'teacher'
      ? 'GURU'
      : 'SISWA';

  const [waSenderRole, setWaSenderRole] = useState<WaSenderRole>(initialSenderRole);
  const [waReceiverRole, setWaReceiverRole] = useState<WaReceiverRole>(
    initialSenderRole === 'SISWA' ? 'GURU' : 'WALI_MURID'
  );

  // Table & View Mode State
  const [journalViewMode, setJournalViewMode] = useState<'table' | 'cards'>('table');
  const [journalSearchQuery, setJournalSearchQuery] = useState<string>('');
  const [journalSubtestFilter, setJournalSubtestFilter] = useState<string>('ALL');
  const [journalAttendanceFilter, setJournalAttendanceFilter] = useState<string>('ALL');
  const [journalProgressFilter, setJournalProgressFilter] = useState<string>('ALL');
  const [journalSortBy, setJournalSortBy] = useState<'meeting_desc' | 'meeting_asc' | 'date_desc' | 'rating_desc'>('meeting_desc');
  const [selectedMeetingForDetail, setSelectedMeetingForDetail] = useState<LearningJournalMeeting | null>(null);

  // WA Section Ref for Smooth Scrolling
  const waSectionRef = useRef<HTMLDivElement | null>(null);

  // WA Form Customization
  const [studentName, setStudentName] = useState<string>(effectiveStudentName);
  const [studentNis, setStudentNis] = useState<string>(effectiveStudentNis);
  const [studentClass, setStudentClass] = useState<string>(`Masuk ${effectiveLevel} Labschool`);
  const [targetCampus, setTargetCampus] = useState<string>(effectiveTargetCampus);
  const [teacherName, setTeacherName] = useState<string>(
    user.role === 'teacher' ? user.name : 'Dr. Hendra Wijaya, M.Pd.'
  );
  const [parentName, setParentName] = useState<string>('Bapak/Ibu Orang Tua Siswa');
  const [receiverPhone, setReceiverPhone] = useState<string>('081280001968');
  const [selectedMeetingNumber, setSelectedMeetingNumber] = useState<number>(1);
  const [customConsultationTopic, setCustomConsultationTopic] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [editableWaText, setEditableWaText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Synchronize internal state when props change
  useEffect(() => {
    setStudentName(effectiveStudentName);
    setStudentNis(effectiveStudentNis);
    setStudentClass(`Masuk ${effectiveLevel} Labschool`);
    setTargetCampus(effectiveTargetCampus);
  }, [effectiveStudentName, effectiveStudentNis, effectiveLevel, effectiveTargetCampus]);

  // Filtered Journals (Tersinkronisasi otomatis dengan Jenjang Aktif)
  const filteredJournals = useMemo(() => {
    return journals.filter(j => {
      return effectiveLevel === 'ALL' || j.level === effectiveLevel;
    });
  }, [journals, effectiveLevel]);

  // Filtered and Sorted Journals for Table / Cards
  const filteredAndSortedJournals = useMemo(() => {
    let list = filteredJournals;

    if (journalSubtestFilter !== 'ALL') {
      list = list.filter(j => j.subtestCode === journalSubtestFilter);
    }

    if (journalAttendanceFilter !== 'ALL') {
      list = list.filter(j => j.attendanceStatus === journalAttendanceFilter);
    }

    if (journalProgressFilter !== 'ALL') {
      list = list.filter(j => (j.progress || 'SUDAH') === journalProgressFilter);
    }

    if (journalSearchQuery.trim()) {
      const q = journalSearchQuery.toLowerCase();
      list = list.filter(j =>
        j.topicTitle.toLowerCase().includes(q) ||
        j.subjectName.toLowerCase().includes(q) ||
        j.instructorName.toLowerCase().includes(q) ||
        (j.subtopics && j.subtopics.some(s => s.toLowerCase().includes(q))) ||
        (j.studentNotes && j.studentNotes.toLowerCase().includes(q)) ||
        (j.teacherEvaluation && j.teacherEvaluation.toLowerCase().includes(q)) ||
        (j.homeworkTask && j.homeworkTask.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (journalSortBy === 'meeting_desc') return b.meetingNumber - a.meetingNumber;
      if (journalSortBy === 'meeting_asc') return a.meetingNumber - b.meetingNumber;
      if (journalSortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (journalSortBy === 'rating_desc') return b.comprehensionRating - a.comprehensionRating;
      return 0;
    });
  }, [filteredJournals, journalSubtestFilter, journalAttendanceFilter, journalProgressFilter, journalSearchQuery, journalSortBy]);

  // Selected Meeting for WA Context
  const activeMeeting = useMemo(() => {
    const pool = filteredJournals.length > 0 ? filteredJournals : journals;
    return pool.find(j => j.meetingNumber === selectedMeetingNumber) || pool[pool.length - 1] || pool[0];
  }, [filteredJournals, journals, selectedMeetingNumber]);

  // Set default selected meeting when filtered journals change
  useEffect(() => {
    if (filteredJournals.length > 0) {
      setSelectedMeetingNumber(filteredJournals[filteredJournals.length - 1].meetingNumber);
    }
  }, [effectiveLevel]);

  // Handler to open WA Popup Modal
  const handleOpenWaModal = (meeting: LearningJournalMeeting) => {
    setSelectedMeetingForWaModal(meeting);
    setIsWaModalOpen(true);
  };

  // Handler to select meeting and scroll to WhatsApp generator
  const handleSelectMeetingForWa = (meetingNum: number) => {
    setSelectedMeetingNumber(meetingNum);
    const targetM = filteredJournals.find(j => j.meetingNumber === meetingNum);
    if (targetM) {
      handleOpenWaModal(targetM);
    }
    if (onShowToast) {
      onShowToast(`Sesi Pertemuan #${meetingNum} dipilih untuk format pesan WhatsApp`, 'info');
    }
  };

  // Helper for Subtest Badge Colors
  const getSubtestBadgeClass = (code: string) => {
    switch (code) {
      case 'PK':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'KV':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'PM':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'KA':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'SK':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'SIM':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
  };

  // Helper for Progress Status Badge
  const renderProgressBadge = (progress: 'BELUM' | 'SEDANG' | 'SUDAH', meetingId?: string) => {
    const isSudah = progress === 'SUDAH';
    const isSedang = progress === 'SEDANG';
    const isBelum = progress === 'BELUM' || !progress;

    return (
      <div className="inline-flex items-center gap-1">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
            isSudah
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isSedang
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {isSudah ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Sudah</span>
            </>
          ) : isSedang ? (
            <>
              <Clock className="w-3 h-3 text-blue-400 shrink-0" />
              <span>Sedang</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Belum</span>
            </>
          )}
        </span>
      </div>
    );
  };

  // Quick toggle progress for a meeting
  const handleQuickToggleProgress = (meetingId: string, current: 'BELUM' | 'SEDANG' | 'SUDAH') => {
    if (user.role === 'student') return; // Fitur CRUD nonaktif untuk siswa
    const nextStatus: 'BELUM' | 'SEDANG' | 'SUDAH' =
      current === 'BELUM' ? 'SEDANG' : current === 'SEDANG' ? 'SUDAH' : 'BELUM';
    
    handleUpdateMeetingProgress(meetingId, nextStatus);
  };

  // Handle direct update of progress
  const handleUpdateMeetingProgress = (meetingId: string, newProgress: 'BELUM' | 'SEDANG' | 'SUDAH') => {
    if (user.role === 'student') return; // Fitur CRUD nonaktif untuk siswa
    const updated = journals.map(j => {
      if (j.id === meetingId) {
        return {
          ...j,
          progress: newProgress,
          homeworkStatus: newProgress === 'SUDAH' ? 'SEMPURNA' : j.homeworkStatus
        };
      }
      return j;
    });

    setJournals(updated);
    saveStoredJournals(updated);

    if (onShowToast) {
      const label = newProgress === 'SUDAH' ? 'Sudah Selesai' : newProgress === 'SEDANG' ? 'Sedang Berjalan' : 'Belum Dimulai';
      onShowToast(`Status progres sesi diubah menjadi: ${label}`, 'success');
    }
  };

  // Handle Download Action for a Journal Meeting
  const handleDownloadMeetingMaterial = (item: LearningJournalMeeting) => {
    if (item.driveLink) {
      window.open(item.driveLink, '_blank', 'noopener,noreferrer');
      if (onShowToast) {
        onShowToast(`Membuka Google Drive Modul: ${item.driveLinkTitle || item.topicTitle}`, 'success');
      }
      return;
    }

    // Export comprehensive journal summary text file
    const content = `======================================================
LAPORAN JURNAL BELAJAR & MODUL MATERI LABSCHOOL 2026
======================================================
Pertemuan: #${item.meetingNumber}
Tanggal: ${item.date} (${item.timeRange})
Jenjang: ${item.level} Labschool
Target Kampus: ${item.targetCampus || targetCampus}

[MAPEL & SILABUS]
Subtes: ${item.subtestCode} - ${item.subjectName}
Kode Silabus: ${item.syllabusCode || 'SIL-LABSCHOOL-2026'}
Guru Pengampu: ${item.instructorName} (${item.instructorRole || 'Master Tutor Labschool'})
Metode: ${item.teachingMethod || 'Problem-Based Learning & Speed Drills'}

[TOPIK & RINCIAN MATERI]
Materi Pokok: ${item.topicTitle}
Sub-Materi:
${(item.subtopics || []).map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}

[CAPAIAN & PEMAHAMAN SISWA]
Tingkat Pemahaman: ${item.comprehensionRating}/5 ⭐ (${item.comprehensionPercentage}%)
Status Kehadiran: ${item.attendanceStatus}
Status Progres: ${item.progress || 'SUDAH'}
Catatan Siswa: ${item.studentNotes || '-'}

[EVALUASI GURU & TUGAS MANDIRI]
Evaluasi Guru: ${item.teacherEvaluation || '-'}
Tugas Mandiri (PR): ${item.homeworkTask || 'Tidak ada PR'} (Status: ${item.homeworkStatus || 'SEMPURNA'})

Target Capaian: ${item.competencyTarget || 'Menguasai konsep dan strategi pengerjaan soal seleksi PSB Labschool 2026.'}
======================================================
Diunduh pada: ${new Date().toLocaleString('id-ID')}
Platform Pembelajaran & Seleksi Labschool Super Intensif
======================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jurnal_Belajar_Labschool_Pertemuan_${item.meetingNumber}_${item.subtestCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`Berhasil mengunduh ringkasan Pertemuan #${item.meetingNumber}`, 'success');
    }
  };

  // Update default receiver role when sender role changes
  const handleSenderRoleChange = (newSender: WaSenderRole) => {
    setWaSenderRole(newSender);
    if (newSender === 'ADMIN' || newSender === 'GURU') {
      setWaReceiverRole('WALI_MURID');
      setCustomNotes('');
    } else if (newSender === 'SISWA') {
      setWaReceiverRole('GURU');
      setCustomConsultationTopic(activeMeeting?.topicTitle || 'Pengetahuan Kuantitatif & Deret Aljabar');
      setCustomNotes('Saya masih mengalami kesulitan pada variasi soal perbandingan berbalik nilai dan aljabar substitusi. Mohon bimbingannya ya Pak/Bu.');
    } else if (newSender === 'WALI_MURID') {
      setWaReceiverRole('GURU');
      setCustomNotes(`Berdasarkan evaluasi belajar ananda (${studentName}), bagaimana kesiapan ananda menghadapi Seleksi PSB Labschool 2026? Serta apa yang perlu kami dukung di rumah?`);
    }
  };

  // Re-generate WA message whenever context changes
  useEffect(() => {
    const ctx: WaTemplateContext = {
      senderRole: waSenderRole,
      receiverRole: waReceiverRole,
      studentName,
      studentNis,
      studentClass,
      targetCampus,
      latestTryoutScore: effectiveTryoutScore,
      latestQuizScore: 95.0,
      latestMeetingNumber: activeMeeting ? activeMeeting.meetingNumber : 1,
      latestTopic: activeMeeting ? activeMeeting.topicTitle : 'Bedah Soal Kuantitatif & Aljabar Seleksi Labschool',
      comprehensionRating: activeMeeting ? activeMeeting.comprehensionRating : 5,
      teacherName,
      parentName,
      customConsultationTopic,
      customNotes,
      receiverPhone
    };

    const gen = generateWhatsAppMessage(ctx);
    setEditableWaText(gen.message);
  }, [
    waSenderRole,
    waReceiverRole,
    studentName,
    studentNis,
    studentClass,
    targetCampus,
    effectiveTryoutScore,
    activeMeeting,
    teacherName,
    parentName,
    customConsultationTopic,
    customNotes,
    receiverPhone
  ]);

  // Handle Save Journal Meeting
  const handleSaveMeeting = (newMeeting: LearningJournalMeeting) => {
    if (user.role === 'student') return; // Fitur CRUD nonaktif untuk siswa
    let updated: LearningJournalMeeting[];
    const exists = journals.some(j => j.id === newMeeting.id);
    if (exists) {
      updated = journals.map(j => (j.id === newMeeting.id ? newMeeting : j));
    } else {
      updated = [...journals, newMeeting].sort((a, b) => a.meetingNumber - b.meetingNumber);
    }
    setJournals(updated);
    saveStoredJournals(updated);
    if (onShowToast) {
      onShowToast('Jurnal pertemuan belajar berhasil disimpan & disinkronkan!', 'success');
    }
  };

  // Handle Delete Journal Meeting
  const handleDeleteMeeting = (id: string) => {
    if (user.role === 'student') return; // Fitur CRUD nonaktif untuk siswa
    if (window.confirm('Hapus sesi pertemuan jurnal ini?')) {
      const updated = journals.filter(j => j.id !== id);
      setJournals(updated);
      saveStoredJournals(updated);
      if (onShowToast) {
        onShowToast('Jurnal pertemuan berhasil dihapus.', 'info');
      }
    }
  };

  // Handle Copy to Clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(editableWaText);
    setIsCopied(true);
    if (onShowToast) {
      onShowToast('Teks pesan WhatsApp berhasil disalin ke clipboard!', 'success');
    }
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Handle Direct WhatsApp Link
  const handleOpenWhatsApp = () => {
    const cleanPhone = receiverPhone.replace(/\D/g, '').replace(/^0/, '62');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(editableWaText)}`;
    window.open(url, '_blank');
    if (onShowToast) {
      onShowToast('Membuka WhatsApp...', 'info');
    }
  };

  // Summary Metrics for Journal
  const journalMetrics = useMemo(() => {
    const total = filteredJournals.length;
    const totalMinutes = filteredJournals.reduce((sum, j) => sum + j.durationMinutes, 0);
    const avgRating = total > 0 ? +(filteredJournals.reduce((sum, j) => sum + j.comprehensionRating, 0) / total).toFixed(1) : 5.0;
    const hadirCount = filteredJournals.filter(j => j.attendanceStatus === 'HADIR').length;
    const attendancePct = total > 0 ? Math.round((hadirCount / total) * 100) : 100;

    // Progress metrics
    const sudahCount = filteredJournals.filter(j => (j.progress || 'SUDAH') === 'SUDAH').length;
    const sedangCount = filteredJournals.filter(j => j.progress === 'SEDANG').length;
    const belumCount = filteredJournals.filter(j => j.progress === 'BELUM').length;
    const completionRate = total > 0 ? Math.round((sudahCount / total) * 100) : 0;

    return {
      totalMeetings: total,
      totalHours: (totalMinutes / 60).toFixed(1),
      avgRating,
      attendancePct,
      sudahCount,
      sedangCount,
      belumCount,
      completionRate
    };
  }, [filteredJournals]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                Analisis Jurnal Belajar & Generator Pesan WA
              </h2>
              <p className="text-xs text-slate-400">
                Riwayat pertemuan belajar, topik silabus terintegrasi, status progres materi (Belum/Sedang/Sudah), dan popup laporan WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Status Sinkronisasi Otomatis */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">Siswa:</span>
                <strong className="text-slate-100 font-bold">{effectiveStudentName}</strong>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                  {effectiveLevel} Labschool
                </span>
              </div>
            </div>

            {/* Tombol Tambah Jurnal (Hanya Admin / Guru) */}
            {user.role !== 'student' ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMeeting(null);
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Jurnal</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Mode Siswa (Hanya Lihat)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards with Cleaned-Up Layout & Proportional Spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Sesi */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Total Sesi</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">{journalMetrics.totalMeetings}</span>
              <span className="text-xs text-slate-400 font-semibold">Sesi</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">{journalMetrics.totalHours} Jam Intensif</span>
          </div>
        </div>

        {/* 2. Progres Tuntas (Sudah) */}
        <div className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 transition-colors shadow-sm bg-gradient-to-br from-emerald-950/20 to-slate-900/90">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-emerald-300/80 block font-medium">Progres Tuntas</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{journalMetrics.sudahCount}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {journalMetrics.totalMeetings}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 block">{journalMetrics.completionRate}% Silabus Tuntas</span>
          </div>
        </div>

        {/* 3. Sedang & Belum */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Sedang / Belum</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                {journalMetrics.sedangCount} Sedang
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                {journalMetrics.belumCount} Belum
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Dalam Tahap Drill</span>
          </div>
        </div>

        {/* 4. Rata-rata Pemahaman */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Rata-rata Pemahaman</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400">{journalMetrics.avgRating}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
            </div>
            <span className="text-[10px] text-amber-300/90 font-medium block">
              {(Number(journalMetrics.avgRating) * 20).toFixed(0)}% Indeks Penguasaan
            </span>
          </div>
        </div>

        {/* 5. Kehadiran Siswa */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 col-span-2 sm:col-span-1 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Kehadiran Siswa</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-teal-400">{journalMetrics.attendancePct}%</span>
            </div>
            <span className="text-[10px] text-teal-300/80 font-medium block">Presensi Aktif</span>
          </div>
        </div>
      </div>

      {/* COMPACT HORIZONTAL PROGRESS BAR: PROGRES MATERI (SUDAH, SEDANG, BELUM) */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Grafik Progres Silabus & Status Materi Belajar
            </h4>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-medium border border-slate-700">
              Total {journalMetrics.totalMeetings} Materi
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {journalMetrics.completionRate}% Tuntas
            </span>
          </div>
        </div>

        {/* Small Compact Segmented Horizontal Bar Chart */}
        <div className="space-y-1.5">
          <div className="relative h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
            {/* Sudah Tuntas Segment */}
            <div
              style={{
                width: `${journalMetrics.totalMeetings > 0 ? (journalMetrics.sudahCount / journalMetrics.totalMeetings) * 100 : 0}%`
              }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-l-full relative group"
              title={`Sudah Tuntas: ${journalMetrics.sudahCount} materi (${journalMetrics.completionRate}%)`}
            />

            {/* Sedang Berjalan Segment */}
            <div
              style={{
                width: `${journalMetrics.totalMeetings > 0 ? (journalMetrics.sedangCount / journalMetrics.totalMeetings) * 100 : 0}%`
              }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 relative group"
              title={`Sedang Dipelajari: ${journalMetrics.sedangCount} materi`}
            />

            {/* Belum Dimulai Segment */}
            <div
              style={{
                width: `${journalMetrics.totalMeetings > 0 ? (journalMetrics.belumCount / journalMetrics.totalMeetings) * 100 : 0}%`
              }}
              className="h-full bg-slate-700 transition-all duration-500 rounded-r-full relative group"
              title={`Belum Dimulai: ${journalMetrics.belumCount} materi`}
            />
          </div>

          {/* Compact Legend Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-500/50" />
              <span className="font-semibold text-slate-200">Sudah Tuntas:</span>
              <strong className="text-emerald-400">{journalMetrics.sudahCount}</strong>
              <span className="text-slate-500">
                ({journalMetrics.totalMeetings > 0 ? Math.round((journalMetrics.sudahCount / journalMetrics.totalMeetings) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs shadow-blue-500/50" />
              <span className="font-semibold text-slate-200">Sedang Dipelajari:</span>
              <strong className="text-blue-400">{journalMetrics.sedangCount}</strong>
              <span className="text-slate-500">
                ({journalMetrics.totalMeetings > 0 ? Math.round((journalMetrics.sedangCount / journalMetrics.totalMeetings) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="font-semibold text-slate-200">Belum Dimulai:</span>
              <strong className="text-slate-400">{journalMetrics.belumCount}</strong>
              <span className="text-slate-500">
                ({journalMetrics.totalMeetings > 0 ? Math.round((journalMetrics.belumCount / journalMetrics.totalMeetings) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: LAPORAN JURNAL BELAJAR & RIWAYAT PERTEMUAN (TABEL & TIMELINE) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide flex items-center gap-2 flex-wrap">
                <span>Laporan Jurnal Belajar & Riwayat Pertemuan</span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {filteredAndSortedJournals.length} Sesi Terdata
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tabel monitoring pembelajaran dengan status progres (Belum, Sedang, Sudah) dan integrasi popup format WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jenjang <strong>{effectiveLevel} Labschool</strong></span>
            </div>

            {/* View Switcher: Tabel vs Kartu */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setJournalViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  journalViewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Tabel Komprehensif"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setJournalViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  journalViewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Kartu Detail"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter, Search & Sort Toolbar */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 mb-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari topik, subtopik, guru, atau catatan..."
                value={journalSearchQuery}
                onChange={(e) => setJournalSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs rounded-xl pl-9 pr-8 py-2.5 border border-slate-700/80 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
              {journalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setJournalSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Subtes */}
            <div className="lg:col-span-3">
              <select
                value={journalSubtestFilter}
                onChange={(e) => setJournalSubtestFilter(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
              >
                <option value="ALL">Semua Subtes / Mapel</option>
                <option value="PK">PK - Pengetahuan Kuantitatif</option>
                <option value="KV">KV - Kemampuan Verbal</option>
                <option value="PM">PM - Penalaran Matematika</option>
                <option value="KA">KA - Kemampuan Akademik (Sains/IPS)</option>
                <option value="SK">SK - Survei Karakter</option>
                <option value="SIM">SIM - Simulasi & Evaluasi Akbar</option>
              </select>
            </div>

            {/* Filter Progres (Belum, Sedang, Sudah) */}
            <div className="lg:col-span-2">
              <select
                value={journalProgressFilter}
                onChange={(e) => setJournalProgressFilter(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-blue-500 cursor-pointer font-bold text-emerald-400"
              >
                <option value="ALL" className="text-white">Semua Progres</option>
                <option value="SUDAH" className="text-emerald-400">✅ Sudah Selesai</option>
                <option value="SEDANG" className="text-blue-400">🔄 Sedang Berjalan</option>
                <option value="BELUM" className="text-amber-400">⏳ Belum Dimulai</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="lg:col-span-3">
              <select
                value={journalSortBy}
                onChange={(e) => setJournalSortBy(e.target.value as any)}
                className="w-full bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
              >
                <option value="meeting_desc">Urutan: Sesi Terbaru (#Max)</option>
                <option value="meeting_asc">Urutan: Sesi Pertama (#1)</option>
                <option value="date_desc">Urutan: Tanggal Terkini</option>
                <option value="rating_desc">Urutan: Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips / Reset */}
          {(journalSearchQuery || journalSubtestFilter !== 'ALL' || journalAttendanceFilter !== 'ALL' || journalProgressFilter !== 'ALL') && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-[11px]">Filter Aktif:</span>
                {journalSearchQuery && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[11px] font-medium border border-blue-500/30 flex items-center gap-1">
                    Pencarian: "{journalSearchQuery}"
                  </span>
                )}
                {journalSubtestFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30">
                    Subtes: {journalSubtestFilter}
                  </span>
                )}
                {journalProgressFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
                    Progres: {journalProgressFilter}
                  </span>
                )}
                {journalAttendanceFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/30">
                    Kehadiran: {journalAttendanceFilter}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setJournalSearchQuery('');
                  setJournalSubtestFilter('ALL');
                  setJournalAttendanceFilter('ALL');
                  setJournalProgressFilter('ALL');
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* TABEL VIEW (UTAMA) */}
        {journalViewMode === 'table' ? (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-3 sm:px-4 text-center w-14"># Sesi</th>
                    <th className="py-3.5 px-3 sm:px-4 min-w-[170px]">Tanggal, Waktu & Status</th>
                    <th className="py-3.5 px-3 sm:px-4 min-w-[150px]">Subtes / Mapel</th>
                    <th className="py-3.5 px-3 sm:px-4 min-w-[270px]">Topik, Sub-materi & Pemahaman</th>
                    <th className="py-3.5 px-3 sm:px-4 min-w-[140px]">Guru Pengampu & Metode</th>
                    <th className="py-3.5 px-3 sm:px-4 min-w-[180px]">Evaluasi & Catatan</th>
                    <th className="py-3.5 px-3 sm:px-4 min-w-[130px]">Tugas / PR</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right min-w-[130px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAndSortedJournals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <BookOpen className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-300">Tidak ada data jurnal belajar yang sesuai dengan filter.</p>
                          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter subtes/progres.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setJournalSearchQuery('');
                              setJournalSubtestFilter('ALL');
                              setJournalAttendanceFilter('ALL');
                              setJournalProgressFilter('ALL');
                            }}
                            className="mt-2 px-3 py-1.5 rounded-xl bg-slate-800 text-blue-300 hover:text-white text-xs font-bold"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedJournals.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-900/60 transition-colors group"
                      >
                        {/* 1. Sesi */}
                        <td className="py-3.5 px-3 sm:px-4 text-center align-top">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md">
                            #{item.meetingNumber}
                          </span>
                        </td>

                        {/* 2. Tanggal, Waktu & Status (Progres + Kehadiran diletakkan di sini, urutan atas-bawah rapi) */}
                        <td className="py-3.5 px-3 sm:px-4 align-top">
                          <div className="space-y-2">
                            {/* Baris Atas: Tanggal & Waktu */}
                            <div>
                              <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                {item.date}
                              </span>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{item.timeRange}</span>
                                <span className="inline-block px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium">
                                  {item.durationMinutes}m
                                </span>
                              </div>
                            </div>

                            {/* Baris Bawah: Label Progres & Kehadiran (Atas Bawah Rapi) */}
                            <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
                              {/* Label Progres (Belum, Sedang, Sudah) */}
                              <div className="flex items-center gap-1.5">
                                {user.role !== 'student' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickToggleProgress(item.id, item.progress || 'SUDAH')}
                                    title="Klik untuk ubah status progres (Belum -> Sedang -> Sudah)"
                                    className="cursor-pointer transition-transform hover:scale-105 inline-block text-left"
                                  >
                                    {renderProgressBadge(item.progress || 'SUDAH', item.id)}
                                  </button>
                                ) : (
                                  <div title="Status progres pembelajaran diverifikasi oleh Guru">
                                    {renderProgressBadge(item.progress || 'SUDAH', item.id)}
                                  </div>
                                )}
                              </div>

                              {/* Label Kehadiran Siswa */}
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    item.attendanceStatus === 'HADIR'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : item.attendanceStatus === 'IZIN'
                                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                      : item.attendanceStatus === 'SAKIT'
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    item.attendanceStatus === 'HADIR' ? 'bg-emerald-400' : item.attendanceStatus === 'IZIN' ? 'bg-blue-400' : item.attendanceStatus === 'SAKIT' ? 'bg-amber-400' : 'bg-rose-400'
                                  }`} />
                                  <span>{item.attendanceStatus}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Subtes / Mapel */}
                        <td className="py-3.5 px-3 sm:px-4 align-top">
                          <div className="space-y-1">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${getSubtestBadgeClass(item.subtestCode)}`}>
                              {item.subtestCode}
                            </span>
                            <p className="font-semibold text-slate-200 text-xs leading-snug">
                              {item.subjectName}
                            </p>
                            <span className="text-[10px] text-slate-400 block">
                              Jenjang: {item.level} Labschool
                            </span>
                          </div>
                        </td>

                        {/* 4. Topik, Submateri & Pemahaman (Pemahaman diletakkan di bawah submateri, urutan atas-bawah rapi) */}
                        <td className="py-3.5 px-3 sm:px-4 align-top">
                          <div className="space-y-2 max-w-sm">
                            {/* Judul Topik Pokok Bahasan */}
                            <div>
                              <h4 className="font-bold text-slate-100 text-xs leading-relaxed group-hover:text-blue-300 transition-colors">
                                {item.topicTitle}
                              </h4>
                              {item.syllabusCode && (
                                <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
                                  <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span>Silabus: {item.syllabusCode}</span>
                                </span>
                              )}
                            </div>

                            {/* Submateri List Pills */}
                            {item.subtopics && item.subtopics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.subtopics.map((sub, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
                                  >
                                    • {sub}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Tingkat Pemahaman Siswa (Rating ⭐ & Bar Pemahaman) */}
                            <div className="pt-1.5 border-t border-slate-800/80 space-y-1 bg-slate-900/40 p-2 rounded-xl border">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-300 text-[10px] font-bold flex items-center gap-1">
                                  <span className="text-amber-400">⭐</span> Pemahaman Siswa:
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="font-black text-amber-300 text-xs">
                                    {item.comprehensionRating}/5
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ({item.comprehensionPercentage}%)
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${item.comprehensionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 5. Guru Pengampu & Metode */}
                        <td className="py-3.5 px-3 sm:px-4 align-top">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-200 block text-xs">
                              {item.instructorName}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-medium block">
                              {item.instructorRole || 'Master Tutor Labschool'}
                            </span>
                            {item.teachingMethod && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] text-slate-400">
                                {item.teachingMethod}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Catatan & Evaluasi */}
                        <td className="py-3.5 px-3 sm:px-4 align-top">
                          <div className="space-y-1.5 max-w-xs">
                            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                                Evaluasi Guru:
                              </span>
                              <p className="line-clamp-2 leading-relaxed text-slate-300 text-[11px]">
                                {item.teacherEvaluation}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 7. Tugas / PR */}
                        <td className="py-3.5 px-3 sm:px-4 align-top">
                          {item.homeworkTask ? (
                            <div className="space-y-1 max-w-[140px]">
                              <p className="text-[11px] text-slate-300 font-medium line-clamp-2">
                                {item.homeworkTask}
                              </p>
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                                {item.homeworkStatus || 'SEMPURNA'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">- Tidak ada PR -</span>
                          )}
                        </td>

                        {/* 8. Aksi */}
                        <td className="py-3.5 px-3 sm:px-4 text-right align-top">
                          <div className="flex flex-col items-end gap-1.5 min-w-[130px]">
                            {/* Baris Atas Aksi: Format WA, Cetak, Detail, Edit & Hapus */}
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Tombol Format WA Popup */}
                              <button
                                type="button"
                                onClick={() => handleOpenWaModal(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-600/60 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-emerald-900/20"
                                title="Buka Popup Format Laporan WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Format WA</span>
                              </button>

                                {/* Tombol Detail */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedMeetingForDetail(item)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                                  title="Lihat Detail Lengkap"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                              {/* Tombol Edit & Hapus (Staff/Admin) */}
                              {user.role !== 'student' && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMeeting(item);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                                    title="Edit Jurnal"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMeeting(item.id)}
                                    className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-white hover:bg-rose-600"
                                    title="Hapus Jurnal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Baris Bawah Aksi: Tombol Download (Paling Bawah, Rapi) */}
                            <button
                              type="button"
                              onClick={() => handleDownloadMeetingMaterial(item)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                                item.driveLink
                                  ? 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-300 hover:text-white border-emerald-600/50 shadow-sm shadow-emerald-900/20'
                                  : 'bg-indigo-950/60 hover:bg-indigo-800/80 text-indigo-300 hover:text-white border-indigo-700/50 shadow-sm shadow-indigo-900/20'
                              }`}
                              title={item.driveLink ? `Buka / Download dari Google Drive: ${item.driveLinkTitle || item.topicTitle}` : `Download Ringkasan Jurnal Pertemuan #${item.meetingNumber}`}
                            >
                              <Download className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {item.driveLink ? 'Download Modul' : 'Download'}
                              </span>
                              {item.driveLink && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Table Footer Summary */}
                {filteredAndSortedJournals.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-900/95 border-t-2 border-slate-800 text-slate-300 font-bold text-[11px]">
                      <td colSpan={2} className="py-3 px-4">
                        TOTAL: <span className="text-white">{filteredAndSortedJournals.length} Sesi Pertemuan</span>
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-slate-400">
                        Durasi Total: <strong className="text-slate-200">{journalMetrics.totalHours} Jam Belajar</strong>
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-center text-emerald-400">
                        {journalMetrics.sudahCount} Selesai ({journalMetrics.completionRate}%) • {journalMetrics.attendancePct}% Hadir
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-right text-slate-400">
                        Rata-rata: <span className="text-amber-400 font-bold">{journalMetrics.avgRating} ⭐</span> | Target: <span className="text-blue-300 font-bold">{effectiveTargetCampus}</span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        ) : (
          /* CARD / TIMELINE VIEW (OPSIONAL) */
          <div className="space-y-4">
            {filteredAndSortedJournals.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400">
                Tidak ada data jurnal belajar yang sesuai dengan filter.
              </div>
            ) : (
              filteredAndSortedJournals.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 relative overflow-hidden"
                >
                  {/* Meeting Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow">
                        #{item.meetingNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{item.topicTitle}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${getSubtestBadgeClass(item.subtestCode)}`}>
                            {item.subjectName}
                          </span>
                          {/* Progres Badge in Card */}
                          {user.role !== 'student' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickToggleProgress(item.id, item.progress || 'SUDAH')}
                              title="Klik untuk ubah progres"
                            >
                              {renderProgressBadge(item.progress || 'SUDAH', item.id)}
                            </button>
                          ) : (
                            <div>
                              {renderProgressBadge(item.progress || 'SUDAH', item.id)}
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>📅 {item.date} ({item.timeRange})</span>
                          <span>•</span>
                          <span>👨‍🏫 {item.instructorName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Rating & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        <span className="text-amber-400 text-xs">⭐</span>
                        <span className="text-xs font-bold text-amber-300">
                          {item.comprehensionRating}/5 ({item.comprehensionPercentage}%)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenWaModal(item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-700 cursor-pointer shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Format WA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMeetingForDetail(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadMeetingMaterial(item)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border cursor-pointer ${
                          item.driveLink
                            ? 'bg-emerald-950/70 hover:bg-emerald-800 text-emerald-300 border-emerald-600/60'
                            : 'bg-indigo-950/70 hover:bg-indigo-800 text-indigo-300 border-indigo-700/60'
                        }`}
                        title={item.driveLink ? `Buka Google Drive: ${item.driveLinkTitle || item.topicTitle}` : 'Download Laporan Pertemuan'}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{item.driveLink ? 'Modul' : 'Download'}</span>
                      </button>

                      {user.role !== 'student' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMeeting(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Edit Jurnal"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMeeting(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-white hover:bg-rose-600"
                            title="Hapus Jurnal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtopics Badges */}
                  {item.subtopics && item.subtopics.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-500 font-semibold">Sub-materi:</span>
                      {item.subtopics.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes & Evaluation Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold text-blue-400 block mb-0.5">Catatan Siswa:</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{item.studentNotes}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs">
                      <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">Evaluasi Guru Pengampu:</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{item.teacherEvaluation}</p>
                    </div>
                  </div>

                  {/* Homework / PR */}
                  {item.homeworkTask && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-400">Tugas / PR:</span>
                        <span className="font-medium text-slate-200 truncate">{item.homeworkTask}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                        {item.homeworkStatus || 'SEMPURNA'}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: GENERATOR PESAN WHATSAPP CERDAS */}
      <div ref={waSectionRef} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl scroll-mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                Generator Pesan WhatsApp Cerdas
                <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AUTO FORMAT WA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate pesan laporan berkala untuk wali murid/siswa, atau pesan konsultasi materi & progress.
              </p>
            </div>
          </div>
        </div>

        {/* Sender & Receiver Mode Selector Tabs */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Pilih Mode Pengirim & Tujuan Pesan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Mode 1: Admin / Guru -> Wali Murid / Siswa */}
            <button
              type="button"
              onClick={() => handleSenderRoleChange('GURU')}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                (waSenderRole === 'GURU' || waSenderRole === 'ADMIN')
                  ? 'bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-blue-400 flex items-center gap-1.5">
                  👨‍🏫 Guru / Admin
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-bold">
                  LAPORAN WA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Kirim Laporan Progres ke Wali Murid / Siswa</p>
            </button>

            {/* Mode 2: Siswa -> Guru (Konsultasi Materi) */}
            <button
              type="button"
              onClick={() => handleSenderRoleChange('SISWA')}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                waSenderRole === 'SISWA'
                  ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                  🧑‍🎓 Siswa Labschool
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                  KONSULTASI MATERI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Konsultasi Materi Belajar yang Belum Dipahami</p>
            </button>

            {/* Mode 3: Wali Murid -> Guru (Konsultasi Progres & Perkembangan) */}
            <button
              type="button"
              onClick={() => handleSenderRoleChange('WALI_MURID')}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                waSenderRole === 'WALI_MURID'
                  ? 'bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-purple-400 flex items-center gap-1.5">
                  👨‍👩‍👧 Wali Murid
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-bold">
                  KONSULTASI PROGRES
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Konsultasi Kesiapan & Perkembangan Ananda</p>
            </button>
          </div>
        </div>

        {/* Dynamic Parameter Settings & Live WhatsApp Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Input Parameters Form */}
          <div className="lg:col-span-5 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 text-xs">
            <h4 className="font-bold text-white text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Parameter Pesan WhatsApp
            </h4>

            {/* Sesi Pertemuan Selector */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">Pilih Sesi Jurnal Belajar:</label>
              <select
                value={selectedMeetingNumber}
                onChange={(e) => setSelectedMeetingNumber(Number(e.target.value))}
                className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {filteredJournals.map(j => (
                  <option key={j.id} value={j.meetingNumber}>
                    Sesi #{j.meetingNumber} ({j.date}) - {j.subtestCode} - {j.topicTitle.substring(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Siswa & Target */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Target Kampus:</label>
                <input
                  type="text"
                  value={targetCampus}
                  onChange={(e) => setTargetCampus(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Nama Guru & No WA */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nama Guru:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">No. WA Tujuan:</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">Catatan Tambahan / Pesan Khusus:</label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan apresiasi, evaluasi, atau kendala spesifik..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Right: Live Editable WhatsApp Chat Preview */}
          <div className="lg:col-span-7 bg-[#0b141a] rounded-2xl p-4 sm:p-5 border border-[#202c33] shadow-inner flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-[#202c33] pb-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Preview Format WhatsApp
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {editableWaText.length} Karakter
              </span>
            </div>

            {/* WhatsApp Green Bubble Message */}
            <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm p-4 text-xs sm:text-[13px] leading-relaxed shadow-md whitespace-pre-wrap font-sans selection:bg-emerald-800">
              {editableWaText}
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] mt-2 font-mono">
                <span>16:30</span>
                <span className="text-[#53bdeb]">✓✓</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#202c33]">
              <button
                type="button"
                onClick={handleCopyText}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Pesan WA'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka di WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL 1: TAMBAH / EDIT JURNAL BELAJAR */}
      {isModalOpen && (
        <LabschoolJournalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMeeting(null);
          }}
          onSave={handleSaveMeeting}
          initialData={editingMeeting}
          user={user}
          defaultLevel={effectiveLevel}
          defaultMeetingNumber={journals.length + 1}
        />
      )}

      {/* POPUP MODAL 2: FORMAT LAPORAN WHATSAPP DETAIL */}
      {isWaModalOpen && selectedMeetingForWaModal && (
        <LabschoolWaPopupModal
          isOpen={isWaModalOpen}
          onClose={() => {
            setIsWaModalOpen(false);
            setSelectedMeetingForWaModal(null);
          }}
          meeting={selectedMeetingForWaModal}
          studentName={effectiveStudentName}
          studentNis={effectiveStudentNis}
          studentClass={`Kelas 9 SMP (Persiapan ${effectiveLevel} Labschool)`}
          targetCampus={effectiveTargetCampus}
          latestTryoutScore={effectiveTryoutScore}
          latestQuizScore={95.0}
          onUpdateMeetingProgress={handleUpdateMeetingProgress}
        />
      )}

      {/* POPUP MODAL 3: LIHAT DETAIL PERTEMUAN JURNAL */}
      {selectedMeetingForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  #{selectedMeetingForDetail.meetingNumber}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Detail Jurnal Pertemuan #{selectedMeetingForDetail.meetingNumber}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-indigo-400 font-bold">
                      {selectedMeetingForDetail.subjectName}
                    </span>
                    {/* Progres badge */}
                    {renderProgressBadge(selectedMeetingForDetail.progress || 'SUDAH', selectedMeetingForDetail.id)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMeetingForDetail(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Topic Title Banner */}
            <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50 p-4 rounded-2xl border border-blue-800/40 space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                Topik Pokok Materi:
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {selectedMeetingForDetail.topicTitle}
              </h4>
            </div>

            {/* Quick Session Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Tanggal</span>
                <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {selectedMeetingForDetail.date}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Jam & Waktu</span>
                <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {selectedMeetingForDetail.timeRange}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Guru Pengampu</span>
                <span className="font-bold text-white block mt-0.5 truncate">
                  {selectedMeetingForDetail.instructorName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Tingkat Pemahaman</span>
                <span className="font-black text-amber-400 flex items-center gap-1 mt-0.5">
                  ⭐ {selectedMeetingForDetail.comprehensionRating}/5 ({selectedMeetingForDetail.comprehensionPercentage}%)
                </span>
              </div>
            </div>

            {/* Subtopics Covered */}
            {selectedMeetingForDetail.subtopics && selectedMeetingForDetail.subtopics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Rincian Sub-Materi & Pokok Bahasan:
                </h4>
                <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                  {selectedMeetingForDetail.subtopics.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Evaluation Boxes */}
            <div className="space-y-3">
              {/* Student Self Notes */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-1">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Catatan Refleksi & Pemahaman Siswa:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedMeetingForDetail.studentNotes}
                </p>
              </div>

              {/* Teacher Diagnostic Evaluation */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  Evaluasi & Rekomendasi Guru Pengampu:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedMeetingForDetail.teacherEvaluation}
                </p>
              </div>

              {/* Homework Task */}
              {selectedMeetingForDetail.homeworkTask && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Tugas / PR Mandiri:
                    </span>
                    <p className="text-xs text-slate-200 font-medium">
                      {selectedMeetingForDetail.homeworkTask}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 shrink-0 self-start sm:self-auto">
                    Status: {selectedMeetingForDetail.homeworkStatus || 'SEMPURNA'}
                  </span>
                </div>
              )}

              {/* Google Drive Link Section */}
              {selectedMeetingForDetail.driveLink && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Modul & Bank Soal Google Drive:
                      </span>
                      <p className="text-xs text-white font-bold">
                        {selectedMeetingForDetail.driveLinkTitle || 'Modul Silabus & Latihan Soal Terpadu'}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono truncate block max-w-sm mt-0.5">
                        {selectedMeetingForDetail.driveLink}
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedMeetingForDetail.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Drive</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMeetingForDetail;
                    setSelectedMeetingForDetail(null);
                    handleOpenWaModal(m);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Format WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadMeetingMaterial(selectedMeetingForDetail)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-700/60 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMeetingForDetail(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
