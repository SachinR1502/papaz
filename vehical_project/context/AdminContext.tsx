import { AdminJob, adminService, AdminStats, PendingUser, PlatformSettings } from '@/services/adminService';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
    pendingUsers: PendingUser[];
    allUsers: any[];
    jobs: AdminJob[];
    transactions: any[];
    stats: AdminStats;
    settings: PlatformSettings;
    isLoading: boolean;
    approveUser: (id: string, type: 'technician' | 'supplier') => Promise<void>;
    rejectUser: (id: string, type: 'technician' | 'supplier', reason?: string) => Promise<void>;
    updateSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
    refreshDashboard: (period?: string) => Promise<void>;
    loadAllUsers: (params?: any) => Promise<void>;
    loadAllJobs: (params?: any) => Promise<void>;
    loadTransactions: (params?: any) => Promise<void>;
    updateUserDetails: (id: string, data: { type: string; name: string; businessName: string; email: string; phone: string }) => Promise<void>;
    suspendUser: (id: string, type: string) => Promise<void>;
    getUserActivity: (id: string, type: string) => Promise<any[]>;
    getJobDetails: (id: string) => Promise<any>;
    cancelJob: (id: string, reason?: string) => Promise<void>;
    verifyDocument: (id: string, type: string, docType: string, verified: boolean) => Promise<void>;
    getServiceZones: () => Promise<any[]>;
    updateServiceZones: (zones: any[]) => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
    pendingUsers: [],
    allUsers: [],
    jobs: [],
    transactions: [],
    stats: { totalRevenue: 0, platformCommission: 0, activeJobs: 0, pendingApprovals: 0, totalCustomers: 0, totalTechnicians: 0, totalSuppliers: 0, totalJobs: 0, completedJobs: 0, revenueHistory: [] },
    settings: { maintenanceMode: false, allowRegistrations: true, commissionRate: 10, payoutSchedule: 'Weekly', currency: 'INR' },
    isLoading: true,
    approveUser: async () => { },
    rejectUser: async () => { },
    updateSettings: async () => { },
    refreshDashboard: async (period?: string) => { },
    loadAllUsers: async () => { },
    loadAllJobs: async () => { },
    loadTransactions: async () => { },
    updateUserDetails: async () => { },
    suspendUser: async () => { },
    getUserActivity: async () => [],
    getJobDetails: async () => { },
    cancelJob: async () => { },
    verifyDocument: async () => { },
    getServiceZones: async () => [],
    updateServiceZones: async () => { },
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState<AdminStats>({ totalRevenue: 0, platformCommission: 0, activeJobs: 0, pendingApprovals: 0, totalCustomers: 0, totalTechnicians: 0, totalSuppliers: 0, totalJobs: 0, completedJobs: 0, revenueHistory: [] });
    const [settings, setSettings] = useState<PlatformSettings>({ maintenanceMode: false, allowRegistrations: true, commissionRate: 10, payoutSchedule: 'Weekly', currency: 'INR' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'admin') {
            loadAdminData();
        }
    }, [user]);

    const loadAdminData = async (period?: string) => {
        setIsLoading(true);
        try {
            const [dashData, pendingData, settingsData] = await Promise.all([
                adminService.getDashboard(period),
                adminService.getPendingUsers(),
                adminService.getSettings()
            ]);

            setPendingUsers(pendingData);
            setStats(dashData.stats);
            if (settingsData) setSettings(settingsData);

            // Initial load of users and jobs
            loadAllUsers();
            loadAllJobs();
            loadTransactions();
        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllUsers = async (params?: any) => {
        try {
            const data = await adminService.getAllUsers(params);
            setAllUsers(data.users || []);
        } catch (e) {
            console.error("Failed to load all users", e);
        }
    };

    const loadAllJobs = async (params?: any) => {
        try {
            const data = await adminService.getAllJobs(params);
            setJobs(data.jobs || []);
        } catch (e) {
            console.error("Failed to load all jobs", e);
        }
    };

    const loadTransactions = async (params?: any) => {
        try {
            const data = await adminService.getAllTransactions(params);
            setTransactions(data.transactions || []);
        } catch (e) {
            console.error("Failed to load transactions", e);
        }
    };

    const approveUser = async (id: string, type: 'technician' | 'supplier') => {
        try {
            await adminService.approveUser(id, type);
            setPendingUsers(prev => prev.filter(u => u.id !== id));
            setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
        } catch (error) {
            console.error("Approval failed", error);
        }
    };

    const rejectUser = async (id: string, type: 'technician' | 'supplier', reason?: string) => {
        try {
            await adminService.rejectUser(id, type, reason);
            setPendingUsers(prev => prev.filter(u => u.id !== id));
            setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
        } catch (error) {
            console.error("Rejection failed", error);
        }
    };

    const updateSettings = async (updates: Partial<PlatformSettings>) => {
        try {
            const data = await adminService.updateSettings(updates);
            if (data.settings) setSettings(data.settings);
        } catch (error) {
            console.error("Failed to update settings", error);
        }
    };

    const getJobDetails = async (id: string) => {
        try {
            return await adminService.getJobDetails(id);
        } catch (error) {
            console.error("Failed to get job details", error);
        }
    };

    const cancelJob = async (id: string, reason?: string) => {
        try {
            await adminService.cancelJob(id, reason);
            await loadAllJobs();
        } catch (error) {
            console.error("Failed to cancel job", error);
        }
    };

    const verifyDocument = async (id: string, type: string, docType: string, verified: boolean) => {
        try {
            await adminService.verifyDocument(id, type, docType, verified);
            // Refresh pending users to reflect the verification status
            const data = await adminService.getPendingUsers();
            setPendingUsers(data);
        } catch (error) {
            console.error("Failed to verify document", error);
        }
    };

    const getServiceZones = async () => {
        try {
            return await adminService.getServiceZones();
        } catch (error) {
            console.error("Failed to get service zones", error);
            return [];
        }
    };

    const updateServiceZones = async (zones: any[]) => {
        try {
            await adminService.updateServiceZones(zones);
        } catch (error) {
            console.error("Failed to update service zones", error);
        }
    };

    const updateUserDetails = async (id: string, data: { type: string; name: string; businessName: string; email: string; phone: string }) => {
        try {
            await adminService.updateUser(id, data);
            await loadAllUsers();
        } catch (error) {
            console.error("Failed to update user details", error);
            throw error;
        }
    };

    const suspendUser = async (id: string, type: string) => {
        try {
            await adminService.suspendUser(id, type);
            await loadAllUsers();
        } catch (error) {
            console.error("Failed to suspend user", error);
            throw error;
        }
    };

    const getUserActivity = async (id: string, type: string) => {
        try {
            return await adminService.getUserActivity(id, type);
        } catch (error) {
            console.error("Failed to get user activity", error);
            return [];
        }
    };

    return (
        <AdminContext.Provider value={{
            pendingUsers,
            allUsers,
            jobs,
            transactions,
            stats,
            settings,
            isLoading,
            approveUser,
            rejectUser,
            updateSettings,
            refreshDashboard: loadAdminData,
            loadAllUsers,
            loadAllJobs,
            loadTransactions,
            updateUserDetails,
            suspendUser,
            getUserActivity,
            getJobDetails,
            cancelJob,
            verifyDocument,
            getServiceZones,
            updateServiceZones
        }}>
            {children}
        </AdminContext.Provider>
    );
}
