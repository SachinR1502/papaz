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

    // Prepend base URL (removing /api/ from the end of API_URL)
    const baseUrl = (API_URL || '').replace(/\/api\/?$/, '');
    if (!baseUrl && !uri.startsWith('http')) {
        console.warn('[getMediaUrl] No baseUrl available, returning original URI:', uri);
        return uri; // Fallback to original if we can't resolve
    }

    let cleanUri = uri.startsWith('/') ? uri : `/${uri}`;

    // Handle old flat structure: if path is /uploads/file.ext (no subdirectory)
    // Try to infer the subdirectory from file extension
    if (cleanUri.match(/^\/uploads\/[^\/]+\.(m4a|mp3|wav|aac)$/i)) {
        // Audio file in old format, try new format
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/audio/${filename}`;
        console.log('[getMediaUrl] Converted audio path:', { original: uri, converted: cleanUri });
    } else if (cleanUri.match(/^\/uploads\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        // Image file in old format
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/images/${filename}`;
        console.log('[getMediaUrl] Converted image path:', { original: uri, converted: cleanUri });
    } else if (cleanUri.match(/^\/uploads\/[^\/]+\.(mp4|mov|avi)$/i)) {
        // Video file in old format
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/videos/${filename}`;
        console.log('[getMediaUrl] Converted video path:', { original: uri, converted: cleanUri });
    } else if (cleanUri.match(/^\/uploads\/[^\/]+\.(pdf|doc|docx)$/i)) {
        // Document file in old format
        const filename = cleanUri.split('/').pop();
        cleanUri = `/uploads/documents/${filename}`;
        console.log('[getMediaUrl] Converted document path:', { original: uri, converted: cleanUri });
    }

    const fullUrl = `${baseUrl}${cleanUri}`;

    console.log('[getMediaUrl] Resolved:', { original: uri, baseUrl, fullUrl });
    return fullUrl;
};

/**
 * Parses a description string to extract media URIs and clean text.
 * Handles the format [PhotoURI:...] and [VoiceURI:...] and [Photo Attached] etc.
 */
export const parseDescription = (rawDescription: string | null | undefined) => {
    const fullDesc = rawDescription || '';

    // Extract URIs
    const photoMatch = fullDesc.match(/\[PhotoURI:(.*?)\]/);
    const voiceMatch = fullDesc.match(/\[VoiceURI:(.*?)\]/);

    const photoUri = photoMatch ? photoMatch[1] : null;
    const voiceUri = voiceMatch ? voiceMatch[1] : null;

    // Clean tags
    const cleanText = (text: string) => text
        .replace(/\[PhotoURI:.*?\]/g, '')
        .replace(/\[VoiceURI:.*?\]/g, '')
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
        hasPhoto: !!photoUri || fullDesc.includes('[Photo Attached]'),
        hasVoice: !!voiceUri || fullDesc.includes('[Voice Note]')
    };
};
