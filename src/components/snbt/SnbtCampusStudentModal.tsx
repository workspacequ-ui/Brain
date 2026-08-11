import React, { useState } from 'react';
import { SnbtCampusItem, SnbtMajorItem } from './snbtCampusData';
import { SnbtStudentProfile } from './snbtData';
import {
  X,
  Users,
  GraduationCap,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  Phone,
  MessageCircle,
  School,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SnbtCampusStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campus: SnbtCampusItem;
  major: SnbtMajorItem;
  students: SnbtStudentProfile[];
  onUpdateStudentTarget: (studentId: string, choiceNum: 1 | 2, ptnName: string, prodiName: string, passingGrade: number) => void;
  isAdminOrStaff?: boolean;
}

export const SnbtCampusStudentModal: React.FC<SnbtCampusStudentModalProps> = ({
  isOpen,
  onClose,
  campus,
  major,
  students,
  onUpdateStudentTarget,
  isAdminOrStaff = false
}) => {
  if (!isOpen) return null;

  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<string>('');
  const [choiceToSet, setChoiceToSet] = useState<1 | 2>(1);
  const [showAddForm, setShowAddForm] = useState(false);

  // Match students who have chosen this major (either ptn1/prodi1 or ptn2/prodi2)
  const interestedStudents = students.filter(std => {
    const matchPtn1 =
      std.targetPtn1.toLowerCase().includes(campus.shortName.toLowerCase()) ||
      std.targetPtn1.toLowerCase().includes(campus.name.toLowerCase());
    const matchProdi1 =
      std.prodi1.toLowerCase().includes(major.name.toLowerCase()) ||
      major.name.toLowerCase().includes(std.prodi1.toLowerCase());

    const matchPtn2 =
      std.targetPtn2.toLowerCase().includes(campus.shortName.toLowerCase()) ||
      std.targetPtn2.toLowerCase().includes(campus.name.toLowerCase());
    const matchProdi2 =
      std.prodi2.toLowerCase().includes(major.name.toLowerCase()) ||
      major.name.toLowerCase().includes(std.prodi2.toLowerCase());

    return (matchPtn1 && matchProdi1) || (matchPtn2 && matchProdi2);
  });

  const handlePairStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentToAdd) return;
    const formattedPtn = `${campus.name} (${campus.shortName})`;
    const formattedProdi = major.name;
    onUpdateStudentTarget(selectedStudentToAdd, choiceToSet, formattedPtn, formattedProdi, major.passingGrade);
    setSelectedStudentToAdd('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {campus.shortName} • {major.degree}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  major.cluster === 'SAINTEK'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {major.cluster}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {major.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-800/60 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Passing Grade</span>
            <span className="text-base font-extrabold text-amber-400 flex items-center gap-1">
              <Target className="w-4 h-4 text-amber-400" />
              {major.passingGrade} <span className="text-[10px] font-normal text-slate-400">IRT</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Daya Tampung</span>
            <span className="text-base font-extrabold text-white">
              {major.quota} <span className="text-xs font-normal text-slate-400">Kursi</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Keketatan Seleksi</span>
            <span className="text-xs font-bold text-rose-300">
              {major.tightnessRatio}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Siswa Bimbel Memilih</span>
            <span className="text-base font-extrabold text-emerald-400 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {interestedStudents.length} Siswa
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Header Action & Toggle Add */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span>Daftar Siswa Kelas XII-UTBK yang Menargetkan Jurusan Ini</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                {interestedStudents.length}
              </span>
            </h4>
            {isAdminOrStaff && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Tutup Form Pasangkan' : '+ Pasangkan Siswa'}</span>
              </button>
            )}
          </div>

          {/* Quick Assign Form */}
          {isAdminOrStaff && showAddForm && (
            <form onSubmit={handlePairStudent} className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Tetapkan Jurusan Ini sebagai Target Siswa</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300">Pilih Siswa</label>
                  <select
                    required
                    value={selectedStudentToAdd}
                    onChange={e => setSelectedStudentToAdd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Siswa XII-UTBK --</option>
                    {students.map(std => (
                      <option key={std.id} value={std.id}>
                        {std.name} ({std.nis}) - Avg Tryout: {std.avgTryoutScore}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300">Prioritas Pilihan</label>
                  <select
                    value={choiceToSet}
                    onChange={e => setChoiceToSet(Number(e.target.value) as 1 | 2)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Pilihan 1 (Utama)</option>
                    <option value={2}>Pilihan 2 (Cadangan)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentToAdd}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all"
                >
                  Simpan Pilihan Siswa
                </button>
              </div>
            </form>
          )}

          {/* Students List */}
          {interestedStudents.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-slate-800/30 border border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h5 className="text-sm font-semibold text-slate-300">Belum Ada Siswa yang Memilih Jurusan Ini</h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Klik tombol "+ Pasangkan Siswa" di atas untuk mendaftarkan siswa bimbel yang menargetkan {major.name}.
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Pasangkan Siswa Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {interestedStudents.map(std => {
                const isChoice1 =
                  (std.targetPtn1.toLowerCase().includes(campus.shortName.toLowerCase()) ||
                   std.targetPtn1.toLowerCase().includes(campus.name.toLowerCase())) &&
                  (std.prodi1.toLowerCase().includes(major.name.toLowerCase()) ||
                   major.name.toLowerCase().includes(std.prodi1.toLowerCase()));

                const diff = std.avgTryoutScore - major.passingGrade;
                const isSafe = diff >= 0;
                const isCompetitive = diff >= -15 && diff < 0;

                return (
                  <div
                    key={std.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={std.avatar}
                        alt={std.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-600 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{std.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">NIS: {std.nis}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isChoice1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700 text-slate-300 border border-slate-600'
                          }`}>
                            {isChoice1 ? 'Pilihan 1 (Utama)' : 'Pilihan 2'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{std.schoolOrigin} • {std.group}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Akun SNPMB: <span className="text-emerald-300 font-medium">{std.snpmbAccountStatus}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score comparison & chance */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Rerata Tryout IRT</div>
                        <div className="text-base font-extrabold text-white flex items-center justify-end gap-1">
                          {std.avgTryoutScore}
                          <span className="text-xs font-semibold text-slate-400">/ {major.passingGrade}</span>
                        </div>
                        <div className={`text-[10px] font-bold ${
                          isSafe
                            ? 'text-emerald-400'
                            : isCompetitive
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {diff >= 0 ? `+${diff} (Di Atas Passing Grade)` : `${diff} (Di Bawah Passing Grade)`}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-center ${
                          isSafe
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCompetitive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isSafe ? 'Peluang Aman' : isCompetitive ? 'Kompetitif' : 'Perlu Drill'}
                        </span>

                        {std.whatsapp && (
                          <a
                            href={`https://wa.me/${std.whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(std.name)},%20mari%20evaluasi%20progres%20SNBT%20kamu%20untuk%20jurusan%20${encodeURIComponent(major.name)}%20di%20${encodeURIComponent(campus.shortName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                            title="Chat WhatsApp Siswa"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="text-xs text-slate-400">
            Passing Grade dihitung berdasarkan algoritma Item Response Theory (IRT) Tryout Nasional 2026.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
