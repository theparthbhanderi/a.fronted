'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface DropZoneProps {
    label: string;
    sublabel: string;
    accept: Record<string, string[]>;
    onFile: (file: File, preview?: string) => void;
    icon: React.ReactNode;
    preview?: string | null;
    acceptLabel: string;
}

export default function DropZone({
    label, sublabel, accept, onFile, icon, preview, acceptLabel
}: DropZoneProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (accepted: File[], rejected: FileRejection[]) => {
            setError(null);
            if (rejected.length > 0) {
                setError(rejected[0].errors[0]?.message || 'File not accepted');
                return;
            }
            if (accepted[0]) {
                const file = accepted[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => onFile(file, e.target?.result as string);
                    reader.readAsDataURL(file);
                } else {
                    onFile(file);
                }
            }
        },
        [onFile]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
    });

    return (
        <div className="flex flex-col gap-2">
            <div
                {...getRootProps()}
                className={`dropzone glass-card border-2 border-dashed cursor-pointer min-h-[180px] flex flex-col items-center justify-center gap-3 p-6 transition-all
          ${isDragActive ? 'dropzone-active border-orange-500' : 'border-orange-900/50 hover:border-orange-600'}`}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={preview}
                            alt="Preview"
                            className="rounded-lg max-h-[130px] object-contain border border-orange-500/30"
                        />
                        <p className="text-xs text-orange-300">Click or drop to replace</p>
                    </div>
                ) : (
                    <>
                        <div className="text-orange-400 opacity-70">{icon}</div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-white">
                                {isDragActive ? 'Drop it here!' : label}
                            </p>
                            <p className="text-xs text-orange-300 mt-1">{sublabel}</p>
                            <p className="mt-2 text-[11px] text-orange-400/70 font-mono">{acceptLabel}</p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/30 px-3 py-2 rounded-lg">
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}
