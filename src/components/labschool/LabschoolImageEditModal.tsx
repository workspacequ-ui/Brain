import React, { useState, useEffect } from 'react';
import {
  X,
  Image,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Check,
  RotateCcw,
  Eye,
  Camera,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  LabschoolCampusItem,
  PRESET_CAMPUS_IMAGES,
  DEFAULT_LABSCHOOL_CAMPUSES,
  saveStoredCampuses
} from './labschoolCampusData';
import { compressImageFile } from '../../utils/imageCompressor';

interface LabschoolImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: LabschoolCampusItem[];
  setCampuses: React.Dispatch<React.SetStateAction<LabschoolCampusItem[]>>;
  initialCampusId?: string;
}

export const LabschoolImageEditModal: React.FC<LabschoolImageEditModalProps> = ({
  isOpen,
  onClose,
  campuses,
  setCampuses,
  initialCampusId
}) => {
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    initialCampusId || campuses[0]?.id || 'camp-rawamangun'
  );
  const [activeTab, setActiveTab] = useState<'presets' | 'url' | 'upload'>('presets');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [urlError, setUrlError] = useState<boolean>(false);

  const selectedCampus = campuses.find((c) => c.id === selectedCampusId) || campuses[0];

  useEffect(() => {
    if (initialCampusId) {
      setSelectedCampusId(initialCampusId);
    }
  }, [initialCampusId]);

  useEffect(() => {
    if (selectedCampus) {
      setPreviewImage(selectedCampus.imageUrl || '');
      setCustomUrl(selectedCampus.imageUrl || '');
      setUrlError(false);
      setSaveSuccessMsg('');
    }
  }, [selectedCampusId, selectedCampus]);

  if (!isOpen || !selectedCampus) return null;

  const handleSelectPreset = (url: string) => {
    setPreviewImage(url);
    setCustomUrl(url);
    setUrlError(false);
  };

  const handleUrlChange = (val: string) => {
    setCustomUrl(val);
    setPreviewImage(val);
    setUrlError(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran file maksimal 10MB');
        return;
      }
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 600,
          maxHeight: 400,
          quality: 0.82
        });
        setPreviewImage(compressed);
        setCustomUrl(compressed);
        setUrlError(false);
      } catch (err) {
        alert('Gagal memproses gambar');
      }
    }
  };

  const handleResetToDefault = () => {
    const defaultCampus = DEFAULT_LABSCHOOL_CAMPUSES.find((c) => c.id === selectedCampus.id);
    if (defaultCampus) {
      setPreviewImage(defaultCampus.imageUrl);
      setCustomUrl(defaultCampus.imageUrl);
      setUrlError(false);
    }
  };

  const handleSaveChanges = () => {
    if (!previewImage.trim()) {
      alert('Silakan pilih atau masukkan gambar yang valid.');
      return;
    }

    const updated = campuses.map((c) => {
      if (c.id === selectedCampus.id) {
        return {
          ...c,
          imageUrl: previewImage.trim()
        };
      }
      return c;
    });

    setCampuses(updated);
    saveStoredCampuses(updated);
    setSaveSuccessMsg(`Gambar untuk ${selectedCampus.name} berhasil diperbarui!`);
    setTimeout(() => {
      setSaveSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>Pengaturan Edit Gambar Kampus Labschool</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                5 Kampus
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ubah atau sesuaikan banner foto kampus impian untuk ditampilkan pada slide banner & kartu informasi.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Campus Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Pilih Kampus yang Ingin Diubah Gambarnya:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {campuses.map((camp) => (
              <button
                key={camp.id}
                type="button"
                onClick={() => setSelectedCampusId(camp.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all text-xs flex flex-col justify-between ${
                  selectedCampusId === camp.id
                    ? 'bg-blue-600/30 border-blue-400 text-white font-bold shadow-lg shadow-blue-900/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate block font-semibold">{camp.name.replace('Labschool ', '')}</span>
                <span className="text-[10px] text-slate-500 mt-1">{camp.loc.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2 Column Main Grid: Options & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image Source Tabs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tabs for Presets, URL, and Upload */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Koleksi Foto Kampus</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'url'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Input URL Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            {/* TAB 1: PRESET GALLERY */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Pilih foto arsitektur & fasilitas Labschool siap pakai:</span>
                  <span className="font-mono text-[11px]">{PRESET_CAMPUS_IMAGES.length} Pilihan</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {PRESET_CAMPUS_IMAGES.map((preset) => {
                    const isSelected = previewImage === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.url)}
                        className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                          isSelected
                            ? 'border-blue-400 ring-2 ring-blue-500 scale-[1.02]'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="h-20 w-full bg-slate-950 overflow-hidden">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-1.5 bg-slate-950/90 text-[10px]">
                          <span className="text-slate-300 font-medium line-clamp-1">{preset.title}</span>
                          <span className="text-[9px] text-blue-400 block">{preset.category}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-blue-600 text-white shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: INPUT URL */}
            {activeTab === 'url' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  Tempel URL Gambar / Foto Langsung (Unsplash, Web Resmi, CDN):
                </label>
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Pastikan tautan dapat diakses secara publik (format JPG, PNG, atau WEBP).
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD FILE */}
            {activeTab === 'upload' && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-3">
                <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Unggah Foto dari Komputer / Perangkat Anda</p>
                  <p className="text-[11px] text-slate-400">Mendukung format PNG, JPG, WEBP (Maksimal 5MB)</p>
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Pilih Berkas Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Live Banner Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Pratinjau Banner Slide
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                title="Kembalikan ke foto resmi bawaan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Bawaan</span>
              </button>
            </div>

            {/* Mock Slide Display Card */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-56 w-full shadow-2xl flex flex-col justify-end p-4">
              <img
                src={previewImage || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80'}
                alt="Preview Banner"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.82]"
                onError={() => setUrlError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Badges */}
              <div className="relative z-10 flex items-center justify-between mb-auto">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600/40 text-blue-200 border border-blue-400/40 backdrop-blur-md">
                  {selectedCampus.badge}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-md flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-red-400" /> {selectedCampus.loc.split(' ')[0]}
                </span>
              </div>

              {/* Title & Passing Grade */}
              <div className="relative z-10 space-y-1">
                <h4 className="text-base font-black text-white drop-shadow">
                  {selectedCampus.name}
                </h4>
                <p className="text-[11px] text-blue-300 font-bold drop-shadow">
                  {selectedCampus.unit}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px]">
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700 text-amber-300 font-mono font-bold">
                    PG SMP: {selectedCampus.passingGradeSmp}
                  </span>
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700 text-emerald-300 font-mono font-bold">
                    PG SMA: {selectedCampus.passingGradeSma}
                  </span>
                </div>
              </div>

              {urlError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-20 text-red-400 space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <span className="text-xs font-bold text-white">URL Gambar Tidak Valid</span>
                  <p className="text-[11px] text-slate-300">Silakan periksa kembali tautan gambar Anda.</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Foto ini akan langsung diterapkan ke slide banner kampus di beranda dan kartu info 5 Kampus Labschool.
            </p>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Gambar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
