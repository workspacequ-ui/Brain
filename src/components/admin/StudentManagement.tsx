import React, { useState, useMemo } from 'react';
import { User, ClassItem } from '../../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  X,
  Phone,
  MessageCircle,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface StudentManagementProps {
  users: User[];
  classes: ClassItem[];
  onSaveStudent: (student: User) => void;
  onDeleteStudent: (studentId: string) => void;
}

const DEFAULT_GROUP_PRESETS = [
  'Kelompok 1 - Alpha (UTBK)',
  'Kelompok 2 - Einstein',
  'Kelompok 3 - Galileo',
  'Kelompok 4 - Curie',
  'Kelompok 5 - Newton',
  'Kelompok 6 - Archimedes'
];

export const StudentManagement: React.FC<StudentManagementProps> = ({
  users,
  classes,
  onSaveStudent,
  onDeleteStudent
}) => {
  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [copiedWaId, setCopiedWaId] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form Fields
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [group, setGroup] = useState(DEFAULT_GROUP_PRESETS[0]);
  const [className, setClassName] = useState(classes[0]?.name || 'XII-UTBK');
  const [status, setStatus] = useState<'ACTIVE' | 'PENDING' | 'REJECTED'>('ACTIVE');
  const [password, setPassword] = useState('user123');

  // Extract unique groups from existing students + default presets
  const availableGroups = useMemo(() => {
    const set = new Set<string>(DEFAULT_GROUP_PRESETS);
    students.forEach(s => {
      if (s.group && s.group.trim()) {
        set.add(s.group.trim());
      }
    });
    return Array.from(set);
  }, [students]);

  const openAddModal = () => {
    setEditingStudent(null);
    setNis(`2026${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setEmail('');
    setWhatsapp('');
    setGroup(DEFAULT_GROUP_PRESETS[0]);
    setClassName(classes[0]?.name || 'XII-UTBK');
    setStatus('ACTIVE');
    setPassword('user123');
    setIsModalOpen(true);
  };

  const openEditModal = (student: User) => {
    setEditingStudent(student);
    setNis(student.nis);
    setName(student.name);
    setEmail(student.email);
    setWhatsapp(student.whatsapp || student.phone || '');
    setGroup(student.group || DEFAULT_GROUP_PRESETS[0]);
    setClassName(student.className);
    setStatus(student.status);
    setPassword(student.password || 'user123');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !name || !email) return;

    const trimmedWa = whatsapp.trim().replace(/[^0-9+]/g, '');

    const studentToSave: User = {
      id: editingStudent ? editingStudent.id : `u-std-${Date.now()}`,
      nis: nis.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: trimmedWa || undefined,
      whatsapp: trimmedWa || undefined,
      group: group.trim() || 'Kelompok 1 - Alpha (UTBK)',
      role: 'student',
      className,
      status,
      password,
      createdAt: editingStudent ? editingStudent.createdAt : new Date().toISOString().split('T')[0],
      avatar: editingStudent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
    };

    onSaveStudent(studentToSave);
    setIsModalOpen(false);
  };

  const handleCopyWa = (waNumber: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(waNumber);
    setCopiedWaId(id);
    setTimeout(() => {
      setCopiedWaId(null);
    }, 2000);
  };

  const formatWaUrl = (wa?: string, studentName?: string) => {
    if (!wa) return '#';
    let clean = wa.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    const message = encodeURIComponent(`Halo ${studentName || 'Siswa'}, ini pesan resmi dari Admin Brain Space Academy.`);
    return `https://wa.me/${clean}?text=${message}`;
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['No', 'NIS', 'Nama Lengkap', 'Kelas', 'Kelompok', 'Nomor WA', 'Email', 'Status Akun', 'Tanggal Daftar'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.nis}"`,
      `"${s.name}"`,
      `"${s.className}"`,
      `"${s.group || '-'}"`,
      `"${s.whatsapp || s.phone || '-'}"`,
      `"${s.email}"`,
      `"${s.status}"`,
      `"${s.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_BrainSpace_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering Logic
  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.whatsapp && s.whatsapp.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.group && s.group.toLowerCase().includes(q));

    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    const matchesGroup = selectedGroup === 'ALL' || (s.group && s.group === selectedGroup);

    return matchesSearch && matchesClass && matchesGroup;
  });

  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const withWaCount = students.filter(s => !!(s.whatsapp || s.phone)).length;
  const uniqueGroupCount = new Set(students.map(s => s.group).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pengelola Data Siswa</h2>
              <p className="text-xs text-slate-400">
                Kelola profil, kelas, kelompok belajar, nomor WhatsApp, dan status keaktifan siswa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            title="Unduh Data Siswa Lengkap dalam format CSV"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Metrics Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Siswa</span>
            <span className="text-base font-extrabold text-white font-mono">{students.length} Siswa</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Siswa Aktif</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">{activeCount} Siswa</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Terhubung WA</span>
            <span className="text-base font-extrabold text-emerald-300 font-mono">{withWaCount} Kontak</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Kelompok Belajar</span>
            <span className="text-base font-extrabold text-purple-300 font-mono">{uniqueGroupCount} Kelompok</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIS, email, nomor WA, atau kelompok..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-medium">Kelas:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Kelas ({students.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.name} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelompok */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] text-slate-400 font-medium">Kelompok:</span>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Kelompok</option>
              {availableGroups.map(grp => (
                <option key={grp} value={grp} className="bg-slate-900 text-white">
                  {grp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800 whitespace-nowrap">
              <tr>
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4 min-w-[200px]">Profil Siswa</th>
                <th className="p-4 min-w-[100px]">NIS</th>
                <th className="p-4 min-w-[110px]">Kelas</th>
                <th className="p-4 min-w-[170px]">Kelompok Belajar</th>
                <th className="p-4 min-w-[160px]">Nomor WhatsApp</th>
                <th className="p-4 min-w-[160px]">Email</th>
                <th className="p-4 min-w-[110px]">Status Akun</th>
                <th className="p-4 text-right min-w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 whitespace-nowrap">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">Tidak ada data siswa ditemukan.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kelas/kelompok.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const studentWa = student.whatsapp || student.phone || '';
                  const studentGroup = student.group || 'Kelompok 1 - Alpha (UTBK)';
                  const isCopied = copiedWaId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-center font-mono text-slate-500 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Profil Siswa */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                            alt={student.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-100">{student.name}</p>
                            <p className="text-[10px] text-slate-500">Daftar: {student.createdAt || '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* NIS */}
                      <td className="p-4 font-mono text-cyan-400 font-bold">{student.nis}</td>

                      {/* Kelas */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm">
                          {student.className}
                        </span>
                      </td>

                      {/* Kelompok Belajar (BARU) */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 shadow-sm">
                            <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate max-w-[150px]" title={studentGroup}>
                              {studentGroup}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Nomor WhatsApp (BARU) */}
                      <td className="p-4">
                        {studentWa ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-sm">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{studentWa}</span>
                            </span>

                            {/* Tombol Chat WA Langsung */}
                            <a
                              href={formatWaUrl(studentWa, student.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-colors"
                              title={`Kirim Pesan WhatsApp ke ${student.name} (${studentWa})`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            {/* Tombol Copy Nomor WA */}
                            <button
                              type="button"
                              onClick={(e) => handleCopyWa(studentWa, student.id, e)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Salin Nomor WA"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">Belum diisi</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{student.email}</td>

                      {/* Status Akun */}
                      <td className="p-4">
                        {student.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                        {student.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                        {student.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-right space-x-1.5">
                        {studentWa && (
                          <a
                            href={formatWaUrl(studentWa, student.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 rounded-xl transition-all"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditModal(student)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus siswa ${student.name}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-xl transition-all cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {editingStudent ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-lg text-white">
                  {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NIS Siswa
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    placeholder="20261001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas Binaan
                  </label>
                  <select
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              {/* Kelompok Belajar & Nomor WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Kelompok Belajar</span>
                  </label>
                  <input
                    type="text"
                    list="group-options"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Contoh: Kelompok 1 - Alpha (UTBK)"
                    required
                  />
                  <datalist id="group-options">
                    {availableGroups.map(grp => (
                      <option key={grp} value={grp} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nomor WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Siswa
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="budi@student.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Disetujui)</option>
                    <option value="PENDING">PENDING (Menunggu)</option>
                    <option value="REJECTED">REJECTED (Ditolak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password Akun
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
