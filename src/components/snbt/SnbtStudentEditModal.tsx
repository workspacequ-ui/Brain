import React, { useState, useEffect } from 'react';
import { SnbtStudentProfile, SnbtSubtestScore } from './snbtData';
import {
  X,
  Save,
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  School,
  ShieldCheck,
  Eye
} from 'lucide-react';

interface SnbtStudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: SnbtStudentProfile | null;
  onSave?: (updatedStudent: SnbtStudentProfile) => void;
  readOnly?: boolean;
}

export const SnbtStudentEditModal: React.FC<SnbtStudentEditModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<SnbtStudentProfile | null>(null);

  useEffect(() => {
    if (student) {
      setFormData(JSON.parse(JSON.stringify(student)));
    } else {
      setFormData(null);
    }
  }, [student]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !formData || !onSave) return;

    // Recalculate average score from subtests
    const totalSub = formData.subtestScores.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = Math.round(totalSub / formData.subtestScores.length);

    const finalStudent: SnbtStudentProfile = {
      ...formData,
      avgTryoutScore: avgScore
    };

    onSave(finalStudent);
    onClose();
  };

  const handleSubtestScoreChange = (index: number, newScore: number) => {
    if (readOnly) return;
    const updatedSub = [...formData.subtestScores];
    updatedSub[index] = {
      ...updatedSub[index],
      score: newScore,
      accuracy: Math.min(100, Math.round((newScore / updatedSub[index].targetScore) * 100))
    };
    setFormData({
      ...formData,
      subtestScores: updatedSub
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${readOnly ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white shadow-md`}>
              {readOnly ? <Eye className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-black text-white">
                  {readOnly ? 'Detail Profil & Target PTN Siswa' : 'Edit Profil & Target PTN Siswa XII-UTBK'}
                </h2>
                {readOnly && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Mode Baca Siswa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {formData.name} ({formData.nis}) • {formData.group}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Target PTN & Program Studi */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-4 h-4" />
              <span>Target Kampus & Program Studi SNBT</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pilihan 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">Pilihan 1 (Prioritas Utama)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">PTN 1</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Perguruan Tinggi Negeri</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={formData.targetPtn1}
                    onChange={e => setFormData({ ...formData, targetPtn1: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                    placeholder="misal: Universitas Indonesia (UI)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Program Studi / Fakultas</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={formData.prodi1}
                    onChange={e => setFormData({ ...formData, prodi1: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                    placeholder="misal: Pendidikan Dokter"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Passing Grade Estimasi</label>
                  <input
                    type="number"
                    disabled={readOnly}
                    value={formData.passingGrade1}
                    onChange={e => setFormData({ ...formData, passingGrade1: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                    min="400"
                    max="900"
                    required
                  />
                </div>
              </div>

              {/* Pilihan 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">Pilihan 2 (Cadangan Strategis)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">PTN 2</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Perguruan Tinggi Negeri</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={formData.targetPtn2}
                    onChange={e => setFormData({ ...formData, targetPtn2: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                    placeholder="misal: Institut Teknologi Bandung (ITB)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Program Studi / Fakultas</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={formData.prodi2}
                    onChange={e => setFormData({ ...formData, prodi2: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                    placeholder="misal: STEI"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Passing Grade Estimasi</label>
                  <input
                    type="number"
                    disabled={readOnly}
                    value={formData.passingGrade2}
                    onChange={e => setFormData({ ...formData, passingGrade2: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                    min="400"
                    max="900"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Status SNPMB & Kesiapan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Status Akun SNPMB
              </label>
              <select
                disabled={readOnly}
                value={formData.snpmbAccountStatus}
                onChange={e => setFormData({ ...formData, snpmbAccountStatus: e.target.value as any })}
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
              >
                <option value="TERVERIFIKASI">TERVERIFIKASI (Simpan Permanen)</option>
                <option value="PERLU_FINALISASI">PERLU FINALISASI</option>
                <option value="BELUM_DAFTAR">BELUM DAFTAR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tingkat Kesiapan Siswa
              </label>
              <select
                disabled={readOnly}
                value={formData.readinessLevel}
                onChange={e => setFormData({ ...formData, readinessLevel: e.target.value as any })}
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
              >
                <option value="SANGAT_SIAP">Sangat Siap (Skor ≥ 720)</option>
                <option value="SIAP">Siap (Skor 650 - 719)</option>
                <option value="PERLU_BIMBINGAN">Perlu Bimbingan Khusus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Skor Keseluruhan
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={formData.targetOverallScore}
                onChange={e => setFormData({ ...formData, targetOverallScore: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                min="500"
                max="900"
                required
              />
            </div>
          </div>

          {/* Section 3: 7 Subtest Scores Editor */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Nilai Skor Terbaru 7 Subtes UTBK</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {formData.subtestScores.map((sub, idx) => (
                <div key={sub.code} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-black text-slate-400">{sub.code}</div>
                  <input
                    type="number"
                    disabled={readOnly}
                    value={sub.score}
                    onChange={e => handleSubtestScoreChange(idx, Number(e.target.value))}
                    className={`w-full px-2 py-1 text-center font-mono font-bold text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 ${readOnly ? 'opacity-90 cursor-default' : ''}`}
                    min="300"
                    max="900"
                  />
                  <div className="text-[9px] text-slate-500">Tgt: {sub.targetScore}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Counselor Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Catatan Evaluasi & Rekomendasi Konselor
            </label>
            <textarea
              disabled={readOnly}
              value={formData.counselorNotes}
              onChange={e => setFormData({ ...formData, counselorNotes: e.target.value })}
              rows={3}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed ${readOnly ? 'opacity-80 cursor-default' : ''}`}
              placeholder="Tuliskan rekomendasi belajar, subtes yang harus ditingkatkan, dan strategi pilihan prodi..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {readOnly ? 'Tutup' : 'Batal'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
