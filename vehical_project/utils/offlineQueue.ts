import api from '@/services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_STORAGE_KEY = '@offline_queue';
const MAX_RETRIES = 3;

export interface QueuedRequest {
    id: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
    timestamp: number;
    retries: number;
    priority: 'high' | 'normal' | 'low';
}

class OfflineQueue {
    private queue: QueuedRequest[] = [];
    private isProcessing = false;
    private listeners: Set<(queue: QueuedRequest[]) => void> = new Set();

    constructor() {
        this.loadQueue();
        this.setupNetworkListener();
    }

    /**
     * Load queue from storage
     */
    private async loadQueue() {
        try {
            const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
                console.log('[OfflineQueue] Loaded queue:', this.queue.length, 'items');
            }
        } catch (error) {
            console.error('[OfflineQueue] Failed to load queue:', error);
        }
    }

    /**
     * Save queue to storage
     */
    private async saveQueue() {
        try {
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('[OfflineQueue] Failed to save queue:', error);
        }
    }

    /**
     * Setup network listener to process queue when online
     */
    private setupNetworkListener() {
        NetInfo.addEventListener(state => {
            if (state.isConnected && this.queue.length > 0) {
                console.log('[OfflineQueue] Network connected, processing queue');
                this.processQueue();
            }
        });
    }

    /**
     * Add request to queue
     */
    async add(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) {
        const queuedRequest: QueuedRequest = {
            ...request,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retries: 0,
        };

        this.queue.push(queuedRequest);

        // Sort by priority
        this.queue.sort((a, b) => {
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        await this.saveQueue();
        this.notifyListeners();

        console.log('[OfflineQueue] Added request:', queuedRequest.id, queuedRequest.method, queuedRequest.url);

        // Try to process immediately if online
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
            this.processQueue();
        }
    }

    /**
     * Process all queued requests
     */
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log('[OfflineQueue] Processing queue:', this.queue.length, 'items');

        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            console.log('[OfflineQueue] No network connection, stopping');
            this.isProcessing = false;
            return;
        }

        const toProcess = [...this.queue];

        for (const request of toProcess) {
            try {
                await this.executeRequest(request);

                // Remove from queue on success
                this.queue = this.queue.filter(r => r.id !== request.id);
                await this.saveQueue();
                this.notifyListeners();

                console.log('[OfflineQueue] Successfully processed:', request.id);
            } catch (error) {
                console.error('[OfflineQueue] Failed to process:', request.id, error);

                // Increment retry count
                const index = this.queue.findIndex(r => r.id === request.id);
                if (index !== -1) {
                    this.queue[index].retries += 1;

                    // Remove if max retries reached
                    if (this.queue[index].retries >= MAX_RETRIES) {
                        console.log('[OfflineQueue] Max retries reached, removing:', request.id);
                        this.queue.splice(index, 1);
                    }

                    await this.saveQueue();
                    this.notifyListeners();
                }
            }
        }

        this.isProcessing = false;
        console.log('[OfflineQueue] Processing complete. Remaining:', this.queue.length);
    }

    /**
     * Execute a single request
     */
    private async executeRequest(request: QueuedRequest) {
        const { method, url, data, headers } = request;

        switch (method) {
            case 'GET':
                return await api.get(url, { headers });
            case 'POST':
                return await api.post(url, data, { headers });
            case 'PUT':
                return await api.put(url, data, { headers });
            case 'PATCH':
                return await api.patch(url, data, { headers });
            case 'DELETE':
                return await api.delete(url, { headers });
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }

    /**
     * Get current queue
     */
    getQueue(): QueuedRequest[] {
        return [...this.queue];
    }

    /**
     * Clear entire queue
     */
    async clear() {
        this.queue = [];
        await this.saveQueue();
        this.notifyListeners();
        console.log('[OfflineQueue] Queue cleared');
    }

    /**
     * Remove specific request from queue
     */
    async remove(requestId: string) {
        this.queue = this.queue.filter(r => r.id !== requestId);
        await this.saveQueue();
        this.notifyListeners();
        console.log('[OfflineQueue] Removed request:', requestId);
    }

    /**
     * Subscribe to queue changes
     */
    subscribe(listener: (queue: QueuedRequest[]) => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners
     */
    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.getQueue()));
    }

    /**
     * Get queue size
     */
    size(): number {
        return this.queue.length;
    }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

/**
 * Helper to queue a request when offline
 */
export async function queueRequest(
    method: QueuedRequest['method'],
    url: string,
    data?: any,
    priority: QueuedRequest['priority'] = 'normal'
) {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
        await offlineQueue.add({
            method,
            url,
            data,
            priority,
        });
        return { queued: true };
    }

    // If online, execute immediately
    return { queued: false };
}
