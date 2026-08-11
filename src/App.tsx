import React, { useState, useEffect } from 'react';
import {
  User,
  Teacher,
  ClassItem,
  SubjectItem,
  ExamCategory,
  LearningMaterial,
  Exam,
  MarketplaceProduct,
  ExamResult,
  FeaturedProgram,
  SyllabusItem,
  InstitutionInfo,
  AppSettings
} from './types';
import {
  initStorage,
  getCurrentUser,
  setCurrentUser,
  getUsers,
  saveUsers,
  updateUserStatus,
  saveUser,
  deleteUser,
  getTeachers,
  saveTeachers,
  saveTeacher,
  deleteTeacher,
  getClasses,
  saveClasses,
  getSubjects,
  saveSubjects,
  saveSubject,
  deleteSubject,
  getCategories,
  saveCategories,
  sanitizeCategories,
  getMaterials,
  saveMaterials,
  getExams,
  saveExams,
  getProducts,
  saveProducts,
  getMarketplaceCategories,
  saveMarketplaceCategories,
  getResults,
  saveResults,
  addExamResult,
  getFeaturedPrograms,
  saveFeaturedPrograms,
  getInstitutionInfo,
  saveInstitutionInfo,
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
  syncAndCleanCurriculumData,
  syncAllAppData,
  syncAllAppDataWithCloud,
  getSyllabi,
  saveSyllabus,
  deleteSyllabus
} from './utils/storage';


// Toast System
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Layout Components
import { HeaderNavbar } from './components/common/HeaderNavbar';
import { Sidebar, SidebarTab } from './components/common/Sidebar';
import { isStudentLabschool, isStudentSnbt, isStudentRegular } from './utils/labschoolHelpers';
import { EditProfileModal } from './components/common/EditProfileModal';
import { EditInstitutionModal } from './components/common/EditInstitutionModal';
import { NeonDatabaseModal } from './components/admin/NeonDatabaseModal';

// Auth & Landing
import { LandingAuth } from './components/auth/LandingAuth';

// Admin Views
import { UserValidation } from './components/admin/UserValidation';
import { StudentManagement } from './components/admin/StudentManagement';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { AdminManagement } from './components/admin/AdminManagement';
import { AcademicManagement } from './components/admin/AcademicManagement';
import { ClassAndCategory } from './components/admin/ClassAndCategory';
import { SyllabusManagement } from './components/admin/SyllabusManagement';
import { MaterialManagement } from './components/admin/MaterialManagement';
import { ExamManagement } from './components/admin/ExamManagement';
import { MarketplaceManagement } from './components/admin/MarketplaceManagement';
import { ProgramManagement } from './components/admin/ProgramManagement';
import { ExamReports } from './components/admin/ExamReports';
import { TryoutReports } from './components/admin/TryoutReports';
import { SettingsManagement } from './components/admin/SettingsManagement';
import { DashboardCalendarAgendaPengumuman } from './components/common/DashboardCalendarAgendaPengumuman';

// Teacher View
import { TeacherDashboard } from './components/teacher/TeacherDashboard';

// Student View
import { StudentDashboard } from './components/student/StudentDashboard';

// Exam Engine
import { ExamEngine } from './components/exam/ExamEngine';

// Labschool Views
import { LabschoolDashboard } from './components/labschool/LabschoolDashboard';
import { LabschoolSyllabusTimelinePage } from './components/labschool/LabschoolSyllabusTimelinePage';
import { LabschoolKampusPage } from './components/labschool/LabschoolKampusPage';
import { LabschoolRoadmap } from './components/labschool/LabschoolRoadmap';
import { LabschoolPsbSmp } from './components/labschool/LabschoolPsbSmp';
import { LabschoolPsbSma } from './components/labschool/LabschoolPsbSma';
import { LabschoolLaporanPage } from './components/labschool/LabschoolLaporanPage';

// SNBT / UTBK Views
import { SnbtDashboard } from './components/snbt/SnbtDashboard';
import { SnbtSyllabusPage } from './components/snbt/SnbtSyllabusPage';
import { SnbtStudentsPage } from './components/snbt/SnbtStudentsPage';
import { SnbtCampusPage } from './components/snbt/SnbtCampusPage';
import { SnbtRoadmapPage } from './components/snbt/SnbtRoadmapPage';
import { SnbtCountdownPage } from './components/snbt/SnbtCountdownPage';
import { SnbtLaporanPage } from './components/snbt/SnbtLaporanPage';

export default function App() {
  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Global App State
  const [currentUser, setCurrentUserSession] = useState<User | null>(null);
  const [users, setUsersList] = useState<User[]>([]);
  const [teachers, setTeachersList] = useState<Teacher[]>([]);
  const [classes, setClassesList] = useState<ClassItem[]>([]);
  const [subjects, setSubjectsList] = useState<SubjectItem[]>([]);
  const [categories, setCategoriesList] = useState<ExamCategory[]>([]);
  const [materials, setMaterialsList] = useState<LearningMaterial[]>([]);
  const [exams, setExamsList] = useState<Exam[]>([]);
  const [products, setProductsList] = useState<MarketplaceProduct[]>([]);
  const [marketplaceCategories, setMarketplaceCategoriesList] = useState<import('./types').MarketplaceCategory[]>([]);
  const [results, setResultsList] = useState<ExamResult[]>([]);
  const [featuredPrograms, setFeaturedProgramsList] = useState<FeaturedProgram[]>([]);
  const [syllabi, setSyllabiList] = useState<SyllabusItem[]>([]);
  const [institutionInfo, setInstitutionInfoState] = useState<InstitutionInfo>(getInstitutionInfo());
  const [appSettings, setAppSettingsState] = useState<AppSettings>(getAppSettings());

  // Navigation State
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [selectedTeacherClass, setSelectedTeacherClass] = useState<string>('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Exam Launcher State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Modals State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditInstitutionModalOpen, setIsEditInstitutionModalOpen] = useState(false);
  const [isNeonModalOpen, setIsNeonModalOpen] = useState(false);

  // Refresh all state from local storage
  const reloadAllStateFromStorage = () => {
    setUsersList(getUsers());
    setTeachersList(getTeachers());
    setClassesList(getClasses());
    setSubjectsList(getSubjects());
    setCategoriesList(getCategories());
    setMaterialsList(getMaterials());
    setExamsList(getExams());
    setProductsList(getProducts());
    setMarketplaceCategoriesList(getMarketplaceCategories());
    setResultsList(getResults());
    setFeaturedProgramsList(getFeaturedPrograms());
    setSyllabiList(getSyllabi());
    const loadedSettings = getAppSettings();
    setAppSettingsState(loadedSettings);
    setInstitutionInfoState(loadedSettings.institution);
  };

  // Initialize Data on Mount & Listen for global sync events
  useEffect(() => {
    initStorage();
    reloadAllStateFromStorage();

    const savedUser = getCurrentUser();
    if (savedUser) {
      setCurrentUserSession(savedUser);
    }

    const handleSyncEvent = () => {
      reloadAllStateFromStorage();
    };

    window.addEventListener('bsa_data_synced', handleSyncEvent);
    return () => {
      window.removeEventListener('bsa_data_synced', handleSyncEvent);
    };
  }, []);

  // Guard student active tab against unauthorized program views
  useEffect(() => {
    if (currentUser?.role === 'student') {
      const isLabsTab = activeTab.startsWith('labschool_');
      const isSnbtTab = activeTab.startsWith('snbt_');

      if (isLabsTab && !isStudentLabschool(currentUser)) {
        setActiveTab('overview');
      } else if (isSnbtTab && !isStudentSnbt(currentUser)) {
        setActiveTab('overview');
      } else if (activeTab === 'snbt_students' || activeTab === 'students') {
        setActiveTab('snbt_dashboard');
      }
    }
  }, [currentUser, activeTab]);


  // Sync Current User with Storage
  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUserSession(user);
    setCurrentUser(user);
  };

  const handleSaveProfile = (updatedUser: User) => {
    handleSetCurrentUser(updatedUser);
    const updatedList = saveUser(updatedUser);
    setUsersList(updatedList);
  };

  // Auth Callbacks
  const handleLoginSuccess = (user: User) => {
    handleSetCurrentUser(user);
    setActiveTab('overview');

    if (user.status === 'PENDING') {
      addToast('info', 'Pendaftaran Anda berstatus PENDING. Menunggu validasi Admin.');
    } else {
      addToast('success', `Selamat datang kembali, ${user.name}!`);
    }
  };

  const handleRegisterSubmit = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const createdUser: User = {
      ...newUser,
      id: `u-reg-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = saveUser(createdUser);
    setUsersList(updatedList);
    addToast('info', 'Pendaftaran berhasil! Akun Anda kini berstatus PENDING.');
    return createdUser;
  };

  const handleLogout = () => {
    handleSetCurrentUser(null);
    setActiveExam(null);
    addToast('info', 'Anda telah keluar dari sistem.');
  };

  // Admin User Validation
  const handleApproveUser = (userId: string) => {
    const updatedUsers = updateUserStatus(userId, 'ACTIVE');
    setUsersList(updatedUsers);
    addToast('success', 'User berhasil disetujui! Akun siswa kini aktif.');
  };

  const handleRejectUser = (userId: string) => {
    const updatedUsers = updateUserStatus(userId, 'REJECTED');
    setUsersList(updatedUsers);
    addToast('error', 'Pendaftaran user ditolak.');
  };

  // Student & Admin User CRUD
  const handleSaveStudent = (student: User) => {
    const updatedUsers = saveUser(student);
    setUsersList(updatedUsers);
    if (currentUser && currentUser.id === student.id) {
      handleSetCurrentUser(student);
    }
    addToast('success', 'Data siswa berhasil disimpan.');
  };

  const handleDeleteStudent = (studentId: string) => {
    const updatedUsers = deleteUser(studentId);
    setUsersList(updatedUsers);
    addToast('info', 'Data siswa berhasil dihapus.');
  };

  const handleSaveUser = (user: User) => {
    const updatedUsers = saveUser(user);
    setUsersList(updatedUsers);
    if (currentUser && currentUser.id === user.id) {
      handleSetCurrentUser(user);
    }
    addToast('success', `Data ${user.role === 'admin' ? 'admin' : 'siswa'} berhasil disimpan.`);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = deleteUser(userId);
    setUsersList(updatedUsers);
    addToast('info', 'Pengguna berhasil dihapus.');
  };

  // Teachers CRUD
  const handleSaveTeacher = (teacher: Teacher) => {
    const updatedTeachers = saveTeacher(teacher);
    setTeachersList(updatedTeachers);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const updatedTeachers = deleteTeacher(teacherId);
    setTeachersList(updatedTeachers);
  };

  // Direct login as Teacher from Admin Panel
  const handleLoginAsTeacher = (teacher: Teacher) => {
    let teacherUser = users.find(
      u => u.id === teacher.id || (u.nis && u.nis === teacher.nip) || (u.email && u.email === teacher.email)
    );

    if (!teacherUser) {
      teacherUser = {
        id: teacher.id,
        nis: teacher.nip,
        name: teacher.name,
        role: 'teacher',
        className: teacher.targetClasses?.[0] || 'SEMUA',
        subject: teacher.subject,
        email: teacher.email,
        phone: teacher.phone,
        avatar: teacher.avatar,
        status: 'ACTIVE',
        createdAt: teacher.createdAt || new Date().toISOString().split('T')[0]
      };
      const updatedUsers = saveUser(teacherUser);
      setUsersList(updatedUsers);
    } else if (teacherUser.role !== 'teacher') {
      teacherUser = {
        ...teacherUser,
        role: 'teacher',
        subject: teacher.subject,
        avatar: teacher.avatar || teacherUser.avatar
      };
      const updatedUsers = saveUser(teacherUser);
      setUsersList(updatedUsers);
    }

    handleSetCurrentUser(teacherUser);
    setActiveTab('overview');
    addToast('success', `Berhasil membuka Panel Guru sebagai ${teacher.name}`);
  };

  // Master Data Synchronization Action (All modules & Cloud)
  const handleSyncAllCurriculumData = async () => {
    const result = await syncAllAppDataWithCloud();
    reloadAllStateFromStorage();

    const cloudMsg = result.neonCloudSync.synced
      ? ' • Terhubung ke Database Neon Cloud'
      : '';

    const message = result.repairedItems.length > 0
      ? `Sinkronisasi selesai! ${result.totalSyncedItems} entri data telah dirapikan (${result.repairedItems.length} perbaikan otomatis)${cloudMsg}.`
      : `Sinkronisasi sukses! Seluruh data aplikasi (${result.totalSyncedItems} entri) terhubung sempurna${cloudMsg}.`;

    addToast('success', message);
  };

  // Class CRUD with cascading rename support
  const handleSaveClass = (classItem: ClassItem) => {
    const existingIdx = classes.findIndex(c => c.id === classItem.id);
    let updated: ClassItem[];
    const oldClass = existingIdx >= 0 ? classes[existingIdx] : null;

    if (existingIdx >= 0) {
      updated = [...classes];
      updated[existingIdx] = classItem;
    } else {
      updated = [classItem, ...classes];
    }
    setClassesList(updated);
    saveClasses(updated);

    // If class name changed, cascade update to subjects, teachers, materials, and exams
    if (oldClass && oldClass.name !== classItem.name) {
      const oldName = oldClass.name;
      const newName = classItem.name;

      // Update Subjects
      const updatedSubjs = subjects.map(s => {
        if (s.targetClasses.includes(oldName)) {
          return {
            ...s,
            targetClasses: s.targetClasses.map(tc => tc === oldName ? newName : tc)
          };
        }
        return s;
      });
      setSubjectsList(updatedSubjs);
      saveSubjects(updatedSubjs);

      // Update Teachers
      const updatedTchs = teachers.map(t => {
        if (t.targetClasses.includes(oldName)) {
          return {
            ...t,
            targetClasses: t.targetClasses.map(tc => tc === oldName ? newName : tc)
          };
        }
        return t;
      });
      setTeachersList(updatedTchs);
      saveTeachers(updatedTchs);

      // Update Materials
      const updatedMats = materials.map(m => m.targetClass === oldName ? { ...m, targetClass: newName } : m);
      setMaterialsList(updatedMats);
      saveMaterials(updatedMats);

      // Update Exams
      const updatedExs = exams.map(e => e.targetClass === oldName ? { ...e, targetClass: newName } : e);
      setExamsList(updatedExs);
      saveExams(updatedExs);
    }

    addToast('success', 'Data kelas berhasil disimpan & disinkronkan.');
  };

  const handleDeleteClass = (classId: string) => {
    const updated = classes.filter(c => c.id !== classId);
    setClassesList(updated);
    saveClasses(updated);
    addToast('info', 'Kelas dihapus.');
  };

  // Subject CRUD
  const handleSaveSubject = (subj: SubjectItem) => {
    const existingIdx = subjects.findIndex(s => s.id === subj.id);
    let updated: SubjectItem[];
    if (existingIdx >= 0) {
      updated = [...subjects];
      updated[existingIdx] = subj;
    } else {
      updated = [subj, ...subjects];
    }
    setSubjectsList(updated);
    saveSubjects(updated);

    // Auto ensure category exists if custom group created
    if (subj.group) {
      const catExists = categories.some(c => c.name.toLowerCase() === subj.group.toLowerCase());
      if (!catExists) {
        const newCat: ExamCategory = {
          id: `cat-${Date.now()}`,
          name: subj.group,
          description: `Rumpun / Kelompok mata pelajaran ${subj.name}`
        };
        const updatedCats = sanitizeCategories([newCat, ...categories]);
        setCategoriesList(updatedCats);
        saveCategories(updatedCats);
      }
    }

    addToast('success', 'Data mata pelajaran berhasil disimpan.');
  };

  const handleDeleteSubject = (subjectId: string) => {
    const updated = subjects.filter(s => s.id !== subjectId);
    setSubjectsList(updated);
    saveSubjects(updated);
    addToast('info', 'Mata pelajaran dihapus.');
  };

  // Category CRUD with cascading rename support
  const handleSaveCategory = (cat: ExamCategory) => {
    const existingIdx = categories.findIndex(c => c.id === cat.id);
    let updated: ExamCategory[];
    const oldCat = existingIdx >= 0 ? categories[existingIdx] : null;

    if (existingIdx >= 0) {
      updated = [...categories];
      updated[existingIdx] = cat;
    } else {
      updated = [cat, ...categories];
    }
    const sanitized = sanitizeCategories(updated);
    setCategoriesList(sanitized);
    saveCategories(sanitized);

    // If category name was renamed, cascade update to subjects & exams
    if (oldCat && oldCat.name !== cat.name) {
      const oldName = oldCat.name;
      const newName = cat.name;

      const updatedSubjs = subjects.map(s => s.group === oldName ? { ...s, group: newName } : s);
      setSubjectsList(updatedSubjs);
      saveSubjects(updatedSubjs);

      const updatedExs = exams.map(e => e.category === oldName ? { ...e, category: newName } : e);
      setExamsList(updatedExs);
      saveExams(updatedExs);
    }

    addToast('success', 'Data kelompok / kategori berhasil disimpan & disinkronkan.');
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter(c => c.id !== catId);
    setCategoriesList(updated);
    saveCategories(updated);
    addToast('info', 'Kelompok / kategori dihapus.');
  };

  // Syllabus CRUD
  const handleSaveSyllabus = (sil: SyllabusItem) => {
    const updated = saveSyllabus(sil);
    setSyllabiList(updated);
  };

  const handleDeleteSyllabus = (silId: string) => {
    const updated = deleteSyllabus(silId);
    setSyllabiList(updated);
  };

  // Material CRUD
  const handleSaveMaterial = (mat: LearningMaterial) => {
    const existingIdx = materials.findIndex(m => m.id === mat.id);
    let updated: LearningMaterial[];
    if (existingIdx >= 0) {
      updated = [...materials];
      updated[existingIdx] = mat;
    } else {
      updated = [mat, ...materials];
    }
    setMaterialsList(updated);
    saveMaterials(updated);
    addToast('success', 'Materi pembelajaran disimpan.');
  };

  const handleDeleteMaterial = (matId: string) => {
    const updated = materials.filter(m => m.id !== matId);
    setMaterialsList(updated);
    saveMaterials(updated);
    addToast('info', 'Materi dihapus.');
  };

  // Exam CRUD
  const handleSaveExam = (exam: Exam) => {
    const existingIdx = exams.findIndex(e => e.id === exam.id);
    let updated: Exam[];
    if (existingIdx >= 0) {
      updated = [...exams];
      updated[existingIdx] = exam;
    } else {
      updated = [exam, ...exams];
    }
    setExamsList(updated);
    saveExams(updated);
    addToast('success', 'Paket ujian & LJK Digital berhasil disimpan.');
  };

  const handleDeleteExam = (examId: string) => {
    const updated = exams.filter(e => e.id !== examId);
    setExamsList(updated);
    saveExams(updated);
    addToast('info', 'Paket ujian dihapus.');
  };

  // Product CRUD
  const handleSaveProduct = (prod: MarketplaceProduct) => {
    const existingIdx = products.findIndex(p => p.id === prod.id);
    let updated: MarketplaceProduct[];
    if (existingIdx >= 0) {
      updated = [...products];
      updated[existingIdx] = prod;
    } else {
      updated = [prod, ...products];
    }
    setProductsList(updated);
    saveProducts(updated);
    addToast('success', 'Produk marketplace berhasil disimpan.');
  };

  const handleDeleteProduct = (prodId: string) => {
    const updated = products.filter(p => p.id !== prodId);
    setProductsList(updated);
    saveProducts(updated);
    addToast('info', 'Produk marketplace dihapus.');
  };

  // Marketplace Category CRUD
  const handleSaveMarketplaceCategory = (cat: import('./types').MarketplaceCategory) => {
    const existingIdx = marketplaceCategories.findIndex(c => c.id === cat.id);
    let updated: import('./types').MarketplaceCategory[];
    if (existingIdx >= 0) {
      updated = [...marketplaceCategories];
      updated[existingIdx] = cat;
    } else {
      updated = [...marketplaceCategories, cat];
    }
    setMarketplaceCategoriesList(updated);
    saveMarketplaceCategories(updated);
    addToast('success', `Kategori produk ${cat.name} berhasil disimpan.`);
  };

  const handleDeleteMarketplaceCategory = (catId: string) => {
    const updated = marketplaceCategories.filter(c => c.id !== catId);
    setMarketplaceCategoriesList(updated);
    saveMarketplaceCategories(updated);
    addToast('info', 'Kategori produk dihapus.');
  };

  // Featured Programs CRUD
  const handleSaveFeaturedProgram = (prog: FeaturedProgram) => {
    const existingIdx = featuredPrograms.findIndex(p => p.id === prog.id);
    let updated: FeaturedProgram[];
    if (existingIdx >= 0) {
      updated = [...featuredPrograms];
      updated[existingIdx] = prog;
    } else {
      updated = [prog, ...featuredPrograms];
    }
    setFeaturedProgramsList(updated);
    saveFeaturedPrograms(updated);
    addToast('success', `Program Unggulan "${prog.title}" berhasil disimpan.`);
  };

  const handleDeleteFeaturedProgram = (progId: string) => {
    const updated = featuredPrograms.filter(p => p.id !== progId);
    setFeaturedProgramsList(updated);
    saveFeaturedPrograms(updated);
    addToast('info', 'Program Unggulan berhasil dihapus.');
  };

  // Exam Result CRUD for Admin Laporan
  const handleSaveExamResult = (res: ExamResult) => {
    const existingIdx = results.findIndex(r => r.id === res.id);
    let updated: ExamResult[];
    if (existingIdx >= 0) {
      updated = [...results];
      updated[existingIdx] = res;
    } else {
      updated = [res, ...results];
    }
    setResultsList(updated);
    saveResults(updated);
    addToast('success', `Data hasil ujian "${res.studentName}" berhasil disimpan.`);
  };

  const handleDeleteExamResult = (resultId: string) => {
    const updated = results.filter(r => r.id !== resultId);
    setResultsList(updated);
    saveResults(updated);
    addToast('info', 'Data hasil ujian berhasil dihapus.');
  };

  // Exam Result Submit Callback
  const handleSubmitExamResult = (res: ExamResult) => {
    const updatedResults = addExamResult(res);
    setResultsList(updatedResults);
    setActiveExam(null);
    setActiveTab('history');
    addToast('success', `Ujian selesai! Skor Anda: ${res.score} Poin (${res.isPassed ? 'LULUS' : 'TIDAK LULUS'}).`);
  };


  // Active Pending Users Count
  const pendingUsersCount = users.filter(u => u.status === 'PENDING').length;

  // Render Exam Engine if Exam is active
  if (activeExam && currentUser) {
    return (
      <ExamEngine
        exam={activeExam}
        user={currentUser}
        onSubmitExam={handleSubmitExamResult}
        onCancelExam={() => setActiveExam(null)}
      />
    );
  }

  // Render Landing & Auth if not logged in or pending
  if (!currentUser || currentUser.status === 'PENDING') {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LandingAuth
          onLoginSuccess={handleLoginSuccess}
          onRegisterSubmit={handleRegisterSubmit}
          classes={classes}
          users={users}
          pendingUser={currentUser}
          onLogoutPending={handleLogout}
          institutionInfo={institutionInfo}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden w-full">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Header Navbar */}
      <HeaderNavbar
        user={currentUser}
        institution={institutionInfo}
        onLogout={handleLogout}
        onEditProfile={() => setIsEditProfileModalOpen(true)}
        onEditInstitution={() => setIsEditInstitutionModalOpen(true)}
        onOpenNeonDb={() => setIsNeonModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeMenuTitle={
          activeTab === 'settings'
            ? (appSettings.navLabels?.settings || 'Pusat Pengaturan & Konfigurasi')
            : activeTab === 'labschool_overview' || activeTab === 'labschool_dashboard'
            ? (appSettings.navLabels?.labschool_overview || 'Dashboard Labschool')
            : activeTab === 'labschool_silabus'
            ? (appSettings.navLabels?.labschool_silabus || 'Modul & Silabus Timeline Belajar')
            : activeTab === 'labschool_kampus'
            ? (appSettings.navLabels?.labschool_kampus || 'Kampus Labschool')
            : activeTab === 'labschool_roadmap'
            ? (appSettings.navLabels?.labschool_roadmap || 'ROADMAP')
            : activeTab === 'labschool_psb_smp' || activeTab === 'labschool_smp'
            ? (appSettings.navLabels?.labschool_psb_smp || 'Pilihan PSB SMP LABSCHOOL')
            : activeTab === 'labschool_psb_sma' || activeTab === 'labschool_sma'
            ? (appSettings.navLabels?.labschool_psb_sma || 'Pilihan PSB SMA LABSCHOOL')
            : activeTab === 'labschool_laporan'
            ? (appSettings.navLabels?.labschool_laporan || 'Laporan Labschool')
            : activeTab === 'snbt_dashboard'
            ? (appSettings.navLabels?.snbt_dashboard || 'Dashboard SNBT / UTBK')
            : activeTab === 'snbt_syllabus' || activeTab === 'snbt_silabus'
            ? (appSettings.navLabels?.snbt_syllabus || 'Silabus & Modul SNBT (7 Subtes)')
            : activeTab === 'snbt_students'
            ? (appSettings.navLabels?.snbt_students || 'Data Siswa XII-UTBK')
            : activeTab === 'snbt_campus' || activeTab === 'snbt_kampus'
            ? (appSettings.navLabels?.snbt_campus || 'Pilihan Kampus & Passing Grade PTN')
            : activeTab === 'snbt_roadmap'
            ? (appSettings.navLabels?.snbt_roadmap || 'ROADMAP Strategis SNBT')
            : activeTab === 'snbt_countdown'
            ? 'Countdown Menuju UTBK-SNBT'
            : activeTab === 'snbt_reports' || activeTab === 'snbt_laporan'
            ? (appSettings.navLabels?.snbt_reports || 'Analisis & Laporan SNBT')
            : currentUser.role === 'admin'
            ? activeTab === 'validation'
              ? (appSettings.navLabels?.validation || 'Validasi User Baru')
              : activeTab === 'students'
              ? (appSettings.navLabels?.students || 'Pengelola Data Siswa')
              : activeTab === 'teachers'
              ? (appSettings.navLabels?.teachers || 'Pengelola Data Guru')
              : activeTab === 'admins'
              ? (appSettings.navLabels?.admins || 'Data Pengelola Admin')
              : activeTab === 'academic'
              ? (appSettings.navLabels?.academic || 'Pusat Manajemen & Layanan Akademik')
              : activeTab === 'classes'
              ? (appSettings.navLabels?.classes || 'Kelas & Mapel')
              : activeTab === 'syllabus'
              ? (appSettings.navLabels?.syllabus || 'Silabus & Perencanaan Kurikulum')
              : activeTab === 'materials'
              ? (appSettings.navLabels?.materials || 'Pengelola Materi Pembelajaran')
              : activeTab === 'exams'
              ? (appSettings.navLabels?.exams || 'Ujian')
              : activeTab === 'marketplace'
              ? (appSettings.navLabels?.marketplace || 'Marketplace')
              : activeTab === 'programs'
              ? (appSettings.navLabels?.programs || 'Manajemen Program Unggulan')
              : activeTab === 'reports'
              ? (appSettings.navLabels?.reports || 'Laporan')
              : activeTab === 'tryout_reports'
              ? (appSettings.navLabels?.tryout_reports || 'Laporan & Analisis Tryout Siswa')
              : (appSettings.pageLabels?.overviewTitle || 'Dashboard Utama Admin')
            : currentUser.role === 'teacher'
            ? activeTab === 'classes'
              ? `Menu Kelas Binaan${selectedTeacherClass && selectedTeacherClass !== 'ALL' ? ` • Kelas ${selectedTeacherClass}` : ' • Semua Kelas'}`
              : activeTab === 'syllabus'
              ? 'Silabus & RPP'
              : activeTab === 'materials'
              ? 'Materi Pembelajaran'
              : activeTab === 'exams'
              ? 'Ujian'
              : activeTab === 'reports'
              ? 'Rekap Nilai & Analisis'
              : activeTab === 'tryout_reports'
              ? 'Laporan & Analisis Tryout Siswa'
              : activeTab === 'students'
              ? 'Siswa Kelas Bimbingan'
              : activeTab === 'marketplace'
              ? 'Marketplace'
              : 'Dashboard Guru'
            : activeTab === 'materials'
            ? 'Materi Pembelajaran Saya'
            : activeTab === 'exams'
            ? 'Daftar Ujian'
            : activeTab === 'tryout_reports'
            ? 'Laporan & Analisis Tryout Siswa'
            : activeTab === 'marketplace'
            ? 'Marketplace'
            : activeTab === 'history'
            ? 'Riwayat & Hasil Ujian'
            : 'Dashboard Siswa'
        }
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex w-full">
        
        {/* Sidebar */}
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={pendingUsersCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          teachers={teachers}
          classes={classes}
          selectedTeacherClass={selectedTeacherClass}
          onSelectTeacherClass={(cls) => {
            setSelectedTeacherClass(cls);
            setActiveTab('classes');
          }}
          navLabels={appSettings.navLabels}
        />

        {/* Content Body Area */}
        <main
          className={`flex-1 transition-all duration-300 p-3 sm:p-5 lg:p-7 min-w-0 max-w-7xl mx-auto w-full ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* LABSCHOOL DEDICATED VIEWS */}
          {(activeTab === 'labschool_overview' || activeTab === 'labschool_dashboard') && (
            <LabschoolDashboard
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {activeTab === 'labschool_silabus' && (
            <LabschoolSyllabusTimelinePage
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {activeTab === 'labschool_kampus' && (
            <LabschoolKampusPage
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {activeTab === 'labschool_roadmap' && (
            <LabschoolRoadmap
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {(activeTab === 'labschool_psb_smp' || activeTab === 'labschool_smp') && (
            <LabschoolPsbSmp
              user={currentUser}
              users={users}
              classes={classes}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onStartExam={(exam) => setActiveExam(exam)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {(activeTab === 'labschool_psb_sma' || activeTab === 'labschool_sma') && (
            <LabschoolPsbSma
              user={currentUser}
              users={users}
              classes={classes}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {activeTab === 'labschool_laporan' && (
            <LabschoolLaporanPage
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {/* SNBT / UTBK MODULE VIEWS */}
          {activeTab === 'snbt_dashboard' && (
            <SnbtDashboard
              user={currentUser}
              users={users}
              exams={exams}
              results={results}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onStartExam={(exam) => setActiveExam(exam)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {(activeTab === 'snbt_syllabus' || activeTab === 'snbt_silabus') && (
            <SnbtSyllabusPage
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {activeTab === 'snbt_students' && currentUser.role !== 'student' && (
            <SnbtStudentsPage
              user={currentUser}
              users={users}
              classes={classes}
              onShowToast={(msg, type) => addToast(type, msg)}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {(activeTab === 'snbt_campus' || activeTab === 'snbt_kampus') && (
            <SnbtCampusPage
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {(activeTab === 'snbt_roadmap' || activeTab === 'snbt_countdown') && (
            <SnbtRoadmapPage
              user={currentUser}
              initialMenu={activeTab === 'snbt_countdown' ? 'countdown' : 'roadmap'}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {(activeTab === 'snbt_reports' || activeTab === 'snbt_laporan') && (
            <SnbtLaporanPage
              user={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
              onShowToast={(msg, type) => addToast(type, msg)}
            />
          )}

          {/* STANDARD ROLE DASHBOARD VIEWS */}
          {!['labschool_overview', 'labschool_dashboard', 'labschool_silabus', 'labschool_kampus', 'labschool_roadmap', 'labschool_psb_smp', 'labschool_smp', 'labschool_psb_sma', 'labschool_sma', 'labschool_laporan', 'snbt_dashboard', 'snbt_syllabus', 'snbt_silabus', 'snbt_students', 'snbt_campus', 'snbt_kampus', 'snbt_roadmap', 'snbt_countdown', 'snbt_reports', 'snbt_laporan'].includes(activeTab) && (
            <>
              {/* ROLE: ADMIN DASHBOARD VIEWS */}
              {currentUser.role === 'admin' && (
            <>
              {/* OVERVIEW / DASHBOARD UTAMA ADMIN */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Split Calendar, Agenda Roadmap, and Announcements for Admin Dashboard (Paling Atas) */}
                  <DashboardCalendarAgendaPengumuman
                    user={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
                    onShowToast={(msg, type) => addToast(type, msg)}
                  />

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      onClick={() => setActiveTab('validation')}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all shadow-xl"
                    >
                      <p className="text-xs text-slate-400 font-medium">Siswa Pending Validasi</p>
                      <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{pendingUsersCount} Siswa</h3>
                      <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                        <span>Klik untuk validasi</span> →
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('students')}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all shadow-xl"
                    >
                      <p className="text-xs text-slate-400 font-medium">Total Siswa Aktif</p>
                      <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">
                        {users.filter(u => u.role === 'student' && u.status === 'ACTIVE').length} Siswa
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-2">Terdaftar di {classes.length} kelas</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('exams')}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow-xl"
                    >
                      <p className="text-xs text-slate-400 font-medium">Paket Ujian CBT & PDF</p>
                      <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{exams.length} Ujian</h3>
                      <p className="text-[11px] text-slate-500 mt-2">Tersedia untuk pengerjaan</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('reports')}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all shadow-xl"
                    >
                      <p className="text-xs text-slate-400 font-medium">Laporan Submit Ujian</p>
                      <h3 className="text-3xl font-extrabold text-blue-400 mt-1">{results.length} Laporan</h3>
                      <p className="text-[11px] text-slate-500 mt-2">Perangkingan & Analisis</p>
                    </div>
                  </div>

                  <StudentManagement
                    users={users}
                    classes={classes}
                    onSaveStudent={handleSaveStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                </div>
              )}

              {activeTab === 'validation' && (
                <UserValidation
                  users={users}
                  onApprove={handleApproveUser}
                  onReject={handleRejectUser}
                />
              )}

              {activeTab === 'students' && (
                <StudentManagement
                  users={users}
                  classes={classes}
                  onSaveStudent={handleSaveStudent}
                  onDeleteStudent={handleDeleteStudent}
                />
              )}

              {activeTab === 'teachers' && (
                <TeacherManagement
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  onSaveTeacher={handleSaveTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onLoginAsTeacher={handleLoginAsTeacher}
                  onShowToast={(msg, type) => addToast(type, msg)}
                />
              )}

              {activeTab === 'admins' && (
                <AdminManagement
                  users={users}
                  currentUser={currentUser}
                  onSaveUser={handleSaveUser}
                  onDeleteUser={handleDeleteUser}
                  onShowToast={(msg, type) => addToast(type, msg)}
                />
              )}

              {activeTab === 'academic' && (
                <AcademicManagement
                  user={currentUser}
                  classes={classes}
                  subjects={subjects}
                  categories={categories}
                  teachers={teachers}
                  syllabi={syllabi}
                  materials={materials}
                  exams={exams}
                  results={results}
                  users={users}
                  onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
                  onShowToast={(msg, type) => addToast(type, msg)}
                />
              )}

              {activeTab === 'classes' && (
                <ClassAndCategory
                  classes={classes}
                  subjects={subjects}
                  categories={categories}
                  teachers={teachers}
                  onSaveClass={handleSaveClass}
                  onDeleteClass={handleDeleteClass}
                  onSaveSubject={handleSaveSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onSaveCategory={handleSaveCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onSyncAllData={handleSyncAllCurriculumData}
                />
              )}

              {activeTab === 'syllabus' && (
                <SyllabusManagement
                  syllabi={syllabi}
                  classes={classes}
                  subjects={subjects}
                  teachers={teachers}
                  materials={materials}
                  exams={exams}
                  onSaveSyllabus={handleSaveSyllabus}
                  onDeleteSyllabus={handleDeleteSyllabus}
                  onShowToast={(msg, type) => addToast(type, msg)}
                />
              )}

              {activeTab === 'materials' && (
                <MaterialManagement
                  materials={materials}
                  classes={classes}
                  subjects={subjects}
                  syllabi={syllabi}
                  onSaveMaterial={handleSaveMaterial}
                  onDeleteMaterial={handleDeleteMaterial}
                  onNavigateToSyllabus={() => {
                    setActiveTab('syllabus');
                  }}
                />
              )}

              {activeTab === 'exams' && (
                <ExamManagement
                  exams={exams}
                  classes={classes}
                  categories={categories}
                  onSaveExam={handleSaveExam}
                  onDeleteExam={handleDeleteExam}
                  onShowToast={(msg, type) => addToast(type || 'info', msg)}
                />
              )}

              {activeTab === 'marketplace' && (
                <MarketplaceManagement
                  products={products}
                  categories={marketplaceCategories}
                  onSaveProduct={handleSaveProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onSaveCategory={handleSaveMarketplaceCategory}
                  onDeleteCategory={handleDeleteMarketplaceCategory}
                />
              )}

              {activeTab === 'programs' && (
                <ProgramManagement
                  programs={featuredPrograms}
                  onSaveProgram={handleSaveFeaturedProgram}
                  onDeleteProgram={handleDeleteFeaturedProgram}
                />
              )}

              {activeTab === 'reports' && (
                <ExamReports
                  results={results}
                  classes={classes}
                  categories={categories}
                  onSaveResult={handleSaveExamResult}
                  onDeleteResult={handleDeleteExamResult}
                />
              )}

              {activeTab === 'tryout_reports' && (
                <TryoutReports
                  results={results}
                  classes={classes}
                  categories={categories}
                  exams={exams}
                  users={users}
                  currentUser={currentUser}
                  onSaveResult={handleSaveExamResult}
                  onDeleteResult={handleDeleteExamResult}
                  onShowToast={(msg, type) => addToast(type, msg)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsManagement
                  settings={appSettings}
                  onSaveSettings={(newSettings) => {
                    saveAppSettings(newSettings);
                    setAppSettingsState(newSettings);
                    setInstitutionInfoState(newSettings.institution);
                    addToast('success', 'Pengaturan aplikasi, label data, dan Kop Surat berhasil diperbarui!');
                  }}
                  onResetSettings={() => {
                    const def = resetAppSettings();
                    setAppSettingsState(def);
                    setInstitutionInfoState(def.institution);
                    addToast('info', 'Pengaturan berhasil dikembalikan ke standar default.');
                  }}
                  onShowToast={(msg, type) => addToast(type, msg)}
                />
              )}
            </>
          )}

          {/* ROLE: TEACHER DASHBOARD VIEWS */}
          {currentUser.role === 'teacher' && (
            <TeacherDashboard
              user={currentUser}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              categories={categories}
              syllabi={syllabi}
              materials={materials}
              exams={exams}
              results={results}
              products={products}
              allUsers={users}
              selectedClass={selectedTeacherClass}
              onSelectClass={setSelectedTeacherClass}
              onSaveSyllabus={handleSaveSyllabus}
              onDeleteSyllabus={handleDeleteSyllabus}
              onSaveMaterial={handleSaveMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onSaveExam={handleSaveExam}
              onDeleteExam={handleDeleteExam}
              onSaveExamResult={handleSaveExamResult}
              onDeleteExamResult={handleDeleteExamResult}
              onShowToast={(msg, type) => addToast(type, msg)}
              activeTab={activeTab}
              onNavigateTab={(tab) => setActiveTab(tab as SidebarTab)}
            />
          )}

          {/* ROLE: STUDENT DASHBOARD VIEWS */}
          {currentUser.role === 'student' && (
            <StudentDashboard
              user={currentUser}
              materials={materials}
              exams={exams}
              products={products}
              results={results}
              classes={classes}
              categories={categories}
              featuredPrograms={featuredPrograms}
              onStartExam={exam => setActiveExam(exam)}
              activeTab={activeTab}
            />
          )}
            </>
          )}

        </main>

      </div>

      {/* Modals */}
      {currentUser && (
        <>
          <EditProfileModal
            user={currentUser}
            isOpen={isEditProfileModalOpen}
            onClose={() => setIsEditProfileModalOpen(false)}
            onSave={handleSaveProfile}
            onShowToast={(msg, type) => addToast(type, msg)}
          />

          <EditInstitutionModal
            institution={institutionInfo}
            isOpen={isEditInstitutionModalOpen}
            onClose={() => setIsEditInstitutionModalOpen(false)}
            onSave={(updated) => {
              saveInstitutionInfo(updated);
              setInstitutionInfoState(updated);
            }}
            onShowToast={(msg, type) => addToast(type, msg)}
          />

          <NeonDatabaseModal
            isOpen={isNeonModalOpen}
            onClose={() => setIsNeonModalOpen(false)}
            onShowToast={(msg, type) => addToast(type, msg)}
          />
        </>
      )}
    </div>
  );
}
