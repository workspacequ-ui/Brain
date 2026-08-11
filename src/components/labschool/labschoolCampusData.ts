export interface LabschoolCampusItem {
  id: string;
  name: string;
  unit: string;
  loc: string;
  address: string;
  desc: string;
  badge: string;
  imageUrl: string;
  quotaSmp: number;
  quotaSma: number;
  passingGradeSmp: number; // e.g. 84.5
  passingGradeSma: number; // e.g. 86.0
  accreditation: string; // e.g. "Terakreditasi A Unggul"
  ratioKeketatan: string; // e.g. "1 : 6.2"
  accentColor: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'teal';
  features: string[];
  bannerGradient?: string;
  contactWa?: string;
  website?: string;
}

export const STORAGE_KEY_CAMPUSES = 'labschool_campuses_data_v3';

export const DEFAULT_LABSCHOOL_CAMPUSES: LabschoolCampusItem[] = [
  {
    id: 'camp-rawamangun',
    name: 'Labschool Jakarta (Rawamangun)',
    unit: 'SMP & SMA Labschool Jakarta',
    loc: 'Jakarta Timur',
    address: 'Jl. Pemuda Komplek UNJ Rawamangun, Jakarta Timur 13220',
    desc: 'Kampus perintis di bawah naungan BPS Labschool YP-UNJ sejak 1968 dengan tradisi prestasi akademik, riset ilmiah, dan kepemimpinan terbaik nasional.',
    badge: 'Kampus Utama UNJ',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
    quotaSmp: 240,
    quotaSma: 260,
    passingGradeSmp: 84.5,
    passingGradeSma: 86.0,
    accreditation: 'Terakreditasi A Unggul',
    ratioKeketatan: '1 : 6.2',
    accentColor: 'blue',
    features: [
      'Kampus Perintis BPS Labschool YP-UNJ',
      'Pusat CBT & Riset Ilmiah Remaja Terpadu',
      'Persentase Lolos PTN/SNBT & OSN Tertinggi'
    ],
    contactWa: '081280001968',
    website: 'https://labschoolunj.sch.id'
  },
  {
    id: 'camp-kebayoran',
    name: 'Labschool Kebayoran',
    unit: 'SMP & SMA Labschool Kebayoran',
    loc: 'Jakarta Selatan',
    address: 'Jl. KH Ahmad Dahlan No. 14, Kebayoran Baru, Jakarta Selatan 12130',
    desc: 'Pusat keunggulan sains terapan, kepemimpinan global, Skyrun, dan penguatan riset ilmiah berstandar internasional.',
    badge: 'Favorit Jakarta Selatan',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80',
    quotaSmp: 220,
    quotaSma: 240,
    passingGradeSmp: 85.0,
    passingGradeSma: 87.5,
    accreditation: 'Terakreditasi A Unggul',
    ratioKeketatan: '1 : 7.0',
    accentColor: 'emerald',
    features: [
      'Skyrun & Leadership Immersion Program',
      'Laboratorium Sains Modern & Bahasa Terakreditasi',
      'Ikatan Alumni Terkuat di PTN & Luar Negeri'
    ],
    contactWa: '081290002001',
    website: 'https://labschoolkebayoran.sch.id'
  },
  {
    id: 'camp-cibubur',
    name: 'Labschool Cibubur',
    unit: 'SMP & SMA Labschool Cibubur',
    loc: 'Bekasi / Depok',
    address: 'Jl. Raya Hankam No. 37, Jatiranggon, Jatisampurna, Kota Bekasi 17432',
    desc: 'Kampus asri bernuansa hijau dengan sarana prasarana modern, pembinaan olimpiade sains, serta penguatan karakter religius terpadu.',
    badge: 'Kampus Asri & Modern',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
    quotaSmp: 200,
    quotaSma: 220,
    passingGradeSmp: 82.5,
    passingGradeSma: 84.5,
    accreditation: 'Terakreditasi A Unggul',
    ratioKeketatan: '1 : 5.1',
    accentColor: 'amber',
    features: [
      'Eco-Campus Hijau & Fasilitas Olahraga Lengkap',
      'Karakter Religius, Disiplin & Jiwa Mandiri',
      'Pembinaan Intensif Olimpiade Sains & Seni'
    ],
    contactWa: '081310003737',
    website: 'https://labschoolcibubur.sch.id'
  },
  {
    id: 'camp-cirendeu',
    name: 'Labschool Cirendeu',
    unit: 'SMP & SMA Labschool Cirendeu',
    loc: 'Tangerang Selatan',
    address: 'Jl. Raya Cirendeu No. 40, Pisangan, Ciputat Timur, Tangerang Selatan 15419',
    desc: 'Kampus inovatif berbasis digital smart classroom dan kurikulum berwawasan global dengan rekam jejak lulusan berprestasi tinggi.',
    badge: 'Kampus Digital & Global Mindset',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    quotaSmp: 180,
    quotaSma: 200,
    passingGradeSmp: 82.0,
    passingGradeSma: 83.5,
    accreditation: 'Terakreditasi A Unggul',
    ratioKeketatan: '1 : 4.6',
    accentColor: 'purple',
    features: [
      'Digital Smart Classroom & Coding Curriculum',
      'Global Perspective & Program Pertukaran Budaya',
      'Pembinaan Berkelanjutan PSB Prestasi & CBT'
    ],
    contactWa: '081270004040',
    website: 'https://labschoolcirendeu.sch.id'
  },
  {
    id: 'camp-bintaro',
    name: 'Labschool Bintaro',
    unit: 'SMP & SMA Labschool Bintaro',
    loc: 'Tangerang Selatan (Bintaro)',
    address: 'Jl. Bintaro Utama Sektor 9, Pondok Aren, Tangerang Selatan 15229',
    desc: 'Kampus prestasi di kawasan strategis Bintaro Jaya dengan integrasi teknologi cerdas, pembinaan intensif kurikulum Labschool UNJ, dan sarana modern terdepan.',
    badge: 'Kampus Prestasi Bintaro Sektor 9',
    imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=80',
    quotaSmp: 180,
    quotaSma: 200,
    passingGradeSmp: 81.5,
    passingGradeSma: 83.0,
    accreditation: 'Terakreditasi A Unggul',
    ratioKeketatan: '1 : 4.4',
    accentColor: 'rose',
    features: [
      'Akses Strategis Kawasan Bintaro Sektor 9',
      'Laboratorium AI, Robotika & Multimedia Canggih',
      'Program Akselerasi Masuk SMP & SMA Labschool 2027'
    ],
    contactWa: '081390009988',
    website: 'https://labschoolbintaro.sch.id'
  }
];

export const PRESET_CAMPUS_IMAGES = [
  {
    id: 'preset-rawamangun',
    title: 'Gedung Utama Labschool Rawamangun',
    category: 'Gedung & Kampus',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-kebayoran',
    title: 'Kampus Hijau Labschool Kebayoran',
    category: 'Gedung & Kampus',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-cibubur',
    title: 'Eco Campus Asri Labschool Cibubur',
    category: 'Gedung & Kampus',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-cirendeu',
    title: 'Smart Digital Campus Labschool Cirendeu',
    category: 'Gedung & Kampus',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-bintaro',
    title: 'Modern Architecture Labschool Bintaro Sektor 9',
    category: 'Gedung & Kampus',
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-lab',
    title: 'Laboratorium Sains & Robotika Canggih',
    category: 'Fasilitas Belajar',
    url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-library',
    title: 'Perpustakaan Digital & Study Pod Modern',
    category: 'Fasilitas Belajar',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-classroom',
    title: 'Smart Classroom Interaktif',
    category: 'Ruang Kelas',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'preset-sports',
    title: 'Gelanggang Olahraga & Lapangan Terpadu',
    category: 'Olahraga & Seni',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80'
  }
];

export function loadStoredCampuses(): LabschoolCampusItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CAMPUSES) || localStorage.getItem('labschool_campuses_data_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all campuses have valid fields, features array, and bintaro is included
        const updated: LabschoolCampusItem[] = parsed.map((item: Partial<LabschoolCampusItem>) => {
          const defaultMatch = DEFAULT_LABSCHOOL_CAMPUSES.find(c => c.id === item.id || c.name === item.name) || DEFAULT_LABSCHOOL_CAMPUSES[0];
          return {
            ...defaultMatch,
            ...item,
            imageUrl: item.imageUrl || defaultMatch.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
            features: Array.isArray(item.features) && item.features.length > 0 ? item.features : defaultMatch.features,
            quotaSmp: typeof item.quotaSmp === 'number' ? item.quotaSmp : defaultMatch.quotaSmp,
            quotaSma: typeof item.quotaSma === 'number' ? item.quotaSma : defaultMatch.quotaSma,
            passingGradeSmp: typeof item.passingGradeSmp === 'number' ? item.passingGradeSmp : defaultMatch.passingGradeSmp,
            passingGradeSma: typeof item.passingGradeSma === 'number' ? item.passingGradeSma : defaultMatch.passingGradeSma,
            contactWa: item.contactWa || defaultMatch.contactWa || '',
            website: item.website || defaultMatch.website || ''
          };
        });

        const hasBintaro = updated.some(c => c.id === 'camp-bintaro' || c.name.toLowerCase().includes('bintaro'));
        if (!hasBintaro) {
          const bintaro = DEFAULT_LABSCHOOL_CAMPUSES.find(c => c.id === 'camp-bintaro');
          if (bintaro) {
            updated.push(bintaro);
          }
        }
        localStorage.setItem(STORAGE_KEY_CAMPUSES, JSON.stringify(updated));
        return updated;
      }
    }
  } catch (e) {
    console.error('Failed to load campuses from storage', e);
  }
  return DEFAULT_LABSCHOOL_CAMPUSES;
}

export function saveStoredCampuses(data: LabschoolCampusItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CAMPUSES, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save campuses to storage', e);
  }
}
