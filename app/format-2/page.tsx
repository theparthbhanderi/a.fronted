'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toBlob } from 'html-to-image';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PanData {
  name: string;
  fatherName: string;
  dob: string;
  panNumber: string;
}

// ─── Pan Card Overlay Engine ──────────────────────────────────────────────────
const PanCard = ({ data, photoSrc, signatureSrc }: { data: PanData, photoSrc: string | null, signatureSrc: string | null }) => (
  <div 
    id="pan-card"
    style={{
      width: 420, height: 265, position: 'relative', overflow: 'hidden',
      fontFamily: '"Times New Roman", Times, serif',
      // Print Realism Filter directly integrated per specification
      filter: 'contrast(0.98) brightness(0.98)'
    }}
    className="bg-white rounded-[6px] shadow-sm select-none"
  >
    {/* Base Background Image Layer */}
    <img 
       src="/images/PAN FORMAT.jpeg" 
       alt="PAN Background Template" 
       style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 0 }}
    />

    {/* Realism Noise Overlay */}
    <div style={{
       position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'multiply',
       background: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
       zIndex: 1, pointerEvents: 'none'
    }}></div>

    {/* Data Absolute Overlay Layer (Z-index 10) */}
    <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
        
        {/* Photo Box */}
        {photoSrc ? (
            <img 
               src={photoSrc} 
               alt="Photo"
               style={{ 
                   position: 'absolute', top: 92, left: 24, width: 73, height: 95, 
                   objectFit: 'cover', filter: 'contrast(0.95) saturate(0.9)',
               }} 
            />
        ) : (
            <div style={{ position: 'absolute', top: 92, left: 24, width: 73, height: 95, background: 'rgba(0,0,0,0.05)' }} />
        )}

        {/* Signature Box */}
        {signatureSrc ? (
            <img 
               src={signatureSrc} 
               alt="Signature"
               style={{ position: 'absolute', top: 195, left: 16, width: 88, height: 26, objectFit: 'contain' }} 
            />
        ) : (
            <div style={{ position: 'absolute', top: 195, left: 16, width: 88, height: 26, background: 'rgba(0,0,0,0.02)' }} />
        )}

        {/* Full Name */}
        <div style={{ position: 'absolute', top: 88, left: 126, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3, color: '#000', textTransform: 'uppercase' }}>
            {data.name}
        </div>

        {/* Father's Name */}
        <div style={{ position: 'absolute', top: 122, left: 126, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3, color: '#000', textTransform: 'uppercase' }}>
            {data.fatherName}
        </div>

        {/* DOB */}
        <div style={{ position: 'absolute', top: 154, left: 126, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3, color: '#000' }}>
            {data.dob}
        </div>

        {/* PAN Number */}
        <div style={{ position: 'absolute', top: 183, left: 126, fontSize: 19.5, fontWeight: 900, fontFamily: '"Courier New", Courier, monospace', letterSpacing: 1.8, color: '#000' }}>
            {data.panNumber}
        </div>
    </div>
  </div>
);


// ─── Helpers ──────────────────────────────────────────────────────────────────
// Format date from input[type=date] to DD/MM/YYYY
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

// Parse raw text into secure PAN pattern constraints
const handlePanFormat = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;


// ─── Field Component ─────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, error }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; }) => (
  <div className="flex flex-col space-y-2 w-full">
    <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-slate-800/70 w-full border text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 placeholder:text-slate-500 ${error ? 'border-red-500/70' : 'border-slate-600/50'}`}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, children, className = '' }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    onClick={onClick}
    className={`bg-slate-700/50 hover:bg-slate-600/70 text-orange-300 hover:text-orange-200 text-[10px] sm:text-xs font-semibold px-3 py-2 rounded transition-colors flex justify-center items-center ${className}`}
  >
    {children}
  </button>
);


// ─── Main Page Routing ───────────────────────────────────────────────────────
export default function PanGeneratorPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Default seeded mockup state matching precise PAN standard spacing
  const [data, setData] = useState<PanData>({
    name: 'PARTH BHANDERI',
    fatherName: 'JAYANTIBHAI BHANDERI',
    dob: '15/08/1990',
    panNumber: 'ABCDE1234F',
  });

  const set = (k: keyof PanData) => (v: string) => setData((d) => ({ ...d, [k]: v }));

  // Random Data Generation Functions
  const generatePan = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const randStr = (len: number, src: string) => Array.from({ length: len }, () => src[Math.floor(Math.random() * src.length)]).join('');
    set('panNumber')(`${randStr(5, letters)}${randStr(4, numbers)}${randStr(1, letters)}`);
  };

  const getRandomDate = (startYear: number, endYear: number) => {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };
  const generateDob = () => set('dob')(getRandomDate(1975, 2004));

  const handleDownload = async () => {
    const element = document.getElementById('pan-card');
    if (!element) return;

    setIsDownloading(true);
    try {
      const blob = await toBlob(element, {
        pixelRatio: 3, // Premium high-def PNG export scale tailored for printing
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (!blob) return;
      const dataUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUrl;
      link.download = `PAN-${data.panNumber}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(dataUrl);
      }, 400);

    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const panEl = document.getElementById('pan-card');
    if (!panEl) return;

    const printWin = window.open('', '_blank', 'width=500,height=400');
    if (!printWin) return;

    printWin.document.write(`<!DOCTYPE html>
<html><head><title>PAN Card PDF Extract</title>
<style>
  @page { size: 86mm 54mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  .card-page {
    width: 86mm;
    height: 54mm;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
</head><body>
  <div class="card-page">${panEl.outerHTML}</div>
</body></html>`);

    printWin.document.close();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 500);
  };

  const handleDobPick = (iso: string) => set('dob')(dateToDDMMYYYY(iso));

  // ─── Photo Upload Zone ─
  const onPhotoDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);
  const { getRootProps: getPhotoProps, getInputProps: getPhotoInput, isDragActive: isPhotoDrag } = useDropzone({
    onDrop: onPhotoDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  // ─── Signature Upload Zone ─
  const onSignDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSignature(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);
  const { getRootProps: getSignProps, getInputProps: getSignInput, isDragActive: isSignDrag } = useDropzone({
    onDrop: onSignDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  // Error boundary logic
  const panError = data.panNumber && !panRegex.test(data.panNumber) ? "Invalid format (e.g. ABCDE1234F)" : "";

  return (
    <main className="min-h-screen bg-slate-900 text-white" suppressHydrationWarning>

      {/* ─── Sticky Navbar ─── */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[420px] xl:max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 bg-white rounded-[6px] shadow-sm overflow-hidden">
                <img src="/logo.png" alt="KINGPARTH Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  KINGPARTH <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px]">PAN Format</span>
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] sm:text-xs text-emerald-400 font-semibold">Pixel-Perfect Engine</p>
                  <a href="/" className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded hover:bg-slate-700 transition-colors text-white whitespace-nowrap">Switch to Aadhaar</a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto mt-3 sm:mt-0">
            <button
              onClick={handlePrint}
              className="w-full justify-center bg-gradient-to-r from-orange-500 via-white to-green-600 !text-slate-900 border-none font-bold text-white text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all flex items-center gap-1.5 print:hidden sm:w-auto hover:scale-[0.98]"
            >
              Export PDF Layout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:flex lg:gap-8 relative overflow-x-hidden">
        {/* ─── Left Box: Interactive Form Control ─── */}
        <div className="flex flex-col space-y-6 flex-1 w-full lg:max-w-xl">
          
          <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 sm:p-6 space-y-6 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/50 pb-3">
              <span className="w-5 h-5 bg-gradient-to-r from-orange-500 via-white to-green-600 !text-slate-900 border-none rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
              Identity Details
            </h2>

            <div className="flex flex-col gap-5">
              <Field label="Full Name" value={data.name} onChange={set('name')} placeholder="e.g. JOHN DOE" />
              <Field label="Father's Name" value={data.fatherName} onChange={set('fatherName')} placeholder="e.g. RICHARD DOE" />

              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">Date of Birth</label>
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_135px_auto] gap-2 items-center w-full">
                  <input
                    type="text"
                    value={data.dob}
                    onChange={(e) => set('dob')(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 order-1"
                  />
                  <input
                    type="date"
                    value={ddmmyyyyToISO(data.dob)}
                    onChange={(e) => handleDobPick(e.target.value)}
                    className="w-full col-span-2 sm:col-span-1 bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-2 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert order-3 sm:order-2"
                  />
                  <ActionBtn onClick={generateDob} className="min-h-[44px] order-2 sm:order-3">🎲 Gen</ActionBtn>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label className="text-sm font-semibold text-orange-300 uppercase tracking-wide">PAN Number</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center w-full">
                  <input
                    type="text"
                    value={data.panNumber}
                    onChange={(e) => set('panNumber')(handlePanFormat(e.target.value))}
                    placeholder="ABCDE1234F"
                    className={`bg-slate-800/70 border text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-orange-500 font-mono tracking-widest uppercase w-full ${panError ? 'border-red-500/70' : 'border-slate-600/50'}`}
                  />
                  <ActionBtn onClick={generatePan} className="min-h-[44px]">🎲 Gen ID</ActionBtn>
                </div>
                {panError && <span className="text-xs text-red-400">{panError}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 sm:p-5 shadow-xl">
              <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-300">Portrait Photo</h2>
              <div {...getPhotoProps()} className={`border border-dashed rounded-lg h-36 flex items-center justify-center cursor-pointer transition-all p-2 ${isPhotoDrag ? 'border-orange-400 bg-orange-900/20' : 'border-slate-600 hover:border-orange-600 bg-slate-900/50'}`}>
                <input {...getPhotoInput()} />
                {photo ? (
                  <img src={photo} alt="Portrait" className="h-full w-auto aspect-[3/4] object-cover rounded shadow-md" />
                ) : (
                  <div className="text-center text-slate-400 text-[11px] px-2 font-medium">Click or drag image file here</div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 sm:p-5 shadow-xl">
              <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-300">Digital Signature</h2>
              <div {...getSignProps()} className={`border border-dashed rounded-lg h-36 flex items-center justify-center cursor-pointer transition-all p-2 ${isSignDrag ? 'border-orange-400 bg-orange-900/20' : 'border-slate-600 hover:border-orange-600 bg-slate-900/50'}`}>
                <input {...getSignInput()} />
                {signature ? (
                  <img src={signature} alt="Sign" className="max-h-full max-w-full object-contain filter drop-shadow hover:scale-105 transition-transform" />
                ) : (
                  <div className="text-center text-slate-400 text-[11px] px-2 font-medium">Click or drop transparent PNG text here</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ─── Right Box: Live Card Preview / Sticky ─── */}
        <div className="flex flex-col gap-4 items-start lg:sticky lg:top-[100px] self-start z-10 w-full lg:w-auto mt-8 lg:mt-0 pb-20 lg:pb-0 relative overflow-hidden">
          <div className="flex items-center justify-between w-full max-w-[450px]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Document Render</h2>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-white transition-colors flex items-center gap-1.5 bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-500/30"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isDownloading ? 'Encoding PNG...' : 'Download Mockup'}
            </button>
          </div>

          <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[480px] flex justify-center items-center overflow-x-auto min-h-[320px] relative mt-2">
             <div className="scale-[0.85] sm:scale-100 transform origin-center transition-transform hover:scale-105 duration-500 will-change-transform">
               <PanCard data={data} photoSrc={photo} signatureSrc={signature} />
             </div>
          </div>
        </div>

      </div>
      
    </main>
  );
}