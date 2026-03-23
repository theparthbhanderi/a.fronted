'use client';

import { PersonaData } from '@/utils/api';

interface PersonaPreviewProps {
    persona: PersonaData;
    format: 'png' | 'pdf';
    onDownload: () => void;
}

const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="field-badge flex flex-col gap-0.5">
        <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-sm text-white font-medium">{value}</span>
    </div>
);

export default function PersonaPreview({ persona, format, onDownload }: PersonaPreviewProps) {
    return (
        <div className="glass-card p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold gradient-text">Generated Persona</h3>
                    <p className="text-xs text-orange-300 mt-0.5">Synthetic • Fictional • Not a real person</p>
                </div>
                <span className="watermark-badge">Mock Data</span>
            </div>

            {/* Main identity */}
            <div className="rounded-xl bg-orange-950/40 border border-orange-800/30 p-4 flex flex-col gap-1">
                <p className="text-2xl font-bold text-white">{persona.fullName}</p>
                <p className="text-sm text-orange-300">{persona.gender} · Age {persona.age} · {persona.nationality}</p>
                <p className="text-xs font-mono text-orange-400 mt-1">
                    ID: <span className="text-orange-200 font-semibold">{persona.idNumber}</span>
                </p>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-2">
                <Field label="Date of Birth" value={persona.dateOfBirth} />
                <Field label="Phone" value={persona.phone} />
                <Field label="Email" value={persona.email} />
                <Field label="City" value={persona.address.city} />
                <Field label="State" value={persona.address.state} />
                <Field label="Country" value={persona.address.country} />
            </div>

            {/* Address full */}
            <div className="field-badge">
                <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">Full Address</span>
                <p className="text-sm text-white mt-0.5">
                    {persona.address.street}, {persona.address.city}, {persona.address.state} {persona.address.postalCode}, {persona.address.country}
                </p>
            </div>

            {/* Download */}
            <button
                onClick={onDownload}
                className="glow-btn w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {format.toUpperCase()} Document
            </button>

            {/* Disclaimer */}
            <p className="text-[10px] text-center text-orange-400/60 leading-relaxed">
                ⚠ This identity is entirely synthetic and fictional. Generated for UI testing and demos only.
                Do not use for any fraudulent or deceptive purpose.
            </p>
        </div>
    );
}
