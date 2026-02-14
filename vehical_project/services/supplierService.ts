import api from './apiClient';

export const supplierService = {
    getDashboard: async () => {
        const response = await api.get('/supplier/dashboard');
        return response.data;
    },

    getNotifications: async () => {
        const response = await api.get('/supplier/notifications');
        return response.data;
    },

    markNotificationRead: async (id: string) => {
        const response = await api.put(`/supplier/notifications/${id}/read`);
        return response.data;
    },

    clearAllNotifications: async () => {
        const response = await api.delete('/supplier/notifications');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/supplier/profile', data);
        return response.data;
    },

    getInventory: async () => {
        const response = await api.get('/supplier/inventory');
        return response.data;
    },

    addProduct: async (data: any) => {
        const response = await api.post('/supplier/inventory', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await api.put(`/supplier/inventory/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await api.delete(`/supplier/inventory/${id}`);
        return response.data;
    },

    getOrders: async () => {
        const response = await api.get('/supplier/orders');
        return response.data;
    },

    updateOrderStatus: async (id: string, status: string, data?: any) => {
        const response = await api.put(`/supplier/orders/${id}/status`, { status, ...data });
        return response.data;
    },

    getWholesaleOrders: async () => {
        const response = await api.get('/supplier/wholesale/orders');
        return response.data;
    },

    sendQuotation: async (id: string, items: any[], totalAmount?: number) => {
        const response = await api.post(`/supplier/orders/${id}/quotation`, { items, totalAmount });
        return response.data;
    },

    // Wallet & Payments
    getWallet: async () => {
        const response = await api.get('/supplier/wallet');
        return response.data;
    },

    getEarningsSummary: async () => {
        const response = await api.get('/supplier/wallet/earnings');
        return response.data;
    },

    requestWithdrawal: async (amount: number, bankAccountId?: string) => {
        const response = await api.post('/supplier/wallet/withdraw', { amount, bankAccountId });
        return response.data;
    },

    addBankAccount: async (data: any) => {
        const response = await api.post('/supplier/wallet/bank-account', data);
        return response.data;
    },

    getBankAccounts: async () => {
        const response = await api.get('/supplier/wallet/bank-accounts');
        return response.data;
    },

    getDevices: async () => {
        const response = await api.get('/supplier/devices');
        return response.data;
    },

    removeDevice: async (deviceId: string) => {
        const response = await api.delete(`/supplier/devices/${deviceId}`);
        return response.data;
    }
};
