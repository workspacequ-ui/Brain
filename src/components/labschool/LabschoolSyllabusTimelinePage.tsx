import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Calculator,
  Languages,
  Atom,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Award,
  GraduationCap,
  Check,
  Printer,
  Search,
  Filter,
  Layers,
  Info,
  Compass,
  FileText,
  BarChart3,
  HelpCircle,
  Brain,
  Users,
  Settings,
  Monitor,
  Briefcase,
  Puzzle,
  TrendingUp,
  X,
  Share2,
  Eye,
  ListFilter
} from 'lucide-react';
import { User, SidebarTab } from '../../types';
import { getUserLabschoolLevel, isStudentLevelLocked } from '../../utils/labschoolHelpers';
import {
  SyllabusTimelineTopic,
  SubtestOption,
  LABSCHOOL_SUBTEST_OPTIONS,
  getTimelineTopicsForSubtest,
  getStoredTopicProgress,
  saveStoredTopicProgress,
  TopicProgressStatus
} from './labschoolSyllabusTimelineData';
import { LearningJournalMeeting } from './labschoolLaporanData';
import { LabschoolJournalModal } from './LabschoolJournalModal';
import { LabschoolPrintSyllabusModal } from './LabschoolPrintSyllabusModal';

interface LabschoolSyllabusTimelinePageProps {
  user: User;
  onNavigateTab: (tab: SidebarTab) => void;
}

export const LabschoolSyllabusTimelinePage: React.FC<LabschoolSyllabusTimelinePageProps> = ({
  user,
  onNavigateTab
}) => {
  // Determine user level and locking
  const userLevel = useMemo(() => getUserLabschoolLevel(user), [user]);
  const isLockedForStudent = useMemo(() => isStudentLevelLocked(user), [user]);

  const defaultLevel = useMemo<'SMP' | 'SMA'>(() => {
    if (isLockedForStudent) {
      return userLevel === 'SMP' ? 'SMP' : 'SMA';
    }
    return userLevel === 'SMA' ? 'SMA' : 'SMP';
  }, [isLockedForStudent, userLevel]);

  const [selectedLevel, setSelectedLevel] = useState<'SMP' | 'SMA'>(defaultLevel);

  // Keep selectedLevel strictly locked to student level whenever user prop changes
  useEffect(() => {
    if (isLockedForStudent) {
      setSelectedLevel(userLevel === 'SMP' ? 'SMP' : 'SMA');
    }
  }, [isLockedForStudent, userLevel]);

  // Subtests available for the chosen level
  const availableSubtests = useMemo(() => {
    return LABSCHOOL_SUBTEST_OPTIONS.filter(st => st.level === selectedLevel);
  }, [selectedLevel]);

  // Selected subtest
  const [selectedSubtestId, setSelectedSubtestId] = useState<string>(() => {
    return defaultLevel === 'SMA' ? 'sma-all' : 'smp-all';
  });

  // When level changes, reset to 'all' for that level
  useEffect(() => {
    setSelectedSubtestId(selectedLevel === 'SMA' ? 'sma-all' : 'smp-all');
  }, [selectedLevel]);

  // Search and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'TABLE'>('TIMELINE');

  // Selected topic for detail modal
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<SyllabusTimelineTopic | null>(null);

  // Journal modal state & pre-filled topic data
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalInitialData, setJournalInitialData] = useState<LearningJournalMeeting | null>(null);
  const [journalPrefillTopic, setJournalPrefillTopic] = useState<SyllabusTimelineTopic | null>(null);

  // Syllabus Print & Preview Modal state
  const [isPrintSyllabusModalOpen, setIsPrintSyllabusModalOpen] = useState(false);
  const [printModalSubtestCode, setPrintModalSubtestCode] = useState<string>('ALL');
  const [printModalTopic, setPrintModalTopic] = useState<SyllabusTimelineTopic | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Open Print Modal for entire syllabus or specific subtest / topic
  const handleOpenPrintSyllabus = (subtestCode?: string, topic?: SyllabusTimelineTopic) => {
    setPrintModalSubtestCode(subtestCode || activeSubtestObj.code || 'ALL');
    setPrintModalTopic(topic || null);
    setIsPrintSyllabusModalOpen(true);
  };

  // Open Journal Modal with full pre-filled syllabus topic data
  const handleOpenJournalForTopic = (topic: SyllabusTimelineTopic, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user?.role === 'student') return;
    const prefillData: LearningJournalMeeting = {
      id: `jm-${Date.now()}`,
      meetingNumber: topic.topicNumber,
      date: new Date().toISOString().split('T')[0],
      timeRange: '15:30 - 17:30',
      durationMinutes: topic.durationMinutes || 120,
      level: selectedLevel,
      targetCampus: selectedLevel === 'SMA' ? 'SMA Labschool Kebayoran' : 'SMP Labschool Rawamangun',
      subtestCode: topic.subtestCode || activeSubtestObj.code,
      subjectName: topic.subtestName || activeSubtestObj.name,
      topicTitle: topic.title,
      subtopics: topic.subtopics || [],
      competencyTarget: topic.competency,
      teachingMethod: topic.teachingMethod || 'Problem-Based Learning & Speed Drills',
      syllabusId: topic.id,
      syllabusCode: topic.subtestCode ? `SIL-${topic.subtestCode}-${selectedLevel}-LAB` : activeSubtestObj.code,
      syllabusTopicId: topic.id,
      driveLink: topic.driveLink || '',
      driveLinkTitle: topic.driveLinkTitle || (topic.title ? `Modul Silabus: ${topic.title}` : ''),
      instructorName: user?.role === 'teacher' ? user.name : 'Dr. Hendra Wijaya, M.Pd.',
      instructorRole: 'Master Tutor Labschool',
      attendanceStatus: 'HADIR',
      comprehensionRating: 5,
      comprehensionPercentage: 100,
      progress: 'SUDAH',
      studentNotes: `Siswa telah mempelajari topik materi ${topic.title} sesuai kurikulum silabus Labschool.`,
      teacherEvaluation: 'Siswa aktif berpartisipasi dan memahami capaian kompetensi pokok bahasan dengan baik.',
      homeworkTask: `Review modul materi & latihan soal silabus: ${topic.title}`,
      homeworkStatus: 'SEMPURNA'
    };

    setJournalInitialData(prefillData);
    setJournalPrefillTopic(topic);
    setSelectedTopicDetail(null);
    setIsJournalModalOpen(true);
  };

  // Topic completion progress state
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgressStatus>>(() => {
    return getStoredTopicProgress(user.id);
  });

  // Handle status toggle
  const handleToggleStatus = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user.role === 'student') return; // Fitur mutasi nonaktif untuk siswa
    const currentStatus = topicProgress[topicId] || 'NOT_STARTED';
    let nextStatus: TopicProgressStatus = 'IN_PROGRESS';
    if (currentStatus === 'NOT_STARTED') {
      nextStatus = 'IN_PROGRESS';
    } else if (currentStatus === 'IN_PROGRESS') {
      nextStatus = 'COMPLETED';
    } else {
      nextStatus = 'NOT_STARTED';
    }

    const updated = saveStoredTopicProgress(user.id, topicId, nextStatus);
    setTopicProgress({ ...updated });
  };

  // Get raw topics for the selected subtest
  const rawTopics = useMemo(() => {
    return getTimelineTopicsForSubtest(selectedLevel, selectedSubtestId);
  }, [selectedLevel, selectedSubtestId]);

  // Filtered topics based on search & status
  const filteredTopics = useMemo(() => {
    return rawTopics.filter(t => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.stageName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtestName.toLowerCase().includes(q) ||
        t.subtopics.some(sub => sub.toLowerCase().includes(q));

      // Status match
      const currentStatus = topicProgress[t.id] || 'NOT_STARTED';
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && currentStatus === 'COMPLETED') ||
        (statusFilter === 'IN_PROGRESS' && currentStatus === 'IN_PROGRESS') ||
        (statusFilter === 'NOT_STARTED' && currentStatus === 'NOT_STARTED');

      return matchQuery && matchStatus;
    });
  }, [rawTopics, searchQuery, statusFilter, topicProgress]);

  // Selected subtest object
  const activeSubtestObj = useMemo(() => {
    return (
      availableSubtests.find(s => s.id === selectedSubtestId) ||
      availableSubtests[0]
    );
  }, [availableSubtests, selectedSubtestId]);

  // Metrics
  const totalTopicsCount = rawTopics.length;
  const completedTopicsCount = useMemo(() => {
    return rawTopics.filter(t => topicProgress[t.id] === 'COMPLETED').length;
  }, [rawTopics, topicProgress]);
  const inProgressTopicsCount = useMemo(() => {
    return rawTopics.filter(t => topicProgress[t.id] === 'IN_PROGRESS').length;
  }, [rawTopics, topicProgress]);
  const completionPercentage = totalTopicsCount > 0
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
    : 0;

  // Render node icon corresponding to type
  const renderNodeIcon = (type: string, className = 'w-6 h-6') => {
    switch (type) {
      case 'book':
        return <BookOpen className={className} />;
      case 'gear':
        return <Settings className={className} />;
      case 'computer':
        return <Monitor className={className} />;
      case 'checklist':
        return <Briefcase className={className} />;
      case 'puzzle':
        return <Puzzle className={className} />;
      case 'analytics':
        return <TrendingUp className={className} />;
      case 'certificate':
        return <GraduationCap className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BREADCRUMB */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <span
              onClick={() => onNavigateTab('labschool_overview')}
              className="hover:underline cursor-pointer flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" /> Dashboard-Labs
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Modul & Silabus Belajar
            </span>
            {isLockedForStudent && (
              <>
                <span className="text-slate-600">/</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold border ${
                  selectedLevel === 'SMP'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {user.className || `${selectedLevel}-LABSCHOOL`}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2.5">
            <span>TIMELINE PEMBELAJARAN (VERTIKAL)</span>
            <span className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl uppercase tracking-wide ${
              selectedLevel === 'SMA'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
            }`}>
              {selectedLevel} LABSCHOOL
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Struktur kurikulum dan silabus belajar terurut dari <strong className="text-cyan-300 font-semibold">Topik 1, Topik 2, dst</strong> khusus jenjang <strong className="text-white font-bold">{selectedLevel === 'SMA' ? 'SMA Labschool (Persiapan Kelas 9 ke SMA)' : 'SMP Labschool (Persiapan Kelas 6 ke SMP)'}</strong>. 
            {isLockedForStudent && (
              <span className="text-cyan-300 font-medium"> Tampilan silabus telah disesuaikan otomatis dengan kelas Anda ({user.className || `${selectedLevel}-LABSCHOOL`}).</span>
            )}
          </p>
        </div>

        {/* Level Switcher & Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Level Switcher (SMP vs SMA) or Locked Student Badge */}
          {isLockedForStudent ? (
            <div className={`flex items-center gap-2.5 p-2 px-3.5 rounded-2xl border shadow-inner ${
              selectedLevel === 'SMP'
                ? 'bg-blue-950/70 border-blue-500/40 text-blue-200'
                : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200'
            }`}>
              <div className={`p-1.5 rounded-xl ${selectedLevel === 'SMP' ? 'bg-blue-500/20 text-blue-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {selectedLevel === 'SMP' ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kelas Siswa:</span>
                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${
                    selectedLevel === 'SMP'
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                      : 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                  }`}>
                    {user.className || `${selectedLevel}-LABSCHOOL`}
                  </span>
                </div>
                <p className="text-xs font-bold text-white">
                  {selectedLevel === 'SMP' ? 'Silabus PSB SMP Labschool' : 'Silabus PSB SMA Labschool'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedLevel('SMP')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedLevel === 'SMP'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                SMP Labschool
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevel('SMA')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedLevel === 'SMA'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                SMA Labschool
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <button
            type="button"
            onClick={() => handleOpenPrintSyllabus(activeSubtestObj.code)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
            title="Pratinjau & Cetak Silabus Resmi Labschool"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">Cetak Silabus</span>
          </button>

          {user.role !== 'student' && (
            <button
              type="button"
              onClick={() => setIsJournalModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Catat Jurnal</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBTEST SELECTOR MENU (Setiap subtest memiliki timeline masing-masing) */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ListFilter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span>Pilihan Subtest Silabus ({selectedLevel} Labschool)</span>
                {isLockedForStudent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 normal-case tracking-normal">
                    ✓ Khusus Kelas {user.className || `${selectedLevel}-LABSCHOOL`}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                Pilih subtest di bawah untuk menampilkan alur timeline topik belajar spesifik jenjang {selectedLevel}:
              </p>
            </div>
          </div>

          {/* Quick Subtest Stats & Print Action */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" />
              Total {activeSubtestObj.estimatedHours} Jam
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
              <Layers className="w-3 h-3 text-cyan-400" />
              {activeSubtestObj.totalTopics} Topik
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
              <Award className="w-3 h-3 text-rose-400" />
              Bobot {activeSubtestObj.weightPercentage}%
            </span>
            <button
              type="button"
              onClick={() => handleOpenPrintSyllabus(activeSubtestObj.code)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-[11px] font-bold transition-all shadow-sm active:scale-95 ml-auto sm:ml-0"
              title={`Pratinjau & Cetak Dokumen Silabus ${activeSubtestObj.name}`}
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cetak Subtest Ini</span>
            </button>
          </div>
        </div>

        {/* Subtest Selection Chips/Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {availableSubtests.map((st) => {
            const isSelected = selectedSubtestId === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedSubtestId(st.id)}
                className={`p-3 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 text-slate-400'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-cyan-400" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {st.code}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">{st.totalTopics} Topik</span>
                  </div>
                  <strong
                    className={`text-xs block line-clamp-1 ${
                      isSelected ? 'text-white font-bold' : 'text-slate-300'
                    }`}
                  >
                    {st.shortName}
                  </strong>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-800/50 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Bobot: {st.weightPercentage}%</span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search, Filter Status, and View Mode Toggle */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik, materi, aljabar, newton, dll..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Tuntas ({completedTopicsCount})
              </button>
              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                Sedang ({inProgressTopicsCount})
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'TIMELINE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Timeline S-Curve</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'TABLE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tabel Silabus</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUBTEST BANNER & PROGRESS SUMMARY */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold ${activeSubtestObj.badgeClass}`}>
              {activeSubtestObj.code} • {selectedLevel}
            </span>
            <h3 className="text-base font-bold text-white">{activeSubtestObj.name}</h3>
          </div>
          <p className="text-xs text-slate-400">{activeSubtestObj.description}</p>
        </div>

        {/* Progress Bar and Indicator */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 min-w-[280px]">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Progres Penguasaan Silabus</span>
              <span className="font-mono font-bold text-emerald-400">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{completedTopicsCount} dari {totalTopicsCount} Topik Tuntas</span>
              <span>{rawTopics.length * 1.5} Jam Total Pembelajaran</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. THE VERTICAL SERPENTINE TIMELINE (MATCHING REFERENCE IMAGE!) */}
      {/* ========================================================================= */}
      {viewMode === 'TIMELINE' ? (
        <div className="relative py-8 px-2 sm:px-4">
          {/* Main vertical center curvy spine for desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-16 -translate-x-1/2 w-1.5 bg-gradient-to-b from-cyan-500 via-amber-500 to-blue-500 opacity-20 pointer-events-none rounded-full" />

          {/* If no topics match filter */}
          {filteredTopics.length === 0 && (
            <div className="text-center py-16 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-slate-200">Tidak ada topik yang sesuai</h4>
              <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter status.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold transition-all"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Sequential Topic Items */}
          <div className="space-y-12 sm:space-y-16">
            {filteredTopics.map((topic, index) => {
              const isEven = index % 2 === 0; // Alternating left (even) / right (odd)
              const status = topicProgress[topic.id] || 'NOT_STARTED';
              const isCompleted = status === 'COMPLETED';
              const isInProgress = status === 'IN_PROGRESS';

              return (
                <div
                  key={topic.id}
                  className="relative flex flex-col lg:flex-row items-center justify-between gap-6 group"
                >
                  {/* LEFT SIDE CONTENT (Visible on desktop for EVEN items) */}
                  <div
                    className={`w-full lg:w-[45%] ${
                      isEven ? 'order-2 lg:order-1' : 'order-2 lg:order-1 lg:invisible'
                    }`}
                  >
                    {isEven && (
                      <div
                        onClick={() => setSelectedTopicDetail(topic)}
                        className={`p-5 sm:p-6 rounded-3xl transition-all relative overflow-hidden cursor-pointer ${topic.colorTheme.cardBg} border ${topic.colorTheme.border} hover:border-cyan-400 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 space-y-4`}
                      >
                        {/* Top Stage & Time Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold tracking-wide text-slate-400">
                            {topic.stageName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {topic.durationMinutes} Menit
                            </span>
                            {user.role !== 'student' ? (
                              <span
                                onClick={(e) => handleToggleStatus(topic.id, e)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isInProgress
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {isCompleted ? '✓ Tuntas' : isInProgress ? '⏳ Sedang Belajar' : '○ Belum Mulai'}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isInProgress
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                                title="Status capaian materi silabus"
                              >
                                {isCompleted ? '✓ Tuntas' : isInProgress ? '⏳ Sedang Belajar' : '○ Belum Mulai'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5">
                          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors">
                            {topic.topicNumber}. {topic.title}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {topic.competency}
                          </p>
                        </div>

                        {/* Subtopics Checklist Pills */}
                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Materi Pokok & Sub-Bab:
                            </span>
                            <ul className="text-xs text-slate-300 space-y-1">
                              {topic.subtopics.slice(0, 3).map((sub, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-cyan-400 font-bold">•</span>
                                  <span className="line-clamp-1">{sub}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Card Bottom Meta */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            {topic.teachingMethod}
                          </span>
                          <div className="flex items-center gap-2">
                            {user.role !== 'student' && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenJournalForTopic(topic, e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                                title={`Tulis Jurnal untuk Topik ${topic.topicNumber}: ${topic.title}`}
                              >
                                <FileText className="w-3 h-3 shrink-0" />
                                <span>Tulis di Jurnal</span>
                              </button>
                            )}
                            <span className="text-cyan-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Detail Topik <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ========================================================= */}
                  {/* CENTRAL CIRCULAR NODE (MATCHING REFERENCE IMAGE) */}
                  {/* ========================================================= */}
                  <div className="order-1 lg:order-2 flex flex-col items-center justify-center relative z-20">
                    {/* Glowing outer pulse ring */}
                    <div
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr ${topic.colorTheme.ringGradient} shadow-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300`}
                      style={{
                        boxShadow: `0 0 25px ${topic.colorTheme.glowColor}`
                      }}
                    >
                      {/* Inner concentric ring */}
                      <div className="w-full h-full rounded-full bg-slate-950 p-1.5 flex items-center justify-center border-2 border-white/20 relative">
                        {/* Inner core circle with icon */}
                        <div
                          className={`w-full h-full rounded-full bg-gradient-to-br ${topic.colorTheme.ringGradient} flex flex-col items-center justify-center text-white shadow-inner relative`}
                        >
                          {/* Node Icon */}
                          {renderNodeIcon(topic.iconType, 'w-6 h-6 sm:w-7 sm:h-7')}
                          <span className="text-[9px] font-mono font-extrabold uppercase tracking-tighter text-white/90">
                            #{topic.topicNumber}
                          </span>
                        </div>
                      </div>

                      {/* Directional chevrons pointing to the active card */}
                      {isEven ? (
                        <div className="hidden lg:flex absolute -left-7 top-1/2 -translate-y-1/2 items-center text-cyan-400 font-extrabold text-sm animate-pulse">
                          <span>&lt;&lt;</span>
                        </div>
                      ) : (
                        <div className="hidden lg:flex absolute -right-7 top-1/2 -translate-y-1/2 items-center text-amber-400 font-extrabold text-sm animate-pulse">
                          <span>&gt;&gt;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE CONTENT (Visible on desktop for ODD items, or for all on mobile) */}
                  <div
                    className={`w-full lg:w-[45%] ${
                      !isEven ? 'order-3' : 'order-3 lg:invisible'
                    }`}
                  >
                    {!isEven && (
                      <div
                        onClick={() => setSelectedTopicDetail(topic)}
                        className={`p-5 sm:p-6 rounded-3xl transition-all relative overflow-hidden cursor-pointer ${topic.colorTheme.cardBg} border ${topic.colorTheme.border} hover:border-amber-400 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 space-y-4`}
                      >
                        {/* Top Stage & Time Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold tracking-wide text-slate-400">
                            {topic.stageName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {topic.durationMinutes} Menit
                            </span>
                            {user.role !== 'student' ? (
                              <span
                                onClick={(e) => handleToggleStatus(topic.id, e)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isInProgress
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {isCompleted ? '✓ Tuntas' : isInProgress ? '⏳ Sedang Belajar' : '○ Belum Mulai'}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isInProgress
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                                title="Status capaian materi silabus"
                              >
                                {isCompleted ? '✓ Tuntas' : isInProgress ? '⏳ Sedang Belajar' : '○ Belum Mulai'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5">
                          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                            {topic.topicNumber}. {topic.title}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {topic.competency}
                          </p>
                        </div>

                        {/* Subtopics Checklist Pills */}
                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Materi Pokok & Sub-Bab:
                            </span>
                            <ul className="text-xs text-slate-300 space-y-1">
                              {topic.subtopics.slice(0, 3).map((sub, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span className="line-clamp-1">{sub}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Card Bottom Meta */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            {topic.teachingMethod}
                          </span>
                          <div className="flex items-center gap-2">
                            {user.role !== 'student' && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenJournalForTopic(topic, e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                                title={`Tulis Jurnal untuk Topik ${topic.topicNumber}: ${topic.title}`}
                              >
                                <FileText className="w-3 h-3 shrink-0" />
                                <span>Tulis di Jurnal</span>
                              </button>
                            )}
                            <span className="text-amber-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Detail Topik <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 5. TABLE / GRID VIEW OF SILABUS TOPICS */
        /* ========================================================================= */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4 w-16 text-center">Topik</th>
                  <th className="p-4">Subtest & Materi Silabus</th>
                  <th className="p-4">Target Capaian & Kompetensi</th>
                  <th className="p-4 w-32 text-center">Durasi</th>
                  <th className="p-4 w-32 text-center">Status</th>
                  <th className="p-4 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTopics.map((topic) => {
                  const status = topicProgress[topic.id] || 'NOT_STARTED';
                  const isCompleted = status === 'COMPLETED';
                  const isInProgress = status === 'IN_PROGRESS';

                  return (
                    <tr
                      key={topic.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedTopicDetail(topic)}
                    >
                      <td className="p-4 text-center font-mono font-bold text-cyan-400">
                        #{topic.topicNumber}
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 font-mono">
                            {topic.subtestCode}
                          </span>
                          <strong className="text-white text-xs">{topic.title}</strong>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{topic.description}</p>
                      </td>
                      <td className="p-4 text-[11px] text-slate-300 leading-snug">
                        {topic.competency}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {topic.durationMinutes} Menit
                      </td>
                      <td className="p-4 text-center">
                        {user.role !== 'student' ? (
                          <button
                            onClick={(e) => handleToggleStatus(topic.id, e)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isInProgress
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isCompleted ? '✓ Tuntas' : isInProgress ? '⏳ Sedang' : '○ Belum'}
                          </button>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isInProgress
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                            title="Status capaian materi silabus"
                          >
                            {isCompleted ? '✓ Tuntas' : isInProgress ? '⏳ Sedang' : '○ Belum'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTopicDetail(topic)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                            title="Lihat Detail Topik"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPrintSyllabus(topic.subtestCode, topic)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 transition-colors"
                            title="Pratinjau & Cetak RPP Topik Ini"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {user.role !== 'student' && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenJournalForTopic(topic, e)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[10px] font-bold transition-all shadow-sm active:scale-95"
                              title={`Tulis di Jurnal: ${topic.title}`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Jurnal</span>
                            </button>
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

      {/* ========================================================================= */}
      {/* 6. BOTTOM INSPIRING SLOGAN BANNER (EXACTLY MATCHING REFERENCE IMAGE!) */}
      {/* ========================================================================= */}
      <div className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl space-y-4">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="inline-flex p-3 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/20">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div className="space-y-1.5 relative z-10">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Teruslah Belajar & Berkembang!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Konsistensi menyelesaikan setiap topik silabus adalah kunci meraih skor maksimal dan lolos seleksi PSB Labschool 2027.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('labschool_roadmap')}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Lihat Roadmap Lengkap Labschool</span>
          </button>
          <button
            onClick={() => onNavigateTab(selectedLevel === 'SMA' ? 'labschool_psb_sma' : 'labschool_psb_smp')}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Mulai Simulasi Tryout CBT {selectedLevel}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DETAIL TOPIK SILABUS */}
      {/* ========================================================================= */}
      {selectedTopicDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedTopicDetail(null)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                {renderNodeIcon(selectedTopicDetail.iconType, 'w-6 h-6')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                    {selectedTopicDetail.subtestCode} • {selectedTopicDetail.stageName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedTopicDetail.durationMinutes} Menit
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Topik {selectedTopicDetail.topicNumber}: {selectedTopicDetail.title}
                </h3>
              </div>
            </div>

            {/* Target Capaian Pembelajaran */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-300 block uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Target Capaian Pembelajaran
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedTopicDetail.competency}
              </p>
            </div>

            {/* Subtopics Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Rincian Materi Pokok & Sub-Topik ({selectedTopicDetail.subtopics.length}):
              </span>
              <div className="space-y-2">
                {selectedTopicDetail.subtopics.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metode & Referensi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembelajaran</span>
                <p className="text-slate-200 font-medium">{selectedTopicDetail.teachingMethod}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Bahan Ajar & Modul</span>
                <p className="text-slate-200 font-medium">
                  {selectedTopicDetail.referenceNotes || 'Modul Silabus Standar Labschool'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              {user.role !== 'student' ? (
                <button
                  onClick={() => handleToggleStatus(selectedTopicDetail.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    topicProgress[selectedTopicDetail.id] === 'COMPLETED'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {topicProgress[selectedTopicDetail.id] === 'COMPLETED'
                    ? 'Sudah Tuntas (Ubah)'
                    : 'Tandai Selesai Dipelajari'}
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-400">Status:</span>
                  <span className={topicProgress[selectedTopicDetail.id] === 'COMPLETED' ? 'text-emerald-400' : topicProgress[selectedTopicDetail.id] === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-400'}>
                    {topicProgress[selectedTopicDetail.id] === 'COMPLETED' ? '✓ Sudah Tuntas' : topicProgress[selectedTopicDetail.id] === 'IN_PROGRESS' ? '⏳ Sedang Dipelajari' : '○ Belum Dipelajari'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const top = selectedTopicDetail;
                    setSelectedTopicDetail(null);
                    handleOpenPrintSyllabus(top?.subtestCode, top);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 shadow-sm"
                  title="Pratinjau & Cetak Lembar RPP Topik Ini"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak RPP Topik</span>
                </button>
                {user.role !== 'student' && (
                  <button
                    type="button"
                    onClick={() => handleOpenJournalForTopic(selectedTopicDetail)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tulis di Jurnal</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTopicDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: JURNAL BELAJAR */}
      {/* ========================================================================= */}
      {isJournalModalOpen && (
        <LabschoolJournalModal
          isOpen={isJournalModalOpen}
          onClose={() => {
            setIsJournalModalOpen(false);
            setJournalInitialData(null);
            setJournalPrefillTopic(null);
          }}
          onSave={(savedMeeting) => {
            if (journalPrefillTopic?.id) {
              const updated = saveStoredTopicProgress(user.id, journalPrefillTopic.id, 'COMPLETED');
              setTopicProgress({ ...updated });
            }
          }}
          user={user}
          initialData={journalInitialData}
          defaultLevel={selectedLevel}
          defaultSubject={journalPrefillTopic?.subtestName || activeSubtestObj.name}
          defaultSyllabusCode={journalPrefillTopic?.subtestCode || activeSubtestObj.code}
          defaultTargetClass={selectedLevel === 'SMA' ? 'SMA-LABSCHOOL' : 'SMP-LABSCHOOL'}
          defaultTopicTitle={journalPrefillTopic?.title}
          defaultSubtopics={journalPrefillTopic?.subtopics}
          defaultCompetency={journalPrefillTopic?.competency}
          defaultTeachingMethod={journalPrefillTopic?.teachingMethod}
          defaultSyllabusTopicId={journalPrefillTopic?.id}
          defaultDriveLink={journalPrefillTopic?.driveLink}
          defaultDriveLinkTitle={journalPrefillTopic?.driveLinkTitle}
          defaultMeetingNumber={journalPrefillTopic?.topicNumber || 1}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRATINJAU & CETAK DOKUMEN SILABUS LABSCHOOL */}
      {/* ========================================================================= */}
      {isPrintSyllabusModalOpen && (
        <LabschoolPrintSyllabusModal
          isOpen={isPrintSyllabusModalOpen}
          onClose={() => {
            setIsPrintSyllabusModalOpen(false);
            setPrintModalTopic(null);
          }}
          user={user}
          initialLevel={selectedLevel}
          initialSubtestCode={printModalSubtestCode}
          initialTopic={printModalTopic}
          onShowToast={(msg, type) => showToast(msg, type)}
        />
      )}

      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/95 border-cyan-500/50 text-cyan-200'
            }`}
          >
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
