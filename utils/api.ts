const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface UploadResponse {
    success: boolean;
    filePath: string;
    originalName: string;
    mimeType: string;
    size: number;
}

export interface PersonaData {
    id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    idNumber: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    nationality: string;
    email: string;
    phone: string;
}

export interface GeneratePersonaResponse {
    success: boolean;
    persona: PersonaData;
    outputPath: string;
    downloadUrl: string;
    format: 'png' | 'pdf';
}

export interface TemplateInfo {
    id: string;
    name: string;
    description?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const uploadPhoto = async (file: File): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('photo', file);
    const res = await fetch(`${API_BASE}/upload-photo`, { method: 'POST', body: form });
    if (!res.ok) throw new Error((await res.json()).error || 'Photo upload failed');
    return res.json();
};

export const uploadTemplate = async (file: File): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('template', file);
    const res = await fetch(`${API_BASE}/upload-template`, { method: 'POST', body: form });
    if (!res.ok) throw new Error((await res.json()).error || 'Template upload failed');
    return res.json();
};

export const generatePersona = async (payload: {
    photoPath: string;
    templatePath: string;
    templateSchema: string;
    outputFormat: 'png' | 'pdf';
}): Promise<GeneratePersonaResponse> => {
    const res = await fetch(`${API_BASE}/generate-persona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
    return res.json();
};

export const fetchTemplates = async (): Promise<TemplateInfo[]> => {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error('Failed to load templates');
    const data = await res.json();
    return data.templates;
};

export const getDownloadUrl = (downloadUrl: string): string =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${downloadUrl}`;
