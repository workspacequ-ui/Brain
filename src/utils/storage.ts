import {
  User,
  Teacher,
  ClassItem,
  SubjectItem,
  ExamCategory,
  LearningMaterial,
  Exam,
  MarketplaceProduct,
  MarketplaceCategory,
  ExamResult,
  FeaturedProgram,
  InstitutionInfo,
  KopSuratSettings,
  CustomPageLabels,
  CustomNavLabels,
  CustomButtonLabels,
  AppSettings,
  SyllabusItem,
  AgendaItem,
  AnnouncementItem,
  resolveExamType
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_MATERIALS,
  INITIAL_EXAMS,
  INITIAL_PRODUCTS,
  INITIAL_MARKETPLACE_CATEGORIES,
  INITIAL_RESULTS,
  INITIAL_FEATURED_PROGRAMS,
  INITIAL_SYLLABI,
  INITIAL_AGENDAS,
  INITIAL_ANNOUNCEMENTS
} from '../data/mockData';

export const KEYS = {
  USERS: 'bsa_users',
  TEACHERS: 'bsa_teachers',
  CLASSES: 'bsa_classes',
  SUBJECTS: 'bsa_subjects',
  CATEGORIES: 'bsa_categories',
  MATERIALS: 'bsa_materials',
  EXAMS: 'bsa_exams',
  PRODUCTS: 'bsa_products',
  MARKETPLACE_CATEGORIES: 'bsa_mkt_categories',
  RESULTS: 'bsa_results',
  FEATURED_PROGRAMS: 'bsa_featured_programs',
  CURRENT_USER: 'bsa_current_user',
  INSTITUTION: 'bsa_institution_info',
  SETTINGS: 'bsa_app_settings',
  SYLLABUS: 'bsa_syllabus',
  AGENDAS: 'bsa_agendas',
  ANNOUNCEMENTS: 'bsa_announcements'
};


// In-memory fallback store to ensure seamless state preservation even if localStorage quota is exceeded
const memoryFallbackStore = new Map<string, string>();

function tryClearStorageQuota(): boolean {
  try {
    // 1. Remove unnecessary temporary keys or caches
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('bsa_temp_') || k.startsWith('bsa_cache_') || k.startsWith('tmp_') || k.includes('log_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 2. If bsa_institution_info is taking space, we can remove it because bsa_app_settings.institution is the source of truth
    const settingsStr = localStorage.getItem(KEYS.SETTINGS);
    if (settingsStr) {
      localStorage.removeItem(KEYS.INSTITUTION);
    }

    // 3. Prune old exam results if exceeding 20 items
    const rawResults = localStorage.getItem(KEYS.RESULTS);
    if (rawResults) {
      try {
        const results = JSON.parse(rawResults);
        if (Array.isArray(results) && results.length > 20) {
          const trimmed = results.slice(0, 20);
          localStorage.setItem(KEYS.RESULTS, JSON.stringify(trimmed));
        }
      } catch (e) {
        // ignore
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Self-healing check for legacy bloated base64 entries
export function cleanBloatedStorageData(): void {
  try {
    // If bsa_institution_info has massive uncompressed string (> 100KB), strip or clean it
    const instStr = localStorage.getItem(KEYS.INSTITUTION);
    if (instStr && instStr.length > 100 * 1024) {
      try {
        const inst = JSON.parse(instStr);
        if (inst.logoUrl && inst.logoUrl.length > 80 * 1024) {
          inst.logoUrl = '';
        }
        if (inst.stampUrl && inst.stampUrl.length > 80 * 1024) {
          inst.stampUrl = '';
        }
        if (inst.signatureUrl && inst.signatureUrl.length > 80 * 1024) {
          inst.signatureUrl = '';
        }
        localStorage.setItem(KEYS.INSTITUTION, JSON.stringify(inst));
      } catch (_) {
        localStorage.removeItem(KEYS.INSTITUTION);
      }
    }

    // Clean bloated settings if needed
    const settStr = localStorage.getItem(KEYS.SETTINGS);
    if (settStr && settStr.length > 200 * 1024) {
      try {
        const sett = JSON.parse(settStr);
        if (sett.institution?.logoUrl && sett.institution.logoUrl.length > 80 * 1024) {
          sett.institution.logoUrl = '';
        }
        if (sett.institution?.stampUrl && sett.institution.stampUrl.length > 80 * 1024) {
          sett.institution.stampUrl = '';
        }
        if (sett.institution?.signatureUrl && sett.institution.signatureUrl.length > 80 * 1024) {
          sett.institution.signatureUrl = '';
        }
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(sett));
      } catch (_) {
        // ignore
      }
    }
  } catch (_) {
    // ignore
  }
}

// Helper for initial load with fallback
export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    let item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      item = memoryFallbackStore.get(key) || null;
    }
    if (!item || item === 'undefined' || item === 'null') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    const inMem = memoryFallbackStore.get(key);
    if (inMem) {
      try {
        return JSON.parse(inMem);
      } catch (_) {}
    }
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  const jsonString = JSON.stringify(value);
  // Always update in-memory cache for uninterrupted state availability
  memoryFallbackStore.set(key, jsonString);

  try {
    localStorage.setItem(key, jsonString);
  } catch (e: any) {
    const isQuotaError = e && (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014
    );

    if (isQuotaError) {
      tryClearStorageQuota();
      try {
        localStorage.setItem(key, jsonString);
      } catch (retryErr) {
        console.warn(`Storage quota full for key "${key}". Maintained securely in application session memory.`);
      }
    } else {
      console.warn(`Notice updating ${key} in localStorage`, e);
    }
  }

  // Do not sync client-only transient session keys (e.g. current logged in user) to shared database
  if (key === KEYS.CURRENT_USER || key.startsWith('bsa_session_')) {
    return;
  }

  // Asynchronous real-time background sync to Neon DB server
  try {
    const payload = value !== undefined ? value : null;
    fetch(`/api/neon/set-store/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Ignore background sync errors if offline or database URL not configured
    });
  } catch (_) {}
}

// Initialize default seed data if missing
export function initStorage(): void {
  // 0. Auto-clean any bloated legacy storage items from previous sessions
  cleanBloatedStorageData();

  if (!localStorage.getItem(KEYS.USERS)) {
    setStoredItem(KEYS.USERS, INITIAL_USERS);
  } else {
    // Ensure all initial teachers and admin accounts are present with credentials
    const currentUsers = getStoredItem<User[]>(KEYS.USERS, []);
    const existingEmails = new Set(currentUsers.map(u => u.email.toLowerCase().trim()));
    let hasUserUpdates = false;
    const mergedUsers = [...currentUsers];

    INITIAL_USERS.forEach(initUser => {
      if (!existingEmails.has(initUser.email.toLowerCase().trim())) {
        mergedUsers.push(initUser);
        hasUserUpdates = true;
      }
    });

    // Populate missing username, password, whatsapp / group on existing user records
    const updatedUsers = mergedUsers.map(u => {
      let mod = false;
      const copy = { ...u };
      const matched = INITIAL_USERS.find(iu => iu.nis === copy.nis || iu.email.toLowerCase() === copy.email.toLowerCase() || iu.id === copy.id);
      
      if (!copy.username && matched?.username) {
        copy.username = matched.username;
        mod = true;
      }
      if (!copy.password) {
        copy.password = matched?.password || (copy.role === 'admin' ? 'admin123' : copy.role === 'teacher' ? 'guru123' : 'user123');
        mod = true;
      }
      if (!copy.whatsapp && copy.phone) {
        copy.whatsapp = copy.phone;
        mod = true;
      } else if (!copy.whatsapp && copy.role === 'student') {
        copy.whatsapp = matched?.whatsapp || `0812${Math.floor(10000000 + Math.random() * 90000000)}`;
        mod = true;
      }
      if (!copy.group && copy.role === 'student') {
        copy.group = matched?.group || (copy.className === 'XII-UTBK' ? 'Kelompok 1 - Alpha (UTBK)' : copy.className === 'XI-IPA' ? 'Kelompok 2 - Einstein' : 'Kelompok 3 - Galileo');
        mod = true;
      }
      if (mod) hasUserUpdates = true;
      return copy;
    });

    if (hasUserUpdates) {
      setStoredItem(KEYS.USERS, updatedUsers);
    }
  }

  if (!localStorage.getItem(KEYS.TEACHERS)) {
    setStoredItem(KEYS.TEACHERS, INITIAL_TEACHERS);
  } else {
    // Ensure existing teachers have default username & password
    const currentTeachers = getStoredItem<Teacher[]>(KEYS.TEACHERS, []);
    let updatedTch = false;
    const syncedTeachers = currentTeachers.map(t => {
      let mod = false;
      const tCopy = { ...t };
      if (!tCopy.password) {
        tCopy.password = 'guru123';
        mod = true;
      }
      if (!tCopy.username) {
        tCopy.username = tCopy.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || tCopy.nip;
        mod = true;
      }
      if (mod) updatedTch = true;
      return tCopy;
    });

    if (updatedTch) {
      setStoredItem(KEYS.TEACHERS, syncedTeachers);
    }
  }
  if (!localStorage.getItem(KEYS.CLASSES)) {
    setStoredItem(KEYS.CLASSES, INITIAL_CLASSES);
  } else {
    // Merge missing initial classes like SMP-LABSCHOOL, SMA-LABSCHOOL, VI-SD, IX-SMP, XII-SMA
    const currentClasses = getStoredItem<ClassItem[]>(KEYS.CLASSES, []);
    const existingCodes = new Set(currentClasses.map(c => c.code.toLowerCase().trim()));
    let hasNewClass = false;
    const mergedClasses = [...currentClasses];
    INITIAL_CLASSES.forEach(initCls => {
      if (!existingCodes.has(initCls.code.toLowerCase().trim())) {
        mergedClasses.push(initCls);
        hasNewClass = true;
      }
    });
    if (hasNewClass) {
      setStoredItem(KEYS.CLASSES, mergedClasses);
    }
  }
  if (!localStorage.getItem(KEYS.SUBJECTS)) {
    setStoredItem(KEYS.SUBJECTS, INITIAL_SUBJECTS);
  } else {
    // Merge any missing initial subjects to maintain complete curriculum mapping
    const currentSubjects = getStoredItem<SubjectItem[]>(KEYS.SUBJECTS, []);
    const existingSubjectCodes = new Set(currentSubjects.map(s => s.code.toLowerCase().trim()));
    let hasNewSubject = false;
    const mergedSubjects = [...currentSubjects];
    INITIAL_SUBJECTS.forEach(initSbj => {
      if (!existingSubjectCodes.has(initSbj.code.toLowerCase().trim())) {
        mergedSubjects.push(initSbj);
        hasNewSubject = true;
      }
    });
    if (hasNewSubject) {
      setStoredItem(KEYS.SUBJECTS, mergedSubjects);
    }
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    setStoredItem(KEYS.CATEGORIES, sanitizeCategories(INITIAL_CATEGORIES));
  } else {
    // Merge any missing initial categories to maintain integration without duplicate IDs or duplicate names
    const currentCats = getStoredItem<ExamCategory[]>(KEYS.CATEGORIES, []);
    const merged = sanitizeCategories([...currentCats, ...INITIAL_CATEGORIES]);
    setStoredItem(KEYS.CATEGORIES, merged);
  }
  if (!localStorage.getItem(KEYS.MATERIALS)) {
    setStoredItem(KEYS.MATERIALS, INITIAL_MATERIALS);
  }
  if (!localStorage.getItem(KEYS.EXAMS)) {
    setStoredItem(KEYS.EXAMS, INITIAL_EXAMS);
  } else {
    // Merge any missing initial exams and ensure examType & tryoutSubType are populated
    const currentExams = getStoredItem<Exam[]>(KEYS.EXAMS, []);
    const existingIds = new Set(currentExams.map(e => e.id));
    let hasExamChanges = false;
    const mergedExams = currentExams.map(e => {
      let updated = { ...e };
      const initMatch = INITIAL_EXAMS.find(ie => ie.id === e.id);
      
      if (!updated.examType) {
        const resolved = resolveExamType(updated);
        updated.examType = resolved.mainType;
        updated.tryoutSubType = resolved.tryoutSubType;
        hasExamChanges = true;
      }
      
      // If matching initial exam has defined tryoutSubType / targetClass, sync it
      if (initMatch && initMatch.examType === 'TRYOUT') {
        if (initMatch.tryoutSubType && updated.tryoutSubType !== initMatch.tryoutSubType) {
          updated.tryoutSubType = initMatch.tryoutSubType;
          hasExamChanges = true;
        }
        if (initMatch.targetClass && updated.targetClass !== initMatch.targetClass) {
          updated.targetClass = initMatch.targetClass;
          hasExamChanges = true;
        }
      }
      return updated;
    });

    INITIAL_EXAMS.forEach(initEx => {
      if (!existingIds.has(initEx.id)) {
        mergedExams.push(initEx);
        hasExamChanges = true;
      }
    });

    if (hasExamChanges) {
      setStoredItem(KEYS.EXAMS, mergedExams);
    }
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    setStoredItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(KEYS.MARKETPLACE_CATEGORIES)) {
    setStoredItem(KEYS.MARKETPLACE_CATEGORIES, INITIAL_MARKETPLACE_CATEGORIES);
  }
  if (!localStorage.getItem(KEYS.RESULTS)) {
    setStoredItem(KEYS.RESULTS, INITIAL_RESULTS);
  }
  if (!localStorage.getItem(KEYS.SYLLABUS)) {
    setStoredItem(KEYS.SYLLABUS, INITIAL_SYLLABI);
  } else {
    // Merge any missing initial syllabi or replace outdated mock structures
    const currentSyllabi = getStoredItem<SyllabusItem[]>(KEYS.SYLLABUS, []);
    const existingIds = new Set(currentSyllabi.map(s => s.id));
    let hasNew = false;
    const merged = currentSyllabi.map(cur => {
      // If there is an updated matching initial syllabus with full topics, sync it
      const matchInit = INITIAL_SYLLABI.find(init => init.id === cur.id);
      if (matchInit) {
        let changed = false;
        let updated = { ...cur };
        if ((cur.topics?.length || 0) < (matchInit.topics?.length || 0)) {
          updated = { ...updated, ...matchInit };
          changed = true;
        }
        if (matchInit.snbtSubtestCode && !cur.snbtSubtestCode) {
          updated.snbtSubtestCode = matchInit.snbtSubtestCode;
          updated.snbtCategory = matchInit.snbtCategory;
          changed = true;
        }
        if (changed) {
          hasNew = true;
          return updated;
        }
      }
      return cur;
    });

    INITIAL_SYLLABI.forEach(initSil => {
      if (!existingIds.has(initSil.id)) {
        merged.push(initSil);
        hasNew = true;
      }
    });
    if (hasNew) {
      setStoredItem(KEYS.SYLLABUS, merged);
    }
  }
  if (!localStorage.getItem(KEYS.AGENDAS)) {
    setStoredItem(KEYS.AGENDAS, INITIAL_AGENDAS);
  }
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    setStoredItem(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }
}

// Session User Management
export function getCurrentUser(): User | null {
  return getStoredItem<User | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setStoredItem(KEYS.CURRENT_USER, user);
}

// Users CRUD & Validation
export function getUsers(): User[] {
  return getStoredItem<User[]>(KEYS.USERS, INITIAL_USERS);
}

export function saveUsers(users: User[]): void {
  setStoredItem(KEYS.USERS, users);
}

export function updateUserStatus(userId: string, status: 'ACTIVE' | 'REJECTED'): User[] {
  const users = getUsers();
  const updated = users.map(u => (u.id === userId ? { ...u, status } : u));
  saveUsers(updated);
  return updated;
}

export function saveUser(user: User): User[] {
  const users = getUsers();
  const existingIdx = users.findIndex(u => u.id === user.id);
  let updated: User[];
  if (existingIdx >= 0) {
    updated = [...users];
    updated[existingIdx] = user;
  } else {
    updated = [user, ...users];
  }
  saveUsers(updated);
  return updated;
}

export function deleteUser(userId: string): User[] {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  return users;
}

// Teachers CRUD
export function getTeachers(): Teacher[] {
  return getStoredItem<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
}

export function saveTeachers(teachers: Teacher[]): void {
  setStoredItem(KEYS.TEACHERS, teachers);
}

export function saveTeacher(teacher: Teacher): Teacher[] {
  const teachers = getTeachers();
  const existingIdx = teachers.findIndex(t => t.id === teacher.id);
  let updated: Teacher[];
  if (existingIdx >= 0) {
    updated = [...teachers];
    updated[existingIdx] = teacher;
  } else {
    updated = [teacher, ...teachers];
  }
  saveTeachers(updated);

  // Sync to users collection so teacher can log in
  const teacherUser: User = {
    id: teacher.id,
    nis: teacher.nip,
    username: teacher.username || teacher.nip,
    name: teacher.name,
    email: teacher.email,
    password: teacher.password || 'guru123',
    role: 'teacher',
    className: teacher.targetClasses?.[0] || 'SEMUA',
    subject: teacher.subject,
    targetClasses: teacher.targetClasses || ['SEMUA'],
    phone: teacher.phone,
    status: teacher.status === 'ACTIVE' ? 'ACTIVE' : 'REJECTED',
    createdAt: teacher.createdAt,
    avatar: teacher.avatar,
    bio: teacher.bio
  };
  saveUser(teacherUser);

  return updated;
}

export function deleteTeacher(teacherId: string): Teacher[] {
  const teachers = getTeachers().filter(t => t.id !== teacherId);
  saveTeachers(teachers);
  deleteUser(teacherId);
  return teachers;
}

// Classes CRUD
export function getClasses(): ClassItem[] {
  return getStoredItem<ClassItem[]>(KEYS.CLASSES, INITIAL_CLASSES);
}

export function saveClasses(classes: ClassItem[]): void {
  setStoredItem(KEYS.CLASSES, classes);
}

// Subjects CRUD (Pengaturan Mata Pelajaran)
export function getSubjects(): SubjectItem[] {
  return getStoredItem<SubjectItem[]>(KEYS.SUBJECTS, INITIAL_SUBJECTS);
}

export function saveSubjects(subjects: SubjectItem[]): void {
  setStoredItem(KEYS.SUBJECTS, subjects);
}

export function saveSubject(subject: SubjectItem): SubjectItem[] {
  const subjects = getSubjects();
  const existingIdx = subjects.findIndex(s => s.id === subject.id);
  let updated: SubjectItem[];
  if (existingIdx >= 0) {
    updated = [...subjects];
    updated[existingIdx] = subject;
  } else {
    updated = [subject, ...subjects];
  }
  saveSubjects(updated);
  return updated;
}

export function deleteSubject(subjectId: string): SubjectItem[] {
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  saveSubjects(subjects);
  return subjects;
}

// Categories CRUD & Deduplication
export function sanitizeCategories(categories: ExamCategory[]): ExamCategory[] {
  if (!Array.isArray(categories)) return INITIAL_CATEGORIES;
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: ExamCategory[] = [];

  categories.forEach((cat, index) => {
    if (!cat || typeof cat !== 'object') return;
    const rawName = (cat.name || '').trim();
    if (!rawName) return;
    const nameKey = rawName.toLowerCase();

    // Deduplicate by name first (case-insensitive)
    if (seenNames.has(nameKey)) {
      return;
    }
    seenNames.add(nameKey);

    // Guarantee unique ID
    let rawId = (cat.id || '').trim();
    if (!rawId || seenIds.has(rawId)) {
      const slug = nameKey.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `item-${index}`;
      rawId = `cat-${slug}`;
      let counter = 1;
      while (seenIds.has(rawId)) {
        rawId = `cat-${slug}-${counter++}`;
      }
    }
    seenIds.add(rawId);

    result.push({
      id: rawId,
      name: rawName,
      description: (cat.description || '').trim() || 'Kelompok / Kategori pembelajaran & evaluasi terpadu'
    });
  });

  return result.length > 0 ? result : INITIAL_CATEGORIES;
}

export function getCategories(): ExamCategory[] {
  const raw = getStoredItem<ExamCategory[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  return sanitizeCategories(raw);
}

export function saveCategories(categories: ExamCategory[]): void {
  const sanitized = sanitizeCategories(categories);
  setStoredItem(KEYS.CATEGORIES, sanitized);
}

// Materials CRUD
export function getMaterials(): LearningMaterial[] {
  return getStoredItem<LearningMaterial[]>(KEYS.MATERIALS, INITIAL_MATERIALS);
}

export function saveMaterials(materials: LearningMaterial[]): void {
  setStoredItem(KEYS.MATERIALS, materials);
}

// Exams CRUD
export function getExams(): Exam[] {
  return getStoredItem<Exam[]>(KEYS.EXAMS, INITIAL_EXAMS);
}

export function saveExams(exams: Exam[]): void {
  setStoredItem(KEYS.EXAMS, exams);
}

// Products CRUD
export function getProducts(): MarketplaceProduct[] {
  return getStoredItem<MarketplaceProduct[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function saveProducts(products: MarketplaceProduct[]): void {
  setStoredItem(KEYS.PRODUCTS, products);
}

// Marketplace Categories CRUD
export function getMarketplaceCategories(): MarketplaceCategory[] {
  return getStoredItem<MarketplaceCategory[]>(KEYS.MARKETPLACE_CATEGORIES, INITIAL_MARKETPLACE_CATEGORIES);
}

export function saveMarketplaceCategories(categories: MarketplaceCategory[]): void {
  setStoredItem(KEYS.MARKETPLACE_CATEGORIES, categories);
}

// Results CRUD
export function getResults(): ExamResult[] {
  return getStoredItem<ExamResult[]>(KEYS.RESULTS, INITIAL_RESULTS);
}

export function saveResults(results: ExamResult[]): void {
  setStoredItem(KEYS.RESULTS, results);
}

export function addExamResult(result: ExamResult): ExamResult[] {
  const current = getResults();
  const updated = [result, ...current];
  saveResults(updated);
  return updated;
}

// Featured Programs CRUD
export function getFeaturedPrograms(): FeaturedProgram[] {
  return getStoredItem<FeaturedProgram[]>(KEYS.FEATURED_PROGRAMS, INITIAL_FEATURED_PROGRAMS);
}

export function saveFeaturedPrograms(programs: FeaturedProgram[]): void {
  setStoredItem(KEYS.FEATURED_PROGRAMS, programs);
}

// Syllabus CRUD
export function getSyllabi(): SyllabusItem[] {
  return getStoredItem<SyllabusItem[]>(KEYS.SYLLABUS, INITIAL_SYLLABI);
}

export function saveSyllabi(syllabi: SyllabusItem[]): void {
  setStoredItem(KEYS.SYLLABUS, syllabi);
}

export function saveSyllabus(syllabus: SyllabusItem): SyllabusItem[] {
  const list = getSyllabi();
  const existingIdx = list.findIndex(s => s.id === syllabus.id);
  let updated: SyllabusItem[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = {
      ...syllabus,
      updatedAt: new Date().toISOString().split('T')[0]
    };
  } else {
    updated = [{
      ...syllabus,
      createdAt: syllabus.createdAt || new Date().toISOString().split('T')[0]
    }, ...list];
  }
  saveSyllabi(updated);
  return updated;
}

export function deleteSyllabus(syllabusId: string): SyllabusItem[] {
  const list = getSyllabi().filter(s => s.id !== syllabusId);
  saveSyllabi(list);
  return list;
}

export const DEFAULT_INSTITUTION: InstitutionInfo = {
  name: 'BRAIN SPACE ACADEMY',
  subtitle: 'CBT & LMS SMART ACADEMY',
  motto: 'Solusi Cerdas Menuju Sukses PTN & Sekolah Unggulan',
  address: 'Jl. Pendidikan Nasional No. 88, Kebayoran Baru, Jakarta Selatan 12160',
  phone: '(021) 7890-1234',
  whatsapp: '0812-3456-7890',
  email: 'info@brainspace.academy',
  website: 'https://brainspace.academy',
  city: 'Jakarta Selatan',
  principalName: 'Dr. H. Hendra Wijaya, M.Pd.',
  principalNip: 'NIP. 19850714 201001 1 008',
  signatureUrl: '',
  stampUrl: '',
  logoUrl: '',
  logoFullArea: true,
  logoFit: 'contain',
  logoShape: 'rounded',
  logoSize: 'normal',
  logoBgColor: 'transparent',
  logoBorder: true,
  logoPadding: 'none'
};

export const DEFAULT_KOP_SETTINGS: KopSuratSettings = {
  enabled: true,
  institutionHeader: 'YAYASAN PENDIDIKAN BRAIN SPACE UTAMA',
  institutionName: 'BRAIN SPACE ACADEMY & UTBK CENTER',
  subHeader: 'PUSAT BIMBINGAN BELAJAR, CBT & EVALUASI STANDAR NASIONAL',
  addressLine1: 'Jl. Pendidikan Nasional No. 88, Kebayoran Baru, Jakarta Selatan 12160',
  addressLine2: 'Telp: (021) 7890-1234 • Hotline/WA: 0812-3456-7890 • Email: info@brainspace.academy',
  website: 'Website: https://brainspace.academy',
  borderStyle: 'double',
  showLogoLeft: true,
  showLogoRight: true,
  logoRightUrl: '',
  showSignatureSection: true,
  cityLocation: 'Jakarta Selatan',
  signerTitle: 'Kepala Lembaga / Penanggung Jawab Akademik',
  signerName: 'Dr. H. Hendra Wijaya, M.Pd.',
  signerNip: 'NIP. 19850714 201001 1 008',
  documentFooterNote: 'Dokumen ini sah dan diterbitkan secara resmi melalui Sistem Informasi Akademik & CBT Brain Space Academy.'
};

export const DEFAULT_PAGE_LABELS: CustomPageLabels = {
  overview: {
    title: 'Dashboard Utama Admin',
    description: 'Pusat kendali operasional, agenda kalender akademik, statistik siswa, dan pemantauan sistem LMS CBT'
  },
  validation: {
    title: 'Validasi User Baru',
    description: 'Persetujuan dan verifikasi pendaftaran akun siswa baru sebelum dapat mengakses sistem ujian'
  },
  students: {
    title: 'Pengelola Data Siswa',
    description: 'Manajemen direktori siswa, distribusi kelas bimbingan, nomor kontak WhatsApp, dan status keaktifan'
  },
  teachers: {
    title: 'Pengelola Data Guru',
    description: 'Manajemen akun guru pengampu, mata pelajaran, penugasan kelas binaan, dan kredensial login'
  },
  admins: {
    title: 'Data Pengelola Admin',
    description: 'Manajemen hak akses administrator dan operator sistem institusi'
  },
  academic: {
    title: 'Pusat Manajemen & Layanan Akademik',
    description: 'Integrasi kalender akademik, jadwal agenda kegiatan, kurikulum terpadu, dan pengumuman resmi'
  },
  classes: {
    title: 'Kelas & Mapel',
    description: 'Pengaturan tingkatan kelas bimbingan, kelompok mata pelajaran, dan kategori ujian'
  },
  syllabus: {
    title: 'Silabus & Perencanaan Kurikulum',
    description: 'Penyusunan alur pembelajaran per pertemuan, capaian kompetensi, modul bahan tayang, dan CBT evaluasi'
  },
  materials: {
    title: 'Pengelola Materi Pembelajaran',
    description: 'Bank materi modul PDF, video pembelajaran, presentasi PPT, dan integrasi Google Drive'
  },
  exams: {
    title: 'Ujian',
    description: 'Pembuatan dan penjadwalan paket ujian CBT interaktif, Bank Soal HOTS, dan mode Google Drive PDF'
  },
  marketplace: {
    title: 'Marketplace',
    description: 'Katalog buku panduan belajar, modul bimbel, paket merchandise, dan fasilitas pendaftaran'
  },
  programs: {
    title: 'Manajemen Program Unggulan',
    description: 'Publikasi program intensif, bimbingan kedinasan, dan paket persiapan masuk PTN/sekolah favorit'
  },
  reports: {
    title: 'Laporan',
    description: 'Rekapitulasi hasil ujian, analisis statistik butir soal, passing grade KKM, dan grafik prestasi'
  },
  tryout_reports: {
    title: 'Laporan & Analisis Tryout Siswa',
    description: 'Laporan detail peringkat tryout, skor persentase penguasaan, dan riwayat pengerjaan siswa'
  },
  history: {
    title: 'Riwayat & Hasil Ujian',
    description: 'Rekapitulasi nilai ujian yang telah dikerjakan beserta pembahasan dan analisis hasil evaluasi'
  },
  labschool_overview: {
    title: 'Dashboard-Labs',
    description: 'Pusat informasi dan persiapan komprehensif seleksi PSB SMP & SMA Labschool'
  },
  labschool_silabus: {
    title: 'Modul & Silabus Labschool',
    description: 'Timeline kurikulum belajar, materi terpadu, dan pokok bahasan seleksi masuk Labschool'
  },
  labschool_kampus: {
    title: 'Kampus Labschool',
    description: 'Direktori profil kampus Labschool (Rawamangun, Kebayoran, Cibubur, Cirendeu)'
  },
  labschool_roadmap: {
    title: 'ROADMAP Strategis Labschool',
    description: 'Peta jalan dan tahapan persiapan intensif menuju kelulusan tes seleksi'
  },
  labschool_psb_smp: {
    title: 'PSB SMP LABSCHOOL',
    description: 'Modul latihan soal, simulasi CBT, dan database peminat PSB SMP Labschool'
  },
  labschool_psb_sma: {
    title: 'PSB SMA LABSCHOOL',
    description: 'Simulasi ujian seleksi masuk SMA Labschool dan pemetaan daya tampung'
  },
  labschool_laporan: {
    title: 'LAPORAN & ANALISIS Labschool',
    description: 'Laporan evaluasi performa tryout dan generator pesan WhatsApp progres siswa ke wali murid'
  },
  snbt_dashboard: {
    title: 'SNBT-Dashboard',
    description: 'Pusat komando persiapan UTBK-SNBT 2026, live countdown timer, dan monitoring 7 subtes'
  },
  snbt_syllabus: {
    title: 'Silabus & Modul SNBT',
    description: 'Blueprint 7 subtes SNPMB BPPP, modul pokok bahasan, dan timeline belajar mingguan'
  },
  snbt_students: {
    title: 'Data Siswa XII-UTBK',
    description: 'Database siswa kelas XII pejuang SNBT, kelompok belajar, dan sinkronisasi akun SNPMB'
  },
  snbt_campus: {
    title: 'Pilihan Kampus & Passing Grade PTN',
    description: 'Direktori program studi PTN terbaik, daya tampung SNPMB, dan pemetaan skor IRT'
  },
  snbt_roadmap: {
    title: 'ROADMAP Strategis SNBT',
    description: 'Roadmap bertahap, countdown H-menuju UTBK, dan strategi lolos pilihan 1 & 2'
  },
  snbt_countdown: {
    title: 'Countdown Menuju UTBK-SNBT 2026',
    description: 'Penghitung mundur waktu ujian gelombang 1 & 2 beserta pengingat jadwal pendaftaran'
  },
  snbt_reports: {
    title: 'Analisis & Laporan SNBT',
    description: 'Laporan hasil tryout IRT, analisis kelemahan 7 subtes, rapor resmi cetak PDF, dan notifikasi WA'
  },
  teacher_overview: {
    title: 'Dashboard Guru',
    description: 'Pusat kegiatan mengajar, pemantauan kelas binaan, pembuatan soal, dan rekapitulasi nilai siswa'
  },
  student_overview: {
    title: 'Dashboard Siswa',
    description: 'Selamat datang di ruang belajar cerdas, pantau jadwal ujian, modul materi, dan progres tryout'
  },
  settings: {
    title: 'Pusat Pengaturan',
    description: 'Kustomisasi identitas lembaga, kop surat resmi cetak, judul halaman, label menu navigasi, dan tombol sistem'
  }
};

export const DEFAULT_NAV_LABELS: CustomNavLabels = {
  overview: 'Dashboard Utama',
  user_management: 'Manajemen User',
  validation: 'Validasi User Baru',
  students: 'Pengelola Data Siswa',
  teachers: 'Pengelola Data Guru',
  admins: 'Data Pengelola Admin',
  academic_group: 'Akademik',
  academic: 'Pusat & Kalender Akademik',
  classes: 'Kelas & Mapel',
  syllabus: 'Silabus',
  materials: 'Materi Pembelajaran',
  exams: 'Ujian',
  marketplace: 'Marketplace',
  programs: 'Program Unggulan',
  reports: 'Laporan',
  tryout_reports: 'Laporan Tryout',
  history: 'Riwayat & Hasil',
  labschool_group: 'LABSCHOOL',
  labschool_overview: 'Dashboard-Labs',
  labschool_silabus: 'Modul & Silabus',
  labschool_kampus: 'Kampus Labschool',
  labschool_roadmap: 'ROADMAP',
  labschool_psb_smp: 'PSB SMP LABSCHOOL',
  labschool_psb_sma: 'PSB SMA LABSCHOOL',
  labschool_laporan: 'LAPORAN & ANALISIS',
  snbt_group: 'SNBT / UTBK',
  snbt_dashboard: 'SNBT-Dashboard',
  snbt_syllabus: 'Silabus & Modul SNBT',
  snbt_students: 'Data Siswa XII-UTBK',
  snbt_campus: 'Pilihan Kampus',
  snbt_roadmap: 'ROADMAP-SNBT',
  snbt_reports: 'Laporan & Analisis',
  settings: 'Pusat Pengaturan'
};

export const DEFAULT_BUTTON_LABELS: CustomButtonLabels = {
  btnSave: 'Simpan Perubahan',
  btnAdd: 'Tambah Data',
  btnCancel: 'Batal',
  btnDelete: 'Hapus',
  btnEdit: 'Edit',
  btnPrint: 'Cetak / Simpan PDF',
  btnExport: 'Ekspor Data',
  btnFilter: 'Filter Data',
  btnReset: 'Reset Filter',
  btnStartExam: 'Mulai Kerjakan Ujian',
  btnSubmitExam: 'Selesaikan Ujian',
  btnDoubtful: 'Ragu-Ragu',
  btnPrevQuestion: 'Soal Sebelumnya',
  btnNextQuestion: 'Soal Selanjutnya',
  btnDownloadMaterial: 'Download Modul',
  btnApproveUser: 'Setujui Akun',
  btnRejectUser: 'Tolak Pendaftaran',
  btnSearch: 'Cari Data...'
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  institution: DEFAULT_INSTITUTION,
  kopSurat: DEFAULT_KOP_SETTINGS,
  pageLabels: DEFAULT_PAGE_LABELS,
  navLabels: DEFAULT_NAV_LABELS,
  buttonLabels: DEFAULT_BUTTON_LABELS,
  updatedAt: new Date().toISOString().split('T')[0]
};

export function getAppSettings(): AppSettings {
  const stored = getStoredItem<AppSettings>(KEYS.SETTINGS, DEFAULT_APP_SETTINGS);
  
  // Also merge with legacy or existing institution info if present
  const legacyInst = getStoredItem<InstitutionInfo>(KEYS.INSTITUTION, DEFAULT_INSTITUTION);

  return {
    ...DEFAULT_APP_SETTINGS,
    ...stored,
    institution: {
      ...DEFAULT_INSTITUTION,
      ...legacyInst,
      ...(stored?.institution || {})
    },
    kopSurat: {
      ...DEFAULT_KOP_SETTINGS,
      ...(stored?.kopSurat || {})
    },
    pageLabels: {
      ...DEFAULT_PAGE_LABELS,
      ...(stored?.pageLabels || {})
    },
    navLabels: {
      ...DEFAULT_NAV_LABELS,
      ...(stored?.navLabels || {})
    },
    buttonLabels: {
      ...DEFAULT_BUTTON_LABELS,
      ...(stored?.buttonLabels || {})
    }
  };
}

export function saveAppSettings(settings: AppSettings): AppSettings {
  const sanitized: AppSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  setStoredItem(KEYS.SETTINGS, sanitized);
  // Keep institution info in sync
  setStoredItem(KEYS.INSTITUTION, sanitized.institution);
  return sanitized;
}

export function resetAppSettings(): AppSettings {
  setStoredItem(KEYS.SETTINGS, DEFAULT_APP_SETTINGS);
  setStoredItem(KEYS.INSTITUTION, DEFAULT_INSTITUTION);
  return DEFAULT_APP_SETTINGS;
}

export function getInstitutionInfo(): InstitutionInfo {
  const settings = getAppSettings();
  return settings.institution;
}

export function saveInstitutionInfo(info: InstitutionInfo): InstitutionInfo {
  const currentSettings = getAppSettings();
  const updatedSettings: AppSettings = {
    ...currentSettings,
    institution: info,
    // Auto sync Kop Surat institution name if matching default
    kopSurat: {
      ...currentSettings.kopSurat,
      institutionName: info.name || currentSettings.kopSurat.institutionName,
      addressLine1: info.address || currentSettings.kopSurat.addressLine1,
      cityLocation: info.city || currentSettings.kopSurat.cityLocation,
      signerName: info.principalName || currentSettings.kopSurat.signerName,
      signerNip: info.principalNip || currentSettings.kopSurat.signerNip
    }
  };
  saveAppSettings(updatedSettings);
  return info;
}

// Master Data Synchronization & Integrity Clean Engine
export interface SyncResult {
  classes: ClassItem[];
  subjects: SubjectItem[];
  categories: ExamCategory[];
  teachers: Teacher[];
  syncedSubjectCount: number;
  syncedCategoryCount: number;
  syncedClassCount: number;
  syncedTeacherCount: number;
  repairedItems: string[];
}

export function syncAndCleanCurriculumData(): SyncResult {
  const currentCategories = getCategories();
  const currentClasses = getClasses();
  const currentSubjects = getSubjects();
  const currentTeachers = getTeachers();

  const repairedItems: string[] = [];

  // 1. Clean & Guarantee Categories (Ensure strictly unique IDs and names)
  const cleanCategories = sanitizeCategories([
    ...currentCategories,
    ...INITIAL_CATEGORIES
  ]);
  const initialCategoryNames = new Set(currentCategories.map(c => c.name.toLowerCase().trim()));
  INITIAL_CATEGORIES.forEach(initCat => {
    if (!initialCategoryNames.has(initCat.name.toLowerCase().trim())) {
      repairedItems.push(`Menambahkan master kelompok: ${initCat.name}`);
    }
  });

  // 2. Clean & Guarantee Classes
  const classMap = new Map<string, ClassItem>();
  currentClasses.forEach(cls => {
    const trimmedName = cls.name.trim();
    if (trimmedName && !classMap.has(trimmedName.toLowerCase())) {
      classMap.set(trimmedName.toLowerCase(), {
        ...cls,
        name: trimmedName,
        code: cls.code?.trim().toUpperCase() || trimmedName.toUpperCase(),
        description: cls.description?.trim() || `Kelas ${trimmedName}`
      });
    }
  });

  INITIAL_CLASSES.forEach(initCls => {
    if (!classMap.has(initCls.name.toLowerCase())) {
      classMap.set(initCls.name.toLowerCase(), initCls);
      repairedItems.push(`Menambahkan tingkat kelas standar: ${initCls.name}`);
    }
  });

  const cleanClasses = Array.from(classMap.values());
  const validClassNames = new Set(cleanClasses.map(c => c.name.toLowerCase()));

  // 3. Clean & Guarantee Subjects
  const cleanSubjects: SubjectItem[] = [];
  const subjectCodeSet = new Set<string>();

  currentSubjects.forEach(sbj => {
    const trimmedName = sbj.name.trim();
    if (!trimmedName) return;

    let group = sbj.group?.trim() || 'Umum & Vokasi';
    // Match against cleanCategories
    const matchedCat = cleanCategories.find(c => c.name.toLowerCase() === group.toLowerCase());
    if (matchedCat) {
      group = matchedCat.name;
    } else {
      // Auto-register new category in master list
      const newCat: ExamCategory = {
        id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: group,
        description: `Kelompok / Rumpun terintegrasi untuk ${trimmedName}`
      };
      cleanCategories.push(newCat);
      repairedItems.push(`Mendaftarkan kelompok baru otomatis dari mapel: ${group}`);
    }

    let code = sbj.code?.trim().toUpperCase() || trimmedName.substring(0, 4).toUpperCase();
    if (subjectCodeSet.has(code)) {
      code = `${code}-${cleanSubjects.length + 1}`;
    }
    subjectCodeSet.add(code);

    // Sanitize target classes
    let targetClasses = sbj.targetClasses || ['SEMUA'];
    if (!Array.isArray(targetClasses) || targetClasses.length === 0) {
      targetClasses = ['SEMUA'];
    } else if (!targetClasses.includes('SEMUA')) {
      targetClasses = targetClasses.filter(c => validClassNames.has(c.toLowerCase()) || c === 'SEMUA');
      if (targetClasses.length === 0) targetClasses = ['SEMUA'];
    }

    cleanSubjects.push({
      id: sbj.id || `sbj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: trimmedName,
      code,
      group,
      description: sbj.description?.trim() || `Kurikulum materi ${trimmedName}`,
      targetClasses
    });
  });

  // 4. Synchronize Teachers targetClasses & subjects
  const cleanTeachers = currentTeachers.map(tch => {
    let tchClasses = tch.targetClasses || ['SEMUA'];
    if (!Array.isArray(tchClasses) || tchClasses.length === 0) {
      tchClasses = ['SEMUA'];
    } else if (!tchClasses.includes('SEMUA')) {
      tchClasses = tchClasses.filter(c => validClassNames.has(c.toLowerCase()) || c === 'SEMUA');
      if (tchClasses.length === 0) tchClasses = ['SEMUA'];
    }
    return {
      ...tch,
      targetClasses: tchClasses
    };
  });

  // Save all synced and cleaned data back to storage
  saveCategories(cleanCategories);
  saveClasses(cleanClasses);
  saveSubjects(cleanSubjects);
  saveTeachers(cleanTeachers);

  return {
    classes: cleanClasses,
    subjects: cleanSubjects,
    categories: cleanCategories,
    teachers: cleanTeachers,
    syncedSubjectCount: cleanSubjects.length,
    syncedCategoryCount: cleanCategories.length,
    syncedClassCount: cleanClasses.length,
    syncedTeacherCount: cleanTeachers.length,
    repairedItems
  };
}

// ==========================================
// AGENDAS & JADWAL KALENDER CRUD
// ==========================================
export function getAgendas(): AgendaItem[] {
  return getStoredItem<AgendaItem[]>(KEYS.AGENDAS, INITIAL_AGENDAS);
}

export function saveAgendas(agendas: AgendaItem[]): void {
  setStoredItem(KEYS.AGENDAS, agendas);
}

export function saveAgenda(agenda: AgendaItem): AgendaItem[] {
  const list = getAgendas();
  const idx = list.findIndex(a => a.id === agenda.id);
  let updated: AgendaItem[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = agenda;
  } else {
    updated = [agenda, ...list];
  }
  saveAgendas(updated);
  return updated;
}

export function deleteAgenda(agendaId: string): AgendaItem[] {
  const list = getAgendas();
  const updated = list.filter(a => a.id !== agendaId);
  saveAgendas(updated);
  return updated;
}

// ==========================================
// PENGUMUMAN & INFORMASI AKADEMIK CRUD
// ==========================================
export function getAnnouncements(): AnnouncementItem[] {
  const items = getStoredItem<AnnouncementItem[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  // Guarantee backward-compatibility if stored data didn't have showOnRoadmap / roadmapUntilDate
  return items.map(item => {
    if (item.showOnRoadmap === undefined) {
      return {
        ...item,
        showOnRoadmap: item.pinned || item.priority === 'HIGH' || item.priority === 'MEDIUM',
        roadmapUntilDate: item.roadmapUntilDate || item.date
      };
    }
    return item;
  });
}

export function saveAnnouncements(announcements: AnnouncementItem[]): void {
  setStoredItem(KEYS.ANNOUNCEMENTS, announcements);
}

export function saveAnnouncement(announcement: AnnouncementItem): AnnouncementItem[] {
  const list = getAnnouncements();
  const idx = list.findIndex(a => a.id === announcement.id);
  let updated: AnnouncementItem[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = announcement;
  } else {
    updated = [announcement, ...list];
  }
  saveAnnouncements(updated);
  return updated;
}

export function deleteAnnouncement(announcementId: string): AnnouncementItem[] {
  const list = getAnnouncements();
  const updated = list.filter(a => a.id !== announcementId);
  saveAnnouncements(updated);
  return updated;
}

export function incrementAnnouncementViews(announcementId: string): AnnouncementItem[] {
  const list = getAnnouncements();
  const updated = list.map(a => {
    if (a.id === announcementId) {
      return { ...a, viewsCount: (a.viewsCount || 0) + 1 };
    }
    return a;
  });
  saveAnnouncements(updated);
  return updated;
}

// ==========================================
// MASTER ALL-DATA SYNCHRONIZATION ENGINE
// ==========================================

export interface MasterSyncResult {
  success: boolean;
  message: string;
  totalSyncedItems: number;
  stats: {
    users: number;
    teachers: number;
    classes: number;
    subjects: number;
    categories: number;
    materials: number;
    exams: number;
    results: number;
    products: number;
    marketplaceCategories: number;
    featuredPrograms: number;
    syllabi: number;
    agendas: number;
    announcements: number;
  };
  repairedItems: string[];
  neonCloudSync: {
    synced: boolean;
    message: string;
  };
}

export function syncAllAppData(): MasterSyncResult {
  const repairedItems: string[] = [];

  // 1. Clean bloated legacy strings first
  cleanBloatedStorageData();

  // 2. Sync & Clean Curriculum (Categories, Classes, Subjects, Teachers)
  const currResult = syncAndCleanCurriculumData();
  repairedItems.push(...currResult.repairedItems);

  // 3. Ensure Users List integrity
  let users = getUsers();
  if (!Array.isArray(users) || users.length === 0) {
    users = INITIAL_USERS;
    saveUsers(users);
    repairedItems.push('Memulihkan master pengguna awal (Admin, Guru, Siswa).');
  } else {
    // Ensure admin user exists
    const hasAdmin = users.some(u => u.role === 'admin');
    if (!hasAdmin) {
      const defaultAdmin = INITIAL_USERS.find(u => u.role === 'admin');
      if (defaultAdmin) {
        users = [defaultAdmin, ...users];
        saveUsers(users);
        repairedItems.push('Menambahkan akun Administrator standar.');
      }
    }
  }

  // 4. Ensure Exams integrity
  let exams = getExams();
  if (!Array.isArray(exams) || exams.length === 0) {
    exams = INITIAL_EXAMS;
    saveExams(exams);
    repairedItems.push('Memulihkan bank soal & ujian standar CBT.');
  }

  // 5. Ensure Materials integrity
  let materials = getMaterials();
  if (!Array.isArray(materials) || materials.length === 0) {
    materials = INITIAL_MATERIALS;
    saveMaterials(materials);
    repairedItems.push('Memulihkan modul pembelajaran standar.');
  }

  // 6. Ensure Syllabi integrity
  let syllabi = getSyllabi();
  if (!Array.isArray(syllabi) || syllabi.length === 0) {
    syllabi = INITIAL_SYLLABI;
    saveSyllabi(syllabi);
    repairedItems.push('Memulihkan silabus akademik & jurnal pembelajaran.');
  }

  // 7. Ensure Marketplace Products & Categories
  let products = getProducts();
  if (!Array.isArray(products) || products.length === 0) {
    products = INITIAL_PRODUCTS;
    saveProducts(products);
  }

  let mktCategories = getMarketplaceCategories();
  if (!Array.isArray(mktCategories) || mktCategories.length === 0) {
    mktCategories = INITIAL_MARKETPLACE_CATEGORIES;
    saveMarketplaceCategories(mktCategories);
  }

  // 8. Ensure Featured Programs
  let programs = getFeaturedPrograms();
  if (!Array.isArray(programs) || programs.length === 0) {
    programs = INITIAL_FEATURED_PROGRAMS;
    saveFeaturedPrograms(programs);
  }

  // 9. Ensure Agendas & Announcements
  let agendas = getAgendas();
  if (!Array.isArray(agendas) || agendas.length === 0) {
    agendas = INITIAL_AGENDAS;
    saveAgendas(agendas);
  }

  let announcements = getAnnouncements();
  if (!Array.isArray(announcements) || announcements.length === 0) {
    announcements = INITIAL_ANNOUNCEMENTS;
    saveAnnouncements(announcements);
  }

  // 10. Ensure Settings & Institution Info
  const settings = getAppSettings();
  saveAppSettings(settings);

  const results = getResults();
  const teachers = getTeachers();
  const classes = getClasses();
  const subjects = getSubjects();
  const categories = getCategories();

  const totalSyncedItems =
    users.length +
    teachers.length +
    classes.length +
    subjects.length +
    categories.length +
    materials.length +
    exams.length +
    results.length +
    products.length +
    mktCategories.length +
    programs.length +
    syllabi.length +
    agendas.length +
    announcements.length;

  // Trigger global data refresh event
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bsa_data_synced', {
        detail: { timestamp: Date.now() }
      }));
    }
  } catch (_) {}

  return {
    success: true,
    message: `Semua data aplikasi (${totalSyncedItems} entri) berhasil disinkronkan & dirapikan.`,
    totalSyncedItems,
    stats: {
      users: users.length,
      teachers: teachers.length,
      classes: classes.length,
      subjects: subjects.length,
      categories: categories.length,
      materials: materials.length,
      exams: exams.length,
      results: results.length,
      products: products.length,
      marketplaceCategories: mktCategories.length,
      featuredPrograms: programs.length,
      syllabi: syllabi.length,
      agendas: agendas.length,
      announcements: announcements.length
    },
    repairedItems,
    neonCloudSync: {
      synced: false,
      message: 'Sinkronisasi lokal selesai.'
    }
  };
}

export async function syncAllAppDataWithCloud(): Promise<MasterSyncResult> {
  // Run local reconciliation first
  const localResult = syncAllAppData();

  // Prepare full multi-collection cloud sync payload
  const fullPayload = {
    [KEYS.USERS]: getUsers(),
    [KEYS.TEACHERS]: getTeachers(),
    [KEYS.CLASSES]: getClasses(),
    [KEYS.SUBJECTS]: getSubjects(),
    [KEYS.CATEGORIES]: getCategories(),
    [KEYS.MATERIALS]: getMaterials(),
    [KEYS.EXAMS]: getExams(),
    [KEYS.RESULTS]: getResults(),
    [KEYS.PRODUCTS]: getProducts(),
    [KEYS.MARKETPLACE_CATEGORIES]: getMarketplaceCategories(),
    [KEYS.FEATURED_PROGRAMS]: getFeaturedPrograms(),
    [KEYS.SYLLABUS]: getSyllabi(),
    [KEYS.AGENDAS]: getAgendas(),
    [KEYS.ANNOUNCEMENTS]: getAnnouncements(),
    [KEYS.SETTINGS]: getAppSettings(),
    [KEYS.INSTITUTION]: getInstitutionInfo()
  };

  try {
    const res = await fetch('/api/neon/bulk-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload)
    });

    if (res.ok) {
      localResult.neonCloudSync = {
        synced: true,
        message: 'Data berhasil disinkronkan ke Database Neon PostgreSQL Cloud!'
      };
      localResult.message = `Semua data (${localResult.totalSyncedItems} entri) berhasil disinkronkan secara lokal dan terhubung ke Database Neon PostgreSQL Cloud.`;
    } else {
      const err = await res.json().catch(() => ({}));
      localResult.neonCloudSync = {
        synced: false,
        message: err.error || 'Database Neon belum terhubung (Data tersimpan aman di local storage).'
      };
    }
  } catch (err: any) {
    localResult.neonCloudSync = {
      synced: false,
      message: 'Server offline / Data tersimpan di local storage.'
    };
  }

  return localResult;
}



