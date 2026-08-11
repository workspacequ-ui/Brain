import React, { useState, useMemo } from 'react';
import { SyllabusItem, SyllabusTopic } from '../../types';
import {
  LearningJournalMeeting,
  loadStoredJournals,
  saveStoredJournals,
  DEFAULT_JOURNAL_MEETINGS
} from '../labschool/labschoolLaporanData';
import { LabschoolJournalModal } from '../labschool/LabschoolJournalModal';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Share2,
  Check,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  GraduationCap,
  ExternalLink,
  Search,
  Filter,
  CheckSquare,
  MessageSquare,
  School,
  ArrowRight,
  Users
} from 'lucide-react';

interface SyllabusJournalTabProps {
  syllabus: SyllabusItem;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SyllabusJournalTab: React.FC<SyllabusJournalTabProps> = ({
  syllabus,
  onShowToast
}) => {
  const [journals, setJournals] = useState<LearningJournalMeeting[]>(() => {
    return loadStoredJournals();
  });

  const [selectedSubtest, setSelectedSubtest] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [editingMeeting, setEditingMeeting] = useState<LearningJournalMeeting | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('ALL');

  // Determine syllabus level (SMA vs SMP)
  const syllabusLevel: 'SMA' | 'SMP' = useMemo(() => {
    if (syllabus.code.includes('SMP') || syllabus.targetClass.toUpperCase().includes('SMP') || syllabus.title.toUpperCase().includes('SMP')) {
      return 'SMP';
    }
    return 'SMA';
  }, [syllabus]);

  // Filter journals linked to this syllabus
  const linkedJournals = useMemo(() => {
    return journals.filter(j => {
      // Direct ID or Code match
      if (j.syllabusId && (j.syllabusId === syllabus.id || j.syllabusCode === syllabus.code)) {
        return true;
      }
      // Direct code match
      if (j.syllabusCode && j.syllabusCode.toLowerCase() === syllabus.code.toLowerCase()) {
        return true;
      }
      // Labschool level match fallback if Labschool syllabus
      const isLabschool = syllabus.code.includes('LAB') || syllabus.title.toLowerCase().includes('labschool');
      if (isLabschool && j.level === syllabusLevel) {
        return true;
      }
      // Subject match fallback
      if (j.subjectName && syllabus.subject && j.subjectName.toLowerCase().includes(syllabus.subject.toLowerCase())) {
        return true;
      }
      return false;
    });
  }, [journals, syllabus, syllabusLevel]);

  // Apply subtest & search filter
  const filteredJournals = useMemo(() => {
    return linkedJournals.filter(j => {
      const matchSubtest = selectedSubtest === 'ALL' || j.subtestCode === selectedSubtest;
      const matchTopic = selectedTopicFilter === 'ALL' || j.syllabusTopicId === selectedTopicFilter || j.topicTitle.toLowerCase().includes(selectedTopicFilter.toLowerCase());
      const matchSearch =
        searchQuery === '' ||
        j.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.subtopics.some(st => st.toLowerCase().includes(searchQuery.toLowerCase())) ||
        j.studentNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.teacherEvaluation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubtest && matchTopic && matchSearch;
    });
  }, [linkedJournals, selectedSubtest, selectedTopicFilter, searchQuery]);

  // Key metrics
  const totalMeetingsRecorded = linkedJournals.length;
  const plannedTopicsCount = syllabus.topics?.length || 6;
  const progressPercent = Math.min(100, Math.round((totalMeetingsRecorded / Math.max(1, plannedTopicsCount)) * 100));

  const averageComprehension = useMemo(() => {
    if (linkedJournals.length === 0) return 0;
    const sum = linkedJournals.reduce((acc, curr) => acc + curr.comprehensionPercentage, 0);
    return Math.round(sum / linkedJournals.length);
  }, [linkedJournals]);

  const attendanceRate = useMemo(() => {
    if (linkedJournals.length === 0) return 0;
    const hadir = linkedJournals.filter(j => j.attendanceStatus === 'HADIR' || j.attendanceStatus === 'TERLAMBAT').length;
    return Math.round((hadir / linkedJournals.length) * 100);
  }, [linkedJournals]);

  // Topic Coverage Map: matches each syllabus topic with corresponding executed journals
  const topicCoverage = useMemo(() => {
    return (syllabus.topics || []).map((top, idx) => {
      const topId = top.id || `topic-${idx}`;
      const matched = linkedJournals.find(
        j => j.syllabusTopicId === topId ||
             j.meetingNumber === top.meetingNumber ||
             j.topicTitle.toLowerCase().includes(top.title.toLowerCase()) ||
             top.title.toLowerCase().includes(j.topicTitle.toLowerCase())
      );
      return {
        topic: top,
        index: idx,
        isCompleted: !!matched,
        journalEntry: matched
      };
    });
  }, [syllabus.topics, linkedJournals]);

  // Available subtest codes in linked journals
  const availableSubtests = useMemo(() => {
    const set = new Set<string>();
    linkedJournals.forEach(j => {
      if (j.subtestCode) set.add(j.subtestCode);
    });
    return Array.from(set);
  }, [linkedJournals]);

  const handleSaveJournal = (meeting: LearningJournalMeeting) => {
    const existsIndex = journals.findIndex(j => j.id === meeting.id);
    let updated: LearningJournalMeeting[];
    if (existsIndex >= 0) {
      updated = [...journals];
      updated[existsIndex] = meeting;
    } else {
      updated = [meeting, ...journals];
    }
    setJournals(updated);
    saveStoredJournals(updated);
    if (onShowToast) {
      onShowToast(`Jurnal Pertemuan #${meeting.meetingNumber} berhasil disimpan & dihubungkan ke silabus!`, 'success');
    }
  };

  const handleDeleteJournal = (id: string, meetingNo: number) => {
    if (window.confirm(`Hapus catatan jurnal pertemuan #${meetingNo}?`)) {
      const updated = journals.filter(j => j.id !== id);
      setJournals(updated);
      saveStoredJournals(updated);
      if (onShowToast) {
        onShowToast(`Jurnal Pertemuan #${meetingNo} berhasil dihapus.`, 'info');
      }
    }
  };

  const handleCopyWhatsAppReport = (j: LearningJournalMeeting) => {
    const studentInfo = j.studentName
      ? `👨‍🎓 *Siswa*: ${j.studentName} (${j.studentNis ? `NIS: ${j.studentNis} | ` : ''}${j.studentClass || syllabus.targetClass})`
      : j.attendees && j.attendees.length > 0
      ? `👥 *Presensi Rombel*: ${j.presentCount || j.attendees.filter(a => a.status === 'HADIR').length}/${j.totalAttendees || j.attendees.length} Siswa Hadir`
      : `👨‍🎓 *Target Siswa*: ${syllabus.targetClass}`;

    const text = `*LAPORAN JURNAL BELAJAR & PROSES BELAJAR SISWA*
*SILABUS & KURIKULUM: ${syllabus.title} (${syllabus.code})*
━━━━━━━━━━━━━━━━━━━━
📅 *Pertemuan Ke*: #${j.meetingNumber} (${j.date} | ${j.timeRange})
${studentInfo}
📚 *Subtes/Mata Pelajaran*: ${j.subjectName} [${j.subtestCode}]
🎯 *Materi Pokok*: ${j.topicTitle}
📖 *Target Silabus*: ${j.competencyTarget || 'Tuntas Capaian Kompetensi Seleksi'}

*Rincian Sub-Topik*:
${j.subtopics.map(st => `• ${st}`).join('\n')}

👨‍🏫 *Guru / Pemateri*: ${j.instructorName}
🏫 *Target Kampus*: ${j.targetCampus || syllabus.targetClass}
✅ *Kehadiran*: ${j.attendanceStatus}
⭐ *Rating Pemahaman*: ${j.comprehensionRating}/5 (${j.comprehensionPercentage}%)

📝 *Catatan Siswa*:
"${j.studentNotes}"

💡 *Evaluasi Guru*:
"${j.teacherEvaluation}"

📌 *Tugas Mandiri (PR)*:
${j.homeworkTask || 'Review Modul & Kerjakan Latihan'} (Status: ${j.homeworkStatus})
━━━━━━━━━━━━━━━━━━━━
_Sistem Informasi Silabus & Jurnal Belajar Terintegrasi PSB Labschool_`;

    navigator.clipboard.writeText(text);
    setCopiedId(j.id);
    if (onShowToast) {
      onShowToast('Laporan jurnal belajar berhasil disalin ke clipboard!', 'success');
    }
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAllSummary = () => {
    const text = `*REKAPITULASI PROGRES JURNAL BELAJAR & KETERCAPAIAN SILABUS*
*PROGRAM: ${syllabus.title} (${syllabus.code})*
*KELAS/JENJANG: ${syllabus.targetClass} | TAHUN: ${syllabus.academicYear}*
━━━━━━━━━━━━━━━━━━━━
📊 *RINGKASAN EKSEKUTIF*:
• Total Sesi Terlaksana: ${totalMeetingsRecorded} dari ${plannedTopicsCount} Pertemuan (${progressPercent}%)
• Rata-rata Pemahaman Siswa: ${averageComprehension}%
• Tingkat Kehadiran Siswa: ${attendanceRate}%
• Guru Penanggung Jawab: ${syllabus.teacherInCharge || '-'}

📋 *RIWAYAT SESI PERTEMUAN*:
${linkedJournals.map(j => `[P-${j.meetingNumber}] ${j.date} | ${j.subtestCode} - ${j.topicTitle} (Pemahaman: ${j.comprehensionPercentage}%, Guru: ${j.instructorName})`).join('\n')}
━━━━━━━━━━━━━━━━━━━━
_Digenerate otomatis oleh Modul Silabus & Jurnal Akademik Terintegrasi_`;

    navigator.clipboard.writeText(text);
    setCopiedId('all');
    if (onShowToast) {
      onShowToast('Rekapitulasi seluruh jurnal silabus disalin!', 'success');
    }
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner: Integration Header */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-900 border border-blue-800/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" /> Terintegrasi Silabus & Jurnal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-700">
                {syllabus.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Jenjang {syllabusLevel} Labschool
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              Laporan Jurnal Belajar & Riwayat Pertemuan Terlaksana
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Modul ini menghubungkan rencana RPP dan target kompetensi silabus <strong className="text-blue-200">{syllabus.title}</strong> secara langsung dengan jurnal sesi harian, absensi, evaluasi guru, dan catatan pemahaman siswa.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleCopyAllSummary}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
              title="Salin Rekapitulasi Jurnal Format WhatsApp"
            >
              {copiedId === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Salin Rekap WA</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingMeeting(null);
                setIsJournalModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Jurnal Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Progres Silabus</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white">
                {totalMeetingsRecorded} <span className="text-xs font-medium text-slate-400">/ {plannedTopicsCount} Sesi</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Rata-rata Pemahaman</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-amber-400">
                {averageComprehension}%
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {(averageComprehension / 20).toFixed(1)} / 5.0 Bintang
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Tingkat Kehadiran</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-emerald-400">
                {attendanceRate}%
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {linkedJournals.filter(j => j.attendanceStatus === 'HADIR').length} Sesi Hadir Tepat Waktu
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Status Tugas (PR)</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-purple-300">
                {linkedJournals.filter(j => j.homeworkStatus === 'SEMPURNA' || j.homeworkStatus === 'SELESAI').length} Selesai
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Target Seleksi 100% Tuntas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOPIC COVERAGE ROADMAP: Showing each syllabus topic vs journal execution status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Matriks Ketercapaian Bab Silabus vs Jurnal Pertemuan
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Status realisasi bab silabus yang sudah terekam di jurnal pembelajaran siswa.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-300 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
            {topicCoverage.filter(t => t.isCompleted).length} dari {topicCoverage.length} Bab Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {topicCoverage.map((item, i) => (
            <div
              key={item.topic.id || i}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                item.isCompleted
                  ? 'bg-gradient-to-br from-emerald-950/20 to-slate-950 border-emerald-800/40 hover:border-emerald-700/60'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center text-[10px]">
                      P-{item.topic.meetingNumber || i + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.topic.durationMinutes || 90}m
                    </span>
                  </div>

                  {item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Sudah Diajarkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                      Belum Diajarkan
                    </span>
                  )}
                </div>

                <h5 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {item.topic.title}
                </h5>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  🎯 {item.topic.competency}
                </p>
              </div>

              {item.isCompleted && item.journalEntry ? (
                <div className="pt-2.5 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.journalEntry.comprehensionPercentage}%</span>
                  </div>
                  <span className="text-slate-300 font-medium truncate max-w-[120px]">
                    {item.journalEntry.date}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMeeting(item.journalEntry!);
                      setIsJournalModalOpen(true);
                    }}
                    className="text-blue-400 hover:underline font-bold text-[10px]"
                  >
                    Detail Jurnal →
                  </button>
                </div>
              ) : (
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 italic">Sesi menunggu jadwal</span>
                  <button
                    type="button"
                    onClick={() => {
                      // Autofill topic when creating
                      setEditingMeeting({
                        id: `jm-${Date.now()}`,
                        meetingNumber: item.topic.meetingNumber || i + 1,
                        date: new Date().toISOString().split('T')[0],
                        timeRange: '15:30 - 17:30',
                        durationMinutes: 120,
                        level: syllabusLevel,
                        subtestCode: 'PK',
                        subjectName: syllabus.subject,
                        topicTitle: item.topic.title,
                        subtopics: item.topic.subtopics || [],
                        instructorName: syllabus.teacherInCharge || 'Dr. Hendra Wijaya, M.Pd.',
                        instructorRole: 'Master Tutor Labschool',
                        attendanceStatus: 'HADIR',
                        comprehensionRating: 5,
                        comprehensionPercentage: 100,
                        studentNotes: 'Memahami konsep dengan baik.',
                        teacherEvaluation: 'Siswa aktif berdiskusi dan antusias.',
                        homeworkTask: 'Review catatan jurnal belajar',
                        homeworkStatus: 'SELESAI',
                        targetCampus: syllabus.targetClass,
                        syllabusId: syllabus.id,
                        syllabusCode: syllabus.code,
                        syllabusTopicId: item.topic.id || `topic-${i}`,
                        competencyTarget: item.topic.competency,
                        teachingMethod: item.topic.teachingMethod || 'Problem-Based Learning & Speed Drills'
                      });
                      setIsJournalModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-500/30 transition-colors"
                  >
                    + Catat Jurnal
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FILTER & SEARCH BAR FOR JOURNAL ENTRIES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik, guru, catatan belajar, atau evaluasi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Subtest filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setSelectedSubtest('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedSubtest === 'ALL'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Semua Subtes ({linkedJournals.length})
              </button>

              {['PK', 'KV', 'PM', 'KA', 'SK', 'SIM'].map(st => {
                const count = linkedJournals.filter(j => j.subtestCode === st).length;
                if (count === 0 && !availableSubtests.includes(st)) return null;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedSubtest(st)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedSubtest === st
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kartu
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* JOURNAL LIST: Cards View vs Table View */}
        {filteredJournals.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Belum Ada Catatan Jurnal yang Sesuai</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Catatan jurnal pertemuan pembelajaran yang diisi di menu Laporan Labschool atau melalui tombol di bawah akan otomatis terhubung ke silabus ini.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingMeeting(null);
                setIsJournalModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Jurnal Baru Untuk Silabus Ini</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJournals.map(j => (
              <div
                key={j.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 group transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-blue-900/30">
                        #{j.meetingNumber}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {j.date}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {j.timeRange}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                        {j.subtestCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        j.attendanceStatus === 'HADIR'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : j.attendanceStatus === 'TERLAMBAT'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {j.attendanceStatus}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subject & Student Badge */}
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-blue-300 transition-colors leading-snug">
                      {j.topicTitle}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-indigo-400">
                        {j.subjectName}
                      </span>
                      {j.studentName && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1.5 font-medium">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span className="text-white font-bold">{j.studentName}</span>
                          {j.studentClass && <span className="text-slate-400">({j.studentClass})</span>}
                        </span>
                      )}
                      {j.attendees && j.attendees.length > 0 && !j.studentName && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{j.presentCount || j.attendees.filter(a => a.status === 'HADIR').length}/{j.totalAttendees || j.attendees.length} Siswa Hadir</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtopics */}
                  {j.subtopics && j.subtopics.length > 0 && (
                    <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Sub-Topik yang Diajarkan:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {j.subtopics.map((st, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-400 font-bold shrink-0">•</span>
                            <span className="leading-snug">{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Competency & Method */}
                  {j.competencyTarget && (
                    <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                      <strong className="text-indigo-300 font-semibold block mb-0.5">🎯 Target Kompetensi Silabus:</strong>
                      {j.competencyTarget}
                    </p>
                  )}

                  {/* Student & Teacher Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">📝 Catatan Siswa:</span>
                      <p className="text-slate-300 italic line-clamp-3 leading-relaxed">
                        "{j.studentNotes}"
                      </p>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] font-bold text-amber-300 block mb-0.5">💡 Evaluasi Guru:</span>
                      <p className="text-slate-300 italic line-clamp-3 leading-relaxed">
                        "{j.teacherEvaluation}"
                      </p>
                    </div>
                  </div>

                  {/* Homework & Instructor */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-200 font-semibold">{j.instructorName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{j.comprehensionRating}/5 Bintang ({j.comprehensionPercentage}%)</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyWhatsAppReport(j)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copiedId === j.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Salin WA</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingMeeting(j);
                      setIsJournalModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                    title="Edit Jurnal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteJournal(j.id, j.meetingNumber)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table Matrix Layout */
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center">Sesi</th>
                    <th className="py-3 px-3">Tanggal & Waktu</th>
                    <th className="py-3 px-3">Subtes</th>
                    <th className="py-3 px-4">Topik & Sub-Topik Silabus</th>
                    <th className="py-3 px-3">Siswa / Peserta</th>
                    <th className="py-3 px-3">Guru</th>
                    <th className="py-3 px-3 text-center">Pemahaman</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredJournals.map(j => (
                    <tr key={j.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 text-center font-extrabold text-blue-400">
                        #{j.meetingNumber}
                      </td>
                      <td className="py-3 px-3 font-medium whitespace-nowrap text-slate-200">
                        <div>{j.date}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{j.timeRange}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {j.subtestCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{j.topicTitle}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                          {j.subtopics?.join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                        {j.studentName ? (
                          <div>
                            <span className="font-semibold text-white">{j.studentName}</span>
                            <div className="text-[10px] text-slate-400 font-mono">{j.studentNis || j.studentClass}</div>
                          </div>
                        ) : j.attendees && j.attendees.length > 0 ? (
                          <span className="text-[11px] text-indigo-300 font-semibold">
                            {j.presentCount || j.attendees.filter(a => a.status === 'HADIR').length}/{j.totalAttendees || j.attendees.length} Siswa
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                        {j.instructorName}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {j.comprehensionPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          j.attendanceStatus === 'HADIR'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {j.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyWhatsAppReport(j)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                            title="Salin WA"
                          >
                            <Share2 className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMeeting(j);
                              setIsJournalModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT / TAMBAH JURNAL */}
      {isJournalModalOpen && (
        <LabschoolJournalModal
          isOpen={isJournalModalOpen}
          onClose={() => {
            setIsJournalModalOpen(false);
            setEditingMeeting(null);
          }}
          onSave={handleSaveJournal}
          initialData={editingMeeting}
          defaultMeetingNumber={totalMeetingsRecorded + 1}
        />
      )}
    </div>
  );
};
