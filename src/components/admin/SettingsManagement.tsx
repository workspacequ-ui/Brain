import React, { useState } from 'react';
import {
  AppSettings,
  InstitutionInfo,
  KopSuratSettings,
  CustomPageLabels,
  CustomNavLabels,
  CustomButtonLabels
} from '../../types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_INSTITUTION,
  DEFAULT_KOP_SETTINGS,
  DEFAULT_PAGE_LABELS,
  DEFAULT_NAV_LABELS,
  DEFAULT_BUTTON_LABELS
} from '../../utils/storage';
import { compressImageFile } from '../../utils/imageCompressor';
import { OfficialKopSurat, OfficialSignatureBlock } from '../common/OfficialKopSurat';
import {
  Settings,
  Building2,
  FileText,
  Type,
  LayoutGrid,
  MousePointerClick,
  Save,
  RotateCcw,
  Download,
  Upload,
  Search,
  Check,
  Sparkles,
  Phone,
  Mail,
  Globe,
  MapPin,
  Image as ImageIcon,
  UserCheck,
  ShieldCheck,
  Sliders,
  Eye,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  GraduationCap,
  Flame,
  FileSpreadsheet
} from 'lucide-react';

interface SettingsManagementProps {
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
  onResetSettings: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({
  settings,
  onSaveSettings,
  onResetSettings,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'institution' | 'kop' | 'pages' | 'nav' | 'buttons' | 'backup'>('institution');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState<AppSettings>(JSON.parse(JSON.stringify(settings)));
  const [previewKopMode, setPreviewKopMode] = useState<'A4' | 'compact'>('A4');

  // Sync state when prop updates if needed
  React.useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  // Nested Helpers for updating form state
  const updateInstitution = (field: keyof InstitutionInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      institution: {
        ...prev.institution,
        [field]: value
      }
    }));
  };

  const updateKop = (field: keyof KopSuratSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      kopSurat: {
        ...prev.kopSurat,
        [field]: value
      }
    }));
  };

  const updatePageLabel = (key: keyof CustomPageLabels, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      pageLabels: {
        ...prev.pageLabels,
        [key]: {
          ...(prev.pageLabels[key] || DEFAULT_PAGE_LABELS[key]),
          [field]: value
        }
      }
    }));
  };

  const updateNavLabel = (key: keyof CustomNavLabels, value: string) => {
    setFormData(prev => ({
      ...prev,
      navLabels: {
        ...prev.navLabels,
        [key]: value
      }
    }));
  };

  const updateButtonLabel = (key: keyof CustomButtonLabels, value: string) => {
    setFormData(prev => ({
      ...prev,
      buttonLabels: {
        ...prev.buttonLabels,
        [key]: value
      }
    }));
  };

  // Save changes
  const handleSave = () => {
    onSaveSettings(formData);
    onShowToast('Semua pengaturan dan label berhasil disimpan!', 'success');
  };

  // Image Upload handler (Logo, Stamp, Signature) with automatic compression
  const handleImageUpload = async (field: 'logoUrl' | 'stampUrl' | 'signatureUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onShowToast('Ukuran file gambar maksimal 10MB', 'error');
        return;
      }
      try {
        const compressedBase64 = await compressImageFile(file, {
          maxWidth: field === 'signatureUrl' ? 300 : 350,
          maxHeight: field === 'signatureUrl' ? 180 : 350,
          quality: 0.85
        });
        updateInstitution(field, compressedBase64);
        onShowToast(`Gambar ${field === 'logoUrl' ? 'Logo' : field === 'stampUrl' ? 'Stempel' : 'Tanda Tangan'} berhasil dimuat dan dioptimasi`, 'success');
      } catch (err) {
        onShowToast('Gagal memproses file gambar', 'error');
      }
    }
  };

  // Export JSON Settings
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pengaturan_sistem_${formData.institution.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('File cadangan pengaturan JSON berhasil diekspor!', 'success');
  };

  // Import JSON Settings
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            const merged: AppSettings = {
              ...DEFAULT_APP_SETTINGS,
              ...parsed,
              institution: { ...DEFAULT_INSTITUTION, ...(parsed.institution || {}) },
              kopSurat: { ...DEFAULT_KOP_SETTINGS, ...(parsed.kopSurat || {}) },
              pageLabels: { ...DEFAULT_PAGE_LABELS, ...(parsed.pageLabels || {}) },
              navLabels: { ...DEFAULT_NAV_LABELS, ...(parsed.navLabels || {}) },
              buttonLabels: { ...DEFAULT_BUTTON_LABELS, ...(parsed.buttonLabels || {}) }
            };
            setFormData(merged);
            onSaveSettings(merged);
            onShowToast('Pengaturan dari file JSON berhasil diimpor dan diterapkan!', 'success');
          }
        } catch (err) {
          onShowToast('Format file JSON tidak valid', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Confirm Reset
  const handleConfirmReset = () => {
    onResetSettings();
    setFormData(DEFAULT_APP_SETTINGS);
    setIsResetConfirmOpen(false);
    onShowToast('Semua pengaturan dan label dikembalikan ke standar bawaan!', 'info');
  };

  // Quick sync: Isi data Kop Surat otomatis dari profil lembaga
  const handleSyncKopFromInstitution = () => {
    setFormData(prev => ({
      ...prev,
      kopSurat: {
        ...prev.kopSurat,
        institutionName: prev.institution.name || prev.kopSurat.institutionName,
        subHeader: prev.institution.subtitle || prev.kopSurat.subHeader,
        addressLine1: prev.institution.address || prev.kopSurat.addressLine1,
        addressLine2: `Telp: ${prev.institution.phone || '(021) 7890-1234'} • WA: ${prev.institution.whatsapp || '0812-3456-7890'} • Email: ${prev.institution.email || 'info@brainspace.academy'}`,
        website: prev.institution.website ? `Website: ${prev.institution.website}` : prev.kopSurat.website,
        cityLocation: prev.institution.city || prev.kopSurat.cityLocation,
        signerName: prev.institution.principalName || prev.kopSurat.signerName,
        signerNip: prev.institution.principalNip || prev.kopSurat.signerNip
      }
    }));
    onShowToast('Data Kop Surat berhasil diselaraskan dari informasi lembaga!', 'success');
  };

  // Filter keys for Page Labels
  const pageLabelKeys = Object.keys(DEFAULT_PAGE_LABELS) as (keyof CustomPageLabels)[];
  const filteredPageKeys = pageLabelKeys.filter(key => {
    const item = formData.pageLabels[key] || DEFAULT_PAGE_LABELS[key];
    const q = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  // Filter keys for Nav Labels
  const navLabelKeys = Object.keys(DEFAULT_NAV_LABELS) as (keyof CustomNavLabels)[];
  const filteredNavKeys = navLabelKeys.filter(key => {
    const val = formData.navLabels[key] || DEFAULT_NAV_LABELS[key];
    const q = searchQuery.toLowerCase();
    return key.toLowerCase().includes(q) || val.toLowerCase().includes(q);
  });

  // Filter keys for Button Labels
  const btnLabelKeys = Object.keys(DEFAULT_BUTTON_LABELS) as (keyof CustomButtonLabels)[];
  const filteredBtnKeys = btnLabelKeys.filter(key => {
    const val = formData.buttonLabels[key] || DEFAULT_BUTTON_LABELS[key];
    const q = searchQuery.toLowerCase();
    return key.toLowerCase().includes(q) || val.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>CONTROL CENTER • PUSAT PENGATURAN DATA & LABEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Pusat Pengaturan & Kustomisasi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Atur identitas lembaga, kontak & no HP/WA, Kop Surat resmi cetak file PDF, judul halaman & deskripsi modul, label menu navigasi, serta nama tombol aksi sistem secara terpusat dan reaktif.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{formData.buttonLabels.btnSave || 'Simpan Perubahan'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 hover:border-rose-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Kembalikan ke Setelan Bawaan"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
          </div>
        </div>

        {/* Live Search Across Labels Bar */}
        {(activeTab === 'pages' || activeTab === 'nav' || activeTab === 'buttons') && (
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari label yang ingin diubah (misal: Ujian, Siswa, Cetak, Laporan)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('institution')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'institution'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Informasi Lembaga & Kontak</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kop')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'kop'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kop Surat Dokumen Cetak</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-md bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
            PDF
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'pages'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Judul & Deskripsi Halaman</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nav')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'nav'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Menu Sidebar & Subhalaman</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('buttons')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'buttons'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          <span>Nama Tombol & Aksi (CTA)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Cadangan & Impor / Ekspor</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI LEMBAGA & KONTAK */}
      {activeTab === 'institution' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: General Identity Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Identitas & Profil Lembaga</h2>
                    <p className="text-xs text-slate-400">Nama resmi, subjudul, dan kontak yang ditampilkan pada aplikasi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Nama Lembaga <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.institution.name}
                      onChange={(e) => updateInstitution('name', e.target.value)}
                      placeholder="e.g. BRAIN SPACE ACADEMY"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Subjudul / Tagline Singkat
                    </label>
                    <input
                      type="text"
                      value={formData.institution.subtitle}
                      onChange={(e) => updateInstitution('subtitle', e.target.value)}
                      placeholder="e.g. CBT & LMS SMART ACADEMY"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Slogan / Motto Lembaga
                    </label>
                    <input
                      type="text"
                      value={formData.institution.motto || ''}
                      onChange={(e) => updateInstitution('motto', e.target.value)}
                      placeholder="e.g. Solusi Cerdas Menuju Sukses PTN & Sekolah Unggulan"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Alamat Lengkap Lembaga</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.institution.address || ''}
                      onChange={(e) => updateInstitution('address', e.target.value)}
                      placeholder="e.g. Jl. Pendidikan Nasional No. 88, Kebayoran Baru, Jakarta Selatan 12160"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>No. Telepon / Hotline Kantor</span>
                    </label>
                    <input
                      type="text"
                      value={formData.institution.phone || ''}
                      onChange={(e) => updateInstitution('phone', e.target.value)}
                      placeholder="e.g. (021) 7890-1234"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>No. HP / WhatsApp Resmi</span>
                    </label>
                    <input
                      type="text"
                      value={formData.institution.whatsapp || ''}
                      onChange={(e) => updateInstitution('whatsapp', e.target.value)}
                      placeholder="e.g. 0812-3456-7890"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email Resmi Lembaga</span>
                    </label>
                    <input
                      type="email"
                      value={formData.institution.email || ''}
                      onChange={(e) => updateInstitution('email', e.target.value)}
                      placeholder="e.g. info@brainspace.academy"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Website Resmi</span>
                    </label>
                    <input
                      type="text"
                      value={formData.institution.website || ''}
                      onChange={(e) => updateInstitution('website', e.target.value)}
                      placeholder="e.g. https://brainspace.academy"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pimpinan & Penanggung Jawab */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Pimpinan & Penandatangan Resmi</h2>
                    <p className="text-xs text-slate-400">Digunakan pada kolom tanda tangan dokumen cetak / rapor resmi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Kota Lokasi Terbit</label>
                    <input
                      type="text"
                      value={formData.institution.city || ''}
                      onChange={(e) => updateInstitution('city', e.target.value)}
                      placeholder="e.g. Jakarta Selatan"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nama Pimpinan / Direktur</label>
                    <input
                      type="text"
                      value={formData.institution.principalName || ''}
                      onChange={(e) => updateInstitution('principalName', e.target.value)}
                      placeholder="e.g. Dr. H. Hendra Wijaya, M.Pd."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">NIP / Kode Jabatan</label>
                    <input
                      type="text"
                      value={formData.institution.principalNip || ''}
                      onChange={(e) => updateInstitution('principalNip', e.target.value)}
                      placeholder="e.g. NIP. 19850714 201001 1 008"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual Logo & Branding Customizer */}
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Logo & Tampilan Visual</h2>
                    <p className="text-xs text-slate-400">Pengaturan logo institusi di navbar & header</p>
                  </div>
                </div>

                {/* Logo Preview Box */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  {formData.institution.logoUrl ? (
                    <img
                      src={formData.institution.logoUrl}
                      alt="Logo Lembaga"
                      className="h-20 max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-900 via-rose-900 to-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-slate-700">
                      <Flame className="w-10 h-10 text-amber-300 fill-amber-300" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-white">{formData.institution.name || 'Nama Lembaga'}</p>
                  <p className="text-[11px] text-slate-400">{formData.institution.subtitle || 'Subjudul Lembaga'}</p>
                </div>

                {/* Logo URL / File Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">URL Gambar Logo</label>
                  <input
                    type="text"
                    value={formData.institution.logoUrl}
                    onChange={(e) => updateInstitution('logoUrl', e.target.value)}
                    placeholder="https://domain.com/logo.png"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl text-center cursor-pointer border border-slate-700 transition-colors flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('logoUrl', e)}
                        className="hidden"
                      />
                    </label>
                    {formData.institution.logoUrl && (
                      <button
                        type="button"
                        onClick={() => updateInstitution('logoUrl', '')}
                        className="px-3 py-2 bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-900/50 text-xs font-bold rounded-xl transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Fit & Shape Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Bentuk Sudut</label>
                    <select
                      value={formData.institution.logoShape || 'rounded'}
                      onChange={(e) => updateInstitution('logoShape', e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="rounded">Rounded (Membulat)</option>
                      <option value="circle">Circle (Lingkaran)</option>
                      <option value="square">Square (Persegi)</option>
                      <option value="banner">Banner (Horizontal)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Ukuran Logo</label>
                    <select
                      value={formData.institution.logoSize || 'normal'}
                      onChange={(e) => updateInstitution('logoSize', e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="normal">Normal (Standar)</option>
                      <option value="large">Large (Besar)</option>
                      <option value="extralarge">Extra Large</option>
                      <option value="banner">Banner Lebar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KOP SURAT DOKUMEN CETAK */}
      {activeTab === 'kop' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.kopSurat.enabled}
                  onChange={(e) => updateKop('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <div>
                <p className="text-xs font-bold text-white">Kop Surat Resmi Dokumen Cetak</p>
                <p className="text-[11px] text-slate-400">
                  {formData.kopSurat.enabled ? 'Aktif: Ditampilkan di bagian atas seluruh cetakan PDF/Rapor' : 'Nonaktif: Dokumen dicetak tanpa Kop resmi'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncKopFromInstitution}
              className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Salin Otomatis dari Profil Lembaga</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Settings Left */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                  Konfigurasi Teks Kop Surat
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nama Yayasan / Instansi Atas</label>
                  <input
                    type="text"
                    value={formData.kopSurat.institutionHeader}
                    onChange={(e) => updateKop('institutionHeader', e.target.value)}
                    placeholder="e.g. YAYASAN PENDIDIKAN BRAIN SPACE UTAMA"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nama Lembaga / Satuan Pendidikan Utama</label>
                  <input
                    type="text"
                    value={formData.kopSurat.institutionName}
                    onChange={(e) => updateKop('institutionName', e.target.value)}
                    placeholder="e.g. BRAIN SPACE ACADEMY & UTBK CENTER"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Sub-Kop / Divisi / Keterangan Lembaga</label>
                  <input
                    type="text"
                    value={formData.kopSurat.subHeader}
                    onChange={(e) => updateKop('subHeader', e.target.value)}
                    placeholder="e.g. PUSAT BIMBINGAN BELAJAR, CBT & EVALUASI STANDAR NASIONAL"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Alamat Baris 1 Kop</label>
                  <input
                    type="text"
                    value={formData.kopSurat.addressLine1}
                    onChange={(e) => updateKop('addressLine1', e.target.value)}
                    placeholder="e.g. Jl. Pendidikan Nasional No. 88, Kebayoran Baru, Jakarta Selatan 12160"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Alamat Baris 2 Kop (Hotline, WA, Telp, Email)</label>
                  <input
                    type="text"
                    value={formData.kopSurat.addressLine2}
                    onChange={(e) => updateKop('addressLine2', e.target.value)}
                    placeholder="e.g. Telp: (021) 7890-1234 • WA: 0812-3456-7890 • Email: info@brainspace.academy"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Website Resmi Kop</label>
                  <input
                    type="text"
                    value={formData.kopSurat.website}
                    onChange={(e) => updateKop('website', e.target.value)}
                    placeholder="e.g. Website: https://brainspace.academy"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Gaya Garis Pembatas</label>
                    <select
                      value={formData.kopSurat.borderStyle}
                      onChange={(e) => updateKop('borderStyle', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="double">Garis Ganda Dinas (Tebal + Tipis)</option>
                      <option value="solid">Garis Tunggal Solid</option>
                      <option value="gradient">Garis Gradasi Modern</option>
                      <option value="minimal">Garis Tipis Minimalis</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Tampilkan Logo</label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.kopSurat.showLogoLeft}
                          onChange={(e) => updateKop('showLogoLeft', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span>Logo Kiri</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.kopSurat.showLogoRight}
                          onChange={(e) => updateKop('showLogoRight', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span>Info Kanan</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-300">Catatan Kaki Dokumen (Footer Note)</label>
                  <input
                    type="text"
                    value={formData.kopSurat.documentFooterNote}
                    onChange={(e) => updateKop('documentFooterNote', e.target.value)}
                    placeholder="e.g. Dokumen ini sah dan diterbitkan secara resmi melalui Sistem CBT Brain Space Academy."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Live Print Sheet Preview Right */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pratinjau Lembar Cetak Dokumen (Live Preview)</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Format Kertas A4</span>
              </div>

              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-300 overflow-hidden">
                <OfficialKopSurat
                  kopSettings={formData.kopSurat}
                  institution={formData.institution}
                  documentTitle="LAPORAN HASIL EVALUASI TRYOUT AKADEMIK"
                  documentSubtitle="Periode Semester Genap 2025/2026 • Program Persiapan UTBK & Sekolah Unggulan"
                  documentBadge="DOKUMEN RESMI"
                  documentId="DOC-EVAL-BSA-2026"
                />

                {/* Dummy Content Sample */}
                <div className="mt-4 pt-3 border-t border-slate-200 text-slate-700 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500">Nama Siswa:</span> <strong className="text-slate-900">Muhammad Rizky Pratama</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Kelas:</span> <strong className="text-slate-900">XII-UTBK 1 (Kelompok Alpha)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Skor Rata-rata:</span> <strong className="text-emerald-700 font-bold">718.50 (IRT Passing Grade Aman)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Pilihan Kampus:</span> <strong className="text-indigo-700 font-bold">Teknik Informatika - UI</strong>
                    </div>
                  </div>
                </div>

                {/* Signature Block Sample */}
                <OfficialSignatureBlock
                  kopSettings={formData.kopSurat}
                  institution={formData.institution}
                  cityName={formData.kopSurat.cityLocation || formData.institution.city}
                  signerTitle={formData.kopSurat.signerTitle}
                  signerName={formData.kopSurat.signerName || formData.institution.principalName}
                  signerNip={formData.kopSurat.signerNip || formData.institution.principalNip}
                />

                {formData.kopSurat.documentFooterNote && (
                  <p className="text-[9px] text-slate-400 italic text-center mt-6 pt-2 border-t border-slate-200">
                    {formData.kopSurat.documentFooterNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JUDUL & DESKRIPSI HALAMAN */}
      {activeTab === 'pages' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Label Judul & Deskripsi Halaman</h2>
                <p className="text-xs text-slate-400">
                  Ubah teks judul utama dan subjudul pada setiap modul dan tampilan halaman ({filteredPageKeys.length} Halaman)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPageKeys.map(key => {
                const item = formData.pageLabels[key] || DEFAULT_PAGE_LABELS[key];
                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/40 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
                        {key}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const def = DEFAULT_PAGE_LABELS[key];
                          if (def) {
                            updatePageLabel(key, 'title', def.title);
                            updatePageLabel(key, 'description', def.description);
                          }
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Reset bawaan
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Judul Halaman</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updatePageLabel(key, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Deskripsi / Subjudul</label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => updatePageLabel(key, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MENU SIDEBAR & SUBHALAMAN */}
      {activeTab === 'nav' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Label Navigasi Sidebar & Subhalaman</h2>
                <p className="text-xs text-slate-400">
                  Ubah teks menu navigasi yang muncul di sidebar sebelah kiri ({filteredNavKeys.length} Menu)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredNavKeys.map(key => {
                const val = formData.navLabels[key] || DEFAULT_NAV_LABELS[key];
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                        {key}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const defVal = DEFAULT_NAV_LABELS[key];
                          if (defVal) updateNavLabel(key, defVal);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300"
                      >
                        Default
                      </button>
                    </div>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateNavLabel(key, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NAMA TOMBOL & AKSI (CTA) */}
      {activeTab === 'buttons' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Nama Tombol & Aksi (CTA Labels)</h2>
                <p className="text-xs text-slate-400">
                  Ubah teks tombol-tombol standar di seluruh aplikasi ({filteredBtnKeys.length} Tombol)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredBtnKeys.map(key => {
                const val = formData.buttonLabels[key] || DEFAULT_BUTTON_LABELS[key];
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                        {key}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const defVal = DEFAULT_BUTTON_LABELS[key];
                          if (defVal) updateButtonLabel(key, defVal);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300"
                      >
                        Default
                      </button>
                    </div>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateButtonLabel(key, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CADANGAN & IMPOR / EKSPOR */}
      {activeTab === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Ekspor File Pengaturan (JSON)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unduh seluruh konfigurasi institusi, kop surat resmi, label halaman, nama navigasi, dan tombol aksi ke dalam file format JSON untuk pencadangan aman.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan JSON</span>
              </button>
            </div>

            {/* Import Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Impor & Pulihkan Pengaturan (JSON)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unggah file konfigurasi JSON cadangan yang pernah Anda simpan sebelumnya untuk memulihkan seluruh label dan kop surat instan.
                </p>
              </div>

              <label className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Pilih & Terapkan File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Default */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Konfirmasi Reset Pengaturan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin mengembalikan seluruh nama label, Kop surat, judul halaman, dan nama tombol ke standar bawaan sistem?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
              >
                Ya, Reset ke Bawaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
