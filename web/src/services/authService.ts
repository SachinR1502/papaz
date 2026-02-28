import apiClient from './apiClient';

export const authService = {
    sendOtp: async (phoneNumber: string, role?: string, isRegister: boolean = false) => {
        const response = await apiClient.post('/auth/send-otp', {
            phoneNumber,
            role,
            isRegister
        });
        return response.data;
    },

    verifyOtp: async (phoneNumber: string, otp: string, password?: string) => {
        const response = await apiClient.post('/auth/verify-otp', {
            phoneNumber,
            otp,
            password
        });
        return response.data;
    },

    loginWithPassword: async (phoneNumber: string, password: string) => {
        const response = await apiClient.post('/auth/login-password', {
            phoneNumber,
            password
        });
        return response.data;
    },

    updateProfile: async (profileData: any) => {
        const response = await apiClient.post('/auth/profile', profileData);
        return response.data;
    },

    changePassword: async (passwordData: any) => {
        const response = await apiClient.post('/auth/change-password', passwordData);
        return response.data;
    },

    resetPassword: async (resetData: any) => {
        const response = await apiClient.post('/auth/reset-password', resetData);
        return response.data;
    },

    checkOtp: async (phoneNumber: string, otp: string) => {
        const response = await apiClient.post('/auth/check-otp', { phoneNumber, otp });
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};
