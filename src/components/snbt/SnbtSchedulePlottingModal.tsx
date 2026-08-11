import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';

interface SnbtSchedulePlottingModalProps {
  onClose: () => void;
  onSaveSchedule?: (schedule: SnbtUserSchedulePlan) => void;
}

export interface SnbtUserSchedulePlan {
  dailyTargetHours: number;
  weeklyTargetModules: number;
  targetOverallIrt: number;
  studyDays: string[];
  primaryFocusSubtest: string;
  notes: string;
}

const DEFAULT_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const SnbtSchedulePlottingModal: React.FC<SnbtSchedulePlottingModalProps> = ({
  onClose,
  onSaveSchedule
}) => {
  const [dailyHours, setDailyHours] = useState(2.5);
  const [weeklyModules, setWeeklyModules] = useState(3);
  const [targetIrt, setTargetIrt] = useState(760);
  const [selectedDays, setSelectedDays] = useState<string[]>(DEFAULT_DAYS);
  const [primaryFocus, setPrimaryFocus] = useState('PK');
  const [notes, setNotes] = useState('Fokus drill soal aljabar kuantitatif dan penalaran induktif setiap malam.');

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    const plan: SnbtUserSchedulePlan = {
      dailyTargetHours: dailyHours,
      weeklyTargetModules: weeklyModules,
      targetOverallIrt: targetIrt,
      studyDays: selectedDays,
      primaryFocusSubtest: primaryFocus,
      notes
    };
    if (onSaveSchedule) {
      onSaveSchedule(plan);
    }
    localStorage.setItem('bsa_snbt_user_study_plan', JSON.stringify(plan));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-600 text-white shadow-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Ploting Jadwal & Target Belajar SNBT
              </h2>
              <p className="text-xs text-slate-400">
                Atur ritme belajar mingguan dan target skor IRT personal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Target Jam & Modul */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Target Belajar / Hari
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={dailyHours}
                  onChange={e => setDailyHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-medium">Jam</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Target Modul / Pekan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={weeklyModules}
                  onChange={e => setWeeklyModules(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-medium">Modul</span>
              </div>
            </div>
          </div>

          {/* Target Skor IRT & Subtes Prioritas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-rose-400" />
                Target Rata-Rata IRT
              </label>
              <input
                type="number"
                min={500}
                max={900}
                step={10}
                value={targetIrt}
                onChange={e => setTargetIrt(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-extrabold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Subtes Prioritas Drill
              </label>
              <select
                value={primaryFocus}
                onChange={e => setPrimaryFocus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
              >
                <option value="PU">Penalaran Umum (PU)</option>
                <option value="PPU">Pengetahuan & Pemahaman Umum (PPU)</option>
                <option value="PBM">Pemahaman Bacaan & Menulis (PBM)</option>
                <option value="PK">Pengetahuan Kuantitatif (PK)</option>
                <option value="LBI">Literasi Bhs Indonesia (LBI)</option>
                <option value="LBE">Literasi Bhs Inggris (LBE)</option>
                <option value="PM">Penalaran Matematika (PM)</option>
              </select>
            </div>
          </div>

          {/* Hari Belajar Aktif */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilihan Hari Belajar Mingguan
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan Komitmen */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Komitmen & Strategi Pribadi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-indigo-500 focus:outline-none"
              placeholder="Tuliskan afirmasi atau fokus belajar..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Target Ploting</span>
          </button>
        </div>
      </div>
    </div>
  );
};
