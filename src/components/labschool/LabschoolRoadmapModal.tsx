import React, { useState, useEffect } from 'react';
import {
  RoadmapPhase,
  RoadmapMilestone
} from './labschoolRoadmapData';
import {
  X,
  Plus,
  Save,
  Trash2,
  Edit3,
  Layers,
  BookOpen,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Settings
} from 'lucide-react';

interface LabschoolRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  phases: RoadmapPhase[];
  milestones: RoadmapMilestone[];
  onSaveMilestone: (milestone: RoadmapMilestone, isNew: boolean) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onSavePhase: (phase: RoadmapPhase) => void;
  onResetToDefault: () => void;
  initialMilestone?: RoadmapMilestone | null;
  defaultPhaseId?: number;
}

export const LabschoolRoadmapModal: React.FC<LabschoolRoadmapModalProps> = ({
  isOpen,
  onClose,
  phases,
  milestones,
  onSaveMilestone,
  onDeleteMilestone,
  onSavePhase,
  onResetToDefault,
  initialMilestone,
  defaultPhaseId
}) => {
  const [activeTab, setActiveTab] = useState<'milestone_form' | 'phase_manager' | 'milestone_list'>('milestone_form');

  // Milestone Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [phaseId, setPhaseId] = useState<number>(defaultPhaseId || 1);
  const [level, setLevel] = useState<'SMP' | 'SMA' | 'ALL'>('ALL');
  const [weekRange, setWeekRange] = useState<string>('Minggu 1 - 2');
  const [title, setTitle] = useState<string>('');
  const [focus, setFocus] = useState<string>('');
  const [subtestCategory, setSubtestCategory] = useState<string>('Matematika Penalaran');
  const [deliverables, setDeliverables] = useState<string>('Modul Latihan 80 Soal + Pembahasan');
  const [estHours, setEstHours] = useState<number>(15);
  const [importance, setImportance] = useState<'HIGH' | 'CRITICAL' | 'MEDIUM'>('HIGH');
  const [topicsText, setTopicsText] = useState<string>('');

  // Phase editing state
  const [selectedPhaseToEdit, setSelectedPhaseToEdit] = useState<RoadmapPhase | null>(null);
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseSubtitle, setPhaseSubtitle] = useState('');
  const [phaseDuration, setPhaseDuration] = useState('');
  const [phaseBadge, setPhaseBadge] = useState('');
  const [phaseDesc, setPhaseDesc] = useState('');
  const [phaseColor, setPhaseColor] = useState<'blue' | 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose'>('blue');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (initialMilestone) {
      setIsEditing(true);
      setMilestoneId(initialMilestone.id);
      setPhaseId(initialMilestone.phaseId);
      setLevel(initialMilestone.level);
      setWeekRange(initialMilestone.weekRange);
      setTitle(initialMilestone.title);
      setFocus(initialMilestone.focus);
      setSubtestCategory(initialMilestone.subtestCategory || 'Matematika Penalaran');
      setDeliverables(initialMilestone.deliverables);
      setEstHours(initialMilestone.estHours);
      setImportance(initialMilestone.importance);
      setTopicsText(initialMilestone.topics.join('\n'));
      setActiveTab('milestone_form');
    } else {
      setIsEditing(false);
      setMilestoneId(`milestone-${Date.now()}`);
      setPhaseId(defaultPhaseId || 1);
      setLevel('ALL');
      setWeekRange('Minggu 1 - 2');
      setTitle('');
      setFocus('');
      setSubtestCategory('Matematika Penalaran');
      setDeliverables('Modul Latihan 80 Soal + Pembahasan');
      setEstHours(15);
      setImportance('HIGH');
      setTopicsText('');
    }
  }, [initialMilestone, defaultPhaseId, isOpen]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartNewMilestone = () => {
    setIsEditing(false);
    setMilestoneId(`milestone-${Date.now()}`);
    setPhaseId(1);
    setLevel('ALL');
    setWeekRange('Minggu 1 - 2');
    setTitle('');
    setFocus('');
    setSubtestCategory('Matematika Penalaran');
    setDeliverables('Modul Latihan 80 Soal + Pembahasan');
    setEstHours(15);
    setImportance('HIGH');
    setTopicsText('');
    setActiveTab('milestone_form');
  };

  const handleEditMilestoneFromList = (m: RoadmapMilestone) => {
    setIsEditing(true);
    setMilestoneId(m.id);
    setPhaseId(m.phaseId);
    setLevel(m.level);
    setWeekRange(m.weekRange);
    setTitle(m.title);
    setFocus(m.focus);
    setSubtestCategory(m.subtestCategory || 'Matematika Penalaran');
    setDeliverables(m.deliverables);
    setEstHours(m.estHours);
    setImportance(m.importance);
    setTopicsText(m.topics.join('\n'));
    setActiveTab('milestone_form');
  };

  const handleSubmitMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification('Judul modul/milestone tidak boleh kosong', 'error');
      return;
    }

    const topicsArray = topicsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (topicsArray.length === 0) {
      showNotification('Masukkan minimal satu topik/materi bahasan', 'error');
      return;
    }

    const newMilestone: RoadmapMilestone = {
      id: milestoneId || `milestone-${Date.now()}`,
      phaseId,
      level,
      weekRange: weekRange || 'Minggu 1 - 2',
      title: title.trim(),
      focus: focus.trim() || title.trim(),
      subtestCategory,
      topics: topicsArray,
      deliverables: deliverables.trim() || 'Modul Latihan',
      estHours: Number(estHours) || 12,
      importance,
      order: Date.now()
    };

    onSaveMilestone(newMilestone, !isEditing);
    showNotification(isEditing ? 'Milestone berhasil diperbarui!' : 'Milestone baru berhasil ditambahkan!');
    if (!isEditing) {
      handleStartNewMilestone();
    }
  };

  const handleStartEditPhase = (p: RoadmapPhase) => {
    setSelectedPhaseToEdit(p);
    setPhaseTitle(p.title);
    setPhaseSubtitle(p.subtitle);
    setPhaseDuration(p.duration);
    setPhaseBadge(p.badge);
    setPhaseDesc(p.desc);
    setPhaseColor(p.color);
    setActiveTab('phase_manager');
  };

  const handleSavePhaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhaseToEdit) return;

    const updatedPhase: RoadmapPhase = {
      ...selectedPhaseToEdit,
      title: phaseTitle.trim() || selectedPhaseToEdit.title,
      subtitle: phaseSubtitle.trim() || selectedPhaseToEdit.subtitle,
      duration: phaseDuration.trim() || selectedPhaseToEdit.duration,
      badge: phaseBadge.trim() || selectedPhaseToEdit.badge,
      desc: phaseDesc.trim() || selectedPhaseToEdit.desc,
      color: phaseColor
    };

    onSavePhase(updatedPhase);
    setSelectedPhaseToEdit(null);
    showNotification('Informasi fase berhasil diperbarui!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Kelola Kurikulum & Roadmap Labschool
              </h2>
              <p className="text-xs text-slate-400">
                Fitur Admin CRUD untuk mengelola modul roadmap, fase kurikulum, dan silabus ujian
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('milestone_form')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'milestone_form'
                  ? 'border-blue-500 text-white bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {isEditing ? '✏️ Edit Modul Milestone' : '➕ Tambah Modul Baru'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('milestone_list')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'milestone_list'
                  ? 'border-blue-500 text-white bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              📋 Daftar Semua Modul ({milestones.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('phase_manager')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'phase_manager'
                  ? 'border-blue-500 text-white bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              ⚙️ Pengaturan 4 Fase
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset seluruh roadmap dan fase kembali ke data default Labschool?')) {
                onResetToDefault();
                showNotification('Roadmap berhasil direset ke default!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all mb-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

          {/* TAB 1: MILESTONE FORM (ADD / EDIT) */}
          {activeTab === 'milestone_form' && (
            <form onSubmit={handleSubmitMilestone} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fase */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Fase Belajar <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={phaseId}
                    onChange={(e) => setPhaseId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.number}: {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenjang Target */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Jenjang Target <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as 'SMP' | 'SMA' | 'ALL')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">Semua Jenjang (SMP & SMA)</option>
                    <option value="SMP">SMP Labschool (Kelas 6 SD)</option>
                    <option value="SMA">SMA Labschool (Kelas 9 SMP)</option>
                  </select>
                </div>

                {/* Rentang Waktu / Minggu */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Rentang Waktu <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={weekRange}
                    onChange={(e) => setWeekRange(e.target.value)}
                    placeholder="Contoh: Minggu 3 - 5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Judul Milestone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Judul Modul / Tahapan <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pondasi Aljabar & Persamaan Kuadrat (SMA)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fokus Pokok Bahasan */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Fokus Pokok Bahasan
                  </label>
                  <input
                    type="text"
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="Contoh: Aritmatika Sosial, Pecahan, Deret Angka..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Kategori Subtes */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Kategori Subtes Labschool
                  </label>
                  <input
                    type="text"
                    value={subtestCategory}
                    onChange={(e) => setSubtestCategory(e.target.value)}
                    placeholder="Contoh: Matematika Penalaran / Sains Terpadu / TPA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Estimasi Jam */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Estimasi Jam Belajar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={estHours}
                    onChange={(e) => setEstHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Prioritas / Importance */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value as 'HIGH' | 'CRITICAL' | 'MEDIUM')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Prioritas Tertinggi)</option>
                    <option value="HIGH">HIGH (Prioritas Tinggi)</option>
                    <option value="MEDIUM">MEDIUM (Standar)</option>
                  </select>
                </div>

                {/* Deliverables */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Output / Deliverable
                  </label>
                  <input
                    type="text"
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    placeholder="Contoh: Modul 80 Soal + Pembahasan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Topics / Silabus Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Daftar Silabus & Pokok Materi <span className="text-rose-400">*</span>
                  <span className="text-slate-400 font-normal ml-2 text-[11px]">
                    (Satu pokok bahasan per baris)
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={topicsText}
                  onChange={(e) => setTopicsText(e.target.value)}
                  placeholder="Contoh:&#10;Operasi Hitung Campuran Bilangan Bulat&#10;KPK, FPB & Aplikasi Soal Cerita&#10;Perbandingan Senilai & Skala Peta"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:border-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartNewMilestone}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Batal Edit & Tambah Baru
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Milestone'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: MILESTONE LIST FOR RAPID CRUD */}
          {activeTab === 'milestone_list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  Total {milestones.length} modul aktif di roadmap
                </span>
                <button
                  type="button"
                  onClick={handleStartNewMilestone}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Modul</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {milestones.map((m, idx) => {
                  const ph = phases.find((p) => p.id === m.phaseId) || phases[0];
                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                            {ph.number}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {m.weekRange}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                            {m.level}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{m.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{m.focus}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditMilestoneFromList(m)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus modul "${m.title}" dari roadmap?`)) {
                              onDeleteMilestone(m.id);
                              showNotification('Modul berhasil dihapus!');
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all"
                          title="Hapus Modul"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PHASE MANAGER */}
          {activeTab === 'phase_manager' && (
            <div className="space-y-6">
              {selectedPhaseToEdit ? (
                <form onSubmit={handleSavePhaseSubmit} className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-blue-800/40">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-300">
                      Edit Data {selectedPhaseToEdit.number}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedPhaseToEdit(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Judul Fase</label>
                      <input
                        type="text"
                        value={phaseTitle}
                        onChange={(e) => setPhaseTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Sub-Judul</label>
                      <input
                        type="text"
                        value={phaseSubtitle}
                        onChange={(e) => setPhaseSubtitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Durasi</label>
                      <input
                        type="text"
                        value={phaseDuration}
                        onChange={(e) => setPhaseDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={phaseBadge}
                        onChange={(e) => setPhaseBadge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Warna Aksen</label>
                      <select
                        value={phaseColor}
                        onChange={(e) => setPhaseColor(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      >
                        <option value="blue">Blue</option>
                        <option value="cyan">Cyan</option>
                        <option value="amber">Amber</option>
                        <option value="emerald">Emerald</option>
                        <option value="purple">Purple</option>
                        <option value="rose">Rose</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi Lengkap Fase</label>
                    <textarea
                      rows={3}
                      value={phaseDesc}
                      onChange={(e) => setPhaseDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Fase</span>
                  </button>
                </form>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phases.map((ph) => (
                  <div
                    key={ph.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-400">{ph.number}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {ph.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{ph.title}</h4>
                      <p className="text-xs text-slate-400">{ph.subtitle}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{ph.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{ph.duration}</span>
                      <button
                        type="button"
                        onClick={() => handleStartEditPhase(ph)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
