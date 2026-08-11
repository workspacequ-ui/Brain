import React, { useState, useMemo } from 'react';
import { User, ExamResult, SyllabusItem, ClassItem } from '../../types';
import { getInstitutionInfo } from '../../utils/storage';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  X,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Search,
  MessageSquare,
  MessageCircle,
  Layers,
  Star,
  Check,
  Percent
} from 'lucide-react';

interface StudentGradingModalProps {
  student: User;
  teacherUser: User;
  teacherSubject: string;
  syllabi: SyllabusItem[];
  allResults: ExamResult[];
  isOpen: boolean;
  onClose: () => void;
  onSaveGrade: (result: ExamResult) => void;
  onDeleteGrade: (resultId: string) => void;
  defaultKkm?: number;
}

export const StudentGradingModal: React.FC<StudentGradingModalProps> = ({
  student,
  teacherUser,
  teacherSubject,
  syllabi,
  allResults,
  isOpen,
  onClose,
  onSaveGrade,
  onDeleteGrade,
  defaultKkm = 75
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'history' | 'transcript'>('add');
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

  // Form Fields
  const [examTitle, setExamTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState('Tugas Harian');
  const [subject, setSubject] = useState(teacherSubject);
  const [score, setScore] = useState<number>(85);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [passingScore, setPassingScore] = useState<number>(defaultKkm);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [submittedAt, setSubmittedAt] = useState(() => {
    return new Date().toISOString().replace('T', ' ').substring(0, 16);
  });

  // History Tab Filters
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');

  // Update default passingScore if defaultKkm changes when not editing
  React.useEffect(() => {
    if (!editingResult) {
      setPassingScore(defaultKkm);
    }
  }, [defaultKkm, editingResult]);

  // Filter student's results
  const studentResults = useMemo(() => {
    return allResults.filter(
      r => r.studentNis === student.nis || r.studentId === student.id || r.studentName.toLowerCase() === student.name.toLowerCase()
    );
  }, [allResults, student]);

  // Helper to get category badge style
  const getCategoryBadge = (cat?: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('tugas')) {
      return {
        label: 'Tugas Harian',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        dot: 'bg-blue-400'
      };
    }
    if (c.includes('ulangan') || c.includes('uh')) {
      return {
        label: 'Ulangan Harian (UH)',
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        dot: 'bg-cyan-400'
      };
    }
    if (c.includes('kuis') || c.includes('quiz')) {
      return {
        label: 'Kuis Singkat',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400'
      };
    }
    if (c.includes('tengah') || c.includes('pts') || c.includes('uts')) {
      return {
        label: 'PTS (Tengah Semester)',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400'
      };
    }
    if (c.includes('akhir') || c.includes('pas') || c.includes('uas')) {
      return {
        label: 'PAS (Akhir Semester)',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400'
      };
    }
    if (c.includes('praktik') || c.includes('portofolio') || c.includes('proyek')) {
      return {
        label: 'Praktik & Portofolio',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }
    if (c.includes('remedial')) {
      return {
        label: 'Remedial & Pemantapan',
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        dot: 'bg-orange-400'
      };
    }
    return {
      label: cat || 'Evaluasi Mandiri',
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-400'
    };
  };

  // Filtered history list
  const filteredStudentResults = useMemo(() => {
    return studentResults.filter(res => {
      const matchSearch =
        res.examTitle.toLowerCase().includes(historySearch.toLowerCase()) ||
        (res.teacherFeedback && res.teacherFeedback.toLowerCase().includes(historySearch.toLowerCase())) ||
        (res.assessmentType && res.assessmentType.toLowerCase().includes(historySearch.toLowerCase()));
      
      const type = (res.assessmentType || res.examCategory || '').toLowerCase();
      let matchCat = true;
      if (historyCategoryFilter !== 'ALL') {
        const catKey = historyCategoryFilter.toLowerCase();
        matchCat = type.includes(catKey) || res.examTitle.toLowerCase().includes(catKey);
      }

      const isPass = (res.score || 0) >= (res.passingScore || defaultKkm);
      let matchStatus = true;
      if (historyStatusFilter === 'PASSED') matchStatus = isPass;
      else if (historyStatusFilter === 'REMEDIAL') matchStatus = !isPass;

      return matchSearch && matchCat && matchStatus;
    });
  }, [studentResults, historySearch, historyCategoryFilter, historyStatusFilter, defaultKkm]);

  // Overall student performance metrics
  const metrics = useMemo(() => {
    if (studentResults.length === 0) {
      return { total: 0, avg: 0, passed: 0, remedial: 0, highest: 0, lowest: 0 };
    }
    const scores = studentResults.map(r => r.score || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / scores.length);
    const passed = studentResults.filter(r => (r.score || 0) >= (r.passingScore || defaultKkm)).length;
    const remedial = studentResults.length - passed;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    return { total: studentResults.length, avg, passed, remedial, highest, lowest };
  }, [studentResults, defaultKkm]);

  // Quick suggestions from syllabus topics
  const syllabusSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    syllabi.forEach(sil => {
      sil.topics.forEach(top => {
        suggestions.push(`Tugas Pertemuan ${top.meetingNumber}: ${top.title}`);
        suggestions.push(`Ulangan Harian: ${top.title}`);
      });
    });
    // Add standard suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        'Tugas Harian 1: Pemahaman Konsep Dasar',
        'Tugas Harian 2: Latihan Soal Mandiri',
        'Ulangan Harian 1 (UH 1)',
        'Kuis Cepat Pemantapan',
        'Penilaian Portofolio & Praktikum',
        'Remedial & Pengayaan'
      );
    }
    return suggestions.slice(0, 6);
  }, [syllabi]);

  // Quick preset feedback remarks
  const feedbackPresets = [
    'Sangat baik, langkah pengerjaan sistematis dan teliti. Pertahankan!',
    'Pemahaman konsep sudah matang, tingkatkan kecepatan penyelesaian soal.',
    'Nilai memenuhi KKM, perhatikan kembali ketelitian pada rumus dasar.',
    'Perlu bimbingan remedial dan latihan tambahan untuk materi ini.',
    'Peningkatan nilai yang sangat memuaskan dibanding tugas sebelumnya.'
  ];

  const handleEditClick = (res: ExamResult) => {
    setEditingResult(res);
    setExamTitle(res.examTitle);
    setAssessmentType(res.assessmentType || 'Tugas Harian');
    setSubject(res.examCategory || teacherSubject);
    setScore(res.score);
    setMaxScore(res.maxScore || 100);
    setPassingScore(res.passingScore || 75);
    setTeacherFeedback(res.teacherFeedback || '');
    setSubmittedAt(res.submittedAt);
    setActiveTab('add');
  };

  const handleResetForm = () => {
    setEditingResult(null);
    setExamTitle('');
    setAssessmentType('Tugas Harian');
    setSubject(teacherSubject);
    setScore(85);
    setMaxScore(100);
    setPassingScore(75);
    setTeacherFeedback('');
    setSubmittedAt(new Date().toISOString().replace('T', ' ').substring(0, 16));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const scoreNum = Number(score) || 0;
    const maxScoreNum = Number(maxScore) || 100;
    const passingScoreNum = Number(passingScore) || 75;
    const isPassed = scoreNum >= passingScoreNum;
    const percentage = Math.round((scoreNum / maxScoreNum) * 100);

    const payload: ExamResult = {
      id: editingResult ? editingResult.id : `res-manual-${Date.now()}`,
      examId: editingResult ? editingResult.examId : `manual-eval-${Date.now()}`,
      examTitle: examTitle.trim(),
      examCategory: subject || teacherSubject,
      studentId: student.id,
      studentNis: student.nis,
      studentName: student.name,
      studentClass: student.className,
      answers: editingResult ? editingResult.answers : {},
      correctCount: editingResult ? editingResult.correctCount : 0,
      incorrectCount: editingResult ? editingResult.incorrectCount : 0,
      unansweredCount: 0,
      score: scoreNum,
      maxScore: maxScoreNum,
      percentage: percentage,
      isPassed: isPassed,
      submittedAt: submittedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      durationSpentSeconds: editingResult ? editingResult.durationSpentSeconds : 0,
      assessmentType: assessmentType,
      teacherFeedback: teacherFeedback.trim(),
      gradedBy: teacherUser.name,
      passingScore: passingScoreNum
    };

    onSaveGrade(payload);
    handleResetForm();
    setActiveTab('history');
  };

  const getPredicate = (s: number) => {
    if (s >= 90) return { grade: 'A', label: 'Sangat Baik (Amat Terpuji)', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
    if (s >= 80) return { grade: 'B', label: 'Baik (Memuaskan)', color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' };
    if (s >= 75) return { grade: 'C', label: 'Cukup (Tuntas KKM)', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
    return { grade: 'D', label: 'Perlu Bimbingan (Remedial)', color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
              alt={student.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/40 shrink-0"
            />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-base sm:text-lg truncate">
                    {student.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {student.className}
                  </span>
                  {student.group && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      <span>{student.group}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono">NIS: {student.nis}</span>
                  <span>•</span>
                  <span>Guru Penilai: <strong className="text-slate-200">{teacherUser.name}</strong></span>
                  {(student.whatsapp || student.phone) && (
                    <>
                      <span>•</span>
                      <a
                        href={`https://wa.me/${(student.whatsapp || student.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-mono"
                        title="Chat WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{student.whatsapp || student.phone}</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL TABS & KPI BAR */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                handleResetForm();
                setActiveTab('add');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingResult ? 'Edit Nilai' : 'Input Nilai Baru'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Riwayat Nilai ({studentResults.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transcript')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'transcript'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Transkrip Rapor</span>
            </button>
          </div>

          {/* Quick Average Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Rata-rata:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
              metrics.total === 0
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : metrics.avg >= 75
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {metrics.total > 0 ? `${metrics.avg} / 100` : 'Belum Ada Nilai'}
            </span>
          </div>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          
          {/* TAB 1: FORM INPUT NILAI */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {editingResult && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-amber-300 font-semibold">
                      Mode Pengeditan: Mengubah nilai "<strong>{editingResult.examTitle}</strong>"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-slate-400 hover:text-white font-bold underline"
                  >
                    Batal Edit
                  </button>
                </div>
              )}

              {/* Suggestions Chips */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400">
                  ⚡ Template Cepat / Topik Silabus:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {syllabusSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setExamTitle(sug)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-800 text-[11px] transition-all text-left truncate max-w-xs"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Judul Penilaian */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Nama Penilaian / Judul Evaluasi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  placeholder="Contoh: Tugas Harian 1: Pemfaktoran Aljabar & Akar..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Kategori, Mapel, Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Kategori Penilaian
                  </label>
                  <select
                    value={assessmentType}
                    onChange={e => setAssessmentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-purple-500"
                  >
                    <option value="Tugas Harian">Tugas Harian</option>
                    <option value="Ulangan Harian">Ulangan Harian (UH)</option>
                    <option value="Kuis Interaktif">Kuis Singkat</option>
                    <option value="Penilaian Tengah Semester">PTS (Tengah Semester)</option>
                    <option value="Penilaian Akhir Semester">PAS (Akhir Semester)</option>
                    <option value="Ujian CBT / Tryout">Ujian CBT / Tryout</option>
                    <option value="Praktik">Praktik & Portofolio</option>
                    <option value="Remedial">Remedial & Pemantapan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Mata pelajaran..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Tanggal Penilaian
                  </label>
                  <input
                    type="text"
                    value={submittedAt}
                    onChange={e => setSubmittedAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Nilai & KKM Meter Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-400" />
                      Skor Penilaian Siswa (Skala 0 - 100)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Standar KKM: <strong className="text-purple-300 font-mono">{passingScore}</strong> • Status:{' '}
                      <strong className={score >= passingScore ? 'text-emerald-400' : 'text-rose-400'}>
                        {score >= passingScore ? 'TUNTAS KKM' : 'PERLU REMEDIAL'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Predikat:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${getPredicate(score).color}`}>
                        {getPredicate(score).grade} ({getPredicate(score).label.split(' ')[0]})
                      </span>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={e => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-full bg-slate-900 border-2 border-purple-500 rounded-xl p-2 text-center text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Score Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400">Pilihan Skor Cepat:</span>
                  {[60, 70, 75, 80, 85, 90, 95, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScore(val)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        score === val
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                {/* KKM Setting Section */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-200 block">
                      Kriteria Ketuntasan Minimal (KKM) Penilaian Ini
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Siswa dinyatakan Tuntas jika nilai &ge; KKM.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[70, 75, 78, 80, 85].map(k => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setPassingScore(k)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            passingScore === k
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                    <div className="w-16">
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={passingScore}
                        onChange={e => setPassingScore(Math.min(100, Math.max(10, parseInt(e.target.value) || 0)))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center text-xs font-bold text-purple-300 font-mono focus:border-purple-500 focus:outline-none"
                        title="Nilai KKM Khusus"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Guru */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-200">
                    Catatan & Umpan Balik Guru (Feedback)
                  </label>
                  <span className="text-[10px] text-slate-500">Opsional tapi disarankan</span>
                </div>
                <textarea
                  rows={3}
                  value={teacherFeedback}
                  onChange={e => setTeacherFeedback(e.target.value)}
                  placeholder="Beri motivasi, evaluasi ketelitian, saran perbaikan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none leading-relaxed"
                />

                {/* Feedback Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {feedbackPresets.map((fb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTeacherFeedback(fb)}
                      className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 text-left truncate max-w-xs"
                    >
                      "{fb.substring(0, 35)}..."
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingResult ? 'Simpan Perubahan Nilai' : 'Rekam & Simpan Nilai'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: RIWAYAT SEMUA NILAI SISWA */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total Evaluasi</span>
                  <span className="text-base font-bold text-white">{metrics.total} Tugas / Ujian</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Rata-rata Nilai</span>
                  <span className={`text-base font-bold font-mono ${metrics.avg >= defaultKkm ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.total > 0 ? metrics.avg : '-'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-emerald-500 block">Tuntas KKM (&ge;{defaultKkm})</span>
                  <span className="text-base font-bold text-emerald-400">{metrics.passed}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-rose-500 block">Remedial (&lt;{defaultKkm})</span>
                  <span className="text-base font-bold text-rose-400">{metrics.remedial}</span>
                </div>
              </div>

              {/* History Search & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Cari judul penilaian atau catatan guru..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={historyCategoryFilter}
                    onChange={e => setHistoryCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-purple-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Tugas">Tugas Harian</option>
                    <option value="Ulangan">Ulangan Harian (UH)</option>
                    <option value="Kuis">Kuis Singkat</option>
                    <option value="Tengah">PTS (Tengah Semester)</option>
                    <option value="Akhir">PAS (Akhir Semester)</option>
                    <option value="Praktik">Praktik & Portofolio</option>
                    <option value="Remedial">Remedial</option>
                  </select>

                  <select
                    value={historyStatusFilter}
                    onChange={e => setHistoryStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-purple-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PASSED">Tuntas (&ge; KKM)</option>
                    <option value="REMEDIAL">Remedial (&lt; KKM)</option>
                  </select>
                </div>
              </div>

              {/* Assessments List */}
              {filteredStudentResults.length > 0 ? (
                <div className="space-y-3">
                  {filteredStudentResults.map(res => {
                    const itemKkm = res.passingScore || defaultKkm;
                    const isPass = (res.score || 0) >= itemKkm;
                    const catBadge = getCategoryBadge(res.assessmentType || res.examCategory);

                    return (
                      <div
                        key={res.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${catBadge.color}`}>
                              {res.assessmentType || res.examCategory || 'Tugas Harian'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {res.submittedAt}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • KKM: <strong className="text-slate-300 font-mono">{itemKkm}</strong>
                            </span>
                            {res.gradedBy && (
                              <span className="text-[10px] text-slate-400">
                                • Penilai: {res.gradedBy}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-white truncate">
                            {res.examTitle}
                          </h4>

                          {res.teacherFeedback && (
                            <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 italic flex items-start gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>"{res.teacherFeedback}"</span>
                            </p>
                          )}
                        </div>

                        {/* Score & Actions */}
                        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className={`text-lg font-black font-mono ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {res.score}
                              </span>
                              <span className="text-xs text-slate-500">/ 100</span>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                              isPass
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {isPass ? 'TUNTAS KKM' : 'REMEDIAL'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(res)}
                              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                              title="Edit Nilai"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus data penilaian "${res.examTitle}"?`)) {
                                  onDeleteGrade(res.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {studentResults.length === 0
                      ? 'Belum ada riwayat nilai untuk siswa ini.'
                      : 'Tidak ada penilaian yang sesuai dengan filter.'}
                  </p>
                  {studentResults.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('add')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                    >
                      + Input Nilai Pertama
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setHistorySearch('');
                        setHistoryCategoryFilter('ALL');
                        setHistoryStatusFilter('ALL');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSKRIP RAPOR CETAK */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <span className="text-xs text-purple-300 font-semibold">
                  Transkrip Capaian Pembelajaran & Penilaian Siswa Binaan
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Transkrip</span>
                </button>
              </div>

              {/* Printable Sheet */}
              <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-5 shadow-2xl font-sans">
                
                {/* Header Kop */}
                {(() => {
                  const inst = getInstitutionInfo();
                  return (
                    <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {inst.logoUrl && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center p-0.5 shrink-0">
                            <img
                              src={inst.logoUrl}
                              alt={inst.name}
                              className={`w-full h-full ${inst.logoFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                            />
                          </div>
                        )}
                        <div>
                          <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                            {inst.name || 'BRAIN SPACE ACADEMY'}
                          </h2>
                          <p className="text-xs text-slate-600 font-medium">
                            {inst.subtitle || 'Laporan Hasil Evaluasi & Bimbingan Akademik Siswa'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-slate-500 block">Tahun Ajaran</span>
                        <span className="text-xs font-extrabold text-slate-800">2025 / 2026</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Info Siswa & Guru */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p><span className="text-slate-500 w-24 inline-block font-semibold">Nama Siswa:</span> <strong>{student.name}</strong></p>
                    <p><span className="text-slate-500 w-24 inline-block font-semibold">NIS:</span> <strong className="font-mono">{student.nis}</strong></p>
                    <p><span className="text-slate-500 w-24 inline-block font-semibold">Kelas:</span> <strong>{student.className}</strong></p>
                    <p><span className="text-slate-500 w-24 inline-block font-semibold">Kelompok:</span> <strong>{student.group || '-'}</strong></p>
                    <p><span className="text-slate-500 w-24 inline-block font-semibold">Nomor WA:</span> <strong className="font-mono">{student.whatsapp || student.phone || '-'}</strong></p>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-slate-500 w-28 inline-block font-semibold">Guru Pembimbing:</span> <strong>{teacherUser.name}</strong></p>
                    <p><span className="text-slate-500 w-28 inline-block font-semibold">Mata Pelajaran:</span> <strong>{teacherSubject}</strong></p>
                    <p><span className="text-slate-500 w-28 inline-block font-semibold">Tanggal Cetak:</span> <strong>{new Date().toLocaleDateString('id-ID')}</strong></p>
                  </div>
                </div>

                {/* Tabel Nilai */}
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                    <tr>
                      <th className="p-2.5 border border-slate-300 text-center w-10">No</th>
                      <th className="p-2.5 border border-slate-300">Penilaian / Ujian</th>
                      <th className="p-2.5 border border-slate-300">Kategori</th>
                      <th className="p-2.5 border border-slate-300 text-center w-16">Nilai</th>
                      <th className="p-2.5 border border-slate-300 text-center w-20">Status</th>
                      <th className="p-2.5 border border-slate-300">Catatan Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map((r, idx) => {
                      const isPass = (r.score || 0) >= (r.passingScore || 75);
                      return (
                        <tr key={r.id} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-semibold">{r.examTitle}</td>
                          <td className="p-2 border border-slate-300">{r.assessmentType || r.examCategory}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold font-mono">{r.score}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-[10px]">
                            <span className={isPass ? 'text-emerald-700' : 'text-rose-700'}>
                              {isPass ? 'TUNTAS' : 'REMEDIAL'}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px] text-slate-600 italic">
                            {r.teacherFeedback || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="p-2.5 border border-slate-300 text-right">Rata-rata Keseluruhan:</td>
                      <td className="p-2.5 border border-slate-300 text-center font-mono font-black text-sm">
                        {metrics.avg}
                      </td>
                      <td colSpan={2} className="p-2.5 border border-slate-300">
                        Predikat: <strong>{getPredicate(metrics.avg).grade} ({getPredicate(metrics.avg).label})</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Tanda Tangan */}
                <div className="pt-6 flex justify-between text-xs text-slate-700">
                  <div className="text-center w-40">
                    <p>Siswa Ybs,</p>
                    <div className="h-14" />
                    <p className="font-bold underline">{student.name}</p>
                  </div>
                  <div className="text-center w-48">
                    <p>Guru Pembimbing / Pengampu,</p>
                    <div className="h-14" />
                    <p className="font-bold underline">{teacherUser.name}</p>
                    <p className="text-[10px] text-slate-500">NIP. {teacherUser.nis || '-'}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
