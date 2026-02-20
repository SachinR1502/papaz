import apiClient from './apiClient';

export interface UploadResult {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
    category: 'images' | 'videos' | 'audio' | 'documents';
}

export const uploadService = {
    uploadFile: async (file: File): Promise<UploadResult> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload', formData);
        return response.data;
    },

    uploadMultiple: async (files: File[]): Promise<UploadResult[]> => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await apiClient.post('/upload/bulk', formData);
        return response.data;
    }
};