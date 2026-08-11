import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../../types';
import { getUserLabschoolLevel, isStudentLevelLocked } from '../../utils/labschoolHelpers';
import {
  Printer,
  X,
  FileCheck2,
  Calendar,
  Award,
  Sparkles,
  Layers,
  Copy,
  Check,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  SlidersHorizontal,
  FileText,
  Clock,
  Download,
  Loader2,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileCode,
  Table,
  Target,
  ChevronRight,
  Calculator,
  Languages,
  Atom,
  Globe2,
  CheckCircle2,
  Compass
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

import {
  SyllabusTimelineTopic,
  SubtestOption,
  LABSCHOOL_SUBTEST_OPTIONS,
  loadStoredSyllabusTimelineTopics
} from './labschoolSyllabusTimelineData';
import { DEFAULT_LABSCHOOL_CAMPUSES, LabschoolCampusItem } from './labschoolCampusData';

export type SyllabusPrintFormat = 'LENGKAP' | 'GROUPED_SUBTEST' | 'MATRIKS' | 'ROADMAP' | 'TOPIC_DETAIL';

export interface LabschoolPrintSyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  initialLevel?: 'SMP' | 'SMA';
  initialSubtestCode?: string; // 'ALL', 'PK', 'KV', 'PM', 'AKA-IPA', 'AKA-IPS', 'SV'
  initialTopic?: SyllabusTimelineTopic | null;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LabschoolPrintSyllabusModal: React.FC<LabschoolPrintSyllabusModalProps> = ({
  isOpen,
  onClose,
  user,
  initialLevel = 'SMA',
  initialSubtestCode = 'ALL',
  initialTopic = null,
  onShowToast
}) => {
  // Determine if student level should be strictly locked
  const studentLevel = useMemo(() => getUserLabschoolLevel(user), [user]);
  const isLockedForStudent = useMemo(() => isStudentLevelLocked(user), [user]);

  const effectiveInitialLevel = useMemo<'SMP' | 'SMA'>(() => {
    if (isLockedForStudent) {
      return studentLevel === 'SMP' ? 'SMP' : 'SMA';
    }
    return initialLevel;
  }, [isLockedForStudent, studentLevel, initialLevel]);

  // 1. Controls & Configuration State
  const [level, setLevel] = useState<'SMP' | 'SMA'>(effectiveInitialLevel);
  const [selectedSubtestCode, setSelectedSubtestCode] = useState<string>(initialSubtestCode);
  const [printFormat, setPrintFormat] = useState<SyllabusPrintFormat>(
    initialTopic ? 'TOPIC_DETAIL' : 'GROUPED_SUBTEST'
  );
  const [selectedCampusId, setSelectedCampusId] = useState<string>('camp-kebayoran');
  const [selectedSingleTopicId, setSelectedSingleTopicId] = useState<string>(initialTopic ? initialTopic.id : '');

  // Section Print Selection Toggles
  const [showLetterhead, setShowLetterhead] = useState(true);
  const [showDocMetadata, setShowDocMetadata] = useState(true);
  const [showSummaryStats, setShowSummaryStats] = useState(true);
  const [showSubtestBreakdown, setShowSubtestBreakdown] = useState(true);
  const [showRoadmapPhases, setShowRoadmapPhases] = useState(true);
  const [showTopicMatrix, setShowTopicMatrix] = useState(true);
  const [showDetailedSubtopics, setShowDetailedSubtopics] = useState(true);
  const [showCompetencyGoals, setShowCompetencyGoals] = useState(true);
  const [showTeachingMethods, setShowTeachingMethods] = useState(true);
  const [showDriveReferences, setShowDriveReferences] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);

  // UI Utilities State
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [isCopiedText, setIsCopiedText] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(true);

  const documentRef = useRef<HTMLDivElement>(null);

  // Sync props on change
  useEffect(() => {
    if (isOpen) {
      const activeLvl = isLockedForStudent ? (studentLevel === 'SMP' ? 'SMP' : 'SMA') : initialLevel;
      setLevel(activeLvl);
      setSelectedSubtestCode(initialSubtestCode);
      if (initialTopic) {
        setSelectedSingleTopicId(initialTopic.id);
        setPrintFormat('TOPIC_DETAIL');
      } else {
        setPrintFormat('GROUPED_SUBTEST');
      }
    }
  }, [isOpen, initialLevel, initialSubtestCode, initialTopic, isLockedForStudent, studentLevel]);

  // Load all available syllabus topics for current level
  const allLevelTopics: SyllabusTimelineTopic[] = useMemo(() => {
    return loadStoredSyllabusTimelineTopics(level);
  }, [level]);

  // Available Subtest Filter Options for current level
  const availableSubtests: SubtestOption[] = useMemo(() => {
    return LABSCHOOL_SUBTEST_OPTIONS.filter(opt => opt.level === level);
  }, [level]);

  // Active Subtest object
  const activeSubtestObj: SubtestOption = useMemo(() => {
    return (
      availableSubtests.find(s => s.code === selectedSubtestCode) ||
      availableSubtests[0] || {
        id: 'smp-all',
        code: 'ALL',
        name: 'Semua Subtest Terpadu (Silabus Lengkap)',
        shortName: 'Semua Subtest',
        level: level,
        iconName: 'Sparkles',
        description: 'Kurikulum terpadu seleksi PSB Labschool',
        totalTopics: allLevelTopics.length,
        estimatedHours: allLevelTopics.reduce((acc, t) => acc + (t.durationMinutes || 90), 0) / 60,
        weightPercentage: 100,
        themeColor: 'from-blue-600 to-indigo-600',
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      }
    );
  }, [availableSubtests, selectedSubtestCode, level, allLevelTopics]);

  // Filter topics based on active subtest & format
  const filteredTopics: SyllabusTimelineTopic[] = useMemo(() => {
    let result = allLevelTopics;

    if (selectedSubtestCode !== 'ALL') {
      result = result.filter(
        t =>
          t.subtestCode.toUpperCase() === selectedSubtestCode.toUpperCase() ||
          t.subtestName.toLowerCase().includes(activeSubtestObj.name.toLowerCase()) ||
          t.subtestName.toLowerCase().includes(activeSubtestObj.shortName.toLowerCase())
      );
    }

    if (printFormat === 'TOPIC_DETAIL' && selectedSingleTopicId) {
      const single = allLevelTopics.find(t => t.id === selectedSingleTopicId);
      if (single) return [single];
    }

    return result;
  }, [allLevelTopics, selectedSubtestCode, activeSubtestObj, printFormat, selectedSingleTopicId]);

  // Group topics by subtest for multi-subtest comprehensive layout
  const groupedSubtestTopics = useMemo(() => {
    const groups: { [key: string]: { subtest: SubtestOption | null; topics: SyllabusTimelineTopic[] } } = {};
    
    // Group all filtered topics by their subtestCode
    filteredTopics.forEach(t => {
      const code = t.subtestCode || 'LAINNYA';
      if (!groups[code]) {
        const subMeta = availableSubtests.find(s => s.code === code) || null;
        groups[code] = {
          subtest: subMeta,
          topics: []
        };
      }
      groups[code].topics.push(t);
    });

    return Object.entries(groups).map(([code, data]) => ({
      code,
      subtest: data.subtest,
      topics: data.topics
    }));
  }, [filteredTopics, availableSubtests]);

  // Selected Target Campus
  const selectedCampus: LabschoolCampusItem = useMemo(() => {
    return (
      DEFAULT_LABSCHOOL_CAMPUSES.find(c => c.id === selectedCampusId) ||
      DEFAULT_LABSCHOOL_CAMPUSES[0]
    );
  }, [selectedCampusId]);

  // Document metadata calculations
  const totalTopicsCount = filteredTopics.length;
  const totalMinutes = filteredTopics.reduce((acc, t) => acc + (t.durationMinutes || 90), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const docDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const documentNumber = `DOC-SIL/LAB/${new Date().getFullYear()}/${level}/${selectedSubtestCode}`;

  // Quick Action: Switch to Full Syllabus All Subtests
  const handleSelectAllFullSyllabus = () => {
    setSelectedSubtestCode('ALL');
    setPrintFormat('GROUPED_SUBTEST');
    setShowLetterhead(true);
    setShowDocMetadata(true);
    setShowSummaryStats(true);
    setShowSubtestBreakdown(true);
    setShowRoadmapPhases(true);
    setShowTopicMatrix(true);
    setShowDetailedSubtopics(true);
    setShowCompetencyGoals(true);
    setShowTeachingMethods(true);
    setShowDriveReferences(true);
    setShowSignatures(true);
    if (onShowToast) {
      onShowToast(`Mode Silabus Lengkap Full (${level} Labschool - Semua Subtest) diaktifkan!`, 'success');
    }
  };

  // Print Handlers
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download via html2canvas-pro & jsPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('labschool-printable-syllabus-document');
    if (!element) return;

    setIsExportingPdf(true);
    if (onShowToast) {
      onShowToast('Sedang memproses dan mengompilasi lembar Dokumen Silabus Lengkap ke PDF...', 'info');
    }

    // Save and temporarily clear transform for perfect 1:1 capture
    const originalTransform = element.style.transform;
    element.style.transform = 'none';

    try {
      const filename = `Silabus-Kurikulum-Labschool-${level}-${selectedSubtestCode}-${new Date().toISOString().split('T')[0]}.pdf`;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: 0,
        scrollX: 0
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Gagal merender kanvas dokumen silabus.');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;
      const maxPageContentHeightMm = pageHeight - margin * 2;

      const pxPerMm = canvas.width / imgWidth;
      const pageHeightPx = Math.floor(maxPageContentHeightMm * pxPerMm);
      const totalCanvasHeight = canvas.height;

      if (totalCanvasHeight <= pageHeightPx) {
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const renderedHeightMm = totalCanvasHeight / pxPerMm;
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, renderedHeightMm);
      } else {
        let currentY = 0;
        let pageCount = 0;
        const totalEstimatedPages = Math.ceil(totalCanvasHeight / pageHeightPx);

        while (currentY < totalCanvasHeight) {
          if (pageCount > 0) {
            pdf.addPage();
          }

          const sliceHeightPx = Math.min(pageHeightPx, totalCanvasHeight - currentY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeightPx;

          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              currentY,
              canvas.width,
              sliceHeightPx,
              0,
              0,
              canvas.width,
              sliceHeightPx
            );

            const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
            const sliceHeightMm = sliceHeightPx / pxPerMm;
            pdf.addImage(sliceImgData, 'JPEG', margin, margin, imgWidth, sliceHeightMm);

            // Add clean footer on each page
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text(
              `Silabus Resmi ${level} Labschool • Halaman ${pageCount + 1} dari ${totalEstimatedPages}`,
              pageWidth / 2,
              pageHeight - 4,
              { align: 'center' }
            );
          }

          currentY += sliceHeightPx;
          pageCount++;
        }
      }

      pdf.save(filename);

      if (onShowToast) {
        onShowToast('Dokumen PDF Silabus Labschool berhasil diunduh ke perangkat!', 'success');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      if (onShowToast) {
        onShowToast('Terjadi kendala saat membuat file PDF. Gunakan tombol Cetak untuk opsi Cetak ke PDF.', 'error');
      }
    } finally {
      // Restore original zoom transform
      element.style.transform = originalTransform;
      setIsExportingPdf(false);
    }
  };

  // Download as HTML / Word (.doc) File
  const handleDownloadDoc = () => {
    setIsExportingDoc(true);
    try {
      const docElement = document.getElementById('labschool-printable-syllabus-document');
      if (!docElement) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>Silabus Kurikulum ${level} Labschool</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 20px; color: #111827; background: #ffffff; line-height: 1.5; font-size: 11pt; }
            h1, h2, h3, h4 { color: #0f172a; margin-top: 10px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 15px; font-size: 10pt; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9pt; background: #e2e8f0; }
            .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 15px; text-align: center; }
            .footer-sign { margin-top: 30px; display: table; width: 100%; }
            .sign-col { display: table-cell; width: 33%; text-align: center; vertical-align: top; }
          </style>
        </head>
        <body>
          ${docElement.innerHTML}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + htmlContent], {
        type: 'application/msword;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Silabus_Labschool_${level}_${selectedSubtestCode}_${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onShowToast) {
        onShowToast('Dokumen Silabus (.doc) berhasil diunduh ke perangkat!', 'success');
      }
    } catch (e) {
      console.error('Error downloading doc:', e);
      if (onShowToast) onShowToast('Gagal mengunduh format dokumen.', 'error');
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Download JSON Data Backup
  const handleDownloadJson = () => {
    try {
      const dataPayload = {
        institution: 'Yayasan Pembina Pendidikan Labschool',
        documentNumber: documentNumber,
        level: level,
        subtestCode: selectedSubtestCode,
        subtestName: activeSubtestObj.name,
        targetCampus: selectedCampus.name,
        generatedAt: new Date().toISOString(),
        totalTopics: filteredTopics.length,
        totalHours: totalHours,
        topics: filteredTopics
      };

      const blob = new Blob([JSON.stringify(dataPayload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Data-Silabus-Labschool-${level}-${selectedSubtestCode}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onShowToast) {
        onShowToast('Data JSON Silabus berhasil diunduh!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Plain Text / Markdown Summary
  const handleCopyText = () => {
    const textLines = [
      `*SILABUS KURIKULUM RESMI ${level} LABSCHOOL 2027*`,
      `Nomor Dokumen: ${documentNumber}`,
      `Subtest: ${activeSubtestObj.name}`,
      `Target Kampus: ${selectedCampus.name}`,
      `Total Pertemuan / Topik: ${filteredTopics.length} Topik (${totalHours} Jam Belajar)`,
      `Tanggal Terbit: ${docDateFormatted}`,
      '',
      '--- DAFTAR TOPIK DAN MATERI SILABUS ---'
    ];

    filteredTopics.forEach((t) => {
      textLines.push(
        `\n[Topik ${t.topicNumber}] ${t.title} (${t.subtestCode} - ${t.durationMinutes || 90} Menit)`
      );
      textLines.push(`• Capaian: ${t.competency}`);
      textLines.push(`• Sub-Topik: ${t.subtopics?.join(', ') || '-'}`);
      textLines.push(`• Metode: ${t.teachingMethod}`);
      if (t.driveLink) textLines.push(`• Modul: ${t.driveLink}`);
    });

    textLines.push('\n_Disusun oleh Divisi Akademik & Pengembangan Kurikulum Labschool_');

    navigator.clipboard.writeText(textLines.join('\n'));
    setIsCopiedText(true);
    if (onShowToast) onShowToast('Ringkasan Silabus disalin ke Clipboard!', 'success');
    setTimeout(() => setIsCopiedText(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="labschool-print-syllabus-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-fadeIn"
    >
      {/* 
        CRITICAL MULTI-PAGE PRINT STYLING 
        Forces the browser's print engine to un-nest and print every single page smoothly without any viewport cuts
      */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 12mm 12mm;
        }

        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #labschool-print-syllabus-modal,
          #labschool-print-syllabus-modal * {
            visibility: visible !important;
          }

          #labschool-print-syllabus-modal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            inset: auto !important;
            backdrop-filter: none !important;
            z-index: 99999 !important;
          }

          #labschool-print-modal-container,
          #labschool-print-modal-body,
          #labschool-print-canvas-area,
          #labschool-print-viewport {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            max-width: 100% !important;
            overflow: visible !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          #labschool-print-modal-header,
          #labschool-print-modal-sidebar,
          #labschool-print-modal-actions,
          .no-print {
            display: none !important;
          }

          #labschool-printable-syllabus-document {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            transform: none !important;
            overflow: visible !important;
          }

          .print-avoid-break,
          .avoid-break,
          .subtest-section-card,
          .signature-container,
          .kop-surat-header,
          .doc-meta-box,
          .summary-stats-box,
          .roadmap-box,
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          thead {
            display: table-header-group !important;
          }

          tfoot {
            display: table-footer-group !important;
          }
        }
      `}</style>

      {/* Main Modal Card Container */}
      <div
        id="labschool-print-modal-container"
        className="relative w-full max-w-7xl h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
      >
        
        {/* ========================================================================= */}
        {/* 1. MODAL TOP TOOLBAR & TITLE */}
        {/* ========================================================================= */}
        <div
          id="labschool-print-modal-header"
          className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700/80 shrink-0 flex-wrap gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Pratinjau & Cetak Silabus Labschool
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {level} LABSCHOOL
                </span>
                <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {filteredTopics.length} Topik • {totalHours} Jam Belajar
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dokumen resmi silabus pembelajaran, peta alur topik, alokasi jam, dan capaian kompetensi terpadu.
              </p>
            </div>
          </div>

          {/* Quick Global Actions & Close Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Button: CETAK SEMUA FULL */}
            <button
              type="button"
              onClick={handleSelectAllFullSyllabus}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm ${
                selectedSubtestCode === 'ALL' && printFormat === 'GROUPED_SUBTEST'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400/60 shadow-amber-500/25 ring-2 ring-amber-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
              }`}
              title="Aktifkan seluruh subtest dan seluruh topik untuk dicetak lengkap tanpa terpotong"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Cetak Semua Full</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showConfigPanel
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Pengaturan Tampilan Dokumen"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panel Opsi</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/25 disabled:opacity-50 active:scale-95"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT: SIDEBAR CONTROLS & LIVE PREVIEW CANVAS */}
        {/* ========================================================================= */}
        <div id="labschool-print-modal-body" className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* SIDEBAR: CONTROLS & DOCUMENT CUSTOMIZER */}
          {showConfigPanel && (
            <div
              id="labschool-print-modal-sidebar"
              className="w-full md:w-80 lg:w-88 shrink-0 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto p-4 space-y-4 text-xs"
            >
              {/* SECTION A: JENJANG & SUBTEST FILTER */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    Pilihan Jenjang & Kurikulum
                  </span>
                </div>

                {isLockedForStudent ? (
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    level === 'SMP'
                      ? 'bg-blue-950/70 border-blue-500/40 text-blue-200'
                      : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-200'
                  }`}>
                    <div className={`p-1.5 rounded-lg ${level === 'SMP' ? 'bg-blue-500/20 text-blue-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                      {level === 'SMP' ? <GraduationCap className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{level} Labschool</span>
                        <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                          {user?.className || `${level}-LABSCHOOL`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Silabus resmi jenjang siswa</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLevel('SMP');
                        setSelectedSubtestCode('ALL');
                      }}
                      className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                        level === 'SMP'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>SMP Labschool</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLevel('SMA');
                        setSelectedSubtestCode('ALL');
                      }}
                      className={`py-2 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                        level === 'SMA'
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>SMA Labschool</span>
                    </button>
                  </div>
                )}

                {/* Subtest Scope Dropdown */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>Cakupan Subtest Materi:</span>
                    {selectedSubtestCode === 'ALL' && (
                      <span className="text-[10px] text-amber-400 font-extrabold">Semua Topik Terpilih</span>
                    )}
                  </label>
                  <select
                    value={selectedSubtestCode}
                    onChange={(e) => {
                      setSelectedSubtestCode(e.target.value);
                      if (printFormat === 'TOPIC_DETAIL') setPrintFormat('GROUPED_SUBTEST');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
                  >
                    {availableSubtests.map((sub) => (
                      <option key={sub.id} value={sub.code}>
                        {sub.code === 'ALL' ? '★ Semua Subtest (Silabus Lengkap Full)' : `${sub.code} - ${sub.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Campus */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Kampus Sasaran Labschool:
                  </label>
                  <select
                    value={selectedCampusId}
                    onChange={(e) => setSelectedCampusId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
                  >
                    {DEFAULT_LABSCHOOL_CAMPUSES.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION B: FORMAT & TIPE DOKUMEN */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Format Dokumen Silabus
                </span>

                <div className="space-y-1.5">
                  {[
                    { id: 'GROUPED_SUBTEST', label: 'Silabus Terkelompok per Subtest', desc: 'Bagan per mata uji dengan header dan matriks terpadu' },
                    { id: 'LENGKAP', label: 'Silabus RPP Lengkap Sekuensial', desc: 'Matriks topik lengkap, capaian, alur jam & instruksi' },
                    { id: 'MATRIKS', label: 'Tabel Matriks Kompak', desc: 'Tabel ringkas fokus pada topik dan alokasi waktu' },
                    { id: 'ROADMAP', label: 'Roadmap Alur 4 Fase Belajar', desc: 'Bagan tahapan kurikulum dari dasar ke simulasi' }
                  ].map((fmt) => (
                    <label
                      key={fmt.id}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                        printFormat === fmt.id
                          ? 'bg-blue-950/50 border-blue-500/60 text-blue-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="printFormat"
                        value={fmt.id}
                        checked={printFormat === fmt.id}
                        onChange={() => setPrintFormat(fmt.id as SyllabusPrintFormat)}
                        className="mt-0.5 text-blue-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-bold text-slate-100 text-xs">{fmt.label}</div>
                        <div className="text-[10px] text-slate-400">{fmt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION C: SECTION TOGGLES (CHECKBOXES) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    Elemen yang Ditampilkan
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLetterhead(true);
                        setShowDocMetadata(true);
                        setShowSummaryStats(true);
                        setShowSubtestBreakdown(true);
                        setShowRoadmapPhases(true);
                        setShowTopicMatrix(true);
                        setShowDetailedSubtopics(true);
                        setShowCompetencyGoals(true);
                        setShowTeachingMethods(true);
                        setShowDriveReferences(true);
                        setShowSignatures(true);
                      }}
                      className="text-[10px] font-bold text-cyan-400 hover:underline"
                    >
                      Semua
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: 'Kop Surat Resmi Labschool', state: showLetterhead, set: setShowLetterhead },
                    { label: 'Informasi Dokumen & Kampus', state: showDocMetadata, set: setShowDocMetadata },
                    { label: 'Ringkasan Statistik & Jam Belajar', state: showSummaryStats, set: setShowSummaryStats },
                    { label: 'Distribusi Bobot Subtest', state: showSubtestBreakdown, set: setShowSubtestBreakdown },
                    { label: 'Bagan 4 Fase Roadmap Kurikulum', state: showRoadmapPhases, set: setShowRoadmapPhases },
                    { label: 'Tabel Matriks Topik & Silabus', state: showTopicMatrix, set: setShowTopicMatrix },
                    { label: 'Rincian Sub-Topik Pokok Bahasan', state: showDetailedSubtopics, set: setShowDetailedSubtopics },
                    { label: 'Target Capaian Kompetensi HOTS', state: showCompetencyGoals, set: setShowCompetencyGoals },
                    { label: 'Metode Pengajaran / Instruksional', state: showTeachingMethods, set: setShowTeachingMethods },
                    { label: 'Tautan Modul & Drive Referensi', state: showDriveReferences, set: setShowDriveReferences },
                    { label: 'Lembar Pengesahan & Tanda Tangan', state: showSignatures, set: setShowSignatures }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => item.set(!item.state)}
                      className="w-full flex items-center justify-between p-1.5 px-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
                    >
                      <span className="text-slate-300 text-[11px] font-medium">{item.label}</span>
                      {item.state ? (
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION D: EXPORT & DOWNLOAD ACTIONS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Opsi Unduh & Ekspor
                </span>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-between transition-all border border-slate-700 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>Unduh PDF Resmi (.pdf)</span>
                    </span>
                    {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDoc}
                    disabled={isExportingDoc}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-between transition-all border border-slate-700 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Unduh Dokumen Word (.doc)</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-between transition-all border border-slate-700 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      {isCopiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                      <span>{isCopiedText ? 'Tersalin ke Clipboard' : 'Salin Teks Silabus'}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-between transition-all border border-slate-700 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-400" />
                      <span>Unduh Data JSON (.json)</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN PREVIEW CANVAS AREA */}
          <div id="labschool-print-canvas-area" className="flex-1 bg-slate-950 flex flex-col min-h-0 overflow-hidden relative">
            
            {/* CANVAS FLOATING TOOLBAR */}
            <div
              id="labschool-print-modal-actions"
              className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap"
            >
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Pratinjau Lembar A4 Siap Cetak
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 font-semibold">
                  {filteredTopics.length} Topik • {totalHours} Jam Pembelajaran
                </span>
                {selectedSubtestCode === 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                    Cetak Full Semua Subtest
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoomScale(Math.max(50, zoomScale - 10))}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Perkecil Preview"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono font-bold text-cyan-400">
                  {zoomScale}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale(Math.min(150, zoomScale + 10))}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Perbesar Preview"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(100)}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE DOCUMENT VIEWPORT */}
            <div id="labschool-print-viewport" className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex justify-center bg-slate-950/60">
              
              {/* THE OFFICIAL PRINTABLE A4 WHITE DOCUMENT */}
              <div
                id="labschool-printable-syllabus-document"
                ref={documentRef}
                style={{
                  transform: `scale(${zoomScale / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease'
                }}
                className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl border border-slate-300 rounded-sm font-sans flex flex-col justify-between space-y-6 select-text"
              >
                <div className="space-y-6">
                  
                  {/* ========================================================================= */}
                  {/* DOKUMEN SECTION 1: KOP SURAT RESMI LABSCHOOL */}
                  {/* ========================================================================= */}
                  {showLetterhead && (
                    <div className="kop-surat-header border-b-4 border-double border-slate-900 pb-4 print-avoid-break">
                      <div className="flex items-center justify-between gap-4">
                        {/* Emblem Labschool */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 flex items-center justify-center text-white shrink-0 shadow-md">
                          <GraduationCap className="w-10 h-10 text-cyan-400" />
                        </div>

                        {/* Title Header */}
                        <div className="flex-1 text-center">
                          <h1 className="text-sm font-extrabold tracking-wider uppercase text-blue-950">
                            YAYASAN PEMBINA PENDIDIKAN LABSCHOOL
                          </h1>
                          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
                            BADAN PENGEMBANGAN KURIKULUM & PERSIAPAN SELEKSI PSB
                          </h2>
                          <p className="text-[11px] font-semibold text-slate-700">
                            SILABUS PEMBELAJARAN & RENCANA PELAKSANAAN PEMBELAJARAN (RPP) TERPADU
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Sekretariat Akademik: Jl. Pemuda Raya No. 10 Rawamangun / Jl. KH. Ahmad Dahlan Kebayoran Baru • Web: labschool.sch.id
                          </p>
                        </div>

                        {/* Accreditation Badge */}
                        <div className="w-16 h-16 rounded-2xl border-2 border-emerald-700 bg-emerald-50 flex flex-col items-center justify-center text-center p-1 shrink-0">
                          <ShieldCheck className="w-6 h-6 text-emerald-700" />
                          <span className="text-[8px] font-black text-emerald-900 uppercase leading-tight">
                            TERAKREDITASI UNGGUL
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* DOKUMEN SECTION 2: METADATA & PROFIL KURIKULUM */}
                  {/* ========================================================================= */}
                  {showDocMetadata && (
                    <div className="doc-meta-box bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3 print-avoid-break">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            DOKUMEN KURIKULUM AKADEMIK
                          </span>
                          <h3 className="text-base font-black text-slate-900">
                            Silabus Persiapan Masuk {level} Labschool (Tahun Ajaran 2026/2027)
                          </h3>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                            {documentNumber}
                          </span>
                        </div>
                      </div>

                      {/* 2-Column Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] block font-semibold">Jenjang Sasaran:</span>
                          <strong className="text-slate-900">{level} Labschool</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block font-semibold">Subtest / Mata Uji:</span>
                          <strong className="text-blue-900">{activeSubtestObj.name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block font-semibold">Kampus Target:</span>
                          <strong className="text-slate-900">{selectedCampus.name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block font-semibold">Tanggal Cetak:</span>
                          <strong className="text-slate-900">{docDateFormatted}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* DOKUMEN SECTION 3: RINGKASAN STATISTIK & ALOKASI JAM BELAJAR */}
                  {/* ========================================================================= */}
                  {showSummaryStats && (
                    <div className="summary-stats-box grid grid-cols-2 sm:grid-cols-4 gap-3 print-avoid-break">
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase text-blue-700 block">Total Pokok Bahasan</span>
                        <span className="text-xl font-black text-blue-950">{totalTopicsCount} Topik</span>
                      </div>
                      <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase text-indigo-700 block">Alokasi Waktu Belajar</span>
                        <span className="text-xl font-black text-indigo-950">{totalHours} Jam ({totalMinutes} Menit)</span>
                      </div>
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 block">Bobot Kelulusan</span>
                        <span className="text-xl font-black text-emerald-950">{activeSubtestObj.weightPercentage}% Subtest</span>
                      </div>
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase text-amber-700 block">Pendekatan Pembelajaran</span>
                        <span className="text-xs font-bold text-amber-950 block mt-1">Problem-Based & Speed Drills</span>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* DOKUMEN SECTION 4: ROADMAP 4 FASE KURIKULUM BELAJAR */}
                  {/* ========================================================================= */}
                  {showRoadmapPhases && (
                    <div className="roadmap-box border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5 print-avoid-break">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-800" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                          Roadmap Alur 4 Fase Kurikulum Persiapan PSB Labschool
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-[9px] block w-max mb-1">
                            Fase 1 (Bulan 1)
                          </span>
                          <strong className="text-slate-900 block text-[11px]">Konsep Dasar & Diagnostik</strong>
                          <p className="text-[10px] text-slate-600 mt-0.5">Pemetaan kekuatan, dasar aritmatika, analogi kata & telaah wacana.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-extrabold text-[9px] block w-max mb-1">
                            Fase 2 (Bulan 2)
                          </span>
                          <strong className="text-slate-900 block text-[11px]">Pendalaman Materi Inti</strong>
                          <p className="text-[10px] text-slate-600 mt-0.5">Penguasaan pola barisan, aljabar, penalaran deduktif & sains terpadu.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[9px] block w-max mb-1">
                            Fase 3 (Bulan 3)
                          </span>
                          <strong className="text-slate-900 block text-[11px]">Pemantapan Soal HOTS</strong>
                          <p className="text-[10px] text-slate-600 mt-0.5">Drill soal tingkat tinggi, penalaran logika analitis & kecepatan menjawab.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[9px] block w-max mb-1">
                            Fase 4 (Bulan 4)
                          </span>
                          <strong className="text-slate-900 block text-[11px]">Simulasi CBT & Tryout</strong>
                          <p className="text-[10px] text-slate-600 mt-0.5">Simulasi seleksi real-time, manajemen waktu, dan survei karakter.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* DOKUMEN SECTION 5: TABEL MATRIKS SILABUS TERSTRUKTUR */}
                  {/* ========================================================================= */}
                  {showTopicMatrix && (
                    <div className="space-y-6">
                      
                      {/* OPTION 1: GROUPED BY SUBTEST (PERFECT FOR "CETAK SEMUA FULL") */}
                      {printFormat === 'GROUPED_SUBTEST' && groupedSubtestTopics.length > 0 ? (
                        <div className="space-y-6">
                          {groupedSubtestTopics.map((group, gIdx) => {
                            const subMeta = group.subtest;
                            const groupMinutes = group.topics.reduce((acc, t) => acc + (t.durationMinutes || 90), 0);
                            const groupHours = (groupMinutes / 60).toFixed(1);

                            return (
                              <div key={group.code || gIdx} className="subtest-section-card space-y-2 border border-slate-300 rounded-xl p-3.5 bg-white print-avoid-break">
                                {/* Subtest Header Banner */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-2 gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-extrabold text-[10px] uppercase">
                                      SUBTEST {gIdx + 1}: {group.code}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-black text-slate-950 uppercase">
                                      {subMeta?.name || group.topics[0]?.subtestName || group.code}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
                                    <span>Bobot: <strong>{subMeta?.weightPercentage || 20}%</strong></span>
                                    <span>•</span>
                                    <span>{group.topics.length} Pertemuan ({groupHours} Jam)</span>
                                  </div>
                                </div>

                                {/* Subtest Matrix Table */}
                                <table className="w-full border-collapse border border-slate-400 text-[10px] text-slate-900">
                                  <thead>
                                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                                      <th className="p-2 border-r border-slate-400 text-center w-8">No</th>
                                      <th className="p-2 border-r border-slate-400 text-left w-20">Fase Belajar</th>
                                      <th className="p-2 border-r border-slate-400 text-left">Materi Pokok & Sub-Topik</th>
                                      {showCompetencyGoals && (
                                        <th className="p-2 border-r border-slate-400 text-left">Target Capaian Kompetensi (HOTS)</th>
                                      )}
                                      <th className="p-2 border-r border-slate-400 text-center w-14">Durasi</th>
                                      {showTeachingMethods && (
                                        <th className="p-2 border-r border-slate-400 text-left w-24">Metode Ajar</th>
                                      )}
                                      {showDriveReferences && (
                                        <th className="p-2 text-center w-16">Modul</th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.topics.map((t, idx) => (
                                      <tr
                                        key={t.id || idx}
                                        className={`border-b border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                                      >
                                        <td className="p-2 border-r border-slate-300 text-center font-bold align-top">
                                          {t.topicNumber || idx + 1}
                                        </td>
                                        <td className="p-2 border-r border-slate-300 align-top">
                                          <span className="font-extrabold text-blue-900 block text-[9.5px]">
                                            P-{t.meetingNumber || idx + 1}
                                          </span>
                                          <span className="text-[8.5px] text-slate-600 block leading-tight">
                                            {t.stageName || `Tahap ${idx + 1}`}
                                          </span>
                                        </td>
                                        <td className="p-2 border-r border-slate-300 align-top">
                                          <strong className="font-bold text-slate-900 block text-[10.5px]">
                                            {t.title}
                                          </strong>
                                          {showDetailedSubtopics && t.subtopics && t.subtopics.length > 0 && (
                                            <ul className="list-disc list-inside text-[9px] text-slate-700 mt-1 space-y-0.5">
                                              {t.subtopics.map((sub, sIdx) => (
                                                <li key={sIdx}>{sub}</li>
                                              ))}
                                            </ul>
                                          )}
                                        </td>
                                        {showCompetencyGoals && (
                                          <td className="p-2 border-r border-slate-300 align-top text-slate-800 text-[9.5px]">
                                            {t.competency || 'Menguasai konsep pokok dan mampu menyelesaikan soal model seleksi Labschool.'}
                                          </td>
                                        )}
                                        <td className="p-2 border-r border-slate-300 text-center font-mono align-top">
                                          {t.durationMinutes || 90}m
                                        </td>
                                        {showTeachingMethods && (
                                          <td className="p-2 border-r border-slate-300 align-top text-[9px] text-slate-700">
                                            {t.teachingMethod || 'Problem Based Learning & Speed Drills'}
                                          </td>
                                        )}
                                        {showDriveReferences && (
                                          <td className="p-2 text-center align-top text-[8.5px]">
                                            {t.driveLink ? (
                                              <span className="text-blue-800 font-semibold underline">
                                                Tersedia
                                              </span>
                                            ) : (
                                              <span className="text-slate-500">Standar</span>
                                            )}
                                          </td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* OPTION 2: UNIFIED SEQUENTIAL TABLE */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                              <Table className="w-4 h-4 text-blue-800" />
                              Matriks Struktur Silabus & Distribusi Pokok Bahasan
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-500">
                              Total {filteredTopics.length} Pertemuan Pembelajaran
                            </span>
                          </div>

                          <table className="w-full border-collapse border border-slate-400 text-[10px] text-slate-900">
                            <thead>
                              <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                                <th className="p-2 border-r border-slate-400 text-center w-10">No</th>
                                <th className="p-2 border-r border-slate-400 text-left w-24">Subtest & Fase</th>
                                <th className="p-2 border-r border-slate-400 text-left">Materi Pokok & Sub-Topik</th>
                                {showCompetencyGoals && (
                                  <th className="p-2 border-r border-slate-400 text-left">Target Capaian Kompetensi</th>
                                )}
                                <th className="p-2 border-r border-slate-400 text-center w-16">Durasi</th>
                                {showTeachingMethods && (
                                  <th className="p-2 border-r border-slate-400 text-left w-28">Metode Ajar</th>
                                )}
                                {showDriveReferences && (
                                  <th className="p-2 text-center w-20">Referensi</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTopics.map((t, idx) => (
                                <tr
                                  key={t.id || idx}
                                  className={`border-b border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                                >
                                  <td className="p-2 border-r border-slate-300 text-center font-bold">
                                    {t.topicNumber || idx + 1}
                                  </td>
                                  <td className="p-2 border-r border-slate-300 align-top">
                                    <span className="font-extrabold text-blue-900 block">
                                      {t.subtestCode}
                                    </span>
                                    <span className="text-[9px] text-slate-600 block">
                                      {t.stageName || `Sesi ${idx + 1}`}
                                    </span>
                                  </td>
                                  <td className="p-2 border-r border-slate-300 align-top">
                                    <strong className="font-bold text-slate-900 block text-[10.5px]">
                                      {t.title}
                                    </strong>
                                    {showDetailedSubtopics && t.subtopics && t.subtopics.length > 0 && (
                                      <ul className="list-disc list-inside text-[9.5px] text-slate-700 mt-1 space-y-0.5">
                                        {t.subtopics.map((sub, sIdx) => (
                                          <li key={sIdx}>{sub}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </td>
                                  {showCompetencyGoals && (
                                    <td className="p-2 border-r border-slate-300 align-top text-slate-800">
                                      {t.competency || 'Menguasai konsep pokok dan mampu menyelesaikan soal model seleksi Labschool.'}
                                    </td>
                                  )}
                                  <td className="p-2 border-r border-slate-300 text-center font-mono align-top">
                                    {t.durationMinutes || 90}m
                                  </td>
                                  {showTeachingMethods && (
                                    <td className="p-2 border-r border-slate-300 align-top text-[9.5px] text-slate-700">
                                      {t.teachingMethod || 'Problem Based Learning & Speed Drills'}
                                    </td>
                                  )}
                                  {showDriveReferences && (
                                    <td className="p-2 text-center align-top text-[9px]">
                                      {t.driveLink ? (
                                        <span className="text-blue-800 font-semibold underline">
                                          Modul Drive
                                        </span>
                                      ) : (
                                        <span className="text-slate-500">Standar</span>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* DOKUMEN SECTION 6: CATATAN & REKOMENDASI INSTRUSIONAL */}
                  {/* ========================================================================= */}
                  <div className="border-t border-slate-300 pt-3 text-[10px] text-slate-700 space-y-1 print-avoid-break">
                    <strong className="text-slate-900 block font-bold">Catatan Pelaksanaan Kurikulum:</strong>
                    <p>
                      1. Setiap sesi silabus wajib diiringi dengan kuis pemahaman topik minimal 10 soal HOTS berdurasi 15 menit.
                    </p>
                    <p>
                      2. Tutor pengampu wajib mencatat jurnal belajar terintegrasi setelah pembelajaran selesai untuk pemantauan progres real-time.
                    </p>
                    <p>
                      3. Siswa disarankan menyelesaikan seluruh topik sebelum pelaksanaan Tryout Akbar Labschool 2027.
                    </p>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* DOKUMEN SECTION 7: LEMBAR PENGESAHAN & TANDA TANGAN RESMI */}
                {/* ========================================================================= */}
                {showSignatures && (
                  <div className="signature-container pt-6 border-t-2 border-slate-900 mt-6 text-xs print-avoid-break">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <span className="text-slate-600 block text-[10px]">Mengetahui,</span>
                        <span className="font-bold text-slate-900 block text-[11px] mt-0.5">
                          Koordinator Kurikulum Labschool
                        </span>
                        <div className="h-16 flex items-center justify-center">
                          <span className="text-[10px] italic text-slate-400">(Tanda Tangan & Cap)</span>
                        </div>
                        <strong className="text-slate-950 block text-[11px] underline">
                          Prof. Dr. Arief Rachman, M.Pd.
                        </strong>
                        <span className="text-[9px] text-slate-600 block">NIP. 19680315 199403 1 002</span>
                      </div>

                      <div>
                        <span className="text-slate-600 block text-[10px]">Disusun Oleh,</span>
                        <span className="font-bold text-slate-900 block text-[11px] mt-0.5">
                          Master Tutor Pengembang Kurikulum
                        </span>
                        <div className="h-16 flex items-center justify-center">
                          <span className="text-[10px] italic text-slate-400">(Tanda Tangan)</span>
                        </div>
                        <strong className="text-slate-950 block text-[11px] underline">
                          Dr. Hendra Wijaya, M.Pd.
                        </strong>
                        <span className="text-[9px] text-slate-600 block">Divisi Akademik PSB Labschool</span>
                      </div>

                      <div>
                        <span className="text-slate-600 block text-[10px]">Jakarta, {docDateFormatted}</span>
                        <span className="font-bold text-slate-900 block text-[11px] mt-0.5">
                          Siswa / Orang Tua Murid
                        </span>
                        <div className="h-16 flex items-center justify-center">
                          <span className="text-[10px] italic text-slate-400">(Tanda Tangan)</span>
                        </div>
                        <strong className="text-slate-950 block text-[11px] underline">
                          {user?.name || 'Siswa Peserta PSB 2027'}
                        </strong>
                        <span className="text-[9px] text-slate-600 block">Calon Siswa {level} Labschool</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
