import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api, { API_URL } from './apiClient';
import { PartRequestData } from './customerService';

export const technicianService = {
    getProfile: async () => {
        const response = await api.get('/technician/profile');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/technician/profile', data);
        return response.data;
    },

    getJobs: async () => {
        const response = await api.get('/technician/jobs');
        return response.data; // Returns { available: [], myJobs: [] }
    },

    getNotifications: async () => {
        const response = await api.get('/technician/notifications');
        return response.data;
    },

    markNotificationRead: async (id: string) => {
        const response = await api.put(`/technician/notifications/${id}/read`);
        return response.data;
    },

    clearAllNotifications: async () => {
        const response = await api.delete('/technician/notifications');
        return response.data;
    },

    getJob: async (jobId: string) => {
        const response = await api.get(`/technician/jobs/${jobId}`);
        return response.data;
    },

    acceptJob: async (jobId: string) => {
        const response = await api.post(`/technician/jobs/${jobId}/accept`);
        return response.data;
    },

    cancelJob: async (jobId: string, reason: string) => {
        const response = await api.post(`/technician/jobs/${jobId}/cancel`, { reason });
        return response.data;
    },

    updateJobStatus: async (jobId: string, status: string) => {
        const response = await api.put(`/technician/jobs/${jobId}/status`, { status });
        return response.data;
    },

    markArrived: async (jobId: string) => {
        return technicianService.updateJobStatus(jobId, 'arrived');
    },

    sendQuote: async (jobId: string, items: any[], laborAmount: number, metadata?: { note?: string, photos?: string[], voiceNote?: string | null }, vehicleId?: string) => {
        const response = await api.post(`/technician/jobs/${jobId}/quote`, { items, laborAmount, vehicleId, ...metadata });
        return response.data;
    },

    sendBill: async (jobId: string, items: any[], laborAmount: number, metadata?: { note?: string, photos?: string[], voiceNote?: string | null }, vehicleId?: string) => {
        const response = await api.post(`/technician/jobs/${jobId}/bill`, { items, laborAmount, vehicleId, ...metadata });
        return response.data;
    },

    requestParts: async (jobId: string, parts: any[], metadata?: { photos?: string[], voiceNote?: string | null, supplierId?: string | null }) => {
        const response = await api.post(`/technician/jobs/${jobId}/parts-request`, { parts, ...metadata });
        return response.data;
    },
    requestPart: async (data: PartRequestData) => {
        const response = await api.post(`/technician/parts/request`, data);
        return response.data;
    },

    addRepairDetails: async (jobId: string, details: any) => {
        const response = await api.put(`/technician/jobs/${jobId}/details`, details);
        return response.data;
    },

    getProducts: async (params?: { category?: string, search?: string, nearby?: boolean, latitude?: number, longitude?: number }) => {
        const response = await api.get('/technician/products', { params });
        return response.data;
    },

    requestProduct: async (productId: string, quantity: number, shopId: string, jobId?: string, customName?: string, customDescription?: string, customBrand?: string, photos?: string[], voiceNote?: string | null) => {
        const response = await api.post(`/technician/store/request`, { productId, quantity, shopId, jobId, customName, customDescription, customBrand, photos, voiceNote });
        return response.data;
    },

    respondToPartRequest: async (requestId: string, action: 'accept' | 'reject') => {
        const response = await api.post(`/technician/store/request/${requestId}/respond`, { action });
        return response.data;
    },

    requestCustomOrder: async (supplierName: string, items: any[], vehicleDetails?: any) => {
        const response = await api.post('/technician/store/custom-order', { supplierName, items, vehicleDetails });
        return response.data;
    },


    getVehicleHistory: async (vehicleId: string) => {
        const response = await api.get(`/technician/vehicle-history/${vehicleId}`);
        return response.data;
    },

    addPart: async (part: any) => {
        const response = await api.post(`/technician/inventory`, part);
        return response.data;
    },

    updatePart: async (id: string, part: any) => {
        const response = await api.put(`/technician/inventory/${id}`, part);
        return response.data;
    },

    deletePart: async (id: string) => {
        const response = await api.delete(`/technician/inventory/${id}`);
        return response.data;
    },

    placeWholesaleOrder: async (items: any[], supplierId?: string, totalAmount?: number, jobId?: string) => {
        const response = await api.post('/technician/store/order', { items, supplierId, totalAmount, jobId });
        return response.data;
    },

    getInventory: async () => {
        const response = await api.get('/technician/inventory');
        return response.data;
    },

    getWholesaleOrders: async () => {
        const response = await api.get('/technician/store/orders');
        return response.data;
    },

    createWholesaleOrderPayment: async (orderId: string) => {
        const response = await api.post(`/technician/store/orders/${orderId}/pay`);
        return response.data;
    },

    verifyWholesaleOrderPayment: async (orderId: string, paymentData: any) => {
        const response = await api.post(`/technician/store/orders/${orderId}/verify`, paymentData);
        return response.data;
    },

    payWholesaleOrderWithWallet: async (orderId: string) => {
        const response = await api.post(`/technician/store/orders/${orderId}/wallet-pay`);
        return response.data;
    },

    payWholesaleOrderWithCash: async (orderId: string) => {
        const response = await api.post(`/technician/store/orders/${orderId}/cash-pay`);
        return response.data;
    },

    // Wallet & Withdrawal Methods
    getWallet: async () => {
        const response = await api.get('/technician/wallet');
        return response.data;
    },

    getWalletTransactions: async (page = 1, limit = 10) => {
        const response = await api.get('/technician/wallet/transactions', { params: { page, limit } });
        return response.data;
    },

    getEarningsSummary: async () => {
        const response = await api.get('/technician/wallet/earnings');
        return response.data;
    },

    requestWithdrawal: async (amount: number, bankAccountId?: string) => {
        const response = await api.post('/technician/wallet/withdraw', { amount, bankAccountId });
        return response.data;
    },

    getWithdrawalHistory: async () => {
        const response = await api.get('/technician/wallet/withdrawals');
        return response.data;
    },

    addBankAccount: async (accountDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName?: string;
    }) => {
        const response = await api.post('/technician/wallet/bank-account', accountDetails);
        return response.data;
    },

    getBankAccounts: async () => {
        const response = await api.get('/technician/wallet/bank-accounts');
        return response.data;
    },

    updateRequirementStatus: async (jobId: string, reqId: string, isCompleted: boolean) => {
        const response = await api.put(`/technician/jobs/${jobId}/requirements/${reqId}`, { isCompleted });
        return response.data;
    },

    uploadFile: async (fileUri: string, type: 'image' | 'audio' = 'image') => {
        const formData = new FormData();
        const filename = fileUri.split('/').pop() || `upload_${Date.now()}`;

        // Better MIME type detection
        let mimeType = type === 'image' ? 'image/jpeg' : 'audio/mp4';
        const match = /\.(\w+)$/.exec(filename);
        if (match) {
            const ext = match[1].toLowerCase();
            if (ext === 'png') mimeType = 'image/png';
            if (ext === 'gif') mimeType = 'image/gif';
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            if (ext === 'mp3') mimeType = 'audio/mpeg';
            if (ext === 'wav') mimeType = 'audio/wav';
            if (ext === 'm4a') mimeType = 'audio/mp4';
        }

        console.log(`[TechnicianService] Uploading ${type}:`, { uri: fileUri, name: filename, type: mimeType });

        // React Native FormData requires this specific object structure
        formData.append('file', {
            uri: fileUri,
            name: filename,
            type: mimeType,
        } as any);

        const token = Platform.OS === 'web' ? localStorage.getItem('userToken') : await SecureStore.getItemAsync('userToken');

        try {
            // Using raw fetch for uploads as it's more reliable with FormData in React Native
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[TechnicianService] Upload failed:', response.status, errorText);
                throw new Error(`Upload failed (${response.status})`);
            }

            const result = await response.json();
            console.log('[TechnicianService] Upload success:', result);

            // Standardize return for the app: return the data object if present
            return result.data || result;
        } catch (error) {
            console.error('[TechnicianService] Fetch Upload Error:', error);
            throw error;
        }
    },

    getDevices: async () => {
        const response = await api.get('/technician/devices');
        return response.data;
    },

    removeDevice: async (deviceId: string) => {
        const response = await api.delete(`/technician/devices/${deviceId}`);
        return response.data;
    }
};
