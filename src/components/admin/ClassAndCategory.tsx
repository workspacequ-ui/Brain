import React, { useState, useMemo } from 'react';
import { ClassItem, SubjectItem, ExamCategory, Teacher } from '../../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Tag,
  BookMarked,
  BookOpen,
  X,
  Search,
  Check,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Filter,
  RefreshCw,
  Info,
  CheckCircle,
  Users,
  ExternalLink,
  FolderTree
} from 'lucide-react';

interface ClassAndCategoryProps {
  classes: ClassItem[];
  subjects: SubjectItem[];
  categories: ExamCategory[];
  teachers?: Teacher[];
  onSaveClass: (classItem: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  onSaveSubject: (subjectItem: SubjectItem) => void;
  onDeleteSubject: (subjectId: string) => void;
  onSaveCategory: (category: ExamCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSyncAllData?: () => void;
}

const PRESET_CATEGORY_SUGGESTIONS = [
  { name: 'Saintek & MIPA', desc: 'Rumpun Sains, Teknologi, Matematika & Ilmu Pengetahuan Alam' },
  { name: 'Soshum & IPS', desc: 'Rumpun Sosial, Humaniora, Ekonomi, Geografi & Sosiologi' },
  { name: 'TPS & Skolastik', desc: 'Tes Potensi Skolastik, Penalaran Umum & Literasi Kognitif' },
  { name: 'Bahasa & Literasi', desc: 'Literasi Bahasa Indonesia, Bahasa Inggris & Komunikasi' },
  { name: 'Umum & Vokasi', desc: 'Mata Pelajaran Wajib Umum, Pendidikan Karakter & Keterampilan Vokasi' },
  { name: 'SNBT 2026', desc: 'Seleksi Nasional Berdasarkan Tes & Simulasi UTBK' },
  { name: 'TKA Saintek', desc: 'Tes Kemampuan Akademik Saintek' },
  { name: 'Ujian Sekolah', desc: 'Penilaian Akhir Semester & Ujian Sekolah Terstandar' },
  { name: 'Masuk Labschool', desc: 'Seleksi Penerimaan Siswa Baru Labschool' },
  { name: 'Tryout Premium', desc: 'Paket Tryout Eksklusif & Evaluasi Intensif' }
];

export const ClassAndCategory: React.FC<ClassAndCategoryProps> = ({
  classes,
  subjects = [],
  categories,
  teachers = [],
  onSaveClass,
  onDeleteClass,
  onSaveSubject,
  onDeleteSubject,
  onSaveCategory,
  onDeleteCategory,
  onSyncAllData
}) => {
  // Navigation / Filter Tab
  const [activeSection, setActiveSection] = useState<'all' | 'subjects' | 'classes' | 'categories'>('all');
  
  // Search & Filters for Subjects
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectGroupFilter, setSubjectGroupFilter] = useState('ALL');
  const [subjectClassFilter, setSubjectClassFilter] = useState('ALL');

  // Search for Classes & Categories
  const [classSearch, setClassSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');

  // Modal state for Subject (Mata Pelajaran)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjGroup, setSubjGroup] = useState('');
  const [customGroup, setCustomGroup] = useState('');
  const [customGroupDesc, setCustomGroupDesc] = useState('');
  const [saveCustomToMaster, setSaveCustomToMaster] = useState(true);
  const [subjDesc, setSubjDesc] = useState('');
  const [subjTargetClasses, setSubjTargetClasses] = useState<string[]>(['SEMUA']);

  // Modal state for Class
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classDesc, setClassDesc] = useState('');

  // Modal state for Category (Kelompok / Kategori)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ExamCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Sync feedback indicator state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncFeedback('Melakukan validasi relasi data...');
    setTimeout(() => {
      if (onSyncAllData) {
        onSyncAllData();
      }
      setIsSyncing(false);
      setSyncFeedback('Data telah disinkronkan & dirapikan!');
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 400);
  };

  // Open Subject Modal with dynamic categories integration
  const openSubjectModal = (item?: SubjectItem, prefilledGroup?: string) => {
    if (item) {
      setEditingSubject(item);
      setSubjName(item.name);
      setSubjCode(item.code);
      const isExistingInCats = categories.some(c => c.name.toLowerCase() === (item.group || '').toLowerCase());
      if (isExistingInCats) {
        setSubjGroup(item.group || categories[0]?.name || 'Saintek & MIPA');
        setCustomGroup('');
      } else if (item.group) {
        setSubjGroup('CUSTOM');
        setCustomGroup(item.group);
      } else {
        setSubjGroup(categories[0]?.name || 'Saintek & MIPA');
        setCustomGroup('');
      }
      setCustomGroupDesc('');
      setSaveCustomToMaster(true);
      setSubjDesc(item.description || '');
      setSubjTargetClasses(item.targetClasses && item.targetClasses.length > 0 ? item.targetClasses : ['SEMUA']);
    } else {
      setEditingSubject(null);
      setSubjName('');
      setSubjCode('');
      if (prefilledGroup) {
        setSubjGroup(prefilledGroup);
      } else {
        setSubjGroup(categories[0]?.name || 'Saintek & MIPA');
      }
      setCustomGroup('');
      setCustomGroupDesc('');
      setSaveCustomToMaster(true);
      setSubjDesc('');
      setSubjTargetClasses(['SEMUA']);
    }
    setIsSubjectModalOpen(true);
  };

  // Open Class Modal
  const openClassModal = (item?: ClassItem) => {
    if (item) {
      setEditingClass(item);
      setClassName(item.name);
      setClassCode(item.code);
      setClassDesc(item.description);
    } else {
      setEditingClass(null);
      setClassName('');
      setClassCode('');
      setClassDesc('');
    }
    setIsClassModalOpen(true);
  };

  // Open Category Modal
  const openCatModal = (item?: ExamCategory) => {
    if (item) {
      setEditingCat(item);
      setCatName(item.name);
      setCatDesc(item.description);
    } else {
      setEditingCat(null);
      setCatName('');
      setCatDesc('');
    }
    setIsCatModalOpen(true);
  };

  // Save Subject Handler
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !subjCode.trim()) return;

    let finalGroup = subjGroup;
    if (subjGroup === 'CUSTOM') {
      finalGroup = customGroup.trim() || 'Umum & Vokasi';
      if (saveCustomToMaster && customGroup.trim()) {
        const catExists = categories.some(c => c.name.toLowerCase() === customGroup.trim().toLowerCase());
        if (!catExists) {
          onSaveCategory({
            id: `cat-${Date.now()}`,
            name: customGroup.trim(),
            description: customGroupDesc.trim() || `Kelompok / Rumpun terintegrasi untuk ${subjName.trim()}`
          });
        }
      }
    }

    const payload: SubjectItem = {
      id: editingSubject ? editingSubject.id : `sbj-${Date.now()}`,
      name: subjName.trim(),
      code: subjCode.trim().toUpperCase(),
      group: finalGroup,
      description: subjDesc.trim(),
      targetClasses: subjTargetClasses.length > 0 ? subjTargetClasses : ['SEMUA']
    };

    onSaveSubject(payload);
    setIsSubjectModalOpen(false);
  };

  // Save Class Handler
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const payload: ClassItem = {
      id: editingClass ? editingClass.id : `cls-${Date.now()}`,
      name: className.trim(),
      code: classCode.trim().toUpperCase() || className.trim().toUpperCase(),
      description: classDesc.trim() || `Kelas ${className.trim()}`
    };

    onSaveClass(payload);
    setIsClassModalOpen(false);
  };

  // Save Category Handler
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const payload: ExamCategory = {
      id: editingCat ? editingCat.id : `cat-${Date.now()}`,
      name: catName.trim(),
      description: catDesc.trim() || 'Kelompok / Kategori kurikulum terpadu'
    };

    onSaveCategory(payload);
    setIsCatModalOpen(false);
  };

  // Toggle Class selection in Subject form
  const toggleSubjectClass = (clsName: string) => {
    if (clsName === 'SEMUA') {
      if (subjTargetClasses.includes('SEMUA')) {
        setSubjTargetClasses([]);
      } else {
        setSubjTargetClasses(['SEMUA']);
      }
      return;
    }

    let next = subjTargetClasses.filter(c => c !== 'SEMUA');
    if (next.includes(clsName)) {
      next = next.filter(c => c !== clsName);
    } else {
      next = [...next, clsName];
    }
    if (next.length === 0) {
      next = ['SEMUA'];
    }
    setSubjTargetClasses(next);
  };

  // Filtered Subjects List
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (s.group || '').toLowerCase().includes(subjectSearch.toLowerCase());

      const matchGroup =
        subjectGroupFilter === 'ALL' ||
        (s.group && s.group.toLowerCase() === subjectGroupFilter.toLowerCase());

      const matchClass =
        subjectClassFilter === 'ALL' ||
        (s.targetClasses && (s.targetClasses.includes('SEMUA') || s.targetClasses.includes(subjectClassFilter)));

      return matchSearch && matchGroup && matchClass;
    });
  }, [subjects, subjectSearch, subjectGroupFilter, subjectClassFilter]);

  // Filtered Classes List
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      return (
        c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(classSearch.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(classSearch.toLowerCase())
      );
    });
  }, [classes, classSearch]);

  // Filtered Categories List
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      return (
        cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
        (cat.description || '').toLowerCase().includes(catSearch.toLowerCase())
      );
    });
  }, [categories, catSearch]);

  // Get subjects linked to a category
  const getSubjectsForCategory = (catName: string) => {
    return subjects.filter(s => s.group && s.group.toLowerCase() === catName.toLowerCase());
  };

  // Get subjects for a class
  const getSubjectsForClass = (clsName: string) => {
    return subjects.filter(s => s.targetClasses && (s.targetClasses.includes('SEMUA') || s.targetClasses.includes(clsName)));
  };

  // Get teachers count for a subject
  const getTeachersForSubject = (subjName: string) => {
    return teachers.filter(t => t.subject && t.subject.toLowerCase() === subjName.toLowerCase());
  };

  // Get teachers count for a class
  const getTeachersForClass = (clsName: string) => {
    return teachers.filter(t => t.targetClasses && (t.targetClasses.includes('SEMUA') || t.targetClasses.includes(clsName)));
  };

  // Available groups for filtering with counts
  const availableGroups = useMemo(() => {
    const groupCountMap = new Map<string, number>();
    categories.forEach(cat => {
      groupCountMap.set(cat.name, 0);
    });
    subjects.forEach(s => {
      if (s.group) {
        const count = groupCountMap.get(s.group) || 0;
        groupCountMap.set(s.group, count + 1);
      }
    });

    return Array.from(groupCountMap.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }, [categories, subjects]);

  // Group color badge styling helper
  const getGroupBadgeColor = (groupName?: string) => {
    const name = (groupName || '').toLowerCase();
    if (name.includes('saintek') || name.includes('mipa') || name.includes('tka')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
    if (name.includes('soshum') || name.includes('ips') || name.includes('ekonomi')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    }
    if (name.includes('tps') || name.includes('skolastik') || name.includes('penalaran')) {
      return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
    }
    if (name.includes('bahasa') || name.includes('literasi') || name.includes('inggris')) {
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
    }
    if (name.includes('snbt') || name.includes('tryout') || name.includes('premium')) {
      return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
    }
    return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
  };

  const currentSelectedCategoryObj = categories.find(
    c => c.name.toLowerCase() === subjGroup.toLowerCase()
  );

  return (
    <div id="class-and-category-mgmt" className="space-y-6">
      
      {/* Top Banner Header with Status & Fast Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/30 text-indigo-400">
                <FolderTree className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Manajemen Kelas & Mapel
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Data Terintegrasi & Sinkron
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Pusat konfigurasi kurikulum terpadu Brain Space Academy. Sinkronkan Rumpun Mata Pelajaran, Tingkat Kelas pendaftaran siswa, serta Kelompok/Kategori bank soal CBT dalam satu alur data yang rapi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                isSyncing
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600'
              }`}
              title="Sinkronkan & rapikan referensi silang data kurikulum"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
            </button>

            <button
              onClick={() => openSubjectModal()}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Mapel
            </button>

            <button
              onClick={() => openClassModal()}
              className="px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Kelas
            </button>

            <button
              onClick={() => openCatModal()}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Kelompok
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast Message */}
        {syncFeedback && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-700/60 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{syncFeedback}</span>
          </div>
        )}

        {/* Summary Metric Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Card 1: Mata Pelajaran */}
          <div
            onClick={() => setActiveSection('subjects')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              activeSection === 'subjects'
                ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Mata Pelajaran</p>
                <p className="text-lg font-extrabold text-white">{subjects.length} Mapel</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              Kurikulum
            </span>
          </div>

          {/* Card 2: Tingkat Kelas */}
          <div
            onClick={() => setActiveSection('classes')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              activeSection === 'classes'
                ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Tingkat Kelas</p>
                <p className="text-lg font-extrabold text-white">{classes.length} Kelas</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/90 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
              Pendaftaran
            </span>
          </div>

          {/* Card 3: Kelompok / Kategori */}
          <div
            onClick={() => setActiveSection('categories')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              activeSection === 'categories'
                ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/40 shadow-lg shadow-blue-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Kelompok / Kategori</p>
                <p className="text-lg font-extrabold text-white">{categories.length} Kelompok</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/90 border border-blue-800/60 px-2.5 py-1 rounded-lg">
              Master Rumpun
            </span>
          </div>
        </div>

        {/* View Switcher Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar border-t border-slate-800/80">
          <button
            onClick={() => {
              setActiveSection('all');
              setSubjectGroupFilter('ALL');
              setSubjectClassFilter('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSection === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Semua Modul ({subjects.length + classes.length + categories.length})
          </button>

          <button
            onClick={() => setActiveSection('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'subjects'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mata Pelajaran ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'classes'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Tingkat Kelas ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'categories'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kelompok / Kategori ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: GROUP PENGATURAN MATA PELAJARAN (SUBJECTS)                    */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'subjects') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">Group Pengaturan Mata Pelajaran</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    {filteredSubjects.length} dari {subjects.length} Mapel
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Daftar kurikulum mata pelajaran, kode singkatan CBT, relasi Kelompok/Rumpun, dan target tingkat kelas.
                </p>
              </div>
            </div>

            <button
              onClick={() => openSubjectModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
            </button>
          </div>

          {/* Search & Integrated Filter Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Keyword Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={e => setSubjectSearch(e.target.value)}
                  placeholder="Cari mata pelajaran, kode (MTK, FIS, BIO), atau deskripsi silabus..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {subjectSearch && (
                  <button
                    onClick={() => setSubjectSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Class Filter Dropdown */}
              <div className="w-full sm:w-56">
                <select
                  value={subjectClassFilter}
                  onChange={e => setSubjectClassFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Semua Target Kelas</option>
                  <option value="SEMUA">Khusus: Semua Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>
                      Kelas: {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kelompok / Rumpun Pill Filters with Counts */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3 h-3 text-emerald-400" /> Rumpun Mapel:
              </span>

              <button
                onClick={() => setSubjectGroupFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  subjectGroupFilter === 'ALL'
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({subjects.length})
              </button>

              {availableGroups.map(grp => (
                <button
                  key={grp.name}
                  onClick={() => setSubjectGroupFilter(grp.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    subjectGroupFilter.toLowerCase() === grp.name.toLowerCase()
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{grp.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      subjectGroupFilter.toLowerCase() === grp.name.toLowerCase()
                        ? 'bg-emerald-800/90 text-emerald-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {grp.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Cards Grid */}
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-300">
                  {subjectSearch || subjectGroupFilter !== 'ALL' || subjectClassFilter !== 'ALL'
                    ? 'Tidak ada mata pelajaran yang cocok dengan kriteria filter.'
                    : 'Belum ada data mata pelajaran terdaftar.'}
                </p>
                <p className="text-xs text-slate-500">
                  Tambahkan mata pelajaran untuk melengkapi kurikulum pembelajaran dan paket soal CBT.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                {(subjectSearch || subjectGroupFilter !== 'ALL' || subjectClassFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSubjectSearch('');
                      setSubjectGroupFilter('ALL');
                      setSubjectClassFilter('ALL');
                    }}
                    className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  onClick={() => openSubjectModal(undefined, subjectGroupFilter !== 'ALL' ? subjectGroupFilter : undefined)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
                >
                  <Plus className="w-4 h-4" /> Tambah Mata Pelajaran Baru
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubjects.map(s => {
                const mappedTeachers = getTeachersForSubject(s.name);
                const teacherCount = mappedTeachers.length;

                return (
                  <div
                    key={s.id}
                    className="p-4.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3.5 hover:border-emerald-500/40 hover:bg-slate-950/90 transition-all hover:shadow-lg group"
                  >
                    <div className="space-y-2.5">
                      {/* Top Header: Code & Group Tag & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-extrabold border border-slate-700 shadow-sm">
                            {s.code}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getGroupBadgeColor(
                              s.group
                            )}`}
                          >
                            {s.group || 'Umum & Vokasi'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openSubjectModal(s)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Edit Mata Pelajaran"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus mata pelajaran "${s.name}"?`)) onDeleteSubject(s.id);
                            }}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Hapus Mata Pelajaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subject Name & Description */}
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm group-hover:text-emerald-300 transition-colors leading-snug">
                          {s.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {s.description || 'Tidak ada deskripsi silabus.'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata: Target Classes & Teacher Info */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Kelas:</span>
                        {s.targetClasses && s.targetClasses.includes('SEMUA') ? (
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold">
                            Semua Kelas
                          </span>
                        ) : (
                          s.targetClasses?.slice(0, 3).map((cls, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px]"
                            >
                              {cls}
                            </span>
                          ))
                        )}
                        {s.targetClasses && s.targetClasses.length > 3 && !s.targetClasses.includes('SEMUA') && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            +{s.targetClasses.length - 3}
                          </span>
                        )}
                      </div>

                      {teacherCount > 0 ? (
                        <span
                          className="text-[10px] text-cyan-300 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0"
                          title={`Guru Pengajar: ${mappedTeachers.map(t => t.name).join(', ')}`}
                        >
                          <GraduationCap className="w-3 h-3 text-cyan-400" />
                          {teacherCount} Guru
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic shrink-0">Belum ada guru</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2 & 3: GRID DAFTAR KELAS & KELOMPOK / KATEGORI                    */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'classes' || activeSection === 'categories') && (
        <div className={`grid grid-cols-1 ${activeSection === 'all' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          
          {/* ===================================================================== */}
          {/* BAGIAN: MANAJEMEN TINGKAT KELAS                                      */}
          {/* ===================================================================== */}
          {(activeSection === 'all' || activeSection === 'classes') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">Daftar Tingkat Kelas</h3>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                          {classes.length} Kelas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Tingkat kelas pendaftaran siswa & pembagian tugas ujian</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openClassModal()}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-950/40 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kelas
                  </button>
                </div>

                {/* Class Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={classSearch}
                    onChange={e => setClassSearch(e.target.value)}
                    placeholder="Filter nama atau kode kelas..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {classSearch && (
                    <button
                      onClick={() => setClassSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Classes List */}
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredClasses.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-xs text-slate-500 space-y-2">
                      <p>Tidak ada kelas yang sesuai pencarian.</p>
                      <button
                        onClick={() => openClassModal()}
                        className="px-3 py-1.5 bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs hover:bg-cyan-600/50"
                      >
                        + Tambah Kelas Baru
                      </button>
                    </div>
                  ) : (
                    filteredClasses.map(c => {
                      const classSubjects = getSubjectsForClass(c.name);
                      const classTeachers = getTeachersForClass(c.name);

                      return (
                        <div
                          key={c.id}
                          className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col justify-between gap-2.5 hover:border-cyan-500/40 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                                  {c.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-mono text-[10px] font-bold border border-slate-700">
                                  {c.code}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openClassModal(c)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Edit Kelas"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus kelas "${c.name}"? Siswa dan mapel yang terhubung akan tetap aman.`)) {
                                    onDeleteClass(c.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Hapus Kelas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Class Footer Stats & Filter Action */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                              <span>
                                <strong className="text-emerald-400">{classSubjects.length}</strong> Mapel
                              </span>
                              <span>
                                <strong className="text-cyan-400">{classTeachers.length}</strong> Guru
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setActiveSection('subjects');
                                setSubjectClassFilter(c.name);
                                setSubjectGroupFilter('ALL');
                              }}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <span>Lihat Mapel</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* BAGIAN: MANAJEMEN KELOMPOK / KATEGORI (TERINTEGRASI)                  */}
          {/* ===================================================================== */}
          {(activeSection === 'all' || activeSection === 'categories') && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">Kelompok / Kategori</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold">
                          {categories.length} Kelompok
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Master data terintegrasi untuk Rumpun Mata Pelajaran & Klasifikasi Ujian CBT
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openCatModal()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-950/40 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kelompok
                  </button>
                </div>

                {/* Category Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={e => setCatSearch(e.target.value)}
                    placeholder="Filter nama atau deskripsi kelompok/kategori..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {catSearch && (
                    <button
                      onClick={() => setCatSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Cards List for Kelompok / Kategori with Linked Subjects */}
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-xs text-slate-500 space-y-2">
                      <p>Tidak ada kelompok / kategori yang sesuai pencarian.</p>
                      <button
                        onClick={() => openCatModal()}
                        className="px-3 py-1.5 bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs hover:bg-blue-600/50"
                      >
                        + Buat Kelompok Baru
                      </button>
                    </div>
                  ) : (
                    filteredCategories.map((cat, idx) => {
                      const linkedSubjects = getSubjectsForCategory(cat.name);

                      return (
                        <div
                          key={`cat-card-${cat.id}-${idx}`}
                          className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col justify-between gap-2.5 hover:border-blue-500/40 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-100 text-sm group-hover:text-blue-300 transition-colors">
                                  {cat.name}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getGroupBadgeColor(
                                    cat.name
                                  )}`}
                                >
                                  {linkedSubjects.length} Mapel Terhubung
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{cat.description}</p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openCatModal(cat)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Edit Kelompok / Kategori"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const warn = linkedSubjects.length > 0 
                                    ? `Ada ${linkedSubjects.length} mata pelajaran terhubung ke kelompok ini. Tetap hapus kelompok/kategori "${cat.name}"?`
                                    : `Hapus kelompok / kategori "${cat.name}"?`;
                                  if (confirm(warn)) onDeleteCategory(cat.id);
                                }}
                                className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-lg text-xs transition-colors cursor-pointer"
                                title="Hapus Kelompok / Kategori"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Linked Subjects Badges & Quick Action */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
                              <span className="text-slate-500 text-[10px] uppercase font-bold">Mapel:</span>
                              {linkedSubjects.length === 0 ? (
                                <span className="text-[10px] text-slate-500 italic">Belum ada mapel di kelompok ini</span>
                              ) : (
                                linkedSubjects.slice(0, 4).map(s => (
                                  <span
                                    key={s.id}
                                    className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold rounded text-[10px]"
                                    title={s.name}
                                  >
                                    {s.code}
                                  </span>
                                ))
                              )}
                              {linkedSubjects.length > 4 && (
                                <span className="text-[10px] text-slate-500 font-bold">
                                  +{linkedSubjects.length - 4}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {linkedSubjects.length > 0 && (
                                <button
                                  onClick={() => {
                                    setActiveSection('subjects');
                                    setSubjectGroupFilter(cat.name);
                                    setSubjectClassFilter('ALL');
                                  }}
                                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                                >
                                  <span>Lihat Mapel</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                              <button
                                onClick={() => openSubjectModal(undefined, cat.name)}
                                className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-md text-[10px] font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Tambah mata pelajaran baru langsung di kelompok ini"
                              >
                                <Plus className="w-2.5 h-2.5" /> Mapel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL MATA PELAJARAN (INTEGRATED WITH KELOMPOK / KATEGORI)                */}
      {/* ========================================================================= */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Mata Pelajaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={subjName}
                  onChange={e => {
                    setSubjName(e.target.value);
                    if (!editingSubject && !subjCode) {
                      // auto suggest uppercase code
                      const words = e.target.value.trim().split(' ');
                      if (words.length === 1 && words[0].length >= 3) {
                        setSubjCode(words[0].substring(0, 4).toUpperCase());
                      } else if (words.length > 1) {
                        setSubjCode(words.map(w => w[0]).join('').substring(0, 4).toUpperCase());
                      }
                    }
                  }}
                  placeholder="Misal: Matematika & TPS Kuantitatif, Fisika Saintek"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kode Singkatan Mapel <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={subjCode}
                    onChange={e => setSubjCode(e.target.value.toUpperCase())}
                    placeholder="MTK / FIS / BIO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Kode referensi CBT / Laporan</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kelompok / Rumpun Mapel <span className="text-blue-400 text-[10px] font-normal">(Terintegrasi)</span>
                  </label>
                  <select
                    value={subjGroup}
                    onChange={e => setSubjGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <optgroup label="Master Kelompok / Kategori">
                      {categories.map((cat, idx) => (
                        <option key={`opt-cat-${cat.id}-${idx}`} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </optgroup>
                    <option value="CUSTOM">+ Buat Kelompok / Kategori Baru...</option>
                  </select>
                  {currentSelectedCategoryObj && (
                    <span className="text-[10px] text-emerald-400/90 mt-1 block truncate">
                      ✓ {currentSelectedCategoryObj.description}
                    </span>
                  )}
                </div>
              </div>

              {subjGroup === 'CUSTOM' && (
                <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-2xl space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Tambah Kelompok / Kategori Baru
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nama Kelompok / Kategori Baru <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customGroup}
                      onChange={e => setCustomGroup(e.target.value)}
                      placeholder="Misal: Seni & Budaya, Bahasa Asing, Kedinasan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Deskripsi Cakupan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={customGroupDesc}
                      onChange={e => setCustomGroupDesc(e.target.value)}
                      placeholder="Deskripsi singkat kelompok / kategori ini..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCustomToMaster}
                      onChange={e => setSaveCustomToMaster(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-300">
                      Simpan otomatis ke Master Kelompok/Kategori (terintegrasi ke Bank Soal & CBT)
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Target Tingkat Kelas
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSubjectClass('SEMUA')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        subjTargetClasses.includes('SEMUA')
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {subjTargetClasses.includes('SEMUA') && <Check className="w-3 h-3" />}
                      Semua Kelas
                    </button>

                    {classes.map(cls => {
                      const isSelected = subjTargetClasses.includes(cls.name);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => toggleSubjectClass(cls.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {cls.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi / Cakupan Silabus Pembelajaran
                </label>
                <textarea
                  value={subjDesc}
                  onChange={e => setSubjDesc(e.target.value)}
                  placeholder="Misal: Penalaran Aljabar, Geometri, Kalkulus, Statistika dan Pemecahan Masalah Kuantitatif"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CLASS                                                               */}
      {/* ========================================================================= */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <BookMarked className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingClass ? 'Edit Tingkat Kelas' : 'Tambah Kelas Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Kelas (misal: XII-UTBK, X-IPA) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={e => {
                    setClassName(e.target.value);
                    if (!editingClass && !classCode) {
                      setClassCode(e.target.value.trim().toUpperCase());
                    }
                  }}
                  placeholder="XII-UTBK"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kode Singkatan Kelas
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  placeholder="UTBK / IPA-11"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={classDesc}
                  onChange={e => setClassDesc(e.target.value)}
                  placeholder="Kelas intensif persiapan ujian SNBT & Kedinasan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KELOMPOK / KATEGORI (TERINTEGRASI)                                  */}
      {/* ========================================================================= */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingCat ? 'Edit Kelompok / Kategori' : 'Tambah Kelompok / Kategori Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Kelompok / Kategori <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="Misal: Saintek & MIPA, Soshum, SNBT 2026, TPS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Akan digunakan sebagai Rumpun Mapel dan Kategori Ujian CBT
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi Kelompok / Kategori
                </label>
                <textarea
                  value={catDesc}
                  onChange={e => setCatDesc(e.target.value)}
                  placeholder="Deskripsi cakupan keilmuan atau klasifikasi modul..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Preset Suggestions Pills */}
              {!editingCat && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Contoh Preset Cepat:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {PRESET_CATEGORY_SUGGESTIONS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCatName(preset.name);
                          setCatDesc(preset.desc);
                        }}
                        className="px-2 py-1 bg-slate-950 hover:bg-blue-950 border border-slate-800 hover:border-blue-700 text-[10px] text-slate-300 hover:text-blue-200 rounded-lg transition-colors cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-950/40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Kelompok/Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
