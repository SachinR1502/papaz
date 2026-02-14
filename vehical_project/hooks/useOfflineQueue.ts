import { offlineQueue, QueuedRequest } from '@/utils/offlineQueue';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to monitor offline queue status
 */
export function useOfflineQueue() {
    const [queue, setQueue] = useState<QueuedRequest[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Subscribe to queue changes
        const unsubscribe = offlineQueue.subscribe(setQueue);

        // Subscribe to network changes
        const netInfoUnsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? false);
        });

        // Initial queue state
        setQueue(offlineQueue.getQueue());

        return () => {
            unsubscribe();
            netInfoUnsubscribe();
        };
    }, []);

    const processQueue = useCallback(async () => {
        setIsProcessing(true);
        try {
            await offlineQueue.processQueue();
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const clearQueue = useCallback(async () => {
        await offlineQueue.clear();
    }, []);

    const removeRequest = useCallback(async (requestId: string) => {
        await offlineQueue.remove(requestId);
    }, []);

    return {
        queue,
        queueSize: queue.length,
        isOnline,
        isProcessing,
        processQueue,
        clearQueue,
        removeRequest,
        hasQueuedRequests: queue.length > 0,
    };
}

/**
 * Hook to check network status
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [networkType, setNetworkType] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? false);
            setNetworkType(state.type);
        });

        // Get initial state
        NetInfo.fetch().then(state => {
            setIsOnline(state.isConnected ?? false);
            setNetworkType(state.type);
        });

        return unsubscribe;
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
        networkType,
    };
}
