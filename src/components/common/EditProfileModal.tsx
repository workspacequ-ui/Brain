import React, { useState } from 'react';
import { User } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  User as UserIcon,
  Mail,
  Lock,
  IdCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  MessageCircle,
  Layers
} from 'lucide-react';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Preset Curated Avatar Options
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || user.phone || '');
  const [group, setGroup] = useState(user.group || 'Kelompok 1');
  const [password, setPassword] = useState(user.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'url'>('preset');

  // Handle File Upload via compressImageFile to optimized base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      if (onShowToast) onShowToast('Ukuran foto maksimal 10MB', 'error');
      return;
    }

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 240,
        maxHeight: 240,
        quality: 0.82
      });
      setAvatar(compressed);
      if (onShowToast) onShowToast('Foto berhasil diunggah dan dioptimasi', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Gagal memproses file foto', 'error');
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setAvatar(customUrl.trim());
    if (onShowToast) onShowToast('Tautan foto berhasil diterapkan', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      if (onShowToast) onShowToast('Nama dan Email wajib diisi', 'error');
      return;
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || undefined,
      phone: whatsapp.trim() || user.phone,
      group: user.role === 'student' ? group.trim() : user.group,
      password: password.trim() ? password.trim() : user.password,
      avatar
    };

    onSave(updatedUser);
    onClose();
    if (onShowToast) {
      onShowToast('Profil dan data berhasil diperbarui secara real-time!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Edit Foto Profil & Akun</h3>
              <p className="text-[11px] text-slate-400">
                Ubah foto profil & data pengguna ({user.role === 'admin' ? 'Administrator' : user.role === 'teacher' ? 'Guru' : 'Siswa'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Avatar Preview Box */}
          <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-600/50 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-xl shadow-md">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">{name || 'Nama User'}</p>
              <div className="flex items-center justify-center gap-1.5 mt-0.5 flex-wrap">
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 rounded-full">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                  </span>
                ) : user.role === 'teacher' ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 rounded-full">
                    <GraduationCap className="w-3 h-3 mr-1" /> Guru • {user.subject || 'Pengampu'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
                    <GraduationCap className="w-3 h-3 mr-1" /> Siswa • {user.className}
                  </span>
                )}
                {user.nis && <span className="text-[11px] font-mono text-slate-400">NIS: {user.nis}</span>}
                {user.group && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 rounded-full">
                    {user.group}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Source Tabs */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Pilihan Foto Profil:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('preset')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'preset' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pilihan Avatar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unggah File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'url' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tautan URL
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'preset' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setAvatar(url)}
                    className={`relative rounded-xl overflow-hidden ring-2 transition-all aspect-square ${
                      avatar === url ? 'ring-2 ring-emerald-500 scale-105' : 'ring-transparent hover:ring-blue-500/50'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {avatar === url && (
                      <span className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="pt-1">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-blue-500/80 rounded-2xl bg-slate-950 cursor-pointer transition-colors text-center space-y-2">
                  <Upload className="w-6 h-6 text-blue-400" />
                  <div>
                    <span className="text-xs font-bold text-white">Klik untuk memilih foto dari perangkat</span>
                    <p className="text-[10px] text-slate-500">Format JPG, PNG, WEBP (Maksimal 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/foto.jpg"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Terapkan
                </button>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 font-mono"
                  />
                </div>
              </div>

              {user.role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelompok Belajar
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      value={group}
                      onChange={e => setGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white"
                    >
                      <option value="Kelompok 1">Kelompok 1 (Alpha)</option>
                      <option value="Kelompok 2">Kelompok 2 (Beta)</option>
                      <option value="Kelompok 3">Kelompok 3 (Gamma)</option>
                      <option value="Kelompok 4">Kelompok 4 (Delta)</option>
                      <option value="Kelompok 5">Kelompok 5 (Epsilon)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password Baru (Kosongkan jika tidak diubah)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan & Singkronkan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
