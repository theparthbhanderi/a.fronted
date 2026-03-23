'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CardData {
  nameLocal: string;
  nameEnglish: string;
  dob: string;
  gender: string;
  genderLocal: string;
  idNumber: string;
  issueDate: string;
  addressLocal: string;
  addressEnglish: string;
  vid: string;
  updateDate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt12 = (n: string) =>
  n.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(\d{4})(\d+)/, '$1 $2 $3');

const fmt16 = (n: string) =>
  n.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(\d{4})(\d{4})(\d+)/, '$1 $2 $3 $4');

// ─── Dynamic QR Code ──────────────────────────────────────────────────────────
const DynamicQR = ({ data }: { data: CardData }) => {
  const uid = data.idNumber.replace(/\D/g, '');
  const yob = data.dob.split('/').pop() || data.dob;
  const addr = data.addressEnglish.replace(/\n/g, ', ');

  // Standard Aadhaar QR data + high-density signature payload to match official scan complexity
  const signature = "MIIEPgYJKoZIhvcNAQcCoIIELzCCBysCAQExADALBgkqhkiG9w0BBwGgggSVMIIDkTCCAnmgAwIBAgIIYmJSUWqT1jkwDQYJKoZIhvcNAQEFBQAwRTELMAkGA1UEBhMCSU4xEDAOBgNVBAoTBzQzM2QwZDEwO" +
                    "SDAuBgNVBAsTJ0NlcnRpZmljYXRpb24gQXV0aG9yaXJ5IEluZGlhIChDQUktVUlEQUkpMRYwFAYDVQQDEw1VSURBSSBDQS0yMDE0MB4XDTE0MDEyMzA3NDUzOFoXDTI0MDEyMTA3NDUzOFowRTELMAkGA1UEBhMCSU4x" +
                    "EDAOBgNVBAoTBzQzM2QwZDEwO";

  const qrValue = `<?xml version="1.0" encoding="UTF-8"?><PrintLetterBarcodeData uid="${uid}" name="${data.nameEnglish}" gender="${data.gender.charAt(0).toUpperCase()}" yob="${yob}" co="${data.nameEnglish}" house="" street="" lm="" loc="" vtc="" dist="Anand" state="Gujarat" pc="364505" dob="${data.dob}" address="${addr}" signature="${signature}" />`;

  return (
    <div style={{ width: 140, height: 140, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <QRCodeSVG value={qrValue} size={138} level="H" includeMargin={false} />
    </div>
  );
};

// ─── Front Card ───────────────────────────────────────────────────────────────
const FrontCard = ({ data, photoSrc }: { data: CardData, photoSrc: string | null }) => (
  <div style={{
    width: 450, height: 284, background: '#fff',
    border: '1px solid #000',
    fontFamily: 'Arial, Helvetica, sans-serif', position: 'relative', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  }}>
    {/* ── Header ── */}
    <img
      src="/images/ashoka-emblem.png?v=2"
      alt="Front Header"
      style={{ width: '100%', height: 52, objectFit: 'fill', display: 'block', flexShrink: 0 }}
    />

    {/* ── Body Area ── */}
    <div style={{ display: 'flex', padding: '4px 12px 0 20px', flex: 1 }}>

      {/* Left col: vertical issue-date text + photo */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexShrink: 0 }}>
        {/* Vertical rotated text */}
        <div style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontSize: 7.5, fontWeight: 'normal', color: '#000', whiteSpace: 'nowrap',
          marginTop: 2, letterSpacing: 0.3, fontFamily: 'Arial, sans-serif'
        }}>
          Aadhaar no. issued: {data.issueDate}
        </div>
        {/* Passport photo */}
        <div style={{
          width: 90, height: 112,
          background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', marginTop: 1, border: '1px solid #aaa'
        }}>
          {photoSrc ? (
            <img src={photoSrc} alt="portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 'bold' }}>PHOTO</span>
          )}
        </div>
      </div>

      {/* Right col: identity details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 14, paddingTop: 2 }}>
        {/* Gujarati name */}
        <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', fontFamily: 'Arial, sans-serif', lineHeight: 1.25 }}>
          {data.nameLocal}
        </div>
        {/* English name */}
        <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', marginTop: 1, fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.25 }}>
          {data.nameEnglish}
        </div>

        {/* DOB */}
        <div style={{ fontSize: 11.5, color: '#000', marginTop: 3, lineHeight: 1.3, fontFamily: '"Times New Roman", Times, serif' }}>
          <span style={{ fontWeight: 'normal' }}>જન્મ તારીખ/DOB: </span>
          <span style={{ fontWeight: 'normal' }}>{data.dob}</span>
        </div>
        {/* Gender */}
        <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', marginTop: 1, fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.3 }}>
          {data.genderLocal}/ {data.gender}
        </div>

        {/* ── Red Disclaimer Box ── */}
        <div style={{
          border: '1px solid #cc3333',
          padding: '3px 5px',
          marginTop: 4,
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'justify'
        }}>
          {/* Gujarati disclaimer */}
          <div style={{ fontSize: 9.8, color: '#000', lineHeight: 1.25, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'justify', textAlignLast: 'justify', fontWeight: 'bold' }}>
              આધાર એ ઓળખનો પુરાવો છે, નાગરિકતા અથવા જન્મ તારીખનો નહીં.
            </div>
            <div style={{ textAlign: 'justify', textAlignLast: 'justify' }}>
              તેનો ઉપયોગ માત્ર ચકાસણી (ઓનલાઇન પ્રમાણીકરણ અથવા ક્યુઆર
            </div>
            <div style={{ textAlign: 'left' }}>
              કોડ/ઓફલાઇન એક્સએમએલનું સ્કેનીંગ) સાથે જ થવો જોઈએ.
            </div>
          </div>
          {/* English disclaimer */}
          <div style={{ fontSize: 9.8, color: '#000', lineHeight: 1.25, marginTop: 2, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ textAlign: 'justify', textAlignLast: 'justify', fontWeight: 'bold' }}>
              Aadhaar is proof of identity, not of citizenship
            </div>
            <div style={{ textAlign: 'justify', textAlignLast: 'justify' }}>
              <span style={{ fontWeight: 'bold' }}>or date of birth.</span> It should be used with verification (online
            </div>
            <div style={{ textAlign: 'left' }}>
              authentication, or scanning of QR code / offline XML).
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Aadhaar Number ── */}
    <div style={{ textAlign: 'center', flexShrink: 0, marginTop: 2, marginBottom: 2 }}>
      <div style={{ fontSize: 22, fontWeight: 'bold', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: 1 }}>
        {fmt12(data.idNumber)}
      </div>
    </div>

    {/* ── Footer with red line above ── */}
    <div style={{ borderTop: '2px solid #cc3333', flexShrink: 0 }}>
      <img
        src="/images/front-card-logo.png?v=2"
        alt="Front Footer"
        style={{ width: '100%', height: 21.5, objectFit: 'fill', display: 'block' }}
      />
    </div>
  </div>
);

// ─── Back Card ────────────────────────────────────────────────────────────────
const BackCard = ({ data }: { data: CardData }) => (
  <div style={{
    width: 450, height: 284, background: '#fff',
    border: '1px solid #000',
    fontFamily: 'Arial, Helvetica, sans-serif', position: 'relative', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  }}>
    {/* ── Header ── */}
    <img
      src="/images/aadhaar-logo.png?v=2"
      alt="Back Header"
      style={{ width: '100%', height: 52, objectFit: 'fill', display: 'block', flexShrink: 0 }}
    />

    {/* ── Body Area ── */}
    <div style={{ display: 'flex', padding: '5px 12px 0 6px', gap: 8, flex: 1 }}>

      {/* Left: vertical date text + address block */}
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {/* Vertical rotated date */}
        <div style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontSize: 7.5, fontWeight: 'normal', color: '#000', whiteSpace: 'nowrap',
          marginTop: 2, letterSpacing: 0.2, fontFamily: 'Arial, sans-serif', flexShrink: 0
        }}>
          Details as on: {data.updateDate}
        </div>

        {/* Address content */}
        <div style={{ flex: 1, paddingTop: 3 }}>
          {/* Gujarati address label */}
          <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.2 }}>
            સરનામું :
          </div>
          {/* Gujarati address text */}
          <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', lineHeight: 1.3, paddingRight: 4, whiteSpace: 'pre-wrap', fontFamily: '"Times New Roman", Times, serif' }}>
            {data.addressLocal}
          </div>

          {/* English address label */}
          <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', marginTop: 6, fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.2 }}>
            Address:
          </div>
          {/* English address text */}
          <div style={{ fontSize: 11.5, fontWeight: 'normal', color: '#000', lineHeight: 1.3, paddingRight: 4, whiteSpace: 'pre-wrap', fontFamily: '"Times New Roman", Times, serif' }}>
            {data.addressEnglish}
          </div>
        </div>
      </div>

      {/* Right: Dynamic QR Code - Shifted left & down slightly */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: 6, paddingRight: 6, flexShrink: 0 }}>
        <DynamicQR data={data} />
      </div>
    </div>

    {/* ── Bottom: ID Number + VID ── */}
    <div style={{ textAlign: 'center', marginBottom: 2, flexShrink: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 'bold', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: 1 }}>
        {fmt12(data.idNumber)}
      </div>
      <hr style={{ border: 'none', borderTop: '1px dotted #000', margin: '2px auto', width: '240px' }} />
      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#000', marginTop: 1, fontFamily: 'Arial, sans-serif', letterSpacing: 0.2 }}>
        VID : {fmt16(data.vid)}
      </div>
    </div>

    {/* ── Footer with red line ── */}
    <div style={{ height: 21.5, width: '100%', borderTop: '2px solid #cc3333', flexShrink: 0 }}>
      <img
        src="/images/back-header-logo.png?v=2"
        alt="Back Footer"
        style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', backgroundColor: '#fff' }}
      />
    </div>
  </div>
);

// ─── Gender Mapping ───────────────────────────────────────────────────────────
const GENDER_MAP: Record<string, string> = { MALE: 'પુરુષ', FEMALE: 'સ્ત્રી', OTHER: 'અન્ય' };

// ─── Random Data Generators ──────────────────────────────────────────────────
const rand12 = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
const rand16 = () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');


// ─── Validation ──────────────────────────────────────────────────────────────
const isFutureDate = (dateStr: string) => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  return d > new Date();
};

// ─── Format date from input[type=date] to DD/MM/YYYY ─────────────────────────
const dateToDDMMYYYY = (isoDate: string) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};
const ddmmyyyyToISO = (ddmm: string) => {
  const parts = ddmm.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// ─── Field Input ──────────────────────────────────────────────────────────────
const Field = ({
  label, value, onChange, placeholder, type = 'text', isTextArea = false, error
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; isTextArea?: boolean; error?: string;
}) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">{label}</label>
    {isTextArea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[90px] resize-y focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
      />
    ) : (
      <>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`bg-slate-800/70 border text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 ${error ? 'border-red-500/70' : 'border-slate-600/50'}`}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </>
    )}
  </div>
);

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, children, className = '' }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    onClick={onClick}
    className={`bg-slate-700/50 hover:bg-slate-600/70 text-indigo-300 hover:text-indigo-200 text-[10px] font-semibold px-2 py-1 rounded transition-colors flex justify-center items-center ${className}`}
  >
    {children}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CardGeneratorPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ─── Transliteration Helper ───
  const transliterate = async (text: string, field: 'name' | 'address') => {
    if (!text || !autoTranslate) return;
    try {
      const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=gu-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`);
      const json = await res.json();
      if (json[0] === 'SUCCESS' && json[1]?.[0]?.[1]?.[0]) {
        const translated = json[1][0][1][0];
        if (field === 'name') setData(d => ({ ...d, nameLocal: translated }));
        else setData(d => ({ ...d, addressLocal: translated }));
      }
    } catch (e) { console.error('Transliteration failed', e); }
  };

  const [data, setData] = useState<CardData>({
    nameLocal: 'ઊર્વી જયંતીભાઈ દેસાઈ',
    nameEnglish: 'Urvi Jayantibhai Desai',
    dob: '15/08/1990',
    gender: 'FEMALE',
    genderLocal: 'સ્ત્રી',
    idNumber: '944742892749',
    issueDate: '20/03/2018',
    addressLocal: 'ઘર નં 124, નારાયણ સોસાયટી સેટેલાઇટ\nનહેરુ રોડ આણંદ, ગુજરાત - 365869',
    addressEnglish: 'House No. 124, Narayan Society Satellite\nNehru Road Anand, Gujarat - 365869',
    vid: '4408775126933962',
    updateDate: '14/11/2025',
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof CardData) => (v: string) => setData((d) => ({ ...d, [k]: v }));

  // ─── Gender handler ─
  const handleGenderChange = (gen: string) => {
    setData((d) => ({ ...d, gender: gen, genderLocal: GENDER_MAP[gen] || gen }));
  };

  // ─── ID auto-format (store raw, display formatted) ─
  const handleIdChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    setData((d) => ({ ...d, idNumber: digits }));
  };

  // ─── VID auto-format ─
  const handleVidChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    setData((d) => ({ ...d, vid: digits }));
  };

  // ─── Random ID ─
  const generateId = () => setData((d) => ({ ...d, idNumber: rand12() }));
  const generateVid = () => setData((d) => ({ ...d, vid: rand16() }));

  const getRandomDate = (startYear: number, endYear: number) => {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // Safe for all months
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  const generateIssueDate = () => set('issueDate')(getRandomDate(2012, 2015));
  const generateUpdateDate = () => set('updateDate')(getRandomDate(2012, 2025));

  const handleDownload = async (side: 'front' | 'back') => {
    const id = side === 'front' ? 'aadhaar-front' : 'aadhaar-back';
    const element = document.getElementById(id);
    if (!element) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 3, // Highly detailed but safer for mobile memory
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUrl;
      link.download = `aadhaar-${side}-${data.idNumber.replace(/\s/g, '')}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      // Small delay before cleanup for mobile browser reliability
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);

      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };



  // ─── Date Pickers ─
  const handleDobPick = (iso: string) => set('dob')(dateToDDMMYYYY(iso));
  const handleIssueDatePick = (iso: string) => set('issueDate')(dateToDDMMYYYY(iso));
  const handleUpdateDatePick = (iso: string) => set('updateDate')(dateToDDMMYYYY(iso));

  // ─── Validation ─
  const dobError = isFutureDate(data.dob) ? 'DOB cannot be a future date' : '';
  const idError = data.idNumber.replace(/\D/g, '').length > 0 && data.idNumber.replace(/\D/g, '').length !== 12 ? 'Must be exactly 12 digits' : '';
  const nameEnError = data.nameEnglish.length > 0 && data.nameEnglish.length < 3 ? 'Minimum 3 characters' : '';
  const nameGuError = data.nameLocal.length > 0 && data.nameLocal.length < 3 ? 'Minimum 3 characters' : '';

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Auto-crop to portrait ratio (3:4)
        const canvas = document.createElement('canvas');
        const targetW = 300, targetH = 400;
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d')!;
        const srcRatio = img.width / img.height;
        const tgtRatio = targetW / targetH;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcRatio > tgtRatio) {
          sw = img.height * tgtRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / tgtRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        setPhoto(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const handlePrint = () => {
    const frontEl = document.getElementById('aadhaar-front');
    const backEl = document.getElementById('aadhaar-back');
    if (!frontEl || !backEl) return;

    const printWin = window.open('', '_blank', 'width=500,height=400');
    if (!printWin) return;

    printWin.document.write(`<!DOCTYPE html>
<html><head><title>Aadhaar Card PDF</title>
<style>
  @page { size: 119mm 77mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; }
  .card-page {
    width: 119mm;
    height: 77mm;
    overflow: hidden;
    page-break-after: always;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  .card-page:last-child { page-break-after: auto; }
</style>
</head><body>
  <div class="card-page">${frontEl.outerHTML}</div>
  <div class="card-page">${backEl.outerHTML}</div>
</body></html>`);

    printWin.document.close();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 500);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white" suppressHydrationWarning>

      {/* ─── Sticky Header ─── */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[420px] xl:max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold">KINGPARTH</h1>
                <p className="text-[10px] sm:text-xs text-emerald-400 font-semibold">Aadhaar Format UI Generator</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto mt-3 sm:mt-0">
            <button
              onClick={handlePrint}
              className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all flex items-center gap-1.5 print:hidden sm:w-auto"
            >
              Save / Print PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 sm:gap-8 relative">
        {/* ─── Left: Input Form ─── */}
        <div className="flex flex-col space-y-6">
          {/* Premium Mobile Preview (Segmented Control) */}
          <div className="xl:hidden flex flex-col gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</h2>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                  onClick={() => setActiveTab('front')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${activeTab === 'front' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Front
                </button>
                <button 
                  onClick={() => setActiveTab('back')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${activeTab === 'back' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Back
                </button>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center min-h-[220px]">
              {activeTab === 'front' ? (
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }} className="transition-all duration-300 animate-in fade-in zoom-in-95">
                   <FrontCard data={data} photoSrc={photo} />
                </div>
              ) : (
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }} className="transition-all duration-300 animate-in fade-in zoom-in-95">
                   <BackCard data={data} />
                </div>
              )}
            </div>
          </div>

          {/* ── Photo Upload ── */}
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 sm:p-6">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
              Upload Portrait Photo
              <span className="text-[9px] text-slate-500 font-normal ml-auto">Auto-crops to 3:4 portrait</span>
            </h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl h-32 sm:h-40 flex items-center justify-center gap-3 cursor-pointer transition-all p-4
                ${isDragActive ? 'border-indigo-400 bg-indigo-900/20' : 'border-slate-600 hover:border-indigo-600 bg-slate-900/50'}`}
            >
              <input {...getInputProps()} />
              {photo ? (
                <div className="flex items-center gap-4 h-full">
                  <img src={photo} alt="Preview" className="h-full w-auto aspect-[3/4] object-cover rounded-lg border border-slate-500 shadow-lg" />
                  <div>
                    <p className="text-xs sm:text-sm text-white font-medium">Photo uploaded ✓</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Click or drop to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-lg sm:text-2xl text-slate-400">📷</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG — auto-cropped</p>
                </div>
              )}
            </div>
          </div>


          {/* ── Front Card Details ── */}
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                Front Card Details
              </h2>
              <button 
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${autoTranslate ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
              >
                <div className={`w-2 h-2 rounded-full ${autoTranslate ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{autoTranslate ? 'Auto-Translate ON' : 'Manual Mode'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Names */}
              <Field 
                label="Name (English)" 
                value={data.nameEnglish} 
                onChange={(v) => {
                  set('nameEnglish')(v);
                  if (autoTranslate) transliterate(v, 'name');
                }} 
                error={nameEnError} 
              />
              <Field label="Name (Gujarati)" value={data.nameLocal} onChange={set('nameLocal')} error={nameGuError} />

              {/* DOB — Date Picker */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Date of Birth</label>
                <div className="grid grid-cols-[1fr_90px] gap-2 items-center">
                  <input
                    type="text"
                    value={data.dob}
                    onChange={(e) => set('dob')(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className={`w-full bg-slate-800/70 border text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 ${dobError ? 'border-red-500/70' : 'border-slate-600/50'}`}
                  />
                  <input
                    type="date"
                    value={ddmmyyyyToISO(data.dob)}
                    onChange={(e) => handleDobPick(e.target.value)}
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-2 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                {dobError && <span className="text-xs text-red-400">{dobError}</span>}
              </div>

              {/* Gender — Dropdown */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Gender</label>
                <select
                  value={data.gender}
                  onChange={(e) => handleGenderChange(e.target.value)}
                  className="bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Gender Gujarati — Auto-filled, read-only */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Gender (Gujarati) <span className="text-emerald-400 text-[10px] font-normal">Auto</span></label>
                <input
                  type="text"
                  value={data.genderLocal}
                  readOnly
                  className="bg-slate-800/70 border border-emerald-700/30 text-emerald-200 text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none cursor-default"
                />
              </div>

              {/* ID Number with Generate button */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">12-Digit ID Number</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={fmt12(data.idNumber)}
                    onChange={(e) => handleIdChange(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className={`bg-slate-800/70 border text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-mono tracking-wider ${idError ? 'border-red-500/70' : 'border-slate-600/50'}`}
                  />
                  <ActionBtn onClick={generateId} className="min-h-[44px] px-3 sm:px-4 text-xs">🎲 Generate</ActionBtn>
                </div>
                {idError && <span className="text-xs text-red-400">{idError}</span>}
              </div>

              {/* Issue Date — Date Picker */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Issue Date</label>
                <div className="grid grid-cols-[1fr_90px_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={data.issueDate}
                    onChange={(e) => set('issueDate')(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                  <input
                    type="date"
                    value={ddmmyyyyToISO(data.issueDate)}
                    onChange={(e) => handleIssueDatePick(e.target.value)}
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-2 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  <ActionBtn onClick={generateIssueDate} className="min-h-[44px] px-3 text-[10px]">🎲 Gen</ActionBtn>
                </div>
              </div>
            </div>
          </div>

          {/* ── Back Card Details ── */}
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
              Back Card Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Field 
                label="Address (English)" 
                value={data.addressEnglish} 
                onChange={(v) => {
                  set('addressEnglish')(v);
                  if (autoTranslate) transliterate(v, 'address');
                }} 
                isTextArea 
              />
              <Field label="Address (Gujarati)" value={data.addressLocal} onChange={set('addressLocal')} isTextArea />

              {/* VID with Generate */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">16-Digit Virtual ID (VID)</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={fmt16(data.vid)}
                    onChange={(e) => handleVidChange(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-mono tracking-wider"
                  />
                  <ActionBtn onClick={generateVid} className="min-h-[44px] px-3 sm:px-4 text-xs">🎲 Generate</ActionBtn>
                </div>
              </div>

              {/* Update Date — Date Picker */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Last Updated Date</label>
                <div className="grid grid-cols-[1fr_90px_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={data.updateDate}
                    onChange={(e) => set('updateDate')(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                  <input
                    type="date"
                    value={ddmmyyyyToISO(data.updateDate)}
                    onChange={(e) => handleUpdateDatePick(e.target.value)}
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-2 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  <ActionBtn onClick={generateUpdateDate} className="min-h-[44px] px-3 text-[10px]">🎲 Gen</ActionBtn>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex flex-col gap-5 items-start sticky top-[100px] self-start z-10">
          <div className="flex items-center justify-between w-full pr-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Live Preview</h2>
              <span className="text-[10px] bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 px-2 py-0.5 rounded-full">100% Perfect Ditto</span>
            </div>
            <button 
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download HQ PNG
            </button>
          </div>

          <div id="card-preview" ref={previewRef} className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-slate-700 shadow-2xl">
            <div>
              <p className="text-[10px] text-slate-400 mb-1.5 ml-1 uppercase tracking-widest font-semibold">— Front</p>
              <div id="aadhaar-front"><FrontCard data={data} photoSrc={photo} /></div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-1.5 ml-1 uppercase tracking-widest font-semibold">— Back</p>
              <div id="aadhaar-back"><BackCard data={data} /></div>
            </div>
          </div>
        </div>
      </div>
      {/* ─── Mobile Sticky Bottom Bar ─── */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/50 z-[60] flex items-center justify-between shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aadhaar Card</span>
          <span className="text-xs text-emerald-400 font-bold">Ready for PDF</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white p-3 rounded-xl transition-all border border-slate-700"
            title="Download as Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2"
          >
            Save / Print PDF
          </button>
        </div>
      </div>

      {/* ─── Download Selection Modal ─── */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => !isDownloading && setIsDownloadModalOpen(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 text-center border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Download Card</h3>
              <p className="text-sm text-slate-400 mt-1">Select card side for HQ PNG export</p>
            </div>
            
            <div className="p-4 grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleDownload('front')}
                disabled={isDownloading}
                className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 rounded-2xl transition-all group active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    🪪
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">Front Card</p>
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-tight">Standard ID View</p>
                  </div>
                </div>
                <div className="text-slate-600 group-hover:text-indigo-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button 
                onClick={() => handleDownload('back')}
                disabled={isDownloading}
                className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500 rounded-2xl transition-all group active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    🗺️
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">Back Card</p>
                    <p className="text-[11px] text-slate-500 uppercase font-bold tracking-tight">Address & QR View</p>
                  </div>
                </div>
                <div className="text-slate-600 group-hover:text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setIsDownloadModalOpen(false)}
              disabled={isDownloading}
              className="w-full py-4 text-sm font-bold text-slate-500 hover:text-white transition-colors bg-slate-900/50"
            >
              {isDownloading ? 'Exporting High Quality...' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Spacer for bottom bar */}
      <div className="xl:hidden h-24" />
    </main>
  );
}