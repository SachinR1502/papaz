import apiClient from './apiClient';

export const customerService = {
    getDashboard: async () => {
        const response = await apiClient.get('/customer/dashboard');
        return response.data;
    },

    getProducts: async (params?: any) => {
        const response = await apiClient.get('/customer/products', { params });
        return response.data;
    },

    getSuppliers: async () => {
        const response = await apiClient.get('/customer/suppliers');
        return response.data;
    },

    getGarages: async () => {
        const response = await apiClient.get('/customer/garages');
        return response.data;
    },

    createOrder: async (orderData: any) => {
        const response = await apiClient.post('/customer/orders', orderData);
        return response.data;
    },

    getOrders: async () => {
        const response = await apiClient.get('/customer/orders');
        return response.data;
    },

    getOrderDetails: async (id: string) => {
        const response = await apiClient.get(`/customer/orders/${id}`);
        return response.data;
    },

    getAddresses: async () => {
        const response = await apiClient.get('/customer/addresses');
        return response.data;
    },

    addAddress: async (addressData: any) => {
        const response = await apiClient.post('/customer/addresses', addressData);
        return response.data;
    },

    getVehicles: async () => {
        const response = await apiClient.get('/customer/vehicles');
        return response.data;
    },

    addVehicle: async (vehicleData: any) => {
        const response = await apiClient.post('/customer/vehicles', vehicleData);
        return response.data;
    },

    requestPart: async (requestData: any) => {
        const response = await apiClient.post('/customer/parts/request', requestData);
        return response.data;
    },

    getWishlist: async () => {
        const response = await apiClient.get('/customer/wishlist');
        return response.data;
    },

    addToWishlist: async (productId: string | number) => {
        const response = await apiClient.post(`/customer/wishlist/${productId}`);
        return response.data;
    },

    removeFromWishlist: async (productId: string | number) => {
        const response = await apiClient.delete(`/customer/wishlist/${productId}`);
        return response.data;
    }
};
