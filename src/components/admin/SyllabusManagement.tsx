import React, { useState, useMemo } from 'react';
import {
  SyllabusItem,
  SyllabusTopic,
  SyllabusStatus,
  ClassItem,
  SubjectItem,
  Teacher,
  LearningMaterial,
  Exam
} from '../../types';
import {
  BookMarked,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Printer,
  Sparkles,
  BookOpen,
  FileCheck2,
  Eye,
  X,
  PlusCircle,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Share2,
  Download,
  LayoutGrid,
  List,
  CalendarDays,
  Flame,
  Lightbulb,
  Check,
  Table,
  HardDrive,
  Link2,
  FileDown,
  FolderOpen,
  Star,
  Zap,
  Target,
  Compass,
  Award
} from 'lucide-react';
import { SyllabusJournalTab } from './SyllabusJournalTab';
import { loadStoredJournals, LearningJournalMeeting } from '../labschool/labschoolLaporanData';
import { LabschoolPrintSyllabusModal } from '../labschool/LabschoolPrintSyllabusModal';
import {
  OFFICIAL_SNBT_7_ACADEMIC_SYLLABI,
  SNBT_7_SUBTEST_METAS,
  SnbtSubtestCode
} from '../snbt/snbtSyllabusData';

interface SyllabusManagementProps {
  syllabi: SyllabusItem[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  teachers: Teacher[];
  materials?: LearningMaterial[];
  exams?: Exam[];
  onSaveSyllabus: (syllabus: SyllabusItem) => void;
  onDeleteSyllabus: (id: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type ViewMode = 'grid' | 'timeline' | 'table';

export const SyllabusManagement: React.FC<SyllabusManagementProps> = ({
  syllabi,
  classes,
  subjects,
  teachers,
  materials = [],
  exams = [],
  onSaveSyllabus,
  onDeleteSyllabus,
  onShowToast
}) => {
  // Filters and UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSnbtFilter, setSelectedSnbtFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Active items in modals
  const [currentSyllabus, setCurrentSyllabus] = useState<SyllabusItem | null>(null);
  const [syllabusToDelete, setSyllabusToDelete] = useState<SyllabusItem | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'topics' | 'journals'>('topics');
  const [journals, setJournals] = useState<LearningJournalMeeting[]>(() => loadStoredJournals());

  // Helper to calculate linked journal metrics for any syllabus
  const getLinkedJournalStats = (sil: SyllabusItem) => {
    const isLabschool = sil.code.includes('LAB') || sil.title.toLowerCase().includes('labschool');
    const level: 'SMA' | 'SMP' = sil.code.includes('SMP') || sil.targetClass.toUpperCase().includes('SMP') ? 'SMP' : 'SMA';
    const matches = journals.filter(j => {
      if (j.syllabusId && (j.syllabusId === sil.id || j.syllabusCode === sil.code)) return true;
      if (j.syllabusCode && j.syllabusCode.toLowerCase() === sil.code.toLowerCase()) return true;
      if (isLabschool && j.level === level) return true;
      if (j.subjectName && sil.subject && j.subjectName.toLowerCase().includes(sil.subject.toLowerCase())) return true;
      return false;
    });
    const avgComprehension = matches.length > 0
      ? Math.round(matches.reduce((acc, curr) => acc + curr.comprehensionPercentage, 0) / matches.length)
      : 0;
    return { count: matches.length, avgComprehension, matches };
  };

  // Form State
  const [formId, setFormId] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formTargetClass, setFormTargetClass] = useState('');
  const [formAcademicYear, setFormAcademicYear] = useState('2025/2026 Ganjil & Genap');
  const [formTeacherInCharge, setFormTeacherInCharge] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTotalMeetings, setFormTotalMeetings] = useState(8);
  const [formStatus, setFormStatus] = useState<SyllabusStatus>('ACTIVE');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formSnbtSubtestCode, setFormSnbtSubtestCode] = useState<string>('');
  const [formSnbtCategory, setFormSnbtCategory] = useState<string>('');
  const [formTopics, setFormTopics] = useState<SyllabusTopic[]>([]);

  // Expanded topics in detail view
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [detailTopicView, setDetailTopicView] = useState<'table' | 'card'>('table');

  // Quick topic/meeting edit modal state
  const [topicEditModalData, setTopicEditModalData] = useState<{
    syllabusId: string;
    topicIndex: number;
    topic: SyllabusTopic;
  } | null>(null);
  const [topicSubtopicsRaw, setTopicSubtopicsRaw] = useState<string>('');

  // Filtered Syllabi
  const filteredSyllabi = useMemo(() => {
    return syllabi.filter(sil => {
      const matchSearch =
        sil.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sil.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sil.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sil.teacherInCharge && sil.teacherInCharge.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sil.snbtSubtestCode && sil.snbtSubtestCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sil.snbtCategory && sil.snbtCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        sil.topics.some(
          t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.competency.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subtopics.some(st => st.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      const matchClass = selectedClass === 'ALL' || sil.targetClass === selectedClass || sil.targetClass === 'SEMUA';
      const matchSubject = selectedSubject === 'ALL' || sil.subject === selectedSubject;
      const matchStatus = selectedStatus === 'ALL' || sil.status === selectedStatus;

      let matchSnbt = true;
      if (selectedSnbtFilter === 'SNBT_ALL') {
        matchSnbt = Boolean(sil.snbtSubtestCode) || sil.targetClass === 'XII-UTBK' || sil.code.toLowerCase().includes('snbt') || sil.title.toLowerCase().includes('snbt') || sil.code.toLowerCase().includes('utbk');
      } else if (selectedSnbtFilter === 'TPS') {
        matchSnbt = sil.snbtCategory === 'TPS' || ['PU', 'PPU', 'PBM', 'PK'].includes(sil.snbtSubtestCode || '');
      } else if (selectedSnbtFilter === 'LITERASI') {
        matchSnbt = sil.snbtCategory === 'Literasi' || ['LBI', 'LBE'].includes(sil.snbtSubtestCode || '');
      } else if (selectedSnbtFilter === 'PM') {
        matchSnbt = sil.snbtCategory === 'Penalaran Matematika' || sil.snbtSubtestCode === 'PM';
      } else if (['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE'].includes(selectedSnbtFilter)) {
        matchSnbt = sil.snbtSubtestCode === selectedSnbtFilter || sil.code.toLowerCase().includes(selectedSnbtFilter.toLowerCase()) || sil.title.toLowerCase().includes(selectedSnbtFilter.toLowerCase());
      }

      return matchSearch && matchClass && matchSubject && matchStatus && matchSnbt;
    });
  }, [syllabi, searchQuery, selectedClass, selectedSubject, selectedStatus, selectedSnbtFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = syllabi.length;
    const active = syllabi.filter(s => s.status === 'ACTIVE').length;
    const draft = syllabi.filter(s => s.status === 'DRAFT').length;
    const totalTopics = syllabi.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
    const coveredSubjects = new Set(syllabi.map(s => s.subject)).size;
    const snbtCount = syllabi.filter(s => Boolean(s.snbtSubtestCode) || s.targetClass === 'XII-UTBK').length;

    return { total, active, draft, totalTopics, coveredSubjects, snbtCount };
  }, [syllabi]);

  // Handle opening Create Modal
  const handleOpenCreateModal = () => {
    const defaultSubj = subjects[0]?.name || 'Matematika & TPS Kuantitatif';
    const defaultCls = classes[0]?.name || 'XII-UTBK';
    const defaultTch = teachers[0]?.name || '';

    setFormId(`sil-${Date.now()}`);
    setFormCode(`SIL-${defaultSubj.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
    setFormTitle('');
    setFormSubject(defaultSubj);
    setFormTargetClass(defaultCls);
    setFormAcademicYear('2025/2026 Ganjil & Genap');
    setFormTeacherInCharge(defaultTch);
    setFormDescription('');
    setFormTotalMeetings(8);
    setFormStatus('ACTIVE');
    setFormPdfUrl('');
    setFormSnbtSubtestCode('');
    setFormSnbtCategory('');

    // Default 4 starter topics
    const starterTopics: SyllabusTopic[] = [
      {
        id: `top-${Date.now()}-1`,
        meetingNumber: 1,
        title: 'Pengantar Konsep & Fondasi Materi',
        subtopics: ['Definisi dan Lingkup Materi', 'Formula & Karakteristik Dasar', 'Contoh Soal Penerapan Standar'],
        competency: 'Siswa menguasai fondasi konseptual materi dasar secara komprehensif.',
        durationMinutes: 90,
        teachingMethod: 'Ceramah Interaktif & Latihan Bersama',
        referenceNotes: 'Buku Pegangan Utama Bab 1'
      },
      {
        id: `top-${Date.now()}-2`,
        meetingNumber: 2,
        title: 'Pendalaman Materi & Analisis Kasus',
        subtopics: ['Kaidah Lanjutan & Manipulasi Aljabar/Rumus', 'Identifikasi Jebakan Soal', 'Latihan Soal Mandiri'],
        competency: 'Siswa mampu menganalisis variasi soal bertingkat dan memecahkan studi kasus.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning & Diskusi',
        referenceNotes: 'Modul Latihan Mandiri'
      }
    ];

    setFormTopics(starterTopics);
    setIsFormModalOpen(true);
  };

  // Handle opening Edit Modal
  const handleOpenEditModal = (sil: SyllabusItem) => {
    setFormId(sil.id);
    setFormCode(sil.code);
    setFormTitle(sil.title);
    setFormSubject(sil.subject);
    setFormTargetClass(sil.targetClass);
    setFormAcademicYear(sil.academicYear);
    setFormTeacherInCharge(sil.teacherInCharge || '');
    setFormDescription(sil.description);
    setFormTotalMeetings(sil.totalMeetings || sil.topics.length || 8);
    setFormStatus(sil.status);
    setFormPdfUrl(sil.pdfUrl || '');
    setFormSnbtSubtestCode(sil.snbtSubtestCode || '');
    setFormSnbtCategory(sil.snbtCategory || '');
    setFormTopics(sil.topics ? JSON.parse(JSON.stringify(sil.topics)) : []);
    setIsFormModalOpen(true);
  };

  // Handle opening Detail Modal
  const handleOpenDetailModal = (sil: SyllabusItem, defaultTab: 'topics' | 'journals' = 'topics') => {
    setCurrentSyllabus(sil);
    setDetailActiveTab(defaultTab);
    // Refresh journals from storage
    setJournals(loadStoredJournals());
    // Expand first 2 topics by default
    const initExpanded: Record<string, boolean> = {};
    sil.topics?.forEach((t, idx) => {
      if (idx < 2) initExpanded[t.id] = true;
    });
    setExpandedTopics(initExpanded);
    setIsDetailModalOpen(true);
  };

  // Duplicate / Clone Syllabus
  const handleDuplicateSyllabus = (sil: SyllabusItem) => {
    const duplicated: SyllabusItem = {
      ...JSON.parse(JSON.stringify(sil)),
      id: `sil-${Date.now()}`,
      code: `${sil.code}-COPY`,
      title: `[Salinan] ${sil.title}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: undefined
    };

    onSaveSyllabus(duplicated);
    if (onShowToast) {
      onShowToast(`Silabus "${sil.title}" berhasil diduplikasi.`, 'success');
    }
  };

  // Toggle Syllabus Status
  const handleToggleStatus = (sil: SyllabusItem) => {
    const nextStatus: SyllabusStatus = sil.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    const updated: SyllabusItem = {
      ...sil,
      status: nextStatus,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSaveSyllabus(updated);
    if (onShowToast) {
      onShowToast(`Status silabus diubah menjadi ${nextStatus}.`, 'info');
    }
  };

  // Topic builder helpers in Form Modal
  const handleAddTopic = () => {
    const nextMeeting = formTopics.length + 1;
    const newTopic: SyllabusTopic = {
      id: `top-${Date.now()}-${nextMeeting}`,
      meetingNumber: nextMeeting,
      title: `Topik Pertemuan Ke-${nextMeeting}`,
      subtopics: ['Pokok Bahasan Utama', 'Latihan Soal Terarah'],
      competency: 'Menguasai materi pembelajaran pertemuan dengan tepat.',
      durationMinutes: 90,
      teachingMethod: 'Ceramah & Drill Soal'
    };
    const updated = [...formTopics, newTopic];
    setFormTopics(updated);
    setFormTotalMeetings(updated.length);
  };

  const handleUpdateTopic = (index: number, updatedFields: Partial<SyllabusTopic>) => {
    const updated = [...formTopics];
    updated[index] = { ...updated[index], ...updatedFields };
    setFormTopics(updated);
  };

  const handleDeleteTopic = (index: number) => {
    const filtered = formTopics.filter((_, idx) => idx !== index);
    // Re-index meeting numbers
    const reindexed = filtered.map((t, idx) => ({
      ...t,
      meetingNumber: idx + 1
    }));
    setFormTopics(reindexed);
    setFormTotalMeetings(reindexed.length);
  };

  const handleMoveTopic = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formTopics.length - 1) return;

    const updated = [...formTopics];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-index meeting numbers
    const reindexed = updated.map((t, idx) => ({
      ...t,
      meetingNumber: idx + 1
    }));
    setFormTopics(reindexed);
  };

  // Subtopic helpers
  const handleSubtopicTextChange = (topicIndex: number, textValue: string) => {
    const lines = textValue
      .split('\n')
      .map(l => l.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);
    handleUpdateTopic(topicIndex, { subtopics: lines.length > 0 ? lines : ['Pokok Bahasan Utama'] });
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      if (onShowToast) onShowToast('Judul silabus wajib diisi.', 'error');
      return;
    }

    if (!formSubject) {
      if (onShowToast) onShowToast('Pilih mata pelajaran.', 'error');
      return;
    }

    const newSyllabus: SyllabusItem = {
      id: formId,
      code: formCode.trim() || `SIL-${Date.now().toString().slice(-4)}`,
      title: formTitle.trim(),
      subject: formSubject,
      targetClass: formTargetClass || 'SEMUA',
      academicYear: formAcademicYear.trim() || '2025/2026 Ganjil & Genap',
      teacherInCharge: formTeacherInCharge.trim() || undefined,
      description: formDescription.trim() || `Rencana Pelaksanaan Pembelajaran & Silabus ${formTitle}`,
      totalMeetings: formTopics.length || formTotalMeetings || 8,
      status: formStatus,
      topics: formTopics,
      pdfUrl: formPdfUrl.trim() || undefined,
      snbtSubtestCode: formSnbtSubtestCode.trim() || undefined,
      snbtCategory: formSnbtCategory.trim() || undefined,
      createdAt: currentSyllabus?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveSyllabus(newSyllabus);
    setIsFormModalOpen(false);
    if (onShowToast) {
      onShowToast(`Silabus "${newSyllabus.title}" berhasil disimpan!`, 'success');
    }
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!syllabusToDelete) return;
    onDeleteSyllabus(syllabusToDelete.id);
    setIsDeleteModalOpen(false);
    setSyllabusToDelete(null);
    if (onShowToast) {
      onShowToast('Silabus berhasil dihapus.', 'info');
    }
  };

  // Generate Official SNBT Template
  const handleApplyOfficialSnbtTemplate = (subtestCode: SnbtSubtestCode) => {
    const blueprint = OFFICIAL_SNBT_7_ACADEMIC_SYLLABI.find(s => s.snbtSubtestCode === subtestCode);
    const subtestMeta = SNBT_7_SUBTEST_METAS.find(m => m.code === subtestCode);

    if (blueprint) {
      const matchedTeacher = teachers.find(t =>
        (blueprint.teacherInCharge && t.name.toLowerCase().includes(blueprint.teacherInCharge.toLowerCase())) ||
        t.targetClasses.includes('XII-UTBK') ||
        t.subject.toLowerCase().includes(blueprint.subject.toLowerCase())
      );

      setFormId(`sil-${Date.now()}`);
      setFormCode(blueprint.code);
      setFormTitle(blueprint.title);
      setFormSubject(blueprint.subject);
      setFormTargetClass(blueprint.targetClass);
      setFormAcademicYear(blueprint.academicYear);
      setFormTeacherInCharge(matchedTeacher?.name || blueprint.teacherInCharge || teachers[0]?.name || '');
      setFormDescription(blueprint.description);
      setFormTotalMeetings(blueprint.totalMeetings || blueprint.topics.length || 8);
      setFormStatus('ACTIVE');
      setFormPdfUrl(blueprint.pdfUrl || '');
      setFormSnbtSubtestCode(blueprint.snbtSubtestCode || subtestCode);
      setFormSnbtCategory(blueprint.snbtCategory || subtestMeta?.category || 'TPS');
      setFormTopics(JSON.parse(JSON.stringify(blueprint.topics)));

      setIsTemplateModalOpen(false);
      setIsFormModalOpen(true);

      if (onShowToast) {
        onShowToast(`Blueprint resmi SNBT Subtes ${subtestCode} (${subtestMeta?.name}) berhasil dimuat!`, 'success');
      }
    }
  };

  // Generate Quick Template
  const handleApplyQuickTemplate = (subjectName: string, className: string) => {
    const templateTitle = `Silabus Standar Kurikulum ${subjectName} (${className})`;
    const matchedTeacher = teachers.find(t => t.targetClasses.includes(className) || t.subject.toLowerCase().includes(subjectName.toLowerCase()));

    const generatedTopics: SyllabusTopic[] = [
      {
        id: `tpl-top-1`,
        meetingNumber: 1,
        title: `Konsep Dasar & Peta Kompetensi ${subjectName}`,
        subtopics: ['Tinjauan Umum Kurikulum', 'Fondasi Teoretis & Terminologi Inti', 'Review Soal Diagnostik Awal'],
        competency: `Siswa memahami peta kompetensi dan konsep esensial ${subjectName}.`,
        durationMinutes: 90,
        teachingMethod: 'Diagnostic Assessment & Ceramah Interaktif'
      },
      {
        id: `tpl-top-2`,
        meetingNumber: 2,
        title: `Bab 1: Pendalaman Teori & Model Analisis`,
        subtopics: ['Prinsip Pokok & Penurunan Rumus', 'Metode Pemecahan Masalah Sistematis', 'Studi Kasus Kontekstual'],
        competency: 'Mampu memformulasikan solusi masalah dengan pendekatan analitis terstandar.',
        durationMinutes: 90,
        teachingMethod: 'Problem Based Learning (PBL)'
      },
      {
        id: `tpl-top-3`,
        meetingNumber: 3,
        title: `Bab 2: Variasi Soal Latihan & Bedah Kasus Terpadu`,
        subtopics: ['Latihan Soal Bertingkat (Mudah, Sedang, HOTS)', 'Pola Kesalahan Umum & Jebakan Soal', 'Diskusi Pemecahan Cepat'],
        competency: 'Mampu menyelesaikan soal aplikasi dengan tingkat ketelitian tinggi.',
        durationMinutes: 90,
        teachingMethod: 'Drill Soal Terbimbing & Peer Discussion'
      },
      {
        id: `tpl-top-4`,
        meetingNumber: 4,
        title: `Evaluasi Formatif & Latihan CBT Digital`,
        subtopics: ['Kuis Berwaktu 20 Soal CBT', 'Analisis Ketuntasan Belajar & Pembahasan Tuntas', 'Rencana Pengayaan & Remedial'],
        competency: 'Mengukur pencapaian ketuntasan kompetensi bab 1 dan 2.',
        durationMinutes: 90,
        teachingMethod: 'Simulasi CBT Digital & Umpan Balik Instan'
      }
    ];

    setFormId(`sil-${Date.now()}`);
    setFormCode(`SIL-${subjectName.substring(0, 3).toUpperCase()}-${className.replace(/[^a-zA-Z0-9]/g, '')}-01`);
    setFormTitle(templateTitle);
    setFormSubject(subjectName);
    setFormTargetClass(className);
    setFormAcademicYear('2025/2026 Ganjil & Genap');
    setFormTeacherInCharge(matchedTeacher?.name || teachers[0]?.name || '');
    setFormDescription(`Silabus terstruktur kurikulum ${subjectName} untuk kelas ${className} dirancang untuk penguasaan materi komprehensif, latihan soal HOTS, dan evaluasi berkala.`);
    setFormTotalMeetings(4);
    setFormStatus('ACTIVE');
    setFormPdfUrl('');
    setFormTopics(generatedTopics);

    setIsTemplateModalOpen(false);
    setIsFormModalOpen(true);

    if (onShowToast) {
      onShowToast('Template silabus berhasil dimuat! Anda dapat menyesuaikan rincian bab di bawah.', 'success');
    }
  };

  // Print Modal State for Syllabus Preview & Print
  const [isPrintSyllabusModalOpen, setIsPrintSyllabusModalOpen] = useState<boolean>(false);
  const [printModalLevel, setPrintModalLevel] = useState<'SMP' | 'SMA'>('SMA');

  // Print Window Handler for Detail View
  const handlePrintSyllabus = () => {
    if (currentSyllabus) {
      const isSmp =
        currentSyllabus.targetClass?.toLowerCase().includes('smp') ||
        currentSyllabus.code?.toLowerCase().includes('smp') ||
        currentSyllabus.title?.toLowerCase().includes('smp');
      setPrintModalLevel(isSmp ? 'SMP' : 'SMA');
    }
    setIsPrintSyllabusModalOpen(true);
  };

  // Quick Edit Topic Handler (Pertemuan & Capaian)
  const handleOpenQuickEditTopic = (sil: SyllabusItem, top: SyllabusTopic, idx: number) => {
    setTopicEditModalData({
      syllabusId: sil.id,
      topicIndex: idx,
      topic: JSON.parse(JSON.stringify(top))
    });
    setTopicSubtopicsRaw(top.subtopics ? top.subtopics.join('\n') : '');
  };

  const handleSaveQuickEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicEditModalData || !currentSyllabus) return;

    const subtopics = topicSubtopicsRaw
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    const updatedTopic: SyllabusTopic = {
      ...topicEditModalData.topic,
      subtopics: subtopics.length > 0 ? subtopics : ['Pokok Bahasan Utama']
    };

    const updatedTopics = [...(currentSyllabus.topics || [])];
    updatedTopics[topicEditModalData.topicIndex] = updatedTopic;

    const updatedSyllabus: SyllabusItem = {
      ...currentSyllabus,
      topics: updatedTopics,
      totalMeetings: updatedTopics.length,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveSyllabus(updatedSyllabus);
    setCurrentSyllabus(updatedSyllabus);
    setTopicEditModalData(null);

    if (onShowToast) {
      onShowToast(`Rincian Pertemuan P-${updatedTopic.meetingNumber || topicEditModalData.topicIndex + 1} berhasil diperbarui!`, 'success');
    }
  };

  // Remove / delete a specific field from RUJUKAN & INTEGRASI (Drive link, Material, Exam, or Reference)
  const handleRemoveTopicField = (
    topicIndex: number,
    field: 'referenceNotes' | 'driveLink' | 'linkedMaterial' | 'linkedExam'
  ) => {
    if (!currentSyllabus) return;
    const currentTopics = currentSyllabus.topics || [];
    if (!currentTopics[topicIndex]) return;

    const targetTopic = currentTopics[topicIndex];
    const updatedTopic: SyllabusTopic = { ...targetTopic };

    let toastMsg = '';
    if (field === 'referenceNotes') {
      delete updatedTopic.referenceNotes;
      toastMsg = `Catatan rujukan pertemuan P-${targetTopic.meetingNumber || topicIndex + 1} berhasil dihapus`;
    } else if (field === 'driveLink') {
      delete updatedTopic.driveLink;
      delete updatedTopic.driveLinkTitle;
      toastMsg = `Tautan Google Drive pertemuan P-${targetTopic.meetingNumber || topicIndex + 1} berhasil dihapus`;
    } else if (field === 'linkedMaterial') {
      delete updatedTopic.linkedMaterialId;
      delete updatedTopic.linkedMaterialTitle;
      toastMsg = `Modul materi terkait pertemuan P-${targetTopic.meetingNumber || topicIndex + 1} berhasil dihapus`;
    } else if (field === 'linkedExam') {
      delete updatedTopic.linkedExamId;
      delete updatedTopic.linkedExamTitle;
      toastMsg = `Paket soal CBT terkait pertemuan P-${targetTopic.meetingNumber || topicIndex + 1} berhasil dihapus`;
    }

    const updatedTopics = [...currentTopics];
    updatedTopics[topicIndex] = updatedTopic;

    const updatedSyllabus: SyllabusItem = {
      ...currentSyllabus,
      topics: updatedTopics,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveSyllabus(updatedSyllabus);
    setCurrentSyllabus(updatedSyllabus);

    if (onShowToast) {
      onShowToast(toastMsg, 'info');
    }
  };

  // Open or Download Learning Material / Drive Link
  const handleOpenOrDownloadMaterial = (topic: SyllabusTopic, mat?: LearningMaterial) => {
    if (mat?.url) {
      window.open(mat.url, '_blank');
      if (onShowToast) {
        onShowToast(`Membuka bahan ajar: "${mat.title}"`, 'info');
      }
      return;
    }
    if (topic.driveLink) {
      window.open(topic.driveLink, '_blank');
      if (onShowToast) {
        onShowToast(`Membuka tautan Google Drive materi...`, 'info');
      }
      return;
    }
    if (currentSyllabus) {
      handleDownloadMeetingTopic(currentSyllabus, topic, topic.meetingNumber ? topic.meetingNumber - 1 : 0);
    }
  };

  // Download single meeting topic as Lesson Plan (RPP) document (.doc / Word format)
  const handleDownloadMeetingTopic = (syllabus: SyllabusItem, topic: SyllabusTopic, meetingIndex: number) => {
    const meetingNum = topic.meetingNumber || meetingIndex + 1;
    const cleanSubject = syllabus.subject.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `RPP_P${meetingNum}_${syllabus.code}_${cleanSubject}.doc`;

    const subtopicsHtml = (topic.subtopics && topic.subtopics.length > 0)
      ? `<ul style="margin: 6px 0 0 18px; padding: 0;">${topic.subtopics.map(st => `<li style="margin-bottom: 4px;">${st}</li>`).join('')}</ul>`
      : `<p style="font-style: italic; color: #64748b; margin: 0;">Pokok bahasan umum</p>`;

    const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>RPP Pertemuan ${meetingNum} - ${syllabus.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      margin: 40px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .inst-title {
      font-size: 20pt;
      font-weight: bold;
      color: #1e3a8a;
      margin: 0;
      text-transform: uppercase;
    }
    .doc-subtitle {
      font-size: 13pt;
      font-weight: bold;
      color: #2563eb;
      margin-top: 5px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      background-color: #f8fafc;
    }
    .meta-table td {
      padding: 8px 12px;
      font-size: 11pt;
      border: 1px solid #cbd5e1;
    }
    .meta-label {
      font-weight: bold;
      width: 25%;
      background-color: #f1f5f9;
      color: #334155;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1e40af;
      background-color: #eff6ff;
      padding: 6px 12px;
      border-left: 4px solid #2563eb;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .content-box {
      font-size: 11pt;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 15px;
      background-color: #ffffff;
    }
    .sig-table {
      width: 100%;
      margin-top: 40px;
      border: none;
    }
    .sig-table td {
      border: none;
      text-align: center;
      font-size: 11pt;
      padding: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="inst-title">BRAIN SPACE ACADEMY</div>
    <div style="font-size: 10pt; color: #64748b;">Pusat Bimbingan Belajar & Sistem Manajemen Pembelajaran Terpadu</div>
    <div class="doc-subtitle">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</div>
    <div style="font-size: 11pt; font-weight: bold; color: #475569; margin-top: 4px;">Pertemuan Ke-${meetingNum}: ${topic.title}</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Mata Pelajaran</td>
      <td><strong>${syllabus.subject}</strong></td>
      <td class="meta-label">Kode Silabus</td>
      <td>${syllabus.code}</td>
    </tr>
    <tr>
      <td class="meta-label">Kelas / Program</td>
      <td>Kelas ${syllabus.targetClass}</td>
      <td class="meta-label">Tahun Ajaran</td>
      <td>${syllabus.academicYear}</td>
    </tr>
    <tr>
      <td class="meta-label">Guru Pengampu</td>
      <td>${syllabus.teacherInCharge || 'Guru Pengampu Brain Space Academy'}</td>
      <td class="meta-label">Alokasi Waktu</td>
      <td><strong>${topic.durationMinutes || 90} Menit</strong> (Pertemuan Ke-${meetingNum})</td>
    </tr>
  </table>

  <div class="section-title">A. MATERI POKOK & JUDUL PERTEMUAN</div>
  <div class="content-box">
    <strong style="font-size: 12pt; color: #0f172a;">${topic.title}</strong>
  </div>

  <div class="section-title">B. CAPAIAN PEMBELAJARAN / KOMPETENSI KHUSUS</div>
  <div class="content-box">
    ${topic.competency}
  </div>

  <div class="section-title">C. RINCIAN POKOK BAHASAN & SUB-TOPIK</div>
  <div class="content-box">
    ${subtopicsHtml}
  </div>

  <div class="section-title">D. METODE & PENDEKATAN PEMBELAJARAN</div>
  <div class="content-box">
    <strong>${topic.teachingMethod || 'Ceramah Interaktif, Drill Soal HOTS, dan Diskusi Terarah'}</strong>
  </div>

  <div class="section-title">E. SUMBER RUJUKAN & INTEGRASI LMS</div>
  <div class="content-box">
    <p style="margin: 0 0 6px 0;"><strong>Catatan & Rujukan:</strong> ${topic.referenceNotes || 'Buku Pegangan Kurikulum & Modul Mandiri Brain Space Academy'}</p>
    ${topic.linkedMaterialTitle ? `<p style="margin: 0 0 6px 0; color: #4338ca;"><strong>Modul Materi Terintegrasi:</strong> ${topic.linkedMaterialTitle}</p>` : ''}
    ${topic.linkedExamTitle ? `<p style="margin: 0 0 6px 0; color: #047857;"><strong>Paket Soal / CBT Terintegrasi:</strong> ${topic.linkedExamTitle}</p>` : ''}
    ${topic.driveLink ? `<p style="margin: 0; color: #0284c7;"><strong>Tautan Google Drive (Materi/Soal):</strong> <a href="${topic.driveLink}" target="_blank" style="color: #0284c7; text-decoration: underline;">${topic.driveLinkTitle || topic.driveLink}</a></p>` : ''}
  </div>

  <table class="sig-table">
    <tr>
      <td style="width: 50%;">
        Mengetahui,<br>
        <strong>Kepala Akademik Brain Space Academy</strong><br><br><br><br>
        ( _________________________ )
      </td>
      <td style="width: 50%;">
        Guru Pengampu Mata Pelajaran,<br>
        <strong>${syllabus.subject}</strong><br><br><br><br>
        ( <strong>${syllabus.teacherInCharge || '......................................'}</strong> )
      </td>
    </tr>
  </table>
</body>
</html>`;

    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`Dokumen RPP Pertemuan Ke-${meetingNum} (${topic.title}) berhasil diunduh.`, 'success');
    }
  };

  // Download entire syllabus document (.doc / Word format)
  const handleDownloadFullSyllabusDoc = (sil: SyllabusItem) => {
    const cleanSubject = sil.subject.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `SILABUS_${sil.code}_${cleanSubject}_${sil.targetClass}.doc`;

    const topicsRows = (sil.topics || []).map((t, idx) => {
      const subtopicsList = (t.subtopics || []).map(st => `<li style="margin-bottom: 3px;">${st}</li>`).join('');
      return `
        <tr>
          <td style="text-align: center; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; background-color: #f8fafc;">
            P-${t.meetingNumber || idx + 1}<br>
            <span style="font-size: 9pt; color: #64748b; font-weight: normal;">${t.durationMinutes || 90} mnt</span>
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">
            <strong style="color: #1e293b; font-size: 11pt;">${t.title}</strong>
            ${t.subtopics && t.subtopics.length > 0 ? `<ul style="margin: 5px 0 0 15px; padding: 0; font-size: 10pt; color: #475569;">${subtopicsList}</ul>` : ''}
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 10.5pt; color: #334155;">
            ${t.competency}
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 10pt; color: #334155;">
            ${t.teachingMethod || '-'}
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-size: 10pt; color: #475569;">
            ${t.referenceNotes ? `<p style="margin: 0 0 4px 0;"><strong>Ref:</strong> ${t.referenceNotes}</p>` : ''}
            ${t.linkedMaterialTitle ? `<p style="margin: 0 0 4px 0; color: #4338ca;"><strong>Materi:</strong> ${t.linkedMaterialTitle}</p>` : ''}
            ${t.linkedExamTitle ? `<p style="margin: 0 0 4px 0; color: #047857;"><strong>CBT:</strong> ${t.linkedExamTitle}</p>` : ''}
            ${t.driveLink ? `<p style="margin: 0; color: #0284c7;"><strong>Drive:</strong> <a href="${t.driveLink}" target="_blank" style="color: #0284c7; text-decoration: underline;">${t.driveLinkTitle || 'Link Drive'}</a></p>` : ''}
            ${!t.referenceNotes && !t.linkedMaterialTitle && !t.linkedExamTitle && !t.driveLink ? '-' : ''}
          </td>
        </tr>
      `;
    }).join('');

    const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Silabus & RPP - ${sil.title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #1e293b; margin: 30px; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
    .inst-title { font-size: 18pt; font-weight: bold; color: #1e3a8a; margin: 0; text-transform: uppercase; }
    .doc-subtitle { font-size: 13pt; font-weight: bold; color: #2563eb; margin-top: 4px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; }
    .meta-table td { padding: 6px 10px; font-size: 10.5pt; border: 1px solid #cbd5e1; }
    .meta-label { font-weight: bold; width: 22%; background-color: #f1f5f9; color: #334155; }
    .table-curriculum { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table-curriculum th { background-color: #1e293b; color: #ffffff; padding: 9px 10px; font-size: 10pt; text-transform: uppercase; border: 1px solid #0f172a; text-align: left; }
    .sig-table { width: 100%; margin-top: 40px; border: none; }
    .sig-table td { border: none; text-align: center; font-size: 10.5pt; padding: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="inst-title">BRAIN SPACE ACADEMY</div>
    <div style="font-size: 9.5pt; color: #64748b;">Pusat Bimbingan Belajar & Sistem Manajemen Pembelajaran Terpadu</div>
    <div class="doc-subtitle">SILABUS & RENCANA PERENCANAAN KURIKULUM</div>
    <div style="font-size: 11pt; font-weight: bold; color: #334155; margin-top: 4px;">${sil.title}</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Mata Pelajaran</td>
      <td><strong>${sil.subject}</strong></td>
      <td class="meta-label">Kode Silabus</td>
      <td><strong>${sil.code}</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Kelas Sasaran</td>
      <td>Kelas ${sil.targetClass}</td>
      <td class="meta-label">Tahun Ajaran</td>
      <td>${sil.academicYear}</td>
    </tr>
    <tr>
      <td class="meta-label">Guru PIC Pengampu</td>
      <td>${sil.teacherInCharge || '-'}</td>
      <td class="meta-label">Total Pertemuan</td>
      <td><strong>${sil.topics?.length || 0} Pertemuan</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Deskripsi / Capaian Umum</td>
      <td colspan="3">${sil.description}</td>
    </tr>
  </table>

  <h3 style="color: #1e3a8a; margin-top: 25px; margin-bottom: 8px; font-size: 12pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
    MATRIKS RINCIAN PERTEMUAN & CAPAIAN PEMBELAJARAN
  </h3>

  <table class="table-curriculum">
    <thead>
      <tr>
        <th style="width: 10%; text-align: center;">Pertemuan</th>
        <th style="width: 28%;">Materi Pokok & Sub-Topik</th>
        <th style="width: 32%;">Capaian Pembelajaran (Kompetensi)</th>
        <th style="width: 15%;">Metode Ajar</th>
        <th style="width: 15%;">Rujukan / Integrasi</th>
      </tr>
    </thead>
    <tbody>
      ${topicsRows || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Belum ada topik pertemuan.</td></tr>'}
    </tbody>
  </table>

  <table class="sig-table">
    <tr>
      <td style="width: 50%;">
        Mengetahui,<br>
        <strong>Kepala Akademik Brain Space Academy</strong><br><br><br><br>
        ( _________________________ )
      </td>
      <td style="width: 50%;">
        Disusun Oleh Guru Pengampu,<br>
        <strong>${sil.subject}</strong><br><br><br><br>
        ( <strong>${sil.teacherInCharge || '......................................'}</strong> )
      </td>
    </tr>
  </table>
</body>
</html>`;

    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`Dokumen Lengkap Silabus "${sil.title}" berhasil diunduh.`, 'success');
    }
  };

  return (
    <div id="syllabus-management-page" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header & Summary Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 shadow-sm">
                <BookMarked className="w-3.5 h-3.5 text-blue-400" /> Silabus & RPP Akademik
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Terintegrasi CBT & Materi
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Silabus & Perencanaan Kurikulum
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Susun dan pantau silabus mata pelajaran, peta kompetensi per pertemuan, metode ajar terarah, serta integrasi modul pembelajaran & evaluasi CBT.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              id="btn-print-official-syllabus"
              onClick={() => {
                setPrintModalLevel('SMA');
                setIsPrintSyllabusModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] active:scale-95"
              title="Pratinjau & Cetak Dokumen Silabus Resmi Labschool Lengkap"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Silabus Resmi</span>
            </button>

            <button
              id="btn-open-template"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-[1.02] shadow-sm"
              title="Gunakan template silabus siap pakai"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Template Instan</span>
            </button>

            <button
              id="btn-create-syllabus"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Silabus Baru</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Silabus</span>
              <BookMarked className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-1.5">{stats.total}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats.active} Aktif • {stats.draft} Draf</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Pertemuan / Bab</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1.5">{stats.totalTopics}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Topik terpetakan rapi</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Mata Pelajaran Tercover</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1.5">{stats.coveredSubjects}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Dari {subjects.length} mapel terdaftar</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Guru PIC Pengampu</span>
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-1.5">{teachers.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Instruktur tersinkron</p>
          </div>
        </div>
      </div>

      {/* 2. Controls, Search, Filter & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-syllabus"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul silabus, kode, guru, bab, atau capaian..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Filter Tingkat Kelas */}
            <select
              id="filter-class"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Tingkat Kelas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>
                  Kelas {cls.name}
                </option>
              ))}
            </select>

            {/* Filter Mata Pelajaran */}
            <select
              id="filter-subject"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500 max-w-[180px] truncate"
            >
              <option value="ALL">Semua Mapel</option>
              {subjects.map(sbj => (
                <option key={sbj.id} value={sbj.name}>
                  {sbj.name}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="DRAFT">Draf / Revisi</option>
              <option value="ARCHIVED">Diarsipkan</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Kartu Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Timeline / Kurikulum"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Tabulasi"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Labschool Quick Target Class & Subtest Filter Pills */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter Labschool:</span>
          </span>

          <button
            onClick={() => {
              setSelectedClass('ALL');
              setSelectedSubject('ALL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedClass === 'ALL' && selectedSubject === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Semua ({syllabi.length})
          </button>

          <button
            onClick={() => {
              setSelectedClass('SMP-LABSCHOOL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              selectedClass === 'SMP-LABSCHOOL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/50'
            }`}
          >
            <span>🏫 SMP-LABSCHOOL</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-700/60 font-bold">
              {syllabi.filter(s => s.targetClass === 'SMP-LABSCHOOL').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedClass('SMA-LABSCHOOL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              selectedClass === 'SMA-LABSCHOOL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-indigo-400 hover:bg-indigo-950/40 border border-indigo-900/50'
            }`}
          >
            <span>🎓 SMA-LABSCHOOL</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-950/80 border border-indigo-700/60 font-bold">
              {syllabi.filter(s => s.targetClass === 'SMA-LABSCHOOL').length}
            </span>
          </button>

          <span className="text-slate-700">|</span>

          {[
            { label: 'PK (Kuantitatif)', code: 'PK', subject: 'PK (Pengetahuan Kuantitatif)' },
            { label: 'KV (Verbal)', code: 'KV', subject: 'KV (VERBAL-BINDO DAN VERBAL-BING)' },
            { label: 'PM (Membaca)', code: 'PM', subject: 'PM Pemahaman Membaca (BAHASA INDONESIA dan BAHASA INGGRIS)' },
            { label: 'AKA-IPA', code: 'IPA', subject: 'AKA-IPA' },
            { label: 'AKA-IPS', code: 'IPS', subject: 'AKA-IPS' },
            { label: 'SV (Karakter)', code: 'SV', subject: 'SV(survei karakter)' }
          ].map(sub => {
            const isMatch = selectedSubject === sub.subject;
            return (
              <button
                key={sub.code}
                onClick={() => {
                  setSelectedSubject(isMatch ? 'ALL' : sub.subject);
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                  isMatch
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* SNBT / UTBK 2026 Subtest & Category Quick Filter Row */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Silabus & Modul SNBT:</span>
          </span>

          <button
            onClick={() => {
              setSelectedSnbtFilter(selectedSnbtFilter === 'SNBT_ALL' ? 'ALL' : 'SNBT_ALL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              selectedSnbtFilter === 'SNBT_ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40 border border-amber-900/50'
            }`}
          >
            <span>Semua Subtes SNBT</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60 font-bold">
              {stats.snbtCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedSnbtFilter(selectedSnbtFilter === 'TPS' ? 'ALL' : 'TPS')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedSnbtFilter === 'TPS'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-950 text-blue-400 hover:bg-blue-950/40 border border-blue-900/50'
            }`}
          >
            TPS (4 Subtes)
          </button>

          <button
            onClick={() => setSelectedSnbtFilter(selectedSnbtFilter === 'LITERASI' ? 'ALL' : 'LITERASI')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedSnbtFilter === 'LITERASI'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/50'
            }`}
          >
            Literasi (LBI & LBE)
          </button>

          <button
            onClick={() => setSelectedSnbtFilter(selectedSnbtFilter === 'PM' ? 'ALL' : 'PM')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedSnbtFilter === 'PM'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-950 text-purple-400 hover:bg-purple-950/40 border border-purple-900/50'
            }`}
          >
            Penalaran Matematika
          </button>

          <span className="text-slate-700">|</span>

          {SNBT_7_SUBTEST_METAS.map(sub => {
            const isMatch = selectedSnbtFilter === sub.code;
            return (
              <button
                key={sub.code}
                onClick={() => {
                  setSelectedSnbtFilter(isMatch ? 'ALL' : sub.code);
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-colors ${
                  isMatch
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
                title={`${sub.code}: ${sub.name}`}
              >
                {sub.code}
              </button>
            );
          })}

          {selectedSnbtFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedSnbtFilter('ALL')}
              className="text-[11px] text-slate-400 hover:text-red-400 underline ml-auto"
            >
              Reset Filter SNBT
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Syllabi Render List */}
      {filteredSyllabi.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Tidak ada silabus yang sesuai</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan filter kelas dan mata pelajaran.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('ALL');
                setSelectedSubject('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Reset Filter
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
            >
              + Buat Silabus Baru
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSyllabi.map(sil => {
            const topicCount = sil.topics?.length || 0;
            const previewTopics = sil.topics?.slice(0, 3) || [];

            return (
              <div
                key={sil.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-lg hover:shadow-blue-950/20"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {sil.targetClass}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {sil.code}
                      </span>
                      {sil.snbtSubtestCode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          <span>SNBT: {sil.snbtSubtestCode}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleStatus(sil)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        sil.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : sil.status === 'DRAFT'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Klik untuk ubah status Aktif / Draf"
                    >
                      {sil.status === 'ACTIVE' ? '● Aktif' : sil.status === 'DRAFT' ? '● Draf' : 'Diarsipkan'}
                    </button>
                  </div>

                  {/* Title & Subject */}
                  <h3
                    onClick={() => handleOpenDetailModal(sil)}
                    className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 cursor-pointer transition-colors line-clamp-2 leading-snug"
                  >
                    {sil.title}
                  </h3>

                  <p className="text-xs font-semibold text-indigo-400 mt-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{sil.subject}</span>
                  </p>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {sil.description}
                  </p>

                  {/* Teacher & Year Info */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{sil.teacherInCharge || 'Guru Pengampu Belum Ditentukan'}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 shrink-0 ml-2">
                      {topicCount} Pertemuan
                    </span>
                  </div>

                  {/* Topic Preview Preview List */}
                  <div className="mt-3.5 bg-slate-950/70 rounded-2xl p-3 border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                      <span>Rencana Bab Teratas:</span>
                      <span className="text-blue-400">{topicCount} Bab Total</span>
                    </div>
                    {previewTopics.length > 0 ? (
                      previewTopics.map((top, idx) => (
                        <div
                          key={top.id || idx}
                          className="text-[11px] text-slate-300 flex items-center gap-2 truncate py-0.5 px-1 rounded hover:bg-slate-900/60"
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-400 font-extrabold flex items-center justify-center text-[9px] shrink-0 border border-blue-800">
                            {top.meetingNumber || idx + 1}
                          </span>
                          <span className="truncate">{top.title}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic px-1">Belum ada topik pertemuan diinputkan.</p>
                    )}
                    {topicCount > 3 && (
                      <p
                        onClick={() => handleOpenDetailModal(sil)}
                        className="text-[10px] text-blue-400 hover:underline cursor-pointer pt-0.5 px-1"
                      >
                        +{topicCount - 3} pertemuan lainnya...
                      </p>
                    )}
                  </div>

                  {/* Integrated Journal Badge on Grid Card */}
                  {(() => {
                    const stats = getLinkedJournalStats(sil);
                    if (stats.count > 0) {
                      return (
                        <div className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-blue-950/40 border border-indigo-800/50 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold truncate">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{stats.count} Jurnal Terlaksana</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetailModal(sil, 'journals');
                            }}
                            className="text-[10px] font-bold text-blue-300 hover:text-white shrink-0 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded-lg border border-blue-500/30 flex items-center gap-1 transition-colors"
                          >
                            <span>{stats.avgComprehension}% ⭐</span>
                            <span>Buka Jurnal →</span>
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleOpenDetailModal(sil)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat RPP</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetailModal(sil, 'journals')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 transition-colors"
                    title="Buka Jurnal Belajar & Riwayat Pertemuan"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Jurnal</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicateSyllabus(sil)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Duplikasi Silabus ini"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(sil)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit Silabus"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSyllabusToDelete(sil);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Hapus Silabus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE / CURRICULAR ROADMAP VIEW */
        <div className="space-y-6">
          {filteredSyllabi.map(sil => (
            <div key={sil.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Header of Syllabus Item */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {sil.targetClass}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {sil.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                      {sil.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{sil.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    PIC: <strong className="text-slate-200">{sil.teacherInCharge || '-'}</strong> • Tahun Ajaran:{' '}
                    {sil.academicYear} • Total Pertemuan: <strong>{sil.topics?.length || 0} Pertemuan</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenDetailModal(sil)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600/15 text-blue-400 border border-blue-500/30 hover:bg-blue-600/25 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Pratinjau RPP
                  </button>
                  <button
                    onClick={() => handleOpenDetailModal(sil, 'journals')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/25 transition-colors"
                    title="Buka Jurnal Belajar & Riwayat Pertemuan Terlaksana"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Jurnal Belajar ({getLinkedJournalStats(sil).count})</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(sil)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sequential Topic Roadmap Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sil.topics?.map((top, tIdx) => (
                  <div
                    key={top.id || tIdx}
                    className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex gap-3.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex flex-col items-center justify-center shrink-0 shadow-md shadow-blue-900/30">
                      <span className="text-[9px] uppercase font-semibold text-blue-200">P-</span>
                      <span className="text-sm font-black -mt-1">{top.meetingNumber || tIdx + 1}</span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{top.title}</h4>
                        {top.durationMinutes && (
                          <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 shrink-0">
                            {top.durationMinutes} mnt
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-indigo-300 font-medium line-clamp-1">
                        🎯 {top.competency}
                      </p>

                      {/* Subtopics pill list */}
                      {top.subtopics && top.subtopics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {top.subtopics.map((st, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md"
                            >
                              • {st}
                            </span>
                          ))}
                        </div>
                      )}

                      {top.teachingMethod && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Metode: <span className="text-slate-400">{top.teachingMethod}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE MATRIX VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4 font-semibold">Kode</th>
                  <th className="py-4 px-4 font-semibold">Judul Silabus</th>
                  <th className="py-4 px-4 font-semibold">Mapel & Kelompok</th>
                  <th className="py-4 px-4 font-semibold">Kelas Target</th>
                  <th className="py-4 px-4 font-semibold">Guru PIC</th>
                  <th className="py-4 px-4 font-semibold text-center">Pertemuan</th>
                  <th className="py-4 px-4 font-semibold text-center">Status</th>
                  <th className="py-4 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSyllabi.map(sil => (
                  <tr key={sil.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-blue-400 font-bold whitespace-nowrap">
                      {sil.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white min-w-[200px]">
                      <span
                        onClick={() => handleOpenDetailModal(sil)}
                        className="hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {sil.title}
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal truncate max-w-xs">{sil.description}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs text-indigo-300 font-semibold">{sil.subject}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {sil.targetClass}
                        </span>
                        {sil.snbtSubtestCode && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                            SNBT: {sil.snbtSubtestCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                      {sil.teacherInCharge || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-200">
                        {sil.topics?.length || sil.totalMeetings} Bab
                      </div>
                      {(() => {
                        const stats = getLinkedJournalStats(sil);
                        if (stats.count > 0) {
                          return (
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(sil, 'journals')}
                              className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-800/40 transition-colors"
                              title="Buka Jurnal Belajar"
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              <span>{stats.count} Jurnal</span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(sil)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          sil.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {sil.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetailModal(sil)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Lihat RPP"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDetailModal(sil, 'journals')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Lihat Jurnal Belajar"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sil)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateSyllabus(sil)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Duplikasi"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSyllabusToDelete(sil);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DETAIL DRAWER / MODAL ("Lihat Lengkap RPP & Silabus") */}
      {/* ========================================================================= */}
      {isDetailModalOpen && currentSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60 sticky top-0 z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                    Kelas {currentSyllabus.targetClass}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 font-mono">
                    {currentSyllabus.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {currentSyllabus.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {currentSyllabus.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrintSyllabus}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Cetak Silabus"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cetak RPP</span>
                </button>

                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tab Navigation: Rencana Silabus vs Jurnal Belajar Terintegrasi */}
            {(() => {
              const journalStats = getLinkedJournalStats(currentSyllabus);
              return (
                <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setDetailActiveTab('topics')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
                      detailActiveTab === 'topics'
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl shadow-sm'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Rencana Silabus & RPP ({currentSyllabus.topics?.length || 0} Bab)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailActiveTab('journals')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
                      detailActiveTab === 'journals'
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-xl shadow-sm'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Laporan Jurnal Belajar & Riwayat Pertemuan</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-black border border-indigo-500/30">
                      {journalStats.count} Sesi Terlaksana
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* Modal Body */}
            {detailActiveTab === 'journals' ? (
              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
                <SyllabusJournalTab
                  syllabus={currentSyllabus}
                  onShowToast={onShowToast}
                />
              </div>
            ) : (
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
              
              {/* Profile Summary Card */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Mata Pelajaran</span>
                  <p className="text-sm font-bold text-white mt-0.5">{currentSyllabus.subject}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Guru Pengampu / Penanggung Jawab</span>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">{currentSyllabus.teacherInCharge || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Tahun Ajaran / Alokasi Waktu</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{currentSyllabus.academicYear} • {currentSyllabus.topics?.length || 0} Pertemuan</p>
                </div>
                {currentSyllabus.description && (
                  <div className="sm:col-span-3 pt-3 border-t border-slate-800/70 text-slate-300 text-xs leading-relaxed">
                    <strong className="text-slate-200 block mb-1">Capaian & Deskripsi Umum:</strong>
                    {currentSyllabus.description}
                  </div>
                )}
              </div>

              {/* List of Topics & Meetings (Table / Matrix View) */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Rincian Pertemuan & Capaian Pembelajaran ({currentSyllabus.topics?.length || 0} Bab)
                  </h4>

                  <div className="flex items-center gap-2">
                    {/* Mode Switcher: Tabel vs Kartu */}
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setDetailTopicView('table')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          detailTopicView === 'table'
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Tampilan Tabel Matriks"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Tabel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailTopicView('card')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          detailTopicView === 'card'
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Tampilan Kartu Akordeon"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Kartu</span>
                      </button>
                    </div>

                    {detailTopicView === 'card' && (
                      <button
                        type="button"
                        onClick={() => {
                          const allOpen = Object.keys(expandedTopics).length === currentSyllabus.topics?.length;
                          if (allOpen) {
                            setExpandedTopics({});
                          } else {
                            const opened: Record<string, boolean> = {};
                            currentSyllabus.topics?.forEach(t => (opened[t.id] = true));
                            setExpandedTopics(opened);
                          }
                        }}
                        className="text-xs font-semibold text-blue-400 hover:underline px-2 py-1"
                      >
                        {Object.keys(expandedTopics).length === currentSyllabus.topics?.length ? 'Tutup Semua' : 'Buka Semua'}
                      </button>
                    )}
                  </div>
                </div>

                {detailTopicView === 'table' ? (
                  /* ================= TABEL RINCIAN PERTEMUAN & CAPAIAN ================= */
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-900/90 text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="py-3.5 px-3 text-center font-bold text-slate-300 min-w-[90px] whitespace-nowrap">
                              Pertemuan
                            </th>
                            <th className="py-3.5 px-4 font-bold text-slate-300 min-w-[230px]">
                              Materi Pokok & Sub-Topik
                            </th>
                            <th className="py-3.5 px-4 font-bold text-slate-300 min-w-[270px]">
                              Capaian Pembelajaran (Kompetensi Khusus)
                            </th>
                            <th className="py-3.5 px-4 font-bold text-slate-300 min-w-[140px]">
                              Metode Ajar
                            </th>
                            <th className="py-3.5 px-4 font-bold text-slate-300 min-w-[200px]">
                              Rujukan & Integrasi
                            </th>
                            <th className="py-3.5 px-3 text-center font-bold text-slate-300 min-w-[115px] whitespace-nowrap">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {currentSyllabus.topics && currentSyllabus.topics.length > 0 ? (
                            currentSyllabus.topics.map((top, idx) => (
                              <tr
                                key={top.id || idx}
                                className="hover:bg-slate-900/50 transition-colors align-top group odd:bg-slate-950 even:bg-slate-900/25"
                              >
                                {/* Kolom 1: Pertemuan & Alokasi Durasi (Disusun Atas Bawah) */}
                                <td className="py-4 px-3 text-center whitespace-nowrap">
                                  <div className="flex flex-col items-center justify-center gap-1.5 py-0.5">
                                    <span className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-extrabold flex items-center justify-center text-xs shadow-sm">
                                      P-{top.meetingNumber || idx + 1}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full shadow-inner">
                                      <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                      <span>{top.durationMinutes ? `${top.durationMinutes} mnt` : '90 mnt'}</span>
                                    </span>
                                  </div>
                                </td>

                                {/* Kolom 2: Judul Materi & Sub-Topik */}
                                <td className="py-4 px-4">
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-bold text-white leading-snug group-hover:text-blue-300 transition-colors">
                                      {top.title}
                                    </h5>

                                    {top.subtopics && top.subtopics.length > 0 && (
                                      <div className="space-y-1 mt-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                          Pokok Bahasan:
                                        </span>
                                        <ul className="space-y-1">
                                          {top.subtopics.map((st, sIdx) => (
                                            <li key={sIdx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed font-medium">
                                              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                                              <span>{st}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Kolom 3: Capaian Pembelajaran / Kompetensi */}
                                <td className="py-4 px-4">
                                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-xs leading-relaxed text-slate-200 shadow-sm font-medium">
                                    <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px] mb-1">
                                      <span>🎯</span>
                                      <span>Target Kompetensi:</span>
                                    </div>
                                    <p className="text-slate-200">
                                      {top.competency}
                                    </p>
                                  </div>
                                </td>

                                {/* Kolom 4: Metode Pembelajaran */}
                                <td className="py-4 px-4">
                                  {top.teachingMethod ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                      {top.teachingMethod}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-500 italic">-</span>
                                  )}
                                </td>

                                {/* Kolom 5: Rujukan & Integrasi Bahan Ajar + Link Drive + Download Materi */}
                                <td className="py-4 px-4">
                                  <div className="space-y-2">
                                    {/* Catatan Rujukan Buku */}
                                    {top.referenceNotes && (
                                      <div className="group flex items-start justify-between gap-1.5 p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-400">
                                        <div className="min-w-0 flex-1">
                                          <span className="font-semibold text-slate-300 block text-[11px]">Rujukan:</span>
                                          <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">{top.referenceNotes}</p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTopicField(idx, 'referenceNotes');
                                          }}
                                          className="p-1 rounded-md text-slate-500 hover:text-rose-300 hover:bg-rose-950/80 transition-colors shrink-0"
                                          title="Hapus Rujukan ini"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}

                                    {/* Link Google Drive (Bahan Ajar / Bank Soal) */}
                                    {top.driveLink && (
                                      <div className="group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-200 text-[11px] shadow-sm">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <HardDrive className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                                          <span className="font-bold text-sky-300 truncate" title={top.driveLinkTitle || top.driveLink}>
                                            {top.driveLinkTitle || 'Google Drive Materi/Soal'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                          <a
                                            href={top.driveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] shadow-sm transition-all active:scale-95"
                                            title={`Buka Link Drive: ${top.driveLink}`}
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Drive</span>
                                          </a>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveTopicField(idx, 'driveLink');
                                            }}
                                            className="p-1 rounded-md text-sky-400/80 hover:text-rose-300 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/50 transition-colors"
                                            title="Hapus Tautan Google Drive ini"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Modul Materi LMS Terintegrasi + Tombol Download Materi */}
                                    {top.linkedMaterialTitle && (
                                      <div className="group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-200 text-[11px] shadow-sm">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                                          <span className="truncate font-semibold text-indigo-200" title={top.linkedMaterialTitle}>
                                            {top.linkedMaterialTitle}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                          {(() => {
                                            const linkedMat = (materials || []).find(
                                              m => (top.linkedMaterialId && m.id === top.linkedMaterialId) ||
                                                   (top.linkedMaterialTitle && m.title.toLowerCase() === top.linkedMaterialTitle.toLowerCase())
                                            );
                                            return (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenOrDownloadMaterial(top, linkedMat);
                                                }}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-all active:scale-95"
                                                title={`Download / Buka Materi: ${top.linkedMaterialTitle}`}
                                              >
                                                <Download className="w-3 h-3 text-white" />
                                                <span>Download Materi</span>
                                              </button>
                                            );
                                          })()}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveTopicField(idx, 'linkedMaterial');
                                            }}
                                            className="p-1 rounded-md text-indigo-400/80 hover:text-rose-300 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/50 transition-colors"
                                            title="Hapus Modul Materi ini"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Paket Soal CBT Terintegrasi */}
                                    {top.linkedExamTitle && (
                                      <div className="group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] shadow-sm">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <FileCheck2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                          <span className="truncate font-semibold" title={top.linkedExamTitle}>
                                            {top.linkedExamTitle}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                          {(() => {
                                            const linkedEx = (exams || []).find(
                                              ex => (top.linkedExamId && ex.id === top.linkedExamId) ||
                                                    (top.linkedExamTitle && ex.title.toLowerCase() === top.linkedExamTitle.toLowerCase())
                                            );
                                            return linkedEx?.pdfDriveUrl ? (
                                              <a
                                                href={linkedEx.pdfDriveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm transition-all active:scale-95"
                                                title="Download / Buka PDF Soal CBT"
                                              >
                                                <Download className="w-3 h-3" />
                                                <span>PDF Soal</span>
                                              </a>
                                            ) : (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                                                CBT
                                              </span>
                                            );
                                          })()}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveTopicField(idx, 'linkedExam');
                                            }}
                                            className="p-1 rounded-md text-emerald-400/80 hover:text-rose-300 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/50 transition-colors"
                                            title="Hapus Paket Soal CBT ini"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Jika belum ada rujukan/link, beri tombol cepat + Tautkan Drive / Materi */}
                                    {!top.referenceNotes && !top.linkedMaterialTitle && !top.linkedExamTitle && !top.driveLink && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenQuickEditTopic(currentSyllabus, top, idx)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-sky-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 border-dashed transition-colors"
                                      >
                                        <Plus className="w-3 h-3 text-sky-400" />
                                        <span>+ Tautkan Drive / Materi</span>
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* Kolom 6: Menu Aksi (Edit & Download RPP Disusun Atas Bawah) */}
                                <td className="py-4 px-3 text-center whitespace-nowrap">
                                  <div className="flex flex-col items-stretch gap-1.5 w-full max-w-[105px] mx-auto py-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickEditTopic(currentSyllabus, top, idx)}
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all shadow-sm"
                                      title={`Edit Rincian Pertemuan P-${top.meetingNumber || idx + 1}`}
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDownloadMeetingTopic(currentSyllabus, top, idx)}
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600/15 text-blue-300 border border-blue-500/30 hover:bg-blue-600/25 active:scale-95 transition-all shadow-sm"
                                      title={`Download Dokumen RPP Pertemuan P-${top.meetingNumber || idx + 1}`}
                                    >
                                      <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                      <span>Download</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                                Belum ada data pertemuan dalam silabus ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* ================= KARTU AKORDEON RINCIAN ================= */
                  <div className="space-y-3">
                    {currentSyllabus.topics?.map((top, idx) => {
                      const isExpanded = !!expandedTopics[top.id];

                      return (
                        <div
                          key={top.id || idx}
                          className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
                        >
                          {/* Accordion Bar */}
                          <div
                            onClick={() =>
                              setExpandedTopics(prev => ({ ...prev, [top.id]: !prev[top.id] }))
                            }
                            className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-extrabold flex items-center justify-center text-xs shadow-sm">
                                  P-{top.meetingNumber || idx + 1}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">
                                  {top.durationMinutes ? `${top.durationMinutes}m` : '90m'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-sm font-bold text-white truncate">
                                  {top.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate">
                                  🎯 {top.competency}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenQuickEditTopic(currentSyllabus, top, idx);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors active:scale-95 shadow-sm"
                                  title="Edit Pertemuan"
                                >
                                  <Edit3 className="w-3 h-3 text-amber-400" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadMeetingTopic(currentSyllabus, top, idx);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/15 text-blue-300 border border-blue-500/30 hover:bg-blue-600/25 transition-colors active:scale-95 shadow-sm"
                                  title="Download RPP Pertemuan Ini"
                                >
                                  <Download className="w-3 h-3 text-blue-400" />
                                  <span className="hidden sm:inline">Download</span>
                                </button>
                              </div>

                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {isExpanded && (
                            <div className="p-4 sm:p-5 bg-slate-900/40 border-t border-slate-800/80 space-y-4 text-xs animate-in fade-in duration-150">
                              
                              {/* Competency & Objectives */}
                              <div>
                                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                                  Capaian Pembelajaran / Kompetensi Khusus:
                                </span>
                                <p className="text-slate-200 mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-medium">
                                  {top.competency}
                                </p>
                              </div>

                              {/* Subtopics Bullets */}
                              {top.subtopics && top.subtopics.length > 0 && (
                                <div>
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Pokok Bahasan & Sub-Topik:
                                  </span>
                                  <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {top.subtopics.map((st, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                                      >
                                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span className="truncate">{st}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Pedagogy, Methods, & References */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                                {top.teachingMethod && (
                                  <div>
                                    <span className="text-[11px] font-semibold text-slate-400">Metode Pembelajaran:</span>
                                    <p className="text-slate-200 font-medium mt-0.5">{top.teachingMethod}</p>
                                  </div>
                                )}

                                {top.referenceNotes && (
                                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[11px] font-semibold text-slate-400">Rujukan / Catatan:</span>
                                      <p className="text-slate-200 font-medium mt-0.5">{top.referenceNotes}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTopicField(idx, 'referenceNotes');
                                      }}
                                      className="p-1 rounded-md text-slate-500 hover:text-rose-300 hover:bg-rose-950/80 transition-colors shrink-0"
                                      title="Hapus Rujukan ini"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}

                                {/* Google Drive Link */}
                                {top.driveLink && (
                                  <div className="sm:col-span-2 p-3 rounded-xl bg-sky-950/50 border border-sky-800/60 flex flex-wrap items-center justify-between gap-2 shadow-sm">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                                        <HardDrive className="w-4 h-4 text-sky-400" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-sky-200 block truncate">
                                          {top.driveLinkTitle || 'Link Google Drive Materi & Bank Soal'}
                                        </span>
                                        <span className="text-[10px] text-sky-400/80 truncate block font-mono">
                                          {top.driveLink}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <a
                                        href={top.driveLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Buka Google Drive</span>
                                      </a>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveTopicField(idx, 'driveLink');
                                        }}
                                        className="p-1.5 rounded-lg text-sky-400 hover:text-rose-300 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/50 transition-colors"
                                        title="Hapus Link Google Drive ini"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {top.linkedMaterialTitle && (
                                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Modul Materi Terkait:
                                      </span>
                                      <p className="text-slate-200 font-medium mt-0.5 truncate">{top.linkedMaterialTitle}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {(() => {
                                        const linkedMat = (materials || []).find(
                                          m => (top.linkedMaterialId && m.id === top.linkedMaterialId) ||
                                               (top.linkedMaterialTitle && m.title.toLowerCase() === top.linkedMaterialTitle.toLowerCase())
                                        );
                                        return (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenOrDownloadMaterial(top, linkedMat)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                                            title="Download Bahan Ajar"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download Materi</span>
                                          </button>
                                        );
                                      })()}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveTopicField(idx, 'linkedMaterial');
                                        }}
                                        className="p-1 rounded-lg text-indigo-400 hover:text-rose-300 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/50 transition-colors"
                                        title="Hapus Modul Materi ini"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {top.linkedExamTitle && (
                                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                        <FileCheck2 className="w-3 h-3" /> Paket Soal / CBT Evaluasi:
                                      </span>
                                      <p className="text-slate-200 font-medium mt-0.5 truncate">{top.linkedExamTitle}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {(() => {
                                        const linkedEx = (exams || []).find(
                                          ex => (top.linkedExamId && ex.id === top.linkedExamId) ||
                                                (top.linkedExamTitle && ex.title.toLowerCase() === top.linkedExamTitle.toLowerCase())
                                        );
                                        return linkedEx?.pdfDriveUrl ? (
                                          <a
                                            href={linkedEx.pdfDriveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>PDF Soal</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                                            CBT
                                          </span>
                                        );
                                      })()}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveTopicField(idx, 'linkedExam');
                                        }}
                                        className="p-1 rounded-lg text-emerald-400 hover:text-rose-300 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/50 transition-colors"
                                        title="Hapus Paket Soal CBT ini"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
            )}

            {/* Modal Footer with Tambah Silabus, Edit Silabus, Unduh Silabus, and Tutup */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  id="btn-detail-add-syllabus"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenCreateModal();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Silabus</span>
                </button>

                <button
                  type="button"
                  id="btn-detail-edit-syllabus"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEditModal(currentSyllabus);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Silabus Ini</span>
                </button>

                <button
                  type="button"
                  id="btn-detail-download-full-doc"
                  onClick={() => handleDownloadFullSyllabusDoc(currentSyllabus)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Unduh Dokumen Lengkap Silabus & RPP (.doc)"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Unduh Dokumen Silabus (.doc)</span>
                  <span className="sm:hidden">Unduh Silabus</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4.5 QUICK TOPIC / MEETING EDIT MODAL */}
      {/* ========================================================================= */}
      {topicEditModalData && currentSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/70 sticky top-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold flex items-center justify-center text-sm shrink-0">
                  P-{topicEditModalData.topic.meetingNumber || topicEditModalData.topicIndex + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    Edit Rincian Pertemuan & Capaian
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {currentSyllabus.title} ({currentSyllabus.subject})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTopicEditModalData(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveQuickEditTopic} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              
              {/* Meeting number & duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nomor Pertemuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={topicEditModalData.topic.meetingNumber || topicEditModalData.topicIndex + 1}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setTopicEditModalData({
                        ...topicEditModalData,
                        topic: { ...topicEditModalData.topic, meetingNumber: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Alokasi Waktu (Menit)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={topicEditModalData.topic.durationMinutes || 90}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 90;
                      setTopicEditModalData({
                        ...topicEditModalData,
                        topic: { ...topicEditModalData.topic, durationMinutes: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Judul Materi Pokok <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={topicEditModalData.topic.title}
                  onChange={e => {
                    setTopicEditModalData({
                      ...topicEditModalData,
                      topic: { ...topicEditModalData.topic, title: e.target.value }
                    });
                  }}
                  placeholder="Contoh: Bab 1: Teori Kinetik Gas & Termodinamika"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              {/* Competency */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Capaian Pembelajaran (Kompetensi Khusus) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={topicEditModalData.topic.competency}
                  onChange={e => {
                    setTopicEditModalData({
                      ...topicEditModalData,
                      topic: { ...topicEditModalData.topic, competency: e.target.value }
                    });
                  }}
                  placeholder="Contoh: Siswa mampu menganalisis persamaan gas ideal dan menyelesaikan soal HOTS terkait termodinamika."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  required
                />
              </div>

              {/* Subtopics / Pokok Bahasan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Pokok Bahasan & Sub-Topik
                  </label>
                  <span className="text-[10px] text-slate-500">1 baris = 1 sub-topik</span>
                </div>
                <textarea
                  rows={3}
                  value={topicSubtopicsRaw}
                  onChange={e => setTopicSubtopicsRaw(e.target.value)}
                  placeholder="• Persamaan Keadaan Gas Ideal&#10;• Hukum I dan II Termodinamika&#10;• Efisiensi Mesin Carnot & Latihan Soal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              {/* Teaching Method */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Metode & Pendekatan Pembelajaran
                </label>
                <input
                  type="text"
                  value={topicEditModalData.topic.teachingMethod || ''}
                  onChange={e => {
                    setTopicEditModalData({
                      ...topicEditModalData,
                      topic: { ...topicEditModalData.topic, teachingMethod: e.target.value }
                    });
                  }}
                  placeholder="Contoh: Problem Based Learning (PBL) & Drill Soal CBT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {['Ceramah Interaktif', 'Problem Based Learning (PBL)', 'Drill Soal CBT', 'Diskusi & Bedah Kasus', 'Praktikum / Simulasi Digital'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setTopicEditModalData({
                          ...topicEditModalData,
                          topic: { ...topicEditModalData.topic, teachingMethod: m }
                        });
                      }}
                      className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      + {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Rujukan Buku / Catatan Guru
                </label>
                <input
                  type="text"
                  value={topicEditModalData.topic.referenceNotes || ''}
                  onChange={e => {
                    setTopicEditModalData({
                      ...topicEditModalData,
                      topic: { ...topicEditModalData.topic, referenceNotes: e.target.value }
                    });
                  }}
                  placeholder="Contoh: Modul Mandiri Bab 3, Halaman 45-60"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tautan Dokumen Google Drive untuk Materi / Bank Soal */}
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-sky-400" />
                    <span>Link Google Drive (Materi / Bank Soal / Modul / Slide)</span>
                  </label>
                  {topicEditModalData.topic.driveLink && (
                    <a
                      href={topicEditModalData.topic.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Uji Buka Link Drive</span>
                    </a>
                  )}
                </div>

                {/* URL Input */}
                <div>
                  <input
                    type="url"
                    value={topicEditModalData.topic.driveLink || ''}
                    onChange={e => {
                      setTopicEditModalData({
                        ...topicEditModalData,
                        topic: {
                          ...topicEditModalData.topic,
                          driveLink: e.target.value
                        }
                      });
                    }}
                    placeholder="https://drive.google.com/file/d/... atau https://drive.google.com/drive/folders/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Masukkan tautan file PDF, Google Docs, Slide PPT, folder bank soal, atau modul bahan tayang dari Google Drive.
                  </p>
                </div>

                {/* Drive Link Title / Label */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Keterangan / Label Tautan Drive (Opsional)
                  </label>
                  <input
                    type="text"
                    value={topicEditModalData.topic.driveLinkTitle || ''}
                    onChange={e => {
                      setTopicEditModalData({
                        ...topicEditModalData,
                        topic: {
                          ...topicEditModalData.topic,
                          driveLinkTitle: e.target.value
                        }
                      });
                    }}
                    placeholder="Contoh: Modul PPT & Handout Materi, Bank Soal Pembahasan Drive"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[
                      'Bahan Ajar & Modul PPT (Drive)',
                      'Bank Soal & Pembahasan (Drive)',
                      'Lembar Kerja Siswa (LKS)',
                      'Video & Audio Pembelajaran',
                      'Dokumen RPP & Rubrik Penilaian'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setTopicEditModalData({
                            ...topicEditModalData,
                            topic: {
                              ...topicEditModalData.topic,
                              driveLinkTitle: preset
                            }
                          });
                        }}
                        className="text-[10px] bg-slate-950 hover:bg-sky-950/80 text-sky-300 border border-sky-800/40 px-2 py-0.5 rounded-lg transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Integrasi Materi & CBT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Modul Pembelajaran Terkait
                  </label>
                  <select
                    value={topicEditModalData.topic.linkedMaterialId || ''}
                    onChange={e => {
                      const matId = e.target.value;
                      const selectedMat = (materials || []).find(m => m.id === matId);
                      setTopicEditModalData({
                        ...topicEditModalData,
                        topic: {
                          ...topicEditModalData.topic,
                          linkedMaterialId: matId || undefined,
                          linkedMaterialTitle: selectedMat?.title || undefined
                        }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Tanpa Tautan Modul --</option>
                    {(materials || []).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" /> Paket Soal CBT Terkait
                  </label>
                  <select
                    value={topicEditModalData.topic.linkedExamId || ''}
                    onChange={e => {
                      const exId = e.target.value;
                      const selectedEx = (exams || []).find(ex => ex.id === exId);
                      setTopicEditModalData({
                        ...topicEditModalData,
                        topic: {
                          ...topicEditModalData.topic,
                          linkedExamId: exId || undefined,
                          linkedExamTitle: selectedEx?.title || undefined
                        }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Tanpa Tautan CBT --</option>
                    {(exams || []).map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title} ({ex.category || ex.targetClass})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setTopicEditModalData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all font-black active:scale-95"
                >
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Simpan Perubahan Pertemuan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CREATE & EDIT MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60 sticky top-0 z-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {formTitle ? `Edit Silabus: ${formTitle}` : 'Buat Silabus & RPP Baru'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lengkapi identitas mata pelajaran, susun bab pertemuan, dan tetapkan capaian kompetensi.
                </p>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              
              {/* SECTION 1: Informasi Dasar */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Bagian 1: Identitas Silabus & Mata Pelajaran
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Judul Silabus */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Judul Silabus / Program Pembelajaran <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. Silabus Intensif Penalaran Matematika XII-UTBK"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Kode Silabus */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kode Silabus
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="e.g. SIL-MTK-XII-01"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Mata Pelajaran */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Mata Pelajaran <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formSubject}
                      onChange={e => setFormSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {subjects.map(sbj => (
                        <option key={sbj.id} value={sbj.name}>
                          {sbj.name} ({sbj.group || 'Umum'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tingkat Kelas Target */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tingkat Kelas Target
                    </label>
                    <select
                      value={formTargetClass}
                      onChange={e => setFormTargetClass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="SEMUA">SEMUA KELAS</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.name}>
                          Kelas {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Guru Pengampu / PIC */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Guru Penanggung Jawab
                    </label>
                    <select
                      value={formTeacherInCharge}
                      onChange={e => setFormTeacherInCharge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Pilih Guru PIC --</option>
                      {teachers.map(tch => (
                        <option key={tch.id} value={tch.name}>
                          {tch.name} ({tch.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tahun Ajaran */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tahun Ajaran / Semester
                    </label>
                    <input
                      type="text"
                      value={formAcademicYear}
                      onChange={e => setFormAcademicYear(e.target.value)}
                      placeholder="e.g. 2025/2026 Ganjil & Genap"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Status Silabus */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Status Publikasi
                    </label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as SyllabusStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ACTIVE">ACTIVE (Aktif)</option>
                      <option value="DRAFT">DRAFT (Dalam Penyusunan)</option>
                      <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
                    </select>
                  </div>

                  {/* Link Drive PDF (Opsional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Link Dokumen PDF Drive (Opsional)
                    </label>
                    <input
                      type="url"
                      value={formPdfUrl}
                      onChange={e => setFormPdfUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Subtes Resmi SNBT (Opsional) */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subtes Resmi SNBT (Opsional)</span>
                    </label>
                    <select
                      value={formSnbtSubtestCode}
                      onChange={e => {
                        const code = e.target.value;
                        setFormSnbtSubtestCode(code);
                        if (code === 'PU') {
                          setFormSnbtCategory('TPS');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Penalaran Umum (TPS)');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else if (code === 'PPU') {
                          setFormSnbtCategory('TPS');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Pengetahuan & Pemahaman Umum (TPS)');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else if (code === 'PBM') {
                          setFormSnbtCategory('TPS');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Pemahaman Bacaan & Menulis (TPS)');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else if (code === 'PK') {
                          setFormSnbtCategory('TPS');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Pengetahuan Kuantitatif (TPS)');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else if (code === 'LBI') {
                          setFormSnbtCategory('Literasi');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Literasi Bahasa Indonesia');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else if (code === 'LBE') {
                          setFormSnbtCategory('Literasi');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Literasi Bahasa Inggris');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else if (code === 'PM') {
                          setFormSnbtCategory('Penalaran Matematika');
                          if (!formSubject || formSubject.includes('Matematika')) setFormSubject('Penalaran Matematika');
                          if (formTargetClass === 'SEMUA') setFormTargetClass('XII-UTBK');
                        } else {
                          setFormSnbtCategory('');
                        }
                      }}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="">-- Bukan Modul Khusus SNBT --</option>
                      <option value="PU">PU - Penalaran Umum (TPS)</option>
                      <option value="PPU">PPU - Pengetahuan & Pemahaman Umum (TPS)</option>
                      <option value="PBM">PBM - Pemahaman Bacaan & Menulis (TPS)</option>
                      <option value="PK">PK - Pengetahuan Kuantitatif (TPS)</option>
                      <option value="LBI">LBI - Literasi dalam Bahasa Indonesia</option>
                      <option value="LBE">LBE - Literasi dalam Bahasa Inggris</option>
                      <option value="PM">PM - Penalaran Matematika</option>
                    </select>
                  </div>

                  {/* Kategori SNBT */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kategori SNBT / Jalur
                    </label>
                    <select
                      value={formSnbtCategory}
                      onChange={e => setFormSnbtCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Reguler / Non-SNBT --</option>
                      <option value="TPS">TPS (Tes Potensi Skolastik)</option>
                      <option value="Literasi">Literasi Bahasa (LBI & LBE)</option>
                      <option value="Penalaran Matematika">Penalaran Matematika</option>
                    </select>
                  </div>

                  {/* Deskripsi */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Deskripsi & Ringkasan Capaian Umum
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      placeholder="Jelaskan gambaran umum silabus, target skor kelulusan, dan strategi pengajaran..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Dynamic Topic & Bab Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Bagian 2: Susunan Bab & Rencana Pertemuan ({formTopics.length} Bab)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Rancang alokasi pertemuan 1, 2, 3, dst. secara terstruktur.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30 transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Pertemuan</span>
                  </button>
                </div>

                {/* Topics Container */}
                <div className="space-y-3">
                  {formTopics.map((top, idx) => (
                    <div
                      key={top.id || idx}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 relative group"
                    >
                      {/* Topic Header & Order Controls */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            Pertemuan Ke-{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveTopic(idx, 'up')}
                            className="p-1 rounded-lg text-slate-500 hover:text-white disabled:opacity-30"
                            title="Pindah ke Atas"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === formTopics.length - 1}
                            onClick={() => handleMoveTopic(idx, 'down')}
                            className="p-1 rounded-lg text-slate-500 hover:text-white disabled:opacity-30"
                            title="Pindah ke Bawah"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(idx)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                            title="Hapus Pertemuan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Topic Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        
                        {/* Judul Bab */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Judul Bab / Pokok Bahasan <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={top.title}
                            onChange={e => handleUpdateTopic(idx, { title: e.target.value })}
                            placeholder="e.g. Kinematika Gerak Lurus & Gerak Parabola"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Durasi Jam / Menit */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Durasi (Menit)
                          </label>
                          <input
                            type="number"
                            min={30}
                            max={240}
                            step={15}
                            value={top.durationMinutes || 90}
                            onChange={e => handleUpdateTopic(idx, { durationMinutes: parseInt(e.target.value) || 90 })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Capaian Pembelajaran */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Capaian Pembelajaran / Kompetensi Dasar
                          </label>
                          <input
                            type="text"
                            value={top.competency}
                            onChange={e => handleUpdateTopic(idx, { competency: e.target.value })}
                            placeholder="e.g. Siswa mampu menganalisis grafik kecepatan terhadap waktu (v-t) dan menentukan percepatan."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Subtopics (Textarea 1 item per baris) */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Rincian Sub-Topik / Materi Pokok (1 per baris)
                          </label>
                          <textarea
                            rows={2}
                            value={top.subtopics?.join('\n') || ''}
                            onChange={e => handleSubtopicTextChange(idx, e.target.value)}
                            placeholder="GLB & GLBB&#10;Gerak Parabola & Jangkauan Maksimum&#10;Grafik Kecepatan & Percepatan"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
                          />
                        </div>

                        {/* Metode Pembelajaran */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Metode Ajar
                          </label>
                          <input
                            type="text"
                            value={top.teachingMethod || ''}
                            onChange={e => handleUpdateTopic(idx, { teachingMethod: e.target.value })}
                            placeholder="e.g. Problem Based Learning & Drill Soal"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Link Google Drive Materi / Soal */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-sky-400 mb-1 flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-sky-400" />
                            <span>Link Google Drive (Materi / Modul / Bank Soal)</span>
                          </label>
                          <input
                            type="url"
                            value={top.driveLink || ''}
                            onChange={e => handleUpdateTopic(idx, { driveLink: e.target.value })}
                            placeholder="https://drive.google.com/..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>

                        {/* Label Tautan Drive */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Label Link Drive
                          </label>
                          <input
                            type="text"
                            value={top.driveLinkTitle || ''}
                            onChange={e => handleUpdateTopic(idx, { driveLinkTitle: e.target.value })}
                            placeholder="e.g. Modul PPT & Bank Soal"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        {/* Integrasi Modul LMS */}
                        <div>
                          <label className="block text-[11px] font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-400" />
                            <span>Modul Terkait</span>
                          </label>
                          <select
                            value={top.linkedMaterialId || ''}
                            onChange={e => {
                              const matId = e.target.value;
                              const selectedMat = (materials || []).find(m => m.id === matId);
                              handleUpdateTopic(idx, {
                                linkedMaterialId: matId || undefined,
                                linkedMaterialTitle: selectedMat?.title || undefined
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">-- Tanpa Modul --</option>
                            {(materials || []).map(m => (
                              <option key={m.id} value={m.id}>
                                {m.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Integrasi Paket Soal CBT */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3 text-emerald-400" />
                            <span>Paket Soal CBT Terkait</span>
                          </label>
                          <select
                            value={top.linkedExamId || ''}
                            onChange={e => {
                              const exId = e.target.value;
                              const selectedEx = (exams || []).find(ex => ex.id === exId);
                              handleUpdateTopic(idx, {
                                linkedExamId: exId || undefined,
                                linkedExamTitle: selectedEx?.title || undefined
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- Tanpa CBT --</option>
                            {(exams || []).map(ex => (
                              <option key={ex.id} value={ex.id}>
                                {ex.title} ({ex.category || ex.targetClass})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-slate-950/40 text-slate-400 hover:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pertemuan Baru</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 py-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                >
                  Simpan Silabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. QUICK TEMPLATE GENERATOR MODAL */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Generator Template Silabus Cepat</h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Pilih template resmi 7 subtes SNBT atau pilih mata pelajaran sekolah untuk membuat draf silabus lengkap otomatis.
            </p>

            {/* Official 7 SNBT Subtest Blueprints */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Blueprint Resmi 7 Subtes UTBK-SNBT 2026</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Standar SNPMB
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SNBT_7_SUBTEST_METAS.map(sub => (
                  <button
                    key={sub.code}
                    onClick={() => handleApplyOfficialSnbtTemplate(sub.code)}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-left transition-all group flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400">{sub.code}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                          {sub.category}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 group-hover:text-amber-200 truncate mt-0.5">
                        {sub.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400/80 shrink-0 group-hover:translate-x-0.5 transition-transform">
                      Muat →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Template Kurikulum Sekolah:
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {subjects.map(sbj => (
                <div
                  key={sbj.id}
                  className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{sbj.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{sbj.group || 'Umum'} • {sbj.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApplyQuickTemplate(sbj.name, 'XII-UTBK')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30"
                    >
                      XII-UTBK
                    </button>
                    <button
                      onClick={() => handleApplyQuickTemplate(sbj.name, 'XI-IPA')}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-600/30"
                    >
                      XI-IPA
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && syllabusToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Hapus Silabus?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus silabus <strong className="text-slate-200">"{syllabusToDelete.title}"</strong> ({syllabusToDelete.code})?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRATINJAU & CETAK DOKUMEN SILABUS LABSCHOOL */}
      {/* ========================================================================= */}
      {isPrintSyllabusModalOpen && (
        <LabschoolPrintSyllabusModal
          isOpen={isPrintSyllabusModalOpen}
          onClose={() => setIsPrintSyllabusModalOpen(false)}
          initialLevel={printModalLevel}
          initialSubtestCode="ALL"
          onShowToast={(msg, type) => {
            if (onShowToast) onShowToast(msg, type);
          }}
        />
      )}

    </div>
  );
};
