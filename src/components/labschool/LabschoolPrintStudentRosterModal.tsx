import React, { useState, useRef } from 'react';
import { User } from '../../types';
import {
  Printer,
  X,
  Users,
  Download,
  Check,
  Copy,
  GraduationCap,
  Building,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';

interface LabschoolPrintStudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: 'SMA' | 'SMP';
  targetClassName?: string;
  students: User[];
  user?: User;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LabschoolPrintStudentRosterModal: React.FC<LabschoolPrintStudentRosterModalProps> = ({
  isOpen,
  onClose,
  level,
  targetClassName = 'SMA-LABSCHOOL',
  students,
  user,
  onShowToast
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const uniqueGroups = Array.from(new Set(students.map(s => s.group).filter(Boolean)));

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const lines = [
      `=== DAFTAR RESMI DATA SISWA KELAS ${targetClassName} ===`,
      `Jenjang: ${level === 'SMA' ? 'SMA Labschool (Kelas 10)' : 'SMP Labschool (Kelas 7)'}`,
      `Total Siswa: ${students.length} Siswa (Aktif: ${activeCount}, Pending: ${pendingCount})`,
      `Kelompok Belajar: ${uniqueGroups.join(', ') || '-'}`,
      `Tanggal Cetak: ${currentDateStr}`,
      '',
      ...students.map((st, i) => 
        `${i + 1}. [NIS: ${st.nis}] ${st.name} | Kelas: ${st.className} | Kelompok: ${st.group || '-'} | Status: ${st.status} | Kontak: ${st.whatsapp || st.phone || st.email}`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (onShowToast) onShowToast('Daftar siswa berhasil disalin ke clipboard!', 'success');
  };

  const handleExportCsv = () => {
    const headers = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Kelompok', 'Target Kampus', 'Peminatan', 'WhatsApp', 'Email', 'Status', 'Bio/Catatan'];
    const rows = students.map((st, idx) => [
      idx + 1,
      `"${st.nis}"`,
      `"${st.name}"`,
      `"${st.className}"`,
      `"${st.group || '-'}"`,
      `"${st.bio?.includes('Rawamangun') ? 'SMA Labschool Rawamangun' : st.bio?.includes('Kebayoran') ? 'SMA Labschool Kebayoran' : st.bio?.includes('Cibubur') ? 'SMA Labschool Cibubur' : st.bio?.includes('Cirendeu') ? 'SMA Labschool Cirendeu' : 'SMA Labschool'}"`,
      `"${st.bio?.includes('MIPA') ? 'MIPA Saintek' : st.bio?.includes('IPS') ? 'IPS Soshum' : 'Reguler'}"`,
      `"${st.whatsapp || st.phone || '-'}"`,
      `"${st.email}"`,
      `"${st.status}"`,
      `"${(st.bio || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Siswa_${targetClassName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('File CSV data siswa berhasil diunduh!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                  {targetClassName}
                </span>
                <span className="text-xs text-slate-400 font-medium">Dokumen Roster Resmi</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Pratinjau & Cetak Data Siswa {level === 'SMA' ? 'SMA Labschool' : 'SMP Labschool'}
              </h3>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="Perkecil Tampilan"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono font-semibold">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="Perbesar Tampilan"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-slate-400"
                title="Reset Skala"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all hover:scale-105"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Preview Area */}
        <div className="flex-1 p-4 sm:p-8 bg-slate-950 overflow-y-auto custom-scrollbar flex justify-center">
          <div
            ref={printAreaRef}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6 transition-transform duration-200 select-text print:p-0 print:shadow-none print:max-w-none print:w-full"
          >
            {/* Kop Surat Resmi Labschool */}
            <div className="border-b-4 border-emerald-800 pb-4 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white font-black text-2xl flex items-center justify-center tracking-tighter shadow-md shrink-0">
                  LS
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-900">
                    Yayasan Pembina Universitas Negeri Jakarta
                  </h4>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    LABSCHOOL INDONESIA
                  </h2>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Pusat Program Pembinaan & Seleksi Penerimaan Siswa Baru (PSB) Labschool
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Kampus: Rawamangun • Kebayoran • Cibubur • Cirendeu | Website: www.labschool-unj.sch.id
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 border-l border-slate-200 pl-5">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-extrabold uppercase">
                  DOKUMEN RESMI
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Kode Dokumen: DOC-LS-{targetClassName}-2026</p>
                <p className="text-[10px] text-slate-500">Tanggal: {currentDateStr}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide uppercase">
                DAFTAR RESMI DATA SISWA KELAS {targetClassName}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Program Intensif Persiapan Seleksi Masuk {level === 'SMA' ? 'SMA Labschool (Kelas 10)' : 'SMP Labschool (Kelas 7)'} Tahun Ajaran 2026/2027
              </p>
            </div>

            {/* Summary Statistics Box */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="text-center p-2 border-r border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Siswa</p>
                <p className="text-lg font-black text-emerald-700">{students.length} Siswa</p>
              </div>
              <div className="text-center p-2 border-r border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Status Aktif</p>
                <p className="text-lg font-black text-blue-700">{activeCount} Terverifikasi</p>
              </div>
              <div className="text-center p-2 border-r border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Kelompok Binaan</p>
                <p className="text-lg font-black text-amber-700">{uniqueGroups.length} Kelompok</p>
              </div>
              <div className="text-center p-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Jenjang Target</p>
                <p className="text-lg font-black text-purple-700">{level === 'SMA' ? 'SMA 10 Labs' : 'SMP 7 Labs'}</p>
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center border-r border-emerald-700 w-10">No</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700 w-24">NIS</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700">Nama Lengkap Siswa</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700 w-28">Kelas & Kelompok</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700">Target Kampus & Peminatan</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700 w-28">WhatsApp / Kontak</th>
                    <th className="py-2.5 px-3 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px] text-slate-800">
                  {students.map((st, idx) => {
                    const targetCampus = st.bio?.includes('Kebayoran')
                      ? 'SMA Labs Kebayoran'
                      : st.bio?.includes('Rawamangun')
                      ? 'SMA Labs Rawamangun'
                      : st.bio?.includes('Cibubur')
                      ? 'SMA Labs Cibubur'
                      : st.bio?.includes('Cirendeu')
                      ? 'SMA Labs Cirendeu'
                      : 'SMA Labschool';

                    const majorTrack = st.bio?.includes('MIPA')
                      ? 'MIPA Saintek'
                      : st.bio?.includes('IPS')
                      ? 'IPS Soshum'
                      : 'Reguler';

                    return (
                      <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="py-2 px-3 text-center font-mono font-semibold border-r border-slate-200 text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold border-r border-slate-200 text-slate-900">
                          {st.nis}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                          <div>{st.name}</div>
                          <div className="text-[9px] text-slate-500 font-normal">{st.email}</div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="font-semibold text-emerald-800">{st.className}</div>
                          <div className="text-[10px] text-slate-600">{st.group || '-'}</div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{targetCampus}</div>
                          <div className="text-[10px] text-cyan-800 font-medium">{majorTrack}</div>
                        </td>
                        <td className="py-2 px-3 font-mono border-r border-slate-200 text-slate-700">
                          {st.whatsapp || st.phone || '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            st.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Validation & Signature Footer */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
              <div className="text-left space-y-1">
                <p className="text-[10px] text-slate-500">Catatan Penting:</p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  1. Data siswa di atas sah dan tercatat dalam pangkalan data terpadu Bimbingan PSB Labschool Indonesia.<br />
                  2. Siswa berstatus ACTIVE berhak mengikuti seluruh modul, silabus, dan simulasi tryout CBT terjadwal.
                </p>
              </div>

              <div className="text-right space-y-12">
                <div>
                  <p className="text-slate-600 font-medium">Jakarta, {currentDateStr}</p>
                  <p className="font-bold text-slate-900">Koordinator Akademik & Kurikulum PSB Labschool</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">Dr. H. Ahmad Fauzi, M.Pd.</p>
                  <p className="text-[10px] text-slate-500">NIP. 19780415 200312 1 002</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
