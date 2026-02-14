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

    verifyOtp: async (phoneNumber: string, otp: string) => {
        const response = await apiClient.post('/auth/verify-otp', {
            phoneNumber,
            otp
        });
        return response.data;
    },

    updateProfile: async (profileData: any) => {
        const response = await apiClient.post('/auth/profile', profileData);
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};
