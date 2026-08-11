import React from 'react';
import {
  SnbtSyllabusModule,
  SnbtModuleUserProgress,
  SnbtModuleStatus,
  SNBT_7_SUBTEST_METAS
} from './snbtSyllabusData';
import {
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  ExternalLink,
  FileText,
  Video,
  Award,
  Bookmark,
  Target,
  GraduationCap,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface SnbtModuleDetailModalProps {
  module: SnbtSyllabusModule;
  userProgress?: SnbtModuleUserProgress;
  onClose: () => void;
  onUpdateStatus: (moduleId: string, status: SnbtModuleStatus, notes?: string, understanding?: number) => void;
  onToggleBookmark?: (moduleId: string) => void;
  onOpenExam?: (examTitle: string) => void;
}

export const SnbtModuleDetailModal: React.FC<SnbtModuleDetailModalProps> = ({
  module,
  userProgress,
  onClose,
  onUpdateStatus,
  onToggleBookmark,
  onOpenExam
}) => {
  const currentStatus: SnbtModuleStatus = userProgress?.status || 'NOT_STARTED';
  const subtestMeta = SNBT_7_SUBTEST_METAS.find(s => s.code === module.subtestCode);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'DASAR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MENENGAH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'HOTS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${subtestMeta?.colorGradient || 'from-indigo-600 to-purple-600'} text-white shadow-lg`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">
                  {module.code}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {module.subtestName} ({module.subtestCode})
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getDifficultyBadge(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1">
                {module.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(module.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  userProgress?.isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Tandai Favorit"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-slate-300 text-sm">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">Timeline & Pekan</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-white text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pekan {module.weekNumber} (Fase {module.phaseNumber})</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">Target Skor IRT</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-400 text-xs">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>{module.targetScoreIrt}+ / 1000</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">Estimasi Waktu</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-amber-400 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{module.durationMinutes} Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">Guru PIC Pengampu</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-indigo-300 text-xs truncate">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{module.teacherInCharge}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Deskripsi Modul Pembelajaran
            </h3>
            <p className="text-slate-200 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              {module.description}
            </p>
          </div>

          {/* Capaian Kompetensi */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Capaian Kompetensi Ujian
            </h3>
            <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl text-amber-200">
              {module.competency}
            </div>
          </div>

          {/* Subtopics Rincian */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pokok Bahasan & Blueprint Materi:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {module.subtopics.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-200 leading-snug">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flash Formula & Trik Cepat */}
          {module.flashFormula && (
            <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-indigo-950/40 border border-rose-500/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>RUMUS KILAT & TRIK ELIMINASI OPSI (SPEED STRATEGY)</span>
              </div>
              <p className="text-slate-100 text-xs font-medium leading-relaxed font-mono bg-slate-900/80 p-3 rounded-lg border border-rose-500/30">
                {module.flashFormula}
              </p>
            </div>
          )}

          {/* Concept Summary */}
          {module.conceptSummary && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Intisari Konsep & Landasan Teori
              </h3>
              <div className="bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-xl text-cyan-100 text-xs leading-relaxed">
                {module.conceptSummary}
              </div>
            </div>
          )}

          {/* Link Akses Materi & CBT Drill */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Media Modul & Simulasi CBT Terkait:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {module.linkedMaterialUrl && (
                <a
                  href={module.linkedMaterialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 hover:bg-indigo-900/40 hover:border-indigo-400 text-indigo-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {module.linkedMaterialType === 'VIDEO' ? (
                      <Video className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="text-[10px] text-indigo-400 block font-semibold">
                        {module.linkedMaterialType || 'DOKUMEN'} MODUL
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 truncate block">
                        {module.linkedMaterialTitle || 'Buka E-Book Modul Materi'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                </a>
              )}

              {module.linkedExamTitle && (
                <button
                  type="button"
                  onClick={() => onOpenExam && onOpenExam(module.linkedExamTitle!)}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400 text-emerald-200 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        SIMULASI CBT RESMI
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate block">
                        {module.linkedExamTitle}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Status Toggle Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status Belajar:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateStatus(module.id, 'NOT_STARTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentStatus === 'NOT_STARTED'
                    ? 'bg-slate-700 text-white shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                Belum Dimulai
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(module.id, 'IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentStatus === 'IN_PROGRESS'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                Sedang Belajar
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(module.id, 'COMPLETED')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tuntas / Selesai</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
