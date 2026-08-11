import React, { useState } from 'react';
import { InstitutionInfo } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  Building2,
  X,
  Upload,
  Check,
  GraduationCap,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Maximize2,
  Sliders,
  Eye,
  Layers,
  Square,
  Circle,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

interface EditInstitutionModalProps {
  institution: InstitutionInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: InstitutionInfo) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EditInstitutionModal: React.FC<EditInstitutionModalProps> = ({
  institution,
  isOpen,
  onClose,
  onSave,
  onShowToast
}) => {
  const [name, setName] = useState(institution.name || 'BRAIN SPACE ACADEMY');
  const [subtitle, setSubtitle] = useState(institution.subtitle || 'CBT & LMS SMART ACADEMY');
  const [logoUrl, setLogoUrl] = useState(institution.logoUrl || '');
  
  // Full Area & Display Customization State
  const [logoFullArea, setLogoFullArea] = useState<boolean>(institution.logoFullArea ?? true);
  const [logoFit, setLogoFit] = useState<'contain' | 'cover' | 'fill'>(institution.logoFit || 'contain');
  const [logoShape, setLogoShape] = useState<'rounded' | 'square' | 'circle' | 'banner'>(institution.logoShape || 'rounded');
  const [logoSize, setLogoSize] = useState<'normal' | 'large' | 'extralarge' | 'banner'>(institution.logoSize || 'normal');
  const [logoBgColor, setLogoBgColor] = useState<string>(institution.logoBgColor || 'transparent');
  const [logoBorder, setLogoBorder] = useState<boolean>(institution.logoBorder ?? true);
  const [logoPadding, setLogoPadding] = useState<'none' | 'small' | 'medium'>(institution.logoPadding || 'none');

  // Preview Mode State
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onShowToast?.('Ukuran file foto logo maksimal 10MB', 'error');
        return;
      }
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 350,
          maxHeight: 350,
          quality: 0.85
        });
        setLogoUrl(compressed);
        onShowToast?.('Logo lembaga berhasil dimuat dan dioptimasi', 'success');
      } catch (err) {
        onShowToast?.('Gagal memproses file logo', 'error');
      }
    }
  };

  const handleResetDefaultLogo = () => {
    setLogoUrl('');
    setName('BRAIN SPACE ACADEMY');
    setSubtitle('CBT & LMS SMART ACADEMY');
    setLogoFullArea(true);
    setLogoFit('contain');
    setLogoShape('rounded');
    setLogoSize('normal');
    setLogoBgColor('transparent');
    setLogoBorder(true);
    setLogoPadding('none');
    onShowToast?.('Logo dan pengaturan tampilan dikembalikan ke bawaan', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast?.('Nama lembaga wajib diisi', 'error');
      return;
    }
    const updated: InstitutionInfo = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      logoUrl: logoUrl.trim(),
      logoFullArea,
      logoFit,
      logoShape,
      logoSize,
      logoBgColor,
      logoBorder,
      logoPadding
    };
    onSave(updated);
    onShowToast?.('Pengaturan logo & identitas lembaga berhasil disimpan!', 'success');
    onClose();
  };

  // Helper styles based on settings
  const getContainerShapeClass = () => {
    switch (logoShape) {
      case 'square': return 'rounded-none';
      case 'circle': return 'rounded-full';
      case 'banner': return 'rounded-2xl';
      case 'rounded':
      default: return 'rounded-xl';
    }
  };

  const getContainerSizeClass = () => {
    switch (logoSize) {
      case 'large': return 'w-12 h-12 sm:w-14 sm:h-14';
      case 'extralarge': return 'w-14 h-14 sm:w-16 sm:h-16';
      case 'banner': return 'h-11 sm:h-12 w-28 sm:w-36';
      case 'normal':
      default: return 'w-10 h-10 sm:w-11 sm:h-11';
    }
  };

  const getPaddingClass = () => {
    if (logoFullArea && logoPadding === 'none') return 'p-0';
    switch (logoPadding) {
      case 'medium': return 'p-2';
      case 'small': return 'p-1';
      case 'none':
      default: return 'p-0';
    }
  };

  const getObjectFitClass = () => {
    switch (logoFit) {
      case 'cover': return 'object-cover';
      case 'fill': return 'object-fill';
      case 'contain':
      default: return 'object-contain';
    }
  };

  const getBgColorClass = () => {
    switch (logoBgColor) {
      case 'white': return 'bg-white';
      case 'dark': return 'bg-slate-950';
      case 'blue': return 'bg-blue-950';
      case 'slate': return 'bg-slate-900';
      case 'transparent':
      default: return 'bg-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Pengaturan Logo & Lembaga
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  Full Area Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Atur logo full area, mode penskalaan gambar, dan nama instansi di seluruh sistem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: LIVE INTERACTIVE PREVIEW & UPLOAD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                Live Preview Logo & Branding
              </span>
              
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('dark')}
                  className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-all ${
                    previewTheme === 'dark' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3 h-3" /> Gelap
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('light')}
                  className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-all ${
                    previewTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3 h-3" /> Terang
                </button>
              </div>
            </div>

            {/* Simulated Header Navbar Preview Bar */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              previewTheme === 'dark'
                ? 'bg-slate-900/95 border-slate-800 text-white'
                : 'bg-white border-slate-300 text-slate-900 shadow-md'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* The Previewed Logo Box */}
                  <div
                    className={`${getContainerSizeClass()} ${getContainerShapeClass()} ${getPaddingClass()} ${getBgColorClass()} ${
                      logoBorder ? (previewTheme === 'dark' ? 'border border-slate-700/80 shadow-md' : 'border border-slate-300 shadow-sm') : 'border-0'
                    } overflow-hidden flex items-center justify-center shrink-0 transition-all`}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className={`w-full h-full ${getObjectFitClass()} ${
                          logoShape === 'circle' ? 'rounded-full' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-600 via-blue-600 to-blue-700 flex items-center justify-center text-white">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Brand Typography Preview */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-black text-sm sm:text-base tracking-tight truncate ${
                        previewTheme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {name || 'BRAIN SPACE ACADEMY'}
                      </h4>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 mr-1 text-red-400" /> CBT & LMS
                      </span>
                    </div>
                    <p className={`text-[11px] truncate font-medium ${
                      previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {subtitle || 'CBT & LMS SMART ACADEMY'}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                    previewTheme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    Header Preview
                  </span>
                </div>
              </div>
            </div>

            {/* Upload & Source Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-600/20">
                <Upload className="w-4 h-4" /> Upload File Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold transition-colors"
                >
                  Hapus Logo
                </button>
              )}
            </div>

            {/* Paste URL Option */}
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="url"
                value={logoUrl.startsWith('data:') ? '' : logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="Atau tempelkan tautan URL logo (https://...)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* SECTION 2: PENGATURAN LOGO FULL AREA & SPACE CUSTOMIZER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-extrabold text-white">
                  Pengaturan Logo Full Area & Space
                </span>
              </div>
              <span className="text-[10px] text-blue-400 font-semibold bg-blue-950 px-2 py-0.5 rounded-md border border-blue-900">
                Penuh / Edge-to-Edge
              </span>
            </div>

            {/* 1. Toggle Mode Full Area */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">
                  Mode Logo Full Area (Penuhi Space)
                </span>
                <p className="text-[11px] text-slate-400">
                  Logo mengisi 100% ruang wadah tanpa batas padding kosong berlebih
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !logoFullArea;
                  setLogoFullArea(nextVal);
                  if (nextVal) {
                    setLogoPadding('none');
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  logoFullArea ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    logoFullArea ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Mode Penskalaan (Object Fit) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Mode Penskalaan Gambar (Object Fit)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'contain', label: 'Contain', desc: 'Proporsional Utuh' },
                  { id: 'cover', label: 'Cover', desc: 'Full Edge-to-Edge' },
                  { id: 'fill', label: 'Fill', desc: 'Regang Penuh 100%' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLogoFit(item.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      logoFit === item.id
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500 shadow-sm font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">{item.label}</span>
                      {logoFit === item.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Ukuran Area Logo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Ukuran Wadah Space Logo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'normal', label: 'Standar', size: '42 x 42 px' },
                  { id: 'large', label: 'Besar', size: '52 x 52 px' },
                  { id: 'extralarge', label: 'Ekstra', size: '64 x 64 px' },
                  { id: 'banner', label: 'Banner Lebar', size: 'Auto x 44 px' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLogoSize(item.id as any)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      logoSize === item.id
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500 shadow-sm font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{item.label}</span>
                      {logoSize === item.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{item.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Bentuk Sudut (Corner Shape) & Padding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Bentuk Sudut */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Bentuk Sudut Wadah (Shape)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'rounded', label: 'Rounded', icon: Square },
                    { id: 'square', label: 'Kotak (0px)', icon: Square },
                    { id: 'circle', label: 'Lingkaran', icon: Circle },
                    { id: 'banner', label: 'Kapsul / Pill', icon: Layers }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogoShape(item.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                        logoShape === item.id
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </div>
                      {logoShape === item.id && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Padding Dalam Wadah */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Padding / Jarak Tepi
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'none', label: '0px (Full Area)' },
                    { id: 'small', label: '2px (Tipis)' },
                    { id: 'medium', label: '4px (Standar)' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogoPadding(item.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        logoPadding === item.id
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 5. Warna Latar Wadah & Border */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              
              {/* Warna Latar */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  Warna Latar Belakang Wadah
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'transparent', label: 'Transparan' },
                    { id: 'dark', label: 'Dark Slate' },
                    { id: 'white', label: 'Putih Bersih' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogoBgColor(item.id)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        logoBgColor === item.id
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garis Tepi (Border) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Garis Tepi (Border Wadah)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLogoBorder(true)}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      logoBorder
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Aktif (Border Halus)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoBorder(false)}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      !logoBorder
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Tanpa Border
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* SECTION 3: NAMA & IDENTITAS LEMBAGA */}
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Teks Nama & Slogan Lembaga
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nama Lembaga / Sekolah *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: SMA NEGERI 1 SMART ACADEMY"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Sub-Judul / Slogan Lembaga
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Contoh: CBT & LMS SMART ACADEMY"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={handleResetDefaultLogo}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Default
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4" /> Simpan & Terapkan Full Area
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
