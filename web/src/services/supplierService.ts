import apiClient from './apiClient';

export const supplierService = {
    getDashboard: async () => {
        const response = await apiClient.get('/supplier/dashboard');
        return response.data;
    },

    getInventory: async () => {
        const response = await apiClient.get('/supplier/inventory');
        return response.data;
    },

    getOrders: async () => {
        const response = await apiClient.get('/supplier/orders');
        return response.data;
    },

    getWholesaleOrders: async () => {
        const response = await apiClient.get('/supplier/wholesale/orders');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await apiClient.put('/supplier/profile', data);
        return response.data;
    },

    addProduct: async (data: any) => {
        const response = await apiClient.post('/supplier/inventory', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await apiClient.put(`/supplier/inventory/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await apiClient.delete(`/supplier/inventory/${id}`);
        return response.data;
    },

    updateOrderStatus: async (orderId: string, status: string, data?: any) => {
        const response = await apiClient.put(`/supplier/orders/${orderId}/status`, { status, ...data });
        return response.data;
    },

    sendQuotation: async (orderId: string, items: any[], totalAmount?: number) => {
        const response = await apiClient.post(`/supplier/orders/${orderId}/quotation`, { items, totalAmount });
        return response.data;
    },

    getWallet: async () => {
        const response = await apiClient.get('/supplier/wallet');
        return response.data;
    },

    requestWithdrawal: async (amount: number, bankAccountId?: string) => {
        const response = await apiClient.post('/supplier/wallet/withdraw', { amount, bankAccountId });
        return response.data;
    },

    getNotifications: async () => {
        const response = await apiClient.get('/supplier/notifications');
        return response.data;
    },

    markNotificationRead: async (id: string) => {
        const response = await apiClient.put(`/supplier/notifications/${id}/read`);
        return response.data;
    },

    clearNotifications: async () => {
        const response = await apiClient.delete('/supplier/notifications');
        return response.data;
    }
};
