import React, { useState } from 'react';
import {
  SnbtSyllabusModule,
  SnbtSubtestCode,
  SnbtSubtestCategory,
  SnbtModuleDifficulty,
  SNBT_7_SUBTEST_METAS
} from './snbtSyllabusData';
import { SyllabusItem, Teacher } from '../../types';
import {
  X,
  BookOpen,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Link2,
  GraduationCap
} from 'lucide-react';

interface SnbtModuleEditModalProps {
  initialModule?: SnbtSyllabusModule | null;
  academicSyllabi: SyllabusItem[];
  teachers: Teacher[];
  onClose: () => void;
  onSave: (module: SnbtSyllabusModule) => void;
}

export const SnbtModuleEditModal: React.FC<SnbtModuleEditModalProps> = ({
  initialModule,
  academicSyllabi,
  teachers,
  onClose,
  onSave
}) => {
  const isEdit = !!initialModule;

  const [code, setCode] = useState(initialModule?.code || `MOD-SNBT-${Date.now().toString().slice(-4)}`);
  const [subtestCode, setSubtestCode] = useState<SnbtSubtestCode>(initialModule?.subtestCode || 'PU');
  const [title, setTitle] = useState(initialModule?.title || '');
  const [phaseNumber, setPhaseNumber] = useState<1 | 2 | 3 | 4 | 5>(initialModule?.phaseNumber || 1);
  const [weekNumber, setWeekNumber] = useState<number>(initialModule?.weekNumber || 1);
  const [targetScoreIrt, setTargetScoreIrt] = useState<number>(initialModule?.targetScoreIrt || 750);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialModule?.durationMinutes || 90);
  const [difficulty, setDifficulty] = useState<SnbtModuleDifficulty>(initialModule?.difficulty || 'MENENGAH');
  const [teacherInCharge, setTeacherInCharge] = useState<string>(
    initialModule?.teacherInCharge || teachers[0]?.name || 'Dr. Hendra Wijaya, M.Pd.'
  );
  const [description, setDescription] = useState(initialModule?.description || '');
  const [subtopics, setSubtopics] = useState<string[]>(
    initialModule?.subtopics?.length ? initialModule.subtopics : ['Topik Inti 1', 'Topik Inti 2']
  );
  const [competency, setCompetency] = useState(initialModule?.competency || '');
  const [conceptSummary, setConceptSummary] = useState(initialModule?.conceptSummary || '');
  const [flashFormula, setFlashFormula] = useState(initialModule?.flashFormula || '');
  const [academicSyllabusId, setAcademicSyllabusId] = useState(initialModule?.academicSyllabusId || '');
  const [linkedMaterialTitle, setLinkedMaterialTitle] = useState(initialModule?.linkedMaterialTitle || '');
  const [linkedMaterialUrl, setLinkedMaterialUrl] = useState(initialModule?.linkedMaterialUrl || '');
  const [linkedExamTitle, setLinkedExamTitle] = useState(initialModule?.linkedExamTitle || '');

  // Determine subtest category and phase name automatically
  const selectedMeta = SNBT_7_SUBTEST_METAS.find(s => s.code === subtestCode);
  const subtestName = selectedMeta?.name || 'Penalaran Umum';
  const category: SnbtSubtestCategory = selectedMeta?.category || 'TPS';

  const phaseNames: Record<number, string> = {
    1: 'Fase 1: Penguasaan Konsep Dasar',
    2: 'Fase 2: Pendalaman Trik Cepat',
    3: 'Fase 3: Bedah Soal HOTS',
    4: 'Fase 4: Drill Kecepatan & Tryout IRT',
    5: 'Fase 5: Final Review & Mental Prep'
  };

  const handleAddSubtopic = () => {
    setSubtopics([...subtopics, '']);
  };

  const handleUpdateSubtopic = (index: number, val: string) => {
    const updated = [...subtopics];
    updated[index] = val;
    setSubtopics(updated);
  };

  const handleRemoveSubtopic = (index: number) => {
    setSubtopics(subtopics.filter((_, i) => i !== index));
  };

  const handleAcademicSyllabusChange = (sId: string) => {
    setAcademicSyllabusId(sId);
    if (sId) {
      const found = academicSyllabi.find(s => s.id === sId);
      if (found && !title) {
        setTitle(found.title);
      }
      if (found && !description) {
        setDescription(found.description);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const moduleData: SnbtSyllabusModule = {
      id: initialModule?.id || `mod-snbt-${Date.now()}`,
      code: code.trim(),
      subtestCode,
      subtestName,
      category,
      title: title.trim(),
      phaseNumber,
      phaseName: phaseNames[phaseNumber],
      weekNumber: Number(weekNumber) || 1,
      targetScoreIrt: Number(targetScoreIrt) || 750,
      durationMinutes: Number(durationMinutes) || 90,
      difficulty,
      teacherInCharge,
      description: description.trim(),
      subtopics: subtopics.filter(s => s.trim().length > 0),
      competency: competency.trim(),
      conceptSummary: conceptSummary.trim(),
      flashFormula: flashFormula.trim(),
      academicSyllabusId: academicSyllabusId || undefined,
      linkedMaterialTitle: linkedMaterialTitle.trim() || undefined,
      linkedMaterialUrl: linkedMaterialUrl.trim() || undefined,
      linkedExamTitle: linkedExamTitle.trim() || undefined,
      isOfficialBlueprint: initialModule?.isOfficialBlueprint ?? false
    };

    onSave(moduleData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {isEdit ? 'Edit Modul Silabus SNBT' : 'Tambah Modul Silabus SNBT'}
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi rincian silabus, kompetensi, dan target skor IRT 7 Subtes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-sm">
          {/* Row 1: Subtes & Kode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                7 Subtes UTBK-SNBT *
              </label>
              <select
                value={subtestCode}
                onChange={e => setSubtestCode(e.target.value as SnbtSubtestCode)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
              >
                {SNBT_7_SUBTEST_METAS.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code}) - {s.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kode Modul *
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-medium focus:border-indigo-500 focus:outline-none"
                placeholder="MOD-PU-01"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tingkat Kesulitan
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as SnbtModuleDifficulty)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-indigo-500 focus:outline-none"
              >
                <option value="DASAR">DASAR (Konsep Utama)</option>
                <option value="MENENGAH">MENENGAH (Aplikasi)</option>
                <option value="HOTS">HOTS (Analisis Tinggi)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Judul Modul */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Pokok Bahasan Modul *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:border-indigo-500 focus:outline-none"
              placeholder="Contoh: Mastery Silogisme Formal & Modus Ponens"
            />
          </div>

          {/* Row 3: Timeline & Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fase Pembelajaran
              </label>
              <select
                value={phaseNumber}
                onChange={e => setPhaseNumber(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1}>Fase 1: Konsep Dasar</option>
                <option value={2}>Fase 2: Pendalaman Trik</option>
                <option value={3}>Fase 3: Bedah Soal HOTS</option>
                <option value={4}>Fase 4: Speed Drill & IRT</option>
                <option value={5}>Fase 5: Final Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pekan Ke- (1 - 20)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={weekNumber}
                onChange={e => setWeekNumber(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Skor IRT
              </label>
              <input
                type="number"
                min={400}
                max={1000}
                step={10}
                value={targetScoreIrt}
                onChange={e => setTargetScoreIrt(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Durasi (Menit)
              </label>
              <input
                type="number"
                min={30}
                max={300}
                step={15}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Guru PIC & Integrasi Silabus Akademik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Guru Pengampu PIC
              </label>
              <select
                value={teacherInCharge}
                onChange={e => setTeacherInCharge(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Integrasikan Data Silabus Akademik
              </label>
              <select
                value={academicSyllabusId}
                onChange={e => handleAcademicSyllabusChange(e.target.value)}
                className="w-full bg-slate-800 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-indigo-200 focus:border-indigo-400 focus:outline-none"
              >
                <option value="">-- Tidak Terhubung / Mandiri --</option>
                {academicSyllabi.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.title} ({s.targetClass})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & Competency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Deskripsi Modul Pembelajaran
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
                placeholder="Rangkuman tujuan pokok bahasan..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Capaian Kompetensi Ujian
              </label>
              <textarea
                rows={3}
                value={competency}
                onChange={e => setCompetency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-amber-200 text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
                placeholder="Target kemampuan siswa setelah menuntaskan modul..."
              />
            </div>
          </div>

          {/* Flash Formula & Concept Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Rumus Kilat & Trik Eliminasi Opsi (Speed Strategy)
              </label>
              <textarea
                rows={3}
                value={flashFormula}
                onChange={e => setFlashFormula(e.target.value)}
                className="w-full bg-slate-800 border border-rose-500/40 rounded-xl p-3 text-rose-100 text-xs font-mono focus:border-rose-400 focus:outline-none"
                placeholder="Trik eliminasi, counter-example, atau rumus praktis..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1.5">
                Intisari Teori & Landasan Konsep
              </label>
              <textarea
                rows={3}
                value={conceptSummary}
                onChange={e => setConceptSummary(e.target.value)}
                className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl p-3 text-cyan-100 text-xs focus:border-cyan-400 focus:outline-none"
                placeholder="Ringkasan konsep kunci yang wajib dihafal..."
              />
            </div>
          </div>

          {/* Subtopics Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Rincian Sub-Topik Pokok Bahasan
              </label>
              <button
                type="button"
                onClick={handleAddSubtopic}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Sub-Topik
              </button>
            </div>
            <div className="space-y-2">
              {subtopics.map((sub, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 w-5">{index + 1}.</span>
                  <input
                    type="text"
                    value={sub}
                    onChange={e => handleUpdateSubtopic(index, e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    placeholder={`Sub-topik materi ${index + 1}`}
                  />
                  {subtopics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtopic(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Links & Materials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Link Modul E-Book PDF / Drive
              </label>
              <input
                type="url"
                value={linkedMaterialUrl}
                onChange={e => setLinkedMaterialUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:border-indigo-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Judul Latihan Soal CBT Terkait
              </label>
              <input
                type="text"
                value={linkedExamTitle}
                onChange={e => setLinkedExamTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:border-indigo-500 focus:outline-none"
                placeholder="Simulasi UTBK SNBT 2026 - Paket 1"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambahkan Modul'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
