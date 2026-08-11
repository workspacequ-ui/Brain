import React, { useState, useMemo } from 'react';
import {
  Exam,
  ClassItem,
  ExamCategory,
  ExamMode,
  Question,
  ExamMainType,
  TryoutSubType,
  TRYOUT_SUB_TYPES,
  resolveExamType,
  ExamSubtest
} from '../../types';
import { formatGoogleDriveEmbedUrl, getGoogleDriveDirectViewUrl } from '../../utils/drive';
import { SUBTEST_PRESET_TEMPLATES, SubtestPreset, getSubtestsFromExam } from '../../utils/irtScoring';
import { QuestionInputStudioModal } from './QuestionInputStudioModal';
import { ExamEngine } from '../exam/ExamEngine';
import {
  FileCheck2,
  Plus,
  Key,
  Lock,
  Globe,
  Sliders,
  FileText,
  Sparkles,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Shuffle,
  Eye,
  ExternalLink,
  RefreshCw,
  Layers,
  ArrowRight,
  HelpCircle,
  Search,
  GraduationCap,
  Award,
  Zap,
  BookOpen,
  Check,
  Calculator,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ExamManagementProps {
  exams: Exam[];
  classes: ClassItem[];
  categories: ExamCategory[];
  onSaveExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({
  exams,
  classes,
  categories,
  onSaveExam,
  onDeleteExam,
  onShowToast
}) => {
  // Navigation & Filtering Menu States
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | ExamMainType>('ALL');
  const [activeTryoutSubTab, setActiveTryoutSubTab] = useState<'ALL_TRYOUT' | TryoutSubType>('ALL_TRYOUT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Modal Package Info State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Fullscreen Question Studio State
  const [studioExam, setStudioExam] = useState<Exam | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Post-Save Confirmation Modal (prompt to open Question Studio)
  const [savedSuccessExam, setSavedSuccessExam] = useState<Exam | null>(null);

  // Preview Exam State
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);

  // Form Basic Fields (Package Settings)
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamMainType>('TRYOUT');
  const [tryoutSubType, setTryoutSubType] = useState<TryoutSubType>('TO-SNBT');
  const [category, setCategory] = useState(categories[0]?.name || 'SNBT 2026');
  const [targetClass, setTargetClass] = useState(classes[0]?.name || 'XII-UTBK');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [mode, setMode] = useState<ExamMode>('EMBED_DRIVE_PDF');
  const [pdfDriveUrl, setPdfDriveUrl] = useState('');
  const [token, setToken] = useState('SNBT2026');
  const [isTokenPublic, setIsTokenPublic] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [showDiscussion, setShowDiscussion] = useState(true);
  const [isCatEnabled, setIsCatEnabled] = useState(false);
  const [catQuestionCount, setCatQuestionCount] = useState<number>(10);
  const [deadline, setDeadline] = useState('2026-12-31 23:59');

  // IRT & Multi-Subtest states
  const [isIRTEnabled, setIsIRTEnabled] = useState<boolean>(false);
  const [subtests, setSubtests] = useState<ExamSubtest[]>([]);
  const [showSubtestSection, setShowSubtestSection] = useState<boolean>(true);

  // Existing Questions to retain when updating package metadata
  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);

  // Count metrics for menu tabs
  const typeCounts = useMemo(() => {
    let total = exams.length;
    let tryouts = 0;
    let quizzes = 0;
    let ulangans = 0;

    const subCounts: Record<TryoutSubType, number> = {
      'TO-SNBT': 0,
      'TO-SMP LABSCHOOL': 0,
      'TO-SMA LABSCHOOL': 0,
      'TO-TKA SD': 0,
      'TO-TKA SMP': 0,
      'TO-TKA SMA': 0
    };

    exams.forEach(e => {
      const res = resolveExamType(e);
      if (res.mainType === 'TRYOUT') {
        tryouts++;
        if (res.tryoutSubType && subCounts[res.tryoutSubType] !== undefined) {
          subCounts[res.tryoutSubType]++;
        }
      } else if (res.mainType === 'QUIZ') {
        quizzes++;
      } else if (res.mainType === 'ULANGAN') {
        ulangans++;
      }
    });

    return { total, tryouts, quizzes, ulangans, subCounts };
  }, [exams]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const resolved = resolveExamType(exam);

      // Main type filter tab
      if (activeTypeTab !== 'ALL' && resolved.mainType !== activeTypeTab) {
        return false;
      }

      // Tryout sub-type filter tab (only applicable when Tryout is selected)
      if (activeTypeTab === 'TRYOUT' && activeTryoutSubTab !== 'ALL_TRYOUT') {
        if (resolved.tryoutSubType !== activeTryoutSubTab) {
          return false;
        }
      }

      // Class filter
      if (selectedClassFilter !== 'ALL' && exam.targetClass !== selectedClassFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = exam.title.toLowerCase().includes(query);
        const matchesCategory = exam.category.toLowerCase().includes(query);
        const matchesClass = exam.targetClass.toLowerCase().includes(query);
        const matchesToken = exam.token.toLowerCase().includes(query);
        const matchesType = resolved.mainLabel.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesClass && !matchesToken && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [exams, activeTypeTab, activeTryoutSubTab, selectedClassFilter, searchQuery]);

  // Subtest Handlers
  const handleAddSubtest = () => {
    const newOrder = subtests.length + 1;
    const newSt: ExamSubtest = {
      id: `subtest-${Date.now()}-${newOrder}`,
      name: `Subtes ${newOrder}`,
      code: `ST${newOrder}`,
      durationMinutes: 15,
      order: newOrder
    };
    setSubtests(prev => [...prev, newSt]);
  };

  const handleUpdateSubtest = (id: string, fields: Partial<ExamSubtest>) => {
    setSubtests(prev => prev.map(st => (st.id === id ? { ...st, ...fields } : st)));
  };

  const handleRemoveSubtest = (id: string) => {
    if (subtests.length <= 1) {
      if (onShowToast) onShowToast('Minimal terdapat 1 subtes dalam paket.', 'info');
      return;
    }
    setSubtests(prev => prev.filter(st => st.id !== id));
  };

  const handleApplySubtestPreset = (preset: SubtestPreset) => {
    const generated: ExamSubtest[] = preset.subtests.map((st, idx) => ({
      id: `subtest-${Date.now()}-${idx + 1}`,
      name: st.name,
      code: st.code,
      description: st.description,
      durationMinutes: st.durationMinutes || 20,
      order: idx + 1
    }));
    setSubtests(generated);
    if (!title.trim() || title === 'Paket Ujian Baru') {
      setTitle(preset.title);
    }
    if (onShowToast) {
      onShowToast(`Template "${preset.title}" diterapkan (${generated.length} Subtes).`, 'success');
    }
  };

  // Open Create Package Modal
  const openCreatePackageModal = () => {
    setEditingExam(null);
    setTitle('Simulasi Paket Kemampuan Verbal');
    setExamType('TRYOUT');
    setTryoutSubType('TO-SNBT');
    setCategory(categories[0]?.name || 'SNBT 2026');
    setTargetClass(classes[0]?.name || 'XII-UTBK');
    setDurationMinutes(40);
    setMode('NATIVE_CBT');
    setPdfDriveUrl('');
    setToken(`VERBAL${Math.floor(100 + Math.random() * 900)}`);
    setIsTokenPublic(true);
    setShuffleQuestions(false);
    setPassingScore(70);
    setMaxAttempts(2);
    setShowDiscussion(true);
    setIsCatEnabled(false);
    setCatQuestionCount(10);
    setDeadline('2026-12-31 23:59');

    // Default IRT enabled for Tryout
    setIsIRTEnabled(true);

    // Default 2 Subtest Groups (Kemampuan Verbal: Bahasa Indonesia & Bahasa Inggris)
    const initSubtests: ExamSubtest[] = [
      {
        id: `st-vbi-${Date.now()}`,
        name: 'Verbal Bahasa Indonesia',
        code: 'VBI',
        description: 'Sinonim, Antonim, Analogi Kata & Silogisme Bahasa Indonesia',
        durationMinutes: 20,
        order: 1
      },
      {
        id: `st-vbe-${Date.now()}`,
        name: 'Verbal Bahasa Inggris',
        code: 'VBE',
        description: 'Synonyms, Antonyms, Word Analogy & Reading Comprehension',
        durationMinutes: 20,
        order: 2
      }
    ];
    setSubtests(initSubtests);

    // Default template questions for new exam (5 for subtest 1, 5 for subtest 2)
    const initialQuestions: Question[] = [
      // Subtest 1: Verbal Bahasa Indonesia
      {
        id: `q-init-vbi-1`,
        number: 1,
        text: 'Sinonim kata <strong>"EKLIPS"</strong> adalah ...',
        questionType: 'SINGLE_CHOICE',
        subtestId: initSubtests[0].id,
        subtestName: initSubtests[0].name,
        options: [
          { key: 'A', text: 'Gerhana / Penutupan cahaya' },
          { key: 'B', text: 'Pancaran sinar matahari' },
          { key: 'C', text: 'Orbit lintasan planet' },
          { key: 'D', text: 'Gravitasi bumi' },
          { key: 'E', text: 'Kawah bulan' }
        ],
        correctAnswer: 'A',
        weight: 10,
        difficulty: 'sedang',
        irtDiscrimination: 1.2,
        irtDifficulty: -0.2,
        irtGuessing: 0.05,
        discussion: 'Eklips bermakna gerhana atau tertutupnya cahaya dari suatu benda langit oleh benda langit lain.'
      },
      {
        id: `q-init-vbi-2`,
        number: 2,
        text: 'Padanan Analogi: <strong>KORAN : ARTIKEL</strong> sepadan dengan ...',
        questionType: 'SINGLE_CHOICE',
        subtestId: initSubtests[0].id,
        subtestName: initSubtests[0].name,
        options: [
          { key: 'A', text: 'Buku : Bab' },
          { key: 'B', text: 'Mobil : Bensin' },
          { key: 'C', text: 'Lampu : Listrik' },
          { key: 'D', text: 'Pena : Tinta' },
          { key: 'E', text: 'Gitar : Senar' }
        ],
        correctAnswer: 'A',
        weight: 10,
        difficulty: 'sedang',
        irtDiscrimination: 1.3,
        irtDifficulty: 0.1,
        irtGuessing: 0.05,
        discussion: 'Koran tersusun atas kumpulan artikel, sebagaimana buku tersusun atas kumpulan bab.'
      },
      {
        id: `q-init-vbi-3`,
        number: 3,
        text: 'Semua ilmuwan berpikir kritis. Sebagian penulis adalah ilmuwan. Maka kesimpulannya adalah ...',
        questionType: 'SINGLE_CHOICE',
        subtestId: initSubtests[0].id,
        subtestName: initSubtests[0].name,
        options: [
          { key: 'A', text: 'Sebagian penulis berpikir kritis' },
          { key: 'B', text: 'Semua penulis berpikir kritis' },
          { key: 'C', text: 'Semua ilmuwan adalah penulis' },
          { key: 'D', text: 'Tidak ada penulis yang berpikir kritis' },
          { key: 'E', text: 'Sebagian ilmuwan tidak berpikir kritis' }
        ],
        correctAnswer: 'A',
        weight: 10,
        difficulty: 'sulit',
        irtDiscrimination: 1.5,
        irtDifficulty: 0.9,
        irtGuessing: 0.05,
        discussion: 'Karena sebagian penulis adalah ilmuwan dan setiap ilmuwan berpikir kritis, maka sebagian penulis pasti berpikir kritis.'
      },
      // Subtest 2: Verbal Bahasa Inggris
      {
        id: `q-init-vbe-1`,
        number: 4,
        text: 'Choose the word closest in meaning to <strong>"METICULOUS"</strong>:',
        questionType: 'SINGLE_CHOICE',
        subtestId: initSubtests[1].id,
        subtestName: initSubtests[1].name,
        options: [
          { key: 'A', text: 'Extremely careful and precise' },
          { key: 'B', text: 'Careless and hasty' },
          { key: 'C', text: 'Extravagant and luxurious' },
          { key: 'D', text: 'Doubtful and hesitant' },
          { key: 'E', text: 'Mysterious and secretive' }
        ],
        correctAnswer: 'A',
        weight: 10,
        difficulty: 'sedang',
        irtDiscrimination: 1.2,
        irtDifficulty: 0.0,
        irtGuessing: 0.05,
        discussion: '"Meticulous" means showing great attention to detail; very careful and precise.'
      },
      {
        id: `q-init-vbe-2`,
        number: 5,
        text: 'Analogy: <strong>AUTHOR : NOVEL</strong> is similar to ...',
        questionType: 'SINGLE_CHOICE',
        subtestId: initSubtests[1].id,
        subtestName: initSubtests[1].name,
        options: [
          { key: 'A', text: 'Composer : Symphony' },
          { key: 'B', text: 'Actor : Stage' },
          { key: 'C', text: 'Driver : Engine' },
          { key: 'D', text: 'Chef : Kitchen' },
          { key: 'E', text: 'Painter : Brush' }
        ],
        correctAnswer: 'A',
        weight: 10,
        difficulty: 'sulit',
        irtDiscrimination: 1.4,
        irtDifficulty: 0.8,
        irtGuessing: 0.05,
        discussion: 'An author creates a novel, just as a composer creates a symphony (Creator : Creation).'
      }
    ];

    setExistingQuestions(initialQuestions);
    setIsPackageModalOpen(true);
  };

  // Open Edit Package Metadata Modal
  const openEditPackageModal = (exam: Exam) => {
    const resolved = resolveExamType(exam);
    setEditingExam(exam);
    setTitle(exam.title);
    setExamType(resolved.mainType);
    setTryoutSubType(resolved.tryoutSubType || 'TO-SNBT');
    setCategory(exam.category);
    setTargetClass(exam.targetClass);
    setDurationMinutes(exam.durationMinutes);
    setMode(exam.mode);
    setPdfDriveUrl(exam.pdfDriveUrl || '');
    setToken(exam.token);
    setIsTokenPublic(exam.isTokenPublic);
    setShuffleQuestions(exam.shuffleQuestions);
    setPassingScore(exam.passingScore);
    setMaxAttempts(exam.maxAttempts !== undefined ? exam.maxAttempts : 1);
    setShowDiscussion(exam.showDiscussion !== undefined ? exam.showDiscussion : true);
    setIsCatEnabled(exam.isCatEnabled || false);
    setCatQuestionCount(exam.catQuestionCount || exam.questions?.length || 10);
    setDeadline(exam.deadline);
    setExistingQuestions(exam.questions || []);

    // IRT and Subtests
    setIsIRTEnabled(exam.isIRTEnabled ?? (exam.scoringMethod === 'IRT' || exam.tryoutSubType === 'TO-SNBT'));
    if (exam.subtests && exam.subtests.length > 0) {
      setSubtests(JSON.parse(JSON.stringify(exam.subtests)));
    } else {
      setSubtests(getSubtestsFromExam(exam));
    }

    setIsPackageModalOpen(true);
  };

  // Open Fullscreen Question Studio
  const openQuestionStudio = (exam: Exam) => {
    setStudioExam(exam);
    setIsStudioOpen(true);
  };

  // Save Package Settings
  const handleSavePackage = (openStudioDirectly: boolean = false) => {
    if (!title.trim()) {
      if (onShowToast) onShowToast('Silakan isi judul paket ujian.', 'error');
      return;
    }

    const examId = editingExam ? editingExam.id : `exam-${Date.now()}`;
    const sanitizedSubtests = subtests.length > 0
      ? subtests.map((st, idx) => ({
          ...st,
          order: idx + 1,
          code: st.code || `ST${idx + 1}`
        }))
      : [
          {
            id: `st-main-${Date.now()}`,
            name: title.trim(),
            code: 'UTAMA',
            order: 1
          }
        ];

    // Ensure questions are mapped to subtests
    const updatedQuestions = existingQuestions.map((q, idx) => {
      const matchingSt = sanitizedSubtests.find(s => s.id === q.subtestId);
      if (matchingSt) {
        return { ...q, subtestName: matchingSt.name };
      }
      // If not matching, assign to first subtest
      const targetSt = sanitizedSubtests[0];
      return {
        ...q,
        subtestId: targetSt.id,
        subtestName: targetSt.name
      };
    });

    const savedExam: Exam = {
      id: examId,
      title: title.trim(),
      category,
      targetClass,
      examType,
      tryoutSubType: examType === 'TRYOUT' ? tryoutSubType : undefined,
      durationMinutes: Number(durationMinutes) || 30,
      mode,
      pdfDriveUrl: mode === 'EMBED_DRIVE_PDF' ? formatGoogleDriveEmbedUrl(pdfDriveUrl.trim()) : undefined,
      token: token.trim().toUpperCase() || 'TOKEN123',
      isTokenPublic,
      shuffleQuestions,
      passingScore: Number(passingScore) || 70,
      allowRetake: maxAttempts !== 1,
      maxAttempts: Number(maxAttempts),
      showDiscussion,
      isCatEnabled: mode === 'NATIVE_CBT' ? isCatEnabled : false,
      catQuestionCount: mode === 'NATIVE_CBT' && isCatEnabled ? Math.max(1, Number(catQuestionCount)) : undefined,
      // IRT & Subtests
      isIRTEnabled,
      scoringMethod: isIRTEnabled ? 'IRT' : 'CLASSICAL',
      subtests: sanitizedSubtests,
      deadline: deadline || '2026-12-31 23:59',
      questions: updatedQuestions,
      totalQuestions: updatedQuestions.length,
      createdAt: editingExam ? editingExam.createdAt : new Date().toISOString().split('T')[0]
    };

    onSaveExam(savedExam);
    setIsPackageModalOpen(false);

    if (openStudioDirectly) {
      // Immediately open fullscreen question studio
      openQuestionStudio(savedExam);
      if (onShowToast) {
        onShowToast(`Paket "${savedExam.title}" tersimpan! Membuka Studio Input Soal...`, 'success');
      }
    } else {
      // Show confirmation prompt
      setSavedSuccessExam(savedExam);
      if (onShowToast) {
        onShowToast(`Informasi Paket Ujian "${savedExam.title}" berhasil disimpan!`, 'success');
      }
    }
  };

  // Save questions updated from Studio
  const handleSaveQuestionsFromStudio = (updatedExam: Exam) => {
    onSaveExam(updatedExam);
    setStudioExam(updatedExam);
    if (onShowToast) {
      onShowToast(`Soal ujian untuk paket "${updatedExam.title}" berhasil disimpan!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Bank Paket Ujian & Studio Input Soal</h2>
          </div>
          <p className="text-xs text-slate-400">
            Kelola pengelompokan jenis ujian (Tryout, Quiz, Ulangan) dan input butir soal dalam Studio Layar Penuh.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePackageModal}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Buat Paket Ujian Baru
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXAM CATEGORY & SUB-CATEGORY NAVIGATION MENU                              */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        
        {/* Top Main Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* 1. Tab Semua Ujian */}
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('ALL');
                setActiveTryoutSubTab('ALL_TRYOUT');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTypeTab === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-extrabold'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Semua Ujian</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTypeTab === 'ALL' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {typeCounts.total}
              </span>
            </button>

            {/* 2. Tab Tryout */}
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('TRYOUT');
                setActiveTryoutSubTab('ALL_TRYOUT');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTypeTab === 'TRYOUT'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 font-extrabold border border-cyan-400/40'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-cyan-300" />
              <span>Tryout</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTypeTab === 'TRYOUT' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {typeCounts.tryouts}
              </span>
            </button>

            {/* 3. Tab Quiz */}
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('QUIZ');
                setActiveTryoutSubTab('ALL_TRYOUT');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTypeTab === 'QUIZ'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-lg shadow-amber-600/30 font-extrabold border border-amber-400/40'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Quiz</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTypeTab === 'QUIZ' ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {typeCounts.quizzes}
              </span>
            </button>

            {/* 4. Tab Ulangan */}
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('ULANGAN');
                setActiveTryoutSubTab('ALL_TRYOUT');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTypeTab === 'ULANGAN'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-extrabold border border-emerald-400/40'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>Ulangan</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTypeTab === 'ULANGAN' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {typeCounts.ulangans}
              </span>
            </button>

          </div>

          {/* Search & Class Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari ujian / token..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 shrink-0 font-medium"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Navigation Pills for Tryout (Displayed when Tryout tab is active) */}
        {activeTypeTab === 'TRYOUT' && (
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Pilih Bagian / Kategori Tryout:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Pill: Semua Bagian Tryout */}
              <button
                type="button"
                onClick={() => setActiveTryoutSubTab('ALL_TRYOUT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTryoutSubTab === 'ALL_TRYOUT'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>Semua Tryout</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-900 rounded-md">
                  {typeCounts.tryouts}
                </span>
              </button>

              {/* 6 Sub-Types Requested */}
              {TRYOUT_SUB_TYPES.map(sub => {
                const count = typeCounts.subCounts[sub.id] || 0;
                const isSelected = activeTryoutSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveTryoutSubTab(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/30 text-cyan-200 border border-cyan-400 font-bold shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-950/80 text-cyan-400 font-mono border border-cyan-500/20">
                      {sub.targetClass}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-cyan-950 text-cyan-300 font-bold' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid Exams List */}
      {filteredExams.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Belum Ada Paket Ujian untuk Kategori Ini</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ditemukan paket ujian pada filter ini. Anda dapat membuat paket ujian baru dengan mengklik tombol di bawah.
          </p>
          <button
            type="button"
            onClick={openCreatePackageModal}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 mt-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Paket Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map(exam => {
            const resolved = resolveExamType(exam);
            return (
              <div
                key={exam.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  {/* Header Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Badge Jenis Ujian */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${resolved.bgClass} ${resolved.colorClass} border ${resolved.borderClass}`}>
                        {resolved.mainType === 'TRYOUT' && <GraduationCap className="w-3 h-3" />}
                        {resolved.mainType === 'QUIZ' && <Zap className="w-3 h-3" />}
                        {resolved.mainType === 'ULANGAN' && <BookOpen className="w-3 h-3" />}
                        <span>{resolved.badgeLabel}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                        {exam.targetClass}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      exam.mode === 'EMBED_DRIVE_PDF'
                        ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                    }`}>
                      {exam.mode === 'EMBED_DRIVE_PDF' ? 'PDF Drive + LJK' : 'Native CBT'}
                    </span>

                    {/* IRT Scoring Badge */}
                    {exam.isIRTEnabled && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-700/80 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> Penilaian IRT
                      </span>
                    )}

                    {/* Multi-Subtest Badge */}
                    {exam.subtests && exam.subtests.length > 1 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-950 text-teal-300 border border-teal-700/80 flex items-center gap-1 shadow-sm">
                        <Layers className="w-3 h-3 text-teal-400" /> {exam.subtests.length} Subtes
                      </span>
                    )}

                    {exam.isCatEnabled && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800/80 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-purple-400" /> CAT
                      </span>
                    )}
                  </div>

                  {/* Exam Title */}
                  <h3 className="font-extrabold text-slate-100 text-lg leading-snug">
                    {exam.title}
                  </h3>

                  {/* Subtests Preview if available */}
                  {exam.subtests && exam.subtests.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">Grup Subtes:</span>
                      {exam.subtests.map((st, sIdx) => (
                        <span
                          key={st.id || sIdx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-950 border border-slate-800 text-cyan-300"
                        >
                          {st.name} ({st.code || `ST${sIdx + 1}`})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Info Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-slate-500">Jenis:</span> <strong className="text-cyan-300">{resolved.mainLabel}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Kategori:</span> <strong className="text-slate-200">{exam.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Durasi:</span> <strong className="text-slate-200">{exam.durationMinutes} Menit</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Total Soal:</span>{' '}
                      <strong className="text-cyan-400 font-bold">
                        {exam.questions?.length || exam.totalQuestions || 0} Butir
                      </strong>
                    </div>
                  </div>

                  {/* Token Info Banner */}
                  <div className="flex items-center justify-between bg-slate-800/70 p-3 rounded-2xl border border-slate-700/50 text-xs">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 font-medium">Token:</span>
                      <span className="font-mono font-extrabold text-cyan-300 tracking-wider bg-slate-950 px-2 py-0.5 rounded-lg border border-cyan-800/60">
                        {exam.token}
                      </span>
                    </div>

                    {exam.isTokenPublic ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <Globe className="w-3 h-3" /> Publik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  
                  {/* PRIMARY ACTION: Input Soal Fullscreen Studio Button */}
                  <button
                    type="button"
                    onClick={() => openQuestionStudio(exam)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <FileText className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span>Input / Kelola Soal (Layar Penuh)</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Secondary Actions: Preview, Edit Info, Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      Batas: {exam.deadline || '-'}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewExam(exam)}
                        className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 text-purple-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="Simulasi Tampilan Siswa"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden sm:inline">Pratinjau</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditPackageModal(exam)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                        title="Edit Informasi & Pengaturan Paket"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Edit Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Yakin ingin menghapus paket ujian "${exam.title}"? Seluruh butir soal di dalamnya juga akan terhapus.`)) {
                            onDeleteExam(exam.id);
                            if (onShowToast) onShowToast('Paket ujian berhasil dihapus.', 'info');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs flex items-center gap-1 border border-rose-800/60 transition-all cursor-pointer"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL PEMBUATAN / EDIT INFORMASI PAKET UJIAN (Metadata & Rules Only) */}
      {/* ========================================================================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    {editingExam ? 'Edit Informasi Paket Ujian' : 'Buat Paket Ujian Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Langkah 1: Konfigurasikan jenis ujian, nama, durasi, target kelas, dan mode pengerjaan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSavePackage(false);
              }}
              className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar"
            >
              {/* 1. PILIHAN JENIS UJIAN (TRYOUT, QUIZ, ULANGAN) */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-cyan-300">
                  Pilih Jenis Ujian <span className="text-rose-400">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option: Tryout */}
                  <div
                    onClick={() => setExamType('TRYOUT')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      examType === 'TRYOUT'
                        ? 'bg-blue-950/70 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <GraduationCap className={`w-5 h-5 ${examType === 'TRYOUT' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      {examType === 'TRYOUT' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <span className="font-bold text-xs">Tryout</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Simulasi SNBT, Labschool & TKA</span>
                  </div>

                  {/* Option: Quiz */}
                  <div
                    onClick={() => setExamType('QUIZ')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      examType === 'QUIZ'
                        ? 'bg-amber-950/70 border-amber-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Zap className={`w-5 h-5 ${examType === 'QUIZ' ? 'text-amber-400' : 'text-slate-500'}`} />
                      {examType === 'QUIZ' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <span className="font-bold text-xs">Quiz</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Kuis Cepat & Pemahaman Konsep</span>
                  </div>

                  {/* Option: Ulangan */}
                  <div
                    onClick={() => setExamType('ULANGAN')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      examType === 'ULANGAN'
                        ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <BookOpen className={`w-5 h-5 ${examType === 'ULANGAN' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {examType === 'ULANGAN' && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="font-bold text-xs">Ulangan</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Ulangan Harian, PTS & PAS</span>
                  </div>
                </div>

                {/* Sub-Category Dropdown if Tryout is selected */}
                {examType === 'TRYOUT' && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Bagian / Kategori Tryout: <span className="text-cyan-400">*</span>
                      </label>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Target: {TRYOUT_SUB_TYPES.find(s => s.id === tryoutSubType)?.targetClass || 'Semua'}
                      </span>
                    </div>
                    <select
                      value={tryoutSubType}
                      onChange={e => {
                        const newSub = e.target.value as TryoutSubType;
                        setTryoutSubType(newSub);
                        const matched = TRYOUT_SUB_TYPES.find(s => s.id === newSub);
                        if (matched && matched.targetClass) {
                          const foundClass = classes.find(c => c.name === matched.targetClass || c.code === matched.targetClass);
                          if (foundClass) {
                            setTargetClass(foundClass.name);
                          }
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none"
                    >
                      {TRYOUT_SUB_TYPES.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.label} — Khusus Kelas {sub.targetClass} ({sub.description})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      Sesuai aturan akses: Sub-kategori tryout ini hanya akan tampil pada dashboard siswa dengan kelas target yang sesuai.
                    </p>
                  </div>
                )}
              </div>

              {/* Judul Ujian */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama / Judul Paket Ujian <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Tryout UTBK-SNBT 2026 - Kemampuan Penalaran Umum"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kategori Ujian */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Ujian
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    {categories.map((c, idx) => (
                      <option key={`exam-cat-${c.id}-${idx}`} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kelas Target */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas Akses Target
                  </label>
                  <select
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Durasi Pengerjaan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Durasi Pengerjaan (Menit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                {/* KKM Passing Score */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    KKM / Nilai Kelulusan
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={passingScore}
                    onChange={e => setPassingScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                {/* Batas Pengerjaan Siswa */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batas Pengerjaan (Max Attempts)
                  </label>
                  <select
                    value={maxAttempts}
                    onChange={e => setMaxAttempts(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value={1}>1 Kali Pengerjaan (Standar)</option>
                    <option value={2}>2 Kali Pengerjaan</option>
                    <option value={3}>3 Kali Pengerjaan</option>
                    <option value={0}>Tidak Terbatas (Bebas / Latihan Mandiri)</option>
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batas Waktu Akses (Deadline)
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    placeholder="2026-12-31 23:59"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* 3. FITUR PENILAIAN IRT (ITEM RESPONSE THEORY)                            */}
              {/* ========================================================================= */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isIRTEnabled
                  ? 'bg-gradient-to-br from-indigo-950/80 via-slate-950 to-purple-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-950/90 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIRTEnabled}
                      onChange={e => setIsIRTEnabled(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-indigo-700 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-extrabold text-xs text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Aktifkan Penilaian IRT (Item Response Theory)
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sistem penilaian modern berbasis pembobotan daya beda, tingkat kesulitan, dan tebakan (Skala 200 - 1000).
                      </p>
                    </div>
                  </label>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    isIRTEnabled
                      ? 'bg-indigo-900/60 text-indigo-200 border-indigo-600'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {isIRTEnabled ? 'IRT AKTIF' : 'SKOR KLASIK'}
                  </span>
                </div>

                {isIRTEnabled && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-xs space-y-2 text-indigo-200 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Spesifikasi Scoring IRT 3-PL (Three Parameter Logistic):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-indigo-900/50">
                        <span className="text-indigo-400 font-bold block mb-0.5">1. Skala Standar SNBT:</span>
                        Rentang skor 200 - 1000 poin dengan distribusi persentil kemampuan.
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-indigo-900/50">
                        <span className="text-indigo-400 font-bold block mb-0.5">2. Estimasi Theta (θ):</span>
                        Kalkulasi EAP (Expected A Posteriori) log-likelihood kemampuan siswa.
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-indigo-900/50">
                        <span className="text-indigo-400 font-bold block mb-0.5">3. Bobot Item Dinamis:</span>
                        Tiap butir soal memiliki bobot daya beda ($a$), kesulitan ($b$), & tebakan ($c$).
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* 4. KELOMPOK SUBTES DALAM 1 PAKET UJIAN (MULTI-SUBTEST)                    */}
              {/* ========================================================================= */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <label className="text-xs font-bold text-cyan-300">
                        Kelompok Subtes Soal (Multi-Subtest)
                      </label>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {subtests.length} Subtes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Contoh: Paket <strong>Kemampuan Verbal</strong> berisi Subtes <em>Verbal Bahasa Indonesia</em> & <em>Verbal Bahasa Inggris</em>. Hasil dan analisis tiap subtes dipisahkan secara otomatis pada laporan siswa dan guru.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSubtest}
                    className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Subtes</span>
                  </button>
                </div>

                {/* Quick Template Presets */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pilih Cepat Template Subtes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBTEST_PRESET_TEMPLATES.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplySubtestPreset(preset)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-200 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{preset.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-950 text-cyan-400 rounded font-mono border border-cyan-800/40">
                          {preset.subtests.length} subtes
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtests List */}
                <div className="space-y-2 pt-1">
                  {subtests.map((st, idx) => (
                    <div
                      key={st.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all"
                    >
                      <div className="flex items-center gap-2.5 flex-1 w-full">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                          <input
                            type="text"
                            value={st.name}
                            onChange={e => handleUpdateSubtest(st.id, { name: e.target.value })}
                            placeholder="Nama Subtes (e.g. Verbal Bahasa Indonesia)"
                            className="bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                            required
                          />
                          <input
                            type="text"
                            value={st.code || ''}
                            onChange={e => handleUpdateSubtest(st.id, { code: e.target.value.toUpperCase() })}
                            placeholder="Kode (e.g. VBI)"
                            className="bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono font-bold uppercase"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 shrink-0">Durasi:</span>
                            <input
                              type="number"
                              min={1}
                              max={180}
                              value={st.durationMinutes || 20}
                              onChange={e => handleUpdateSubtest(st.id, { durationMinutes: Number(e.target.value) })}
                              className="w-16 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold"
                            />
                            <span className="text-[11px] text-slate-400">menit</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubtest(st.id)}
                        disabled={subtests.length <= 1}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all ${
                          subtests.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Hapus Subtes"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Ujian */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">
                    Pilih Format / Mode Ujian
                  </label>
                  <select
                    value={mode}
                    onChange={e => setMode(e.target.value as ExamMode)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="EMBED_DRIVE_PDF">1. MODE EMBED GOOGLE DRIVE PDF (Split-Screen View & LJK Digital)</option>
                    <option value="NATIVE_CBT">2. MODE NATIVE CBT (Soal Teks, Rumus, & Gambar Per Nomor)</option>
                  </select>
                </div>

                {/* Link Google Drive jika mode PDF */}
                {mode === 'EMBED_DRIVE_PDF' && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-slate-300">
                      Link Google Drive PDF Naskah Soal:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={pdfDriveUrl}
                        onChange={e => setPdfDriveUrl(e.target.value)}
                        onBlur={() => {
                          if (pdfDriveUrl) {
                            setPdfDriveUrl(formatGoogleDriveEmbedUrl(pdfDriveUrl));
                          }
                        }}
                        placeholder="https://drive.google.com/file/d/1Bzx7tT3.../view?usp=sharing"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        required={mode === 'EMBED_DRIVE_PDF'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (pdfDriveUrl) {
                            setPdfDriveUrl(formatGoogleDriveEmbedUrl(pdfDriveUrl));
                          }
                        }}
                        className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Format URL otomatis ke /preview"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Format</span>
                      </button>
                    </div>

                    {pdfDriveUrl && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span>URL Embed: <strong className="text-cyan-400 font-mono">{formatGoogleDriveEmbedUrl(pdfDriveUrl).slice(0, 45)}...</strong></span>
                        <a
                          href={getGoogleDriveDirectViewUrl(pdfDriveUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <ExternalLink className="w-3 h-3" /> Uji Buka PDF
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Token & Options */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kode Token Ujian
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-bold uppercase focus:outline-none"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={isTokenPublic}
                        onChange={e => setIsTokenPublic(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0"
                      />
                      <span>Tampilkan Token Publik di Dashboard Siswa</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={e => setShuffleQuestions(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0"
                    />
                    <span className="flex items-center gap-1">
                      <Shuffle className="w-3.5 h-3.5 text-cyan-400" /> Acak Urutan Soal
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={showDiscussion}
                      onChange={e => setShowDiscussion(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0"
                    />
                    <span className="flex items-center gap-1 text-cyan-300 font-medium">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" /> Izinkan Pembahasan Setelah Ujian
                    </span>
                  </label>
                </div>

                {/* CAT Option if Native CBT */}
                {mode === 'NATIVE_CBT' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={isCatEnabled}
                        onChange={e => setIsCatEnabled(e.target.checked)}
                        className="rounded bg-slate-900 border-purple-800 text-purple-500 focus:ring-0"
                      />
                      <span className="flex items-center gap-1 font-bold text-purple-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Aktifkan Sistem Computer Adaptive Test (CAT)
                      </span>
                    </label>

                    {isCatEnabled && (
                      <div className="flex items-center gap-2 bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/60 text-xs text-purple-200">
                        <span>Jumlah soal CAT yang dikeluarkan:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={catQuestionCount}
                          onChange={e => setCatQuestionCount(Math.max(1, Number(e.target.value)))}
                          className="w-16 bg-slate-900 border border-purple-700 rounded-lg py-1 px-2 text-center text-xs font-bold text-white focus:outline-none"
                        />
                        <span>soal</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="sm:w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="sm:w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Simpan Paket</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePackage(true)}
                  className="sm:w-2/3 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Simpan & Input Soal (Fullscreen)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. POST-SAVE PROMPT MODAL (Opsi langsung buka Studio Soal)               */}
      {/* ========================================================================= */}
      {savedSuccessExam && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg">
                Paket Soal Berhasil Disimpan!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Paket <strong>&quot;{savedSuccessExam.title}&quot;</strong> telah terdaftar. Anda dapat langsung menginputkan atau mengelola butir soal sekarang.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-300 text-left space-y-1">
              <div>🎯 <strong>Kelas:</strong> {savedSuccessExam.targetClass}</div>
              <div>⏱️ <strong>Durasi:</strong> {savedSuccessExam.durationMinutes} Menit</div>
              <div>📑 <strong>Format:</strong> {savedSuccessExam.mode === 'EMBED_DRIVE_PDF' ? 'PDF Google Drive + LJK' : 'Native CBT Teks & Gambar'}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSavedSuccessExam(null)}
                className="sm:w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Kembali ke Daftar
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = savedSuccessExam;
                  setSavedSuccessExam(null);
                  openQuestionStudio(target);
                }}
                className="sm:w-1/2 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Buka Input Soal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN QUESTION INPUT STUDIO (JENDELA FULLSCREEN INPUT SOAL)       */}
      {/* ========================================================================= */}
      {studioExam && (
        <QuestionInputStudioModal
          exam={studioExam}
          isOpen={isStudioOpen}
          onClose={() => {
            setIsStudioOpen(false);
            setStudioExam(null);
          }}
          onSaveExamQuestions={handleSaveQuestionsFromStudio}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL PRATINJAU UJIAN (SIMULASI TAMPILAN SISWA)                       */}
      {/* ========================================================================= */}
      {previewExam && (
        <ExamEngine
          exam={previewExam}
          user={{
            id: 'admin-preview-user',
            name: 'Administrator (Preview Mode)',
            nis: '00000',
            role: 'ADMIN',
            className: previewExam.targetClass,
            status: 'APPROVED'
          }}
          previewMode={true}
          defaultTheme="light"
          onSubmitExam={(result) => {
            if (onShowToast) {
              onShowToast(`[Pratinjau Selesai] Skor Simulasi: ${result.score} (${result.percentage}%)`, 'info');
            }
            setPreviewExam(null);
          }}
          onCancelExam={() => setPreviewExam(null)}
        />
      )}

    </div>
  );
};
