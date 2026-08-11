import React, { useState, useMemo } from 'react';
import { Teacher, ClassItem, TeacherStatus, SubjectItem } from '../../types';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  Award,
  IdCard,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  UserCheck,
  ExternalLink
} from 'lucide-react';

interface TeacherManagementProps {
  teachers: Teacher[];
  classes: ClassItem[];
  subjects?: SubjectItem[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onLoginAsTeacher?: (teacher: Teacher) => void;
}

const COMMON_SUBJECTS = [
  'Matematika & TPS Kuantitatif',
  'Fisika & TKA Saintek',
  'Kimia & TKA Saintek',
  'Biologi & Sains Terapan',
  'Bahasa Indonesia & Literasi',
  'Bahasa Inggris & English Literacy',
  'Ekonomi & TPS Soshum',
  'Sosiologi & Geografi',
  'Penalaran Umum & Logika',
  'Tes Potensi Skolastik (TPS)',
  'Teknologi Informasi & Komputer',
  'Pendidikan Agama & Budi Pekerti'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900ce?w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80'
];

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  classes,
  subjects = [],
  onSaveTeacher,
  onDeleteTeacher,
  onShowToast,
  onLoginAsTeacher
}) => {
  // Combine custom & master subjects for select list
  const availableSubjectOptions = useMemo(() => {
    const list = [...COMMON_SUBJECTS];
    subjects.forEach(s => {
      if (s.name && !list.includes(s.name)) {
        list.unshift(s.name);
      }
    });
    return Array.from(new Set(list));
  }, [subjects]);

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | TeacherStatus>('ALL');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [deleteTargetTeacher, setDeleteTargetTeacher] = useState<Teacher | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [status, setStatus] = useState<TeacherStatus>('ACTIVE');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [bio, setBio] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Open Add Modal
  const openAddModal = () => {
    setEditingTeacher(null);
    setName('');
    const randomNipYear = 1980 + Math.floor(Math.random() * 20);
    const randomNipMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const randomNipDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    const generatedNip = `${randomNipYear}${randomNipMonth}${randomNipDay}201001${Math.floor(1000 + Math.random() * 9000)}`;
    setNip(generatedNip);
    setUsername(`guru_${Math.floor(100 + Math.random() * 900)}`);
    setPassword('guru123');
    setEmail('');
    setPhone('0812' + Math.floor(10000000 + Math.random() * 90000000));
    setSubject(COMMON_SUBJECTS[0]);
    setCustomSubject('');
    setSelectedClasses(classes.slice(0, 2).map(c => c.name));
    setGender('L');
    setStatus('ACTIVE');
    setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setBio('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (tch: Teacher) => {
    setEditingTeacher(tch);
    setName(tch.name);
    setNip(tch.nip);
    setUsername(tch.username || tch.email.split('@')[0] || tch.nip);
    setPassword(tch.password || 'guru123');
    setEmail(tch.email);
    setPhone(tch.phone || '');
    if (COMMON_SUBJECTS.includes(tch.subject)) {
      setSubject(tch.subject);
      setCustomSubject('');
    } else {
      setSubject('CUSTOM');
      setCustomSubject(tch.subject);
    }
    setSelectedClasses(tch.targetClasses && tch.targetClasses.length > 0 ? tch.targetClasses : ['SEMUA']);
    setGender(tch.gender);
    setStatus(tch.status);
    setAvatar(tch.avatar || PRESET_AVATARS[0]);
    setBio(tch.bio || '');
    setIsFormModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('Nama guru wajib diisi!', 'error');
      return;
    }
    if (!nip.trim()) {
      onShowToast('NIP / Kode Guru wajib diisi!', 'error');
      return;
    }
    if (!email.trim()) {
      onShowToast('Email guru wajib diisi!', 'error');
      return;
    }

    const finalSubject = subject === 'CUSTOM' ? (customSubject.trim() || 'Umum') : subject;
    const finalClasses = selectedClasses.length > 0 ? selectedClasses : ['SEMUA'];

    const teacherData: Teacher = {
      id: editingTeacher ? editingTeacher.id : `tch-${Date.now()}`,
      nip: nip.trim(),
      username: username.trim() || nip.trim(),
      password: password.trim() || 'guru123',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: finalSubject,
      targetClasses: finalClasses,
      gender,
      status,
      avatar: avatar.trim() || PRESET_AVATARS[0],
      bio: bio.trim(),
      createdAt: editingTeacher ? editingTeacher.createdAt : new Date().toISOString().split('T')[0]
    };

    onSaveTeacher(teacherData);
    setIsFormModalOpen(false);
    onShowToast(
      editingTeacher
        ? `Data Guru "${teacherData.name}" berhasil diperbarui!`
        : `Guru baru "${teacherData.name}" berhasil ditambahkan!`,
      'success'
    );
  };

  // Toggle Class selection in form
  const toggleClassSelection = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  // Quick Status Toggle directly from table
  const handleToggleStatus = (tch: Teacher) => {
    const newStatus: TeacherStatus = tch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = { ...tch, status: newStatus };
    onSaveTeacher(updated);
    onShowToast(
      `Status ${tch.name} diubah menjadi ${newStatus === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}`,
      'info'
    );
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (deleteTargetTeacher) {
      onDeleteTeacher(deleteTargetTeacher.id);
      onShowToast(`Data guru "${deleteTargetTeacher.name}" berhasil dihapus.`, 'info');
      setDeleteTargetTeacher(null);
    }
  };

  // Copy NIP / Phone Helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast(`Disalin ke clipboard: ${text}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'NIP/Kode', 'Nama Lengkap', 'Jenis Kelamin', 'Mata Pelajaran', 'Kelas Diampu', 'Email', 'No Telepon', 'Status', 'Tanggal Bergabung'];
    const rows = teachers.map(t => [
      t.id,
      `"${t.nip}"`,
      `"${t.name}"`,
      t.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${t.subject}"`,
      `"${t.targetClasses.join(', ')}"`,
      t.email,
      `"${t.phone || '-'}"`,
      t.status,
      t.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_guru_brain_space_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Data guru berhasil diekspor ke CSV!', 'success');
  };

  // Extract unique subjects for filter dropdown
  const uniqueSubjects = Array.from(new Set(teachers.map(t => t.subject)));

  // Filter list of teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone && t.phone.includes(searchTerm));

    const matchesSubject = selectedSubjectFilter === 'ALL' || t.subject === selectedSubjectFilter;
    const matchesClass =
      selectedClassFilter === 'ALL' ||
      t.targetClasses.includes('SEMUA') ||
      t.targetClasses.includes(selectedClassFilter);
    const matchesStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;

    return matchesSearch && matchesSubject && matchesClass && matchesStatus;
  });

  // Calculate quick metrics
  const activeCount = teachers.filter(t => t.status === 'ACTIVE').length;
  const maleCount = teachers.filter(t => t.gender === 'L').length;
  const femaleCount = teachers.filter(t => t.gender === 'P').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Action */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Pengelola Data Guru & Pengajar
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800/60">
                  {teachers.length} Guru
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manajemen data pengajar, mata pelajaran yang diampu, kelas binaan, kontak, dan status keaktifan.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-2xl text-xs border border-slate-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            title="Ekspor CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ekspor Data</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Tenaga Guru</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{teachers.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Tersimpan di sistem</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Guru Aktif Mengajar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1.5">{activeCount}</p>
          <p className="text-[10px] text-emerald-500/80 mt-0.5">Siap mengampu materi & ujian</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Mata Pelajaran</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1.5">{uniqueSubjects.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Bidang studi aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Gender Pengajar</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-black text-cyan-400">{maleCount} L</span>
            <span className="text-slate-600">•</span>
            <span className="text-lg font-black text-rose-400">{femaleCount} P</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Laki-laki & Perempuan</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari guru berdasarkan nama, NIP, mapel, email, atau no. WA..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Mapel */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-blue-500 w-full md:w-48"
            >
              <option value="ALL">Semua Mapel</option>
              {uniqueSubjects.map(subj => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-blue-500 w-full md:w-40"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-blue-500 w-full md:w-36"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif (ACTIVE)</option>
              <option value="INACTIVE">Nonaktif (INACTIVE)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedSubjectFilter !== 'ALL' || selectedClassFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubjectFilter('ALL');
                setSelectedClassFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="p-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 rounded-xl border border-rose-800/40 transition-colors flex items-center gap-1 shrink-0"
              title="Reset Filter"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* 4. Table / List View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Profil & Nama Guru</th>
                <th className="p-4">NIP / Kode</th>
                <th className="p-4">Mata Pelajaran</th>
                <th className="p-4">Kelas Diampu</th>
                <th className="p-4">Kontak (WA/Email)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <GraduationCap className="w-8 h-8 text-slate-600" />
                      <p className="font-semibold text-slate-400">Tidak ada data guru ditemukan.</p>
                      <p className="text-[11px] text-slate-500">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Profil Guru */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher.avatar || PRESET_AVATARS[0]}
                          alt={teacher.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-blue-500/50 transition-all shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-100 text-sm truncate">{teacher.name}</p>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                              teacher.gender === 'L' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                            }`}>
                              {teacher.gender === 'L' ? 'L' : 'P'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{teacher.bio || 'Tenaga Pendidik Brain Space Academy'}</p>
                        </div>
                      </div>
                    </td>

                    {/* NIP / Kode Guru */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-bold text-[11px]">
                        <span>{teacher.nip}</span>
                        <button
                          onClick={() => handleCopy(teacher.nip, `nip-${teacher.id}`)}
                          className="text-slate-500 hover:text-cyan-300 transition-colors"
                          title="Salin NIP"
                        >
                          {copiedId === `nip-${teacher.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">Reg: {teacher.createdAt}</p>
                    </td>

                    {/* Mata Pelajaran */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-sm">
                        <BookOpen className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{teacher.subject}</span>
                      </span>
                    </td>

                    {/* Kelas Diampu */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {teacher.targetClasses && teacher.targetClasses.length > 0 ? (
                          teacher.targetClasses.map(cls => (
                            <span
                              key={cls}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60"
                            >
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500">Semua Kelas</span>
                        )}
                      </div>
                    </td>

                    {/* Kontak */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {teacher.phone && (
                          <a
                            href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(teacher.name)},%20salam%20dari%20Manajemen%20Brain%20Space%20Academy`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{teacher.phone}</span>
                          </a>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{teacher.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(teacher)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          teacher.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Klik untuk ubah status"
                      >
                        {teacher.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>AKTIF</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>NONAKTIF</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Login as Teacher */}
                        {onLoginAsTeacher && (
                          <button
                            type="button"
                            onClick={() => onLoginAsTeacher(teacher)}
                            className="px-2.5 py-1.5 bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800/60 rounded-xl transition-all text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm"
                            title={`Masuk & Buka Panel Guru untuk ${teacher.name}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden xl:inline">Panel Guru</span>
                          </button>
                        )}

                        {/* Read Detail */}
                        <button
                          type="button"
                          onClick={() => setDetailTeacher(teacher)}
                          className="p-2 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 rounded-xl transition-all border border-slate-700/60"
                          title="Lihat Detail Profil Guru"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Update */}
                        <button
                          type="button"
                          onClick={() => openEditModal(teacher)}
                          className="p-2 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 rounded-xl transition-all border border-slate-700/60"
                          title="Edit Data Guru"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTargetTeacher(teacher)}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-xl transition-all"
                          title="Hapus Data Guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Edit Teacher Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lengkapi informasi data pendidik dan mata pelajaran yang diampu.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Row 1: Nama Lengkap & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Lengkap & Gelar <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Dr. Hendra Wijaya, M.Pd."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">
                      NIP / NUPTK / Kode Guru <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomYear = 1980 + Math.floor(Math.random() * 20);
                        const randomMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
                        const randomDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
                        setNip(`${randomYear}${randomMonth}${randomDay}201001${Math.floor(1000 + Math.random() * 9000)}`);
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      + Generate NIP
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={e => setNip(e.target.value)}
                    placeholder="Contoh: 198503152010011012"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white font-mono placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Row 2: Email & No. Telepon/WA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Pengajar <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama.guru@brainspace.id"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Row 2.5: Akun Login (Username & Password) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Username Login <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Contoh: hendra"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk login ke Panel Guru</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Password Akun <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="guru123"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: <code className="text-amber-400">guru123</code></p>
                </div>
              </div>

              {/* Row 3: Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mata Pelajaran yang Diampu <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white"
                  >
                    {availableSubjectOptions.map(subj => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                    <option value="CUSTOM">Lainnya (Ketik Manual)...</option>
                  </select>

                  {subject === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      placeholder="Masukkan nama mata pelajaran baru..."
                      className="w-full bg-slate-950 border border-blue-500 rounded-xl p-2.5 text-xs text-white"
                    />
                  )}
                </div>
              </div>

              {/* Row 4: Kelas yang Diampu (Multi-Select Chips) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Kelas yang Diampu
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedClasses.includes('SEMUA')) {
                        setSelectedClasses([]);
                      } else {
                        setSelectedClasses(['SEMUA', ...classes.map(c => c.name)]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedClasses.includes('SEMUA')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua Kelas
                  </button>

                  {classes.map(cls => {
                    const isSelected = selectedClasses.includes(cls.name);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassSelection(cls.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-950 text-blue-300 border border-blue-600'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                        <span>{cls.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Jenis Kelamin & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === 'L'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Laki-laki (L)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === 'P'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Perempuan (P)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Status Keaktifan
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as TeacherStatus)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE (Aktif Mengajar)</option>
                    <option value="INACTIVE">INACTIVE (Cuti / Nonaktif)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Foto Profil Pengajar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar preset ${idx}`}
                      onClick={() => setAvatar(url)}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer transition-all shrink-0 ${
                        avatar === url ? 'ring-2 ring-blue-500 scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  placeholder="Atau tempel URL foto kustom (https://...)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* Row 7: Bio / Catatan */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Bio Singkat & Rekam Jejak
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Contoh: Pengajar Matematika berpengalaman 8 tahun spesialisasi Penalaran Kuantitatif SNBT."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-blue-600 to-blue-700 hover:from-red-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambahkan Guru'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. Read / Detail Dossier Modal */}
      {detailTeacher && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Profil & Dossier Guru</h3>
              </div>
              <button
                onClick={() => setDetailTeacher(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <img
                src={detailTeacher.avatar || PRESET_AVATARS[0]}
                alt={detailTeacher.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/50 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-white truncate">{detailTeacher.name}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    detailTeacher.gender === 'L' ? 'bg-cyan-950 text-cyan-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {detailTeacher.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <p className="text-xs text-blue-400 font-bold">{detailTeacher.subject}</p>
                <p className="font-mono text-[11px] text-slate-400">NIP: {detailTeacher.nip}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Status Keaktifan:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  detailTeacher.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {detailTeacher.status === 'ACTIVE' ? 'AKTIF MENGAJAR' : 'NONAKTIF'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                <span className="text-slate-400 block font-semibold">Kelas Binaan / Diampu:</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailTeacher.targetClasses && detailTeacher.targetClasses.length > 0 ? (
                    detailTeacher.targetClasses.map(cls => (
                      <span key={cls} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800/50">
                        {cls}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">Semua Kelas</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                <span className="text-slate-400 block font-semibold">Informasi Kontak:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">{detailTeacher.email}</span>
                  </div>
                  {detailTeacher.phone && (
                    <a
                      href={`https://wa.me/${detailTeacher.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(detailTeacher.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{detailTeacher.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Akun Login Info */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                <span className="text-amber-300 block font-semibold">Kredensial Login Guru:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Username:</span>
                    <span className="font-mono font-bold text-white">{detailTeacher.username || detailTeacher.nip}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Password:</span>
                    <span className="font-mono font-bold text-amber-400">{detailTeacher.password || 'guru123'}</span>
                  </div>
                </div>
              </div>

              {detailTeacher.bio && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <span className="text-slate-400 block font-semibold">Catatan / Profil Pengajar:</span>
                  <p className="text-slate-300 leading-relaxed">{detailTeacher.bio}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              {onLoginAsTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    const tch = detailTeacher;
                    setDetailTeacher(null);
                    onLoginAsTeacher(tch);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Panel Guru Ini
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    const tch = detailTeacher;
                    setDetailTeacher(null);
                    openEditModal(tch);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTeacher(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {deleteTargetTeacher && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Hapus Data Guru?</h3>
                <p className="text-xs text-rose-300/80">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              Apakah Anda yakin ingin menghapus data pengajar{' '}
              <strong className="text-white">{deleteTargetTeacher.name}</strong> (NIP:{' '}
              <span className="font-mono text-cyan-400">{deleteTargetTeacher.nip}</span>)?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetTeacher(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
