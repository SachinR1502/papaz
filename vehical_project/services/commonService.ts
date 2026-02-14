import api from './apiClient';

export interface PlatformSettings {
    currency: string;
    serviceZones: any[];
    maintenanceMode: boolean;
    allowRegistrations: boolean;
}

export const commonService = {
    getSettings: async (): Promise<PlatformSettings> => {
        try {
            const response = await api.get('/common/settings');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch common settings', error);
            // Return defaults on error to prevent app crash
            return {
                currency: 'INR',
                serviceZones: [],
                maintenanceMode: false,
                allowRegistrations: true
            };
        }
    }
};
