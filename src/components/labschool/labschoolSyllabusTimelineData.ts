import { getSyllabi } from '../../utils/storage';
import { SyllabusItem, SyllabusTopic } from '../../types';

export type TopicProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface SyllabusTimelineTopic {
  id: string;
  subtestCode: string; // 'PK', 'KV', 'PM', 'IPA', 'IPS', 'SV', 'ALL'
  subtestName: string;
  topicNumber: number; // 1, 2, 3, ...
  meetingNumber: number;
  stageName: string; // e.g. "Bulan 1 - Dasar", "Bulan 2 - Konsep Inti", etc.
  title: string;
  description: string;
  competency: string;
  subtopics: string[];
  durationMinutes: number;
  teachingMethod: string;
  referenceNotes?: string;
  linkedMaterialId?: string;
  linkedMaterialTitle?: string;
  driveLink?: string;
  driveLinkTitle?: string;
  iconType: 'book' | 'gear' | 'computer' | 'checklist' | 'puzzle' | 'analytics' | 'certificate' | 'sparkle';
  colorTheme: {
    name: string;
    ringGradient: string; // Tailwind gradient for circular ring
    glowColor: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    cardBg: string;
    accentText: string;
    arrowColor: string;
  };
}

export interface SubtestOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
  level: 'SMP' | 'SMA';
  iconName: string;
  description: string;
  totalTopics: number;
  estimatedHours: number;
  weightPercentage: number;
  themeColor: string;
  badgeClass: string;
}

// Subtest Filter options for SMP and SMA
export const LABSCHOOL_SUBTEST_OPTIONS: SubtestOption[] = [
  // SMP SUBTESTS
  {
    id: 'smp-all',
    code: 'ALL',
    name: 'Semua Subtest Terpadu (Silabus Lengkap)',
    shortName: 'Semua Subtest',
    level: 'SMP',
    iconName: 'Sparkles',
    description: 'Kurikulum akselerasi komprehensif 5 Subtest seleksi masuk SMP Labschool 2027.',
    totalTopics: 18,
    estimatedHours: 27,
    weightPercentage: 100,
    themeColor: 'from-blue-600 to-indigo-600',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'smp-pk',
    code: 'PK',
    name: 'Pengetahuan Kuantitatif (PK)',
    shortName: 'PK Kuantitatif',
    level: 'SMP',
    iconName: 'Calculator',
    description: 'Aritmatika campuran, pecahan, desimal kilat, perbandingan, dan pola barisan bilangan.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 25,
    themeColor: 'from-amber-500 to-orange-600',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'smp-kv',
    code: 'KV',
    name: 'Kemampuan Verbal B.Indo & B.Inggris (KV)',
    shortName: 'Verbal (KV)',
    level: 'SMP',
    iconName: 'Languages',
    description: 'Analogi kata, sinonim-antonim baku KBBI, serta English vocabulary in context.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 20,
    themeColor: 'from-sky-500 to-blue-600',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
  },
  {
    id: 'smp-pm',
    code: 'PM',
    name: 'Pemahaman Membaca B.Indo & B.Inggris (PM)',
    shortName: 'Membaca (PM)',
    level: 'SMP',
    iconName: 'BookOpen',
    description: 'Ide pokok, analisis paragraf kritis, inferensi wacana, dan English reading comprehension.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 20,
    themeColor: 'from-indigo-500 to-violet-600',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'smp-ipa',
    code: 'AKA-IPA',
    name: 'Kemampuan Akademik IPA (AKA-IPA)',
    shortName: 'Akademik IPA',
    level: 'SMP',
    iconName: 'Atom',
    description: 'Mekanika gerak dasar, kalor, energi terbarukan, dan ekosistem biologi lingkungan.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 15,
    themeColor: 'from-emerald-500 to-teal-600',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'smp-ips',
    code: 'AKA-IPS',
    name: 'Kemampuan Akademik IPS (AKA-IPS)',
    shortName: 'Akademik IPS',
    level: 'SMP',
    iconName: 'Globe2',
    description: 'Peta geografi Indonesia, iklim tropis, kegiatan ekonomi pasar, dan dinamika sosial budaya.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 10,
    themeColor: 'from-orange-500 to-rose-600',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  {
    id: 'smp-sv',
    code: 'SV',
    name: 'Survei Karakter & Profil Pelajar (SV)',
    shortName: 'Survei Karakter',
    level: 'SMP',
    iconName: 'ShieldCheck',
    description: 'Integritas kejujuran akademik, anti-perundungan, empati sosial, dan kemandirian.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 10,
    themeColor: 'from-rose-500 to-pink-600',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },

  // SMA SUBTESTS
  {
    id: 'sma-all',
    code: 'ALL',
    name: 'Semua Subtest Terpadu (Silabus Lengkap SMA)',
    shortName: 'Semua Subtest',
    level: 'SMA',
    iconName: 'Sparkles',
    description: 'Kurikulum intensif 5 Subtest seleksi masuk SMA Labschool 4 Kampus 2027.',
    totalTopics: 18,
    estimatedHours: 27,
    weightPercentage: 100,
    themeColor: 'from-cyan-600 to-blue-700',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'sma-pk',
    code: 'PK',
    name: 'Pengetahuan Kuantitatif Lanjut (PK)',
    shortName: 'PK Kuantitatif',
    level: 'SMA',
    iconName: 'Calculator',
    description: 'Aljabar lanjut faktorisasi, geometri analitik kesebangunan & dimensi tiga, dan kombinatorika peluang.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 25,
    themeColor: 'from-amber-500 to-orange-600',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'sma-kv',
    code: 'KV',
    name: 'Kemampuan Verbal Dwi-Bahasa (KV)',
    shortName: 'Verbal (KV)',
    level: 'SMA',
    iconName: 'Languages',
    description: 'Analogi semantik kompleks, diksi ilmiah, advanced English vocabulary, dan silogisme proposisi.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 20,
    themeColor: 'from-blue-500 to-indigo-600',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'sma-pm',
    code: 'PM',
    name: 'Pemahaman Membaca Kritis & Sintesis (PM)',
    shortName: 'Membaca (PM)',
    level: 'SMA',
    iconName: 'BookOpen',
    description: 'Analisis kritis teks argumentatif, advanced reading comprehension, dan sintesis multiteks.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 20,
    themeColor: 'from-violet-500 to-purple-600',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
  },
  {
    id: 'sma-ipa',
    code: 'AKA-IPA',
    name: 'Kemampuan Akademik IPA Saintek (AKA-IPA)',
    shortName: 'Akademik IPA',
    level: 'SMA',
    iconName: 'Atom',
    description: 'Fisika mekanika dinamika Newton, kimia stoikiometri atom, dan biologi genetika Mendel.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 15,
    themeColor: 'from-teal-500 to-emerald-600',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
  },
  {
    id: 'sma-ips',
    code: 'AKA-IPS',
    name: 'Kemampuan Akademik IPS Soshum (AKA-IPS)',
    shortName: 'Akademik IPS',
    level: 'SMA',
    iconName: 'Globe2',
    description: 'Ekonomi mekanisme pasar & kebijakan moneter, geografi litosfer SIG, dan sosiologi stratifikasi.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 10,
    themeColor: 'from-amber-600 to-red-600',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'sma-sv',
    code: 'SV',
    name: 'Survei Karakter & Kepemimpinan (SV)',
    shortName: 'Survei Karakter',
    level: 'SMA',
    iconName: 'ShieldCheck',
    description: 'Integritas etika akademik SMA, self-leadership, kecerdasan emosional EQ, dan wawasan kebangsaan.',
    totalTopics: 3,
    estimatedHours: 4.5,
    weightPercentage: 10,
    themeColor: 'from-rose-500 to-pink-600',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  }
];

// Color palette styles corresponding to node sequence (matching reference image)
const NODE_COLOR_PALETTES = [
  {
    name: 'Cyan Blue',
    ringGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    border: 'border-cyan-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-cyan-400',
    arrowColor: 'text-cyan-400'
  },
  {
    name: 'Orange Amber',
    ringGradient: 'from-amber-400 via-orange-500 to-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    border: 'border-amber-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-amber-400',
    arrowColor: 'text-amber-400'
  },
  {
    name: 'Teal Emerald',
    ringGradient: 'from-teal-400 via-emerald-500 to-teal-600',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    badgeBg: 'bg-teal-500/20',
    badgeText: 'text-teal-300',
    border: 'border-teal-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-teal-400',
    arrowColor: 'text-teal-400'
  },
  {
    name: 'Indigo Violet',
    ringGradient: 'from-indigo-400 via-violet-500 to-purple-600',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    border: 'border-indigo-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-indigo-400',
    arrowColor: 'text-indigo-400'
  },
  {
    name: 'Rose Coral',
    ringGradient: 'from-rose-400 via-pink-500 to-rose-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    border: 'border-rose-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-rose-400',
    arrowColor: 'text-rose-400'
  },
  {
    name: 'Blue Sky',
    ringGradient: 'from-blue-400 via-cyan-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    border: 'border-blue-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-blue-400',
    arrowColor: 'text-blue-400'
  },
  {
    name: 'Emerald Green',
    ringGradient: 'from-emerald-400 via-green-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    border: 'border-emerald-500/40',
    cardBg: 'bg-slate-900/90',
    accentText: 'text-emerald-400',
    arrowColor: 'text-emerald-400'
  }
];

// Map node index to icon type matching reference image
const NODE_ICONS: Array<'book' | 'gear' | 'computer' | 'checklist' | 'puzzle' | 'analytics' | 'certificate'> = [
  'book',        // 1. Pengenalan & Dasar-dasar (Buku / Ide)
  'gear',        // 2. Teori & Konsep Inti (Gears / Sistem)
  'computer',    // 3. Praktek Pemula (Komputer / Hands-on)
  'checklist',   // 4. Pengembangan Keterampilan (Tas / Clipboard)
  'puzzle',      // 5. Proyek Kolaborasi & Drill (Puzzle / Tim)
  'analytics',   // 6. Evaluasi & Penyempurnaan (Chart / Analisis)
  'certificate'  // 7. Sertifikasi & Penyelesaian (Topi Wisuda / Sertifikat)
];

// Stage names formatted like reference image
const STAGE_NAMES = [
  'Bulan 1 - Dasar',
  'Bulan 2 - Teori & Konsep Inti',
  'Bulan 3-4 - Praktek & Drill Hands-on',
  'Bulan 5 - Pengembangan Keterampilan',
  'Bulan 6 - Proyek Kolaborasi & Bedah HOTS',
  'Bulan 7 - Evaluasi & Penyempurnaan',
  'Bulan 8 - Finalisasi & Kesiapan Seleksi'
];

/**
 * Builds sequential topics for a specific subtest or for all subtests combined.
 */
export function getTimelineTopicsForSubtest(
  level: 'SMP' | 'SMA',
  subtestId: string
): SyllabusTimelineTopic[] {
  const syllabi = getSyllabi();

  // Subtest order mapping
  const subtestCodes = level === 'SMP'
    ? [
        { code: 'SIL-PK-SMP-LAB', name: 'Pengetahuan Kuantitatif', shortCode: 'PK' },
        { code: 'SIL-KV-SMP-LAB', name: 'Kemampuan Verbal', shortCode: 'KV' },
        { code: 'SIL-PM-SMP-LAB', name: 'Pemahaman Membaca', shortCode: 'PM' },
        { code: 'SIL-SMP-AKA-IPA', name: 'Akademik IPA', shortCode: 'AKA-IPA' },
        { code: 'SIL-SMP-AKA-IPS', name: 'Akademik IPS', shortCode: 'AKA-IPS' },
        { code: 'SIL-SMP-SV', name: 'Survei Karakter', shortCode: 'SV' }
      ]
    : [
        { code: 'SIL-PK-SMA-LAB', name: 'Pengetahuan Kuantitatif Lanjut', shortCode: 'PK' },
        { code: 'SIL-SMA-KV', name: 'Kemampuan Verbal Dwi-Bahasa', shortCode: 'KV' },
        { code: 'SIL-SMA-PM', name: 'Pemahaman Membaca Kritis', shortCode: 'PM' },
        { code: 'SIL-SMA-AKA-IPA', name: 'Akademik IPA Saintek', shortCode: 'AKA-IPA' },
        { code: 'SIL-SMA-AKA-IPS', name: 'Akademik IPS Soshum', shortCode: 'AKA-IPS' },
        { code: 'SIL-SMA-SV', name: 'Survei Karakter & Kepemimpinan', shortCode: 'SV' }
      ];

  // Specific single subtest selection
  if (subtestId !== 'smp-all' && subtestId !== 'sma-all') {
    let targetCode = '';
    if (subtestId === 'smp-pk' || subtestId === 'sma-pk') targetCode = level === 'SMP' ? 'SIL-PK-SMP-LAB' : 'SIL-PK-SMA-LAB';
    else if (subtestId === 'smp-kv' || subtestId === 'sma-kv') targetCode = level === 'SMP' ? 'SIL-KV-SMP-LAB' : 'SIL-SMA-KV';
    else if (subtestId === 'smp-pm' || subtestId === 'sma-pm') targetCode = level === 'SMP' ? 'SIL-PM-SMP-LAB' : 'SIL-SMA-PM';
    else if (subtestId === 'smp-ipa' || subtestId === 'sma-ipa') targetCode = level === 'SMP' ? 'SIL-SMP-AKA-IPA' : 'SIL-SMA-AKA-IPA';
    else if (subtestId === 'smp-ips' || subtestId === 'sma-ips') targetCode = level === 'SMP' ? 'SIL-SMP-AKA-IPS' : 'SIL-SMA-AKA-IPS';
    else if (subtestId === 'smp-sv' || subtestId === 'sma-sv') targetCode = level === 'SMP' ? 'SIL-SMP-SV' : 'SIL-SMA-SV';

    const matchedSyllabus = syllabi.find(s => s.code === targetCode || s.id === targetCode);
    if (matchedSyllabus && matchedSyllabus.topics && matchedSyllabus.topics.length > 0) {
      const subtestMeta = subtestCodes.find(sc => sc.code === targetCode) || {
        shortCode: matchedSyllabus.code.replace('SIL-', '').replace('-LAB', '').replace(`-${level}`, ''),
        name: matchedSyllabus.subject
      };

      const singleSubtestStages = [
        'Bulan 1 - Konsep Dasar & Pemahaman Inti',
        'Bulan 2-3 - Teori Lanjut & Aplikasi Mandiri',
        'Bulan 4-5 - Bedah Soal HOTS & Latihan Terwaktu'
      ];

      return matchedSyllabus.topics.map((t, idx) => {
        const palette = NODE_COLOR_PALETTES[idx % NODE_COLOR_PALETTES.length];
        const iconType = NODE_ICONS[idx % NODE_ICONS.length];
        const stageName = singleSubtestStages[idx] || STAGE_NAMES[idx] || `Tahap ${idx + 1}`;

        return {
          id: t.id,
          subtestCode: subtestMeta.shortCode,
          subtestName: matchedSyllabus.subject || subtestMeta.name,
          topicNumber: idx + 1,
          meetingNumber: t.meetingNumber || idx + 1,
          stageName: stageName,
          title: t.title,
          description: t.subtopics?.join(' • ') || 'Pembahasan materi terstruktur standar Labschool.',
          competency: t.competency || 'Menguasai kompetensi dasar dan pemecahan soal HOTS.',
          subtopics: t.subtopics || [],
          durationMinutes: t.durationMinutes || 90,
          teachingMethod: t.teachingMethod || 'Problem Based Learning & Drill Soal',
          referenceNotes: t.referenceNotes || 'Modul Standar Seleksi Labschool 2027',
          linkedMaterialId: t.linkedMaterialId,
          linkedMaterialTitle: t.linkedMaterialTitle,
          iconType: iconType,
          colorTheme: palette
        };
      });
    }
  }

  // Combine ALL subtests in guaranteed orderly sequence
  const combinedTopics: SyllabusTimelineTopic[] = [];
  let topicCounter = 1;

  subtestCodes.forEach((sc) => {
    const matchedSyllabus = syllabi.find(s => s.code === sc.code);
    if (matchedSyllabus && matchedSyllabus.topics && matchedSyllabus.topics.length > 0) {
      matchedSyllabus.topics.forEach((t) => {
        const palette = NODE_COLOR_PALETTES[(topicCounter - 1) % NODE_COLOR_PALETTES.length];
        const iconType = NODE_ICONS[(topicCounter - 1) % NODE_ICONS.length];
        const stageName = STAGE_NAMES[(topicCounter - 1) % STAGE_NAMES.length] || `Topik ${topicCounter}`;

        combinedTopics.push({
          id: t.id,
          subtestCode: sc.shortCode,
          subtestName: matchedSyllabus.subject || sc.name,
          topicNumber: topicCounter,
          meetingNumber: t.meetingNumber || topicCounter,
          stageName: stageName,
          title: t.title,
          description: t.subtopics?.join(' • ') || 'Pembahasan materi terstruktur standar Labschool.',
          competency: t.competency || 'Menguasai kompetensi dasar dan pemecahan soal HOTS.',
          subtopics: t.subtopics || [],
          durationMinutes: t.durationMinutes || 90,
          teachingMethod: t.teachingMethod || 'Problem Based Learning & Drill Soal',
          referenceNotes: t.referenceNotes || 'Modul Standar Seleksi Labschool 2027',
          linkedMaterialId: t.linkedMaterialId,
          linkedMaterialTitle: t.linkedMaterialTitle,
          iconType: iconType,
          colorTheme: palette
        });

        topicCounter++;
      });
    }
  });

  // If combinedTopics is still empty (e.g. first load fallback), use master syllabus
  if (combinedTopics.length === 0) {
    const masterCode = level === 'SMP' ? 'SIL-LAB-SMP' : 'SIL-LAB-SMA';
    const masterSyllabus = syllabi.find(s => s.code === masterCode);
    if (masterSyllabus && masterSyllabus.topics) {
      return masterSyllabus.topics.map((t, idx) => ({
        id: t.id,
        subtestCode: 'LAB',
        subtestName: masterSyllabus.subject,
        topicNumber: idx + 1,
        meetingNumber: t.meetingNumber || idx + 1,
        stageName: STAGE_NAMES[idx % STAGE_NAMES.length],
        title: t.title,
        description: t.subtopics?.join(' • ') || 'Pembahasan materi terstruktur standar Labschool.',
        competency: t.competency || 'Menguasai kompetensi dasar dan pemecahan soal HOTS.',
        subtopics: t.subtopics || [],
        durationMinutes: t.durationMinutes || 120,
        teachingMethod: t.teachingMethod || 'Problem Based Learning & Drill Soal',
        referenceNotes: t.referenceNotes || 'Modul Standar Seleksi Labschool 2027',
        linkedMaterialId: t.linkedMaterialId,
        linkedMaterialTitle: t.linkedMaterialTitle,
        iconType: NODE_ICONS[idx % NODE_ICONS.length],
        colorTheme: NODE_COLOR_PALETTES[idx % NODE_COLOR_PALETTES.length]
      }));
    }
  }

  return combinedTopics;
}

/**
 * Loads all syllabus timeline topics for a given level ('SMP' or 'SMA')
 */
export function loadStoredSyllabusTimelineTopics(level: 'SMP' | 'SMA' = 'SMA'): SyllabusTimelineTopic[] {
  return getTimelineTopicsForSubtest(level, level === 'SMA' ? 'sma-all' : 'smp-all');
}

// LocalStorage helpers for user topic progress
const PROGRESS_STORAGE_KEY_PREFIX = 'labschool_topic_progress_';

export function getStoredTopicProgress(userId?: string): Record<string, TopicProgressStatus> {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading topic progress', e);
  }
  return {};
}

export function saveStoredTopicProgress(
  userId: string,
  topicId: string,
  status: TopicProgressStatus
): Record<string, TopicProgressStatus> {
  const current = getStoredTopicProgress(userId);
  current[topicId] = status;
  try {
    localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving topic progress', e);
  }
  return current;
}
