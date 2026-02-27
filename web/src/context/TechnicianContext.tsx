'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { technicianService } from '@/services/technicianService';

interface TechnicianContextType {
    jobs: any[];
    availableJobs: any[];
    inventory: any[];
    walletBalance: number;
    transactions: any[];
    notifications: any[];
    profile: any;
    isLoading: boolean;
    isApproved: boolean;
    refreshData: () => Promise<void>;
    markNotificationRead: (id: string) => Promise<void>;
    addPart: (data: any) => Promise<void>;
}

const TechnicianContext = createContext<TechnicianContextType>({
    jobs: [],
    availableJobs: [],
    inventory: [],
    walletBalance: 0,
    transactions: [],
    notifications: [],
    profile: null,
    isLoading: true,
    isApproved: false,
    refreshData: async () => { },
    markNotificationRead: async () => { },
    addPart: async () => { },
});

export const useTechnician = () => useContext(TechnicianContext);

export function TechnicianProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [availableJobs, setAvailableJobs] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (user?.role?.toLowerCase() === 'technician') {
            loadTechnicianData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const loadTechnicianData = async () => {
        setIsLoading(true);
        try {
            const [jobsResponse, invData, walletData, profData, notifData] = await Promise.all([
                technicianService.getJobs().catch(() => ({ available: [], myJobs: [] })),
                technicianService.getInventory().catch(() => []),
                technicianService.getWallet().catch(() => ({ balance: 0, transactions: [] })),
                technicianService.getProfile().catch(() => user?.profile),
                technicianService.getNotifications().catch(() => [])
            ]);

            // Handle both array and object response structures
            if (jobsResponse && typeof jobsResponse === 'object' && !Array.isArray(jobsResponse)) {
                setJobs(Array.isArray(jobsResponse.myJobs) ? jobsResponse.myJobs : []);
                setAvailableJobs(Array.isArray(jobsResponse.available) ? jobsResponse.available : []);
            } else {
                setJobs(Array.isArray(jobsResponse) ? jobsResponse : []);
                setAvailableJobs([]);
            }

            setInventory(Array.isArray(invData) ? invData : []);
            setWalletBalance(walletData?.walletBalance || 0);
            setTransactions(walletData?.transactions || []);
            setNotifications(Array.isArray(notifData) ? notifData : []);
            setProfile(profData);
            setIsApproved(profData?.isApproved || profData?.status === 'approved' || user?.profile?.isApproved);
        } catch (error) {
            console.error("Failed to load technician data", error);
            setJobs([]);
            setAvailableJobs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const markNotificationRead = async (id: string) => {
        try {
            await technicianService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const addPart = async (data: any) => {
        const newPart = await technicianService.addPart(data);
        setInventory(prev => [...prev, newPart]);
    };

    return (
        <TechnicianContext.Provider value={{
            jobs,
            availableJobs,
            inventory,
            walletBalance,
            transactions,
            notifications,
            profile,
            isLoading,
            isApproved,
            refreshData: loadTechnicianData,
            markNotificationRead,
            addPart
        }}>
            {children}
        </TechnicianContext.Provider>
    );
}
