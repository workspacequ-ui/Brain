import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../../types';
import {
  Printer,
  X,
  FileCheck2,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  Sparkles,
  Layers,
  Copy,
  Check,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  User as UserIcon,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  FileText,
  Activity,
  Compass,
  TrendingUp,
  CheckCheck,
  AlertCircle,
  Download,
  Loader2,
  CheckSquare,
  Square,
  Clock,
  ExternalLink,
  Table,
  TableProperties
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

import {
  StudentTryoutResult,
  DEFAULT_STUDENT_TRYOUT_RESULTS,
  DEFAULT_LABSCHOOL_ACTIVE_STUDENTS,
  LabschoolActiveStudent,
  LearningJournalMeeting,
  loadStoredJournals,
  loadStoredTryoutResults,
  DEFAULT_LAB_TRYOUTS,
  getSubtestSectionsWithDefaults,
  computeTryoutMultiColumnRow,
  TryoutMultiColumnAnalysisRow,
  DEFAULT_QUIZ_LEADERBOARD,
  getActiveStudentsByLevel,
  generateComprehensiveStudentTryoutResults
} from './labschoolLaporanData';
import { DEFAULT_LABSCHOOL_CAMPUSES, LabschoolCampusItem } from './labschoolCampusData';

export type PrintReportType = 'ALL' | 'TRYOUT' | 'TRYOUT_TABLE' | 'QUIZ' | 'JOURNAL';

interface LabschoolPrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  initialReportType?: PrintReportType;
  initialTryoutId?: string;
  initialStudentId?: string;
  initialStudentName?: string;
  initialStudentNis?: string;
  initialStudentLevel?: 'SMP' | 'SMA';
  initialCampusName?: string;
  initialResult?: StudentTryoutResult;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LabschoolPrintReportModal: React.FC<LabschoolPrintReportModalProps> = ({
  isOpen,
  onClose,
  user,
  initialReportType = 'ALL',
  initialTryoutId,
  initialStudentId,
  initialStudentName,
  initialStudentNis,
  initialStudentLevel,
  initialCampusName,
  initialResult,
  onShowToast
}) => {
  // 1. Primary Filter Hierarchies
  const [studentLevel, setStudentLevel] = useState<'SMP' | 'SMA'>(
    initialStudentLevel || initialResult?.level || 'SMA'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (user.id || 'u-sma-lab-1')
  );
  const [selectedTryoutId, setSelectedTryoutId] = useState<string>(
    initialTryoutId || 'to-lab-sma-2'
  );
  const [selectedCampusId, setSelectedCampusId] = useState<string>('camp-kebayoran');
  const [reportType, setReportType] = useState<PrintReportType>(initialReportType);

  // Table scope: Student's multi-tryout history vs Full class tryout analysis
  const [tryoutTableScope, setTryoutTableScope] = useState<'STUDENT_MULTI' | 'ALL_STUDENTS'>('STUDENT_MULTI');

  // Student details
  const [studentName, setStudentName] = useState(
    initialStudentName || initialResult?.studentName || user.name || 'Arya Dewantara Putra'
  );
  const [studentNis, setStudentNis] = useState(
    initialStudentNis || initialResult?.studentNis || '20261011'
  );
  const [studentClassName, setStudentClassName] = useState('SMA-LABSCHOOL');

  // Granular Section Print Selection Toggles (Sequential: I, II, III, IV, IV.B, V, VI)
  const [showLetterhead, setShowLetterhead] = useState(true);
  const [showStudentProfile, setShowStudentProfile] = useState(true);
  const [showSummaryBanner, setShowSummaryBanner] = useState(true);
  const [showCharts, setShowCharts] = useState(true); // I. Diagram Batang 5 Subtes
  const [showDiagnosticRadar, setShowDiagnosticRadar] = useState(true); // I.A Radar Diagnosis
  const [showDiagnosticTrends, setShowDiagnosticTrends] = useState(true); // I.B Tren Skor
  const [showDiagnosticStrengths, setShowDiagnosticStrengths] = useState(true); // I.C Matriks Kekuatan/Kelemahan
  const [showMultiTryoutTable, setShowMultiTryoutTable] = useState(true); // II. Tabel Multi-Tryout 14 Kolom
  const [showPassingGrade, setShowPassingGrade] = useState(true); // III. Komparasi 5 Kampus
  const [showMaterialProgressBar, setShowMaterialProgressBar] = useState(true); // IV. Grafik Progres Silabus
  const [showJournal, setShowJournal] = useState(true); // IV.A Jurnal Belajar
  const [showQuizSection, setShowQuizSection] = useState(true); // IV.B Kuis & Leaderboard
  const [showRecommendations, setShowRecommendations] = useState(true); // V. Catatan Tutor
  const [showSignatures, setShowSignatures] = useState(true); // VI. Tanda Tangan

  const [tutorName] = useState('Dr. Hendra Wijaya, M.Pd.');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Available Data Sources
  const allStoredResults = useMemo(() => loadStoredTryoutResults(), [isOpen]);
  const campuses = DEFAULT_LABSCHOOL_CAMPUSES;

  // Filter students based on active Jenjang (SMP / SMA)
  const availableStudents = useMemo(() => {
    const list = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.filter(s => s.level === studentLevel);
    // Also include any stored student results for this level
    const existingIds = new Set(list.map(s => s.id));
    allStoredResults
      .filter(r => r.level === studentLevel)
      .forEach(r => {
        if (!existingIds.has(r.studentId)) {
          list.push({
            id: r.studentId,
            name: r.studentName,
            nis: r.studentNis,
            level: r.level,
            className: r.studentClass || `${r.level}-LABSCHOOL`,
            targetCampusId: r.targetCampusId || 'camp-kebayoran',
            targetCampusName: r.targetCampusName || `${r.level} Labschool Kebayoran`,
            avatar: r.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            tryoutCount: 4,
            latestScore: r.totalScore
          });
          existingIds.add(r.studentId);
        }
      });
    return list;
  }, [studentLevel, allStoredResults]);

  // Filter tryouts based on active Jenjang (SMP / SMA)
  const availableTryouts = useMemo(() => {
    return DEFAULT_LAB_TRYOUTS.filter(t => t.level === studentLevel);
  }, [studentLevel]);

  // Initialize or Sync on Props Change
  useEffect(() => {
    if (isOpen) {
      const currentLvl = initialStudentLevel || initialResult?.level || 'SMA';
      setStudentLevel(currentLvl);

      const lvlStudents = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.filter(s => s.level === currentLvl);
      const targetStudent = lvlStudents.find(
        s => s.id === initialStudentId || (initialStudentName && s.name.toLowerCase().includes(initialStudentName.toLowerCase()))
      ) || lvlStudents[0];

      if (targetStudent) {
        setSelectedStudentId(targetStudent.id);
        setStudentName(targetStudent.name);
        setStudentNis(targetStudent.nis);
        setStudentClassName(targetStudent.className);
        if (targetStudent.targetCampusId) {
          setSelectedCampusId(targetStudent.targetCampusId);
        }
      } else if (initialResult) {
        setSelectedStudentId(initialResult.studentId);
        setStudentName(initialResult.studentName);
        setStudentNis(initialResult.studentNis);
        setStudentClassName(initialResult.studentClass || `${currentLvl}-LABSCHOOL`);
        if (initialResult.targetCampusId) setSelectedCampusId(initialResult.targetCampusId);
      }

      const lvlTryouts = DEFAULT_LAB_TRYOUTS.filter(t => t.level === currentLvl);
      if (initialTryoutId && lvlTryouts.some(t => t.id === initialTryoutId)) {
        setSelectedTryoutId(initialTryoutId);
      } else if (lvlTryouts.length > 0) {
        setSelectedTryoutId(lvlTryouts[lvlTryouts.length - 1].id);
      }

      if (initialCampusName) {
        const foundCamp = campuses.find(c =>
          c.name.toLowerCase().includes(initialCampusName.toLowerCase())
        );
        if (foundCamp) setSelectedCampusId(foundCamp.id);
      }

      if (initialReportType) {
        handleReportTypeChange(initialReportType as PrintReportType);
      }
    }
  }, [isOpen, initialTryoutId, initialStudentId, initialStudentName, initialStudentNis, initialStudentLevel, initialCampusName, initialResult, initialReportType]);

  // Handle Jenjang Change: automatically re-filters students and tryouts to that jenjang
  const handleJenjangChange = (lvl: 'SMP' | 'SMA') => {
    setStudentLevel(lvl);
    const lvlStudents = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.filter(s => s.level === lvl);
    const firstStudent = lvlStudents[0];
    if (firstStudent) {
      setSelectedStudentId(firstStudent.id);
      setStudentName(firstStudent.name);
      setStudentNis(firstStudent.nis);
      setStudentClassName(firstStudent.className);
      if (firstStudent.targetCampusId) {
        setSelectedCampusId(firstStudent.targetCampusId);
      }
    }
    const lvlTryouts = DEFAULT_LAB_TRYOUTS.filter(t => t.level === lvl);
    if (lvlTryouts.length > 0) {
      setSelectedTryoutId(lvlTryouts[lvlTryouts.length - 1].id);
    }
  };

  // Handle Student Selection: auto-sync name, NIS, class, target campus, and latest tryout
  const handleStudentSelect = (stuId: string) => {
    setSelectedStudentId(stuId);
    const matched = availableStudents.find(s => s.id === stuId);
    if (matched) {
      setStudentName(matched.name);
      setStudentNis(matched.nis);
      setStudentClassName(matched.className);
      if (matched.targetCampusId) {
        setSelectedCampusId(matched.targetCampusId);
      }
      // Find latest tryout for this student
      const studentResults = allStoredResults.filter(
        r => r.studentId === stuId && r.level === studentLevel
      );
      if (studentResults.length > 0) {
        const sorted = [...studentResults].sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setSelectedTryoutId(sorted[0].tryoutId);
      }
    }
  };

  // Handle Report Type Switcher presets
  const handleReportTypeChange = (type: PrintReportType) => {
    setReportType(type);
    if (type === 'JOURNAL') {
      setShowLetterhead(true);
      setShowStudentProfile(true);
      setShowSummaryBanner(false);
      setShowCharts(false);
      setShowDiagnosticRadar(false);
      setShowDiagnosticTrends(false);
      setShowDiagnosticStrengths(false);
      setShowMultiTryoutTable(false);
      setShowPassingGrade(false);
      setShowMaterialProgressBar(true);
      setShowJournal(true);
      setShowQuizSection(false);
      setShowRecommendations(true);
      setShowSignatures(true);
    } else if (type === 'TRYOUT') {
      setShowLetterhead(true);
      setShowStudentProfile(true);
      setShowSummaryBanner(true);
      setShowCharts(true);
      setShowDiagnosticRadar(true);
      setShowDiagnosticTrends(true);
      setShowDiagnosticStrengths(true);
      setShowMultiTryoutTable(true);
      setShowPassingGrade(true);
      setShowMaterialProgressBar(false);
      setShowJournal(false);
      setShowQuizSection(false);
      setShowRecommendations(true);
      setShowSignatures(true);
    } else if (type === 'TRYOUT_TABLE') {
      // Khusus Tabel Analisis Hasil Tryout Labschool (14 Kolom Standar PSB)
      setShowLetterhead(true);
      setShowStudentProfile(true);
      setShowSummaryBanner(true);
      setShowCharts(false);
      setShowDiagnosticRadar(false);
      setShowDiagnosticTrends(false);
      setShowDiagnosticStrengths(false);
      setShowMultiTryoutTable(true);
      setShowPassingGrade(false);
      setShowMaterialProgressBar(false);
      setShowJournal(false);
      setShowQuizSection(false);
      setShowRecommendations(true);
      setShowSignatures(true);
    } else if (type === 'QUIZ') {
      setShowLetterhead(true);
      setShowStudentProfile(true);
      setShowSummaryBanner(true);
      setShowCharts(false);
      setShowDiagnosticRadar(false);
      setShowDiagnosticTrends(false);
      setShowDiagnosticStrengths(false);
      setShowMultiTryoutTable(false);
      setShowPassingGrade(false);
      setShowMaterialProgressBar(false);
      setShowJournal(false);
      setShowQuizSection(true);
      setShowRecommendations(true);
      setShowSignatures(true);
    } else {
      setShowLetterhead(true);
      setShowStudentProfile(true);
      setShowSummaryBanner(true);
      setShowCharts(true);
      setShowDiagnosticRadar(true);
      setShowDiagnosticTrends(true);
      setShowDiagnosticStrengths(true);
      setShowMultiTryoutTable(true);
      setShowPassingGrade(true);
      setShowMaterialProgressBar(true);
      setShowJournal(true);
      setShowQuizSection(true);
      setShowRecommendations(true);
      setShowSignatures(true);
    }
  };

  // Quick Preset Handlers
  const handleSelectAllSections = () => {
    setShowLetterhead(true);
    setShowStudentProfile(true);
    setShowSummaryBanner(true);
    setShowCharts(true);
    setShowDiagnosticRadar(true);
    setShowDiagnosticTrends(true);
    setShowDiagnosticStrengths(true);
    setShowMultiTryoutTable(true);
    setShowPassingGrade(true);
    setShowMaterialProgressBar(true);
    setShowJournal(true);
    setShowQuizSection(true);
    setShowRecommendations(true);
    setShowSignatures(true);
  };

  const handleSelectTableOnly = () => {
    handleReportTypeChange('TRYOUT_TABLE');
  };

  const handleSelectDiagnosticOnly = () => {
    setShowLetterhead(true);
    setShowStudentProfile(true);
    setShowSummaryBanner(true);
    setShowCharts(false);
    setShowDiagnosticRadar(true);
    setShowDiagnosticTrends(true);
    setShowDiagnosticStrengths(true);
    setShowMultiTryoutTable(false);
    setShowPassingGrade(false);
    setShowMaterialProgressBar(false);
    setShowJournal(false);
    setShowQuizSection(false);
    setShowRecommendations(true);
    setShowSignatures(true);
  };

  const handleSelectTryoutAndCampusOnly = () => {
    setShowLetterhead(true);
    setShowStudentProfile(true);
    setShowSummaryBanner(true);
    setShowCharts(true);
    setShowDiagnosticRadar(true);
    setShowDiagnosticTrends(false);
    setShowDiagnosticStrengths(true);
    setShowMultiTryoutTable(true);
    setShowPassingGrade(true);
    setShowMaterialProgressBar(false);
    setShowJournal(false);
    setShowQuizSection(false);
    setShowRecommendations(true);
    setShowSignatures(true);
  };

  const handleSelectJournalOnly = () => {
    handleReportTypeChange('JOURNAL');
  };

  // Selected Target Campus & Passing Grade
  const selectedCampus = useMemo(() => {
    return campuses.find(c => c.id === selectedCampusId) || campuses[1];
  }, [campuses, selectedCampusId]);

  const targetPg = studentLevel === 'SMA' ? selectedCampus.passingGradeSma : selectedCampus.passingGradeSmp;

  // Sorted Campuses with Target Campus as 1st item
  const sortedCampuses = useMemo(() => {
    return [...campuses].sort((a, b) => {
      const aIsTarget = a.id === selectedCampus.id;
      const bIsTarget = b.id === selectedCampus.id;
      if (aIsTarget && !bIsTarget) return -1;
      if (!aIsTarget && bIsTarget) return 1;
      return 0;
    });
  }, [campuses, selectedCampus]);

  const getCampusColor = (id: string, name: string) => {
    const n = name.toLowerCase();
    if (id === 'camp-kebayoran' || n.includes('kebayoran')) return '#8b5cf6';
    if (id === 'camp-rawamangun' || n.includes('rawamangun')) return '#f43f5e';
    if (id === 'camp-cibubur' || n.includes('cibubur')) return '#f59e0b';
    if (id === 'camp-grand-wisata' || n.includes('grand wisata')) return '#10b981';
    if (id === 'camp-cirebon' || n.includes('cirebon')) return '#06b6d4';
    return '#3b82f6';
  };

  // Find or generate Tryout Result for (selectedStudentId, selectedTryoutId)
  const currentTryoutResult: StudentTryoutResult = useMemo(() => {
    const matched = allStoredResults.find(
      r => r.tryoutId === selectedTryoutId &&
           r.level === studentLevel &&
           (r.studentId === selectedStudentId || r.studentName.toLowerCase() === studentName.toLowerCase())
    );

    if (matched) {
      return {
        ...matched,
        studentName: studentName || matched.studentName,
        studentNis: studentNis || matched.studentNis,
        level: studentLevel,
        targetCampusId: selectedCampus.id,
        targetCampusName: selectedCampus.name
      };
    }

    // Synthesize consistent result matching this student's latest score
    const studentProfile = availableStudents.find(s => s.id === selectedStudentId);
    const baseScore = studentProfile ? studentProfile.latestScore : (studentLevel === 'SMA' ? 92.5 : 90.0);
    const toItem = availableTryouts.find(t => t.id === selectedTryoutId) || availableTryouts[0];

    const pkScore = Math.min(100, Math.max(60, +(baseScore + 1.5).toFixed(1)));
    const kvScore = Math.min(100, Math.max(60, +(baseScore - 0.5).toFixed(1)));
    const pmScore = Math.min(100, Math.max(60, +(baseScore + 0.8).toFixed(1)));
    const kaScore = Math.min(100, Math.max(60, +(baseScore - 1.2).toFixed(1)));
    const skScore = Math.min(100, Math.max(60, +(baseScore + 0.4).toFixed(1)));

    return {
      id: `str-syn-${selectedStudentId}-${toItem?.id || 'to1'}`,
      tryoutId: toItem?.id || 'to-lab-sma-2',
      tryoutTitle: toItem?.title || `Tryout Akbar PSB ${studentLevel} Labschool 2026`,
      level: studentLevel,
      studentId: selectedStudentId,
      studentName: studentName,
      studentNis: studentNis,
      studentClass: studentClassName,
      targetCampusId: selectedCampus.id,
      targetCampusName: selectedCampus.name,
      totalScore: baseScore,
      rank: Math.max(1, Math.round((100 - baseScore) * 1.6)),
      totalParticipants: toItem?.totalParticipants || (studentLevel === 'SMA' ? 620 : 450),
      percentile: +(100 - (12 / 620) * 100).toFixed(1),
      durationMinutes: studentLevel === 'SMA' ? 105 : 95,
      submittedAt: toItem?.date ? `${toItem.date} 14:00` : '2026-02-15 14:00',
      subtestScores: [
        { code: 'PK', name: 'Pengetahuan Kuantitatif', score: pkScore, maxScore: 100, correctCount: Math.round(25 * (pkScore / 100)), totalQuestions: 25, accuracy: pkScore, status: pkScore >= 85 ? 'Tinggi' : 'Sedang', color: '#f59e0b' },
        { code: 'KV', name: 'Kemampuan Verbal (Indo & Ing)', score: kvScore, maxScore: 100, correctCount: Math.round(25 * (kvScore / 100)), totalQuestions: 25, accuracy: kvScore, status: kvScore >= 85 ? 'Tinggi' : 'Sedang', color: '#3b82f6' },
        { code: 'PM', name: 'Penalaran Matematika & Literasi', score: pmScore, maxScore: 100, correctCount: Math.round(20 * (pmScore / 100)), totalQuestions: 20, accuracy: pmScore, status: pmScore >= 85 ? 'Tinggi' : 'Sedang', color: '#10b981' },
        { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: kaScore, maxScore: 100, correctCount: Math.round(30 * (kaScore / 100)), totalQuestions: 30, accuracy: kaScore, status: kaScore >= 85 ? 'Tinggi' : 'Sedang', color: '#8b5cf6' },
        { code: 'SK', name: 'Survei Karakter (SK)', score: skScore, maxScore: 100, correctCount: Math.round(20 * (skScore / 100)), totalQuestions: 20, accuracy: skScore, status: skScore >= 85 ? 'Tinggi' : 'Sedang', color: '#ec4899' }
      ],
      recommendationNotes: `Performa ${studentName} menunjukkan tingkat pemahaman konsep yang sangat solid (${baseScore >= targetPg ? 'MEMENUHI' : 'MENDEKATI'} target Passing Grade ${selectedCampus.name}). Disarankan fokus mempertahankan ketelitian eliminasi waktu dan penguasaan soal HOTS.`,
      strengths: studentLevel === 'SMA'
        ? ['Aljabar & Kuantitatif Cepat (PK)', 'Literasi Bahasa Indonesia', 'Survei Karakter & Integritas Tinggi']
        : ['Aritmatika Sosial Dasar', 'Analogi Verbal', 'Survei Karakter & Profil Pelajar'],
      weaknesses: studentLevel === 'SMA'
        ? ['Termodinamika & Kinematika Fisika (KA)', 'Analogi Padanan Kata Kompleks']
        : ['Soal Cerita Bangun Datar Gabungan', 'Istilah Biologi Ekosistem']
    };
  }, [allStoredResults, selectedTryoutId, studentLevel, selectedStudentId, studentName, studentNis, studentClassName, selectedCampus, availableStudents, availableTryouts, targetPg]);

  // All tryout results for this specific student in Section II (Standar PSB Labschool 14 Kolom)
  // Menampilkan 5 Tryout yang sudah dilaksanakan lengkap dengan Nama & Tgl
  const studentMultiTryoutRows: TryoutMultiColumnAnalysisRow[] = useMemo(() => {
    const relevantTryouts = availableTryouts.slice(0, 5); // 5 Tryout Resmi
    const studentResults = allStoredResults.filter(
      r => (r.studentId === selectedStudentId || r.studentName.toLowerCase().includes(studentName.toLowerCase())) &&
           r.level === studentLevel
    );

    return relevantTryouts.map((toItem, idx) => {
      // Find matching stored tryout result
      const matched = studentResults.find(
        r => r.tryoutId === toItem.id ||
             r.id === toItem.id ||
             r.tryoutTitle.toLowerCase().includes(`seri ${idx + 1}`)
      );

      if (matched) {
        const computed = computeTryoutMultiColumnRow(matched, targetPg);
        return {
          ...computed,
          tryoutTitle: matched.tryoutTitle || toItem.title
        };
      }

      // If not explicitly stored, synthesize realistic progressive result for this series
      const baseScore = currentTryoutResult.totalScore;
      const progressDiff = (relevantTryouts.length - 1 - idx) * 1.8;
      const score = Math.min(99.0, Math.max(65.0, +(baseScore - progressDiff).toFixed(1)));
      
      const syntheticRes: StudentTryoutResult = {
        ...currentTryoutResult,
        id: `syn-${selectedStudentId}-${toItem.id}`,
        tryoutId: toItem.id,
        tryoutTitle: toItem.title,
        level: studentLevel,
        studentId: selectedStudentId,
        studentName: studentName,
        studentNis: studentNis,
        studentClass: studentClassName,
        targetCampusId: selectedCampus.id,
        targetCampusName: selectedCampus.name,
        totalScore: score,
        rank: Math.max(1, Math.round((100 - score) * 1.5 + (idx === relevantTryouts.length - 1 ? 2 : 5))),
        totalParticipants: toItem.totalParticipants,
        percentile: +(100 - (10 / toItem.totalParticipants) * 100).toFixed(1),
        durationMinutes: studentLevel === 'SMA' ? 105 - idx * 2 : 95 - idx * 2,
        submittedAt: `${toItem.date} 14:00`,
        subtestScores: [
          { code: 'PK', name: 'Pengetahuan Kuantitatif', score: Math.min(100, +(score + 1.2).toFixed(1)), maxScore: 100, correctCount: Math.round(25 * (score / 100)), totalQuestions: 25, accuracy: score, status: score >= 85 ? 'Tinggi' : 'Sedang', color: '#f59e0b' },
          { code: 'KV', name: 'Kemampuan Verbal (Indo & Ing)', score: Math.min(100, +(score - 0.8).toFixed(1)), maxScore: 100, correctCount: Math.round(25 * (score / 100)), totalQuestions: 25, accuracy: score, status: score >= 85 ? 'Tinggi' : 'Sedang', color: '#3b82f6' },
          { code: 'PM', name: 'Penalaran Matematika & Literasi', score: Math.min(100, +(score + 0.6).toFixed(1)), maxScore: 100, correctCount: Math.round(20 * (score / 100)), totalQuestions: 20, accuracy: score, status: score >= 85 ? 'Tinggi' : 'Sedang', color: '#10b981' },
          { code: 'KA', name: 'Kemampuan Akademik (Sains & IPS)', score: Math.min(100, +(score - 1.4).toFixed(1)), maxScore: 100, correctCount: Math.round(30 * (score / 100)), totalQuestions: 30, accuracy: score, status: score >= 85 ? 'Tinggi' : 'Sedang', color: '#8b5cf6' },
          { code: 'SK', name: 'Survei Karakter (SK)', score: Math.min(100, +(score + 0.4).toFixed(1)), maxScore: 100, correctCount: Math.round(20 * (score / 100)), totalQuestions: 20, accuracy: score, status: score >= 85 ? 'Tinggi' : 'Sedang', color: '#ec4899' }
        ]
      };
      return computeTryoutMultiColumnRow(syntheticRes, targetPg);
    });
  }, [allStoredResults, selectedStudentId, studentName, studentNis, studentClassName, studentLevel, selectedCampus, targetPg, availableTryouts, currentTryoutResult]);

  // All students' analysis rows for the selected tryout (Rekapitulasi 14 Kolom Standar PSB Labschool)
  const classTryoutRows: TryoutMultiColumnAnalysisRow[] = useMemo(() => {
    const tryoutResults = allStoredResults.filter(
      r => r.tryoutId === selectedTryoutId && r.level === studentLevel
    );
    if (tryoutResults.length > 0) {
      return tryoutResults
        .map(r => computeTryoutMultiColumnRow(r, targetPg))
        .sort((a, b) => b.skorAkhir - a.skorAkhir);
    }
    const genResults = generateComprehensiveStudentTryoutResults();
    const filtered = genResults.filter(
      r => (r.tryoutId === selectedTryoutId || !selectedTryoutId) && r.level === studentLevel
    );
    return filtered
      .map(r => computeTryoutMultiColumnRow(r, targetPg))
      .sort((a, b) => b.skorAkhir - a.skorAkhir);
  }, [allStoredResults, selectedTryoutId, studentLevel, targetPg]);

  // Section IV: Learning Journal Data for this Jenjang
  const storedJournals: LearningJournalMeeting[] = useMemo(() => loadStoredJournals(), [isOpen]);
  const activeLevelJournals = useMemo(() => {
    return storedJournals.filter(j => j.level === studentLevel);
  }, [storedJournals, studentLevel]);

  const journalStats = useMemo(() => {
    const total = activeLevelJournals.length;
    const sudah = activeLevelJournals.filter(j => (j.progress || 'SUDAH') === 'SUDAH').length;
    const sedang = activeLevelJournals.filter(j => j.progress === 'SEDANG').length;
    const belum = activeLevelJournals.filter(j => j.progress === 'BELUM').length;
    const hadir = activeLevelJournals.filter(j => j.attendanceStatus === 'HADIR').length;
    const avgRating = total > 0
      ? (activeLevelJournals.reduce((acc, curr) => acc + curr.comprehensionRating, 0) / total).toFixed(1)
      : '4.8';
    const attendancePct = total > 0 ? Math.round((hadir / total) * 100) : 100;
    return { total, sudah, sedang, belum, hadir, avgRating, attendancePct };
  }, [activeLevelJournals]);

  // Section IV.B: Quiz Leaderboard for this Jenjang
  const activeQuizLeaderboard = useMemo(() => {
    return DEFAULT_QUIZ_LEADERBOARD.filter(l => l.level === studentLevel);
  }, [studentLevel]);

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const documentNumber = `BSA/LAB-RAPOR/${new Date().getFullYear()}/${studentLevel}/${studentNis.slice(-4) || '1088'}`;

  // Direct PDF Download Logic using html2canvas-pro & jsPDF (Full support for modern CSS & OKLCH colors)
  const handleDownloadPdf = async () => {
    const element = document.getElementById('labschool-printable-document');
    if (!element) return;

    setIsExportingPdf(true);
    if (onShowToast) {
      onShowToast('Sedang mengompilasi lembar laporan ke format PDF resmi...', 'info');
    }

    try {
      const filename = `Rapor-Labschool-${studentName.replace(/\s+/g, '_')}-${studentLevel}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Render the DOM element cleanly using html2canvas-pro which natively parses modern oklch/lab colors
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: 0
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Gagal merender canvas dokumen laporan.');
      }

      // Initialize jsPDF (A4 portrait: 210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const imgWidth = pageWidth - (margin * 2); // 194mm printable width
      const maxPageContentHeightMm = pageHeight - (margin * 2); // 281mm printable height per page

      const pxPerMm = canvas.width / imgWidth;
      const pageHeightPx = Math.floor(maxPageContentHeightMm * pxPerMm);
      const totalCanvasHeight = canvas.height;

      if (totalCanvasHeight <= pageHeightPx) {
        // Fits in a single page
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const renderedHeightMm = totalCanvasHeight / pxPerMm;
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, renderedHeightMm);
      } else {
        // Multi-page slicing
        let currentY = 0;
        let pageCount = 0;

        while (currentY < totalCanvasHeight) {
          if (pageCount > 0) {
            pdf.addPage();
          }

          const sliceHeightPx = Math.min(pageHeightPx, totalCanvasHeight - currentY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeightPx;

          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              currentY,
              canvas.width,
              sliceHeightPx,
              0,
              0,
              canvas.width,
              sliceHeightPx
            );

            const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
            const sliceHeightMm = sliceHeightPx / pxPerMm;
            pdf.addImage(sliceImgData, 'JPEG', margin, margin, imgWidth, sliceHeightMm);
          }

          currentY += sliceHeightPx;
          pageCount++;
        }
      }

      pdf.save(filename);

      if (onShowToast) {
        onShowToast('File PDF Laporan Labschool berhasil diunduh ke perangkat Anda!', 'success');
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
      if (onShowToast) {
        onShowToast('Gagal memproses PDF otomatis, Anda dapat menggunakan opsi Print Browser.', 'error');
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
    if (onShowToast) {
      onShowToast('Membuka jendela cetak printer...', 'info');
    }
  };

  // Copy Summary Text
  const handleCopyText = () => {
    const summaryText = `*BRAIN SPACE ACADEMY - LAPORAN EVALUASI RESMI SELEKSI MASUK LABSCHOOL*
No. Dokumen: ${documentNumber}
Lembaga: BRAIN SPACE ACADEMY (Pusat Akselerasi Masuk Labschool)
Tanggal: ${currentDateFormatted}
--------------------------------------------------
*IDENTITAS SISWA*
• Nama Siswa: ${studentName}
• NIS / No. Peserta: ${studentNis}
• Jenjang & Kelas: ${studentLevel} Labschool (${studentClassName})
• Target Kampus: ${selectedCampus.name} (Passing Grade: ${targetPg.toFixed(1)} Poin)

*HASIL EVALUASI 5 SUBTEST RESMI*
1. Pengetahuan Kuantitatif (PK): ${currentTryoutResult.subtestScores[0]?.score.toFixed(1)}%
2. Kemampuan Verbal (KV): ${currentTryoutResult.subtestScores[1]?.score.toFixed(1)}%
3. Penalaran Matematika (PM): ${currentTryoutResult.subtestScores[2]?.score.toFixed(1)}%
4. Kemampuan Akademik (KA): ${currentTryoutResult.subtestScores[3]?.score.toFixed(1)}%
5. Survei Karakter (SK): ${currentTryoutResult.subtestScores[4]?.score.toFixed(1)}%
--------------------------------------------------
*SKOR AKHIR LRI:* ${currentTryoutResult.totalScore.toFixed(1)} / 100.0 Poin
*STATUS PREDIKSI:* ${currentTryoutResult.totalScore >= targetPg ? 'LOLOS (MEMENUHI PASSING GRADE)' : 'KOMPETITIF (PERLU PENGUATAN)'}
*TARGET KAMPUS:* ${selectedCampus.name} (Passing Grade: ${targetPg.toFixed(1)} Poin)
--------------------------------------------------
*Catatan & Rekomendasi Master Tutor:*
"${currentTryoutResult.recommendationNotes}"
Tutor Pembimbing: ${tutorName}
Direktur Akademik: Dr. Hendra Wijaya, M.Pd.
Brain Space Academy - Graha BSA Rawamangun Jakarta`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    if (onShowToast) {
      onShowToast('Teks ringkasan laporan Brain Space Academy berhasil disalin!', 'success');
    }
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Header (Screen Only) */}
        <div className="no-print p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Cetak & Ekspor Rapor Labschool Resmi
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Format A4 Standar PSB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih filter jenjang & siswa secara terintegrasi, atur bagian laporan, cetak printer atau unduh PDF langsung.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Controls & Live Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ========================================================================= */}
          {/* FILTER CONTROL BAR: FORM CEKLIS OPSI BAGIAN CETAK                          */}
          {/* Untuk Admin: Dilengkapi Sinkronisasi Jenjang, Siswa, & Format              */}
          {/* Untuk Halaman Siswa: Menampilkan Form Ceklis Bagian Laporan Saja           */}
          {/* ========================================================================= */}
          <div className="no-print p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
            
            {/* Header & Role Indicator */}
            {user?.role === 'admin' ? (
              <>
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span>Pengaturan & Sinkronisasi Filter Cetak (Admin):</span>
                  </div>
                  <span className="text-[11px] text-blue-400 font-mono">
                    Data Terpilih: <strong>{studentName}</strong> ({studentLevel}-LABS)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* 1. Filter Jenjang */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      1. Pilih Jenjang:
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleJenjangChange('SMP')}
                        className={`py-1.5 px-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                          studentLevel === 'SMP'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        SMP-LABS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJenjangChange('SMA')}
                        className={`py-1.5 px-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                          studentLevel === 'SMA'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        SMA-LABS
                      </button>
                    </div>
                  </div>

                  {/* 2. Filter Siswa (Sesuai Jenjang) */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      2. Pilih Siswa ({availableStudents.length}):
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      {availableStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Skor: {s.latestScore})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Jenis / Format Laporan */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      3. Format Rapor:
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => handleReportTypeChange(e.target.value as PrintReportType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL">Rapor Lengkap (Semua I-VI)</option>
                      <option value="TRYOUT">Analisis Tryout & Kampus (Grafik & Tabel)</option>
                      <option value="TRYOUT_TABLE">Tabel Analisis Hasil Tryout (14 Kolom Standar PSB)</option>
                      <option value="QUIZ">Leaderboard & Kuis Harian</option>
                      <option value="JOURNAL">Jurnal Belajar & Presensi</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Filter Opsi Cetak Laporan:</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Siswa: <strong>{studentName}</strong> ({studentLevel}-LABS)
                </span>
              </div>
            )}

            {/* Granular Sequential Section Print Options (Form Ceklis I, II, III, IV, IV.B, V, VI) */}
            <div className={`space-y-2.5 ${user?.role === 'admin' ? 'pt-3 border-t border-slate-800' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Form Ceklis Opsi Bagian yang Dicetak:</span>
                </span>
                
                {/* Presets */}
                <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAllSections}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectTableOnly}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-700/60 font-bold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <TableProperties className="w-3 h-3 text-amber-400" />
                    <span>📋 Tabel TO Saja</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectDiagnosticOnly}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-bold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3 text-indigo-400" />
                    <span>★ Diagnosis Saja</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectTryoutAndCampusOnly}
                    className="px-2.5 py-1 rounded-lg bg-blue-950/90 hover:bg-blue-900 text-blue-300 border border-blue-700/60 font-bold cursor-pointer transition-colors"
                  >
                    Tryout + Kampus
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectJournalOnly}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold cursor-pointer transition-colors"
                  >
                    Jurnal Saja
                  </button>
                </div>
              </div>

              {/* Sub-filter if Table TO is enabled */}
              {showMultiTryoutTable && (
                <div className="p-2.5 bg-slate-900/95 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cakupan Data Tabel Analisis (14 Kolom):</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTryoutTableScope('STUDENT_MULTI')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        tryoutTableScope === 'STUDENT_MULTI'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      👤 Riwayat Siswa ({studentName.split(' ')[0]})
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => setTryoutTableScope('ALL_STUDENTS')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                          tryoutTableScope === 'ALL_STUDENTS'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        👥 Rekapitulasi Angkatan ({classTryoutRows.length} Siswa)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Toggles Grid (Form Ceklis) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-[11px]">
                
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showLetterhead}
                    onChange={(e) => setShowLetterhead(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">Kop Lembaga BSA</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showStudentProfile}
                    onChange={(e) => setShowStudentProfile(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">Identitas Siswa</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showSummaryBanner}
                    onChange={(e) => setShowSummaryBanner(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">Skor LRI & Prediksi</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-blue-800/60 hover:border-blue-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showCharts}
                    onChange={(e) => setShowCharts(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-blue-200 font-bold">📊 I. Diagram 5 Subtes</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-indigo-800/60 hover:border-indigo-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showDiagnosticRadar}
                    onChange={(e) => setShowDiagnosticRadar(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-indigo-400 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-indigo-200 font-semibold">🕸️ I.A Radar Diagnosis</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-indigo-800/60 hover:border-indigo-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showDiagnosticTrends}
                    onChange={(e) => setShowDiagnosticTrends(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-indigo-400 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-indigo-200 font-semibold">📈 I.B Tren Skor TO</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-indigo-800/60 hover:border-indigo-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showDiagnosticStrengths}
                    onChange={(e) => setShowDiagnosticStrengths(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-indigo-400 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-indigo-200 font-semibold">🎯 I.C Matriks Materi</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-amber-800/60 hover:border-amber-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showMultiTryoutTable}
                    onChange={(e) => setShowMultiTryoutTable(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-amber-200 font-bold">📋 II. Tabel Multi-TO 14 Kolom</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showPassingGrade}
                    onChange={(e) => setShowPassingGrade(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">🏫 III. Komparasi 5 Kampus</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-emerald-800/60 hover:border-emerald-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showMaterialProgressBar}
                    onChange={(e) => setShowMaterialProgressBar(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-emerald-400 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-emerald-200 font-bold">📘 IV. Grafik Progres Silabus</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showJournal}
                    onChange={(e) => setShowJournal(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">IV.A Jurnal Belajar</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showQuizSection}
                    onChange={(e) => setShowQuizSection(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">IV.B Kuis & Leaderboard</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showRecommendations}
                    onChange={(e) => setShowRecommendations(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">V. Catatan Tutor</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={showSignatures}
                    onChange={(e) => setShowSignatures(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="truncate text-slate-300 font-medium">VI. Tanda Tangan Resmi</span>
                </label>

              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LIVE PRINTABLE DOCUMENT (TARGET FOR DIRECT PDF EXPORT & BROWSER PRINT)     */}
          {/* ========================================================================= */}
          <div className="bg-slate-950 p-2 sm:p-4 rounded-2xl flex justify-center">
            <div
              id="labschool-printable-document"
              ref={reportRef}
              className="w-full max-w-3xl bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-2xl border border-slate-200 font-sans space-y-6 text-sm"
              style={{ minHeight: '800px' }}
            >
              
              {/* 1. KOP SURAT RESMI BRAIN SPACE ACADEMY */}
              {showLetterhead && (
                <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1 print-avoid-break">
                  <div className="flex items-center justify-between gap-4">
                    {/* BSA Crest Logo */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white flex flex-col items-center justify-center border-2 border-amber-400 shrink-0 shadow-sm">
                      <span className="font-black text-lg tracking-wider text-amber-300">BSA</span>
                      <span className="text-[7px] font-bold tracking-widest text-slate-300 uppercase">ACADEMY</span>
                    </div>

                    {/* Institution Title & Details */}
                    <div className="flex-1 text-center">
                      <h2 className="text-xs font-black tracking-widest text-amber-600 uppercase">
                        LEMBAGA BIMBINGAN BELAJAR & AKSELERASI KHUSUS
                      </h2>
                      <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight uppercase">
                        BRAIN SPACE ACADEMY
                      </h1>
                      <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                        Pusat Persiapan & Pemetaan Seleksi Masuk PSB Labschool Indonesia
                      </p>
                      <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                        Rawamangun • Kebayoran • Cibubur • Grand Wisata • Cirebon
                      </p>
                      <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                        Graha BSA, Jl. Pemuda No. 88, Rawamangun, Jakarta Timur | Hotline & WA: 0812-9988-7766 • Telp: (021) 8899-7722
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        Website: www.brainspaceacademy.id • Email: info@brainspaceacademy.id
                      </p>
                    </div>

                    {/* Official Badge */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex flex-col items-center justify-center border-2 border-blue-950 shrink-0 text-center leading-tight shadow-sm">
                      <span className="font-black text-xs uppercase tracking-tight">PSB 2026</span>
                      <span className="text-[7px] font-extrabold uppercase mt-0.5 bg-blue-950 text-amber-300 px-1 py-0.2 rounded">
                        {studentLevel} LABS
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. REPORT TITLE & METADATA */}
              <div className="text-center space-y-1 print-avoid-break">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide underline underline-offset-4">
                  {reportType === 'JOURNAL'
                    ? `RAPOR JURNAL PEMBELAJARAN & RIWAYAT SESI INTENSIF SELEKSI ${studentLevel} LABSCHOOL 2026`
                    : reportType === 'QUIZ'
                    ? `RAPOR EVALUASI & LEADERBOARD QUIZ HARIAN SELEKSI ${studentLevel} LABSCHOOL 2026`
                    : reportType === 'TRYOUT'
                    ? `RAPOR EVALUASI & PREDIKSI KELULUSAN TRYOUT SELEKSI ${studentLevel} LABSCHOOL 2026`
                    : reportType === 'TRYOUT_TABLE'
                    ? `TABEL ANALISIS HASIL TRYOUT SELEKSI ${studentLevel} LABSCHOOL 2026`
                    : `RAPOR EVALUASI KOMPREHENSIF TRYOUT & JURNAL BELAJAR SELEKSI ${studentLevel} LABSCHOOL 2026`}
                </h3>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-mono">
                  <span>Nomor Dokumen: <strong>{documentNumber}</strong></span>
                  <span>•</span>
                  <span>Tanggal Terbit: <strong>{currentDateFormatted}</strong></span>
                  {reportType === 'JOURNAL' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">Total Sesi: {journalStats.total} Pertemuan</span>
                    </>
                  )}
                  {reportType === 'TRYOUT_TABLE' && (
                    <>
                      <span>•</span>
                      <span className="text-blue-700 font-bold">Format 14 Kolom Standar PSB</span>
                    </>
                  )}
                </div>
              </div>

              {/* 3. STUDENT IDENTITY CARD */}
              {showStudentProfile && (
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs grid grid-cols-2 gap-x-6 gap-y-1.5 print-avoid-break">
                  <div>
                    <span className="text-slate-500">Nama Lengkap Siswa:</span>
                    <strong className="block text-slate-900 font-bold text-sm">{studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Jenjang & Kampus:</span>
                    <strong className="block text-blue-950 font-bold">
                      {studentLevel} - {selectedCampus.name} ({selectedCampus.loc})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Nomor Induk Siswa (NIS / No. Peserta):</span>
                    <strong className="block text-slate-800 font-mono font-bold">{studentNis}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Standar Passing Grade Target:</span>
                    <strong className="block text-amber-700 font-mono font-bold">{targetPg.toFixed(1)} Poin</strong>
                  </div>
                </div>
              )}

              {/* 4. OVERALL SCORE & PREDICTION BANNER */}
              {showSummaryBanner && (
                <div className="border-2 border-emerald-600 bg-emerald-50 rounded-lg p-3 flex items-center justify-between print-avoid-break">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
                      Indeks Kesiapan Labschool (LRI)
                    </span>
                    <div className="text-2xl font-black text-emerald-950 font-mono">
                      {currentTryoutResult.totalScore.toFixed(1)} <span className="text-sm font-normal text-slate-600">/ 100.0</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded uppercase tracking-wide">
                      STATUS: {currentTryoutResult.totalScore >= targetPg ? 'AMAN / MEMENUHI PASSING GRADE' : 'KOMPETITIF / PERLU PENGUATAN'}
                    </span>
                    <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                      Target Pilihan: {selectedCampus.name} (Passing Grade: {targetPg.toFixed(1)} Poin)
                    </p>
                  </div>
                </div>
              )}

              {/* 5. SECTION I: GRAFIK DIAGRAM BATANG 5 SUBTES VS PASSING GRADE */}
              {showCharts && (reportType === 'ALL' || reportType === 'TRYOUT') && (
                <div className="space-y-3 print-avoid-break bg-slate-50/70 border border-slate-300 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-blue-700" />
                      <span>I. Grafik Diagram Performa & Capaian 5 Subtes (vs Passing Grade {targetPg})</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      Garis Ambang PG: {targetPg} Poin
                    </span>
                  </div>

                  {/* Subtests Visual Performance Bars */}
                  <div className="space-y-2.5 pt-1">
                    {currentTryoutResult.subtestScores.map((sub) => {
                      const isAbovePg = sub.score >= targetPg;
                      const scorePercent = Math.min(100, Math.max(0, sub.score));
                      const pgPercent = Math.min(100, Math.max(0, targetPg));
                      const subDisplayName = sub.code === 'SK' ? 'Survei Karakter' : sub.name;

                      return (
                        <div key={sub.code} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-6 h-5 rounded bg-blue-900 text-white font-mono font-black text-[10px] flex items-center justify-center">
                                {sub.code}
                              </span>
                              <strong className="text-slate-900 font-bold">{subDisplayName}</strong>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              <span className="text-slate-600">
                                {sub.correctCount}/{sub.totalQuestions} Soal ({sub.accuracy}%)
                              </span>
                              <strong className={`font-black px-1.5 py-0.2 rounded text-[11px] ${
                                isAbovePg ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {sub.score.toFixed(1)} / 100
                              </strong>
                            </div>
                          </div>

                          {/* Graphical Visual Track with Passing Grade Marker */}
                          <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isAbovePg
                                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600'
                                  : 'bg-gradient-to-r from-blue-500 to-amber-500'
                              }`}
                              style={{ width: `${scorePercent}%` }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-rose-600 z-10"
                              style={{ left: `${pgPercent}%` }}
                              title={`Passing Grade Target: ${targetPg}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Chart Legend & Keterangan Subtes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-2 rounded bg-emerald-600 inline-block"></span>
                          <span>Skor di Atas PG</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-2 rounded bg-amber-500 inline-block"></span>
                          <span>Skor di Bawah PG</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-3 bg-rose-600 inline-block"></span>
                          <span>Target Passing Grade ({targetPg})</span>
                        </span>
                      </div>
                      <span className="font-mono font-bold text-blue-950">
                        Rata-rata 5 Subtes: {currentTryoutResult.totalScore.toFixed(1)} ({currentTryoutResult.totalScore >= targetPg ? 'MEMENUHI TARGET' : 'PERLU PENINGKATAN'})
                      </span>
                    </div>

                    <div className="bg-slate-100 p-1.5 rounded border border-slate-200 text-[9.5px] text-slate-700 leading-snug flex flex-wrap gap-x-2.5 gap-y-0.5 items-center">
                      <span><strong>Keterangan Singkatan:</strong></span>
                      <span><strong>PK</strong>: Pengetahuan Kuantitatif</span>
                      <span>•</span>
                      <span><strong>KV</strong>: Kemampuan Verbal</span>
                      <span>•</span>
                      <span><strong>PM</strong>: Penalaran Matematika</span>
                      <span>•</span>
                      <span><strong>KA</strong>: Kemampuan Akademik</span>
                      <span>•</span>
                      <span><strong>SK</strong>: Survei Karakter</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5B. DIAGNOSTIC RADAR & MULTI-SERIES TREND CHARTS & STRENGTH/WEAKNESS MATRIX */}
              {(showDiagnosticRadar || showDiagnosticTrends || showDiagnosticStrengths) && (reportType === 'ALL' || reportType === 'TRYOUT') && (
                <div className="space-y-3.5 print-avoid-break bg-indigo-50/40 border border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                    <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      <span>I. Grafik Diagnosis Kompetensi & Pemetaan Materi PSB Labschool</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                      Evaluasi Diagnostik Terpadu
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diagnostic Radar Chart (SVG) */}
                    {showDiagnosticRadar && (
                      <div className="bg-white border border-indigo-100 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Radar Keseimbangan 5 Subtes vs PG</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">Skala 0-100 Poin</span>
                        </div>

                        {/* High-Precision SVG Radar */}
                        <div className="flex justify-center py-1">
                          <svg viewBox="0 0 250 210" className="w-full max-w-[240px] h-auto overflow-visible">
                            {/* Grid Pentagons (20%, 40%, 60%, 80%, 100%) */}
                            {[20, 40, 60, 80, 100].map((level) => {
                              const r = (level / 100) * 68;
                              const points = [0, 1, 2, 3, 4].map((i) => {
                                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                                return `${125 + r * Math.cos(angle)},${105 + r * Math.sin(angle)}`;
                              }).join(' ');
                              return (
                                <polygon
                                  key={level}
                                  points={points}
                                  fill="none"
                                  stroke="#cbd5e1"
                                  strokeWidth="0.7"
                                  strokeDasharray={level === 100 ? 'none' : '2,2'}
                                />
                              );
                            })}

                            {/* Radial Axis Lines & Labels */}
                            {[
                              { code: 'PK', name: 'PK', score: currentTryoutResult.subtestScores[0]?.score || 92 },
                              { code: 'KV', name: 'KV', score: currentTryoutResult.subtestScores[1]?.score || 87.5 },
                              { code: 'PM', name: 'PM', score: currentTryoutResult.subtestScores[2]?.score || 85 },
                              { code: 'KA', name: 'KA', score: currentTryoutResult.subtestScores[3]?.score || 88 },
                              { code: 'SK', name: 'SK', score: currentTryoutResult.subtestScores[4]?.score || 90 },
                            ].map((sub, i) => {
                              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                              const x2 = 125 + 68 * Math.cos(angle);
                              const y2 = 105 + 68 * Math.sin(angle);
                              const labelX = 125 + 85 * Math.cos(angle);
                              const labelY = 105 + 85 * Math.sin(angle);

                              return (
                                <g key={sub.code}>
                                  <line x1="125" y1="105" x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="0.8" />
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-[9px] font-bold fill-slate-800 font-sans"
                                  >
                                    {sub.code} ({sub.score.toFixed(0)})
                                  </text>
                                </g>
                              );
                            })}

                            {/* Target Passing Grade Benchmark Polygon */}
                            {(() => {
                              const rPg = (targetPg / 100) * 68;
                              const pgPoints = [0, 1, 2, 3, 4].map((i) => {
                                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                                return `${125 + rPg * Math.cos(angle)},${105 + rPg * Math.sin(angle)}`;
                              }).join(' ');
                              return (
                                <polygon
                                  points={pgPoints}
                                  fill="#f59e0b"
                                  fillOpacity="0.12"
                                  stroke="#d97706"
                                  strokeWidth="1.2"
                                  strokeDasharray="3,2"
                                />
                              );
                            })()}

                            {/* Student Score Polygon */}
                            {(() => {
                              const studentScores = [
                                currentTryoutResult.subtestScores[0]?.score || 92,
                                currentTryoutResult.subtestScores[1]?.score || 87.5,
                                currentTryoutResult.subtestScores[2]?.score || 85,
                                currentTryoutResult.subtestScores[3]?.score || 88,
                                currentTryoutResult.subtestScores[4]?.score || 90,
                              ];
                              const studentPoints = studentScores.map((score, i) => {
                                const r = (Math.min(100, Math.max(0, score)) / 100) * 68;
                                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                                return `${125 + r * Math.cos(angle)},${105 + r * Math.sin(angle)}`;
                              }).join(' ');
                              return (
                                <>
                                  <polygon
                                    points={studentPoints}
                                    fill="#3b82f6"
                                    fillOpacity="0.3"
                                    stroke="#1d4ed8"
                                    strokeWidth="1.8"
                                  />
                                  {studentScores.map((score, i) => {
                                    const r = (Math.min(100, Math.max(0, score)) / 100) * 68;
                                    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                                    const cx = 125 + r * Math.cos(angle);
                                    const cy = 105 + r * Math.sin(angle);
                                    return (
                                      <circle
                                        key={i}
                                        cx={cx}
                                        cy={cy}
                                        r="3"
                                        fill="#1d4ed8"
                                        stroke="#ffffff"
                                        strokeWidth="1"
                                      />
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* Radar Legend */}
                        <div className="flex items-center justify-center gap-3 pt-1 text-[9px] border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
                            <span className="font-semibold text-slate-700">Skor Siswa</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block border border-dashed border-amber-600"></span>
                            <span className="font-semibold text-slate-700">Ambang PG ({targetPg})</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Multi-Series Tryout Trends (SVG Line Chart) */}
                    {showDiagnosticTrends && (
                      <div className="bg-white border border-indigo-100 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Grafik Tren Seri Tryout (Seri 1–{studentMultiTryoutRows.length})</span>
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700 font-bold">
                            Skor Terkini: {currentTryoutResult.totalScore.toFixed(1)}
                          </span>
                        </div>

                        {/* High-Precision SVG Line Chart */}
                        <div className="py-1 flex justify-center">
                          <svg viewBox="0 0 250 140" className="w-full max-w-[240px] h-auto overflow-visible">
                            {/* Horizontal Grid lines */}
                            {[60, 70, 80, 90, 100].map((scoreVal) => {
                              const y = 120 - (scoreVal - 50) * 1.8;
                              return (
                                <g key={scoreVal}>
                                  <line x1="28" y1={y} x2="240" y2={y} stroke="#e2e8f0" strokeWidth="0.6" strokeDasharray="2,2" />
                                  <text x="22" y={y + 3} textAnchor="end" className="text-[8px] fill-slate-400 font-mono">
                                    {scoreVal}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Passing Grade Target Line */}
                            {(() => {
                              const yPg = 120 - (targetPg - 50) * 1.8;
                              return (
                                <g>
                                  <line x1="28" y1={yPg} x2="240" y2={yPg} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,2" />
                                  <text x="240" y={yPg - 3} textAnchor="end" className="text-[7.5px] fill-amber-700 font-bold font-mono">
                                    PG: {targetPg}
                                  </text>
                                </g>
                              );
                            })()}

                            {/* Multi-Series Data Points */}
                            {(() => {
                              const totalCount = Math.max(1, studentMultiTryoutRows.length);
                              const xStep = totalCount > 1 ? (200 / (totalCount - 1)) : 0;
                              const seriesData = studentMultiTryoutRows.map((r, idx) => ({
                                label: `TO-${idx + 1}`,
                                score: r.skorAkhir,
                                x: 35 + idx * xStep
                              }));

                              const pointsStr = seriesData.map(d => `${d.x},${120 - (d.score - 50) * 1.8}`).join(' ');

                              return (
                                <>
                                  {/* Area fill */}
                                  <polygon
                                    points={`35,120 ${pointsStr} 235,120`}
                                    fill="#10b981"
                                    fillOpacity="0.12"
                                  />
                                  {/* Trajectory Polyline */}
                                  <polyline
                                    points={pointsStr}
                                    fill="none"
                                    stroke="#059669"
                                    strokeWidth="2"
                                  />
                                  {/* Points and Score Badges */}
                                  {seriesData.map((d, idx) => {
                                    const y = 120 - (d.score - 50) * 1.8;
                                    const isCurrent = idx === seriesData.length - 1;
                                    return (
                                      <g key={d.label}>
                                        <circle
                                          cx={d.x}
                                          cy={y}
                                          r={isCurrent ? '4' : '3'}
                                          fill={isCurrent ? '#047857' : '#10b981'}
                                          stroke="#ffffff"
                                          strokeWidth="1.2"
                                        />
                                        <text
                                          x={d.x}
                                          y={y - 6}
                                          textAnchor="middle"
                                          className={`text-[8px] font-mono font-bold ${isCurrent ? 'fill-emerald-950 font-black' : 'fill-slate-700'}`}
                                        >
                                          {d.score.toFixed(1)}
                                        </text>
                                        <text
                                          x={d.x}
                                          y="132"
                                          textAnchor="middle"
                                          className="text-[8px] fill-slate-500 font-semibold"
                                        >
                                          {d.label}
                                        </text>
                                      </g>
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* Trends Legend */}
                        <div className="flex items-center justify-between pt-1 text-[9px] border-t border-slate-100">
                          <span className="text-slate-600">Progresi Multi-Tryout {studentLevel} Labschool</span>
                          <span className="font-bold text-emerald-800">
                            Status: {currentTryoutResult.totalScore >= targetPg ? 'Di Atas Passing Grade' : 'Dalam Zona Kompetitif'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Strengths & Weaknesses Matrix */}
                  {showDiagnosticStrengths && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Keunggulan & Kekuatan Materi */}
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-emerald-900 flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Materi Unggulan & Penguasaan Tinggi (Kekuatan)</span>
                        </span>
                        <ul className="space-y-1 text-[10px] text-emerald-950">
                          {currentTryoutResult.strengths.map((str, sIdx) => (
                            <li key={sIdx} className="flex items-center gap-1.5 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                              <span>{str} (Akurasi &gt; 88%)</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Kelemahan & Prioritas Remedial */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Materi Prioritas Remedial (Fokus Latihan)</span>
                        </span>
                        <ul className="space-y-1 text-[10px] text-amber-950">
                          {currentTryoutResult.weaknesses.map((wk, wIdx) => (
                            <li key={wIdx} className="flex items-center gap-1.5 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                              <span>{wk} (Disarankan Drill Soal HOTS)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. SECTION II: TABEL ANALISIS HASIL MULTI-TRYOUT 14-KOLOM (STANDAR PSB LABSCHOOL) */}
              {showMultiTryoutTable && (reportType === 'ALL' || reportType === 'TRYOUT' || reportType === 'TRYOUT_TABLE') && (
                <div className="space-y-2 print-avoid-break">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-700" />
                      <span>
                        II. Tabel Analisis Hasil Tryout (14 Kolom Standar PSB Labschool)
                        {tryoutTableScope === 'ALL_STUDENTS' ? ' - Rekapitulasi Angkatan' : ' - Riwayat Siswa'}
                      </span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      {tryoutTableScope === 'ALL_STUDENTS' 
                        ? `Paket: ${availableTryouts.find(t => t.id === selectedTryoutId)?.title || 'Semua'} (${classTryoutRows.length} Siswa)`
                        : `Siswa: ${studentName} (${studentLevel}-LABS)`}
                    </span>
                  </div>

                  {tryoutTableScope === 'STUDENT_MULTI' ? (
                    /* A. Student Multi-Tryout History Table (14 Columns) */
                    <div className="space-y-1.5">
                      <table className="w-full text-left border-collapse border border-slate-300 text-[9.5px]">
                        <thead>
                          <tr className="bg-slate-800 text-white font-bold text-center">
                            <th rowSpan={2} className="p-1 border border-slate-400 min-w-[140px] bg-slate-900 text-white">Nama Tryout & Tgl TO</th>
                            <th rowSpan={2} className="p-1 border border-slate-400 w-9">Nilai PK</th>
                            <th colSpan={3} className="p-1 border border-slate-400 bg-indigo-900 text-indigo-100">Nilai KV (Verbal)</th>
                            <th colSpan={3} className="p-1 border border-slate-400 bg-cyan-900 text-cyan-100">Nilai PM (Membaca)</th>
                            <th colSpan={3} className="p-1 border border-slate-400 bg-emerald-900 text-emerald-100">Nilai KA (Akademik)</th>
                            <th rowSpan={2} className="p-1 border border-slate-400 w-9">Nilai SK</th>
                            <th rowSpan={2} className="p-1 border border-slate-400 bg-amber-600 text-white w-12">SKOR AKHIR</th>
                            <th rowSpan={2} className="p-1 border border-slate-400 w-18">Status Lulus</th>
                          </tr>
                          <tr className="bg-slate-100 text-slate-700 font-semibold text-[8.5px] text-center">
                            <th className="p-0.5 border border-slate-300">V.Bindo</th>
                            <th className="p-0.5 border border-slate-300">V.Bing</th>
                            <th className="p-0.5 border border-slate-300 bg-indigo-50 font-bold">Rata KV</th>
                            <th className="p-0.5 border border-slate-300">B.Indo</th>
                            <th className="p-0.5 border border-slate-300">B.Ing</th>
                            <th className="p-0.5 border border-slate-300 bg-cyan-50 font-bold">Rata PM</th>
                            <th className="p-0.5 border border-slate-300">IPA</th>
                            <th className="p-0.5 border border-slate-300">IPS</th>
                            <th className="p-0.5 border border-slate-300 bg-emerald-50 font-bold">Rata KA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentMultiTryoutRows.map((row14, rIdx) => {
                            return (
                              <tr key={row14.id || rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-1 border border-slate-300 font-medium">
                                  <strong className="text-slate-900 block leading-tight">
                                    {row14.tryoutTitle}
                                  </strong>
                                  <span className="text-[8px] text-slate-500 font-mono">{row14.submittedAt}</span>
                                </td>
                                <td className="p-1 border border-slate-300 text-center font-mono font-bold">{row14.nilaiPK.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono">{row14.kvIndo.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono">{row14.kvInggris.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-indigo-50/50">{row14.kvTotalAvg.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono">{row14.pmIndo.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono">{row14.pmInggris.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-cyan-50/50">{row14.pmTotalAvg.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono">{row14.kaIpa.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono">{row14.kaIps.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-emerald-50/50">{row14.kaTotalAvg.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono font-bold">{row14.nilaiSK.toFixed(1)}</td>
                                <td className="p-1 border border-slate-300 text-center font-mono font-black text-amber-700 bg-amber-50">
                                  {row14.skorAkhir.toFixed(1)}
                                </td>
                                <td className="p-1 border border-slate-300 text-center">
                                  <span className={`inline-block px-1 py-0.2 text-[8px] font-bold rounded ${
                                    row14.isLulus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {row14.statusLulusLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {/* Summary Row if Multiple Tryouts */}
                          {studentMultiTryoutRows.length > 1 && (
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                              <td className="p-1 border border-slate-300 text-center">
                                <strong>RATA-RATA ({studentMultiTryoutRows.length} TO)</strong>
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono font-bold">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.nilaiPK, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.kvIndo, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.kvInggris, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-indigo-100/60">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.kvTotalAvg, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.pmIndo, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.pmInggris, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-cyan-100/60">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.pmTotalAvg, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.kaIpa, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.kaIps, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-emerald-100/60">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.kaTotalAvg, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono font-bold">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.nilaiSK, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center font-mono font-black text-amber-900 bg-amber-100">
                                {(studentMultiTryoutRows.reduce((a, b) => a + b.skorAkhir, 0) / studentMultiTryoutRows.length).toFixed(1)}
                              </td>
                              <td className="p-1 border border-slate-300 text-center text-[8.5px] font-bold text-emerald-800">
                                KOMPETITIF
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Subtest Legend */}
                      <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-[8px] text-slate-700 space-y-0.5">
                        <p className="font-bold text-slate-800">Keterangan Subtes 14 Kolom Standar PSB Labschool:</p>
                        <p>• <strong>PK</strong>: Pengetahuan Kuantitatif • <strong>KV</strong>: Kemampuan Verbal (Bahasa Indonesia & Bahasa Inggris) • <strong>PM</strong>: Penalaran Matematika & Literasi Membaca • <strong>KA</strong>: Kemampuan Akademik (IPA & IPS Terpadu) • <strong>SK</strong>: Survei Karakter (Integritas, Nilai Kebangsaan, Kepribadian & Kemandirian Siswa)</p>
                      </div>
                    </div>
                  ) : (
                    /* B. Whole Class Rekapitulasi Table (14 Columns) */
                    <table className="w-full text-left border-collapse border border-slate-300 text-[9px]">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold text-center">
                          <th rowSpan={2} className="p-1 border border-slate-400 w-6">No</th>
                          <th rowSpan={2} className="p-1 border border-slate-400">Nama Siswa / Asal Sekolah</th>
                          <th rowSpan={2} className="p-1 border border-slate-400 w-8">PK</th>
                          <th colSpan={3} className="p-1 border border-slate-400 bg-indigo-900 text-indigo-100">KV (Verbal)</th>
                          <th colSpan={3} className="p-1 border border-slate-400 bg-cyan-900 text-cyan-100">PM (Membaca)</th>
                          <th colSpan={3} className="p-1 border border-slate-400 bg-emerald-900 text-emerald-100">KA (Akademik)</th>
                          <th rowSpan={2} className="p-1 border border-slate-400 w-8">SK</th>
                          <th rowSpan={2} className="p-1 border border-slate-400 bg-amber-600 text-white w-10">AKHIR</th>
                          <th rowSpan={2} className="p-1 border border-slate-400 w-16">Status</th>
                        </tr>
                        <tr className="bg-slate-100 text-slate-700 font-semibold text-[8px] text-center">
                          <th className="p-0.5 border border-slate-300">V.B.Ind</th>
                          <th className="p-0.5 border border-slate-300">V.B.Ing</th>
                          <th className="p-0.5 border border-slate-300 bg-indigo-50 font-bold">KV</th>
                          <th className="p-0.5 border border-slate-300">B.Ind</th>
                          <th className="p-0.5 border border-slate-300">B.Ing</th>
                          <th className="p-0.5 border border-slate-300 bg-cyan-50 font-bold">PM</th>
                          <th className="p-0.5 border border-slate-300">IPA</th>
                          <th className="p-0.5 border border-slate-300">IPS</th>
                          <th className="p-0.5 border border-slate-300 bg-emerald-50 font-bold">KA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classTryoutRows.map((crow, cIdx) => (
                          <tr key={crow.id || cIdx} className={cIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1 border border-slate-300 text-center font-mono text-[8.5px] font-bold">{cIdx + 1}</td>
                            <td className="p-1 border border-slate-300">
                              <strong className="text-slate-900 block leading-tight">{crow.studentName}</strong>
                              <span className="text-[7.5px] text-slate-500 font-mono">NIS: {crow.studentNis || '-'} • Target: {crow.targetCampusName || selectedCampus.name}</span>
                            </td>
                            <td className="p-1 border border-slate-300 text-center font-mono font-bold">{crow.nilaiPK.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono">{crow.kvIndo.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono">{crow.kvInggris.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-indigo-50/50">{crow.kvTotalAvg.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono">{crow.pmIndo.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono">{crow.pmInggris.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-cyan-50/50">{crow.pmTotalAvg.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono">{crow.kaIpa.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono">{crow.kaIps.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono font-bold bg-emerald-50/50">{crow.kaTotalAvg.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono font-bold">{crow.nilaiSK.toFixed(1)}</td>
                            <td className="p-1 border border-slate-300 text-center font-mono font-black text-amber-700 bg-amber-50">
                              {crow.skorAkhir.toFixed(1)}
                            </td>
                            <td className="p-1 border border-slate-300 text-center">
                              <span className={`inline-block px-1 py-0.2 text-[7.5px] font-bold rounded ${
                                crow.isLulus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {crow.statusLulusLabel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* 7. SECTION III: PASSING GRADE COMPARISON AGAINST 5 LABSCHOOL CAMPUSES */}
              {showPassingGrade && (reportType === 'ALL' || reportType === 'TRYOUT') && (
                <div className="space-y-3 print-avoid-break">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5 border-b border-slate-300 pb-1">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>III. Komparasi Kelulusan terhadap 5 Kampus Labschool (Grafik & Tabel)</span>
                  </h4>

                  {/* Visual Bar Comparison for 5 Campuses */}
                  <div className="bg-slate-50/70 border border-slate-300 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">
                        Grafik Batang Skor Siswa ({currentTryoutResult.totalScore.toFixed(1)} Poin) vs Passing Grade 5 Kampus:
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        Target Utama: <strong className="text-blue-900">{selectedCampus.name}</strong>
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {sortedCampuses.map((cmp) => {
                        const pg = studentLevel === 'SMA' ? cmp.passingGradeSma : cmp.passingGradeSmp;
                        const diff = currentTryoutResult.totalScore - pg;
                        const isPass = diff >= 0;
                        const isSelected = cmp.id === selectedCampus.id;
                        const pgPercent = Math.min(100, Math.max(0, pg));
                        const scorePercent = Math.min(100, Math.max(0, currentTryoutResult.totalScore));
                        const campusColor = getCampusColor(cmp.id, cmp.name);

                        return (
                          <div key={cmp.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: campusColor }}
                                />
                                <span>{cmp.name} ({cmp.loc})</span>
                                {isSelected && (
                                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[9px] font-black tracking-wide border border-amber-400">
                                    ★ TARGET PILIHAN
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-2 font-mono text-[10px]">
                                <span className="text-slate-600">
                                  Passing Grade:{' '}
                                  <strong style={{ color: campusColor }} className="font-black">
                                    {pg.toFixed(1)}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span className={`font-black px-1.5 py-0.2 rounded text-[10px] ${
                                  isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isPass ? `✓ LOLOS (+${diff.toFixed(1)})` : `✗ BELUM LOLOS (${diff.toFixed(1)})`}
                                </span>
                              </div>
                            </div>

                            {/* Score Bar with Passing Grade Indicator Line */}
                            <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                              <div
                                className={`h-full rounded-full transition-all flex items-center justify-end pr-2 text-[9px] font-bold text-white shadow-inner ${
                                  isPass ? 'bg-gradient-to-r from-blue-700 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-amber-600'
                                }`}
                                style={{ width: `${scorePercent}%` }}
                              >
                                {scorePercent >= 30 && (
                                  <span>{currentTryoutResult.totalScore.toFixed(1)}</span>
                                )}
                              </div>

                              <div
                                className="absolute top-0 bottom-0 w-1 z-10 shadow-sm"
                                style={{
                                  left: `${pgPercent}%`,
                                  backgroundColor: campusColor
                                }}
                                title={`Passing Grade ${cmp.name}: ${pg}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chart Legend */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-2 rounded bg-gradient-to-r from-blue-700 to-emerald-600 inline-block"></span>
                          <span>Skor Siswa (Batang)</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-3 bg-slate-900 inline-block"></span>
                          <span>Garis Passing Grade Kampus</span>
                        </span>
                      </div>
                      <span className="font-mono font-bold text-blue-950">
                        Status Target ({selectedCampus.name}):{' '}
                        <strong className={currentTryoutResult.totalScore >= targetPg ? 'text-emerald-700' : 'text-rose-700'}>
                          {currentTryoutResult.totalScore >= targetPg ? 'MEMENUHI SYARAT' : 'PERLU PENGUATAN'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Detailed Table for 5 Campuses */}
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300">Kampus Labschool</th>
                        <th className="p-2 border-r border-slate-300 text-center w-24">Lokasi</th>
                        <th className="p-2 border-r border-slate-300 text-center w-24">Passing Grade</th>
                        <th className="p-2 border-r border-slate-300 text-center w-20">Skor Siswa</th>
                        <th className="p-2 border-r border-slate-300 text-center w-20">Selisih (Δ)</th>
                        <th className="p-2 text-center w-28">Status Kelulusan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCampuses.map((cmp, idx) => {
                        const pg = studentLevel === 'SMA' ? cmp.passingGradeSma : cmp.passingGradeSmp;
                        const diff = currentTryoutResult.totalScore - pg;
                        const isPass = diff >= 0;
                        const isSelected = cmp.id === selectedCampus.id;
                        const campusColor = getCampusColor(cmp.id, cmp.name);

                        return (
                          <tr
                            key={cmp.id}
                            className={`${isSelected ? 'bg-amber-50/80 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                          >
                            <td className="p-2 border-r border-b border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                  style={{ backgroundColor: campusColor }}
                                />
                                <span className="font-bold text-slate-900">{cmp.name}</span>
                                {isSelected && (
                                  <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-bold">
                                    PILIHAN UTAMA
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 border-r border-b border-slate-200 text-center text-slate-600">
                              {cmp.loc}
                            </td>
                            <td className="p-2 border-r border-b border-slate-200 text-center font-mono font-bold">
                              <span style={{ color: campusColor }}>{pg.toFixed(1)}</span>
                            </td>
                            <td className="p-2 border-r border-b border-slate-200 text-center font-mono font-bold text-blue-900">
                              {currentTryoutResult.totalScore.toFixed(1)}
                            </td>
                            <td className={`p-2 border-r border-b border-slate-200 text-center font-mono font-bold ${
                              isPass ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                            </td>
                            <td className="p-2 border-b border-slate-200 text-center">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                                isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isPass ? '✓ LOLOS' : '✗ BELUM LOLOS'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 8. SECTION IV: GRAFIK PROGRES SILABUS & REKAPITULASI JURNAL BELAJAR */}
              {(showMaterialProgressBar || showJournal) && (reportType === 'ALL' || reportType === 'JOURNAL') && (
                <div className="space-y-3 print-avoid-break">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>
                        IV. Progres Silabus & Rekapitulasi Jurnal Belajar ({activeLevelJournals.length} Sesi Terdata)
                      </span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      Jenjang {studentLevel} Labschool
                    </span>
                  </div>

                  {/* Summary Metric KPI Bar */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block text-[10px]">Total Sesi Belajar</span>
                      <strong className="text-sm font-mono text-slate-900">
                        {journalStats.total} Pertemuan
                      </strong>
                    </div>
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                      <span className="text-emerald-700 block text-[10px]">Tingkat Kehadiran</span>
                      <strong className="text-sm font-mono text-emerald-800">{journalStats.attendancePct}% (Hadir Aktif)</strong>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <span className="text-blue-700 block text-[10px]">Rata-rata Pemahaman</span>
                      <strong className="text-sm font-mono text-blue-800">{journalStats.avgRating} / 5.0 ({(Number(journalStats.avgRating) * 20).toFixed(0)}%)</strong>
                    </div>
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded">
                      <span className="text-indigo-700 block text-[10px]">Progres Tuntas</span>
                      <strong className="text-sm font-mono text-indigo-800">
                        {journalStats.sudah} Tuntas ({Math.round((journalStats.sudah / Math.max(1, journalStats.total)) * 100)}%)
                      </strong>
                    </div>
                  </div>

                  {/* Compact Horizontal Segmented Bar for Learning Progress */}
                  {showMaterialProgressBar && (
                    <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Grafik Progres Silabus Materi Belajar (Sudah, Sedang, Belum):</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-600 font-bold">
                          Total: {journalStats.total} Topik Materi
                        </span>
                      </div>

                      {/* Horizontal Segmented Bar */}
                      <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300 shadow-inner">
                        <div
                          className="bg-emerald-600 h-full flex items-center justify-center text-[8.5px] font-bold text-white transition-all"
                          style={{ width: `${(journalStats.sudah / Math.max(1, journalStats.total)) * 100}%` }}
                          title={`Sudah Tuntas: ${journalStats.sudah}`}
                        >
                          {journalStats.sudah > 0 && `${Math.round((journalStats.sudah / Math.max(1, journalStats.total)) * 100)}%`}
                        </div>
                        <div
                          className="bg-amber-500 h-full flex items-center justify-center text-[8.5px] font-bold text-white transition-all"
                          style={{ width: `${(journalStats.sedang / Math.max(1, journalStats.total)) * 100}%` }}
                          title={`Sedang Dipelajari: ${journalStats.sedang}`}
                        >
                          {journalStats.sedang > 0 && `${Math.round((journalStats.sedang / Math.max(1, journalStats.total)) * 100)}%`}
                        </div>
                        <div
                          className="bg-slate-400 h-full flex items-center justify-center text-[8.5px] font-bold text-white transition-all"
                          style={{ width: `${(journalStats.belum / Math.max(1, journalStats.total)) * 100}%` }}
                          title={`Belum Dimulai: ${journalStats.belum}`}
                        >
                          {journalStats.belum > 0 && `${Math.round((journalStats.belum / Math.max(1, journalStats.total)) * 100)}%`}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-between text-[9.5px] text-slate-600 pt-0.5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2 rounded bg-emerald-600 inline-block"></span>
                            <span>Sudah Tuntas ({journalStats.sudah} - {Math.round((journalStats.sudah / Math.max(1, journalStats.total)) * 100)}%)</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2 rounded bg-amber-500 inline-block"></span>
                            <span>Sedang ({journalStats.sedang} - {Math.round((journalStats.sedang / Math.max(1, journalStats.total)) * 100)}%)</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2 rounded bg-slate-400 inline-block"></span>
                            <span>Belum ({journalStats.belum} - {Math.round((journalStats.belum / Math.max(1, journalStats.total)) * 100)}%)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section IV.A: Complete Meetings Table */}
                  {showJournal && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-800 block">
                        IV.A Rincian Jurnal Belajar & Presensi Sesi Pertemuan:
                      </span>
                      <div className="overflow-hidden border border-slate-300 rounded-lg">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                              <th className="p-1.5 border-r border-slate-300 text-center w-8">Sesi</th>
                              <th className="p-1.5 border-r border-slate-300 w-24">Tanggal & Waktu</th>
                              <th className="p-1.5 border-r border-slate-300 text-center w-12">Subtes</th>
                              <th className="p-1.5 border-r border-slate-300">Materi & Topik Silabus</th>
                              <th className="p-1.5 border-r border-slate-300 text-center w-20">Pemahaman</th>
                              <th className="p-1.5 border-r border-slate-300 text-center w-16">Progres</th>
                              <th className="p-1.5 border-r border-slate-300">Evaluasi Guru & Catatan</th>
                              <th className="p-1.5 text-center w-16">Tugas (PR)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {activeLevelJournals.map((j) => (
                              <tr key={j.id} className="hover:bg-slate-50">
                                <td className="p-1.5 border-r border-slate-200 text-center font-bold font-mono">
                                  #{j.meetingNumber}
                                </td>
                                <td className="p-1.5 border-r border-slate-200 leading-tight">
                                  <span className="font-semibold text-slate-900 block">{j.date}</span>
                                  <span className="text-[8.5px] text-slate-500 font-mono">{j.timeRange}</span>
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-[8.5px]">
                                    {j.subtestCode}
                                  </span>
                                </td>
                                <td className="p-1.5 border-r border-slate-200 leading-tight">
                                  <strong className="text-slate-900 block text-[9.5px]">{j.topicTitle}</strong>
                                  {j.subtopics && j.subtopics.length > 0 && (
                                    <span className="text-[8.5px] text-slate-600 block">
                                      • {j.subtopics.join(', ')}
                                    </span>
                                  )}
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center leading-tight">
                                  <span className="font-bold text-amber-600 block text-[9px]">
                                    {'★'.repeat(j.comprehensionRating)}{'☆'.repeat(5 - j.comprehensionRating)}
                                  </span>
                                  <span className="text-[8.5px] text-slate-500 font-mono">
                                    {j.comprehensionPercentage}%
                                  </span>
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center">
                                  <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                    (j.progress || 'SUDAH') === 'SUDAH'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : j.progress === 'SEDANG'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {j.progress || 'SUDAH'}
                                  </span>
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-[9px] text-slate-700 leading-tight">
                                  {j.teacherEvaluation || j.studentNotes || 'Materi tersampaikan dengan tuntas.'}
                                </td>
                                <td className="p-1.5 text-center text-[8.5px] leading-tight">
                                  <span className="font-semibold text-emerald-700 block">
                                    {j.homeworkTask ? 'Tuntas' : 'Selesai'}
                                  </span>
                                  <span className="text-[8px] text-slate-500 truncate max-w-[70px] block mx-auto">
                                    {j.homeworkTask || 'Terlampir'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 8.5. SECTION IV.B: QUIZ ANALYSIS & LEADERBOARD SECTION */}
              {showQuizSection && (reportType === 'ALL' || reportType === 'QUIZ') && (
                <div className="space-y-3 print-avoid-break">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>
                        IV.B Rekapitulasi Kuis Harian & Peringkat Leaderboard
                      </span>
                    </h4>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      Jenjang {studentLevel} Labschool
                    </span>
                  </div>

                  {/* Leaderboard Table Top Ranking */}
                  <div className="overflow-hidden border border-slate-300 rounded-lg">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                          <th className="p-1.5 border-r border-slate-300 text-center w-10">Peringkat</th>
                          <th className="p-1.5 border-r border-slate-300">Nama Siswa</th>
                          <th className="p-1.5 border-r border-slate-300 text-center w-20">Jenjang</th>
                          <th className="p-1.5 border-r border-slate-300 text-center w-20">Total Kuis</th>
                          <th className="p-1.5 border-r border-slate-300 text-center w-20">Rata-rata Skor</th>
                          <th className="p-1.5 border-r border-slate-300 text-center w-20">Akurasi</th>
                          <th className="p-1.5 text-center w-24">Badge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeQuizLeaderboard
                          .slice(0, 5)
                          .map((item, idx) => {
                            const isMe = item.studentName.toLowerCase().includes(studentName.toLowerCase());
                            return (
                              <tr key={item.id} className={isMe ? 'bg-amber-50 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold">
                                  #{idx + 1}
                                </td>
                                <td className="p-1.5 border-r border-slate-200">
                                  <div className="flex items-center gap-2">
                                    {item.studentAvatar && (
                                      <img
                                        src={item.studentAvatar}
                                        alt={item.studentName}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-300 shadow-sm shrink-0"
                                      />
                                    )}
                                    <span className="text-slate-900 font-bold">{item.studentName}</span>
                                    {isMe && (
                                      <span className="text-[8px] px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded font-black border border-amber-300">
                                        SISWA AKTIF
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center">
                                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-blue-100 text-blue-900">
                                    {item.level} Labschool
                                  </span>
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center font-mono font-semibold">
                                  {item.totalQuizzesTaken} Sesi
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-blue-900">
                                  {item.averageScore.toFixed(1)}
                                </td>
                                <td className="p-1.5 border-r border-slate-200 text-center font-mono font-semibold text-emerald-700">
                                  {item.accuracyPercentage}%
                                </td>
                                <td className="p-1.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[8.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-block shadow-xs">
                                    🏆 {item.badgeTitle}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 9. SECTION V: TUTOR RECOMMENDATIONS & ACTION PLAN */}
              {showRecommendations && (
                <div className="space-y-1.5 p-3.5 bg-amber-50/70 border border-amber-300 rounded-lg text-xs print-avoid-break">
                  <strong className="text-amber-950 font-bold uppercase block text-[11px]">
                    V. Catatan Evaluasi & Rekomendasi Master Tutor Brain Space Academy:
                  </strong>
                  <p className="text-slate-800 leading-relaxed italic">
                    "{currentTryoutResult.recommendationNotes}"
                  </p>
                  <div className="flex gap-4 pt-1 text-[10px] text-slate-600 font-medium">
                    <span>• Fokus Penguatan: <strong>{currentTryoutResult.weaknesses.join(' & ')}</strong></span>
                    <span>• Rekomendasi Jam Latihan: <strong>45 - 60 Menit / Hari</strong></span>
                  </div>
                </div>
              )}

              {/* 10. SECTION VI: OFFICIAL SIGNATURES BLOCK */}
              {showSignatures && (
                <div className="pt-6 border-t border-slate-300 text-xs text-center grid grid-cols-3 gap-4 print-avoid-break">
                  <div className="space-y-12">
                    <p className="text-slate-600">Mengetahui,<br /><strong className="text-slate-900">Orang Tua / Wali Siswa</strong></p>
                    <div className="border-b border-slate-400 w-36 mx-auto" />
                    <p className="text-[10px] text-slate-500">( .................................................. )</p>
                  </div>

                  <div className="space-y-12">
                    <p className="text-slate-600">Master Tutor Pembimbing,<br /><strong className="text-slate-900">{tutorName}</strong></p>
                    <div className="border-b border-slate-400 w-36 mx-auto" />
                    <p className="text-[10px] text-slate-500">Master Tutor Brain Space Academy</p>
                  </div>

                  <div className="space-y-12">
                    <p className="text-slate-600">Jakarta, {currentDateFormatted}<br /><strong className="text-slate-900">Direktur Akademik BSA</strong></p>
                    <div className="border-b border-slate-400 w-36 mx-auto" />
                    <p className="text-[10px] text-slate-500 font-bold">Dr. Hendra Wijaya, M.Pd.</p>
                  </div>
                </div>
              )}

              {/* Document Official Footer Watermark */}
              <div className="pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400 font-mono print-avoid-break">
                Dokumen Resmi Hasil Evaluasi Tryout CBT & LMS Brain Space Academy • Pusat Bimbingan & Akselerasi Khusus Seleksi Masuk Labschool Indonesia
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Actions (Screen Only) */}
        <div className="no-print p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dokumen tersinkronisasi. Unduh PDF ke perangkat atau cetak langsung.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Salin Teks */}
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            {/* Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mengompilasi PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Langsung</span>
                </>
              )}
            </button>

            {/* Browser Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/25"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak (Print)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
