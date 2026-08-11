import React, { useState } from 'react';
import { SnbtCampusItem, SnbtMajorCluster } from './snbtCampusData';
import {
  X,
  School,
  Building2,
  MapPin,
  Globe,
  Award,
  Sparkles,
  Save,
  Trash2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

interface SnbtCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  campus?: SnbtCampusItem | null; // null if creating new
  onSave: (campus: SnbtCampusItem) => void;
  onDelete?: (campusId: string) => void;
}

export const SnbtCampusModal: React.FC<SnbtCampusModalProps> = ({
  isOpen,
  onClose,
  campus,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isEditing = !!campus;

  const [formData, setFormData] = useState<SnbtCampusItem>(() => {
    if (campus) {
      return { ...campus };
    }
    return {
      id: `ptn-custom-${Date.now()}`,
      name: '',
      shortName: '',
      city: '',
      province: 'Indonesia',
      ranking: 15,
      accreditation: 'Unggul',
      badge: 'Perguruan Tinggi Negeri Favorit',
      logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      website: 'https://',
      description: '',
      clusters: ['SAINTEK', 'SOSHUM'],
      accentColor: 'blue',
      majors: []
    };
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortName.trim()) {
      alert('Nama Kampus dan Singkatan wajib diisi!');
      return;
    }
    onSave(formData);
    onClose();
  };

  const toggleCluster = (cluster: SnbtMajorCluster) => {
    const exists = formData.clusters.includes(cluster);
    let next: SnbtMajorCluster[];
    if (exists) {
      next = formData.clusters.filter(c => c !== cluster);
      if (next.length === 0) next = [cluster]; // at least one
    } else {
      next = [...formData.clusters, cluster];
    }
    setFormData(prev => ({ ...prev, clusters: next }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Edit Kampus: ${formData.shortName}` : 'Tambah Perguruan Tinggi Negeri (PTN) Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Kelola informasi universitas, akreditasi, dan direktori jurusan UTBK-SNBT
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name & Short Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Nama Lengkap PTN / Universitas <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Universitas Indonesia"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Singkatan / Akronim <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: UI"
                value={formData.shortName}
                onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Row 2: Location & Province */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kota / Lokasi Kampus <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Depok / Jakarta"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Provinsi
              </label>
              <input
                type="text"
                placeholder="Contoh: Jawa Barat & DKI Jakarta"
                value={formData.province}
                onChange={e => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: Ranking, Accreditation, Accent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Peringkat Nasional (#)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={formData.ranking}
                onChange={e => setFormData({ ...formData, ranking: Number(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Akreditasi Institusi
              </label>
              <select
                value={formData.accreditation}
                onChange={e => setFormData({ ...formData, accreditation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Unggul">Unggul (BAN-PT)</option>
                <option value="A">A (Sangat Baik)</option>
                <option value="Baik Sekali">Baik Sekali</option>
                <option value="B">B</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Warna Tema
              </label>
              <select
                value={formData.accentColor}
                onChange={e => setFormData({ ...formData, accentColor: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="blue">Biru (Navy / UI / UGM)</option>
                <option value="indigo">Indigo (ITB / UNDIP)</option>
                <option value="amber">Amber / Emas (UI Kuning)</option>
                <option value="emerald">Emerald Hijau (IPB / UNS)</option>
                <option value="rose">Rose Merah (UNPAD)</option>
                <option value="purple">Ungu (UB / Brawijaya)</option>
                <option value="cyan">Cyan (UNAIR)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Badge & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Label / Badge Keunggulan
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: Pusat Riset & Teknologi #1"
                  value={formData.badge}
                  onChange={e => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Situs Web Resmi
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://ui.ac.id"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Image Banner URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              URL Foto Kampus / Gedung Rektorat
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 6: Clusters */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Rumpun Program Studi Tersedia
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {(['SAINTEK', 'SOSHUM', 'CAMPURAN'] as SnbtMajorCluster[]).map(cluster => {
                const active = formData.clusters.includes(cluster);
                return (
                  <button
                    key={cluster}
                    type="button"
                    onClick={() => toggleCluster(cluster)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? cluster === 'SAINTEK'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : cluster === 'SOSHUM'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                          : 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {cluster}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 7: Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Deskripsi Singkat & Profil Keunggulan
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan profil singkat kampus, tradisi riset, dan daya tariknya bagi calon mahasiswa SNBT..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  <span>Hapus Data PTN Ini</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-rose-950/60 border border-rose-800/80 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs text-rose-200 font-medium">Yakin hapus?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(formData.id)}
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
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kampus</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
