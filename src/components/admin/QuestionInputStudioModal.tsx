import React, { useState, useEffect, useMemo } from 'react';
import { Exam, Question, QuestionType, QuestionDifficulty, QuestionOption, TrueFalseStatement, ExamSubtest } from '../../types';
import { CbtRichTextEditor } from '../common/CbtRichTextEditor';
import { ExamEngine } from '../exam/ExamEngine';
import { formatGoogleDriveEmbedUrl, getGoogleDriveDirectViewUrl } from '../../utils/drive';
import { DEFAULT_IRT_DIFFICULTY_PARAMS, getSubtestsFromExam } from '../../utils/irtScoring';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
  ListOrdered,
  Layers,
  Save,
  HelpCircle,
  AlertCircle,
  FileCheck2,
  Sliders,
  CheckSquare,
  BookOpen,
  RotateCcw,
  Square,
  CheckSquare2,
  CheckCheck,
  Info,
  Calculator,
  MoveRight
} from 'lucide-react';

interface QuestionInputStudioModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSaveExamQuestions: (updatedExam: Exam) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const QuestionInputStudioModal: React.FC<QuestionInputStudioModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSaveExamQuestions,
  onShowToast
}) => {
  if (!isOpen) return null;

  // Subtests available in this exam package
  const subtests: ExamSubtest[] = useMemo(() => getSubtestsFromExam(exam), [exam]);

  // Local state for questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    const defaultSubtest = subtests[0] || { id: 'st-1', name: 'Subtes Utama', code: 'ST1' };
    if (exam.questions && exam.questions.length > 0) {
      return JSON.parse(JSON.stringify(exam.questions)).map((q: Question, idx: number) => {
        const matchingSt = subtests.find(s => s.id === q.subtestId);
        const assignedSt = matchingSt || defaultSubtest;
        const diff = q.difficulty || 'sedang';
        const irtPreset = DEFAULT_IRT_DIFFICULTY_PARAMS[diff] || DEFAULT_IRT_DIFFICULTY_PARAMS.sedang;
        return {
          ...q,
          subtestId: assignedSt.id,
          subtestName: assignedSt.name,
          irtDiscrimination: q.irtDiscrimination ?? irtPreset.a,
          irtDifficulty: q.irtDifficulty ?? irtPreset.b,
          irtGuessing: q.irtGuessing ?? irtPreset.c
        };
      });
    }
    // Default 1 question if empty
    return [
      {
        id: `q-${Date.now()}-1`,
        number: 1,
        text: 'Tuliskan naskah soal nomor 1 di sini...',
        questionType: 'SINGLE_CHOICE',
        subtestId: defaultSubtest.id,
        subtestName: defaultSubtest.name,
        options: [
          { key: 'A', text: 'Pilihan Jawaban A' },
          { key: 'B', text: 'Pilihan Jawaban B' },
          { key: 'C', text: 'Pilihan Jawaban C' },
          { key: 'D', text: 'Pilihan Jawaban D' },
          { key: 'E', text: 'Pilihan Jawaban E' }
        ],
        correctAnswer: 'A',
        weight: 1,
        difficulty: 'sedang',
        irtDiscrimination: 1.2,
        irtDifficulty: 0.0,
        irtGuessing: 0.05,
        discussion: ''
      }
    ];
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState<string>('ALL');
  const [targetBatchSubtestId, setTargetBatchSubtestId] = useState<string>('');
  const [bulkCount, setBulkCount] = useState<number>(exam.questions?.length || 10);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Deletion and Multi-Select Modal States
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false);
  const [showResetQuestionConfirm, setShowResetQuestionConfirm] = useState<boolean>(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState<boolean>(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Sync questions if exam changes
  useEffect(() => {
    if (exam.questions && exam.questions.length > 0) {
      setQuestions(JSON.parse(JSON.stringify(exam.questions)));
      setActiveQuestionIndex(0);
    }
  }, [exam.id]);

  // Current active question
  const currentQ = questions[activeQuestionIndex] || questions[0];

  // Handler to update a question field
  const updateQuestion = (index: number, updatedFields: Partial<Question>) => {
    setQuestions(prev => {
      const copy = [...prev];
      let q = { ...copy[index], ...updatedFields };

      if (updatedFields.questionType === 'TRUE_FALSE') {
        if (!q.statements || q.statements.length === 0) {
          q.statements = [
            { id: `stmt-${Date.now()}-1`, text: 'Pernyataan 1: (Tuliskan pernyataan pertama)', correctAnswer: 'TRUE', weight: 1 },
            { id: `stmt-${Date.now()}-2`, text: 'Pernyataan 2: (Tuliskan pernyataan kedua)', correctAnswer: 'FALSE', weight: 1 }
          ];
        } else {
          q.statements = q.statements.map(s => ({
            ...s,
            weight: s.weight !== undefined ? Number(s.weight) || 1 : 1
          }));
        }
        const totalWeight = q.statements.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);
        q.weight = totalWeight > 0 ? totalWeight : 1;
      }

      copy[index] = q;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  // Option management functions (Default A-D, dynamic E, F...)
  const handleAddOption = (questionIdx: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      const targetQ = { ...copy[questionIdx] };
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const currentOpts = targetQ.options && targetQ.options.length > 0
        ? [...targetQ.options]
        : [
            { key: 'A', text: '', imageUrl: '' },
            { key: 'B', text: '', imageUrl: '' },
            { key: 'C', text: '', imageUrl: '' },
            { key: 'D', text: '', imageUrl: '' }
          ];

      if (currentOpts.length >= 10) return prev; // max 10 options

      const nextLetter = alphabet[currentOpts.length] || 'E';
      currentOpts.push({
        key: nextLetter,
        text: '',
        imageUrl: ''
      });

      targetQ.options = currentOpts;
      copy[questionIdx] = targetQ;
      return copy;
    });
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast('Opsi pilihan jawaban baru berhasil ditambahkan.', 'info');
  };

  const handleRemoveOption = (questionIdx: number, optionKey: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const targetQ = { ...copy[questionIdx] };
      const currentOpts = targetQ.options ? [...targetQ.options] : [];
      if (currentOpts.length <= 2) {
        return prev;
      }

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const filtered = currentOpts.filter(o => o.key !== optionKey);

      // Re-assign keys so they stay sequential A, B, C, D...
      const reIndexed = filtered.map((o, idx) => ({
        ...o,
        key: alphabet[idx]
      }));

      // Adjust correctAnswer if needed
      if (targetQ.questionType === 'SINGLE_CHOICE') {
        const stillExists = reIndexed.some(o => o.key === targetQ.correctAnswer);
        if (!stillExists) {
          targetQ.correctAnswer = reIndexed[0]?.key || 'A';
        }
      } else if (targetQ.questionType === 'COMPLEX_CHOICE') {
        const arr = Array.isArray(targetQ.correctAnswer) ? targetQ.correctAnswer : [String(targetQ.correctAnswer)];
        const validKeys = reIndexed.map(o => o.key);
        const filteredAns = arr.filter(k => validKeys.includes(k));
        targetQ.correctAnswer = filteredAns.length > 0 ? filteredAns : [reIndexed[0]?.key || 'A'];
      }

      targetQ.options = reIndexed;
      copy[questionIdx] = targetQ;
      return copy;
    });
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Opsi ${optionKey} berhasil dihapus.`, 'info');
  };

  // Handler to update option text or image
  const updateQuestionOption = (questionIdx: number, optionKey: string, field: 'text' | 'imageUrl', val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const targetQ = { ...copy[questionIdx] };
      const opts = targetQ.options && targetQ.options.length > 0 ? [...targetQ.options] : [
        { key: 'A', text: '', imageUrl: '' },
        { key: 'B', text: '', imageUrl: '' },
        { key: 'C', text: '', imageUrl: '' },
        { key: 'D', text: '', imageUrl: '' }
      ];

      const optIdx = opts.findIndex(o => o.key === optionKey);
      if (optIdx >= 0) {
        opts[optIdx] = { ...opts[optIdx], [field]: val };
      } else {
        opts.push({ key: optionKey, text: field === 'text' ? val : '', imageUrl: field === 'imageUrl' ? val : '' });
      }

      targetQ.options = opts;
      copy[questionIdx] = targetQ;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  // True/False statement functions
  const handleAddStatement = (questionIdx: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      const targetQ = { ...copy[questionIdx] };
      const stmts = targetQ.statements ? [...targetQ.statements] : [];
      stmts.push({
        id: `stmt-${Date.now()}-${stmts.length + 1}`,
        text: `Pernyataan ${stmts.length + 1}`,
        correctAnswer: 'TRUE',
        weight: 1
      });
      targetQ.statements = stmts;
      targetQ.weight = stmts.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);
      copy[questionIdx] = targetQ;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateStatement = (
    questionIdx: number,
    stmtIdx: number,
    field: 'text' | 'correctAnswer' | 'weight',
    val: any
  ) => {
    setQuestions(prev => {
      const copy = [...prev];
      const targetQ = { ...copy[questionIdx] };
      if (!targetQ.statements) return prev;
      const stmts = [...targetQ.statements];
      stmts[stmtIdx] = { ...stmts[stmtIdx], [field]: val };
      targetQ.statements = stmts;
      if (field === 'weight') {
        const total = stmts.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);
        targetQ.weight = total > 0 ? total : 1;
      }
      copy[questionIdx] = targetQ;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const handleRemoveStatement = (questionIdx: number, stmtIdx: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      const targetQ = { ...copy[questionIdx] };
      if (!targetQ.statements || targetQ.statements.length <= 1) return prev;
      const stmts = targetQ.statements.filter((_, i) => i !== stmtIdx);
      targetQ.statements = stmts;
      targetQ.weight = stmts.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);
      copy[questionIdx] = targetQ;
      return copy;
    });
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast('Baris pernyataan berhasil dihapus.', 'info');
  };

  // Add Question
  const handleAddQuestion = () => {
    const newNumber = questions.length + 1;
    const difficulties: QuestionDifficulty[] = ['mudah', 'sedang', 'sulit', 'hots'];
    const assignedDiff = difficulties[(newNumber - 1) % 4];
    const irtPreset = DEFAULT_IRT_DIFFICULTY_PARAMS[assignedDiff] || DEFAULT_IRT_DIFFICULTY_PARAMS.sedang;
    
    // Choose active filtered subtest or first subtest
    const activeSubtest = (selectedSubtestFilter !== 'ALL' && subtests.find(s => s.id === selectedSubtestFilter))
      || subtests[0]
      || { id: 'st-1', name: 'Subtes Utama', code: 'ST1' };

    const newQ: Question = {
      id: `q-native-${Date.now()}-${newNumber}`,
      number: newNumber,
      text: `Naskah pertanyaan nomor ${newNumber}...`,
      imageUrl: '',
      questionType: 'SINGLE_CHOICE',
      subtestId: activeSubtest.id,
      subtestName: activeSubtest.name,
      options: [
        { key: 'A', text: 'Pilihan Jawaban A', imageUrl: '' },
        { key: 'B', text: 'Pilihan Jawaban B', imageUrl: '' },
        { key: 'C', text: 'Pilihan Jawaban C', imageUrl: '' },
        { key: 'D', text: 'Pilihan Jawaban D', imageUrl: '' }
      ],
      correctAnswer: 'A',
      weight: 1,
      discussion: '',
      difficulty: assignedDiff,
      irtDiscrimination: irtPreset.a,
      irtDifficulty: irtPreset.b,
      irtGuessing: irtPreset.c
    };

    const nextQuestions = [...questions, newQ];
    setQuestions(nextQuestions);
    setActiveQuestionIndex(nextQuestions.length - 1);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Soal nomor #${newNumber} berhasil ditambahkan ke subtes "${activeSubtest.name}"!`, 'success');
  };

  // Duplicate Question
  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    if (!target) return;
    const newQ: Question = {
      ...JSON.parse(JSON.stringify(target)),
      id: `q-dup-${Date.now()}-${questions.length + 1}`,
      number: questions.length + 1
    };
    const nextQuestions = [...questions.slice(0, index + 1), newQ, ...questions.slice(index + 1)].map((q, i) => ({
      ...q,
      number: i + 1
    }));
    setQuestions(nextQuestions);
    setActiveQuestionIndex(index + 1);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Soal #${target.number} berhasil diduplikasi!`, 'info');
  };

  // Execute single question deletion (or reset if 1 question left)
  const handleExecuteDeleteSingle = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    const deletedNum = questions[index].number;

    if (questions.length <= 1) {
      // Clean reset to fresh single question
      const resetQuestion: Question = {
        id: `q-native-${Date.now()}-1`,
        number: 1,
        text: 'Tuliskan naskah soal nomor 1 di sini...',
        imageUrl: '',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Pilihan Jawaban A', imageUrl: '' },
          { key: 'B', text: 'Pilihan Jawaban B', imageUrl: '' },
          { key: 'C', text: 'Pilihan Jawaban C', imageUrl: '' },
          { key: 'D', text: 'Pilihan Jawaban D', imageUrl: '' }
        ],
        correctAnswer: 'A',
        weight: 1,
        discussion: '',
        difficulty: 'sedang'
      };
      setQuestions([resetQuestion]);
      setActiveQuestionIndex(0);
      setDeleteTargetIndex(null);
      setHasUnsavedChanges(true);
      if (onShowToast) onShowToast('Soal nomor #1 berhasil dikosongkan/direset.', 'info');
      return;
    }

    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({
      ...q,
      number: i + 1
    }));
    setQuestions(updated);
    setActiveQuestionIndex(Math.max(0, Math.min(index, updated.length - 1)));
    setDeleteTargetIndex(null);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Soal nomor #${deletedNum} berhasil dihapus.`, 'success');
  };

  // Execute bulk deletion of selected questions
  const handleExecuteBulkDelete = () => {
    if (selectedIndices.length === 0) return;
    const count = selectedIndices.length;

    const remaining = questions.filter((_, i) => !selectedIndices.includes(i));
    if (remaining.length === 0) {
      const resetQuestion: Question = {
        id: `q-native-${Date.now()}-1`,
        number: 1,
        text: 'Tuliskan naskah soal nomor 1 di sini...',
        imageUrl: '',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Pilihan Jawaban A', imageUrl: '' },
          { key: 'B', text: 'Pilihan Jawaban B', imageUrl: '' },
          { key: 'C', text: 'Pilihan Jawaban C', imageUrl: '' },
          { key: 'D', text: 'Pilihan Jawaban D', imageUrl: '' }
        ],
        correctAnswer: 'A',
        weight: 1,
        discussion: '',
        difficulty: 'sedang'
      };
      setQuestions([resetQuestion]);
      setActiveQuestionIndex(0);
    } else {
      const renumbered = remaining.map((q, i) => ({ ...q, number: i + 1 }));
      setQuestions(renumbered);
      setActiveQuestionIndex(0);
    }

    setSelectedIndices([]);
    setIsMultiSelectMode(false);
    setShowBulkDeleteConfirm(false);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Berhasil menghapus ${count} butir soal terpilih.`, 'success');
  };

  // Execute reset/clear content of current active question
  const handleExecuteResetCurrentQuestion = (index: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      const target = copy[index];
      if (!target) return prev;
      copy[index] = {
        ...target,
        text: '',
        imageUrl: '',
        options: [
          { key: 'A', text: '', imageUrl: '' },
          { key: 'B', text: '', imageUrl: '' },
          { key: 'C', text: '', imageUrl: '' },
          { key: 'D', text: '', imageUrl: '' }
        ],
        correctAnswer: 'A',
        discussion: '',
        weight: 1
      };
      return copy;
    });
    setShowResetQuestionConfirm(false);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Naskah & jawaban soal nomor #${questions[index]?.number} telah dikosongkan.`, 'info');
  };

  // Execute delete all / reset all questions in bank
  const handleExecuteResetAll = () => {
    const resetQuestion: Question = {
      id: `q-native-${Date.now()}-1`,
      number: 1,
      text: 'Tuliskan naskah soal nomor 1 di sini...',
      imageUrl: '',
      questionType: 'SINGLE_CHOICE',
      options: [
        { key: 'A', text: 'Pilihan Jawaban A', imageUrl: '' },
        { key: 'B', text: 'Pilihan Jawaban B', imageUrl: '' },
        { key: 'C', text: 'Pilihan Jawaban C', imageUrl: '' },
        { key: 'D', text: 'Pilihan Jawaban D', imageUrl: '' }
      ],
      correctAnswer: 'A',
      weight: 1,
      discussion: '',
      difficulty: 'sedang'
    };
    setQuestions([resetQuestion]);
    setActiveQuestionIndex(0);
    setSelectedIndices([]);
    setIsMultiSelectMode(false);
    setShowResetAllConfirm(false);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast('Semua soal telah dihapus. Dibuat 1 soal baru.', 'success');
  };

  // Multi-select toggles
  const toggleSelectQuestion = (idx: number) => {
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectAllQuestions = () => {
    setSelectedIndices(questions.map((_, i) => i));
  };

  const handleDeselectAllQuestions = () => {
    setSelectedIndices([]);
  };

  // Move Question Up / Down
  const handleMoveQuestion = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === questions.length - 1) return;

    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const copy = [...questions];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const renumbered = copy.map((q, i) => ({ ...q, number: i + 1 }));
    setQuestions(renumbered);
    setActiveQuestionIndex(targetIdx);
    setHasUnsavedChanges(true);
  };

  // Bulk Generator for LJK or CBT
  const handleGenerateBulk = (count: number) => {
    const num = Math.max(1, Math.min(150, count));
    const difficulties: QuestionDifficulty[] = ['mudah', 'sedang', 'sulit', 'hots'];
    const newQuestions: Question[] = Array.from({ length: num }, (_, i) => {
      if (questions[i]) return { ...questions[i], number: i + 1 };
      return {
        id: `q-bulk-${Date.now()}-${i + 1}`,
        number: i + 1,
        text: `Naskah pertanyaan nomor ${i + 1}...`,
        imageUrl: '',
        questionType: 'SINGLE_CHOICE',
        options: [
          { key: 'A', text: 'Pilihan Jawaban A', imageUrl: '' },
          { key: 'B', text: 'Pilihan Jawaban B', imageUrl: '' },
          { key: 'C', text: 'Pilihan Jawaban C', imageUrl: '' },
          { key: 'D', text: 'Pilihan Jawaban D', imageUrl: '' },
          { key: 'E', text: 'Pilihan Jawaban E', imageUrl: '' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D', 'E'][i % 5],
        weight: 1,
        discussion: `Pembahasan ringkas untuk soal nomor ${i + 1}`,
        difficulty: difficulties[i % 4]
      };
    });

    setQuestions(newQuestions);
    setActiveQuestionIndex(0);
    setShowBulkModal(false);
    setHasUnsavedChanges(true);
    if (onShowToast) onShowToast(`Berhasil men-generate ${num} nomor soal / LJK!`, 'success');
  };

  // Save changes to exam
  const handleSaveAll = () => {
    const updatedExam: Exam = {
      ...exam,
      questions,
      totalQuestions: questions.length,
      catQuestionCount: exam.isCatEnabled ? Math.min(exam.catQuestionCount || questions.length, questions.length) : undefined
    };

    onSaveExamQuestions(updatedExam);
    setHasUnsavedChanges(false);
    if (onShowToast) {
      onShowToast(`Semua soal (${questions.length} nomor) berhasil disimpan ke paket "${exam.title}"!`, 'success');
    }
  };

  // Handle preview simulation
  const handleOpenPreview = () => {
    const examPreview: Exam = {
      ...exam,
      questions: questions.length > 0 ? questions : exam.questions,
      totalQuestions: questions.length
    };
    setPreviewExam(examPreview);
  };

  // Handle batch move subtests
  const handleBatchMoveSubtest = (targetSubtestId: string) => {
    const matchedSt = subtests.find(s => s.id === targetSubtestId);
    if (!matchedSt || selectedIndices.length === 0) return;
    setQuestions(prev => {
      const copy = [...prev];
      selectedIndices.forEach(idx => {
        if (copy[idx]) {
          copy[idx] = {
            ...copy[idx],
            subtestId: matchedSt.id,
            subtestName: matchedSt.name
          };
        }
      });
      return copy;
    });
    setHasUnsavedChanges(true);
    if (onShowToast) {
      onShowToast(`${selectedIndices.length} butir soal berhasil dipindahkan ke subtes "${matchedSt.name}"!`, 'success');
    }
  };

  // Filter questions for sidebar
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      searchQuery === '' ||
      String(q.number).includes(searchQuery) ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.discussion && q.discussion.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedTypeFilter === 'ALL' || q.questionType === selectedTypeFilter;
    const matchesSubtest = selectedSubtestFilter === 'ALL' || q.subtestId === selectedSubtestFilter;
    return matchesSearch && matchesType && matchesSubtest;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden select-none">
      
      {/* 1. TOP BAR HEADER STUDIO */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-2xl z-20">
        
        {/* Left Side: Back button + Exam Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (confirm('Ada perubahan soal yang belum disimpan. Yakin ingin menutup studio?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 border border-slate-700"
            title="Kembali ke Daftar Paket Soal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800/80 uppercase tracking-wider">
                STUDIO INPUT SOAL
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                exam.mode === 'EMBED_DRIVE_PDF'
                  ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
              }`}>
                {exam.mode === 'EMBED_DRIVE_PDF' ? 'Mode PDF Drive + LJK' : 'Mode Native CBT'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                Kelas {exam.targetClass}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                {exam.category}
              </span>
              {exam.isCatEnabled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> CAT Aktif
                </span>
              )}
            </div>

            <h1 className="text-white font-extrabold text-base sm:text-lg truncate max-w-xl mt-0.5">
              {exam.title}
            </h1>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
            <span>Total Soal:</span>
            <strong className="text-cyan-400 font-bold">{questions.length} Nomor</strong>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Generator / Atur Jumlah Soal Massal"
          >
            <ListOrdered className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Generator Soal</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPreview}
            className="px-3.5 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800/80 text-purple-300 hover:text-purple-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Pratinjau Tampilan Ujian Siswa"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Pratinjau Siswa</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className={`px-4 py-2 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/25'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Simpan Soal*' : 'Simpan Soal'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (confirm('Ada perubahan soal yang belum disimpan. Yakin ingin menutup studio?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer border border-slate-700"
            title="Tutup Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT STUDIO */}
      <div className="flex-1 flex overflow-hidden">

        {/* ------------------------------------------------------------- */}
        {/* CASE A: MODE NATIVE CBT (Full Question Editor with Left Nav)  */}
        {/* ------------------------------------------------------------- */}
        {exam.mode === 'NATIVE_CBT' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* LEFT SIDEBAR: Question Navigation Grid & Stats */}
            <aside className="w-full md:w-80 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
              
              {/* Search & Filter Header */}
              <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-900 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">Navigasi Nomor Soal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMultiSelectMode(!isMultiSelectMode);
                        setSelectedIndices([]);
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        isMultiSelectMode
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {isMultiSelectMode ? 'Batal Pilih' : 'Pilih Massal'}
                    </button>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60 font-bold">
                      {questions.length} Butir
                    </span>
                  </div>
                </div>

                {/* Multi-select actions bar if active */}
                {isMultiSelectMode && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">
                        Terpilih: <strong className="text-cyan-400">{selectedIndices.length}</strong> dari {questions.length}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={handleSelectAllQuestions}
                          className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer"
                        >
                          Pilih Semua
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllQuestions}
                          className="text-[10px] text-slate-400 hover:underline font-bold cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>

                    {/* Batch Subtest Reassign */}
                    {subtests.length > 1 && (
                      <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5">
                        <select
                          value={targetBatchSubtestId}
                          onChange={e => setTargetBatchSubtestId(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-cyan-300 font-semibold focus:outline-none"
                        >
                          <option value="">Pilih Subtes Tujuan...</option>
                          {subtests.map((st, sIdx) => (
                            <option key={st.id} value={st.id}>
                              {sIdx + 1}. {st.name} ({st.code || `ST${sIdx + 1}`})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!targetBatchSubtestId || selectedIndices.length === 0}
                          onClick={() => {
                            handleBatchMoveSubtest(targetBatchSubtestId);
                            setTargetBatchSubtestId('');
                          }}
                          className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-[11px] rounded-lg shrink-0 cursor-pointer"
                        >
                          Pindah
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={selectedIndices.length === 0}
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus ({selectedIndices.length}) Soal Terpilih</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari nomor / teks soal..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md cursor-pointer"
                    title="Tambah Soal Baru di Akhir"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtest filter tabs if multi-subtest */}
                {subtests.length > 1 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-0.5">
                      <span>Filter Subtes:</span>
                      <span className="text-cyan-400">{subtests.length} Grup</span>
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedSubtestFilter('ALL')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedSubtestFilter === 'ALL'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Semua ({questions.length})
                      </button>
                      {subtests.map((st, sIdx) => {
                        const countInSubtest = questions.filter(q => q.subtestId === st.id).length;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSelectedSubtestFilter(st.id)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                              selectedSubtestFilter === st.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            <span>{st.code || `ST${sIdx + 1}`}</span>
                            <span className="opacity-70 font-mono">({countInSubtest})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Type filter tabs */}
                <div className="flex gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
                  {[
                    { id: 'ALL', label: 'Semua' },
                    { id: 'SINGLE_CHOICE', label: 'PG' },
                    { id: 'COMPLEX_CHOICE', label: 'Kompleks' },
                    { id: 'TRUE_FALSE', label: 'B/S' },
                    { id: 'ESSAY', label: 'Essay' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTypeFilter(tab.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedTypeFilter === tab.id
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List / Grid */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {filteredQuestions.map((q) => {
                  const actualIdx = questions.findIndex(item => item.id === q.id || item.number === q.number);
                  const isSelected = actualIdx === activeQuestionIndex;
                  const isChecked = selectedIndices.includes(actualIdx);

                  // Difficulty color badge
                  const diffColor =
                    q.difficulty === 'mudah' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    q.difficulty === 'sedang' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                    q.difficulty === 'sulit' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-purple-500/20 text-purple-300 border-purple-500/40';

                  // Answer key representation
                  const keyText =
                    q.questionType === 'SINGLE_CHOICE' ? String(q.correctAnswer || '-') :
                    q.questionType === 'COMPLEX_CHOICE' ? (Array.isArray(q.correctAnswer) ? q.correctAnswer.join(',') : String(q.correctAnswer)) :
                    q.questionType === 'TRUE_FALSE' ? 'T/F' : 'Essay';

                  return (
                    <div
                      key={q.id || actualIdx}
                      onClick={() => {
                        if (isMultiSelectMode) {
                          toggleSelectQuestion(actualIdx);
                        } else {
                          setActiveQuestionIndex(actualIdx);
                        }
                      }}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 relative ${
                        isSelected && !isMultiSelectMode
                          ? 'bg-cyan-950/90 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/40 text-white'
                          : isChecked
                          ? 'bg-rose-950/40 border-rose-500/60 shadow-sm'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80'
                      }`}
                    >
                      {/* Active Spotlight Indicator */}
                      {isSelected && !isMultiSelectMode && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-cyan-400 rounded-r-full shadow-md shadow-cyan-400/50" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        {isMultiSelectMode ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectQuestion(actualIdx);
                            }}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-transparent hover:border-slate-500'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          /* Number Icon */
                          <div className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-cyan-500 text-white border-cyan-300 shadow-md shadow-cyan-500/40 scale-105'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {q.number}
                          </div>
                        )}

                        {/* Title & Preview */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold ${isSelected && !isMultiSelectMode ? 'text-cyan-200' : 'text-white'}`}>
                              Soal #{q.number}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${diffColor}`}>
                              {q.difficulty || 'sedang'}
                            </span>
                            {subtests.length > 1 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 truncate max-w-[70px]">
                                {q.subtestName || subtests.find(s => s.id === q.subtestId)?.code || 'Subtes'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {q.text.replace(/<[^>]*>?/gm, '') || 'Belum ada teks soal'}
                          </p>
                        </div>
                      </div>

                      {/* Right info & Quick Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 block">
                            {keyText}
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            {q.weight || 1} pt
                          </span>
                        </div>

                        {!isMultiSelectMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetIndex(actualIdx);
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 border border-transparent hover:border-rose-800/60 transition-all cursor-pointer"
                            title={`Hapus Soal #${q.number}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredQuestions.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Tidak ada soal yang cocok dengan pencarian.
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Soal Nomor {questions.length + 1}</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <ListOrdered className="w-3.5 h-3.5" /> Atur Jumlah Massal
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResetAllConfirm(true)}
                    className="text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset Semua
                  </button>
                </div>
              </div>
            </aside>

            {/* MAIN WORKSPACE: Active Question Editor */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-6 custom-scrollbar select-text">
              {currentQ ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Top Bar for Selected Question */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-mono font-black text-lg flex items-center justify-center shadow-lg shadow-cyan-600/30 shrink-0">
                        {currentQ.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-white font-extrabold text-base sm:text-lg">
                            Soal Nomor {currentQ.number}
                          </h2>
                          <span className="text-xs text-slate-400">
                            (dari {questions.length} soal)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Konfigurasikan tipe pertanyaan, naskah, gambar, dan kunci jawaban.
                        </p>
                      </div>
                    </div>

                    {/* Question Controls: Duplicate, Move, Reset, Delete */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(activeQuestionIndex, 'UP')}
                        disabled={activeQuestionIndex === 0}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all cursor-pointer"
                        title="Geser Soal ke Atas"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(activeQuestionIndex, 'DOWN')}
                        disabled={activeQuestionIndex === questions.length - 1}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all cursor-pointer"
                        title="Geser Soal ke Bawah"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(activeQuestionIndex)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Duplikasi Soal Ini"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden sm:inline">Duplikasi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowResetQuestionConfirm(true)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Kosongkan Naskah & Jawaban Soal Ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Kosongkan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetIndex(activeQuestionIndex)}
                        className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-rose-100 font-bold text-xs border border-rose-800/60 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Hapus Soal Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span className="hidden sm:inline">Hapus Soal</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Parameters (Type, Subtest, Difficulty, Weight, IRT) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                        <Sliders className="w-4 h-4" /> Parameter, Subtes & Tipe Soal
                      </h3>
                      {exam.isIRTEnabled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-700/80 flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3 text-indigo-400" /> Penilaian IRT Aktif
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Subtest Assignment */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Kelompok Subtes</span>
                          <span className="text-[10px] text-cyan-400 font-bold">{subtests.length} Subtes</span>
                        </label>
                        <select
                          value={currentQ.subtestId || subtests[0]?.id || ''}
                          onChange={e => {
                            const chosen = subtests.find(s => s.id === e.target.value);
                            updateQuestion(activeQuestionIndex, {
                              subtestId: e.target.value,
                              subtestName: chosen?.name || ''
                            });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-cyan-300 font-bold focus:outline-none"
                        >
                          {subtests.map((st, idx) => (
                            <option key={st.id} value={st.id}>
                              {idx + 1}. {st.name} ({st.code || `ST${idx + 1}`})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Tipe Pertanyaan
                        </label>
                        <select
                          value={currentQ.questionType}
                          onChange={e => updateQuestion(activeQuestionIndex, { questionType: e.target.value as QuestionType })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-cyan-300 font-bold focus:outline-none"
                        >
                          <option value="SINGLE_CHOICE">Pilihan Ganda (Single Choice / 1 Kunci)</option>
                          <option value="COMPLEX_CHOICE">Pilihan Kompleks (Multi Choice / Banyak Kunci)</option>
                          <option value="TRUE_FALSE">Tabel Pernyataan Benar / Salah (True False)</option>
                          <option value="ESSAY">Essay / Isian Singkat</option>
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Tingkat Kesulitan
                        </label>
                        <select
                          value={currentQ.difficulty || 'sedang'}
                          onChange={e => {
                            const diff = e.target.value as QuestionDifficulty;
                            const irtPreset = DEFAULT_IRT_DIFFICULTY_PARAMS[diff] || DEFAULT_IRT_DIFFICULTY_PARAMS.sedang;
                            updateQuestion(activeQuestionIndex, {
                              difficulty: diff,
                              irtDiscrimination: currentQ.irtDiscrimination ?? irtPreset.a,
                              irtDifficulty: irtPreset.b,
                              irtGuessing: currentQ.irtGuessing ?? irtPreset.c
                            });
                          }}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs font-extrabold focus:outline-none ${
                            currentQ.difficulty === 'mudah' ? 'text-emerald-400 border-emerald-800' :
                            currentQ.difficulty === 'sedang' ? 'text-blue-400 border-blue-800' :
                            currentQ.difficulty === 'sulit' ? 'text-amber-400 border-amber-800' :
                            'text-purple-400 border-purple-800'
                          }`}
                        >
                          <option value="mudah">Mudah (Easy)</option>
                          <option value="sedang">Sedang (Medium)</option>
                          <option value="sulit">Sulit (Hard)</option>
                          <option value="hots">HOTS (High Order Thinking)</option>
                        </select>
                      </div>

                      {/* Weight */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold text-slate-300">
                            {currentQ.questionType === 'TRUE_FALSE' ? 'Total Bobot (Akumulasi)' : 'Bobot Nilai Poin'}
                          </label>
                          {currentQ.questionType === 'TRUE_FALSE' && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/80">
                              Otomatis
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={currentQ.weight || 1}
                          onChange={e => updateQuestion(activeQuestionIndex, { weight: Math.max(1, Number(e.target.value)) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Dedicated IRT 3PL Logistic Model Parameters */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-300">
                            Parameter Butir Soal IRT (3-Parameter Logistic Model)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Otomatis sinkron dengan tingkat kesulitan</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-indigo-900/40">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Daya Pembeda ($a$ / Discrimination)
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.1"
                            max="3.0"
                            value={currentQ.irtDiscrimination ?? 1.2}
                            onChange={e => updateQuestion(activeQuestionIndex, { irtDiscrimination: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-2 text-xs font-mono text-indigo-300 font-bold"
                          />
                          <span className="text-[9px] text-slate-500 mt-0.5 block">Rentang standar: 0.5 - 2.5</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Tingkat Kesulitan ($b$ / Difficulty)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="-4.0"
                            max="4.0"
                            value={currentQ.irtDifficulty ?? 0.0}
                            onChange={e => updateQuestion(activeQuestionIndex, { irtDifficulty: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-2 text-xs font-mono text-cyan-300 font-bold"
                          />
                          <span className="text-[9px] text-slate-500 mt-0.5 block">Rentang standar: -3.0 (Mudah) s/d +3.0 (Sulit)</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Peluang Tebakan Semu ($c$ / Pseudo-Guessing)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.0"
                            max="0.5"
                            value={currentQ.irtGuessing ?? 0.05}
                            onChange={e => updateQuestion(activeQuestionIndex, { irtGuessing: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-2 text-xs font-mono text-amber-300 font-bold"
                          />
                          <span className="text-[9px] text-slate-500 mt-0.5 block">Rentang: 0.00 - 0.25 (Pilihan Ganda ~0.20)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Question Text & Image */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                    <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Naskah Soal & Media Pendukung
                    </h3>

                    <div className="space-y-4">
                      {/* Rich Text Editor for Question */}
                      <div>
                        <CbtRichTextEditor
                          label={`Naskah Pertanyaan Nomor ${currentQ.number}`}
                          value={currentQ.text}
                          onChange={newVal => updateQuestion(activeQuestionIndex, { text: newVal })}
                          placeholder={`Tuliskan pertanyaan/soal nomor ${currentQ.number} di sini...`}
                          textAlign={currentQ.textAlign || 'left'}
                          onTextAlignChange={align => updateQuestion(activeQuestionIndex, { textAlign: align })}
                          rows={4}
                        />
                      </div>

                      {/* Image Settings */}
                      <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            URL Gambar / Diagram Pendukung Soal (Opsional)
                          </label>
                          {currentQ.imageUrl && (
                            <button
                              type="button"
                              onClick={() => updateQuestion(activeQuestionIndex, { imageUrl: '' })}
                              className="text-[11px] text-rose-400 hover:underline"
                            >
                              Hapus Gambar
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            value={currentQ.imageUrl || ''}
                            onChange={e => updateQuestion(activeQuestionIndex, { imageUrl: e.target.value })}
                            placeholder="https://example.com/gambar-soal.png"
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        {currentQ.imageUrl && (
                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <span>Ukuran Gambar:</span>
                                <div className="flex gap-1">
                                  {(['small', 'medium', 'large', 'full'] as const).map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => updateQuestion(activeQuestionIndex, { imageWidth: size })}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                        (currentQ.imageWidth || 'medium') === size
                                          ? 'bg-cyan-600 text-white shadow-sm'
                                          : 'bg-slate-900 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : size === 'large' ? 'Besar' : 'Penuh'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span>Posisi:</span>
                                <div className="flex gap-1">
                                  {(['left', 'center', 'right'] as const).map(pos => (
                                    <button
                                      key={pos}
                                      type="button"
                                      onClick={() => updateQuestion(activeQuestionIndex, { imageAlign: pos })}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                        (currentQ.imageAlign || 'center') === pos
                                          ? 'bg-cyan-600 text-white shadow-sm'
                                          : 'bg-slate-900 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {pos === 'left' ? 'Kiri' : pos === 'center' ? 'Tengah' : 'Kanan'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center min-h-[140px] max-h-72 overflow-hidden">
                              <img
                                src={currentQ.imageUrl}
                                alt="Preview Soal"
                                className="max-h-64 max-w-full object-contain rounded-lg shadow-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Options / Answers Editor */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Pilihan Jawaban & Kunci
                      </h3>
                      <span className="text-xs text-slate-400">
                        {currentQ.questionType === 'SINGLE_CHOICE' ? 'Pilih 1 kunci jawaban yang benar' :
                         currentQ.questionType === 'COMPLEX_CHOICE' ? 'Bisa pilih lebih dari 1 kunci jawaban' :
                         currentQ.questionType === 'TRUE_FALSE' ? 'Atur Benar/Salah untuk tiap baris pernyataan' :
                         'Tentukan kata kunci jawaban essay'}
                      </span>
                    </div>

                    {/* SUB-TYPE 1 & 2: SINGLE_CHOICE / COMPLEX_CHOICE - GROUPED INTO SINGLE CONTAINER WITH DYNAMIC OPTIONS (A-D DEFAULT, + E) */}
                    {(currentQ.questionType === 'SINGLE_CHOICE' || currentQ.questionType === 'COMPLEX_CHOICE') && (() => {
                      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                      const activeOptions = (currentQ.options && currentQ.options.length > 0)
                        ? currentQ.options
                        : [
                            { key: 'A', text: '', imageUrl: '' },
                            { key: 'B', text: '', imageUrl: '' },
                            { key: 'C', text: '', imageUrl: '' },
                            { key: 'D', text: '', imageUrl: '' }
                          ];

                      const nextLetter = alphabet[activeOptions.length] || 'E';

                      return (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 divide-y divide-slate-800/80 overflow-hidden shadow-lg">
                          {activeOptions.map((opt) => {
                            const optKey = opt.key;
                            // Check if this option is the correct answer
                            const isCorrect =
                              currentQ.questionType === 'SINGLE_CHOICE'
                                ? currentQ.correctAnswer === optKey
                                : Array.isArray(currentQ.correctAnswer)
                                ? currentQ.correctAnswer.includes(optKey)
                                : currentQ.correctAnswer === optKey;

                            return (
                              <div
                                key={optKey}
                                className={`p-3 sm:p-3.5 transition-all space-y-2 relative ${
                                  isCorrect
                                    ? 'bg-emerald-950/30'
                                    : 'hover:bg-slate-900/30'
                                }`}
                              >
                                {/* Left Accent Bar for Correct Answer */}
                                {isCorrect && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-md shadow-emerald-500/50" />
                                )}

                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (currentQ.questionType === 'SINGLE_CHOICE') {
                                          updateQuestion(activeQuestionIndex, { correctAnswer: optKey });
                                        } else {
                                          const currentArr = Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer : [String(currentQ.correctAnswer)];
                                          const nextArr = currentArr.includes(optKey)
                                            ? currentArr.filter(x => x !== optKey)
                                            : [...currentArr, optKey];
                                          updateQuestion(activeQuestionIndex, { correctAnswer: nextArr });
                                        }
                                      }}
                                      className={`w-8 h-8 rounded-xl font-bold font-mono text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                                        isCorrect
                                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/40 scale-105 ring-2 ring-emerald-400/30'
                                          : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                                      }`}
                                      title="Klik untuk menjadikan opsi ini sebagai Kunci Jawaban"
                                    >
                                      {optKey}
                                    </button>

                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-white text-xs">
                                        Pilihan Jawaban {optKey}
                                      </span>
                                      {isCorrect && (
                                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-700/80 inline-flex items-center gap-1 shadow-2xs">
                                          <Check className="w-3 h-3 text-emerald-400" /> KUNCI BENAR
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (currentQ.questionType === 'SINGLE_CHOICE') {
                                          updateQuestion(activeQuestionIndex, { correctAnswer: optKey });
                                        } else {
                                          const currentArr = Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer : [String(currentQ.correctAnswer)];
                                          const nextArr = currentArr.includes(optKey)
                                            ? currentArr.filter(x => x !== optKey)
                                            : [...currentArr, optKey];
                                          updateQuestion(activeQuestionIndex, { correctAnswer: nextArr });
                                        }
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                                        isCorrect
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-xs'
                                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                                      }`}
                                    >
                                      {isCorrect ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span>Kunci Aktif</span>
                                        </>
                                      ) : (
                                        <span>+ Kunci</span>
                                      )}
                                    </button>

                                    {/* Delete option button (if more than 2 options) */}
                                    {activeOptions.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(activeQuestionIndex, optKey)}
                                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 flex items-center justify-center transition-all cursor-pointer"
                                        title={`Hapus Opsi Pilihan ${optKey}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Option text rich editor */}
                                <CbtRichTextEditor
                                  value={opt.text || ''}
                                  onChange={newVal => updateQuestionOption(activeQuestionIndex, optKey, 'text', newVal)}
                                  placeholder={`Tuliskan teks atau formula pilihan jawaban ${optKey}...`}
                                  compact={true}
                                />

                                {/* Optional image for option */}
                                <div className="flex items-center gap-2 pt-0.5">
                                  <input
                                    type="url"
                                    value={opt.imageUrl || ''}
                                    onChange={e => updateQuestionOption(activeQuestionIndex, optKey, 'imageUrl', e.target.value)}
                                    placeholder={`URL Gambar Opsi ${optKey} (Opsional)...`}
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                                  />
                                  {opt.imageUrl && (
                                    <img
                                      src={opt.imageUrl}
                                      alt={`Preview Opsi ${optKey}`}
                                      className="w-8 h-8 rounded-lg border border-slate-700 object-cover shrink-0"
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Next Option Footer Bar */}
                          {activeOptions.length < 10 && (
                            <div className="p-3 bg-slate-900/50 flex items-center justify-between gap-3 border-t border-slate-800/80">
                              <div className="text-xs text-slate-400">
                                Opsi Pilihan Aktif: <span className="font-bold text-white font-mono">{activeOptions.map(o => o.key).join(', ')}</span> ({activeOptions.length} Opsi)
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddOption(activeQuestionIndex)}
                                className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Tambah Opsi ({nextLetter})</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* SUB-TYPE 3: TRUE_FALSE STATEMENT TABLE */}
                    {currentQ.questionType === 'TRUE_FALSE' && (() => {
                      const stmts = currentQ.statements && currentQ.statements.length > 0
                        ? currentQ.statements
                        : [
                            { id: `s-${currentQ.id}-1`, text: 'Pernyataan 1', correctAnswer: 'TRUE' as const, weight: 1 },
                            { id: `s-${currentQ.id}-2`, text: 'Pernyataan 2', correctAnswer: 'FALSE' as const, weight: 1 }
                          ];
                      const totalStmtWeight = stmts.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);

                      return (
                        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                                <CheckSquare className="w-4 h-4 text-cyan-400" /> Tabel Pernyataan & Pembobotan Benar / Salah:
                              </span>
                              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800">
                                Total Bobot: {totalStmtWeight} Poin
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddStatement(activeQuestionIndex)}
                              className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Tambah Pernyataan</span>
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/40">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                                  <th className="p-3 w-12 text-center">#</th>
                                  <th className="p-3 min-w-[200px]">Teks Pernyataan</th>
                                  <th className="p-3 w-28 text-center">Bobot (Poin)</th>
                                  <th className="p-3 w-48 text-center">Kunci Jawaban</th>
                                  <th className="p-3 w-14 text-center">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {stmts.map((stmt, sIdx) => {
                                  const stmtWeight = stmt.weight !== undefined ? stmt.weight : 1;
                                  return (
                                    <tr key={stmt.id || sIdx} className="hover:bg-slate-900/60 transition-colors">
                                      <td className="p-3 text-center font-mono font-bold text-cyan-400">
                                        {sIdx + 1}
                                      </td>
                                      <td className="p-3">
                                        <input
                                          type="text"
                                          value={stmt.text}
                                          onChange={e => handleUpdateStatement(activeQuestionIndex, sIdx, 'text', e.target.value)}
                                          placeholder={`Tuliskan pernyataan ${sIdx + 1}...`}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-all"
                                        />
                                      </td>
                                      <td className="p-3 text-center">
                                        <div className="flex items-center justify-center">
                                          <input
                                            type="number"
                                            min={0.5}
                                            max={100}
                                            step={0.5}
                                            value={stmtWeight}
                                            onChange={e => handleUpdateStatement(activeQuestionIndex, sIdx, 'weight', Math.max(0.5, Number(e.target.value) || 1))}
                                            className="w-20 bg-slate-950 border border-amber-800/70 focus:border-amber-400 rounded-xl px-2.5 py-2 text-xs text-center font-bold text-amber-300 focus:outline-none shadow-xs"
                                            title="Bobot poin untuk pernyataan ini"
                                          />
                                        </div>
                                      </td>
                                      <td className="p-3 text-center">
                                        <div className="flex justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateStatement(activeQuestionIndex, sIdx, 'correctAnswer', 'TRUE')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                              stmt.correctAnswer === 'TRUE'
                                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 scale-105 ring-2 ring-emerald-400/30'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                                            }`}
                                          >
                                            <Check className="w-3 h-3" />
                                            <span>BENAR</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateStatement(activeQuestionIndex, sIdx, 'correctAnswer', 'FALSE')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                              stmt.correctAnswer === 'FALSE'
                                                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400/30'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                                            }`}
                                          >
                                            <X className="w-3 h-3" />
                                            <span>SALAH</span>
                                          </button>
                                        </div>
                                      </td>
                                      <td className="p-3 text-center">
                                        {stmts.length > 1 ? (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveStatement(activeQuestionIndex, sIdx)}
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 flex items-center justify-center transition-all cursor-pointer mx-auto"
                                            title="Hapus Pernyataan"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <span className="text-slate-600 text-xs">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span>Siswa akan mendapatkan nilai sesuai bobot pada setiap pernyataan yang dijawab dengan benar.</span>
                            </div>
                            <div className="text-slate-300 font-medium">
                              Total Akumulasi: <strong className="text-amber-400 font-bold">{totalStmtWeight} Poin</strong> ({stmts.length} Pernyataan)
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SUB-TYPE 4: ESSAY */}
                    {currentQ.questionType === 'ESSAY' && (
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Pedoman Kunci Jawaban / Kata Kunci Penilaian Essay
                        </label>
                        <textarea
                          value={String(currentQ.correctAnswer || '')}
                          onChange={e => updateQuestion(activeQuestionIndex, { correctAnswer: e.target.value })}
                          placeholder="Tuliskan kata kunci utama atau rubrik penilaian untuk jawaban essay..."
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Section 4: Solution Discussion */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                    <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Pembahasan Soal & Analisis Solusi (Opsional)
                    </h3>

                    <CbtRichTextEditor
                      label={`Pembahasan & Solusi Soal Nomor ${currentQ.number}`}
                      value={currentQ.discussion || ''}
                      onChange={newVal => updateQuestion(activeQuestionIndex, { discussion: newVal })}
                      placeholder={`Tuliskan pembahasan lengkap / rumus solusi untuk soal nomor ${currentQ.number}...`}
                      rows={3}
                    />
                  </div>

                  {/* Section 5: Bottom Navigation Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-6">
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                      disabled={activeQuestionIndex === 0}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Soal Sebelumnya
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Tambah Soal Baru
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAll}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Simpan Semua Perubahan
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex(Math.min(questions.length - 1, activeQuestionIndex + 1))}
                      disabled={activeQuestionIndex === questions.length - 1}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
                    >
                      Soal Selanjutnya <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  Pilih nomor soal pada panel kiri untuk mulai mengedit.
                </div>
              )}
            </main>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CASE B: MODE EMBED GOOGLE DRIVE PDF (Split View PDF + LJK)    */}
        {/* ------------------------------------------------------------- */}
        {exam.mode === 'EMBED_DRIVE_PDF' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* LEFT HALF: Google Drive PDF Live Viewer */}
            <div className="w-full lg:w-1/2 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
              <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-xs">Naskah Soal PDF (Google Drive)</span>
                </div>

                <div className="flex items-center gap-2">
                  {exam.pdfDriveUrl && (
                    <a
                      href={getGoogleDriveDirectViewUrl(exam.pdfDriveUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/60"
                    >
                      <ExternalLink className="w-3 h-3" /> Buka di Tab Baru
                    </a>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-slate-950 relative">
                {exam.pdfDriveUrl ? (
                  <iframe
                    src={formatGoogleDriveEmbedUrl(exam.pdfDriveUrl)}
                    title="Naskah Soal PDF"
                    className="w-full h-full border-0"
                    allow="autoplay"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-400">
                      Link PDF Google Drive belum diatur pada informasi paket soal.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT HALF: Bulk LJK Generator & Digital Key Sheet */}
            <div className="w-full lg:w-1/2 bg-slate-950 flex flex-col overflow-hidden">
              
              {/* LJK Header Bar */}
              <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Lembar Jawaban Komputer (LJK) & Kunci</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Klik huruf A-E untuk mengatur kunci jawaban per nomor secara cepat.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <ListOrdered className="w-3.5 h-3.5" /> Atur Jumlah Soal
                  </button>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah 1 Nomor
                  </button>
                </div>
              </div>

              {/* LJK Table / List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 text-xs shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-mono font-black flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-200 text-xs">Kunci:</span>

                        {/* Option Select A-E */}
                        <div className="flex items-center gap-1.5">
                          {['A', 'B', 'C', 'D', 'E'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateQuestion(idx, { correctAnswer: opt })}
                              className={`w-8 h-8 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                                q.correctAnswer === opt
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Difficulty */}
                        <select
                          value={q.difficulty || 'sedang'}
                          onChange={e => updateQuestion(idx, { difficulty: e.target.value as any })}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-bold text-cyan-300 focus:outline-none"
                        >
                          <option value="mudah">Mudah</option>
                          <option value="sedang">Sedang</option>
                          <option value="sulit">Sulit</option>
                          <option value="hots">HOTS</option>
                        </select>

                        {/* Weight */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Bobot:</span>
                          <input
                            type="number"
                            min={1}
                            value={q.weight || 1}
                            onChange={e => updateQuestion(idx, { weight: Math.max(1, Number(e.target.value)) })}
                            className="w-12 bg-slate-950 border border-slate-800 rounded-lg py-1 px-1.5 text-center text-xs text-amber-300 font-bold focus:outline-none"
                          />
                        </div>

                        {/* Delete */}
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetIndex(idx)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/50 cursor-pointer"
                            title="Hapus Nomor Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Brief Discussion / Solution note */}
                    <div>
                      <input
                        type="text"
                        value={q.discussion || ''}
                        onChange={e => updateQuestion(idx, { discussion: e.target.value })}
                        placeholder={`Pembahasan / kata kunci untuk nomor ${idx + 1} (Opsional)...`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* LJK Footer */}
              <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-400">
                  Total Terdaftar: <strong className="text-white">{questions.length} Nomor</strong>
                </span>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Kunci LJK</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 3. BULK GENERATOR MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Generator Jumlah Soal Massal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Tentukan berapa jumlah nomor butir soal/LJK yang ingin dibuat pada paket ujian ini (1 - 150 nomor).
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Jumlah Butir Soal:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={150}
                  value={bulkCount}
                  onChange={e => setBulkCount(Math.max(1, Math.min(150, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 25, 30, 40, 50, 100].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setBulkCount(cnt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      bulkCount === cnt
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {cnt} Soal
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleGenerateBulk(bulkCount)}
                className="w-1/2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Buat {bulkCount} Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: SINGLE DELETE CONFIRM */}
      {deleteTargetIndex !== null && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-800/80">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hapus Soal #{questions[deleteTargetIndex]?.number || deleteTargetIndex + 1}?</h3>
                <p className="text-xs text-slate-400">Nomor butir soal berikutnya akan otomatis disesuaikan secara urut.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              Apakah Anda yakin ingin menghapus butir soal ini? Tindakan ini akan menghapus teks soal, gambar, dan kunci jawaban pada nomor tersebut.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetIndex(null)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDeleteSingle(deleteTargetIndex)}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: BULK DELETE CONFIRM */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-800/80">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hapus {selectedIndices.length} Soal Terpilih?</h3>
                <p className="text-xs text-slate-400">Semua butir soal yang dicentang akan dihapus serentak.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              Perhatian: Anda telah memilih <strong className="text-rose-400 font-bold">{selectedIndices.length}</strong> butir soal. Sisa butir soal yang tidak dihapus akan otomatis dinomori ulang dari 1 hingga {Math.max(1, questions.length - selectedIndices.length)}.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" /> Hapus {selectedIndices.length} Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: RESET CURRENT QUESTION CONTENT CONFIRM */}
      {showResetQuestionConfirm && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-800/80">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Kosongkan Soal #{currentQ?.number}?</h3>
                <p className="text-xs text-slate-400">Menghapus teks naskah dan jawaban pada nomor ini tanpa menghapus urutan nomor.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              Naskah pertanyaan, gambar lampiran, pilihan jawaban, dan pembahasan pada nomor ini akan di-reset menjadi kosong baru.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetQuestionConfirm(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteResetCurrentQuestion}
                className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: RESET ALL QUESTIONS CONFIRM */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-800/80">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Reset Semua Soal Paket Ini?</h3>
                <p className="text-xs text-slate-400">Tindakan ini akan mengosongkan seluruh butir soal.</p>
              </div>
            </div>

            <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/60 font-semibold">
              Perhatian: Seluruh butir soal ({questions.length} butir) akan dihapus dan digantikan oleh 1 butir soal kosong baru nomor 1. Tindakan ini tidak dapat dibatalkan jika Anda menyimpan perubahan!
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetAllConfirm(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" /> Ya, Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PREVIEW MODAL */}
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
            if (onShowToast) onShowToast(`[Pratinjau Selesai] Skor Simulasi: ${result.score} (${result.percentage}%)`, 'info');
            setPreviewExam(null);
          }}
          onCancelExam={() => setPreviewExam(null)}
        />
      )}

    </div>
  );
};
