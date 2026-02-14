import api from '@/services/apiClient';
import { useCallback, useEffect, useState } from 'react';

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface UsePaginationOptions {
    initialPage?: number;
    limit?: number;
    enabled?: boolean;
}

/**
 * Hook for paginated data fetching with infinite scroll support
 */
export function usePagination<T>(
    endpoint: string,
    options: UsePaginationOptions = {}
) {
    const {
        initialPage = 1,
        limit = 20,
        enabled = true,
    } = options;

    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    const fetchPage = useCallback(
        async (pageNum: number, append = false) => {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            try {
                const response = await api.get(endpoint, {
                    params: {
                        page: pageNum,
                        limit,
                    },
                });

                const newData = response.data.data || response.data;
                const pagination = response.data.pagination;

                if (append) {
                    setData(prev => [...prev, ...newData]);
                } else {
                    setData(newData);
                }

                if (pagination) {
                    setMeta(pagination);
                }

                setPage(pageNum);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch data');
                setError(error);
                console.error('[usePagination] Error:', error);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [endpoint, limit]
    );

    const loadMore = useCallback(() => {
        if (meta?.hasNext && !isLoadingMore) {
            fetchPage(page + 1, true);
        }
    }, [meta, page, isLoadingMore, fetchPage]);

    const refresh = useCallback(() => {
        setData([]);
        setPage(initialPage);
        fetchPage(initialPage, false);
    }, [initialPage, fetchPage]);

    const reset = useCallback(() => {
        setData([]);
        setPage(initialPage);
        setMeta(null);
        setError(null);
    }, [initialPage]);

    useEffect(() => {
        if (enabled) {
            fetchPage(initialPage, false);
        }
    }, [enabled, endpoint]);

    return {
        data,
        isLoading,
        isLoadingMore,
        error,
        meta,
        page,
        loadMore,
        refresh,
        reset,
        hasMore: meta?.hasNext ?? false,
        canLoadMore: (meta?.hasNext ?? false) && !isLoadingMore,
    };
}

/**
 * Hook for cursor-based pagination (alternative to page-based)
 */
export function useCursorPagination<T>(
    endpoint: string,
    options: { limit?: number; enabled?: boolean } = {}
) {
    const { limit = 20, enabled = true } = options;

    const [data, setData] = useState<T[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchData = useCallback(
        async (nextCursor: string | null = null, append = false) => {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            try {
                const params: any = { limit };
                if (nextCursor) {
                    params.cursor = nextCursor;
                }

                const response = await api.get(endpoint, { params });

                const newData = response.data.data || response.data;
                const nextCursorValue = response.data.nextCursor;

                if (append) {
                    setData(prev => [...prev, ...newData]);
                } else {
                    setData(newData);
                }

                setCursor(nextCursorValue);
                setHasMore(!!nextCursorValue);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch data');
                setError(error);
                console.error('[useCursorPagination] Error:', error);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [endpoint, limit]
    );

    const loadMore = useCallback(() => {
        if (hasMore && !isLoadingMore && cursor) {
            fetchData(cursor, true);
        }
    }, [hasMore, isLoadingMore, cursor, fetchData]);

    const refresh = useCallback(() => {
        setData([]);
        setCursor(null);
        fetchData(null, false);
    }, [fetchData]);

    useEffect(() => {
        if (enabled) {
            fetchData(null, false);
        }
    }, [enabled, endpoint]);

    return {
        data,
        isLoading,
        isLoadingMore,
        error,
        loadMore,
        refresh,
        hasMore,
        canLoadMore: hasMore && !isLoadingMore,
    };
}
