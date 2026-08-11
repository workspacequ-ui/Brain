import React, { useState, useEffect, useMemo } from 'react';
import { Exam, User, StudentAnswer, ExamResult, InstitutionInfo } from '../../types';
import { formatGoogleDriveEmbedUrl, getGoogleDriveDirectViewUrl } from '../../utils/drive';
import { getInstitutionInfo } from '../../utils/storage';
import { calculateExamAndSubtestResults, getSubtestsFromExam } from '../../utils/irtScoring';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  FileText,
  ListOrdered,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  LogOut,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Sun,
  Moon,
  Type,
  Eye,
  EyeOff,
  Flag,
  Check,
  BookOpen,
  Info,
  ZoomIn,
  Layers,
  Calculator
} from 'lucide-react';

interface ExamEngineProps {
  exam: Exam;
  user: User;
  onSubmitExam: (result: ExamResult) => void;
  onCancelExam: () => void;
  previewMode?: boolean;
  defaultTheme?: 'light' | 'dark';
}

export const ExamEngine: React.FC<ExamEngineProps> = ({
  exam,
  user,
  onSubmitExam,
  onCancelExam,
  previewMode = false,
  defaultTheme = 'light'
}) => {
  // Theme State: 'light' | 'dark' (Default to light as requested)
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);

  // Font Size Scaling: 'sm' | 'md' | 'lg' | 'xl'
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  // Preview Mode: Show Answer Key / Discussion Toggle
  const [showAnswerKeyInPreview, setShowAnswerKeyInPreview] = useState(false);

  // Image Zoom Modal State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Question Matrix Filter: 'ALL' | 'UNANSWERED' | 'DOUBTFUL' | 'ANSWERED'
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'UNANSWERED' | 'DOUBTFUL' | 'ANSWERED'>('ALL');

  // Subtest Group Filter: 'ALL' | subtestId
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState<string>('ALL');

  // Mobile Question List Drawer
  const [isMobileQuestionListOpen, setIsMobileQuestionListOpen] = useState(false);

  // Timer State in seconds
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);

  // Student Answers State: Record<questionId, StudentAnswer>
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});

  // Active Question Index for Native CBT Mode or LJK Focus
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Modal Submit Confirmation
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // PDF Frame Zoom level (for PDF mode)
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);

  // PDF Viewer Mode Fallback
  const [useDocsViewerFallback, setUseDocsViewerFallback] = useState(false);

  const isPreview = previewMode || user.role?.toUpperCase() === 'ADMIN' || user.id?.includes('preview');

  // Countdown Timer Hook
  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      handleFinalSubmit(); // Auto Submit on timeout
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  // Format Timer mm:ss or hh:mm:ss
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[activeQuestionIndex] || exam.questions[0];
  const isCatMode = exam.mode === 'NATIVE_CBT' && !!exam.isCatEnabled;

  // CAT Difficulty Helper
  const getDifficultyVal = (diff?: string): number => {
    if (diff === 'mudah') return 1;
    if (diff === 'sedang') return 2;
    if (diff === 'sulit') return 3;
    if (diff === 'hots') return 4;
    return 2;
  };

  // Check correctness of current question
  const checkIsQuestionCorrect = (q: any, studentAns: any): boolean => {
    if (studentAns === undefined || studentAns === '' || (Array.isArray(studentAns) && studentAns.length === 0)) {
      return false;
    }
    if (q.questionType === 'COMPLEX_CHOICE') {
      const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
      const studentArr = Array.isArray(studentAns) ? studentAns : [studentAns];
      return correctArr.length === studentArr.length && correctArr.every((val: any) => studentArr.includes(val));
    } else if (q.questionType === 'TRUE_FALSE' && q.statements && q.statements.length > 0) {
      let matched = 0;
      q.statements.forEach((stmt: any) => {
        const choice = (studentAns as Record<string, 'TRUE' | 'FALSE'>)?.[stmt.id];
        if (choice && choice === stmt.correctAnswer) matched++;
      });
      return matched === q.statements.length;
    } else if (q.questionType === 'ESSAY') {
      const expected = String(q.correctAnswer).trim().toLowerCase();
      const given = String(studentAns).trim().toLowerCase();
      return given.includes(expected) || expected.includes(given);
    } else {
      return String(studentAns).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
    }
  };

  // CAT Adaptive Next Question Handler
  const handleNextQuestion = () => {
    if (!isCatMode) {
      if (activeQuestionIndex < exam.questions.length - 1) {
        setActiveQuestionIndex(prev => prev + 1);
      } else {
        setIsSubmitModalOpen(true);
      }
      return;
    }

    // CAT Mode Logic
    const isCorrect = checkIsQuestionCorrect(currentQuestion, answers[currentQuestion.id]?.answer);
    const currLevelVal = getDifficultyVal(currentQuestion.difficulty);
    const targetLevelVal = isCorrect ? Math.min(4, currLevelVal + 1) : Math.max(1, currLevelVal - 1);

    // Find remaining unanswered questions
    const unansweredIndices = exam.questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q, idx }) => {
        if (idx === activeQuestionIndex) return false;
        const ans = answers[q.id]?.answer;
        return ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0);
      });

    if (unansweredIndices.length === 0) {
      setIsSubmitModalOpen(true);
      return;
    }

    let bestItem = unansweredIndices[0];
    let minDiff = Math.abs(getDifficultyVal(bestItem.q.difficulty) - targetLevelVal);

    for (const item of unansweredIndices) {
      const diff = Math.abs(getDifficultyVal(item.q.difficulty) - targetLevelVal);
      if (diff < minDiff) {
        minDiff = diff;
        bestItem = item;
      }
    }

    setActiveQuestionIndex(bestItem.idx);
  };

  // Handle Select Answer
  const handleSelectOption = (questionId: string, value: string, isComplex = false) => {
    const existing = answers[questionId];

    if (isComplex) {
      const currentList = Array.isArray(existing?.answer) ? existing.answer : [];
      let updatedList: string[];
      if (currentList.includes(value)) {
        updatedList = currentList.filter(item => item !== value);
      } else {
        updatedList = [...currentList, value];
      }

      setAnswers({
        ...answers,
        [questionId]: {
          questionId,
          answer: updatedList,
          isDoubtful: existing?.isDoubtful || false
        }
      });
    } else {
      const isAlreadySelected = existing?.answer === value;
      setAnswers({
        ...answers,
        [questionId]: {
          questionId,
          answer: isAlreadySelected ? '' : value,
          isDoubtful: existing?.isDoubtful || false
        }
      });
    }
  };

  // Reset / Kosongkan Jawaban
  const handleResetAnswer = (questionId: string) => {
    const existing = answers[questionId];
    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        answer: '',
        isDoubtful: false
      }
    });
  };

  // Handle True/False Multi-Statement Table Answer
  const handleSelectTrueFalseStatement = (questionId: string, statementId: string, value: 'TRUE' | 'FALSE') => {
    const existing = answers[questionId];
    const currentObj = (typeof existing?.answer === 'object' && !Array.isArray(existing?.answer) && existing?.answer !== null)
      ? { ...(existing.answer as Record<string, 'TRUE' | 'FALSE'>) }
      : {};

    currentObj[statementId] = value;

    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        answer: currentObj,
        isDoubtful: existing?.isDoubtful || false
      }
    });
  };

  // Toggle Ragu-ragu (Doubtful)
  const handleToggleDoubtful = (questionId: string) => {
    const existing = answers[questionId] || { questionId, answer: '' };
    setAnswers({
      ...answers,
      [questionId]: {
        ...existing,
        isDoubtful: !existing.isDoubtful
      }
    });
  };

  // Automatic Score Calculation Logic (Supports Classic Scoring, IRT 3PL & Multi-Subtest)
  const handleFinalSubmit = () => {
    const calcResult = calculateExamAndSubtestResults(exam, answers);
    const {
      correctCount,
      incorrectCount,
      unansweredCount,
      totalScore,
      totalMaxScore,
      finalScore,
      subtestResults,
      irtTheta,
      irtStandardScore,
      irtPercentile
    } = calcResult;

    const isPassed = finalScore >= (exam.passingScore || 0);

    const result: ExamResult = {
      id: `res-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      examCategory: exam.category,
      studentId: user.id,
      studentNis: user.nis,
      studentName: user.name,
      studentClass: user.className,
      answers,
      correctCount,
      incorrectCount,
      unansweredCount,
      score: finalScore,
      maxScore: exam.isIRTEnabled ? 1000 : 100,
      percentage: exam.isIRTEnabled ? Math.round((finalScore / 1000) * 100) : finalScore,
      isPassed,
      submittedAt: new Date().toISOString(),
      durationSpentSeconds: Math.max(0, exam.durationMinutes * 60 - timeLeftSeconds),
      isIRTScore: exam.isIRTEnabled,
      irtTheta,
      irtStandardScore,
      irtPercentile,
      subtestResults
    };

    onSubmitExam(result);
  };

  // Helper matrix counts
  const totalQuestions = exam.questions.length;
  const answerList = Object.values(answers) as StudentAnswer[];
  const answeredCount = answerList.filter(
    a => a.answer !== undefined && a.answer !== '' && (!Array.isArray(a.answer) || a.answer.length > 0) && (typeof a.answer !== 'object' || Object.keys(a.answer).length > 0)
  ).length;
  const doubtfulCount = answerList.filter(a => a.isDoubtful).length;
  const remainingCount = totalQuestions - answeredCount;

  // Filtered Questions for Number Matrix
  const filteredQuestionIndices = exam.questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q, idx }) => {
      const ans = answers[q.id];
      const isAnswered = ans?.answer !== undefined && ans?.answer !== '' && (!Array.isArray(ans.answer) || ans.answer.length > 0) && (typeof ans.answer !== 'object' || Object.keys(ans.answer).length > 0);
      const isDoubtful = ans?.isDoubtful || false;

      if (matrixFilter === 'ANSWERED') return isAnswered && !isDoubtful;
      if (matrixFilter === 'DOUBTFUL') return isDoubtful;
      if (matrixFilter === 'UNANSWERED') return !isAnswered && !isDoubtful;
      return true;
    });

  // Subtest Question Groups for Non-CAT navigation & multi-subtest packages
  const questionGroups = useMemo(() => {
    const allSubtests = getSubtestsFromExam(exam);
    const items = exam.questions.map((q, idx) => ({ q, idx }));

    const distinctSubtestIds = new Set(exam.questions.map(q => q.subtestId || q.subtestName).filter(Boolean));

    if (allSubtests.length <= 1 && distinctSubtestIds.size <= 1) {
      return [{
        id: allSubtests[0]?.id || 'default',
        name: allSubtests[0]?.name || 'Daftar Soal',
        code: allSubtests[0]?.code || 'SOAL',
        description: allSubtests[0]?.description,
        durationMinutes: allSubtests[0]?.durationMinutes,
        items
      }];
    }

    const groups: Array<{
      id: string;
      name: string;
      code?: string;
      description?: string;
      durationMinutes?: number;
      passingScore?: number;
      items: Array<{ q: any; idx: number }>;
    }> = [];
    const assignedQuestionIds = new Set<string>();

    allSubtests.forEach((st, sIdx) => {
      const stItems = items.filter(item => {
        if (item.q.subtestId && item.q.subtestId === st.id) return true;
        if (item.q.subtestName && item.q.subtestName.toLowerCase() === st.name.toLowerCase()) return true;
        return false;
      });

      groups.push({
        id: st.id || `st-${sIdx}`,
        name: st.name || `Subtes ${sIdx + 1}`,
        code: st.code || `ST${sIdx + 1}`,
        description: st.description,
        durationMinutes: st.durationMinutes,
        passingScore: st.passingScore,
        items: stItems
      });

      stItems.forEach(item => assignedQuestionIds.add(item.q.id));
    });

    items.forEach(item => {
      if (!assignedQuestionIds.has(item.q.id) && (item.q.subtestId || item.q.subtestName)) {
        const subId = item.q.subtestId || item.q.subtestName!;
        let g = groups.find(grp => grp.id === subId || grp.name.toLowerCase() === (item.q.subtestName || '').toLowerCase());
        if (!g) {
          g = {
            id: subId,
            name: item.q.subtestName || `Subtes ${groups.length + 1}`,
            code: `ST${groups.length + 1}`,
            items: []
          };
          groups.push(g);
        }
        g.items.push(item);
        assignedQuestionIds.add(item.q.id);
      }
    });

    const unassigned = items.filter(item => !assignedQuestionIds.has(item.q.id));
    if (unassigned.length === items.length && groups.length > 0) {
      let curIdx = 0;
      groups.forEach(g => {
        const stDef = allSubtests.find(s => s.id === g.id);
        const count = stDef?.questionCount || Math.ceil(items.length / groups.length);
        g.items = items.slice(curIdx, curIdx + count);
        curIdx += count;
      });
    } else if (unassigned.length > 0) {
      if (groups.length === 0) {
        groups.push({
          id: 'default',
          name: 'Daftar Soal',
          code: 'SOAL',
          items: unassigned
        });
      } else {
        groups.push({
          id: 'other',
          name: 'Soal Lainnya / Umum',
          code: 'UMUM',
          items: unassigned
        });
      }
    }

    return groups.filter(g => g.items.length > 0);
  }, [exam]);

  const activeQuestionGroup = useMemo(() => {
    return questionGroups.find(g => g.items.some(item => item.idx === activeQuestionIndex)) || questionGroups[0];
  }, [questionGroups, activeQuestionIndex]);

  // Typography font size CSS mapping
  const questionFontSizeClass =
    fontSize === 'sm' ? 'text-sm sm:text-base' :
    fontSize === 'lg' ? 'text-lg sm:text-xl' :
    fontSize === 'xl' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg';

  const optionFontSizeClass =
    fontSize === 'sm' ? 'text-xs sm:text-sm' :
    fontSize === 'lg' ? 'text-base sm:text-lg' :
    fontSize === 'xl' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base';

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>

      {/* TOP NOTIFICATION BANNER IF IN PREVIEW MODE */}
      {isPreview && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-950 text-amber-300 rounded font-black text-[10px] uppercase tracking-wider">
              Mode Pratinjau
            </span>
            <span>Anda sedang melihat simulasi tampilan ujian CBT untuk siswa.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAnswerKeyInPreview(!showAnswerKeyInPreview)}
              className="px-2.5 py-0.5 bg-slate-950/80 hover:bg-slate-950 text-white rounded font-bold text-[11px] flex items-center gap-1 transition-all"
            >
              {showAnswerKeyInPreview ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
              <span>{showAnswerKeyInPreview ? 'Sembunyikan Kunci' : 'Lihat Kunci & Pembahasan'}</span>
            </button>

            {onCancelExam && (
              <button
                type="button"
                onClick={onCancelExam}
                className="px-2.5 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup Pratinjau</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* HEADER UJIAN (TOP NAVIGATION BAR) */}
      <header className={`px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 shrink-0 border-b shadow-sm z-20 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Left: Institution Logo & User Avatar & Exam Info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Optional Institution Logo */}
          {(() => {
            const inst = getInstitutionInfo();
            if (!inst?.logoUrl) return null;

            const shapeClass = inst.logoShape === 'square'
              ? 'rounded-none'
              : inst.logoShape === 'circle'
              ? 'rounded-full'
              : 'rounded-xl';

            const isFullArea = inst.logoFullArea ?? true;
            const paddingClass = (isFullArea && (inst.logoPadding === 'none' || !inst.logoPadding))
              ? 'p-0'
              : inst.logoPadding === 'medium'
              ? 'p-1'
              : inst.logoPadding === 'small'
              ? 'p-0.5'
              : 'p-0';

            const fitClass = inst.logoFit === 'cover'
              ? 'object-cover'
              : inst.logoFit === 'fill'
              ? 'object-fill'
              : 'object-contain';

            const bgClass = inst.logoBgColor === 'white'
              ? 'bg-white'
              : inst.logoBgColor === 'dark'
              ? 'bg-slate-950'
              : 'bg-transparent';

            return (
              <div className={`hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 ${shapeClass} ${bgClass} ${paddingClass} ${
                inst.logoBorder !== false ? (isDark ? 'border border-slate-700/80 shadow-xs' : 'border border-slate-200 shadow-xs') : 'border-0'
              } items-center justify-center shrink-0 overflow-hidden`} title={inst.name}>
                <img
                  src={inst.logoUrl}
                  alt={inst.name}
                  className={`w-full h-full ${fitClass} ${inst.logoShape === 'circle' ? 'rounded-full' : shapeClass}`}
                />
              </div>
            );
          })()}

          {/* User Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shrink-0 shadow-sm">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
              alt={user.name}
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-extrabold text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {user.name}
              </span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                ({user.nis || '00000'})
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isDark ? 'bg-blue-950 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {user.className || exam.targetClass}
              </span>
            </div>
            <p className={`text-xs truncate max-w-xs sm:max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{exam.title}</strong> • {exam.category}
            </p>
          </div>
        </div>

        {/* Right: Quick Tools (Font Size, Theme Toggle, Timer & Submit Button) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Font Size Adjuster Controls */}
          <div className={`hidden md:flex items-center rounded-xl border p-0.5 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  fontSize === size
                    ? isDark ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Ukuran Tulisan: ${size.toUpperCase()}`}
              >
                {size === 'sm' ? 'A-' : size === 'md' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* Mobile Daftar Soal Toggle (non-CAT) */}
          {!isCatMode && (
            <button
              type="button"
              onClick={() => setIsMobileQuestionListOpen(true)}
              className={`lg:hidden px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Buka Daftar Nomor Soal"
            >
              <ListOrdered className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden xs:inline">Daftar Soal</span>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">({answeredCount}/{totalQuestions})</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-blue-600'
            }`}
            title={isDark ? 'Ganti ke Tema Terang (Putih)' : 'Ganti ke Tema Gelap'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Real-time Timer Count-down */}
          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border flex items-center gap-2 font-mono font-extrabold text-xs sm:text-sm shadow-sm ${
            timeLeftSeconds < 300
              ? isDark
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse'
              : isDark
                ? 'bg-slate-950 border-slate-800 text-blue-400'
                : 'bg-slate-50 border-slate-200 text-blue-700'
          }`}>
            <Clock className={`w-4 h-4 shrink-0 ${timeLeftSeconds < 300 ? 'text-rose-500' : 'text-blue-600'}`} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Exit Button */}
          {onCancelExam && (
            <button
              type="button"
              onClick={onCancelExam}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
              title="Keluar dari Ujian"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPreview ? 'Keluar Pratinjau' : 'Keluar'}</span>
            </button>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Selesai Ujian</span>
          </button>
        </div>
      </header>

      {/* MAIN EXAM BODY */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* MODE 1: EMBED GOOGLE DRIVE PDF SPLIT-SCREEN VIEW */}
        {exam.mode === 'EMBED_DRIVE_PDF' ? (
          <>
            {/* Left Column: Embed PDF Drive Document */}
            <div className={`lg:col-span-7 flex flex-col h-full relative border-r ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            } ${isPdfExpanded ? 'fixed inset-0 z-40' : ''}`}>
              <div className={`px-3 sm:px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold flex items-center gap-1.5 text-blue-600">
                    <FileText className="w-4 h-4" /> Dokumen Naskah Soal PDF
                  </span>
                  <span className={`hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    Split-Screen LJK
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseDocsViewerFallback(!useDocsViewerFallback)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all flex items-center gap-1 ${
                      useDocsViewerFallback
                        ? isDark ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'
                        : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{useDocsViewerFallback ? 'Docs Viewer' : 'Native Drive'}</span>
                  </button>

                  <a
                    href={getGoogleDriveDirectViewUrl(exam.pdfDriveUrl || 'https://drive.google.com/file/d/1Bzx7tT3i82xR1y9O0-G6kQ1h7U63N_f2/view')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                    <span className="hidden md:inline">Buka di Tab Baru</span>
                    <span className="md:hidden">Tab Baru</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsPdfExpanded(!isPdfExpanded)}
                    className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isPdfExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span>{isPdfExpanded ? 'Kecilkan' : 'Perbesar'}</span>
                  </button>
                </div>
              </div>

              {/* PDF Frame Container */}
              <div className="flex-1 w-full h-full bg-slate-900 relative">
                <iframe
                  src={formatGoogleDriveEmbedUrl(
                    exam.pdfDriveUrl || 'https://drive.google.com/file/d/1Bzx7tT3i82xR1y9O0-G6kQ1h7U63N_f2/preview',
                    useDocsViewerFallback
                  )}
                  title="Naskah Soal PDF Ujian"
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              </div>
            </div>

            {/* Right Column: LJK Digital Auto-Generated Answer Sheet */}
            <div className={`lg:col-span-5 flex flex-col h-full overflow-hidden ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}>
              <div className={`px-4 py-3 border-b flex flex-col gap-2.5 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    <ListOrdered className="w-4 h-4" /> Lembar Jawaban Komputer (LJK Digital)
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Terjawab:</span>
                    <strong className="text-emerald-600 font-bold">{answeredCount}/{totalQuestions}</strong>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                      {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* LJK Grid Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {exam.questions.map((q, idx) => {
                  const studentAns = answers[q.id]?.answer;
                  const isDoubtful = answers[q.id]?.isDoubtful || false;
                  const hasAnswer = studentAns !== undefined && studentAns !== '' && (!Array.isArray(studentAns) || studentAns.length > 0) && (typeof studentAns !== 'object' || Object.keys(studentAns).length > 0);
                  const optionsToRender = q.options && q.options.length > 0 ? q.options.map(o => o.key) : ['A', 'B', 'C', 'D', 'E'];

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-3 rounded-xl border transition-all ${
                        isDoubtful
                          ? isDark ? 'bg-amber-950/40 border-amber-500/50' : 'bg-amber-50 border-amber-300'
                          : hasAnswer
                          ? isDark ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-300'
                          : isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-bold text-xs flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                            hasAnswer
                              ? 'bg-emerald-600 text-white'
                              : isDark ? 'bg-slate-800 text-blue-400' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Nomor {idx + 1}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResetAnswer(q.id)}
                            disabled={!hasAnswer && !isDoubtful}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                              hasAnswer || isDoubtful
                                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                                : 'opacity-30 cursor-not-allowed border-transparent text-slate-400'
                            }`}
                            title="Reset Jawaban"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDoubtful(q.id)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                              isDoubtful
                                ? 'bg-amber-500 text-white border-amber-500'
                                : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isDoubtful ? '★ Ragu' : 'Ragu?'}
                          </button>
                        </div>
                      </div>

                      {/* Options / Answer Input per Question Type */}
                      {q.questionType === 'TRUE_FALSE' ? (
                        q.statements && q.statements.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {q.statements.map((stmt, sIdx) => {
                              const currentAnsObj = answers[q.id]?.answer;
                              const studentVal = (typeof currentAnsObj === 'object' && !Array.isArray(currentAnsObj) && currentAnsObj !== null)
                                ? (currentAnsObj as Record<string, 'TRUE' | 'FALSE'>)[stmt.id]
                                : undefined;

                              return (
                                <div key={stmt.id || sIdx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px]">
                                  <span className="truncate flex-1 font-medium text-slate-700 dark:text-slate-300">
                                    <strong className="text-blue-600 dark:text-blue-400 mr-1">{sIdx + 1}.</strong>
                                    {stmt.text}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectTrueFalseStatement(q.id, stmt.id, 'TRUE')}
                                      className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                                        studentVal === 'TRUE'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      B
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectTrueFalseStatement(q.id, stmt.id, 'FALSE')}
                                      className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                                        studentVal === 'FALSE'
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      S
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectOption(q.id, 'TRUE')}
                              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                studentAns === 'TRUE'
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                  : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              BENAR
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectOption(q.id, 'FALSE')}
                              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                studentAns === 'FALSE'
                                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                                  : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              SALAH
                            </button>
                          </div>
                        )
                      ) : q.questionType === 'ESSAY' ? (
                        <input
                          type="text"
                          value={typeof studentAns === 'string' ? studentAns : ''}
                          onChange={e => handleSelectOption(q.id, e.target.value)}
                          placeholder="Ketikkan jawaban..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {optionsToRender.map(opt => {
                            const isSelected = Array.isArray(studentAns)
                              ? studentAns.includes(opt)
                              : studentAns === opt;

                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectOption(q.id, opt, q.questionType === 'COMPLEX_CHOICE')}
                                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                                    : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* MODE 2: NATIVE CBT STANDARD (FULL-WIDTH QUESTION VIEW + SLEEK COMPACT QUESTION MATRIX) */
          <>
            {/* Left/Center Column: Full-Width Single Question View */}
            <div className={`lg:col-span-8 p-4 sm:p-6 lg:p-8 flex flex-col justify-between h-full overflow-y-auto custom-scrollbar border-r transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              
              {/* Full Width Question Card Container */}
              <div className="w-full space-y-5">
                
                {/* Question Info Header Bar */}
                <div className={`py-3 px-4 rounded-2xl border flex items-center justify-between gap-2.5 shadow-xs transition-colors ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="flex items-center gap-2">
                    {isCatMode ? (
                      <>
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-600 text-white shadow-xs border border-purple-500 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-200" /> CAT
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold border ${
                          currentQuestion.difficulty === 'mudah' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                          currentQuestion.difficulty === 'sedang' ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                          currentQuestion.difficulty === 'sulit' ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' :
                          'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                        }`}>
                          {currentQuestion.difficulty ? currentQuestion.difficulty.toUpperCase() : 'SEDANG'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-600 text-white shadow-xs border border-blue-500 flex items-center gap-1.5">
                          <span>Soal Nomor {activeQuestionIndex + 1}</span>
                          <span className="text-[10px] text-blue-200 font-normal">/ {totalQuestions}</span>
                        </span>

                        {/* Singkatan Type Soal: PG, PGK, S/B, Esay */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border transition-all ${
                            currentQuestion.questionType === 'SINGLE_CHOICE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                              : currentQuestion.questionType === 'COMPLEX_CHOICE'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                              : currentQuestion.questionType === 'TRUE_FALSE'
                              ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          }`}
                          title={
                            currentQuestion.questionType === 'SINGLE_CHOICE'
                              ? 'Tipe Soal: Pilihan Ganda (PG)'
                              : currentQuestion.questionType === 'COMPLEX_CHOICE'
                              ? 'Tipe Soal: Pilihan Ganda Kompleks (PGK)'
                              : currentQuestion.questionType === 'TRUE_FALSE'
                              ? 'Tipe Soal: Benar / Salah (S/B)'
                              : 'Tipe Soal: Essay (Esay)'
                          }
                        >
                          {currentQuestion.questionType === 'SINGLE_CHOICE'
                            ? 'PG'
                            : currentQuestion.questionType === 'COMPLEX_CHOICE'
                            ? 'PGK'
                            : currentQuestion.questionType === 'TRUE_FALSE'
                            ? 'S/B'
                            : 'Esay'}
                        </span>

                        {/* Subtest Badge */}
                        {(currentQuestion.subtestName || (exam.subtests && exam.subtests.length > 1)) && (
                          <span className="hidden sm:flex px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 items-center gap-1">
                            <Layers className="w-3 h-3 text-indigo-500" />
                            <span className="truncate max-w-[150px]">
                              {currentQuestion.subtestName || exam.subtests?.find(s => s.id === currentQuestion.subtestId)?.name || 'Subtes'}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Doubtful Toggle & Reset Controls (HANYA ICON SAJA) */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Tombol Hapus Jawaban - Icon Saja */}
                    <button
                      type="button"
                      onClick={() => handleResetAnswer(currentQuestion.id)}
                      disabled={!answers[currentQuestion.id]?.answer && !answers[currentQuestion.id]?.isDoubtful}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold border transition-all flex items-center justify-center cursor-pointer ${
                        answers[currentQuestion.id]?.answer || answers[currentQuestion.id]?.isDoubtful
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 shadow-xs active:scale-95'
                          : 'opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                      title="Hapus Jawaban (Kosongkan pilihan nomor ini)"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </button>

                    {/* Tombol Ragu-Ragu - Icon Saja */}
                    {!isCatMode && (
                      <button
                        type="button"
                        onClick={() => handleToggleDoubtful(currentQuestion.id)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold border transition-all flex items-center justify-center cursor-pointer ${
                          answers[currentQuestion.id]?.isDoubtful
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40 active:scale-95'
                            : isDark
                              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-700 active:scale-95'
                              : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 active:scale-95'
                        }`}
                        title={answers[currentQuestion.id]?.isDoubtful ? 'Ragu-ragu (Ditandai Aktif)' : 'Tandai Soal Ragu-ragu'}
                      >
                        <Flag className={`w-4 h-4 ${answers[currentQuestion.id]?.isDoubtful ? 'fill-current text-white' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Question Surface Box (Clean Premium Background & Typography) */}
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 transition-colors ${
                  isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200/90'
                }`}>
                  
                  {/* Question Stem Text */}
                  <div
                    className={`${questionFontSizeClass} ${isDark ? 'text-slate-100' : 'text-slate-900'} font-normal leading-relaxed ${
                      currentQuestion.textAlign === 'center' ? 'text-center' :
                      currentQuestion.textAlign === 'right' ? 'text-right' :
                      currentQuestion.textAlign === 'justify' ? 'text-justify' : 'text-left'
                    }`}
                    dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
                  />

                  {/* Question Image Attachment (if any) */}
                  {currentQuestion.imageUrl && (
                    <div className="relative group inline-block max-w-full">
                      <img
                        src={currentQuestion.imageUrl}
                        alt="Gambar Soal Ujian"
                        onClick={() => setZoomedImage(currentQuestion.imageUrl || null)}
                        className="max-h-72 sm:max-h-96 rounded-2xl object-contain border border-slate-200 dark:border-slate-700 shadow-sm cursor-zoom-in group-hover:opacity-95 transition-all bg-slate-50 dark:bg-slate-950 p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setZoomedImage(currentQuestion.imageUrl || null)}
                        className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-900/80 text-white rounded-lg text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 backdrop-blur-sm cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" /> Klik Perbesar
                      </button>
                    </div>
                  )}

                  {/* UNIFIED CBT ANSWER OPTIONS SECTION (GROUPED INTO A SINGLE CLEAN CONTAINER) */}
                  <div className="pt-1">
                    
                    {/* TYPE 1: SINGLE CHOICE (PILIHAN GANDA) - UNIFIED GROUP CARD WITH COMPACT SPACING & EMPTY FILTER */}
                    {currentQuestion.questionType === 'SINGLE_CHOICE' && currentQuestion.options && (() => {
                      // Filter out empty options so unfilled options won't display
                      const isOptionFilled = (opt: { key: string; text?: string; imageUrl?: string }) => {
                        const rawText = (opt.text || '').replace(/<[^>]*>?/gm, '').trim();
                        const hasImage = Boolean(opt.imageUrl && opt.imageUrl.trim().length > 0);
                        return rawText.length > 0 || hasImage;
                      };

                      const validOptions = currentQuestion.options.filter(isOptionFilled);
                      const displayOptions = validOptions.length > 0 ? validOptions : currentQuestion.options;

                      return (
                        <div className={`rounded-2xl border overflow-hidden divide-y shadow-xs transition-colors ${
                          isDark ? 'border-slate-800 bg-slate-950/60 divide-slate-800/70' : 'border-slate-200 bg-white divide-slate-200/70'
                        }`}>
                          {displayOptions.map(opt => {
                            const isSelected = answers[currentQuestion.id]?.answer === opt.key;
                            const isCorrectInPreview = showAnswerKeyInPreview && opt.key === currentQuestion.correctAnswer;

                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                                className={`w-full text-left py-2.5 px-3.5 sm:py-3 sm:px-4 transition-all flex items-start gap-3 cursor-pointer relative group ${
                                  isCorrectInPreview
                                    ? isDark
                                      ? 'bg-emerald-950/70 text-emerald-200 ring-1 ring-inset ring-emerald-500/50'
                                      : 'bg-emerald-50/90 text-emerald-950 ring-1 ring-inset ring-emerald-400'
                                    : isSelected
                                    ? isDark
                                      ? 'bg-blue-950/70 text-white ring-1 ring-inset ring-blue-500/60'
                                      : 'bg-blue-50/90 text-slate-950 ring-1 ring-inset ring-blue-400'
                                    : isDark
                                    ? 'hover:bg-slate-800/50 text-slate-300'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {/* Active Left Indicator Bar */}
                                {(isSelected || isCorrectInPreview) && (
                                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                    isCorrectInPreview ? 'bg-emerald-500' : 'bg-blue-600'
                                  }`} />
                                )}

                                {/* Option Letter Badge (A, B, C, D, E) */}
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                                  isCorrectInPreview
                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs ring-2 ring-emerald-400/40'
                                    : isSelected
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-xs ring-2 ring-blue-400/40'
                                    : isDark
                                    ? 'bg-slate-800 border-slate-700 text-slate-300 group-hover:border-slate-600 group-hover:text-white'
                                    : 'bg-slate-100 border-slate-300 text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-900 shadow-2xs'
                                }`}>
                                  {opt.key}
                                </div>

                                {/* Option Text & Optional Image */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                  {opt.text && (
                                    <div
                                      className={`${optionFontSizeClass} font-normal leading-relaxed ${
                                        isSelected
                                          ? isDark ? 'text-white font-medium' : 'text-slate-950 font-semibold'
                                          : isDark ? 'text-slate-200' : 'text-slate-800'
                                      }`}
                                      dangerouslySetInnerHTML={{ __html: opt.text }}
                                    />
                                  )}

                                  {opt.imageUrl && (
                                    <div className="mt-2">
                                      <img
                                        src={opt.imageUrl}
                                        alt={`Gambar Opsi ${opt.key}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setZoomedImage(opt.imageUrl || null);
                                        }}
                                        className="max-h-36 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-xs"
                                      />
                                    </div>
                                  )}

                                  {isCorrectInPreview && (
                                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Kunci Jawaban Benar
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* TYPE 2: COMPLEX MULTI-SELECT (PILIHAN GANDA KOMPLEKS) - UNIFIED GROUP CARD */}
                    {currentQuestion.questionType === 'COMPLEX_CHOICE' && currentQuestion.options && (() => {
                      const isOptionFilled = (opt: { key: string; text?: string; imageUrl?: string }) => {
                        const rawText = (opt.text || '').replace(/<[^>]*>?/gm, '').trim();
                        const hasImage = Boolean(opt.imageUrl && opt.imageUrl.trim().length > 0);
                        return rawText.length > 0 || hasImage;
                      };

                      const validOptions = currentQuestion.options.filter(isOptionFilled);
                      const displayOptions = validOptions.length > 0 ? validOptions : currentQuestion.options;

                      return (
                        <div className="space-y-2.5">
                          <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                            isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>Petunjuk: Anda dapat memilih lebih dari satu jawaban yang dianggap benar.</span>
                          </div>

                          <div className={`rounded-2xl border overflow-hidden divide-y shadow-xs transition-colors ${
                            isDark ? 'border-slate-800 bg-slate-950/60 divide-slate-800/70' : 'border-slate-200 bg-white divide-slate-200/70'
                          }`}>
                            {displayOptions.map(opt => {
                              const currentAnsList = Array.isArray(answers[currentQuestion.id]?.answer)
                                ? (answers[currentQuestion.id]?.answer as string[])
                                : [];
                              const isChecked = currentAnsList.includes(opt.key);
                              const isCorrectInPreview = showAnswerKeyInPreview && (
                                Array.isArray(currentQuestion.correctAnswer)
                                  ? currentQuestion.correctAnswer.includes(opt.key)
                                  : currentQuestion.correctAnswer === opt.key
                              );

                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => handleSelectOption(currentQuestion.id, opt.key, true)}
                                  className={`w-full text-left py-2.5 px-3.5 sm:py-3 sm:px-4 transition-all flex items-start gap-3 cursor-pointer relative group ${
                                    isCorrectInPreview
                                      ? isDark
                                        ? 'bg-emerald-950/70 text-emerald-200 ring-1 ring-inset ring-emerald-500/50'
                                        : 'bg-emerald-50/90 text-emerald-950 ring-1 ring-inset ring-emerald-400'
                                      : isChecked
                                      ? isDark
                                        ? 'bg-indigo-950/70 text-white ring-1 ring-inset ring-indigo-500/60'
                                        : 'bg-indigo-50/90 text-slate-950 ring-1 ring-inset ring-indigo-400'
                                      : isDark
                                      ? 'hover:bg-slate-800/50 text-slate-300'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  {/* Active Left Indicator Bar */}
                                  {(isChecked || isCorrectInPreview) && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                      isCorrectInPreview ? 'bg-emerald-500' : 'bg-indigo-600'
                                    }`} />
                                  )}

                                  {/* Checkbox Icon Indicator */}
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                    isChecked
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                      : isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                                  }`}>
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>

                                  {/* Option Badge */}
                                  <span className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                                    isChecked
                                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700'
                                      : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'
                                  }`}>
                                    {opt.key}
                                  </span>

                                  {/* Text & Image */}
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    {opt.text && (
                                      <div
                                        className={`${optionFontSizeClass} font-normal leading-relaxed ${
                                          isChecked
                                            ? isDark ? 'text-white font-medium' : 'text-slate-950 font-semibold'
                                            : isDark ? 'text-slate-200' : 'text-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: opt.text }}
                                      />
                                    )}

                                    {opt.imageUrl && (
                                      <div className="mt-2">
                                        <img
                                          src={opt.imageUrl}
                                          alt={`Gambar Opsi ${opt.key}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setZoomedImage(opt.imageUrl || null);
                                          }}
                                          className="max-h-36 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-xs"
                                        />
                                      </div>
                                    )}

                                    {isCorrectInPreview && (
                                      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Kunci Jawaban Benar
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* TYPE 3: TRUE / FALSE TABLE STATEMENTS */}
                    {currentQuestion.questionType === 'TRUE_FALSE' && (
                      currentQuestion.statements && currentQuestion.statements.length > 0 ? (
                        <div className="space-y-3 pt-2">
                          <p className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                            <Info className="w-4 h-4" />
                            Pilihlah Benar atau Salah untuk setiap pernyataan pada tabel berikut:
                          </p>

                          <div className={`overflow-x-auto rounded-2xl border shadow-sm ${
                            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
                          }`}>
                            <table className="w-full text-left text-xs sm:text-sm border-collapse">
                              <thead>
                                <tr className={`border-b font-extrabold ${
                                  isDark ? 'bg-slate-900 text-blue-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}>
                                  <th className="p-3.5 w-12 text-center">#</th>
                                  <th className="p-3.5">Pernyataan</th>
                                  <th className="p-3.5 w-28 text-center">BENAR</th>
                                  <th className="p-3.5 w-28 text-center">SALAH</th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                                {currentQuestion.statements.map((stmt, sIdx) => {
                                  const currentAnsObj = answers[currentQuestion.id]?.answer;
                                  const studentVal = (typeof currentAnsObj === 'object' && !Array.isArray(currentAnsObj) && currentAnsObj !== null)
                                    ? (currentAnsObj as Record<string, 'TRUE' | 'FALSE'>)[stmt.id]
                                    : undefined;

                                  return (
                                    <tr key={stmt.id || sIdx} className={isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50/70'}>
                                      <td className={`p-3.5 text-center font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {sIdx + 1}
                                      </td>
                                      <td className={`p-3.5 font-normal leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {stmt.text}
                                        {showAnswerKeyInPreview && (
                                          <span className="block text-[11px] font-bold text-emerald-600 mt-1">
                                            Kunci: {stmt.correctAnswer === 'TRUE' ? 'BENAR' : 'SALAH'}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleSelectTrueFalseStatement(currentQuestion.id, stmt.id, 'TRUE')}
                                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                                            studentVal === 'TRUE'
                                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                                              : isDark
                                              ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                                              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                                          }`}
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                                        </button>
                                      </td>
                                      <td className="p-3.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleSelectTrueFalseStatement(currentQuestion.id, stmt.id, 'FALSE')}
                                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                                            studentVal === 'FALSE'
                                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                                              : isDark
                                              ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                                              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-800'
                                          }`}
                                        >
                                          <X className="w-3.5 h-3.5" /> Salah
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(currentQuestion.id, 'TRUE')}
                            className={`p-5 rounded-2xl border font-bold text-base transition-all flex items-center justify-center gap-2 ${
                              answers[currentQuestion.id]?.answer === 'TRUE'
                                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                                : isDark
                                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" /> BENAR
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectOption(currentQuestion.id, 'FALSE')}
                            className={`p-5 rounded-2xl border font-bold text-base transition-all flex items-center justify-center gap-2 ${
                              answers[currentQuestion.id]?.answer === 'FALSE'
                                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                                : isDark
                                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-800'
                            }`}
                          >
                            <X className="w-5 h-5" /> SALAH
                          </button>
                        </div>
                      )
                    )}

                    {/* TYPE 4: ESSAY / ISIAN SINGKAT */}
                    {currentQuestion.questionType === 'ESSAY' && (
                      <div className="space-y-3 pt-2">
                        <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Tuliskan Jawaban Anda secara jelas dan lengkap pada kolom di bawah ini:
                        </label>
                        <textarea
                          rows={5}
                          value={(answers[currentQuestion.id]?.answer as string) || ''}
                          onChange={e => handleSelectOption(currentQuestion.id, e.target.value)}
                          placeholder="Ketikkan uraian jawaban essay Anda di sini..."
                          className={`w-full border rounded-2xl p-4 text-sm font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-xs ${
                            isDark
                              ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                        {showAnswerKeyInPreview && currentQuestion.correctAnswer && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                            <strong>Kunci/Pedoman Jawaban:</strong> {String(currentQuestion.correctAnswer)}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Pembahasan / Discussion Box (if enabled in preview) */}
                  {showAnswerKeyInPreview && currentQuestion.explanation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold text-blue-800">
                        <BookOpen className="w-4 h-4" /> Pembahasan Soal:
                      </div>
                      <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }} />
                    </div>
                  )}

                </div>

              </div>

              {/* Bottom Sticky Action Bar: Prev, Subtest Indicator, Next, Finish */}
              <div className={`flex flex-wrap items-center justify-between gap-3 border-t pt-4 mt-6 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                {!isCatMode ? (
                  <button
                    type="button"
                    disabled={activeQuestionIndex === 0}
                    onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                      activeQuestionIndex === 0
                        ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
                  </button>
                ) : (
                  <div className="text-xs text-purple-600 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> CAT: Navigasi Satu Arah
                  </div>
                )}

                {/* Subtest Quick Switcher / Indicator for Multi-Subtest Exam */}
                {!isCatMode && questionGroups.length > 1 && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-xs">
                    <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-[11px]">
                      {activeQuestionGroup.code || `ST`}:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
                      {activeQuestionGroup.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Subtes {questionGroups.findIndex(g => g.id === activeQuestionGroup.id) + 1}/{questionGroups.length})
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>
                      {activeQuestionIndex >= totalQuestions - 1 ? 'Selesai & Kumpulkan' : 'Soal Selanjutnya'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Question Number Matrix (Nomor Togel Soal Terpisah Berdasarkan Subtes) */}
            <div className={`lg:col-span-4 p-4 sm:p-6 flex flex-col justify-between h-full overflow-y-auto border-l transition-colors custom-scrollbar ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              {isCatMode ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-5 rounded-2xl space-y-4 shadow-sm text-slate-800">
                    <div className="flex items-center gap-2 text-purple-800 border-b border-purple-200 pb-3">
                      <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                      <h3 className="font-extrabold text-sm">Sistem Computer Adaptive Test (CAT)</h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Progress Pengerjaan:</span>
                        <strong className="text-purple-800 font-bold">{answeredCount} / {totalQuestions} Soal</strong>
                      </div>

                      <div className="w-full bg-purple-200/70 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full transition-all duration-300"
                          style={{ width: `${Math.round((answeredCount / totalQuestions) * 100)}%` }}
                        />
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-purple-100 text-[11px] text-slate-700 leading-relaxed space-y-1">
                        <p className="font-bold text-purple-900">⚡ Aturan Ujian CAT:</p>
                        <p>• Nomor soal disembunyikan sesuai kaidah CAT.</p>
                        <p>• Tingkat kesulitan soal berikutnya ditentukan secara otomatis dari ketepatan jawaban Anda.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Matrix Header & Progress */}
                  <div className="space-y-2.5 border-b pb-3.5 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-extrabold text-xs sm:text-sm flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <ListOrdered className="w-4 h-4 text-blue-600" />
                        <span>Daftar Nomor Soal</span>
                      </h3>

                      <span className="text-xs font-bold text-emerald-600">
                        {answeredCount}/{totalQuestions} Terjawab
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Subtest Group Filter Tabs (when exam has multiple subtest groups) */}
                    {questionGroups.length > 1 && (
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-indigo-400" /> Kelompok Subtes:
                          </span>
                          <span className="font-mono">{questionGroups.length} Subtes</span>
                        </div>

                        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                          <button
                            type="button"
                            onClick={() => setSelectedSubtestFilter('ALL')}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                              selectedSubtestFilter === 'ALL'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : isDark
                                ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            Semua Subtes ({totalQuestions})
                          </button>

                          {questionGroups.map((grp, gIdx) => {
                            const isSelected = selectedSubtestFilter === grp.id;
                            const isCurrentActive = grp.items.some(it => it.idx === activeQuestionIndex);
                            const grpAnswered = grp.items.filter(it => {
                              const ans = answers[it.q.id]?.answer;
                              return ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0) && (typeof ans !== 'object' || Object.keys(ans).length > 0);
                            }).length;

                            return (
                              <button
                                key={grp.id}
                                type="button"
                                onClick={() => setSelectedSubtestFilter(grp.id)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : isCurrentActive
                                    ? isDark
                                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/80'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : isDark
                                    ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                                title={grp.name}
                              >
                                <span>{grp.code || `ST${gIdx + 1}`}</span>
                                <span className="opacity-75 font-mono text-[9px]">({grpAnswered}/{grp.items.length})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Filter Tabs for Question Status */}
                    <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                      {(['ALL', 'UNANSWERED', 'DOUBTFUL', 'ANSWERED'] as const).map(flt => (
                        <button
                          key={flt}
                          type="button"
                          onClick={() => setMatrixFilter(flt)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                            matrixFilter === flt
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {flt === 'ALL' ? `Semua (${totalQuestions})` :
                           flt === 'UNANSWERED' ? `Belum (${remainingCount})` :
                           flt === 'DOUBTFUL' ? `Ragu (${doubtfulCount})` :
                           `Terjawab (${answeredCount})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Question Spotlight Banner */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold transition-colors ${
                    isDark ? 'bg-blue-950/60 border-blue-800/80 text-blue-300' : 'bg-blue-50/90 border-blue-200 text-blue-800'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                      </span>
                      <div className="truncate">
                        <span>Nomor {activeQuestionIndex + 1}</span>
                        {questionGroups.length > 1 && (
                          <span className="font-normal opacity-80 ml-1.5 truncate">
                            • {activeQuestionGroup.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 shrink-0">
                      {currentQuestion.questionType === 'SINGLE_CHOICE' ? 'PG' :
                       currentQuestion.questionType === 'COMPLEX_CHOICE' ? 'PGK' :
                       currentQuestion.questionType === 'TRUE_FALSE' ? 'B/S' : 'Essay'}
                    </span>
                  </div>

                  {/* Status Legend */}
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300 dark:ring-blue-800 shrink-0" />
                      <span>Disorot (Aktif)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Terjawab</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Ragu-ragu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <span>Belum</span>
                    </div>
                  </div>

                  {/* NOMOR TOGEL SOAL: TERPISAH BERDASARKAN KELOMPOK SUBTES */}
                  <div className="space-y-3.5 pt-1">
                    {(selectedSubtestFilter === 'ALL' ? questionGroups : questionGroups.filter(g => g.id === selectedSubtestFilter)).map((group, gIdx) => {
                      // Filter items in this group by matrixFilter
                      const groupFilteredItems = group.items.filter(({ q }) => {
                        const ans = answers[q.id];
                        const isAnswered = ans?.answer !== undefined && ans?.answer !== '' && (!Array.isArray(ans.answer) || ans.answer.length > 0) && (typeof ans.answer !== 'object' || Object.keys(ans.answer).length > 0);
                        const isDoubtful = ans?.isDoubtful || false;

                        if (matrixFilter === 'ANSWERED') return isAnswered && !isDoubtful;
                        if (matrixFilter === 'DOUBTFUL') return isDoubtful;
                        if (matrixFilter === 'UNANSWERED') return !isAnswered && !isDoubtful;
                        return true;
                      });

                      const groupAnsweredCount = group.items.filter(({ q }) => {
                        const ans = answers[q.id]?.answer;
                        return ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0) && (typeof ans !== 'object' || Object.keys(ans).length > 0);
                      }).length;

                      const isCurrentGroup = group.items.some(({ idx }) => idx === activeQuestionIndex);
                      const isGroupComplete = groupAnsweredCount === group.items.length && group.items.length > 0;

                      return (
                        <div
                          key={group.id}
                          className={`rounded-2xl border p-3 space-y-2.5 transition-all ${
                            questionGroups.length > 1
                              ? isCurrentGroup
                                ? isDark
                                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                                  : 'bg-indigo-50/50 border-indigo-300 shadow-sm'
                                : isDark
                                ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                                : 'bg-white border-slate-200'
                              : isDark
                              ? 'bg-transparent border-0 p-0'
                              : 'bg-transparent border-0 p-0'
                          }`}
                        >
                          {/* Group Header (Only shown when multiple subtest groups exist) */}
                          {questionGroups.length > 1 && (
                            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-7 h-7 rounded-xl text-xs font-black font-mono flex items-center justify-center shrink-0 border ${
                                  isCurrentGroup
                                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                                    : isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                }`}>
                                  {group.code || `S${gIdx + 1}`}
                                </span>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-extrabold truncate ${
                                    isCurrentGroup
                                      ? isDark ? 'text-indigo-200' : 'text-indigo-950'
                                      : isDark ? 'text-slate-200' : 'text-slate-800'
                                  }`}>
                                    {group.name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <span>{group.items.length} Soal (No. {group.items[0]?.idx + 1} - {group.items[group.items.length - 1]?.idx + 1})</span>
                                    {group.durationMinutes && (
                                      <span>• {group.durationMinutes} mnt</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                                  isGroupComplete
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                                    : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {isGroupComplete && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                  <span>{groupAnsweredCount}/{group.items.length}</span>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Number Toggle Grid for this Subtest */}
                          {groupFilteredItems.length === 0 ? (
                            <div className="py-2 text-center text-slate-500 text-[11px] italic">
                              Tidak ada nomor soal pada filter ini.
                            </div>
                          ) : (
                            <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-1.5 pt-0.5">
                              {groupFilteredItems.map(({ q, idx }) => {
                                const ans = answers[q.id];
                                const isAnswered = ans?.answer !== undefined && ans?.answer !== '' && (!Array.isArray(ans.answer) || ans.answer.length > 0) && (typeof ans.answer !== 'object' || Object.keys(ans.answer).length > 0);
                                const isDoubtful = ans?.isDoubtful || false;
                                const isActive = activeQuestionIndex === idx;

                                return (
                                  <button
                                    key={q.id || idx}
                                    type="button"
                                    onClick={() => setActiveQuestionIndex(idx)}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono text-[11px] sm:text-xs transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                                      isActive
                                        ? isDoubtful
                                          ? 'bg-amber-500 text-white ring-4 ring-amber-400/80 border-2 border-white dark:border-amber-200 scale-110 shadow-lg shadow-amber-500/40 font-black z-20'
                                          : isAnswered
                                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/80 border-2 border-white dark:border-emerald-200 scale-110 shadow-lg shadow-emerald-600/40 font-black z-20'
                                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-4 ring-blue-400/80 border-2 border-white dark:border-blue-200 scale-110 shadow-lg shadow-blue-600/40 font-black z-20'
                                        : isDoubtful
                                        ? 'bg-amber-500 text-white shadow-xs border border-amber-600 font-bold'
                                        : isAnswered
                                        ? 'bg-emerald-600 text-white shadow-xs border border-emerald-700 font-bold'
                                        : isDark
                                        ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 font-medium'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs font-medium'
                                    }`}
                                    title={`Soal No. ${idx + 1} - ${group.name} (${isActive ? 'Sedang Ditampilkan' : isDoubtful ? 'Ragu-ragu' : isAnswered ? 'Terjawab' : 'Belum Terjawab'})`}
                                  >
                                    {/* Active Pulsing Indicator Badge */}
                                    {isActive && (
                                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 ring-1 ring-white"></span>
                                      </span>
                                    )}

                                    <span>{idx + 1}</span>
                                    {/* Mini chosen option preview if single choice */}
                                    {isAnswered && !Array.isArray(ans?.answer) && typeof ans?.answer === 'string' && ans.answer.length <= 2 && (
                                      <span className="text-[8px] leading-none opacity-90 -mt-0.5 font-bold">
                                        {ans.answer}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Card below Matrix */}
                  <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between text-slate-500">
                      <span>Total Soal:</span>
                      <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalQuestions}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Sudah Dijawab:</span>
                      <strong>{answeredCount}</strong>
                    </div>
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>Ragu-ragu:</span>
                      <strong>{doubtfulCount}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Belum Dijawab:</span>
                      <strong className="text-rose-600">{remainingCount}</strong>
                    </div>
                  </div>

                </div>
              )}

              {/* Submit trigger button at bottom of matrix sidebar */}
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Selesaikan & Kumpulkan Ujian
              </button>
            </div>
          </>
        )}

      </div>

      {/* MOBILE QUESTION LIST DRAWER / MODAL (FOR NON-CAT MULTI-SUBTEST EXAMS) */}
      {isMobileQuestionListOpen && !isCatMode && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className={`w-full max-w-sm h-full flex flex-col p-5 overflow-y-auto shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm">Navigasi Nomor Soal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileQuestionListOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-4 overflow-y-auto custom-scrollbar">
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress:</span>
                  <strong className="text-emerald-600 font-bold">{answeredCount}/{totalQuestions} Terjawab</strong>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Subtest Groups list in Mobile Drawer */}
              <div className="space-y-3">
                {questionGroups.map((group, gIdx) => {
                  const groupAnsweredCount = group.items.filter(({ q }) => {
                    const ans = answers[q.id]?.answer;
                    return ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0) && (typeof ans !== 'object' || Object.keys(ans).length > 0);
                  }).length;
                  const isCurrentGroup = group.items.some(({ idx }) => idx === activeQuestionIndex);
                  const isGroupComplete = groupAnsweredCount === group.items.length && group.items.length > 0;

                  return (
                    <div
                      key={group.id}
                      className={`rounded-2xl border p-3 space-y-2.5 ${
                        isCurrentGroup
                          ? isDark
                            ? 'bg-slate-900/90 border-indigo-500/50 ring-1 ring-indigo-500/30'
                            : 'bg-indigo-50/50 border-indigo-300'
                          : isDark
                          ? 'bg-slate-950/60 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-6 h-6 rounded-lg text-xs font-black font-mono flex items-center justify-center shrink-0 border ${
                            isCurrentGroup
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}>
                            {group.code || `S${gIdx + 1}`}
                          </span>
                          <div className="min-w-0">
                            <h4 className={`text-xs font-extrabold truncate ${
                              isCurrentGroup ? (isDark ? 'text-indigo-200' : 'text-indigo-950') : (isDark ? 'text-slate-200' : 'text-slate-800')
                            }`}>
                              {group.name}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              No. {group.items[0]?.idx + 1} - {group.items[group.items.length - 1]?.idx + 1}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          isGroupComplete
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                            : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isGroupComplete && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          <span>{groupAnsweredCount}/{group.items.length}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                        {group.items.map(({ q, idx }) => {
                          const ans = answers[q.id];
                          const isAnswered = ans?.answer !== undefined && ans?.answer !== '' && (!Array.isArray(ans.answer) || ans.answer.length > 0) && (typeof ans.answer !== 'object' || Object.keys(ans.answer).length > 0);
                          const isDoubtful = ans?.isDoubtful || false;
                          const isActive = activeQuestionIndex === idx;

                          return (
                            <button
                              key={q.id || idx}
                              type="button"
                              onClick={() => {
                                setActiveQuestionIndex(idx);
                                setIsMobileQuestionListOpen(false);
                              }}
                              className={`w-9 h-9 rounded-xl font-mono text-xs transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                                isActive
                                  ? isDoubtful
                                    ? 'bg-amber-500 text-white ring-4 ring-amber-400/80 border-2 border-white font-black'
                                    : isAnswered
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/80 border-2 border-white font-black'
                                    : 'bg-blue-600 text-white ring-4 ring-blue-400/80 border-2 border-white font-black'
                                  : isDoubtful
                                  ? 'bg-amber-500 text-white border border-amber-600 font-bold'
                                  : isAnswered
                                  ? 'bg-emerald-600 text-white border border-emerald-700 font-bold'
                                  : isDark
                                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 font-medium'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200 font-medium'
                              }`}
                            >
                              <span>{idx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileQuestionListOpen(false);
                setIsSubmitModalOpen(true);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 mt-3"
            >
              <Send className="w-4 h-4" /> Selesaikan & Kumpulkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* POP-UP MODAL SUBMIT CONFIRMATION */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl text-center relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-sm">
              <Send className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg sm:text-xl">Konfirmasi Pengumpulan Ujian</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {remainingCount > 0
                  ? `Peringatan: Masih ada ${remainingCount} nomor soal yang belum Anda isi.`
                  : 'Semua soal telah terjawab dengan lengkap. Apakah Anda ingin mengumpulkan lembar ujian?'}
              </p>
            </div>

            {/* Answer Summary Card */}
            <div className={`grid grid-cols-3 gap-2 p-3.5 rounded-2xl border text-xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className="text-slate-400 text-[10px] font-bold">Terjawab</p>
                <p className="text-lg font-extrabold text-emerald-600">{answeredCount}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold">Ragu-ragu</p>
                <p className="text-lg font-extrabold text-amber-500">{doubtfulCount}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold">Belum Diisi</p>
                <p className="text-lg font-extrabold text-rose-600">{remainingCount}</p>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className={`w-1/2 py-3 font-bold rounded-xl text-xs transition-all border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Periksa Kembali
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
              >
                Ya, Kumpulkan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL ZOOM IMAGE */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-2 rounded-2xl shadow-2xl">
            <img
              src={zoomedImage}
              alt="Perbesaran Gambar Soal"
              className="max-h-[85vh] max-w-full object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
