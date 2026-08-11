import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
  Target,
  Clock,
  Award,
  Layers,
  ChevronRight,
  Lightbulb,
  FileCheck2,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import { LABSCHOOL_SUBTESTS, LabschoolSubtestItem } from './labschoolSubtestData';

interface LabschoolSubtestExplorerProps {
  initialSubtestCode?: string;
  onStartExam?: (subtestCode: string) => void;
}

export const LabschoolSubtestExplorer: React.FC<LabschoolSubtestExplorerProps> = ({
  initialSubtestCode = 'PK',
  onStartExam
}) => {
  const [selectedSubtestCode, setSelectedSubtestCode] = useState<string>(initialSubtestCode);
  const [selectedSubpartIndex, setSelectedSubpartIndex] = useState<number>(0);
  
  // Interactive sample quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const currentSubtest = LABSCHOOL_SUBTESTS.find(s => s.code === selectedSubtestCode) || LABSCHOOL_SUBTESTS[0];
  const currentSubpart = currentSubtest.subparts[selectedSubpartIndex] || currentSubtest.subparts[0];

  const handleSelectOption = (subpartId: string, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [subpartId]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [subpartId]: true }));
  };

  const handleResetQuiz = (subpartId: string) => {
    setUserAnswers(prev => ({ ...prev, [subpartId]: null }));
    setShowExplanation(prev => ({ ...prev, [subpartId]: false }));
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Subtest Resmi Masuk Labschool</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  5 Subtest Teruji
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Struktur materi, pembobotan, dan kisi-kisi subtest seleksi PSB SMP & SMA Labschool 2027.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Total Ujian:</span>
          <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            130 Soal • 130 Menit
          </span>
        </div>
      </div>

      {/* 5 SUBTEST SELECTOR TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {LABSCHOOL_SUBTESTS.map((subtest) => {
          const isSelected = subtest.code === selectedSubtestCode;
          return (
            <button
              key={subtest.id}
              type="button"
              onClick={() => {
                setSelectedSubtestCode(subtest.code);
                setSelectedSubpartIndex(0);
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-slate-800/90 ${subtest.color.border} shadow-lg ring-1 ring-cyan-500/40`
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${subtest.color.badge}`}>
                  {subtest.code}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {subtest.weightPercentage}%
                </span>
              </div>

              <div className="mt-2">
                <span className={`text-xs font-bold block leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {subtest.title}
                </span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {subtest.subparts.length} Sub-bagian
                </span>
              </div>

              {isSelected && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${subtest.color.gradient}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE SUBTEST DETAIL CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
        
        {/* Top Info Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black font-mono px-2.5 py-0.5 rounded-lg ${currentSubtest.color.badge}`}>
                {currentSubtest.code}
              </span>
              <h4 className="text-base font-black text-white">{currentSubtest.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {currentSubtest.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Bobot Nilai</span>
              <span className="text-sm font-mono font-black text-amber-300">{currentSubtest.weightPercentage}%</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Alokasi Waktu</span>
              <span className="text-sm font-mono font-black text-cyan-300">{currentSubtest.totalDurationMinutes} Mnt</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Total Soal</span>
              <span className="text-sm font-mono font-black text-emerald-300">{currentSubtest.totalQuestions} Soal</span>
            </div>
          </div>
        </div>

        {/* SUB-BAGIAN TEST TABS (E.g. Verbal Indo & Verbal Eng) */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Sub-bagian Ujian {currentSubtest.title}:
          </label>
          
          <div className="flex flex-wrap gap-2">
            {currentSubtest.subparts.map((sp, idx) => {
              const isSpActive = idx === selectedSubpartIndex;
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelectedSubpartIndex(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isSpActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-bold">
                    {sp.code}
                  </span>
                  <span>{sp.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({sp.questionCount} Soal)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE SUBPART TOPICS & SAMPLE QUESTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Kisi-kisi & Cakupan Topik (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black">
              <BookOpen className="w-4 h-4" />
              <span>Cakupan Materi & Kisi-kisi {currentSubpart.name}</span>
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              {currentSubpart.description}
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Topik Utama yang Sering Keluar:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {currentSubpart.topics.map((top, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{top}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exam Tips Box */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Tips Taktis Pengerjaan:</span>
              </div>
              <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                {currentSubtest.examTips.map((tip, tipIdx) => (
                  <li key={tipIdx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Contoh Soal Diagnostik Interaktif (7 cols) */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
                <Sparkles className="w-4 h-4" />
                <span>Simulasi Diagnostik: Contoh Soal {currentSubpart.name}</span>
              </div>
              {userAnswers[currentSubpart.id] !== undefined && userAnswers[currentSubpart.id] !== null && (
                <button
                  type="button"
                  onClick={() => handleResetQuiz(currentSubpart.id)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ulangi Soal</span>
                </button>
              )}
            </div>

            {currentSubpart.sampleQuestion ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {currentSubpart.sampleQuestion.question}
                </p>

                {/* Options List */}
                <div className="space-y-2">
                  {currentSubpart.sampleQuestion.options.map((opt, oIdx) => {
                    const isSelected = userAnswers[currentSubpart.id] === oIdx;
                    const isCorrect = currentSubpart.sampleQuestion!.correctAnswer === oIdx;
                    const isAnswered = userAnswers[currentSubpart.id] !== undefined && userAnswers[currentSubpart.id] !== null;

                    let btnClass = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200 line-through';
                      } else {
                        btnClass = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentSubpart.id, oIdx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${btnClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isAnswered && isCorrect && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <X className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {showExplanation[currentSubpart.id] && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1 animate-in fade-in">
                    <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider block">
                      Kunci Jawaban & Pembahasan:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentSubpart.sampleQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Contoh soal belum tersedia.</p>
            )}

            {/* Start Subtest Exam Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-400">Siap melatih subtest ini di CBT?</span>
              <button
                type="button"
                onClick={() => {
                  if (onStartExam) onStartExam(currentSubtest.code);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Mulai Tryout Subtest {currentSubtest.code}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
