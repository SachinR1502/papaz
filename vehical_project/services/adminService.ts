import api from './apiClient';

export interface AdminStats {
    totalCustomers: number;
    totalTechnicians: number;
    totalSuppliers: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    pendingApprovals: number;
    totalRevenue: number;
    platformCommission: number;
    revenueHistory?: { date: string; amount: number }[];
}

export interface PendingUser {
    id: string;
    name: string;
    type: 'technician' | 'supplier';
    businessName: string;
    location: string;
    appliedDate: string;
    status: string;
    phone?: string;
    email?: string;
    registrationType?: string;
    udyamNo?: string;
    serviceRadius?: string;
    locationName?: string;
    gpsLocation?: {
        type: string;
        coordinates: [number, number];
    };
    dob?: string;
    aadharNo?: string;
    panNo?: string;
    profession?: string;
    workType?: string;
    vehicleTypes?: string[];
    technicalSkills?: string[];
    softSkills?: string[];
    bankDetails?: {
        holderName: string;
        accountNo: string;
        ifsc: string;
        isVerified: boolean;
    } | null;
    documents?: { type: string; url: string; verified: boolean }[];
}

export interface AdminJob {
    id: string;
    status: string;
    vehicleModel: string;
    customer: string;
    technician: string;
    garage?: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
    completedAt?: string;
}

export interface PlatformSettings {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    commissionRate: number;
    payoutSchedule: string;
    currency: string;
    minWithdrawal?: number;
    maxWithdrawal?: number;
}

export const adminService = {
    // Dashboard
    getDashboard: async (period?: string): Promise<{ stats: AdminStats; recentJobs: any[] }> => {
        const response = await api.get('/admin/dashboard', { params: { period } });
        return response.data;
    },

    // User Management
    getAllUsers: async (params?: { type?: string; status?: string; page?: number; limit?: number }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    getPendingUsers: async (): Promise<PendingUser[]> => {
        const response = await api.get('/admin/users/pending');
        return response.data;
    },

    approveUser: async (id: string, type: 'technician' | 'supplier'): Promise<any> => {
        const response = await api.post(`/admin/users/${id}/approve`, { type });
        return response.data;
    },

    rejectUser: async (id: string, type: 'technician' | 'supplier', reason?: string): Promise<any> => {
        const response = await api.post(`/admin/users/${id}/reject`, { type, reason });
        return response.data;
    },

    // Jobs Management
    getAllJobs: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ jobs: AdminJob[]; total: number; pages: number }> => {
        const response = await api.get('/admin/jobs', { params });
        return response.data;
    },

    getJobDetails: async (id: string): Promise<any> => {
        const response = await api.get(`/admin/jobs/${id}`);
        return response.data;
    },

    cancelJob: async (id: string, reason?: string): Promise<any> => {
        const response = await api.post(`/admin/jobs/${id}/cancel`, { reason });
        return response.data;
    },

    // Transactions
    getAllTransactions: async (params?: { type?: string; page?: number; limit?: number }) => {
        const response = await api.get('/admin/transactions', { params });
        return response.data;
    },

    // Settings
    getSettings: async (): Promise<PlatformSettings> => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settings: Partial<PlatformSettings>): Promise<any> => {
        const response = await api.put('/admin/settings', settings);
        return response.data;
    },

    getServiceZones: async (): Promise<any[]> => {
        const response = await api.get('/admin/service-zones');
        return response.data;
    },

    updateServiceZones: async (zones: any[]): Promise<any> => {
        const response = await api.post('/admin/service-zones', { zones });
        return response.data;
    },

    // Reports
    getReports: async (period?: '7d' | '30d' | '90d') => {
        const response = await api.get('/admin/reports', { params: { period } });
        return response.data;
    },

    updateUser: async (id: string, data: { type: string; name: string; businessName: string; email: string; phone: string }): Promise<any> => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    suspendUser: async (id: string, type: string): Promise<any> => {
        const response = await api.post(`/admin/users/${id}/suspend`, { type });
        return response.data;
    },

    getUserActivity: async (id: string, type: string): Promise<any[]> => {
        const response = await api.get(`/admin/users/${id}/activity`, { params: { type } });
        return response.data;
    },

    verifyDocument: async (id: string, type: string, docType: string, verified: boolean): Promise<any> => {
        const response = await api.post(`/admin/users/${id}/verify-doc`, { type, docType, verified });
        return response.data;
    },

    // Device Management
    getDevices: async () => {
        const response = await api.get('/admin/devices');
        return response.data;
    },

    removeDevice: async (deviceId: string) => {
        const response = await api.delete(`/admin/devices/${deviceId}`);
        return response.data;
    },

    getUserDevices: async (userId: string) => {
        const response = await api.get(`/admin/users/${userId}/devices`);
        return response.data;
    }
};
