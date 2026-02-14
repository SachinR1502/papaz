'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supplierService } from '@/services/supplierService';
import { SupplierProduct, SupplierOrder } from '@/types/models';

interface SupplierContextType {
    inventory: SupplierProduct[];
    orders: SupplierOrder[];
    walletBalance: number;
    isRegistered: boolean;
    isApproved: boolean;
    profile: any;
    isLoading: boolean;
    wholesaleOrders: any[];
    refreshData: () => Promise<void>;
    submitRegistration: (data: any) => Promise<void>;
    addProduct: (product: any) => Promise<void>;
    updateProduct: (id: string, product: any) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    updateOrder: (orderId: string, action: string, status?: string, data?: any) => Promise<void>;
    sendQuotation: (orderId: string, items: any[], totalAmount?: number) => Promise<void>;
    requestWithdrawal: (amount: number, bankAccountId?: string) => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType>({
    inventory: [],
    orders: [],
    walletBalance: 0,
    isRegistered: false,
    isApproved: false,
    profile: null,
    isLoading: true,
    wholesaleOrders: [],
    refreshData: async () => { },
    submitRegistration: async () => { },
    updateProfile: async () => { },
    addProduct: async () => { },
    updateProduct: async () => { },
    updateOrder: async () => { },
    sendQuotation: async () => { },
    requestWithdrawal: async () => { },
});

export const useSupplier = () => useContext(SupplierContext);

export function SupplierProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<SupplierProduct[]>([]);
    const [orders, setOrders] = useState<SupplierOrder[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [wholesaleOrders, setWholesaleOrders] = useState<any[]>([]);

    useEffect(() => {
        if (user?.role?.toLowerCase() === 'supplier') {
            checkRegistrationStatus();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const checkRegistrationStatus = async () => {
        setIsLoading(true);
        try {
            if (user?.profile) {
                setProfile(user.profile);
                setIsRegistered(!!(user.profile.shopName || user.profile.storeName));
                setIsApproved(user.profile.status === 'approved' || user.profile.isApproved);
                if (user.profile.shopName || user.profile.storeName) {
                    await loadBusinessData();
                }
            } else {
                // Fallback to local storage logic for web if needed
                const regData = localStorage.getItem('supplier_profile');
                if (regData) {
                    const parsed = JSON.parse(regData);
                    setProfile(parsed);
                    setIsRegistered(!!(parsed.shopName || parsed.storeName));
                    setIsApproved(parsed.status === 'approved' || parsed.isApproved);
                    await loadBusinessData();
                } else {
                    setIsRegistered(false);
                    setIsApproved(false);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadBusinessData = async () => {
        try {
            const [inv, ord, w_ord] = await Promise.all([
                supplierService.getInventory().catch(() => []),
                supplierService.getOrders().catch(() => []),
                supplierService.getWholesaleOrders().catch(() => [])
            ]);

            setInventory((inv as any[]).map(p => ({
                ...p,
                id: p._id || p.id,
                type: p.category || 'Spare Parts',
                quantity: p.stock || 0,
                deliveryTime: p.deliveryTime || '2-3 Days'
            })));

            setOrders((ord as any[]).map(o => ({
                ...o,
                id: o._id || o.id,
                partName: o.partName || (o.items?.[0]?.name) || 'Spare Part',
                quantity: o.quantity || (o.items?.[0]?.quantity) || 1,
                location: o.location || (o.customer?.city) || 'Direct Order',
                urgency: o.urgency || 'Normal',
                amount: o.amount || o.totalAmount || 0,
                type: o.type || 'Car'
            })));

            setWholesaleOrders((w_ord as any[]).map(wo => ({
                ...wo,
                id: wo._id || wo.id,
                technicianName: wo.technicianName || (wo.technician?.garageName) || (wo.technician?.fullName) || 'Master Technician'
            })));

            setWalletBalance(profile?.walletBalance || 15400); // Mock/Default
        } catch (e) {
            console.error("Failed to load supplier data", e);
        }
    };

    const submitRegistration = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await supplierService.updateProfile(data);
            const newProfile = { ...response, status: 'pending_approval' };
            localStorage.setItem('supplier_profile', JSON.stringify(newProfile));
            setProfile(newProfile);
            setIsRegistered(true);
            setIsApproved(response.status === 'approved');
            await loadBusinessData();
        } catch (e) {
            console.error("Registration failed", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await supplierService.updateProfile(data);
            localStorage.setItem('supplier_profile', JSON.stringify(response));
            setProfile(response);
        } catch (e) {
            console.error("Profile update failed", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const addProduct = async (product: any) => {
        const newProduct = await supplierService.addProduct(product);
        setInventory(prev => [...prev, { ...newProduct, id: newProduct._id || newProduct.id }]);
    };

    const updateProduct = async (id: string, product: any) => {
        const updated = await supplierService.updateProduct(id, product);
        setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    };

    const updateOrder = async (orderId: string, action: string, status?: string, data?: any) => {
        await supplierService.updateOrderStatus(orderId, status || action, data);
        await loadBusinessData();
    };

    const sendQuotation = async (orderId: string, items: any[], totalAmount?: number) => {
        await supplierService.sendQuotation(orderId, items, totalAmount);
        await loadBusinessData();
    };

    const requestWithdrawal = async (amount: number, bankAccountId?: string) => {
        await supplierService.requestWithdrawal(amount, bankAccountId);
        setWalletBalance(prev => prev - amount);
    };

    return (
        <SupplierContext.Provider value={{
            inventory,
            orders,
            walletBalance,
            isRegistered,
            isApproved,
            profile,
            isLoading,
            wholesaleOrders,
            refreshData: loadBusinessData,
            submitRegistration,
            updateProfile,
            addProduct,
            updateProduct,
            updateOrder,
            sendQuotation,
            requestWithdrawal
        }}>
            {children}
        </SupplierContext.Provider>
    );
}
