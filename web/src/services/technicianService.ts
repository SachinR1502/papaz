import apiClient from './apiClient';

export const technicianService = {
    getDashboard: async () => {
        const response = await apiClient.get('/technician/jobs');
        return response.data;
    },

    getJobs: async () => {
        const response = await apiClient.get('/technician/jobs');
        return response.data;
    },

    getJob: async (id: string) => {
        const response = await apiClient.get(`/technician/jobs/${id}`);
        return response.data;
    },

    updateJobStatus: async (id: string, status: string, details?: any) => {
        const response = await apiClient.put(`/technician/jobs/${id}/status`, { status, ...details });
        return response.data;
    },

    getInventory: async () => {
        const response = await apiClient.get('/technician/inventory');
        return response.data;
    },

    getWallet: async () => {
        const response = await apiClient.get('/technician/wallet');
        return response.data;
    }
};
