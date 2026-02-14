import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api, { API_URL } from './apiClient';

export interface PartRequestItem {
    name: string;
    description?: string;
    quantity: number;
    price?: number;
    productId?: string;
    partNumber?: string;
    brand?: string;
    image?: string | null;
    voiceUri?: string | null;
}

export interface PartRequestData {
    items: PartRequestItem[];
    name: string;
    description: string;
    quantity: number;
    partNumber?: string;
    brand?: string;
    supplierId?: string;
    jobId?: string;
    vehicleId?: string;
    vehicleDetails?: {
        make?: string;
        model?: string;
        year?: string;
        fuelType?: string;
        registrationNumber?: string;
    };
}


export const customerService = {
    getDashboard: async () => {
        const response = await api.get('/customer/dashboard');
        return response.data;
    },

    getNotifications: async () => {
        const response = await api.get('/customer/notifications');
        return response.data;
    },

    markNotificationRead: async (id: string) => {
        const response = await api.put(`/customer/notifications/${id}/read`);
        return response.data;
    },

    clearAllNotifications: async () => {
        const response = await api.delete('/customer/notifications');
        return response.data;
    },

    getVehicles: async () => {
        const response = await api.get('/customer/vehicles');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/customer/profile', data);
        return response.data;
    },

    getVehicleHistory: async (vehicleId: string) => {
        const response = await api.get(`/customer/vehicles/${vehicleId}/history`);
        return response.data;
    },

    addVehicle: async (data: any) => {
        const response = await api.post('/customer/vehicles', data);
        return response.data;
    },

    createJob: async (data: any) => {
        const response = await api.post('/customer/jobs', data);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/customer/jobs/history');
        return response.data;
    },

    getJob: async (id: string) => {
        const response = await api.get(`/customer/jobs/${id}`);
        return response.data;
    },

    respondToQuote: async (jobId: string, action: 'approve' | 'reject' | 'accept_with_parts' | 'accept_own_parts') => {
        const response = await api.post(`/customer/jobs/${jobId}/quote/respond`, { action });
        return response.data;
    },

    respondToBill: async (jobId: string, action: 'approve' | 'reject', paymentMethod?: 'cash' | 'online' | 'razorpay' | 'wallet') => {
        const response = await api.post(`/customer/jobs/${jobId}/bill/respond`, { action, paymentMethod });
        return response.data;
    },

    rateJob: async (jobId: string, rating: number, review: string) => {
        const response = await api.post(`/customer/jobs/${jobId}/rate`, { rating, review });
        return response.data;
    },

    cancelJob: async (jobId: string, reason: string) => {
        const response = await api.post(`/customer/jobs/${jobId}/cancel`, { reason });
        return response.data;
    },

    requestPart: async (data: PartRequestData) => {
        const response = await api.post(`/customer/parts/request`, data);
        return response.data;
    },

    getGarages: async (lat?: number, lng?: number, vehicleType?: string) => {
        const params: any = {};
        if (lat) params.lat = lat;
        if (lng) params.lng = lng;
        if (vehicleType) params.vehicleType = vehicleType;
        const response = await api.get('/customer/garages', { params });
        return response.data;
    },

    getSuppliers: async (lat?: number, lng?: number) => {
        const params: any = {};
        if (lat) params.lat = lat;
        if (lng) params.lng = lng;
        const response = await api.get('/customer/suppliers', { params });
        return response.data;
    },

    getAddresses: async () => {
        const response = await api.get('/customer/addresses');
        return response.data;
    },

    addAddress: async (data: any) => {
        const response = await api.post('/customer/addresses', data);
        return response.data;
    },


    updateAddress: async (id: string, data: any) => {
        const response = await api.put(`/customer/addresses/${id}`, data);
        return response.data;
    },

    removeAddress: async (id: string) => {
        const response = await api.delete(`/customer/addresses/${id}`);
        return response.data;
    },

    getProducts: async (category?: string, search?: string, lat?: number, lng?: number, nearby?: boolean) => {
        const params: any = {};
        if (category) params.category = category;
        if (search) params.search = search;
        if (lat) params.lat = lat;
        if (lng) params.lng = lng;
        if (nearby) params.nearby = true;
        const response = await api.get('/customer/products', { params });
        return response.data;
    },

    createOrder: async (data: any) => {
        console.log('[customerService] createOrder called with:', JSON.stringify(data, null, 2));
        const response = await api.post('/customer/orders', data);
        console.log('[customerService] createOrder response:', response.data);
        return response.data;
    },

    getOrders: async () => {
        const response = await api.get('/customer/orders');
        return response.data;
    },

    getOrder: async (orderId: string) => {
        const response = await api.get(`/customer/orders/${orderId}`);
        return response.data;
    },

    getWishlist: async () => {
        const response = await api.get('/customer/wishlist');
        return response.data;
    },

    addToWishlist: async (productId: string) => {
        const response = await api.post(`/customer/wishlist/${productId}`);
        return response.data;
    },

    removeFromWishlist: async (productId: string) => {
        const response = await api.delete(`/customer/wishlist/${productId}`);
        return response.data;
    },

    getWalletHistory: async () => {
        const response = await api.get('/customer/wallet/history');
        return response.data;
    },

    topupWallet: async (amount: number, referenceId: string) => {
        const response = await api.post('/customer/wallet/topup', { amount, referenceId });
        return response.data;
    },

    addCard: async (data: any) => {
        const response = await api.post('/customer/payments/cards', data);
        return response.data;
    },

    removeCard: async (cardId: string) => {
        const response = await api.delete(`/customer/payments/cards/${cardId}`);
        return response.data;
    },

    // Razorpay Integration
    createWalletTopupOrder: async (amount: number) => {
        const response = await api.post('/customer/wallet/create-order', { amount });
        return response.data;
    },

    verifyWalletTopup: async (paymentData: any) => {
        const response = await api.post('/customer/wallet/verify-payment', paymentData);
        return response.data;
    },

    createBillPaymentOrder: async (jobId: string) => {
        const response = await api.post(`/customer/jobs/${jobId}/bill/create-order`);
        return response.data;
    },

    verifyBillPayment: async (jobId: string, paymentData: any) => {
        const response = await api.post(`/customer/jobs/${jobId}/bill/verify-payment`, paymentData);
        return response.data;
    },

    createStoreOrderPayment: async (orderId: string) => {
        const response = await api.post(`/customer/orders/${orderId}/pay`);
        return response.data;
    },

    verifyStoreOrderPayment: async (orderId: string, paymentData: any) => {
        const response = await api.post(`/customer/orders/${orderId}/verify`, paymentData);
        return response.data;
    },

    payStoreOrderWithWallet: async (orderId: string) => {
        const response = await api.post(`/customer/orders/${orderId}/wallet-pay`);
        return response.data;
    },

    respondToOrderQuotation: async (orderId: string, action: 'approve' | 'reject') => {
        const response = await api.post(`/customer/orders/${orderId}/quotation/respond`, { action });
        return response.data;
    },

    getDevices: async () => {
        const response = await api.get('/customer/devices');
        return response.data;
    },

    removeDevice: async (deviceId: string) => {
        const response = await api.delete(`/customer/devices/${deviceId}`);
        return response.data;
    },

    uploadFile: async (fileUri: string, type: 'image' | 'audio' = 'image') => {
        const formData = new FormData();
        const filename = fileUri.split('/').pop() || `upload_${Date.now()}`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : (type === 'image' ? 'jpg' : 'm4a');

        let mimeType = '';
        if (type === 'image') {
            mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        } else {
            mimeType = 'audio/mpeg';
            if (ext === 'm4a') mimeType = 'audio/mp4';
            if (ext === 'wav') mimeType = 'audio/wav';
        }

        console.log(`[CustomerService] Uploading ${type}:`, { uri: fileUri, name: filename, type: mimeType });

        formData.append('file', {
            uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
            name: filename.includes('.') ? filename : `${filename}.${ext}`,
            type: mimeType,
        } as any);

        const token = Platform.OS === 'web' ? localStorage.getItem('userToken') : await SecureStore.getItemAsync('userToken');

        try {
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
                console.error('[CustomerService] Upload failed:', response.status, errorText);
                throw new Error(`Upload failed (${response.status})`);
            }

            const result = await response.json();
            console.log('[CustomerService] Upload success:', result);

            return result.data || result;
        } catch (error) {
            console.error('[CustomerService] Fetch Upload Error:', error);
            throw error;
        }
    },
};