import { API_URL } from '@/services/apiClient';

/**
 * Resolves a media URI (relative path from server) to a full URL.
 * Handles both old flat structure (/uploads/file.ext) and new organized structure (/uploads/type/file.ext)
 */
export const getMediaUrl = (uri: string | null | undefined) => {
    if (!uri) return null;
    if (uri.startsWith('http') || uri.startsWith('file') || uri.startsWith('content')) {
        return uri;
    }

    // Prepend base URL (removing /api from end if exists to avoid doubling)
    let baseUrl = (API_URL || '').replace(/\/api\/?$/, '');
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    if (!baseUrl && !uri.startsWith('http')) {
        console.warn('[getMediaUrl] No baseUrl available, returning original URI:', uri);
        return uri;
    }

    let cleanUri = uri.startsWith('/') ? uri : `/${uri}`;

    // Handle old flat structure: if path is /uploads/file.ext (no subdirectory)
    if (cleanUri.match(/^\/uploads\/[^\/]+\.(m4a|mp3|wav|aac)$/i)) {
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/audio/${filename}`;
    } else if (cleanUri.match(/^\/uploads\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/images/${filename}`;
    } else if (cleanUri.match(/^\/uploads\/[^\/]+\.(mp4|mov|avi)$/i)) {
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/videos/${filename}`;
    } else if (cleanUri.match(/^\/uploads\/[^\/]+\.(pdf|doc|docx)$/i)) {
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/documents/${filename}`;
    }

    // Combine baseUrl and cleanUri, ensuring exactly one slash between them
    const fullUrl = `${baseUrl}${cleanUri}`;

    // console.log('[getMediaUrl] Resolved:', { original: uri, baseUrl, fullUrl });
    return fullUrl;
};

/**
 * Parses a description string to extract media URIs and clean text.
 * Handles the format [PhotoURI:...] and [VoiceURI:...] and [Photo Attached] etc.
 */
export const parseDescription = (rawDescription: string | null | undefined) => {
    const fullDesc = rawDescription || '';

    // Extract ALL URIs
    const photoUris: string[] = [];
    const photoRegex = /\[PhotoURI:(.*?)\]/g;
    let pMatch;
    while ((pMatch = photoRegex.exec(fullDesc)) !== null) {
        const url = getMediaUrl(pMatch[1]);
        if (url) photoUris.push(url);
    }

    const voiceUris: string[] = [];
    const voiceRegex = /\[VoiceURI:(.*?)\]/g;
    let vMatch;
    while ((vMatch = voiceRegex.exec(fullDesc)) !== null) {
        const url = getMediaUrl(vMatch[1]);
        if (url) voiceUris.push(url);
    }

    const photoUri = photoUris.length > 0 ? photoUris[0] : null;
    const voiceUri = voiceUris.length > 0 ? voiceUris[0] : null;

    // Clean tags
    const cleanText = (text: string) => text
        .replace(/\[PhotoURI:.*?\]/g, '')
        .replace(/\[VoiceURI:.*?\]/g, '')
        .replace(/\[Vehicle:.*?\]/g, '')
        .replace(/\[Photo Attached\]/g, '')
        .replace(/\[Voice Note Attached\]/g, '')
        .replace(/\[Voice Note\]/g, '')
        .trim();

    const cleanedDescription = cleanText(fullDesc);

    // Split for display (Name vs Notes)
    // Assumes first line is Name, rest are Notes if newline exists
    const lines = cleanedDescription.split('\n').filter(l => l.trim());
    const displayName = lines.length > 0 ? lines[0] : '';
    const displayNotes = lines.length > 1 ? lines.slice(1).join('\n') : '';

    return {
        original: fullDesc,
        cleaned: cleanedDescription,
        displayName,
        displayNotes,
        photoUri,
        voiceUri,
        photoUris,
        voiceUris,
        hasPhoto: !!photoUri || fullDesc.includes('[Photo Attached]'),
        hasVoice: !!voiceUri || fullDesc.includes('[Voice Note]')
    };
};
