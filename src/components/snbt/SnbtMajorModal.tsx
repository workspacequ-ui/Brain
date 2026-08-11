import React, { useState } from 'react';
import { SnbtCampusItem, SnbtMajorItem, SnbtMajorCluster, SnbtDegreeLevel } from './snbtCampusData';
import {
  X,
  GraduationCap,
  Award,
  Target,
  Users,
  Percent,
  Sparkles,
  Save,
  Trash2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

interface SnbtMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: SnbtCampusItem[];
  selectedCampusId?: string;
  major?: SnbtMajorItem | null; // null if creating new
  onSave: (campusId: string, major: SnbtMajorItem) => void;
  onDelete?: (campusId: string, majorId: string) => void;
}

export const SnbtMajorModal: React.FC<SnbtMajorModalProps> = ({
  isOpen,
  onClose,
  campuses,
  selectedCampusId,
  major,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isEditing = !!major;

  const [targetCampusId, setTargetCampusId] = useState<string>(
    selectedCampusId || (campuses.length > 0 ? campuses[0].id : '')
  );

  const [formData, setFormData] = useState<SnbtMajorItem>(() => {
    if (major) {
      return { ...major };
    }
    return {
      id: `major-custom-${Date.now()}`,
      code: `${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      faculty: 'Fakultas Teknik',
      degree: 'S1',
      cluster: 'SAINTEK',
      passingGrade: 680,
      quota: 60,
      applicantsLastYear: 1800,
      tightnessRatio: '1 : 30.0 (3.33%)',
      accreditation: 'Unggul',
      careerProspects: ['Spesialis Industri', 'Konsultan Ahli', 'Peneliti'],
      specialRequirements: ''
    };
  });

  const [careerInput, setCareerInput] = useState(
    (formData.careerProspects || []).join(', ')
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  // Recalculate tightness ratio whenever quota or applicants change
  const handleQuotaChange = (newQuota: number) => {
    const quotaVal = Math.max(1, newQuota);
    const applicantsVal = formData.applicantsLastYear;
    const ratio = applicantsVal > 0 ? (applicantsVal / quotaVal).toFixed(1) : '0';
    const pct = applicantsVal > 0 ? ((quotaVal / applicantsVal) * 100).toFixed(2) : '0';
    setFormData(prev => ({
      ...prev,
      quota: quotaVal,
      tightnessRatio: `1 : ${ratio} (${pct}%)`
    }));
  };

  const handleApplicantsChange = (newApplicants: number) => {
    const applicantsVal = Math.max(1, newApplicants);
    const quotaVal = formData.quota;
    const ratio = quotaVal > 0 ? (applicantsVal / quotaVal).toFixed(1) : '0';
    const pct = applicantsVal > 0 ? ((quotaVal / applicantsVal) * 100).toFixed(2) : '0';
    setFormData(prev => ({
      ...prev,
      applicantsLastYear: applicantsVal,
      tightnessRatio: `1 : ${ratio} (${pct}%)`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama Program Studi wajib diisi!');
      return;
    }
    if (!targetCampusId) {
      alert('Pilih Kampus PTN terlebih dahulu!');
      return;
    }

    const careerList = careerInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const savedMajor: SnbtMajorItem = {
      ...formData,
      careerProspects: careerList.length > 0 ? careerList : ['Tenaga Ahli Profesional', 'Peneliti / Akademisi']
    };

    onSave(targetCampusId, savedMajor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Edit Jurusan: ${formData.name}` : 'Tambah Program Studi / Jurusan PTN'}
              </h3>
              <p className="text-xs text-slate-400">
                Passing Grade IRT SNBT, kuota daya tampung, dan rasio keketatan
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Campus */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Perguruan Tinggi Negeri (PTN) <span className="text-rose-400">*</span>
            </label>
            <select
              value={targetCampusId}
              disabled={isEditing}
              onChange={e => setTargetCampusId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
            >
              {campuses.map(camp => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.shortName}) - {camp.city}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1: Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Nama Program Studi / Jurusan <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pendidikan Dokter (FK UI)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kode SNPMB
              </label>
              <input
                type="text"
                placeholder="Contoh: 311012"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Faculty, Degree, Cluster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Fakultas / Sekolah
              </label>
              <input
                type="text"
                placeholder="Fakultas Kedokteran"
                value={formData.faculty}
                onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Jenjang
              </label>
              <select
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value as SnbtDegreeLevel })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="S1">Sarjana (S1)</option>
                <option value="D4">Sarjana Terapan (D4)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Rumpun Keilmuan
              </label>
              <select
                value={formData.cluster}
                onChange={e => setFormData({ ...formData, cluster: e.target.value as SnbtMajorCluster })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="SAINTEK">Sains & Teknologi (SAINTEK)</option>
                <option value="SOSHUM">Sosial & Humaniora (SOSHUM)</option>
                <option value="CAMPURAN">Campuran / Vokasi</option>
              </select>
            </div>
          </div>

          {/* Row 3: Passing Grade, Quota, Applicants */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-300">
                  Passing Grade (Skor IRT) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Skala 200-1000</span>
              </div>
              <div className="relative">
                <Target className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={400}
                  max={950}
                  required
                  value={formData.passingGrade}
                  onChange={e => setFormData({ ...formData, passingGrade: Number(e.target.value) || 600 })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-amber-500/40 rounded-xl text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Daya Tampung SNBT 2026
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={formData.quota}
                  onChange={e => handleQuotaChange(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Peminat Tahun Lalu
              </label>
              <input
                type="number"
                min={1}
                max={50000}
                value={formData.applicantsLastYear}
                onChange={e => handleApplicantsChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Tightness & Accreditation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Rasio Keketatan Seleksi (Auto)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-rose-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.tightnessRatio}
                  onChange={e => setFormData({ ...formData, tightnessRatio: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-rose-300 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Akreditasi Program Studi
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: Unggul & ASIIN Internasional"
                  value={formData.accreditation}
                  onChange={e => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Career Prospects */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Prospek Karir / Lulusan (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Software Engineer, Data Scientist, Tech Lead"
              value={careerInput}
              onChange={e => setCareerInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 6: Special Requirements */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Syarat Khusus / Portofolio (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Bebas Buta Warna Total & Parsial / Portofolio Seni Rupa"
              value={formData.specialRequirements || ''}
              onChange={e => setFormData({ ...formData, specialRequirements: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Delete section if editing */}
          {isEditing && onDelete && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Program Studi Ini</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-rose-950/60 border border-rose-800/80 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs text-rose-200 font-medium">Yakin hapus prodi?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(targetCampusId, formData.id)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-slate-400 hover:text-white text-xs rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Program Studi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
