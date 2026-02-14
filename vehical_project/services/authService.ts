import api from './apiClient';

export const authService = {
    sendOtp: async (phoneNumber: string, role: string, isRegister: boolean = false) => {
        console.log("Send OTP call")
        const response = await api.post('/auth/send-otp', { phoneNumber, role, isRegister });
        return response.data;
    },

    verifyOtp: async (phoneNumber: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
        return response.data;
    },

    updateProfile: async (profileData: any) => {
        const response = await api.post('/auth/profile', profileData);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    registerDevice: async (deviceData: any) => {
        try {
            const response = await api.post('/auth/device', deviceData);
            return response.data;
        } catch (error) {
            console.error('Failed to register device', error);
            // Non-blocking error
            return null;
        }
    },
};
