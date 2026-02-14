import apiClient from './apiClient';

export const adminService = {
    getDashboard: async () => {
        const response = await apiClient.get('/admin/dashboard');
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

    getAllTransactions: async (params?: any) => {
        const response = await apiClient.get('/admin/transactions', { params });
        return response.data;
    }
};
