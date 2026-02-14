import { OptimisticUpdate, applyOptimisticUpdate, rollbackOptimisticUpdate } from '@/utils/optimisticUpdates';
import { useCallback, useRef, useState } from 'react';

interface UseOptimisticMutationOptions<T, TData> {
    onMutate?: (data: TData) => T | void;
    onSuccess?: (result: any, data: TData) => void;
    onError?: (error: Error, data: TData) => void;
    onSettled?: () => void;
}

/**
 * Hook for optimistic mutations with automatic rollback on error
 */
export function useOptimisticMutation<T extends { id: string }, TData = Partial<T>>(
    mutationFn: (data: TData) => Promise<any>,
    options: UseOptimisticMutationOptions<T, TData> = {}
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const rollbackRef = useRef<(() => void) | null>(null);

    const mutate = useCallback(
        async (data: TData) => {
            setIsLoading(true);
            setError(null);

            // Store optimistic update for potential rollback
            let optimisticData: T | void;

            try {
                // Apply optimistic update
                if (options.onMutate) {
                    optimisticData = options.onMutate(data);
                }

                // Execute actual mutation
                const result = await mutationFn(data);

                // Success callback
                if (options.onSuccess) {
                    options.onSuccess(result, data);
                }

                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Mutation failed');
                setError(error);

                // Rollback optimistic update
                if (rollbackRef.current) {
                    rollbackRef.current();
                }

                // Error callback
                if (options.onError) {
                    options.onError(error, data);
                }

                throw error;
            } finally {
                setIsLoading(false);

                // Settled callback
                if (options.onSettled) {
                    options.onSettled();
                }
            }
        },
        [mutationFn, options]
    );

    const setRollback = useCallback((rollbackFn: () => void) => {
        rollbackRef.current = rollbackFn;
    }, []);

    return {
        mutate,
        isLoading,
        error,
        setRollback,
    };
}

/**
 * Hook for optimistic list updates
 */
export function useOptimisticList<T extends { id: string }>(initialData: T[] = []) {
    const [items, setItems] = useState<T[]>(initialData);
    const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
    const originalDataRef = useRef<Map<string, T>>(new Map());

    const addOptimisticUpdate = useCallback((update: OptimisticUpdate<T>) => {
        // Store original data for rollback
        if (update.type === 'update' || update.type === 'delete') {
            const original = items.find(item => item.id === update.data.id);
            if (original) {
                originalDataRef.current.set(update.id, original);
            }
        }

        // Apply update
        setItems(current => applyOptimisticUpdate(current, update));
        setPendingUpdates(current => new Map(current).set(update.id, update));
    }, [items]);

    const confirmUpdate = useCallback((updateId: string) => {
        setPendingUpdates(current => {
            const newMap = new Map(current);
            newMap.delete(updateId);
            return newMap;
        });
        originalDataRef.current.delete(updateId);
    }, []);

    const rollbackUpdate = useCallback((updateId: string) => {
        const update = pendingUpdates.get(updateId);
        if (update) {
            const originalData = originalDataRef.current.get(updateId);
            setItems(current => rollbackOptimisticUpdate(current, update, originalData));
            setPendingUpdates(current => {
                const newMap = new Map(current);
                newMap.delete(updateId);
                return newMap;
            });
            originalDataRef.current.delete(updateId);
        }
    }, [pendingUpdates]);

    const setData = useCallback((newData: T[]) => {
        setItems(newData);
    }, []);

    return {
        items,
        setData,
        addOptimisticUpdate,
        confirmUpdate,
        rollbackUpdate,
        hasPendingUpdates: pendingUpdates.size > 0,
    };
}

/**
 * Hook for optimistic single item updates
 */
export function useOptimisticItem<T>(initialData: T | null = null) {
    const [item, setItem] = useState<T | null>(initialData);
    const [isOptimistic, setIsOptimistic] = useState(false);
    const originalDataRef = useRef<T | null>(null);

    const setOptimisticData = useCallback((newData: T) => {
        originalDataRef.current = item;
        setItem(newData);
        setIsOptimistic(true);
    }, [item]);

    const confirmUpdate = useCallback(() => {
        setIsOptimistic(false);
        originalDataRef.current = null;
    }, []);

    const rollback = useCallback(() => {
        if (originalDataRef.current) {
            setItem(originalDataRef.current);
            setIsOptimistic(false);
            originalDataRef.current = null;
        }
    }, []);

    const setData = useCallback((newData: T | null) => {
        setItem(newData);
        setIsOptimistic(false);
    }, []);

    return {
        item,
        setData,
        setOptimisticData,
        confirmUpdate,
        rollback,
        isOptimistic,
    };
}
