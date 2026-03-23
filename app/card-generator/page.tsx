'use client';

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CardData {
    // Front
    nameLocal: string;
    nameEnglish: string;
    dob: string;
    gender: string;
    genderLocal: string;
    idNumber: string;
    issueDate: string;
    // Back
    addressLocal: string;
    addressEnglish: string;
    vid: string;
    updateDate: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt12 = (n: string) =>
    n.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(\d{4})(\d+)/, '$1 $2 $3');

const fmt16 = (n: string) =>
    n.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(\d{4})(\d{4})(\d+)/, '$1 $2 $3 $4');

// ─── Dynamic QR Code Component ───────────────────────────────────────────────
const DynamicQRCode = ({ data }: { data: CardData }) => {
    // Build an XML-like string similar to the real Aadhaar secure QR code payload
    // We clean up newlines from the address to keep the string dense but valid
    const cleanAddressInfo = data.addressEnglish.replace(/\n/g, ', ');
    const yearOfBirth = data.dob.split('/').pop() || data.dob;

    // Construct Aadhaar-style XML string using form data - expanded for density
    const qrString = `<?xml version="1.0" encoding="UTF-8"?><PrintLetterBarcodeData uid="${data.idNumber.replace(/\D/g, '')}" name="${data.nameEnglish}" gender="${data.gender.charAt(0).toUpperCase()}" yob="${yearOfBirth}" co="${data.nameEnglish}" house="" street="" lm="" loc="" vtc="" dist="Anand" state="Gujarat" pc="364505" dob="${data.dob}" address="${cleanAddressInfo}" />`;

    return (
        <div style={{ width: 135, height: 135, background: '#fff', padding: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QRCodeSVG value={qrString} size={130} level="M" includeMargin={false} />
        </div>
    );
};

// ─── Front Card ───────────────────────────────────────────────────────────────
const FrontCard = ({ data, photoSrc }: { data: CardData; photoSrc: string | null }) => (
    <div style={{
        width: 420, height: 265, background: '#fff',
        border: '1px solid #000',
        fontFamily: 'Arial, Helvetica, sans-serif', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
    }}>
        {/* Header (Fixed Height, completely fills area) */}
        <img
            src="/images/ashoka-emblem.png?v=2"
            alt="Front Header"
            style={{ width: '100%', height: 48.5, objectFit: 'fill', display: 'block', flexShrink: 0 }}
        />

        {/* Body Area (Auto expands and pushes footer down) */}
        <div style={{ display: 'flex', padding: '5px 12px 0 22px', flex: 1 }}>
            {/* Left col: issue date + photo */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    fontSize: 8.5, fontWeight: 'bold', color: '#000', whiteSpace: 'nowrap', marginTop: 5, letterSpacing: 0.5
                }}>
                    Aadhaar no. issued: {data.issueDate}
                </div>
                <div style={{
                    width: 75, height: 95,
                    background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', marginTop: 2, border: '1px solid #aaa'
                }}>
                    {photoSrc ? (
                        <img src={photoSrc} alt="portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 'bold' }}>PHOTO</span>
                    )}
                </div>
            </div>

            {/* Right col: details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 12, paddingTop: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 'bold', color: '#000' }}>{data.nameLocal}</div>
                <div style={{ fontSize: 11.5, color: '#000', marginTop: 1 }}>{data.nameEnglish}</div>

                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#000', marginTop: 3 }}>
                    જન્મ તારીખ/DOB: <span style={{ fontWeight: 'normal' }}>{data.dob}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#000', marginTop: 1 }}>
                    {data.genderLocal}/ <span style={{ fontWeight: 'normal' }}>{data.gender}</span>
                </div>

                {/* Red Disclaimer Box - Perfectly Scaled */}
                <div style={{
                    border: '1px solid #cc3333',
                    padding: '3px 4px',
                    marginTop: 4,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
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

        {/* Aadhaar Number (Perfectly placed above footer) */}
        <div style={{ textAlign: 'center', flexShrink: 0, marginTop: '-3px', marginBottom: '2px' }}>
            <div style={{ fontSize: 24, fontWeight: '900', color: '#000', letterSpacing: 1 }}>
                {fmt12(data.idNumber)}
            </div>
        </div>

        {/* Footer Image with red line above */}
        <div style={{ borderTop: '2px solid #cc3333', flexShrink: 0 }}>
            <img
                src="/images/front-card-logo.png?v=2"
                alt="Front Footer"
                style={{ width: '100%', height: 20, objectFit: 'fill', display: 'block' }}
            />
        </div>
    </div>
);

// ─── Back Card ────────────────────────────────────────────────────────────────
const BackCard = ({ data }: { data: CardData }) => (
    <div style={{
        width: 420, height: 265, background: '#fff',
        border: '1px solid #000',
        fontFamily: 'Arial, Helvetica, sans-serif', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
    }}>
        {/* Header (Fixed Height) */}
        <img
            src="/images/aadhaar-logo.png?v=2"
            alt="Back Header"
            style={{ width: '100%', height: 48.5, objectFit: 'fill', display: 'block', flexShrink: 0 }}
        />

        {/* Body Area */}
        <div style={{ display: 'flex', padding: '6px 15px 0 10px', gap: 10, flex: 1, overflow: 'hidden' }}>
            {/* Left: vertical date + address */}
            <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 0 }}>
                <div style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    fontSize: 8.5, fontWeight: 'bold', color: '#000', whiteSpace: 'nowrap', marginTop: 5, letterSpacing: 0.2
                }}>
                    Details as on: {data.updateDate}
                </div>
                <div style={{ flex: 1, paddingTop: 2, overflow: 'hidden' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 'bold', color: '#000' }}>સરનામું :</div>
                    <div style={{ fontSize: 10.5, color: '#000', lineHeight: 1.3, marginTop: 1, paddingRight: 5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {data.addressLocal}
                    </div>

                    <div style={{ fontSize: 10.5, fontWeight: 'bold', color: '#000', marginTop: 6 }}>Address:</div>
                    <div style={{ fontSize: 10.5, color: '#000', lineHeight: 1.3, marginTop: 1, paddingRight: 5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {data.addressEnglish}
                    </div>
                </div>
            </div>

            {/* Right: QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: 2, flexShrink: 0 }}>
                <DynamicQRCode data={data} />
            </div>
        </div>

        {/* Bottom ID, VID & Footer */}
        <div style={{ textAlign: 'center', marginBottom: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 1 }}>
                {fmt12(data.idNumber)}
            </div>
            {/* Thin line exactly like PDF */}
            <hr style={{ border: 'none', borderTop: '1px dotted #000', margin: '2px auto', width: '230px' }} />
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#000', marginTop: 2, letterSpacing: 0.2 }}>
                VID : {fmt16(data.vid)}
            </div>
        </div>

        {/* Back Footer Wrapper to add the red top border like original */}
        <div style={{ height: 20, width: '100%', borderTop: '2px solid #cc3333', flexShrink: 0 }}>
            <img
                src="/images/back-header-logo.png?v=2"
                alt="Back Footer"
                style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', backgroundColor: '#fff' }}
            />
        </div>
    </div>
);

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, children, className = '' }: { onClick: () => void, children: React.ReactNode, className?: string }) => (
    <button
        onClick={onClick}
        className={`bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-indigo-300 font-bold rounded-lg transition-all active:scale-95 ${className}`}
    >
        {children}
    </button>
);

// ─── Field Input ──────────────────────────────────────────────────────────────
const Field = ({
    label, value, onChange, placeholder, type = 'text', isTextArea = false
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; isTextArea?: boolean
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">{label}</label>
        {isTextArea ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="bg-slate-800/70 border border-slate-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 resize-none"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-slate-800/70 border border-slate-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
        )}
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CardGeneratorPage() {
    const [photo, setPhoto] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
    const [autoTranslate, setAutoTranslate] = useState(true);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Default PDF Data - Exact Match
    const [data, setData] = useState<CardData>({
        nameLocal: 'અમિત વાલજીભાઈ સોલંકી',
        nameEnglish: 'Amit Valjibhai Solanki',
        dob: '01/01/1965',
        gender: 'MALE',
        genderLocal: 'પુરુષ',
        idNumber: '904909189137',
        issueDate: '28/02/2015',
        // Note: Newlines (\n) used to match exact word-wrap from PDF
        addressLocal: 'ઘર નં 72, નર્મદા સોસાયટી માંજલપુર મેઈન રોડ નવસારી, ગુજરાત - 385983',
        addressEnglish: 'House No. 72, Narmada Society Manjalpur Main Road Navsari, Gujarat - 385983',
        vid: '9110500614285534',
        updateDate: '14/11/2025',
    });

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
                pixelRatio: 4,
                backgroundColor: '#ffffff',
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `aadhaar-${side}-${data.idNumber.replace(/\s/g, '')}.png`;
            link.href = dataUrl;
            link.click();
            setIsDownloadModalOpen(false);
        } catch (err) {
            console.error('Download failed', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const previewRef = useRef<HTMLDivElement>(null);
    const set = (k: keyof CardData) => (v: string) => setData((d) => ({ ...d, [k]: v }));

    const onDrop = useCallback((accepted: File[]) => {
        const file = accepted[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setPhoto(e.target?.result as string);
        reader.readAsDataURL(file);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/*': [] }, maxFiles: 1,
    });

    const handlePrint = () => window.print();

    return (
        <main className="min-h-screen bg-slate-900 text-white">
            <style>{`
        @media print {
          body * { visibility: hidden !important; }
          main { background: none !important; }
          #card-preview, #card-preview * { visibility: visible !important; }
          #card-preview { 
              position: absolute !important; 
              top: 0 !important; 
              left: 0 !important; 
              margin: 0 !important;
              padding: 20px !important;
              width: 100% !important;
              background: white !important;
          }
          /* Hide the text labels in print */
          #card-preview > div > p { display: none !important; }
        }
      `}</style>

            <div className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">Aadhaar Format UI Generator</h1>
                            <p className="text-[10px] text-emerald-400 font-semibold">100% Compressed & Perfect Ditto Mode</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 print:hidden"
                    >
                        Save / Print PDF
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 sm:gap-8 relative">
        {/* ─── Left: Input Form ─── */}
        <div className="flex flex-col space-y-6">
                    {/* Premium Mobile Preview (Segmented Control) */}
                    <div className="xl:hidden flex flex-col gap-4 bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</h2>
                            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
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
                                <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }} className="transition-all duration-300">
                                    <FrontCard data={data} photoSrc={photo} />
                                </div>
                            ) : (
                                <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }} className="transition-all duration-300">
                                    <BackCard data={data} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
                            Upload Portrait Photo
                        </h2>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl min-h-[100px] flex items-center justify-center gap-3 cursor-pointer transition-all p-4
                ${isDragActive ? 'border-indigo-400 bg-indigo-900/20' : 'border-slate-600 hover:border-indigo-600 bg-slate-900/50'}`}
                        >
                            <input {...getInputProps()} />
                            {photo ? (
                                <div className="flex items-center gap-4">
                                    <img src={photo} alt="Preview" className="h-20 w-16 object-cover rounded-lg border border-slate-500" />
                                    <p className="text-xs text-slate-400">Click or drop to replace</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">Drag & drop or click to upload portrait</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                                Front Card Details
                            </h2>
                            <button 
                                onClick={() => setAutoTranslate(!autoTranslate)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${autoTranslate ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${autoTranslate ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{autoTranslate ? 'Auto-Translate ON' : 'Manual Mode'}</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field 
                                label="Name (English)" 
                                value={data.nameEnglish} 
                                onChange={(v) => {
                                    set('nameEnglish')(v);
                                    if (autoTranslate) transliterate(v, 'name');
                                }} 
                            />
                            <Field label="Name (Gujarati)" value={data.nameLocal} onChange={set('nameLocal')} />
                            <Field label="Date of Birth" value={data.dob} onChange={set('dob')} />
                            <Field label="Gender" value={data.gender} onChange={set('gender')} />
                            <Field label="Gender (Gujarati)" value={data.genderLocal} onChange={set('genderLocal')} />
                            <Field label="12-Digit ID Number" value={data.idNumber} onChange={set('idNumber')} />
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Issue Date</label>
                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                    <input
                                        type="text"
                                        value={data.issueDate}
                                        onChange={(e) => set('issueDate')(e.target.value)}
                                        placeholder="DD/MM/YYYY"
                                        className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                                    />
                                    <ActionBtn onClick={generateIssueDate} className="min-h-[44px] px-3 text-[10px]">🎲 Gen</ActionBtn>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
                            Back Card Details
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
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
                            <Field label="16-Digit Virtual ID (VID)" value={data.vid} onChange={set('vid')} />
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Last Updated Date</label>
                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                    <input
                                        type="text"
                                        value={data.updateDate}
                                        onChange={(e) => set('updateDate')(e.target.value)}
                                        placeholder="DD/MM/YYYY"
                                        className="w-full bg-slate-800/70 border border-slate-600/50 text-white text-base rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                                    />
                                    <ActionBtn onClick={generateUpdateDate} className="min-h-[44px] px-3 text-[10px]">🎲 Gen</ActionBtn>
                                </div>
                            </div>
                    </div>
                </div>
            </div>

                <div className="hidden xl:flex flex-col gap-5 items-start sticky top-24 self-start">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white">Live Preview</h2>
                            <span className="text-[10px] bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 px-2 py-0.5 rounded-full">Perfect Ditto</span>
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
                            <FrontCard data={data} photoSrc={photo} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 mb-1.5 ml-1 uppercase tracking-widest font-semibold">— Back</p>
                            <BackCard data={data} />
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