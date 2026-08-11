import React, { useState, useMemo } from 'react';
import { LearningMaterial, ClassItem, SubjectItem, SyllabusItem, MaterialType } from '../../types';
import { formatGoogleDriveEmbedUrl } from '../../utils/drive';
import {
  BookOpen,
  Plus,
  FileText,
  Video,
  Presentation,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  Filter,
  BookMarked,
  Layers,
  Sparkles,
  Link2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  User,
  Info
} from 'lucide-react';

interface MaterialManagementProps {
  materials: LearningMaterial[];
  classes: ClassItem[];
  subjects?: SubjectItem[];
  syllabi?: SyllabusItem[];
  onSaveMaterial: (material: LearningMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  onNavigateToSyllabus?: (syllabusId: string) => void;
}

export const MaterialManagement: React.FC<MaterialManagementProps> = ({
  materials,
  classes,
  subjects = [],
  syllabi = [],
  onSaveMaterial,
  onDeleteMaterial,
  onNavigateToSyllabus
}) => {
  // Filters & Search in Main List
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSyllabusFilter, setSelectedSyllabusFilter] = useState<string>('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState('SEMUA');
  const [subject, setSubject] = useState('');
  const [mediaType, setMediaType] = useState<MaterialType>('PDF');
  const [url, setUrl] = useState('');

  // Syllabus Link in Form (Cascading Selection: Mata Pelajaran -> Kelas -> Nama Silabus -> Materi Pokok)
  const [linkToSyllabus, setLinkToSyllabus] = useState(false);
  const [formSyllabusSubject, setFormSyllabusSubject] = useState<string>('ALL');
  const [formSyllabusClass, setFormSyllabusClass] = useState<string>('ALL');
  const [selectedSyllabusId, setSelectedSyllabusId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<LearningMaterial | null>(null);

  // Available distinct subjects for filtering & selection
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach(s => {
      if (s.name?.trim()) set.add(s.name.trim());
    });
    syllabi.forEach(s => {
      if (s.subject?.trim()) set.add(s.subject.trim());
    });
    return Array.from(set).sort();
  }, [subjects, syllabi]);

  // Available distinct classes for filtering & selection
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    classes.forEach(c => {
      if (c.name?.trim()) set.add(c.name.trim());
    });
    syllabi.forEach(s => {
      if (s.targetClass?.trim() && s.targetClass !== 'SEMUA') set.add(s.targetClass.trim());
    });
    return Array.from(set).sort();
  }, [classes, syllabi]);

  // Syllabi filtered by chosen cascading Subject & Class in Modal
  const filteredSyllabiInModal = useMemo(() => {
    return syllabi.filter(sil => {
      const matchSubject =
        formSyllabusSubject === 'ALL' ||
        sil.subject.toLowerCase() === formSyllabusSubject.toLowerCase();
      const matchClass =
        formSyllabusClass === 'ALL' ||
        sil.targetClass === formSyllabusClass ||
        sil.targetClass === 'SEMUA';
      return matchSubject && matchClass;
    });
  }, [syllabi, formSyllabusSubject, formSyllabusClass]);

  // Active selected syllabus object
  const activeSyllabusObj = useMemo(() => {
    return syllabi.find(s => s.id === selectedSyllabusId) || null;
  }, [syllabi, selectedSyllabusId]);

  // Active selected topic object (Materi Pokok)
  const activeTopicObj = useMemo(() => {
    if (!activeSyllabusObj || !selectedTopicId) return null;
    return activeSyllabusObj.topics.find(t => t.id === selectedTopicId) || null;
  }, [activeSyllabusObj, selectedTopicId]);

  const openFormModal = (item?: LearningMaterial, prefilledSyllabusId?: string, prefilledTopicId?: string) => {
    if (item) {
      setEditingMaterial(item);
      setTitle(item.title);
      setDescription(item.description);
      setTargetClass(item.targetClass || 'SEMUA');
      setSubject(item.subject || '');
      setMediaType(item.mediaType);
      setUrl(item.url);

      if (item.syllabusId) {
        setLinkToSyllabus(true);
        setSelectedSyllabusId(item.syllabusId);
        setSelectedTopicId(item.syllabusTopicId || '');
        const sil = syllabi.find(s => s.id === item.syllabusId);
        if (sil) {
          setFormSyllabusSubject(sil.subject || 'ALL');
          setFormSyllabusClass(sil.targetClass || 'ALL');
        } else {
          setFormSyllabusSubject('ALL');
          setFormSyllabusClass('ALL');
        }
      } else {
        setLinkToSyllabus(false);
        setSelectedSyllabusId('');
        setSelectedTopicId('');
        setFormSyllabusSubject('ALL');
        setFormSyllabusClass('ALL');
      }
    } else {
      setEditingMaterial(null);
      setTitle('');
      setDescription('');
      setMediaType('PDF');
      setUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

      if (prefilledSyllabusId) {
        setLinkToSyllabus(true);
        setSelectedSyllabusId(prefilledSyllabusId);
        const sil = syllabi.find(s => s.id === prefilledSyllabusId);
        if (sil) {
          setTargetClass(sil.targetClass || 'SEMUA');
          setSubject(sil.subject || '');
          setFormSyllabusSubject(sil.subject || 'ALL');
          setFormSyllabusClass(sil.targetClass || 'ALL');
          if (prefilledTopicId) {
            setSelectedTopicId(prefilledTopicId);
            const top = sil.topics.find(t => t.id === prefilledTopicId);
            if (top) {
              setTitle(`Bahan Ajar Pertemuan ${top.meetingNumber}: ${top.title}`);
              const subDesc = top.subtopics?.length ? `Pokok bahasan: ${top.subtopics.join(', ')}. ` : '';
              setDescription(`Materi Pokok: ${top.title}. ${subDesc}Capaian: ${top.competency}`);
            } else {
              setTitle(`Materi: ${sil.title}`);
              setDescription(sil.description || '');
            }
          } else {
            setTitle(`Materi: ${sil.title}`);
            setDescription(sil.description || '');
          }
        }
      } else {
        setTargetClass('SEMUA');
        setSubject(subjects[0]?.name || availableSubjects[0] || '');
        setLinkToSyllabus(false);
        setSelectedSyllabusId('');
        setSelectedTopicId('');
        setFormSyllabusSubject('ALL');
        setFormSyllabusClass('ALL');
      }
    }
    setIsFormOpen(true);
  };

  // Handle Cascading Mata Pelajaran filter change
  const handleCascadingSubjectChange = (newSubject: string) => {
    setFormSyllabusSubject(newSubject);
    if (selectedSyllabusId) {
      const currentSil = syllabi.find(s => s.id === selectedSyllabusId);
      if (currentSil && newSubject !== 'ALL' && currentSil.subject.toLowerCase() !== newSubject.toLowerCase()) {
        setSelectedSyllabusId('');
        setSelectedTopicId('');
      }
    }
  };

  // Handle Cascading Kelas filter change
  const handleCascadingClassChange = (newClass: string) => {
    setFormSyllabusClass(newClass);
    if (selectedSyllabusId) {
      const currentSil = syllabi.find(s => s.id === selectedSyllabusId);
      if (currentSil && newClass !== 'ALL' && currentSil.targetClass !== newClass && currentSil.targetClass !== 'SEMUA') {
        setSelectedSyllabusId('');
        setSelectedTopicId('');
      }
    }
  };

  // Handle syllabus selection change -> automatically updates targetClass and subject
  const handleSyllabusChange = (sId: string) => {
    setSelectedSyllabusId(sId);
    setSelectedTopicId('');
    if (sId) {
      const sil = syllabi.find(s => s.id === sId);
      if (sil) {
        // Otomatis sinkronkan form kelas sasaran dan mata pelajaran sesuai silabus
        if (sil.targetClass) {
          setTargetClass(sil.targetClass);
        }
        if (sil.subject) {
          setSubject(sil.subject);
        }
        // Update cascading selectors
        if (sil.subject) setFormSyllabusSubject(sil.subject);
        if (sil.targetClass && sil.targetClass !== 'SEMUA') setFormSyllabusClass(sil.targetClass);

        // Auto-fill title if empty or default
        if (!title.trim() || title.startsWith('Bahan Ajar:') || title.startsWith('Materi:')) {
          setTitle(`Materi: ${sil.title}`);
        }
      }
    }
  };

  // Handle topic (Materi Pokok) selection change -> auto fills topic title & synchronizes
  const handleTopicChange = (topId: string) => {
    setSelectedTopicId(topId);
    if (topId && activeSyllabusObj) {
      const topic = activeSyllabusObj.topics.find(t => t.id === topId);
      if (topic) {
        // Re-ensure Form Kelas Sasaran & Mata Pelajaran are synchronized with syllabus
        if (activeSyllabusObj.targetClass) setTargetClass(activeSyllabusObj.targetClass);
        if (activeSyllabusObj.subject) setSubject(activeSyllabusObj.subject);

        // Auto-fill Title with topic name
        setTitle(`Bahan Ajar Pertemuan ${topic.meetingNumber}: ${topic.title}`);

        // Auto-fill Description
        const subDesc = topic.subtopics && topic.subtopics.length > 0
          ? `Pokok bahasan: ${topic.subtopics.join(', ')}. `
          : '';
        const compDesc = topic.competency ? `Capaian Pembelajaran: ${topic.competency}` : '';
        setDescription(`Materi Pokok: ${topic.title}. ${subDesc}${compDesc}`.trim());
      }
    }
  };

  // Force re-sync with active syllabus
  const handleResyncFromSyllabus = () => {
    if (activeSyllabusObj) {
      if (activeSyllabusObj.targetClass) setTargetClass(activeSyllabusObj.targetClass);
      if (activeSyllabusObj.subject) setSubject(activeSyllabusObj.subject);
      if (formSyllabusSubject !== activeSyllabusObj.subject) setFormSyllabusSubject(activeSyllabusObj.subject);
      if (formSyllabusClass !== activeSyllabusObj.targetClass) setFormSyllabusClass(activeSyllabusObj.targetClass);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let linkedSilCode: string | undefined;
    let linkedSilTitle: string | undefined;
    let linkedMeetingNum: number | undefined;
    let linkedTopicTitle: string | undefined;

    if (linkToSyllabus && activeSyllabusObj) {
      linkedSilCode = activeSyllabusObj.code;
      linkedSilTitle = activeSyllabusObj.title;

      if (selectedTopicId) {
        const top = activeSyllabusObj.topics.find(t => t.id === selectedTopicId);
        if (top) {
          linkedMeetingNum = top.meetingNumber;
          linkedTopicTitle = top.title;
        }
      }
    }

    const payload: LearningMaterial = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      targetClass,
      subject: subject || undefined,
      mediaType,
      url: url.trim(),
      createdAt: editingMaterial ? editingMaterial.createdAt : new Date().toISOString().split('T')[0],
      syllabusId: linkToSyllabus && selectedSyllabusId ? selectedSyllabusId : undefined,
      syllabusCode: linkedSilCode,
      syllabusTitle: linkedSilTitle,
      syllabusTopicId: linkToSyllabus && selectedTopicId ? selectedTopicId : undefined,
      meetingNumber: linkedMeetingNum,
      topicTitle: linkedTopicTitle
    };

    onSaveMaterial(payload);
    setIsFormOpen(false);
  };

  // Filtered materials for main listing
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.syllabusCode && m.syllabusCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.syllabusTitle && m.syllabusTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.topicTitle && m.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchClass = selectedClass === 'ALL' || m.targetClass === selectedClass || m.targetClass === 'SEMUA';
      const matchSubject = selectedSubjectFilter === 'ALL' || (m.subject && m.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());
      const matchType = selectedType === 'ALL' || m.mediaType === selectedType;
      const matchSyllabus =
        selectedSyllabusFilter === 'ALL' ||
        (selectedSyllabusFilter === 'LINKED' && Boolean(m.syllabusId)) ||
        (selectedSyllabusFilter === 'UNLINKED' && !m.syllabusId) ||
        m.syllabusId === selectedSyllabusFilter;

      return matchSearch && matchClass && matchSubject && matchType && matchSyllabus;
    });
  }, [materials, searchTerm, selectedClass, selectedSubjectFilter, selectedType, selectedSyllabusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = materials.length;
    const pdf = materials.filter(m => m.mediaType === 'PDF').length;
    const video = materials.filter(m => m.mediaType === 'VIDEO').length;
    const ppt = materials.filter(m => m.mediaType === 'PPT').length;
    const drive = materials.filter(m => m.mediaType === 'DRIVE').length;
    const linkedCount = materials.filter(m => m.syllabusId).length;
    return { total, pdf, video, ppt, drive, linkedCount };
  }, [materials]);

  const getMediaBadge = (type: MaterialType) => {
    switch (type) {
      case 'PDF':
        return (
          <span
            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
            title="Dokumen PDF"
          >
            <FileText className="w-3.5 h-3.5" />
          </span>
        );
      case 'VIDEO':
        return (
          <span
            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm"
            title="YouTube Video"
          >
            <Video className="w-3.5 h-3.5" />
          </span>
        );
      case 'PPT':
        return (
          <span
            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
            title="Slide PPT"
          >
            <Presentation className="w-3.5 h-3.5" />
          </span>
        );
      case 'DRIVE':
        return (
          <span
            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm"
            title="Google Drive"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Pengelola Materi & Bahan Ajar Terpadu
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {materials.length} Modul
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Unggah modul PDF, slide PPT, video, dan integrasikan langsung dengan Silabus & Pertemuan RPP (Mata Pelajaran, Kelas, Nama Silabus & Materi Pokok).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            id="btn-add-new-material"
            onClick={() => openFormModal()}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Unggah Materi Baru
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
            {stats.total}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Bahan Ajar</span>
            <span className="text-xs font-bold text-white">Semua Modul</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
            {stats.linkedCount}
          </div>
          <div>
            <span className="text-[10px] text-amber-400/80 block font-medium">Taut Silabus</span>
            <span className="text-xs font-bold text-white">Terintegrasi RPP</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">
            {stats.pdf}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Dokumen PDF</span>
            <span className="text-xs font-bold text-white">Modul & E-Book</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center font-bold text-xs">
            {stats.video}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Video Belajar</span>
            <span className="text-xs font-bold text-white">YouTube / Live</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
            {stats.ppt}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Slide PPT</span>
            <span className="text-xs font-bold text-white">Presentasi Ajar</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
            {stats.drive}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Google Drive</span>
            <span className="text-xs font-bold text-white">Cloud Storage</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari materi, silabus, topik..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 max-w-[150px] truncate"
          >
            <option value="ALL">Semua Mapel</option>
            {availableSubjects.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Media Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
          >
            <option value="ALL">Semua Format</option>
            <option value="PDF">PDF Document</option>
            <option value="VIDEO">YouTube Video</option>
            <option value="PPT">Slide PPT</option>
            <option value="DRIVE">Google Drive</option>
          </select>

          {/* Syllabus Integration Filter */}
          <select
            value={selectedSyllabusFilter}
            onChange={e => setSelectedSyllabusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 max-w-[180px] truncate"
          >
            <option value="ALL">Semua Silabus</option>
            <option value="LINKED">⚡ Hanya Terhubung Silabus</option>
            <option value="UNLINKED">Materi Umum (Tanpa Silabus)</option>
            {syllabi.map(sil => (
              <option key={sil.id} value={sil.id}>
                {sil.code} - {sil.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Materi */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all shadow-xl group"
            >
              <div className="space-y-3">
                
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getMediaBadge(item.mediaType)}
                    {item.subject && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.subject}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.targetClass}
                  </span>
                </div>

                {/* Integrated Syllabus Box */}
                {item.syllabusId ? (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                        <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                        Silabus Terpadu
                      </span>
                      {item.meetingNumber && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pertemuan #{item.meetingNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-1">
                      {item.syllabusCode ? `${item.syllabusCode} - ` : ''}{item.syllabusTitle || 'Silabus Terkait'}
                    </p>
                    {item.topicTitle && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-200/90 line-clamp-1 font-medium">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>Materi Pokok: {item.topicTitle}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Modul Pembelajaran Umum</span>
                    <button
                      type="button"
                      onClick={() => openFormModal(item)}
                      className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Link2 className="w-3 h-3" />
                      Tautkan ke Silabus
                    </button>
                  </div>
                )}

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Rilis: {item.createdAt}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded-xl text-xs flex items-center gap-1 transition-colors"
                    title="Preview Media Embed"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openFormModal(item)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors"
                    title="Edit Materi"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus materi ${item.title}?`)) onDeleteMaterial(item.id);
                    }}
                    className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 rounded-xl text-xs transition-colors"
                    title="Hapus Materi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">Tidak ada materi pembelajaran yang cocok</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau ganti filter mata pelajaran, kelas, dan silabus.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedClass('ALL');
              setSelectedSubjectFilter('ALL');
              setSelectedType('ALL');
              setSelectedSyllabusFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* MODAL FORM UPLOAD / EDIT MATERI */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingMaterial ? 'Edit Materi Pembelajaran' : 'Unggah / Input Materi Pembelajaran Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Lengkapi judul, URL file media, dan integrasikan langsung dengan Silabus & Agenda RPP.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* SECTION: INTEGRASI DENGAN SILABUS (CASCADING: MAPEL -> KELAS -> SILABUS -> MATERI POKOK) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="checkbox-link-syllabus"
                      checked={linkToSyllabus}
                      onChange={e => {
                        const checked = e.target.checked;
                        setLinkToSyllabus(checked);
                        if (!checked) {
                          setSelectedSyllabusId('');
                          setSelectedTopicId('');
                        } else if (syllabi.length > 0 && !selectedSyllabusId) {
                          handleSyllabusChange(syllabi[0].id);
                        }
                      }}
                      className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900 focus:ring-amber-500 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <BookMarked className="w-4 h-4 text-amber-400" />
                        Integrasi dengan Silabus & Perangkat Ajar RPP
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Pilih Mata Pelajaran, Kelas, Nama Silabus, dan Materi Pokok untuk otomatisasi form.
                      </p>
                    </div>
                  </label>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cascading Link
                  </span>
                </div>

                {linkToSyllabus && (
                  <div className="space-y-4 pt-3 border-t border-slate-800/80">
                    
                    {/* CASCADING SELECTIONS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* 1. PILIH MATA PELAJARAN */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-extrabold">1</span>
                          Pilih Mata Pelajaran
                        </label>
                        <select
                          id="select-syllabus-subject"
                          value={formSyllabusSubject}
                          onChange={e => handleCascadingSubjectChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                        >
                          <option value="ALL">Semua Mata Pelajaran</option>
                          {availableSubjects.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. PILIH KELAS */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-extrabold">2</span>
                          Pilih Kelas
                        </label>
                        <select
                          id="select-syllabus-class"
                          value={formSyllabusClass}
                          onChange={e => handleCascadingClassChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                        >
                          <option value="ALL">Semua Kelas</option>
                          {availableClasses.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. PILIH NAMA SILABUS */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-extrabold">3</span>
                            Pilih Nama Silabus Pengampu *
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {filteredSyllabiInModal.length} silabus ditemukan
                          </span>
                        </div>
                        <select
                          id="select-syllabus-name"
                          value={selectedSyllabusId}
                          onChange={e => handleSyllabusChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors font-medium"
                          required={linkToSyllabus}
                        >
                          <option value="">-- Pilih Silabus Pengampu Terkait --</option>
                          {filteredSyllabiInModal.map(sil => (
                            <option key={sil.id} value={sil.id}>
                              [{sil.code}] {sil.title} — ({sil.targetClass} • {sil.subject})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 4. PILIH MATERI POKOK / POKOK BAHASAN PERTEMUAN */}
                      {activeSyllabusObj && (
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-extrabold">4</span>
                            Pilih Materi Pokok / Pertemuan RPP
                          </label>
                          <select
                            id="select-syllabus-topic"
                            value={selectedTopicId}
                            onChange={e => handleTopicChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors font-medium"
                          >
                            <option value="">-- Tautkan ke Materi Pokok Spesifik (Opsional) --</option>
                            {activeSyllabusObj.topics.map(top => (
                              <option key={top.id} value={top.id}>
                                Pertemuan {top.meetingNumber}: {top.title} {top.durationMinutes ? `(${top.durationMinutes} mnt)` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* LIVE SYNC PREVIEW & STATUS BADGE */}
                    {activeSyllabusObj && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Form Tersinkronisasi Otomatis dari Silabus
                          </span>
                          <button
                            type="button"
                            onClick={handleResyncFromSyllabus}
                            className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors"
                            title="Terapkan kembali Mapel & Kelas dari Silabus terpilih"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Sinkronkan Ulang
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block">Mata Pelajaran</span>
                            <span className="font-bold text-white text-[11px] truncate block">{activeSyllabusObj.subject}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block">Kelas Sasaran</span>
                            <span className="font-bold text-cyan-300 text-[11px] truncate block">{activeSyllabusObj.targetClass}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block">Kode Silabus</span>
                            <span className="font-bold text-amber-300 text-[11px] truncate block">{activeSyllabusObj.code}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block">Materi Pokok</span>
                            <span className="font-bold text-emerald-300 text-[11px] truncate block">
                              {activeTopicObj ? `P-${activeTopicObj.meetingNumber}: ${activeTopicObj.title}` : 'Semua Bab'}
                            </span>
                          </div>
                        </div>

                        {activeTopicObj && (
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                            {activeTopicObj.subtopics && activeTopicObj.subtopics.length > 0 && (
                              <p className="text-slate-400">
                                <strong className="text-slate-300">Rincian Pokok Bahasan:</strong> {activeTopicObj.subtopics.join(' • ')}
                              </p>
                            )}
                            {activeTopicObj.competency && (
                              <p className="text-amber-200/90">
                                <strong className="text-amber-300">Capaian:</strong> {activeTopicObj.competency}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FORM UTAMA: JUDUL MATERI */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Judul Materi Pembelajaran *
                </label>
                <input
                  type="text"
                  id="input-material-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Modul Intensif Penalaran Matematika Bab 1..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              {/* FORM UTAMA: KELAS SASARAN & MATA PELAJARAN (MENYESUAIKAN SILABUS TERPILIH) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Kelas Sasaran *
                    </label>
                    {linkToSyllabus && activeSyllabusObj && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Auto-sync Silabus
                      </span>
                    )}
                  </div>
                  <select
                    id="input-material-target-class"
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="SEMUA">SEMUA KELAS</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {/* Add any extra classes present in availableClasses if not in classes list */}
                    {availableClasses
                      .filter(c => !classes.some(cl => cl.name === c))
                      .map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {linkToSyllabus && activeSyllabusObj
                      ? `Menyesuaikan target silabus (${activeSyllabusObj.targetClass}).`
                      : 'Pilih kelas siswa yang dapat mengakses materi ini.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Mata Pelajaran *
                    </label>
                    {linkToSyllabus && activeSyllabusObj && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Auto-sync Silabus
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="input-material-subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Matematika / Fisika / Biologi / TPS..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {linkToSyllabus && activeSyllabusObj
                      ? `Menyesuaikan mapel silabus (${activeSyllabusObj.subject}).`
                      : 'Ketik atau sesuaikan nama mata pelajaran materi.'}
                  </p>
                </div>
              </div>

              {/* FORM UTAMA: FORMAT MEDIA & URL LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tipe Format Media *
                  </label>
                  <select
                    id="input-material-media-type"
                    value={mediaType}
                    onChange={e => setMediaType(e.target.value as MaterialType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="PDF">PDF Document (E-Book/Modul)</option>
                    <option value="VIDEO">YouTube Video Embed</option>
                    <option value="PPT">Slide Presentation (PPT/Google Slide)</option>
                    <option value="DRIVE">Google Drive File / Folder Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    URL / Link Embed File *
                  </label>
                  <input
                    type="url"
                    id="input-material-url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://drive.google.com/... atau https://youtube.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* FORM UTAMA: DESKRIPSI / PETUNJUK */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deskripsi / Petunjuk Belajar Siswa
                </label>
                <textarea
                  id="input-material-description"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Rangkuman singkat, pokok bahasan, dan panduan belajar untuk siswa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-material"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingMaterial ? 'Perbarui Materi' : 'Simpan & Publikasikan Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW EMBED */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full h-[85vh] flex flex-col space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  {previewItem.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target: {previewItem.targetClass} {previewItem.subject ? `• Mapel: ${previewItem.subject}` : ''} • Tipe: {previewItem.mediaType}
                  {previewItem.syllabusTitle ? ` • Silabus: ${previewItem.syllabusTitle}` : ''}
                  {previewItem.topicTitle ? ` (Materi Pokok: ${previewItem.topicTitle})` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1"
                  title="Buka di Tab Baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              {previewItem.mediaType === 'VIDEO' ? (
                <iframe
                  src={previewItem.url}
                  title={previewItem.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <iframe
                  src={formatGoogleDriveEmbedUrl(previewItem.url)}
                  title={previewItem.title}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
