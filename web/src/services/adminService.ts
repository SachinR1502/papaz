import apiClient from './apiClient';

export const adminService = {
    getDashboard: async (period: string = 'week') => {
        const response = await apiClient.get(`/admin/dashboard?period=${period}`);
        return response.data;
    },

    getReports: async (period: string = '7') => {
        const response = await apiClient.get(`/admin/reports?period=${period}`);
        return response.data;
    },

    getAllUsers: async (params?: any) => {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    },

    getPendingUsers: async () => {
        const response = await apiClient.get('/admin/users/pending');
        return response.data;
    },

    approveUser: async (id: string, type: 'technician' | 'supplier') => {
        const response = await apiClient.post(`/admin/users/${id}/approve`, { type });
        return response.data;
    },

    rejectUser: async (id: string, type: 'technician' | 'supplier', reason: string) => {
        const response = await apiClient.post(`/admin/users/${id}/reject`, { type, reason });
        return response.data;
    },

    getAllJobs: async (params?: any) => {
        const response = await apiClient.get('/admin/jobs', { params });
        return response.data;
    },

    getJobDetails: async (id: string) => {
        const response = await apiClient.get(`/admin/jobs/${id}`);
        return response.data;
    },

    cancelJob: async (id: string, reason: string) => {
        const response = await apiClient.post(`/admin/jobs/${id}/cancel`, { reason });
        return response.data;
    },

    getAllTransactions: async (params?: any) => {
        const response = await apiClient.get('/admin/transactions', { params });
        return response.data;
    },

    getSettings: async () => {
        const response = await apiClient.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settings: any) => {
        const response = await apiClient.put('/admin/settings', settings);
        return response.data;
    }
};
