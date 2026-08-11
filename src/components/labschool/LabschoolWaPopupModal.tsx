import React, { useState, useMemo } from 'react';
import {
  LearningJournalMeeting,
  WaSenderRole,
  WaReceiverRole,
  generateWaMessage
} from './labschoolLaporanData';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Phone,
  User,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Share2,
  FileText
} from 'lucide-react';

interface LabschoolWaPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: LearningJournalMeeting | null;
  studentName?: string;
  studentNis?: string;
  studentClass?: string;
  targetCampus?: string;
  latestTryoutScore?: number;
  latestQuizScore?: number;
  onUpdateMeetingProgress?: (meetingId: string, progress: 'BELUM' | 'SEDANG' | 'SUDAH') => void;
}

export const LabschoolWaPopupModal: React.FC<LabschoolWaPopupModalProps> = ({
  isOpen,
  onClose,
  meeting,
  studentName = 'Bintang Pratama',
  studentNis = 'LAB-2026-089',
  studentClass = 'Kelas 9 SMP (Persiapan SMA Labschool)',
  targetCampus = 'SMA Labschool Kebayoran',
  latestTryoutScore = 88.5,
  latestQuizScore = 92.0,
  onUpdateMeetingProgress
}) => {
  const [activeTab, setActiveTab] = useState<'GURU_KE_WALI' | 'GURU_KE_SISWA' | 'SISWA_KE_GURU' | 'WALI_KE_GURU'>('GURU_KE_WALI');
  const [customPhone, setCustomPhone] = useState<string>('081234567890');
  const [customNote, setCustomNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingProgress, setIsEditingProgress] = useState<boolean>(false);

  if (!isOpen || !meeting) return null;

  // Determine Sender and Receiver role for template generator
  const roleConfig = useMemo(() => {
    switch (activeTab) {
      case 'GURU_KE_WALI':
        return {
          senderRole: 'GURU' as WaSenderRole,
          receiverRole: 'WALI_MURID' as WaReceiverRole,
          title: '👨‍🏫 Laporan Guru ke Orang Tua (Wali Murid)',
          desc: 'Format pesan resmi laporan kemajuan belajar siswa setelah pertemuan selesai.'
        };
      case 'GURU_KE_SISWA':
        return {
          senderRole: 'GURU' as WaSenderRole,
          receiverRole: 'SISWA' as WaReceiverRole,
          title: '👨‍🏫 Evaluasi Guru ke Siswa',
          desc: 'Format pesan evaluasi, pengingat PR, dan motivasi langsung kepada siswa.'
        };
      case 'SISWA_KE_GURU':
        return {
          senderRole: 'SISWA' as WaSenderRole,
          receiverRole: 'GURU' as WaReceiverRole,
          title: '🧑‍🎓 Konsultasi Siswa ke Guru',
          desc: 'Format pesan pertanyaan dan permintaan bimbingan materi yang belum dipahami.'
        };
      case 'WALI_KE_GURU':
        return {
          senderRole: 'WALI_MURID' as WaSenderRole,
          receiverRole: 'GURU' as WaReceiverRole,
          title: '👨‍👩‍👧 Konsultasi Wali Murid ke Guru',
          desc: 'Format pertanyaan orang tua seputar kesiapan ananda menuju seleksi Labschool.'
        };
    }
  }, [activeTab]);

  // Generate Message Text
  const generatedMessage = useMemo(() => {
    let base = generateWaMessage({
      senderRole: roleConfig.senderRole,
      receiverRole: roleConfig.receiverRole,
      studentName,
      studentNis,
      studentClass,
      targetCampus: meeting.targetCampus || targetCampus,
      meeting,
      latestTryoutScore,
      latestQuizScore,
      customNote: customNote.trim() ? customNote.trim() : undefined
    });

    return base;
  }, [roleConfig, studentName, studentNis, studentClass, targetCampus, meeting, latestTryoutScore, latestQuizScore, customNote]);

  // Clean phone number for WhatsApp link
  const cleanPhone = useMemo(() => {
    let p = customPhone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) {
      p = '62' + p.substring(1);
    } else if (p.startsWith('8')) {
      p = '62' + p;
    }
    return p;
  }, [customPhone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(generatedMessage);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleProgressChange = (newProgress: 'BELUM' | 'SEDANG' | 'SUDAH') => {
    if (onUpdateMeetingProgress) {
      onUpdateMeetingProgress(meeting.id, newProgress);
    }
    setIsEditingProgress(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 my-6 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/10">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Format Laporan WhatsApp
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Sesi #{meeting.meetingNumber} ({meeting.subtestCode})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Template otomatis siap kirim untuk Orang Tua, Siswa, dan Guru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Overview Info Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Topik Materi:</span>
            <p className="font-bold text-white line-clamp-1 mt-0.5">{meeting.topicTitle}</p>
            <p className="text-[11px] text-indigo-400 mt-0.5 font-medium">{meeting.subjectName}</p>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">Jadwal & Guru:</span>
            <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {meeting.date}
            </p>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {meeting.timeRange} • {meeting.instructorName}
            </p>
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] block">Status Progres & Pemahaman:</span>
            <div className="flex items-center gap-2 mt-1">
              {/* Progress Badge */}
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                meeting.progress === 'SUDAH'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : meeting.progress === 'SEDANG'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {meeting.progress === 'SUDAH' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Sudah Selesai
                  </>
                ) : meeting.progress === 'SEDANG' ? (
                  <>
                    <Clock className="w-3 h-3 text-blue-400" /> Sedang Berjalan
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Belum Dimulai
                  </>
                )}
              </span>

              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                ⭐ {meeting.comprehensionRating}/5 ({meeting.comprehensionPercentage}%)
              </span>
            </div>

            {meeting.driveLink && (
              <a
                href={meeting.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 truncate"
                title={meeting.driveLinkTitle || 'Link Google Drive Modul Materi'}
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">Google Drive: {meeting.driveLinkTitle || 'Modul Materi'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Pilih Template Komunikasi:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('GURU_KE_WALI')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 ${
                activeTab === 'GURU_KE_WALI'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <span>👨‍🏫 Guru → Wali Murid</span>
              <span className="text-[10px] font-normal text-slate-400">Laporan Resmi Sesi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('GURU_KE_SISWA')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 ${
                activeTab === 'GURU_KE_SISWA'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <span>👨‍🏫 Guru → Siswa</span>
              <span className="text-[10px] font-normal text-slate-400">Evaluasi & Motivasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SISWA_KE_GURU')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 ${
                activeTab === 'SISWA_KE_GURU'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <span>🧑‍🎓 Siswa → Guru</span>
              <span className="text-[10px] font-normal text-slate-400">Tanya & Konsultasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('WALI_KE_GURU')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-0.5 ${
                activeTab === 'WALI_KE_GURU'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <span>👨‍👩‍👧 Wali → Guru</span>
              <span className="text-[10px] font-normal text-slate-400">Kesiapan Seleksi</span>
            </button>
          </div>
        </div>

        {/* Inputs: Phone Number & Custom Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nomor WhatsApp Tujuan:</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 081234567890 / 6281234567890"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Catatan Tambahan (Opsional):
            </label>
            <input
              type="text"
              placeholder="e.g. Mohon ananda memperbanyak istirahat jelang tryout besok..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* WhatsApp Chat Preview Bubble */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pratinjau Pesan WhatsApp (Live Preview):</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {generatedMessage.length} karakter
            </span>
          </div>

          <div className="bg-[#0b141a] rounded-2xl p-4 sm:p-5 border border-[#202c33] shadow-inner max-h-72 overflow-y-auto font-sans text-xs sm:text-[13px] leading-relaxed">
            <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm p-4 max-w-xl ml-auto shadow-md whitespace-pre-wrap font-sans selection:bg-emerald-800">
              {generatedMessage}
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] mt-2 font-mono">
                <span>{meeting.timeRange.split('-')[0] || '16:00'}</span>
                <span className="text-[#53bdeb]">✓✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs w-full sm:w-auto">
            <span>Penerima:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded-lg">
              {roleConfig.receiverRole.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Pesan WA</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
