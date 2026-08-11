import React, { useState } from 'react';
import { SnbtStudentProfile } from './snbtData';
import { OfficialKopSurat } from '../common/OfficialKopSurat';
import { getAppSettings } from '../../utils/storage';
import {
  Printer,
  X,
  FileText,
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  School
} from 'lucide-react';

interface SnbtPrintStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: SnbtStudentProfile[];
  allCount: number;
  selectedGroup: string;
  selectedStatus: string;
  selectedReadiness: string;
  searchQuery: string;
}

export const SnbtPrintStudentsModal: React.FC<SnbtPrintStudentsModalProps> = ({
  isOpen,
  onClose,
  students,
  allCount,
  selectedGroup,
  selectedStatus,
  selectedReadiness,
  searchQuery
}) => {
  const [showSubtestScores, setShowSubtestScores] = useState<boolean>(true);

  if (!isOpen) return null;

  const appSettings = getAppSettings();
  const kopSettings = appSettings.kopSurat;
  const institution = appSettings.institution;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const avgScore =
    students.length > 0
      ? Math.round(
          students.reduce((acc, curr) => acc + curr.avgTryoutScore, 0) /
            students.length
        )
      : 0;

  const verifiedCount = students.filter(
    s => s.snpmbAccountStatus === 'TERVERIFIKASI'
  ).length;

  const veryReadyCount = students.filter(
    s => s.readinessLevel === 'SANGAT_SIAP'
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-slate-900/95 border border-slate-700 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mr-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSubtestScores}
            onChange={e => setShowSubtestScores(e.target.checked)}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
          />
          <span>Rincian 7 Subtes</span>
        </label>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen (Print / PDF)</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
          title="Tutup Pratinjau"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 / Letter styling in white) */}
      <div className="bg-white text-slate-900 w-full max-w-5xl p-6 sm:p-10 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:max-w-none print:w-full print:rounded-none my-8 print:my-0 space-y-6">
        {/* Kop Surat Resmi */}
        <div className="pb-2 border-b-2 border-slate-900">
          <OfficialKopSurat
            kopSettings={kopSettings}
            institution={institution}
            documentBadge="LAPORAN DATA SISWA KELAS XII-UTBK"
            documentId={`SNBT-ROSTER-${new Date().toISOString().slice(0, 10)}`}
          />
        </div>

        {/* Title and Filter Parameters Metadata */}
        <div className="space-y-3">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
              DAFTAR REKAPITULASI PROFIL & TARGET SISWA UTBK-SNBT 2026
            </h2>
            <p className="text-xs text-slate-600">
              Program Intensif Persiapan Seleksi Nasional Berdasarkan Tes (SNBT) • Tahun Ajaran 2025/2026
            </p>
          </div>

          {/* Active Filter Criteria Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-slate-500 font-medium">Kelompok Belajar:</span>{' '}
              <span className="font-bold text-slate-800">
                {selectedGroup === 'ALL' ? 'Semua Kelompok' : selectedGroup}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Status SNPMB:</span>{' '}
              <span className="font-bold text-slate-800">
                {selectedStatus === 'ALL' ? 'Semua Status' : selectedStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tingkat Kesiapan:</span>{' '}
              <span className="font-bold text-slate-800">
                {selectedReadiness === 'ALL' ? 'Semua Level' : selectedReadiness}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Data Ditampilkan:</span>{' '}
              <span className="font-bold text-indigo-700 font-mono">
                {students.length} dari {allCount} Siswa
              </span>
            </div>
            {searchQuery && (
              <div className="col-span-2 sm:col-span-4 text-[11px] text-slate-600 italic">
                Kata kunci pencarian aktif: "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Siswa</div>
            <div className="text-lg font-black text-slate-900 font-mono">{students.length}</div>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-amber-800">Rata-rata Skor</div>
            <div className="text-lg font-black text-amber-800 font-mono">{avgScore}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Akun Terverifikasi</div>
            <div className="text-lg font-black text-emerald-800 font-mono">{verifiedCount}</div>
          </div>
          <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-purple-800">Kesiapan Sangat Tinggi</div>
            <div className="text-lg font-black text-purple-800 font-mono">{veryReadyCount}</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 text-[10px] uppercase tracking-wider border-b border-slate-300">
              <tr>
                <th className="p-2 text-center border-r border-slate-300 w-8">No</th>
                <th className="p-2 border-r border-slate-300 min-w-[130px]">Nama & NIS</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Asal Sekolah / Grup</th>
                <th className="p-2 border-r border-slate-300 min-w-[150px]">Pilihan 1 (PTN & Prodi)</th>
                <th className="p-2 border-r border-slate-300 min-w-[140px]">Pilihan 2 (PTN & Prodi)</th>
                {showSubtestScores && (
                  <th className="p-2 border-r border-slate-300 text-center min-w-[140px]">
                    Nilai 7 Subtes IRT
                  </th>
                )}
                <th className="p-2 border-r border-slate-300 text-center w-16">Avg Skor</th>
                <th className="p-2 border-r border-slate-300 text-center w-24">Status Akun</th>
                <th className="p-2 text-center w-24">Kesiapan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
              {students.map((student, idx) => {
                const isPassing1 = student.avgTryoutScore >= student.passingGrade1;
                const diff1 = student.avgTryoutScore - student.passingGrade1;

                return (
                  <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="p-2 text-center font-bold font-mono border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NIS: {student.nis}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-medium text-slate-800">{student.schoolOrigin}</div>
                      <div className="text-[10px] text-indigo-700 font-semibold">{student.group}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-blue-900">{student.targetPtn1}</div>
                      <div className="text-[10px] text-slate-600">{student.prodi1}</div>
                      <div className="text-[9px] font-mono mt-0.5 flex items-center justify-between">
                        <span className="text-slate-500">PG: {student.passingGrade1}</span>
                        <span className={`font-bold ${isPassing1 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isPassing1 ? `+${diff1} (Aman)` : `${diff1}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-slate-800">{student.targetPtn2}</div>
                      <div className="text-[10px] text-slate-600">{student.prodi2}</div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        PG: {student.passingGrade2}
                      </div>
                    </td>
                    {showSubtestScores && (
                      <td className="p-1.5 border-r border-slate-200 text-center">
                        <div className="grid grid-cols-7 gap-0.5 text-[8px] font-mono">
                          {student.subtestScores.map(sub => (
                            <div
                              key={sub.code}
                              className={`p-0.5 rounded border text-[8px] ${
                                sub.score >= sub.targetScore
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              title={`${sub.code}: ${sub.score}`}
                            >
                              <div className="text-[7px] text-slate-500 leading-tight">{sub.code}</div>
                              <div>{sub.score}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                      {student.avgTryoutScore}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          student.snpmbAccountStatus === 'TERVERIFIKASI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.snpmbAccountStatus === 'PERLU_FINALISASI'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {student.snpmbAccountStatus === 'TERVERIFIKASI'
                          ? 'VERIFIKASI'
                          : student.snpmbAccountStatus === 'PERLU_FINALISASI'
                          ? 'FINALISASI'
                          : 'BLM DAFTAR'}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          student.readinessLevel === 'SANGAT_SIAP'
                            ? 'bg-purple-100 text-purple-800'
                            : student.readinessLevel === 'SIAP'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {student.readinessLevel === 'SANGAT_SIAP'
                          ? 'SANGAT SIAP'
                          : student.readinessLevel === 'SIAP'
                          ? 'SIAP'
                          : 'BIMBINGAN'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Signature Blocks */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-12">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-800">Koordinator Bimbingan SNBT</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 border-b border-slate-400 inline-block px-8 pb-1">
                {institution?.name || 'Dr. H. Ahmad Dahlan, M.Pd.'}
              </p>
              <p className="text-[10px] text-slate-500">NIP / NIK. 19850315 201001 1 008</p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p className="text-slate-500">Dicetak pada: {currentDateFormatted}</p>
              <p className="font-bold text-slate-800">Konselor Akademik & Karir PTN</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 border-b border-slate-400 inline-block px-8 pb-1">
                Nurul Fauziyah, S.Psi., M.Psi.
              </p>
              <p className="text-[10px] text-slate-500">Konselor UTBK & Perguruan Tinggi</p>
            </div>
          </div>
        </div>

        {/* Document Footer Note */}
        <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
          Dokumen ini digenerate secara otomatis melalui Sistem Pusat Kendali SNBT/UTBK 2026. Standar IRT Terpadu.
        </div>
      </div>
    </div>
  );
};
