import React from 'react';
import { KopSuratSettings, InstitutionInfo } from '../../types';
import { Building2, GraduationCap, Flame, Sparkles, ShieldCheck, Award } from 'lucide-react';

interface OfficialKopSuratProps {
  kopSettings?: KopSuratSettings;
  institution?: InstitutionInfo;
  documentTitle?: string;
  documentSubtitle?: string;
  documentBadge?: string;
  documentId?: string;
  customDate?: string;
  compact?: boolean;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  kopSettings,
  institution,
  documentTitle,
  documentSubtitle,
  documentBadge,
  documentId,
  customDate,
  compact = false
}) => {
  // If Kop is disabled in settings, return minimal title header
  if (kopSettings && kopSettings.enabled === false) {
    if (!documentTitle) return null;
    return (
      <div className="pb-4 mb-4 border-b border-slate-300 text-center">
        <h2 className="text-lg font-black uppercase text-slate-900">{documentTitle}</h2>
        {documentSubtitle && <p className="text-xs text-slate-600 font-medium">{documentSubtitle}</p>}
      </div>
    );
  }

  const instName = kopSettings?.institutionName || institution?.name || 'BRAIN SPACE ACADEMY & UTBK CENTER';
  const instHeader = kopSettings?.institutionHeader || 'YAYASAN PENDIDIKAN BRAIN SPACE UTAMA';
  const subHeader = kopSettings?.subHeader || institution?.subtitle || 'PUSAT BIMBINGAN BELAJAR, CBT & EVALUASI STANDAR NASIONAL';
  const addressLine1 = kopSettings?.addressLine1 || institution?.address || 'Jl. Pendidikan Nasional No. 88, Kebayoran Baru, Jakarta Selatan 12160';
  const addressLine2 = kopSettings?.addressLine2 || `Telp: ${institution?.phone || '(021) 7890-1234'} • WA: ${institution?.whatsapp || '0812-3456-7890'} • Email: ${institution?.email || 'info@brainspace.academy'}`;
  const website = kopSettings?.website || `Website: ${institution?.website || 'https://brainspace.academy'}`;
  const borderStyle = kopSettings?.borderStyle || 'double';
  const showLogoLeft = kopSettings?.showLogoLeft !== false;
  const showLogoRight = kopSettings?.showLogoRight !== false;
  const logoUrl = institution?.logoUrl;
  const logoRightUrl = kopSettings?.logoRightUrl;

  const formattedDate = customDate || new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className={`w-full bg-white text-slate-900 ${compact ? 'mb-4' : 'mb-6'}`}>
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Logo */}
        {showLogoLeft && (
          <div className="shrink-0 flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={instName}
                className={`${compact ? 'w-14 h-14' : 'w-18 h-18 sm:w-20 sm:h-20'} object-contain`}
                crossOrigin="anonymous"
              />
            ) : (
              <div className={`${compact ? 'w-14 h-14' : 'w-18 h-18 sm:w-20 sm:h-20'} rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 text-white flex items-center justify-center shadow-md border border-slate-700`}>
                <Flame className="w-10 h-10 text-amber-300 fill-amber-300" />
              </div>
            )}
          </div>
        )}

        {/* Center Institution Info */}
        <div className="flex-1 text-center min-w-0">
          {instHeader && (
            <p className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-700 uppercase">
              {instHeader}
            </p>
          )}
          <h1 className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'} font-black text-slate-950 uppercase tracking-tight leading-tight mt-0.5`}>
            {instName}
          </h1>
          {subHeader && (
            <p className="text-[10px] sm:text-xs font-bold text-indigo-900 tracking-wide uppercase mt-0.5">
              {subHeader}
            </p>
          )}
          <p className="text-[9px] sm:text-[11px] text-slate-600 mt-1 leading-snug">
            {addressLine1}
          </p>
          <p className="text-[9px] sm:text-[10.5px] text-slate-600 leading-snug">
            {addressLine2} {website && `• ${website}`}
          </p>
        </div>

        {/* Right Logo or Right Document Info Badge */}
        {showLogoRight && (
          <div className="shrink-0 hidden sm:flex flex-col items-center justify-center text-right">
            {logoRightUrl ? (
              <img
                src={logoRightUrl}
                alt="Logo Mitra"
                className={`${compact ? 'w-14 h-14' : 'w-16 h-16'} object-contain`}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="text-right space-y-1">
                {documentBadge && (
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-black rounded uppercase">
                    {documentBadge}
                  </span>
                )}
                {documentId && (
                  <p className="text-[9px] font-mono text-slate-500">{documentId}</p>
                )}
                <p className="text-[9px] text-slate-500 font-medium">Tgl: {formattedDate}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Border Under Kop Surat */}
      <div className="mt-3">
        {borderStyle === 'double' && (
          <div className="space-y-[2px]">
            <div className="w-full h-[3px] bg-slate-900" />
            <div className="w-full h-[1px] bg-slate-800" />
          </div>
        )}
        {borderStyle === 'solid' && (
          <div className="w-full h-[2.5px] bg-slate-900" />
        )}
        {borderStyle === 'gradient' && (
          <div className="w-full h-[3px] bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600" />
        )}
        {borderStyle === 'minimal' && (
          <div className="w-full h-[1px] bg-slate-300" />
        )}
      </div>

      {/* Optional Document Title Block Below Divider */}
      {documentTitle && (
        <div className="text-center pt-3 pb-1">
          <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
            {documentTitle}
          </h2>
          {documentSubtitle && (
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
              {documentSubtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface OfficialSignatureBlockProps {
  kopSettings?: KopSuratSettings;
  institution?: InstitutionInfo;
  cityName?: string;
  customDate?: string;
  signerTitle?: string;
  signerName?: string;
  signerNip?: string;
}

export const OfficialSignatureBlock: React.FC<OfficialSignatureBlockProps> = ({
  kopSettings,
  institution,
  cityName,
  customDate,
  signerTitle,
  signerName,
  signerNip
}) => {
  if (kopSettings && kopSettings.showSignatureSection === false) {
    return null;
  }

  const city = cityName || kopSettings?.cityLocation || institution?.city || 'Jakarta Selatan';
  const title = signerTitle || kopSettings?.signerTitle || institution?.motto || 'Kepala Lembaga / Penanggung Jawab Akademik';
  const name = signerName || kopSettings?.signerName || institution?.principalName || 'Dr. H. Hendra Wijaya, M.Pd.';
  const nip = signerNip || kopSettings?.signerNip || institution?.principalNip || 'NIP. 19850714 201001 1 008';
  const stampUrl = institution?.stampUrl;
  const signatureUrl = institution?.signatureUrl;

  const formattedDate = customDate || new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="w-full flex justify-end mt-8 pt-4 break-inside-avoid text-xs text-slate-900">
      <div className="w-64 text-center space-y-1">
        <p className="text-slate-700">
          {city}, {formattedDate}
        </p>
        <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          {title}
        </p>

        {/* Space for Signature & Stamp */}
        <div className="relative h-20 flex items-center justify-center">
          {stampUrl && (
            <img
              src={stampUrl}
              alt="Stempel"
              className="absolute w-20 h-20 object-contain opacity-70 left-4"
              crossOrigin="anonymous"
            />
          )}
          {signatureUrl ? (
            <img
              src={signatureUrl}
              alt="Tanda Tangan"
              className="h-16 object-contain z-10"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full border-b border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 italic">
              (Tanda Tangan & Stempel Resmi)
            </div>
          )}
        </div>

        {/* Signer Name & NIP */}
        <div className="pt-1">
          <p className="font-extrabold text-slate-950 underline text-xs">
            {name}
          </p>
          {nip && (
            <p className="text-[10px] text-slate-600 font-mono">
              {nip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
