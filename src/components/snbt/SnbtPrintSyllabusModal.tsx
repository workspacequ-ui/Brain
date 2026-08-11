import React from 'react';
import {
  SnbtSyllabusModule,
  SNBT_7_SUBTEST_METAS,
  SNBT_WEEKLY_PLOTTING
} from './snbtSyllabusData';
import { User, InstitutionInfo } from '../../types';
import { X, Printer, Download, BookOpen, Layers, Target, Clock, CheckCircle2 } from 'lucide-react';
import { OfficialKopSurat } from '../common/OfficialKopSurat';
import { getAppSettings } from '../../utils/storage';

interface SnbtPrintSyllabusModalProps {
  modules: SnbtSyllabusModule[];
  user?: User | null;
  institution?: InstitutionInfo;
  onClose: () => void;
}

export const SnbtPrintSyllabusModal: React.FC<SnbtPrintSyllabusModalProps> = ({
  modules,
  user,
  institution,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const appSettings = getAppSettings();
  const kopSettings = appSettings.kopSurat;
  const effectiveInstitution = institution || appSettings.institution;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Controls Bar (hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white text-slate-900 w-full max-w-4xl p-8 sm:p-12 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:max-w-none print:w-full print:rounded-none my-8">
        {/* Header Kop Resmi */}
        <div className="pb-4 mb-6">
          <OfficialKopSurat
            kopSettings={kopSettings}
            institution={effectiveInstitution}
            documentBadge="DOKUMEN AKADEMIK SNBT"
            documentId="SILABUS-7-SUBTES"
          />
        </div>

        {/* Info Siswa / Pengguna */}
        {user && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-slate-500 block">Nama Siswa / Guru</span>
              <strong className="text-slate-900 font-bold">{user.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Kelas Target</span>
              <strong className="text-slate-900 font-bold">{user.className || 'XII-UTBK'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Status Program</span>
              <strong className="text-indigo-600 font-bold">Intensif UTBK 2026</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Modul Blueprint</span>
              <strong className="text-slate-900 font-bold">{modules.length} Modul Pokok Bahasan</strong>
            </div>
          </div>
        )}

        {/* Section 1: Ringkasan 7 Subtes UTBK-SNBT */}
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 border-l-4 border-indigo-600 pl-2.5">
            I. MATRIKS 7 SUBTES UTBK-SNBT RESMI SNPMB
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-8">No</th>
                <th className="border border-slate-300 p-2">Subtes SNBT</th>
                <th className="border border-slate-300 p-2">Kategori</th>
                <th className="border border-slate-300 p-2 text-center">Jumlah Soal</th>
                <th className="border border-slate-300 p-2 text-center">Durasi</th>
                <th className="border border-slate-300 p-2 text-center">Waktu/Soal</th>
                <th className="border border-slate-300 p-2 text-center">Target Rerata IRT</th>
              </tr>
            </thead>
            <tbody>
              {SNBT_7_SUBTEST_METAS.map((sub, idx) => (
                <tr key={sub.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">
                    {sub.name} <span className="text-slate-500 font-normal">({sub.code})</span>
                  </td>
                  <td className="border border-slate-300 p-2">{sub.categoryBadge}</td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{sub.totalQuestions} Soal</td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{sub.durationMinutes} Menit</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">{sub.avgTimePerQuestionSec} Detik</td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">{sub.targetScoreAverage}+</td>
                </tr>
              ))}
              <tr className="bg-indigo-50/80 font-bold text-slate-900">
                <td colSpan={3} className="border border-slate-300 p-2 text-right">TOTAL KESELURUHAN</td>
                <td className="border border-slate-300 p-2 text-center">155 Soal</td>
                <td className="border border-slate-300 p-2 text-center">195 Menit</td>
                <td className="border border-slate-300 p-2 text-center">~75 Detik</td>
                <td className="border border-slate-300 p-2 text-center text-indigo-800">Target 750+</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Daftar Modul Pembelajaran per Subtes */}
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 border-l-4 border-indigo-600 pl-2.5">
            II. SILABUS MODUL & RUMUS KILAT PEMBELAJARAN
          </h2>
          <div className="space-y-4">
            {modules.map((mod, idx) => (
              <div key={mod.id} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px]">
                      {mod.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">
                      {mod.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
                    <span>{mod.subtestName}</span>
                    <span>•</span>
                    <span>Pekan {mod.weekNumber}</span>
                    <span>•</span>
                    <span className="text-indigo-700 font-bold">Target IRT {mod.targetScoreIrt}+</span>
                  </div>
                </div>

                <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">
                  {mod.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-700 block">Blueprint Pokok Bahasan:</span>
                    <ul className="list-disc list-inside text-slate-600 pl-1">
                      {mod.subtopics.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>

                  {mod.flashFormula && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded text-amber-900 text-[10px] font-mono leading-relaxed">
                      <strong className="font-bold block text-amber-950 font-sans mb-0.5">Rumus Kilat & Trik:</strong>
                      {mod.flashFormula}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Ploting Timeline 20 Pekan */}
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 border-l-4 border-indigo-600 pl-2.5">
            III. PLOTING TIMELINE 20 PEKAN BELAJAR & TARGET IRT
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-12">Pekan</th>
                <th className="border border-slate-300 p-2">Fase & Fokus Pembelajaran</th>
                <th className="border border-slate-300 p-2 text-center">Sesi</th>
                <th className="border border-slate-300 p-2 text-center">Target Band IRT</th>
                <th className="border border-slate-300 p-2">Target Ujian / Drill</th>
              </tr>
            </thead>
            <tbody>
              {SNBT_WEEKLY_PLOTTING.map(plot => (
                <tr key={plot.weekNumber} className={plot.weekNumber % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">W{plot.weekNumber}</td>
                  <td className="border border-slate-300 p-1.5">
                    <strong className="text-slate-900 font-bold block">{plot.focusTitle}</strong>
                    <span className="text-[10px] text-slate-500">{plot.phaseTitle} ({plot.dateRange})</span>
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center">{plot.sessionCount}x</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-700">{plot.targetIrtRange}</td>
                  <td className="border border-slate-300 p-1.5 text-slate-700 font-medium">{plot.examTarget || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Tanda Tangan */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center text-slate-700">
          <div>
            <p className="mb-14">Mengetahui,<br /><strong>Waka Kurikulum / Master Teacher SNBT</strong></p>
            <p className="font-bold underline text-slate-900">Dr. Hendra Wijaya, M.Pd.</p>
            <p className="text-[10px] text-slate-500">NIP. 198503152010011012</p>
          </div>
          <div>
            <p className="mb-14">{effectiveInstitution.city || effectiveInstitution.name}, {currentDate}<br /><strong>Siswa Binaan / Peserta SNBT</strong></p>
            <p className="font-bold underline text-slate-900">{user?.name || 'Siswa Peserta'}</p>
            <p className="text-[10px] text-slate-500">NIS. {user?.nis || '20261001'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
