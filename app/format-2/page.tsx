'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toJpeg } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { Roboto_Condensed, Roboto_Mono, Great_Vibes } from 'next/font/google';

const roboto = Roboto_Condensed({ subsets: ['latin'], weight: ['400', '500', '700'] });
const panFont = Roboto_Mono({ subsets: ['latin'], weight: ['700'] });
const signFont = Great_Vibes({ subsets: ['latin'], weight: ['400'] });

interface PanData {
  name: string;
  fatherName: string;
  dob: string;
  panNumber: string;
  signature: string;
  issueDate: string;
}

const PanCard = ({ data, photoSrc, scanMode }: any) => {

  const qrData = `PAN:${data.panNumber}|NAME:${data.name}|FNAME:${data.fatherName}|DOB:${data.dob}|TYPE:INDIVIDUAL|STATUS:ACTIVE|CATEGORY:P|ISSUED:${data.issueDate}|ISSUER:NSDL_E_GOV|AO_CODE:ITO-W-24(3)-DEL|JURISDICTION:DELHI|ADDR:AHMEDABAD,GUJARAT,380015,IN|REF:${data.panNumber}${data.dob.replace(/\//g, '')}|HASH:SHA256:${data.panNumber.split('').map((c: string) => c.charCodeAt(0).toString(16)).join('')}|SIG:INCOME_TAX_DEPT_DIGITAL_CERT_2023|VERIFY:https://www.incometax.gov.in/iec/foportal/verify-pan-details`;

  return (
    <div
      id="pan-card"
      style={{
        width: 420,
        height: 265,
        position: 'relative',
        overflow: 'hidden',
        letterSpacing: '0.15px',
        textRendering: 'geometricPrecision',
        filter: scanMode ? 'contrast(0.96) blur(0.25px)' : 'contrast(0.98)',
      }}
    >
      {/* BACKGROUND */}
      <img
        src="/images/PAN FORMAT.jpeg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* OVERLAY */}
      <div style={{ position: 'absolute', inset: 0 }}>

        {/* PHOTO */}
        {photoSrc ? (
          <img
            src={photoSrc}
            style={{
              position: 'absolute',
              top: '28%',
              left: '7%',
              width: '17%',
              height: '27%',
              objectFit: 'cover',
              border: '1px solid rgba(0,0,0,0.15)'
            }}
          />
        ) : null}

        {/* QR */}
        <div style={{
          position: 'absolute',
          top: '29.5%',
          right: '6.3%',
          width: 115,
          height: 115,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <QRCodeSVG
            value={qrData}
            size={106}
            level="H"
            includeMargin={false}
            style={{ display: 'block' }}
          />
        </div>

        {/* PAN NUMBER — Arial/Helvetica standard per official spec */}
        <div
          style={{
            position: 'absolute',
            top: '39%',
            left: '30%',
            width: '30%',
            textAlign: 'center',
            fontFamily: "'Arial', 'Helvetica', sans-serif",
            fontWeight: 650,
            fontSize: 16,
            letterSpacing: '1px',
            fontVariantNumeric: 'tabular-nums',
            transform: 'scaleX(1.02)',
            color: '#111',
            textShadow: '0 0 0.25px rgba(0,0,0,0.6)'
          }}
        >
          {data.panNumber}
        </div>

        {/* NAME — Arial Narrow, govt print style */}
        <div
          style={{
            position: 'absolute',
            top: '58.5%',
            left: '6.8%',
            fontFamily: "Helvetica",
            fontSize: 10,
            fontWeight: 550,
            letterSpacing: '0.15px',
            textTransform: 'uppercase',
            transform: 'scaleX(0.98) translateX(-0.3px)',
            color: '#111',
            textShadow: '0 0 0.2px rgba(0,0,0,0.4)'
          }}
        >
          {data.name}
        </div>

        {/* FATHER NAME — same family, same weight */}
        <div
          style={{
            position: 'absolute',
            top: '70.5%',
            left: '6.8%',
            fontFamily: "Helvetica",
            fontSize: 10,
            fontWeight: 550,
            letterSpacing: '0.15px',
            textTransform: 'uppercase',
            transform: 'scaleX(0.98) translateX(-0.3px)',
            color: '#111',
            textShadow: '0 0 0.2px rgba(0,0,0,0.4)'
          }}
        >
          {data.fatherName}
        </div>

        {/* DOB — standard Arial, regular style */}
        <div
          style={{
            position: 'absolute',
            top: '85%',
            left: '7%',
            fontFamily: "Helvetica",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.4px',
            color: '#111',
            textShadow: '0 0 0.2px rgba(0,0,0,0.4)'
          }}
        >
          {data.dob}
        </div>

        {/* SIGNATURE — cursive with natural pen tilt */}
        <div
          className={signFont.className}
          style={{
            position: 'absolute',
            top: '79%',
            left: '30%',
            fontSize: 22,
            opacity: 0.85,
            transform: 'rotate(-2deg) skewX(-3deg)',
            color: '#111',
            textShadow: '0 0 0.2px rgba(0,0,0,0.4)'
          }}
        >
          {data.signature}
        </div>

        {/* ISSUE DATE */}
        <div
          className={roboto.className}
          style={{
            position: 'absolute',
            bottom: '21.5%',
            right: '6%',
            fontSize: 10.5,
            color: '#000'
          }}
        >
          {data.issueDate.replace(/\//g, '')}
        </div>

      </div>
    </div>
  );
};


// ================= HELPERS =================

const dateToDDMMYYYY = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const ddmmyyyyToISO = (ddmm: string) => {
  const p = ddmm.split('/');
  if (p.length !== 3) return '';
  return `${p[2]}-${p[1]}-${p[0]}`;
};

const handlePanFormat = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const Field = ({ label, value, onChange, placeholder, error }: any) => (
  <div className="flex flex-col space-y-2 w-full">
    <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-slate-800/70 w-full border text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 placeholder:text-slate-500 ${error ? 'border-red-500/70' : 'border-slate-600/50'}`}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

const ActionBtn = ({ onClick, children, className = '' }: any) => (
  <button
    onClick={onClick}
    className={`bg-slate-700/50 hover:bg-slate-600/70 text-orange-300 hover:text-orange-200 text-[10px] sm:text-xs font-semibold px-3 py-2 rounded transition-colors flex justify-center items-center ${className}`}
  >
    {children}
  </button>
);


// ================= PAGE =================

export default function PanGeneratorPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  const [data, setData] = useState<PanData>({
    name: 'PARTH BHANDERI',
    fatherName: 'RAMESHBHAI BHANDERI',
    dob: '26/06/2005',
    panNumber: 'HJKPB7081Q',
    signature: 'Parth Bhanderi',
    issueDate: '05/08/2023',
  });

  const set = (k: keyof PanData) => (v: string) => setData((d) => ({ ...d, [k]: v }));

  const generatePan = () => {
    const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', N = '0123456789';
    const r = (n: number, s: string) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join('');
    
    // Extract initials from name (4th letter = First name initial, 5th letter = Surname initial)
    const nameParts = data.name.trim().split(/\s+/);
    const pStatus = 'P'; // 4th letter for Individual is 'P' in Indian PAN format
    const surnameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : (nameParts[0] ? nameParts[0][0].toUpperCase() : 'A');
    
    // In actual PAN, 4th letter is Status (P), user specifically requested first letter of first name for 4th letter and first letter of last name for 5th
    const firstInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : 'A';
    
    set('panNumber')(`${r(3, L)}${firstInitial}${surnameInitial}${r(4, N)}${r(1, L)}`);
  };

  const generateDob = () => {
    const y = Math.floor(Math.random() * 30) + 1975;
    const m = Math.floor(Math.random() * 12) + 1;
    const d = Math.floor(Math.random() * 28) + 1;
    set('dob')(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`);
  };

  const generateIssueDate = () => {
    const y = Math.floor(Math.random() * 5) + 2019; // Between 2019 and 2023
    const m = Math.floor(Math.random() * 12) + 1;
    const d = Math.floor(Math.random() * 28) + 1;
    set('issueDate')(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`);
  };

  const handleDownload = async () => {
    const el = document.getElementById('pan-card');
    if (!el) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure all assets (fonts, background) are fully painted
      await new Promise(r => setTimeout(r, 200));
      
      const blob = await toJpeg(el, { 
        quality: 0.95, 
        pixelRatio: 3, 
        backgroundColor: '#fff', 
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      }).then(dataUrl => fetch(dataUrl).then(res => res.blob()));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PAN-${data.panNumber}.jpeg`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) { 
      console.error('Download error:', err); 
    } finally { 
      setIsDownloading(false); 
    }
  };

  const onPhotoDrop = useCallback((files: File[]) => {
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target?.result as string);
    reader.readAsDataURL(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onPhotoDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const panError = data.panNumber && !panRegex.test(data.panNumber) ? "Invalid (e.g. ABCDE1234F)" : "";

  return (
    <main className="min-h-screen bg-slate-900 text-white" suppressHydrationWarning>

      {/* NAVBAR */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3 relative">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-[6px] shadow-sm overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold flex items-center gap-2">
                KINGPARTH <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px]">Realism Engine</span>
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Pixel-Perfect Document Mode</p>
            </div>
          </div>

          {/* CENTRAL TABS */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-inner">
            <a href="/" className="px-5 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-colors">
              Aadhaar Card
            </a>
            <div className="px-5 py-1.5 text-xs font-bold rounded-md bg-slate-700 text-white shadow shadow-black/20">
              PAN Card
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScanMode(!scanMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${scanMode ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              <div className={`w-2 h-2 rounded-full ${scanMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              Scan Effect: {scanMode ? 'ON' : 'OFF'}
            </button>
            <a href="/" className="md:hidden text-[10px] bg-slate-800 border border-slate-700 px-2 py-1.5 rounded hover:bg-slate-700 text-white font-semibold">
              <span className="sr-only">Go to </span>Aadhaar
            </a>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 sm:gap-8 relative">

        {/* LEFT: FORM */}
        <div className="flex flex-col space-y-6">
          
          {/* Mobile Preview */}
          <div className="xl:hidden flex flex-col gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</h2>
            <div className="flex flex-col items-center justify-center min-h-[220px]">
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }} className="transition-all duration-300">
                <PanCard data={data} photoSrc={photo} scanMode={scanMode} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6 space-y-6 shadow-xl">
            <h2 className="text-sm font-bold flex items-center gap-2 border-b border-slate-700/50 pb-3">
              <span className="w-5 h-5 bg-gradient-to-r from-orange-500 via-white to-green-600 text-slate-900 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
              Identity Details
            </h2>
            <div className="flex flex-col gap-5">
              <Field label="Full Name" value={data.name} onChange={set('name')} placeholder="e.g. PARTH BHANDERI" />
              <Field label="Father's Name" value={data.fatherName} onChange={set('fatherName')} placeholder="e.g. RAMESHBHAI BHANDERI" />
              <Field label="Signature Text" value={data.signature} onChange={set('signature')} placeholder="e.g. Parth Bhanderi" />

              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">Date of Birth</label>
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_135px_auto] gap-2 items-center">
                  <input type="text" value={data.dob} onChange={(e) => set('dob')(e.target.value)} placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 order-1" />
                  <input type="date" value={ddmmyyyyToISO(data.dob)} onChange={(e) => set('dob')(dateToDDMMYYYY(e.target.value))}
                    className="w-full col-span-2 sm:col-span-1 bg-slate-800/70 border border-slate-600/50 text-white rounded-lg px-2 py-2 min-h-[44px] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert order-3 sm:order-2" />
                  <ActionBtn onClick={generateDob} className="min-h-[44px] order-2 sm:order-3">🎲 Gen</ActionBtn>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">Issue Date</label>
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_135px_auto] gap-2 items-center">
                  <input type="text" value={data.issueDate} onChange={(e) => set('issueDate')(e.target.value)} placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 order-1" />
                  <input type="date" value={ddmmyyyyToISO(data.issueDate)} onChange={(e) => set('issueDate')(dateToDDMMYYYY(e.target.value))}
                    className="w-full col-span-2 sm:col-span-1 bg-slate-800/70 border border-slate-600/50 text-white rounded-lg px-2 py-2 min-h-[44px] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert order-3 sm:order-2" />
                  <ActionBtn onClick={generateIssueDate} className="min-h-[44px] order-2 sm:order-3">🎲 Gen</ActionBtn>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">PAN Number</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input type="text" value={data.panNumber} onChange={(e) => set('panNumber')(handlePanFormat(e.target.value))} placeholder="ABCDE1234F"
                    className={`bg-slate-800/70 border text-white rounded-lg px-3 py-2 min-h-[44px] focus:outline-none font-mono tracking-widest uppercase w-full ${panError ? 'border-red-500/70' : 'border-slate-600/50'}`} />
                  <ActionBtn onClick={generatePan} className="min-h-[44px]">🎲 Gen ID</ActionBtn>
                </div>
                {panError && <span className="text-xs text-red-400">{panError}</span>}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-5 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Portrait Photo</h2>
            <div {...getRootProps()} className={`border border-dashed rounded-lg h-36 flex items-center justify-center cursor-pointer p-2 ${isDragActive ? 'border-orange-400 bg-orange-900/20' : 'border-slate-600 hover:border-orange-600 bg-slate-900/50'}`}>
              <input {...getInputProps()} />
              {photo ? (
                <img src={photo} alt="Portrait" className="h-full w-auto aspect-[3/4] object-cover rounded shadow-md" />
              ) : (
                <div className="text-center text-slate-400 text-[11px] font-medium">Click or drag image file here</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CARD PREVIEW (Desktop only) */}
        <div className="hidden xl:flex flex-col gap-4 items-start sticky top-[100px] self-start w-[450px]">
          <div className="flex items-center justify-between w-full max-w-[450px]">
            <h2 className="text-sm font-bold uppercase tracking-wider">Document Simulation</h2>
            <button onClick={handleDownload} disabled={isDownloading}
              className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-white flex items-center gap-1.5 bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isDownloading ? 'Encoding...' : 'Export High-Res'}
            </button>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-[480px] flex justify-center items-center h-auto mt-2">
            <div className="sm:scale-100 scale-[0.85] origin-center transition-transform hover:scale-[1.02] duration-500">
              <PanCard data={data} photoSrc={photo} scanMode={scanMode} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}