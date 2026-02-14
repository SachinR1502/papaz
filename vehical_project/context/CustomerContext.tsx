import { customerService } from '@/services/customerService';
import { socketService } from '@/services/socket';
import { ServiceRequest, Vehicle } from '@/types/models';
import { registerForPushNotificationsAsync } from '@/utils/notificationHelper';
import { StorageHelper } from '@/utils/storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface CustomerContextType {
    vehicles: Vehicle[];
    activeJobs: ServiceRequest[];
    historyJobs: ServiceRequest[];
    profile: any;
    wishlist: any[];
    cart: CartItem[];
    addToCart: (product: any) => void;
    updateCartQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    addVehicle: (vehicle: Omit<Vehicle, 'id' | 'qrCode'>) => Promise<string>;
    createServiceRequest: (
        vehicleId: string,
        description: string,
        photos?: string[],
        voiceUri?: string | null,
        address?: string,
        technicianId?: string | null,
        locationValue?: { latitude: number; longitude: number } | null,
        requirements?: { title: string; isCompleted: boolean }[],
        metadata?: any
    ) => Promise<void>;
    respondToBill: (jobId: string, action: 'approve' | 'reject', paymentMethod?: 'cash' | 'online' | 'razorpay' | 'wallet') => Promise<void>;
    respondToQuote: (jobId: string, action: 'approve' | 'reject' | 'accept_with_parts' | 'accept_own_parts') => Promise<void>;
    requestPart: (partNameOrData: string | any, partNo?: string, brand?: string, description?: string, qty?: number, supplierId?: string) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    getVehicleHistory: (vehicleId: string) => Promise<any[]>;
    refresh: () => Promise<void>;
    isLoading: boolean;
    garages: any[];
    loadGarages: (vehicleType?: string, lat?: number, lng?: number) => Promise<void>;
    addNewAddress: (dataOrLabel: any, address?: string, icon?: string) => Promise<void>;
    updateAddress: (id: string, dataOrLabel: any, address?: string, icon?: string) => Promise<void>;
    removeAddress: (id: string) => Promise<void>;
    updateWishlist: () => Promise<void>;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    getWalletHistory: () => Promise<any[]>;
    topupWallet: (amount: number, referenceId: string) => Promise<void>;
    addCard: (data: any) => Promise<void>;
    removeCard: (cardId: string) => Promise<void>;
    transactions: any[];
    rateJob: (jobId: string, rating: number, review: string) => Promise<void>;
    cancelJob: (jobId: string, reason: string) => Promise<void>;
    uploadFile: (fileUri: string, type?: 'image' | 'audio') => Promise<any>;
}

interface CartItem {
    id: string;
    _id?: string;
    name: string;
    price: string;
    category: string;
    image: string;
    quantity: number;
    rating: number;
    supplier?: {
        id: string;
        storeName: string;
        fullName: string;
    };
}

const CustomerContext = createContext<CustomerContextType>({
    vehicles: [],
    activeJobs: [],
    historyJobs: [],
    profile: null,
    wishlist: [],
    cart: [],
    addToCart: () => { },
    updateCartQuantity: () => { },
    clearCart: () => { },
    addVehicle: async () => '',
    createServiceRequest: async () => { },
    respondToBill: async () => { },
    respondToQuote: async () => { },
    requestPart: async () => { },
    updateProfile: async () => { },
    getVehicleHistory: async () => [],
    refresh: async () => { },
    isLoading: true,
    garages: [],
    loadGarages: async () => { },
    addNewAddress: async () => { },
    updateAddress: async () => { },
    removeAddress: async () => { },
    updateWishlist: async () => { },
    addToWishlist: async () => { },
    removeFromWishlist: async () => { },
    getWalletHistory: async () => [],
    topupWallet: async () => { },
    addCard: async () => { },
    removeCard: async () => { },
    transactions: [],
    rateJob: async () => { },
    cancelJob: async () => { },
    uploadFile: async () => Promise.resolve(),
});

export const useCustomer = () => useContext(CustomerContext);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [activeJobs, setActiveJobs] = useState<ServiceRequest[]>([]);
    const [historyJobs, setHistoryJobs] = useState<ServiceRequest[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { user, logout } = useAuth();

    const initialLoadDone = React.useRef(false);

    // Real-time Updates via Socket.io
    useEffect(() => {
        if (!user) {
            initialLoadDone.current = false; // Reset on logout
            return;
        }

        // Initial load (only once per login)
        if (!initialLoadDone.current) {
            console.log('[CustomerContext] Clearing cache on login...');
            const { clearCache } = require('@/services/apiClient');
            clearCache();
            initialLoadDone.current = true;

            loadData();
        }

        const socket = socketService.connect();
        if (user.id || (user as any)._id) {
            socketService.register(user.id || (user as any)._id);
        }

        const handleJobUpdate = (data: any) => {
            console.log('Job Update Received via Socket:', data);

            // Invalidate cache to ensure fresh data
            const { invalidateCache } = require('@/services/apiClient');
            invalidateCache('customer');
            invalidateCache('jobs');

            loadData();
        };

        const handleOrderUpdate = (data: any) => {
            console.log('Order Update Received via Socket:', data);

            // Invalidate cache to ensure fresh data
            const { invalidateCache } = require('@/services/apiClient');
            invalidateCache('customer');
            invalidateCache('orders');

            loadData();
        };

        socketService.on('job_update', handleJobUpdate);
        socketService.on('order_update', handleOrderUpdate);

        // Polling as a fallback (less frequent)
        const interval = setInterval(() => {
            loadData();
        }, 30000); // 30s

        return () => {
            socketService.off('job_update', handleJobUpdate);
            socketService.off('order_update', handleOrderUpdate);
            clearInterval(interval);
        };
    }, [user]);

    // Push Notifications Logic (Existing)
    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync().then(token => {
            if (token) {
                // Update profile silently
                customerService.updateProfile({ pushToken: token }).catch(e => console.log('Token update failed', e));
            }
        });

        // Listeners for push notifications
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            loadData(); // Refresh data on notification
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Tapped', response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, [user]);

    const loadData = async () => {
        try {
            // Fetch specialized data via API service in parallel
            const [dashboard, history, txs] = await Promise.all([
                customerService.getDashboard(),
                customerService.getHistory(),
                customerService.getWalletHistory()
            ]);

            // Normalize data: Map _id to id and ensure vehicleId is correctly referenced
            const normalizedVehicles = (dashboard.vehicles || []).map((v: any) => ({
                ...v,
                id: v.id || v._id
            }));

            const normalizedActive = (dashboard.activeJobs || []).map((j: any) => ({
                ...j,
                id: j.id || j._id,
                vehicleId: j.vehicleId || (typeof j.vehicle === 'string' ? j.vehicle : (j.vehicle?.id || j.vehicle?._id))
            }));

            const normalizedHistory = (history || []).map((j: any) => ({
                ...j,
                id: j.id || j._id,
                vehicleId: j.vehicleId || (typeof j.vehicle === 'string' ? j.vehicle : (j.vehicle?.id || j.vehicle?._id))
            }));

            setVehicles(normalizedVehicles);
            setActiveJobs(normalizedActive);
            setHistoryJobs(normalizedHistory);
            setProfile(dashboard.profile || null);
            setWishlist(dashboard.profile?.wishlist || []);

            setTransactions(txs || []);

            /* Legacy separate calls - removed in favor of dashboard
            const [vehicleList, jobs] = await Promise.all([
                api.getVehicles(),
                api.getJobs()
            ]); 
            */

            // Fetch other data
            const c = await StorageHelper.get<CartItem[]>('customer_cart', []);
            setCart(c);
        } catch (e: any) {
            console.error('Failed to load customer data', e);
            if (e.response?.status === 401) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (product: any) => {
        const updatedCart = [...cart];
        const productId = product.id || product._id;
        const existing = updatedCart.find(item => (item.id || item._id) === productId);

        if (existing) {
            existing.quantity += 1;
        } else {
            // Ensure the item in cart has an id property for consistency
            updatedCart.push({
                ...product,
                id: productId,
                quantity: 1
            });
        }
        setCart(updatedCart);
        await StorageHelper.set('customer_cart', updatedCart);
    };

    const updateCartQuantity = async (id: string, delta: number) => {
        const updatedCart = cart.map(item => {
            if ((item.id || item._id) === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);
        setCart(updatedCart);
        await StorageHelper.set('customer_cart', updatedCart);
    };

    const clearCart = async () => {
        setCart([]);
        await StorageHelper.clear('customer_cart');
    };

    const addVehicle = async (data: Omit<Vehicle, 'id' | 'qrCode'>): Promise<string> => {
        try {
            const response = await customerService.addVehicle(data);
            console.log('Add vehicle response:', response);

            // Backend returns the vehicle directly with toJSON transform applied
            if (response && (response.id || response._id)) {
                const newVehicle = {
                    ...response,
                    id: response.id || response._id
                };
                setVehicles(prev => [newVehicle, ...prev]);
                return newVehicle.id;
            }

            throw new Error('Failed to register vehicle');
        } catch (e: any) {
            console.error('Add vehicle error', e);
            console.error('Error response:', e.response?.data);
            throw e;
        }
    };

    const createServiceRequest = async (
        vehicleId: string,
        description: string,
        photos: string[] = [],
        voiceUri: string | null = null,
        address: string = '',
        technicianId: string | null = null,
        locationValue: { latitude: number; longitude: number } | null = null,
        requirements: { title: string; isCompleted: boolean }[] = [],
        metadata: any = {}
    ) => {
        try {
            await customerService.createJob({
                vehicleId,
                description,
                photos,
                voiceNote: voiceUri,
                location: {
                    address,
                    latitude: locationValue?.latitude || 0,
                    longitude: locationValue?.longitude || 0
                },
                technicianId,
                requirements,
                ...metadata
            });
            await loadData();
        } catch (e) {
            console.error('Failed to create request', e);
            throw e;
        }
    };

    const respondToBill = async (jobId: string, action: 'approve' | 'reject', paymentMethod?: 'cash' | 'online' | 'razorpay' | 'wallet') => {
        try {
            await customerService.respondToBill(jobId, action, paymentMethod);
            await loadData();
        } catch (e) {
            console.error('Failed to respond to bill', e);
            throw e;
        }
    };

    const respondToQuote = async (jobId: string, action: 'approve' | 'reject' | 'accept_with_parts' | 'accept_own_parts') => {
        try {
            await customerService.respondToQuote(jobId, action);
            await loadData();
        } catch (e) {
            console.error('Failed to respond to quote', e);
            throw e;
        }
    };

    const requestPart = async (partNameOrData: string | any, partNo?: string, brand?: string, description?: string, qty?: number, supplierId?: string) => {
        try {
            if (typeof partNameOrData === 'object') {
                // New signature: pass object directly
                await customerService.requestPart(partNameOrData);
            } else {
                // Legacy signature: construct object from args
                await customerService.requestPart({
                    items: [], // Legacy call might not involve multi-items yet
                    name: partNameOrData,
                    partNumber: partNo || '',
                    brand: brand || '',
                    description: description || '',
                    quantity: qty || 1,
                    supplierId
                });
            }
            // await loadData();
        } catch (e) {
            console.error('Failed to request part', e);
            throw e;
        }
    };

    const updateProfile = async (data: any) => {
        try {
            const updatedProfile = await customerService.updateProfile(data);
            setProfile(updatedProfile);
        } catch (e) {
            console.error('Failed to update profile', e);
            throw e;
        }
    };

    const getVehicleHistory = async (vehicleId: string) => {
        try {
            return await customerService.getVehicleHistory(vehicleId);
        } catch (e) {
            console.error('Failed to get vehicle history', e);
            return [];
        }
    };

    const [garages, setGarages] = useState<any[]>([]);

    const loadGarages = async (vehicleType?: string, lat?: number, lng?: number) => {
        try {
            const data = await customerService.getGarages(lat, lng, vehicleType);
            setGarages(data);
        } catch (e) {
            console.error("Failed to load garages", e);
        }
    };

    const addNewAddress = async (dataOrLabel: any, address?: string, icon?: string) => {
        try {
            const payload = typeof dataOrLabel === 'string' ? { label: dataOrLabel, address, icon } : dataOrLabel;
            await customerService.addAddress(payload);
            await loadData();
        } catch (e) {
            console.error('Failed to add address', e);
            throw e;
        }
    };

    const updateAddress = async (id: string, dataOrLabel: any, address?: string, icon?: string) => {
        try {
            const payload = typeof dataOrLabel === 'string' ? { label: dataOrLabel, address, icon } : dataOrLabel;
            await customerService.updateAddress(id, payload);
            await loadData();
        } catch (e) {
            console.error('Failed to update address', e);
            throw e;
        }
    };

    const removeAddress = async (id: string) => {
        try {
            await customerService.removeAddress(id);
            await loadData();
        } catch (e) {
            console.error('Failed to remove address', e);
            throw e;
        }
    };

    const addToWishlist = async (productId: string) => {
        try {
            const updatedWishlist = await customerService.addToWishlist(productId);
            setWishlist(updatedWishlist);
        } catch (e) {
            console.error('Failed to add to wishlist', e);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            const updatedWishlist = await customerService.removeFromWishlist(productId);
            setWishlist(updatedWishlist);
        } catch (e) {
            console.error('Failed to remove from wishlist', e);
        }
    };

    const updateWishlist = async () => {
        try {
            const data = await customerService.getWishlist();
            setWishlist(data);
        } catch (e) {
            console.error(e);
        }
    };

    const getWalletHistory = async () => {
        try {
            const data = await customerService.getWalletHistory();
            setTransactions(data);
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const topupWallet = async (amount: number, referenceId: string) => {
        try {
            await customerService.topupWallet(amount, referenceId);
            await loadData();
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const addCard = async (data: any) => {
        try {
            await customerService.addCard(data);
            await loadData();
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const removeCard = async (cardId: string) => {
        try {
            await customerService.removeCard(cardId);
            await loadData();
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const rateJob = async (jobId: string, rating: number, review: string) => {
        try {
            await customerService.rateJob(jobId, rating, review);
            await loadData();
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const cancelJob = async (jobId: string, reason: string) => {
        try {
            await customerService.cancelJob(jobId, reason);
            await loadData();
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const uploadFile = async (fileUri: string, type: 'image' | 'audio' = 'image') => {
        try {
            return await customerService.uploadFile(fileUri, type);
        } catch (e) {
            console.error('Failed to upload file', e);
            throw e;
        }
    };

    return (
        <CustomerContext.Provider value={{
            vehicles,
            activeJobs,
            historyJobs,
            profile,
            cart,
            addToCart,
            updateCartQuantity,
            clearCart,
            addVehicle,
            createServiceRequest,
            respondToBill,
            respondToQuote,
            requestPart,
            updateProfile,
            getVehicleHistory,
            refresh: loadData,
            isLoading,
            garages,
            loadGarages,
            addNewAddress,
            updateAddress,
            removeAddress,
            wishlist,
            addToWishlist,
            removeFromWishlist,
            updateWishlist,
            getWalletHistory,
            topupWallet,
            addCard,
            removeCard,
            transactions,
            rateJob,
            cancelJob,
            uploadFile
        }}>
            {children}
        </CustomerContext.Provider>
    );
}
