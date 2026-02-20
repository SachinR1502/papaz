import axios from 'axios';

// Use environment variable or default to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

const apiClient = axios.create({
    baseURL: API_URL,
    // Removing global Content-Type to allow Axios to detect 
    // the correct type based on request body (JSON vs FormData)
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to unwrap backend ApiResponse
apiClient.interceptors.response.use(
    (response) => {
        // If the response matches our standard backend wrapper, unwrap the data
        if (response.data && response.data.success === true && response.data.hasOwnProperty('data')) {
            return {
                ...response,
                data: response.data.data
            };
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
