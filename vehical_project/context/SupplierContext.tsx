import { socketService } from '@/services/socket';
import { supplierService } from '@/services/supplierService';
import { registerForPushNotificationsAsync } from '@/utils/notificationHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface SupplierProduct {
    id: string;
    name: string;
    type: string;
    price: number;
    quantity: number;
    localDeliveryTime: string;
    transportDeliveryTime: string;
    deliveryCharges: number;
    brand?: string;
    partNumber?: string;
    compatibleModels?: string[];
}

interface SupplierOrder {
    id: string;
    partName: string;
    quantity: number;
    location: string;
    urgency: string;
    status: 'pending' | 'accepted' | 'rejected' | 'packed' | 'out_for_delivery' | 'delivered' | 'inquiry' | 'quoted' | 'cancelled';
    amount: number;
    type?: 'Car' | 'Bike';
    name?: string;
    supplier?: string | any;
}

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
        if (user?.role === 'supplier') {
            checkRegistrationStatus();
        }
    }, [user]);

    const checkRegistrationStatus = async () => {
        setIsLoading(true);
        try {
            // Check local storage or fetch from API
            // Ideally we should fetch the latest profile from API if possible, or trust AuthContext
            if (user?.profile) {
                setProfile(user.profile);
                setIsRegistered(!!(user.profile.shopName || user.profile.storeName));
                setIsApproved(user.profile.status === 'approved' || user.profile.isApproved);
                if (user.profile.shopName || user.profile.storeName) {
                    await loadBusinessData();
                }
            } else {
                // Fallback to local storage if user.profile isn't fully populated yet (though AuthContext should handle this)
                const regData = await AsyncStorage.getItem('supplier_profile');
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
                supplierService.getInventory(),
                supplierService.getOrders(),
                supplierService.getWholesaleOrders()
            ]);
            setInventory((inv as any[]).map(p => ({
                ...p,
                id: p._id || p.id,
                type: p.category || 'Spare Parts',
                quantity: p.stock || 0,
                deliveryTime: p.deliveryTime || '2-3 Days'
            })));

            const normalizedOrders = (ord as any[]).map(o => ({
                ...o,
                id: o._id || o.id,
                partName: o.partName || (o.items?.[0]?.name) || 'Spare Part',
                quantity: o.quantity || (o.items?.[0]?.quantity) || 1,
                location: o.location || (o.customer?.city) || 'Direct Order',
                urgency: o.urgency || 'Normal',
                amount: o.amount || o.totalAmount || 0,
                type: o.type || 'Car'
            }));

            const normalizedWholesale = (w_ord as any[]).map(wo => ({
                ...wo,
                id: wo._id || wo.id,
                technicianName: wo.technicianName || (wo.technician?.garageName) || (wo.technician?.fullName) || 'Master Technician'
            }));

            setOrders(normalizedOrders as any);
            setWholesaleOrders(normalizedWholesale);

            // Priority: profile field > mock (for now until getDashboard is fully utilized)
            setWalletBalance(profile?.walletBalance || 15400);
        } catch (e) {
            console.error("Failed to load supplier data", e);
        }
    };

    const submitRegistration = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await supplierService.updateProfile(data);
            const newProfile = { ...response, status: 'pending_approval' };

            await AsyncStorage.setItem('supplier_profile', JSON.stringify(newProfile));
            setProfile(newProfile);
            setIsRegistered(true);
            setIsApproved(response.status === 'approved'); // Respect backend status

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
            await AsyncStorage.setItem('supplier_profile', JSON.stringify(response));
            setProfile(response);
        } catch (e) {
            console.error("Profile update failed", e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const addProduct = async (product: any) => {
        try {
            const newProduct = await supplierService.addProduct(product);
            setInventory(prev => [...prev, {
                ...newProduct,
                id: newProduct._id || newProduct.id,
                type: newProduct.category || product.type,
                quantity: newProduct.stock || product.quantity,
                deliveryTime: newProduct.deliveryTime || '2-3 Days'
            }]);
        } catch (e) {
            console.error("Failed to add product", e);
            throw e;
        }
    };

    const updateProduct = async (id: string, product: any) => {
        try {
            const updated = await supplierService.updateProduct(id, product);
            setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
        } catch (e) {
            console.error("Failed to update product", e);
            throw e;
        }
    };

    const updateOrder = async (orderId: string, action: string, status?: string, data?: any) => {
        let finalStatus = status || action;
        if (action === 'accept') finalStatus = 'accepted';
        if (action === 'reject') finalStatus = 'rejected';

        try {
            // Optimistic update for standard orders
            setOrders(prev => prev.map(o => {
                if (o.id === orderId) {
                    return { ...o, status: finalStatus as any, ...(data?.totalAmount ? { amount: data.totalAmount } : {}) };
                }
                return o;
            }));

            // Optimistic update for wholesale orders
            setWholesaleOrders(prev => prev.map(o => {
                if (o.id === orderId) {
                    return { ...o, status: finalStatus as any, ...(data?.totalAmount ? { amount: data.totalAmount } : {}) };
                }
                return o;
            }));

            await supplierService.updateOrderStatus(orderId, finalStatus, data);
            await loadBusinessData(); // Refresh to get exact state
        } catch (e) {
            console.error("Failed to update order", e);
            throw e;
        }
    };

    // Real-time Updates via Socket.io
    useEffect(() => {
        if (!user || user.role !== 'supplier') return;

        const socket = socketService.connect();
        if (user.id) {
            socketService.register(user.id);
        }

        const handleOrderUpdate = (data: any) => {
            console.log('Supplier: Order Update Received via Socket:', data);
            loadBusinessData();
        };

        socketService.on('order_update', handleOrderUpdate);

        // Polling as a fallback (less frequent)
        const interval = setInterval(() => {
            if (isApproved) {
                loadBusinessData();
            }
        }, 60000); // 1 minute polling for suppliers

        return () => {
            socketService.off('order_update', handleOrderUpdate);
            clearInterval(interval);
        };
    }, [user, isApproved]);

    // Push Notifications Logic
    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync().then(token => {
            if (token) {
                supplierService.updateProfile({ pushToken: token }).catch(e => console.log('Supplier Token Update Failed', e));
            }
        });

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            loadBusinessData();
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Tapped', response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, [user]);

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
            sendQuotation: async (orderId, items, totalAmount) => {
                await supplierService.sendQuotation(orderId, items, totalAmount);
                await loadBusinessData();
            },
            requestWithdrawal: async (amount, bankAccountId) => {
                await supplierService.requestWithdrawal(amount, bankAccountId);
                await loadBusinessData(); // refresh balance
            }
        }}>
            {children}
        </SupplierContext.Provider>
    );
}
