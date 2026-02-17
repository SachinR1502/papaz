import { socketService } from '@/services/socket';
import { soundNotificationService } from '@/services/soundNotificationService';
import { technicianService } from '@/services/technicianService';
import { BillItem, ServiceRequest } from '@/types/models';
import { registerForPushNotificationsAsync } from '@/utils/notificationHelper';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface TechnicianJob extends ServiceRequest {
    // Extended properties specific to Technician view (if any not in ServiceRequest)
    // Currently ServiceRequest in models.ts covers most, but we keep this interface for future extension
    distance?: string;
    vehicleNumber?: string;
    chassisNumber?: string;
    mileage?: string;
    manufacturersYear?: string;
    engineNumber?: string;
    fuelType?: string;
    bsNorm?: string;
    vehicleType?: string;
    vehicleImage?: string;
    customerName?: string;
    partRequests?: any[]; // Associated part orders/inquiries for this job
}

interface TechnicianContextType {

    availableJobs: TechnicianJob[];
    myJobs: TechnicianJob[];
    isLoading: boolean;
    isOnline: boolean;
    isApproved: boolean;
    isRegistered: boolean;
    walletBalance: number;
    profile: any;
    updateProfile: (updates: any) => Promise<void>;
    submitRegistration: (data: any) => Promise<void>;
    toggleOnline: () => void;
    acceptJob: (jobId: string) => Promise<void>;
    cancelJob: (jobId: string, reason: string) => Promise<void>;
    markArrived: (jobId: string) => Promise<void>;
    sendQuote: (jobId: string, items: BillItem[], laborAmount: number, metadata?: { note?: string, photos?: string[], voiceNote?: string | null }, vehicleId?: string) => Promise<void>;
    updateJobStatus: (jobId: string, status: string) => Promise<void>;
    sendBill: (jobId: string, items: BillItem[], laborAmount: number, metadata?: { note?: string, photos?: string[], voiceNote?: string | null }, vehicleId?: string) => Promise<void>;
    refreshJobs: (forceApproved?: boolean, silent?: boolean) => Promise<void>;
    completeJob: (jobId: string) => Promise<void>;
    partsInventory: any[];
    addPart: (part: any) => Promise<void>;
    updatePart: (part: any) => Promise<void>;
    deletePart: (partId: string) => Promise<void>;
    businessCart: any[];
    addToBusinessCart: (product: any) => Promise<void>;
    updateBusinessCartQuantity: (id: string, delta: number) => Promise<void>;
    clearBusinessCart: () => Promise<void>;
    requestParts: (jobId: string, parts: any[], metadata?: { photos?: string[], voiceNote?: string | null, supplierId?: string | null }) => Promise<void>;
    addRepairDetails: (jobId: string, details: any) => Promise<void>;
    getVehicleHistory: (vehicleId: string) => Promise<any>;
    requestProduct: (productId: string, quantity: number, shopId: string, jobId?: string, customName?: string, customDescription?: string, customBrand?: string, photos?: string[], voiceNote?: string | null) => Promise<void>;
    updateRequirementStatus: (jobId: string, reqId: string, isCompleted: boolean) => Promise<void>;
    uploadFile: (fileUri: string, type: 'image' | 'audio') => Promise<any>;
    requestWithdrawal: (amount: number, bankAccountId?: string) => Promise<void>;
    respondToPartRequest: (requestId: string, action: 'accept' | 'reject') => Promise<void>;
    getWallet: () => Promise<any>;
    refresh: () => Promise<void>;
}

const TechnicianContext = createContext<TechnicianContextType>({
    availableJobs: [],
    myJobs: [],
    isLoading: true,
    isOnline: false,
    isApproved: false,
    isRegistered: false,
    walletBalance: 0,
    profile: null,
    updateProfile: async () => { },
    submitRegistration: async () => { },
    toggleOnline: () => { },
    acceptJob: async () => { },
    cancelJob: async () => { },
    markArrived: async () => { },
    sendQuote: async () => { },
    updateJobStatus: async () => { },
    sendBill: async () => { },
    refreshJobs: async () => { },
    completeJob: async () => { },
    partsInventory: [],
    addPart: async () => { },
    updatePart: async () => { },
    deletePart: async () => { },
    businessCart: [],
    addToBusinessCart: async () => { },
    updateBusinessCartQuantity: async () => { },
    clearBusinessCart: async () => { },
    requestParts: async (jobId: string, parts: any[], metadata?: any) => { },
    addRepairDetails: async () => { },
    getVehicleHistory: async () => null,
    requestProduct: async (productId: string, quantity: number, shopId: string, jobId?: string, customName?: string, customDescription?: string, customBrand?: string, photos?: string[], voiceNote?: string | null) => { },
    updateRequirementStatus: async () => { },
    uploadFile: async () => { },
    requestWithdrawal: async () => { },
    respondToPartRequest: async () => { },
    getWallet: async () => ({ transactions: [] }),
    refresh: async () => { },
});

export const useTechnician = () => useContext(TechnicianContext);

export function TechnicianProvider({ children }: { children: React.ReactNode }) {
    const [availableJobs, setAvailableJobs] = useState<TechnicianJob[]>([]);
    const [myJobs, setMyJobs] = useState<TechnicianJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [walletBalance, setWalletBalance] = useState(1245.50);
    const [businessCart, setBusinessCart] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);

    const [partsInventory, setPartsInventory] = useState<any[]>([]);

    const { user, logout } = useAuth();

    // Push Notifications Logic moved to bottom

    const initialLoadDone = React.useRef(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.role === 'technician') {
                try {
                    const techProfile = user.profile;

                    if (techProfile) {
                        // A user is only fully "registered" when they complete all onboarding steps
                        setIsRegistered(!!user.profileCompleted);
                        const approved = techProfile.isApproved === true || techProfile.isApproved === 'true';
                        setIsApproved(approved);
                        setProfile(techProfile);
                        setWalletBalance(techProfile.walletBalance || 0);
                        setIsOnline(techProfile.isOnline ?? true);

                        if (approved && !initialLoadDone.current) {
                            // Clear cache to ensure fresh data on login (only once)
                            console.log('[TechnicianContext] Clearing cache on login...');
                            const { clearCache } = require('@/services/apiClient');
                            clearCache();
                            initialLoadDone.current = true;

                            loadJobs(true);
                        } else if (approved && initialLoadDone.current) {
                            // Already loaded, just set loading false
                            setIsLoading(false);
                        } else {
                            setIsLoading(false); // Fix: Set loading false if not approved
                        }
                    } else {
                        setIsRegistered(false);
                        setIsApproved(false);
                        setIsLoading(false); // Fix: Set loading false if not registered
                    }
                } catch (e) {
                    console.error("Failed to fetch tech profile");
                    setIsLoading(false);
                }
            } else {
                // Not a technician, stop loading
                setIsLoading(false);
            }
        };
        if (user) {
            fetchProfile();
        } else {
            // No user, maybe auth is loading?
            // If auth is done and no user, we shouldn't be here, but set loading false to be safe
            initialLoadDone.current = false; // Reset on logout
            setIsLoading(false);
        }
    }, [user]);

    const toggleOnline = async () => {
        const newStatus = !isOnline;
        setIsOnline(newStatus);
        try {
            await technicianService.updateProfile({ isOnline: newStatus });
        } catch (e) {
            console.error('Failed to sync online status', e);
            setIsOnline(!newStatus); // Rollback
        }
    };

    const loadInventory = async () => {
        try {
            const data = await technicianService.getInventory();
            setPartsInventory(data || []);
        } catch (e) {
            console.error('Failed to load inventory', e);
        }
    };

    const loadJobs = async (forceApproved = false, silent = false) => {
        if (!user) {
            if (!silent) setIsLoading(false);
            return;
        }

        // block loading jobs if not approved (unless forced)
        const canLoad = forceApproved || isApproved || (profile && (profile.isApproved === true || profile.isApproved === 'true'));

        if (!canLoad) {
            if (!silent) setIsLoading(false);
            return;
        }

        if (!silent) setIsLoading(true);
        try {
            console.log('[TechnicianContext] Loading jobs...');
            const [data, profileData, inventoryData] = await Promise.all([
                technicianService.getJobs(),
                !silent ? technicianService.getProfile() : Promise.resolve(null),
                technicianService.getInventory()
            ]);

            console.log('[TechnicianContext] API Response data:', {
                availableCount: data?.available?.length,
                myJobsCount: data?.myJobs?.length,
                availableJobs: data?.available?.map((j: any) => ({ id: j._id || j.id, status: j.status })),
                myJobs: data?.myJobs?.map((j: any) => ({ id: j._id || j.id, status: j.status }))
            });

            if (inventoryData) {
                setPartsInventory(inventoryData || []);
            }

            if (profileData) {
                console.log('[TechnicianContext] Profile fetched, isApproved:', profileData.isApproved);
                setProfile(profileData);
                setWalletBalance(profileData.walletBalance || 0);
            }

            if (data && typeof data === 'object') {
                // New backend format
                const mappedAvailable = (data.available || []).map((j: any) => ({
                    ...j,
                    id: j._id || j.id,
                    vehicleId: j.vehicleId || (typeof j.vehicle === 'object' && j.vehicle ? (j.vehicle.id || j.vehicle._id) : j.vehicle),
                    customerName: j.customer?.fullName,
                    vehicleNumber: j.vehicle?.registrationNumber || j.vehicleNumber,
                    vehicleModel: typeof j.vehicle === 'object' && j.vehicle ? `${j.vehicle.make} ${j.vehicle.model}` : j.vehicleModel
                }));

                const mappedMyJobs = (data.myJobs || []).map((j: any) => ({
                    ...j,
                    id: j._id || j.id,
                    vehicleId: j.vehicleId || (typeof j.vehicle === 'object' && j.vehicle ? (j.vehicle.id || j.vehicle._id) : j.vehicle),
                    customerName: j.customer?.fullName,
                    vehicleNumber: j.vehicle?.registrationNumber || j.vehicleNumber,
                    vehicleModel: typeof j.vehicle === 'object' && j.vehicle ? `${j.vehicle.make} ${j.vehicle.model}` : j.vehicleModel
                }));

                console.log('[TechnicianContext] Setting state:');
                console.log('  - Available jobs:', mappedAvailable.length, mappedAvailable.map((j: any) => j.id));
                console.log('  - My jobs:', mappedMyJobs.length, mappedMyJobs.map((j: any) => j.id));
                setAvailableJobs(mappedAvailable);
                setMyJobs(mappedMyJobs);
            } else {
                console.warn('[TechnicianContext] Invalid data format received');
                setAvailableJobs([]);
                setMyJobs([]);
            }
        } catch (e: any) {
            console.error('Failed to load technician jobs', e);
            if (e.response?.status === 401) {
                logout();
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const completeJob = async (jobId: string) => {
        await technicianService.updateJobStatus(jobId, 'completed');
        // Refresh jobs and profile to get updated balance from backend
        await loadJobs(false, true);
    };

    const acceptJob = async (jobId: string) => {
        // Optimistic Update
        const jobToAccept = availableJobs.find(j => j.id === jobId) || myJobs.find(j => j.id === jobId);
        if (!jobToAccept) {
            // If not found locally, proceed with API call normally
            await technicianService.acceptJob(jobId);
            await loadJobs();
            return;
        }

        const previousAvailable = [...availableJobs];
        const previousMyJobs = [...myJobs];

        try {
            // Update local state immediately
            setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
            setMyJobs(prev => {
                // Check if already in myJobs to avoid duplicates (though rare in this flow)
                if (prev.find(j => j.id === jobId)) return prev;
                return [...prev, { ...jobToAccept, status: 'accepted' }];
            });

            await technicianService.acceptJob(jobId);
            // No need to reload immediately if optimistic update was correct, 
            // but reloading ensures eventual consistency. We can do a silent reload.
            await loadJobs(false, true);
        } catch (e) {
            console.error('Failed to accept job', e);
            // Revert state on failure
            setAvailableJobs(previousAvailable);
            setMyJobs(previousMyJobs);
            throw e;
        }
    };

    const cancelJob = async (jobId: string, reason: string) => {
        try {
            await technicianService.cancelJob(jobId, reason);
            await loadJobs();
        } catch (e) {
            console.error('Failed to cancel job', e);
            throw e;
        }
    };

    const markArrived = async (jobId: string) => {
        const previousMyJobs = [...myJobs];
        try {
            // Optimistic Update
            setMyJobs(prev => prev.map(j =>
                j.id === jobId ? { ...j, status: 'arrived' } : j
            ));

            await technicianService.markArrived(jobId);
            await loadJobs(false, true);
        } catch (e) {
            console.error('Failed to mark arrived', e);
            // Revert
            setMyJobs(previousMyJobs);
            throw e;
        }
    };

    const sendQuote = async (jobId: string, items: BillItem[], laborAmount: number, metadata?: { note?: string, photos?: string[], voiceNote?: string | null }, vehicleId?: string) => {
        try {
            await technicianService.sendQuote(jobId, items, laborAmount, metadata, vehicleId);
            await loadJobs();
        } catch (e) {
            console.error('Failed to send quote', e);
            throw e;
        }
    };

    const updateJobStatus = async (jobId: string, status: string) => {
        const previousMyJobs = [...myJobs];
        try {
            // Optimistic Update
            setMyJobs(prev => prev.map(j =>
                j.id === jobId ? { ...j, status: status as any } : j
            ));

            await technicianService.updateJobStatus(jobId, status);
            await loadJobs(false, true);
        } catch (e) {
            console.error('Failed to update status', e);
            // Revert
            setMyJobs(previousMyJobs);
            throw e;
        }
    };

    const sendBill = async (jobId: string, items: BillItem[], laborAmount: number, metadata?: { note?: string, photos?: string[], voiceNote?: string | null }, vehicleId?: string) => {
        try {
            await technicianService.sendBill(jobId, items, laborAmount, metadata, vehicleId);
            await loadJobs();
        } catch (e) {
            console.error('Failed to send bill', e);
            throw e;
        }
    };

    const requestParts = async (jobId: string, parts: any[], metadata?: { photos?: string[], voiceNote?: string | null, supplierId?: string | null }) => {
        console.log(`Parts requested for job ${jobId}:`, parts, metadata);
        await technicianService.requestParts(jobId, parts, metadata);
        await loadJobs();
    };

    const addRepairDetails = async (jobId: string, details: any) => {
        await technicianService.addRepairDetails(jobId, details);
        await loadJobs();
    };

    // Real-time Updates via Socket.io
    useEffect(() => {
        if (!user || user.role !== 'technician') return;

        const socket = socketService.connect();
        if (user.id) {
            socketService.register(user.id);
        }

        const handleJobUpdate = (data: any) => {
            console.log('[SOCKET] ========== JOB UPDATE RECEIVED ==========');
            console.log('[SOCKET] Full data:', data);
            console.log('[SOCKET] Type:', data?.type, 'Status:', data?.status, 'JobID:', data?.jobId);

            // CRITICAL: Invalidate cache to ensure fresh data
            console.log('[SOCKET] Invalidating jobs cache...');
            const { invalidateCache } = require('@/services/apiClient');
            invalidateCache('technician/jobs');
            invalidateCache('jobs');

            // Sound Notification Logic
            const isCreation = data?.action === 'create' || data?.type === 'new_request' || data?.status === 'pending' || data?.type === 'new_broadcast';

            if (isCreation) {
                // Better detection using the structure sent from backend
                const isDirectAssignment =
                    data?.type === 'new_request' ||
                    data?.status === 'new_request' ||
                    data?.job?.technician === profile?._id ||
                    data?.technicianId === user?.id;

                const isBroadcast = data?.broadcast === true || data?.type === 'new_broadcast' || data?.job?.isBroadcast === true;

                if (isDirectAssignment) {
                    console.log('Playing direct assignment sound');
                    soundNotificationService.playDirectAssignment(); // Corrected method name
                } else if (isBroadcast) {
                    // FILTER BROADCAST SOUNDS BY DISTANCE
                    // If we have profile location and job location, check if it's within radius
                    let isNearby = true;
                    if (profile?.location?.coordinates && data?.job?.location?.coordinates) {
                        const [myLng, myLat] = profile.location.coordinates;
                        const [jobLng, jobLat] = data.job.location.coordinates;

                        // Simple 1 degree ~= 111km approximation for filtering
                        // Let's filter if further than ~1 degree (very generous)
                        const distSq = Math.pow(myLng - jobLng, 2) + Math.pow(myLat - jobLat, 2);
                        if (distSq > 1.0) { // Approx > 111km
                            isNearby = false;
                            console.log('Broadcast job is too far away, skipping sound');
                        }
                    }

                    if (isNearby) {
                        console.log('Playing broadcast sound');
                        soundNotificationService.playNewBroadcast();
                    }
                }
            } else if (data?.action === 'update' || data?.status === 'updated') {
                // Optional: Notify of specific updates 
            }

            console.log('[SOCKET] Triggering job refresh...');
            loadJobs(false, true).then(() => {
                console.log('[SOCKET] ✅ Job refresh completed');
            }).catch(err => {
                console.error('[SOCKET] ❌ Job refresh failed:', err);
            });
        };

        const handleOrderUpdate = (data: any) => {
            console.log('Technician: Order Update Received via Socket:', data);

            // Invalidate cache to ensure fresh data
            const { invalidateCache } = require('@/services/apiClient');
            invalidateCache('technician/jobs');
            invalidateCache('jobs');
            soundNotificationService.playMessage(); // Use message sound for orders for now
            loadJobs(false, true); // Silent refresh
        };

        socketService.on('job_update', handleJobUpdate);
        socketService.on('order_update', handleOrderUpdate);

        // Polling as a fallback (less frequent)
        const interval = setInterval(() => {
            if (isOnline) {
                loadJobs(false, true);
            }
        }, 30000); // 30s instead of 10s

        return () => {
            socketService.off('job_update', handleJobUpdate);
            socketService.off('order_update', handleOrderUpdate);
            clearInterval(interval);
        };
    }, [user, isOnline]);

    const requestProduct = async (productId: string, quantity: number, shopId: string, jobId?: string, customName?: string, customDescription?: string, customBrand?: string, photos?: string[], voiceNote?: string | null) => {
        await technicianService.requestProduct(productId, quantity, shopId, jobId, customName, customDescription, customBrand, photos, voiceNote);
        await loadJobs();
    };

    const getVehicleHistory = async (vehicleId: string) => {
        try {
            return await technicianService.getVehicleHistory(vehicleId);
        } catch (e) {
            console.error("Failed to fetch history", e);
            return null;
        }
    };

    const addPart = async (part: any) => {
        await technicianService.addPart(part);
        await loadInventory();
    };

    const updatePart = async (updatedPart: any) => {
        const id = updatedPart.id || updatedPart._id;
        await technicianService.updatePart(id, updatedPart);
        await loadInventory();
    };

    const deletePart = async (partId: string) => {
        await technicianService.deletePart(partId);
        await loadInventory();
    };

    const updateProfile = async (updates: any) => {
        await technicianService.updateProfile(updates);
        setProfile((prev: any) => ({ ...prev, ...updates }));
    };

    const updateRequirementStatus = async (jobId: string, reqId: string, isCompleted: boolean) => {
        try {
            await technicianService.updateRequirementStatus(jobId, reqId, isCompleted);
            await loadJobs(false, true);
        } catch (e) {
            console.error('Failed to update requirement status', e);
            throw e;
        }
    };

    const addToBusinessCart = async (product: any) => {
        setBusinessCart((prev: any[]) => {
            const prodId = product._id || product.id;
            const existing = prev.find(item => (item._id || item.id) === prodId);
            if (existing) {
                return prev.map(item => (item._id || item.id) === prodId ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateBusinessCartQuantity = async (id: string, delta: number) => {
        setBusinessCart((prev: any[]) => prev.map(item => {
            const itemId = item._id || item.id;
            if (itemId === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearBusinessCart = async () => {
        setBusinessCart([]);
    };

    const submitRegistration = async (data: any) => {
        setProfile(data);
        setIsRegistered(true);
    };

    // Push Notifications Logic
    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync().then(token => {
            if (token) {
                technicianService.updateProfile({ pushToken: token }).catch(e => console.log('Tech Token Update Failed', e));
            }
        });

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            loadJobs(false, true); // Silent refresh
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Tapped', response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, [user]);

    const respondToPartRequest = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            await technicianService.respondToPartRequest(requestId, action);
            await loadJobs(false, true);
        } catch (e) {
            console.error('Failed to respond to part request', e);
            throw e;
        }
    };

    return (
        <TechnicianContext.Provider value={{
            availableJobs,
            myJobs,
            isLoading,
            isOnline,
            isApproved,
            isRegistered,
            walletBalance,
            profile,
            updateProfile,
            submitRegistration,
            toggleOnline,
            acceptJob,
            cancelJob,
            markArrived,
            sendQuote,
            updateJobStatus,
            sendBill,
            refreshJobs: loadJobs,
            completeJob,
            partsInventory,
            addPart,
            updatePart,
            deletePart,
            businessCart,
            addToBusinessCart,
            updateBusinessCartQuantity,
            clearBusinessCart,
            requestParts,
            addRepairDetails,
            getVehicleHistory,
            requestProduct,
            updateRequirementStatus,
            uploadFile: technicianService.uploadFile,
            requestWithdrawal: async (amount, bankAccountId) => {
                await technicianService.requestWithdrawal(amount, bankAccountId);
                // Refresh profile to update balance
                await loadJobs(false, true);
            },
            getWallet: async () => {
                return await technicianService.getWallet();
            },
            respondToPartRequest,
            refresh: async () => await loadJobs(false, false)
        }}>
            {children}
        </TechnicianContext.Provider>
    );
}
