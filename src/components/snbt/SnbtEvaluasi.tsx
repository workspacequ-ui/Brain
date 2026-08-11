import React, { useState, useMemo, useEffect } from 'react';
import { User, SidebarTab } from '../../types';
import {
  SnbtStudentProfile,
  SnbtSubtestScore,
  saveStoredSnbtStudents
} from './snbtData';
import {
  Award,
  Users,
  Target,
  Building2,
  FileText,
  Save,
  Printer,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';

interface SnbtEvaluasiProps {
  user: User;
  students: SnbtStudentProfile[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onUpdateStudents: (updated: SnbtStudentProfile[]) => void;
  onOpenPrint?: (mode: 'STUDENT_REPORT' | 'CLASS_ROSTER' | 'SUBTEST_ANALYSIS') => void;
  onExportCsv?: () => void;
  onNavigateTab?: (tab: SidebarTab) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SnbtEvaluasi: React.FC<SnbtEvaluasiProps> = ({
  user,
  students,
  selectedStudentId,
  onSelectStudent,
  onUpdateStudents,
  onOpenPrint,
  onExportCsv,
  onNavigateTab,
  onShowToast
}) => {
  const [editingNote, setEditingNote] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (currentStudent) {
      setEditingNote(currentStudent.counselorNotes || '');
      setIsEditingNote(false);
    }
  }, [currentStudent]);

  const isAdminOrStaffOrTeacher = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'teacher';

  const handleSaveNote = () => {
    if (!isAdminOrStaffOrTeacher) {
      if (onShowToast) {
        onShowToast('Siswa tidak memiliki izin untuk mengubah catatan evaluasi konselor.', 'error');
      }
      return;
    }
    if (!currentStudent) return;
    const updated = students.map(s => {
      if (s.id === currentStudent.id) {
        return { ...s, counselorNotes: editingNote };
      }
      return s;
    });
    onUpdateStudents(updated);
    saveStoredSnbtStudents(updated);
    setIsEditingNote(false);
    if (onShowToast) {
      onShowToast(`Catatan konselor untuk ${currentStudent.name} berhasil disimpan!`, 'success');
    }
  };

  const getPtnChance = (studentScore: number, passingGrade: number) => {
    const diff = studentScore - passingGrade;
    if (diff >= 10) {
      return {
        label: 'Sangat Aman',
        color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
        percent: Math.min(96, Math.max(80, 85 + diff * 0.5)),
        diff: `+${diff}`
      };
    }
    if (diff >= -15) {
      return {
        label: 'Kompetitif / Realistis',
        color: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
        percent: Math.max(50, 70 + diff * 0.8),
        diff: `${diff > 0 ? '+' : ''}${diff}`
      };
    }
    return {
      label: 'Perlu Peningkatan Skor',
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
      percent: Math.max(25, 45 + diff * 0.5),
      diff: `${diff}`
    };
  };

  const filteredStudentPills = useMemo(() => {
    if (!studentSearch.trim()) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nis.includes(studentSearch) ||
      s.group.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  if (!currentStudent) return null;

  const chance1 = getPtnChance(currentStudent.avgTryoutScore, currentStudent.passingGrade1);
  const chance2 = getPtnChance(currentStudent.avgTryoutScore, currentStudent.passingGrade2);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="snbt-evaluasi-section">
      {/* Student Selector Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Users className="w-4 h-4 text-indigo-400" />
            Pilih Siswa:
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {filteredStudentPills.map(s => {
              const isSelected = s.id === selectedStudentId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectStudent(s.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500 shadow-md scale-105'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-5 h-5 rounded-full object-cover border border-indigo-400/40"
                  />
                  <span>{s.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] text-slate-400">({s.avgTryoutScore})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenPrint && (
            <button
              type="button"
              onClick={() => onOpenPrint('STUDENT_REPORT')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rapor Evaluasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Identity & Right PTN Estimates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Identity & Counselor Note */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
            />
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {currentStudent.group}
              </span>
              <h2 className="text-lg font-black text-white">{currentStudent.name}</h2>
              <p className="text-xs text-slate-400">NIS: <span className="font-mono font-bold text-slate-300">{currentStudent.nis}</span> • {currentStudent.schoolOrigin}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status Akun SNPMB:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {currentStudent.snpmbAccountStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Level Kesiapan:</span>
              <span className="font-bold text-indigo-300">{currentStudent.readinessLevel.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Skor Keseluruhan:</span>
              <span className="font-mono font-black text-amber-400">{currentStudent.targetOverallScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Rata-Rata Skor Terkini:</span>
              <span className="font-mono font-black text-indigo-400 text-sm">{currentStudent.avgTryoutScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Skor Tertinggi TO:</span>
              <span className="font-mono font-bold text-amber-400">{currentStudent.highestTryoutScore}</span>
            </div>
          </div>

          {/* Counselor Note Section */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Catatan & Rekomendasi Konselor
              </span>
              {isAdminOrStaffOrTeacher && (
                !isEditingNote ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(true)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Edit Catatan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    Simpan
                  </button>
                )
              )}
            </div>

            {isEditingNote ? (
              <textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Tulis catatan evaluasi atau strategi belajar..."
              />
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{currentStudent.counselorNotes || 'Belum ada catatan konselor untuk siswa ini.'}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Target PTN 1 & 2 Chances */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                <Target className="w-4 h-4 text-rose-400" />
                Estimasi Peluang Masuk PTN Impian
              </h3>
              <span className="text-xs text-slate-400">Rata-Rata Skor IRT: <strong className="text-indigo-300 font-mono">{currentStudent.avgTryoutScore}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pilihan 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    PILIHAN 1 (UTAMA)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${chance1.color}`}>
                    {chance1.label}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-white text-sm">{currentStudent.prodi1}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    {currentStudent.targetPtn1}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Passing Grade Est: <strong>{currentStudent.passingGrade1}</strong></span>
                    <span className="font-mono font-bold text-indigo-300">Selisih: {chance1.diff} poin</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${chance1.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">Peluang Lolos: <strong className="text-emerald-400">{chance1.percent.toFixed(0)}%</strong></p>
                </div>
              </div>

              {/* Pilihan 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    PILIHAN 2 (PENGAMAN)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${chance2.color}`}>
                    {chance2.label}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-white text-sm">{currentStudent.prodi2}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {currentStudent.targetPtn2}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Passing Grade Est: <strong>{currentStudent.passingGrade2}</strong></span>
                    <span className="font-mono font-bold text-blue-300">Selisih: {chance2.diff} poin</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${chance2.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">Peluang Lolos: <strong className="text-blue-400">{chance2.percent.toFixed(0)}%</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Tryout Siswa */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Histori Tryout Siswa
              </h3>
              <span className="text-xs text-emerald-400 font-bold">Konsistensi Positif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentStudent.tryoutHistory.map(to => (
                <div
                  key={to.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400">{to.date}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300">
                      Rank #{to.rank}
                    </span>
                  </div>
                  <p className="font-bold text-white text-xs truncate">{to.tryoutName}</p>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400 text-[11px]">Skor Total IRT:</span>
                    <span className="text-base font-black text-indigo-400 font-mono">{to.totalScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7 Subtests Breakdown for Current Student */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              Capaian 7 Subtes {currentStudent.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rincian nilai IRT, akurasi pengerjaan, dan status ketuntasan per subtes resmi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {currentStudent.subtestScores.map(sub => {
            const isTargetPassed = sub.score >= sub.targetScore;
            return (
              <div
                key={sub.code}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isTargetPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isTargetPassed ? 'TUNTAS' : 'DRILL'}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-white text-xs line-clamp-1" title={sub.name}>{sub.name}</p>
                  <p className="text-[10px] text-slate-500">{sub.category}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400">Skor IRT:</span>
                    <span className="font-mono font-black text-indigo-400 text-sm">{sub.score}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Akurasi: {sub.accuracy.toFixed(0)}%</span>
                    <span>{sub.correct}/{sub.totalQuestions} Soal</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
