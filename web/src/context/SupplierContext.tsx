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
    transactions: any[];
    refreshData: () => Promise<void>;
    submitRegistration: (data: any) => Promise<void>;
    addProduct: (product: any) => Promise<void>;
    updateProduct: (id: string, product: any) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    updateOrder: (orderId: string, action: string, status?: string, data?: any) => Promise<void>;
    sendQuotation: (orderId: string, items: any[], totalAmount?: number, isWholesale?: boolean) => Promise<void>;
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
    transactions: [],
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
    const [transactions, setTransactions] = useState<any[]>([]);

    const formatString = (val: any, fallback: any): string => {
        const raw = val || fallback;
        if (!raw) return 'N/A';
        if (typeof raw === 'string') return raw;
        if (typeof raw === 'object') {
            if (raw.lat !== undefined && raw.lng !== undefined) {
                return `GPS: ${Number(raw.lat).toFixed(4)}, ${Number(raw.lng).toFixed(4)}`;
            }
            if (raw.name) return String(raw.name);
            if (raw.fullName) return String(raw.fullName);
            if (raw.garageName) return String(raw.garageName);
            // Deep fallback for nested objects that might still be passed
            return 'Data Sync Active';
        }
        return String(raw);
    };

    const cleanProfileData = (raw: any) => {
        if (!raw) return null;
        return {
            ...raw,
            storeName: formatString(raw.storeName || raw.shopName, 'Partner Shop'),
            fullName: formatString(raw.fullName, 'Business Owner'),
            address: formatString(raw.address, 'Location Pending'),
            city: formatString(raw.city, 'Hub City')
        };
    };

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
                const cleaned = cleanProfileData(user.profile);
                setProfile(cleaned);
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
                    const cleaned = cleanProfileData(parsed);
                    setProfile(cleaned);
                    setIsRegistered(!!(cleaned.shopName || cleaned.storeName));
                    setIsApproved(cleaned.status === 'approved' || cleaned.isApproved);
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
            const [inv, ord, w_ord, wallet] = await Promise.all([
                supplierService.getInventory().catch(() => []),
                supplierService.getOrders().catch(() => []),
                supplierService.getWholesaleOrders().catch(() => []),
                supplierService.getWallet().catch(() => ({ balance: 0, transactions: [] }))
            ]);

            const formatString = (val: any, fallback: string) => {
                if (!val) return fallback;
                if (typeof val === 'string') return val;
                if (typeof val === 'object') {
                    if (val.lat !== undefined && val.lng !== undefined) {
                        return `GPS: ${val.lat.toFixed(4)}, ${val.lng.toFixed(4)}`;
                    }
                    if (val.name) return val.name;
                    return fallback;
                }
                return String(val);
            };

            setInventory((inv as any[]).map(p => ({
                ...p,
                id: p._id || p.id,
                name: formatString(p.name, 'Unknown Part'),
                type: formatString(p.category || p.type, 'Spare Parts'),
                category: formatString(p.category, 'Components'),
                quantity: p.stock || 0,
                deliveryTime: p.deliveryTime || '2-3 Days'
            })));

            setOrders((ord as any[]).map(o => ({
                ...o,
                id: o._id || o.id,
                isWholesale: false,
                partName: formatString(o.partName || (o.items?.[0]?.name), 'Spare Part'),
                quantity: o.quantity || (o.items?.[0]?.quantity) || 1,
                location: formatString(o.location, (o.customer?.city || 'Direct Order')),
                urgency: o.urgency || 'Normal',
                amount: o.amount || o.totalAmount || 0,
                type: o.type || 'Car',
                items: (o.items || []).map((item: any) => ({
                    ...item,
                    name: formatString(item.name, 'Component'),
                    sku: formatString(item.sku, 'N/A'),
                    brand: formatString(item.brand, 'Premium')
                })),
                deliveryDetails: o.deliveryDetails ? {
                    ...o.deliveryDetails,
                    address: formatString(o.deliveryDetails.address, o.location || 'N/A')
                } : undefined,
                customer: o.customer ? {
                    ...o.customer,
                    fullName: formatString(o.customer.fullName, 'Client Entity'),
                    phoneNumber: formatString(o.customer.phoneNumber, 'N/A')
                } : undefined
            })));

            setWholesaleOrders((w_ord as any[]).map(wo => ({
                ...wo,
                id: wo._id || wo.id,
                isWholesale: true,
                technicianName: formatString(wo.technicianName || (wo.technician?.garageName) || (wo.technician?.fullName), 'Master Technician'),
                partName: formatString(wo.partName || (wo.items?.[0]?.name), 'Spare Parts Bundle'),
                location: formatString(wo.location, (wo.technician?.city || 'Field Request')),
                items: (wo.items || []).map((item: any) => ({
                    ...item,
                    name: formatString(item.name, 'Component'),
                    sku: formatString(item.sku, 'N/A'),
                    brand: formatString(item.brand, 'Premium')
                })),
                deliveryDetails: wo.deliveryDetails ? {
                    ...wo.deliveryDetails,
                    address: formatString(wo.deliveryDetails.address, wo.location || 'N/A')
                } : undefined,
                technician: wo.technician ? {
                    ...wo.technician,
                    garageName: formatString(wo.technician.garageName || wo.technician.fullName, 'Master Technician'),
                    phoneNumber: formatString(wo.technician.phoneNumber, 'N/A')
                } : undefined
            })));

            setProfile(cleanProfileData(user?.role?.toLowerCase() === 'supplier' ? user.profile : profile));
            setWalletBalance(wallet?.balance || profile?.walletBalance || 0);
            setTransactions(wallet?.transactions || []);
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

    const sendQuotation = async (orderId: string, items: any[], totalAmount?: number, isWholesale?: boolean) => {
        if (isWholesale) {
            // Check if there's a specialized wholesale quotation endpoint, otherwise use the standard one
            // Trying standard one for now as it's common to unify POSTs
            await supplierService.sendQuotation(orderId, items, totalAmount);
        } else {
            await supplierService.sendQuotation(orderId, items, totalAmount);
        }
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
            transactions,
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
