/**
 * Optimistic Update Utilities
 * Provides helpers for implementing optimistic UI updates
 */

export interface OptimisticUpdate<T> {
    id: string;
    type: 'create' | 'update' | 'delete';
    data: T;
    timestamp: number;
    rollback?: () => void;
}

export interface OptimisticState<T> {
    items: T[];
    pendingUpdates: Map<string, OptimisticUpdate<T>>;
}

/**
 * Apply an optimistic update to a list of items
 */
export function applyOptimisticUpdate<T extends { id: string }>(
    items: T[],
    update: OptimisticUpdate<T>
): T[] {
    switch (update.type) {
        case 'create':
            // Add new item to the beginning
            return [update.data, ...items];

        case 'update':
            // Update existing item
            return items.map(item =>
                item.id === update.data.id ? { ...item, ...update.data } : item
            );

        case 'delete':
            // Remove item
            return items.filter(item => item.id !== update.data.id);

        default:
            return items;
    }
}

/**
 * Rollback an optimistic update
 */
export function rollbackOptimisticUpdate<T extends { id: string }>(
    items: T[],
    update: OptimisticUpdate<T>,
    originalData?: T
): T[] {
    switch (update.type) {
        case 'create':
            // Remove the optimistically added item
            return items.filter(item => item.id !== update.data.id);

        case 'update':
            // Restore original data
            if (originalData) {
                return items.map(item =>
                    item.id === update.data.id ? originalData : item
                );
            }
            return items;

        case 'delete':
            // Restore the deleted item
            if (originalData) {
                return [...items, originalData];
            }
            return items;

        default:
            return items;
    }
}

/**
 * Generate a temporary ID for optimistic updates
 */
export function generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an ID is a temporary optimistic ID
 */
export function isTempId(id: string): boolean {
    return id.startsWith('temp_');
}

/**
 * Merge optimistic updates with server data
 */
export function mergeWithServerData<T extends { id: string }>(
    optimisticItems: T[],
    serverItems: T[],
    pendingUpdates: Map<string, OptimisticUpdate<T>>
): T[] {
    // Start with server data
    let merged = [...serverItems];

    // Apply pending optimistic updates
    pendingUpdates.forEach(update => {
        merged = applyOptimisticUpdate(merged, update);
    });

    return merged;
}

/**
 * Create an optimistic update object
 */
export function createOptimisticUpdate<T>(
    type: 'create' | 'update' | 'delete',
    data: T,
    id?: string
): OptimisticUpdate<T> {
    return {
        id: id || generateTempId(),
        type,
        data,
        timestamp: Date.now(),
    };
}

/**
 * Optimistic update for job acceptance
 */
export function optimisticAcceptJob(job: any) {
    return {
        ...job,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        _optimistic: true,
    };
}

/**
 * Optimistic update for job status change
 */
export function optimisticUpdateJobStatus(job: any, newStatus: string) {
    return {
        ...job,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        _optimistic: true,
    };
}

/**
 * Optimistic update for inventory item
 */
export function optimisticUpdateInventory(item: any, updates: Partial<any>) {
    return {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
        _optimistic: true,
    };
}

/**
 * Optimistic update for vehicle addition
 */
export function optimisticAddVehicle(vehicleData: any) {
    return {
        ...vehicleData,
        id: generateTempId(),
        createdAt: new Date().toISOString(),
        _optimistic: true,
    };
}

/**
 * Optimistic update for quote approval
 */
export function optimisticApproveQuote(job: any) {
    return {
        ...job,
        status: 'quote_approved',
        quote: {
            ...job.quote,
            status: 'approved',
            approvedAt: new Date().toISOString(),
        },
        _optimistic: true,
    };
}

/**
 * Optimistic update for bill approval
 */
export function optimisticApproveBill(job: any, paymentMethod: string) {
    return {
        ...job,
        status: 'completed',
        bill: {
            ...job.bill,
            status: 'paid',
            paidAt: new Date().toISOString(),
            paymentMethod,
        },
        _optimistic: true,
    };
}
