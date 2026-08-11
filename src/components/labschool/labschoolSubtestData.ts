import { loadStoredTryoutResults } from './labschoolLaporanData';

export interface LabschoolSubtestSubpart {
  id: string;
  name: string;
  code: string;
  description: string;
  questionCount: number;
  durationMinutes: number;
  topics: string[];
  sampleQuestion?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

export interface LabschoolSubtestItem {
  id: string;
  code: 'PK' | 'KV' | 'PM' | 'KA' | 'SK';
  title: string;
  subtitle: string;
  description: string;
  weightPercentage: number;
  totalQuestions: number;
  totalDurationMinutes: number;
  color: {
    primary: string;
    accent: string;
    gradient: string;
    border: string;
    bg: string;
    badge: string;
    text: string;
  };
  subparts: LabschoolSubtestSubpart[];
  examTips: string[];
  defaultScore: number; // For LRI calculation (0-100)
}

export const LABSCHOOL_SUBTESTS: LabschoolSubtestItem[] = [
  {
    id: 'subtest-pk',
    code: 'PK',
    title: 'Pengetahuan Kuantitatif',
    subtitle: 'Penalaran Matematika Dasar, Pola Bilangan & Aljabar',
    description: 'Mengukur kemampuan berhitung, logika angka, pemecahan masalah matematis kontekstual, dan pemahaman konsep aljabar serta geometri tingkat seleksi Labschool.',
    weightPercentage: 25,
    totalQuestions: 25,
    totalDurationMinutes: 30,
    color: {
      primary: 'amber',
      accent: 'amber-400',
      gradient: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      text: 'text-amber-400'
    },
    subparts: [
      {
        id: 'pk-matematika-dasar',
        name: 'Matematika Dasar & Aritmatika',
        code: 'PK-01',
        description: 'Operasi bilangan bulat, pecahan, perbandingan senilai/berbalik nilai, persen, dan aritmatika sosial.',
        questionCount: 10,
        durationMinutes: 12,
        topics: [
          'Operasi Hitung Campuran & Pecahan',
          'Aritmatika Sosial (Untung, Rugi, Diskon, Bunga)',
          'Perbandingan Senilai & Berbalik Nilai',
          'KPK, FPB & Sistem Bilangan'
        ],
        sampleQuestion: {
          question: 'Sebuah toko memberikan diskon ganda 20% + 10% untuk perlengkapan sekolah. Jika harga awal seragam adalah Rp250.000, berapakah harga yang harus dibayar siswa?',
          options: ['Rp175.000', 'Rp180.000', 'Rp185.000', 'Rp190.000'],
          correctAnswer: 1,
          explanation: 'Diskon 1 = 20% x 250.000 = 50.000 -> sisa Rp200.000. Diskon 2 = 10% x 200.000 = 20.000 -> Harga akhir = 200.000 - 20.000 = Rp180.000.'
        }
      },
      {
        id: 'pk-aljabar-pola',
        name: 'Aljabar & Pola Deret Kuantitatif',
        code: 'PK-02',
        description: 'Persamaan linear, pola deret angka bertingkat, relasi fungsi, dan logika kuantitatif HOTS.',
        questionCount: 15,
        durationMinutes: 18,
        topics: [
          'Pola Deret Bilangan Bertingkat & Pola Gambar',
          'Sistem Persamaan Linear Dua Variabel (SPLDV)',
          'Geometri Dasar & Pengukuran Bangun Datar/Ruang',
          'Penalaran Kuantitatif Soal Cerita HOTS'
        ],
        sampleQuestion: {
          question: 'Tentukan suku berikutnya dari deret: 3, 5, 9, 17, 33, ...',
          options: ['49', '57', '65', '73'],
          correctAnswer: 2,
          explanation: 'Pola selisih: +2, +4, +8, +16, +32. Maka 33 + 32 = 65.'
        }
      }
    ],
    examTips: [
      'Gunakan teknik eliminasi opsi terlebih dahulu untuk menghemat waktu.',
      'Perhatikan satuan pada soal geometri dan perbandingan waktu/kecepatan.',
      'Latih kecepatan berhitung mental tanpa kalkulator.'
    ],
    defaultScore: 88
  },
  {
    id: 'subtest-kv',
    code: 'KV',
    title: 'Kemampuan Verbal',
    subtitle: 'Verbal Bahasa Indonesia & Verbal Bahasa Inggris',
    description: 'Mengukur pemahaman kosakata, padanan kata (sinonim), lawan kata (antonim), hubungan asosiasi kata (analogi), dan struktur logika bahasa baik dalam Bahasa Indonesia maupun Bahasa Inggris.',
    weightPercentage: 20,
    totalQuestions: 30,
    totalDurationMinutes: 25,
    color: {
      primary: 'blue',
      accent: 'blue-400',
      gradient: 'from-blue-500 to-cyan-400',
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/20',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      text: 'text-blue-400'
    },
    subparts: [
      {
        id: 'kv-indonesia',
        name: 'Verbal Bahasa Indonesia',
        code: 'KV-IND',
        description: 'Sinonim, antonim, analogi kata, silogisme sederhana, dan penalaran asosiatif bahasa Indonesia.',
        questionCount: 15,
        durationMinutes: 12,
        topics: [
          'Sinonim (Persamaan Kata Formal/Ilmiah)',
          'Antonim (Lawan Kata Konseptual)',
          'Analogi Kata (Hubungan Makna Sebab-Akibat, Profesi, Alat)',
          'Silogisme & Logika Hubungan Kalimat'
        ],
        sampleQuestion: {
          question: 'Manakah pasangan kata yang memiliki hubungan analogi paling setara dengan: GURU : SEKOLAH?',
          options: ['Dokter : Pasien', 'Hakim : Pengadilan', 'Petani : Padi', 'Koki : Makanan'],
          correctAnswer: 1,
          explanation: 'GURU bertugas di SEKOLAH, sebagaimana HAKIM bertugas di PENGADILAN (Profesi : Tempat Bekerja).'
        }
      },
      {
        id: 'kv-inggris',
        name: 'Verbal Bahasa Inggris',
        code: 'KV-ENG',
        description: 'English vocabulary in context, synonyms/antonyms in English, verbal analogies, and basic sentence completion.',
        questionCount: 15,
        durationMinutes: 13,
        topics: [
          'English Vocabulary & Word Classification',
          'Synonyms and Antonyms in Context',
          'English Word Analogy & Collocations',
          'Sentence Completion & Grammatical Logic'
        ],
        sampleQuestion: {
          question: 'Find the closest synonym for the underlined word: "The teacher gave a PRECISE explanation about the experiment."',
          options: ['Vague', 'Accurate', 'Lengthy', 'Complicated'],
          correctAnswer: 1,
          explanation: '"Precise" means exact and accurate. Therefore, "Accurate" is the closest synonym.'
        }
      }
    ],
    examTips: [
      'Temukan pola hubungan pada kata pertama (apakah fungsi, karakteristik, bagian, atau tempat).',
      'Pada Bahasa Inggris, perhatikan part of speech (kata benda, kata kerja, atau kata sifat).'
    ],
    defaultScore: 85
  },
  {
    id: 'subtest-pm',
    code: 'PM',
    title: 'Pemahaman Membaca',
    subtitle: 'Literasi Teks Bahasa Indonesia & English Reading Comprehension',
    description: 'Menguji kemampuan analisis bacaan, penarikan kesimpulan logis, identifikasi ide pokok, fakta vs opini, dan pemahaman referensi tekstual Bahasa Indonesia serta Bahasa Inggris.',
    weightPercentage: 20,
    totalQuestions: 25,
    totalDurationMinutes: 30,
    color: {
      primary: 'purple',
      accent: 'purple-400',
      gradient: 'from-purple-500 to-indigo-500',
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/20',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      text: 'text-purple-400'
    },
    subparts: [
      {
        id: 'pm-indonesia',
        name: 'Pemahaman Membaca Bahasa Indonesia',
        code: 'PM-IND',
        description: 'Literasi wacana kritis, penentuan ide pokok paragraf, simpulan tersirat, dan konjungsi logis.',
        questionCount: 13,
        durationMinutes: 15,
        topics: [
          'Menemukan Gagasan Utama & Kalimat Topik',
          'Menarik Kesimpulan & Inferensi Teks Berita/Ilmiah',
          'Membedakan Fakta, Opini, dan Asumsi Penulis',
          'Pola Paragraf Deduktif, Induktif, & Campuran'
        ],
        sampleQuestion: {
          question: 'Apa fungsi utama dari kalimat topik (topic sentence) dalam sebuah paragraf eksposisi?',
          options: [
            'Memberikan contoh spesifik dan data angka',
            'Menyatakan gagasan pokok yang menjadi fokus uraian seluruh paragraf',
            'Sebagai penutup yang mengulang kalimat sebelumnya tanpa makna baru',
            'Menyampaikan kutipan langsung dari narasumber pendukung'
          ],
          correctAnswer: 1,
          explanation: 'Kalimat topik memuat ide sentral atau gagasan pokok yang dijabarkan oleh kalimat-kalimat pengembang berikutnya.'
        }
      },
      {
        id: 'pm-inggris',
        name: 'Pemahaman Membaca Bahasa Inggris',
        code: 'PM-ENG',
        description: 'English reading comprehension passages, finding main ideas, pronoun references, and inference questions.',
        questionCount: 12,
        durationMinutes: 15,
        topics: [
          'Main Idea & Author\'s Purpose',
          'Detailed Factual & Stated Questions',
          'Implicit Inference & Tone of Text',
          'Pronoun & Contextual Reference'
        ],
        sampleQuestion: {
          question: 'In reading comprehension, what does the question "What can be inferred from the second paragraph?" ask you to do?',
          options: [
            'Copy the exact words written in the paragraph',
            'Count how many words are present in the paragraph',
            'Draw a logical conclusion based on facts that are not explicitly stated',
            'Translate the whole paragraph into another language'
          ],
          correctAnswer: 2,
          explanation: 'Inference requires drawing logical deductions based on indirect clues and evidence in the passage.'
        }
      }
    ],
    examTips: [
      'Baca pertanyaan terlebih dahulu (skimming) sebelum membaca teks panjang.',
      'Hindari memilih opsi yang terlalu absolut (selalu, tidak pernah) jika teks tidak menyatakan demikian.'
    ],
    defaultScore: 86
  },
  {
    id: 'subtest-ka',
    code: 'KA',
    title: 'Kemampuan Akademik',
    subtitle: 'Sains Terpadu (IPA) & Pengetahuan Sosial (IPS)',
    description: 'Mengukur penguasaan konsep akademik esensial, metode ilmiah, penalaran sebab-akibat fenomena alam (Fisika, Biologi, Kimia) dan dinamika sosial-kemasyarakatan (Geografi, Sejarah, Sosiologi, Ekonomi).',
    weightPercentage: 25,
    totalQuestions: 30,
    totalDurationMinutes: 30,
    color: {
      primary: 'emerald',
      accent: 'emerald-400',
      gradient: 'from-emerald-500 to-teal-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      text: 'text-emerald-400'
    },
    subparts: [
      {
        id: 'ka-ipa',
        name: 'Kemampuan Akademik - IPA (Sains)',
        code: 'KA-IPA',
        description: 'Fisika dasar, Biologi lingkungan & makhluk hidup, Kimia sederhana, dan metode ilmiah terpadu.',
        questionCount: 15,
        durationMinutes: 15,
        topics: [
          'Pengukuran, Gerak, Gaya & Energi (Fisika)',
          'Ekosistem, Ciri Makhluk Hidup & Organ Tubuh (Biologi)',
          'Zat, Perubahan Wujud & Larutan (Kimia Dasar)',
          'Tata Surya, Lingkungan Hidup & Perubahan Iklim'
        ],
        sampleQuestion: {
          question: 'Peristiwa fotosintesis pada tumbuhan hijau menghasilkan zat utama yang dibutuhkan organisme lain untuk bernapas, yaitu...',
          options: ['Karbon dioksida (CO2)', 'Oksigen (O2)', 'Nitrogen (N2)', 'Karbon monoksida (CO)'],
          correctAnswer: 1,
          explanation: 'Reaksi fotosintesis: 6CO2 + 6H2O + cahaya -> C6H12O6 (glukosa) + 6O2 (oksigen).'
        }
      },
      {
        id: 'ka-ips',
        name: 'Kemampuan Akademik - IPS (Sosial)',
        code: 'KA-IPS',
        description: 'Geografi wilayah Indonesia, dinamika interaksi sosial, sejarah kebangsaan, dan konsep ekonomi dasar.',
        questionCount: 15,
        durationMinutes: 15,
        topics: [
          'Letak Geografis, Iklim & Sumber Daya Alam Indonesia',
          'Interaksi Sosial, Lembaga Sosial & Nilai Budaya',
          'Sejarah Perjuangan Kemerdekaan & Tokoh Nasional',
          'Kegiatan Ekonomi, Permintaan, Penawaran & Pasar'
        ],
        sampleQuestion: {
          question: 'Indonesia memiliki letak astronomis 6°LU - 11°LS dan 95°BT - 141°BT. Dampak letak astronomis tersebut terhadap iklim Indonesia adalah...',
          options: [
            'Memiliki 4 musim sepanjang tahun',
            'Memiliki iklim tropis dengan curah hujan dan sinar matahari sepanjang tahun',
            'Sering terjadi badai salju di dataran tinggi',
            'Memiliki iklim subtropis kering dengan gurun pasir luas'
          ],
          correctAnswer: 1,
          explanation: 'Letak di sekitar garis khatulistiwa (tropis) menyebabkan Indonesia beriklim tropis dengan suhu hangat dan dua musim (kemarau dan hujan).'
        }
      }
    ],
    examTips: [
      'Hubungkan konsep sains dengan fenomena sehari-hari yang sering dijumpai.',
      'Kuasai peta konsep dan istilah kunci materi IPA dan IPS.'
    ],
    defaultScore: 84
  },
  {
    id: 'subtest-sk',
    code: 'SK',
    title: 'Survei Karakter',
    subtitle: 'Integritas, Nasionalisme, Kemandirian & Gotong Royong',
    description: 'Menilai profil kepribadian, integritas moral, sikap toleransi, empati sosial, daya juang (adversity quotient), dan kesiapan beradaptasi dengan kultur unggul Labschool.',
    weightPercentage: 10,
    totalQuestions: 20,
    totalDurationMinutes: 15,
    color: {
      primary: 'rose',
      accent: 'rose-400',
      gradient: 'from-rose-500 to-pink-500',
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      text: 'text-rose-400'
    },
    subparts: [
      {
        id: 'sk-profil-karakter',
        name: 'Profil Karakter & Nilai Labschool',
        code: 'SK-01',
        description: 'Studi kasus situasional menguji respon etis terhadap dilema kejujuran, kerja sama kelompok, dan kepemimpinan.',
        questionCount: 20,
        durationMinutes: 15,
        topics: [
          'Integritas & Kejujuran Akademik',
          'Nasionalisme & Toleransi Kebhinekaan',
          'Kemandirian & Manajemen Waktu Belajar',
          'Gotong Royong & Kerja Sama Tim',
          'Penalaran Etis & Sikap Terhadap Masalah Sosial'
        ],
        sampleQuestion: {
          question: 'Ketika mengerjakan tugas kelompok, salah satu teman Anda berhalangan hadir karena sakit dan tidak dapat menyelesaikan bagiannya. Sikap terbaik yang Anda ambil adalah...',
          options: [
            'Mengabaikan tugasnya dan membiarkan kelompok dinilai kurang',
            'Melaporkan kepada guru agar teman tersebut dikeluarkan dari kelompok',
            'Membagi tugas teman yang sakit bersama anggota lain secara proporsional dan menyelesaikannya bersama',
            'Mengerjakan sendiri seluruh tugas dan tidak mencantumkan nama teman yang lain'
          ],
          correctAnswer: 2,
          explanation: 'Sikap gotong royong dan empati ditunjukkan dengan berinisiatif membagi beban bersama demi kesuksesan tim tanpa menjatuhkan orang lain.'
        }
      }
    ],
    examTips: [
      'Pilihlah jawaban yang paling mencerminkan integritas tinggi, empati, dan tanggung jawab nyata.',
      'Jawablah secara konsisten berdasarkan prinsip moral yang kuat.'
    ],
    defaultScore: 92
  }
];

export function calculateLriScore(customScores?: Record<string, number>): {
  overallScore: number;
  status: { label: string; color: string; badge: string; zone: string };
  breakdown: Array<{ code: string; title: string; score: number; weight: number; color: string }>;
} {
  let totalWeighted = 0;
  let totalWeight = 0;

  const breakdown = LABSCHOOL_SUBTESTS.map((st) => {
    const score = customScores && customScores[st.code] !== undefined ? customScores[st.code] : st.defaultScore;
    totalWeighted += score * (st.weightPercentage / 100);
    totalWeight += st.weightPercentage;
    return {
      code: st.code,
      title: st.title,
      score: score,
      weight: st.weightPercentage,
      color: st.color.gradient
    };
  });

  const overallScore = totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 86.5;

  let status = {
    label: 'Zona Aman Lolos (Sangat Siap)',
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    zone: 'ZONA AMAN (85.0+)'
  };

  if (overallScore >= 88) {
    status = {
      label: 'Zona Sangat Kompetitif (Peluang Tertinggi)',
      color: 'text-cyan-300',
      badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
      zone: 'ZONA UNGGUL (88.0+)'
    };
  } else if (overallScore >= 80) {
    status = {
      label: 'Zona Aman Lolos (Memenuhi Passing Grade)',
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      zone: 'ZONA AMAN (80.0 - 87.9)'
    };
  } else if (overallScore >= 70) {
    status = {
      label: 'Zona Waspada (Perlu Pemantapan Subtest)',
      color: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      zone: 'ZONA WASPADA (70.0 - 79.9)'
    };
  } else {
    status = {
      label: 'Zona Perlu Peningkatan Intensif',
      color: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      zone: 'ZONA PENINGKATAN (< 70.0)'
    };
  }

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    status,
    breakdown
  };
}

export interface LatestTryoutSubtestSummary {
  tryoutId: string;
  tryoutTitle: string;
  submittedAt: string;
  studentName: string;
  studentNis?: string;
  studentLevel: 'SMP' | 'SMA';
  totalScore: number;
  rank?: number;
  totalParticipants?: number;
  subtestScores: Record<string, number>;
  subtestDetails: Array<{
    code: string;
    name: string;
    score: number;
    weight: number;
    correctCount: number;
    totalQuestions: number;
    status: string;
  }>;
}

export function getLatestTryoutForUser(
  user?: { id?: string; name?: string; role?: string; nis?: string },
  preferredLevel?: 'SMP' | 'SMA'
): LatestTryoutSubtestSummary {
  try {
    const allResults = loadStoredTryoutResults();
    if (allResults && allResults.length > 0) {
      let filtered = allResults;

      // If user is a student, try to match by ID, NIS, or Name
      if (user?.role === 'student' || user?.id) {
        const studentMatches = allResults.filter(r => 
          (user.id && r.studentId === user.id) ||
          (user.nis && r.studentNis === user.nis) ||
          (user.name && r.studentName.toLowerCase().includes(user.name.toLowerCase()))
        );
        if (studentMatches.length > 0) {
          filtered = studentMatches;
        }
      }

      // If preferredLevel is specified, filter further if possible
      if (preferredLevel) {
        const levelMatches = filtered.filter(r => r.level === preferredLevel);
        if (levelMatches.length > 0) {
          filtered = levelMatches;
        }
      }

      // Sort by submittedAt descending (newest tryout first)
      const sorted = [...filtered].sort((a, b) => {
        const tA = new Date(a.submittedAt).getTime() || 0;
        const tB = new Date(b.submittedAt).getTime() || 0;
        return tB - tA;
      });

      const latest = sorted[0];
      if (latest) {
        const scores: Record<string, number> = {};
        const details = LABSCHOOL_SUBTESTS.map(st => {
          const found = latest.subtestScores?.find(s => s.code.toUpperCase() === st.code.toUpperCase());
          const score = found ? Math.round(found.score * 10) / 10 : st.defaultScore;
          scores[st.code] = score;
          return {
            code: st.code,
            name: st.title,
            score,
            weight: st.weightPercentage,
            correctCount: found ? found.correctCount : Math.round(st.totalQuestions * (score / 100)),
            totalQuestions: found ? found.totalQuestions : st.totalQuestions,
            status: found?.status || (score >= 85 ? 'Tinggi' : score >= 75 ? 'Sedang' : 'Perlu Perhatian')
          };
        });

        return {
          tryoutId: latest.tryoutId,
          tryoutTitle: latest.tryoutTitle,
          submittedAt: latest.submittedAt,
          studentName: latest.studentName,
          studentNis: latest.studentNis,
          studentLevel: latest.level,
          totalScore: Math.round(latest.totalScore * 10) / 10,
          rank: latest.rank,
          totalParticipants: latest.totalParticipants,
          subtestScores: scores,
          subtestDetails: details
        };
      }
    }
  } catch (err) {
    console.error('Error fetching latest tryout for LRI', err);
  }

  // Fallback defaults
  const fallbackScores: Record<string, number> = {
    PK: 88,
    KV: 85,
    PM: 86,
    KA: 84,
    SK: 92
  };
  const fallbackDetails = LABSCHOOL_SUBTESTS.map(st => ({
    code: st.code,
    name: st.title,
    score: fallbackScores[st.code] ?? st.defaultScore,
    weight: st.weightPercentage,
    correctCount: Math.round(st.totalQuestions * ((fallbackScores[st.code] ?? st.defaultScore) / 100)),
    totalQuestions: st.totalQuestions,
    status: (fallbackScores[st.code] ?? st.defaultScore) >= 85 ? 'Tinggi' : 'Sedang'
  }));

  return {
    tryoutId: 'to-lab-sma-5',
    tryoutTitle: 'Tryout Akbar PSB SMA Labschool 2026 - Seri 5 (Gladi Bersih)',
    submittedAt: '2026-03-01 11:45',
    studentName: user?.name || 'Budi Santoso',
    studentLevel: preferredLevel || 'SMA',
    totalScore: 87.0,
    rank: 12,
    totalParticipants: 640,
    subtestScores: fallbackScores,
    subtestDetails: fallbackDetails
  };
}

