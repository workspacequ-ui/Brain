import { User } from '../types';

export type LabschoolLevel = 'SMP' | 'SMA' | 'ALL';

/**
 * Checks if a student is enrolled in the Labschool Preparation Program (SMP or SMA Labschool)
 */
export const isStudentLabschool = (user?: User | null): boolean => {
  if (!user || user.role !== 'student') return false;
  const className = (user.className || '').trim().toUpperCase();
  const groupName = (user.group || '').trim().toUpperCase();
  const bio = (user.bio || '').trim().toUpperCase();

  // If user is explicitly SNBT, return false
  if (
    className.includes('UTBK') ||
    className.includes('SNBT') ||
    groupName.includes('UTBK') ||
    groupName.includes('SNBT')
  ) {
    return false;
  }
  // If user is marked as regular non-labs, return false
  if (groupName.includes('REGULER') || bio.includes('NON-LABS') || (bio.includes('REGULER') && !bio.includes('LABS'))) {
    return false;
  }

  return (
    className.includes('LABSCHOOL') ||
    className.includes('LABS') ||
    className === 'SMP-LABSCHOOL' ||
    className === 'SMA-LABSCHOOL' ||
    groupName.includes('LABSCHOOL') ||
    groupName.includes('LABS') ||
    bio.includes('LABSCHOOL') ||
    bio.includes('LABS')
  );
};

/**
 * Checks if a student is enrolled in the UTBK-SNBT Intensive Program
 */
export const isStudentSnbt = (user?: User | null): boolean => {
  if (!user || user.role !== 'student') return false;
  const className = (user.className || '').trim().toUpperCase();
  const groupName = (user.group || '').trim().toUpperCase();
  const bio = (user.bio || '').trim().toUpperCase();

  // If user is explicitly Labschool, return false
  if (
    className.includes('LABSCHOOL') ||
    className.includes('LABS') ||
    groupName.includes('LABSCHOOL') ||
    groupName.includes('LABS')
  ) {
    return false;
  }
  // If user is marked as regular non-snbt, return false
  if (groupName.includes('REGULER') || bio.includes('NON-SNBT') || (bio.includes('REGULER') && !bio.includes('UTBK'))) {
    return false;
  }

  return (
    className.includes('UTBK') ||
    className.includes('SNBT') ||
    className === 'XII-UTBK' ||
    groupName.includes('UTBK') ||
    groupName.includes('SNBT') ||
    bio.includes('UTBK') ||
    bio.includes('SNBT') ||
    bio.includes('PTN')
  );
};

/**
 * Checks if a student is a Regular student (Non-Labschool and Non-SNBT)
 */
export const isStudentRegular = (user?: User | null): boolean => {
  if (!user || user.role !== 'student') return false;
  return !isStudentLabschool(user) && !isStudentSnbt(user);
};

/**
 * Helper function to determine whether a user belongs to SMP, SMA, or ALL (Admin / General).
 * - SMP student ('SMP-LABSCHOOL' or contains 'SMP') -> 'SMP'
 * - SMA student ('SMA-LABSCHOOL' or contains 'SMA') -> 'SMA'
 * - Admin -> 'ALL' (sees both SMP and SMA menus)
 * - Teacher -> Filtered if assigned strictly to one level, otherwise 'ALL'
 */
export const getUserLabschoolLevel = (user?: User | null): LabschoolLevel => {
  if (!user) return 'ALL';
  if (user.role === 'admin') return 'ALL';

  const className = (user.className || '').trim().toUpperCase();
  const targetClasses = (user.targetClasses || []).map(t => t.trim().toUpperCase());
  const groupName = (user.group || '').trim().toUpperCase();

  if (user.role === 'student') {
    if (!isStudentLabschool(user)) {
      return 'ALL';
    }
    if (
      className === 'SMP-LABSCHOOL' ||
      className === 'SMP LABSCHOOL' ||
      className.includes('SMP-LAB') ||
      className.includes('SMP') ||
      className.includes('MASUK SMP') ||
      groupName.includes('SMP-LAB') ||
      groupName.includes('SMP')
    ) {
      return 'SMP';
    }
    if (
      className === 'SMA-LABSCHOOL' ||
      className === 'SMA LABSCHOOL' ||
      className.includes('SMA-LAB') ||
      className.includes('SMA') ||
      className.includes('MASUK SMA') ||
      groupName.includes('SMA-LAB') ||
      groupName.includes('SMA')
    ) {
      return 'SMA';
    }
    return 'ALL';
  }

  if (user.role === 'teacher') {
    const hasSmp = className.includes('SMP') || targetClasses.some(t => t.includes('SMP')) || groupName.includes('SMP');
    const hasSma = className.includes('SMA') || targetClasses.some(t => t.includes('SMA')) || groupName.includes('SMA');
    const hasAll =
      className === 'SEMUA' ||
      className === 'ALL' ||
      targetClasses.includes('SEMUA') ||
      targetClasses.includes('ALL');

    if (hasAll || (hasSmp && hasSma)) return 'ALL';
    if (hasSmp) return 'SMP';
    if (hasSma) return 'SMA';
    return 'ALL';
  }

  return 'ALL';
};

/**
 * Checks if the user is a student with a specific locked grade/level (SMP or SMA).
 */
export const isStudentLevelLocked = (user?: User | null): boolean => {
  if (!user || user.role !== 'student') return false;
  if (!isStudentLabschool(user)) return false;
  const level = getUserLabschoolLevel(user);
  return level === 'SMP' || level === 'SMA';
};

/**
 * Returns formatted metadata about the student's program and level for display
 */
export const getStudentProgramInfo = (user?: User | null) => {
  if (!user || user.role !== 'student') {
    return {
      type: 'OTHER' as const,
      label: user?.role === 'admin' ? 'Administrator' : user?.role === 'teacher' ? 'Guru' : 'Pengguna',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
    };
  }

  if (isStudentSnbt(user)) {
    return {
      type: 'SNBT' as const,
      label: 'Program UTBK-SNBT 2026',
      sublabel: 'Persiapan Masuk PTN Favorit',
      badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
    };
  }

  if (isStudentLabschool(user)) {
    const level = getUserLabschoolLevel(user);
    if (level === 'SMP') {
      return {
        type: 'LABSCHOOL_SMP' as const,
        label: 'Program PSB SMP Labschool',
        sublabel: 'Target: Seleksi Masuk SMP Labschool',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
      };
    }
    return {
      type: 'LABSCHOOL_SMA' as const,
      label: 'Program PSB SMA Labschool',
      sublabel: 'Target: Seleksi Masuk SMA Labschool',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60'
    };
  }

  return {
    type: 'REGULAR' as const,
    label: 'Program Reguler Sekolah',
    sublabel: 'Kurikulum Nasional & Ujian Kelas',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/60'
  };
};


