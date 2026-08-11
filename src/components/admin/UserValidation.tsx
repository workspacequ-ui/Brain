import React from 'react';
import { User } from '../../types';
import { UserCheck, CheckCircle2, XCircle, Clock, Search, MessageCircle, Layers, ExternalLink } from 'lucide-react';

interface UserValidationProps {
  users: User[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

export const UserValidation: React.FC<UserValidationProps> = ({
  users,
  onApprove,
  onReject
}) => {
  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = pendingUsers.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nis.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.whatsapp && u.whatsapp.includes(searchTerm)) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.group && u.group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatWaUrl = (wa?: string, studentName?: string) => {
    if (!wa) return '#';
    let clean = wa.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    const message = encodeURIComponent(`Halo ${studentName || 'Siswa'}, admin Brain Space Academy ingin mengonfirmasi pendaftaran akun Anda.`);
    return `https://wa.me/${clean}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Validasi & Persetujuan User Baru</h2>
          </div>
          <p className="text-xs text-slate-400">
            Daftar siswa baru yang mendaftar dan membutuhkan persetujuan Administrator.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">
            Pending: <strong className="text-amber-400 font-bold">{pendingUsers.length} Siswa</strong>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Cari nama, NIS, nomor WA, atau kelompok..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">Tidak ada pendaftaran pending</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua pendaftaran siswa baru telah disetujui atau tidak ada pendaftar baru saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800 whitespace-nowrap">
                <tr>
                  <th className="p-4">Siswa</th>
                  <th className="p-4">NIS</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Kelompok Belajar</th>
                  <th className="p-4">Nomor WhatsApp</th>
                  <th className="p-4">Email Pendaftaran</th>
                  <th className="p-4">Tanggal Daftar</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 whitespace-nowrap">
                {filtered.map(user => {
                  const userWa = user.whatsapp || user.phone;
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                            alt={user.name}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                          />
                          <span className="font-semibold text-slate-100">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-cyan-400 font-semibold">{user.nis}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                          {user.className}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/50">
                          <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{user.group || 'Kelompok 1 - Alpha (UTBK)'}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        {userWa ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                              {userWa}
                            </span>
                            <a
                              href={formatWaUrl(userWa, user.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40"
                              title="Chat WhatsApp"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">-</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{user.email}</td>
                      <td className="p-4 text-slate-500">{user.createdAt}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => onApprove(user.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => onReject(user.id)}
                          className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 font-semibold rounded-xl text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

