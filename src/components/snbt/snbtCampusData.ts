export type SnbtMajorCluster = 'SAINTEK' | 'SOSHUM' | 'CAMPURAN';
export type SnbtDegreeLevel = 'S1' | 'D4';

export interface SnbtMajorItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  degree: SnbtDegreeLevel;
  cluster: SnbtMajorCluster;
  passingGrade: number; // IRT Scale 200 - 1000 (e.g. 748, 732, 680)
  quota: number; // Daya Tampung SNBT 2026
  applicantsLastYear: number; // Peminat SNBT 2025
  tightnessRatio: string; // e.g. "1 : 51 (1.9%)"
  accreditation: string; // e.g. "Unggul", "A", "Internasional ASIIN"
  careerProspects: string[];
  specialRequirements?: string; // Portofolio, Uji Buta Warna, etc.
}

export interface SnbtCampusItem {
  id: string;
  name: string;
  shortName: string;
  city: string;
  province: string;
  ranking: number;
  accreditation: string;
  badge: string;
  logo: string;
  imageUrl: string;
  website: string;
  description: string;
  clusters: SnbtMajorCluster[];
  accentColor: 'indigo' | 'blue' | 'rose' | 'amber' | 'emerald' | 'purple' | 'cyan';
  majors: SnbtMajorItem[];
}

export const STORAGE_KEY_SNBT_CAMPUSES = 'snbt_campus_directory_v2';

export const DEFAULT_SNBT_CAMPUSES: SnbtCampusItem[] = [
  {
    id: 'ptn-ui',
    name: 'Universitas Indonesia',
    shortName: 'UI',
    city: 'Depok / Jakarta',
    province: 'Jawa Barat & DKI Jakarta',
    ranking: 1,
    accreditation: 'Unggul',
    badge: 'Kampus Terbaik #1 Nasional',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    website: 'https://ui.ac.id',
    description: 'Perguruan tinggi tertua dan paling bergengsi di Indonesia dengan reputasi internasional, pusat riset terdepan, dan jejaring alumni terkuat.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'amber',
    majors: [
      {
        id: 'ui-fk-dokter',
        code: '311012',
        name: 'Pendidikan Dokter (FK UI)',
        faculty: 'Fakultas Kedokteran',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 748,
        quota: 75,
        applicantsLastYear: 3850,
        tightnessRatio: '1 : 51.3 (1.95%)',
        accreditation: 'Unggul & AMEE Internasional',
        careerProspects: ['Dokter Spesialis', 'Peneliti Medis Klinis', 'Konsultan Kesehatan Global', 'Direktur RS'],
        specialRequirements: 'Bebas Buta Warna Total & Parsial, Uji Kesehatan'
      },
      {
        id: 'ui-fasilkom-ilkom',
        code: '311054',
        name: 'Ilmu Komputer (Fasilkom UI)',
        faculty: 'Fakultas Ilmu Komputer',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 725,
        quota: 65,
        applicantsLastYear: 2420,
        tightnessRatio: '1 : 37.2 (2.68%)',
        accreditation: 'Unggul & ASIIN Internasional',
        careerProspects: ['AI Engineer', 'Software Architect', 'Data Scientist', 'CTO Tech Startup'],
        specialRequirements: 'Logika Pemrograman & Matematika Tingkat Lanjut'
      },
      {
        id: 'ui-fasilkom-si',
        code: '311055',
        name: 'Sistem Informasi (Fasilkom UI)',
        faculty: 'Fakultas Ilmu Komputer',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 712,
        quota: 65,
        applicantsLastYear: 2100,
        tightnessRatio: '1 : 32.3 (3.09%)',
        accreditation: 'Unggul',
        careerProspects: ['Product Manager', 'IT Consultant', 'Enterprise Architect', 'Business Analyst']
      },
      {
        id: 'ui-ft-ti',
        code: '311032',
        name: 'Teknik Industri (FT UI)',
        faculty: 'Fakultas Teknik',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 705,
        quota: 60,
        applicantsLastYear: 1890,
        tightnessRatio: '1 : 31.5 (3.17%)',
        accreditation: 'Unggul & IABEE Internasional',
        careerProspects: ['Supply Chain Manager', 'Operations Director', 'Management Consultant']
      },
      {
        id: 'ui-feb-akt',
        code: '312015',
        name: 'Akuntansi (FEB UI)',
        faculty: 'Fakultas Ekonomi & Bisnis',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 720,
        quota: 80,
        applicantsLastYear: 2750,
        tightnessRatio: '1 : 34.3 (2.91%)',
        accreditation: 'Unggul & AACSB Internasional',
        careerProspects: ['Auditor Big Four', 'Investment Banker', 'CFO', 'Financial Analyst']
      },
      {
        id: 'ui-feb-mnj',
        code: '312016',
        name: 'Manajemen (FEB UI)',
        faculty: 'Fakultas Ekonomi & Bisnis',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 718,
        quota: 90,
        applicantsLastYear: 3100,
        tightnessRatio: '1 : 34.4 (2.90%)',
        accreditation: 'Unggul & AACSB Internasional',
        careerProspects: ['Brand Manager', 'Corporate Strategist', 'Venture Capitalist', 'Entrepreneur']
      },
      {
        id: 'ui-fh-hukum',
        code: '312001',
        name: 'Ilmu Hukum (FH UI)',
        faculty: 'Fakultas Hukum',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 715,
        quota: 120,
        applicantsLastYear: 3900,
        tightnessRatio: '1 : 32.5 (3.07%)',
        accreditation: 'Unggul',
        careerProspects: ['Corporate Lawyer', 'Diplomat', 'Hakim / Jaksa', 'Legal Counsel']
      },
      {
        id: 'ui-fisip-ilkom',
        code: '312044',
        name: 'Ilmu Komunikasi (FISIP UI)',
        faculty: 'Fakultas Ilmu Sosial & Ilmu Politik',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 710,
        quota: 50,
        applicantsLastYear: 2600,
        tightnessRatio: '1 : 52.0 (1.92%)',
        accreditation: 'Unggul',
        careerProspects: ['PR Director', 'Media Specialist', 'Brand Strategist', 'Creative Producer']
      },
      {
        id: 'ui-fpsi-psikologi',
        code: '312033',
        name: 'Psikologi (FPsi UI)',
        faculty: 'Fakultas Psikologi',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 708,
        quota: 90,
        applicantsLastYear: 2850,
        tightnessRatio: '1 : 31.6 (3.15%)',
        accreditation: 'Unggul',
        careerProspects: ['HR Director', 'Psikolog Klinis/Organisasi', 'UX Researcher', 'Behavioral Scientist']
      }
    ]
  },
  {
    id: 'ptn-itb',
    name: 'Institut Teknologi Bandung',
    shortName: 'ITB',
    city: 'Bandung / Jatinangor',
    province: 'Jawa Barat',
    ranking: 2,
    accreditation: 'Unggul',
    badge: 'Pusat Rekayasa & Teknologi #1',
    logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    website: 'https://itb.ac.id',
    description: 'Institut teknologi terkemuka penghasil insinyur kelas dunia, technopreneur hebat, dan arsitek legendaris bangsa.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'indigo',
    majors: [
      {
        id: 'itb-stei-r',
        code: '321001',
        name: 'Sekolah Teknik Elektro & Informatika (STEI-R)',
        faculty: 'STEI ITB',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 732,
        quota: 110,
        applicantsLastYear: 3450,
        tightnessRatio: '1 : 31.3 (3.18%)',
        accreditation: 'Unggul & ABET Internasional',
        careerProspects: ['AI/Robotics Engineer', 'Semiconductor Engineer', 'Lead Developer', 'Tech Founder'],
        specialRequirements: 'Bebas Buta Warna'
      },
      {
        id: 'itb-sbm-mnj',
        code: '322001',
        name: 'Sekolah Bisnis & Manajemen (SBM ITB)',
        faculty: 'SBM ITB',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 722,
        quota: 95,
        applicantsLastYear: 3200,
        tightnessRatio: '1 : 33.6 (2.96%)',
        accreditation: 'Unggul & AACSB Internasional',
        careerProspects: ['Business Consultant', 'Fintech Specialist', 'Growth Leader', 'Angel Investor']
      },
      {
        id: 'itb-fti',
        code: '321002',
        name: 'Fakultas Teknologi Industri (FTI-Ganesa)',
        faculty: 'FTI ITB',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 718,
        quota: 140,
        applicantsLastYear: 2900,
        tightnessRatio: '1 : 20.7 (4.82%)',
        accreditation: 'Unggul & ABET',
        careerProspects: ['Industrial Consultant', 'Chemical Plant Manager', 'Engineering Specialist']
      },
      {
        id: 'itb-fttm',
        code: '321003',
        name: 'Fakultas Teknik Pertambangan & Perminyakan (FTTM)',
        faculty: 'FTTM ITB',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 715,
        quota: 130,
        applicantsLastYear: 2800,
        tightnessRatio: '1 : 21.5 (4.64%)',
        accreditation: 'Unggul & IABEE',
        careerProspects: ['Petroleum Engineer', 'Mining Specialist', 'Energy Geoscientist']
      },
      {
        id: 'itb-sappk-ars',
        code: '321004',
        name: 'Sekolah Arsitektur, Perencanaan & Pengembangan Kebijakan (SAPPK)',
        faculty: 'SAPPK ITB',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 706,
        quota: 85,
        applicantsLastYear: 1950,
        tightnessRatio: '1 : 22.9 (4.35%)',
        accreditation: 'Unggul & KAAB Internasional',
        careerProspects: ['Master Architect', 'Urban Planner', 'Sustainable City Developer'],
        specialRequirements: 'Portofolio Gambar Arsitektur/Desain'
      }
    ]
  },
  {
    id: 'ptn-ugm',
    name: 'Universitas Gadjah Mada',
    shortName: 'UGM',
    city: 'Sleman / Yogyakarta',
    province: 'DI Yogyakarta',
    ranking: 3,
    accreditation: 'Unggul',
    badge: 'Pusat Keilmuan & Kerakyatan',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    website: 'https://ugm.ac.id',
    description: 'Universitas nasional tertua di Yogyakarta dengan tradisi kepemimpinan berintegritas, dedikasi pengabdian masyarakat, dan riset lintas disiplin.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'blue',
    majors: [
      {
        id: 'ugm-fk-kedokteran',
        code: '331001',
        name: 'Kedokteran (FKKMK UGM)',
        faculty: 'FKKMK UGM',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 735,
        quota: 80,
        applicantsLastYear: 3620,
        tightnessRatio: '1 : 45.2 (2.20%)',
        accreditation: 'Unggul & AUN-QA',
        careerProspects: ['Dokter Spesialis', 'Peneliti Kesehatan Masyarakat', 'World Health Specialist'],
        specialRequirements: 'Bebas Buta Warna'
      },
      {
        id: 'ugm-mipa-ilkom',
        code: '331045',
        name: 'Ilmu Komputer (FMIPA UGM)',
        faculty: 'Fakultas MIPA',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 715,
        quota: 45,
        applicantsLastYear: 1780,
        tightnessRatio: '1 : 39.5 (2.52%)',
        accreditation: 'Unggul & ASIIN',
        careerProspects: ['Machine Learning Engineer', 'Systems Architect', 'Security Engineer']
      },
      {
        id: 'ugm-fisipol-hi',
        code: '332011',
        name: 'Hubungan Internasional (FISIPOL UGM)',
        faculty: 'FISIPOL UGM',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 716,
        quota: 40,
        applicantsLastYear: 2250,
        tightnessRatio: '1 : 56.2 (1.77%)',
        accreditation: 'Unggul',
        careerProspects: ['Diplomat Kemlu RI', 'International Policy Advisor', 'UN Specialist', 'Global NGO Lead']
      },
      {
        id: 'ugm-feb-manajemen',
        code: '332001',
        name: 'Manajemen (FEB UGM)',
        faculty: 'FEB UGM',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 712,
        quota: 70,
        applicantsLastYear: 2650,
        tightnessRatio: '1 : 37.8 (2.64%)',
        accreditation: 'Unggul & AACSB',
        careerProspects: ['Corporate Strategist', 'Investment Officer', 'Management Consultant']
      },
      {
        id: 'ugm-fh-hukum',
        code: '332005',
        name: 'Hukum (FH UGM)',
        faculty: 'Fakultas Hukum',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 705,
        quota: 135,
        applicantsLastYear: 3400,
        tightnessRatio: '1 : 25.1 (3.97%)',
        accreditation: 'Unggul',
        careerProspects: ['Advokat Litigasi & Non-Litigasi', 'Diplomat Hukum', 'Jaksa & Hakim']
      },
      {
        id: 'ugm-fpsi-psikologi',
        code: '332008',
        name: 'Psikologi (FPsi UGM)',
        faculty: 'Fakultas Psikologi',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 704,
        quota: 95,
        applicantsLastYear: 2900,
        tightnessRatio: '1 : 30.5 (3.27%)',
        accreditation: 'Unggul',
        careerProspects: ['HR Business Partner', 'Psikolog Klinis', 'People & Culture Lead']
      }
    ]
  },
  {
    id: 'ptn-unair',
    name: 'Universitas Airlangga',
    shortName: 'UNAIR',
    city: 'Surabaya',
    province: 'Jawa Timur',
    ranking: 4,
    accreditation: 'Unggul',
    badge: 'Pusat Keunggulan Medis & Sains Hayati',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    website: 'https://unair.ac.id',
    description: 'Universitas terkemuka di Surabaya dengan reputasi unggul dalam bidang kedokteran, farmasi, sains terapan, dan ilmu sosial.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'cyan',
    majors: [
      {
        id: 'unair-fk-dokter',
        code: '341001',
        name: 'Kedokteran (FK UNAIR)',
        faculty: 'Fakultas Kedokteran',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 730,
        quota: 90,
        applicantsLastYear: 3300,
        tightnessRatio: '1 : 36.6 (2.72%)',
        accreditation: 'Unggul & ASIIN',
        careerProspects: ['Dokter Spesialis', 'Peneliti Medis Terapan', 'Kepala Rumah Sakit'],
        specialRequirements: 'Bebas Buta Warna Total & Parsial'
      },
      {
        id: 'unair-ff-farmasi',
        code: '341015',
        name: 'Farmasi (FF UNAIR)',
        faculty: 'Fakultas Farmasi',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 695,
        quota: 85,
        applicantsLastYear: 1950,
        tightnessRatio: '1 : 22.9 (4.35%)',
        accreditation: 'Unggul & ASIIN',
        careerProspects: ['Apoteker Industri', 'Clinical Pharmacist', 'Regulatory Affairs Manager']
      },
      {
        id: 'unair-fkg-gigi',
        code: '341002',
        name: 'Kedokteran Gigi (FKG UNAIR)',
        faculty: 'Fakultas Kedokteran Gigi',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 705,
        quota: 75,
        applicantsLastYear: 1850,
        tightnessRatio: '1 : 24.6 (4.05%)',
        accreditation: 'Unggul',
        careerProspects: ['Dokter Gigi Spesialis', 'Ortodontis', 'Konsultan Kesehatan Gigi']
      },
      {
        id: 'unair-feb-mnj',
        code: '342001',
        name: 'Manajemen (FEB UNAIR)',
        faculty: 'FEB UNAIR',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 692,
        quota: 110,
        applicantsLastYear: 2300,
        tightnessRatio: '1 : 20.9 (4.78%)',
        accreditation: 'Unggul & ABEST21',
        careerProspects: ['Financial Analyst', 'Marketing Executive', 'Banker']
      }
    ]
  },
  {
    id: 'ptn-its',
    name: 'Institut Teknologi Sepuluh Nopember',
    shortName: 'ITS',
    city: 'Surabaya',
    province: 'Jawa Timur',
    ranking: 5,
    accreditation: 'Unggul',
    badge: 'Kampus Maritim & Robotika',
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    website: 'https://its.ac.id',
    description: 'Institut teknologi berbasis maritim dan robotika kelas dunia di Jawa Timur dengan kontribusi inovasi teknologi terluas.',
    clusters: ['SAINTEK'],
    accentColor: 'blue',
    majors: [
      {
        id: 'its-fteic-if',
        code: '351001',
        name: 'Teknik Informatika (FTEIC ITS)',
        faculty: 'FTEIC ITS',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 718,
        quota: 72,
        applicantsLastYear: 2560,
        tightnessRatio: '1 : 35.5 (2.81%)',
        accreditation: 'Unggul & IABEE',
        careerProspects: ['Software Engineer', 'Cloud Architect', 'Cybersecurity Specialist']
      },
      {
        id: 'its-fteic-si',
        code: '351002',
        name: 'Sistem Informasi (FTEIC ITS)',
        faculty: 'FTEIC ITS',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 702,
        quota: 65,
        applicantsLastYear: 1980,
        tightnessRatio: '1 : 30.4 (3.28%)',
        accreditation: 'Unggul',
        careerProspects: ['Data Analyst', 'IT Project Manager', 'Solutions Architect']
      },
      {
        id: 'its-ftirs-ti',
        code: '351003',
        name: 'Teknik Industri (FTIRS ITS)',
        faculty: 'FTIRS ITS',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 696,
        quota: 80,
        applicantsLastYear: 1750,
        tightnessRatio: '1 : 21.8 (4.57%)',
        accreditation: 'Unggul & ABET',
        careerProspects: ['Supply Chain Specialist', 'Quality Assurance Director', 'Production Planner']
      },
      {
        id: 'its-f-statistika',
        code: '351008',
        name: 'Statistika & Sains Data (FSAD ITS)',
        faculty: 'FSAD ITS',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 690,
        quota: 60,
        applicantsLastYear: 1420,
        tightnessRatio: '1 : 23.6 (4.22%)',
        accreditation: 'Unggul',
        careerProspects: ['Data Scientist', 'Risk Analyst', 'Quantitative Researcher', 'Aktuaris']
      }
    ]
  },
  {
    id: 'ptn-ipb',
    name: 'IPB University',
    shortName: 'IPB',
    city: 'Bogor',
    province: 'Jawa Barat',
    ranking: 6,
    accreditation: 'Unggul',
    badge: 'Pusat Bio-Sains, Data & Agromaritim',
    logo: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80',
    website: 'https://ipb.ac.id',
    description: 'Universitas terdepan dalam inovasi pertanian modern, sains data hayati, kedokteran hewan, serta bisnis pangan berkelanjutan.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'emerald',
    majors: [
      {
        id: 'ipb-fmipa-ilkom',
        code: '361005',
        name: 'Ilmu Komputer (FMIPA IPB)',
        faculty: 'FMIPA IPB',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 708,
        quota: 55,
        applicantsLastYear: 1880,
        tightnessRatio: '1 : 34.1 (2.92%)',
        accreditation: 'Unggul & ASIIN',
        careerProspects: ['Bioinformatics Specialist', 'Full-stack Engineer', 'Data Analyst']
      },
      {
        id: 'ipb-fkh-hewan',
        code: '361001',
        name: 'Kedokteran Hewan & Biomedis (SKHB IPB)',
        faculty: 'Sekolah Kedokteran Hewan & Biomedis',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 688,
        quota: 80,
        applicantsLastYear: 1720,
        tightnessRatio: '1 : 21.5 (4.65%)',
        accreditation: 'Unggul & AUN-QA',
        careerProspects: ['Dokter Hewan Praktisi', 'Biomedical Researcher', 'Wildlife Veterinarian'],
        specialRequirements: 'Bebas Buta Warna'
      },
      {
        id: 'ipb-fateta-pangan',
        code: '361012',
        name: 'Ilmu & Teknologi Pangan (FATETA IPB)',
        faculty: 'Fakultas Teknologi Pertanian',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 682,
        quota: 65,
        applicantsLastYear: 1680,
        tightnessRatio: '1 : 25.8 (3.86%)',
        accreditation: 'Unggul & IFT Internasional',
        careerProspects: ['Food Scientist', 'R&D Director Fast Moving Consumer Goods', 'Food Safety Auditor']
      },
      {
        id: 'ipb-fem-bisnis',
        code: '362001',
        name: 'Bisnis & Manajemen (SB IPB)',
        faculty: 'Sekolah Bisnis IPB',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 690,
        quota: 75,
        applicantsLastYear: 2100,
        tightnessRatio: '1 : 28.0 (3.57%)',
        accreditation: 'Unggul',
        careerProspects: ['Agri-Business Founder', 'Supply Chain Director', 'Investment Analyst']
      }
    ]
  },
  {
    id: 'ptn-unpad',
    name: 'Universitas Padjadjaran',
    shortName: 'UNPAD',
    city: 'Jatinangor / Bandung',
    province: 'Jawa Barat',
    ranking: 7,
    accreditation: 'Unggul',
    badge: 'Kampus Berakar Budaya Sunda & Riset Global',
    logo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=80',
    website: 'https://unpad.ac.id',
    description: 'Universitas terfavorit di Jawa Barat dengan tradisi keilmuan kuat dalam bidang kedokteran, komunikasi, hukum, dan psikologi.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'rose',
    majors: [
      {
        id: 'unpad-fk-dokter',
        code: '371001',
        name: 'Kedokteran (FK UNPAD)',
        faculty: 'Fakultas Kedokteran',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 728,
        quota: 110,
        applicantsLastYear: 3550,
        tightnessRatio: '1 : 32.2 (3.09%)',
        accreditation: 'Unggul & ASIIN',
        careerProspects: ['Dokter Spesialis', 'Peneliti Medis', 'Klinisi RS Pendidikan'],
        specialRequirements: 'Bebas Buta Warna Total & Parsial'
      },
      {
        id: 'unpad-fikom-ilkom',
        code: '372001',
        name: 'Ilmu Komunikasi (Fikom UNPAD)',
        faculty: 'Fakultas Ilmu Komunikasi',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 708,
        quota: 80,
        applicantsLastYear: 3100,
        tightnessRatio: '1 : 38.7 (2.58%)',
        accreditation: 'Unggul',
        careerProspects: ['Corporate Communications Head', 'Media Strategist', 'Broadcaster', 'PR Consultant']
      },
      {
        id: 'unpad-fapsi-psikologi',
        code: '372005',
        name: 'Psikologi (Fapsi UNPAD)',
        faculty: 'Fakultas Psikologi',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 706,
        quota: 85,
        applicantsLastYear: 3200,
        tightnessRatio: '1 : 37.6 (2.65%)',
        accreditation: 'Unggul',
        careerProspects: ['Psikolog Klinis/Pendidikan', 'Talent Acquisition Head', 'HR Consultant']
      },
      {
        id: 'unpad-fh-hukum',
        code: '372008',
        name: 'Ilmu Hukum (FH UNPAD)',
        faculty: 'Fakultas Hukum',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 698,
        quota: 160,
        applicantsLastYear: 3350,
        tightnessRatio: '1 : 20.9 (4.77%)',
        accreditation: 'Unggul',
        careerProspects: ['Corporate Legal Specialist', 'Diplomat Hukum Internasional', 'Notaris']
      }
    ]
  },
  {
    id: 'ptn-undip',
    name: 'Universitas Diponegoro',
    shortName: 'UNDIP',
    city: 'Semarang',
    province: 'Jawa Tengah',
    ranking: 8,
    accreditation: 'Unggul',
    badge: 'Pusat Riset Tropis & Pesisir',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    website: 'https://undip.ac.id',
    description: 'Universitas riset terkemuka di Semarang dengan keunggulan di bidang hukum, kedokteran, teknik kelautan, dan sains lingkungan.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'indigo',
    majors: [
      {
        id: 'undip-fk-dokter',
        code: '381001',
        name: 'Kedokteran (FK UNDIP)',
        faculty: 'Fakultas Kedokteran',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 722,
        quota: 85,
        applicantsLastYear: 2980,
        tightnessRatio: '1 : 35.0 (2.85%)',
        accreditation: 'Unggul',
        careerProspects: ['Dokter Spesialis', 'Peneliti Medis Terapan', 'Kepala Instansi Kesehatan'],
        specialRequirements: 'Bebas Buta Warna'
      },
      {
        id: 'undip-fh-hukum',
        code: '382001',
        name: 'Hukum (FH UNDIP)',
        faculty: 'Fakultas Hukum',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 692,
        quota: 220,
        applicantsLastYear: 3750,
        tightnessRatio: '1 : 17.0 (5.86%)',
        accreditation: 'Unggul',
        careerProspects: ['Advokat', 'Jaksa', 'Legal Officer Korporasi', 'Konsultan Regulasi Publik']
      },
      {
        id: 'undip-fsm-if',
        code: '381012',
        name: 'Informatika (FSM UNDIP)',
        faculty: 'Fakultas Sains & Matematika',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 698,
        quota: 65,
        applicantsLastYear: 2100,
        tightnessRatio: '1 : 32.3 (3.09%)',
        accreditation: 'Unggul & ASIIN',
        careerProspects: ['Software Developer', 'Database Specialist', 'IT Auditor']
      }
    ]
  },
  {
    id: 'ptn-ub',
    name: 'Universitas Brawijaya',
    shortName: 'UB',
    city: 'Malang',
    province: 'Jawa Timur',
    ranking: 9,
    accreditation: 'Unggul',
    badge: 'Kampus Pelopor Wirausaha & Teknologi',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80',
    website: 'https://ub.ac.id',
    description: 'Universitas negeri dengan peminat terbanyak di Indonesia, berlokasi di kota sejuk Malang dengan kampus modern berstandar internasional.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'purple',
    majors: [
      {
        id: 'ub-fk-dokter',
        code: '391001',
        name: 'Kedokteran (FK UB)',
        faculty: 'Fakultas Kedokteran',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 724,
        quota: 95,
        applicantsLastYear: 3150,
        tightnessRatio: '1 : 33.1 (3.01%)',
        accreditation: 'Unggul',
        careerProspects: ['Dokter Spesialis', 'Peneliti Klinis', 'Dokter Rumah Sakit'],
        specialRequirements: 'Bebas Buta Warna'
      },
      {
        id: 'ub-filkom-ti',
        code: '391015',
        name: 'Teknik Informatika (FILKOM UB)',
        faculty: 'Fakultas Ilmu Komputer',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 694,
        quota: 80,
        applicantsLastYear: 2200,
        tightnessRatio: '1 : 27.5 (3.63%)',
        accreditation: 'Unggul',
        careerProspects: ['Mobile App Developer', 'Cloud Engineer', 'Web Architect']
      },
      {
        id: 'ub-fh-hukum',
        code: '392001',
        name: 'Ilmu Hukum (FH UB)',
        faculty: 'Fakultas Hukum',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 685,
        quota: 180,
        applicantsLastYear: 3200,
        tightnessRatio: '1 : 17.7 (5.62%)',
        accreditation: 'Unggul',
        careerProspects: ['Corporate In-House Counsel', 'Jaksa Penuntut', 'Notaris / PPAT']
      },
      {
        id: 'ub-feb-akt',
        code: '392005',
        name: 'Akuntansi (FEB UB)',
        faculty: 'FEB UB',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 680,
        quota: 110,
        applicantsLastYear: 2100,
        tightnessRatio: '1 : 19.0 (5.23%)',
        accreditation: 'Unggul & ABEST21',
        careerProspects: ['Akuntan Publik', 'Financial Controller', 'Tax Specialist']
      }
    ]
  },
  {
    id: 'ptn-uns',
    name: 'Universitas Sebelas Maret',
    shortName: 'UNS',
    city: 'Surakarta / Solo',
    province: 'Jawa Tengah',
    ranking: 10,
    accreditation: 'Unggul',
    badge: 'Benteng Budaya & Inovasi Akademik',
    logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    website: 'https://uns.ac.id',
    description: 'Universitas terkemuka di Kota Solo dengan keunggulan riset baterai litium nasional, kedokteran, seni rupa, dan sains terapan.',
    clusters: ['SAINTEK', 'SOSHUM'],
    accentColor: 'emerald',
    majors: [
      {
        id: 'uns-fk-dokter',
        code: '401001',
        name: 'Kedokteran (FK UNS)',
        faculty: 'Fakultas Kedokteran',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 718,
        quota: 75,
        applicantsLastYear: 2750,
        tightnessRatio: '1 : 36.6 (2.72%)',
        accreditation: 'Unggul',
        careerProspects: ['Dokter Spesialis', 'Peneliti Medis', 'Klinisi RS UNS'],
        specialRequirements: 'Bebas Buta Warna Total & Parsial'
      },
      {
        id: 'uns-fmipa-if',
        code: '401008',
        name: 'Informatika (FMIPA UNS)',
        faculty: 'FMIPA UNS',
        degree: 'S1',
        cluster: 'SAINTEK',
        passingGrade: 686,
        quota: 50,
        applicantsLastYear: 1600,
        tightnessRatio: '1 : 32.0 (3.12%)',
        accreditation: 'Unggul',
        careerProspects: ['Software Engineer', 'Data Scientist', 'Network Specialist']
      },
      {
        id: 'uns-feb-mnj',
        code: '402001',
        name: 'Manajemen (FEB UNS)',
        faculty: 'FEB UNS',
        degree: 'S1',
        cluster: 'SOSHUM',
        passingGrade: 678,
        quota: 85,
        applicantsLastYear: 2350,
        tightnessRatio: '1 : 27.6 (3.61%)',
        accreditation: 'Unggul',
        careerProspects: ['Corporate Planner', 'Digital Marketer', 'Entrepreneur']
      }
    ]
  }
];

// Helper functions for localStorage persistence
export function loadStoredSnbtCampuses(): SnbtCampusItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNBT_CAMPUSES);
    if (!raw) return DEFAULT_SNBT_CAMPUSES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load stored SNBT campuses:', err);
  }
  return DEFAULT_SNBT_CAMPUSES;
}

export function saveStoredSnbtCampuses(campuses: SnbtCampusItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNBT_CAMPUSES, JSON.stringify(campuses));
  } catch (err) {
    console.error('Failed to save SNBT campuses:', err);
  }
}

export function resetDefaultSnbtCampuses(): SnbtCampusItem[] {
  try {
    localStorage.setItem(STORAGE_KEY_SNBT_CAMPUSES, JSON.stringify(DEFAULT_SNBT_CAMPUSES));
  } catch (err) {
    console.error('Failed to reset SNBT campuses:', err);
  }
  return DEFAULT_SNBT_CAMPUSES;
}
