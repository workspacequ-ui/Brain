import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { 
  StudentTryoutResult, 
  TryoutMultiColumnAnalysisRow, 
  computeTryoutMultiColumnRow,
  saveStoredTryoutResults,
  DEFAULT_LAB_TRYOUTS,
  DEFAULT_LABSCHOOL_ACTIVE_STUDENTS
} from './labschoolLaporanData';
import { loadStoredCampuses } from './labschoolCampusData';
import { 
  Table, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Search, 
  Download, 
  TrendingUp, 
  Award, 
  BarChart3, 
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  Printer,
  Edit3,
  Trash2,
  Eye,
  Plus,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';

interface LabschoolTryoutMultiTableProps {
  tryoutResults: StudentTryoutResult[];
  selectedStudentId?: string;
  user?: User;
  onSelectTryout?: (result: StudentTryoutResult) => void;
  onOpenPrintModal?: (type?: 'TRYOUT_TABLE' | 'TRYOUT') => void;
  onUpdateResults?: (newResults: StudentTryoutResult[]) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  className?: string;
}

export const LabschoolTryoutMultiTable: React.FC<LabschoolTryoutMultiTableProps> = ({
  tryoutResults,
  selectedStudentId,
  user,
  onSelectTryout,
  onOpenPrintModal,
  onUpdateResults,
  onShowToast,
  className = ''
}) => {
  const isAdmin = user?.role === 'admin';
  const campuses = useMemo(() => loadStoredCampuses(), []);

  const [filterStudent, setFilterStudent] = useState<string>(selectedStudentId || 'ALL');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'SMA' | 'SMP'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof TryoutMultiColumnAnalysisRow>('submittedAt');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Admin Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedRowForAction, setSelectedRowForAction] = useState<TryoutMultiColumnAnalysisRow | null>(null);

  // Form State for Edit/Add
  const [formState, setFormState] = useState({
    id: '',
    tryoutId: DEFAULT_LAB_TRYOUTS[0]?.id || 'to-sma-5',
    tryoutTitle: DEFAULT_LAB_TRYOUTS[0]?.title || 'Tryout Akbar PSB SMA Labschool 2026 - Seri 5',
    level: 'SMA' as 'SMP' | 'SMA',
    studentId: DEFAULT_LABSCHOOL_ACTIVE_STUDENTS[0]?.id || 'u-s1',
    studentName: DEFAULT_LABSCHOOL_ACTIVE_STUDENTS[0]?.name || 'Budi Santoso',
    studentNis: DEFAULT_LABSCHOOL_ACTIVE_STUDENTS[0]?.nis || '202601001',
    studentClass: DEFAULT_LABSCHOOL_ACTIVE_STUDENTS[0]?.className || 'XII-MIPA 1',
    targetCampusId: 'camp-rawamangun',
    targetCampusName: 'Labschool Rawamangun',
    submittedAt: new Date().toISOString().slice(0, 10) + ' 14:00',
    durationMinutes: 100,
    nilaiPK: 85,
    kvIndo: 88,
    kvInggris: 82,
    pmIndo: 86,
    pmInggris: 84,
    kaIpa: 82,
    kaIps: 84,
    nilaiSK: 88
  });

  // Sync with prop when parent filter changes
  useEffect(() => {
    if (selectedStudentId) {
      setFilterStudent(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Get unique students for filter
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { id: string; name: string; level: 'SMP' | 'SMA'; nis: string }>();
    tryoutResults.forEach(r => {
      if (!map.has(r.studentId)) {
        map.set(r.studentId, { id: r.studentId, name: r.studentName, level: r.level, nis: r.studentNis });
      }
    });
    return Array.from(map.values());
  }, [tryoutResults]);

  // Compute 14-column rows
  const computedRows: TryoutMultiColumnAnalysisRow[] = useMemo(() => {
    return tryoutResults.map(r => computeTryoutMultiColumnRow(r));
  }, [tryoutResults]);

  // Filtered & Sorted Rows
  const filteredRows = useMemo(() => {
    return computedRows
      .filter(row => {
        if (filterStudent !== 'ALL' && tryoutResults.find(r => r.id === row.id)?.studentId !== filterStudent) {
          return false;
        }
        if (filterLevel !== 'ALL' && row.level !== filterLevel) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = row.tryoutTitle.toLowerCase().includes(q);
          const matchDate = row.submittedAt.toLowerCase().includes(q);
          const matchStudent = row.studentName.toLowerCase().includes(q);
          const matchCampus = row.targetCampusName.toLowerCase().includes(q);
          if (!matchTitle && !matchDate && !matchStudent && !matchCampus) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });
  }, [computedRows, filterStudent, filterLevel, searchQuery, sortField, sortAsc, tryoutResults]);

  // Calculate Averages and Aggregates
  const aggregates = useMemo(() => {
    if (filteredRows.length === 0) return null;
    const count = filteredRows.length;
    const sum = (fn: (r: TryoutMultiColumnAnalysisRow) => number) => filteredRows.reduce((acc, r) => acc + fn(r), 0);
    const avg = (fn: (r: TryoutMultiColumnAnalysisRow) => number) => +(sum(fn) / count).toFixed(1);

    const lulusCount = filteredRows.filter(r => r.isLulus).length;

    return {
      count,
      avgPK: avg(r => r.nilaiPK),
      avgKvIndo: avg(r => r.kvIndo),
      avgKvInggris: avg(r => r.kvInggris),
      avgKvTotal: avg(r => r.kvTotalAvg),
      avgPmIndo: avg(r => r.pmIndo),
      avgPmInggris: avg(r => r.pmInggris),
      avgPmTotal: avg(r => r.pmTotalAvg),
      avgKaIpa: avg(r => r.kaIpa),
      avgKaIps: avg(r => r.kaIps),
      avgKaTotal: avg(r => r.kaTotalAvg),
      avgSK: avg(r => r.nilaiSK),
      avgSkorAkhir: avg(r => r.skorAkhir),
      maxSkorAkhir: Math.max(...filteredRows.map(r => r.skorAkhir)),
      minSkorAkhir: Math.min(...filteredRows.map(r => r.skorAkhir)),
      lulusCount,
      lulusPercentage: +((lulusCount / count) * 100).toFixed(1)
    };
  }, [filteredRows]);

  const handleSort = (field: keyof TryoutMultiColumnAnalysisRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default to descending for scores
    }
  };

  // Admin Modal Handlers
  const handleOpenEditModal = (row: TryoutMultiColumnAnalysisRow, originalResult?: StudentTryoutResult) => {
    setSelectedRowForAction(row);
    setFormState({
      id: row.id,
      tryoutId: row.tryoutId,
      tryoutTitle: row.tryoutTitle,
      level: row.level,
      studentId: originalResult?.studentId || 'u-s1',
      studentName: row.studentName,
      studentNis: row.studentNis,
      studentClass: originalResult?.studentClass || `${row.level}-LABSCHOOL`,
      targetCampusId: row.targetCampusId || 'camp-rawamangun',
      targetCampusName: row.targetCampusName || 'Labschool Rawamangun',
      submittedAt: row.submittedAt,
      durationMinutes: originalResult?.durationMinutes || 100,
      nilaiPK: row.nilaiPK,
      kvIndo: row.kvIndo,
      kvInggris: row.kvInggris,
      pmIndo: row.pmIndo,
      pmInggris: row.pmInggris,
      kaIpa: row.kaIpa,
      kaIps: row.kaIps,
      nilaiSK: row.nilaiSK
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAddModal = () => {
    const firstStudent = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS[0];
    const defaultTryout = DEFAULT_LAB_TRYOUTS.find(t => t.level === (filterLevel === 'SMP' ? 'SMP' : 'SMA')) || DEFAULT_LAB_TRYOUTS[0];
    const defaultCampus = campuses[0];

    setSelectedRowForAction(null);
    setFormState({
      id: '',
      tryoutId: defaultTryout.id,
      tryoutTitle: defaultTryout.title,
      level: defaultTryout.level,
      studentId: firstStudent?.id || 'u-s1',
      studentName: firstStudent?.name || 'Budi Santoso',
      studentNis: firstStudent?.nis || '202601001',
      studentClass: firstStudent?.className || 'XII-MIPA 1',
      targetCampusId: defaultCampus?.id || 'camp-rawamangun',
      targetCampusName: defaultCampus?.name || 'Labschool Rawamangun',
      submittedAt: new Date().toISOString().slice(0, 10) + ' 14:00',
      durationMinutes: 100,
      nilaiPK: 85,
      kvIndo: 88,
      kvInggris: 82,
      pmIndo: 86,
      pmInggris: 84,
      kaIpa: 82,
      kaIps: 84,
      nilaiSK: 88
    });
    setIsAddModalOpen(true);
  };

  const handleOpenDeleteModal = (row: TryoutMultiColumnAnalysisRow) => {
    setSelectedRowForAction(row);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!formState.id) return;
    const kvAvg = +(((formState.kvIndo + formState.kvInggris) / 2).toFixed(1));
    const pmAvg = +(((formState.pmIndo + formState.pmInggris) / 2).toFixed(1));
    const kaAvg = +(((formState.kaIpa + formState.kaIps) / 2).toFixed(1));
    const totalScore = +(((formState.nilaiPK + kvAvg + pmAvg + kaAvg + formState.nilaiSK) / 5).toFixed(1));

    const updatedItem: StudentTryoutResult = {
      id: formState.id,
      tryoutId: formState.tryoutId,
      tryoutTitle: formState.tryoutTitle,
      level: formState.level,
      studentId: formState.studentId,
      studentName: formState.studentName,
      studentNis: formState.studentNis,
      studentClass: formState.studentClass,
      targetCampusId: formState.targetCampusId,
      targetCampusName: formState.targetCampusName,
      totalScore: totalScore,
      rank: selectedRowForAction?.rank || 5,
      totalParticipants: selectedRowForAction?.totalParticipants || 350,
      percentile: +(100 - ((selectedRowForAction?.rank || 5) / (selectedRowForAction?.totalParticipants || 350)) * 100).toFixed(1),
      durationMinutes: formState.durationMinutes,
      submittedAt: formState.submittedAt,
      subtestScores: [
        {
          code: 'PK',
          name: 'Pengetahuan Kuantitatif',
          score: formState.nilaiPK,
          maxScore: 100,
          correctCount: Math.round(25 * (formState.nilaiPK / 100)),
          totalQuestions: 25,
          accuracy: formState.nilaiPK,
          status: formState.nilaiPK >= 85 ? 'Tinggi' : 'Sedang',
          color: '#f59e0b'
        },
        {
          code: 'KV',
          name: 'Kemampuan Verbal',
          score: kvAvg,
          maxScore: 100,
          correctCount: Math.round(25 * (kvAvg / 100)),
          totalQuestions: 25,
          accuracy: kvAvg,
          status: kvAvg >= 85 ? 'Tinggi' : 'Sedang',
          color: '#3b82f6',
          sections: [
            {
              id: 'KV-ind',
              codePart: 'KV-IND',
              name: 'Verbal Bahasa Indonesia',
              totalQuestions: 13,
              correctCount: Math.round(13 * (formState.kvIndo / 100)),
              wrongCount: 13 - Math.round(13 * (formState.kvIndo / 100)),
              accuracy: formState.kvIndo,
              score: formState.kvIndo,
              status: formState.kvIndo >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Sinonim & Antonim', 'Analogi Kata', 'Pemahaman Wacana']
            },
            {
              id: 'KV-eng',
              codePart: 'KV-ENG',
              name: 'Verbal Bahasa Inggris',
              totalQuestions: 12,
              correctCount: Math.round(12 * (formState.kvInggris / 100)),
              wrongCount: 12 - Math.round(12 * (formState.kvInggris / 100)),
              accuracy: formState.kvInggris,
              score: formState.kvInggris,
              status: formState.kvInggris >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Vocabulary in Context', 'Grammar & Structure', 'Reading Comprehension']
            }
          ]
        },
        {
          code: 'PM',
          name: 'Penalaran Matematika',
          score: pmAvg,
          maxScore: 100,
          correctCount: Math.round(20 * (pmAvg / 100)),
          totalQuestions: 20,
          accuracy: pmAvg,
          status: pmAvg >= 85 ? 'Tinggi' : 'Sedang',
          color: '#10b981',
          sections: [
            {
              id: 'PM-ind',
              codePart: 'PM-IND',
              name: 'Literasi Wacana Bahasa Indonesia',
              totalQuestions: 11,
              correctCount: Math.round(11 * (formState.pmIndo / 100)),
              wrongCount: 11 - Math.round(11 * (formState.pmIndo / 100)),
              accuracy: formState.pmIndo,
              score: formState.pmIndo,
              status: formState.pmIndo >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Ide Pokok & Kalimat Utama', 'Simpulan Teks', 'Analisis Fakta/Opini']
            },
            {
              id: 'PM-eng',
              codePart: 'PM-ENG',
              name: 'Literasi Teks Bahasa Inggris',
              totalQuestions: 9,
              correctCount: Math.round(9 * (formState.pmInggris / 100)),
              wrongCount: 9 - Math.round(9 * (formState.pmInggris / 100)),
              accuracy: formState.pmInggris,
              score: formState.pmInggris,
              status: formState.pmInggris >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Main Idea & Inference', 'Contextual Meaning', 'Detail Questions']
            }
          ]
        },
        {
          code: 'KA',
          name: 'Kemampuan Akademik',
          score: kaAvg,
          maxScore: 100,
          correctCount: Math.round(30 * (kaAvg / 100)),
          totalQuestions: 30,
          accuracy: kaAvg,
          status: kaAvg >= 85 ? 'Tinggi' : 'Sedang',
          color: '#8b5cf6',
          sections: [
            {
              id: 'KA-ipa',
              codePart: 'KA-IPA',
              name: 'Akademik IPA Terpadu (Saintek)',
              totalQuestions: 16,
              correctCount: Math.round(16 * (formState.kaIpa / 100)),
              wrongCount: 16 - Math.round(16 * (formState.kaIpa / 100)),
              accuracy: formState.kaIpa,
              score: formState.kaIpa,
              status: formState.kaIpa >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Mekanika & Pengukuran', 'Zat & Energi', 'Sistem Kehidupan']
            },
            {
              id: 'KA-ips',
              codePart: 'KA-IPS',
              name: 'Akademik IPS Terpadu (Soshum)',
              totalQuestions: 14,
              correctCount: Math.round(14 * (formState.kaIps / 100)),
              wrongCount: 14 - Math.round(14 * (formState.kaIps / 100)),
              accuracy: formState.kaIps,
              score: formState.kaIps,
              status: formState.kaIps >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Keruangan & Lingkungan', 'Interaksi Sosial', 'Ekonomi & Kesejahteraan']
            }
          ]
        },
        {
          code: 'SK',
          name: 'Survei Karakter',
          score: formState.nilaiSK,
          maxScore: 100,
          correctCount: Math.round(20 * (formState.nilaiSK / 100)),
          totalQuestions: 20,
          accuracy: formState.nilaiSK,
          status: formState.nilaiSK >= 85 ? 'Tinggi' : 'Sedang',
          color: '#ec4899'
        }
      ],
      recommendationNotes: `Skor ${totalScore} menunjukkan kesiapan prima untuk seleksi masuk ${formState.targetCampusName}.`,
      strengths: ['Verbal & Penalaran Analitis', 'Survei Integritas Karakter'],
      weaknesses: ['Perdalam rumus fisika & aljabar kompleks']
    };

    const updated = tryoutResults.map(r => r.id === formState.id ? updatedItem : r);
    saveStoredTryoutResults(updated);
    if (onUpdateResults) onUpdateResults(updated);
    if (onShowToast) onShowToast(`Data tryout siswa ${formState.studentName} berhasil diperbarui!`, 'success');
    setIsEditModalOpen(false);
  };

  const handleSaveAdd = () => {
    const kvAvg = +(((formState.kvIndo + formState.kvInggris) / 2).toFixed(1));
    const pmAvg = +(((formState.pmIndo + formState.pmInggris) / 2).toFixed(1));
    const kaAvg = +(((formState.kaIpa + formState.kaIps) / 2).toFixed(1));
    const totalScore = +(((formState.nilaiPK + kvAvg + pmAvg + kaAvg + formState.nilaiSK) / 5).toFixed(1));

    const newId = `str-user-${Date.now()}`;
    const newEntry: StudentTryoutResult = {
      id: newId,
      tryoutId: formState.tryoutId,
      tryoutTitle: formState.tryoutTitle,
      level: formState.level,
      studentId: formState.studentId,
      studentName: formState.studentName,
      studentNis: formState.studentNis,
      studentClass: formState.studentClass,
      targetCampusId: formState.targetCampusId,
      targetCampusName: formState.targetCampusName,
      totalScore: totalScore,
      rank: Math.max(1, Math.round((100 - totalScore) * 1.5 + 2)),
      totalParticipants: 350,
      percentile: +(100 - (Math.max(1, Math.round((100 - totalScore) * 1.5 + 2)) / 350) * 100).toFixed(1),
      durationMinutes: formState.durationMinutes,
      submittedAt: formState.submittedAt,
      subtestScores: [
        {
          code: 'PK',
          name: 'Pengetahuan Kuantitatif',
          score: formState.nilaiPK,
          maxScore: 100,
          correctCount: Math.round(25 * (formState.nilaiPK / 100)),
          totalQuestions: 25,
          accuracy: formState.nilaiPK,
          status: formState.nilaiPK >= 85 ? 'Tinggi' : 'Sedang',
          color: '#f59e0b'
        },
        {
          code: 'KV',
          name: 'Kemampuan Verbal',
          score: kvAvg,
          maxScore: 100,
          correctCount: Math.round(25 * (kvAvg / 100)),
          totalQuestions: 25,
          accuracy: kvAvg,
          status: kvAvg >= 85 ? 'Tinggi' : 'Sedang',
          color: '#3b82f6',
          sections: [
            {
              id: 'KV-ind',
              codePart: 'KV-IND',
              name: 'Verbal Bahasa Indonesia',
              totalQuestions: 13,
              correctCount: Math.round(13 * (formState.kvIndo / 100)),
              wrongCount: 13 - Math.round(13 * (formState.kvIndo / 100)),
              accuracy: formState.kvIndo,
              score: formState.kvIndo,
              status: formState.kvIndo >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Sinonim & Antonim', 'Analogi Kata', 'Pemahaman Wacana']
            },
            {
              id: 'KV-eng',
              codePart: 'KV-ENG',
              name: 'Verbal Bahasa Inggris',
              totalQuestions: 12,
              correctCount: Math.round(12 * (formState.kvInggris / 100)),
              wrongCount: 12 - Math.round(12 * (formState.kvInggris / 100)),
              accuracy: formState.kvInggris,
              score: formState.kvInggris,
              status: formState.kvInggris >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Vocabulary in Context', 'Grammar & Structure', 'Reading Comprehension']
            }
          ]
        },
        {
          code: 'PM',
          name: 'Penalaran Matematika',
          score: pmAvg,
          maxScore: 100,
          correctCount: Math.round(20 * (pmAvg / 100)),
          totalQuestions: 20,
          accuracy: pmAvg,
          status: pmAvg >= 85 ? 'Tinggi' : 'Sedang',
          color: '#10b981',
          sections: [
            {
              id: 'PM-ind',
              codePart: 'PM-IND',
              name: 'Literasi Wacana Bahasa Indonesia',
              totalQuestions: 11,
              correctCount: Math.round(11 * (formState.pmIndo / 100)),
              wrongCount: 11 - Math.round(11 * (formState.pmIndo / 100)),
              accuracy: formState.pmIndo,
              score: formState.pmIndo,
              status: formState.pmIndo >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Ide Pokok & Kalimat Utama', 'Simpulan Teks', 'Analisis Fakta/Opini']
            },
            {
              id: 'PM-eng',
              codePart: 'PM-ENG',
              name: 'Literasi Teks Bahasa Inggris',
              totalQuestions: 9,
              correctCount: Math.round(9 * (formState.pmInggris / 100)),
              wrongCount: 9 - Math.round(9 * (formState.pmInggris / 100)),
              accuracy: formState.pmInggris,
              score: formState.pmInggris,
              status: formState.pmInggris >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Main Idea & Inference', 'Contextual Meaning', 'Detail Questions']
            }
          ]
        },
        {
          code: 'KA',
          name: 'Kemampuan Akademik',
          score: kaAvg,
          maxScore: 100,
          correctCount: Math.round(30 * (kaAvg / 100)),
          totalQuestions: 30,
          accuracy: kaAvg,
          status: kaAvg >= 85 ? 'Tinggi' : 'Sedang',
          color: '#8b5cf6',
          sections: [
            {
              id: 'KA-ipa',
              codePart: 'KA-IPA',
              name: 'Akademik IPA Terpadu (Saintek)',
              totalQuestions: 16,
              correctCount: Math.round(16 * (formState.kaIpa / 100)),
              wrongCount: 16 - Math.round(16 * (formState.kaIpa / 100)),
              accuracy: formState.kaIpa,
              score: formState.kaIpa,
              status: formState.kaIpa >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Mekanika & Pengukuran', 'Zat & Energi', 'Sistem Kehidupan']
            },
            {
              id: 'KA-ips',
              codePart: 'KA-IPS',
              name: 'Akademik IPS Terpadu (Soshum)',
              totalQuestions: 14,
              correctCount: Math.round(14 * (formState.kaIps / 100)),
              wrongCount: 14 - Math.round(14 * (formState.kaIps / 100)),
              accuracy: formState.kaIps,
              score: formState.kaIps,
              status: formState.kaIps >= 85 ? 'Sangat Tinggi' : 'Tinggi',
              topics: ['Keruangan & Lingkungan', 'Interaksi Sosial', 'Ekonomi & Kesejahteraan']
            }
          ]
        },
        {
          code: 'SK',
          name: 'Survei Karakter',
          score: formState.nilaiSK,
          maxScore: 100,
          correctCount: Math.round(20 * (formState.nilaiSK / 100)),
          totalQuestions: 20,
          accuracy: formState.nilaiSK,
          status: formState.nilaiSK >= 85 ? 'Tinggi' : 'Sedang',
          color: '#ec4899'
        }
      ],
      recommendationNotes: `Data tryout baru berhasil disimpan untuk ${formState.studentName}.`,
      strengths: ['Verbal & Kuantitatif'],
      weaknesses: ['Perlu konsistensi latihan soal']
    };

    const updated = [newEntry, ...tryoutResults];
    saveStoredTryoutResults(updated);
    if (onUpdateResults) onUpdateResults(updated);
    if (onShowToast) onShowToast(`Data tryout baru untuk ${formState.studentName} berhasil ditambahkan!`, 'success');
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedRowForAction) return;
    const updated = tryoutResults.filter(r => r.id !== selectedRowForAction.id);
    saveStoredTryoutResults(updated);
    if (onUpdateResults) onUpdateResults(updated);
    if (onShowToast) onShowToast(`Data tryout berhasil dihapus dari sistem.`, 'info');
    setIsDeleteModalOpen(false);
    setSelectedRowForAction(null);
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = [
      'Nama Tryout',
      'Tanggal TO',
      'Nama Siswa',
      'NIS',
      'Jenjang',
      'Target Kampus',
      'Passing Grade',
      'Nilai PK',
      'KV Verbal B.Indo',
      'KV Verbal B.Inggris',
      'KV Total Rata-rata',
      'PM Literasi B.Indo',
      'PM Literasi B.Inggris',
      'PM Total Rata-rata',
      'KA IPA Terpadu',
      'KA IPS Terpadu',
      'KA Total Rata-rata',
      'Nilai SK',
      'SKOR AKHIR',
      'Status Lulus',
      'Selisih PG'
    ];

    const rows = filteredRows.map(r => [
      `"${r.tryoutTitle.replace(/"/g, '""')}"`,
      `"${r.submittedAt}"`,
      `"${r.studentName}"`,
      `"${r.studentNis}"`,
      `"${r.level}"`,
      `"${r.targetCampusName}"`,
      r.targetPassingGrade,
      r.nilaiPK,
      r.kvIndo,
      r.kvInggris,
      r.kvTotalAvg,
      r.pmIndo,
      r.pmInggris,
      r.pmTotalAvg,
      r.kaIpa,
      r.kaIps,
      r.kaTotalAvg,
      r.nilaiSK,
      r.skorAkhir,
      `"${r.statusLulusLabel}"`,
      r.selisihPg
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tabel_Analisis_Hasil_Tryout_Labschool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 text-slate-100 shadow-xl ${className}`}>
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Tabel Analisis Hasil Tryout Labschool
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Format Standar PSB
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rekapitulasi komprehensif 5 subtes utama beserta sub-bagian (Verbal Indo/Ing, Literasi Membaca, IPA/IPS, Kuantitatif, Skolastik & Status Kelulusan).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95"
              title="Tambah Input Nilai Tryout Siswa"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Nilai Tryout
            </button>
          )}

          {onOpenPrintModal && (
            <button
              onClick={() => onOpenPrintModal('TRYOUT_TABLE')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
              title="Cetak Tabel Analisis Hasil Tryout (Format Rapor PSB)"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Tabel Analisis
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Integrated Sync & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Tersinkronisasi Otomatis ({filteredRows.length} Sesi Tryout)</span>
          </span>
          {filterStudent !== 'ALL' && (
            <span className="text-slate-400 hidden sm:inline">
              Data pengerjaan terintegrasi dengan filter utama
            </span>
          )}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tryout / tanggal / kampus..."
            className="w-full text-xs bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Aggregate Metrics Bar (Compact & Tidy Layout) */}
      {aggregates && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5">
            <div className="text-[10.5px] text-slate-400 font-medium">Total Tryout Selesai</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 flex items-baseline gap-1">
              {aggregates.count} <span className="text-[11px] font-normal text-slate-400">Sesi Evaluasi</span>
            </div>
            <div className="text-[9.5px] text-blue-400 mt-0.5">Rentang Seri 1 s/d Seri 5</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5">
            <div className="text-[10.5px] text-slate-400 font-medium">Rata-rata Skor Akhir</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 flex items-baseline gap-1">
              <span>{aggregates.avgSkorAkhir}</span>
              <span className="text-[11px] font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-[9.5px] text-emerald-400/80 mt-0.5">Tertinggi: {aggregates.maxSkorAkhir}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5">
            <div className="text-[10.5px] text-slate-400 font-medium">Tingkat Kelulusan PG</div>
            <div className="text-base sm:text-lg font-black text-blue-400 mt-0.5 flex items-baseline gap-1">
              {aggregates.lulusPercentage}% <span className="text-[11px] font-normal text-slate-400">({aggregates.lulusCount}/{aggregates.count})</span>
            </div>
            <div className="text-[9.5px] text-blue-300/80 mt-0.5">Terhadap Target Kampus</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5">
            <div className="text-[10.5px] text-slate-400 font-medium">Subtes Unggulan</div>
            <div className="text-sm sm:text-base font-black text-purple-300 mt-0.5 truncate">
              {aggregates.avgPK >= aggregates.avgKvTotal ? 'PK Kuantitatif' : 'KV Verbal'} ({Math.max(aggregates.avgPK, aggregates.avgKvTotal)})
            </div>
            <div className="text-[9.5px] text-purple-400/80 mt-0.5">Akurasi Konsisten Tinggi</div>
          </div>
        </div>
      )}

      {/* 14-Column Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/80 mt-2">
        <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
          {/* Grouped 2-Tier Header */}
          <thead>
            <tr className="bg-slate-800/95 text-slate-200 font-semibold border-b border-slate-700">
              {/* Nama Tryout & Tgl TO */}
              <th 
                rowSpan={2} 
                className="p-3 border-r border-slate-700/80 w-[240px] cursor-pointer hover:bg-slate-750 transition"
                onClick={() => handleSort('tryoutTitle')}
              >
                <div className="flex items-center justify-between">
                  <span>Nama Tryout & Tgl TO</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Nilai PK */}
              <th 
                rowSpan={2} 
                className="p-3 border-r border-slate-700/80 text-center w-[85px] cursor-pointer hover:bg-slate-750 transition bg-amber-500/10 text-amber-300"
                onClick={() => handleSort('nilaiPK')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Nilai PK</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                </div>
              </th>

              {/* KV */}
              <th colSpan={3} className="p-2.5 border-r border-slate-700/80 text-center bg-blue-500/15 text-blue-300">
                <span className="font-bold tracking-wide">Nilai KV (Kemampuan Verbal)</span>
              </th>

              {/* PM */}
              <th colSpan={3} className="p-2.5 border-r border-slate-700/80 text-center bg-emerald-500/15 text-emerald-300">
                <span className="font-bold tracking-wide">Nilai PM (Pemahaman Membaca)</span>
              </th>

              {/* KA */}
              <th colSpan={3} className="p-2.5 border-r border-slate-700/80 text-center bg-purple-500/15 text-purple-300">
                <span className="font-bold tracking-wide">Nilai KA (Kemampuan Akademik)</span>
              </th>

              {/* Nilai SK */}
              <th 
                rowSpan={2} 
                className="p-3 border-r border-slate-700/80 text-center w-[85px] cursor-pointer hover:bg-slate-750 transition bg-pink-500/10 text-pink-300"
                onClick={() => handleSort('nilaiSK')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Nilai SK</span>
                  <ArrowUpDown className="w-3 h-3 text-pink-400" />
                </div>
              </th>

              {/* SKOR AKHIR */}
              <th 
                rowSpan={2} 
                className="p-3 border-r border-slate-700/80 text-center w-[95px] cursor-pointer hover:bg-slate-750 transition bg-emerald-500/20 text-emerald-200 font-bold"
                onClick={() => handleSort('skorAkhir')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>SKOR AKHIR</span>
                  <ArrowUpDown className="w-3 h-3 text-emerald-300" />
                </div>
              </th>

              {/* Status Lulus */}
              <th 
                rowSpan={2} 
                className="p-3 text-center w-[130px] cursor-pointer hover:bg-slate-750 transition bg-slate-800 text-slate-100"
                onClick={() => handleSort('isLulus')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status Lulus</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Kolom Aksi Admin */}
              {isAdmin && (
                <th 
                  rowSpan={2} 
                  className="p-3 text-center w-[120px] bg-slate-800/95 text-amber-300 font-bold border-l border-slate-700 shadow-sm"
                >
                  Aksi
                </th>
              )}
            </tr>

            {/* Sub-Headers for KV, PM, KA */}
            <tr className="bg-slate-800/80 text-[11px] text-slate-300 border-b border-slate-700">
              {/* KV Sub-parts */}
              <th className="p-2 border-r border-slate-700/60 text-center bg-blue-900/30 text-blue-200 w-[75px]" title="Sub-bagian Verbal Bahasa Indonesia">
                V. B.Indo
              </th>
              <th className="p-2 border-r border-slate-700/60 text-center bg-blue-900/30 text-blue-200 w-[75px]" title="Sub-bagian Verbal Bahasa Inggris">
                V. B.Ing
              </th>
              <th className="p-2 border-r border-slate-700/80 text-center bg-blue-900/50 text-blue-100 font-semibold w-[80px]" title="Total Rata-rata KV">
                Total KV
              </th>

              {/* PM Sub-parts */}
              <th className="p-2 border-r border-slate-700/60 text-center bg-emerald-900/30 text-emerald-200 w-[75px]" title="Sub-bagian Literasi B. Indonesia">
                Lit. B.Indo
              </th>
              <th className="p-2 border-r border-slate-700/60 text-center bg-emerald-900/30 text-emerald-200 w-[75px]" title="Sub-bagian Literasi B. Inggris">
                Lit. B.Ing
              </th>
              <th className="p-2 border-r border-slate-700/80 text-center bg-emerald-900/50 text-emerald-100 font-semibold w-[80px]" title="Total Rata-rata PM">
                Total PM
              </th>

              {/* KA Sub-parts */}
              <th className="p-2 border-r border-slate-700/60 text-center bg-purple-900/30 text-purple-200 w-[75px]" title="Sub-bagian IPA Terpadu (Saintek)">
                IPA Terpadu
              </th>
              <th className="p-2 border-r border-slate-700/60 text-center bg-purple-900/30 text-purple-200 w-[75px]" title="Sub-bagian IPS Terpadu (Soshum)">
                IPS Terpadu
              </th>
              <th className="p-2 border-r border-slate-700/80 text-center bg-purple-900/50 text-purple-100 font-semibold w-[80px]" title="Total Rata-rata KA">
                Total KA
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 15 : 14} className="p-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Table className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium">Tidak ada data tryout yang sesuai dengan filter pencarian.</p>
                    <button
                      onClick={() => { setFilterStudent('ALL'); setFilterLevel('ALL'); setSearchQuery(''); }}
                      className="text-xs text-blue-400 hover:underline mt-1"
                    >
                      Reset Filter
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const originalResult = tryoutResults.find(r => r.id === row.id);
                return (
                  <tr 
                    key={row.id || idx}
                    onClick={() => {
                      if (originalResult && onSelectTryout) onSelectTryout(originalResult);
                    }}
                    className={`hover:bg-slate-800/60 transition group cursor-pointer ${
                      idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-850/40'
                    }`}
                  >
                    {/* Kolom 1: Nama tryout, tgl to (Hapus Nama Siswa Sesuai Instruksi User) */}
                    <td className="p-3 border-r border-slate-800">
                      <div className="font-semibold text-slate-100 group-hover:text-blue-300 transition flex items-center gap-1.5">
                        <span className="truncate max-w-[220px]" title={row.tryoutTitle}>
                          {row.tryoutTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-400" /> {row.submittedAt}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold font-mono">
                          {row.level}
                        </span>
                        {row.targetCampusName && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[130px]" title={row.targetCampusName}>
                            • {row.targetCampusName.replace('SMA Labschool ', '').replace('SMP Labschool ', '')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Kolom 2: Nilai PK */}
                    <td className="p-3 border-r border-slate-800 text-center font-mono font-medium text-amber-300 bg-amber-500/5">
                      <div className="text-sm font-bold">{row.nilaiPK.toFixed(1)}</div>
                      <div className="text-[10px] text-amber-400/70">{row.pkCorrect}/{row.pkTotal} B</div>
                    </td>

                    {/* Kolom 3: KV Sub-bagian V.Bindo */}
                    <td className="p-2.5 border-r border-slate-800/60 text-center font-mono text-slate-300 bg-blue-500/5">
                      {row.kvIndo.toFixed(1)}
                    </td>

                    {/* Kolom 4: KV Sub-bagian V.Bing */}
                    <td className="p-2.5 border-r border-slate-800/60 text-center font-mono text-slate-300 bg-blue-500/5">
                      {row.kvInggris.toFixed(1)}
                    </td>

                    {/* Kolom 5: KV Total Rata-rata */}
                    <td className="p-2.5 border-r border-slate-800 text-center font-mono font-bold text-blue-300 bg-blue-500/10">
                      {row.kvTotalAvg.toFixed(1)}
                    </td>

                    {/* Kolom 6: PM Sub-bagian B.Indo */}
                    <td className="p-2.5 border-r border-slate-800/60 text-center font-mono text-slate-300 bg-emerald-500/5">
                      {row.pmIndo.toFixed(1)}
                    </td>

                    {/* Kolom 7: PM Sub-bagian B.Ing */}
                    <td className="p-2.5 border-r border-slate-800/60 text-center font-mono text-slate-300 bg-emerald-500/5">
                      {row.pmInggris.toFixed(1)}
                    </td>

                    {/* Kolom 8: PM Total Rata-rata */}
                    <td className="p-2.5 border-r border-slate-800 text-center font-mono font-bold text-emerald-300 bg-emerald-500/10">
                      {row.pmTotalAvg.toFixed(1)}
                    </td>

                    {/* Kolom 9: KA Sub-bagian IPA */}
                    <td className="p-2.5 border-r border-slate-800/60 text-center font-mono text-slate-300 bg-purple-500/5">
                      {row.kaIpa.toFixed(1)}
                    </td>

                    {/* Kolom 10: KA Sub-bagian IPS */}
                    <td className="p-2.5 border-r border-slate-800/60 text-center font-mono text-slate-300 bg-purple-500/5">
                      {row.kaIps.toFixed(1)}
                    </td>

                    {/* Kolom 11: KA Total Rata-rata */}
                    <td className="p-2.5 border-r border-slate-800 text-center font-mono font-bold text-purple-300 bg-purple-500/10">
                      {row.kaTotalAvg.toFixed(1)}
                    </td>

                    {/* Kolom 12: Nilai SK */}
                    <td className="p-3 border-r border-slate-800 text-center font-mono font-medium text-pink-300 bg-pink-500/5">
                      <div className="text-sm font-bold">{row.nilaiSK.toFixed(1)}</div>
                      <div className="text-[10px] text-pink-400/70">{row.skCorrect}/{row.skTotal} B</div>
                    </td>

                    {/* Kolom 13: SKOR AKHIR */}
                    <td className="p-3 border-r border-slate-800 text-center font-mono bg-emerald-500/15">
                      <div className="text-base font-extrabold text-white tracking-tight">
                        {row.skorAkhir.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Rank #{row.rank} / {row.totalParticipants}
                      </div>
                    </td>

                    {/* Kolom 14: Status Lulus / Tidak */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {row.isLulus ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            LULUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            TIDAK LULUS
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400" title={`Passing Grade: ${row.targetPassingGrade}`}>
                          {row.selisihPg >= 0 ? `+${row.selisihPg}` : row.selisihPg} vs PG ({row.targetPassingGrade})
                        </span>
                      </div>
                    </td>

                    {/* Kolom Aksi Admin */}
                    {isAdmin && (
                      <td 
                        className="p-2 border-l border-slate-800 text-center bg-slate-900/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (originalResult && onSelectTryout) onSelectTryout(originalResult);
                            }}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 transition cursor-pointer"
                            title="Lihat Diagnostik"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(row, originalResult)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition cursor-pointer"
                            title="Edit Nilai Tryout Siswa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(row)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                            title="Hapus Data Tryout"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer (Akumulatif) */}
          {aggregates && (
            <tfoot>
              <tr className="bg-slate-800/90 font-semibold text-slate-100 border-t-2 border-slate-700">
                <td className="p-3 border-r border-slate-700">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    RATA-RATA AKUMULATIF ({aggregates.count} TO)
                  </div>
                  <div className="text-[10px] text-slate-400">Rekap rata-rata per sub-bagian</div>
                </td>

                {/* Kolom 2 Avg PK */}
                <td className="p-3 border-r border-slate-700 text-center font-mono font-bold text-amber-300 bg-amber-500/10">
                  {aggregates.avgPK}
                </td>

                {/* KV Sub Avgs */}
                <td className="p-2.5 border-r border-slate-700/60 text-center font-mono text-slate-300">
                  {aggregates.avgKvIndo}
                </td>
                <td className="p-2.5 border-r border-slate-700/60 text-center font-mono text-slate-300">
                  {aggregates.avgKvInggris}
                </td>
                <td className="p-2.5 border-r border-slate-700 text-center font-mono font-bold text-blue-300 bg-blue-500/20">
                  {aggregates.avgKvTotal}
                </td>

                {/* PM Sub Avgs */}
                <td className="p-2.5 border-r border-slate-700/60 text-center font-mono text-slate-300">
                  {aggregates.avgPmIndo}
                </td>
                <td className="p-2.5 border-r border-slate-700/60 text-center font-mono text-slate-300">
                  {aggregates.avgPmInggris}
                </td>
                <td className="p-2.5 border-r border-slate-700 text-center font-mono font-bold text-emerald-300 bg-emerald-500/20">
                  {aggregates.avgPmTotal}
                </td>

                {/* KA Sub Avgs */}
                <td className="p-2.5 border-r border-slate-700/60 text-center font-mono text-slate-300">
                  {aggregates.avgKaIpa}
                </td>
                <td className="p-2.5 border-r border-slate-700/60 text-center font-mono text-slate-300">
                  {aggregates.avgKaIps}
                </td>
                <td className="p-2.5 border-r border-slate-700 text-center font-mono font-bold text-purple-300 bg-purple-500/20">
                  {aggregates.avgKaTotal}
                </td>

                {/* SK Avg */}
                <td className="p-3 border-r border-slate-700 text-center font-mono font-bold text-pink-300 bg-pink-500/10">
                  {aggregates.avgSK}
                </td>

                {/* SKOR AKHIR Avg */}
                <td className="p-3 border-r border-slate-700 text-center font-mono font-extrabold text-emerald-300 bg-emerald-500/25 text-sm">
                  {aggregates.avgSkorAkhir}
                </td>

                {/* Status Lulus Summary */}
                <td className="p-3 text-center">
                  <div className="font-bold text-xs text-emerald-400">
                    {aggregates.lulusCount}/{aggregates.count} LULUS
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ({aggregates.lulusPercentage}% Sukses)
                  </div>
                </td>

                {/* Footer Admin Action Column */}
                {isAdmin && (
                  <td className="p-3 border-l border-slate-700 text-center font-mono text-[11px] text-slate-400 font-bold">
                    {aggregates.count} Data
                  </td>
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Legend & Guide Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> PK: Pengetahuan Kuantitatif
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> KV: Kemampuan Verbal (B.Indo & B.Ing)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> PM: Pemahaman Membaca (B.Indo & B.Ing)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> KA: Kemampuan Akademik (IPA & IPS)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span> SK: Survei Karakter
          </span>
        </div>
        <div className="text-slate-500 italic">
          * Klik pada baris tryout untuk melihat rincian diagnostik topik materi & cetak rapor resmi.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT NILAI TRYOUT SISWA (PANEL ADMIN)                            */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Data Hasil Tryout Siswa</h3>
                  <p className="text-xs text-slate-400">Perbarui nilai subtes dan detail evaluasi siswa</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: Student info & Tryout selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nama Siswa</label>
                  <input
                    type="text"
                    value={formState.studentName}
                    onChange={(e) => setFormState(prev => ({ ...prev, studentName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">NIS & Jenjang</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formState.studentNis}
                      onChange={(e) => setFormState(prev => ({ ...prev, studentNis: e.target.value }))}
                      className="w-2/3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={formState.level}
                      onChange={(e) => setFormState(prev => ({ ...prev, level: e.target.value as 'SMP' | 'SMA' }))}
                      className="w-1/3 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none font-semibold"
                    >
                      <option value="SMA">SMA</option>
                      <option value="SMP">SMP</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Paket Tryout</label>
                  <select
                    value={formState.tryoutId}
                    onChange={(e) => {
                      const selected = DEFAULT_LAB_TRYOUTS.find(t => t.id === e.target.value);
                      if (selected) {
                        setFormState(prev => ({
                          ...prev,
                          tryoutId: selected.id,
                          tryoutTitle: selected.title,
                          level: selected.level
                        }));
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none font-semibold cursor-pointer"
                  >
                    {DEFAULT_LAB_TRYOUTS.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.level}] {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pilihan Target Kampus</label>
                  <select
                    value={formState.targetCampusId}
                    onChange={(e) => {
                      const found = campuses.find(c => c.id === e.target.value);
                      setFormState(prev => ({
                        ...prev,
                        targetCampusId: e.target.value,
                        targetCampusName: found?.name || 'Labschool Rawamangun'
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {campuses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (PG: {formState.level === 'SMP' ? c.passingGradeSmp : c.passingGradeSma})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="text"
                    value={formState.submittedAt}
                    onChange={(e) => setFormState(prev => ({ ...prev, submittedAt: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                    placeholder="2026-02-01 14:00"
                  />
                </div>
              </div>

              {/* Subtest Score Inputs */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Input Nilai Subtes (Skala 0 - 100)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PK */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <label className="block text-amber-300 font-bold mb-1">Nilai PK (Pengetahuan Kuantitatif)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formState.nilaiPK}
                      onChange={(e) => setFormState(prev => ({ ...prev, nilaiPK: Number(e.target.value) || 0 }))}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1 text-white font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>

                  {/* SK */}
                  <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <label className="block text-pink-300 font-bold mb-1">Nilai SK (Survei Karakter)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formState.nilaiSK}
                      onChange={(e) => setFormState(prev => ({ ...prev, nilaiSK: Number(e.target.value) || 0 }))}
                      className="w-full bg-slate-900 border border-pink-500/40 rounded-lg px-3 py-1 text-white font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>

                  {/* KV Verbal */}
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-300 font-bold">KV (Kemampuan Verbal)</span>
                      <span className="text-blue-300 text-[11px] font-mono font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                        Rata-rata: {(((formState.kvIndo + formState.kvInggris) / 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">V. Bahasa Indonesia</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kvIndo}
                          onChange={(e) => setFormState(prev => ({ ...prev, kvIndo: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-blue-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">V. Bahasa Inggris</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kvInggris}
                          onChange={(e) => setFormState(prev => ({ ...prev, kvInggris: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-blue-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PM Literasi */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-300 font-bold">PM (Pemahaman Membaca)</span>
                      <span className="text-emerald-300 text-[11px] font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                        Rata-rata: {(((formState.pmIndo + formState.pmInggris) / 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Lit. Bahasa Indonesia</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.pmIndo}
                          onChange={(e) => setFormState(prev => ({ ...prev, pmIndo: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Lit. Bahasa Inggris</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.pmInggris}
                          onChange={(e) => setFormState(prev => ({ ...prev, pmInggris: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KA Akademik */}
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-purple-300 font-bold">KA (Kemampuan Akademik)</span>
                      <span className="text-purple-300 text-[11px] font-mono font-bold bg-purple-500/20 px-2 py-0.5 rounded">
                        Rata-rata: {(((formState.kaIpa + formState.kaIps) / 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">IPA Terpadu (Sains)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kaIpa}
                          onChange={(e) => setFormState(prev => ({ ...prev, kaIpa: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">IPS Terpadu (Sosial)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kaIps}
                          onChange={(e) => setFormState(prev => ({ ...prev, kaIps: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              {(() => {
                const kvAvg = +(((formState.kvIndo + formState.kvInggris) / 2).toFixed(1));
                const pmAvg = +(((formState.pmIndo + formState.pmInggris) / 2).toFixed(1));
                const kaAvg = +(((formState.kaIpa + formState.kaIps) / 2).toFixed(1));
                const totalScore = +(((formState.nilaiPK + kvAvg + pmAvg + kaAvg + formState.nilaiSK) / 5).toFixed(1));
                const currentCampus = campuses.find(c => c.id === formState.targetCampusId);
                const pg = currentCampus ? (formState.level === 'SMP' ? currentCampus.passingGradeSmp : currentCampus.passingGradeSma) : 85.0;
                const isLulus = totalScore >= pg;
                const selisih = +(totalScore - pg).toFixed(1);

                return (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-750 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Hasil Kalkulasi Skor Akhir:</div>
                      <div className="text-xl font-black text-emerald-400 font-mono">
                        {totalScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Target PG {formState.targetCampusName}: <strong className="text-white">{pg}</strong></div>
                      <div className="mt-1">
                        {isLulus ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            LULUS (+{selisih})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            TIDAK LULUS ({selisih})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH DATA NILAI TRYOUT SISWA (PANEL ADMIN)                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tambah Data Hasil Tryout Baru</h3>
                  <p className="text-xs text-slate-400">Input nilai dan riwayat tryout siswa untuk pemetaan kelulusan</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pilih Siswa Terdaftar</label>
                  <select
                    value={formState.studentId}
                    onChange={(e) => {
                      const selected = DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.find(s => s.id === e.target.value);
                      if (selected) {
                        setFormState(prev => ({
                          ...prev,
                          studentId: selected.id,
                          studentName: selected.name,
                          studentNis: selected.nis,
                          studentClass: selected.className,
                          level: selected.level,
                          targetCampusId: selected.targetCampusId || prev.targetCampusId,
                          targetCampusName: selected.targetCampusName || prev.targetCampusName
                        }));
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none font-semibold cursor-pointer"
                  >
                    {DEFAULT_LABSCHOOL_ACTIVE_STUDENTS.map(s => (
                      <option key={s.id} value={s.id}>
                        [{s.level}] {s.name} ({s.nis})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nama Siswa / Custom</label>
                  <input
                    type="text"
                    value={formState.studentName}
                    onChange={(e) => setFormState(prev => ({ ...prev, studentName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Pilih Paket Seri Tryout</label>
                  <select
                    value={formState.tryoutId}
                    onChange={(e) => {
                      const selected = DEFAULT_LAB_TRYOUTS.find(t => t.id === e.target.value);
                      if (selected) {
                        setFormState(prev => ({
                          ...prev,
                          tryoutId: selected.id,
                          tryoutTitle: selected.title,
                          level: selected.level
                        }));
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none font-semibold cursor-pointer"
                  >
                    {DEFAULT_LAB_TRYOUTS.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.level}] {t.title} - {t.date}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pilihan Target Kampus</label>
                  <select
                    value={formState.targetCampusId}
                    onChange={(e) => {
                      const found = campuses.find(c => c.id === e.target.value);
                      setFormState(prev => ({
                        ...prev,
                        targetCampusId: e.target.value,
                        targetCampusName: found?.name || 'Labschool Rawamangun'
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {campuses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (PG: {formState.level === 'SMP' ? c.passingGradeSmp : c.passingGradeSma})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tanggal Pengerjaan</label>
                  <input
                    type="text"
                    value={formState.submittedAt}
                    onChange={(e) => setFormState(prev => ({ ...prev, submittedAt: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                    placeholder="2026-02-15 14:00"
                  />
                </div>
              </div>

              {/* Subtest Score Inputs */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Input Nilai Subtes (Skala 0 - 100)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PK */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <label className="block text-amber-300 font-bold mb-1">Nilai PK (Pengetahuan Kuantitatif)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formState.nilaiPK}
                      onChange={(e) => setFormState(prev => ({ ...prev, nilaiPK: Number(e.target.value) || 0 }))}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1 text-white font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>

                  {/* SK */}
                  <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <label className="block text-pink-300 font-bold mb-1">Nilai SK (Survei Karakter)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formState.nilaiSK}
                      onChange={(e) => setFormState(prev => ({ ...prev, nilaiSK: Number(e.target.value) || 0 }))}
                      className="w-full bg-slate-900 border border-pink-500/40 rounded-lg px-3 py-1 text-white font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>

                  {/* KV Verbal */}
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-300 font-bold">KV (Kemampuan Verbal)</span>
                      <span className="text-blue-300 text-[11px] font-mono font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                        Rata-rata: {(((formState.kvIndo + formState.kvInggris) / 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">V. Bahasa Indonesia</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kvIndo}
                          onChange={(e) => setFormState(prev => ({ ...prev, kvIndo: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-blue-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">V. Bahasa Inggris</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kvInggris}
                          onChange={(e) => setFormState(prev => ({ ...prev, kvInggris: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-blue-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PM Literasi */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-300 font-bold">PM (Pemahaman Membaca)</span>
                      <span className="text-emerald-300 text-[11px] font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                        Rata-rata: {(((formState.pmIndo + formState.pmInggris) / 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Lit. Bahasa Indonesia</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.pmIndo}
                          onChange={(e) => setFormState(prev => ({ ...prev, pmIndo: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Lit. Bahasa Inggris</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.pmInggris}
                          onChange={(e) => setFormState(prev => ({ ...prev, pmInggris: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KA Akademik */}
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-purple-300 font-bold">KA (Kemampuan Akademik)</span>
                      <span className="text-purple-300 text-[11px] font-mono font-bold bg-purple-500/20 px-2 py-0.5 rounded">
                        Rata-rata: {(((formState.kaIpa + formState.kaIps) / 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">IPA Terpadu (Sains)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kaIpa}
                          onChange={(e) => setFormState(prev => ({ ...prev, kaIpa: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">IPS Terpadu (Sosial)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formState.kaIps}
                          onChange={(e) => setFormState(prev => ({ ...prev, kaIps: Number(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-1 text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Data Tryout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KONFIRMASI HAPUS DATA TRYOUT (PANEL ADMIN)                        */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && selectedRowForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hapus Data Tryout?</h3>
                <p className="text-xs text-slate-400">Tindakan ini akan menghapus data pengerjaan dari sistem</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 my-3 text-xs space-y-1.5">
              <div className="text-slate-300">
                <strong className="text-white">Siswa:</strong> {selectedRowForAction.studentName} ({selectedRowForAction.studentNis})
              </div>
              <div className="text-slate-300">
                <strong className="text-white">Paket:</strong> {selectedRowForAction.tryoutTitle}
              </div>
              <div className="text-slate-300">
                <strong className="text-white">Skor Akhir:</strong> {selectedRowForAction.skorAkhir} ({selectedRowForAction.statusLulusLabel})
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
