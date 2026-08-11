import React, { useState, useEffect, useMemo } from 'react';
import {
  SnbtLearningJournalEntry,
  SnbtLearningActivityType,
  SnbtComprehensionLevel,
  SnbtAttendanceStatus,
  SnbtHomeworkStatus,
  SNBT_ACTIVITY_TYPE_METAS,
  SNBT_COMPREHENSION_METAS
} from './snbtJournalData';
import {
  SnbtSubtestCode,
  SnbtSubtestCategory,
  SnbtModuleDifficulty,
  SnbtSyllabusModule,
  INITIAL_SNBT_SYLLABUS_MODULES,
  SNBT_7_SUBTEST_METAS
} from './snbtSyllabusData';
import { SnbtStudentProfile } from './snbtData';
import {
  X,
  Save,
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Award,
  Link2,
  FileText,
  Target,
  Flame,
  CheckSquare,
  Activity,
  Layers
} from 'lucide-react';

interface SnbtJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (journal: SnbtLearningJournalEntry) => void;
  initialData?: SnbtLearningJournalEntry | null;
  students: SnbtStudentProfile[];
  selectedStudentId?: string;
  defaultModuleId?: string;
  defaultSubtestCode?: SnbtSubtestCode;
}

export const SnbtJournalModal: React.FC<SnbtJournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  students,
  selectedStudentId,
  defaultModuleId,
  defaultSubtestCode
}) => {
  // Student Selection
  const [studentId, setStudentId] = useState<string>(() => {
    if (initialData) return initialData.studentId;
    return selectedStudentId || students[0]?.id || 'snbt-std-01';
  });

  // Date & Time
  const [date, setDate] = useState<string>(() => {
    if (initialData) return initialData.date;
    return new Date().toISOString().slice(0, 10);
  });
  const [meetingNumber, setMeetingNumber] = useState<number>(() => {
    if (initialData) return initialData.meetingNumber;
    return 12;
  });
  const [timeStart, setTimeStart] = useState<string>(() => initialData?.timeStart || '15:30');
  const [timeEnd, setTimeEnd] = useState<string>(() => initialData?.timeEnd || '17:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(() => initialData?.durationMinutes || 90);

  // Subtest & Module Selection
  const [subtestCode, setSubtestCode] = useState<SnbtSubtestCode>(() => {
    if (initialData) return initialData.subtestCode;
    if (defaultSubtestCode) return defaultSubtestCode;
    return 'PK';
  });

  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    if (initialData?.moduleId) return initialData.moduleId;
    if (defaultModuleId) return defaultModuleId;
    const firstMod = INITIAL_SNBT_SYLLABUS_MODULES.find(m => m.subtestCode === (defaultSubtestCode || 'PK'));
    return firstMod ? firstMod.id : 'mod-pk-01';
  });

  // Module Details state
  const [moduleCode, setModuleCode] = useState<string>(() => initialData?.moduleCode || 'MOD-PK-01');
  const [moduleTitle, setModuleTitle] = useState<string>(
    () => initialData?.moduleTitle || 'Aljabar Lanjutan, Matriks, Fungsi Invers & Polinomial'
  );
  const [moduleDifficulty, setModuleDifficulty] = useState<SnbtModuleDifficulty>(
    () => initialData?.moduleDifficulty || 'DASAR'
  );
  const [subtopicsText, setSubtopicsText] = useState<string>(() => {
    if (initialData?.subtopicsCovered) return initialData.subtopicsCovered.join('\n');
    return 'Operasi Aljabar Pecahan & Nilai Mutlak\nInvers & Komposisi Fungsi f(g(x))\nOperasi Determinan & Invers Matriks 2x2';
  });

  // Activity & Instruction
  const [learningActivityType, setLearningActivityType] = useState<SnbtLearningActivityType>(
    () => initialData?.learningActivityType || 'DRILL_SOAL'
  );
  const [instructorName, setInstructorName] = useState<string>(
    () => initialData?.instructorName || 'Dr. Hendra Wijaya, M.Pd.'
  );
  const [attendanceStatus, setAttendanceStatus] = useState<SnbtAttendanceStatus>(
    () => initialData?.attendanceStatus || 'HADIR'
  );

  // Comprehension & Practice Accuracy
  const [comprehensionLevel, setComprehensionLevel] = useState<SnbtComprehensionLevel>(
    () => initialData?.comprehensionLevel || 'SANGAT_PAHAM'
  );
  const [comprehensionPercentage, setComprehensionPercentage] = useState<number>(
    () => initialData?.comprehensionPercentage || 92
  );
  const [practiceQuestionsCount, setPracticeQuestionsCount] = useState<number>(
    () => initialData?.practiceQuestionsCount || 20
  );
  const [practiceQuestionsCorrect, setPracticeQuestionsCorrect] = useState<number>(
    () => initialData?.practiceQuestionsCorrect || 18
  );
  const [homeworkStatus, setHomeworkStatus] = useState<SnbtHomeworkStatus>(
    () => initialData?.homeworkStatus || 'SEMPURNA'
  );

  // Reflection Notes & Feedback
  const [studentReflectionNotes, setStudentReflectionNotes] = useState<string>(
    () =>
      initialData?.studentReflectionNotes ||
      'Memahami alur eliminasi opsi jawaban dan konsep dasar dengan baik. Mampu menyelesaikan drill tanpa kendala berarti.'
  );
  const [tutorFeedback, setTutorFeedback] = useState<string>(
    () =>
      initialData?.tutorFeedback ||
      'Siswa menunjukkan konsistensi yang sangat baik. Teruskan latihan mandiri 15 menit per hari.'
  );
  const [targetIrtImpact, setTargetIrtImpact] = useState<string>(
    () => initialData?.targetIrtImpact || '+20 Poin Proyeksi IRT'
  );
  const [linkedMaterialTitle, setLinkedMaterialTitle] = useState<string>(
    () => initialData?.linkedMaterialTitle || 'Modul Pengetahuan Kuantitatif & Pembahasan Soal HOTS'
  );
  const [linkedMaterialUrl, setLinkedMaterialUrl] = useState<string>(
    () => initialData?.linkedMaterialUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  );
  const [isVerified, setIsVerified] = useState<boolean>(() => initialData?.isVerified ?? true);

  // Available modules for current subtest
  const availableModulesForSubtest = useMemo(() => {
    return INITIAL_SNBT_SYLLABUS_MODULES.filter(m => m.subtestCode === subtestCode);
  }, [subtestCode]);

  // Selected student object
  const currentStudentObj = useMemo(() => {
    return students.find(s => s.id === studentId) || students[0];
  }, [students, studentId]);

  // Auto-fill when subtest changes
  const handleSubtestChange = (newSub: SnbtSubtestCode) => {
    setSubtestCode(newSub);
    const mods = INITIAL_SNBT_SYLLABUS_MODULES.filter(m => m.subtestCode === newSub);
    if (mods.length > 0) {
      applyModuleTemplate(mods[0]);
    }
  };

  // Auto-fill module template details
  const applyModuleTemplate = (mod: SnbtSyllabusModule) => {
    setSelectedModuleId(mod.id);
    setModuleCode(mod.code);
    setModuleTitle(mod.title);
    setModuleDifficulty(mod.difficulty);
    setSubtopicsText(mod.subtopics.join('\n'));
    setInstructorName(mod.teacherInCharge);
    setLinkedMaterialTitle(mod.linkedMaterialTitle || `Modul Silabus ${mod.code} - ${mod.title}`);
    setLinkedMaterialUrl(mod.linkedMaterialUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setTargetIrtImpact(`+${Math.round(mod.targetScoreIrt * 0.03)} Poin Proyeksi IRT ${mod.subtestCode}`);
  };

  // Handle module dropdown change
  const handleModuleSelect = (modId: string) => {
    const found = INITIAL_SNBT_SYLLABUS_MODULES.find(m => m.id === modId);
    if (found) {
      applyModuleTemplate(found);
    }
  };

  // Sync Comprehension Level based on slider
  const handleComprehensionPercentChange = (val: number) => {
    setComprehensionPercentage(val);
    if (val >= 90) setComprehensionLevel('SANGAT_PAHAM');
    else if (val >= 75) setComprehensionLevel('PAHAM');
    else if (val >= 60) setComprehensionLevel('CUKUP');
    else setComprehensionLevel('BUTUH_REMEDIAL');
  };

  // Auto calculate accuracy
  const computedAccuracy = useMemo(() => {
    if (practiceQuestionsCount <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((practiceQuestionsCorrect / practiceQuestionsCount) * 100)));
  }, [practiceQuestionsCount, practiceQuestionsCorrect]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const subMeta = SNBT_7_SUBTEST_METAS.find(s => s.code === subtestCode);
    const subtopics = subtopicsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newJournal: SnbtLearningJournalEntry = {
      id: initialData?.id || `jrn-snbt-${Date.now()}`,
      studentId: currentStudentObj.id,
      studentName: currentStudentObj.name,
      nis: currentStudentObj.nis,
      date,
      meetingNumber: Number(meetingNumber),
      timeStart,
      timeEnd,
      durationMinutes: Number(durationMinutes),
      subtestCode,
      subtestName: subMeta?.name || 'Pengetahuan Kuantitatif',
      category: subMeta?.category || 'TPS',
      syllabusCode: moduleCode || 'SIL-SNBT-2026',
      syllabusTitle: moduleTitle,
      moduleId: selectedModuleId,
      moduleCode,
      moduleTitle,
      moduleDifficulty,
      subtopicsCovered: subtopics.length > 0 ? subtopics : ['Pembahasan Soal & Pemantapan Konsep'],
      learningActivityType,
      instructorName,
      attendanceStatus,
      comprehensionLevel,
      comprehensionPercentage: Number(comprehensionPercentage),
      practiceQuestionsCount: Number(practiceQuestionsCount),
      practiceQuestionsCorrect: Number(practiceQuestionsCorrect),
      practiceAccuracy: computedAccuracy,
      homeworkStatus,
      studentReflectionNotes,
      tutorFeedback,
      targetIrtImpact,
      linkedMaterialTitle,
      linkedMaterialUrl,
      isVerified,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newJournal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {initialData ? 'EDIT JURNAL' : 'JURNAL BARU'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Integrasi Kurikulum 7 Subtes & 28 Modul SNBT
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {initialData ? 'Edit Jurnal Belajar Siswa SNBT' : 'Tulis Jurnal Belajar & Progres Silabus SNBT'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Profil Siswa & Waktu Sesi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Data Siswa & Waktu Belajar
              </span>
              <span className="text-[11px] text-slate-500 font-mono">ID: {currentStudentObj.nis}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Student Select */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Pilih Siswa</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (NIS: {s.nis}) - Target: {s.targetPtn1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" /> Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Meeting Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Pertemuan Ke-
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={meetingNumber}
                  onChange={e => setMeetingNumber(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Time Range */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" /> Jam Mulai
                </label>
                <input
                  type="time"
                  value={timeStart}
                  onChange={e => setTimeStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" /> Jam Selesai
                </label>
                <input
                  type="time"
                  value={timeEnd}
                  onChange={e => setTimeEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Duration Minutes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Durasi (Menit)</label>
                <input
                  type="number"
                  min="15"
                  step="5"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Attendance */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Status Kehadiran</label>
                <select
                  value={attendanceStatus}
                  onChange={e => setAttendanceStatus(e.target.value as SnbtAttendanceStatus)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="HADIR">✅ Hadir Tepat Waktu</option>
                  <option value="TERLAMBAT">⚠️ Terlambat</option>
                  <option value="IZIN">ℹ️ Izin</option>
                  <option value="SAKIT">🏥 Sakit</option>
                  <option value="MANDIRI">💻 Mandiri Online</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Integrasi Silabus & Modul SNBT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> 2. Integrasi Silabus & Modul SNBT
              </span>
              <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Pilih Modul untuk Auto-Fill Blueprint
              </span>
            </div>

            {/* 7 Subtests Selector Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Pilih 7 Subtes Resmi SNPMB:</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {SNBT_7_SUBTEST_METAS.map(s => {
                  const isSelected = s.code === subtestCode;
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => handleSubtestChange(s.code)}
                      className={`p-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? `bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/40`
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="block font-mono text-xs">{s.code}</span>
                      <span className="text-[9px] font-normal text-slate-300 truncate block mt-0.5">
                        {s.code === 'PU' ? 'Penalaran' : s.code === 'PK' ? 'Kuantitatif' : s.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Module Picker Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Pilih Modul Silabus Terdaftar ({subtestCode})
                </label>
                <select
                  value={selectedModuleId}
                  onChange={e => handleModuleSelect(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {availableModulesForSubtest.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.title} ({m.difficulty} - Pekan {m.weekNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Module Code & Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Kode Modul</label>
                <input
                  type="text"
                  value={moduleCode}
                  onChange={e => setModuleCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Tingkat Kesulitan</label>
                <select
                  value={moduleDifficulty}
                  onChange={e => setModuleDifficulty(e.target.value as SnbtModuleDifficulty)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="DASAR">🟢 DASAR (Fundamental)</option>
                  <option value="MENENGAH">🟡 MENENGAH (Intermediate)</option>
                  <option value="HOTS">🔴 HOTS (High Order Thinking)</option>
                </select>
              </div>

              {/* Full Title */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-300">Judul Pokok Bahasan / Modul</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={e => setModuleTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Subtopics */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-300">Subtopik / Cakupan Materi (1 baris per subtopik):</label>
                <textarea
                  rows={3}
                  value={subtopicsText}
                  onChange={e => setSubtopicsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Aktivitas, Pengajar & Evaluasi Pemahaman */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> 3. Aktivitas Belajar, Tutor & Hasil Pemahaman
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Activity Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Jenis Aktivitas</label>
                <select
                  value={learningActivityType}
                  onChange={e => setLearningActivityType(e.target.value as SnbtLearningActivityType)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="PEMBAHASAN_MODUL">📖 Pembahasan Modul Teori</option>
                  <option value="DRILL_SOAL">⚡ Drill Soal HOTS Berwaktu</option>
                  <option value="KONSULTASI_GURU">👥 Sesi Konsultasi Privat</option>
                  <option value="BELAJAR_MANDIRI">💻 Belajar Mandiri Terpandu</option>
                  <option value="SIMULASI_CBT">🎯 Simulasi CBT Subtes</option>
                  <option value="REMEDIAL_IRT">🔥 Remedial Penguatan IRT</option>
                </select>
              </div>

              {/* Instructor */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Guru Pengampu / Tutor</label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={e => setInstructorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Homework Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Status PR / Latihan Mandiri</label>
                <select
                  value={homeworkStatus}
                  onChange={e => setHomeworkStatus(e.target.value as SnbtHomeworkStatus)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="SEMPURNA">🌟 Sempurna (100% Selesai & Benar)</option>
                  <option value="SELESAI">✅ Selesai Dikerjakan</option>
                  <option value="SEBAGIAN">⚠️ Dikerjakan Sebagian</option>
                  <option value="BELUM">❌ Belum Dikerjakan</option>
                </select>
              </div>
            </div>

            {/* Comprehension Slider & Metrics */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Tingkat Penguasaan Materi:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="text-emerald-400">{SNBT_COMPREHENSION_METAS[comprehensionLevel].label}</strong>
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-indigo-400">
                  {comprehensionPercentage}%
                </span>
              </div>

              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={comprehensionPercentage}
                onChange={e => handleComprehensionPercentChange(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Practice Questions Count */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Jumlah Soal Drill</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={practiceQuestionsCount}
                    onChange={e => setPracticeQuestionsCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                {/* Correct Count */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Jawaban Benar</label>
                  <input
                    type="number"
                    min="0"
                    max={practiceQuestionsCount}
                    value={practiceQuestionsCorrect}
                    onChange={e => setPracticeQuestionsCorrect(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>

                {/* Accuracy */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Akurasi Soal</label>
                  <div className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-black text-amber-400">
                    {computedAccuracy}% Akurat
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Refleksi & Rekomendasi Guru */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 4. Catatan Refleksi & Evaluasi Guru
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Catatan Refleksi Siswa (Kendala & Pencapaian)</label>
                <textarea
                  rows={3}
                  value={studentReflectionNotes}
                  onChange={e => setStudentReflectionNotes(e.target.value)}
                  placeholder="Contoh: Sudah paham kaidah silogisme modus ponens, masih butuh latihan kecepatan..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Rekomendasi & Tindak Lanjut Guru</label>
                <textarea
                  rows={3}
                  value={tutorFeedback}
                  onChange={e => setTutorFeedback(e.target.value)}
                  placeholder="Contoh: Pertahankan akurasi, berikan drill 20 soal HOTS kecukupan data..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Dampak Target Skor IRT</label>
                <input
                  type="text"
                  value={targetIrtImpact}
                  onChange={e => setTargetIrtImpact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={e => setIsVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span>Telah Diverifikasi & Divalidasi Guru Pengampu</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Jurnal Belajar SNBT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
