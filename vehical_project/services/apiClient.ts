import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AWS_API_URL = 'http://16.170.108.222:8080/api';

// Use AWS URL as primary, fallback to env if exists (but user wants AWS)
const API_URL = process.env.EXPO_PUBLIC_API_URL || AWS_API_URL;

// ==================== CACHING LAYER ====================
interface CacheEntry {
    data: any;
    timestamp: number;
}

class RequestCache {
    private cache = new Map<string, CacheEntry>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    set(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }

    invalidate(pattern: string): void {
        const keys = Array.from(this.cache.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        });
    }
}

const requestCache = new RequestCache();

// ==================== REQUEST DEDUPLICATION ====================
const pendingRequests = new Map<string, Promise<any>>();

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Accept': 'application/json',
    },
});

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
    async (config) => {
        // Add auth token
        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('userToken');
        } else {
            token = await SecureStore.getItemAsync('userToken');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Check cache for GET requests
        if (config.method === 'get') {
            const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
            const cachedData = requestCache.get(cacheKey);

            if (cachedData) {
                console.log('[Cache] Hit:', cacheKey);
                // Return cached response
                config.adapter = () =>
                    Promise.resolve({
                        data: cachedData,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                    } as AxiosResponse);
            }

            // Check for pending duplicate requests
            if (pendingRequests.has(cacheKey)) {
                console.log('[Dedup] Reusing pending request:', cacheKey);
                config.adapter = () => pendingRequests.get(cacheKey)!;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
    (response) => {
        // Cache GET responses
        if (response.config.method === 'get') {
            const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
            requestCache.set(cacheKey, response.data);
            pendingRequests.delete(cacheKey);
        }

        // Unwrap API response if needed
        if (
            response.data &&
            response.data.success === true &&
            response.data.data !== undefined
        ) {
            console.log('[API] Unwrapping response data');
            return {
                ...response,
                data: response.data.data,
            };
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // ==================== RETRY LOGIC ====================
        if (!originalRequest._retry) {
            originalRequest._retry = 0;
        }

        const maxRetries = 3;
        const shouldRetry =
            originalRequest._retry < maxRetries &&
            (!error.response || error.response.status >= 500);

        if (shouldRetry) {
            originalRequest._retry += 1;

            // Exponential backoff: 1s, 2s, 4s
            const delay = 1000 * Math.pow(2, originalRequest._retry - 1);
            console.log(`[Retry] Attempt ${originalRequest._retry}/${maxRetries} after ${delay}ms`);

            await new Promise((resolve) => setTimeout(resolve, delay));
            return api(originalRequest);
        }

        // ==================== ERROR LOGGING ====================
        if (error.response) {
            console.log('[API Error] Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('[API Error] No Response (Network Error). Message:', error.message);
            console.log('[API Error] Failed Request:', {
                url: originalRequest.url,
                method: originalRequest.method,
                timeout: originalRequest.timeout
            });
        } else {
            console.log('[API Error] Client/Configuration Error:', error.message);
        }

        // Clean up pending requests
        if (originalRequest.method === 'get') {
            const cacheKey = `${originalRequest.url}${JSON.stringify(originalRequest.params || {})}`;
            pendingRequests.delete(cacheKey);
        }

        return Promise.reject(error);
    }
);

// ==================== CACHE UTILITIES ====================
export const clearCache = () => {
    requestCache.clear();
    console.log('[Cache] Cleared all cached data');
};

export const invalidateCache = (pattern: string) => {
    requestCache.invalidate(pattern);
    console.log('[Cache] Invalidated pattern:', pattern);
};

// Invalidate cache on mutations
const invalidateCacheOnMutation = (config: AxiosRequestConfig) => {
    if (config.method !== 'get' && config.url) {
        const url = config.url.toLowerCase();
        if (url.includes('upload') || url.includes('/files/') || url.includes('image') || url.includes('audio')) return;

        const urlParts = config.url.split('/').filter(p => p && p !== 'api');
        let resource = urlParts[0];

        if (['technician', 'customer', 'supplier', 'admin'].includes(resource)) {
            resource = urlParts[1];
        }

        if (resource && resource.length > 1) {
            invalidateCache(resource);
        }
    }
};

// Add mutation interceptor
api.interceptors.response.use(
    (response) => {
        invalidateCacheOnMutation(response.config);
        return response;
    },
    (error) => {
        if (error.config) {
            invalidateCacheOnMutation(error.config);
        }
        return Promise.reject(error);
    }
);

export default api;
